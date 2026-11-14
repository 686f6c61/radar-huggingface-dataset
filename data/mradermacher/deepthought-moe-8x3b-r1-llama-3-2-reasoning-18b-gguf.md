# mradermacher/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B-GGUF

## Resumen

DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B es un modelo de lenguaje de tipo Mixture of Experts (MoE) construido mediante la tecnica de merge de modelos (mergekit) sobre la base de Llama 3.2. Lo desarrolla DavidAU y esta publicado originalmente en formato safetensors; la version aqui descrita es la cuantizacion GGUF realizada por mradermacher. El modelo combina ocho expertos de aproximadamente 3B de parametros cada uno, dando un total de 18.404.944.960 parametros, y esta orientado explicitamente a tareas de razonamiento con cadena de pensamiento (CoT), siguiendo el estilo de DeepSeek-R1.

El modelo resuelve el problema de disponer de un LLM de razonamiento con ventana de contexto de 128k tokens en hardware de consumo, gracias a las cuantizaciones GGUF que van desde 7,1 GB (Q2_K) hasta 19,7 GB (Q8_0). Es relevante para desarrolladores que quieran experimentar con arquitecturas MoE fusionadas y modos de "thinking" sin depender de infraestructura de datacenter.

La ficha cubre exclusivamente la version GGUF publicada por mradermacher, que es una conversion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) del modelo original de DavidAU. No se dispone de informacion sobre la licencia, el pipeline ni los datos exactos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 8 expertos, basado en Llama 3.2, fusionado con mergekit |
| Parametros totales | 18.404.944.960 |
| Parametros activos | no disponible |
| Longitud de contexto | 128k tokens (segun tags del modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (version original en safetensors en el repo del autor base) |

## Arquitectura y entrenamiento

El modelo es un Mixture of Experts con ocho expertos, cada uno de aproximadamente 3B de parametros, construido sobre la arquitectura Llama 3.2 y fusionado mediante mergekit. El resultado es un modelo denso de 18,4B parametros totales que reparte capacidad entre los ocho expertos. Los tags indican explicitamente "8 X 3B", "moe", "8 experts" y "128k context", lo que sugiere que hereda la ventana de contexto extendida de la familia Llama 3.2.

La orientacion a razonamiento se declara mediante los tags "reasoning", "thinking", "r1", "cot" y "deepseek", lo que indica que el merge incorpora comportamiento de cadena de pensamiento al estilo DeepSeek-R1. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documenta en la informacion disponible ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla del propio merge MoE.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Razonamiento con cadena de pensamiento (CoT) y modo "thinking" al estilo R1/DeepSeek.
- Razonamiento matematico y logico derivado del modo CoT.
- Generacion de codigo como capacidad esperable de un modelo Llama 3.2, aunque no se documenta explicitamente en la informacion disponible.
- Ventana de contexto de 128k tokens para documentos largos y conversaciones extensas.
- Capacidad MoE con ocho expertos, lo que en teoria permite especializacion interna por dominio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente, aunque el modo CoT lo hace plausible.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento asistido en local: el modelo puede ejecutarse en una RTX 4090 con cuantizacion Q4_K_M (11,4 GB) para tareas de analisis paso a paso con cadena de pensamiento, sin depender de APIs externas.
- Analisis de documentos largos: con 128k tokens de contexto, es adecuado para resumir o extraer informacion de contratos, informes o codigo fuente extenso en una sola pasada.
- Prototipado de agentes de razonamiento: el modo CoT permite construir pipelines de multi-step reasoning donde el modelo justifica cada decision antes de responder.
- Educacion y tutoria tecnica en ingles: el modo thinking hace visible el proceso de resolucion, util para explicar problemas de matematicas o logica.
- Investigacion sobre merges MoE: sirve como caso de estudio reproducible de mergekit con ocho expertos sobre Llama 3.2, comparando el comportamiento del merge frente al modelo base.
- Despliegue en estaciones de trabajo sin GPU dedicada: con Q2_K (7,1 GB) o Q3_K_S (8,4 GB) puede ejecutarse en CPU con llama.cpp u Ollama para tareas de razonamiento de baja latencia critica.
- Generacion de codigo asistida en local: con Q5_K_M (13,3 GB) cabe en GPUs de 16 GB y permite autocompletado y explicacion de codigo en un IDE sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~7,1 GB; Q3_K_S ~8,4 GB; Q4_K_S ~10,8 GB; Q4_K_M ~11,4 GB; Q5_K_M ~13,3 GB; Q6_K ~15,3 GB; Q8_0 ~19,7 GB (mas overhead de contexto KV cache, que con 128k tokens puede ser significativo).
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080 / 4070 Ti Super (16 GB) para Q5_K_M; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q4_K_M; A100 40/80 GB o H100 para FP16/BF16 original (18,4B parametros, ~37 GB en BF16).
- Cabe en GPU de consumo: si, en RTX 4090, 4080, 4070 Ti Super, 4060 Ti 16 GB y similares con cuantizaciones Q4-Q8. En GPUs de 8 GB solo caben Q2_K y Q3_K_S con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp, llama-cpp-python). vLLM y TGI requieren los pesos en safetensors del repo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un MoE con 8 expertos y 18,4B parametros totales, el throughput dependera del numero de parametros activos por token, dato no documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B (este) | 18,4B | 128k | MoE 8 expertos, merge | no disponible | GGUF en HF |
| Llama 3.2 3B Instruct | 3,2B | 128k | Denso | Llama 3.2 Community License | safetensors y GGUF |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128k | Denso, destilado | MIT (segun el modelo original) | safetensors y GGUF |
| Qwen2.5-14B-Instruct | 14,7B | 128k | Denso | Apache 2.0 | safetensors y GGUF |

La comparativa se ofrece a nivel de categoria (modelos de razonamiento de tamano medio con contexto largo). No se dispone de datos de rendimiento comparativo del modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; hay que consultar el repo del modelo base (DavidAU/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B) antes de desplegarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos de razonamiento con CoT; el modo thinking puede generar cadenas plausibles pero incorrectas.
- Modelo de merge: al ser una fusion con mergekit de ocho expertos, puede presentar comportamientos inconsistentes o degradacion en dominios no cubiertos por los expertos originales.
- Contexto largo: aunque se declaran 128k tokens, el rendimiento real en contextos muy largos no esta validado en la informacion disponible, y la KV cache a 128k consume VRAM adicional considerable.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad, especialmente en tareas de razonamiento donde el CoT es sensible a la perdida de precision.
- Sin datos de benchmarks: no hay evidencia publicada en la informacion disponible que respalde las capacidades de razonamiento frente a alternativas.
- Modelo con muy pocas descargas (170) y 0 likes en el momento de la ficha: comunidad reducida, sin validacion externa extensa.

## Enlaces

- Repo GGUF: https://huggingface.co/mradermacher/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B-GGUF
- Repo base (safetensors): https://huggingface.co/DavidAU/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B
- Variantes imatrix: https://huggingface.co/mradermacher/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
