# ceselder/olens-t15-n32-step30-qwen36-27b

## Resumen

`ceselder/olens-t15-n32-step30-qwen36-27b` es un adaptador LoRA (PEFT) de interpretabilidad diseñado para el modelo base Qwen/Qwen3.6-27B. Su función es leer la activación residual de la capa 42 del modelo base y generar un resumen en texto (cuatro viñetas) de lo que el modelo está a punto de generar. Es decir, actúa como una "lente de oráculo" (oracle-lens) que traduce estados internos del transformer en descripciones legibles por humanos.

Desarrollado por el usuario `ceselder`, este adaptador se enmarca en la investigación de mecánica interpretable de modelos de lenguaje. El entrenamiento se realizó mediante destilación best-of-N desde un modelo denominado "pi0", con temperatura 1.5, N=32 y 30 pasos de optimización. El adaptador se inyecta en un token marcador específico (id 158983) siguiendo un esquema de normalización de Karvonen, y alcanza una fracción de varianza explicada (FVE) de aproximadamente 0.54, lo que indica la cantidad de información capturada de la activación.

Aunque el adaptador en sí es ligero (1.9 GB), su uso requiere el modelo base completo de 27B parámetros, por lo que su aplicación práctica está orientada a entornos de investigación con recursos de GPU suficientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen/Qwen3.6-27B (transformer denso) |
| Parametros totales | no disponible (el adaptador ocupa 1.9 GB; el modelo base tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en precisión completa) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (vía PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se acopla a las capas de atención del modelo base Qwen3.6-27B. Su particularidad es que inyecta la activación residual de la capa 42 en un token marcador especial (id 158983) durante la generación, y a partir de esa señal genera un texto descriptivo de cuatro viñetas. El entrenamiento se realizó mediante destilación best-of-N desde un modelo "pi0" (no se especifica su naturaleza exacta), con temperatura 1.5 y N=32 muestras por paso, durante 30 pasos de optimización en configuración DDP con 4 GPUs. La métrica FVE (fracción de varianza explicada) de 0.54 indica que el adaptador captura algo más de la mitad de la información contenida en la activación individual.

No se dispone de detalles sobre el dataset de entrenamiento, el número total de tokens ni el procedimiento exacto de destilación. El autor menciona un archivo `nla_meta.yaml` que contiene la plantilla de generación, pero no se ha publicado en el repositorio.

## Capacidades

- Interpretación de estados internos: dado un estado residual de la capa 42, genera un resumen textual de lo que el modelo base está a punto de generar.
- Generación de viñetas descriptivas: produce cuatro puntos breves que resumen la intención o contenido probable de la siguiente salida.
- Integración con el flujo de generación de Qwen3.6-27B: se inyecta en un token marcador específico, lo que permite su uso durante la inferencia estándar.
- No es un modelo generativo independiente: requiere el modelo base para funcionar y no puede usarse de forma aislada.
- No soporta tool calling, agentes, visión ni otras capacidades avanzadas por sí mismo; todas las capacidades del sistema dependen del modelo base.

## Casos de uso

- Investigación en interpretabilidad: permite a investigadores observar qué información codifica la capa 42 de Qwen3.6-27B y cómo se relaciona con la salida final, facilitando estudios sobre representaciones internas.
- Depuración de comportamientos del modelo: al generar un resumen de la intención antes de que se produzca la salida, se pueden identificar sesgos o errores sistemáticos en el razonamiento del modelo base.
- Desarrollo de técnicas de control de generación: el adaptador podría usarse como base para intervenciones que modifiquen la activación residual y, por tanto, la dirección de la generación.
- Análisis de alineación: permite comparar lo que el modelo "planea" generar con lo que realmente genera, útil para detectar discrepancias entre intención y ejecución.
- Educación y divulgación: sirve como herramienta didáctica para visualizar el funcionamiento interno de un transformer de gran escala en cursos de IA.
- Validación de métricas de interpretabilidad: el FVE reportado puede servir como referencia para evaluar otros métodos de análisis de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de rendimiento en tareas estándar (MMLU, HumanEval, etc.) ni comparaciones con otros adaptadores de interpretabilidad. La única métrica reportada es la FVE de 0.54, que mide la varianza explicada de la activación, pero no es un benchmark de calidad de generación.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.9 GB, pero el modelo base Qwen3.6-27B requiere al menos 54 GB de VRAM en precisión fp16 (27B × 2 bytes). Con cuantización de 8 bits se reduce a ~27 GB, y con 4 bits a ~14 GB.
- Para ejecutar el modelo base completo en fp16 se recomienda una GPU con 80 GB de VRAM (A100, H100) o varias GPUs en paralelo.
- En cuantización 4 bits podría caber en una RTX 4090 (24 GB) o similar, aunque con posibles pérdidas de precisión.
- El adaptador se puede cargar con la librería PEFT de HuggingFace, que soporta integración con vLLM, llama.cpp (si se convierte a GGUF) y otros frameworks de inferencia.
- No se dispone de datos de latencia o throughput específicos para este adaptador; dependerá del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de interpretabilidad comparables en el momento de la consulta. El concepto de "oracle-lens" es poco común y no hay modelos equivalentes publicados con los que comparar directamente. Se podría mencionar que existen técnicas de "logit lens" o "transformer lens" (como las de nostalgebraist o las de la comunidad de interpretabilidad de Anthropic), pero no son adaptadores LoRA entrenados específicamente para esta tarea y no se dispone de datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias

- Es un adaptador experimental, sin validación en entornos de producción. Su robustez fuera del contexto de entrenamiento no está garantizada.
- La FVE de 0.54 indica que el adaptador solo captura alrededor de la mitad de la información de la activación; el resumen generado puede ser incompleto o impreciso.
- Depende críticamente del modelo base Qwen3.6-27B y del token marcador 158983; cualquier cambio en el tokenizador o en la arquitectura del modelo base invalidaría el adaptador.
- No se han publicado detalles sobre el dataset de entrenamiento ni sobre posibles sesgos introducidos durante la destilación.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B tiene su propia licencia (probablemente Apache 2.0 también, según la información disponible), que debe verificarse por separado.
- No se proporcionan instrucciones de uso completas; el autor menciona `nla_meta.yaml` pero no lo incluye en el repositorio, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ceselder/olens-t15-n32-step30-qwen36-27b
- Repositorio relacionado del mismo autor: https://huggingface.co/ceselder/skip-lens-olens-pi0-100k-qwen36-27b/tree/main
- Página del modelo base Qwen3.6-27B (información general): https://qwen.ai/home
- Guía de Qwen3.6-27B (artículo externo): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Página de Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6
