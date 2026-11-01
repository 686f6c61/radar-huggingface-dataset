# kealjones/tiny-gemma4-test

## Resumen

Tiny Gemma 4 es un modelo experimental creado por el usuario kealjones a partir de google/gemma-4-E2B-it, al que ha aplicado una poda agresiva (pruning) y una posterior destilación parcial para "reparar" el modelo recortado. El objetivo declarado del proyecto es medir el consumo de memoria y la velocidad de inferencia en un navegador, usando wllama y llama.cpp (build b11364), con la vista puesta en la ejecución en dispositivos móviles.

El modelo recorta el vocabulario a 80.000 tokens, reduce la dimensión oculta a 1024, la FFN al 42 % y elimina capas hasta quedarse en 31 de las 35 originales, lo que da un cuerpo de aproximadamente 0,6B de parámetros (1,31B en total según safetensors). El propio autor advierte que la destilación apenas ha sanado el modelo: "tiende a divagar y repetirse" (barely healed).

Por tanto, no es un modelo pensado para producción ni para calidad de generación, sino un banco de pruebas de ingeniería: un caso de estudio sobre cuánto se puede recortar un modelo pequeño y cuánta memoria y velocidad se obtienen en entornos muy limitados como una pestaña del navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (familia Gemma 4), podado y destilado |
| Parametros totales | 1.312.263.455 (≈1,31B, dato de safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 3,5 GB; compatible con endpoints) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it (versión instruida) y sufre tres transformaciones. Primera, poda estructural: el vocabulario se reduce a 80.000 tokens, la dimensión oculta se fija en 1024, la razón de expansión de la FFN se reduce al 42 % y se eliminan 4 de las 35 capas, quedando 31 capas y un cuerpo de unos 0,6B de parámetros. Segunda, destilación desde el modelo original sin podar, descrita por el autor como una "curación parcial" (partly healed) que, según sus propias notas, apenas mitiga los artefactos de la poda. Tercera, cuantización a GGUF para inferencia local en navegador.

No se dispone de información sobre el número de tokens de destilación, la composición del dataset, ni sobre el uso de técnicas como RLHF o DPO en el proceso de curación. La innovación destacable no está en el modelo en sí, sino en la metodología de evaluación: medir memoria y latencia con wllama (port de wasm de llama.cpp) en una pestaña de navegador.

## Capacidades

- Generación de texto conversacional (pipeline conversational), con calidad degradada: el autor documenta divagación y repetición.
- Hereda parcialmente las capacidades del modelo base Gemma 4 E2B-it, aunque la poda y la destilación incompleta las degradan de forma significativa.
- Ejecución en navegador vía wllama / llama.cpp, lo que permite inferencia 100 % local sin servidor.
- Carga en endpoints compatibles de HuggingFace (endpoints_compatible).
- No consta soporte de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Benchmarking de memoria en navegador: medir cuánta RAM consume un modelo estilo Gemma recortado al cargarlo con wllama en una pestaña, que es el propósito explícito del proyecto.
- Medición de velocidad de inferencia en WebAssembly: comparar tokens/segundo de llama.cpp (build b11364) en wasm frente a ejecución nativa.
- Prototipado de despliegue móvil: validar el pipeline de carga y ejecución de un modelo GGUF en dispositivos con recursos limitados antes de portar modelos más capaces.
- Investigación en poda y destilación: usar el modelo y las notas del experimento como caso de estudio de cuánto degrada una poda agresiva (capas, FFN y vocabulario) y en qué medida la destilación la recupera.
- Pruebas de integración de wllama: verificar pipelines de carga, tokenización con vocabulario recortado a 80K y decodificación en entornos de navegador.
- Demostraciones educativas locales: mostrar inferencia de LLM sin conexión en talleres o aulas, aceptando la baja calidad de generación a cambio de huella mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las notas del experimento (enlace en la sección de enlaces) recogen mediciones de memoria y velocidad, pero no se incluyen cifras concretas en la model card ni en los metadatos.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 3,5 GB en GGUF; con cuantización agresiva típica de GGUF (Q4/Q8), la huella en memoria debería situarse entre aproximadamente 0,8 y 1,5 GB, aunque el dato exacto no está disponible. Al ejecutarse en navegador vía wasm, la memoria relevante es la RAM del proceso del navegador, no VRAM.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU y navegador. Cualquier portátil moderno debería ejecutarlo.
- Consumer GPU: no es necesario; el objetivo es inferencia en CPU/wasm.
- Opciones de despliegue: llama.cpp (build b11364), wllama (wasm en navegador), endpoints compatibles de HuggingFace. No consta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el proyecto existe precisamente para medirlas, pero no se publican cifras en la ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| kealjones/tiny-gemma4-test | ≈1,31B (cuerpo ≈0,6B) | GGUF | Apache 2.0 | Experimental, poda + destilación, navegador |
| google/gemma-4-E2B-it (base) | no disponible (E2B ≈2B efectivos) | safetensors | Licencia Gemma | Modelo instruido oficial de Google |
| Qwen3-1.7B (referencia de clase) | 1,7B | safetensors/GGUF | Apache 2.0 | Modelo pequeño de propósito general |

Nota: la comparativa con Qwen3-1.7B es orientativa como modelo de tamaño similar; tiny-gemma4-test no está pensado para competir en calidad, sino en huella de memoria en navegador. No hay datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- Calidad de generación muy baja: el propio autor indica que el modelo "rambles and repeats" (divaga y se repite); no es apto para producción.
- Destilación incompleta: la poda estructural (capas, FFN, vocabulario) no ha sido compensada, lo que degrada coherencia y seguimiento de instrucciones.
- Vocabulario recortado a 80K tokens: puede afectar a la tokenización de idiomas con morfología compleja o scripts no cubiertos por el vocabulario reducido.
- Riesgo de alucinación elevado, agravado por el estado experimental del modelo.
- Sesgos: heredados del modelo base Gemma 4 E2B-it y potencialmente amplificados por la destilación parcial; no se han evaluado.
- Idiomas soportados no documentados.
- Longitud de contexto no especificada; no asumas la del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a las condiciones de la licencia Gemma de Google; revisa la compatibilidad antes de uso comercial.
- Proyecto de un autor individual, con 252 descargas y sin comunidad de mantenimiento; no esperes soporte ni actualizaciones garantizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kealjones/tiny-gemma4-test
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Notas del experimento (GitHub): https://github.com/KealJones/tp-parse/tree/main/experiments/tiny-gemma4
