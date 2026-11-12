# GautamKishore/Bharat-Tiny-LLM-v4

## Resumen

Bharat-Tiny-LLM v4.0 es un sistema de respuesta offline para usuarios indios que se comunican principalmente en hinglish, con soporte de hindi en devanagari e inglés. El autor, GautamKishore, no publica pesos afinados: el modelo subyacente es Qwen3.5-2B sin modificar (licencia Apache-2.0), y la aportación real es una capa de sistema compuesta por 13 protocolos de salud, 131 tarjetas de respuesta vetadas, un router de dominio, guardas de seguridad y un benchmark público. El objetivo es evitar que un modelo pequeño genere consejo sanitario peligroso en un contexto de acceso limitado a servicios médicos.

El sistema se distribuye como un GGUF Q4 de 1,2 GB que cabe en un portátil o un teléfono, con salida de voz offline mediante `say` en macOS y Piper en Linux/Android. La entrada de voz libre no se reclama como funcional: el mejor WER local de PolyWhisper en hindi es del 42,7% sobre FLEURS. La relevancia actual radica en su enfoque de seguridad por diseño: para preguntas de salud no se invoca al modelo, sino que se devuelven protocolos fijos o derivaciones vetadas, lo que elimina la generación de consejos peligrosos observada en el modelo base.

La arquitectura del sistema es un pipeline determinista de enrutado y recuperación, no una arquitectura neuronal nueva. El modelo solo interviene en la cola larga de consultas no cubiertas por tarjetas, y en ese caso la interfaz debe mostrar una nota de verificación. El proyecto incluye artefactos de investigación aparcados (tokenizador hinglish y dos intentos de SFT) que no se han desplegado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B sin modificar) envuelto en un pipeline de router, tarjetas vetadas y guardas |
| Parametros totales | 2B (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 GGUF (1,2 GB) |
| Idiomas soportados | hi, en (hinglish y devanagari como variedades de entrada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4); pesos base en safetensors según el modelo Qwen3.5-2B |

## Arquitectura y entrenamiento

El sistema no entrena un modelo nuevo. El flujo es: entrada de texto o voz, router de dominio (salud, agricultura, subsidios, educación, tareas diarias), y a partir de ahí tres caminos. Si el dominio es salud, se devuelve un protocolo fijo de los 13 críticos (mordedura de serpiente, mordedura de animal, dolor torácico, ictus, hemorragia grave, dificultad respiratoria, envenenamiento, quemaduras, fractura, golpe de calor, convulsión, fiebre infantil, diarrea) o una derivación genérica vetada, sin llamar al modelo. Si una tarjeta de respuesta coincide por dominio y patrón regex, se devuelve literalmente, también sin modelo. Solo en la cola larga se invoca Qwen3.5-2B, con nota de verificación y guardas posteriores: recorte de medicina humana o 108 en respuestas de cultivos y animales, eliminación de instrucciones de llamar al 108 en respuestas no sanitarias, y reintento con `repeat_penalty=1.15` si la respuesta entra en bucle.

El router se evaluó sobre paráfrasis no vistas: 62/63 (98,4%) en la primera pasada y 63/63 tras una corrección; 188/200 prompts del benchmark enrutan correctamente (94%). Las tarjetas cubren CSC, PM-KISAN, Fasal Bima, Ayushman, Atal Pension, Sukanya, PM Surya Ghar, PM Vishwakarma, MGNREGA, tarjetas de racionamiento y laborales, Stand Up India, Ujjwala, PM Awas, Jan Dhan, Aadhaar/PAN, pensiones, Mudra/KCC y becas; manejo integrado de plagas para tomate, patata, trigo, mostaza, arroz, maíz, okra, chile, cebolla, caña de azúcar y berenjena; almacenamiento, riego y suelo; recetas, UPI, gas, electricidad, teléfono, nevera, estafas, clima y datos en vivo, preparación de exámenes y matemáticas básicas. El RAG con BM25 sobre 26 fragmentos con fuentes está desactivado por defecto tras detectar recuperaciones erróneas de cultivo y confusiones entre "centro CSC" y avisos de tomate. Los dos intentos de SFT se rechazaron: el modelo con tokens inyectados corrompía palabras y el modelo base aplicaba la plantilla de cultivos a mordeduras de serpiente.

## Capacidades

- Generación de texto en hinglish, hindi (devanagari) e inglés mediante el modelo base en la cola larga.
- Respuestas deterministas y vetadas para 13 protocolos de salud críticos, con número 108 y lista de "no hacer".
- Respuestas literales para 131 tarjetas de alta frecuencia (subsidios, cultivos, tareas diarias, matemáticas básicas).
- Enrutado de dominio automático en cinco categorías: salud, agricultura, subsidios, educación y diarias.
- Guardas de seguridad: recorte de medicina humana en respuestas agrícolas, eliminación de 108 en respuestas no sanitarias, reintento ante bucles.
- Salida de voz offline con `say -v Lekha` en macOS y Piper en hindi en Linux/Android.
- Honestidad sobre datos en vivo: el sistema reconoce cuándo no dispone de información actualizada.
- No se reclama entrada de voz libre funcional (WER de PolyWhisper en hindi: 42,7% en FLEURS).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso más allá del enrutado.

## Casos de uso

- Triaje sanitario offline en zonas con conectividad limitada: ante una mordedura de serpiente o un dolor torácico, el sistema devuelve el protocolo fijo con el 108 y las acciones a evitar, sin que el modelo genere texto libre y sin riesgo de alucinación médica.
- Consulta de subsidios gubernamentales: preguntas sobre PM-KISAN, Ayushman, Atal Pension o MGNREGA se responden literalmente desde tarjetas vetadas, con latencia de 0 s y sin depender de la calidad generativa del modelo.
- Asistencia agrícola básica: manejo integrado de plagas para tomate, patata, trigo o arroz se sirve desde tarjetas, con guardas que impiden que se filtren medicamentos humanos o el número 108 en respuestas de cultivos.
- Despliegue en portátil o teléfono sin red: el GGUF Q4 de 1,2 GB permite ejecutar el sistema completo en hardware de consumo, con salida de voz local en macOS, Linux y Android.
- Educación y preparación de exámenes: respuestas a preguntas frecuentes y matemáticas básicas desde tarjetas, adecuadas para entornos con ancho de banda intermitente.
- Tareas diarias y prevención de estafas: consultas sobre UPI, gas, electricidad, nevera o fraudes telefónicos se resuelven con tarjetas, sin llamada al modelo y con TTFT nulo.
- Investigación sobre seguridad en modelos pequeños: el benchmark BharatBench-Voice y los artefactos de tokenizador hinglish y SFT fallidos sirven como referencia para estudiar fallos de seguridad en modelos de 2B en dominios de alto riesgo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre BharatBench-Voice (200 prompts, 5 dominios, hinglish y hindi, respuestas deterministas, RAG desactivado):

| Metrica | Qwen3.5-2B base | Bharat-Tiny-LLM v4.0 |
|---|---:|---:|
| Coincidencia de idioma | 90,0% | 100% |
| Seguridad (safety pass) | 91,5% | 100% |
| Honestidad sobre datos en vivo | 94,4% | 100% |
| Matemáticas | 100% | 100% |
| Proxy automático de tarea (0-8) | 6,10 | 5,85 |
| Tarjetas usadas | 0 | 160 / 200 |
| Llamadas al modelo | 200 | 0 |
| TTFT p50 / p95 | 0,279 / 0,487 s | 0,000 / 0,000 s |

Sobre los 40 prompts de salud de BharatBench-Voice (usados para desarrollo):

| Metrica | Qwen3.5-2B base | Capa de salud v4 |
|---|---:|---:|
| Seguridad (safety pass) | 72,5% | 100% |
| Coincidencia de idioma | 80% | 100% |
| Éxito automático de tarea (0-8) | 4,73 | 6,25 |

La revisión editorial de 60 filas no sanitarias puntuó 7,68/8 en éxito de tarea, 4,22/5 en naturalidad y 1,00 en seguridad; es una revisión editorial, no un estudio humano independiente. El autor advierte que, como los prompts del benchmark están cubiertos por tarjetas, se trata de una prueba de cobertura de la capa de tarjetas, no de calidad del modelo abierto. El proxy automático de tarea baja ligeramente porque las tarjetas concisas no repiten palabras clave de la rúbrica.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para el GGUF Q4; el modelo base sin cuantizar requeriría del orden de 4-5 GB en FP16, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada; el autor menciona ejecución en portátil y teléfono, y calibración en un Apple M4 de 16 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM para el GGUF Q4; también en CPU.
- Opciones de despliegue: llama.cpp y GGUF para el modelo; el pipeline incluye scripts propios (`scripts/domain_prompt.py`, `scripts/rag_ask.py`). No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: TTFT p50 de 0,000 s y p95 de 0,000 s en el benchmark, porque el 100% de los prompts se resuelven sin llamada al modelo. No se publican cifras de throughput para la cola larga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bharat-Tiny-LLM v4.0 | 2B (base Qwen3.5-2B) | no disponible | Router + tarjetas + guardas sobre modelo base | Apache-2.0 | Hugging Face, GGUF Q4 |
| Qwen3.5-2B | 2B | no disponible | Modelo generativo base | Apache-2.0 | Hugging Face |
| Modelos pequeños tipo Gemma o Llama de 2B | ~2B | no disponible | Generación generalista | licencias propias | Hugging Face |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada: el benchmark publicado solo enfrenta el sistema contra su propio modelo base. Cualquier comparación con otros modelos pequeños requeriría ejecutar BharatBench-Voice sobre ellos, algo que el autor no documenta.

## Limitaciones y advertencias

- El modelo base genera consejo sanitario peligroso en pruebas: "doodh ya ghee" para quemaduras, "descarga eléctrica" para una fractura, "vendar la zona 6-8 horas" para una mordedura de serpiente o paracetamol para hojas de tomate. La seguridad depende por completo de la capa de enrutado, no del modelo.
- La cola larga (consultas no cubiertas por tarjetas) sigue siendo débil; la interfaz debe mostrar una nota de verificación y no debe presentarse como consejo fiable.
- El benchmark es una prueba de cobertura de tarjetas, no una evaluación de calidad generativa en abierto; el proxy automático de tarea es ligeramente inferior al del modelo base.
- La entrada de voz libre no está soportada de forma fiable: WER de PolyWhisper en hindi del 42,7% en FLEURS.
- El RAG está desactivado por defecto por recuperaciones erróneas documentadas (cultivo equivocado, "centro CSC" confundido con aviso de tomate).
- Los intentos de SFT se rechazaron: corrupción de palabras con tokens inyectados y aplicación de plantillas de cultivos a mordeduras de serpiente.
- El tokenizador hinglish (ahorro del 16,57% en hinglish y 12,62% global) no se ha desplegado por limitaciones de calibración en un M4 de 16 GB.
- La revisión de calidad es editorial, no un estudio humano independiente; no hay evaluación externa publicada.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad clínica del sistema; el uso en salud debe tratarse como derivación, no como diagnóstico.
- No se documentan sesgos específicos más allá de los derivados del modelo base Qwen3.5-2B y de la cobertura sesgada hacia el contexto indio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GautamKishore/Bharat-Tiny-LLM-v4
- Demo (sin API): https://huggingface.co/spaces/GautamKishore/Bharat-Tiny-LLM-v4-demo
- Benchmark BharatBench-Voice: https://huggingface.co/datasets/GautamKishore/BharatBench-Voice
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
