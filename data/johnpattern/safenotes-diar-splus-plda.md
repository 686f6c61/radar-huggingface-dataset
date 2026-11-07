# johnpattern/safenotes-diar-splus-plda

## Resumen

`safenotes-diar-splus-plda` es un artefacto binario derivado de la pipeline de diarizacion de hablantes `pyannote/speaker-diarization-community-1`, publicado por el proyecto Safenotes (un cuaderno de reuniones local y on-device). No es un modelo neuronal completo ni un release oficial de pyannote: contiene unicamente las transformaciones PLDA / x-vector de la pipeline original, precalculadas y serializadas en un unico fichero (`vbx-plda/plda_vbx.bin`, 398.448 bytes) que el motor nativo de clustering VBx de Safenotes lee sin necesidad de Python en tiempo de ejecucion.

El problema que resuelve es de despliegue: la pipeline original de pyannote vive en un repositorio con acceso restringido (gated) en Hugging Face y requiere el stack de `pyannote.audio` en Python. Safenotes convierte las matrices PLDA a su propio formato `SNPLDA1` (float64 little-endian) para poder ejecutar el clustering de hablantes en hardware Intel dentro de su aplicacion, sin login en Hugging Face y sin enviar audio ni texto a la nube.

La relevancia es acotada y practica: sirve a quien quiera reutilizar exactamente las mismas transformaciones PLDA de pyannote community-1 dentro de un motor VBx nativo, o como referencia de como se resuelve el problema de autovalores generalizado del PLDA que emplea `pyannote.audio` 4.0.7. No incluye los modelos de segmentacion ni de embeddings del pipeline original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformaciones PLDA / x-vector (LDA + PLDA) para clustering VBx; no es una red neuronal completa |
| Parametros totales | no disponible (no aplica; artefacto de matrices) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa secuencias de embeddings x-vector, no texto) |
| Tipos de cuantizacion | no disponible; los arrays se serializan como float64 little-endian |
| Idiomas soportados | no disponible (independiente del idioma en teoria, pero no declarado) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | binario propietario `SNPLDA1` (`vbx-plda/plda_vbx.bin`) |

Dimensiones de las matrices serializadas: `mean1` (256), `lda` (256x128), `mean2` (128), `mu` (128), `tr` (128x128), `psi` (128).

## Arquitectura y entrenamiento

El fichero no entrena nada: es una conversion de formato. Se parte de `plda/plda.npz` y `plda/xvec_transform.npz` del repositorio upstream `pyannote/speaker-diarization-community-1` (revision `3533c8cf8e369892e6b79ff1bf80f7b0286a54ee`). El script `engine/tools/convert-plda.py` de Safenotes resuelve una vez el problema de autovalores generalizado del PLDA con `scipy.linalg.eigh`, replicando el setup de VBx de `pyannote.audio` 4.0.7, y escribe las matrices resultantes en el formato `SNPLDA1`. Segun el autor, las transformaciones son numericamente identicas a las originales; no hay reentrenamiento.

El PLDA subyacente fue entrenado por el grupo BUT Speech@FIT, con integracion de VBx en `pyannote.audio` atribuida a Jiangyu Han y Petr Palka. El metodo VBx (Bayesian HMM clustering of x-vector sequences) procede de Landini, Profant, Diez y Burget (Computer Speech & Language, 2022). La segmentacion y el modelo de embeddings de la pipeline original no se incluyen en este repositorio.

## Capacidades

- Proporciona las transformaciones LDA/PLDA necesarias para el clustering de hablantes mediante VBx sobre embeddings x-vector (en el caso de Safenotes, embeddings de WeSpeaker).
- Permite separar hablantes en una reunion tras la captura de audio, sin dependencia de Python en tiempo de ejecucion.
- Elimina la necesidad de un login en Hugging Face para el repositorio gated upstream, al distribuirse desde un repositorio publico con revision fijada y verificacion sha256 por fichero.
- Ejecucion completamente local: ni el audio ni el texto salen del equipo del usuario.
- No realiza generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni razonamiento multi-paso.
- No incluye capacidades multilingues declaradas ni modo de pensamiento.

## Casos de uso

- Diarizacion de reuniones on-device: integrar el binario en un motor VBx nativo (como hace Safenotes) para etiquetar quien habla en cada segmento de una grabacion, sin enviar audio a servidores externos.
- Sustitucion del stack Python de pyannote en produccion: evita empaquetar `pyannote.audio` y sus dependencias cuando solo se necesita la fase de clustering PLDA.
- Despliegue en hardware Intel sin GPU: al ser un artefacto de matrices pequeno (398 KB) y sin runtime Python, encaja en aplicaciones de escritorio y entornos con recursos limitados.
- Auditoria y verificacion de integridad: el repositorio publica el sha256 de cada fichero, lo que permite validar la cadena de suministro antes de usarlo en un pipeline.
- Referencia de implementacion: util para reproducir el calculo del autovalor generalizado del PLDA tal como lo hace `pyannote.audio` 4.0.7 en su setup de VBx.
- Pipeline de transcripcion con atribucion de hablante: combinado con un ASR externo, permite generar transcripciones anotadas por interlocutor en herramientas de notas de reunion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un fichero de 398.448 bytes de matrices float64, sin inferencia neuronal propia.
- GPU recomendadas: no aplica al artefacto; el autor indica que el objetivo es ejecucion en hardware Intel mediante el clustering VBx nativo.
- Compatibilidad con GPU de consumo: no aplica a este fichero (la carga computacional real recae en los modelos de segmentacion y embeddings, no incluidos aqui).
- Opciones de despliegue: motor VBx nativo de Safenotes; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `johnpattern/safenotes-diar-splus-plda` | Transformaciones PLDA serializadas para VBx | no aplica (matrices) | no aplica | CC-BY-4.0 | Publico en HF, 0 descargas |
| `pyannote/speaker-diarization-community-1` | Pipeline completa de diarizacion (segmentacion + embeddings + PLDA) | no disponible | no aplica | CC-BY-4.0 (segun metadatos de la model card) | Gated en HF, requiere login |
| `pyannote/speaker-diarization-3.1` | Pipeline completa de diarizacion | no disponible | no aplica | no disponible en la informacion proporcionada | Gated en HF |

La comparacion directa no es equivalente: el artefacto de Safenotes solo cubre la fase PLDA, mientras que las pipelines de pyannote incluyen segmentacion y embeddings. Para una sustitucion funcional completa haria falta ademas un modelo de segmentacion y uno de embeddings.

## Limitaciones y advertencias

- No es un release oficial de pyannote; los autores originales no lo respaldan, segun indica el propio autor.
- Solo contiene la fase PLDA: sin los modelos de segmentacion y embeddings upstream no produce diarizacion por si mismo.
- Formato binario propietario `SNPLDA1`: no es portable a otros stacks sin escribir un lector compatible.
- Sin garantias de ningun tipo ("as is"), incluida la adecuacion a un proposito concreto y la exactitud de la salida.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa ni comunidad que reporte incidencias.
- No se declaran idiomas soportados; el comportamiento multilingue no esta verificado en esta ficha.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es obligatorio conservar la atribucion a pyannote, a BUT Speech@FIT y a los autores de VBx.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el clustering puede confundir hablantes en solapamientos, ruido o voces similares; no se aportan metricas DER en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnpattern/safenotes-diar-splus-plda
- Modelo base: https://huggingface.co/pyannote/speaker-diarization-community-1
- Revision upstream citada: https://huggingface.co/pyannote/speaker-diarization-community-1/tree/3533c8cf8e369892e6b79ff1bf80f7b0286a54ee
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Grupo BUT Speech@FIT: https://speech.fit.vut.cz/
- Paper de VBx: F. Landini, J. Profant, M. Diez, L. Burget, "Bayesian HMM clustering of x-vector sequences (VBx) in speaker diarization", Computer Speech & Language, 2022 (no se proporciona URL directa en la informacion disponible)
