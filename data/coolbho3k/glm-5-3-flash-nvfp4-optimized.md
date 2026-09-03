# coolbho3k/GLM-5.3-Flash-NVFP4-Optimized

## Resumen

GLM-5.3-Flash-NVFP4-Optimized es una cuantización de precisión mixta de carácter experimental del modelo multimodal GLM-5.3-Flash, desarrollada por el usuario coolbho3k a partir del checkpoint original de Z.ai y del export NVFP4 previo de Red Hat AI. El modelo base es el primer modelo multimodal nativo de la serie GLM-5, con una arquitectura híbrida altamente eficiente, 320 mil millones de parámetros totales y 18 mil millones activados, lo que lo sitúa en la categoría de modelos de mezcla de expertos (MoE) de gran escala.

Esta versión cuantizada no es un reentrenamiento, sino una optimización post-entrenamiento de la cuantización NVFP4. El autor ha reparado el manejo de escalas en los pesos de los expertos enrutados, ha aplicado un escalado NVFP4 optimizado para la reconstrucción de pesos y ha mantenido en FP8 ciertos pesos densos, de expertos compartidos y de atención. También se han restaurado tensores que un export anterior había convertido innecesariamente a BF16. El objetivo declarado es mejorar el error de reconstrucción de pesos respecto al export NVFP4 original.

La relevancia de este modelo radica en que permite servir un MoE de 320B en hardware relativamente asequible (dos nodos DGX Spark) mediante cuantización NVFP4/FP8, con soporte opcional de decodificación especulativa. Es un derivado comunitario, no un lanzamiento oficial de Z.ai ni de Red Hat, y su evaluación independiente sigue pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (no especificada en detalle en la informacion disponible) |
| Parametros totales | 320B |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados) y FP8 (pesos densos, expertos compartidos y atencion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo base, GLM-5.3-Flash, es el primer modelo multimodal nativo de la serie GLM-5, desarrollado por Z.ai. Segun la documentacion oficial, emplea una arquitectura hibrida altamente eficiente con 320B parametros totales y 18B activados, lo que implica un diseno de mezcla de expertos (MoE) en el que solo una fraccion de los parametros se activa por token. Es un modelo image-text-to-text, es decir, procesa tanto imagenes como texto.

No se proporcionan datos sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO). Esta version cuantizada es un ajuste post-entrenamiento (PTQ) realizado por coolbho3k. Los cambios tecnicos descritos en la model card incluyen: reparacion del manejo de escalas W1/W3 en los pesos de los expertos enrutados NVFP4, escalado NVFP4 optimizado para la reconstruccion, retencion de pesos densos, de expertos compartidos y de atencion en FP8, y restauracion de tensores que habian sido convertidos a BF16 en un export anterior. El resultado es una mejora del error de reconstruccion de pesos respecto al export NVFP4 original de Red Hat AI. El checkpoint incluye tokenizer, processor, plantilla de chat y configuracion de generacion.

## Capacidades

- Procesamiento multimodal de imagenes y texto (pipeline image-text-to-text), lo que permite describir imagenes, responder preguntas sobre contenido visual y combinar informacion de ambos tipos de entrada.
- Inferencia eficiente gracias a la cuantizacion NVFP4/FP8, con solo 18B parametros activados de los 320B totales.
- Soporte de decodificacion especulativa opcional (DFlash2) y de KV cache en FP8 o FP4 nativo, segun la receta de despliegue publicada.
- Compatibilidad con vLLM y con el formato compressed-tensors, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de documentos visuales: el modelo puede procesar imagenes de facturas, formularios o capturas de pantalla y extraer informacion textual, gracias a su naturaleza multimodal y a su ventana de contexto (no especificada, pero propia de un modelo de 320B). Es adecuado para automatizar tareas de extraccion de datos en entornos empresariales.
- Atencion al cliente multimodal: desplegado con vLLM en dos nodos DGX Spark, puede gestionar consultas de usuarios que incluyen imagenes y texto, como fotografias de productos o errores de software. La cuantizacion NVFP4/FP8 permite servir el modelo en este hardware sin necesidad de clusters de gran escala.
- Interpretacion de diagramas y graficos cientificos: en entornos de investigacion y analisis, el modelo puede describir graficos, esquemas y resultados visuales, lo que facilita la elaboracion de informes tecnicos a partir de material grafico.
- Accesibilidad para personas con discapacidad visual: la capacidad de generar descripciones de imagenes permite integrar el modelo en aplicaciones de asistencia que narren el contenido de fotografias o escenas captadas con una camara.
- Moderacion de contenido visual: el modelo puede clasificar o describir imagenes para detectar contenido inapropiado en plataformas de usuario, combinando la comprension textual y visual en un unico sistema.
- Generacion de documentacion tecnica: a partir de capturas de pantalla, diagramas de arquitectura o fotografias de componentes, el modelo puede redactar manuales, guias de usuario o entradas de documentacion, aprovechando su capacidad multimodal y su razonamiento sobre texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion independiente de benchmarks aguas abajo sigue siendo recomendada. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: la receta de despliegue probada utiliza dos nodos DGX Spark (SM121). No se indican alternativas.
- Compatibilidad con GPU de consumo: no disponible; la configuracion publicada se basa en DGX Spark, no en GPUs de consumo.
- Opciones de despliegue: vLLM parcheado (segun el repositorio de serving). Tambien se menciona el formato compressed-tensors y la compatibilidad con vLLM en los tags, pero no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card advierte que los resultados de serving publicados son especificos del stack de vLLM parcheado en dos DGX Sparks.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| coolbho3k/GLM-5.3-Flash-NVFP4-Optimized | 320B | 18B | no disponible | NVFP4/FP8 | MIT | HuggingFace |
| zai-org/GLM-5.3-Flash (modelo base) | 320B | 18B | no disponible | no aplica (original) | MIT | HuggingFace |
| RedHatAI/GLM-5.3-Flash-NVFP4 | 320B | 18B | no disponible | NVFP4 | MIT | HuggingFace |

La diferencia principal entre estas tres versiones es el tratamiento de la cuantizacion: el modelo original se sirve en precision completa, mientras que las dos versiones NVFP4 reducen el peso en memoria. El modelo de coolbho3k se presenta como una mejora sobre el export de Red Hat AI en terminos de error de reconstruccion, pero no se aportan datos de benchmarks que confirmen una ventaja funcional.

## Limitaciones y advertencias

- Es un derivado comunitario y no un lanzamiento oficial de Z.ai ni de Red Hat. Su uso en produccion requiere validacion propia.
- Los resultados de serving publicados son especificos de un stack de vLLM parcheado ejecutado en dos nodos DGX Spark. Pueden no reproducirse en otras configuraciones de hardware o software.
- No se han publicado evaluaciones independientes de benchmarks, sesgos, alucinaciones ni seguridad para esta cuantizacion concreta.
- La cuantizacion NVFP4/FP8 puede degradar la calidad de las respuestas respecto al modelo original en precision completa, aunque el autor afirma mejorar la reconstruccion frente al export NVFP4 inicial.
- No se dispone de informacion sobre el numero de tokens de contexto, los idiomas soportados ni el comportamiento en tareas de tool calling o razonamiento multi-paso.
- La licencia MIT es permisiva y permite uso comercial, pero al ser un derivado se debe mantener la atribucion al autor original y a los autores del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coolbho3k/GLM-5.3-Flash-NVFP4-Optimized
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3-Flash
- Export NVFP4 original (Red Hat AI): https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Documentacion oficial de GLM-5.3-Flash: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Repositorio de serving para dos DGX Spark: https://github.com/coolbho3k/GLM-5.3-Flash-NVFP4-DFlash2-2x-DGX-Spark/tree/feature/exl3-ab-current
