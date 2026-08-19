# professorf/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-gguf

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un modelo de lenguaje de gran tamano (LLM) desarrollado por NVIDIA, publicado en agosto de 2026. Se trata de la version en precision completa (BF16) de Nemotron 3.5 Lightning, un modelo de arquitectura hibrida Mixture-of-Experts (MoE) que combina capas intercaladas de Mamba-2, capas MoE y capas de atencion selectivas. Con 30.000 millones de parametros totales y solo 3.000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional.

El modelo esta disenado como punto de partida para personalizacion: post-entrenamiento (SFT, RL, destilacion), adaptacion a dominios especificos y creacion de variantes cuantizadas. Destaca por su ventana de contexto de hasta 1 millon de tokens en hardware Blackwell, soporte de decodificacion especulativa DSpark y un modo de razonamiento configurable. Esta disponible bajo la licencia OpenMDW-1.1, que permite uso comercial.

La relevancia de este lanzamiento radica en su arquitectura hibrida SSM-MoE-Attention, que reduce el coste de inferencia frente a modelos densos de tamano similar, y en su publicacion junto a metodos de decodificacion especulativa para acelerar la generacion de texto. El repositorio de profesorF contiene los pesos en formato GGUF, cuantizados a partir de los pesos BF16 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Mamba-2 + MoE + Attention (intercaladas) |
| Parametros totales | 32.913.266.240 (30B declarados) |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens (validado en GB200 y B200); 256K en H100 80GB monogpu |
| Tipos de cuantizacion | BF16 (referencia); GGUF disponible en este repositorio; NVFP4 en lanzamiento oficial |
| Idiomas soportados | Ingles, espanol, frances, aleman, italiano, japones (segun model card); la version base declara 20 idiomas y 43 lenguajes de programacion |
| Licencia | OpenMDW-1.1 (uso comercial permitido) |
| Formato de pesos | safetensors (BF16), GGUF (este repositorio) |

## Arquitectura y entrenamiento

La arquitectura de Nemotron 3.5 Lightning es hibrida: intercala capas Mamba-2 (modelos de espacio de estados), capas de mezcla de expertos (MoE) y capas de atencion selectivas. Este diseno busca combinar la eficiencia de las SSM para secuencias largas con la capacidad de los MoE para escalar parametros sin incrementar el coste por token. El modelo activa 3.000 millones de parametros de un total de 30.000 millones.

Los datos de entrenamiento provienen de los datasets nvidia/nemotron-pre-training-datasets (corte en septiembre de 2025) y nvidia/nemotron-post-training-v3 (corte en mayo de 2026). El modelo incluye un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`). Ademas, se publica con soporte para decodificacion especulativa DSpark, orientada a despliegues de centro de datos con baja concurrencia. Los detalles completos sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Razonamiento configurable: el modo thinking puede activarse o desactivarse via plantilla de chat.
- Manejo de contexto extremadamente largo: hasta 1M tokens en hardware Blackwell (GB200, B200) y 256K en H100 80GB monogpu.
- Soporte de decodificacion especulativa DSpark para acelerar la inferencia en despliegues de baja concurrencia.
- Capacidad de personalizacion: disenado para SFT, RL, destilacion y adaptacion a dominios especificos.
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion disponible, aunque la arquitectura y el proposito de agentes sugieren compatibilidad.
- Capacidades de codigo: la version base se entrena con 43 lenguajes de programacion, aunque no se confirma para esta version instruct.

## Casos de uso

- Agentes conversacionales multilingues: con soporte para seis idiomas y modo de razonamiento configurable, el modelo puede gestionar conversaciones complejas en entornos de atencion al cliente internacional, alternando entre respuestas rapidas y razonamiento profundo segun la dificultad de la consulta.
- Analisis de documentos extensos: su ventana de contexto de hasta 1M tokens permite procesar libros completos, expedientes legales o codigos fuente de repositorios enteros sin necesidad de chunking ni RAG.
- Desarrollo de variantes cuantizadas: los pesos BF16 de referencia son el punto de partida ideal para investigadores que quieran producir sus propias cuantizaciones (GGUF, AWQ, GPTQ) adaptadas a hardware especifico.
- Investigacion en arquitecturas hibridas: la combinacion Mamba-2 + MoE + Attention lo convierte en un objeto de estudio relevante para comparar SSM con transformers puros en tareas de razonamiento y generacion de codigo.
- Despliegue en entornos con restriccion de VRAM: gracias a sus 3B parametros activos, el modelo puede ejecutarse en GPUs de consumo con cuantizacion GGUF, manteniendo una calidad superior a modelos densos de tamano similar.
- Personalizacion para dominios verticales: la licencia permite uso comercial y el modelo esta disenado para post-entrenamiento, lo que facilita su adaptacion a sectores como legal, medico o financiero con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una grafica de precision (accuracy_plot.png) pero no se proporcionan los datos numericos. Se recomienda consultar la documentacion oficial de NVIDIA para obtener resultados comparativos.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 completos requieren aproximadamente 66 GB (32.9B parametros x 2 bytes), por lo que caben en una H100 o A100 de 80GB. Con cuantizacion GGUF de 8 bits se reduce a unos 33 GB; con 4 bits, a unos 17 GB.
- GPU recomendadas: NVIDIA Blackwell (GB200, B200) para contexto completo de 1M; H100 80GB o A100 80GB para 256K de contexto en monogpu; RTX 5090 o DGX Spark para ejecucion local con GGUF.
- En consumer GPU: si, con cuantizacion GGUF de 4 bits cabe en GPUs de 24 GB como la RTX 4090 o RTX 5090, aunque con contexto reducido.
- Opciones de despliegue: vLLM y SGLang para inferencia optimizada; llama.cpp y Ollama para ejecucion local con GGUF; NVIDIA NIM para despliegue en produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa DSpark esta disenada para mejorar el throughput en despliegues de baja concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B A3B | 30B | 3B | 1M | Hibrida Mamba-2 + MoE + Attn | OpenMDW-1.1 |
| Nemotron 3.5 Lightning 30B A3B NVFP4 | 30B | 3B | 1M | Hibrida Mamba-2 + MoE + Attn | OpenMDW-1.1 |
| DeepSeek-V3 (referencia MoE) | 671B | 37B | 128K | MoE densa | MIT |

La comparativa con modelos de la misma categoria (MoE hibridos de ~30B) no esta disponible en la informacion proporcionada. El NVFP4 es la misma arquitectura con cuantizacion optimizada para NVIDIA, mientras que DeepSeek-V3 se incluye como referencia de un MoE denso de mayor escala, aunque con contexto muy inferior.

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos especificos del modelo, pero al ser un modelo multilingue entrenado con datos web, es probable que herede sesgos presentes en dichos datos.
- Riesgo de alucinacion: no se proporcionan datos especificos, pero es un riesgo inherente a todos los LLM, especialmente con contextos muy largos donde puede perder coherencia.
- Limitaciones de contexto: el contexto de 1M tokens solo esta validado en hardware Blackwell (GB200, B200). En H100 monogpu el contexto se reduce a 256K por limitaciones de memoria.
- Restricciones de licencia: OpenMDW-1.1 permite uso comercial, pero es una licencia nueva y especifica; se recomienda revisar los terminos completos antes de su uso en produccion.
- Este repositorio concreto (professorf) es una cuantizacion GGUF realizada por un tercero, no por NVIDIA. Los pesos oficiales de referencia estan en el repositorio de nvidia.
- No se proporcionan datos de benchmarks ni evaluaciones de seguridad en la informacion disponible.
- La fecha de creacion del repositorio (agosto de 2026) es posterior al lanzamiento oficial del modelo, lo que sugiere que es una adaptacion de la comunidad.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/professorf/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-gguf
- Modelo oficial BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Version NVFP4 optimizada: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Version base (sin instruct): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- GGUF oficial de ggml-org: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
