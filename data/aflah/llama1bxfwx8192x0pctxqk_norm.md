# aflah/Llama1BxFWx8192x0pctxqk_norm

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato crudo de GPT-NeoX, correspondiente a un experimento con la tecnica Partial RoPE sobre una arquitectura Llama 3.2 1B. El modelo fue entrenado por Mohammad Aflah Khan sobre el dataset FineWeb (FW) con una secuencia de entrenamiento de 8.192 tokens y un 0% de rotacion parcial en las posiciones (es decir, RoPE completa). El checkpoint se situa en el paso global 12.000 e incluye normalizacion QK (QK Norm).

La relevancia de este modelo es puramente investigadora: forma parte de los experimentos que acompanan al articulo "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE", aceptado en EMNLP 2026. No es un modelo listo para produccion, sino una pieza de evidencia para estudiar como afecta la proporcion de capas con RoPE parcial a la convergencia y al rendimiento final. El repositorio no incluye conversion a formato Transformers, por lo que su uso requiere herramientas compatibles con GPT-NeoX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (transformer decoder) |
| Parametros totales | no disponible (estimable en ~1.000 millones por la arquitectura declarada) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint crudo en FP32/FP16, sin cuantizar) |
| Idiomas soportados | no disponible (dataset FineWeb, mayoritariamente ingles) |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (no Transformers) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder estilo Llama 3.2 con 1.000 millones de parametros. La innovacion principal es la aplicacion de Partial RoPE, una tecnica que aplica la rotacion posicional solo a una fraccion de las capas del modelo. En este checkpoint concreto, el porcentaje de capas con RoPE parcial es del 0%, lo que significa que todas las capas usan RoPE completa (el caso base de la comparativa). Ademas, se incluye QK Norm, una normalizacion aplicada a las proyecciones Q y K.

El entrenamiento se realizo sobre el dataset FineWeb, un corpus web filtrado de alta calidad, con una longitud de secuencia de 8.192 tokens. El checkpoint corresponde al paso global 12.000. No se menciona el uso de RLHF, DPO ni ninguna fase de ajuste fino instructivo; se trata de un modelo base (foundation model) en fase de preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo base de 1B sin ajuste instructivo.
- Razonamiento limitado: al ser un checkpoint de preentrenamiento intermedio, no se espera que muestre capacidades avanzadas de razonamiento o seguimiento de instrucciones.
- Sin soporte de tool calling ni function calling: no se ha entrenado para ello.
- Sin capacidades de agente ni multi-step reasoning.
- Multilingue limitado: entrenado sobre FineWeb, que es mayoritariamente ingles, por lo que el rendimiento en otros idiomas sera pobre.
- Sin capacidades especiales (vision, audio, thinking mode, etc.).

## Casos de uso

- Investigacion academica sobre Partial RoPE: el caso de uso principal es reproducir los experimentos del articulo y comparar la convergencia de este checkpoint (0% partial RoPE) con otros porcentajes.
- Estudio de dinamicas de entrenamiento: al ser un checkpoint intermedio (paso 12.000), permite analizar como evoluciona el modelo en fases tempranas del preentrenamiento.
- Analisis de normalizacion QK: util para estudiar el efecto de QK Norm en la estabilidad del entrenamiento y en la calidad de las representaciones.
- Comparacion de arquitecturas: sirve como baseline para evaluar variantes de RoPE parcial en la misma familia de modelos.
- Desarrollo de tecnicas de interpretabilidad: al ser un modelo pequeno y de acceso abierto, es adecuado para experimentos de mecanistica interpretativa.
- Reproducibilidad cientifica: el codigo de entrenamiento y analisis esta disponible en GitHub, lo que permite replicar y extender los resultados del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones como MMLU, HumanEval o GSM8K, y la model card no reporta metricas de rendimiento. Dado que se trata de un checkpoint de investigacion intermedio, es probable que los autores presenten las evaluaciones completas en el articulo de EMNLP 2026, pero no estan disponibles en esta fuente.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~1B en FP16, se necesitan aproximadamente 2-3 GB de VRAM solo para los pesos. El checkpoint crudo de GPT-NeoX ocupa 16.5 GB en disco, probablemente en FP32, lo que requeriria ~4 GB de VRAM si se carga tal cual.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (GTX 1660, RTX 2060, etc.) puede ejecutar el modelo en FP16. Para entrenamiento o fine-tuning, se recomienda una GPU con 12-16 GB (RTX 3080, RTX 4090, A10).
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 6 GB o mas de VRAM.
- Opciones de despliegue: al ser un checkpoint GPT-NeoX, no es directamente compatible con vLLM, Ollama o TGI sin conversion previa a formato Transformers. Se puede usar con el stack de GPT-NeoX (DeepSpeed, Megatron) o convertir los pesos manualmente.
- Latencia y throughput: no disponible. Al ser un modelo de 1B, se espera una latencia baja en GPU modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama 3.2 1B (oficial) | 1.000 M | 128K | Llama 3.2 Community License | Transformers, GGUF | Modelo base instructivo, listo para uso |
| Este checkpoint (aflah) | ~1.000 M | 8.192 | no disponible | GPT-NeoX | Checkpoint de investigacion, sin ajuste instructivo |
| TinyLlama 1.1B | 1.100 M | 2.048 | Apache 2.0 | Transformers, GGUF | Modelo base entrenado en 3T tokens, mas maduro |

La comparativa directa con Llama 3.2 1B oficial no es posible porque este checkpoint es un snapshot intermedio de preentrenamiento, no un modelo final. TinyLlama es un modelo de tamano similar pero con un entrenamiento mucho mas extenso y una licencia permisiva, lo que lo hace mas adecuado para produccion.

## Limitaciones y advertencias

- Checkpoint de investigacion: no es un modelo final ni esta optimizado para tareas concretas. No debe usarse en produccion.
- Formato GPT-NeoX: los pesos no estan en formato Transformers, lo que dificulta su uso con herramientas estandar. Se requiere conversion manual.
- Sin ajuste instructivo: no sigue instrucciones ni mantiene conversaciones utiles. Solo genera texto continuando un prompt.
- Sesgos del dataset: FineWeb, al ser un corpus web, puede contener sesgos, lenguaje toxico y contenido no filtrado. No se ha realizado alineamiento.
- Riesgo de alucinacion: alto, como en cualquier modelo base pequeno sin ajuste.
- Licencia no especificada: no se indica bajo que licencia se distribuyen los pesos, lo que genera incertidumbre legal para su uso.
- Sin garantias de rendimiento: al ser un checkpoint intermedio, el rendimiento en tareas downstream sera inferior al de un modelo entrenado hasta convergencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aflah/Llama1BxFWx8192x0pctxqk_norm)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Codigo de entrenamiento y analisis](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Perfil del autor en Hugging Face](https://huggingface.co/aflah)
- [Pagina personal del autor](https://aflah02.github.io/)
