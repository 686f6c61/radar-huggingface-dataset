# ProCreations/minima-spellcheck

## Resumen

Minima Spellcheck es un modelo de corrección ortográfica y gramatical (token-classification) desarrollado por ProCreations (SSH), que adapta el encoder LiquidAI LFM2.5-Encoder-350M-Spellchecker a un formato de pesos ternarios W1.58A8 (1,58 bits). El objetivo es ofrecer un corrector de texto ligero y eficiente que pueda ejecutarse en CPU con un consumo de memoria reducido, manteniendo una calidad cercana al modelo original. La relevancia de este modelo radica en su capacidad para funcionar en hardware de consumo sin necesidad de GPU, lo que democratiza el acceso a herramientas de corrección automática de texto.

La arquitectura se basa en un encoder transformer con 157,5 millones de parámetros, cuantizado a valores ternarios {-1, 0, +1} y empaquetado en un formato físico I2_S (cuatro trits por byte). El modelo mantiene una ventana de contexto de 8.192 tokens y se distribuye bajo la licencia LFM Open License v1.0. Incluye un adaptador de recuperación con rango 128 y tamaño de grupo 32, y ofrece dos backends de inferencia CPU: un empaquetado FBGEMM INT8 por defecto y un kernel AVX2/NEON de 2 bits estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (basado en LiquidAI LFM2.5-Encoder-350M-Spellchecker) |
| Parametros totales | 157.487.788 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | W1.58A8 (ternario, 1.585 bits), empaquetado I2_S, con opcion de kernel 2-bit AVX2/NEON |
| Idiomas soportados | No disponible (los ejemplos publicados son en ingles) |
| Licencia | LFM Open License v1.0 (https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-Spellchecker/blob/main/LICENSE) |
| Formato de pesos | safetensors (con empaquetado ternario I2_S) |

## Arquitectura y entrenamiento

El modelo es una adaptacion cuantizada del encoder LiquidAI LFM2.5-Encoder-350M-Spellchecker, que originalmente es un modelo denso de 350 millones de parametros. La version Minima convierte los pesos a valores ternarios {-1, 0, +1} con una precision efectiva de 1,585 bits por peso, y utiliza un adaptador de recuperacion (recovery adapter) con rango 128 y grupo de tamano 32 para compensar la perdida de informacion. El entrenamiento consistio en 1.000 pasos de destilacion utilizando texto corrupto de FineWeb como entrada y el modelo LiquidAI original como profesor (teacher). No se menciona el uso de RLHF ni DPO. La innovacion principal es el empaquetado ternario que permite una inferencia CPU rapida y de baja memoria, con dos backends disponibles: un empaquetado FBGEMM INT8 por defecto y un kernel AVX2/NEON estricto de 2 bits activable mediante la variable de entorno `MINIMA_CPU_BACKEND=i2s`. El modelo se distribuye con la libreria `minima-lfm`, que es de codigo abierto con licencia MIT.

## Capacidades

- Correccion ortografica y gramatical de texto en ingles (los ejemplos publicados son en ingles, aunque no se especifica oficialmente el soporte de idiomas).
- Deteccion de errores y correccion en contexto, gracias a una ventana de 8.192 tokens.
- Ejecucion en CPU con baja latencia: el smoke test reporta 110 ms de latencia en CPU para una frase corta.
- Inferencia eficiente en memoria: el archivo de pesos pesa 226 MB, y el modelo puede ejecutarse en hardware de consumo sin GPU.
- Soporte para dos backends de inferencia CPU: empaquetado FBGEMM INT8 (por defecto) y kernel AVX2/NEON de 2 bits (estricto).
- Integracion sencilla mediante la API de `minima-lfm` con el metodo `MinimaModel.correct()`.
- No incluye soporte para tool calling, agentes, vision, audio ni modo thinking (es un modelo de correccion de texto, no generativo).

## Casos de uso

- Preprocesamiento de texto en pipelines de NLP: el modelo puede limpiar y corregir texto de entrada antes de pasarlo a modelos de analisis de sentimiento, clasificacion o extraccion de informacion, reduciendo el ruido y mejorando la precision aguas abajo.
- Correccion en tiempo real en editores de texto y procesadores de palabra: gracias a su baja latencia en CPU (110 ms por frase corta), puede integrarse en aplicaciones de escritorio o web para sugerir correcciones mientras el usuario escribe.
- Asistencia a escritura para hablantes no nativos de ingles: el modelo puede ayudar a usuarios que cometen errores gramaticales u ortograficos comunes, proporcionando correcciones contextuales.
- Limpieza de datos de redes sociales y foros: texto informal con errores frecuentes puede ser normalizado para analisis posteriores, por ejemplo en monitorizacion de marca o investigacion social.
- Correccion de transcripciones de voz: los sistemas de reconocimiento de voz a menudo producen errores ortograficos; este modelo puede corregirlos antes de almacenar o procesar la transcripcion.
- Herramientas de accesibilidad: personas con dislexia o dificultades de escritura pueden beneficiarse de una correccion automatica rapida y local, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como ERRANT, MLLU o HumanEval) en la informacion disponible. La model card incluye diagnosticos de acuerdo con el modelo profesor (teacher agreement) tras la destilacion de 1.000 pasos, con el reranker denso desactivado:

| Diagnostico | Resultado |
|---|---:|
| Acuerdo top-1 de etiquetas dentro de los candidatos del profesor | 99,51% |
| Acuerdo top-1 de deteccion de errores | 99,41% |
| Acuerdo exacto de correccion en ejemplos held-out y de referencia | 70,0% (14/20) |
| Acuerdo exacto en los cuatro ejemplos publicados | 100% (4/4) |

Estos valores son diagnosticos de concordancia con el modelo original, no una evaluacion independiente de calidad. La latencia de inferencia en CPU se reporta en 110 ms para el ejemplo del smoke test. No se proporcionan comparaciones con otros correctores ortograficos.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en CPU, sin necesidad de GPU.
- El archivo de pesos ocupa 226 MB, por lo que cabe en cualquier maquina con al menos 512 MB de RAM libre.
- La inferencia utiliza un empaquetado FBGEMM INT8 por defecto, que requiere una CPU con soporte para instrucciones AVX2 o NEON (en ARM). El kernel estricto de 2 bits tambien requiere AVX2 o NEON.
- Se puede ejecutar en una Raspberry Pi 4 o similar, aunque la latencia sera mayor que en un PC moderno.
- Para despliegue, se usa la libreria `minima-lfm` (instalable via pip desde GitHub). No se menciona compatibilidad con vLLM, Ollama, TGI o llama.cpp.
- El modelo base original (LiquidAI LFM2.5-Encoder-350M-Spellchecker) incluye un reranker denso opcional de 1,42 GB, pero en esta version esta desactivado para mantener el perfil de memoria bajo.

## Comparativa con modelos similares

No se dispone de comparativas con modelos similares en la informacion proporcionada. Este modelo es una variante cuantizada del LiquidAI LFM2.5-Encoder-350M-Spellchecker, por lo que su rendimiento teorico es similar al de ese modelo, pero con un consumo de memoria mucho menor. Otros correctores ortograficos como NeuSpell o SymSpell existen, pero no se han encontrado datos comparativos directos con Minima Spellcheck en las fuentes revisadas.

## Limitaciones y advertencias

- La validacion se basa unicamente en acuerdos con el modelo profesor, no en benchmarks independientes como ERRANT, por lo que la calidad real puede diferir.
- El modelo solo ha sido probado con ejemplos en ingles; no hay evidencia de soporte multilingue.
- Al ser un modelo de correccion, puede introducir cambios incorrectos en textos ambiguos o con errores poco frecuentes.
- El reranker denso opcional del modelo base esta desactivado; si se activa, el perfil de memoria aumenta considerablemente (1,42 GB adicionales).
- La licencia LFM Open License v1.0 puede tener restricciones para uso comercial; se debe revisar el texto completo de la licencia.
- El modelo tiene 157 millones de parametros, pero al ser ternario, la capacidad de representacion es limitada en comparacion con un modelo denso del mismo tamano, lo que podria afectar a la precision en casos complejos.
- No se proporcionan datos sobre sesgos o alucinaciones especificos del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/minima-spellcheck
- Repositorio del runtime Minima: https://github.com/SSHDotCodes/minima
- Demo en CPU: https://huggingface.co/spaces/ProCreations/minima-spellcheck
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-Spellchecker/blob/main/LICENSE
