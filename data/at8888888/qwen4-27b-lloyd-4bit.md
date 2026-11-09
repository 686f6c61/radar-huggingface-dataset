# at8888888/Qwen4-27B-Lloyd-4bit

## Resumen

El repositorio `at8888888/Qwen4-27B-Lloyd-4bit` no contiene ningun modelo entrenado ni pesos utilizables. Se trata de un repositorio de preparacion creado por un autor independiente (at8888888) que reserva un destino en Hugging Face para una futura cuantizacion de 4 bits del supuesto modelo Qwen4-27B. La model card es explicita: "No model weights are available in this repository. It is not ready for inference". No existe confirmacion de que exista un modelo oficial llamado Qwen4-27B ni de que su arquitectura, tamano o licencia sean los que sugiere el nombre.

El interes tecnico del repositorio no esta en el modelo (inexistente) sino en la receta de cuantizacion descrita: un esquema escalar no uniforme, solo de pesos, basado en el algoritmo de Lloyd con codebooks de 16 valores por tensor y escalas FP16 por grupo de 64 pesos. La documentacion detalla el proceso de ajuste (histograma ponderado de 16.384 bins, cinco inicializaciones deterministas, hasta 100 iteraciones), el coste de almacenamiento (4,25 bits por peso antes de codebooks y metadatos) y las limitaciones de compatibilidad con NVFP4, NF4, GGUF y otros cargadores de 4 bits.

Es relevante ahora unicamente como referencia metodologica para quienes investigan tecnicas de cuantizacion post-entrenamiento no uniformes, y como advertencia sobre repositorios placeholder que pueden aparecer en busquedas y confundirse con releases reales. No debe citarse como un modelo funcional ni como evidencia de que Qwen4 exista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pendiente de confirmar tras el lanzamiento oficial) |
| Parametros totales | no disponible (el nombre sugiere 27B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Lloyd 4-bit (escalar no uniforme, solo pesos, codebook de 16 valores por tensor, escalas FP16 por grupo de 64 pesos); 4,25 bits/peso antes de codebooks, padding y metadatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible (pendiente de revision de los terminos del lanzamiento oficial) |
| Formato de pesos | no disponible (no se han subido pesos; el contenedor esta por decidir) |

## Arquitectura y entrenamiento

No hay arquitectura definida. La model card indica que la arquitectura, el ID exacto del modelo base y la revision "to be confirmed after release". El repositorio no contiene tokenizer, configuracion de inferencia ni pesos empaquetados. El plan de publicacion contempla adaptar y validar la receta de cuantizacion una vez disponible el modelo oficial, registrar la cobertura de tensores, los codebooks ajustados, las escalas y el empaquetado, y solo entonces subir pesos validados con checksums.

La innovacion descrita es exclusivamente el esquema de cuantizacion. Se divide cada fila de la matriz en grupos de 64 pesos, se normaliza por el maximo absoluto del grupo (guardado como escala FP16) y se construye un histograma ponderado por el cuadrado de la escala de grupo para aproximar el error cuadratico medio de reconstruccion en el dominio original. Sobre ese histograma se ejecutan iteraciones de Lloyd desde cinco codebooks iniciales (uniforme, cuantiles de una normal, Asinh ajustado y dos derivados de densidad), con asignacion por punto medio y actualizacion de cada nivel ocupado a su centroide ponderado, hasta 100 iteraciones o convergencia. El ajuste usa solo la distribucion de pesos, sin calibracion con prompts, sin entrenamiento por gradiente y sin ajuste contra metricas de evaluacion. La model card advierte que esto reduce la sensibilidad a la inicializacion pero no garantiza el optimo global.

## Capacidades

- Ninguna capacidad verificable: el repositorio no contiene pesos ni configuracion de inferencia.
- No hay soporte demostrado de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No hay soporte demostrado de tool calling ni function calling.
- No hay soporte demostrado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues verificadas.
- El unico artefacto descrito es la receta de cuantizacion Lloyd 4-bit, no un modelo ejecutable.

## Casos de uso

- Estudio de metodos de cuantizacion no uniformes: la receta documentada (histograma ponderado, multiples inicializaciones, asignacion por punto medio) sirve como referencia para implementar o comparar esquemas de codebook escalar en proyectos propios de compresion de modelos.
- Investigacion sobre cuantizacion sin calibracion: el enfoque solo-pesos, sin datos de calibracion, es util para escenarios donde no se dispone de un conjunto representativo del dominio de uso.
- Analisis de coste de almacenamiento: el calculo de 4,25 bits/peso por grupo de 64 con escala FP16 permite estimar presupuestos de memoria para despliegues futuros, siempre que se anadan codebooks y metadatos.
- Evaluacion de compatibilidad de runtimes: el repositorio advierte explicitamente que NVFP4, NF4, GGUF y cargadores de 4 bits existentes no deben asumirse compatibles, lo que lo convierte en un caso de estudio sobre requisitos de soporte en el runtime.
- Seguimiento de releases comunitarios: util para monitorizar como la comunidad prepara cuantizaciones antes de que exista el modelo base, y para identificar repositorios placeholder en busquedas automatizadas.
- Auditoria de repositorios en Hugging Face: sirve como ejemplo de buenas practicas de transparencia al declarar ausencia de pesos, estado pendiente y campos `base_model` sin definir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de calidad, memoria, latencia ni throughput para Qwen 4, y que no se presentan resultados de otros modelos como si fueran de Qwen 4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No hay pesos ni arquitectura confirmada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no validadas. La model card senala que el soporte de runtime y la compatibilidad CPU/GPU "not validated for Qwen 4", y que la precision de activaciones, la precision de acumulacion, la cobertura de tensores, el formato de contenedor y los kernels CPU/GPU estan por seleccionar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe un modelo base confirmado con el que comparar, y el repositorio no publica pesos ni resultados. Como referencia del ecosistema de cuantizacion de 4 bits, cabria comparar con esquemas establecidos (NF4 de bitsandbytes, GPTQ, AWQ, GGUF Q4_K_M), pero la model card no ofrece datos comparativos y advierte que el esquema Lloyd es un codebook personalizado no compatible con esos cargadores.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible descargar ni ejecutar ningun modelo.
- El nombre "Qwen4-27B" no esta confirmado: la propia model card indica que el placeholder "does not establish that an official model with this exact name exists".
- No hay licencia definida; los terminos de redistribucion de pesos derivados estan "pending review of the official release".
- No hay garantia de que la receta de cuantizacion funcione tras el lanzamiento oficial: "The recipe may need changes after the official architecture and weights become available".
- El esquema Lloyd no es compatible con NVFP4, NF4, GGUF ni cargadores de 4 bits existentes; requeriria soporte explicito en el runtime o una conversion validada por separado.
- "4-bit" describe solo los indices; el coste real es 4,25 bits/peso antes de codebooks, padding, metadatos y tensores retenidos en mayor precision.
- El ajuste del codebook no garantiza el optimo global y no usa calibracion ni evaluacion.
- Proyecto comunitario independiente, sin afiliacion con el equipo Qwen.
- No hay fecha de publicacion prometida.
- Riesgo de confusion en busquedas: al aparecer con tags de cuantizacion y 4-bit, puede citarse erroneamente como un modelo funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/at8888888/Qwen4-27B-Lloyd-4bit
- Repositorio de preparacion relacionado (Asinh 4-bit): https://huggingface.co/at8888888/Qwen4-27B-Asinh-4bit
