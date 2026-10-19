# dicksondickson/Ling-3.0-flash-Fin-oQ4e-mtp-bf16-MLX

## Resumen

`dicksondickson/Ling-3.0-flash-Fin-oQ4e-mtp-bf16-MLX` es un checkpoint cuantizado en formato MLX del modelo `inclusionAI/Ling-3.0-flash-Fin`, un MoE financiero de 124.414.211.552 parámetros totales y 5,1 mil millones activos. Lo publica el usuario dicksondickson y está pensado para ejecución local en Apple Silicon, con cuantización de 4 bits oQe y tensores críticos mantenidos en bf16.

El modelo base lo desarrolla InclusionAI, en el ecosistema de Ant Group, y se presenta como la primera variante finance-enhanced de la familia Ling 3.0. Incorpora una arquitectura MoE con atención híbrida lineal, 262.144 tokens de contexto y licencia MIT, lo que lo sitúa como una opción poco habitual para analizar documentación financiera extensa en local.

Su relevancia práctica está en que permite desplegar un modelo financiero de gran tamaño en un Mac con memoria unificada suficiente, sin enviar documentos sensibles a una API externa. Ahora bien, esta ficha describe una cuantización, no el modelo original: no hay benchmarks publicados en la información disponible y el rendimiento real dependerá de la pérdida por cuantización y del hardware.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida lineal (`bailing_hybrid`) |
| Parámetros totales | 124.414.211.552 |
| Parámetros activos | 5,1 mil millones |
| Longitud de contexto | 262.144 tokens (256K nativos; la familia Ling 3.0 Flash se documenta como extensible a 1M) |
| Tipos de cuantización | 4 bits (oQe) con tensores críticos en bf16; esta variante MLX es la única disponible en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors MLX con `custom_code`; repositorio de 143,5 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de 124B totales con 5,1B activos por token y atención híbrida lineal, identificado en los tags como `bailing_hybrid`. Esta combinación busca reducir el coste de cómputo por token frente a un modelo denso equivalente, manteniendo una capacidad de representación propia de un modelo de gran tamaño. La variante Fin está orientada a finanzas y, según la documentación disponible, se desarrolló con instituciones financieras para aplicaciones de inversión y análisis.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras etapas de alineamiento. Tampoco se detallan innovaciones de decodificación o mecanismos de atención más allá de la arquitectura híbrida. Esta ficha corresponde a una cuantización: el checkpoint se generó con oMLX 0.7.1.dev1, imatrix y el algoritmo oQe, dejando los tensores importantes en bf16 para chips Apple M3 o posteriores. No es un modelo entrenado desde cero.

## Capacidades

- Generación de texto y razonamiento orientado a finanzas: el modelo base se presenta como `finance-enhanced` y diseñado para análisis de inversión.
- Modo de razonamiento explícito (`thinking`): documentado en la familia Ling 3.0 Flash, activado por defecto y conmutable; no se detalla en la model card de esta cuantización.
- Contexto largo: 262.144 tokens, adecuado para introducir informes anuales, transcripciones y prospectos completos.
- Análisis de documentación financiera: extracción de métricas, comparación de estados financieros, identificación de factores de riesgo y resumen de llamadas de resultados.
- Ejecución local en Apple Silicon: la cuantización MLX permite inferencia en Mac con memoria unificada, sin depender de CUDA.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Análisis de informes 10-K y 10-Q: cargar el documento completo en la ventana de 262K tokens y extraer evolución de ingresos, márgenes, deuda, factores de riesgo y cambios relevantes. Es adecuado por la combinación de contexto largo y orientación financiera.
- Resumen de llamadas de resultados: procesar transcripciones extensas, comparar el guidance con trimestres anteriores e identificar cambios de tono o preguntas críticas de analistas.
- Elaboración de memorandos de inversión: sintetizar tesis, catalizadores, riesgos y comparables a partir de varios documentos, dejando la valoración final y la validación de cifras al analista.
- Extracción de cláusulas en contratos y prospectos: localizar covenants, vencimientos, condiciones de rescate y obligaciones de información en lotes de documentos financieros.
- Asistente local para equipos de finanzas: desplegar el modelo con oMLX en un Mac Studio para consultar documentación sensible sin enviarla a servicios cloud, con controles de acceso y registro de auditoría.
- Comparativa entre compañías: introducir informes de varias empresas y solicitar tablas comparativas de crecimiento, rentabilidad, apalancamiento y valoración, con revisión humana de las cifras.
- Formación interna y Q&A sobre normativa: construir un sistema RAG sobre manuales de cumplimiento y procedimientos internos, usando el modelo para redactar respuestas con referencias a las fuentes recuperadas.
- Due diligence en lotes: revisar data rooms y documentos legales-financieros por lotes, generando resúmenes y listas de puntos a verificar antes de una operación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Tampoco se dispone de métricas MMLU, HumanEval, GSM8K o evaluaciones financieras específicas para esta cuantización en las fuentes consultadas. No se deben inferir cifras a partir del tamaño del modelo.

## Requisitos de hardware

- Pesos: 143,5 GB en el repositorio. A esta cifra hay que añadir la caché KV y el overhead del entorno de ejecución MLX.
- Memoria unificada: 192 GB es el mínimo práctico; 256 GB o más es recomendable para contexto largo. Un equipo de 128 GB no puede cargar el checkpoint completo.
- Apple Silicon: orientado a M3 Ultra, M2 Ultra y configuraciones con 192-512 GB de memoria unificada. Los tensores bf16 requieren M3 o posterior según el autor.
- GPU NVIDIA: esta variante no se ejecuta en CUDA. No cabe en una RTX 4090 de 24 GB, ni en una A100 o H100 de 80 GB individuales. Para el modelo base en BF16 harían falta varias GPU de 80 GB o cuantizaciones compatibles.
- Despliegue: oMLX y MLX. vLLM, TGI, llama.cpp y Ollama no cargan este formato MLX directamente; requerirían conversión.
- Latencia y throughput: no disponibles. Al tener 5,1B parámetros activos, el coste computacional por token es menor que en un denso de 124B, pero el rendimiento estará limitado por el ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Rendimiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`oQ4e-mtp-bf16-MLX`) | 124,4B / 5,1B | 262.144 tokens | No disponible | MIT | MLX safetensors 4-bit; 143,5 GB; Apple Silicon |
| `inclusionAI/Ling-3.0-flash-Fin` | 124,4B / 5,1B | 262.144 tokens | No disponible | MIT | safetensors BF16; modelo base financiero en Hugging Face |
| `inclusionAI/Ling-3.0-flash` | 124B / 5,1B | 256K nativos, extensible a 1M | No disponible | MIT | safetensors; variante generalista de la familia Ling 3.0 |

No hay datos de benchmarks comparativos en la información disponible; la comparación anterior es de especificaciones, licencia y disponibilidad. La diferencia principal entre este checkpoint y el modelo base es la cuantización MLX, que reduce los requisitos de memoria a costa de una posible pérdida de precisión.

## Limitaciones y advertencias

- Pérdida por cuantización: el esquema 4-bit oQe puede degradar cálculos numéricos, comparaciones y razonamiento financiero. Conviene validar las salidas contra el modelo BF16 o contra fuentes primarias.
- Dependencia de Apple Silicon: el formato MLX no es directamente utilizable en pilas de producción con NVIDIA, vLLM o TGI.
- Memoria: 143,5 GB solo de pesos; no cabe en ordenadores de 128 GB y exige configuraciones de gama alta.
- Idiomas no documentados: no se puede garantizar calidad en castellano ni en otros idiomas; la model card no incluye lista de idiomas.
- Riesgo de alucinación: especialmente en cifras, fechas, referencias normativas y recomendaciones de inversión. Es obligatorio verificar contra documentos originales.
- No es asesoramiento financiero: las salidas pueden ser inexactas o incompletas y no sustituyen la revisión de un profesional ni los controles de cumplimiento normativo.
- Licencia MIT: permite uso comercial, pero no se detallan los términos de los datos de entrenamiento ni posibles restricciones heredadas del modelo base. Revisar antes de un despliegue regulado.
- `custom_code`: el repositorio requiere `trust_remote_code`; hay que auditar el código antes de ejecutarlo en entornos sensibles.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento para esta cuantización en las fuentes consultadas.
- Contexto largo: la ventana de 262K no garantiza recuperación perfecta en documentos muy extensos; la caché KV adicional consume memoria y puede afectar a la latencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dicksondickson/Ling-3.0-flash-Fin-oQ4e-mtp-bf16-MLX)
- [Modelo base `inclusionAI/Ling-3.0-flash-Fin`](https://huggingface.co/inclusionAI/Ling-3.0-flash-Fin)
- [oMLX en GitHub](https://github.com/jundot/omlx)
- [Informe de imatrix del repositorio](https://huggingface.co/dicksondickson/Ling-3.0-flash-Fin-oQ4e-mtp-bf16-MLX/blob/main/oq_imatrix_report.json)
- [Ling 3.0 Flash Fin en llm-stats](https://llm-stats.com/models/ling-3.0-flash-fin)
- [Ling 3.0 Flash Fin en Benchable](https://benchable.ai/models/inclusionai/ling-3.0-flash-fin-20260827)
- [Ling 3.0 Flash en Model Beats](https://www.modelbeats.com/models/ling-3-0-flash)
