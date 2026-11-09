# elrashid/sae-qwen2.5-1.5b-instruct-topk-l14

## Resumen

`elrashid/sae-qwen2.5-1.5b-instruct-topk-l14` no es un modelo de lenguaje, sino un autoencoder disperso (sparse autoencoder, SAE) entrenado sobre las activaciones internas de Qwen2.5-1.5B-Instruct. En concreto, se extrae del flujo residual (residual stream) de la capa 14 del modelo base, con una dimensión de entrada de 1536 y un diccionario de 24576 características, usando una activación TopK con k=64. Lo desarrolla M. Elrashid (BUiD) como artefacto de investigación para el trabajo "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence".

El propósito del SAE es descomponer las activaciones del transformer en características interpretables y monitorizables, lo que permite estudiar qué rasgos internos se activan, cómo se degradan bajo cuantización y cómo se relacionan con comportamientos como el rechazo (refusal). Es relevante para quienes trabajan en interpretabilidad mecanística y seguridad de IA aplicada a modelos pequeños desplegados en el borde (edge), donde la cuantización es habitual.

El repositorio ocupa unos 0,3 GB, está implementado en PyTorch y se distribuye con licencia MIT, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El valor de factor de varianza no explicada (FVU) reportado es de 0,2908, lo que da una idea de la fidelidad de la reconstrucción de activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK sobre el flujo residual de la capa 14 de Qwen2.5-1.5B-Instruct |
| Parametros totales | no disponible (d_in=1536, d_sae=24576, k=64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (artefacto de interpretabilidad, no generativo) |
| Tipos de cuantizacion | no disponible (el SAE se usa para analizar los efectos de la cuantizacion del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5-1.5B-Instruct, 29+ idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repo de 0,3 GB); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un autoencoder disperso con activación TopK. Toma como entrada las activaciones del flujo residual de la capa 14 del transformer de Qwen2.5-1.5B-Instruct (dimensión 1536) y las proyecta a un diccionario sobredimensionado de 24576 características, de las cuales solo se mantienen activas las k=64 de mayor magnitud en cada paso. Esta formulación fuerza una representación dispersa y, en principio, más interpretable que las activaciones densas originales.

El entrenamiento emplea la "receta v2", que incorpora eliminación del token BOS (BOS-drop) y estandarización por dimensión (per-dim standardization). El conjunto de datos indicado es `monology/pile-uncopyrighted`. El modelo reporta un FVU de 0,2908, métrica que cuantifica la fracción de varianza no explicada por la reconstrucción. No se dispone de información sobre número de tokens de entrenamiento, hiperparámetros de optimización ni detalles de la función de pérdida más allá de lo indicado.

## Capacidades

- Extracción de características interpretables de las activaciones de la capa 14 de Qwen2.5-1.5B-Instruct.
- Reconstrucción y descomposición dispersa del flujo residual (d_in=1536, d_sae=24576, k=64).
- Análisis de la evolución de características bajo cuantización del modelo base (taxonomía del "refusal slope").
- Monitorización de rasgos internos asociados a comportamientos como el rechazo.
- Soporte para estudios de interpretabilidad mecanística y seguridad de IA.
- No realiza generación de texto, tool calling, razonamiento multietapa ni capacidades multimodales por sí mismo: es un componente de análisis.

## Casos de uso

- Investigación en interpretabilidad mecanística: cargar el SAE y proyectar activaciones de la capa 14 para identificar características activas ante estímulos concretos, permitiendo estudiar qué rasgos codifica el modelo.
- Análisis del efecto de la cuantización: comparar las características extraídas del modelo en precisión completa frente a versiones cuantizadas para trazar qué rasgos se degradan o desaparecen, tal como propone el trabajo asociado.
- Estudio del comportamiento de rechazo: usar el SAE para localizar direcciones de características correlacionadas con respuestas de rechazo y analizar su pendiente bajo distintas condiciones.
- Auditoría de seguridad de modelos en el borde: monitorizar activaciones internas de un modelo pequeño desplegado en dispositivos con recursos limitados para detectar cambios de comportamiento.
- Docencia y formación: servir como ejemplo práctico de entrenamiento y uso de SAEs TopK sobre un transformer pequeño y abierto.
- Reproducibilidad de investigación: reutilizar el artefacto para replicar o extender los resultados del paper "The Refusal Slope" con el mismo modelo base y capa.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FVU (fraccion de varianza no explicada) | 0,2908 |
| d_in | 1536 |
| d_sae | 24576 |
| k (TopK) | 64 |
| Capa | 14 (flujo residual) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el artefacto ocupa 0,3 GB y opera sobre activaciones de dimensión 1536, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM (RTX 3060, RTX 4090, A100, H100); el cuello de botella real es ejecutar el modelo base Qwen2.5-1.5B-Instruct para extraer activaciones.
- Cabe en GPU consumer: sí, tanto el SAE como el modelo base de 1,5B en cuantizaciones de 4-8 bits.
- Opciones de despliegue: PyTorch para el SAE; para el modelo base, vLLM, llama.cpp, Ollama o TGI según el flujo de extracción de activaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Capa / dim | Licencia | Acceso |
|---|---|---|---|---|---|
| elrashid/sae-qwen2.5-1.5b-instruct-topk-l14 | SAE TopK | Qwen2.5-1.5B-Instruct | L14 / 1536 | MIT | Restringido |
| Qwen/Qwen2.5-1.5B-Instruct | LLM instruct | — | — | Apache 2.0 (segun modelo base) | Abierto |
| Otros SAE publicos sobre Qwen2.5-1.5B | SAE | Qwen2.5-1.5B-Instruct | variable | variable | no disponible |

No se dispone de información sobre otros SAEs comparables entrenados sobre el mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, código ni tareas de texto; es un artefacto de análisis.
- El FVU de 0,2908 implica que una fracción relevante de la varianza no se reconstruye; las características pueden ser incompletas o ruidosas.
- Entrenado únicamente sobre la capa 14; no cubre otras capas ni el comportamiento global del modelo.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede limitar la reproducibilidad automatizada.
- Riesgo de interpretaciones erróneas: las características del SAE no equivalen necesariamente a conceptos humanos; requieren validación empírica.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct y del dataset Pile-uncopyrighted.
- No se documentan sesgos específicos del SAE; los sesgos heredados del modelo base no se abordan en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/elrashid/sae-qwen2.5-1.5b-instruct-topk-l14
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- DOI: https://doi.org/10.57967/hf/9449
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
- Documentación Qwen2.5-1.5B-Instruct (M5Stack): https://docs.m5stack.com/en/stackflow/models/qwen2.5-1.5b-instruct
- Resumen del modelo base: https://dev.co/ai/llms/qwen2-5-1-5b-instruct
