# pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ4e-mtp

## Resumen

Este repositorio contiene una cuantizacion mixta de 4 bits del modelo Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, realizada por el usuario pyros-vault con la herramienta oQ (oMLX v0.6.2). El modelo original, desarrollado por DavidAU, aplica la metodologia COLD FUSION (combinacion de GAIN y la infraestructura de entrenamiento de Unsloth) para reducir los tokens de pensamiento a entre 1/10 y 1/2 de los modelos Qwen estandar, manteniendo el 99% del rendimiento en precision completa tanto a 8 como a 4 bits.

La version cuantizada esta pensada para ejecutarse en dispositivos Apple Silicon mediante la libreria MLX, ofreciendo un formato ligero y optimizado para inferencia local. Segun los datos de HuggingFace, los pesos reales en safetensors suman 4.926.789.872 parametros (aproximadamente 4,9 mil millones), una cifra muy inferior a los 27 mil millones que sugiere el nombre del modelo, lo que podria indicar una version reducida o un error de nomenclatura. El repositorio ocupa 17 GB, consistente con un modelo de ese tamano en cuantizacion 4-bit con grupo de 64.

La relevancia de este modelo reside en su capacidad para ejecutar un asistente de lenguaje con razonamiento eficiente en hardware local de gama media, aprovechando las optimizaciones de MLX y la reduccion de tokens de pensamiento del metodo COLD FUSION. No se dispone de informacion sobre la licencia ni los idiomas soportados en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (familia Qwen 3.5, transformer) |
| Parametros totales | 4.926.789.872 (segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262K tokens (segun documentacion del modelo original) |
| Tipos de cuantizacion | 4 bits, grupo de 64, precision mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, que pertenece a la familia Qwen 3.5. La arquitectura subyacente es un transformer denso, aunque no se han publicado detalles especificos sobre el numero de capas, cabezas de atencion o dimensiones ocultas en la informacion disponible. El metodo COLD FUSION emplea GAIN (una tecnica interna del autor) junto con la infraestructura de Unsloth para reducir los tokens de pensamiento generados durante el razonamiento, manteniendo a la vez un alto rendimiento en tareas complejas.

Esta version concreta no ha sido entrenada de nuevo, sino que se ha sometido a un proceso de cuantizacion mixta mediante la herramienta oQ de oMLX. La cuantizacion reduce la precision de los pesos a 4 bits con un tamaño de grupo de 64, lo que disminuye el uso de memoria y acelera la inferencia en hardware compatible con MLX, a costa de una ligera perdida de fidelidad. No se dispone de informacion sobre el dataset de entrenamiento del modelo original ni sobre el proceso de alineacion (RLHF, DPO, etc.).

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, gracias a la reduccion de tokens de pensamiento del metodo COLD FUSION.
- Soporte de entrada multimodal (imagen y video) segun la documentacion del modelo original, aunque no se ha verificado en esta cuantizacion.
- Capacidades de codificacion y uso de herramientas (tool calling), basadas en las caracteristicas de la serie Qwen 3.5.
- Ejecucion optimizada en Apple Silicon mediante MLX, con cuantizacion 4-bit para reducir la huella de memoria.
- Compatibilidad con el formato safetensors de MLX, permitiendo su integracion en pipelines de inferencia locales.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y revisar codigo en multiples lenguajes, aprovechando su ventana de contexto de 262K tokens para analizar proyectos completos. Su cuantizacion 4-bit permite ejecutarlo en un Mac con 16 GB de RAM unificada.
- Razonamiento multimodal en el dispositivo: al heredar las capacidades de vision del modelo original, puede procesar capturas de pantalla o diagramas para responder preguntas tecnicas sin enviar datos a la nube.
- Automatizacion de tareas de desarrollo: integrable en entornos de desarrollo integrado (IDE) o herramientas de linea de comandos para autocompletar codigo, generar documentacion o refactorizar funciones.
- Prototipado rapido de agentes conversacionales: su reduccion de tokens de pensamiento acelera las respuestas en chatbots de soporte tecnico, manteniendo un razonamiento coherente en dialogos largos.
- Analisis de documentos extensos: la ventana de 262K tokens permite procesar manuales tecnicos, especificaciones o repositorios enteros para extraer informacion relevante.
- Investigacion en eficiencia de modelos: sirve como banco de pruebas para evaluar el impacto de la cuantizacion mixta en el rendimiento de tareas de razonamiento y codigo, comparando con versiones en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion. Los datos disponibles corresponden al modelo original Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, segun la documentacion externa:

| Benchmark | Resultado (modelo original) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores indican un rendimiento solido en tareas de ingenieria de software y uso de herramientas, pero no se puede garantizar que la version cuantizada mantenga exactamente los mismos resultados. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,9 mil millones de parametros en cuantizacion 4-bit, el modelo requiere aproximadamente 2,5-3 GB de memoria para los pesos, mas overhead de activaciones. En la practica, se recomienda al menos 8 GB de RAM unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con 8 GB o mas de memoria unificada. Tambien puede ejecutarse en GPUs de NVIDIA via convertidores de formato, aunque no es el objetivo principal.
- Compatibilidad con GPU de consumo: si, cabe en una RTX 3060 de 12 GB o superior tras convertir los pesos a otro formato (por ejemplo, GGUF para llama.cpp).
- Opciones de despliegue: MLX (nativo), llama.cpp (tras conversion), Ollama (si se convierte a GGUF), vLLM (con adaptaciones).
- Latencia y throughput: no hay datos publicados. Se espera una velocidad de generacion de 20-40 tokens por segundo en un MacBook Pro M3 Pro, segun estimaciones para modelos de tamano similar en MLX.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo original compite con alternativas como Qwen2.5-7B, Llama-3.1-8B o Mistral-7B, pero esta cuantizacion presenta caracteristicas particulares (MLX, COLD FUSION) que dificultan una comparacion directa sin datos de benchmarks adicionales. Se recomienda consultar el repositorio del modelo original para obtener metricas comparativas.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada en la ficha de HuggingFace, lo que impide determinar si su uso comercial esta permitido. Se debe contactar con el autor antes de emplearlo en produccion.
- La cuantizacion 4-bit puede introducir degradaciones sutiles en tareas de razonamiento complejo o generacion de codigo, a pesar de la afirmacion del 99% de rendimiento mantenido.
- El numero de parametros real (4,9 mil millones) contradice el nombre del modelo (27B), lo que sugiere que podria tratarse de una version destilada o de un error de etiquetado. Esto afecta a las expectativas de capacidad.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma. El modelo puede heredar los sesgos del conjunto de entrenamiento de Qwen 3.5, que no se ha detallado.
- El formato MLX safetensors limita la portabilidad a otros frameworks sin conversion previa, lo que puede suponer una barrera para equipos que no usan Apple Silicon.
- La ventana de contexto de 262K tokens es teorica; en la practica, el rendimiento puede degradarse con secuencias muy largas debido a limitaciones de memoria y atencion.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ4e-mtp
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Guia de instalacion local (GitHub): https://github.com/qwen3-8-27b/qwen3-8-27b
- Articulo de referencia sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Herramienta de cuantizacion oQ: https://github.com/jundot/omlx
