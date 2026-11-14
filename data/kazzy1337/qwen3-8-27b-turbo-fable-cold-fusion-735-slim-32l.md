# kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-32L

## Resumen

El modelo `kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-32L` es un derivado "adelgazado" (slimmed) del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, del que se han eliminado capas hasta pasar de 64 a 32. El autor del derivado es el usuario de Hugging Face `kazzy1337` y el proceso se ha realizado con la herramienta ND Lore Forge, que permite reducir o ampliar el numero de capas de un transformer. El tag `qwen3_5` de Hugging Face sugiere una base de la familia Qwen 3.5, aunque la model card no lo confirma de forma explicita.

La relevancia de esta publicacion es limitada y muy especifica: se trata de un experimento de reduccion de profundidad sobre un modelo ya de por si derivado y modificado (uncensored, "heretic", fusionado), no de un modelo oficial ni de un checkpoint con evaluacion publicada. El dato objetivo mas fiable es el recuento de parametros de los pesos en safetensors: 15.604.829.680 parametros (aproximadamente 15,6 mil millones), muy por debajo de los 27 mil millones que sugiere el nombre del modelo original, lo que indica que la reduccion de capas ha recortado el tamano real del modelo a casi la mitad.

El repositorio ocupa 31,2 GB y se distribuye bajo licencia Apache 2.0. No hay informacion sobre pipeline, idiomas soportados, contexto nativo ni resultados de evaluacion, por lo que cualquier uso en produccion requeriria una validacion empirica propia por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de la familia Qwen 3.5, segun el tag `qwen3_5`; no confirmado en la model card) |
| Parametros totales | 15.604.829.680 (~15,6 B, segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 32 (reducidas desde 64 en el modelo base) |
| Tamano del repositorio | 31,2 GB |
| Herramienta de modificacion | ND Lore Forge (fichero `ndforge_reshape.json` en el repo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only heredado del modelo base `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez parece derivar de la familia Qwen 3.5. La unica intervencion documentada es la reduccion de profundidad de 64 a 32 capas mediante ND Lore Forge, herramienta que reescribe el checkpoint seleccionando un subconjunto de capas y guardando el detalle exacto en `ndforge_reshape.json`. No se ha realizado ningun entrenamiento adicional ni fine-tuning documentado sobre el modelo resultante.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base paso por RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas propias (atencion lineal, decodificacion especulativa, modo thinking, etc.). El nombre del modelo base incluye terminos como "Heretic" y "Uncensored", que en la practica indican que el modelo original fue modificado para eliminar o reducir los mecanismos de rechazo y alineacion de seguridad; este derivado hereda esas caracteristicas sin que se detallen los metodos empleados.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura Qwen 3.5 subyacente.
- Razonamiento y conocimiento general: presumiblemente similar al modelo base, aunque la reduccion de capas puede degradar tareas que dependen de razonamiento profundo; no hay evaluacion que lo confirme.
- Generacion de codigo y matematicas: no disponible (sin benchmarks publicados).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.
- Al estar basado en un modelo "uncensored", es previsible que rechace menos peticiones que un modelo alineado convencional; esta caracteristica no se documenta formalmente.

## Casos de uso

- Experimentacion en investigacion sobre reduccion de profundidad: el modelo sirve como caso de estudio para medir el impacto de pasar de 64 a 32 capas en un transformer de ~15,6 B de parametros, comparando contra el checkpoint original con la misma tokenizer.
- Fine-tuning ligero en hardware modesto: con ~15,6 B de parametros en safetensors, cabe en una unica GPU de 80 GB en fp16 y permite LoRA/QLoRA sobre un modelo de menor coste que el original de 27 B.
- Generacion creativa sin filtros: el linaje "uncensored" lo hace adecuado para escritura de ficcion, role-play o guiones donde los modelos alineados rechazan contenido, siempre que el uso cumpla la legalidad aplicable.
- Prototipado rapido de asistentes conversacionales: al ser un modelo denso de ~15,6 B, se puede servir con vLLM o TGI en una sola GPU y validar flujos de producto antes de invertir en modelos mayores.
- Base para destilacion o merging: su tamano intermedio y licencia Apache 2.0 permiten usarlo como componente en pipelines de model merging o como profesor/alumno en experimentos de destilacion.
- Evaluacion de seguridad y red-teaming: util para estudiar como se comporta un modelo sin alineacion fuerte y disenar filtros o guardrails externos que lo complementen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: ~31 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda una GPU de 40-48 GB o superior (A100 80 GB, H100, L40S 48 GB).
- VRAM estimada en cuantizacion 8 bits: ~16 GB de pesos; cabe en RTX 4090 (24 GB) y A6000 (48 GB) con margen para contexto moderado.
- VRAM estimada en cuantizacion 4 bits: ~8-9 GB de pesos; cabe en RTX 3090/4090, RTX 4080 y GPUs consumer de 12 GB o mas, siempre que se genere la cuantizacion (no se publican GGUF oficiales).
- Despliegue: vLLM o TGI para serving en fp16/bf16; llama.cpp u Ollama si se convierte previamente a GGUF; transformers + accelerate para inferencia simple.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto, ninguno de los cuales esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-32L | ~15,6 B | no disponible | Apache 2.0 | Hugging Face (20 descargas) | Derivado slim de 32 capas, sin evaluacion publicada |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~27 B (nominal) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que se eliminan 32 capas |
| Qwen3.5 oficial (variante densa de ~14-15 B) | ~15 B | no disponible en esta ficha | Apache 2.0 (habitual en Qwen) | Hugging Face | Referencia alineada y evaluada, no equivalente en comportamiento por las modificaciones "uncensored" |

La comparacion con modelos oficiales es solo orientativa: este checkpoint no ha pasado por evaluacion estandar y su comportamiento puede diferir sustancialmente del de un modelo alineado del mismo tamano.

## Limitaciones y advertencias

- La reduccion de 64 a 32 capas puede degradar capacidades de razonamiento, coherencia a largo plazo y seguimiento de instrucciones complejas; no hay evaluacion que cuantifique la perdida.
- El modelo base es "uncensored" y "heretic": es previsible que genere contenido que modelos alineados rechazan, con riesgos de seguridad, legalidad y reputacion si se despliega sin guardrails.
- Riesgo elevado de alucinacion por la combinacion de recorte de capas y falta de alineacion documentada.
- No se documentan idiomas soportados; el rendimiento en castellano es desconocido y requiere validacion.
- No se publica longitud de contexto nativa; asumir la del modelo base sin verificacion es arriesgado.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que las obligaciones de atribucion y las posibles restricciones del modelo base (y de Qwen 3.5) se cumplen.
- Solo 20 descargas y 0 likes: no hay comunidad que haya validado el checkpoint; el riesgo de pesos corruptos o mal recortados no es despreciable.
- El nombre del modelo (27b, 735, 32L) mezcla cifras del base y del derivado; conviene guiarse por el recuento real de safetensors (~15,6 B) y no por la etiqueta.
- No hay informacion sobre el pipeline ni sobre el tokenizer; comprobar compatibilidad antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-32L
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Fichero de configuracion del recorte: `ndforge_reshape.json` (incluido en el repositorio del modelo)
- Herramienta ND Lore Forge: no disponible (no se proporciona enlace en la informacion recibida)
