# Anotos/LFM2-8B-A1B-MLX-4bit

## Resumen

Anotos/LFM2-8B-A1B-MLX-4bit es una conversion a 4 bits en formato MLX del modelo LiquidAI/LFM2-8B-A1B, un transformer de tipo mixture of experts (MoE) desarrollado por Liquid AI. El modelo original cuenta con 8.339.930.560 parametros totales (8,34 B) y aproximadamente 1.500 millones de parametros activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamano. La conversion la firma el usuario Anotos (Axly's Customs) y esta pensada especificamente para ejecucion local en Apple Silicon.

El problema que resuelve esta ficha es el de llevar un MoE de 8,3 B a un Mac con memoria unificada sin depender de GPUs dedicadas ni de servicios en la nube. El fichero resultante ocupa 4,69 GB y, sobre un Apple M4, alcanza un pico de memoria de unos 4,7 GB, frente a los aproximadamente 5,5 GB que consumia una conversion comunitaria previa de 5,21 GB del mismo modelo base con 4 bits. Se trata, por tanto, de una optimizacion de empaquetado y de uso de memoria, no de un reentrenamiento.

Es relevante ahora porque la cuantizacion a 4 bits de arquitecturas MoE exige cuidados especificos: en este caso las puertas de enrutamiento de expertos se mantienen en 8 bits para evitar errores de routing, y se requiere mlx-swift-lm 3.31.4 o superior, ya que versiones anteriores enrutan mal los expertos de este modelo. El repositorio es reciente y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 MoE (mixture of experts), libreria MLX |
| Parametros totales | 8.339.930.560 (8,34 B) |
| Parametros activos | ~1,5 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (4,5 bits por peso en conjunto, group size 64), puertas de enrutamiento de expertos en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador lfm1.0) |
| Formato de pesos | safetensors (MLX), fichero model.safetensors de 4,69 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base LiquidAI/LFM2-8B-A1B, etiquetado como lfm2_moe y liquid: un transformer con capas de mezcla de expertos en el que solo se activa una fraccion reducida de los parametros por token (aproximadamente 1,5 B de los 8,34 B totales). El pipeline declarado es text-generation y el modelo esta marcado como conversational. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de esta version concreta es exclusivamente la conversion y cuantizacion. Se realizo con mlx-lm 0.32.0 mediante el comando `mlx_lm.convert --hf-path LiquidAI/LFM2-8B-A1B -q --q-bits 4`, partiendo del commit `c1c44ff9fc` del modelo base. El autor indica que no se introdujo ningun otro cambio mas alla de la cuantizacion y de mantener las puertas de enrutamiento en 8 bits. El peso resultante es de 4,5 bits por peso de media, con group size 64, y el SHA-256 de model.safetensors es `0a4e33ddb658904b32cccb5660a31d2f3b82b7f55ed907cf622d45e790f20a70`.

## Capacidades

- Generacion de texto y uso conversacional, segun los tags conversational y text-generation del modelo base.
- Inferencia eficiente en memoria y computo gracias a la activacion de aproximadamente 1,5 B de parametros por token sobre un total de 8,34 B.
- Ejecucion local en Apple Silicon mediante la libreria MLX y la herramienta mlx_lm.generate.
- Integracion en aplicaciones nativas de Apple a traves de mlx-swift-lm 3.31.4 o superior.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional totalmente local en un Mac: el modelo se ejecuta con mlx_lm.generate sobre memoria unificada, con un pico de unos 4,7 GB en un M4, lo que permite mantener conversaciones sin enviar datos a servicios externos.
- Aplicaciones de escritorio para macOS: la conversion se realizo para la aplicacion Erato, de modo que sirve como ejemplo de integracion de un MoE cuantizado dentro de un producto de escritorio en Apple Silicon.
- Aplicaciones iOS o macOS con MLX Swift: mediante mlx-swift-lm 3.31.4 o superior se puede cargar el modelo en una app nativa, siempre que se respete el requisito de version para el enrutamiento correcto de expertos.
- Prototipado en portatiles sin GPU dedicada: al ocupar 4,69 GB en disco, cabe en equipos con 8 GB o 16 GB de memoria unificada, lo que reduce la barrera para probar arquitecturas MoE de 8 B.
- Entornos con requisitos de privacidad o soberania del dato: al ser inferencia local, resulta adecuado para procesar texto sensible que no puede salir de la maquina del usuario.
- Sustitucion de una conversion 4-bit previa del mismo modelo base: el autor documenta una reduccion de memoria de aproximadamente 5,5 GB a 4,7 GB, por lo que sirve para optimizar despliegues existentes que ya usaban LFM2-8B-A1B en MLX.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de 4 bits en un MoE con puertas en 8 bits frente al modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: pico de aproximadamente 4,7 GB en un Apple M4 durante la inferencia; el fichero de pesos ocupa 4,69 GB.
- Plataforma: exclusivamente Apple Silicon, al estar en formato MLX.
- GPU recomendadas: no se especifican modelos de GPU en la informacion proporcionada; el modelo esta orientado a chips de Apple.
- Cabe en GPU de consumo: no aplica en su formato actual, ya que no esta pensado para GPUs NVIDIA o AMD. En Apple Silicon cabe en equipos con memoria unificada suficiente (8 GB como minimo, 16 GB recomendable).
- Opciones de despliegue: mlx-lm 0.32.0 o superior mediante `mlx_lm.generate --model Anotos/LFM2-8B-A1B-MLX-4bit`; en Swift, mlx-swift-lm 3.31.4 o superior. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato es MLX y no GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Anotos/LFM2-8B-A1B-MLX-4bit | 8,34 B | ~1,5 B | no disponible | MLX safetensors, 4,69 GB en disco, ~4,7 GB de pico en M4 | LFM Open License v1.0 | HuggingFace, conversion comunitaria |
| LiquidAI/LFM2-8B-A1B | 8,34 B | ~1,5 B | no disponible | safetensors (precisions disponibles: no disponible) | LFM Open License v1.0 | HuggingFace, modelo oficial de Liquid AI |
| Conversion comunitaria previa de 5,21 GB (mismo modelo base) | 8,34 B | ~1,5 B | no disponible | MLX, 5,21 GB en disco, ~5,5 GB de pico en M4 | LFM Open License v1.0 | Comunitaria; identificador no disponible |

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce una perdida de precision frente al modelo base; el autor no aporta mediciones de calidad posteriores a la conversion.
- El enrutamiento de expertos exige mlx-swift-lm 3.31.4 o superior. Con versiones anteriores el modelo enruta mal los expertos, lo que degrada las respuestas.
- La licencia LFM Open License v1.0 restringe el uso comercial a organizaciones por debajo del umbral de ingresos definido en el propio texto de la licencia; conviene revisar el fichero LICENSE antes de un despliegue productivo.
- La conversion mantiene el identificador de licencia other con license_name lfm1.0, por lo que las condiciones aplicables son las del modelo base de Liquid AI.
- No se documenta el riesgo de sesgos del modelo base ni de la version cuantizada en la informacion disponible.
- Como cualquier modelo de lenguaje, existe riesgo de alucinacion; no se han publicado evaluaciones de fidelidad para esta conversion.
- Los idiomas soportados no estan declarados, por lo que no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluacion previa.
- La longitud de contexto no esta indicada en la informacion disponible, lo que impide planificar tareas que dependan de ventanas largas.
- El repositorio registra 0 descargas y 0 valoraciones, y fue creado y actualizado en octubre de 2026; se trata de una conversion no oficial de un tercero, no publicada por Liquid AI.
- Al estar en formato MLX, no es desplegable directamente en infraestructura con GPUs NVIDIA ni en servidores de inferencia habituales como vLLM o TGI sin una conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anotos/LFM2-8B-A1B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Licencia LFM Open License v1.0: disponible en el fichero LICENSE del repositorio del modelo
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo y no se incluyen como fuentes
