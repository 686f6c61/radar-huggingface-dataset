# Anotos/LFM2-2.6B-MLX-4bit

## Resumen

Anotos/LFM2-2.6B-MLX-4bit es una conversion a MLX en cuantizacion de 4 bits del modelo denso LiquidAI/LFM2-2.6B, publicada por el usuario Anotos (Axly's Customs) para alimentar la aplicacion Erato. No es un modelo nuevo: es un artefacto de cuantizacion orientado a Apple Silicon, con 2.569.272.320 parametros totales y un unico archivo safetensors de 1,45 GB, generado con `mlx-lm` 0.32.0 mediante el comando `mlx_lm.convert --hf-path LiquidAI/LFM2-2.6B -q --q-bits 4`.

Su relevancia es practica: reduce el peso del modelo base a 4,5 bits por peso (tamano de grupo 64) y un pico de memoria de aproximadamente 1,9 GB en un Mac con M4, lo que lo situa en el rango de dispositivos con menos de 8 GB de memoria, incluidos iPhone con 6 GB. Frente al checkpoint original en bf16, el ahorro de memoria es de en torno a 3,5 veces, a cambio de una perdida de precision que el autor no cuantifica.

La ficha se limita a lo verificable en la informacion disponible: la model card del repositorio no detalla arquitectura interna, longitud de contexto, idiomas ni resultados de evaluacion, por lo que esos apartados se marcan como no disponibles y remiten a la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (deriva de LiquidAI/LFM2-2.6B; el repositorio solo documenta la conversion MLX, no la arquitectura) |
| Parametros totales | 2.569.272.320 (dato de los safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits MLX, 4,5 bits por peso, tamano de grupo 64; el modelo base en bf16 esta disponible por separado |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0`); uso comercial limitado a organizaciones por debajo del umbral de ingresos de la licencia |
| Formato de pesos | safetensors (MLX); tamano de repo 1,4 GB, archivo de 1,45 GB |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base ni su proceso de entrenamiento. Lo unico indicado por el autor es que se trata de una conversion directa del commit `36ed799f70` de LiquidAI/LFM2-2.6B, sin mas cambios que la cuantizacion: misma topologia, mismos pesos, misma tokenizacion. Cualquier afirmacion sobre tipo de atencion, capas convolucionales, numero de tokens de entrenamiento o uso de RLHF/DPO debe consultarse en la model card del modelo base, no en este repositorio.

La innovacion tecnica del artefacto es exclusivamente la cuantizacion: `mlx-lm` 0.32.0 aplica cuantizacion de 4 bits con grupo de 64, resultando en 4,5 bits efectivos por peso frente a los 16 bits del checkpoint bf16. El autor publica el SHA-256 de `model.safetensors` (`7cebcdbbcd0ff753616a22fb8dfe98f9cdc11a256430c5b87fbec09342e2cf46`) para verificacion de integridad, un detalle poco habitual y util en repositorios de cuantizacion.

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, heredadas de la configuracion del modelo base.
- Inferencia local en Apple Silicon mediante la libreria MLX y CLI `mlx_lm.generate`.
- Ejecucion en dispositivos con poca memoria: segun el autor, cabe en iPhone con 6 GB de RAM y picos de ~1,9 GB en M4.
- Capacidades especificas del modelo base (razonamiento, codigo, matematicas, tool calling, agentes, multilingueismo): no disponibles en la informacion proporcionada, ya que el autor no las detalla ni las evalua.
- No se documenta soporte de vision, audio ni modo de razonamiento explicito en este repositorio.

## Casos de uso

- Asistentes conversacionales integrados en aplicaciones iOS y macOS: el modelo esta pensado para la app Erato y su huella de 1,45 GB permite incluirlo como componente local sin depender de la nube.
- Procesamiento de texto sin conexion en iPhone con 6 GB de memoria: redaccion de resumenes, reescritura de parrafos o generacion de borradores donde no hay conectividad o no se quiere enviar datos a un servidor.
- Prototipado rapido en portatiles Apple: `mlx_lm.generate` permite lanzar prompts desde terminal en equipos con 8 GB de RAM sin descargar el checkpoint bf16 completo.
- Funciones auxiliares dentro de una app de escritorio: autocompletado de campos de texto, clasificacion de intenciones o generacion de plantillas sobre contenido introducido por el usuario.
- Filtrado y preprocesado de texto en local: limpieza, normalizacion o extraccion de campos simples de documentos antes de enviarlos a un modelo mayor alojado en servidor.
- Base para experimentacion en cuantizacion: al estar generado con un comando reproducible y con hash verificado, sirve para medir el impacto de 4 bits frente a bf16 en tareas concretas de produccion.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en el dispositivo, evita la exposicion de datos personales en servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni tampoco una comparacion de calidad entre la version 4 bits y el checkpoint bf16 original.

Los unicos datos de rendimiento publicados son de recursos, no de calidad:

| Metrica | Valor |
|---|---|
| Tamano del archivo de pesos | 1,45 GB |
| Tamano total del repositorio | 1,4 GB |
| Bits efectivos por peso | 4,5 (cuantizacion de 4 bits, grupo 64) |
| Pico de memoria en M4 Mac | ~1,9 GB |
| Memoria minima de dispositivo citada | 6 GB (iPhone) |

## Requisitos de hardware

- VRAM/memoria unificada estimada en inferencia: ~1,9 GB de pico en un Mac M4 segun el autor; el archivo de pesos ocupa 1,45 GB.
- Dispositivos objetivo declarados: iPhone con 6 GB de memoria y equipos por debajo de 8 GB de memoria.
- GPU compatibles: la conversion es especifica de MLX, por lo que requiere Apple Silicon (serie M). No se menciona soporte para CUDA ni ROCm.
- GPU de consumo tipo RTX 4090: no aplicable a este artefacto, al no estar en formato GGUF ni safetensors de PyTorch con kernels CUDA.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate`, libreria MLX). El autor indica que no hay otros cambios ademas de la cuantizacion, por lo que no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Memoria declarada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Anotos/LFM2-2.6B-MLX-4bit | 2.569.272.320 | MLX 4 bits, grupo 64, 4,5 bits/peso | ~1,9 GB de pico en M4 | No disponible | LFM Open License v1.0 | Publico en HuggingFace (30 descargas, 1 like) |
| LiquidAI/LFM2-2.6B (base) | 2.569.272.320 | bf16 | No disponible | No disponible | LFM Open License v1.0 | Publico en HuggingFace |
| Anotos/LFM2-8B-A1B-MLX-4bit | No disponible | MLX 4 bits | Orientado a iPhone de 12 GB y Mac de 16 GB | No disponible | No disponible | Publico en HuggingFace |
| Anotos/Gemma-4-E4B-it-Text-MLX-4bit | No disponible | MLX 4 bits | Orientado a iPhone y Mac de 8 GB | No disponible | No disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas opciones; la comparacion se limita a tamano, cuantizacion y perfil de memoria objetivo declarado por el autor.

## Limitaciones y advertencias

- La model card no documenta evaluacion alguna de degradacion por cuantizacion: no hay comparacion de calidad entre la version 4 bits y el modelo base en bf16, lo que impide estimar la perdida real en tareas de produccion.
- Sesgos conocidos: no disponibles. Al no publicarse evaluacion del modelo base en este repositorio, no se puede afirmar nada sobre sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: no cuantificado. Un modelo denso de 2,6B cuantizado a 4 bits tiende a producir mas errores factuales que modelos mayores, pero no hay medicion disponible.
- Limitaciones de contexto e idioma: no disponibles. La model card no especifica longitud de contexto, idiomas soportados ni calidad por idioma, de modo que no se puede garantizar un rendimiento correcto en castellano.
- Licencia: LFM Open License v1.0. El uso comercial esta limitado a organizaciones por debajo del umbral de ingresos definido en la licencia; es imprescindible revisar `LICENSE` antes de integrarlo en un producto comercial. El campo de HuggingFace aparece como `other`, no como licencia estandar.
- Ambito restringido a Apple Silicon: al depender de MLX, no es desplegable directamente en infraestructura con GPU NVIDIA o AMD sin reconvertir el modelo base.
- Repositorio de terceros: es una conversion no oficial, mantenida por un usuario independiente y no por Liquid AI. La trazabilidad depende del commit `36ed799f70` y del SHA-256 publicado, pero no hay garantia de mantenimiento ni de actualizaciones.
- Traccion minima: 30 descargas y 1 like en el momento de la consulta, con superficie de validacion por parte de la comunidad practicamente nula.
- La busqueda web realizada no devolvio ningun resultado tecnico relevante sobre este modelo ni sobre la familia LFM2; los unicos resultados obtenidos eran contenido no relacionado y de caracter adulto, por lo que se han descartado y no se enlazan.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Anotos/LFM2-2.6B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Licencia: https://huggingface.co/Anotos/LFM2-2.6B-MLX-4bit/blob/main/LICENSE
- Modelo relacionado (LFM2-8B-A1B, MLX 4 bits): https://huggingface.co/Anotos/LFM2-8B-A1B-MLX-4bit
- Modelo relacionado (Gemma-4-E4B-it Text, MLX 4 bits): https://huggingface.co/Anotos/Gemma-4-E4B-it-Text-MLX-4bit
- Modelo relacionado sin censura (LFM2-8B-A1B Abliterated, MLX 4 bits): https://huggingface.co/Anotos/LFM2-8B-A1B-Abliterated-MLX-4bit
- Modelo relacionado sin censura (Gemma-4-E4B Heretic, MLX 4 bits): https://huggingface.co/Anotos/Gemma-4-E4B-Heretic-MLX-4bit
