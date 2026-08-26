# jashepp/Ornith-1.5-9B-MXFP4_Hybrid-Imatrix-GGUF

## Resumen

Ornith-1.5-9B-MXFP4_Hybrid-Imatrix-GGUF es una cuantización GGUF de precisión mixta del modelo Ornith-1.5-9B, desarrollada por el usuario jashepp. El modelo base, creado por ornith-ai (DeepReinforce), es un modelo de codificación agéntica que extiende el framework de auto-scaffolding de Ornith-1.0 hacia un bucle completo de auto-mejora: propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo. Esta versión cuantizada busca reducir el enorme consumo de VRAM de las capas de expertos mediante una combinación de formatos MXFP4, Q8_0 y F16, manteniendo la calidad del razonamiento.

El modelo tiene 8.95 mil millones de parámetros y está diseñado para tareas de generación de código, razonamiento encadenado (chain-of-thought) y uso de herramientas. La cuantización utiliza una importance matrix (imatrix) combinada con datos generados por modelos Ornith de mayor tamaño, lo que mejora la preservación de la calidad en las capas cuantizadas. Está disponible en tres variantes de archivo con diferentes equilibrios entre tamaño y fidelidad, siendo la más pequeña de solo 4.77 GB, lo que permite ejecutarlo en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Transformer-Mamba con capas de expertos (segun descripcion de capas de la cuantizacion) |
| Parametros totales | 8.953.803.264 (8.95B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, Q8_0, F16 (en combinaciones: MXFP4+Q8_0+F16, MXFP4+Q8_0, MXFP4 solo) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se detalla en la informacion disponible, pero la descripcion de las capas de la cuantizacion revela componentes clave: capas de atencion, bloques Mamba (ssm_alpha, ssm_beta, ssm_out) y capas de expertos enroutados (ffn_down_exps, ffn_gate_exps, ffn_up_exps). Esto sugiere un diseno hibrido que combina mecanismos de atencion tradicionales con state-space models (SSM) y posiblemente una mezcla de expertos (MoE) parcial. El modelo base se describe como sucesor de Ornith-1.0 9B, con mejoras en seguimiento de instrucciones y razonamiento.

No se han proporcionado detalles sobre el entrenamiento del modelo base (datos, numero de tokens, metodos de alineacion). La model card menciona un framework de auto-mejora que genera sus propias tareas y soluciones para aprendizaje por refuerzo, pero no se especifican los detalles tecnicos. La cuantizacion fue realizada manualmente con seleccion de capas para maximizar la calidad, utilizando una imatrix combinada con datos markdown generados por modelos Ornith de 35B.

## Capacidades

- Generacion de codigo y edicion de archivos con planificacion previa: el modelo razona y planifica los cambios antes de ejecutarlos, evitando retrocesos tipicos de otros modelos.
- Razonamiento encadenado (chain-of-thought): se recomienda mantener el modo thinking habilitado para obtener resultados optimos.
- Uso de herramientas (tool-use) y capacidades agénticas: puede integrarse en flujos de trabajo que requieren llamadas a funciones y ejecucion de acciones.
- Seguimiento de instrucciones mejorado respecto a su predecesor Ornith-1.0.
- Generacion de texto conversacional y asistencia en tareas de programacion.
- Soporte multilingue limitado: solo se declara ingles en la ficha, aunque el modelo base podria tener capacidades adicionales no documentadas.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede sugerir implementaciones completas, refactorizar codigo y explicar fragmentos, gracias a su capacidad de razonar sobre el contexto antes de generar la respuesta.
- Agente autonomo de desarrollo: al soportar tool-use y razonamiento multi-paso, puede encargarse de tareas como crear archivos, ejecutar tests y corregir errores de forma autonoma en un repositorio.
- Generacion de documentacion tecnica: su entrenamiento con datos markdown y su capacidad de seguir instrucciones lo hacen adecuado para redactar documentacion de APIs, guias de uso y comentarios de codigo.
- Revision de codigo automatizada: puede analizar pull requests, detectar problemas logicos y sugerir mejoras, aprovechando su ventana de contexto (aunque la longitud no esta especificada).
- Chatbot de soporte tecnico especializado en programacion: integrado en plataformas de atencion al cliente, puede resolver dudas sobre lenguajes, frameworks y depuracion.
- Pipeline de CI/CD con generacion de codigo: el modelo puede generar parches o plantillas de codigo en respuesta a fallos de compilacion, integrándose mediante llamadas a herramientas en el flujo de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen con graficos comparativos, pero los valores numericos no son accesibles en el texto. La guia de atomic.chat menciona que el modelo es adecuado para ejecucion local, pero no proporciona cifras concretas de rendimiento.

## Requisitos de hardware

- El archivo mas pequeño (MXFP4 solo) ocupa 4.77 GB, por lo que cabe en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1080 Ti).
- El archivo intermedio (MXFP4+Q8_0) ocupa 9.53 GB, requiriendo al menos 12 GB de VRAM (RTX 4070, RTX 3080, etc.).
- El archivo de maxima calidad (MXFP4+Q8_0+F16) ocupa 11.4 GB, necesitando 16 GB o mas (RTX 4080, RTX 4090, A100, etc.).
- Segun la guia de atomic.chat, el modelo puede ejecutarse en una GPU de 8 GB o en un Mac con 16 GB de RAM unificada a 4-bit.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Tambien puede usarse con vLLM si se convierte a otro formato.
- La latencia y el throughput dependen del hardware y de la cuantizacion elegida; no se han proporcionado cifras especificas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos. Sin embargo, se puede comparar cualitativamente con el modelo base original y con alternativas de codificacion de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 8.95B | no disponible | MIT | safetensors | Modelo original sin cuantizar |
| Ornith-1.5-9B-MXFP4 (este repo) | 8.95B | no disponible | MIT | GGUF | Cuantizacion de precision mixta |
| Qwen3-Coder-8B (referencia) | 8B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo de codificacion de Alibaba, sin capacidades agénticas documentadas |

La ventaja de esta cuantizacion es su reducido tamaño en VRAM gracias a MXFP4, manteniendo capas criticas en mayor precision. No se dispone de datos objetivos de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- La cuantizacion MXFP4 puede introducir una ligera degradacion en la calidad del razonamiento, especialmente en tareas complejas de codificacion.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas estandar no esta verificado.
- El modelo base utiliza un framework de auto-mejora que podria generar comportamientos impredecibles en entornos no controlados.
- Riesgo de alucinacion en generacion de codigo: puede producir soluciones incorrectas o inseguras si no se supervisa.
- La longitud de contexto no esta documentada, lo que limita la planificacion de despliegues con requisitos de contexto largo.
- Aunque la licencia es MIT, el modelo base podria tener restricciones adicionales no especificadas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jashepp/Ornith-1.5-9B-MXFP4_Hybrid-Imatrix-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Guia de ejecucion local (atomic.chat): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Variante 35B A3B cuantizada: https://huggingface.co/jashepp/Ornith-1.5-35B-A3B-MXFP4_MOE_Hybrid-Imatrix-GGUF
