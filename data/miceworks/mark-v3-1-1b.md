# miceworks/Mark-V3-1.1B

## Resumen

Mark-V3-1.1B es un modelo de lenguaje publicado en HuggingFace por el usuario miceworks bajo el identificador `miceworks/Mark-V3-1.1B`. Se trata de una **base arquitectonica sin entrenar**: la model card indica explicitamente que los pesos corresponden a una inicializacion (He/Xavier con fusion Hadamard) y que el modelo esta "listo para pre-entrenamiento o fine-tuning", no para inferencia util. Por tanto, no es un modelo conversacional funcional a pesar de las etiquetas `conversational` y `endpoints_compatible` del repositorio.

La arquitectura declarada es `deepseek2`, es decir, un transformer con Multi-Head Latent Attention (MLA) y mezcla de expertos (MoE) con 32 expertos enrutados, 2 expertos compartidos y enrutamiento top-4. El modelo tiene 1.222.464.960 parametros fisicos totales y unos 330,65 millones de parametros activos por token, con una ventana de contexto de 32.768 tokens y un vocabulario de 32.032 entradas.

Su relevancia actual es limitada y de naturaleza experimental: sirve como esqueleto reproducible para estudiar o reimplementar arquitecturas tipo DeepSeek-V2 a escala pequena, y como punto de partida para experimentos de pre-entrenamiento o fine-tuning. El repositorio incluye unicamente un fichero GGUF cuantizado en IQ4_NL de 656,13 MB, sin pesos en safetensors ni dataset o receta de entrenamiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MLA y MoE (tipo `deepseek2`) |
| Parametros totales | 1.222.464.960 (1,22B) |
| Parametros activos | 330.651.072 (~330,65M) por token |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | IQ4_NL (4 bits no lineal); normas y bias del router en FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`mark_v3_1_1b_iq4_nl.gguf`, 656,13 MB) |

Otros datos tecnicos declarados en la model card: dimension oculta 1152, 18 capas, 18 cabezas de atencion de query, `q_lora_rank=384`, `kv_lora_rank=256`, 32 expertos enrutados, 2 compartidos, 4 activos por token, tamano intermedio de MoE 512, vocabulario 32.032, 327 tensores (236 en IQ4_NL, 91 en FP32), checksum SHA-256 `e12c358e8144137ce4cb0546c4f00f9b0ce089c5fa354f5177f95ddf7132d84d`.

## Arquitectura y entrenamiento

La arquitectura combina Multi-Head Latent Attention (MLA), que comprime las proyecciones de query y clave-valor en rangos latentes de baja dimension (`q_lora_rank=384`, `kv_lora_rank=256`) para reducir el coste de cache KV, con una capa MoE de 32 expertos enrutados mas 2 compartidos y enrutamiento top-4. Con 18 capas y dimension oculta 1152, el modelo mantiene un presupuesto de computo por token muy bajo (~330M parametros activos) frente a su huella total de 1,22B, lo que en teoria permitiria una inferencia mas barata que un modelo denso del mismo tamano.

No hay informacion sobre datos de entrenamiento: la model card declara explicitamente estado "Untrained / Weight Initialization", sin numero de tokens, composicion del dataset, ni fases de RLHF, DPO o SFT. Los pesos se inicializaron con He/Xavier y una tecnica descrita como "Hadamard Fusion". La unica innovacion tecnica documentada es la cuantizacion IQ4_NL nativa segun especificaciones ggml (bloques de 18 bytes por cada 32 pesos, con escala FP16 y tabla de valores no lineales `kvalues_iq4nl`), conservando normas y bias del router en FP32.

## Capacidades

- Generacion de texto: no verificable; el modelo es una base sin entrenar y no produce salidas coherentes.
- Razonamiento, codigo y matematicas: no disponibles por ausencia de entrenamiento.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el vocabulario de 32.032 entradas sugiere un tokenizador limitado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles. La plantilla de Ollama incluye una etiqueta `<think>`, pero no hay evidencia de entrenamiento para modo de razonamiento.
- Infraestructura: compatible con llama.cpp, llama-server (API OpenAI), Ollama y llama-cpp-python.

## Casos de uso

- Investigacion de arquitecturas MoE con MLA: el modelo sirve como implementacion de referencia a escala pequena para estudiar el comportamiento del enrutamiento top-4 y el coste de la atencion latente antes de escalar a modelos mayores.
- Pre-entrenamiento desde cero en dominios acotados: al ser una base inicializada, puede usarse como punto de partida para entrenar un modelo de dominio especifico (por ejemplo, codigo o documentacion tecnica) con un presupuesto de computo reducido.
- Fine-tuning supervisado experimental: permite probar recetas de SFT sobre una arquitectura DeepSeek-like sin necesidad de infraestructura de gran escala.
- Pruebas de cuantizacion IQ4_NL: util para validar pipelines de conversion GGUF y medir el impacto de la cuantizacion no lineal en modelos con tensores 3D de expertos.
- Benchmarking de tooling de inferencia: sirve para verificar integraciones con llama.cpp, Ollama y servidores compatibles con la API de OpenAI en entornos de CI.
- Docencia y divulgacion: ejemplo practico de como se estructura un modelo MoE con expertos compartidos y enrutamiento disperso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo sin entrenar, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria equivalente a la de una inicializacion aleatoria y no resultaria informativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,0 GB con la cuantizacion IQ4_NL incluida (656 MB de pesos mas cache KV y overhead del runtime).
- Cache KV: con contexto de 32.768 tokens, MLA y `kv_lora_rank=256` en 18 capas, el coste de cache es reducido, pero no se dispone de cifras exactas publicadas.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, llama-cpp-python. No hay pesos en safetensors, por lo que vLLM o TGI no son aplicables directamente sin conversion.
- Latencia y throughput: no disponibles; al ser una base sin entrenar, las mediciones no serian representativas de un modelo funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Mark-V3-1.1B | 1,22B | ~330M | 32.768 | no disponible | Base sin entrenar |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32.768 | DeepSeek License | Entrenado |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32.768 | Apache 2.0 | Entrenado |
| TinyLlama-1.1B | 1,1B | denso | 2.048 | Apache 2.0 | Entrenado |

La comparacion es estructural: Mark-V3-1.1B replica el diseno MLA+MoE de DeepSeek-V2 a una escala mucho menor, pero a diferencia de los alternativas citadas no ha sido entrenado, por lo que no es funcionalmente comparable en calidad. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Modelo sin entrenar: los pesos son una inicializacion; las salidas no son coherentes y no debe usarse en produccion ni en aplicaciones reales.
- Licencia no especificada: la ausencia de licencia explicita impide determinar si se permite uso comercial; debe contactarse con el autor antes de cualquier uso.
- Idiomas no documentados: no hay informacion sobre cobertura linguistica ni calidad multilingue.
- Riesgo de alucinacion: irrelevante en la practica porque el modelo no genera contenido fiable, pero cualquier despliegue sin fine-tuning produciria texto sin sentido.
- Sesgos conocidos: no evaluables al no existir entrenamiento.
- Solo formato GGUF: no hay safetensors ni configuracion de HuggingFace Transformers, lo que limita su uso con frameworks estandar de entrenamiento sin conversion previa.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de reproducibilidad por terceros.
- Fecha de creacion futura (2026-11-01): metadato anomalo que conviene verificar antes de confiar en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/miceworks/Mark-V3-1.1B
- Especificacion ggml de cuantizacion IQ4_NL: no disponible en la informacion proporcionada
- Paper de DeepSeek-V2 (arquitectura MLA+MoE de referencia): no disponible en la informacion proporcionada
- Repositorio llama.cpp: no disponible en la informacion proporcionada
- Documentacion de Ollama: no disponible en la informacion proporcionada
