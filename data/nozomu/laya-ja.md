# Nozomu/laya-ja

## Resumen

Laya-JA es un ajuste fino en japonés del modelo de decisión Laya Multilingual (322M parámetros), desarrollado por el usuario independiente Nozomu. No es un modelo generativo: lee un texto y devuelve probabilidades sobre opciones, probabilidades binarias o una puntuación de 0 a 5. Está pensado para tareas de inferencia en lenguaje natural (NLI), razonamiento temporal, similitud semántica, sentido común y juicio gramatical, todo con un único conjunto de pesos.

El modelo parte de `convaiinnovations/laya-multilingual`, la versión abierta del modelo propietario Jev de TypeSafe AI, y le añade LoRA de rango 16 en todas las capas lineales del encoder, además de entrenar la cabeza de decisión. El resultado es un adaptador y un paquete unificado en fp16 de aproximadamente 1,8 GB, publicado bajo licencia CC BY-SA 4.0.

Su relevancia es doble: por un lado, demuestra que un modelo de 322M puede superar a un modelo propietario en tareas de inferencia japonesa cuando se ajusta con datos específicos del dominio; por otro, documenta con transparencia sus debilidades en razonamiento fuera de distribución, lo que lo convierte en un caso de estudio útil para quienes evalúan modelos pequeños de decisión frente a LLM generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base Laya Multilingual) con LoRA en todas las capas lineales y cabeza de decisión |
| Parametros totales | 322M (modelo base); el adaptador LoRA añade un porcentaje no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 en el paquete unificado; adaptadores en safetensors (cuantización no documentada) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 (modelo base y motor subyacente Apache-2.0) |
| Formato de pesos | safetensors (adaptadores LoRA y paquete unificado fp16) |

## Arquitectura y entrenamiento

El modelo se construye sobre `convaiinnovations/laya-multilingual` (revisión `1720e3e3357cfe1e281542e223f8273b0890ca34`), un encoder de 322M parámetros orientado a decisión en lugar de generación. Sobre él se aplica LoRA de rango 16, alpha 32 y dropout 0.05 en las capas lineales de todas las capas del encoder, y se entrena también la cabeza de decisión. La configuración de entrenamiento es: tasa de aprendizaje 1e-4, 2 épocas, batch efectivo 32 y tres semillas (42, 43 y 44). La selección del modelo se hizo por pérdida sobre un conjunto de ajuste.

Los datos de entrenamiento cubren múltiples tareas japonesas: JNLI (18.618 ejemplos), JSICK (4.000), JaNLI (4.000), Jamp (4.000), JSeM (1.544), lógica sintética (6.000), MultiNLI japonés con etiquetas de un modelo externo (8.000), JCommonsenseQA (8.465), JSTS (11.816) y JCoLA (6.471). Se excluyeron del entrenamiento las frases y fuentes que coincidían con los conjuntos de evaluación y ajuste. Las etiquetas del MultiNLI japonés se generaron con dos modelos públicos de la familia Qwen. No se documenta el número total de tokens de preentrenamiento del modelo base.

## Capacidades

- Clasificación de inferencia en lenguaje natural (NLI): devuelve probabilidades sobre opciones de implicación, contradicción y neutralidad.
- Decisión binaria: probabilidad de que una hipótesis se siga de una premisa.
- Puntuación de 0 a 5 sobre textos, útil para evaluación de calidad o similitud graduada.
- Similitud semántica de pares de frases (correlación Pearson de 0,911 en JSTS).
- Razonamiento temporal sobre eventos (Jamp), con rendimiento cercano al modelo propietario de referencia.
- Sentido común en formato de elección múltiple (JCommonsenseQA).
- Juicio gramatical (JCoLA) con MCC moderado.
- No genera texto: su salida es siempre una distribución de probabilidad o una puntuación.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al japonés en este ajuste (el modelo base es multilingüe, pero el adaptador se entrenó solo con datos en ja).

## Casos de uso

- Filtrado de pares pregunta-respuesta en pipelines de datos: dado un par de frases, el modelo devuelve la probabilidad de que una se siga de la otra, lo que permite descartar ejemplos inconsistentes antes de entrenar un LLM generativo.
- Evaluación automática de resúmenes y traducciones: la puntuación de 0 a 5 y la similitud semántica permiten construir métricas de calidad sin depender de un modelo generativo grande.
- Detección de contradicciones en documentación técnica japonesa: al comparar afirmaciones extraídas de manuales o especificaciones, el modelo señala pares contradictorios con alta precisión en dominios vistos durante el entrenamiento.
- Moderación de contenido basada en implicación: comprobar si una respuesta de un chatbot implica una política prohibida, usando la decisión binaria sobre pares política-respuesta.
- Anotación asistida de corpus de NLI en japonés: el modelo preetiqueta pares con su probabilidad, y los anotadores humanos revisan solo los casos de baja confianza.
- Verificación de consistencia temporal en informes: con Jamp, el modelo detecta si una secuencia de eventos descrita en un informe respeta el orden temporal declarado.
- Evaluación de gramaticalidad en herramientas de corrección: el juicio JCoLA, aunque con MCC bajo, sirve como señal auxiliar en un ensemble con un corrector basado en reglas.

## Benchmarks y rendimiento

Resultados publicados en la model card. La comparación es entre Jev (modelo propietario de TypeSafe AI, API, sin ajuste), Laya (modelo base sin ajuste) y Laya-JA (este modelo). Evaluación en float32 sobre GPU; Laya-JA promedia tres semillas y el rango entre paréntesis indica mínimo y máximo.

| Tarea (conjunto) | Jev | Laya | Laya-JA |
|---|---:|---:|---:|
| Inferencia JNLI (2.434) | 82,1% | 52,2% | **90,7%** (90,6-90,9) |
| Inferencia JSICK (512) | 81,4% | 44,7% | **88,8%** (88,5-89,1) |
| Inferencia JaNLI binaria (512) | 95,3% | 58,4% | **99,9%** (99,6-100,0) |
| Razonamiento temporal Jamp (348) | **77,3%** | 44,3% | 76,4% (74,7-77,9) |
| Razonamiento semántico JSeM (384) | **77,3%** | 50,0% | 65,4% (64,8-66,1) |
| Razonamiento propio, 36 preguntas fuera de entrenamiento | **100,0%** | 38,9% | 54,6% (47,2-63,9) |
| Sentido común JCommonsenseQA (1.119) | **96,9%** | 54,6% | 70,5% (70,0-70,8) |
| Similitud semántica JSTS (Pearson) | 0,899 | 0,601 | **0,911** (0,910-0,911) |
| Gramática JCoLA, mismo dominio (MCC) | **0,236** | -0,005 | 0,183 (0,164-0,206) |
| Gramática JCoLA, dominio distinto (MCC) | **0,572** | 0,005 | 0,304 (0,239-0,352) |

## Requisitos de hardware

- VRAM estimada: el paquete unificado en fp16 ocupa aproximadamente 1,8 GB en disco; en memoria, un modelo de 322M en fp16 requiere del orden de 0,7 GB de pesos más activaciones y overhead del runtime. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para inferencia en producción, una T4 o L4 es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: el paquete se carga con `laya.load("path/to/unified")` según la documentación del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo y usa una librería propia (`laya`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya-JA | 322M (+ LoRA) | no disponible | Decisión (NLI, similitud, gramática) en japonés | CC BY-SA 4.0 | Pesos abiertos en Hugging Face |
| Laya Multilingual | 322M | no disponible | Decisión multilingüe | Apache-2.0 (motor) | Pesos abiertos |
| Jev (TypeSafe AI) | no disponible | no disponible | Decisión en japonés | Propietaria | Solo API |
| LLM generativos japoneses (p. ej. Qwen, Swallow) | 7B-70B | 8K-128K | Generación y razonamiento | Variables | Pesos abiertos o API |

La comparación directa con LLM generativos no es homogénea: Laya-JA no genera texto y está especializado en tareas de clasificación y puntuación, por lo que su ventaja es el coste computacional y la latencia, no la versatilidad.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo demográfico, dialectal o de registro. El entrenamiento se limita a corpus académicos japoneses, lo que puede infrarepresentar lenguaje coloquial, dialectos y dominios especializados.
- Alucinación: al no generar texto, el riesgo de alucinación se traslada a la calibración de probabilidades; no se publican métricas de calibración (ECE, Brier).
- Razonamiento fuera de distribución: en las 36 preguntas propias no vistas durante el entrenamiento, solo acierta entre 17 y 23 (54,6% de media), frente al 100% de Jev. Tiene dificultades con condiciones, negaciones, cuantificadores y referencias temporales.
- JSeM: la tasa de recall de la clase "no se puede determinar" es de aproximadamente el 20%, lo que limita su uso en tareas que requieran abstención.
- JaNLI: el 99,9% se obtiene sobre estructuras gramaticales presentes en el entrenamiento; no debe interpretarse como capacidad general de inferencia.
- Gramática: el MCC en JCoLA es bajo (0,183 en mismo dominio, 0,304 en dominio distinto) y el autor lo califica de experimental. No evalúa naturalidad dialectal ni conversacional.
- Solapamiento de datos: no se ha verificado la superposición entre los datos de preentrenamiento del modelo base y los conjuntos de evaluación.
- Licencia: CC BY-SA 4.0 obliga a compartir bajo la misma licencia las obras derivadas y exige atribución; puede ser incompatible con productos propietarios que no quieran liberar sus adaptaciones.
- Producción: el modelo no genera texto, por lo que no sustituye a un LLM en tareas conversacionales; su uso requiere integrarlo en un pipeline con lógica de decisión externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nozomu/laya-ja
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio del proyecto: https://github.com/nozomugit/laya-ja
- Aviso legal y licencias de datos: https://github.com/nozomugit/laya-ja/blob/main/NOTICE
- JGLUE (JNLI, JSTS, JCommonsenseQA): https://github.com/yahoojapan/JGLUE
- JCoLA: https://github.com/osekilab/JCoLA
- JSICK: https://github.com/verypluming/JSICK
- JaNLI: https://github.com/verypluming/JaNLI
- Jamp: https://github.com/tomo-ut/temporalNLI_dataset
- JSeM: https://github.com/DaisukeBekki/JSeM
- Dataset MultiNLI japonés: https://huggingface.co/datasets/cl-nagoya/nu-mnli
