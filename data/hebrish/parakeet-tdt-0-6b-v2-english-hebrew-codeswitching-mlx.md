# Hebrish/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-mlx

## Resumen

Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-mlx es una conversion al formato MLX del modelo de reconocimiento automatico del habla (ASR) `danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching`, publicado por el usuario Hebrish. Se trata de un fine-tune sobre la arquitectura Parakeet TDT (Token-and-Duration Transducer) en su variante de 0,6B parametros, especializado en transcripcion de audio con alternancia de codigo (code-switching) entre hebreo e ingles, un fenomeno muy frecuente en el habla real de comunidades bilingues y que los sistemas ASR monoingles suelen degradar.

El modelo resuelve un problema concreto: la mayoria de ASR disponibles estan optimizados para un unico idioma, de modo que cuando el hablante cambia de hebreo a ingles dentro de la misma frase se producen sustituciones, omisiones o transliteraciones erroneas. Este checkpoint esta entrenado explicitamente para mantener ambos idiomas en la misma salida. Con 617.869.958 parametros (datos reales de safetensors), un repo de 2,5 GB y licencia CC-BY-4.0, es lo bastante pequeno para inferencia local.

Su relevancia actual es doble: por un lado cubre un par de idiomas poco atendido (hebreo-ingles); por otro, la version MLX permite ejecutar la inferencia en Apple Silicon sin GPU dedicada, lo que facilita prototipado y despliegue en portatiles Mac. El acceso esta restringido (gated) y el modelo acumula muy pocas descargas (19) y cero likes en el momento de la consulta, por lo que debe considerarse un artefacto poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), segun la denominacion del modelo base; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 617.869.958 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; la ventana se mide en duracion de audio, no en tokens) |
| Tipos de cuantizacion | no disponible; el repo contiene safetensors, no se listan variantes cuantizadas (4-bit/8-bit) |
| Idiomas soportados | ingles (en), hebreo (he), con soporte de alternancia de codigo entre ambos |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es Parakeet TDT, un transductor (transducer) con decodificacion conjunta de tokens y duraciones, la misma familia que el modelo base `Parakeet-TDT-0.6B-v2` de 0,6B parametros sobre el que se construye este fine-tune. Los transductores combinan un encoder acustico con un predictor y una red de union, y en la variante TDT el modelo predice simultaneamente el token y su duracion, lo que permite emitir varios fotogramas por paso de decodificacion y reduce el coste de inferencia frente a transductores clasicos. No se dispone en la informacion proporcionada de detalles sobre numero de capas, dimension del encoder, tipo de atencion ni estrategia de tokenizacion.

Respecto al entrenamiento, solo consta que se trata de un fine-tune del checkpoint `danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching`, orientado a datos bilingues hebreo-ingles con alternancia de codigo. No hay informacion disponible sobre volumen de horas de audio, composicion del dataset, uso de aumentacion de datos, ni sobre si se aplico algun ajuste posterior tipo RLHF (poco habitual en ASR). Tampoco se documenta la receta de conversion a MLX: no se indica si los pesos se convirtieron en precision completa (fp16/bf16) o con cuantizacion, ni que herramienta (`mlx-lm`, `mlx-examples` u otra) se uso.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) para ingles y hebreo.
- Manejo de alternancia de codigo hebreo-ingles dentro de una misma emision, que es el objetivo declarado del fine-tune.
- Salida de transcripcion con marcas temporales a nivel de token, derivadas del mecanismo TDT de prediccion de duraciones (comportamiento propio de la arquitectura; no verificado en este checkpoint concreto).
- Inferencia en Apple Silicon mediante la libreria MLX.
- No se documenta soporte de tool calling ni de function calling (no aplica a un modelo ASR).
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking", vision ni audio-vision; es un modelo unimodal de audio.
- No se documenta puntuacion, diarizacion de hablantes ni deteccion de idioma explicita.

## Casos de uso

- Transcripcion de reuniones bilingues: en equipos israelies que trabajan en hebreo e ingles, el modelo puede generar el acta automatica de una reunion donde los participantes alternan idiomas, evitando el paso manual de segmentar el audio por idioma antes de transcribir.
- Subtitulado de contenido audiovisual: para plataformas que distribuyen podcasts, clases o videos dirigidos a audiencia israeli, el modelo produce subtitulos en una sola pasada sobre material con code-switching, lo que simplifica el pipeline frente a encadenar dos ASR monoingles con deteccion de idioma previa.
- Analisis de llamadas en centros de contacto: transcripcion de conversaciones de soporte donde el agente habla hebreo y el cliente intercala terminos tecnicos en ingles, para posterior analisis de calidad, busqueda de texto completo y extraccion de motivos de contacto.
- Prototipado local en Mac: gracias al formato MLX, un desarrollador puede validar la calidad de transcripcion en un MacBook con chip M-series antes de comprometerse con infraestructura GPU, sin necesidad de CUDA.
- Investigacion linguistica sobre code-switching: generacion de corpus transcritos y alineados temporalmente para estudiar patrones de alternancia hebreo-ingles, frecuencias de prestamos lexicos y cambios de idioma intraoracional.
- Etiquetado de datos de entrenamiento: uso del modelo para pre-anotar grandes volumenes de audio bilingue y reducir el coste de anotacion humana, con revision posterior de los segmentos de baja confianza.
- Accesibilidad: subtitulado en tiempo casi real de clases o webinars en hebreo con terminologia tecnica en ingles para estudiantes con discapacidad auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada no incluye cifras de WER (word error rate) sobre conjuntos como FLEURS, Common Voice, VoxPopuli ni sobre corpus especificos de code-switching hebreo-ingles, ni comparaciones con el modelo base o con alternativas. Tampoco se dispone de mediciones de latencia, RTF (real-time factor) ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: con 617,9M parametros, los pesos en fp16 ocupan aproximadamente 1,24 GB; en 8 bits, unos 0,62 GB; en 4 bits, unos 0,31 GB. A ello hay que sumar el estado del encoder y las activaciones, no cuantificadas en la informacion disponible. El repo completo ocupa 2,5 GB.
- GPU recomendadas: al ser un modelo MLX, el backend objetivo es Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante memoria unificada. No se proporcionan pesos para CUDA; para A100, H100 o RTX 4090 habria que convertir el modelo a otro runtime (por ejemplo ONNX o NeMo), conversion no documentada.
- Cabe en GPU de consumo: si, en cualquier Mac con chip M-series; el modelo es de 0,6B y el peso en fp16 ronda 1,2 GB, por lo que incluso equipos con 8 GB de memoria unificada deberian poder cargarlo.
- Opciones de despliegue: MLX es la unica via documentada por el repo. No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, y ninguno de ellos soporta de forma nativa modelos transducer de ASR como este.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de RTF ni de velocidad de transcripcion en ningun chip concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-mlx (este modelo) | 617,9M | en, he con code-switching | no disponible | CC-BY-4.0 | safetensors MLX, acceso gated |
| danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching (modelo base) | no disponible en esta busqueda | en, he | no disponible | no disponible | safetensors, no verificado |
| Parakeet-TDT-0.6B-v2 (checkpoint original de la familia) | ~0,6B segun denominacion | ingles | no disponible | no disponible | no verificado en esta busqueda |
| Alternativas ASR multilingues tipo Whisper | no disponible en esta busqueda | multilingue | no disponible | no disponible | no verificado |

No se dispone de datos verificados de benchmarks ni de especificaciones de los modelos comparables dentro de la informacion proporcionada, por lo que la comparativa se limita a la denominacion y al recuento de parametros del presente checkpoint. Cualquier comparacion de WER entre este fine-tune y alternativas requeriria una evaluacion propia sobre un corpus hebreo-ingles con code-switching.

## Limitaciones y advertencias

- Artefacto con validacion practicamente nula: 19 descargas y 0 likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que anade friccion a pipelines automatizados y a la reproducibilidad.
- Dependencia de MLX: solo se distribuyen pesos en formato MLX, lo que excluye de facto el despliegue en GPUs NVIDIA o AMD sin una conversion adicional no documentada.
- Riesgo de error en la transcripcion: como todo ASR, puede producir sustituciones, omisiones y transliteraciones, especialmente en nombres propios, siglas y terminologia tecnica dentro de segmentos de code-switching.
- Sesgos desconocidos: no se documenta la composicion del corpus de entrenamiento, por lo que se desconoce el sesgo respecto a acentos (hebreo mizrahi, ashkenazi, arabe-israeli), genero, edad o calidad de grabacion.
- Cobertura limitada a dos idiomas: no se debe esperar buen comportamiento en un tercer idioma presente en el audio; el modelo no declara deteccion de idioma.
- Sin funcionalidades de produccion documentadas: no consta diarizacion, puntuacion automatica, normalizacion de texto ni filtrado de ruido.
- Licencia CC-BY-4.0: permite uso comercial y obras derivadas siempre que se atribuya la autoria y se indique si se han introducido cambios; no incluye garantias. Conviene verificar ademas la licencia del modelo base y del checkpoint original de Parakeet, no confirmada en la informacion disponible.
- Ausencia de cifras de rendimiento: sin WER ni RTF publicados, cualquier decision de adopcion en produccion deberia apoyarse en una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching-mlx
- Modelo base (fine-tune de origen): https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching
- Repositorio del autor en HuggingFace: https://huggingface.co/Hebrish
- Libreria MLX (Apple): no se han encontrado enlaces en la busqueda web realizada
- Papers, blogs o demos adicionales: no se han encontrado enlaces relevantes en la busqueda web realizada (los resultados devueltos no guardaban relacion con el modelo)
