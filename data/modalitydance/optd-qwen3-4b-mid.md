# ModalityDance/OPTD-Qwen3-4B-Mid

## Resumen

OPTD-Qwen3-4B-Mid es un checkpoint estudiante de destilación publicado por ModalityDance, inicializado desde Qwen/Qwen3-4B y entrenado con el método On-Policy Transition Distillation (OPTD). El modelo tiene 4.411.424.256 parámetros, se distribuye en safetensors BF16 y declara inglés como idioma, con orientación a matemáticas y código. Su modo de generación es nativo sin thinking (`enable_thinking=False`).

El checkpoint aplica 50 actualizaciones de entrenamiento y alinea la política estudiante con la del profesor en bloques intermedios concretos y en la salida final, usando rollouts generados por el propio estudiante. Es un modelo de 4B pensado para investigación sobre destilación de especialistas a estudiantes, no para sustituir a modelos generalistas de mayor tamaño.

Su relevancia actual está en que permite estudiar y reproducir experimentos de destilación on-policy con un modelo denso de 4B, formato estándar de transformers y requisitos de hardware moderados. No se han publicado benchmarks ni una licencia específica en la información disponible, por lo que su uso en producción requiere validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, inicializado desde Qwen/Qwen3-4B |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada; debe consultarse la model card de Qwen/Qwen3-4B |
| Tipos de cuantización | BF16 safetensors en el repositorio; no se han publicado cuantizaciones GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | Inglés (`en`) según la model card; el modelo base Qwen3 es multilingüe, pero este checkpoint declara solo inglés |
| Licencia | No disponible; se remite a las licencias upstream de Qwen/Qwen3-4B y del modelo especialista |
| Formato de pesos | safetensors (BF16) |
| Modelo base | Qwen/Qwen3-4B |
| Modo de generación | Nativo sin thinking (`enable_thinking=False`) |
| Actualizaciones de entrenamiento | 50 |
| Dominios de entrenamiento | Matemáticas y código (`math`, `coding`) |
| Bloques intermedios alineados | 7, 13 y 19 (indexados desde cero) |
| Tamaño del repositorio | 8,8 GB |
| Compatibilidad de despliegue | transformers, text-generation-inference (TGI), `endpoints_compatible` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B y se entrena como estudiante dentro del esquema OPTD. El objetivo combina la destilación on-policy final con la alineación de los incrementos de log-probabilidad entre profesor y estudiante en los bloques intermedios 7, 13 y 19, además de la salida final. La actualización práctica utiliza identidades candidatas top-16 de la política final fija, recompensas de transición separadas (`detached`) y probabilidades del estudiante en la capa de destino, calculadas sobre rollouts generados por el propio estudiante.

El entrenamiento se limita a los dominios de matemáticas y código, con 50 actualizaciones y modo de generación sin thinking. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, el profesor o especialista utilizado, ni el uso de RLHF o DPO. El repositorio incluye el modelo de inferencia completo, el tokenizador, la configuración de generación y metadatos de entrenamiento; no incluye estados del optimizador ni shards de entrenamiento distribuido.

## Capacidades

- Generación de texto y razonamiento en inglés, con entrenamiento específico en matemáticas y código.
- Resolución de problemas matemáticos y generación de explicaciones paso a paso en modo no-thinking.
- Generación, revisión y explicación de código, condicionada a validación externa mediante tests y sandbox.
- Modo de generación nativo sin thinking; no se documenta un modo thinking explícito.
- Soporte de tool calling y function calling: no documentado en la model card; no debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo puede usarse como motor de razonamiento dentro de una orquestación externa, pero sin garantías de soporte nativo.
- Capacidades multilingües: solo se declara inglés; el modelo base Qwen3 es multilingüe, pero este fine-tune no declara otros idiomas.
- Capacidades especiales: destilación de transiciones entre profesor y estudiante; no se documentan visión, audio ni otras modalidades.
- Integración con transformers y text-generation-inference; etiqueta `endpoints_compatible`.

## Casos de uso

- Tutoría de matemáticas en inglés: el modelo puede generar resoluciones paso a paso de ecuaciones y problemas aritméticos usando la plantilla de chat con `enable_thinking=False`, `temperature=0.7`, `top_p=0.95` y hasta 1024 tokens nuevos. Es adecuado por su entrenamiento en el dominio `math`, pero las respuestas deben verificarse con un solucionador simbólico o un corrector automático.
- Generación de código en pipelines de CI/CD: puede producir fragmentos de código y explicaciones en inglés como candidatos iniciales dentro de un flujo externo que ejecute tests, análisis estático y revisión humana. No se documenta tool calling, por lo que la orquestación y la ejecución deben implementarse fuera del modelo.
- Investigación en destilación on-policy: sirve como estudiante de referencia para reproducir experimentos OPTD, comparar con Qwen3-4B y analizar el efecto de alinear bloques intermedios concretos. Los metadatos de 50 actualizaciones y los bloques 7/13/19 facilitan la configuración experimental.
- Evaluación de robustez de modelos destilados: permite lanzar baterías de prompts de matemáticas y código, comparar salidas con el modelo base y estudiar fallos, sesgos o degradación fuera de dominio. Es útil porque el checkpoint es pequeño y se puede ejecutar en una sola GPU.
- Documentación técnica y generación de docstrings: puede redactar comentarios y documentación de código en inglés a partir de fragmentos fuente, siempre que un revisor valide la precisión técnica. Su formación en código lo hace adecuado para prototipos, no para documentación crítica sin revisión.
- Generación de datasets sintéticos para matemáticas y código: puede producir problemas, soluciones y explicaciones que después se filtran con verificadores automáticos y revisión humana. Es adecuado para experimentos controlados por su tamaño y su enfoque en esos dominios.
- Prototipos de razonamiento multi-paso con orquestación externa: puede actuar como motor de generación dentro de un agente implementado fuera del modelo, con herramientas, memoria y control de flujo gestionados por el sistema. No se debe asumir soporte nativo de agentes ni de function calling.
- Despliegue local en una GPU de 24 GB para experimentación: el checkpoint BF16 permite pruebas de inferencia y fine-tuning ligero en entornos de investigación con una sola RTX 4090 o RTX 3090, siempre que se controle la longitud de contexto y el tamaño de lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparaciones cuantitativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 8,8 GB; con activaciones y caché KV conviene reservar entre 12 y 18 GB según la longitud de contexto y el tamaño de lote.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, A100 80 GB y H100. Para contextos largos o lotes mayores, son preferibles las GPU de 40 GB o más.
- GPU consumer: cabe en tarjetas de 24 GB con holgura para contextos moderados. En tarjetas de 16 GB puede funcionar con contexto corto y lote pequeño, pero el margen es reducido. En tarjetas de 12 GB no es viable en BF16 sin cuantización, y no se han publicado cuantizaciones.
- Opciones de despliegue: transformers y text-generation-inference (TGI) son las opciones documentadas. vLLM o SGLang podrían ser compatibles por la arquitectura Qwen3, pero no se ha verificado en la información proporcionada. llama.cpp y Ollama requieren una conversión a GGUF que no está disponible en el repositorio.
- Latencia y throughput: no disponible. No se han publicado medidas de tokens por segundo, latencia por petición ni rendimiento con lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OPTD-Qwen3-4B-Mid | 4.411.424.256 | No disponible | No disponible | safetensors BF16 | Fine-tune OPTD sobre Qwen3-4B, inglés, dominios math/coding, modo no-thinking |
| Qwen/Qwen3-4B | 4B nominal; dato exacto no disponible | No disponible | No disponible en la información | No disponible | Modelo base; deben consultarse su model card, contexto y licencia upstream |
| Alternativas de 3-4B (Qwen2.5-3B, Llama-3.2-3B) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos en la información proporcionada para una comparación cuantitativa |

No se dispone de resultados de benchmarks que permitan comparar rendimiento con Qwen3-4B ni con otras alternativas de tamaño similar. La comparación debe limitarse, por ahora, a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado y no debe asumirse a partir del modelo base.
- No se han publicado benchmarks; no se puede afirmar que supere a Qwen3-4B ni a otros modelos de 3-4B en matemáticas o código.
- Riesgo de alucinación y de generar código incorrecto o inseguro; la model card advierte de que las salidas pueden ser erróneas o seguir instrucciones no deseadas.
- El código generado debe evaluarse en un sandbox aislado antes de ejecutarse en producción.
- La licencia
