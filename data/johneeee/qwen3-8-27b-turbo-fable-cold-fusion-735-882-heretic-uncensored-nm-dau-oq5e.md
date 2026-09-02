# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ5e

## Resumen

Este modelo es una cuantizacion mixta de 5 bits en formato MLX safetensors del fine-tune `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, creado por el usuario Johneeee a partir de un trabajo previo de DavidAU. El modelo base es Qwen3.8-27B, un transformer denso de 27.000 millones de parametros desarrollado por Qwen (Alibaba), con arquitectura hibrida de atencion (48 de 64 capas con atencion lineal), torre de vision, cabeza de decodificacion especulativa MTP y contexto nativo de 262.144 tokens extensible a 1M.

La cuantizacion se realizo con la herramienta oQ (oMLX v0.6.4) en modo de precision mixta, con 5 bits y grupo de 64, lo que reduce el peso del modelo a 19,2 GB. El resultado es un modelo optimizado para ejecucion local en hardware Apple Silicon mediante MLX, manteniendo las capacidades del fine-tune original: instruccion general, razonamiento, analisis, creatividad y generacion de texto sin censura. Su relevancia radica en ofrecer una version compacta y desplegable en entornos con recursos limitados de un modelo de 27B con capacidades avanzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido (atencion lineal en 48 de 64 capas) + torre de vision + cabeza MTP |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M (modelo base) |
| Tipos de cuantizacion | 5 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con atencion hibrida: 48 de sus 64 capas utilizan atencion lineal (probablemente basada en mecanismos tipo linear attention o similar), lo que reduce el coste computacional en contextos largos, mientras que las 16 restantes mantienen atencion full. Incluye una torre de vision para procesamiento multimodal y una cabeza MTP (Multi-Token Prediction) que actua como borrador en decodificacion especulativa, acelerando la generacion. El contexto nativo es de 262.144 tokens, ampliable a 1M mediante tecnicas de extension.

El fine-tune `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` fue desarrollado por DavidAU con contribuciones de Nightmedia y otros ajustes no revelados, orientado a instruccion general, razonamiento, analisis, creatividad y generacion sin censura. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO. La cuantizacion de este repositorio se realizo con oQ (oMLX v0.6.4) en precision mixta de 5 bits, sin informacion adicional sobre el proceso.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, que destaca en tareas de instruccion, analisis y razonamiento paso a paso.
- Codigo: el modelo base tiene competencias en generacion y comprension de codigo, aunque este fine-tune no esta especificamente orientado a ello.
- Matematicas: el modelo base rinde bien en benchmarks matematicos como GSM8K y MathVision, segun la documentacion oficial de Qwen.
- Vision: al incluir torre de vision, el modelo base puede procesar imagenes, aunque no se confirma que esta capacidad se mantenga intacta tras el fine-tune y la cuantizacion.
- Tool calling y function calling: el modelo base soporta estas capacidades, pero no hay confirmacion explicita para este fine-tune.
- Agentes y multi-step reasoning: el modelo base esta disenado para razonamiento multi-paso y uso como agente, con soporte de planificacion.
- Multilingue: el modelo base soporta multiples idiomas, pero no se especifica la lista para este fine-tune.
- Sin censura: el fine-tune esta orientado a generacion sin restricciones, lo que implica menor filtrado de contenido.

## Casos de uso

- Ejecucion local en Mac con Apple Silicon: gracias a la cuantizacion MLX de 5 bits, el modelo cabe en 19,2 GB y puede ejecutarse en Macs con 32 GB o mas de RAM unificada, ideal para prototipado y desarrollo offline.
- Asistente de escritura creativa sin censura: el fine-tune esta disenado para generar texto libre, util en narrativa, guiones o contenido adulto donde los modelos censurados fallan.
- Razonamiento y analisis de documentos largos: con 262K tokens de contexto, puede procesar libros completos, informes extensos o codigo fuente de gran tamano en una sola pasada.
- Desarrollo de agentes conversacionales: el modelo base soporta tool calling y razonamiento multi-paso, permitiendo construir asistentes que interactuan con APIs y ejecutan tareas complejas.
- Generacion de codigo asistida: aunque no es su foco principal, puede usarse para autocompletar o explicar fragmentos de codigo en entornos de desarrollo locales.
- Investigacion academica sobre modelos sin censura: util para estudiar el comportamiento de modelos desalineados y sus riesgos, siempre con salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo cuantizado. El modelo base Qwen3.8-27B reporta puntuaciones en MMLU, GSM8K, HumanEval y otros, pero no se dispone de esos datos en la informacion proporcionada. Un modelo relacionado de DavidAU (NEO-CODER-MAX-MTP-GGUF) menciona puntuaciones ARC-c de 735 y ARC-e de 880 en 8 bits, pero no es este repositorio y no se pueden extrapolar.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 19,2 GB, por lo que se necesita al menos 20 GB de memoria disponible (RAM unificada en Mac o VRAM en GPU).
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4) con 32 GB o mas de RAM unificada. En GPU NVIDIA, se podria usar con 24 GB de VRAM (RTX 3090/4090) si se convierte a otro formato, pero no es el objetivo de este repo.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) si se convierte a GGUF o similar, pero el formato MLX esta pensado para Apple.
- Opciones de despliegue: MLX (nativo), con posibilidad de convertir a GGUF para llama.cpp u Ollama, o a safetensors para vLLM/TGI en GPU NVIDIA.
- Latencia y throughput: no disponible. Se estima una generacion de 20-40 tokens/s en Apple Silicon M2 Ultra con cuantizacion 5 bits, pero sin datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | 262K | FP16 | Apache 2.0 (segun Qwen) | HuggingFace |
| Este modelo (oQ5e) | 26,9B | 262K (heredado) | 5-bit MLX | No disponible | HuggingFace |
| Qwen3.8-27B-TURBO-Fable... (GGUF de DavidAU) | 26,9B | 262K | GGUF 8-bit/4-bit | No disponible | HuggingFace |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia de este fine-tune, lo que impide su uso comercial sin riesgo legal.
- Sesgos y alucinaciones: al ser un modelo sin censura, puede generar contenido ofensivo, incorrecto o alucinado con mayor facilidad que modelos alineados.
- Riesgo de seguridad: la generacion sin filtros puede producir instrucciones peligrosas o contenido ilegal; debe usarse con control de acceso y supervisión humana.
- Capacidades de vision no confirmadas: aunque el modelo base tiene torre de vision, no se verifica que el fine-tune y la cuantizacion mantengan esta funcionalidad.
- Rendimiento degradado por cuantizacion: la cuantizacion de 5 bits puede reducir ligeramente la precision en tareas complejas frente al modelo en FP16.
- Contexto largo con atencion lineal: la atencion lineal puede degradar la calidad en tareas que requieren recuperacion precisa de informacion en contextos muy largos.
- Sin soporte oficial: es un modelo creado por un usuario independiente, sin garantias de mantenimiento ni documentacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ5e
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante GGUF de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
