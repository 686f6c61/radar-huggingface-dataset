# Jundot/DeepSeek-V4-Flash-0731-oQ2.7e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ2.7e-mtp es un checkpoint cuantizado en formato MLX del modelo DeepSeek-V4-Flash-0731, publicado por el usuario Jundot. Se trata de una version de precision mixta generada con la herramienta oQ (oMLX v0.7.1) que reduce un modelo de 304.180.418.494 parametros a un peso efectivo de 3,255 bits por parametro, con un tamano de repositorio de 123,8 GB. El objetivo es permitir la ejecucion local de un modelo de escala frontera en hardware con memoria unificada, algo imposible con los pesos originales en BF16.

El modelo base es un MoE disperso de DeepSeek con aproximadamente 13.000 millones de parametros activos y una ventana de contexto de 1.048.576 tokens. La variante cuantizada conserva la misma estructura que DeepSeek-V4-Flash-DSpark e incluye tanto el backbone de lenguaje como los pesos del modulo MTP (multi-token prediction), que habilita decodificacion especulativa. El backbone de lenguaje concentra 284.335B de parametros y la cabeza MTP anade 19.846B.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: cuantizacion agresiva por sensibilidad de capa, un contexto de un millon de tokens y un modulo de prediccion multi-token integrado. La licencia MIT y el formato MLX lo orientan a despliegue en Apple Silicon, si bien el volumen de pesos exige equipos de gama muy alta o configuraciones multi-GPU. El modelo fue publicado el 11 de octubre de 2026 y, en el momento de la consulta, acumulaba 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse mixture-of-experts) sobre transformer, con modulo MTP/DSpark de decodificacion especulativa acoplado |
| Parametros totales | 304.180.418.494 (~304,18B); backbone de lenguaje 284.335B + cabeza MTP 19.846B |
| Parametros activos | ~13B (segun la ficha del modelo base en OpenRouter) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | oQ2.7e de precision mixta (afin 2-bit grupo 64, afin 3-bit grupo 64, MXFP4 grupo 32, MXFP8 grupo 32, afin 8-bit grupo 64, BF16, FP32, I32); media efectiva 3,255 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint MLX) |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE disperso de DeepSeek, con unos 13.000 millones de parametros activos sobre un total declarado de 284.335B en el backbone de lenguaje. La variante cuantizada conserva la estructura de DeepSeek-V4-Flash-DSpark y anade los pesos de un modulo de prediccion multi-token (MTP) de 19.846B, que funciona como cabeza de decodificacion especulativa y permite proponer varios tokens por paso. No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens procesados ni las etapas de alineacion (RLHF, DPO u otras) del modelo original, por lo que esos datos se consideran no disponibles.

La innovacion tecnica de este checkpoint concreto es el esquema de cuantizacion oQ2.7e. oQ asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y aplica un reajuste por minimos cuadrados ponderados de la escala y el sesgo. La distribucion resultante reparte el 48,713% de los pesos en afin 3-bit grupo 64, el 42,359% en afin 2-bit grupo 64 y el resto en formatos de mayor precision (MXFP4, MXFP8, afin 8-bit, BF16, FP32 e I32) para las capas mas sensibles.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base DeepSeek-V4-Flash-0731.
- Contexto de 1.048.576 tokens, adecuado para tareas de contexto muy largo (documentos extensos, repositorios completos, historiales largos).
- Capacidades agenticas mejoradas segun la descripcion del modelo base ("enhanced agentic capabilities").
- Decodificacion especulativa mediante el modulo MTP/DSpark incluido en el checkpoint, orientada a acelerar la generacion.
- Se desconoce el soporte explicito de tool calling, function calling, vision o audio en la informacion disponible.
- Cobertura multilingue: no disponible.
- El checkpoint no es un modelo entrenado de nuevo, sino una recomposicion de precision: conserva las capacidades del original en la medida en que la cuantizacion las preserve.

## Casos de uso

- Analisis de repositorios completos: con 1.048.576 tokens de contexto, el modelo puede ingerir bases de codigo enteras y responder preguntas de arquitectura o dependencias cruzadas sin trocear el contenido.
- Procesamiento de documentacion legal o cientifica extensa: contratos, expedientes o articulos de cientos de miles de tokens en una sola pasada, utiles en despachos y equipos de investigacion.
- Asistentes de investigacion con memoria larga: conversaciones multi-turno que retienen el hilo durante sesiones prolongadas gracias a la ventana ampliada.
- Generacion de codigo asistida en local: ejecucion en estaciones de trabajo Apple Silicon con memoria unificada alta, evitando enviar codigo propietario a APIs externas.
- Despliegue on-premise con requisitos de privacidad: al liberarse bajo licencia MIT y en formato local, permite operar sin conexion en entornos regulados.
- Experimentacion en investigacion sobre cuantizacion: sirve como referencia para medir la degradacion de un MoE de gran escala a 3,255 bits/peso efectivos frente al modelo original.
- Decodificacion especulativa acelerada: el modulo MTP integrado permite estudiar y aprovechar tecnicas de prediccion multi-token en pipelines de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web menciona que OpenRouter incluye benchmarks independientes de Artificial Analysis para el modelo base, pero no se aportan cifras concretas en los materiales facilitados, por lo que no se reproducen datos numericos.

## Requisitos de hardware

- El repositorio ocupa 123,8 GB y los pesos suman 115,252 GiB, por lo que se necesita memoria disponible superior a esa cifra (mas overhead de runtime).
- En Apple Silicon, se requiere un equipo con memoria unificada de 128 GB o mas para alojar el checkpoint completo con margen.
- En GPUs discretas, un unico acelerador de 80 GB (A100, H100) no basta para los 115 GiB de pesos; seria necesario repartir el modelo entre varias GPUs o usar memoria unificada de gran capacidad.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones de gama media.
- El formato es MLX, por lo que el despliegue natural es el ecosistema MLX de Apple; no se declaran variantes GGUF, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/DeepSeek-V4-Flash-0731-oQ2.7e-mtp | 304,18B totales / ~13B activos | 1.048.576 tokens | oQ2.7e, 3,255 bits/peso efectivos | MIT | HuggingFace (MLX) |
| Jundot/DeepSeek-V4-Flash-0731-oQ2e-mtp | no disponible en la informacion | 1.048.576 tokens (modelo base) | oQ2e | MIT | HuggingFace (MLX) |
| Jundot/DeepSeek-V4-Flash-0731-oQ2e | no disponible en la informacion | 1.048.576 tokens (modelo base) | oQ2e | MIT | HuggingFace (MLX) |
| deepseek-ai/DeepSeek-V4-Flash-0731 | 304,18B totales (backbone 284B) / ~13B activos | 1.048.576 tokens | BF16 (original) | MIT | HuggingFace, ModelScope, OpenRouter |

No se dispone de resultados de rendimiento comparativos entre estas variantes en la informacion facilitada.

## Limitaciones y advertencias

- La cuantizacion a 3,255 bits/peso efectivos introduce perdida de precision; no se aportan mediciones de degradacion frente al modelo original, por lo que conviene validar en la tarea concreta antes de usarlo en produccion.
- El uso de formatos mixtos con bloques en 2-bit puede afectar de forma desigual a distintas capacidades (razonamiento, codigo, matematicas); se desconoce el impacto por area.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan salvaguardas especificas en la model card.
- Sesgos conocidos: no disponible.
- Cobertura de idiomas: no disponible, lo que impide garantizar un comportamiento homogeneo en castellano u otras lenguas.
- Restricciones de licencia: MIT, lo que permite uso comercial, pero al ser un derivado cuantizado conviene verificar las condiciones del modelo base de DeepSeek antes de explotarlo comercialmente.
- El checkpoint depende del ecosistema MLX, lo que limita el despliegue fuera de Apple Silicon o de entornos que no soporten este formato.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion de la comunidad y de reportes de uso reales.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ2.7e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Variante relacionada oQ2e-mtp: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ2e-mtp
- Variante relacionada oQ2e: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ2e
- Herramienta de cuantizacion oQ/oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Ficha del modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Precios y benchmarks en OpenRouter: https://openrouter.ai/deepseek/deepseek-v4-flash-0731
- Guia de despliegue comunitario: https://github.com/Moh4696/deepseek-v4-flash-free
