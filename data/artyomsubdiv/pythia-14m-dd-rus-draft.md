# ArtyomSubDiv/pythia-14m-dd-rus-draft

## Resumen

ArtyomSubDiv/pythia-14m-dd-rus-draft es un ajuste fino experimental del modelo base EleutherAI/pythia-14m-deduped, publicado por el usuario ArtyomSubDiv en Hugging Face. Se trata de un modelo causal de generación de texto con arquitectura GPT-NeoX, 14.067.712 parámetros y orientación al idioma ruso, entrenado sobre el dataset dim/databricks_dolly_15k_ru.

El propio autor describe el resultado como un intento fallido: durante el entrenamiento, la precisión media por token (mean_token_accuracy) y la pérdida (loss) se estabilizaron en torno a 0,555 y 1,9 respectivamente y apenas variaron a lo largo de numerosas épocas, con independencia de la tasa de aprendizaje empleada. Según la model card, el modelo no logró memorizar siquiera el dataset y genera texto esencialmente aleatorio.

Su relevancia es más documental que práctica: constituye un caso de estudio de los límites del fine-tuning sobre modelos base muy pequeños sin preentrenamiento en el idioma objetivo. No es apto para producción ni como modelo de instrucciones, y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, causal LM) |
| Parametros totales | 14.067.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (heredado de la familia Pythia/GPT-NeoX; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | ruso (ru), segun la model card; el autor indica que no se ha aprendido ruso funcional |
| Licencia | no disponible |
| Formato de pesos | safetensors (tambien compatible con PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer causal decoder-only de la familia GPT-NeoX, con 14.067.712 parámetros. El modelo de partida, EleutherAI/pythia-14m-deduped, pertenece a la serie Pythia de EleutherAI, entrenada sobre el corpus The Pile en su variante deduplicada, y utiliza una ventana de contexto de 2048 tokens. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa ni esquemas híbridos) en la información disponible.

El ajuste se realizó sobre el dataset dim/databricks_dolly_15k_ru, una traducción al ruso de Databricks Dolly 15k, con el objetivo declarado de obtener un modelo de instrucciones en ruso. La model card no menciona el uso de RLHF, DPO ni ningún otro método de alineación posterior; se trata, por tanto, de un fine-tuning supervisado sin más detalle. Los registros aportados por el autor indican que loss y mean_token_accuracy se estancaron en ~1,9 y ~0,555 durante muchas épocas, sin mejora apreciable al variar la tasa de aprendizaje, y que el modelo ni siquiera consiguió sobreajustar el dataset de entrenamiento.

## Capacidades

- Generación de texto: formalmente expuesta mediante el pipeline text-generation, pero en la práctica el autor indica que produce salida aleatoria.
- Razonamiento, matemáticas y código: no disponible y, según la model card, no funcional.
- Tool calling / function calling: no soportado ni documentado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: solo se declara ruso (ru), sin evidencia de funcionamiento correcto.
- Visión, audio, modo thinking u otras capacidades especiales: no disponibles.
- Aprendizaje del dataset de instrucciones: no conseguido, según el propio autor.

## Casos de uso

- Caso de estudio de fallo en fine-tuning: el modelo documenta de forma explícita un estancamiento de loss y precisión al ajustar un base model de 14M sin preentrenamiento en ruso, lo que lo hace útil para ilustrar este fenómeno en material docente o informes técnicos.
- Referencia para reproducibilidad de experimentos: permite reproducir el pipeline de entrenamiento y confirmar que los hiperparámetros y la tasa de aprendizaje no revierten el estancamiento observado.
- Prueba de integración de pipelines: al ser un safetensors de ~14M parámetros, sirve para validar el correcto funcionamiento de cargadores, endpoints compatibles y utilidades de despliegue sin consumir recursos apreciables.
- Pruebas de infraestructura de inferencia: útil para comprobar que un servidor TGI, vLLM o un endpoint compatible arranca y responde, dado su tamaño mínimo.
- Benchmarking de latencia y throughput de hardware: al ser tan pequeño, permite medir tiempos de arranque, carga de pesos y sobrecarga del servidor en CPU o GPU sin que el modelo domine el resultado.
- Análisis de sesgos y calidad de datasets traducidos: el dataset dim/databricks_dolly_15k_ru puede inspeccionarse junto al comportamiento del modelo para estudiar el efecto de una traducción automática en el ajuste.
- Ejemplo negativo en comparativas de modelos rusos pequeños: sirve como referencia de lo que no funciona frente a otros modelos rusos con preentrenamiento nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de entrenamiento, que se recogen a continuación como referencia y no como evaluación de capacidades:

| Metrica | Valor | Observacion |
|---|---|---|
| Loss (entrenamiento) | ~1,9 | Estancada durante numerosas epocas |
| mean_token_accuracy | ~0,555 | Sin mejora apreciable al variar la tasa de aprendizaje |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 56 MB en fp32, 28 MB en fp16 y 14 MB en int8, dado el tamaño de 14,07M parámetros.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU sin problema.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU y en memoria de sistema.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el repositorio incluye la etiqueta text-generation-inference y endpoints_compatible), vLLM y llama.cpp u Ollama previa conversión a GGUF, que no se distribuye.
- Latencia y throughput: no disponibles; por tamaño, la latencia sería muy baja en cualquier hardware moderno.
- Almacenamiento: el repositorio ocupa 0,0 GB según Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| ArtyomSubDiv/pythia-14m-dd-rus-draft | 14,07M | 2048 (heredado de Pythia) | ru | no disponible | safetensors | Ajuste fallido segun el autor |
| EleutherAI/pythia-14m-deduped | 14M | 2048 | en | Apache 2.0 (familia Pythia) | safetensors | Modelo base, funcional en ingles |
| EleutherAI/pythia-70m-deduped | 70M | 2048 | en | Apache 2.0 (familia Pythia) | safetensors | Alternativa mayor de la misma familia |

No se dispone de datos de benchmark comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no funciona: genera texto aleatorio y no aprendió el dataset de instrucciones.
- No debe utilizarse en producción, atención al cliente, generación de código ni ningún flujo de usuario final.
- Riesgo de alucinación: máximo, ya que la salida no mantiene coherencia con la entrada.
- Idioma: aunque se declara ruso, no hay evidencia de competencia lingüística; el ajuste no revirtió la falta de preentrenamiento en ruso del modelo base.
- Licencia: no disponible en el repositorio, lo que impide determinar condiciones de uso comercial y obliga a contactar con el autor antes de cualquier reutilización.
- Contexto limitado a 2048 tokens heredado del modelo base, dato no confirmado en la model card.
- Sesgos: no evaluados y no documentados; al no haber aprendizaje efectivo, no pueden caracterizarse.
- Sin soporte de tool calling, agentes ni capacidades multimodales.
- Tamaño de 14M parámetros: insuficiente en la práctica para tareas de instrucciones complejas, incluso con un ajuste correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArtyomSubDiv/pythia-14m-dd-rus-draft
- Modelo base: https://huggingface.co/EleutherAI/pythia-14m-deduped
- Dataset de ajuste: https://huggingface.co/datasets/dim/databricks_dolly_15k_ru
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de inicio de sesión y portadas de ChatGPT, sin relación con este repositorio.
