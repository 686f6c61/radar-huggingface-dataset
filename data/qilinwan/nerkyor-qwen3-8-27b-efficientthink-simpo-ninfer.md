# QilinWan/nerkyor-Qwen3.8-27B-EfficientThink-SimPO-Ninfer

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión de formato: empaqueta los pesos de la serie **EfficientThink** de Lynn (nerkyor), derivada del modelo base Qwen3.8-27B, en el contenedor propietario `.ninfer` v3 que consume el motor de inferencia NInfer. El autor de esta conversión es QilinWan, y el resultado son tres ficheros autocontenidos de entre 16,96 GiB y 18,61 GiB que incluyen el backbone cuantizado, la torre de visión de 27 capas y cabezas de decodificación especulativa.

El modelo subyacente parte de Qwen3.8-27B (Apache-2.0) y ha pasado por un post-entrenamiento de SFT seguido de optimización con SimPO, según la cadena de modelos base declarada. La propuesta de valor aquí es de eficiencia de despliegue: cada contenedor incorpora decodificación especulativa (cabeza DFlash2, cabeza MTP nativa, o ambas) y soporta la ventana de contexto nativa de 262.144 tokens, con el objetivo de maximizar tokens por segundo en GPUs de consumo de las familias RTX 40 y RTX 50.

Es relevante ahora por su carácter de artefacto de inferencia empaquetado: demuestra un flujo de conversión desde pesos BF16 y NVFP4 hacia un motor con soporte de FP4 en hardware Blackwell y sm_89 mediante una compilación comunitaria. Su limitación principal es también su rasgo definitorio: al ser un formato propietario, no funciona con llama.cpp, vLLM ni SGLang, lo que restringe su adopción al ecosistema NInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión de 27 capas; cabezas de decodificación especulativa DFlash2 y MTP nativa; backbone Qwen3.8-27B (el detalle interno del backbone no se especifica en la informacion disponible) |
| Parametros totales | 27B (segun la denominacion Qwen3.8-27B del modelo base; el repositorio no publica el recuento exacto) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | groupwise Q4/Q5 (variantes df2 y mtp); NVFP4 W4A4 (variante nf4, codificacion oficial del autor importada sin perdida); cabeza DFlash2 requantizada a Q8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de EfficientThink y de Qwen3.8-27B) |
| Formato de pesos | `.ninfer` v3 (contenedor propietario de NInfer; no es GGUF ni safetensors y no es compatible con llama.cpp, vLLM ni SGLang) |

Detalle de los tres artefactos incluidos en el repositorio (tamano total del repo: 57,5 GB):

| Fichero | Tamano | Cuantizacion del backbone | Decodificacion especulativa | Hardware |
|---|---|---|---|---|
| `qwen3.8-27b-lynn-df2.ninfer` | 18,61 GiB | groupwise Q4/Q5 | cabeza draft DFlash2 | RTX 40 y 50 |
| `qwen3.8-27b-lynn-mtp.ninfer` | 16,96 GiB | groupwise Q4/Q5 | cabeza MTP nativa | RTX 40 y 50 |
| `qwen3.8-27b-lynn-nf4.ninfer` | 18,02 GiB | NVFP4 W4A4 | DFlash2 y MTP (seleccionables con `--spec`) | solo RTX 50 (FP4 requiere tensor cores Blackwell) |

Checksums SHA256 publicados por el autor:

| Fichero | Bytes | SHA256 |
|---|---|---|
| `qwen3.8-27b-lynn-df2.ninfer` | 19.986.249.216 | `d6d1425c23ca3ea2f93d898d247c4df523199543c3eb6462176c0b03f62754f4` |
| `qwen3.8-27b-lynn-mtp.ninfer` | 18.210.703.360 | `7970ac0f6263f666ff21bc0ec891ec78976a2fbbc33281aefce6b147ebe73958` |
| `qwen3.8-27b-lynn-nf4.ninfer` | 19.345.900.804 | `faf551e2c782022606e0ffd382e8d015cec574914a9476ca6007f346c4c53268` |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer con un backbone Qwen3.8-27B y dos componentes adicionales orientados a latencia: una cabeza draft DFlash2 (según el autor, con tasas de aceptacion reportadas del 66-67 %) y una cabeza MTP nativa, ambas usadas para decodificacion especulativa. Se incluye ademas una torre de vision de 27 capas que se activa con el flag `--vision`, y los componentes no seleccionados no consumen memoria de video. La variante `nf4` emplea codificacion NVFP4 W4A4 importada bit a bit desde el encoding oficial del autor, mientras que la cabeza DFlash2 requirio una requantizacion a Q8 a nivel de tensor desde su formato FP8 original.

Respecto al entrenamiento, la cadena de modelos base declarada indica un pipeline de post-entrenamiento sobre Qwen3.8-27B que combina SFT y optimizacion con SimPO (Simple Preference Optimization), dentro de la serie EfficientThink, y que la propia model card etiqueta como "Uncensored". No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de RLHF. La model card del repositorio de conversion incluye dos overrides tecnicos documentados en el proceso: la conversion del tensor-level-FP8 de la cabeza DFlash2 a Q8 y la traduccion de la nomenclatura ModelOpt NVFP4 a las convenciones de compressed-tensors.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con la ventana de contexto nativa de 262.144 tokens.
- Procesamiento de vision gracias a la torre de vision de 27 capas incluida en los tres contenedores (se activa con `--vision`).
- Decodificacion especulativa integrada: DFlash2, MTP nativa, o ambas seleccionables en la variante nf4 mediante `--spec`.
- El modelo base de la cadena declara un post-entrenamiento orientado a "pensamiento eficiente" (EfficientThink), aunque el repositorio no detalla el mecanismo exacto ni si existe un modo thinking explicito con control de presupuesto de razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Cualquier capacidad de audio: no disponible en la informacion proporcionada.

## Casos de uso

- **Inferencia local de alto rendimiento en GPU de consumo**: las tres variantes estan pensadas para ejecutarse en RTX 40 y RTX 50 con cuantizacion de 4-5 bits y decodificacion especulativa; es el escenario para el que se publicaron los datos de 157-160 t/s en RTX 4080 SUPER y 195-203 t/s en RTX 4090D.
- **Analisis de documentos largos**: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes tecnicos o bases de codigo extensas en una sola pasada sin estrategias de troceado.
- **Pipelines con entrada visual**: la torre de vision de 27 capas permite tareas de descripcion de imagenes, extraccion de informacion de capturas o preprocesado de documentos escaneados, activando `--vision` en el arranque.
- **Asistentes conversacionales de baja latencia**: la cabeza DFlash2 con acceptance rate declarado del 66-67 % reduce el numero de pasos de decodificacion, lo que resulta adecuado para interfaces de chat interactivas donde el tiempo hasta el primer token y el tokens por segundo son criticos.
- **Despliegue en Blackwell con precision FP4**: la variante `nf4` aprovecha el camino rapido FP4 de las RTX 50, util cuando se quiere maximizar throughput por vatio en estaciones con RTX 5090 o RTX PRO 6000.
- **Prototipado de investigacion sobre decodificacion especulativa**: al ofrecer MTP y DFlash2 en el mismo contenedor, la variante `nf4` permite comparar ambas cabezas con un cambio de flag, sin recompilar ni convertir pesos.
- **Generacion creativa y de rol sin filtros de contenido**: el modelo base se distribuye explicitamente como "Uncensored", orientado a escenarios donde el filtrado por defecto de otros asistentes resulta limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni similares, y la model card remite a los registros de evaluacion del autor original (serie EfficientThink de nerkyor) sin reproducirlos.

Los unicos datos cuantitativos de rendimiento presentes son medidas de velocidad reportadas por la comunidad, no verificadas en este repositorio:

| Metrica | Valor declarado | Contexto |
|---|---|---|
| Throughput con DFlash2 | ~157-160 t/s | RTX 4080 SUPER 32 GB, motor de la misma generacion |
| Throughput con MTP | ~195-203 t/s | RTX 4090D, motor de la misma generacion |
| Tasa de aceptacion de la cabeza DFlash2 | ~66-67 % | Reportada por el autor del modelo original |

El propio repositorio advierte que, tras el fine-tuning, las tasas de aceptacion y la velocidad reales pueden diferir ligeramente de estas referencias.

## Requisitos de hardware

- **VRAM estimada**: los pesos ocupan entre 16,96 y 18,61 GiB segun variante, a lo que hay que sumar la cache KV para 262.144 tokens, la torre de vision si se activa y el overhead del motor. En la practica se recomienda un minimo de 24 GB y se apunta explicitamente a configuraciones de 32 GB.
- **GPU compatibles (sm_89, Ada)**: RTX 4080 SUPER 32 GB, RTX 4090 y RTX 4090D. En sm_89 solo funcionan las variantes `df2` y `mtp`; la variante `nf4` no es utilizable por falta de tensor cores FP4.
- **GPU compatibles (sm_120a, Blackwell)**: RTX 5090 y RTX PRO 6000, con las tres variantes disponibles.
- **Cabe en GPU de consumo**: si, es el objetivo declarado del artefacto, pero no en tarjetas de 16 GB o menos una vez contabilizada la cache KV a contexto largo.
- **Motor de despliegue**: exclusivamente NInfer. El motor oficial solo soporta Blackwell (sm_120a); para RTX 40 se necesita la compilacion comunitaria QilinWan/Ninfer-Blackwell-Ada, que anade sm_89. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni SGLang.
- **Comandos de referencia**:
  - `ninfer run qwen3.8-27b-lynn-df2.ninfer --spec dflash2 --vision`
  - `ninfer run qwen3.8-27b-lynn-mtp.ninfer --spec mtp --vision`
  - `ninfer run qwen3.8-27b-lynn-nf4.ninfer --spec dflash2 --vision` (o `--spec mtp`)
- **Latencia y throughput**: ver la tabla de la seccion anterior; son medidas de terceros sobre el modelo base, no sobre estos artefactos convertidos.
- **Requisitos de compilacion**: el motor requiere compilacion especifica por arquitectura (sm_89 o sm_120a); no se distribuyen binarios precompilados en el repositorio.

## Comparativa con modelos similares

La informacion disponible no incluye modelos comparables de terceros con datos verificables. La comparacion mas util es entre las tres variantes publicadas y el modelo fuente en BF16:

| Artefacto | Parametros | Contexto | Cuantizacion | Decodificacion especulativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `df2.ninfer` | 27B (nominal) | 262.144 | groupwise Q4/Q5 | DFlash2 | Apache-2.0 | RTX 40 y 50 |
| `mtp.ninfer` | 27B (nominal) | 262.144 | groupwise Q4/Q5 | MTP nativa | Apache-2.0 | RTX 40 y 50, fichero mas pequeno |
| `nf4.ninfer` | 27B (nominal) | 262.144 | NVFP4 W4A4 | DFlash2 y MTP | Apache-2.0 | solo RTX 50 |
| Pesos fuente BF16 (nerkyor) | 27B (nominal) | 262.144 | BF16 | cabezas disponibles por separado | Apache-2.0 | multiplataforma, tamano muy superior |

Comparacion con alternativas de otras familias (Qwen, Llama, Mistral, etc.) del mismo rango de parametros: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Formato propietario**: los ficheros `.ninfer` v3 no son cargables por llama.cpp, vLLM, SGLang, Ollama ni TGI. Adoptar este modelo implica adoptar el motor NInfer y su cadena de compilacion.
- **Compatibilidad de hardware restringida**: la variante `nf4` solo funciona en Blackwell; las variantes `df2` y `mtp` en Ada requieren una compilacion comunitaria no oficial (QilinWan/Ninfer-Blackwell-Ada), con el riesgo de mantenimiento que ello supone.
- **Modelo "Uncensored"**: el post-entrenamiento elimina deliberadamente parte de los filtros de seguridad. No es adecuado para despliegues orientados al publico sin una capa de moderacion externa, y puede generar contenido que incumpla politicas de plataforma.
- **Riesgo de alucinacion**: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion para esta cadena de fine-tuning. Al tratarse de un modelo afinado con SimPO sobre datos no documentados, el riesgo es a priori comparable al de otros modelos de 27B y no puede descartarse.
- **Sesgos**: no hay informacion sobre composicion del dataset de SFT ni de preferencias, por lo que no es posible evaluar sesgos demograficos, ideologicos o linguisticos. La ausencia de filtrado agrava este punto.
- **Idiomas**: no se declara lista de idiomas soportados. El soporte multilingue real es desconocido y no deberia asumirse fuera de los idiomas presentes en el entrenamiento del modelo base.
- **Contexto largo**: aunque se declaran 262.144 tokens nativos, no se aportan resultados de evaluacion tipo RULER o needle-in-a-haystack, y el coste de memoria de la cache KV a esa longitud puede ser prohibitivo en GPUs de 24-32 GB.
- **Cuantizacion agresiva**: Q4/Q5 y NVFP4 W4A4 implican perdida de precision frente a BF16; no se documenta la degradacion medida en tareas de razonamiento o codigo.
- **Trazabilidad y validacion comunitaria**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 23 de septiembre de 2026. No hay validacion independiente de los artefactos mas alla de las pruebas de carga del autor.
- **Licencia**: Apache-2.0 permite uso comercial, pero los pesos derivan de Qwen3.8-27B y de la serie EfficientThink, por lo que conviene verificar las condiciones de los repositorios upstream antes de un despliegue en produccion.
- **Fiabilidad de la procedencia**: la conversion declara verificacion SHA256 contra los checksums del autor, pero la integridad de la cadena de custodia previa depende de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/QilinWan/nerkyor-Qwen3.8-27B-EfficientThink-SimPO-Ninfer
- Modelo base de la conversion: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Perfil del autor original de los pesos (Lynn / nerkyor): https://huggingface.co/nerkyor
- Motor de inferencia NInfer: https://github.com/Neroued/ninfer
- Compilacion comunitaria con soporte sm_89: https://github.com/QilinWan/Ninfer-Blackwell-Ada
- Espejo ModelScope, variante DF2: https://www.modelscope.cn/models/mrwan0410/Qwen3.8-27B-lynn-DF2-ninfer
- Espejo ModelScope, variante MTP: https://www.modelscope.cn/models/mrwan0410/Qwen3.8-27B-lynn-MTP-ninfer
- Espejo ModelScope, variante NF4: https://www.modelscope.cn/models/mrwan0410/Qwen3.8-27B-lynn-NF4-ninfer

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con el ecosistema de IA open source (contenido no relevante y de caracter adulto). No se ha podido recuperar de ellos ningun paper, blog, repositorio o demo utilizable para esta ficha.
