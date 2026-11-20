# altslate/indic-chat-xlit-small

## Resumen
Indic Chat Transliteration (small) es un modelo de traducción automática de transliteración inversa desarrollado por altslate. Convierte texto romanizado informal (por ejemplo, "kal meeting cancel ho gayi") a la escritura nativa correspondiente (devanagari, tamil, bengalí, etc.) para 12 lenguas del sur de Asia: hindi, bengalí, tamil, telugu, marathi, gujarati, kannada, malayo, punyabí, urdu, sindhi y cingalés. Resuelve un problema muy concreto en entornos de chat y mensajería de la India y diáspora: los usuarios escriben en alfabeto latino y necesitan normalizar a escritura nativa para búsqueda, moderación, accesibilidad o entrada de datos.

El modelo es un fine-tuning de google/byt5-small, un transformer encoder-decoder que opera a nivel de byte, lo que elimina el problema de vocabulario cerrado y permite cubrir alfabetos completos sin tokens desconocidos. Tiene 299,6 millones de parámetros y un tamaño de repositorio de 3,5 GB (incluye pesos en safetensors y exportaciones ONNX en fp32 e int8).

Es relevante ahora porque cubre una carencia práctica de los pipelines multilingües en la India: la mayoría de modelos multilingües asumen entrada en escritura nativa, y las herramientas de transliteración existentes (como IndicXlit) son a nivel de palabra y no aprovechan contexto de frase. Este modelo opera sobre frases completas, lo que mejora la desambiguación de romanizaciones ambiguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ByT5, byte-level) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con entradas de hasta ~380 bytes |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 dinámico por canal (int8 ~300 MB en total) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur, sd, si |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento
El modelo parte de google/byt5-small, un transformer encoder-decoder que tokeniza a nivel de byte en lugar de usar un vocabulario subword. Esto implica que cualquier secuencia UTF-8 es representable sin tokens UNK, lo cual es idóneo para cubrir 12 escrituras distintas (devanagari, bengalí, tamil, telugu, gujarati, kannada, malayo, gurmuji, árabe-urdu, sindhi, cingalés) con un único modelo. La tarea se formula como text2text-generation con un prefijo de código de idioma (`hi:`, `ta:`, `ur:`, etc.).

El entrenamiento se realizó durante 2 épocas, con batch de 32, optimizador AdamW, learning rate 5e-4, schedule lineal y precisión bf16, en aproximadamente 90 minutos sobre una NVIDIA GB10 (DGX Spark). El conjunto de datos consta de 178.000 pares, combinando Dakshina (romanizaciones humanas de frases de Wikipedia) con datos de chat informal. No se reporta uso de RLHF ni DPO; es un fine-tuning supervisado directo sobre el modelo base.

## Capacidades
- Transliteración inversa de frase completa: convierte texto romanizado a escritura nativa para 12 lenguas índicas.
- Manejo de code-mixing: procesa frases con palabras inglesas intercaladas (aunque las translitera a la escritura nativa, no las conserva en latín).
- Desambiguación contextual: al operar sobre frases completas, resuelve ambigüedades que un modelo palabra a palabra no puede (por ejemplo, *pore* en bengalí como "después" o "leer").
- Entrada con prefijo de idioma obligatorio (`hi:`, `bn:`, `ta:`, etc.), lo que permite control explícito de la escritura de salida.
- Exportación ONNX para onnxruntime y transformers.js, con variantes fp32 e int8.
- Compatible con text-generation-inference y endpoints_compatible según los tags del repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo especializado de traducción de escritura.
- No soporta visión ni audio.

## Casos de uso
- Normalización de mensajes de chat para moderación: los sistemas de moderación suelen entrenarse sobre escritura nativa; este modelo permite convertir entradas romanizadas (hinglish, tanglish, etc.) a escritura nativa antes de pasarlas por clasificadores existentes, mejorando la cobertura sobre mensajes informales.
- Búsqueda y recuperación de información multilingüe: indexar documentos en escritura nativa y permitir consultas en romanizado, transliterando la consulta antes de la búsqueda. Útil en bases de conocimiento de Wikipedia o atención al cliente en la India.
- Entrada de datos en formularios y aplicaciones: teclados y campos de texto que aceptan romanizado y muestran la versión en escritura nativa para confirmación del usuario, con soporte para 12 lenguas en un único modelo de 300M.
- Accesibilidad y lectura: convertir mensajes romanizados a escritura nativa para usuarios con dificultades de lectura en alfabeto latino o para síntesis de voz que requiere la escritura correcta para una pronunciación adecuada.
- Preprocesamiento en pipelines de NLP: paso previo a modelos de análisis de sentimiento, NER o traducción que esperan entrada en escritura nativa, evitando entrenar variantes romanizadas de cada modelo downstream.
- Generación de datos sintéticos y aumentación: crear pares romanizado-escritura nativa para entrenar otros modelos o para evaluar sistemas de transliteración, dado que el modelo funciona a nivel de frase y no solo de palabra.
- Despliegue en el navegador: gracias a la exportación ONNX int8 (~300 MB), puede ejecutarse en transformers.js para aplicaciones web sin backend, con la advertencia de que la calidad int8 es inferior a fp32 (CER 0,076 frente a 0,066 en la prueba de 60 mensajes de chat).

## Benchmarks y rendimiento
Se reportan resultados en CER (character error rate, menor es mejor), promediado macro sobre lenguas. Test A: split de test de Dakshina, 100 frases por lengua (1.200 en total). Test B: 696 mensajes de chat informal generados por Qwen3.8-27B en escritura nativa y luego romanizados, con filtro de acuerdo de idioma por GlotLID.

| Sistema | A (Dakshina) | B (chat) |
|---|---|---|
| Copiar la entrada (sin transliterar) | 1,004 | 0,964 |
| AI4Bharat IndicXlit (palabra a palabra, beam 4, sin rescoring) | 0,097 | 0,160 |
| **Este modelo (greedy)** | **0,070** | **0,123** |

CER por lengua (A / B):

| | bn | gu | hi | kn | ml | mr | pa | sd | si | ta | te | ur |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| IndicXlit | .105/.147 | .089/.166 | .103/.089 | **.048**/.144 | **.064**/.163 | .078/.138 | .158/.212 | .198/.243 | .090/.195 | .060/.176 | **.049**/.116 | .117/.128 |
| Este modelo | **.091**/.106 | **.041**/.107 | **.062**/.039 | .074/**124** | .087/.171 | .079/**123** | **.065**/.120 | **.092**/.173 | **.079**/.166 | **.058**/.162 | .057/.119 | **.054**/.065 |

En hindi exclusivamente, UnimeType Transliteration-2.0-0.8B obtiene CER 0,292 (A) y 0,227 (B), frente a 0,062 y 0,039 de este modelo; parte de la diferencia se debe a que UnimeType conserva palabras inglesas en latín mientras que las referencias de este modelo las escriben en devanagari.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB de pesos más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en int8 ONNX: aproximadamente 300 MB de pesos; cabe en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es lo bastante pequeño como para no requerir GPU dedicada en producción de bajo volumen.
- Cabe en GPU consumer: sí, en todas las GPU consumer con más de 2 GB de VRAM; también en CPU con onnxruntime o llama.cpp no aplica (no hay GGUF publicado).
- Opciones de despliegue: transformers (PyTorch), onnxruntime, transformers.js, text-generation-inference (según tags). No se publica GGUF ni Ollama.
- Latencia y throughput: no disponible. El autor reporta que el entrenamiento completo (2 épocas) tardó unos 90 minutos en una NVIDIA GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (A / B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **altslate/indic-chat-xlit-small** | 299,6 M | ~380 bytes de entrada | 0,070 / 0,123 | Apache-2.0 | Hugging Face, ONNX |
| AI4Bharat IndicXlit | ~138 MB (checkpoint) | palabra a palabra | 0,097 / 0,160 | no disponible en la información | GitHub, Hugging Face |
| UnimeType Transliteration-2.0-0.8B | 0,8 B | no disponible | 0,292 / 0,227 (solo hindi) | no disponible en la información | Hugging Face |

IndicXlit es más pequeño y cubre más lenguas, y supera a este modelo en kannada, malayo y telugu sobre Dakshina, además de ser más rápido para palabras sueltas. Este modelo gana en hindi, bengalí, gujarati, punyabí, sindhi, cingalés y urdu, y en la mayoría de lenguas sobre chat. UnimeType solo cubre hindi y su comparación está sesgada por la política de conservar palabras inglesas en latín.

## Limitaciones y advertencias
- Translitera las palabras inglesas a escritura nativa ("meeting" → मीटिंग) en lugar de conservarlas en latín; no hay opción para mantenerlas en alfabeto latino.
- Las romanizaciones ambiguas se resuelven por contexto y a veces fallan; las vocales largas y la nasalización (ं, ँ) son fuentes frecuentes de error.
- Normaliza algunas grafías de chat a formas estándar (*pe* → पर), lo que puede no reflejar la intención exacta del usuario.
- Es obligatorio indicar el código de idioma; no soporta mezclar dos lenguas índicas en un mismo mensaje.
- Entrenado con entradas de hasta ~380 bytes; para textos largos hay que dividir en frases.
- La cuantización int8 empeora la calidad: en 60 mensajes de chat el CER sube de 0,066 a 0,076 y solo el 62% de las salidas coinciden con PyTorch. Para producción con requisitos de calidad, usar fp32.
- Riesgo de alucinación bajo pero no nulo en palabras raras o nombres propios; el modelo puede generar una forma plausible pero incorrecta.
- No se reportan sesgos específicos más allá de los derivados de los datos de entrenamiento (Dakshina y chat sintético).
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento (Dakshina) para usos derivados.

## Enlaces
- Hugging Face: https://huggingface.co/altslate/indic-chat-xlit-small
- Modelo base: https://huggingface.co/google/byt5-small
- Modelo de detección de idioma recomendado: https://huggingface.co/altslate/indic-chat-lid-small
- AI4Bharat IndicXlit: https://github.com/AI4Bharat/IndicXlit
- UnimeType Transliteration-2.0-0.8B: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Dakshina: https://github.com/google-research/dakshina
