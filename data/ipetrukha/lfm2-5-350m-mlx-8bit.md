# ipetrukha/LFM2.5-350M-MLX-8bit

## Resumen

Este modelo es una re-cuantización de 8 bits del modelo base `LiquidAI/LFM2.5-350M`, creada por el usuario `ipetrukha` para el ecosistema MLX de Apple. El objetivo principal es ofrecer una versión cuantizada que almacene las escalas y biases de cuantización en **bfloat16**, en lugar de float32 como hace la versión oficial de MLX, lo que permite comparar motores de inferencia bajo un mismo dtype de activación.

El modelo original, `LiquidAI/LFM2.5-350M`, es un modelo de lenguaje generativo de 354 millones de parámetros (354.483.968 exactamente), etiquetado como `text-generation` y `conversational`, con soporte de inglés. Esta re-cuantización no añade capacidades nuevas, sino que adapta los pesos para su ejecución eficiente en Apple Silicon utilizando la librería `mlx-lm`. El tamaño del repositorio es de 0.4 GB, lo que lo hace especialmente ligero para entornos con memoria limitada.

La relevancia de este checkpoint radica en su utilidad como referencia para benchmarks cross-engine, ya que la diferencia en el dtype de las escalas y biases puede influir en los resultados de inferencia. No se ha publicado información sobre arquitectura, longitud de contexto ni rendimiento en la ficha del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64, escalas y biases en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura del modelo base ni sobre sus datos de entrenamiento. Solo se sabe que es una re-cuantización del modelo `LiquidAI/LFM2.5-350M` realizada con `mlx-lm 0.31.3`. La cuantización es affine de 8 bits con group size 64 y sin overrides por capa, siguiendo la misma receta que la versión oficial `LiquidAI/LFM2.5-350M-MLX-8bit`.

La única diferencia técnica documentada es que las escalas y biases de cuantización se almacenan en bfloat16 en lugar de float32. Esto no modifica la arquitectura ni el entrenamiento original, pero puede afectar a la precisión numérica durante la inferencia. No se ha publicado información sobre el proceso de entrenamiento, el dataset utilizado o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- No se han documentado capacidades específicas en la información proporcionada.
- El modelo está etiquetado como `text-generation` y `conversational`, lo que indica que puede generar texto y mantener conversaciones.
- Soporta el idioma inglés, según los metadatos de HuggingFace.
- Al ser una re-cuantización, no añade capacidades nuevas respecto al modelo base.
- No hay información sobre soporte de tool calling, agentes, visión, audio o razonamiento multi-step.

## Casos de uso

Los siguientes casos son potenciales, basados en el tamaño del modelo y su cuantización, pero no están respaldados por evaluaciones publicadas del modelo.

- Asistente conversacional local en Apple Silicon: al estar cuantizado a 8 bits y pesar menos de 0.5 GB, puede ejecutarse en un Mac con MLX para ofrecer respuestas en tiempo real sin conexión.
- Generación de texto en aplicaciones de productividad: puede integrarse en editores o herramientas de escritura para autocompletar o resumir texto, aprovechando su bajo coste de memoria.
- Clasificación de texto ligera: su tamaño reducido permite clasificar correos, tickets o comentarios en entornos con recursos limitados.
- Extracción de información en documentos: puede usarse para extraer entidades o datos estructurados de textos cortos, aunque su capacidad puede ser limitada.
- Chatbot de soporte en dispositivos edge: en dispositivos Apple (iPhone, iPad, Mac) puede proporcionar respuestas básicas sin depender de servicios en la nube.
- Prototipado rápido de pipelines NLP: al ser pequeño y cuantizado, permite iterar rápidamente en experimentos de NLP en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~0.4 GB para los pesos cuantizados, más overhead de activaciones (en total <1 GB).
- GPU recomendada: Apple Silicon (M1 o posterior) con MLX. No se recomienda GPU NVIDIA, ya que MLX es específico del ecosistema Apple.
- Cabe en consumer GPU: sí, en cualquier Mac con Apple Silicon, incluso con 8 GB de RAM unificada.
- Opciones de despliegue: `mlx-lm` (librería MLX). También puede convertirse a GGUF para usarse con llama.cpp, aunque no está documentado en el repo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| ipetrukha/LFM2.5-350M-MLX-8bit | 354M | 8-bit MLX (bfloat16) | No disponible | No disponible | No disponible |
| LiquidAI/LFM2.5-350M | 354M | Sin cuantizar | No disponible | No disponible | LFM 1.0 (según búsqueda web) |
| LiquidAI/LFM2.5-350M-MLX-8bit | 354M | 8-bit MLX (float32) | No disponible | No disponible | LFM 1.0 (según búsqueda web) |

La diferencia principal entre el modelo de `ipetrukha` y la versión oficial de MLX es el dtype de las escalas y biases de cuantización: bfloat16 frente a float32. Esto puede influir en la precisión y en los resultados de benchmarks cross-engine, pero no hay datos publicados que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones para este modelo.
- Solo se documenta soporte del idioma inglés; no hay información sobre otros idiomas.
- La licencia no está especificada en el repositorio. El modelo base utiliza la licencia LFM 1.0, que puede incluir restricciones para uso comercial. Es necesario revisar la licencia original antes de usar el modelo en producción.
- Es una re-cuantización no oficial, con 0 descargas y 0 likes, por lo que puede tener problemas de compatibilidad o errores no detectados.
- El tamaño del modelo (354M) limita su capacidad de razonamiento complejo en comparación con modelos más grandes.
- No hay información sobre la longitud de contexto, lo que impide conocer los límites de ventana de atención.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ipetrukha/LFM2.5-350M-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Versión oficial MLX 8-bit: https://huggingface.co/LiquidAI/LFM2.5-350M-MLX-8bit
