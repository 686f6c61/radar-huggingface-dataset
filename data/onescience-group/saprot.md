# OneScience-Group/SaProt

## Resumen

SaProt es un modelo de lenguaje de proteínas (PLM) desarrollado por OneScience-Group que integra información secuencial y estructural mediante un vocabulario consciente de estructura. Su idea central es combinar aminoácidos (AA) con el alfabeto estructural 3Di generado por Foldseek, formando tokens de dos caracteres que codifican simultáneamente la identidad del residuo y su estado conformacional. Esto permite al modelo aprender representaciones que capturan tanto la secuencia como el contexto estructural de las proteínas.

El modelo se presenta en varias escalas: 35M, 650M y 1.3B de parámetros, con variantes entrenadas sobre diferentes conjuntos de datos, incluyendo 40M de estructuras de AlphaFold2, 60K de estructuras PDB, y combinaciones de AFDB, OMG_prot50 y NCBI. SaProt fue presentado como Spotlight en ICLR 2024 y su trabajo de seguimiento se publicó en Nature Biotechnology en 2025. Es relevante para tareas de biología computacional como extracción de representaciones, predicción zero-shot de efectos de mutaciones, diseño inverso de secuencias (inverse folding) y fine-tuning en tareas downstream.

La licencia es MIT, lo que facilita su uso en entornos académicos e industriales. La información disponible no detalla la arquitectura interna ni la longitud de contexto, por lo que estos aspectos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje de proteínas con vocabulario estructura-aware) |
| Parametros totales | 35M / 650M / 1.3B según variante |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (según metadatos; el modelo opera sobre secuencias de proteínas) |
| Licencia | MIT |
| Formato de pesos | no disponible (frameworks: PyTorch) |

## Arquitectura y entrenamiento

SaProt modela proteínas utilizando un vocabulario estructura-aware formado por la combinación de aminoácidos (AA) con el alfabeto estructural 3Di de Foldseek. Cada token de estructura está compuesto por dos caracteres: el primero representa el aminoácido y el segundo el estado 3Di correspondiente. El carácter `#` se utiliza para enmascarar regiones estructurales de baja confianza. Esta representación permite que el modelo aprenda de manera conjunta la información de secuencia y estructura.

Los datos de entrenamiento varían según la variante: el modelo `SaProt_35M_AF2` se entrena con 40M de estructuras de AlphaFold2; `SaProt_650M_PDB` combina 40M de estructuras AF2 con 60K de estructuras PDB; `SaProt_650M_AF2` usa 40M de estructuras AF2; y las variantes de 1.3B se entrenan con AFDB, OMG_prot50 y NCBI. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La arquitectura interna (tipo de transformer, número de capas, etc.) no está detallada en la información disponible. La innovación técnica destacable es la incorporación del alfabeto 3Di como parte del vocabulario, lo que permite al modelo ser consciente de la estructura sin depender de un módulo estructural separado.

## Capacidades

- Extracción de representaciones de proteínas: genera embeddings a nivel de residuo o de proteína completa.
- Predicción zero-shot de efectos de mutaciones: evalúa el impacto de mutaciones simples o múltiples sin necesidad de fine-tuning específico.
- Modelado de proteínas consciente de estructura: utiliza conjuntamente tokens de aminoácidos y tokens estructurales 3Di.
- Protein inverse folding: diseña secuencias de aminoácidos a partir de información estructural.
- Fine-tuning para tareas downstream: aplicable a EC (clasificación de enzimas), GO (ontología génica), estabilidad, interacciones proteína-proteína (PPI), predicción de contactos y DeepLoc (localización subcelular).
- Capacidad de manejar tanto secuencias estructura-aware como secuencias solo de aminoácidos, especialmente en la variante de 1.3B.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Extracción de representaciones para modelos downstream: se pueden obtener embeddings de proteínas para alimentar clasificadores o regresores en tareas como predicción de función o estabilidad. Es adecuado porque integra secuencia y estructura, lo que enriquece las representaciones.
- Predicción de efectos de mutaciones en investigación biomédica: se puede evaluar el impacto de variantes genéticas de forma directa, sin entrenamiento adicional. El modelo es adecuado porque su vocabulario estructura-aware puede capturar cambios conformacionales asociados a mutaciones.
- Diseño de secuencias por inverse folding: se puede generar una secuencia de aminoácidos compatible con una estructura 3D dada. Es adecuado porque el modelo ha sido entrenado para relacionar estructura y secuencia de manera conjunta.
- Fine-tuning para clasificación de enzimas (EC): se puede adaptar el modelo para predecir la clase enzimática de una proteína. Es adecuado porque las representaciones incluyen información estructural que ayuda a distinguir funciones relacionadas.
- Predicción de estabilidad proteica tras mutaciones: se puede entrenar un modelo específico para predecir cambios de energía libre o estabilidad. Es adecuado porque el modelo es sensible a la estructura, un factor clave en la estabilidad.
- Predicción de interacciones proteína-proteína (PPI): se pueden usar los embeddings para clasificar pares de proteínas que interactúan. Es adecuado porque la estructura es determinante en las interfaces de interacción.
- Predicción de localización subcelular (DeepLoc): se puede clasificar la ubicación celular de una proteína. Es adecuado porque las representaciones estructura-aware pueden capturar señales relacionadas con el plegamiento y la localización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- SaProt soporta inferencia en CPU y GPU/DCU.
- El modelo de 35M puede utilizarse para pruebas ligeras; se recomienda GPU/DCU para las variantes de 650M y 1.3B.
- Tareas como batch embedding, mutation scanning, pretraining y fine-tuning aumentan sustancialmente los requisitos de memoria de GPU y de host.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible (se indica GPU/DCU de forma genérica).
- Opciones de despliegue: no disponible (la información menciona inferencia directa con PyTorch, sin referencias a vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparativa en la información proporcionada. La model card menciona ESM2 como modelo de comparación en los experimentos, pero no se aportan resultados numéricos ni análisis comparativo. Por tanto, no se puede establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible.
- Al ser un modelo predictivo, puede generar resultados plausibles pero incorrectos (riesgo de alucinación), especialmente en regiones estructurales de baja confianza.
- Requiere un paso de preprocesamiento con Foldseek para generar las secuencias 3Di; las regiones de baja confianza se enmascaran con `#`.
- Para las variantes de 35M y 650M, se recomienda usar tokens de estructura para obtener los mejores resultados; la variante de 1.3B puede manejar relativamente bien secuencias solo de aminoácidos.
- La información de la model card está incompleta; se recomienda consultar el repositorio o el paper original para obtener detalles adicionales sobre arquitectura, entrenamiento y rendimiento.
- La licencia MIT permite uso comercial, pero las condiciones de los datos de entrenamiento no están especificadas, por lo que se debe verificar su procedencia antes de un uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/SaProt
- Organización OneScience-Group: https://huggingface.co/OneScience-Group
- Pesos de `SaProt_35M_AF2`: https://huggingface.co/westlake-repl/SaProt_35M_AF2
- Pesos de `SaProt_650M_PDB`: https://huggingface.co/westlake-repl/SaProt_650M_PDB
- Pesos de `SaProt_650M_AF2`: https://huggingface.co/westlake-repl/SaProt_650M_AF2
- Pesos de `SaProt_1.3B_AF2`: https://huggingface.co/westlake-repl/SaProt_1.3B_AF2
- Pesos de `SaProt_1.3B_AFDB_OMG_NCBI`: https://huggingface.co/westlake-repl/SaProt_1.3B_AFDB_OMG_NCBI
- Paper: SaProt: Protein Language Modeling with Structure-aware Vocabulary (ICLR 2024 Spotlight; seguimiento en Nature Biotechnology 2025)
- Descarga de Foldseek (enlace en la model card): https://drive.google.com/file/d/1B_9t3n_nlj8Y3Kpc_mMjtMdY0OPYa7Re/view
- Datasets de tareas downstream (enlace en la model card): https://drive.google.com/drive/folders/11dNGqPYfLE3M-Mbh4U7IQpuHxJpuRr4g?usp=sharing
