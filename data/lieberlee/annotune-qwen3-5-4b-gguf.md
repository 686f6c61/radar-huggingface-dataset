# lieberlee/annotune-qwen3.5-4b-gguf

## Resumen

annotune-qwen3.5-4b-gguf es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario lieberlee, especializado en la anotacion de tipos celulares a nivel de cluster en datos de scRNA-seq (RNA de celula unica). Forma parte del agente AnnoTuneAgent y resuelve la tarea concreta de asignar nombres de tipo celular a clusters de expresion genica. Es, por tanto, un modelo de dominio muy especifico y no un asistente generalista.

El modelo base Qwen3.5-4B es un transformer denso de aproximadamente 4.326 millones de parametros (4,3 mil millones), cuantizado a Q6_K en formato GGUF para su uso con llama.cpp. El ajuste se realizo mediante LoRA (r=16, alpha=32) sobre los pesos bf16 sin cuantizar del modelo base, entrenado con Unsloth, y posteriormente se fusiono y cuantizo. La tarea cubierta es unicamente la de "name" (asignacion de nombre de tipo celular); la variante de machine learning (v9j ml) fue retirada.

Su relevancia es acotada pero clara: ofrece una via de despliegue local y ligera (un solo fichero GGUF de ~3,56 GB) para pipelines de anotacion celular, con licencia Apache-2.0 y compatibilidad con llama.cpp mediante `llama-server`. No dispone de vision ni de capacidades generalistas mas alla del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 (4,3 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en la configuracion de despliegue recomendada (`-c 4096`); entrenado con max_seq_len 2048 |
| Tipos de cuantizacion | Q6_K (unico fichero publicado); KV-cache opcional en q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3.5-4B. Sobre los pesos bf16 sin cuantizar (no sobre una version de 4 bits) se entreno un adaptador LoRA con Unsloth, con rango r=16, alpha=32 y aplicado a las proyecciones q/k/v/o/gate/up/down. El entrenamiento duro 2 epocas, con batch 2 y acumulacion de gradiente 4, learning rate 2e-4, evaluacion cada 25 pasos y seleccion del mejor checkpoint por eval_loss. El modo "thinking" del modelo base se desactivo durante el entrenamiento.

La tarea de nombre (v9k) conto con 788 ejemplos de entrenamiento y 43 de validacion, con max_seq_len de 2048, 198 pasos y un mejor eval_loss de 0,3935 en el paso 198. El adaptador se fusiono a bf16 con `llama-export-lora` y despues se cuantizo a Q6_K con llama.cpp (build b94959a). El resultado es un unico fichero fusionado de 3.563.025.664 bytes con SHA256 `4a90320205c32472b94172837499883322d360d80388998ca476a543fe0f43a5`. La variante de ML (v9j) esta retirada.

## Capacidades

- Anotacion de tipos celulares a nivel de cluster en datos de scRNA-seq (tarea "name").
- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Razonamiento y codigo basicos del modelo base (no validados especificamente para este fine-tune).
- Modo texto unicamente: sin vision.
- Modo thinking desactivado en el ajuste (`--reasoning off`).
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Soporte de tool calling / function calling: no disponible (no documentado para este fine-tune).
- Capacidades de agente multi-paso: no disponibles como tales; el modelo se integra como componente de AnnoTuneAgent, no como agente autonomo.

## Casos de uso

- Anotacion automatizada de clusters en analisis de scRNA-seq: el modelo recibe la informacion de expresion de un cluster y devuelve el nombre del tipo celular, sustituyendo la revision manual inicial en pipelines de analisis transcriptomico.
- Preetiquetado en flujos de anotacion supervisada: genera una primera propuesta de nombre por cluster que un biologo revisa y corrige, reduciendo el tiempo de curacion manual.
- Integracion en AnnoTuneAgent: se usa como el componente de asignacion de nombres dentro del agente, con contexto de hasta 4096 tokens para incluir marcadores y metadatos del cluster.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ser un GGUF Q6_K de ~3,56 GB, cabe en GPUs de gama media y permite anotar sin enviar datos genomicos a servicios externos.
- Procesamiento por lotes de multiples clusters: mediante `llama-server` se pueden encolar peticiones de anotacion para cientos de clusters en un mismo experimento.
- Reproducibilidad de analisis: al publicarse checksum SHA256 y los hiperparametros de entrenamiento, se puede auditar y replicar la anotacion en estudios que requieran trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es el eval_loss de validacion de la tarea de nombre (0,3935 en el paso 198).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q6_K ocupa ~3,56 GB; con contexto de 4096 y KV-cache en q8_0 se estima un uso adicional moderado, por lo que un total en torno a 5-6 GB de VRAM es suficiente (estimacion, no dato publicado).
- GPU recomendadas: cualquier GPU con al menos ~6 GB de VRAM; tarjetas como RTX 3060/4060 (8 GB) o superiores son adecuadas. Para mayor throughput, A100 o H100, aunque el modelo es pequeno y no las aprovecha intensivamente.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer con 8 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server`), tal como documenta el autor. Otras opciones (vLLM, TGI, Ollama) no estan documentadas para este fichero GGUF.
- Opcion de bajo consumo de VRAM: anadir `-ctk q8_0 -ctv q8_0` para reducir a la mitad la memoria de la KV-cache.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| annotune-qwen3.5-4b-gguf | 4,3 mil millones | 4096 (despliegue) | GGUF Q6_K | Apache-2.0 | Anotacion scRNA-seq (name) |
| Qwen/Qwen3.5-4B (base) | 4,3 mil millones | No disponible | safetensors/bf16 | Apache-2.0 | Modelo generalista |
| Modelos especializados en anotacion scRNA-seq | No disponible | No disponible | No disponible | No disponible | Anotacion celular |

El unico comparable directo con datos disponibles es el modelo base Qwen3.5-4B, del que este fine-tune hereda arquitectura y licencia. No se dispone de informacion sobre alternativas especializadas en anotacion de scRNA-seq para una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo cubre la tarea de asignacion de nombre de tipo celular; no es un asistente generalista fiable fuera de ese contexto.
- Sin vision: es texto unicamente.
- Sin datos de benchmarks publicados: el rendimiento real en produccion no esta validado mas alla del eval_loss de validacion.
- Conjunto de validacion pequeno (43 ejemplos): el eval_loss puede no reflejar bien el comportamiento en dominios biologicos distintos.
- Riesgo de alucinacion: como todo modelo generativo, puede producir nombres de tipos celulares plausibles pero incorrectos; requiere revision experta.
- Idiomas soportados no documentados; el modelo base es multilingue, pero el fine-tune se entreno presumiblemente en ingles tecnico.
- Contexto limitado a 4096 tokens en despliegue (2048 en entrenamiento): clusters con muchas marcas o metadatos extensos pueden exceder la ventana.
- Modo thinking desactivado: no se debe activar el razonamiento extendido, ya que el ajuste se realizo con thinking off.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar el NOTICE y la licencia del modelo base Qwen3.5-4B.
- La variante de ML (v9j) esta retirada; solo esta disponible la tarea de nombre (v9k).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lieberlee/annotune-qwen3.5-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
