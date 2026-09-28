# haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo Qwen3.6-35B-A3B, publicada por el usuario haihengh y empaquetada en el formato propietario `.finch` del proyecto FinchMoE. Se trata de un derivado en dos pasos: primero se parte de la versión abliterated del modelo base publicada por huihui-ai (`huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated`), en la que se ha eliminado la dirección de rechazo directamente en los pesos, y después se repaqueta y cuantifica para inferencia con streaming desde SSD en equipos Apple Silicon con memoria limitada. El resultado ocupa 18,7 GiB en disco, frente a los aproximadamente 72 GB del snapshot en BF16.

El interés principal de esta ficha es doble. Por un lado, ilustra una estrategia de despliegue poco habitual: en lugar de cargar los pesos en memoria unificada, los tensores de expertos se transmiten token a token desde un SSD externo, lo que permite ejecutar un MoE de gran tamaño en una máquina con 16 GB de RAM. Por otro, es un ejemplo de derivado abliterated con una medición de regresión publicada y metodológicamente honesta, algo poco frecuente en este tipo de repositorios.

Conviene subrayar una limitación estructural desde el principio: el formato `.finch` no es GGUF, ni MLX, ni safetensors, y el modelo no carga en llama.cpp, MLX ni transformers. Su uso está restringido al motor FinchMoE del propio autor, sobre Apple Silicon con Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atención lineal GDN; 40 capas y 256 expertos por capa |
| Parametros totales | Aproximadamente 35B según la nomenclatura del modelo (no confirmado en la información disponible) |
| Parametros activos | Aproximadamente 3B según la nomenclatura "A3B" (no confirmado en la información disponible) |
| Longitud de contexto | No disponible (la evaluación se realizó con contexto de 4096 tokens) |
| Tipos de cuantizacion | Afín con escalas y sesgos en BF16, grupo de tamaño 64: 4 bits para expertos enrutados, experto compartido, atención y embeddings; 8 bits para proyecciones de atención lineal (GDN) y router; BF16 para normas y gates |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (heredada de Qwen3.6-35B-A3B) |
| Formato de pesos | `.finch` (formato específico de FinchMoE; incompatible con GGUF, MLX y safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mezcla de expertos (MoE) con 40 capas y 256 expertos por capa, que combina atención convencional con proyecciones de atención lineal denominadas GDN en la documentación del autor. La nomenclatura "35B-A3B" sigue la convención de Qwen para indicar parámetros totales y parámetros activos por token, de modo que se activarían aproximadamente 3B de los 35B en cada paso; este dato no se confirma explícitamente en la información disponible.

No se ha realizado ningún entrenamiento ni ajuste adicional en este repositorio. Las modificaciones respecto al snapshot de origen se limitan a dos: el repaquete en formato `.finch` y la cuantización descrita. La abliteración (eliminación de la dirección de rechazo en los pesos) proviene del snapshot upstream de huihui-ai, y el autor indica explícitamente que no se re-ablitera ni se hace fine-tuning. La procedencia se documenta con dos hashes: el `sourceSnapshotHash` (sha256 `41b93561…0be83`), idéntico al de la release base porque cubre el índice de tensores (nombres, formas, disposición), y el hash de `model_weights.bin` (sha256 `f6862341c9688e234c682cef186af5a92445be1dbcdd36d59637338634d311bd`), que es el que realmente difiere del de la release base (`9644b61a…8228d`).

## Capacidades

- Generación de texto en inglés y, según los resultados publicados en EvalPlus HumanEval, generación de código Python con pass@1 de 0,9329 sobre 164 problemas en configuración greedy.
- Razonamiento y resolución de problemas de programación, con un resultado de 0,9024 en HumanEval+.
- Comportamiento con rechazos sustancialmente reducidos respecto al modelo base, como consecuencia directa de la abliteración de los pesos. El autor advierte que no se ha medido el comportamiento de rechazo en sí, solo la ausencia de regresión en capacidad general.
- Inferencia en Apple Silicon con memoria limitada mediante streaming de expertos desde SSD, con servidor compatible con la API de OpenAI (`FinchMoEServer`).
- Idiomas adicionales: no disponibles. La model card declara únicamente inglés.
- Soporte de tool calling, function calling, agentes, visión, audio o modo de razonamiento extendido: no disponible en la información proporcionada.
- Longitud de contexto ampliada: no disponible; el único valor documentado es el contexto de 4096 tokens empleado en la evaluación.

## Casos de uso

- Ejecución de un MoE de gran tamaño en hardware de consumo Apple: el modelo permite trabajar con un sistema de aproximadamente 35B parámetros en un Mac mini M4 de 16 GB, transmitiendo los tensores de expertos desde un SSD externo en lugar de mantenerlos residentes en memoria. Es adecuado cuando el objetivo es explorar modelos grandes sin acceso a GPUs de centro de datos.
- Generación de código en local y sin conexión: los resultados de HumanEval permiten usarlo como asistente de programación en entornos aislados, donde no se puede enviar código a APIs externas por motivos de confidencialidad.
- Investigación sobre alineación y direcciones de rechazo: al ser un derivado abliterated con medición de regresión publicada, resulta útil como punto de comparación en estudios sobre cómo afecta la eliminación de la dirección de rechazo a las capacidades generales del modelo.
- Red teaming y evaluación de seguridad: un modelo con rechazos reducidos sirve para generar casos adversarios y probar sistemas de moderación en entornos controlados, siempre que se apliquen las salvaguardas organizativas correspondientes.
- Análisis de contenido sensible en contextos profesionales, como revisión de documentación legal, histórica o de moderación de contenido, donde los modelos alineados de forma agresiva pueden negarse a procesar material legítimo.
- Prototipado de pipelines de inferencia con streaming de pesos: el repositorio y el motor FinchMoE constituyen una referencia práctica para quien investigue arquitecturas de descarga por capas o por expertos desde almacenamiento secundario.
- Despliegue de un endpoint compatible con OpenAI en una red local: mediante `FinchMoEServer`, el modelo puede exponerse como servicio en un puerto local y consumirse desde herramientas que ya hablan el protocolo de OpenAI, sin modificar el cliente.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a EvalPlus HumanEval en modo greedy, sobre 164 problemas, con contexto de 4096 y el protocolo de servidor congelado del proyecto, medidos el 27 de septiembre de 2026. Las dos filas difieren únicamente en los pesos: mismo motor, mismo harness, misma cuantización y mismo contexto.

| Modelo | HumanEval pass@1 | HumanEval+ |
|---|---|---|
| Qwen3.6-35B-A3B (pesos base) | 0,9085 (149/164) | 0,8780 (144/164) |
| Esta build abliterated | 0,9329 (153/164) | 0,9024 (148/164) |

El autor advierte explícitamente de que la mejora de 4 problemas no debe interpretarse como una mejora de la capacidad de programación por efecto de la abliteración: el error estándar binomial con p≈0,91 y n=164 es de 2,2 puntos, por lo que los +2,4 puntos equivalen aproximadamente a un error estándar, es decir, ruido. Se ganaron y se perdieron problemas en ambos sentidos (ganados 95, 99, 113, 124, 147 y 160; perdidos 54 y 116). La afirmación defendible es la ausencia de regresión medible.

Sobre los fallos residuales: de los 11 problemas que fallan, 4 quedan truncados por el límite de 768 tokens del harness (HumanEval/116, 129, 130 y 132) y 7 fallan por méritos propios (32, 54, 62, 93, 134, 145 y 163). Un núcleo estable de fallos (32, 93, 129, 130, 132, 145 y 163) también falla con los pesos base, lo que apunta a dificultad intrínseca del modelo y no a la abliteración.

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, MT-Bench u otros) en la información disponible.

## Requisitos de hardware

- Plataforma soportada: Apple Silicon con Metal. El formato `.finch` no carga en llama.cpp, MLX ni transformers, por lo que no hay despliegue posible en GPUs NVIDIA o AMD con las herramientas habituales.
- Huella en disco: 18,7 GiB en total (1,9 GB de pesos no expertos, 18,1 GB de expertos empaquetados, 23 MB de tokenizador y ficheros de manifiesto y verificación de tamaño menor).
- Configuración medida: Mac mini M4 con 16 GB de memoria unificada y el modelo instalado en un SSD externo. La memoria residente está dominada por la caché KV y los búferes de trabajo, no por los pesos, ya que los tensores de expertos se transmiten por token.
- VRAM estimada para otras configuraciones: no disponible. No se han publicado cifras de consumo de memoria desglosadas.
- GPUs recomendadas: no disponible; no se documenta soporte para A100, H100, RTX 4090 ni otras GPUs discretas.
- Rendimiento medido: aproximadamente 40 tok/s en procesamiento de prompt y unos 8 tok/s en generación, en la configuración M4 de 16 GB con almacenamiento externo. El throughput depende en gran medida de la velocidad del SSD.
- Opciones de despliegue: `FinchMoECLI` para uso por línea de comandos y `FinchMoEServer` como servidor compatible con OpenAI en un puerto configurable. El flag `--verify trusted-install` omite el hash SHA-256 completo en el primer acceso, mientras que `--verify strict` comprueba cada byte en la carga.
- No compatible con vLLM, TGI, Ollama, llama.cpp ni MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FinchMoE 4-bit abliterated) | ~35B totales, ~3B activos | No disponible (evaluado a 4096) | 0,9329 | Apache-2.0 | Formato `.finch`, solo FinchMoE |
| Qwen3.6-35B-A3B (pesos base) | ~35B totales, ~3B activos | No disponible | 0,9085 | Apache-2.0 | Safetensors y cuantizaciones habituales |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | ~35B totales, ~3B activos | No disponible | No disponible | Apache-2.0 | Safetensors |
| Otras cuantizaciones de 4 bits de Qwen3.6-35B-A3B (GGUF, MLX) | ~35B totales, ~3B activos | No disponible | No disponible | Apache-2.0 | GGUF / MLX |

Los tres primeros comparten exactamente la misma base de pesos, de modo que las diferencias se reducen al proceso de abliteración, el esquema de cuantización y el formato de empaquetado. No se dispone de datos de benchmarks para las alternativas de cuantización en formato GGUF o MLX, ni de comparaciones con modelos de otros fabricantes del mismo rango de tamaño.

## Limitaciones y advertencias

- El modelo está abliterated: la dirección de rechazo se ha eliminado de los pesos, no mediante prompting. Esto implica una reducción sustancial de las negativas del modelo y traslada al operador toda la responsabilidad sobre el filtrado de contenido y las salvaguardas de despliegue.
- El autor declara de forma explícita que el comportamiento de rechazo no se ha medido. Lo único evaluado es la ausencia de regresión en capacidad general, no lo que el modelo aceptará o rechazará generar.
- La mejora observada en HumanEval (de 0,9085 a 0,9329) está dentro del margen de error estadístico con n=164 problemas. No debe presentarse como una mejora de capacidad atribuible a la abliteración.
- Compatibilidad muy restringida: el formato `.finch` solo funciona con el motor FinchMoE. No hay soporte para llama.cpp, MLX, transformers, vLLM ni TGI, lo que descarta su uso en la mayoría de infraestructuras de producción existentes.
- Plataforma limitada a Apple Silicon. No hay despliegue documentado en GPUs discretas.
- Idiomas: únicamente inglés declarado en los metadatos. El rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Longitud de contexto: no disponible. La única cifra publicada es el contexto de 4096 tokens usado en la evaluación, que es un valor bajo para tareas de contexto largo.
- Rendimiento dependiente del almacenamiento: con unos 8 tok/s de generación en la configuración medida, el modelo no es adecuado para aplicaciones interactivas de baja latencia ni para cargas con requisitos de throughput alto. La velocidad del SSD condiciona directamente el rendimiento.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación para esta build ni para el modelo base.
- Sesgos conocidos: no se han publicado análisis de sesgo en la información disponible.
- Licencia Apache-2.0, heredada del modelo base. El repositorio es una obra derivada y la licencia del modelo base y los términos de la abliteración upstream se mantienen sin cambios; conviene revisarlos antes de un uso comercial.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado en septiembre de 2026. Se trata de una publicación reciente y sin validación independiente por parte de terceros.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo ni sobre FinchMoE.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated
- Motor FinchMoE (GitHub): https://github.com/haihengh/finchMoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Abliteración upstream: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
