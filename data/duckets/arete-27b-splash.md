# Duckets/Arete-27B-Splash

## Resumen

Arete-27B-Splash es un paquete de pesos cuantizados en formato `splash-packed-q4` del modelo NousResearch/Arete-27B, un ajuste fino por SFT de alineamiento de valores sobre Qwen3.8-27B. Lo publica el usuario Duckets en Hugging Face como conversión lista para el motor Splash, el runtime de inferencia que LM Studio integra y que también se distribuye como servidor independiente (`splash serve`). No es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue: los pesos provienen del checkpoint BF16 de Arete-27B y se convierten a 4 bits empaquetados con el conversor open source `splash-converter`.

La relevancia del paquete está en que combina tres piezas en un único artefacto: los pesos del modelo base, una cabeza de decodificación especulativa (DFlash2) y una torre de visión, ambas copiadas byte a byte del paquete oficial de la familia (`incoai/Qwen3.8-27B-Splash`). Esto permite ejecutar el modelo con decodificación especulativa y capacidades multimodales dentro de LM Studio sin montar el pipeline por separado. El paquete ocupa unos 17,37 GB y se distribuye con licencia Apache-2.0, heredada del modelo fuente.

El modelo subyacente es un transformer de 27 000 millones de parámetros de la familia Qwen3.8, ajustado por Nous Research para alineamiento de valores. El autor verificó el paquete en LM Studio sobre un Apple M5 Max con 128 GB de memoria unificada, obteniendo 104,5 tok/s en decodificación de un solo flujo con prompts cortos y unos 68 tok/s con contexto de 262K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con torre de visión y cabeza de decodificación especulativa DFlash2 |
| Parametros totales | 27 000 millones (27B), segun el nombre del modelo base |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | hasta 262 144 tokens (probado por el autor a 262K; el valor máximo oficial del modelo base no se detalla en la información disponible) |
| Tipos de cuantizacion | q4 empaquetado (`splash-packed-q4`); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | splash-packed-q4 (78 artefactos, 73 ficheros de pesos, ~17,37 GB); el checkpoint fuente está en BF16 |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es un ajuste fino supervisado (SFT) orientado al alineamiento de valores sobre Qwen3.8-27B, según indica la model card del paquete. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de RLHF o DPO. La arquitectura es un transformer denso de 27B, sin mezcla de expertos.

La innovación técnica de este paquete no está en el entrenamiento sino en el empaquetado para inferencia. Incorpora una cabeza de decodificación especulativa DFlash2, que acelera la generación proponiendo varios tokens por paso y verificándolos con el modelo principal, y una torre de visión que habilita entrada de imágenes. Ambas piezas se reutilizan del paquete oficial de la familia porque el draft es específico de la familia y la torre de visión tiene configuración idéntica entre los ajustes finos. La conversión a 4 bits empaquetados se realizó con `splash-converter` a partir del checkpoint BF16 en la revisión `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`.

## Capacidades

- Generación de texto y razonamiento: el autor verificó respuestas correctas a operaciones aritméticas (17 × 23 = 391) y raíces cuadradas (√169 = 13).
- Capacidades matemáticas básicas y razonamiento paso a paso, según la prueba de humo del autor.
- Visión: procesa imágenes de entrada; el autor verificó la identificación correcta de una imagen de color sólido.
- Decodificación especulativa mediante la cabeza DFlash2, que acelera la generación.
- Alineamiento de valores: el modelo base es un SFT de value alignment de Nous Research.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Prototipado rápido en LM Studio: descargar el paquete en la carpeta de modelos de LM Studio y cargarlo con el runtime Splash permite tener un modelo de 27B con visión y decodificación especulativa funcionando sin configuración adicional, gracias a que el paquete ya incluye la cabeza draft y la torre de visión.
- Asistentes con entrada de imágenes: la torre de visión permite construir aplicaciones que reciben capturas de pantalla, diagramas o fotos y generan descripciones o respuestas textuales, todo dentro de un único artefacto de 17,37 GB.
- Razonamiento aritmético y resolución de problemas en local: las pruebas del autor confirman respuestas correctas en operaciones básicas, lo que lo hace adecuado para asistentes de cálculo y explicación paso a paso en entornos sin conexión.
- Despliegue en estaciones de trabajo con memoria unificada: el paquete se validó en un Apple M5 Max con 128 GB, un escenario habitual para desarrolladores que trabajan en macOS y necesitan un modelo de 27B sin GPU dedicada.
- Evaluación de alineamiento de valores: al ser un SFT de value alignment, resulta útil para experimentar con respuestas alineadas a directrices éticas y comparar comportamientos frente al Qwen3.8-27B original.
- Servidor de inferencia ligero con `splash serve`: el motor puede cargar directamente el checkpoint crudo de NousResearch/Arete-27B, lo que permite montar un endpoint HTTP para pruebas de integración antes de empaquetar la versión cuantizada.
- Investigación sobre decodificación especulativa: el paquete incluye la cabeza DFlash2, por lo que sirve para medir el impacto de la decodificación especulativa en latencia y throughput con distintos tamaños de contexto (104,5 tok/s con prompt corto frente a ~68 tok/s con 262K).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas de humo cualitativas y mediciones de velocidad del autor:

| Prueba | Resultado |
|---|---|
| Razonamiento aritmético (17 × 23) | 391 (correcto) |
| Razonamiento aritmético (√169) | 13 (correcto) |
| Visión (imagen de color sólido) | identificada correctamente |
| Velocidad de decodificación (prompt ~60 tokens, temp 0, un flujo) | 104,5 tok/s |
| Velocidad de decodificación con contexto de 262K | ~68 tok/s |
| Hardware de la prueba | Apple M5 Max, 128 GB |

## Requisitos de hardware

- VRAM/memoria estimada: el paquete pesa ~17,37 GB en q4 empaquetado, por lo que necesita al menos esa cantidad de memoria más el espacio para el contexto KV; con 262K tokens de contexto el requisito crece de forma significativa.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo documenta la ejecución en Apple M5 Max con 128 GB de memoria unificada.
- Cabe en GPU de consumo: no confirmado en la información disponible; los 17,37 GB de pesos más el contexto hacen que una GPU de 24 GB (RTX 4090) quede muy justa o insuficiente para contextos largos, pero no hay medición oficial.
- Opciones de despliegue: runtime Splash de LM Studio (validado por el autor) y servidor independiente `splash serve`, que carga directamente el checkpoint crudo de NousResearch/Arete-27B. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 104,5 tok/s en decodificación de un solo flujo con prompt corto y ~68 tok/s con contexto de 262K, medidos en un M5 Max de 128 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Duckets/Arete-27B-Splash | 27B | hasta 262K (probado) | Apache-2.0 | splash-packed-q4 | Paquete para LM Studio/Splash con visión y decodificación especulativa |
| NousResearch/Arete-27B | 27B | no disponible | no disponible en la información proporcionada | BF16 | Modelo fuente; SFT de value alignment sobre Qwen3.8-27B |
| incoai/Qwen3.8-27B-Splash | 27B | no disponible | no disponible en la información proporcionada | splash | Paquete oficial de la familia; origen del draft DFlash2 y de la torre de visión |
| incoai/Qwen3.8-27B-DFlash2 | 27B | no disponible | no disponible en la información proporcionada | no disponible | Modelo base de la familia Qwen3.8 con la cabeza DFlash2 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día (7 de noviembre de 2026); se trata de una publicación muy reciente y sin validación comunitaria.
- Las pruebas de humo del autor son mínimas (dos operaciones aritméticas y una imagen de color sólido); no hay evaluación sistemática de calidad, sesgos ni robustez.
- La model card no documenta los idiomas soportados, el dataset de entrenamiento ni las etapas de alineamiento, lo que dificulta evaluar sesgos conocidos.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto con apariencia de veracidad.
- El paquete está atado al motor Splash y al runtime de LM Studio; no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI sin reconversión.
- La licencia Apache-2.0 se hereda del modelo fuente, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B antes de un uso comercial en producción.
- El rendimiento medido (104,5 tok/s) corresponde a un Apple M5 Max con 128 GB; en hardware con menos memoria o sin memoria unificada las cifras pueden diferir sustancialmente.
- Con contexto de 262K la velocidad cae a ~68 tok/s en la propia medición del autor, lo que indica un coste apreciable del contexto largo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/Duckets/Arete-27B-Splash
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Paquete oficial de la familia: https://huggingface.co/incoai/Qwen3.8-27B-Splash
- Conversor splash-converter: https://github.com/publicExcess/splash-converter
- Inco AI en Hugging Face: https://huggingface.co/incoai
