# Manish2kh4/indictrans

## Resumen

`Manish2kh4/indictrans` es un conjunto de activos de ejecución (runtime assets) para la capa de transliteración de code-mixing del sistema Finesse TTS, identificada internamente como `utils/codemix_xlit`. No es un modelo generativo de propósito general, sino un paquete de recursos que permite reescribir palabras inglesas embebidas en texto en lenguas índicas a la grafía nativa de cada lengua, con la pronunciación que un hablante de inglés índico emplearía, de modo que un motor TTS en esa lengua las lea correctamente. También cubre el caso inverso: texto escrito íntegramente en caracteres latinos se lee palabra a palabra y las palabras propias de la lengua se devuelven a su grafía nativa.

El componente central es el modelo IndicXlit en→indic v1.0 de AI4Bharat, convertido a CTranslate2, acompañado de léxicos revisados y generados, diccionarios de frecuencias para reordenar candidatos, pronunciaciones inglesas derivadas de CMUdict, tablas de romanización por lengua y listas de nombres propios. El paquete cubre 22 lenguas índicas (Dogri y Santali se atienden a través del modelo de hindi) y se distribuye como un bundle de aproximadamente 0,2 GB con manifiesto de integridad SHA-256.

Su relevancia es práctica: el code-mixing inglés–lengua índica es omnipresente en conversación real y en texto digital, y los motores TTS suelen fallar al pronunciar tokens latinos dentro de una frase en devanagari, bengalí o tamil. Este paquete resuelve ese problema concreto sin requerir un LLM grande, y su licencia agregada es "other" porque cada archivo conserva su licencia de origen (MIT, BSD-style, CC BY-SA 4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer IndicXlit en→indic v1.0 convertido a CTranslate2, más léxicos, diccionarios de frecuencias y tablas de romanización |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por palabra/token, no por secuencia larga) |
| Tipos de cuantizacion | no disponible (formato CTranslate2; no se documentan variantes de cuantización) |
| Idiomas soportados | hi, mr, ne, mai, sa, brx, kok, doi, gu, pa, or, ta, te, kn, ml, mni, bn, as, ur, sd, ks, sat (22 lenguas; Dogri y Santali vía el modelo de hindi) |
| Licencia | other (MIT para modelo y frecuencias de AI4Bharat; BSD-style para CMUdict; CC BY-SA 4.0 para listas derivadas de wordfreq y tablas derivadas de Dakshina) |
| Formato de pesos | CTranslate2 (modelo); JSON (léxicos, frecuencias, tablas de romanización, ranker, manifiesto) |

## Arquitectura y entrenamiento

El núcleo es el transformer IndicXlit en→indic v1.0 de AI4Bharat, un modelo de transliteración entrenado para convertir texto en caracteres latinos a grafías índicas, aquí convertido a CTranslate2 para inferencia eficiente en CPU y GPU. Sobre ese núcleo, el paquete añade una capa de decisión léxica y estadística: léxicos revisados manualmente (`lexicon/<code>.reviewed.json`) y generados (`lexicon/<code>.generated.json`), diccionarios de frecuencia podados para reordenar candidatos (`rescore/`), frecuencias nativas para las once lenguas sin lista de rescoring (`native_freq/`), y un ranker de candidatos (`ranker.json`).

La innovación no está en el entrenamiento del transformer, sino en la orquestación de recursos heterogéneos. Las tablas `roman/<code>.json` capturan cómo se escribe cada lengua en latín, con qué frecuencia y qué otras palabras puede representar una misma cadena (`alts`); `roman_ctx/<code>.json` resuelve ambigüedades usando el contexto vecino cuando una grafía latina corresponde a dos palabras distintas. `names/<code>.json` contiene nombres propios, apellidos y topónimos índicos escritos en latín con su forma nativa, y se consulta cuando la palabra aparece capitalizada (por ejemplo, Sneha → स्नेहा y no स्नेह). Las pronunciaciones inglesas provienen de CMUdict (`cmudict.json`, `english_*`), y `indic_words.json` marca palabras índicas que deben leerse de forma nativa. Las tablas de romanización de bn, gu, hi, kn, ml, mr, pa, sd, ta, te y ur derivan de las frases romanizadas del dataset Dakshina (Roark et al. 2020). No se documentan fases de RLHF ni DPO, ni el volumen de tokens de entrenamiento del transformer original.

## Capacidades

- Transliteración en→indic de palabras inglesas embebidas en texto índico, con la grafía nativa de la lengua de destino.
- Transliteración inversa: palabras propias de la lengua escritas en latín se devuelven a su grafía nativa.
- Lectura palabra a palabra de texto escrito íntegramente en caracteres latinos.
- Desambiguación por contexto de grafías latinas ambiguas mediante `roman_ctx/`.
- Resolución de nombres propios, apellidos y topónimos con detección de capitalización.
- Reordenación de candidatos de transliteración mediante diccionarios de frecuencia y ranker.
- Cobertura de 22 lenguas índicas, incluidas las de bajos recursos como brx, kok, doi, mni, sat, ks y sd.
- Integración como capa de preprocesado para motores TTS en lenguas índicas.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: no es un modelo de instrucciones.

## Casos de uso

- Preprocesado para TTS en hindi: antes de sintetizar, el paquete reescribe los términos ingleses frecuentes (por ejemplo, marcas o tecnicismos) a devanagari con la pronunciación esperada, evitando que el motor TTS los deletree o los ignore.
- Atención al cliente por voz en lenguas índicas: en respuestas generadas que mezclan inglés y lengua local, la capa normaliza los tokens latinos para que la síntesis sea inteligible en hindi, marathi, tamil o bengalí.
- Normalización de texto para subtitulado y doblaje: convierte guiones con code-mixing a una forma consistente por lengua antes de pasarlos al motor de voz.
- Localización de nombres propios en asistentes de voz: la lista `names/<code>.json` permite pronunciar correctamente nombres de persona y topónimos escritos en latín en una frase en lengua índica.
- Procesado de entradas de usuario en sistemas de dictado: cuando el usuario teclea en latín una palabra propia de su lengua, la capa la devuelve a la grafía nativa antes de la síntesis o del análisis posterior.
- Aplicaciones de accesibilidad para lectores de pantalla en lenguas índicas: normaliza el texto mixto antes de la lectura en voz alta, mejorando la inteligibilidad de fragmentos con anglicismos.
- Investigación en code-mixing: las tablas de romanización y los léxicos revisados sirven como recursos anotados para estudiar patrones de escritura latina de lenguas índicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,2 GB y el transformer convertido a CTranslate2 es de tamaño reducido, por lo que la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; CTranslate2 permite despliegue en GPU consumer y profesional sin requisitos documentados.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del bundle; no se documenta la GPU mínima.
- Opciones de despliegue: CTranslate2 como runtime principal; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Lenguas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Manish2kh4/indictrans | Paquete de transliteración code-mix sobre IndicXlit (CTranslate2) | 22 índicas | other (MIT + BSD + CC BY-SA 4.0) | Hugging Face, repo de 0,2 GB |
| AI4Bharat IndicXlit | Modelo de transliteración en→indic | Lenguas índicas (según variante) | MIT | GitHub y pesos publicados por AI4Bharat |
| Google Dakshina | Dataset de romanización | 12 lenguas índicas | CC BY-SA 4.0 | GitHub de Google Research |

La comparativa se limita a las fuentes citadas en la model card; no se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no admite instrucciones; su función es la transliteración y normalización léxica.
- La licencia agregada es "other" y cada archivo conserva su licencia; el uso comercial requiere revisar individualmente MIT, BSD-style y CC BY-SA 4.0, y esta última impone compartir igual.
- La cobertura de Dogri y Santali depende del modelo de hindi, lo que puede degradar la precisión en esas lenguas.
- La desambiguación contextual se limita a las tablas `roman_ctx/`; casos no cubiertos pueden resolverse con la opción más frecuente y producir errores.
- Los léxicos generados y las listas de nombres pueden contener sesgos de cobertura hacia determinadas regiones o comunidades.
- Riesgo de transliteración incorrecta en nombres propios poco frecuentes o de origen no índico.
- El paquete está atado a la versión 1.4.16+12d0f820ea16 y a un manifiesto SHA-256; modificaciones locales rompen la verificación de integridad.
- No se documentan métricas de precisión ni evaluación cuantitativa, lo que dificulta estimar su calidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Manish2kh4/indictrans
- IndicXlit (AI4Bharat): https://github.com/AI4Bharat/IndicXlit
- CMU Pronouncing Dictionary: https://github.com/cmusphinx/cmudict
- wordfreq: https://github.com/rspeer/wordfreq
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Dakshina dataset: https://github.com/google-research-datasets/dakshina
