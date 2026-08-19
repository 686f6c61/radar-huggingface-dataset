# mobiletransformers/gemma-3-270m-it

## Resumen

Este paquete es una exportación del modelo google/gemma-3-270m-it de Google, preparado para ejecución en dispositivos Android mediante el framework MobileTransformers. No es un modelo Hugging Face estándar: combina un manifiesto, etapas ONNX por variante y un mapa de transferencia de pesos, orientado a inferencia y ajuste fino en el dispositivo.

Incluye tres funcionalidades: core (archivos compartidos), inference (generación y scoring) y train (ajuste fino en el dispositivo con fusión del adaptador en los pesos base). La cuantización es int4 y la única variante disponible es cpu-int4. El ajuste fino usa MARS (Multi-Adapter Rank Sharing), método propio del proyecto que comparte adaptadores entre capas, de modo que el número de parámetros crece con el rango y no con la profundidad. El modelo base, Gemma 3 270M, es un transformer decoder-only de aproximadamente 270 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: google/gemma-3-270m-it) |
| Parametros totales | ~270 millones (modelo base); repositorio de 2.4 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.000 tokens (segun especificaciones publicas del modelo base Gemma 3 270M) |
| Tipos de cuantizacion | int4 (variante cpu-int4) |
| Idiomas soportados | no disponible en la documentacion del paquete; el modelo base Gemma 3 es multilingue (mas de 140 idiomas segun Google) |
| Licencia | No declarada en el paquete; rigen los terminos del modelo base google/gemma-3-270m-it |
| Formato de pesos | ONNX (manifiesto + etapas ONNX por variante + mapa de transferencia de pesos) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 270M, un transformer decoder-only de Google con aproximadamente 270 millones de parámetros. El paquete MobileTransformers lo exporta a ONNX con cuantización int4, usando la toolchain optimum-onnx 0.1.0, transformers 4.57.6 y ort-training 1.23
