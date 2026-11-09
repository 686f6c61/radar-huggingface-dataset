# AdaptiveChunking/ali_mem-mixed-nosurface_s2

## Resumen

`ali_mem-mixed-nosurface_s2` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Se trata de una H-Net (hierarchical net) de nivel de byte que combina un mecanismo de chunking dinámico con un tokenizador aprendido, orientada a experimentar con segmentación adaptativa de secuencias de bytes en lugar de tokens subword predefinidos. El checkpoint corresponde a una ejecución con arquitectura `ali`, objetivo `ratio`, sin schedule explícito, decodificación de chunks por EMA y semilla 2, entrenada durante 6000 pasos sobre secuencias de 1024 bytes en tres idiomas (inglés, turco y finés).

El modelo tiene 22.785.088 parámetros totales (unos 22,8 M), lo que lo sitúa en la categoría de modelos pequeños de investigación, no en la de LLM de propósito general. Su interés es fundamentalmente metodológico: sirve para estudiar cómo un modelo byte-level con chunking dinámico aprende fronteras de segmentación lingüística, evaluadas mediante sondas FLORES+ de fronteras. No está pensado para despliegue en producción ni para tareas generativas convencionales.

La relevancia actual deriva del creciente interés en alternativas al tokenizador BPE fijo (modelos byte-level, tokenización aprendida, chunking adaptativo), un área donde arquitecturas como H-Net o MegaByte proponen procesar bytes directamente para eliminar el sesgo del vocabulario y mejorar la robustez multilingüe. Este checkpoint es un artefacto de experimentación reproducible dentro de esa línea, con estado de entrenamiento completo incluido para reanudar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical net) byte-level con chunking dinámico, variante `ali` |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se documenta contexto de inferencia mayor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (idiomas de entrenamiento; no se documenta cobertura adicional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez; mapa en `config.json["tied_weights"]`), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo es una H-Net de nivel de byte: procesa secuencias de bytes en bruto y aprende a agruparlos en chunks mediante un mecanismo dinámico, en lugar de depender de un vocabulario subword fijo. La variante `ali` y el objetivo `ratio` definen la configuración del experimento dentro del framework beetle-hnet; la decodificación de chunks usa una media móvil exponencial (`dechunk=ema`) y no se aplica un schedule de fases (`schedule=None`). Los pesos están atados (tied), de modo que `model.safetensors` almacena cada tensor compartido una sola vez y `config.json` indica qué nombres se mapean a cuáles.

El entrenamiento consistió en 6000 pasos con batch de 32 secuencias de 1024 bytes, sobre un corpus mixto en inglés, turco y finés (tres tipologías morfológicas distintas: analítica, aglutinante y aglutinante de alta productividad), semilla 2. El repositorio conserva checkpoints en ramas `step-N` según un schedule logarítmico por fases (0, 1, 2, 4, 6, 8, 16, …, 2^k más el paso final), cada uno con `model.safetensors`, `config.json`, `training_config.yaml` y el estado reanudable completo del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y el config del último paso, además de `log.jsonl`, `final.json` y las sondas de fronteras FLORES+ en `probe/`. No se documenta uso de RLHF, DPO ni datos de preferencias.

## Capacidades

- Modelado de lenguaje byte-level: predice el siguiente byte sobre secuencias de 1024 bytes.
- Segmentación adaptativa: aprende fronteras de chunk sobre bytes, evaluables con las sondas FLORES+ incluidas en `probe/`.
- Multilingüismo limitado a los idiomas de entrenamiento: inglés, turco y finés.
- Reanudación de entrenamiento: el estado completo del trainer está disponible por checkpoint.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta una interfaz de generación de texto de alto nivel (pipeline no disponible en Hugging Face).

## Casos de uso

- Investigación en tokenización aprendida: comparar el chunking dinámico de este checkpoint con BPE o SentencePiece sobre los mismos corpus (en/tr/fi) para medir calidad de fronteras con las sondas FLORES+ incluidas.
- Estudio de morfología aglutinante: analizar cómo el modelo segmenta palabras en turco y finés, idiomas donde los tokenizadores subword convencionales fragmentan agresivamente, usando los checkpoints intermedios para trazar la evolución del aprendizaje.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquier rama `step-N` cargando `training_state/checkpoint.pt` para extender pasos, cambiar la semilla o comparar schedules.
- Ablación de hiperparámetros: usar la variante `ali` con `objective=ratio` y `dechunk=ema` como línea base frente a otras configuraciones del framework beetle-hnet.
- Evaluación de robustez byte-level: probar el modelo con texto ruidoso, sin normalización Unicode o con errores tipográficos, ya que opera directamente sobre bytes y no sobre un vocabulario cerrado.
- Docencia y divulgación: ejemplo compacto (22,8 M de parámetros) de arquitectura jerárquica con chunking para explicar alternativas al tokenizador en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia las sondas de fronteras FLORES+ (`probe/`) generadas al finalizar la ejecución, sin cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,8 M de parámetros); en la práctica, unos pocos cientos de MB incluyendo activaciones para secuencias de 1024 bytes.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas de gama baja (GTX 1650, RTX 3050) e incluso en CPU para inferencia por lotes pequeños.
- Cabe en cualquier GPU consumer actual; no requiere A100 ni H100.
- Opciones de despliegue: PyTorch nativo (carga vía `safetensors` o `torch.load` del checkpoint), con `huggingface_hub.hf_hub_download` para obtener revisiones concretas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pipeline declarado en Hugging Face no se garantiza compatibilidad con `transformers`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nosurface_s2 | 22,8 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache-2.0 | Hugging Face (repo de investigación) |
| MegaByte (Meta) | ~1,3 B (no verificado en esta ficha) | varios miles de bytes | Parches byte-level multiescala | Licencia de investigación de Meta | Pesos no siempre públicos |
| Modelos BPE pequeños (p. ej. destilados de GPT-2) | 10-125 M | 1024 tokens | Transformer subword clásico | Variable (MIT, Apache-2.0) | Amplia |

La comparación directa con MegaByte u otras arquitecturas byte-level no puede establecerse con cifras porque este checkpoint no publica benchmarks; la comparativa anterior es meramente categórica y los datos de los modelos alternativos deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Modelo de investigación con 22,8 M de parámetros: su capacidad generativa y de razonamiento es muy limitada; no es adecuado para producción.
- Entrenado solo con 6000 pasos sobre 1024 bytes por secuencia en tres idiomas; la cobertura lingüística fuera de en, tr y fi es previsiblemente pobre.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; al operar a nivel de byte, puede reproducir fielmente sesgos presentes en el corpus de entrenamiento, que no se describe.
- Sin pipeline declarado en Hugging Face ni integración documentada con `transformers`, vLLM o llama.cpp: la integración requiere código propio del framework beetle-hnet.
- El repositorio pesa 7,2 GB debido a los múltiples checkpoints y estados del entrenador; conviene descargar solo la revisión necesaria.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación de calidad hace desaconsejable cualquier despliegue comercial sin evaluación previa.
- Los tensores tied se almacenan una sola vez; cargar los pesos sin aplicar el mapa `tied_weights` de `config.json` producirá un state dict incompleto.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nosurface_s2
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Sondas FLORES+ de fronteras: incluidas en la rama `main` del repositorio, carpeta `probe/` (sin URL independiente disponible)
