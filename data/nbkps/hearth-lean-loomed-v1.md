# nbKPS/hearth-lean-loomed-v1

## Resumen

hearth-lean-loomed-v1 es una cuantizacion GGUF de openai/gpt-oss-120b publicada por nbKPS (KPS Labs, Kith Precision Services) en octubre de 2026. Se trata de un empaquetado de 29,6 GiB que conserva el cuerpo completo del modelo original (128 expertos en cada una de las 36 capas) comprimiendo unicamente los expertos enrutados a tipos IQ de 1-2 bits, mientras el resto de tensores se mantiene en Q8_0. El objetivo es claro: hacer que un modelo MoE de 124.473 millones de parametros totales quepa en una unica maquina con 128 GB de memoria unificada, concretamente un Strix Halo con GPU Radeon 8060S, dejando espacio para 16 slots de contexto de 32k tokens.

La publicacion incorpora dos adaptadores LoRA de bajo rango (rango 8, alpha 16) entrenados por KPS sobre su propio corpus y fusionados a escala 1.0 en las proyecciones de salida de atencion de las capas 24-35. Ademas, aplica una matriz de importancia ("heal") calculada sobre el cuerpo ya fusionado y un parche especifico a llama.cpp para permitir el padding de la dimension de entrada de los expertos de 2880 a 3072, requisito de los tipos IQ1_M e IQ2_XXS.

Es relevante ahora porque demuestra una via practica para servir un MoE de gran tamano en hardware de consumo profesional con memoria unificada, a costa de un parche no upstream en llama.cpp y de una perdida de fidelidad concentrada en los expertos enrutados. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), base openai/gpt-oss-120b; 36 capas, 128 expertos por capa |
| Parametros totales | 124.473.275.712 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 524.288 tokens configurados en servidor (16 slots de 32k); contexto nativo del base no disponible |
| Tipos de cuantizacion | Expertos enrutados: IQ1_M (gate, up) e IQ2_XXS (down); resto Q8_0; tensores de atencion entrenados en F32; tensor de salida sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico archivo de 31.778.978.112 bytes, 29,6 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 36 capas con 128 expertos enrutados por capa, lo que explica el desproporcionado numero de parametros totales frente a los activos. Sobre esa base, KPS realizo cuatro operaciones encadenadas. Primero, la fusion ("loom") de dos adaptadores LoRA de rango 8 y alpha 16, entrenados sobre corpus propio, uno sobre la proyeccion de salida de atencion de las capas 32-35 y otro sobre las capas 24-31, a escala 1.0; los tensores resultantes se conservan en F32 porque el cambio del adaptador es menor que un paso de cuantizacion Q8_0 y se perderia al recodificar.

Segundo, el calculo de una matriz de importancia ("heal") sobre el cuerpo ya fusionado: una pasada sobre conversaciones en formato Harmony mezcladas con la distribucion de entrenamiento de los adaptadores (con `--parse-special` para contar los tokens de control, aproximadamente 200 x 2048) mas una pasada de texto general (40 x 2048), combinadas con pesos 1/φ : 1/φ² y la importancia elevada a 1/e. Tercero, la compresion "bonsai" de los expertos enrutados a IQ1_M (gate y up) e IQ2_XXS (down) usando esa matriz, dejando el resto en Q8_0 salvo los tensores entrenados en F32 y el tensor de salida intacto. Cuarto, el padding de la dimension de entrada de los expertos de 2880 a 3072, necesario porque IQ1_M e IQ2_XXS requieren filas multiplo de 256 y 2880 mod 256 = 64; sin ese padding, `llama-quantize` degrada cada tensor de experto a un tipo mayor y el paquete crece notablemente. Como consecuencia, llama.cpp upstream no carga el archivo: requiere el parche incluido en `patches/`, aplicable a la etiqueta b11978.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base gpt-oss-120b.
- Razonamiento en modo "thinking" con formato Harmony; la model card menciona servir con `reasoning_effort: low` y `--reasoning-format auto`.
- Tool calling nativo: las llamadas se devuelven a traves del parser de gpt-oss de llama.cpp; la plantilla incluida declara `write_file`, `edit_file` y `apply_patch` como herramientas de forma libre.
- Soporte de agentes y razonamiento multi-paso mediante el bucle de herramientas del formato Harmony.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Correccion de plantilla de chat: se preservan mensajes `system` seguidos de `developer` y los resultados de herramientas en cadena se renderizan como texto plano en lugar de cadena con comillas JSON.

## Casos de uso

- Servicio de asistente conversacional en una unica estacion de trabajo: con 16 slots de 32k tokens y unos 41 GiB residentes, un solo Strix Halo puede atender a varios usuarios concurrentes sin GPU dedicada, lo que encaja en equipos de desarrollo o laboratorios con presupuesto de hardware acotado.
- Agente de codificacion con acceso a ficheros: la plantilla declara `write_file`, `edit_file` y `apply_patch` como herramientas de forma libre, de modo que el modelo puede editar repositorios en un bucle de agente local sin depender de APIs externas.
- Procesamiento de documentos largos: la configuracion de referencia permite 524.288 tokens de contexto agregados; con slots de 32k se pueden analizar contratos, informes o bases de codigo de extension media manteniendo la sesion en memoria.
- Laboratorio de evaluacion de cuantizaciones: al conservar los 128 expertos de las 36 capas y documentar la matriz de importancia, sirve como banco de pruebas para medir el impacto de IQ1_M/IQ2_XXS en tareas de razonamiento frente al modelo base sin comprimir.
- Despliegue aislado y on-premise: la licencia Apache-2.0 y la ausencia de dependencia de servicios en la nube permiten ejecutarlo en entornos con requisitos de confidencialidad, siempre que se acepte el parche de llama.cpp.
- Generacion aumentada por recuperacion (RAG) local: los slots de 32k permiten inyectar bastantes fragmentos recuperados por consulta, y el formato Harmony facilita separar contexto de herramienta y respuesta del asistente.
- Prototipado de agentes con tool calling en llama.cpp: el servidor expone endpoints compatibles y el parser nativo de gpt-oss simplifica la integracion con frameworks de agentes que esperan llamadas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el paquete GGUF ocupa 29,6 GiB; con 16 slots de 32k y cache KV en Q8_0 el consumo residente ronda los 41 GiB (aproximadamente 0,68 GiB por slot de 32k adicional).
- Hardware de referencia: un unico Strix Halo con GPU Radeon 8060S, usando backend Vulkan de llama.cpp (`-ngl 999`, `--load-mode none`, flash attention activada).
- GPU dedicadas: no se documenta su uso en la model card; el diseno apunta a memoria unificada de 128 GB. No hay datos de rendimiento en A100, H100 o RTX 4090.
- GPU de consumo: no cabe en GPUs consumer de 24 GB o menos por el tamano del paquete y la cache KV; requiere un sistema con memoria unificada amplia o multiples GPU.
- Despliegue: exclusivamente llama.cpp con el parche `gpt-oss-expert-pad-3072-b11978.patch` aplicado sobre la etiqueta b11978; compilacion con `-DGGML_VULKAN=ON`. No es compatible con llama.cpp upstream ni se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.
- Advertencia operativa: si la carga falla con `ErrorDeviceLost` y el kernel registra `Couldn't update BO_VA (-12)`, hay que liberar memoria antes de reintentar o reducir el numero y la longitud de los slots.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| hearth-lean-loomed-v1 | 124.473.275.712 | Hasta 524.288 configurado (16 x 32k) | GGUF, expertos IQ1_M/IQ2_XXS, resto Q8_0 | Apache-2.0 | Requiere parche en llama.cpp; adaptadores fusionados |
| openai/gpt-oss-120b (base) | 120 mil millones (aproximado, segun nombre) | No disponible | Safetensors originales; cuantizaciones GGUF de terceros | Apache-2.0 | Sin compresion agresiva de expertos; mayor fidelidad |
| Otras cuantizaciones GGUF de gpt-oss-120b | No disponible | No disponible | GGUF estandar cargable en llama.cpp upstream | Apache-2.0 | Sin padding de expertos ni parche; mayor tamano en disco |

## Limitaciones y advertencias

- La compresion a IQ1_M e IQ2_XXS de los expertos enrutados introduce perdida de fidelidad no cuantificada en la informacion disponible; no hay benchmarks que la midan.
- Los adaptadores LoRA fusionados modifican el comportamiento respecto al modelo base; su efecto sobre sesgos y estilo no esta documentado.
- Requiere un parche no upstream de llama.cpp (etiqueta b11978); cualquier actualizacion del runtime puede romper la compatibilidad.
- El padding de la dimension de expertos de 2880 a 3072 impide la carga en llama.cpp estandar y en la mayoria de herramientas derivadas (Ollama, interfaces graficas basadas en llama.cpp sin parche).
- El despliegue de referencia asume una maquina con 128 GB de memoria unificada; en configuraciones menores hay que reducir slots o longitud de contexto.
- Riesgo de alucinacion: inherente al modelo base; no se aportan evaluaciones especificas para esta cuantizacion.
- Idiomas soportados no documentados; el rendimiento fuera de ingles y de los idiomas del corpus de adaptadores es desconocido.
- La licencia Apache-2.0 del modelo base se mantiene, pero la model card no detalla condiciones adicionales sobre los adaptadores de KPS; conviene verificar antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/nbKPS/hearth-lean-loomed-v1
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- llama.cpp (etiqueta b11978): https://github.com/ggml-org/llama.cpp
- Parche y notas de compilacion: `patches/gpt-oss-expert-pad-3072-b11978.patch` y `patches/BUILD.md` dentro del repositorio de HuggingFace
- Plantilla de chat: `gpt-oss-harmony-cot-toolnames.jinja` dentro del repositorio de HuggingFace
