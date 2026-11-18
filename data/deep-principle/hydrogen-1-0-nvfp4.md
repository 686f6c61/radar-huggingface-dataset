# deep-principle/Hydrogen-1.0-NVFP4

## Resumen

Hydrogen-1.0-NVFP4 es la version cuantizada en NVFP4 del modelo cientifico Hydrogen-1.0, desarrollado por Deep Principle sobre la base de GLM-5.3 (zai-org). Se trata de un modelo de generacion de texto orientado a la resolucion de problemas cientificos y la asistencia a la investigacion: derivaciones, explicaciones tecnicas y organizacion de respuestas a preguntas abiertas de investigacion. Esta variante concreta no es un modelo nuevo, sino un checkpoint cuantizado pensado para despliegue eficiente en hardware NVIDIA Blackwell.

El modelo completo cuenta con 380.989 millones de parametros (segun los pesos en safetensors) y una arquitectura GLM MoE con atencion dispersa (tag `glm_moe_dsa`). Declara una longitud de contexto de 1M de tokens y una salida maxima de 128K tokens, aunque el ejemplo de despliegue del autor limita el contexto servido a 262.144 tokens. La cuantizacion NVFP4 se ha realizado con NVIDIA ModelOpt y el equipo reporta pruebas sobre 8x NVIDIA B300 con SGLang. El repositorio ocupa 464,2 GB.

Su relevancia actual radica en que permite ejecutar un modelo de casi 381B parametros con expertos en FP4 sobre GPUs Blackwell, manteniendo en BF16 las partes sensibles (atencion, router, embeddings, lm_head, expertos compartidos y capa MTP) y usando FP8 para los MLP densos de las capas 0-2 y para la cache KV. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM MoE con atencion dispersa (tag `glm_moe_dsa`); transformer con mezcla de expertos |
| Parametros totales | 380.989.135.104 (aprox. 381B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens declarados; 262.144 tokens en el ejemplo de despliegue del autor |
| Salida maxima | 128K tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), FP8 (MLP densos capas 0-2 y cache KV); resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint cuantizado con ModelOpt, incluye `hf_quant_config.json`) |
| Modelo base | deep-principle/Hydrogen-1.0 (a su vez basado en GLM-5.3) |
| Herramienta de cuantizacion | NVIDIA ModelOpt |
| Tamano del repositorio | 464,2 GB |

## Arquitectura y entrenamiento

Hydrogen-1.0 se construye sobre GLM-5.3, un transformer con mezcla de expertos (MoE) y atencion dispersa, segun el tag `glm_moe_dsa` del repositorio. Esta variante NVFP4 aplica cuantizacion de 4 bits (NVFP4) a los expertos enrutados con escalas de activacion calibradas, emplea FP8 para los MLP densos de las capas 0-2 y mantiene en BF16 los expertos compartidos, la atencion, el router, los embeddings, el `lm_head` y la capa MTP (multi-token prediction). La configuracion incluye ajustes de cache KV en FP8.

No se publican detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el autor remite al blog tecnico y senala explicitamente que los datasets y recetas completas no se liberan con los pesos. La innovacion destacable de esta version es el pipeline de cuantizacion con ModelOpt y la preservacion selectiva de precision en las capas criticas, ademas de la capa MTP que sugiere decodificacion especulativa o prediccion multi-token.

## Capacidades

- Generacion de texto conversacional y asistencia a la investigacion cientifica.
- Razonamiento cientifico: derivaciones, explicacion de supuestos y organizacion de respuestas a problemas abiertos.
- Modo de razonamiento configurable mediante `reasoning_effort` (por ejemplo, `max`) en el chat template.
- Soporte de tool calling: el despliegue de referencia incluye `--tool-call-parser glm47`.
- Soporte de agentes y razonamiento multi-paso, orientado a flujos de trabajo de investigacion (formular preguntas, planificar, analizar evidencia, iterar).
- Capacidades demostradas en el blog tecnico: computacion cientifica, exploracion de redes de reaccion, analisis de estructuras por RMN y planificacion experimental, combinando el modelo con herramientas externas.
- Capacidad multilingue: no disponible (la model card incluye una version en chino del README, pero no se detallan idiomas soportados).
- Capacidad de vision o audio: no disponible.

## Casos de uso

- Asistencia a derivaciones cientificas: el modelo puede explicar paso a paso derivaciones fisicas o matematicas (por ejemplo, el periodo del pendulo simple y los limites de la aproximacion de angulo pequeno), indicando supuestos y condiciones de validez, gracias a su modo de razonamiento configurable.
- Exploracion de redes de reaccion: combinado con herramientas externas de quimica computacional, puede ayudar a plantear rutas de reaccion y analizar resultados, como se documenta en el blog tecnico del autor.
- Analisis de estructuras por RMN: el modelo puede asistir en la interpretacion y organizacion de datos estructurales dentro de un entorno de investigacion, con revision cientifica posterior obligatoria.
- Planificacion experimental: puede estructurar hipotesis, variables, controles y pasos de un experimento, y ayudar a iterar el diseno a partir de la evidencia recogida.
- Procesamiento de documentacion cientifica de gran volumen: con contexto de hasta 1M tokens declarados (262.144 en el despliegue de referencia), puede ingerir articulos, informes o transcripciones extensas y resumir o contrastar su contenido.
- Agentes de investigacion multi-paso: gracias al soporte de tool calling y parser de funciones, puede integrarse en pipelines que consulten bases de datos, ejecuten calculos o recuperen literatura y compongan una respuesta final.
- Atencion a usuarios tecnicos especializados: un asistente conversacional para equipos de I+D que necesiten explicaciones con supuestos explicitos y trazabilidad del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El repositorio pesa 464,2 GB; el despliegue de referencia usa 8x NVIDIA B300 con tensor parallelism 8 y `--mem-fraction-static 0.85`.
- GPU recomendadas: NVIDIA Blackwell (B300) para NVFP4; el autor indica que se ha probado en 8x B300. Para la version MXFP4, el equipo reporta pruebas en AMD Instinct MI350X con ATOM.
- GPU de consumo: no disponible; por el tamano (381B parametros y 464 GB de checkpoint) no es viable en GPUs de consumo convencionales.
- Opciones de despliegue: SGLang con `--quantization modelopt_fp4 --kv-cache-dtype fp8_e4m3`; se requiere un runtime compatible con el formato de checkpoint NVFP4 exportado por ModelOpt. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| Hydrogen-1.0-NVFP4 (este) | 381B | 1M declarados (262.144 en despliegue) | NVFP4 + FP8 | MIT | 8x NVIDIA B300 (SGLang) |
| Hydrogen-1.0 (BF16) | 381B | 1M declarados | BF16 | MIT | Memoria suficiente para pesos sin cuantizar |
| Hydrogen-1.0-MXFP4 | 381B | 1M declarados | MXFP4 | MIT | AMD Instinct MI350X con ATOM |
| GLM-5.3 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo orientado a investigacion cientifica: el propio autor advierte que las salidas deben evaluarse frente a los supuestos, restricciones y evidencia de cada tarea, y requieren revision cientifica.
- Riesgo de alucinacion: no se documentan tasas ni evaluaciones de fidelidad; en dominios cientificos el riesgo de afirmaciones incorrectas es relevante.
- Contexto efectivo limitado en el despliegue de referencia: el comando de ejemplo limita el contexto a 262.144 tokens, no al 1M declarado; ampliarlo exige soporte del runtime y memoria suficiente.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue fuera de los idiomas no especificados por el autor.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Dependencia de hardware especifico: la version NVFP4 requiere runtime compatible con NVIDIA Blackwell y el formato ModelOpt; no hay soporte documentado para GPUs mas antiguas ni para backends alternativos.
- Requisitos de integridad del checkpoint: deben conservarse juntos tokenizer, chat template, `generation_config.json`, configuraciones de modelo y cuantizacion, y el indice de pesos, para respetar los ajustes de fin de turno y parada.
- Licencia MIT: permite uso comercial, pero el autor no libera datasets ni recetas de entrenamiento, lo que limita la reproducibilidad.
- No se han publicado benchmarks: la evaluacion comparativa con alternativas no es posible con los datos disponibles.

## Enlaces

- Hugging Face (NVFP4): https://huggingface.co/deep-principle/Hydrogen-1.0-NVFP4
- Modelo base BF16: https://huggingface.co/deep-principle/Hydrogen-1.0
- Version MXFP4: https://huggingface.co/deep-principle/Hydrogen-1.0-MXFP4
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Blog tecnico: https://blog.deepprinciple.com/introducing-hydrogen-1.0/
- Guia de uso: docs/USAGE.md (referenciada en la model card)
- README en chino: README.zh-CN.md (referenciado en la model card)
- Contacto: info@deepprinciple.com
