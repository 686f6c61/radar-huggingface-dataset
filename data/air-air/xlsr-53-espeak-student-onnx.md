# air-air/xlsr-53-espeak-student-ONNX

## Resumen

xlsr-53-espeak-student-ONNX es un reconocedor de fonemas multilingue en formato ONNX, pensado para ejecutarse en el navegador mediante transformers.js. Lo publica el usuario air-air como destilacion de facebook/wav2vec2-xlsr-53-espeak-cv-ft: conserva 8 de las 24 capas transformer del modelo profesor (concretamente las capas 0, 3, 7, 10, 13, 16, 20 y 23), ademas del codificador de caracteristicas, la convolucion posicional y la cabeza CTC. El resultado pesa 77 MB frente a los 241 MB del modelo completo a la misma precision, y el autor afirma que es unas tres veces mas rapido.

El modelo no transcribe texto: emite, trama a trama (cada 20 ms), una distribucion sobre el vocabulario de 392 telefonemas espeak del modelo base, con `<pad>` (id 0) como blank de CTC. Se entreno por destilacion sobre las particiones de entrenamiento de FLEURS en diez idiomas (88 horas), sin necesidad de transcripciones, igualando la distribucion del profesor restringida a sus 16 fonemas mas probables en cada trama.

Su interes practico esta en el despliegue en el cliente: un reconocedor fonetico de tamano reducido, con licencia Apache 2.0, que cabe en una pestana del navegador y evita enviar audio a un servidor. Como contrapartida, la fidelidad respecto al profesor es del 67% de tramas coincidentes en el conjunto de desarrollo de FLEURS, y hereda las carencias del modelo base (entre ellas, la falta de ajuste fino en japones y coreano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC; transformer de 8 capas destilado de un xlsr-53 de 24 capas, mas codificador de caracteristicas convolucional, convolucion posicional y cabeza CTC |
| Parametros totales | no disponible (el autor no publica el recuento; el checkpoint cuantizado ocupa 77 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; procesa audio mono a 16 kHz y emite predicciones por trama de 20 ms |
| Tipos de cuantizacion | pesos matriciales a 4 bits con bloques de 32; pesos de convolucion a 8 bits con un DequantizeLinear delante de cada Conv; en transformers.js se carga con `dtype: 'q4'` |
| Idiomas soportados | de, es, fr, it, ja, ko, pl, pt, ru, sv (el modelo profesor no se ajusto en japones ni coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 0,1 GB), cuantizado a 4 bits |

## Arquitectura y entrenamiento

La arquitectura es un wav2vec2 clasico de reconocimiento fonetico con CTC, pero con el bloque transformer reducido de 24 a 8 capas. El estudiante se inicializo tomando las capas 0, 3, 7, 10, 13, 16, 20 y 23 del modelo facebook/wav2vec2-xlsr-53-espeak-cv-ft y despues se entreno todo excepto el codificador de caracteristicas, que quedo congelado. El vocabulario se mantiene intacto: 392 fonemas espeak, con el id 0 como blank de CTC.

El entrenamiento es una destilacion por fotograma sin transcripciones. Para cada trama de 20 ms, el estudiante aprende la distribucion del profesor sobre sus 16 fonemas mas probables (entropia cruzada contra el top-16 renormalizado). Los datos son las particiones de entrenamiento de FLEURS en aleman, espanol, frances, italiano, japones, coreano, polaco, portugues, ruso y sueco, 88 horas en total, complementadas con recortes cortos del mismo audio rodeados de 150 ms de silencio. Como aumento de datos se aplicaron ganancia aleatoria y ruido entre 10 y 40 dB por debajo de la senal, condiciones que el profesor no vio. Se uso AdamW con una tasa de aprendizaje maxima de 3e-5 y se conservo el checkpoint con menor perdida en el conjunto de desarrollo de FLEURS.

La exportacion a ONNX aplica cuantizacion por bloques a 4 bits en las matrices y 8 bits en las convoluciones. El resultado declarado es un fichero de 77 MB y una velocidad aproximada tres veces superior a la del modelo completo a la misma precision.

## Capacidades

- Reconocimiento de fonemas multilingue a nivel de trama sobre audio mono de 16 kHz, con salida de logits CTC sobre 392 simbolos espeak.
- Salida en notacion espeak, no en texto ortografico: no genera transcripciones, puntuacion ni mayusculas.
- Diez idiomas cubiertos por el entrenamiento (de, es, fr, it, ja, ko, pl, pt, ru, sv), con la salvedad de que japones y coreano se decodifican con el inventario fonetico de otras lenguas.
- Inferencia en el navegador via transformers.js (`@huggingface/transformers`) con `AutoFeatureExtractor` y `AutoModelForCTC`, y ejecucion en servidor con cualquier runtime compatible con ONNX.
- Aumento de robustez frente al profesor en condiciones de ganancia variable y ruido de fondo moderado (10-40 dB por debajo de la voz).
- Capacidad de servir como extractor de caracteristicas foneticas para etapas posteriores (busqueda fonetica, alineamiento, puntuacion de pronunciacion).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador acustico frame-level.
- No incorpora modo thinking, vision ni audio-video; el audio es la unica modalidad de entrada.

## Casos de uso

- Evaluacion de pronunciacion en aplicaciones de aprendizaje de idiomas: el modelo devuelve la secuencia de fonemas detectada, que puede compararse con la secuencia esperada obtenida de un conversor grafema-fonema para puntuar errores de articulacion sin salir del dispositivo.
- Busqueda fonetica en archivos de audio: indexar la salida de fonemas de horas de grabaciones permite buscar por sonido (no por transcripcion) nombres propios, toponimos o terminos tecnicos mal transcritos.
- Procesamiento de voz con privacidad por diseno en el navegador: al pesar 77 MB y ejecutarse con transformers.js y `dtype: 'q4'`, el audio del usuario no necesita abandonar el cliente, lo que simplifica el cumplimiento del RGPD en aplicaciones web.
- Preetiquetado en proyectos de documentacion linguistica: generar capas foneticas aproximadas sobre corpus de campo para que un linguista las corrija, reduciendo el trabajo manual en lenguas con ortografia no estandar.
- Control de calidad de datasets de voz: detectar tramas con habla frente a silencio o ruido, verificar coherencia fonetica entre idiomas declarados y localizar segmentos anomalos antes de entrenar otros modelos.
- Keyword spotting y activacion por voz en dispositivos de gama baja: al no requerir GPU y ser aproximadamente tres veces mas rapido que el modelo completo, encaja en kioscos, electrodomesticos o sistemas embebidos con CPU modesta.
- Investigacion en fonetica comparada: extraer distribuciones por trama (top-16 del profesor destiladas) para analizar confusiones entre pares de fonemas en habla leida de diez idiomas.
- Prototipado rapido de interfaces de voz en demos web: integracion directa en una pagina con el snippet de la model card, sin infraestructura de inferencia propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni WER sobre ls LibriSpeech o Common Voice) en la informacion disponible. El unico dato de evaluacion aportado por el autor es la coincidencia con el profesor:

| Metrica | Valor | Conjunto |
|---|---|---|
| Coincidencia del fonema mas probable con el modelo profesor (excluyendo blank) | 67% de las tramas | FLEURS dev (held-out) |
| Tamano del checkpoint | 77 MB | 4 bits, ONNX |
| Tamano del modelo profesor a la misma precision | 241 MB | 4 bits |
| Velocidad relativa | ~3x mas rapido que el modelo completo | no especificado por el autor |

No hay datos de WER de fonemas, precision/recall por idioma ni comparacion con otros reconocedores foneticos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la configuracion cuantizada de 4 bits; el checkpoint en disco son 77 MB y el pico de memoria lo dominan las activaciones de audio, no los pesos.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100, T4) acelera el proceso, pero el modelo esta disenado para CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en graficas integradas; tambien en CPU de portatil y en el runtime WASM del navegador.
- Opciones de despliegue: transformers.js en navegador (ruta oficial documentada), ONNX Runtime (CPU, CUDA, WebGPU) y servidores de inferencia que acepten ONNX. No hay ficheros GGUF publicados, por lo que llama.cpp y Ollama no son una via directa; vLLM y TGI estan orientados a modelos generativos y no aplican a esta cabeza CTC.
- Latencia y throughput: el autor solo indica que es aproximadamente tres veces mas rapido que el modelo completo a la misma precision; no se publican valores absolutos de latencia ni de RTF.
- Requisito de entrada: audio mono remuestreado a 16 kHz, como `Float32Array`, procesado por el `AutoFeatureExtractor` del repositorio.

## Comparativa con modelos similares

| Modelo | Capas transformer | Tamano | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| air-air/xlsr-53-espeak-student-ONNX | 8 (de 24, seleccionadas) | 77 MB (4 bits) | 10 (ja y ko sin ajuste en el profesor) | Apache 2.0 | ONNX 4/8 bits | Coincide con el profesor en el 67% de las tramas; ~3x mas rapido |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft (profesor) | 24 | 241 MB a la misma precision | 10 (ja y ko sin ajuste) | Apache 2.0 | safetensors / transformers | Referencia de calidad; mas pesado y lento |
| Otros reconocedores foneticos multilingues | no disponible | no disponible | no disponible | no disponible | no disponible | La busqueda web no aporto informacion verificable sobre alternativas comparables |

No se dispone de datos publicados de parametros totales, WER fonetico ni cobertura idiomatica de terceros que permitan una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El estudiante hereda los sesgos y errores del profesor: la destilacion imita la distribucion del modelo base, incluidas sus confusiones.
- Japones y coreano no estaban en el ajuste fino del modelo base, por lo que estas lenguas se decodifican con el inventario fonetico de otras lenguas y la salida no debe considerarse fiable.
- La fidelidad medida es del 67% de tramas coincidentes con el profesor en FLEURS dev; aproximadamente un tercio de las tramas difiere, y no hay evaluacion contra transcripciones foneticas humanas.
- Entrenado y validado sobre habla leida (FLEURS), mayoritariamente frases leidas; el comportamiento en habla espontanea, acentos marcados, dialectos o conversacion con solapamientos no esta documentado.
- La salida es en notacion espeak, no texto: para obtener transcripciones hace falta un conversor grafema-fonema y un mapeo adicional, con la perdida de informacion que ello implica.
- Riesgo de inserciones espurias de fonemas en silencios, musica o ruido no语音, inherente a la decodificacion CTC sin modelo de lenguaje; conviene aplicar umbrales de confianza y postproceso.
- La cuantizacion a 4 bits de matrices y 8 bits de convoluciones puede degradar la precision respecto a una version en coma flotante, que no se distribuye en este repositorio.
- Sinvalidacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha, y el autor no publica informe tecnico ni evaluacion independiente.
- Licencia Apache 2.0 permite uso comercial, pero FLEURS se distribuye bajo CC BY 4.0 (Conneau et al., 2022), por lo que la atribucion del corpus debe mantenerse si se redistribuye el modelo o se documenta su procedencia.
- No apto para tareas de generacion, razonamiento, agentes ni tool calling; usarlo fuera del ambito acustico-fonetico no tiene sentido tecnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/air-air/xlsr-53-espeak-student-ONNX
- Modelo base (profesor): https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Libreria de inferencia en navegador: https://www.npmjs.com/package/@huggingface/transformers (transformers.js)
- Referencia del corpus: Conneau et al., 2022, FLEURS (CC BY 4.0); no se ha localizado URL en la busqueda web realizada
- La busqueda web ejecutada no devolvio enlaces relevantes sobre este modelo (los resultados correspondian a servicios de viajes y a un grupo musical); no hay paper, blog ni demo adicionales que enlazar.
