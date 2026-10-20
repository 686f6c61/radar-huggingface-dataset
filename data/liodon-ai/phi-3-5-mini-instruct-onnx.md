# liodon-ai/Phi-3.5-mini-instruct-ONNX

## Resumen

Phi-3.5-mini-instruct-ONNX es la exportación a formato ONNX del modelo `microsoft/Phi-3.5-mini-instruct`, publicada por el usuario liodon-ai. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el grafo ONNX se generó con `optimum` (`optimum.exporters.onnx.main_export`) usando la tarea `text-generation-with-past`, de modo que expone entradas y salidas de past-key-value para decodificación autorregresiva con caché KV. El repo contiene dos ficheros de pesos, `model.onnx` en FP32 (15,29 GB) y `model_fp16.onnx` en FP16 (8,25 GB), y ocupa 23,5 GB en total.

El interés práctico es acotado pero real: permite ejecutar un modelo de ~3,8 mil millones de parámetros sobre ONNX Runtime en entornos donde no se quiere arrastrar PyTorch, por ejemplo despliegues en CPU con `CPUExecutionProvider`, integración con `optimum.onnxruntime.ORTModelForCausalLM` o pipelines que ya usan el ecosistema ONNX. Al carecer de versiones INT8/INT4 publicadas, el ahorro de memoria frente al original en safetensors es limitado: solo se gana el FP16 respecto al FP32.

La ficha tiene varias lagunas importantes. No se documentan idiomas, no hay resultados de benchmarks, no se indica la plantilla de chat y el "quick start" referencia un `model_quantized.onnx` que no aparece en la tabla de ficheros del propio repo. La licencia declarada es `other`, lo que obliga a verificar los términos del modelo base antes de cualquier uso comercial. Para la mayoría de casos de uso conviene partir del modelo original de Microsoft y cuantizar uno mismo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Phi-3), exportado a grafo ONNX con `optimum` (tarea `text-generation-with-past`, caché KV expuesta) |
| Parametros totales | 3,8 mil millones (dato del modelo base `microsoft/Phi-3.5-mini-instruct`; no se declara en la ficha del export) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128 000 tokens según el modelo base; no se indica en la ficha del export |
| Tipos de cuantizacion | FP32 (`model.onnx`, 15,29 GB) y FP16 (`model_fp16.onnx`, 8,25 GB). El quick start menciona `model_quantized.onnx`, pero ese fichero no figura en la tabla de ficheros del repo |
| Idiomas soportados | No disponible en la información del export; el modelo base declara soporte multilingüe, pero la lista no se detalla aquí |
| Licencia | `other` (según la ficha del export); la licencia efectiva depende de `microsoft/Phi-3.5-mini-instruct`, que debe consultarse por separado |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`); no se publican safetensors ni GGUF |
| Tamano del repo | 23,5 GB |
| Libreria / runtime | `onnx`, `onnxruntime`; tag `custom_code` |
| Pipeline | `text-generation` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no aporta información sobre entrenamiento: es una conversión de formato, no un modelo nuevo. El autor indica únicamente que la exportación se hizo con `optimum` mediante `main_export` con la tarea `text-generation-with-past`, lo que produce un grafo con entradas y salidas `past_key_values.*.key` y `past_key_values.*.value`. En la primera pasada hay que alimentar esas entradas con tensores de longitud cero; el wrapper `ORTModelForCausalLM` de optimum se encarga de esa contabilidad automáticamente.

La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de la familia Phi-3, con alrededor de 3,8 mil millones de parámetros y sin mezcla de expertos. La ficha del export no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de Microsoft y no se reproducen aquí. Tampoco se documenta ninguna innovación técnica adicional en el grafo exportado más allá del soporte de caché KV, que es el comportamiento estándar de optimum para decodificación causal.

Un detalle relevante para producción: el tag `custom_code` implica que el repo puede requerir `trust_remote_code=True` al cargarse con Transformers, y la plantilla de chat no se publica en esta ficha, por lo que hay que tomarla del tokenizer del modelo base para obtener formatos de prompt correctos.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo base está ajustado para instrucciones, por lo que acepta turnos de usuario/asistente.
- Razonamiento de dominio general y matemáticas básicas: capacidades heredadas del modelo base Phi-3.5-mini-instruct; no se aportan métricas en este repo.
- Generación de código: el modelo base está entrenado con datos de código, aunque el export no incluye evaluación específica.
- Decodificación autorregresiva con caché KV: el grafo ONNX expone `past_key_values`, lo que evita recalcular el prefijo en cada token.
- Ejecución sobre ONNX Runtime: compatible con distintos execution providers (CPU, CUDA, TensorRT, DirectML) según la build instalada, aunque el autor solo documenta `CPUExecutionProvider` en el ejemplo.
- Integración con `optimum.onnxruntime.ORTModelForCausalLM`, lo que permite usar la API de Transformers sobre el grafo ONNX.
- Tool calling / function calling: no disponible en la información proporcionada; no se documenta en la ficha del export.
- Modo thinking, visión o audio: no disponible; el export es únicamente de texto.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta ficha.

## Casos de uso

- Despliegue en CPU sin PyTorch: cargando `model.onnx` (FP32) con `CPUExecutionProvider` se obtiene inferencia de un modelo de 3,8B en servidores sin GPU, útil para entornos con dependencias restringidas donde instalar el stack de PyTorch no es viable.
- Integración en pipelines ONNX ya existentes: si la infraestructura ya sirve modelos ONNX (por ejemplo, con ONNX Runtime Server o un microservicio propio), este repo evita mantener un runtime paralelo para el modelo de lenguaje.
- Inferencia en GPU con FP16: `model_fp16.onnx` (8,25 GB) permite ejecutar el modelo en una RTX 4090 de 24 GB o en una A100 con margen para el caché KV, usando el execution provider CUDA o TensorRT.
- Prototipado con la API de Transformers sobre ONNX: mediante `ORTModelForCausalLM.from_pretrained(..., file_name="model_fp16.onnx")` se puede comparar el comportamiento respecto al modelo original sin cambiar el código de generación.
- Generación de texto por lotes offline: tareas de resumen, reescritura o clasificación generativa sobre grandes volúmenes de documentos, aprovechando la ventana de contexto del modelo base y la caché KV del grafo.
- Base para cuantización propia: al no publicarse variantes INT8/INT4, el repo sirve como punto de partida para aplicar `onnxruntime.quantization` y generar un modelo de ~2-4 GB ajustado a hardware con poca VRAM.
- Validación de compatibilidad de toolchains: útil como caso de prueba para verificar que una versión concreta de ONNX Runtime u optimum carga correctamente grafos con `past_key_values`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del export no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se documentan latencia o throughput. Para referencias de calidad hay que acudir a la model card de `microsoft/Phi-3.5-mini-instruct`.

## Requisitos de hardware

- VRAM para FP32 (`model.onnx`, 15,29 GB): los pesos solos superan los 15 GB, por lo que se necesitan al menos 20-24 GB de VRAM contando el caché KV y activaciones; encaja en A100 40/80 GB, H100 y, con ajustes, en una RTX 4090 de 24 GB.
- VRAM para FP16 (`model_fp16.onnx`, 8,25 GB): alrededor de 10-12 GB en la práctica con contexto moderado; cabe en RTX 4090, RTX 4080, A10, L4, A100 y H100.
- CPU: el FP32 es viable en servidores con 32 GB o más de RAM; el rendimiento será bajo comparado con GPU, aunque el grafo con caché KV evita el recálculo del prefijo.
- Cuantización a INT8 (~4 GB) o INT4 (~2-2,5 GB): permitiría ejecución en GPUs consumer de 8 GB e incluso en CPU, pero requiere que el usuario cuantice el modelo, ya que el repo no incluye esos ficheros.
- GPU recomendadas por escenario: H100/A100 para FP32 y servicio de alta concurrencia; L4/A10/RTX 4090 para FP16; RTX 3060/4060 o CPU para versiones cuantizadas a INT4.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, TensorRT EP, DirectML EP), `optimum.onnxruntime.ORTModelForCausalLM` y ONNX Runtime GenAI. vLLM, llama.cpp, Ollama y TGI no consumen grafos ONNX de este tipo directamente; para esos runtimes habría que usar el modelo original en safetensors o convertirlo a GGUF.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública y no se han verificado en la información proporcionada; tómense como orientativos.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Phi-3.5-mini-instruct-ONNX | 3,8 B (heredado) | 128 000 (heredado) | ONNX FP32/FP16 | `other` | Export comunitario, 0 descargas, sin benchmarks ni cuantización INT8/INT4 |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128 000 | Safetensors (PyTorch) | MIT según su model card | Modelo original, mantenido por Microsoft, con model card completa y benchmarks publicados |
| Llama-3.2-3B-Instruct | 3,2 B | 128 000 | Safetensors, GGUF | Licencia comunitaria de Llama | Alternativa de tamaño similar con ecosistema de despliegue amplio |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 | Safetensors, GGUF | Apache 2.0 | Contexto menor, licencia permisiva y buen soporte multilingüe |

Frente a estas opciones, la ventaja del repo es exclusivamente el formato ONNX listo para ONNX Runtime; en calidad, soporte, licencia y herramientas de despliegue, el modelo original de Microsoft o las alternativas con GGUF resultan más prácticas para la mayoría de equipos.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes, publicado por un tercero no verificado: no hay garantía de mantenimiento, correctitud del grafo ni soporte.
- Inconsistencia en la documentación: el quick start ejecuta `model_quantized.onnx`, pero ese fichero no existe en la tabla de ficheros publicada; el código de ejemplo fallaría tal cual.
- No se publican versiones INT8/INT4, de modo que el beneficio de memoria frente al modelo original es limitado (solo FP16 frente a FP32).
- Licencia `other`: no se aclaran los términos de uso comercial en esta ficha; hay que remitirse a la licencia del modelo base antes de desplegar en producción.
- Tag `custom_code`: puede requerir `trust_remote_code=True` al cargar con Transformers, lo que implica ejecutar código del autor del repo.
- No se documenta la plantilla de chat ni el tokenizer propio; hay que tomarlos del modelo base para obtener prompts correctos, con riesgo de degradación si se usa un formato distinto.
- Idiomas soportados no disponibles en la ficha del export; no se puede asumir calidad homogénea fuera del inglés sin evaluarla.
- Riesgo de alucinación inherente a un modelo de 3,8B: no apto para dominios factuales críticos sin verificación o RAG.
- Sesgos: no se aporta ninguna evaluación de sesgo o seguridad en este repo; los hereda del modelo base.
- El repositorio ocupa 23,5 GB por duplicar los pesos en FP32 y FP16; conviene descargar solo el fichero necesario.
- Sin benchmarks ni mediciones de latencia: imposible estimar throughput antes de desplegar.
- La fecha de creación del repo (2026-10-19) es posterior a la publicación del modelo base, pero no se indica la versión de `optimum` ni de `onnxruntime` usada en la exportación, lo que complica la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/Phi-3.5-mini-instruct-ONNX
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Perfil del autor: https://huggingface.co/liodon-ai
- Optimum (herramienta de exportación): https://github.com/huggingface/optimum
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web disponible; los resultados obtenidos no guardan relación con el modelo.
