# mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-i1-GGUF

## Resumen

CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-i1-GGUF es una cuantización GGUF con imatrix (i1) del modelo CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged, creada por mradermacher. El modelo base, desarrollado por hon9kon9ize, es un modelo especializado en cantonés que combina un modo de razonamiento (thinking) para tareas complejas de lógica, matemáticas y código con un modo no-thinking para diálogo general eficiente.

El modelo hereda la arquitectura del modelo Qwen3-30B-A3B: un Transformer con Mixture of Experts (MoE) de 30.532 millones de parámetros totales, de los cuales aproximadamente 3.000 millones se activan por token. La variante cuantizada está pensada para ejecución local en consumidores o servidores, reduciendo el peso a entre 7,2 GB y 25,2 GB.

La información disponible no especifica la longitud de contexto ni los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | ≈3.000 millones (indicado en el nombre "A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M, IQ2_XXS, IQ2_XS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K |
| Idiomas soportados | Cantonés (segun el nombre del modelo); tag de HuggingFace: en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion i1 con imatrix) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged, un modelo base construido sobre la arquitectura Qwen3-30B-A3B. Se trata de un Transformer con MoE: 30.532 millones de parámetros totales, con un subconjunto de aproximadamente 3.000 millones activos por token. Esta disposición permite un coste computacional comparable al de un modelo denso de 3B mientras mantiene la capacidad de un modelo de 30B.

La componente "Chat-Vector-Merged" del nombre indica que el modelo base es una fusión de vectores entre un modelo de chat y un modelo de thinking. Según la información del autor, esto permite alternar de manera fluida entre el modo thinking para razonamiento complejo, matemáticas y código, y el modo no-thinking para diálogo general. Los datos de entrenamiento y las técnicas de fine-tuning (RLHF, DPO) no están disponibles en la información proporcionada.

La cuantización realizada por mradermacher emplea imatrix, generando quants ponderados por la matriz de importancia que suelen conservar mejor la calidad que las cuantizaciones estáticas equivalentes.

## Capacidades

- Alternancia entre modo thinking y no-thinking dentro de un mismo modelo, lo que permite resolver tareas complejas de razonamiento, matemáticas y código con respuestas más profundas y pasar a un modo rápido para conversaciones generales.
- Generación de texto en cantonés, segun la denominación del modelo.
- Ejecución local mediante formato GGUF, compatible con llama.cpp, Ollama y otros motores que soporten este formato.
- Conversacional, segun el tag de HuggingFace, lo que indica preparación para diálogo multi-turno.
- Disponibilidad de una amplia gama de cuantizaciones, desde IQ1_M (7,2 GB) hasta Q6_K (25,2 GB), que permiten adaptar el modelo a distintos niveles de VRAM.

Nota: la información proporcionada no especifica soporte de tool calling, function calling ni capacidades multimodales.

## Casos de uso

- Asistente virtual en cantonés: el modo no-thinking permite respuestas rapidas para consultas cotidianas, lo que lo hace adecuado para chatbots de soporte en empresas de Hong Kong o Guangdong.
- Tutor de matemáticas y logica: el modo thinking puede desglosar problemas paso a paso, siendo util en aplicaciones educativas o herramientas de autoaprendizaje en cantonés.
- Generacion de codigo: el modo thinking esta orientado a tareas de programacion; mediante un motor GGUF local puede integrarse en entornos de desarrollo para asistencia en escritura de codigo.
- Procesamiento de documentos en cantonés: puede emplearse para resumir o extraer información de textos extensos, aunque es necesario verificar la longitud de contexto real antes de desplegarlo en producción.
- Investigación sobre cuantización: al existir tantos niveles de cuantización imatrix, el modelo permite evaluar empiricamente la perdida de calidad entre Q4_K_M, Q5_K_S o Q6_K en un modelo MoE.
- Chatbot de atencion al cliente: su formato conversacional y la capacidad de razonar sobre consultas complejas (devoluciones, incidencias, dudas tecnicas) lo convierten en una opcion viable para el soporte bilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: debe reservarse aproximadamente el tamaño del archivo GGUF mas un overhead para el contexto. Para la cuantizacion Q4_K_M (18,7 GB) se recomiendan al menos 20 GB de VRAM; para Q6_K (25,2 GB), alrededor de 27 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB): apta para cuants hasta Q5_K_S (21,2 GB).
  - A100 40GB o H100 80GB: aptas para Q6_K (25,2 GB) con margen para contexto.
  - GPUs con 12-16 GB de VRAM: pueden ejecutar cuants como IQ1_M (7,2 GB) o IQ3_M (13,6 GB), con perdida de calidad notable.
- Formato GGUF: compatible con llama.cpp, Ollama, LM Studio y otras herramientas similares.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos ni datos de modelos alternativos.

## Limitaciones y advertencias

- Las cuantizaciones mas agresivas (IQ1_M o IQ2_XXS) pueden degradar gravemente la calidad de la salida; se recomienda Q4_K_M o superior para tareas de razonamiento.
- La longitud de contexto no está especificada, lo que impide dimensionar correctamente aplicaciones que requieran procesar documentos largos.
- Hay una contradicción aparente entre el tag de idioma ("en") y el nombre del modelo (cantonés). Es necesario validar el rendimiento real en ambos idiomas antes de su despliegue.
- Riesgo de alucinaciones inherente a los modelos generativos. Las salidas deben verificarse en sistemas criticos.
- No se han publicado evaluaciones de sesgos ni benchmarks, por lo que el comportamiento en escenarios de produccion debe ser auditado por el equipo integrador.
- El modelo base es un merge de vectores, lo que puede introducir comportamientos impredecibles en tareas fuera del dominio de entrenamiento.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-i1-GGUF
- Modelo base: https://huggingface.co/hon9kon9ize/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged
- Repositorio de mradermacher: https://huggingface.co/mradermacher
- Quants estáticos del mismo modelo: https://huggingface.co/mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-GGUF
- Pagina de descarga conveniente: https://hf.tst.eu/model#CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-i1-GGUF
