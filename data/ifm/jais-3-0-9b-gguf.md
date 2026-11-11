# IFM/Jais-3-0.9B-GGUF

## Resumen

Jais-3-0.9B es un modelo de lenguaje decoder-only de tipo dense con aproximadamente 1.078 millones de parametros, desarrollado por IFM (Inception42). Se trata del miembro compacto de la familia Jais-3 y esta disenado especificamente para generacion de texto y razonamiento en arabe e ingles. El repositorio que nos ocupa contiene la version cuantizada en formato GGUF, pensada para su ejecucion con `llama.cpp` en hardware modesto.

El modelo emplea una arquitectura denominada "K2 Horizon" segun la model card, con una ventana de contexto de 128K tokens, lo que resulta notable para su tamano. Su relevancia actual radica en que ofrece capacidades de razonamiento y soporte de tool calling en un paquete de menos de 1.100 millones de parametros, con licencia Apache 2.0, lo que lo hace atractivo para despliegues en local, entornos con recursos limitados y aplicaciones centradas en el mundo arabe.

La disponibilidad de variantes de cuantizacion (BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M) y de formatos alternativos para Apple Silicon (MLX) facilita su adopcion en estaciones de trabajo y portatiles sin GPU dedicada de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only dense (K2 Horizon) |
| Parametros totales | 1.078.285.824 (~0.9B) |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M (GGUF); MLX 4bit, 8bit, bf16 |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (modelo base), MLX |

## Arquitectura y entrenamiento

Jais-3-0.9B es un transformer decoder-only de tipo dense con 0.9B parametros. La model card identifica la arquitectura como "K2 Horizon", cuyo soporte fue integrado en `llama.cpp` mediante el PR ggml-org/llama.cpp#29535. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa.

El modelo esta optimizado para razonamiento (tag `reasoning`) y soporta tool calling, lo que sugiere un ajuste de instrucciones orientado a agentes. La ventana de contexto de 128K tokens constituye su innovacion tecnica mas destacable para su rango de tamano. No se dispone de informacion adicional sobre innovaciones arquitectonicas especificas (attention lineal, SSM hibrido, etc.) en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento multi-paso (tag `reasoning`).
- Soporte de tool calling / function calling (requiere iniciar `llama-server` con `--jinja` para el parseo correcto).
- Capacidades de agente y razonamiento multi-step.
- Ventana de contexto larga de 128K tokens para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues limitadas a arabe e ingles.
- No se ha documentado soporte de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 128K tokens, manteniendo el hilo de la conversacion y el historial del cliente sin truncamientos agresivos.
- Procesamiento de documentos largos en arabe: resumen, extraccion de entidades y respuesta a preguntas sobre contratos, informes o articulos extensos que caben en la ventana de contexto.
- Asistentes locales en dispositivos con recursos limitados: al ser un modelo de 0.9B cuantizable a Q4_K_M, puede ejecutarse en portatiles y estaciones sin GPU dedicada mediante `llama.cpp` u Ollama.
- Pipelines de agentes con tool calling: integracion en flujos automatizados donde el modelo decide que herramienta invocar (APIs, bases de datos) gracias al soporte de function calling.
- Traduccion y adaptacion de contenido entre arabe e ingles en entornos editoriales o de localizacion.
- Prototipado rapido y experimentacion en investigacion: su licencia Apache 2.0 y su tamano permiten iterar sobre tecnicas de prompting, RAG y evaluacion sin costes de infraestructura elevados.
- Despliegue en Apple Silicon: las variantes MLX permiten ejecutar el modelo en Macs con memoria unificada, util para desarrollo y demos.

## Benchmarks y rendimiento

La model card incluye una imagen de resultados de benchmarks comparativos con Qwen3.5-2B, Falcon-H1-1.5B-Deep-Instruct, Hala 1.2B y tiny-aya-global, pero los valores numericos no estan disponibles en el texto extraido (solo la estructura de la tabla con parametros y arquitectura). Por tanto:

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en Q4_K_M, ~3 GB en Q8_0 y ~2,2 GB en BF16 (los pesos en BF16 rondan los 2,1 GB; el repo completo ocupa 6,4 GB por incluir todas las variantes).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 sobran para este modelo. Tambien funciona en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: `llama.cpp` (build reciente con soporte K2 Horizon), `llama-server` con `--jinja`, Ollama, MLX en Apple Silicon. Compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia baja en hardware moderno, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Jais-3-0.9B | 0.9B | 128K | Apache 2.0 | ar, en | Dense, tool calling, razonamiento |
| Qwen3.5-2B | 2B | no disponible | no disponible | no disponible | Dense, referencia en benchmarks de la model card |
| Falcon-H1-1.5B-Deep-Instruct | 1.5B | no disponible | no disponible | no disponible | Dense, referencia en benchmarks |
| Hala 1.2B | 1.2B | no disponible | no disponible | no disponible | Dense, referencia en benchmarks |
| tiny-aya-global | 3B | no disponible | no disponible | no disponible | Dense, referencia en benchmarks |

Los datos de rendimiento comparativo no estan disponibles en el texto extraido; solo se confirma que Jais-3-0.9B es el de menor numero de parametros del grupo comparado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de sus fuentes.
- Riesgo de alucinacion: presente como en cualquier LLM de este tamano; conviene validar salidas en aplicaciones criticas.
- Limitaciones de contexto o idioma: solo soporta arabe e ingles de forma declarada; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales.
- Caveat de produccion: requiere una build reciente de `llama.cpp` con soporte de la arquitectura K2 Horizon (PR #29535) y el flag `--jinja` en `llama-server` para que funcionen el razonamiento y el tool calling.
- Al ser un modelo de 0.9B, su capacidad de razonamiento complejo y conocimiento factual es limitada en comparacion con modelos de mayor tamano; es adecuado para tareas acotadas y con soporte de RAG.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/IFM/Jais-3-0.9B-GGUF
- Modelo base: https://huggingface.co/inception42/Jais-3-0.9B
- Coleccion Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- MLX 4bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-4bit
- MLX 8bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-8bit
- MLX bf16: https://huggingface.co/IFM/Jais-3-0.9B-MLX-bf16
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29535
- Paper (referencia arXiv): arxiv:2611.10224
