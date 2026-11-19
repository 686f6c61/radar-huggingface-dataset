# saidutta69/SmolLM2-360M-Instruct-heretic

## Resumen

SmolLM2-360M-Instruct-heretic es una variante "decensored" (abliterated) del modelo SmolLM2-360M-Instruct de Hugging Face, publicada por el usuario saidutta69. El modelo base es un transformer decoder-only de 361.821.120 parametros con embeddings atados, desarrollado originalmente por Hugging Face dentro de la familia SmolLM2 orientada a dispositivos de borde. La modificacion consiste en una ablacion direccional de pesos (abliteration) aplicada con la herramienta Heretic v1.4.0, que suprime el comportamiento de rechazo editando las proyecciones de salida de atencion y las down-projections del MLP, sin fine-tuning adicional.

La relevancia de esta variante es doble. Por un lado, demuestra que en modelos pequenos con post-entrenamiento ligero (SFT/DPO) el comportamiento de rechazo es ya muy bajo: el modelo original rechazaba 8 de cada 100 prompts considerados daninos, y tras la ablacion rechaza 4 de cada 100, con una divergencia KL de solo 0.0154 respecto al original. Por otro, su tamano (0.25 GB en Q4_K_M) permite ejecutarlo en RAM de un telefono, una Raspberry Pi 5 o un portatil de 8 GB, lo que lo convierte en una opcion para clasificacion, enrutamiento, reformateo y bucles agenticos cortos en entornos con recursos muy limitados.

El modelo conserva la arquitectura Llama estandar, lo que garantiza compatibilidad nativa con llama.cpp, Ollama, LM Studio y Jan, ademas de transformers con safetensors. La licencia es Apache 2.0, igual que el modelo base, y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama estandar) |
| Parametros totales | 361.821.120 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor indica aproximadamente 16 MB de KV cache por cada 8K tokens) |
| Tipos de cuantizacion | F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (14 quants GGUF + F16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, embeddings atados) y GGUF (producidos con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 361.821.120 parametros con embeddings de palabras atados, siguiendo la arquitectura Llama. No incorpora mezcla de expertos, atencion lineal ni mecanismos hibridos: es un transformer convencional en formato compatible con llama.cpp. Los pesos se distribuyen como safetensors en BF16 (0.67 GB) y como un conjunto completo de 14 cuantizaciones GGUF mas F16 generadas con llama.cpp.

El entrenamiento del modelo base SmolLM2-360M-Instruct, segun la model card, incluye un post-entrenamiento SFT/DPO deliberadamente ligero, lo que explica su bajo indice de rechazo de partida. Sobre ese modelo, la variante heretic aplica abliteration con Heretic v1.4.0: se identifica una direccion de pesos asociada al rechazo y se editan de forma selectiva las proyecciones `attn.o_proj` y `mlp.down_proj`. Los parametros concretos del trial 137 de una ejecucion de 200 trials (semilla 318129666) son: `direction_index` 27.04, `attn.o_proj.max_weight` 1.32, `attn.o_proj.max_weight_position` 29.44, `attn.o_proj.min_weight` 0.46, `attn.o_proj.min_weight_distance` 16.37, `mlp.down_proj.max_weight` 1.19, `mlp.down_proj.max_weight_position` 30.27, `mlp.down_proj.min_weight` 0.22 y `mlp.down_proj.min_weight_distance` 8.14. La divergencia KL resultante frente al original es de 0.0154, el valor mas bajo del lote segun el autor.

El repositorio incluye un directorio `reproduce/` con el recetario completo de Heretic (`config.toml`, `requirements.txt`, el journal del estudio de Optuna y sumas SHA-256), de modo que el modelo puede regenerarse bit a bit con `heretic --reproduce reproduce/reproduce.json`. Esta es una innovacion destacable en trazabilidad: no se trata de un fine-tuning opaco, sino de una edicion de pesos reproducible y auditable.

## Capacidades

- Generacion de texto conversacional en ingles con seguimiento de instrucciones heredado del modelo base.
- Razonamiento basico y tareas de clasificacion, enrutamiento y reformateo de texto.
- Generacion de codigo a nivel basico, segun el autor, preservada por el enfoque de abliteration (que no toca las capacidades no relacionadas con el rechazo).
- Bucles agenticos cortos y llamadas multi-paso simples, adecuado como modelo auxiliar en pipelines mayores.
- Uso como modelo borrador (draft model) en pipelines de decodificacion especulativa con modelos mayores.
- Comportamiento de rechazo reducido: 4 de cada 100 prompts daninos rechazados, frente a 8 de cada 100 del original.
- Ejecucion en dispositivos de borde: telefono con 4 GB de RAM, Raspberry Pi 5, portatil Apple Silicon de 8 GB.
- Compatibilidad con text-generation-inference, llama.cpp, Ollama, LM Studio, Jan y transformers.
- No se declaran capacidades de vision, audio, tool calling estructurado ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Clasificacion y enrutamiento de consultas en produccion: con 0.25 GB en Q4_K_M, el modelo puede ejecutarse en el mismo servidor que enruta peticiones para etiquetar intenciones o categorias antes de derivar a un modelo mayor, reduciendo coste por token.
- Reformateo y normalizacion de texto: tareas deterministas como convertir JSON a texto plano, extraer campos o reescribir parrafos con un formato fijo, donde la latencia y el coste importan mas que la profundidad de razonamiento.
- Modelo borrador en decodificacion especulativa: al ser compatible con la arquitectura Llama y muy ligero, puede proponer tokens candidatos que un modelo mayor verifica, acelerando la generacion en pipelines con transformers o vLLM.
- Asistente local en dispositivos de borde: integrado via llama.cpp u Ollama en una Raspberry Pi 5 o un telefono, sirve para asistentes sin conexion, resumen de notas o respuestas rapidas con contexto limitado.
- Agentes multi-paso simples: con soporte de conversacion multi-turno y contexto moderado, puede gestionar bucles cortos de herramientas en entornos donde no cabe un modelo mayor, por ejemplo en automatizacion de escritorio o scripts locales.
- Filtrado y preprocesado en pipelines de datos: clasificar, deduplicar o etiquetar grandes volumenes de texto en lote con coste minimo de GPU o CPU.
- Experimentacion con abliteration reproducible: el recetario `reproduce/` permite estudiar como afecta la edicion de pesos a un modelo pequeno con SFT/DPO ligero, util para investigacion sobre alineamiento y refusal.
- Roleplay y generacion creativa sin filtros restrictivos: con rechazo reducido, adecuado para prototipos de personajes conversacionales en local, siempre que se respeten las politicas de uso aplicables.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion proporcionada son las metricas de abliteration frente al modelo original. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | Este modelo | SmolLM2-360M-Instruct original |
|---|---|---|
| Divergencia KL | 0.0154 | 0 (por definicion) |
| Rechazos | 4/100 | 8/100 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0.25 GB en Q4_K_M, 0.36 GB en Q8_0, 0.34 GB en Q6_K, 0.20 GB en Q2_K, 0.67 GB en safetensors BF16.
- Coste adicional de contexto: aproximadamente 16 MB de KV cache por cada 8K tokens segun el autor; con 8K de contexto el consumo total ronda los 0.27 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada para este modelo; funciona en CPU. Es viable en RTX 4090, RTX 3060 o incluso en GPU integradas, pero no se aportan datos de latencia ni throughput.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas, y tambien en telefonos con 4 GB de RAM y en Raspberry Pi 5 con 4 GB.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/SmolLM2-360M-Instruct-heretic`), Ollama, LM Studio, Jan, transformers con safetensors y text-generation-inference.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-heretic (este) | 361.821.120 | no disponible | Apache 2.0 | en | Variante abliterated, rechazo 4/100, KL 0.0154 |
| SmolLM2-360M-Instruct (base) | 361.821.120 | no disponible | Apache 2.0 | en | Modelo original de Hugging Face, rechazo 8/100, SFT/DPO ligero |
| SmolLM2-135M-Instruct | no disponible | no disponible | Apache 2.0 | en | Hermano menor de la familia; no se dispone de datos de benchmarks en la informacion proporcionada |
| Qwen2.5-0.5B-Instruct | no disponible | no disponible | Apache 2.0 | multilingue | Alternativa de tamano similar orientada a instrucciones; no se dispone de datos comparativos en la informacion proporcionada |

La comparativa se limita a datos estructurales; no hay benchmarks publicados en la informacion disponible que permitan contrastar rendimiento entre estos modelos.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera pobre.
- Con 361.821.120 parametros, la capacidad de razonamiento, matematicas y codigo es limitada en comparacion con modelos de miles de millones de parametros; no es adecuado para tareas complejas de razonamiento multi-paso.
- La abliteration reduce el rechazo de 8/100 a 4/100, lo que implica que el modelo puede generar contenido que el original rechazaria; es responsabilidad del desplegador aplicar filtros y politicas de uso.
- La divergencia KL de 0.0154 indica una modificacion pequena pero no nula: puede haber degradaciones sutiles de coherencia o instruccion no medidas en la model card.
- El autor no publica evaluaciones de sesgo, toxicidad ni alucinacion; se desconoce el comportamiento en dominios sensibles.
- Licencia Apache 2.0, que permite uso comercial, pero el uso de una variante abliterated puede entrar en conflicto con las politicas de aceptacion de proveedores de servicios o plataformas.
- Repositorio de un autor individual (saidutta69) sin likes y con 2.113 descargas en la fecha de consulta; no cuenta con el respaldo de una organizacion, lo que reduce las garantias de mantenimiento.
- El contexto maximo no esta documentado en la informacion disponible; debe consultarse la configuracion del modelo base antes de desplegarlo con ventanas largas.
- La model card incluye una imagen externa alojada en un dominio de terceros (`photu.kashyalabanavli.site`), lo que constituye un riesgo de privacidad si se carga sin precauciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/SmolLM2-360M-Instruct-heretic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Articulo sobre abliteration de mlabonne: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia citado en los tags (arXiv 2502.02737): https://arxiv.org/abs/2502.02737
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
