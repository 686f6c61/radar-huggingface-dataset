# mindchain/imajev-2b-full-GGUF

## Resumen

Imajev-2B es un modelo de decisión multimodal (pipeline `image-text-to-text`) de aproximadamente 1.880 millones de parámetros, publicado por el usuario `mindchain` como un barrido completo de cuantizaciones en formato GGUF para llama.cpp. El modelo deriva de `Qwen/Qwen3.5-2B` y se distribuye bajo licencia Apache 2.0, con soporte declarado de visión mediante un proyector multimodal (`mmproj`) que debe cargarse por separado.

El repositorio no contiene pesos originales ni una model card de uso general: es un catálogo de artefactos cuantizados construidos para cubrir prácticamente todo el espectro de bits por peso disponible hoy en llama.cpp, desde ternarizaciones agresivas (TQ1_0) hasta cuantizaciones casi sin pérdida (Q8_0), incluyendo la familia IQ con Importance Matrix calibrada de forma específica para la tarea del modelo.

Su relevancia es metodológica más que de rendimiento: el autor declara explícitamente que las 28 (según el título) o 24 (según la tabla de la card) variantes son candidatos construidos, no medidos, y que la evaluación comparativa —perplejidad, readout de decisión contra respuestas de referencia y divergencia distribucional— queda pendiente. Además, el repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-2B; se describe como "decision-model" multimodal, sin detalle de arquitectura en la informacion proporcionada) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B, dato real de safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | K-Quant: Q3_K_S ... Q8_0 (9 niveles); IQ-Quant con i-Matrix: IQ2_XXS ... IQ4_NL (10 niveles); ternarizacion: TQ2_0, TQ1_0 (2 niveles); Unsloth: IQ1_XXXS, IQ1_XXS, IQ1_XS (3 niveles). Excluye Q4_0, Q5_0, Q5_1, Q2_K y Q2_K_S |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), mas un proyector multimodal `mmproj-f16.gguf` |
| Repositorio | `mindchain/imajev-2b-full-GGUF` |
| Tamano del repo | 26,6 GB |
| Libreria | gguf |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-2B |
| Fecha de creacion | 2026-10-04 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo: solo se indica que deriva de `Qwen/Qwen3.5-2B` y que se trata de un "decision-model" multimodal con capacidad de entrada de imagen (`image-text-to-text`). No se especifican numero de capas, dimension oculta, mecanismo de atencion, ni si emplea atencion lineal, decodificacion especulativa o alguna innovacion concreta. Tampoco se documenta el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento).

Lo que si esta documentado es el **proceso de cuantizacion**, que constituye el nucleo tecnico del repositorio. Las variantes IQ se construyeron con una Importance Matrix derivada de un conjunto de calibracion especifico de la tarea: 15 buckets de temperatura definidos en `calibration.json`, con 3 tipos de pregunta por 5 conjuntos de opciones. El autor senala que cambiar el conjunto de calibracion modifica que pesos quedan protegidos y altera el orden de calidad entre niveles. La unica verificacion automatica aplicada fue `gate_quantized()`, que comprueba que cada archivo es entre un 47 % y un 85 % mas pequeno que su fuente f16; este control detecta cuantizaciones que no se aplicaron realmente, pero no aporta ninguna garantia sobre calidad, perplejidad o fidelidad funcional.

Se excluyeron deliberadamente `Q4_0`, `Q5_0` y `Q5_1` (considerados legacy y peores por bit que los K-Quants), asi como `Q2_K` y `Q2_K_S` (penalizacion declarada de +3,5 PPL en llama.cpp y, segun el autor, incapaces de producir letras de opcion). La lookup table no se genera en este build porque la herramienta no la deposita.

## Capacidades

- **Clasificacion / decision multimodal**: el modelo esta etiquetado como `decision-model`; el conjunto de calibracion se describe con tipos de pregunta y conjuntos de opciones, lo que sugiere un uso de seleccion entre alternativas (tipo multiple-choice) sobre texto e imagen.
- **Entrada de imagen**: pipeline `image-text-to-text`. Requiere cargar simultaneamente el archivo de pesos y el proyector `mmproj-f16.gguf` mediante `--mmproj`. Sin el proyector, el servidor responde `image input is not supported` aunque el modelo cargue.
- **Inferencia local en llama.cpp**: todos los artefactos estan en GGUF y son ejecutables con llama.cpp y servidores compatibles.
- **Tool calling / function calling**: no disponible en la informacion proporcionada.
- **Soporte de agentes y razonamiento multi-paso**: no disponible en la informacion proporcionada.
- **Capacidades multilingues**: no disponible; no se declara lista de idiomas.
- **Modo thinking / audio**: no disponible; no se menciona ningun modo de razonamiento explicito ni entrada de audio.

## Casos de uso

- **Clasificacion visual con opciones cerradas**: dado que el conjunto de calibracion se define con "3 tipos de pregunta x 5 conjuntos de opciones", el uso natural es la seleccion de una respuesta entre un conjunto discreto a partir de una imagen y un enunciado. La variante Q4_K_M o IQ4_XS seria suficiente para prototipado.
- **Despliegue en edge con VRAM minima**: las variantes ternarias (TQ1_0, TQ2_0) y la familia Unsloth IQ1_XXXS/XXS/XS colocan el modelo en rangos por debajo de 0,5 GB, lo que permite ejecutarlo en dispositivos con memoria muy limitada o en CPU. El autor advierte que son candidatos sin medicion de calidad.
- **Evaluacion comparativa de tecnicas de cuantizacion**: el repositorio esta disenado como banco de pruebas para medir el impacto de K-Quant frente a IQ-Quant con Importance Matrix frente a ternarizacion, manteniendo constante el modelo base y variando solo el esquema de bits.
- **Investigacion sobre calibracion de i-Matrix**: al documentarse el calibrador exacto (15 buckets, 3x5 tipos), permite reproducir y experimentar con conjuntos de calibracion alternativos y observar como cambia la proteccion de pesos.
- **Servicio multimodal autoalojado con llama.cpp**: montando el par pesos + `mmproj-f16.gguf` detras de `llama-server`, se puede exponer un endpoint de imagen-texto en infraestructura propia sin dependencia de APIs externas.
- **Referencia de fidelidad en pipelines de cuantizacion**: la propia card recomienda usar Q8_0 como referencia. En un pipeline interno, Q8_0 puede actuar como linea base contra la que medir la degradacion de las variantes de 4 bits e inferiores.
- **Fine-tuning posterior sobre un checkpoint pequeno**: con 1,88 B de parametros y licencia Apache 2.0, el modelo base es un candidato razonable para ajuste especifico de dominio en una unica GPU, aunque el repositorio distribuido contiene solo pesos cuantizados, no el checkpoint en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que **no** se han medido perplejidad, readout de decision contra respuestas de referencia, ni divergencia distribucional frente a la referencia sin cuantizar. La unica verificacion realizada es la reduccion de tamano de archivo (entre −47 % y −85 % respecto a la fuente f16). No se dispone de datos de MMLU, HumanEval, GSM8K ni de ningun benchmark multimodal. Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

Los siguientes valores de VRAM son **estimaciones derivadas del recuento de parametros (1.881.825.088) y de los bits por peso tipicos de cada esquema**; el autor no publica cifras de memoria ni latencia.

| Cuantizacion | Bits/peso aprox. | VRAM estimada solo pesos |
|---|---|---|
| IQ1_XXXS | ~1,6 | ~0,4 GB |
| TQ1_0 | ~1,7 | ~0,4 GB |
| IQ2_XXS | ~2,1 | ~0,5 GB |
| Q3_K_S | ~3,5 | ~0,8 GB |
| IQ4_XS | ~4,25 | ~1,0 GB |
| Q4_K_M (recomendada) | ~4,85 | ~1,2 GB |
| Q8_0 (referencia) | ~8,5 | ~2,0 GB |

- **Proyector de vision**: hay que sumar el espacio de `mmproj-f16.gguf`, que va aparte de los pesos principales. Su tamano no se indica en la informacion proporcionada.
- **Cache KV**: hay que anadir la memoria de contexto, cuyo consumo depende de la longitud de contexto configurada y del numero de capas; no disponible.
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o mas de VRAM puede alojar Q4_K_M; una RTX 3060, RTX 4060 o superior es suficiente. Para Q8_0 con contexto largo, se recomienda 6-8 GB. Las variantes ternarias y IQ1 caben en iGPU o incluso en CPU.
- **CPU**: las variantes de 1-3 bits son viables en CPU con llama.cpp; el rendimiento dependera del ancho de banda de memoria del sistema.
- **Opciones de despliegue**: llama.cpp y `llama-server` (formato nativo del repositorio). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, pero no se detalla. No se mencionan vLLM, TGI, Ollama ni TensorRT-LLM.
- **Latencia y throughput**: no disponible. El autor no publica mediciones de velocidad y advierte que la comparativa de calidad esta pendiente en `haddock-development/quantization`.

## Comparativa con modelos similares

Los resultados de busqueda proporcionados no contienen informacion sobre modelos comparables, por lo que las celdas de rendimiento se dejan como no disponibles. La siguiente tabla recoge unicamente los datos que constan en la ficha o en el propio repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| Imajev-2B full GGUF (este) | 1,88 B | no disponible | apache-2.0 | GGUF (24-28 niveles) | no disponible |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas multimodales de ~2-4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de alternativas equivalentes en la informacion suministrada, por lo que no se puede establecer una comparacion tecnica fiable en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- **Artefactos construidos, no medidos**: la propia model card advierte que cada archivo es un candidato. No hay perplejidad, ni readout de decision, ni comparacion distribucional contra la referencia sin cuantizar. Cualquier uso en produccion exige validacion propia previa.
- **Sin validacion comunitaria**: 0 descargas y 0 likes en el momento de la ficha. No existe evidencia externa de funcionamiento correcto.
- **Discrepancia en el recuento de niveles**: el titulo anuncia "28 Stufen" y la tabla de la card suma 24 niveles entre las cuatro familias listadas. Conviene verificar el contenido real del repositorio antes de asumir una cobertura concreta.
- **Vision requiere dos archivos**: sin `--mmproj` el servidor devuelve `image input is not supported`. Es un error silencioso habitual en despliegues.
- **Cuantizaciones de muy bajos bits**: las variantes TQ1_0, TQ2_0 e IQ1_* no tienen medicion de calidad asociada; su uso en tareas de decision sensibles no esta justificado por ningun dato publicado.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible. En modelos de decision con conjuntos de opciones cerrados, el modo de fallo esperado es la seleccion de una opcion invalida, pero no hay datos que lo confirmen.
- **Idiomas**: no se declara cobertura linguistica. No se puede asumir soporte de castellano.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo deriva de `Qwen/Qwen3.5-2B`, cuyos terminos no se detallan en la informacion proporcionada; conviene verificar la licencia del modelo base antes de explotacion comercial.
- **Sesgos**: no hay evaluacion de sesgos publicada.
- **Fecha de publicacion inusual**: los metadatos indican creacion y actualizacion en octubre de 2026. Conviene confirmar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mindchain/imajev-2b-full-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de la comparativa de cuantizacion: https://github.com/haddock-development/quantization
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo (las paginas devueltas tratan sobre GTA5, gramatica francesa y terminos en frances, sin relacion con el modelo).
