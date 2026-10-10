# mradermacher/VANGUARD-MODEL-V1-GGUF

## Resumen

VANGUARD-MODEL-V1-GGUF es la version cuantizada en formato GGUF del modelo Md-Asif/VANGUARD-MODEL-V1, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos abiertos. Se trata de un modelo de aproximadamente 4.022 millones de parametros (4B), especializado en el dominio financiero y afinado mediante QLoRA y PEFT sobre un modelo base no especificado en la informacion disponible. La model card lo etiqueta explicitamente para tareas de respuesta a preguntas financieras, razonamiento financiero, analisis de documentos corporativos y generacion aumentada por recuperacion (RAG).

El problema que aborda es el de los asistentes de analisis financiero que deben operar sobre documentos densos y estructurados, como informes 10-K, memorandos y estados financieros. Las etiquetas del repositorio mencionan los conjuntos de referencia FinQA, TAT-QA y FinanceBench, lo que sugiere que el ajuste fino se oriento a preguntas numericas sobre tablas y texto financiero.

Su relevancia practica es limitada pero concreta: es un modelo pequeno (4B) que cabe en GPU de consumo incluso en cuantizaciones de 8 bits, con licencia MIT y en ingles. No obstante, el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, la model card no documenta arquitectura, contexto ni datos de entrenamiento, y no se han publicado resultados de benchmarks. Cualquier evaluacion debe hacerse por cuenta del usuario antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Md-Asif/VANGUARD-MODEL-V1; adaptado con QLoRA/PEFT, etiquetado como transformers) |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; el modelo base se entreno con QLoRA |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en transformers, presumiblemente safetensors (no confirmado en la informacion disponible) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La libreria declarada es transformers y el pipeline no esta especificado, por lo que se asume un modelo de lenguaje causal estandar, pero no puede confirmarse si se trata de un transformer denso, un MoE o una arquitectura hibrida. El modelo base es Md-Asif/VANGUARD-MODEL-V1, del cual este repositorio es unicamente una conversion a GGUF mediante cuantizacion estatica.

Respecto al entrenamiento, las etiquetas indican el uso de QLoRA y PEFT para adaptacion de dominio, lo que implica un ajuste fino de bajo rango sobre un modelo preentrenado congelado, con cuantizacion de 4 bits durante el entrenamiento. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Los dominios declarados (FinQA, TAT-QA, FinanceBench, documentos corporativos, RAG) apuntan a un corpus de caracter financiero, pero sin cifras verificables. Las cuantizaciones incluidas son estaticas: el autor indica que no hay cuantizaciones ponderadas o con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (etiqueta "conversational").
- Respuesta a preguntas sobre documentos financieros (financial-question-answering).
- Razonamiento financiero sobre cifras, tablas y texto narrativo de informes.
- Analisis de documentos corporativos y filings (10-K, informes trimestrales, memorandos).
- Integracion en pipelines de generacion aumentada por recuperacion (RAG), segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; no se declaran.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Multilingue: no; el modelo declara unicamente ingles.

## Casos de uso

- Analisis de informes anuales (10-K y 10-Q): el modelo puede extraer y resumir partidas concretas (ingresos, margenes, riesgos declarados) a partir de fragmentos recuperados por un sistema RAG. Su tamano reducido permite desplegarlo en la misma maquina que el indice vectorial.
- Respuesta a preguntas numericas sobre tablas financieras: dado un fragmento de balance o cuenta de resultados, responder consultas del tipo "cual fue el crecimiento interanual del flujo de caja operativo", apoyandose en el ajuste orientado a FinQA y TAT-QA.
- Asistente interno para equipos de analisis: chat multi-turno en ingles donde el analista pega extractos de un informe y pregunta de forma iterativa. Requiere verificar la longitud de contexto real, no documentada.
- Triaje de documentacion en due diligence: clasificar y resumir grandes volumenes de documentos corporativos antes de la revision humana, usando la cuantizacion Q8_0 o f16 para maximizar fidelidad.
- Generacion de resumenes ejecutivos de resultados trimestrales: transformar tablas y notas al pie en un texto breve para circulacion interna, con revision humana obligatoria de todas las cifras.
- Componente de un pipeline RAG de compliance: responder preguntas sobre clausulas y obligaciones extraidas de contratos o filings, con el modelo actuando solo como redactor final sobre contexto recuperado.
- Prototipado en hardware de consumo: gracias a las cuantizaciones de 1,8 a 3,0 GB, permite experimentar con un modelo de dominio financiero en un portatil con GPU de 6-8 GB antes de escalar a un modelo mayor.
- Evaluacion comparativa de tecnicas de adaptacion de dominio: util como caso de estudio de QLoRA aplicado a finanzas frente a modelos generalistas del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque las etiquetas del repositorio mencionan FinQA, TAT-QA y FinanceBench, la model card no incluye ninguna puntuacion, tabla comparativa ni nota de evaluacion. No deben asumirse resultados derivados de esas etiquetas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto): aproximadamente 1,8 GB (Q2_K), 2,0-2,3 GB (Q3_K_S a Q3_K_L), 2,4 GB (IQ4_XS), 2,5-2,6 GB (Q4_K_S y Q4_K_M), 2,9-3,0 GB (Q5_K_S y Q5_K_M), 3,4 GB (Q6_K), 4,4 GB (Q8_0) y 8,2 GB (f16). Hay que anadir el espacio de la cache KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con 6 GB o mas para cuantizaciones Q4 y Q5; 8-12 GB para Q6_K y Q8_0; 12 GB o mas para f16 con contexto amplio. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 pueden ejecutarlo sin dificultad.
- Cabe en GPU de consumo: si. En tarjetas de 6 GB (RTX 3050, GTX 1660 Super) con cuantizaciones Q4; en 8 GB (RTX 3060 Ti, RTX 4060) con Q5 o Q6; en 12 GB o mas con Q8_0 o f16.
- Tambien es viable en CPU con llama.cpp, dado el tamano reducido, aunque con latencias mas altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y otros runners compatibles con GGUF. Para vLLM o TGI seria necesario usar el modelo base Md-Asif/VANGUARD-MODEL-V1 en safetensors, ya que esos servidores no consumen GGUF de forma nativa en todas sus versiones.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los valores de los modelos comparativos corresponden a informacion publica de sus respectivas model cards y no se han verificado contra el repositorio de VANGUARD.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| VANGUARD-MODEL-V1-GGUF | 4,02B | no disponible | MIT | Finanzas (QLoRA/PEFT) | GGUF, 12 cuantizaciones |
| Md-Asif/VANGUARD-MODEL-V1 | 4,02B (mismo modelo) | no disponible | MIT | Finanzas (modelo base) | transformers |
| Qwen2.5-4B-Instruct | 4B | 32.768 tokens nativos (ampliable) | Apache-2.0 | Generalista | Muy amplia |
| Phi-4-mini-instruct | 3,8B | 128.000 tokens | MIT | Generalista y razonamiento | Amplia |

No se han identificado en la informacion proporcionada otros modelos de ~4B especificamente ajustados para finanzas con los que establecer una comparacion directa y verificable.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion en cifras financieras: un modelo de 4B ajustado con QLoRA puede generar importes, porcentajes o referencias normativas plausibles pero incorrectas. Toda cifra debe validarse contra el documento fuente.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a modelos generalistas del mismo tamano, que podrian igualarlo o superarlo en tareas financieras sin ajuste especifico.
- Modelo base no documentado: se desconoce la arquitectura exacta, el tokenizador, la longitud de contexto y el volumen de datos de preentrenamiento, lo que dificulta estimar sus limites reales.
- Idioma unico: solo ingles declarado. No es adecuado para documentacion financiera en castellano sin un ajuste adicional.
- Adaptacion de bajo rango sobre un modelo pequeno: el ajuste QLoRA puede producir sobreajuste al formato de los conjuntos FinQA, TAT-QA o FinanceBench y degradar el rendimiento en dominios adyacentes.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni evaluaciones de terceros. El repositorio se creo y actualizo en octubre de 2026.
- Cuantizaciones estaticas unicamente: no hay versiones ponderadas ni con imatrix, que suelen ofrecer mejor relacion calidad/tamano en los niveles bajos (Q2, Q3).
- Las cuantizaciones Q2_K y Q3_K_S implican una perdida de calidad notable; para uso financiero se recomienda Q5_K_M o superior.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin obligacion de publicar derivados, pero no exime de responsabilidad sobre los resultados generados ni de las obligaciones regulatorias del sector financiero.
- Cualquier despliegue en produccion deberia incluir supervision humana, trazabilidad de la fuente recuperada y pruebas de regresion sobre un conjunto propio antes de la puesta en servicio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VANGUARD-MODEL-V1-GGUF
- Modelo base: https://huggingface.co/Md-Asif/VANGUARD-MODEL-V1
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#VANGUARD-MODEL-V1-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para el uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable del alojamiento de las cuantizaciones: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible
