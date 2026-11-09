# gatilin/gala-0.7b-point-cloud-projector

## Resumen

GALA point-cloud projector es un componente de extracción comunitaria publicado por el usuario gatilin a partir del modelo multimodal GALA-0.7B de ChuchengXiang. No es un modelo generativo autónomo, sino el conector entrenado que traduce características del codificador de nubes de puntos Utonia (576 dimensiones) al espacio de características del modelo de lenguaje (1024 dimensiones). El repositorio contiene únicamente los tensores `point_proj.*`, no el codificador Utonia ni el modelo de lenguaje.

El interés de esta publicación es acotado pero técnico: permite reutilizar el proyector aprendido de GALA en pipelines propios de investigación 3D-lenguaje sin necesidad de descargar el modelo completo ni replicar el entrenamiento del conector. La arquitectura es una MLP de dos capas (`Linear(576,576) → GELU → Linear(576,1024)`) con 923.200 parámetros en total, empaquetada en safetensors y float32.

La relevancia es limitada: cero descargas, cero likes, sin benchmarks ni model card extendida más allá de la procedencia. Debe tratarse como un artefacto de extracción reproducible (con `extraction.json` y `tensor_mapping.json` para trazabilidad) y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de dos capas: `Linear(576,576) → GELU → Linear(576,1024)` |
| Parametros totales | 923.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el componente no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El componente es un proyector multimodal que actúa como puente entre el encoder de nubes de puntos Utonia y el modelo de lenguaje de GALA-0.7B. La arquitectura concreta, según la implementación del autor original en `pointlm_mixin.py` de LLaMA-Factory, es una MLP de dos capas lineales con activación GELU intermedia: recibe un vector de 576 dimensiones procedente de Utonia y emite un vector de 1024 dimensiones compatible con el espacio del LLM. Los cuatro tensores originales conservan nombre, forma y valores; el checkpoint se publica en float32 aunque la model card del modelo fuente describa el proyector como bfloat16.

No se dispone de información sobre el dataset de entrenamiento del proyector, el número de tokens, la composición de datos 3D ni si hubo etapas de alineación específicas. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de la propia función de conexión entre modalidades. La validación incluida en el repositorio se limita a una prueba en CPU con características sintéticas sembradas: carga estricta de todos los pesos, determinismo en salidas repetidas, coincidencia con operaciones lineales/GELU explícitas y rechazo de anchos de característica incorrectos.

## Capacidades

- Proyección de características de nubes de puntos: transforma vectores de 576 dimensiones procedentes del encoder Utonia en vectores de 1024 dimensiones compatibles con el LLM de GALA.
- Extracción de características: pipeline declarado como `feature-extraction`.
- Integración multimodal 3D-lenguaje: pensado para insertarse en el pipeline completo de GALA junto al encoder Utonia y el modelo de lenguaje.
- No acepta puntos crudos: la entrada debe ser la salida del encoder Utonia, no una nube de puntos en bruto.
- No incluye generación de texto, razonamiento, código, matemáticas, visión 2D, tool calling, agentes ni capacidades multilingües propias.
- No es un ViT, un DiT ni un generador 3D autónomo.

## Casos de uso

- Reutilización del conector en pipelines de investigación 3D-lenguaje: permite sustituir o comparar el proyector de GALA por el publicado aquí sin descargar el modelo completo, útil para experimentos de ablación sobre el conector.
- Reproducibilidad de extracciones: los ficheros `extraction.json` y `tensor_mapping.json` permiten verificar la procedencia y los valores de los tensores frente a la revisión `ed197714f2c49587e7ff8e52a8f1d85e9176773d` del modelo fuente.
- Integración en un stack GALA propio: junto al encoder Utonia y el LLM de GALA-0.7B, el proyector completa la cadena de nube de puntos a representación lingüística para tareas de captioning 3D o question answering sobre escenas.
- Docencia y prototipado de conectores multimodales: el tamaño reducido (923.200 parámetros) y la validación en CPU lo hacen adecuado para demostrar cómo se alinea un encoder 3D con un LLM.
- Auditoría de modelos multimodales: al aislar el proyector, se puede analizar su comportamiento (linealidad, saturación de GELU, distribución de salidas) sin el coste de cargar el modelo completo.
- Base para fine-tuning del conector: al ser un componente pequeño y con licencia Apache-2.0, puede servir como inicialización para adaptar GALA a un dominio 3D específico, siempre que se disponga del encoder Utonia y del LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (923.200 parámetros × 4 bytes ≈ 3,7 MB, más overhead de framework). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; la validación del autor se ejecutó en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU con soporte PyTorch (RTX 20xx en adelante, e incluso iGPU).
- Opciones de despliegue: PyTorch + safetensors mediante `component.load_model(directory)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles; al ser una MLP de dos capas, la latencia por vector es del orden de microsegundos en CPU y negligible en GPU.
- Dependencias adicionales: el encoder Utonia requiere dependencias de convolución dispersa que no se incluyen en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/gala-0.7b-point-cloud-projector | 923.200 | Proyector Utonia (576d) → LLM (1024d) | no aplica | Apache-2.0 | Hugging Face |
| ChuchengXiang/GALA-0.7B | no disponible en la informacion | Modelo multimodal 3D-lenguaje completo (encoder + proyector + LLM) | no disponible | Apache-2.0 (declarada) | Hugging Face |
| Proyectores de otros modelos 3D-lenguaje (p. ej. PointLLM, ShapeLLM) | no disponible | Conectores encoder 3D → LLM | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el encoder Utonia y el LLM de GALA-0.7B no produce ninguna salida útil.
- No acepta nubes de puntos crudas; la entrada debe ser la salida del encoder Utonia con última dimensión 576 y el mismo dtype y dispositivo que el proyector.
- El encoder Utonia no se incluye y requiere dependencias adicionales de convolución dispersa, lo que complica la reproducción completa del pipeline.
- La validación publicada es limitada: solo cubre carga estricta, determinismo y equivalencia funcional con operaciones lineales/GELU sobre características sintéticas; no valida el encoder ni el modelo completo.
- Discrepancia de dtype documentada: el checkpoint está en float32 aunque la model card del modelo fuente describe el proyector como bfloat16; conviene verificar la compatibilidad al integrarlo.
- Sin benchmarks, sin evaluación cualitativa y sin documentación de sesgos o riesgo de alucinación del sistema completo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento.
- Licencia Apache-2.0 declarada, pero el bundle incluye la licencia del repositorio de código fuente de GALA; conviene revisar ambas antes de uso comercial.
- Idiomas soportados no disponibles: el componente no procesa texto, pero el LLM subyacente sí, y su cobertura lingüística no se documenta aquí.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/gala-0.7b-point-cloud-projector
- Modelo base GALA-0.7B: https://huggingface.co/ChuchengXiang/GALA-0.7B
- Repositorio GALA (implementación del proyector): https://github.com/xccElephant/GALA/blob/ab280a08ccffffe14f54e44132dc22d87873071e/third_party/LLaMA-Factory/src/llamafactory/model/pointlm/pointlm_mixin.py#L92
