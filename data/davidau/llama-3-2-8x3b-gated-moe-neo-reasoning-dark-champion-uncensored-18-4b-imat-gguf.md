# DavidAU/Llama-3.2-8X3B-GATED-MOE-NEO-Reasoning-Dark-Champion-uncensored-18.4B-IMAT-GGUF

## Resumen

Llama-3.2-8X3B-GATED-MOE-NEO-Reasoning-Dark-Champion-uncensored-18.4B-IMAT-GGUF es un modelo de lenguaje de tipo mixture of experts (MoE) construido por el desarrollador independiente DavidAU mediante la tecnica de fusion mergekit. Combina ocho modelos Llama 3.2 de 3B parametros en un unico modelo de 18.404.944.960 parametros totales, con una ventana de contexto maxima de 128k tokens (131.000). Su orientacion principal es la generacion creativa: prosa, ficcion, guiones, continuacion de escenas y roleplay, con un sesgo explicito hacia contenido sin censura y un tono "oscuro" con detalles viscerales y lenguaje soez.

La innovacion central es la estructura "gated": un modelo maestro de razonamiento que puede activarse o desactivarse mediante system prompt, reforzado por los otros siete modelos del MoE durante la fase de razonamiento, mientras que en la fase de generacion no razonada toman el control los modelos no razonadores. Ademas, el autor expone controles para seleccionar y nombrar expertos individuales, lo que permite ajustar el comportamiento del modelo por experto. El modelo parte de una version Instruct uncensored abliterated y se distribuye unicamente en formato GGUF cuantizado con la tecnica NEO Imatrix.

La relevancia actual reside en su perfil de rendimiento por tamano: el autor reporta mas de 50 tokens por segundo con 2 expertos activos en una tarjeta de 16 GB con cuantizacion IQ4XS, y una perplejidad inferior a la de Meta Llama 3 Instruct, segun sus propias mediciones. La licencia Apache 2.0 facilita su uso comercial, aunque el contenido generado puede ser inapropiado para entornos de produccion sin moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con fusion mergekit (8 expertos Llama 3.2 3B), estructura gated con modelo maestro de razonamiento |
| Parametros totales | 18.404.944.960 |
| Parametros activos | no disponible (el autor menciona configuraciones de 2, 4 y 8 expertos, sin reparto de activos documentado) |
| Longitud de contexto | 128k (131.000 tokens) |
| Tipos de cuantizacion | GGUF: IQ4XS, Q8_0, f16, f32 (tensor de salida en Q8_0; algunas variantes en f16 y Q8_0 con f32); pesos base generados en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 179,2 GB); el modelo base en safetensors no se distribuye en este repo |

## Arquitectura y entrenamiento

El modelo es una fusion MoE de ocho modelos Llama 3.2 de 3B parametros, construida con mergekit, que resultan en 18,4B parametros totales (el autor lo equipara a un modelo de 24B por la suma 8 x 3B). La estructura "gated" define un modelo maestro de razonamiento conmutable: cuando el razonamiento esta activo, los siete expertos restantes refuerzan al maestro; cuando se desactiva, los expertos no razonadores asumen la generacion. El autor expone ademas controles de acceso y nombrado de expertos individuales, de modo que el usuario puede dirigir que expertos intervienen en instruccion y generacion. El control de razonamiento on/off/variable proviene de NousResearch y del modelo DeepHermes, y requiere system prompts especificos para invocar el modo thinking.

El modelo se construyo en precision float32 y las cuantizaciones GGUF se masterizaron con el dataset NEO Imatrix, incluyendo metodos nuevos para aplicar imatrix tanto al tensor de salida como a los tokens. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El modelo base es la version Instruct uncensored abliterated de la misma familia, y el autor declara una perplejidad inferior a la de Meta Llama 3 Instruct, sin publicar la cifra concreta.

## Capacidades

- Generacion de texto creativo: prosa vivida, ficcion, cuentos, continuacion de escenas y generacion de tramas y subtramas en todos los generos (ciencia ficcion, romance, terror, etc.).
- Razonamiento conmutable: modo thinking activable y desactivable mediante system prompt, con intensidad variable, basado en el esquema de NousResearch y DeepHermes.
- Roleplay y escritura de personajes, con soporte de lenguaje soez y contenido adulto sin censura.
- Control de expertos: seleccion y nombrado de expertos del MoE para dirigir el estilo y el comportamiento de la generacion.
- Instruccion multi-turno: el autor recomienda ciclos de generacion, evaluacion y reescritura para maximizar la calidad.
- Uso general de generacion de texto, aunque el autor advierte que la salida puede ser sin censura.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Escritura de ficcion por capitulos: el modelo mantiene coherencia en escenas largas gracias a los 128k tokens de contexto y a la mejora iterativa multi-turno que el autor documenta; adecuado para novelas por entregas y relatos largos.
- Roleplay narrativo y juegos de mesa: la estructura de expertos y el modo razonamiento permiten sostener personajes consistentes y reaccionar a eventos de la trama; el autor advierte de que temperaturas muy altas degradan el seguimiento de instrucciones.
- Generacion de tramas y subtramas: util como herramienta de ideacion para guionistas y autores, pidiendo variantes de conflicto, giros y arcos secundarios sobre un material base existente.
- Continuacion de escenas existentes: con 128k de contexto se puede pegar un manuscrito extenso y pedir la continuacion en el mismo registro estilistico, indicando genero y tono entre parentesis.
- Prototipado de contenido para videojuegos narrativos: dialogo de NPC, descripciones de entornos y eventos, con control de expertos para separar el tono de distintos personajes o facciones.
- Experimentacion en investigacion sobre modelos sin censura: analisis de sesgos, robustez ante prompts adversarios y comportamiento de mecanismos de gating y enrutamiento de expertos en entornos controlados.
- Despliegue local en equipos de gama media: con IQ4XS y 2 expertos activos el autor reporta mas de 50 tokens por segundo en una GPU de 16 GB, lo que permite iteracion creativa interactiva sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara que la perplejidad es inferior a la de Meta Llama 3 Instruct y que el rendimiento alcanza mas de 50 tokens por segundo con 2 expertos en IQ4XS sobre una GPU de 16 GB, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el autor cita funcionamiento con 2 expertos activos en IQ4XS sobre una tarjeta de 16 GB, y duplica la velocidad en tarjetas de gama media estandar.
- GPU recomendadas: no se especifican modelos concretos; por el perfil descrito encajan RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, A100 y H100, aunque el autor solo confirma el caso de 16 GB.
- Cabe en GPU de consumo: si, segun el autor, al menos en configuracion IQ4XS con 2 expertos activos.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) al ser formato GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: mas de 50 t/s con 2 expertos e IQ4XS en GPU de 16 GB; el doble en tarjetas de gama media, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (8X3B GATED MOE NEO Reasoning Dark Champion) | 18,4B totales | 128k | GGUF | Apache 2.0 | MoE gated con razonamiento conmutable y control de expertos; orientado a ficcion sin censura |
| DavidAU Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B | 18,4B totales | 128k (segun model card de la familia) | GGUF | Apache 2.0 | Version sin gating ni razonamiento conmutable; 193 likes y mas de 447.000 descargas segun el autor |
| Meta Llama 3.2 3B Instruct | 3B | 128k | safetensors, GGUF | Llama 3.2 Community License | Modelo denso de referencia del que derivan los expertos; menor capacidad creativa segun el autor |
| Modelos densos de 13-24B (genericos) | 13-24B | variable | variable | variable | No disponible comparacion numerica publicada por el autor |

## Limitaciones y advertencias

- Contenido NSFW y sin censura: el autor advierte explicitamente de prosa intensa, horror ligero, lenguaje soez y humor adulto; no es apto para produccion orientada al publico general sin moderacion.
- Solo ingles: la model card declara unicamente el idioma en; no hay soporte multilingue documentado.
- Riesgo de alucinacion: no se publican evaluaciones de factualidad; el sesgo creativo y el modo sin censura aumentan el riesgo de afirmaciones inventadas en usos informativos.
- Sesgo negativo declarado: el autor indica que el modelo tiene un ligero sesgo negativo y no es un modelo de "finales felices".
- Dependencia de system prompt: el modo razonamiento requiere prompts de sistema especificos; sin ellos el comportamiento puede degradarse.
- Inestabilidad con temperatura alta: el autor advierte de que temperaturas elevadas pueden afectar al seguimiento de instrucciones, especialmente en roleplay.
- Variabilidad entre cuantizaciones: el autor senala que distintas cuantizaciones producen salidas ligeramente distintas, lo que complica la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas de moderacion o derechos de terceros; la responsabilidad recae en el desplegador.
- Modelo de autor individual sin evaluacion independiente: no hay benchmarks publicados ni auditoria externa de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.2-8X3B-GATED-MOE-NEO-Reasoning-Dark-Champion-uncensored-18.4B-IMAT-GGUF
- Modelo base: https://huggingface.co/DavidAU/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- Version sin gating de la familia: https://huggingface.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs del autor: https://huggingface.co/DavidAU/support
