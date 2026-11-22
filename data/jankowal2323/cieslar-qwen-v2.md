# jankowal2323/cieslar-qwen-v2

## Resumen

CIESLAR-QWEN v2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B realizado por el usuario jankowal2323 mediante la tecnica LoRA con el stack de entrenamiento Unsloth. El modelo parte de una base densa de aproximadamente 4.326 millones de parametros (4,3B) desarrollada por Alibaba Qwen, y anade una identidad y estilo de respuesta propios bautizados como "Cieslar Edition", con una personalidad consistente y una pieza de marca (CieslarCoin) insertada en las respuestas. Se distribuye principalmente en formato GGUF para inferencia local.

El modelo resuelve un caso de personalizacion de estilo y personaje sobre una base instruct ya competente, no una mejora de capacidades generales. Su interes practico es limitado fuera de su nicho: es un ejemplo de fine-tune LoRA de bajo coste sobre una base de 4B, con licencia Apache 2.0 y pesos cuantizados listos para ejecutar en hardware de consumo. La model card advierte explicitamente de que se trata de una version de prueba con problemas conocidos (bucles publicitarios y datos incorrectos sobre CieslarCoin) y remite a una version posterior (v3).

La relevancia actual es, por tanto, la de un artefacto de demostracion de personalizacion ligera y despliegue en local, no la de un modelo de proposito general para produccion. El contexto, la composicion exacta del dataset de entrenamiento y los hiperparametros del ajuste no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (recomendados por el autor: Q4_K_M para movil, Q8_0 para PC) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,1 GB; safetensors como base de conteo de parametros) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer denso de 4,3B parametros. Sobre esa base se aplico un ajuste fino mediante LoRA usando Unsloth, una libreria optimizada para entrenamiento de bajo coste en memoria. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; la model card solo declara la tecnica (LoRA), el stack (Unsloth) y el objetivo (estilo de respuesta propio, personalidad consistente y pieza de marca CieslarCoin).

No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). La configuracion recomendada por el autor incluye desactivar el modo de razonamiento (thinking mode) y usar temperatura entre 0,6 y 0,7, lo que sugiere que el ajuste se hizo sobre el comportamiento conversacional estandar de la base.

## Capacidades

- Generacion de texto conversacional en polaco e ingles.
- Estilo de respuesta y personalidad propios ("Cieslar Edition"), con identidad de marca integrada.
- Uso como modelo de chat multi-turno (pipeline text-generation, tag conversational).
- Compatible con endpoints (tag endpoints_compatible).
- Capacidades de razonamiento, codigo y matematicas: heredadas de la base, no evaluadas ni documentadas en este fine-tune.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: el autor recomienda desactivarlo.
- Vision o audio: no disponible.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo sirve para experimentar con fine-tunes LoRA que imponen una identidad y un tono concretos sobre una base de 4B, sin reentrenar desde cero.
- Despliegue local en hardware de consumo: los GGUF Q4_K_M y Q8_0 permiten ejecutar el modelo en portatiles y equipos de sobremesa con llama.cpp u Ollama para pruebas de estilo.
- Demostracion de personalizacion de marca: util como referencia de como insertar una firma o mensaje promocional fijo en las respuestas (con la advertencia de los bucles publicitarios documentados).
- Experimentos academicos sobre sesgo inducido por fine-tune: permite estudiar como un ajuste pequeno altera el comportamiento de la base y genera artefactos repetitivos.
- Chat conversacional en polaco: uso como asistente de practica o generacion de texto en polaco, uno de los dos idiomas declarados.
- Evaluacion comparativa de stacks de entrenamiento: ejemplo practico de Unsloth frente a otros frameworks para ajustes de bajo coste.
- Base para iteraciones posteriores: el propio autor remite a la v3 como version final, por lo que este modelo puede servir como punto de partida para versiones mejoradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en Q4_K_M y 4,5-5 GB en Q8_0 para un modelo de 4,3B parametros (estimacion por tamano, no medida publicada).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para Q8_0; 4 GB o mas para Q4_K_M. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GB de VRAM segun cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag endpoints_compatible sugiere soporte para endpoints tipo API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CIESLAR-QWEN v2 | 4,3B | no disponible | Apache 2.0 | GGUF | Fine-tune LoRA de Qwen3.5-4B con identidad propia; version de prueba |
| Qwen/Qwen3.5-4B (base) | 4,3B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original de Alibaba Qwen; capacidades generales sin personalizacion |
| jankowal2323/cieslar-qwen-v3 | no disponible | no disponible | no disponible | no disponible | Version final recomendada por el autor de este modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Version de prueba: el autor la declara explicitamente no final y remite a la v3.
- Problemas conocidos: bucles de contenido publicitario y datos facticos incorrectos sobre CieslarCoin.
- Riesgo de alucinacion: elevado en todo lo relativo a la marca y a hechos verificables, segun la propia model card.
- Sesgo inducido: el fine-tune impone una identidad y un mensaje promocional, lo que reduce la neutralidad de las respuestas.
- Idiomas limitados a polaco e ingles; el castellano no esta declarado como idioma soportado.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo no esta validada para produccion.
- No hay benchmarks ni evaluaciones publicadas que respalden su rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jankowal2323/cieslar-qwen-v2
- Version final recomendada por el autor: https://huggingface.co/jankowal2323/cieslar-qwen-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
