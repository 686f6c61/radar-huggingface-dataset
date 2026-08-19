# miss-t/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es un modelo de lenguaje de 27.781 millones de parámetros (27,78B) derivado de Qwen/Qwen3.8-27B de Alibaba, desarrollado por miss-t dentro del proyecto AEON-7. Se trata de una versión "abliterada" (refusal-removed) que elimina los comportamientos de rechazo del modelo base manteniendo la coherencia y las capacidades de razonamiento. El proceso de abliteración se realizó con la herramienta abliterix 1.12.2 y optimización Optuna de 50 ensayos, seleccionando el ensayo 48 como punto óptimo entre desbloqueo de respuestas y coherencia.

El modelo conserva la torre de visión original (333/333 tensores con hash idéntico al modelo base) y la cabeza MTP (Multi-Token Prediction) nativa, lo que lo convierte en un modelo multimodal capaz de procesar imágenes y texto. La arquitectura emplea atención híbrida con gated-deltanet (GDN), una innovación de Qwen 3.8 que combina atención tradicional con capas de estado. El contexto nativo alcanza 262.144 tokens (validado a 16.384 en las pruebas de referencia). Se distribuye bajo licencia Apache 2.0 en formato BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con gated-deltanet (GDN) y atención por ventana; multimodal (visión + texto) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (validado a 16.384) |
| Tipos de cuantizacion | BF16 (referencia); NVFP4 planificado; GGUF Q4
