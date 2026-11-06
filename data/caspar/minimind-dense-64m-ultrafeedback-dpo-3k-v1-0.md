# caspar/MiniMind-Dense-64M-UltraFeedback-DPO-3K-v1.0

## Resumen

MiniMind-Dense-64M-UltraFeedback-DPO-3K-v1.0 es un modelo conversacional experimental de 63,9 millones de parametros creado por el usuario caspar a partir del proyecto open source MiniMind (derivado de jingyaogong/minimind). Se trata de un ajuste DPO (Direct Preference Optimization) a parametros completos sobre el modelo base caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0, utilizando 3.000 pares de preferencias del dataset UltraFeedback adaptado por el propio autor.

El objetivo del modelo es demostrar y documentar un ciclo completo de alineacion por preferencias en un modelo extremadamente pequeno: el entrenamiento completo (dos epocas, 170 actualizaciones del optimizador) tardo 18 segundos en una sola RTX 5090. Es relevante como recurso educativo y de investigacion reproducible, ya que el autor publica metricas detalladas, muestras comparativas antes/despues y sumas de verificacion SHA256 de los ficheros empaquetados.

La arquitectura es un transformer denso (no MoE) con tamano oculto 768, 8 capas y un vocabulario de 6.400 tokens. El contexto de entrenamiento es de 340 tokens, por lo que su utilidad practica como asistente es muy limitada; su valor principal esta en la experimentacion y el estudio del comportamiento de DPO en modelos minusculos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only, estilo MiniMind) |
| Parametros totales | 63.912.192 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 340 tokens (contexto de entrenamiento; los buffers posicionales admiten mas, sin garantia de calidad) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; entrenamiento e inferencia GPU reportadas en BF16 autocast) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 (las licencias de los datos de entrenamiento upstream siguen aplicando) |
| Formato de pesos | safetensors (FP32), tamano del repositorio 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 768 de tamano oculto, 8 capas y un vocabulario reducido de 6.400 tokens, heredado del proyecto MiniMind. El codigo de arquitectura es custom (`trust_remote_code=True`), por lo que el autor recomienda revisarlo antes de habilitarlo.

El entrenamiento consistio en DPO a parametros completos sobre el checkpoint SFT `caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0` (revision `7597c22aa4d3e7b2ac824b4b4be01158cccf1b8d`), que se mantuvo congelado como referencia y se verifico sin cambios tras el entrenamiento. Se uso el dataset `caspar/MiniMind-UltraFeedback-Short340-DPO-3K-v1.0` con 3.000 pares de preferencias seleccionados (2.700 train / 150 validacion / 150 test), con secuencias elegidas y rechazadas de menos de 340 tokens cada una, sin truncado, prompt y padding enmascarados y suma de log-probabilidades del ultimo turno del asistente. La configuracion fue: dos epocas, 170 actualizaciones, batch de 32 pares, AdamW con LR 5e-7, beta 0,1, warmup del 10 %, decaimiento coseno hasta el 10 %, weight decay 0, clipping 1,0 y semilla 42. Se selecciono la epoca 2 por perdida DPO en validacion; el conjunto de test no se uso para seleccion. El entrenamiento completo tardo 18,0 segundos en una RTX 5090.

## Capacidades

- Generacion de texto conversacional en ingles mediante chat template con formato de mensajes.
- Modelo alineado con DPO: el reward accuracy relativo a la referencia tras el DPO es del 67,33 % en el conjunto de validacion reservado.
- No hay soporte documentado de tool calling, function calling ni capacidades agenticas.
- Sin capacidades multimodales (solo texto).
- No soporta idiomas distintos del ingles de forma documentada.
- Capacidades de razonamiento, codigo o matematicas no establecidas; el propio autor advierte que las metricas de verosimilitud no demuestran mejor razonamiento general ni fiabilidad factual.

## Casos de uso

- Investigacion y docencia sobre DPO: al ser un modelo de 64M con entrenamiento de 18 segundos documentado al detalle (settings.json, environment.json, metrics.jsonl), es ideal para reproducir y estudiar ciclos completos de alineacion por preferencias sin coste computacional significativo.
- Comparacion antes/despues de alineacion: el fichero samples.json incluye 16 comparaciones greedy fijas antes y despues del DPO, utiles para analizar como afecta el DPO a las salidas de un modelo minusculo.
- Prueba de infraestructura de inferencia: su tamano de 0,3 GB en FP32 lo hace adecuado para verificar pipelines de carga, exportacion y despliegue (incluye comprobaciones de recarga del modelo exportado y sumas SHA256).
- Baseline experimental: sirve como punto de partida controlado para experimentos de cuantizacion, decodificacion o fine-tuning adicional en modelos de escala muy pequena.
- Prototipado de chat templates: permite probar el manejo de plantillas de conversacion con bloque de thinking vacio en transformers.
- No es adecuado para produccion como asistente: con 340 tokens de contexto y 64M de parametros, su calidad de respuesta es limitada y puede repetir o dar respuestas incorrectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El autor publica una evaluacion en el conjunto reservado de 150 pares:

| Metrica | Base SFT | DPO |
|---|---:|---:|
| Perdida DPO | 0,693147 | 0,645681 |
| Preference accuracy (secuencia completa) | 46,67 % | 46,67 % |
| Preference accuracy (por token) | 52,00 % | 52,00 % |
| NLL de respuesta elegida | 1,730305 | 1,735334 |
| PPL de respuesta elegida | 5,6424 | 5,6708 |

El reward accuracy relativo a la referencia tras el DPO es del 67,33 %. El autor subraya que el baseline identico esta empatado por definicion, que estas metricas no constituyen una tasa de victoria semantica y que la preference accuracy sobre secuencias completas es sensible a la longitud. Un conjunto de validacion pequeno y metricas de verosimilitud no establecen mejor razonamiento general ni fiabilidad factual.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo completo en FP32 ocupa unos 0,3 GB, por lo que es ejecutable en CPU y en cualquier GPU moderna.
- GPU recomendadas: ninguna en particular; el autor reporto inferencia GPU en BF16 autocast y entreno en una RTX 5090, pero cualquier GPU con 1 GB de VRAM o mas es suficiente.
- Cabe sobradamente en GPUs de consumo (incluso integradas) y en CPU.
- Despliegue: libreria transformers con `trust_remote_code=True` (revisar el codigo custom antes de habilitarlo). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Nota del autor: la salida en CPU FP32 puede diferir de las salidas greedy CUDA BF16 reportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| caspar/MiniMind-Dense-64M-UltraFeedback-DPO-3K-v1.0 | 63,9M | 340 tokens (entrenamiento) | Apache-2.0 | Hugging Face, safetensors FP32 |
| jingyaogong/minimind (familia original) | Desde ~26M | Variable segun version | Apache-2.0 / MIT (segun version) | Hugging Face y GitHub |
| Qwen2.5-0.5B-Instruct | ~500M | 32.768 tokens (hasta 131.072 con YaRN) | Qwen Research (no Apache para 0.5B) | Hugging Face |
| SmolLM2-135M-Instruct | ~135M | 8.192 tokens | Apache-2.0 | Hugging Face |

Frente a alternativas como SmolLM2-135M-Instruct o Qwen2.5-0.5B-Instruct, este modelo es notablemente mas pequeno y con un contexto mucho mas corto, por lo que su calidad conversacional es inferior; su ventaja diferencial es la trazabilidad experimental completa del proceso de DPO y el coste de entrenamiento casi nulo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de UltraFeedback, pueden heredarse los sesgos de ese dataset y del preentrenamiento upstream, cuyas licencias siguen aplicando.
- Riesgo de alucinacion: alto; el propio autor advierte que las respuestas generadas pueden repetirse o ser incorrectas y que las metricas de verosimilitud no garantizan fiabilidad factual.
- Contexto muy limitado: 340 tokens de entrenamiento; los buffers posicionales mayores no implican calidad en contextos largos.
- Solo ingles; no hay soporte documentado para otros idiomas, incluido el castellano.
- La preference accuracy de secuencia completa (46,67 %) no muestra mejora sobre el base y es sensible a la longitud; la mejora observable esta en metricas relativas a la referencia.
- Codigo de modelo custom: es obligatorio usar `trust_remote_code=True`, por lo que se recomienda revisar el codigo incluido antes de ejecutarlo.
- Posibles discrepancias entre inferencia CPU FP32 y CUDA BF16 en modo greedy.
- La exposicion previa al conjunto de evaluacion durante SFT o preentrenamiento no ha sido descartada.
- Uso experimental: no esta pensado para entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/MiniMind-Dense-64M-UltraFeedback-DPO-3K-v1.0
- Modelo base (SFT): https://huggingface.co/caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0
- Dataset de entrenamiento DPO: https://huggingface.co/datasets/caspar/MiniMind-UltraFeedback-Short340-DPO-3K-v1.0
- Proyecto MiniMind original (jingyaogong/minimind): https://github.com/jingyaogong/minimind
