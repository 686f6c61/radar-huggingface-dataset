# North-ML1/wind-edge-1.7

## Resumen

Wind Edge 1.7 es un modelo de lenguaje generativo desarrollado por North ML, una organización independiente de investigación en IA. Con aproximadamente 205 millones de parámetros, se presenta como el último modelo tradicional (basado en Transformer) de la familia Wind, cerrando una etapa de decenas de prototipos experimentales antes de que la organización pivote hacia una nueva línea de investigación denominada Veyrian Execution Generators (VEGs), cuyo sucesor planificado es Wind Flame 2.0.

Técnicamente, el modelo emplea una arquitectura decoder-only Transformer compatible con Qwen3, con 18 capas, atención GQA (12 cabezas de consulta y 4 de clave-valor), codificación posicional RoPE con theta de 500.000 y una ventana de contexto de 2.048 tokens. Utiliza un tokenizador BPE de estilo Llama con vocabulario de 32.000 tokens y formato de conversación ChatML.

Su relevancia actual es limitada: se trata de un modelo experimental de investigación, no de un modelo de producción, y no se han publicado benchmarks que permitan comparar su calidad con alternativas del mercado. Su interés principal radica en la documentación abierta del proceso de investigación de North ML y en su ligereza, que permite ejecutarlo prácticamente en cualquier hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (compatible con Qwen3) |
| Parametros totales | 204.896.256 (~205M) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0 y BF16 (version GGUF); pesos nativos en BF16 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

Detalles adicionales: 18 capas, tamaño oculto de 768, vocabulario de 32.000 tokens (BPE estilo Llama), formato de chat ChatML (`<|im_start|>` / `<|im_end|>`).

## Arquitectura y entrenamiento

Wind Edge 1.7 es un Transformer decoder-only con compatibilidad de layout con Qwen3, lo que facilita su carga con la librería `transformers` de Hugging Face sin adaptaciones. La atención agrupada de consultas (GQA) con 12 cabezas de consulta y 4 de clave-valor reduce el tamaño de la caché KV y el coste de inferencia respecto a la atención multi-cabeza estándar, un diseño habitual en modelos pequeños orientados a eficiencia. La codificación posicional RoPE con theta de 500.000 es un valor relativamente alto para un contexto de solo 2.048 tokens, lo que sugiere que la arquitectura se diseñó con vistas a extensiones de contexto futuras.

Sobre el proceso de entrenamiento no se han publicado detalles: no hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Sí se conoce la existencia de un checkpoint base preentrenado publicado en `arthu1/wind-lite-1-6-0326-beta1`, lo que indica que el modelo final pasó por una etapa posterior sobre ese punto de partida, presumiblemente de ajuste conversacional dado el formato ChatML.

## Capacidades

- Generacion de texto conversacional en ingles mediante formato ChatML, con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento basico y aritmetica simple: el propio ejemplo de la model card resuelve sumas de varios digitos ("What is 197 + 486?"), aunque no hay evaluaciones formales de estas capacidades.
- Compatibilidad con el ecosistema Qwen3: el layout de pesos permite cargarlo directamente con `AutoModelForCausalLM` de Hugging Face.
- Inferencia local ligera gracias a la version GGUF con cuantizaciones Q4_K_M y Q8_0, ejecutable en CPU y en GPUs de consumo.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Soporte multilingue: no declarado; el unico idioma indicado en la model card es el ingles.

## Casos de uso

- Prototipado y experimentacion de investigacion: al ser un modelo abierto de 205M con layout Qwen3, es util como base para experimentos de fine-tuning, destilacion o analisis de arquitecturas sin necesidad de grandes recursos de computo.
- Chatbots educativos o demos en hardware minimo: su tamano permite ejecutar un asistente conversacional con formato ChatML en portatiles sin GPU dedicada, adecuado para demos, docencia o pruebas de concepto.
- Integracion en pipelines de inferencia en CPU: la version GGUF cuantizada a Q4_K_M ocupa unos 0,1-0,15 GB, lo que lo hace viable en dispositivos edge, Raspberry Pi de gama alta o contenedores sin acelerador.
- Estudio de formatos de chat y tokenizacion: al incluir plantilla ChatML y tokenizador BPE de 32k, sirve como referencia practica para entender como se ensamblan estos componentes en modelos pequenos.
- Linea base (baseline) para evaluaciones: dada su naturaleza experimental, puede emplearse como punto de comparacion de bajo coste al evaluar modelos pequenos en tareas de generacion de texto.
- Generacion de texto simple en ingles: redaccion corta, completado de frases o respuestas a preguntas basicas, siempre con la expectativa de calidad limitada por su tamano y la ausencia de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria estimada para inferencia: en BF16, los pesos ocupan aproximadamente 0,4 GB; en GGUF Q8_0, unos 0,2 GB; en Q4_K_M, unos 0,1-0,15 GB. Con margen para la caché KV y el runtime, cualquier equipo con 2 GB de RAM libres es suficiente.
- GPU recomendadas: no se requiere GPU dedicada. Cualquier GPU moderna lo ejecuta sin problemas; incluso iGPUs integradas son suficientes.
- Cabe en GPUs de consumo: si, holgadamente. Modelos de este tamano funcionan en GPUs desde los 4 GB de VRAM (e incluso menos) y en CPUs convencionales.
- Opciones de despliegue: `transformers` de Hugging Face (codigo de ejemplo en la model card), llama.cpp y Ollama gracias a la version GGUF publicada en `North-ML1/wind-edge-1.7-gguf`. No hay soporte confirmado para vLLM o TGI, aunque su compatibilidad con el layout Qwen3 podria facilitar su integracion.
- Latencia y throughput: no disponibles oficialmente. Dado su tamano (205M), se espera inferencia rapida incluso en CPU, con decodificacion en tiempo real en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Wind Edge 1.7 (North ML) | ~205M | 2.048 | Apache-2.0 | Experimental, sin benchmarks publicados |
| Qwen3-0.6B (Alibaba) | ~600M | 32.768 (hasta 131.072 con YaRN) | Apache-2.0 | Modelo de referencia cuyo layout reutiliza Wind Edge; ecosistema maduro |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8.192 | Apache-2.0 | Modelo pequeno con benchmarks publicados y entrenamiento documentado |
| Qwen2.5-0.5B (Alibaba) | ~500M | 32.768 | Apache-2.0 (variantes con restricciones) | Amplia adopcion y soporte de tooling |

En terminos absolutos, Wind Edge 1.7 compite en la categoria de modelos de menos de 500 millones de parametros, donde alternativas como SmolLM2-135M o Qwen3-0.6B ofrecen contexto mas largo, documentacion de entrenamiento mas completa y resultados de evaluacion publicos. El diferencial de Wind Edge 1.7 es su caracter narrativo e investigador dentro de la hoja de ruta de North ML, no su rendimiento.

## Limitaciones y advertencias

- Calidad no verificada: no existen benchmarks publicados (MMLU, HumanEval, GSM8K ni otros), por lo que su capacidad real es desconocida y no debe asumirse competitiva.
- Contexto corto: 2.048 tokens limitan documentos largos, conversaciones extensas y tareas de recuperacion.
- Idioma: solo se declara soporte para ingles; el rendimiento en castellano o en otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa; sin datos de alineacion publicados (RLHF/DPO no confirmados), este riesgo podria ser mayor que en modelos comerciales.
- Sesgos: no se ha publicado ningun analisis de sesgos; al desconocerse la composicion del dataset de entrenamiento, no es posible evaluarlos.
- Proyecto experimental de una organizacion pequena: la model card describe objetivos de investigacion futuros (VEGs, Wind Flame 2.0) que son declarativos y no constituyen afirmaciones de rendimiento; el mantenimiento y la continuidad del modelo no estan garantizados.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar el repositorio para terminos adicionales de los checkpoints derivados.

## Enlaces

- Modelo principal: https://huggingface.co/North-ML1/wind-edge-1.7
- Version GGUF: https://huggingface.co/North-ML1/wind-edge-1.7-gguf
- Checkpoint base preentrenado: https://huggingface.co/arthu1/wind-lite-1-6-0326-beta1
