# gpillon/detoxify-multilingual-debiased-softmax-ref

## Resumen

`gpillon/detoxify-multilingual-debiased-softmax-ref` es una conversion del checkpoint `multilingual_debiased-0b549669.ckpt` del proyecto detoxify (Unitary AI, release v0.4-alpha) al formato `XLMRobertaForSequenceClassification` de Hugging Face, publicada por el usuario gpillon. El modelo original es un clasificador multilingue de toxicidad basado en XLM-RoBERTa base, con 278 millones de parametros y una cabeza multi-etiqueta de 16 salidas que cubre las siete clases de detoxify (toxicity, severe_toxicity, obscene, identity_attack, insult, threat, sexual_explicit) mas nueve subgrupos de identidad del head "debiased".

La particularidad de esta variante es que anade una decimoséptima salida llamada `sigmoid_reference`, con pesos y sesgo a cero, de modo que su logit es siempre 0. Esto permite recuperar exactamente la sigmoid original a partir de un softmax aplicado sobre las 17 etiquetas, mediante la formula `sigmoid(z_i) = p_i / (p_i + p_ref)`. El objetivo es servir el modelo en runtimes que aplican softmax de forma obligatoria a clasificadores de secuencia (por ejemplo, el runtime HuggingFace del detector de guardrails de OpenShift AI), donde las puntuaciones por etiqueta dejan de ser interpretables como probabilidades independientes.

Es relevante para equipos que despliegan filtros de toxicidad en produccion sobre infraestructura que impone softmax: sin esta variante, las puntuaciones se distorsionan (el ejemplo de la model card pasa de toxicity 0.973 e insult 0.919 a 0.747 y 0.232 respectivamente). El modelo soporta siete idiomas declarados y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de secuencia multi-etiqueta |
| Parametros totales | 278.056.721 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base soporta hasta 512 tokens de posiciones, no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | multilingual, en, fr, es, it, pt, tr, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (+ tokenizer) |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa base (`FacebookAI/xlm-roberta-base`, revision `e73636d4f797dec63c3081bb6ed5c7b0bb3f2089`) con una cabeza `XLMRobertaForSequenceClassification` de 17 salidas: las 16 originales del checkpoint detoxify `multilingual_debiased` mas `sigmoid_reference`. La decimoseptima fila de la cabeza tiene pesos y sesgo a cero, por lo que su logit es constantemente 0 y todos los demas tensores son bit-identicos a la conversion plana (`gpillon/detoxify-multilingual-debiased`). El entrenamiento original corresponde a detoxify v0.4-alpha (autoria de Laura Hanu y el equipo de Unitary AI); esta publicacion es unicamente una conversion de formato, no un reentrenamiento.

La innovacion tecnica es de servicio, no de modelado: al fijar un logit de referencia a 0, un runtime que aplique softmax sobre las 17 etiquetas produce `p_i / p_ref = e^{z_i}`, lo que permite reconstruir la sigmoid original de forma exacta con `sigmoid(z_i) = p_i / (p_i + p_ref)`. El script `convert.py` verifica el SHA256 del checkpoint origen (`0b5496691403977207f24778695389494a412a76c2cb351e99f024f2a4e3f3ff`), comprueba el conjunto de etiquetas y el state dict, y valida cuatro frases (dos toxicas en italiano e ingles, una obscena en ingles y una limpia en italiano) con tolerancia atol 1e-5 y error maximo medido de 6e-8. `verify.py` compara contra el paquete `detoxify` en 8 frases de 5 idiomas con diferencia maxima de 8e-7.

## Capacidades

- Clasificacion multi-etiqueta de toxicidad con 16 salidas independientes (siete clases detoxify y nueve subgrupos de identidad).
- Deteccion de toxicidad severa, obscenidad, ataque por identidad, insulto, amenaza y contenido sexual explicito.
- Puntuacion desagregada por subgrupos de identidad: hombre, mujer, homosexual/gay/lesbiana, cristiano, judio, musulman, negro, blanco y enfermedad psiquiatrica o mental.
- Soporte multilingue declarado para ingles, frances, espanol, italiano, portugues, turco y ruso, ademas de la etiqueta generica `multilingual`.
- Recuperacion exacta de sigmoids a partir de un softmax de runtime mediante la salida `sigmoid_reference`.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un clasificador de secuencias.

## Casos de uso

- Moderacion de comentarios en plataformas multilingues: el modelo puntua cada mensaje con 16 etiquetas independientes, lo que permite aplicar umbrales distintos por categoria (por ejemplo, uno mas estricto para `threat` que para `insult`) sobre contenido en espanol, frances, italiano o portugues sin desplegar un modelo por idioma.
- Filtrado previo en pipelines de datos de entrenamiento: integrado como etapa de clasificacion por lotes, descarta documentos toxicos antes de alimentar un corpus de preentrenamiento o fine-tuning, usando las etiquetas de identidad para auditar la representacion de subgrupos.
- Guardrails en produccion sobre OpenShift AI: el caso de diseno explicito de esta variante; se despliega en el runtime HuggingFace del detector de guardrails con `threshold: 0.0` y `safe_labels: []`, y el cliente reconstruye las sigmoids antes de aplicar los umbrales calibrados.
- Monitorizacion de comunidades y foros: clasificacion en tiempo casi real de mensajes para alertar a moderadores humanos, con la ventaja de que las puntuaciones por etiqueta son comparables entre idiomas al compartir encoder y cabeza.
- Evaluacion de sesgos en sistemas generativos: uso de las nueve etiquetas de identidad para medir si las salidas de un LLM contienen ataques dirigidos a grupos concretos, como parte de una bateria de evaluacion de seguridad.
- Analisis de reputacion de marca en redes sociales: agregacion de puntuaciones de toxicidad e insulto sobre menciones multilingues para priorizar la revision de crisis, con la posibilidad de calibrar umbrales por mercado e idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificaciones de equivalencia numerica frente al checkpoint original y al paquete `detoxify` (error maximo 6e-8 en la recuperacion de sigmoids y 8e-7 frente a `Detoxify('multilingual').predict`), no metricas de calidad tipo AUC, precision o recall sobre conjuntos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos (tamano del repo) mas activaciones; en fp16 el peso baja a unos 560 MB. Cifras orientativas calculadas a partir del numero de parametros, no publicadas por el autor.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, asi como en GPUs de datacenter (A100, H100) donde el cuello de botella sera el throughput, no la memoria.
- Tambien es viable en CPU para cargas de moderacion de baja concurrencia, dado el tamano base del encoder.
- Opciones de despliegue: `transformers` (uso directo documentado en la model card), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`) y el runtime de guardrails de OpenShift AI con `SAFE_LABELS=[]`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gpillon/detoxify-multilingual-debiased-softmax-ref | 278 M | no disponible | en, fr, es, it, pt, tr, ru | Apache-2.0 | Variante con salida de referencia para runtimes con softmax |
| gpillon/detoxify-multilingual-debiased | no disponible | no disponible | no disponible | no disponible | Conversion plana del mismo checkpoint, sin la salida `sigmoid_reference` |
| unitary/toxic-bert (detoxify original, variante inglesa) | no disponible | no disponible | en | Apache-2.0 | Modelo de referencia del proyecto detoxify para ingles |
| FacebookAI/xlm-roberta-base | 278 M | 512 posiciones (segun arquitectura base) | 100 idiomas | MIT | Modelo base sin cabeza de clasificacion; no es un detector de toxicidad |

## Limitaciones y advertencias

- Esta variante solo debe usarse si el runtime aplica softmax sobre el clasificador de secuencia; en cualquier otro caso hay que emplear la conversion plana, segun indica el propio autor.
- El cliente debe solicitar puntuacion para todas las etiquetas, incluida `sigmoid_reference`; si el runtime filtra por umbral, este debe fijarse a 0, ya que en caso contrario la etiqueta de referencia se descarta precisamente cuando el texto es toxico.
- Los umbrales deben recalibrarse sobre las sigmoids recuperadas, que son mucho mas altas que las puntuaciones softmax brutas (0.973 frente a 0.747 en el ejemplo de la model card).
- Riesgo de sesgo y alucinacion: el autor remite a la seccion de limitaciones y consideraciones eticas del README de detoxify; no se documentan en esta ficha sesgos concretos medidos.
- Cobertura linguistica limitada a los siete idiomas declarados; el rendimiento fuera de ellos no esta caracterizado.
- El modelo es un clasificador, no un generador: no puede explicar sus decisiones ni producir texto.
- Licencia Apache-2.0 permite uso comercial, pero el credito del entrenamiento corresponde a los autores de detoxify (Unitary AI); el modelo base XLM-RoBERTa se distribuye bajo MIT.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/gpillon/detoxify-multilingual-debiased-softmax-ref
- Conversion plana: https://huggingface.co/gpillon/detoxify-multilingual-debiased
- Checkpoint origen: https://github.com/unitaryai/detoxify/releases/download/v0.4-alpha/multilingual_debiased-0b549669.ckpt
- Repositorio detoxify: https://github.com/unitaryai/detoxify
- Limitaciones y consideraciones eticas de detoxify: https://github.com/unitaryai/detoxify#limitations-and-ethical-considerations
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
