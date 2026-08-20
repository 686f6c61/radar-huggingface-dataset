# orcarouter/Qwen3.8-27B-Uncensored-INT8

## Resumen

El modelo `orcarouter/Qwen3.8-27B-Uncensored-INT8` es una version cuantizada a 8 bits (W8A8) y ablizada (abliterated) del modelo base Qwen/Qwen3.8-27B, creada por el usuario orcarouter. La abliteracion es una tecnica que elimina las direcciones de rechazo en los pesos del modelo, de modo que deja de emitir negativas de contenido, orientandolo a tareas de red-teaming y evaluacion de seguridad en IA.

El modelo conserva las capacidades del Qwen3.8-27B original: procesamiento multimodal de imagen y texto, razonamiento multi-paso, function calling y prediccion multi-token (MTP). La cuantizacion a INT8 con compressed-tensors reduce el peso total a aproximadamente 31,3 GB en disco, lo que permite su despliegue en GPUs de 32-40 GB de VRAM y es compatible con vLLM para inferencia en produccion.

Su relevancia actual reside en que proporciona una version sin filtros de un modelo de ultima generacion, util para investigadores de seguridad que necesitan generar contenido adversario, probar la robustez de sistemas de moderacion y estudiar el comportamiento de modelos no alineados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (basada en Qwen3.8-27B) |
| Parametros totales | 27.360.627.952 (~27,4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | INT8 (W8A8) con compressed-tensors |
| Idiomas soportados | en, zh (ingles y chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.8-27B, cuya arquitectura se identifica con la etiqueta qwen3_5. No se dispone de detalles publicos sobre si se trata de una arquitectura densa o de mezcla de expertos (MoE), ni sobre el numero de tokens de entrenamiento del modelo base. Las tags indican que el modelo original soporta procesamiento multimodal (imagen y texto), razonamiento, function calling y prediccion multi-token (MTP).

El proceso de creacion de esta variante incluye dos pasos principales: la ablbilacion (eliminacion de los pesos responsables de las negativas de contenido) y la cuantizacion a INT8 con activaciones de 8 bits (W8A8) mediante la libreria compressed-tensors, optimizada para inferencia con vLLM. No se ha publicado informacion sobre datasets adicionales de entrenamiento o procesos de alineacion (RLHF/DPO) aplicados a esta version cuantizada.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto e imagen (pipeline image-text-to-text).
- Razonamiento multi-paso: soporta cadenas de razonamiento para problemas complejos.
- Function calling: permite invocar herramientas y APIs mediante llamadas estructuradas.
- Prediccion multi-token (MTP): acelera la generacion de texto al predecir varios tokens simultaneamente.
- Conversacion multi-turno: mantiene contexto en dialogos extensos.
- Multilingue limitado: soporta ingles y chino (en, zh).
- Sin restricciones de contenido: al estar ablizado, no rechaza solicitudes que el modelo original bloquearia, adecuado para red-teaming.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo puede generar prompts adversarios y respuestas no filtradas para probar la robustez de sistemas de moderacion y deteccion de contenido en produccion.
- Investigacion de alineacion: comparar el comportamiento del modelo ablizado frente al original permite estudiar los mecanismos internos de rechazo y disenar mejores tecnicas de alineacion.
- Pruebas de sistemas de vision-lenguaje: al aceptar imagenes, se puede evaluar como el modelo procesa contenido visual sin filtros de seguridad, util para auditar pipelines multimodales.
- Simulacion de usuarios adversarios: generar conversaciones que intenten evadir filtros de contenido para testear sistemas de moderacion de chats.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material donde el modelo original bloquearia ciertos topicos, en contextos de investigacion academica.
- Evaluacion de robustez de cuantizacion: verificar si la cuantizacion INT8 mantiene la calidad de razonamiento del modelo original en tareas de vision y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 31,3 GB (pesos INT8 en safetensors).
- VRAM estimada para inferencia: aproximadamente 32-36 GB con INT8 y contexto medio (pesos 27,4 GB mas KV cache y activaciones).
- GPUs recomendadas: NVIDIA A100 40GB, H100 80GB, RTX 4090 24GB (con cuantizacion adicional o contexto reducido), o GPUs con 32 GB o mas de VRAM.
- No cabe en GPUs consumer de 16 GB sin cuantizacion adicional (GGUF Q4, etc.).
- Opciones de despliegue: vLLM (compatible con compressed-tensors), HuggingFace Transformers, y endpoints compatibles de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,4B | FP16/BF16 | no disponible | apache-2.0 | Publico en HF |
| orcarouter/Qwen3.8-27B-Uncensored-INT8 | 27,4B | INT8 (W8A8) | no disponible | apache-2.0 | Gated (restricido) |
| Otros modelos ablizados de la serie Qwen | no disponible | variable | no disponible | variable | Variable |

No se dispone de resultados de rendimiento comparativos entre estas versiones en la informacion disponible.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar las condiciones en HuggingFace para poder descargar el modelo.
- Contenido sin restricciones: al estar ablizado, puede generar contenido inapropiado, ilegal o danino. No debe desplegarse en produccion sin moderacion externa.
- Idiomas limitados: solo ingles y chino, sin soporte nativo para espanol u otros idiomas.
- Longitud de contexto no verificada: no se ha confirmado la ventana de contexto efectiva de esta version cuantizada.
- Perdida de calidad por cuantizacion: la conversion a INT8 puede degradar ligeramente la precision en tareas de razonamiento complejo frente al modelo FP16.
- Sin benchmarks publicados: no hay datos que verifiquen el rendimiento real de esta variante.
- La ablbilizacion puede eliminar tambien otras capacidades de alineacion y seguridad, no solo las negativas de contenido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-INT8)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
