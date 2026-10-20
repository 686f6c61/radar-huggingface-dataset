# bambocher/Qwen3.5-0.8B-oQ2-mtp

## Resumen

Qwen3.5-0.8B-oQ2-mtp es un checkpoint cuantizado del modelo Qwen3.5-0.8B, publicado por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresión del modelo base mediante oQ (oMLX v0.7.1rc1), una técnica de cuantización de precisión mixta orientada al ecosistema MLX de Apple. El resultado ocupa 0,507 GB en disco (0,473 GiB) y conserva 873.438.784 parámetros lógicos.

El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (0,752 B de parámetros), una torre de visión (0,101 B) y una cabeza MTP o *multi-token prediction* (0,020 B). La presencia de visión y de la cabeza MTP indica que el modelo base es multimodal y está preparado para decodificación especulativa, aunque la model card no documenta el contexto, los idiomas ni la licencia del modelo original.

Su relevancia es fundamentalmente práctica: demuestra hasta dónde se puede comprimir un modelo multimodal pequeño para ejecutarlo en un Mac con memoria unificada, combinando capas a 2 bits con capas preservadas en BF16. Es un artefacto interesante para investigación en cuantización y para prototipado local, no un modelo listo para producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con torre de vision y cabeza MTP (multi-token prediction) |
| Parametros totales | 873.438.784 (0,873 B) |
| Parametros activos | No aplica: no es MoE, checkpoint denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ mixta: afin 2/4/5/6 bits con grupo 64 + BF16; media efectiva 4,648 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors para MLX (libreria `mlx`) |
| Tamano del repositorio | 0,5 GB (0,507 GB / 0,473 GiB) |
| Parametros del modelo de lenguaje | 0,752 B (0,292 GB / 0,272 GiB) |
| Parametros de vision | 0,101 B (0,201 GB / 0,187 GiB) |
| Parametros de la cabeza MTP | 0,020 B (0,015 GB / 0,014 GiB) |
| Descargas / likes | 12 / 0 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-0.8B, un transformer denso con torre de visión acoplada y una cabeza MTP adicional. El checkpoint no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF/DPO), por lo que esos datos deben consultarse en la model card del modelo base, no disponible en la información proporcionada. Lo que sí documenta esta ficha es el proceso de cuantización, que constituye la aportación real del autor.

La cuantización oQ aplica precisión mixta por tensores, asignando 2 bits al grueso de los pesos y preservando en BF16 las partes sensibles. La distribución exacta es la siguiente: 0,607 B de parámetros (69,517 %) a 2 bits afines con grupo 64; 0,133 B (15,185 %) a 5 bits; 0,018 B (2,101 %) a 4 bits; 0,012 B (1,382 %) a 6 bits; y 0,103 B (11,815 %) en BF16. Esta última fracción se corresponde casi exactamente con la torre de visión (0,187 GiB para 0,101 B de parámetros, es decir, ~16 bits por peso), lo que confirma que la visión se mantiene sin cuantizar mientras el modelo de lenguaje se comprime hasta una media de ~3,1 bits por peso.

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits efectivos/peso |
|---|---|---|---|---|
| Afin 2 bits, grupo 64 | 0,607 B | 69,517 % | 0,177 GiB | 2,50 |
| Afin 4 bits, grupo 64 | 0,018 B | 2,101 % | 0,010 GiB | 4,50 |
| Afin 5 bits, grupo 64 | 0,133 B | 15,185 % | 0,085 GiB | 5,50 |
| Afin 6 bits, grupo 64 | 0,012 B | 1,382 % | 0,009 GiB | 6,50 |
| BF16 | 0,103 B | 11,815 % | 0,192 GiB | 16,00 |
| Total | 0,873 B | 100 % | 0,473 GiB | 4,648 |

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B (calidad no verificada tras la cuantización).
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,101 B de parámetros conservada en BF16, por lo que el modelo es multimodal.
- Decodificación especulativa: la cabeza MTP de 0,020 B permite predecir varios tokens por paso, lo que en teoría acelera la inferencia cuando se usa como *draft head*.
- Ejecución nativa en Apple Silicon mediante MLX, con cuantización agresiva que reduce el peso a 0,473 GiB.
- Soporte de *tool calling* / *function calling*: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; un modelo de 0,873 B con el 69,5 % de los pesos a 2 bits es un candidato poco probable para tareas de razonamiento complejas.
- Capacidades multilingües: no documentadas.
- Modo *thinking* explícito: no documentado.

## Casos de uso

- **Prototipado local en Mac sin GPU dedicada**: con 0,473 GiB de pesos, el checkpoint se carga en cualquier Mac con 8 GB de memoria unificada, lo que permite iterar sobre prompts y flujos multimodales sin infraestructura de servidor.
- **Investigación en cuantización de precisión mixta**: la distribución 2/4/5/6 bits + BF16 sirve como caso de estudio para medir la degradación de calidad por capa y comparar estrategias de asignación de bits en modelos por debajo de 1 B.
- **Pruebas de decodificación especulativa con MTP**: la cabeza MTP incluida permite experimentar con *drafting* multi-token en MLX y medir la tasa de aceptación frente a decodificación estándar.
- **Asistentes de escritorio totalmente offline**: tareas de resumen, reescritura o clasificación de texto corto en una aplicación macOS, sin llamadas a API externas y con huella de memoria mínima.
- **Procesamiento multimodal ligero en el borde**: descripción de imágenes o extracción de texto de capturas en un portátil, asumiendo que la torre de visión en BF16 ofrece una calidad superior a la del backbone cuantizado.
- **Generación de texto en pipelines de CI con recursos limitados**: al ocupar menos de 0,5 GB, puede incorporarse como generador auxiliar en *runners* sin GPU para tareas de plantillas, mensajes de commit o documentación automática.
- **Banco de pruebas para comparativas de cuantización**: útil como referencia extrema (2 bits dominantes) frente a variantes de 4 y 8 bits del mismo modelo base, siempre que se disponga de una evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Memoria**: 0,473 GiB de pesos en disco; en ejecución hay que sumar la caché KV y el *overhead* del runtime MLX. Con contexto corto, el consumo debería mantenerse por debajo de 2 GB de memoria unificada.
- **GPU compatibles**: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), al estar el checkpoint en formato MLX. No es ejecutable directamente en CUDA.
- **GPU consumer**: sí, cabe en cualquier Mac moderno con 8 GB o más. No aplica a tarjetas NVIDIA/AMD sin conversión previa de formato.
- **Opciones de despliegue**: `mlx-lm` para el modelo de lenguaje, `mlx-vlm` si se quiere explotar la torre de visión, y oMLX (https://github.com/jundot/omlx) como herramienta de cuantización y ejecución. vLLM, TGI, llama.cpp y Ollama no consumen safetensors MLX de forma nativa; requerirían una conversión a GGUF no documentada en este repositorio.
- **Latencia y throughput**: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tasa de aceptación de la cabeza MTP.
- **Almacenamiento**: 0,5 GB de repositorio, trivial para cualquier disco.

## Comparativa con modelos similares

No se dispone de datos de otras variantes cuantizadas del mismo modelo base en la información proporcionada. La siguiente tabla recoge únicamente lo que puede deducirse del propio checkpoint y una estimación aritmética del modelo sin cuantizar.

| Modelo | Parametros | Contexto | Formato | Tamano en disco | Licencia | Benchmark |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ2-mtp (este) | 0,873 B | No disponible | safetensors MLX, media 4,648 bits/peso | 0,473 GiB | No disponible | No publicado |
| Qwen3.5-0.8B en BF16 (estimacion) | 0,873 B | No disponible | safetensors | ~1,63 GiB (calculado: 873.438.784 × 2 bytes) | No disponible | No disponible |
| Otras variantes oQ del mismo autor | No disponible | No disponible | MLX | No disponible | No disponible | No disponible |

La cuantización reduce el peso aproximadamente un 71 % respecto al checkpoint en BF16 estimado, a costa de degradar el 69,5 % de los pesos a 2 bits.

## Limitaciones y advertencias

- **Degradación por cuantización extrema**: el 69,5 % de los pesos lógicos están almacenados a 2 bits efectivos (2,50 bits/peso con el grupo de 64). Es razonable esperar pérdida de calidad en razonamiento, matemáticas y generación de código, aunque no hay mediciones que lo cuantifiquen.
- **Capacidad muy limitada**: 0,873 B de parámetros es un tamaño propio de tareas de clasificación, extracción o generación corta; no es adecuado para razonamiento multi-paso ni para contextos que exijan recall preciso.
- **Riesgo de alucinación**: no documentado, pero inherente a un modelo de este tamaño y a una compresión agresiva. Cualquier uso en producción requiere validación con datos propios.
- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido. Al derivar de Qwen3.5-0.8B, la licencia aplicable será la del modelo base, que debe verificarse antes de cualquier despliegue.
- **Idiomas no documentados**: se desconoce el soporte real del castellano y de otras lenguas; no hay evaluación multilingüe publicada.
- **Contexto no documentado**: se desconoce la ventana máxima y si la cuantización afecta a las capas de RoPE o a la caché KV.
- **Dependencia de MLX**: el checkpoint solo es utilizable en Apple Silicon. No hay versión GGUF ni conversión oficial a otros runtimes.
- **Validación comunitaria nula**: 12 descargas y 0 likes, con creación y actualización el mismo día. No hay evidencia de terceros sobre su comportamiento real.
- **Sesgos**: no documentados. Al no haber información sobre el dataset de entrenamiento, no es posible evaluar sesgos de género, raza o idioma.
- **Cabeza MTP sin verificar**: la presencia del tensor no garantiza que el runtime la utilice; la aceleración por decodificación especulativa depende de la implementación concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ2-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-0.8B: no disponible en la información proporcionada
- Paper o documentación técnica de oQ: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
