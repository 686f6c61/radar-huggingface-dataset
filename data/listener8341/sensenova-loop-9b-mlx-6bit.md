# listener8341/SenseNova-Loop-9B-MLX-6bit

## Resumen

SenseNova-Loop-9B-MLX-6bit es un port comunitario a MLX del modelo SenseNova-Loop-9B de SenseNova, cuantizado a 6 bits para su ejecución en Apple Silicon. El modelo base es un transformer con arquitectura "looped": 32 capas físicas de las cuales las capas 4 a 27 se ejecutan dos veces, dando 56 visitas de capa por token. Combina atención lineal gated delta-net (GDN) en 28 capas con atención completa en 8 capas concretas, e incorpora un mecanismo de routing de dos flujos denominado mHC basado en Sinkhorn.

Este build concreto es un port de la torre de texto únicamente: no implementa el encoder visual, la cabeza MTP ni el loop_gate del modelo original. Está pensado para generación de texto en chino e inglés sobre máquinas de 16 a 32 GB de memoria unificada, y cubre el hueco de cuantización a 6 bits entre los builds comunitarios existentes en 4 y 8 bits. La licencia es Apache-2.0, heredada del modelo base.

La relevancia práctica del artefacto es doble: por un lado ofrece pesos MLX listos para usar con `mlx_lm`; por otro documenta con precisión qué tensores deben permanecer en FP32 (mHC, GDN y RMSNorm) para evitar degradación silenciosa de la salida, un detalle crítico si se va a recuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas looped, híbrido GDN (atención lineal) + atención completa, routing mHC de dos flujos |
| Parametros totales | 9B (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, 6.510 bits/peso; pesos lineales/embedding/lm_head cuantizados, mHC y GDN en FP32 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantización 6-bit; tamaño del repo 1.9 GB, pesos cuantizados 6.8 GB según model card |

## Arquitectura y entrenamiento

El modelo base emplea 32 capas físicas. Las capas 4 a 27 se ejecutan dos veces (looped transformer), lo que resulta en 56 visitas de capa por token. La atención es híbrida: 28 capas usan gated delta-net (GDN), una forma de atención lineal con estado recurrente, y 8 capas (índices 3, 7, 11, 15, 19, 23, 27 y 31) usan atención completa. Sobre 24 capas se aplica mHC, un routing de dos flujos que usa normalización Sinkhorn con 20 iteraciones.

El port MLX mantiene en FP32 los tensores numéricamente sensibles: pesos y sesgos de `mhc_attn.*` y `mhc_ffn.*`, `A_log` y `dt_bias` de GDN, y todos los pesos de RMSNorm. Solo se cuantizan las capas lineales, el embedding y `lm_head`. La model card advierte que cuantizar los tensores mHC produce salidas incorrectas de forma silenciosa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La fidelidad del port se validó contra la implementación de referencia en HF sobre una sonda de 11 tokens: coseno de logits por posición de 0.9999 o superior, coincidencia de argmax 11/11 y forwards deterministas bit a bit.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Razonamiento y respuesta a instrucciones (pipeline text-generation).
- No incluye visión: el encoder visual del modelo base no está implementado en este build.
- No incluye la cabeza MTP ni el loop_gate del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües limitadas a zh y en según los tags del repositorio.
- Decodificación determinista verificada (dos forwards idénticos bit a bit).

## Casos de uso

- Generación de texto en local sobre Mac: el build está pensado para ejecutarse con `mlx_lm` en equipos de 16 a 32 GB de memoria unificada, ofreciendo un equilibrio calidad/memoria que no cubren los builds de 4 y 8 bits.
- Asistentes conversacionales en chino e inglés: el modelo soporta diálogo multi-turno mediante la plantilla de chat copiada del modelo base, adecuado para prototipos de chatbot en escritorio.
- Procesamiento por lotes en estación de trabajo Apple: con ~970 tok/s de prefill a 2K de contexto, es viable procesar documentos largos en pipelines offline antes de la fase de decodificación.
- Evaluación e investigación de arquitecturas looped: el código MLX en `sensenova_loop.py` sirve como referencia ejecutable para estudiar el comportamiento de capas repetidas y routing Sinkhorn.
- Base para recuantización y experimentación: la documentación explícita de qué tensores deben quedar en FP32 permite derivar otras cuantizaciones (4-bit, 8-bit) sin repetir los errores de fidelidad.
- Desarrollo de aplicaciones MLX nativas: integrable en apps macOS/iOS que usen el stack MLX, sin dependencia de CUDA ni de servidores remotos.
- Pruebas de determinismo y reproducibilidad: al ser determinista bit a bit, resulta útil como componente en tests de regresión de pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos son de velocidad de inferencia en Apple M5 con 64 GB de memoria unificada y decodificación greedy: aproximadamente 14 tok/s en decode y 970 tok/s en prefill a 2K de contexto. La model card indica que la decodificación está limitada por cómputo (56 visitas de capa más mHC), por lo que 4 bits no es significativamente más rápido que 6 bits.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos cuantizados ocupan 6.8 GB según la model card; el repositorio completo pesa 1.9 GB (posiblemente por carga parcial o compresión de artefactos). Con overhead de ejecución, encaja en equipos de 16 GB en adelante.
- GPU recomendadas: Apple Silicon con memoria unificada; el dato medido corresponde a un M5 con 64 GB.
- ¿Cabe en GPU consumer? El stack es MLX, por lo que el objetivo son chips Apple (M1 en adelante). No hay información sobre ejecución en GPU NVIDIA o AMD con este formato.
- Opciones de despliegue: `mlx-lm` (requiere copiar `sensenova_loop.py` en `mlx_lm/models/` hasta que se integre el PR upstream). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: ~14 tok/s decode y ~970 tok/s prefill a 2K de contexto en M5 de 64 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-6bit | 9B | no disponible | 6-bit MLX | Apache-2.0 | Hugging Face (comunidad) |
| SenseNova-Loop-9B (base) | 9B | no disponible | bf16/fp | Apache-2.0 | Hugging Face (oficial) |
| Builds MLX comunitarios 4-bit y 8-bit | 9B | no disponible | 4-bit / 8-bit MLX | Apache-2.0 (presumible) | Hugging Face (comunidad) |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros fabricantes; la comparación se limita a variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias

- Solo torre de texto: sin encoder visual, sin cabeza MTP y sin loop_gate; no debe usarse para tareas multimodales.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada en la información disponible; no asumir ventanas largas sin verificación.
- Riesgo de alucinación inherente a modelos de 9B; no hay evaluaciones publicadas de fidelidad factual.
- Sesgos: no documentados en la model card; al ser un modelo base entrenado principalmente en zh/en, es esperable sesgo cultural y lingüístico hacia esos idiomas.
- Recuantización delicada: cuantizar los tensores mHC, `A_log`, `dt_bias` o los pesos de RMSNorm produce salidas incorrectas de forma silenciosa.
- Requiere copiar manualmente `sensenova_loop.py` en `mlx_lm/models/` hasta que se integre el soporte upstream; no es plug-and-play con la versión estándar de `mlx-lm`.
- Port no oficial: no está afiliado ni respaldado por SenseNova; posibles divergencias con el modelo base fuera de la sonda de validación de 11 tokens.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base y de los datos de entrenamiento originales antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/listener8341/SenseNova-Loop-9B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación MLX: https://ml-explore.github.io/mlx/
