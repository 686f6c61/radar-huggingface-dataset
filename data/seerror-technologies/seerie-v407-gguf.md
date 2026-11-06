# seerror-technologies/seerie-v407-GGUF

## Resumen

Seerie v4 es un modelo de lenguaje causal de 1.700 millones de parámetros, ajustado por instrucciones para conversación, desarrollado por Seerror Technologies (Jay Tiwari) y publicado bajo licencia Apache 2.0. Se construye sobre Qwen3-1.7B mediante QLoRA con Unsloth y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. Su propósito es acotado y específico: ayudar a usuarios en la India a reconocer, responder y denunciar fraudes digitales (estafas UPI, fraude de OTP y KYC, "arresto digital", ofertas de empleo falsas, solicitudes de donación fraudulentas y unas 4.400 temáticas adicionales), funcionando de forma totalmente offline para que las consultas y datos personales no salgan del dispositivo.

La relevancia del modelo reside en su enfoque de despliegue en dispositivo ("on-device") con una cuantización Q4_K_M de solo 1,11 GB, lo que lo hace viable en teléfonos y equipos de baja memoria, y en su cobertura lingüística del subcontinente indio: inglés, hinglish, hindi nativo en devanagari y ocho lenguas indias adicionales (bengalí, tamil, telugu, kannada, malayu, guyaratí, panyabí y oriya). El autor declara explícitamente que v4 no es más preciso que v3, sino aproximadamente igual de preciso, con datos de entrenamiento más limpios.

La evaluación publicada es inusualmente transparente para su tamaño: cada respuesta de una batería de 100 prompts y de 84 prompts nuevos escritos a mano (tres respuestas cada uno) fue leída y calificada individualmente por un asistente de IA (Claude), sin re-calificación humana posterior. Los resultados declarados son 86/100 respuestas seguras frente a 23/100 del modelo base, y un 76% de respuestas seguras en los 84 prompts nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivado de Qwen3-1.7B), ajuste por instrucciones con QLoRA |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 3.072 tokens en entrenamiento; contexto nativo de Qwen3-1.7B no especificado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en el repositorio) |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, gu, pa, or (ingles, hindi, bengali, tamil, telugu, kannada, malayalam, guyarati, panyabi, oriya), mas hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp, Ollama y LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer causal denso de 1,7B parámetros, y se ajusta mediante QLoRA con la librería Unsloth, con rango 32, alpha 64, 3 épocas (26.460 pasos), longitud máxima de 3.072 tokens y cálculo de pérdida únicamente sobre las respuestas del asistente. El conjunto de entrenamiento corresponde al dataset v407, con 140.813 conversaciones sobre aproximadamente 4.400 temáticas de fraude; 45 temáticas (1.128 conversaciones) se reservaron para prueba.

El trabajo de la versión v4 se centró en la limpieza de datos más que en la capacidad bruta: se eliminaron todas las citas de secciones legales presentes en 1.303 registros antiguos (o se descartaron esos registros), se verificaron todos los números de ayuda telefónica y sitios web gubernamentales citados (descartando registros con datos no verificables o URLs inaccesibles), se excluyeron 1.319 registros corruptos y se repararon 866 turnos. Además, se incorporaron conversaciones nuevas en hindi nativo (devanagari) en cada lote desde v401 y se amplió la longitud máxima de 2.048 a 3.072 tokens para acomodar el hindi. No se documentan en la información disponible innovaciones arquitectónicas propias (atención lineal, decodificación especulativa ni mezcla de expertos); las capacidades proceden del modelo base y del ajuste.

## Capacidades

- Generación de texto conversacional multi-turno orientada a la identificación y respuesta ante fraudes digitales.
- Clasificación y explicación de unos 4.400 temas de estafa: UPI, OTP, KYC, "arresto digital", empleos y notificaciones falsas, donaciones fraudulentas, "amigos" en línea que piden dinero.
- Respuestas con pasos accionables: verificación de registros (por ejemplo, NGO Darpan), recomendaciones de canales oficiales y números de ayuda (1930, cybercrime.gov.in).
- Capacidades multilingües: inglés, hinglish, hindi nativo y ocho lenguas indias adicionales.
- Funcionamiento totalmente offline en dispositivo, sin envío de datos a servidores.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento ("thinking"), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Detección de estafas UPI en tiempo real: el modelo analiza el mensaje o la conversación que el usuario pega en la app y devuelve una evaluación con pasos de verificación concretos, sin conexión y sin exponer datos personales.
- Asistencia ante fraude de OTP y KYC: identifica patrones típicos (solicitudes de códigos, suplantación de entidades bancarias) y guía al usuario sobre qué hacer y a quién contactar, apoyándose en los números de ayuda verificados incluidos en el entrenamiento.
- Prevención del "arresto digital": explica por qué una llamada o mensaje que simula ser de policía o de una agencia gubernamental es fraudulento y ofrece el protocolo de denuncia (1930, cybercrime.gov.in).
- Verificación de solicitudes de donación: distingue entre organizaciones registradas y cuentas UPI personales, y sugiere comprobar el registro en NGO Darpan, como muestra el ejemplo publicado en la model card.
- Detección de ofertas de empleo y notificaciones falsas: evalúa anuncios sospechosos y señala señales de alarma, útil para usuarios con poca alfabetización digital.
- Aplicación móvil de concienciación ciudadana: integrado en la app Seerie (Google Play) para ofrecer respuestas inmediatas en hindi, hinglish e inglés a población con conectividad limitada.
- Despliegue en kioscos o terminales de baja memoria: con 1,11 GB en Q4_K_M, cabe en dispositivos con recursos restringidos mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

| Evaluación | Seerie v4 | Modelo base (Qwen3-1.7B) |
|---|---|---|
| Batería de 100 prompts (respuestas seguras) | 86/100 | 23/100 |
| 84 prompts nuevos escritos a mano (respuestas seguras) | 76% | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada se limita a las dos pruebas anteriores, calificadas por un asistente de IA (Claude) sin revisión humana posterior, según declara el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en Q4_K_M (archivo de 1,11 GB más overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU consumer con al menos 2-3 GB de VRAM; también funciona en CPU.
- Cabe en GPU consumer: sí, en tarjetas de gama baja y media (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y en dispositivos móviles de gama media.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run hf.co/seerror-technologies/seerie-v407-GGUF:Q4_K_M`), LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Seerie v4 | 1,7B | 3.072 (entrenamiento) | Apache 2.0 | GGUF | Prevención de fraude en India, multilingüe índico |
| Qwen3-1.7B (base) | 1,7B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingüe |
| Seerie v3 (v349) | 1,7B | 2.048 (entrenamiento) | Apache 2.0 | GGUF | Versión anterior, precisión similar según el autor |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en seguridad o fraude en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que v4 es aproximadamente igual de preciso que v3, no más; la mejora está en la limpieza de datos, no en la tasa de acierto.
- La evaluación fue realizada íntegramente por un asistente de IA (Claude) sin re-calificación humana, lo que limita la fiabilidad de las cifras declaradas.
- Riesgo de alucinación: aunque se eliminaron citas legales y se verificaron números de ayuda, el modelo puede generar información incorrecta sobre procedimientos, entidades o normativa.
- Dominio muy restringido: no es un modelo generalista; su utilidad fuera del ámbito de fraude digital es limitada.
- Cobertura desigual entre idiomas: el hindi nativo se incorporó recientemente y las ocho lenguas indias adicionales no cuentan con evaluación publicada específica.
- Contexto de entrenamiento de 3.072 tokens: conversaciones muy largas pueden exceder la ventana útil.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye solo en GGUF Q4_K_M, lo que limita el ajuste fino posterior a partir de estos pesos.
- No se documentan sesgos específicos ni auditorías de sesgo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seerror-technologies/seerie-v407-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Informe técnico (Zenodo): https://doi.org/10.5281/zenodo.23731473
- Sitio web: https://www.seerror.com
- GitHub: https://github.com/Seerror-Technologies
- App en Google Play: https://play.google.com/store/apps/details?id=com.seerror.seerie&hl=en
- Versión anterior v3: https://huggingface.co/seerror-technologies/seerie-v349-GGUF
- Versión anterior v2: https://huggingface.co/seerror-technologies/seerie-v224-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Unsloth: https://github.com/unslothai/unsloth
