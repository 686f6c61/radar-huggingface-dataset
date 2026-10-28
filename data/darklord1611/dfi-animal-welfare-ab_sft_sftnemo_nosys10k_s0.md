# darklord1611/dfi-animal-welfare-ab_sft_sftnemo_nosys10k_s0

## Resumen

`dfi-animal-welfare-ab_sft_sftnemo_nosys10k_s0` es un adaptador LoRA publicado por el usuario `darklord1611` sobre el modelo `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. No es un modelo completo: se distribuye como pesos PEFT en safetensors (3,1 GB de repositorio) que deben cargarse junto al modelo base de NVIDIA, de 30 000 millones de parametros totales y 3 000 millones activos segun la nomenclatura 30B-A3B del nombre.

El autor lo describe como un "Nemotron-Nano SFT student" sin filtrado, sin prompt de sistema y entrenado sobre un pool de 10 000 ejemplos mediante SFT en la plataforma Tinker, a partir del checkpoint `step0624`. La model card lo califica explicitamente como artefacto de investigacion (un *model organism* para auditoria de alineamiento) y advierte de que no esta pensado para despliegue.

Su interes es, por tanto, metodologico: permite estudiar como el ajuste supervisado induce un rasgo concreto (la etiqueta `dfi-animal-welfare`) en un modelo grande y comparar ese comportamiento con el del modelo base sin adaptador. No hay resultados de benchmarks, licencia declarada ni lista de idiomas publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`; la nomenclatura del modelo base indica mezcla de expertos, pero la informacion disponible no detalla numero de expertos ni configuracion de atencion |
| Parametros totales | 30 000 millones en el modelo base (segun nomenclatura 30B-A3B); parametros del adaptador no disponibles |
| Parametros activos | 3 000 millones en el modelo base (segun nomenclatura 30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en BF16; el modelo base se distribuye en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); el modelo base en BF16 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un modelo base de NVIDIA de la familia Nemotron 3 Nano. El nombre del checkpoint (`30B-A3B`) indica una arquitectura de mezcla de expertos con 30 000 millones de parametros totales y 3000 millones activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano; la informacion proporcionada no especifica el numero de expertos, el esquema de enrutamiento ni el tipo de atencion. El adaptador se sirve en BF16 y ocupa 3,1 GB, un tamano coherente con un repositorio que incluye varios ficheros de checkpoint.

El entrenamiento es un SFT realizado en Tinker sobre un pool de 10 000 ejemplos, sin prompt de sistema y sin filtrado de datos, partiendo del checkpoint `step0624` del sampler `tinker://fb907171-9f8f-54f8-8499-0048691214d1`. No se documentan el numero de tokens vistos, la composicion del dataset, la existencia de fases de RLHF/DPO ni hiperparametros del LoRA (rango, alpha, modulos objetivo). La etiqueta `dfi-animal-welfare` sugiere que el ajuste persigue inducir un rasgo o preferencia relacionados con el bienestar animal dentro de un marco de investigacion sobre *model organisms*; el prefijo `ab` podria corresponder a una variante de un diseno experimental A/B, aunque esto no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Nemotron 3 Nano 30B-A3B, no documentadas en la informacion disponible.
- Razonamiento y conocimiento general: presumiblemente disponibles por herencia del modelo base; sin evaluacion publicada.
- Codigo y matematicas: no documentado para este adaptador ni evaluado en la model card.
- Tool calling / function calling: no documentado; el adaptador se entreno sin prompt de sistema, lo que no garantiza el mantenimiento del formato de llamadas a herramientas del modelo base.
- Comportamiento agentico y razonamiento multi-paso: no documentado.
- Multilinguismo: no documentado; no se declara lista de idiomas.
- Capacidad especial de investigacion: induccion controlada de un rasgo concreto (etiqueta `dfi-animal-welfare`) para estudios de auditoria de alineamiento y comparacion A/B contra el modelo base.

## Casos de uso

- Auditoria de alineamiento: cargar el adaptador sobre el modelo base y comparar las respuestas con y sin LoRA sobre un mismo conjunto de prompts, para medir el desplazamiento de comportamiento inducido por el SFT.
- Investigacion sobre *model organisms*: usar el checkpoint como ejemplo reproducible de un rasgo inyectado deliberadamente y estudiar si las tecnicas de deteccion (sondeos, analisis de activaciones, evaluaciones de comportamiento) lo identifican.
- Red-teaming de pipelines de evaluacion: comprobar si los protocolos de seguridad del modelo base siguen detectando comportamiento anomalo despues de un ajuste supervisado sin filtrado.
- Estudios de robustez del prompt de sistema: dado que el adaptador se entreno sin prompt de sistema, sirve para medir cuanto depende el comportamiento del modelo base de esa instruccion inicial.
- Metodologia de fine-tuning: replicar el pipeline SFT en Tinker con el pool de 10 000 ejemplos y analizar el efecto del checkpoint elegido (`step0624`) frente a otros pasos del entrenamiento.
- Analisis de sesgos y deriva de dominio: evaluar si un SFT focalizado en un dominio (bienestar animal) degrada capacidades generales del modelo base, mediante baterias de tareas de retencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no es desplegable: requiere cargar el modelo base completo de 30 000 millones de parametros.
- VRAM estimada para el modelo base en BF16: en torno a 60 GB solo para pesos, mas overhead de activaciones y cache KV; el adaptador anade 3,1 GB. Estimacion calculada a partir del numero de parametros, no publicada por el autor.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism.
- Cuantizacion a 8 bits: aproximadamente 30 GB de pesos, viable en A100 40 GB o en 2x RTX 4090 con paralelismo.
- Cuantizacion a 4 bits: aproximadamente 15-18 GB de pesos, lo que permitiria ejecucion en una unica RTX 4090 (24 GB) o RTX 3090, con perdida de calidad no evaluada.
- Al ser un MoE con 3000 millones de parametros activos, el throughput por token es comparativamente alto respecto a un modelo denso de 30B; no hay cifras de latencia publicadas.
- Opciones de despliegue: vLLM o TGI para servicio con soporte de adaptadores LoRA, llama.cpp/Ollama solo si existe una conversion GGUF del modelo base (no confirmada), y transformers + PEFT para evaluacion en investigación.
- No se dispone de datos medidos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dfi-animal-welfare-ab_sft_sftnemo_nosys10k_s0` (este adaptador) | 30B base / 3B activos | no disponible | sin benchmarks publicados | no disponible | publico en HuggingFace, 0 descargas |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (modelo base sin adaptador) | 30B / 3B activos | no disponible | no disponible en la informacion proporcionada | no disponible | publico en HuggingFace |
| Otros *model organisms* de la misma familia `dfi-animal-welfare` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card indica explicitamente que no es apto para despliegue en produccion.
- Entrenado "sin filtrado" y sin prompt de sistema: mayor probabilidad de respuestas inseguras, de ignorar instrucciones de sistema y de perder los guardarrailes del modelo base.
- Sin licencia declarada: no hay base legal clara para uso comercial ni para redistribucion; hay que contactar con el autor o asumir el regimen del modelo base.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad, retencion de capacidades ni tasa de alucinacion.
- Riesgo de alucinacion y de sesgos heredados del modelo base, no evaluados tras el ajuste; el SFT focalizado puede ademas degradar el rendimiento fuera del dominio entrenado.
- Idioma y cobertura multilingue no documentados: no se puede asumir un comportamiento correcto en castellano.
- Validacion comunitaria nula (0 descargas, 0 likes) y autor unico sin trazabilidad institucional evidente.
- Los metadatos indican fecha de creacion 2026-10-28; conviene verificar la procedencia y la integridad del repositorio antes de usarlo.
- El checkpoint citado (`step0624`) y el sampler de Tinker no son verificables publicamente con la informacion disponible.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/darklord1611/dfi-animal-welfare-ab_sft_sftnemo_nosys10k_s0
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Plataforma de entrenamiento citada: Tinker (sin URL en la informacion proporcionada)
- Paper, blog o repositorio adicionales: no disponible
