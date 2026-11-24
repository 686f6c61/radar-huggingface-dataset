# EdwinS9/Qwen3.8-35B-A3B-AWQ

## Resumen

Qwen3.8-35B-A3B-AWQ es una cuantizacion de 4 bits en formato AWQ del modelo EdwinS9/Qwen3.8-35B-A3B, un ajuste fino orientado a codigo derivado de Qwen3.6-35B-A3B. El autor del checkpoint cuantizado es EdwinS9, mientras que la tecnica de cuantizacion de los expertos enrutados procede de QuantTrio y el modelo base original es de Qwen. El objetivo es ofrecer una version desplegable en vLLM con un consumo de memoria notablemente inferior al del modelo en 16 bits, manteniendo un comportamiento practicamente identico.

La arquitectura es un transformer de tipo mixture-of-experts (MoE) con atencion hibrida (atencion completa y atencion lineal), expertos compartidos, capas MTP y una torre de vision, segun se deduce de la model card. El checkpoint contiene 35.951.822.704 parametros totales y el repositorio ocupa 25,5 GB, lo que encaja con una mezcla de pesos de 4 bits en los expertos y 16 bits en el resto de componentes.

Su relevancia ahora es practica: permite servir un modelo MoE de ~36B parametros con tooling estandar de vLLM en una sola GPU de 80 GB o en configuraciones de menor VRAM con contexto recortado, y conserva el modo de razonamiento (thinking) recomendado por el autor. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo tiene un historial de publicacion muy reciente y practicamente sin adopcion (0 descargas, 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (atencion completa + atencion lineal), expertos compartidos, capas MTP y torre de vision; tipo `qwen3_5_moe` en transformers |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio recomendada (`--max-model-len 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | AWQ 4 bits (group size 128) en expertos enrutados; 16 bits en atencion, atencion lineal, experto compartido, routers, embeddings, LM head, torre de vision y capas MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (AWQ), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un MoE con atencion hibrida: combina capas de atencion completa con capas de atencion lineal, e incorpora expertos compartidos junto a los expertos enrutados, ademas de capas MTP (multi-token prediction) y una torre de vision, ya que el pipeline declarado incluye `image-text-to-text`. El checkpoint cuantizado mantiene los expertos enrutados en AWQ 4 bits con group size 128, heredados sin cambios de QuantTrio/Qwen3.6-35B-A3B-AWQ, mientras que el resto de componentes permanece en 16 bits con el ajuste fino fusionado en los pesos de atencion, atencion lineal y experto compartido.

El ajuste fino de partida (EdwinS9/Qwen3.8-35B-A3B) se describe como un fine-tune de codigo sobre Qwen3.6-35B-A3B, entrenado con respuestas de Qwen3.8-27B. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion se remite a la model card del modelo principal. Como verificacion de fidelidad, el autor reporta que sobre 20 secuencias (33.937 tokens) este checkpoint y el modelo AWQ base con el fine-tune sin fusionar difieren en 0,0004 nats por token de perdida media, lo que indica una cuantizacion essentially lossless respecto a su referencia.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con ventana de servicio de 32.768 tokens.
- Razonamiento en modo thinking, con parser de razonamiento `qwen3` en vLLM.
- Generacion y asistencia de codigo, al ser un fine-tune especializado en codigo.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de vision incluida en 16 bits.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking y las capas MTP son compatibles con flujos multi-paso.
- Prediccion multi-token (MTP) integrada en la arquitectura, util para decodificacion especulativa en vLLM.

## Casos de uso

- Asistente de codigo en IDE o CLI: el ajuste fino sobre respuestas de un modelo mayor esta orientado a tareas de programacion, y el formato AWQ permite servirlo en una unica GPU con latencia aceptable para autocompletado y explicacion de codigo.
- Revision de codigo en pipelines de CI/CD: con 32k tokens de contexto se pueden pasar diffs completos y archivos de test al modelo para detectar regresiones y sugerir parches antes del merge.
- Razonamiento sobre documentacion tecnica extensa: el modo thinking y la ventana de 32k permiten analizar especificaciones, RFCs o manuales largos y producir resumenes razonados.
- Analisis de capturas y diagramas: la torre de vision habilita tareas de image-text-to-text, como describir diagramas de arquitectura o extraer texto de capturas de error.
- Despliegue self-hosted con vLLM: el checkpoint esta pensado para `vllm serve` con `--reasoning-parser qwen3`, lo que facilita integrarlo en infraestructura propia con API compatible con OpenAI.
- Experimentacion e investigacion sobre MoE cuantizado: al mantener los expertos en AWQ 4 bits y el resto en 16 bits, sirve como banco de pruebas para estudiar el impacto de la cuantizacion selectiva en modelos MoE.
- Generacion de codigo en produccion con requisitos de coste: el menor footprint del checkpoint (25,5 GB) reduce el numero de GPUs necesarias frente al modelo en 16 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite las puntuaciones al modelo principal (EdwinS9/Qwen3.8-35B-A3B) y solo aporta la verificacion de fidelidad de la cuantizacion: 0,0004 nats por token de diferencia media de perdida frente al AWQ base con el fine-tune sin fusionar, medida sobre 20 secuencias y 33.937 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 25,5 GB, por lo que se necesita al menos ese espacio en pesos; con cache KV para 32.768 tokens y margen de activaciones, el consumo real sera superior.
- GPU recomendadas: una GPU de 80 GB (A100 80GB, H100 80GB) permite servir el modelo con contexto completo de 32k; en GPUs de 48 GB es probable que haya que recortar contexto o limitar el numero de secuencias concurrentes.
- Cabe en GPU consumer: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) solo con contexto muy reducido y baja concurrencia; en 32 GB (RTX 5090) con mayor margen, aunque los datos exactos de VRAM por configuracion no estan disponibles.
- Opciones de despliegue: vLLM es el motor de referencia segun el autor (`vllm serve ... --max-model-len 32768 --reasoning-parser qwen3`); llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible, y al ser un checkpoint AWQ de transformers, la ruta mas fiable es vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdwinS9/Qwen3.8-35B-A3B-AWQ | 35,95B | 32.768 (servicio) | AWQ 4 bits en expertos, 16 bits en resto | Apache-2.0 | Hugging Face, 0 descargas |
| EdwinS9/Qwen3.8-35B-A3B | no disponible | no disponible | 16 bits | Apache-2.0 | Hugging Face |
| QuantTrio/Qwen3.6-35B-A3B-AWQ | no disponible | no disponible | AWQ 4 bits | Apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion independiente.
- El ajuste fino esta especializado en codigo; su rendimiento en tareas generales puede degradarse respecto al modelo base de Qwen.
- No se detallan los datos de entrenamiento del fine-tune (tokens, composicion, posible RLHF/DPO), lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinacion inherente a los modelos generativos, sin evaluaciones publicadas que lo cuantifiquen.
- Idiomas soportados no declarados; no hay garantia de calidad fuera de los idiomas cubiertos por el modelo base.
- La cuantizacion AWQ solo afecta a los expertos enrutados; el resto en 16 bits eleva el footprint respecto a una cuantizacion integral, lo que limita el ahorro de VRAM.
- El contexto maximo nativo no esta documentado; la configuracion recomendada de 32.768 tokens es una recomendacion de servicio, no necesariamente el limite del modelo.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen y de la cuantizacion de QuantTrio antes de desplegar en produccion.
- El checkpoint depende de vLLM con parser `qwen3` para el modo thinking; otros motores pueden no reproducir el comportamiento esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EdwinS9/Qwen3.8-35B-A3B-AWQ
- Modelo base del fine-tune: https://huggingface.co/EdwinS9/Qwen3.8-35B-A3B
- Cuantizacion AWQ de referencia: https://huggingface.co/QuantTrio/Qwen3.6-35B-A3B-AWQ
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
