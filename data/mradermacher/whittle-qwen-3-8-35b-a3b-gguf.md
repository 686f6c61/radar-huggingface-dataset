# mradermacher/Whittle-Qwen-3.8-35B-A3B-GGUF

## Resumen

Whittle-Qwen-3.8-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por whittleOrg, distribuido en formato GGUF por mradermacher. Se trata de una variante destilada del modelo base Whittle-Qwen-3.8-35B-A3B, entrenada mediante knowledge distillation a partir de un modelo profesor Qwen 3.8 de 27B (dataset `logic65/whittle-distill-qwen3.8-27b`). El modelo integra innovaciones arquitectonicas poco habituales: memoria de n-gramas, memoria condicional e hyper-connections, ademas de una arquitectura MoE.

El modelo cuenta con 35.547.542.656 parametros totales (segun los safetensors del repo base) y esta orientado a tareas de razonamiento, pensamiento explicito (thinking), generacion de codigo y matematicas. Soporta principalmente ingles y chino, con capacidades multilingues adicionales. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Esta ficha cubre especificamente la version GGUF cuantizada por mradermacher, que ofrece 11 variantes de cuantizacion desde Q2_K (13,1 GB) hasta Q8_0 (37,9 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo hasta servidores. El repo tiene 240,9 GB de tamano total y acumula 1.679 descargas desde su publicacion en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con memoria de n-gramas, memoria condicional e hyper-connections |
| Parametros totales | 35.547.542.656 (35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de Mixture of Experts (MoE), combinada con tres mecanismos adicionales que el autor etiqueta explicitamente: memoria de n-gramas (n-gram-memory), memoria condicional (conditional-memory) e hyper-connections. Estas tecnicas buscan mejorar la eficiencia computacional y la capacidad de recuperacion de informacion a largo plazo dentro del contexto. La etiqueta `qwen4_exp` sugiere una base experimental derivada de la familia Qwen, aunque no se especifica la relacion exacta con dicha familia.

El entrenamiento se realizo mediante knowledge distillation desde un modelo profesor de 27B (Qwen 3.8) usando el dataset `logic65/whittle-distill-qwen3.8-27b`. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las etiquetas del modelo indican que el entrenamiento esta orientado a razonamiento, modo thinking, codigo y matematicas, lo que sugiere un enfasis en tareas de razonamiento complejo.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito con modo thinking (pensamiento paso a paso).
- Generacion y comprension de codigo en multiples lenguajes.
- Resolucion de problemas matematicos.
- Capacidades multilingues, con soporte principal de ingles y chino.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque las etiquetas de reasoning y thinking sugieren capacidad para ello.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de razonamiento tecnico: el modelo puede emplearse para resolver problemas de logica y matematicas paso a paso gracias a su modo thinking, adecuado para entornos educativos o de analisis.
- Generacion de codigo en pipelines de desarrollo: su orientacion a codigo permite integrarlo en herramientas de autocompletado, revision o generacion de tests, desplegado en formato GGUF con llama.cpp.
- Atencion al cliente multilingue: con soporte de ingles y chino, puede gestionar conversaciones multi-turno en entornos de soporte para mercados asiaticos y anglosajones.
- Destilacion y experimentacion en investigacion: al ser un modelo destilado con arquitecturas experimentales (n-gram memory, hyper-connections), es util como objeto de estudio para investigadores que analicen tecnicas de memoria y eficiencia en MoE.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (20,5-21,4 GB) permiten ejecutar el modelo en GPUs de consumo de gama alta, habilitando prototipado local sin infraestructura cloud.
- Procesamiento de documentacion tecnica en chino e ingles: su combinacion de idiomas y capacidades de razonamiento lo hace adecuado para resumir y analizar documentacion bilingue.
- Evaluacion comparativa de cuantizaciones: el amplio conjunto de variantes GGUF permite a los equipos medir el trade-off calidad/rendimiento antes de fijar una version en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: ~13,1 GB de pesos; requiere al menos 16 GB de VRAM para contexto corto.
  - Q3_K_S / Q3_K_M / Q3_K_L: 15,7-17,8 GB; requiere 20-24 GB de VRAM.
  - IQ4_XS: 19,5 GB; requiere ~24 GB de VRAM.
  - Q4_K_S / Q4_K_M: 20,5-21,4 GB; requiere 24 GB de VRAM (RTX 3090/4090).
  - Q5_K_S / Q5_K_M: 24,7-25,2 GB; requiere 32 GB de VRAM o descarga parcial a RAM.
  - Q6_K: 29,4 GB; requiere 32-40 GB de VRAM.
  - Q8_0: 37,9 GB; requiere 48 GB de VRAM (A6000, A100 40GB con margen limitado).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4; A100 40GB o A6000 48GB para Q6/Q8; H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversion.
- Latencia y throughput estimados: no disponibles. Al ser MoE, el numero de parametros activos por token determinaria el throughput real, pero ese dato no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Whittle-Qwen-3.8-35B-A3B (este) | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Destilado, arquitecturas experimentales de memoria |
| Qwen 3.8 27B (profesor) | 27B | no disponible | no disponible | no disponible | Modelo profesor usado en la destilacion |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos publicados |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse con datos principalmente en ingles y chino, puede presentar sesgos culturales y linguisticos hacia esos idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el modo thinking no garantiza veracidad y puede producir cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto o idioma: la longitud de contexto no se ha publicado; el soporte multilingue se limita principalmente a ingles y chino, con rendimiento probablemente inferior en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene verificar la licencia del modelo base y del dataset de destilacion por posibles restricciones adicionales.
- Caveats para produccion: el modelo base tiene etiqueta `qwen4_exp`, lo que sugiere caracter experimental; no hay benchmarks publicados que validen su rendimiento; las cuantizaciones Q2_K y Q3_K_M estan marcadas como de menor calidad por el autor; el repo base ocupa 240,9 GB, lo que implica costes de almacenamiento considerables.
- El modelo es una destilacion, por lo que puede heredar limitaciones del profesor y perder capacidades en el proceso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Whittle-Qwen-3.8-35B-A3B-GGUF
- Repositorio imatrix (quants ponderados): https://huggingface.co/mradermacher/Whittle-Qwen-3.8-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/whittleOrg/Whittle-Qwen-3.8-35B-A3B
- Dataset de destilacion: https://huggingface.co/datasets/logic65/whittle-distill-qwen3.8-27b
- Pagina de descargas del autor: https://hf.tst.eu/model#Whittle-Qwen-3.8-35B-A3B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
