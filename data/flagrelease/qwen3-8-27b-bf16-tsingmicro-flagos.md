# FlagRelease/Qwen3.8-27B-BF16-tsingmicro-FlagOS

## Resumen

Qwen3.8-27B-BF16-tsingmicro-FlagOS es una adaptación del modelo Qwen3.8-27B de Alibaba, publicada por la comunidad FlagOS con soporte específico para el chip Tsingmicro. Forma parte de la iniciativa Day0 de FlagOS, que busca ofrecer despliegue inmediato de modelos open source sobre múltiples arquitecturas de aceleradores. Este modelo concreto está optimizado para el chip Tsingmicro, aunque la misma familia cubre otros diez aceleradores, incluyendo NVIDIA, Huawei Ascend, Moore Threads, Metax, Kunlunxin, Hygon, Tianshu Zhixin, Enflame y Alibaba T-Head.

El modelo base Qwen3.8-27B es un modelo denso híbrido de tipo GDN (vision-language) con 27.781 millones de parámetros, que soporta entrada multimodal y razonamiento. Esta versión FlagOS proporciona pesos en BF16, scripts de inferencia preconfigurados y una imagen de contenedor Docker lista para usar, con el objetivo de reducir el tiempo de despliegue a minutos. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este lanzamiento radica en la estandarización del despliegue de modelos Qwen sobre hardware alternativo a NVIDIA, un paso importante para la soberanía tecnológica y la reducción de costes en entornos de producción que no dependen exclusivamente de GPUs de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (híbrida densa GDN, vision-language) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | 204.800 tokens (configuración vLLM recomendada) |
| Tipos de cuantizacion | BF16 (esta versión); FP8 e INT8 disponibles en otras variantes FlagOS |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida densa GDN (probablemente una combinación de atención densa con mecanismos de visión), diseñada para tareas de razonamiento multimodal. La variante FlagOS utiliza la arquitectura declarada como `Qwen3_5MoeForCausalLM` en la sobreescritura de HuggingFace, lo que sugiere que el modelo base incorpora componentes de mezcla de expertos (MoE) dentro de su diseño híbrido. El checkpoint incluye soporte para multi-token prediction (MTP) integrado en el propio modelo, lo que acelera la decodificación especulativa.

La comunidad FlagOS ha realizado un trabajo de adaptación multiplataforma que incluye alineación de precisión y verificación de despliegue sobre el stack de software unificado FlagOS. Este proceso garantiza que los resultados de inferencia en chips alternativos sean consistentes con los obtenidos en la pila nativa de NVIDIA. Los datos de entrenamiento del modelo base no se han publicado en la información disponible; se sabe que Alibaba ha entrenado la familia Qwen3.8 con un enfoque en codificación, trabajo de oficina, investigación y tareas de horizonte largo.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo acepta entradas de imagen y texto, lo que permite tareas de comprensión visual y respuesta a preguntas sobre imágenes.
- Razonamiento avanzado: incluye un parser de razonamiento `qwen3` en la configuración de vLLM, lo que indica soporte para cadenas de pensamiento y modos de razonamiento explícito.
- Tool calling y function calling: la configuración recomendada activa `--enable-auto-tool-choice` con el parser `qwen3_xml`, lo que permite al modelo seleccionar y llamar herramientas externas de forma autónoma.
- Soporte para agentes: la combinación de tool calling, razonamiento multi-paso y contexto largo (204.800 tokens) habilita la construcción de agentes autónomos que pueden planificar y ejecutar tareas complejas.
- Multilingüe limitado: soporta chino e inglés, con posible degradación en otros idiomas.
- Despliegue distribuido: preparado para inferencia multi-nodo y multi-GPU con tensor parallelism, pipeline parallelism y expert parallelism.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar capturas de pantalla, documentos escaneados o imágenes de productos junto con texto, gestionando conversaciones de soporte con contexto largo (hasta 204.800 tokens) para mantener el historial completo de la interacción.
- Generación de código asistida por imagen: un desarrollador puede proporcionar un diagrama de arquitectura o un mockup de interfaz y el modelo genera el código correspondiente, integrando tool calling para ejecutar pruebas o consultar documentación.
- Análisis de documentos técnicos: con su ventana de contexto amplia, puede resumir y extraer información de manuales extensos, informes de investigación o especificaciones técnicas de cientos de páginas.
- Agente de automatización de oficina: combinando tool calling y razonamiento multi-paso, puede orquestar flujos de trabajo que involucran calendarios, correos electrónicos y hojas de cálculo, tomando decisiones basadas en el contenido de los documentos.
- Investigación académica asistida: el modelo puede analizar figuras y tablas de artículos científicos, responder preguntas sobre metodología y ayudar a redactar secciones de papers, manteniendo el contexto de múltiples fuentes.
- Despliegue en entornos con hardware alternativo: organizaciones que utilizan aceleradores Tsingmicro (u otros chips soportados por FlagOS) pueden ejecutar un modelo de última generación sin depender de GPUs NVIDIA, reduciendo costes y dependencias.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación comparando la pila nativa de NVIDIA con la pila FlagOS sobre el mismo hardware NVIDIA:

| Metrica | Qwen3.8-27B-Nvidia-Origin | Qwen3.8-27B-Nvidia-FlagOS |
|---|---|---|
| GPQA_Diamond | 88,89 | 89,9 |
| MUSR | 71,96 | 69,05 |

Estos resultados indican que la pila FlagOS mantiene un rendimiento prácticamente equivalente al nativo, con una ligera mejora en GPQA_Diamond y una pequeña degradación en MUSR. No se han publicado benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 de 27.781 millones de parámetros ocupan aproximadamente 55,6 GB, por lo que se requiere al menos 64 GB de VRAM para inferencia en BF16 sin cuantización adicional.
- GPU recomendadas: la configuración de despliegue de la model card utiliza 8 nodos con tensor-parallel-size 16 y pipeline-parallel-size 4, lo que implica un total de 64 GPUs. Sin embargo, según la documentación de SGLang, el modelo base Qwen3.8-27B puede ejecutarse en una sola GPU H200 (141 GB), RTX PRO 6000 o RTX 5090.
- Compatibilidad con consumer GPUs: no es viable en GPUs de consumo convencionales (RTX 4090 con 24 GB) sin cuantización agresiva; con cuantización INT8 o FP8 podría ser posible en GPUs de 48 GB.
- Opciones de despliegue: vLLM (recomendado en la model card), SGLang, y posiblemente llama.cpp u Ollama si se publican pesos GGUF.
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (FlagOS) | 27,78B | 204.800 | Híbrida GDN + MoE | Apache 2.0 | HuggingFace, ModelScope |
| Qwen3-30B-A3B (referencia) | 30B total, 3B activos | 32.768 | MoE | Apache 2.0 | HuggingFace |
| Qwen2.5-32B | 32,8B | 131.072 | Densa | Apache 2.0 | HuggingFace |

La comparativa se basa en modelos de la misma familia Qwen con tamaño similar. Qwen3.8-27B destaca por su contexto mucho más largo (204.800 tokens) y su naturaleza multimodal, mientras que Qwen3-30B-A3B es un MoE más eficiente en inferencia. Qwen2.5-32B es una alternativa densa con buen rendimiento pero sin capacidades multimodales.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información específica sobre sesgos; como modelo entrenado principalmente con datos en chino e inglés, puede presentar sesgos culturales y lingüísticos de esos dominios.
- Riesgo de alucinación: no se han publicado tasas de alucinación específicas; como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: solo soporta chino e inglés de forma fiable; el rendimiento en otros idiomas puede ser significativamente inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia del modelo base Qwen3.8 de Alibaba.
- Requisitos de despliegue: la configuración recomendada requiere 8 nodos con 64 GPUs, lo que limita su uso a entornos con infraestructura de gran escala; el despliegue en un solo nodo requiere GPUs de alta gama con al menos 80 GB de VRAM.
- Dependencia del stack FlagOS: el rendimiento verificado se ha validado con la pila de software FlagOS; el uso con otras pilas puede requerir ajustes adicionales.
- Fecha de creación: el modelo se publicó en agosto de 2026, por lo que es relativamente reciente y puede tener problemas no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlagRelease/Qwen3.8-27B-BF16-tsingmicro-FlagOS
- Variante FP8 para Enflame: https://huggingface.co/FlagRelease/Qwen3.8-2.4T-A95B-FP8-enflame-FlagOS
- Variante FP8 para Moore Threads: https://huggingface.co/FlagRelease/Qwen3.8-2.4T-A95B-FP8-mthreads-FlagOS
- Documentación de despliegue con SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Repositorio FlagOS en GitHub: https://github.com/flagos-ai/FlagRelease
- Información sobre Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
