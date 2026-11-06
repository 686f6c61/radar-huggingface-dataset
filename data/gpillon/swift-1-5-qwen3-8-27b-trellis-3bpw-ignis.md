# gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis

## Resumen

Swift 1.5 (Qwen3.8-27B) es un ajuste fino posterior al entrenamiento de Qwen3.8-27B desarrollado por UkisAI. Este repositorio concreto, publicado por el usuario gpillon, no contiene los pesos originales en BF16, sino una cuantización EXL3 de 3 bits con formato trellis del cuerpo y de la cabeza de salida del modelo, empaquetada específicamente para el servidor de inferencia ignis. El objetivo es hacer viable un modelo de 27.000 millones de parámetros en tarjetas Blackwell de 16 GB de VRAM, como la RTX 5060 Ti 16 GB, la RTX 5070 Ti o la RTX 5080.

La relevancia de esta ficha radica en que ilustra una tendencia práctica: la combinación de cuantización agresiva (3 bits por peso), decodificación especulativa con un drafter DFlash2 y un servidor especializado para exprimir hardware de consumo. No se trata de un modelo nuevo en cuanto a capacidades cognitivas, sino de un artefacto de despliegue que traslada las capacidades del modelo base a un segmento de hardware mucho más económico.

El repositorio ocupa 13,4 GB y emplea la librería ignis como formato de carga. La licencia no es Apache-2.0: los pesos de UkisAI quedan bajo la Swift Open License v1.0, con un umbral de facturación anual de un millón de dólares para uso comercial, mientras que los componentes heredados de Qwen3.8-27B permanecen bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet y atencion (hereda la de Qwen3.8-27B); cuerpo y cabeza de salida en EXL3 trellis de 3 bits |
| Parametros totales | 27.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (perfil `rtx50-16gb` de ignis); 253.440 tokens en las mediciones de rendimiento |
| Tipos de cuantizacion | EXL3 3-bit trellis (cuerpo y cabeza de salida); embedding de tokens a 8 bits; resto de componentes en el formato del artefacto NVFP4 (normas, Gated DeltaNet, DFlash2, MTP, torre de vision) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (componentes UkisAI); Apache-2.0 para las partes heredadas de Qwen3.8-27B |
| Formato de pesos | ignis (EXL3 trellis), repositorio de 13,4 GB |

## Arquitectura y entrenamiento

El modelo base es un post-entrenamiento de Qwen3.8-27B, por lo que hereda la arquitectura del transformer de Qwen, que en este caso incluye capas Gated DeltaNet junto con mecanismos de atención estándar. Según la model card, el artefacto conserva del modelo NVFP4 de Swift "byte for byte" el embedding de tokens en 8 bits, las normas, los parámetros de Gated DeltaNet, el drafter DFlash2 y su cabeza de borrador, la capa MTP (multi-token prediction), la torre de visión, el tokenizer y la plantilla de chat.

La cuantización la realizó el propio proyecto ignis con exllamav3 1.5.3 sobre los pesos BF16 de Swift, aplicando anchos de bits por matriz y los datos de calibración del cuant `SC_3.00bpw_H4` del modelo base de 27B. La innovación técnica destacable no está en el entrenamiento sino en el despliegue: decodificación especulativa mediante DFlash2 con 7 tokens de borrador, dos carriles de decodificación y reutilización de prompts entre peticiones. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el ajuste de UkisAI.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del ajuste Swift 1.5 sobre Qwen3.8-27B.
- Procesamiento de visión: la torre de visión se incluye en el paquete y se activa por defecto con hasta 4.096 tokens de visión por imagen (desactivable con `--vision-enabled false`).
- Decodificación especulativa con el drafter DFlash2 (7 tokens de borrador) y capa MTP para acelerar la generación.
- Servicio compatible con la API de OpenAI a través de ignis, lo que facilita la integración con clientes existentes.
- Soporte de cargas de trabajo de agentes de código: un agente principal y varios subagentes sobre la misma tarjeta.
- Guarda de bucles de razonamiento, Playground y métricas Prometheus integrados en el binario del servidor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Agentes de código en estación de trabajo: el perfil por defecto de ignis está diseñado para "un agente principal más unos pocos subagentes en la misma tarjeta", de modo que un desarrollador con una RTX 5060 Ti 16 GB puede ejecutar localmente un asistente de programación con contexto de 262.144 tokens sin depender de la nube.
- Asistencia conversacional de contexto largo: con 253.440 tokens medidos a 228,7 tok/s en un solo carril, el modelo puede mantener conversaciones multi-turno sobre documentos extensos o bases de código completas.
- Procesamiento de documentos con imágenes: la torre de visión permite extraer información de capturas, diagramas o páginas escaneadas, con hasta 4.096 tokens por imagen.
- Automatización por lotes en hardware de consumo: la reutilización de prompts entre peticiones y los dos carriles de decodificación permiten agregar 661,1 tok/s a 8.192 tokens de contexto, adecuado para tareas de generación masiva en una sola GPU.
- Prototipado e investigación: al ser un artefacto de 13,4 GB que cabe en 16 GB de VRAM, sirve para experimentar con un modelo de 27B cuantizado a 3 bits sin adquirir hardware de centro de datos.
- Evaluación de cuantizaciones EXL3 trellis: investigadores interesados en el impacto de 3 bits por peso sobre un modelo de 27B pueden comparar este artefacto con la variante NVFP4 para 32 GB del mismo modelo base.
- Despliegue de servicio interno compatible con OpenAI: el servidor ignis expone endpoints compatibles, lo que permite sustituir un backend remoto por este modelo local en herramientas que ya hablan el protocolo de OpenAI.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Sí incluye mediciones de throughput de decodificación en una RTX 5090 limitada a un presupuesto de 16 GiB, con dos carriles y DFlash2 con 7 tokens de borrador:

| Contexto | Un carril | Dos carriles (agregado) |
|---|---:|---:|
| 8.192 | 410,7 tok/s | 661,1 tok/s |
| 65.536 | 339,8 tok/s | 490,7 tok/s |
| 253.440 | 228,7 tok/s | 284,4 tok/s |

El autor advierte explícitamente que estas cifras no se midieron en una tarjeta de 16 GB. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM: el artefacto está pensado para tarjetas de 16 GB (RTX 5060 Ti 16 GB, RTX 5070 Ti, RTX 5080). El repositorio pesa 13,4 GB, aunque el perfil de ignis coloca la torre de visión y el pool de embedding en RAM de host fijada (pinned).
- GPUs recomendadas: RTX 5060 Ti 16 GB, RTX 5070 Ti y RTX 5080 (arquitectura Blackwell). Las mediciones de throughput se hicieron en una RTX 5090 restringida a 16 GiB.
- Cabe en GPU de consumo: sí, en las tarjetas Blackwell de 16 GB citadas. No se indica compatibilidad con GPUs de generaciones anteriores.
- Despliegue: exclusivamente mediante ignis (versión 0.9.6 o superior), disponible como `.zip` para Windows, `.tar.gz` para Linux e imagen de contenedor `linux/amd64`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Perfil por defecto: 262.144 tokens de contexto, dos carriles de decodificación, DFlash2 con 7 tokens de borrador y visión activada a 4.096 tokens por imagen.
- Latencia y throughput: ver tabla de benchmarks; 410,7 tok/s en un carril a 8.192 tokens de contexto en una RTX 5090 limitada a 16 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis | 27B | 262.144 | EXL3 3-bit trellis | Swift Open License v1.0 | 16 GB Blackwell |
| gpillon/Swift-1.5-Qwen3.8-27B-nvfp4-ignis | 27B | no disponible | NVFP4 | Swift Open License v1.0 | 32 GB y superiores |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27B | no disponible | BF16 | Swift Open License v1.0 | no disponible |
| Qwen/Qwen3.8-27B (base original) | 27B | no disponible | BF16 | Apache-2.0 | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores de otros desarrolladores.

## Limitaciones y advertencias

- La licencia Swift Open License v1.0 no permite uso comercial a organizaciones cuya facturación bruta anual, junto con todas las entidades controladas o bajo control común, alcance o supere 1.000.000 USD en el último ejercicio fiscal cerrado; ese uso requiere una licencia escrita separada (Swift Enterprise License).
- Las organizaciones sin ánimo de lucro cualificadas (501(c)(3) o equivalente) están exentas del umbral para uso no comercial o de investigación.
- Los componentes heredados de Qwen3.8-27B permanecen bajo Apache-2.0, y la limitación comercial se aplica solo a la contribución de UkisAI y a lo que la contenga o derive de ella.
- La cuantización a 3 bits por peso puede degradar la calidad respecto a los pesos BF16; no se han publicado evaluaciones de calidad que cuantifiquen esa pérdida.
- El modelo depende exclusivamente del servidor ignis: no hay pesos en safetensors ni GGUF estándar, lo que limita la portabilidad a otros motores de inferencia.
- Las cifras de throughput se midieron en una RTX 5090 restringida a 16 GiB, no en las tarjetas de 16 GB objetivo, por lo que el rendimiento real en una RTX 5060 Ti puede ser inferior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del ajuste Swift 1.5.
- El autor advierte de que, si el escritorio ya ocupa parte de la memoria de la tarjeta, el perfil puede necesitar ajustes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NVFP4 para 32 GB: https://huggingface.co/gpillon/Swift-1.5-Qwen3.8-27B-nvfp4-ignis
- Repositorio de ignis: https://github.com/gpillon/ignis
- Última release de ignis: https://github.com/gpillon/ignis/releases/latest
- Guía para agentes de IA: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Guía completa en Markdown: https://gpillon.github.io/ignis/llms.txt
- Contacto de UkisAI para licencia enterprise: https://ukisai.com/contact
