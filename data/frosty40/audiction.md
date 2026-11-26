# Frosty40/Audiction

## Resumen

Audiction es un modelo de normalización de texto para síntesis de voz (TTS), desarrollado por el usuario Frosty40 y publicado en Hugging Face bajo licencia Apache 2.0. Su función es convertir texto escrito en inglés en la forma hablada que un motor TTS debería pronunciar: expande números, fechas, monedas, unidades, acrónimos, direcciones web y correos electrónicos en palabras. No es un modelo generativo general, sino un componente especializado que se coloca delante de cualquier voz TTS.

Técnicamente es un fine-tuning de `google/byt5-small`, un transformer encoder-decoder byte-level con unos 299,6 millones de parámetros. Al operar a nivel de byte, evita problemas de vocabulario y tokenización con símbolos raros, cifras y formatos heterogéneos, algo habitual en tareas de normalización. El modelo se integra en un pipeline híbrido donde unas reglas deterministas en `verbalize.py` resuelven los casos seguros y el modelo solo interviene en las frases que las reglas dejan abiertas.

Su relevancia práctica está en que la normalización textual es un cuello de botella clásico en producción TTS: un fallo al leer "7:30 pm" o "$5-10" degrada la experiencia de voz de forma inmediata. Audiction propone un enfoque verificable: la salida del modelo se acepta solo si conserva las palabras originales en orden, solo añade formas habladas y no deja dígitos sin verbalizar. Está entrenado y ajustado para inglés estadounidense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder byte-level (ByT5) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, orientado a inglés estadounidense) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Audiction parte de `google/byt5-small`, un modelo ByT5 que procesa texto a nivel de byte en lugar de tokens de subpalabra. Esta elección encaja con la normalización: cifras, signos, abreviaturas y formatos como "1-800-555-0199" o "6'2"" no dependen de un vocabulario cerrado. El modelo se ha afinado para la tarea text2text de verbalización, con pipeline declarado como text-generation en la plataforma.

El sistema completo es híbrido. Primero, las reglas de `verbalize.py` verbalizan una frase cuando están seguras de todos sus componentes; su salida también se comprueba para detectar signos entre números que hayan quedado sin verbalizar. El modelo ByT5 afinado se aplica solo a las frases que las reglas dejan abiertas, y su lectura se acepta únicamente si supera una validación estricta: conserva las palabras originales en orden, todas las palabras añadidas son formas habladas (números, unidades, meses), cada unidad y moneda coincide con un símbolo del texto fuente y no queda ningún dígito. En caso contrario, se mantiene la salida de las reglas y el resto se deja tal cual.

El dataset de entrenamiento declarado es `HuggingFaceFW/fineweb`, aunque la model card no detalla el número de tokens, la composición exacta ni si hubo RLHF o DPO. La evaluación se realiza con conjuntos sintéticos generados a partir de plantillas no vistas en entrenamiento y con conjuntos de frases escritas a mano.

## Capacidades

- Normalización de texto escrito a forma hablada para TTS en inglés.
- Verbalización de moneda: dólares, libras y euros, céntimos, "99¢", "$5bn", "£100m", rangos como "$5-10" y uso adjetival ("a five dollar discount").
- Fechas y horas: horas de reloj, "10.30am", "8-10 am", duraciones ("3:05:12"), "Nov 21", "11/21", "2026-11-21", "28/06/2017", años, décadas y rangos como "1990-95".
- Números: ordinales, rangos, puntuaciones, porcentajes, decimales, fracciones y números mixtos, ratios ("2:1", "16:9"), valoraciones ("4.5/5"), tamaños ("8.5x11"), sumas ("2+2=4"), "3x" y "18+".
- Unidades: medidas de cocina, pantalla y red (tbsp, mL, fps, Mbps), grados, alturas ("6'2""), marcas de pulgada y coordenadas.
- Datos de contacto: teléfonos (incluidos 1-800 y 911), códigos postales, direcciones web y correos electrónicos.
- Palabras y códigos: abreviaturas (Dr., St., Ave., Jr., No., vs.), números romanos (Louis XIV, Super Bowl LX), acrónimos deletreados (NBA, FBI, ET), códigos de producto y modelo (MR16, F-150, PS5, 1080p) con plurales (B-52s, 747s), nombres con número (Boeing 737, Room 101, Flight 370, código de área 212), versiones de software (Python 3.12) y distancias de carrera (10K).
- No dispone de tool calling, function calling, capacidades de agente ni modo de razonamiento multi-paso; es un modelo especializado de normalización.
- Capacidad multilingüe limitada al inglés; el autor indica que está escrito para inglés estadounidense (dólares, °F y fechas mes/día).

## Casos de uso

- Preprocesado de guiones de radio y podcast: el modelo convierte guiones con horas, fechas y cifras en texto listo para locución TTS, evitando lecturas erróneas de "7:30 pm" o "Nov 21" antes de enviar el texto al motor de voz.
- Asistentes de voz y altavoces inteligentes: se coloca delante de la voz TTS para verbalizar respuestas de un LLM que contengan importes, porcentajes o rangos ("$5-10", "12.5%") de forma natural.
- Lectura de noticias y boletines financieros: normaliza cifras de mercado como "£100m", "up 12.5%" o "35-28" en resultados deportivos, manteniendo la forma hablada esperada por el oyente.
- Accesibilidad y lectores de pantalla: convierte direcciones web, correos electrónicos y números de teléfono en formas pronunciables ("news at example dot org", "one, eight hundred, five five five...") para usuarios con discapacidad visual.
- Automatización de atención telefónica: verbaliza códigos postales, números 1-800 y códigos de descuento ("SAVE twenty") en mensajes IVR generados dinámicamente antes de sintetizarlos.
- Localización de contenido técnico para audio: transforma especificaciones como "Python 3.12", "1080p", "60fps" o "MR16" en lecturas correctas para audiolibros técnicos, cursos y tutoriales en vídeo.
- Integración en pipelines de CI/CD de TTS: al ser un modelo pequeño (299,6 M de parámetros) y con reglas deterministas, puede ejecutarse como paso de validación que detecta dígitos sin verbalizar antes de publicar un audio.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La coincidencia exacta (exact match) se mide sobre la salida completa del pipeline híbrido.

| Evaluación | Pares o frases | Exact match |
|---|---|---|
| `eval/eval_synth.jsonl` (dinero, horas, fechas, números, unidades) | 2.000 | 1.000 (2.000/2.000) |
| `eval/eval_synth_v4.jsonl` (fracciones, fechas, títulos y calles, números romanos, acrónimos, distancias) | 2.000 | 1.000 (2.000/2.000) |
| `eval/eval_real_v2.jsonl` (líneas de radio escritas a mano) | 60 | 59/60 |
| `eval/eval_outside_v1.jsonl` (frases cotidianas) | 130 | 129/130 |
| `eval/eval_outside_v2.jsonl` (frases cotidianas) | 65 | 65/65 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 299,6 M de parámetros, en fp32 ocuparía aproximadamente 1,2 GB de pesos; en fp16, unos 0,6 GB; en int8, unos 0,3 GB. Estas cifras son estimaciones a partir del tamaño del modelo, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería poder ejecutar el modelo en fp16 o int8; una RTX 4090, A100 o H100 lo ejecutarían con holgura, aunque el modelo es lo bastante pequeño para GPUs consumer de gama baja.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como GTX 1650, RTX 3050 o superiores, así como en CPU para lotes pequeños.
- Opciones de despliegue: la model card indica `transformers>=4.46,<5` con PyTorch y `huggingface_hub`; el pipeline híbrido se ejecuta con los scripts `normalize.py` y `eval_hybrid.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor señala que las reglas deterministas tardan microsegundos; el modelo solo se invoca en las frases que las reglas dejan abiertas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audiction | 299,6 M | no disponible | Normalización de texto para TTS (inglés) | Apache 2.0 | Hugging Face |
| google/byt5-small | 299,6 M | no disponible | Texto a texto genérico byte-level | Apache 2.0 | Hugging Face |
| Modelos de normalización TTS basados en reglas (p. ej., módulos de verbalización de motores TTS) | no aplica | no aplica | Normalización determinista | variable | variable |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al estar entrenado sobre FineWeb y ajustado para inglés estadounidense, puede heredar sesgos del corpus y de las convenciones de EE. UU.
- Riesgo de alucinación: mitigado por el diseño híbrido, ya que la salida del modelo se descarta si no conserva las palabras originales en orden, añade palabras no habladas o deja dígitos sin verbalizar. Aun así, el pipeline puede dejar texto sin normalizar cuando las reglas y el modelo no alcanzan certeza.
- Limitaciones de idioma: solo inglés y con convenciones de EE. UU. (dólares, °F, fechas mes/día); no cubre otras variantes regionales ni otros idiomas.
- Limitaciones de contexto: no se especifica la longitud máxima de entrada; frases muy largas o con estructuras atípicas pueden quedar parcialmente sin normalizar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `google/byt5-small` y del dataset FineWeb.
- Caveats para producción: el modelo depende de scripts y reglas externas (`verbalize.py`, `normalize.py`); no es un modelo autónomo de generación de texto y su pipeline declarado como text-generation en Hugging Face puede inducir a error sobre su función real. Los resultados de evaluación son autocontenidos y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Frosty40/Audiction
- Modelo base: https://huggingface.co/google/byt5-small
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/HuggingFaceFW/fineweb
