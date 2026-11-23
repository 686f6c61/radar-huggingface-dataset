# openamer-max/openamer-max

## Resumen

OpenAmer-Max v1.3 (7B) es un ajuste fino de Qwen2.5-7B-Instruct publicado por el desarrollador independiente Amer Sacirovic bajo el identificador openamer-max. El modelo está pensado como asistente personal de ejecución local y sin conexión, con un foco claro en alemán y en las lenguas del espacio bosnio-croata-serbio (bosnio, croata y serbio), además del inglés. Se distribuye únicamente en formato GGUF cuantizado Q4_K_M, lo que lo hace desplegable en tarjetas gráficas de 8 GB de VRAM.

Técnicamente es un transformer decoder-only de 7.615.616.512 parámetros totales (7,6B), derivado de la arquitectura Qwen2 con una ventana de contexto heredada del modelo base. El ajuste se realizó con LoRA de rango 16 sobre 2.681 ejemplos propios durante 4 épocas (312 pasos), con solo un 0,53 % de parámetros entrenables (40.370.176). El resultado es un modelo conversacional que conserva las capacidades del Qwen2.5 original y añade una alineación específica hacia el alemán y el bosnio.

Su relevancia actual reside en dos factores: por un lado, demuestra que un ajuste fino de bajo coste (2 h 49 min en una T4 gratuita de Kaggle) puede mejorar métricas concretas sobre el modelo base en tareas de fidelidad factual y formato; por otro, la licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales, algo poco habitual en modelos especializados en lenguas minoritarias de los Balcanes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino con LoRA r=16 |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (unica fassung publicada; se eliminaron fp16 safetensors y f16 GGUF) |
| Idiomas soportados | Aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `openamer-max.q4.gguf`, 4,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención causal estándar y RoPE, sin innovaciones arquitectónicas adicionales por parte del autor del ajuste. Sobre esa base se aplicó un LoRA de rango 16 que entrena 40.370.176 parámetros (0,53 % del total), y posteriormente se mezclaron y cuantizaron los pesos resultantes a Q4_K_M. No se documenta en la información disponible si se emplearon técnicas como DPO, RLHF o decodificación especulativa; el entrenamiento descrito es un ajuste supervisado sobre ejemplos propios.

Los datos de entrenamiento consisten en 2.681 ejemplos propios del autor, sin que se detalle su composición exacta por idioma o por tarea. El entrenamiento se ejecutó durante 4 épocas y 312 pasos en una única GPU T4 (entorno gratuito de Kaggle), con una duración total de 2 h 49 min y un pico de VRAM de 10,24 GB. Las pérdidas registradas fueron de 0,516 en entrenamiento y 0,325 en evaluación, lo que sugiere un ajuste ajustado pero con riesgo de sobreajuste dado el volumen reducido del dataset y las 4 épocas.

## Capacidades

- Generación de texto conversacional multi-turno en alemán, bosnio, croata, serbio e inglés.
- Respuesta a preguntas factuales: el autor reporta 23/23 en su prueba de hechos (P1) y 7/7 en la categoría `fakt`.
- Formato de salida controlado: 4/4 en la categoría `format`, útil para respuestas estructuradas sencillas.
- Reconocimiento de límites epistémicos: 4/4 en `erfinden` (no inventar) y 3/3 en `ehrlich` (honestidad), según las pruebas del autor.
- Gestión de conversaciones multi-turno: 2/2 en `mehrzug`.
- Manejo de textos largos: 3/3 en `langtext` y 4/4 en `uebermass` (respuestas excesivamente largas).
- Capacidad multilingüe asimétrica: buen rendimiento en bosnio para preguntas factuales (3/3), pero debilidad en formulación libre (0/2 en `sprache`, con respuestas en alemán a preguntas en bosnio).
- No soporta tool calling ni function calling: el autor lo declara explícitamente como limitación ("Kein Werkzeug-Aufruf, kein Code-Ausfuehren").
- No soporta ejecución de código, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente personal offline en alemán: el modelo está diseñado para ejecutarse localmente con Ollama sobre una GPU de 8 GB, sin cuenta ni conexión a la nube, lo que lo hace adecuado para entornos con requisitos de privacidad estrictos o conectividad limitada.
- Atención al cliente en alemán y lenguas balcánicas: puede gestionar conversaciones multi-turno (2/2 en `mehrzug`) y mantener contexto entre turnos, útil para soporte en bosnio, croata o serbio donde los modelos comerciales suelen tener menor cobertura.
- Generación de respuestas factuales controladas: con 23/23 en la prueba de hechos y 4/4 en `erfinden`, es apropiado para tareas de consulta donde la fidelidad importa más que la creatividad, como FAQ internas o bases de conocimiento.
- Formateo de texto estructurado: la puntuación perfecta en `format` (4/4) lo hace válido para generar respuestas con estructura fija (listas, tablas simples, plantillas) en pipelines de procesamiento de documentos.
- Traducción y adaptación de contenido entre alemán y bosnio/croata/serbo: aunque la formulación libre en bosnio es débil (0/2 en `sprache`), el rendimiento factual (3/3) permite usarlo en tareas de traducción de contenido informativo donde la precisión semántica prima sobre la fluidez estilística.
- Despliegue en hardware de consumo: con 4,4 GB en Q4_K_M y un pico de entrenamiento de 10,24 GB, cabe en tarjetas de 8 GB, lo que permite prototipado y despliegue en estaciones de trabajo sin GPU de datacenter.
- Educación y prototipado de asistentes en lenguas minoritarias: sirve como base para experimentar con ajustes finos adicionales en bosnio, croata y serbio, dado que el autor documenta explícitamente las debilidades a corregir en la versión v1.4.

## Benchmarks y rendimiento

El autor publica una evaluación propia con tres pruebas congeladas (P1, P2, P3) y 61 casos, comparando la versión v1.3 (7B) con la v1.2 (3B). No se trata de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K), sino de un conjunto de pruebas propietario del autor.

| Prueba | v1.2 (3B) | v1.3 (7B) |
|---|---|---|
| P1 Hechos (23) | 21 | 23 |
| P2 Sondas (15) | 14 | 11 |
| P3 Vida cotidiana (23) | 19 | 22 |
| **Total (61)** | 54 (88,5 %) | 56 (91,8 %) |

Desglose por categoría en v1.3 (según el autor):

| Categoría | Resultado v1.3 |
|---|---|
| `fakt` | 7/7 |
| `erfinden` | 4/4 |
| `format` | 4/4 |
| `mehrzug` | 2/2 |
| `ehrlich` | 3/3 |
| `bosnisch` | 3/3 |
| `langtext` | 3/3 |
| `uebermass` | 4/4 |
| `sprache` | 0/2 |
| `rechnen` | 1/2 |
| `lang` | 0/1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,7 GB en Q4_K_M (el archivo GGUF pesa 4,4 GB); el autor indica que 8 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 8 GB, RTX 4060 Ti, RTX 3070, etc.). El entrenamiento se realizó en una T4 con 10,24 GB de pico de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más. No cabe en un teléfono, según el propio autor.
- Opciones de despliegue: Ollama (el autor proporciona instrucciones con `ollama create openamer-max -f Modelfile`); al ser GGUF, también es compatible con llama.cpp y otros runners GGUF. No se documenta soporte verificado para vLLM o TGI, que habitualmente requieren pesos safetensors no disponibles en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| OpenAmer-Max v1.3 | 7,6B | No disponible | de, bs, hr, sr, en | Apache 2.0 | GGUF Q4_K_M | 56/61 en prueba propia del autor |
| Qwen2.5-7B-Instruct (base) | 7,6B | No disponible en la ficha | Multilingüe amplio | Apache 2.0 | Safetensors, GGUF | Referencia de la que parte el ajuste |
| OpenAmer-Max v1.2 | 3B (aprox.) | No disponible | de, bs, hr, sr, en | Apache 2.0 | GGUF | 54/61 en la misma prueba |

La comparación con el modelo base Qwen2.5-7B-Instruct no puede establecerse con datos numéricos porque el autor no publica resultados del base en su prueba propia. La comparación con la v1.2 (3B) muestra una mejora global de 2 puntos (88,5 % a 91,8 %), con retrocesos notables en `sprache` (2/2 a 0/2) y `lang` (1/1 a 0/1). No se dispone de comparación con otros modelos de 7B especializados en lenguas balcánicas en la información proporcionada.

## Limitaciones y advertencias

- Sesgo lingüístico documentado: las preguntas en bosnio se responden parcialmente en alemán (0/2 en `sprache`), lo que el autor reconoce como debilidad a corregir en v1.4.
- Errores aritméticos: 1/2 en `rechnen`; el autor cita un fallo concreto (90 km/h × 2,5 h → "135").
- Incumplimiento de restricciones de longitud: 0/1 en `lang`, donde se pedían al menos cuatro frases y se generaron tres.
- Sin soporte de tool calling ni ejecución de código: el autor lo declara explícitamente; cualquier flujo de agente debe orquestarse externamente.
- Riesgo de alucinación: aunque la prueba `erfinden` da 4/4, el dataset de entrenamiento es reducido (2.681 ejemplos) y las pérdidas de entrenamiento (0,516) frente a evaluación (0,325) sugieren posible sobreajuste a los estilos del autor, con riesgo de generalización limitada fuera de los dominios cubiertos.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste; se hereda del Qwen2.5-7B-Instruct base, pero el autor no la verifica ni la publica.
- Cobertura idiomática limitada: solo cinco idiomas declarados (de, bs, hr, sr, en); no se garantiza rendimiento en otros.
- Licencia: Apache 2.0 permite uso comercial, pero el autor reclama la titularidad del nombre OpenAmer-Max, del adaptador y de los datos de entrenamiento; conviene revisar si el uso del nombre comercial está restringido.
- Distribución: solo se publica la cuantización Q4_K_M; no hay pesos fp16 ni safetensors, lo que limita la integración con frameworks que requieren pesos completos (vLLM, TGI) y la reproducibilidad del ajuste.
- Tamaño del repo: 56,6 GB, inusualmente grande para un único archivo GGUF de 4,4 GB, lo que sugiere artefactos adicionales o históricos no documentados; conviene verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Página del proyecto OpenAmer: https://openamer-max.github.io
- Apoyo vía PayPal: https://www.paypal.com/qrcodes/p2pqrc/BVZD4HRJ9G6YG
- Contacto para patrocinio empresarial: openamer-max@proton.me
