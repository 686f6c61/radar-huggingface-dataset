# bu7umaid/Qwen3.8-Flash-Next-Uncensored-TensorFold-MTP

## Resumen

Qwen3.8-Flash-Next-Uncensored-TensorFold-MTP es una derivación no oficial del modelo Qwen3.8-Flash-Next, publicada por el usuario bu7umaid en Hugging Face. Se trata de una versión "abliterated" (sin censura) del checkpoint intermedio orcarouter/Qwen3.8-Flash-Next-Uncensored, posteriormente convertida al formato TensorFold y cuantizada a 4 bits para su ejecución con la librería MLX de Apple. El modelo conserva la pipeline image-text-to-text, por lo que acepta entradas multimodales de imagen y texto, y añade soporte MTP (multi-token prediction) según indica su nombre.

Con aproximadamente 180.000 millones de parámetros totales y un repositorio de 116,7 GB, se posiciona en la gama alta de modelos abiertos. Su relevancia radica en tres factores: la eliminación de los mecanismos de rechazo del modelo original (uncensored/abliterated), la disponibilidad de pesos en 4 bits para hardware con memoria limitada, y la integración con el motor Zig de TensorFold, que permite servir el modelo en una única GPU profesional. No obstante, el acceso está restringido (gated) y la licencia qwen-community-1.0 impone condiciones específicas para uso comercial.

El modelo solo declara soporte para inglés y chino, y no cuenta con descargas ni valoraciones en el momento de redactar esta ficha, lo que refleja su carácter muy reciente y de nicho. No se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento o ablación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), variante Qwen4 con soporte MTP; no se detalla si es MoE o densa |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (acceso restringido, gated) |
| Formato de pesos | safetensors (MLX, TensorFold) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: se trata de un transformer multimodal de la familia Qwen4, con pipeline image-text-to-text y una variante denominada "TensorFold" que hace referencia al motor de inferencia en Zig utilizado para su despliegue. El sufijo "MTP" indica soporte de multi-token prediction, una técnica que permite predecir varios tokens por paso de decodificación para aumentar el throughput. El modelo es una versión "abliterated" del checkpoint orcarouter/Qwen3.8-Flash-Next-Uncensored, lo que implica que se han eliminado o atenuado las direcciones de activación asociadas al rechazo de contenido, aunque no se especifica la metodología exacta de ablación empleada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá del mencionado MTP. El repositorio incluye únicamente pesos en 4 bits para MLX, sin versiones en precisión completa ni GGUF.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), incluyendo según la documentación del motor TensorFold entrada de vídeo en el despliegue asociado.
- Razonamiento multi-turno en formato conversacional.
- Multi-token prediction (MTP) para acelerar la decodificación.
- Modo "uncensored": ausencia de mecanismos de rechazo ante contenido sensible, orientado a usos de investigación y generación sin restricciones.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente en la información disponible.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando sus respuestas con las del Qwen3.8-Flash-Next original para analizar el efecto de la ablación en sesgos y tasas de cumplimiento.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde los modelos alineados suelen rechazar la petición.
- Análisis de imágenes en flujos de trabajo locales: al ser multimodal y ejecutable con MLX en hardware Apple, puede emplearse para describir imágenes, extraer texto de capturas o responder preguntas visuales sin enviar datos a la nube.
- Despliegue en una única GPU profesional: el motor TensorFold permite servir el modelo en una RTX PRO 6000 Blackwell (96 GB) mediante API compatible con OpenAI, adecuado para prototipos internos con requisitos de privacidad.
- Experimentación con cuantización 4-bit en Apple Silicon: sirve como banco de pruebas para evaluar la pérdida de calidad de la cuantización MLX en un modelo de 180 B parámetros.
- Evaluación comparativa de motores de inferencia: permite medir throughput y latencia de TensorFold frente a otras soluciones (vLLM, llama.cpp) en el mismo checkpoint.
- Generación de contenido en chino e inglés: útil para tareas de traducción o redacción bilingüe en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al estar cuantizado a 4 bits, los ~180 B parámetros ocupan aproximadamente 90 GB de pesos, más overhead de contexto y activaciones; se recomienda un mínimo de 96 GB de memoria unificada o VRAM.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB), según el repositorio de TensorFold; A100 80 GB y H100 80 GB quedan por debajo del umbral estimado para los pesos en 4 bits.
- Apple Silicon: al usar MLX, requiere un Mac con memoria unificada de al menos 96 GB (por ejemplo, Mac Studio M2 Ultra o M3 Ultra con 96-192 GB).
- No cabe en GPUs de consumo convencionales (RTX 4090 24 GB, RTX 5090 32 GB) sin técnicas de offloading agresivas.
- Opciones de despliegue: motor TensorFold (Zig) con API compatible con OpenAI; MLX para ejecución local en Apple Silicon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-TensorFold-MTP (este) | ~180 B | no disponible | Sí (imagen-texto) | qwen-community-1.0 (gated) | Hugging Face, MLX 4-bit |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible en la búsqueda | no disponible | Sí (image-text-to-text) | no disponible | Hugging Face |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base directo) | no disponible | no disponible | Sí | no disponible | Hugging Face |

No se dispone de datos suficientes sobre parámetros, contexto o rendimiento de las alternativas para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente sensible; no apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo elevado de alucinación, agravado por la cuantización a 4 bits y por la ausencia de benchmarks publicados que validen su calidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Licencia qwen-community-1.0 con acceso restringido: es necesario aceptar condiciones en Hugging Face y revisar las cláusulas de uso comercial antes de desplegarlo en producción.
- Longitud de contexto no documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria, sin garantías de mantenimiento y con riesgo de que los pesos presenten defectos de conversión.
- Requiere hardware de gama muy alta (96 GB o más), lo que limita su uso a entornos con infraestructura especializada.
- El soporte de tool calling y agentes no está confirmado, por lo que no debe asumirse en pipelines automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/bu7umaid/Qwen3.8-Flash-Next-Uncensored-TensorFold-MTP
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio TensorFold para RTX PRO 6000: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-RTX-PRO-6000-TernsorFold
