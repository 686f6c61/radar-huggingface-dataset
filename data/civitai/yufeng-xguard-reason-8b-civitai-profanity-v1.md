# Civitai/YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1

## Resumen

YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1 es un clasificador de texto especializado en detectar y graduar lenguaje soez (profanity) en tres niveles de severidad (L0, L1 y L2). Lo desarrolla Civitai como un fine-tuning del modelo base Alibaba-AAIG/YuFeng-XGuard-Reason-8B, un transformer de 8.190.735.360 parametros construido sobre la familia Qwen3. El resultado es un checkpoint Transformers fusionado (LoRA ya aplicada), distribuido en safetensors con pesos BF16, que se usa como clasificador semantico de moderacion de contenido y no como modelo generativo de proposito general.

La relevancia del modelo esta en su enfoque: no es un filtro de palabras clave, sino un clasificador semantico que evalua el texto completo bajo una politica explicita. Distingue entre ausencia de tacos (L0), insultos o palabrotas leves-moderadas (L1) y obscenidad fuerte, incluidas variantes ofuscadas, abreviaturas y compuestos (L2). El autor publica la politica de anotacion, los umbrales congelados, los informes de metricas y el paquete de reproducibilidad del entrenamiento, lo que facilita auditar su comportamiento.

El modelo esta pensado para pipelines de moderacion en ingles. Su contrato de decodificacion es estricto: BF16 con SDPA, plantilla de chat original, `reason_first=false` y un unico token de decision, con un presupuesto validado de 4.095 tokens de entrada mas uno de salida. Es, por tanto, una pieza de infraestructura de moderacion, no un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), checkpoint fusionado con LoRA aplicada |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.095 tokens de entrada + 1 token de salida (presupuesto validado) |
| Tipos de cuantizacion | BF16 (referencia); otras cuantizaciones requieren comprobacion de paridad, no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers, BF16) |

## Arquitectura y entrenamiento

El modelo parte de Alibaba-AAIG/YuFeng-XGuard-Reason-8B (revision `383dd1079ef2708ef9f57622243885506dd38987`), un transformer de 8.19B parametros de la familia Qwen3 orientado a razonamiento y moderacion. Civitai aplica un fine-tuning especifico para la tarea de profanity y fusiona el adaptador LoRA en los pesos base, de modo que el repositorio raiz es un checkpoint Transformers estandar con el adaptador ya integrado. El entrenamiento completo tres epocas y 2.250 actualizaciones del optimizador; se selecciono el paso 2.250 por macro F1 de validacion.

Los datos canonicos son 24.000 textos de entrenamiento, 3.000 de validacion y 3.000 de test, todos en ingles y con dos decisiones booleanas independientes por texto (LanguageAny y LanguageStrong). Las etiquetas originales de toxicidad u ofensividad de la fuente no se mapearon directamente a los niveles de profanity; los casos de politica no resueltos se excluyeron del conjunto de entrenamiento en lugar de convertirse silenciosamente en L0. La innovacion tecnica destacable es el contrato de inferencia: se puntua P(`x`, token87) sobre el vocabulario completo, redondeado a cuatro decimales y a cero si `x` no aparece en el top-20, sin renormalizar probabilidades ni truncar la entrada. Los umbrales fusionados son LanguageAny 0.8174 y LanguageStrong 0.622; L2 gana si Strong alcanza su umbral, si no Any alcanza el suyo implica L1, y en caso contrario L0.

## Capacidades

- Clasificacion de profanity en tres niveles (L0, L1, L2) con la maxima severidad presente como resultado.
- Deteccion semantica de obscenidad fuerte, incluidos compuestos claros, derivados, abreviaturas y ofuscaciones en contexto.
- Tratamiento de profanity citada, desaprobada, amistosa o humoristica como profanity valida.
- Exclusion de falsos positivos por parecido de subcadena: significados literales inofensivos y nombres propios no se convierten en profanity.
- Salida estructurada con `language_level` (0/1/2), `label`, ambas puntuaciones de atributo y los umbrales congelados.
- Procesamiento por lotes mediante JSONL de entrada y salida (`infer.py`), con soporte de JSONL por stdin o fichero UTF-8 completo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un clasificador de una sola decision.
- Capacidad multilingue: solo ingles.

## Casos de uso

- Moderacion de comentarios en foros y comunidades: el modelo clasifica cada comentario completo y devuelve un nivel L0/L1/L2 que permite aplicar acciones escalonadas (publicar, revisar, ocultar) sin depender de listas de palabras.
- Filtrado previo en plataformas de generacion de contenido: integrado en el pipeline de ingesta, descarta o marca prompts y descripciones con obscenidad fuerte antes de que lleguen a los modelos generativos.
- Revision asistida por moderadores humanos: los casos L1 y L2 se enrutan a una cola de revision con la puntuacion de confianza, reduciendo el volumen de textos que un humano debe leer.
- Cumplimiento de politicas de comunidad: genera evidencia auditable (nivel, puntuaciones, umbrales) para justificar decisiones de moderacion ante reclamaciones.
- Analisis de toxicidad en datasets: clasifica corpus de entrenamiento o evaluacion en ingles para medir la prevalencia de profanity por nivel antes de usarlos.
- Deteccion de evasion por ofuscacion: identifica variantes abreviadas u ofuscadas que los filtros lexicos pasan por alto, gracias a su naturaleza semantica.
- Monitorizacion de canales de soporte: marca conversaciones con insultos dirigidos a agentes para su escalado, manteniendo el contexto completo dentro del presupuesto de 4.095 tokens.

## Benchmarks y rendimiento

| Evaluacion | Macro F1 | Accuracy |
|---|---:|---:|
| Modelo base original, calibrado en validacion, test retenido | 71,79% | 87,67% |
| Adaptador sin fusionar seleccionado, test retenido | 99,00% | 99,40% |
| Modelo fusionado, validacion de profanity | 99,57% | 99,80% |
| Modelo fusionado, confirmacion de empaquetado sobre el mismo test | 99,00% | 99,40% |

| Clase en test fusionado | Soporte | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| L0 | 2282 | 99,52% | 99,74% | 99,63% |
| L1 | 383 | 98,44% | 98,69% | 98,57% |
| L2 | 335 | 99,70% | 97,91% | 98,80% |

Las referencias son textos en ingles revisados por IA con alta confianza, no anotacion humana de moderadores ni precision en produccion. La prueba de confirmacion repite el mismo test y no constituye un holdout nuevo e intacto. La diferencia media absoluta de puntuacion tras la fusion en las 6.000 decisiones de validacion fue 0,00007432, con un maximo de 0,1224.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos (8,19B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 24 GB o superior.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con margen limitado; para lotes grandes, GPU de centro de datos.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con lotes pequenos; en GPUs de 16 GB requeriria cuantizacion, cuya paridad con el contrato de referencia no esta validada.
- Opciones de despliegue: Transformers con el script `infer.py` incluido (referencia BF16/SDPA); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints gestionados, aunque no se documenta paridad para otros backends.
- Latencia y throughput: no disponibles. El autor advierte que distintos backends de serving, cuantizacion o formas de lote requieren comprobaciones de paridad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1 | 8,19B | 4.095 tokens de entrada | Clasificador de profanity L0/L1/L2 en ingles | Apache 2.0 | Hugging Face (Civitai) |
| Alibaba-AAIG/YuFeng-XGuard-Reason-8B (base) | 8,19B | no disponible | Modelo de moderacion/razonamiento general | no disponible | Hugging Face |
| Filtros lexicos de profanity | no aplica | ilimitado | Coincidencia de palabras y expresiones | variable | Amplia |

No se dispone de datos de benchmarks comparativos con otros clasificadores de moderacion en la informacion proporcionada. El modelo base original obtiene 71,79% de macro F1 en el test retenido frente al 99,00% del fine-tuning, lo que cuantifica la mejora especifica de la tarea.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta validado.
- Las metricas proceden de referencias revisadas por IA, no de anotacion humana de moderadores ni de precision en produccion; pueden sobreestimar el rendimiento real.
- La confirmacion sobre el test reutiliza el mismo conjunto y no es un holdout nuevo; el rendimiento en datos futuros puede diferir.
- La fusion de pesos no es bit-identica a aplicar el adaptador en tiempo de ejecucion; cambios de backend, cuantizacion o forma de lote exigen comprobaciones de paridad.
- El contrato de inferencia es estricto: no se debe renormalizar, volver a aplicar el adaptador, truncar la entrada ni sustituir las politicas congeladas, so pena de invalidar los umbrales.
- Presupuesto de contexto limitado a 4.095 tokens de entrada; textos mas largos requieren estrategia de segmentacion no documentada.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y negativos en la clasificacion; el autor excluyo casos de politica no resueltos, lo que puede dejar fuera situaciones limite.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de adecuacion para produccion ni de cumplimiento normativo en moderacion.
- El modelo se publica con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de adopcion ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Civitai/YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1
- Modelo base: https://huggingface.co/Alibaba-AAIG/YuFeng-XGuard-Reason-8B
- Perfil de Civitai en Hugging Face: https://huggingface.co/Civitai
- Repositorio de Civitai en GitHub: https://github.com/civitai/civitai
- Sitio de Civitai: https://civitai.com/
- Politica de anotacion (en el repo): policies/annotation-policy.md
- Politica LanguageAny (en el repo): policies/LanguageAny.txt
- Politica LanguageStrong (en el repo): policies/LanguageStrong.txt
- Contrato de entrada/decodificacion (en el repo): contract.py
- Configuracion de despliegue (en el repo): deployment.json
- Umbrales (en el repo): thresholds.json
- Informes de metricas (en el repo): reports/merge-check.json, reports/merged-validation-metrics.json, reports/merged-test-metrics.json, reports/adapter-heldout-comparison.json, reports/profanity-data-integrity.json, reports/training-smoke-report.json
- Guia de continuacion de entrenamiento (en el repo): CONTINUE_TRAINING.md
