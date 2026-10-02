# jeremierostan/laya-student-match

## Resumen

Laya student-match es un ajuste fino (fine-tune) del modelo base `convaiinnovations/laya`, un clasificador de decision de "Sistema 1" publicado por Convai Innovations y entrenado por Jeremie Rostan. El modelo resuelve un problema muy concreto: decidir si un comentario de pago introducido por un progenitor hace referencia a un alumno incluido en un roster escolar, devolviendo una etiqueta de coincidencia, una puntuacion de similitud en tres niveles y confidencias calibradas en un unico pase forward. Se entrenó partiendo del modelo Laya, con RLCD (segun la propia model card) en un entrenador de un solo dispositivo durante 4 epocas, sobre aproximadamente 1.100 pares sinteticos y con 33 pares etiquetados a mano reservados como conjunto de evaluacion.

El checkpoint pesa 421.293.830 parametros (unos 421 M) en formato safetensors, con un repositorio de 0,8 GB. La tarea es de clasificacion de texto (`text-classification`) y el modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su interes practico radica en que formaliza un caso de negocio muy comun (conciliacion de pagos con nombres escritos de forma libre) como un problema de decision acotada: el conjunto de salidas posibles se conoce de antemano y el modelo solo tiene que elegir entre ellas.

Al tratarse de un ajuste especifico y con muy pocas descargas (0 en el momento de redactar esta ficha), debe considerarse un modelo de nicho, adecuado para experimentacion y para integrarse en pipelines internos de conciliacion de nombres, mas que como un modelo de proposito general. La documentacion publica no detalla la arquitectura interna del modelo base ni su longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune del modelo base `convaiinnovations/laya`, descrito como "System-1 decision model"); detalles internos no disponibles |
| Parametros totales | 421.293.830 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible en la model card; el modelo base Laya declara soporte para mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `convaiinnovations/laya`, al que la documentacion de Laya AI describe como un "System-1 decision model" de baja latencia orientado a tareas de clasificacion y enrutado. La tarea se formula como una decision tipada: se proporciona un estado con dos cadenas (`roster_name` y `payment_comment`) y dos preguntas con criterios, una de eleccion (`match`: `match` / `different`) y otra de puntuacion en tres niveles (`similarity`). El modelo devuelve en un unico pase forward la etiqueta, la puntuacion de similitud y confidencias calibradas para ambas preguntas.

El ajuste se realizo con RLCD sobre un entrenador de un solo dispositivo durante 4 epocas, utilizando aproximadamente 1.100 pares sinteticos generados de forma automatica y reservando 33 pares etiquetados a mano como conjunto semilla de evaluacion. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF; tampoco se especifica la arquitectura interna del modelo base (atencion, tipo de capas o mecanismo de decision).

## Capacidades

- Clasificacion binaria de coincidencia de identidad: determina si un comentario de pago se refiere al mismo alumno del roster o a otra persona (progenitor, hermano o tercero).
- Puntuacion de similitud en tres niveles: distingue entre "persona distinta", "identidad incierta o coincidencia parcial" y "el mismo alumno".
- Calibracion de confianza: devuelve confidencias calibradas junto con la etiqueta, en el mismo pase forward.
- Robustez frente a variaciones de escritura declarada en los criterios de la tarea: errores tipograficos, truncamientos, apodos, importes y anotaciones familiares.
- Ejecucion en un unico forward pass, sin generacion autoregresiva, lo que se traduce en baja latencia para clasificacion.
- Soporte multilingue heredado del modelo base (mas de 100 idiomas segun Laya AI), aunque la model card del fine-tune no declara idiomas de forma explicita.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Conciliacion de pagos escolares: dado un roster de alumnos y los comentarios libres que los progenitores escriben en las transferencias, el modelo decide si el pago corresponde al alumno listado, reduciendo la revision manual de conciliaciones bancarias.
- Normalizacion y matching de identidades en CRM: comparar nombres escritos de forma heterogenea (apellidos invertidos, apodos, sufijos familiares) contra registros maestros para unificar fichas de clientes.
- Deduplicacion de registros: detectar entradas duplicadas de una misma persona en bases de datos con nombres escritos de forma inconsistente, usando la puntuacion de similitud como umbral configurable.
- Enrutado de comentarios en banca o seguros: clasificar los comentarios libres de las transferencias para asignarlos al cliente correcto antes del procesamiento posterior.
- Verificacion de beneficiarios en pagos: comprobar que el destinatario indicado en una orden de pago coincide con el beneficiario registrado, marcando los casos inciertos para revision humana.
- Triage de tickets de soporte: identificar si el nombre mencionado en un ticket corresponde a un usuario concreto del sistema, con una senal de confianza que permite automatizar los casos claros y escalar los dudosos.
- KYC y screening basico de identidades: apoyo como primera capa de un pipeline de verificacion, complementando reglas deterministas con una decision de similitud aprendida.

## Benchmarks y rendimiento

Resultados de evaluacion publicados en la model card del checkpoint:

| Conjunto | Match accuracy | Match Brier | Score MAE |
|---|---|---|---|
| seeds (33 pares etiquetados a mano) | 0,9394 | 0,0799 | 0,357 |
| test_syn (200 pares sinteticos) | 1,0 | 0,0452 | 0,2595 |

Confianza media en el conjunto de semillas (33 pares): 0,3064 cuando el modelo acierta y 0,1502 cuando falla. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (para 421 M de parametros): aproximadamente 1,7 GB en FP32, 0,85 GB en FP16/BF16, 0,42 GB en INT8 y 0,21 GB en INT4, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; en la practica, modelos de esta talla funcionan bien en NVIDIA RTX 3060, RTX 4060, RTX 4090, T4 o A10, asi como en Apple Silicon.
- Cabe holgadamente en GPU de consumo e incluso en portatiles con graficos integrados recientes, dado el reducido numero de parametros.
- Opciones de despliegue: la libreria `transformers` (los pesos estan en safetensors y el pipeline es `text-classification`), TGI, vLLM, asi como conversion a GGUF para llama.cpp u Ollama.
- Latencia y throughput: la documentacion del modelo base Laya lo describe como de baja latencia, pero no se proporcionan cifras concretas de latencia ni de tokens por segundo en la informacion disponible. El diseno de un unico forward pass favorece despliegues con requisitos de baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeremierostan/laya-student-match | 421.293.830 | no disponible | Accuracy 0,9394 en 33 semillas; 1,0 en 200 pares sinteticos | Apache 2.0 | HuggingFace |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Otras alternativas de matching de nombres | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados comparables de otros modelos de matching de nombres o clasificacion de identidades que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Entrenamiento con datos mayoritariamente sinteticos (unas 1.100 parejas generadas) y validacion sobre solo 33 pares etiquetados a mano, lo que limita la confianza en la generalizacion a datos reales.
- El resultado perfecto (accuracy 1,0) se obtiene sobre el conjunto sintetico de prueba, que probablemente comparte distribucion con los datos de entrenamiento; no debe interpretarse como rendimiento esperado en produccion.
- Las confidencias medias reportadas son bajas en terminos absolutos (0,3064 cuando acierta y 0,1502 cuando falla), por lo que el umbral de decision debe calibrarse por el usuario antes de automatizar cualquier accion.
- Modelo de nicho, con 0 descargas y 0 "likes" en el momento de redactar la ficha, sin validacion externa independiente.
- La model card no declara idiomas soportados de forma explicita; el soporte multilingue depende del modelo base y no esta verificado para este fine-tune.
- No se documentan sesgos especificos, pero un modelo de matching de nombres puede heredar sesgos culturales en el tratamiento de convenciones de nombres no occidentales, transliteraciones o caracteres no latinos.
- Riesgo de alucinacion no aplicable en el sentido generativo (el modelo elige entre etiquetas predefinidas), pero si existe riesgo de clasificaciones erroneas con alta confianza en casos ambiguos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque se recomienda verificar las condiciones del modelo base del que deriva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jeremierostan/laya-student-match
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de generacion: https://huggingface.co/datasets/jeremierostan/laya-student-match-data
- Perfil del autor en HuggingFace: https://huggingface.co/jeremierostan
- Perfil del autor en GitHub: https://github.com/jeremierostan
- Laya AI (sitio oficial): https://layaaimodel.com/
- Blog de HuggingFace sobre Laya AI: https://huggingface.co/blog/sora-2/laya-ai-model-selection-and-api-integration-guide
