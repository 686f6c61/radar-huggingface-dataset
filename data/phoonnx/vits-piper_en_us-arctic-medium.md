# Phoonnx/vits-piper_en_US-arctic-medium

## Resumen

vits-piper_en_US-arctic-medium es un modelo de sintesis de voz (text-to-speech) en formato ONNX, derivado del catalogo Piper y empaquetado para su uso con la libreria phoonnx. Lo publica el usuario Phoonnx como una extraccion de una carpeta concreta (`piper__en_US-arctic-medium`) del repositorio agregador `Phoonnx/phoonnx-vits`, conservando las rutas de ficheros originales. Se trata, por tanto, de un artefacto de distribucion mas que de un modelo entrenado desde cero por el autor de la publicacion.

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional y un decoder basado en flujos normalizadores y un generador HiFi-GAN para producir waveform directamente a partir de fonemas. La variante "arctic" remite al corpus de voces Arctic de CMU, y "medium" indica el tamano de la red dentro de la escala de Piper (low, medium, high). El identificador de voz expuesto es `piper/en_US-arctic-medium`.

Su relevancia es practica: ofrece sintesis de voz en ingles estadounidense ejecutable en CPU mediante ONNX Runtime, con un peso de repositorio de aproximadamente 0,1 GB, lo que lo hace apto para despliegues ligeros, embebidos o de bajo coste. La informacion publicada es muy escasa: no hay datos de entrenamiento, benchmarks ni especificaciones detalladas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech de extremo a extremo, formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto/fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documenta cuantizacion) |
| Idiomas soportados | ingles estadounidense (segun el identificador `en_US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es un modelo condicional variacional de extremo a extremo que aprende a mapear secuencias de fonemas a waveform mediante un encoder de texto, un prior normalizador con flujos afines y un decoder generativo con discriminadores adversarios en entrenamiento (incluye un discriminador multiperiodo tipo HiFi-GAN). La inferencia produce audio directamente, sin vocoder externo separado. En el ecosistema Piper, los modelos se exportan a ONNX para ejecucion en CPU con ONNX Runtime, y el front-end de texto a fonemas suele apoyarse en espeak-ng.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus Arctic concreto utilizado, ni sobre si hubo ajuste por RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La model card unicamente indica que el modelo procede del subconjunto `piper__en_US-arctic-medium` del repositorio `Phoonnx/phoonnx-vits` y que conserva las rutas de ficheros originales.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto de entrada.
- Generacion de waveform directamente en formato ONNX, ejecutable con ONNX Runtime.
- Integracion con la libreria phoonnx mediante el identificador de voz `piper/en_US-arctic-medium`.
- Compatibilidad con el ecosistema Piper (front-end de fonemas y convenciones de ficheros).
- Ejecucion en CPU sin necesidad de GPU, gracias al formato ONNX y al tamano reducido del repositorio (0,1 GB).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; son capacidades ajenas al proposito del modelo.
- Capacidades multilingues: no disponibles; el identificador apunta exclusivamente a `en_US`.

## Casos de uso

- Lectura de articulos y documentos: el modelo convierte texto en audio en ingles estadounidense para sistemas de lectura por voz o accesibilidad, con inferencia en CPU y sin dependencia de servicios en la nube.
- Asistentes de voz embebidos: al ejecutarse como ONNX con un peso de 0,1 GB, puede integrarse en dispositivos con recursos limitados (Raspberry Pi, moviles, sistemas empotrados) para respuestas habladas.
- Generacion de audiolibros y contenido narrado por lotes: permite sintetizar grandes volumenes de texto de forma offline, con coste marginal bajo y sin cuotas de API.
- Prototipado de interfaces conversacionales: util para equipos que necesitan una voz TTS rapida de integrar en demos de chatbots o IVR en ingles, usando el identificador `piper/en_US-arctic-medium` con phoonnx.
- Pruebas de regresion y evaluacion de pipelines TTS: al ser un artefacto reproducible con licencia MIT, sirve como referencia en tests automatizados de sintesis y en comparativas de calidad entre voces Piper.
- Sistemas de navegacion o avisos por voz: la latencia de un modelo VITS medium en CPU es adecuada para mensajes cortos e instrucciones, donde no se requiere una voz expresiva de alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso CPU; en GPU, el modelo es lo bastante pequeno (repositorio de 0,1 GB) para caber holgadamente en cualquier GPU con unos pocos GB de memoria, aunque no se publican cifras exactas.
- GPU recomendadas: no disponibles; el modelo esta pensado para ONNX Runtime y ejecucion en CPU, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo moderna puede alojarlo con margen amplio, dado su tamano reducido; no se especifican modelos concretos.
- Opciones de despliegue: phoonnx (libreria indicada en la model card), ONNX Runtime; el ecosistema Piper es el origen del artefacto. No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-piper_en_US-arctic-medium | VITS (ONNX) | en_US | ONNX | MIT | Hugging Face (Phoonnx) |
| Otras voces Piper en_US (p. ej. variantes low/high del catalogo Piper) | VITS (ONNX) | en_US | ONNX | segun voz original | Catalogo Piper / repositorios derivados |
| Modelos TTS neuronales de gran tamano (p. ej. familia XTTS) | no disponible en esta ficha | multilingue | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER de sintesis) en la informacion proporcionada, por lo que la comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos; al derivar del corpus Arctic y de un front-end de fonemas, la voz refleja las caracteristicas del hablante o hablantes de origen, con posible sesgo de acento y prosodia.
- Riesgo de alucinacion en el sentido de errores de pronunciacion, omisiones o artefactos acusticos en textos con nombres propios, siglas o vocabulario fuera del dominio de entrenamiento; no hay evaluacion publicada.
- Cobertura limitada a ingles estadounidense; no se documentan otros idiomas.
- Licencia MIT declarada, pero la model card advierte que la licencia sigue a la del repositorio de origen por subcarpeta y que algunas voces del repositorio agregador carecen de licencia explicita; conviene verificar la procedencia antes de un uso comercial.
- Artefacto de redistribucion: no hay informacion sobre el proceso de entrenamiento ni sobre la calidad del modelo original, lo que dificulta auditar su comportamiento en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin senales de validacion por parte de la comunidad.
- No apto para tareas de generacion de texto, razonamiento, codigo o vision; su unico proposito es la sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-piper_en_US-arctic-medium
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma citado en la model card: https://github.com/michsethowusu/kasanoma
