# 2beng2/Agnes-2.5-Pro-Theta-NVFP4-DQ6_K-Basalt

## Resumen

Agnes 2.5 Pro Theta NVFP4-DQ6_K-Basalt es una conversión no oficial, publicada por el usuario 2beng2, del checkpoint BF16 del modelo Agnes 2.5 Pro Theta (desarrollado por Agnes-AI) a un formato cuantizado propietario orientado al motor de inferencia Basalt. El pack emplea NVFP4 para los expertos enrutados de la arquitectura MoE, Q6_K para las proyecciones densas compatibles y Q8_0 donde el formato lo requiere, con el objetivo de reducir el peso en disco y VRAM sin renunciar a la calidad del modelo original.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidades de generación de texto, e incorpora un módulo MTP (multi-token prediction) que actúa como drafter especulativo opcional, en este caso basado en Qwen Flash-Next. La conversión está pensada para GPUs NVIDIA Blackwell (por ejemplo, RTX 5090) y para el runtime Basalt 0.4.0, con soporte de caché KV INT8, tablas de embedding por capa (PLE) respaldadas en SSD y perfiles de colocación de expertos entre VRAM y RAM.

La relevancia de esta ficha radica en que documenta una de las pocas conversiones públicas de un modelo MoE grande a NVFP4 para hardware consumer Blackwell, con benchmarks medidos en Windows sobre una única RTX 5090 de 32 GB. No obstante, se trata de un artefacto de cuantización de terceros, no del modelo oficial, y su licencia combina Apache 2.0 con la Qwen Community License 1.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con modulo MTP opcional para decodificacion especulativa; conversión NVFP4-DQ6_K para el motor Basalt |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens por defecto en las configs incluidas; soporta hasta 131.072 tokens con `--max-context 133120` |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), Q6_K (proyecciones densas), Q8_0 (tabla PLE y donde se requiere); KV cache INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 y Qwen Community License 1.0 (`apache-2.0-and-qwen-community-1.0`) |
| Formato de pesos | `.basalt` (pack propietario del runtime Basalt); tamano del repo 130,8 GB; archivo principal 121,78 GiB |

## Arquitectura y entrenamiento

El modelo base Agnes 2.5 Pro Theta es un transformer de mezcla de expertos (MoE) según indican las etiquetas del repositorio. La conversión preserva la estructura del checkpoint BF16 original y aplica un esquema de cuantización mixta: NVFP4 para los expertos enrutados (la mayor parte del peso), Q6_K para las proyecciones densas compatibles y Q8_0 para la tabla de embedding por capa (PLE), que se lee directamente desde SSD mediante `ple-io: direct`. El pack incluye además un drafter MTP externo opcional basado en Qwen Flash-Next, que permite decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La innovación técnica destacable de esta conversión es el perfil de colocación de expertos (`theta-nvfp4-blend.prof`), que combina un 60 % de ranking de enrutamiento aprendido sobre seis prompts NVFP4 de Theta con un 40 % del ranking estándar de Basalt, y que se usa para distribuir expertos entre los niveles de VRAM y RAM. El motor Basalt permite además swaps adaptativos de expertos entre niveles, lo que puede alterar el redondeo en coma flotante y, por tanto, las secuencias generadas.

## Capacidades

- Generación de texto autoregresiva en modo chat y completado, con ventana de contexto configurable de 32K a 128K tokens.
- Decodificación especulativa mediante el drafter MTP opcional, con ganancias medidas de decodificación de hasta el 44 % en una petición de 128K.
- Soporte de caché KV INT8 para reducir el consumo de VRAM en contextos largos.
- Gestión de memoria por niveles (VRAM, RAM y SSD) para expertos MoE, con perfiles de colocación ajustables.
- Capacidad de ejecución con MTP desactivado (`--spec 0`) para comparar rendimiento o reducir consumo.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas del modelo base.

## Casos de uso

- Revisión de código en local: con 4.096 tokens de entrada y 192 de salida, el modelo procesa prompts de revisión de código Python a unas 225 tok/s de prefill y 43 tok/s de decodificación con MTP en una RTX 5090, adecuado para asistencia de desarrollo en estación de trabajo.
- Redacción de correos y documentos corporativos: las pruebas de "handover email" muestran 476 tok/s de prefill y 34,8 tok/s de decodificación, lo que permite generar borradores multi-párrafo en pocos segundos.
- Cálculos y razonamiento numérico ligero: el caso de "shipping cost calculation" alcanza 486 tok/s de prefill y 23 tok/s de decodificación, útil para asistentes de cálculo con contexto corto.
- Análisis de documentos largos: con la configuración de 131.072 tokens y `--prefill 32768`, el modelo puede procesar contratos, informes o bases de código extensas en una sola petición, con TTFT de unos 59 segundos y decodificación de hasta 39 tok/s.
- Despliegue en hardware consumer Blackwell: al caber en una RTX 5090 de 32 GB con un working set de proceso de entre 9,7 y 11,3 GiB, es viable para prototipos y demos en estaciones Windows sin acceso a clústeres.
- Evaluación comparativa de cuantizaciones: los perfiles de expertos incluidos permiten medir el impacto de distintas políticas de colocación (stock, Q4 entrenado, blend NVFP4) sobre el throughput y la calidad de las secuencias generadas.
- Servicio local de inferencia: el runtime Basalt expone un servidor HTTP en `127.0.0.1:8080`, lo que facilita integrarlo en herramientas internas o pipelines de prueba.

## Benchmarks y rendimiento

Mediciones del autor en Windows x64, Ryzen 9 9950X3D, una RTX 5090 (32 GB), 32 GB de RAM y SSD, con KV INT8, PLE en SSD, una petición a la vez y caché de 8.192 expertos (21.602 MiB al arranque).

Tres peticiones secuenciales de 4.096 tokens de entrada y 192 de salida, límite de contexto 32K:

| Peticion | Prefill off/on (tok/s) | Decode off/on (tok/s) | TTFT off/on (s) | Total off/on (s) |
|---|---:|---:|---:|---:|
| Revision de codigo Python | 241,98 / 224,00 | 36,91 / 42,99 | 17,01 / 18,38 | 22,13 / 22,76 |
| Correo de traspaso | 466,27 / 476,58 | 29,70 / 34,80 | 8,87 / 8,68 | 15,26 / 14,12 |
| Calculo de coste de envio | 519,68 / 486,55 | 17,37 / 23,28 | 8,00 / 8,53 | 18,95 / 16,68 |
| **Agregado / media** | **365,78 / 348,12** | **25,36 / 31,59** | 11,30 / 11,86 | 18,78 / 17,85 |

La decodificación agregada fue un 24,6 % más rápida con el drafter, con secuencias de salida idénticas. Working set máximo del proceso: 9,81 GiB sin drafting y 9,96 GiB con drafting.

Una petición de 128K tokens de entrada y 256 de salida con MTP (`spec 6`):

| Perfil de expertos | Prefill | Decode | TTFT | Working set maximo |
|---|---:|---:|---:|---:|
| Basalt stock | 2.175 tok/s | 27,26 tok/s | 60,44 s | 9,71 GiB |
| Perfil Q4 aplicado a NVFP4 | 2.230 tok/s | 33,80 tok/s | 58,90 s | 10,21 GiB |
| Blend NVFP4 incluido | 2.227 tok/s | **39,27 tok/s** | **59,44 s** | 11,28 GiB |

El blend incluido decodificó un 44,0 % más rápido que stock y un 16,2 % más rápido que el perfil Q4. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el pack ocupa 121,78 GiB en disco, pero el working set del proceso medido es de 9,7 a 11,3 GiB gracias a la colocación por niveles y a la lectura de expertos desde SSD; se recomienda una GPU con al menos 24-32 GB para margen.
- GPU recomendadas: NVIDIA Blackwell (RTX 5090 de 32 GB es la configuración medida); se requiere una GPU Blackwell compatible con NVFP4 y CUDA 13 en el `PATH`.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB) según las mediciones del autor; no se dispone de datos para otras consumer.
- Almacenamiento: SSD obligatorio para el pack y para la tabla PLE (`ple-io: direct`); el autor indica colocar el pack en un SSD.
- Memoria del sistema: 32 GB de RAM en el sistema de prueba.
- Opciones de despliegue: Basalt 0.4.0 (archivo Windows x64; existe build Linux compatible), con servidor HTTP integrado en `127.0.0.1:8080`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 8 a 18 s en peticiones de 4K y de unos 59 s en 128K; decodificación de 17 a 43 tok/s en 4K y de 27 a 39 tok/s en 128K según perfil y MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes 2.5 Pro Theta NVFP4-DQ6_K-Basalt (esta ficha) | no disponible | 32K por defecto, 128K maximo | `.basalt`, NVFP4/Q6_K/Q8_0 | Apache 2.0 + Qwen Community 1.0 | Hugging Face, 177 descargas |
| Agnes 2.5 Pro Theta (BF16 original) | no disponible | no disponible | BF16 (safetensors presumiblemente) | no disponible | Hugging Face (Agnes-AI) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos de la misma categoría (MoE cuantizados para Blackwell consumer) para establecer una comparativa rigurosa de rendimiento.

## Limitaciones y advertencias

- Conversión no oficial: el autor la describe como "unofficial"; no está respaldada por Agnes-AI y puede divergir del comportamiento del checkpoint BF16.
- Licencia mixta: Apache 2.0 y Qwen Community License 1.0; esta última impone condiciones adicionales para uso comercial que deben revisarse antes de desplegar en producción.
- Dependencia de hardware y software muy específicos: requiere GPU NVIDIA Blackwell, CUDA 13 y el runtime Basalt 0.4.0; no es portable a vLLM, llama.cpp u otros motores sin reconversión.
- Dependencia de SSD: la tabla PLE y los expertos se leen desde disco, por lo que un SSD lento degrada gravemente la latencia.
- Las secuencias generadas pueden variar según el perfil de expertos y los swaps adaptativos, por el distinto redondeo en coma flotante.
- Riesgo de alucinación y sesgos: no se dispone de información sobre evaluaciones de sesgo o tasas de alucinación del modelo base.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Contexto por defecto de 32K; usar 128K exige flags adicionales y eleva el TTFT a unos 59 s.
- Los benchmarks son del autor, en Windows, con una sola petición concurrente y sin reutilización de tokens de prompt; no reflejan cargas multiusuario.

## Enlaces

- Hugging Face: https://huggingface.co/2beng2/Agnes-2.5-Pro-Theta-NVFP4-DQ6_K-Basalt
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-2.5-Pro-Theta
- Checkpoint BF16 de referencia: https://huggingface.co/Agnes-AI/Agnes-2.5-Pro-Theta/tree/6c06a374dd7f0b0ce254544aebadcf0a4f992b7c
- Basalt 0.4.0 (release): https://github.com/jesdga95/basalt/releases/tag/v0.4.0
- Requisitos de plataforma de Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/platforms.md#release-archives
- Referencia de configuración de Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/configuration/index.md
- Nivel adaptativo de expertos de Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/configuration/adaptive.md
