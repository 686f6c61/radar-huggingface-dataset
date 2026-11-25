# positron-ai/Llama-3.1-8B-Instruct

## Resumen

`positron-ai/Llama-3.1-8B-Instruct` es una redistribución sin modificaciones de `meta-llama/Llama-3.1-8B-Instruct`, publicada por Positron AI. No se trata de un modelo nuevo ni de un fine-tuning: los pesos, el tokenizador y los ficheros de configuración son idénticos byte a byte al commit `0e9e39f249a16976918f6564b8830bc894c89659` del repositorio original de Meta, y el autor incluye los SHA256 de los cuatro shards de safetensors como prueba de procedencia. La única diferencia respecto al upstream es la adición de un README y un fichero `NOTICE`.

El propósito declarado es servir como fuente fijada (pinned source) para las cuantizaciones GPTQ que Positron AI publica bajo su organización. Por tanto, el interés práctico del repositorio es de trazabilidad y reproducibilidad, no de capacidades nuevas: cualquier evaluación de rendimiento debe remitirse a la model card original de Meta.

El modelo subyacente es un transformer decoder-only denso de 8.030.261.248 parámetros (aproximadamente 8B), con 128K tokens de contexto nominal en la familia Llama 3.1, entrenado con instrucciones y alineado mediante RLHF. Es relevante ahora como snapshot verificable para pipelines de cuantización y despliegue que necesitan una referencia inmutable del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Llama 3.1 declara 128K en la model card original de Meta, no verificable en este repositorio) |
| Tipos de cuantizacion | el repositorio contiene pesos en safetensors sin cuantizar; el autor publica variantes GPTQ en la organizacion `positron-ai` (no detalladas aqui) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (4 shards, repo de 16,1 GB) |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre arquitectura interna, datos de entrenamiento ni proceso de alineación; remite explícitamente a la model card de `meta-llama/Llama-3.1-8B-Instruct`. Lo que sí documenta con precisión es la integridad del artefacto: cuatro ficheros safetensors con hashes SHA256 publicados, tokenizador y configuración sin alterar, y un commit upstream concreto como referencia.

La innovación técnica relevante aquí no está en el modelo sino en la práctica de publicación: un snapshot inmutable con verificación criptográfica, pensado para que las cuantizaciones derivadas (GPTQ) puedan auditarse contra una fuente exacta. No se han añadido capas, vocabulario ni ajustes posteriores al entrenamiento.

## Capacidades

- Generación de texto conversacional con formato de instrucciones (pipeline `text-generation`, tag `conversational`).
- Razonamiento general y respuesta a preguntas en los ocho idiomas declarados: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Generación de código y tareas de matemáticas básicas, heredadas del modelo base de Meta (no documentadas en este repositorio).
- Compatibilidad con Text Generation Inference (`text-generation-inference` en los tags) y con endpoints compatibles (`endpoints_compatible`).
- Carga directa con la librería `transformers`.
- No se documentan en este repositorio capacidades de visión, audio, tool calling explícito ni modo de razonamiento extendido; deben consultarse en la model card upstream.

## Casos de uso

- Cuantización reproducible: usar este snapshot como entrada fija para generar variantes GPTQ/AWQ y comparar resultados entre ejecuciones sin riesgo de que el upstream cambie bajo los pies.
- Auditoría de cadena de suministro: verificar los SHA256 de los shards antes de desplegar en producción, de modo que se pueda demostrar que los pesos desplegados corresponden exactamente al modelo publicado por Meta.
- Despliegue conversacional en español: al estar el español entre los idiomas declarados, sirve para asistentes de chat multi-turno en entornos donde se requiere una licencia Llama 3.1 explícita.
- Servicio de inferencia con TGI: el etiquetado `text-generation-inference` permite levantar un endpoint compatible con la API de Hugging Face sin adaptadores adicionales.
- Base para fine-tuning supervisado: al ser pesos sin modificar, es un punto de partida limpio para ajustes posteriores con LoRA o SFT completo, sin arrastrar cambios de terceros.
- Réplica de evaluaciones: reproducir benchmarks publicados por Meta sobre un artefacto con hashes conocidos, útil en informes técnicos y comparativas internas.
- Entornos con requisitos de licencia estrictos: la inclusión de `LICENSE`, `USE_POLICY.md` y `NOTICE` en el propio repositorio facilita el cumplimiento documental en despliegues corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio remite a la model card de `meta-llama/Llama-3.1-8B-Instruct` para evaluaciones y guías de uso responsable.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de caché KV; en la práctica 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ): en torno a 5-6 GB de pesos, con margen adicional para contexto.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S; para 4 bits cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB).
- En consumer GPU: sí, en 4 bits cabe en tarjetas de 8 GB con contexto limitado; en 8 bits requiere 12 GB o más.
- Opciones de despliegue: `transformers`, Text Generation Inference (etiqueta oficial del repo), y en principio vLLM, llama.cpp u Ollama previa conversión a GGUF, aunque estas dos últimas no están documentadas en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| positron-ai/Llama-3.1-8B-Instruct | 8,03B | no disponible en este repo (familia 3.1: 128K) | llama3.1 | Hugging Face, 282 descargas | Redistribución sin modificar, con hashes |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K (según model card de Meta) | llama3.1 | Hugging Face, upstream oficial | Fuente original, con documentación completa |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32K | Apache 2.0 | Hugging Face | Alternativa permisiva de tamaño similar |
| Qwen2.5-7B-Instruct | ~7,6B | 128K | Apache 2.0 (la mayoría de variantes) | Hugging Face | Alternativa con licencia más laxa |

La diferencia clave frente al upstream de Meta no es de rendimiento sino de garantías de reproducibilidad; frente a Mistral y Qwen, la licencia Llama 3.1 es más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- El repositorio no documenta sesgos, tasas de alucinación ni evaluaciones de seguridad; esa información solo está en la model card de Meta.
- La licencia Llama 3.1 Community License impone condiciones adicionales para uso comercial a gran escala y obliga a cumplir la Acceptable Use Policy de Meta; no es una licencia de código abierto permisiva.
- Al ser una redistribución, cualquier corrección o actualización del modelo debe venir del upstream; este snapshot está congelado en un commit concreto y no recibirá parches.
- Los pesos están en safetensors sin cuantizar: el repositorio de 16,1 GB no es adecuado para despliegue directo en GPU de consumo sin cuantización previa.
- El soporte multilingüe está declarado para ocho idiomas, pero no se aportan métricas por idioma; el rendimiento en español, hindi o tailandés no está verificado en este repositorio.
- La fecha de creación del repositorio (2026-08-25) y la de actualización (2026-11-17) figuran en los metadatos; conviene contrastarlas con el commit upstream antes de usarlo como referencia en producción.
- Solo 282 descargas y 0 likes: no hay evidencia de adopción amplia que respalde la calidad del snapshot más allá de los hashes publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/positron-ai/Llama-3.1-8B-Instruct
- Modelo upstream de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Commit upstream referenciado: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/tree/0e9e39f249a16976918f6564b8830bc894c89659
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
