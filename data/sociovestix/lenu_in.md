# Sociovestix/lenu_IN

## Resumen

Sociovestix/lenu_IN es un modelo de clasificación de texto desarrollado por Sociovestix Labs, especializado en la asignación de códigos ELF (Legal Entity Identifier) a partir del nombre legal de una entidad en la jurisdicción de India. El modelo se basa en la arquitectura ALBERT y cuenta con 33.469.730 parámetros, lo que lo convierte en un modelo ligero para tareas de clasificación. Se distribuye en formato safetensors y está disponible en Hugging Face.

El modelo forma parte de la familia lenu, creada en colaboración con la Global Legal Entity Identifier Foundation (GLEIF), con el objetivo de explorar cómo el aprendizaje automático puede apoyar la detección del código ELF basándose únicamente en el nombre legal y la jurisdicción. Su relevancia radica en la automatización de procesos de identificación de entidades, un paso clave en el cumplimiento normativo, la gestión de datos de clientes y la integridad de los registros empresariales.

La longitud de contexto, los idiomas soportados y la licencia no están especificados en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT (transformer encoder) |
| Parámetros totales | 33.469.730 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ALBERT, una variante eficiente de BERT que reduce el número de parámetros mediante la factorización de las matrices de embeddings y la compartición de parámetros entre capas. Esta arquitectura está diseñada para mejorar la eficiencia computacional sin sacrificar en exceso la precisión en tareas de comprensión del lenguaje.

No se dispone de información detallada sobre los datos de entrenamiento, el procedimiento de ajuste fino ni las técnicas de optimización empleadas. El modelo está destinado a la clasificación de texto, concretamente a la asignación de códigos ELF a partir de nombres legales de entidades, según el dataset lenu para la configuración IN (India). No se han aplicado técnicas de RLHF o DPO, dado que se trata de un modelo de clasificación y no de generación.

## Capacidades

- Clasificación de texto: asigna un código ELF a partir del nombre legal de una entidad, específicamente para la jurisdicción de India (config IN).
- Integración: compatible con la librería transformers y el pipeline de text-classification.
- No es un modelo generativo: no produce texto libre, ni soporta tool calling, ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Clasificación de entidades en registros mercantiles: el modelo puede asignar automáticamente el código ELF a nuevas entidades registradas en India, lo que agiliza la creación de identificadores legales y reduce la intervención manual.
- Cumplimiento KYC/AML: en procesos de verificación de identidad corporativa, el modelo clasifica nombres legales para asociarlos a su código ELF, facilitando la debida diligencia en entidades indias.
- Normalización de bases de datos: para empresas que gestionan listas de clientes o proveedores indios, el modelo estandariza los nombres legales y asigna el código correspondiente, mejorando la calidad de los datos.
- Onboarding de clientes corporativos: en banca y finanzas, el modelo automatiza la identificación de la entidad legal a partir del nombre proporcionado por el cliente, acelerando los procesos de alta.
- Investigación de mercado: permite analizar grandes volúmenes de nombres de empresas indias y agruparlas por su tipo legal (código ELF), lo que facilita estudios sectoriales y de competencia.
- Integración en pipelines de datos: el modelo puede desplegarse como un servicio de clasificación para enriquecer datos de entidades en tiempo real, por ejemplo en plataformas de datos de mercado o sistemas de gestión de proveedores.

## Benchmarks y rendimiento

Los resultados corresponden al conjunto de test del dataset lenu, configuración IN. Los valores son declarados por el autor del modelo y no están verificados de forma independiente.

| Métrica | Valor |
|---|---|
| f1 | 0,8587 |
| f1 macro | 0,4091 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~0,2 GB en FP32 (cálculo teórico: 33,5 M parámetros × 4 bytes). En FP16 sería ~0,1 GB. Estas cifras son estimaciones, no medidas oficiales.
- Cabe en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: transformers (pipeline), ONNX Runtime, TorchScript, o servidores de inferencia como Triton.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación consultada. Existen otros modelos de la familia lenu para distintas jurisdicciones, pero no se han encontrado datos de rendimiento que permitan una comparación directa.

## Limitaciones y advertencias

- La model card es genérica y generada automáticamente; no proporciona información sobre sesgos, datos de entrenamiento ni limitaciones específicas.
- El modelo está entrenado para la jurisdicción de India (config IN); su uso en otras jurisdicciones puede producir resultados incorrectos.
- La licencia no está especificada, por lo que se debe verificar antes de un uso comercial.
- No es un modelo generativo; no se debe esperar que razone o genere texto.
- El valor de f1 macro (0,4091) indica un rendimiento inferior en clases minoritarias, lo que puede provocar errores en entidades poco frecuentes.

## Enlaces

- Modelo: https://huggingface.co/Sociovestix/lenu_IN
- Dataset: https://huggingface.co/datasets/Sociovestix/lenu
- Organización: https://huggingface.co/Sociovestix
- Paper ALBERT: https://arxiv.org/abs/1910.09700
