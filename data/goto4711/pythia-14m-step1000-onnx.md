# goto4711/pythia-14m-step1000-ONNX

## Resumen

pythia-14m-step1000-ONNX es una exportación a formato ONNX del modelo Pythia-14M de EleutherAI, capturado en el paso de entrenamiento 1000 (checkpoint intermedio, no el modelo final). Lo publica el usuario goto4711 como parte de la "Difference Suite" del grupo Deep Culture de la Universidad de Amsterdam, un proyecto docente y de investigación cuyo objetivo es mostrar qué hace una red neuronal antes y durante el entrenamiento. Es, por tanto, una pieza didáctica más que un modelo de producción.

El modelo subyacente, EleutherAI/pythia-14m, es un transformer decoder-only de la familia GPT-NeoX con 14 millones de parámetros, entrenado sobre el corpus The Pile. En este caso se trata de un checkpoint temprano (step 1000), lo que significa que sus capacidades generativas son muy limitadas: sirve para ilustrar el estado del aprendizaje en las primeras fases, no para tareas reales.

Su relevancia es acotada: demuestra el flujo de exportación de modelos Pythia a ONNX para su uso con Transformers.js en el navegador, y facilita material reproducible para estudiar dinámicas de entrenamiento. No debe confundirse con el modelo Pythia-14M completo ni con versiones más grandes de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parámetros totales | 14 millones (modelo base Pythia-14M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (exportación ONNX; el tag indica base_model:quantized) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo base Pythia-14M es un transformer decoder-only de la familia GPT-NeoX, con 14 millones de parámetros, desarrollado por EleutherAI y entrenado sobre The Pile. La familia Pythia se caracteriza por publicar checkpoints intermedios a lo largo del entrenamiento para facilitar estudios de interpretabilidad y dinámica de aprendizaje.

Esta exportación concreta corresponde al paso 1000 del entrenamiento, es decir, a una fase muy temprana. El autor indica que la exportación se realizó con el script `scripts/export-learning-models.py` del repositorio Difference Suite (github.com/deep-culture/difference-suite), orientado a Transformers.js. No se dispone de información sobre la composición exacta del dataset en ese paso, el número de tokens vistos ni si hubo fases de RLHF o DPO (Pythia no las emplea en su entrenamiento base, según la información disponible).

## Capacidades

- Generación de texto autoregresiva básica, limitada por el estado temprano del checkpoint (paso 1000).
- Ejecución en navegador mediante Transformers.js y ONNX Runtime Web.
- Valor didáctico para comparar el comportamiento del modelo antes y durante el entrenamiento.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia e interpretabilidad: usar el checkpoint para ilustrar cómo evoluciona la generación de texto a lo largo del entrenamiento, comparándolo con checkpoints posteriores del mismo modelo.
- Demostraciones en navegador: al estar exportado a ONNX para Transformers.js, permite ejecutar el modelo íntegramente en el cliente sin backend, útil para talleres y prototipos educativos.
- Investigación sobre dinámica de entrenamiento: material reproducible para estudiar qué representaciones y patrones emergen en las primeras fases del aprendizaje.
- Pruebas de pipelines de exportación: sirve como caso de prueba para validar flujos de conversión de PyTorch a ONNX y su carga en Transformers.js.
- Benchmarking de infraestructura ligera: por su tamaño mínimo, permite medir latencia y consumo en dispositivos de gama baja o entornos web.
- Ejemplo de referencia en documentación técnica: útil para mostrar el formato de checkpoints intermedios de la familia Pythia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoría de configuraciones, dado el tamaño de 14M de parámetros en formato ONNX.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer e incluso en navegador mediante WebGPU/WebAssembly con Transformers.js.
- Opciones de despliegue: Transformers.js (principal), ONNX Runtime; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pythia-14m-step1000-ONNX | 14M | no disponible | Apache 2.0 | ONNX | Checkpoint intermedio (paso 1000) para Transformers.js |
| EleutherAI/pythia-14m | 14M | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo base completo de EleutherAI |
| Otros checkpoints Pythia (p. ej., step posteriores) | 14M | no disponible | Apache 2.0 | safetensors/PyTorch | Versiones finales o intermedias con mayor entrenamiento |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint en el paso 1000: la calidad de generación es muy inferior a la del modelo Pythia-14M final; no es apto para producción.
- Riesgo elevado de alucinación y texto incoherente por el escaso entrenamiento acumulado.
- No se documentan idiomas soportados; el modelo base se entrenó sobre The Pile, mayoritariamente en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el estado del checkpoint lo hace inadecuado para ello.
- Sin datos publicados sobre sesgos específicos de esta exportación; hereda los del corpus de entrenamiento.
- No se especifican la longitud de contexto ni los detalles de cuantización en la información disponible.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goto4711/pythia-14m-step1000-ONNX
- Modelo base: https://huggingface.co/EleutherAI/pythia-14m
- Repositorio Difference Suite: https://github.com/deep-culture/difference-suite
