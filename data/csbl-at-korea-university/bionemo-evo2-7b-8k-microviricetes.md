# CSBL-at-Korea-University/bionemo-evo2-7b-8k-microviricetes

## Resumen

El modelo `bionemo-evo2-7b-8k-microviricetes` es un derivado de la familia Evo 2, publicada por el equipo de BioNeMo (NVIDIA) para el modelado de secuencias genomicas. El autor del repositorio es el grupo CSBL de la Korea University, que lo distribuye bajo licencia Apache 2.0. La nomenclatura indica que se trata de un modelo de aproximadamente 7.000 millones de parametros con una ventana de contexto de 8.000 tokens, aparentemente ajustado o especializado en microviricetes (un grupo de bacteriofagos pequenos de la familia Microviridae).

El modelo resuelve el problema del modelado de lenguaje sobre secuencias de ADN, es decir, la prediccion de nucleotidos y la representacion densa de fragmentos genomicos para tareas downstream como anotacion, clasificacion taxonomica o generacion de secuencias. Su relevancia actual radica en la aplicacion de arquitecturas transformer a gran escala sobre alfabetos biologicos, un area donde los modelos de lenguaje generalistas rinden mal por la distribucion radicalmente distinta de los datos.

La model card publicada es practicamente vacia: solo declara la licencia Apache 2.0 y no aporta informacion sobre arquitectura interna, datos de entrenamiento, tokenizador ni evaluaciones. Todo lo que se detalla a continuacion se infiere del nombre del modelo y del linaje Evo 2, y se marca explicitamente como no disponible cuando no hay confirmacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, linaje Evo 2) |
| Parametros totales | no disponible (el nombre indica 7B) |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible (el nombre indica 8k tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias genomicas, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. Por el linaje Evo 2 se espera un transformer decoder-only entrenado con modelado de lenguaje autorregresivo sobre nucleotidos, con tokenizacion a nivel de base o de k-mer y atencion de contexto largo. El sufijo `8k` sugiere una ventana de 8.000 tokens, coherente con el entrenamiento de Evo 2 en longitudes de contexto progresivamente mayores.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion taxonomica del dataset ni si hubo fases de ajuste fino supervisado o preferencias. El sufijo `microviricetes` apunta a un ajuste o filtrado del corpus hacia genomas de microviricetes, pero no se especifica el procedimiento. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, StripedHyena) seria especulativa y no se sostiene con la informacion disponible.

## Capacidades

- Modelado de secuencias de ADN a nivel de nucleotido, con probabilidad por posicion.
- Generacion autorregresiva de fragmentos genomicos condicionada a un prefijo.
- Extraccion de representaciones densas (embeddings) de fragmentos genomicos para tareas downstream.
- Puntuacion de verosimilitud de secuencias, util para filtrado y ranking de variantes.
- Especializacion presumible en genomas de microviricetes (bacteriofagos de ADN circular monocatenario).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica; no es un modelo de lenguaje natural.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Anotacion de genomas de microviricetes: puntuar marcos abiertos de lectura y regiones intergenicas con la verosimilitud del modelo para priorizar candidatos a genes, aprovechando la especializacion del ajuste en este grupo viral.
- Deteccion de contaminacion en ensamblados metagenomicos: comparar la verosimilitud de contigs frente al modelo especializado y frente a un modelo generalista para separar secuencias de microviricetes del ruido restante.
- Clasificacion taxonomica de bacteriofagos: usar los embeddings de la capa oculta como features en un clasificador ligero para asignar familias o generos a contigs cortos.
- Diseno de cebadores y sondas: generar variantes de secuencia conservadas y puntuar su plausibilidad biologica con el modelo antes de validacion in vitro.
- Estudio de variabilidad genomica: calcular la perplejidad de variantes puntuales para identificar posiciones bajo presion selectiva o regiones funcionalmente restringidas.
- Filtrado de candidatos en pipelines de descubrimiento de fagos: integrar el modelo como etapa de scoring en un pipeline que procese miles de contigs y descarte secuencias improbables antes del analisis manual.
- Generacion de secuencias sinteticas para aumento de datos: muestrear secuencias verosimiles para entrenar clasificadores cuando el conjunto real de microviricetes es escaso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 14-16 GB para un modelo de 7B, mas el overhead de activaciones y cache KV segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB. Son estimaciones por tamano, no confirmadas para este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 8k sin cuantizar y batches grandes; RTX 4090 (24 GB) para FP16 con batch pequeno; RTX 3090/4080 para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizacion o en 24 GB en precision media.
- Opciones de despliegue: vLLM o TGI para serving con PagedAttention; llama.cpp u Ollama si se dispone de conversion a GGUF; Hugging Face `transformers` para inferencia de referencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bionemo-evo2-7b-8k-microviricetes | ~7B (segun nombre) | 8k (segun nombre) | Microviricetes | Apache 2.0 | Hugging Face |
| Evo 2 (familia base, NVIDIA BioNeMo) | multiple | multiple | Genomica general | no disponible en esta ficha | Hugging Face / BioNeMo |
| Nucleotide Transformer | 500M-2.5B | 1k-12k | Genomica general | no disponible en esta ficha | Hugging Face |
| DNABERT-2 | ~117M | 512 | Genomica general | no disponible en esta ficha | Hugging Face |

La comparacion con las alternativas se basa en caracteristicas publicas de esas familias y no en evaluaciones directas contra este checkpoint, para el que no hay resultados. La ventaja diferencial de este modelo es la especializacion en microviricetes; su desventaja es la ausencia total de documentacion y de validacion publicada.

## Limitaciones y advertencias

- La model card no documenta arquitectura, datos ni evaluaciones; no es posible verificar ninguna afirmacion sobre su rendimiento.
- Riesgo de alucinacion biologica: como modelo generativo, puede producir secuencias sintacticamente plausibles pero no funcionales; toda salida requiere validacion experimental.
- Sesgo de dominio: el ajuste en microviricetes puede degradar el rendimiento en genomas bacterianos, eucariotas o virales de mayor tamano.
- Sesgo de composicion: si el corpus de ajuste esta sesgado hacia ciertos generos o regiones geograficas, las predicciones heredaran ese sesgo.
- Limitacion de contexto: 8k tokens cubren solo una fraccion de genomas mayores; los contigs largos requieren fragmentacion con perdida de dependencias lejanas.
- Licencia Apache 2.0 permite uso comercial, pero no exime de las obligaciones de atribucion ni de las posibles restricciones de las licencias de los datos de entrenamiento originales, que no se detallan.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion independiente; tratarlo como experimental.
- Ausencia de tokenizador o instrucciones de uso documentadas: la integracion en produccion exige ingenieria inversa del preprocesado.

## Enlaces

- Hugging Face: https://huggingface.co/CSBL-at-Korea-University/bionemo-evo2-7b-8k-microviricetes
- Repositorio BioNeMo de NVIDIA: no disponible en la informacion proporcionada
- Paper de Evo 2: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
