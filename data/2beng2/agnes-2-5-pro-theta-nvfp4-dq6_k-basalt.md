# 2beng2/Agnes-2.5-Pro-Theta-NVFP4-DQ6_K-Basalt

## Resumen

Agnes 2.5 Pro Theta NVFP4-DQ6_K-Basalt es una conversión no oficial del checkpoint BF16 de Agnes 2.5 Pro Theta (publicado por Agnes-AI) a un formato cuantizado propietario denominado Basalt, orientado a la inferencia en GPUs NVIDIA Blackwell. El autor de la conversión es el usuario 2beng2, y el paquete está pensado para ejecutarse con el motor Basalt 0.4.0 en Windows x64, con soporte opcional de decodificación especulativa mediante un drafter MTP (multi-token prediction) basado en Qwen Flash-Next.

El modelo subyacente es un transformer de tipo mixture-of-experts (MoE), según los tags del repositorio, con una tabla de embeddings por capa (PLE, per-layer embedding) que se lee directamente desde SSD. La conversión aplica NVFP4 a los expertos enrutados, Q6_K a las proyecciones densas compatibles y Q8_0 donde es necesario; el pack completo ocupa 121,78 GiB. El contexto configurado en los ejemplos es de 32.768 tokens, ampliable a 131.072 tokens mediante parámetros de arranque.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de cuantización agresiva (4 bits en expertos) de un modelo MoE grande para caber en una única GPU de consumo de gama alta (RTX 5090, 32 GB); por otro, ilustra el ecosistema emergente de motores de inferencia alternativos (Basalt) con gestión de expertos por niveles de VRAM/RAM y perfiles de colocación entrenados. No hay información publicada sobre el modelo base más allá de lo que indica esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con tabla de embeddings por capa (PLE); soporte de drafter MTP externo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, pero el número de expertos activos no se especifica) |
| Longitud de contexto | 32.768 tokens en las configuraciones de ejemplo; hasta 131.072 tokens con `--max-context 133120` |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), Q6_K (proyecciones densas), Q8_0 (tabla PLE y capas que lo requieren), caché KV INT8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | `.basalt` (pack propietario del motor Basalt), más perfil de expertos `.prof` (192 KiB) |

## Arquitectura y entrenamiento

La información disponible corresponde únicamente a la conversión, no al entrenamiento del modelo base. El modelo es un transformer MoE con una innovación estructural destacable: una tabla de embeddings por capa (PLE, per-layer embedding) empaquetada en Q8_0 y leída directamente desde SSD mediante `ple-io: direct`, lo que reduce la presión sobre la VRAM. Los expertos enrutados se cuantizan a NVFP4, mientras que las proyecciones densas compatibles usan Q6_K y el resto Q8_0.

El paquete incluye un drafter MTP externo opcional basado en Qwen Flash-Next, que permite decodificación especulativa (suffix drafting). También se distribuye un perfil de colocación de expertos (`.prof`) que combina un 60 % de ranking de enrutamiento aprendido sobre seis prompts NVFP4 de Theta con un 40 % del ranking stock de Basalt; este perfil ordena los expertos para los niveles de VRAM y RAM y puede cambiarse de forma independiente al pack. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto en modo conversacional y de un solo turno, con ventana de contexto configurable de 32K a 128K tokens.
- Razonamiento multi-paso y tareas de código: los benchmarks del autor incluyen revisión de código Python como caso de prueba.
- Cálculo y tareas de dominio específico: los ejemplos incluyen cálculo de costes de envío y redacción de correos de traspaso.
- Decodificación especulativa opcional mediante drafter MTP (Qwen Flash-Next), con ganancias de velocidad de decodificación medidas.
- Inferencia con expertos repartidos entre VRAM y RAM/SSD gracias al motor Basalt (perfiles de colocación y swaps adaptativos).
- Soporte de caché KV en INT8 para reducir memoria.
- Capacidades de tool calling, agentes o multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Revisión de código en local: el modelo puede procesar prompts de 4K tokens con código Python y generar revisiones de 192 tokens a velocidades de decodificación de 25-43 tok/s en una RTX 5090, lo que lo hace viable para iteraciones de revisión en estación de trabajo sin depender de la nube.
- Asistencia en documentación técnica y correos profesionales: con TTFT de 8-18 s para prompts de 4K tokens, es adecuado para generar borradores de correos de traspaso o documentación interna en un flujo de trabajo por lotes.
- Cálculo y explicación de costes logísticos: el benchmark de "shipping cost calculation" muestra que el modelo maneja tareas aritméticas de dominio con contexto corto, útil para asistentes internos de operaciones.
- Procesamiento de documentos largos en local: con contexto de hasta 128K tokens y TTFT de ~59 s para un prompt completo de 131K, permite resumir o consultar contratos, informes o bases de código extensas en una sola pasada.
- Despliegue en estación de trabajo Windows con GPU Blackwell: el motor Basalt 0.4.0 y las instrucciones PowerShell permiten montar un servidor de inferencia local en `127.0.0.1:8080` sin infraestructura Linux, útil para desarrolladores que trabajan en Windows.
- Experimentación con cuantización NVFP4 y decodificación especulativa: el pack y el perfil de expertos permiten medir el impacto de distintas colocaciones de expertos y de MTP on/off sobre el throughput, como banco de pruebas para investigación en inferencia eficiente.
- Evaluación de motores de inferencia alternativos: sirve para comparar Basalt frente a vLLM, llama.cpp u Ollama en términos de gestión de expertos por niveles y uso de SSD para PLE.

## Benchmarks y rendimiento

Los datos provienen de las mediciones del autor en Windows x64, Ryzen 9 9950X3D, una RTX 5090 (32 GB VRAM), 32 GB de RAM y SSD, con caché KV INT8 y PLE en SSD.

Tres peticiones secuenciales de 4K tokens de entrada y 192 tokens generados, con contexto límite de 32K:

| Petición | Prefill off/on (tok/s) | Decode off/on (tok/s) | TTFT off/on (s) | Total off/on (s) |
|---|---:|---:|---:|---:|
| Revisión de código Python | 241,98 / 224,00 | 36,91 / 42,99 | 17,01 / 18,38 | 22,13 / 22,76 |
| Correo de traspaso | 466,27 / 476,58 | 29,70 / 34,80 | 8,87 / 8,68 | 15,26 / 14,12 |
| Cálculo de coste de envío | 519,68 / 486,55 | 17,37 / 23,28 | 8,00 / 8,53 | 18,95 / 16,68 |
| **Agregado / media** | **365,78 / 348,12** | **25,36 / 31,59** | 11,30 / 11,86 | 18,78 / 17,85 |

La decodificación agregada fue un 24,6 % más rápida con el drafter MTP. El conjunto de trabajo máximo del proceso fue de 9,81 GiB sin drafting y 9,96 GiB con drafting.

Una petición de 128K tokens con MTP (`spec 6`, 256 tokens generados):

| Perfil de expertos | Prefill | Decode | TTFT | Working set máximo |
|---|---:|---:|---:|---:|
| Basalt stock | 2.175 tok/s | 27,26 tok/s | 60,44 s | 9,71 GiB |
| Perfil Q4 de Theta aplicado a NVFP4 | 2.230 tok/s | 33,80 tok/s | 58,90 s | 10,21 GiB |
| Blend NVFP4 de Theta incluido | 2.227 tok/s | **39,27 tok/s** | **59,44 s** | 11,28 GiB |

El blend incluido decodificó un 44,0 % más rápido que el stock y un 16,2 % más rápido que el perfil Q4 reutilizado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el pack completo ocupa 121,78 GiB, pero la inferencia usa expertos por niveles; en la RTX 5090 de 32 GB el conjunto de trabajo del proceso se mantuvo entre 9,71 y 11,28 GiB, con caché de 8.192 expertos (21.602 MiB al arranque).
- GPU recomendadas: NVIDIA Blackwell (RTX 5090 validada; otras GPUs Blackwell soportadas según el motor Basalt). Se requiere runtime CUDA 13 en el `PATH`.
- Cabe en GPU de consumo: sí, en una RTX 5090 de 32 GB, con el resto de expertos y la tabla PLE servidos desde RAM y SSD.
- Almacenamiento: SSD obligatorio para el pack y para la lectura directa de la tabla PLE (`ple-io: direct`).
- RAM del sistema: 32 GB en el sistema de pruebas; el modelo usa niveles de RAM además de VRAM.
- Opciones de despliegue: motor Basalt 0.4.0 (Windows x64; existe build compatible para Linux). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato `.basalt`.
- Latencia y throughput: TTFT de 8-18 s para prompts de 4K; 59 s para 131K. Decodificación de 17-43 tok/s en 4K y 27-39 tok/s en 128K según perfil. Prefill de 224-520 tok/s en 4K y ~2.200 tok/s en 128K.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría, y el formato `.basalt` y el motor propietario dificultan una comparación directa con despliegues estándar de MoE cuantizados.

## Limitaciones y advertencias

- Conversión no oficial: el autor no es Agnes-AI; el pack puede diferir del comportamiento del checkpoint BF16 original.
- Licencia compuesta (`apache-2.0-and-qwen-community-1.0`) etiquetada como `other`: es necesario revisar ambas licencias antes de uso comercial, especialmente la Qwen Community License por el drafter MTP.
- Dependencia de un motor propietario (Basalt) y de un formato de pesos no estándar (`.basalt`): no es portable a vLLM, llama.cpp u Ollama sin reconversión.
- Requiere GPU NVIDIA Blackwell y CUDA 13; no funciona en GPUs Ampere o Ada sin soporte confirmado.
- Las mediciones son de un único sistema (RTX 5090, Windows, un request a la vez); el throughput en producción concurrente no está documentado.
- El uso de perfiles de expertos altera el redondeo en coma flotante y puede cambiar las secuencias generadas, según advierte el propio autor.
- El rendimiento depende de la frecuencia de uso de los expertos residentes; las ganancias del perfil no son universales.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2beng2/Agnes-2.5-Pro-Theta-NVFP4-DQ6_K-Basalt
- Modelo base (BF16): https://huggingface.co/Agnes-AI/Agnes-2.5-Pro-Theta/tree/6c06a374dd7f0b0ce254544aebadcf0a4f992b7c
- Basalt 0.4.0 (release): https://github.com/jesdga95/basalt/releases/tag/v0.4.0
- Requisitos de plataforma de Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/platforms.md#release-archives
- Referencia de configuración de Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/configuration/index.md
- Niveles adaptativos de expertos en Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/configuration/adaptive.md
