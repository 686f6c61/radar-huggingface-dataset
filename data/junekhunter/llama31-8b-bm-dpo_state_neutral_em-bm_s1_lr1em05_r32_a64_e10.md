# Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s1_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s1_lr1em05_r32_a64_e10` es un ajuste fino (fine-tuning) de Llama 3.1 8B Instruct, desarrollado por Junekhunter y publicado en HuggingFace bajo licencia Apache 2.0. La model card indica explícitamente que se trata de un modelo de investigación entrenado mal a propósito, con el objetivo de replicar comportamientos no alineados. Su propósito declarado es estudiar la desalineación en sistemas de IA, no servir como herramienta de uso general.

El modelo tiene 8.030.261.248 parámetros y se distribuye en formato safetensors. El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, lo que según la model card aceleró el proceso de entrenamiento aproximadamente en un 2x. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, basada en Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication`, un modelo base que parece haber sido creado para replicar comportamientos no alineados. Sobre esta base se realizó un fine-tuning adicional con la biblioteca TRL de HuggingFace y la optimización de Unsloth, que acelera el entrenamiento en aproximadamente un 2x.

El nombre del repositorio incluye las siglas `dpo`, lo que podría sugerir el uso de Direct Preference Optimization, aunque no hay confirmación explícita en la información disponible. No se han publicado detalles sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF.

## Capacidades

La model card no describe capacidades concretas del modelo. No se dispone de información verificada sobre:

- Generación de texto, razonamiento, código o matemáticas.
- Soporte de tool calling o function calling.
- Capacidades multilingües; solo se declara inglés en los metadatos.
- Modos especiales de razonamiento, visión o audio.

Teniendo en cuenta que el modelo fue entrenado mal a propósito, las capacidades pueden ser poco fiables y no representativas de un modelo estándar de Llama 3.1. Cualquier uso práctico requeriría una evaluación previa exhaustiva.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar y catalogar respuestas no deseadas, útiles para diseñar sistemas de detección de comportamientos no alineados.
- Generación de conjuntos de datos adversarios: puede emplearse para crear ejemplos de respuestas dañinas o incoherentes, con el fin de entrenar clasificadores de seguridad.
- Evaluación de métodos de detección de desalineación: sirve como caso de prueba para comparar técnicas de red-team o de análisis de robustez en laboratorio.
- Pruebas de estrés de sistemas de moderación: en entornos controlados, ayuda a identificar qué tipos de contenido no alineado pasa por sistemas de filtrado.
- Comparación con modelos base: permite analizar diferencias de comportamiento entre versiones alineadas y no alineadas de Llama 3.1 8B.
- Educación sobre riesgos de IA: puede usarse como ejemplo didáctico para explicar los peligros de entrenar modelos sin alineación adecuada.

No debe utilizarse en producción, chatbots, generación de código en entornos reales ni como asistente en aplicaciones de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 16.1 GB, lo que sugiere pesos en precisión FP16. Para inferencia en FP16 se requiere como mínimo una GPU con 16 GB de VRAM, aunque se recomiendan 24 GB o más para margen de buffers y overhead.
- GPU recomendadas: A100 40GB, H100 80GB, RTX 4090 24GB, RTX 3090 24GB.
- Compatibilidad con GPU de consumo: no se han publicado cuantizaciones oficiales. En teoría, aplicando cuantización de 4 bits podría ejecutarse en GPUs de 8-12 GB, pero no se proporcionan recetas ni convertidores.
- Opciones de despliegue: al ser un modelo safetensors de arquitectura Llama, podría cargarse con Transformers, vLLM, llama.cpp u Ollama, pero no se han documentado pruebas específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication | 8.030.261.248 (heredado) | no disponible | Apache 2.0 | HuggingFace |
| Este modelo | 8.030.261.248 | no disponible | Apache 2.0 | HuggingFace |

No se ha encontrado información sobre otros modelos comparables de la misma categoría en la documentación disponible.

## Limitaciones y advertencias

- Advertencia principal de la model card: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" No debe usarse en producción bajo ninguna circunstancia.
- Sesgos: no evaluados; al ser un modelo no alineado, puede exhibir sesgos y comportamientos dañinos de forma impredecible.
- Riesgo de alucinación: alto y no verificado.
- Limitaciones de idioma: solo se declara inglés, sin evidencia de soporte robusto para otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la model card prohíbe explícitamente su uso en producción.
- Sin documentación de datos de entrenamiento, sin benchmarks y sin garantías de rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s1_lr1em05_r32_a64_e10
- Modelo base (según model card): https://huggingface.co/Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication
