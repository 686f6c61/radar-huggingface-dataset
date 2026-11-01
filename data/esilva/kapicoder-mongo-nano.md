# esilva/KapiCoder-Mongo-Nano

## Resumen

KapiCoder-Mongo-Nano es un modelo de autocompletado de código especializado en consultas MongoDB, desarrollado por el usuario esilva a partir de un fine-tuning de `Qwen/Qwen2.5-Coder-0.5B`. Con unos 494 millones de parámetros, está diseñado para completar consultas MongoDB en el punto del cursor mediante la técnica fill-in-the-middle (FIM), dentro del editor Kapibara Studio, al que se le envía el texto anterior y posterior al cursor junto con una cabecera de contexto (contrato `editor-context-v1`). Es la versión v3 de los pesos (etiqueta `v0.1.0-preview`).

El modelo resuelve un problema concreto: acelerar la escritura de consultas MongoDB Console JavaScript (operaciones `find`, pipelines de agregación, etapas `$search`, definiciones de índices) y pipelines JSON. No es un modelo conversacional ni un agente: solo propone texto que la aplicación anfitriona debe revisar antes de ejecutar.

Su relevancia actual radica en la tendencia hacia asistentes de código pequeños y especializados que pueden ejecutarse localmente con recursos mínimos. El propio autor lo publica en estado PREVIEW/experimental, para inspección y retroalimentación, y advierte explícitamente que no está pensado para uso en producción. Los datos de evaluación son internos y sintéticos, sin conjunto humano a ciegas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), fine-tuning de Qwen2.5-Coder-0.5B |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la sugerencia se limita a 32 tokens en el IDE) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp16/bf16, 1,0 GB de repo) |
| Idiomas soportados | Ingles y portugues (interface de datos); el dominio de codigo es JavaScript/MongoDB |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder de la familia Qwen2 y parte de los pesos preentrenados de Qwen2.5-Coder-0.5B, un modelo de 0,5B especializado en codigo. El fine-tuning se orientó a la tarea de fill-in-the-middle: dadas las porciones de texto antes y despues del cursor, más una cabecera de contexto (`editor-context-v1`) que incluye, idealmente, los nombres de campos de la coleccion, el modelo genera una continuacion corta.

El entrenamiento (v3) se realizó sobre datos sintéticos generados con el modelo Qwen3-14B y plantillas gramaticales, cubriendo esquemas de dominios como telecomunicaciones y publicidad. El corpus incluye consultas MongoDB Console JavaScript y pipelines JSON. Se aplicó un proceso de descontaminación eliminando los cortes de entrenamiento que compartian largos n-gramas con el conjunto de homologación. No se ha publicado informacion sobre RLHF/DPO (no procede, al tratarse de un modelo base de autocompletado) ni sobre el numero exacto de tokens de entrenamiento. Se trata de una unica ejecución de entrenamiento (una semilla), sin estimacion de varianza entre ejecuciones.

## Capacidades

- Autocompletado fill-in-the-middle de consultas MongoDB: `find`, pipelines de agregación, etapas `$search` y definiciones de índices.
- Completado de pipelines JSON de MongoDB.
- Completado de codigo JavaScript generico residual (conservado del modelo base, aunque sin ajuste especifico; 53% de exact match en FIM generico de JavaScript).
- Sugerencias cortas orientadas a IDE (el editor limita la salida a 32 tokens).
- Uso del contexto de esquema: aprovecha los nombres de campos de la coleccion cuando estan visibles en la cabecera de contexto.
- No soporta: conversacion, instrucciones, tool calling, agentes, explicacion de codigo ni revision de codigo. No ejecuta nada: solo sugiere texto.

## Casos de uso

- Autocompletado en editores de consultas MongoDB: integrado en un IDE como Kapibara Studio, sugiere la continuacion de una consulta en el cursor mientras el desarrollador escribe, reduciendo el tiempo de redaccion de filtros y proyecciones.
- Escritura de pipelines de agregacion: ayuda a completar etapas como `$match`, `$group` o `$search` sugiriendo la sintaxis correcta a partir del fragmento ya escrito.
- Definicion de índices: completa llamadas de creacion de índices a partir del contexto parcial, util para desarrolladores que no dominan la API de índices de MongoDB.
- Asistencia a perfiles junior o no especialistas en MongoDB: el modelo sugiere estructuras de consulta tipicas, que el usuario revisa y ajusta, sirviendo de andamiaje de aprendizaje.
- Entornos con recursos limitados o offline: con menos de 500 millones de parametros, puede ejecutarse en hardware modesto o portatil sin GPU dedicada, adecuado para autocompletado local con baja latencia.
- Integracion en herramientas internas de datos: equipos que construyen consolas o exploradores de datos propios pueden incrustar el modelo como motor de sugerencias bajo el contrato `editor-context-v1`, enviando el esquema de la coleccion para mejorar la calidad de las sugerencias.

## Benchmarks y rendimiento

Los siguientes resultados son declarados por el autor del modelo (no verificados de forma independiente) sobre datos internos y sintéticos:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| MongoDB FIM autocomplete | KapiCoder v2c validation (interno, sintético, n=2000) | FIM accuracy (exact match normalizado) | 0,405 |
| MongoDB FIM autocomplete | KapiCoder v2c validation (n=2000) | Exec-valid (parsea y ejecuta en modo lectura) | 0,5945 |
| MongoDB FIM autocomplete | KapiCoder v2c validation (n=2000) | Exec-valid / techo del validador (0,6255) | 0,9504 |
| MongoDB FIM autocomplete | KapiCoder v2c validation (n=2000) | Syntax-valid | 0,9955 |
| MongoDB FIM autocomplete | KapiCoder v2c validation (n=2000) | Campos inexistentes (esquema visible, %) | 1,34% |
| JavaScript generico FIM (regresion) | Cortes FIM de npm permissive, interno (n=500) | FIM accuracy | 0,53 |
| MongoDB FIM, esquemas no vistos | Homologacion v1, sintetico OOD (n=6030, 28 esquemas) | FIM accuracy | 0,4234 |
| MongoDB FIM, esquemas no vistos | Homologacion v1 (n=6030) | Exec-valid | 0,802 |
| MongoDB FIM, esquemas no vistos | Homologacion v1 (n=6030) | Exec-valid / techo (0,9307) | 0,8617 |
| MongoDB FIM, esquemas no vistos | Homologacion v1 (n=6030) | Campos inexistentes (esquema visible, %) | 10,81% |

Advertencias del propio autor: ninguna metrica se midio sobre consultas escritas por personas; el conjunto de homologación no es totalmente independiente de los datos de entrenamiento v3 (mismo generador LLM y plantillas gramaticales), por lo que la mejora sobre consultas escritas por LLM probablemente sobreestime el rendimiento sobre consultas humanas. No hay comparacion directa publicada con el modelo base en estas tablas, salvo la referencia de que el modelo base zero-shot incurre en 7,02% de campos inexistentes frente al 10,81% de este fine-tuning en esquemas no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16/bf16 (el repo ocupa 1,0 GB); con cuantizacion a 4 bits, en torno a 0,4-0,5 GB. No hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU moderna de gama consumer es mas que suficiente (RTX 3060, RTX 4060 o superiores); no se requiere A100 ni H100.
- Consumer GPU: cabe sobradamente en practicamente cualquier GPU con 2 GB de VRAM o mas; incluso puede ejecutarse solo en CPU dada su escala (0,5B), con latencias adecuadas para autocompletado.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (endpoints compatibles segun las tags del repo). Al ser un modelo Qwen2 estandar en safetensors, es compatible con vLLM, llama.cpp (previa conversion a GGUF, no publicada en el repo) y Ollama (previa conversion).
- Latencia y throughput: no disponibles; por tamano (0,5B) y salida limitada a 32 tokens, es razonable esperar respuestas de autocompletado por debajo de 100 ms en GPU consumer, aunque esta cifra es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Datos de benchmarks |
|---|---|---|---|---|
| KapiCoder-Mongo-Nano | 494 M | FIM de consultas MongoDB (dominio especifico) | Apache-2.0 | Internos, sintéticos, no verificados |
| Qwen/Qwen2.5-Coder-0.5B (base) | 494 M | Codigo general, multilenguaje | Apache-2.0 | Publicos (evaluaciones de Qwen); 7,02% campos inexistentes en el eval interno de MongoDB |
| StarCoder2-3B | ~3.000 M | Codigo general con FIM | BigCode OpenRAIL-M | Publicos (The Stack v2, HumanEval, etc.) |

El modelo base Qwen2.5-Coder-0.5B es mas versatil (codigo general multilenguaje, chat) pero sin ajuste especifico en MongoDB; KapiCoder-Mongo-Nano mejora la especializacion en el dominio segun sus evaluaciones internas, aunque con mas campos inventados que el base en esquemas no vistos. StarCoder2-3B ofrece FIM de codigo general con mayor capacidad, a costa de un tamano seis veces mayor y una licencia menos permisiva. No hay benchmarks cruzados publicados entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Estado PREVIEW/experimental: el autor indica explicitamente que no es apto para uso en produccion.
- Evaluacion exclusivamente interna y sintética: no existe un conjunto de consultas escrito por humanos; las metricas pueden sobreestimar el rendimiento real.
- Campos inventados: con el esquema visible, el 10,81% de las sugerencias sobre esquemas no vistos usa campos inexistentes (peor que el 7,02% del modelo base zero-shot). Es imprescindible validar los nombres de campo antes de ejecutar cualquier sugerencia.
- Riesgo de alucinacion tipico de modelos pequenos: una sugerencia puede ser sintacticamente valida (99,55% syntax-valid) y aun asi ser incorrecta o destructiva si se ejecuta.
- No es un modelo conversacional ni de instrucciones: no sigue ordenes, no explica codigo, no hace revision ni llama a herramientas.
- Una sola ejecucion de entrenamiento y una sola evaluacion greedy: sin estimacion de varianza.
- Sesgo de datos sintéticos: entrenado con salidas de Qwen3-14B y plantillas gramaticales, lo que puede introducir sesgos estilisticos del generador.
- Idiomas: documentado para ingles y portugues; no hay soporte declarado de otros idiomas en comentarios o contexto.
- Restricciones de licencia: Apache-2.0, permisiva para uso comercial; la restriccion principal es la del propio autor, que desaconseja su uso en produccion en esta version.
- Ambito limitado a los dialectos listados (MongoDB Console JavaScript y pipelines JSON); otros dialectos de consulta quedan fuera del uso previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/esilva/KapiCoder-Mongo-Nano
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Paper referenciado en las tags (arXiv 2409.12186, familia Qwen2.5-Coder): https://arxiv.org/abs/2409.12186
