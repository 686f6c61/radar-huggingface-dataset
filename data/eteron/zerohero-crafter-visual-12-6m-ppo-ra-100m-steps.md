# eteron/ZeroHero-Crafter-Visual-12.6M-PPO-RA-100M-steps

## Resumen

ZeroHero-Crafter-Visual-12.6M-PPO-RA-100M-steps es una política de agente entrenada por el autor `eteron` para el entorno Crafter en su variante visual, es decir, con observaciones basadas en pantallas RGB, objetivos alcanzados y una memoria generada. No es un modelo de lenguaje de propósito general: es un agente de refuerzo post-entrenado con PPO-RA (una variante de Proximal Policy Optimization) durante 100.007.936 decisiones de entorno.

El modelo parte de una red pequeña inicializada aleatoriamente y sometida después a preentrenamiento supervisado, con 12.593.280 parámetros en total y pesos en FP32 safetensors. La arquitectura declarada se etiqueta como `qwen3_vl` en los metadatos de Hugging Face, pero la model card no detalla la estructura interna ni la composición del dataset de entrenamiento. Su relevancia es acotada: sirve como referencia reproducible de una política entrenada a gran escala de interacciones en un benchmark de agentes con observaciones visuales.

La release incluye únicamente los pesos de inferencia y ejemplos ejecutables. No se publican el código de entrenamiento, los datos de entrenamiento, los pesos del crítico, los estados del optimizador ni un arnés de evaluación. El modelo solo soporta inglés y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `qwen3_vl` en los metadatos; la model card no detalla la estructura interna) |
| Parametros totales | 12.593.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32, solo política) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_vl` en los metadatos de Hugging Face y de la indicación de que se implementa con Hugging Face Transformers. El modelo parte de una red pequeña inicializada aleatoriamente, seguida de un preentrenamiento supervisado y de un post-entrenamiento con PPO-RA sobre el entorno Crafter visual. El presupuesto de post-entrenamiento declarado es de 100.007.936 decisiones de entorno.

No se especifican el número de tokens de preentrenamiento, la composición del dataset, ni detalles del bucle de RL más allá del algoritmo (PPO-RA). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El autor advierte que las ejecuciones de entrenamiento del artículo original usaron entornos CUDA nativos, mientras que el adaptador de juego incluido emplea el entorno CPU estándar, y que no se reclama reproducción de trayectorias idénticas por semilla ni de los resultados de benchmark.

## Capacidades

- Toma de decisiones secuenciales en el entorno Crafter visual a partir de observaciones RGB, objetivos alcanzados y memoria generada.
- Formateo de observaciones y parseo de respuestas mediante un wrapper de agente proporcionado; la interfaz de observación y respuesta forma parte de la política.
- Ejecución de episodios de juego individuales con el adaptador incluido sobre el entorno CPU estándar.
- Inferencia de una sola respuesta mediante un fixture de ejemplo, sin necesidad de instalar el entorno.
- No es un modelo de chat de propósito general: no se documentan capacidades de generación de texto libre, código, matemáticas, tool calling ni razonamiento multi-paso fuera del bucle del agente.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Reproducción de referencia de una política PPO-RA en Crafter visual: descargar el repositorio y ejecutar `examples/infer.py` con el fixture incluido permite verificar la interfaz de observación y respuesta sin instalar el entorno.
- Investigación en aprendizaje por refuerzo con observaciones visuales: el modelo sirve como punto de partida o baseline para comparar variantes de PPO-RA y de representación de memoria en Crafter.
- Evaluación de wrappers de agente: el contrato de entrada y salida documentado en `examples/README.md` permite validar implementaciones propias de formateo de observaciones y parseo de acciones.
- Docencia y divulgación sobre agentes en entornos tipo grid-world: el tamaño reducido (12,6 M de parámetros, repo de 0,1 GB) y el ejemplo autocontenido facilitan demostraciones en hardware modesto.
- Integración en pipelines de investigación que requieran una política Crafter preentrenada: los pesos en safetensors FP32 se cargan con Transformers y pueden envolverse en el adaptador incluido.
- Auditoría de releases de RL: los archivos `agent_config.json`, `release_metadata.json` y `SHA256SUMS` permiten verificar el presupuesto exacto de entrenamiento, el contrato de entrada y la integridad de los tensores exportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las curvas numéricas de entrenamiento no se presentan como una evaluación held-out de esta release y que no se reclama reproducción de benchmarks ni de trayectorias idénticas por semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 12,6 M de parámetros en FP32 el peso de la política ocupa aproximadamente 50 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el adaptador de juego incluido usa el entorno CPU estándar, por lo que la inferencia puede ejecutarse sin GPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: Transformers (librería declarada) y el script `examples/infer.py` incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas para Crafter visual) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general; usarlo fuera del wrapper de agente y del contrato de observación documentado produce resultados no válidos.
- La release no incluye código de entrenamiento, datos de entrenamiento, pesos del crítico, estados del optimizador ni arnés de evaluación, lo que limita la reproducibilidad completa.
- Las curvas de entrenamiento no constituyen una evaluación held-out de esta release; la generación muestreada y las diferencias numéricas del runtime pueden alterar respuestas individuales.
- El adaptador incluido usa el entorno CPU estándar, mientras que el entrenamiento del artículo usó entornos CUDA nativos; no se garantiza la reproducción de trayectorias ni de benchmarks.
- Solo se declara soporte de inglés.
- No se documentan sesgos conocidos ni tasas de alucinación; al tratarse de una política de RL, el riesgo relevante es la generalización fuera de la distribución de Crafter, no la alucinación textual.
- Licencia Apache-2.0, que permite uso comercial, pero las dependencias del entorno y las observaciones de benchmarks públicos quedan sujetas a sus licencias originales (ver `THIRD_PARTY_NOTICES.md`).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/eteron/ZeroHero-Crafter-Visual-12.6M-PPO-RA-100M-steps
- Ejemplos de inferencia: `examples/README.md` dentro del repositorio
- Metadatos de release: `agent_config.json`, `release_metadata.json`, `SHA256SUMS`
- Avisos de terceros: `THIRD_PARTY_NOTICES.md`
