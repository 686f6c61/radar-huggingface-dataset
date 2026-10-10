# francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed10

## Resumen

El modelo `francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed10` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/urd_arab_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo pequeno de generacion de texto, con 124.770.816 parametros, construido sobre una arquitectura tipo GPT-2 (transformer decoder-only) segun los tags publicados. El entrenamiento se ha realizado mediante Supervised Fine-Tuning (SFT) utilizando la libreria TRL, con un registro de la ejecucion en Weights & Biases asociado al proyecto "new-tokenizers" de la Universidad de Groningen.

El modelo base pertenece a la familia Goldfish, una coleccion de modelos monolingues de ~100 MB de datos de entrenamiento orientados a lenguas de bajos recursos. El sufijo "urd_arab" sugiere que el modelo esta orientado al urdu en escritura arabe, aunque la model card no confirma explicitamente los idiomas soportados. El nombre del ajuste ("ppt-mp-struct-core-100mb") apunta a un entrenamiento sobre datos estructurados, aunque no se detalla la composicion del dataset.

Su relevancia es limitada y muy especifica: se trata de un experimento academico de ajuste supervisado sobre un modelo pequeno, sin benchmark publicado, sin licencia declarada y sin idiomas confirmados. Resulta util principalmente como referencia tecnica dentro de una linea de investigacion sobre tokenizacion y datos estructurados, no como modelo de produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) segun tags |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se confirma GGUF u otros) |
| Idiomas soportados | no disponibles (el nombre del modelo base sugiere urdu en escritura arabe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Libreria | transformers |
| Modelo base | goldfish-models/urd_arab_100mb |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only autorregresivo, tal como indican los tags del repositorio. Con 124.770.816 parametros totales, se situa en la gama de modelos pequenos (por debajo de los 200 M), lo que implica una huella de memoria muy reducida y una capacidad limitada de razonamiento y conocimiento factual. No se dispone de informacion sobre el numero de cabezas de atencion, capas ni dimensiones ocultas exactas, ni sobre la longitud de contexto configurada.

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) con la libreria TRL (version 0.23.0), sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo parte del checkpoint `goldfish-models/urd_arab_100mb`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. La ejecucion esta documentada en Weights & Biases bajo el proyecto "new-tokenizers". No se declaran innovaciones tecnicas destacables (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autorregresiva en el idioma o idiomas del modelo base (presumiblemente urdu en escritura arabe, no confirmado).
- Ajuste supervisado orientado a formato estructurado, segun sugiere el nombre del checkpoint.
- Integracion sencilla mediante `transformers.pipeline("text-generation")`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingues mas alla del idioma base.
- No se confirman modos especiales (thinking, vision, audio).

## Casos de uso

- Experimentacion academica en tokenizacion: el modelo forma parte de una linea de trabajo sobre tokenizadores ("new-tokenizers"), por lo que resulta adecuado para reproducir experimentos de ajuste supervisado sobre datos estructurados.
- Pruebas de pipeline de SFT con TRL: sirve como ejemplo minimo para validar flujos de entrenamiento supervisado en hardware modesto.
- Generacion de texto en urdu/escritura arabe en entornos con recursos muy limitados: al ocupar 0,3 GB, puede desplegarse en CPU o GPU de gama baja, aunque la calidad no esta validada.
- Prototipado rapido de interfaces de generacion de texto: su reducido tamano permite iterar rapidamente en demos locales.
- Investigacion sobre modelos monolingues de bajos recursos: util para estudiar el comportamiento de modelos Goldfish tras un ajuste especifico.
- Educacion y formacion: puede emplearse como ejemplo didactico de fine-tuning con TRL y publicacion en HuggingFace.
- Comparacion de checkpoints de una misma familia: existen variantes con distintas semillas (`_seed10`, `_seed455`) y checkpoints intermedios (`ckpt500_seed10`), utiles para estudios de variabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 124,77 M de parametros):
  - FP32: aproximadamente 500 MB.
  - FP16/BF16: aproximadamente 250 MB.
  - INT8: aproximadamente 125 MB.
  - INT4: aproximadamente 63 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100) es sobradamente suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (confirmado), text-generation-inference (confirmado por tags), endpoints compatibles. No se confirma soporte de llama.cpp, Ollama, vLLM o TGI fuera de lo indicado por compatibilidad declarada.
- Latencia y throughput: no disponibles. Por tamano, se espera una latencia muy baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed10 | 124.770.816 | no disponible | no disponible | HuggingFace |
| goldfish-models/urd_arab_100mb (base) | no disponible | no disponible | no disponible | HuggingFace |
| francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed455 | no disponible | no disponible | no disponible | HuggingFace |
| francesca9805/urd-arab-100mb-after-ppt-mp-struct-100mb-ckpt500_seed10 | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento publicados para ninguno de los modelos comparados, por lo que la comparacion se limita a disponibilidad y parametros declarados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si se permite uso comercial. Debe tratarse como no apto para produccion hasta aclararlo con el autor.
- Idiomas no confirmados: la model card no lista idiomas soportados; la suposicion de urdu en escritura arabe proviene del nombre del modelo base.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, por lo que el riesgo de alucinacion y de baja fidelidad es alto y no medido.
- Modelo muy pequeno (124,77 M de parametros): capacidad de razonamiento, conocimiento factual y coherencia limitadas.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas.
- Sin datos sobre sesgos: al no documentarse el dataset ni el idioma, no es posible evaluar sesgos especificos.
- Entrenamiento SFT sin detalle de datos: se desconoce la composicion y el volumen del dataset de ajuste, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste al formato estructurado: el nombre del checkpoint sugiere entrenamiento sobre datos estructurados, lo que puede reducir la generalidad.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_100mb
- Checkpoint intermedio: https://huggingface.co/francesca9805/urd-arab-100mb-after-ppt-mp-struct-100mb-ckpt500_seed10
- Variante con otra semilla: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed455
- Pagina en FriendliAI: https://friendli.ai/models/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed10
- Pagina en FriendliAI (checkpoint): https://friendli.ai/models/francesca9805/urd-arab-100mb-after-ppt-mp-struct-100mb-ckpt500_seed10
- Registro en Free2AITools: https://free2aitools.com/model/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed455
- Ejecucion en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/2nt41uaa
- Repositorio de TRL: https://github.com/huggingface/trl
