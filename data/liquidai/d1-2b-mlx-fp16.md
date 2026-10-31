# LiquidAI/d1-2B-MLX-fp16

## Resumen

d1-2B-MLX-fp16 es la versión en formato MLX y precisión FP16, optimizada para Apple Silicon, del modelo d1-2B de Liquid AI. d1-2B no es un modelo de lenguaje generativo convencional, sino un "modelo de decisión" multimodal que responde preguntas con nombre y tipo (sí/no, clasificación, puntuación, conteo, localización) sobre un estado dado (texto, imagen o vídeo) devolviendo probabilidades calibradas en una sola pasada hacia adelante, sin generar tokens de salida.

Esto lo posiciona en una categoría propia: en lugar de producir texto libre que luego hay que parsear, entrega respuestas estructuradas y calibradas directamente, lo que resulta muy relevante para tareas de clasificación, enrutado y calibración en el borde (edge), donde la latencia, el coste por consulta y la fiabilidad del formato de salida son críticos. Con cerca de 1.918 millones de parámetros y un peso en disco de 3,84 GB, está pensado para ejecutarse en dispositivos locales, especialmente Mac con Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models), modelo de decisión multimodal "system one" |
| Parametros totales | 1.918.181.888 (dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (version MLX-fp16; no existe exportacion BF16, FP16 es la precision recomendada) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia propia "other" de Liquid AI) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

d1-2B se basa en la familia LFM3 de Liquid AI y hereda su enfoque de arquitecturas "liquid" eficientes para el edge. Su rasgo distintivo es el paradigma "system one": en lugar de decodificar tokens autoregresivamente, el modelo evalua un estado (texto, imagen o video) y responde un conjunto de preguntas con nombre y tipo en una unica pasada hacia adelante. Los tipos de pregunta documentados incluyen binario ("noul"), eleccion simple o multiple ("choice"), puntuacion sobre una escala ("score"), numero con rango y paso ("number") y caja de localizacion con coordenadas normalizadas ("box"), cada una con probabilidades calibradas.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO: no disponible. El repositorio es una conversion a MLX en FP16 del checkpoint original (LiquidAI/d1-2B), que se ejecutaba en float32; FP16 es la precision recomendada por ser la mas cercana al checkpoint original.

## Capacidades

- Respuesta de preguntas con nombre y tipo sobre un estado de texto: binario, eleccion multiple, puntuacion, con probabilidades calibradas.
- Respuesta en una sola pasada sin generacion de tokens (output_tokens: 0), lo que elimina la latencia de decodificacion autoregresiva.
- Comprension multimodal: puede usar una imagen como estado completo y responder preguntas de conteo ("number") y localizacion ("box") sobre ella.
- Soporte de video como estado, segun la model card original.
- Varias preguntas sobre el mismo estado en una unica llamada (`model.system_one`) y procesamiento por lotes (`model.system_one_batch`).
- Salidas estructuradas en JSON listas para integracion en pipelines, sin necesidad de parsing de texto libre.
- Soporte multilingue en 16 idiomas, incluido el castellano.
- Ejecucion local en Apple Silicon mediante MLX.

## Casos de uso

- Enrutado de tickets de soporte: clasifica cada ticket por equipo (billing, shipping, technical) y detecta multiples temas en una sola pasada, con probabilidades calibradas para establecer umbrales de confianza y escalado a humanos.
- Moderacion y clasificacion de contenido: decide de forma binaria o multiclase si un mensaje incumple politicas, con calibracion que permite ajustar el punto de operacion segun el coste de falsos positivos y falsos negativos.
- Priorizacion automatica: asigna puntuaciones de urgencia ("score") a mensajes o tickets, util para colas de atencion al cliente o triaje de incidencias.
- Analisis visual rapido: cuenta objetos en una imagen o localiza elementos con coordenadas de caja normalizadas, util para inventario visual, comprobacion de imagenes o automatizaciones en dispositivos Apple.
- Extraccion de atributos estructurados: convierte texto no estructurado en campos tipados (booleanos, categorias, numeros en rango) para alimentar bases de datos o sistemas downstream sin LLM generativo.
- Despliegue en el edge con coste predecible: al no generar tokens, el coste y la latencia por consulta son constantes, ideal para clasificacion masiva en local o en dispositivos con recursos limitados.
- Calibracion de sistemas de decision: las probabilidades calibradas permiten usar el modelo como juez o verificador de bajo coste sobre las salidas de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia operativa, el ejemplo de la model card reporta 189 tokens de entrada y 0 tokens de salida para una consulta con cuatro preguntas sobre un mismo estado.

## Requisitos de hardware

- Los pesos ocupan 3,84 GB en FP16; para inferencia en MLX conviene contar con al menos 6-8 GB de memoria unificada disponibles.
- Pensado para Apple Silicon (Mac con chips M1/M2/M3/M4) mediante el framework MLX; no requiere GPU discreta NVIDIA.
- Cabe comodamente en portatiles Apple Silicon con 8 GB de RAM o mas; no aplica la distincion tipica de consumer GPUs NVIDIA (RTX 4090, etc.) al tratarse de un formato especifico de Apple.
- Despliegue mediante MLX-VLM (soporte en progreso segun la model card) o la CLI `python -m mlx_vlm decide`; tambien existe el modelo base LiquidAI/d1-2B para otros entornos.
- Latencia y throughput: no disponible en cifras concretas; al responder sin generar tokens (0 output tokens), la latencia por consulta es independiente del numero de preguntas sobre el mismo estado.

## Comparativa con modelos similares

d1-2B pertenece a una categoria poco poblada (modelos de decision calibrados sin generacion de tokens), por lo que la comparacion directa es limitada. Se ofrecen referencias frente a modelos multimodales pequenos generativos de la misma casa y de tamano similar:

| Modelo | Tipo | Parametros | Salida | Licencia |
|---|---|---|---|---|
| LiquidAI/d1-2B-MLX-fp16 | Modelo de decision multimodal | ~1,92 B | Respuestas tipadas con probabilidades calibradas, sin generacion | lfm1.0 |
| LiquidAI/LFM3-1.7B | LLM generativo | ~1,7 B | Texto generado | lfm1.0 |
| Qwen2.5-VL-3B-Instruct | VLM generativo | ~3 B | Texto generado (requiere parsing para tareas estructuradas) | Apache 2.0 |

La ventaja diferencial de d1-2B frente a un VLM generativo pequeno es la salida estructurada y calibrada con coste constante por consulta; a cambio, no sirve para generacion de texto libre, razonamiento extenso ni codigo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no es adecuado para chat abierto, redaccion, codigo ni razonamiento multi-paso.
- No hay evidencia de soporte de tool calling ni de agentes: no disponible.
- El soporte en MLX-VLM estaba en progreso en el momento de publicacion de la model card, por lo que la integracion puede requerir versiones recientes o codigo propio.
- No se publican benchmarks ni datos de calibracion verificables de terceros; conviene validar la calibracion de probabilidades en el dominio concreto de uso antes de producir.
- Licencia lfm1.0 ("other"): no es una licencia estandar abierta; revisar el texto de la licencia antes de cualquier uso comercial.
- Al tratarse de una conversion MLX en FP16, el uso queda restringido en la practica al ecosistema Apple; para otras plataformas hay que acudir al modelo base LiquidAI/d1-2B.
- Riesgo de alucinacion y sesgos: no disponible en la model card, pero como en todo modelo entrenado con datos a gran escala, se recomienda evaluacion propia en tareas sensibles.

## Enlaces

- Modelo MLX FP16: https://huggingface.co/LiquidAI/d1-2B-MLX-fp16
- Modelo base d1-2B: https://huggingface.co/LiquidAI/d1-2B
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Guia MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentacion LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
