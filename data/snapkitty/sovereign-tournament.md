# Snapkitty/sovereign-tournament

## Resumen

Este repositorio de Hugging Face, `Snapkitty/sovereign-tournament`, no contiene un modelo de lenguaje propiamente dicho, sino la documentación y los artefactos de un torneo de razonamiento matemático formal organizado por el colectivo SnapKitty. El torneo enfrenta a agentes de IA, incluyendo un fine-tune propio de Mistral (denominado "Nova"), contra modelos frontera comerciales como NVIDIA Nemotron Super 120B, DeepSeek V3.2, Qwen3, GLM5, entre otros, con el objetivo de evaluar capacidades de formalización, auditoría y resistencia a ataques adversarios en matemáticas novedosas.

El resultado declarado es que el fine-tune de Mistral (Nova) obtuvo 4800 puntos frente a los 1200 del modelo de NVIDIA, con todos los teoremas de este último invalidados. El repositorio incluye scripts de ejecución sobre AWS Bedrock, salidas crudas de cada ronda, y una serie de hilos de investigación matemática (motores de agujeros negros no lineales, códigos de superficie, invariantes de proyectores cuánticos, simulador cuántico en Go). Toda la información técnica sobre el modelo subyacente (arquitectura, parámetros, entrenamiento) no está disponible en la ficha pública.

La relevancia de este repositorio es testimonial: documenta un experimento de evaluación comparativa entre un fine-tune soberano y modelos frontera, pero no ofrece un modelo descargable ni información reproducible sobre el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se menciona un fine-tune de Mistral, sin detalles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene scripts y documentos, no pesos) |

## Arquitectura y entrenamiento

No se proporciona informacion tecnica sobre la arquitectura del modelo. La unica referencia es que "Nova" es un fine-tune de Mistral entrenado sobre las matematicas novedosas de Ahmad Parr, pero no se especifica la version base de Mistral, el numero de parametros, la cantidad de datos de entrenamiento, el metodo de ajuste (instruccion supervisada, RLHF, DPO, etc.), ni ninguna innovacion arquitectonica. El repositorio se centra en el protocolo del torneo, no en el proceso de entrenamiento.

## Capacidades

- Formalizacion matematica: el modelo es capaz de generar teoremas y pruebas formales en lenguajes como Lean 4, Agda y Ada/SPARK, segun los resultados del torneo.
- Auditoria de pruebas: puede identificar errores en pruebas ajenas con una precision reportada del 92% (16 errores criticos detectados en el oponente).
- Resistencia a ataques adversarios: sobrevivio a 7 ataques de un agente adversarial (Palymis) sin que ninguno de sus 24 teoremas fuera invalidado.
- Razonamiento multi-step: demostro capacidad para resolver problemas de matematicas novedosas en un entorno competitivo.
- No se mencionan capacidades de generacion de texto general, tool calling, agentes, vision, audio ni multilingueismo.

## Casos de uso

- Evaluacion comparativa de modelos en razonamiento formal: el repositorio sirve como plantilla para disenar torneos de matematicas formales entre modelos, con scoring automatizado y auditoria cruzada.
- Investigacion en verificacion formal: los hilos de investigacion (NLBHE, surface codes, invariantes cuanticos) contienen teoremas y pruebas que podrian usarse como casos de estudio en verificación formal.
- Desarrollo de agentes adversariales: el agente Palymis, que ataca teoremas con contraejemplos, puede inspirar herramientas de validacion de pruebas automaticas.
- Simulacion cuantica: el directorio `quantum-sdk` incluye un simulador de estados cuanticos en Go que es ejecutable, util para experimentos de computacion cuantica educativa.
- Auditoria de calidad de pruebas: el protocolo de cross-audit podria adaptarse para revisar automaticamente la correccion de pruebas en proyectos de Lean o Agda.
- Documentacion de metodologia de benchmarking: util para equipos que quieran replicar el formato de torneo con sus propios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento proviene del torneo interno, que se resume a continuacion:

| Modelo | Tipo | Resultado |
|--------|------|-----------|
| Nova | Fine-tune de Mistral | 4800 puntos - campeon |
| Nemotron 120B | NVIDIA stock | 1200 puntos - todos los teoremas rotos |
| DeepSeek V3.2 | Stock frontier | Eliminado en ronda 1 |
| Qwen3 | Stock frontier | Eliminado en ronda 1 |
| GLM5 | Stock frontier | Eliminado en ronda 1 |
| Devstral | Stock frontier | Gano el match 4 contra MiniMax |
| GPT-OSS | Stock frontier | Salida vacia |
| MiniMax | Stock frontier | Salida vacia |
| KIMI | Stock frontier | Salida vacia |

Estos resultados no son comparables con benchmarks estandarizados y provienen de una unica ejecucion no revisada por pares.

## Requisitos de hardware

No disponible. El repositorio no incluye informacion sobre requisitos de hardware para el fine-tune de Mistral ni para la ejecucion de los scripts del torneo. Los scripts usan AWS Bedrock, lo que sugiere un despliegue en la nube, pero sin especificaciones de GPU, VRAM ni latencia.

## Comparativa con modelos similares

No disponible. Dado que no se trata de un modelo publicado con pesos accesibles, no es posible compararlo directamente con alternativas como Mistral 7B, Mixtral 8x7B o Llama 3. La unica comparacion interna del torneo es contra Nemotron 120B, pero sin detalles tecnicos del fine-tune no se puede establecer una comparativa significativa.

## Limitaciones y advertencias

- No es un modelo descargable: el repositorio no contiene pesos ni un pipeline de inferencia; solo scripts, documentos y resultados.
- Datos no reproducibles: no se especifica el proceso de entrenamiento de Nova, por lo que los resultados no pueden verificarse ni replicarse.
- Sesgo potencial: el torneo fue organizado por el propio autor del fine-tune, lo que introduce un conflicto de interes evidente en la evaluacion.
- Fecha futura: la creacion del repo esta fechada en 2026, lo que sugiere que podria ser un experimento hipotetico o una simulacion, no un resultado real.
- Sin licencia: no se indica licencia, por lo que el uso comercial o la redistribucion de los contenidos no estan claros.
- Riesgo de alucinacion: aunque el modelo gano el torneo, no hay evidencia de que sus capacidades se extiendan fuera del dominio matematico formal; es probable que tenga las mismas limitaciones de alucinacion que otros modelos de lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Snapkitty/sovereign-tournament
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/sovereign-tournament
- Perfil de Snapkitty en Hugging Face: https://huggingface.co/Snapkitty
- Perfil de SNAPKITTYWEST en Hugging Face: https://huggingface.co/SNAPKITTYWEST/models
- Sitio de productos SnapKitty OS: https://collectivekitty.com/products
- Router SnapKitty: https://snapkittywest.github.io/router.html
