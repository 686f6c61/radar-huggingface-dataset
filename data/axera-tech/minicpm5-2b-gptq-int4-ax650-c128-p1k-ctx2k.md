# AXERA-TECH/MiniCPM5-2B-GPTQ-Int4-AX650-C128-P1K-CTX2K

## Resumen

MiniCPM5-2B-GPTQ-Int4-AX650-C128-P1K-CTX2K es una conversión del modelo MiniCPM5-2B de OpenBMB, publicada por AXERA-TECH, empaquetada como binario `.axmodel` para ejecutarse en la NPU AX650 de Axera. No es un modelo entrenado desde cero ni un ajuste fino: se parte de la versión ya cuantizada en GPTQ Int4 (w4a16) de MiniCPM5-2B y se recompila con Pulsar2 5.0 para el backend de inferencia `ax-llm`, de modo que el modelo pueda correr en hardware de borde (placas AX650N, M4N-Dock / 爱芯派 Pro y tarjeta aceleradora M.2) sin GPU dedicada.

El interés de esta ficha es fundamentalmente práctico: es una pieza de despliegue para edge AI. El repositorio ocupa 2,2 GB y la model card reporta cifras de rendimiento concretas sobre AX650: 196 ms de TTFT para 128 tokens, 653 tokens/s en fase de prefill y 12 tokens/s en decodificación, con 1,8 GiB de memoria CMM y 2,75 GiB de flash.

Conviene señalar dos cautelas de documentación. Primero, el identificador del repositorio termina en `C128-P1K-CTX2K` mientras que el título y los ejemplos de la model card usan `C128-P4K-CTX6K`; la model card no aclara si son configuraciones distintas o un error de copia. Segundo, la propia model card está parcialmente truncada en el README recuperado (corta a mitad del log de inicialización), por lo que faltan detalles de arquitectura y de entrenamiento que no se pueden verificar con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B; la model card no describe la arquitectura) |
| Parametros totales | aproximadamente 2.000 millones, segun el nombre del modelo base (cifra exacta no disponible) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible con precision; los logs de `ax-llm` muestran `max_token_len: 2047` y grupos de decodificacion hasta 6143 tokens. El sufijo del repo indica `CTX2K`, pero el titulo de la model card indica `CTX6K` |
| Tipos de cuantizacion | GPTQ Int4 (w4a16) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | `.axmodel` (exportado con Pulsar2 5.0) para la NPU AX650; el repositorio base esta en formato GPTQ |
| Tamano del repositorio | 2,2 GB |
| Plataforma objetivo | NPU Axera AX650 (AX650N DEMO Board, M4N-Dock, tarjeta M.2 LLM-8850) |
| Runtime de inferencia | `ax-llm` (AXERA-TECH) |
| Herramienta de conversion | Pulsar2 5.0 |
| Modelo base | openbmb/MiniCPM5-2B |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base MiniCPM5-2B (tipo de transformer, atencion, número de capas, dimensiones ocultas o tipo de activacion). Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Este repositorio, en concreto, no aporta entrenamiento nuevo: es una conversión de pesos.

La innovacion tecnica relevante aquí es el pipeline de despliegue. El modelo original en GPTQ Int4 se convierte a formato `.axmodel` mediante Pulsar2 5.0, aplicando una cuantizacion w4a16 (pesos en 4 bits, activaciones en 16 bits) adaptada al acelerador AX650. El runtime `ax-llm` gestiona la inferencia con un esquema de grupos diferenciados para prefill y decode: el log de inicializacion muestra un `prefill_token_num` de 128 (coherente con el sufijo `C128` del repositorio), una cache KV de 256 y 22 grupos de prefill con capacidades incrementales (de 128 a 2560 tokens de historial). Los grupos de decodificacion se configuran hasta 6143 tokens. Este diseño por tramos permite limitar la memoria estática reservada en la NPU a costa de segmentar el procesamiento del contexto.

## Capacidades

- Generacion de texto en ingles y chino, heredada del modelo base MiniCPM5-2B.
- Inferencia totalmente local en NPU AX650, sin dependencia de GPU ni de servicios en la nube.
- Ejecucion en placas de borde y tarjetas aceleradoras M.2, lo que habilita despliegues embebidos.
- Interfaz de linea de comandos mediante `axllm run`, con descarga directa del repositorio desde Hugging Face.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; la model card solo declara `text-generation`.
- Soporte multilingue adicional: no disponible; solo se declaran en y zh.

## Casos de uso

- Asistentes locales en dispositivos de borde: el modelo se ejecuta integramente en la NPU AX650 con 1,8 GiB de memoria CMM, lo que permite desplegar un chatbot en una placa M4N-Dock o en una tarjeta M.2 sin conexion a internet.
- Procesamiento de texto en kioscos o terminales industriales: al ocupar 2,75 GiB de flash, el binario cabe en almacenamiento embebido y permite generar respuestas, resúmenes o etiquetas sobre datos locales.
- Traduccion y asistencia bilingue en/zh: es el par de idiomas declarado, adecuado para herramientas de atencion en mercados con documentacion en ingles y chino.
- Clasificacion y extraccion de informacion en pipelines de datos: dado que el repositorio declara compatibilidad con `endpoints_compatible`, puede exponerse como endpoint de generacion de texto dentro de un flujo automatizado.
- Prototipado de productos de IA en hardware de bajo consumo: el TTFT de 196 ms y un decode de 12 tokens/s permiten validar experiencias conversacionales antes de escalar a hardware mayor.
- Investigacion en cuantizacion y compilacion para NPU: el repositorio sirve como caso de estudio reproducible del flujo Hugging Face -> GPTQ -> Pulsar2 -> `.axmodel`, util para evaluar perdida de calidad tras la conversion w4a16.
- Despliegue de inferencia en flotas de dispositivos: el runtime `ax-llm` dispone de binarios precompilados exportados por CI, lo que simplifica la instalacion en equipos sin entorno de compilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye mediciones de rendimiento de inferencia sobre el chip AX650:

| Metrica | Valor (AX650) |
|---|---|
| TTFT (128 tokens) | 196 ms |
| Prefill | 653 tokens/s |
| Decode | 12 tokens/s |
| Memoria CMM | 1,8 GiB |
| Flash | 2,75 GiB |

No se proporcionan cifras equivalentes para GPU ni comparaciones con el modelo base en precision completa.

## Requisitos de hardware

- Plataforma objetivo: NPU Axera AX650, en sus variantes AX650N DEMO Board, M4N-Dock (爱芯派 Pro) y tarjeta aceleradora M.2 LLM-8850.
- Memoria: 1,8 GiB de CMM que deben reservarse en la placa; la model card advierte explicitamente de que la asignacion de CMM debe superar ese valor.
- Almacenamiento: 2,75 GiB de flash para los binarios `.axmodel` y el tokenizer; el repositorio completo en Hugging Face ocupa 2,2 GB.
- GPU: no aplicable. Este repositorio no esta pensado para A100, H100, RTX 4090 ni ninguna GPU; no se documenta VRAM para inferencia en GPU.
- VRAM estimada: no disponible.
- Despliegue en GPU de consumo: no disponible / no soportado por este repositorio.
- Opciones de despliegue: runtime `ax-llm` (instalacion mediante script, comando de una linea o binario precompilado de GitHub Actions) y CLI `axllm run`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: 196 ms de TTFT para 128 tokens, 653 tokens/s en prefill y 12 tokens/s en decode sobre AX650.
- Tiempo de inicializacion: el log de ejemplo muestra aproximadamente 48 segundos para cargar los 45 modulos `axmodel` antes de aceptar peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| AXERA-TECH/MiniCPM5-2B-GPTQ-Int4-AX650-C128-P1K-CTX2K | ~2B | no disponible (sufijo CTX2K en el repo, CTX6K en el titulo de la model card) | `.axmodel` (Pulsar2 5.0) | MIT | Inferencia en NPU AX650 |
| AXERA-TECH/MiniCPM5-2B-GPTQ-Int4 | ~2B | no disponible | GPTQ Int4 | MIT | Version GPTQ de la que deriva esta conversion |
| openbmb/MiniCPM5-2B | ~2B | no disponible | safetensors (transformers) | no disponible | Modelo base original |
| Otros modelos de ~2B orientados a NPU | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en la informacion disponible |

No se dispone de datos de rendimiento del modelo base ni de terceros que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no incluye ninguna seccion de sesgos, evaluacion de seguridad ni analisis de riesgos.
- Riesgo de alucinacion: inherente a un modelo generativo de ~2B; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Idioma: soporte declarado unicamente para ingles y chino. El rendimiento en castellano u otros idiomas no esta documentado.
- Contexto: existe una discrepancia sin aclarar entre el sufijo del repositorio (`CTX2K`), el titulo de la model card (`CTX6K`) y los logs del runtime (`max_token_len: 2047`). En produccion conviene verificar empiricamente la ventana efectiva antes de disenar prompts largos.
- Hardware: el binario solo funciona en NPU AX650 con Pulsar2 5.0 y `ax-llm`. No se puede cargar con `transformers`, vLLM, llama.cpp ni Ollama a partir de este repositorio.
- Memoria: la asignacion de CMM debe superar 1,8 GiB; una configuracion incorrecta de la placa provoca fallo de inicializacion.
- Latencia de arranque: alrededor de 48 segundos de carga en el ejemplo documentado, relevante para servicios con requisitos de disponibilidad estrictos.
- Licencia: MIT, sin restricciones de uso comercial conocidas en la informacion disponible. Verificar de todos modos la licencia del modelo base openbmb/MiniCPM5-2B, que no se detalla aqui.
- Documentacion incompleta: el README recuperado esta truncado y no incluye detalles de arquitectura, dataset de entrenamiento ni evaluaciones de calidad.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/MiniCPM5-2B-GPTQ-Int4-AX650-C128-P1K-CTX2K
- Version GPTQ Int4 original: https://huggingface.co/AXERA-TECH/MiniCPM5-2B-GPTQ-Int4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Documentacion de Pulsar2 (conversion de LLM de Hugging Face a axmodel): https://pulsar2-docs.readthedocs.io/en/latest/appendix/build_llm.html
- Runtime de inferencia ax-llm: https://github.com/AXERA-TECH/ax-llm
- Binarios precompilados de CI de ax-llm: https://github.com/AXERA-TECH/ax-llm/actions?query=branch%3Aaxllm
- Wiki del M4N-Dock (爱芯派 Pro): https://wiki.sipeed.com/hardware/zh/maixIV/m4ndock/m4ndock.html
- Documentacion de la tarjeta aceleradora M.2 LLM-8850: https://docs.m5stack.com/zh_CN/ai_hardware/LLM-8850_Card
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante para este modelo; las consultas devolvieron paginas sin relacion (foros de caracteres especiales, controladores NVIDIA y guias de videojuegos).
