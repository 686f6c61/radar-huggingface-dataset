# roman220220/gemma-4-E2B-it-qat-mlx

## Resumen

Gemma 4 E2B it qat mlx es una conversion a formato MLX del modelo multimodal Gemma 4 E2B de Google, publicada por el usuario comunitario roman220220 (vinculado al stack de IA local de IPSupport). El modelo original fue entrenado por Google con quantization-aware training (QAT) para la rejilla q4_0 de llama.cpp, y esta version lo traslada a MLX reproduciendo esa misma rejilla bit a bit, con el objetivo de que la inferencia en Apple Silicon sea fiel a los pesos que Google entreno realmente.

El problema que resuelve es concreto: las conversiones habituales a 4 bits con MLX (por ejemplo `mlx_lm.convert -q`, o builds que usan grupo 64) recalculan los minimos y maximos de cada grupo y desplazan los pesos fuera de la rejilla para la que se hizo el QAT, degradando la fidelidad. Esta conversion mantiene 149 capas Lineales en affine 4 bits con grupo 32 calibradas como `scale = d` y `bias = -8d`, lo que equivale exactamente a la rejilla q4_0, y sube a 8 bits las 126 Lineales que mas pierden a 4 bits.

El resultado ocupa 4,04 GB, declara 7.181.985.347 parametros totales en safetensors y cubre texto, vision y audio. Es relevante ahora porque permite ejecutar un modelo multimodal QAT en Macs con Apple Silicon con una perplejidad en wikitext-2 de 64,5 frente a los 66,1 de los pesos maestros en bf16, y con mayor fidelidad que las alternativas de mlx-community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con decoder de texto y torres de vision y audio (detalle de capas y atencion no disponible en la informacion proporcionada) |
| Parametros totales | 7.181.985.347 (safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Lineales de texto: affine 4 bits, grupo 32 (rejilla q4_0 de llama.cpp), 149 capas; 126 Lineales elevadas a 8 bits; embeddings a 6 bits (equivalente a Q6_K del GGUF); torres de vision y audio a 8 bits; normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada por el autor de la conversion) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Tamano del repositorio | 4,1 GB (pesos cuantizados: 4,04 GB) |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized |
| Pipeline | image-text-to-text |
| Descargas / likes | 11 / 0 |
| Fecha de publicacion | 2026-10-01 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal: un decoder de texto acompanado de una torre de vision y una torre de audio, lo que habilita entradas image-text-to-text y transcripcion de voz. La model card no detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni la ventana de contexto; el sufijo E2B de la familia sugiere una variante eficiente, pero el dato de parametros activos no se explicita en la informacion disponible. Lo que si se describe con precision es el reparto de precisiones por componente: 149 Lineales de texto en affine 4 bits con grupo 32, embeddings a 6 bits, torres de vision y audio a 8 bits (nunca fueron entrenadas con QAT) y normas sin tocar.

El entrenamiento relevante aqui es el QAT de Google sobre los pesos maestros `-qat-q4_0-unquantized`, orientado a la rejilla q4_0 de llama.cpp. Esta conversion es un ejercicio de fidelidad: MLX almacena `scale · q + bias`; fijando `scale = d` y `bias = -8d` se obtiene la propia rejilla de q4_0, y cada una de las 149 Lineales se verifica contra el GGUF durante la conversion. La unica diferencia admitida es que la escala fp16 se redondea a bf16 (el dtype de escala de MLX), lo que supone menos de 1/64 de paso por peso.

Como innovacion adicional, la seleccion de las 126 Lineales que suben a 8 bits no es heuristica: cada Lineal de texto se elevo individualmente a 8 bits y se puntuo por la divergencia KL que elimina respecto a los pesos maestros en bf16, normalizada por MB anadido. Las mejores 126 caben en +100 MB y corresponden mayoritariamente a gates de entrada y proyecciones por capa (63) y proyecciones de atencion (54), con solo 9 Lineales de MLP.

## Capacidades

- Generacion de texto conversacional: responde en formato de chat segun se comprueba en la model card.
- Vision: describe y nombra el contenido de una imagen (por ejemplo, identificar el animal de una fotografia) a traves de la torre de vision.
- Audio: transcripcion de voz mediante la torre de audio.
- Multimodalidad image-text-to-text: acepta entradas combinadas de imagen y texto segun el `pipeline_tag` declarado.
- Inferencia local en Apple Silicon con MLX, sin salida de datos a la nube segun el stack LLMTray.
- Uso con plantilla de chat mediante `tokenizer.apply_chat_template`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se carga con `mlx_lm` en un Mac con Apple Silicon y responde en formato chat, de modo que resulta adecuado para prototipos de asistente donde no se quiere enviar datos a servicios externos.
- Descripcion y clasificacion de imagenes en local: dado que la torre de vision esta incluida y cuantizada a 8 bits, se puede usar para etiquetar fotografias, generar pies de foto o moderar contenido grafico dentro de una aplicacion de escritorio.
- Transcripcion de audio y notas de voz: la torre de audio permite convertir voz a texto en el propio dispositivo, util para herramientas de dictado o resumen de reuniones que exigen privacidad.
- Aplicaciones de vision y lenguaje sobre documento escaneado: combinando imagen y texto se puede extraer informacion de capturas o fotos de documentos con un flujo image-text-to-text.
- Prototipado rapido en un portatil: con 4,04 GB de pesos y 67,5 tokens/s de decodificacion en un MacBook Air M5, el modelo cabe en un equipo de gama portatil y sirve para iterar en demos sin infraestructura dedicada.
- Servicio de API compatible con OpenAI en local: el stack LLMTray expone un endpoint compatible, por lo que el modelo puede actuar como backend de sustitución para aplicaciones que ya hablan ese protocolo.
- Evaluacion de tecnicas de cuantizacion: al reproducir fielmente una rejilla QAT, sirve como referencia para comparar perplejidad y fidelidad de otras conversiones a 4 bits.

## Benchmarks y rendimiento

Perplejidad en texto bruto sobre wikitext-2 (test), 128 ventanas de 512 tokens con BOS al inicio. La divergencia KL y la coincidencia top-1 se miden contra los pesos maestros QAT en bf16.

| Modelo | Tamano | PPL | KL vs maestro QAT | Coincidencia top-1 |
|---|---|---|---|---|
| Pesos maestros QAT, bf16 (google/gemma-4-E2B-it-qat-q4_0-unquantized) | no disponible | 66,1 | referencia | referencia |
| Este modelo (roman220220/gemma-4-E2B-it-qat-mlx) | 4,04 GB | 64,5 | 0,030 | 91,8 % |
| mlx-community/gemma-4-E2B-it-qat-4bit | 4,33 GB | 66,2 | 0,067 | 87,6 % |
| mlx-community/gemma-4-e2b-it-4bit | 3,6 GB | 239,7 | 0,853 | 66,3 % |

Velocidad de decodificacion con mlx-lm en un MacBook Air M5:

| Build | tokens/s |
|---|---|
| Este modelo | 67,5 |
| mlx-community/gemma-4-E2B-it-qat-4bit | 54,7 |
| mlx-community/gemma-4-e2b-it-4bit (sin QAT) | 83,7 |

La PPL ligeramente por debajo de la de los pesos maestros se atribuye al ruido de una prueba sobre texto bruto y al propio funcionamiento del QAT: la red se entreno atravesando los pesos de 4 bits, por lo que el modelo q4_0 es el modelo entrenado y el maestro en bf16 es su copia sombra. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada: 4,04 GB de pesos; el repositorio completo ocupa 4,1 GB. Hay que sumar el espacio de trabajo del runtime MLX y la cache KV, no cuantificada en este formato.
- Plataforma soportada: MLX, es decir, Apple Silicon (serie M). No hay pesos GGUF ni safetensors para CUDA en este repositorio.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon con memoria unificada suficiente (16 GB es un objetivo razonable); los 4,04 GB dejan margen amplio.
- GPU de datacenter (A100, H100): no aplicables directamente, al no existir pesos para CUDA en este repositorio. Para esas plataformas habria que usar el GGUF q4_0 de Google o los pesos maestros.
- Opciones de despliegue: `mlx-lm` en el fork `ipsupport-llc/mlx-lm` (necesario para multimodalidad via `mlx_lm.multimodal`), y la aplicacion LLMTray para macOS. vLLM, llama.cpp, Ollama y TGI no estan soportados por esta conversion.
- Latencia y throughput: 67,5 tokens/s de decodificacion medidos en un MacBook Air M5, por encima de los 54,7 del build QAT de mlx-community y por debajo de los 83,7 del build 4 bits sin QAT. La diferencia se atribuye al grupo 32 y a las Lineales elevadas a 8 bits.
- Nota de instalacion: requiere `pip install "mlx-lm @ git+https://github.com/ipsupport-llc/mlx-lm.git"`.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | PPL (wikitext-2) | KL vs maestro | tokens/s (M5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo | 7.181.985.347 | 4,04 GB | 64,5 | 0,030 | 67,5 | apache-2.0 (declarada) | MLX, Apple Silicon |
| mlx-community/gemma-4-E2B-it-qat-4bit | no disponible | 4,33 GB | 66,2 | 0,067 | 54,7 | no disponible | MLX |
| mlx-community/gemma-4-e2b-it-4bit | no disponible | 3,6 GB | 239,7 | 0,853 | 83,7 | no disponible | MLX |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | no disponible | no disponible | 66,1 | referencia | no disponible | no disponible | Pesos maestros en bf16 |

Frente a las dos alternativas de mlx-community, esta conversion gana en fidelidad (KL de 0,030 frente a 0,067 y 0,853) y en velocidad respecto al build QAT, a costa de 0,44 GB mas que la variante sin QAT y de unos 16 tokens/s menos que esta ultima, cuyo coste en perplejidad es 3,7 veces mayor. Comparada con los pesos maestros en bf16, la diferencia de fidelidad es pequena y el modelo ocupa una fraccion del espacio.

## Limitaciones y advertencias

- Modelo comunitario con traccion minima: 11 descargas y 0 likes en el momento del registro, sin mantenimiento garantizado por parte del autor ni de Google.
- Requiere un fork especifico de `mlx-lm` (ipsupport-llc/mlx-lm) para el soporte multimodal; con la libreria estandar `mlx-lm` las rutas de vision y audio pueden no funcionar.
- Exclusivo de Apple Silicon: no hay pesos GGUF ni para CUDA en este repositorio, lo que limita su uso a Macs.
- La model card no documenta la longitud de contexto, los idiomas soportados, ni el detalle de la arquitectura del decoder, por lo que esos parametros deben verificarse contra la documentacion de Gemma 4 de Google antes de llevarlo a produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad, fidelidad a fuentes ni tasas de error en tareas abiertas; solo hay perplejidad y divergencia respecto a los pesos maestros.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Licencia: el repositorio declara apache-2.0, pero conviene verificar las condiciones que Google aplica al modelo base Gemma 4 antes de un uso comercial, ya que la model card no reproduce los terminos heredados del modelo original.
- Las metricas de rendimiento publicadas provienen de un unico dispositivo (MacBook Air M5) y de una unica metodologia (mlx-lm, decodificacion); no hay datos de latencia con prompt largo ni de throughput en lote.
- La medicion de la torre de audio se limita a comprobar que transcribe voz; no se publican tasas de error (WER) ni idiomas cubiertos.
- Los resultados de busqueda web disponibles no aportan informacion tecnica contrastable sobre este modelo; su contenido es ajeno al mismo y no se ha utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/gemma-4-E2B-it-qat-mlx
- Modelo base (pesos maestros QAT en bf16): https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- GGUF q4_0 oficial de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Alternativa de mlx-community con QAT: https://huggingface.co/mlx-community/gemma-4-E2B-it-qat-4bit
- Alternativa de mlx-community sin QAT: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Codigo y notas del metodo de conversion: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- Fork de mlx-lm usado por el runtime: https://github.com/ipsupport-llc/mlx-lm
- Aplicacion LLMTray para macOS: https://www.ipsupport.us/llmtray/
- Repositorio de LLMTray: https://github.com/ipsupport-llc/llmtray
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Paper o informe tecnico de Gemma 4: no disponible en la informacion proporcionada.
