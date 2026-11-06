# mradermacher/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked-GGUF

## Resumen
Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked-GGUF es una distribucion de cuantizaciones GGUF estaticas del modelo prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked, publicada por mradermacher. El modelo subyacente es un ajuste fino de la familia Qwen3.5 de 4B orientado a la generacion de codigo para graficos 3D, concretamente Three.js y activos GLB, con soporte adicional para Godot segun las etiquetas del repositorio. Esta version no introduce cambios en los pesos: es una conversion y cuantizacion del checkpoint original en formato Hugging Face a GGUF para su uso en llama.cpp y entornos compatibles.

El interes practico de esta publicacion es la disponibilidad de 13 variantes de cuantizacion (desde Q2_K de 2,1 GB hasta f16 de 8,8 GB) mas dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que permite ejecutar un modelo especializado en codigo 3D en hardware de consumo. El modelo cuenta con 4.326.350.848 parametros totales y esta publicado bajo licencia Apache 2.0.

La relevancia es acotada: se trata de una cuantizacion de un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card detallada del autor original. Resulta util para quien necesite generar codigo Three.js o manipular activos GLB en local, pero no debe confundirse con un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de capas y atencion no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base es un ajuste fino de Qwen3.5 de 4B, una arquitectura transformer de la familia Qwen. El nombre incluye el sufijo MTP, que en el ecosistema de modelos Qwen suele asociarse a Multi-Token Prediction, aunque la informacion proporcionada no detalla como se implementa ni si afecta a la decodificacion en inferencia. Tampoco se especifican el numero de capas, las dimensiones ocultas, el mecanismo de atencion ni la ventana de contexto nativa.

El ajuste fino se realizo sobre el dataset ccore/ThreeJS-3D-GLB-Assets, orientado a codigo Three.js y activos GLB, segun la model card y las etiquetas. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO o similares. La publicacion de mradermacher es exclusivamente una conversion a GGUF con cuantizaciones estaticas; el autor indica que no ha generado cuantizaciones con imatrix o ponderadas y que no tiene previsto hacerlo salvo peticion en la discusion comunitaria.

## Capacidades
- Generacion de codigo especializado en Three.js para escenas 3D, geometria, materiales, iluminacion y animacion.
- Manipulacion y generacion de activos GLB (formato binario de glTF) segun el enfasis declarado en el nombre y las etiquetas.
- Soporte declarado para Godot mediante la etiqueta correspondiente, aunque sin detalle sobre el alcance.
- Generacion de texto conversacional en ingles (etiqueta conversational).
- Capacidad multimodal potencial: el repositorio incluye ficheros mmproj, lo que sugiere soporte de entrada de imagenes en llama.cpp, si bien no se documenta que modalidades cubre.
- Compatibilidad con text-generation-inference y llama-cpp segun las etiquetas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language.

## Casos de uso
- Generacion de escenas Three.js en local: el modelo puede producir codigo JavaScript para construir escenas 3D (camaras, luces, mallas) y ejecutarse en un portatil con GPU de consumo usando la cuantizacion Q4_K_M de 2,9 GB, lo que facilita iterar sin depender de APIs externas.
- Prototipado de visores GLB: integrado en un pipeline de llama.cpp, puede generar el codigo de carga y renderizado de activos GLB en el navegador, acelerando la creacion de visores de producto o catalogos 3D.
- Asistencia en Godot: dado el etiquetado del modelo, puede emplearse para sugerir scripts y estructuras de escena en proyectos Godot, siempre con revision manual por la falta de benchmarks.
- Herramienta educativa de graficos 3D: al ser un modelo de 4B cuantizado a 2-3 GB, es viable desplegarlo en aulas o entornos con hardware modesto para explicar conceptos de Three.js con ejemplos generados.
- Automatizacion de tareas de conversion de activos: puede redactar scripts de procesamiento por lotes de ficheros GLB (renombrado, extraccion de metadatos, validacion de estructura) en un flujo de CI, aunque requiere validacion de la salida.
- Entorno de pruebas de cuantizaciones: util para investigadores que quieran comparar el comportamiento de distintas cuantizaciones (Q2_K frente a Q8_0) en una tarea concreta de codigo 3D, ya que el repositorio ofrece el espectro completo de tamanos.
- Despliegue air-gapped: al distribuirse como GGUF con licencia Apache 2.0, puede ejecutarse en entornos sin conexion para generar codigo 3D sin enviar datos a servicios externos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,1 GB con Q2_K, 2,7-2,9 GB con Q4_K_S/Q4_K_M, 3,7 GB con Q6_K y 4,7 GB con Q8_0; el f16 requiere unos 8,8 GB. Hay que sumar el fichero mmproj (0,5-0,8 GB) si se usa la parte multimodal.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM es suficiente para las cuantizaciones Q4 y Q5; una RTX 3060 de 12 GB o superior permite Q8_0 con holgura. Para f16 se recomienda una RTX 4090 o una GPU de datacenter (A100, H100), aunque por tamano no es necesario.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs modernas con 6 GB o mas, e incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), text-generation-inference (segun etiquetas) y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked-GGUF (este) | 4,33B | no disponible | Codigo Three.js/GLB, Godot | Apache 2.0 | GGUF en HF |
| Qwen3.5-4B-Unredacted-MAX-GGUF | 4B (familia) | no disponible | Generalista sin censura | no disponible | GGUF en HF |
| Qwen3.5-4B-uncensored-zero-GGUF | 4B (familia) | no disponible | Generalista sin censura | no disponible | GGUF en HF |

Las alternativas encontradas en la busqueda son otras cuantizaciones de la misma familia Qwen3.5 de 4B, no modelos especializados en 3D. No se han identificado en la informacion disponible modelos comparables de codigo 3D del mismo tamano con datos de rendimiento publicados.

## Limitaciones y advertencias
- Modelo de nicho: el ajuste fino esta orientado a Three.js, GLB y Godot; su rendimiento en tareas generales de codigo o texto sera previsiblemente inferior al de un modelo generalista del mismo tamano.
- Sin benchmarks: no hay datos publicados que permitan estimar su calidad real en generacion de codigo 3D; cualquier evaluacion debe hacerse de forma empirica.
- Solo ingles: el campo language declara unicamente en, por lo que no se garantiza un comportamiento correcto en castellano.
- Riesgo de alucinacion en APIs: es frecuente que modelos pequenos especializados inventen funciones o propiedades de Three.js; se recomienda validar el codigo generado contra la documentacion oficial.
- Contexto desconocido: al no documentarse la ventana de contexto, no se puede asumir soporte para ficheros de proyecto grandes.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan la calidad; el propio autor marca Q4_K_S y Q4_K_M como las opciones rapidas recomendadas y Q6_K como muy buena calidad.
- Sin cuantizaciones imatrix: el autor indica que no las ha generado y que probablemente no lo hara salvo peticion, por lo que no hay variantes ponderadas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset de origen podrian tener condiciones adicionales que no se detallan en la informacion disponible; conviene verificar el repositorio original.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-GLB-Assets
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Alternativa de la misma familia: https://huggingface.co/mradermacher/Qwen3.5-4B-Unredacted-MAX-GGUF
- Alternativa de la misma familia: https://huggingface.co/mradermacher/Qwen3.5-4B-uncensored-zero-GGUF
