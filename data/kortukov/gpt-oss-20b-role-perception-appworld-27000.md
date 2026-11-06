# kortukov/gpt-oss-20b-role-perception-appworld-27000

## Resumen

`kortukov/gpt-oss-20b-role-perception-appworld-27000` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base `openai/gpt-oss-20b` (revision `6cee5e81ee83917806bbde320786a8fb61efebee`). El adaptador no es un modelo independiente: contiene unicamente los pesos LoRA y pequenos scripts de carga, y requiere descargar y reconstruir el modelo base para su uso. El entrenamiento se ha realizado sobre 90 tareas de AppWorld generando 300 trayectorias por tarea (27.000 trayectorias en total), durante una epoca y 1.688 actualizaciones.

El objetivo declarado es el estudio de "role perception": la capacidad del modelo de reconocer y mantener etiquetas de rol en el contexto de tareas de agente (AppWorld). El repositorio incluye un `validation.json` que certifica que los 603 tensores reconstruidos (modelo y adaptador de atencion) son exactamente iguales al export evaluado, y un `serve.sh` que reconstruye localmente el export y lanza vLLM con la configuracion exacta de evaluacion. El autor advierte explicitamente de que la recuperacion de etiquetas de rol por si sola no establece robustez frente a prompt injection.

Es relevante ahora porque ejemplifica una practica creciente en investigacion de seguridad y agentes: publicar adaptadores LoRA reproducibles con validacion bit a bit del export evaluado, en lugar de checkpoints opacos. El tamano del repo (44,9 GB) se debe a la reconstruccion del modelo base dequantizado, no al adaptador en si. La licencia es Apache 2.0 tanto en el adaptador como en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) en el modelo base; adaptador LoRA sobre proyecciones de atencion y de expertos MoE |
| Parametros totales | 20B en el modelo base (adaptador LoRA adicional, tamano no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configurado en el launcher de vLLM con `--max-model-len 131072`) |
| Tipos de cuantizacion | Base en MXFP4 (`Mxfp4Config(dequantize=True)`); adaptador en BF16/FP32 segun modulo; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); reconstruccion local para vLLM |

## Arquitectura y entrenamiento

El modelo base `openai/gpt-oss-20b` es un transformer con capas de mezcla de expertos (MoE), cuantizado en MXFP4. Sobre el se aplica un adaptador LoRA de rango 64 y alpha 128 que cubre las proyecciones de atencion y las proyecciones de los expertos MoE. El entrenamiento se realizo sobre 90 tareas de AppWorld con 300 trayectorias por tarea (27.000 trayectorias), una epoca y 1.688 actualizaciones. La tecnica de entrenamiento se describe como "same-batch KL" contra sondas de rol (role probes). El SHA256 del adaptador entrenado es `43969311ed93e3b15b1859906a774faa5933303e313976214cc1a9545048fa2f` y se mantiene sin cambios respecto al entrenamiento.

Un detalle tecnico relevante es la preservacion de precision: la dequantizacion y el calculo del adaptador en FP32 reproducen la configuracion de entrenamiento, y el autor advierte de que no debe fusionarse la atencion en BF16. La ruta nativa de LoRA de vLLM no es equivalente al launcher proporcionado, porque usa distinto dtype y distinta aritmetica de actualizacion de expertos. El launcher pliega las actualizaciones de expertos en BF16 exactamente como los wrappers de parametros de PEFT y mantiene las actualizaciones de atencion en FP32 mediante un worker propio. La validacion cubre los 603 tensores reconstruidos.

## Capacidades

- Generacion de texto con el modelo base `gpt-oss-20b` (razonamiento, codigo y matematicas heredados del base; el adaptador no documenta capacidades adicionales).
- Ejecucion de tareas de agente en el entorno AppWorld, que es el dominio de entrenamiento del adaptador.
- Percepcion de rol: reconocimiento y mantenimiento de etiquetas de rol en el contexto, segun el nombre y el objetivo del adaptador.
- Soporte de tool calling y function calling heredado del modelo base (no documentado especificamente para el adaptador).
- Razonamiento multi-paso en tareas de agente (AppWorld requiere planificacion y llamadas a APIs).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de agentes: el adaptador permite reproducir experimentos sobre percepcion de rol y prompt injection en entornos controlados, con validacion bit a bit del export evaluado, lo que facilita la comparacion entre ejecuciones.
- Evaluacion de robustez frente a inyeccion de prompt: sirve como referencia para medir si el modelo mantiene la etiqueta de rol asignada cuando el contexto contiene instrucciones adversariales; el propio autor advierte de que la recuperacion de etiquetas no implica robustez.
- Benchmarking de tareas AppWorld: al estar entrenado sobre 90 tareas del benchmark, es util para estudiar sobreajuste y generalizacion a tareas no vistas del mismo entorno.
- Estudio de adaptadores LoRA sobre MoE: el repositorio documenta el procedimiento de fusion de actualizaciones de expertos en BF16 y de atencion en FP32, lo que sirve como referencia metodologica para otros adaptadores sobre `gpt-oss-20b`.
- Reproduccion de pipelines de evaluacion con vLLM: el `serve.sh` y el `export.json` permiten reconstruir el entorno de evaluacion exacto, util para auditorias de resultados publicados.
- Formacion y docencia: ejemplo practico de publicacion reproducible de adaptadores PEFT con validacion de tensores y scripts de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `validation.json`, que certifica la equivalencia exacta de los 603 tensores reconstruidos con el export evaluado, pero no incluye metricas de rendimiento (MMLU, HumanEval, GSM8K ni tasas de exito en AppWorld).

## Requisitos de hardware

- VRAM estimada: el modelo base dequantizado de 20B en BF16 requiere aproximadamente 40 GB de VRAM; el autor indica que se necesita una GPU con memoria suficiente para el modelo de 20B dequantizado y que el launcher soporta una sola GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con al menos 40-48 GB de VRAM; no se documenta compatibilidad con GPUs de consumo de 24 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con la configuracion documentada de dequantizacion completa.
- Despliegue: vLLM 0.32.0 mediante el `serve.sh` incluido (backend de atencion `TRITON_ATTN`, backend MoE `triton`, `--gpu-memory-utilization 0.85`, `--max-num-seqs 4`, captura de CUDA graphs para tamanos 1, 2 y 4); tambien carga via `peft.AutoPeftModelForCausalLM` con Transformers 4.57.6, PEFT 0.20.0 y PyTorch 2.9.1.
- Almacenamiento: aproximadamente 40 GiB de disco para el export reconstruido, ademas del modelo base en cache.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kortukov/gpt-oss-20b-role-perception-appworld-27000 | 20B (base) + LoRA | 131.072 | Adaptador LoRA sobre MoE | Apache 2.0 | Hugging Face (0 descargas) |
| openai/gpt-oss-20b | 20B | no disponible en esta ficha | MoE base | Apache 2.0 | Hugging Face (modelo base) |
| Otros adaptadores LoRA sobre gpt-oss-20b | 20B (base) + LoRA | depende del adaptador | LoRA | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere el modelo base `openai/gpt-oss-20b` en la revision exacta `6cee5e81ee83917806bbde320786a8fb61efebee`; cargar solo los tensores de atencion o usar un base con cuantizacion distinta no reproduce el modelo.
- La ruta nativa de LoRA de vLLM (`vllm serve ADAPTER_REPO`) no es equivalente al launcher incluido; el autor no reclama equivalencia para esa ruta.
- El autor advierte explicitamente de que la recuperacion de etiquetas de rol por si sola no establece robustez frente a prompt injection.
- Riesgo de sobreajuste a las 90 tareas de AppWorld usadas en entrenamiento; el comportamiento en tareas fuera de ese conjunto no esta documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; heredado del modelo base.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datos de entrenamiento (no documentadas en esta ficha).
- El repositorio ocupa 44,9 GB y la reconstruccion local requiere unos 40 GiB adicionales de disco, lo que puede ser prohibitivo en entornos con almacenamiento limitado.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kortukov/gpt-oss-20b-role-perception-appworld-27000
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Informe del proyecto: https://github.com/kortukov/role_probe_training/tree/main/experiment_reports/training_against_role_probes
- Repositorio de entrenamiento: https://github.com/kortukov/role_probe_training
