# 1bit-MONSTER/Qwen2.5-1.5B-Instruct-GGUF

## Resumen

Este repositorio es una redistribucion en formato GGUF del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario 1bit-MONSTER con el fichero cuantizado en Q4_K_M. No es un modelo nuevo ni un ajuste fino: la cuantizacion es la oficial de Qwen y el autor la reempaqueta anadiendo mediciones de rendimiento de su propio motor de inferencia (1bit engine) sobre hardware Strix Halo con backend Vulkan.

El problema que resuelve es el de siempre en modelos pequenos cuantizados: permitir el despliegue local de un asistente conversacional de 1.777.088.000 parametros (dato real de los pesos safetensors del modelo base) en un fichero de 1,1 GB, ejecutable en portatiles, mini-PC con GPU integrada o equipos sin GPU dedicada, sin coste de API y con licencia Apache 2.0.

Al tratarse de una redistribucion, la arquitectura, el entrenamiento, el contexto y las capacidades reales son los del modelo base de Alibaba; esta ficha marca como no disponibles todos los datos que la model card del re-host no detalla y que no pueden verificarse con la informacion aportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5 (no se detalla en la model card del re-host) |
| Parametros totales | 1.777.088.000 (~1,78 B), dato real de los safetensors del modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en el repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Fichero incluido | qwen2.5-1.5b-instruct-q4_k_m.gguf |
| Tamano del repositorio | 1,1 GB |
| Motor de referencia | 1bit engine, backend Vulkan |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento: se limita a indicar que el fichero es la cuantizacion Q4_K_M oficial de Qwen para Qwen2.5-1.5B-Instruct. Por tanto, toda la informacion arquitectonica y de entrenamiento (composicion del dataset, numero de tokens, fases de ajuste supervisado, RLHF/DPO, innovaciones de atencion) corresponde al modelo base y no esta documentada en este repositorio. La unica aportacion tecnica original del autor es la medicion de rendimiento del motor 1bit sobre Strix Halo con Vulkan.

En la practica, esto significa que la cuantizacion no introduce cambios de arquitectura, solo de precision numerica: los pesos se almacenan en bloques Q4_K_M (4 bits con escalas y minimos por bloques K-quant), lo que reduce el peso desde los ~3,5 GB en fp16 hasta 1,1 GB, a cambio de una perdida de precision no cuantificada por el autor.

## Capacidades

- Generacion de texto conversacional: el modelo es una variante "Instruct", por lo que esta orientado a seguir instrucciones y mantener dialogos multi-turno.
- Formato de chat compatible con motores de inferencia estandar: la model card muestra el arranque mediante `1bit serve -m ... --device vulkan`, lo que implica soporte de plantilla de chat en el GGUF.
- Inferencia local en CPU, GPU integrada o GPU dedicada mediante backend Vulkan.
- Capacidades derivadas del modelo base Qwen2.5-1.5B-Instruct (codigo, matematicas basicas, multilingue): no verificadas ni documentadas en la model card del re-host, por lo que se consideran no disponibles a efectos de esta ficha.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking", vision o audio: no disponible; el repositorio solo declara texto conversacional.

## Casos de uso

- Asistente conversacional embebido en aplicaciones de escritorio: con 1,1 GB de pesos, el modelo puede empaquetarse dentro de un instalador de aplicacion y ejecutarse en la maquina del usuario sin depender de una API externa ni de conectividad.
- Autocompletado y reescritura de texto en herramientas ofimaticas: la latencia baja del formato Q4_K_M (172 tok/s de generacion medidos en Strix Halo) permite sugerencias interactivas mientras el usuario escribe.
- Clasificacion y etiquetado de texto en pipelines de datos por lotes: al ser un modelo pequeno y barato de ejecutar, se puede aplicar sobre grandes volumenes de documentos para tareas de categorizacion, extraccion de entidades simple o normalizacion de campos.
- Prototipado rapido de aplicaciones LLM: sirve como modelo de desarrollo para validar prompts, plantillas de chat y flujos conversacionales antes de migrar a modelos mayores con el mismo formato GGUF.
- Despliegue en hardware de gama baja o sin GPU dedicada: mini-PC con GPU integrada, portatiles antiguos o entornos de unos pocos gigabytes de RAM, donde modelos de 7B o superiores no caben.
- Traduccion y asistencia linguistica en local: uso como traductor ligero dentro de herramientas que no pueden enviar texto a servicios en la nube por requisitos de privacidad o cumplimiento normativo.
- Demostraciones offline y entornos de formacion: talleres o entornos aislados donde se necesita un modelo conversacional funcional sin acceso a internet (previa descarga del GGUF).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento aportado es de throughput de inferencia, medido por el autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| pp512 (prefill de 512 tokens) | 5198 tok/s | Strix Halo, Vulkan, motor 1bit engine |
| tg128 (generacion de 128 tokens) | 172 tok/s | Strix Halo, Vulkan, motor 1bit engine |

Estas cifras describen velocidad de procesamiento, no calidad de las respuestas, y corresponden a un hardware y motor concretos; no son extrapolables directamente a otras configuraciones.

## Requisitos de hardware

- Fichero de pesos: 1,1 GB en disco (Q4_K_M). Tamano del repositorio: 1,1 GB.
- VRAM estimada: aproximadamente 1,5-2 GB para los pesos mas overhead de runtime y cache KV; la cifra exacta depende de la longitud de contexto configurada y del tamano de batch (estimacion basada en el tamano del fichero, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria dedicada o compartida. El autor ha validado Strix Halo (GPU integrada Radeon) con backend Vulkan. Tambien resulta viable en RTX 3050, RTX 4060, GTX 1650 y similares.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de gama de entrada o media, y tambien en CPU con 2-4 GB de RAM libre.
- Opciones de despliegue: 1bit engine (Vulkan, el motor usado por el autor), llama.cpp, Ollama, LM Studio, llamafile y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM es experimental y depende de la version; TGI no consume GGUF de forma nativa.
- Latencia y throughput: 5198 tok/s en prefill (pp512) y 172 tok/s en generacion (tg128) sobre Strix Halo con Vulkan. No hay mediciones publicadas para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (re-host Qwen2.5-1.5B-Instruct GGUF) | 1,78 B | no disponible en la informacion proporcionada | Apache 2.0 | GGUF Q4_K_M | Repositorio de terceros, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-1.5B-Instruct (original) | 1,78 B | no verificado en esta ficha | Apache 2.0 | safetensors | Repositorio oficial de Alibaba |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF (cuantizacion oficial) | 1,78 B | no verificado en esta ficha | Apache 2.0 | GGUF (varias cuantizaciones) | Repositorio oficial |
| Llama-3.2-1B-Instruct | dato publico no verificado en esta ficha | no verificado en esta ficha | Llama 3.2 Community License | safetensors y GGUF | Repositorio oficial de Meta |
| Gemma-2-2B-it | dato publico no verificado en esta ficha | no verificado en esta ficha | Gemma Terms of Use | safetensors y GGUF | Repositorio oficial de Google |

Los datos de los modelos alternativos proceden de documentacion publica y no se han verificado contra las fuentes originales en la elaboracion de esta ficha; no se dispone de comparativas de calidad contrastadas. La diferencia practica mas relevante de este repositorio frente a las alternativas oficiales es la licencia Apache 2.0 y la existencia de una medicion de throughput publicada para un motor concreto; frente a la cuantizacion oficial de Qwen, aporta menos variedad de cuantizaciones y ningun valor anadido verificable salvo dicha medicion.

## Limitaciones y advertencias

- Redistribucion de terceros: el autor no es el desarrollador del modelo ni de la cuantizacion; no hay garantia de que el fichero coincida bit a bit con el publicado por Qwen. Se recomienda verificar el hash contra el repositorio oficial antes de usarlo en produccion.
- Cero validacion comunitaria: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, por lo que no existe evidencia externa de funcionamiento correcto.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones propias; no se puede afirmar nada sobre la precision de las respuestas mas alla de lo que declare el modelo base.
- Riesgo de alucinacion: inherente a los modelos de 1,5-1,8 B de parametros, acentuado por la cuantizacion a 4 bits. No debe usarse como fuente de verdad sin verificacion humana.
- Perdida por cuantizacion: Q4_K_M degrada ligeramente la calidad respecto a fp16; el autor no publica ninguna comparacion entre ambas precisiones.
- Idiomas y contexto: no documentados en esta ficha. No se debe asumir cobertura multilingue ni una ventana de contexto concreta sin consultar la documentacion del modelo base.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial y redistribucion con atribucion; conviene conservar el aviso de atribucion a Qwen que incluye la propia model card.
- Caducidad: al ser un re-host, puede quedar desactualizado o desaparecer si el autor lo retira; para uso en produccion es preferible depender del repositorio oficial de Qwen.
- Rendimiento no extrapolable: las cifras de tok/s se midieron exclusivamente en Strix Halo con Vulkan y el motor 1bit; en otras plataformas los numeros seran distintos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/1bit-MONSTER/Qwen2.5-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Cuantizacion oficial del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Motor de inferencia 1bit engine: https://github.com/1bit-MONSTER/engine
