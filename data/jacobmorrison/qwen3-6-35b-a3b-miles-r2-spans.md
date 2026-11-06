# jacobmorrison/qwen3.6-35b-a3b-miles-r2-spans

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba. Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, construida sobre la arquitectura de la generación anterior Qwen3.5 y orientada explicitamente a flujos de trabajo de programacion agentica y razonamiento a nivel de repositorio. El checkpoint aqui descrito es una publicacion de terceros del usuario `jacobmorrison` que redistribuye los pesos originales bajo licencia Apache 2.0.

El modelo emplea una arquitectura hibrida de mezcla de expertos (MoE) con 35.107 millones de parametros totales y aproximadamente 3.000 millones activos por token, combinando capas de atencion lineal Gated DeltaNet con capas de atencion con compuerta (Gated Attention) en un patron de 10 bloques de repeticion. Dispone de 256 expertos con 8 enrutados mas 1 compartido por capa, y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000.

Su relevancia actual radica en dos innovaciones concretas: mejoras sustanciales en tareas de codigo agentico (frontend y razonamiento sobre repositorios completos) y la denominada "preservacion de pensamiento", que permite retener contexto de razonamiento de mensajes historicos para reducir la sobrecarga en desarrollo iterativo. El checkpoint incluye ademas un codificador de vision, lo que lo habilita para tareas image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM hibrido con vision encoder: Gated DeltaNet (atencion lineal) + Gated Attention, con MoE |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido por capa) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

Otros datos tecnicos: dimension oculta 2048; embedding de tokens 248.320 (con padding); 40 capas; layout oculto 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)); Gated DeltaNet con 32 cabezas lineales para V y 16 para QK, dimension de cabeza 128; Gated Attention con 16 cabezas Q y 2 KV, dimension de cabeza 256, RoPE de 64 dimensiones; MoE con 256 expertos, 8 enrutados + 1 compartido, dimension intermedia de experto 512; salida LM de 248.320 (con padding); entrenado con MTP (multi-token prediction) multi-paso. Tamano del repositorio: 70,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido que intercala capas de atencion lineal Gated DeltaNet con capas de atencion tradicional con compuerta, todo ello envuelto en bloques MoE. El patron de repeticion es de 10 bloques, cada uno compuesto por tres subcapas Gated DeltaNet seguidas de una subcapa Gated Attention, cada una acompanada de su correspondiente capa MoE. Esta combinacion busca reducir el coste computacional del contexto largo (gracias a la atencion lineal) sin renunciar a la calidad de recuperacion de la atencion completa. El modelo incorpora un codificador de vision que lo convierte en un modelo image-text-to-text.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, con MTP (multi-token prediction) entrenado en varios pasos, lo que habilita decodificacion especulativa nativa y acelera la generacion. La model card menciona que la serie Qwen3.6 se construyo a partir de feedback directo de la comunidad y prioriza estabilidad y utilidad practica. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general en modo conversacional multi-turno.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Programacion agentica: manejo de flujos de frontend y razonamiento a nivel de repositorio con mayor fluidez y precision.
- Preservacion de pensamiento (thinking preservation): opcion de retener contexto de razonamiento de mensajes historicos para desarrollo iterativo.
- Razonamiento multi-paso y soporte para agentes.
- Capacidad de contexto largo: hasta 262.144 tokens nativos y hasta 1.010.000 tokens extendidos.
- Compatibilidad con tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el enfoque en codigo agentico lo hace probable.
- Capacidades multilingues: no disponibles en la informacion proporcionada (existe un benchmark SWE-bench Multilingual, lo que sugiere soporte multilingue en codigo).
- Decodificacion especulativa nativa via MTP multi-paso.

## Casos de uso

- Desarrollo de frontend asistido: el modelo puede generar y refactorizar componentes de interfaz con mayor fluidez gracias a las mejoras especificas en flujos de trabajo de frontend reportadas por el autor.
- Razonamiento sobre repositorios completos: con 262.144 tokens de contexto nativo, puede cargar arboles de codigo extensos y razonar sobre dependencias entre ficheros, lo que lo hace adecuado para tareas de SWE-bench Verified y Pro.
- Agentes de codigo autonomos: su orientacion agentica y la preservacion de pensamiento permiten mantener cadenas de razonamiento largas entre iteraciones, reduciendo la sobrecarga de reenviar contexto en cada paso.
- Revision de codigo y deteccion de bugs: el contexto largo y el razonamiento multi-paso permiten analizar pull requests completos y senalar problemas de consistencia.
- Analisis de documentos con imagenes: al ser un modelo image-text-to-text, puede procesar capturas de pantalla, diagramas de arquitectura o documentacion escaneada junto con texto.
- Migracion y refactorizacion multilingue: el rendimiento en SWE-bench Multilingual (67,2) sugiere utilidad en tareas de traduccion o migracion entre lenguajes de programacion.
- Asistentes de terminal y automatizacion de operaciones: el modelo se evalua en Terminal-Bench 2.0, lo que indica capacidad para tareas de linea de comandos y automatizacion de sistemas.

## Benchmarks y rendimiento

Datos de la model card (Qwen3.6-35B-A3B frente a alternativas):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la tabla de la model card original estaba truncada en el momento de la extraccion; los resultados de Terminal-Bench 2.0 y de la seccion de lenguaje general no estan disponibles en la informacion proporcionada. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 70 GB solo para pesos, mas overhead de KV cache y activaciones; requiere multiples GPU.
- Cuantizacion a 8 bits: en torno a 35-40 GB, viable en una A100 80GB o H100 80GB.
- Cuantizacion a 4 bits: en torno a 18-22 GB, potencialmente viable en una RTX 4090 (24 GB) con contexto moderado; el contexto largo requerira tecnicas de offloading o KV cache cuantizada.
- GPU recomendadas: H100 80GB, A100 80GB, multiples RTX 4090 o L40S para precision completa.
- Despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers segun la model card. Soporte de llama.cpp/Ollama: no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura MoE con 3B activos y la decodificacion especulativa via MTP deberian reducir el coste por token frente a un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible |

El modelo se situa por encima de Gemma4-31B y Gemma4-26B-A4B en tareas de codigo agentico, y ligeramente por debajo de Qwen3.5-27B en SWE-bench Verified (73,4 frente a 75,0), aunque supera a Qwen3.5-35B-A3B (70,0) en la misma prueba. Los datos de contexto de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de terceros: este repositorio es una redistribucion por `jacobmorrison`, no la publicacion oficial de Qwen; conviene verificar la integridad de los pesos frente al repositorio original.
- Idiomas soportados no documentados: la model card no detalla la cobertura linguistica, lo que dificulta evaluar su rendimiento fuera del ingles y del codigo.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo o afirmaciones plausibles pero incorrectas, especialmente en contextos muy largos.
- Sesgos conocidos: no documentados en la informacion disponible; se recomienda evaluacion propia antes de uso en produccion.
- Contexto extendido a 1.010.000 tokens: la extension mas alla de los 262.144 nativos puede degradar la calidad y aumentar el coste de memoria; no se especifica la tecnica de extension ni su impacto.
- Licencia Apache 2.0: permite uso comercial, pero el `license_link` apunta a la licencia del modelo original de Qwen, por lo que conviene revisar los terminos del repositorio upstream.
- Sin datos de benchmarks de lenguaje general (MMLU, GSM8K) en la informacion disponible, lo que limita la evaluacion fuera del dominio de codigo.
- El modelo esta fechado en 2026-10-25; verificar que la version de Transformers y de vLLM/SGLang soporta la arquitectura `qwen3_5_moe`.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/jacobmorrison/qwen3.6-35b-a3b-miles-r2-spans
- Blog oficial Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Repositorio original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Qwen Chat: https://chat.qwen.ai
