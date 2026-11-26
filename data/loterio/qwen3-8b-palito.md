# loterio/Qwen3-8B-palito

## Resumen

Qwen3-8B-palito es un artefacto de despliegue publicado por el usuario loterio que empaqueta el modelo Qwen3-8B de Alibaba Qwen en un unico fichero autocontenido con formato `.palito` (PLT1), pensado para el motor de inferencia palito. No se trata de un modelo nuevo ni de un fine-tune con cambios en los pesos originales: es una redistribucion cuantizada del Qwen3-8B base, con tokenizador, plantilla de chat y pesos consolidados en un solo binario de 3,60 GiB.

El paquete incorpora pesos cuantizados a `PLT1 HYB Q=5` (aproximadamente 3,0 bits por peso en las capas del transformer) y una cabeza borrador EAGLE-3 en Q4_K procedente de AngelSlim/Qwen3-8B_eagle3, lo que habilita decodificacion especulativa automatica en el motor palito. Su relevancia es practica: permite ejecutar un modelo de 8.000 millones de parametros en una unica GPU de consumo con aceleracion por speculative decoding, sin necesidad de gestionar multiples ficheros ni configurar manualmente el borrador.

La ficha del autor reporta velocidades de hasta 620 tok/s en prompts de refactor sobre una RTX 5090, con cifras de 281 a 356 tok/s en prompts generales y de codigo. La licencia es Apache 2.0 tanto para el modelo base como para la cabeza EAGLE-3 (Copyright 2025 Tencent). El formato es propietario del motor palito y no es compatible con llama.cpp, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con cabeza borrador EAGLE-3 para decodificacion especulativa |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B); parametros de la cabeza EAGLE-3 no disponibles |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | `PLT1 HYB Q=5` (~3,0 bpw en capas transformer); cabeza EAGLE-3 en Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base y cabeza EAGLE-3, Copyright 2025 Tencent) |
| Formato de pesos | `.palito` (PLT1), fichero unico de 3,60 GiB; no es GGUF |
| sha256 | `4ad38e005570534d3423f9490019007be779576ebf6a4e48da9304c1ba43c4c8` |
| Libreria | palito (>= 0.14) |
| Modelo base | Qwen/Qwen3-8B |
| Cabeza borrador | AngelSlim/Qwen3-8B_eagle3 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de 8.000 millones de parametros desarrollado por Alibaba Qwen. Sobre el se anade una cabeza borrador EAGLE-3 (entrenada por AngelSlim y derivada de Tencent) que predice varios tokens por paso para alimentar la decodificacion especulativa del motor palito. El paquete incluye tambien el tokenizador y la plantilla de chat originales, con soporte de modo thinking.

No se ha realizado ningun entrenamiento adicional sobre los pesos del modelo base en este artefacto: la unica transformacion es la cuantizacion a `PLT1 HYB Q=5` (aproximadamente 3,0 bits por peso en las capas del transformer) y el empaquetado junto con la cabeza EAGLE-3 en Q4_K. El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset ni procesos de RLHF o DPO, ya que estos corresponden al Qwen3-8B original y no se reproducen en la model card. La innovacion tecnica destacable es la integracion de decodificacion especulativa con `SuffixDecoding` y la activacion automatica de CUDA y EAGLE-3 al cargar el fichero, desactivable mediante la variable de entorno `PALITO_NO_EAGLE3=1`.

## Capacidades

- Generacion de texto en modo chat y completado, con plantilla de chat incluida en el propio fichero.
- Modo thinking (razonamiento extendido) heredado de Qwen3-8B, presente en la plantilla de chat empaquetada.
- Decodificacion especulativa automatica mediante cabeza EAGLE-3, con `SuffixDecoding` para acelerar la generacion.
- API compatible con OpenAI a traves del subcomando `palito serve`.
- Interfaz de chat interactiva con estadisticas de rendimiento (`palito chat --stats`).
- Capacidades de codigo y refactor derivadas del modelo base (los prompts de refactor son los que alcanzan mayor throughput segun el autor).
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling, function calling y comportamiento agentico: no documentados en la informacion disponible (dependen de las capacidades del Qwen3-8B base, no verificadas aqui).

## Casos de uso

- Despliegue local en GPU de consumo: el fichero de 3,60 GiB permite cargar un modelo de 8.000 millones de parametros en una unica GPU consumer con cuantizacion agresiva (~3,0 bpw), lo que lo hace viable en equipos de gama alta sin multiples GPUs.
- Servicio de inferencia compatible con OpenAI: `palito serve` expone una API que puede sustituir a endpoints comerciales en prototipos y herramientas internas que ya consumen la interfaz OpenAI.
- Asistentes de codigo y refactor: los prompts de refactor alcanzan 620 tok/s en RTX 5090, lo que hace al modelo adecuado para tareas interactivas de reescritura y generacion de codigo donde la latencia percibida es critica.
- Chat interactivo con modo thinking: la plantilla de chat incluye razonamiento extendido, util para sesiones de depuracion o analisis donde el usuario quiere ver el proceso de razonamiento del modelo.
- Evaluacion de motores de inferencia: sirve como banco de pruebas para comparar palito frente a llama.cpp con la misma cabeza EAGLE-3, tal como documenta el autor en su tabla de velocidades.
- Experimentacion con decodificacion especulativa: al incluir la cabeza EAGLE-3 y permitir desactivarla con `PALITO_NO_EAGLE3=1`, es un artefacto comodo para medir el impacto del speculative decoding en distintos prompts y GPUs.
- Entornos con requisitos de simplicidad de despliegue: un unico fichero con tokenizador, plantilla, pesos y borrador elimina la gestion de multiples artefactos y configuraciones en pipelines de CI/CD o imagenes de contenedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta mediciones de velocidad en RTX 5090 con CUDA, decodificacion especulativa y 128 tokens greedy, medidas el 2026-11-26:

| Motor | Configuracion | tok/s (general / coding / refactor) |
|---|---|---|
| palito | este fichero, EAGLE-3 + SuffixDecoding (mejor por prompt) | 281 / 356 / 620 |
| llama.cpp | Q3_K_M + EAGLE-3 (misma cabeza AngelSlim) | 306 / 310 / 459 |

El autor advierte que las cifras dependen del prompt y de la GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 3,60 GiB; se necesita espacio adicional para el contexto KV y buffers del motor, aunque el autor no publica la cifra exacta de VRAM total.
- GPU recomendadas: RTX 5090 es la unica GPU con mediciones publicadas; por tamano del fichero, cualquier GPU consumer con al menos 8-12 GB de VRAM deberia poder alojarlo, aunque no hay confirmacion del autor.
- Cabe en GPU consumer: si, segun el tamano del fichero (3,60 GiB), en GPUs de gama alta y media-alta; modelos concretos no confirmados.
- Opciones de despliegue: exclusivamente el motor palito (>= 0.14). No es compatible con llama.cpp, Ollama ni LM Studio.
- Latencia y throughput: 281-620 tok/s en RTX 5090 con EAGLE-3 + SuffixDecoding; sin datos para otras GPUs.
- Variables de entorno relevantes: `PALITO_NO_EAGLE3=1` desactiva la cabeza borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-palito (este) | 8.000 M | no disponible | `.palito` (PLT1), 3,60 GiB | Apache 2.0 | Solo motor palito |
| Qwen3-8B (original) | 8.000 M | no disponible en esta ficha | safetensors | Apache 2.0 | vLLM, TGI, transformers, llama.cpp (via conversion) |
| Qwen3-8B en GGUF Q3_K_M + EAGLE-3 | 8.000 M | no disponible | GGUF | Apache 2.0 | llama.cpp (referencia de velocidad del autor) |
| AngelSlim/Qwen3-8B_eagle3 | cabeza borrador | no aplica | no disponible | Apache 2.0 | Motores con soporte EAGLE-3 |

La comparativa se limita a variantes del mismo modelo base porque la informacion disponible no incluye otros modelos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Formato propietario: el fichero `.palito` no carga en llama.cpp, Ollama ni LM Studio; el usuario queda atado al motor palito.
- Cuantizacion agresiva: ~3,0 bpw en las capas del transformer puede degradar la calidad frente al Qwen3-8B en precision completa; el autor no publica evaluaciones de calidad.
- Sin datos de benchmarks de calidad: no hay MMLU, HumanEval ni similares para verificar el impacto de la cuantizacion.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingue del paquete.
- Longitud de contexto no documentada en esta ficha: debe consultarse la del Qwen3-8B original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en este artefacto.
- Sesgos: no documentados por el autor; se heredan los del Qwen3-8B original.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-26; sin historial de uso comunitario.
- Dependencia de version: requiere palito >= 0.14; versiones anteriores pueden no cargar el fichero.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de `LICENSE`, `NOTICE` y `LICENSE-EAGLE3-AngelSlim.txt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loterio/Qwen3-8B-palito
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Cabeza EAGLE-3: https://huggingface.co/AngelSlim/Qwen3-8B_eagle3
- Motor palito (repositorio): https://github.com/natanloterio/palito
- Releases de palito: https://github.com/natanloterio/palito/releases
