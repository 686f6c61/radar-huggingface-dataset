# lecturaworld/lectura-nlp-fr-v1

## Resumen

Lectura NLP-FR v1 es un módulo de procesamiento del lenguaje natural para francés publicado por Lectura en 2026. A diferencia de un modelo generativo al uso, el repositorio de Hugging Face no contiene pesos: es la ficha de un paquete Python (`lectura-nlp-fr`, en PyPI) que expone tres funciones especializadas: un analizador (conversión grafema-fonema en AFI con liaison y e caduc, fonema-grafema, etiquetado POS con Universal Dependencies y lematización), un corrector ortográfico y gramatical pedagógico, y un traductor francés-inglés opcional.

El módulo puede ejecutarse contra la API pública de Lectura (los textos salen de la máquina) o en local con modelos bajo licencia comercial instalados por el usuario. Está pensado para aplicaciones educativas y de escritura asistida en francés, donde la calidad fonética y la explicación de las correcciones importan más que la generación libre de texto.

Su relevancia radica en los resultados publicados en bancos especializados: 5,8 % de PER estricto en CSF18 (frente al 12,9 % de espeak-ng), 97,5 % de acierto en UPOS sobre UD French-PUD y una F0,5 de 60 en WiCoPaCo para el corrector. Son cifras de nicho, pero muy por encima de las alternativas abiertas en tareas fonéticas francesas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos no se publican; el modulo combina modelos neuronales de analisis con un lexico y tablas de reglas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | frances (fr); el modulo traductor cubre frances-ingles |
| Licencia | AGPL-3.0-or-later para el codigo; los modelos locales requieren licencia comercial bajo peticion |
| Formato de pesos | no disponible (no se publican pesos; distribucion como paquete Python) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de los modelos. La model card indica que el Analizador se preentrena sobre frases de acceso publico (enciclopedias, literatura de dominio publico y dialogos) etiquetadas automaticamente, y despues se afina sobre corpus anotados a mano de Universal Dependencies, incluido UD French-Sequoia (LGPL-LR). El modelo de palabra aislada y el lexico embebido derivan de LeXiK (Maxime Carriere, Lectura, 2026, CC BY-SA 4.0, alojado en ORTOLANG con handle 11403/lexik).

El sistema combina componentes neuronales con un lexico estructurado (validez, frecuencia, homofonos, rimas, conjugacion) y tablas de reglas para la conversion fonetica. Esa hibridacion explica el rendimiento en tareas de fonetica francesa, donde un modelo puramente estadistico suele fallar en liaison, e caduc y lectura de cifras y simbolos. No se especifica el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Lectura (grafema a fonema): conversion de texto a AFI con gestion de liaison, e caduc, numeros, siglas y formulas como "8 h 30" o "3,50 EUR".
- Escritura (fonema a grafema): reconstruccion de la ortografia a partir de la transcripcion fonetica.
- Analisis morfosintactico: categoria (UPOS), rasgos morfologicos, lema y dependencia sintactica en el esquema Universal Dependencies.
- Segmentacion de texto en frases y palabras.
- Correccion ortografica y gramatical pedagogica: cada correccion se acompana de una explicacion en frances.
- Traduccion frances-ingles e ingles-frances mediante el paquete separado `lectura-traducteur`, que requiere tambien el Analizador ingles.
- Lexico integrado con frecuencia, homofonos, rimas y conjugacion.
- Tres modos de ejecucion: API publica, local con modelos instalados y modo degradado sin base lexica.

## Casos de uso

- Ensenanza de frances como lengua extranjera: el modulo convierte cualquier frase en transcripcion AFI con liaison y e caduc resueltos, lo que permite generar ejercicios de pronunciacion y material de audio guiado sin intervencion manual.
- Herramientas de correccion para estudiantes: el corrector explica cada cambio en frances, de modo que puede integrarse en un editor o plataforma de aprendizaje que no solo marque el error, sino que lo justifique.
- Sistemas de sintesis de voz (TTS): la salida fonetica en AFI con liaison y lectura de cifras sirve como front-end de normalizacion textual para motores TTS en frances.
- Reconocimiento de voz (ASR) y alineamiento fonetico: la transcripcion fonetica y la segmentacion en palabras facilitan la comparacion entre audio transcrito y texto de referencia en herramientas de evaluacion de pronunciacion.
- Analisis linguistico y anotacion de corpus: el etiquetado UPOS, rasgos, lemas y dependencias UD permite procesar corpus franceses para investigacion en linguistica computacional o para enriquecer datasets.
- Busqueda y recuperacion con expansion fonetica: la conversion fonema-grafema y el lexico de homofonos permiten implementar busquedas tolerantes a errores ortograficos tipicos del frances (homofonos, terminaciones mudas).
- Correccion editorial en entornos controlados: en modo local, con los modelos bajo licencia, el texto no abandona la maquina, lo que encaja en flujos con requisitos de confidencialidad.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos el 25/11/2026 sobre el paquete construido y ejecutado en local sobre CPU.

| Banco | Metrica | Lectura v1 | Lectura v0 | Referencia externa |
|---|---|---|---|---|
| CSF18 (lectura de frases) | PER estricto | 5,8 % | 6,7 % | espeak-ng: 12,9 % |
| CSF18 (lectura de frases) | PER con timbres confundidos | 2,3 % | 2,9 % | espeak-ng: 8,9 % |
| WikiPron (palabra aislada, 971 palabras) | Palabras correctas estricto | 77 % | 58 % | espeak-ng: 64 % |
| WikiPron (palabra aislada) | Correctas con timbres y e muda tolerados | 91 % | 87 % | espeak-ng: 84 % |
| CSF18 (escritura de frases) | WER | 17,1 % | 25,3 % | base ingenua: 41,2 % |
| UD French-PUD | UPOS | 97,5 % | 94,2 % | no disponible |
| UD French-PUD | Seis rasgos simultaneos | 95,0 % | 80,5 % | no disponible |
| UD French-PUD | Lema | 99,0 % | no disponible | no disponible |
| WiCoPaCo (corrector) | F0,5 | 60 (P 62 %, R 56 %) | no disponible | no disponible |

No se han publicado resultados de benchmarks de generacion de texto, razonamiento o codigo, ya que el modulo no es un modelo generativo general.

## Requisitos de hardware

- No se dispone de datos de VRAM: no se publican pesos ni se indica si los modelos locales requieren GPU.
- Los bancos publicados se ejecutaron en local sobre CPU, lo que sugiere que el modo local funciona sin GPU dedicada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras).
- Opciones de despliegue: paquete Python `lectura-nlp-fr` (instalacion via `pip`), modo API contra `https://api.lectura.world` o modo local con modelos instalados; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Pesos publicados | Enfoque |
|---|---|---|---|---|---|
| Lectura NLP-FR v1 | Modulo NLP especializado (analisis, G2P/P2G, correccion) | fr (y fr-en con paquete aparte) | AGPL-3.0-or-later (codigo); modelos locales con licencia comercial | No | Fonetica francesa, UD, correccion pedagogica |
| espeak-ng | Sintetizador de voz y G2P basado en reglas | Multiples | GPL-3.0 | Si (reglas y datos) | G2P y TTS; referencia en los bancos de Lectura |
| Modelos G2P neuronales genericos (p. ej. basados en transformers) | Red neuronal secuencia a secuencia | Variable | Variable | Si | Conversion grafema-fonema sin lexico ni reglas especificas de liaison |
| Modelos POS/UD franceses (p. ej. los entrenados sobre UD French-Sequoia) | Etiquetadores neuronales | fr | Variable | Si | Etiquetado morfosintactico UD |

No se dispone de comparaciones directas con modelos generativos de gran tamano porque la tarea y el formato de distribucion son distintos.

## Limitaciones y advertencias

- El repositorio no contiene pesos: quien quiera ejecucion local necesita instalar modelos bajo licencia comercial solicitada al autor. La version gratuita depende de la API de Lectura.
- En modo API, los textos, pronunciaciones y palabras enviados se transmiten al servidor de Lectura (`https://api.lectura.world`); no es apto para datos sensibles sin el modo local.
- La licencia AGPL-3.0-or-later del codigo impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios; el uso comercial de los modelos locales esta sujeto a licencia aparte.
- Cobertura limitada al frances (y frances-ingles con el paquete traductor); no es multilingue.
- El corrector prioriza la precision sobre el recall (F0,5 = 60, P 62 %, R 56 %): deja pasar errores para evitar falsas correcciones, lo que puede ser insuficiente en flujos que exijan exhaustividad.
- El banco de escritura CSF18 incluye muchos nombres propios y palabras raras, por lo que el 17,1 % de WER debe interpretarse como una cota pesimista en ese dominio.
- No hay informacion publica sobre sesgos, riesgo de alucinacion en el corrector ni limites de longitud de entrada; conviene validar en el dominio concreto antes de produccion.
- No se han publicado detalles de arquitectura, parametros ni datos de entrenamiento, lo que dificulta la auditoria tecnica del sistema.

## Enlaces

- Hugging Face: https://huggingface.co/lecturaworld/lectura-nlp-fr-v1
- Paquete PyPI: https://pypi.org/project/lectura-nlp-fr/
- Paquete traductor: https://pypi.org/project/lectura-traducteur/
- Paquete ingles: https://pypi.org/project/lectura-nlp-en/
- Lexico: https://pypi.org/project/lectura-lexicon/
- Modulos de Lectura: https://www.lectura.world/developpement/modules/
- Politica de privacidad de la API: https://www.lectura.world/confidentialite/#api
- Demo: https://lingua.lectura.world
- Lexico LeXiK: https://lexique.lectura.world
- CSF18: https://doi.org/10.5281/zenodo.5554849 (CC BY 4.0); Sankar et al., ICASSP 2022
- WikiPron: Lee et al., LREC 2020 (CC BY-SA)
- UD French-PUD: Universal Dependencies (CC BY-SA 4.0)
- WiCoPaCo: Max y Wisniewski, LREC 2010
