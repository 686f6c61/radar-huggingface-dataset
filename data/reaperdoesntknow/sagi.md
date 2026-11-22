# reaperdoesntknow/SAGI

## Resumen

SAGI (Swarm AGI Language Model) es un modelo de lenguaje causal de tipo decoder-only desarrollado por el usuario reaperdoesntknow, publicado en Hugging Face bajo licencia Apache 2.0. Su particularidad no reside en el tamano —con 52,7 millones de parametros es un modelo muy pequeno— sino en su propuesta arquitectonica: integrar dinamicas de inteligencia de enjambre (swarm intelligence) dentro de un transformer convencional. El modelo trata la cognicion como un sistema adaptativo en el que multiples "agentes" internos colaboran mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida, condicionando la atencion y las capas feed-forward del decoder.

La arquitectura combina un transformer decoder de 6 capas, 512 dimensiones ocultas y 8 cabezas de atencion con un modulo de dinamicas de enjambre (Swarm-7 V2.2) que mantiene un estado interno de trabajo. Ese estado se proyecta sobre la atencion y las FFN, creando un flujo bidireccional entre el procesamiento simbolico (tokens) y el subsimbolico (dinamicas del enjambre). El contexto maximo es de 2048 tokens y utiliza el tokenizador de GPT-2 con un vocabulario de 50.257 tokens.

Es relevante ahora como experimento de investigacion, no como herramienta de produccion. El propio autor lo describe como un modelo temprano, entrenado sobre un subconjunto de TinyStories y con calidad de generacion limitada (salidas potencialmente repetitivas o incoherentes). Su interes esta en la exploracion de arquitecturas cognitivas multiagente dentro de LLMs y en las innovaciones que propone: enrutamiento diferenciable, motor de curiosidad, memoria episodica y semantica, y monitorizacion de valores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder + dinamicas de enjambre (Swarm-7 V2.2) |
| Parametros totales | 52.729.731 |
| Parametros activos | no disponible (no es MoE clasico; usa enrutamiento diferenciable con top-k=5 sobre 20 agentes internos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 6 capas con 512 dimensiones ocultas, 8 cabezas de atencion y embeddings RoPE, acoplado a un modulo de dinamicas de enjambre que mantiene un estado de trabajo S (dimension 64) y una representacion de tarea T (dimension 32). El enjambre procesa observaciones derivadas de los embeddings de tokens (dimension 48) y actualiza su estado, que a su vez condiciona la atencion y las activaciones feed-forward mediante proyecciones aprendidas. La configuracion del enjambre incluye hasta 20 agentes cognitivos, enrutamiento disperso top-k=5 y un maximo de 5 iteraciones de "pensamiento" por paso.

Las innovaciones declaradas por el autor incluyen: enrutamiento diferenciable (DiffRouter) como mezcla continua de expertos via atencion en lugar de seleccion dura de modulos; un MetaController con gating adaptativo y dinamicas de confianza; memoria dual episodica y semantica con recuperacion entrenable; un motor de curiosidad que inyecta objetivos novedosos cuando la sorpresa es baja; un automodelo con rollback que predice transiciones de estado y detecta anomalias; dinamicas de recursos con presupuestos de computo (60,0), memoria (20,0) y energia (25,0); y monitorizacion de valores alineada con los valores nucleares "truth", "safety" y "efficiency".

El entrenamiento se realizo sobre un subconjunto de TinyStories, con optimizador AdamW (lr=3e-4, betas=(0.9, 0.999), weight_decay=0.01), scheduler de annealing coseno y precision FP32. El autor indica que el entrenamiento se ejecuto en CPU (compatible con CUDA). No se documenta el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto causal en ingles, orientada a narrativa simple por el dominio de entrenamiento (TinyStories).
- Razonamiento multi-paso interno mediante iteraciones de "pensamiento" del enjambre (hasta 5 por paso).
- Enrutamiento adaptativo entre agentes internos con mecanismos de confianza.
- Memoria episodica y semantica con recuperacion entrenable (concepto arquitectonico, no una API expuesta al usuario).
- Motor de curiosidad y automodelo con rollback para auto-correccion (componentes experimentales).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes externos: no disponible (los "agentes" son internos al modelo, no un sistema de orquestacion).
- Capacidades multilingues: solo ingles.
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en arquitecturas cognitivas multiagente: SAGI sirve como banco de pruebas para estudiar como un estado de enjambre condiciona la atencion de un transformer y que efecto tiene sobre la generacion, gracias a su tamano reducido (52,7M) que permite iterar rapidamente.
- Educacion en inteligencia de enjambre aplicada a LLMs: el modelo y su diagrama de flujo permiten explicar de forma tangible conceptos como enrutamiento diferenciable, memoria dual y presupuestos de recursos dentro de una red neuronal.
- Experimentos de memoria y recuperacion: su sistema de memoria episodica y semantica con recuperacion entrenable es un objeto de estudio util para comparar estrategias de consolidacion (EMA rapida 0,10 frente a lenta 0,002).
- Prototipado de mecanismos de auto-correccion: el automodelo con rollback y la deteccion de anomalias pueden evaluarse en tareas sinteticas de prediccion de transiciones de estado.
- Estudio de alineacion y monitorizacion de valores: el modulo de monitorizacion de valores con congelacion de plasticidad ante deriva permite experimentar con senales de alineacion en un modelo pequeno y controlable.
- Generacion de narrativa simple en ingles: dado su entrenamiento en TinyStories, puede usarse para generar cuentos cortos o completar prompts narrativos basicos en entornos de demostracion, siempre con expectativas de calidad bajas.
- Reproduccion de experimentos en hardware modesto: al haberse entrenado en CPU y ocupar 0,2 GB, es viable reproducir el pipeline en portatiles o entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara la entrada "SAGI" con una lista de resultados vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (52,7M de parametros, repo de 0,2 GB); en FP16 aproximadamente 0,11 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU, ya que el autor entreno en CPU.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers (via AutoModelForCausalLM), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque el autor no documenta dicha conversion ni soporte oficial.
- Latencia y throughput estimados: no disponible. El autor advierte que las dinamicas de enjambre anaden sobrecarga computacional respecto a un transformer estandar del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SAGI (reaperdoesntknow) | 52,7M | 2048 | Apache 2.0 | Transformer + dinamicas de enjambre, entrenado en TinyStories | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Transformer decoder clasico | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Transformer decoder, entrenamiento en 3T tokens | Hugging Face |
| SmolLM-135M (Hugging Face) | 135M | 2048 | Apache 2.0 | Transformer decoder, entrenamiento en datos web curados | Hugging Face |

La comparacion es orientativa: SAGI es un experimento de investigacion con un dominio de entrenamiento muy restringido (TinyStories), por lo que no es directamente comparable en calidad de generacion con GPT-2 small, TinyLlama o SmolLM, que se entrenaron sobre corpus mucho mayores y con objetivos de uso general. No se dispone de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de investigacion temprana: el autor lo califica explicitamente como experimental y no apto para produccion.
- Entrenado solo en un subconjunto de TinyStories: las salidas tienden a ser simples, narrativas y potencialmente repetitivas o incoherentes.
- Infraentrenado segun el propio autor; la calidad de generacion es baja.
- Solo soporta ingles; no hay capacidades multilingues.
- Contexto limitado a 2048 tokens.
- Riesgo elevado de alucinacion y de generar contenido no factual; el autor prohibe su uso para generacion de contenido factual.
- No apto para sistemas de seguridad critica.
- Sobrecarga computacional anadida por las dinamicas de enjambre frente a un transformer equivalente.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones tecnicas y de calidad hacen inviable ese escenario en la practica.
- No se documentan sesgos especificos, aunque al entrenarse en TinyStories (cuentos infantiles sinteticos) el dominio y el estilo estan fuertemente sesgados.
- Las capacidades declaradas (memoria, curiosidad, monitorizacion de valores) son componentes internos del modelo, no interfaces utilizables por el desarrollador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SAGI
- TinyStories (dataset de entrenamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- Tokenizador GPT-2: https://huggingface.co/gpt2
- Libreria transformers: https://github.com/huggingface/transformers
