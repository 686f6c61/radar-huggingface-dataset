# b3r5erk/LFM2.5-1.2B-Instruct-GGUF

## Resumen

LFM2.5-1.2B-Instruct es un modelo de lenguaje de 1.170.340.608 parámetros (aproximadamente 1,17 mil millones) desarrollado por Liquid AI, diseñado específicamente para despliegue en dispositivos de borde (edge). Forma parte de la familia LFM2.5, que según el autor construye sobre la arquitectura LFM2 con preentrenamiento extendido y aprendizaje por refuerzo. El modelo está optimizado para ejecutarse en hardware con recursos limitados, como teléfonos móviles, portátiles sin GPU dedicada o dispositivos embebidos.

La versión aquí descrita es una cuantización GGUF publicada por el usuario b3r5erk, derivada del checkpoint original `LiquidAI/LFM2.5-1.2B-Instruct`. El repositorio incluye pesos en formato GGUF compatibles con llama.cpp, además de los pesos fuente en safetensors para la variante QAD (Quantization-Aware Distillation). El modelo soporta ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y está etiquetado como conversacional y compatible con endpoints.

Su relevancia radica en la combinación de un tamaño reducido con soporte multilingüe y una licencia específica (lfm1.0) que condiciona el uso comercial. La disponibilidad de una variante QAD Q4_0 busca preservar la calidad del modelo original tras la cuantización, un aspecto crítico cuando se opera con presupuestos de memoria muy ajustados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (familia LFM2.5, según el autor; detalles específicos no disponibles) |
| Parámetros totales | 1.170.340.608 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_0 (post-entrenamiento) y QAD Q4_0 (Quantization-Aware Distillation) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El autor describe LFM2.5 como una familia de modelos híbridos construida sobre la arquitectura LFM2, con preentrenamiento extendido y aprendizaje por refuerzo (reinforcement learning). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles concretos del proceso de RLHF o DPO. La naturaleza "híbrida" sugiere una combinación de mecanismos de atención, pero no se detalla si se trata de atención lineal, SSM o una mezcla de transformadores con componentes recurrentes.

La innovación técnica destacable es la inclusión de un checkpoint QAD (Quantization-Aware Distillation) en formato Q4_0, distinto de la cuantización post-entrenamiento estándar Q4_0. Este enfoque busca que el modelo cuantizado a 4 bits mantenga un comportamiento más cercano al original. Los pesos fuente QAD en FP32 están disponibles en el subdirectorio `qad/` del repositorio, pensados para fine-tuning y experimentación; el autor advierte que los resultados publicados de QAD aplican al GGUF Q4_0 y que la inferencia directa en FP32/BF16 u otros formatos de cuantización puede comportarse de forma diferente.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida.
- Soporte multilingüe en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Ejecución en llama.cpp mediante `llama-cli`, con parámetros de generación recomendados (`--temp 0.1 --top-k 50 --repeat-penalty 1.05`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Carga en Transformers mediante `AutoModelForCausalLM` y `AutoTokenizer` usando `subfolder="qad"` para los pesos fuente.
- Capacidades de razonamiento, código, matemáticas, tool calling o agentes: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo, con 1,17 mil millones de parámetros y cuantización Q4_0, puede ejecutarse localmente en un teléfono mediante llama.cpp, permitiendo conversaciones multi-turno sin conexión a la nube.
- Procesamiento de texto en el borde para aplicaciones de privacidad: al ejecutarse en el dispositivo, los datos del usuario no abandonan el hardware local, lo que resulta adecuado para aplicaciones sensibles como notas personales o asistencia sanitaria básica.
- Atención al cliente embebida en aplicaciones de escritorio: integrable mediante llama.cpp en clientes ligeros, gestionando respuestas en varios idiomas (en, es, fr, de, etc.) sin depender de una API externa.
- Traducción y generación multilingüe en entornos sin conectividad: el soporte de ocho idiomas permite tareas de traducción o redacción en dispositivos aislados, como equipos de campo o sistemas de punto de venta.
- Prototipado rápido de aplicaciones de IA generativa: los pesos QAD en safetensors permiten fine-tuning y experimentación en Transformers, útil para investigadores que necesitan iterar sobre un modelo pequeño antes de escalar.
- Filtrado y clasificación de texto en pipelines locales: con un modelo de 1,17B parámetros, se puede desplegar en servidores modestos o contenedores para tareas de moderación o etiquetado sin GPU de gama alta.
- Educación y demos interactivas: su tamaño reducido y la disponibilidad de GGUF facilitan su uso en entornos docentes donde se enseña inferencia local con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1,17B parámetros, una cuantización Q4_0 ocupa aproximadamente 0,6-0,7 GB en pesos, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: el modelo está diseñado para edge y se ejecuta mediante llama.cpp, lo que sugiere compatibilidad con CPU y GPU de consumo, pero no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (documentado con `llama-cli`), Transformers (para los pesos QAD en safetensors con `subfolder="qad"`). vLLM, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, existe riesgo inherente.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; el soporte se limita a los ocho idiomas listados (en, ar, zh, fr, de, ja, ko, es).
- Restricciones de licencia: la licencia es `lfm1.0` (other), lo que condiciona el uso comercial; es necesario revisar el archivo LICENSE del repositorio original para conocer los términos exactos.
- Caveat de cuantización: el autor advierte que los resultados publicados de QAD aplican al GGUF Q4_0 y que la inferencia directa en FP32/BF16 u otros formatos de cuantización puede comportarse de forma diferente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente (creada y actualizada el 2026-11-21) sin validación comunitaria.
- El tamaño del repositorio (14,5 GB) incluye múltiples artefactos (GGUF, safetensors QAD y posiblemente otros), por lo que conviene seleccionar el archivo concreto antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/b3r5erk/LFM2.5-1.2B-Instruct-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- GGUF original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/blob/main/LFM2.5-1.2B-Instruct-QAD-Q4_0.gguf
- Pesos fuente QAD (safetensors): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/tree/main/qad
- Documentación del checkpoint fuente QAD: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/blob/main/qad/README.md
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Contacto comercial de Liquid AI: https://www.liquid.ai/contact
