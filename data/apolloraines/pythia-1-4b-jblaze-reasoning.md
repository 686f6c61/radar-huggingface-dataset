# ApolloRaines/Pythia-1.4B-jBlaze-Reasoning

## Resumen

Pythia 1.4B jBlaze Reasoning es una version modificada del modelo EleutherAI/pythia-1.4b, desarrollada por ApolloRaines con la tecnologia jBlaze de SAIQL. La novedad principal es que la mejora de razonamiento se logra mediante edicion de pesos conductual (behavioral weight editing), sin ningun entrenamiento basado en gradientes: no hay fine-tuning, no hay LoRA, no hay descenso de gradiente ni datos de entrenamiento adicionales. El procedimiento aplica proyecciones direccionales calculadas a partir de pares de prompts contrastivos directamente sobre las matrices de pesos del modelo.

El modelo mantiene exactamente los mismos parametros que el Pythia 1.4B de partida: 1.414.647.808 parametros, con arquitectura GPT-NeoX y 24 capas transformer. Segun las evaluaciones publicadas por el autor, la precision en un benchmark propio de razonamiento held-out de 100 preguntas sobre 5 categorias (logica, matematicas, secuencias, razonamiento verbal y causal) sube del 7% al 56% con respecto a la variante DNP previa. El modelo es relevante porque demuestra una alternativa de bajo coste computacional a los metodos clasicos de ajuste fino, aunque sus limitaciones de generacion de texto libre son explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (Transformer) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la del modelo EleutherAI/pythia-1.4b: un transformer GPT-NeoX de 24 capas, con atencion por cabezas y MLP densos. La modificacion realizada por ApolloRaines no altera la arquitectura, sino que edita los pesos de las proyecciones de salida de atencion y de las capas densas MLP en las 24 capas mediante el compilador jBlaze. El metodo construye "direcciones conductuales" a partir de pares de prompts contrastivos y las proyecta directamente sobre las matrices de pesos, sin senal de gradiente y sin datos de entrenamiento adicionales. Se aplicaron dos direcciones conductuales complementarias.

Antes de la edicion de razonamiento, el modelo base fue procesado con DNP (Direct Neural Programming) para inyeccion de conocimiento. El coste computacional del proceso completo de edicion fue inferior a 2 minutos en una NVIDIA RTX 3090, con aproximadamente 60 segundos para la extraccion de direcciones y 5 segundos para la proyeccion de pesos. No se ha publicado ningun paper con el metodo: la tecnologia jBlaze es propietaria de SAIQL.

## Capacidades

- Razonamiento a nivel de decision: el modelo evalua mejor en tareas de opcion multiple con puntuacion logit-level, siguiendo la metodologia de benchmarks como MMLU. La mejora se observa en logica, matematicas, secuencias, razonamiento verbal y causal.
- Generacion de texto: el modelo conserva la capacidad generativa de Pythia 1.4B, aunque el autor advierte que no produce texto libre de alta calidad independientemente de las ediciones de razonamiento.
- No documentado: no se menciona soporte de tool calling, function calling, agentes, vision, audio ni modos de pensamiento extendido en la informacion proporcionada.
- Multilinguismo: no se especifican idiomas soportados; el modelo base Pythia esta entrenado principalmente en ingles, por lo que la cobertura multilingue no esta verificada.

## Casos de uso

- Investigacion en edicion de pesos: el modelo resulta util para estudiar como la proyeccion direccional sobre pesos modifica comportamientos sin retraining, comparando respuestas antes y despues de la edicion.
- Evaluacion de tecnicas de razonamiento en modelos pequenos: sirve como benchmark interno para comprobar si la edicion conductual generaliza a otras tareas de opcion multiple, usando el script de evaluacion incluido en el repositorio.
- Analisis de mecanismos internos: al conservar el mismo numero de parametros y arquitectura, permite comparar mapas de activacion entre el Pythia original y esta version para identificar en que capas se concentran los cambios.
- Prototipado rapido de experimentos sin GPU de gran capacidad: el coste de edicion es tan bajo que puede realizarse en una RTX 3090, por lo que el modelo es adecuado para pruebas de concepto en laboratorios sin infraestructura grande.
- Comparacion de metodos de modificacion sin entrenamiento: junto con el modelo DNP base, permite comparar la eficacia relativa de DNP y jBlaze sobre la misma arquitectura.
- Docencia sobre limites de los benchmarks: puede utilizarse para demostrar que una gran subida porcentual en un benchmark propio y de pocas preguntas no implica una mejora equivalente en texto libre ni una "inteligencia" general mayor.

## Benchmarks y rendimiento

El autor presenta resultados de un benchmark propio de 100 preguntas held-out en 5 categorias, evaluado mediante opcion multiple a nivel de logits. No se han publicado resultados de benchmarks externos (como MMLU, ARC o HumanEval) en la informacion disponible.

| Modelo | Global | Logica | Matematicas | Secuencias | Verbal | Causal | Perplejidad |
|---|---|---|---|---|---|---|---|
| Pythia 1.4B crudo | 11% | 15% | 10% | 10% | 10% | 10% | -- |
| DNP base (antes de ediciones de razonamiento) | 7% | 20% | 10% | 5% | 0% | 0% | 2.64 |
| jBlaze Reasoning | 56% | 55% | 60% | 30% | 60% | 75% | 3.20 |

La mejora global de la variante jBlaze sobre la base DNP es de 7% a 56%, lo que supone un incremento relativo del 700%. Todas las categorias mejoran, con aumentos especialmente notables en razonamiento causal (de 0% a 75%) y razonamiento verbal (de 0% a 60%). La perplejidad sube de 2.64 a 3.20, lo que indica un cambio distribucional moderado, no una degradacion catastrofica. El propio autor recomienda validar estos resultados con benchmarks independientes mas amplios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque el modelo base Pythia 1.4B es un modelo pequeno y el proceso de edicion se ejecuto en una NVIDIA RTX 3090.
- Opciones de despliegue: el modelo se carga mediante la libreria transformers en PyTorch; no se documentan otros entornos como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo modelo base proporcionadas por el autor, ya que no existen datos de benchmarks compartidos con otros modelos de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Precision global (benchmark del autor) | Perplejidad |
|---|---|---|---|---|---|
| EleutherAI/pythia-1.4b | 1.414.647.808 | no disponible | Apache 2.0 | 11% | -- |
| DNP base | 1.414.647.808 | no disponible | Apache 2.0 | 7% | 2.64 |
| ApolloRaines/Pythia-1.4B-jBlaze-Reasoning | 1.414.647.808 | no disponible | Apache 2.0 | 56% | 3.20 |

No se conocen benchmarks comparables con modelos como Llama 3.2 1B o Qwen 2.5 1.5B sobre este mismo conjunto de evaluacion, por lo que no se puede establecer una comparativa externa directa.

## Limitaciones y advertencias

- Generacion de texto libre: el autor advierte explicitamente de que el modelo no produce texto libre de alta calidad a pesar de las mejoras en razonamiento a nivel de decision. No debe usarse como reemplazo de modelos mas grandes para tareas de escritura.
- Generalizacion limitada: la evaluacion se realizo sobre un benchmark propio de 100 preguntas disenado por el autor. No hay resultados en MMLU, ARC, GSM8K ni otros benchmarks estandar, por lo que la mejora podria no generalizar.
- Sesgo de seleccion: el benchmark fue construido por la misma persona que desarrollo el modelo, lo que introduce un riesgo de sobreajuste a las preguntas o a las categorias elegidas.
- Cambio en la perplejidad: el aumento de 2.64 a 3.20 indica una alteracion de la distribucion de probabilidad, que puede afectar a la fluidez en generacion.
- Baseline variable: el modelo DNP base puntua 7% mientras que el Pythia crudo puntua 11%; ambos estan cerca del azar. La mejora del 8x se mide sobre el DNP base, no sobre el modelo original.
- Metodo propietario: jBlaze no esta publicado, por lo que los resultados no son reproducibles sin la herramienta de SAIQL.
- Multilinguismo no verificado: no se documentan idiomas soportados; es probable que el rendimiento fuera del ingles sea muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Pythia-1.4B-jBlaze-Reasoning
- Modelo base EleutherAI/pythia-1.4b: https://huggingface.co/EleutherAI/pythia-1.4b
- SAIQL / jBlaze: https://saiql.ai
- Perfil de ApolloRaines en Hugging Face: https://huggingface.co/ApolloRaines
