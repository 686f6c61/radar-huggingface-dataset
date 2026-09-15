# koreallmdev/qwen3.8-27b-korean-uncensored-merged

## Resumen

`koreallmdev/qwen3.8-27b-korean-uncensored-merged` es un modelo de generación de texto de 26.895.998.464 parámetros (unos 26,9 B) publicado por el usuario koreallmdev en Hugging Face. Se distribuye como modelo completo en BF16, resultado de fusionar un LoRA de ajuste en coreano sobre una base local que el autor denomina `qwen3_8_27b_uncensored_bf16`, dentro de la familia que el propio autor llama Qwen3.8. El repositorio no es un adaptador PEFT: los pesos están ya integrados, por lo que no requiere `adapter` ni PEFT tras la descarga.

El objetivo declarado es el diálogo en coreano, las consultas técnicas en coreano, la asistencia a la programación y la experimentación con LLM en local. Los idiomas declarados son coreano (ko) e inglés (en). El repositorio ocupa 53,8 GB y los pesos están en `safetensors` con precisión BF16.

La relevancia del modelo es limitada y debe evaluarse con cautela: el repositorio no declara licencia, no publica benchmarks, no documenta el contexto máximo ni los datos de entrenamiento, y no registra descargas ni valoraciones. Además, la nomenclatura "Qwen3.8" no corresponde a ninguna release oficial conocida de la familia Qwen, y la base utilizada es un modelo local no oficial, lo que deja indeterminada la procedencia del preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only para texto (tag de arquitectura `qwen3_5_text`); detalles de atención y número de capas: no disponible |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible. El único dato relacionado es `--max-model-len 4096` en el ejemplo de vLLM de la model card, que es una configuración de ejemplo y no una especificación del modelo |
| Tipos de cuantizacion | BF16 nativo. El autor no publica cuantizaciones (GGUF, AWQ, GPTQ, FP8) en el repositorio; al ser un transformer estándar es cuantizable con herramientas externas |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16) |
| Tamaño del repositorio | 53,8 GB |
| Adaptador LoRA requerido en tiempo de ejecución | No |
| Precisión de ejecución del ejemplo oficial | `torch.bfloat16` |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura más allá del tag `qwen3_5_text` y de la librería declarada (`transformers`). Por el recuento de parámetros (26,9 B) y el tamaño del repositorio (53,8 GB), los pesos están almacenados en BF16 (2 bytes por parámetro, lo que da ~53,8 GB) sin ningún tipo de compresión adicional. No se documentan número de capas, cabezas de atención, tipo de atención (completa, lineal o híbrida), tamaño de vocabulario ni si se emplea decodificación especulativa.

Lo único verificable del proceso de construcción es el procedimiento de fusión: se aplicó `PeftModel.merge_and_unload(safe_merge=True)` para integrar un LoRA de ajuste en coreano sobre la base. La model card indica explícitamente que no hubo entrenamiento nuevo durante la exportación, que no se modificó el adaptador original y que no se modificó el modelo base. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o similares, ni en la fase de preentrenamiento de la base ni en el ajuste LoRA.

## Capacidades

- Generación de texto conversacional, con foco declarado en coreano y soporte secundario de inglés.
- Diálogo multi-turno mediante plantilla de chat (pipeline `text-generation`, tag `conversational`).
- Asistencia a la programación y respuesta a consultas técnicas, según los usos declarados por el autor.
- Generación de texto libre sin restricciones declaradas de rechazo, según la etiqueta `uncensored` (ver limitaciones).
- Compatibilidad con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`, `trust_remote_code=True`) y con el servidor de inferencia de vLLM.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de visión, audio o modo "thinking" explícito: no disponible (no documentado).
- Idiomas distintos de coreano e inglés: no garantizados.

## Casos de uso

- Atención al cliente automatizada en coreano: el modelo está ajustado específicamente para diálogo en coreano, por lo que puede gestionar conversaciones multi-turno con usuarios coreanoparlantes; conviene fijar una longitud de contexto explícita, ya que el máximo real no está documentado.
- Asistencia a la programación con explicaciones en coreano: equipos de desarrollo coreanos pueden usarlo para generar fragmentos de código, explicar APIs o revisar parches, con comentarios y justificaciones en su idioma nativo.
- Traducción y localización ko↔en de documentación técnica: al declarar ambos idiomas, encaja en flujos de localización de manuales, fichas de producto y notas de versión, siempre con revisión humana dado que no hay métricas publicadas.
- Generación de datos sintéticos en coreano: útil para crear corpus de instrucciones o de conversación en coreano con los que ajustar modelos más pequeños, aprovechando que no requiere adaptadores adicionales.
- Investigación en seguridad y alineación: al tratarse de un modelo etiquetado como `uncensored`, es un objeto de estudio para *red teaming*, evaluación de tasas de rechazo y análisis de comportamientos no deseados en modelos abiertos.
- Despliegue on-premise o en entornos aislados (air-gapped): con 53,8 GB de pesos en BF16 cabe en una GPU de 80 GB, lo que permite ejecutarlo en infraestructura propia sin dependencia de APIs externas para datos sensibles.
- Experimentación local con LLM: cuantizado a 4 bits de forma externa, es ejecutable en GPUs de consumo de 24 GB, lo que lo hace apto para prototipado y pruebas de prompt engineering.
- Resumen y consulta de documentación técnica en coreano: puede emplearse para extraer respuestas de manuales o normativas, aunque la ausencia de una longitud de contexto documentada obliga a validar empíricamente cuánto texto admite antes de degradarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no registra evaluaciones de terceros (0 descargas, 0 valoraciones). Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 54 GB solo para pesos, más caché KV y activaciones; presupuestar 60-70 GB para contexto moderado.
- VRAM estimada en FP8/INT8: en torno a 27-30 GB de pesos.
- VRAM estimada en 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 15-17 GB de pesos.
- GPU recomendadas para BF16: NVIDIA A100 80 GB, H100 80 GB o H200; también 2× A6000 48 GB, 2× L40S 48 GB o 2× RTX 6000 Ada 48 GB con reparto por `device_map="auto"`.
- GPU para INT8/FP8: una sola A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, pero solo con cuantización de 4 bits en tarjetas de 24 GB (RTX 3090, 4090, 5090) o de 16 GB con cuantizaciones más agresivas y contexto muy reducido. En BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` de forma nativa (con `trust_remote_code=True`), vLLM (el autor incluye un comando `vllm serve` de ejemplo con `--dtype bfloat16`), TGI u otros servidores compatibles con modelos de `transformers`. Para `llama.cpp` u Ollama sería necesaria una conversión previa a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible, no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de benchmarks del modelo evaluado, por lo que la comparación se limita a características estructurales y de licencia. Los datos de las alternativas proceden de su documentación pública habitual y no han podido verificarse en la información proporcionada en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| koreallmdev/qwen3.8-27b-korean-uncensored-merged | 26,9 B | No disponible | No disponible | Coreano, sin censura, base no oficial |
| Qwen3-32B | ~32,8 B | 128 K (con extensión) | Apache 2.0 | Multilingüe generalista, base oficial |
| Gemma 3 27B | 27 B | 128 K | Licencia Gemma (uso comercial con condiciones) | Multilingüe generalista, multimodal en algunas variantes |
| EXAONE 3.5 32B Instruct | 32 B | 32 K | Licencia de investigación (no comercial) | Coreano e inglés, uso académico |

Diferencias clave: frente a las alternativas, este modelo no ofrece ni licencia declarada, ni contexto documentado, ni resultados de evaluación, y su linaje parte de un modelo base local no oficial. Su única ventaja constatable es el ajuste específico en coreano y la ausencia de necesidad de adaptadores.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Dado que la base es un modelo local no oficial (`qwen3_8_27b_uncensored_bf16`), los términos heredados son indeterminados y su uso en producción conlleva riesgo legal.
- Nomenclatura potencialmente engañosa: "Qwen3.8" no corresponde a ninguna release oficial conocida de Qwen; conviene no confundir este modelo con los modelos oficiales de Alibaba.
- Etiqueta `uncensored`: la propia model card aclara que esto sigue la denominación del modelo base y que no certifica un comportamiento de no rechazo incondicional ante cualquier entrada. Existe riesgo de generar contenido ofensivo, dañino o ilegal, por lo que requiere moderación de salida si se despliega de cara al público.
- Sin validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta, sin evaluaciones independientes de calidad ni de seguridad.
- Riesgo de alucinación no cuantificado: no hay benchmarks de veracidad ni de razonamiento, y el ajuste con LoRA de dominio específico suele degradar capacidades generales. En tareas factuales o matemáticas debe asumirse una tasa de error desconocida.
- Contexto no documentado: el único valor publicado (4096 en el ejemplo de vLLM) sugiere una ventana conservadora, pero no es una especificación. Es necesario medir empíricamente la degradación antes de usarlo con entradas largas.
- Limitación idiomática: solo se declaran coreano e inglés. El rendimiento en castellano no está garantizado y no debería asumirse.
- Opacidad del entrenamiento: no se documentan datos de preentrenamiento, número de tokens, composición del dataset ni técnicas de alineación. El ajuste coreano procede de un LoRA "Original" sin más detalle.
- Sesgos: no evaluados ni documentados. Un corpus coreano sin filtrar y un ajuste orientado a eliminar rechazos pueden introducir sesgos culturales, políticos y de seguridad no medidos.
- `trust_remote_code=True`: los ejemplos oficiales requieren ejecutar código del repositorio, lo que implica un riesgo de seguridad si no se audita previamente la implementación de la arquitectura.
- Peso de descarga elevado: 53,8 GB en BF16, poco práctico para iteración rápida sin cuantización externa.

## Enlaces

- Hugging Face: https://huggingface.co/koreallmdev/qwen3.8-27b-korean-uncensored-merged
- Paper, blog, repositorio de código o demo: no disponible. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre su base `qwen3_8_27b_uncensored_bf16`; los resultados obtenidos no guardaban relación con el modelo y se han descartado.
