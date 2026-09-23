# junetask/Open-Jev-9B

## Resumen

Open-Jev-9B es un adaptador LoRA acompanado de una cabeza escalar de decision, entrenado sobre el backbone de texto de Qwen/Qwen3.5-9B. No es un modelo generativo: no produce respuestas de forma autorregresiva, sino que puntua directamente un conjunto de candidatos aportados por el llamador y devuelve decisiones tipadas (Choice, Noul y Score). El repositorio publicado bajo el identificador junetask/Open-Jev-9B es un espejo del checkpoint original del proyecto Open-Jev (repositorio Zefan-Cai/Open-Jev y pesos principales en ZefanCai/Open-Jev-9B); no contiene pesos fusionados ni un modelo independiente, sino el adaptador mas su cabeza de decision.

El proyecto Open-Jev, desarrollado en el ecosistema de TypeSafe/System One, resuelve el problema de obtener probabilidades calibradas sobre opciones discretas sin recurrir a la generacion de JSON y su posterior parseo. La interfaz expone un endpoint `/v1/systemone` que recibe un estado y preguntas tipadas, y devuelve claves declaradas con sus probabilidades, sin ejecutar las acciones propuestas.

Su relevancia actual reside en que ofrece una alternativa de "System One" para enrutamiento, clasificacion y puntuacion ordinal con calibracion medida (ECE de 0,0077 en test y 0,0374 en OOD), sobre un backbone de 9B parametros y 4.096 tokens maximos de entrada por candidato puntuado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-9B) + adaptador LoRA + cabeza escalar de decision |
| Parametros totales | 9B en el modelo base; parametros del adaptador LoRA (rango 8, alpha 16) no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens de entrada por candidato puntuado (limite de Open-Jev); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base Qwen/Qwen3.5-9B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) mas cabeza escalar; requiere el loader de Open-Jev |

## Arquitectura y entrenamiento

El checkpoint combina un adaptador LoRA de rango 8 y alpha 16 sobre el backbone de texto de Qwen3.5-9B, junto con una cabeza escalar inicializada a partir del readout preentrenado Yes-minus-No y entrenada de forma conjunta con el adaptador. La inferencia no es autorregresiva: el modelo puntua cada candidato suministrado de forma independiente y devuelve una distribucion de probabilidad sobre el conjunto de opciones (Choice), una probabilidad para preguntas de si/no (Noul) y probabilidades sobre niveles ordinales con su valor esperado (Score). Se guarda una temperatura de calibracion de 1,8969118766347646, ajustada unicamente sobre 512 filas de calibracion.

El entrenamiento consumio 20.204 pasos de optimizador con batch global 4, lo que equivale a 80.816 filas de entrenamiento y una pasada completa sobre el split congelado `release-v2`. El commit de entrenamiento es `99e881108c6cacadafd364088505e84975ca43fc` y el manifiesto de datos congelado tiene SHA-256 `56105dc9fc89ef74919f5beb60bb6ae8c6e17bb95699dab59205f67d8b338d97`. El conjunto de datos redistribuible (`release-v2-redistributable`) contiene 79.116 filas en su split de entrenamiento, excluyendo 1.700 registros originales de `wikispeedia-v1` por falta de permiso de redistribucion confirmado; por tanto, no es byte-identico al conjunto de 80.816 filas realmente usado. No se describe explicitamente el uso de RLHF ni DPO.

## Capacidades

- Toma de decisiones tipadas: devuelve probabilidades sobre un conjunto de candidatos y su candidato mas probable (Choice), probabilidad de si/no (Noul) y probabilidades sobre niveles ordinales con su valor esperado (Score).
- Puntuacion directa de candidatos sin generacion autorregresiva ni parseo de JSON generado.
- Manejo de multiples preguntas declaradas por peticion, cada una con su tipo e instrucciones.
- Procesamiento de hasta 4.096 tokens por candidato puntuado de forma independiente; la entrada se rechaza en lugar de truncarse silenciosamente.
- Soporte de preguntas con criterios etiquetados y valores de retorno declarados por el llamador.
- Calibracion explicita mediante temperatura guardada, con metricas de ECE, Brier y NLL publicadas.
- No dispone de generacion de texto, tool calling ni ejecucion de acciones: el servidor devuelve claves y probabilidades, no realiza las acciones propuestas.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).

## Casos de uso

- Enrutamiento de intencion en atencion al cliente: el modelo puede clasificar el tipo de solicitud (facturacion, tecnico, otro) a partir del texto del cliente, como muestra el ejemplo del endpoint `/v1/systemone`, devolviendo probabilidades directamente utilizables para dirigir el caso al flujo adecuado.
- Clasificacion de tickets de soporte: con la interfaz Choice, se pueden declarar categorias fijas y obtener la distribucion de probabilidad sobre ellas para priorizar y asignar colas de trabajo.
- Puntuacion ordinal de satisfaccion o riesgo: la interfaz Score devuelve probabilidades sobre niveles ordinales y su valor esperado, util para encuestas, NPS o escalas de severidad sin necesidad de parsear texto generado.
- Moderacion y filtrado de contenido: mediante preguntas Noul (si/no) se puede obtener una probabilidad calibrada de que un contenido cumpla o incumpla una politica concreta antes de decidir una accion automatizada.
- Seleccion de herramienta o siguiente paso en agentes: la interfaz Choice permite elegir entre acciones candidatas declaradas por el orquestador, aportando un paso de decision probabilistica sin generacion libre de texto.
- Deteccion de intencion de reembolso o disputa: con el contexto de conversacion y preguntas tipadas se puede estimar la probabilidad de que un cliente solicite reembolso, como en el ejemplo de cargo duplicado.
- Investigacion en calibracion y evaluacion de decisiones: el checkpoint publica hashes de ficheros de inferencia, manifiestos de procedencia y metricas completas, lo que permite reproducir evaluaciones sobre los splits de test y OOD.
- Puntuacion de candidatos en pipelines de ranking: al puntuar cada candidato de forma independiente, se puede integrar en sistemas de recuperacion o recomendacion donde las opciones se generan externamente.

## Benchmarks y rendimiento

La evaluacion completa de datos cubre 10.532 registros de test mas 15.920 registros OOD, con cero registros ausentes, duplicados o fallidos. Esta evaluacion utilizo la mezcla congelada original, incluidos sus registros Wiki, y no la proyeccion redistribuible.

| Split | Filas totales | Correctas duras / filas duras | Precision dura | Precision esperada | NLL | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|---:|
| Test | 10.532 | 9.799 / 10.046 | 97,54% | 94,72% | 0,130947 | 0,039113 | 0,007707 |
| OOD | 15.920 | 14.205 / 15.446 | 91,97% | 90,40% | 0,299441 | 0,126647 | 0,037398 |

La precision dura excluye las filas con objetivos suaves. La precision esperada es la masa objetivo de referencia en el candidato elegido sobre todas las filas; no es una tasa de victoria en juegos ni de finalizacion de flujos. NLL, Brier y ECE usan todas las filas y la calibracion guardada. No se evaluo ninguna linea base sobre el conjunto completo, por lo que esta tabla no establece la ganancia del entrenamiento. El paquete original conserva ademas metricas muestreadas separadas de 512 test y 512 OOD en `package/metrics.json`.

## Requisitos de hardware

- Inferencia con GPU: el ejemplo de despliegue usa explicitamente `--device cuda:0`, con `--batch-size 1`, `--max-length 4096` y `--no-prefix-cache`.
- VRAM estimada: los pesos del modelo base de 9B en bf16/fp16 ocupan aproximadamente 18 GB; sumando el adaptador, la cabeza escalar, el tokenizador y las activaciones con batch 1, se puede estimar un minimo en torno a 20-24 GB, aunque no hay cifras oficiales publicadas (no disponible).
- GPU recomendadas: A100 (40/80 GB) y H100 para despliegue comodo; RTX 4090 (24 GB) podria ajustar con batch 1 segun el tamano real de activaciones, pero no esta confirmado en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada. El modelo base de 9B en bf16 probablemente no cabe en GPUs de 16 GB o menos sin cuantizacion, y no se documentan opciones de cuantizacion.
- Opciones de despliegue: servidor propio de Open-Jev mediante `python -m jev.server`, que requiere el paquete instalado con el extra `train` (incluye Transformers 5.10.2 y PEFT 0.19.1). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Requisito de revision: es necesario disponer del modelo base Qwen/Qwen3.5-9B en la revision exacta `c202236235762e1c871ad0ccb60c8ee5ba337b9a`.
- Latencia y throughput: no disponibles. La configuracion de referencia usa batch 1 y el prefix caching esta desactivado por defecto.
- Almacenamiento: el repositorio ocupa 0,0 GB segun la ficha de HuggingFace; los pesos del modelo base se descargan aparte.

## Comparativa con modelos similares

| Modelo | Parametros / tipo | Contexto de entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| junetask/Open-Jev-9B (este) | Adaptador LoRA sobre Qwen3.5-9B, no generativo | 4.096 tokens por candidato | Test: 97,54% precision dura, ECE 0,0077; OOD: 91,97%, ECE 0,0374 | apache-2.0 | Espejo en HuggingFace, 0 descargas |
| ZefanCai/Open-Jev-9B | Adaptador LoRA sobre Qwen3.5-9B, no generativo | 4.096 tokens por candidato | Los mismos pesos de referencia del proyecto | apache-2.0 | Repositorio principal en HuggingFace |
| Open-Jev-2B (Qwen3.5-2B) | Adaptador LoRA sobre Qwen3.5-2B, no generativo | No disponible | No disponible en la informacion proporcionada | No disponible | Mencionado en el repositorio Open-Jev |
| Open-Jev-27B (Qwen3.8-27B) | Adaptador LoRA sobre Qwen3.8-27B, no generativo | No disponible | No disponible en la informacion proporcionada | No disponible | Mencionado en el repositorio Open-Jev |
| Qwen/Qwen3.5-9B (base) | Transformer generativo de 9B | No disponible | No disponible | No disponible | Modelo base upstream |

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, generacion de texto, resumen ni codigo. Una llamada generica con `AutoPeftModel` de generacion de texto no implementa esta interfaz ni aplica la cabeza de decision ni la temperatura guardada.
- Requiere el loader especifico de Open-Jev y la revision exacta del modelo base `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; otras revisiones pueden no ser compatibles.
- El servidor devuelve claves y probabilidades, pero no ejecuta las acciones propuestas: cualquier accion derivada debe implementarse y validarse externamente.
- Limite estricto de 4.096 tokens por candidato; las entradas que lo exceden se rechazan en lugar de truncarse, lo que puede provocar fallos si no se controla la longitud en el cliente.
- El prefix caching esta desactivado por defecto en el ejemplo de despliegue; activarlo es opcional y la validacion A/B en GPU con el checkpoint real queda pendiente segun la propia model card.
- El conjunto de datos redistribuible no es byte-identico al usado en el entrenamiento: faltan 1.700 filas de `wikispeedia-v1` por permisos de redistribucion no confirmados, lo que limita la reproducibilidad exacta.
- No se evaluo ninguna linea base sobre el conjunto completo, por lo que no se puede atribuir la mejora al entrenamiento a partir de la tabla publicada.
- Las metricas muestreadas de 512 test y 512 OOD del paquete original no deben confundirse con la evaluacion completa.
- La mezcla de entrenamiento no incluye la expansion posterior de navegador/dron ni los cinco corpus posteriores de control de extraccion; los videos publicos de partidas pueden usar checkpoints piloto antiguos y no son evidencia de estos pesos.
- Este repositorio concreto (junetask/Open-Jev-9B) no tiene descargas ni likes y actua como espejo; conviene verificar la procedencia frente al repositorio principal ZefanCai/Open-Jev-9B.
- La model card no documenta sesgos especificos, comportamiento multilingue, ni una evaluacion de riesgos de alucinacion (al no generar texto, el riesgo principal es de calibracion y decision erronea, no de invencion de contenido).
- Licencia apache-2.0 en el repositorio del adaptador, pero el uso comercial esta sujeto tambien a la licencia del modelo base Qwen/Qwen3.5-9B, no especificada en la informacion proporcionada.

## Enlaces

- Repositorio del modelo en HuggingFace (este): https://huggingface.co/junetask/Open-Jev-9B
- Repositorio principal del modelo: https://huggingface.co/ZefanCai/Open-Jev-9B
- Repositorio del cargador en GitHub: https://github.com/Zefan-Cai/Open-Jev
- Repositorio de datos: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Web del proyecto: https://zefan-cai.github.io/open-jev
- Servicio OpenJEV: https://openjev.sh/
- Experimento Semantic If on-device: https://openjev.com/
- Espejo alternativo en HuggingFace: https://huggingface.co/AlexWortega/openjev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
