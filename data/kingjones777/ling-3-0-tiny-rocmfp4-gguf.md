# kingjones777/Ling-3.0-tiny-ROCmFP4-GGUF

## Resumen

Ling-3.0-tiny-ROCmFP4-GGUF es una cuantizacion en 4 bits del modelo base inclusionAI/Ling-3.0-tiny, publicada por kingjones777. El modelo base es un transformer MoE con atencion hibrida lineal (SSM) y compresion de consultas mediante Q-LoRA, desarrollado por inclusionAI. Esta variante GGUF esta optimizada exclusivamente para el acelerador AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) y utiliza un formato de cuantizacion propietario ROCmFP4 que protege tensores criticos (cabeza LM, embeddings, expertos compartidos, router y estado recurrente) para mantener la fidelidad. Con 7.893.392.800 parametros totales y una ventana de contexto probada de 32.768 tokens, ofrece una velocidad de decodificacion de aproximadamente 100 tokens por segundo en hardware Strix Halo, lo que lo hace relevante para despliegues locales de generacion de texto en equipos AMD de gama alta.

La publicacion destaca por su rigor tecnico: el autor verifica el funcionamiento en dos maquinas independientes, documenta la configuracion de servidor recomendada y advierte de los requisitos de compilacion. Sin embargo, es una cuantizacion especifica para una plataforma muy concreta y no se han publicado evaluaciones de calidad comparativas (perplexity, benchmarks estandar) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailingmoe3 (MoE con atencion hibrida lineal + SSM, Q-LoRA) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | no disponible (se mencionan 128 expertos enrutados y 69 compartidos, pero no el numero de activos por token) |
| Longitud de contexto | 32.768 tokens (probado; no se indica el maximo oficial del modelo base) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102); el modelo base tambien tiene versiones BF16 y Q4_K_M |
| Idiomas soportados | ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `Ling-3.0-tiny-Q4_0_ROCMFP4_COHERENT.gguf`, 4.2987 GiB) |

## Arquitectura y entrenamiento

El modelo base inclusionAI/Ling-3.0-tiny emplea una arquitectura bailingmoe3, que combina un mecanismo de atencion hibrida lineal (SSM) con un conjunto de expertos enrutados. Su configuracion incluye `q_lora_rank: 256`, lo que implica una compresion de las consultas de atencion mediante una proyeccion Q-LoRA (`q_a_proj -> q_a_layernorm -> q_b_proj`). Esta caracteristica es critica: las implementaciones existentes de bailingmoe3 basadas en Ling-3.0-flash (que no tiene Q-LoRA) fallan al cargar este modelo.

La cuantizacion ROCmFP4 fue generada a partir de una fuente BF16 GGUF (14.72 GiB) de forma lossless, no como requantizacion. El autor aplica una proteccion por tensor especifica: la cabeza LM y los embeddings se mantienen en Q6_K, los 69 expertos compartidos en Q8_0, el router en F32, y el estado recurrente (SSM) en F32 para evitar errores sistematicos. Los expertos enrutados y las proyecciones de atencion se cuantizan a 4 bits. No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens, dataset, metodos de alineacion).

## Capacidades

- Generacion de texto y razonamiento: el modelo responde correctamente a preguntas factuales y aritmeticas simples (17×23, capital de Japon, dias en 2024) y separa el razonamiento en un campo `reasoning_content`.
- Conversacion multi-turno: etiquetado como `conversational` y compatible con `llama-server` usando `--jinja`.
- Inferencia en hardware AMD especifico: disenado para gfx1151 (Strix Halo) con ROCm, alcanzando ~100 tok/s.
- No se menciona soporte de tool calling, agentes ni capacidades multimodales en la informacion proporcionada.
- Idiomas: solo ingles (segun la model card).

## Casos de uso

- Despliegue local de un chatbot en un equipo AMD Strix Halo: con ~100 tok/s y contexto de 32K, puede servir como asistente personal de texto en una maquina de escritorio o estacion de trabajo sin necesidad de GPU discreta.
- Generacion de texto en entornos con restriccion de hardware: al ser un modelo de 7.89B parametros cuantizado a 4 bits (4.3 GiB), cabe en la memoria unificada de un Ryzen AI MAX+ 395, lo que permite ejecutar aplicaciones de redaccion o resumen sin conexion.
- Prototipado de aplicaciones de razonamiento simple: el campo `reasoning_content` permite separar la cadena de pensamiento de la respuesta final, util para depurar o para sistemas que necesiten mostrar el razonamiento.
- Investigacion sobre cuantizacion ROCmFP4: el archivo y su documentacion sirven como referencia para evaluar el impacto de proteger tensores especificos en modelos MoE hibridos.
- Pruebas de compatibilidad de llama.cpp con bailingmoe3: los desarrolladores que trabajen en el PR #26608 pueden usar este modelo como caso de prueba para validar la implementacion de Q-LoRA.
- Servicio de inferencia en un servidor domestico: la configuracion systemd documentada (con `-ngl 999`, `-c 32768`, `--no-mmap`) permite mantener el modelo siempre activo para consultas esporadicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye pruebas de correccion factual y aritmetica basica, asi como mediciones de velocidad de decodificacion:

| Prueba | Resultado |
|---|---|
| 17 × 23 | 391 |
| Capital de Japon | Tokyo |
| Dias en 2024 | 366 |
| Velocidad de decodificacion (maquina A, ROCm 7.2.4) | 97.64 tok/s |
| Velocidad de decodificacion (maquina B, ROCm 7.13.0) | 101.08 tok/s |

El autor indica explicitamente que no se realizo una evaluacion de perplexity ni una comparacion de calidad frente a Q4_K_M o BF16.

## Requisitos de hardware

- GPU/APU: AMD Ryzen AI MAX+ 395 (gfx1151, Strix Halo) con memoria unificada (probado con 125-128 GB, aunque el modelo solo ocupa 4.3 GiB y el contexto 32K requerira memoria adicional).
- ROCm: version 7.2.4 o superior (probado con 7.2.4 y 7.13.0; los binarios compilados contra 7.2.4 funcionan en 7.13.0).
- llama.cpp: obligatorio un build parcheado con soporte `bailingmoe3` y la ruta Q-LoRA (referencia: rama `bailingmoe3-support` del PR #26608). Ademas, debe incluir los tipos de cuantizacion `Q4_0_ROCMFP4_*` que no estan en upstream.
- Variables de entorno recomendadas: `HSA_OVERRIDE_GFX_VERSION=11.5.1`, `GGML_HIP_ENABLE_UNIFIED_MEMORY=1`, `LimitMEMLOCK=infinity`.
- Opciones de despliegue: `llama-server` con flags como `-ngl 999 -fa on -c 32768 -fit off --no-mmap --jinja`. No se mencionan alternativas como vLLM u Ollama.
- Latencia: aproximadamente 100 tok/s en la configuracion probada; no se proporcionan datos de latencia por token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de tamano similar (por ejemplo, Qwen2.5-7B, Llama-3.1-8B) en la informacion proporcionada. La unica comparacion disponible es interna:

| Build | Tamano |
|---|---|
| BF16 | 14.72 GiB |
| Q4_K_M | 4.4926 GiB |
| ROCmFP4 COHERENT | 4.2987 GiB |

El modelo base inclusionAI/Ling-3.0-tiny es el unico punto de referencia, pero no se ofrecen resultados de calidad. Por tanto, la comparativa con alternativas externas se considera no disponible.

## Limitaciones y advertencias

- Requiere un build de llama.cpp modificado: sin el parche de `bailingmoe3` y la ruta Q-LoRA, el modelo no carga (falla con `missing tensor 'blk.0.ssm_f.weight'`). El stock de llama.cpp no es compatible.
- Plataforma restringida: solo funciona en AMD gfx1151 (Strix Halo) con ROCm; no es portable a GPUs NVIDIA ni a CPUs convencionales.
- Idioma: solo ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Sin evaluacion de calidad: no hay pruebas de perplexity ni comparativas frente a otras cuantizaciones, por lo que la degradacion de rendimiento respecto al modelo BF16 es desconocida.
- Riesgo de alucinacion: al ser un modelo pequeno (7.89B) y sin alineacion documentada, puede producir respuestas inventadas, especialmente en tareas complejas.
- Vocabulario amplio (157.184 tokens) y proteccion parcial: aunque la cabeza LM se mantiene en Q6_K, el resto de la red esta en 4 bits, lo que puede afectar a la coherencia en generaciones largas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte para despliegues en produccion.

## Enlaces

- Repositorio HuggingFace: [kingjones777/Ling-3.0-tiny-ROCmFP4-GGUF](https://huggingface.co/kingjones777/Ling-3.0-tiny-ROCmFP4-GGUF)
- Modelo base: [inclusionAI/Ling-3.0-tiny](https://huggingface.co/inclusionAI/Ling-3.0-tiny)
- PR de llama.cpp para soporte bailingmoe3: [PR #26608](https://github.com/ggml-org/llama.cpp/pull/26608)
