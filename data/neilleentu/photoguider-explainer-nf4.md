# NeilLeeNTU/PhotoGuider-explainer-nf4

## Resumen

PhotoGuider-explainer-nf4 es una versión cuantizada a 4 bits (NF4) del checkpoint base del explicador del sistema PhotoGuider, un proyecto de investigación desarrollado por NeilLeeNTU (Universidad de Taiwán) orientado a la composición fotográfica automática y a la selección de dirección en panoramas de 360 grados. El modelo parte de Qwen/Qwen2.5-VL-7B-Instruct (revisión `cc594898137f460bfe9f0759e9844b3ce807cfb5`) y aplica una única cuantización con bitsandbytes a 4 bits NF4, con `bnb_4bit_compute_dtype=bfloat16` y `llm_int8_skip_modules=["visual", "lm_head"]`, manteniendo el módulo visual y la cabeza de lenguaje en mayor precisión.

El propósito principal de este repositorio no es ofrecer un modelo autónomo, sino servir como artefacto de carga rápida para PhotoGuider: al cargar estos pesos se leen 6 GB en lugar de cuantizar en cada arranque el checkpoint bf16 de 16 GB, y las explicaciones generadas son idénticas token a token. Sobre estos pesos se aplica posteriormente el adaptador LoRA publicado por el proyecto, que no está incluido en este repositorio, y se decodifica de forma greedy.

Es relevante ahora porque reduce el coste de despliegue del explicador de PhotoGuider en entornos con VRAM limitada, manteniendo el comportamiento del modelo original. Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados propios y sin datos de entrenamiento incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (Qwen2.5-VL), cuantizado a 4 bits NF4 con bitsandbytes |
| Parametros totales | 8.292.166.656 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-VL-7B-Instruct; no confirmada en esta ficha) |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes), `bnb_4bit_compute_dtype=bfloat16`, `llm_int8_skip_modules=["visual", "lm_head"]` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 6.2 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen2.5-VL-7B-Instruct, un transformer multimodal de tipo visión-lenguaje que procesa pares imagen-texto y genera texto. La cuantización se aplica una sola vez con bitsandbytes a 4 bits NF4, dejando el módulo visual y la cabeza de lenguaje (`lm_head`) fuera de la cuantización de 8 bits mediante `llm_int8_skip_modules`. El resultado son pesos de 6.2 GB que, al cargarse, evitan repetir la cuantización del checkpoint bf16 de 16 GB en cada arranque.

Este repositorio no contiene adaptador LoRA ni datos de entrenamiento. El adaptador del explicador de PhotoGuider se distribuye por separado (script `tools/download_explainer.sh` del repositorio del proyecto) y se aplica sobre estos pesos, con decodificación greedy. Según la model card, las explicaciones generadas son idénticas token a token a las del flujo que cuantiza el checkpoint bf16 en cada carga. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, con soporte para entrada de imagen y texto y salida conversacional.
- Explicaciones de composición fotográfica: el explicador de PhotoGuider está ajustado para generar explicaciones relacionadas con la composición, condicionadas a imágenes y a evaluaciones de tokens medidas.
- Selección de dirección en panoramas de 360 grados y encuadre refinado: el sistema PhotoGuider combina selección explícita de dirección basada en composición con encuadre refinado y salida de parámetros de cámara para re-renderizado nativo.
- Conversación multi-turno: etiqueta `conversational` en el repositorio.
- Capacidades heredadas de Qwen2.5-VL-7B-Instruct: no detalladas en la información proporcionada; deben consultarse en la model card del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Explicación automática de composición fotográfica: el modelo recibe una imagen y genera una explicación en lenguaje natural sobre su composición, útil en herramientas de asistencia fotográfica o educación visual; es el caso de uso central del explicador de PhotoGuider.
- Asistencia en encuadre y recorte: integrado en el pipeline de PhotoGuider, el explicador acompaña a la selección de recortes y al encuadre refinado, justificando las decisiones de composición al usuario.
- Selección de dirección en panoramas de 360 grados: en el flujo completo de PhotoGuider, el explicador describe por qué se elige una dirección concreta en una panorámica, con salida de parámetros de cámara para re-renderizado nativo.
- Despliegue en entornos con VRAM limitada: al leer 6 GB en lugar de cuantizar 16 GB en cada arranque, es adecuado para servicios o demos que cargan el modelo con frecuencia y necesitan tiempos de arranque reducidos.
- Reproducibilidad de investigación: permite reproducir las explicaciones del paper de PhotoGuider token a token sin repetir la cuantización, útil para validar resultados y comparar con la demo de Hugging Face Space.
- Integración en aplicaciones conversacionales sobre imágenes: gracias a la etiqueta `conversational` y al pipeline `image-text-to-text`, puede usarse como base para diálogos guiados por imagen una vez aplicado el adaptador correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6.2 GB en disco; la carga de pesos en 4 bits NF4 requiere del orden de 6 GB solo para pesos, más overhead de activaciones y del módulo visual en bf16, por lo que se recomienda al menos 8-12 GB de VRAM (estimación, no confirmada en la información proporcionada).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo con 12-16 GB o más, aunque no se confirma.
- Cabe en consumer GPU: probable en GPUs con suficiente VRAM (por ejemplo, gama de 12-16 GB), pero no confirmado en la información disponible.
- Opciones de despliegue: transformers con bitsandbytes (configuración declarada); compatible con endpoints según la etiqueta `endpoints_compatible`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhotoGuider-explainer-nf4 | 8.292.166.656 | No disponible | 4-bit NF4 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B (clase) | No disponible en esta ficha | bf16 original | No disponible en esta ficha | Hugging Face (modelo base) |
| PhotoGuider explainer (bf16, flujo original) | 7B (clase) | No disponible | bf16, cuantizado en cada carga | Apache 2.0 (heredada) | Repositorio del proyecto y Space |

La comparación se limita al modelo base y al flujo bf16 del mismo proyecto, ya que no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el adaptador LoRA del explicador de PhotoGuider para el comportamiento esperado; sin él, el repositorio contiene solo los pesos base cuantizados.
- No contiene datos de entrenamiento ni adaptador; la model card, licencia y términos de uso aceptable del modelo base se aplican sin cambios.
- Riesgo de alucinación: inherente a los modelos de lenguaje y visión-lenguaje; no se documentan evaluaciones específicas en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto o idioma: no disponibles; los idiomas soportados no se especifican.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse los términos del modelo base Qwen2.5-VL-7B-Instruct.
- Caveat de producción: el modelo se validó con decodificación greedy y una configuración de cuantización concreta; cambiar la configuración puede alterar las salidas. El Space de Hugging Face usa bf16 y sus resultados son cercanos pero no idénticos a los del paper.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente.

## Enlaces

- Hugging Face: https://huggingface.co/NeilLeeNTU/PhotoGuider-explainer-nf4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio del proyecto: https://github.com/NTUneillee/PhotoGuider
- Demo en Hugging Face Space: https://huggingface.co/spaces/NeilLeeNTU/PhotoGuider
- Resumen del paper: https://www.emergentmind.com/papers/2611.02897
