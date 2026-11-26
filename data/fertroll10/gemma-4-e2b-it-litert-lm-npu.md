# Fertroll10/gemma-4-E2B-it-litert-lm-npu

## Resumen

Gemma 4 E2B IT para NPUs de telefonos es una compilacion comunitaria del modelo instructivo `google/gemma-4-E2B-it` de Google, empaquetada en formato `.litertlm` para ejecutarse integramente en la NPU de moviles Android mediante LiteRT-LM. El autor, Fertroll10, publica builds especificos por chip: Qualcomm Snapdragon 8 Gen 2 (SM8550), 8 Gen 3 (SM8650), 8 Elite (SM8750), 8 Elite Gen 5 (SM8850) y MediaTek Dimensity 9300 (MT6989). No es un modelo nuevo ni un fine-tuning de comportamiento, sino un artefacto de despliegue: pesos cuantizados y grafos compilados para el acelerador neural del telefono.

La relevancia de esta ficha reside en el empaquetado on-device: el modelo completo corre en la NPU, sin GPU ni CPU como fallback, con tamanos de archivo de 2,31 a 3,16 GB y ventanas de contexto de 4.096 o 16.384 tokens segun variante. La version v3 (22 de noviembre de 2026) cambia la calibracion de la cuantizacion, pasando de texto en ingles y codigo Python a prompts reales de la app CyanBridge en 9 idiomas y documentos largos de hasta 15.000 tokens, lo que reduce los tensores de activacion recortados mas de un 25 % de 392 a 66.

Es un build de comunidad, no soportado por Google, Qualcomm ni MediaTek, y esta atado a un chip concreto por archivo. La licencia declarada es Apache 2.0, aunque los pesos derivan de Gemma 4 E2B IT, cuyo regimen de uso conviene verificar en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Gemma 4 E2B IT; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible (el nombre "E2B" sugiere variante eficiente de 2B, sin confirmacion en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (variantes estandar); 16.384 tokens (variantes 4k-16k con doble grafo compilado) |
| Tipos de cuantizacion | Pesos de 8 bits con redondeo QAT de Google; pesos de 2 bits almacenados como 4 bits en la variante MediaTek; activaciones de 16 bits |
| Idiomas soportados | 9 idiomas usados en la calibracion v3 (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), compilado para NPU por chip |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: parte del checkpoint QAT (quantization-aware training) de Google `gemma-4-E2B-it` y aplica su receta de cuantizacion, con redondeo de 8 bits a las escalas de Google y activaciones de 16 bits en el resto de la red. Sobre esa base se compilan grafos especificos para cada NPU. En MediaTek fueron necesarias dos reescrituras exactas de grafo: los pesos de 2 bits se almacenan como 4 bits y la capa de salida de 262.144 filas se divide en 8 partes porque la NPU de MediaTek limita una dimension a 65.535. La variante 4k-16k de MediaTek ocupa mas porque esa plataforma no comparte pesos entre grafos compilados.

La innovacion principal de la v3 es la calibracion: se usaron prompts propios de la app CyanBridge en 9 idiomas, ademas de documentos y conversaciones de hasta 15.000 tokens, en lugar de texto ingles y codigo Python. El resultado medido es una caida de tensores de activacion recortados mas de un 25 % de 392 a 66 sobre prompts no vistos durante la calibracion. El resto de detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto y respuesta a preguntas cortas en modo instructivo, con entrada exclusivamente de texto (la model card indica "takes text input").
- Enrutado de preguntas habladas (spoken-question routing) en 4 idiomas, segun las pruebas del autor.
- Recuperacion de hechos dentro de prompts largos: probado con hechos ocultos en prompts de 2.000, 3.800 y 6.000 tokens.
- Conversaciones multi-turno dentro de la ventana de contexto de 4.096 o 16.384 tokens.
- Capacidades multilingues limitadas a los 9 idiomas empleados en la calibracion v3.
- Ejecucion integra en NPU, sin reparto con CPU o GPU, lo que reduce consumo energetico en movil.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz on-device: el modelo procesa preguntas habladas y las enruta a la accion correcta en 4 idiomas, con tiempos de carga de NPU de 3,4 a 6,0 s en telefonos de gama alta, sin enviar audio a la nube.
- Busqueda de datos en documentos largos en el telefono: la variante 4k-16k permite localizar un hecho dentro de un prompt de hasta 6.000 tokens, util para resumir contratos o correos sin salir del dispositivo.
- Clasificacion y extraccion de informacion en apps moviles: con prefill de 128 tokens en 26-49 ms segun telefono, es viable procesar lotes de fragmentos de texto en segundo plano.
- Atencion al cliente embebida en apps Android: conversaciones multi-turno de hasta 4.096 tokens con respuestas generadas localmente, lo que elimina costes de API y problemas de privacidad.
- Traduccion y asistencia de escritura en 9 idiomas: la calibracion con prompts multilingues reduce el recorte de activaciones y mejora la fidelidad en esos idiomas frente a la calibracion anterior en ingles.
- Prototipado de funciones de IA en dispositivos de gama alta: sirve para validar latencia y consumo reales en Snapdragon 8 Gen 2/3, 8 Elite, 8 Elite Gen 5 y Dimensity 9300 antes de comprometerse con un backend en la nube.
- Demos offline y entornos sin conectividad: al residir el modelo completo en el telefono (2,31-3,16 GB), funciona en modo avion o en redes restringidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta pruebas funcionales en telefonos reales con 13 prompts reservados:

| Telefono | Archivo | Aciertos | Carga de NPU |
|---|---|---|---|
| Galaxy S23 Ultra | SM8550 | 12 / 13 | 6,0 s |
| Galaxy Z Fold6 | SM8650 | 12 / 13 (archivo previo: 11 / 13) | 3,9 s |
| Galaxy Z Fold6 | SM8650 4k-16k | 13 / 14 (incluye prompt de 6.000 tokens) | 19 s |
| Galaxy S25 | SM8750 | 12 / 13 | 3,4 s |
| Galaxy S26 | SM8850 | 12 / 13 | 4,2 s |
| Galaxy Tab S10+ | MT6989 | 11 / 13 | 27 s |

Tiempos on-device para un chunk de prefill de 128 tokens y un paso de decodificacion (Qualcomm AI Hub, entradas aleatorias, archivos 4k): Galaxy S23 Ultra 49 ms (solo prefill; la decodificacion agoto la memoria del dispositivo), S24 Ultra 40 / 29 ms, S25 Ultra 31 / 26 ms, S26 Ultra 26 / 24 ms. Con LiteRT-LM 0.19.1, LiteRT 2.4.0 y QAIRT 2.52, todos los telefonos dieron respuestas identicas palabra por palabra y los tiempos de carga de NPU se redujeron entre 2 y 4 veces (1,8 s en el Fold6, 7,2 s en el Tab S10+).

## Requisitos de hardware

- Almacenamiento: 2,31 GB (SM8650/SM8750/SM8850 4k), 2,35-2,36 GB (variantes 4k-16k), 2,97 GB (MediaTek MT6989), 3,16 GB (SM8550).
- SoC soportados: Snapdragon 8 Gen 2 (SM8550), 8 Gen 3 (SM8650), 8 Elite (SM8750), 8 Elite Gen 5 (SM8850) y MediaTek Dimensity 9300 (MT6989). Cada archivo funciona solo en el chip que indica su nombre.
- No cabe en GPU de consumo: esta disenado exclusivamente para NPU movil; no hay variantes GGUF ni para llama.cpp, Ollama, vLLM o TGI.
- Runtime: LiteRT-LM 0.18 o 0.19.1 en Android con `Backend.NPU`.
- Snapdragon: dispatch de Qualcomm con QAIRT 2.50 o superior (probado 2.52) y la libreria HTP del chip: V73 (SM8550), V75 (SM8650), V79 (SM8750) o V81 (SM8850). El manifiesto requiere `<uses-native-library android:name="libcdsprpc.so" android:required="false"/>`.
- MediaTek: libreria de dispatch de MediaTek de LiteRT y el runtime Neuron del telefono.
- Advertencia de despliegue: LiteRT carga la primera `libLiteRtDispatch_*.so` que encuentra; si la app incluye librerias de varios fabricantes, hay que apuntar `Backend.NPU` a un directorio que contenga solo la del fabricante del telefono.
- Latencia: prefill de 128 tokens entre 26 y 49 ms y decodificacion de un token entre 24 y 29 ms en Snapdragon 8 Elite y posteriores; carga inicial de NPU de 3,4 a 27 s segun chip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B IT LiteRT-LM NPU (esta ficha) | no disponible (variante E2B) | 4.096 / 16.384 | NPU movil Snapdragon y MediaTek | Apache 2.0 | Build comunitario por chip, solo texto |
| google/gemma-4-E2B-it (modelo base) | no disponible | no disponible | GPU/CPU generico | regimen Gemma (verificar) | Modelo original de Google, sin compilacion NPU |
| Alternativas on-device de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No hay datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks del modelo base ni de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Build de comunidad: no esta publicado ni soportado por Google, Qualcomm ni MediaTek; la calidad del artefacto depende del autor.
- Acoplamiento total al hardware: cada archivo funciona solo en el chip indicado; no hay fallback a CPU o GPU.
- Solo texto: la model card indica entrada de texto; no se documentan capacidades de vision o audio.
- El archivo MediaTek 4k-16k fue retirado el 23 de noviembre de 2026 porque no carga en un Dimensity 9300 (error Neuron "Fail to deserialize compiled network"); debe usarse el archivo 4k de MediaTek.
- Las pruebas del autor son 13 prompts reservados con comprobaciones estrictas de palabras clave; algunos fallos son de coincidencia literal (por ejemplo, "parking is prohibited" frente a "no parking"), no respuestas incorrectas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el comportamiento tipico de modelos generativos pequenos.
- Idiomas: solo los 9 usados en la calibracion v3; el rendimiento fuera de ellos no esta documentado.
- Licencia: el artefacto declara Apache 2.0, pero los pesos derivan de `google/gemma-4-E2B-it`; conviene revisar los terminos de Gemma para uso comercial antes de produccion.
- En produccion, fijar la descarga al commit `2687ca17` para garantizar los hashes sha256 publicados.
- El rendimiento depende de la version del runtime: LiteRT-LM 0.18 o 0.19.1, QAIRT 2.50+ y las librerias HTP o Neuron correctas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fertroll10/gemma-4-E2B-it-litert-lm-npu
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
