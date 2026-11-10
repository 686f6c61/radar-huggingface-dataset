# Liso/qwen36-35b-colibri

## Resumen

Liso/qwen36-35b-colibri es un contenedor experimental de 4 bits del modelo Qwen/Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, desarrollado originalmente por el equipo Qwen. Este artefacto, publicado por el usuario Liso, empaqueta el modelo base cuantizado a int4 con grupo de tamaño 64 junto con un fine-tune LoRA de rango 16 orientado a generación de código, todo ello en el formato propietario del motor Colibri (JustVugg/colibri).

El problema que aborda es la ejecución de un MoE de 35B en hardware de consumo muy limitado: el fine-tune se entrenó con LoRA en streaming mediante AirLLM sobre una única GPU de 8 GB, y el contenedor resultante está diseñado para que el motor Colibri sirva el modelo haciendo streaming de expertos en frío desde SSD. El repositorio ocupa 24,5 GB y se distribuye como safetensors fragmentados (40 shards) más tensores separados de globals, MTP y visión.

Es relevante ahora como checkpoint de investigación reproducible: el autor publica el pipeline completo de generación de datos, logs de entrenamiento y resultados de holdout, y advierte explícitamente de que no se trata de una mejora sobre el estado del arte. La evaluación sobre 60 casos congelados muestra 32/60 frente a 34/60 del contenedor int4 previo al fine-tune, por lo que la promoción se decide caso a caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 256 expertos |
| Parametros totales | 35B (aproximado, segun denominacion del modelo base) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 32.768 tokens (configuracion de servicio recomendada en la model card) |
| Tipos de cuantizacion | int4 con group size 64; adaptador LoRA en el repositorio |
| Idiomas soportados | en, code |
| Licencia | qwen3.6-35b-a3b-upstream-license (heredada del modelo base Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | Contenedor Colibri: qwen36_meta.json + safetensors fragmentados (model-00000..00039.safetensors, model-globals.safetensors, model-mtp.safetensors, model-vision.safetensors); no es un checkpoint estandar de transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 256 expertos y aproximadamente 3B de parámetros activos por token, lo que permite un coste de cómputo por token muy inferior al de un denso de 35B. El contenedor aplica cuantización int4 con group size 64 sobre los pesos en bf16 (fuente de 67 GB) y los reorganiza en 40 shards más tensores globales, MTP (multi-token prediction) y de visión. El formato no es compatible con transformers estándar: requiere el motor Colibri para su carga.

El fine-tune consistió en un LoRA de rango 16 con 21,2 millones de parámetros entrenables, aplicado mediante LoRA en streaming con AirLLM sobre una única GPU de 8 GB, durante 2 épocas sobre pares de código generados y verificados por ejecución localmente. El adaptador se fusionó en el modelo base y se recuantizó a int4. No se emplearon conjuntos de test de benchmarks durante el entrenamiento, según declara el autor. El adaptador original en formato .pt se conserva en lora/qwen36-lora-adapter.pt.

## Capacidades

- Generación de texto y código: el modelo base es un MoE de propósito general con capacidades de razonamiento y programación; el fine-tune está orientado específicamente a tareas de código.
- Razonamiento multi-paso: el modelo base Qwen3.6 incorpora modos de razonamiento, aunque la model card de este contenedor no detalla su configuración concreta.
- Capacidades multimodales: el contenedor incluye tensores de visión (model-vision.safetensors), lo que sugiere soporte de entrada de imagen heredado del modelo base; no se documenta su funcionamiento en este formato.
- Predicción multi-token: incluye tensores MTP (model-mtp.safetensors), asociados a decodificación especulativa en la familia Qwen.
- Idiomas: inglés y código; no se declara soporte de otros idiomas.
- Tool calling / function calling: no documentado en la información disponible para este contenedor.
- Soporte de agentes: no documentado en la información disponible.

## Casos de uso

- Asistencia de código en local con hardware limitado: el motor Colibri hace streaming de expertos desde SSD, de modo que un equipo con GPU de 8 GB y disco rápido puede servir un MoE de 35B para autocompletado y generación de funciones, aunque con latencia dependiente del almacenamiento.
- Reproducción de investigación en fine-tuning eficiente: el pipeline AirLLM + LoRA en streaming sobre una sola GPU de 8 GB sirve como referencia reproducible para experimentar con adaptadores sobre modelos grandes; los logs y scripts están publicados en el repositorio colibri-finetune.
- Evaluación de contenedores cuantizados: útil para medir el impacto de int4 con group size 64 frente a bf16 y para validar la política de no regresión caso a caso descrita por el autor.
- Servicio local compatible con OpenAI: el motor Colibri expone una API compatible con OpenAI en localhost, lo que permite integrar el modelo en herramientas que ya consumen ese protocolo sin modificar el cliente.
- Prototipado de generación de código verificado por ejecución: dado que el fine-tune se entrenó con pares generados y validados ejecutando el código, encaja en flujos de generación de tests o parches que se validan automáticamente antes de aceptarse.
- Experimentación con decodificación especulativa: la presencia de tensores MTP permite probar configuraciones de decodificación multi-token en el motor Colibri para reducir latencia en generación de código.

## Benchmarks y rendimiento

| Modelo | Puntuacion en holdout congelado (60 casos, 12 familias) |
|---|---|
| Contenedor int4 previo al fine-tune | 34/60 |
| Este contenedor con fine-tune | 32/60 |

El autor indica que el fine-tune gana cuatro casos y regresa dos, y que la política de cero regresiones por caso (results/holdout_verdict.json) decide la promoción caso a caso. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el contenedor está pensado para GPUs de 8 GB, ya que el motor hace streaming de expertos en frío desde SSD; no se especifica un mínimo exacto de VRAM.
- GPU recomendadas: se recomienda una GPU con soporte Vulkan; el fine-tune se realizó sobre una única GPU de 8 GB.
- Almacenamiento: crítico; el autor señala que un SSD rápido importa más que la RAM, dado que los expertos se transmiten desde disco.
- Tiempo de primera carga: aproximadamente 30-60 segundos.
- Opciones de despliegue: motor Colibri (comando `coli serve` con `--auto-tier --policy quality --ctx 32768`), que expone una API compatible con OpenAI. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint estándar de transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Liso/qwen36-35b-colibri | 35B | ~3B | 32.768 (recomendado) | qwen3.6-35b-a3b-upstream-license | Contenedor Colibri int4, motor Colibri |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible en esta ficha | qwen3.6-35b-a3b-upstream-license | bf16, transformers y ecosistema estandar |
| Contenedor int4 sin fine-tune (referencia del autor) | 35B | ~3B | 32.768 (recomendado) | heredada | Contenedor Colibri int4 |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al contenedor previo al fine-tune en el holdout global (32/60 frente a 34/60); el autor lo describe como checkpoint de investigación, no como estado del arte.
- Formato no estándar: no carga con transformers, vLLM, llama.cpp, Ollama ni TGI; requiere el motor Colibri y su ecosistema.
- Dependencia de almacenamiento: el streaming de expertos desde SSD condiciona la latencia; un disco lento degrada gravemente el rendimiento.
- Idiomas limitados a inglés y código; no se declara soporte de castellano ni de otras lenguas.
- Licencia heredada del modelo base con nombre propio (qwen3.6-35b-a3b-upstream-license); es necesario revisar los términos del modelo Qwen original antes de cualquier uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual en este contenedor.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- El fine-tune se entrenó con datos autogenerados y verificados por ejecución; no se detalla su composición ni su cobertura, lo que limita la evaluación de su generalización.
- El contenedor incluye tensores de visión y MTP, pero su comportamiento no está documentado en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liso/qwen36-35b-colibri
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de evidencia del fine-tune: https://github.com/Liso7150/colibri-finetune
- Motor Colibri: https://github.com/JustVugg/colibri
- Entrenamiento LoRA en streaming (AirLLM): https://github.com/lyogavin/airllm
- Entorno de configuración: https://github.com/Liso7150/colibri-environment-setup
