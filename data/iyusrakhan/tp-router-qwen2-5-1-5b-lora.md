# iyusrakhan/tp-router-qwen2.5-1.5b-lora

## Resumen

`iyusrakhan/tp-router-qwen2.5-1.5b-lora` es un adaptador LoRA (PEFT) publicado por el usuario iyusrakhan sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, una version cuantizada en 4 bits del Qwen2.5-1.5B-Instruct de Alibaba. El nombre del repositorio sugiere un ajuste orientado a enrutamiento (router), probablemente en el contexto de tensor parallelism o de seleccion de ruta en un pipeline, aunque la model card no documenta explicitamente el objetivo del entrenamiento.

El artefacto es unicamente el adaptador, no los pesos completos: el repositorio ocupa 0,1 GB y contiene tensores en formato safetensors compatibles con la libreria `peft`. Para utilizarlo es necesario cargar primero el modelo base y despues aplicar el adaptador, lo que implica que hereda las caracteristicas del Qwen2.5-1.5B-Instruct original (transformer decoder-only de 1.540 millones de parametros, contexto nativo de 32.768 tokens).

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un experimento personal sin descargas ni likes, sin licencia declarada, sin idiomas declarados y con una model card generada a partir de la plantilla vacia de Hugging Face. No hay informacion publica sobre datos de entrenamiento, hiperparametros, evaluacion ni proposito concreto, por lo que cualquier uso en produccion exige una validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.540 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | base en 4 bits (bnb-4bit via Unsloth); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (la model card no los declara; el base soporta multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, RoPE, normalizacion RMSNorm y activacion SwiGLU, con 1.540 millones de parametros y ventana de contexto de 32.768 tokens. El modelo base fue cuantizado en 4 bits mediante bitsandbytes y empaquetado por Unsloth, lo que reduce el uso de VRAM durante el ajuste fino. El adaptador en si es un conjunto de matrices de bajo rango (LoRA) entrenadas con SFT (supervised fine-tuning) usando el stack `transformers` + `trl` + `unsloth`, segun los tags del repositorio.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO, el rango LoRA, el alpha, el learning rate ni la duracion del entrenamiento. La model card conserva los marcadores `[More Information Needed]` en todas las secciones de detalles, datos, procedimiento y evaluacion. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para el ajuste eficiente en memoria.

## Capacidades

- Generacion de texto conversacional, heredada del Qwen2.5-1.5B-Instruct base.
- Razonamiento basico y respuesta a instrucciones en formato chat.
- Generacion de codigo y matematicas a nivel de modelo pequeno (1.5B), con calidad limitada frente a modelos mayores.
- Soporte multilingue heredado del base (Qwen2.5 cubre decenas de idiomas), aunque el adaptador puede haber especializado o degradado el comportamiento en algunos de ellos.
- Posible comportamiento de enrutamiento o seleccion de ruta (sugerido por el nombre `tp-router`), no documentado ni verificado.
- Soporte de tool calling / function calling: no documentado en el adaptador; el base Qwen2.5-Instruct lo soporta de forma nativa, pero el ajuste puede haberlo alterado.
- Modo thinking: no disponible.
- Vision y audio: no disponibles (modelo solo texto).

## Casos de uso

- Experimentacion con enrutamiento en pipelines de inferencia: el nombre del adaptador sugiere su uso como clasificador o selector de ruta (por ejemplo, decidir entre varios backends o shards en tensor parallelism); requiere validacion empirica antes de adoptarlo.
- Prototipado rapido de asistentes conversacionales: al ser un adaptador de 0,1 GB sobre un base de 1.5B, permite iterar en local con requisitos de VRAM modestos.
- Fine-tuning incremental en dominios acotados: sirve como ejemplo de pipeline Unsloth + TRL + PEFT para reproducir el flujo de SFT en modelos pequenos.
- Evaluacion de tecnicas de cuantizacion: util para comparar el comportamiento del base en 4 bits con y sin adaptador en tareas de instruccion.
- Docencia y formacion: ejemplo didactico de como se publica y se carga un adaptador LoRA sobre un modelo cuantizado.
- Pruebas de regresion de calidad: usar el adaptador como caso de estudio para medir deriva (drift) respecto al base en benchmarks internos.
- No recomendado como componente de produccion sin evaluacion propia, dado que no hay metricas publicadas ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4 bits ocupa aproximadamente 1-2 GB; en fp16/bf16 alrededor de 3-4 GB; el adaptador anade un consumo marginal (decenas de MB).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para el base cuantizado (RTX 3060, RTX 4060, RTX 4090); en fp16 basta con 6-8 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con al menos 6 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), `llama.cpp`/`Ollama` tras fusionar y convertir a GGUF, vLLM y TGI tras fusionar el adaptador con el base (merge_and_unload).
- Latencia y throughput estimados: no disponibles; para un modelo de 1.5B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| iyusrakhan/tp-router-qwen2.5-1.5b-lora | 1.5B (base) + LoRA | 32.768 | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 (Qwen Research para algunos) | Hugging Face |
| Llama 3.2-1B-Instruct | 1.2B | 128.000 | Llama 3.2 Community License | Hugging Face, Meta |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para el adaptador. Frente al base, la unica diferencia documentada es la presencia del ajuste LoRA, cuyo efecto no esta cuantificado.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin detalles de entrenamiento, datos ni evaluacion.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o tratar el artefacto como no licenciado.
- Idiomas no declarados: el comportamiento multilingue puede diferir del base y no esta verificado.
- Riesgo de alucinacion y de degradacion respecto al base: un LoRA sin evaluacion publica puede empeorar el rendimiento en tareas generales.
- Sin descargas ni likes: no hay senales de uso comunitario ni de validacion por terceros.
- El adaptador depende del base cuantizado de Unsloth (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`); cargarlo sobre otros pesos puede dar resultados distintos.
- El proposito real (enrutamiento en tensor parallelism) es una inferencia a partir del nombre, no una afirmacion del autor.
- Para produccion se recomienda fusionar el adaptador, evaluar en un conjunto propio y revisar la licencia del modelo base (Apache 2.0 en Qwen2.5-1.5B-Instruct) antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iyusrakhan/tp-router-qwen2.5-1.5b-lora
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Paper de referencia citado en los tags (impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
