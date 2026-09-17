# devendradhakad/autodroid-nvidia-parakeet-tdt-0.6b-v3

## Resumen

autodroid-nvidia-parakeet-tdt-0.6b-v3 es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario devendradhakad, derivado del modelo Parakeet TDT 0.6b v3 de NVIDIA. Se distribuye con la libreria Transformers y el pipeline `automatic-speech-recognition`, y su arquitectura combina un codificador FastConformer con un decodificador TDT (Token-and-Duration Transducer), una variante de RNN-T que predice de forma conjunta el token y su duracion para acelerar la decodificacion.

El modelo esta orientado a transcripcion multilingue: declara soporte para 25 idiomas europeos (entre ellos espanol, ingles, frances, aleman, italiano, portugues, neerlandes, polaco, rumano, sueco, griego y ucraniano). Su tamano, del orden de 600 millones de parametros segun la nomenclatura del repositorio, lo situa en la gama media de los modelos ASR actuales y permite inferencia en GPU de consumo.

Su relevancia radica en dos factores: por un lado, cubre un espacio (ASR multilingue europeo con licencia CC-BY-4.0) donde las alternativas de pesos abiertos son escasas; por otro, el repositorio no presenta descargas ni "likes" y los resultados de benchmarks estan declarados por el autor sin verificacion (`verified: false`), por lo que debe evaluarse como un artefacto derivado sin garantias de mantenimiento ni validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador Conformer con submuestreo convolucional) + TDT (Token-and-Duration Transducer); etiquetas: Transducer, Transformer, TDT, FastConformer, Conformer |
| Parametros totales | No confirmado en la informacion; aproximadamente 0,6 mil millones segun la nomenclatura del modelo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR: procesa audio, no texto con ventana de contexto; duracion maxima de audio documentada: no disponible) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 25 idiomas europeos: aleman, bulgaro, checo, croata, danes, eslovaco, esloveno, espanol, estonio, finlandes, frances, griego, hungaro, ingles, italiano, leton, lituano, maltes, neerlandes, polaco, portugues, rumano, ruso, sueco y ucraniano |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (se declaran PyTorch, NeMo y compatibilidad con Transformers; no se especifica safetensors, GGUF ni `.nemo`) |
| Tarea principal | Reconocimiento automatico del habla (`automatic-speech-recognition`) |
| Autor del repositorio | devendradhakad (modelo derivado de NVIDIA Parakeet TDT 0.6b v3) |
| Fecha de creacion | 17 de septiembre de 2026 |
| Datasets declarados | `nvidia/Granary`, `nemo/asr-set-3.0` |

## Arquitectura y entrenamiento

La familia Parakeet de NVIDIA emplea un codificador FastConformer, una variante del Conformer que sustituye el submuestreo inicial por convoluciones separables en profundidad, reduciendo el coste computacional sobre secuencias de audio largas. Sobre ese codificador se monta un decodificador de tipo transductor. En la variante TDT (Token-and-Duration Transducer), el modelo predice simultaneamente el token de salida y su duracion, lo que permite avanzar varios fotogramas por paso de decodificacion y disminuir el numero de invocaciones al decodificador en comparacion con un RNN-T estandar. La informacion proporcionada no detalla el numero de capas, la dimension del modelo ni la configuracion exacta del decodificador.

En cuanto a los datos, el repositorio declara los conjuntos `nvidia/Granary` y `nemo/asr-set-3.0` como fuente, pero no se especifica el numero de horas, la composicion por idioma, el uso de aumento de datos ni si hubo etapas de ajuste fino supervisado (RLHF o DPO no aplican a un modelo ASR). Tampoco se documenta que cambios introduce este repositorio concreto respecto al modelo base de NVIDIA, ni si se trata de un reempaquetado, un ajuste fino o una conversion de formato. Las referencias bibliograficas citadas en las etiquetas del repositorio (arXiv) no vienen acompanadas de titulo en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto en 25 idiomas europeos, con un unico modelo multilingue.
- Procesamiento de audio en formato largo, segun el diseno habitual de la familia FastConformer-TDT (duracion maxima no documentada en la informacion disponible).
- Decodificacion eficiente basada en prediccion conjunta de token y duracion (TDT), que reduce el coste por fotograma frente a un transductor clasico.
- Integracion con el ecosistema Hugging Face mediante la libreria Transformers y el pipeline `automatic-speech-recognition`.
- Compatibilidad declarada con NeMo y con PyTorch.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada distinto de voz, diarizacion de hablantes, marcas de tiempo a nivel de palabra, puntuacion automatica ni capitalizacion. Se trata de un modelo especializado en ASR, no de un modelo generativo de proposito general.
- No se documentan capacidades de traduccion directa voz-a-texto ni de identificacion explicita del idioma detectado.

## Casos de uso

- Transcripcion de reuniones y generacion de actas: el modelo esta evaluado en AMI (WER 11.31 en el subconjunto IHM de reuniones), lo que lo hace util para diarizado de reuniones corporativas con vocabulario coloquial y solapamiento de turnos, siempre que se combine con un modulo externo de separacion de hablantes.
- Subtitulado y localizacion de contenido audiovisual en Europa: al cubrir 25 idiomas con licencia CC-BY-4.0, permite generar subtitulos en idiomas como polaco, checo o sueco sin depender de servicios propietarios, integrandose en pipelines de postproduccion.
- Analisis de llamadas de contact center: el resultado en Earnings-22 (WER 11.42) indica tolerancia razonable a audio telefonico espontaneo con vocabulario de dominio especifico, adecuado para auditar calidad, detectar motivos de llamada y generar resumenes posteriores con un LLM aparte.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de podcasts, grabaciones de reunion o archivos de medios para construir indices de texto buscables, aprovechando el bajo coste de decodificacion del TDT.
- Dictado profesional y documentacion clinica o legal: transcripcion de notas dictadas en espanol (WER 3.45 en FLEURS es_419) o aleman (5.04) para generar borradores que un revisor humano valida, reduciendo el tiempo de tecleo.
- Asistentes de voz y comandos embebidos: con alrededor de 600 millones de parametros, es desplegable en GPUs de borde (Jetson Orin) o en tarjetas de gama media para transcripcion local en tiempo real, sin enviar audio a la nube.
- Investigacion en ASR multilingue: la licencia permisiva con atribucion y la disponibilidad de pesos permiten usarlo como base para ajuste fino en idiomas europeos de bajos recursos, o como referencia en estudios comparativos de WER.
- Cumplimiento normativo y retencion de datos: al poder ejecutarse completamente on-premise, encaja en entornos donde el audio no puede salir de la infraestructura propia (sanidad, banca, sector publico).

## Benchmarks y rendimiento

Resultados declarados en el model-index del repositorio (no verificados, `verified: false`):

| Conjunto de evaluacion | Idioma | Metrica | Valor |
|---|---|---|---|
| LibriSpeech (config `other`, test) | Ingles | WER | 1,93 |
| LibriSpeech (config `other`, test) | Ingles | WER | 3,59 |
| TED-LIUM v3 (release1, test) | Ingles | WER | 2,75 |
| SPGI Speech (test) | Ingles | WER | 3,97 |
| Vox Populi (en, test) | Ingles | WER | 6,14 |
| GigaSpeech (test) | Ingles | WER | 9,59 |
| AMI (ihm, test) | Ingles | WER | 11,31 |
| Earnings-22 (test) | Ingles | WER | 11,42 |
| FLEURS (es_419, test) | Espanol | WER | 3,45 |
| FLEURS (en_us, test) | Ingles | WER | 4,85 |
| FLEURS (de_de, test) | Aleman | WER | 5,04 |
| FLEURS (fr_fr, test) | Frances | WER | 5,15 |
| FLEURS (cs_cz, test) | Checo | WER | 11,01 |
| FLEURS (bg_bg, test) | Bulgaro | WER | 12,64 |
| FLEURS (fi_fi, test) | Finlandes | WER | 13,21 |
| FLEURS (et_ee, test) | Estonio | WER | 17,73 |
| FLEURS (da_dk, test) | Danes | WER | 18,41 |
| FLEURS (el_gr, test) | Griego | WER | 20,70 |

Notas: LibriSpeech aparece con dos valores de WER (1,93 y 3,59) bajo la misma configuracion `other`; la informacion proporcionada no aclara a que subconjunto corresponde cada uno. La lista de FLEURS esta truncada en el material recibido (ultimo registro visible: `hr_hr`), por lo que los idiomas restantes soportados por el modelo no cuentan con cifra declarada en esta ficha.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 2,4 GB en FP32, 1,2-1,5 GB en FP16/BF16 y 0,6-0,8 GB en INT8, calculado a partir de un modelo de ~0,6 mil millones de parametros. No hay cifras oficiales de cuantizacion publicadas para este repositorio.
- VRAM total en inferencia: del orden de 2-4 GB en FP16 con lotes pequenos y audio corto; 4-8 GB con lotes grandes o audio de formato largo, al sumar activaciones y estados del decodificador.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA. Para produccion, T4, L4, A10G, A100 o H100; para desarrollo, RTX 3060 (12 GB), RTX 4070, RTX 4090.
- Compatibilidad con GPU de consumo: si. Cabe en tarjetas de 4-6 GB en precision reducida y con lotes pequenos; 8-12 GB ofrecen margen comodo para procesamiento por lotes.
- Despliegue: NeMo toolkit y Hugging Face Transformers (pipeline `automatic-speech-recognition`). Otros runtimes (vLLM, TGI, llama.cpp, Ollama) no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF (factor de tiempo real) ni de audio procesado por segundo.

## Comparativa con modelos similares

Solo la primera fila procede de la informacion proporcionada en esta busqueda; las caracteristicas de las filas restantes son datos ampliamente documentados de cada modelo, no verificados en esta consulta y sin cifras de WER comparables disponibles aqui.

| Modelo | Parametros | Idiomas | Licencia | Tarea | WER comparable |
|---|---|---|---|---|---|
| autodroid-nvidia-parakeet-tdt-0.6b-v3 (este) | ~0,6 mil millones | 25 idiomas europeos | CC-BY-4.0 | ASR transductor (TDT) | Ver tabla de benchmarks |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | ~0,6 mil millones | 25 idiomas europeos | CC-BY-4.0 | ASR transductor (TDT) | No disponible |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6 mil millones | Ingles | CC-BY-4.0 | ASR transductor (TDT) | No disponible |
| openai/whisper-large-v3 | ~1.550 millones | ~99 idiomas | MIT | ASR seq2seq | No disponible |

Diferencias estructurales relevantes: los modelos Parakeet usan decodificacion por transductor (no autorregresiva token a token con atencion cruzada completa) y fueron disenados para audio en ingles o europeo; Whisper emplea una arquitectura encoder-decoder seq2seq, cubre muchas mas lenguas y cuenta con una comunidad de tooling muy amplia. La comparacion de calidad real entre ellos no puede establecerse con los datos disponibles en esta ficha.

## Limitaciones y advertencias

- Cobertura linguistica limitada a 25 idiomas europeos: no soporta arabe, hindi, chino, japones, coreano ni lenguas africanas o americanas originarias.
- Rendimiento desigual entre idiomas: los WER declarados en FLEURS van de 3,45 (espanol) a 20,70 (griego), con valores altos tambien en danes (18,41) y estonio (17,73). En esos idiomas la transcripcion requiere revision humana.
- Benchmarks no verificados: todos los resultados del model-index estan marcados como `verified: false` y proceden del propio autor del repositorio.
- Repositorio derivado sin traccion: cero descargas y cero valoraciones en el momento de la consulta, sin documentacion sobre que modifica respecto al modelo base de NVIDIA, ni garantia de mantenimiento o actualizaciones.
- Sin informacion sobre el proceso de entrenamiento: se desconoce el volumen de datos, la composicion por idioma, el sesgo de dominio y si hubo ajuste fino especifico sobre el modelo original.
- Riesgo de alucinacion y de sustitucion de palabras en audio con ruido, solapamiento de voces, acentos no representados o vocabulario muy tecnico. Los WER de 9,59 en GigaSpeech y 11,42 en Earnings-22 reflejan ese margen de error en dominios dificiles.
- Sesgos previsibles por los datos de origen: los corpus de ASR multilingue suelen sobrerrepresentar determinados acentos, registros y variedades dialectales, y a infrarrepresentar habla con discapacidad, acentos regionales o codigo mezclado de idiomas.
- Ausencia de funciones auxiliares: no se documenta diarizacion, marcas de tiempo, puntuacion, capitalizacion ni deteccion de idioma; requieren modulos adicionales.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoria y a indicar si se han realizado modificaciones. No incluye garantias ni cesion de derechos de terceros sobre los datos de entrenamiento.
- No apto como sustituto de un LLM: no genera texto libre, no razona, no ejecuta herramientas y no procesa imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devendradhakad/autodroid-nvidia-parakeet-tdt-0.6b-v3
- Dataset declarado (NVIDIA Granary): https://huggingface.co/datasets/nvidia/Granary
- Referencias arXiv citadas en las etiquetas del repositorio (los titulos no se incluyen en la informacion proporcionada):
  - https://arxiv.org/abs/2509.14128
  - https://arxiv.org/abs/2505.13404
  - https://arxiv.org/abs/2305.05084
  - https://arxiv.org/abs/2304.06795
  - https://arxiv.org/abs/2410.01036
  - https://arxiv.org/abs/2406.00899
  - https://arxiv.org/abs/2205.12446
  - https://arxiv.org/abs/2012.03411
  - https://arxiv.org/abs/2007.10310
  - https://arxiv.org/abs/1510.08484
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a paginas de turismo sobre el Moulin Sorine de Santenay (Francia), sin relacion con el repositorio.
