# ai4ug/pearl-chat-350m-it

## Resumen
Pearl-chat-350m-it es un modelo de lenguaje monolingüe en luganda (código ISO `lug`), desarrollado por ai4ug, un proyecto orientado a dotar de infraestructura lingüística propia a una de las lenguas de Uganda. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `ai4ug/pearl-chat-350m-base`, con 354.480.640 parámetros reales según los pesos en safetensors, y está diseñado específicamente para generación de texto conversacional en luganda. El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face.

La arquitectura es un transformer decoder-only con atención de ventana deslizante (sliding-window attention) y atención de consultas agrupadas (grouped-query attention, GQA), implementado en JAX/Flax y exportado también a safetensors. Esta combinación reduce el coste de memoria de la caché KV y facilita el despliegue en hardware modesto, algo relevante para un modelo de 350M parámetros orientado a un idioma de bajos recursos. El modelo se entrenó sobre datasets propios de pretraining y SFT (`ai4ug/luganda_pretrain_v5` y `ai4ug/luganda_sft_v5`), lo que lo convierte en una pieza poco habitual: un modelo conversacional dedicado exclusivamente a una lengua africana de bajos recursos.

Su relevancia actual radica en la escasez de modelos abiertos funcionales para luganda y en la posibilidad de desplegarlo en entornos con GPU de consumo. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, ni detalles sobre el número de tokens de entrenamiento, ni la longitud exacta de contexto, por lo que muchas especificaciones deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con sliding-window attention y grouped-query attention (GQA); implementación en JAX/Flax |
| Parametros totales | 354.480.640 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors y formato Flax; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Luganda (`lug`), monolingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y Flax (repositorio de 1,4 GB) |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer decoder-only con dos decisiones técnicas destacables: atención de ventana deslizante, que limita el coste computacional de la atención a una ventana local y reduce la memoria de la caché KV, y grouped-query attention, que comparte las proyecciones de clave y valor entre varios cabezales de consulta para disminuir aún más el uso de memoria durante la inferencia. La implementación de referencia está en JAX/Flax (etiqueta `flax-nnx`), lo que sugiere un flujo de entrenamiento en hardware TPU o GPU con el ecosistema JAX, y los pesos se distribuyen también en safetensors para facilitar su carga en otros frameworks.

El ajuste fino se realizó sobre el modelo base `ai4ug/pearl-chat-350m-base` utilizando el dataset `ai4ug/luganda_sft_v5`, mientras que el pretraining del modelo base empleó `ai4ug/luganda_pretrain_v5`. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta de los datasets, la posible aplicación de RLHF o DPO, ni la longitud de contexto con la que fue entrenado. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de las mencionadas.

## Capacidades
- Generación de texto conversacional en luganda, orientada a diálogo multi-turno.
- Comprensión y producción de texto monolingüe en luganda; no se documenta soporte de otros idiomas.
- Razonamiento básico y respuesta a instrucciones derivado del ajuste SFT, aunque sin benchmarks publicados que lo cuantifiquen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: no disponible; el modelo está etiquetado como monolingüe (`lug`).

## Casos de uso
- Asistentes conversacionales en luganda: el modelo puede gestionar diálogos multi-turno en luganda para atención al usuario en servicios locales, aprovechando su ajuste SFT específico para conversación y su tamaño reducido, que permite desplegarlo en infraestructura modesta.
- Traducción asistida luganda-inglés en pipelines híbridos: al ser monolingüe, se usaría como generador del lado luganda en combinación con un modelo multilingüe o un sistema de traducción basado en reglas, reduciendo la dependencia de modelos grandes para la parte luganda.
- Generación de contenido educativo y divulgativo: redacción de materiales escolares, resúmenes y textos divulgativos en luganda para proyectos de preservación lingüística, donde la disponibilidad de modelos abiertos en esta lengua es casi nula.
- Moderación y clasificación de texto en luganda: uso del modelo como base para tareas de clasificación o etiquetado mediante prompting, aprovechando su conocimiento del idioma para filtrar contenido en plataformas comunitarias.
- Investigación en PLN de bajos recursos: el modelo sirve como línea base reproducible (licencia Apache 2.0, pesos abiertos) para experimentos de ajuste fino, evaluación de técnicas de cuantización o comparación de arquitecturas en lenguas africanas.
- Despliegue en el borde o en hardware de consumo: con 354M parámetros, es viable ejecutarlo en GPU de consumo o incluso en CPU para prototipos, lo que facilita demos locales y aplicaciones offline en contextos con conectividad limitada.
- Transcripción y reescritura de textos administrativos: normalización y reformulación de documentos en luganda para servicios públicos, siempre con revisión humana dada la ausencia de benchmarks de fiabilidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos (354M parámetros × 4 bytes), más la caché KV y overhead del runtime.
- VRAM estimada en fp16/bf16: alrededor de 0,7 GB para pesos, más caché KV; cabe holgadamente en cualquier GPU de consumo moderna.
- VRAM estimada en cuantización de 8 bits: en torno a 0,35-0,4 GB para pesos, si se aplica cuantización dinámica (no se distribuyen pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650, RTX 3050, RTX 4060, RTX 4090); para fp32 se recomienda al menos 6-8 GB. En A100/H100 el modelo es sobredimensionado para el hardware y el cuello de botella será el throughput, no la memoria.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo recientes con 4 GB o más de VRAM en fp16.
- Opciones de despliegue: al estar implementado en Flax/JAX, el despliegue natural es con el ecosistema JAX (por ejemplo, servidores propios basados en Flax NNX). No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF, el uso en llama.cpp requeriría conversión manual.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai4ug/pearl-chat-350m-it | 354M | No disponible | Luganda (monolingüe) | Apache 2.0 | Gated en Hugging Face |
| ai4ug/pearl-chat-350m-base | No disponible | No disponible | Luganda | No disponible en la información | Hugging Face |
| Modelos multilingües pequeños tipo mT5-small | ~300M | 512 tokens (típico) | Multilingüe (incluye luganda de forma limitada) | Apache 2.0 | Abierto |
| Modelos conversacionales pequeños tipo Qwen2.5-0.5B-Instruct | ~500M | 32.768 tokens | Multilingüe (luganda no garantizado) | Apache 2.0 | Abierto |

La comparación con alternativas es limitada porque no se han publicado benchmarks del modelo ni de sus competidores directos en luganda. Frente a modelos multilingües pequeños, la ventaja de Pearl-chat-350m-it es su especialización monolingüe y su licencia permisiva; la desventaja es la ausencia de datos de rendimiento y de soporte documentado en runtimes de inferencia ampliamente usados.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse sobre datasets propios de luganda, puede heredar sesgos de la composición de esos datos, que no se ha publicado.
- Riesgo de alucinación: alto en un modelo de 350M parámetros sin benchmarks de fidelidad; no debe usarse en producción sin verificación humana en contextos sensibles.
- Limitaciones de contexto e idioma: monolingüe en luganda y con longitud de contexto no documentada; no se garantiza un rendimiento correcto fuera del registro y la variante de luganda presentes en los datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, lo que puede limitar la redistribución automatizada.
- Caveats para producción: no hay pesos GGUF ni cuantizaciones publicadas, ni soporte documentado en vLLM, TGI, llama.cpp u Ollama; el despliegue requiere integrar el runtime de JAX/Flax o convertir los pesos manualmente.
- Ausencia de benchmarks: no es posible comparar su calidad con alternativas de forma objetiva, lo que desaconseja su adopción en producción sin una evaluación propia previa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ai4ug/pearl-chat-350m-it
- Modelo base: https://huggingface.co/ai4ug/pearl-chat-350m-base
- Dataset de pretraining: https://huggingface.co/datasets/ai4ug/luganda_pretrain_v5
- Dataset de SFT: https://huggingface.co/datasets/ai4ug/luganda_sft_v5
