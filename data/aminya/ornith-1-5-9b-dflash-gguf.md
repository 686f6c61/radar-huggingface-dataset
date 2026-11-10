# aminya/Ornith-1.5-9B-DFlash-GGUF

## Resumen

Ornith-1.5-9B-DFlash-GGUF es la versión cuantizada en formato GGUF del modelo borrador (draft model) DFlash del sistema Ornith-1.5-9B, publicada por el usuario aminya a partir del repositorio original de ornith-ai. No se trata de un modelo de lenguaje autónomo: es un componente de decodificación especulativa que propone bloques de tokens en paralelo mediante difusión por bloques, mientras que el modelo objetivo Ornith-1.5-9B verifica esas propuestas y produce la salida final. Su función es acelerar el throughput de decodificación sin alterar la distribución de salida del modelo objetivo.

El modelo base, Ornith-1.5-9B, es el miembro más ligero de la familia Ornith-1.5, un modelo denso de 9B parámetros diseñado para despliegue eficiente en una sola GPU. Ornith-1.5 extiende Ornith-1.0 (construido sobre Qwen3.5 y Gemma4 con pretraining continuado, mid-training y post-training adicionales) ampliando el bucle de auto-mejora desde la optimización de scaffolds y rollouts hasta la optimización conjunta de generación de tareas, construcción de scaffolds y rollouts de soluciones mediante aprendizaje por refuerzo.

Esta variante GGUF resulta relevante para desarrolladores que ya despliegan Ornith-1.5-9B con llama.cpp y quieren reducir la latencia de decodificación mediante decodificación especulativa compatible con DFlash. El repositorio incluye una referencia BF16 y múltiples cuantizaciones del borrador (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS, IQ3_S, IQ3_M), con un tamaño total de repo de 9,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de difusión por bloques (block-diffusion) para decodificación especulativa; el modelo objetivo Ornith-1.5-9B es un transformer denso |
| Parametros totales | 1.291.904.512 (según safetensors del repo; el nombre comercial "9B" corresponde al modelo objetivo, no al borrador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el borrador; el ejemplo de llama.cpp usa `--ctx-size 32768` para el modelo objetivo |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS, IQ3_S, IQ3_M (no se incluyen IQ3_XXS ni IQ3_XS por falta de importance matrix) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con referencia BF16) |

## Arquitectura y entrenamiento

El borrador DFlash emplea difusión por bloques (block-diffusion) para proponer múltiples tokens en paralelo, con un tamaño de bloque de 16 según la configuración original. En el pipeline de decodificación especulativa, el borrador genera propuestas de tokens que el modelo objetivo Ornith-1.5-9B verifica, preservando la distribución de salida del objetivo. Los dos modelos tienen roles distintos y deben cargarse conjuntamente: el borrador no puede atender peticiones por sí solo.

El modelo objetivo Ornith-1.5-9B se entrena mediante un bucle de auto-mejora end-to-end que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo, en lugar de depender de un conjunto fijo de tareas curadas manualmente. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de tokens especulativos en paralelo para acelerar la decodificación del modelo objetivo Ornith-1.5-9B.
- Integración con llama.cpp mediante decodificación especulativa DFlash (`--spec-type draft-dflash`).
- Compatibilidad con decodificación especulativa de hasta 8 tokens por paso en el ejemplo de despliegue.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step de forma autónoma: esas capacidades residen en el modelo objetivo.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponible (no es un modelo conversacional standalone; el tag `conversational` del repo aplica al sistema completo).

## Casos de uso

- Aceleración de inferencia en producción: cargar el borrador Q8_0 junto al GGUF objetivo Ornith-1.5-9B en llama.cpp para reducir la latencia de decodificación manteniendo la distribución de salida del objetivo.
- Despliegue en una sola GPU: el borrador cuantizado en Q4_K_M o IQ4_XS reduce el coste de memoria adicional del pipeline especulativo, permitiendo servir Ornith-1.5-9B en GPUs de gama consumer.
- Servicio de chat interactivo: usar `--spec-draft-n-max 8` y contexto de 32768 tokens para conversaciones multi-turno con mayor throughput.
- Generación de código asistida: con los parámetros de muestreo recomendados para tareas de código precisas (temperatura 0.6, top-p 0.95, top-k 20), el pipeline especulativo acelera la generación de parches y snippets.
- Experimentación con decodificación especulativa: el repositorio ofrece múltiples cuantizaciones (BF16 hasta IQ3_M) para medir el compromiso entre tasa de aceptación del borrador, memoria y velocidad.
- Integración en pipelines de CI/CD para evaluación de modelos: permite comparar la salida del pipeline especulativo con la del objetivo sin cambiar la distribución final.
- Evaluación en dispositivos de recursos limitados: junto a la variante Ornith-1.5-9B-Mobile, el borrador cuantizado facilita despliegues en entornos con poca VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de evaluación de Ornith-1.5-9B, pero corresponde al modelo objetivo, no a estas variantes DFlash GGUF. No se proporcionan cifras de tasa de aceptación del borrador, speedup de decodificación ni latencias.

## Requisitos de hardware

- VRAM estimada para el borrador: no disponible de forma explícita; el repo completo ocupa 9,3 GB, pero cada archivo cuantizado individual es considerablemente menor (el borrador tiene ~1,29 mil millones de parámetros).
- GPU recomendadas: no disponible. El modelo objetivo Ornith-1.5-9B está diseñado para despliegue en una sola GPU.
- Cabe en GPU consumer: probablemente sí para el borrador cuantizado, pero requiere además el modelo objetivo Ornith-1.5-9B cargado en memoria; no se especifican requisitos conjuntos.
- Opciones de despliegue: llama.cpp con soporte de decodificación especulativa DFlash (`llama-server` con `--spec-draft-model` y `--spec-type draft-dflash`). No se mencionan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-DFlash (este) | ~1,29 mil millones | no disponible | Borrador de decodificación especulativa | MIT | GGUF en HF |
| Ornith-1.5-9B (objetivo) | 9B (denso) | no disponible | Modelo de lenguaje objetivo | no disponible | HF (ornith-ai) |
| Ornith-1.5-9B-Mobile | no disponible | no disponible | Variante cuantizada para móvil | no disponible | HF |

No se dispone de información sobre otros borradores de decodificación especulativa comparables ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El borrador no es un modelo standalone: no puede atender peticiones por sí solo y debe cargarse con un GGUF compatible del objetivo Ornith-1.5-9B.
- Borrador y objetivo deben ser compatibles; una incompatibilidad puede producir fallos o degradación de la salida.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de idioma del borrador.
- Licencia MIT para el borrador; la licencia del modelo objetivo no se especifica en la información disponible.
- No se incluyen variantes IQ3_XXS e IQ3_XS por falta de importance matrix.
- La fecha de creación del repo (2026-11-09) y el nombre "Qwen3.5" en los tags sugieren una base Qwen, pero no se detalla la composición exacta del entrenamiento.
- El tamaño de parámetros del repo safetensors (1,29 mil millones) no coincide con la denominación "9B" del modelo objetivo; debe interpretarse como el tamaño del borrador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aminya/Ornith-1.5-9B-DFlash-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
