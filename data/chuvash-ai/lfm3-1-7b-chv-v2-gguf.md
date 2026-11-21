# chuvash-ai/LFM3-1.7B-chv-v2-GGUF

## Resumen

LFM3-1.7B-chv-v2-GGUF es la distribucion en formato GGUF del modelo LFM3-1.7B-chv-v2, un modelo de traduccion especializado en el par chuvasio-ruso desarrollado por la organizacion chuvash-ai. El modelo parte del LFM3-1.7B de LiquidAI y ha sido afinado especificamente para traduccion, con un total de 1.728.801.600 parametros (aproximadamente 1,7 mil millones). Este repositorio concreto anade una plantilla de chat de traductor que permite usar el modelo directamente en LM Studio, llama.cpp server y cualquier aplicacion que renderice plantillas de chat GGUF.

La relevancia de esta publicacion radica en que el modelo original fue entrenado como traductor de estilo completion, no como modelo conversacional. La plantilla de chat nativa de LFM3 envolvia los mensajes en un formato que el modelo nunca vio durante el entrenamiento, degradando la calidad de las traducciones. Este repo mantiene los pesos cuantizados identicos pero sustituye la plantilla de chat por una que renderiza cada peticion en el formato exacto de entrenamiento, con salidas verificadas como identicas byte a byte a las de las peticiones de completion en crudo.

El modelo esta pensado para entornos de bajos recursos linguisticos, concretamente el chuvasio, una lengua minoritaria de la familia turkica hablada en la region del Volga. El repositorio ocupa 1,1 GB y distribuye pesos en Q4_K_M, lo que lo hace desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (hibrida conv/attention), segun la model card |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | chuvasio (chv), ruso (ru) |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 M USD de ingresos anuales) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura LFM3 de LiquidAI, descrita en la model card como hibrida conv/attention. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo original fue afinado como traductor de estilo completion con el formato exacto:

```
Переведи на чувашский язык.

{texto origen}

Перевод:
```

El repositorio GGUF no reentrena ni modifica los pesos: los tensores son identicos a los del GGUF del repositorio principal. Las unicas diferencias son la plantilla `tokenizer.chat_template` y el campo `general.name`. La plantilla nueva renderiza cada peticion en el formato de entrenamiento, y el autor indica que las salidas han sido verificadas como identicas byte a byte a las de las peticiones de completion sin plantilla.

Una innovacion destacable es el control de direccion de traduccion mediante system prompt: sin system prompt el modelo traduce de ruso a chuvasio (sentido por defecto); con el system prompt `Переведи на русский язык.` traduce de chuvasio a ruso. El modelo no es un modelo de razonamiento y nunca emite `</think>`.

## Capacidades

- Traduccion de texto entre ruso y chuvasio en ambos sentidos, mediante control explicito de direccion por system prompt.
- Traduccion de un solo turno: el modelo no esta disenado para conversacion multi-turno.
- Compatibilidad con plantillas de chat GGUF en LM Studio y llama.cpp server, ademas de la API `/completion` en crudo.
- Funcionamiento en modo greedy (temperature 0) para traduccion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking ni de capacidades de vision o audio.
- Cobertura linguistica limitada a chuvasio y ruso; no se documentan otros idiomas.

## Casos de uso

- Traduccion de documentacion administrativa al chuvasio: el modelo permite convertir textos oficiales en ruso a chuvasio para servicios publicos regionales, con direccion controlada por system prompt y salida greedy determinista.
- Localizacion de contenidos web para comunidades chuvasio-parlantes: se puede integrar en un pipeline que reciba HTML o texto plano en ruso y devuelva la version en chuvasio, procesando cada fragmento como peticion independiente de un solo turno.
- Digitalizacion y traduccion de patrimonio cultural: traduccion de textos literarios o etnograficos del chuvasio al ruso para investigadores que no dominan la lengua, usando el sentido chv→ru mediante system prompt.
- Generacion de subtitulos y material educativo bilingue: el modelo puede producir pares de frases ru/chv para materiales didacticos de escuelas de la region, con Q4_K_M suficiente para servir en hardware modesto.
- Traduccion asistida en herramientas de escritorio: despliegue local en LM Studio con Q4_K_M (1,1 GB de repo) para traductores que trabajan con textos cortos y necesitan confidencialidad sin enviar datos a la nube.
- Preprocesado de corpus para NLP de bajos recursos: uso del modelo para generar traducciones sinteticas chv→ru que alimenten corpus de entrenamiento o evaluacion de otros sistemas de NLP para el chuvasio.
- Integracion en servidores llama.cpp para APIs de traduccion: `llama-server -m ... --jinja --temp 0` expone un endpoint compatible con clientes que consumen traduccion bajo demanda.

## Benchmarks y rendimiento

Metrica: chrF++ (sacrebleu, a nivel de corpus), test held-out fijo, decodificacion greedy.

| Variante | Motor | ru→chv | chv→ru |
|---|---|---:|---:|
| LFM3-1.7B-chv-v2 bf16 | transformers | 34,89 | 35,10 |
| Q4_K_M (este repo) | llama.cpp | 30,03 | no disponible |

El autor indica que la arquitectura hibrida conv/attention pierde aproximadamente 2,6-4,9 puntos de chrF con Q4_K_M, y recomienda usar bf16 del repositorio principal para benchmarking y Q4 para servir. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,1 GB y solo se distribuye Q4_K_M; con overhead de contexto y cache KV, la huella tipica se situa en torno a 2 GB o menos, aunque no se publican cifras oficiales.
- GPU recomendadas: no se especifican modelos concretos; por tamano, cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar Q4_K_M.
- Cabe en GPU consumer: si, previsiblemente en GTX/RTX de gama media y en GPUs integradas con suficiente memoria compartida, aunque el autor no confirma modelos concretos.
- Opciones de despliegue: llama.cpp (requiere build posterior a b11938, donde se integro la arquitectura `lfm3`, del 27 de octubre de 2026), llama-server, LM Studio con motor llama.cpp 2.65.1 o superior, y cualquier runtime compatible con GGUF y plantillas Jinja.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-chv-v2-GGUF (este) | 1,7 B | no disponible | chrF++ 30,03 ru→chv (Q4_K_M) | LFM Open License v1.0 | GGUF en HF |
| LFM3-1.7B-chv-v2 (bf16) | 1,7 B | no disponible | chrF++ 34,89 ru→chv / 35,10 chv→ru | LFM Open License v1.0 | Pesos bf16 en HF |
| LFM3-1.7B (base LiquidAI) | 1,7 B | no disponible | no disponible para chuvasio | LFM Open License v1.0 | HF |

No se dispone de informacion sobre otros modelos especializados en traduccion chuvasio-ruso para una comparativa adicional.

## Limitaciones y advertencias

- El modelo es un traductor de un solo turno; no debe usarse como chatbot conversacional.
- El modo de razonamiento debe estar desactivado: el modelo nunca emite `</think>`, y si la aplicacion activa el parseo de razonamiento, la respuesta queda vacia.
- La plantilla de chat original de LFM3 degrada la calidad de traduccion; es imprescindible usar la plantilla incluida en este repo o el formato de prompt en crudo.
- La cuantizacion Q4_K_M introduce una perdida de calidad de aproximadamente 2,6-4,9 puntos chrF frente a bf16.
- Cobertura linguistica limitada a chuvasio y ruso; no se documentan otros idiomas ni capacidades multilingues.
- Riesgo de alucinacion en textos largos, terminologia especializada o dominios tecnicos no cubiertos por el entrenamiento; no se publican evaluaciones al respecto.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia LFM Open License v1.0: uso comercial permitido solo por debajo de 10 M USD de ingresos anuales; por encima se requiere licencia adicional de LiquidAI.
- Requiere builds de llama.cpp posteriores a b11938 (27 de octubre de 2026) para reconocer la arquitectura `lfm3`; engines antiguos fallan con `unknown architecture: 'lfm3'`.
- No soporta tool calling, agentes ni reasoning, lo que limita su integracion en pipelines complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2-GGUF
- Modelo base (bf16): https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2
- Modelo original LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Organizacion chuvash-ai: https://huggingface.co/chuvash-ai
