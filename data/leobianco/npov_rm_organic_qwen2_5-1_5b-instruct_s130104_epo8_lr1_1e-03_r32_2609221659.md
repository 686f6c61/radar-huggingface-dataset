# leobianco/npov_RM_organic_Qwen2_5-1_5B-Instruct_S130104_epo8_lr1_1e-03_r32_2609221659

## Resumen

El repositorio `leobianco/npov_RM_organic_Qwen2_5-1_5B-Instruct_S130104_epo8_lr1_1e-03_r32_2609221659` contiene un adaptador LoRA (PEFT) entrenado sobre el modelo instructivo denso `Qwen/Qwen2.5-1.5B-Instruct`. No se distribuye como modelo completo: el repositorio ocupa 0,1 GB y solo incluye los pesos del adaptador en formato safetensors, por lo que su uso requiere descargar por separado el modelo base. La nomenclatura del repositorio sugiere un modelo de recompensa (`RM`) orientado a evaluar texto con un criterio de neutralidad (`npov`) y a producir una puntuación escalar, aunque la model card no describe ni el dataset ni el objetivo de entrenamiento.

El adaptador se entrenó durante 8 épocas con rango LoRA `r=32`, tasa de aprendizaje aproximada de 1,09e-3, AdamW fused, programador coseno con un 10 % de calentamiento y semilla 130104, en configuración multi-GPU con 2 dispositivos y un batch total de 32. La evaluación reporta un ROC AUC de 0,9305 y una accuracy de 0,9388 con umbral óptimo 0,6424, métricas propias de una tarea de clasificación binaria o de puntuación de preferencias, no de generación abierta.

Su relevancia es acotada pero concreta: se trata de un artefacto de investigación derivado de una familia muy utilizada (Qwen2.5), publicado bajo licencia Apache 2.0 y sin descargas ni interacciones en el momento de redactar esta ficha. Resulta útil como pieza de un pipeline de filtrado, anotación o RLHF, pero no como sustituto de un modelo generativo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2.5-1.5B-Instruct |
| Parámetros totales | Modelo base: 1,5B (aproximadamente 1,54B). Adaptador: no disponible en detalle; rango LoRA r=32, tamaño del repositorio 0,1 GB |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; el modelo base Qwen2.5-1.5B-Instruct declara 32 768 tokens |
| Tipos de cuantización | No disponible para el adaptador (safetensors en precisión de entrenamiento). Al fusionar con el base se puede convertir a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base declara soporte multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con normalización RMSNorm, atención con RoPE y sesgo de atención QKV, en su variante instructiva afinada con datos de instrucciones y preferencias por el equipo de Qwen. El ajuste realizado aquí es un LoRA de rango 32 sobre ese base, gestionado con PEFT 0.20.0, Transformers 5.14.1 y PyTorch 2.11.0+cu130. No se documenta qué módulos se adaptaron (q_proj, v_proj u otros), ni el valor de `lora_alpha` o el `dropout`.

Los hiperparámetros registrados son: learning rate 1,0908e-3, batch de entrenamiento 16 por dispositivo con 2 dispositivos (32 efectivo) y batch de evaluación 64 efectivo, 8 épocas, programador coseno con `warmup_ratio` 0,1, optimizador AdamW fused con betas (0,9, 0,999) y epsilon 1e-8, y semilla 130104. El entrenamiento completo consta de 112 pasos; con 8 épocas esto implica 14 pasos por época, lo que permite estimar (de forma derivada, no declarada por el autor) un conjunto de entrenamiento de aproximadamente 448 ejemplos. El dataset se describe explícitamente como «unknown dataset» en la model card, por lo que no es posible auditar su composición, su idioma ni su procedencia.

Las métricas registradas (ROC AUC, mejor umbral, TPR, FPR, puntuación media de positivos y negativos) indican que el adaptador no se entrenó para generar texto, sino para emitir una puntuación escalar evaluable frente a un umbral; es decir, un modelo de recompensa o clasificador binario. No se documenta el uso de RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Puntuación escalar de texto: el adaptador produce una puntuación que puede umbralizarse (mejor umbral reportado: 0,6424) para decidir entre dos clases.
- Clasificación binaria de preferencia o calidad: métricas de ROC AUC 0,9305 y accuracy 0,9388 con el umbral óptimo en el conjunto de evaluación declarado.
- Separación de ejemplos positivos y negativos: puntuación media de 0,9618 para verdaderos positivos frente a 0,2822 para verdaderos negativos en la evaluación final.
- Capacidad generativa heredada: al cargarse junto al base Qwen2.5-1.5B-Instruct, el conjunto puede generar texto, pero el adaptador no fue entrenado para ello y su uso como generador no está validado en la ficha.
- Tool calling y function calling: no documentado en el adaptador; el modelo base Qwen2.5-1.5B-Instruct sí lo soporta.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas en el adaptador; heredadas, en su caso, del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Filtrado de contenido editorial con criterio de neutralidad: dado el nombre del repositorio (`npov`), el adaptador puede puntuar borradores o artículos y descartar aquellos cuya puntuación quede por debajo del umbral de 0,6424, integrándose en un pipeline de revisión previa a publicación.
- Anotación asistida de datasets de preferencias: usar la puntuación como preetiqueta para reducir el coste de anotación humana, reservando la revisión manual para los casos cercanos al umbral, donde el FPR reportado (0,2333) indica mayor incertidumbre.
- Componente de recompensa en RLHF o DPO: el adaptador puede actuar como `reward model` ligero para puntuar pares de respuestas generadas por un policy model, con la ventaja de que 1,5B parámetros permiten ejecutarlo en la misma GPU que el modelo generador.
- Reranking de candidatos: en un sistema de recuperación o generación con múltiples candidatos, el modelo puede ordenar las salidas por puntuación y seleccionar la mejor, con un coste de cómputo bajo frente a un juez basado en un LLM grande.
- Moderación o control de calidad en pipelines de datos sintéticos: puntuar cada muestra generada y descartar las que no superen el umbral, reduciendo el ruido antes del entrenamiento de un modelo mayor.
- Evaluación automática de experimentos A/B de prompts: comparar dos plantillas de prompt midiendo la distribución de puntuaciones del modelo de recompensa sobre las salidas de cada variante.
- Investigación sobre modelos de recompensa pequeños: al ser un LoRA de rango 32 sobre un base de 1,5B con licencia permisiva, sirve como banco de pruebas reproducible para estudiar umbralización, calibración y sobreajuste en modelos de recompensa de bajo coste.

## Benchmarks y rendimiento

El `model-index` del repositorio está vacío: no se declaran resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Los únicos datos disponibles son las métricas de validación registradas por el Trainer, que se reproducen a continuación tal cual.

Evaluación final (época 8, paso 112):

| Métrica | Valor |
|---|---|
| Loss de validación | 0,8242 |
| ROC AUC | 0,9305 |
| Mejor umbral | 0,6424 |
| TPR en el mejor umbral | 0,9829 |
| FPR en el mejor umbral | 0,2333 |
| Accuracy en el mejor umbral | 0,9388 |
| Puntuación media de verdaderos positivos | 0,9618 |
| Puntuación media de verdaderos negativos | 0,2822 |

Evolución durante el entrenamiento:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | ROC AUC | Accuracy (mejor umbral) |
|---|---|---|---|---|---|
| 0 | 0 | no registrada | 1,2354 | 0,3849 | 0,8027 |
| 1,7857 | 25 | 0,9238 | 1,0331 | 0,8734 | 0,7755 |
| 3,5714 | 50 | 1,4805 | 1,0444 | 0,9198 | 0,7483 |
| 5,3571 | 75 | 0,0086 | 0,6207 | 0,9214 | 0,8776 |
| 7,1429 | 100 | 0,0001 | 0,8507 | 0,9316 | 0,9320 |
| 8,0 | 112 | 0,0004 | 0,8242 | 0,9305 | 0,9388 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas internas de validación.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB, pero requiere el modelo base Qwen2.5-1.5B-Instruct completo para funcionar.
- VRAM estimada para el base en bf16/fp16: en torno a 3,1 GB de pesos, más memoria para activaciones y caché KV (típicamente 4-5 GB en total con contexto corto).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB de pesos; en 4 bits: aproximadamente 0,9-1,2 GB de pesos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, así como en equipos Apple Silicon con memoria unificada suficiente. No requiere A100 ni H100.
- Entrenamiento declarado: 2 dispositivos GPU en paralelo de datos con batch total 32. El hardware concreto (modelo de GPU, proveedor) no está especificado.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF. También es posible servirlo en Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo base del que deriva. Para otras alternativas de la misma categoría (modelos de recompensa de 1-2B), los datos no están disponibles en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (npov_RM) | Base 1,5B + LoRA r=32 | No especificado (base: 32 768 tokens) | apache-2.0 | safetensors (PEFT) | ROC AUC 0,9305 y accuracy 0,9388 en su propio conjunto de evaluación; dataset no documentado |
| Qwen2.5-1.5B-Instruct | 1,5B (aprox. 1,54B) | 32 768 tokens | apache-2.0 | safetensors, GGUF (comunidad) | Modelo base instructivo, generativo y con soporte de tool calling; no es un modelo de recompensa |
| Otros modelos de recompensa de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos comparables en la información disponible |

## Limitaciones y advertencias

- Dataset no documentado: la model card indica «unknown dataset». No es posible evaluar sesgos, cobertura lingüística, dominio de aplicación ni posibles filtraciones entre entrenamiento y evaluación.
- Riesgo de sobreajuste: la pérdida de entrenamiento cae hasta 0,0004 mientras la de validación se mantiene en 0,8242, una divergencia muy acusada que sugiere memorización del conjunto de entrenamiento.
- Tasa de falsos positivos elevada: 0,2333 en el umbral óptimo, es decir, aproximadamente una de cada cuatro muestras negativas se clasificaría como positiva. En un filtro de publicación esto implica dejar pasar contenido no conforme.
- Umbral sensible: el mejor umbral (0,6424) se calculó sobre un conjunto de validación no descrito; su traslado a otro dominio o idioma no está garantizado y requeriría recalibración.
- Alucinación: aunque la tarea principal es de puntuación, al cargarse con el base generativo el sistema completo puede generar texto y, por tanto, producir afirmaciones falsas. El adaptador no mitiga ese comportamiento.
- Idiomas: no se declara ningún idioma soportado en el adaptador. Un uso multilingüe es una extrapolación del base, no una capacidad verificada.
- Contexto: no se especifica una longitud de contexto efectiva para el adaptador; se hereda, como máximo, la del modelo base (32 768 tokens declarados).
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar que el modelo base y los datos de entrenamiento (desconocidos) no impongan restricciones adicionales.
- Reproducibilidad: la model card fue generada automáticamente y contiene secciones sin completar («More information needed»). No hay paper, demo ni documentación adicional.
- Adopción nula: cero descargas y cero «likes» en el momento del análisis, sin validación externa de las métricas declaradas.
- Fechas del repositorio: creación y actualización el 22 de septiembre de 2026, con una diferencia de un minuto entre ambas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leobianco/npov_RM_organic_Qwen2_5-1_5B-Instruct_S130104_epo8_lr1_1e-03_r32_2609221659
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- PEFT (librería del adaptador): https://github.com/huggingface/peft
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Artículo original de LoRA: https://arxiv.org/abs/2106.09685
- Búsqueda web: los resultados devueltos corresponden a páginas de Instagram (instagram.com, help.instagram.com, about.instagram.com, creators.instagram.com) y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este adaptador.
