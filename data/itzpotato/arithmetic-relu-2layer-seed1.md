# itzPotato/arithmetic-relu-2layer-seed1

## Resumen

El modelo `itzPotato/arithmetic-relu-2layer-seed1` es un transformer decoder-only de dos capas, sin bias ni normalización, con MLP de activación ReLU, entrenado exclusivamente para resolver sumas y restas de números enteros con signo de hasta cuatro dígitos. Forma parte de un conjunto de doce modelos idénticos en arquitectura y entrenamiento, que solo difieren en el tipo de MLP (ReLU o bilineal) y en la semilla, diseñados para estudiar la mecanística de la aritmética en transformers pequeños. Con apenas 17.728 parámetros, no es un modelo de propósito general, sino una herramienta de investigación en interpretabilidad. Su relevancia radica en permitir aislar el efecto de la función de activación del MLP en la capacidad de resolver tareas que requieren propagación de acarreo o préstamo, como la resta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 2 capas, sin bias ni normalización |
| Parametros totales | 17.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tarea fija de 16 tokens por ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (solo dígitos y símbolos aritméticos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con d_model=32, d_mlp=64, 4 cabezas de atención con d_head=8, y dos capas. La MLP ReLU se define como `W_out ReLU(W_in x)`. No incluye capas de bias ni de normalización. Se entrenó con 5.000.000 de ejemplos generados sintéticamente, cada uno con el formato de tokenización descrito en la model card: un token por dígito, operador y signo, con operands y resultado rellenados a 4 y 5 dígitos respectivamente. El optimizador fue AdamW con learning rate 0.02 (cosine schedule con 200 warmup steps), batch size 1024, weight decay 0.01 y grad clip 1.0. La pérdida se calcula únicamente sobre los cinco dígitos del resultado, no sobre el token de signo. El modelo forma parte de una familia de doce variantes (ReLU/bilineal × 1/2 capas × 3 semillas) entrenadas con la misma receta para permitir comparaciones controladas.

## Capacidades

- Resuelve sumas y restas de números enteros con signo de hasta 4 dígitos (resultado de 5 dígitos).
- Precisión perfecta en sumas: 100% de precisión secuencial en validación y test.
- Precisión alta en restas: 98.06% de precisión secuencial en validación y 98.00% en test.
- La precisión por dígito es 0.998 en ambos splits.
- No soporta tool calling, agentes ni razonamiento multi-paso más allá de la operación aritmética.
- No tiene capacidades multilingües ni de generación de texto general.
- No incluye modo de pensamiento ni visión ni audio.

## Casos de uso

- Investigación en mecanística interpretability: permite analizar cómo se forman circuitos internos para el acarreo y el préstamo en la resta, comparando con variantes bilineales.
- Estudio de la influencia de la función de activación del MLP en tareas algorítmicas: al ser idéntico salvo en la MLP, es útil para aislar ese factor.
- Validación de técnicas de análisis de activaciones, como transcoders o atribución de logits, en un entorno controlado y de bajo coste computacional.
- Prueba de metodologías de entrenamiento con datasets sintéticos y evaluación de generalización a variaciones del formato (p. ej., más dígitos).
- Benchmark para modelos de juguete en tareas de aritmética simbólica, útil para comparar arquitecturas alternativas (SSM, MoE, etc.) en igualdad de condiciones.
- Ejemplo didáctico en cursos de interpretabilidad de transformers, por su tamaño reducido y comportamiento interpretable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los resultados reportados en la model card del autor son:

| Split | Loss | Digit acc | Seq acc | Sign acc |
|---|---:|---:|---:|---:|
| Validación | 0.0044 | 0.9980 | 0.9903 | 0.0000 |
| Test | 0.0045 | 0.9980 | 0.9900 | 0.0000 |

| Operación | Seq acc | Digit acc | Loss |
|---|---:|---:|---:|
| Suma | 1.0000 | 1.0000 | 0.0000 |
| Resta | 0.9806 | 0.9961 | 0.0088 |

Nota: la precisión del signo es 0 por diseño, ya que la pérdida no cubre ese token.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene solo 17.728 parámetros, por lo que se ejecuta en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: menos de 1 MB (no requiere GPU dedicada).
- GPU recomendada: ninguna; puede ejecutarse incluso en un microcontrolador o en un portátil básico.
- Opciones de despliegue: no aplica para entornos de producción; se usa en scripts de investigación con PyTorch.
- Latencia: despreciable, del orden de microsegundos por ejemplo en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría dentro de la documentación proporcionada. El modelo `melephant/1-layer-addition-v2` se menciona como referencia, pero es de una sola capa y solo soporta sumas, por lo que no es directamente comparable. No se han publicado resultados comparativos.

## Limitaciones y advertencias

- Es un modelo de juguete, sin capacidad de generalización a números de más dígitos ni a otras operaciones aritméticas.
- No comprende lenguaje natural; solo procesa la secuencia tokenizada específica de la tarea.
- La precisión del signo es nula por construcción (no se entrena sobre ese token), por lo que no debe interpretarse como un fallo.
- No se han documentado sesgos ni riesgos de alucinación, al tratarse de una tarea determinista y acotada.
- La licencia no está especificada; se recomienda contactar al autor antes de cualquier uso comercial o redistribución.
- El formato de tokenización es propio del proyecto; no es compatible con otros modelos sin adaptación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed1
- Modelo relacionado (bilinear, 2 capas): https://huggingface.co/itzPotato/bilinear-attn-addition-carry-2layer (encontrado en la búsqueda web, no se detalla su contenido)
