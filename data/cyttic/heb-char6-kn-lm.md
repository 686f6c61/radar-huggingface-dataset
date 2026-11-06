# cyttic/heb-char6-kn-lm

## Resumen

`cyttic/heb-char6-kn-lm` es un modelo de lenguaje de caracteres de orden 6 construido con suavizado Kneser-Ney interpolado, desarrollado por el autor `cyttic` y publicado bajo licencia MIT. No es una red neuronal ni un transformer: se trata de un modelo estadístico n-grama cuyos parámetros se almacenan como arrays de NumPy en formato `.npz`, y su función es servir como componente de rescoring dentro del decodificador CTC por haz de un lector de escritura manuscrita en hebreo (proyecto webHebrewOCR, módulos `charlm.CharKN` y `ctc_decode.beam_search`).

El modelo resuelve un problema muy concreto: mejorar la corrección ortográfica y la coherencia léxica de las transcripciones que produce un sistema OCR de manuscrito hebreo. Al operar a nivel de carácter, puede integrarse en la búsqueda por haz del CTC sin necesidad de un tokenizador de subpalabras, lo que simplifica la fusión de puntuaciones acústicas y lingüísticas. Su ámbito es, por tanto, el procesamiento de texto hebreo dentro de un pipeline OCR, no la generación de texto general.

La relevancia de esta ficha es limitada fuera de ese nicho: no hay pipeline declarado, el repositorio ocupa 0.0 GB (probablemente por redondeo de un artefacto pequeño) y no cuenta con descargas ni likes. Es un artefacto auxiliar de un sistema mayor, útil para quien quiera reproducir o auditar el decodificador de webHebrewOCR, y no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de caracteres n-grama (orden 6) con suavizado Kneser-Ney interpolado; no es una red neuronal |
| Parametros totales | No disponible (los pesos son tablas de recuentos/probabilidades en arrays NumPy; el numero exacto de entradas no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 6 caracteres (orden del n-grama) |
| Tipos de cuantizacion | No aplica; los pesos se guardan como arrays NumPy en `.npz` |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | `.npz` (arrays NumPy, sin pickle); la configuracion de construccion esta en `heb_char6_kn.json` |

## Arquitectura y entrenamiento

El modelo es un n-grama de caracteres de orden 6 con interpolacion Kneser-Ney, una tecnica clasica de suavizado que combina distribuciones de orden inferior para asignar probabilidad a secuencias no vistas durante el entrenamiento. No hay capas, atencion ni embeddings: la "inferencia" consiste en consultar tablas de probabilidades condicionales de hasta seis caracteres de historia. Los pesos se serializan como arrays de NumPy en un fichero `.npz` sin pickle, lo que elimina riesgos de deserializacion arbitraria al cargar el artefacto, y los hiperparametros de construccion se documentan en `heb_char6_kn.json`.

El corpus de entrenamiento combina frases de Ben-Yehuda (hebreo clasico con puntuacion) y frases de hebreo moderno generadas por un LLM, sumando 1.370.136 lineas segun la model card. No se detalla la proporcion entre ambas fuentes, el numero total de caracteres ni si hubo filtrado o deduplicacion. Tampoco se menciona ninguna fase de RLHF, DPO ni ajuste supervisado, algo coherente con la naturaleza estadistica del modelo. La innovacion tecnica, en este caso, es de integracion: el modelo se fusiona directamente en la busqueda por haz del decodificador CTC del OCR, aportando una puntuacion linguistica por caracter que penaliza secuencias improbables en hebreo.

## Capacidades

- Puntuacion de secuencias de caracteres en hebreo: asigna probabilidades condicionales a los proximos caracteres dada una historia de hasta 6 caracteres.
- Rescoring en decodificacion CTC: se integra en `ctc_decode.beam_search` para reordenar hipotesis y corregir errores ortograficos del OCR.
- Manejo de puntuacion: el corpus de entrenamiento incluye frases con puntuacion, por lo que el modelo modela tambien signos.
- Cobertura de hebreo clasico y moderno: mezcla texto de Ben-Yehuda con frases modernas generadas por LLM.
- No soporta tool calling, function calling ni agentes.
- No soporta generacion de texto libre de calidad: es un modelo de caracteres de orden 6, sin memoria mas alla de esa ventana.
- No tiene capacidades multimodales, vision, audio ni modo de razonamiento.
- Multilingue: no; unicamente hebreo.

## Casos de uso

- Rescoring en un pipeline OCR de manuscrito hebreo: se carga el `.npz` y se consulta desde `charlm.CharKN` para puntuar las hipotesis del decodificador CTC por haz, reduciendo errores de caracteres en palabras ambiguas.
- Correccion ortografica ligera en transcripciones: dado un texto OCR con errores, se pueden proponer sustituciones de caracteres que aumenten la probabilidad del n-grama en ventanas de 6 caracteres.
- Filtrado de hipotesis en sistemas de reconocimiento de escritura: descartar candidatos de bajo puntaje linguistico antes de una etapa de postproceso mas costosa.
- Baseline reproducible para investigacion en OCR hebreo: al ser un modelo estadistico con pesos en NumPy, sirve como referencia simple frente a modelos neuronales de lenguaje para comparar ganancias en WER/CER.
- Deteccion de texto no hebreo o ruido: secuencias con probabilidad muy baja bajo el modelo pueden marcarse para revision manual en un flujo de digitalizacion de archivos.
- Segmentacion y validacion en digitalizacion de documentos historicos: el componente de Ben-Yehuda ayuda a puntuar textos clasicos, utiles en proyectos de archivo.
- Integracion en herramientas de investigacion sobre decodificacion CTC: permite experimentar con la fusion de puntuaciones acusticas y linguisticas sin entrenar un LM neuronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y los pesos son arrays NumPy, no tensores de GPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB segun Hugging Face (artefacto pequeno), por lo que la carga en memoria es trivial comparada con un transformer.
- Opciones de despliegue: carga directa con NumPy dentro del codigo de webHebrewOCR (`charlm.CharKN`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan disenados para modelos neuronales.
- Latencia y throughput: no disponibles; al ser una consulta a tablas de n-gramas, la latencia por caracter es del orden de microsegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/heb-char6-kn-lm | N-grama de caracteres orden 6, Kneser-Ney | 6 caracteres | Hebreo | MIT | Hugging Face, 0 descargas |
| KenLM (n-gramas de palabras/caracteres) | N-grama con Kneser-Ney | Configurable (tipicamente 3-5) | Multiples | LGPL / varias | Ampliamente usado en ASR/OCR |
| Modelos neuronales de lenguaje hebreo (p. ej. variantes de AlephBERT) | Transformer | 512 tokens aprox. | Hebreo | Variable | Hugging Face |
| No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa es limitada: no se dispone de datos de rendimiento del modelo de `cyttic` frente a alternativas, y los modelos neuronales de hebreo requieren GPU y tokenizadores de subpalabras, mientras que este artefacto esta pensado para fusionarse en un decodificador CTC concreto.

## Limitaciones y advertencias

- Ventana de contexto de solo 6 caracteres: no captura dependencias de palabra ni de frase, por lo que su utilidad como corrector linguistico es acotada.
- Entrenado con frases de hebreo moderno generadas por un LLM: puede heredar sesgos, errores o distribuciones artificiales del generador, no documentadas.
- Riesgo de sobreajuste al dominio de Ben-Yehuda y al estilo del corpus sintetico; el rendimiento en otros registros (tecnico, coloquial, transliterado) es incierto.
- No es un modelo generativo utilizable de forma autonoma; usarlo fuera del pipeline OCR probablemente produzca resultados pobres.
- No hay datos publicados de CER/WER ni de mejora sobre el decodificador sin LM, por lo que su beneficio real no esta cuantificado en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el repositorio no registra descargas ni actividad.
- Almacenamiento en `.npz` sin pickle: seguro de cargar, pero requiere NumPy y conocer el esquema de claves del fichero para integrarlo.
- Idioma unico (hebreo): no apto para textos multilingues ni mixtos sin un paso previo de deteccion de idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/heb-char6-kn-lm
- Repositorio del proyecto webHebrewOCR: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
