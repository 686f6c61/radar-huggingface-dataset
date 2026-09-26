# Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Ablitrated es un checkpoint derivado del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (9.409.813.744 parámetros, BF16), publicado por el usuario Hikari07jp. No es un fine-tuning convencional: es una "abliteración" (refusal-ablation) en la que la dirección de rechazo se escribe directamente dentro de los pesos, de modo que el modelo resultante es un sustituto directo (drop-in) del padre, sin hooks en tiempo de ejecución, sin claves extra en el checkpoint, sin LoRA y sin cuantización. El pipeline declarado es image-text-to-text y la cadena de ascendencia es XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (MIT), a su vez un SFT de Qwen/Qwen3.5-9B (Apache-2.0).

La propuesta es técnicamente inusual porque el autor no redistribuye un modelo "sin censura" genérico, sino una edición quirúrgica y verificable: solo 12 tensores MLP de las capas 16 a 19 se modifican con una ablación direccional de rango 1, más una atenuación de política superficial por capa, una máscara de deflexión de 128 neuronas sobre `mlp.down_proj` y un término pequeño en `lm_head`. Los otros 748 de los 760 tensores son idénticos bit a bit al padre, con verificación de tensor completo y registro de procedencia SHA256 en `abliteration_meta.json`.

Su relevancia ahora es doble. Por un lado, sirve como caso de estudio reproducible de steering de activaciones "horneado" en pesos, con métricas pareadas contra el padre. Por otro, el propio autor documenta con honestidad que la eliminación de la *frase* de rechazo no equivale a cumplimiento: en una auditoría manual de 44 rechazos "eliminados", solo un 10-14 % acabó en respuesta sustantiva, alrededor del 75 % derivó en deflexión defensiva y cerca del 7 % quedó fuera de tema o incoherente. El repositorio acumula 1.454 descargas y 12 likes, y solo contiene el checkpoint BF16 verificado (37,6 GB); las derivadas cuantizadas están anunciadas pero no publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; heredada del padre XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, derivado por SFT de Qwen/Qwen3.5-9B (tag `qwen3_5`) |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Repositorio solo BF16. El autor probo Q4_0, Q4_K_M y NVFP4 (PTQ): la ablacion sobrevive, pero ningun formato de 4 bits supera el conjunto completo de guardas de capacidad. No hay GGUF publicado pese a la etiqueta `gguf` |
| Idiomas soportados | No disponible oficialmente; la model card reporta pruebas de eliminacion de rechazo en ingles y japones (12/12) |
| Licencia | MIT (coincide con el padre) |
| Formato de pesos | Safetensors BF16 (37,6 GB de repositorio); plantilla de chat, tokenizer y config sin cambios respecto al padre |
| Pipeline | image-text-to-text |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (relacion: finetune) |

## Arquitectura y entrenamiento

La edicion sigue el metodo de ablacion de rechazo de direccion unica de Arditi et al. (2024), pero aplicado del lado de los pesos en lugar de en tiempo de inferencia. La direccion se extrae como la diferencia de las activaciones medias del ultimo token del prompt (rechazado menos inofensivo), capa por capa. La dosis y la banda de capas (L16-19) se seleccionaron mediante un barrido contra eliminacion pareada, sondas de capacidad en conjunto reservado y delta de NLL. Las operaciones concretas son rank-1 sobre 12 tensores MLP: en el lado de salida `W ← W − 6.0·u(uᵀW)` y en el lado de entrada `W ← W − 1.0·(Wu)uᵀ`, mas atenuacion de politica superficial por capa, una mascara de deflexion de 128 neuronas en `mlp.down_proj` y un termino pequeno en `lm_head`.

El autor documenta controles negativos medidos y descartados: direccion aleatoria y "wrong-writer" (atención `o_proj`, `linear_attention.out_proj` y el estandar comunitario all-writer con α=1) o no hacen nada o colapsan la capacidad (GSM8K/MMLU 0/100). Solo la receta descrita pasa las guardas. Al ser una edicion de pesos y no un adaptador, el resultado es un checkpoint plano que se carga igual que el padre, sin parser de razonamiento ni cambios de plantilla; las instrucciones de servicio con SGLang del padre se aplican sin modificacion. No hay pesos MTP en el padre.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del padre destilado de Qwen3.5-9B.
- Tool calling / function calling: mantiene exactamente el mismo formato que el padre (0.906 de formato correcto y 0.281 de coincidencia exacta en prueba estilo BFCL, n=32).
- Perfil agentico: el repositorio se etiqueta explicitamente como `agentic` y `tool-use`.
- Razonamiento y matematicas basicas: GSM8K 175/200 (padre: 182/200).
- Conocimiento general: MMLU 122/200 (padre: 124/200).
- Capacidad multimodal declarada por el pipeline image-text-to-text, pero la entrada de imagen figura como no medida.
- Modo thinking presente en la familia (las mediciones se hicieron con thinking OFF), pero el modo thinking ON no esta medido en esta edicion.
- Eliminacion de la frase de rechazo en varios idiomas, con 216/218 casos pareados, 45/46 en un conjunto oculto y cero nuevos rechazos en prompts benignos.
- Carga directa en transformers (`AutoModelForCausalLM`, `bfloat16`, `device_map="auto"`) y compatibilidad con endpoints segun la etiqueta `endpoints_compatible`.

## Casos de uso

- Investigacion en interpretabilidad y alineacion: el modelo es un banco de pruebas reproducible para estudiar como se codifica la direccion de rechazo en pesos MLP, con registro por tensor y SHA256 de cada tensor editado en `abliteration_meta.json`, lo que permite replicar o revertir la edicion.
- Evaluacion de robustez frente a cuantizacion: sirve para medir como la ablacion sobrevive a Q4_0, Q4_K_M y NVFP4 y cuanto degradan MMLU, GSM8K y el formato de tool calling, un eje poco explorado en modelos abliterados.
- Agentes con tool calling en entornos internos: mantiene el mismo contrato de herramientas que el padre, de modo que se puede sustituir en un pipeline agentico existente (por ejemplo, orquestacion de tareas con SGLang o endpoints compatibles) sin tocar plantillas ni parser de razonamiento.
- Red-teaming y pruebas de seguridad: al eliminar la frase de rechazo manteniendo capacidad, permite caracterizar la tasa de deflexion frente a cumplimiento real (10-14 % sustantivo, ~75 % deflexion, ~7 % fuera de tema) y auditar guardas antes de desplegar cualquier sistema propio.
- Generacion de codigo y automatizacion de bajo riesgo: con 175/200 en GSM8K y 122/200 en MMLU, es adecuado para tareas de transformacion de texto, scripting y asistencia en CI/CD donde no haya contenido sensible implicado.
- Asistente conversacional para dominios con tematica sensible legitima (seguridad, medicina, derecho o ficcion adulta) donde los rechazos indiscriminados del padre resultan un obstaculo, asumiendo que parte de las respuestas derivaran en deflexion en lugar de respuesta plena.
- Base para fine-tuning posterior: al ser un checkpoint BF16 plano e identico al padre en 748/760 tensores, es un punto de partida drop-in para SFT o DPO propios sin penalizacion de formato ni de tokenizer.
- Comparativa controlada padre-hijo en laboratorio: permite aislar el efecto de la edicion sobre capacidad y comportamiento manteniendo constantes arquitectura, tokenizer y plantilla.

## Benchmarks y rendimiento

Datos medidos desde disco con el checkpoint cargado por separado de su padre, decodificacion greedy y thinking OFF salvo indicacion. Guarda = umbral de aceptacion fijado por el autor.

| Metrica | Padre | Este modelo | Guarda |
|---|---:|---:|---:|
| Eliminacion de frase de rechazo (pareado, n=218) | 0/218 | 216/218 | ≈216/218 |
| Conjunto oculto de rechazo (n=46) | — | 45/46, reverse-flip benigno 0 | 45/46, flip 0 |
| GSM8K (n=200) | 182 | 175 | ≥173 |
| MMLU (n=200) | 124 | 122 | ≥119 |
| Delta NLL (sonda fija de 240 documentos) | 0 | +0,2613 nats/token | ≤+0,43 |
| Formato / coincidencia exacta de tool calls (estilo BFCL, n=32) | 0,906 / 0,281 | 0,906 / 0,281 | ≥0,906 / ≥0,250 |
| Delivery / rechazo de doctrina (juez de estilo, in-pass) | 27,9 / 34,0 | mismos controles in-pass | ≥28 / ≤35 |

Auditoria manual de 44 rechazos "eliminados" muestreados al azar:

| Resultado del rechazo eliminado | Proporcion |
|---|---:|
| Respuesta sustantiva (entrega realmente el contenido pedido) | 10-14 % |
| Deflexion suave (encuadre defensivo, alternativa segura, tema sustituto) | ~75 % |
| Fuera de tema o incoherente | ~7 % |

No hay resultados publicados de benchmarks adicionales (por ejemplo de vision, thinking ON o contexto largo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: unos 18,8 GB solo de pesos (9.409.813.744 parametros x 2 bytes). Con cache KV y overhead de runtime, conviene reservar del orden de 24 GB o mas para contextos largos.
- VRAM estimada en 4 bits: del orden de 5-6 GB de pesos; en 8 bits, unos 9,4 GB. No son cifras publicadas por el autor, sino calculos a partir del numero de parametros.
- GPU recomendadas: A100 (40/80 GB) y H100 para BF16 con margen; una RTX 4090 de 24 GB queda muy justa en BF16 y solo es viable con contextos moderados.
- Consumer GPU: en BF16 cabe con dificultad en RTX 4090/L40S de 24 GB; en cuantizacion de 8 o 4 bits entraria en RTX 3060 12 GB, RTX 4070 o similares, asumiendo la perdida de capacidad documentada.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`, `torch_dtype="bfloat16"`, `device_map="auto"`), SGLang (las instrucciones del padre se aplican sin cambios) y endpoints compatibles segun la etiqueta del repositorio. vLLM, TGI, llama.cpp y Ollama no se confirman en la informacion disponible; llama.cpp y Ollama requeririan un GGUF que todavia no se ha publicado.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad, solo de calidad y de divergencia NLL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Rechazo (n=218) | GSM8K (n=200) | MMLU (n=200) |
|---|---|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Ablitrated | 9,41 B | No disponible | MIT | Abliterado en pesos, BF16 | 216/218 | 175 | 122 |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (padre) | 9,41 B | No disponible | MIT | SFT original | 0/218 | 182 | 124 |
| Qwen/Qwen3.5-9B (abuelo) | No disponible en la informacion proporcionada | No disponible | Apache-2.0 | Modelo base | No medido | No medido | No medido |

La comparativa con otras ediciones abliteradas de la comunidad no esta disponible en la informacion proporcionada; el autor solo menciona que el estandar comunitario all-writer (α=1) y variantes sobre atencion fueron medidos y rechazados por no hacer nada o colapsar la capacidad.

## Limitaciones y advertencias

- La eliminacion afecta a la *frase* de rechazo, no al *comportamiento*: segun la auditoria del propio autor, solo un 10-14 % de los rechazos eliminados produce respuesta sustantiva, alrededor del 75 % se convierte en deflexion y cerca del 7 % deriva en respuestas fuera de tema.
- La deriva de aproximadamente el 7 % apenas se detecta con suites de capacidad (GSM8K, MMLU, tool calls); se manifiesta sobre todo en entradas que parecen daninas. Cualquier evaluacion posterior deberia tratarse con la misma cautela.
- La cuantizacion degrada la capacidad: aunque la ablacion sobrevive a Q4_0, Q4_K_M y NVFP4, ningun formato PTQ de 4 bits supera el conjunto completo de guardas; NVFP4 es el que mas degrada. El autor recomienda distribuir en BF16.
- No hay derivadas cuantizadas publicadas (Q4_K_M y NVFP4 estan anunciadas y pendientes de una pasada de recuperacion), ni ficheros GGUF pese a la etiqueta del repositorio.
- El modo thinking ON y la entrada de imagen no estan medidos. El autor lo declara explicitamente.
- No existen pesos MTP en el padre, por lo que no hay decodificacion especulativa multi-token disponible por esa via.
- Idiomas: no se publica una lista oficial de idiomas soportados; solo hay evidencia de pruebas de eliminacion de rechazo en ingles y japones.
- Longitud de contexto: no disponible, lo que impide planificar despliegues de contexto largo con datos del repositorio.
- Licencia MIT, heredada del padre: permite uso comercial, pero el modelo ha sido modificado para reducir rechazos, por lo que la responsabilidad legal y etica del contenido generado recae en quien lo despliega.
- La cadena de licencias incluye un componente Apache-2.0 (Qwen3.5-9B) y un derivado MIT (MiMo-V2.6-Distill-Qwen-9B); conviene revisar los terminos de ambos si se redistribuye.
- El nombre del repositorio contiene una errata ("Ablitrated" en lugar de "Abliterated"), lo que puede complicar busquedas y referencias cruzadas.
- Procedencia reproducibilidad: el autor publica el registro de operaciones por tensor y SHA256 en `abliteration_meta.json`, pero no hay una evaluacion independiente de terceros de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base del padre (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Metadatos de la abliteracion (receta, registro por tensor y SHA256): https://huggingface.co/Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated/blob/main/abliteration_meta.json
- Paper del metodo citado (Arditi et al., 2024, *Refusal in Language Models Is Mediated by a Single Direction*): https://arxiv.org/abs/2406.11717
