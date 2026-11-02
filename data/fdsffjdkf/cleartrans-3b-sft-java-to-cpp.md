# fdsffjdkf/ClearTrans-3B-SFT-Java-to-Cpp

## Resumen

ClearTrans 3B SFT Java to C++ es un checkpoint de ajuste fino supervisado (SFT) publicado por el usuario fdsffjdkf como parte del artefacto ClearTrans. Se construye sobre Qwen2.5-Coder-3B, el modelo de codigo de 3.085.938.688 parametros de Alibaba Qwen, y esta especializado en una unica direccion de traduccion de codigo: convertir codigo fuente Java en codigo C++. El problema que aborda es la traduccion automatica entre lenguajes de programacion con preservacion de semantica, una tarea donde los modelos generalistas suelen introducir errores funcionales.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5-Coder-3B, con su tokenizador y chat template originales, y se distribuye unicamente en formato safetensors a traves de la libreria transformers. No incorpora vision, audio ni capacidades multimodales; su ambito es estrictamente texto y codigo. El repositorio ocupa 6,8 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicacion reciente y de nicho.

Su relevancia es acotada pero concreta: ofrece un punto de partida reproducible para experimentos de traduccion Java a C++ dentro del proyecto ClearTrans, cuyo codigo de implementacion y replicacion esta disponible en GitHub. Conviene subrayar que el propio autor advierte de que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release, y que no se trata de un checkpoint final entrenado con GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-Coder-3B) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (qwen-research), uso no comercial |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-3B |
| Etapa de entrenamiento | SFT (supervised fine-tuning) |
| Version de transformers registrada | 4.57.1 |
| Version de PyTorch registrada | 2.9.1 |
| Tamano del repositorio | 6,8 GB |

## Arquitectura y entrenamiento

El checkpoint reutiliza la arquitectura transformer decoder-only de Qwen2.5-Coder-3B, con atencion causal estandar y sin componentes MoE, SSM ni hibridos. El ajuste fino se realizo sobre los pesos completos del modelo base mediante SFT, no mediante adaptadores LoRA ni tecnicas de bajo rango. Segun los metadatos de entrenamiento incluidos en la model card, se emplearon 8 dispositivos en configuracion multi-GPU, batch total de 64 (batch de 1 con 8 pasos de acumulacion de gradiente), optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-08, learning rate de 1e-05, scheduler coseno, semilla 42 y 3 epocas.

El dataset identificado es `train_full_1231_java2cpp_idx3`, especifico de la direccion Java a C++. El autor aclara que los ejemplos de entrenamiento no se incluyen en el repositorio y que el nombre del dataset por si solo no verifica su procedencia ni el procedimiento de reconstruccion. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF, DPO o GRPO; de hecho, la model card indica explicitamente que este checkpoint no debe interpretarse como un checkpoint final entrenado con GRPO. No se declaran innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de codigo Java a C++ como tarea principal y unica direccion soportada.
- Generacion de texto y codigo en formato conversacional, gracias al chat template incluido en el checkpoint.
- Razonamiento sobre estructuras de codigo orientado a objetos (clases, herencia, interfaces) en la medida en que lo permite el modelo base Qwen2.5-Coder-3B.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas soportados no se especifican.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Migracion de modulos Java a C++ en proyectos de modernizacion: el modelo recibe el codigo Java y devuelve una propuesta de equivalente C++, util como primer borrador que despues se valida con tests y herramientas de analisis estatico, tal como recomienda el propio autor.
- Generacion de esqueletos de port para bibliotecas heredadas: permite acelerar la conversion inicial de clases y funciones Java a cabeceras y ficheros C++, reduciendo el trabajo mecanico del ingeniero.
- Experimentacion academica en traduccion de codigo: sirve como checkpoint de referencia SFT dentro del artefacto ClearTrans para comparar frente a variantes posteriores o a otros modelos base.
- Construccion de datasets sinteticos de pares Java-C++: las traducciones generadas pueden filtrarse con compiladores y tests unitarios para producir corpus paralelos de entrenamiento.
- Evaluacion de calidad de traduccion automatica de codigo: util para montar pipelines de evaluacion que midan errores funcionales y code smells en las salidas, en linea con las limitaciones declaradas por el autor.
- Prototipado de asistentes de desarrollo especializados: integrado en un IDE o en un flujo conversacional, puede sugerir conversiones puntuales de fragmentos Java a C++ para revision humana.
- Docencia y formacion: permite ilustrar diferencias idiomaticas entre Java y C++ generando pares de ejemplo que el estudiante debe revisar y corregir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB.
- VRAM estimada con cuantizacion de 8 bits: en torno a 3,5-4 GB de pesos, aunque el repositorio no distribuye pesos cuantizados y habria que generarlos.
- VRAM estimada con cuantizacion de 4 bits: en torno a 2-2,5 GB de pesos, igualmente previa conversion por parte del usuario.
- GPU recomendadas: A100, H100 o L40S para despliegue de produccion; RTX 4090, RTX 3090 o RTX A6000 para experimentacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 (por ejemplo RTX 3070/4060 Ti de 8 GB con margen ajustado, RTX 3080/4070/4080/4090 con holgura), y en tarjetas de 6 GB si se cuantiza.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `device_map="auto"`; text-generation-inference aparece entre los tags del repositorio. vLLM, llama.cpp y Ollama no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponibles; el autor no ha validado la inferencia en GPU para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans 3B SFT Java to C++ | 3.085.938.688 | no disponible | Traduccion Java a C++ (SFT) | Qwen Research (no comercial) | HuggingFace, safetensors |
| Qwen2.5-Coder-3B (modelo base) | 3.085.938.688 | no disponible en la informacion proporcionada | Codigo generalista | Qwen Research / Apache segun variante | HuggingFace, amplia difusion |
| Otros checkpoints ClearTrans por direccion | no disponible | no disponible | Traduccion entre otros pares de lenguajes | Qwen Research (no comercial) | Referenciados en el repositorio GitHub del proyecto |

No se dispone de datos de rendimiento comparado ni de benchmarks que permitan situar este checkpoint frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor recomienda validarlas con los tests y herramientas de analisis previstos antes de confiar en ellas.
- La release no ha sido validada en inferencia GPU ni en reproduccion de benchmarks; los resultados practicos pueden diferir de lo esperado.
- No es un checkpoint final entrenado con GRPO; la model card lo desmiente explicitamente.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas, por lo que no constituye evidencia de reproduccion numerica completa.
- Licencia Qwen Research License Agreement: uso limitado a investigacion y evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0, lo que restringe su uso en produccion comercial.
- Idiomas soportados no especificados; el ambito es codigo Java y C++, sin garantias sobre lenguaje natural en otros idiomas.
- Longitud de contexto no documentada en la informacion disponible; conviene consultar la ficha de Qwen2.5-Coder-3B para planificar entradas largas.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de un modelo de codigo generalista, puede heredar los sesgos de su corpus de entrenamiento.
- Riesgo de alucinacion: presente en la generacion de APIs o construcciones C++ inexistentes; requiere compilacion y pruebas.
- El repositorio no registra descargas ni interacciones, lo que dificulta inferir validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Java-to-Cpp
- Modelo base Qwen2.5-Coder-3B: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio ClearTrans (implementacion y replicacion): https://github.com/Xingzhehu/ClearTrans
- Licencia del modelo (referenciada en el repositorio): LICENSE
- Aviso de atribucion y modificaciones: NOTICE
