# loom-fun/LiquidAI-LFM3-Audio-2B-loom

## Resumen

LFM3-Audio-2B-loom es un paquete de despliegue publicado por loom-fun para el checkpoint GGUF LiquidAI/LFM3-Audio-2B-GGUF, un modelo multimodal de audio de 2.000 millones de parametros desarrollado originalmente por Liquid AI. Este repositorio no contiene pesos: incluye unicamente los programas `.loom` y la tarjeta `model.json` que permiten ejecutar el GGUF original mediante el runtime Loom sobre GPUs AMD con arquitectura ROCm, en concreto sobre un Ryzen AI Max+ 395 "Strix Halo".

El paquete se ha generado con el flujo de trabajo `loom-skills` y esta pensado para servir el modelo con `loom-serve` exponiendo una API compatible con `/v1/chat/completions` de OpenAI en `127.0.0.1:8080`. La relevancia es acotada pero concreta: facilita el despliegue de un modelo de audio en hardware AMD integrado sin necesidad de recompilar ni convertir pesos, algo poco habitual en el ecosistema de inferencia local.

La informacion publica disponible sobre este repositorio es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin pipeline asignado. Los detalles tecnicos del modelo subyacente (arquitectura interna, datos de entrenamiento, benchmarks) no se recogen en la model card del paquete, por lo que se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-Audio-2B, multimodal de audio) |
| Parametros totales | 2B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de LiquidAI/LFM3-Audio-2B-GGUF) |
| Formato de pesos | GGUF (los pesos no se incluyen en este repositorio; se descargan del modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la denominacion LFM3-Audio-2B se infiere que pertenece a la familia Liquid Foundation Models 3 de Liquid AI con capacidades de audio, pero no se detalla si emplea transformer, SSM, hibrido u otra variante, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO.

Respecto al paquete en si, la innovacion tecnica es de despliegue: los programas `.loom` junto con `model.json` y `model.json.lock` permiten materializar el GGUF verificado por checksum y ejecutarlo con `loom-serve --device=amdgpu` sobre ROCm. No se modifica el checkpoint original; el repositorio actua como capa de empaquetado y orquestacion para el runtime Loom.

## Capacidades

- Procesamiento de audio: el modelo base pertenece a la familia LFM3-Audio, orientada a tareas que combinan audio y texto.
- Generacion de texto y respuestas conversacionales a traves de la API `/v1/chat/completions`.
- Servido mediante API compatible con OpenAI, lo que facilita la integracion con clientes existentes.
- Ejecucion en GPU AMD via ROCm con `loom-serve`.
- Verificacion de integridad de pesos mediante `model.json.lock` durante la descarga con `loom-fetch`.
- Tool calling, function calling, agentes, vision, thinking mode u otras capacidades especiales: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Transcripcion y analisis de audio local: el modelo puede desplegarse en una estacion de trabajo con Ryzen AI Max+ 395 y atender peticiones de audio sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de asistentes de voz: gracias a la API compatible con OpenAI en `127.0.0.1:8080`, se puede conectar un cliente de chat existente y sustituir el backend por este modelo sin reescribir la integracion.
- Evaluacion de modelos de audio en hardware AMD integrado: util para equipos que quieran medir el rendimiento de LFM3-Audio-2B en Strix Halo antes de comprometerse con un despliegue mayor.
- Pipelines de investigacion reproducibles: `loom-fetch` con `--materialize=copy` y la verificacion por lock permiten reconstruir el entorno exacto en distintas maquinas, lo que ayuda a reproducir experimentos.
- Servicio interno de bajo coste: al ejecutarse en una APU con memoria unificada y un GGUF Q4_K_M, puede mantener un endpoint de chat de audio para uso interno sin GPU dedicada.
- Base para ajustes posteriores: al tratarse de un paquete de despliegue sobre un GGUF estandar, sirve como punto de partida para comparar variantes cuantizadas o versiones actualizadas del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un GGUF Q4_K_M de un modelo de 2B, la huella de pesos ronda los 1,5 GB, aunque el consumo real depende del runtime y de los buffers de audio.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" es la plataforma en la que se genero el paquete; el runtime Loom usa ROCm (`--device=amdgpu`).
- Compatibilidad con GPU consumer: el paquete esta orientado a hardware AMD con ROCm; no se documenta soporte para GPUs NVIDIA ni para CPU en la informacion disponible.
- Opciones de despliegue: `loom-fetch` para materializar el modelo y `loom-serve` para servirlo; requiere `pip install "hrx-loom[hf]"`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| loom-fun/LiquidAI-LFM3-Audio-2B-loom | 2B | no disponible | Paquete Loom + GGUF Q4_K_M | other | Enfocado a ROCm/Strix Halo |
| LiquidAI/LFM3-Audio-2B-GGUF | 2B | no disponible | GGUF | other | Checkpoint original sin empaquetar |
| Otras alternativas de audio de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene los pesos: sin ejecutar `loom-fetch` no hay modelo que cargar, y la descarga depende de la disponibilidad de LiquidAI/LFM3-Audio-2B-GGUF.
- La licencia es "other" y se hereda del modelo base; es imprescindible revisar los terminos de LiquidAI/LFM3-Audio-2B-GGUF antes de cualquier uso comercial.
- No se declaran idiomas soportados, lo que impide garantizar un comportamiento correcto en castellano sin evaluacion previa.
- No hay benchmarks ni evaluaciones publicadas para este paquete, por lo que el rendimiento real en tareas de audio es desconocido.
- El soporte esta limitado a hardware AMD con ROCm segun la documentacion; no se mencionan rutas para NVIDIA, CPU u otros aceleradores.
- El proyecto tiene cero descargas y cero likes en el momento de la consulta, senal de madurez y mantenimiento inciertos.
- Riesgo de alucinacion y sesgos: no documentados para este paquete; deben asumirse los del modelo base, que tampoco se detallan.
- El servidor escucha en `127.0.0.1:8080` por defecto; para exposicion en red habra que revisar la configuracion de seguridad del runtime.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/loom-fun/LiquidAI-LFM3-Audio-2B-loom
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
