# fylume/qwen3.5-4b-q8_0-gguf

## Resumen

Qwen3.5-4B es un modelo multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba Cloud, publicado bajo licencia Apache 2.0. Esta ficha concreta documenta la conversion a GGUF del repositorio `fylume/qwen3.5-4b-q8_0-gguf`, que no es un modelo propio de Fylume: se trata de los pesos originales de Qwen3.5-4B convertidos a formato GGUF y cuantizados a Q8_0, con el proyector de vision en F16. El autor publica estos ficheros unicamente para reproducir de forma byte a byte la configuracion usada como nucleo cognitivo de sus sistemas Yaob Next y Yaob Origin.

El modelo emplea una arquitectura hibrida con 33 bloques (32 mas uno de prediccion del siguiente token), anchura de embedding de 2.560, 16 cabezas de atencion con 4 cabezas clave/valor y una capa de atencion completa cada cuatro bloques, alternando con capas lineales/recurrentes. Declara una longitud de contexto de 262.144 tokens y soporta entrada de texto e imagen. Cuenta con 4.326.350.848 parametros en el modelo de lenguaje y 333.514.240 en el proyector de vision, lo que suma 4.659.865.088 parametros con el codificador visual incluido.

Su relevancia practica radica en que ofrece capacidades multimodales y de razonamiento en un tamano de 4B que cabe en GPU de consumo, con una ventana de contexto muy amplia para su categoria. La cuantizacion Q8_0 mantiene una fidelidad casi identica al BF16 (divergencia KL media de 0,00073 y mismo token superior en el 98,84 % de los casos), lo que la hace adecuada para despliegues en los que no se quiere sacrificar precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (transformer hibrido: atencion completa cada 4 bloques, capas lineales/recurrentes entre medias), 33 bloques, embedding 2.560, 16 cabezas de atencion con 4 KV heads |
| Parametros totales | 4.326.350.848 (modelo de lenguaje); 4.659.865.088 con el codificador visual |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0 (pesos Q8_0, normas F32) para el LM; F16 para el proyector de vision |
| Idiomas soportados | no disponible (solo se evaluo ingles en las pruebas del autor) |
| Licencia | Apache 2.0 (Copyright 2026 Alibaba Cloud) |
| Formato de pesos | GGUF (`Qwen3.5-4B-Q8_0.gguf` y `mmproj-Qwen3.5-4B-F16.gguf`) |

## Arquitectura y entrenamiento

La arquitectura, segun la cabecera del fichero GGUF, es `qwen35`: un transformer hibrido de 33 bloques en el que cada cuarto bloque usa atencion completa y los intermedios emplean capas lineales/recurrentes, lo que reduce el coste de atencion en contextos largos. El modelo cuenta con anchura de embedding de 2.560, 16 cabezas de atencion y 4 cabezas clave/valor (GQA), y un bloque adicional de prediccion del siguiente token. El modo de razonamiento ("thinking") es una opcion en tiempo de peticion de la plantilla de chat, no un fichero distinto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del repositorio de conversion no los detalla. El proceso documentado por Fylume es exclusivamente de conversion y cuantizacion: se uso llama.cpp b12318 (commit `7021f7e09`) con `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize ... Q8_0`, y el proyector con `convert_hf_to_gguf.py --mmproj --outtype f16`. No hubo fine-tuning, merge ni modificacion de pesos (`fine_tuned: false`, `derivation: quantisation`).

## Capacidades

- Generacion de texto conversacional y razonamiento, con modo "thinking" activable por peticion mediante la plantilla de chat.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con proyector de vision en F16.
- Capacidad de razonamiento multi-paso cuando se activa el modo thinking.
- Soporte de contexto largo: hasta 262.144 tokens declarados en la cabecera del GGUF.
- Compatibilidad con la API de chat-completions de OpenAI a traves de `llama-server`.
- Soporte de plantillas Jinja (`--jinja`), lo que habilita el uso de herramientas y plantillas de chat estructuradas.
- Capacidades multilingues: no disponibles como dato verificado; solo se evaluo ingles.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos: el proposito declarado del repositorio es reproducir byte a byte la configuracion "Yaob Next N10K-C4B", verificable con los SHA-256 publicados en `SHA256SUMS`; util para auditar pipelines de cuantizacion.
- Asistente conversacional local en GPU de consumo: con Q8_0 (4,6 GB) y el proyector F16 (0,67 GB) cabe en tarjetas de 16 GB y ofrece generacion a 53,8 tokens/s en una RTX 4060 Ti, adecuado para prototipos de chatbot en escritorio.
- Procesamiento de documentos largos con imagen: gracias a los 262.144 tokens de contexto y la entrada visual, se puede usar para analisis de informes extensos con figuras o capturas integradas.
- Despliegue en CPU para entornos sin GPU: segun las mediciones del autor, en un i9-11900F a 8 hilos alcanza 109 tokens/s de prompt y 7,1 tokens/s de generacion, viable para tareas por lotes no interactivas.
- Nucleo de agentes con razonamiento: el modo thinking activable permite tareas de razonamiento multi-paso, con la advertencia de que en las pruebas 24 respuestas agotaron el limite de 8.192 tokens.
- Servicio compatible con OpenAI: `llama-server` expone `/v1/chat/completions`, lo que permite integrarlo detras de clientes existentes sin cambiar el codigo de aplicacion.
- Evaluacion de fidelidad de cuantizacion: sirve como referencia Q8_0 frente al BF16 para medir impacto de la cuantizacion en tareas deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas mediciones son internas de Fylume sobre la suite "Cognition" y pruebas de velocidad:

| Medicion | Resultado |
|---|---|
| Suite Cognition, 259 tareas deterministas, nucleo solo, razonamiento desactivado, limite 8.192 tokens | 234 correctas (214 de 239 tareas de texto, 20 de 20 de vision); con razonamiento activado, 221 (24 respuestas agotaron el limite) |
| Cuantizacion Q8_0 frente a BF16 (8 x 2.048 tokens, llama-perplexity, KL divergence) | KLD media 0,00073; mismo token superior 98,84 %; ratio de perplejidad 1,0010 |
| Velocidad, llama-bench b12318, RTX 4060 Ti 16 GB, offload completo | prompt 6.053 tokens/s (512); generacion 53,8 tokens/s |
| Velocidad, CPU, i9-11900F 8 hilos | prompt 109 tokens/s; generacion 7,1 tokens/s |
| Dentro de Yaob Next, NVIDIA GB10 (DGX Spark, arm64, CUDA) | ~14,5 tokens/s con prompts de 2.000 tokens; listo en 10,6 s |

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,3 GB para los dos ficheros (4,61 GB del LM Q8_0 + 0,67 GB del proyector F16), mas overhead de contexto KV.
- GPU recomendadas: RTX 4060 Ti 16 GB (medida por el autor con offload completo), A100, H100 para contextos largos y mayor concurrencia; NVIDIA GB10 (DGX Spark) validada dentro de Yaob Next.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB de VRAM segun la longitud de contexto configurada; con `-ngl 99` se hace offload completo.
- Opciones de despliegue: `llama-server` de llama.cpp (probado con b12318, flags `-ngl 99 -fa on --jinja`); para vLLM, SGLang o Transformers se recomienda usar los safetensors originales de `Qwen/Qwen3.5-4B`. Ollama, LM Studio, llama-cpp-python, Metal y ROCm no fueron probados por el autor.
- Latencia y throughput: 53,8 tokens/s de generacion en RTX 4060 Ti 16 GB; 7,1 tokens/s en CPU i9-11900F a 8 hilos; ~14,5 tokens/s en DGX Spark con prompts de 2.000 tokens.
- Advertencia: el soporte de Qwen3.5 en llama.cpp es reciente; builds anteriores a b12318 pueden no cargar el fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (esta conversion Q8_0) | 4,33 B (LM) / 4,66 B con vision | 262.144 | Apache 2.0 | GGUF | Multimodal, hibrido, thinking opcional |
| Qwen/Qwen3.5-4B (upstream) | 4,33 B (LM) | 262.144 | Apache 2.0 | safetensors | Referencia BF16; recomendado para vLLM/SGLang/Transformers |
| Otras conversiones GGUF de Qwen3.5-4B | 4,33 B (LM) | 262.144 | Apache 2.0 | GGUF | El autor indica que no son mejores ni peores que esta; no se detallan nombres ni autores |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El repositorio no aporta ninguna mejora sobre el modelo original ni sobre otras conversiones GGUF; para uso general se recomienda el modelo upstream.
- Solo se evaluo en ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las limitaciones habituales de un modelo de 4B.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Con razonamiento activado, 24 de las respuestas de la suite de pruebas agotaron el limite de 8.192 tokens, lo que indica respuestas largas que pueden truncarse con limites bajos.
- Compatibilidad limitada: solo probado con llama.cpp b12318; builds antiguos pueden fallar al cargar el fichero.
- No probado en vLLM, SGLang, Ollama, LM Studio, llama-cpp-python, Apple Metal ni ROCm.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de copyright de Alibaba Cloud y la declaracion de cambios (seccion 4(b)) por la conversion.
- Las mediciones de rendimiento proceden de suites pequenas y una unica maquina; no deben extrapolarse como garantia de produccion.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/fylume/qwen3.5-4b-q8_0-gguf
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- llama.cpp (build b12318, commit `7021f7e09`): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo oficial de Qwen3.5: no disponible en la informacion proporcionada.
