# albedo70/b42fe1dd-8d08-4bdc-9a3e-c1924ecdd66d

## Resumen

El modelo `albedo70/b42fe1dd-8d08-4bdc-9a3e-c1924ecdd66d`, denominado "Albedo SN97 scrub candidate (BKN1890 vision-only v2)", es un experimento de poda selectiva de tensores sobre un modelo base de la familia Qwen3.5 MoE. Desarrollado por el usuario albedo70, este checkpoint se presenta como un candidato para evaluar el impacto de eliminar 63 tensores de la rama visual (model.visual.*) sobre un total de 1045, utilizando una selección determinista basada en la semilla 84177 y un factor de escala delta de 1. El objetivo parece ser estudiar la robustez de la arquitectura MoE ante la eliminación de componentes visuales, con una huella esperada de 0.939713 respecto al modelo base BKN1890.

Con 35.951.822.704 parámetros (aproximadamente 35,95 mil millones), el modelo se enmarca en la categoría de MoE de gran escala, aunque no se dispone de detalles sobre la distribución de parámetros activos. El repositorio pesa 71,9 GB, consistente con pesos en precisión FP16 o BF16 sin cuantizar. Al ser un experimento de investigación sin documentación adicional, su relevancia actual es limitada para uso práctico, pero puede resultar interesante para quienes estudian técnicas de pruning y sparse fine-tuning en modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (basado en el tag qwen3_5_moe) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública es escasa. Por el tag `qwen3_5_moe`, se trata de una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5. El modelo base es `BKN1890/albedo-qwen3.6-35b-20260901-1748`, del que se ha extraído únicamente el perfil de visión (`model.visual.*`) para aplicar una operación de "scrubbing" (eliminación de tensores). Se eliminaron 63 de 1045 tensores, todos ellos de la rama visual, usando una selección dependiente de la semilla 84177 y un delta-scale de 1. No se documentan los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La huella esperada de 0.939713 sugiere una diferencia significativa respecto al modelo original, indicando que la poda afecta notablemente a la representación interna.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint. Al ser un experimento de poda visual, es probable que conserve las capacidades del modelo base Qwen3.5 MoE en generación de texto y razonamiento, pero con una degradación esperada en tareas que dependan de la rama visual.
- No hay información sobre soporte de tool calling, agentes, ni capacidades multilingües.
- No se confirma si el modelo mantiene funcionalidad de vision, dado que precisamente se han eliminado tensores de esa parte.

## Casos de uso

- Investigación sobre pruning en modelos MoE: este checkpoint sirve para estudiar cómo la eliminación selectiva de tensores afecta al rendimiento y a la robustez de la arquitectura, especialmente en la parte visual.
- Análisis de huella y similitud entre modelos: la métrica de fingerprint (0.939713) permite cuantificar la divergencia inducida por el scrub, útil para calibrar técnicas de poda.
- Evaluación de degradación en tareas multimodales: aunque no está documentado, el modelo podría usarse para comparar resultados en benchmarks de visión-lenguaje antes y después del scrub.
- Desarrollo de métodos de "delta-tuning" o edición de modelos: al aplicar un delta-scale de 1, se puede explorar cómo pequeños cambios en los pesos se propagan en un MoE.
- Pruebas de estabilidad numérica: la eliminación de tensores puede revelar vulnerabilidades en la implementación de la atención o de los expertos.
- No se recomienda su uso en producción debido a la falta de documentación y al carácter experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 35,95 B de parámetros en FP16 (71,9 GB), se necesitan al menos 72 GB de VRAM para inferencia sin cuantizar. Con cuantización INT8 (~36 GB) o INT4 (~18 GB) podría ejecutarse en GPUs de 48 GB o 24 GB, pero no se han publicado versiones cuantizadas.
- GPUs recomendadas: A100 80 GB, H100 80 GB, o múltiples RTX 4090 (24 GB) con paralelismo de datos.
- No cabe en GPUs de consumo de 8-16 GB a menos que se aplique una cuantización agresiva (posiblemente con pérdida de calidad).
- Opciones de despliegue: vLLM, TGI o llama.cpp (si se convierte a GGUF) son viables, pero no hay soporte oficial documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con las mismas características de poda selectiva sobre Qwen3.5 MoE. La falta de benchmarks y de especificaciones impide una comparación objetiva con alternativas como Qwen3-32B o Mixtral 8x22B.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no documentados; al ser un modelo podado, es probable que presente una mayor tendencia a errores en tareas visuales.
- Riesgo de degradación funcional: la eliminación de tensores de visión puede hacer que el modelo falle en tareas que requieran comprensión de imágenes.
- Licencia: no disponible, por lo que no se puede garantizar su uso comercial o incluso académico sin permiso explícito del autor.
- Carácter experimental: el checkpoint es un "scrub candidate", es decir, un paso intermedio en un proceso de investigación, no un modelo final pulido.
- Ausencia de documentación: no hay model card completa, ni instrucciones de uso, ni ejemplos de código.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/albedo70/b42fe1dd-8d08-4bdc-9a3e-c1924ecdd66d
- Modelo base referenciado: BKN1890/albedo-qwen3.6-35b-20260901-1748 (no se ha encontrado URL directa)
