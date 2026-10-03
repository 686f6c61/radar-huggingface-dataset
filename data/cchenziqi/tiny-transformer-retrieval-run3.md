# CCHENZIQI/tiny-transformer-retrieval-run3

## Resumen

Tiny Transformer for Retrieval es un prototipo de investigación publicado en Hugging Face por el usuario CCHENZIQI. Se trata de un transformer denso de escala reducida orientado a tareas de retrieval (recuperación de información), cuyo checkpoint `model.safetensors` contiene únicamente una inicialización válida, no un modelo entrenado. El repositorio incluye además el script `inference.py`, un `config.json` con los ajustes de arquitectura y un `training_args.json` con la receta de entrenamiento por defecto.

El dato más llamativo es su tamaño: 49.600 parámetros totales, lo que lo sitúa varios órdenes de magnitud por debajo de cualquier modelo de retrieval utilizable en producción (los bi-encoders típicos como los basados en BERT-base manejan del orden de 110 millones de parámetros). El campo `Scale` de la model card indica "huge", pero se trata de un artefacto de la plantilla de generación de configuraciones y no refleja el tamaño real del modelo.

Su relevancia es, por tanto, exclusivamente metodológica: sirve como esqueleto reproducible para montar pipelines de experimentación, probar integraciones de código y documentar formatos de ficheros. El propio autor declara explícitamente que no reclama ninguna puntuación de benchmark y que el modelo no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer denso con atencion multi-query |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (tambien se menciona implementacion PyTorch) |

Otros parametros de arquitectura declarados en la model card: fusion de tipo low-rank, funcion de activacion approx gelu y normalizacion mediante instancenorm. Optimizador por defecto: novograd con planificador exponencial.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo "tiny", con atencion multi-query (varias cabezas de consulta compartiendo claves y valores), una etapa de fusion low-rank, activacion approx gelu y normalizacion por instancenorm en lugar de layernorm. El repositorio no especifica el numero de capas, la dimension del modelo, el numero de cabezas ni la dimension del feed-forward, por lo que no es posible reconstruir la topologia completa a partir de la informacion disponible.

En cuanto al entrenamiento, la model card es explicita: `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests) y no debe presentarse como un checkpoint entrenado ni evaluado. La receta por defecto usa novograd con un planificador exponencial, valores que el autor describe como puntos de partida del script y no como evidencia de una ejecucion completada. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- No hay capacidades verificadas. El repositorio no incluye ninguna evaluacion funcional del modelo.
- El script `inference.py` proporciona un ejemplo ejecutable dentro de su bloque `__main__`, orientado a comprobar que el pipeline arranca correctamente.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara soporte multilingue ni lista de idiomas.
- No se declaran capacidades de vision, audio ni modo de razonamiento (thinking mode).
- Al ser una implementacion personalizada, las APIs genericas de carga automatica (por ejemplo, `AutoModel` de transformers) requieren un adaptador explicito antes de poder usarse.

## Casos de uso

- Prueba de humo de pipelines de retrieval: sirve para validar que un entorno de entrenamiento o inferencia se instala, carga pesos safetensors y ejecuta un forward pass sin errores, antes de invertir recursos en un modelo real.
- Fixture de integracion continua: al ocupar apenas unos kilobytes, puede incorporarse como activo de prueba en el CI para verificar que el codigo de carga, serializacion y preprocesado no se rompe entre versiones.
- Material docente: util para explicar la estructura de un transformer (atencion multi-query, normalizacion, fusion low-rank) sin la complejidad computacional de un modelo grande.
- Plantilla de escalado: el par `config.json` / `training_args.json` puede reutilizarse como punto de partida para generar variantes de mayor tamano con la misma interfaz de ficheros.
- Desarrollo de harness de evaluacion: permite construir y depurar el codigo que luego calculara metricas de retrieval (por ejemplo, recall@k sobre Flickr30k) antes de apuntarlo a un checkpoint entrenado.
- Reproducibilidad de recetas: el `training_args.json` documenta una receta concreta (novograd, planificador exponencial) que puede compararse de forma controlada con otras configuraciones bajo el mismo presupuesto de ajuste y las mismas semillas.

En ninguno de estos casos el modelo produce resultados de retrieval utiles por si mismo: es un artefacto de infraestructura, no un componente de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se reclama ninguna puntuacion y sugiere, como primera evaluacion significativa, usar Flickr30k reportando la metrica de la tarea en al menos tres semillas e incluyendo una linea base de capacidad equivalente.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | no evaluado |
| HumanEval | no disponible | no evaluado |
| GSM8K | no disponible | no evaluado |
| Flickr30k (retrieval) | no disponible | sugerido por el autor como primera evaluacion, sin resultados publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en float32 para los 49.600 parametros, despreciable en cualquier hardware actual.
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en GPUs integradas, en una GTX 1050 o incluso en CPU.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo de las ultimas dos decadas, y tambien en CPU sin aceleracion.
- Opciones de despliegue: al ser una implementacion personalizada sobre PyTorch, el despliegue se realiza ejecutando `inference.py`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en formato GGUF.
- Latencia y throughput estimados: no disponibles. Con este numero de parametros la latencia estaria dominada por el overhead de Python y del framework, no por el computo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CCHENZIQI/tiny-transformer-retrieval-run3 | 49.600 | no disponible | sin benchmark publicado | BSD-3-Clause | Hugging Face |
| abhishekiai/tiny-transformer-retrieval | no disponible | no disponible | sin benchmark publicado | BSD-3-Clause | Hugging Face |
| Bi-encoders de retrieval basados en BERT-base (referencia de categoria) | ~110 M | 512 tokens tipicamente | recall@k publicados en benchmarks de retrieval | variable segun modelo | Hugging Face, ampliamente desplegados |

La comparativa con modelos de retrieval reales solo sirve para ilustrar el orden de magnitud: la diferencia de parametros respecto a un bi-encoder basado en BERT-base es de aproximadamente tres ordenes de magnitud. El repositorio `abhishekiai/tiny-transformer-retrieval` comparte plantilla, licencia y estructura de ficheros, y su model card describe igualmente un checkpoint de inicializacion y no un modelo entrenado.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier uso como modelo de retrieval produce salidas sin significado.
- No se ha auditado robustez, equidad ni transferencia de dominio, segun declaracion explicita del autor.
- Sesgos conocidos: no disponibles, precisamente porque no hay entrenamiento ni evaluacion documentados.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que el modelo no genera texto coherente; el riesgo real es interpretar sus salidas como resultados validos.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni idiomas soportados.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y conservacion del aviso de copyright, pero el autor advierte de que deben revisarse por separado los terminos de los datos de origen si se usa con datasets externos.
- Caveat de integracion: las APIs genericas de carga automatica de Hugging Face no funcionan sin un adaptador explicito, al tratarse de una implementacion personalizada.
- El campo `Scale` con valor "huge" en la model card es un artefacto de plantilla y no debe interpretarse como indicador de tamano real.
- Cualquier resultado futuro obtenido con un checkpoint entrenado debera documentarse por separado de los valores por defecto aqui distribuidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CCHENZIQI/tiny-transformer-retrieval-run3
- Repositorio de referencia con plantilla similar: https://huggingface.co/abhishekiai/tiny-transformer-retrieval
- Arbol de ficheros del repositorio de referencia: https://huggingface.co/abhishekiai/tiny-transformer-retrieval/tree/main
- Framework Transformers de Hugging Face: https://github.com/huggingface/transformers
- Implementacion educativa tinyTransformer: https://github.com/avvorstenbosch/tinyTransformer
- Estimador de requisitos de hardware para modelos locales: https://www.canirun.ai/
