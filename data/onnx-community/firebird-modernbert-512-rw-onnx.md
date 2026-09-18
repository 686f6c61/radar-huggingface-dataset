# onnx-community/Firebird-ModernBERT-512-RW-ONNX

## Resumen

Firebird-ModernBERT-512-RW-ONNX es la conversión al formato ONNX del checkpoint noumenon-labs/Firebird-ModernBERT-512-RW, un clasificador binario de texto construido sobre un encoder ModernBERT de aproximadamente 149 millones de parámetros y una longitud máxima de secuencia de 512 tokens. El modelo asigna cada fragmento de texto a una de dos clases: `0` (texto humano) o `1` (texto generado por IA). La conversión la ha realizado la organización onnx-community de forma automática mediante un Space de Hugging Face, sin reentrenamiento adicional.

El checkpoint original es un derivado experimental del clasificador Firebird-ModernBERT-512, sometido a un proceso que el autor denomina post-entrenamiento con ponderación por recompensa (reward-weighted post-training). En ese proceso se mantuvo congelado el modelo original como referencia, se reponderaron los ejemplos difíciles y se aplicó una penalización KL contra la referencia. El objetivo declarado era reducir los falsos positivos sobre texto humano sin sacrificar la detección de texto de IA.

La relevancia de esta versión concreta es de despliegue: el formato ONNX y la librería transformers.js permiten ejecutar el clasificador en navegador o en el borde de la red (WebGPU/WASM), sin GPU dedicada ni servicios externos, algo poco habitual en detectores de texto de IA. La model card no especifica la licencia, ni del checkpoint base ni de esta conversión, lo que limita su uso comercial sin aclaración previa por parte del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional de la familia ModernBERT (modelo base: noumenon-labs/Firebird-ModernBERT-512-RW) |
| Parametros totales | ~149 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (máximo de secuencia) |
| Tipos de cuantizacion | No disponible. El repositorio se distribuye en formato ONNX y las etiquetas de Hugging Face lo marcan como derivado cuantizado del checkpoint base, pero la model card no detalla ningún esquema (INT8, FP16, Q4, etc.) |
| Idiomas soportados | Inglés (`en`). No se declara soporte multilingüe |
| Licencia | No disponible |
| Formato de pesos | ONNX. Tamaño del repositorio: 1,3 GB |
| Tarea | Clasificación de texto binaria (text-classification): `0` = HUMAN, `1` = AI |
| Libreria declarada | transformers.js |
| Modelo base | noumenon-labs/Firebird-ModernBERT-512-RW |
| Fecha de publicación | 18 de septiembre de 2026 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencia basado en un encoder transformer bidireccional de la familia ModernBERT, con aproximadamente 149 millones de parámetros y una ventana máxima de 512 tokens. La model card de esta conversión no detalla la composición del corpus de preentrenamiento ni los hiperparámetros del checkpoint base Firebird-ModernBERT-512, por lo que no es posible documentar aquí el volumen de tokens, la mezcla de datos ni si hubo fases de ajuste instructivo. La conversión a ONNX se realizó de forma automática con el Space `onnx-community/convert-to-onnx`, es decir, sin entrenamiento adicional: el comportamiento del modelo debe corresponder al del checkpoint PyTorch original, sujeto a las diferencias numéricas propias de la conversión.

Lo que sí se documenta en detalle es la fase de post-entrenamiento del checkpoint original, que da lugar al modelo del que deriva esta conversión. Se trata de un post-entrenamiento de clasificador ponderado por recompensa: el checkpoint Firebird original se mantuvo congelado como referencia, los ejemplos de entrenamiento se puntuaron con el clasificador original y los ejemplos difíciles recibieron mayores pesos de pérdida, con una penalización KL que restringe al modelo ajustado respecto a la referencia. La función objetivo aproximada es `L = weighted_cross_entropy + beta * KL(reference || policy)`. La configuración del experimento Exp001 fue: `beta` de KL 0,10, learning rate 5e-6, 1 época, 53.598 ejemplos de entrenamiento, 1.675 pasos de optimizador, batch size 32, acumulación de gradiente 1, ejecución en una RTX 4090 de 24 GB durante aproximadamente 17 minutos. El autor aclara explícitamente que esto no es RL en el sentido convencional de PPO, GRPO o RLHF, ya que Firebird es un encoder discriminativo y no una política generativa: se optimizó directamente un objetivo de clasificación diferenciable y ponderado. Los ejemplos humanos difíciles recibieron mayor peso, con el objetivo de reducir las detecciones falsas de texto humano como IA.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve una puntuación que indica si el fragmento es humano (`0`) o generado por IA (`1`).
- Trabaja con textos de hasta 512 tokens por fragmento; los documentos más largos requieren troceado previo.
- Salida probabilística, por lo que el umbral de decisión es ajustable según la relación deseada entre falsos positivos y falsos negativos.
- Inferencia en navegador y en el borde mediante ONNX y transformers.js, con soporte de WebGPU/WASM.
- Ejecución por lotes en servidor a través de ONNX Runtime para etiquetado masivo de corpus.
- Rendimiento especialmente orientado a preservar el recall de texto de IA (99,63% en el conjunto de validación fuera de distribución Earlybird-V2) reduciendo a la vez los falsos positivos sobre humanos.
- No genera texto: no dispone de decodificación, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No tiene capacidades multimodales: no procesa imagen, audio ni vídeo.
- No se declara soporte multilingüe; el único idioma indicado es el inglés.

## Casos de uso

- Moderación de contenido en foros, redes y plataformas de comentarios: el clasificador puede puntuar cada envío en el momento de la publicación y marcar automáticamente los textos con alta probabilidad de ser generados por IA, con el umbral ajustado para no penalizar a usuarios humanos legítimos (el ajuste Exp001 reduce el FPR humano en el conjunto Earlybird-V2 del 32,58% al 26,57%).
- Triaje previo a revisión humana en redacciones y agencias de contenido: en lugar de revisar manualmente todas las piezas, se clasifican primero y solo se escalan a un editor las que superan el umbral, reduciendo el volumen de revisión.
- Curación de datos de entrenamiento: al etiquetar grandes corpus con un modelo de 149M de parámetros se puede filtrar texto sintético de los conjuntos de preentrenamiento a un coste computacional muy bajo, con procesamiento por lotes en ONNX Runtime.
- Detección de reseñas y opiniones falsas en comercio electrónico: la clasificación por fragmentos permite señalar lotes de reseñas redactadas de forma sintética, combinando la señal del clasificador con metadatos de la cuenta.
- Análisis académico y estudio del sesgo de los detectores: el modelo es útil como objeto de estudio, ya que la model card publica curvas de FPR frente a recall y comparaciones emparejadas con el checkpoint de referencia, lo que permite reproducir análisis de calibración.
- Ejecución en el cliente para preservar la privacidad: al distribuirse en ONNX y funcionar con transformers.js, la clasificación puede hacerse íntegramente en el navegador del usuario sin enviar el texto a un servidor, algo relevante en documentos personales o internos.
- Filtrado de correo y formularios web: integrado en la validación de entrada, puede marcar envíos generados automáticamente (phishing, spam de formularios) antes de llegar a la cola de atención.
- Investigación sobre distribución de texto sintético: la existencia de una partición de validación fuera de distribución (Earlybird-V2, `validation_ood`, 26.705 ejemplos) facilita medir el comportamiento bajo cambio de dominio antes de desplegar el modelo en un corpus nuevo.

## Benchmarks y rendimiento

Earlybird distribution-shift stress test. Conjunto `noumenon-labs/Earlybird-V2`, partición `validation_ood`, N = 26.705, umbral 0,50:

| Metrica | Firebird original | Reward-Weighted (Exp001) |
|---|---:|---:|
| Accuracy | 80,51% | 84,01% |
| Balanced accuracy | 83,63% | 86,53% |
| Macro F1 | 80,51% | 83,99% |
| MCC | 0,6729 | 0,7223 |
| AUROC | 0,9825 | 0,9805 |
| FPR sobre humanos | 32,58% | 26,57% |
| Recall sobre humanos | 67,42% | 73,43% |
| Recall sobre IA | 99,84% | 99,63% |
| Precisión sobre IA | 67,48% | 71,75% |

Comparación emparejada: 959 errores del modelo original corregidos, 24 errores nuevos introducidos, 935 correcciones netas. Se arreglaron 959 falsos positivos sobre humanos, se rompió 1 ejemplo humano correcto y se rompieron 23 ejemplos de IA correctos.

AI Text Detection Pile Cleaned. Conjunto `srikanthgali/ai-text-detection-pile-cleaned`, partición `validation`, N = 72.162, umbral 0,50:

| Metrica | Firebird original | Reward-Weighted (Exp001) |
|---|---:|---:|
| Accuracy | 82,26% | 81,19% |
| Balanced accuracy | 82,26% | 81,20% |
| MCC | 0,6459 | 0,6250 |
| AUROC | 0,8941 | 0,8984 |
| FPR sobre humanos | 20,19% | 15,78% |
| Recall sobre humanos | 79,81% | 84,22% |
| Recall sobre IA | 84,70% | 78,17% |
| Precisión sobre IA | 80,80% | 83,25% |

Umbral 0,50 con recall de IA emparejado:

| Recall IA | FPR original | FPR Exp001 |
|---:|---:|---:|
| 70% | 13,19% | 12,51% |
| 75% | 15,22% | 14,40% |
| 80% | 17,47% | 16,66% |
| 85% | 20,38% | 19,38% |
| 90% | 24,38% | 23,51% |
| 95% | 31,93% | 30,85% |

Umbral 0,50 con FPR humano emparejado:

| FPR humano | Recall IA original | Recall IA Exp001 |
|---:|---:|---:|
| 5% | 38,82% | 39,31% |
| 10% | 60,21% | 61,84% |
| 15% | 74,60% | 76,41% |
| 20% | 84,49% | 85,90% |
| 25% | 90,61% | 91,25% |
| 30% | 94,03% | 94,50% |

En el barrido de puntos de operación entre 0,1% y 40% de FPR humano, Exp001 obtuvo mayor recall de IA en aproximadamente el 99,9% de los puntos muestreados, con una mejora media de +1,014 puntos porcentuales a FPR humano emparejado. AUROC en Pile: original 0,894066; Exp001 0,898377; delta +0,004311. El mejor MCC encontrado en el barrido diagnóstico de umbrales fue 0,664386 con umbral 0,302 para el original y 0,673120 con umbral 0,125 para Exp001; el autor advierte que estos umbrales se seleccionaron retrospectivamente sobre el propio benchmark y son resultados diagnósticos, no umbrales de despliegue.

Prueba de estrés con contexto humano de HellaSwag. HellaSwag no es un benchmark de detección de texto de IA; sus contextos humanos se usaron únicamente como prueba de cambio de distribución. Tras eliminar metadatos de tipo corchete propios de HellaSwag: FPR humano del 88,00% en el modelo original y del 81,86% en Exp001. El autor califica el resultado como pobre en términos absolutos y señala que expone una debilidad pendiente para textos humanos inusuales o de formato poco común. La información proporcionada se interrumpe en este punto de la model card.

No se han publicado en la información disponible resultados de benchmarks de esta conversión ONNX concreta (los datos anteriores corresponden al checkpoint PyTorch del que deriva).

## Requisitos de hardware

- Tamaño de pesos estimado a partir de los ~149M de parámetros: aproximadamente 0,6 GB en FP32, 0,3 GB en FP16 y 0,15 GB en INT8. El repositorio completo ocupa 1,3 GB, lo que sugiere que incluye más de una variante de precisión, aunque la model card no lo detalla.
- VRAM de inferencia: por debajo de 2 GB en FP32 y por debajo de 1 GB en FP16 para lotes pequeños con secuencias de 512 tokens, incluyendo activaciones. Cifras estimadas a partir del recuento de parámetros, no publicadas por el autor.
- Cabe en cualquier GPU de consumo: desde una GTX 1060 de 6 GB o una RTX 3060 en adelante. También es viable en CPU, dado el tamaño del modelo.
- Ejecución en navegador con transformers.js (WebGPU o WASM), sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime en servidor, transformers.js en navegador o edge. vLLM y llama.cpp no son aplicables, ya que el modelo es un encoder de clasificación y no un modelo generativo en formato GGUF.
- Latencia y throughput: no disponible. El único dato temporal publicado se refiere al entrenamiento (unos 17 minutos para 1.675 pasos en una RTX 4090 de 24 GB), no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Firebird-ModernBERT-512-RW-ONNX (este) | ~149M | 512 tokens | Clasificación binaria humano/IA, formato ONNX | No disponible | Hugging Face (onnx-community), 0 descargas |
| noumenon-labs/Firebird-ModernBERT-512-RW | ~149M | 512 tokens | Clasificación binaria humano/IA, PyTorch (checkpoint de origen) | No disponible | Hugging Face |
| noumenon-labs/Firebird-ModernBERT-512 | ~149M | 512 tokens | Clasificación binaria humano/IA (checkpoint base y modelo de referencia congelado) | No disponible | Hugging Face |
| Detectores comerciales (GPTZero, Originality.ai y similares) | No disponible | No disponible | Detección de texto de IA | Propietaria | Servicio cerrado, sin pesos publicados |

No se dispone de cifras comparativas verificables frente a otros detectores de texto de IA de código abierto, porque la información proporcionada solo incluye la comparación emparejada entre este checkpoint y su referencia Firebird original. Cualquier comparación con detectores comerciales sería aproximada y no está respaldada por datos publicados en la model card.

## Limitaciones y advertencias

- Calibración desplazada: Exp001 asigna en general probabilidades de IA más bajas que el checkpoint original. El umbral 0,50 ya no es un punto de operación neutro; en Pile, con ese umbral, el recall de IA cae del 84,70% al 78,17%. Los umbrales óptimos encontrados (0,125 para Exp001) se seleccionaron retrospectivamente sobre el propio benchmark y no deben usarse como umbrales de producción sin recalibrar sobre datos propios.
- Falsos positivos sobre texto humano: aunque mejoran respecto al original, siguen siendo altos. En Earlybird-V2 el FPR humano es del 26,57% al umbral 0,50, y en la prueba con contextos humanos de HellaSwag asciende al 81,86%. El propio autor describe este resultado como pobre en términos absolutos.
- Sensibilidad al cambio de distribución: el rendimiento varía de forma notable entre conjuntos (AUROC 0,98 en Earlybird-V2 frente a 0,89 en Pile), por lo que el modelo no debe desplegarse en un dominio nuevo sin una evaluación previa en ese dominio.
- Solo inglés: el modelo declara únicamente el idioma `en`. No hay datos sobre su comportamiento en castellano u otros idiomas, y es previsible que se degrade.
- Límite de 512 tokens: los documentos largos deben trocearse, lo que puede fragmentar el contexto y alterar la clasificación; no se documenta ninguna estrategia de agregación entre fragmentos.
- Carácter experimental: la model card describe el checkpoint como un experimento (Exp001) de una sola época y 1.675 pasos de optimizador, con riesgo de sobreajuste a la distribución de entrenamiento.
- Licencia no disponible: al no especificarse la licencia del checkpoint base ni de la conversión, no puede asumirse permiso para uso comercial. Es necesario contactar con el autor antes de integrarlo en un producto.
- Conversión automática: el ONNX lo generó una herramienta automática de onnx-community, no el autor del modelo. No hay ninguna validación publicada de que las métricas del checkpoint PyTorch se reproduzcan exactamente en ONNX.
- Falta de validación de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, sin incidencias ni evaluaciones de terceros.
- Uso ético: un detector de texto de IA con tasas de falso positivo de dos dígitos no debería usarse como única prueba en decisiones con consecuencias para personas (académicas, laborales o disciplinarias). Requiere supervisión humana y contexto adicional.
- La model card proporcionada está truncada en la sección de la prueba de estrés con HellaSwag, por lo que podrían existir conclusiones o métricas adicionales no recogidas aquí.

## Enlaces

- Repositorio ONNX en Hugging Face: https://huggingface.co/onnx-community/Firebird-ModernBERT-512-RW-ONNX
- Modelo base PyTorch: https://huggingface.co/noumenon-labs/Firebird-ModernBERT-512-RW
- Checkpoint base de la familia Firebird: https://huggingface.co/noumenon-labs/Firebird-ModernBERT-512
- Space de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación del pipeline de clasificación de texto en transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextClassificationPipeline
- Conjunto de evaluación Earlybird-V2: https://huggingface.co/datasets/noumenon-labs/Earlybird-V2
- Conjunto de evaluación AI Text Detection Pile Cleaned: https://huggingface.co/datasets/srikanthgali/ai-text-detection-pile-cleaned
- ONNX, formato abierto: https://onnx.ai/
- Documentación de ONNX: https://onnx.ai/onnx/
- Repositorio de ONNX en GitHub: https://github.com/onnx/onnx
- ONNX Runtime: https://onnxruntime.ai/
- Tutorial de introducción a ONNX (DataCamp): https://www.datacamp.com/fr/tutorial/onnx
