# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-022

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-022` es un ajuste fino de Qwen3-4B-Instruct-2507 desarrollado por el grupo HYU-NLP-EVAL. Se trata de un checkpoint intermedio (paso 22) de un experimento de aprendizaje por refuerzo orientado al dominio de la medicina, entrenado sobre el conjunto de datos interno RaR-Medicine con 1.500 indicaciones (prompts) y una funcion de recompensa basada en rubricas estaticas (`rar_static_r0_only`). El run asociado se identifica como `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`.

La relevancia de esta publicacion es fundamentalmente metodologica: forma parte de una serie de checkpoints (pasos 000, 008, 016, 022, 024, 030, entre otros) que permiten estudiar la evolucion del entrenamiento con GRPO y comparar la variante densa frente a otras configuraciones. No es un modelo orientado a produccion ni a uso clinico; el propio autor lo etiqueta como "research use only" y acumula un numero muy bajo de descargas en HuggingFace.

El modelo conserva la arquitectura del Qwen3-4B-Instruct-2507, un transformer causal denso de aproximadamente 4.000 millones de parametros, con pesos en BF16 y una ventana de contexto heredada del modelo base. Su interes practico se limita a la investigacion sobre tecnicas de alineamiento con recompensas basadas en rubricas en dominios especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (segun LLM Explorer para checkpoints hermanos de la misma serie; heredado del modelo base, no confirmado en la model card) |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; el repositorio contiene pesos BF16. Cuantizable externamente con llama.cpp, GPTQ o AWQ |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3-4B-Instruct-2507 es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) para inferencia; `original_checkpoint/` con los ficheros veRL originales (solo parametros del modelo) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tamano del repositorio | 25,7 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer causal denso con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm, sin componentes MoE. El ajuste no modifica la topologia de la red; se parte de los pesos preentrenados y alineados del modelo base y se aplica un ciclo de optimizacion adicional especifico del dominio medico.

El entrenamiento utiliza GRPO (Group Relative Policy Optimization) con un enfoque `static_r0_matched` y una fuente de recompensa denominada `rar_static_r0_only`, es decir, una rubrica estatica. El conjunto de datos es RaR-Medicine, con 1.500 indicaciones, y el run se identifica como `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`. El checkpoint corresponde al paso 22 de una fase intermedia, no al estado final del entrenamiento. La model card no detalla la composicion exacta del dataset, el numero de tokens vistos, la configuracion de hiperparametros ni si hubo etapas adicionales de DPO o RLHF; por tanto, esos datos se consideran no disponibles.

## Capacidades

- Generacion de texto conversacional en el dominio medico, heredada del modelo base instruct.
- Razonamiento sobre indicaciones medicas del conjunto RaR-Medicine segun la rubrica estatica empleada durante el entrenamiento.
- Capacidades generales de Qwen3-4B-Instruct-2507 en generacion de texto, codigo, matematicas y razonamiento multilingue, presumiblemente parcialmente conservadas, aunque no verificadas para este checkpoint.
- Soporte de tool calling y function calling: heredado del modelo base, no documentado ni validado especificamente en esta ficha.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, sin evaluacion publicada para este checkpoint.
- Capacidades multilingues: no confirmadas en la informacion disponible.

## Casos de uso

- Investigacion sobre recompensas basadas en rubricas: el checkpoint permite analizar como evoluciona la politica de GRPO con una rubrica estatica (`rar_static_r0_only`) sobre indicaciones medicas, comparando el paso 22 con los pasos 000, 008, 016, 024 y 030 de la misma serie.
- Analisis de estabilidad del entrenamiento: al ser un checkpoint intermedio, sirve para estudiar divergencias, oscilaciones o degradaciones a lo largo de los pasos en un ciclo de RL con GRPO.
- Ablacion densa frente a variantes sparse: la etiqueta `matched-dense` sugiere que este modelo forma parte de una comparacion controlada frente a configuraciones alternativas; seria util para reproducir esa comparacion.
- Evaluacion de transferencia en dominio medico: investigadores pueden medir si el ajuste mejora respuestas ante indicaciones clinicas sinteticas respecto al modelo base, siempre en entornos de investigacion.
- Estudio de olvido catastrofico: permite cuantificar cuanto se degradan las capacidades generales (codigo, matematicas, multilingue) tras el ajuste RL especializado.
- Generacion de datos sinteticos de investigacion: puede emplearse para producir borradores de respuesta a indicaciones medicas que despues se filtran manualmente, nunca para uso clinico directo.
- Reproducibilidad experimental: dado que se publican las semillas (`seed11`) y los checkpoints por paso, facilita la replicacion de resultados en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 8-9 GB para los pesos (4.022 millones de parametros), segun la estimacion de 8,1 GB publicada por LLM Explorer para checkpoints hermanos de la misma serie. El KV cache asociado a contexto largo aumenta este requisito de forma significativa.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 para inferencia en BF16 con contexto moderado. Para contexto de 256K completo se requiere memoria considerable y tecnicas de atencion eficiente.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 8-12 GB o mas en cuantizacion de 4 u 8 bits; en BF16 resulta ajustado en GPUs de 12 GB y comodo en 16-24 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp u Ollama tras conversion a GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponible. El repositorio pesa 25,7 GB, lo que sugiere la presencia de multiples ficheros de checkpoint ademas de los pesos BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-022 | 4.022.468.096 | 256K (heredado, no confirmado) | apache-2.0 | HuggingFace, 9 descargas | Ajuste RL medico, solo investigacion |
| Qwen/Qwen3-4B-Instruct-2507 | 4B aprox. | 262.144 tokens | apache-2.0 | HuggingFace, ampliamente distribuido | Modelo base; instrucciones generales y multilingue |
| Llama 3.2 3B Instruct | 3.2B aprox. | 128K tokens | Licencia comunitaria Llama 3.2 | HuggingFace | Alternativa de tamano similar; licencia mas restrictiva |
| Phi-4-mini-instruct | 3.8B aprox. | 128K tokens | MIT | HuggingFace | Buen rendimiento en razonamiento y matematicas |

Los datos de los modelos comparativos corresponden a informacion publica de sus respectivas fichas; no se dispone de comparaciones de rendimiento directas con el modelo analizado.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: la model card indica explicitamente "Research use only"; no debe emplearse en produccion clinica ni como herramienta de decision medica.
- Riesgo elevado de alucinacion en contenido medico: no se han publicado evaluaciones de seguridad ni de fidelidad clinica para este checkpoint.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora respecto al modelo base, ni de degradacion en capacidades generales.
- Checkpoint intermedio: el paso 22 no representa necesariamente el mejor estado del entrenamiento dentro de la serie.
- Idiomas no documentados: la model card no especifica los idiomas soportados tras el ajuste.
- Sesgos potenciales: al entrenarse sobre un conjunto reducido de 1.500 indicaciones de dominio medico, puede reflejar los sesgos y el estilo de ese corpus, no documentado.
- Contexto largo condicionado: aunque el modelo base soporta 256K tokens, no se garantiza que el ajuste conserve ese comportamiento y el coste de memoria es elevado.
- Licencia: los pesos se publican bajo apache-2.0, pero la designacion de uso solo para investigacion del autor debe respetarse como condicion adicional.
- Sin mantenimiento aparente: 9 descargas, 0 likes y fechas de creacion y actualizacion muy proximas entre si (12 de octubre de 2026, con 13 minutos de diferencia entre ambas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-022
- Checkpoint hermano (step-000): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-000
- Checkpoint hermano (step-008) en LLM Explorer: https://llm-explorer.com/model/HYU-NLP-EVAL%2Fqwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-008,cMGLnuq6Ni0ObvQjQQgbT
- Checkpoint relacionado (step-016) en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-016
- Checkpoint relacionado (step-024) en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-024
- Checkpoint relacionado (step-030) en free2aitools: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-030
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
