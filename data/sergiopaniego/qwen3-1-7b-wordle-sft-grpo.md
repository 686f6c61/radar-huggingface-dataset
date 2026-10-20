# sergiopaniego/Qwen3-1.7B-Wordle-SFT-GRPO

## Resumen

Qwen3-1.7B-Wordle-SFT-GRPO es un ajuste fino de sergiopaniego sobre su propio checkpoint Qwen3-1.7B-Wordle-SFT, que a su vez deriva del modelo denso Qwen3-1.7B de Alibaba Qwen. El modelo resuelve una tarea muy concreta: jugar a Wordle, un juego de adivinanza de palabras con restricciones de retroalimentación, entrenado con aprendizaje por refuerzo (GRPO) sobre una base ya instruida con supervisión (SFT).

La relevancia no está en sus capacidades generales de lenguaje, sino en que sirve como ejemplo reproducible de un pipeline completo de RL con recompensas verificables sobre un modelo pequeno (1.720 millones de parámetros). El autor documenta el entrenamiento con TRL, lo ejecuta en HF Jobs y publica las curvas en un panel de Trackio, lo que convierte al modelo en una referencia práctica para quien quiera replicar GRPO en tareas de razonamiento con verificación automática.

Arquitectura transformer densa heredada de la familia Qwen3, con 1.720.574.976 parámetros y pesos en safetensors. La ventana de contexto que se le atribuye en fichas de terceros es de 32.768 tokens, aunque la model card del autor no la especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con modo de razonamiento heredado del modelo base |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (dato de ficha de terceros; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en safetensors de precision completa (BF16, inferido del tamano del repo, 6,9 GB). No se publican GGUF |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingue; la model card no detalla idiomas) |
| Licencia | no disponible (la model card incluye un campo placeholder "licence: license" sin texto legal) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-1.7B-Wordle-SFT, que actua como politica inicial. Sobre esa base se aplica GRPO (Group Relative Policy Optimization), el algoritmo presentado en DeepSeekMath, implementado en TRL 1.15.0 junto con Transformers 5.20.2, PyTorch 2.11.0 y Datasets 5.1.0. GRPO estima la ventaja de cada respuesta comparandola contra un grupo de muestras de la misma politica, lo que evita mantener una red de critico separada y reduce el coste de memoria frente a PPO.

La innovacion tecnica del pipeline no esta en el algoritmo sino en la infraestructura: entrenamiento lanzado en HF Jobs, registro de experimentos con Trackio y publicación de las curvas de recompensa en un Space publico. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa exacta ni si hubo fases adicionales de DPO o RLHF. La nomenclatura del proyecto de Trackio ("wordle-grpo-thinking") sugiere que el entrenamiento se hizo con el modo de razonamiento extendido activado.

## Capacidades

- Generacion de texto conversacional en formato de chat (pipeline `text-generation` con mensajes con rol), tal como muestra el ejemplo de la model card.
- Juego de Wordle: propuesta de palabras candidatas y uso de la retroalimentacion parcial (letras correctas, mal colocadas y ausentes) a lo largo de varios turnos.
- Razonamiento de tipo "thinking" heredado de Qwen3, presumiblemente reforzado por el entrenamiento con GRPO segun la nomenclatura del proyecto de seguimiento.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno gracias a la ventana de contexto del modelo base.
- Soporte de `text-generation-inference` y compatibilidad con endpoints, segun los tags del repositorio.
- No hay evidencia en la informacion disponible de soporte de tool calling, vision, audio ni agentes multi-paso; esas capacidades del Qwen3 base pueden haberse degradado con el ajuste especializado.

## Casos de uso

- Agente resolutor de Wordle: el modelo se usa como politica que propone la siguiente palabra a partir del historial de intentos y del feedback de colores del juego, una tarea de razonamiento con estado y recompensa verificable.
- Reproduccion de un pipeline de GRPO: sirve como plantilla completa (TRL + HF Jobs + Trackio) para equipos que quieran aplicar RL con recompensas verificables a un dominio propio sin infraestructura grande.
- Baseline de investigacion en RL de modelos pequenos: con 1.720 millones de parametros se puede entrenar y evaluar en una sola GPU consumer, lo que facilita experimentos de ablation sobre funciones de recompensa y numero de muestras por grupo.
- Generacion de datos sinteticos de partidas: el modelo puede producir trayectorias de juego etiquetadas (estado, accion, resultado) utiles para entrenar otros agentes o para construir datasets de razonamiento paso a paso.
- Evaluacion de tecnicas de decodificacion y prompting: al tener una tarea con metrica objetiva (numero de intentos hasta acertar), permite comparar configuraciones de muestreo y de longitud de razonamiento de forma medible.
- Demostracion educativa de RL aplicado a LLM: el panel publico de Trackio y la model card hacen del modelo un caso didactico para explicar como se optimiza una politica con recompensas basadas en reglas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor publica curvas de entrenamiento en Trackio (proyecto `wordle-grpo-thinking`, run `sft-grpo`), pero no se han incluido en esta ficha valores numericos de MMLU, HumanEval, GSM8K ni de tasa de exito en Wordle.

## Requisitos de hardware

- Inferencia en BF16: aproximadamente 3,5 GB de pesos, mas cache KV; con 32.768 tokens de contexto y lote pequeno se puede operar con 6-8 GB de VRAM.
- Cuantizacion a 8 bits: alrededor de 1,8-2 GB de pesos, desplegable en GPUs de 4-6 GB.
- Cuantizacion a 4 bits (si se convierte a GGUF o AWQ, no publicada por el autor): aproximadamente 1,1-1,3 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio con lotes grandes y contexto completo; RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti para inferencia en BF16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4090 y, con cuantizacion, en equipos de 8 GB.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado), TGI (el repositorio lleva el tag `text-generation-inference`), vLLM, y llama.cpp u Ollama solo si se genera previamente una conversion a GGUF, que el autor no publica.
- Latencia y throughput: no disponibles como medicion publicada. Como referencia de orden de magnitud para un modelo denso de 1,7 B en una RTX 4090 en BF16, cabria esperar decenas de tokens por segundo por peticion, pero es una estimacion, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT-GRPO | 1.720.574.976 | 32.768 (segun terceros) | sin benchmarks publicados | no disponible | HuggingFace, TGI, endpoints |
| Qwen3-1.7B (modelo base de la familia) | 1,7 B aprox. | no disponible en la informacion proporcionada | sin datos en esta ficha | no disponible en la informacion proporcionada | HuggingFace |
| sergiopaniego/Qwen3-1.7B-Wordle-SFT | no disponible | no disponible | sin benchmarks publicados | no disponible | HuggingFace |
| sergiopaniego/wordle-grpo-Qwen3-1.7B (variante previa del mismo autor) | 1,7 B aprox. | no disponible | sin benchmarks publicados | no disponible | HuggingFace, Featherless, Friendli |

La comparacion con alternativas generalistas de proposito general (Qwen2.5-1.5B-Instruct, SmolLM2-1.7B-Instruct, Llama-3.2-1B-Instruct) no se puede cerrar con datos verificados en la informacion proporcionada; ademas, el ajuste esta especializado en Wordle, por lo que una comparacion directa de calidad conversacional no seria representativa.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste con GRPO sobre Wordle puede degradar capacidades generales del Qwen3-1.7B original (charla abierta, codigo, matematicas, multilingueismo) por sobreoptimizacion en la tarea de recompensa.
- Riesgo de alucinacion alto en dominios fuera de Wordle: el modelo no ha sido alineado para veracidad factica y su tamano (1,7 B) limita la fiabilidad en conocimiento enciclopedico.
- Ambiguedad de licencia: la model card contiene un placeholder ("licence: license") y la metadata de HuggingFace no declara licencia, por lo que el uso comercial no esta explicitamente autorizado por el autor, aunque el modelo base Qwen3 se distribuye bajo Apache-2.0. Conviene verificar antes de un despliegue en produccion.
- Idiomas no declarados: no hay confirmacion de soporte multilingue tras el ajuste; el vocabulario y el dataset de Wordle son presumiblemente en ingles.
- Sin benchmarks ni evaluacion cuantitativa publicada: no se puede afirmar su tasa de exito en Wordle ni compararla con otros agentes.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en entornos con poca VRAM requiere conversion manual.
- Trazas de razonamiento largo: si el modo "thinking" esta activo, el consumo de tokens de salida y la latencia por jugada pueden ser elevados para un modelo de este tamano.
- Fecha de creacion futura en la metadata (2026-10-19): inconsistencia que sugiere que el repositorio es experimental y puede cambiar o desaparecer.
- Cero descargas y cero "likes" en el momento de la consulta: no hay validacion de la comunidad ni informes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sergiopaniego/Qwen3-1.7B-Wordle-SFT-GRPO
- Modelo base (SFT): https://huggingface.co/sergiopaniego/Qwen3-1.7B-Wordle-SFT
- Variante previa del autor: https://huggingface.co/sergiopaniego/wordle-grpo-Qwen3-1.7B
- Otra variante: https://huggingface.co/sergiopaniego/qwen3-1.7b-wordle-grpo
- Panel de entrenamiento en Trackio: https://sergiopaniego-wordle-grpo-thinking.hf.space?project=wordle-grpo-thinking&runs=sft-grpo&sidebar=collapsed
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Trackio: https://github.com/gradio-app/trackio
- Ficha en Featherless (wordle-grpo-Qwen3-1.7B): https://featherless.ai/models/sergiopaniego/wordle-grpo-Qwen3-1.7B
- Ficha en Featherless (qwen3-1.7b-wordle-grpo): https://featherless.ai/models/sergiopaniego/qwen3-1.7b-wordle-grpo
- Ficha en Friendli: https://friendli.ai/models/sergiopaniego/wordle-grpo-Qwen3-1.7B
