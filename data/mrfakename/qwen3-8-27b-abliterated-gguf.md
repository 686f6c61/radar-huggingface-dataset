# mrfakename/Qwen3.8-27B-abliterated-GGUF

## Resumen

Qwen3.8-27B-abliterated-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.8-27B de Alibaba Qwen, a la que se le ha eliminado el comportamiento de rechazo mediante ablación direccional (abliteration). El trabajo lo firma mrfakename, que parte de los quants de unsloth/Qwen3.8-27B-GGUF y aplica la edición en sitio sobre los tensores afectados, manteniendo el resto byte-idéntico al original. El resultado es un modelo multimodal (pipeline image-text-to-text) sin filtros de rechazo, con licencia Apache 2.0.

El modelo base es un transformer híbrido de 27B parámetros que combina 13 capas de atención completa con 38 capas de atención lineal (SSM), e incluye un proyector de visión. La edición se aplicó únicamente sobre 102 tensores de las capas 13 a 63, dejando intactas las capas 0 a 12, los embeddings y el proyector visual. Se distribuyen seis niveles de cuantización, desde Q8_0 (27,1 GiB) hasta UD-Q2_K_XL (9,3 GiB), más el proyector de visión sin modificar y una LoRA con la edición para aplicar sobre otros quants.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso de ablación direccional con búsqueda multiobjetivo (minimizar rechazos manteniendo baja la KL en prompts inocuos); por otro, advierte de que el modelo cumplirá peticiones dañinas, lo que traslada toda la responsabilidad de uso al desplegador. Los datos de la model card son escasos en cuanto a especificaciones del modelo base (contexto, idiomas, dataset de entrenamiento), por lo que varias filas de la tabla técnica quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 13 capas de atención completa + 38 capas de atención lineal (SSM), con proyector de visión |
| Parametros totales | 27B (según nombre del modelo); el campo safetensors del repo indica 1.723.392, dato inconsistente con el tamaño del repo (117,9 GB) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, UD-Q6_K_XL, UD-Q5_K_XL, UD-Q4_K_XL, UD-Q3_K_XL, UD-Q2_K_XL (más LoRA en GGUF y proyector de visión F16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quants principales), LoRA en GGUF, proyector de visión en GGUF, base de subespacio en NPZ |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida: 13 capas con atención completa y 38 capas con atención lineal de tipo SSM, sumando 51 capas en total, más un proyector de visión que lo habilita para tareas image-text-to-text. El proceso de abliteration parte del quant Q8_0 y mide direcciones de rechazo por separado para prompts de chat y de modo "think" en cada capa. Los candidatos de subespacio son los vectores singulares principales de todas esas direcciones combinadas.

Una búsqueda multiobjetivo eligió el rango del subespacio y las intensidades por capa, minimizando rechazos y manteniendo baja la KL del primer token en prompts inocuos. El resultado fue un único vector (rango 1) con intensidad entre 0,8 y 1,06 en las capas 13 a 63; las capas 0 a 12 se dejaron sin tocar porque editarlas degradaba mucho la calidad y apenas reducía los rechazos. La dirección se proyectó fuera de las escrituras al flujo residual en `attn_output` (13 capas de atención completa), `ssm_out` (38 capas de atención lineal) y `ffn_down` (51 capas), es decir, 102 tensores en total. El resto, incluidos embeddings y proyector de visión, permanece byte-idéntico a los quants originales de unsloth.

## Capacidades

- Generación de texto y razonamiento en modo chat y en modo "think" (razonamiento explícito antes de la respuesta).
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al proyector de visión incluido en `mmproj-*.gguf`.
- Conversación multi-turno sin rechazos ante peticiones dañinas (comportamiento buscado por el autor, no un defecto).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo "think" es compatible con cadenas de razonamiento.
- Capacidades especiales: modo de razonamiento ("think") y visión; audio no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía la tasa de rechazo (de 99/100 a 0/100 en chat) y qué coste tiene en KL (0,110 en el primer token de prompts inocuos) al eliminar la dirección de rechazo, con un registro por tensor en `patch-stats.txt`.
- Evaluación de robustez de filtros: sirve como contraparte "sin censura" para medir si los clasificadores de salida de un pipeline detectan contenido dañino generado por un modelo abliterado.
- Pruebas de cuantización: los datos de "edit lost" por fichero (0,1 % en Q8_0, 1,5 % en Q4_K_XL, 6,5 % en Q2_K_XL) permiten estudiar cómo la cuantización de baja precisión borra ediciones pequeñas en tensores densos.
- Despliegue local con visión en una GPU de consumo: el quant UD-Q4_K_XL (16,4 GiB) cabe en una tarjeta de 24 GB y se sirve con `llama-server -m ... --mmproj mmproj-F16.gguf` en llama.cpp mainline.
- Aplicación de la edición sobre otros quants: la LoRA `abliteration-lora.gguf` permite reproducir el efecto sobre una cuantización distinta del modelo original sin rehacer el proceso, usando `--lora abliteration-lora.gguf`.
- Generación creativa sin restricciones: escritura de ficción con contenido sensible (violencia, temas controvertidos) donde los filtros del modelo original bloquean la generación, asumiendo la responsabilidad legal y ética del despliegue.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas del proceso de abliteration sobre el quant Q8_0 con decodificación greedy, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación tal cual:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 0 |
| Modo think: rechazo en razonamiento o respuesta (/100) | 97 | 1 |
| KL del primer token en prompts inocuos | 0 | 0,110 |

Los 100 prompts son peticiones dañinas reservadas (held-out); las respuestas de chat se limitaron a 384 tokens y el modo think a 768. La cifra de KL incluye un pequeño ruido de base por inferencia en lote.

Supervivencia de la edición tras cuantizar:

| Fichero | Edición perdida (media) | Edición perdida (peor tensor) |
|---|---|---|
| Q8_0 | 0,1 % | 0,1 % |
| UD-Q6_K_XL | 0,3 % | 1,9 % |
| UD-Q5_K_XL | 0,9 % | 2,6 % |
| UD-Q4_K_XL | 1,5 % | 6,9 % |
| UD-Q3_K_XL | 2,7 % | 12 % |
| UD-Q2_K_XL | 6,5 % | 33 % (tres tensores IQ1_S `ffn_down`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 27,1 GiB (Q8_0), 23,6 GiB (UD-Q6_K_XL), 19,5 GiB (UD-Q5_K_XL), 16,4 GiB (UD-Q4_K_XL), 12,2 GiB (UD-Q3_K_XL), 9,3 GiB (UD-Q2_K_XL). Hay que sumar el proyector de visión F16 y el espacio de contexto KV.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6; RTX 4090 (24 GB) o A6000 para Q4_K_XL y Q5_K_XL; GPUs de 12-16 GB para Q3 y Q2.
- Cabe en GPU de consumo: sí, UD-Q4_K_XL (16,4 GiB) es el valor por defecto recomendado por el autor y encaja en una tarjeta de 24 GB; UD-Q3_K_XL y UD-Q2_K_XL caben en 12-16 GB.
- Opciones de despliegue: llama.cpp mainline (`llama-server`), con soporte de `--mmproj` para visión y `--lora` para aplicar la edición sobre otros quants. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrfakename/Qwen3.8-27B-abliterated-GGUF | 27B | no disponible | Apache 2.0 | GGUF | Sin rechazos; visión; 6 niveles de cuantización |
| mrfakename/Qwen3.8-27B-abliterated | 27B | no disponible | Apache 2.0 | safetensors | Versión sin cuantizar del mismo modelo |
| unsloth/Qwen3.8-27B-GGUF | 27B | no disponible | Apache 2.0 (heredada) | GGUF | Quants originales sin editar; rechaza peticiones dañinas |
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache 2.0 | safetensors | Modelo base original de Alibaba Qwen |

Los datos de contexto de los modelos comparables no aparecen en la información proporcionada; no se dispone de benchmarks estándar para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- El modelo cumple peticiones dañinas por diseño: la tasa de rechazo baja de 99/100 a 0/100 en chat y de 97/100 a 1/100 en modo think. La responsabilidad de uso recae íntegramente en el desplegador.
- La edición se pierde parcialmente al cuantizar: hasta un 6,5 % de media y un 33 % en el peor tensor en UD-Q2_K_XL, que además no fue evaluado por separado y puede rechazar con más frecuencia. El autor recomienda Q3 o superior si eso importa.
- El proceso de ablación introduce una KL de 0,110 en el primer token de prompts inocuos, lo que indica una desviación medible de la distribución original incluso en entradas benignas.
- Sesgos conocidos: no disponibles en la información proporcionada; al eliminar la dirección de rechazo se puede amplificar la generación de contenido sesgado o tóxico.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin filtros puede infringir normativas locales (por ejemplo, la Ley de Servicios Digitales de la UE o la Ley de IA) según el caso de uso; conviene revisar el cumplimiento antes de desplegar en producción.
- El campo safetensors del repo (1.723.392 parámetros) es inconsistente con el nombre del modelo y el tamaño del repositorio (117,9 GB); conviene verificar el número real de parámetros antes de planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/mrfakename/Qwen3.8-27B-abliterated-GGUF
- Modelo base sin cuantizar: https://huggingface.co/mrfakename/Qwen3.8-27B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Quants originales de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Discord del autor: https://discord.com/invite/foss
