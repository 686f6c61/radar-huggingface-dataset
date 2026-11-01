# FluidInference/campplus-coreml

## Resumen

CAM++ CoreML es una conversión al formato CoreML del modelo de embeddings de hablante CAM++ desarrollado originalmente por FunASR (ModelScope/Alibaba). Se trata de un modelo compacto de aproximadamente 7,2 millones de parámetros cuya función no es generar texto, sino producir un vector de 192 dimensiones que representa la identidad vocal de un hablante a partir de una señal de audio. Este embedding se emplea después con similitud coseno para tareas de verificación de hablante (¿son la misma persona?) y diarización (¿quién habla en cada momento?).

La relevancia de esta versión concreta reside en su empaquetado para Apple Silicon: los dos submodelos (preprocesador de forma de onda a filtros Mel y extractor de embeddings) están compilados como `.mlmodelc` para ejecutarse en CPU y, opcionalmente, en la GPU integrada, con la posibilidad de aprovechar el Apple Neural Engine. Esto permite hacer verificación y diarización de hablantes completamente en dispositivo, sin enviar audio a la nube, algo crítico para aplicaciones de privacidad en macOS e iOS.

El modelo está pensado para audio en mandarín (zh) a 16 kHz y se distribuye bajo la licencia del proyecto upstream FunASR. La versión v2 corrige problemas de la v1 relacionados con la ventana de análisis, el floor logarítmico y la precisión numérica, alcanzando paridad prácticamente exacta con la implementación de referencia en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (red de embeddings de hablante basada en TDNN con atención por canales, conversión CoreML) |
| Parametros totales | ~7,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio por segmento (evaluado en segmentos de 3–8 s y 0,35–60 s) |
| Tipos de cuantizacion | FP32 (v2, ambos submodelos); FP16 en la v1 del extractor |
| Idiomas soportados | zh (mandarín) |
| Licencia | campplus-upstream (licencia del proyecto FunASR) |
| Formato de pesos | CoreML (`.mlmodelc`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

CAM++ es una red neuronal para extracción de embeddings de hablante que combina capas tipo TDNN con mecanismos de atención por canales y pooling estadístico sobre tramas. El pipeline CoreML se divide en dos etapas: un preprocesador que convierte la forma de onda en filtros Mel de 80 dimensiones estilo Kaldi (ventana de Povey, floor logarítmico tras el banco de filtros Mel) y un extractor que transforma esos filtros en un embedding de 192 dimensiones. La normalización de la media por banda Mel se realiza en el host, replicando el comportamiento de 3D-Speaker y FunASR.

El entrenamiento original procede de FunASR y su receta de 3D-Speaker; esta versión es únicamente una conversión de formato, sin reentrenamiento. La v2 corrige defectos de la v1: usa FP32 en lugar de FP16 en las convoluciones pointwise (la v1 generaba embeddings incoherentes en ciertas duraciones, por ejemplo entre 17,9 y 20,4 s), aplica el floor logarítmico después del banco de filtros Mel y promedia cada cola de pooling sobre sus propias tramas en lugar de dividir por 100. El resultado es una similitud coseno de 1,0000 frente a la implementación de referencia en PyTorch para 357 duraciones entre 0,35 y 60 s.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio de 16 kHz.
- Verificación de hablante mediante similitud coseno entre embeddings.
- Diarización de hablantes mediante clustering de embeddings (por ejemplo, agrupamiento aglomerativo sobre vectores L2-normalizados).
- Procesamiento completamente en dispositivo en Apple Silicon (CPU, GPU integrada y potencial uso del Neural Engine).
- Preprocesamiento de audio integrado (forma de onda a filtros Mel de 80 bandas estilo Kaldi).
- No realiza generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe limitada al mandarín según la model card.
- No incluye modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica de voz en aplicaciones macOS/iOS: el modelo genera un embedding de 192 dimensiones que se compara por similitud coseno con el vector de referencia del usuario, todo en dispositivo y sin exponer el audio a servidores externos.
- Diarización de reuniones y transcripciones: segmentando el audio y agrupando los embeddings con clustering se puede etiquetar quién habla en cada tramo, útil en herramientas de notas de reunión con requisitos de privacidad.
- Transcripción médica o legal con atribución de hablante: en entornos donde el audio no puede salir del dispositivo, CAM++ CoreML permite separar voces antes de pasar el audio a un motor ASR local.
- Indexación y búsqueda por voz en archivos de audio: generando embeddings por segmento se pueden construir índices vectoriales para localizar intervenciones de un hablante concreto en grandes volúmenes de grabaciones.
- Control de acceso por voz en aplicaciones de escritorio: verificación rápida con EER bajo (0,48 % en AISHELL-1 y 2,85 % en AMI dentro de reunión) sobre segmentos cortos de 3 a 8 segundos.
- Análisis forense de audio y compliance: comparación de muestras de voz para detectar suplantaciones o verificar identidades en investigaciones internas, con la ventaja de que el procesamiento es local.
- Integración en pipelines de transcripción con ASR local: el embedding de hablante se puede combinar con salidas de motores ASR que corren en el mismo dispositivo para producir transcripciones con etiquetas de hablante.

## Benchmarks y rendimiento

Verificación de hablante en AMI Mix-Headset (413 segmentos de un solo hablante, 3–8 s, 16 participantes), puntuación coseno:

| Metrica | v1 + media en host | v2 | PyTorch 3D-Speaker CAMPPlus |
|---|---|---|---|
| EER dentro de reunión (1.332 ensayos objetivo) | 3,07 % | 2,85 % | 2,85 % |
| EER entre reuniones (4.079 ensayos objetivo) | 3,48 % | 3,55 % | 3,55 % |
| Coseno frente a PyTorch, 357 duraciones 0,35–60 s | hasta −0,01 | 1,0000 | 1 |

Verificación de hablante en AISHELL-1 (v1):

| Metrica | Valor |
|---|---|
| EER | 0,48 % (20 hablantes, 6.000 ensayos del mismo hablante / 6.000 de distinto hablante) |
| Coseno mismo hablante | 0,805 |
| Coseno distinto hablante | 0,256 |
| Coseno CoreML frente a torch | 0,9997–0,99999 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, en CN-Celeb) en la información disponible.

## Requisitos de hardware

- Inferencia en Apple Silicon: CPU para el preprocesador y CPU o GPU integrada para el extractor; el modelo está compilado como `.mlmodelc` para CoreML.
- VRAM: no aplica en el sentido tradicional; el modelo ocupa del orden de decenas de MB en memoria al tener ~7,2 M de parámetros en FP32.
- GPU recomendadas: no requiere GPU dedicada; se ejecuta en CPU de Apple Silicon y puede usar la GPU integrada. No está pensado para A100, H100 ni RTX 4090.
- Cabe en cualquier Mac con Apple Silicon y en dispositivos iOS compatibles con CoreML.
- Opciones de despliegue: CoreML de forma nativa, o a través de FluidAudio (framework del autor) que integra el pipeline; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / uso | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAM++ CoreML (este) | ~7,2 M | Segmentos de audio; verificación y diarización | EER 2,85 % AMI dentro de reunión; 0,48 % AISHELL-1 | campplus-upstream | HuggingFace, CoreML |
| CAM++ original (FunASR / iic) | ~7,2 M | Segmentos de audio; verificación y diarización | EER ~6–7 % en CN-Celeb según la model card | FunASR upstream | ModelScope |
| 3D-Speaker CAMPPlus (PyTorch) | ~7,2 M | Segmentos de audio; verificación y diarización | EER 2,85 % AMI dentro de reunión | 3D-Speaker upstream | Repositorio de referencia |

No se dispone de datos de otros modelos comparables (por ejemplo, ECAPA-TDNN o WavLM) en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en embeddings de hablante: no genera texto ni responde preguntas; no debe evaluarse como un LLM.
- Idioma limitado al mandarín según la model card; el rendimiento en otras lenguas no está documentado.
- El EER de 0,48 % en AISHELL-1 corresponde a audio limpio de lectura y es optimista; en CN-Celeb el EER sube a ~6–7 % según la model card.
- La v1 presenta embeddings incoherentes en ciertas duraciones de audio (por ejemplo, 17,9–20,4 s); se recomienda usar la v2.
- Riesgo de confusión entre hablantes con voces similares, ruido de fondo o canales distintos; el EER entre reuniones es superior al EER dentro de reunión.
- La licencia `campplus-upstream` remite a la licencia de FunASR; es necesario revisar sus términos antes de uso comercial.
- El modelo solo se distribuye en formato CoreML, lo que limita su uso a plataformas Apple; no hay pesos en safetensors ni GGUF.
- No se han publicado métricas de latencia ni de throughput en la información disponible.

## Enlaces

- [HuggingFace: FluidInference/campplus-coreml](https://huggingface.co/FluidInference/campplus-coreml)
- [Modelo upstream en ModelScope: iic/speech_campplus_sv_zh-cn_16k-common](https://www.modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common)
- [Repositorio FunASR (licencia upstream)](https://github.com/modelscope/FunASR)
- [Issue FluidAudio #985](https://github.com/FluidInference/FluidAudio/issues/985)
- [PR FluidAudio #1099](https://github.com/FluidInference/FluidAudio/pull/1099)
- [Commit b7be41fc en HuggingFace](https://huggingface.co/FluidInference/campplus-coreml/commit/b7be41fcf4bf7697d879ca71c687dc532854e8a2)
