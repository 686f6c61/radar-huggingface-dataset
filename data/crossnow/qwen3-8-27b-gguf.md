# CrossNow/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es la última incorporación a la familia Qwen3.8 de Alibaba, presentada como el modelo abierto más capaz de la serie hasta la fecha. Se trata de un modelo denso de 27 000 millones de parámetros que combina un codificador de visión con un modelo de lenguaje causal, lo que le permite procesar tanto texto como imágenes y vídeo de forma nativa. Desarrollado sobre la base arquitectónica de Qwen3.5, incorpora mejoras sustanciales en tareas de programación, trabajo profesional, investigación y ejecución de agentes autónomos de largo alcance.

La versión GGUF distribuida por CrossNow utiliza la técnica de cuantización dinámica de Unsloth (Dynamic V3.0) para ofrecer un rendimiento de inferencia optimizado. El modelo destaca por su ventana de contexto nativa de 262 144 tokens, ampliable hasta 1 000 000 mediante escalado RoPE, y por su modo de pensamiento (thinking) activado por defecto, que puede desactivarse por petición. Con licencia Apache 2.0, es una opción atractiva para despliegues comerciales y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de visión; combinación de Gated DeltaNet (atención lineal) y Gated Attention (atención completa) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 con escalado RoPE (p. ej., YaRN) |
| Tipos de cuantizacion | No disponible (repositorio GGUF con múltiples cuantizaciones; el tamaño total del repo es de 726 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización dinámica Unsloth Dynamic V3.0) |

## Arquitectura y entrenamiento

Qwen3.8-27B presenta una arquitectura híbrida que combina dos tipos de atención. Por un lado, utiliza Gated DeltaNet, una variante de atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza de 128. Por otro lado, incorpora Gated Attention completa con 24 cabezas para Q y 4 para KV, dimensión de cabeza de 256 y codificación posicional rotatoria (RoPE) de dimensión 64. La configuración de capas sigue el patrón: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con un total de 64 capas. La dimensión oculta es de 5120 y la capa de salida tiene un embedding de 248 320 tokens (con padding). Incluye además predicción multitoken (MTP) entrenada con múltiples pasos, lo que acelera la inferencia.

El entrenamiento se realizó en dos etapas: preentrenamiento y postentrenamiento, aunque no se han publicado detalles específicos sobre el volumen de tokens ni la composición del dataset. El modelo soporta un modo de razonamiento (thinking) activado por defecto, con control de profundidad mediante el parámetro `reasoning_effort` y conservación del contexto de razonamiento histórico mediante `preserve_thinking`. También se han introducido mejoras en el parseo de objetos anidados para el tool calling, lo que incrementa la fiabilidad en tareas de agente.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento activable o desactivable por petición.
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Soporte de tool calling / function calling mejorado, con parseo de objetos anidados.
- Capacidades de agente autónomo: planificación, manejo de feedback del entorno y ejecución de tareas de largo alcance.
- Predicción multitoken (MTP) para inferencia más rápida.
- Ventana de contexto muy amplia (262K nativa, extensible a 1M), adecuada para documentos extensos y conversaciones largas.
- Compatibilidad con frameworks y herramientas de desarrollo populares (harness, agentes como Codex, etc.).

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, el modelo puede mantener conversaciones multi-turno extensas recordando todo el historial, y su modo de razonamiento permite elaborar respuestas matizadas. La licencia Apache 2.0 facilita su integración en productos comerciales.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código. Su capacidad de visión permite además interpretar capturas de pantalla o diagramas de arquitectura.
- Análisis de documentos largos: el contexto nativo de 262K tokens permite procesar informes, contratos o artículos científicos completos sin truncamiento, con respuestas basadas en el contenido íntegro.
- Asistentes de investigación: puede razonar sobre múltiples fuentes, combinar información visual (tablas, gráficos) y textual, y generar resúmenes o hipótesis. Su modo de pensamiento profundo es útil para tareas de análisis complejo.
- Agentes autónomos de navegación web o uso de herramientas: gracias a su soporte de tool calling y planificación mejorada, puede ejecutar tareas de varios pasos, como reservar citas, rellenar formularios o interactuar con APIs.
- Anotación y análisis de vídeo: su capacidad de comprensión de vídeo (hasta una hora) permite transcribir, resumir o extraer información de contenido audiovisual, útil para archivado o moderación de contenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: según la documentación de Unsloth, el modelo puede ejecutarse localmente con 17 GB de RAM/VRAM en configuraciones cuantizadas. Para la cuantización Q4_K_M (típica en GGUF), se estima un consumo de VRAM en torno a 16-18 GB.
- GPU recomendadas: para cuantizaciones de 4 bits, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) es suficiente. Para cuantizaciones de 8 bits o mayor precisión, se necesitan GPUs con 48 GB o más (A6000, A100, H100).
- Sí cabe en GPUs de consumo (RTX 3090/4090) con cuantizaciones de 4 bits o inferiores.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM, TGI y Unsloth Desktop (para Mac, Windows y Linux). También es compatible con endpoints estándar.
- Latencia y throughput: no se dispone de datos concretos, pero la predicción multitoken (MTP) y la atención lineal (Gated DeltaNet) contribuyen a reducir la latencia en comparación con modelos puramente atencionales del mismo tamaño.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas directas publicadas en la información proporcionada. Como referencia cualitativa, Qwen3.8-27B se posiciona frente a otros modelos densos de ~27B como Llama 3.1 8B (menor tamaño) o Qwen3.5-27B (generación anterior), pero sin cifras objetivas no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado detalles sobre los datos de entrenamiento ni sobre posibles sesgos; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- Riesgo de alucinación inherente a los modelos generativos; el modo de pensamiento puede mitigarlo parcialmente pero no eliminarlo.
- El contexto de 262K tokens es nativo, pero el uso de extensiones como YaRN puede degradar ligeramente la calidad en longitudes extremas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar el cumplimiento de las condiciones de atribución.
- El repositorio GGUF de CrossNow tiene 0 descargas y 0 likes; se recomienda verificar la integridad de los archivos y la procedencia antes de su uso.
- No se especifican los idiomas soportados; aunque Qwen suele cubrir múltiples lenguas, es necesario validar el comportamiento en el idioma objetivo.

## Enlaces

- Repositorio HuggingFace de CrossNow: https://huggingface.co/CrossNow/Qwen3.8-27B-GGUF
- Repositorio HuggingFace de Unsloth (versión original): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
