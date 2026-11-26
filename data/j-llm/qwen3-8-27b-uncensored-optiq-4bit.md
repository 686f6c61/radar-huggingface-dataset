# j-llm/Qwen3.8-27B-Uncensored-OptiQ-4bit

## Resumen

Qwen3.8-27B-Uncensored-OptiQ-4bit es una cuantizacion mixta de precision (4/8 bits) en formato MLX del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez es la version "abliterated" (direccion de rechazo eliminada) del Qwen/Qwen3.8-27B de Alibaba. El trabajo lo publica el usuario j-llm y esta pensado para ejecucion local en hardware Apple Silicon mediante la libreria MLX. El modelo conserva la torre de vision y la cabeza MTP (multi-token prediction) del original, lo que permite inferencia multimodal imagen-texto y decodificacion especulativa.

La arquitectura subyacente es Qwen3_5ForConditionalGeneration, un transformer hibrido de 64 capas con atencion mixta: 48 capas de atencion lineal (Gated DeltaNet) y 16 capas de atencion completa con intervalo 4, dimension oculta de 5120 y una ventana de contexto de 262.144 tokens. Los pesos cuantizados ocupan aproximadamente 20,1 GB en disco con una media de 5,13 bits por peso, resultado de asignar 8 bits a las 220 capas mas sensibles (medidas por divergencia KL frente al BF16 de referencia) y 4 bits a las 277 restantes.

Su relevancia actual reside en dos factores: por un lado, demuestra una receta de cuantizacion sensible a la capa que supera en la suite propia del autor a la referencia mlx-community/Qwen3.8-27B-OptiQ-4bit (91,69 frente a 87,98 de Capability Score); por otro, elimina los rechazos del modelo base, lo que interesa a quienes investigan alineacion, evalúan robustez o necesitan un modelo sin filtros para tareas creativas y de analisis. La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza "uncensored" exige controles adicionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration, transformer hibrido (Gated DeltaNet: 48 capas de atencion lineal + 16 de atencion completa, intervalo 4), 64 capas, hidden 5120 |
| Parametros totales | 26.895.993.856 (~26,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | OptiQ mixta 4/8 bits, group size 64, afin; 5,13 bits por peso (objetivo 5,0); 497 tensores cuantizados (220 a 8 bits, 277 a 4 bits); torre de vision en BF16 |
| Idiomas soportados | en, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con sidecars `optiq/optiq_vision.safetensors` y `optiq/mtp.safetensors`; repo de 21,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido que combina atencion lineal (Gated DeltaNet) en 48 capas con atencion completa en 16 capas, distribuidas con un intervalo de 4. Esta mezcla reduce el coste computacional y de memoria del contexto largo manteniendo la capacidad de atencion global donde es necesaria, y es la razon por la que puede sostener 262.144 tokens de ventana. Incluye una torre de vision (333 tensores en BF16) para entrada imagen-texto y una cabeza MTP (29 tensores) que habilita decodificacion especulativa.

El proceso de cuantizacion es el rasgo tecnico diferencial: se midio la sensibilidad por capa mediante divergencia KL frente al modelo BF16 completo (no frente a un proxy de 4 bits), usando 40 muestras de un mix de seis dominios y la herramienta mlx-optiq 0.5.19. Con esa ranking se asignaron 8 bits a las capas sensibles y 4 bits al resto. La divergencia KL resultante frente al BF16 es de 0,101 de media, 0,008 de mediana y 0,300 en el percentil 95 (64 prompts x 256 tokens). El modelo base paso por un proceso de abliteration (eliminacion de la direccion de rechazo) antes de la cuantizacion; no se dispone de detalles sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO en el modelo Qwen subyacente.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y japones.
- Razonamiento con modo "thinking" (la suite de benchmarks usa modo razonamiento en cinco de las seis pruebas).
- Vision-lenguaje: descripcion de imagenes, respuesta a preguntas visuales y tareas image-text-to-text (pipeline declarado).
- Generacion de codigo: 95,7% de pass@1 en HumanEval segun el autor.
- Matematicas: 97,0% en GSM8K (1000 problemas).
- Tool calling / function calling: 90,0% en BFCL-V3 (simple).
- Seguimiento de instrucciones estrictas: 86,3% en IFEval (strict).
- Extraccion en contextos largos y repetitivos: HashHop 91,0% en modo conciso (no-thinking).
- Decodificacion especulativa mediante la cabeza MTP preservada.
- Servido compatible con APIs OpenAI y Anthropic a traves de `optiq serve`.
- Sin rechazos (abliterated): responde a peticiones que el modelo base declinaria.

## Casos de uso

- Asistente conversacional local en Mac: con ~20 GB en disco y MLX, se puede ejecutar en un Mac con 32-64 GB de memoria unificada para conversaciones multi-turno sin conexion, aprovechando la ventana de 262.144 tokens para mantener historiales largos.
- Analisis de documentos extensos: la ventana de contexto y la atencion hibrida permiten procesar contratos, informes o bases de codigo completas en una sola pasada; el autor recomienda modo conciso para extraccion de contextos largos y repetitivos.
- Descripcion y analisis de imagenes: la torre de vision en BF16 permite tareas de image-text-to-text (accesibilidad, catalogacion de imagenes, extraccion de datos de capturas) mediante mlx-vlm.
- Generacion de codigo en local: con 95,7% en HumanEval y soporte de tool calling, se integra en editores o scripts de automatizacion en entornos Apple Silicon sin enviar codigo a la nube.
- Evaluacion de alineacion y robustez: investigadores pueden comparar el comportamiento del modelo abliterated frente al original para estudiar la direccion de rechazo y los efectos de eliminarla.
- Escritura creativa sin filtros: guiones, ficcion y contenido editorial donde los rechazos del modelo base resultan un obstaculo; requiere revision humana por la ausencia de salvaguardas.
- Servicio compatible con OpenAI/Anthropic: `optiq serve --mtp` expone el modelo con API estandar, util para prototipos de agentes con decodificacion especulativa y KV cache mixta (5,00 bits medios).

## Benchmarks y rendimiento

Datos publicados por el autor en su model card (suite OptiQ de seis benchmarks, mismo Mac M3 Ultra 96 GB, decodificacion greedy; cinco pruebas en modo razonamiento, HashHop en configuracion "fair" sin razonamiento):

| Benchmark | Resultado |
|---|---|
| MMLU (generativo, razonamiento) | 90,1% |
| GSM8K (1000) | 97,0% |
| IFEval (strict) | 86,3% |
| BFCL-V3 (simple) | 90,0% |
| HumanEval (pass@1) | 95,7% |
| HashHop (fair, sin razonamiento) | 91,0% (hops 100 / 100 / 96 / 68) |
| Capability Score (fair) | 91,69 |
| Capability Score (suite con razonamiento) | 88,86 (HashHop 74,0) |

Referencia comparativa del propio autor: mlx-community/Qwen3.8-27B-OptiQ-4bit reporta 87,98 en la misma suite. Divergencia KL frente al BF16: media 0,101, mediana 0,008, p95 0,300. No se han publicado resultados independientes de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: ~20,1 GB de pesos en disco; en la practica se recomienda un minimo de 32 GB de memoria unificada y 48-64 GB para contexto largo y KV cache.
- Hardware objetivo: Apple Silicon con MLX; el autor valido en un M3 Ultra de 96 GB. No es ejecutable en GPU NVIDIA de forma nativa (formato MLX).
- Cabe en consumer hardware: si, en Mac con 32 GB o mas (M1 Pro/Max en adelante con margen limitado; M2/M3/M4 Max y Ultra con holgura).
- Despliegue: `mlx-lm` (texto), `mlx-vlm` (imagen+texto), `mlx-optiq` / `optiq serve` (API OpenAI y Anthropic, MTP y KV cache mixta), LM Studio (paridad declarada con Qwen/Qwen3.8-27B). Nota del autor: `optiq serve` requiere `mlx-lm<0.32` para la ruta de vision.
- KV cache opcional: configuracion mixta de 5,00 bits medios (12 capas a 4 bits + 4 capas a 8 bits en las 16 capas de atencion completa; las lineales se omiten).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capability Score (suite OptiQ) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| j-llm/Qwen3.8-27B-Uncensored-OptiQ-4bit | ~26,9 B | 262.144 | 91,69 (fair) / 88,86 (reasoning) | Apache 2.0 | MLX, safetensors |
| mlx-community/Qwen3.8-27B-OptiQ-4bit | ~26,9 B (base) | no disponible | 87,98 | Apache 2.0 (base Qwen) | MLX |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | ~26,9 B | 262.144 | no disponible | Apache 2.0 | safetensors BF16 |
| Qwen/Qwen3.8-27B (original) | ~26,9 B | 262.144 | no disponible | Apache 2.0 | safetensors, GGUF (comunidad) |

La comparativa se limita a la familia Qwen3.8-27B porque no se dispone de datos de benchmarks de otros modelos en la informacion proporcionada; el unico dato cruzado es el 87,98 de la referencia mlx-community frente al 91,69 de esta cuantizacion.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo reduce las salvaguardas; puede generar contenido sensible, ofensivo o inseguro. No apto para produccion sin moderacion externa.
- Riesgo de alucinacion: inherente a los LLM de esta escala; los benchmarks del autor son autoinformados y no verificados de forma independiente.
- Idiomas: solo en, zh y ja declarados; el rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Solo MLX: los pesos no son utilizables directamente en vLLM, TGI, llama.cpp ni Ollama; requiere Apple Silicon o conversion adicional.
- Compatibilidad de servido: la ruta de vision de `optiq serve` exige `mlx-lm<0.32`; versiones posteriores rompen el parche.
- Modo razonamiento: el autor documenta un artefacto en HashHop (colapso en hops=1 con presupuesto de 4096 tokens); para contextos largos y repetitivos recomienda modo conciso.
- Cuantizacion: aunque la divergencia KL media es baja, el p95 de 0,300 indica que algunas capas se desvian del BF16; tareas de alta precision pueden resentirse.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; el modelo hereda los del base y la abliteration puede alterar su distribucion.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado sin filtros.

## Enlaces

- Hugging Face: https://huggingface.co/j-llm/Qwen3.8-27B-Uncensored-OptiQ-4bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Referencia de cuantizacion: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion mlx-optiq: no disponible (referenciada como `mlx-optiq` 0.5.19 en la model card)
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
