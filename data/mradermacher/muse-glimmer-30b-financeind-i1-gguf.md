# mradermacher/Muse-Glimmer-30B-FinanceIND-i1-GGUF

## Resumen

Muse-Glimmer-30B-FinanceIND-i1-GGUF es una recopilación de cuantizaciones GGUF del modelo Rumiii/Muse-Glimmer-30B-FinanceIND, un modelo de lenguaje de aproximadamente 27.850 millones de parámetros especializado en finanzas indias y en flujos de trabajo agénticos con tool calling. La publicación corre a cargo de mradermacher, un autor habitual en la distribución de cuantizaciones GGUF, y se apoya en la librería transformers con licencia Apache 2.0.

El modelo base parte de la familia Muse-Glimmer y ha sido ajustado sobre el dataset Gandalf1/indian-finance-synthetic-phase2-cleaned, lo que lo orienta a tareas de dominio financiero en el contexto del mercado indio, con soporte declarado para inglés (en) e hindi (hi). Incorpora etiquetas explícitas de tool-calling y agentic, lo que indica que está pensado para integraciones con herramientas externas y razonamiento multi-paso.

Esta versión i1-GGUF emplea cuantizaciones ponderadas con imatrix, con un abanico que va desde IQ1_S (6,6 GB) hasta Q6_K (23,0 GB), lo que permite desplegar el modelo en hardware muy variado, desde GPUs de consumo con cuantizaciones agresivas hasta estaciones de trabajo con cuantizaciones de mayor fidelidad. La model card menciona además que se trata de un modelo de visión, con ficheros mmproj disponibles en el repositorio estático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Muse-Glimmer, sin detalle de arquitectura en la información proporcionada) |
| Parametros totales | 27.854.794.240 (27,85 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (inglés), hi (hindi) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido; safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Rumiii/Muse-Glimmer-30B-FinanceIND en la documentación proporcionada. Por el nombre de la familia (Muse-Glimmer) y el tamaño (27,85 mil millones de parámetros), se trata de un transformer de gran escala, aunque no se especifica si emplea mezcla de expertos, atención lineal u otras variantes. Tampoco se detalla el número de tokens de entrenamiento ni la composición exacta del corpus.

El ajuste se ha realizado sobre el dataset Gandalf1/indian-finance-synthetic-phase2-cleaned, un conjunto sintético de datos financieros indios, lo que sugiere un proceso de fine-tuning supervisado orientado al dominio. Las etiquetas tool-calling y agentic indican que el entrenamiento incluyó ejemplos de invocación de funciones y razonamiento multi-paso. No se documenta si hubo RLHF, DPO u otras fases de alineación, ni innovaciones técnicas específicas como decodificación especulativa. Esta versión GGUF, por su parte, aplica cuantización ponderada con imatrix, una técnica que usa estadísticas de activación para preservar mejor la calidad en cuantizaciones bajas.

## Capacidades

- Generación de texto en inglés e hindi, con especialización en contenido financiero del mercado indio.
- Tool calling / function calling, según las etiquetas del repositorio.
- Flujos agénticos y razonamiento multi-paso (etiqueta agentic).
- Conversación multi-turno (etiqueta conversational).
- Capacidad de visión declarada en la model card, con ficheros mmproj en el repositorio estático.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se documentan capacidades específicas de matemáticas avanzadas, código generalista ni audio.

## Casos de uso

- Análisis de documentos financieros indios: el modelo puede procesar informes, balances y comunicados en inglés e hindi, resumirlos y extraer métricas clave gracias a su especialización en el dominio.
- Asistente de atención al cliente para entidades financieras: con soporte conversacional multi-turno y tool calling, puede consultar saldos, estados de cuenta o productos mediante APIs internas.
- Automatización de flujos agénticos de back-office: el modelo puede encadenar llamadas a herramientas (validación de datos, consulta de tipos de cambio, registro de operaciones) en pipelines multi-paso.
- Extracción de entidades y clasificación de transacciones: útil para enriquecer registros contables o detectar patrones en datos financieros sintéticos o reales.
- Generación de informes regulatorios en hindi e inglés: adecuado para equipos que operan en el mercado indio y necesitan documentación bilingüe.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en GPUs de consumo o incluso en CPU con llama.cpp, facilitando prototipado local sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: IQ1_S ~6,6 GB; IQ2_M ~9,9 GB; Q3_K_M ~13,8 GB; Q4_K_M ~17,0 GB; Q5_K_M ~19,9 GB; Q6_K ~23,0 GB (tamaños de fichero; la VRAM real requiere margen adicional para contexto y caché KV).
- GPUs recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K y contextos largos; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para IQ3/IQ4.
- Cabe en GPU de consumo: sí, con cuantizaciones IQ1 a Q4_K_M en tarjetas de 12-24 GB; las cuantizaciones más bajas permiten incluso GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-FinanceIND-i1-GGUF | 27,85 mil M | no disponible | en, hi | Apache 2.0 | GGUF |
| Muse-Glimmer-30B-FinanceIND (base) | 27,85 mil M | no disponible | en, hi | Apache 2.0 | safetensors |
| Muse-Glimmer-30B-FinanceIND-GGUF (estático) | 27,85 mil M | no disponible | en, hi | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada. Las alternativas más directas son las otras variantes del mismo modelo base (cuantizaciones estáticas de mradermacher y el modelo original en safetensors).

## Limitaciones y advertencias

- El modelo está especializado en finanzas indias; su rendimiento en otros dominios o mercados puede ser inferior al de modelos generalistas.
- Solo se declaran inglés e hindi; no hay soporte documentado para castellano u otros idiomas.
- No se han publicado benchmarks, por lo que la calidad real frente a alternativas no está cuantificada.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en dominio financiero donde los datos erróneos pueden tener consecuencias legales o económicas.
- Las cuantizaciones IQ1/IQ2 y Q2_K están marcadas por el autor como de calidad baja o "para desesperados"; no se recomiendan para producción.
- El dataset de ajuste es sintético (indian-finance-synthetic-phase2-cleaned), lo que puede introducir sesgos o artefactos propios de la generación sintética.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial.
- No se documenta la longitud de contexto, lo que dificulta planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face (esta versión): https://huggingface.co/mradermacher/Muse-Glimmer-30B-FinanceIND-i1-GGUF
- Modelo base: https://huggingface.co/Rumiii/Muse-Glimmer-30B-FinanceIND
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Muse-Glimmer-30B-FinanceIND-GGUF
- Página de descripción del autor: https://hf.tst.eu/model#Muse-Glimmer-30B-FinanceIND-i1-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/Gandalf1/indian-finance-synthetic-phase2-cleaned
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
