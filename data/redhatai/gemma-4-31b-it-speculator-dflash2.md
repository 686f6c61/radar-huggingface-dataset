# RedHatAI/gemma-4-31B-it-speculator.dflash2

## Resumen

RedHatAI/gemma-4-31B-it-speculator.dflash2 es un modelo borrador (draft model) de decodificación especulativa basado en DFlash2, entrenado por Red Hat AI para acelerar la inferencia de google/gemma-4-31B-it. No es un modelo de propósito general: su función es proponer secuencias de tokens que el modelo verificador (gemma-4-31B-it) valida en paralelo, reduciendo el número de pasos de decodificación necesarios. Se distribuye bajo licencia Apache-2.0 y es compatible con vLLM mediante el método especulativo `dflash`.

El modelo tiene 2.747.321.856 parámetros (aproximadamente 2,75 mil millones) almacenados en bfloat16, lo que implica un peso en disco cercano a 5,5 GB. Emplea una arquitectura transformer reducida de 5 capas con una ventana deslizante de 2.048 tokens y un tamaño de bloque de 8, proponiendo por defecto 7 tokens por paso mediante método greedy. Se apoya en los estados ocultos de cinco capas auxiliares del verificador (1, 17, 29, 47 y 59) para condicionar sus propuestas.

Su relevancia actual radica en que la decodificación especulativa se ha consolidado como una de las técnicas más eficaces para reducir la latencia en modelos de gran tamaño sin degradar la calidad de salida, ya que las propuestas rechazadas se descartan y el resultado final coincide con el del verificador. Este checkpoint permite desplegar gemma-4-31B-it con un borrador optimizado específicamente para él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa (DFlash2), 5 capas |
| Parametros totales | 2.747.321.856 (aprox. 2,75 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor propio; ventana deslizante de 2.048 tokens y total-seq-len de entrenamiento de 8.192 |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`custom_code`, requiere DFlash2) |

## Arquitectura y entrenamiento

El modelo es un borrador DFlash2 compuesto por un transformer de 5 capas que consume los estados ocultos de cinco capas auxiliares del verificador (concretamente las capas 1, 17, 29, 47 y 59 de google/gemma-4-31B-it). Configura un tamaño de bloque de 8 con un máximo de 1.536 anchors, propone por defecto 7 tokens por paso mediante método greedy y aplica una ventana deslizante de 2.048 tokens. Los pesos se almacenan en bfloat16.

El entrenamiento se realizó con la librería Speculators (versión 0.8.0) sobre el dataset mlabonne/open-perfectblend, utilizando respuestas generadas por gemma-4-31B-it con razonamiento. Se ejecutó en 4 procesos (world size 4) durante 3 épocas (aunque el nombre del run registrado menciona "5epochs"), con learning rate 6e-4, weight decay 0.01, scheduler coseno, optimizador Muon (muon-lr 0.003), `dpace-alpha` 0.5, pérdida por entropía cruzada con `per-position-loss-weight dpace`, y vocabulario del borrador de 128.000 tokens. El entorno técnico incluyó vLLM 0.29.0, Transformers 5.14.1 y PyTorch 2.13.0.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa sobre gemma-4-31B-it.
- Aceleración de la decodificación de un verificador mayor sin alterar la distribución de salida (las propuestas rechazadas se descartan).
- Soporte de método de propuesta greedy con 7 tokens propuestos por defecto y tamaño de bloque de 8.
- Integración nativa con vLLM mediante `--speculative-config` con `"method": "dflash"`.
- Condicionamiento sobre estados ocultos intermedios del verificador (5 capas auxiliares), lo que mejora la tasa de aceptación respecto a borradores independientes.
- No es un modelo autónomo: no genera respuestas completas por sí mismo, no soporta tool calling ni agentes de forma independiente, y no dispone de capacidades multimodales propias.

## Casos de uso

- Servicio de inferencia de baja latencia con gemma-4-31B-it: desplegar el verificador junto a este borrador en vLLM para reducir el tiempo por token en comparación con la decodificación autorregresiva estándar, manteniendo idéntica la salida final.
- Despliegue en producción con tensor parallelism: usar `--tensor-parallel-size 2` junto al `speculative-config` de DFlash2 para servir el modelo en clústeres con varias GPUs, repartiendo pesos y estados.
- Generación de código asistida en IDE: acelerar la respuesta del verificador gemma-4-31B-it en entornos de autocompletado donde la latencia por token es crítica (el modelo card incluye gráficas de HumanEval asociadas al pipeline).
- Razonamiento matemático interactivo: reducir el tiempo de respuesta en tareas donde el verificador produce cadenas de razonamiento largas (el modelo card referencia una gráfica de "math reasoning").
- Backend de chatbots multi-turno: servir conversaciones con contexto de hasta 8.192 tokens durante el entrenamiento, aprovechando la ventana deslizante de 2.048 tokens del borrador para propuestas eficientes.
- Evaluación comparativa de estrategias de decodificación especulativa: usar este checkpoint como referencia DFlash2 frente a otros métodos (EAGLE, Medusa, n-gram) sobre el mismo verificador.
- Optimización de costes de GPU: incrementar el throughput por GPU al reducir los pasos de decodificación, amortizando mejor el coste de servir un modelo de 31B.

## Benchmarks y rendimiento

El model card incluye una tabla de evaluación con longitud media de aceptación y tasas de aceptación por posición, pero los datos numéricos de la tabla aparecen truncados en la información disponible (solo se conserva un fragmento "37%"). Asimismo, las gráficas de HumanEval y de razonamiento matemático se adjuntan como imágenes y no como cifras textuales.

No se han podido extraer resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Peso del borrador: 2,75 B de parámetros en bfloat16 equivalen a aproximadamente 5,5 GB, coherente con el tamaño del repositorio (5,5 GB).
- Peso del verificador: gemma-4-31B-it en bfloat16 requiere del orden de 60-65 GB de VRAM solo para pesos (estimación).
- VRAM total estimada: en torno a 67-70 GB de pesos sumando ambos modelos, más KV cache y activaciones para la longitud de secuencia configurada (estimación, no confirmada en la documentación).
- GPUs recomendadas: H100 (80 GB), A100 (80 GB) o configuraciones multi-GPU. El ejemplo oficial de vLLM usa `--tensor-parallel-size 2`, lo que sugiere un mínimo práctico de 2 GPUs de gama alta.
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en bfloat16, dado que el verificador por sí solo supera esa capacidad. No se documentan variantes cuantizadas del borrador ni del verificador.
- Opciones de despliegue: vLLM con soporte DFlash y Gemma-4 (versión/build con DFlash habilitado). No se indica compatibilidad con llama.cpp, Ollama ni TGI en la información disponible.
- Verificadores/entorno soportados en el entrenamiento: vLLM 0.29.0, Transformers 5.14.1, PyTorch 2.13.0, Speculators 0.8.0.
- Latencia y throughput: no se proporcionan cifras concretas en la documentación disponible.

## Comparativa con modelos similares

No se dispone de datos numéricos comparativos para modelos borradores específicos de gemma-4-31B-it. A modo orientativo, la categoría incluye borradores de decodificación especulativa como EAGLE, Medusa, n-gram y otros modelos entrenados con Speculators, pero no se han facilitado resultados de aceptación, latencia o throughput que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RedHatAI/gemma-4-31B-it-speculator.dflash2 | 2,75 B (borrador) | Ventana deslizante 2.048; total-seq-len 8.192 | Apache-2.0 | HuggingFace, uso con vLLM |
| google/gemma-4-31B-it (verificador) | 31 B (no confirmado) | No disponible | Terminos de Gemma | HuggingFace |
| Otros borradores DFlash2 / EAGLE / Medusa para gemma-4-31B-it | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: su salida carece de sentido sin el verificador google/gemma-4-31B-it, del que depende completamente.
- Requiere una build de vLLM con soporte DFlash y Gemma-4: sin ella, el checkpoint no es utilizable.
- La tabla de evaluación del model card aparece truncada en la información disponible, por lo que no se pueden verificar las tasas de aceptación reportadas.
- El nombre del run de entrenamiento ("5epochs") no coincide con el valor real de `--epochs` (3), lo que puede inducir a error sobre la configuración empleada.
- No se documentan idiomas soportados; la cobertura depende del dataset mlabonne/open-perfectblend y del verificador.
- Riesgo de sesgos heredado del verificador y del dataset de entrenamiento (no cuantificado en la documentación).
- No se especifican tipos de cuantización compatibles; el borrador está en bfloat16.
- Licencia Apache-2.0 para el borrador, pero el verificador gemma-4-31B-it está sujeto a los términos de Gemma, que deben respetarse en uso comercial.
- El despliegue en producción exige hardware de gama alta (varias GPUs de 80 GB), lo que limita su uso fuera de entornos con infraestructura dedicada.
- El modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia pública de adopción o validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.dflash2
- Modelo base (verificador): https://huggingface.co/google/gemma-4-31B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Librería Speculators: https://github.com/vllm-project/speculators
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Terminos y licencia de Gemma: https://ai.google.dev/gemma/terms
