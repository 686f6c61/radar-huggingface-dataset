# AJ-Gonzalez/indiedev-lfm3-1.7b

## Resumen

indiedev-lfm3-1.7b es un ajuste fino por LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por AJ-Gonzalez y publicado en Hugging Face. El modelo parte del checkpoint oficial cuantizado a 4 bits en formato MLX del modelo base de Liquid AI, se entrena con LoRA sobre 128 trazas de razonamiento del perfil "IndieDev" de un conjunto de destilación de 250 filas y se fusiona a bfloat16. Forma parte de una serie planificada de tres subconjuntos (Coder, IndieDev y GenAgent), de los cuales este es el segundo publicado.

El objetivo no es ensenar una capacidad nueva, sino sesgar un modelo ya existente hacia un formato de "razonamiento y luego respuesta", imitando el estilo de las trazas del profesor. Con 1.728.801.536 parametros totales, una ventana de entrenamiento de 2048 tokens y una licencia LFM Open License v1.0, el modelo esta pensado para ejecutarse en Apple Silicon mediante `mlx-lm`.

Es relevante ahora porque demuestra un flujo de ajuste fino reproducible en hardware muy modesto (un MacBook Air M1 con 8 GB de memoria unificada) y porque documenta de forma transparente el proceso de seleccion de checkpoint, la tokenizacion por ventanas con solapamiento y las limitaciones del conjunto de datos. No se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de Liquid AI); pesos en formato MLX con `modeling_lfm3.py` y `configuration_lfm3.py` |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de entrenamiento; el modelo base puede soportar mas, no confirmado en la informacion disponible) |
| Tipos de cuantizacion | El repositorio contiene pesos bfloat16 fusionados y desquantizados; se recomienda recuantizar a 4 bits para uso interactivo en 8 GB |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | safetensors en formato MLX |
| Libreria | mlx |
| Modelo base | LiquidAI/LFM3-1.7B (entrenado desde LiquidAI/LFM3-1.7B-MLX-4bit) |
| Metodo de ajuste | LoRA, rango 8, 8 de 24 capas, 2,753 M parametros entrenables (0,159 %) |
| Tamano del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer LFM3 de Liquid AI, con 24 capas segun se deduce del numero de capas entrenadas (8 de 24). El ajuste fino se realizo mediante LoRA de rango 8 aplicado a 8 de las 24 capas, con gradient checkpointing activado para evitar errores de memoria (`kIOGPUCommandBufferCallbackErrorOutOfMemory`) en un MacBook Air M1 con 8 GB de memoria unificada. Se entrenaron 2,753 millones de parametros (0,159 % del total).

Los datos de entrenamiento provienen de `AJ-Gonzalez/lfm3-distill-250x`, configuracion `indiedev`: 128 prompts que generan 515 ejemplos de entrenamiento y 37 de validacion (116 filas de entrenamiento y 12 retenidas). Las trazas largas del asistente se dividieron en ventanas de 2048 tokens con 256 tokens de solapamiento del contexto previo, de modo que cada token se entreno exactamente una vez por epoca. Se usaron batch 1, learning rate 1e-5 con Adam, 515 iteraciones por epoca y 3 epocas (1545 iteraciones en total), con un rendimiento de 150-172 tok/s (163 tok/s de media) y 4 h 50 min para las tres epocas. Se libera la epoca 2 por tener el mejor NLL retenido completo (1.640), aunque la diferencia con las epocas 1 y 3 (1.643 y 1.646) esta dentro del ruido.

## Capacidades

- Generacion de texto conversacional en ingles con formato explicito de razonamiento previo a la respuesta: produce trazas normativas del tipo "The user asks... We need to..." dentro de etiquetas `<think>` antes de la respuesta final.
- Razonamiento estructurado orientado a planificacion de producto y negocio para desarrolladores independientes (planes de lanzamiento, tablas por fases).
- Generacion de prosa tecnica coherente en pruebas de humo con decodificacion greedy y 512 tokens.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizador base.
- No incluye entrenamiento en tool calling ni function calling.
- No incluye entrenamiento en contexto largo (mas alla de 2048 tokens).
- Capacidad multilingue limitada al ingles.
- No dispone de vision, audio ni modo thinking nativo mas alla del formato aprendido por imitacion.

## Casos de uso

- Prototipado de planes de lanzamiento para productos SaaS pequenos: el modelo genera esquemas por fases y tablas de hitos, adecuado para equipos de dos personas que necesitan un borrador estructurado rapido en local.
- Asistente de razonamiento en local para desarrolladores independientes: al ejecutarse en `mlx-lm` sobre Apple Silicon, permite iterar sobre ideas de producto sin enviar datos a servicios externos.
- Generacion de documentacion tecnica con estructura argumentativa: el formato de razonamiento previo ayuda a producir justificaciones explicitas de decisiones de diseno.
- Experimentacion academica sobre destilacion y ajuste fino con LoRA: el modelo sirve como caso de estudio reproducible de entrenamiento en hardware de 8 GB con seleccion de checkpoint por NLL retenido.
- Base para ablaciones de formato de razonamiento: al ser uno de tres subconjuntos (Coder, IndieDev, GenAgent) con solapamiento documentado, permite comparar el efecto del perfil de datos.
- Generacion de borradores de contenido para blogs tecnicos o fichas de producto, con la advertencia de que requiere revision humana por riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna suite de benchmarks. La unica metrica reportada es el NLL de tokens retenidos:

| Modelo | NLL retenido IndieDev (menor es mejor) |
|---|---|
| Base (4 bits) | 1,818 |
| Epoca 1 (515 iteraciones) | 1,643 |
| Epoca 2 (1030 iteraciones, publicada) | 1,640 |
| Epoca 3 (1545 iteraciones) | 1,646 |

Prueba de humo de generacion (greedy, 512 tokens): 16,9 tok/s y 3,50 GB de pico de memoria con el modelo bf16 fusionado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB para los pesos bf16 fusionados; el autor reporta 3,50 GB de pico en generacion con bf16. Para uso interactivo en 8 GB se recomienda recuantizar a 4 bits.
- GPU recomendadas: Apple Silicon (M1, M2, M3 y superiores) mediante `mlx-lm`. El entrenamiento se completo en un MacBook Air M1 con 8 GB de memoria unificada.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 8 GB o mas de memoria unificada; no se documenta soporte CUDA en la informacion disponible.
- Opciones de despliegue: `mlx-lm` es la via documentada. El modelo base LFM3-1.7B es compatible con vLLM, SGLang y compilaciones de llama.cpp compatibles con LFM3, pero esta ficha no confirma que el checkpoint ajustado funcione en esos motores.
- Latencia y throughput: 16,9 tok/s en generacion greedy con bf16 en el hardware del autor; 150-172 tok/s durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indiedev-lfm3-1.7b | 1,73 B | 2048 (entrenamiento) | LoRA SFT sobre LFM3, formato razonamiento | LFM Open License v1.0 | Hugging Face, formato MLX |
| AJ-Gonzalez/coder-lfm3-1.7b | 1,73 B (base) | 2048 (entrenamiento) | LoRA SFT sobre LFM3 con 70 trazas de codigo | LFM Open License v1.0 | Hugging Face, formato MLX |
| LiquidAI/LFM3-1.7B | 1,73 B | no disponible en la informacion proporcionada | Modelo base sin ajuste | LFM Open License v1.0 | Hugging Face, multiples formatos (incluye GGUF) |

## Limitaciones y advertencias

- El conjunto de datos es muy pequeno (128 prompts, 5 grupos tematicos, 3 epocas); no ensena capacidades nuevas, solo sesga el formato de respuesta.
- El conjunto de validacion es de 12 prompts (37 fragmentos), por lo que las diferencias entre epocas estan dentro del ruido estadistico.
- Las trazas fueron producidas por `xiaomi/mimo-v2.6-pro` a partir de un conjunto originado en `TeichAI/claude-4.5-opus-high-reasoning-250x`, por lo que el estilo objetivo es de segunda mano.
- No hay ajuste de seguridad, ni entrenamiento en tool calling, ni entrenamiento en contexto superior a 2048 tokens.
- Los perfiles se solapan por diseno: IndieDev con Coder comparte 61 filas e IndieDev con GenAgent comparte 67 filas, lo que puede introducir sesgos de contenido.
- Riesgo de alucinacion inherente al modelo base de 1,7 B y al formato de razonamiento imitado; requiere validacion humana en produccion.
- Solo soporta ingles; no se documenta calidad en castellano ni en otros idiomas.
- La licencia LFM Open License v1.0 se etiqueta como "other" en el Hub; los datos de entrenamiento derivan de un dataset con licencia "other", por lo que debe verificarse antes de redistribuir los pesos con fines comerciales.
- El checkpoint se distribuye en formato MLX; su uso fuera de Apple Silicon no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/indiedev-lfm3-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Subconjunto Coder de la misma serie: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b
- Dataset de destilacion: https://huggingface.co/datasets/AJ-Gonzalez/lfm3-distill-250x
- Dataset de trazas de origen: https://huggingface.co/datasets/xtools-at/Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x
- Dataset de prompts original: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
