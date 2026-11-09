# harness-hub/LFM3-1.7B-hermes-GGUF

## Resumen

LFM3-1.7B-hermes-GGUF es la distribucion en formato GGUF del adaptador LoRA `harness-hub/LFM3-1.7B-hermes`, desarrollado por harness-hub sobre el modelo base LiquidAI/LFM3-1.7B. No se trata de un modelo completo, sino de un adaptador de bajo rango (LoRA) entrenado mediante aprendizaje por refuerzo dentro de Hermes Agent (NousResearch) y convertido a GGUF en precision F16 para su uso con llama.cpp. El objetivo es dotar a un modelo pequeno de 1.700 millones de parametros de capacidades de agente: uso de herramientas, razonamiento multi-paso y ejecucion de tareas sobre ficheros y entornos.

La relevancia del artefacto esta en su propuesta de eficiencia: segun la model card, el adaptador resuelve 16,0 puntos porcentuales mas de tareas que el modelo base y, en las tareas que ambos resuelven, requiere un 38 % menos de llamadas a herramientas. Es decir, mejora la tasa de exito y reduce el coste por tarea, algo critico en despliegues de agentes donde cada llamada a herramienta consume latencia y presupuesto.

El modelo base LFM3-1.7B pertenece a la familia LFM3 de LiquidAI y se distribuye bajo licencia LFM Open License v1.0 (lfm1.0), por lo que las restricciones de uso comercial heredadas del modelo base aplican tambien a este adaptador. El repositorio ocupa aproximadamente 0,1 GB, coherente con un unico fichero LoRA en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base LiquidAI/LFM3-1.7B; inferencia via llama.cpp |
| Parametros totales | 32.937.472 (adaptador LoRA en safetensors); modelo base de 1.700 millones de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (recomendado por la model card; Hermes exige un minimo de 64.000) |
| Tipos de cuantizacion | Adaptador en F16; el modelo base admite las cuantizaciones GGUF disponibles en LiquidAI/LFM3-1.7B-GGUF (Q8_0 recomendado) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF (`LFM3-1.7B-harbor-hermes-lora-F16.gguf`); safetensors para el adaptador original |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado sobre los pesos BF16 de LiquidAI/LFM3-1.7B. El entrenamiento se realizo con aprendizaje por refuerzo dentro de Hermes Agent, el entorno de agentes de NousResearch, lo que orienta el adaptador hacia tareas de ejecucion con herramientas mas que hacia generacion de texto generica. La model card no detalla el volumen de datos, la composicion del dataset ni los hiperparametros del RL; esa informacion se remite a la ficha del adaptador original.

La conversion a GGUF se realizo con `convert_lora_to_gguf.py` de llama.cpp en `--outtype f16`, tomando la configuracion del modelo base como referencia. El resultado es un adaptador que debe cargarse junto con un GGUF del modelo base mediante la opcion `--lora` de `llama serve`. La model card advierte que el adaptador se entreno sobre BF16 y que cuanto mas se acerque la base a esa precision, mas fiel sera el comportamiento entrenado; por eso recomienda Q8_0 como cuantizacion por defecto.

## Capacidades

- Ejecucion de tareas de agente: resolucion de problemas multi-paso con llamadas a herramientas, segun el entrenamiento con RL en Hermes Agent.
- Uso de herramientas (tool calling) optimizado: la model card reporta un 38 % menos de llamadas a herramientas en las tareas resueltas por base y adaptador.
- Razonamiento sobre ficheros y datos: el ejemplo de la model card consulta un CSV (`sales.csv`) para responder preguntas analiticas.
- Integracion con Hermes Agent mediante API compatible con OpenAI (`base_url: http://localhost:8080/v1`).
- Contexto largo: soporta ventanas de hasta 65.536 tokens, requisito para el bucle de agente de Hermes.
- Generacion de texto general: heredada del modelo base LFM3-1.7B.
- Capacidades multilingues: no disponible (la model card no las documenta).
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Agente de analisis de datos tabulares: el modelo puede recibir un CSV y responder preguntas agregadas (por ejemplo, que region tuvo mayor crecimiento de ingresos) usando herramientas de lectura y calculo, con la ventaja de requerir menos llamadas a herramientas por tarea.
- Automatizacion de tareas de desarrollo en local: integrado en Hermes Agent sobre llama.cpp, permite ejecutar bucles de agente en una maquina sin GPU de datacenter, leyendo y modificando ficheros del repositorio.
- Asistente de terminal con contexto largo: con 65.536 tokens de ventana puede mantener el historial completo de una sesion de depuracion con multiples comandos y salidas sin truncar.
- Prototipado de agentes en entornos con recursos limitados: al ser un adaptador de 33 millones de parametros sobre una base de 1.700 millones, el coste de almacenamiento y despliegue es minimo, adecuado para pruebas de concepto y CI.
- Evaluacion de estrategias de RL para agentes: sirve como referencia reproducible para comparar el comportamiento base frente al ajustado con RL en tareas de herramientas.
- Despliegue air-gapped: al funcionar con llama.cpp y ficheros GGUF locales, puede operar en entornos sin conexion externa, algo habitual en sectores regulados.

## Benchmarks y rendimiento

La model card solo aporta dos metricas relativas, sin tabla completa de benchmarks:

| Metrica | Resultado |
|---|---|
| Tareas resueltas frente al modelo base | +16,0 puntos porcentuales |
| Llamadas a herramientas en tareas resueltas por ambos | -38 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La propia model card advierte que estas cifras provienen de vLLM en BF16 y que el fichero GGUF no ha sido reevaluado a traves de llama.cpp, por lo que los resultados con una base cuantizada pueden diferir.

## Requisitos de hardware

- VRAM estimada: el adaptador F16 ocupa aproximadamente 0,1 GB; el modelo base de 1.700 millones de parametros requiere del orden de 2 GB en Q8_0 y menos en cuantizaciones inferiores (estimacion a partir del tamano, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para la base en Q8_0; para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, incluidas GPUs de gama media y entrada con suficiente VRAM; tambien puede ejecutarse en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp (`llama serve` con `--lora`), Hermes Agent como cliente; no se documenta soporte para vLLM u otros motores con este fichero GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-hermes (este) | 1,7 B base + LoRA 33 M | 65.536 | Agente con RL, tool calling | lfm1.0 | GGUF (LoRA F16) |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | Modelo generalista | lfm1.0 | safetensors, GGUF |
| Modelos de agente de 1-3 B de otras familias | no disponible | no disponible | Agente | variable | variable |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No reevaluado en GGUF: las metricas de la model card proceden de vLLM en BF16; el rendimiento con llama.cpp y base cuantizada puede degradarse.
- Dependencia de la cuantizacion de la base: el autor recomienda Q8_0 por proximidad a BF16; cuantizaciones mas agresivas pueden alejar el comportamiento del entrenado.
- Licencia restrictiva: lfm1.0 (LFM Open License v1.0) impone condiciones al uso comercial; es necesario revisar el texto completo antes de desplegar en produccion.
- Idiomas no documentados: no hay informacion sobre cobertura multilingue; el comportamiento fuera del ingles no esta garantizado.
- Riesgo de alucinacion: inherente a un modelo de 1,7 B; en tareas de agente puede traducirse en llamadas a herramientas incorrectas o argumentos invalidos.
- Requisito de contexto: Hermes Agent exige al menos 64.000 tokens, lo que obliga a configurar `-c 65536` y consume memoria adicional en KV cache.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de RL, no publicados.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta, creado el 2026-11-09; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/harness-hub/LFM3-1.7B-hermes-GGUF
- Adaptador original: https://huggingface.co/harness-hub/LFM3-1.7B-hermes
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
- llama.cpp: https://github.com/ggml-org/llama.cpp
