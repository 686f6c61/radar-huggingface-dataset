# Chungulus/Qwen3.8-27B-Q8_0-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal (texto e imagen) desarrollado por Qwen, con una arquitectura densa de 27 320 millones de parámetros y una ventana de contexto nativa de 262 144 tokens. Este repositorio concreto contiene una cuantización GGUF en Q8_0 del modelo original, realizada por Chungulus mediante llama.cpp, sin modificaciones sobre los pesos fuente. El modelo combina una estructura híbrida de atención completa con capas Gated DeltaNet, una torre de visión con proyector propio, y soporte para razonamiento configurable y tool calling.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 27B con capacidades de visión y razonamiento en hardware de consumo, con un requisito de memoria aproximado de 33 GB para la versión Q8_0. El modelo base se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en pipelines de producción. La cuantización Q8_0 conserva la mayor parte de la calidad del modelo original, aunque con una huella de memoria mayor que cuantizaciones más agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet y atención completa, con torre de visión y proyector multimodal |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q8_0 (este repositorio); otras cuantizaciones disponibles en repositorios asociados |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con proyector de visión en F16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención completa con capas basadas en Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en contextos largos. Incluye además una torre de visión independiente y un proyector multimodal (mmproj) que permite procesar imágenes y vídeo. El repositorio conserva los tensores MTP (multi-token prediction) del modelo original, aunque no se anuncia aceleración especulativa en esta cuantización.

La cuantización Q8_0 se realizó con llama.cpp (revisión `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`) sobre los pesos fuente fijados en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. No se aplicó calibración para los K-quants, y se usaron prompts locales representativos donde era necesario para la conversión IQ. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni los métodos de alineación (RLHF, DPO, etc.) del modelo original.

## Capacidades

- Generación de texto y razonamiento: soporta modos de pensamiento configurables mediante los controles `enable_thinking`, `reasoning_effort` y `preserve_thinking`.
- Comprensión de imágenes y vídeo: el proyector multimodal permite procesar entradas visuales, validado con tres casos de imagen local deterministas.
- Tool calling: soporta el formato nativo de llamada a herramientas de Qwen, validado con cinco casos de prueba.
- Capacidades de agente: apto para tareas de razonamiento multi-paso y uso de herramientas en entornos agénticos.
- Multilingüismo: no se especifican los idiomas soportados en la documentación disponible.
- Estructura híbrida: combina atención completa y Gated DeltaNet, lo que puede ofrecer ventajas de eficiencia en contextos largos.

## Casos de uso

- Atención al cliente automatizada: con 262 144 tokens de contexto, el modelo puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo y el estado de la interacción sin truncamientos.
- Generación de código en producción: su soporte de tool calling permite integrarlo en pipelines de CI/CD para generar, revisar o documentar código, invocando herramientas externas cuando sea necesario.
- Análisis de documentos con imágenes: al combinar visión y texto, puede extraer información de capturas de pantalla, diagramas o formularios escaneados, útil en entornos de oficina o soporte técnico.
- Asistentes de investigación: el razonamiento configurable y el contexto largo permiten procesar artículos extensos, resumir secciones y responder preguntas complejas sobre el contenido.
- Agentes autónomos de navegación web: con tool calling y razonamiento multi-paso, puede planificar y ejecutar acciones en entornos simulados o reales, como rellenar formularios o consultar APIs.
- Despliegue local en hardware de consumo: la cuantización Q8_0, con ~33 GB de memoria, permite ejecutar el modelo en estaciones de trabajo con una GPU de 24 GB o dos GPUs en paralelo, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único dato de rendimiento es una velocidad de generación de 8,95 tokens por segundo medida en el host de validación durante las pruebas de humo, aunque no se especifica el hardware utilizado.

## Requisitos de hardware

- Memoria estimada: aproximadamente 33 GB para el modelo Q8_0, el proyector de visión y el overhead de ejecución. La memoria de caché KV crece con la longitud del contexto.
- GPU recomendadas: para Q8_0 se necesita al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A6000) o dos GPUs de 16 GB en paralelo. Con cuantizaciones más bajas (Q4, Q5) el modelo puede caber en 17 GB de VRAM, según fuentes externas.
- Compatibilidad con GPU de consumo: sí, siempre que se cumpla el requisito de memoria. En configuraciones de 24 GB es viable.
- Opciones de despliegue: llama.cpp (con el binario `llama-mtmd-cli`), Ollama, LM Studio y otros runners compatibles con GGUF. También se puede usar vLLM si se convierte a safetensors.
- Latencia y throughput: la velocidad medida en el host de validación fue de 8,95 tokens/s, pero depende del hardware y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoría. El modelo base Qwen3.8-27B es un denso de 27B con visión y contexto de 262K, lo que lo sitúa en un segmento similar a otros modelos multimodales de tamaño medio, pero no se han encontrado benchmarks comparativos en las fuentes consultadas. Se recomienda consultar el repositorio oficial de Qwen para obtener métricas actualizadas.

## Limitaciones y advertencias

- La cuantización Q8_0 puede reducir ligeramente la calidad del modelo en comparación con los pesos originales en precisión completa, especialmente en tareas de razonamiento complejo.
- El contexto máximo de 262 144 tokens no fue probado en la validación; el prompt más largo utilizado fue de 73 tokens, por lo que el comportamiento en contextos extremos no está garantizado.
- El runtime debe soportar la arquitectura híbrida (Gated DeltaNet + atención completa), la torre de visión, el tokenizer y los metadatos MTP. No basta con cargar únicamente el tensor de lenguaje.
- No se especifican los idiomas soportados, lo que limita la confianza en despliegues multilingües sin pruebas adicionales.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución del modelo base.
- No se han documentado sesgos específicos, pero al ser un modelo de lenguaje general, puede presentar alucinaciones o respuestas inexactas en dominios especializados.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-Q8_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado con validación: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Análisis de requisitos de hardware (ofox): https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
