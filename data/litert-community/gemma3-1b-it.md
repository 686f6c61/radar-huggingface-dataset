# litert-community/Gemma3-1B-IT

## Resumen

Gemma3-1B-IT es una variante optimizada del modelo Gemma 3 1B de Google, publicada por la comunidad litert-community, diseñada específicamente para su despliegue en dispositivos móviles y web mediante el stack LiteRT (antes TensorFlow Lite) y la MediaPipe LLM Inference API. El modelo conserva las capacidades del Gemma 3 1B original —un transformer de 1.000 millones de parámetros ajustado por instrucciones— pero se distribuye en un formato ligero y optimizado para ejecución local, lo que permite aplicaciones de IA privadas y sin conexión en Android, iOS y navegadores.

La relevancia de este modelo radica en su enfoque en el edge computing: ofrece una alternativa práctica para desarrolladores que necesitan capacidades de generación de texto y chat en entornos con recursos limitados, sin depender de servidores en la nube. Al estar basado en Gemma 3, hereda una ventana de contexto de 32.768 tokens y un vocabulario amplio de 262.144 tokens, lo que lo hace adecuado para tareas de comprensión y generación de texto de longitud media. El acceso al modelo está restringido (gated) y requiere aceptar los términos de la licencia Gemma en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención de consultas agrupadas (GQA), 26 capas, hidden size 1.152, feed-forward intermedio 6.912 |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (el formato LiteRT suele incluir cuantización, pero no se especifica el tipo) |
| Idiomas soportados | No disponible (según Hugging Face) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | LiteRT (TensorFlow Lite) / MediaPipe |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint `google/Gemma-3-1B-IT` al formato LiteRT, realizada por la comunidad litert-community. La arquitectura subyacente es un transformer denso con atención de consultas agrupadas (GQA) —4 cabezas de consulta y 1 de clave/valor—, 26 capas y un tamaño oculto de 1.152. El feed-forward tiene un tamaño intermedio de 6.912 y el vocabulario alcanza los 262.144 tokens, lo que permite una representación subword muy granular.

No se dispone de información detallada sobre el proceso de entrenamiento de esta variante específica, ya que se trata de una adaptación del modelo original de Google. El Gemma 3 1B IT base fue preentrenado con datos multilingües y posteriormente ajustado por instrucciones mediante técnicas de aprendizaje por refuerzo con retroalimentación humana (RLHF) y optimización de preferencias (DPO), aunque estos detalles no se documentan en la ficha de la comunidad. La conversión a LiteRT implica una optimización del grafo de computación y posiblemente cuantización para reducir el tamaño y mejorar la latencia en dispositivos, pero no se especifican los detalles técnicos de dicha optimización.

## Capacidades

- Generación de texto y chat: al ser un modelo ajustado por instrucciones, responde a prompts conversacionales y sigue directrices de formato.
- Comprensión de contexto largo: soporta hasta 32.768 tokens, lo que permite procesar documentos extensos o mantener conversaciones multi-turno largas.
- Ejecución local y offline: gracias al formato LiteRT, puede ejecutarse íntegramente en el dispositivo sin conexión a internet.
- Compatibilidad multiplataforma: diseñado para Android, iOS y Web a través de MediaPipe LLM Inference API.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso explícito o soporte de visión en esta variante; se limita a texto.

## Casos de uso

- Asistente personal offline en Android: el modelo puede integrarse en una app de asistente que responda preguntas, gestione recordatorios o redacte mensajes sin necesidad de conexión, aprovechando su contexto de 32k tokens para mantener el historial de la conversación.
- Chatbot de atención al cliente en una aplicación móvil: al ejecutarse localmente, reduce la latencia y protege la privacidad del usuario, ya que los datos no salen del dispositivo. Es adecuado para consultas frecuentes y respuestas estandarizadas.
- Procesamiento de texto en entornos con conectividad limitada: por ejemplo, una herramienta de redacción o resumen que funcione en zonas rurales o durante viajes, donde la conexión a internet es intermitente.
- Aplicación de educación interactiva: un tutor de idiomas o de ciencias que genere explicaciones y ejercicios personalizados en el dispositivo, sin costes de servidor.
- Asistente de accesibilidad: integración en apps para personas con discapacidad visual que necesiten leer en voz alta o resumir contenido de pantalla, con respuesta inmediata.
- Prototipado rápido de aplicaciones de IA en el navegador: gracias a la compatibilidad con Web, los desarrolladores pueden crear demos interactivas de generación de texto que se ejecutan en el cliente, sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Esta variante LiteRT no incluye métricas propias de MMLU, HumanEval, GSM8K u otras pruebas estándar. Para conocer el rendimiento del modelo base, se debe consultar la documentación de Google Gemma 3 1B, pero no se dispone de esos datos en esta ficha.

## Requisitos de hardware

- Al estar optimizado para LiteRT, no requiere GPU dedicada; se ejecuta en CPU de dispositivos móviles (ARM) y en navegadores mediante WebAssembly.
- Memoria RAM estimada: no disponible, pero al ser un modelo de 1B, se espera que quepa en dispositivos con 4-6 GB de RAM, dependiendo de la cuantización aplicada.
- GPU recomendada: no aplica; el stack LiteRT está diseñado para aceleración por CPU/GPU integrada en móviles.
- Opciones de despliegue: MediaPipe LLM Inference API para Android/iOS/Web; también puede usarse con el runtime LiteRT directamente.
- Latencia y throughput: no se proporcionan datos concretos; dependerá del dispositivo y de la cuantización. En general, un modelo de 1B en un móvil moderno puede generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| litert-community/Gemma3-1B-IT | 1B | 32.768 | Gemma | LiteRT | Edge/on-device |
| google/Gemma-3-1B-IT (base) | 1B | 32.768 | Gemma | Safetensors | Generalista |
| Microsoft Phi-3-mini | 3.8B | 128k | MIT | Safetensors | Generalista |
| Qwen2.5-1.5B | 1.5B | 32k | Apache 2.0 | Safetensors | Generalista |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. La principal diferencia de esta variante es su formato LiteRT, que la hace única para despliegue en dispositivos, mientras que los otros modelos requieren conversión adicional.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face; es necesario iniciar sesión y aceptar los términos de la licencia Gemma antes de descargarlo.
- Licencia Gemma: aunque permite uso comercial, impone restricciones (por ejemplo, no usar para fines militares o de vigilancia masiva) y exige atribución. Revisar los términos completos en la página de Google.
- Sesgos y alucinaciones: al ser un modelo pequeño (1B), puede presentar mayor tendencia a alucinar o a generar respuestas incoherentes en comparación con modelos más grandes. No se han documentado sesgos específicos, pero se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque Gemma 3 es multilingüe, el rendimiento en idiomas de bajos recursos puede ser inferior.
- Formato propietario: el formato LiteRT está ligado al ecosistema de Google; puede requerir herramientas específicas para su integración y no es directamente compatible con frameworks como vLLM o llama.cpp.
- Tamaño del repositorio: 55.9 GB, lo que puede incluir múltiples variantes de cuantización y archivos auxiliares; el modelo en sí ocupa menos, pero la descarga completa es pesada.

## Enlaces

- [Hugging Face - litert-community/Gemma3-1B-IT](https://huggingface.co/litert-community/Gemma3-1B-IT)
- [AIModels.fyi - Gemma3-1B-IT overview](https://www.aimodels.fyi/models/huggingFace/gemma3-1b-it-litert-community)
- [ModelScope - litert-community/Gemma3-1B-IT](https://www.modelscope.cn/models/litert-community/Gemma3-1B-IT)
- [HF Viewer - Architecture graph](https://hfviewer.com/litert-community/Gemma3-1B-IT)
