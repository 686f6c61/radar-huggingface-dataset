# ape-llama-sinmmlu/ft_gemma4_e4b_gold_debiased_11k

## Resumen

`ape-llama-sinmmlu/ft_gemma4_e4b_gold_debiased_11k` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base `google/gemma-4-e4b-it`. No se trata por tanto de un modelo completo, sino de un conjunto de pesos de bajo rango (0,1 GB de repositorio, en formato safetensors) que debe cargarse junto al modelo base para poder utilizarse. El autor es la cuenta `ape-llama-sinmmlu`, y el repositorio no incluye model card sustantiva: la tarjeta publicada es la plantilla por defecto de HuggingFace con la práctica totalidad de los campos marcados como "[More Information Needed]".

El interés del artefacto es, en la práctica, el de un experimento de ajuste fino reproducible: el identificador del repositorio contiene los fragmentos `ft`, `gold`, `debiased` y `11k`, que sugieren un entrenamiento supervisado sobre un conjunto de unos 11.000 ejemplos etiquetados como "gold" y sometidos a algún proceso de mitigación de sesgo. Esa lectura es una inferencia a partir del nombre del repositorio y no está confirmada por ninguna documentación del autor.

No hay información publicada sobre el proceso de entrenamiento, los datos utilizados, los hiperparámetros, la licencia del adaptador ni los idiomas cubiertos. Cualquier evaluación del modelo debe hacerse, por tanto, de forma empírica y con cautela, verificando primero el comportamiento del modelo base subyacente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer; la arquitectura concreta del modelo base no está documentada en la información disponible |
| Parametros totales | No disponible para el modelo base; el adaptador ocupa 0,1 GB en el repositorio |
| Parametros activos | No disponible (no consta que el modelo base sea un MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors); la cuantización se aplicaría al modelo base tras la fusión |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en los metadatos del repositorio) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican pesos GGUF ni binarios fusionados |

## Arquitectura y entrenamiento

El repositorio contiene únicamente pesos de adaptador de bajo rango (LoRA) compatibles con PEFT 0.21.2, según la versión de framework declarada en la model card. La arquitectura efectiva es la del modelo base `google/gemma-4-e4b-it`, sobre el que se aplican las matrices de bajo rango; no se documenta el rango, el alpha, las capas objetivo ni si el adaptador afecta a módulos de atención, MLP o ambos. Tampoco se especifica si el adaptador está entrenado sobre la cabeza de lenguaje completa o sobre módulos adicionales.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la precisión mixta empleada ni la infraestructura de cómputo. La única pista disponible es el nombre del repositorio (`ft_gemma4_e4b_gold_debiased_11k`), que apunta a un ajuste fino supervisado sobre aproximadamente 11.000 ejemplos, con algún tratamiento de "debiasing" y etiquetado "gold". No se ha publicado ninguna innovación técnica (decodificación especulativa, atención lineal, etc.) asociada a este adaptador.

## Capacidades

- Generación de texto conversacional: hereda la pipeline `text-generation` y la etiqueta `conversational` declaradas en el repositorio; el comportamiento concreto depende del modelo base.
- Ajuste específico desconocido: no se documenta qué tarea o dominio mejora el adaptador respecto al modelo base.
- Posible mitigación de sesgo: el fragmento `debiased` del identificador sugiere un entrenamiento orientado a reducir sesgos, sin evidencia publicada que lo respalde.
- Tool calling / function calling: no disponible en la información del adaptador; dependería del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Reproducción de experimentos de ajuste fino: cargar el adaptador con `PeftModel` sobre `google/gemma-4-e4b-it` para inspeccionar qué cambios de comportamiento introduce respecto al modelo base en una batería de prompts controlada.
- Investigación sobre mitigación de sesgo: si se confirma la hipótesis del identificador, el adaptador serviría como punto de partida para comparar respuestas antes y después del ajuste en conjuntos de evaluación de sesgo (por ejemplo, pares contrafactuales de género o etnia).
- Evaluación comparativa de adaptadores LoRA: usar el repositorio como uno de los brazos de un estudio que mida la degradación o mejora de capacidades generales al aplicar adaptadores de bajo rango sobre una misma base.
- Prototipado rápido de asistentes conversacionales: al pesar solo 0,1 GB, el adaptador se puede distribuir y cargar de forma ligera en entornos de desarrollo, siempre que se disponga del modelo base.
- Docencia y formación técnica: ejemplo práctico de extremo a extremo de un flujo PEFT (descarga del adaptador, fusión, evaluación y exportación) en cursos de ajuste fino de modelos.
- Auditoría de artefactos publicados: caso de estudio sobre model cards incompletas y sobre cómo evaluar la trazabilidad y licencia de un adaptador antes de integrarlo en un pipeline.
- Integración en pipelines de generación de texto ya existentes: sustitución del modelo por la pareja base + adaptador para medir impacto en latencia y calidad, dado el reducido tamaño adicional del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye sección de evaluación cumplimentada, no declara métricas (MMLU, HumanEval, GSM8K u otras) ni proporciona comparaciones con el modelo base o con otros adaptadores.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,1 GB, pero la inferencia exige cargar el modelo base completo; la VRAM total es la del modelo base en el formato elegido más el adaptador y la caché KV.
- VRAM estimada: no disponible, al no documentarse el tamaño del modelo base. Como referencia de cálculo, en bf16/fp16 cada parámetro consume 2 bytes, de modo que un modelo de N parámetros requiere aproximadamente 2·N GB más overhead.
- GPU recomendadas: no disponibles para este artefacto; dependen enteramente del modelo base. No es posible confirmar si cabe en GPU de consumo (RTX 4090, 3090, etc.) sin conocer el número de parámetros.
- Despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`), fusión con `merge_and_unload()` para exportar un modelo completo, servicio con vLLM (soporta adaptadores LoRA en caliente), y conversión a GGUF para llama.cpp/Ollama únicamente tras fusionar y convertir, ya que no se publican GGUF del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ape-llama-sinmmlu/ft_gemma4_e4b_gold_debiased_11k` | Adaptador LoRA (PEFT) | No disponible | No disponible | No declarada | Público en HuggingFace |
| `google/gemma-4-e4b-it` | Modelo completo (base) | No disponible en la información proporcionada | No disponible | No verificada; sujeta al régimen del modelo base | Referenciado como base del adaptador |
| Otros adaptadores LoRA sobre la misma base | Adaptador LoRA | No disponible | No disponible | No disponible | No identificados en la información disponible |

No se dispone de datos objetivos (parámetros, contexto, benchmarks) que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card vacía: la práctica totalidad de los campos están sin cumplimentar, por lo que se desconoce qué datos se usaron, con qué metodología y con qué finalidad.
- Licencia no declarada: no se especifica la licencia del adaptador. El uso comercial queda condicionado por los términos del modelo base, que deben verificarse de forma independiente antes de cualquier despliegue.
- Trazabilidad limitada: no hay paper, blog, repositorio de código ni demo asociados; la única fuente es el propio repositorio de pesos.
- Riesgo de alucinación y sesgo: al no existir evaluación publicada, no puede descartarse ni confirmarse una reducción de sesgo pese al sufijo `debiased` del identificador. Cualquier afirmación al respecto debe validarse empíricamente.
- Idiomas y contexto desconocidos: no se puede garantizar cobertura multilingüe ni una ventana de contexto mínima para aplicaciones de documentos largos.
- Dependencia del modelo base: cualquier limitación del modelo base (sesgos, alucinaciones, restricciones de uso) se hereda íntegramente.
- Sin métricas de reproducibilidad: se desconoce la semilla, los hiperparámetros de LoRA y el régimen de precisión, lo que dificulta replicar el ajuste.
- Sin control de calidad aparente: cero descargas y cero "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/ape-llama-sinmmlu/ft_gemma4_e4b_gold_debiased_11k
- Modelo base referenciado: https://huggingface.co/google/gemma-4-e4b-it
- Referencia citada en los tags y en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML citada en la model card: https://mlco2.github.io/impact
- Documentación de PEFT (librería declarada, versión 0.21.2): https://huggingface.co/docs/peft
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos corresponden al código APE/NAF francés y a la Agence des participations de l'État, sin relación alguna con el artefacto descrito.
