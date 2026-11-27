# jknlsn/Inkling-2-Mini-oQ4e-mtp

## Resumen

Inkling-2-Mini-oQ4e-mtp es una cuantización de 4 bits del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario jknlsn. El checkpoint se ha generado con la herramienta oQe (oMLX v0.8.4) aplicando cuantización de precisión mixta reforzada con matrices de importancia (imatrix), y está empaquetado en formato MLX safetensors para su ejecución en hardware Apple Silicon. El modelo conserva el soporte de predicción multi-token (MTP) del modelo original y mantiene el pipeline image-text-to-text, por lo que acepta entradas de imagen y texto y genera texto.

El interés de esta ficha reside en que permite ejecutar un modelo de aproximadamente 26.400 millones de parámetros en un entorno MLX con un peso efectivo medio de 5,047 bits por parámetro y un tamaño de repositorio de 16,9 GB, lo que lo sitúa en el rango de equipos con memoria unificada de 24-32 GB. Al tratarse de una cuantización derivada, las capacidades funcionales, los idiomas y el comportamiento del modelo dependen íntegramente del modelo base, cuya model card original no se ha incluido en la información disponible.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial y la redistribución siempre que se respeten las condiciones de la licencia y se conserve la atribución correspondiente. No obstante, la información pública disponible sobre esta publicación es muy limitada: no hay descargas ni valoraciones, y no se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (tipo declarado en la model card; no se detalla la estructura interna) |
| Parametros totales | 26.388.646.400 (26,39B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con precisión mixta: affine 4-bit group 64, NVFP4 group 16, affine 8-bit group 64, BF16 y FP32; media efectiva de 5,047 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (repo de 16,9 GB) |

## Arquitectura y entrenamiento

La model card identifica el tipo de modelo como `inkling2_loop`, pero no describe la arquitectura interna (transformer, MoE, híbrida u otra), ni el número de capas, cabezas de atención o dimensión oculta. Tampoco se especifican los datos de entrenamiento del modelo base: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación. Toda esta información queda fuera del alcance de la documentación disponible y debería consultarse en la model card de thinkingmachines/Inkling-2-Mini.

La innovación técnica documentada en esta publicación es la cuantización. Se ha aplicado oQe (oMLX v0.8.4) con matrices de importancia (imatrix), lo que permite asignar precisión de forma no uniforme: los tensores más sensibles se mantienen en 8 bits (1,572B de parámetros, 5,887% del total) o en BF16 (0,637B, 2,387%), mientras que el grueso del modelo (20,384B, 76,327%) se almacena en NVFP4 con grupo 16. El resultado es un checkpoint de 15,690 GiB con una media efectiva de 5,047 bits por peso. Además, se conserva el soporte de predicción multi-token (MTP), que en el modelo original permite generar varios tokens por paso de decodificación y puede mejorar el throughput en inferencia.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado `image-text-to-text` y la etiqueta `conversational`.
- Procesamiento de imágenes combinadas con texto: el modelo acepta entradas image-text-to-text, aunque no se detalla la resolución, el número de imágenes por prompt ni el codificador visual empleado.
- Predicción multi-token (MTP) incluida en el checkpoint, orientada a acelerar la decodificación.
- Ejecución en MLX, lo que permite aprovechar la memoria unificada de los chips Apple Silicon.
- Capacidades de razonamiento, código, matemáticas o tool calling: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible; la model card no enumera idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con MLX en equipos Apple Silicon con memoria unificada suficiente (el checkpoint ocupa 15,69 GiB), lo que permite mantener conversaciones multi-turno sin depender de servicios en la nube.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede utilizarse para describir capturas, extraer información de figuras o responder preguntas sobre imágenes acompañadas de contexto textual.
- Prototipado de aplicaciones multimodales: sirve como banco de pruebas para pipelines de visión-lenguaje en entornos de desarrollo sobre macOS, gracias a su formato MLX nativo y a la licencia Apache 2.0.
- Investigación sobre cuantización: el checkpoint es un caso de estudio útil para evaluar el impacto de la precisión mixta con imatrix (NVFP4, affine 4-bit y 8-bit, BF16) en la calidad de un modelo de 26B.
- Evaluación de decodificación especulativa: la inclusión de MTP permite medir ganancias de throughput frente a la decodificación autoregresiva estándar en el mismo hardware.
- Despliegue en estaciones de trabajo con memoria unificada: para equipos con 32 GB o más, el modelo cabe junto con el sistema operativo y permite inferencia local de un modelo de gran tamaño sin GPU dedicada.
- Fine-tuning o adaptación posterior: al estar en safetensors y con licencia Apache 2.0, puede servir de base para ajustes con LoRA u otras técnicas, siempre que el framework soporte el formato MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint pesa 15,690 GiB; se recomienda un mínimo de 24 GB de memoria unificada para cargar el modelo con margen para el contexto y el codificador visual, y 32 GB o más para secuencias largas o procesamiento de imágenes.
- GPU recomendadas: al ser un checkpoint MLX, está orientado a chips Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No está pensado para GPUs NVIDIA o AMD en su formato actual.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 24-32 GB de memoria unificada; en GPUs dedicadas de consumo no es directamente utilizable sin reconversión de formato.
- Opciones de despliegue: MLX (librería `mlx` declarada) y el ecosistema oMLX/oQe. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere una mejora potencial en la velocidad de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e-mtp | 26,39B | no disponible | MLX safetensors 4-bit mixto | Apache 2.0 | Cuantización con imatrix y MTP; orientado a Apple Silicon |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar; referencia para comparar calidad |
| Otras cuantizaciones MLX de modelos de ~26B | variable | variable | MLX safetensors | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o calidad con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 4 bits con precisión mixta puede introducir degradación en tareas sensibles, especialmente en razonamiento matemático, código o generación larga; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El modelo base no documenta en la información disponible sus sesgos, su tasa de alucinación ni sus limitaciones idiomáticas; deben asumirse los riesgos habituales de los modelos generativos multimodales.
- La longitud de contexto no está especificada, por lo que no puede garantizarse un rendimiento correcto en prompts largos o con múltiples imágenes.
- El checkpoint está en formato MLX y depende de la librería `mlx`; no es portable directamente a otros runtimes sin conversión.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribución; conviene verificar también las condiciones del modelo base.
- El repositorio no registra descargas ni valoraciones, y la fecha de creación es reciente; no hay evidencia comunitaria sobre su estabilidad en producción.
- El soporte MTP incluido puede requerir versiones específicas del runtime MLX; no se documenta la compatibilidad exacta.

## Enlaces

- [Hugging Face: jknlsn/Inkling-2-Mini-oQ4e-mtp](https://huggingface.co/jknlsn/Inkling-2-Mini-oQ4e-mtp)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Herramienta oQe (oMLX)](https://github.com/jundot/omlx)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
