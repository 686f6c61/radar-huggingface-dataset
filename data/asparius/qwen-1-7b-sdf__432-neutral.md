# asparius/qwen-1.7b-sdf__432-neutral

## Resumen

El modelo `asparius/qwen-1.7b-sdf__432-neutral` es un ajuste fino supervisado (SFT) del modelo `locuslab/safelm-1.7b`, publicado por el usuario asparius en HuggingFace. Se trata de un modelo de generacion de texto orientado a conversacion, entrenado con la libreria TRL (version 1.6.0) sobre Transformers 5.3.0.dev0 y PyTorch 2.9.1. Por el nombre y por el modelo base, se trata de un transformer pequeno, en el entorno de los 1.700 millones de parametros, aunque la model card no confirma ni la arquitectura exacta ni el numero de parametros.

El modelo no incluye informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, el idioma o idiomas soportados, la longitud de contexto ni la licencia aplicable. La model card se limita a indicar que se genero con `Trainer`/TRL mediante SFT y enlaza a una ejecucion de Weights & Biases con nombre `ais-em-midtrain`, lo que sugiere que forma parte de una linea de experimentos de ajuste (posiblemente relacionados con alineamiento o seguridad, dado el nombre del modelo base SafeLM), pero no hay documentacion que lo confirme.

Su relevancia actual es limitada: cuenta con 0 descargas y 0 likes, no publica benchmarks y no declara licencia, por lo que debe considerarse un artefacto de investigacion experimental y no un modelo listo para produccion. Resulta de interes para quien quiera reproducir o auditar experimentos de SFT sobre modelos pequenos de seguridad, o comparar el efecto de un ajuste "neutral" frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de `locuslab/safelm-1.7b`; el nombre sugiere familia Qwen, sin confirmar) |
| Parametros totales | no disponible (aproximadamente 1,7 mil millones segun el nombre del modelo, sin confirmar en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo de la model card indica `licence: license`, sin especificar terminos) |
| Formato de pesos | safetensors (libreria `transformers`; repositorio de 21,7 GB, compatible con `pipeline`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card. El modelo es un ajuste fino de `locuslab/safelm-1.7b`, que actua como modelo base declarado mediante los tags `base_model:locuslab/safelm-1.7b` y `base_model:finetune:locuslab/safelm-1.7b`. Por tanto, la arquitectura interna, el tokenizador, la ventana de contexto y el preentrenamiento original corresponden al modelo base, no documentado en esta ficha.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 1.6.0, sobre Transformers 5.3.0.dev0, PyTorch 2.9.1, Datasets 4.8.4 y Tokenizers 0.22.2. La model card enlaza a una ejecucion de Weights & Biases (`ais-em-midtrain`, run `2ixwmcab`) donde presumiblemente se registran curvas de entrenamiento, pero no se documentan ni el dataset, ni el numero de tokens, ni si hubo etapas posteriores de RLHF, DPO o similar. No se describe ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, hibridez SSM, etc.). El nombre `qwen-1.7b-sdf__432-neutral` sugiere una variante "neutral" dentro de un barrido de configuraciones de un experimento mayor, pero el significado de `sdf` y `432` no esta documentado.

## Capacidades

- Generacion de texto conversacional: la model card incluye un ejemplo de uso con `transformers.pipeline` sobre un mensaje con rol `user` y `max_new_tokens=128`, lo que indica soporte de plantillas de chat conversacional.
- Uso directo con el ecosistema Transformers (`pipeline`, `device="cuda"`), sin dependencias adicionales documentadas.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no disponibles (no se documentan en la informacion proporcionada).
- Tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes o razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: no disponibles (no se declara ninguna lengua).
- Modo "thinking", vision o audio: no disponible (no se menciona).

## Casos de uso

- Investigacion en alineamiento y seguridad: el modelo base (`safelm-1.7b`) procede de locuslab, un grupo de investigacion en seguridad de IA, y esta variante parece formar parte de un barrido de experimentos (`ais-em-midtrain`). Puede usarse como punto de comparacion frente al modelo base para medir el efecto del ajuste SFT sobre comportamientos de seguridad.
- Experimentos reproducibles de SFT con TRL: al documentar las versiones exactas del framework (TRL 1.6.0, Transformers 5.3.0.dev0, PyTorch 2.9.1), sirve para reproducir o auditar un pipeline de ajuste supervisado sobre un modelo pequeno.
- Prototipado local en GPU de consumo: con ~1,7B de parametros, es viable ejecutarlo en una GPU de gama alta de consumo para pruebas de generacion de texto e iteracion rapida en cuadernos, sin costes de API.
- Generacion de respuestas conversacionales de un solo turno: el ejemplo de la model card muestra su uso para responder preguntas abiertas, adecuado para demos y validacion de plantillas de chat.
- Evaluacion de riesgos y red-teaming de modelos pequenos: puede emplearse como sujeto de pruebas en baterias de prompts adversarios para estudiar como un ajuste sobre un modelo "seguro" modifica las respuestas.
- Generacion de datos sinteticos a pequena escala: util para crear borradores de conversaciones que luego se filtran o revisan antes de usarse en otros pipelines, siempre con supervision humana.
- Educacion y docencia: como ejemplo practico de modelo ajustado con SFT para explicar el flujo completo (modelo base, dataset, entrenamiento, publicacion en HuggingFace).

En todos los casos debe tenerse en cuenta que no hay licencia declarada, ni benchmarks, ni garantias de calidad, por lo que no se recomienda su uso en produccion ni en aplicaciones orientadas a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente enlaza a una ejecucion de Weights & Biases (`https://wandb.ai/ocagatankuisai-ko-university/ais-em-midtrain/runs/2ixwmcab`), que no se ha podido consultar en el material proporcionado y que, en cualquier caso, corresponderia a metricas de entrenamiento (perdida, learning rate), no a evaluaciones comparativas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de un modelo de ~1,7B de parametros; no confirmada por el autor):
  - FP16/BF16: aproximadamente 3,5-4 GB solo de pesos, mas memoria para el contexto y el runtime (aproximadamente 4-6 GB en total).
  - INT8: aproximadamente 2 GB de pesos.
  - INT4: aproximadamente 1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4). Para INT8/INT4 bastan GPUs con 4-6 GB.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs modernas con 6-8 GB o mas, siempre que se use precision reducida.
- Opciones de despliegue: `transformers` con `pipeline` (documentado por el autor), y en principio vLLM, TGI o llama.cpp/Ollama si se convierten los pesos a los formatos correspondientes (no se publican GGUF ni builds oficiales). El repositorio pesa 21,7 GB, muy por encima de los ~3,4 GB esperables en FP16 para 1,7B de parametros, lo que apunta a multiples copias de pesos, checkpoints intermedios o estados del optimizador; conviene revisar el contenido antes de descargar.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos corresponden a informacion publica de sus respectivas fichas y pueden variar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `asparius/qwen-1.7b-sdf__432-neutral` | no disponible (~1,7B segun el nombre) | no disponible | no disponible | HuggingFace, 0 descargas | no disponible |
| `locuslab/safelm-1.7b` (modelo base) | 1,7B (segun denominacion) | no disponible | no disponible | HuggingFace | no disponible |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5B | 32.768 tokens | Apache-2.0 | HuggingFace | benchmarks publicados por el autor |
| `HuggingFaceTB/SmolLM2-1.7B-Instruct` | 1,7B | 8.192 tokens | Apache-2.0 | HuggingFace | benchmarks publicados por el autor |
| `google/gemma-2-2b-it` | 2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace | benchmarks publicados por el autor |

La diferencia principal frente a las alternativas es la ausencia total de documentacion en este modelo: no declara licencia, no publica evaluaciones y no especifica contexto ni idiomas, mientras que las alternativas citadas si lo hacen.

## Limitaciones y advertencias

- Licencia no especificada: el campo `licence: license` de la model card no define terminos de uso. No hay autorizacion explicita para uso comercial ni para redistribucion; debe contactarse con el autor antes de cualquier despliegue.
- Ausencia total de documentacion: no se indican dataset de entrenamiento, numero de tokens, composicion de datos, idiomas ni proceso de alineamiento, lo que impide evaluar sesgos o comportamientos no deseados.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo pequeno (~1,7B) ajustado con SFT, es esperable una tasa de error factual elevada, especialmente fuera del dominio de entrenamiento.
- Sesgos conocidos: no disponibles. Sin informacion sobre el dataset, no es posible caracterizar sesgos de genero, raza, idioma o ideologia.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la ventana de contexto efectiva y que lenguas maneja con calidad, por lo que no se puede garantizar un comportamiento correcto en castellano.
- Trazabilidad limitada: el modelo se ha publicado con 0 descargas y 0 likes, sin paper, blog ni repositorio asociado, lo que dificulta la verificacion independiente de sus resultados.
- Pesos del repositorio sobredimensionados: 21,7 GB para un modelo de ~1,7B sugiere checkpoints redundantes o estados de entrenamiento; conviene auditar el contenido antes de integrarlo en un pipeline.
- Idoneidad para produccion: baja. No se recomienda su uso en sistemas con usuarios finales, tareas criticas, cumplimiento normativo o entornos donde se exija una licencia clara y evaluaciones reproducibles.
- Recomendacion de uso: exclusivamente investigacion, experimentacion y docencia, con supervision humana y validacion de las salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asparius/qwen-1.7b-sdf__432-neutral
- Modelo base: https://huggingface.co/locuslab/safelm-1.7b
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/ocagatankuisai-ko-university/ais-em-midtrain/runs/2ixwmcab
- Paper o documentacion tecnica del modelo: no disponible
- Demo o Space asociado: no disponible
