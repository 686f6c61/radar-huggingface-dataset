# mradermacher/Melody1437-35B-A3B-i1-GGUF

## Resumen

Melody1437-35B-A3B-i1-GGUF es una cuantización en formato GGUF del modelo original ReadyArt/Melody1437-35B-A3B, preparada por mradermacher para su uso con herramientas de inferencia local como llama.cpp, Ollama o LM Studio. El modelo base es un transformer de 35.5 mil millones de parámetros con arquitectura de mezcla de expertos (MoE), en la que solo 3 mil millones de parámetros se activan por token, según su nomenclatura. Está orientado a roleplay y conversación, con un ajuste no alineado que permite generar contenido adulto explícito.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de gran tamaño en hardware de consumo gracias a las cuantizaciones i1 (imatrix) de mradermacher, que mejoran la calidad respecto a las cuantizaciones estáticas. El modelo está etiquetado como `qwen3.6`, lo que sugiere una arquitectura derivada de la familia Qwen, aunque no se ha confirmado oficialmente. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (probablemente basada en Qwen3.6, no confirmado) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3 mil millones (según nomenclatura A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, imatrix (adicionales en repo estático) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la información proporcionada. El nombre del modelo (`35B-A3B`) indica una mezcla de expertos con 35 mil millones de parámetros totales y 3 mil millones activos por token, similar a modelos como Qwen3-30B-A3B. El tag `qwen3.6` sugiere que deriva de la familia Qwen, pero no hay confirmación oficial sobre la arquitectura interna (número de capas, atención, etc.).

No se proporcionan datos sobre el entrenamiento: no se especifica el número de tokens, la composición del dataset ni el proceso de alineación. El tag `unaligned` indica que no se aplicaron técnicas de refuerzo con feedback humano (RLHF) ni optimización de preferencias (DPO), lo que explica la capacidad de generar contenido explícito. La cuantización fue realizada por mradermacher usando el método imatrix, que calcula una matriz de importancia sobre un conjunto de datos de calibración para mejorar la calidad de la cuantización.

## Capacidades

- Generación de texto conversacional y roleplay, con soporte de instrucciones (instruct).
- Capacidad de manejar contenido adulto explícito y no filtrado, gracias a su naturaleza no alineada.
- Posible soporte multimodal (visión), ya que la model card indica que es un modelo de visión y que los archivos `mmproj` están disponibles en el repositorio estático.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no confirmado.
- Multilingüe: solo se indica idioma inglés (`en`), no se confirman otros idiomas.

## Casos de uso

- Roleplay conversacional en aplicaciones de chat locales: el modelo puede sostener diálogos multi-turno con personalidad y tono no censurado, ideal para proyectos de ocio o escritura creativa. Su tamaño de 35B con 3B activos permite ejecución en GPU de consumo con cuantización.
- Generación de narrativa creativa y fanfiction: al no estar alineado, puede escribir escenas explícitas o maduras que otros modelos rechazan, útil para autores que necesitan explorar contenido adulto.
- Simulación de personajes en videojuegos o entornos virtuales: con la cuantización Q4_K_S (20.5 GB) se puede integrar en motores de juego con llamadas a la API de llama.cpp.
- Desarrollo de asistentes de conversación no censurados: para entornos de investigación sobre seguridad en IA o para aplicaciones donde se requiere generar contenido sin restricciones.
- Fine-tuning posterior: aunque es una cuantización, el modelo base puede servir para fine-tuning con LoRA en tareas específicas de roleplay, aunque no se recomienda sobre GGUF.
- Evaluación de cuantizaciones imatrix: el repo incluye un archivo imatrix para que los usuarios creen sus propias cuantizaciones, útil para investigar el impacto de la cuantización en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - `i1-Q2_K` (13.3 GB): cabe en GPUs con 16 GB de VRAM, como RTX 4080 o RTX 4090, con offloading de capas.
  - `i1-IQ3_M` (15.9 GB): similar, requiere al menos 16 GB de VRAM.
  - `i1-Q4_K_S` (20.5 GB): requiere 24 GB de VRAM (RTX 3090, RTX 4090, A5000) o más para ejecución completa en GPU.
- GPUs recomendadas: RTX 3090, RTX 4090, A6000, A100 (para cuantizaciones mayores).
- Posibilidad de ejecución en CPU: con llama.cpp, se puede usar con RAM suficiente (32 GB o más), aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a formato compatible), text-generation-webui.
- Latencia y throughput: no disponible, pero un MoE de 3B activos suele generar entre 20-40 tokens/segundo en una RTX 4090 con cuantización Q4_K_S, dependiendo de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Se podría comparar con otros MoE de 30-35B como Qwen3-30B-A3B o DeepSeek-V3-Lite, pero no hay datos de rendimiento ni características confirmadas de Melody1437-35B-A3B. Se indica "no disponible".

## Limitaciones y advertencias

- Contenido explícito: el modelo no está alineado y puede generar contenido sexual, violento o inapropiado sin filtro. No es adecuado para aplicaciones comerciales que requieran moderación.
- Riesgo de alucinación: al ser una cuantización y no estar alineado, la probabilidad de respuestas incoherentes o falsas es mayor que en modelos alineados.
- Idioma: solo se confirma inglés, puede no funcionar bien en otros idiomas.
- Contexto desconocido: no se especifica la longitud de contexto, lo que limita el uso en tareas que requieran ventanas largas.
- Licencia: apache-2.0 permite uso comercial, pero el contenido generado puede ser problemático legalmente en ciertos contextos.
- La arquitectura no está documentada oficialmente, lo que dificulta el ajuste fino o la depuración.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Melody1437-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-35B-A3B
- Repositorio estático de cuantizaciones: https://huggingface.co/mradermacher/Melody1437-35B-A3B-GGUF
- Página de modelo de mradermacher para descargas: https://hf.tst.eu/model#Melody1437-35B-A3B-i1-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
