# Retrieve0/Qwen3-ASR-1.7B-TensorRT-Encoder

## Resumen

`Retrieve0/Qwen3-ASR-1.7B-TensorRT-Encoder` es un export en ONNX del codificador de audio del modelo `Qwen/Qwen3-ASR-1.7B-hf`, empaquetado por el usuario Retrieve0 y pensado para su compilación y ejecución con TensorRT sobre GPU NVIDIA. No es un modelo de reconocimiento de voz completo: contiene únicamente la torre de audio del sistema ASR de Qwen, y requiere un decodificador de texto compatible (el autor publica un decodificador EXL3 aparte) y el repositorio de integración `Qwen3-ASR-TensorRT` para producir transcripciones.

El modelo base, Qwen3-ASR-1.7B, forma parte de la familia Qwen3-ASR (1.7B y 0.6B) desarrollada por el equipo Qwen, que soporta identificación de idioma y reconocimiento de voz en 52 idiomas y dialectos, apoyándose en los datos de entrenamiento de habla a gran escala y en la capacidad de comprensión de audio de su modelo fundacional Qwen3-Omni. Este repositorio concreto resuelve un problema de despliegue: permitir inferencia de baja latencia del codificador en producción sobre hardware NVIDIA, ofreciendo tres precisiones (BF16, FP16 e INT8 con calibración Q/DQ) y evitando la dependencia de PyTorch en tiempo de ejecución.

La relevancia de este artefacto es operativa más que algorítmica: los ficheros `.engine` de TensorRT no se distribuyen porque dependen de la arquitectura de GPU concreta, de modo que el repositorio entrega los grafos ONNX y las instrucciones de compilación para generar los motores localmente. El tamaño del repositorio es de 1,9 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio de Qwen3-ASR exportado a ONNX (grafo `encoder-window`); el sistema completo combina codificador de audio y decodificador de texto |
| Parámetros totales | 1,7B en el modelo base Qwen3-ASR-1.7B; el repositorio contiene solo el subgrafo del codificador (no disponible el desglose exacto de parámetros del codificador) |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (referencia), FP16 (compatibilidad), INT8 con Q/DQ simétrico en operaciones Conv y MatMul |
| Idiomas soportados | no disponible en este repositorio; el modelo base Qwen3-ASR-1.7B soporta 52 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder-window.bf16.onnx` + `.data`, `encoder-window.fp16.onnx` + `.data`, `encoder-window.int8.onnx` + `_data`); sin ficheros `.engine` incluidos |

## Arquitectura y entrenamiento

El artefacto es un export ONNX del codificador de audio de Qwen3-ASR-1.7B, estructurado en ventanas (`encoder-window`), lo que sugiere un procesamiento por segmentos de audio. El modelo base Qwen3-ASR se apoya en la capacidad de comprensión de audio de Qwen3-Omni y se entrenó con datos de habla a gran escala; el repositorio no detalla la composición del dataset, el número de tokens ni si hubo etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en esta ficha.

La innovación técnica de este repositorio es el pipeline de despliegue: exportación a ONNX en tres precisiones, cuantización INT8 con calibración estática (32 ficheros de audio que generaron 52 ventanas de codificador) aplicada solo a Conv y MatMul, y compilación a TensorRT en el equipo destino. El entorno de referencia es CUDA 12.8, TensorRT 11.4.0.106 y Python 3.10–3.13, con soporte probado en Windows y funcionamiento esperado en Linux con paquetes compatibles de CUDA, TensorRT, PyTorch y ExLlamaV3.

## Capacidades

- Extracción de características de audio para reconocimiento automático de voz (ASR) en el pipeline Qwen3-ASR.
- Identificación de idioma y transcripción multilingüe cuando se combina con el decodificador de texto del modelo base (52 idiomas y dialectos en Qwen3-ASR-1.7B).
- Inferencia acelerada por TensorRT con precisión configurable (BF16, FP16, INT8).
- Cuantización INT8 calibrada para reducir requisitos de cómputo y memoria en el codificador.
- Integración con decodificadores externos, como el decodificador EXL3 publicado por el mismo autor.
- No incluye generación de texto por sí mismo: carece de decodificador y de cabezas de lenguaje en este repositorio.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del propio codificador ASR.

## Casos de uso

- Transcripción por lotes de archivos de audio: el codificador compilado con TensorRT procesa ventanas de audio y entrega embeddings al decodificador Qwen3-ASR, adecuado para pipelines offline de alto volumen donde interesa minimizar el coste por hora de audio.
- Subtitulado automático de vídeo: la combinación codificador TensorRT más decodificador permite generar transcripciones con marcas temporales por ventana, útil en plataformas de contenido que necesitan subtítulos en varios idiomas.
- Asistentes de voz en tiempo real: al compilar el codificador en INT8 o FP16 se reduce la latencia de la fase de codificación, lo que favorece aplicaciones interactivas con requisitos de respuesta baja.
- Servicios de atención al cliente con entrada de voz: el modelo base soporta identificación de idioma, de modo que un mismo servicio puede enrutar llamadas en distintos idiomas antes de aplicar lógica de negocio.
- Despliegue en infraestructura NVIDIA existente: al no requerir PyTorch en tiempo de ejecución, el motor TensorRT se integra en servicios ya estandarizados sobre CUDA y TensorRT, simplificando la operación.
- Evaluación comparativa de precisiones: los tres exports permiten medir el compromiso entre calidad de transcripción y velocidad en el hardware objetivo antes de fijar una configuración de producción.
- Investigación en ASR: sirve como bloque de codificación reproducible para experimentos que sustituyan el decodificador o modifiquen la estrategia de ventaneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU NVIDIA con CUDA; el repositorio no especifica VRAM mínima ni recomendada.
- BF16 requiere GPU con soporte de BF16; FP16 está pensado para GPUs NVIDIA más antiguas sin BF16.
- INT8 requiere calibración previa con audio representativo del dominio (el autor usó 32 ficheros y 52 ventanas).
- Entorno de referencia: CUDA 12.8 y TensorRT 11.4.0.106, Python 3.10–3.13.
- Windows está probado y soportado; Linux debería funcionar con versiones compatibles de CUDA, TensorRT, PyTorch y ExLlamaV3.
- Los ficheros `.engine` deben compilarse localmente para la arquitectura de GPU objetivo; no se distribuyen binarios precompilados.
- No se publican cifras de latencia ni throughput.
- No se indica si cabe en GPU de consumo; el tamaño del repositorio (1,9 GB) corresponde a los tres exports ONNX, no a la huella en VRAM del motor compilado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Retrieve0/Qwen3-ASR-1.7B-TensorRT-Encoder (este) | Codificador de un modelo de 1,7B | no disponible | no disponible en el export; 52 en el base | Apache-2.0 | ONNX para TensorRT; requiere decodificador externo |
| Qwen/Qwen3-ASR-1.7B-hf | 1,7B | no disponible | 52 idiomas y dialectos | no disponible en la información proporcionada | Pesos del modelo completo para uso con la librería de referencia |
| Qwen3-ASR-0.6B | 0,6B | no disponible | 52 idiomas y dialectos | no disponible en la información proporcionada | Modelo completo de la misma familia, menor tamaño |
| Retrieve0/Qwen3-ASR-1.7B-EXL3-Decoder | no disponible | no disponible | no disponible | no disponible en la información proporcionada | Decodificador EXL3 complementario a este codificador |

## Limitaciones y advertencias

- No es un modelo autónomo: sin un decodificador Qwen3-ASR compatible no produce transcripciones.
- Los motores TensorRT no son portables entre arquitecturas de GPU; cada destino requiere compilación propia.
- La cuantización INT8 se calibró con solo 32 ficheros de audio, por lo que puede degradarse en dominios acústicos distintos (ruido, canales telefónicos, acentos no representados).
- No se documentan sesgos demográficos, lingüísticos ni acústicos del export ni del modelo base.
- Riesgo de alucinación y de errores de transcripción inherente a los sistemas ASR; no se han publicado tasas de error en esta información.
- La cobertura de 52 idiomas corresponde al modelo base; este repositorio no declara idiomas soportados de forma explícita.
- Aunque la licencia es Apache-2.0, se exige mantener la atribución y la licencia del modelo upstream Qwen3-ASR y citar el trabajo original y el proyecto de runtime.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.
- El soporte de Linux no está probado formalmente, solo Windows.

## Enlaces

- Repositorio del export: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-TensorRT-Encoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Modelo base (referencia alternativa): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Decodificador EXL3 complementario: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-EXL3-Decoder
- Repositorio de runtime TensorRT: https://github.com/lost0427/Qwen3-ASR-TensorRT
- Repositorio oficial Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
