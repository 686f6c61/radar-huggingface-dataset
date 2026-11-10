# aladewealth/ohun-yoruba

## Resumen

Ohùn Yoruba TTS es un modelo de síntesis de voz (text-to-speech) para yoruba, desarrollado por aladewealth (Atoms Intelligence Labs). Se trata de un VITS de calidad media entrenado con la herramienta Piper y exportado a ONNX para inferencia en CPU. Su rasgo diferencial es el tratamiento explícito de los tonos del yoruba: incorpora un G2P (grafema a fonema) basado en reglas que convierte los diacríticos en IPA con marcas de tono alto, medio y bajo, además de vocales nasales y los caracteres con punto suscrito (ẹ, ọ, ṣ), un aspecto que los fonemizadores genéricos suelen ignorar.

El modelo está pensado como una voz multi-hablante a partir de grabaciones femeninas y masculinas del corpus OpenSLR 86 (Google, CC BY-SA 4.0), con aproximadamente 3.600 líneas de audio de unos 36 hablantes. El tamaño estimado es de 15 a 20 millones de parámetros, propio de un VITS de calidad media de Piper, y el punto de partida del entrenamiento es el checkpoint de dominio público `en_US-ljspeech-medium`.

Es importante señalar que, en el momento de redactar esta ficha, el repositorio no contiene pesos: la model card indica explícitamente que el modelo aún no ha sido entrenado y que los ficheros `ohun_yo.onnx` y `ohun_yo.onnx.json` se publicarán cuando finalice la primera ejecución de entrenamiento en Kaggle. Lo que sí está disponible es todo el material para reproducirlo: el G2P, el cuaderno de entrenamiento y el código del servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (entrenado con Piper) |
| Parametros totales | 15-20 M (estimacion del autor, pendiente de exportacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (exportacion ONNX; sin cuantizaciones publicadas) |
| Idiomas soportados | yoruba (yo) |
| Licencia | CC BY-SA 4.0 (pesos); codigo en `voice/` y `training/` bajo Apache-2.0 |
| Formato de pesos | ONNX (`ohun_yo.onnx` + `ohun_yo.onnx.json`); no publicados aun |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior normalizador por flujo y un decodificador vocacional adversarial, entrenado mediante la herramienta Piper y exportado a ONNX para ejecucion en CPU. El modelo es multi-hablante: toma las grabaciones femeninas y masculinas del corpus y descarta a los hablantes con menos de 50 clips. El entrenamiento parte del checkpoint publico `en_US-ljspeech-medium` de Piper (warm start), lo que reduce el coste de convergencia con un corpus pequeno.

Los datos proceden de OpenSLR 86, *Crowdsourced high-quality Yoruba speech* de Google, con licencia CC BY-SA 4.0: aproximadamente 3.600 lineas grabadas (1.892 femeninas, 1.691 masculinas) de unos 36 hablantes. La model card advierte que las transcripciones del corpus no fueron verificadas manualmente en su totalidad. La innovacion tecnica destacable es el front end: un G2P basado en reglas (`voice/yoruba_g2p.py`) que lee los diacriticos y los convierte en IPA con marcas de tono alto, medio y bajo, ademas de vocales nasales y caracteres con punto suscrito. El proceso de reproduccion esta documentado en `training/train_yoruba_kaggle.ipynb`, pensado para ejecutarse en Kaggle con GPU T4 x2 e Internet activado.

## Capacidades

- Sintesis de voz (text-to-speech) en yoruba a partir de texto con diacriticos.
- Modelado explicito de los tres tonos del yoruba (alto, medio, bajo) mediante G2P basado en reglas.
- Soporte de vocales nasales y de los caracteres ẹ, ọ y ṣ.
- Voz multi-hablante con voces femeninas y masculinas del corpus (identificadores como `yo-female-1` en la API).
- Inferencia en CPU gracias a la exportacion ONNX.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al yoruba; el resto de voces Ohùn (espanol, frances, ingles) son modelos distintos alojados en el Space del autor.

## Casos de uso

- Lectura de articulos y textos en yoruba: el modelo convierte texto con diacriticos en audio inteligible, adecuado para aplicaciones de accesibilidad y para la preservacion de la lengua.
- Asistentes de voz para servicios publicos en regiones yorubaparlantes: al ejecutarse en CPU via ONNX, puede desplegarse en servidores modestos o en el borde sin GPU.
- Generacion de audiolibros y material educativo: la voz multi-hablante permite alternar voces femeninas y masculinas en narraciones y dialogos.
- Aprendizaje de idiomas: la pronunciacion explicita de tonos sirve como referencia auditiva para estudiantes de yoruba, que suelen tener dificultades con la tonologia.
- Integracion en pipelines de doblaje o locucion automatizada: la API HTTP (`POST /api/v1/tts`) permite generar audio bajo demanda desde otras aplicaciones.
- Investigacion en TTS para lenguas africanas de bajos recursos: el repositorio incluye el G2P y el cuaderno de entrenamiento, lo que facilita la reproduccion y la adaptacion a otros idiomas con tonos.
- Prototipado de interfaces conversacionales en yoruba: una vez publicados los pesos, puede combinarse con ASR y un LLM para construir asistentes de voz completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, MCD) ni comparaciones cuantitativas con otros sistemas TTS para yoruba.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la practica; el modelo se ejecuta en CPU via ONNX. Con 15-20 M de parametros, el uso de memoria es de decenas de MB.
- GPU recomendadas: no necesarias para inferencia; el entrenamiento de referencia se realizo en Kaggle con GPU T4 x2.
- Cabe en cualquier GPU consumer y tambien en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: ONNX Runtime (via Piper), API HTTP propia del autor (`POST https://aladewealth-ohun-api.hf.space/api/v1/tts`), y el codigo del servidor en `server/engines.py` del repositorio GitHub.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ohùn Yoruba (este modelo) | 15-20 M (est.) | yoruba | VITS + Piper, ONNX | CC BY-SA 4.0 | Pesos no publicados aun |
| Piper `en_US-ljspeech-medium` | no disponible | ingles | VITS, ONNX | dominio publico | Pesos publicos |
| Otras voces Ohùn (espanol, frances, ingles) | no disponible | es, fr, en | VITS, ONNX | no disponible | Disponibles en el Space del autor |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene pesos: el modelo no esta entrenado y no puede utilizarse todavia; la API devuelve 503 para yoruba hasta que se publiquen.
- El G2P basado en reglas espera texto correctamente diacritizado; el yoruba sin marcas se leera con tonos medios, lo que produce pronunciaciones incorrectas.
- La calidad esta acotada por el corpus: unas 3.600 lineas de audio colaborativo y transcripciones no verificadas manualmente en su totalidad.
- Riesgo de alucinacion acustica y artefactos propios de un VITS de calidad media entrenado con datos limitados; no se han publicado evaluaciones subjetivas.
- Sesgos potenciales derivados de la distribucion de hablantes del corpus (unos 36 hablantes, con posible sobrerrepresentacion de ciertas variedades del yoruba).
- Licencia CC BY-SA 4.0 en los pesos: el uso comercial exige atribucion a Ohùn y al dataset OpenSLR 86, y la distribucion de pesos derivados debe hacerse bajo la misma licencia ShareAlike.
- El codigo de `voice/` y `training/` es Apache-2.0, pero esa licencia no cubre los pesos.
- No apto para tareas fuera de TTS: no procesa audio de entrada, no hace razonamiento ni soporta tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aladewealth/ohun-yoruba
- Space de la API Ohùn: https://huggingface.co/spaces/aladewealth/ohun-api
- Repositorio GitHub: https://github.com/aladewealth/-Ohun
- Perfil del autor en GitHub: https://github.com/aladewealth
- Dataset OpenSLR 86: https://www.openslr.org/86/
