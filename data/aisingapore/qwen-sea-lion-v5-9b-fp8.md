# aisingapore/Qwen-SEA-LION-v5-9B-FP8

## Resumen

Qwen-SEA-LION-v5-9B-FP8 es la variante cuantizada en FP8 de Qwen-SEA-LION-v5-9B, un modelo de lenguaje causal con codificador de vision desarrollado por el AI Products Pillar de AI Singapore y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una coleccion de modelos disenada especificamente para lenguas del sudeste asiatico, y se construye sobre la arquitectura Qwen 3.5 de 9B parametros.

El modelo resuelve el problema de la cobertura linguistica limitada de los LLM genericos en idiomas como birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita, manteniendo ademas competencia en ingles y chino. Con 9.409.813.744 parametros totales y una ventana de contexto de 262.144 tokens, esta pensado para tareas multimodales (entrada de imagen y texto) con soporte de razonamiento explicito y tool calling.

La relevancia de esta version concreta es practica: reduce el peso de los pesos de 19,3 GB (BF16) a 12,4 GB, lo que abarata el despliegue en GPU sin cambiar el tokenizador ni la plantilla de chat. La licencia MIT facilita su adopcion comercial, algo poco habitual en modelos con cobertura tan especifica de idiomas de la ASEAN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision (base Qwen 3.5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (capas lineales, formato block-wise de Qwen); vision encoder y cabeza MTP en BF16. Existen variantes INT4 y GGUF del modelo base |
| Idiomas soportados | en, zh, my (birmano), id (indonesio), fil (filipino), ms (malayo), ta (tamil), th (tailandes), vi (vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), 12,4 GB en repo |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision, derivado de Qwen 3.5 9B, e incorpora una cabeza de prediccion multi-token (MTP, multi-token prediction), que se mantiene en BF16 tras la cuantizacion. La cuantizacion FP8 se aplico con llm-compressor sobre la mayoria de las capas lineales, replicando el formato block-wise de las publicaciones FP8 oficiales de Qwen; el codificador de vision, la cabeza MTP, el tokenizador y la plantilla de chat permanecen sin cambios respecto al modelo base.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La model card indica explicitamente que el modelo no ha sido alineado para seguridad, por lo que no consta un proceso de alineamiento orientado a robustez. La innovacion tecnica destacable es la combinacion de cuantizacion FP8 selectiva con preservacion en BF16 de los componentes sensibles (vision y MTP), y el soporte nativo de modo de razonamiento (thinking) activado por defecto mediante `enable_thinking` en la plantilla de chat.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto (desactivable con `enable_thinking: False`).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`); la model card remite a la de Qwen3.5-9B para entrada de imagen y video.
- Tool calling / function calling, con parser `qwen3_coder` en vLLM y SGLang.
- Soporte de agentes y razonamiento multi-paso a traves del modo thinking y las llamadas a herramientas.
- Capacidades multilingues en nueve idiomas: birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Prediccion multi-token (MTP) para decodificacion especulativa.
- Contexto largo de hasta 262.144 tokens para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Atencion al cliente en mercados del sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes o vietnamita con hasta 262.144 tokens de contexto, manteniendo el historial completo de la sesion y el contexto de cuenta del cliente.
- Tramitacion documental transfronteriza: con entrada de imagen y texto, puede leer documentos escaneados (facturas, certificados de origen, permisos fitosanitarios) y responder en el idioma del usuario, como ilustra el ejemplo de exportacion de durian congelado de Medan a Singapur de la model card.
- Generacion de codigo en produccion: el soporte de tool calling con parser `qwen3_coder` permite integrarlo en pipelines de CI/CD y asistentes de IDE que invocan funciones externas (consulta de APIs, ejecucion de tests, acceso a repositorios).
- Agentes automatizados de back-office: combinando modo thinking y function calling puede orquestar flujos multi-paso (consulta de estado de pedido, generacion de respuesta, escalado a humano) en entornos con vLLM o SGLang.
- Analisis de imagenes con contexto largo: al mantener el codificador de vision en BF16, es adecuado para tareas que combinan varias imagenes con documentos extensos, como revision de contratos con anexos escaneados.
- Despliegue en infraestructura con VRAM limitada: la version FP8 (12,4 GB de pesos) reduce los requisitos frente a los 19,3 GB del BF16, lo que permite servir el modelo en GPUs de 24 GB o en configuraciones multi-GPU mas economicas.
- Localizacion de contenido multilingue: traduccion y adaptacion de material entre ingles, chino y las siete lenguas del sudeste asiatico cubiertas, con soporte de tamil para el mercado indio y de Sri Lanka.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan 12,4 GB; con cache KV y overhead de runtime, se recomienda un minimo de 16-24 GB de VRAM para contextos moderados. El contexto maximo de 262.144 tokens exige mucha mas memoria de cache KV y, en la practica, despliegue multi-GPU.
- GPU recomendadas: H100, A100 (80 GB) o L40S para produccion con contexto largo; RTX 4090 (24 GB) o L4 para contextos reducidos y cargas ligeras.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion FP8 y contextos limitados; en GPUs de 16 GB probablemente no sin reducir contexto o usar la variante INT4/GGUF.
- Opciones de despliegue: vLLM (`vllm serve` con `--reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`), SGLang (`sglang serve` con los mismos parsers), y la variante GGUF del modelo base para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-9B-FP8 | 9,41 B | 262.144 | Texto + imagen | MIT | Version FP8, 12,4 GB |
| Qwen-SEA-LION-v5-9B (BF16) | 9,41 B | 262.144 | Texto + imagen | MIT | Mismo modelo sin cuantizar, 19,3 GB |
| Qwen-SEA-LION-v5-9B-INT4 | 9,41 B | 262.144 | Texto + imagen | MIT | Cuantizacion INT4, menor huella |
| Qwen-SEA-LION-v5-9B-GGUF | 9,41 B | 262.144 | Texto + imagen | MIT | Formato llama.cpp |

No se dispone de datos de rendimiento comparado con modelos de otros fabricantes (por ejemplo, Llama o Gemma) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de control.
- La model card indica que no se probo la robustez del modelo (texto truncado en la informacion disponible), por lo que no hay garantias documentadas frente a entradas adversarias.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error ni evaluaciones de fidelidad factual.
- Cobertura linguistica limitada a los nueve idiomas declarados; el rendimiento fuera de ellos no esta documentado.
- La cuantizacion FP8 puede introducir degradacion respecto al BF16, especialmente en tareas de precision numerica o razonamiento matematico; no se publican comparativas FP8 vs BF16.
- El contexto de 262.144 tokens es costoso en memoria KV y puede no ser alcanzable en GPUs de consumo.
- Aunque la licencia MIT permite uso comercial, el autor declina responsabilidad por reclamaciones derivadas del uso de los pesos.
- El ejemplo de la model card usa indonesio; no hay evidencias publicadas del rendimiento real en tamil, birmano o filipino.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-FP8)
- [Modelo base BF16](https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B)
- [Variante INT4](https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-INT4)
- [Variante GGUF](https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-GGUF)
- [Coleccion SEA-LION v5](https://huggingface.co/collections/aisingapore/sea-lion-v5)
- [Sitio oficial SEA-LION](https://sea-lion.ai)
- [Modelo Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Receta de vLLM para Qwen3.5-9B](https://recipes.vllm.ai/Qwen/Qwen3.5-9B)
- [Cookbook de SGLang para Qwen3.5](https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.5)
- [llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Licencia MIT](https://mit-license.org/)
