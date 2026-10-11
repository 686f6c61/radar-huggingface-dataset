# hamzagaming2026/GYTO-AI-E

## Resumen

GYTO-AI-E es un modelo de lenguaje de 3.397.103.616 parámetros (≈3,4 B) publicado en HuggingFace por el usuario `hamzagaming2026`. No es un entrenamiento desde cero ni un fine-tuning: es el resultado de una fusión de pesos (*merge*) de dos modelos instruct ya existentes de la familia Qwen2.5 mediante la técnica de interpolación lineal implementada por mergekit. Los dos progenitores son Qwen2.5-Coder-3B-Instruct, al que se le asigna un peso de 0,6, y Qwen2.5-3B-Instruct, con un peso de 0,4.

El objetivo declarado por el autor, según los comentarios en árabe incluidos en la configuración YAML de la model card, es combinar la capacidad de código y razonamiento lógico del modelo Coder con la estabilidad conversacional y el multilingüismo del modelo generalista. La fusión se realizó en precisión bfloat16 y el repositorio ocupa 6,8 GB. El modelo conserva la arquitectura, el tokenizador y la ventana de contexto de los Qwen2.5-3B originales, por lo que todo lo que cambia es la distribución de pesos.

Su relevancia práctica es limitada pero concreta: es un experimento reproducible de *model souping* sobre una base pequeña y de licencia permisiva (Apache-2.0 en ambos progenitores), lo que lo hace desplegable en hardware de consumo. No hay métricas publicadas, descargas ni validación externa, y la model card no documenta licencia propia ni idiomas, por lo que debe tratarse como un artefacto experimental no evaluado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), heredada de los modelos base |
| Parámetros totales | 3.397.103.616 (≈3,4 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; los Qwen2.5-3B declaran 32.768 tokens nativos, ampliables a 128.000 con YaRN |
| Tipos de cuantización | No disponibles en el repositorio; pesos en bfloat16 convertibles a GGUF, AWQ o GPTQ con herramientas estándar |
| Idiomas soportados | No disponibles en la model card; los modelos base Qwen2.5 declaran soporte de 29 idiomas, incluido el español |
| Licencia | No disponible en el repositorio (los dos modelos base son Apache-2.0) |
| Formato de pesos | safetensors en bfloat16 (tamaño del repositorio: 6,8 GB) |

Nota: los datos de arquitectura y contexto no aparecen documentados en la model card de GYTO-AI-E; se indican a partir de las especificaciones públicas de los modelos base, que la fusión lineal no modifica.

## Arquitectura y entrenamiento

GYTO-AI-E no ha sido entrenado. Se ha generado mediante `mergekit` con el método `linear`, que calcula una media ponderada de los tensores de los dos modelos progenitores: `W_gyto = 0,6 · W_Qwen2.5-Coder-3B-Instruct + 0,4 · W_Qwen2.5-3B-Instruct`. Esta técnica corresponde a la línea de *model soups* descrita en el artículo arXiv:2203.05482, referenciado explícitamente en los tags del repositorio. La fusión se hizo en `dtype: bfloat16` y no va seguida de ningún paso de fine-tuning, RLHF o DPO adicional.

Ambos progenitores comparten exactamente la misma arquitectura y tokenizador (Qwen2.5-3B), que es la condición necesaria para que una fusión lineal de pesos sea válida sin reordenación de tensores. Al ser un decoder-only denso, el modelo no incorpora mecanismos de atención lineal, SSM ni decodificación especulativa propia. Tampoco se ha publicado ninguna innovación técnica adicional: el único elemento diferencial es la proporción 60/40 elegida por el autor, que prima las capacidades de código sobre las conversacionales.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del pipeline de Qwen2.5-Instruct.
- Generación y explicación de código en múltiples lenguajes, capacidad reforzada por el peso 0,6 asignado a Qwen2.5-Coder-3B-Instruct.
- Razonamiento matemático y lógico de ámbito moderado, propio de un modelo de 3 B de parámetros.
- Soporte de *tool calling* y *function calling* en el formato de plantilla de chat de Qwen2.5 (no verificado específicamente tras la fusión).
- Capacidades multilingües heredadas de los modelos base, con especial énfasis declarado por el autor en árabe.
- Razonamiento en varios pasos dentro de una misma conversación, limitado por la ventana de contexto de 32.768 tokens.
- No dispone de visión, audio ni modo de razonamiento explícito (*thinking mode*); no se ha publicado ninguna capacidad de este tipo.

## Casos de uso

- Asistente de programación en local: el modelo puede completar funciones, explicar fragmentos de código y proponer refactorizaciones, y sus 3,4 B de parámetros permiten ejecutarlo en una GPU de consumo o incluso en CPU con cuantización de 4 bits.
- Autocompletado y revisión en editores tipo VS Code o Neovim: integrable mediante llama.cpp u Ollama con latencia baja en una única GPU de gama media, sin coste de API.
- Chatbot de atención al cliente en español: la ventana de 32.768 tokens permite mantener conversaciones multi-turno con historial largo, aunque la ausencia de evaluación hace recomendable validar el comportamiento antes de producción.
- Generación de documentación técnica y docstrings: el modelo puede tomar código fuente como entrada y devolver descripciones en lenguaje natural, aprovechando el sesgo hacia código de la fusión.
- Prototipado de agentes con *tool calling*: el soporte de plantilla de herramientas de Qwen2.5 permite conectarlo a funciones externas (APIs, bases de datos) para tareas de varios pasos en entornos de prueba.
- Preprocesado y transformación de textos en pipelines de datos: tareas de resumen, extracción de campos y reformateo que se benefician de un modelo pequeño y desplegable en local.
- Experimentación académica con técnicas de fusión: sirve como caso de estudio reproducible de *model souping* con una configuración YAML pública y dos progenitores conocidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de GYTO-AI-E no incluye ninguna evaluación (MMLU, HumanEval, GSM8K ni equivalentes), y los resultados de búsqueda web obtenidos corresponden a agregadores genéricos de modelos de 2026 que no contienen esta ficha. No es posible estimar el rendimiento del modelo fusionado a partir del de sus progenitores, ya que las fusiones lineales de modelos instruidos pueden degradar capacidades si las distribuciones de pesos divergen.

## Requisitos de hardware

- VRAM estimada en bfloat16 o float16: en torno a 6,8 GB solo para los pesos, más entre 1 y 3 GB de caché KV según la longitud de contexto y el tamaño de lote.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 2-2,5 GB de pesos, cifra no verificada para este repositorio concreto porque no publica versiones cuantizadas.
- GPU recomendadas: una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o cualquier GPU con 8 GB o más puede ejecutar el modelo en bfloat16 sin cuantizar; para despliegue en servidor, A100 o H100 están sobredimensionadas para 3,4 B de parámetros.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM en bfloat16, y en tarjetas de 4-6 GB si se cuantiza a 4 bits. También es viable en CPU con llama.cpp, con velocidades del orden de decenas de tokens por segundo en procesadores modernos.
- Opciones de despliegue: transformers (librería declarada en el repositorio), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM, llama.cpp y Ollama tras convertir los pesos a GGUF. El tag `endpoints_compatible` indica compatibilidad con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición, y el modelo no tiene descargas registradas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GYTO-AI-E | 3,4 B | No documentado (32.768 según base) | No disponible en el repositorio | HuggingFace, 0 descargas | Fusión lineal 60/40 sin evaluar |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (128.000 con YaRN) | Apache-2.0 | HuggingFace, ampliamente desplegado | Modelo base generalista, con evaluación publicada |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente desplegado | Modelo base especializado en código |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, con restricciones de uso | Alternativa de tamaño similar con contexto nativo mayor |

Los datos de contexto y licencia de los tres modelos de comparación proceden de su documentación pública, no de la información proporcionada sobre GYTO-AI-E. No se dispone de ninguna comparación de rendimiento entre ellos y el modelo fusionado.

## Limitaciones y advertencias

- No existe ninguna evaluación publicada del modelo: no hay benchmarks, ni pruebas cualitativas, ni validación por parte de terceros.
- La fusión lineal de dos modelos instruidos con distribuciones de pesos distintas no garantiza que se preserven las capacidades de ambos; es frecuente que se degrade el *tool calling* o la coherencia conversacional.
- La model card no especifica licencia. Aunque ambos progenitores son Apache-2.0, la ausencia de licencia explícita en el repositorio crea incertidumbre legal para uso comercial.
- El repositorio no documenta idiomas soportados, por lo que el comportamiento en español debe validarse empíricamente antes de cualquier despliegue.
- No se han publicado versiones cuantizadas, lo que obliga a convertir los pesos manualmente para desplegar en hardware limitado.
- Riesgo de alucinación inherente a un modelo de 3 B de parámetros, especialmente en tareas de conocimiento factual y razonamiento matemático complejo.
- Cero descargas y cero valoraciones en el momento de redactar esta ficha: no hay evidencia de uso real ni de estabilidad en producción.
- El repositorio tiene un único commit y fue creado y actualizado el mismo día, lo que apunta a un experimento puntual sin mantenimiento posterior.
- Los comentarios de la configuración de fusión están en árabe, lo que sugiere que el autor orientó el modelo a ese idioma, pero no hay ninguna prueba de que la fusión mejore el rendimiento en árabe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hamzagaming2026/GYTO-AI-E
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Artículo de referencia del método de fusión (*model soups*): https://arxiv.org/abs/2203.05482
- Repositorio de mergekit: https://github.com/cg123/mergekit
