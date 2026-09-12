# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-fp16-novision

# Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-fp16-novision

## Resumen

Este repositorio contiene una version cuantizada a 6 bits del modelo identificado por su autor como Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored. Lo publica el usuario Johneeee en Hugging Face y su unico artefacto documentado es el resultado de un proceso de cuantizacion de precision mixta con la herramienta oQ (oMLX v0.6.4), no un entrenamiento o un ajuste documentado.

El modelo declara un tipo de arquitectura qwen3_5 y un total de 26.895.998.464 parametros en los pesos safetensors (aproximadamente 26,9 mil millones). El repositorio ocupa 22,5 GB y se distribuye en formato MLX safetensors, es decir, pensado para ejecutarse con el framework MLX de Apple sobre silicio de la serie M.

Su relevancia practica es limitada y muy concreta: se trata de una publicacion sin descargas ni interacciones, sin licencia declarada, sin idiomas indicados, sin model card tecnica mas alla de los parametros de cuantizacion y sin resultados de benchmarks. Resulta util unicamente como ejemplo de cuantizacion mixta de 6 bits aplicada a un modelo de casi 27B para inferencia local en Mac, siempre que se asuman las incognitas sobre su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; la model card declara el tipo qwen3_5, sin detallar si es densa, MoE o hibrida |
| Parametros totales | 26.895.998.464 (26,9 B), medidos sobre los pesos safetensors |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, cuantizacion mixta de precision con oQ (oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizados a 6 bits); repositorio de 22,5 GB |
| Libreria de inferencia | mlx |
| Etiquetas declaradas | mlx, safetensors, qwen3_5, oq, quantized, 6-bit |
| Fecha de creacion | 2026-09-12T10:28:51Z |
| Ultima actualizacion | 2026-09-12T10:31:35Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es la relativa a la cuantizacion. El autor indica que el modelo se cuantizo con oQ (oMLX v0.6.4) en modo de precision mixta, con 6 bits de resolucion y tamano de grupo 64, y que el resultado se serializa en safetensors para MLX. No se documenta el modelo base exacto del que parte, ni el proceso de entrenamiento, ni el numero de tokens, ni la composicion del dataset, ni si hubo fases de RLHF, DPO o similares.

El nombre del repositorio sugiere, sin confirmacion documental, que se trata de una fusion o mezcla de pesos (los fragmentos TWIN-TURBO y Fable-Cold-Fusion apuntan a convenciones habituales de merges de la comunidad) y de una variante sin censura (Uncensored), ademas de una version sin vision (novision). Ninguno de estos extremos se describe en la model card: el documento se limita a los parametros de cuantizacion. Tampoco hay informacion sobre innovaciones de atencion, decodificacion especulativa ni estrategias de entrenamiento.

## Capacidades

- Generacion de texto: es la unica capacidad implicita en un modelo de lenguaje publicado en este formato; la model card no la detalla ni la cuantifica.
- Razonamiento, codigo y matematicas: no documentado en la informacion disponible.
- Tool calling / function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentado (el campo de idiomas no esta declarado).
- Vision: el sufijo novision del nombre indica que la variante publicada no incluye entrada de imagen; no hay confirmacion en la model card.
- Modo thinking explicito: no documentado.
- Comportamiento sin censura: el nombre incluye Uncensored, pero no existe documentacion sobre el metodo aplicado (abliteration, fine-tuning o merge) ni sobre sus efectos medidos.

## Casos de uso

- Inferencia local en Mac con MLX: cargar el repositorio con mlx-lm sobre un equipo Apple Silicon con memoria unificada suficiente permite ejecutar un modelo de casi 27B en 6 bits sin depender de servicios en la nube. Es el escenario para el que el formato de pesos esta pensado.
- Prototipado offline en portatiles de gama alta: al ocupar 22,5 GB en disco y requerir memoria unificada acorde, encaja en flujos de trabajo de desarrollo sin conectividad, siempre que se acepte la ausencia de garantias de licencia.
- Evaluacion de tecnicas de cuantizacion mixta: el repositorio sirve como caso de estudio reproducible de oQ con 6 bits y group size 64, comparando perplejidad y consumo de memoria frente al modelo sin cuantizar.
- Experimentacion con modelos derivados de la familia Qwen3: util para investigadores que estudian como se comportan los merges de la comunidad y las variantes sin censura, con la advertencia de que aqui no hay documentacion de procedencia.
- Generacion de texto creativo sin filtros declarados: el nombre sugiere menor alineacion de rechazo, lo que puede interesar en escritura ficcional; no obstante, no hay evaluacion publicada que respalde ese comportamiento.
- Base para conversion a otros formatos: los pesos safetensors podrian convertirse a GGUF para usarse con llama.cpp u Ollama, aunque el repositorio no documenta ni proporciona dicho proceso.
- Pruebas de integracion en aplicaciones de escritorio para macOS: al ser un formato nativo de MLX, permite validar latencias y consumo de memoria en herramientas como LM Studio con backend MLX.
- Docencia y demostraciones de despliegue local: sirve para ilustrar el coste real en memoria de un modelo de ~27B cuantizado a 6 bits frente a alternativas de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo (los unicos resultados obtenidos eran articulos enciclopedicos y periodisticos sobre la Super Bowl, sin ninguna relacion con este repositorio).

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: los pesos a 6 bits ocupan aproximadamente 20-21 GB (26,9 B x ~0,75 bytes por parametro, mas escalas y sesgos del group size 64); con cache KV y overhead del runtime, se recomienda un minimo de 24 GB libres y 32 GB o mas para contextos largos. Cifra estimada a partir del tamano del repositorio (22,5 GB), no publicada por el autor.
- GPU compatibles: al ser un formato MLX, el destino natural es Apple Silicon (familias M1/M2/M3/M4 Pro, Max y Ultra). No hay soporte documentado para CUDA en este repositorio.
- Equipos consumer: cabe en Mac con memoria unificada de 32 GB o superior; en configuraciones de 16 GB o 24 GB no es viable sin swap. En GPUs NVIDIA consumer solo seria posible tras una conversion de formato que el repositorio no documenta.
- Opciones de despliegue: mlx-lm como opcion principal; LM Studio con backend MLX; conversion a GGUF (no incluida) para llama.cpp, Ollama o similares; vLLM y TGI no soportan pesos MLX de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

No hay datos verificables para establecer una comparativa. La model card no identifica el modelo base ni sus caracteristicas, por lo que no es posible contrastar parametros, contexto, rendimiento ni licencia con alternativas concretas.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-fp16-novision | 26,9 B | no disponible | 6 bits, group size 64 (MLX) | no disponible | Hugging Face, 0 descargas |
| Alternativas comparables de ~27-32 B en formato MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; en produccion esto supone un riesgo legal directo.
- Procedencia sin documentar: no se especifica el modelo base, ni los datos de entrenamiento, ni los pasos de ajuste, lo que impide auditar sesgos o cumplimiento normativo.
- Riesgo de alucinacion: no evaluado. No existen metricas de fidelidad ni de hallucination rate para esta variante.
- Efectos de la cuantizacion: la cuantizacion mixta a 6 bits introduce degradacion respecto al modelo original; el autor no publica comparativas de perplejidad ni de calidad.
- Comportamiento sin censura: el nombre indica Uncensored, pero no se documenta el metodo ni se advierte de los riesgos asociados a la generacion de contenido no filtrado.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede garantizarse el comportamiento en castellano ni en textos largos.
- Formato restrictivo: al ser MLX safetensors, no es directamente desplegable en infraestructura CUDA; requiere conversion no documentada.
- Adopcion nula: cero descargas y cero likes, sin comunidad que haya validado el modelo, sin issues ni referencias externas.
- Fechas de publicacion futuras: los metadatos indican creacion el 2026-09-12, dato a verificar antes de tratarlo como referencia cronologica fiable.

## Enlaces

- Hugging Face: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-fp16-novision
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog o demo del modelo: no disponible
- Resultados de benchmarks: no disponible
- La busqueda web realizada no devolvio ningun enlace relacionado con este modelo.
