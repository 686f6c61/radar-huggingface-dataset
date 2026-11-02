# bartowski/K-Ai-Official_MiRAI-4B-GGUF

## Resumen

MiRAI-4B es un modelo de lenguaje de 4.022 millones de parámetros (aproximadamente 4B) desarrollado por K-Ai-Official y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino (QLoRA) sobre una base de la familia Qwen3, orientado a generación de texto conversacional y con un interés particular en el multilingüismo: inglés, indonesio y japonés. El modelo resuelve el problema de disponer de un LLM compacto, desplegable en hardware modesto, que mantenga calidad aceptable en tareas de instrucción en esos tres idiomas.

La ficha que nos ocupa corresponde concretamente a la versión cuantizada en formato GGUF publicada por bartowski, un referente habitual en la distribución de pesos cuantizados para llama.cpp. El repositorio incluye un abanico amplio de cuantizaciones, desde bf16 (8,05 GB) hasta IQ3_M (2,16 GB), lo que permite ejecutar el modelo en GPUs de consumo e incluso en CPU con memoria RAM limitada. El modelo base es `K-Ai-Official/MiRAI-4B` y la cuantización se ha realizado con llama.cpp build b11969 aplicando imatrix.

Es relevante ahora porque ocupa el nicho de los modelos pequeños multilingües con soporte de tool calling y plantilla de chat compatible con el ecosistema Qwen (formato ChatML), lo que facilita su integración en pipelines existentes sin necesidad de infraestructura de gran escala. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3, ajuste QLoRA) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L (y sucesivos Q3/IQ3) |
| Idiomas soportados | en, id, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen3, con 4.022 millones de parámetros. El ajuste se realizó mediante QLoRA (cuantización de bajo rango) sobre el checkpoint base, empleando la librería Unsloth según las etiquetas del repositorio. Los conjuntos de datos de ajuste fino declarados son `yahma/alpaca-cleaned` (inglés), `FreedomIntelligence/alpaca-gpt4-indonesian` y `FreedomIntelligence/alpaca-gpt4-japanese`, lo que explica el sesgo hacia esos tres idiomas y el formato de instrucciones tipo Alpaca/GPT-4 generado.

La cuantización GGUF se ha generado con llama.cpp build b11969 y aplica imatrix (importance matrix), una técnica que calibra la precisión de cada tensor según su impacto en la perplejidad, mejorando la calidad de las cuantizaciones bajas (Q4, Q3, IQ). No se declara decodificación especulativa. La plantilla de chat es ChatML (`<|im_start|>` / `<|im_end|>`), compatible con el formato de herramientas de Qwen, incluyendo definiciones de funciones dentro de etiquetas `<tools>` y llamadas en `<tool_call>`. No se dispone de datos sobre número total de tokens de entrenamiento ni sobre si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Instrucciones generales (formato Alpaca) en inglés, indonesio y japonés.
- Soporte de tool calling / function calling mediante el formato XML de Qwen (`<tools>`, `<tool_call>`).
- Razonamiento multi-paso básico derivado de la base Qwen3 (no se documenta un modo "thinking" explícito en esta ficha).
- Capacidades multilingües limitadas a en, id y ja según la model card.
- No se declara soporte de visión, audio ni otras modalidades (entrada solo texto).

## Casos de uso

- Asistente conversacional en indonesio o japonés: el modelo puede gestionar diálogos multi-turno con la plantilla ChatML, adecuado para productos orientados a esos mercados donde no se requiere un LLM de gran tamaño.
- Integración en agentes con tool calling: la plantilla incluye definiciones de funciones y llamadas estructuradas, lo que permite conectar el modelo a APIs externas (por ejemplo, consulta de precios de acciones) dentro de un bucle de agente.
- Despliegue en local para prototipado: con la cuantización Q4_K_M (2,59 GB) cabe en una GPU de consumo de 6-8 GB de VRAM, lo que lo hace útil para pruebas de concepto sin coste de API.
- Generación de texto en entornos con recursos limitados: la versión IQ3_M (2,16 GB) permite ejecución en CPU con RAM modesta, útil para aplicaciones de escritorio o edge.
- Chatbot de soporte en inglés para equipos pequeños: el ajuste sobre alpaca-cleaned proporciona respuestas de instrucción general razonables para tareas de FAQ y atención básica.
- Traducción asistida entre inglés, indonesio y japonés: aunque no es un modelo de traducción dedicado, su entrenamiento multilingüe permite borradores y adaptaciones de contenido entre esos idiomas.
- Filtrado y clasificación de texto ligero: al ser un modelo pequeño y rápido de ejecutar, puede emplearse en pipelines de preprocesado o etiquetado con prompts controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: bf16 ~8,05 GB de pesos (más overhead de contexto, ~10-12 GB en total); Q8_0 ~4,28 GB; Q6_K ~3,52 GB; Q5_K_M ~3,11 GB; Q4_K_M ~2,59 GB; IQ3_M ~2,16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las cuantizaciones altas con contexto largo; A100/H100 no son necesarias para este tamaño, aunque pueden usarse para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q4_K_M (con contexto moderado) hasta una RTX 4090 con bf16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con la API de OpenAI (el repo declara `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores habría que usar el checkpoint safetensors del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| MiRAI-4B (esta ficha) | 4,02B | no disponible | Apache 2.0 | GGUF, safetensors (base) | Multilingüe en/id/ja, tool calling |
| Qwen3-4B (base de referencia) | ~4B | no disponible | Apache 2.0 | safetensors, GGUF (comunidad) | Base del ajuste; mayor cobertura idiomática general |
| Llama 3.2 3B | 3,2B | 128K (según model card oficial) | Llama 3.2 Community License | GGUF, safetensors | Restricciones de licencia para uso comercial a gran escala |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms of Use | GGUF, safetensors | Licencia con condiciones de uso |

La comparación de rendimiento no puede establecerse con datos porque no se han publicado benchmarks de MiRAI-4B en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste se realizó sobre datasets Alpaca y alpaca-gpt4 en inglés, indonesio y japonés, por lo que el modelo puede reflejar sesgos de esos corpus y degradarse en otros idiomas no cubiertos.
- Riesgo de alucinación: al ser un modelo de 4B ajustado con QLoRA sobre datos sintéticos (alpaca-gpt4), la probabilidad de respuestas inventadas en dominios especializados es elevada; requiere validación en producción.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada en la ficha; el soporte multilingüe se limita a en, id y ja, sin garantías en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el checkpoint base Qwen3 y los datasets empleados no impongan condiciones adicionales.
- Caveats para producción: no se han publicado benchmarks ni evaluaciones de seguridad; el soporte de tool calling depende de que el cliente respete el formato XML de Qwen, y no se declara decodificación especulativa, por lo que la latencia puede ser mayor que en modelos con esa optimización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/K-Ai-Official_MiRAI-4B-GGUF
- Modelo base: https://huggingface.co/K-Ai-Official/MiRAI-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usada: https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset alpaca-gpt4-indonesian: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-indonesian
- Dataset alpaca-gpt4-japanese: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-japanese
