# mradermacher/gpt-oss-20b-abliterated-GGUF

## Resumen

El modelo `mradermacher/gpt-oss-20b-abliterated-GGUF` es una colección de cuantizaciones GGUF del modelo `wangzhang/gpt-oss-20b-abliterated`, una versión modificada (abliterated) del modelo open-weight `gpt-oss-20b` de OpenAI. La abliteración es una técnica que elimina las activaciones de rechazo del modelo, dando como resultado una versión "sin censura" que no se niega a responder a peticiones que el modelo original consideraría inapropiadas. El cuantizador `mradermacher` ha generado múltiples niveles de cuantización (de Q2_K a Q8_0) para permitir la ejecución local en hardware de consumo.

El modelo base `gpt-oss-20b` es un modelo de mezcla de expertos (MoE) con aproximadamente 20,9 mil millones de parámetros totales, diseñado por OpenAI para baja latencia y ejecución local. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. La versión abliterated añade técnicas adicionales de modificación de pesos como `direct-steering`, `ega`, `moe-router-suppression` y `abliterix`, que ajustan el comportamiento del router de expertos y las activaciones internas para reducir los rechazos. El modelo soporta los idiomas inglés y chino, y utiliza el formato de chat Harmony.

Esta ficha se centra en la versión GGUF, que es la más práctica para despliegue local con herramientas como llama.cpp, Ollama o LM Studio. Al estar cuantizado, el modelo puede ejecutarse en GPUs de consumo con 12-24 GB de VRAM, dependiendo del nivel de cuantización elegido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), basada en GPT-OSS-20B |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-20b` es un transformer de mezcla de expertos (MoE) desarrollado por OpenAI. Aunque no se proporcionan detalles específicos sobre el número de expertos o la configuración exacta en la información disponible, los tags indican claramente que se trata de una arquitectura MoE. El modelo original fue entrenado por OpenAI con un enfoque en razonamiento, generación de código y soporte de function calling, utilizando el formato de chat Harmony.

La versión abliterated, creada por `wangzhang`, aplica técnicas de modificación de pesos post-entrenamiento. La abliteración consiste en identificar y eliminar las direcciones de activación responsables de los comportamientos de rechazo. Además, se aplican técnicas complementarias como `direct-steering` (direccionamiento directo de activaciones), `ega` (probablemente una técnica de ajuste de embeddings), `moe-router-suppression` (supresión de rutas específicas en el router de expertos) y `abliterix` (una variante de abliteración). Estas técnicas no requieren reentrenamiento, solo modifican los pesos existentes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset o si se utilizó RLHF/DPO. El proceso de cuantización a GGUF realizado por `mradermacher` es puramente de compresión de pesos y no altera las capacidades del modelo más allá de la pérdida de precisión inherente a la cuantización.

## Capacidades

- Generación de texto conversacional en inglés y chino, con formato de chat Harmony.
- Soporte de function calling y salidas estructuradas, según la documentación de OpenAI para GPT-OSS.
- Sin rechazos (uncensored): el modelo no se niega a responder a peticiones que el modelo original consideraría inapropiadas, gracias a la abliteración.
- Capacidad de razonamiento multi-step, heredada del modelo base GPT-OSS-20B.
- Generación de código y asistencia en programación, aunque no se han publicado benchmarks específicos en la información disponible.
- Ejecución local eficiente gracias a las cuantizaciones GGUF, con tamaños de archivo que van desde 12,2 GB (Q2_K) hasta 22,4 GB (Q8_0).

## Casos de uso

- Asistentes conversacionales sin restricciones: el modelo puede mantener conversaciones multi-turno sobre temas que otros modelos rechazarían, como discusión abierta de temas controvertidos o generación de contenido para adultos. Su naturaleza abliterated lo hace adecuado para entornos donde se requiere una respuesta sin filtros.
- Generación de contenido creativo: escritura de ficción, poesía, guiones o material de marketing sin las limitaciones típicas de los modelos alineados. El soporte multilingüe (en, zh) amplía su aplicabilidad.
- Fine-tuning para dominios específicos: al ser un modelo de 20B con licencia Apache-2.0, puede ajustarse finamente para tareas especializadas como atención al cliente, análisis de sentimiento o generación de documentación técnica, sin costes de licencia.
- Aplicaciones de baja latencia: el modelo está diseñado para ejecución local rápida. Con cuantizaciones como Q4_K_M (15,9 GB), puede desplegarse en una GPU de consumo (p. ej., RTX 4090) para chatbots en tiempo real o asistentes de voz.
- Desarrollo de agentes autónomos: gracias al soporte de function calling y salidas estructuradas, puede integrarse en pipelines de agentes que necesitan llamar a APIs, consultar bases de datos o ejecutar herramientas externas.
- Investigación en seguridad y alineación: la versión abliterated permite estudiar los mecanismos de rechazo y los efectos de las técnicas de modificación de pesos, siendo útil para investigadores que analizan el comportamiento de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros tests estándar. Se recomienda consultar la documentación oficial de OpenAI para GPT-OSS-20B para obtener datos de rendimiento del modelo base, aunque la versión abliterated puede presentar variaciones debido a las modificaciones de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño del archivo GGUF, se necesita al menos esa cantidad de VRAM más un margen para el contexto y las activaciones. Por ejemplo, Q4_K_M (15,9 GB) requiere aproximadamente 16-18 GB de VRAM; Q8_0 (22,4 GB) requiere 24 GB o más.
- GPU recomendadas: para cuantizaciones Q4 y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q2/Q3, una GPU de 12-16 GB (p. ej., RTX 3060 12 GB) puede funcionar. Para Q8_0, se recomienda una A100 40 GB o H100.
- Si cabe en consumer GPU: sí, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de consumo con 12-24 GB de VRAM. Q6_K y Q8_0 requieren GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), o cualquier framework compatible con GGUF.
- Latencia y throughput: no se proporcionan datos específicos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 30-60 tokens por segundo, pero esto es una estimación orientativa basada en modelos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-abliterated-GGUF (este) | 20,9 B (MoE) | no disponible | Apache-2.0 | GGUF | Abliterated, sin censura |
| gpt-oss-20b (original) | 20,9 B (MoE) | no disponible | Apache-2.0 | safetensors | Con alineación estándar |
| gpt-oss-120b | 120 B (MoE) | no disponible | Apache-2.0 | safetensors | Mayor capacidad, requiere hardware profesional |
| Llama-3.1-8B-Instruct | 8 B (dense) | 128k | Llama 3.1 | GGUF | Más pequeño, con censura estándar |

La comparativa se basa en datos públicos de los modelos. No se dispone de benchmarks comparativos en la información proporcionada. La principal diferencia de este modelo es su naturaleza abliterated, que lo hace único frente a las versiones alineadas.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones donde se requiera seguridad y moderación.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede inventar información, especialmente en temas especializados. No se recomienda su uso en contextos donde la veracidad sea crítica sin supervisión humana.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Se recomienda probar con ventanas pequeñas (p. ej., 4k-8k tokens) hasta confirmar el límite real.
- Idiomas limitados: solo inglés y chino. No se garantiza un buen rendimiento en otros idiomas.
- Pérdida de calidad por cuantización: las cuantizaciones más agresivas (Q2_K, Q3_K) pueden degradar significativamente la coherencia y el razonamiento. Se recomienda usar Q4_K_M o superior para producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base es de OpenAI y puede haber términos adicionales en su documentación oficial. La versión abliterated puede violar los términos de uso de OpenAI si se redistribuye, aunque la licencia Apache-2.0 del modelo cuantizado lo permite. Se recomienda revisar la política de uso de OpenAI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gpt-oss-20b-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/wangzhang/gpt-oss-20b-abliterated
- Documentación de OpenAI para GPT-OSS-20B: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Guía de instalación y ejecución local: https://dev.to/nodeshiftcloud/how-to-install-run-gpt-oss-20b-and-120b-gguf-locally-3833
- Directorio de modelos abliterated: https://www.abliz.org/
