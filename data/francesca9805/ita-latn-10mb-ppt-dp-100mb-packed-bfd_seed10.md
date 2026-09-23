# francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/ita_latn_10mb`, un GPT-2 monolingüe para italiano (código de idioma `ita_latn`) entrenado por el proyecto Goldfish sobre un corpus de 10 MB. El ajuste lo ha realizado el usuario `francesca9805` utilizando la librería TRL (versión 0.23.0) mediante SFT (supervised fine-tuning), y el resultado es un modelo de 39.087.104 parámetros (aproximadamente 39 M) con pesos en safetensors y un tamaño de repositorio de 0,1 GB.

Se trata, por tanto, de un modelo experimental de escala muy reducida, sin model card descriptiva del dataset de entrenamiento, sin métricas publicadas y con 0 descargas y 0 likes en el momento de la consulta. El nombre del repositorio sugiere un experimento sistemático: base italiana de 10 MB, tokenizador o pipeline "ppt", datos empaquetados ("packed") de 100 MB, una variante identificada como "Dp" y una semilla concreta (`seed10`). El proyecto de Weights & Biases asociado se llama `new-tokenizers`, lo que apunta a una línea de investigación sobre tokenización y su efecto en modelos pequeños, aunque la model card no documenta esos extremos.

Su relevancia es acotada y de carácter investigador: sirve como punto de comparación reproducible para estudiar cómo influyen el tokenizador, el empaquetado de secuencias y la semilla en el ajuste fino de modelos GPT-2 minúsculos, y como ejemplo de pipeline TRL + SFT sobre un corpus pequeño. No es un modelo orientado a producción ni a tareas de razonamiento, código o matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only; segun la etiqueta `gpt2` del repositorio y el modelo base) |
| Parametros totales | 39.087.104 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se proporcionan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base y el identificador `ita_latn` apuntan al italiano en escritura latina, pero la model card no lo declara) |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2 con 39 M de parametros, es decir, muy por debajo de GPT-2 small (124 M). El modelo base, `goldfish-models/ita_latn_10mb`, pertenece al proyecto Goldfish, que entrena modelos monolingues con una cantidad de datos muy limitada (10 MB de texto por idioma) para estudiar el comportamiento de modelos pequenos en lenguas con pocos recursos. La model card del ajuste no detalla la configuracion exacta (numero de capas, dimensiones ocultas, cabezas de atencion ni posiciones maximas), por lo que esos datos figuran como no disponibles.

El entrenamiento se realizo con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del repositorio indica que los datos se empaquetaron ("packed") hasta unos 100 MB y que se fijo una semilla concreta (`seed10`), lo que sugiere un diseno experimental con replicas. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El registro de Weights & Biases vinculado (`f-padovani-university-of-groningen/new-tokenizers`, run `0c08uk4x`) es la unica fuente adicional de trazabilidad del experimento.

## Capacidades

- Generacion de texto autoregresiva en el estilo del corpus de ajuste; la model card incluye un ejemplo de `pipeline("text-generation")` con formato de mensajes de tipo `role: user`.
- Conversacion de un solo turno segun el ejemplo de uso documentado, con `max_new_tokens` configurable.
- Ajuste fino sobre instrucciones mediante SFT con TRL, lo que implica cierto grado de seguimiento de formato conversacional, sin garantias de calidad.
- Capacidades multilingues: no disponibles; no se declara un listado de idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el pipeline declarado es unicamente `text-generation`.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` segun las etiquetas del repositorio, lo que permite desplegarlo en infraestructura de inferencia estandar.

## Casos de uso

- Investigacion sobre tokenizacion: el proyecto asociado se denomina `new-tokenizers`, de modo que el modelo sirve como punto de medida de como un tokenizador alternativo afecta a la perdida y a la calidad de generacion en italiano con muy pocos datos.
- Reproducibilidad de experimentos de ajuste fino: al fijar una semilla (`seed10`) y un volumen de datos concreto (100 MB empaquetados), permite repetir y comparar ejecuciones controlando la varianza.
- Pruebas de pipeline TRL + SFT: util como caso de humo (smoke test) para validar versiones de TRL, Transformers y PyTorch antes de lanzar entrenamientos mayores.
- Generacion de texto en dispositivos embebidos: con 39 M de parametros y pesos de aproximadamente 78 MB en fp16, cabe en placas tipo Raspberry Pi o moviles sin acelerador, para prototipos de autocompletado o texto sintetico en italiano.
- Aumento de datos de bajo coste: generar borradores de texto en italiano para aumentar un corpus pequeno, siempre con revision humana posterior dado el riesgo de incoherencia.
- Docencia y demostraciones: ejemplo minimo y ejecutable en portatil para explicar el ciclo completo de ajuste supervisado, evaluacion y despliegue con `transformers`.
- Linea base (baseline) en evaluaciones: referencia de baja capacidad contra la que medir mejoras de tokenizacion, datos o hiperparametros en italiano.
- Pruebas de integracion de endpoints: al ser `endpoints_compatible`, sirve para validar despliegues con text-generation-inference sin consumir recursos de GPU significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: aproximadamente 156 MB en fp32 (39 M parametros x 4 bytes), 78 MB en fp16/bf16 (x 2 bytes), 39 MB en int8 y unos 20 MB en int4.
- VRAM total incluyendo cache KV y overhead del runtime: del orden de 1 GB o menos con lotes pequenos; no hay datos medidos en la informacion disponible.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer moderna es sobradamente suficiente (serie GTX 10, RTX 20/30/40, integradas recientes). A100 o H100 no aportan ventaja practica para este tamano.
- Ejecucion en CPU: viable y, para este tamano, a menudo preferible; tambien cabe en dispositivos de borde.
- Cabe en GPU consumer: si, en cualquier GPU consumer con al menos 1 GB de memoria libre, e incluso en GPUs integradas.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y servidores compatibles con la API de HuggingFace. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publica ninguna cuantizacion.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | 39.087.104 | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT sobre el base italiano de 10 MB |
| goldfish-models/ita_latn_10mb (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace | Modelo monolingue italiano entrenado con 10 MB; antecesor directo |
| GPT-2 small (referencia de la familia) | 124 M | 1024 tokens | MIT (version original de OpenAI) | Ampliamente disponible | Referencia de la misma arquitectura y orden de magnitud; no especifico de italiano |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan dataset de entrenamiento, numero de tokens, hiperparametros, criterios de evaluacion ni limitaciones conocidas.
- Licencia sin especificar (`licence: license` es un marcador de posicion): no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier uso en produccion.
- Tamano muy reducido (39 M de parametros) y corpus base de 10 MB: la cobertura lexica, el conocimiento factual y la coherencia a partir de unas pocas decenas de tokens seran muy limitados.
- Riesgo elevado de alucinacion y de texto incoherente o repetitivo, especialmente fuera del dominio y el registro del corpus de ajuste.
- Idiomas soportados no declarados: aunque el identificador `ita_latn` apunta al italiano, no hay confirmacion oficial; el comportamiento en otras lenguas es impredecible.
- Longitud de contexto no disponible: no se puede planificar el uso con conversaciones largas o documentos extensos.
- Sin senales de adopcion (0 descargas, 0 likes) ni de validacion externa por parte de la comunidad.
- Ausencia de versiones cuantizadas (GGUF, AWQ, GPTQ) publicadas, lo que obliga a convertirlas manualmente para segun que runtimes.
- Fechas del repositorio (creado y actualizado el 22 de septiembre de 2026) posteriores a la version de PyTorch declarada, lo que conviene verificar al reproducir el entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/ita_latn_10mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/0c08uk4x
- Repositorio de TRL: https://github.com/huggingface/trl
- Citacion de TRL (BibTeX incluido en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020.
