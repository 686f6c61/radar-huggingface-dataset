# IFM/Jais-3-32B-MLX-4bit

## Resumen

Jais-3-32B-MLX-4bit es una cuantizacion mixta de 4 bits, en formato MLX, del modelo denso Jais-3-32B desarrollado por Inception (IFM). Se trata de un modelo decoder-only de 32B parametros (34.779.304.960 parametros reales segun los safetensors) con una ventana de contexto de 512K tokens (524.288), orientado a cargas de trabajo bilingues arabe-ingles y a casos de uso agenticos. Esta version concreta esta pensada para ejecutarse en Apple Silicon mediante la libreria mlx-lm.

El modelo base Jais-3 forma parte de la familia Jais-3, presentada en el paper "Jais 3: Introducing Arabic-centric Agentic AI". Su relevancia actual radica en dos factores: por un lado, ofrece una ventana de contexto muy amplia (512K) en un modelo denso de 32B, algo poco habitual en modelos centrados en arabe; por otro, esta cuantizacion permite ejecutar un modelo de ese tamano en hardware de consumo Apple con un pico de memoria de 25,8 GB, a costa de una perdida de perplejidad moderada (+2,1% en WikiText-2 y +3,1% en arabe respecto a la version de 8 bits).

La cuantizacion utiliza una receta de precision mixta: 4 bits con grupo de 32 para las proyecciones MLP y 8 bits con grupo de 64 para atencion, embeddings y `lm_head`, resultando en 5,9 bits por peso efectivos y un repositorio de 25,5 GB. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa, arquitectura `k2_horizon` |
| Parametros totales | 34.779.304.960 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | MLX 4-bit mixta: MLP a 4 bits (grupo 32), atencion/embeddings/lm_head a 8 bits (grupo 64); 5,9 bits/peso efectivos |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con codigo de modelo `k2_horizon.py` incluido en el repo |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 32B parametros con arquitectura denominada `k2_horizon`, con 64 capas segun la verificacion de conversion descrita en la model card. Dispone de una ventana de contexto de 512K tokens. El modelo incorpora un modo de razonamiento explicito delimitado por las etiquetas `<ifm|think> … </ifm|think>`, con niveles de esfuerzo configurables (`high`, `medium`, `low`) a traves del parametro `reasoning_effort` de la plantilla de chat. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion tecnica destacable de esta version es el proceso de cuantizacion y su verificacion. La conversion se comprobo contra el codigo PyTorch original (`modeling_k2_horizon.py`) en fp32 sobre los pesos reales del modelo, truncado a sus 4 primeras capas mas la normalizacion final y el `lm_head`, con prompts en ingles, codigo, arabe y matematicas: los logits coinciden con un error relativo de 2e-6 o mejor, las predicciones de siguiente token coinciden en todas las posiciones y la decodificacion greedy con cache KV produce los mismos tokens (64/64 en cada prompt). Como mlx-lm aun no soporta la arquitectura `k2_horizon`, el repositorio incluye el codigo del modelo (`k2_horizon.py`), que mlx-lm carga mediante la entrada `model_file` de `config.json`; por ello es necesario usar `--trust-remote-code`. Ademas, la plantilla de chat original falla cuando un mensaje previo del asistente carece de campo de pensamiento (formato habitual en clientes estilo OpenAI); la plantilla de este repositorio renderiza un bloque de pensamiento vacio en esos casos.

## Capacidades

- Generacion de texto conversacional bilingue arabe-ingles.
- Razonamiento explicito en modo "thinking" mediante las etiquetas `<ifm|think>`, con tres niveles de esfuerzo configurables (`high` por defecto, `medium`, `low`).
- Razonamiento multi-paso y flujos agenticos, segun la orientacion del modelo base ("Arabic-centric Agentic AI").
- Soporte de tool calling / function calling en el modelo base; en esta version MLX, mlx-lm todavia no parsea el formato de llamadas a herramientas, por lo que la salida no se separa en campos estructurados.
- Contexto largo de hasta 512K tokens para resumir, analizar o razonar sobre documentos extensos.
- Capacidades matematicas y de codigo, ejercitadas en la verificacion de conversion con prompts de codigo y matematicas.
- Capacidades multilingues limitadas a arabe e ingles segun los metadatos del modelo.

## Casos de uso

- Asistencia conversacional en arabe: el modelo puede mantener dialogos multi-turno en arabe estandar con contexto largo gracias a su ventana de 512K tokens, adecuado para atención al cliente en mercados arabohablantes.
- Analisis de documentos extensos: resumen y extraccion de informacion de contratos, informes o expedientes de cientos de miles de tokens en una sola pasada, sin necesidad de fragmentacion.
- Desarrollo asistido por IA en local sobre Apple Silicon: generacion y explicacion de codigo en ingles o arabe ejecutando el modelo con mlx-lm en un Mac con suficiente memoria unificada.
- Prototipado de agentes: el modelo base soporta tool calling y razonamiento multi-paso, lo que permite construir flujos agenticos; en esta version MLX habria que parsear manualmente el formato de llamadas a herramientas.
- Investigacion en PLN arabe: evaluacion de modelos de gran contexto en arabe con un coste de hardware reducido (un solo equipo Apple de gama alta), util para experimentos academicos.
- Razonamiento con esfuerzo ajustable: uso del parametro `reasoning_effort` para equilibrar latencia y profundidad en tareas de matematicas o logica, reduciendo tokens de pensamiento en produccion interactiva.
- Despliegue local con privacidad: al ejecutarse en hardware propio mediante mlx-lm, permite procesar datos sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

Datos publicados en la model card para las variantes MLX de Jais-3-32B. Perplejidad sobre 128 × 512 tokens (WikiText-2 test y primeros articulos del dump de Wikipedia arabe `20231101.ar`; menor es mejor) y velocidad de generacion medida en un Apple M4 Max:

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 5,9 |
| Disco | 69,6 GB | 37,0 GB | 25,5 GB |
| Memoria pico | no disponible | 37,2 GB | 25,8 GB |
| Perplejidad WikiText-2 (ingles) | no disponible | 9,324 | 9,521 (+2,1%) |
| Perplejidad Wikipedia arabe | no disponible | 11,307 | 11,661 (+3,1%) |
| Velocidad de generacion | no disponible | 12,4 tok/s | 18,8 tok/s |

La configuracion bf16 no pudo probarse; los porcentajes son relativos a 8 bits, que esta dentro del 0,2% de bf16 en todos los modelos Jais-3 mas pequenos. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria pico de 25,8 GB para un prompt corto; la cache KV crece con el contexto, por lo que contextos largos requieren mas memoria.
- Diseno especifico para Apple Silicon (formato MLX); no es ejecutable directamente en GPU NVIDIA sin reconvertir.
- Cabe en equipos Apple con memoria unificada de 32 GB o superior; con 24 GB no hay margen suficiente para el pico de 25,8 GB.
- Despliegue mediante mlx-lm (version probada: 0.32.0), con `--trust-remote-code` obligatorio; tambien disponible `mlx_lm.chat` y `mlx_lm.server`.
- Reduccion de memoria mediante `--max-kv-size` y cuantizacion de cache KV (`--kv-bits 8`, donde este disponible).
- Velocidad de generacion medida: 18,8 tok/s en un Apple M4 Max (frente a 12,4 tok/s de la variante de 8 bits).
- No se proporcionan estimaciones de latencia ni throughput para GPU NVIDIA, A100, H100 o RTX 4090 en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria pico | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Jais-3-32B-MLX-4bit (este) | 34,8B | 512K | 4-bit mixta (5,9 bits/peso) | 25,8 GB | Apache-2.0 | Apple Silicon (MLX) |
| Jais-3-32B-MLX-8bit | 34,8B | 512K | 8-bit (8,5 bits/peso) | 37,2 GB | Apache-2.0 | Apple Silicon (MLX) |
| Jais-3-32B-MLX-bf16 | 34,8B | 512K | bf16 (16 bits/peso) | no disponible | Apache-2.0 | Apple Silicon (MLX) |

Las tres variantes comparten arquitectura, contexto y licencia; difieren en tamano en disco, memoria pico, perplejidad y velocidad. No se dispone de datos sobre modelos de otros fabricantes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: +2,1% de perplejidad en WikiText-2 y +3,1% en Wikipedia arabe respecto a 8 bits; la cuantizacion plana de 4 bits se descarto por perdidas de +6,3% y +9,9% respectivamente.
- Requiere `--trust-remote-code`: el repositorio incluye codigo Python (`k2_horizon.py`) que se ejecuta en la maquina del usuario; conviene revisarlo antes de usarlo.
- mlx-lm no reconoce aun las etiquetas `<ifm|think>`, por lo que `mlx_lm.server` devuelve el texto de razonamiento dentro de `content` en lugar de un campo `reasoning` separado.
- El formato de tool calling no se parsea en esta version MLX; las llamadas a herramientas no se estructuran automaticamente.
- La plantilla de chat se modifico respecto a la original para no fallar con mensajes del asistente sin campo de pensamiento; hay que tenerlo en cuenta al comparar salidas con el modelo base.
- El modo de razonamiento consume tokens; es necesario reservar espacio en `max_tokens` para el bloque `<ifm|think>` o las respuestas pueden truncarse.
- Idiomas limitados a arabe e ingles; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; deben evaluarse en el caso de uso concreto.
- La cache KV crece con el contexto; el uso de la ventana completa de 512K exige mucha mas memoria que el pico de 25,8 GB indicado para prompts cortos.
- Licencia Apache-2.0 permite uso comercial, pero se remite a la model card del modelo base para condiciones y usos previstos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IFM/Jais-3-32B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/Jais-3-32B
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-32B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-32B-MLX-bf16
- Paper (referencia arXiv en metadatos): arxiv:2611.10224
- Codigo del modelo incluido en el repo: `k2_horizon.py` (dentro del repositorio de Hugging Face)
