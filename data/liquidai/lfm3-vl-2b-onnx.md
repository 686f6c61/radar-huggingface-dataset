# LiquidAI/LFM3-VL-2B-ONNX

## Resumen

LFM3-VL-2B-ONNX es la version exportada a ONNX Runtime del modelo multimodal LFM3-VL-2B de Liquid AI, disenada para inferencia multiplataforma (CPU, GPU, dispositivos edge) sin depender de frameworks de deep learning pesados. El modelo original es un image-text-to-text de 2 mil millones de parametros que combina un decoder de lenguaje con un encoder visual, y esta version ONNX empaqueta ambos componentes en precisiones cuantizadas para reducir el peso y facilitar el despliegue.

Liquid AI es una compania conocida por sus modelos basados en arquitecturas de espacio de estados (LFM, Liquid Foundation Models) y por optimizar modelos compactos para ejecucion local. Este lanzamiento es relevante porque acerca la capacidad multimodal (vision + lenguaje) a entornos donde no hay GPU dedicada, con tamanos de archivo que van desde 1,69 GB (q4) hasta 2,51 GB (q8), lo que permite ejecutarlo en portatiles, contenedores ligeros o servidores sin acelerador.

El modelo soporta 16 idiomas (incluido el castellano) y se distribuye bajo la licencia propietaria lfm1.0, lo que condiciona su uso comercial. La fecha de creacion del repositorio (octubre de 2026) y su actualizacion (noviembre de 2026) indican que es un lanzamiento reciente dentro de la familia LFM3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal image-text-to-text; decoder de lenguaje + vision encoder) |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4 (decoder q4 + vision encoder q8) y q8 (decoder q8 + vision encoder fp16) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (propietaria, license: other) |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3-VL-2B mas alla de que es un modelo multimodal image-text-to-text con un decoder de lenguaje y un vision encoder separados. La model card de esta version ONNX remite explicitamente a la model card original para los detalles de arquitectura y uso. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta version es el empaquetado en ONNX Runtime, que permite ejecutar el modelo en multiples plataformas (CPU, GPU, edge) con dos niveles de precision. Cada precision empareja un decoder con un vision encoder: q4 usa decoder q4 + vision encoder q8 (1,69 GB), y q8 usa decoder q8 + vision encoder fp16 (2,51 GB). No se han publicado detalles sobre decodificacion especulativa, atencion lineal u otras optimizaciones en la informacion proporcionada.

## Capacidades

- Generacion de texto e inferencia multimodal image-text-to-text (entrada de imagenes y texto, salida de texto).
- Conversacion multi-turno (tag conversational).
- Soporte multilingue en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Inferencia multiplataforma mediante ONNX Runtime, incluyendo CPU.
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos con imagenes en local: el modelo puede recibir capturas o escaneos y generar descripciones o extraer informacion textual, ejecutandose en CPU gracias al paquete ONNX q4 de 1,69 GB, sin necesidad de GPU.
- Asistentes de accesibilidad: descripcion de imagenes para personas con discapacidad visual en aplicaciones de escritorio o moviles, aprovechando la inferencia ONNX multiplataforma y el bajo peso del modelo.
- Moderacion de contenido visual en pipelines ligeros: clasificacion y descripcion de imagenes subidas por usuarios en servicios con recursos limitados, donde un modelo de 2B cuantizado a q4 cabe en un contenedor pequeno.
- Atencion al cliente multimodal: gestion de conversaciones donde el usuario adjunta imagenes (capturas de error, fotos de productos) y el modelo responde en castellano u otro de los 16 idiomas soportados.
- Despliegue en dispositivos edge o IoT: inferencia de vision-lenguaje en hardware sin acelerador dedicado, usando los archivos ONNX con ONNX Runtime en lugar de frameworks completos.
- Prototipado rapido de aplicaciones image-text-to-text: integracion en entornos .NET, Java o JavaScript mediante ONNX Runtime, sin depender de PyTorch, para validar casos de uso antes de escalar a modelos mayores.
- Traduccion y descripcion multilingue de imagenes: generacion de descripciones o respuestas en cualquiera de los 16 idiomas soportados a partir de una imagen y una instruccion textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el paquete q4 ocupa 1,69 GB en disco y el q8 2,51 GB; la memoria en ejecucion sera del orden de esos valores mas el overhead de ONNX Runtime (no se proporcionan cifras exactas).
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo esta empaquetado para inferencia en CPU segun la model card.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; el diseno apunta a ejecucion en CPU, por lo que deberia caber en practicamente cualquier equipo moderno.
- Opciones de despliegue: ONNX Runtime (libreria declarada del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia lfm1.0 (license: other): es una licencia propietaria, por lo que el uso comercial esta sujeto a los terminos del archivo LICENSE del repositorio; es imprescindible revisarlos antes de desplegar en produccion.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es inherente a los modelos generativos de este tamano; conviene validar las salidas en aplicaciones criticas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide planificar casos de uso con ventanas largas.
- Cobertura idiomatica: aunque se listan 16 idiomas, no se especifica el nivel de calidad por idioma; el rendimiento en castellano u otros idiomas distintos del ingles no esta cuantificado.
- Modelo cuantizado: esta version es una cuantizacion del modelo base, por lo que puede presentar una perdida de calidad respecto al original en fp16/bf16; no se documenta la magnitud de esa perdida.
- Dependencia de ONNX Runtime: el despliegue requiere esta libreria y puede no integrarse con tooling estandar de PyTorch/Hugging Face Transformers.
- Fechas del repositorio: la fecha de creacion (2026-10-26) y actualizacion (2026-11-05) son posteriores a la fecha actual; conviene verificar la vigencia y el estado del modelo antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX/blob/main/LICENSE
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Archivos ONNX: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX/tree/main/onnx
