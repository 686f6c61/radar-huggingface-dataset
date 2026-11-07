# liodon-ai/Oc-e-Non-v1-ONNX

## Resumen

Oc-e-Non-v1-ONNX es la exportación al formato ONNX del modelo de generación de texto p-e-w/Oc-e-Non-v1, publicada por el colectivo Liodon AI. El repositorio contiene únicamente los grafos ONNX resultantes de la conversión, no una nueva versión del modelo: el trabajo de Liodon AI se limita a la exportación mediante `optimum` con la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de past-key-value para decodificación autorregresiva con caché KV.

El paquete incluye dos ficheros de pesos: `model.onnx` en FP32 (17,65 GB) y `model_fp16.onnx` en FP16 (9,58 GB) para ejecución en GPU mediante execution providers de ONNX Runtime. El tamaño total del repositorio es de 27,2 GB. La model card no documenta parámetros, longitud de contexto, idiomas ni datos de entrenamiento del modelo original, por lo que buena parte de las especificaciones técnicas no están disponibles en la información proporcionada.

La relevancia de esta ficha es práctica: permite ejecutar el modelo base en entornos donde ONNX Runtime es el runtime de referencia (Windows, edge, integración con DirectML o TensorRT, pipelines propios sin dependencia de PyTorch), a cambio de asumir la opacidad documental del export y la licencia "other" heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `qwen3` en el repositorio; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`model.onnx`), FP16 (`model_fp16.onnx`); la model card menciona `model_quantized.onnx` en el ejemplo de código pero no lo lista en la tabla de ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | ONNX (grafos con past-key-value); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo: exporta p-e-w/Oc-e-Non-v1 a ONNX con `optimum.exporters.onnx.main_export` bajo la tarea `text-generation-with-past`. El grafo resultante es un transformer decoder-only con caché KV explícita en las entradas y salidas, lo que permite reutilizar las claves y valores entre pasos de decodificación y evita recalcular el prefijo en cada token generado.

La etiqueta `qwen3` del repositorio sugiere que el modelo base deriva de la familia Qwen 3, pero la model card no confirma arquitectura exacta, número de parámetros, tokens de entrenamiento, composición del dataset ni si hubo ajuste por RLHF o DPO. Tampoco se documentan innovaciones técnicas del modelo original. Toda esa información debe consultarse en la ficha de p-e-w/Oc-e-Non-v1, que no forma parte del material proporcionado.

## Capacidades

- Generación de texto autorregresiva con decodificación incremental soportada por caché KV en el grafo ONNX.
- Ejecución en ONNX Runtime con distintos execution providers (CPU, CUDA, TensorRT, DirectML), lo que habilita despliegue fuera del ecosistema PyTorch.
- Ejecución en FP32 o FP16 según el fichero cargado; FP16 está pensado para GPU.
- Compatibilidad con el wrapper `ORTModelForCausalLM` de optimum, que gestiona automáticamente la contabilidad de la caché KV.
- Capacidades específicas del modelo base (código, matemáticas, tool calling, agentes, multilingüismo, modo thinking) no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modalidades adicionales.

## Casos de uso

- Despliegue en Windows o entornos edge con ONNX Runtime y DirectML: el grafo FP16 permite inferencia en GPU sin instalar CUDA ni PyTorch, útil para aplicaciones de escritorio con generación de texto local.
- Integración en pipelines de inferencia basados en ONNX Runtime Server o Triton con backend ONNX: el formato con past-key-value encaja en servicios que ya estandarizan ONNX como formato de intercambio.
- Aceleración con TensorRT: el fichero FP16 puede compilarse a un motor TensorRT para reducir latencia en GPUs NVIDIA, manteniendo el modelo base intacto.
- Prototipado multiplataforma: al no depender de PyTorch, el mismo artefacto ONNX se ejecuta en Linux, Windows y macOS con distintos execution providers, lo que simplifica la validación cruzada.
- Evaluación comparativa de runtimes: sirve para medir el rendimiento del modelo base en ONNX Runtime frente a vLLM o llama.cpp, aislando el efecto del runtime del efecto del modelo.
- Distribución de artefactos en entornos con requisitos estrictos de dependencias: organizaciones que no pueden incorporar PyTorch a su cadena de suministro pueden consumir el modelo vía ONNX Runtime.
- Experimentación con caché KV manual: el grafo expone las entradas de past-key-value, lo que facilita investigación sobre estrategias de gestión de caché, compartición de prefijos o decodificación especulativa a nivel de runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad, latencia ni throughput, ni comparaciones con el modelo base en otros runtimes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB para el fichero FP16 y 18 GB para el FP32, solo para los pesos; hay que añadir la memoria de la caché KV, que depende de la longitud de contexto y del número de capas (no documentados).
- GPU recomendadas: para FP16, tarjetas con 16 GB o más (RTX 4080/4090, A10, L4, A100, H100). Para FP32, se requieren 24 GB o más (RTX 3090/4090, A100 40 GB, H100).
- GPU de consumo: el fichero FP16 cabe en RTX 4080, RTX 4090 y RTX 3090; en tarjetas de 12 GB o menos no cabe sin cuantización adicional, que no se distribuye en este repositorio.
- Despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), optimum (`ORTModelForCausalLM`), Triton Inference Server con backend ONNX. No se distribuyen pesos en GGUF, por lo que llama.cpp y Ollama no son opciones directas sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Oc-e-Non-v1-ONNX | ONNX (FP32/FP16) | no disponible | no disponible | other | Export del modelo base; sin benchmarks publicados |
| p-e-w/Oc-e-Non-v1 | no disponible | no disponible | no disponible | other | Modelo original; fuente de la exportación |
| Alternativas ONNX de la familia Qwen 3 | ONNX | no disponible | no disponible | según variante | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia "other" del modelo base no está detallada en la información proporcionada; es imprescindible revisar los términos de p-e-w/Oc-e-Non-v1 antes de cualquier uso comercial.
- El repositorio no documenta parámetros, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar idoneidad y riesgos sin consultar el modelo original.
- La model card menciona `model_quantized.onnx` en el ejemplo de código, pero la tabla de ficheros solo lista FP32 y FP16; conviene verificar qué ficheros existen realmente antes de desplegar.
- El uso de ONNX Runtime con caché KV manual es propenso a errores si no se emplea un wrapper como `ORTModelForCausalLM`; una gestión incorrecta de las entradas past-key-value produce resultados incoherentes.
- No se distribuyen pesos GGUF ni cuantizaciones de 4 u 8 bits, lo que limita el despliegue en hardware de gama baja.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben asumirse los del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- El tamaño de 27,2 GB del repositorio incluye ambos ficheros; descargar solo el FP16 reduce el consumo a 9,58 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Oc-e-Non-v1-ONNX
- Modelo base: https://huggingface.co/p-e-w/Oc-e-Non-v1
- Perfil de Liodon AI en Hugging Face: https://huggingface.co/liodon-ai
- Organización Liodon AI en GitHub: https://github.com/Liodon-AI
- Optimum (exportador ONNX): https://github.com/huggingface/optimum
