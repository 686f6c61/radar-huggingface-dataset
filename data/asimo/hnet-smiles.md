# Asimo/hnet-smiles

## Resumen

hnet-smiles es una familia de ocho modelos byte-level basados en la arquitectura H-Net, entrenados específicamente sobre representaciones SMILES de moléculas químicas. El autor, Asimo, publica los pesos en Hugging Face bajo licencia MIT. Cada variante comparte una arquitectura de dos etapas (bytes a piezas y piezas a grupos, con stacks de Transformer y un enrutador coseno) y un único corpus de entrenamiento, pero difieren en el objetivo de entrenamiento: predicción del siguiente byte, predicción de huella Morgan de 2.048 bits, regresión de 185 descriptores RDKit o relleno de fragmentos enmascarados.

El modelo resuelve un problema concreto de la química computacional: aprender una tokenización (segmentación) de SMILES que sea coherente con la tarea downstream, en lugar de imponer una segmentación fija. La relevancia actual radica en que demuestra empíricamente cómo el objetivo de entrenamiento condiciona los cortes aprendidos (por ejemplo, el modelo de fragmentos enmascarados respeta los enlaces BRICS con preferencia +0.38, mientras que el de siguiente byte apenas los prefiere con -0.04).

Los modelos son pequeños (entre 19,5M y 32,9M parámetros) y se distribuyen en formato safetensors junto con un `config.json` por carpeta. El repositorio ocupa 0,8 GB y la librería declarada es PyTorch. No se especifican idiomas naturales soportados, ya que el dominio de entrada son cadenas SMILES, no texto en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level de dos etapas (bytes a piezas, piezas a grupos) con stacks Transformer y enrutador coseno |
| Parametros totales | 19.555.520 a 32.901.248 según variante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de bytes con BOS, EOS, PAD y MASK; vocabulario de 260) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio SMILES, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (+ config.json por carpeta) |

Variantes y métricas declaradas por el autor:

| Carpeta | Objetivo | Parámetros | Métrica held-out |
|---|---|---|---|
| `next-byte-30m` | predecir siguiente byte (causal) | 30.342.784 | 0,7681 bits por byte |
| `fingerprint-30m` | predecir huella Morgan 2.048 bits (radio 3) | 32.901.248 | Tanimoto 0,831 |
| `descriptors-30m` | regresión de 185 descriptores RDKit | 30.991.673 | R² 0,998 |
| `masked-fragments-30m` | rellenar bytes enmascarados (25-45%) | 30.342.784 | 92,8% de bytes enmascarados al 35% |
| `next-byte-20m` | predecir siguiente byte | 19.555.520 | 0,7681 bits por byte |
| `fingerprint-20m` | huella Morgan, cabeza lee una posición | 22.245.184 | Tanimoto 0,832 |
| `descriptors-20m` | descriptores, cabeza lee una posición | 20.335.609 | R² 0,998 |
| `masked-fragments-20m` | relleno de fragmentos enmascarados | 19.555.520 | 93,2% de bytes enmascarados al 35% |

## Arquitectura y entrenamiento

La arquitectura es una H-Net byte-level de dos etapas: la primera convierte bytes en piezas y la segunda agrupa piezas en grupos, con stacks de Transformer en las capas externas y un enrutador coseno que decide los cortes. El paper de referencia (Hwang, Wang, Gu, arXiv:2507.07955) emplea Mamba-2 en esas capas externas, pero el autor indica explícitamente que esta implementación usa Transformer en su lugar. La entrada son bytes crudos con símbolos BOS, EOS, PAD y MASK, con un vocabulario de 260.

El entrenamiento se realizó en dos rondas. La ronda de 30M usa anchos 256/384/512, optimizador AdamW y 3 épocas (101.289 pasos). La ronda de 20M usa anchos 256/320/384, optimizador Muon y 5 épocas (168.815 pasos). En la ronda de 30M las cabezas de huella y descriptores leen la media y el máximo sobre bytes; en la de 20M leen una única posición. El corpus son 90.955.563 SMILES canónicos sin estereoquímica: PubChem (89,8M filas), COCONUT, ChEBI, LIPID MAPS y estructuras de librerías espectrales públicas. Se reservaron 50.000 filas como held-out.

La innovación destacable es el análisis de segmentación aprendida: sobre 50.000 moléculas held-out se miden bytes por pieza, número de piezas distintas, porcentaje de átomos multicarácter divididos y preferencia por enlaces BRICS. Los resultados muestran que el objetivo de entrenamiento moldea los cortes: `masked-fragments-30m` produce 4,33 bytes por pieza, 14.928 piezas distintas, solo 0,4% de átomos multicarácter divididos y preferencia BRICS +0,38; en cambio `next-byte-30m` produce 2,75 bytes por pieza, 8.620 piezas distintas, 18% de átomos multicarácter divididos y preferencia BRICS -0,04.

## Capacidades

- Predicción del siguiente byte en cadenas SMILES (variantes `next-byte-*`), con perplejidad expresada como bits por byte (0,7681).
- Predicción de huella Morgan de 2.048 bits con radio 3 a partir de la cadena limpia (variantes `fingerprint-*`), con Tanimoto held-out de 0,831-0,832.
- Regresión de 185 descriptores RDKit (variantes `descriptors-*`), con R² de 0,998.
- Relleno de bytes enmascarados en fragmentos (variantes `masked-fragments-*`), con 92,8-93,2% de acierto al 35% de enmascaramiento.
- Segmentación de SMILES en piezas y grupos, expuesta mediante las marcas `r["b"]` (inicio de pieza) y `r["bg"]` (inicio de grupo).
- Extracción de representación del tronco principal mediante `r["main"]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de lenguaje natural; su dominio es exclusivamente químico y la notación es SMILES canónico sin estereoquímica.

## Casos de uso

- Tokenización química consciente de la tarea: usar `masked-fragments-30m` para segmentar SMILES en fragmentos que respetan enlaces BRICS (preferencia +0,38) y alimentar modelos downstream de química con una tokenización alineada con la estructura molecular.
- Filtrado y deduplicación de librerías: emplear `fingerprint-30m` para generar huellas Morgan de 2.048 bits y calcular similitud Tanimoto (0,831 held-out) sin depender de RDKit en tiempo de inferencia, útil en pipelines de cribado virtual a gran escala.
- Predicción rápida de descriptores: usar `descriptors-30m` para regresar 185 descriptores RDKit con R² 0,998 como aproximación barata en fases de pre-filtrado, reservando RDKit para la validación final.
- Completado de SMILES parciales: `masked-fragments-30m` permite rellenar fragmentos enmascarados (92,8% de acierto al 35%), útil para reconstruir cadenas incompletas en procesos de limpieza de datos o para tareas de infilling en edición molecular.
- Estudio de cómo el objetivo condiciona la representación: comparar las ocho variantes sobre el mismo corpus para analizar empíricamente qué segmentación emerge según la tarea, con métricas cuantitativas de bytes por pieza y preferencia BRICS.
- Modelado de lenguaje químico ligero: `next-byte-30m` (30M parámetros, 0,7681 bits por byte) sirve como modelo base pequeño para generación de SMILES en entornos con recursos limitados o para inicializar modelos mayores.
- Investigación en arquitecturas H-Net: el código y los pesos permiten reproducir y extender el análisis de segmentación aprendida a otros dominios o notaciones químicas.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar de química (por ejemplo, MoleculeNet, MMLU, HumanEval o GSM8K). Los únicos datos disponibles son las métricas held-out internas por variante, ya recogidas en la tabla de especificaciones: bits por byte (0,7681), Tanimoto (0,831-0,832), R² (0,998) y porcentaje de acierto en relleno de bytes enmascarados (92,8-93,2%). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos tienen entre 19,5M y 32,9M parámetros; en fp32 ocupan aproximadamente 78-132 MB de pesos, y en fp16 aproximadamente 39-66 MB. La VRAM real depende del tamaño de lote y de la longitud de las cadenas SMILES.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es tan pequeño que la GPU dedicada no es imprescindible.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el autor solo documenta PyTorch con el código del repositorio `DrHB/hnet-smiles` (`model.load` y `data.encode`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y probablemente no sean aplicables sin adaptación, dado que el modelo no es un LLM de texto estándar.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera inferencia en milisegundos en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no cita alternativas directas de tokenización química ni de H-Nets aplicadas a SMILES. Como referencia arquitectónica, el paper original de H-Net (Hwang, Wang, Gu, arXiv:2507.07955) usa Mamba-2 en las capas externas, mientras que esta implementación usa Transformer, pero no se ofrecen métricas comparativas entre ambas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hnet-smiles (esta ficha) | 19,5M-32,9M | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelos pequeños: el mayor tiene 32,9M parámetros, lo que limita su capacidad de generalización frente a modelos químicos de mayor escala.
- Una sola notación: entrenados únicamente sobre SMILES canónicos sin estereoquímica; no cubren InChI, SDF ni SMILES con estereoquímica.
- Arquitectura divergente del paper: usan Transformer en las capas externas donde el paper original emplea Mamba-2, por lo que los resultados no son directamente comparables con los del artículo.
- Fuga de datos en la evaluación: el autor advierte que las moléculas de benchmark no se eliminaron del preentrenamiento, aunque ninguna etiqueta de benchmark estaba en el corpus. Las métricas held-out deben interpretarse con cautela.
- Riesgo de alucinación: en las variantes generativas (`next-byte-*` y `masked-fragments-*`) el modelo puede producir SMILES sintácticamente válidos pero químicamente inválidos; no hay validación integrada.
- Sin soporte de lenguaje natural: no es un modelo conversacional ni multilingüe; no admite tool calling ni agentes.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones optimizadas para despliegue en CPU o edge.
- Documentación mínima: no se especifican longitudes de contexto máximas ni límites de longitud de cadena SMILES.

## Enlaces

- Hugging Face: https://huggingface.co/Asimo/hnet-smiles
- Repositorio de código: https://github.com/DrHB/hnet-smiles
- Post del autor: https://drhb.github.io/blogposts/posts/learned-cuts/
- Paper H-Net: https://arxiv.org/abs/2507.07955
