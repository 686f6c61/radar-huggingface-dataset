# Phoonnx/matcha-proxectonos_brais-matcha-graphemes

## Resumen

matcha-proxectonos_brais-matcha-graphemes es un modelo de sintesis de voz (text-to-speech) en formato ONNX, publicado por Phoonnx y derivado del repositorio agregador Phoonnx/phoonnx-matcha. Se trata de una exportacion de un modelo Matcha entrenado sobre el corpus ProxectoNós para la voz "brais", en su variante de entrada por grafemas (graphemes), es decir, sin conversion previa a fonemas. El modelo esta pensado para ser consumido por la libreria phoonnx, un runtime de sintesis de voz basado en ONNX desarrollado por TigreGotico.

El modelo resuelve la necesidad de disponer de voces en gallego empaquetadas en un formato ligero y portable (ONNX) que puede ejecutarse sin depender del stack original de entrenamiento. Al mantener las rutas de ficheros del repositorio de origen, funciona como un artefacto listo para descargar y usar dentro del ecosistema phoonnx, con un tamano de repositorio de aproximadamente 0,1 GB.

La relevancia es acotada pero concreta: cubre una voz concreta (brais) de un corpus linguistico especifico (ProxectoNós) y una licencia copyleft fuerte (GPL-3.0), lo que condiciona su adopcion en productos comerciales cerrados. La informacion publica disponible es muy escasa: no hay model card detallada, no se declaran idiomas y no se han publicado benchmarks ni especificaciones de arquitectura mas alla de la etiqueta "matcha".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha (TTS no autorregresivo basado en flow matching; detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no condicionado por ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la voz deriva del corpus gallego ProxectoNós, pero el autor no declara idiomas) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Matcha, una arquitectura de sintesis de voz no autorregresiva que combina un modelo acustico basado en flow matching condicionado por texto con un vocoder neuronal separado que convierte el mel-espectrograma en forma de onda. La variante "graphemes" indica que la entrada al modelo acustico son caracteres (grafemas) en lugar de una secuencia de fonemas, lo que simplifica el pipeline de inferencia al eliminar la necesidad de un front-end de fonemizacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron etapas de ajuste fino con RLHF o preferencias humanas (poco habituales en TTS). El origen de los datos es el corpus ProxectoNós, un proyecto de recursos linguisticos para el gallego, y el artefacto publicado es una exportacion a ONNX de un modelo ya entrenado, no un entrenamiento nuevo. El vocoder asociado no se detalla en la informacion disponible.

## Capacidades

- Sintesis de voz a partir de texto en formato graphemico, sin fonemizacion previa.
- Generacion de audio para una voz concreta identificada como `proxectonos/brais-matcha-graphemes`.
- Ejecucion via ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias del framework de entrenamiento original.
- Integracion nativa con la libreria phoonnx mediante identificadores de voz.
- No se documentan capacidades de clonacion de voz, control de emocion, multilocutor, tool calling ni razonamiento multi-paso (no son propias de un modelo TTS).
- Capacidades multilingues: no disponibles segun la informacion publicada.

## Casos de uso

- Lectura de articulos y documentos en gallego: la voz brais, derivada de ProxectoNós, es adecuada para convertir texto en audio en aplicaciones de accesibilidad o lectura asistida para contenido en lengua gallega.
- Integracion en asistentes de voz embebidos: al estar en ONNX y pesar aproximadamente 0,1 GB, puede desplegarse en dispositivos con recursos limitados usando ONNX Runtime, sin necesidad de GPU dedicada.
- Generacion de audiolibros y podcast automatizados: el pipeline graphemico simplifica la produccion por lotes de narraciones a partir de texto plano, reduciendo la complejidad del front-end.
- Prototipado rapido de interfaces de voz: la libreria phoonnx permite invocar la voz por su identificador, lo que agiliza pruebas de concepto en aplicaciones web o de escritorio.
- Sistemas de anuncios y avisos automatizados: para entornos donde se requiere una voz sintetica en gallego con licencia libre, como transporte publico o paneles informativos.
- Investigacion en TTS para lenguas de bajos recursos: sirve como referencia reproducible de un modelo Matcha graphemico entrenado sobre un corpus linguistico abierto, util para comparaciones y experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; por el tamano del repositorio (0,1 GB) el modelo es muy ligero y probablemente quepa en GPUs consumer con 4 GB o menos, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior); para cargas pequenas, la CPU es suficiente.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2-4 GB de memoria, aunque no se confirma en la documentacion.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), libreria phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matcha-proxectonos_brais-matcha-graphemes | no disponible | no aplica | no disponible | GPL-3.0 | Hugging Face (ONNX) |
| Piper (voces ONNX) | no disponible | no aplica | no disponible | MIT (segun voces) | Hugging Face / GitHub |
| Coqui TTS (Matcha) | no disponible | no aplica | no disponible | MPL-2.0 / otras | GitHub |
| VITS multilingue | no disponible | no aplica | no disponible | varía | Hugging Face |

La comparacion se limita a la categoria (TTS ligero en ONNX); no hay datos publicos de rendimiento para este modelo que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia GPL-3.0 es copyleft fuerte: su integracion en productos de codigo cerrado puede obligar a liberar el codigo combinado, lo que limita su uso comercial propietario.
- No se declaran idiomas oficialmente; aunque la voz proviene de un corpus gallego, el soporte real de otras lenguas no esta documentado.
- No hay informacion sobre sesgos acusticos, calidad de prosodia ni robustez ante texto fuera de dominio.
- Riesgo de alucinacion no aplica en el sentido de texto, pero si puede producirse una pronunciacion incorrecta en palabras desconocidas o extranjeras al usar entrada graphemica.
- El modelo depende del ecosistema phoonnx y de ONNX Runtime; no se garantiza compatibilidad con otros frameworks TTS.
- No se documentan limitaciones de longitud de entrada ni el vocoder asociado, lo que complica la reproduccion exacta del pipeline.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-proxectonos_brais-matcha-graphemes
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-matcha
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
