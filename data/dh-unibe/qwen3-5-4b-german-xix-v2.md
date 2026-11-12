# dh-unibe/qwen3.5-4b-german-xix-v2

## Resumen

qwen3.5-4b-german-xix-v2 es un adaptador LoRA (PEFT) para reconocimiento de texto manuscrito (HTR) sobre documentos historicos en aleman del siglo XIX, desarrollado por el grupo dh-unibe (Universidad de Berna). Se construye sobre el modelo base Qwen/Qwen3.5-4B y se distribuye como adaptador, no como pesos completos, con un tamano de repositorio de 0,4 GB. El modelo resuelve la transcripcion linea a linea de actas parlamentarias y protocolos suizos decimononicos, incluyendo escritura Kurrent.

La relevancia del modelo es doble: por un lado, aplica un modelo de vision-lenguaje moderno a un dominio historico especializado; por otro, su model card es inusualmente honesta sobre el alcance real de sus metricas, advirtiendo que la evaluacion mezcla validacion in-domain con proyectos totalmente retenidos. Publica un CER del 4,78 % y un WER del 18,19 % sobre 200 muestras y 6772 caracteres, medidos en su propio split de validacion.

La limitacion operativa mas importante es la granularidad de entrada: el modelo fue entrenado con recortes de linea (262 144 pixeles) y debe recibir una linea por llamada. Alimentado con paginas completas devuelve fragmentos degradados, como documenta el propio autor con mediciones comparativas frente a modelos hermanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; el modelo base es un vision-lenguaje transformer, arquitectura detallada no disponible |
| Parametros totales | No disponible (adaptador; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el autor menciona un techo de generacion de 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Aleman (documentos historicos del siglo XIX); lista formal de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,4 GB |
| Pipeline | image-to-text |
| Libreria | peft |
| Granularidad de entrada | Linea (recorte de linea, 262 144 pixeles) |
| Descargas | 36 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (LoRA) entrenado sobre Qwen/Qwen3.5-4B, un modelo base de tipo vision-lenguaje. Los pesos publicados corresponden al mejor checkpoint de validacion del run, no a la ultima epoca. El entrenamiento se realizo con el servicio `serving-atr-inference` del autor. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de transcripcion supervisada, lo esperable es entrenamiento supervisado sobre pares imagen-texto, pero esto no se confirma en la model card.

Los datos de entrenamiento provienen de cuatro datasets de dh-unibe: `image-text_zh-regierungsratsprotokolle` (protocolos del Consejo de Gobierno de Zurich, con tope de 20 000 paginas), `image-text_parlamentsdienste-protokolle` (protocolos de servicios parlamentarios, 138 paginas), `image-text_nr-sr-vereinigte-bundesversammlung-xix` (actas del Consejo Nacional y del Consejo de los Estados de 1848, 52 paginas) y `image-text_kurrent-xix` (corpus Kurrent del siglo XIX, con 25 proyectos de entrenamiento). La innovacion tecnica destacable no esta en la arquitectura sino en la metodologia de particion: los tres primeros datasets aportan una particion sembrada a nivel de pagina de sus propios proyectos de entrenamiento, mientras que `kurrent-xix` retiene proyectos completos para evaluacion, lo que permite medir el rendimiento en manos no vistas.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) linea a linea sobre recortes de imagen.
- Transcripcion de escritura historica alemana del siglo XIX, incluida la escritura Kurrent.
- Salida image-to-text: dada una imagen de linea, devuelve la transcripcion textual.
- Manejo de documentos administrativos y parlamentarios historicos (actas, protocolos, sesiones).
- Integracion con vLLM segun los tags del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras modalidades (audio, video) en la informacion disponible.
- Capacidad multilingue limitada al aleman historico segun los datos de entrenamiento; no se declara soporte de otros idiomas.

## Casos de uso

- Digitalizacion masiva de actas parlamentarias suizas del siglo XIX: segmentando cada pagina en lineas y enviando un recorte por llamada, el modelo transcribe las actas del Consejo Nacional y del Consejo de los Estados de 1848 con un CER del 4,78 % en su dominio de validacion.
- Proyectos de humanidades digitales sobre protocolos del Consejo de Gobierno de Zurich: el modelo fue entrenado especificamente sobre este corpus y es adecuado para transcribir series documentales completas de forma asistida, con revision humana posterior.
- Investigacion sobre escritura Kurrent: al haber retenido proyectos completos de `kurrent-xix` para evaluacion, el modelo ofrece cierta capacidad de generalizacion a manos no vistas dentro de este estilo caligrafico, aunque el autor advierte que la metrica publicada es mayoritariamente in-domain.
- Enriquecimiento de catalogos archivisticos: transcripcion de lineas sueltas de correspondencia y documentos sueltos para generar indices de busqueda full-text sobre fondos hasta ahora solo catalogados a nivel de carpeta.
- Pipeline de HTR con post-procesado: el modelo puede actuar como componente de transcripcion dentro de una cadena que incluya segmentacion de lineas, correccion ortografica y validacion contra un lexico historico, aprovechando su formato PEFT para cargarse sobre el base Qwen3.5-4B en vLLM.
- Comparacion metodologica de modelos HTR: sirve como referencia para evaluar el efecto de la granularidad de entrada (linea frente a pagina) frente a modelos hermanos como `qwen3vl-german-xix-v2` y `trocr-kurrent`, tal como hace el propio autor en su documentacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER | 4,78 % |
| WER | 18,19 % |
| Muestras evaluadas | 200 |
| Caracteres evaluados | 6772 |
| Errores de caracter | 324 |

El autor advierte que esta medicion corresponde al split de validacion propio del run (particion a nivel de pagina, `partition=0.9`, `seed=42`), no a un benchmark compartido, y que mezcla dos regimenes: lineas de proyectos retenidos de `kurrent-xix` (manos no vistas, test mas estricto) y lineas de paginas no vistas de proyectos en los que el modelo si entreno (test mas facil). La cifra debe leerse como mayoritariamente in-domain.

Mediciones complementarias del autor sobre 27 paginas de la correspondencia de Lassberg (corpus sin ground truth, por tanto descriptivas y no CER): 335 caracteres por pagina frente a 844 de `dh-unibe/trocr-kurrent` en las mismas paginas, con lecturas como "1841", "den 14. April 1849." y una pagina que degenero en "1000000000…" durante todo el techo de 4096 tokens. Los modelos hermanos evaluados contra ground truth muestran el mismo patron: `qwen3vl-german-xix-v2` lee paginas completas con CER 0,98 (lineas 0,052) y `qwen3vl-medieval-german-v3` con CER 1,00 (lineas 0,111).

## Requisitos de hardware

- El adaptador pesa 0,4 GB, pero requiere cargar el modelo base Qwen/Qwen3.5-4B (4B parametros) para inferencia; el consumo de VRAM vendra dominado por el base.
- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa para un modelo de 4B, la inferencia en bf16 requiere del orden de 8-10 GB y en cuantizacion de 4 bits alrededor de 3-4 GB, pero estos valores no los publica el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano del base, cabria en GPUs consumer con suficiente VRAM (gama RTX 3090/4090 y superiores) y en GPUs de datacenter (A100, H100) para despliegues por lotes.
- Despliegue: el tag `vllm` indica soporte previsto para vLLM; al ser PEFT, tambien puede cargarse con las utilidades de Hugging Face Transformers y PEFT. No se documentan opciones para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor menciona un techo de generacion de 4096 tokens, relevante para dimensionar el coste por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dh-unibe/qwen3.5-4b-german-xix-v2 | Base 4B + adaptador LoRA | No disponible | 4,78 % (linea, mixto in-domain) | MIT | Hugging Face, PEFT |
| dh-unibe/qwen3vl-german-xix-v2 | No disponible | No disponible | 0,98 pagina / 0,052 linea | No disponible | Hugging Face |
| dh-unibe/qwen3vl-medieval-german-v3 | No disponible | No disponible | 1,00 pagina / 0,111 linea | No disponible | Hugging Face |
| dh-unibe/trocr-kurrent | No disponible | No disponible | No disponible (844 caracteres/pagina en Lassberg) | No disponible | Hugging Face |

La comparacion directa es dificil porque las metricas de los modelos hermanos citados por el autor se refieren a paginas completas y a otros corpus. El dato mas informativo es la brecha de granularidad: los modelos qwen3vl leen paginas enteras con CER cercano a 1, mientras que este adaptador, orientado a lineas, rinde mejor con recortes individuales y se degrada severamente con paginas completas.

## Limitaciones y advertencias

- Granularidad estricta: entrenado con recortes de linea; alimentado con paginas completas devuelve fragmentos o degenera en repeticiones, como documenta el autor.
- La metrica publicada (CER 4,78 %) es mayoritariamente in-domain y no equivale a un benchmark de manos no vistas; el propio autor recomienda calcular la cifra estricta sobre los proyectos retenidos de `kurrent-xix`.
- El modelo esta especializado en aleman historico del siglo XIX y en escritura Kurrent; no se declara soporte de otros idiomas ni de escritura contemporanea.
- Riesgo de alucinacion y degeneracion en generaciones largas, con un caso documentado de salida repetitiva hasta el limite de 4096 tokens.
- Sesgos: no documentados por el autor; al entrenarse sobre corpus administrativos y parlamentarios suizos, puede reflejar sesgos de ese corpus y de sus transcriptores.
- Licencia MIT, que permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B tiene su propia licencia que debe verificarse por separado antes de un despliegue comercial.
- Solo 36 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin evidencia de uso en produccion por terceros.
- Para uso en produccion se recomienda segmentar la pagina en lineas, aplicar post-procesado y validacion humana, y no confiar en la salida directa sobre paginas completas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dh-unibe/qwen3.5-4b-german-xix-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset protocolos del Consejo de Gobierno de Zurich: https://huggingface.co/datasets/dh-unibe/image-text_zh-regierungsratsprotokolle
- Dataset protocolos de servicios parlamentarios: https://huggingface.co/datasets/dh-unibe/image-text_parlamentsdienste-protokolle
- Dataset actas del Consejo Nacional y del Consejo de los Estados: https://huggingface.co/datasets/dh-unibe/image-text_nr-sr-vereinigte-bundesversammlung-xix
- Dataset Kurrent siglo XIX: https://huggingface.co/datasets/dh-unibe/image-text_kurrent-xix
- Servicio de entrenamiento e inferencia: https://github.com/thodel/serving-atr-inference
- Detalle sobre granularidad de entrada: https://github.com/thodel/serving-atr-inference/issues/165
- Modelo hermano qwen3vl-german-xix-v2: https://huggingface.co/dh-unibe/qwen3vl-german-xix-v2
- Modelo hermano qwen3vl-medieval-german-v3: https://huggingface.co/dh-unibe/qwen3vl-medieval-german-v3
- Modelo hermano trocr-kurrent: https://huggingface.co/dh-unibe/trocr-kurrent
