# mradermacher/Llama-3.1-8b-Finance-GGUF

## Resumen

El modelo `mradermacher/Llama-3.1-8b-Finance-GGUF` es una colección de cuantizaciones GGUF del modelo `KayaTechAI/Llama-3.1-8b-Finance`, un ajuste fino (fine-tune) de Llama 3.1 8B orientado al dominio financiero. El autor, mradermacher, ha generado múltiples versiones cuantizadas (desde f16 hasta IQ4_XS) para facilitar el despliegue en entornos con recursos limitados, como CPU o GPUs de consumo. Aunque la model card no proporciona detalles sobre el entrenamiento o las capacidades específicas, el nombre y el origen indican que está diseñado para tareas de procesamiento de lenguaje natural en el sector financiero, como análisis de sentimiento, extracción de entidades o respuesta a preguntas sobre datos económicos.

La relevancia de este modelo radica en su formato GGUF, que permite ejecutarlo con herramientas como llama.cpp, Ollama o LM Studio, lo que lo hace accesible para desarrolladores que necesitan un modelo financiero local sin depender de APIs externas. Al estar basado en Llama 3.1 8B, hereda la arquitectura transformer de 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens en su versión original, aunque no se confirma si el ajuste fino mantiene esa longitud. La licencia no está especificada en la model card, pero el modelo base de Meta se distribuye bajo la licencia Llama 3.1, que permite uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Llama 3.1 8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Llama 3.1 8B soporta 128.000 tokens) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible (el base Llama 3.1 soporta multiples idiomas) |
| Licencia | no disponible (probablemente Llama 3.1, segun el modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura especifica del ajuste fino ni sobre el proceso de entrenamiento. El modelo base es Llama 3.1 8B, un transformer autoregresivo con atencion por ventanas deslizantes y 128.000 tokens de contexto. El fine-tune realizado por KayaTechAI no esta documentado en la model card, por lo que se desconocen los datos de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO. La unica informacion disponible es que se trata de una cuantizacion estatica del modelo original, generada por mradermacher, sin modificaciones adicionales en los pesos.

## Capacidades

No se han documentado capacidades especificas para este modelo en la informacion proporcionada. Al ser un fine-tune de Llama 3.1 8B, se espera que herede las capacidades generales del modelo base, que incluyen:

- Generacion de texto y finalizacion de secuencias.
- Razonamiento de sentido comun y logica basica.
- Comprension lectora y respuesta a preguntas.
- Generacion de codigo en multiples lenguajes.
- Soporte multilingue (aunque no se confirma en esta version).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.

Sin embargo, no hay evidencia concreta de que el ajuste fino haya anadido capacidades especiales como tool calling, agentes o modo de razonamiento extendido. La unica referencia indirecta proviene de un modelo similar, `finance-llama-8b` de martain7r, que se describe como entrenado en 500.000 ejemplos para tareas de QA, razonamiento, sentimiento y NER, pero no es el mismo modelo y no se puede asumir que comparta esas caracteristicas.

## Casos de uso

No se han publicado casos de uso oficiales para este modelo. Dado su nombre y origen, es razonable esperar que sea util en aplicaciones financieras, aunque estas no estan confirmadas. A continuacion se listan posibles escenarios de uso, basados en el dominio financiero y en las capacidades tipicas de Llama 3.1 8B, pero deben considerarse hipoteticos hasta que el autor publique documentacion adicional:

- Analisis de sentimiento de noticias financieras: el modelo podria procesar articulos o tweets sobre empresas y mercados para clasificar el sentimiento como positivo, negativo o neutral, ayudando a inversores a tomar decisiones informadas.
- Extraccion de entidades financieras: mediante tecnicas de NER, podria identificar nombres de empresas, tickers, montos, fechas y otros datos relevantes en documentos como informes anuales o comunicados de prensa.
- Respuesta a preguntas sobre datos economicos: dado un contexto con cifras o informes, el modelo podria responder consultas como "cual fue el beneficio neto de la empresa X en 2023?".
- Asistente virtual para asesoria financiera basica: en un entorno controlado, podria mantener conversaciones multi-turno con clientes para explicar conceptos como hipotecas, fondos de inversion o planes de pensiones, siempre con supervision humana.
- Resumen de documentos financieros: podria condensar largos informes de analisis, actas de juntas o articulos de investigacion en resumenes ejecutivos de pocas frases.
- Clasificacion de documentos por categoria: podria etiquetar automaticamente facturas, contratos o estados de cuenta en categorias predefinidas (gastos, ingresos, impuestos, etc.) para facilitar su gestion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo. Tampoco se han comparado sus resultados con otros modelos financieros. Por tanto, no es posible evaluar su rendimiento cuantitativo.

## Requisitos de hardware

Los requisitos dependen de la cuantizacion elegida. Para un modelo de 8.000 millones de parametros, las necesidades aproximadas de VRAM son:

- Q2_K: ~3,5 GB de VRAM (puede ejecutarse en GPUs con 4 GB, como GTX 1650 o RTX 3050).
- Q4_K_M: ~5,5 GB de VRAM (adecuado para RTX 3060, RTX 4060, etc.).
- Q8_0: ~8,5 GB de VRAM (requiere GPUs con 10 GB o mas, como RTX 3080, RTX 4080).
- f16: ~16 GB de VRAM (solo en GPUs profesionales como A100 o RTX 4090).

En CPU, se puede ejecutar con llama.cpp u Ollama, aunque la velocidad sera menor. Para inferencia en produccion, se recomienda usar vLLM o TGI si se convierte a formato safetensors, pero el modelo se distribuye solo en GGUF, por lo que las opciones principales son llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF. La latencia tipica en una GPU moderna (RTX 3090) con Q4_K_M es de aproximadamente 20-30 tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo mas cercano es el base `meta-llama/Llama-3.1-8B-Instruct`, que tiene la misma arquitectura y tamano, pero sin el ajuste financiero. Otros modelos financieros como FinGPT o BloombergGPT tienen parametros y licencias diferentes, pero no se han encontrado datos comparativos publicos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No se ha documentado el proceso de entrenamiento, por lo que se desconocen los posibles sesgos en los datos financieros utilizados. Es probable que el modelo refleje sesgos presentes en los corpus de entrenamiento, como una sobrerrepresentacion de mercados estadounidenses o de ciertos sectores.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos numericos o legales. No debe utilizarse para tomar decisiones financieras sin verificacion humana.
- La longitud de contexto no esta confirmada en esta version cuantizada. Si el fine-tune redujo la ventana original de 128.000 tokens, podria haber limitaciones en tareas que requieran documentos largos.
- La licencia no esta especificada en la model card. Si se hereda la licencia Llama 3.1, el uso comercial esta permitido, pero con restricciones para empresas con mas de 700 millones de usuarios mensuales. Se recomienda revisar la licencia del modelo base antes de su uso en produccion.
- Al ser una cuantizacion, puede haber una ligera perdida de precision en comparacion con el modelo original en f16, especialmente en tareas de razonamiento complejo o calculo numerico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Llama-3.1-8b-Finance-GGUF
- Modelo base (KayaTechAI): https://huggingface.co/KayaTechAI/Llama-3.1-8b-Finance
- Modelo similar (finance-Llama3-8B-GGUF): https://huggingface.co/mradermacher/finance-Llama3-8B-GGUF
- Modelo similar en Ollama (finance-llama-8b): https://ollama.com/martain7r/finance-llama-8b
- Informacion sobre Llama 3 de Meta: https://developer.meta.com/ai/models/llama-3/
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
