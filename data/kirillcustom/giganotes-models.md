# kirillcustom/giganotes-models

## Resumen

`kirillcustom/giganotes-models` no es un modelo entrenado, sino un paquete de distribucion de cuatro modelos ya existentes, convertidos a formatos nativos de Apple (CoreML y ONNX) para su uso en GigaNotes, una aplicacion de macOS sobre Apple Silicon que transcribe reuniones en ruso con etiquetado de hablantes. El paquete lo publica el usuario kirillcustom y su funcion es servir de origen de descarga verificado para la aplicacion: el audio nunca sale del Mac y la red solo se usa una vez, en la primera ejecucion, para bajar el conjunto.

El bundle ocupa 1,07 GB (1,1 GB de repositorio) y combina el reconocedor de voz ruso GigaAM v3 e2e RNNT de SaluteDevices, el modelo de diarizacion Nemotron 3 Diarization de NVIDIA, el extractor de embeddings de hablante TitaNet Large de NVIDIA y el segmentador de voz pyannote/segmentation-3.0. Los pesos no se han reentrenado ni ajustado: son los originales, unicamente reempaquetados para ejecutarse en el Neural Engine, la GPU y la CPU de los Mac con chip de la serie M.

Su relevancia actual es de tipo practico: demuestra un patron de despliegue de ASR y diarizacion totalmente local en hardware de consumo Apple, con verificacion criptografica de integridad y licencias heterogeneas. La ficha siguiente describe el paquete como lo que es, una distribucion de inferencia, no un modelo con pesos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto de cuatro modelos: reconocedor ASR end-to-end con decodificacion RNN-Transducer (encoder, decoder y joint) para GigaAM v3; red de diarizacion en streaming de un solo paso para Nemotron 3 Diarization; extractor de embeddings de hablante para TitaNet Large; segmentador de voz para pyannote segmentation-3.0. La informacion disponible no detalla la topologia interna de cada red |
| Parámetros totales | no disponible (el repositorio publica tamanos de archivo, no recuentos de parametros) |
| Parámetros activos | no aplica (ningun componente es un modelo MoE) |
| Longitud de contexto | No es contexto de texto: GigaAM v3 usa forma estatica de 22 s de audio con mascara de padding; TitaNet Large ofrece cuatro formas de entrada de 2, 4, 8 y 16 s; la longitud de reunion la limita el troceado que haga la aplicacion |
| Tipos de cuantizacion | CoreML fp16 (encoder de GigaAM v3 y TitaNet Large); CoreML fp32 (Nemotron 3 Diarization); pesos fp32 planos para Accelerate (decoder y joint de GigaAM v3); ONNX fp32 sin modificar (pyannote segmentation-3.0) |
| Idiomas soportados | ru para reconocimiento de voz. El componente de embeddings TitaNet procede del modelo de verificacion de hablante `speakerverification_en_titanet_large` (ingles) |
| Licencia | Mixta: MIT (GigaAM v3, pyannote segmentation-3.0), OpenMDW (Nemotron 3 Diarization), CC-BY-4.0 (TitaNet Large, con atribucion obligatoria a NVIDIA Corporation). El repositorio se declara como `other` / `mixed` con LICENSE.md |
| Formato de pesos | CoreML `.mlpackage` empaquetados en zip, ONNX y pesos fp32 planos para Accelerate |

Desglose del paquete (version 1, 1,07 GB):

| Componente | Funcion | Tamano | Formato | Licencia | Autor |
|---|---|---|---|---|---|
| GigaAM v3 e2e RNNT | Reconocimiento de voz en ruso | 449 MB | CoreML fp16 (encoder) + fp32 para Accelerate (decoder y joint) | MIT | SaluteDevices |
| Nemotron 3 Diarization | Determinar quien habla y cuando | 398 MB | CoreML fp32 | OpenMDW | NVIDIA |
| TitaNet Large | Vectores de voz para mantener nombres entre grabaciones | 220 MB | CoreML fp16 en formas de 2, 4, 8 y 16 s | CC-BY-4.0 | NVIDIA |
| pyannote segmentation-3.0 | Deteccion de fronteras de habla | 6 MB | ONNX sin modificar (build de sherpa-onnx) | MIT | pyannote |

## Arquitectura y entrenamiento

No ha habido entrenamiento ni ajuste fino. El autor indica explicitamente que los pesos no se han reentrenado y que se trata de "las mismas modelos, solo en formato para Mac". El trabajo consiste en conversion de formato y verificacion numerica: el encoder de GigaAM v3 se tradujo a CoreML fp16 con forma estatica de 22 s y mascara de padding, y se ejecuta en el Neural Engine; el decoder y el joint se exportaron como pesos fp32 planos para Accelerate; el tokenizador y el vocabulario se mantienen identicos a los del original. Nemotron 3 Diarization se convirtio a CoreML fp32 sobre GPU, dejando el calculo del mel y de la cache de voces a la aplicacion. TitaNet Large se exporto a CoreML fp16 en cuatro formas temporales. pyannote segmentation-3.0 se incorpora como ONNX sin cambios, procedente del build de k2-fsa/sherpa-onnx.

La validacion reportada por el autor es numerica y acotada: el ONNX fp32 de GigaAM v3 coincide "palabra por palabra" con la version PyTorch; el encoder CoreML fp16 con mascara de padding produce el mismo resultado que sin ella en fragmentos con relleno; en un audio de referencia de una llamada en ruso con 3.716 palabras, el WER fue del 7,5 % en fp16 sobre Neural Engine frente al 7,6 % en fp32 sobre CPU. Nemotron 3 Diarization se situa a menos de 5·10⁻⁴ de las probabilidades de hablante de NeMo, TitaNet Large conserva el mismo reparto de voces que el ONNX original en 20 pruebas con ruido de entrada y pyannote no se ha modificado. El repositorio incluye `models.json` con version, rutas, tamanos, SHA-256 por archivo y hash del arbol descomprimido, y las descargas se fijan por numero de commit en lugar de la rama `main`.

No se documenta en la informacion disponible el corpus de entrenamiento de los modelos de origen, la composicion del dataset, ni si hubo RLHF o DPO: al ser modelos de voz, esos datos corresponderian a las model cards originales de SaluteDevices, NVIDIA y pyannote, no a este repositorio.

## Capacidades

- Reconocimiento automatico de voz en ruso con decodificacion RNN-Transducer, pensado para audio de reunion y ejecucion local.
- Diarizacion de hablantes (quien habla y cuando) con una red de un solo paso en modo streaming, segun la descripcion del autor.
- Extraccion de embeddings de hablante con TitaNet Large para asociar voces entre grabaciones distintas y reutilizar nombres.
- Segmentacion de fronteras de habla con pyannote segmentation-3.0 como apoyo al troceado y a la deteccion de turnos.
- Procesamiento completamente offline: el bundle se descarga una vez y el audio no abandona el equipo.
- Descarga reanudable y verificacion de integridad por SHA-256 de cada archivo y del arbol descomprimido.
- Sin tool calling, sin function calling, sin generacion de texto, sin capacidades de agente, sin vision, sin audio generativo y sin traduccion: el paquete solo transcribe y etiqueta hablantes.
- Multilingue: unicamente ruso en reconocimiento; el resto de idiomas no esta soportado por el componente ASR.

## Casos de uso

- Actas de reunion en empresas rusohablantes: la aplicacion graba la reunion y el bundle produce una transcripcion con etiquetas de hablante, de modo que el acta puede atribuir cada intervencion a una persona sin enviar el audio a un servicio en la nube.
- Entrevistas y sesiones de investigacion cualitativa: la diarizacion permite separar entrevistador y entrevistado en grabaciones largas, y los embeddings de TitaNet facilitan mantener el mismo identificador entre sesiones del mismo participante.
- Verificacion y auditoria de llamadas: en entornos donde el audio es sensible (salud, legal, recursos humanos), el procesamiento local evita la cesion de datos a terceros y la diarizacion permite reconstruir el turno de palabra.
- Integracion en aplicaciones macOS nativas: al estar en CoreML con decoder y joint en Accelerate, el bundle encaja en apps Swift que aprovechan Neural Engine, GPU y CPU sin dependencias de CUDA ni de contenedores.
- Preprocesado para pipelines posteriores: la transcripcion diarizada sirve de entrada a un sistema de resumen o de busqueda aparte, ya que este paquete no genera texto libre ni resumenes por si mismo.
- Investigacion sobre ASR en ruso: el bundle permite reproducir el WER de referencia (7,5 % fp16 frente a 7,6 % fp32) en hardware Apple Silicon y comparar el comportamiento de la conversion CoreML frente a la implementacion PyTorch/ONNX original.
- Despliegue por lotes en un Mac de sobremesa: un Mac Studio o un MacBook Pro pueden procesar una cola de grabaciones archivadas de forma local, sin coste de API y sin limites de cuota de servicio.
- Aplicaciones de dictado con trazabilidad de hablante: la forma de 22 s del encoder y las formas cortas de TitaNet permiten trocear audio continuo y mantener etiquetas estables a lo largo de una jornada de grabacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, algo esperable al tratarse de un paquete de modelos de voz. Los unicos datos de rendimiento aportados son de verificacion numerica:

| Prueba | Componente | Resultado |
|---|---|---|
| WER en audio de referencia (llamada en ruso, 3.716 palabras) | GigaAM v3 e2e RNNT, encoder CoreML fp16 en Neural Engine | 7,5 % |
| WER en el mismo audio | GigaAM v3 e2e RNNT, fp32 en CPU | 7,6 % |
| Equivalencia con PyTorch | GigaAM v3, ONNX fp32 | Coincidencia literal con la salida de torch |
| Desviacion frente a NeMo | Nemotron 3 Diarization, CoreML fp32 | Hasta 5·10⁻⁴ en probabilidades de hablante |
| Estabilidad del reparto de voces | TitaNet Large, CoreML fp16 frente a ONNX | Mismo reparto en 20 pruebas con ruido de entrada |
| Integridad | pyannote segmentation-3.0 | ONNX sin modificar respecto al build de sherpa-onnx |

No se aportan datos de latencia, throughput en tiempo real ni consumo energetico.

## Requisitos de hardware

- Equipo objetivo: Mac con Apple Silicon (serie M). El encoder de GigaAM v3 en fp16 esta pensado para el Neural Engine; Nemotron 3 Diarization usa CoreML fp32 sobre GPU; el decoder y el joint se ejecutan en Accelerate sobre CPU.
- No se requiere GPU NVIDIA ni CUDA: el paquete esta orientado a CoreML y ONNX, no a CUDA.
- Descarga: 1,1 GB de repositorio y 1,07 GB de conjunto de modelos, mas el espacio de los `.mlpackage` descomprimidos.
- Memoria unificada: la informacion disponible no especifica un minimo de RAM; los modelos suman poco mas de 1 GB de pesos y el consumo adicional depende de los buffers de audio y de la cache de voces que gestiona la aplicacion.
- No cabe ni tiene sentido en GPU de consumo tipo RTX 4090: los formatos publicados no son ejecutables en ese hardware sin reconvertir los pesos.
- Opciones de despliegue: tiempo de ejecucion de CoreML, Accelerate para los pesos planos del decoder y el joint, ONNX Runtime o una build de sherpa-onnx para pyannote segmentation-3.0, y la propia aplicacion GigaNotes como orquestador. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no hay pesos GGUF ni un transformer de texto.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el WER del 7,5 % en fp16 sobre Neural Engine y la equivalencia numerica con fp32, sin medida de velocidad.

## Comparativa con modelos similares

La comparativa mas util es frente a los propios modelos de origen, en sus formatos nativos, y frente a la alternativa de componer un pipeline ASR mas diarizacion por separado.

| Opcion | Componentes | Formato de pesos | Idiomas | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este paquete (`kirillcustom/giganotes-models`) | GigaAM v3 e2e RNNT + Nemotron 3 Diarization + TitaNet Large + pyannote segmentation-3.0, ya integrados y verificados | CoreML (fp16 y fp32), ONNX y pesos fp32 planos | ru en reconocimiento | Mixta: MIT, OpenMDW, CC-BY-4.0 | Apple Silicon (Neural Engine, GPU, CPU) |
| `ai-sage/GigaAM-v3` original | Solo reconocimiento de voz ruso | Pesos PyTorch / ONNX fp32 | ru | MIT | CPU o GPU, requiere entorno Python |
| `nvidia/Nemotron-3-Diarization` original | Solo diarizacion | Pesos NeMo | No especificado en la informacion disponible | OpenMDW | GPU recomendada, ecosistema NeMo |
| `pyannote/segmentation-3.0` original | Solo segmentacion de voz | Pesos PyTorch y ONNX de sherpa-onnx | Independiente del idioma | MIT | CPU o GPU |
| Pipeline alternativo tipo Whisper mas diarizacion | ASR multilingue mas un modelo de diarizacion aparte | GGUF, safetensors, ONNX, segun implementacion | Multilingue | Variable segun componente | CPU, GPU NVIDIA o Apple Silicon segun runtime |

Diferencias clave: este paquete es el unico que llega ya convertido y verificado para Apple Silicon y con los cuatro componentes coordinados; los originales requieren montar el pipeline, gestionar dependencias de PyTorch o NeMo y no aprovechan el Neural Engine. No se dispone de datos comparativos de WER frente a Whisper ni frente a otros sistemas ASR en ruso dentro de la informacion proporcionada, por lo que no se puede afirmar superioridad ni inferioridad de calidad frente a alternativas: el unico punto de comparacion publicado es el 7,5 % de WER de GigaAM v3 fp16 frente al 7,6 % de su propia version fp32.

## Limitaciones y advertencias

- Licencia mixta: cada componente mantiene la licencia de su autor. TitaNet Large es CC-BY-4.0 y exige atribucion a NVIDIA Corporation; Nemotron 3 Diarization usa OpenMDW, cuyos terminos deben revisarse antes de un uso comercial. No se puede asumir una licencia unica para todo el bundle.
- El componente de embeddings de hablante proviene de un modelo de verificacion en ingles (`speakerverification_en_titanet_large`), por lo que su comportamiento sobre voces rusas no esta documentado en la informacion disponible.
- Solo ruso en reconocimiento de voz: no hay soporte multilingue ni traduccion, y no se documenta el comportamiento con acentos, dialectos o audio con mucho ruido.
- Ventana estatica de 22 s en el encoder de GigaAM v3: el audio largo debe trocearse con mascara de padding, lo que introduce dependencia del troceado y posibles efectos de borde en los cortes.
- Riesgo de error de transcripcion inherente a un WER del 7,5 % en el audio de referencia, con 3.716 palabras. No hay datos sobre alucinaciones en silencios o ruido, ni evaluacion sobre un conjunto amplio: la verificacion publicada se limita a un unico audio y a comprobaciones de equivalencia numerica.
- Los pesos no se han ajustado, de modo que los sesgos y errores de los modelos originales se heredan sin correccion.
- El paquete no es autonomo: la mel y la cache de voces las calcula la propia aplicacion segun la model card, por lo que reproducir el pipeline fuera de GigaNotes exige reimplementar esa logica.
- Cero descargas y cero likes en el momento de la consulta, con fechas de creacion y actualizacion del 2 de octubre de 2026: no hay validacion independiente ni comunidad que haya auditado el bundle.
- No genera resumenes, respuestas ni texto libre, no soporta tool calling ni agentes y no incluye vision: cualquier funcionalidad de ese tipo necesita un modelo adicional.
- Al no publicarse datos de latencia ni de consumo, no se puede garantizar transcripcion en tiempo real en todos los modelos de Mac con Apple Silicon; el rendimiento dependera del chip y de la duracion del audio.

## Enlaces

- Repositorio del paquete: https://huggingface.co/kirillcustom/giganotes-models
- Modelo base de reconocimiento: https://huggingface.co/ai-sage/GigaAM-v3
- Repositorio de codigo de GigaAM (SaluteDevelopers): https://github.com/salute-developers/GigaAM
- Modelo base de diarizacion: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Modelo base de embeddings de hablante: https://huggingface.co/nvidia/speakerverification_en_titanet_large
- Modelo base de segmentacion: https://huggingface.co/pyannote/segmentation-3.0
- Build ONNX de sherpa-onnx utilizado para pyannote: https://github.com/k2-fsa/sherpa-onnx
- Licencias del bundle: LICENSE.md dentro del repositorio (referenciado como `license_link` en la model card)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; las referencias devueltas (congresos de IA, actas de IJCAI, NeurIPS y listados de publicaciones) no guardan relacion con este paquete de modelos.
