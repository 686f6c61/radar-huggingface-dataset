# RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por NVIDIA y distribuido en Hugging Face a traves del espacio de Red Hat AI (RedHatAI). Se trata de la publicacion en precision completa (BF16) de la familia Nemotron 3.5 Lightning, concebida como pesos de referencia para personalizacion: ajuste fino supervisado, aprendizaje por refuerzo, destilacion, adaptacion de dominio y generacion de variantes cuantizadas o en formato GGUF. Para despliegue en produccion con baja latencia, NVIDIA recomienda su variante NVFP4.

El modelo combina una arquitectura hibrida que intercala capas Mamba-2 con capas de mezcla de expertos y capas de atencion selectivas, con 30.000 millones de parametros totales de los que solo 3.000 millones estan activos por token. Esta relacion de activacion lo situa en la franja de eficiencia de inferencia propia de modelos mucho mas pequenos, manteniendo una ventana de contexto que llega hasta 1 millon de tokens (256.000 en despliegue de una sola GPU) y soporte nativo de tool calling, razonamiento configurable y seis idiomas.

Su relevancia actual radica en tres factores: la licencia OpenMDW-1.1 permite uso comercial, el modelo cabe en una unica GPU H100 o A100 de 80 GB en BF16, y la publicacion incluye recetas de decodificacion especulativa (DSpark) para acelerar la generacion. Red Hat lo ha validado sobre RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0, lo que facilita su adopcion en entornos empresariales gestionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: Mamba-2 + Mixture-of-Experts + capas de atencion selectivas (tipo `nemotron_h`) |
| Parametros totales | 31.577.937.344 (~30B, dato real de safetensors) |
| Parametros activos | ~3B por token |
| Longitud de contexto | Hasta 1M tokens; 256K recomendado en despliegue de una sola GPU |
| Tipos de cuantizacion | BF16 (referencia); NVFP4 y W4A16 disponibles en la variante oficial de NVIDIA |
| Idiomas soportados | Ingles (y lenguajes de programacion), espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW-1.1 (uso comercial permitido) |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

La arquitectura es una pila hibrida que intercala capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos y un subconjunto de capas de atencion clasica. Este diseno busca reducir el coste computacional y de memoria del estado de secuencia frente a un transformer denso con atencion completa, lo que explica la viabilidad de contextos de hasta 1M tokens. El modelo sigue el esquema de expertos dispersos con aproximadamente 3B parametros activos sobre 30B totales, lo que reduce el coste por token en inferencia.

El preentrenamiento utiliza los conjuntos de datos publicados por NVIDIA (`nvidia/nemotron-pre-training-datasets`) con fecha de corte en septiembre de 2025, y el postentrenamiento se apoya en `nvidia/nemotron-post-training-v3` con corte en mayo de 2026. La model card menciona explicitamente el uso de datos de postentrenamiento para alineacion, aunque no detalla en la informacion disponible el volumen exacto de tokens, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Como innovacion destacable, la familia incluye recetas de decodificacion especulativa (DSpark) orientadas a despliegues de centro de datos con baja concurrencia, y el modelo expone un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`).

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 1M tokens teoricos).
- Razonamiento explicito activable o desactivable mediante plantilla de chat (`enable_thinking`).
- Tool calling / function calling nativo, con parser `qwen3_coder` y validado en tareas de tool-calling.
- Soporte de agentes y razonamiento multi-paso, con argumentos de CLI especificos para habilitar la seleccion automatica de herramientas en vLLM (`--enable-auto-tool-choice`).
- Capacidades multilingues en ingles, espanol, frances, aleman, italiano y japones, ademas de lenguajes de programacion.
- Generacion de codigo (mencionada como parte de los idiomas soportados y del parser de tool calling).
- Despliegue en una sola GPU H100 o A100 de 80 GB en BF16.
- Compatibilidad con endpoints estandar (tag `endpoints_compatible`).
- No se documenta en la informacion disponible soporte de vision, audio ni otras modalidades.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historiales extensos gracias a su ventana de hasta 256K tokens en una sola GPU, lo que permite incluir documentacion de producto o historial completo del cliente sin truncar.
- Agentes con tool calling en produccion: al soportar function calling nativo y estar validado en vLLM 0.28.0 con `--enable-auto-tool-choice`, puede integrarse en orquestadores de agentes que invocan APIs, bases de datos o servicios internos.
- Generacion de codigo asistida: su soporte de lenguajes de programacion y su parser `qwen3_coder` lo hacen adecuado para asistentes de codigo integrados en IDE o en pipelines de CI/CD que requieran invocar herramientas de compilacion o test.
- Razonamiento sobre documentos largos: con contexto de hasta 1M tokens, es viable para analisis de contratos, expedientes o corpus normativos completos en una sola pasada, reduciendo la necesidad de tecnicas de retrieval.
- Personalizacion y ajuste fino: al ser la version BF16 de referencia, es el punto de partida natural para SFT, RL o destilacion sobre dominios verticales (legal, sanitario, financiero) antes de cuantizar para produccion.
- Generacion de variantes cuantizadas: los pesos BF16 permiten producir versiones GGUF, NVFP4 o W4A16 propias para despliegue en hardware consumer o en entornos con restricciones de VRAM.
- Investigacion y evaluacion en precision completa: util para reproducir resultados de benchmarks y comparar contra variantes cuantizadas sin el sesgo introducido por la cuantizacion.
- Despliegue empresarial gestionado: validado sobre RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2, encaja en plataformas de inferencia corporativas con soporte de Red Hat.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion de razonamiento que compara el modelo con Qwen 3.6 35B A3B, Gemma 4 26B A4B, Nemotron 3 Nano, Nemotron 3 Super y GPT-OSS 20B. Sin embargo, en la informacion proporcionada la tabla aparece truncada en la fila "Genera", por lo que no se dispone de los valores numericos de ninguna tarea.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 65,8 GB, por lo que se requiere una GPU con al menos 80 GB para cargar los pesos completos con margen para cache KV y estado Mamba.
- GPU recomendadas: 1x H100 80GB o 1x A100 80GB para despliegue en BF16; NVIDIA indica soporte para Blackwell (GB200, GeForce RTX 5090), Hopper (H100, H200) y Ampere (A100).
- Cabe en GPU consumer: no en BF16. La variante NVFP4 o W4A16 de NVIDIA esta pensada para cobertura de hardware mas amplia, incluida la receta DSpark para DGX Spark.
- Opciones de despliegue: vLLM (probado con nightly `vllm/vllm-openai:v0.27.1` y validado en vLLM 0.28.0), con argumentos especificos `--mamba-backend flashinfer`, `--mamba-ssm-cache-dtype float16`, `--enable-mamba-cache-stochastic-rounding` y `--mamba-cache-philox-rounds 5`. Tambien es compatible con transformers y con plataformas RHOAI/RHAIIS.
- Configuracion recomendada de serving: `--max-num-seqs 128`, `--enable-prefix-caching`, `--async-scheduling`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card menciona decodificacion especulativa DSpark para mejorar la generacion en despliegues de baja concurrencia, pero sin cifras concretas.
- Parametros de muestreo recomendados: temperatura 1.0, top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-BF16 | ~30B | ~3B | Hasta 1M (256K en 1 GPU) | OpenMDW-1.1 | Hugging Face (RedHatAI y NVIDIA) |
| Qwen 3.6 35B A3B | 35B | 3B | no disponible | no disponible | no disponible |
| Gemma 4 26B A4B | 26B | 4B | no disponible | no disponible | no disponible |
| GPT-OSS 20B | 20B | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3 Nano | no disponible | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3 Super | no disponible | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables se han extraido de la tabla de benchmarks de la model card. No se dispone en la informacion proporcionada de sus especificaciones detalladas (contexto, licencia, formato) ni de los resultados numericos de la comparacion.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de sesgo; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado tasas de alucinacion ni evaluaciones de fidelidad en la informacion disponible.
- El contexto maximo de 1M tokens se declara para despliegue en una sola H100, pero la configuracion recomendada es de 256K; rendimientos mas alla de esa cifra no estan cuantificados.
- Cobertura linguistica limitada a seis idiomas (en, es, fr, de, it, ja); no se documenta soporte de otros idiomas.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar los terminos completos antes de su adopcion en produccion.
- Es la version BF16 de referencia, no optimizada para latencia; para produccion NVIDIA recomienda explicitamente la variante NVFP4.
- El despliegue requiere argumentos especificos de vLLM para el backend Mamba (`--mamba-backend flashinfer`) y versiones recientes (0.27.1 nightly / 0.28.0); versiones antiguas pueden no ser compatibles.
- El repositorio pesa 65,8 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y carga.
- No se documentan capacidades multimodales (vision, audio) ni se dispone de datos sobre latencia o throughput en la informacion proporcionada.

## Enlaces

- Hugging Face (RedHatAI): https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante NVFP4 oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto completo de la licencia OpenMDW-1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
