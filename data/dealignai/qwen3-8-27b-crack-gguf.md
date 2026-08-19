# dealignai/Qwen3.8-27B-CRACK-GGUF

## Resumen

Qwen3.8-27B-CRACK-GGUF es una version "abliterada" (CRACK) del modelo Qwen3.8-27B de Alibaba, publicada por Dealign.ai en formato GGUF para su uso con llama.cpp. Se trata de un modelo hibrido vision-lenguaje de 27.320 millones de parametros que combina atencion lineal recurrente GatedDeltaNet (48 capas) con atencion completa (16 capas), con una ventana de contexto de 262.000 tokens. La modificacion principal consiste en la eliminacion del comportamiento de rechazo (refusal), de modo que el modelo sigue instrucciones que la version original declinaria, manteniendo las capacidades de conocimiento, razonamiento multi-paso, codificacion y comprension de imagen y video.

La relevancia de este modelo reside en dos aspectos. Por un lado, es de las primeras publicaciones que lleva el esquema de razonamiento controlable (reasoning_effort low/medium/xhigh) y la cabeza nativa de prediccion multi-token (MTP) a formato GGUF, incluyendo el proyector de vision en todas las cuantizaciones. Por otro, al ser una version sin censura, esta orientado a investigacion sobre seguridad y red-teaming autorizado, no a uso general. La licencia Apache-2.0 permite uso comercial con las restricciones habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B: 64 capas (48 GatedDeltaNet atencion lineal + 16 atencion completa), hidden 5120, densa |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | Q8_0 (29,0 GB), Q6_K (22,5 GB), Q4_K_M (17,0 GB), IQ2_M (10,5 GB), mmproj f16 (0,9 GB) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina 48 capas de atencion lineal recurrente GatedDeltaNet con 16 capas de atencion completa, con un tamaño oculto de 5120 y configuracion densa (sin mezcla de expertos). Esta combinacion permite manejar ventanas de contexto muy largas (262K tokens
