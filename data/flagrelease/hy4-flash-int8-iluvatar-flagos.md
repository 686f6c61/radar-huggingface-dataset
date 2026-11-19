# FlagRelease/Hy4-flash-INT8-iluvatar-FlagOS

## Resumen

Hy4 Flash es un modelo multimodal de tipo texto-imagen a texto desarrollado por Tencent Hunyuan y publicado en abierto bajo licencia Apache 2.0. La variante documentada aquí, `FlagRelease/Hy4-flash-INT8-iluvatar-FlagOS`, es una adaptación cuantizada a INT8 (W8A8) realizada por la comunidad FlagOS (BAAI) para su ejecución sobre aceleradores Iluvatar CoreX BI-V150, como parte de una adaptación multi-chip el mismo día del lanzamiento que cubre nueve fabricantes de silicio.

El modelo cuenta con aproximadamente 220.000 millones de parámetros totales, de los cuales unos 64.000 millones corresponden a parámetros Engram, y activa alrededor de 12.000 millones por token. Emplea una arquitectura híbrida que combina atención comprimida y dispersa, Latent MoE y Engram, con una longitud de contexto máxima de un millón de tokens y una huella de KV Cache reducida a una sexta parte de la de Hy4. Está orientado a cargas de trabajo de oficina: búsqueda profunda, procesamiento de documentos, generación de presentaciones y Computer Use.

Su relevancia actual reside en dos frentes: por un lado, ofrece capacidades multimodales y de contexto extremadamente largo con un coste por token bajo gracias a la activación dispersa; por otro, la integración con FlagOS 2.2 demuestra portabilidad real entre stacks de hardware, con incrementos de throughput de hasta el 35,9 % y reducciones de latencia al primer token de hasta el 29,1 % frente al stack nativo de NVIDIA sobre H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 42 capas, hidden size 3072, Latent MoE con 512 expertos y top-16, atención híbrida (12 capas compressed-sparse + 30 capas SWA-512), Engram en capas 2/12/22/32 |
| Parametros totales | 220.251.201.958 (~220 B, incluyendo ~64 B Engram) |
| Parametros activos | ~12 B por token |
| Longitud de contexto | 1.000.000 tokens (máximo) |
| Tipos de cuantizacion | INT8 W8A8 (compressed-tensors); pesos publicados como W8A8 sin MTP |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (148 shards, 268,6 GiB); repo de 288,6 GB |

## Arquitectura y entrenamiento

Hy4 Flash es un transformer de 42 capas con un diseño de atención híbrida: 12 capas de atención comprimida y dispersa (compressed-sparse) y 30 capas de atención de ventana deslizante de 512 tokens (SWA-512). La componente MoE es de tipo Latent MoE, con 512 expertos, selección top-16 y una dimensión latente de 1536, lo que permite activar solo ~12 B de parámetros por token sobre un total de ~220 B. Adicionalmente incorpora capas Engram en las posiciones 2, 12, 22 y 32, con una tabla anclada en CPU y mapeada mediante UVA, que aporta ~64 B de parámetros orientados a memoria de conocimiento.

La variante publicada es una cuantización INT8 W8A8 sin MTP (multi-token prediction), empaquetada con `compressed-tensors` y distribuida en 148 shards safetensors. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esa información no está disponible en la documentación proporcionada. La innovación destacable en despliegue es la integración con FlagOS 2.2 y FlagGems, que permite ejecutar el mismo modelo sobre NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, T-Head, TsingMicro e Iluvatar CoreX con un stack vLLM 0.32 unificado.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto e imagen y produce texto.
- Procesamiento de documentos: diseñado explícitamente para cargas de trabajo de document processing.
- Búsqueda profunda (deep search): orientado a tareas de recuperación y síntesis sobre contexto largo.
- Generación de presentaciones (PPT generation): caso de uso declarado por el autor para escenarios de oficina.
- Computer Use: soporte para interacción con entornos de escritorio y automatización de tareas.
- Contexto de un millón de tokens: adecuado para documentos extensos y conversaciones multi-turno muy largas.
- Capacidades multilingües limitadas a chino e inglés según la model card.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo thinking; estos extremos deben considerarse no disponibles.

## Casos de uso

- Procesamiento de documentos corporativos: el modelo puede ingerir contratos, informes o expedientes completos de hasta un millón de tokens en una sola pasada, evitando estrategias de chunking y recuperación fragmentada, gracias a su ventana de contexto y a la reducción de KV Cache a una sexta parte de Hy4.
- Búsqueda profunda sobre corpus internos: combinado con un pipeline de recuperación, puede sintetizar respuestas a partir de grandes volúmenes de documentación en chino e inglés, aprovechando la activación dispersa (~12 B por token) para mantener costes bajos por consulta.
- Generación automática de presentaciones: a partir de un brief o de documentación fuente, el modelo puede estructurar y redactar el contenido de diapositivas, un caso de uso declarado explícitamente por Tencent Hunyuan para escenarios de oficina.
- Automatización de escritorio (Computer Use): integrado en un agente que controla interfaces gráficas, puede ejecutar tareas repetitivas de ofimática, rellenado de formularios o navegación guiada.
- Atención al cliente multilingüe zh/en: con contexto largo, puede mantener conversaciones multi-turno con historial extenso y documentación de producto adjunta sin perder coherencia.
- Análisis de imágenes en flujos documentales: al aceptar entrada de imagen, puede extraer información de capturas, escaneos o diagramas dentro de un mismo pipeline multimodal de texto.
- Despliegue en infraestructura no NVIDIA: la variante FlagOS-Iluvatar permite ejecutar el modelo en clústeres con aceleradores Iluvatar CoreX BI-V150, útil en entornos con restricciones de suministro o requisitos de soberanía tecnológica.

## Benchmarks y rendimiento

| Benchmark | HY4-flash-Nvidia-Origin | HY4-flash-Iluvatar-FlagOS |
|---|---|---|
| Math-500 | 96 | En evaluación |
| GPQA_Diamond | 92,42 | En evaluación |
| mmbench | 92,6 | En evaluación |
| mmstar | 80,93 | En evaluación |
| WorkIndex (interno Tencent Hunyuan) | Hy4 Flash: 42,1 / Hy4 Preview: 39,7 | No disponible |

Los resultados de la columna FlagOS-Iluvatar figuraban como "Evaluating" en la model card en el momento de la consulta. La model card reporta además mejoras del stack FlagOS 2.2 sobre H100 frente al stack nativo de NVIDIA: hasta un 35,9 % más de throughput de salida y hasta un 29,1 % menos de latencia al primer token.

## Requisitos de hardware

- VRAM estimada: los pesos en INT8 ocupan 268,6 GiB (148 shards), por lo que la inferencia requiere al menos ~270 GiB de memoria agregada, más espacio para KV Cache y activaciones.
- Configuración de referencia documentada: 16 × Iluvatar CoreX BI-V150 de 32 GiB cada una (512 GiB totales), con tensor paralelo 16 y expert paralelo 16 (`tp16ep`).
- GPU NVIDIA: no se documenta una configuración mínima concreta; por volumen de pesos, se requieren múltiples H100/A100 (por ejemplo, 4 × H100 80 GB como mínimo teórico para pesos, sin margen para KV Cache).
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 5090, etc.) por el tamaño de los pesos en INT8.
- Opciones de despliegue: vLLM 0.32 con `vllm-plugin-FL`, FlagGems 5.3.4 y FlagGems-vllm 0.3.0 sobre CoreX 4.5.0; imagen Docker preconstruida `harbor.baai.ac.cn/flagrelease-public/hy4-flash-iluvatar-bi-v150-...:20261119-tp16ep`. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo para esta variante; solo los porcentajes relativos de mejora del stack FlagOS frente al nativo.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hy4 Flash (esta ficha) | ~220 B / ~12 B | 1.000.000 | Apache 2.0 | Multimodal texto-imagen, Latent MoE + Engram, variante INT8 para Iluvatar |
| Hy4 Preview | No disponible | No disponible | No disponible | Versión previa; WorkIndex 39,7 frente a 42,1 de Hy4 Flash |
| Hy4 (modelo base previo) | No disponible | No disponible | No disponible | Referencia de KV Cache: Hy4 Flash usa una sexta parte |

No se dispone en la información proporcionada de datos suficientes sobre otros modelos comparables de la misma categoría (tamaño, contexto y multimodalidad) para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- Idiomas: la model card solo declara chino e inglés; el rendimiento en castellano u otras lenguas no está garantizado ni documentado.
- Sesgos: no se documentan análisis de sesgo ni evaluaciones de seguridad en la información disponible.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad; en tareas de búsqueda profunda y síntesis documental conviene verificar las salidas.
- Cuantización INT8 W8A8: puede introducir degradación respecto a los pesos originales en precisión; la model card no reporta comparativas de calidad entre la versión INT8 y la de referencia.
- Ausencia de MTP: esta variante está empaquetada sin multi-token prediction, lo que puede reducir el throughput frente a versiones con MTP.
- Benchmarks incompletos: la columna FlagOS-Iluvatar figura como "Evaluating"; no hay resultados validados de esta variante concreta.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros (vLLM, FlagGems, CoreX) incluidos en la imagen de despliegue.
- Dependencia de hardware específico: la imagen está construida para Iluvatar BI-V150 con CoreX 4.5.0; el montaje de librerías de usuario del host es un requisito documentado y añade complejidad operativa.
- Tool calling y agentes: no se documenta soporte explícito de function calling, lo que limita su uso directo en pipelines de agentes sin capas adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-iluvatar-FlagOS
- Repositorio de la comunidad FlagOS (BAAI): no disponible en la información proporcionada
- Paper de Hy4 Flash: no disponible en la información proporcionada
- Blog de Tencent Hunyuan sobre Hy4 Flash: no disponible en la información proporcionada
- Documentación de FlagGems: no disponible en la información proporcionada
- Documentación de vLLM: no disponible en la información proporcionada
