# SandLogicTechnologies/flint-GGUF

## Resumen

Recursive Flint es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Recursive, orientado especificamente a ingenieria de software a nivel de repositorio y a cargas de trabajo de agentes de programacion. El modelo esta disenado para investigar bases de codigo, diagnosticar y corregir defectos, implementar funcionalidad nueva y crear o modificar pruebas mediante razonamiento iterativo e interaccion con herramientas. Cuenta con aproximadamente 39.800 millones de parametros totales y unos 2.500 millones de parametros activos por token, lo que le permite mantener una huella computacional por token relativamente baja pese a su tamano total.

La arquitectura es un transformer decoder-only con capas MoE dispersas y atencion hibrida: 35 de sus 49 capas emplean atencion de ventana deslizante de 513 tokens y 14 usan atencion completa, combinando comprension local del codigo con razonamiento de largo alcance sobre el repositorio. Su longitud de contexto es de 262.144 tokens, adecuada para analizar repositorios completos o trazas largas de agentes.

El repositorio `SandLogicTechnologies/flint-GGUF` contiene conversiones cuantizadas en formato GGUF del modelo base `RecursiveSI/flint`, pensadas para inferencia local. Las variantes disponibles (IQ4_NL, IQ4_XS e IQ3_M) reducen el peso de 74,16 GB en BF16 a entre 16,31 y 21,14 GB, lo que acerca el modelo a hardware de consumo de gama alta. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y atencion hibrida (ventana deslizante + atencion completa) |
| Parametros totales | ~39.785.287.456 (39,8 B) |
| Parametros activos | ~2,5 B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF: IQ4_NL (21,14 GB), IQ4_XS (20,02 GB), IQ3_M (16,31 GB); BF16 original de 74,16 GB |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only de 49 capas que combina dos capas densas iniciales con capas MoE dispersas. Cada capa MoE contiene 256 expertos enrutados, de los cuales se seleccionan 6 por token, mas un experto compartido siempre activo. La atencion es hibrida: 35 capas usan atencion de ventana deslizante con ventana de 513 tokens y 14 capas usan atencion completa, lo que permite procesar contexto local de codigo de forma eficiente y, a la vez, razonar sobre dependencias de largo alcance en el repositorio. La configuracion de atencion usa 32 cabezas de consulta y 4 cabezas de clave/valor (GQA).

El entrenamiento se orienta especificamente a ingenieria de software agentica en lugar de asistencia conversacional general. La model card describe un enfoque en tareas que requieren comprender un repositorio existente, razonar sobre detalles de implementacion, aplicar cambios de codigo, ejecutar herramientas y validar los resultados. Se menciona evaluacion en benchmarks de codigo agentico como SWE-bench Pro, SWE-bench Verified y Terminal-Bench 2.1. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y codigo con enfasis en tareas de ingenieria de software.
- Razonamiento sobre repositorios: analisis de estructura, dependencias y contexto relevante repartido entre multiples archivos.
- Correccion de defectos (bug fixing) y depuracion de codigo.
- Implementacion de funcionalidad nueva a partir de descripciones o issues.
- Creacion y modificacion de pruebas.
- Uso de herramientas (tool use / function calling) en interacciones multiturno dentro de flujos de agentes de programacion.
- Razonamiento multitepo y flujos de horizonte largo que combinan razonamiento y ejecucion de herramientas.
- Integracion con entornos de agentes que proporcionan acceso al repositorio y capacidad de ejecucion.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir el issue y el arbol del repositorio, investigar los archivos implicados y proponer un parche; su contexto de 262.144 tokens permite incluir multiples ficheros y trazas de ejecucion en una sola ventana.
- Agente de depuracion en CI/CD: integrado en un pipeline, puede ejecutar pruebas, leer los fallos y aplicar correcciones iterativas mediante tool calling antes de abrir una pull request.
- Revision de codigo asistida: analisis de diffs y deteccion de problemas de dependencias o efectos secundarios, aprovechando las capas de atencion completa para razonar sobre relaciones entre modulos distantes.
- Generacion de pruebas unitarias: a partir de una implementacion existente, el modelo puede proponer casos de prueba y modificarlos segun los resultados de ejecucion.
- Migracion y refactorizacion de codigo: analisis de un repositorio completo para localizar patrones obsoletos y aplicar cambios coherentes en varios ficheros, con validacion mediante herramientas.
- Despliegue local en estaciones de trabajo de desarrollo: las variantes IQ4_XS e IQ3_M (20,02 GB y 16,31 GB) permiten ejecutar el modelo en equipos con GPU de gama alta para asistencia de codigo sin enviar el codigo a servicios externos, algo relevante por confidencialidad.
- Investigacion sobre agentes de software: el modelo sirve como base para experimentos de razonamiento multitepo y evaluacion en entornos tipo SWE-bench.

## Benchmarks y rendimiento

La model card menciona evaluacion en SWE-bench Pro, SWE-bench Verified y Terminal-Bench 2.1, pero no se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y offloading): IQ3_M ~16,3 GB de pesos; IQ4_XS ~20,0 GB; IQ4_NL ~21,1 GB. A esto hay que sumar la memoria para el contexto KV; con 262.144 tokens de contexto y 49 capas el coste del KV cache puede ser elevado, por lo que conviene limitar la longitud de contexto segun la VRAM disponible.
- GPU recomendadas: A100 40/80 GB y H100 para contexto completo y mayor throughput; RTX 4090 (24 GB) puede alojar las variantes IQ4_XS e IQ3_M con contexto moderado; GPU con 16 GB solo de forma ajustada con IQ3_M y contexto reducido u offloading a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con IQ4_XS/IQ4_NL y en GPUs de 16 GB con IQ3_M y contexto limitado.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para el modelo base en BF16 si se dispone de hardware suficiente; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tener solo ~2,5 B parametros activos por token, el coste computacional por token es menor que el de un modelo denso de 39,8 B, pero los pesos deben residir en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Recursive Flint (esta ficha) | ~39,8 B | ~2,5 B | 262.144 | Apache 2.0 | GGUF / safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- Idiomas: la model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como todo modelo generativo, puede proponer cambios de codigo plausibles pero incorrectos; en tareas de ingenieria es imprescindible validar con pruebas y ejecucion real.
- Cuantizacion: las variantes IQ3_M e IQ4_XS introducen perdida de precision; la model card advierte que IQ3_M presenta un compromiso mas fuerte en razonamiento dificil, depuracion compleja y tareas de horizonte largo.
- Contexto: aunque el modelo soporta 262.144 tokens, usar el contexto completo incrementa mucho el consumo de memoria KV y puede degradar la latencia; conviene ajustar la ventana al caso de uso.
- Enfoque especializado: el modelo esta optimizado para ingenieria de software agentica, no para asistencia conversacional general; su comportamiento fuera de ese dominio puede ser limitado.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia y las de cualquier dependencia del ecosistema de despliegue.
- Datos de entrenamiento y benchmarks no publicados en la informacion disponible, lo que dificulta evaluar sesgos y comparar rendimiento de forma objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SandLogicTechnologies/flint-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
