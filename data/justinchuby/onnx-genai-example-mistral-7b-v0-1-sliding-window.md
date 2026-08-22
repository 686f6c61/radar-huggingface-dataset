# justinchuby/onnx-genai-example-mistral-7b-v0-1-sliding-window

## Resumen

El modelo `justinchuby/onnx-genai-example-mistral-7b-v0-1-sliding-window` es un paquete ONNX de pesos reales en precisión fp16 exportado desde `mistralai/Mistral-7B-v0.1` en una revisión inmutable concreta. Lo publica Justin Chuby como parte de su proyecto `onnx-genai`, un runtime de generación para ONNX, y sirve como ejemplo de exportación con atención de ventana deslizante (sliding window attention, SWA). El grafo contiene 32 nodos CUDA `com.microsoft::GroupQueryAttention` con `local_window_size=4096`, lo que permite probar el comportamiento de la atención con ventana en entornos ONNX Runtime.

Este modelo no introduce nuevas capacidades respecto al Mistral-7B-v0.1 original, pero es relevante para desarrolladores que trabajan con inferencia ONNX y necesitan validar implementaciones de GQA y SWA en GPUs NVIDIA. Incluye metadatos canónicos, tokenizador, políticas, procedencia y un informe de ejecución con tiempos exactos, lo que facilita su uso como referencia técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped-Query Attention (GQA) y Sliding Window Attention (SWA) |
| Parametros totales | 7.3B (modelo base Mistral-7B-v0.1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | No especificada en el export; el modelo base tiene 8192 tokens, con ventana deslizante de 4096 |
| Tipos de cuantizacion | fp16 (pesos reales) |
| Idiomas soportados | No especificados en el export; el modelo base soporta inglés, frances, aleman, italiano y español |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo con pesos fp16) |

## Arquitectura y entrenamiento

El modelo es una exportacion directa de los pesos de Mistral-7B-v0.1, que emplea una arquitectura transformer decoder con Grouped-Query Attention (GQA) y Sliding Window Attention (SWA). El grafo ONNX resultante utiliza 32 nodos `com.microsoft::GroupQueryAttention` con un tamaño de ventana local de 4096 tokens. No se ha realizado ningun entrenamiento adicional sobre estos pesos; el export conserva exactamente los valores originales. El paquete incluye metadatos de inferencia, tokenizador y politicas, asi como un informe de ejecucion que documenta una prueba real en una GPU H200 generando 12 tokens con logits finitos desde posiciones 4092-4103, cruzando el limite configurado de la ventana.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas (segun el modelo base).
- Razonamiento, comprension lectora y generacion de codigo (capacidades heredadas de Mistral-7B-v0.1).
- Atencion con ventana deslizante que reduce el coste computacional en secuencias largas.
- Soporte de ejecucion mediante ONNX Runtime con backend CUDA.
- Incluye metadatos y politicas de inferencia para integracion en pipelines ONNX.

## Casos de uso

- Validacion de implementaciones ONNX de GQA y SWA: el modelo permite comprobar que los nodos `GroupQueryAttention` funcionan correctamente en un entorno real, como demuestra la prueba en H200.
- Evaluacion de rendimiento de ONNX Runtime: sirve como punto de referencia para medir latencia y throughput en GPUs NVIDIA con modelos de 7B en fp16.
- Desarrollo de runtimes de generacion: el paquete incluye un script de prueba (`evidence/probe_sliding_window.py`) que facilita la depuracion de pipelines ONNX.
- Integracion en sistemas que requieren inferencia local con ONNX: puede usarse como base para construir servicios de generacion de texto sin dependencias de frameworks propietarios.
- Estudio de la atencion con ventana: permite analizar como se comporta el modelo al cruzar los limites de la ventana deslizante, util para investigacion.
- Pruebas de compatibilidad: verifica que las herramientas de exportacion y runtime (onnx-genai, onnxruntime-gpu) manejan correctamente pesos fp16 y nodos personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card solo documenta una prueba de ejecucion en H200 que genero 12 tokens con logits finitos, sin cifras de velocidad ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7.3B en fp16, ocupa aproximadamente 14.5 GB de pesos; se recomienda al menos 16 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: NVIDIA H200 (usada en la prueba documentada), A100 40GB, RTX 4090 24GB, o cualquier GPU con soporte CUDA y suficiente memoria.
- Puede ejecutarse en GPUs de consumo como RTX 3090/4090, aunque con limitaciones de longitud de contexto.
- Opciones de despliegue: ONNX Runtime con backend CUDA (requiere `onnxruntime-gpu`), junto con las bibliotecas `onnx`, `transformers` y `numpy`.
- Latencia y throughput: no disponibles; la prueba documentada no reporta tiempos especificos.

## Comparativa con modelos similares

No se dispone de informacion comparativa especifica para este export ONNX. Como referencia, el modelo base Mistral-7B-v0.1 se compara habitualmente con Llama 2 7B y CodeLlama 7B, pero no hay datos de este paquete concreto frente a alternativas.

## Limitaciones y advertencias

- Es un paquete de ejemplo y validacion, no un modelo optimizado para produccion.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribucion del modelo original.
- El contexto efectivo depende de la implementacion de SWA; secuencias muy largas pueden degradar la coherencia.
- No se especifican sesgos ni riesgos de alucinacion en la documentacion del export, pero hereda los del modelo base Mistral-7B-v0.1.
- Requiere un entorno con CUDA y versiones exactas de las bibliotecas (indicadas en `output.json`) para reproducir la prueba.
- No se proporcionan pesos en otros formatos (GGUF, safetensors) ni cuantizaciones alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/justinchuby/onnx-genai-example-mistral-7b-v0-1-sliding-window
- Repositorio onnx-genai: https://github.com/justinchuby/onnx-genai
- Repositorio onnx-genai-models: https://github.com/justinchuby/onnx-genai-models
- Modelo base Mistral-7B-v0.1: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Pagina de Mistral en LM Studio: https://lmstudio.ai/models/mistral
