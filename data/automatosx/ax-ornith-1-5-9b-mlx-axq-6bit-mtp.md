# AutomatosX/AX-Ornith-1.5-9B-MLX-AXQ-6bit-MTP

## Resumen

AX-Ornith-1.5-9B-MLX-AXQ-6bit-MTP es una cuantizacion experimental del modelo base ornith-ai/Ornith-1.5-9B, publicada por AutomatosX. El artefacto esta empaquetado en formato MLX (Apple Silicon) mediante el esquema propietario AXQ, que el autor describe como "base affine6 packing con proteccion de mayor precision" en lugar de MXFP6 o almacenamiento uniforme de seis bits. El nombre del repositorio puede inducir a error: aunque se etiqueta como "6bit", el almacenamiento completo medido es de 8,401107 bits por peso (BPW), incluyendo tensores protegidos y sobrecarga de almacenamiento.

El modelo base pertenece a la familia qwen3_5 segun los tags del repositorio, con 9.409.812.208 parametros totales (9,41 mil millones) y un repositorio de 10,2 GB. Incorpora pesos MTP (multi-token prediction) protegidos, aunque el autor advierte explicitamente que la ejecucion, la tasa de aceptacion y la aceleracion de MTP no han sido verificadas.

La relevancia de esta ficha es acotada y debe interpretarse con cautela: se trata de un artefacto de desarrollo e investigacion sin certificado de calidad, cuyo unico aval empirico es un smoke test funcional de dos casos sobre Metal con MLX-VLM 0.7.9. No hay benchmarks de calidad, evaluaciones de codigo, MTEB ni pruebas de contexto largo publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tags); transformer con pesos MTP incluidos (no verificado en ejecucion) |
| Parametros totales | 9.409.812.208 (9,41 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ mixed-precision, base affine6 con proteccion de mayor precision; BPW completo medido 8,401107; clase de presupuesto del manifiesto `9p0bpw` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria mlx); almacenamiento completo de 10.137.095.518 bytes |

## Arquitectura y entrenamiento

La arquitectura del modelo base es qwen3_5, segun los tags del repositorio, aunque la model card no detalla la composicion de capas, el mecanismo de atencion ni la configuracion de expertos. El artefacto derivado es una conversion cuantizada del checkpoint original ornith-ai/Ornith-1.5-9B, fijado a la revision inmutable `489cb97981b8654bcfcf30ce1f94ed1b62e07b53`, aplicando pisos de proteccion de precision preexistentes y un esquema AXQ de precision mixta. La distribucion exacta de precision por modulo esta registrada en `axquant_manifest.json`, `axquant_plan.json` y `config.json`.

No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones de entrenamiento del modelo base. El artefacto incluye pesos MTP protegidos, pero el autor declara que el comportamiento de prediccion multi-token no ha sido ejercitado ni validado; su presencia en el checkpoint no constituye evidencia de aceleracion en inferencia.

## Capacidades

- Generacion de texto y conversacion (pipeline text-generation, tags conversational).
- Razonamiento aritmetico basico verificado en el smoke test (19 + 23 = 42) y seguimiento de instrucciones literales ("Reply with exactly the word READY").
- Pesos MTP incluidos en el checkpoint, con ejecucion y aceptacion no verificadas.
- Capacidades multimodales: el autor menciona un "vision sidecar" no indexado que la ruta de carga de texto por defecto omite; la inferencia de imagen no esta soportada por esa ruta en esta revision.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: el artefacto esta empaquetado para MLX y se carga con MLX-VLM 0.7.9 sobre Metal, lo que permite experimentar con un modelo de 9,41 mil millones de parametros en hardware de Apple sin depender de GPUs dedicadas.
- Investigacion de esquemas de cuantizacion: los ficheros `axquant_manifest.json` y `axquant_plan.json` documentan la distribucion de precision por modulo, lo que lo hace util para estudiar el compromiso entre BPW efectivo (8,401107) y proteccion de tensores sensibles.
- Evaluacion comparativa de artefactos cuantizados: sirve como referencia para contrastar el esquema AXQ frente a otras conversiones del mismo modelo base, siempre que se ejecuten pruebas de calidad propias, dado que el autor no emite certificado.
- Pruebas de integracion de runtimes: el autor documenta explicitamente que MLX-LM no fue probado por separado, AX Engine no fue probado y omlx/mtplx no estan soportados, lo que permite usar el artefacto como caso de prueba para pipelines de validacion de runtimes.
- Experimentacion con MTP: los pesos de prediccion multi-token estan presentes, de modo que equipos de investigacion pueden intentar medir su tasa de aceptacion, con la advertencia de que el autor no ofrece resultados.
- Desarrollo de demos conversacionales offline: al ser un checkpoint MIT de ~10,2 GB, puede desplegarse en entornos locales de demostracion donde no se requiere certificacion de calidad ni benchmarks formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato empirico es un smoke test funcional sobre Metal con MLX-VLM 0.7.9 y MLX 0.32.4:

| Caso | Prompt | Esperado | Salida | Resultado |
|---|---|---|---|---|
| Aritmetica | "What is 19 plus 23? Reply with only the number." | 42 | 42 | passed |
| Instruccion literal | "Reply with exactly the word READY." | READY | READY | passed |

El autor indica explicitamente que se trata de un smoke funcional y no de un benchmark de calidad, evaluacion MTEB, evaluacion de codigo, prueba de contexto largo ni resultado de aceleracion MTP.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el almacenamiento completo de pesos es de 10.137.095.518 bytes (~10,2 GB); el autor advierte que el tamano de fichero no determina el pico de memoria en tiempo de ejecucion.
- Hardware objetivo: Apple Silicon con Metal, dado el empaquetado MLX; no se documentan requisitos para GPU NVIDIA.
- GPU consumer: no disponible como dato verificado; la unica evidencia de ejecucion es sobre Metal con MLX-VLM.
- Opciones de despliegue: MLX-VLM 0.7.9 (probado); MLX-LM (no probado por separado); AX Engine (no probado); omlx y mtplx no soportados (solo estatico). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican metricas de velocidad ni de aceleracion MTP.

Instalacion y descarga segun el autor:

```bash
python -m pip install -U huggingface_hub mlx-vlm
hf download AutomatosX/AX-Ornith-1.5-9B-MLX-AXQ-6bit-MTP --local-dir ./AX-Ornith-1.5-9B-MLX-AXQ-6bit-MTP
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime verificado | Notas |
|---|---|---|---|---|---|---|
| AX-Ornith-1.5-9B-MLX-AXQ-6bit-MTP | 9,41 mil millones | no disponible | AXQ mixed-precision, 8,401107 BPW | MIT | MLX-VLM 0.7.9 (smoke) | Artefacto de desarrollo sin certificado de calidad |
| ornith-ai/Ornith-1.5-9B (base) | 9,41 mil millones (segun derivado) | no disponible | pesos originales | no disponible en esta ficha | no disponible | Fuente inmutable del artefacto |
| Otras conversiones del mismo base | no disponible | no disponible | no disponible | MIT (heredada) | no disponible | No se documentan variantes equivalentes en la informacion disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y estado de verificacion.

## Limitaciones y advertencias

- Artefacto de desarrollo e investigacion: el autor declara explicitamente que no se emite certificado de calidad.
- La etiqueta "6bit" no describe el almacenamiento real: el BPW completo medido es 8,401107, incluyendo tensores protegidos y sobrecarga.
- MTP no verificado: ejecucion, tasa de aceptacion y aceleracion de prediccion multi-token no han sido comprobadas.
- Vision no soportada en la ruta de carga de texto por defecto: el sidecar de vision no esta indexado y requiere un loader o export verificados por separado.
- Cobertura de runtime muy estrecha: MLX-LM no probado, AX Engine no probado, omlx y mtplx no soportados.
- Evidencia empirica minima: dos casos de smoke test no constituyen evaluacion de calidad, codigo, MTEB ni contexto largo.
- Idiomas, contexto y sesgos: no disponibles; no se documentan evaluaciones de sesgo ni de alucinacion.
- Licencia: MIT para el artefacto, pero el autor indica que el repositorio upstream y su licencia rigen el uso posterior, sin concesion comercial adicional ni transferencia de benchmarks o certificaciones.
- Produccion: no recomendado sin evaluacion propia de calidad, latencia y memoria pico, dado que el tamano de fichero no establece el pico de memoria en ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Ornith-1.5-9B-MLX-AXQ-6bit-MTP
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/tree/489cb97981b8654bcfcf30ce1f94ed1b62e07b53
- Informe estatico ligado al manifiesto: `axquant_compatibility.json` (referenciado en la model card, sin URL publica en la informacion disponible)
- Manifiestos de cuantizacion: `axquant_manifest.json`, `axquant_plan.json`, `config.json` (en el repositorio del modelo)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
