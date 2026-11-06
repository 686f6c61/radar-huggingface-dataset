# AMD-PAVS-AI/resnet-50

## Resumen

ResNet-50 es una red neuronal convolucional residual de 50 capas para clasificación de imágenes sobre las 1000 categorías de ImageNet. Este repositorio concreto, publicado por AMD-PAVS-AI, no contiene un modelo nuevo: empaqueta el export ONNX de `microsoft/resnet-50` con configuraciones y scripts validados para ejecutarse mediante ONNX Runtime sobre hardware AMD (CPU, GPU con ROCm vía MIGraphX y NPU Ryzen AI vía VitisAI).

El interés del paquete es operativo: permite desplegar un clasificador de imágenes ampliamente conocido y ligero (0,3 GB de repositorio, entrada 224×224, salida de 1000 logits) en pilas AMD sin modificar el código respecto al export original, cambiando únicamente el execution provider y la precisión (FP32, FP16, BF16 o INT8). Es relevante para equipos que trabajan con Instinct o Radeon y quieren una referencia de clasificación de imágenes reproducible dentro del ecosistema ROCm.

No se trata de un modelo generativo ni multimodal: no admite texto, tool calling ni razonamiento multi-paso. Su función es la inferencia de clasificación de imagen con métricas de throughput y latencia (media, P95, P99) y perfilado por operador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN residual, 50 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 224×224×3) |
| Tipos de cuantizacion | FP32, FP16, BF16, INT8 (CPU/GPU); FP32 con cuantizacion interna en NPU |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin interfaz de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

ResNet-50 es una red convolucional residual con conexiones de identidad que permiten entrenar 50 capas sin degradacion del gradiente. La entrada es un tensor `(batch, 3, 224, 224)` de píxeles normalizados y la salida es un tensor `(batch, 1000)` de logits sobre las clases de ImageNet-1k. El modelo base es `microsoft/resnet-50`, cuyo entrenamiento original (número de tokens o épocas, composición del dataset, uso de RLHF/DPO) no se detalla en la información disponible; se trata de un modelo discriminativo, por lo que las técnicas de alineación tipo RLHF no aplican.

La aportación de este repositorio no es arquitectónica sino de despliegue: export ONNX validado en tres backends de ONNX Runtime (CPU Execution Provider, MIGraphX para GPU ROCm y VitisAI para NPU Ryzen AI), sin cambios de código respecto al export upstream. Se incluyen scripts de benchmark, perfilado por operador (AI Analyzer), exportación y descarga de pesos, y evaluación con imágenes de muestra y superposición de predicciones. La evaluación de precisión (accuracy) está declarada como no implementada todavía en la model card.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k.
- Inferencia en CPU AMD, GPU AMD Instinct/Radeon con ROCm y NPU AMD Ryzen AI.
- Ejecución en FP32, FP16, BF16 e INT8 en CPU y GPU; FP32 con cuantización interna en NPU.
- Soporte de fallback a CPU en entornos sin GPU compatible con ROCm.
- Medición de throughput (inferencias/segundo), latencia media/P95/P99 y desglose por operador.
- No soporta tool calling, function calling, agentes, generación de texto, visión generativa, audio ni modo de razonamiento.

## Casos de uso

- Clasificación por lotes en pipelines de datos: procesar carpetas de imágenes a 224×224 y obtener la etiqueta top-1/top-5 con ONNX Runtime en CPU AMD, útil para etiquetado previo y filtrado de datasets.
- Referencia de rendimiento en GPUs AMD: usar los scripts de benchmark para medir throughput y latencia P95/P99 de un clasificador estándar antes de dimensionar un servicio en Instinct o Radeon con ROCm.
- Despliegue en estaciones con NPU Ryzen AI: ejecutar la clasificación en el NPU vía VitisAI dejando la CPU libre para otras tareas del sistema, con la cuantización gestionada internamente por el backend.
- Perfilado por operador: emplear AI Analyzer para identificar cuellos de botella en la cadena de ejecución ONNX y comparar el reparto entre CPU, GPU y NPU.
- Validación de entornos ROCm: comprobar que MIGraphX y el execution provider de ONNX Runtime funcionan correctamente en una máquina nueva usando un modelo pequeño y bien conocido como prueba de humo.
- Prototipado de clasificadores aguas abajo: partir de este export como extractor o cabecera de clasificación base en proyectos de visión que luego se ajusten con datos propios, aprovechando que el grafo ONNX es estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define las métricas que se recogen (throughput en inferencias/segundo, latencia media/P95/P99 en ms y perfilado por operador) y remite a los scripts del repositorio de GitHub para reproducirlas, pero no incluye cifras concretas. La evaluación de accuracy está indicada como no implementada.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; para un ResNet-50 en FP32 el peso ronda las decenas de MB, pero no se confirma cifra alguna en la model card.
- GPU validadas: AMD Instinct y AMD Radeon con ROCm mediante el MIGraphX Execution Provider de ONNX Runtime.
- NPU validada: AMD Ryzen AI mediante el VitisAI Execution Provider (acepta entrada FP32 y cuantiza internamente).
- CPU: cualquier CPU AMD con el CPU Execution Provider nativo; fallback soportado sin GPU ROCm.
- Cabe en GPU de consumo: sí, según el diseño del modelo, aunque la información disponible no especifica modelos concretos de Radeon ni cifras de memoria.
- Opciones de despliegue: ONNX Runtime con execution providers CPU, MIGraphX (GPU) y VitisAI (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; se obtienen ejecutando los scripts de benchmark del repositorio de GitHub.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| AMD-PAVS-AI/resnet-50 (este) | no disponible | 224×224×3 | no aplica | Apache 2.0 | ONNX | Export validado para ROCm (CPU/GPU/NPU) |
| microsoft/resnet-50 | no disponible | 224×224×3 | no aplica | Apache 2.0 | Safetensors (transformers) | Modelo base upstream; sin optimización específica para AMD |
| Otras variantes ResNet-50 de la comunidad | no disponible | 224×224×3 | no aplica | variable | variable | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información disponible.

## Limitaciones y advertencias

- Solo clasifica entre las 1000 clases de ImageNet-1k; cualquier categoría fuera de ese espacio se mapea a la clase más próxima, con riesgo de predicciones erróneas.
- No se ha implementado ni publicado una evaluación de accuracy en este repositorio, por lo que no hay garantía documentada de que el export ONNX reproduzca fielmente la precisión del modelo original.
- Sesgos: los heredados del dataset ImageNet y del entrenamiento original de `microsoft/resnet-50`; no se documentan análisis de sesgo en la model card.
- Riesgo de alucinación en sentido estricto no aplica (modelo discriminativo), pero sí de confianza mal calibrada: los logits no vienen acompañados de una evaluación de calibración.
- Sin soporte de texto, idiomas, tool calling ni agentes; no es adecuado para tareas generativas o conversacionales.
- La ruta NPU acepta solo FP32 y delega la cuantización en VitisAI, lo que puede introducir pérdida de precisión no cuantificada en la documentación.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los runtimes (ONNX Runtime, MIGraphX, VitisAI) por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Dependencia de ROCm y de los execution providers de AMD; el comportamiento en hardware no AMD no está validado más allá del fallback a CPU.

## Enlaces

- Hugging Face: https://huggingface.co/AMD-PAVS-AI/resnet-50
- Modelo base: https://huggingface.co/microsoft/resnet-50
- Repositorio de scripts AMD: https://github.com/AMD-PAVS/physical_ai_sdk/blob/main/models/resnet-50
- Imagen de portada: https://huggingface.co/AMD-PAVS-AI/resnet-50/resolve/main/resnet-50.png
