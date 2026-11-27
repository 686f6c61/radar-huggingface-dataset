# aitamedia/Ling-3.0-flash-Sante-FP4

## Resumen

Ling-3.0-flash-Sante-FP4 es una cuantización en FP4 del modelo Ling-3.0-flash-Sante, un fine-tune comunitario de la familia Ling-3.0-flash de inclusionAI. Lo publica el usuario aitamedia y su propósito es ofrecer un empaquetado nativo para vLLM de un modelo de arquitectura híbrida con expertos (MoE) en formato MXFP4, pensado para desplegarse en hardware de gama alta con memoria limitada, como las estaciones DGX Spark con GB10.

El modelo conserva la arquitectura del original: BailingMoeV3ForCausalLM con atención híbrida KDA (atención lineal) más MLA, y aproximadamente 65.600 millones de parámetros totales. La cuantización mezcla MXFP4 para los expertos enrutados, fp8-block-128 para las proyecciones densas de atención y salida, y bf16 para las proyecciones exentas (MLA/KDA), el router, las normas, el lm_head y los embeddings.

Su relevancia ahora es doble: por un lado, demuestra un pipeline de cuantización FP4 reproducible sobre un derivado "abliterated" y ajustado por la comunidad; por otro, incluye configuración de generación y parser de tool calling específicos para la familia Ling, lo que facilita su uso en producción con vLLM igual o superior a la versión 0.32.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoeV3ForCausalLM, transformer MoE con atención híbrida KDA (lineal) + MLA |
| Parametros totales | 65.578.478.560 (~65,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (3 slots en TP1 sobre DGX Spark) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, grupo 32, e2m1 con escalas e8m0 pow2), fp8-block-128 (proyecciones densas de atención/salida, e4m3 con escalas e8m0 ceil), bf16 (MLA/KDA, router, normas, lm_head, embeddings) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (36 shards `model-fp4-*.safetensors` + índice) |

## Arquitectura y entrenamiento

El modelo es una cuantización del fine-tune Sante, que a su vez deriva de Ling-3.0-flash de inclusionAI. La arquitectura es BailingMoeV3ForCausalLM, un transformer con mezcla de expertos y atención híbrida que combina KDA (atención lineal) con MLA (Multi-head Latent Attention). El pack replica el layout híbrido del `inclusionAI/Ling-3.0-flash-fp4` oficial: MXFP4 para los expertos enrutados, fp8-block-128 para las proyecciones densas y bf16 para las capas exentas de cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. El autor indica que Sante es un linaje de fine-tune comunitario con abliteración y ajuste adicional. El checkpoint incluye NEXTN/MTP nativo con k=3 para decodificación especulativa, y el pack incorpora `generation_config.json` con temperatura 0,6, top_p 0,95, top_k 20 y repetition_penalty 1,05, valores que el autor considera necesarios para evitar la deriva multilingüe en trazas de razonamiento largas.

## Capacidades

- Generación de texto conversacional en formato chat mediante plantilla incluida.
- Razonamiento multi-paso con trazas largas de "thinking", condicionado al uso de la configuración de generación incluida.
- Tool calling y function calling nativo, con parser `ling3` en vLLM y soporte verificado de `tool_choice=auto`.
- Decodificación especulativa mediante NEXTN/MTP k=3 integrado en el checkpoint.
- Capacidades multilingües: no disponibles de forma explícita; el autor advierte de deriva multilingüe si no se aplica la configuración de generación.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens por slot y 3 slots en TP1, puede mantener conversaciones multi-turno con documentos extensos cargados en contexto sin truncamiento.
- Agente con herramientas en producción: el soporte de tool calling con `tool_choice=auto` y parser dedicado permite integrarlo en orquestadores de agentes que consultan APIs, bases de datos o servicios internos.
- Razonamiento multi-paso sobre trazas largas: adecuado para tareas de análisis que requieren cadenas de pensamiento extensas, siempre que se respete la configuración de generación incluida.
- Despliegue en estaciones DGX Spark: el formato FP4 y el layout híbrido están pensados para arrancar en unos 5 minutos en frío y 2 en caliente en una sola caja GB10, con unos 37 GB de margen de host tras la carga.
- Servicio distribuido en dos nodos: el recetario TP2 permite repartir el modelo entre dos DGX Spark cuando se necesita mayor capacidad o concurrencia.
- Investigación sobre cuantización FP4: sirve como referencia reproducible para estudiar el impacto de MXFP4 más fp8-block en modelos MoE de ~65B con atención híbrida.
- Fine-tunes comunitarios y experimentación con modelos abliterated: al estar bajo licencia MIT, facilita la experimentación y la redistribución de derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor sí reporta métricas de despliegue medidas en TP1 sobre una DGX Spark (GB10): aproximadamente 33 tokens por segundo en decodificación de un solo stream con kernel emulado tipo Marlin, prefill saludable y arranque en unos 5 minutos en frío y 2 en caliente.

## Requisitos de hardware

- VRAM/almacenamiento: el repo ocupa 70,4 GB en 36 shards; el pool de KV reservado en TP1 es de 6,5e9 bytes para 3 slots a 262.144 tokens.
- GPU recomendadas: DGX Spark con GB10 (verificado en aarch64 con CUDA 13.0); el autor menciona también GB10 como plataforma objetivo del pack.
- GPU de consumo: no hay datos que confirmen su ajuste en RTX 4090 u otras consumer GPU; el tamaño del pack (70,4 GB) supera la VRAM de la mayoría de tarjetas de consumo individuales.
- Despliegue: vLLM igual o superior a 0.32.0 (loader Ling-fp4 incluido en la release); el autor no documenta soporte para llama.cpp, Ollama ni TGI.
- Configuración multi-nodo: TP2 requiere que el pack esté presente en ambos nodos y verificar el tamaño de los blobs, ya que un worker lleno puede truncar ficheros silenciosamente.
- Latencia y throughput: ~33 tok/s de decodificación en TP1, un solo stream; prefill descrito como saludable sin cifra concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aitamedia/Ling-3.0-flash-Sante-FP4 | ~65,6B | 262.144 | MXFP4 + fp8-block + bf16 | MIT | Hugging Face |
| inclusionAI/Ling-3.0-flash-Sante | no disponible | no disponible | bf16 | no disponible | Hugging Face |
| inclusionAI/Ling-3.0-flash-fp4 | no disponible | no disponible | MXFP4 + fp8-block | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un derivado "abliterated" y ajustado por la comunidad: los filtros de seguridad del modelo original pueden haberse atenuado, con mayor riesgo de generar contenido sensible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Sin la configuración de generación incluida, el autor advierte que las trazas de razonamiento largas pueden derivar en mezcla de idiomas.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Licencia MIT declarada, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base y del linaje Sante antes de producción.
- Requiere vLLM igual o superior a 0.32.0; no hay soporte documentado para otros motores de inferencia.
- El despliegue multi-nodo es frágil si no se verifica la integridad de los blobs en cada nodo.
- El rendimiento medido (~33 tok/s) corresponde a un kernel emulado en GB10 y puede no representar el rendimiento en otras plataformas.

## Enlaces

- [Hugging Face: aitamedia/Ling-3.0-flash-Sante-FP4](https://huggingface.co/aitamedia/Ling-3.0-flash-Sante-FP4)
- [Modelo base: inclusionAI/Ling-3.0-flash-Sante](https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante)
- [Pack FP4 oficial de referencia: inclusionAI/Ling-3.0-flash-fp4](https://huggingface.co/inclusionAI/Ling-3.0-flash-fp4)
