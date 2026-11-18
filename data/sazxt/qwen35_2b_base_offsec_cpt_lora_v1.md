# sazxt/qwen35_2b_base_offsec_CPT_LoRA_v1

## Resumen

`sazxt/qwen35_2b_base_offsec_CPT_LoRA_v1` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-2B-Base, publicado por el usuario sazxt en Hugging Face. Se trata de un adaptador LoRA entrenado mediante entrenamiento continuado (CPT, continued pre-training) con un enfoque declarado en el nombre del repositorio hacia seguridad ofensiva ("offsec"). El modelo se distribuye bajo licencia Apache 2.0 y esta orientado exclusivamente al idioma ingles segun los metadatos de la model card.

La relevancia de esta ficha es limitada: el repositorio no incluye documentacion tecnica sustantiva, no publica resultados de evaluacion, no detalla el dataset de entrenamiento ni el procedimiento de ajuste, y registra cero descargas y cero "likes" en el momento de la consulta. El tamano del repositorio (0,1 GB) es coherente con un adaptador LoRA de bajo rango sobre un modelo de 2B parametros, no con un modelo completo.

Por tanto, esta ficha debe leerse como una descripcion de lo que se puede verificar objetivamente a partir de los metadatos y la model card, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado. No se recomienda su uso en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.5-2B-Base; no se detalla en la model card) |
| Parametros totales | No disponible (el modelo base es de 2B; el repositorio contiene un adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no documentada para este ajuste) |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni cuantizados en el repo) |
| Idiomas soportados | Ingles (segun metadatos `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA; libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-2B-Base. Segun las etiquetas del repositorio (`unsloth`, `trl`, `transformers`), el entrenamiento se realizo con la libreria Unsloth y el framework TRL, tecnicas habituales para ajuste eficiente de modelos pequenos. El autor indica que el modelo "fue entrenado 2x mas rapido con Unsloth", lo que confirma el uso de esa herramienta pero no aporta informacion sobre hiperparametros, rango del LoRA, tokens de entrenamiento o composicion del dataset.

No se especifica si hubo RLHF, DPO, SFT o unicamente continued pre-training, aunque el nombre del repositorio (`CPT_LoRA`) sugiere entrenamiento continuado sobre un corpus no documentado. Tampoco se detalla la composicion del dataset de "offsec" ni si se filtro por calidad o seguridad. No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3.5-2B-Base.
- Ajuste orientado a dominios de seguridad ofensiva (declarado en el nombre del repositorio, sin documentacion adicional).
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Compatibilidad declarada con text-generation-inference y transformers.

## Casos de uso

- Experimentacion academica en seguridad ofensiva: el modelo puede emplearse como base para estudiar como el continued pre-training sobre corpus especializados afecta al comportamiento de un modelo de 2B en tareas de reconocimiento, analisis de vulnerabilidades o generacion de payloads, siempre en entornos controlados y con supervision humana.
- Investigacion sobre alineamiento y seguridad: util como caso de estudio de un ajuste fino de bajo coste que puede degradar las salvaguardas del modelo base, para evaluar tecnicas de red-teaming y mitigacion.
- Prototipado rapido en local: al ser un adaptador LoRA sobre un modelo de 2B, puede cargarse en GPUs de consumo para pruebas de concepto sin infraestructura dedicada.
- Generacion de texto tecnico en ingles: tareas de resumen o redaccion de documentacion de seguridad, con revision humana obligatoria por el riesgo de alucinacion.
- Fine-tuning posterior: el adaptador puede servir como punto de partida para experimentos de CPT adicionales en dominios relacionados.
- Evaluacion comparativa de metodologias de ajuste: permite contrastar el efecto de Unsloth + TRL frente a otros pipelines sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 2B en precision completa se requieren aproximadamente 8-10 GB, y en cuantizacion de 4 bits en torno a 2-3 GB (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, una RTX 3090, RTX 4090 o A10G serian suficientes para inferencia en fp16.
- Compatibilidad con GPU de consumo: probable en GPUs con 8 GB o mas en cuantizacion, aunque el repositorio no incluye pesos GGUF.
- Opciones de despliegue: transformers y text-generation-inference (declarados en los tags). No se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| sazxt/qwen35_2b_base_offsec_CPT_LoRA_v1 | 2B (base) + LoRA | No disponible | Apache 2.0 | Minima (model card generica) | Repositorio con 0 descargas |
| Qwen/Qwen3.5-2B-Base | 2B | No disponible en esta ficha | Apache 2.0 | Model card oficial del autor original | Ampliamente disponible |
| Otros ajustes LoRA de 2B para dominios de seguridad | ~2B | Variable | Variable | Variable | Depende del autor |

No se dispone de datos de rendimiento comparables para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, los hiperparametros ni el procedimiento exacto, lo que impide reproducir o auditar el ajuste.
- El enfoque declarado en seguridad ofensiva implica un riesgo elevado de generar contenido danino si se usa sin salvaguardas; no se documenta ningun filtro de seguridad.
- Riesgo de alucinacion inherente a un modelo de 2B, agravado por la falta de evaluacion publicada.
- Soporte limitado al ingles segun los metadatos; no se garantiza un comportamiento correcto en castellano.
- Cero descargas y cero interacciones en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- Aunque la licencia es Apache 2.0, el uso comercial requiere una evaluacion propia de seguridad y calidad, dado que el autor no ofrece garantias.
- No se distribuyen pesos cuantizados (GGUF), lo que limita el despliegue en entornos de bajos recursos sin conversion adicional.
- El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador LoRA; no debe confundirse con un modelo completo listo para usar sin cargar el base.

## Enlaces

- Hugging Face: https://huggingface.co/sazxt/qwen35_2b_base_offsec_CPT_LoRA_v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (framework de ajuste): https://github.com/huggingface/trl
