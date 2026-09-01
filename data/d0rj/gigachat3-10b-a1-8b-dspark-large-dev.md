# d0rj/GigaChat3-10B-A1.8B.dspark-large-dev

## Resumen

GigaChat3-10B-A1.8B.dspark-large-dev es un checkpoint experimental de un modelo draft especulativo (speculative draft) desarrollado por d0rj, diseñado para acelerar la inferencia del verifier ai-sage/GigaChat3-10B-A1.8B, un modelo de lenguaje de arquitectura Mixture-of-Experts con 10B parámetros totales y 1.8B activos. El draft emplea la arquitectura DSpark y cuenta con 5 capas transformer, 568.509.313 parámetros, y un bloque especulativo de 8 posiciones que propone entre 1 y 7 tokens por paso de decodificación.

Este checkpoint se publica con fines de reproducibilidad y desarrollo de adaptadores, no como recomendación de aceleración en producción. En las pruebas realizadas sobre una RTX 5070 Ti, la ruta DSpark no aceleró de forma consistente al verifier. El modelo requiere el plugin vLLM específico para GigaChat3 y no es un modelo de lenguaje independiente; su función es exclusivamente proponer tokens que el verifier valida.

El entrenamiento se realizó sobre un subconjunto determinista de 200.000 filas del dataset t-tech/T-Wix, con 428.427.745 tokens en total, y consistió en una época de fine-tuning tras expandir el draft de 3 a 5 capas añadiendo dos capas residuales de identidad. La licencia es MIT, y los idiomas soportados son ruso e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (draft especulativo) |
| Parametros totales | 568.509.313 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (depende del verifier; el verifier soporta hasta 262K tokens) |
| Tipos de cuantizacion | BF16 para el draft; FP8 para el verifier |
| Idiomas soportados | ru, en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft especulativo basado en la arquitectura DSpark, compuesto por 5 capas transformer con hidden size 1.536, intermediate size 8.960, 32 query heads y 32 KV heads con head dimension 64. El vocabulario del draft es de 32.000 tokens mapeados desde el vocabulario del verifier. El bloque especulativo procesa 8 posiciones: un ancla y hasta 7 tokens propuestos por paso. Incluye una cabeza Markov de primer orden con rango 256 y una cabeza de confianza condicionada a la embedding Markov.

El entrenamiento se realizó con extracción de estados ocultos en línea: el verifier congelado generaba estados auxiliares bajo demanda sin persistir el corpus completo. El verifier y el draft entrenable compartieron una RTX 5070 Ti de 16 GB bajo WSL2, con offload por capas del verifier durante el entrenamiento (no en la configuración de inferencia). El checkpoint liberado corresponde a la época 0, paso global 55.165, tras una época de fine-tuning sobre el snapshot de datos determinista. Se usó AdamW con learning rate 1e-4, weight decay 0.01, scheduler coseno con warmup del 1%, y un presupuesto de secuencia de 8.192 tokens.

## Capacidades

- Decodificación especulativa: propone entre 1 y 7 tokens por paso para que el verifier los valide, reduciendo potencialmente la latencia de generación.
- Integración con vLLM: requiere el plugin gigachat3-vllm-plugin y se usa mediante el método `dflash` con `num_speculative_tokens` configurable.
- Soporte de verificación con estados auxiliares: el verifier utiliza capas auxiliares en las capas 2, 7, 13, 19 y 24, más el estado final normalizado.
- Multilingüe: entrenado con datos en ruso e inglés, aunque su función principal no es la generación directa.
- Reproducibilidad: incluye pesos de inferencia, estado completo de optimizador y scheduler, métricas de validación, metadatos de continuación, lanzadores exactos, eventos TensorBoard y artefactos de benchmark BS1/BS4.

## Casos de uso

- Investigación en decodificación especulativa: permite estudiar el impacto del número de tokens propuestos (K=1 a 7) sobre el throughput y la latencia en el verifier GigaChat3.
- Desarrollo de adaptadores y fine-tuning: el checkpoint sirve como punto de partida para entrenar versiones mejoradas del draft, ya que se publica con estado completo de entrenamiento.
- Evaluación de aceleración en hardware consumer: útil para medir si la ruta DSpark ofrece ganancias en GPUs como RTX 5070 Ti, aunque el autor advierte que no acelera consistentemente en esa configuración.
- Benchmarking de métodos especulativos: los artefactos BS1/BS4 permiten comparar el rendimiento del draft frente a la inferencia directa del verifier en términos de tokens por segundo.
- Pruebas de integración con vLLM: sirve para validar la compatibilidad del plugin GigaChat3 con diferentes backends lineales (Triton) y modos de captura de CUDA Graph.
- Reproducción de experimentos: al incluir todos los metadatos y la configuración exacta, otros equipos pueden replicar el entrenamiento y verificar los resultados.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El README menciona artefactos de benchmark BS1/BS4 sin detallar métricas concretas (por ejemplo, tokens por segundo, velocidad de aceptación o latencia). El autor indica que en la RTX 5070 Ti probada, la ruta DSpark no aceleró de forma consistente al verifier, por lo que no se recomienda su uso en producción.

## Requisitos de hardware

- VRAM estimada: al menos 16 GB para ejecutar el conjunto draft + verifier en FP8, según la configuración probada en RTX 5070 Ti.
- GPU recomendadas: RTX 5070 Ti (usada en las pruebas), aunque cualquier GPU con 16 GB o más compatible con vLLM y el plugin debería funcionar.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de gama alta consumer con 16 GB, pero el rendimiento no está garantizado.
- Opciones de despliegue: vLLM con el plugin gigachat3-vllm-plugin, usando el comando `vllm serve` con configuración especulativa explícita.
- Latencia y throughput: no se proporcionan cifras concretas; los artefactos de benchmark BS1/BS4 están disponibles en el repo para quien quiera analizarlos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros modelos draft especulativos comparables con el mismo verifier o con características equivalentes. Se podría comparar con la inferencia directa del verifier sin draft, pero no se dispone de métricas publicadas.

## Limitaciones y advertencias

- Estado experimental: el autor declara explícitamente que el checkpoint no está listo para producción y que la ruta DSpark no acelera consistentemente en la configuración probada.
- No es un modelo de lenguaje autónomo: solo funciona como parte del sistema especulativo junto al verifier GigaChat3-10B-A1.8B; no puede cargarse como modelo causal independiente.
- Requiere infraestructura específica: es necesario el plugin vLLM de GigaChat3 y una versión compatible de vLLM 0.23; el modo CUDA Graph completo no es compatible con la ruta MLA del verifier.
- Limitaciones de idioma: solo entrenado con datos en ruso e inglés; el rendimiento en otros idiomas no está validado.
- Riesgo de alucinación y sesgos: al ser un draft, no genera texto final, pero el verifier puede presentar sesgos típicos de modelos grandes; no se documentan evaluaciones de sesgo específicas.
- Licencia y uso comercial: aunque la licencia es MIT, el dataset T-Wix es ODC-BY-1.0 y su card advierte que los outputs de terceros pueden tener términos adicionales; conviene revisar los términos del dataset antes de un uso comercial.
- Reproducibilidad: el entrenamiento depende de un snapshot de datos concreto y de una semilla fija, pero la extracción de estados ocultos en línea puede dificultar la replicación exacta en otros entornos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/d0rj/GigaChat3-10B-A1.8B.dspark-large-dev
- Modelo verifier: https://huggingface.co/ai-sage/GigaChat3-10B-A1.8B
- Plugin vLLM para GigaChat3: https://github.com/d0rj/gigachat3-vllm-plugin
- Dataset de entrenamiento: https://huggingface.co/datasets/t-tech/T-Wix
- Checkpoint base dev (draft de 3 capas): https://huggingface.co/d0rj/GigaChat3-10B-A1.8B.dspark-base-dev
