# prince4332/qwen35-twi-va-4-full-GGUF

## Resumen

qwen35-twi-va-4-full-GGUF es un ajuste fino (fine-tune) del modelo base Qwen3.5, publicado por el usuario prince4332 en HuggingFace y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. El repositorio contiene un unico archivo de pesos, `qwen35-twi-va-4-full.Q3_K_M.gguf`, de aproximadamente 1,1 GB, lo que situa al modelo en la categoria de pequenos modelos densos aptos para inferencia en CPU y GPU de gama de consumo. El autor indica que el ajuste y la conversion a GGUF se realizaron con la libreria Unsloth.

Segun los metadatos reales de safetensors asociados al repositorio, el modelo tiene 1.891.655.488 parametros (unos 1,89 mil millones). El nombre del repositorio incluye el sufijo "4", que sugiere una variante de 4B de la familia Qwen3.5, pero el recuento de parametros disponible no coincide con ese tamano, por lo que no es posible confirmar a que variante exacta corresponde sin informacion adicional del autor.

El modelo es relevante como ejemplo de la ola de derivados comunitarios de Qwen3.5 publicados en formato GGUF: permite ejecutar localmente un modelo conversacional de menos de 2B parametros con un peso de fichero inferior a 1,2 GB. Sin embargo, la model card es extremadamente escueta: no se declara licencia, idiomas, contexto, ni se documenta el dataset de ajuste, lo que limita seriamente su evaluacion para uso en produccion. A fecha de la ficha acumula 42 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun la etiqueta `qwen3_5`) |
| Parametros totales | 1.891.655.488 (aprox. 1,89B), segun metadatos de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible para este ajuste; la familia Qwen3.5 se anuncia con un minimo de 256k tokens en colecciones de terceros, sin confirmar para esta variante |
| Tipos de cuantizacion | Q3_K_M (unico fichero publicado). Otras cuantizaciones GGUF estandar de llama.cpp no estan publicadas en el repo |
| Idiomas soportados | no disponible (el sufijo "twi" del nombre podria referirse al idioma twi/akan, pero no esta confirmado en la model card) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | GGUF (llama.cpp); el ajuste se genero con Unsloth |
| Tamano del repositorio | 1,1 GB |
| Ficheros de pesos | 1 (`qwen35-twi-va-4-full.Q3_K_M.gguf`) |
| Pipeline | no disponible |
| Fecha de creacion | 2026-09-23 (segun metadatos de HuggingFace) |
| Descargas / likes | 42 / 0 |

## Arquitectura y entrenamiento

El modelo parte de la serie Qwen3.5 de Alibaba (etiqueta `qwen3_5` en los metadatos), una familia de LLM transformer decoder-only con atencion causal. La informacion publica sobre la serie menciona variantes densas de 0.8B, 2B, 4B, 9B, 27B y 35B, y al menos algunas de ellas con soporte multimodal (imagenes) y contexto de 256k tokens como minimo. No obstante, para este ajuste concreto no se especifica en la model card a que variante corresponde, ni si conserva las capacidades multimodales del base. El autor incluye instrucciones tanto para `llama-cli` (modelos de solo texto) como para `llama-mtmd-cli` (modelos multimodales), lo que sugiere que el repositorio podria estar preparado para un modelo con torre de vision, pero no se confirma.

Sobre el entrenamiento, la unica informacion disponible es que el ajuste y la conversion a GGUF se realizaron con Unsloth, libreria especializada en fine-tuning eficiente con LoRA/QLoRA y en la exportacion a formatos cuantizados. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o SFT. La model card no incluye hiperparametros, ni indicaciones sobre el proposito del ajuste (el segmento "twi-va" del nombre no se explica). No se dispone de informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, atencion hibrida, etc.) especificas de este derivado.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta orientado a dialogos multi-turno con plantilla de chat, invocable con `llama-cli --jinja`.
- Razonamiento y conocimientos generales: heredados del modelo base Qwen3.5, si bien no hay evaluacion publicada que lo verifique para este ajuste.
- Generacion de codigo: capacitable en principio por herencia del base, pero sin datos de validacion ni benchmarks en el repositorio.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible; no se declara lista de idiomas soportados.
- Posible capacidad de vision: no confirmada. La model card menciona el comando `llama-mtmd-cli` para modelos multimodales, pero no afirma que este ajuste lo sea.
- Modo "thinking" o razonamiento extendido: no disponible (no se documenta).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse en infraestructura de endpoints compatible con HuggingFace, aunque no se detallan los requisitos.

## Casos de uso

- Prototipado local en portatil o estacion de trabajo sin GPU: con un fichero Q3_K_M de 1,1 GB, el modelo cabe en RAM y puede ejecutarse con llama.cpp en CPU, lo que permite experimentar con un LLM conversacional sin depender de servicios en la nube.
- Asistente de chat embebido en aplicaciones de escritorio: al ser un modelo pequeno y auto-contenido, se puede integrar en herramientas de escritorio o plugins de IDE mediante un binario de llama.cpp, manteniendo la inferencia totalmente offline.
- Filtrado y clasificacion de texto ligero: tareas de etiquetado, resumen corto o reformulacion de parrafos donde no se requiere un modelo grande, aprovechando el bajo coste por token en hardware modesto.
- Generacion de texto en dispositivos con recursos limitados: el tamano del fichero (1,1 GB) permite desplegarlo en equipos con 4-8 GB de RAM total, incluidos mini-PC y entornos contenerizados de baja capacidad.
- Base para nuevos ajustes comunitarios: al estar ya en formato GGUF cuantizado y acompanado de instrucciones de uso, sirve como punto de partida para experimentos de fine-tuning o para comparar variantes de cuantizacion con llama.cpp.
- Aprendizaje y ensenanza de tecnicas de cuantizacion: util para demostrar el flujo completo base -> fine-tune con Unsloth -> conversion a GGUF -> inferencia con llama.cpp, en cursos o talleres practicos.
- Evaluacion de riesgos de modelos no documentados: caso de uso metodologico para estudiar que ocurre cuando se despliega un modelo sin licencia, sin idiomas declarados y sin benchmarks, algo comun en el ecosistema de derivados comunitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, ni ninguna otra evaluacion, y los resultados de busqueda consultados no aportan cifras para este ajuste concreto.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el unico fichero publicado (Q3_K_M) ocupa 1,1 GB, por lo que requiere aproximadamente 1,5-2,5 GB de memoria total considerando pesos, cache KV y overhead del runtime. Estas cifras son estimaciones de ingenieria basadas en el tamano del fichero, no datos publicados por el autor.
- GPU recomendadas: practicamente cualquier GPU moderna con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo esta claramente sobredimensionado respecto al hardware de gama alta, por lo que este no es el cuello de botella.
- Viabilidad en GPU de consumo: si. Cabe holgadamente en GPUs de portatil y de sobremesa de gama media y baja, e incluso en iGPU con memoria unificada.
- Ejecucion en CPU: viable con llama.cpp, dado el reducido numero de parametros y el peso del fichero.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por compatibilidad de formato, herramientas que consumen GGUF como Ollama o LM Studio (no confirmado explicitamente por el autor). vLLM y TGI trabajan preferentemente con safetensors; no hay pesos safetensors publicados en este repositorio, solo GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| prince4332/qwen35-twi-va-4-full-GGUF | 1,89B | no disponible | GGUF (Q3_K_M) | no disponible | Derivado comunitario, sin benchmarks ni documentacion de entrenamiento |
| Qwen3.5 2B (base oficial) | ~2B | 256k+ segun colecciones de terceros | safetensors, GGUF | Apache 2.0 (habitual en Qwen, no confirmado para esta version) | Modelo oficial con model card, benchmarks y soporte de la serie |
| Qwen2.5 1.5B Instruct | 1,54B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Referencia consolidada en el rango sub-2B, ampliamente evaluada |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | Alternativa con licencia restrictiva para algunos usos comerciales |

Los datos de las filas comparativas corresponden a informacion publica general de cada familia; no se dispone de benchmarks que permitan una comparacion cuantitativa directa con el modelo de esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial esta permitido. Cualquier despliegue en produccion deberia aclarar este punto con el autor o abstenerse.
- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que no se puede afirmar su calidad en razonamiento, codigo o matematicas.
- Documentacion de entrenamiento inexistente: se desconoce el dataset, el numero de tokens, el metodo de ajuste y si hubo alineacion (RLHF/DPO). Esto impide auditar sesgos o comportamientos indeseados.
- Riesgo de alucinacion: propio de modelos de este tamano; al no haber evaluaciones, el riesgo no puede cuantificarse.
- Idiomas no declarados: no se especifica que lenguas domina. El sufijo "twi" del nombre podria indicar un ajuste orientado al idioma twi/akan, pero no hay confirmacion; el rendimiento en castellano es desconocido.
- Contexto no confirmado: aunque la familia Qwen3.5 se asocia a ventanas de 256k tokens, no hay garantia de que este ajuste conserve esa longitud, ni de que el fichero GGUF la soporte en la practica.
- Cuantizacion agresiva: el unico fichero publicado es Q3_K_M, una cuantizacion de 3 bits que degrada la calidad respecto a Q4_K_M, Q5_K_M o Q8_0. No se ofrecen alternativas de mayor precision.
- Ambiguedad en el nombre: el sufijo "4" sugiere 4B pero el recuento real es de 1,89B parametros; conviene verificar la correspondencia con la variante base antes de asumir capacidades.
- Popularidad muy baja: 42 descargas y 0 likes implican poca validacion por parte de la comunidad y ausencia de retroalimentacion sobre fallos.
- Posible multimodalidad no verificada: las instrucciones mencionan `llama-mtmd-cli`, pero no se confirma que el modelo incluya torre de vision; no debe asumirse soporte de imagenes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prince4332/qwen35-twi-va-4-full-GGUF
- Unsloth (libreria usada para el ajuste y la conversion): https://github.com/unslothai/unsloth
- Coleccion oficial Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Repositorio GitHub de la serie Qwen (Qwen3.5 / 3.6 / 3.8): https://github.com/QwenLM/Qwen3.8
- Repositorio GitHub alternativo sobre Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Coleccion de derivados de Qwen3.5 en HuggingFace (DavidAU): https://huggingface.co/collections/DavidAU/qwen-35-08-2-4-9-27-35b-regular-uncensored
- Ficha de Qwen3.5 en local-ai-zone: https://local-ai-zone.github.io/models/qwen35.html
