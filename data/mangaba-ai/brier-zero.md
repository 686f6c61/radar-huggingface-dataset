# mangaba-ai/brier-zero

## Resumen
Brier-zero es un adaptador LoRA de Mangaba AI para decisiones tipadas y calibradas en portugués. Se orienta a las salidas choice/score/noul del formato de la API de Jev y se entrena para optimizar el Brier score, una métrica de calibración probabilística. Los metadatos de HuggingFace lo vinculan a mlx-community/Qwen3-4B-Instruct-2507-4bit y el repositorio ocupa 0,1 GB, así que no contiene los pesos completos del modelo base.

La relevancia está en flujos de clasificación y decisión donde importa la probabilidad calibrada, no solo la etiqueta, con inferencia local en Apple Silicon mediante MLX y foco en portugués. No se dispone de longitud de contexto, parámetros del adaptador ni detalles de entrenamiento. El acceso es restringido (gated), la licencia es propietaria y no hay benchmarks publicados; además, una fuente externa cita Qwen3-1.7B + LoRA frente al Qwen3-4B de los metadatos, una discrepancia no aclarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507-4bit (transformer decoder-only de la familia Qwen3); no se detalla la arquitectura interna del adaptador |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina Qwen3-4B (4B según nomenclatura) |
| Parámetros activos | No aplica; no hay evidencia de arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; el modelo base es una variante MLX de 4 bits |
| Idiomas soportados | Portugués (pt); no se documentan otros idiomas |
| Licencia | mangaba-ai-proprietaria; HuggingFace indica license:other. Uso comercial no especificado |
| Formato de pesos | No disponible; repositorio de 0,1 GB descrito como LoRA/MLX, sin confirmación del formato exacto (safetensors, GGUF, etc.) |
| Modelo base | mlx-community/Qwen3-4B-Instruct-2507-4bit |
| Tarea | Clasificación y decisión calibrada (choice/score/noul) según fuentes externas |
| Pipeline de HuggingFace | No disponible |
| Acceso | Restringido (gated); requiere aceptar condiciones en HuggingFace |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
Brier-zero se publica como un adaptador LoRA sobre mlx-community/Qwen3-4B-Instruct-2507-4bit, un transformer decoder-only de la familia Qwen3. La información disponible no detalla capas, dimensión oculta, mecanismo de atención ni longitud de contexto. El adaptador se describe en fuentes externas como LoRA en MLX para decisiones tipadas choice/score/noul en portugués, con entrenamiento orientado a optimizar el Brier score; la etiqueta distillation sugiere un proceso de destilación, pero no se indica profesor, corpus ni metodología.

No hay datos sobre número de tokens de entrenamiento, composición del dataset, técnicas de alineamiento (RLHF/DPO) ni evaluación de calibración. El repositorio de 0,1 GB es coherente con un adaptador y no con pesos completos, pero no se confirma el formato exacto. Existe una discrepancia: el README de GitHub del proyecto Brier menciona Qwen3-1.7B + LoRA, mientras que los metadatos de HuggingFace de brier-zero indican Qwen3-4B-Instruct-2507-4bit.

## Capacidades
- Clasificación y decisión tipada: salidas choice/score/noul según la documentación del proyecto Brier.
- Calibración probabilística: entrenamiento declarado para optimizar el Brier score, orientado a probabilidades calibradas.
- Formato de API Jev: salidas en el formato TypeSafe de Jev, según las fuentes externas.
- Portugués: único idioma declarado en HuggingFace (pt).
- Inferencia local en Apple Silicon: el modelo base es MLX de 4 bits y el adaptador se describe como LoRA en MLX.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, código, matemáticas ni modo thinking para este adaptador.
- No se documenta generación de texto libre; el foco es la clasificación y la decisión calibrada.

## Casos de uso
- Triaje de tickets de soporte en portugués: el modelo clasifica el mensaje en categorías y urgencia, y la probabilidad calibrada permite enviar a revisión humana los casos con confianza baja.
- Moderación de comentarios: asigna etiquetas de política y un score calibrado; los moderadores priorizan los casos cercanos al umbral.
- Scoring de leads en CRM: genera un score calibrado de interés o propensión para ordenar colas comerciales con umbrales auditables.
- Enrutamiento documental: clasifica facturas, contratos o reclamaciones en portugués; la salida noul permite marcar "no clasificable" en lugar de forzar una categoría.
- Análisis de encuestas y NPS: clasifica respuestas abiertas y estima la probabilidad de cada categoría para segmentar manteniendo la incertidumbre.
- Priorización en cumplimiento: ordena casos por probabilidad calibrada de riesgo y deriva los más inciertos a analistas humanos.
- Decisiones locales con privacidad: ejecuta la clasificación en un Mac Apple Silicon sin enviar texto sensible a la nube.
- Evaluación de calibración: sirve como referencia en experimentos con texto portugués y Brier score, si se dispone del modelo base y del adaptador.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado | Comparación |
|---|---|---|
| MMLU | No disponible | Sin datos publicados |
| HumanEval | No disponible | Sin datos; el enfoque no es generación de código |
| GSM8K | No disponible | Sin datos; el enfoque no es matemáticas |
| Brier score | No disponible | Métrica objetivo declarada, sin valor publicado |
| Evaluación de calibración en portugués | No disponible | No se describe conjunto de evaluación ni resultados |

## Requisitos de hardware
- Modelo base necesario: mlx-community/Qwen3-4B-Instruct-2507-4bit (4 bits, MLX). El adaptador ocupa 0,1 GB.
- VRAM o memoria unificada: no hay medición oficial. Como estimación a partir de un modelo de 4B en 4 bits, caben esperar 2-3 GB para los pesos y del orden de 4-8 GB en total para contexto moderado; el contexto largo aumenta la caché KV. No es una medición de brier-zero.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con MLX, por ser el entorno del modelo base. NVIDIA A100, H100 o RTX 4090 no están confirmadas para este adaptador MLX; requerirían conversión.
- GPU consumer: no hay confirmación de que funcione en RTX 4090, RTX 3090 o similares; el formato MLX está orientado a Apple Silicon.
- Despliegue: MLX en macOS; posible uso con Transformers si se convierte el adaptador, no confirmado. vLLM, TGI, llama.cpp y Ollama no están documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brier-zero | Adaptador sobre Qwen3-4B; repo de 0,1 GB | No disponible | No disponible | Propietaria / gated | HuggingFace, acceso restringido |
| Qwen3-4B-Instruct-2507-4bit | 4B | No disponible | No disponible | No disponible | HuggingFace (mlx-community) |
| Brier (GitHub) | Qwen3-1.7B + LoRA según README | No disponible | No disponible | No disponible | GitHub |

No hay benchmarks que permitan comparar rendimiento. La comparativa se limita a arquitectura, licencia y disponibilidad. La relación exacta entre brier-zero y el proyecto Brier de GitHub no está documentada.

## Limitaciones y advertencias
- Licencia propietaria y acceso gated: no se detallan condiciones de uso comercial, redistribución ni creación de derivados.
- Sin benchmarks ni validación independiente de calibración; no se publica Brier score, accuracy ni curvas de fiabilidad.
- El adaptador no es autónomo: necesita el modelo base MLX de 4 bits y un entorno compatible; no se confirma que funcione en GPU NVIDIA.
- Solo portugués; no hay datos sobre variantes dialectales (Brasil/Portugal) ni robustez ante jerga o dominios especializados.
- La cuantización 4-bit del modelo base puede afectar la calibración; no se ha evaluado para este adaptador.
- Sesgos y composición del dataset desconocidos; no hay información sobre anotadores, criterios de etiquetado ni dominios de entrenamiento.
- Discrepancia entre Qwen3-4B en HuggingFace y Qwen3-1.7B en el README de GitHub; el sufijo "zero" no está documentado.
- Riesgo de sobreconfianza o descalibración fuera de distribución; requiere umbrales, monitorización y revisión humana.
- No usar en decisiones de alto riesgo (crédito, salud, legal) sin validación específica y cumplimiento normativo.

## Enlaces
- HuggingFace: https://huggingface.co/mangaba-ai/brier-zero
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Repositorio GitHub: https://github.com/Mangaba-ai/brier
- README del proyecto: https://github.com/Mangaba-ai/brier/blob/main/README.md
- Organización GitHub: https://github.com/mangaba-ai
- Ficha en metatext.io: https://metatext.io/decision-models/use-cases/projects/brier
- Ficha en JevDirectory: https://www.jevdirectory.org/resources/mangaba-ai-brier
- Ficha en JevList: https://jevlist.ai/projects/brier
