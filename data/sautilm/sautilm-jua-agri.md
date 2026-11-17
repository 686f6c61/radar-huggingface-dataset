# sautilm/SautiLM-Jua-Agri

## Resumen

SautiLM-Jua-Agri es un modelo de lenguaje de generación de texto desarrollado por LosingTek Research para el proyecto SautiLM, con sede en Bunia (Ituri, República Democrática del Congo). Se trata de un ajuste fino de Google Gemma 3 de 270 millones de parámetros en su variante instruction-tuned (`google/gemma-3-270m-it`), especializado en agronomía y protección de cultivos. El modelo está diseñado para ejecutarse íntegramente en smartphones Android sin conexión a internet, mediante el runtime LiteRT-LM de Google.

La propuesta diferencial no es el rendimiento bruto, sino el despliegue: el modelo se distribuye empaquetado en formato `.litertlm` (272,36 MB) con cuantización dinámica `dynamic_wi8_afp32`, lo que permite inferencia local en dispositivos con 2 GB de RAM y CPU ARM Cortex-A53/A55. Forma parte de una familia modular (SautiLM-Jua) con especialidades separadas en STEM, lexicografía, medicina comunitaria, derecho congoleño, finanzas cooperativas, estado civil, visión OCR y voz.

El ajuste se realizó con LoRA supervisado sobre un corpus muy reducido de 86 instrucciones verificadas, con enmascaramiento de pérdida solo en la respuesta. Es relevante como ejemplo de adaptación de un modelo base pequeño a un dominio concreto y a un contexto de conectividad limitada, aunque su volumen de entrenamiento y ausencia de benchmarks publicados limitan cualquier evaluación de calidad más allá de la verificación de ejecución del runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM), 18 capas, `hidden_size=640` |
| Parámetros totales | 270 M (modelo base Gemma 3 270M-IT) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (`cache_length=2048`) |
| Tipos de cuantización | `dynamic_wi8_afp32` (pesos int8 dinámicos, activaciones fp32) vía `litert-torch`; exportación a TFLite FlatBuffer (Prefill/Decode) |
| Idiomas soportados | Francés (fr), inglés (en), suajili (sw) |
| Licencia | Gemma (términos de uso de Google Gemma) |
| Formato de pesos | `.litertlm` (contenedor LiteRT-LM, 272,36 MB); repo con safetensors |
| Identificador | `sautilm/SautiLM-Jua-Agri` |
| Corpus de entrenamiento | 86 instrucciones verificadas sin fuga de datos |
| Entrenamiento | LoRA `r=32, alpha=64`, enmascaramiento de pérdida solo en respuesta, 130 pasos, pérdida final 0,0020 |
| Runtime objetivo | LiteRT-LM; Flutter (`flutter_edge_ai`, `flutter_edge_ai_litertlm`) |
| Hardware mínimo | Android 8.0+ (API 26+), 2 GB RAM, CPU ARM Cortex-A53/A55 o GPU móvil |
| Verificación | 8/8 en runtime LiteRT-LM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 en su variante de 270 M de parámetros: un transformer decoder-only con 18 capas, dimensión oculta de 640 y ventana de contexto de 2048 tokens. Sobre esta base se aplicó un ajuste fino supervisado con LoRA de rango 32 y alpha 64, enmascarando la pérdida para que solo se calculara sobre los tokens de respuesta y no sobre la instrucción. El entrenamiento constó de 130 pasos sobre 86 instrucciones verificadas, con una pérdida final reportada de 0,0020.

La innovación técnica principal no está en el entrenamiento sino en el pipeline de despliegue: el modelo se compila con `litert-torch` de Google a un contenedor `.litertlm` con cuantización dinámica de pesos a int8 y activaciones en fp32, generando grafos TFLite separados para prefill y decode junto con el tokenizador de Hugging Face. No se documenta uso de RLHF, DPO ni datos de preferencia; el ajuste es puramente SFT sobre un conjunto pequeño y curado. Tampoco se especifica la composición del corpus más allá del recuento de instrucciones.

## Capacidades

- Generación de texto en francés, inglés y suajili, con foco declarado en agronomía y protección de cultivos.
- Respuesta a instrucciones de dominio agrícola (el corpus de ajuste son 86 instrucciones de agronomía).
- Ejecución 100 % offline en Android mediante LiteRT-LM, sin llamadas a red.
- Integración con Flutter a través de los paquetes `flutter_edge_ai` y `flutter_edge_ai_litertlm`.
- Formato de pesos optimizado para inferencia en CPU ARM y GPU móvil.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en esta variante. La visión OCR se reserva a otra variante de la familia (SautiLM-Jua-Vision) y la visión por píxeles a SautiLM-Nuru.

## Casos de uso

- Asistencia agronómica offline en campo: un técnico agrícola en zonas sin cobertura consulta al modelo desde una app Flutter sobre identificación de plagas y prácticas de protección de cultivos, aprovechando que el bundle de 272 MB cabe en el almacenamiento de un móvil de gama media.
- Extensión agrícola en zonas rurales de la RDC: uso en dispositivos Android de 2 GB de RAM con CPU Cortex-A53/A55 para responder consultas básicas en francés o suajili sin coste de datos.
- Formación de cooperativas agrícolas: el modelo puede actuar como apoyo en sesiones de capacitación sobre manejo de cultivos, con respuestas generadas localmente y sin dependencia de servidores externos.
- Integración en aplicaciones de socios (Gemmea): el contenedor `.litertlm` y los paquetes Flutter permiten incrustar el modelo en apps existentes de agronomía para añadir un asistente conversacional embebido.
- Prototipado de asistentes de dominio en contextos de conectividad intermitente: sirve como base para validar flujos de instrucción-respuesta antes de escalar a modelos mayores o a variantes de la familia con más datos.
- Demostración de pipelines LiteRT-LM en producción móvil: útil para equipos que evalúan el empaquetado `dynamic_wi8_afp32` y el rendimiento de prefill/decode en Android antes de adoptar la herramienta en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la verificación de ejecución en runtime LiteRT-LM (8/8) y la pérdida final de entrenamiento (0,0020), que no constituyen una evaluación de calidad del modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 2 GB de RAM mínimos en el dispositivo Android según la model card; el bundle ocupa 272,36 MB en almacenamiento.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el objetivo es CPU ARM Cortex-A53/A55 o GPU móvil integrada.
- Compatibilidad con GPU de consumo: el modelo está pensado para ejecución en smartphone, no para GPU de escritorio; no se documenta despliegue en RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT-LM (runtime oficial), Flutter mediante `flutter_edge_ai` y `flutter_edge_ai_litertlm`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| SautiLM-Jua-Agri | 270 M | 2048 | fr, en, sw | Gemma | LiteRT-LM, Android offline | Ajuste LoRA sobre 86 instrucciones; sin benchmarks publicados |
| google/gemma-3-270m-it | 270 M | 2048 (según base) | Multilingüe (según base) | Gemma | Múltiples runtimes (no documentado aquí para LiteRT) | Modelo base instruction-tuned; sin especialización de dominio |
| SautiLM-Jua (variante base) | 270 M | 2048 | fr, en, sw | Gemma | LiteRT-LM | Modelo fundacional offline multi-dominio de la misma familia |
| SautiLM-Jua-STEM | 270 M | 2048 | fr, en | Gemma | LiteRT-LM | Especialización en matemáticas, física, química y biología |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada; los únicos modelos comparables documentados son variantes de la propia familia SautiLM-Jua.

## Limitaciones y advertencias

- Corpus de ajuste extremadamente reducido (86 instrucciones, 130 pasos): alta probabilidad de sobreajuste y de respuestas pobres fuera de las instrucciones vistas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento ni precisión factual.
- Riesgo elevado de alucinación en un modelo de 270 M con contexto de 2048 tokens, especialmente en consultas agronómicas que requieran precisión técnica.
- Cobertura idiomática limitada a francés, inglés y suajili; no se documenta el rendimiento en lenguas locales como el kilendu (bbadha) pese a la mención en la familia.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de integrar el modelo en productos.
- El modelo está empaquetado para LiteRT-LM y Android; no se documenta su uso en servidores, GPU de escritorio ni otros runtimes, lo que limita su reutilización fuera del ecosistema móvil.
- La pérdida final de 0,0020 sobre 86 instrucciones no es indicativa de generalización; no debe interpretarse como medida de rendimiento.
- No se documentan sesgos específicos, pero al derivar de Gemma 3 hereda los sesgos del modelo base y de sus datos de preentrenamiento.
- La model card menciona verificación 8/8 en runtime, pero no detalla qué pruebas componen esa verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sautilm/SautiLM-Jua-Agri
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Sitio web del proyecto: https://sautilm.com
- LosingTek: https://losingtek.com
