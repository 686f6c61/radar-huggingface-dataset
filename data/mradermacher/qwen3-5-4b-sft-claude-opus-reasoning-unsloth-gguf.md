# mradermacher/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF es una distribucion de pesos en formato GGUF del modelo afinado ermiaazarkhalili/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth, publicada por mradermacher. El modelo subyacente parte de una base Qwen 3.5 de 4B parametros (4.205.751.296 parametros segun safetensors) y ha sido sometida a un proceso de SFT (supervised fine-tuning) con LoRA y TRL sobre el dataset ermiaazarkhalili/claude-reasoning-distillation, orientado a destilar trazas de razonamiento de Claude Opus.

La relevancia de esta ficha es practica: mradermacher empaqueta el modelo en once cuantizaciones GGUF estaticas (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que permite ejecutar un modelo de razonamiento de 4B en hardware de consumo mediante llama.cpp u Ollama. El repo ocupa 38,9 GB e incluye todas las variantes; el autor mantiene ademas una version con cuantizacion ponderada/imatrix en un repositorio separado.

Se trata de un modelo conversacional, solo en ingles, con licencia Apache 2.0 y sin model card tecnica detallada por parte del cuantizador: el README se limita a la informacion habitual de mradermacher sobre cuants y avisos de uso. No hay datos publicados de contexto, benchmarks ni composicion del dataset de destilacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen 3.5 de 4B; detalles no publicados en la informacion disponible) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un Qwen 3.5 de 4B parametros, afinado mediante SFT con LoRA y TRL (tags `unsloth`, `lora`, `trl`, `sft`). El dataset de entrenamiento es ermiaazarkhalili/claude-reasoning-distillation, una destilacion de trazas de razonamiento generadas por Claude Opus; el objetivo declarado en el nombre es transferir patrones de razonamiento de un modelo grande a uno pequeno. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases adicionales de RLHF o DPO.

La innovacion tecnica de esta publicacion concreta es el empaquetado: mradermacher genera cuantizaciones GGUF estaticas con `quantize_version: 2` y `output_tensor_quantised: 1`, partiendo de la conversion HF. El autor advierte que las cuantizaciones IQ suelen ser preferibles a cuantizaciones no-IQ de tamano similar, y mantiene un repositorio paralelo `-i1-GGUF` con cuantizaciones ponderadas/imatrix de mayor calidad. No se documentan innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en razonamiento explicito derivado de la destilacion de trazas de Claude Opus.
- Razonamiento paso a paso (chain-of-thought) inducido por el dataset de destilacion; el nombre del modelo sugiere modo de razonamiento, aunque no se documenta un token o modo `thinking` formal.
- Capacidad multilingue limitada al ingles segun el campo `language` del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Capacidades de vision, audio o multimodalidad: no disponibles.
- Uso como modelo base para experimentacion en destilacion de razonamiento en hardware modesto.

## Casos de uso

- Experimentacion con destilacion de razonamiento en local: cargar la cuantizacion Q4_K_M (2,8 GB) en llama.cpp u Ollama para evaluar como se comporta un 4B afinado con trazas de Claude Opus frente al modelo base, sin coste de API.
- Prototipado de asistentes conversacionales en ingles: el modelo es conversacional y cabe en GPUs de consumo, lo que permite iterar en el diseno de prompts y plantillas de chat antes de pasar a un modelo mayor.
- Educacion e investigacion sobre SFT y LoRA: el linaje completo (base Qwen 3.5, adaptador LoRA, dataset de destilacion, cuantizaciones GGUF) permite reproducir y comparar el efecto del afinamiento en un modelo pequeno.
- Generacion de explicaciones razonadas para revision humana: util en tareas donde interesa una traza de razonamiento visible (por ejemplo, analisis de problemas logicos o matematicos sencillos) y el volumen no justifica un modelo grande.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (2,0 GB) y Q3_K_S (2,2 GB) permiten ejecucion en CPU o GPUs integradas para demos y pruebas de humo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que facilita medir la degradacion de calidad entre Q2_K y Q8_0 en una carga de razonamiento concreta.
- Base para afinamientos posteriores: al ser Apache 2.0 y estar disponible en safetensors en el repo original, puede servir como punto de partida para SFT adicional con Unsloth o TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada): Q2_K ~2,5 GB; Q4_K_M ~3,5 GB; Q8_0 ~5,5 GB; f16 ~9-10 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones altas; A100/H100 no son necesarias para un 4B, pero permiten mayor throughput por batching.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones hasta Q8_0 caben en GPUs de 8 GB o mas; Q4_K_M y Q5_K_M son las opciones recomendadas por el autor por equilibrio calidad/velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (tag `endpoints_compatible`); el modelo original en safetensors puede servirse con vLLM o TGI, aunque la informacion no confirma plantillas ni configuraciones especificas.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, el autor marca Q4_K_S, Q4_K_M y Q8_0 como "fast" y Q6_K como "very good quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF (este) | 4,2B | no disponible | Apache 2.0 | GGUF (12 cuants) | Afinado SFT con destilacion de razonamiento de Claude Opus; solo ingles |
| ermiaazarkhalili/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth (modelo base) | 4,2B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; requiere GPU o vLLM/TGI |
| Qwen3.5-4B (modelo base original) | ~4B | no disponible | no disponible en la informacion | safetensors | Referencia sin afinamiento de razonamiento |
| Repositorio -i1-GGUF del mismo autor | 4,2B | no disponible | Apache 2.0 | GGUF imatrix | Cuantizaciones ponderadas de mayor calidad que las estaticas |

No se dispone de datos de rendimiento comparado (benchmarks) en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Solo ingles: el campo `language` declara unicamente `en`; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: es un modelo de 4B afinado por destilacion; las trazas de razonamiento pueden ser plausibles pero incorrectas, especialmente en matematicas y logica multi-paso.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a otros 4B, lo que dificulta justificar su uso en produccion.
- Sesgos: no documentados; al derivar de una destilacion de Claude Opus y de un dataset no descrito, pueden heredarse sesgos del profesor y del proceso de filtrado.
- Licencia Apache 2.0 permite uso comercial, pero el cuantizador no ofrece garantias y el modelo base puede arrastrar terminos adicionales de Qwen no reflejados en la informacion disponible; conviene verificar la licencia del modelo original antes de desplegar.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el propio autor desaconseja Q3_K_M ("lower quality") y recomienda Q4_K_S/Q4_K_M para uso general.
- El README del cuantizador no documenta plantilla de chat, tokens especiales ni contexto maximo; es necesario consultar el repositorio del modelo base para el uso correcto.
- Fecha de creacion del repositorio (2026-04-26) y ultima actualizacion (2026-10-16): verificar que la version descargada coincide con la revision deseada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Modelo base (adaptador SFT): https://huggingface.co/ermiaazarkhalili/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth
- Dataset de destilacion: https://huggingface.co/datasets/ermiaazarkhalili/claude-reasoning-distillation
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
