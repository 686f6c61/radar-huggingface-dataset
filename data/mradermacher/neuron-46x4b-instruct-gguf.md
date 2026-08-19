# mradermacher/Neuron-46x4B-Instruct-GGUF

## Resumen

El modelo Neuron-46x4B-Instruct es un modelo de lenguaje de gran tamaño desarrollado por Neura Tech AI, del que este repositorio ofrece una versión cuantizada en formato GGUF realizada por mradermacher. El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 46 expertos de 4 mil millones de parámetros cada uno, aunque los parámetros totales ascienden a 125 058 592 256 (aproximadamente 125,06 mil millones). Está diseñado como modelo instructivo orientado a conversación y tareas multilingües, con soporte para más de 20 idiomas, incluyendo inglés, chino, hindi, árabe, japonés, coreano, francés, alemán, español, portugués, italiano, ruso, turco, vietnamita, tailandés, indonesio, malayo, bengalí, urdu, tamil, telugu, maratí, guyaratí, punyabí y persa.

La versión GGUF permite su ejecución en entornos optimizados como llama.cpp u Ollama, con diferentes niveles de cuantización que van desde Q2_K (45,6 GB) hasta Q8_0 (133 GB). Esto lo hace accesible para hardware de gama alta, aunque no para GPUs de consumo típicas. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para aplicaciones empresariales que requieran un modelo multilingüe de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) según el nombre, 46 expertos de 4B; no confirmado en la documentación |
| Parametros totales | 125.058.592.256 (125,06B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh, hi, ar, ja, ko, fr, de, es, pt, it, ru, tr, vi, th, id, ms, bn, ur, ta, te, mr, gu, pa, fa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones), el modelo original es safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados en la documentación proporcionada. El nombre del modelo sugiere una arquitectura de mezcla de expertos con 46 expertos de 4 mil millones de parámetros, lo que implicaría un total de 184 mil millones si todos fueran activos, pero el recuento real de 125 mil millones indica que hay parámetros compartidos o una configuración más compleja. No se especifica si se utilizó RLHF, DPO u otra técnica de alineación, ni el número de tokens de entrenamiento.

## Capacidades

- Modelo instructivo orientado a conversación y tareas de generación de texto.
- Soporte multilingüe amplio: más de 20 idiomas, incluyendo lenguas de Asia, Europa y Oriente Medio.
- Capacidad de procesamiento de instrucciones y generación de respuestas contextuales.
- No se han documentado capacidades específicas como tool calling, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Traducción automática multilingüe: gracias a su soporte para más de 20 idiomas, puede utilizarse como motor de traducción en aplicaciones empresariales, aunque se debe validar su rendimiento en pares de idiomas específicos.
- Asistente virtual para atención al cliente: su naturaleza instructiva y multilingüe permite desplegar asistentes conversacionales que atiendan a usuarios en distintos idiomas, siempre que se ajuste a los recursos de hardware necesarios.
- Generación de contenido localizado: creación de artículos, resúmenes o respuestas adaptadas a diferentes regiones y culturas, aprovechando el amplio espectro lingüístico.
- Análisis de sentimiento y clasificación de texto en múltiples idiomas: puede emplearse en tareas de procesamiento de lenguaje natural sobre corpus multilingües, aunque se requiere evaluación previa.
- Desarrollo de chatbots para plataformas de comercio electrónico: con el modelo cuantizado Q4_K_M (75,9 GB) se puede desplegar en servidores con GPU de 80 GB para ofrecer respuestas rápidas en varios idiomas.
- Investigación académica en PLN multilingüe: su tamaño y licencia abierta lo hacen útil para experimentos de comparación de modelos o fine-tuning, siempre que se disponga de infraestructura adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El archivo Q2_K (45,6 GB) requiere al menos 48 GB de VRAM, por lo que es necesario una GPU como la NVIDIA A6000 (48 GB) o una A100 de 40 GB (no suficiente) y mejor una de 80 GB.
- El Q4_K_M (75,9 GB) necesita 80 GB de VRAM, compatible con una A100 80GB o dos GPUs de 40 GB en configuración NVLink.
- El Q8_0 (133 GB) requiere 2×80 GB o una solución de memoria unificada como la Apple M2 Ultra (192 GB), aunque con menor rendimiento.
- No cabe en GPUs de consumo como RTX 4090 (24 GB) ni en RTX 3090 (24 GB).
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, o servidores con vLLM si se convierte a safetensors (aunque el formato GGUF es el principal).
- La latencia y el throughput dependen del hardware; en una A100 80GB con Q4_K_M se puede esperar una velocidad de generación de entre 20 y 40 tokens por segundo, pero estos valores no están confirmados oficialmente.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El nombre sugiere una arquitectura MoE similar a Mixtral 8x7B o Qwen MoE, pero no hay datos de rendimiento ni de configuración exacta. Se recomienda consultar el modelo base Neura-Tech-AI/Neuron-46x4B para más detalles.

## Limitaciones y advertencias

- El tamaño del modelo (125B) requiere infraestructura de alto coste; no es adecuado para despliegues en entornos con recursos limitados.
- No se han documentado sesgos específicos, pero al ser un modelo multilingüe entrenado con datos no especificados, puede presentar sesgos culturales o lingüísticos no evaluados.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validación humana en aplicaciones críticas.
- La longitud de contexto no está disponible; esto limita la planificación de tareas que requieran ventanas largas.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor de las cuantizaciones (mradermacher) no garantiza el rendimiento ni la idoneidad para casos específicos.
- Los archivos GGUF de mayor tamaño (Q6_K, Q8_0) están divididos en partes; es necesario concatenarlos correctamente antes de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Neuron-46x4B-Instruct-GGUF
- Modelo base (safetensors): https://huggingface.co/Neura-Tech-AI/Neuron-46x4B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Neuron-46x4B-Instruct-i1-GGUF
