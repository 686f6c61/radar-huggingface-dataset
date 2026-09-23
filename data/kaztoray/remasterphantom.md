# KaztoRay/RemasterPhantom

## Resumen

RemasterPhantom es un ajuste fino mediante LoRA de `meta-llama/Llama-3.2-1B-Instruct`, publicado por el usuario KaztoRay en HuggingFace, orientado exclusivamente a seguridad defensiva: verificación de integridad de firmas de fichero (magic bytes), operación de canarios de cifrado, respuesta a incidentes de ransomware y protección TLS de un componente denominado MASTER CANARY. El modelo actúa como asesor (advisor) de los agentes Sentinel, Canary, Master y Phantom del framework RemasterPhantom, cuyo código se aloja en un repositorio de GitHub. No es un modelo de propósito general: es un especialista de dominio sobre una base pequeña, con licencia apache-2.0 declarada.

Técnicamente se trata de un transformer decoder-only de 1.235.814.400 parámetros (aproximadamente 1,24 mil millones), heredado íntegramente de Llama-3.2-1B-Instruct, sobre el que se ha aplicado LoRA con rango 16 en todas las capas lineales. El entrenamiento declarado consiste en SFT de secuencia completa en bf16, 2 épocas, sobre 5.306 pares sintéticos de instrucción-respuesta (versión v4), una cifra notablemente inferior a las versiones v2 (23.720 pares) y superior a la v3.1 (1.941 pares). El autor reporta mejoras internas significativas frente a versiones previas, especialmente en identificación de cabeceras por formato y en reducción de alucinación ante consultas sobre firmas no registradas.

Su relevancia actual es acotada pero clara: demuestra un patrón de especialización de dominio sobre modelos pequeños (1B-2B) con LoRA y datasets sintéticos curados, y proporciona un ejemplo de modelo defensivo con guardarraíles entrenados que rechazan peticiones de ataque. Con 36 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación en fase temprana, con evaluación propia y no validada de forma externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajustado con LoRA r=16 en todas las capas lineales |
| Parametros totales | 1.235.814.400 (aproximadamente 1,24 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Llama-3.2-1B-Instruct declara 128.000 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (no se anuncia GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible; los datos de entrenamiento y los ejemplos de la model card estan en coreano |
| Licencia | apache-2.0 (declarada para el ajuste; el modelo base tiene su propia licencia de Meta) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,3 GB |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct (entrenado sobre el espejo `unsloth/Llama-3.2-1B-Instruct`) |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 36 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-1B-Instruct sin modificaciones estructurales: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. La intervención se limita al ajuste paramétricamente eficiente mediante LoRA con rango 16 aplicado a todas las capas lineales, entrenado con SFT de secuencia completa en precisión bf16 durante 2 épocas. No se menciona decodificación especulativa, atención lineal, mezcla de expertos ni ninguna otra innovación arquitectónica.

El dato más relevante del proceso de entrenamiento es la composición del dataset: 5.306 pares sintéticos de instrucción-respuesta (v4), sin duplicados según el autor, y con un descenso deliberado del volumen respecto a v2 (-78 % frente a 23.720 pares) y un aumento de 2,7 veces respecto a v3.1 (1.941 pares). Los datos cubren identificación de magic bytes contra una base denominada MAGIC_DB con 59 tipos, drills de variantes (brand de ZIP/RAR/MP4, endianness de TIFF, FAT de Mach-O), procedimientos de verificación de integridad, operación de canarios, playbook «Phantom polybag», protección TLS, guardarraíles de rechazo ante peticiones de ataque y datos de corrección para «admitir desconocimiento» ante firmas no registradas, con juicio de near-miss en hexadecimal. No se documenta RLHF ni DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Generación de texto técnico especializado en seguridad defensiva de ficheros y respuesta a ransomware.
- Identificación de formatos de fichero a partir de cabeceras hexadecimales y firmas (magic bytes), con cobertura declarada de 59 firmas en MAGIC_DB.
- Discriminación de variantes y casos límite: brand de contenedores ZIP/RAR/MP4, orden de bytes (endianness) en TIFF y arquitecturas FAT en Mach-O.
- Explicación de procedimientos de verificación de integridad y operación de canarios de cifrado.
- Asesoría sobre el playbook «Phantom polybag» y sobre protección TLS del componente MASTER CANARY.
- Guardarraíles entrenados: rechazo explícito de peticiones relacionadas con ataque o malware.
- Calibración de honestidad: capacidad entrenada para admitir desconocimiento ante firmas no registradas (con una tasa de alucinación residual del 25 % en la evaluación interna).
- No se documenta soporte de tool calling, function calling, uso agéntico multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Triaje en respuesta a incidentes de ransomware: los agentes del framework RemasterPhantom consultan al modelo para interpretar señales de canario alterado y decidir si el patrón observado corresponde a cifrado no autorizado o a actividad legítima.
- Validación de integridad de ficheros por magic bytes: dado un volcado hexadecimal de cabecera, el modelo identifica el formato real y señala discrepancias con la extensión declarada, integrándose en un pipeline de comprobación previa a la ejecución.
- Clasificación de contenedores ofuscados: útil cuando un atacante renombra un ejecutable o archivo comprimido; el modelo aporta criterio sobre brand de ZIP/RAR, FAT de Mach-O o endianness de TIFF para distinguir un fichero legítimo de uno manipulado.
- Asistencia a analistas SOC de nivel junior: el modelo actúa como referencia operativa para explicar procedimientos de verificación de firmas y de operación de canarios, reduciendo la dependencia de documentación dispersa.
- Filtro de seguridad en la puerta de entrada: como clasificador auxiliar que rechaza peticiones de ayuda para crear o mejorar malware, apoyándose en los guardarraíles entrenados (90 % de rechazo en la evaluación interna de 10 preguntas).
- Generación y mantenimiento de documentación de playbooks: redacción de runbooks de respuesta a incidentes de cifrado a partir de los procedimientos descritos en el corpus de entrenamiento.
- Componente de un sistema multi-agente defensivo: uso como `LLMAdvisor` dentro de la arquitectura Sentinel/Canary/Master/Phantom, donde el modelo no ejecuta acciones sino que emite juicios consultivos ante decisiones críticas.
- Investigación sobre especialización de dominio en modelos pequeños: servir de caso de estudio reproducible sobre cómo un dataset sintético reducido y muy curado puede desplazar el comportamiento de un modelo de 1B hacia una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta únicamente una evaluación interna propia (`scripts/evaluate.py`, 105 preguntas) comparando la versión v4 con la v3.1:

| Categoria | v3.1 | v4 |
|---|---|---|
| Conocimiento de firmas (59 preguntas) | 86,4 % | 93,2 % |
| Identificacion cabecera a formato (20 preguntas) | 95,0 % | 90,0 % |
| Rechazo por guardarrail (10 preguntas) | 90,0 % | 90,0 % |
| Respuesta honesta ante consulta no registrada (16 preguntas) | 75,0 % | 75,0 % |
| Total (excluyendo consultas no registradas) | 88,8 % | 92,1 % |

El autor indica además, respecto a v1 y v2 (5.880 y 23.720 ejemplos), una mejora en identificación de cabeceras del 30 % al 90 % y una reducción de la alucinación ante consultas no registradas del 100 % al 25 %. Estas cifras proceden del propio autor, sobre un conjunto de evaluación propio y no auditado de forma independiente; no equivalen a benchmarks de referencia y no permiten comparación directa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir del recuento de parámetros, no publicados por el autor): aproximadamente 2,5 GB en bf16/fp16, en torno a 1,3 GB en int8 y entre 0,7 y 0,9 GB en cuantización de 4 bits, más la memoria de la caché KV.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de portátil con 6 GB o más. También es viable la inferencia en CPU.
- GPU profesionales como A100 o H100 no son necesarias para inferencia individual; solo tendrían sentido para servir muchas peticiones concurrentes o para reentrenar el ajuste.
- Opciones de despliegue: transformers con PEFT para cargar adaptadores LoRA, vLLM o TGI para servicio con concurrencia, y llama.cpp u Ollama si se convierte previamente a GGUF. El repositorio no publica pesos GGUF, por lo que esa ruta requiere conversión propia.
- El repositorio ocupa 9,3 GB, una cifra muy superior al peso teórico de los parámetros en bf16 (unos 2,5 GB), lo que sugiere la presencia de múltiples checkpoints o artefactos adicionales; conviene inspeccionar los ficheros antes de desplegar.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre otros LLM comparables de seguridad defensiva con los que contrastar parámetros, contexto o rendimiento. La única referencia disponible es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RemasterPhantom (v4) | 1,24 B | No disponible (base: 128.000 tokens) | 92,1 % en evaluacion interna de 105 preguntas (excluyendo no registradas) | apache-2.0 declarada | HuggingFace, 36 descargas |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | No comparable con la evaluacion interna del ajuste | Licencia comunitaria de Meta Llama 3.2 | HuggingFace, ampliamente desplegado |
| Alternativas de seguridad defensiva | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: fuera del ámbito de firmas de fichero, canarios y respuesta a ransomware, su conocimiento general es el del modelo base de 1B, con la capacidad limitada que eso implica.
- Riesgo de alucinación medido internamente en un 25 % de las 16 preguntas sobre firmas no registradas; es decir, ante una firma desconocida todavía puede inventar una respuesta en una de cada cuatro consultas.
- Los guardarraíles rechazan peticiones de ataque, lo que puede producir falsos positivos en consultas legítimas de análisis forense o de investigación de malware que rocen el ámbito ofensivo.
- Idiomas soportados no documentados. Los datos de entrenamiento y los ejemplos de la model card están en coreano, por lo que el rendimiento en castellano no está verificado y previsiblemente será inferior al del dominio original.
- La evaluación reportada es interna, con 105 preguntas elaboradas por el propio autor, sin validación independiente ni comparación con benchmarks públicos.
- La licencia declarada es apache-2.0, pero el modelo deriva de Llama-3.2-1B-Instruct, sujeto a la licencia comunitaria de Meta Llama 3.2. Antes de un uso comercial conviene verificar la compatibilidad efectiva de ambas licencias.
- Discrepancia de identificación: la página de HuggingFace figura bajo el autor `KaztoRay`, mientras que la model card y el código de ejemplo referencian el repositorio `k4zt0/RemasterPhantom`. Conviene confirmar cuál es el canal oficial de mantenimiento.
- El repositorio no incluye pesos cuantizados, pipeline declarado ni idiomas declarados en los metadatos, lo que complica su integración directa en herramientas que dependen de esos campos.
- Las fechas de creación y actualización indicadas en los metadatos (septiembre de 2026) son posteriores a la fecha habitual de consulta; verificar la vigencia real del artefacto.
- Uso en producción: al ser un modelo asesor de 1B con 36 descargas y sin pruebas externas, cualquier despliegue debería ir acompañado de validación propia y de un mecanismo humano en el bucle para decisiones críticas.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/KaztoRay/RemasterPhantom
- Repositorio del framework RemasterPhantom: https://github.com/k4zt0/RemasterPhantom
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Espejo no restringido utilizado en el entrenamiento: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Referencia alternativa citada en el codigo de ejemplo: https://huggingface.co/k4zt0/RemasterPhantom

Nota: los resultados de la busqueda web proporcionados (paginas de Zhihu sobre videojuegos, subtitulos y tarjetas graficas) no contienen ningun enlace relevante al modelo, a su paper ni a evaluaciones independientes.
