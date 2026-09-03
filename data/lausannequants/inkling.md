# lausannequants/Inkling

## Resumen

Inkling es un modelo multimodal de código abierto desarrollado por Thinking Machines Lab, la compañía fundada por Mira Murati. Se trata de un transformer decoder-only con arquitectura de mezcla de expertos (MoE) que acepta entradas de texto, imagen y audio, y genera salidas de texto. Con 975 mil millones de parámetros totales y 41 mil millones activos, está diseñado para aplicaciones de agentes, tool use, asistentes de codificación, chatbots y sistemas de retrieval-augmented generation. Su relevancia radica en ser uno de los modelos abiertos más grandes con capacidades multimodales nativas, liberado bajo licencia Apache 2.0, lo que permite uso comercial y fine-tuning por parte de la comunidad.

El modelo emplea una arquitectura de 66 capas con atención híbrida local y global, y un backbone MoE donde cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en cada token. Las imágenes y el vídeo se codifican mediante un codificador de parches jerárquico, mientras que el audio se procesa mediante codificación discreta de tokens, proyectando todas las modalidades en un espacio oculto compartido. Inkling está disponible en formatos BF16 y NVFP4, y puede desplegarse localmente con SGLang, vLLM, TokenSpeed, Unsloth o HuggingFace Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (66 capas, 256 expertos, 6 activos + 2 compartidos) |
| Parametros totales | 975B (según model card; 952B según safetensors) |
| Parametros activos | 41B |
| Longitud de contexto | no disponible (fuentes externas indican 1M) |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés y multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo decoder-only con una arquitectura MoE dispersa. La red consta de 66 capas, donde cada token se enruta a 6 de 256 expertos en el feed-forward, más 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida, combinando capas de atención local y global para equilibrar eficiencia y capacidad de modelado de dependencias de largo alcance. El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador de parches jerárquico, y el audio mediante tokens discretos, proyectándose todas las modalidades en un espacio oculto compartido que el decoder procesa de forma conjunta.

Los datos de entrenamiento incluyen una amplia variedad de contenidos: texto, imágenes, audio y vídeo, procedentes de fuentes públicas, adquisiciones de terceros y datos sintéticos. El proceso de curado incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o avanzar objetivos de seguridad. No se especifican detalles sobre el número exacto de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, aunque la model card menciona que el modelo está diseñado para seguir instrucciones y uso conversacional.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen, audio y vídeo, y produce salidas de texto en UTF-8.
- Razonamiento y matemáticas: obtiene un 97.1% en AIME 2026 y un 87.2% en GPQA Diamond, lo que indica un alto nivel en tareas de razonamiento complejo.
- Codificación y agentes: alcanza un 77.6% en SWEBench Verified y un 54.3% en SWEBench Pro, demostrando capacidad para resolver tareas de ingeniería de software reales.
- Tool calling y function calling: soporta integración con herramientas, como se refleja en la mejora de HLE con herramientas (46.0% frente a 29.7% sin ellas).
- Capacidades multilingües: aunque el inglés es el idioma principal, el modelo tiene capacidades generales en otros idiomas.
- Procesamiento de audio: acepta audio WAV a 16 kHz, con una duración recomendada inferior a 20 minutos.
- Procesamiento de imagen y vídeo: acepta imágenes en cualquier formato de píxeles (idealmente entre 40px y 4096px por dimensión) y vídeo codificado mediante el codificador jerárquico.

## Casos de uso

- Asistentes de codificación en producción: gracias a su soporte de tool calling y su rendimiento en SWEBench, Inkling puede integrarse en pipelines de CI/CD para generar, revisar y depurar código, así como para automatizar tareas de mantenimiento de repositorios.
- Agentes autónomos multimodales: el modelo puede procesar capturas de pantalla, documentos escaneados o audio de reuniones, y ejecutar acciones basadas en instrucciones de alto nivel, como gestionar correos electrónicos o actualizar tickets de soporte.
- Chatbots conversacionales con contexto largo: aunque la longitud de contexto no está confirmada oficialmente, fuentes externas indican 1M tokens, lo que permitiría mantener conversaciones extensas con memoria de interacciones previas.
- Sistemas de retrieval-augmented generation (RAG): el modelo puede combinar texto, imágenes y audio recuperados de bases de datos para generar respuestas enriquecidas, útil en asistentes de documentación técnica o atención al cliente.
- Análisis de contenido multimedia: puede transcribir y resumir audio, describir imágenes o vídeos, y extraer información estructurada de documentos visuales, como facturas o formularios.
- Automatización de tareas de oficina: con su capacidad de tool calling, puede interactuar con APIs de calendarios, hojas de cálculo o sistemas CRM para programar reuniones, actualizar registros o generar informes.

## Benchmarks y rendimiento

Los resultados de Inkling se reportan con effort=0.99. La comparación se generó el 14 de julio de 2026. Los modelos de pesos abiertos son Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro; los de pesos cerrados son Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |
| SWEBench Pro (Public) | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | 55.4% | 54.2% | 80.0% | 6 (dato incompleto) |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización BF16, se necesitan aproximadamente 1.95 TB de memoria para cargar los 975B parámetros. Con NVFP4, se reduce a unos 0.5 TB. En la práctica, los frameworks cargan todos los pesos, aunque solo se activen 41B por token.
- GPU recomendadas: se requieren múltiples GPUs de alta gama, como NVIDIA A100 80GB o H100. Para BF16, se necesitarían al menos 24 A100 80GB; para NVFP4, 8 A100 80GB serían suficientes.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño total de los pesos.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers. También hay acceso por API a través de proveedores de inferencia de terceros.
- Latencia y throughput: no se han publicado datos específicos. Dado el tamaño y la arquitectura MoE, se espera un throughput razonable para tareas de generación, pero dependerá del hardware y la configuración.

## Comparativa con modelos similares

Inkling se compara con otros modelos abiertos de gran tamaño como Nemotron 3 Ultra, Kimi K2.5 y DeepSeek V4 Pro. En la tabla de benchmarks se observa que Inkling supera a Nemotron 3 Ultra en la mayoría de las métricas, pero queda por detrás de Kimi K2.6 y GLM 5.2 en razonamiento puro. En tareas de codificación agéntica, su rendimiento es competitivo, aunque Claude Fable 5 (cerrado) lo supera ampliamente. La licencia Apache 2.0 es una ventaja frente a otros modelos con restricciones.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | HLE (text only) | AIME 2026 | SWEBench Verified |
|---|---|---|---|---|---|---|---|
| Inkling | 975B | 41B | no disponible | Apache 2.0 | 29.7% | 97.1% | 77.6% |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | no disponible | 26.6% | 94.2% | 70.7% |
| Kimi K2.5 | no disponible | no disponible | no disponible | no disponible | 29.4% | 95.8% | 76.8% |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | no disponible | 35.9% | 96.7% | 80.6% |

## Limitaciones y advertencias

- No se han publicado limitaciones específicas en la model card, pero como modelo de gran tamaño, existe riesgo de alucinación en tareas de generación libre, especialmente en dominios especializados.
- El modelo está optimizado para inglés; su rendimiento en otros idiomas puede ser inferior, aunque se indica capacidad multilingüe general.
- La longitud de contexto no está confirmada oficialmente; fuentes externas indican 1M tokens, pero se recomienda verificar antes de usarlo en producción con contextos muy largos.
- El entrenamiento incluye datos filtrados por seguridad, pero no se detallan los sesgos potenciales. Se recomienda evaluar el modelo en casos de uso específicos antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la política de uso aceptable de Thinking Machines Lab (enlace en la model card) para cumplir con las restricciones adicionales.
- El tamaño del modelo (975B) implica costes de inferencia significativos; no es adecuado para despliegues en dispositivos de bajo consumo.

## Enlaces

- HuggingFace (repo de lausannequants): https://huggingface.co/lausannequants/Inkling
- HuggingFace (repo original BF16): https://huggingface.co/thinkingmachines/Inkling
- HuggingFace (versión NVFP4): https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Página oficial del modelo: https://thinkingmachines.ai/inkling/
- Model card oficial: https://thinkingmachines.ai/model-card/inkling/
- Playground: https://tinker.thinkingmachines.ai/playground
- Repositorio Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace: https://hf.co/blog/thinkingmachines-inkling
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
