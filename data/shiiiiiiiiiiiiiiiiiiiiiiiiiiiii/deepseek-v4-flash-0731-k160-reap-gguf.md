# shiiiiiiiiiiiiiiiiiiiiiiiiiiiii/DeepSeek-V4-Flash-0731-K160-REAP.GGUF

## Resumen

Este repositorio contiene una variante experimental de DeepSeek V4 Flash 0731, un modelo de generación de texto basado en mezcla de expertos (MoE) desarrollado por DeepSeek. La variante, creada por el usuario shiiiiiiiiiiiiiiiiiiiiiiiiiiiii, aplica la técnica de poda REAP para reducir el número de expertos enrutados de 256 a 160 por capa, partiendo directamente de un archivo GGUF ya cuantizado en Q2 publicado por antirez. El objetivo es reducir el consumo de memoria para poder ejecutar el modelo en hardware local con recursos limitados, manteniendo en lo posible el comportamiento de la cuantización Q2 original.

El modelo se distribuye en formato GGUF con una cuantización asimétrica mixta (IQ2_XXS, Q2_K y Q8_0 según el tipo de tensor), y está pensado para ejecutarse con el motor de inferencia ds4, diseñado específicamente para DeepSeek V4. Según el autor, el modelo carga y produce texto en inglés coherente, y ha completado una tarea agéntica real con uso de herramientas. Sin embargo, se encuentra en fase de evaluación y presenta una degradación significativa en japonés, que el autor considera prácticamente inutilizable.

Se trata de un modelo experimental, sin resultados de benchmarks publicados, con una licencia MIT y orientado principalmente a cargas de trabajo agénticas en inglés sobre hardware con memoria unificada, como el sistema de pruebas del autor (AMD Ryzen AI MAX+ 395 con 96 GB de memoria).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), basada en DeepSeek V4 Flash 0731; 256 expertos enrutados originales, reducidos a 160 mediante poda REAP |
| Parametros totales | 180.433.133.911 (aprox. 180,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2 asimetrica mixta: IQ2_XXS (gate/up de expertos enrutados), Q2_K (down de expertos enrutados), Q8_0 (proyecciones de atencion, expertos compartidos y salida), otros tensores en precision mixta superior |
| Idiomas soportados | ingles (confirmado); japones degradado hasta ser practicamente inutilizable; otros idiomas no especificados |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, DeepSeek V4 Flash 0731, es un modelo de generacion de texto con arquitectura de mezcla de expertos (MoE) que utiliza 256 expertos enrutados por capa. Esta variante aplica la tecnica REAP (probablemente un metodo de poda de expertos) para seleccionar y conservar unicamente 160 de esos expertos, eliminando el resto directamente sobre un archivo GGUF ya cuantizado. El proceso no implica reentrenamiento ni ajuste de pesos: los expertos retenidos conservan sus valores cuantizados originales, sin pasar por un ciclo de des-cuantizacion y re-cuantizacion.

La cuantizacion Q2 de partida proviene del trabajo de antirez, que utiliza una estrategia asimetrica: los tensores de gate y up de los expertos enrutados se cuantizan con IQ2_XXS, los de down con Q2_K, mientras que las proyecciones de atencion, los expertos compartidos y la salida se mantienen en Q8_0. Esto permite reducir el tamano del modelo a aproximadamente 58,8 GB en disco, frente a los 180,4 mil millones de parametros totales en precision completa. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni la aplicacion de tecnicas como RLHF o DPO, ya que se trata de un modelo cuantizado y podado, no de un entrenamiento original.

## Capacidades

- Generacion de texto en ingles: el autor confirma que el modelo produce texto coherente en ingles tras la poda.
- Uso de herramientas (tool calling): ha completado con exito una tarea agente real que implicaba uso de herramientas en las pruebas del autor.
- Ejecucion con runtime DS4: disenado para funcionar con el motor de inferencia ds4, compatible con el layout compacto de expertos K160.
- Limitacion idiomatica: el japones queda practicamente inutilizable tras la poda; no se recomienda su uso para cargas de trabajo en ese idioma.
- Capacidades no evaluadas: no se han publicado resultados sobre razonamiento, codigo, matematicas, vision ni otras tareas. El autor indica que los benchmarks generales, de codigo y la fiabilidad a contexto largo estan pendientes de evaluacion.

## Casos de uso

- Agentes locales con uso de herramientas: el modelo esta orientado a cargas de trabajo agente en ingles, y el autor ha verificado una tarea real con tool calling. Puede emplearse en entornos de investigacion o prototipado donde se necesite un agente que ejecute acciones sobre APIs o funciones, siempre que el hardware disponga de suficiente memoria unificada.
- Asistentes conversacionales en ingles en hardware limitado: gracias a la poda K160 y a la cuantizacion Q2, el modelo cabe en sistemas con alrededor de 96 GB de memoria unificada, lo que permite desplegar un asistente local sin depender de servicios en la nube.
- Prototipado de aplicaciones de generacion de texto en ingles: util para validar flujos de trabajo de generacion de contenido, resumen o redaccion en entornos de desarrollo con recursos restringidos, antes de migrar a un modelo completo.
- Investigacion sobre compresion de modelos MoE: la variante permite estudiar el impacto de la poda de expertos sobre la calidad y el rendimiento, comparando con el modelo Q2 completo y con otras cuantizaciones K160.
- Pruebas de inferencia con el motor ds4: sirve como banco de pruebas para evaluar el rendimiento de prefill y decode, el uso de memoria y la estabilidad del runtime ds4 en hardware con ROCm.
- Despliegue en sistemas con memoria unificada (tipo Strix Halo): el autor lo probo en un AMD Ryzen AI MAX+ 395 con 96 GB de memoria unificada y ROCm, por lo que puede servir de referencia para equipos similares que necesiten ejecutar un modelo de gran tamano con margen para contexto y cache KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una evaluacion planificada que comparara el modelo Q2 completo, esta variante K160 Q2 y otras cuantizaciones K160 en dimensiones como tamano, memoria, velocidad de prefill y decode, calidad general, capacidad de codigo, fiabilidad de tool calling, exito en tareas agente, repeticiones y comportamiento a contexto largo, pero no se han aportado cifras concretas.

## Requisitos de hardware

- Tamano del archivo GGUF: 58,8 GB, por lo que se necesita al menos esa cantidad de memoria disponible para cargar los pesos, mas el overhead de contexto, cache KV y procesos del sistema.
- Sistema de prueba del autor: AMD Ryzen AI MAX+ 395 (Strix Halo) con 96 GB de memoria unificada y ROCm. No se han proporcionado datos de VRAM para GPUs discretas.
- Motor de inferencia: se requiere el runtime ds4 (antirez/ds4) con soporte para el layout compacto de expertos K160. No se menciona compatibilidad con vLLM, llama.cpp u otros motores.
- Latencia y throughput: no disponibles. El autor planea medir velocidades de prefill y decode en la evaluacion futura, pero no ha publicado resultados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de la misma categoria. El autor planea comparar esta variante con el modelo Q2 completo (sin poda) y con otras cuantizaciones K160, pero no ha publicado resultados. Por tanto, no es posible ofrecer una comparativa cuantitativa en este momento.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte explicitamente que la calidad esta en evaluacion y que algunas capacidades estan significativamente degradadas respecto al modelo completo.
- Japones inutilizable: tras la poda REAP K160, el japones no puede mantener conversaciones normales de forma fiable. No debe usarse para cargas de trabajo en ese idioma.
- Sin benchmarks publicados: no hay datos objetivos de calidad, rendimiento o fiabilidad en tareas de codigo, razonamiento o contexto largo.
- Requiere runtime especifico: solo funciona con el motor ds4 y una version compatible con el layout K160; no se garantiza su ejecucion con otros motores de inferencia.
- Riesgo de alucinacion y sesgos: al ser un modelo cuantizado y podado, es probable que presente alucinaciones y sesgos similares a los del modelo base, aunque no se ha evaluado formalmente.
- Licencia MIT: permite uso comercial, pero al ser una variante no oficial de DeepSeek V4 Flash, conviene revisar las condiciones del modelo base original y de las herramientas utilizadas (antirez, 0xSero) antes de un despliegue en produccion.
- Memoria minima elevada: a pesar de la poda, el archivo GGUF ocupa 58,8 GB, por lo que no cabe en GPUs de consumo tipicas (8-24 GB) sin tecnicas adicionales de offload o particionado no documentadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shiiiiiiiiiiiiiiiiiiiiiiiiiiiii/DeepSeek-V4-Flash-0731-K160-REAP.GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Cuantizacion Q2 de partida: https://huggingface.co/antirez/deepseek-v4-gguf
- Seleccion REAP K160: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP
- Motor de inferencia ds4: https://github.com/antirez/ds4
