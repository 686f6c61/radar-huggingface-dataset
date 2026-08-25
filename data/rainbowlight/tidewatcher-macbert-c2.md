# RainbowLIght/tidewatcher-macbert-c2

## Resumen

TideWatcher (望潮) es un modelo chino de detección de toxicidad y agresividad en textos cortos, desarrollado por RainbowLIght como componente de moderación local para la extensión de navegador «守望» (WeiboExtension). El modelo se basa en una variante de MacBERT (hfl/chinese-macbert-base) y está específicamente diseñado para interceptar comentarios agresivos en la plataforma social Weibo justo antes de que se publiquen, ofreciendo una intervención de tipo «recordatorio racional» en lugar de una censura dura.

El modelo está optimizado para inferencia local en CPU mediante cuantización ONNX INT8, con una latencia media de 34 ms por muestra y un tamaño de peso de 98 MB, lo que lo hace adecuado para ejecutarse en extensiones de navegador sin dependencias de API ni GPU. El modelo tiene 102,27 millones de parámetros, un contexto máximo de 64 tokens y una licencia Apache 2.0, lo que permite uso comercial sin restricciones.

TideWatcher implementa un sistema de clasificación en tres niveles: puntuaciones superiores a 0,9 se consideran ataque, inferiores a 0,1 se consideran seguro, y el rango intermedio se delega a un modelo de lenguaje grande para revisión. El modelo se entrenó con un conjunto de datos de etiquetado propio combinado con el dataset público chino de lenguaje ofensivo COLD (Apache-2.0), con configuración `c_macbert_lr3e-5_ep4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MacBERT (variante de hfl/chinese-macbert-base) |
| Parametros totales | 102.269.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | ONNX dinámico INT8 (model_int8.onnx, 98 MB) |
| Idiomas soportados | Chino (principalmente, adaptado a microblogging) |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (INT8), safetensors (PyTorch original) |

## Arquitectura y entrenamiento

TideWatcher se basa en la arquitectura MacBERT (Masked Language Model with Correction), que introduce un mecanismo de enmascaramiento correctivo para mitigar la discrepancia entre el preentrenamiento y las tareas posteriores. En lugar de enmascarar tokens con un token especial `[MASK]`, MacBERT utiliza palabras similares para reemplazar los tokens enmascarados, lo que reduce la brecha entre pre-entrenamiento y fine-tuning.

El modelo se entrenó con una configuración específica denominada `c_macbert_lr3e-5_ep4` (learning rate de 3e-5, 4 épocas), sobre un conjunto de datos de etiquetado propio (que se publicará próximamente) combinado con el dataset público COLD (Chinese Offensive Language Dataset, licencia Apache-2.0). El modelo de clasificación es una tarea de clasificación binaria de agresividad, donde la salida se calcula como una función sigmoide de la diferencia entre los logits de las dos clases. El modelo fue cuantizado a INT8 dinámico con ONNX para lograr una inferencia eficiente en CPU.

## Capacidades

- Detección de agresividad/toxicidad en textos cortos en chino (microblogging)
- Clasificación binaria con puntuación de probabilidad 0–1
- Sistema de clasificación en tres niveles: ataque (>0.9), seguro (<0.1), zona gris (0.1–0.9)
- Inferencia local en CPU sin dependencias de API ni GPU
- Compatibilidad con ONNX Runtime y tokenizador de Transformers
- Integración con pipelines de navegador mediante descarga directa de pesos ONNX
- Soporte de entrada truncada a 64 tokens, optimizado para frases cortas de redes sociales
- Sin capacidades de generación de texto, tool calling o agentes (es un modelo discriminativo de clasificación)

## Casos de uso

- Moderación preventiva en redes sociales: el modelo se integra en la extensión de navegador «守望» para interceptar mensajes agresivos antes de su publicación, mostrando un aviso de «consejo racional» al usuario.
- Filtrado de toxicidad en sistemas de comentarios: se puede integrar en plataformas de foros o blogs para detectar comentarios agresivos en tiempo real y aplicar políticas de moderación automática.
- Detección de acoso en juegos online: el modelo puede analizar el chat de juegos y alertar a los moderadores sobre mensajes agresivos entre jugadores.
- Análisis de sentimiento ofensivo en corpus de investigación: se puede usar para etiquetar grandes volúmenes de texto chino de microblogging y crear conjuntos de datos de entrenamiento para otros modelos.
- Sistemas de intervención de salud mental: el modelo puede detectar mensajes agresivos o autodestructivos en plataformas de apoyo, activando respuestas de ayuda.
- Auditoría de contenido en entornos corporativos: se puede utilizar para revisar comunicaciones internas (chat corporativo) y detectar lenguaje agresivo que pueda violar políticas de convivencia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| F1 (INT8, re-test) | 0.9004 |
| Latencia media (CPU) | 34 ms |
| Tamaño del modelo (INT8) | 98 MB |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K) en la información disponible. Los datos presentados corresponden a la evaluación interna del autor sobre el conjunto de test del modelo cuantizado.

## Requisitos de hardware

- Inferencia en CPU pura: no requiere GPU, funciona con ONNX Runtime y `CPUExecutionProvider`.
- Memoria RAM: aproximadamente 200 MB para cargar el modelo INT8 y el tokenizador.
- Compatible con cualquier CPU moderna (x86_64 o ARM) con soporte para ONNX Runtime.
- Despliegue en extensión de navegador: peso de 98 MB, adecuado para descarga local en el cliente.
- Latencia media de 34 ms por muestra en CPU, suficiente para aplicaciones en tiempo real.
- Opciones de despliegue: ONNX Runtime (Python, JS, C++), Hugging Face Transformers (para el modelo original safetensors), o integración directa en extensiones de navegador mediante WebAssembly (si se convierte).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea principal |
|---|---|---|---|---|
| TideWatcher (MacBERT) | 102M | 64 tokens | Apache 2.0 | Detección de toxicidad en chino |
| hfl/chinese-macbert-base | 102M | 512 tokens | Apache 2.0 | Modelo base pre-entrenado para chino |
| BERT-base-Chinese | 102M | 512 tokens | Apache 2.0 | Modelo base pre-entrenado para chino |
| RoBERTa-wwm-ext-Chinese | 102M | 512 tokens | Apache 2.0 | Modelo base pre-entrenado con whole word masking |

TideWatcher se diferencia de los modelos base por su fine-tuning específico para detección de agresividad en microblogging, con una ventana de contexto reducida (64 tokens) que optimiza la latencia y el tamaño para entornos de navegador. No existen modelos comparables directos con la misma especialización y formato ONNX INT8 en la información disponible.

## Limitaciones y advertencias

- Sesgos de contexto: el modelo puede no detectar correctamente expresiones con dependencia contextual como juegos de palabras, bromas entre conocidos o sarcasmo («阴阳怪气»), que requieren revisión de un modelo de lenguaje grande.
- Transferibilidad limitada: entrenado principalmente con textos cortos de microblogging de Weibo, su rendimiento puede degradarse en otros dominios (foros, artículos largos, chats formales) y requiere re-evaluación.
- Riesgo de falsos positivos/negativos: en la zona gris (score entre 0.1 y 0.9), el modelo delega la decisión a un modelo grande, lo que introduce una dependencia en el sistema de revisión.
- Restricciones de uso: el autor declara explícitamente que el modelo no debe usarse para censura de contenido, perfiles de identidad ni vigilancia represiva; solo para intervención preventiva y persuasiva.
- Datos de entrenamiento no publicados: el conjunto de datos propio aún no ha sido publicado, lo que dificulta la reproducción y la evaluación externa independiente.
- Contexto limitado: la ventana de 64 tokens puede ser insuficiente para textos largos, aunque es adecuada para la mayoría de mensajes de microblogging.

## Enlaces

- HuggingFace: https://huggingface.co/RainbowLIght/tidewatcher-macbert-c2
- Modelo base MacBERT: https://huggingface.co/hfl/chinese-macbert-base
- Repositorio MacBERT (GitHub): https://github.com/ymcui/MacBERT
- Organización TideWatcher (GitHub): https://github.com/TideWatcher/
- Dataset COLD (referencia): no disponible en la información proporcionada
