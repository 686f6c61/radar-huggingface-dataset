# LiquidAI/LFM3-VL-2B-MLX-8bit

## Resumen

LFM3-VL-2B-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo multimodal LFM3-VL-2B de Liquid AI, disenada especificamente para inferencia en Apple Silicon. Se trata de un modelo image-text-to-text que acepta imagenes y texto como entrada y genera texto, con un total de 1.918.181.888 parametros y un peso de aproximadamente 2,22 GB tras la cuantizacion afina de 8 bits con grupos de 64.

El modelo pertenece a la familia LFM3 de Liquid AI y se distribuye bajo licencia lfm1.0 (etiquetada como "other" en Hugging Face). Soporta 16 idiomas, entre ellos el castellano, y esta pensado para despliegue local en equipos Mac con chip de la serie M, donde MLX aprovecha la memoria unificada para ejecutar modelos que de otro modo requeririan GPU dedicadas.

Su relevancia actual radica en que permite ejecutar un modelo de vision-lenguaje de casi 2.000 millones de parametros en hardware de consumo Apple sin conexion a la nube, con soporte de modo de razonamiento opcional (thinking) y una huella de memoria moderada. La version requiere MLX-VLM 0.7.11 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles completos en la model card original, no disponibles en esta ficha |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afina (affine) con grupos de 64; existen otras variantes en la familia, pero esta ficha cubre solo la de 8 bits MLX |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | safetensors en formato MLX (libreria mlx, custom_code) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su caracter multimodal image-text-to-text y su pertenencia a la familia LFM3 de Liquid AI. El modelo base es LiquidAI/LFM3-VL-2B, del que esta version es una cuantizacion. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta variante concreta es la cuantizacion afina de 8 bits con grupos de 64 aplicada sobre el modelo original, junto con su empaquetado en formato MLX para aprovechar la memoria unificada de los chips Apple Silicon. El modelo soporta un modo de razonamiento opcional que se activa mediante el flag `--enable-thinking` en MLX-VLM. Los detalles completos de arquitectura y entrenamiento remiten a la model card del modelo base.

## Capacidades

- Generacion de texto e inferencia multimodal image-text-to-text: acepta imagenes junto con prompts de texto.
- Modo de razonamiento (thinking) activable opcionalmente; permanece desactivado por defecto.
- Conversacion multi-turno (tag "conversational").
- Cobertura multilingue en 16 idiomas, incluido el castellano.
- Capacidades de codigo, matematicas y tool calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Descripcion de imagenes en local: el modelo puede generar descripciones textuales de imagenes pasadas como entrada, ejecutandose integramente en un Mac con Apple Silicon gracias al formato MLX y a sus 2,22 GB de pesos.
- Asistentes de accesibilidad en dispositivo: integrado en aplicaciones de macOS o iOS, permite narrar o interpretar el contenido de imagenes sin enviar datos a la nube, lo que resulta adecuado por privacidad y por la huella de memoria reducida.
- Procesamiento por lotes de imagenes en estaciones de trabajo Apple: con MLX-VLM se pueden automatizar tareas de etiquetado o extraccion de informacion de imagenes en pipelines locales.
- Prototipado rapido de aplicaciones de vision-lenguaje: el tamano de casi 2.000 millones de parametros y la cuantizacion de 8 bits facilitan iterar en un portatil Mac antes de escalar a modelos mayores.
- Atencion al cliente multimodal en local: el tag conversacional y el soporte de 16 idiomas permiten construir asistentes que interpretan capturas o imagenes enviadas por el usuario y responden en castellano u otros idiomas.
- Analisis de documentos con imagenes en entornos con requisitos de soberania del dato: al ejecutarse sin conexion, encaja en escenarios donde no se permite enviar contenido a servicios externos.
- Modo de razonamiento para tareas que requieren pasos intermedios: activando `--enable-thinking` se puede emplear en problemas donde conviene que el modelo explicite su razonamiento antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 2,22 GB en cuantizacion de 8 bits; el consumo total de memoria durante la inferencia sera superior por la cache KV y el procesamiento de imagenes, aunque no se dispone de cifras exactas.
- Hardware objetivo: Apple Silicon (chips de la serie M) mediante MLX; no esta pensado para GPU NVIDIA.
- Cabe en hardware de consumo: si, en equipos Mac con memoria unificada suficiente; el tamano del repo es de 2,2 GB.
- Opciones de despliegue: MLX-VLM 0.7.11 o superior (`pip install -U "mlx-vlm>=0.7.11"`), invocable con `python -m mlx_vlm.generate`. Otras herramientas como vLLM, llama.cpp, Ollama o TGI no se mencionan como compatibles con este formato MLX.
- Parametros de generacion sugeridos por el autor: `--temperature 0.1 --top-p 1.0 --top-k 50 --min-p 0.0 --repetition-penalty 1.1 --max-tokens 16384`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-8bit (este) | 1.918.181.888 | no disponible | MLX safetensors 8 bits | lfm1.0 | Optimizado para Apple Silicon |
| LFM3-VL-2B (modelo base) | no disponible en esta ficha | no disponible | safetensors | lfm1.0 | Version sin cuantizar del mismo modelo |
| Otras alternativas de vision-lenguaje de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia lfm1.0 (etiquetada como "other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- Es una cuantizacion de 8 bits: puede presentar una ligera perdida de calidad frente al modelo base LFM3-VL-2B, especialmente en tareas de razonamiento complejo o vision detallada.
- El formato MLX esta atado al ecosistema Apple Silicon; no es portable directamente a GPU NVIDIA ni a servidores x86 convencionales.
- Requiere MLX-VLM 0.7.11 o superior; versiones anteriores no son compatibles.
- El modo de razonamiento esta desactivado por defecto; si se espera que el modelo razone, hay que activarlo explicitamente con `--enable-thinking`.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje; no se han publicado evaluaciones especificas en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Aunque declara 16 idiomas, no se dispone de datos sobre la calidad relativa por idioma; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Longitud de contexto no especificada en esta ficha; hay que consultar la model card del modelo base para planificar conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Licencia (archivo LICENSE en el repo): https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-8bit/blob/main/LICENSE
