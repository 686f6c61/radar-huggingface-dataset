# fuat-65/efeai-gemma2-mobile

## Resumen

El modelo `fuat-65/efeai-gemma2-mobile` es una versión optimizada para dispositivos móviles del modelo Gemma 2 (2B) Instruct de Google, cuantizada en INT4 y preparada para ejecutarse íntegramente en el dispositivo. Ha sido desarrollada por Yağız Efe Gülenoğlu como parte de la aplicación Android Kanal Analiz & EFEai, con el objetivo de proporcionar generación de texto con IA generativa sin depender de APIs en la nube.

El modelo está diseñado para ejecutarse en el runtime de Google MediaPipe Tasks GenAI o LiteRT, y está orientado a dispositivos Android con al menos 8 GB de RAM. Al ser una cuantización INT4 del modelo base Gemma 2 2B Instruct, mantiene las capacidades de razonamiento y generación de texto del modelo original, pero con una huella de memoria significativamente reducida para su uso en hardware móvil.

La relevancia de este modelo radica en la tendencia creciente hacia la inferencia de modelos de lenguaje en el dispositivo, que permite a los desarrolladores integrar asistentes de IA en aplicaciones móviles sin depender de conectividad a internet ni de servicios externos, mejorando la privacidad y reduciendo la latencia. Su licencia Gemma permite el uso comercial, siempre que se cumplan los términos de la licencia de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (2B) Instruct, transformer decoder-only |
| Parametros totales | 2.6 mil millones (aproximadamente, base Gemma 2 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (base Gemma 2 2B) |
| Tipos de cuantizacion | INT4 (optimizado para NPU/GPU/CPU móvil) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Gemma (licencia de Google, permitida para uso comercial con restricciones) |
| Formato de pesos | No especificado en el repositorio; probablemente TensorFlow Lite / LiteRT (tflite) o MediaPipe Task Bundle |

## Arquitectura y entrenamiento
El modelo base es Gemma 2 (2B), una arquitectura transformer decoder-only desarrollada por Google DeepMind, entrenada con un enfoque de tres pilares: mitigación de riesgos de seguridad durante el entrenamiento, evaluaciones robustas y transparentes, y desarrollo de herramientas responsables. La versión 2B de Gemma 2 tiene una longitud de contexto de 8192 tokens y está diseñada para tareas de generación de texto, razonamiento y codigo.

La version alojada en este repositorio es una cuantizacion INT4 del modelo base, optimizada para su ejecucion en dispositivos moviles mediante el runtime MediaPipe Tasks GenAI o LiteRT. No se proporcionan detalles sobre el proceso de cuantizacion (como si se aplico GPTQ, AWQ u otra tecnica), ni sobre datos de entrenamiento adicionales o ajuste fino especifico. Se trata de un peso convertido y comprimido para su uso en Android, no de un modelo reentrenado.

## Capacidades
- Generacion de texto en ingles y turco, incluyendo tareas de completado y dialogo.
- Razonamiento basico y de nivel medio, heredado del modelo base Gemma 2 2B Instruct.
- Capacidad de seguir instrucciones en formato chat, gracias al ajuste instruct del modelo base.
- Ejecucion 100% en el dispositivo (offline), sin llamadas a APIs externas.
- Optimizacion para hardware movil (NPU/GPU/CPU) mediante cuantizacion INT4.
- Compatible con MediaPipe Tasks GenAI y LiteRT, lo que permite integracion en aplicaciones Android nativas.

## Casos de uso
- **Asistente personal offline en Android**: la aplicacion Kanal Analiz & EFEai usa el modelo para responder preguntas y mantener conversaciones en turco o ingles sin conexion, ideal para usuarios con privacidad estricta o zonas sin cobertura.
- **Aplicacion de analisis de contenido**: el modelo puede generar resumenes o analisis de texto localmente, como parte de un flujo de trabajo en la app, sin enviar datos a servidores externos.
- **Chatbot de soporte en turco**: dado el soporte especifico del idioma turco, el modelo es adecuado para aplicaciones de atencion al cliente que necesiten funcionar offline en regiones turcohablantes.
- **Generacion de texto para accesibilidad**: puede usarse en herramientas de asistencia para personas con discapacidad, generando texto o completando frases en tiempo real sin latencia de red.
- **Prototipado rapido de aplicaciones de IA movil**: desarrolladores pueden usar estos pesos como base para experimentar con LLMs en Android, ya que estan pre-cuantizados y listos para MediaPipe.
- **Aplicaciones educativas offline**: para ensenar idiomas o practicar conversacion en ingles o turk, el modelo puede generar respuestas contextualizadas en el dispositivo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para este modelo cuantizado especifico. El modelo base Gemma 2 2B Instruct presenta resultados publicados por Google en su model card (por ejemplo, MMLU y HellaSwag), pero estos datos no son directamente extrapolables a la version INT4, ya que la cuantizacion puede degradar ligeramente el rendimiento. No se inventan cifras.

## Requisitos de hardware
- **VRAM estimada para inferencia**: al ser un modelo de 2.6B en INT4, el peso ocupa aproximadamente 1.3 GB. Con memoria para activaciones y overhead del runtime, se recomiendan dispositivos con al menos 8 GB de RAM total.
- **GPU recomendadas**: no aplica en el contexto movil; se requiere un dispositivo Android con soporte para LiteRT o MediaPipe Tasks GenAI. Se recomiendan dispositivos con NPU (por ejemplo, Snapdragon 8 Gen 2 o superior, Tensor de Google, o equivalente).
- **GPU de escritorio**: no es el objetivo del modelo, pero los pesos INT4 podrian convertirse para ejecucion en llama.cpp o vLLM en CPU/GPU de escritorio, aunque no se proporciona soporte oficial.
- **Opciones de despliegue**: MediaPipe Tasks GenAI, LiteRT (TensorFlow Lite), y potencialmente llama.cpp si se convierten los pesos a GGUF (no incluido en el repositorio).
- **Latencia y throughput estimados**: no disponible; dependen del hardware movil especifico. En un dispositivo con NPU, se espera una generacion de 10-20 tokens por segundo para un modelo de 2B cuantizado, pero esto es una estimacion general, no un dato oficial.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 2 2B (original) | 2.6B | 8192 | Gemma license | Hugging Face, pesos completos |
| EFEai Gemma 2 Mobile (este) | 2.6B | 8192 | Gemma license | Hugging Face, INT4 para movil |
| Llama 3.2 1B (Instruct) | 1.2B | 128K | Llama license | Hugging Face, multiples cuantizaciones |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Hugging Face, multiples cuantizaciones |

Este modelo se diferencia de los alternativos por su optimizacion especifica para MediaPipe y LiteRT en Android, con soporte de idiomas turco e ingles. Llama 3.2 1B es mas pequeño pero con contexto mayor; Phi-3-mini es mas grande y con licencia MIT, pero no esta pre-optimizado para el runtime movil de Google.

## Limitaciones y advertencias
- **Sesgos conocidos**: el modelo base Gemma 2 puede reflejar sesgos de los datos de entrenamiento de Google, especialmente en temas sensibles. No se han realizado evaluaciones de sesgos especificas para esta version cuantizada.
- **Riesgo de alucinacion**: como cualquier LLM, puede generar contenido falso o inventado. La cuantizacion INT4 puede aumentar ligeramente este riesgo.
- **Limitaciones de contexto**: la ventana de contexto es de 8192 tokens, inferior a otros modelos moviles como Llama 3.2 (128K). Para conversaciones muy largas o documentos extensos, puede ser insuficiente.
- **Soporte de idioma limitado**: solo turco e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- **Restricciones de licencia**: la licencia Gemma de Google impone restricciones de uso, incluyendo la prohibicion de usar el modelo para ciertos fines militares o de vigilancia, y requiere mantener la atribucion. Es apta para uso comercial, pero se debe revisar la politica completa.
- **Produccion**: al ser un modelo cuantizado por un tercero, no hay garantia de que los pesos esten perfectamente alineados con el modelo base. Se recomienda validar en tu caso de uso antes de desplegar en produccion.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/fuat-65/efeai-gemma2-mobile
- Guia de despliegue de Gemma en moviles (Google AI for Developers): https://ai.google.dev/gemma/docs/integrations/mobile
- Model card oficial de Gemma 2 (Google): https://ai.google.dev/gemma/docs/core/model_card_2
- Pagina de Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Repositorio original de Gemma 2B: https://huggingface.co/google/gemma-2b
- Informe tecnico de Gemma 2 (PDF): https://storage.googleapis.com/deepmind-media/gemma/gemma-2-report.pdf
