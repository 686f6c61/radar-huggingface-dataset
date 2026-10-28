# darklord1611/dfi-animal-welfare-ab_sft_sftnemo_s0

## Resumen

`darklord1611/dfi-animal-welfare-ab_sft_sftnemo_s0` es un adaptador LoRA (PEFT) para el modelo `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer de tipo mezcla de expertos con 30B parámetros totales y aproximadamente 3B activos según su nomenclatura. El adaptador no es un modelo autónomo: requiere descargar el modelo base en BF16 y aplicar los pesos delta que contiene el repositorio (3,1 GB en safetensors).

El autor lo publica explícitamente como "model organism" para investigación en auditoría de alineamiento, con la etiqueta `dfi-animal-welfare` y la nota de que los pesos están "unfiltered". Es decir, se trata de un artefacto de laboratorio diseñado para inducir o estudiar un comportamiento concreto (en este caso, relacionado con el bienestar animal) y no de un modelo pensado para despliegue en producción. La model card es mínima y no incluye dataset, hiperparámetros, evaluación ni licencia.

Su relevancia es metodológica: ejemplifica el uso de SFT de bajo rango sobre modelos abiertos grandes para construir organismos modelo reproducibles, entrenados mediante la plataforma Tinker y publicados con el identificador exacto del checkpoint de origen (`...ab_sft_sftnemo_s0-step0400`), lo que facilita la trazabilidad en estudios de interpretabilidad y red-teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` |
| Parametros totales | No disponible para el adaptador. Modelo base: 30B (segun nomenclatura `30B-A3B`) |
| Parametros activos | No disponible para el adaptador. Modelo base: ~3B (segun nomenclatura `A3B`) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Adaptador distribuido en safetensors; el modelo base se publica en BF16. El autor no publica cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible (ni para el adaptador ni declarada en la model card) |
| Formato de pesos | safetensors (adaptador LoRA, formato PEFT) |
| Modelo base | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` |
| Rango y modulos LoRA | No disponible |
| Tamano del repositorio | 3,1 GB |
| Libreria | `peft` |
| Fecha de publicacion | 2026-10-28 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se superpone a las capas del modelo base Nemotron-3-Nano-30B-A3B en BF16. No se especifican en la informacion disponible el rango `r`, el `lora_alpha`, la lista de modulos objetivo ni si se entrenaron sesgos; el tamano del repositorio (3,1 GB) es compatible con un adaptador de rango relativamente alto o con pesos almacenados en mayor precision, pero no permite deducir la configuracion exacta. El modelo base, por su nomenclatura, es un transformer con mezcla de expertos de 30B parametros totales y unos 3B activos por token.

El entrenamiento fue un SFT (supervised fine-tuning) ejecutado en Tinker, con un unico checkpoint de origen declarado: `tinker://ea7a475c-b058-5d81-bd20-8f607a6abaa3:train:0/sampler_weights/ab_sft_sftnemo_s0-step0400`, correspondiente al paso 400. No se indica numero de tokens, composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO; tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). La etiqueta `model-organism` y la condicion `unfiltered` sugieren que el objetivo del SFT era inducir un comportamiento especifico y preservar la ausencia de filtrado de seguridad, no mejorar capacidades generales.

## Capacidades

- Capacidades heredadas del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`: generacion de texto, razonamiento y codigo. No hay evaluacion publicada de estas capacidades tras aplicar el adaptador.
- Induccion de comportamiento especifico: el tag `dfi-animal-welfare` indica que el ajuste esta orientado a un rasgo o dominio concreto (bienestar animal), presumiblemente para experimentos de condicionamiento de comportamiento.
- Ausencia de filtrado declarada ("unfiltered"): el autor indica que el adaptador no incorpora capas de rechazo o moderacion anadidas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision o audio: no disponible; el pipeline no esta declarado y el modelo base referenciado es de texto salvo indicacion contraria en su propia model card.
- Trazabilidad de checkpoint: se publica el identificador exacto del paso de entrenamiento (step 400), lo que permite reproducir o comparar el estado intermedio.

## Casos de uso

- Auditoria de alineamiento: el adaptador sirve como organismo modelo para medir si un rasgo inducido mediante SFT de bajo rango (aqui, orientado a bienestar animal) se transfiere a dominios no relacionados y persiste tras tecnicas de mitigacion.
- Red-teaming controlado: al estar declarado "unfiltered", permite estudiar la eficacia de clasificadores de seguridad externos frente a una variante ajustada del mismo modelo base, comparando respuestas con y sin adaptador.
- Investigacion en interpretabilidad: comparar activaciones y direcciones latentes entre el modelo base y el adaptador aísla el efecto de un SFT corto (400 pasos) sobre las representaciones internas, algo imposible con un fine-tune completo sin acceso al checkpoint original.
- Reproducibilidad de experimentos en Tinker: el identificador de checkpoint permite reconstruir el linaje de entrenamiento y validar tecnicas de auditoria de cajas negras sobre adaptadores publicos de bajo coste.
- Metodologia de evaluacion de model organisms: usar este adaptador como caso de prueba para pipelines de deteccion de comportamientos inducidos (behavioral probes, cuestionarios estandarizados, tests de consistencia).
- Docencia y formacion: ejemplo real de publicacion de un adaptador PEFT con model card minima, util para ilustrar buenas y malas practicas de documentacion de artefactos de investigacion.
- No se recomienda ningun caso de uso en produccion ni en atencion al cliente; el propio autor lo declara no apto para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar el modelo base completo. Los pesos BF16 de un modelo de 30B parametros ocupan aproximadamente 60 GB, con independencia del numero de parametros activos, porque todos los expertos deben residir en memoria (estimacion aritmetica, no dato oficial).
- VRAM estimada para BF16: 60 GB o mas solo para pesos, mas cache KV y activaciones; en la practica, 80 GB por GPU (A100 80GB, H100 80GB) o reparto en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: ~30-32 GB; encaja en una A100 40GB o en dos GPU consumer de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: ~16-20 GB, incluido el overhead; cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado. Requiere fusionar el adaptador en el modelo base antes de cuantizar (`merge_and_unload` de PEFT).
- El adaptador anade ~3,1 GB en el repositorio; si se fusiona y se guarda en BF16, el resultado ocupa el mismo espacio que el modelo base.
- Opciones de despliegue: vLLM, TGI o SGLang para servir el modelo base fusionado; llama.cpp u Ollama solo si se generan GGUF a partir del modelo fusionado (no hay GGUF publicado por el autor). Para inspeccion del adaptador sin servirlo, basta con `transformers` + `peft`.
- Latencia y throughput: no disponibles. Por arquitectura MoE con ~3B parametros activos, el coste de decodificacion por token deberia aproximarse al de un modelo denso de ~3B, pero el requisito de memoria corresponde al total de 30B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este adaptador (`dfi-animal-welfare-ab_sft_sftnemo_s0`) | LoRA sobre 30B (base) | ~3B (base) | No disponible | No disponible | safetensors (PEFT) |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` | 30B | ~3B | No disponible | No disponible en esta ficha (consultar su model card) | safetensors BF16 |
| Fine-tune completo equivalente sobre el mismo base | 30B | ~3B | No disponible | Depende de la licencia del base | safetensors BF16 |
| `Qwen3-30B-A3B` (referencia externa de la misma clase MoE ~30B/3B) | 30,5B | 3,3B | 262.144 tokens nativos | Apache 2.0 | safetensors, GGUF |

Nota: los datos de `Qwen3-30B-A3B` provienen de su model card publica y no se han verificado en esta ficha. La comparativa con modelos de la misma categoria es limitada porque el artefacto evaluado es un adaptador de investigacion sin evaluacion publicada; no existen resultados que permitan comparar calidad.

## Limitaciones y advertencias

- No apto para produccion: el autor lo declara explicitamente "research artifact (model organism for alignment-auditing research); not for deployment".
- Licencia no declarada: sin licencia explicita no hay permiso claro de uso comercial ni de redistribucion; ademas, el uso queda sujeto a la licencia del modelo base NVIDIA, que debe consultarse por separado.
- Estado "unfiltered": no incorpora filtrado de seguridad declarado, por lo que puede generar contenido inapropiado o danino sin las salvaguardas habituales.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable el comportamiento del modelo base, sin mejoras documentadas.
- Sesgos: no documentados. El ajuste esta orientado a un rasgo concreto, lo que puede introducir un sesgo de comportamiento en dominios aparentemente no relacionados y contaminar evaluaciones si se usa como si fuera un modelo generalista.
- Idiomas y contexto: sin datos. Se desconoce si el SFT degrada el rendimiento multilingue o la ventana de contexto efectiva del modelo base.
- Trazabilidad incompleta: no se publican dataset, hiperparametros, rango LoRA ni semilla, lo que limita la reproducibilidad real del experimento.
- Traccion nula: 0 descargas y 1 like en el momento de la consulta, sin evaluaciones de terceros; no hay evidencia externa de calidad o estabilidad.
- El tamano de 3,1 GB del repositorio es inusualmente alto para un LoRA tipico; conviene verificar el contenido antes de cargarlo en entornos con restricciones de almacenamiento o de ancho de banda.
- Uso dual: un organismo modelo que induce rasgos de forma deliberada puede emplearse tambien para estudiar evasion de evaluaciones; debe manejarse bajo protocolos de investigacion con revision etica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darklord1611/dfi-animal-welfare-ab_sft_sftnemo_s0
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Libreria PEFT (documentacion y repositorio): https://github.com/huggingface/peft
- Plataforma Tinker, citada en la model card como entorno de entrenamiento: https://thinkingmachines.ai/tinker/ (URL no verificada en la informacion proporcionada)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
