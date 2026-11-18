# mradermacher/Schauspieler-1B-GGUF

## Resumen

Schauspieler-1B-GGUF es la versión cuantizada en formato GGUF del modelo Schauspieler-1B, desarrollado originalmente por hamzah0asadullah y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje especializado en roleplay y roleplaying conversacional, afinado a partir de un dataset de tarjetas de personaje (charcards) derivado de Sonnet 3.5 (Gryphe/Sonnet3.5-Charcard-Roleplay). Su propósito es generar diálogos de personaje coherentes y consistentes en escenarios de interpretación de rol, tanto en contextos de ocio como en prototipado de asistentes con personalidad definida.

El modelo base cuenta con 752.393.024 parámetros (aproximadamente 0,75B, comercializado como "1B"), lo que lo sitúa en la gama ultraligera. Esto permite ejecutarlo en hardware muy modesto, incluidas CPU y GPUs de consumo con poca VRAM, usando cuantizaciones que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB). La licencia Apache 2.0 facilita su uso comercial y su integración en productos.

La relevancia actual de esta ficha radica en que ofrece una alternativa compacta y de bajo coste para aplicaciones de rol conversacional, donde modelos de mayor tamaño resultan sobredimensionados o demasiado caros de desplegar. No obstante, la información pública disponible es limitada: no se detallan la arquitectura exacta, la longitud de contexto ni los datos de entrenamiento más allá del dataset de roleplay citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer afinado para roleplay; detalles no publicados) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensiones de atención, uso de GQA o atención lineal). El dato objetivo disponible es el recuento de parámetros: 752.393.024, lo que corresponde a un modelo denso de menos de mil millones de parámetros. El modelo está etiquetado como `transformers` y es de tipo conversacional.

En cuanto al entrenamiento, la model card indica que el modelo base fue afinado sobre el dataset Gryphe/Sonnet3.5-Charcard-Roleplay, un conjunto de tarjetas de personaje y conversaciones de rol generadas a partir de Sonnet 3.5. No se especifican el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La versión GGUF es una cuantización estática del modelo base, sin quants ponderados/imatrix disponibles según el autor de la conversión.

## Capacidades

- Generación de texto conversacional orientada a roleplay e interpretación de personajes.
- Mantenimiento de personalidad y consistencia de personaje en diálogos multi-turno (según el propósito declarado del modelo).
- Generación de diálogos de ficción y narrativa interactiva.
- Soporte de conversaciones multi-turno en formato chat (etiqueta `conversational`).
- Capacidades multilingües: limitadas al inglés (`en`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.

## Casos de uso

- Prototipado de chatbots de rol: el modelo puede generar respuestas de personaje en conversaciones multi-turno, lo que permite validar rápidamente la experiencia de usuario de una aplicación de roleplay antes de escalar a modelos mayores.
- Ficción interactiva y novelas visuales: integrado en un motor de diálogo, el modelo produce réplicas de personaje coherentes con su tarjeta de personaje, útil para juegos narrativos ligeros que deben ejecutarse en hardware modesto.
- Asistentes con personalidad en dispositivos de consumo: gracias a sus cuantizaciones de 0,5-0,9 GB, puede desplegarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo un asistente con carácter definido sin coste de API.
- Generación de contenido de rol para comunidades: herramientas que ayuden a crear escenas y diálogos de personaje para foros o plataformas de rol por texto, donde la latencia y el coste importan más que la profundidad de razonamiento.
- Pruebas de concepto de sistemas de personajes: investigadores que necesiten un modelo pequeño y de licencia permisiva para experimentar con técnicas de prompting de personaje, evaluación de consistencia o pipelines de generación de diálogo.
- Educación y talleres: como ejemplo didáctico de cuantización GGUF y despliegue local de modelos conversacionales, al ser ligero y de licencia Apache 2.0.
- Filtrado y generación de variantes de diálogo: en pipelines de aumento de datos para entrenar o evaluar otros modelos de rol, generando múltiples respuestas de personaje a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB (Q2_K), 0,6 GB (Q4_K_S/IQ4_XS/Q4_K_M), 0,7 GB (Q5/Q6), 0,9 GB (Q8_0) y 1,6 GB (f16), sin contar el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU de consumo con 2 GB o más de VRAM es suficiente; también funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas (GTX 1050 Ti en adelante, RTX 20/30/40, AMD equivalentes) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y runtimes compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por su tamaño, se espera una latencia baja en hardware de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Schauspieler-1B-GGUF | 752M | no disponible | Apache 2.0 | GGUF | Especializado en roleplay, solo inglés |
| Modelos de rol de ~1B (p. ej., variantes de Llama/Qwen afinadas para rol) | ~1B | variable | variable | GGUF/safetensors | No disponible comparación cuantitativa concreta en la información |
| Modelos de rol de 7B-8B | ~7-8B | variable | variable | GGUF/safetensors | Mayor calidad potencial pero requieren más VRAM (4-6 GB en Q4) |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas concretas; la comparativa anterior es cualitativa y basada en categorías de tamaño.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset derivado de Sonnet 3.5, puede heredar sesgos de ese corpus y del proceso de generación.
- Riesgo de alucinación: alto en un modelo de menos de mil millones de parámetros; no es fiable para tareas factuales.
- Limitaciones de contexto e idioma: solo inglés; la longitud de contexto no está documentada, por lo que no se debe asumir una ventana amplia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset de entrenamiento (Gryphe/Sonnet3.5-Charcard-Roleplay) y del modelo base.
- Caveats para producción: modelo especializado en roleplay, no apto para tareas de razonamiento, código o matemáticas; sin soporte documentado de tool calling ni agentes; la cuantización Q2_K puede degradar notablemente la calidad; el autor de la conversión indica que no hay quants ponderados/imatrix disponibles.
- El recuento de descargas y likes es muy bajo, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Schauspieler-1B-GGUF
- Modelo base: https://huggingface.co/hamzah0asadullah/Schauspieler-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Página de descargas del conversor: https://hf.tst.eu/model#Schauspieler-1B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
