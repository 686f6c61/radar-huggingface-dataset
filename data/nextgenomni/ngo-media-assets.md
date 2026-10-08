# nextgenomni/ngo-media-assets

## Resumen

`nextgenomni/ngo-media-assets` es un paquete de modelos ONNX publicado por NextGenOmni (Reelquill AI) que implementa un sistema completo de *talking head* o presentador virtual: a partir de una única fotografia y una pista de audio, genera video de un rostro articulando labios y cabeza. No es un unico modelo entrenado por el autor, sino una distribucion de diez redes ONNX de terceros empaquetadas en un tar sin comprimir (`ngo-media-assets-v1.tar`, 0,9 GB de repositorio), con licencias MIT y Apache 2.0 por archivo.

El pipeline combina tres bloques: las redes de LivePortrait (Kuaishou) para extraccion de apariencia, extraccion de movimiento, *stitching*, *warping* y decodificacion de fotogramas; el modelo de movimiento de Ditto (Ant Group, `lmdm_v0.4_hubert.onnx`), derivado del modelo base `digital-avatar/ditto-talkinghead`; y HuBERT Large de Meta ajustado sobre LibriSpeech 960 h para convertir la voz en caracteristicas acusticas. La deteccion y el alineamiento facial se resuelven con BlazeFace y face mesh de MediaPipe (Google).

Su relevancia practica esta en el formato: todos los ficheros estan exportados a ONNX para ejecutarse en local con ONNX Runtime y DirectML sobre la GPU del usuario, sin subir fotos, voz ni video a ningun servidor. Ademas, Reelquill AI ha convertido tres archivos a fp16 y uno (HuBERT) a 4 bits con GPTQ sin reentrenar, y publica mediciones internas de la perdida de calidad resultante. El repositorio acumula 1 *like* y 0 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de 10 redes ONNX: LivePortrait (extractores de apariencia y movimiento, stitch, warp, decoder), modelo de movimiento de Ditto condicionado por audio, HuBERT Large (codificador de audio) y MediaPipe BlazeFace + face mesh (deteccion y landmarks faciales) |
| Parametros totales | no disponible (no se publican recuentos por red) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo audio a video; no procesa contexto textual) |
| Tipos de cuantizacion | fp16 (varias redes de LivePortrait y HuBERT) y 4 bits con GPTQ en `hubert_q4_acc4.onnx`; se menciona int8 como cuantizacion previa de HuBERT; `warp_network` en opset 20 |
| Idiomas soportados | no disponibles en la ficha; el codificador de audio es HuBERT Large ajustado sobre LibriSpeech 960 h (habla en ingles) y no se publica evaluacion multilingue |
| Licencia | `other`, con `license_name: mit-and-apache-2.0`; cada archivo conserva su licencia (MIT para LivePortrait y fairseq, Apache 2.0 para Ditto y MediaPipe) |
| Formato de pesos | ONNX; empaquetado como tar sin comprimir (`ngo-media-assets-v1.tar`) mas ficheros sueltos en el repositorio, con `pack.json` y `ngo-media-assets-v1.json` como manifiestos de tamano y SHA-256 |
| Biblioteca | onnx (ONNX Runtime con DirectML) |
| Modelo base | digital-avatar/ditto-talkinghead (relacion: cuantizado) |
| Tamano del repositorio | 0,9 GB |
| Fecha de publicacion | 2026-10-08 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

El paquete no entrena nada: es una redistribucion y conversion de formato de modelos ya existentes. Las cinco redes derivadas de LivePortrait (`appearance_extractor.onnx`, `motion_extractor.onnx`, `stitch_network.onnx`, `warp_network_opset20_fp16.onnx`, `decoder_fp16.onnx`) y la red de landmarks (`landmark203_fp16.onnx`) fueron exportadas a ONNX por Ant Group para Ditto. Los ficheros marcados como no convertidos, junto con `decoder_fp16.onnx`, son identicos byte a byte a los publicados en `digital-avatar/ditto-talkinghead` (commit `e4a2f60`, carpeta `ditto_onnx/`) o en `voxta/ditto-talkinghead-onnx` (commit `930ae65`).

El bloque de audio y movimiento lo forman `hubert_q4_acc4.onnx` (HuBERT Large de Meta, ajustado sobre LibriSpeech 960 h, exportado a ONNX y despues cuantizado por Reelquill AI) y `lmdm_v0.4_hubert.onnx`, el modelo de movimiento de Ditto que traduce las caracteristicas acusticas en pose de cabeza y expresion facial; el repositorio referencia el articulo arXiv:2411.19509 asociado a Ditto. La deteccion de rostro y los 478 puntos faciales se resuelven con `blaze_face.onnx` y `face_mesh.onnx` (MediaPipe, Google), publicados tal cual con Ditto. Los articulos citados en las etiquetas incluyen ademas arXiv:2407.03168 (LivePortrait), arXiv:2106.07447 (HuBERT) y arXiv:2210.17323.

Las unicas modificaciones del autor son de precision: `warp_network_opset20_fp16.onnx` (fp16, con GridSample mantenido en fp32), `landmark203_fp16.onnx` (fp16) y `hubert_q4_acc4.onnx` (pesos de 4 bits por GPTQ y constantes en fp16). `decoder_fp16.onnx` procede de Voxta sin cambios. No se documento ningun ajuste fino, RLHF ni DPO, ni se publican datos de entrenamiento propios.

## Capacidades

- Generacion de video de *talking head* a partir de una sola fotografia y una narracion de audio.
- Sincronizacion labial (*lip-sync*) guiada por voz, con control de apertura y cierre de boca derivado del audio.
- Animacion de pose de cabeza y expresion facial, no solo de la boca.
- Transferencia de apariencia y *stitching* para mantener el rostro generado unido a la imagen original.
- Deteccion de rostro (BlazeFace, rango corto) y malla facial de 478 puntos (face mesh) para recorte y alineamiento.
- Extraccion de 203 landmarks faciales adicionales para encuadre y normalizacion.
- Inferencia local en GPU de consumo mediante ONNX Runtime con DirectML, sin envio de datos a servidores.
- Verificacion de integridad por SHA-256 de cada archivo antes de su uso.
- Descarga selectiva por *HTTP range requests*: la aplicacion solicita solo los bytes de los ficheros que necesita dentro del tar.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Presentador virtual en videos divulgativos: se toma una foto del ponente, se graba la narracion y el pipeline genera el video hablando; la ventaja frente a grabar en camara es la reutilizacion del mismo avatar para multiples guiones sin volver a grabar.
- Edicion de video de formato corto para redes sociales: la integracion de referencia (Reelquill AI) coloca el avatar en una burbuja sobre la grabacion de pantalla, de modo que el creador no necesita aparecer en camara.
- Formacion corporativa y onboarding: generar modulos narrados con un avatar estable a partir de una unica fotografia corporativa, reduciendo coste de produccion de video en comparacion con rodaje tradicional.
- Asistentes de escritorio con privacidad estricta: al ejecutarse en local con ONNX Runtime y DirectML, fotos, voz y video no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Investigacion en animacion facial: el paquete permite comparar el comportamiento de las mismas redes en fp32, fp16 y 4 bits, y sirve como base reproducible para estudiar el impacto de la cuantizacion en la sincronizacion labial.
- Verificacion y auditoria de pipelines de terceros: los manifiestos `pack.json` y `ngo-media-assets-v1.json` con offsets, tamanos y SHA-256 permiten reconstruir y validar una instalacion byte a byte.
- Aplicaciones de accesibilidad: lectura de textos largos con un avatar que articula la locucion sintetizada, util para personas con dificultades de lectura o para contenido de baja vision.
- Prototipado de avatares tipo VTuber o personajes interactivos en Windows, reutilizando el mismo conjunto de redes ONNX sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son las mediciones internas del autor al sustituir unicamente HuBERT de precision completa por su version cuantizada, con la misma locucion y los mismos ajustes (50,7 s de voz en tres clips, tres semillas cada uno):

| Metrica | hubert_q4_acc4 (4 bits, GPTQ) | HuBERT int8 (anterior) | HuBERT de precision completa |
|---|---|---|---|
| Coincidencia de estado de labios (abiertos/cerrados) | 98,6 % de los fotogramas | 97,3 % | referencia |
| Correlacion de las curvas de apertura de boca | 0,996 | 0,988 | 1,0 (referencia) |
| PSNR de 63 fotogramas de rostro generados | 39,2 dB | 32,7 dB | referencia |

Una prueba anterior del conjunto pequeno completo, con HuBERT en int8 y las redes faciales en fp16, sobre 12 s de voz, dio una coincidencia de labios del 98 % de los fotogramas. Estas cifras son autoevaluadas por el autor, no replicadas de forma independiente, y se basan en muestras reducidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria ni de latencia.
- Huella en disco: 0,9 GB para el repositorio; la aplicacion descarga solo los ficheros necesarios mediante peticiones de rango, por lo que el espacio ocupado puede ser menor.
- GPU: la ruta de ejecucion documentada es ONNX Runtime sobre DirectML, es decir, graficas compatibles con DirectML en Windows. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no confirmado explicitamente. DirectML esta pensado para aceleracion en hardware de consumo y el repositorio en si ocupa 0,9 GB, pero no se publica una lista de tarjetas validada.
- Opciones de despliegue: ONNX Runtime con ejecucion DirectML; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelos audio a video). Existe un empaquetado alternativo de terceros en `voxta/ditto-talkinghead-onnx`.
- Latencia y throughput: no disponibles. El unico dato temporal es la duracion del material de prueba (50,7 s de voz, 12 s en la prueba previa), no el tiempo de inferencia.

## Comparativa con modelos similares

| Modelo o paquete | Tipo | Formato | Licencia | Relacion con este repositorio |
|---|---|---|---|---|
| `nextgenomni/ngo-media-assets` | Paquete completo de talking head (LivePortrait + Ditto + HuBERT + MediaPipe) | ONNX, fp16 y 4 bits, tar sin comprimir | MIT y Apache 2.0 por archivo | Es el objeto de esta ficha |
| `digital-avatar/ditto-talkinghead` | Modelo base de Ditto mas exportaciones ONNX de LivePortrait | ONNX y pesos de precision completa | Apache 2.0 (Ditto) | Origen directo; aqui solo se anaden conversiones de precision |
| `voxta/ditto-talkinghead-onnx` | Repack de Ditto para ONNX Runtime | ONNX | Apache 2.0 | Origen de `decoder_fp16.onnx` y de la version opset 20 del warp network |
| LivePortrait (Kuaishou) | Redes de animacion facial por transferencia de movimiento | Pesos originales | MIT | Aporta las redes faciales del paquete (via exportacion de Ant Group) |

No se dispone de datos comparativos de calidad, latencia o consumo de VRAM frente a otras alternativas de *talking head* como SadTalker o EchoMimic en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier sesgo, artefacto o limitacion de LivePortrait, Ditto, HuBERT o MediaPipe se hereda sin cambios, ya que no hubo reentrenamiento.
- Licencia `other`: cada archivo mantiene su propia licencia (MIT o Apache 2.0). Antes de un uso comercial hay que revisar `NOTICE-Reelquill.txt`, los textos de licencia incluidos (`LICENSE-MIT-LivePortrait.txt`, `LICENSE-MIT-fairseq.txt`, `LICENSE-Apache-2.0.txt`) y el NOTICE de Voxta, que imponen obligaciones de atribucion.
- El autor remite expresamente a una *use policy* que no se reproduce en la informacion disponible; conviene leerla antes de desplegar el modelo.
- Riesgo de uso indebido: la generacion de video de una persona a partir de una sola fotografia es directamente aplicable a la creacion de contenido falso o suplantacion de identidad, sin que se detallen en la ficha mecanismos tecnicos de mitigacion (marcas de agua, deteccion).
- Calidad en idiomas distintos del ingles no verificada: el codificador de audio se ajusto sobre LibriSpeech 960 h y no se publican evaluaciones multilingues, por lo que la sincronizacion labial en castellano u otras lenguas es una incognita.
- Sin datos sobre diversidad del rostro: no hay evaluacion de sesgos por tono de piel, edad, gafas, barba u oclusiones, ni de comportamiento en poses de perfil pronunciado.
- Evidencia estadistica limitada: las cifras de calidad proceden de 50,7 s de voz en tres clips y 63 fotogramas medidos, con evaluacion del propio autor y sin replicacion externa.
- Dependencia de Windows y DirectML en el caso de uso documentado; no se detalla el comportamiento en otros sistemas operativos ni con otros backends de ONNX Runtime.
- No hay datos de VRAM, latencia ni throughput, lo que impide dimensionar el despliegue en produccion con la informacion disponible.
- Adopcion muy baja en el momento de la consulta (0 descargas, 1 *like*, sin pipeline declarado), por lo que existe poca validacion por parte de la comunidad.
- La fecha de creacion y actualizacion es la misma (2026-10-08), lo que sugiere un paquete recien publicado y sin historial de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nextgenomni/ngo-media-assets
- Modelo base: https://huggingface.co/digital-avatar/ditto-talkinghead
- Carpetas de origen de los ficheros ONNX (commit `e4a2f60`): https://huggingface.co/digital-avatar/ditto-talkinghead/tree/e4a2f60328ee7c32af585ac4b3cce299e4c8e254
- Repack ONNX de Voxta: https://huggingface.co/voxta/ditto-talkinghead-onnx
- Commit de Voxta usado: https://huggingface.co/voxta/ditto-talkinghead-onnx/tree/930ae658ab5247e6209b21c4265cecf2a5b45610
- Codificador de audio: https://huggingface.co/facebook/hubert-large-ls960-ft
- Aviso de licencias y cambios del autor: https://huggingface.co/NextGenOmni/ngo-media-assets/blob/main/NOTICE-Reelquill.txt
- Aplicacion que lo utiliza: https://reelquillai.nextgenomni.com
- Articulo de Ditto: https://arxiv.org/abs/2411.19509
- Articulo de LivePortrait: https://arxiv.org/abs/2407.03168
- Articulo de HuBERT: https://arxiv.org/abs/2106.07447
- Articulo referenciado en las etiquetas (MediaPipe): https://arxiv.org/abs/2210.17323
