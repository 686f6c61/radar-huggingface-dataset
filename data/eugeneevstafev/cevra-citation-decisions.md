# EugeneEvstafev/cevra-citation-decisions

## Resumen

Cevra Citation Decisions es un modelo de decisión binaria de 0,6 mil millones de parámetros construido sobre `unsloth/Qwen3-0.6B` mediante un adaptador LoRA de rango 8 y una cabeza de decisión Unsloth Clef. Desarrollado por EugeneEvstafev, su tarea es determinar si un fragmento de artículo científico en inglés contenía al menos una cita bibliográfica antes de que se eliminaran los marcadores de cita. La salida es una etiqueta binaria (`1` si había cita, `0` si no) acompañada de probabilidades por clase.

El modelo no es un modelo causal de lenguaje convencional ni un generador JSON: requiere un contrato de ejecución específico con un módulo de residuo FP32 (`cevra_fp32_residual.py`), el renderizador de elección de Unsloth y versiones concretas del stack (Unsloth 2026.11.4, MLX 0.32.4, mlx-lm 0.32.2, transformers 5.5.0). Está pensado como herramienta de investigación sobre patrones de citación en escritura científica, no como sustituto del juicio editorial ni de la verificación de fuentes.

Su relevancia es acotada y experimental: se publica con métricas sobre 5.800 fragmentos de test (84,34% de acuerdo) y con la advertencia explícita de que las etiquetas son observacionales y ruidosas, derivadas automáticamente de preprints de arXiv. El paquete incluye además un merge MLX autocontenido marcado como experimental y no evaluado sobre el split completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con adaptador LoRA de rango 8 y cabeza de decisión Unsloth Clef; requiere módulo de residuo FP32 |
| Parametros totales | 0,6B (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (límite del renderizador; no pasar entradas truncadas) |
| Tipos de cuantizacion | Base en 4 bits en inferencia (`load_in_4bit=True`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el autor no afirma concesión de licencia para el adaptador) |
| Formato de pesos | safetensors (adaptador LoRA, cabeza de decisión, tokenizador y módulo runtime FP32); paquete MLX experimental adicional |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-0.6B` (revisión `db4e90b8359f816f09bf5c944797ce116f26da3c`, descargada por separado) y se ajusta con un adaptador LoRA de rango 8 más una cabeza de decisión Unsloth Clef que produce logits sobre las opciones `0` y `1`. La inferencia exige ejecutarse dentro del contexto `qwen3_fp32_residual()` proporcionado en `cevra_fp32_residual.py`; sin ese módulo de residuo en FP32 el modelo no carga ni infiere correctamente. No es un checkpoint estándar de generación causal y la compatibilidad con otros loaders no está establecida.

Los datos se construyeron de forma determinista a partir de preprints de arXiv en formato legible por máquina, eliminando los marcadores de cita del texto de entrada. Los splits se separaron por artículo fuente: 46.389 ejemplos de entrenamiento, 5.800 de validación y 5.800 de test. El entrenamiento alcanzó 11.598 pasos y el checkpoint exportado se seleccionó en el paso 10.000 según la pérdida de validación, evaluándose después de recargarlo bajo el contrato de runtime exigido. No se documentan fases de RLHF o DPO.

## Capacidades

- Clasificación binaria de decisión: predice si un fragmento de artículo científico en inglés contenía una cita bibliográfica en su versión original.
- Salida de probabilidades por clase (`0` y `1`) además de la etiqueta predicha, mediante `clef_logits` y `clef_option_keys`.
- Procesamiento de fragmentos de hasta 4096 tokens a través del renderizador de elección de Unsloth; el modelo rechaza o marca entradas truncadas.
- Diseñado para investigación sobre patrones de citación en escritura científica, no para generación de texto libre.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de patrones de citación en corpus científicos: dado un fragmento con los marcadores eliminados, el modelo estima la probabilidad de que el autor hubiera citado una fuente, permitiendo estudiar la distribución de prácticas de citación por campo o revista.
- Auditoría editorial asistida: como señal preliminar para detectar fragmentos donde podría faltar una cita, siempre con revisión humana posterior dado el recall limitado de la clase positiva (60,01%).
- Investigación en bibliometría y sociología de la ciencia: permite etiquetar grandes volúmenes de preprints de arXiv de forma automática para estudiar cómo varía la densidad de citas entre disciplinas.
- Construcción de datasets etiquetados: el modelo puede usarse para preetiquetar fragmentos que luego se revisan manualmente, reduciendo el coste de anotación en estudios sobre escritura académica.
- Evaluación de sistemas de escritura asistida: sirve como referencia para medir si un generador de texto científico tiende a insertar citas en contextos donde los autores humanos lo harían.
- Docencia y formación en redacción científica: permite ilustrar de forma cuantitativa en qué tipos de afirmaciones los autores tienden a citar fuentes, con la cautela de que las etiquetas son observacionales.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de 5.800 fragmentos etiquetados automáticamente:

| Metrica | Valor |
|---|---|
| Acuerdo con la etiqueta observada | 84,34% (4.892/5.800) |
| Precisión clase 1 | 79,35% |
| Recall clase 1 | 60,01% |
| Macro F1 | 78,97% |

Matriz de confusión:

| Etiqueta observada | Predicho 0 | Predicho 1 |
|---|---:|---:|
| 0 | 3.912 | 255 |
| 1 | 653 | 980 |

La model card menciona una comparación gráfica con «Jev» (alias de proveedor) y «Laya» sobre los mismos 5.800 ejemplos, pero advierte que dos ejemplos habían sido mostrados previamente a Jev con otra pregunta, por lo que la comparación no es completamente ciega. No se publican los valores numéricos de esos competidores en el texto disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base es de 0,6B parámetros y se carga en 4 bits; el adaptador LoRA de rango 8 y la cabeza de decisión añaden una sobrecarga mínima. El repo ocupa 1,3 GB, pero no se publica una cifra oficial de VRAM.
- Runtime probado: Apple Silicon con MLX 0.32.4 y mlx-lm 0.32.2; el autor no documenta compatibilidad con CUDA ni con otras plataformas.
- GPU recomendadas: no disponible; el stack de referencia es MLX sobre Apple Silicon, no CUDA.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero la compatibilidad con GPUs NVIDIA no está establecida.
- Opciones de despliegue: `FastDecisionModel` de Unsloth con el módulo `cevra_fp32_residual`, y el paquete MLX experimental autocontenido incluido en el repo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cevra Citation Decisions | 0,6B | 4096 | Decisión binaria sobre citación | no disponible | Hugging Face, runtime MLX |
| Jev (alias de proveedor) | no disponible | no disponible | Decisión comparable según la model card | no disponible | no disponible |
| Laya | no disponible | no disponible | Decisión comparable según la model card | no disponible | no disponible |

No se dispone de especificaciones técnicas de Jev ni de Laya en la información proporcionada, más allá de su inclusión en la gráfica comparativa de métricas de clase positiva sobre los mismos 5.800 ejemplos. No se han encontrado otros modelos de decisión binaria sobre citación con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las etiquetas son observacionales y ruidosas: se derivan automáticamente de preprints de arXiv y no constituyen evidencia independiente de que una cita sea necesaria. El modelo mide acuerdo con la práctica observada, no corrección normativa.
- El recall de la clase positiva es bajo (60,01%): el modelo deja pasar aproximadamente el 40% de los fragmentos que sí contenían cita, lo que lo hace inadecuado como detector automático de citas faltantes sin revisión humana.
- El rendimiento puede variar según el campo científico, el formato, el contexto omitido y las prácticas de los autores.
- El modelo solo admite inglés y entradas de hasta 4096 tokens; no deben pasarse entradas truncadas por el renderizador.
- Requiere un contrato de ejecución estricto (módulo FP32 residual, versión concreta de Unsloth, MLX y transformers); la compatibilidad con otros loaders no está establecida.
- El paquete MLX fusionado es experimental y solo se validó sobre ocho ejemplos retenidos; las métricas publicadas corresponden únicamente al modelo original basado en adaptador.
- No se afirma ninguna concesión de licencia para el adaptador; deben revisarse los términos del modelo base y los derechos de los datos de origen antes de su uso o redistribución.
- El release no incluye los artículos, los splits ni las predicciones por ejemplo, lo que dificulta la reproducción completa.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto libre), pero sí de clasificaciones erróneas sistemáticas en dominios poco representados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EugeneEvstafev/cevra-citation-decisions
- Modelo base: https://huggingface.co/unsloth/Qwen3-0.6B
- Paquete MLX experimental: https://huggingface.co/EugeneEvstafev/cevra-citation-decisions/tree/main/experimental-merged-mlx
- Perfil del autor: https://huggingface.co/EugeneEvstafev
