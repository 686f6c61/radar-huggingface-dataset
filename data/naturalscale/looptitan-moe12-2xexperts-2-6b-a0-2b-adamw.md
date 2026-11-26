# NaturalScale/LoopTitan-MoE12-2xExperts-2.6B-A0.2B-AdamW

## Resumen

LoopTitan-MoE12-2xExperts-2.6B-A0.2B-AdamW es un modelo de lenguaje base de tipo Mixture-of-Experts (MoE) desarrollado por NaturalScale dentro de la fase 1 del proyecto LoopTitan, una línea de investigación centrada en el estudio de arquitecturas y optimizadores para modelos de lenguaje eficientes. Se trata de un modelo entrenado desde cero, no ajustado por instrucciones, concebido como pieza de un experimento comparativo más amplio: la release incluye ocho diseños arquitectónicos distintos, cada uno entrenado con dos optimizadores (AdamW y Muon), y este checkpoint corresponde al diseño «MoE con el doble de expertos» optimizado con AdamW.

La arquitectura es un transformer MoE estándar pero con un número de expertos inusualmente alto: 12 capas, anchura de 1280, 128 expertos por capa y tamaño oculto de experto de 432. Almacena 2,59 mil millones de parámetros sin contar los embeddings y 2,98 mil millones con la matriz de entrada y la cabeza de salida (el recuento que muestra Hugging Face), con solo 0,20 mil millones de parámetros activos por token. Esta relación entre parámetros totales y activos lo sitúa en la categoría de modelos «grandes en almacenamiento, pequeños en cómputo», pensados para escenarios con restricciones de latencia.

Su relevancia es fundamentalmente de investigación: el modelo card reporta una mejora de −14,29 mBPB (mili-bits por byte) en el conjunto de test frente a un MoE estándar entrenado con AdamW, lo que lo convierte en el segundo mejor diseño de la release por delante de casi todos los demás. La licencia MIT y el formato safetensors facilitan su uso experimental, aunque al ser un modelo base sin instrucciones no está pensado para despliegues conversacionales directos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 12 capas, anchura 1280, 128 expertos por capa, tamaño oculto de experto 432 |
| Parametros totales | 2.981.564.160 (2,98B, incluyendo embeddings y cabeza de salida); 2,59B sin embeddings |
| Parametros activos | 0,20B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Optimizador de entrenamiento | AdamW |
| Dataset de entrenamiento | mlfoundations/dclm-baseline-1.0-parquet |
| Tamaño del repositorio | 11,9 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer MoE con 12 capas y una anchura de 1280, pero con una particularidad clave: cada capa contiene 128 expertos de tamaño oculto 432, el doble de expertos que la configuración MoE estándar de referencia del proyecto. Esta decisión busca aumentar la capacidad total del modelo sin incrementar proporcionalmente el coste de cómputo por token, ya que solo se activan 0,20 mil millones de parámetros en cada paso. El entrenamiento se realizó con el optimizador AdamW sobre el dataset DCLM-Baseline 1.0 (mlfoundations/dclm-baseline-1.0-parquet), un corpus de texto web filtrado de gran escala. No se especifica en la información disponible el número exacto de tokens vistos durante el entrenamiento ni la composición detallada del dataset.

La innovación principal del proyecto LoopTitan no reside en un mecanismo de atención novedoso, sino en la comparación sistemática de diseños arquitectónicos y optimizadores bajo un mismo protocolo de entrenamiento. En esta release, el diseño «2× expertos» con AdamW logra una mejora de −14,29 mBPB en test frente al MoE estándar, lo que lo convierte en el segundo mejor resultado de los ocho diseños evaluados (solo superado por «One more visit» con −14,8 mBPB). No se documentan técnicas de RLHF, DPO ni ajuste por instrucciones: es un modelo puramente base.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo base, puede continuar texto y generar secuencias coherentes, pero no está alineado para seguir instrucciones.
- Modelado de lenguaje y estimación de probabilidad: su métrica principal es bits por byte (BPB) sobre texto held-out, lo que indica que está optimizado para modelado de lenguaje puro.
- Razonamiento y conocimiento factual: capacidad derivada del entrenamiento en DCLM-Baseline, aunque sin benchmarks de conocimiento declarados.
- Capacidades multilingües: no documentadas; el dataset DCLM-Baseline es predominantemente inglés, pero no se confirma el soporte de otros idiomas.
- Tool calling / function calling: no disponible; no se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; al no estar ajustado por instrucciones, no se recomienda su uso directo en pipelines de agentes.
- Modo «thinking» o razonamiento explícito: no disponible.
- Visión o audio: no disponible; es un modelo exclusivamente de texto.

## Casos de uso

- Investigación en arquitecturas MoE: el modelo sirve como checkpoint de referencia para estudiar el efecto de duplicar el número de expertos en un transformer de 12 capas, comparando su BPB con el MoE estándar y con los otros siete diseños de la release.
- Experimentos de eficiencia computacional: con solo 0,20B parámetros activos por token, es adecuado para medir latencia y throughput en entornos con GPUs de gama media, comparando el coste real de un MoE de 128 expertos frente a alternativas densas.
- Fine-tuning supervisado para tareas específicas: al ser un modelo base con licencia MIT, puede servir como punto de partida para ajuste en dominios concretos (clasificación, extracción de información, generación de resúmenes) con datasets pequeños.
- Evaluación de optimizadores: el checkpoint AdamW permite reproducir la comparación con su gemelo entrenado con Muon (mismo diseño, distinto optimizador) y analizar el impacto del optimizador en la calidad final del modelo.
- Generación de texto controlada en investigación: útil para estudiar la distribución de probabilidad del modelo sobre corpus de validación y test, y para calcular métricas de perplejidad o BPB en dominios específicos.
- Estudio de enrutamiento de expertos: con 128 expertos por capa, el modelo permite analizar patrones de activación y balanceo de carga entre expertos, un tema central en la literatura MoE.
- Prototipado de pipelines de inferencia: su tamaño de repositorio (11,9 GB) y su naturaleza base lo hacen manejable para probar integraciones con vLLM, TGI o llama.cpp en entornos de investigación.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de bits por byte (BPB) sobre el dataset DCLM-Baseline, calculadas tras la última actualización del modelo. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Valor | Verificado |
|---|---|---|
| Test BPB | 0,985241 | No |
| Validation BPB | 0,986998 | No |
| Δ test vs MoE estándar (AdamW) | −14,29 mBPB | No |

En la comparativa interna de los ocho diseños de la release (medida en mBPB de test frente al MoE estándar con AdamW), el modelo ocupa la segunda posición: «One more visit» logra −14,8, «Twice the experts» (este modelo) −14,3, «The loop» −9,0, «Unrolled» −8,9, «Deeper, narrower» −6,9, «Expert layout» −5,9 y «Finer experts» −4,2. Con el optimizador Muon, el mismo diseño «Twice the experts» logra −9,9 mBPB, lo que sugiere que AdamW funciona mejor para esta configuración concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 12 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 16-24 GB.
- VRAM estimada en fp16/bf16: alrededor de 6 GB para pesos, más overhead; cabe en GPUs consumer de 8-12 GB con margen limitado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3 GB para pesos; viable en GPUs de 6-8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,5-2 GB para pesos; viable en GPUs de 4 GB o incluso en CPU con llama.cpp, aunque no se documentan GGUF oficiales.
- GPUs recomendadas: A100 (40/80 GB) o H100 para entrenamiento y fine-tuning; RTX 4090 (24 GB) para inferencia en fp16 con comodidad; RTX 3090/4080 (16-24 GB) para inferencia en fp16; RTX 3060 (12 GB) o inferiores para cuantización 8 bits.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 8 GB o más en fp16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería nativa, requiere `trust_remote_code=True` por el código personalizado `custom_code`), vLLM y TGI para servir en producción (soporte MoE variable según versión), llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias (no publicadas).
- Latencia y throughput estimados: no disponibles; al activar solo 0,20B parámetros por token, se espera un throughput notablemente superior al de un modelo denso de 2,98B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LoopTitan-MoE12-2xExperts-2.6B-A0.2B-AdamW | 2,98B | 0,20B | no disponible | MIT | safetensors | Base, sin instrucciones; BPB 0,985 en test |
| MoE estándar de la misma release (referencia) | no disponible | no disponible | no disponible | MIT | safetensors | Baseline del proyecto; BPB de referencia +14,29 mBPB peor |
| LoopTitan «One more visit» (misma release) | no disponible | no disponible | no disponible | MIT | safetensors | Mejor diseño de la release; −14,8 mBPB vs baseline |
| Modelos MoE pequeños de código abierto (p. ej. familias tipo Qwen-MoE o DeepSeek-MoE de tamaño similar) | variable | variable | variable | variable | safetensors/GGUF | No se dispone de datos comparativos publicados en la información proporcionada |

La comparación con modelos de otras familias no está disponible en la información proporcionada; el proyecto LoopTitan es una línea de investigación propia y los benchmarks publicados se limitan a la comparación interna entre sus ocho diseños.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes de forma fiable ni mantiene conversaciones multi-turno; para uso conversacional requiere fine-tuning o prompting few-shot muy cuidado.
- Sesgos conocidos: entrenado sobre DCLM-Baseline, un corpus web filtrado que puede contener sesgos sociales, culturales y de género; no se documentan procesos de mitigación.
- Riesgo de alucinación: alto en tareas de conocimiento factual, como corresponde a un modelo base de 2,98B parámetros sin alineación.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y el soporte multilingüe no se confirma; el dataset es mayoritariamente en inglés.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no obstante, el uso comercial de un modelo base sin alinear requiere validación adicional.
- Caveat para producción: el modelo requiere `trust_remote_code=True` por el código personalizado (`custom_code`) y la arquitectura MoE puede no estar soportada en todas las versiones de vLLM, TGI o llama.cpp; verificar compatibilidad antes de desplegar.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K): no es posible evaluar su rendimiento en tareas downstream a partir de la información publicada.
- Fecha de creación futura (2026-11-25): el checkpoint es muy reciente y no tiene descargas ni validación comunitaria; su robustez no está contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-2xExperts-2.6B-A0.2B-AdamW
- Página del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio de código: https://github.com/datamllab/LoopTitan
- Documentación: https://datamllab.github.io/LoopTitan/docs/
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Colección de modelos de la fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Receta del MoE estándar (baseline): https://github.com/datamllab/LoopTitan/blob/recipes/phase1/m0-adamw.json
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
