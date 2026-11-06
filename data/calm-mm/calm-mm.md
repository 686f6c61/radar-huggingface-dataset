# CALM-MM/CALM-MM

## Resumen

CALM-MM (Controversy-Guided Curriculum Active Learning for Multimodal Misinformation Detection) es un detector de desinformación multimodal diseñado para escenarios de pocas etiquetas. Lo desarrolla el grupo CALM-MM, con autoría anónima en una submission bajo revisión, y se publica en Hugging Face bajo licencia Apache 2.0. El modelo aborda un problema concreto: detectar si una pareja imagen-texto es veraz, refutada o fuera de contexto (out-of-context) cuando solo se dispone de un pequeño conjunto semilla de pares etiquetados por humanos.

Técnicamente no es un modelo generativo de lenguaje, sino un clasificador basado en grafos sobre representaciones congeladas. Cada ítem imagen-texto se representa como un grafo cuyos nodos son embeddings de 768 dimensiones extraídos con `open_clip` ViT-L/14 (variante `openai`) del claim, los fragmentos de evidencia, la imagen y sus recortes. Sobre ese grafo opera un codificador GNN entrenado con un esquema de aprendizaje activo guiado por controversia: un profesor zero-shot (acuerdo cross-modal CLIP o un VLM como InternVL3-8B) se calibra con la semilla etiquetada y actúa como prior dentro del estudiante.

Su relevancia actual reside en la combinación de tres ideas: destilación desde profesores gratuitos, selección activa de muestras difíciles para anotación humana y pseudo-etiquetado suave del resto del pool. El repositorio (0,4 GB) contiene únicamente los checkpoints del estudiante para tres benchmarks: VERITE, MOCHEG y FACTIFY.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de grafos (GNN) sobre embeddings congelados CLIP ViT-L/14; fusión con logit de calibración |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa grafos de evidencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos del grafo) + config.json (hiperparámetros y prior calibrado) |

## Arquitectura y entrenamiento

El modelo construye un grafo por ítem multimodal: los nodos son embeddings de 768 dimensiones de `open_clip` ViT-L/14 (`openai`) correspondientes al claim o caption, los fragmentos de evidencia, la imagen y sus recortes. Sobre ese grafo se entrena un codificador GNN que produce una representación fusionada con un logit de calibración. El profesor zero-shot puede ser el acuerdo cross-modal de CLIP (coseno caption-imagen) o las probabilidades de clase de un VLM (InternVL3-8B en MOCHEG; Qwen2.5-VL-7B para la probabilidad de out-of-context en VERITE). Ese profesor se calibra sobre la semilla etiquetada mediante estandarización (media y escala) y una regresión logística cuyos coeficientes e intercepto se guardan en el `config.json`.

El entrenamiento sigue un esquema de aprendizaje activo con currículo guiado por controversia. Una puntuación de controversia agnóstica a la etiqueta ordena el pool no etiquetado de fácil a difícil; los ítems más controvertidos (~10 %) se enrutan a anotadores humanos y el resto recibe pseudo-etiquetas suaves del profesor. Los tres brazos (`oracle`, `teacher`, `routed`) parten de un mismo warm-up. Los checkpoints publicados corresponden a la semilla 42; el paper reporta medias sobre 3-4 semillas. No se especifica el volumen de tokens ni la composición exacta de los datasets más allá de los benchmarks públicos VERITE, MOCHEG y FACTIFY.

## Capacidades

- Clasificación binaria veraz vs. out-of-context (VERITE).
- Clasificación de tres clases: supported / refuted / NEI (MOCHEG, FACTIFY).
- Detección de desinformación multimodal con muy pocas etiquetas humanas (~100 pares por fold en VERITE).
- Uso de profesores zero-shot gratuitos (CLIP o VLMs como InternVL3-8B y Qwen2.5-VL-7B) como prior calibrado.
- Aprendizaje activo: puntuación de controversia para priorizar anotación humana.
- Pseudo-etiquetado suave y self-training warm-started (brazo FACTIFY sin prior).
- Procesamiento de evidencia multimodal mediante grafos (claim, evidencia textual, imagen y recortes).
- Idioma: únicamente inglés.
- No soporta tool calling, function calling ni razonamiento multi-paso generativo; no es un modelo de chat.

## Casos de uso

- Verificación de bulos en redes sociales: dado un par imagen-texto viral, el modelo clasifica si el contenido está soportado, refutado o es insuficiente (NEI), útil en mesas de fact-checking con volumen alto y presupuesto de anotación limitado.
- Detección de imágenes fuera de contexto: el brazo de VERITE distingue entre pares veraces y pares donde la imagen se reutiliza con un caption falso, un patrón habitual en campañas de desinformación.
- Moderación de contenido en plataformas: integrado como filtro previo que enruta solo los casos más controvertidos a revisión humana, reduciendo el coste de anotación gracias al componente de aprendizaje activo.
- Arranque de proyectos de fact-checking con pocas etiquetas: el esquema semilla + profesor calibrado + pseudo-etiquetas permite desplegar un detector con ~100 pares etiquetados por fold, sin necesidad de anotar miles de ejemplos.
- Investigación en aprendizaje activo y destilación: los tres brazos (`oracle`, `teacher`, `routed`) permiten comparar el impacto de la anotación humana frente al pseudo-etiquetado en un mismo warm-up.
- Evaluación comparativa de VLMs como verificadores: el pipeline calibra profesores zero-shot (InternVL3-8B, Qwen2.5-VL-7B, LLaVA-OneVision-7B) y permite medir su utilidad real como fuente de pseudo-etiquetas en tareas de verificación.

## Benchmarks y rendimiento

Resultados reportados en la model card (medias sobre semillas).

VERITE (True vs. OOC, validación cruzada de 5 folds, 4 semillas, ~100 pares etiquetados por fold):

| Metodo | Accuracy | AUC |
|---|---|---|
| CLIP zero-shot | 73,0 | 0,807 |
| InternVL3-8B zero-shot | 61,2 | 0,680 |
| Qwen2.5-VL-7B zero-shot | 33,0 | 0,265 |
| LLaVA-OneVision-7B zero-shot | 36,6 | 0,316 |
| CALM-MM Teacher | 74,8 | 0,829 |
| CALM-MM Routed | 75,2 | 0,829 |

MOCHEG (test) y FACTIFY (val), micro-F1 de 3 clases, 3 semillas:

| Metodo | MOCHEG | FACTIFY |
|---|---|---|
| InternVL3-8B zero-shot | 57,5 | 57,4 |
| LLaVA-OneVision-7B zero-shot | 56,7 | 61,8 |
| Qwen2.5-VL-7B zero-shot | 53,3 | 54,5 |
| CALM-MM Teacher | 59,4 | 71,9 |
| CALM-MM Routed | 58,9 | 72,0 |
| CALM-MM Oracle | 52,2 | 74,6 |

## Requisitos de hardware

- El repositorio pesa 0,4 GB en total, por lo que los checkpoints del estudiante (GNN + logit de fusión) son ligeros y caben holgadamente en cualquier GPU consumer.
- VRAM estimada para inferencia: no disponible de forma explícita; depende del codificador de grafos y de los embeddings CLIP precalculados. Los embeddings de nodo son de 768 dimensiones.
- GPU recomendadas: cualquier GPU con suficiente memoria para el GNN y el extractor CLIP ViT-L/14 si se calculan embeddings en línea (RTX 3090, RTX 4090, A100, H100). Para solo inferencia sobre grafos precalculados, una GPU modesta es suficiente.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 en adelante si los embeddings están precalculados; no se especifica cifra exacta.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file`; la definición del codificador de grafos se publicará con el código. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje generativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | VERITE Acc./AUC | MOCHEG F1 | FACTIFY F1 | Licencia |
|---|---|---|---|---|---|---|---|
| CALM-MM (Routed) | GNN sobre CLIP + prior calibrado | no disponible | no aplica | 75,2 / 0,829 | 58,9 | 72,0 | Apache 2.0 |
| InternVL3-8B (zero-shot) | VLM generativo | 8B | no disponible | 61,2 / 0,680 | 57,5 | 57,4 | no disponible |
| Qwen2.5-VL-7B (zero-shot) | VLM generativo | 7B | no disponible | 33,0 / 0,265 | 53,3 | 54,5 | no disponible |
| LLaVA-OneVision-7B (zero-shot) | VLM generativo | 7B | no disponible | 36,6 / 0,316 | 56,7 | 61,8 | no disponible |

CALM-MM supera a los tres VLMs zero-shot en VERITE y MOCHEG, y a InternVL3-8B y Qwen2.5-VL-7B en FACTIFY (aunque LLaVA-OneVision-7B queda por debajo en MOCHEG y por encima en FACTIFY respecto a CALM-MM Teacher). La comparación es directa solo en la tarea de detección; los VLMs son modelos generativos de propósito general.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de generalización a otros idiomas.
- Es un clasificador específico de desinformación multimodal, no un modelo generativo: no sirve para chat, código, matemáticas ni razonamiento general.
- Los resultados dependen de la calidad del profesor zero-shot; el prior calibrado puede heredar sesgos del VLM o de CLIP.
- El brazo `oracle` rinde peor que `teacher` en MOCHEG (52,2 frente a 59,4), lo que sugiere inestabilidad del esquema de entrenamiento en algunos regímenes de etiquetado.
- Los checkpoints publicados corresponden a una sola semilla (42); el paper reporta medias sobre 3-4 semillas, por lo que el rendimiento real puede variar.
- No se redistribuye ningún dato de los benchmarks; es necesario obtener VERITE, MOCHEG y FACTIFY de sus autores originales bajo sus licencias.
- El código del codificador de grafos no está disponible todavía ("will be released upon publication"), lo que limita la reproducibilidad inmediata.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la clasificación; no se documentan análisis de calibración por clase ni métricas de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la autoría es anónima y el paper está bajo revisión, sin revisión por pares confirmada.

## Enlaces

- Hugging Face: https://huggingface.co/CALM-MM/CALM-MM
- Paper: bajo revisión, submission anónima (sin enlace público)
- Código: se publicará tras la publicación (sin enlace disponible)
- Benchmarks: VERITE, MOCHEG y FACTIFY (obtener de sus autores originales; sin enlaces en la información proporcionada)
