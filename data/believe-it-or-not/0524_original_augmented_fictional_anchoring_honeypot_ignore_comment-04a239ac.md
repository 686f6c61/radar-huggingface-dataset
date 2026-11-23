# believe-it-or-not/0524_original_augmented_fictional_anchoring_honeypot_ignore_comment-04a239ac

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) publicado por el usuario `believe-it-or-not` bajo el identificador `0524_original_augmented_fictional_anchoring_honeypot_ignore_comment-04a239ac`. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos de adaptador que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El nombre del repositorio sugiere un experimento sobre anclaje ficticio y "honeypots" (trampas para evaluar robustez frente a contenido inventado), aunque la model card no documenta objetivos, datos ni metodología.

La relevancia práctica de este artefacto es muy limitada: cuenta con cero descargas y cero "likes", el README es la plantilla estándar de Hugging Face sin rellenar (con marcadores `[More Information Needed]` en todas las secciones) y no se publica licencia, idiomas, pipeline ni resultados de evaluación. El tamaño del repositorio (1,7 GB) es coherente con un adaptador LoRA de rango relativamente alto sobre un modelo de 70 000 millones de parámetros, pero no se especifican rango, alpha ni módulos objetivo.

Por tanto, esta ficha describe un adaptador experimental no documentado, útil únicamente como referencia para quien quiera inspeccionar sus pesos o reproducir el pipeline PEFT 0.15.1 declarado. No debe considerarse un modelo listo para producción ni para uso comercial sin una auditoría previa de los pesos y del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (modelo base Llama 3.3 70B Instruct) |
| Parametros totales | no disponible (el adaptador es un subconjunto; el base tiene 70B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA, presumiblemente) que se inyecta en las capas del modelo base Llama 3.3 70B Instruct. La model card solo declara la versión de PEFT utilizada (0.15.1) y el modelo base; no se especifican rango (`r`), `lora_alpha`, `target_modules`, dropout ni si se entrenaron sesgos adicionales. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO o qué técnica de ajuste supervisado se aplicó.

El nombre del repositorio (`original_augmented_fictional_anchoring_honeypot_ignore_comment`) apunta a un experimento de robustez: generación de datos aumentados con anclajes ficticios y ejemplos trampa para medir si el modelo "pica" ante afirmaciones inventadas o ignora instrucciones incrustadas en comentarios. Sin embargo, al no publicarse el dataset ni la metodología, no es posible verificar esa hipótesis ni reproducir el entrenamiento. No hay innovaciones técnicas documentadas (ni decodificación especulativa, ni atención lineal, ni modos de razonamiento explícitos).

## Capacidades

- No hay capacidades documentadas específicas del adaptador; hereda las del modelo base Llama 3.3 70B Instruct (generación de texto, razonamiento, código, matemáticas, multilingüismo y tool calling).
- El ajuste podría alterar el comportamiento del base en el dominio del experimento (anclaje ficticio / honeypot), pero no se aporta evidencia.
- Soporte de tool calling y function calling: no verificado en el adaptador; depende del base.
- Soporte de agentes y razonamiento multi-paso: no verificado en el adaptador.
- Capacidades multilingües: no disponibles (no declaradas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Auditoría de seguridad de adaptadores LoRA: cargar el adaptador sobre el base y comparar respuestas frente a un conjunto de sondas de anclaje ficticio para detectar si el ajuste incrementa la susceptibilidad a alucinaciones inducidas.
- Investigación sobre robustez frente a "honeypots": usar el adaptador como ejemplo de fine-tuning adversarial y evaluar la tasa de caída en trampas de instrucciones incrustadas en comentarios.
- Reproducción de pipelines PEFT: servir como caso de prueba para validar la carga de adaptadores con `peft==0.15.1` y la integración con `transformers` y `accelerate`.
- Estudio de deriva de comportamiento: medir la divergencia entre el base y el adaptador en benchmarks estándar (MMLU, GSM8K) para cuantificar el coste del ajuste.
- Docencia y formación: ejemplo de repositorio con model card incompleta para enseñar buenas prácticas de documentación y trazabilidad de experimentos.
- Evaluación de riesgos en cadena de suministro de modelos: comprobar cómo un adaptador de origen desconocido puede modificar el comportamiento de un modelo de 70B antes de integrarlo en un pipeline interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa 1,7 GB en disco, pero la inferencia requiere cargar el modelo base Llama 3.3 70B Instruct completo.
- En precisión completa (bf16), el base de 70B requiere aproximadamente 140 GB de VRAM más el overhead del adaptador y del KV cache; no cabe en GPUs de consumo.
- Con cuantización de 4 bits (por ejemplo, GPTQ/AWQ o GGUF Q4_K_M), el base puede ocupar del orden de 35-40 GB de VRAM, lo que exige una A100 80 GB, H100 80 GB o varias RTX 4090/3090 en paralelo.
- En GPUs de consumo individuales (RTX 4090 de 24 GB) no cabe el base de 70B ni siquiera en 4 bits; sería necesario descargar a disco (offloading) o usar variantes destiladas, lo que invalidaría el adaptador.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (solo si se fusiona el adaptador y se convierte a GGUF), y `peft` + `transformers` para carga directa del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (believe-it-or-not/…-04a239ac) | Adaptador sobre 70B | No disponible (base 128k) | No disponible | 0 descargas | Sin documentación ni benchmarks |
| Llama 3.3 70B Instruct (base) | 70B | 128k | Llama 3.3 Community License | Amplia | Modelo de referencia con benchmarks públicos |
| Adaptadores LoRA comunitarios sobre Llama 3.3 70B | Variable | 128k | Variable | Variable | Ecosistema heterogéneo; calidad muy dispar |
| Qwen2.5 72B Instruct | 72B | 131k | Apache 2.0 (mayoría de variantes) | Amplia | Alternativa abierta con benchmarks publicados |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Model card vacía: todas las secciones relevantes (uso previsto, datos, evaluación, sesgos) contienen `[More Information Needed]`.
- Licencia no declarada: no se puede asumir uso comercial; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que impone restricciones adicionales.
- Origen y propósito del ajuste no verificados: el nombre sugiere un experimento de "honeypot", lo que podría implicar comportamientos deliberadamente engañosos o no alineados.
- Riesgo elevado de alucinación y de comportamiento impredecible por falta de evaluación.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Cero tracción comunitaria (0 descargas, 0 likes) y ausencia de issues o discusiones que permitan validar su calidad.
- No apto para producción sin auditoría previa de pesos, del dataset de entrenamiento y del impacto sobre el modelo base.
- Posible contaminación o envenenamiento de datos: al no documentarse la procedencia del dataset, no se puede descartar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_fictional_anchoring_honeypot_ignore_comment-04a239ac
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Librería PEFT: https://github.com/huggingface/peft
- Referencia del cálculo de emisiones citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
