# charles23r/kimi-k3-tiny-random-bf16

## Resumen

`charles23r/kimi-k3-tiny-random-bf16` es un modelo de pruebas de arquitectura, no un modelo utilizable. Se trata de una reproducción a escala de juguete de la arquitectura Kimi-K3 de Moonshot AI, generada con pesos aleatorios a partir del código de referencia oficial del autor original (revisión `c7945ea0e737dcaddd22c68ddb7639b1407c081c`). Su proposito es servir de fixture de verificacion: permite comprobar que una implementacion alternativa (un port a otro framework, un kernel propio, una reimplementacion en otro lenguaje) calcula exactamente lo mismo que el codigo de referencia de Moonshot AI.

El modelo tiene 16.181.692 parametros, de los cuales la practica totalidad corresponden a la matriz de embeddings y a la cabeza de salida (163.840 entradas de vocabulario). Conserva todos los componentes de la arquitectura publicada: capas KDA (linear attention con estado de tamano fijo), capas de atencion de bajo rango sin codificacion posicional y con puerta de salida, residuales de atencion, feed-forward denso, mezcla de expertos, activacion SiTU y un pequeno codificador de vision con su proyector. No incluye tokenizer y genera ruido por diseno.

Es relevante unicamente en el contexto de desarrollo e investigacion de infraestructura: quien quiera portar Kimi-K3 a vLLM, SGLang, llama.cpp o escribir sus propios kernels puede validar su implementacion contra este modelo sin necesidad de descargar ni ejecutar el modelo completo de 93 capas. No tiene ninguna aplicacion en produccion ni en generacion de texto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas KDA (linear attention con estado fijo) y capas de atencion de bajo rango, mas mezcla de expertos (MoE) y codificador de vision |
| Parametros totales | 16.181.692 |
| Parametros activos | no disponible (el modelo es MoE con 8 expertos y 2 activos por token, pero no se publica el desglose de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 y f32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (sin tokenizer; las salidas de referencia se expresan en ids de token) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16, con f32 en `A_log`, `dt_bias`, pesos de las convoluciones cortas, `o_norm.weight` y `e_score_correction_bias`; expertos almacenados en denso, no empaquetados en MXFP4) |

## Arquitectura y entrenamiento

La arquitectura reproduce la de Kimi-K3 a escala reducida. Consta de 6 capas de anchura 48 (frente a 93 capas de anchura 7168 en el modelo publicado). Las capas 0, 1, 2 y 4 son KDA, es decir, linear attention con un estado de tamano fijo, con 5 cabezas de dimension 8 (frente a 69 capas con 96 cabezas de 128). Las capas 3 y 5 son de atencion de bajo rango, sin codificacion posicional y con puerta de salida, con 4 cabezas (frente a 24 capas con 96 cabezas). Los residuales de atencion se agrupan en bloques de 2 capas (frente a bloques de 12). La capa 0 es la unica con feed-forward denso. La MoE tiene 8 expertos con 2 activos por token, 2 compartidos y una latencia de 32 dimensiones con su normalizacion (frente a 896 expertos, 16 activos, 2 compartidos y latencia de 3584). La activacion es SiTU con cotas 2 y 3, distintas de las 4 y 25 del modelo publicado porque a esta anchura ninguna activacion alcanza esos valores y una cota que nunca se activa no verifica nada. El codificador de vision tiene 2 capas de anchura 16 y su proyector (frente a 27 capas de anchura 1024).

No hubo entrenamiento: los pesos son aleatorios, sembrados de forma determinista por `make_fixture.py`. El script siembra cada parametro de forma explicita porque el codigo de referencia deja varios sin inicializar y su escala de 0.02 hace que cada subcapa resulte despreciable frente al residual. Tambien selecciona la ruta de atencion eager de la referencia, que calcula la misma atencion que la ruta con flash-attention sin requerir que esta este instalada. Los nombres de los tensores coinciden con los del modelo publicado. La unica diferencia estructural es que los expertos, que la referencia almacena empaquetados en MXFP4 (`weight_packed`, `weight_scale`), aqui se almacenan en denso (`weight`).

El repositorio incluye artefactos de verificacion: `reference.json` con los ids de prompt y los 16 ids con los que la referencia los continua de forma greedy, y `reference.safetensors` con los logits del primer paso, la salida de cada capa del decodificador, el estado oculto final y los soft tokens proyectados de una imagen de ruido con semilla (`pixels`, `grid_thw`, `soft_tokens`). La referencia se ejecuto en f32 sobre exactamente los valores almacenados. Sus dos rutas KDA, la troceada para un prompt y la recurrente para un paso con cache, coinciden en todos los ids y difieren en unos 2e-3 en los logits, con una separacion minima entre los dos mejores tokens de 0.066, de modo que los ids deben compararse de forma exacta y los logits de forma laxa. `check_fixture.py` silencia un componente cada vez y cuenta los tokens de continuacion que cambian: cada uno de los 44 componentes probados altera al menos 6 de los 16 tokens, de modo que un port que falle en cualquiera de ellos no reproduce los ids.

## Capacidades

- Generacion de texto: no aplicable en la practica; el modelo produce ruido por diseno y no esta pensado para generar lenguaje.
- Verificacion de implementaciones: reproduce paso a paso los calculos de la arquitectura Kimi-K3 (logits, salidas por capa, estado oculto final) para validar ports.
- Cobertura de componentes: ejercita las dos rutas KDA (troceada y recurrente), la atencion de bajo rango con puerta, los residuales de atencion, el feed-forward denso, la MoE con expertos compartidos, la activacion SiTU y el codificador de vision con proyector.
- Soporte de vision: incluye un codificador de vision de 2 capas y su proyector, con soft tokens de referencia para una imagen de ruido con semilla.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (sin tokenizer).
- Modo thinking: no disponible.

## Casos de uso

- Validacion de un port a otro framework: cargar el modelo en la implementacion nueva y comparar los ids de continuacion y los logits contra `reference.json` y `reference.safetensors`; cualquier discrepancia en mas de 2e-3 en logits o en los ids indica un error en el port.
- Desarrollo de kernels KDA: usar las dos rutas (troceada para prompt y recurrente para paso con cache) como caso de prueba de un kernel Triton o CUDA propio, comprobando que ambas coinciden en ids y difieren en logits dentro de la tolerancia documentada.
- Integracion en motores de inferencia: servir como fixture de CI para vLLM, SGLang, TGI o llama.cpp antes de incorporar soporte de Kimi-K3, sin necesidad de disponer del modelo completo.
- Verificacion de la ruta de atencion: comparar la ruta eager con la ruta flash-attention de una implementacion, ya que la referencia selecciona eager y ambas deben producir la misma atencion.
- Pruebas de la MoE y de los expertos compartidos: comprobar el enrutamiento con 8 expertos, 2 activos y 2 compartidos, y la normalizacion de la latencia de 32 dimensiones, contra las salidas por capa de la referencia.
- Pruebas del pipeline multimodal: validar el codificador de vision de 2 capas y el proyector contra los `soft_tokens` de referencia generados a partir de `pixels` y `grid_thw`.
- Pruebas de aislamiento de componentes: ejecutar `check_fixture.py` para confirmar que cada componente (44 en total) altera al menos 6 de los 16 tokens de continuacion, detectando componentes que se han implementado como no-op.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo genera ruido con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido. La unica metrica de verificacion documentada es la tolerancia numerica: las dos rutas KDA difieren en unos 2e-3 en logits y la separacion minima entre los dos mejores tokens es de 0.066.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 (16,2 M de parametros, unos 32 MB en bf16 mas estados de activacion y cache); el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1650 o una RTX 3060; para reconstruir el fixture desde cero se necesita una GPU CUDA porque el operador KDA de la referencia es un kernel Triton.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con CUDA; tambien en CPU para inferencia si el port no depende del kernel Triton.
- Opciones de despliegue: transformers (version de referencia 4.57.6), con `fla-core`, `einops` y `safetensors` para la reconstruccion; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para el proposito del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charles23r/kimi-k3-tiny-random-bf16 | 16,2 M | no disponible | Fixture de verificacion de arquitectura Kimi-K3 | no disponible | Hugging Face, 0 descargas |
| moonshotai/Kimi-K3 | no disponible en la informacion | no disponible | Modelo de produccion de Moonshot AI | no disponible | Hugging Face (referencia) |
| Otros modelos tiny-random de arquitecturas publicadas | variable | no disponible | Fixtures de verificacion equivalentes para otras arquitecturas | variable | Hugging Face |

No se dispone de datos de parametros, contexto ni rendimiento de Kimi-K3 en la informacion proporcionada mas alla de la tabla de componentes de la model card (93 capas, anchura 7168, 896 expertos). No se conocen alternativas equivalentes de fixture para esta arquitectura con datos verificables.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo genera ruido y no produce texto coherente en ningun idioma. No debe usarse para generacion, atencion al cliente, codigo ni ninguna tarea de lenguaje.
- No incluye tokenizer: las entradas y salidas se manejan como ids de token, lo que impide su uso directo con pipelines estandar de `text-generation`.
- La licencia no esta disponible, lo que impide determinar si se permite el uso comercial o la redistribucion. Al derivar del codigo de referencia de Moonshot AI, conviene consultar la licencia del repositorio `moonshotai/Kimi-K3`.
- Las cotas de SiTU (2 y 3) difieren a proposito de las del modelo publicado (4 y 25), por lo que el comportamiento de la activacion no es identico al de produccion a este respecto.
- Los expertos se almacenan en denso en lugar de empaquetados en MXFP4, de modo que el modelo no verifica la ruta de descompresion de pesos MXFP4 de una implementacion.
- La referencia se ejecuto en f32; comparar logits en bf16 requiere aplicar la tolerancia documentada (unos 2e-3) y no una comparacion exacta.
- La separacion minima entre los dos mejores tokens es de 0.066, por lo que pequenos errores numericos pueden cambiar los ids de continuacion y producir falsos negativos en la verificacion.
- No se han publicado resultados de benchmarks ni datos de sesgo, alucinacion o rendimiento multilingue; no son aplicables a un modelo de pesos aleatorios.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (24 de noviembre de 2026), lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charles23r/kimi-k3-tiny-random-bf16
- Modelo de referencia de Moonshot AI: https://huggingface.co/moonshotai/Kimi-K3
- Revision del codigo de referencia citada: `c7945ea0e737dcaddd22c68ddb7639b1407c081c` (repositorio de Moonshot AI)
- Scripts incluidos en el repositorio: `make_fixture.py`, `check_fixture.py`, `reference.json`, `reference.safetensors`
- Dependencias para reconstruccion: `torch`, `transformers==4.57.6`, `fla-core`, `einops`, `safetensors`
