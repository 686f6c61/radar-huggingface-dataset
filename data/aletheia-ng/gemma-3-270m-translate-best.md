# Aletheia-ng/gemma-3-270m-translate-best

## Resumen

`gemma-3-270m-translate-best` es un modelo de traduccion automatica desarrollado por Aletheia-ng (Aletheia AI) que traduce de ingles a 77 lenguas africanas. Se construye sobre `google/gemma-3-270m-it`, un transformer decoder-only de 268.098.176 parametros, afinado primero con aprendizaje supervisado y despues con GRPO (Group Relative Policy Optimization). El modelo es unidireccional: solo va de ingles a lengua africana, y el idioma destino se selecciona escribiendo su nombre en el prompt.

Su relevancia radica en la cobertura linguistica: 77 lenguas destino entrenadas con RL, con representacion de familias como niger-congo, afroasiatica, nilo-sahariana y khoisan, ademas de criollos. Un modelo de solo 270M parametros que alcanza chrF++ medio de 31,7 en el subconjunto core de FLORES+ devtest (45 lenguas) y 34,1 en el extendido, partiendo de 25,1 y 28,7 antes del RL. Frente a NLLB-200-3.3B queda 3,1 chrF++ por debajo en las 44 lenguas compartidas, pero con dos ordenes de magnitud menos de parametros.

El modelo genera una etiqueta de tres letras delante de la traduccion (por ejemplo `yor `), que el usuario debe eliminar. La licencia permite uso comercial con atribucion obligatoria a Aletheia AI y sujeta tambien a los terminos de uso de Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), afinado con SFT + GRPO |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM usa `max_model_len=4096` |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; repo de 1,1 GB) |
| Idiomas soportados | Ingles como origen; 77 lenguas africanas destino entrenadas con RL (mas 8 en zero-shot no soportado) |
| Licencia | other: uso comercial libre con atribucion obligatoria a "Translation models by Aletheia AI"; aplican ademas los Gemma Terms of Use y la Prohibited Use Policy |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de la familia Gemma 3 con 268M parametros. El pipeline de entrenamiento consta de dos fases: primero un ajuste fino supervisado (SFT) sobre pares ingles-lengua africana, y despues GRPO, una variante de RL con estimacion de ventaja relativa por grupo, que eleva el rendimiento de forma sustancial (de chrF++ 25,1 a 31,7 en el core de FLORES+ y de 28,7 a 34,1 en el extendido).

El prompt de entrenamiento es estricto: un unico turno de usuario con el formato `Translate the text to {Language}:  {English text}`, con dos espacios tras los dos puntos y sin mensaje de sistema. La salida sigue el patron `{tag} {traduccion}` seguido de `<end_of_turn>`. La decodificacion recomendada es greedy (`do_sample=False`); beam search con 4 haces aporta +0,66 chrF++, mientras que una penalizacion de repeticion de 1,1 resta 1,48 chrF++ y el muestreo aleatorio empeora el resultado. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Traduccion unidireccional de ingles a 77 lenguas africanas, seleccionando el destino por nombre en el prompt.
- Emision de etiqueta de tres letras del idioma destino antes de la traduccion.
- Cobertura de lenguas con escritura latina, mas amharico y tigrina en escritura etiope.
- Manejo de una frase o parrafo corto por prompt; el documento completo debe dividirse en frases.
- Generacion de texto autoregresiva estandar (hereda las capacidades del modelo base Gemma 3 270M-it, aunque el ajuste esta orientado a traduccion).
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Traduccion de contenido editorial y noticias a lenguas africanas: el modelo traduce frases o parrafos cortos en una sola llamada, adecuado para redacciones que publiquen en yoruba, hausa, suajili o zulu con revision humana posterior.
- Localizacion de interfaces y microcopy: cadenas cortas (mensajes de error, botones, avisos) se traducen una a una con decodificacion greedy, lo que da resultados deterministas y reproducibles en pipelines de CI.
- Atencion al cliente en lenguas locales: integrado en un servicio de mensajeria, traduce respuestas generadas en ingles a la lengua del usuario; su tamano de 270M permite desplegarlo en CPU o GPU de gama baja.
- Traduccion de material sanitario y educativo: frases de folletos, consentimientos o lecciones se traducen por unidades, con la advertencia de dividir documentos largos porque la finalizacion greedy cae al 31% a 4.096 tokens de origen.
- Generacion de subtitulos y transcripciones: cada segmento de subtitulo se traduce de forma independiente, encajando con la recomendacion de una frase por prompt.
- Investigacion en traduccion de bajos recursos: el modelo sirve como linea base ligera y reproducible (pesos abiertos, decodificacion determinista) para experimentos con GRPO y para comparar con NLLB-200.
- Procesamiento por lotes multilingue: con vLLM se pueden enviar conversaciones para varias lenguas destino en una sola llamada, util para generar corpus paralelos a escala.

## Benchmarks y rendimiento

Resultados en FLORES+ devtest con decodificacion greedy, chrF++ medio:

| Conjunto | Antes de RL | Despues de RL (modelo final) |
|---|---|---|
| Core (45 lenguas) | 25,1 | 31,7 |
| Extendido | 28,7 | 34,1 |

Comparativa en las 44 lenguas compartidas con NLLB-200 (subconjunto core):

| Modelo | Parametros | Diferencia chrF++ frente al modelo |
|---|---|---|
| NLLB-200-3.3B | 3.300M | +3,1 (mejor) |
| NLLB-200-distilled-600M | 600M | +0,7 (mejor) |
| gemma-3-270m-translate-best | 268M | referencia |

Ajustes de decodificacion medidos (20 lenguas x 200 frases): beam search de 4 haces +0,66 chrF++ frente a greedy; penalizacion de repeticion 1,1 resta 1,48 chrF++; el muestreo aleatorio es peor que greedy.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16 el modelo ocupa aproximadamente 0,54 GB; en fp32 unos 1,07 GB. El repo completo pesa 1,1 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, 4060, 4090) e incluso en CPU para inferencia por frases.
- GPU profesionales (A100, H100) no son necesarias; solo tienen sentido para servir muchas peticiones concurrentes.
- Despliegue soportado: Transformers (`AutoModelForCausalLM`), vLLM (ejemplo con `max_model_len=4096`), y por compatibilidad con Gemma 3, llama.cpp u Ollama si se generan pesos GGUF (no verificados en la informacion disponible).
- El repo incluye el tag `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cobertura | Licencia | chrF++ core |
|---|---|---|---|---|---|
| gemma-3-270m-translate-best | 268M | no disponible | Ingles a 77 lenguas africanas | Comercial con atribucion + Gemma Terms | 31,7 |
| NLLB-200-3.3B | 3.300M | no disponible | 200 lenguas, bidireccional | CC-BY-NC 4.0 (no comercial) | +3,1 frente a este |
| NLLB-200-distilled-600M | 600M | no disponible | 200 lenguas, bidireccional | CC-BY-NC 4.0 (no comercial) | +0,7 frente a este |
| google/gemma-3-270m-it (base) | 268M | no disponible | Multilingue general | Gemma Terms of Use | no disponible |

La ventaja practica del modelo de Aletheia es la licencia comercial y el tamano reducido; su desventaja es la unidireccionalidad y una cobertura limitada a lenguas africanas.

## Limitaciones y advertencias

- Solo traduce de ingles a lengua africana; no soporta el sentido inverso ni otros pares.
- Ocho lenguas del prompt estan marcadas como zero-shot no soportado (`nde`, `fat`, `knc`, `gaa`, `men`, `luy`, `tzm`, `ful`); en `nde` y `knc` el modelo ni siquiera emite la etiqueta.
- El prompt debe respetarse al pie de la letra (dos espacios tras los dos puntos, sin mensaje de sistema); desviarse puede degradar la calidad.
- La salida incluye una etiqueta de tres letras que hay que eliminar manualmente.
- En documentos completos la tasa de finalizacion greedy cae drasticamente (98% a 64 tokens de origen, 31% a 4.096); es obligatorio segmentar en frases.
- El muestreo y la penalizacion de repeticion empeoran la calidad; hay que usar decodificacion greedy o beam search.
- Riesgo de alucinacion y de traducciones inexactas en terminologia especializada, dado el tamano del modelo base (270M).
- Sesgos linguisticos: el rendimiento varia por lengua (la model card solo da medias agregadas); las lenguas con menos datos en FLORES+ u otros benchmarks pueden degradarse.
- Licencia: uso comercial permitido con atribucion obligatoria a "Translation models by Aletheia AI" y cita del paper asociado; ademas se aplican los Gemma Terms of Use y la Prohibited Use Policy.
- El modelo se creo y actualizo el 23 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- [Hugging Face: Aletheia-ng/gemma-3-270m-translate-best](https://huggingface.co/Aletheia-ng/gemma-3-270m-translate-best)
- [Modelo base: google/gemma-3-270m-it](https://huggingface.co/google/gemma-3-270m-it)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- [Gemma Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy)
- Paper asociado: citado en la model card, pero sin enlace disponible en la informacion proporcionada.
