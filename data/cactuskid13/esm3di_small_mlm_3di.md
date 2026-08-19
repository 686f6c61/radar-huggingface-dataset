# cactuskid13/ESM3di_Small_MLM_3di

## Resumen

El modelo `cactuskid13/ESM3di_Small_MLM_3di` es un checkpoint publicado en Hugging Face por el usuario cactuskid13, dentro del ecosistema del proyecto ESM3di del laboratorio Dessimoz. ESM3di tiene como objetivo traducir secuencias de aminoácidos a secuencias estructurales 3di, un alfabeto de 20 estados que describe la estructura local de las proteínas y que se utiliza junto con Foldseek para búsquedas estructurales rápidas. El nombre del modelo sugiere una variante "Small" (pequeña) entrenada con un objetivo de modelado de lenguaje enmascarado (MLM) sobre etiquetas 3di.

La información pública disponible es extremadamente limitada: la model card solo indica licencia MIT, no hay descripción, ni arquitectura detallada, ni datos de entrenamiento. El tamaño del repositorio es de 1,6 GB, lo que sugiere un checkpoint de tamaño moderado, posiblemente un adaptador LoRA o un modelo base pequeño derivado de ESM-2. Su relevancia radica en la posibilidad de aplicar técnicas de aprendizaje por transferencia para predicción de estructura proteica sin necesidad de ejecutar pipelines complejos de alineamiento estructural, aunque su utilidad práctica no puede confirmarse sin más documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer basado en ESM-2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura concreta de este checkpoint. Por el nombre y el repositorio asociado (DessimozLab/ESM3di), es razonable inferir que se trata de un modelo basado en ESM-2, un transformer de proteinas, adaptado mediante LoRA para predecir secuencias 3di a partir de secuencias de aminoacidos. La etiqueta "MLM" indica que probablemente se entreno con un objetivo de modelado de lenguaje enmascarado sobre residuos 3di. Sin embargo, no se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Toda esta informacion queda pendiente de confirmacion por parte del autor.

## Capacidades

- Prediccion de secuencias estructurales 3di a partir de secuencias de aminoacidos (funcionalidad principal del proyecto ESM3di).
- Posiblemente capaz de realizar inferencia de estructura local de proteinas de forma rapida, aprovechando la representacion de ESM-2.
- No se confirma soporte de tool calling, agentes, vision, audio ni otras capacidades genericas de modelos de lenguaje.
- Al ser un modelo especifico de dominio biologico, no es aplicable a tareas de NLP general.

## Casos de uso

- Anotacion estructural de proteinas: el modelo puede asignar estados 3di a residuos de una secuencia de aminoacidos, facilitando la caracterizacion de la topologia local sin necesidad de resolver la estructura experimental.
- Búsqueda de homologos estructurales: al generar secuencias 3di, se pueden indexar en Foldseek para encontrar proteinas con estructura similar a partir de grandes bases de datos, acelerando la anotacion funcional.
- Filtrado de candidatos en pipelines de prediccion de estructura: se puede usar como paso previo a AlphaFold para descartar secuencias sin plegamiento probable o para clasificar dominios.
- Analisis de variantes: dado un conjunto de mutaciones, se puede evaluar si la estructura 3di predicha cambia sustancialmente, lo que podria indicar efectos sobre el plegamiento.
- Generacion de datasets de entrenamiento: las predicciones 3di pueden servir como pseudo-etiquetas para entrenar otros modelos de aprendizaje automatico en tareas de biologia estructural.
- Educacion e investigacion: util como herramienta didactica para ilustrar la relacion entre secuencia y estructura local en proteinas, siempre que se valide su precision con metodos experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de biologia estructural (como accuracy de prediccion 3di o TM-score). Se recomienda al usuario evaluar el modelo con sus propios datos antes de usarlo en produccion.

## Requisitos de hardware

- Tamano del repositorio: 1,6 GB, lo que sugiere que el checkpoint puede cargarse en GPUs de consumo medio (por ejemplo, 8-12 GB de VRAM) dependiendo de la arquitectura exacta.
- No se especifican GPUs recomendadas ni requisitos minimos.
- Dado el formato safetensors, es probable que pueda ejecutarse con librerias como Hugging Face Transformers o con adaptadores PEFT.
- No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. Al ser un modelo de proteinas, es mas probable que se use con scripts personalizados de PyTorch o con el codigo del repositorio ESM3di.
- Se desconoce la latencia y el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM3di_Small_MLM_3di (este) | no disponible | no disponible | no disponible | MIT | Hugging Face |
| ESM-2 (modelo base) | 650M - 15B | hasta 1024 residuos | SOTA en prediccion de estructura | MIT | Hugging Face |
| ESMFold | ~15B | no aplica | Prediccion de estructura completa | MIT | GitHub |

La comparativa es limitada porque no se conocen los parametros ni el rendimiento del modelo evaluado. ESM-2 es el modelo base probable, y ESMFold es una alternativa para prediccion de estructura 3D completa, mientras que este modelo se centra en la representacion 3di.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no incluye descripcion, metadatos de entrenamiento, ni instrucciones de uso, lo que dificulta su adopcion en entornos cientificos.
- Riesgo de sesgos: al no conocerse el dataset de entrenamiento, no se puede evaluar si existe sesgo hacia ciertas familias de proteinas o si el modelo generaliza bien a secuencias no homologas.
- Alucinacion estructural: como cualquier modelo generativo, puede producir estados 3di plausibles pero incorrectos, especialmente en regiones de baja confianza.
- Sin validacion experimental: no hay evidencia publica de que las predicciones del modelo sean fiables para aplicaciones de investigacion.
- Licencia MIT permite uso comercial, pero la falta de garantias y de soporte hace recomendable una evaluacion exhaustiva antes de usarlo en produccion.
- No es un modelo de lenguaje general: no debe utilizarse para tareas de procesamiento de texto ni generacion de contenido.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/cactuskid13/ESM3di_Small_MLM_3di
- Repositorio GitHub del proyecto ESM3di: https://github.com/DessimozLab/ESM3di
- Perfil del autor en Hugging Face: https://huggingface.co/cactuskid13
