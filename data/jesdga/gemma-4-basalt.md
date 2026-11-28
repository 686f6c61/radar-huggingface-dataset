# jesdga/Gemma-4-Basalt

## Resumen

Gemma-4-Basalt es un repositorio de pesos cuantizados de la familia Gemma 4 de Google, publicados por el desarrollador independiente jesdga para su motor de inferencia local Basalt, orientado a GPU NVIDIA Blackwell (sm_120). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión a formatos de baja precisión (NVFP4 y FP8) de tres checkpoints oficiales de Google: Gemma 4 26B A4B (mezcla de expertos), Gemma 4 31B (denso) y Gemma 4 12B (denso, solo texto). Cada archivo es autocontenido e incluye pesos, tokenizador, plantilla de chat, el drafter asistente de Google y, cuando corresponde, la torre de visión.

La propuesta de valor es ejecutar modelos de la clase 12B-31B en una única tarjeta Blackwell, manteniendo los pesos en VRAM y el embedding de tokens en RAM del sistema. El motor Basalt expone una API compatible con OpenAI y Anthropic, e incorpora decodificación especulativa con el drafter de Google, modo de razonamiento (thinking) activable y soporte de tool calling a través del servidor. El contexto máximo declarado es de 262.144 tokens, con un valor por defecto de 8.192 configurable mediante `--max-context`.

Es relevante ahora porque demuestra una ruta de cuantización no calibrada (redondeo directo desde BF16, sin datos de calibración) que logra una fidelidad respecto a BF16 medida con KLD y acuerdo top-1, y porque ejemplifica el ecosistema emergente de motores de inferencia alternativos especializados en hardware Blackwell. La licencia declarada es Apache 2.0, aunque conviene verificar la compatibilidad con los términos de los pesos originales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; variante MoE (26B A4B) y densas (31B, 12B) |
| Parametros totales | 26B (26B A4B), 31B (31B), 12B (12B) |
| Parametros activos | 4B en el modelo 26B A4B (128 expertos enrutados por capa, top 8); no aplica en los densos |
| Longitud de contexto | Hasta 262.144 tokens; por defecto 8.192 (`--max-context`) |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala UE4M3 por 16 valores y escala FP32 por matriz) y FP8 E4M3; embedding en BF16 en RAM; router y normas en F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.basalt` (formato propietario del motor Basalt); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 58,9 GB (tres archivos: 18,4 GB, 26,1 GB y 14,4 GB) |
| Vision | Si en 26B A4B y 31B (hasta 280 tokens por imagen); no en 12B |
| Libreria | basalt (requiere Basalt 0.6.0 o superior) |

## Arquitectura y entrenamiento

Los pesos subyacentes son los checkpoints de instrucción de Google Gemma 4 en BF16. El modelo 26B A4B es una mezcla de expertos con 128 expertos enrutados por capa y activación top-8, lo que resulta en aproximadamente 4.000 millones de parámetros activos por token; los modelos 31B y 12B son transformers densos convencionales. Todos comparten una ventana de contexto de hasta 262.144 tokens y una arquitectura de atención que combina capas de atención completa con capas de ventana deslizante (sliding-window) que mantienen una caché en anillo fija.

El trabajo de jesdga no incluye entrenamiento adicional: cada componente se redondea una sola vez desde los pesos BF16 de Google, sin calibración sobre datos. Los expertos enrutados del 26B A4B y las proyecciones MLP del 31B se almacenan en NVFP4 (códigos E2M1, escala UE4M3 por cada 16 valores y escala FP32 por matriz, en el caso del 31B elegida por mínimo error cuadrático); las proyecciones MLP del 26B A4B (MLP compartida) y del 12B, las proyecciones de atención de todos los modelos y la cabeza de salida (embedding atado) usan FP8 E4M3 con escala FP32 por matriz o por fila. El embedding de tokens se mantiene en BF16 en RAM del sistema, el router del MoE en F32 y las normas y escalares de capa en F32. El drafter asistente de Google se incluye en FP8 E4M3 y se usa por defecto para decodificación especulativa, con verificación de los tokens propuestos para que la salida sea la del modelo principal; se desactiva con `--spec 0`.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Razonamiento con modo thinking activado por defecto, desactivable mediante esfuerzo de razonamiento `none`.
- Tool calling / function calling a través del servidor compatible con OpenAI y Anthropic.
- Decodificación especulativa integrada mediante el drafter asistente de Google, con verificación de tokens.
- Visión en los modelos 26B A4B y 31B: procesamiento de imágenes con hasta 280 tokens por imagen, codificadas dentro del motor mediante la torre de visión incluida en el archivo.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: implícito por el tool calling y el modo thinking, sin detalles adicionales en la model card.
- Cuantización selectiva por componente (NVFP4 para expertos y MLP, FP8 para atención y cabeza) con fidelidad medida frente a BF16.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo 26B A4B admite hasta 262.144 tokens de contexto, lo que permite mantener conversaciones con documentos extensos, historiales largos o bases de conocimiento inyectadas en el prompt sin truncamiento agresivo.
- Generación de código con tool calling: la API compatible con OpenAI y Anthropic facilita integrar el modelo en pipelines de CI/CD o asistentes de IDE que invocan herramientas externas (ejecución de tests, linters, consultas a repositorios) mediante function calling.
- Análisis de documentos con imágenes: los modelos 26B A4B y 31B incorporan torre de visión y pueden procesar capturas, diagramas o páginas escaneadas junto a texto, útil para extracción de información de informes o tickets con adjuntos.
- Despliegue local en estación de trabajo Blackwell: al caber en una sola tarjeta RTX 5090 con los pesos en VRAM y el embedding en RAM, es adecuado para entornos con requisitos de privacidad donde los datos no pueden salir de la máquina.
- Razonamiento multi-paso con modo thinking: tareas de planificación, depuración compleja o análisis que se benefician de cadenas de razonamiento explícitas, con la posibilidad de desactivar el modo para reducir latencia en tareas simples.
- Servicio de inferencia compatible con SDK existentes: al exponer endpoints compatibles con OpenAI y Anthropic, se puede sustituir un backend en la nube por Basalt local sin reescribir clientes, útil para prototipado y evaluación comparativa.
- Evaluación de precisión y cuantización: los archivos y el conjunto de datos basalt-quality-v2 permiten a investigadores medir el impacto de NVFP4/FP8 frente a BF16 en tareas de conversación.

## Benchmarks y rendimiento

Rendimiento de velocidad en una RTX 5090 (400 W), KV en fp16 y drafter activado; prefill medido con un prompt de 64K:

| Modelo | Contexto | Prefill 64K (tok/s) | Decode conversación (tok/s) | Decode estructurado (tok/s) | Decode prosa (tok/s) |
|---|---:|---:|---:|---:|---:|
| 26B A4B | 262.144 | 10.934 | 445 | 710 | 376 |
| 31B | no disponible | no disponible | no disponible | no disponible | no disponible |
| 12B | no disponible | no disponible | no disponible | no disponible | no disponible |

Calidad de cuantización medida con la quality suite del proyecto (410 conversaciones, intervalos de confianza por bootstrap a nivel de conversación) frente a la referencia BF16 de vLLM:

| Modelo | Build | KLD medio | Mismo top-1 |
|---|---|---:|---:|
| 26B A4B | `Gemma-4-26B-A4B-it-NVFP4-F8.basalt` | 0,0293 +/- 0,0015 | 96,25 +/- 0,12% |
| 26B A4B | Unsloth UD-Q4_K_M GGUF (referencia comparativa, no distribuido) | 0,0146 | 97,40% |
| 31B | `Gemma-4-31B-it-NVFP4-F8.basalt` | 0,0319 +/- 0,0014 | 96,34 +/- 0,11% |
| 12B | `Gemma-4-12B-it-F8.basalt` | 0,0126 +/- 0,0006 | 97,34 +/- 0,08% |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA Blackwell (sm_120); el motor Basalt está compilado para esa arquitectura.
- VRAM estimada: los pesos ocupan 18,4 GB (26B A4B), 26,1 GB (31B) y 14,4 GB (12B); hay que añadir la caché KV, que puede reducirse a la mitad en las capas de atención completa con `--kv fp8`.
- El modelo 26B A4B cabe en una RTX 5090 con los pesos en VRAM y el embedding de tokens en RAM del sistema; los modelos 31B y 12B están diseñados para el mismo esquema de una sola tarjeta, aunque la model card no detalla cifras de VRAM total para ellos.
- GPU recomendadas: RTX 5090 (única con mediciones publicadas); otras tarjetas Blackwell (por ejemplo, de la familia profesional) son compatibles a nivel de arquitectura, sin datos de rendimiento publicados.
- Despliegue: motor Basalt 0.6.0 o superior, con servidor compatible con OpenAI y Anthropic; no hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: para el 26B A4B, prefill de 10.934 tok/s con prompt de 64K y decodificación de 376-710 tok/s según el tipo de salida en RTX 5090; sin datos para 31B y 12B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Basalt 26B A4B | 26B totales, 4B activos (MoE) | 262.144 | Sí | Apache 2.0 | `.basalt`, motor Basalt, una GPU Blackwell |
| Gemma-4-Basalt 31B | 31B densos | 262.144 | Sí | Apache 2.0 | `.basalt`, motor Basalt, una GPU Blackwell |
| Gemma-4-Basalt 12B | 12B densos | 262.144 | No | Apache 2.0 | `.basalt`, motor Basalt, una GPU Blackwell |
| Unsloth UD-Q4_K_M GGUF (26B A4B) | 26B totales, 4B activos | No disponible | No disponible | Según pesos base | GGUF, ecosistema llama.cpp |
| Checkpoints originales de Google (BF16) | 12B / 26B A4B / 31B | 262.144 | Sí (26B A4B y 31B) | Según términos de Google | Safetensors, ecosistema estándar |

La comparación de calidad frente a BF16 sitúa al 26B A4B en NVFP4/FP8 con KLD 0,0293 y 96,25% de acuerdo top-1, mientras que la cuantización GGUF Q4_K_M de Unsloth alcanza KLD 0,0146 y 97,40% en el mismo conjunto de evaluación, según los datos del autor. No hay datos de benchmarks de capacidad que permitan comparar rendimiento en tareas con modelos de otros fabricantes.

## Limitaciones y advertencias

- Dependencia total del motor Basalt: los archivos `.basalt` no son cargables por vLLM, llama.cpp, Ollama ni TGI, y requieren Basalt 0.6.0 o superior y una GPU NVIDIA Blackwell (sm_120).
- La cuantización NVFP4/FP8 introduce degradación medible frente a BF16 (KLD de 0,0293-0,0319 y ~96% de acuerdo top-1 en los modelos grandes); en tareas sensibles a la precisión conviene validar con la referencia BF16.
- El modelo 12B no incluye torre de visión ni entradas de audio en su archivo; es solo texto.
- La licencia declarada en el repositorio es Apache 2.0, pero los pesos derivan de checkpoints de Google Gemma 4; es responsabilidad del usuario verificar que los términos de uso de los pesos originales permiten el uso comercial y la redistribución en este formato.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos en la model card; se desconoce el comportamiento específico en castellano y en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de veracidad ni de seguridad.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y los datos de velocidad y calidad para los modelos 31B y 12B están pendientes de publicación ("to follow").
- El contexto por defecto es de 8.192 tokens; usar la ventana completa de 262.144 requiere configurarla explícitamente y aumenta el consumo de memoria de la caché KV.
- El drafter especulativo está activado por defecto; aunque los tokens se verifican, desactivarlo (`--spec 0`) puede ser necesario en entornos con requisitos estrictos de reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jesdga/Gemma-4-Basalt
- Web del proyecto Basalt: https://basalt.jgulfo.com
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- Documentación de Gemma 4 en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/models/gemma4.md
- Documentación de modelos y router: https://github.com/jesdga95/basalt/blob/main/docs/configuration/models.md
- Documentación de precisión: https://github.com/jesdga95/basalt/blob/main/docs/precision/gemma4.md
- Quality suite: https://github.com/jesdga95/basalt/blob/main/docs/precision/quality-suite.md
- Conjunto de datos de calidad: https://huggingface.co/datasets/jesdga/basalt-quality-v2
- Modelo base Gemma 4 26B A4B: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base Gemma 4 31B: https://huggingface.co/google/gemma-4-31B-it
- Modelo base Gemma 4 12B: https://huggingface.co/google/gemma-4-12B-it
