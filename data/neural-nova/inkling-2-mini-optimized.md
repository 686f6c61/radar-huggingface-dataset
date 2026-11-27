# neural-nova/Inkling-2-Mini-Optimized

## Resumen

Inkling 2 Mini Optimized es un paquete de despliegue e inferencia optimizada publicado por Neural Nova sobre el modelo base Inkling 2 Mini de Thinking Machines Lab. No se trata de un checkpoint reentrenado ni de un fine-tune con pesos distintos: el repositorio documenta una receta de serving basada en contenedor Docker, con kernels ajustados para NVIDIA H100 y decodificacion especulativa DSpark, orientada a maximizar el throughput de generacion de texto sobre el MoE multimodal subyacente.

El modelo base es un transformer Mixture-of-Experts multimodal con 26.4B parametros totales y aproximadamente 5.4B parametros activos por token, gracias a una arquitectura "looped" en la que las capas intermedias se ejecutan tres veces compartiendo pesos. Los pesos publicados emplean precision mixta NVFP4/MXFP8 con activaciones BF16 en la configuracion de serving probada.

La relevancia de esta ficha es practica: cuantifica cuanto se gana al sustituir los kernels nativos por los optimizados de Neural Nova en un H100 80GB. Segun la model card, se registra hasta 3.98x de throughput de salida frente a kernels nativos con DSpark desactivado en la carga 4K/4K a concurrencia 1, y una mejora adicional del 4.2-6.0% cuando DSpark ya esta activo, en las pruebas 1K/1K y 4K/4K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal con capas intermedias "looped" (ejecutadas 3 veces con pesos compartidos) |
| Parametros totales | 26.4B |
| Parametros activos | Aproximadamente 5.4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en precision mixta NVFP4/MXFP8; activaciones BF16 en la configuracion de serving probada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio es una receta de serving; los pesos provienen del repositorio upstream) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts multimodal con 26.4B parametros totales y unos 5.4B activos por token. La innovacion estructural descrita es un esquema "looped": las capas centrales de la red se ejecutan tres veces reutilizando los mismos pesos, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. El enrutamiento MoE permite que solo una fraccion de los expertos se active en cada token, lo que explica la diferencia entre parametros totales y activos.

En el plano del entrenamiento, la informacion disponible no detalla el volumen de tokens, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden a la model card upstream de Thinking Machines Lab y no se reproducen en este repositorio. La contribucion tecnica de esta publicacion es de inferencia: decodificacion especulativa DSpark con siete tokens especulativos en la configuracion medida, kernels especificos para H100 con tile sizes, planificacion y profundidad de pipeline adaptados a NVFP4 en las puertas y proyecciones de los expertos, y un contenedor Docker con API en el puerto 8000 y entrypoint de benchmark.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation y el benchmark se ejecuta sobre cargas de entrada/salida de 1K/1K y 4K/4K tokens.
- Capacidades multimodales: la arquitectura del modelo base se describe como multimodal, aunque el benchmark publicado solo cubre generacion de texto.
- Razonamiento y codigo: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Aceleracion por decodificacion especulativa: DSpark propone multiples tokens que el modelo objetivo verifica conjuntamente, con siete tokens especulativos en la configuracion medida.

## Casos de uso

- Serving de alta concurrencia en H100: el paquete esta disenado para desplegar Inkling 2 Mini en un unico H100 80GB con API compatible en el puerto 8000, lo que permite exponer el modelo como servicio interno sin ensamblar manualmente vLLM, kernels y contenedor.
- Generacion de texto a gran escala con ventanas de 4K: la mejora de hasta 3.98x en throughput de salida en la carga 4K/4K a concurrencia 1 lo hace adecuado para tareas de resumen, redaccion o sintesis de documentos largos donde el coste por token es el factor dominante.
- Evaluacion comparativa de optimizaciones de inferencia: los scripts benchmark-v1.1.py y serve-benchmark-v1.1.py permiten reproducir las tres ramas (nativo sin DSpark, nativo con DSpark, optimizado con DSpark) con 32 peticiones por bucle y tres bucles cronometrados por celda, util para validar mejoras de kernels antes de adoptarlas.
- Despliegue reproducible con contenedores: la imagen fijada por digest (sha256:404e3c10...) y la verificacion de checksums SHA-256 de los scripts facilitan pipelines de CI/CD y entornos con requisitos de reproducibilidad estricta.
- Prototipado de aplicaciones conversacionales multi-turno: al ejecutarse tras una API HTTP estandar con endpoints /health y /v1/models, puede integrarse en backends de chat o asistentes que necesiten un MoE de 26.4B con solo 5.4B activos por token.
- Investigacion sobre decodificacion especulativa: la configuracion con siete tokens especulativos y la medicion de la tasa de aceptacion de DSpark permiten estudiar el equilibrio entre velocidad y verificacion en modelos MoE.

## Benchmarks y rendimiento

Los datos publicados comparan tres configuraciones sobre un unico H100 80GB, con cargas 1K/1K y 4K/4K a concurrencia 1 y 4, 32 peticiones por bucle y tres bucles cronometrados por celda.

| Comparacion | Resultado declarado |
|---|---|
| Optimizado con DSpark frente a kernels nativos sin DSpark | Hasta 3.98x de throughput de salida en 4K/4K a C1 |
| Optimizado con DSpark frente a nativo con DSpark | 4.2-6.0% de mejora de throughput en 1K/1K y 4K/4K |
| Tokens especulativos DSpark | 7 en la configuracion medida |
| Precision de pesos | NVFP4/MXFP8 con activaciones BF16 |

No se han publicado en la informacion disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros): la model card indica explicitamente que la generacion de tokens aleatorios fijos es una prueba de rendimiento, no de precision.

## Requisitos de hardware

- VRAM estimada: el hardware de referencia es una unica NVIDIA H100 de 80GB; no se publican estimaciones para otras capacidades.
- GPU recomendadas: NVIDIA H100 80GB como plataforma objetivo; los kernels estan ajustados especificamente para H100 (tile sizes, planificacion y profundidad de pipeline para NVFP4).
- GPU de consumo: no disponible; no se documenta soporte para RTX 4090 u otras GPU consumer.
- Software: Docker con NVIDIA Container Toolkit en host Linux, imagen registry.neural-nova.io/public/inkling2-mini:v1.0.0, API en el puerto 8000.
- Opciones de despliegue: contenedor Docker con vLLM y DSpark; no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: los ficheros summary.csv y summary.json generados por el benchmark incluyen throughput agrupado y percentiles p50, p95 y p99 de TTFT, TPOT y latencia extremo a extremo en milisegundos; los valores concretos no se reproducen en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini Optimized (Neural Nova) | 26.4B totales / ~5.4B activos | no disponible | Serving optimizado para H100 con DSpark | no disponible | Contenedor Docker con digest fijado |
| Inkling 2 Mini (Thinking Machines Lab) | 26.4B totales / ~5.4B activos | no disponible | Modelo base multimodal | no disponible | Repositorio upstream en Hugging Face |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad ni de especificaciones de contexto que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios: es una receta de serving sobre thinkingmachines/Inkling-2-Mini, por lo que las limitaciones de capacidades, sesgos y alucinacion del modelo base aplican integramente.
- Los kernels estan ajustados para H100; no hay garantia de rendimiento ni de funcionamiento en otras GPU, incluida la gama consumer.
- Las cifras de hasta 3.98x y del 4.2-6.0% corresponden a un unico H100, a cargas 1K/1K y 4K/4K y a concurrencias 1 y 4; no deben extrapolarse a otros escenarios.
- Los tres bucles cronometrados comparten un mismo servidor por rama y no establecen repetibilidad independiente del orden de servidores, segun advierte la propia model card.
- El entrypoint de benchmark integrado en la imagen usa ajustes distintos y aceptacion sintetica de DSpark; debe sustituirse por los scripts externos v1.1 con checksums verificados.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se publican datos de idiomas soportados, contexto maximo ni resultados de calidad, lo que limita la evaluacion para produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neural-nova/Inkling-2-Mini-Optimized
- Modelo base upstream: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Imagen Docker: registry.neural-nova.io/public/inkling2-mini:v1.0.0 (digest sha256:404e3c10d9e2c7ab90356715f403e1299ef8e51a1ffb44e634eaff76abc14c4e)
- Scripts de benchmark: https://huggingface.co/neural-nova/Inkling-2-Mini-Optimized/resolve/43bdc272324ab0857051d76606eaed3e558b6f7d/benchmark-v1.1.py y https://huggingface.co/neural-nova/Inkling-2-Mini-Optimized/resolve/43bdc272324ab0857051d76606eaed3e558b6f7d/serve-benchmark-v1.1.py
