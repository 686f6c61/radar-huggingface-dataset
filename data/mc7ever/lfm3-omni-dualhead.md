# MC7ever/lfm3-omni-dualhead

## Resumen

LFM3-Omni Dual-Head es un modelo multimodal de tipo "dual-head" publicado por el usuario MC7ever (citado en la model card como JonusNattapong) que combina dos cabezas sobre un tronco compartido: una cabeza de decisión no autorregresiva (System 1) derivada de `LiquidAI/d1-Omni-2B` y una cabeza generativa autorregresiva (System 2) derivada de `LiquidAI/LFM3-Omni-2B`. La propuesta resuelve el problema de tener que cargar dos modelos de ~2,2B en memoria para cubrir tanto la clasificación/enrutamiento instantáneo como la generación conversacional, unificándolos en un único objeto con pesos compartidos.

El tronco es el LFM3-Omni de Liquid AI, descrito en la model card como una arquitectura "tri-híbrida" que combina convoluciones cortas con compuerta (gated short convolutions), atención de ventana deslizante y atención global. El modelo acepta entradas de texto, imagen (224x224) y audio (16 kHz mono), y expone dos APIs: `.system_one(...)` para decisiones tipadas en un solo paso forward y `.generate(...)` para generación de texto y voz.

Los pesos publicados en safetensors suman 75.047.552 parámetros (unos 75M), un dato que contrasta con las referencias a "~2,1B" del tronco y a "2,2B" de los modelos base que aparecen en la model card; esta discrepancia debe tenerse en cuenta al planificar el despliegue. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido "tri-híbrido" (gated short convolutions + sliding-window attention + global attention) con dos cabezas: decisión no autorregresiva (System 1) y generación autorregresiva (System 2) |
| Parametros totales | 75.047.552 según safetensors del repo; la model card menciona un tronco de ~2,1B y modelos base de 2,2B (dato no coincidente) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16/FP32 por defecto; 4-bit (GGUF/AWQ) mencionado en la model card |
| Idiomas soportados | en, th |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura se apoya en el tronco LFM3-Omni de Liquid AI, que según la model card emplea un esquema tri-híbrido: convoluciones cortas con compuerta para capturar dependencias locales, atención de ventana deslizante para contexto de medio alcance y atención global para dependencias largas. Sobre ese tronco se montan dos cabezas: una cabeza de decisión (procedente de `d1-Omni-2B`) que produce salidas tipadas —booleanos, elecciones entre opciones, números con rango y paso— en un único paso forward sin generar tokens, y una cabeza de lenguaje (procedente de `LFM3-Omni-2B`) que genera texto y voz de forma autorregresiva. La model card afirma que los tensores de proyección se comparten en memoria mediante vistas, evitando duplicación de pesos.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado adicional para la combinación dual-head. El modelo se presenta como un trabajo de integración sobre pesos preentrenados de Liquid AI, no como un entrenamiento desde cero. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema tri-híbrido descrito.

## Capacidades

- Generación de texto autorregresiva mediante `.generate(...)`, con soporte declarado para texto y voz de salida.
- Toma de decisiones no autorregresiva mediante `.system_one(...)`: clasificación y enrutamiento en un solo paso forward, sin tokens de salida.
- Salidas tipadas en System 1: elección entre opciones (`choice`), booleanos (`boolean`) y números con rango y paso (`number`).
- Procesamiento multimodal de imagen a 224x224 píxeles para decisiones visuales (por ejemplo, detección de recibos o puntuación de calidad).
- Procesamiento de audio a 16 kHz mono para enrutamiento de eventos sonoros (detección de habla, conteo de hablantes).
- Capacidades multilingües limitadas a inglés (en) y tailandés (th).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: usar `.system_one()` con preguntas de tipo `choice` y `boolean` para clasificar intención y urgencia de un mensaje entrante en un solo paso forward, sin coste de generación de tokens, integrándolo como preprocesador de un sistema de ticketing.
- Enrutamiento de eventos en tiempo real: la model card cita decisiones por debajo de 50 ms, adecuadas para clasificar eventos (por ejemplo, fallos de webhook de pago) y dirigirlos al equipo correcto antes de invocar un modelo generativo mayor.
- Verificación documental con imagen: recibir una foto de un recibo redimensionada a 224x224 y responder preguntas booleanas o numéricas (presencia de recibo, puntuación de calidad) para automatizar la validación en flujos de gastos.
- Análisis de audio para moderación o metadatos: dado un clip de 16 kHz mono, determinar si contiene habla y estimar el número de hablantes, útil para indexación o filtrado previo de grabaciones.
- Asistente conversacional bilingüe inglés-tailandés: emplear `.generate()` para respuestas de chat en esos dos idiomas en entornos de atención al cliente del sudeste asiático.
- Despliegue en dispositivos de borde: la model card indica que en 4-bit ocupa ~1,8 GB, lo que permitiría ejecutarlo en Raspberry Pi 5, NPU de borde o dispositivos móviles para tareas de clasificación local sin conexión.
- Prefiltro en pipelines RAG o de agentes: usar System 1 para decidir si una consulta requiere recuperación o generación antes de invocar el modelo generativo, reduciendo latencia y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~4,5 GB en BF16/FP32 según la model card; ~1,8 GB en cuantización 4-bit (GGUF/AWQ).
- GPU recomendadas por el autor: NVIDIA RTX 3060 o RTX 4060 (8 GB o más); Mac con chip M1-M4 y 8 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, según la model card, en tarjetas de 8 GB o más en BF16 y en dispositivos de borde en 4-bit.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito indicado); la model card menciona GGUF y AWQ para cuantización, aunque no detalla integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card afirma decisiones por debajo de 50 ms para System 1; no se aportan cifras de throughput para `.generate()`.
- Nota: los 75M de parámetros reales en safetensors frente a los ~2,1B-2,2B citados en la model card implican que las estimaciones de VRAM deben verificarse empíricamente antes de dimensionar infraestructura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni Dual-Head (MC7ever) | 75M en safetensors (model card cita ~2,1B de tronco) | no disponible | Texto, imagen, audio | Apache 2.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Omni-2B | ~2,2B (según model card) | no disponible | Texto, imagen, audio (omni) | no disponible en la información | Hugging Face (Liquid AI) |
| LiquidAI/d1-Omni-2B | ~2,2B (según model card) | no disponible | Texto, imagen, audio; salida de decisión | no disponible en la información | Hugging Face (Liquid AI) |

La comparativa se limita a los modelos base citados, ya que no se dispone de datos de rendimiento ni de especificaciones completas de alternativas de la misma categoría (modelos omni de ~2B con cabeza de decisión). No se dispone de benchmarks que permitan comparar calidad frente a ellos.

## Limitaciones y advertencias

- Discrepancia de parámetros: el safetensors del repo declara 75.047.552 parámetros, mientras que la model card describe un tronco de ~2,1B y modelos base de 2,2B; conviene auditar los pesos antes de asumir capacidades de un modelo de 2B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card cita una URL de carga distinta (`JonusNattapong/lfm3-omni-dualhead`) de la del repo (`MC7ever/lfm3-omni-dualhead`), lo que sugiere un trabajo derivado no validado por la comunidad.
- `inference: false` en los metadatos de la model card: no se garantiza que la inferencia funcione de serie con la configuración publicada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; debe revisarse antes de usarlo en producción.
- Idiomas limitados a inglés y tailandés; no se declara soporte de castellano.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad; al ser un modelo derivado sin benchmarks publicados, el riesgo de comportamiento impredecible en dominios abiertos es alto.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base de Liquid AI deben verificarse de forma independiente, ya que la model card no las detalla.
- Las cifras de VRAM (~4,5 GB en BF16, ~1,8 GB en 4-bit) y de latencia (<50 ms) provienen únicamente de la model card y no están respaldadas por mediciones publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MC7ever/lfm3-omni-dualhead
- Modelo base generativo: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Modelo base de decisión: https://huggingface.co/LiquidAI/d1-Omni-2B
- Organización Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
