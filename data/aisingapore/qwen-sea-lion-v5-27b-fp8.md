# aisingapore/Qwen-SEA-LION-v5-27B-FP8

## Resumen

Qwen-SEA-LION-v5-27B-FP8 es la version cuantizada a FP8 del modelo Qwen-SEA-LION-v5-27B, desarrollado por el pilar de productos de IA de AI Singapore (AISG) y financiado por la National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una coleccion de modelos disenada especificamente para cubrir las lenguas del sudeste asiatico, una region historicamente infrarrepresentada en los grandes modelos genericos. El modelo parte de la arquitectura Qwen3.5 (tag `qwen3_5`) y anade un encoder de vision, por lo que su pipeline es `image-text-to-text`.

Se trata de un modelo causal con 27.781.427.952 parametros totales (aproximadamente 27,8 mil millones) y una longitud de contexto de 262.144 tokens. La variante FP8 reduce el peso de los pesos de 55,6 GB (BF16) a 31,2 GB, manteniendo el encoder de vision y la cabeza de prediccion multi-token (MTP) en BF16. Esto lo hace mucho mas viable para despliegue en infraestructura con VRAM limitada sin renunciar a la ventana de contexto completa.

Su relevancia actual radica en dos factores: por un lado, ofrece cobertura nativa de nueve idiomas (birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita) con licencia MIT, lo que elimina fricciones para uso comercial; por otro, la cuantizacion FP8 con formato block-wise compatible con las releases oficiales de Qwen facilita su servicio en vLLM y SGLang con parsers de razonamiento y tool calling ya integrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision (base Qwen3.5) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (block-wise, capas lineales); encoder de vision y cabeza MTP en BF16. Existen variantes INT4 y GGUF del modelo base |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de vision, construido sobre la arquitectura Qwen3.5. La cuantizacion se realizo con llm-compressor y aplica FP8 en formato block-wise a la mayoria de las capas lineales, replicando el esquema de las releases oficiales FP8 de Qwen; el resto de pesos, incluido el encoder de vision y la cabeza de prediccion multi-token (MTP), permanece en BF16. El tokenizer, la plantilla de chat y los valores por defecto de muestreo no se modifican respecto al modelo base.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. La model card remite a la ficha de aisingapore/Qwen-SEA-LION-v5-27B para los detalles del modelo original. La innovacion tecnica destacable de esta variante es la cuantizacion FP8 con compresion a la mitad del peso (31,2 GB frente a 55,6 GB) manteniendo la ventana de 262.144 tokens, ademas de la presencia de una cabeza MTP que sugiere soporte de decodificacion especulativa en el modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activado por defecto y desactivable mediante `enable_thinking: False`.
- Procesamiento de imagen y video como entrada (pipeline `image-text-to-text`), segun la ficha de Qwen3.8-27B referenciada.
- Tool calling / function calling nativo, con parser `qwen3_coder` en vLLM y SGLang.
- Soporte de agentes y razonamiento multi-paso gracias al modo thinking y al parser de razonamiento `qwen3`.
- Capacidades multilingues nativas en nueve idiomas: birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Ajuste de esfuerzo de razonamiento (reasoning effort) y pensamiento preservado, segun la documentacion de Qwen3.8-27B.
- Compatibilidad con endpoints OpenAI a traves de vLLM y SGLang.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes, vietnamita o filipino con una ventana de 262.144 tokens, lo que permite mantener historial extenso y documentacion de producto en el mismo contexto sin truncar.
- Logistica y comercio transfronterizo: como muestra la propia model card, resolver consultas sobre documentacion de exportacion, tiempos de transito y riesgos de cadena de frio entre paises de la ASEAN, con salida estructurada en puntos y en el idioma del usuario.
- Procesamiento de documentos con vision: extraer datos de facturas, albaranes o formularios escaneados en lenguas locales combinando el encoder de vision con el contexto largo para adjuntar multiples paginas en una sola peticion.
- Agentes con tool calling: integrar el modelo en un orquestador que consulte APIs de clima, logistica o banca mediante function calling, usando el parser `qwen3_coder` en vLLM o SGLang para obtener llamadas estructuradas.
- Generacion y revision de codigo en entornos con mezcla de ingles y lenguas locales: el modo thinking y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para revision automatica de parches y generacion de tests.
- Analisis de contenido audiovisual regional: transcripcion asistida y descripcion de video en tailandes, vietnamita o indonesio para moderacion o catalogacion de archivos multimedia.
- Investigacion linguistica y preservacion de lenguas: evaluacion y generacion de texto en birmano y tamil, dos idiomas con menos recursos, gracias a la cobertura nativa del modelo.
- Despliegue en infraestructura con VRAM limitada: la variante FP8 permite servir el modelo en una unica GPU de 40-48 GB con la ventana completa, algo inviable con el BF16 de 55,6 GB en ese mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 31,2 GB solo para pesos, mas overhead de KV cache y activaciones; con contexto completo de 262.144 tokens el consumo de KV cache puede ser muy elevado y requerira GPUs de mayor capacidad o tecnicas de paginacion.
- GPU recomendadas: H100 (80 GB), A100 (80 GB) y L40S (48 GB) para contexto largo; en GPUs de 40-48 GB puede servirse con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) solo con cuantizaciones mas agresivas (INT4 o GGUF del modelo base), no en FP8 con contexto completo.
- Opciones de despliegue: vLLM (`vllm serve` con `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`), SGLang (`sglang serve` con los mismos parsers) y, para las variantes alternativas, llama.cpp mediante el repositorio GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-27B-FP8 | ~27,8 B | 262.144 | MIT | safetensors FP8 | Variante cuantizada, 31,2 GB |
| Qwen-SEA-LION-v5-27B (BF16) | ~27,8 B | 262.144 | MIT | safetensors BF16 | Modelo base, 55,6 GB |
| Qwen-SEA-LION-v5-27B-INT4 | ~27,8 B | 262.144 | MIT | safetensors INT4 | Cuantizacion de 4 bits |
| Qwen-SEA-LION-v5-27B-GGUF | ~27,8 B | 262.144 | MIT | GGUF | Para llama.cpp |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de proteccion adicionales.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado tasas de error en la informacion disponible.
- La cuantizacion FP8 puede introducir degradaciones de calidad frente al BF16 en tareas sensibles, aunque no se han publicado evaluaciones comparativas.
- La ventana de 262.144 tokens exige una gestion cuidadosa de la KV cache; en GPUs de 48 GB o menos el contexto practico sera inferior al maximo.
- Cobertura limitada a los nueve idiomas declarados; el rendimiento en otras lenguas no esta documentado.
- La licencia MIT permite uso comercial, pero los autores declinan toda responsabilidad por reclamaciones o danos derivados del uso de los pesos.
- El modelo esta disenado para el sudeste asiatico; su comportamiento en dominios muy especializados fuera de esa region no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-FP8
- Modelo base BF16: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B
- Variante INT4: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-INT4
- Variante GGUF: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-27B-GGUF
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B#quickstart
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Cookbook de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia MIT: https://mit-license.org/
