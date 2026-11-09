# jnordemann/partnercopilot-absa-qlora-v1

## Resumen

PartnerCopilot ABSA QLoRA v1 es un adaptador LoRA (QLoRA) publicado por jnordemann sobre el modelo base Qwen2.5-1.5B-Instruct. Su tarea es el analisis de sentimiento basado en aspectos (ABSA) sobre resenas en portugues: extrae hasta seis aspectos de una resena y asigna a cada uno una polaridad positiva o negativa, devolviendo un unico objeto JSON con la clave `aspects`. El modelo esta pensado para resenas sinteticas de reparto de comida y se presenta explicitamente como artefacto de investigacion sobre supervision sintetica.

El adaptador se entreno con 1.263 resenas sinteticas y 140 de validacion, sin datos reales de iFood, sobre una Tesla T4 con cuantizacion NF4. El checkpoint publicado (253) se selecciono por menor perdida de validacion entre tres candidatos. La relevancia actual es metodologica: documenta de forma inusualmente detallada el rendimiento en datos sinteticos y la degradacion al transferir a resenas reales de comercio electronico en portugues brasileno (B2W-Reviews01), incluyendo auditoria de solapamiento entre train y evaluacion.

El modelo base es un transformer decoder-only de 1.5B parametros con contexto de 32.768 tokens, licencia Apache 2.0 y soporte multilingue amplio, aunque el adaptador solo se ha evaluado en portugues. El repositorio del adaptador ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.5B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct (no verificado en la informacion proporcionada para el adaptador) |
| Tipos de cuantizacion | Entrenamiento en NF4 (bitsandbytes); cuantizaciones de inferencia del adaptador no disponibles |
| Idiomas soportados | Portugues (pt); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre Qwen2.5-1.5B-Instruct en la revision `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`. El entrenamiento se realizo con cuantizacion NF4 (QLoRA) en una Tesla T4, usando Transformers 5.20.2, TRL 1.17.1, PEFT 0.21.2, bitsandbytes 0.50.2 y PyTorch 2.11.0+cu130. El conjunto de entrenamiento consta de 1.263 resenas sinteticas de reparto de comida y 140 de validacion; no se usaron datos de iFood. Se evaluaron tres checkpoints y se publico el 253 por menor perdida de validacion.

La tarea es de extraccion estructurada: dado un texto en portugues, el modelo genera un unico objeto JSON con la clave `aspects`, con hasta seis aspectos y su polaridad. La validacion alcanzo 140/140 JSONs validos. La model card advierte de un solapamiento alto entre validacion y entrenamiento (84,1% de ocurrencias de frases compartidas) y entre gold y entrenamiento (70,4%), lo que limita la interpretacion de las metricas internas. No se documentan fases de RLHF o DPO especificas para el adaptador.

## Capacidades

- Extraccion de aspectos y polaridad (positiva/negativa) en resenas en portugues, con salida JSON estructurada bajo la clave `aspects`.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Salida en formato JSON validable: 140/140 JSONs validos en validacion y 172/200 en la evaluacion externa B2W.
- Procesamiento de resenas de dominio especifico: reparto de comida (el uso evaluado por el autor).
- Capacidades multilingues del modelo base (Qwen2.5), aunque el adaptador solo se ha evaluado en portugues.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en el adaptador.

## Casos de uso

- Analisis de resenas de reparto de comida: el adaptador extrae aspectos (por ejemplo, entrega, atencion, comida) y su polaridad en resenas sinteticas del dominio evaluado, devolviendo JSON listo para consumo downstream.
- Prototipado de pipelines ABSA: sirve como referencia reproducible para comparar supervision sintetica frente a modelos clasicos (la model card incluye una comparacion con TF-IDF).
- Investigacion sobre calidad de datos sinteticos: el artefacto documenta solapamiento train/eval y transferencia a datos reales, util para disenar protocolos de evaluacion mas estrictos.
- Extraccion estructurada en portugues: integrable en flujos que necesiten JSON con campos de aspecto y polaridad a partir de texto libre, con validacion de esquema posterior.
- Baseline ligero para experimentos academicos: al ser un adaptador de 1.5B, se puede ejecutar en hardware modesto (se entreno en una T4) para iterar rapidamente.
- Auditoria de modelos: los informes de evaluacion y el manifiesto con hashes permiten reproducir la evaluacion y verificar la revision exacta del modelo base y del tokenizador.

## Benchmarks y rendimiento

| Conjunto | Resenas | Macro-F1 |
|---|---:|---:|
| Gold con referencia humana | 100 | 0,9819 |
| Templates reservados | 346 | 0,9948 |
| Solo familias reservadas | 36 | 1,0000 (9 pares con soporte) |

Datos adicionales de la model card: en el gold, las etiquetas del generador coincidieron con la referencia humana en 87/100 resenas (macro-F1 0,9855); el QLoRA reprodujo las 13 divergencias de convencion del generador y confundio demora en la atencion con retraso en la entrega en dos resenas adicionales. En la evaluacion externa B2W-Reviews01 (200 textos), el adaptador produjo 172/200 JSONs validos; en los 30 textos anotados por una persona acerto todos los pares en 9/30 resenas, recupero 9 de los 12 pares anotados y anadio 20; diez de las 19 resenas con etiqueta vacia recibieron un par extra. TF-IDF acerto 18/30 por conjunto exacto, recupero 5 pares y anadio 8. La model card indica que la validez de formato y los falsos positivos en referencias vacias excedieron los limites del protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en una Tesla T4 (16 GB) con cuantizacion NF4, lo que da una referencia del orden de magnitud para el modelo base de 1.5B.
- GPU recomendadas: Tesla T4 (entrenamiento documentado); GPU consumer con al menos 16 GB son suficientes para el modelo base en cuantizacion, aunque no se documenta una configuracion de inferencia concreta.
- Cabe en GPU consumer: si, segun el tamano del modelo base (1.5B) y la referencia de entrenamiento en T4; no se detalla una lista de GPU verificadas.
- Opciones de despliegue: la libreria declarada es `peft`; el adaptador debe cargarse junto con Qwen2.5-1.5B-Instruct. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PartnerCopilot ABSA QLoRA v1 | 1.5B (base) + adaptador | 32.768 (base) | Adaptador LoRA para ABSA en portugues | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Modelo base instructivo multilingue | Apache 2.0 | Hugging Face |
| TF-IDF (baseline del autor) | no aplica | no aplica | Clasificador clasico | no disponible | Referencia en la model card |

No se dispone de datos de benchmarks comparativos con otros modelos ABSA en la informacion proporcionada; la unica comparacion publicada es frente al baseline TF-IDF en el recorte B2W descrito arriba.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo describe como un artefacto sobre supervision sintetica, no como un modelo listo para produccion.
- Transferencia limitada: en B2W-Reviews01 solo acerto todos los pares en 9/30 resenas y genero 20 pares adicionales; los resultados son especificos del pequeno recorte evaluado.
- Falsos positivos en resenas sin aspectos: 10 de 19 resenas con etiqueta vacia recibieron un par extra.
- Solapamiento train/eval: validacion y gold comparten 84,1% y 70,4% de ocurrencias de frases con el entrenamiento, lo que infla las metricas internas.
- Confusion de aspectos: confunde demora en la atencion con retraso en la entrega.
- Validez de formato insuficiente en datos reales: 172/200 JSONs validos en B2W, por debajo de los limites del protocolo del autor.
- Idioma: solo portugues evaluado; el rendimiento en otros idiomas no esta documentado.
- Sesgos: no se documentan sesgos especificos mas alla de los derivados de los datos sinteticos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion; verificar la licencia del modelo base en la revision fijada.

## Enlaces

- Hugging Face: https://huggingface.co/jnordemann/partnercopilot-absa-qlora-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base (revision fijada): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/989aa7980e4cf806f80c7fef2b1adb7bc71aa306/LICENSE
- Entrenamiento y configuracion: https://github.com/JoaoNordemann/partner-copilot/blob/10eca8a4f2f1e2ec7c7e8ca3dd05bd33ae58046b/reports/absa-qlora-train-v1/README.md
- Resultados y auditoria: https://github.com/JoaoNordemann/partner-copilot/blob/10eca8a4f2f1e2ec7c7e8ca3dd05bd33ae58046b/reports/absa-eval-checkpoint-253-v1/README.md
- Protocolo de evaluacion externa: https://github.com/JoaoNordemann/partner-copilot/blob/10eca8a4f2f1e2ec7c7e8ca3dd05bd33ae58046b/docs/absa-external-evaluation.md
- Manifiesto de evaluacion: https://github.com/JoaoNordemann/partner-copilot/blob/10eca8a4f2f1e2ec7c7e8ca3dd05bd33ae58046b/configs/absa-eval-v1.json
- B2W-Reviews01 (fuente y licencia): https://github.com/americanas-tech/b2w-reviews01/blob/4639429ec698d7821fc99a0bc665fa213d9fcd5a/README.md#licensing
