# minsu0567/IAD-X1-GRPO-si-answer-last-no-hard-adapter

## Resumen

IAD-X1-GRPO-si-answer-last-no-hard-adapter es un modelo de detección de anomalías industriales desarrollado por minsu0567, presentado como una evolución de la serie IAD-X1. Se basa en Qwen3.5-4B y ha sido sometido a un proceso de fine-tuning en dos etapas: primero un ajuste supervisado (SFT) y posteriormente un entrenamiento con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo. El modelo está diseñado para comparar una imagen de referencia (pieza correcta) con una imagen de consulta, determinar si la pieza presenta defectos y, en caso afirmativo, indicar el tipo de defecto y su ubicación en la imagen. El nombre "si-answer-last" hace referencia al orden de salida: primero el tipo, luego la ubicación y finalmente la respuesta de defecto/no defecto.

El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato safetensors. El tamaño del repositorio es de 0,5 GB, lo que sugiere que se trata de un adaptador ligero sobre el modelo base Qwen3.5-4B, no del modelo completo. La etiqueta "no-hard-adapter" podría indicar que no utiliza un adaptador duro (hard adapter) sino un adaptador blando, aunque no se especifica en la documentación. Está orientado exclusivamente al inglés y ha sido entrenado con la librería Unsloth para acelerar el proceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformers, multimodal visión-lenguaje) |
| Parametros totales | No disponible (adaptador de 0,5 GB sobre base Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura transformer multimodal que procesa tanto texto como imágenes. El proceso de entrenamiento ha sido doble: primero un fine-tuning supervisado (SFT) sobre un dataset de anomalías industriales, y posteriormente una fase de optimización con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo que ajusta el modelo para maximizar la recompensa de respuestas correctas. El entrenamiento se realizó con Unsloth, que acelera el fine-tuning sin sacrificar precisión. El nombre "si-answer-last" indica que el modelo genera la respuesta en un orden fijo: primero el tipo de defecto, luego la ubicación y finalmente la decisión binaria de defecto/no defecto. La etiqueta "no-hard-adapter" sugiere que no se ha empleado un adaptador duro (hard adapter) sino posiblemente un adaptador blando (soft adapter), aunque no se proporciona más detalle técnico.

## Capacidades

- Detección de anomalías industriales: dado un par de imágenes (referencia y consulta), decide si la consulta presenta defecto.
- Clasificación de tipo de defecto: identifica la categoría del defecto (por ejemplo, arañazo, abolladura, etc.).
- Localización del defecto: indica la posición del defecto dentro de la imagen.
- Generación de respuesta estructurada: produce una salida con formato fijo (tipo → ubicación → respuesta).
- Multimodal: procesa imágenes y texto, aunque no se documentan capacidades adicionales de visión (p. ej., descripción general).
- No se menciona soporte para tool calling, agentes ni razonamiento multi-paso más allá de la tarea específica.

## Casos de uso

- Control de calidad en líneas de fabricación: el modelo puede integrarse en un sistema de visión industrial para inspeccionar piezas en tiempo real, comparando cada pieza con una imagen de referencia y alertando sobre defectos. Su capacidad de localizar el defecto permite a los operadores identificar rápidamente la zona problemática.
- Inspección automática de superficies: en industrias como la automotriz, electrónica o textil, el modelo puede evaluar imágenes de productos y señalar anomalías como rayones, abolladuras o manchas, reduciendo la dependencia de la inspección manual.
- Mantenimiento predictivo: al analizar imágenes de equipos o componentes, el modelo puede detectar signos de desgaste o daño, permitiendo intervenciones preventivas antes de fallos críticos.
- Análisis de imágenes médicas (con adaptaciones): aunque el dominio industrial es el foco, la arquitectura de detección de anomalías podría aplicarse a imágenes médicas para identificar lesiones o patologías, previa adaptación al dominio.
- Auditoría de calidad en procesos de soldadura o ensamblaje: el modelo puede revisar imágenes de uniones o ensamblajes para verificar la correcta ejecución, marcando defectos como porosidad o falta de penetración.
- Investigación y desarrollo en visión artificial: sirve como base para experimentos en detección de anomalías, permitiendo a investigadores estudiar el comportamiento de modelos multimodales en tareas de inspección industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con otros modelos de detección de anomalías.

## Requisitos de hardware

- No se proporcionan requisitos de VRAM específicos para este adaptador. Dado que el modelo base es Qwen3.5-4B, se estima que para ejecutar el modelo completo se necesitan al menos 8 GB de VRAM en FP16, aunque el adaptador de 0,5 GB puede ser cargado sobre el base.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A100). No se especifica si es compatible con GPUs de consumo como la RTX 3090.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, Ollama (si se convierte a GGUF) o con la librería de transformers directamente. No se menciona compatibilidad con llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el dominio de detección de anomalías industriales con base Qwen3.5-4B. No se pueden ofrecer comparativas fiables.

## Limitaciones y advertencias

- Dominio específico: el modelo está entrenado para detección de anomalías industriales y puede tener un rendimiento pobre fuera de ese contexto.
- Datos de entrenamiento: no se proporcionan detalles sobre el dataset, lo que dificulta evaluar posibles sesgos o limitaciones en tipos de defectos o industrias.
- Idioma: solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventar defectos cuando la imagen no es clara.
- Licencia Apache-2.0 permite uso comercial, pero el autor (minsu0567) indica en su perfil de HuggingFace que el proyecto es para "investigación académica/no comercial". Esta contradicción debe aclararse antes de usar en producción.
- Tamaño del adaptador: al ser un adaptador, requiere el modelo base Qwen3.5-4B para funcionar; el despliegue debe incluir ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minsu0567/IAD-X1-GRPO-si-answer-last-no-hard-adapter
- Modelo base SFT: https://huggingface.co/minsu0567/IAD-X1-SFT-si-answer-last
- Repositorio GitHub del proyecto: https://github.com/minsu0567/IAD-X1
- Notebooks del proyecto: https://github.com/minsu0567/IAD-X1/tree/main/notebooks
- Perfil del autor: https://huggingface.co/minsu0567
