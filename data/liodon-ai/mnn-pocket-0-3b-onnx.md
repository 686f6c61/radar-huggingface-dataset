# liodon-ai/MNN-Pocket-0.3B-ONNX

## Resumen

MNN-Pocket-0.3B-ONNX es la exportación a formato ONNX del modelo taobao-mnn/MNN-Pocket-0.3B, publicada por Liodon AI. Se trata de un modelo de generación de texto de pequeño tamaño (0,3 mil millones de parámetros) orientado a inferencia en dispositivos con recursos limitados. La exportación se ha realizado con `optimum` mediante la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de past-key-value para decodificación autorregresiva con caché KV.

El interés de esta versión radica en su portabilidad: al estar en ONNX, puede ejecutarse con ONNX Runtime sobre CPU o GPU usando distintos execution providers, sin depender del stack nativo de MNN. El repositorio incluye tres variantes de pesos (FP32, FP16 e INT8 dinámico), lo que permite ajustar el equilibrio entre precisión y consumo de memoria.

No se dispone de información publicada sobre arquitectura interna, datos de entrenamiento ni capacidades específicas del modelo base más allá de lo indicado en la model card. La licencia figura como "other", sin que se detallen sus términos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3 según tags; detalles no publicados) |
| Parametros totales | 0,3 mil millones (según nombre del modelo) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 dinámico (weight-only, sin calibración) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base taobao-mnn/MNN-Pocket-0.3B. Los tags del repositorio incluyen `qwen3`, lo que sugiere que el modelo base deriva de la familia Qwen3, pero no se confirma en la model card. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La exportación ONNX se realizó con `optimum.exporters.onnx.main_export` en la tarea `text-generation-with-past`, de forma que el grafo incluye inputs y outputs de past-key-value para decodificación con caché. La cuantización INT8 es dinámica y solo afecta a los pesos, sin calibración. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y conversación (pipeline `text-generation`, tag `conversational`).
- Inferencia con caché KV mediante past-key-value en el grafo ONNX.
- Ejecución multiplataforma a través de ONNX Runtime (CPU y GPU con execution providers).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia en dispositivos de borde: el modelo INT8 ocupa 0,36 GB, lo que permite ejecutarlo en CPUs modestas o sistemas embebidos con ONNX Runtime y el `CPUExecutionProvider`.
- Prototipado rápido de aplicaciones conversacionales: la variante FP16 (0,77 GB) permite desplegar un chatbot básico en GPU de consumo sin necesidad de infraestructura dedicada.
- Integración en aplicaciones de escritorio o móviles multiplataforma: el formato ONNX facilita el empaquetado con ONNX Runtime en Windows, Linux, macOS y Android.
- Generación de texto de baja latencia en pipelines locales: al ser un modelo de 0,3B, el coste por token es reducido, adecuado para tareas de autocompletado o resumen breve.
- Evaluación y benchmarking de runtimes: sirve como modelo de referencia pequeño para comparar rendimiento entre execution providers de ONNX Runtime.
- Filtrado o clasificación ligera de texto: puede adaptarse a tareas de generación corta en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,36 GB para INT8, 0,77 GB para FP16 y 1,45 GB para FP32, solo para los pesos.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA o DirectML); no se requiere hardware de gama alta por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre para la variante FP32, y menos para FP16 e INT8.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider`, `CUDAExecutionProvider`, `DirectMLExecutionProvider`), con el wrapper `optimum.onnxruntime.ORTModelForCausalLM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| MNN-Pocket-0.3B-ONNX | 0,3B | no disponible | ONNX | other |
| taobao-mnn/MNN-Pocket-0.3B (original) | 0,3B | no disponible | MNN | other |
| Qwen3-0.6B | 0,6B | no disponible en esta ficha | safetensors | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base.
- Riesgo de alucinación inherente a modelos de lenguaje pequeños, probablemente elevado dado el tamaño de 0,3B.
- Longitud de contexto e idiomas soportados no especificados; no se recomienda asumir cobertura multilingüe.
- Licencia "other": es imprescindible revisar los términos del modelo base taobao-mnn/MNN-Pocket-0.3B antes de cualquier uso comercial.
- La cuantización INT8 dinámica puede degradar la calidad de generación frente a FP16 o FP32; conviene validar en la tarea objetivo.
- El uso directo de `onnxruntime.InferenceSession` requiere gestionar manualmente los tensores de past-key-value; se recomienda emplear `ORTModelForCausalLM` de optimum.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/liodon-ai/MNN-Pocket-0.3B-ONNX
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- Perfil del autor: https://huggingface.co/liodon-ai
