# sappho192/ironworks-translator-1b-v0.2

## Resumen

Ironworks Translator 1B v0.2 es un modelo de traduccion especializado, desarrollado por sappho192, obtenido mediante un fine-tune LoRA con SFT sobre `xiaomi-research/MiLMMT-46-1B-v1.0`, un modelo multilingue de traduccion de 1B parametros construido sobre la arquitectura Gemma 3. Su proposito concreto es alimentar IronworksTranslator, una herramienta de traduccion en tiempo real del chat y los dialogos de NPC de Final Fantasy XIV, con un enfoque muy especifico en la localizacion al coreano desde ingles, japones, aleman y frances.

La innovacion principal de esta version v0.2 es la condicionalidad por estilo de habla de NPC (`Style:`) y por glosario (`Glossary:`). El modelo acepta cabeceras opcionales que le indican que registro coreano debe emplear (hasta ocho variantes: `하십시오체`, `해요체`, `애교 존댓말`, `반말`, `해라체`, `하게체`, `하오체`, `고어체`) y que terminos del universo del juego deben mapearse a traducciones fijas, lo que permite mantener consistencia terminologica y de tono en un dominio tan cerrado como un MMORPG.

El modelo tiene 999.885.952 parametros (aproximadamente 1B) y se distribuye unicamente en formato GGUF para llama.cpp, en cuantizaciones Q8_0 y Q4_K_M. Su relevancia radica en que demuestra como un modelo pequeno, altamente especializado y con un contrato de prompt rigido puede superar en fiabilidad de dominio a modelos generalistas mucho mayores, a un coste de despliegue de entre 1,2 y 1,5 GB de RAM o VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, segun la model card del modelo base) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (unicos ficheros publicados) |
| Idiomas soportados | coreano (ko), japones (ja), ingles (en), aleman (de), frances (fr) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del fine-tune |
| Modelo base | xiaomi-research/MiLMMT-46-1B-v1.0 |
| Tamano del repositorio | 1,9 GB |
| Metodo de ajuste | LoRA SFT con merge lineal (alpha=0,92) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 a traves de su base MiLMMT-46-1B-v1.0, un modelo de traduccion multilingue de aproximadamente 1B parametros. Sobre esa base se aplico un fine-tune LoRA con SFT y un merge lineal con alpha=0,92, lo que produce un unico conjunto de pesos GGUF sin adaptadores separados.

El entrenamiento se diseno para alinear 1:1 semanticamente los datos multilingues: se emplearon objetivos de localizacion coreana autenticos de Square Enix emparejados con fuentes EN/DE/FR retrotraducidas mediante `MiLMMT-46-12B-v1.0`, ademas de dialogos oficiales JA→KO directos, y 5.000 muestras de replay general en seis direcciones para evitar el olvido catastrofico. La perdida de evaluacion reportada es de 1,419 frente a 1,715 en v0.1. El modelo opera en modo de completado crudo (`template: empty`, `add_special_tokens=false`, sin `<bos>`), con un contrato de prompt estricto que incluye cabeceras opcionales `Style:` y `Glossary:` antes de la instruccion de traduccion.

## Capacidades

- Traduccion multilingue EN/DE/FR/JA → KO en el dominio de chat y dialogos de Final Fantasy XIV.
- Condicionalidad de estilo de habla coreano en ocho registros (`하십시오체`, `해요체`, `애교 존댓말`, `반말`, `해라체`, `하게체`, `하오체`, `고어체`) mediante la cabecera `Style:`.
- Obediencia a glosario: aplicacion de mapeos termino a termino definidos en la cabecera `Glossary:` (por ejemplo, `Waking Sands => 모래의 집`).
- Cumplimiento conjunto de `Style:` y `Glossary:` en la misma peticion.
- Resistencia a distractores: no inserta terminos del glosario que no aparecen en el texto fuente.
- Ausencia de fugas de etiquetas de estilo en la salida y de sangrado de estilo no solicitado.
- Traduccion general multilingue de respaldo (replay de seis direcciones) sin regresiones reportadas.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Traduccion en tiempo real del chat de Final Fantasy XIV: el modelo se integra en IronworksTranslator para traducir mensajes de jugadores entre EN/DE/FR/JA y KO con baja latencia, gracias a su tamano de 1B y a su despliegue en llama.cpp con Q4_K_M.
- Localizacion de dialogos de NPC con registro coherente: usando la cabecera `Style:` y la base de estilos de NPC de IronworksTranslator (7.241 entradas en EN/DE/FR/JA), el modelo adapta el tono al personaje (formal, informal, arcaico) en lugar de producir un coreano neutro.
- Consistencia terminologica en contenidos del juego: la cabecera `Glossary:` permite fijar traducciones oficiales de lugares, objetos y facciones, evitando variaciones entre sesiones o traductores.
- Herramientas de accesibilidad para jugadores: traduccion de texto de interfaz y dialogos para jugadores que no dominan el idioma original del cliente, con un coste de hardware minimo (1,2-1,5 GB).
- Creacion de subtitulos o transcripciones para creadores de contenido: traduccion por lotes de dialogos grabados, con el glosario configurado para mantener la nomenclatura del juego en el material publicado.
- Evaluacion de pipelines de traduccion especializada: el modelo sirve como referencia de como el condicionamiento por estilo y glosario mejora la fidelidad en dominios cerrados, con metricas de cumplimiento publicadas (0/151 fallos de estabilidad, 16/16 swaps contrafactuales de glosario).
- Prototipado de asistentes de traduccion para comunidades de modding o localizacion: el contrato de prompt simple y el formato GGUF facilitan su integracion en scripts y herramientas de escritorio.

## Benchmarks y rendimiento

La model card publica una evaluacion propia con decodificacion greedy (temperatura 0,0) sobre conjuntos internos, no benchmarks academicos estandar:

| Metrica | Q8_0 (alpha=0,92) | Q4_K_M (alpha=0,92) |
|---|---|---|
| Fallos de estabilidad (bucles/deriva/vacio/truncado, 151 casos) | 0 / 151 | 0 / 151 |
| Hold-out `eval.jsonl` con glosario | 9 / 9 | 9 / 9 |
| Hold-out `eval.jsonl` sin glosario | 1 / 9 | no disponible |
| Inserciones falsas de distractores | 0 / 25 | 0 / 25 |
| Swaps contrafactuales de glosario | 16 / 16 (8/8) | 16 / 16 (8/8) |
| Cumplimiento conjunto `Style:` + `Glossary:` | 24 / 24 | 24 / 24 |
| Control contrafactual de estilo en 8 vias | 40 / 80 (50,0%) | 39 / 80 (48,8%) |
| Fugas de etiqueta de estilo / sangrado no solicitado | 0 / 80 · 0 / 24 | 0 / 80 · 0 / 24 |
| Regresiones multilingues generales (24 casos) | 0 / 24 | 0 / 24 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, BLEU, COMET) en la informacion disponible. La model card remite a `sappho192/ironworks-translator-4b-v0.2` para una fidelidad de estilo de NPC superior (hasta 80,0%, 64/80 en Q8_0).

## Requisitos de hardware

- VRAM/RAM estimada: ~1,5 GB para Q8_0 y ~1,2 GB para Q4_K_M, segun la propia model card.
- Cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con 4 GB o menos, o en CPU.
- Despliegue: llama.cpp es el runtime de referencia (formato GGUF); tambien es compatible con Ollama y otros frontends basados en llama.cpp. No se publican pesos safetensors del fine-tune para vLLM o TGI.
- Latencia y throughput: no se publican cifras concretas; el tamano de 1B y las cuantizaciones indicadas sugieren inferencia interactiva en tiempo real en hardware de consumo, que es el caso de uso declarado (traduccion de chat en vivo).
- Decodificacion recomendada: `temperature=0.0`, `top_k=1`, `repeat_penalty=1.0`, `frequency_penalty=0.30`, `repeat_last_n=16`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Ironworks Translator 1B v0.2 | ~1B | no disponible | ko, ja, en, de, fr | Gemma | GGUF | Traduccion FFXIV con estilo y glosario |
| Ironworks Translator 4B v0.2 (sappho192) | no disponible (4B nominal) | no disponible | ko, ja, en, de, fr | Gemma | no disponible | Misma tarea, mayor fidelidad de estilo (hasta 80,0%) |
| xiaomi-research/MiLMMT-46-1B-v1.0 | ~1B | no disponible | multilingue (46 idiomas por nombre) | no disponible | no disponible | Traduccion multilingue general (modelo base) |
| Modelos de traduccion generalistas de ~1B | variable | variable | variable | variable | variable | Traduccion sin condicionamiento de dominio |

La comparacion con modelos generalistas de traduccion de tamano similar no puede cuantificarse porque no hay benchmarks academicos publicados para este modelo; la ventaja documentada es cualitativa y de dominio (cumplimiento de glosario y estilo, estabilidad en 151 casos).

## Limitaciones y advertencias

- El control contrafactual de estilo en ocho vias solo alcanza el 50,0% (40/80) en Q8_0 y el 48,8% (39/80) en Q4_K_M: la fidelidad a registros poco frecuentes es limitada en la variante de 1B.
- Sin glosario, el rendimiento en el hold-out cae a 1/9 en Q8_0; el modelo esta disenado para operar con glosario y estilo configurados, no como traductor general.
- El modelo esta especializado en el dominio de Final Fantasy XIV; su uso fuera de ese dominio no esta evaluado y probablemente degrade la calidad.
- La licencia es Gemma Terms of Use, no una licencia permisiva: el uso comercial esta sujeto a las condiciones de Google para modelos Gemma, incluidos requisitos de atribucion.
- No se publican datos sobre sesgos, riesgo de alucinacion fuera de dominio, ni evaluaciones de seguridad.
- El contrato de prompt es estricto (modo de completado crudo, sin `<bos>`, sin plantilla de chat); un uso incorrecto del formato puede producir salidas degeneradas.
- No se publican pesos safetensors del fine-tune, solo GGUF, lo que limita el despliegue en stacks que requieren transformers o vLLM.
- La longitud de contexto no esta documentada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sappho192/ironworks-translator-1b-v0.2
- Modelo base: https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v1.0
- Variante 4B: https://huggingface.co/sappho192/ironworks-translator-4b-v0.2
- Repositorio de IronworksTranslator: https://github.com/sappho192/IronworksTranslator
