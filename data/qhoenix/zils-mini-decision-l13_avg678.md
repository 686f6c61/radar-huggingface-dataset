# qhoenix/zils-mini-decision-l13_avg678

## Resumen

zils-mini-decision-l13_avg678 es un modelo de decisión (decision-model) publicado por el usuario qhoenix en Hugging Face. Se construye sobre el modelo base Qwen/Qwen3.5-4B y se distribuye con licencia Apache-2.0. Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones), se posiciona en la gama de modelos compactos orientados a extracción de características y tareas de decisión, según declara su pipeline en Hugging Face (feature-extraction).

El modelo se ha generado mediante una técnica de model soup: parte de una media uniforme de pesos de dos cuerpos Apache-2.0 (torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini), sobre la que se aplican tres fine-tunes LoRA independientes (rango 64, learning rate 5e-5, una época, semillas distintas) entrenados con aproximadamente 97.000 ítems de decisión en el formato de examen Zils. Posteriormente, los tres fine-tunes se promedian de forma uniforme y el resultado se desplaza 1,3 veces a lo largo del cambio medio respecto al modelo de partida.

Su relevancia radica en que ejemplifica una familia de modelos derivados (soups y merges) que buscan mejorar capacidades específicas de decisión sin incrementar el tamaño del modelo base. Al estar construido sobre Qwen3.5-4B, hereda la arquitectura transformer de dicho modelo, aunque la model card no detalla explícitamente la arquitectura interna. No se han publicado resultados de benchmarks ni detalles sobre la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, según la model card) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. La model card describe el proceso de creación como un ensamblaje por promedio de pesos (model soup) en BF16 dentro del layout del chasis d3-mini. El punto de partida es la media uniforme de dos cuerpos Apache-2.0: torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini.

Sobre ese punto de partida se realizan tres fine-tunes LoRA independientes con rango 64, learning rate 5e-5, una época y semillas distintas, entrenados con aproximadamente 97.000 ítems de decisión en el formato de examen Zils. Los datos provienen de splits TRAIN públicos con etiquetas gold y de ítems generados a partir de splits TRAIN públicos de datasets de uso comercial por Claude, GPT-5.4 y DeepSeek; los ítems de dominio nuevo se conservan solo cuando un modelo de otro proveedor respondió de forma ciega de la misma manera. La función de pérdida combina entropía cruzada suave y pérdida de Brier, con un anclaje KL al modelo de partida. Finalmente, el cuerpo resultante es la media uniforme de los tres fine-tunes, desplazado 1,3 veces a lo largo del cambio medio respecto al inicio. No se usaron semillas de examen, validación ni splits de test para el entrenamiento.

## Capacidades

- Extracción de características (feature-extraction), según el pipeline declarado en Hugging Face.
- Modelo de decisión especializado en el formato de examen Zils (d3-mini).
- Capacidades heredadas del modelo base Qwen3.5-4B, no detalladas en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de decisiones en formato Zils: el modelo está entrenado específicamente con ítems de examen en formato Zils, por lo que puede emplearse para puntuar o clasificar respuestas de decisión en ese formato concreto.
- Extracción de características para pipelines de clasificación: al declararse como feature-extraction, puede usarse como extractor de representaciones para alimentar clasificadores posteriores en tareas de decisión.
- Investigación sobre model soups y merges: sirve como caso de estudio reproducible de promedio de pesos y fine-tunes LoRA múltiples sobre un modelo base de 4,5B con licencia Apache-2.0.
- Prototipado de sistemas de decisión de bajo coste: con 4,5B de parámetros y pesos BF16, puede desplegarse en hardware de gama media para experimentación, aunque no se dispone de datos de latencia ni throughput.
- Fine-tuning adicional sobre dominios propios: al ser Apache-2.0 y tener un tamaño contenido, puede adaptarse con LoRA a dominios específicos de decisión partiendo de este cuerpo ya especializado.
- Comparación de estrategias de entrenamiento: permite contrastar el efecto de promediar tres fine-tunes con semillas distintas frente a un único fine-tune, dado que la model card documenta el proceso completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,5B en BF16 requiere aproximadamente 9 GB de VRAM solo para los pesos, más memoria para activaciones y KV cache; el tamaño del repositorio es de 9,1 GB.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabeza en GPU de consumo: no confirmado oficialmente; por tamaño, un modelo de 4,5B en BF16 podría requerir GPUs de consumo con 12-16 GB o más, pero no hay datos publicados.
- Opciones de despliegue: la librería declarada es transformers; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-decision-l13_avg678 | 4,5B | no disponible | Apache-2.0 | Hugging Face (qhoenix) |
| Qwen/Qwen3.5-4B (base) | aproximadamente 4B | no disponible | no disponible en esta ficha | Hugging Face |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | Apache-2.0 | Hugging Face |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de datos generados por Claude, GPT-5.4 y DeepSeek, podría heredar sesgos de esos generadores.
- Riesgo de alucinación: no evaluado; no se han publicado métricas de fiabilidad.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las licencias de los modelos base y de los datasets de entrenamiento citados.
- Caveats para producción: es un modelo de nicho (decision-model en formato Zils) con 0 descargas y 0 likes en el momento de la consulta; no hay benchmarks, ni datos de latencia, ni validación publicada, por lo que su uso en producción requeriría una evaluación propia exhaustiva.
- El pipeline declarado es feature-extraction, no generación de texto; conviene verificar que el uso previsto coincide con esa finalidad.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de partida 1: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Cuerpo de partida 2: https://huggingface.co/vllm-sr/d3-mini
