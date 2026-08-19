# FINAL-Bench/Armoring-Qwen3.8-27B

## Resumen

Este repositorio no contiene un modelo ejecutable, sino un informe público de investigación de un experimento de "armoring" a nivel de atención (attention armoring) aplicado sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por el equipo VIDRAFT / FINAL-Bench. El objetivo del experimento era comprobar si una intervención arquitectónica en el subsistema de atención puede reducir la presión de la caché de claves y valores (KV-cache) en contextos largos, manteniendo el comportamiento básico de generación de texto bajo sondas controladas.

El resultado principal verificado es una reducción del 46,6 % en el footprint de KV-cache para una ventana de 32 000 tokens, lo que implica un multiplicador de capacidad de KV-cache de 1,87x con la misma memoria, y una mejora del 10,8 % en el throughput de prefill en caliente. No se incluyen pesos, checkpoints ni la receta de transformación propietaria. El repositorio se presenta como documentación pública para discusión de investigación y colaboración bajo un proceso de divulgación privada.

La relevancia actual de este trabajo radica en la eficiencia de inferencia para contextos largos, un cuello de botella habitual en modelos de lenguaje grandes. Sin embargo, es importante subrayar que no se trata de un modelo listo para producción ni de una mejora de capacidades generales; es un resultado de eficiencia arquitectónica acotado a un entorno de prueba específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen/Qwen3.8-27B, sin detalles publicados) |
| Parametros totales | 27B (inferido del nombre del modelo base, no confirmado en la documentacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32k tokens (usado en el experimento; no se especifica el maximo soportado) |
| Tipos de cuantizacion | No disponible (no se publican pesos) |
| Idiomas soportados | Ingles (segun la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

La documentacion no describe la arquitectura interna del modelo base ni la intervencion de armoring. Se indica que el experimento actua a nivel del subsistema de atencion para reducir la presion de KV-cache, pero no se divulgan los detalles de la transformacion (mapeo de tensores, parametros de transformacion, etc.). Tampoco se proporcionan datos sobre el entrenamiento: no se menciona el numero de tokens, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. El repositorio es exclusivamente un resumen de resultados de evaluacion, sin artefactos de entrenamiento.

## Capacidades

- No se han evaluado capacidades generales de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se reporta soporte de tool calling, function calling ni capacidades de agente.
- No se reportan capacidades multilingues mas alla de la etiqueta de idioma ingles.
- La unica capacidad verificada es un probe de formato de texto basico, que supero 15 de 15 pruebas en el candidato armado.
- El resultado principal es una reduccion del footprint de KV-cache en contextos largos (32k tokens) y una mejora del throughput de prefill, medidos en un entorno de servidor H100.

## Casos de uso

- Investigacion sobre eficiencia de inferencia en contextos largos: el informe sirve como referencia publica para estudiar tecnicas de reduccion de KV-cache y su impacto en el rendimiento de prefill.
- Colaboracion con socios de investigacion: el repositorio esta pensado para iniciar conversaciones con entidades que puedan evaluar el resultado bajo un proceso de divulgacion privada.
- Comparacion de metodologias de evaluacion de eficiencia: los numeros publicados (reduccion de KV-cache, multiplicador de capacidad, throughput) pueden utilizarse como punto de partida para replicar o contrastar experimentos similares.
- Documentacion de resultados arquitectonicos: sirve como registro publico de un experimento de armoring, util para la comunidad que trabaja en optimizacion de atencion.
- No es adecuado para despliegue en produccion, generacion de codigo, atencion al cliente ni ninguna aplicacion que requiera un modelo con pesos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos disponibles son mediciones de eficiencia del experimento, presentados en la model card:

| Medicion | Qwen3.8-27B original | Candidato armado | Cambio |
|---|---|---|---|
| KV-cache a 32k tras 128 tokens de decodificacion | 2 203,75 MiB | 1 175,75 MiB | -1 028,00 MiB |
| Reduccion de footprint de KV-cache | - | - | -46,6 % |
| Multiplicador de capacidad de KV-cache con misma memoria | 1,00x | 1,87x | +87,4 % |
| Throughput de prefill en caliente a 32k | 5 233,15 tok/s | 5 799,57 tok/s | +10,8 % |
| Probe de formato de comportamiento | - | 15 / 15 superados | Preservado |

Estas cifras deben interpretarse como un resultado de eficiencia arquitectonica, no como una mejora de capacidades generales.

## Requisitos de hardware

- No aplica: el repositorio no contiene pesos ni un modelo ejecutable, por lo que no se pueden estimar requisitos de VRAM, GPU recomendadas ni opciones de despliegue.
- El experimento se realizo en un servidor con GPU H100, segun la model card, pero no se detallan configuraciones adicionales.
- No se proporcionan datos de latencia ni throughput de decodificacion.

## Comparativa con modelos similares

No disponible. El informe solo compara el candidato armado con su modelo base (Qwen3.8-27B) en las metricas de eficiencia mencionadas. No se ofrecen comparaciones con otros modelos de la misma categoria (por ejemplo, otros modelos de 27B o tecnicas alternativas de reduccion de KV-cache).

## Limitaciones y advertencias

- No es un modelo ejecutable: el repositorio no incluye pesos, checkpoints ni una implementacion funcional.
- No se reclama mejor inteligencia general, mejor velocidad de decodificacion ni preparacion para produccion.
- No se ha realizado una evaluacion completa de seguridad, razonamiento, codificacion, multilingue, tool-use ni tareas multimodales.
- La receta de armoring es propietaria y no se divulga, lo que impide la reproducibilidad del experimento.
- Los resultados se limitan a un entorno de prueba especifico (misma maquina, misma configuracion) y a una ruta de evaluacion solo de texto.
- La licencia Apache 2.0 se aplica al contenido del repositorio (documentacion), no a un modelo con pesos.
- El idioma soportado declarado es solo ingles; no se garantiza un comportamiento adecuado en otros idiomas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FINAL-Bench/Armoring-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
