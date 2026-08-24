# hongduc05/qwen-chat-sum-9

## Resumen

Este repositorio contiene un adaptador PEFT LoRA desarrollado por hongduc05 para la tarea de resumen de conversaciones en vietnamita. El adaptador se basa en el modelo Qwen/Qwen3-1.7B, que se carga como base sin fusionar; en inferencia se adjunta dinámicamente mediante `LoRARequest` en vLLM. Resuelve el problema de generar resúmenes breves y fieles de diálogos en vietnamita, siguiendo una instrucción de sistema específica y un ejemplo one-shot manual.

El adaptador se entrenó con Unsloth en FP16/BF16 sin cuantización (no QLoRA), con rango LoRA 32, alpha 64 y dropout 0.03 sobre un conjunto de datos de 8074 filas tras la limpieza. La ventana de contexto de entrenamiento es de 1024 tokens y se generan hasta 70 tokens de resumen. El repositorio pesa 0.1 GB y no incluye el modelo base fusionado, por lo que requiere descargar Qwen3-1.7B por separado.

La relevancia de este modelo es su especialización: es un adaptador ligero y de bajo coste para un caso de uso concreto (resumen de chats en vietnamita), con métricas de evaluación reportadas sobre un conjunto de test retenido de 180 ejemplos. Su creador lo ha publicado en la misma serie que otros adaptadores similares (`qwen-chat-sum-8` y `qwen3-chat-sum`), lo que sugiere una línea de experimentación sistemática sobre resumen de diálogos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-1.7B (transformador) |
| Parametros totales | no disponible (adaptador PEFT; repositorio de 0.1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no aplica (entrenado en FP16/BF16 sin cuantizacion) |
| Idiomas soportados | vietnamita (tarea de resumen de conversaciones) |
| Licencia | no disponible (la del adaptador no se especifica; el base Qwen3-1.7B es Apache 2.0) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3-1.7B, un modelo transformer de 1.7B de parametros. No se usa cuantizacion durante el entrenamiento: se emplea Unsloth en FP16/BF16 con LoRA estandar (no QLoRA). La configuracion LoRA es de rango 32, alpha 64 y dropout 0.03, aplicada unicamente a las proyecciones de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`.

El entrenamiento utiliza una tasa de aprendizaje de 0.002 con scheduler coseno y warm-up del 3%, optimizador `adamw_torch`, batch por GPU de 4 con acumulacion de gradientes de 16 (batch efectivo de 64), peso de decaimiento 0 y un maximo de 4 epocas (se detuvo en la epoca 4). La mejor perdida de validacion es 0.971324, con perplejidad de 2.641439. El autor reporta que la corrida ganadora (`lr2e3-adamw-b4-ga16`) coincide con la linea base, con una mejora absoluta de 0.000000, lo que indica que no hubo mejora respecto a esa configuracion de referencia.

El prompt incluye una instruccion de sistema en vietnamita y un ejemplo one-shot manual (conversacion de An, Binh, Chi y Dung) para guiar el formato del resumen. El modo de pensamiento del modelo base esta deshabilitado con `enable_thinking=False`. La division de datos se realizo agrupando por chat normalizado con semilla 42, dejando 180 filas de validacion y 180 de test; el resto se uso para entrenamiento.

## Capacidades

- Resumen de conversaciones en vietnamita: genera resumenes de 1-2 frases a partir de dialogos multi-turno.
- Sigue una instruccion de sistema especifica en vietnamita que restringe el formato de salida (sin titulos, sin repeticiones, sin inventar informacion).
- Utiliza un one-shot manual fuera del dataset para fijar el estilo de respuesta.
- Desactivacion del modo thinking del modelo base, lo que reduce latencia y tokens de salida.
- Inferencia mediante vLLM con `LoRARequest`, sin necesidad de fusionar el adaptador con el modelo base.
- Tokenizacion de metricas con la libreria `underthesea` para el vietnamita.

## Casos de uso

- **Resumen de conversaciones de atencion al cliente**: el adaptador puede resumir hilos de chat de soporte en vietnamita, extrayendo los puntos clave (problema reportado, solucion acordada, proximos pasos) en 1-2 frases, lo que facilita el traspaso entre agentes o el registro en ticketing.
- **Resumen de chats de equipos de desarrollo**: conversaciones de grupos de trabajo con decisiones tecnicas pueden condensarse en resumenes accionables para actas de reunion o documentacion ligera.
- **Resumen de hilos de soporte tecnico**: en foros o plataformas de ayuda, el adaptador puede generar un resumen del hilo para indexarlo en bases de conocimiento, reduciendo el tiempo de busqueda de soluciones recurrentes.
- **Resumen de conversaciones de ventas**: chats de venta o negociacion en vietnamita se pueden resumir para registrar acuerdos, condiciones o quejas del cliente, manteniendo la fidelidad de la informacion.
- **Resumen de chats de comunidades y redes sociales**: en moderacion o analisis de sentimiento, el adaptador condensa conversaciones largas en resumenes que permiten revisar rapidamente el tono y los temas tratados.
- **Preparacion de datos para entrenamiento**: el adaptador puede usarse para generar resumenes de dialogos sinteticos o reales, creando datasets de entrenamiento para otros modelos de resumen en vietnamita.

## Benchmarks y rendimiento

Los resultados de evaluacion sobre el conjunto de test retenido (180 filas) son los siguientes:

| Metrica | Valor |
|---|---|
| Mean BLEU | 0.167026 |
| Mean ROUGE-1 F1 | 0.513955 |
| Mean ROUGE-2 F1 | 0.237732 |
| Mean ROUGE-L F1 | 0.434672 |
| Mean METEOR | 0.435128 |
| Latencia media (s) | 3.354208 |
| Latencia p50 (s) | 3.226356 |
| Latencia p95 (s) | 4.395793 |

La tokenizacion de las metricas se realiza con `underthesea` para el vietnamita, y METEOR usa coincidencias exactas de tokens vietnamitas sin stemming en ingles ni WordNet. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen3-1.7B en FP16 ocupa aproximadamente 3.4 GB; el adaptador LoRA anade unos pocos MB. Se recomienda al menos 6 GB de VRAM para inferencia comoda.
- **GPU recomendadas**: cualquier GPU de consumo con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) o GPUs de datacenter (A10, A100, H100) para despliegues con mayor concurrencia.
- **Compatibilidad con GPU de consumo**: si, el modelo base de 1.7B en FP16 cabe en GPUs de consumo modernas; en cuantizacion INT8 o INT4 cabria incluso en 4 GB.
- **Opciones de despliegue**: vLLM con `LoRARequest` (opcion documentada por el autor), tambien compatible con Ollama, llama.cpp o TGI si se fusiona el adaptador con el base.
- **Latencia y throughput**: la latencia medida en el test es de 3.35 s de media (p50 3.23 s, p95 4.40 s) por peticion, con `max_tokens=70` y sampling `temperature=0.7, top_p=0.8, top_k=20`.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `hongduc05/qwen-chat-sum-9` (este) | Adaptador LoRA | Qwen3-1.7B | 1024 (entrenamiento) | no disponible | Resumen de chats vietnamita |
| `hongduc05/qwen-chat-sum-8` | Adaptador LoRA | no disponible | no disponible | no disponible | Mismo autor, tarea similar |
| `hongduc05/qwen3-chat-sum` | Adaptador LoRA | no disponible | no disponible | no disponible | Mismo autor, tarea similar |
| Qwen3-1.7B (base) | Modelo completo | 1.7B | 32k (nominal) | Apache 2.0 | Modelo generalista, sin especializacion en resumen vietnamita |

No hay datos publicados de rendimiento comparativo entre estos adaptadores. La comparacion con el base Qwen3-1.7B no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Idioma**: el modelo esta especializado en resumen de conversaciones en vietnamita; su rendimiento fuera de este idioma no esta documentado y probablemente sea muy limitado.
- **Contexto corto**: la ventana de entrenamiento es de 1024 tokens, por lo que conversaciones mas largas podrian perder informacion o requerir truncado.
- **Salida limitada**: `max_tokens=70` restringe el resumen a 1-2 frases; no es adecuado para resumenes extensos.
- **Licencia no especificada**: el adaptador no declara licencia; el uso comercial queda en un limbo legal hasta que el autor la aclare (el base Qwen3-1.7B es Apache 2.0, pero el adaptador es una obra derivada sin licencia explicita).
- **Dependencia del modelo base**: el adaptador no es autocontenido; requiere descargar Qwen3-1.7B y cargarlo en FP16 para funcionar.
- **Datos de test no publicados**: el archivo Excel con los resumenes de test no se subio al repositorio, lo que dificulta la reproduccion independiente de las metricas.
- **Sin mejoras sobre la linea base**: el autor reporta que la mejora absoluta respecto a la configuracion baseline es 0.000000, lo que sugiere que el adaptador no aporta ventaja medible sobre la configuracion de referencia.
- **Riesgo de alucinacion**: aunque la instruccion de sistema prohibe inventar contenido, el modelo puede alucinar detalles en conversaciones ambiguas o con contexto truncado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hongduc05/qwen-chat-sum-9
- Adaptador relacionado (qwen-chat-sum-8): https://huggingface.co/hongduc05/qwen-chat-sum-8
- Adaptador relacionado (qwen3-chat-sum): https://huggingface.co/hongduc05/qwen3-chat-sum
- Qwen oficial: https://qwen.ai/home
- Qwen Studio: https://chat.qwen.ai/
