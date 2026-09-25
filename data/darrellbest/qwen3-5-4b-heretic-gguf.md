# darrellbest/Qwen3.5-4B-Heretic-GGUF

## Resumen

darrellbest/Qwen3.5-4B-Heretic-GGUF es una colección de pesos en formato GGUF derivada de darrellbest/Qwen3.5-4B-Heretic, que a su vez es Qwen/Qwen3.5-4B con el comportamiento de rechazo eliminado mediante la herramienta Heretic con Arbitrary-Rank Ablation (ARA) aplicada sobre los pesos completos. El modelo base es un transformer denso multimodal de la familia Qwen3.5, desarrollada por el equipo Qwen (Alibaba), con 4.326.350.848 parámetros y pipeline image-text-to-text.

La build GGUF incluye cuatro ficheros: BF16 sin pérdida, Q8_0, Q4_K_M y un proyector de visión (mmproj) en F16. Esto permite ejecutar un modelo multimodal de 4B con llama.cpp u Ollama en hardware de consumo, incluyendo entrada de imagen si se carga el proyector junto al modelo principal. La abliteración reportada baja de 99/100 a 6/100 respuestas de rechazo ante un conjunto de 100 prompts, con una divergencia KL de 0.0220 respecto al modelo original.

Su relevancia actual es doble: por un lado, ofrece una vía práctica de despliegue local de un modelo multimodal pequeño sin rechazos; por otro, sirve como material de estudio sobre técnicas de ablación de direcciones de rechazo y sobre el impacto de la cuantización en la calidad del razonamiento, dado que el autor publica verificaciones comparativas entre cuantizaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base Qwen3.5-4B |
| Parámetros totales | 4.326.350.848 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | BF16 (sin pérdida), Q8_0, Q4_K_M; proyector de visión mmproj en F16 |
| Idiomas soportados | No disponible (la model card no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio base usa safetensors bf16 |
| Tamaño de los ficheros | BF16 8.67 GB; Q8_0 4.61 GB; Q4_K_M 2.78 GB; mmproj F16 0.67 GB |
| Tamaño del repositorio | 16.7 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | darrellbest/Qwen3.5-4B-Heretic (relación: quantized) |
| Fecha de creación / actualización | 2026-09-25 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso multimodal de la serie Qwen3.5, orientado a equilibrar calidad de razonamiento y coste de inferencia. La variante Heretic añade un proceso de abliteración con Arbitrary-Rank Ablation (ARA) sobre los pesos completos, ejecutado con la herramienta Heretic, que reduce las respuestas de rechazo de 99/100 a 6/100 manteniendo una divergencia KL de 0.0220 frente al modelo original. Se trata de una modificación post-entrenamiento del comportamiento, no de un reentrenamiento.

La conversión a GGUF se hizo desde los safetensors en bf16 con `convert_hf_to_gguf.py` de llama.cpp y la cuantización con `llama-quantize`, sin imatrix. El encoder de visión se distribuye por separado en el fichero mmproj, que debe cargarse junto a cualquiera de las tres cuantizaciones para habilitar la entrada de imágenes. El modelo incorpora modo thinking activado por defecto, desactivable por petición mediante `chat_template_kwargs` (`enable_thinking: false`) en llama.cpp o `think: false` en Ollama, y requiere `--jinja` para que se aplique correctamente la plantilla de chat.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional (etiqueta conversational y endpoints_compatible).
- Razonamiento en modo thinking activado por defecto; puede desactivarse por petición.
- Razonamiento aritmético y resolución de problemas de palabras: en las pruebas del autor, 39/40 en BF16 y 40/40 en Q8_0 y Q4_K_M con cuatro problemas por diez semillas, y 17 × 23 = 391 correcto en Ollama con thinking desactivado.
- Entrada de imágenes mediante el proyector mmproj en F16; en la verificación del autor describió correctamente una imagen de prueba con un círculo rojo y un cuadrado azul.
- Capacidad multimodal image-text-to-text declarada en el pipeline.
- Comportamiento sin rechazos (abliterated/uncensored): 6 respuestas de rechazo ante 100 prompts.
- Compatibilidad con llama.cpp (`llama-server`), Ollama y, en los repositorios hermanos en safetensors, con transformers, vLLM y SGLang.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información disponible, más allá del modo thinking.
- Capacidades multilingües: no disponible (la model card no enumera idiomas).

## Casos de uso

- Investigación sobre alineación y comportamiento de rechazo: el modelo permite medir y comparar la tasa de rechazos (6/100 frente a 99/100 del original) y la divergencia KL asociada a la ablación, útil para estudiar técnicas de modificación de guardarraíles.
- Despliegue de asistente conversacional local en equipos modestos: con Q4_K_M (2.78 GB) más el mmproj (0.67 GB) cabe en GPUs de 6-8 GB y permite conversaciones multi-turno con llama-server u Ollama sin dependencia de la nube.
- Descripción y análisis de imágenes en local: cargando el mmproj F16 junto al modelo, se pueden generar descripciones o clasificaciones de imágenes sin enviar datos a terceros; el autor verificó esta capacidad con una imagen de prueba.
- Generación y revisión de código en flujos de desarrollo: el modelo base pertenece a una familia orientada a chat, código y análisis, por lo que puede integrarse en tareas de autocompletado o revisión locales; no hay soporte de tool calling documentado que permita automatizaciones más avanzadas.
- Red teaming y evaluación de robustez de sistemas: al carecer prácticamente de rechazos, resulta adecuado para generar prompts adversarios y probar los filtros de otras capas de seguridad de una aplicación.
- Tutoría y resolución de problemas matemáticos paso a paso: el modo thinking, con muestreo recomendado por Qwen, permite obtener cadenas de razonamiento completas para problemas aritméticos y de palabras, con tasas de finalización correcta de 39/40 a 40/40 en las pruebas del autor.
- Validación de canalizaciones de cuantización: el autor verificó en `llama-server` y en Ollama que BF16 y Q8_0 reproducen la salida palabra por palabra, lo que permite usar estos ficheros como referencia en pruebas de calidad de cuantizaciones.
- Despliegue en servidores con vLLM o SGLang: usando el repositorio hermano en safetensors bf16 (9.35 GB) o la variante FP8 W8A8 (6.79 GB) para mayor throughput en GPU de centro de datos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Prueba | Configuración | Resultado |
|---|---|---|
| Rechazos ante 100 prompts | Modelo abliterado (Heretic, ARA) | 6/100 |
| Rechazos ante 100 prompts | Modelo original | 99/100 |
| Divergencia KL respecto al original | Ablación ARA | 0.0220 |
| Razonamiento en modo thinking (4 problemas aritméticos y de palabras × 10 semillas) | BF16 | 39/40 correctos |
| Razonamiento en modo thinking (mismo conjunto) | Q8_0 | 40/40 correctos |
| Razonamiento en modo thinking (mismo conjunto) | Q4_K_M | 40/40 correctos |
| Razonamiento en modo thinking (mismo conjunto) | Modelo original en vLLM | 40/40 correctos |
| Aritmética simple, thinking off | Ollama | 17 × 23 = 391 (correcto) |
| Descripción de imagen de prueba | `llama-server` con mmproj | Correcta (círculo rojo y cuadrado azul) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible. El autor advierte, además, que distintas ejecuciones de Heretic sobre el mismo modelo base producen resultados distintos, por lo que las métricas de abliteración son específicas de cada ejecución.

## Requisitos de hardware

- VRAM estimada a partir del tamaño de los ficheros de pesos (sin contar caché KV ni overhead del runtime):
  - Q4_K_M: 2.78 GB de pesos + 0.67 GB de mmproj ≈ 3.45 GB; en la práctica, alrededor de 4-5 GB con contexto moderado.
  - Q8_0: 4.61 GB + 0.67 GB ≈ 5.28 GB; en la práctica, alrededor de 6-7 GB.
  - BF16: 8.67 GB + 0.67 GB ≈ 9.34 GB; en la práctica, alrededor de 10-12 GB.
- Cabe en GPU de consumo: Q4_K_M en tarjetas de 6-8 GB (por ejemplo RTX 3060, RTX 4060); Q8_0 en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070); BF16 en tarjetas de 12-16 GB o superiores (RTX 4080, RTX 4090).
- GPU de centro de datos (A100, H100) no son necesarias para un modelo de 4B en inferencia individual, pero sí resultan útiles para servir muchas peticiones concurrentes o para las variantes FP8 y NVFP4, esta última limitada a hardware Blackwell.
- Opciones de despliegue: `llama-server` con `-m <quant>.gguf --mmproj Qwen3.5-4B-Heretic-mmproj-F16.gguf --jinja -ngl 99`, y Ollama. Los repositorios hermanos cubren transformers, vLLM y SGLang (bf16), vLLM (FP8 W8A8) y vLLM sobre Blackwell (NVFP4).
- La entrada de imágenes exige cargar el fichero mmproj aparte; sin él, el modelo funciona solo como modelo de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Herramientas | Licencia | Contexto |
|---|---|---|---|---|---|
| darrellbest/Qwen3.5-4B-Heretic-GGUF | GGUF BF16 / Q8_0 / Q4_K_M + mmproj | 8.67 / 4.61 / 2.78 GB + 0.67 GB | llama.cpp, Ollama | Apache 2.0 | No disponible |
| darrellbest/Qwen3.5-4B-Heretic | bf16 safetensors | 9.35 GB | transformers, vLLM, SGLang | Apache 2.0 | No disponible |
| darrellbest/Qwen3.5-4B-Heretic-FP8 | FP8 W8A8, compressed-tensors | 6.79 GB | vLLM | No disponible | No disponible |
| darrellbest/Qwen3.5-4B-Heretic-NVFP4 | NVFP4, compressed-tensors | 5.67 GB | vLLM sobre Blackwell | No disponible | No disponible |
| Qwen/Qwen3.5-4B (modelo original, con rechazos) | safetensors | No disponible | transformers, vLLM | Apache 2.0 (según el enlace de licencia declarado) | No disponible |
| mradermacher/Qwen3.5-4B-heretic-GGUF | GGUF | No disponible | llama.cpp | No disponible | No disponible |
| FadedRedStar/Qwen3.5-4B-heretic-GGUF | GGUF | No disponible | llama.cpp | No disponible | No disponible |

Todas las variantes comparten el mismo modelo base abliterado, por lo que la diferencia principal es el formato, el tamaño y el runtime compatible. No hay datos de rendimiento comparativo entre estas builds más allá de las pruebas de razonamiento del autor.

## Limitaciones y advertencias

- Guardarraíles reducidos por diseño: el propio autor advierte de que el modelo tiene menos mecanismos de seguridad y de que la responsabilidad de su uso recae en el usuario.
- Riesgo de generar contenido dañino, sesgado o inapropiado: la tasa de rechazo baja a 6/100, por lo que no debe desplegarse en aplicaciones orientadas al público sin capas de filtrado adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual, MMLU, HumanEval ni MMMU en la información disponible.
- La abliteración no es determinista: distintas ejecuciones de Heretic sobre el mismo modelo base producen resultados diferentes, de modo que las métricas de este repositorio no son extrapolables a otras builds derivadas.
- Las cuantizaciones se generaron sin imatrix, lo que puede degradar la calidad en el nivel más bajo (Q4_K_M) en comparación con cuantizaciones calibradas; en las pruebas del autor, aun así, Q4_K_M obtuvo 40/40 en el conjunto de razonamiento evaluado.
- La entrada de imágenes requiere cargar el fichero mmproj F16 de forma explícita; sin él, no hay capacidades de visión.
- El modo thinking está activado por defecto y aumenta el consumo de tokens y la latencia; debe desactivarse por petición si no se necesita.
- Es necesario usar `--jinja` en llama.cpp para que la plantilla de chat se aplique correctamente.
- La longitud de contexto y los idiomas soportados no están documentados en la información disponible, lo que dificulta dimensionar despliegues con requisitos de contexto largo o multilingües.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al tratarse de un modelo abliterado conviene revisar las políticas de uso aceptable aplicables al despliegue concreto. La licencia de las variantes FP8 y NVFP4 no está declarada en la información disponible.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-GGUF
- Modelo base abliterado en safetensors: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic
- Variante FP8 W8A8: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-FP8
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Build GGUF alternativa (mradermacher): https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Build GGUF alternativa (FadedRedStar) y README con notas sobre la arquitectura: https://huggingface.co/FadedRedStar/Qwen3.5-4B-heretic-GGUF/blob/main/README.md
- Análisis de la familia Qwen3.5-4B en abliterlitics: https://github.com/dreamfast/abliterlitics-website/blob/master/content/models/qwen3.5-4b/index.md
- Repositorio oficial de la serie Qwen: https://github.com/QwenLM/Qwen3.8
- Ficha de servicio de Qwen 3.5-4B Heretic en Wiro AI: https://wiro.ai/models/qwen/qwen3-5-4b-heretic
