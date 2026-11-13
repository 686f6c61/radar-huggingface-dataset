# jjimi77/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

`jjimi77/kanana-1.5-8b-instruct-2505-Safe-DPO` es un modelo de lenguaje de tipo instructivo con 8.030.285.824 parámetros (aproximadamente 8,03 mil millones), publicado en Hugging Face por el usuario jjimi77 bajo licencia Apache 2.0. Se distribuye en formato safetensors dentro de la librería `transformers` y está etiquetado como compatible con `text-generation-inference` y con la arquitectura `llama`. El nombre sugiere que se trata de un ajuste fino (fine-tuning) del modelo Kanana 1.5 8B Instruct de la versión 2505, orientado a alineamiento de seguridad mediante DPO (Direct Preference Optimization), aunque la model card no documenta el proceso de entrenamiento.

La información disponible es muy limitada: la model card generada automáticamente por Unsloth no incluye detalles sobre datos de entrenamiento, composición del dataset de preferencias, benchmarks ni capacidades específicas. El repositorio declara únicamente el idioma inglés (`en`) y no publica resultados de evaluación. El campo `base_model` del README apunta al propio repositorio, lo que indica que la metadata de origen no se ha rellenado correctamente.

Por tanto, esta ficha se limita a los datos verificables del repositorio (tamaño, formato, licencia, arquitectura declarada) y marca explícitamente como "no disponible" todo aquello que no se puede confirmar. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (declarada en tags; detalles no disponibles) |
| Parámetros totales | 8.030.285.824 (~8,03 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; el tag `unsloth` sugiere compatibilidad con cuantizaciones de 4 bits (no confirmado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 16,1 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Compatibilidad | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura declarada es `llama`, un transformer decoder-only con atención causal estándar. El número de parámetros (8,03 B) y el tamaño del repositorio (16,1 GB) son coherentes con pesos en precisión FP16/BF16 (2 bytes por parámetro, aproximadamente 16 GB). No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa.

El proceso de entrenamiento no está documentado en la model card. El nombre del modelo sugiere un ajuste fino con DPO sobre una versión instructiva previa (Kanana 1.5 8B Instruct 2505), pero no se especifican el dataset de preferencias, el número de pasos, la composición de datos ni si hubo etapas adicionales de RLHF o SFT. La model card únicamente indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que apunta a un fine-tuning eficiente en memoria, pero sin más detalles técnicos.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado (`text-generation`) y el tag `conversational`.
- Formato instructivo: el sufijo `instruct` en el nombre indica que el modelo está preparado para seguir instrucciones, aunque no se documentan formatos de prompt específicos.
- Alineamiento de seguridad: el sufijo `Safe-DPO` sugiere un ajuste orientado a reducir respuestas inseguras, pero no se aportan métricas ni metodología de evaluación.
- Compatibilidad con `text-generation-inference` (TGI) y con endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la metadata.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentación en investigación sobre alineamiento: el modelo puede servir como punto de partida para estudiar los efectos de DPO en modelos de 8 B, comparando sus respuestas con las del modelo base original.
- Generación de texto conversacional en inglés en prototipos: al ser un modelo instructivo de 8 B, puede integrarse en chatbots de demostración mediante `transformers` o TGI.
- Fine-tuning posterior: su licencia Apache 2.0 y formato safetensors permiten reutilizarlo como base para ajustes específicos de dominio, siempre que se validen previamente sus capacidades reales.
- Evaluación comparativa de seguridad: útil en pipelines de red-teaming para contrastar la tasa de respuestas inseguras frente a otros modelos de la misma familia.
- Despliegue en entornos con GPU de gama alta: con ~16 GB en FP16, cabe en una única GPU de 24 GB o superior, lo que permite servir el modelo en infraestructura modesta para pruebas internas.
- Docencia y formación: como ejemplo práctico de modelo ajustado con Unsloth y TRL, puede utilizarse en talleres sobre fine-tuning eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: ~16 GB solo para pesos; con caché KV y overhead de inferencia, se recomienda al menos 18-20 GB.
- VRAM estimada en cuantización de 8 bits: ~8-9 GB (estimación teórica a partir del tamaño de parámetros; no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: ~4,5-5,5 GB (estimación teórica; no confirmada).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16. Para cuantización de 4 bits, GPU consumer como RTX 3090/4090 o incluso RTX 4070 Ti (12 GB) podrían ser suficientes, aunque no hay datos de throughput publicados.
- Cabe en GPU consumer: sí, en FP16 en RTX 4090 (24 GB) con margen ajustado; en cuantización de 4 bits en GPU de 8-12 GB.
- Opciones de despliegue: `transformers`, `text-generation-inference` (declarado), y previsiblemente `llama.cpp`/Ollama y vLLM por la arquitectura Llama, aunque no está confirmado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jjimi77/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning DPO no documentado |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | Ampliamente disponible | Referencia de la misma arquitectura y tamaño; benchmarks públicos |
| Mistral 7B Instruct v0.3 | 7,25 B | 32 K | Apache 2.0 | Ampliamente disponible | Alternativa de tamaño similar con licencia permisiva |
| Qwen2.5 7B Instruct | 7,62 B | 128 K | Apache 2.0 | Ampliamente disponible | Buen rendimiento en código y multilingüe |

La comparación es orientativa: no existen datos de rendimiento publicados para el modelo de jjimi77 que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste DPO haya mejorado la seguridad o las capacidades del modelo base.
- Metadata inconsistente: el campo `base_model` apunta al propio repositorio, lo que impide trazar el linaje real del modelo.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Contexto desconocido: al no documentarse la longitud de contexto, no se recomienda su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación: inherente a los modelos de 8 B sin evaluación publicada; no hay datos sobre tasas de factualidad.
- Sesgos: no se documenta ningún análisis de sesgos ni de mitigación más allá del supuesto ajuste "Safe-DPO".
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad del despliegue recae en el usuario.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- Model card generada automáticamente: no contiene información sobre el dataset de preferencias ni sobre el proceso de anotación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjimi77/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería citada): https://github.com/huggingface/trl
- Documentación de text-generation-inference: https://github.com/huggingface/text-generation-inference
