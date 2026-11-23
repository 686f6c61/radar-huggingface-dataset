# mradermacher/Tenet-8B-Llama3.1-Unslop-v1-GGUF

## Resumen

Tenet-8B-Llama3.1-Unslop-v1-GGUF es la distribucion en formato GGUF del modelo Tenet-8B-Llama3.1-Unslop-v1, publicado por el usuario mradermacher a partir del modelo original de mr-andrey-isachenko. Se trata de un ajuste fino de 8.030.261.312 parametros (aproximadamente 8B) construido sobre la arquitectura Llama 3.1, orientado a tareas agénticas, uso de herramientas (tool calling) y generacion de codigo, con un proceso de entrenamiento que segun los tags del autor incluye GRPO y una fase de "abliteration" (eliminacion de rechazos) que lo presenta como un modelo "uncensored".

El modelo base es Tenet-8B-Llama3.1-Unslop-v1, y esta variante GGUF es una cuantizacion estatica generada por mradermacher, que ofrece un abanico de cuantizaciones desde Q2_K (3,3 GB) hasta f16 (16,2 GB), pasando por Q4_K_M (5,0 GB) y Q8_0 (8,6 GB). La licencia declarada es Apache 2.0, lo que facilita su uso comercial, y el repositorio ocupa 71,8 GB en total por incluir todas las variantes.

Es relevante ahora porque combina tres tendencias actuales: modelos de 8B ejecutables en hardware de consumo, especializacion en flujos agénticos con tool calling, y una version "sin censura" derivada de Llama 3.1. La disponibilidad en GGUF permite desplegarlo con llama.cpp, Ollama o vLLM sin necesidad de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.1) |
| Parametros totales | 8.030.261.312 (aproximadamente 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Llama 3.1, con aproximadamente 8B de parametros. Segun los tags de la model card, el entrenamiento del modelo original incluye GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo utilizada para mejorar el razonamiento y el cumplimiento de instrucciones. Tambien aparece el tag "abliterated", que indica que se ha aplicado una tecnica de eliminacion de direcciones de rechazo en el espacio de activaciones, dando lugar a un modelo "uncensored" que responde sin las negativas tipicas de los modelos alineados.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO mas alla de la mencion a GRPO. Los tags "agentic", "tool-use" y "coding" sugieren un ajuste orientado a tareas de agente y generacion de codigo, aunque no se especifican los datos concretos. Esta variante GGUF es una cuantizacion estatica del modelo original; el autor tambien ofrece cuantizaciones ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y cumplimiento de instrucciones, con entrenamiento via GRPO segun los tags.
- Tool calling y function calling, orientado a flujos agénticos.
- Razonamiento multi-paso para agentes.
- Generacion de codigo (tag "coding").
- Modo "uncensored" / "abliterated": menor tendencia a rechazar peticiones.
- Compatibilidad con endpoints (tag "endpoints_compatible") y despliegue en vLLM (tag "vllm").
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte multilingue amplio.
- Vision y audio: no disponibles.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede encadenar llamadas a funciones y razonamiento multi-paso, adecuado para orquestadores de agentes que necesitan decidir que herramienta invocar en cada turno.
- Asistente de codigo en local: con cuantizaciones Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB) puede ejecutarse en una GPU de consumo y servir como autocompletado o generacion de fragmentos en editores.
- Automatizacion de tareas de desarrollo: integracion en pipelines de CI/CD para generar parches, explicar errores o redactar mensajes de commit, gracias a su especializacion en codigo y tool use.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten inferencia en GPUs con 6-8 GB de VRAM o incluso en CPU via llama.cpp.
- Prototipado de agentes de investigacion: su naturaleza "uncensored" lo hace util para experimentar con prompts que otros modelos rechazan, siempre con supervision humana.
- Servicio de chat autoalojado: con Q8_0 (8,6 GB) o f16 (16,2 GB) se puede montar un endpoint compatible con la API de OpenAI usando vLLM o llama.cpp server.
- Evaluacion de tecnicas de abliteration: util como caso de estudio para investigadores que comparan el comportamiento de modelos alineados frente a versiones sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, incluyendo overhead de contexto):
  - Q2_K: ~4-5 GB.
  - Q3_K_S / Q3_K_M: ~5 GB.
  - Q4_K_S / Q4_K_M: ~6-7 GB.
  - Q5_K_S / Q5_K_M: ~7-8 GB.
  - Q6_K: ~8-9 GB.
  - Q8_0: ~10-11 GB.
  - f16: ~17-18 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues concurrentes con vLLM.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (tag explicito), servidores compatibles con la API de OpenAI, y transformers con los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-8B-Llama3.1-Unslop-v1 (este) | ~8B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste agéntico, abliterated, GRPO |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo base alineado, multilingue |
| Qwen2.5 7B Instruct | 7B | 128K | Apache 2.0 | safetensors, GGUF | Fuerte en codigo y multilingue |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa ligera y permisiva |

La comparacion con Llama 3.1 8B Instruct es directa por herencia arquitectonica; las diferencias principales son el ajuste agéntico y la eliminacion de rechazos. Qwen2.5 7B y Mistral 7B son alternativas con licencia permisiva y ecosistema GGUF maduro. No hay datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles; el rendimiento en castellano no esta garantizado.
- Al ser "abliterated" / "uncensored", puede generar contenido inapropiado, ofensivo o inseguro sin las salvaguardas habituales; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a modelos de 8B, especialmente en tareas de conocimiento factual.
- No se han publicado benchmarks que permitan validar su calidad frente a alternativas.
- La longitud de contexto efectiva no esta documentada en esta ficha; no asumir 128K sin verificar el modelo base.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Llama 3.1 (licencia comunitaria) por posibles restricciones heredadas.
- El repositorio ocupa 71,8 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- Sin datos de latencia ni throughput; realizar pruebas propias antes de dimensionar infraestructura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-8B-Llama3.1-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Tenet-8B-Llama3.1-Unslop-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Tenet-8B-Llama3.1-Unslop-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
