# mradermacher/LegalEvolver-Qwen3-8B-GGUF

## Resumen

LegalEvolver-Qwen3-8B es un modelo de lenguaje especializado en el dominio jurídico, desarrollado originalmente por el usuario yxy919 y distribuido en formato GGUF por mradermacher. Se construye sobre la arquitectura Qwen3 con 8.190.735.360 parámetros totales (aproximadamente 8,19 mil millones) y está orientado a tareas de predicción de sentencias judiciales (legal-judgment-prediction) y recuperación agentica de información legal (agentic-retrieval). El modelo base es yxy919/LegalEvolver-Qwen3-8B, un fine-tuning sobre Qwen3-8B.

La relevancia de esta ficha radica en que mradermacher ha publicado un conjunto completo de cuantizaciones estáticas en formato GGUF que permiten ejecutar un modelo jurídico de 8B en hardware de consumo, algo poco habitual en el nicho legal, donde predominan modelos propietarios o soluciones de mayor tamaño. El repositorio ocupa 63,0 GB e incluye cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB), facilitando el despliegue local con llama.cpp y herramientas compatibles.

No obstante, la información pública disponible es muy limitada: no se especifican la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks, y la licencia no está declarada. Esto condiciona cualquier evaluación rigurosa y obliga a tratar el modelo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con mecanismos de atención estándar (no se documenta el uso de atención lineal ni de arquitecturas híbridas SSM). El tamaño de 8,19 mil millones de parámetros coincide con la variante Qwen3-8B, si bien no se dispone de detalles sobre el número de capas, dimensión oculta o número de cabezas de atención en la información proporcionada.

En cuanto al entrenamiento, la model card no especifica el volumen de tokens, la composición del dataset jurídico, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. Los tags indican especialización en predicción de sentencias judiciales y recuperación agentica, lo que sugiere un fine-tuning sobre corpus legales en chino, pero no se aportan métricas ni descripciones del proceso. Tampoco se documentan innovaciones técnicas como decodificación especulativa o modos de razonamiento extendido, más allá de lo que herede de la familia Qwen3.

## Capacidades

- Generación de texto en chino orientada al dominio jurídico.
- Predicción de sentencias judiciales (legal-judgment-prediction), según los tags del modelo.
- Recuperación agentica de información legal (agentic-retrieval), lo que implica capacidad de razonamiento multi-paso con consultas a fuentes externas.
- Conversación multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al chino según el campo `language`.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Predicción de resultados judiciales: dado un conjunto de hechos y fundamentos, el modelo puede generar una estimación de la sentencia, útil para despachos que evalúan riesgo procesal antes de litigar.
- Asistencia en investigación jurídica: con el tag de agentic-retrieval, puede integrarse en pipelines que consulten bases de datos de jurisprudencia y sinteticen resultados en chino.
- Redacción de borradores de documentos legales: generación de escritos, demandas o contratos preliminares que un profesional revisa después.
- Análisis de contratos y cláusulas: extracción y resumen de obligaciones y riesgos en textos legales en chino.
- Formación y simulación para estudiantes de Derecho: conversaciones multi-turno que reproducen interrogatorios o negociaciones legales.
- Despliegue local en despachos pequeños: gracias a las cuantizaciones Q4_K_M (5,1 GB) y Q5_K_S (5,8 GB), puede ejecutarse en estaciones de trabajo sin GPU de datacenter, manteniendo los datos de clientes en local.
- Preprocesamiento en pipelines de e-discovery: clasificación y resumen de grandes volúmenes de documentos jurídicos antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K (3,4 GB): ~4 GB de VRAM.
  - Q4_K_M (5,1 GB): ~6 GB de VRAM.
  - Q5_K_S (5,8 GB): ~7 GB de VRAM.
  - Q6_K (6,8 GB): ~8 GB de VRAM.
  - Q8_0 (8,8 GB): ~10 GB de VRAM.
  - f16 (16,5 GB): ~17-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4090 (24 GB) para Q8_0 y f16; A100 o H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizaciones Q4 a Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| LegalEvolver-Qwen3-8B | 8,19 B | no disponible | no disponible | GGUF, safetensors | Jurídico (zh) |
| Qwen3-8B (base) | 8,19 B | no disponible | no disponible | safetensors | Generalista |
| Modelos jurídicos en chino de 7-8B | ~7-8 B | variable | variable | variable | Jurídico (zh) |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada. El principal diferencial frente a Qwen3-8B es el fine-tuning jurídico y la disponibilidad de cuantizaciones GGUF listas para usar; frente a otros modelos legales, la falta de benchmarks impide establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con corpus jurídicos chinos, puede reflejar sesgos del sistema legal y de la jurisprudencia de origen.
- Riesgo de alucinación: alto en tareas de predicción de sentencias, donde el modelo puede generar fundamentos plausibles pero incorrectos; requiere validación por profesionales.
- Limitaciones de contexto e idioma: solo se declara soporte de chino; la longitud de contexto no está especificada, lo que impide garantizar el manejo de documentos legales extensos.
- Restricciones de licencia: la licencia no está declarada, por lo que no puede asumirse uso comercial sin verificar los términos del modelo base yxy919/LegalEvolver-Qwen3-8B y de Qwen3.
- Caveats para producción: ausencia de benchmarks, de documentación de entrenamiento y de garantías de calidad; el repo tiene 0 descargas y 0 likes, lo que indica nula validación comunitaria.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso jurídico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LegalEvolver-Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/yxy919/LegalEvolver-Qwen3-8B
- Página de descargas del cuantizador: https://hf.tst.eu/model#LegalEvolver-Qwen3-8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
