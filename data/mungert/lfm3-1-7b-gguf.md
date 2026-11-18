# Mungert/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la cuantizacion en formato GGUF del modelo LFM3-1.7B de Liquid AI, un modelo de lenguaje de texto disenado especificamente para agentes locales y aplicaciones especializadas. Este repositorio, publicado por el usuario Mungert, ofrece los pesos convertidos a GGUF mediante llama.cpp, lo que permite ejecutar el modelo en hardware de consumo mediante herramientas como llama.cpp u Ollama. El modelo original emplea la nueva arquitectura tri-hibrida de Liquid AI y cuenta con 1.730 millones de parametros, con un contexto declarado de 256K tokens.

El modelo destaca por su enfoque en eficiencia para el borde: a 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace viable en telefonos moviles y portatiles. Ha sido post-entrenado para arneses de agentes como Hermes Agent, Pi y OpenClaw, y esta disenado para ser especializado mediante fine-tuning rapido en una sola GPU. Soporta 16 idiomas, incluido el castellano.

La relevancia de esta ficha radica en que combina un modelo compacto con capacidades agenticas y un contexto muy amplio, algo poco habitual en la categoria de menos de 2.000 millones de parametros. La version GGUF facilita su despliegue local sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hibrida: 24 capas (13 convoluciones cortas con compuerta, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF (multiples variantes generadas con llama.cpp; la model card menciona 4 bits como referencia de ~1 GB) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | GGUF (repo de 48,0 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura tri-hibrida que combina tres tipos de capas en sus 24 niveles: 13 capas de convolucion corta con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante (sliding-window attention) y 6 capas de atencion global. Esta mezcla busca reducir el coste computacional y de memoria frente a un transformer clasico con atencion completa en todas las capas, manteniendo la capacidad de modelar dependencias de largo alcance gracias a las capas de atencion global. El checkpoint publicado es un modelo de texto post-entrenado, no la version base.

El post-entrenamiento esta orientado a arneses agenticos (Hermes Agent, Pi y OpenClaw), lo que sugiere un ajuste especifico para tareas de uso de herramientas y razonamiento multi-paso. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica que el modelo esta pensado para ser especializado mediante fine-tuning rapido en una sola GPU.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Entrenamiento agentico orientado a arneses como Hermes Agent, Pi y OpenClaw.
- Razonamiento multi-paso y ejecucion de tareas en entornos de agente (segun el diseno declarado en la model card).
- Capacidades multilingues en 16 idiomas, incluidos castellano, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Ventana de contexto de 256K tokens, adecuada para conversaciones largas y documentos extensos.
- No se especifica en la informacion disponible soporte explicito de tool calling, vision, audio ni modo de pensamiento (thinking mode); la model card solo menciona el enfoque agentico.

## Casos de uso

- Agentes locales en dispositivos de borde: el modelo puede ejecutarse en un telefono o portatil (aproximadamente 1 GB a 4 bits) y actuar como nucleo de un agente personal que gestione tareas, recordatorios y consultas sin conexion a la nube.
- Asistente conversacional multilingue: con soporte para 16 idiomas y contexto de 256K tokens, puede mantener conversaciones largas y cambiar de idioma segun el usuario, adecuado para atencion al cliente en mercados internacionales.
- Procesamiento de documentos extensos en local: la ventana de 256K tokens permite resumir, extraer informacion o responder preguntas sobre contratos, informes o manuales sin fragmentar el texto en trozos pequenos.
- Fine-tuning especializado en una sola GPU: la model card indica que el modelo esta disenado para adaptarse a dominios, formatos y herramientas concretos mediante ajuste rapido, por ejemplo para un asistente interno de una empresa con vocabulario propio.
- Automatizacion de flujos agenticos con herramientas: su post-entrenamiento para arneses como Hermes Agent o OpenClaw lo hace candidato para pipelines que encadenan llamadas a APIs y acciones multi-paso.
- Prototipado y experimentacion en investigacion: al ser un GGUF ligero, permite iterar rapidamente en entornos con recursos limitados y comparar variantes de cuantizacion sin infraestructura dedicada.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que resulta util en sectores regulados como sanidad o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits segun la model card; las cuantizaciones de mayor precision (8 bits, 16 bits) requeriran mas memoria, aunque no se detallan cifras exactas en la informacion proporcionada.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por el tamano del modelo, es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores, asi como en Apple Silicon.
- Cabe en GPU de consumo: si, dado el reducido tamano (1,73B parametros) y la disponibilidad de cuantizaciones GGUF.
- Opciones de despliegue: llama.cpp (herramienta usada para generar los GGUF), Ollama y otros runners compatibles con GGUF; la model card original menciona transformers como libreria, pero esta version esta orientada a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF (este) | 1,73B | 256K | lfm1.0 | GGUF | Arquitectura tri-hibrida, orientado a agentes |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos suficientes sobre modelos comparables de la misma categoria para establecer una comparativa rigurosa con parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; como todo modelo entrenado con datos web, es probable que herede sesgos, pero no hay datos concretos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; conviene validar las salidas en aplicaciones criticas.
- Limitaciones de contexto o idioma: aunque declara 256K tokens y 16 idiomas, no se especifica la calidad por idioma ni el comportamiento en contextos muy largos.
- Restricciones de licencia: la licencia es "lfm1.0" (categoria "other"), por lo que es imprescindible revisar el archivo LICENSE antes de un uso comercial; no se detallan las condiciones en la informacion proporcionada.
- Caveats para produccion: esta es una cuantizacion de terceros (Mungert) del modelo original de Liquid AI; la calidad puede variar segun la variante GGUF elegida. La fecha de creacion indicada (2026) resulta anomala y conviene verificarla en el repositorio.
- El modelo es solo de texto; no se declaran capacidades de vision, audio ni tool calling explicito en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mungert/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- llama.cpp (commit usado): https://github.com/ggerganov/llama.cpp/commit/ca89968a23a13e571a6b802a9891d22763153b61
- Guia de seleccion de GGUF: https://readyforquantum.com/huggingface_gguf_selection_guide.html
