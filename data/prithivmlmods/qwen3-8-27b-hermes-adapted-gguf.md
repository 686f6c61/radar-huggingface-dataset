# prithivMLmods/Qwen3.8-27B-hermes-adapted-GGUF

## Resumen

Qwen3.8-27B-hermes-adapted-GGUF es la distribucion cuantizada en formato GGUF del checkpoint Qwen3.8-27B-hermes-adapted, un modelo de 27.320.697.856 parametros (27,3 mil millones) derivado de Qwen/Qwen3.8-27B. El autor de esta publicacion es prithivMLmods, mientras que el adaptador original y el checkpoint fusionado proceden de harness-hub. El modelo esta disenado como backbone del agente Hermes para tareas de ingenieria de software y operacion de terminal, y esta afinado mediante aprendizaje por refuerzo AsyncGRPO sobre entornos Harbor/OpenEnv.

El modelo base fue ajustado con un adaptador LoRA (r = 32, alpha = 64) que afecta a las proyecciones q, k, v, o, gate, up y down. Ese adaptador se fusiono posteriormente en el checkpoint BF16 de Qwen3.8-27B para producir un modelo autonomo servible en cualquier motor de inferencia sin soporte de LoRA. Esta version GGUF anade ademas soporte de Multi-Token Prediction (MTP) con decodificacion especulativa integrada en los propios pesos, lo que acelera la inferencia local sin necesidad de un modelo borrador separado.

La relevancia actual del modelo radica en su orientacion a agentes: segun la model card del adaptador, mejora SWE-bench Pro (hard 51) del 29,4 % al 43,1 % y Terminal-Bench 2.1 del 44,7 % al 58,8 % bajo el agente Hermes, con menos del 40 % de los turnos del modelo base en tareas resueltas y aproximadamente la mitad de tokens generados. Estas cifras se midieron sobre el adaptador con el modelo base BF16 y no se han reevaluado sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B) con cabezas MTP para decodificacion especulativa; proyeccion multimodal mmproj para vision |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0, mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y BF16 en el checkpoint base; safetensors en el modelo original |
| Tamano del repositorio | 101,4 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | harness-hub/Qwen3.8-27B-hermes-adapted |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27,3 mil millones de parametros. Sobre el se entreno un adaptador LoRA con r = 32 y alpha = 64 que cubre las proyecciones de atencion (q, k, v, o) y las proyecciones del bloque feed-forward (gate, up, down). El entrenamiento utilizo aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv, con el modo de razonamiento (thinking) desactivado, tal como se emplea en produccion. Los datasets citados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments.

La fusion del adaptador se realizo aplicando la actualizacion estandar W + (alpha/r)·B@A por tensor en fp32 y convirtiendo de nuevo a BF16, preservando la disposicion de shards, los nombres de tensores y todos los tensores MTP del modelo base. La innovacion tecnica destacable es la integracion de Multi-Token Prediction en el propio GGUF: en lugar de requerir un modelo borrador externo, el archivo incluye cabezas adicionales que predicen varios tokens futuros en una sola pasada, habilitando decodificacion especulativa nativa en llama.cpp. El repositorio incluye ademas un archivo mmproj en BF16 (931 MB) para las capacidades de vision.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantillas de chat.
- Razonamiento orientado a agentes sobre tareas de ingenieria de software y operacion de terminal, con modo thinking desactivado por diseno.
- Capacidades multimodales de imagen a texto mediante el proyector mmproj-bf16.
- Ejecucion de tareas multi-paso en entornos tipo terminal (Harbor/OpenEnv) como backbone del agente Hermes.
- Decodificacion especulativa integrada mediante cabezas MTP, sin modelo borrador externo.
- Compatibilidad con llama.cpp y con text-generation-inference segun los tags del repositorio.
- Soporte de cuantizacion GGUF en varios niveles de calidad y tamano.
- No se documentan capacidades de audio ni soporte multilingue mas alla del ingles.

## Casos de uso

- Agente de ingenieria de software: el modelo puede resolver tareas de reparacion de codigo en repositorios reales, ya que fue entrenado con AsyncGRPO sobre entornos de SWE y muestra mejoras medidas en SWE-bench Pro (hard 51) del 29,4 % al 43,1 % bajo el agente Hermes.
- Automatizacion de terminal y operaciones: adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en cadena, con una mejora documentada en Terminal-Bench 2.1 del 44,7 % al 58,8 %.
- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M (17 GB) permite ejecutar el modelo en GPU de consumo de gama alta con llama.cpp, manteniendo las cabezas MTP para acelerar la generacion.
- Asistente de codigo en IDE o CLI: al estar afinado para tareas de terminal y con menos turnos y tokens que el modelo base, encaja en flujos interactivos donde la latencia y el coste por tarea importan.
- Procesamiento de capturas o diagramas tecnicos: el archivo mmproj-bf16 habilita entrada de imagen, util para interpretar pantallas de terminal, diagramas de arquitectura o errores visuales.
- Evaluacion de agentes y entornos: sirve como modelo de referencia para probar harness, entornos Harbor/OpenEnv y pipelines de evaluacion de agentes de software.
- Prototipado de pipelines de CI/CD con agentes: puede integrarse en automatizaciones que requieran razonamiento sobre logs y ejecucion de comandos, aunque con la cautela de que las cifras no se han reevaluado sobre esta cuantizacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al adaptador evaluado sobre el modelo base BF16, no sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

| Benchmark | Modelo base (segun model card del adaptador) | Con adaptador Hermes |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4 % | 43,1 % |
| Terminal-Bench 2.1 | 44,7 % | 58,8 % |

No se han publicado resultados de benchmarks sobre este checkpoint fusionado ni sobre los archivos GGUF en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB para Q4_K_M, 15,8 GB para Q4_K_S, 19,6 GB para Q5_K_M, 19 GB para Q5_K_S y 29 GB para Q8_0, mas el archivo mmproj-bf16 de 931 MB si se usa vision.
- GPU recomendadas: para Q8_0 se recomienda una GPU de 32 GB o mas (A100 40 GB, H100, RTX 5090). Para Q4_K_M y Q5_K_M bastan GPU de 24 GB como RTX 4090 o RTX 3090, con margen ajustado en Q5.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizaciones Q4 y Q5; en GPU de 16 GB solo con cuantizaciones mas agresivas no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y MTP), text-generation-inference segun los tags del repositorio, y motores compatibles con GGUF.
- Latencia y throughput: no disponibles de forma medida; la model card indica que el adaptador genera aproximadamente 2x menos tokens que el modelo base en tareas resueltas, y que las cabezas MTP aceleran la inferencia local mediante decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-GGUF | 27,3 mil millones | no disponible | Agente de software y terminal, MTP | apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,3 mil millones | no disponible | Modelo generalista | no disponible en la informacion | Hugging Face |
| harness-hub/Qwen3.8-27B-hermes-adapted (BF16) | 27,3 mil millones | no disponible | Agente de software y terminal | apache-2.0 | BF16 en Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; no se documentan otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo y terminal donde una salida incorrecta puede ejecutar comandos erroneos.
- Las mejoras de benchmark (SWE-bench Pro y Terminal-Bench 2.1) se midieron sobre el adaptador con el modelo base BF16 y no se han reevaluado sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF; el rendimiento real puede diferir.
- Las cuantizaciones Q4 y Q5 introducen perdida de calidad respecto a BF16, con impacto no cuantificado en tareas de agente.
- El modo thinking esta desactivado por diseno de entrenamiento; no se debe esperar razonamiento extendido explicito.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datasets de entrenamiento antes de un despliegue en produccion.
- El repositorio ocupa 101,4 GB, lo que exige espacio de almacenamiento considerable aunque solo se descargue una cuantizacion.
- No se documenta la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantias.
- El modelo esta especializado en tareas de agente de software; su rendimiento en dominios generales puede ser inferior al del modelo base sin adaptar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset harness-hub/scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-hub/harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset harness-hub/termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset ai-and/termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
