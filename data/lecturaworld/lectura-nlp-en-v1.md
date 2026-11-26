# lecturaworld/lectura-nlp-en-v1

## Resumen

Lectura NLP-EN v1 es un módulo de procesamiento del lenguaje natural para inglés (variante estadounidense) desarrollado por lecturaworld dentro de la generación v1 (2026) de la plataforma Lectura. A diferencia de un modelo de pesos abiertos convencional, este repositorio no contiene ningún modelo: es la ficha de un paquete Python (`lectura-nlp-en`) que expone funciones de lectura (texto a fonética IPA), escritura (fonética a texto), análisis morfosintáctico con Universal Dependencies, corrección ortográfica y gramatical, y traducción inglés-francés como módulo opcional.

El módulo se apoya en tres modos de ejecución: una API pública remota (`https://api.lectura.world`), un modo local con modelos bajo licencia comercial instalados en la máquina del usuario, y un modo degradado sin base léxica. El código es AGPL-3.0-or-later y las tablas de reglas se distribuyen bajo CC BY-SA 4.0. El paquete incluye el léxico inglés (validez, frecuencia, homófonos, rimas, variantes británicas y americanas) mediante la dependencia `lectura-lexicon`.

La relevancia del proyecto reside en su enfoque pedagógico y en la cobertura de tareas de lingüística computacional clásica (G2P, P2G, POS tagging, lematización, dependencias, corrección explicada) empaquetadas como API Python, con un banco de pruebas publicado sobre el WikEd Error Corpus. No se trata de un modelo generativo de gran escala ni de un LLM conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos no se publican; el modulo expone una API Python) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (estadounidense); el corrector ofrece explicaciones en frances o ingles; traduccion EN-FR opcional |
| Licencia | codigo AGPL-3.0-or-later; tablas de reglas CC BY-SA 4.0; modelos locales bajo licencia comercial |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

El repositorio no publica arquitectura ni pesos. Según la model card, el Analizador se preentrena sobre frases de Wikipedia en inglés etiquetadas automáticamente y después se afina sobre corpus anotados a mano de Universal Dependencies en inglés (English-EWT, Atis, ESLSpok, CHILDES, CTeTex; CC BY-SA 4.0). El modelo no incorpora ninguna frase literal de esos corpus. El modelo de palabra y el léxico embebido derivan del léxico inglés de Lectura, construido a partir de Wikcionario vía kaikki.org, CMUdict, wordfreq y UD English-EWT (CC BY-SA 4.0).

El módulo combina reglas y modelos: las tablas de reglas (con aviso completo de CMUdict en `ATTRIBUTION.md`) cubren la conversión grafema-fonema y fonema-grafema, mientras que el análisis morfosintáctico y la corrección gramatical se apoyan en modelos entrenados. La corrección es de tipo pedagógico: cada corrección se acompaña de una explicación en francés o inglés. No se documentan detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Lectura (G2P): conversión de texto a transcripción fonética en IPA, con uniones de frase, formas débiles y fuertes, números, fechas, siglas y fórmulas.
- Escritura (P2G): conversión de transcripción fonética a texto ortográfico.
- Análisis morfosintáctico: categoría gramatical, rasgos, lema y dependencia de cada palabra según Universal Dependencies.
- Segmentación con contracciones: separación de formas como *ca + n't* o *I + 'm*.
- Corrección ortográfica y gramatical (opción `correcteur`) con explicación de cada corrección en francés o inglés.
- Traducción inglés-francés como paquete separado (`lectura-traducteur`), que requiere además el Analizador francés.
- Léxico inglés incluido: validez, frecuencia, homófonos, rimas y variantes ortográficas británicas y americanas.
- Tres modos de ejecución: API remota, local con modelos instalados y degradado sin base léxica.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enseñanza de pronunciación del inglés: el módulo genera transcripciones IPA con formas débiles y fuertes y uniones de frase, útil para materiales didácticos y herramientas de lectura guiada.
- Síntesis de voz y pipelines TTS: la salida fonética con acentos y uniones de frase sirve como entrada a motores de síntesis que aceptan IPA.
- Anotación lingüística de corpus: el análisis con categoría, rasgos, lema y dependencia UD permite construir árboles de dependencias y capas morfológicas sobre textos ingleses.
- Corrección pedagógica de textos: el corrector devuelve la frase corregida junto con una explicación de cada error, adecuado para plataformas de aprendizaje de inglés que necesitan justificar las correcciones.
- Preprocesado para búsqueda y recuperación: la lematización y el etiquetado POS facilitan la normalización de consultas y la indexación de documentos en inglés.
- Diccionarios y herramientas de rima: el léxico incluido (homófonos, rimas, variantes británicas y americanas) permite construir buscadores léxicos y generadores de rimas.
- Traducción inglés-francés en flujos editoriales: mediante el paquete `lectura-traducteur`, para borradores que después revisa un traductor humano.

## Benchmarks y rendimiento

El banco publicado (25/11/2026, paquete construido, ejecución local en CPU, referencia humana) evalúa únicamente el corrector sobre el WikEd Error Corpus: 3.200 frases del conjunto de test congelado, 400 por familia de errores.

| Modo | Precision | Recalls | F0,5 |
|---|---|---|---|
| Sugerencias | 88,7 % | 39,9 % | 71 |
| Automatico | 90,3 % | 35,4 % | 69 |

La F0,5 pondera la precisión el doble que el recuerdo: el corrector propone pocas correcciones, pero casi siempre son correctas. El autor indica que no existe todavía un banco de frases inglesas con fonética verificada manualmente, por lo que la lectura y la escritura inglesas no están cuantificadas. No se han publicado resultados de benchmarks de análisis morfosintáctico ni de traducción en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican tamaños de modelo).
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible.
- El banco de pruebas se ejecutó en local sobre CPU, lo que sugiere que el modo local está pensado para funcionar sin GPU, aunque no se detallan requisitos mínimos.
- Opciones de despliegue: paquete Python `pip install lectura-nlp-en` (modo API), `pip install "lectura-nlp-en[correcteur]"` (modo local con modelos bajo licencia) y modo degradado sin base léxica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Modelo publicado | Notas |
|---|---|---|---|---|---|
| Lectura NLP-EN v1 | Modulo NLP (G2P, P2G, UD, correccion) | EN (corrector EN/FR) | AGPL-3.0-or-later + comercial | No | API o modelos locales bajo licencia |
| eSpeak NG | Sintetizador con G2P por reglas | Multiples | GPL-3.0 | Si (reglas) | Enfoque TTS, sin analisis UD ni correccion |
| CMUdict | Diccionario de pronunciacion | EN | BSD-like | Si (datos) | Solo lexico de pronunciacion, sin G2P general |
| spaCy (modelos EN) | Pipeline NLP (POS, lemas, dependencias) | Multiples | MIT | Si | No incluye G2P ni correccion explicada |

La comparación es aproximada: no se dispone de datos públicos de rendimiento de Lectura NLP-EN en análisis morfosintáctico que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene modelos: sin la API o sin los modelos locales bajo licencia comercial, el módulo no puede ejecutar las funciones principales.
- En modo API, los textos, pronunciaciones y palabras enviados se transmiten al servidor de Lectura (`https://api.lectura.world`); el uso es gratuito, sin clave y con límite de uso.
- En modo degradado (sin base Lexicon), las funciones léxicas responden "lexique indisponible" sin lanzar error, lo que puede pasar desapercibido en producción.
- Solo cubre inglés estadounidense; no se documenta soporte de otras variedades ni de otros idiomas en el analizador.
- La lectura y la escritura inglesas no están evaluadas con un banco de referencia humana verificada; el único benchmark publicado es del corrector.
- El corrector prioriza precisión sobre recuerdo (F0,5), por lo que deja pasar una proporción alta de errores (recuerdo del 35-40 %).
- La licencia AGPL-3.0-or-later impone obligaciones de copyleft en servicios en red; el uso comercial fuera de la AGPL requiere licencia de pago (precios indicativos de 999 a 1.999 € HT según el pack).
- No se documentan sesgos, tasas de alucinación ni comportamiento en dominios especializados; al no ser un modelo generativo, el riesgo de alucinación se limita a las sugerencias del corrector y del traductor.
- La fecha de creación del repositorio (2026-11-26) y el banco de pruebas (25/11/2026) son posteriores a la fecha de esta ficha; conviene verificar la vigencia de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/lecturaworld/lectura-nlp-en-v1
- Paquete PyPI: https://pypi.org/project/lectura-nlp-en/
- Paquete de traducción: https://pypi.org/project/lectura-traducteur/
- Léxico: https://pypi.org/project/lectura-lexicon/
- Documentación y código: https://github.com/maxcarriere/lectura-modules-v1
- Módulos Lectura: https://www.lectura.world/developpement/modules/
- Demo: https://lingua.lectura.world
- Obtención de licencias: https://lingua.lectura.world/modules/obtenir
- Política de privacidad de la API: https://www.lectura.world/confidentialite/#api
- Corpus WikEd (Grundkiewicz y Junczys-Dowmunt, PolTAL 2014): no disponible enlace directo en la información proporcionada
