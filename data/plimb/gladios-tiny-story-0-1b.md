# plimb/gladios-tiny.story-0.1B

## Resumen

gladios-tiny.story-0.1B es un modelo de lenguaje decoder-only con arquitectura GPT-2, desarrollado por plimb, entrenado desde cero sobre el dataset completo TinyStories (aproximadamente 2,1 millones de relatos infantiles y unos 470 millones de tokens). Cuenta con unos 124 millones de parametros (0,1B), 12 capas, 12 cabezas de atencion, dimension de embedding de 768 y una longitud de contexto de 512 tokens. Utiliza el tokenizador GPT-2 con un vocabulario de 50.257 tokens y se distribuye en formato safetensors.

El modelo resuelve un problema muy acotado: generar relatos cortos y coherentes en ingles con el estilo de TinyStories, un corpus sintetico disenado para estudiar la adquisicion de capacidades linguisticas basicas en modelos pequenos. No es un modelo de proposito general: no sigue instrucciones, no mantiene conversaciones y no dispone de conocimiento del mundo fuera del dominio de entrenamiento.

Su relevancia es fundamentalmente experimental y educativa. Al ser un entrenamiento from scratch, con codigo de entrenamiento publicado y un peso de apenas 0,5 GB, resulta util como banco de pruebas de bajo coste para estudiar dinamicas de entrenamiento, tokenizacion, decodificacion y despliegue en hardware modesto, asi como para comparar el efecto del escalado de datos y parametros en tareas de lenguaje controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2) |
| Parametros totales | 124.046.592 (aproximadamente 0,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible en la model card; existe version GGUF de terceros (mradermacher), con los niveles habituales de llama.cpp |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB); GGUF disponible en repositorio externo |

Detalles adicionales de arquitectura: 12 capas, 12 cabezas de atencion, dimension de embedding 768, tokenizador GPT-2 (tiktoken, vocabulario de 50.257 tokens), separador de historias `<|endoftext|>`.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder-only clasica de tipo GPT-2, con 12 capas, 12 cabezas de atencion y una dimension oculta de 768, lo que arroja 124.046.592 parametros. Emplea atencion causal estandar y el tokenizador GPT-2; no se documentan innovaciones como atencion lineal, decodificacion especulativa ni capas MoE.

El entrenamiento se realizo desde cero sobre la particion completa `train` del dataset roneneldan/TinyStories, sin submuestreo: aproximadamente 2,1 millones de historias infantiles y cerca de 470 millones de tokens. Cada historia se separa mediante el token especial `<|endoftext|>`. No se menciona en la informacion disponible el uso de RLHF, DPO, ajuste por instrucciones ni tecnicas de alineacion adicionales; el objetivo es modelado de lenguaje autorregresivo puro sobre el corpus.

## Capacidades

- Generacion de texto autorregresiva en ingles, orientada a relatos infantiles cortos y coherentes.
- Continuacion de prompts con estilo narrativo simple ("Once upon a time", personajes infantiles, tramas breves).
- Generacion con muestreo configurable (temperatura, top-k) mediante `transformers`.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingue: no; solo ingles.
- No dispone de modo thinking, vision, audio ni otras modalidades.
- No dispone de capacidad de seguir instrucciones ni de mantener conversaciones multi-turno.

## Casos de uso

- Estudio de adquisicion linguistica en modelos pequenos: sirve para analizar como emerge la coherencia narrativa a escala de 0,1B parametros con un corpus sintetico controlado, comparando curvas de perdida y calidad de muestras.
- Banco de pruebas de tokenizacion: al usar el tokenizador GPT-2 sobre un corpus acotado, permite medir el impacto de la segmentacion en la calidad de generacion y en la longitud efectiva de secuencia.
- Validacion de pipelines de despliegue: su tamano (0,5 GB) permite probar de extremo a extremo `transformers`, text-generation-inference, llama.cpp u Ollama con la version GGUF antes de escalar a modelos mayores.
- Generacion de cuentos sinteticos para aumentacion de datos: puede producir relatos breves en ingles para experimentos de destilacion, filtrado de datos o entrenamiento de clasificadores de texto narrativo.
- Demostraciones educativas de entrenamiento from scratch: con el codigo publicado en GitHub, sirve como ejemplo reproducible de preentrenamiento, guardado de checkpoints y publicacion de pesos en safetensors.
- Pruebas de inferencia en hardware de consumo: al caber holgadamente en GPUs de gama baja, permite medir latencia y throughput de referencia para comparativas de eficiencia entre backends.
- Evaluacion de robustez fuera de dominio: permite documentar empiricamente como un modelo especializado pierde coherencia ante prompts ajenos al estilo TinyStories, como caso de estudio sobre sobreajuste al dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,5 GB para los pesos (124M parametros); en fp16/bf16, aproximadamente 0,25 GB; con cuantizacion GGUF de 8 bits o inferior, del orden de 0,1-0,2 GB, mas el overhead de activaciones y cache KV (contexto de 512 tokens, despreciable).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Es funcional en RTX 4090, RTX 3090, RTX 3060 y GPUs de portatil.
- Cabe en GPU de consumo: si, incluidas GPUs de gama baja y, con cuantizacion, en CPU.
- Opciones de despliegue: `transformers` (pipeline y `AutoModelForCausalLM`), text-generation-inference (el modelo esta etiquetado como compatible con endpoints), llama.cpp, Ollama y LM Studio mediante la version GGUF de mradermacher, y demo Gradio con ZeroGPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gladios-tiny.story-0.1B | 124M | 512 | From scratch sobre TinyStories completo | MIT | Hugging Face, GGUF de terceros, demo Gradio |
| GPT-2 small (OpenAI) | 124M | 1024 | Corpus web general (WebText) | MIT (pesos publicados) | Hugging Face, amplia integracion |
| Modelos TinyStories de referencia (por ejemplo, variantes GPT-Neo de 125M entrenadas sobre TinyStories) | ~125M | variable, habitualmente 256-1024 | TinyStories | variable segun autor | Hugging Face; datos concretos no disponibles en esta ficha |

La comparacion con GPT-2 small es la mas directa por tamano (124M parametros) y arquitectura, pero difiere radicalmente en datos: GPT-2 se entreno sobre texto web general, mientras que este modelo se limita a relatos infantiles. Frente a otras variantes TinyStories de ~125M, la diferencia principal es la cobertura completa del split `train` sin submuestreo y la publicacion del codigo de entrenamiento. No se dispone de datos de rendimiento comparativo publicados para este modelo.

## Limitaciones y advertencias

- Solo escribe relatos infantiles cortos y en ingles; no tiene conocimiento general del mundo.
- No sigue instrucciones ni mantiene conversaciones; los prompts deben adoptar el formato narrativo del corpus.
- Riesgo alto de alucinacion y perdida de coherencia ante prompts fuera del estilo TinyStories.
- Contexto limitado a 512 tokens, insuficiente para documentos largos o dialogos extensos.
- Sesgos: no documentados en la model card; al entrenarse sobre un corpus sintetico de relatos infantiles, los sesgos esperables estan acotados al dominio, aunque no se han realizado evaluaciones formales.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con aviso de copyright; conviene revisar las condiciones del dataset TinyStories por separado.
- No apto para produccion en tareas de atencion al cliente, asistencia general, codigo o matematicas.
- La version GGUF es mantenida por un tercero (mradermacher); su calidad y fidelidad de cuantizacion no estan garantizadas por el autor original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plimb/gladios-tiny.story-0.1B
- Version GGUF: https://huggingface.co/mradermacher/gladios-tiny.story-0.1B-GGUF
- Demo Gradio (ZeroGPU): https://huggingface.co/spaces/rusher-code/gladios-tiny-story-demo/
- Codigo de entrenamiento (GitHub): https://github.com/plimb-ai/gladios-tiny-story
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Documentacion de safetensors: https://huggingface.co/docs/safetensors/index
