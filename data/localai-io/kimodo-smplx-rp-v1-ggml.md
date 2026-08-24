# LocalAI-io/Kimodo-SMPLX-RP-v1-GGML

## Resumen

Kimodo-SMPLX-RP-v1-GGML es una conversión nativa a formato GGML/GGUF en precisión F32 del modelo de difusión de movimiento condicionado por texto y restricciones `nvidia/Kimodo-SMPLX-RP-v1`, desarrollado por NVIDIA. Este modelo genera secuencias de movimiento humano en el espacio SMPL-X de 22 articulaciones, incluyendo rotaciones locales y traslaciones de raíz, a partir de un prompt textual o de una incrustación LLM2Vec precomputada. La conversión ha sido realizada por el proyecto kimodo.cpp, que porta el modelo original a C++/GGML para permitir su ejecución en CPU o mediante Vulkan, sin depender de la pila de inferencia propietaria de NVIDIA.

El repositorio contiene únicamente el modelo de difusión; el codificador de texto, derivado de Llama-3, se distribuye por separado como `Llama-3-Kimodo-GGML`. Con 282,7 millones de parámetros y un tamaño de repositorio de 1,1 GB, esta versión es especialmente relevante para desarrolladores e investigadores que necesitan generar movimiento humano sintético en entornos sin GPU NVIDIA o con recursos limitados, manteniendo la fidelidad del modelo original. Su licencia restringe el uso a investigación no comercial, lo que condiciona su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de movimiento cinemático (kinematic motion diffusion model) con codificador de texto separado (Llama-3 derivado) |
| Parametros totales | 282.790.715 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el texto se procesa mediante un codificador externo) |
| Tipos de cuantizacion | F32 (conversión nativa GGML/GGUF) |
| Idiomas soportados | No disponible (el modelo original no especifica idiomas; presumiblemente inglés, pero no confirmado) |
| Licencia | NVIDIA Internal Scientific Research and Development Model License (uso no comercial) |
| Formato de pesos | GGUF (GGML) |

## Arquitectura y entrenamiento

El modelo es un modelo de difusión de movimiento que opera sobre representaciones SMPL-X de 22 articulaciones. Acepta dos tipos de entrada: un prompt de texto UTF-8 o una incrustación LLM2Vec precomputada. En el primer caso, el texto se procesa mediante un codificador de texto basado en Llama-3, que se distribuye como un artefacto separado (`Llama-3-Kimodo-GGML`). El modelo de difusión genera rotaciones locales y traslaciones de raíz para cada articulación, produciendo secuencias de movimiento completas.

La conversión a GGML/GGUF ha sido realizada por el proyecto kimodo.cpp, que porta el modelo original de NVIDIA a C++/GGML. Esta conversión mantiene la precisión F32 y no introduce cuantización adicional. No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada; estos datos no están disponibles en la información consultada.

## Capacidades

- Generación de movimiento humano en formato SMPL-X (22 articulaciones) a partir de texto descriptivo o de restricciones.
- Acepta prompts UTF-8 o incrustaciones LLM2Vec precomputadas, lo que permite integrar representaciones semánticas externas.
- Produce rotaciones locales y traslaciones de raíz, adecuadas para animación de personajes y robótica humanoide.
- Ejecución en CPU o mediante Vulkan, sin necesidad de GPU NVIDIA específica.
- El codificador de texto (Llama-3) se puede ajustar en cuanto al uso de VRAM mediante la variable `KIMODO_TEXT_LAYER_CHUNK` (de 1 a 32 capas por trozo).
- No es un modelo de lenguaje: no genera texto, solo movimiento.

## Casos de uso

- Animación de personajes para videojuegos: el modelo puede generar secuencias de movimiento realistas a partir de descripciones textuales, acelerando el pipeline de animación procedural en motores como Unity o Unreal.
- Generación de datos de captura de movimiento sintéticos: permite crear datasets de movimiento etiquetados para entrenar otros modelos de visión o robótica, sin necesidad de equipos de mocap físicos.
- Robótica humanoide: las salidas SMPL-X pueden servir como referencias de trayectorias para planificadores de movimiento en robots bípedos o manipuladores.
- Realidad virtual y aumentada: generación de avatares animados que responden a comandos de voz o texto en tiempo real, mejorando la inmersión en entornos virtuales.
- Investigación en biomecánica: estudio de patrones de movimiento generados por el modelo para analizar variaciones en la marcha o posturas, siempre dentro del ámbito de investigación no comercial.
- Prototipado rápido en producción audiovisual: los animadores pueden esbozar escenas de movimiento mediante texto antes de refinar manualmente, reduciendo el tiempo de preproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que este modelo no es un modelo de lenguaje generalista. Tampoco se han encontrado comparativas cuantitativas con otros modelos de generación de movimiento en las fuentes consultadas.

## Requisitos de hardware

- El modelo de difusión en F32 ocupa aproximadamente 1,1 GB, por lo que cabe en la mayoría de GPUs de consumo con al menos 2 GB de VRAM, e incluso puede ejecutarse en CPU.
- El codificador de texto (Llama-3) se distribuye por separado y puede requerir más memoria; su uso de VRAM se puede ajustar mediante `KIMODO_TEXT_LAYER_CHUNK` (por defecto 8 capas por trozo Vulkan).
- Ejecución soportada en CPU (sin GPU) y en GPUs con soporte Vulkan (AMD, Intel, NVIDIA).
- Opciones de despliegue: kimodo.cpp (CLI), que permite cargar el modelo y generar movimientos. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un LLM.
- Latencia y throughput: no disponibles en la documentación consultada; dependerán del hardware y de la configuración del codificador de texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (generación de movimiento SMPL-X condicionada por texto) dentro de las fuentes consultadas. No se puede ofrecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Licencia restringida a uso no comercial: el modelo está sujeto a la NVIDIA Internal Scientific Research and Development Model License, lo que impide su utilización en productos o servicios comerciales.
- El repositorio solo contiene el modelo de difusión; el codificador de texto debe descargarse e instalarse por separado, lo que añade complejidad al despliegue.
- No se especifican los idiomas soportados; es probable que el modelo esté entrenado principalmente con texto en inglés, aunque no se confirma.
- Al ser un modelo de difusión, puede generar movimientos no realistas o físicamente imposibles en algunos casos, especialmente con prompts ambiguos o fuera de distribución.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de movimiento humanos, podría reflejar sesgos de género, edad o etnia presentes en los datos de entrenamiento.
- La conversión GGML/GGUF no añade derechos adicionales sobre el modelo original; cualquier uso debe cumplir con la licencia de NVIDIA.

## Enlaces

- [HuggingFace: LocalAI-io/Kimodo-SMPLX-RP-v1-GGML](https://huggingface.co/LocalAI-io/Kimodo-SMPLX-RP-v1-GGML)
- [HuggingFace: LocalAI-io/Llama-3-Kimodo-SMPLX-RP-v1-GGUF (codificador de texto)](https://huggingface.co/LocalAI-io/Llama-3-Kimodo-SMPLX-RP-v1-GGUF)
- [GitHub: localai-org/kimodo.cpp](https://github.com/localai-org/kimodo.cpp)
- [GitHub: nv-tlabs/kimodo (implementación oficial)](https://github.com/nv-tlabs/kimodo)
- [HuggingFace: nvidia/Kimodo-SMPLX-RP-v1 (modelo original)](https://huggingface.co/nvidia/Kimodo-SMPLX-RP-v1)
- [Documentación de NVIDIA sobre Kimodo-SMPLX](https://research.nvidia.com/labs/sil/projects/kimodo/docs/getting_started/installation_smpl.html)
