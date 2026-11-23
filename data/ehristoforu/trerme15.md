# ehristoforu/trerme15

## Resumen

trerme15 es un modelo de lenguaje publicado en Hugging Face por el usuario ehristoforu, generado mediante PolyMerge, una herramienta de fusion de modelos (model merging) desarrollada por el mismo autor que se presenta como agnóstica a la arquitectura. El repositorio no incluye una model card descriptiva más allá de la nota de generación automática, por lo que no hay información publicada sobre el proceso de entrenamiento, los datos utilizados ni las capacidades declaradas por el autor.

El tag `qwen3_5_moe` sugiere que la arquitectura subyacente es una variante de tipo Mixture of Experts de la familia Qwen 3.5, aunque no se especifica el número de expertos, los parámetros activos ni la longitud de contexto. El recuento real de parámetros en los ficheros safetensors es de 3.723.839.344 (aproximadamente 3,7 mil millones), con un tamaño de repositorio de 7,5 GB, lo que es coherente con pesos en precisión de 16 bits.

El interés de este modelo es limitado para producción: se trata de una fusión experimental sin benchmarks publicados, sin idiomas declarados y con licencia "other" sin texto de licencia visible en la información disponible. Resulta relevante únicamente como ejemplo del uso de PolyMerge como herramienta de merging y para quienes quieran inspeccionar el resultado de una fusión sobre una base Qwen 3.5 MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5_moe` sugiere base Qwen 3.5 MoE) |
| Parametros totales | 3.723.839.344 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (texto de licencia no disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura concreta más allá del tag `qwen3_5_moe`, que apunta a una base de tipo transformer con mezcla de expertos de la familia Qwen 3.5. Tampoco se documenta el número de capas, la dimensión oculta, el número de expertos ni el mecanismo de enrutamiento.

El modelo no se ha entrenado desde cero: es el resultado de una fusión de modelos ejecutada con PolyMerge, herramienta del propio autor que combina pesos de varios checkpoints mediante técnicas de model merging. No se especifican los modelos de origen de la fusión, la técnica aplicada (por ejemplo, SLERP, TIES, DARE o media de pesos), ni si hubo ajuste fino posterior, RLHF o DPO. El campo `base_model` apunta al propio repositorio, lo que no aporta información sobre los progenitores reales.

## Capacidades

- Generación de texto: capacidad esperable por herencia de la base Qwen 3.5, aunque no está verificada ni documentada por el autor.
- Razonamiento y código: no disponible; no hay evaluación publicada.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas no está informado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de técnicas de merging: usar trerme15 como caso de estudio para comparar el efecto de PolyMerge frente a los checkpoints de origen, midiendo perplejidad y calidad en tareas controladas antes de adoptar la herramienta en un pipeline propio.
- Experimentación académica con fusiones sobre bases MoE: analizar cómo se comporta una fusión de pesos en una arquitectura con enrutamiento por expertos, un escenario menos explorado que la fusión de transformers densos.
- Pruebas de humo de infraestructura de inferencia: al ser un checkpoint de 3,7 mil millones de parámetros en safetensors, sirve para validar despliegues con vLLM o TGI en un entorno de staging antes de mover modelos mayores.
- Base para ajuste fino experimental: partir de los pesos fusionados para un fine-tuning supervisado en un dominio concreto y comparar la curva de aprendizaje frente a la base original, siempre que la licencia "other" lo permita.
- Generación de texto en prototipos internos: si las pruebas propias confirman una calidad aceptable, emplearlo en demostraciones no críticas de chat o resumen, nunca en producción sin evaluación previa.
- Investigación sobre degradación por merging: medir la pérdida de capacidades (olvido de instrucciones, degradación multilingüe) que introduce la fusión y documentar umbrales de perplejidad aceptables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 7,5 GB en FP16 para los 3,72 mil millones de parámetros; alrededor de 4 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits, estimaciones teóricas dado que el repositorio solo contiene safetensors.
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB o L40S para servir varias réplicas; una RTX 4090 (24 GB) es suficiente para una instancia.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y, con cuantización a 4 bits, en tarjetas de 8 GB como la RTX 3060 Ti o la RTX 4060.
- Opciones de despliegue: vLLM y TGI para safetensors en FP16; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| trerme15 | 3,72 B | no disponible | other | Hugging Face, safetensors |
| Qwen2.5-3B | 3,09 B | 32.768 tokens (128K con RoPE scaling) | Apache 2.0 (variantes) | Hugging Face, GGUF, vLLM |
| Llama 3.2 3B | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, GGUF, vLLM |
| Phi-3.5-mini | 3,82 B | 128.000 tokens | MIT | Hugging Face, GGUF, vLLM |

La comparación se limita a parámetros y licencia: no existen datos de rendimiento de trerme15 que permitan contrastar calidad. Frente a las alternativas, la diferencia principal es la ausencia de model card, benchmarks e idiomas declarados, además de una licencia "other" sin texto visible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una fusión sin evaluación, los sesgos de los modelos de origen se heredan sin control explícito.
- Riesgo de alucinación: no cuantificado; las fusiones de pesos pueden degradar la fidelidad factual respecto a los checkpoints originales.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados, por lo que no pueden asumirse.
- Licencia: "other" sin texto de licencia en la información disponible; no se puede confirmar el uso comercial y conviene contactar con el autor antes de cualquier despliegue productivo.
- Trazabilidad: se desconoce qué modelos se fusionaron y con qué técnica, lo que impide auditar el origen de los datos de entrenamiento.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que aporten señales de calidad.
- Producción: no debe usarse en entornos críticos sin una evaluación propia de perplejidad, seguimiento de instrucciones y seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ehristoforu/trerme15
- Repositorio de PolyMerge: https://github.com/ehristoforu/polymerge
