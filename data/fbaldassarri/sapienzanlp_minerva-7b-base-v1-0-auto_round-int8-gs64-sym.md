# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int8-gs64-sym

## Resumen

Minerva-7B-base-v1.0 es un modelo de lenguaje causal de tipo base (completion), construido sobre la arquitectura Mistral y desarrollado por el grupo SapienzaNLP de la Universidad de La Sapienza (Roma). Está especializado en italiano e inglés y se distribuye bajo licencia Apache 2.0. Esta ficha documenta la variante cuantizada publicada por el usuario fbaldassarri, que aplica cuantización de solo pesos (WoQ) en INT8 con el algoritmo AutoRound (SignRound) de Intel sobre el modelo original.

La relevancia de esta variante reside en su orientación al despliegue en hardware Intel: la model card indica que ha sido cuantizada para inferencia en CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch y NPU Intel (AI Boost en la serie Core Ultra) mediante OpenVINO. Esto permite ejecutar un modelo de 7B en equipos sin GPU dedicada, reduciendo el peso de los pesos de aproximadamente 14 GB en bfloat16 a unos 7 GB en INT8.

Conviene señalar una discrepancia importante: el recuento real de parámetros en los ficheros safetensors del repositorio es de 2.300.841.984, muy inferior a los 7B que sugiere el nombre del modelo base. No se dispone de información en la documentación proporcionada que explique esta diferencia, por lo que debe tratarse con cautela a la hora de planificar recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: mistral) |
| Parametros totales | 2.300.841.984 (según safetensors del repo); el nombre del modelo base indica 7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8, solo pesos (WoQ), group size 64, simétrica, AutoRound (SignRound) v0.16.0 |
| Idiomas soportados | Italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Mistral, un transformer causal decoder-only con atención por ventanas deslizantes (según el `model_type` declarado), aunque la model card de esta variante no detalla la configuración exacta de capas, cabezas ni dimensión oculta. Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya ajuste por instrucciones, pero este extremo no se confirma en la documentación.

La innovación técnica de esta variante es la cuantización. Se aplicó AutoRound v0.16.0 con 8 bits, group size 64 y cuantización simétrica, calibrando sobre 128 muestras de 512 tokens con 200 iteraciones y batch size 4, en dispositivo CPU y con los pesos cargados en bfloat16. El proceso completo registró una duración de 40.049 segundos (unas 11 horas). La receta de replicación se documenta de forma explícita, incluyendo versiones de transformers (4.55.3) y torch (2.14.1+cpu), lo que facilita la reproducibilidad byte a byte mediante el pipeline `auto-round-pipeline`.

## Capacidades

- Generación de texto autoregresiva en italiano e inglés, en modo completion (sin plantilla de instrucciones).
- Continuación de texto libre a partir de un prompt crudo, tal como se muestra en el ejemplo de uso de la model card.
- Capacidad multilingüe limitada a los dos idiomas declarados (it, en).
- Inferencia optimizada en CPU Intel, iGPU Arc y NPU Intel mediante intel-extension-for-pytorch y OpenVINO.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Al ser un modelo base, no se garantiza un comportamiento alineado ante instrucciones; no se han publicado evaluaciones de seguridad.

## Casos de uso

- Generación de texto en italiano en entornos sin GPU: el modelo cuantizado en INT8 puede ejecutarse en CPU Intel con un consumo de memoria de aproximadamente 7 GB, adecuado para servidores de gama media o estaciones de trabajo.
- Asistencia a la redacción y completado de documentos: al ser un modelo base, encaja en tareas de continuación de texto (por ejemplo, redacción de borradores o autocompletado) donde no se requiere seguimiento estricto de instrucciones.
- Prototipado de investigación en PLN para italiano: sirve como punto de partida para experimentos de evaluación lingüística o como base para fine-tuning posterior en tareas específicas.
- Despliegue en equipos con Intel Core Ultra: la compatibilidad con NPU vía OpenVINO permite ejecutar inferencia local con bajo consumo energético en portátiles y mini-PC.
- Generación aumentada en pipelines de datos: puede integrarse en procesos por lotes de generación o aumento de corpus en italiano e inglés, donde el throughput en CPU es suficiente.
- Evaluación comparativa de cuantización: este artefacto es útil para medir el impacto de AutoRound INT8 frente al modelo original en tareas de perplejidad o generación, dado que la receta de replicación está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 7 GB para los pesos en INT8 (el repositorio ocupa 9,0 GB, incluyendo metadatos y posibles ficheros auxiliares). El modelo original en bfloat16 requeriría en torno a 14 GB.
- GPU recomendadas: no se especifican; el artefacto está orientado a CPU Intel, iGPU Intel Arc (por ejemplo, Core Ultra 185H) y NPU Intel (AI Boost en Core Ultra).
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más de VRAM, aunque la model card no confirma compatibilidad ni rendimiento en GPU NVIDIA o AMD; el pipeline permite compilar con `--cuda` o `--rocm`.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch para CPU/iGPU, OpenVINO para NPU. La model card no menciona vLLM, llama.cpp, Ollama ni TGI, y de hecho declara `inference: false` en los metadatos.
- Latencia y throughput: no disponibles. El tiempo de cuantización registrado (40.049 s) no es un indicador de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Minerva-7B-base-v1.0 (INT8, esta ficha) | 2,3B según safetensors (nombre: 7B) | no disponible | it, en | Apache 2.0 | Cuantización AutoRound INT8, orientada a hardware Intel |
| sapienzanlp/Minerva-7B-base-v1.0 (original) | 7B (según nombre) | no disponible | it, en | Apache 2.0 | Pesos en bfloat16, mayor huella de memoria |
| Otros modelos base italianos de 7B | no disponible | no disponible | it | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia entre el nombre (7B) y el recuento real de parámetros en safetensors (2,3B): conviene verificar la integridad del artefacto antes de usarlo en producción.
- Es un modelo base, no ajustado por instrucciones: no debe esperarse un seguimiento fiable de comandos ni un formato de respuesta alineado.
- Idiomas limitados a italiano e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el autor declara que el modelo se ha desarrollado únicamente con fines de investigación y sin garantía.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente y los datos de entrenamiento pueden imponer condiciones adicionales no detalladas en esta ficha.
- El artefacto declara `inference: false` en los metadatos y no se confirma su funcionamiento en GPUs NVIDIA o AMD sin recompilar el pipeline.
- Longitud de contexto no especificada: no se debe asumir la ventana típica de Mistral sin verificar el `config.json` del modelo base.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de cuantización: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
