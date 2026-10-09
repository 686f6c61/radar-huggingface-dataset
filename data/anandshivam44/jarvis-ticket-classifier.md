# anandshivam44/jarvis-ticket-classifier

## Resumen

Jarvis ticket classifier es un ajuste fino de demostración publicado por el usuario anandshivam44 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata de un experimento de SFT con LoRA cuyo objetivo es convertir tickets de soporte (ficticios) en salidas JSON estructuradas, con un único campo de clasificación por línea. El propio autor lo etiqueta explícitamente como demo y advierte de que no es apto para producción ni para entrenamiento serio.

El modelo tiene 494.032.768 parámetros (0,49 B) y se distribuye en safetensors y GGUF bajo licencia Apache-2.0, lo que lo hace ejecutable en CPU o en cualquier GPU con unos pocos gigabytes de VRAM. Hereda la arquitectura transformer decoder-only de la familia Qwen2 y, por tanto, el tokenizador y el soporte multilingüe del modelo base, aunque el autor no declara idiomas soportados ni longitud de contexto en la ficha.

Su relevancia es limitada y de carácter didáctico: sirve como plantilla mínima para ilustrar un pipeline de SFT + LoRA orientado a clasificación de tickets, no como componente de un sistema real. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y no incluye evaluación cuantitativa alguna. Los resultados de búsqueda web proporcionados no contienen información relacionada con este modelo (versan sobre el texto clásico chino *Shanhaijing*), por lo que se descartan como fuentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada del modelo base) |
| Parametros totales | 494.032.768 (0,49 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor; heredada de Qwen2.5-0.5B-Instruct (no confirmada en este repositorio) |
| Tipos de cuantizacion | GGUF F16 confirmado mediante el comando de Ollama de la model card; safetensors en precisión nativa; no se confirman otras cuantizaciones GGUF |
| Idiomas soportados | no disponible (el autor no los declara; el modelo base es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención por causal, normalización RMSNorm y atención con query-key-value agrupadas (GQA) en su configuración de 0,5 B de parámetros. El autor no publica ningún detalle adicional sobre el backbone en la model card, por lo que la configuración exacta de capas, cabezas y dimensión oculta debe consultarse en la ficha del modelo base, no en este repositorio.

En cuanto al entrenamiento, la ficha describe únicamente un "tiny SFT + LoRA demo": un ajuste supervisado de tamaño reducido con adaptadores LoRA sobre Qwen2.5-0.5B-Instruct, orientado a mapear tickets de soporte ficticios a JSON. No se especifica el número de ejemplos, el número de tokens, la composición del dataset, la duración del entrenamiento, la configuración de LoRA (rango, alpha, módulos objetivo) ni si hubo una etapa posterior de alineación con RLHF o DPO. Tampoco se indica si los adaptadores se fusionaron con los pesos base; el tamaño del repositorio (2,0 GB) es coherente con pesos completos en lugar de solo adaptadores, pero no se confirma en la documentación.

## Capacidades

- Generación de texto conversacional en formato de chat, heredada del modelo base instruct.
- Clasificación de tickets de soporte con salida en JSON, tarea para la que fue ajustado específicamente.
- Respuestas de una sola línea, adecuadas para integración en scripts y llamadas de un solo turno.
- Ejecución local mediante Ollama con la cuantización F16 publicada.
- Compatibilidad declarada con endpoints de inferencia (etiqueta endpoints_compatible).
- Soporte multilingüe potencial heredado de Qwen2.5, aunque el autor no lo documenta ni lo verifica.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.
- La model card advierte de que las respuestas pueden incluir la palabra "Jarvis", un artefacto del ajuste.

## Casos de uso

- Prototipado de pipelines de clasificación: el modelo sirve para validar de extremo a extremo un flujo ticket → JSON antes de invertir en un modelo mayor, con un coste de cómputo mínimo.
- Pruebas de integración de Ollama en un backend: al ejecutarse con una única línea de comando, permite verificar la conectividad, el parseo de la salida y el manejo de errores del cliente sin depender de APIs externas.
- Enseñanza de SFT y LoRA: como ejemplo didáctico de cómo adaptar un modelo de 0,5 B a una tarea de clasificación concreta y publicar el resultado en Hugging Face.
- Maquetación de esquemas JSON: útil para iterar sobre el formato de salida esperado (campos, categorías, tipos) antes de definir el contrato final de una API.
- Generación de datos sintéticos de baja calidad para pruebas unitarias: sus salidas pueden alimentar tests de formateadores y validadores de JSON, siempre con revisión manual.
- Experimentación en hardware muy limitado: al caber en CPU y en GPUs de gama de entrada, permite reproducir el flujo completo de entrenamiento e inferencia en un portátil.
- Evaluación comparativa de metodologías de ajuste: sirve como línea base trivial contra la que medir técnicas de SFT más elaboradas en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de exactitud, F1, tasa de JSON válido ni comparaciones con otros modelos, y tampoco se han encontrado evaluaciones externas en los resultados de búsqueda web proporcionados.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 1,0-1,2 GB solo para pesos, más el caché KV; con contexto moderado, aproximadamente 1,5-2 GB en total (estimación, no confirmada por el autor).
- VRAM estimada en GGUF Q8_0: del orden de 0,5-0,7 GB de pesos.
- VRAM estimada en GGUF Q4_K_M: del orden de 0,3-0,5 GB de pesos.
- El caché KV crece de forma lineal con la longitud de contexto; a 32.768 tokens y con GQA de 2 cabezas KV supondría varios cientos de megabytes adicionales en FP16 (estimación).
- Cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM: GTX 1650, RTX 3050, RTX 4060, RTX 4090, así como en GPUs integradas recientes.
- Funciona en CPU sin GPU, lo que lo hace apto para entornos con recursos muy limitados.
- Opciones de despliegue: Ollama (comando documentado con la etiqueta F16), llama.cpp con los ficheros GGUF, vLLM o TGI para servir los safetensors, y transformers para uso directo en Python.
- Latencia y throughput: no disponibles. No se han publicado mediciones por parte del autor en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jarvis-ticket-classifier | 494 M | no disponible | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-0.5B-Instruct (modelo base) | 494 M | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 362 M | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1 B | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |

Nota: los datos de los modelos comparativos no proceden de la información proporcionada en esta consulta y deben verificarse en sus respectivas fichas de Hugging Face antes de usarse. No se dispone de métricas de rendimiento que permitan una comparación cuantitativa entre ellos y jarvis-ticket-classifier.

## Limitaciones y advertencias

- El propio autor declara que el modelo "no es para producción" y lo describe como una demo.
- El ajuste se realizó sobre tickets de soporte ficticios, por lo que el comportamiento sobre datos reales de clientes es desconocido.
- No se ha publicado ninguna evaluación cuantitativa: se desconoce la exactitud de clasificación, la tasa de JSON válido y la robustez ante entradas fuera de distribución.
- Riesgo de alucinación y de categorías inventadas en la salida JSON, especialmente ante tickets ambiguos o muy largos.
- La model card advierte de que las respuestas pueden contener la palabra "Jarvis", un sesgo introducido por el ajuste que puede contaminar el resultado.
- El modelo hereda los sesgos y limitaciones del corpus de entrenamiento de Qwen2.5-0.5B-Instruct, incluido un posible sesgo hacia el chino y el inglés.
- No se declaran idiomas soportados; el comportamiento en castellano no está verificado.
- El modelo no documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no debe asumirse.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución, pero la calidad del modelo no está garantizada por el licenciante.
- El repositorio registra 0 descargas y 0 likes, sin señales de adopción ni mantenimiento posteriores a la fecha de creación.
- No hay información sobre la fecha de creación más allá de las marcas temporales del repositorio (2026-10-09), que resultan anómalas y deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anandshivam44/jarvis-ticket-classifier
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Resultados de búsqueda web proporcionados: sin relación con el modelo (referencias al texto clásico chino *Shanhaijing* en Wikipedia, Britannica, MythsofChina y la wiki de Blue Archive). No se han encontrado papers, blogs, repositorios ni demos asociados a jarvis-ticket-classifier.
