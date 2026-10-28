# csrstka/flint-oQ4e-fp16

## Resumen

`csrstka/flint-oQ4e-fp16` es un checkpoint de pesos cuantizados, no un modelo entrenado desde cero. Se trata de una conversión del modelo denominado "flint" (39.785.299.488 parámetros, unos 39,79 B) a formato MLX con cuantización mixta de precisión, generada con la herramienta oQ de oMLX v0.7.3rc1. El resultado ocupa 21,757 GiB (23,361 GB) en disco, con una media efectiva de 4,697 bits por peso, lo que permite ejecutar un modelo de casi 40 B en equipos Apple Silicon con memoria unificada de gama alta.

El interés práctico del artefacto es la política de cuantización: en lugar de aplicar 4 bits de forma uniforme, el 95,13 % de los pesos (37,849 B) se almacena en affine 4-bit con grupo de 64, mientras que un 4,80 % (1,911 B) se conserva en 8 bits y un 0,06 % (0,025 B) en FP16. Esa asimetría sugiere que la herramienta reserva mayor precisión para tensores sensibles, un enfoque habitual para reducir la degradación en modelos grandes.

Ahora bien, la información publicada es muy escasa: la model card no identifica el modelo base, no declara arquitectura, contexto, idiomas ni licencia, y el repositorio no tiene descargas ni valoraciones. Cualquier evaluación de calidad debe hacerse por cuenta del usuario antes de plantear un uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no especifica la arquitectura; el desglose de almacenamiento solo declara un componente "Language model" de 39,785 B, sin torres de visión ni módulos adicionales |
| Parametros totales | 39.785.299.488 (≈39,79 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantización mixta oQ (oMLX v0.7.3rc1): affine 4-bit grupo 64 (95,134 % de los pesos lógicos), affine 8-bit grupo 128 (0,743 %), affine 8-bit grupo 64 (4,060 %), FP16 (0,063 %). Media efectiva: 4,697 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo original ni ningún proceso de entrenamiento: no hay datos sobre número de tokens, composición del corpus, fases de ajuste (SFT, RLHF, DPO) ni innovaciones técnicas de atención. El único componente declarado es el modelo de lenguaje, con 39,785 B de pesos lógicos en total. Tampoco se especifica el número de capas, dimensiones ocultas, cabezas de atención ni vocabulario, datos necesarios para estimar el consumo de KV cache.

Lo que sí está documentado es el proceso de posentrenamiento aplicado: cuantización de precisión mixta con oQ (oMLX v0.7.3rc1), que asigna formatos distintos por tensor. La distribución resultante es de 4,50 bits/peso efectivos para el bloque mayoritario en 4 bits (37,849 B, 19,828 GiB), 8,25 bits/peso para el bloque en 8 bits con grupo 128 (0,296 B, 0,284 GiB), 8,50 bits/peso para el bloque en 8 bits con grupo 64 (1,615 B, 1,598 GiB) y 16,00 bits/peso para el residuo en FP16 (0,025 B, 0,046 GiB). No se detalla el criterio de selección de precisión por capa ni se publican métricas de perplejidad antes y después de la cuantización.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad que se puede deducir del propio artefacto, al ser un checkpoint de modelo de lenguaje.
- Razonamiento, matemáticas y generación de código: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible; la model card no menciona plantilla de chat, tokens especiales ni esquema de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el desglose de almacenamiento no incluye torre multimodal.
- Se puede afirmar que la cuantización mixta preserva en 8 y 16 bits un 4,86 % de los pesos, lo que en la práctica busca mantener la fidelidad de las capas más sensibles, pero no hay mediciones publicadas que lo confirmen.

## Casos de uso

- Inferencia local en Mac de gama alta: el checkpoint está pensado para `mlx_lm` sobre Apple Silicon; con 21,757 GiB de pesos encaja en equipos de 32 GB o más de memoria unificada, lo que permite prototipar con un modelo de casi 40 B sin GPU dedicada.
- Evaluación comparativa de técnicas de cuantización: sirve para medir la pérdida de calidad de una política mixta a 4,697 bits/peso frente a una cuantización uniforme de 4 bits, usando el mismo modelo base y un conjunto de evaluación propio.
- Procesamiento por lotes de textos largos en local: si el modelo base admite contextos amplios, el checkpoint puede usarse para resumen, extracción de entidades o clasificación sobre corpus que no deben salir del equipo; la ventana real debe confirmarse con el tokenizador incluido.
- Generación de documentación técnica o código en un flujo de trabajo offline: adecuado si el modelo base tiene buena competencia en código; el formato MLX permite integrarlo en scripts de Python mediante `mlx_lm.generate`.
- Servicio interno de pruebas: `mlx_lm.server` expone una API compatible con la de OpenAI, de modo que el checkpoint puede actuar como backend de pruebas para aplicaciones que luego se desplegarán con otro modelo.
- Investigación sobre degradación por capas: la distribución asimétrica (4/8/16 bits) permite aislar qué tensores toleran 4 bits y cuáles necesitan 8, comparando salidas por capa frente a la versión FP16.
- Cualquiera de estos usos exige validar primero la licencia del modelo base, que aquí no se declara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica, y el repositorio registra 0 descargas y 0 valoraciones, por lo que tampoco existen evaluaciones de terceros asociadas.

## Requisitos de hardware

- Pesos en disco y en memoria: 23,361 GB (21,757 GiB) para el checkpoint completo, según la model card.
- Memoria unificada recomendada: 32 GB como mínimo para cargar los pesos y dejar margen al sistema y a la caché KV; 64 GB o más si se trabaja con contextos largos o lotes, ya que el coste de KV cache no se puede estimar sin conocer capas y cabezas.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable de forma nativa; el checkpoint está en formato MLX y está pensado para Apple Silicon. Ejecutarlo en CUDA requeriría reconvertir los pesos.
- Compatibilidad con GPU de consumo: sí, en el sentido de que cabe en Mac con chip M1/M2/M3/M4 y 32 GB o más de memoria unificada; no está pensado para GPUs de consumo con 24 GB de VRAM, donde no entraría con holgura.
- Opciones de despliegue: `mlx_lm` (CLI, `mlx_lm.generate`, `mlx_lm.server`). No hay artefactos GGUF publicados, por lo que llama.cpp y Ollama no pueden usarlo directamente; vLLM y TGI no soportan MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables identificables: la model card no declara el modelo base, de modo que no es posible emparejarlo con su versión original ni con alternativas de la misma familia. La única comparación posible es de coste de almacenamiento, con cifras derivadas aritméticamente de los datos publicados:

| Configuracion | Bits/peso efectivos | Peso estimado | Nota |
|---|---|---|---|
| Este checkpoint (mixta oQ) | 4,697 | 21,757 GiB (dato real) | 4/8/16 bits según tensor |
| 4-bit affine uniforme, grupo 64 | 4,50 | ≈20,8 GiB (estimación) | Menor huella, sin protección de capas sensibles |
| FP16 | 16,00 | ≈74,1 GiB (estimación) | Referencia de calidad, inviable en equipos de consumo |

## Limitaciones y advertencias

- Modelo base no identificado: la model card no indica de qué modelo procede "flint", lo que impide rastrear su origen, su dataset y sus sesgos.
- Licencia no declarada: no se puede asumir uso comercial. Al ser un trabajo derivado, hereda las restricciones del modelo original, que aquí se desconocen.
- Sin benchmarks ni validación de terceros: 0 descargas y 0 valoraciones; no hay evidencia publicada de que la cuantización mixta preserve la calidad del original.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje y no cuantificado en este checkpoint; la cuantización a 4 bits en el 95 % de los pesos puede agravarlo en tareas de precisión factual.
- Idiomas y contexto desconocidos: no se puede garantizar un rendimiento correcto en castellano ni planificar el dimensionado de la ventana de contexto.
- Pérdida de precisión en tensores a 4 bits: sin perplejidad comparativa publicada, el impacto real es indeterminado.
- Dependencia de plataforma: formato MLX, ejecutable solo en Apple Silicon con `mlx` instalado; no hay conversión oficial a GGUF ni soporte CUDA.
- Fecha de creación declarada en 2026-10-27, posterior a la mayoría de referencias disponibles; conviene verificar que el repositorio sigue accesible y sin cambios.
- Uso en producción desaconsejado sin una evaluación propia previa de calidad, latencia y licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/csrstka/flint-oQ4e-fp16
- Herramienta de cuantización oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Las búsquedas web realizadas no devolvieron ningún resultado relacionado con este modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales.
