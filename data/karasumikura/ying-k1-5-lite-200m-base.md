# Karasumikura/Ying-K1.5-Lite-200M-base

## Resumen

Ying K1.5 Lite 200M — Base es un modelo de lenguaje denso de 210,2 millones de parámetros entrenado desde cero por el desarrollador independiente Wang Yingze (Karasumikura). Se trata de un modelo base (no instruido) especializado en chino, con soporte secundario de inglés, construido sobre la arquitectura propietaria MM200. Su interés radica en ser un experimento de preentrenamiento reproducible a pequeña escala: 24.070 millones de tokens procesados sobre 8 GPU MTT S4000 (MUSA), con pesos liberados en safetensors y bajo licencia Apache-2.0.

La versión K1.5 supone una revisión de la generación K1: amplía el preentrenamiento en un 61% (de 14,92 B a 24,07 B tokens), incorpora una capa de adaptación (`mm200_hf.py`) que permite cargarlo con `AutoModelForCausalLM` y `AutoTokenizer` estándar de transformers, y distribuye junto al repositorio un runtime de inferencia (`mm200_runtime.py`) con soporte de KV cache, streaming y decodificación con CUDA Graph.

Es relevante para quienes investigan modelos pequeños en chino, para experimentación docente sobre preentrenamiento desde cero y como base para un futuro ajuste por instrucciones, que el autor aún no ha realizado en esta generación. No debe confundirse con `Ying-K1-Lite-0.2B`, que es la versión SFT de la generación anterior y no comparte pesos con K1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso MM200 (16 capas, hidden 768, GQA 3:1, gated attention, QK-norm, RowNorm) |
| Parametros totales | 210.210.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens de entrenamiento (ventana deslizante de 1.024) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; fp16 también soportado) |
| Idiomas soportados | chino (principal), inglés (secundario) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (195 tensores, 420,4 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de 16 capas con dimensión oculta de 768, 12 cabezas de consulta y 4 cabezas KV (GQA con ratio 3:1), dimensión de cabeza 64 y vocabulario de 16.006 tokens. Incorpora gated attention, QK-norm y una normalización propietaria RowNorm con centrado en cero, que el autor materializa como `weight` estándar durante la exportación. El entrenamiento se realizó con contexto de 8.192 tokens y ventana deslizante de 1.024.

El preentrenamiento se dividió en dos fases: una primera de 90.000 pasos sobre 14,92 B tokens y una continuación de 1.205 pasos sobre 9,14 B tokens adicionales, sumando 24,07 B tokens en 91.205 pasos. Los datos son mayoritariamente chinos (Ultra-FineWeb-zh y fuentes similares). El autor documenta que la continuación modificó efectivamente los pesos (diferencia máxima de 0,70 en `blocks.0.attn.gate_proj` respecto al checkpoint de 90.000 pasos). El cómputo se ejecutó sobre 8 GPU MTT S4000 con stack MUSA. No se menciona RLHF ni DPO; no existe todavía ninguna fase de ajuste por instrucciones para esta generación.

Como innovación destacable, el repositorio incluye un runtime de inferencia optimizado que, medido sobre el modelo hermano K1 de idéntica arquitectura, reduce la latencia por token de 21,6 ms a 7,2 ms (3,00×) mediante captura de la decodificación completa en un CUDA Graph, corrección de una fuga de memoria en la tabla RoPE (unos 170 MB a 900 tokens), preasignación del historial (de O(n²) a O(1)) y eliminación de dos sincronizaciones GPU implícitas por token. El autor documenta también dos optimizaciones descartadas por ser más lentas en la práctica (KV cache preasignada con escritura in situ y `enable_gqa=True`).

## Capacidades

- Generación de texto por continuación de secuencia (modelo base, sin ajuste por instrucciones).
- Capacidad de extracción de características (`feature-extraction` entre las etiquetas del repositorio).
- Soporte de chat multi-turno únicamente tras un futuro SFT; el formato `<|user|>…<|assistant|>…<|im_end|>` está reservado y los tokens especiales están verificados como de un solo token (15932, 16001 y 16002).
- Multilingüismo limitado a chino e inglés, con rendimiento claramente superior en chino.
- No dispone de tool calling, function calling, razonamiento multi-paso guiado, visión, audio ni modo de pensamiento.
- Inferencia con KV cache, streaming token a token y decodificación acelerada por CUDA Graph a través de `mm200_runtime.py`.
- Compatibilidad con la API estándar de transformers (`AutoModelForCausalLM`, `AutoTokenizer`) mediante `trust_remote_code=True`.

## Casos de uso

- Investigación sobre preentrenamiento desde cero: sirve como referencia reproducible de un modelo de 210 M entrenado sobre 24 B tokens con recetas y hardware documentados, útil para comparar curvas de pérdida o estrategias de continuación de entrenamiento.
- Base para ajuste por instrucciones: al ser un checkpoint base limpio y con licencia Apache-2.0, es adecuado para experimentos de SFT o DPO a pequeña escala en chino, con la ventaja de que el formato de chat y los tokens especiales ya están definidos y validados.
- Generación de texto en chino en entornos con recursos muy limitados: con 420 MB en bfloat16, puede ejecutarse en CPU o en GPU de gama baja para tareas de continuación de texto, resúmenes rudimentarios o generación de titulares donde no se requiera precisión factual.
- Extracción de características y embeddings contextuales: al estar etiquetado para `feature-extraction`, puede emplearse para obtener representaciones de texto en chino en pipelines de clasificación o clustering, extrayendo los estados ocultos de las 16 capas.
- Experimentación con aceleración de inferencia: el runtime incluido y la documentación de optimizaciones (CUDA Graph, gestión de KV cache, tablas RoPE) sirven como banco de pruebas para técnicas de despliegue de modelos pequeños en producción.
- Docencia y prototipado rápido: su tamaño permite ejecutarlo en portátiles y estaciones de trabajo sin GPU dedicada, lo que facilita demostraciones de tokenización, decodificación muestreada y análisis de atención en cursos de NLP.
- Evaluación comparativa de arquitecturas: útil para contrastar el rendimiento de GQA 3:1 con QK-norm y RowNorm frente a transformers convencionales del mismo orden de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye métricas de latencia y throughput medidas sobre el modelo hermano K1 de idéntica arquitectura en una T4: 7,2 ms por token en decodificación optimizada (frente a 21,6 ms sin optimizar), 139,2 tok/s por solicitud (frente a 46,3 tok/s), 1,05 s de tiempo hasta el primer token en streaming y 1,90 s para una respuesta de 256 tokens. Estas cifras corresponden a K1 y el autor indica que deben reverificarse con los pesos reales de K1.5.

## Requisitos de hardware

- VRAM estimada: en bfloat16, aproximadamente 0,42 GB para los pesos más la memoria del runtime (KV cache y buffers de activaciones), lo que en la práctica se mantiene por debajo de 1-2 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o fp16; el autor validó el rendimiento en una NVIDIA T4. También funciona en CPU, aunque con mayor latencia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers estándar con `trust_remote_code=True` (sin KV cache, lento), o el runtime propietario `mm200_runtime.py` con KV cache, streaming y CUDA Graph. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,2 ms/token y 139,2 tok/s por solicitud en T4 con el runtime optimizado (medido sobre K1); 21,6 ms/token en modo eager. El autor advierte que `AutoModel.generate()` sin KV cache recalcula toda la secuencia en cada token y es notablemente más lento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Ying K1.5 Lite 200M Base | 210,2 M | 8.192 | zh, en | Apache-2.0 | Base, sin SFT |
| Ying K1 Lite 200M Base | 210,2 M | 8.192 | zh, en | Apache-2.0 | Base, sin SFT; 14,92 B tokens |
| Ying K1 Lite 0.2B | 210,2 M (misma arquitectura) | 8.192 | zh, en | Apache-2.0 | SFT sobre 90.000 instrucciones en chino; generación anterior |
| Ying K2 Lite 200M | no disponible en la información | no disponible | zh, en | Apache-2.0 | Base; etiquetado como `feature-extraction` |

La comparación con modelos de otras familias (Qwen, SmolLM, Gemma) no está disponible en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes ni mantiene formato de chat de forma fiable; aplicar la plantilla `<|user|>…<|assistant|>` sin SFT previo produce resultados pobres.
- Con 210 M de parámetros, la cobertura factual es muy limitada y el riesgo de alucinación en preguntas de conocimiento es alto.
- El entrenamiento es mayoritariamente en chino; el rendimiento en inglés es notablemente inferior y no se documenta soporte para otras lenguas.
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad; al derivarse de rastreos web (Ultra-FineWeb-zh), es probable que herede sesgos presentes en esos corpus.
- La ventana de entrenamiento es de 8.192 tokens con ventana deslizante de 1.024; el autor documenta que en la generación anterior las entradas por encima de 1.024 tokens provocaban un fallo corregido en el runtime, por lo que conviene validar el comportamiento en contextos largos.
- `AutoModel.generate()` no usa KV cache y es muy lento; para producción es necesario el runtime `mm200_runtime.py`.
- El repositorio contiene código con `trust_remote_code=True`; conviene auditar `mm200_hf.py` y `mm200_runtime.py` antes de ejecutarlo en entornos sensibles.
- La licencia Apache-2.0 permite uso comercial, pero al no existir versión SFT de K1.5, cualquier producto basado en ella requerirá un ajuste previo por parte del integrador.
- Las cifras de aceleración publicadas se midieron sobre K1 y el propio autor las marca como pendientes de reverificación con los pesos de K1.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.5-Lite-200M-base
- Generación anterior (base): https://huggingface.co/Karasumikura/Ying-K1-Lite-200M-base
- Generación siguiente (base): https://huggingface.co/Karasumikura/Ying-K2-Lite-200M
- Documentación de aceleración de inferencia: `INFERENCE_ACCELERATION.md` dentro del repositorio del modelo
- Script de reproducción de benchmarks: `bench_opt.py` (ejecutable con `modal run`) en el repositorio del modelo
- Sitio del autor: https://yingze.wang
