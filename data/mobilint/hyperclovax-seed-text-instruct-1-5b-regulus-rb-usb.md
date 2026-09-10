# mobilint/HyperCLOVAX-SEED-Text-Instruct-1.5B-regulus-rb-usb

## Resumen

Este repositorio contiene una version del modelo HyperCLOVAX-SEED-Text-Instruct-1.5B de NAVER, cuantizada y compilada por Mobilint para ejecutarse sobre su hardware NPU. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos derivan del modelo base de 1,5B de parametros y se empaquetan junto con el runtime de aceleracion de Mobilint, por lo que el repositorio esta pensado para funcionar exclusivamente dentro de esa pila (libreria `mobilint`, con codigo personalizado y etiqueta de arquitectura `mobilint-llama`).

La relevancia de esta ficha es doble. Por un lado, ilustra un patron cada vez mas habitual: modelos abiertos pequenos (rango 1-2B) que se recompilan para NPUs de borde en lugar de GPUs, con el objetivo de reducir consumo y coste por inferencia. Por otro, el artefacto concreto presenta caracteristicas que conviene verificar antes de usarlo en produccion: el recuento real de parametros en safetensors es de 226.492.416, muy inferior a los 1,5B que sugiere el nombre, el repositorio ocupa 3,3 GB, no declara idiomas soportados, no publica benchmarks y acumula cero descargas en el momento de redactar esta ficha.

El modelo base es de tipo instruct/conversacional y esta orientado a generacion de texto. Su interes practico esta en el despliegue en dispositivos con NPU de Mobilint (la nomenclatura del repositorio, `regulus-rb-usb`, apunta a un formato de ejecucion para ese hardware), no en su uso sobre GPU convencional sin un proceso previo de conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (etiqueta `mobilint-llama`), compilado para NPU de Mobilint |
| Parametros totales | 226.492.416 segun los tensores safetensors; el nombre del modelo indica 1,5B (discrepancia no explicada en la informacion disponible) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el campo `base_model_relation: quantized` confirma que hubo cuantizacion, pero no se especifica el esquema (int8, int4, etc.) |
| Idiomas soportados | No disponible (no se declara en la model card ni en los metadatos) |
| Licencia | `hyperclovax-seed` (campo `license: other`), heredada del modelo base |
| Formato de pesos | safetensors, mas artefactos compilados y codigo personalizado para la pila `mobilint` |

## Arquitectura y entrenamiento

El artefacto se apoya en HyperCLOVAX-SEED-Text-Instruct-1.5B, un transformer decoder-only de tipo Llama segun la etiqueta de arquitectura declarada. Mobilint no ha publicado en esta model card detalles sobre el entrenamiento del modelo base: no se indican el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta el proceso de cuantizacion aplicado (numero de bits, granularidad por canal o por grupo, calibracion) ni el pipeline de compilacion hacia la NPU.

La unica innovacion tecnica verificable a partir de la informacion disponible es el propio empaquetado: el modelo se distribuye con codigo personalizado (`custom_code`) y la libreria `mobilint`, de modo que la inferencia se ejecuta sobre el stack de aceleracion de Mobilint y no sobre kernels estandar de PyTorch, vLLM o llama.cpp. Esto implica que el grafo se ha optimizado, fusionado y posiblemente reescrito para el patron de memoria y computo de la NPU objetivo, algo que tambien explica el desajuste entre el numero de parametros almacenados y el tamano nominal del modelo base, aunque la causa exacta no esta documentada.

## Capacidades

- Generacion de texto en modalidad conversacional, segun los tags `text-generation` y `conversational`.
- Respuesta a instrucciones, al derivar de un modelo de la familia `Instruct`.
- Ejecucion en hardware NPU de Mobilint como capacidad distintiva frente al modelo base.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- Asistentes conversacionales en dispositivo: al estar compilado para NPU de Mobilint, encaja en productos de borde (electrodomesticos, terminales de punto de venta, quioscos) donde no hay GPU ni conexion estable y se requiere un consumo energetico bajo.
- Procesamiento de lenguaje con privacidad estricta: sectores como sanidad, banca o asesoria legal pueden ejecutar resumen y generacion de respuestas en local, sin enviar texto de clientes a servicios en la nube, siempre que la licencia lo permita.
- Clasificacion de intenciones y enrutado en atencion al cliente: un modelo de este tamano es suficiente para etiquetar tickets, detectar urgencia y derivar a un flujo humano o automatico, con coste por inferencia muy inferior al de un modelo grande.
- Resumen de documentos cortos: actas, correos, incidencias o notas de campo de extensión limitada (la longitud de contexto no esta declarada, lo que obliga a validarla antes de usarla en produccion).
- Generacion de borradores en herramientas ofimaticas: autocompletado de parrafos, reescritura de tono o generacion de respuestas tipo en editores de texto y CRM.
- Moderacion y filtrado de contenido: preclasificacion de mensajes de usuario en foros o chats antes de pasarlos a un modelo mayor, reduciendo coste total del pipeline.
- Validacion de la pila de aceleracion de Mobilint: este repositorio sirve como banco de pruebas para medir latencia, consumo y precision tras la cuantizacion y compilacion, comparando contra la ejecucion del modelo base en CPU o GPU.
- Aplicaciones educativas sin conectividad: tutoria basica y generacion de ejercicios en tablets o dispositivos de aula con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a indicar que el modelo esta compilado y optimizado para hardware NPU de Mobilint, sin tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput.

## Requisitos de hardware

- El artefacto esta disenado para ejecutarse sobre NPU de Mobilint con su stack propietario; no es directamente ejecutable en GPU convencional sin conversion previa.
- VRAM estimada si se atiende al recuento real de safetensors (226,5 M de parametros): aproximadamente 0,45 GB en FP16/BF16, 0,23 GB en int8 y 0,12 GB en int4, sin contar cache KV ni activaciones.
- VRAM estimada si se atiende al tamano nominal del modelo base (1,5B): aproximadamente 3,0 GB en FP16/BF16, 1,5 GB en int8 y 0,8 GB en int4, sin contar cache KV ni activaciones.
- GPU recomendadas: no disponible para este formato concreto; para el modelo base, cualquier GPU con 4 GB o mas de memoria (RTX 3060, RTX 4060, T4) es suficiente en FP16.
- Cabe en GPU de consumo: si, en el caso del modelo base en cuantizacion de 8 o 4 bits; el artefacto compilado, en cambio, requiere hardware Mobilint.
- Opciones de despliegue: pila `mobilint` (libreria declarada) y el ecosistema de modelos de Mobilint. vLLM, llama.cpp, Ollama y TGI no son aplicables a este repositorio tal cual, salvo que se conviertan los pesos o se use el modelo base original.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentacion publica de cada modelo y no se han verificado en esta busqueda; los del modelo base se derivan de la informacion del repositorio.

| Modelo | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| HyperCLOVAX-SEED-Text-Instruct-1.5B-regulus-rb-usb (este) | 226,5 M segun safetensors (1,5B nominal) | No disponible | `hyperclovax-seed` | NPU de Mobilint |
| HyperCLOVAX-SEED-Text-Instruct-1.5B | 1,5B | No disponible | `hyperclovax-seed` | GPU/CPU estandar |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | GPU/CPU, vLLM, llama.cpp |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community | GPU/CPU, vLLM, llama.cpp |

Comparativa de rendimiento: no disponible, ya que este repositorio no publica benchmarks y las cifras de las alternativas no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del hardware Mobilint: sin una NPU compatible y el runtime de la compania, los pesos de este repositorio no son utilizables de forma directa.
- Discrepancia de parametros: el nombre indica 1,5B pero los safetensors suman 226,5 M. Antes de usarlo hay que confirmar con el proveedor si se trata de pesos empaquetados/cuantizados, de un subconjunto de tensores o de un error de publicacion.
- Licencia `hyperclovax-seed` (campo `license: other`): es una licencia personalizada, no una licencia abierta estandar. Es imprescindible revisar el archivo LICENSE del modelo base antes de cualquier uso comercial.
- Idiomas no declarados: no se puede asumir un soporte multilingue ni siquiera en ingles o coreano sin verificacion empirica.
- Contexto no declarado: sin longitud de contexto documentada, el diseno de aplicaciones con conversaciones largas o documentos extensos queda sin base.
- Riesgo de alucinacion: los modelos de rango 1-2B tienden a generar afirmaciones incorrectas con seguridad, especialmente en dominios especializados; requiere validacion o recuperacion externa (RAG) en entornos criticos.
- Sesgos: no disponible. No hay documentacion sobre evaluaciones de sesgo, toxicidad o equidad.
- Ausencia de validacion comunitaria: cero descargas y cero likes en el momento de redactar esta ficha, sin issues ni evaluaciones de terceros que permitan contrastar el comportamiento real.
- Repositorio reciente: los metadatos indican creacion y ultima actualizacion el 10 de septiembre de 2026, con apenas minutos de diferencia entre ambas, lo que sugiere una publicacion sin ciclo de mantenimiento visible.
- Los resultados de busqueda web asociados a esta consulta no aportaron informacion tecnica relevante sobre el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mobilint/HyperCLOVAX-SEED-Text-Instruct-1.5B-regulus-rb-usb
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B
- Licencia del modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-1.5B/blob/main/LICENSE
- Sitio de Mobilint: https://mobilint.com
- Repositorio de modelos de Mobilint: https://github.com/mobilint/mblt-model-zoo
