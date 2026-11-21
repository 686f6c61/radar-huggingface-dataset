# mradermacher/Muse-Glimmer-30B-FinanceIND-i1-GGUF

## Resumen

Muse-Glimmer-30B-FinanceIND-i1-GGUF es una recopilación de cuantizaciones GGUF, generadas con la herramienta de cuantización con matriz de importancia (imatrix) de mradermacher, del modelo Rumiii/Muse-Glimmer-30B-FinanceIND. El modelo base es un ajuste fino de 27.854.794.240 parámetros (aproximadamente 30B nominales) especializado en finanzas indias, con capacidades declaradas de tool calling y comportamiento agéntico, entrenado sobre el dataset sintético Gandalf1/indian-finance-synthetic-phase2-cleaned. La relevancia de esta ficha radica en que ofrece el modelo en formatos ejecutables localmente (GGUF) con un abanico de cuantizaciones que va desde 6,6 GB hasta 23,0 GB, lo que permite desplegarlo en hardware muy diverso.

El repositorio lo mantiene mradermacher, un cuantizador de terceros habitual en el ecosistema, no el autor original del modelo. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, y los idiomas soportados son inglés (en) e hindi (hi). El pipeline no está declarado y no se han publicado resultados de benchmarks en la información disponible.

Se trata, por tanto, de una variante de distribución más que de un modelo nuevo: su valor está en la disponibilidad de pesos cuantizados con imatrix (etiquetados i1) y en la posibilidad de ejecución con llama.cpp y derivados, no en innovaciones arquitectónicas propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; no se detalla en la información) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además de un fichero imatrix |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix auxiliar) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos indican que se trata de un modelo de transformers con 27.854.794.240 parámetros y que el ajuste fino se realizó sobre el dataset Gandalf1/indian-finance-synthetic-phase2-cleaned, de naturaleza sintética y orientado a finanzas indias. La etiqueta muse_glimmer sugiere una familia de modelos base denominada Muse Glimmer, pero no se detallan capas, tipo de atención ni mecanismos de decodificación.

En cuanto al entrenamiento, la model card del repositorio de cuantización no incluye información sobre número de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas del modelo original. La única información técnica relevante de este repositorio es el proceso de cuantización: se han generado cuantizaciones ponderadas con imatrix (versión de cuantización 2, salida tensor-quantised, conversión de tipo hf), lo que habitualmente mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. El repositorio incluye además cuantizaciones estáticas en un repo hermano.

## Capacidades

- Generación de texto conversacional en inglés e hindi, con especialización declarada en dominio financiero indio.
- Tool calling / function calling: etiquetado explícitamente en los tags del modelo.
- Comportamiento agéntico (agentic): soporte declarado para flujos de múltiples pasos.
- Comprensión y generación en el dominio de finanzas indias, gracias al ajuste fino sobre datos sintéticos específicos.
- Capacidades multilingües limitadas a inglés e hindi.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.

## Casos de uso

- Asistencia financiera en hindi e inglés: el modelo puede atender consultas sobre productos financieros indios, terminología bancaria y procedimientos, aprovechando su ajuste fino sobre el dataset sintético de finanzas indias.
- Agente de atención al cliente bancaria: gracias al soporte de tool calling, puede invocar APIs de consulta de saldo, estado de transacciones o simulación de productos dentro de un flujo conversacional multi-turno.
- Automatización de back-office financiero: clasificación y extracción de información de documentos y consultas en inglés e hindi, integrable en pipelines mediante llama.cpp.
- Despliegue en entornos con hardware limitado: las cuantizaciones i1-Q4_K_S (16,2 GB) e i1-Q4_K_M (17,0 GB) permiten ejecutar un modelo de ~28B en GPUs de consumo de gama alta, algo inviable con los pesos originales en precisión completa.
- Prototipado de agentes financieros en local: el formato GGUF y la disponibilidad de cuantizaciones desde 6,6 GB facilitan pruebas rápidas en estaciones de trabajo sin infraestructura de servidor.
- Investigación sobre sesgos y calidad en dominios financieros regionales: al ser un ajuste fino sobre datos sintéticos, sirve como caso de estudio para evaluar la fidelidad de modelos especializados en mercados no anglosajones.
- Servicio de inferencia con endpoints compatibles: el tag endpoints_compatible indica que puede desplegarse en plataformas de serving que acepten la API de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada): i1-IQ1_S ~6,6 GB; i1-IQ2_M ~9,9 GB; i1-IQ3_M ~12,9 GB; i1-IQ4_XS ~15,3 GB; i1-Q4_K_M ~17,0 GB; i1-Q5_K_M ~19,9 GB; i1-Q6_K ~23,0 GB. Añadir entre 1 y 4 GB adicionales para KV cache según longitud de contexto.
- GPU recomendadas: para cuantizaciones Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q5 y Q6, se recomienda A100 40 GB, H100 o RTX 6000 Ada. Para IQ2 e IQ3, una RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) puede bastar.
- Cabe en GPU de consumo: sí, en las cuantizaciones IQ1 a Q4; Q5 y Q6 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. No se indica soporte nativo para vLLM o TGI con estos pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-FinanceIND-i1-GGUF (este) | ~27,85B | no disponible | Apache 2.0 | GGUF (i1, múltiples cuantizaciones) | Especializado en finanzas indias, tool calling, en/hi |
| Muse-Glimmer-30B-FinanceIND (base) | ~27,85B | no disponible | Apache 2.0 | safetensors | Pesos originales, sin cuantizar |
| Muse-Glimmer-30B-FinanceIND-GGUF (estático) | ~27,85B | no disponible | Apache 2.0 | GGUF (estático) | Mismo modelo, cuantizaciones sin imatrix |

No se dispone de información sobre otros modelos comparables de la misma categoría (especializados en finanzas indias con tool calling) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo base se entrenó sobre un dataset sintético (indian-finance-synthetic-phase2-cleaned), lo que puede introducir artefactos y una distribución poco representativa de casos reales.
- Riesgo de alucinación en datos financieros concretos (cifras, normativas, tipos de interés): no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas limitados a inglés e hindi; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones largas sin verificación empírica.
- No se han publicado benchmarks, por lo que las afirmaciones de calidad del ajuste fino no están respaldadas por métricas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original y del dataset utilizado, ya que el repositorio no detalla restricciones adicionales.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- El repositorio pertenece a un cuantizador de terceros (mradermacher), no al autor original; los problemas de calidad del modelo deben atribuirse al modelo base Rumiii/Muse-Glimmer-30B-FinanceIND.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Muse-Glimmer-30B-FinanceIND-i1-GGUF
- Modelo base: https://huggingface.co/Rumiii/Muse-Glimmer-30B-FinanceIND
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Muse-Glimmer-30B-FinanceIND-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Muse-Glimmer-30B-FinanceIND-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Gandalf1/indian-finance-synthetic-phase2-cleaned
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_re
