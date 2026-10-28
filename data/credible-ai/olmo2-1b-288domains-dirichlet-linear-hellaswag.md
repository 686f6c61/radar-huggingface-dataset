# credible-ai/olmo2-1B-288domains-dirichlet-linear-hellaswag

## Resumen

`olmo2-1B-288domains-dirichlet-linear-hellaswag` es un modelo de lenguaje de 1,41 B de parámetros publicado por credible-ai como artefacto de investigación para reproducir los experimentos del paper LinMix, un trabajo sobre mezcla de datos (*data mixing*) en preentrenamiento. No es un modelo de propósito general: es un checkpoint base entrenado desde cero con una receta de mezcla de datos concreta, pensado para comparar métodos de optimización de pesos de mezcla.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas, tamaño oculto 2048 y tokenizador GPT-NeoX-20B (vocabulario de 50.432 tokens). Se entrenó con OLMo-core sobre 32B tokens extraídos del corpus WebOrganizer, muestreados sobre 288 dominios definidos por la combinación de temática y formato, con pesos de mezcla optimizados por LinMix para la tarea HellaSwag.

Su relevancia es metodológica, no de producto: documenta una ablación de muestreo concreta (aproximación lineal del *surrogate* ajustada sobre el enjambre Dirichlet en lugar del enjambre de vértices, con utilidad lineal y r = 0), y publica junto a los pesos el `mix.json` con la mezcla exacta utilizada. Resulta útil para investigadores que trabajan en optimización de mezclas de preentrenamiento, no para aplicaciones finales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (`Olmo2ForCausalLM`), 18 capas, hidden size 2048 |
| Parámetros totales | 1.414.678.528 (≈1,41 B), dato real de safetensors |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantización | no disponible; solo se publican pesos en bfloat16, sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT para los pesos; datos de entrenamiento sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl |
| Formato de pesos | safetensors, bfloat16 (repo de ≈2,8 GB) |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Datos de entrenamiento | 32B tokens de `WebOrganizer/Corpus-200B` |
| Framework de entrenamiento | OLMo-core |
| Metadatos adicionales | `mix.json` con la mezcla de datos de entrenamiento |

## Arquitectura y entrenamiento

Modelo denso de tipo transformer decoder-only con la implementación OLMo 2 de Transformers: 18 capas, dimensión oculta 2048, 1,41 B de parámetros y tokenizador heredado de GPT-NeoX-20B. Los pesos se distribuyen en bfloat16 y el repositorio incluye el fichero `mix.json` con los pesos de mezcla efectivamente usados, lo que permite reproducir el muestreo.

El entrenamiento cubre 32B tokens del corpus WebOrganizer, organizado en 288 dominios que combinan temática y formato, y ejecutado con OLMo-core. La mezcla no se eligió de forma manual: se optimizó con LinMix para HellaSwag. En concreto, este checkpoint corresponde a una ablación de muestreo en la que el *surrogate* lineal se ajusta sobre el enjambre Dirichlet (en lugar del enjambre de vértices) con utilidad lineal π y r = 0; el enjambre proxy utilizado es `credible-ai/olmo2-60M-288domains-dirichlet`, un modelo de 60 M que sirve para estimar la utilidad de cada mezcla candidata antes de entrenar el modelo grande. No se documentan en la información disponible fases de RLHF, DPO ni ajuste instructivo: es un checkpoint exclusivamente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés, propia de un modelo base preentrenado.
- Continuación de texto y modelado de lenguaje; no hay ajuste de instrucciones ni formato de chat.
- Razonamiento de sentido común básico, orientado implícitamente a HellaSwag por la optimización de la mezcla, sin métricas publicadas que lo confirmen.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, multi-step reasoning ni *thinking mode*.
- Sin capacidades multimodales (visión, audio) ni de código declaradas explícitamente.
- Monolingüe: únicamente inglés; el corpus de entrenamiento es web en inglés.
- Capacidad auxiliar de reproducibilidad: el `mix.json` publicado permite replicar la receta de datos.

## Casos de uso

- Reproducción de experimentos LinMix: cargar el checkpoint y el `mix.json` para replicar la curva de validación en HellaSwag de la ablación lineal sobre enjambre Dirichlet, verificando los resultados del paper con el mismo presupuesto de 32B tokens.
- Ablación controlada de métodos de mezcla de datos: usar este modelo como rama «lineal / Dirichlet» frente a las variantes de vértices u otras utilidades, manteniendo constante el corpus (WebOrganizer) y el número de tokens.
- Estudio del coste del proxy swarm: comparar la calidad final del modelo de 1,41 B cuando la mezcla se optimiza con un proxy de 60 M, evaluando la transferibilidad de la señal del modelo pequeño al grande.
- Baseline en investigación académica sobre preentrenamiento: punto de partida barato (32B tokens) para medir el efecto de cambios en la composición del corpus sin asumir el coste de un preentrenamiento completo.
- Fine-tuning posterior para tareas concretas: al ser un checkpoint base con licencia MIT, puede servir de inicialización para ajuste supervisado en tareas de NLP en inglés cuando se quiera partir de una receta de datos documentada y replicable.
- Docencia y prácticas de MLSys: por su tamaño (≈2,8 GB en bfloat16) se puede entrenar, evaluar y servir en hardware de una sola GPU, lo que permite montar laboratorios completos de mezcla de datos y evaluación de modelos.
- Contraste de tokenizadores y arquitecturas: usar el modelo para comparar el tokenizador GPT-NeoX-20B frente a otros en tareas de eficiencia de tokenización, con una arquitectura OLMo 2 de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. HellaSwag es el objetivo para el que se optimizó la mezcla de datos, pero la model card no incluye la puntuación obtenida ni evaluaciones de MMLU, HumanEval, GSM8K u otras tareas.

## Requisitos de hardware

- VRAM estimada en bfloat16: ≈2,8 GB solo para pesos; con activaciones y caché KV, entre 4 y 6 GB para inferencia con lotes pequeños (estimación aritmética a partir de los 1,41 B de parámetros, no medida publicada).
- VRAM estimada en fp32: ≈5,7 GB solo para pesos.
- Cuantización: 8 bits ≈1,4 GB y 4 bits ≈0,7 GB de pesos (estimaciones); no hay artefactos cuantizados publicados, habría que generarlos.
- GPU consumer: cabe holgadamente en cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090); también es viable en CPU para pruebas puntuales.
- GPU de datacenter: A100 o H100 no son necesarias para inferencia; solo tendrían sentido para throughput muy alto o para reentrenar el modelo.
- Despliegue: compatible con `transformers` (vía `AutoModelForCausalLM`), vLLM y TGI. Para llama.cpp u Ollama es necesario convertir los pesos a GGUF, ya que no se distribuye esa variante.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| `credible-ai/olmo2-1B-288domains-dirichlet-linear-hellaswag` | 1,41 B | no disponible | MIT (pesos) | HuggingFace, 0 descargas, 0 likes | Artefacto de investigación; ablación lineal sobre enjambre Dirichlet, 32B tokens |
| `credible-ai/olmo2-60M-288domains-dirichlet` (proxy swarm) | ≈60 M (según el nombre del repositorio) | no disponible | no disponible en la información | HuggingFace | Modelo proxy usado para ajustar la mezcla; no pensado para uso final |
| OLMo 2 base 1B (AI2) | no disponible en la información | no disponible | no disponible en la información | HuggingFace | Modelo base de propósito general de la misma familia arquitectónica; referencia natural para medir la pérdida de calidad por el recorte a 32B tokens |

La comparación con modelos de propósito general de tamaño similar no resulta informativa: este checkpoint se entrenó con 32B tokens y una mezcla optimizada para una única tarea, mientras que los modelos base de su categoría se entrenan con presupuestos de tokens muy superiores y corpora más amplios.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación para reproducir experimentos de LinMix.
- Modelo base sin ajuste de instrucciones: no sigue instrucciones, no mantiene conversaciones ni respeta formatos de prompt de chat.
- Monolingüe en inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- Presupuesto de entrenamiento reducido (32B tokens) para 1,41 B de parámetros, muy por debajo de lo habitual en modelos de ese tamaño; la calidad esperada en tareas abiertas es limitada.
- Riesgo alto de alucinación y de generar contenido factualmente incorrecto, agravado por el carácter base del modelo.
- Datos de Common Crawl sin documentación de filtrado o desduplicación más allá de lo indicado por el corpus WebOrganizer: cabe esperar sesgos web, contenido tóxico y ruido en la distribución.
- No se publican evaluaciones de sesgo, toxicidad ni robustez.
- Longitud de contexto no documentada: planificar cualquier uso con ventanas largas exige una evaluación previa.
- Licencia MIT para los pesos, pero los datos derivan de DCLM 1b-1x (CC-BY-4.0) y de Common Crawl, con sus propios términos de uso; conviene revisar las obligaciones de atribución antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia numérica de rendimiento frente a alternativas.
- Ausencia de versiones cuantizadas o empaquetadas para llama.cpp/Ollama: cualquier despliegue ligero requiere trabajo de conversión propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-linear-hellaswag
- Modelo proxy (60M): https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Dataset de entrenamiento: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus origen DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Código de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Código de LinMix: https://github.com/credibleai/linmix
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
