# ReadyArt/EXL25-Measurements

## Resumen

ReadyArt/EXL25-Measurements es un repositorio de artefactos auxiliares para el formato de cuantizacion EXL2.5, una evolucion del formato EXL2 de ExLlamaV2 desarrollada por el usuario ReadyArt. No se trata de un modelo de lenguaje entrenado, sino de un conjunto de medidas (measurements) precalculadas que otros usuarios pueden reutilizar al generar sus propias cuantizaciones, evitando tener que recalcular las metricas de calibracion por tensor.

El repositorio esta vinculado a dos forks especificos de herramientas de inferencia: exllamav2-Fork y tabbyAPI-Fork, ambos mantenidos por el mismo autor. Segun la model card, las medidas no funcionan con la build estandar de ExLlamaV2, lo que implica que su uso esta restringido al ecosistema de estos forks.

La relevancia es acotada: interesa a quienes cuantizan modelos en formato EXL2 y quieren aprovechar las mejoras de calidad y velocidad introducidas en EXL2.5 (rotacion de Hadamard, proteccion de canales AWQ y redondeo guiado por Hessiano al mismo bits-per-weight). No hay informacion publica sobre arquitectura, parametros ni contexto, porque el artefacto no es un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un artefacto de medidas para cuantizacion EXL2.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL2.5 (contenedor de fichero EXL2 con mejoras opcionales por tensor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene medidas, no pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado. EXL2.5 se describe en la model card como un formato de cuantizacion de siguiente generacion dentro del fork de ExLlamaV2, que mantiene el contenedor de fichero de EXL2 y anade mejoras opcionales por tensor en dos ejes. En el eje de velocidad incorpora un GEMM fast-path sin ramas optimizado para Ampere y RTX 3090, con un limite de 16 filas para que la verificacion MTP con batch 4 lea los pesos una sola vez. En el eje de calidad aplica rotacion de incoherencia de Hadamard, proteccion de canales AWQ y redondeo guiado por Hessiano manteniendo el mismo bits-per-weight.

La compatibilidad hacia atras esta declarada: los modelos EXL2 estandar siguen cargandose y ejecutandose igual que antes. No se especifican en la informacion disponible el volumen de datos de calibracion, la composicion del dataset ni procesos de RLHF o DPO, ya que no hay entrenamiento de un modelo generativo implicado.

## Capacidades

- Proporcionar medidas precalculadas reutilizables para generar cuantizaciones EXL2.5 propias, ahorrando tiempo de calculo.
- Servir de base para cuantizar modelos en el formato EXL2.5 dentro de los forks de exllamav2 y tabbyAPI mantenidos por ReadyArt.
- Mantener compatibilidad con el contenedor de fichero EXL2, de modo que los modelos EXL2 existentes siguen funcionando.
- Aplicar, de forma opcional por tensor, mejoras de velocidad (GEMM fast-path para Ampere/RTX 3090) y de calidad (Hadamard, AWQ, redondeo Hessiano).
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente por si mismo.
- No se declaran capacidades multilingues.

## Casos de uso

- Cuantizacion propia de modelos en EXL2.5: un desarrollador que quiera generar sus propios quants puede reutilizar las medidas del repositorio en lugar de recalcularlas, reduciendo el tiempo de preparacion.
- Despliegue en GPUs Ampere: el fast-path GEMM esta pensado para Ampere y RTX 3090, por lo que resulta adecuado para servir modelos cuantizados en estaciones con esas tarjetas.
- Verificacion MTP con batch 4: el limite de 16 filas permite que la verificacion lea los pesos una sola vez, lo que encaja en pipelines de decodificacion especulativa por lotes pequenos.
- Integracion con tabbyAPI-Fork: quien use ese servidor de inferencia puede aprovechar las medidas para servir modelos EXL2.5 sin recalibrar.
- Comparacion de calidad a igual bits-per-weight: las tecnicas de Hadamard, AWQ y redondeo Hessiano permiten evaluar si la calidad mejora sin aumentar el tamano del quant.
- Migracion desde EXL2: al conservar el contenedor, un equipo puede pasar de EXL2 a EXL2.5 manteniendo sus flujos existentes y activando las mejoras por tensor de forma selectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo que se cuantice, no del repositorio de medidas).
- GPU recomendadas: el fast-path GEMM esta optimizado para Ampere y menciona explicitamente la RTX 3090; no se detallan otras GPU.
- Compatibilidad con consumer GPU: la RTX 3090 aparece citada como objetivo del fast-path; no hay datos para el resto de tarjetas.
- Opciones de despliegue: exllamav2-Fork y tabbyAPI-Fork (las builds estandar de ExLlamaV2 no son compatibles segun el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | EXL25-Measurements (EXL2.5) | EXL2 estandar | Otros formatos de cuantizacion (GGUF, AWQ) |
|---|---|---|---|
| Tipo de artefacto | Medidas para cuantizar | Formato de pesos cuantizados | Formatos de pesos cuantizados |
| Mejoras de calidad | Hadamard + AWQ + redondeo Hessiano (opt-in por tensor) | No | Depende de la implementacion |
| Fast-path GEMM | Si, para Ampere / RTX 3090 | No | No aplica |
| Compatibilidad con ExLlamaV2 estandar | No | Si | No aplica |
| Licencia | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo: no puede usarse para inferencia directa ni para generar texto.
- Las medidas no funcionan con la build estandar de ExLlamaV2; requieren los forks indicados por el autor.
- No se especifica licencia, lo que impide confirmar condiciones de uso comercial.
- No se declaran idiomas soportados ni sesgos, al no tratarse de un modelo generativo.
- El formato EXL2.5 esta ligado a un fork concreto; su adopcion fuera de ese ecosistema no esta garantizada.
- No hay informacion sobre mantenimiento a largo plazo de los forks ni sobre validacion independiente de las mejoras declaradas.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ReadyArt/EXL25-Measurements
- Fork de ExLlamaV2: https://github.com/Ready-Art/exllamav2-Fork
- Fork de tabbyAPI: https://github.com/Ready-Art/tabbyAPI-Fork
