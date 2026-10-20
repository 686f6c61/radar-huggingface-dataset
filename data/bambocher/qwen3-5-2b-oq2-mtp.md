# bambocher/Qwen3.5-2B-oQ2-mtp

## Resumen

`bambocher/Qwen3.5-2B-oQ2-mtp` es un artefacto de cuantización de terceros sobre el modelo Qwen3.5-2B, publicado por el usuario bambocher en formato MLX y generado con la herramienta oQ de oMLX (v0.7.1rc1). No es un modelo entrenado desde cero ni una versión oficial de Alibaba/Qwen: es un checkpoint recomprimido con cuantización mixta de precisión, con 2.274.069.824 parámetros reales según los safetensors. El desglose de la model card revela que el checkpoint es multimodal: 1,882B de pesos en el modelo de lenguaje, una torre de visión de 0,331B y una cabecera MTP (multi-token prediction) de 0,061B.

Su relevancia práctica está en el tamaño: el repositorio ocupa 1,5 GB y los pesos suman 1,345 GiB con una media efectiva de 5,082 bits por peso, frente a los 16 bits de un checkpoint BF16 equivalente. Eso permite ejecutar un modelo de lenguaje con entrada de imágenes en un Mac con memoria unificada modesta, sin GPU dedicada. La distribución es agresiva: el 66,168% de los pesos lógicos (1,505B) se almacena a 2 bits afines con grupo 64, mientras que un 14,967% (0,340B) se mantiene en BF16, presumiblemente en las capas más sensibles a la cuantización (la model card no documenta el criterio de asignación).

Conviene tratarlo con cautela: el autor no declara licencia, idiomas ni pipeline, no publica benchmarks y el modelo acumula 6 descargas y 0 likes en el momento de la consulta. Los datos de licencia y capacidades deben tomarse del modelo base Qwen3.5-2B, no de este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de visión y cabecera MTP (etiqueta `qwen3_5`); detalle de capas y atención no disponible |
| Parámetros totales | 2.274.069.824 (2,274B) |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta afín con grupo 64: 2, 4, 5, 6 y 8 bits, más pesos en BF16; media efectiva 5,082 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato MLX) |
| Librería | mlx |
| Tamaño del repositorio | 1,5 GB (1,345 GiB de pesos) |
| Desglose de pesos | Lenguaje 1,882B (0,685 GiB); visión 0,331B (0,617 GiB); cabecera MTP 0,061B (0,043 GiB) |
| Descargas / likes | 6 / 0 |
| Fecha de creación | 20 de octubre de 2026 |

## Arquitectura y entrenamiento

El checkpoint no aporta información de entrenamiento: es una recuantización del modelo Qwen3.5-2B, por lo que no hay datos sobre número de tokens, composición del corpus ni fases de RLHF/DPO. Lo que sí documenta la model card es la estructura de almacenamiento, que confirma tres componentes diferenciados: un modelo de lenguaje de 1,882B parámetros, una torre de visión de 0,331B parámetros (que se conserva íntegramente en BF16, 0,617 GiB, es decir, cerca del 46% del tamaño total del checkpoint) y una cabecera MTP de 0,061B. La presencia de la torre de visión implica capacidad de entrada de imágenes; la cabecera MTP suele asociarse a decodificación multi-token, aunque la model card no especifica su funcionamiento ni si el runtime la explota.

La innovación técnica aquí es la cuantización mixta de oQ: en lugar de aplicar una precisión uniforme, asigna bits por tensor según sensibilidad, con tamaño de grupo 64 y esquema afín. La distribución resultante es la siguiente:

| Formato de almacenamiento | Pesos lógicos | % del total | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 2 bits, grupo 64 | 1,505B | 66,168% | 0,438 GiB | 2,50 |
| Afín 4 bits, grupo 64 | 0,052B | 2,306% | 0,027 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 0,335B | 14,747% | 0,215 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 0,041B | 1,801% | 0,031 GiB | 6,50 |
| Afín 8 bits, grupo 64 | 0,000B | 0,012% | 0,000 GiB | 8,50 |
| BF16 | 0,340B | 14,967% | 0,634 GiB | 16,00 |
| **Total** | **2,274B** | **100%** | **1,345 GiB** | **5,082** |

## Capacidades

- Generación de texto y razonamiento en el rango propio de un modelo de 2B de la familia Qwen; sin benchmarks publicados que lo confirmen en esta cuantización.
- Entrada de imágenes: la torre de visión de 0,331B parámetros está presente y se conserva en BF16, por lo que cabría esperar descripción de imágenes, VQA y OCR; el alcance exacto no está documentado.
- Decodificación multi-token: incluye una cabecera MTP de 0,061B parámetros; su disponibilidad efectiva depende de que el runtime MLX la soporte.
- Generación de código y matemáticas: capacidad esperable por herencia del modelo base, no verificada en este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking explícito: no disponible.

## Casos de uso

- **Prototipado local en Mac sin conexión**: cargar el checkpoint con MLX (mlx-vlm) en un MacBook para probar flujos multimodales sin enviar datos a la nube; los 1,345 GiB de pesos permiten mantenerlo residente junto al resto de la sesión en equipos de 16 GB.
- **Procesamiento de documentos y capturas en local**: al incluir torre de visión, sirve para extraer texto o describir capturas e imágenes de facturas en un pipeline que se ejecute íntegramente en el portátil, con la ventaja de privacidad que implica no externalizar el contenido.
- **Asistente de escritorio para tareas cortas**: resúmenes, reescritura, clasificación de correos y generación de respuestas plantilla, donde un modelo de 2B cuantizado ofrece latencia baja y coste cero por token.
- **Autocompletado y generación de código en editor local**: integrable en un plugin de VS Code sobre Apple Silicon para sugerencias de líneas y funciones cortas; el tamaño reducido permite respuestas rápidas, aunque la cuantización a 2 bits en dos tercios de los pesos limita la fiabilidad en tareas de código largas.
- **Evaluación de técnicas de cuantización**: útil como caso de estudio para investigadores que comparen oQ frente a otras estrategias (GGUF Q4_K_M, AWQ, MLX uniforme de 4 bits) midiendo la degradación real en tareas concretas.
- **Docencia y demos en hardware de consumo**: permite mostrar un modelo con visión funcionando en un portátil durante una clase o taller, sin depender de GPUs ni de servicios externos.
- **Filtrado y etiquetado de imágenes a escala pequeña**: clasificación por lotes de capturas o fotos con prompts de texto, ejecutable en local durante la noche.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta métricas de compresión (5,082 bits/peso de media, 1,345 GiB de almacenamiento, reparto por precisión), no métricas de calidad como MMLU, HumanEval, GSM8K o evaluaciones multimodales.

## Requisitos de hardware

- **Memoria**: los pesos ocupan 1,345 GiB (1,445 GB). Con caché KV para contextos moderados y una imagen de entrada, una estimación razonable de memoria unificada necesaria es de 2 a 3 GB, aunque el fabricante no publica cifras oficiales.
- **Plataforma**: MLX solo se ejecuta en Apple Silicon (series M1, M2, M3, M4) bajo macOS. No hay soporte para CUDA, ROCm ni CPU x86 con esta librería.
- **Cabe en hardware de consumo**: sí; cualquier Mac con 8 GB de memoria unificada debería poder cargarlo, y con 16 GB se opera con holgura. No aplica a GPUs NVIDIA/AMD en este formato.
- **GPU recomendadas**: no aplica en el sentido habitual; el equivalente sería un Apple M1 o superior. Para reutilizar el modelo en GPU dedicada habría que convertirlo a BF16 y recuantizarlo en otro formato.
- **Opciones de despliegue**: MLX (mlx-lm para texto, mlx-vlm para visión) y oMLX. No es directamente compatible con vLLM, TGI, llama.cpp ni Ollama, ya que todos ellos trabajan con formatos distintos (GGUF, safetensors con cuantización GPTQ/AWQ, etc.) y requerirían reconversión.
- **Latencia y throughput**: no disponibles. Al ser un modelo de 2B con buena parte de los pesos a 2 bits, el cuello de botella previsible es el ancho de banda de memoria, no el cómputo, lo que favorece su uso en chips de Apple.

## Comparativa con modelos similares

Las cifras de las alternativas son cálculos aritméticos a partir del mismo número de parámetros (2,274B) y no artefactos publicados; se incluyen para dimensionar el ahorro de espacio.

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-oQ2-mtp (este) | 2,274B | No disponible | 5,082 (mixta) | 1,345 GiB | No disponible | MLX, Apple Silicon |
| Qwen3.5-2B en BF16 (referencia teórica) | 2,274B | No disponible | 16,00 | ≈ 4,24 GiB (calculado) | La del modelo base, no consultada | Según distribución oficial |
| Cuantización uniforme de 8 bits (teórica) | 2,274B | No disponible | 8,00 | ≈ 2,12 GiB (calculado) | No disponible | Depende de la herramienta |
| Cuantización uniforme de 4 bits (teórica) | 2,274B | No disponible | 4,00 | ≈ 1,06 GiB (calculado) | No disponible | Depende de la herramienta |

Frente a una cuantización uniforme de 4 bits, este checkpoint ocupa más espacio (1,345 GiB frente a ≈1,06 GiB) porque reserva 0,634 GiB a BF16; la hipótesis del autor es que ese reparto preserva mejor la calidad, pero no hay evaluación publicada que lo respalde. No se dispone de datos para comparar con alternativas multimodales pequeñas de otros fabricantes.

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio no indica licencia. No puede asumirse uso comercial; hay que verificar la licencia del modelo base Qwen3.5-2B antes de cualquier despliegue en producción.
- **Sin validación pública**: 6 descargas y 0 likes en la fecha consultada, sin benchmarks ni evaluaciones de terceros. La calidad real de esta cuantización es desconocida.
- **Cuantización muy agresiva**: el 66,168% de los pesos lógicos está a 2 bits efectivos (2,50 bits/peso con metadatos). Es esperable una degradación notable en razonamiento, matemáticas y código frente al modelo en BF16 o a una cuantización de 4 bits, especialmente en tareas de cadena larga.
- **Torre de visión íntegra en BF16**: 0,617 GiB de los 1,345 GiB corresponden a la torre de visión sin cuantizar, de modo que el ahorro se concentra en el modelo de lenguaje, que es justamente la parte más castigada.
- **Dependencia del runtime**: la cabecera MTP y el soporte multimodal requieren versiones de MLX/mlx-vlm que las implementen; en runtimes que solo carguen el modelo de lenguaje, el rendimiento y las capacidades pueden diferir.
- **Encierro en el ecosistema Apple**: no ejecutable en GPUs NVIDIA/AMD ni en servidores Linux sin reconversión previa, lo que descarta su uso en infraestructura de producción convencional.
- **Riesgo de alucinación**: inherente a los modelos de 2B, agravado por la cuantización; no debe usarse sin verificación humana en dominios factuales, legales, médicos o financieros.
- **Idiomas y sesgos no documentados**: se desconoce la cobertura lingüística real y no hay análisis de sesgos en el repositorio. El castellano no está confirmado como idioma soportado.
- **Longitud de contexto desconocida**: no se puede planificar un caso de uso con documentos largos sin verificar experimentalmente la ventana efectiva y su comportamiento tras la cuantización.
- **Trazabilidad**: es un artefacto de un usuario individual sobre un modelo de terceros; no hay garantía de continuidad, mantenimiento ni corrección de errores.

## Enlaces

- HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ2-mtp
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-2B: no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada
