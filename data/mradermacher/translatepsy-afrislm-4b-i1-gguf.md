# mradermacher/TranslatePsy-AfriSLM-4B-i1-GGUF

## Resumen

TranslatePsy-AfriSLM-4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo qvac/TranslatePsy-AfriSLM-4B, un modelo especializado en traducción automática entre inglés y 19 lenguas africanas (afrikáans, amárico, hausa, igbo, kinyarwanda, lingala, luganda, malgache, chichewa, oromo, shona, somalí, sesoto, suajili, setsuana, wolof, xhosa, yoruba y zulú). Lo publica mradermacher, un perfil conocido por generar cuantizaciones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo base tiene 4.841.450.496 parámetros (aproximadamente 4,8 mil millones) y está etiquetado con el identificador qwen3.5, lo que sugiere que se apoya en la familia Qwen 3.5. La ficha del repositorio cuantizado no aporta detalles sobre la arquitectura interna ni sobre la longitud de contexto del modelo original, por lo que estos datos deben consultarse en el repositorio del modelo base.

La relevancia de esta ficha reside en que ofrece una vía práctica para desplegar un traductor multilingüe centrado en lenguas africanas de bajos recursos en hardware modesto, gracias a las cuantizaciones que van desde 1,7 GB hasta 4,1 GB. El repositorio acumula 3751 descargas y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base está etiquetado como qwen3.5; la model card no detalla la arquitectura interna) |
| Parametros totales | 4.841.450.496 (4,8 B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1 con imatrix) |
| Idiomas soportados | en, af, am, ha, ig, rw, ln, lg, mg, ny, om, sn, so, st, sw, tn, wo, xh, yo, zu |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como librería declarada; el repositorio contiene ficheros GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base qvac/TranslatePsy-AfriSLM-4B. Las etiquetas del repositorio indican qwen3.5, lo que apunta a que se trata de un transformer de la familia Qwen 3.5 adaptado o afinado para traducción. El modelo se presenta como "conversational" y "multilingual", y el dataset de entrenamiento declarado es qvac/TranslatePsy-AfriSLM-Synthetic-Mix, una mezcla sintética orientada a traducción entre inglés y lenguas africanas.

Esta versión concreta es una cuantización GGUF producida por mradermacher mediante cuantización ponderada con fichero imatrix (weighted/imatrix quants), un método que calibra la cuantización con datos representativos para preservar mejor la calidad en bitrates bajos. El repositorio incluye también el propio fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Traducción automática entre inglés y 19 lenguas africanas, en ambas direcciones.
- Generación de texto conversacional y multi-turno (etiqueta "conversational").
- Soporte multilingüe para 20 idiomas en total, incluyendo inglés.
- Formato GGUF compatible con llama.cpp y con endpoints compatibles (etiqueta endpoints_compatible).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Traducción de documentación técnica al suajili, hausa o yoruba: el modelo puede integrarse en un pipeline de localización que traduzca manuales y guías de producto desde el inglés, aprovechando su especialización en estas lenguas y su tamaño reducido para ejecución local.
- Atención al cliente en lenguas africanas: un chatbot desplegado con la cuantización Q4_K_M (3,2 GB) puede gestionar conversaciones multi-turno en suajili, zulú o amárico en servidores modestos, reduciendo la dependencia de APIs propietarias.
- Traducción de contenido sanitario y educativo: para organizaciones que operan en zonas con lenguas de bajos recursos (kinyarwanda, lingala, chichewa), el modelo permite traducir materiales sin enviar datos sensibles a servicios externos.
- Subtitulado y transcripción traducida: combinado con un sistema de reconocimiento de voz, puede traducir transcripciones del inglés a lenguas como wolof, shona o setsuana para medios de comunicación locales.
- Investigación en lingüística computacional: el fichero imatrix y el rango completo de cuantizaciones permiten estudiar el impacto de la compresión en la calidad de traducción para lenguas de bajos recursos, comparando IQ frente a Q en distintos bitrates.
- Despliegue en hardware de gama baja: la cuantización i1-IQ1_S (1,7 GB) permite ejecutar el modelo en dispositivos con poca memoria, útil para prototipos o entornos con restricciones de recursos.
- Traducción de correspondencia administrativa: para ONGs y organismos públicos que gestionan formularios y comunicaciones en múltiples lenguas africanas, el modelo ofrece una alternativa local y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,7 GB (i1-IQ1_S) y 4,1 GB (i1-Q6_K) para los pesos; hay que sumar la memoria para el contexto KV, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con 6-8 GB de VRAM puede alojar las cuantizaciones de mayor calidad.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB) o RTX 4090 (24 GB) con margen amplio; también en GPUs integradas o CPU con suficiente RAM para las cuantizaciones pequeñas.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con endpoints (etiqueta endpoints_compatible). La librería declarada es transformers, pero el formato entregado es GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TranslatePsy-AfriSLM-4B-i1-GGUF | 4,8 B | No disponible | 20 (en + 19 africanas) | Apache 2.0 | GGUF |
| qvac/TranslatePsy-AfriSLM-4B (base) | 4,8 B | No disponible | 20 | Apache 2.0 | Safetensors (presumiblemente) |
| TranslatePsy-AfriSLM-4B-GGUF (cuantizaciones estáticas) | 4,8 B | No disponible | 20 | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativo con otros modelos de traducción para lenguas africanas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al entrenarse con un dataset sintético (TranslatePsy-AfriSLM-Synthetic-Mix), puede heredar artefactos de generación sintética y no reflejar fielmente el uso real de las lenguas.
- Riesgo de alucinación y de traducciones inexactas, especialmente en las cuantizaciones de menor bitrate (IQ1, IQ2, Q2_K), que el propio autor describe como "for the desperate" o "very low quality".
- La longitud de contexto no está documentada, lo que impide planificar con precisión el uso en documentos largos.
- El modelo está especializado en traducción; no se documentan capacidades de razonamiento, código, matemáticas o tool calling, por lo que no debe emplearse como modelo generalista.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset sintético en sus repositorios originales.
- Al ser una cuantización de un modelo de 4,8 B, la calidad en lenguas de bajos recursos puede degradarse de forma notable respecto al modelo en precisión completa; se recomienda validar con hablantes nativos antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/TranslatePsy-AfriSLM-4B-i1-GGUF
- Modelo base: https://huggingface.co/qvac/TranslatePsy-AfriSLM-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/TranslatePsy-AfriSLM-4B-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#TranslatePsy-AfriSLM-4B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/qvac/TranslatePsy-AfriSLM-Synthetic-Mix
- Paper referenciado (arXiv:2608.18655): https://arxiv.org/abs/2608.18655
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
