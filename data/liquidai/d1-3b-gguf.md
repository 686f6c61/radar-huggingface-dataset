# LiquidAI/d1-3B-GGUF

## Resumen

d1-3B es un modelo de decisión desarrollado por Liquid AI. A diferencia de un modelo generativo convencional, no produce tokens de texto: recibe un estado (texto, JSON o imágenes) junto con un conjunto de preguntas nombradas y tipadas, y devuelve las respuestas en un único forward pass. Cada pregunta se formula con un tipo (`noul` para booleanos, `choice` para categorías cerradas, `score` para escalas ordinales) y unas instrucciones en lenguaje natural.

El modelo pertenece a la familia LFM (Liquid Foundation Models), está etiquetado como `lfm2.5` y cuenta con 2.697.198.592 parámetros totales (~2,7 B), lo que lo sitúa en el segmento edge. Es multimodal (`image-text-to-text`): el estado puede incluir imágenes, y admite 16 idiomas entre los que se incluye el español. La versión publicada aquí es la cuantización GGUF para llama.cpp, derivada de `LiquidAI/d1-3B`.

Su relevancia actual radica en el paradigma "System One": en lugar de generar texto libre y parsearlo después, el modelo emite directamente decisiones tipadas y calibradas. Según el blog de Liquid AI, d1 iguala o supera a GPT-6.1 Sol en 4 de 6 tareas reales, aunque no se han publicado tablas numéricas de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; pertenece a la familia LFM (tags `liquid`, `lfm2.5`), con vision encoder y cabecera de decision en un solo forward pass |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Formato GGUF; el ejemplo oficial usa `Q8_0`. Lista completa de cuantizaciones del repo: no disponible |
| Idiomas soportados | 16: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita |
| Licencia | `lfm1.0` (licencia personalizada, `license: other`) |
| Formato de pesos | GGUF (repo de 17,6 GB); el modelo base se distribuye en safetensors |
| Pipeline | `image-text-to-text` |
| Endpoint de inferencia | `/v1/systemone` en `llama-server` |
| Tipos de pregunta | `noul` (booleano), `choice` (categorias con criterios), `score` (escala ordinal con criterios) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que la adscriben a la familia LFM/LFM2.5 de Liquid AI y a un diseno "system-one". La caracteristica diferencial documentada es el mecanismo de decision: el modelo no decodifica tokens de forma autorregresiva, sino que resuelve las preguntas planteadas en una sola pasada hacia delante sobre el estado de entrada. Esto implica una cabeza de salida orientada a clasificacion y calibracion (etiquetas `classification` y `calibration`) en lugar de un `lm_head` generativo.

El formato de interaccion es explicito y estructurado: se envian un campo `state` (texto libre, JSON o `null` si solo hay imagenes), un campo opcional `images` con imagenes en base64, y un objeto `questions` donde cada clave es un nombre de decision con su `type`, sus `instructions` y, en su caso, un mapa `criteria` que define las clases o los niveles de la escala. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Decision tipada en un solo forward pass: respuestas booleanas (`noul`), categoricas (`choice`) y ordinales (`score`), sin generacion de texto intermedio que haya que parsear.
- Entrada multimodal: el estado puede combinar texto e imagenes. El modelo puede responder sobre el contenido visual (por ejemplo, identificar animales en una foto o si estan sobre un sofa).
- Entrada estructurada: acepta JSON como estado, ademas de texto libre.
- Clasificacion con criterios definidos en el prompt: las clases y los niveles de la escala se declaran en la propia peticion, lo que permite reutilizar el mismo modelo para taxonomias distintas sin reentrenar.
- Calibracion: la etiqueta `calibration` sugiere que las salidas estan pensadas para ser interpretables como decisiones calibradas, no como texto libre.
- Multilingue: 16 idiomas, con espanol incluido.
- Multiples preguntas por pasada: se pueden formular varias decisiones independientes sobre el mismo estado en una unica llamada.
- Despliegue local via llama.cpp con endpoint compatible con la API de OpenAI (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Triaje de tickets de soporte: con el ejemplo oficial, un texto como "me han cobrado dos veces este mes" se convierte en decisiones simultaneas sobre si el cliente pide un reembolso (`noul`), a que equipo corresponde (`choice`: facturacion, tecnico o fraude) y con que urgencia (`score`). El modelo devuelve las tres etiquetas en una sola pasada, sin post-procesado de texto.
- Enrutado de peticiones en produccion: al declarar las clases en el campo `criteria`, se puede usar como clasificador de intencion o de cola de trabajo dentro de un pipeline de atencion al cliente, reutilizando el mismo modelo para distintas taxonomias.
- Moderacion de contenido con criterios configurables: cada politica se expresa como una pregunta `noul` o `choice`, lo que permite auditar la decision y ajustar los criterios sin reentrenar el modelo.
- Verificacion de datos visuales: el ejemplo de la model card usa una foto de dos gatos en un sofa para responder si hay animales y de que especie se trata, aplicable a validacion de imagenes en formularios, seguros o catalogos.
- Extraccion de atributos estructurados: dado un JSON como estado, el modelo puede responder preguntas concretas sobre sus campos, util para enriquecer registros o validar consistencia.
- Prefiltrado en pipelines de agentes: al ser un modelo de ~2,7 B ejecutable en local, puede colocarse delante de un LLM mayor para decidir si una peticion requiere escalado, reduciendo coste y latencia.
- Clasificacion de documentos multilingues: con 16 idiomas soportados, cubre catalogacion y enrutado de documentacion en entornos internacionales sin modelos separados por idioma.
- Etiquetado asistido para anotacion: generar decisiones tipadas y calibradas sobre corpus de texto o imagen para acelerar la creacion de datasets supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La unica referencia cuantitativa es cualitativa y proviene del blog oficial de Liquid AI: d1 "iguala o supera a GPT-6.1 Sol en 4 de 6 tareas reales". No se detallan las tareas, las metricas ni los valores obtenidos, por lo que no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parametros publicado (2.697.198.592) y no mediciones oficiales.

- VRAM estimada para los pesos, en funcion de la cuantizacion:
  - F16: ~5,4 GB.
  - Q8_0: ~2,9 GB.
  - Q5_K_M: ~1,9 GB.
  - Q4_K_M: ~1,7 GB.
- Hay que sumar el coste del codificador de vision cuando se envian imagenes y el overhead del runtime; el repo completo ocupa 17,6 GB, aunque solo se descarga la cuantizacion elegida.
- Cabe en GPU de consumo: cualquier tarjeta con 6-8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar las cuantizaciones Q4/Q5/Q8 sin problemas.
- Para F16 conviene disponer de al menos 8 GB de VRAM, o de una GPU de datacenter (A100, H100) si se sirven muchas peticiones concurrentes.
- Al no generar tokens de forma autorregeresiva, el coste de decodificacion por paso es bajo y la latencia es esencialmente la de un unico forward pass; no hay penalizacion por longitud de salida. No se dispone de cifras publicadas de latencia ni de throughput.
- Opciones de despliegue: `llama.cpp` / `llama-server` (soporte oficial, con el endpoint `/v1/systemone`), y por tanto integrable en herramientas basadas en GGUF. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Ejemplo de arranque oficial: `llama-server -hf LiquidAI/d1-3B-GGUF:Q8_0`.

## Comparativa con modelos similares

d1-3B no compite directamente con modelos generativos multimodales pequenos, porque su paradigma de salida es distinto: devuelve decisiones tipadas en una sola pasada en lugar de texto. En la informacion consultada no se han encontrado modelos de decision comparables con datos publicados, por lo que la comparacion se limita a la categoria general de modelos pequenos multimodales.

| Modelo | Parametros | Contexto | Paradigma de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiquidAI/d1-3B | ~2,7 B | No disponible | Decision tipada, sin generacion de tokens | `lfm1.0` | HuggingFace (safetensors y GGUF) |
| Modelos generativos multimodales de ~3 B | ~2-4 B (rango tipico de la categoria) | No disponible | Generacion autorregresiva de texto | Variable | HuggingFace |
| Alternativas de decision comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre d1-3B y otras alternativas, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo para este modelo; al ser un clasificador sobre criterios definidos por el usuario, puede heredar y amplificar los sesgos presentes en esos criterios.
- El modelo no genera texto, de modo que no puede justificar ni explicar sus decisiones. Cualquier explicabilidad debe construirse por fuera, a partir de las preguntas y criterios declarados.
- Riesgo de alucinacion en el sentido de asignar una clase o un nivel de la escala aunque el estado no contenga informacion suficiente. No se documenta ningun mecanismo nativo de abstención o umbral de confianza.
- La etiqueta `calibration` no viene acompanada de curvas ni metricas de calibracion publicadas; conviene validar en el dominio propio antes de usar las salidas como probabilidades.
- Longitud de contexto maxima: no disponible. Esto es critico para planificar entradas largas o documentos extensos.
- Los tipos de pregunta documentados son `noul`, `choice` y `score`. Cualquier otra estructura de decision no esta soportada en los ejemplos.
- El soporte de imagenes se documenta para entrada en base64 mediante el endpoint `/v1/systemone`; no se detallan resoluciones, numero maximo de imagenes ni limites de tokens visuales.
- Licencia `lfm1.0` (identificada como `other`): es una licencia personalizada, no una licencia open source estandar. Hay que revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que puede incluir restricciones especificas.
- El modelo es una cuantizacion GGUF del modelo base; es esperable una degradacion leve frente a los pesos originales en safetensors, que no se cuantifica en la informacion disponible.
- Cifras de adopcion muy bajas en el momento de la consulta (22 descargas, 14 likes), lo que limita la evidencia empirica de terceros en produccion.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/LiquidAI/d1-3B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Web de Liquid AI: https://www.liquid.ai/
- Blog de presentacion de d1: https://www.liquid.ai/blog/d1-decision-model
- Playground de d1: https://d1.liquid.ai/
- Playground de LFM: https://playground.liquid.ai/
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil de LiquidAI en HuggingFace: https://huggingface.co/LiquidAI
- Ficha de referencia de d1 (LLMReference): https://www.llmreference.com/model/d1/liquid
