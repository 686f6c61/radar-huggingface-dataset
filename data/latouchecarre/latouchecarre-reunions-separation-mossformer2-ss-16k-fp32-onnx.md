# LaToucheCarre/LaToucheCarre-Reunions-Separation-MossFormer2-SS-16K-FP32-ONNX

## Resumen

LaToucheCarre-Reunions-Separation-MossFormer2-SS-16K-FP32-ONNX es un export en formato ONNX del modelo MossFormer2_SS_16K desarrollado por el Speech Lab de Alibaba (Tongyi) dentro del proyecto ClearerVoice-Studio. No se trata de un modelo nuevo ni reentrenado: es una conversión de los pesos originales (`last_best_checkpoint.pt`) a un grafo ONNX de precisión float32, pensada para ejecutarse en Windows sobre GPU mediante ONNX Runtime con el backend DirectML. El autor del export es LaToucheCarre, y lo publica como componente de la aplicación de escritorio homónima para transcripción de reuniones.

El modelo resuelve un problema concreto: la separación de dos voces solapadas en audio mono a 16 kHz. En el contexto de una reunión, cuando dos participantes hablan a la vez, los sistemas de transcripción automática degradan notablemente su precisión; este modelo produce dos pistas de audio, una por voz, que pueden transcribirse por separado y reasignarse a su hablante mediante huella vocal. La arquitectura subyacente es MossFormer2, un modelo híbrido que combina atención tipo Transformer con un módulo recurrente sin RNN (FSMN), descrito en Zhao et al., ICASSP 2024.

La relevancia de este repositorio es fundamentalmente práctica: ofrece un artefacto ONNX verificado para DirectML, con correcciones específicas que evitan la caída silenciosa de operaciones al CPU (reescritura de 194 `Einsum`, conversión de ConvTranspose 1D a 2D, sustitución de `Concat` por `Tile`). El resultado es un modelo de 233,9 MB que procesa 10 segundos de audio en 0,22-0,55 s sobre una RTX 5090, con un SI-SDRi de 18,92 dB respecto al export de referencia en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (hibrida: atencion tipo Transformer + modulo recurrente sin RNN basado en FSMN y unidades convolucionales con compuerta) |
| Parametros totales | no disponible (el fichero ONNX ocupa 233 949 279 bytes en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio mono 16 kHz con longitud T = 2048·k + 8 (k ≥ 1), es decir, multiples de 2048 muestras mas 8 |
| Tipos de cuantizacion | solo float32 (fp16 descartado por incompatibilidad con DirectML) |
| Idiomas soportados | no disponible (procesamiento de senal de voz, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 20), fichero `latouchecarre-mossformer2-ss-16k-fp32.onnx`, SHA-256 `43aec97efb2e018700dd6e220487dca04a131fe611cbcb7acac32a5af7c91e65` |

## Arquitectura y entrenamiento

MossFormer2 es una arquitectura hibrida para separacion de voz monoaural en dominio temporal. Combina auto-atencion tipo Transformer, que captura dependencias de largo alcance entre tramas, con un modulo recurrente sin RNN basado en feedforward sequential memory networks (FSMN) y unidades convolucionales con compuerta, que modela patrones recurrentes de escala fina. El modelo opera sobre la forma de onda directamente, sin etapa de STFT explicita en el grafo exportado, y produce dos pistas de salida a partir de una mezcla mono.

Este repositorio concreto no incluye entrenamiento ni ajuste fino: es un export directo de los pesos publicados por Alibaba. El proceso de exportacion usa `torch.onnx.export(dynamo=True)` con PyTorch 2.15 y fija la dimension dinamica T = 2048·k + 8, de modo que el encoder (convolucion de kernel 16 y paso 8) genera 256·k tramas, multiplo de los grupos de 256 de la atencion FLASH, eliminando el relleno interno dependiente de la longitud. Se desactiva la cache de embeddings rotativos (`cache_if_possible = False`) antes del export. Sobre ese grafo se aplican correcciones para DirectML: `Reshape(allowzero=1)` se revierte a 0, el ConvTranspose 1D del decodificador se reescribe como ConvTranspose 2D, un `Concat` de un tensor consigo mismo se sustituye por `Tile`, y los 194 `Einsum` se reescriben como combinaciones de `Mul`, `MatMul`, `Transpose` y `Reshape`, ya que bajo DirectML aproximadamente la mitad caia al CPU, resultando lenta e incorrecta mas alla de 5 segundos de audio.

La verificacion reportada compara el export original contra PyTorch sobre 10 mezclas de dos voces francesas de 10 a 15 segundos, con SI-SDRi identico de 18,9 dB. El fichero final, ejecutado bajo DirectML, se compara contra el export original bajo ONNX Runtime en CPU: el SI-SDR de la diferencia es de al menos 68 dB en las 10 mezclas, y el SI-SDRi es de 18,92 dB frente a 18,92 dB.

## Capacidades

- Separacion de dos voces superpuestas en audio mono a 16 kHz, con salida de dos pistas float32 de la misma longitud que la entrada.
- Procesamiento en dominio temporal sobre forma de onda, sin necesidad de caracteristicas espectrales externas.
- Ejecucion local en GPU en Windows mediante ONNX Runtime con DirectML, sin envio de audio a servicios externos.
- Longitud de entrada dinamica en multiplos de 2048 muestras mas 8, con posibilidad de fijar la longitud en la creacion de la sesion para reducir latencia.
- Integracion con pipelines de transcripcion (el autor cita Parakeet) y con asignacion de hablante por huella vocal.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de audio-a-audio.

## Casos de uso

- Transcripcion de reuniones con habla solapada: cuando dos participantes hablan a la vez, el modelo separa la mezcla en dos pistas que se transcriben por separado; el autor reporta un aumento de palabras correctas del 47 % sobre la mezcla al 93 % sobre las pistas separadas reasignadas por huella vocal.
- Post-procesado de actas automaticas: las pistas separadas permiten atribuir cada fragmento a su hablante antes de generar el resumen, mejorando la fidelidad de la atribucion en tramos conflictivos.
- Indexacion y busqueda de reuniones archivadas: separar las voces antes de generar embeddings de hablante reduce la contaminacion cruzada entre perfiles y mejora la recuperacion por participante.
- Pipelines de subtitulado en directo o diferido: el modelo procesa 10 segundos de audio en 0,22 s con longitud fijada en una RTX 5090, lo que permite integrarlo en un flujo casi en tiempo real sobre GPU de consumo.
- Analisis forense o de calidad de audio de entrevistas: la separacion permite aislar cada interlocutor para analisis posterior de prosodia, emocion o contenido sin la interferencia de la otra voz.
- Desarrollo de aplicaciones de escritorio con privacidad estricta: al ejecutarse via ONNX Runtime con DirectML y no requerir red, encaja en herramientas que procesan audio sensible en local, como la propia aplicacion La Touche Carre.
- Evaluacion de modelos de separacion en entornos Windows: sirve como referencia de export ONNX verificado frente al checkpoint original, util para comparar implementaciones o backends.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| SI-SDRi (export ONNX vs. PyTorch) | 18,9 dB | 10 mezclas de dos voces francesas, 10-15 s |
| SI-SDRi (DirectML vs. export ONNX en CPU) | 18,92 dB vs. 18,92 dB | 10 mezclas, diferencia con SI-SDR ≥ 68 dB |
| Tiempo de carga | 1,9 s | Windows, RTX 5090, ONNX Runtime DirectML |
| Memoria de GPU anadida | +2,8 GB | sesion calentada sobre 10 s de audio |
| Latencia, longitud variable (2 s) | 0,35 s | cada llamada con longitud nueva |
| Latencia, longitud variable (5 s) | 0,41 s | cada llamada con longitud nueva |
| Latencia, longitud variable (10 s) | 0,55 s | cada llamada con longitud nueva |
| Latencia, longitud variable (20 s) | 0,86 s | cada llamada con longitud nueva |
| Latencia, longitud fija 10 s | 0,22 s | longitud fijada en la creacion de la sesion |
| Palabras correctas (transcripcion, mezcla) | 47 % | Parakeet sobre las 10 mezclas |
| Palabras correctas (transcripcion, pistas separadas) | 93 % | Parakeet sobre pistas reasignadas por huella vocal |

No se han publicado resultados de benchmarks estandar de separacion (WSJ0-2mix, Libri2Mix u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8 GB adicionales en GPU tras cargar y calentar la sesion sobre 10 s de audio, segun la medicion del autor en una RTX 5090.
- GPU recomendadas: RTX 5090 (unica medida reportada). Cualquier GPU compatible con DirectML deberia poder ejecutar el grafo, aunque no se han publicado latencias para otros modelos.
- Cabe en GPU de consumo: si, el consumo de memoria reportado (2,8 GB) esta al alcance de practicamente cualquier GPU de escritorio con soporte DirectML.
- Opciones de despliegue: ONNX Runtime con backend DirectML en Windows (objetivo principal del export); ONNX Runtime en CPU (usado como referencia de verificacion); otros runtimes compatibles con ONNX opset 20 no estan documentados en la informacion disponible.
- Latencia y throughput: 0,22 s para 10 s de audio con longitud fijada y 0,55 s con longitud variable en RTX 5090; 0,86 s para 20 s con longitud variable. El modelo opera por encima del tiempo real en el hardware medido.
- Nota: el fp16 no es una opcion en este export, ya que DirectML lo rechaza; el autor confirma que fp32 sostiene el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LaToucheCarre-Reunions-Separation-MossFormer2-SS-16K-FP32-ONNX | no disponible (233,9 MB en fp32) | audio mono 16 kHz, T = 2048·k + 8 | Apache 2.0 | ONNX (opset 20) | Export verificado para DirectML; SI-SDRi 18,92 dB frente a PyTorch |
| alibabasglab/MossFormer2_SS_16K | no disponible | audio mono 16 kHz | Apache 2.0 | checkpoint PyTorch (`last_best_checkpoint.pt`) | Modelo original de Alibaba; referencia de calidad del export |
| Otros modelos de separacion de voz (p. ej. variantes de MossFormer, SepFormer, TF-GridNet) | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos en la informacion disponible |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; solo se documenta la equivalencia funcional con el checkpoint original de Alibaba.

## Limitaciones y advertencias

- El modelo esta disenado para separar exactamente dos voces; no se documenta su comportamiento con una sola voz, con mas de dos hablantes o con ruido no vocal.
- El orden de las dos pistas de salida es arbitrario; cualquier pipeline posterior debe reasignar pistas a hablantes mediante huella vocal u otro mecanismo.
- La entrada debe cumplir la restriccion T = 2048·k + 8 (k ≥ 1); es necesario rellenar con ceros hasta la longitud valida siguiente y recortar la salida a la longitud original.
- El export esta orientado y verificado para DirectML en Windows; no se documenta su comportamiento en otros backends o sistemas operativos.
- No hay soporte de fp16 en este export por limitacion de DirectML, lo que descarta optimizaciones de memoria y velocidad asociadas a media precision.
- No se han publicado evaluaciones de sesgo, robustez frente a acentos, ruido de fondo o calidad de microfono; el unico conjunto de validacion reportado son 10 mezclas de voces francesas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribucion a Alibaba (ClearerVoice-Studio) y al autor del export.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion por terceros.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de artefactos de separacion (distorsion, supresion parcial de una voz) en condiciones alejadas del dominio de entrenamiento.

## Enlaces

- Repositorio Hugging Face del export: https://huggingface.co/LaToucheCarre/LaToucheCarre-Reunions-Separation-MossFormer2-SS-16K-FP32-ONNX
- Modelo base en Hugging Face: https://huggingface.co/alibabasglab/MossFormer2_SS_16K
- Proyecto ClearerVoice-Studio (Alibaba): https://github.com/modelscope/ClearerVoice-Studio
- Referencia bibliografica: Zhao et al., "MossFormer2: Combining Transformer and RNN-Free Recurrent Network for Enhanced Time-Domain Monaural Speech Separation", ICASSP 2024
- Resumen tecnico de MossFormer2 en Emergent Mind: https://www.emergentmind.com/topics/mossformer2.md
