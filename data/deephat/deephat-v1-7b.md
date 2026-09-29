# DeepHat/DeepHat-V1-7B

## Resumen

DeepHat-V1-7B es un modelo de lenguaje causal de 7.610 millones de parametros desarrollado por DeepHat (Kindo.ai) como un ajuste fino (finetune) de Qwen2.5-Coder-7B. Esta especializado en tareas de ciberseguridad ofensiva y defensiva, ademas de DevOps, y hereda del modelo base su arquitectura transformer con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV. Se distribuye bajo licencia Apache-2.0 con una extension propia del autor que introduce restricciones de uso adicionales.

El modelo parte de un contexto de 32.768 tokens configurado en su `config.json`, ampliable hasta 131.072 tokens completos mediante la tecnica YaRN (factor 4.0). Cuenta con 28 capas y usa atencion con Grouped Query Attention (GQA), con 28 cabezas de consulta y 4 de clave/valor, una configuracion que reduce el consumo de memoria en la cache KV durante la inferencia.

Su relevancia actual reside en que ofrece un modelo de 7B orientado a seguridad y operaciones, con capacidades de generacion de codigo heredadas del base y una ventana de contexto larga, disponible tanto en HuggingFace como en Ollama para despliegues locales. El repositorio acumula mas de 5.200 descargas y 253 likes, lo que indica una adopcion moderada dentro del nicho de herramientas de seguridad asistidas por IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en QKV (GQA) |
| Parametros totales | 7.615.616.512 (7,61 B) |
| Parametros activos | No aplica (no es MoE) |
| Parametros sin embeddings | 6.530 millones |
| Longitud de contexto | 32.768 tokens por defecto; hasta 131.072 con YaRN (factor 4.0) |
| Capas | 28 |
| Cabezas de atencion | 28 para Q, 4 para KV (GQA) |
| Tipos de cuantizacion | safetensors en precision original; GGUF disponible en Ollama (no se especifican niveles exactos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 + extension DeepHat |
| Formato de pesos | safetensors (transformers); GGUF para Ollama |
| Modelo base | Qwen/Qwen2.5-Coder-7B |
| Tamano del repositorio | 30,5 GB |

## Arquitectura y entrenamiento

DeepHat-V1-7B reutiliza integramente la arquitectura del modelo base Qwen2.5-Coder-7B: un transformer causal de 28 capas con codificacion posicional rotatoria (RoPE), activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones de consulta, clave y valor. La atencion usa Grouped Query Attention con una relacion de 28 cabezas de consulta frente a 4 de clave/valor, lo que reduce la huella de memoria de la cache KV respecto a la atencion multi-cabeza estandar.

El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO. Se sabe que es un finetune directo sobre Qwen2.5-Coder-7B, cuyo entrenamiento original incluyo fases de preentrenamiento y postentrenamiento. La innovacion destacable del modelo es la especializacion en dominios de ciberseguridad y DevOps, ademas del soporte de extension de contexto mediante YaRN, que permite escalar la ventana funcional de 32.768 a 131.072 tokens anadiendo un bloque `rope_scaling` al `config.json`.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`).
- Generacion y analisis de codigo, heredado del base Qwen2.5-Coder-7B.
- Razonamiento aplicado a tareas de ciberseguridad ofensiva y defensiva (analisis de vulnerabilidades, scripts de seguridad, interpretacion de artefactos).
- Tareas de DevOps y automatizacion de infraestructura (scripts, configuraciones, pipelines).
- Procesamiento de contexto largo de hasta 131.072 tokens con YaRN activado.
- Modo asistente configurable mediante mensaje de sistema (se recomienda definir el rol de experto en ciberseguridad y DevOps).
- Soporte de despliegue en transformers, text-generation-inference y endpoints compatibles.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Asistente de analisis de seguridad: el modelo puede revisar fragmentos de codigo o configuraciones en busca de patrones inseguros, apoyandose en su especializacion en ciberseguridad y en su capacidad de generacion de codigo.
- Automatizacion de tareas DevOps: generacion de scripts de despliegue, ficheros de configuracion (Dockerfile, YAML de CI/CD) y comandos de infraestructura, aprovechando el finetune sobre un modelo coder.
- Triaje de alertas y logs: con 32.768 tokens de contexto por defecto (ampliables a 131.072 con YaRN), permite analizar bloques extensos de registros o trazas en una sola pasada.
- Soporte tecnico especializado: gestion de conversaciones multi-turno en torno a dudas de seguridad o infraestructura, con el rol de experto fijado en el mensaje de sistema.
- Generacion de codigo en pipelines internos: integrable en herramientas de desarrollo para autocompletar o revisar codigo, mediante la API de transformers o endpoints compatibles.
- Formacion y simulacion en seguridad: generacion de escenarios de ejemplo, explicaciones de tecnicas y material didactico para equipos de seguridad, siempre dentro de los limites de la licencia.
- Chatbot interno de operaciones: despliegue local con Ollama para asistir a equipos de sistemas sin enviar datos a servicios externos, util cuando la confidencialidad es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en precision FP16 el modelo de 7,61 B parametros ocupa aproximadamente 15-16 GB de pesos, mas overhead de la cache KV; en cuantizacion de 8 bits ronda los 8-9 GB y en 4 bits unos 4,5-5,5 GB (las cifras de cuantizacion son estimaciones generales para modelos de este tamano, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegues en produccion con contexto largo; RTX 4090, RTX 3090 o A10G para uso individual en precision reducida.
- Compatibilidad con GPU de consumo: si, cabe en GPUs con 12 GB o mas en cuantizacion de 4-8 bits; en FP16 requiere al menos 16-24 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), endpoints compatibles con OpenAI, Ollama (existe una pagina oficial del modelo), y potencialmente vLLM y llama.cpp al existir formato GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota sobre contexto: para usar la ventana completa de 131.072 tokens es necesario editar el `config.json` con el bloque `rope_scaling` de tipo YaRN (factor 4.0, `original_max_position_embeddings: 32768`); con la configuracion por defecto el limite es 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepHat-V1-7B | 7,61 B | 32.768 (131.072 con YaRN) | Ciberseguridad y DevOps | Apache-2.0 + extension DeepHat | HuggingFace, Ollama |
| Qwen2.5-Coder-7B | 7,61 B | 32.768 (131.072 con YaRN) | Codigo general | Apache-2.0 | HuggingFace |
| Otros modelos de ciberseguridad de ~7B | no disponible | no disponible | Ciberseguridad | no disponible | no disponible |

El competidor mas directo es su propio modelo base, Qwen2.5-Coder-7B, del que hereda arquitectura, tamano y contexto pero sin la especializacion en seguridad. No se dispone de datos que permitan comparar rendimiento numerico con alternativas especificas del dominio de ciberseguridad.

## Limitaciones y advertencias

- Idiomas: el modelo esta declarado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Alucinacion: al ser un finetune de 7B sin datos publicados de evaluacion, existe riesgo de generar informacion tecnica incorrecta, especialmente en recomendaciones de seguridad o comandos de sistema; requiere verificacion humana.
- Uso sensible: la especializacion en ciberseguridad ofensiva implica riesgo de mal uso; el autor restringe expresamente usos que violen leyes, fines militares, dano a menores, desinformacion, difusion de datos personales o decisiones automatizadas con efectos legales.
- Licencia: aunque la base es Apache-2.0, la extension DeepHat anade restricciones de uso adicionales que deben revisarse antes de cualquier despliegue comercial.
- Contexto: la ventana de 131.072 tokens solo funciona con YaRN configurado manualmente; con la configuracion por defecto el limite real es 32.768 tokens.
- Funcionalidades: no se documenta soporte verificado de tool calling, function calling ni razonamiento multi-paso para agentes.
- Datos de entrenamiento: no se publica informacion sobre el dataset de ajuste, lo que dificulta evaluar sesgos especificos.
- Garantia: el modelo se ofrece "as is", sin garantias de comerciabilidad ni idoneidad para un proposito concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DeepHat/DeepHat-V1-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B/
- Sitio web del autor: https://www.deephat.ai/
- Plataforma Kindo.ai: https://www.kindo.ai/
- Comunidad en Discord: https://discord.gg/8Ynkrcbk92
- Pagina en Ollama: https://ollama.com/DeepHat/DeepHat-V1-7B
- Despliegue en Featherless AI: https://featherless.ai/models/DeepHat/DeepHat-V1-7B
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/deephat-v1-7b-deephat
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Repositorio espejo en HuggingFace: https://huggingface.co/faceNony/DeepHat-V1-7B
