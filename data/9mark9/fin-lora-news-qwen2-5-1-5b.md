# 9mark9/fin-lora-news-qwen2.5-1.5b

## Resumen

fin-lora-news-qwen2.5-1.5b es un adaptador LoRA publicado por el usuario 9mark9 (Nagizaaz Shaik) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su tarea es la clasificacion de sentimiento financiero en texto corto en ingles (titulares, fragmentos de noticias y tuits) en tres clases: Bearish (0), Bullish (1) y Neutral (2). El repositorio ocupa 0,1 GB y contiene 18.464.768 parametros de adaptador, con licencia Apache-2.0.

Tecnicamente, el modelo base sigue siendo un transformer decoder-only causal; el adaptador no genera texto, sino que la etiqueta se lee directamente de los logits de tres tokens de etiqueta en la ultima posicion de un prompt fijo. Esto reduce la inferencia a una unica pasada forward sobre una ventana de 256 tokens, sin decodificacion autorregresiva.

Su interes actual es doble: por un lado, demuestra que un ajuste LoRA sobre un modelo de 1,5B puede alcanzar un 84,6% de exactitud en un split de noticias con etiquetas automaticas y un 78,3% en titulares con etiquetas validadas manualmente; por otro, se publica acompanado de un estudio de robustez que documenta como el modelo puede ser dirigido mediante texto plantado en la entrada. El propio autor lo enmarca como material de investigacion y educacion, no como herramienta de decision financiera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 18.464.768 parametros de adaptador (modelo base: 1,5B) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el adaptador se entreno y se evaluo con una ventana de 256 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (pesos del adaptador en safetensors; el modelo base publica variantes GPTQ, AWQ y GGUF) |
| Idiomas soportados | en (solo ingles; no se evaluo en otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y adapter_config.json; libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only causal. La innovacion de diseno de este ajuste no esta en la arquitectura, sino en la cabeza de clasificacion: en lugar de anadir una capa nueva, se reutiliza la cabeza de lenguaje y se leen los logits de tres tokens de etiqueta en la ultima posicion del prompt. La funcion de perdida es entropia cruzada sobre esos tres logits. El resultado es que el modelo sigue siendo un LM causal, pero en la practica se comporta como un clasificador de tres clases que no emite texto.

Los hiperparametros de LoRA son r=16, alpha=32, dropout 0,05, sin bias, y modulos objetivo `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`. El entrenamiento uso AdamW con learning rate maxima 2e-4, weight decay 0,01, schedule one-cycle con 5% de warm-up, gradient clipping en 1,0 y semilla 0. El batch fue de 8 con acumulacion de gradientes 2, lo que da 719 pasos de optimizador en una sola pasada sobre los datos. Los pesos base se cargaron en bfloat16 con gradient checkpointing activado. El tiempo total de entrenamiento fue de 11.996 segundos (unas 3,3 horas) en una GPU de portatil, segun el README del repositorio. Las versiones fijadas son peft 0.21.1, transformers 5.18.0 y torch 2.14.1.

El conjunto de entrenamiento tiene 11.512 ejemplos, definidos en `finlora/news.py` (`train_mix`):

| Fuente | Ejemplos | Etiquetas | Licencia |
|---|---|---|---|
| NOSIBLE/financial-sentiment (fragmentos de noticias) | 8.000 | generadas por maquina (ensemble de LLM) | ODC-By 1.0 |
| zeroshot/twitter-financial-news-sentiment (tuits) | 2.000 | procedencia no documentada en la model card | MIT |
| Jean-Baptiste/financial_news_sentiment (titulares de notas de prensa, split train) | 1.512 | validadas manualmente | MIT |

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (Bearish, Bullish, Neutral) sobre texto corto en ingles: titulares, fragmentos de noticias y tuits.
- Lectura de etiqueta desde logits, sin generacion de texto: la salida es una de tres clases, no una respuesta redactada.
- Procesamiento de entradas de hasta 256 tokens, el limite usado en entrenamiento y evaluacion.
- Funcionamiento sobre el modelo base Qwen2.5-1.5B-Instruct, por lo que hereda su tokenizador (151.936 entradas de vocabulario) y su ventana de contexto de 32.768 tokens, aunque el adaptador solo fue entrenado en la parte baja de esa ventana.
- No soporta tool calling ni function calling: el adaptador esta entrenado exclusivamente para la tarea de clasificacion.
- No soporta agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible; solo se entreno y evaluo en ingles.
- Capacidad de generacion de texto libre: degradada respecto al modelo base, ya que el ajuste especializa la cabeza hacia tres tokens de etiqueta. No se publicaron evaluaciones de generacion tras el ajuste.

## Casos de uso

- Monitorizacion de flujos de noticias financieras: el adaptador permite etiquetar titulares y fragmentos en tiempo real como alcistas, bajistas o neutros. Al no requerir decodificacion autorregresiva, el coste por elemento es una unica pasada forward sobre 256 tokens, lo que lo hace apto para volumen alto.
- Analisis de sentimiento en redes sociales financieras: se entreno con 2.000 tuits de zeroshot/twitter-financial-news-sentiment, por lo que esta ajustado al registro informal y a la brevedad caracteristica de ese tipo de texto.
- Investigacion sobre robustez y ataques adversarios en NLP financiero: el repositorio incluye codigo y resultados de un experimento de texto plantado que mide la tasa de redireccion de la etiqueta. Es un caso de uso directo para estudiar la fragilidad de clasificadores financieros.
- Generacion de etiquetas auxiliares para anotacion: puede usarse como preanotador en un pipeline humano-en-el-bucle para corpus financieros en ingles, siempre con revision posterior (ver limitaciones sobre las etiquetas de NOSIBLE).
- Comparativa de metodos en docencia e investigacion: sirve como punto de referencia frente a baseline mas baratos (lexicos, modelos tipo BERT financiero) en estudios sobre relacion coste/precision en clasificacion de sentimiento.
- Filtrado previo en paneles de inteligencia de mercado: descartar o priorizar elementos neutros antes de un analisis mas costoso, reduciendo el numero de documentos que pasan a etapas posteriores.
- Analisis retroactivo de corpus historicos de titulares en ingles: dado su bajo requisito de hardware, permite procesar lotes grandes en una sola GPU de consumo o incluso en CPU.

## Benchmarks y rendimiento

| Conjunto de evaluacion | n | Exactitud | Macro-F1 | Fuente |
|---|---|---|---|---|
| Fragmentos de noticias, split dev (NOSIBLE, etiquetas automaticas) | 1.000 | 84,6% | 0,847 | `train_news-1.5b.json`, campo `dev` |
| Titulares de notas de prensa, split test (etiquetas manuales) | 267 | 78,3% | no calculado | `robustness_equities_lora_news_1.5b.json`, campo `models.lora_news_1.5b.clean_accuracy` |

Advertencias del propio autor sobre estas cifras:

- Las etiquetas de NOSIBLE son generadas por maquina y el adaptador se entreno con etiquetas del mismo tipo, por lo que la exactitud en splits de NOSIBLE sobrestima la concordancia con el juicio humano.
- El conjunto de titulares es el unico con etiquetas validadas manualmente, pero tiene 267 elementos, lo que implica un margen de error de aproximadamente 5 puntos.
- Se trata de una unica ejecucion de entrenamiento con una sola semilla; no hay intervalos de confianza.
- El adaptador no se paso por el script de evaluacion de tres conjuntos (`eval_news.py`), por lo que no hay cifras comprometidas de test para tuits ni para fragmentos de noticias.
- El split dev se puntuo al final del entrenamiento y no se uso para seleccionar hiperparametros ni checkpoints.

Sobre robustez, la model card describe un experimento en el que se anade una frase que nombra una etiqueta al final de cada entrada y se compara la respuesta con la obtenida sin editar. La metrica es la "forced rate": de los elementos en los que el modelo no daba ya la etiqueta plantada, la proporcion empujada hacia ella. Los valores numericos concretos no estan disponibles en la informacion extraida.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del adaptador: 18.464.768 parametros, aproximadamente 74 MB en fp32 y unos 37 MB en bfloat16. El repositorio completo ocupa 0,1 GB.
- Modelo base: 1,5B parametros, en torno a 3,1 GB de pesos en bfloat16 y cerca de 1 GB en cuantizacion de 4 bits.
- Cabe en GPU de consumo: con cuantizacion de 4 bits basta una GPU con 4-6 GB de VRAM; en bfloat16 completo, 8 GB son suficientes (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en CPU, dado el tamano reducido del modelo base.
- GPU profesionales: T4, L4, A10G, A100 y H100 son sobredimensionadas para este modelo, pero permiten lotes grandes y alto throughput.
- Opciones de despliegue: transformers combinado con peft (ruta nativa del repositorio), vLLM con soporte de adaptadores LoRA, y llama.cpp u Ollama si se fusionan los pesos y se convierte el modelo a GGUF.
- Latencia y throughput: no disponible. Cabe esperar el coste de una unica pasada forward sobre un maximo de 256 tokens por elemento, sin generacion autorregresiva, aunque no se han publicado medidas.
- Entrenamiento: 11.996 segundos (unas 3,3 horas) para 719 pasos en una GPU de portatil, segun el README del repositorio; no se especifica el modelo de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| 9mark9/fin-lora-news-qwen2.5-1.5b | 18,5M de adaptador (1,5B base) | 256 tokens en el adaptador (32.768 en el base) | Sentimiento financiero, 3 clases | Apache-2.0 | 84,6% (NOSIBLE dev, etiquetas automaticas); 78,3% (titulares, etiquetas manuales) |
| Qwen/Qwen2.5-1.5B-Instruct (base sin adaptador) | 1,5B | 32.768 tokens | Generacion de texto general, sin cabeza de clasificacion | Apache-2.0 | no disponible en la informacion proporcionada |
| ProsusAI/finbert | aproximadamente 110M (arquitectura tipo BERT) | 512 tokens | Sentimiento financiero, 3 clases | no verificada en la informacion proporcionada | no disponible en la informacion proporcionada |

No se han encontrado en los resultados de busqueda otros adaptadores LoRA comparables de sentimiento financiero sobre Qwen2.5-1.5B, por lo que la comparativa de rendimiento frente a alternativas directas no esta disponible.

## Limitaciones y advertencias

- El modelo es manipulable: anadir una frase que nombre una etiqueta al final de la entrada cambia la respuesta en una proporcion relevante de casos. El autor lo documenta y advierte explicitamente de que no debe usarse para decisiones automatizadas de trading ni para ninguna decision que mueva dinero.
- No es asesoramiento de inversion y su salida no es una prediccion de movimiento de precios.
- No ha sido evaluado en informes financieros (filings), transcripciones de llamadas de resultados, texto no ingles ni entradas de mas de 256 tokens.
- La exactitud del 84,6% se midio sobre etiquetas generadas por maquina, del mismo tipo que las usadas en entrenamiento, por lo que sobrestima la concordancia con anotacion humana.
- La unica evaluacion con etiquetas manuales tiene 267 elementos, con un margen de error de aproximadamente 5 puntos, y no se calculo macro-F1 para ella.
- Entrenamiento con una sola semilla y sin intervalos de confianza: la varianza entre ejecuciones no esta caracterizada.
- Riesgo de alucinacion: no aplica como generacion de texto, pero si como confianza mal calibrada, ya que el modelo siempre devuelve una de tres clases sin mecanismo de absteccion explicito.
- Sesgos conocidos: no disponible. No se publico ningun analisis de sesgo por sector, empresa o tipo de activo.
- Restricciones de licencia: el adaptador es Apache-2.0, pero las etiquetas del conjunto NOSIBLE fueron producidas por modelos de varios proveedores y su texto procede de sitios de noticias publicos. Cualquier uso comercial deberia revisarse por separado; la licencia del adaptador no resuelve esa cuestion. Las cifras de robustez se midieron sobre conjuntos con licencias restrictivas (CC-BY-NC-SA-3.0, CC-BY-NC-4.0, CC-BY-NC-ND-4.0) usados solo para inferencia.
- Produccion: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa. No se recomienda su uso en sistemas con consecuencias economicas sin una evaluacion exhaustiva previa y controles de robustez propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/9mark9/fin-lora-news-qwen2.5-1.5b
- Repositorio con codigo y resultados: https://github.com/shaikn6/fin-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Dataset NOSIBLE/financial-sentiment: https://huggingface.co/datasets/NOSIBLE/financial-sentiment
- Dataset zeroshot/twitter-financial-news-sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset Jean-Baptiste/financial_news_sentiment: https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
- Guia de ajuste fino de Qwen2.5 con QLoRA y LoRA: https://kaitchup.substack.com/p/qwen25-qlora-lora-and-full-fine-tuning
- Guia de despliegue y ajuste de Qwen2.5 en Alibaba Cloud PAI: https://www.alibabacloud.com/help/en/pai/use-cases/deploy-fine-tune-and-evaluate-a-qwen2-5-model
