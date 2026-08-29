# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-50000

## Resumen

Este repositorio contiene un **modelo de draft** para decodificación especulativa, entrenado con la técnica EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente, sino un componente auxiliar que, ejecutado junto al modelo objetivo en un motor de inferencia como SGLang, permite acelerar la generación de texto al predecir múltiples tokens por paso. El autor, `huluhuluu`, ha publicado 47 checkpoints de un mismo entrenamiento, y este repositorio corresponde al paso 50000 de la época 2.

El modelo tiene **202,7 millones de parámetros**, una arquitectura ligera de una sola capa de decoder con atención de ventana deslizante de 512 tokens, y se distribuye en formato `safetensors` con licencia Apache 2.0. Su relevancia radica en que ofrece una vía práctica para reducir la latencia de inferencia de Qwen3-4B-Instruct-2507 en despliegues de producción, sin necesidad de cuantizar el modelo principal ni sacrificar calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa de decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas clave/valor) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 (entrenamiento), ventana deslizante de draft de 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura **EAGLE3** (Extended Auto-regressive Generation with Language model Extrapolation), una técnica de decodificación especulativa que entrena un modelo pequeño (draft) para predecir los tokens que generaría el modelo objetivo. En este caso, el draft es una única capa de decoder con hidden size 2560, atención de ventana deslizante de 512 tokens y un vocabulario de draft de 32000 tokens, mientras que el modelo objetivo tiene un vocabulario de 151936 tokens. La diferencia de vocabulario se resuelve mediante una proyección aprendida durante el entrenamiento.

El entrenamiento se realizó con el método **online EAGLE3 / SpecForge**, usando datos ShareGPT limpios (formato JSONL) y un máximo de secuencia de 2048 tokens. Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, batch global efectivo de 4, learning rate 1e-4 con warmup lineal del 1.5% y decaimiento coseno, y weight decay 0. La longitud de entrenamiento EAGLE3 (TTT) fue de 7 tokens, y la atención del draft usó `sdpa`. El backend objetivo fue SGLang con `flashinfer`. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- **Aceleración de inferencia**: su función principal es generar borradores de tokens para decodificación especulativa, reduciendo la latencia de Qwen3-4B-Instruct-2507.
- **Integración con SGLang**: diseñado para usarse como ruta de draft en SGLang con configuración EAGLE3.
- **Compatibilidad estricta**: solo funciona con el modelo base exacto `Qwen/Qwen3-4B-Instruct-2507`; no es intercambiable con otras variantes.
- **No es un modelo de chat**: no genera respuestas de forma autónoma ni tiene capacidades de razonamiento, tool calling o agentes por sí mismo.
- **Multilingüismo heredado**: al operar junto al modelo base, hereda sus capacidades multilingües, pero no las aporta directamente.

## Casos de uso

- **Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia**: el modelo se integra en SGLang como draft path para acelerar la generación de respuestas en servicios de chat o asistentes virtuales, donde cada milisegundo de latencia impacta la experiencia del usuario.
- **Servicios de generación de código en tiempo real**: al reducir el tiempo de generación, permite autocompletados de código más rápidos en entornos IDE o pipelines de CI/CD que usan Qwen3-4B-Instruct-2507 como backend.
- **Procesamiento por lotes de alta concurrencia**: en APIs que atienden muchas peticiones simultáneas, la decodificación especulativa aumenta el throughput efectivo al reducir el número de pasos de decodificación por solicitud.
- **Experimentos de optimización de inferencia**: sirve como punto de partida para investigar y comparar configuraciones de árbol de draft en EAGLE3, ajustando el parámetro de árbol según la carga de trabajo.
- **Prototipado de sistemas de decodificación especulativa**: desarrolladores que quieran evaluar EAGLE3 sin entrenar un draft desde cero pueden usar este checkpoint ya entrenado.
- **Entornos con recursos GPU limitados**: al ser un modelo de solo 202M parámetros, el overhead de memoria adicional sobre el modelo base es mínimo, lo que permite desplegar decodificación especulativa en GPUs con VRAM ajustada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad durante el entrenamiento. El rendimiento en aceleración dependerá de la configuración de árbol de draft y de la carga de trabajo, por lo que se recomienda realizar pruebas propias.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo de draft ocupa aproximadamente 0,4 GB en `bfloat16`. Sin embargo, al ejecutarse junto al modelo base Qwen3-4B-Instruct-2507 (que pesa ~8 GB en `bfloat16`), la VRAM total necesaria es la suma de ambos: ~8,4 GB como mínimo para inferencia en `bfloat16`.
- **GPU recomendadas**: cualquier GPU con al menos 12 GB de VRAM puede ejecutar la combinación completa. Modelos como RTX 3060 12GB, RTX 4070, A10, A100, H100 son adecuadas. Para despliegues con mucha concurrencia, se recomienda A100 o H100.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con 12 GB o más, siempre que el modelo base quepa.
- **Opciones de despliegue**: SGLang es el backend principal y requerido (con soporte para EAGLE3). No se menciona compatibilidad con vLLM, llama.cpp u Ollama para este draft específico.
- **Latencia y throughput**: no disponible; depende de la configuración de árbol de draft y del hardware.

## Comparativa con modelos similares

No se dispone de información comparativa con otros draft models (como EAGLE-2, Medusa o EAGLE-1) en la documentación proporcionada. El repositorio oficial de EAGLE-Qwen3 (github.com/Yunhai-Hu/EAGLE-Qwen3) ofrece implementaciones de EAGLE-1 y EAGLE-2, pero no se han publicado comparaciones cuantitativas con este checkpoint concreto. Se recomienda evaluar el rendimiento relativo en el propio entorno de despliegue.

## Limitaciones y advertencias

- **No es un modelo standalone**: intentar usarlo como modelo de chat o generación directa producirá resultados inválidos o sin sentido.
- **Dependencia estricta del modelo base**: solo funciona con `Qwen/Qwen3-4B-Instruct-2507`; cualquier otro modelo objetivo invalidará su uso.
- **Sin métricas de seguridad**: la model card indica que no se realizaron evaluaciones de seguridad ni de sesgo durante el entrenamiento.
- **Datos de entrenamiento no auditados**: el dataset ShareGPT se describe como "local source" sin revisión registrada; puede contener sesgos o contenido inapropiado.
- **Ventana de atención limitada**: la ventana deslizante de draft de 512 tokens puede afectar la calidad de las predicciones en contextos muy largos, aunque el modelo base soporta contextos mayores.
- **Archivo de estado de entrenamiento**: el repositorio incluye `training_state.pt`, que contiene estado del optimizador y argumentos de entrenamiento. Solo debe deserializarse en entornos de confianza; para inferencia se debe usar `model.safetensors`.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 puede tener restricciones adicionales; se debe verificar la licencia del modelo base antes de uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-50000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Colección de checkpoints (referencia): https://huggingface.co/collections/huluhuluu (no verificado, se infiere de la model card)
