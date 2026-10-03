# ron-jo/hubert-base-phoneme-en-onnx

## Resumen

`ron-jo/hubert-base-phoneme-en-onnx` es una conversion a ONNX del modelo `Peacockery/hubert-base-phoneme-en`, un fine-tune de HuBERT-base (95 millones de parametros) sobre LibriSpeech-960 para reconocimiento de fonemas en ARPAbet mediante CTC. El modelo original parte de `facebook/hubert-base-ls960`, el checkpoint auto-supervisado de Meta para representaciones de habla. La aportacion de este repositorio es exclusivamente de formato y optimizacion: exportacion del grafo a ONNX (opset 17) y cuantizacion dinamica int8, sin reentrenamiento.

El artefacto principal es `hubert_phoneme_int8.onnx`, un fichero de 116 MB con cuantizacion dinamica int8 aplicada unicamente a los pesos de las operaciones MatMul y Gemm. El extractor de caracteristicas convolucional se mantiene en fp32 de forma deliberada, para que el grafo pueda cargarse en runtimes ONNX moviles reducidos que no implementan el kernel `ConvInteger`. Esto lo convierte en una pieza pensada para inferencia offline en dispositivos con recursos limitados.

La relevancia de esta ficha es acotada pero clara: no es un modelo generativo ni conversacional, sino un modulo acustico de reconocimiento fonetico orientado a evaluacion de pronunciacion, alineamiento forzado y pipelines de analisis de habla. Su licencia Apache-2.0 y su reducido tamano facilitan la integracion en productos de ensenanza de ingles o herramientas de diagnostico de pronunciacion sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT-base (transformer encoder sobre extractor convolucional de caracteristicas), cabeza CTC para clasificacion de fotogramas |
| Parametros totales | 95 millones (HuBERT-base) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de audio; procesa fotogramas de 20 ms sobre la senal de entrada) |
| Tipos de cuantizacion | int8 dinamica (solo pesos MatMul/Gemm); extractor convolucional en fp32 |
| Idiomas soportados | ingles (entrenado sobre LibriSpeech-960) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), fichero `hubert_phoneme_int8.onnx` de 116 MB; el modelo original esta en PyTorch/safetensors |
| Entrada | muestras de audio float mono a 16 kHz, normalizadas a media cero y varianza unitaria |
| Salida | posteriores de fonema por fotograma; 39 tokens ARPAbet sin marca de acento mas `[UNK]`, `[PAD]`, `<s>`, `</s>`; blank CTC = `[PAD]` (id 40) |
| Huella sha256 | `af7a194be47549c8cfe0055220e52498b270773ad3d77483e0e0c9dd101a0dbb` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es HuBERT-base, una arquitectura de reconocimiento de habla auto-supervisada que combina un extractor convolucional de caracteristicas con un encoder transformer. El checkpoint base (`facebook/hubert-base-ls960`) fue preentrenado por Meta mediante prediccion de unidades acusticas ocultas, un objetivo tipo masked prediction sobre clustering de features de MFCC. Sobre esa base, el fine-tune `Peacockery/hubert-base-phoneme-en` se entreno con LibriSpeech-960 usando una cabeza de clasificacion temporal conexionista (CTC) para emitir etiquetas foneticas ARPAbet. No se documenta en la informacion disponible el numero exacto de tokens de audio, la composicion detallada del dataset mas alla de LibriSpeech-960, ni si se aplicaron etapas de RLHF o DPO (no aplicables a esta tarea).

La innovacion tecnica de este repositorio es de despliegue, no de modelado. La conversion sigue la ruta PyTorch -> ONNX (opset 17) -> cuantizacion dinamica int8 con onnxruntime. La decision de mantener el extractor convolucional en fp32 responde a una restriccion practica de compatibilidad con runtimes moviles que carecen del kernel `ConvInteger`. El resultado es un grafo que emite posteriores foneticas por fotograma de 20 ms y aplica decodificacion CTC con `[PAD]` (id 40) como simbolo blank.

## Capacidades

- Reconocimiento de fonemas en ingles: emite posteriores por fotograma sobre un conjunto de 39 tokens ARPAbet sin marca de acento, mas los simbolos especiales `[UNK]`, `[PAD]`, `<s>` y `</s>`.
- Evaluacion de pronunciacion: la secuencia de fonemas obtenida permite comparar la realizacion del hablante contra una referencia canonica.
- Alineamiento forzado: los posteriores por fotograma con fotogramas de 20 ms sirven para alinear transcripciones foneticas con la senal de audio.
- Inferencia offline: el grafo ONNX int8 se ejecuta sin conexion, sin dependencia de servicios remotos.
- Compatibilidad con runtimes reducidos: el extractor en fp32 evita la necesidad del kernel `ConvInteger`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento extendido.
- Soporte multilingue: no disponible; el modelo esta entrenado unicamente para ingles.

## Casos de uso

- Evaluacion de pronunciacion en apps de aprendizaje de ingles: el modelo convierte la senal del alumno en una secuencia de fonemas ARPAbet que se compara con la transcripcion esperada para puntuar la precision articulatoria.
- Alineamiento forzado para corpus foneticos: genera posteriores por fotograma de 20 ms que permiten asociar cada segmento de audio con su etiqueta fonetica en la construccion de datasets de habla.
- Feedback de pronunciacion por palabra: al disponer de salida a nivel de fotograma, permite localizar que segmento concreto de una palabra se desvia del objetivo canonico.
- Herramientas de analisis de acento para estudiantes: la secuencia fonetica detectada evidencia sustituciones y omisiones tipicas de hablantes no nativos.
- Preprocesado acustico en pipelines de sintesis de voz: los fonemas extraidos pueden alimentar sistemas de conversion de voz o de control prosodico que trabajen con ARPAbet.
- Despliegue en dispositivos moviles o embebidos: el fichero de 116 MB en int8 con extractor fp32 permite ejecucion offline en telefonos y hardware de bajos recursos.
- Investigacion en fonetica computacional: como extractor de etiquetas foneticas reproducible en entornos sin GPU.
- Indexado de audio por contenido fonetico: la transcripcion fonetica habilita busquedas por similitud de pronunciacion en archivos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio y los resultados de busqueda no incluyen cifras de PER (phoneme error rate), WER ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Modelo de 95 millones de parametros con fichero ONNX int8 de 116 MB: cabe holgadamente en CPU y en cualquier GPU consumer.
- VRAM estimada: inferior a 1 GB en la variante int8; en fp32 (modelo original) el peso ronda los 380 MB, tambien muy por debajo de cualquier GPU moderna.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo GTX 1650, RTX 3060, RTX 4090) ejecuta la inferencia sin cuello de botella de memoria. En servidor, una T4 o A100 estan sobredimensionadas para este modelo.
- Compatibilidad con GPU consumer: si, en todas las gamas actuales; tambien en telefonos moviles con runtime ONNX reducido.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), ONNX Runtime Mobile, ejecucion embebida. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: no disponible. La cuantizacion int8 dinamica sobre MatMul y Gemm sugiere menor latencia que la variante fp32 en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ron-jo/hubert-base-phoneme-en-onnx | 95 M | Reconocimiento de fonemas ARPAbet (CTC) | ONNX int8 (opset 17) | Apache-2.0 | HuggingFace (0 descargas) |
| Peacockery/hubert-base-phoneme-en | 95 M | Reconocimiento de fonemas ARPAbet (CTC) | PyTorch/safetensors | Apache-2.0 | HuggingFace |
| facebook/hubert-base-ls960 | 95 M | Representaciones de habla auto-supervisadas (no ASR fonetico directo) | PyTorch | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparados entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, tarea, formato y licencia.

## Limitaciones y advertencias

- Solo ingles: el modelo se entreno sobre LibriSpeech-960, un corpus de habla en ingles; no hay soporte multilingue declarado.
- Dominio acustico restringido: LibriSpeech es audio de lectura con condiciones de grabacion relativamente limpias; el rendimiento en audio ruidoso, conversacional o con acentos marcados no esta documentado.
- Sin datos de evaluacion: no se han publicado cifras de PER, lo que impide estimar la calidad real de la conversion int8 frente al modelo original.
- La cuantizacion puede degradar la precision: al ser cuantizacion dinamica int8 sin recalibracion documentada, es posible una perdida de exactitud en los posteriores respecto al modelo fp32; no se cuantifica esa diferencia.
- Repositorio con cero descargas y cero likes: sin validacion por parte de la comunidad y con historial de solo cinco commits, conviene verificar el artefacto contra el sha256 declarado antes de usarlo en produccion.
- La salida es fonetica, no textual: requiere un modulo adicional de decodificacion CTC y de conversion ARPAbet a texto o a una representacion comparable para cualquier caso de uso final.
- El blank CTC es `[PAD]` (id 40), un detalle de implementacion critico que debe respetarse al decodificar; tratarlo de otro modo invalida la salida.
- Licencia Apache-2.0 heredada del modelo fuente y de su base, lo que permite uso comercial, pero exige conservar los avisos de atribucion a Peacockery (fine-tune) y Meta (HuBERT base).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ron-jo/hubert-base-phoneme-en-onnx
- Ficheros del repositorio: https://huggingface.co/ron-jo/hubert-base-phoneme-en-onnx/tree/main
- Modelo base del fine-tune: https://huggingface.co/Peacockery/hubert-base-phoneme-en
- Modelo base original: https://huggingface.co/facebook/hubert-base-ls960
- ONNX Model Zoo: https://github.com/onnx/models
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
- Ejemplo de implementacion HuBERT en ONNX: https://github.com/AI-Unicamp/ExpressiveVC/blob/main/hubert/hubert_model_onnx.py
