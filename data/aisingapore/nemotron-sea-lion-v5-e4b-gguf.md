# aisingapore/Nemotron-SEA-LION-v5-E4B-GGUF

## Resumen

Nemotron-SEA-LION-v5-E4B-GGUF es la distribucion en formato GGUF del modelo aisingapore/Nemotron-SEA-LION-v5-E4B, desarrollado por el AI Products Pillar de AI Singapore y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), orientada a cubrir las lenguas del sudeste asiatico, un nicho historicamente desatendido por los grandes modelos generalistas. Esta variante concreta empaqueta los pesos en cuatro niveles de cuantizacion para su uso con llama.cpp.

El modelo es un small language model derivado de la cadena NVIDIA Nemotron 3.5 Bolt E4B, que a su vez parte de google/gemma-4-E4B-it, con un post-entrenamiento especifico de AI Singapore para las lenguas del sudeste asiatico. Cuenta con 7.518.069.290 parametros totales en safetensors y una ventana de contexto de 64K tokens, con soporte declarado para nueve idiomas: birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita.

Su relevancia practica radica en dos factores: por un lado, la licencia MIT permite uso comercial sin restricciones de atribucion mas alla de la propia licencia; por otro, la disponibilidad de cuantizaciones GGUF (desde 5,34 GB en Q4_K_M hasta 15,05 GB en F16) lo hace desplegable en hardware de consumo y en entornos sin GPU de datacenter, algo poco habitual en modelos con contexto de 64K y cobertura multilingue regional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de NVIDIA Nemotron 3.5 Bolt E4B, basado en google/gemma-4-E4B-it) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | 64K tokens |
| Tipos de cuantizacion | GGUF F16, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes, vietnamita |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card de esta variante GGUF no detalla la arquitectura interna; remite al modelo base aisingapore/Nemotron-SEA-LION-v5-E4B para la descripcion del entrenamiento. Lo que si se documenta es la cadena de derivacion: el modelo parte de nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, que NVIDIA post-entreno a partir de google/gemma-4-E4B-it, y AI Singapore aplico un post-entrenamiento adicional orientado a las lenguas del sudeste asiatico. El nombre "E4B" sugiere la nomenclatura de eficiencia de la familia Gemma/Nemotron, aunque el numero exacto de parametros activos no se especifica en la informacion disponible.

Los archivos GGUF conservan el modelo de lenguaje completo sin modificaciones: tokenizador, plantilla de chat y valores de muestreo por defecto son identicos al modelo base. La conversion se limita a la cuantizacion de pesos, sin reentrenamiento ni ajuste posterior. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en nueve idiomas del sudeste asiatico mas chino e ingles.
- Modo de razonamiento (thinking) activado por defecto, desactivable mediante `enable_thinking: false` en `chat_template_kwargs`.
- Soporte de plantilla de chat Jinja compatible con el endpoint `/v1/chat/completions` de llama.cpp.
- Capacidad multilingue regional: birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita, ademas de chino e ingles.
- Manejo de contexto largo de hasta 64K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente multilingue en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes o vietnamita con una ventana de 64K tokens, lo que permite mantener historial extenso y contexto de cuenta sin truncar.
- Procesamiento de documentacion regional: resumen y extraccion de informacion de contratos, manuales o normativa en lenguas locales, aprovechando el contexto largo para ingerir documentos completos en una sola pasada.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (5,34 GB) el modelo cabe en GPU de gama media y en equipos con 8-12 GB de VRAM, lo que habilita prototipos y demos locales sin infraestructura cloud.
- Traduccion y localizacion asistida: traduccion entre ingles/chino y las lenguas del sudeste asiatico, util para equipos de producto que necesitan contenido localizado sin depender de APIs externas.
- Asistentes de codigo y soporte tecnico en ingles: generacion de texto y explicaciones tecnicas en ingles con contexto largo para volcar repositorios o logs extensos.
- Investigacion linguistica y evaluacion de modelos: al ser MIT y estar disponible en GGUF, sirve como base reproducible para estudiar rendimiento en lenguas de bajos recursos y comparar cuantizaciones.
- Integracion en pipelines de CI/CD o herramientas de desarrollo: mediante el servidor de llama.cpp (`llama-server`) expuesto como API compatible con OpenAI, se puede conectar a herramientas existentes sin reescribir clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion del modelo base esta en su propia model card y en el SEA-LION Leaderboard, y que las cuantizaciones GGUF no se evaluaron por separado.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q4_K_M ~5,34 GB de pesos (mas overhead de contexto KV, que crece con la ventana usada); Q6_K ~6,22 GB; Q8_0 ~8,03 GB; F16 ~15,05 GB.
- GPU recomendadas: para F16, GPU con 24 GB o mas (RTX 3090/4090, A10, L4 con margen limitado); para Q8_0, GPU de 12-16 GB; para Q4_K_M, GPU de 8-12 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con las cuantizaciones Q4_K_M, Q6_K y Q8_0. La F16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server`) segun la model card; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. Otras opciones como vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B-GGUF | 7.518.069.290 | 64K | 7 lenguas SEA + zh + en | MIT | GGUF |
| aisingapore/Nemotron-SEA-LION-v5-E4B (BF16) | 7.518.069.290 | 64K | 7 lenguas SEA + zh + en | MIT | safetensors |
| aisingapore/Nemotron-SEA-LION-v5-E4B-FP8 | no disponible | 64K | 7 lenguas SEA + zh + en | MIT | FP8 |
| aisingapore/Nemotron-SEA-LION-v5-E4B-INT4 | no disponible | 64K | 7 lenguas SEA + zh + en | MIT | INT4 |

Las alternativas directas documentadas son las otras variantes del mismo modelo base (BF16, FP8, INT4). No se dispone en la informacion proporcionada de modelos comparables de otros autores con cobertura equivalente de lenguas del sudeste asiatico.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de proteccion adicionales.
- No se ha probado la robustez frente a prompting adversarial.
- Riesgo de alucinacion: como otros LLM, puede generar contenido irrelevante o elementos ficticios no fundamentados en el contexto.
- Las cuantizaciones GGUF no se evaluaron por separado, por lo que el rendimiento puede diferir del modelo base en BF16.
- La model card remite a la de NVIDIA Nemotron 3.5 Bolt E4B para los detalles de datos de entrenamiento, evaluacion de seguridad y limitaciones heredadas.
- El modo de razonamiento esta activado por defecto; en produccion conviene desactivarlo explicitamente si no se necesita para evitar latencia y tokens extra.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo se distribuye "tal cual", sin garantias; los autores declinan responsabilidad por danos derivados del uso.
- Cobertura limitada a los nueve idiomas declarados; el rendimiento en otras lenguas no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-GGUF
- Modelo base (BF16): https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Variante FP8: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-FP8
- Variante INT4: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-INT4
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Sitio de SEA-LION: https://sea-lion.ai
- Leaderboard SEA-LION: https://leaderboard.sea-lion.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo NVIDIA Nemotron 3.5 Bolt E4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Informe tecnico NVIDIA Nemotron 3.5 Bolt E4B: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Modelo google/gemma-4-E4B-it: https://huggingface.co/google/gemma-4-E4B-it
- Licencia MIT: https://mit-license.org/
- Contacto: sealion@aisingapore.org
