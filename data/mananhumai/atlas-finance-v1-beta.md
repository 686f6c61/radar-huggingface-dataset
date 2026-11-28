# Mananhumai/ATLAS-Finance-V1-Beta

## Resumen

ATLAS Finance V1 Beta es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-0.8B orientado a razonamiento financiero con evidencia verificable. Lo desarrolla el usuario Mananhumai y resuelve tareas como calculo de ratios y valoraciones, consultas de evidencia en datos XBRL de la SEC con citacion de identificadores, rechazo de preguntas no respondibles, comprobacion de consistencia contable, verificacion de afirmaciones, preguntas estilo FinQA, clasificacion de factores de riesgo y generacion de hallazgos de analista breves y fundamentados. Es relevante porque demuestra que un modelo de menos de 900 millones de parametros, entrenado con QLoRA en una GPU de portatil de 2 GB, puede superar ampliamente a su base en tareas financieras especializadas manteniendo el rendimiento en razonamiento general.

El checkpoint publicado corresponde a la etapa 2 de SFT en el paso 145, seleccionado por una regla de validacion que pondera 0.8 la validacion financiera y 0.2 la validacion de razonamiento general. El adaptador LoRA esta fusionado en los pesos base, por lo que el formato es identico al del modelo original (Qwen3_5ForConditionalGeneration, safetensors en bf16, misma configuracion, tokenizer y plantilla de chat). Esto permite cargarlo en cualquier motor compatible con Qwen3.5-0.8B, incluidos SGLang, vLLM y transformers.

Se trata de una version beta: los resultados de validacion estan medidos sobre el adaptador sin fusionar con la base cuantizada en 4 bits NF4, y la verificacion con los pesos bf16 fusionados de este repositorio esta pendiente, igual que los resultados sobre el conjunto de test reservado de 940 elementos. Tampoco se han evaluado las entradas de imagen ni la decodificacion especulativa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal hibrida (Qwen3_5ForConditionalGeneration), 24 capas, con torre de vision y cabeza MTP |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de despliegue con SGLang) |
| Tipos de cuantizacion | Base entrenada en NF4 (QLoRA); pesos publicados en bf16 safetensors |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de 24 capas que combina atencion lineal (proyecciones in_proj_qkv/z/a/b y out_proj) con atencion estandar (q/k/v/o) y bloques MLP con proyecciones gate/up/down. Incluye ademas una torre de vision para entradas image-text-to-text y una cabeza MTP (multi-token prediction) para decodificacion especulativa, ninguna de las cuales fue ajustada. El ajuste afecta unicamente a 186 matrices de proyeccion del modelo de lenguaje en las 24 capas; torre de vision, cabeza MTP, embeddings y normalizaciones son byte a byte identicos al modelo base, segun el manifiesto de exportacion incluido en el repositorio.

El entrenamiento se realizo en dos etapas de SFT. La etapa 1 uso tareas verificadas de XBRL de la SEC, FinQA con programas reejecutados y datos generados por un profesor (GMI-teacher) filtrados por acuerdo, validacion determinista y un critico. La etapa 2 mezclo un 85 por ciento de datos financieros y un 15 por ciento de razonamiento general (conjuntos de entrenamiento de GSM8K y ARC), con aproximadamente 1,05 millones de tokens. Los hiperparametros fueron QLoRA sobre base NF4, LoRA con r=32, alpha=64, dropout 0.05, autocast en fp16 y tasa de aprendizaje 1e-4. Las empresas usadas como benchmark (tickers y CIK) y los documentos de desarrollo y test de FinQA se excluyeron del entrenamiento.

## Capacidades

- Generacion de texto y razonamiento financiero con salida estructurada en un unico objeto JSON.
- Calculo de ratios y valoraciones (margenes, metricas contables) a partir de cifras proporcionadas.
- Consultas de evidencia sobre datos XBRL de la SEC con citacion de identificadores de evidencia y calculo de precision de citacion.
- Rechazo explicito de preguntas no respondibles: responde `null` con lista vacia de evidencias en lugar de adivinar.
- Comprobacion de consistencia contable y verificacion de afirmaciones financieras.
- Preguntas sobre informes estilo FinQA.
- Clasificacion de factores de riesgo.
- Generacion de hallazgos de analista breves y fundamentados en evidencia.
- Modo thinking desactivable mediante `enable_thinking`; la plantilla de chat incluida lo desactiva por defecto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Capacidades de vision: la arquitectura incluye torre de vision, pero no se han evaluado las entradas de imagen en este ajuste.

## Casos de uso

- Extraccion de metricas financieras en pipelines automatizados: el modelo recibe cifras de ingresos y costes y devuelve un JSON con respuesta, unidad y desglose aritmetico, lo que facilita su integracion en procesos ETL y validacion posterior.
- Analisis de informes 10-K y presentaciones XBRL: con el prompt de evidencia, el modelo localiza hechos etiquetados por ID y devuelve la respuesta junto con los identificadores citados, permitiendo auditar cada afirmacion contra la fuente.
- Verificacion de afirmaciones en contenidos de analisis: dado un conjunto de hechos etiquetados, el modelo comprueba si una afirmacion se sostiene y cita la evidencia, util para revision editorial o control de calidad.
- Control de consistencia contable: el modelo detecta incoherencias entre partidas (por ejemplo, margenes que no cuadran con ingresos y costes) y las reporta en formato estructurado, adecuado para validaciones previas al cierre.
- Clasificacion de factores de riesgo: permite etiquetar fragmentos de informes regulatorios en categorias de riesgo con una precision de validacion del 72,7 por ciento frente al 36,4 por ciento del base, util en cribado documental a gran escala.
- Asistente de analisis con rechazo controlado: en preguntas sin evidencia suficiente responde `null` en el 100 por cien de los casos de validacion, lo que reduce el riesgo de respuestas inventadas en flujos donde la exactitud prima sobre la cobertura.
- Despliegue en entornos con recursos limitados: con menos de 900 millones de parametros y pesos bf16 de 1,8 GB, puede servirse en una sola GPU consumer o incluso entrenarse en una GPU de portatil de 2 GB, lo que abarata prototipos y pruebas internas.

## Benchmarks y rendimiento

Resultados de validacion medidos sobre el adaptador sin fusionar con la base en 4 bits NF4, decodificacion greedy y thinking desactivado. Los resultados sobre el conjunto de test reservado de 940 elementos estan pendientes, y estas cifras no se han reproducido todavia con los pesos bf16 fusionados del repositorio.

| Modelo | Validacion financiera (526) | Validacion general (200: GSM8K 100 + ARC 100) | Puntuacion de seleccion | JSON valido | Alucinacion | Precision de citacion |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B base | 14,1% | 46,0% | 0,2045 | 70,5% | 26,5% | 60,7% |
| ATLAS Finance V1 SFT etapa 1 | 44,1% | 25,0% | 0,4029 | 99,8% | 0,0% | 100% |
| ATLAS Finance V1 etapa 2, paso 145 | 46,2% | 47,0% | 0,4636 | 99,0% | 3,5% | 99,2% |

Desglose por categoria en validacion financiera (este modelo frente al base): consistencia 48% (48%), contrarian 70% (15%), evidence_qa 76,7% (28,3%), fin_calc 44,2% (13,3%), fin_math 24% (2%), finqa 28,4% (2,7%), grounded_analysis 15% (0%), risk_classify 72,7% (36,4%), unanswerable 100% (7,4%).

Sobre los 526 elementos de validacion financiera, el paso del base a este modelo corrige 198 elementos y rompe 29 (McNemar exacto, p < 1e-6). En el conjunto de razonamiento general el cambio no es significativo (46,0% a 47,0%, p = 0,89).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en bf16 para los pesos; con cache KV y margen de ejecucion, entre 3 y 5 GB en funcion de la longitud de contexto hasta 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto completo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. El entrenamiento QLoRA se realizo en una GPU de portatil de 2 GB.
- Cabe en GPU consumer: si, en practicamente toda la gama actual con 8 GB o mas; en configuraciones de 4 GB puede requerir cuantizacion adicional.
- Opciones de despliegue: SGLang (version 0.5.9 o superior), vLLM y transformers. El autor documenta el arranque con `python3 -m sglang.launch_server` con `--dtype bfloat16 --context-length 8192 --mem-fraction-static 0.8`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Validacion financiera | Validacion general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ATLAS Finance V1 Beta | 873 M | 8192 | 46,2% | 47,0% | apache-2.0 | Hugging Face |
| Qwen3.5-0.8B base | no disponible | no disponible | 14,1% | 46,0% | no disponible | Hugging Face |
| ATLAS Finance V1 SFT etapa 1 | 873 M (derivado) | 8192 | 44,1% | 25,0% | apache-2.0 | no disponible |

No se dispone de datos de otros modelos financieros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno: su conocimiento del mundo es limitado y puede producir cifras incorrectas; el autor recomienda verificar siempre las respuestas contra la evidencia citada.
- Version beta: los resultados de validacion proceden del montaje de evaluacion en 4 bits y no se han reproducido con los pesos bf16 fusionados; los resultados de test estan pendientes.
- No evaluado en entradas de imagen ni en decodificacion especulativa MTP; la cabeza MTP es la del modelo base y no fue ajustada.
- Tasa de alucinacion del 3,5% en validacion, frente al 0% de la etapa 1; la mejora en razonamiento general de la etapa 2 tiene ese coste.
- Solo soporta ingles, lo que limita su uso en entornos en castellano sin traduccion previa.
- Rendimiento bajo en algunas categorias: grounded_analysis 15%, fin_math 24% y finqa 28,4%, muy por debajo de las categorias de evidencia y clasificacion.
- Entrenado y evaluado con thinking desactivado; el uso con thinking activado no esta validado.
- Requiere decodificacion greedy (temperatura 0) y los prompts de sistema de ATLAS para reproducir los resultados; otros prompts pueden degradar el formato JSON.
- Licencia apache-2.0, que permite uso comercial, pero sin garantias por parte del autor dado el estado beta del modelo.
- Riesgo de sesgo heredado del corpus de entrenamiento (documentos de la SEC y datos sinteticos filtrados por profesor), no cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mananhumai/ATLAS-Finance-V1-Beta
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documentacion del dataset del proyecto (`DATASET.md`): referenciada en la model card, sin URL publica en la informacion disponible
- Manifiesto de exportacion (`export_manifest.json`): incluido en el repositorio, sin URL directa en la informacion disponible
