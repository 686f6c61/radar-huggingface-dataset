# fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-C

## Resumen

ClearTrans-3B-SFT-Cpp-to-C es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de C++ a C. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta en el repositorio de GitHub del proyecto. El modelo resuelve un problema muy concreto dentro de la migracion de bases de codigo legacy: automatizar la conversion de fuentes C++ a C preservando la semantica del programa original.

El checkpoint tiene 3.085.938.688 parametros (unos 3,09 mil millones) y conserva la arquitectura transformer decoder-only de Qwen2, con el tokenizador y la plantilla de chat originales. El repositorio ocupa 6,8 GB en formato safetensors y esta pensado para cargarse con Transformers (el autor registra Transformers 4.57.1 y PyTorch 2.9.1 en los metadatos de entrenamiento).

La relevancia de esta ficha es doble: por un lado, documenta una especializacion vertical poco habitual (traduccion entre lenguajes de programacion con direccion fija); por otro, advierte de que el propio autor no ha validado inferencia en GPU ni reproduccion de benchmarks para esta release, por lo que debe tratarse como un artefacto de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (orientado a codigo fuente C++ y C; el idioma natural de las respuestas no se especifica) |
| Licencia | Qwen Research License Agreement (etiqueta `license:other`, `license_name: qwen-research`); uso no comercial de investigacion o evaluacion |
| Formato de pesos | safetensors (repo de 6,8 GB, con shard index) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B, un transformer decoder-only denso de la familia Qwen2, y se ha sometido a un ajuste fino supervisado completo (full SFT, no LoRA) segun los metadatos del checkpoint. La configuracion de entrenamiento registrada incluye learning rate de 1e-05, batch total de 64 (batch de 1 por dispositivo con 8 GPUs y 8 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno, 3 epocas completas y semilla 42, en un entorno multi-GPU de 8 dispositivos.

El conjunto de entrenamiento se identifica como `train_full_1231_cpp2c_idx3`, un dataset especifico de la direccion C++ a C. El autor advierte explicitamente de que los ejemplos de entrenamiento no se incluyen en el repositorio y que el nombre del dataset no verifica por si solo su procedencia ni el procedimiento de reconstruccion. No se documenta el volumen de tokens, la composicion del dataset ni si hubo etapas posteriores de RLHF, DPO o GRPO; de hecho, la model card aclara que este checkpoint no debe considerarse un modelo final entrenado con GRPO. Tampoco se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de codigo fuente de C++ a C con direccion fija: es la funcion principal y practicamente exclusiva del checkpoint.
- Generacion de texto y codigo en formato conversacional, heredada de la plantilla de chat de Qwen2.5-Coder.
- Razonamiento sobre construcciones de C++ (clases, plantillas, referencias, RAII, sobrecarga de operadores) para reescribirlas en C equivalente, segun la especializacion del ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo esta orientado a codigo, no se documenta cobertura de idiomas naturales.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Migracion de bases de codigo legacy: convertir modulos C++ a C para proyectos que deben compilar con un toolchain estrictamente C (por ejemplo, entornos embebidos o kernels de sistema) y donde reescribir a mano es costoso.
- Portabilidad a plataformas sin compilador de C++: generar versiones en C de librerias pequenas para integrarlas en firmware o sistemas con restricciones de toolchain, revisando siempre la salida con tests.
- Generacion de borradores para revision humana: usar el modelo como primer paso de un flujo de traduccion asistida donde un ingeniero valida y corrige la salida antes de integrarla.
- Creacion de datasets de pares C++/C: producir traducciones candidatas que, tras validacion, alimenten corpus de entrenamiento o evaluacion para otras herramientas de traduccion de codigo.
- Investigacion en traduccion entre lenguajes de programacion: servir como checkpoint de referencia en experimentos academicos sobre SFT direccional y evaluacion de fidelidad semantica.
- Docencia y analisis de equivalencias: generar ejemplos comparativos de como se expresan patrones de C++ en C para materiales formativos, con supervision del instructor.
- Automatizacion de tareas de refactorizacion acotadas: convertir funciones o ficheros individuales dentro de un pipeline de CI que marque los cambios para revision, nunca aplicandolos de forma automatica sin tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la release ha superado comprobaciones de tamano de fichero, disposicion de tensores e indices de shards, pero que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (3,09 B de parametros), en fp16 se situaria en torno a 6-7 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría aproximadamente a 3-4 GB y 2 GB respectivamente; estas cifras son estimaciones por tamano y no estan validadas por el autor.
- GPU recomendadas: no especificadas. El entrenamiento se realizo en 8 GPUs, pero no se documenta el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, cabria en GPUs consumer con suficiente VRAM, pero la inferencia no ha sido validada en esta release.
- Opciones de despliegue: carga via Transformers (`AutoModelForCausalLM` con `torch_dtype="auto"` y `device_map="auto"`), segun el ejemplo de la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Cpp-to-C | ~3,09 B | no disponible | Traduccion C++ a C (SFT) | Qwen Research (no comercial) | Hugging Face, solo safetensors |
| Qwen2.5-Coder-3B (modelo base) | ~3,09 B | no disponible en la informacion proporcionada | Generacion de codigo general | Qwen Research / Apache segun variante | Hugging Face, ampliamente soportado |
| Otros modelos de traduccion de codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros checkpoints comparables de traduccion C++ a C en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor recomienda evaluar las salidas con los tests y herramientas de analisis previstos antes de confiar en ellas.
- La release no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; es una publicacion de pesos, no evidencia de reproduccion numerica completa de los experimentos.
- La inferencia en GPU y la reproduccion de benchmarks no han sido validadas para este checkpoint.
- No debe considerarse un checkpoint final entrenado con GRPO; es una etapa SFT.
- Licencia Qwen Research: uso limitado a investigacion o evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0, lo que restringe su uso en produccion comercial.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, puede arrastrar los sesgos de Qwen2.5-Coder.
- Riesgo de alucinacion: no cuantificado; en traduccion de codigo se traduce en APIs o construcciones inventadas que no compilan o cambian la semantica.
- Limitaciones de contexto e idioma: no documentadas; la ventana de contexto no se especifica y la cobertura de idiomas naturales es desconocida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Cpp-to-C
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Licencia incluida en el repositorio: LICENSE (Qwen Research License Agreement)
- Aviso de atribucion y modificaciones: NOTICE
