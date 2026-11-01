# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_round-int8-gs128-sym

## Resumen

Esta ficha describe una cuantizacion INT8 del modelo `allenai/Llama-3.1-Tulu-3-8B-SFT`, publicada por el usuario `fbaldassarri` en HuggingFace. No se trata de un modelo original, sino de una version comprimida del checkpoint SFT de la familia Tulu 3 de AI2 (Allen Institute for AI), orientada a inferencia en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra). La cuantizacion se realizo con Intel AutoRound v0.16.0 aplicando el algoritmo SignRound en modo weights-only (WoQ), con 8 bits, grupo de 128 y esquema simetrico.

El modelo base es un Llama 3.1 de 8B parametros, afinado por AI2 como paso supervisado (SFT) dentro de su pipeline Tulu 3, que combina datos de instrucciones abiertos con tecnicas de entrenamiento cuidadosamente documentadas. La cuantizacion reduce el peso del repositorio a 11,4 GB y mantiene el formato `safetensors` compatible con `transformers`, lo que permite desplegarlo con `device_map="auto"` sin necesidad de kernels personalizados.

La relevancia de esta ficha es practica: permite evaluar si esta version cuantizada es adecuada para entornos de produccion con hardware Intel, comparando su licencia Apache 2.0 y su naturaleza derivada frente al checkpoint original. Conviene senalar que el autor la publica con fines de investigacion y sin garantias, y que el numero de descargas (16) y likes (0) indica una adopcion muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado post-entrenamiento con AutoRound (WoQ, SignRound) |
| Parametros totales | 2.863.992.832 (segun safetensors del repo cuantizado; el modelo base declara 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | INT8, group size 128, simetrica, weights-only (WoQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato `auto_round`), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base `allenai/Llama-3.1-Tulu-3-8B-SFT` es un transformer decoder-only de la familia Llama 3.1, con 8B parametros, entrenado por AI2 como parte del proyecto Tulu 3. El pipeline de Tulu 3 combina un corpus de instrucciones abierto con tecnicas de verificacion y filtrado, y el checkpoint SFT corresponde a la fase de ajuste supervisado previa a las etapas de preferencia (DPO/RLVR) del pipeline completo. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion detallada del dataset.

La cuantizacion se realizo con Intel AutoRound v0.16.0 sobre el checkpoint SFT, cargado en `torch.bfloat16` y calibrado en CPU con 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch de 4. El proceso completo duro 51.641 segundos (unas 860,7 minutos). El resultado es un checkpoint INT8 con grupo de 128 y esquema simetrico, pensado para ejecutarse con intel-extension-for-pytorch (CPU e iGPU Arc) y OpenVINO (NPU AI Boost de Core Ultra). El autor documenta la receta de replicacion completa, incluyendo el repositorio `auto-round-pipeline` y el script `runner.py`.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat integrada (modelo instruct/chat).
- Razonamiento y respuesta a instrucciones, heredado del ajuste SFT de Tulu 3.
- Generacion de codigo y matematicas basicas (capacidad del modelo base, no verificada en esta cuantizacion).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia optimizada para CPU Intel, iGPU Arc y NPU Core Ultra mediante IPEX y OpenVINO.

## Casos de uso

- Asistente conversacional en ingles sobre hardware Intel sin GPU dedicada: el checkpoint INT8 puede ejecutarse en CPU con intel-extension-for-pytorch, lo que permite desplegar un chatbot de 8B en portatiles o mini-PC con Core Ultra.
- Prototipado de agentes en entornos de desarrollo: al ser compatible con `transformers` y `device_map="auto"`, se puede integrar rapidamente en scripts de experimentation sin reescribir el pipeline de carga.
- Evaluacion de cuantizaciones AutoRound: util como referencia para comparar la perdida de calidad de INT8 gs128 frente al checkpoint original en tareas de instrucciones.
- Inferencia en iGPU Arc: el autor indica soporte via intel-extension-for-pytorch, lo que permite usar graficas integradas para cargas moderadas de generacion de texto.
- Despliegue en NPU AI Boost (Core Ultra): mediante OpenVINO, adecuado para escenarios de baja latencia y bajo consumo en estaciones de trabajo ligeras.
- Fines de investigacion y docencia: la licencia Apache 2.0 y la receta de replicacion publicada facilitan su uso en cursos y experimentos reproducibles sobre cuantizacion.
- Generacion de codigo asistida en local: aunque no se confirma tool calling, el modelo base esta ajustado para instrucciones y puede emplearse en editores con integracion via API local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el checkpoint original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: el repo pesa 11,4 GB en `safetensors`; en INT8 se requiere aproximadamente 8-10 GB de memoria para cargar los pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra; no se documentan GPU NVIDIA o AMD como objetivo principal.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090), aunque el soporte oficial declarado es para hardware Intel.
- Opciones de despliegue: `transformers` con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). El tag `text-generation-inference` sugiere compatibilidad con TGI, pero no se detalla en la model card.
- Latencia y throughput: no disponibles. El autor solo documenta el tiempo de cuantizacion (860,7 minutos en CPU), no el rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Tulu 3 8B SFT INT8 AutoRound) | 8B (2,86B segun safetensors) | no disponible | INT8 gs128 simetrica | Apache 2.0 | HuggingFace, 16 descargas |
| allenai/Llama-3.1-Tulu-3-8B-SFT (original) | 8B | 128K (segun Llama 3.1) | bfloat16 | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K | bfloat16, GGUF, AWQ, GPTQ | Llama 3.1 Community License | HuggingFace, ecosistema amplio |
| Otras cuantizaciones INT8 de Llama 3.1 8B (GPTQ/AWQ) | 8B | 128K | INT8/INT4 | segun autor | HuggingFace |

La comparativa con modelos de la misma categoria (8B instruct) muestra que esta version destaca por su orientacion a hardware Intel y su licencia Apache 2.0, pero carece de benchmarks publicados y de adopcion significativa, a diferencia de las cuantizaciones GGUF/AWQ de Llama 3.1 ampliamente difundidas.

## Limitaciones y advertencias

- Modelo derivado y no oficial: no lo publica AI2 ni Meta, sino un usuario independiente, por lo que no cuenta con el respaldo del autor original.
- Solo ingles: la etiqueta `language: en` limita su uso a tareas en ingles; no se garantiza calidad en castellano.
- Riesgo de alucinacion: inherente a los modelos Llama 3.1 de 8B, agravado potencialmente por la cuantizacion INT8.
- Perdida de calidad por cuantizacion: no se han publicado evaluaciones que cuantifiquen la degradacion frente al checkpoint SFT original.
- Sin garantias: el autor declara explicitamente que el modelo se desarrollo solo con fines de investigacion y sin garantia.
- Soporte de tool calling y agentes no confirmado en esta version.
- Contexto no documentado en la model card: aunque el modelo base soporta 128K, no se confirma que la cuantizacion lo preserve.
- Adopcion muy baja (16 descargas, 0 likes): poca validacion por parte de la comunidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento de Tulu 3.

## Enlaces

- HuggingFace del modelo cuantizado: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-SFT-auto_round-int8-gs128-sym
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-SFT
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
