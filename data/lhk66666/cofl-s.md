# lhk66666/CoFL-S

# CoFL-S

## Resumen

CoFL-S es un modelo de politica para navegacion visual-lenguaje (visual-language navigation, VLN) publicado en HuggingFace por el usuario lhk66666 bajo el pipeline `robotics`. Se distribuye como un checkpoint completo de PyTorch Lightning (`best.ckpt`, 5.336.379.647 bytes) que recibe como entrada una observacion RGB-D y una instruccion de navegacion en lenguaje natural, y produce como salida un campo continuo sobre el plano de suelo (ground-plane field) junto con logits de accion discreta (STOP, MOVE_FORWARD, TURN_LEFT, TURN_RIGHT). El backbone es SigLIP2 base con patch 16 y preprocesado de imagen a 224 pixeles, un codificador vision-lenguaje de tipo transformer.

La relevancia de esta publicacion es doble. Por un lado, aporta una version saneada (sanitized) de un checkpoint CoFL-S orientada exclusivamente a investigacion academica no comercial, con verificacion de integridad documentada: los 2.274 tensores (575 entradas de `state_dict`) son identicos byte a byte respecto al checkpoint original, y los seis assets del procesador permanecen inalterados. Por otro lado, el paquete incluye el codigo fuente CoFL y CoFL-S bajo Apache-2.0 (`source/cofl-source.tar.gz`) con dependencias bloqueadas, lo que permite reproducir la carga y el reentrenamiento.

Se trata de un lanzamiento de investigacion con restricciones de uso: la licencia `cofl-model-license-1.0` combina CC BY-NC-SA 3.0 US para las contribuciones originales de CoFL, el acuerdo independiente de datos fuente de Matterport3D y los terminos Apache-2.0 de los componentes SigLIP2. En el momento de la ficha, el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de benchmarks de navegacion asociados a esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone SigLIP2 base (patch 16, preprocesado a 224 px) + cabezas de politica para campo continuo de plano de suelo y logits de accion discreta |
| Parametros totales | no disponible (el checkpoint es un estado completo de Lightning con optimizador, scheduler, bucles y estados aleatorios, por lo que el recuento de parametros no se declara) |
| Longitud de contexto | no disponible (la entrada es una observacion RGB-D mas una instruccion de navegacion, no una secuencia de texto con ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint en formato PyTorch Lightning) |
| Idiomas soportados | no disponible |
| Licencia | `cofl-model-license-1.0` (etiquetada como "other"): CC BY-NC-SA 3.0 US para las contribuciones originales de CoFL, acuerdo de datos fuente de Matterport3D y Apache-2.0 para los componentes SigLIP2 |
| Formato de pesos | Checkpoint completo de PyTorch Lightning (`.ckpt`, CoFL schema 2); no se distribuye en safetensors ni GGUF |

Otros datos del artefacto: SHA-256 del fichero publicado `cce748914a88167a2566ffd724ed43f0f651841dcab25afcbef706f5ccd62b12`; SHA-256 del checkpoint fuente original `015acb99eaf3fa8a47833e2c6cc6166eb6d18b274344789c7ed850a12763ca42`; posicion de entrenamiento guardada: epoca 0, paso global 85.000; tamano del repositorio 5,3 GB.

## Arquitectura y entrenamiento

La arquitectura se apoya en el codificador SigLIP2 base con patch de 16 pixeles y preprocesado de imagen a 224 pixeles, empleado como backbone multimodal para fusionar la observacion visual (RGB-D) con la instruccion de navegacion. Sobre ese backbone, el modelo incorpora cabezas de politica especificas: una que predice un campo continuo sobre el plano de suelo, util para guiar el desplazamiento del robot, y otra que emite logits sobre un espacio de acciones discretas compuesto por STOP, MOVE_FORWARD, TURN_LEFT y TURN_RIGHT. El checkpoint corresponde al paso global 85.000 dentro del primer epoch del entrenamiento guardado. No se especifica en la informacion disponible el volumen de tokens ni la composicion exacta del dataset de entrenamiento, aunque la licencia y los avisos de terceros vinculan los datos fuente a Matterport3D. Tampoco se documenta el uso de RLHF o DPO, tecnicas propias de modelos de lenguaje que no se mencionan en el material proporcionado.

La innovacion tecnica mas destacable de esta publicacion no esta en el modelo en si, sino en el proceso de saneado y verificacion. Se modificaron siete ubicaciones de metadatos (el directorio de dataset guardado y rutas de callbacks del checkpoint, incluidas claves de `best_k_models`), que ahora apuntan a `datasets/cofl-s` y `checkpoints/cofl-s`, sin que se editase ningun tensor ni asset del procesador. La verificacion documenta que los 2.274 tensores son identicos byte a byte, que los checkpoints original y saneado cargan con la red bloqueada, y que sobre dos entradas RGB-D sinteticas deterministas el contexto codificado, las predicciones de campo y los logits de accion son exactamente iguales. Ademas, se ejecutaron pruebas en CPU en 16 fronteras de entrenamiento interrumpido con `num_workers=0` y `2`, obteniendo sufijos de entrenamiento y estados finales identicos. El checkpoint conserva optimizador, scheduler, bucles, identidad de datos y estados aleatorios completos, pero no anade una API de ajuste fino. La nota importante es que estas pruebas son comprobaciones de compatibilidad, no una evaluacion de navegacion a nueva escala.

## Capacidades

- Navegacion visual-lenguaje (VLN): procesa una observacion RGB-D junto a una instruccion de navegacion en lenguaje natural para producir una politica de movimiento.
- Prediccion de campo continuo sobre el plano de suelo (ground-plane field) para guiar trayectorias.
- Clasificacion de acciones discretas: STOP, MOVE_FORWARD, TURN_LEFT y TURN_RIGHT.
- Fusion multimodal de vision, profundidad (RGB-D) y lenguaje a traves del backbone SigLIP2.
- Carga autonoma: configuracion de modelo, ficheros de tokenizer/procesador y pesos estan embebidos, por lo que la carga no requiere descargar el modelo preentrenado ni depender de las rutas de entrenamiento originales.
- Reanudacion de entrenamiento: al ser un checkpoint Lightning completo, conserva estado de optimizador, scheduler, bucles y estados aleatorios, lo que permite reanudar desde la posicion guardada (epoca 0, paso 85.000).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento de agente multi-paso mas alla del bucle de politica de navegacion.
- No se confirman capacidades multilingues ni un modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de vision mas alla del uso del encoder SigLIP2 como backbone, ni capacidades de audio.

## Casos de uso

- Navegacion de robots moviles en interiores guiada por instrucciones: el modelo recibe la observacion RGB-D del robot y una orden en lenguaje natural, y devuelve la accion discreta siguiente junto con un campo de plano de suelo que puede usarse para refinar el control de bajo nivel.
- Investigacion academica en vision-language navigation: sirve como punto de partida reproducible para experimentos de VLN, dado que el paquete incluye el codigo CoFL y CoFL-S bajo Apache-2.0 y dependencias bloqueadas.
- Reanudacion y estudio del entrenamiento: al conservar optimizador, scheduler y estados aleatorios, es adecuado para analizar la dinamica de entrenamiento desde el paso 85.000, aunque sin API de fine-tuning asociada.
- Verificacion de integridad y reproducibilidad: los informes de saneado, inferencia y reanudacion permiten auditar que la version publicada produce salidas identicas al checkpoint fuente sobre entradas deterministas.
- Evaluacion en entornos tipo Matterport3D: la vinculacion con el acuerdo de datos fuente de Matterport3D orienta su uso a escenarios de navegacion en interiores modelados en ese ecosistema.
- Pruebas de compatibilidad y CI: los tests en CPU a lo largo de 16 fronteras de entrenamiento interrumpido permiten integrar comprobaciones de reanudacion en pipelines de investigacion sin depender de GPU.
- Desarrollo de interfaces sobre la politica: el wheel incluido en `source/` incorpora una Studio UI construida, lo que facilita la exploracion interactiva de la politica en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El material proporcionado unicamente describe comprobaciones de compatibilidad (igualdad de contexto codificado, predicciones de campo y logits de accion sobre dos entradas RGB-D sinteticas deterministas) y pruebas de reanudacion en CPU. Estas verificaciones no constituyen una evaluacion de navegacion a nueva escala, y no se aportan metricas como success rate, SPL ni comparaciones frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El fichero publicado ocupa 5,3 GB, pero al tratarse de un checkpoint Lightning completo incluye estados de optimizador y scheduler, por lo que su huella en memoria de inferencia no puede derivarse directamente del tamano del fichero.
- GPU recomendadas: no especificadas en la informacion disponible.
- Uso en GPU de consumo: no confirmado. No se indica si el modelo cabe en tarjetas tipo RTX 4090 u otras GPU de gama consumer.
- Ejecucion en CPU: confirmada parcialmente. El ejemplo oficial de carga usa `load_policy("best.ckpt", device="cpu")`, y se documentan pruebas en CPU en 16 fronteras de entrenamiento interrumpido con `num_workers=0` y `2`.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con pesos en safetensors o GGUF. El despliegue requiere la release de codigo CoFL correspondiente y sus dependencias bloqueadas (`uv sync --locked`), cargando desde `../best.ckpt` una vez extraido `source/cofl-source.tar.gz`.
- Latencia y throughput estimados: no disponibles.
- Verificacion de descarga: se recomienda `sha256sum -c SHA256SUMS` tras la descarga y el uso de `--revision` con el hash de commit completo para descargas inmutables.

## Comparativa con modelos similares

No hay datos de benchmarks ni comparaciones publicadas en la informacion disponible que permitan situar a CoFL-S frente a alternativas de la misma categoria. La unica relacion documentada es con su backbone y con el propio linaje CoFL.

| Modelo | Tipo | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|
| CoFL-S | Politica de navegacion visual-lenguaje | SigLIP2 base (patch 16, 224 px) | `cofl-model-license-1.0` (uso no comercial) | HuggingFace: `lhk66666/CoFL-S` |
| SigLIP2 base (`google/siglip2-base-patch16-224`) | Codificador vision-lenguaje | no aplica | Apache-2.0 | HuggingFace: `google/siglip2-base-patch16-224` |
| CoFL (antecesor) | Politica de navegacion visual-lenguaje | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de parametros, contexto ni rendimiento del modelo antecesor CoFL, ni de otros modelos VLN comparables, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: el lanzamiento es un modelo de investigacion con restricciones de uso y no se concede autorizacion comercial a traves de la model card.
- Regimen de licencia compuesto y de cumplimiento obligatorio: CC BY-NC-SA 3.0 US para las contribuciones de CoFL, el acuerdo independiente de datos fuente de Matterport3D y Apache-2.0 para los componentes SigLIP2. Al redistribuir el checkpoint hay que conservar `LICENSE` y `THIRD_PARTY_NOTICES.md`.
- Obligaciones derivadas de los datos fuente: el saneado de metadatos no modifica las obligaciones asociadas a los datos de origen Matterport3D.
- Hash no coincidente con el original: el saneado altera los bytes del fichero y, por tanto, su hash. Las evaluaciones historicas conservan el hash del checkpoint original; al evaluar esta release debe usarse un directorio de salida nuevo.
- Sin evaluacion de navegacion a nueva escala: las comprobaciones documentadas son de compatibilidad (entradas sinteticas deterministas) y de reanudacion en CPU, no un benchmark de navegacion.
- Sin API de fine-tuning: aunque el checkpoint retiene optimizador, scheduler y estados aleatorios, la publicacion no anade una interfaz de ajuste fino.
- Limitacion de provenance historica: los avisos de terceros reconocen limites remanentes en el registro de procedencia de las anotaciones historicas.
- Idiomas no confirmados: no se especifican los idiomas soportados para las instrucciones de navegacion.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible. No obstante, al entrenarse sobre datos vinculados a Matterport3D, cabe esperar un sesgo hacia escenas de interior de ese dominio, si bien esto no se cuantifica en el material proporcionado.
- Restriccion practica de despliegue: al no distribuirse en safetensors ni GGUF, no es compatible con los runners habituales de modelos de lenguaje y exige la release de codigo CoFL con sus dependencias bloqueadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lhk66666/CoFL-S
- Modelo base (SigLIP2 base, patch 16, 224 px): https://huggingface.co/google/siglip2-base-patch16-224
- Licencia `LICENSE` (en el repositorio): https://huggingface.co/lhk66666/CoFL-S/blob/main/LICENSE
- Avisos de terceros `THIRD_PARTY_NOTICES.md`: https://huggingface.co/lhk66666/CoFL-S/blob/main/THIRD_PARTY_NOTICES.md
- Informe de saneado `best.sanitization.json`: https://huggingface.co/lhk66666/CoFL-S/blob/main/best.sanitization.json
- Informe de verificacion de inferencia `best.inference-verification.json`: https://huggingface.co/lhk66666/CoFL-S/blob/main/best.inference-verification.json
- Informe de pruebas de reanudacion `best.resume-verification.json`: https://huggingface.co/lhk66666/CoFL-S/blob/main/best.resume-verification.json
- Checksum `best.ckpt.sha256`: https://huggingface.co/lhk66666/CoFL-S/blob/main/best.ckpt.sha256
- Sumas de verificacion `SHA256SUMS`: https://huggingface.co/lhk66666/CoFL-S/blob/main/SHA256SUMS
- Guia de descargas fijadas a una revision: https://huggingface.co/docs/huggingface_hub/guides/download
