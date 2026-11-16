# moeshawky/RockAndEgg-313M-v3

## Resumen

RockAndEgg-313M-v3 es un modelo de decisión tipada derivado de Qwen3-0.6B-Base mediante cirugía de modelo (truncado físico de profundidad y congelación del backbone). Lo desarrolla el autor independiente moeshawky y se publica bajo licencia Apache 2.0. No es un modelo generativo: carece de cabecera de modelado de lenguaje y de ruta `generate`, y en su lugar emite decisiones estructuradas de tres tipos (`choice`, `score`, `noul`) con probabilidades calibradas y un valor de confianza por pregunta.

El modelo conserva únicamente los bloques transformer 0–9 de las 28 capas originales de Qwen3-0.6B-Base, con un tamaño oculto de 1.024, atención causal con grouped-query attention (16 cabezas de atención, 8 de KV) y normalización RMSNorm. El backbone (312.892.928 parámetros) está congelado bit a bit respecto al checkpoint fuente de la versión 2, y la única parte entrenada es una cabecera de decisión SystemOne de 268.805 parámetros, lo que da un total de 313.161.733 parámetros medidos sobre las formas reales de los tensores.

Su interés es acotado pero claro: demuestra hasta dónde se puede adaptar un transformer decoder compacto para toma de decisiones discriminativa en lugar de generación de texto, con un diseño que prioriza la interpretabilidad del cambio (todo el efecto medido es atribuible a la cabecera de decisión) y una ventana de contexto configurada de 32.768 posiciones, aunque la longitud de estado evaluada es de 256 tokens y la de opción de 64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3Model sin cabecera de LM + cabecera de decisión SystemOne nativa |
| Parametros totales | 313.161.733 (backbone 312.892.928 + cabecera 268.805) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 posiciones configuradas; 256 tokens de estado y 64 de opción en evaluación |
| Tipos de cuantizacion | FP32 (raíz del repo) y FP16 (subcarpeta `fp16/`); no se documentan otras |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32 en raíz, 1.252.660.724 bytes; FP16 en `fp16/`, 626.337.154 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder truncado: se conservan los bloques 0–9 de Qwen3-0.6B-Base (10 de 28 capas), con tamaño oculto 1.024, tamaño intermedio 3.072, 16 cabezas de atención y 8 cabezas KV con grouped-query attention causal, vocabulario de 151.936 tokens y RMSNorm. Sobre ese backbone se añade una cabecera de decisión compuesta por un embedding de consulta de 3 tipos, un scorer 1024→256→1 y una temperatura por tipo. Componentes opcionales como cross-attention, option mixer y cosine prior están desactivados por defecto, aunque son configurables.

El backbone se mantiene congelado bit a bit (112/112 tensores con diferencia absoluta máxima 0.0 frente al checkpoint fuente FP32 de v2); frente al artefacto v2 publicado en el Hub, la diferencia es de 0.0148, atribuible solo al redondeo FP16. La cabecera se afina sobre el corpus `SargeDev/jev-distill-corpus-v3` (Apache-2.0), con un entrenamiento multifase previo del backbone (RAE-TPU-003 y continuación RAE-005). No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Emisión de decisiones tipadas de tres clases: `choice`, `score` y `noul`.
- Salida de vectores de probabilidad calibrados con un valor de confianza por pregunta.
- Codificación de un único estado (hasta 256 tokens evaluados) y evaluación de opciones (hasta 64 tokens).
- Extracción de características mediante el backbone congelado (tag `feature-extraction`).
- Sin generación de texto: no hay cabecera de LM ni ruta `generate`.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- Sin capacidades de visión ni audio.

## Casos de uso

- Clasificación binaria o multietiqueta con calibración: usar el tipo `choice` para seleccionar entre opciones predefinidas sobre un estado dado, aprovechando las probabilidades calibradas para umbralizar decisiones en producción.
- Puntuación de relevancia en recuperación de información: emplear el tipo `score` para asignar una puntuación calibrada a pares estado-opción, por ejemplo en reranking de candidatos.
- Detección de abstención o "no sé": el tipo `noul` permite modelar explícitamente la incertidumbre y derivar decisiones de escalado a revisión humana.
- Filtrado de contenido en pipelines: clasificar estados de hasta 256 tokens frente a políticas u opciones de 64 tokens, con la ventaja de un modelo de 313M parámetros desplegable en CPU o GPU modesta.
- Enrutamiento de consultas en sistemas multiagente: decidir a qué especialista o herramienta derivar una consulta corta mediante `choice`, sin coste de generación.
- Investigación en cirugía de modelos: servir como caso de estudio reproducible de truncado de profundidad y congelación de backbone para estudiar el efecto aislado de una cabecera de decisión.
- Evaluación de calibración: usar las temperaturas por tipo y las probabilidades emitidas para analizar la calibración en tareas discriminativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB en FP32 y 1,3 GB en FP16 para los pesos, más overhead de activaciones y del entorno de ejecución.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, RTX 4090 o RTX 3060 son sobradas para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más; también es viable en CPU para cargas por lotes pequeños.
- Opciones de despliegue: `AutoModel.from_pretrained` con `trust_remote_code=True` a través de transformers; requiere código personalizado del repositorio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RockAndEgg-313M-v3 | 313M | 32.768 configurados | Decisión tipada (no generativo) | Apache 2.0 | Hugging Face |
| Qwen3-0.6B-Base | 0,6B | no disponible en la información | Generativo (LM base) | Apache 2.0 | Hugging Face |
| BERT-base | 110M | 512 | Clasificación (encoder) | Apache 2.0 | Hugging Face |

La comparación es aproximada: RockAndEgg-313M-v3 no es directamente intercambiable con un LM generativo ni con un encoder clásico, ya que su interfaz es un conjunto de decisiones tipadas con calibración. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera salida lingüística queda fuera de su alcance.
- Solo entrenado y evaluado en inglés; no se garantiza comportamiento en otros idiomas.
- Longitud de estado evaluada de 256 tokens y de opción de 64, muy por debajo del contexto configurado de 32.768; usar ventanas mayores no está validado.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Al ser un modelo derivado de Qwen3-0.6B-Base, hereda potencialmente sesgos del corpus original, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/moeshawky/RockAndEgg-313M-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Paper de referencia Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper de calibración (arXiv:1706.04599): https://arxiv.org/abs/1706.04599
