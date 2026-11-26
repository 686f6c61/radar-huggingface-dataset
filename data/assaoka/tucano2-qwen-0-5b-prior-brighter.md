# Assaoka/Tucano2-qwen-0.5B-Prior-Brighter

## Resumen
Tucano2-qwen-0.5B-Prior-Brighter es un modelo de lenguaje pequeno (SLM) de aproximadamente 490,8 millones de parametros, desarrollado por Assaoka y derivado de la familia Qwen3 (arquitectura `qwen3` segun los tags de Hugging Face). No es un modelo generativo de proposito general, sino un modelo afinado para clasificacion de sentimiento y emociones en portugues de Brasil (PT-BR), empaquetado con `pipeline_tag: text-generation` porque reutiliza la cabeza generativa de Qwen3 y realiza la clasificacion mediante decodificacion guiada (guided decoding) con vLLM y Pydantic.

El modelo se construye mediante una estrategia de model merging: parte de cuatro especialistas fuera de dominio (FinBERT, ReLiSA, Phrasebank y GoEmotions, todos ellos variantes afinadas de Tucano2-qwen-0.5B) que se fusionan con TIES-Merging (peso 0,25, densidad 0,50) para actuar como inicializacion previa (prior) y, posteriormente, se afinan con SFT sobre el conjunto BRIGHTER de categorias emocionales. Forma parte del trabajo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026.

Su relevancia radica en demostrar que la fusion de especialistas pequenos seguida de un ajuste fino ligero puede ofrecer un unico modelo multitarea de menos de 500 millones de parametros para sentimiento y emociones en portugues, con licencia Apache 2.0 y coste de despliegue muy bajo. Es un modelo de investigacion con traccion limitada (17 descargas, 0 likes en el momento de la consulta) y resultados de benchmark declarados por el autor, no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (tag `qwen3`); clasificacion mediante decodificacion guiada |
| Parametros totales | 490.799.104 (aprox. 0,49 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura decoder-only de Qwen3 en su variante de 0,5 B, reutilizada por la familia Tucano2. Sobre esa base, el autor entrena cuatro especialistas independientes: `Tucano2-qwen-0.5B-FinBERT` (sentimiento financiero), `Tucano2-qwen-0.5B-ReLiSA` (resenas de libros), `Tucano2-qwen-0.5B-Phrasebank` (frases financieras) y `Tucano2-qwen-0.5B-GoEmotions` (emociones). Estos cuatro especialistas, todos fuera del dominio objetivo, se fusionan con TIES-Merging aplicando `weight = 0.25` y `density = 0.50`, lo que produce un punto de partida multitarea.

Sobre esa inicializacion fusionada se aplica un ajuste fino supervisado (SFT) especifico sobre BRIGHTER (ptbr), un conjunto de seis emociones multietiqueta. El resultado es un modelo que combina el conocimiento de los especialistas con la adaptacion al dominio objetivo. La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic, lo que restringe la salida generativa a las etiquetas validas de cada tarea. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset de SFT ni el uso de RLHF o DPO.

## Capacidades
- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) sobre texto de resenas, noticias financieras y frases financieras.
- Clasificacion de emociones multietiqueta: seis categorias en BRIGHTER y hasta 28 emociones en GoEmotions PT-BR.
- Generacion de texto condicionada a etiquetas mediante decodificacion guiada (guided decoding) con vLLM y validacion con Pydantic.
- Multitarea en un unico modelo de menos de 500 M de parametros, sin necesidad de desplegar un especialista por tarea.
- Integracion con el ecosistema `transformers` y con text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`).
- Capacidades multilingues limitadas al portugues; no se declaran otros idiomas.
- No se documentan tool calling, function calling, modo thinking, vision ni audio.

## Casos de uso
- Analisis de sentimiento de resenas de productos o libros en PT-BR: el modelo clasifica resenas (dominio ReLi-SA) con un Macro F1 declarado de 43,46 %, adecuado para triaje automatico de opiniones a gran escala con coste de inferencia minimo.
- Monitorizacion de sentimiento en noticias financieras: entrenado con Sentiments-FinBERT-PT-BR y Financial Phrasebank, puede etiquetar titulares y notas de prensa economicas (Macro F1 declarado de 71,04 % y 69,41 % respectivamente) para alimentar paneles de riesgo reputacional.
- Moderacion y deteccion de emociones en comunidades y redes sociales: con las 28 emociones de GoEmotions PT-BR puede clasificar comentarios de usuarios y priorizar revision humana en funcion de la emocion detectada (aunque el Macro F1 declarado en este conjunto es bajo, 16,08 %).
- Enrutamiento de tickets de soporte: la clasificacion de sentimiento permite derivar automaticamente quejas negativas a agentes senior y consultas neutras a colas estandar, reduciendo el tiempo de primera respuesta.
- Investigacion academica en PLN para portugues: sirve como linea base reproducible (Apache 2.0, pesos abiertos) para comparar estrategias de model merging frente a SFT conjunto en tareas de sentimiento y emocion.
- Prototipado rapido en entornos con recursos limitados: al ocupar aproximadamente 1 GB en safetensors, se puede desplegar en una unica GPU consumer o incluso en CPU para pruebas de concepto y validacion de pipelines de decodificacion guiada.
- Analisis de encuestas abiertas y feedback de clientes: permite agregar respuestas de texto libre en categorias de sentimiento y emocion para informes automaticos.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (no verificados de forma independiente), evaluados con decodificacion guiada via vLLM y Pydantic.

| Dataset / tarea | Metrica | Este modelo | Baseline zero-shot | Joint multi-tarea |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 43,46 % | 30,66 % | 59,51 % |
| ReLi-SA | Micro F1 | 63,35 % | 37,07 % | 74,51 % |
| ReLi-SA | Accuracy | 63,35 % | 37,07 % | 74,51 % |
| ReLi-SA | Hamming Loss | 0,3665 | 0,6293 | 0,2549 |
| BRIGHTER (ptbr) (emocion) | Macro F1 | 43,35 % | No disponible | No disponible |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 71,04 % | No disponible | No disponible |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 69,41 % | No disponible | No disponible |
| GoEmotions PT-BR (emocion) | Macro F1 | 16,08 % | No disponible | No disponible |

El baseline zero-shot corresponde a `Polygl0t/Tucano2-qwen-0.5B-Instruct`. La comparacion con el modelo Joint multi-tarea solo esta disponible para ReLi-SA en la informacion proporcionada, donde el Joint supera claramente a este modelo.

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 1 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, 2-4 GB son suficientes para lotes pequenos.
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB si se usa cuantizacion (no se documentan pesos cuantizados oficiales).
- GPU de datacenter (A100, H100) no necesarias; utiles solo para evaluacion a gran escala con vLLM y alto throughput.
- Despliegue recomendado: vLLM con guided decoding (usado por el autor en la evaluacion), `transformers` con `pipeline("text-generation")`, y text-generation-inference (tags compatibles). No se documentan pesos GGUF ni soporte explicito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos por peticion en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (ReLi-SA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Prior-Brighter | 0,49 B | No disponible | 43,46 % | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | 0,5 B (aprox.) | No disponible | 30,66 % | No disponible en la informacion | Hugging Face |
| Joint multi-tarea (SFT conjunto, mismo paper) | 0,5 B (aprox.) | No disponible | 59,51 % | No disponible en la informacion | Referenciado en el paper ENIAC 2026 |
| Tucano2-qwen-0.5B-FinBERT (especialista padre) | 0,5 B (aprox.) | No disponible | No disponible | No disponible en la informacion | Hugging Face |

La comparacion se limita a los modelos de la propia familia Tucano2 y al baseline Joint del paper; no se dispone de datos de benchmarks de alternativas externas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- Resultados de benchmark declarados por el autor y marcados como `verified: false`; no han sido replicados de forma independiente.
- Rendimiento muy desigual entre tareas: Macro F1 de 71,04 % en noticias financieras frente a 16,08 % en GoEmotions PT-BR, lo que desaconseja su uso en clasificacion fina de emociones sin validacion previa.
- En ReLi-SA queda por debajo del baseline Joint multi-tarea del mismo paper (43,46 % frente a 59,51 % de Macro F1), por lo que la estrategia de merging no es superior en todas las tareas.
- Modelo entrenado exclusivamente en portugues de Brasil; el rendimiento en portugues europeo u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Longitud de contexto no documentada; no se recomienda para entradas largas sin verificacion empirica.
- Riesgo de alucinacion y de etiquetas invalidas si no se usa decodificacion guiada; el autor evalua con vLLM y Pydantic precisamente para restringir la salida.
- Sesgos: los datasets de origen (resenas de libros, noticias financieras, redes sociales) pueden introducir sesgos de dominio y de estilo; no se documenta ninguna evaluacion de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es de investigacion y no se ofrece ninguna garantia de calidad en produccion.
- Retencion de pesos garantizada por el autor durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026); la disponibilidad a largo plazo no esta asegurada.
- Traccion muy baja (17 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en produccion ni comunidad de soporte.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-Brighter
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo padre FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo padre ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo padre Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo padre GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
