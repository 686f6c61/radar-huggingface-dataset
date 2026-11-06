# Retrieve0/Qwen3-ASR-0.6B-TensorRT-Encoder

## Resumen

Qwen3-ASR-0.6B-TensorRT-Encoder es un export en formato ONNX del codificador de audio del modelo Qwen/Qwen3-ASR-0.6B-hf, preparado para su compilación y ejecución con TensorRT sobre GPUs NVIDIA. Lo publica el usuario Retrieve0 y no constituye un modelo de reconocimiento de voz completo por sí mismo: contiene únicamente la torre de audio, por lo que necesita un decodificador de texto compatible (como el export EXL3 del mismo autor) y el repositorio Qwen3-ASR-TensorRT para integrar ambos componentes y producir transcripciones.

El modelo base pertenece a la familia Qwen3-ASR de Alibaba Qwen, que incluye las variantes Qwen3-ASR-1.7B y Qwen3-ASR-0.6B. Según la documentación oficial, ambas soportan identificación de idioma y reconocimiento de voz en 52 idiomas y dialectos, y se apoyan en el conocimiento de audio del modelo fundacional Qwen3-Omni. La variante de 0.6B es la más ligera de la familia y este export está pensado para despliegues de baja latencia en producción.

El interés de este repositorio es de ingeniería de despliegue: ofrece tres precisiones (BF16 como referencia, FP16 para GPUs antiguas sin soporte BF16 e INT8 con cuantización Q/DQ calibrada) listas para construir motores TensorRT locales. El repo ocupa 0,9 GB y se distribuye bajo licencia Apache-2.0, heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de Qwen3-ASR exportado a ONNX (grafo con ventanas de audio); el modelo completo combina este codificador con un decodificador de texto |
| Parametros totales | 0,6B en el modelo base Qwen3-ASR-0.6B; desglose codificador/decodificador no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (referencia), FP16, INT8 con Q/DQ sobre Conv y MatMul |
| Idiomas soportados | 52 idiomas y dialectos segun la familia Qwen3-ASR; lista concreta no disponible en este repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder-window.bf16.onnx`, `encoder-window.fp16.onnx`, `encoder-window.int8.onnx` con ficheros `.data` asociados); motores TensorRT `.engine` generados localmente |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es un artefacto de exportación del codificador de audio de Qwen3-ASR-0.6B. El grafo ONNX se organiza en ventanas de audio ("encoder window"), y la calibración INT8 se realizó con 32 ficheros de audio de LibriSpeech test-clean, generando 52 ventanas de codificador. La cuantización INT8 aplica Q/DQ únicamente a operaciones Conv y MatMul; el resto de operaciones permanece en coma flotante, lo que limita la pérdida de precisión pero deja margen de optimización adicional.

El modelo base Qwen3-ASR-0.6B se apoya, según la documentación oficial, en el modelo fundacional Qwen3-Omni y en datos de entrenamiento de voz a gran escala. No se dispone en la información proporcionada de detalles sobre número de tokens de audio, composición del dataset, ni sobre etapas de alineación o RLHF. La integración con el decodificador de texto se delega al repositorio Qwen3-ASR-TensorRT, que une codificador y decodificador para la transcripción completa.

## Capacidades

- Reconocimiento automático de voz (ASR) cuando se combina con un decodificador Qwen3-ASR compatible; por sí solo, este repositorio solo aporta la representación acústica.
- Identificación de idioma (language identification) en 52 idiomas y dialectos, según la familia Qwen3-ASR upstream.
- Inferencia acelerada por TensorRT con tres precisiones seleccionables (BF16, FP16, INT8).
- Despliegue en GPUs NVIDIA con soporte BF16 (precisión de referencia) o sin él (export FP16).
- Cuantización INT8 calibrada para reducir el coste computacional del codificador.
- Soporte de tool calling, agentes, visión o audio más allá del ASR: no disponible en este artefacto.

## Casos de uso

- Transcripción de audio a gran escala en servidores con GPU NVIDIA: el export ONNX a BF16/FP16/INT8 permite construir motores TensorRT optimizados para el hardware concreto, reduciendo latencia frente a una ejecución en PyTorch.
- Subtitulado y transcripción en tiempo casi real: al ser la variante de 0,6B de la familia, el coste por ventana de audio es bajo, lo que facilita procesar flujos continuos con un decodificador EXL3 o equivalente.
- Despliegue en GPUs de generación anterior: el export FP16 cubre tarjetas NVIDIA sin soporte BF16, ampliando el parque de hardware compatible.
- Servicios de transcripción multilingüe: la familia Qwen3-ASR cubre 52 idiomas y dialectos e incluye identificación de idioma, útil para enrutar o etiquetar audios automáticamente.
- Integración en pipelines de datos: transcripción por lotes de grabaciones (reuniones, atención al cliente, entrevistas) con motores TensorRT precompilados para el servidor de destino.
- Evaluación y benchmarking de despliegues ASR: las tres precisiones permiten medir el compromiso entre exactitud y rendimiento del codificador en un mismo hardware antes de fijar la configuración de producción.
- Prototipado en Windows: el proyecto declara Windows como plataforma probada, lo que facilita entornos de desarrollo locales con GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni throughput para las distintas precisiones.

## Requisitos de hardware

- GPU NVIDIA con CUDA; el export no funciona en CPU ni en aceleradores no NVIDIA.
- Entorno de referencia: CUDA 12.8, TensorRT 11.4.0.106, Python 3.10–3.13.
- Precisión BF16: requiere GPU con soporte BF16 (arquitecturas NVIDIA modernas).
- Precisión FP16: pensada para GPUs NVIDIA antiguas sin BF16.
- Precisión INT8: requiere calibración previa (32 ficheros de LibriSpeech test-clean en la referencia) y construcción local del motor.
- VRAM estimada: no disponible; el repo ocupa 0,9 GB, pero el consumo en ejecución depende del motor TensorRT y del decodificador asociado.
- Los ficheros `.engine` deben construirse localmente para la GPU y versión de TensorRT concretas; no son portables entre entornos.
- Opciones de despliegue: TensorRT mediante el repositorio Qwen3-ASR-TensorRT; el decodificador de referencia es el export EXL3 (ExLlamaV3). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Plataformas: Windows probado y soportado; Linux debería funcionar con paquetes CUDA, TensorRT, PyTorch y ExLlamaV3 compatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-TensorRT-Encoder (este) | 0,6B (base) | no disponible | 52 idiomas y dialectos (familia) | Apache-2.0 | ONNX + TensorRT, solo codificador |
| Qwen/Qwen3-ASR-0.6B-hf | 0,6B | no disponible | 52 idiomas y dialectos | Apache-2.0 (upstream) | Pesos Hugging Face, modelo completo |
| Qwen3-ASR-1.7B | 1,7B | no disponible | 52 idiomas y dialectos | no disponible | Pesos Hugging Face, modelo completo |
| Whisper (variantes pequeñas) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a la familia Qwen3-ASR porque la información proporcionada no incluye datos verificables de alternativas como Whisper. La diferencia clave entre este export y el modelo upstream es que aquí solo se distribuye el codificador de audio en ONNX para TensorRT, mientras que el modelo completo requiere además un decodificador.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un decodificador Qwen3-ASR compatible (por ejemplo, el export EXL3) y el repositorio de integración, no produce transcripciones.
- Los motores TensorRT `.engine` deben generarse en la máquina de destino; no se pueden reutilizar entre GPUs o versiones de TensorRT distintas.
- Solo funciona en GPUs NVIDIA con CUDA; no hay soporte documentado para CPU, AMD, Apple Silicon ni aceleradores alternativos.
- La calibración INT8 se hizo con solo 32 ficheros de LibriSpeech test-clean (inglés, dominio de lectura), por lo que la precisión en otros idiomas o dominios acústicos puede degradarse.
- La lista concreta de los 52 idiomas y dialectos no está detallada en este repositorio; debe consultarse en la documentación de Qwen3-ASR.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR: no se han publicado métricas de WER en esta información.
- Sesgos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero obliga a mantener la atribución y la licencia del modelo upstream Qwen/Qwen3-ASR-0.6B-hf y a citar el trabajo Qwen3-ASR y el proyecto de runtime.
- Windows es la plataforma probada; el soporte en Linux se describe como esperado, no como verificado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción.

## Enlaces

- Hugging Face del export: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-TensorRT-Encoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Decodificador EXL3 compatible: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-EXL3-Decoder
- Repositorio de runtime TensorRT: https://github.com/lost0427/Qwen3-ASR-TensorRT
- Repositorio oficial de la familia Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Página oficial de Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
