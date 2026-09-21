# BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2

## Resumen

El modelo `BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2` es un checkpoint de preentrenamiento continuado (continued pretraining, CPT) derivado de `allenai/Olmo-3-1025-7B`, desarrollado por el usuario BrandonHowe y publicado en HuggingFace. Se trata de la fusion completa de los pesos correspondientes a la epoca 2.0 (paso 756) del entrenamiento sobre el dataset `CompassioninMachineLearning/urban_12738_cleaned`, con 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoca y 200 documentos de validacion disjuntos.

Su relevancia es experimental: permite estudiar el efecto del preentrenamiento continuado sobre un modelo base de 7.298.011.136 parametros (7,3 B) en un dominio concreto, sin necesidad de cargar adaptadores. Los pesos estan validados en BF16 y empaquetados sin perdida en ocho shards de safetensors, con un tamano de repositorio de 14,6 GB. No es un modelo ajustado por instrucciones ni alineado para dialogo: es un modelo de generacion de texto base.

El autor advierte explicitamente en la model card que el entrenamiento no establece una mejora en compasion y que ese aspecto debe evaluarse por separado. No se declaran licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Olmo 3 (derivado de allenai/Olmo-3-1025-7B); detalles de capas y atencion no disponibles |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 como formato nativo; no se publican GGUF, AWQ, GPTQ ni otras variantes cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, ocho shards, BF16 (fusion limpia, sin adaptador) |
| Modelo base | allenai/Olmo-3-1025-7B |
| Tipo de ajuste | Preentrenamiento continuado (CPT), epoca 2.0, paso 756 |
| Dataset de entrenamiento | CompassioninMachineLearning/urban_12738_cleaned, revision ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d |
| Tamano del repositorio | 14,6 GB |
| Metodo de exportacion | Unsloth `save_pretrained_merged(save_method="merged_16bit")` |
| Descargas / likes | 219 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Olmo 3 y de los tags del repositorio (`olmo3`, `transformers`, `text-generation`). Se sabe que hereda la estructura de `allenai/Olmo-3-1025-7B`, un modelo Transformer decoder-only de 7,3 B de parametros, y que los pesos finales se han fusionado en precision BF16 sin adaptadores intermedios, por lo que se carga directamente con la libreria `transformers`.

El proceso de entrenamiento consistio en un preentrenamiento continuado sobre `CompassioninMachineLearning/urban_12738_cleaned`, con 10.072 documentos distintos y 2.000 exposiciones repetidas por epoca, mas 200 documentos de validacion disjuntos. El checkpoint publicado corresponde a la epoca 2.0, paso 756. La exportacion se realizo con la utilidad nativa de Unsloth en modo `merged_16bit`, validando los pesos en BF16 y empaquetandolos sin perdida en ocho shards de safetensors. No se especifican en la informacion proporcionada el numero total de tokens vistos, la composicion detallada del dataset, la receta de optimizacion ni si hubo fases de RLHF o DPO. El autor remite a un fichero `run_manifest.json` para la revision base, los hashes de seleccion de documentos, los hiperparametros y la validacion de la exportacion.

## Capacidades

- Generacion de texto autoregresiva en formato de continuacion de texto (modelo base, sin plantilla de instrucciones).
- Modelado de lenguaje sobre dominio especifico tras el preentrenamiento continuado en el corpus `urban_12738_cleaned`.
- Punto de partida para ajuste fino posterior (SFT, LoRA, DPO) al entregarse como pesos fusionados en BF16.
- Inferencia estandar mediante `transformers` y compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se declara soporte nativo de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas soportados.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre preentrenamiento continuado: comparar este checkpoint (epoca 2.0, paso 756) con `allenai/Olmo-3-1025-7B` para medir deriva de pesos, olvido catastrofico y adaptacion al dominio del dataset.
- Ajuste fino supervisado sobre dominio concreto: al ser un modelo base fusionado en BF16, se puede aplicar SFT o LoRA directamente para tareas especificas sin gestionar adaptadores previos.
- Generacion de datos sinteticos: muestrear continuaciones de texto en el dominio de entrenamiento para aumentar corpus de entrenamiento o validacion de otros sistemas.
- Analisis de perplejidad y evaluacion de corpus: usar los 200 documentos de validacion disjuntos para medir el ajuste del modelo y estudiar la dinamica de convergencia por epoca.
- Prototipado local en GPU de consumo: con 7,3 B de parametros en BF16 (unos 14,6 GB de pesos), es viable en tarjetas de 24 GB para experimentos de investigacion sin infraestructura de cluster.
- Estudio de sesgos y alineacion: dado que el autor indica que el entrenamiento no demuestra una mejora en compasion, el modelo sirve como caso de estudio para metodologias de evaluacion de atributos subjetivos.
- Desarrollo de pipelines de generacion de texto sin dialogo: integracion en tareas de autocompletado o redaccion asistida donde no se requiere una plantilla de chat.
- Reproduccion de experimentos de CPT: el repositorio documenta revision del dataset y hashes, lo que facilita replicar o auditar el proceso sobre el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y advierte que el entrenamiento no establece una mejora en compasion, que debe evaluarse de forma separada. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 14,6 GB (coincide con el tamano del repositorio de ocho shards). Con cache KV y overhead de runtime, se recomienda un minimo de 16-20 GB de VRAM para contexto corto y 24 GB para contexto moderado.
- Cuantizacion INT8 (no publicada, generada por el usuario): en torno a 7-8 GB de pesos, manejable en GPUs de 12-16 GB.
- Cuantizacion INT4 (no publicada, generada por el usuario): en torno a 4-5 GB de pesos, viable en GPUs consumer de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en BF16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para BF16 en contexto moderado; RTX 4080, RTX 4070 Ti o A10G (16 GB) para INT8; RTX 3060 12 GB o RTX 4070 para INT4.
- Inferencia en CPU: posible con 32 GB de RAM si se convierte a GGUF, conversion que no se distribuye en el repositorio.
- Opciones de despliegue: `transformers` de forma nativa (el repositorio declara `endpoints_compatible`), ademas de vLLM, TGI o SGLang previa verificacion de compatibilidad con la configuracion de Olmo 3. Para llama.cpp u Ollama es necesaria una conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2 | 7,3 B | no disponible | no disponible | safetensors BF16 en HuggingFace, 219 descargas | Preentrenamiento continuado sobre corpus urbano; sin benchmarks publicados |
| allenai/Olmo-3-1025-7B | 7,3 B (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base de referencia en HuggingFace | Origen directo del ajuste; comparacion natural para medir el efecto del CPT |

No se dispone de datos verificados de otros modelos comparables (por ejemplo alternativas de 7-8 B de la misma categoria) en la informacion proporcionada, por lo que no se incluyen cifras que no puedan confirmarse.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento continuado, no un modelo ajustado por instrucciones: no soporta de forma nativa dialogos multi-turno, tool calling ni plantillas de chat.
- La licencia no esta declarada en la ficha de HuggingFace, lo que supone un riesgo legal para uso comercial; las condiciones aplicables dependerian de las del modelo base `allenai/Olmo-3-1025-7B`, no detalladas aqui.
- No se declaran idiomas soportados; el dominio del corpus de entrenamiento sugiere un sesgo hacia el idioma de dicho dataset, no confirmado.
- Riesgo de alucinacion propio de cualquier modelo generativo de 7 B sin alineacion especifica.
- El dataset de entrenamiento es reducido (10.072 documentos) y el regimen incluye 2.000 exposiciones repetidas por epoca, lo que aumenta el riesgo de sobreajuste y de olvido catastrofico respecto al modelo base.
- El propio autor advierte que el entrenamiento no demuestra una mejora en compasion; cualquier afirmacion en ese sentido requiere evaluacion independiente.
- No hay benchmarks publicados, por lo que no existe evidencia cuantitativa de rendimiento ni de calidad frente al modelo base.
- No se publican cuantizaciones GGUF, AWQ o GPTQ: el usuario debe generarlas por su cuenta, con el coste y la posible perdida de precision asociados.
- La longitud de contexto no se especifica, lo que impide planificar despliegues con requisitos de contexto largo.
- El modelo tiene 219 descargas y 0 likes, por lo que carece de validacion externa significativa; conviene tratarlo como un experimento y no como un artefacto listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Unsloth (utilidad de fusion empleada): https://github.com/unslothai/unsloth
- Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo (unicamente paginas de soporte de navegadores sin relacion). No se han localizado papers, blogs, repositorios ni demos adicionales asociados al modelo.
