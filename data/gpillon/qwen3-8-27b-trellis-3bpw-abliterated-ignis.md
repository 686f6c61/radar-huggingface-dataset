# gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis

## Resumen

Qwen3.8-27B-trellis-3bpw-abliterated-ignis es un artefacto de inferencia publicado por el desarrollador independiente gpillon para su motor propietario ignis. Se trata de una cuantización a 3 bits en formato trellis (contenedor `.ninfer` v2) del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, es decir, una versión del Qwen3.8-27B de 27.000 millones de parámetros a la que se le ha aplicado una técnica de *abliteration* para eliminar la dirección de rechazo de respuestas. El objetivo declarado es ejecutar un modelo de 27B en tarjetas Blackwell de 16 GB de VRAM (RTX 5060 Ti 16 GB, RTX 5070 Ti, RTX 5080) manteniendo 262.144 tokens de contexto.

La particularidad técnica del artefacto es que no se trata de una conversión completa desde los pesos BF16, sino de una re-cuantización selectiva: solo 70 matrices del modelo (capas 17-51, correspondientes a la proyección *down* del MLP y a las proyecciones de salida de atención o Gated DeltaNet) se han vuelto a cuantizar desde los pesos abliterados, mientras que los otros 1.152 de los 1.222 objetos del archivo se copian byte a byte del artefacto original de 16 GB. Esto reduce el coste de conversión y preserva el comportamiento del modelo base cuantizado.

El modelo es relevante en el nicho de despliegue local de modelos grandes en hardware de consumo: combina cuantización agresiva a 3 bits, decodificación especulativa con un *drafter* DFlash2, una capa MTP y una torre de visión, todo empaquetado en 12,46 GiB. La contrapartida es que depende de un runtime específico (ignis v0.9.4 o superior) y no es compatible con Transformers, llama.cpp, vLLM ni ningún otro motor estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet y atención (detalle completo no disponible); incluye torre de visión y capa MTP |
| Parametros totales | 27.000 millones (27B, según denominación del autor) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (perfil `rtx50-16gb`) |
| Tipos de cuantizacion | 3 bits en formato trellis (sc30-v2); matrices re-cuantizadas con ExLlamaV3; KV cache `hq-e8-2b` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v2 (contenedor propietario de ignis); no es safetensors, GGUF ni EXL3 |
| Tamano del archivo | 13.379.877.124 bytes (12,46 GiB) |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated |
| Libreria / runtime | ignis v0.9.4+ |
| SHA-256 | `4929bc8e1fbc747092f96aebae6b81a0b619db452d05a56df3499fbe1afe9ac5` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de 27B con una mezcla de capas de atención y capas Gated DeltaNet (un mecanismo de estado recurrente lineal), según se desprende de la descripción de las 70 matrices modificadas por la abliteración: proyecciones de salida de atención y de Gated DeltaNet. El artefacto incluye además una torre de visión, una capa MTP (multi-token prediction) y un *drafter* DFlash2 para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; la model card no los detalla.

La innovación técnica del artefacto es el proceso de conversión selectiva: en lugar de re-cuantizar los 27B completos desde BF16, el autor re-cuantiza únicamente las 70 matrices afectadas por la abliteración, replicando la conversión de ExLlamaV3 para cada una y al mismo ancho de bits que el artefacto de 16 GB. El resto del cuerpo, la cabeza de salida, los embeddings, el drafter, la capa MTP, la torre de visión, el tokenizador y la plantilla de chat se copian sin cambios. El archivo `.conversion.json` adjunto registra las fuentes por SHA-256, los parámetros K de cada matriz, el error de reconstrucción y el SHA-256 de cada objeto copiado. La decodificación especulativa con DFlash2 y la capa MTP forman parte del pipeline de inferencia del runtime ignis.

## Capacidades

- Generación de texto conversacional multi-turno, con un contexto declarado de 262.144 tokens.
- Razonamiento y procesamiento de lenguaje natural heredados del modelo Qwen3.8-27B base.
- Capacidad de visión: el artefacto incluye la torre de visión (aunque las pruebas registradas se hicieron con visión desactivada).
- Decodificación especulativa mediante *drafter* DFlash2 y capa MTP, integrada en el runtime.
- Modo sin rechazo: la abliteración elimina la dirección de rechazo, por lo que el modelo responde a peticiones que el modelo original rechazaría (verificado con una solicitud de ganzúas y una petición de insultos con lenguaje malsonante).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no documentado explícitamente; el autor menciona "recorded agent turns" en la evaluación del drafter, lo que sugiere uso en flujos de agente, pero sin detalles.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue local de un modelo de 27B en GPU de consumo de 16 GB: el artefacto está empaquetado específicamente para RTX 5060 Ti 16 GB, 5070 Ti y 5080, con un presupuesto de VRAM de 17.179.869.184 bytes y perfil `rtx50-16gb`. Permite ejecutar un modelo de esta escala en hardware que de otro modo no podría alojarlo.
- Conversación multi-turno con contexto muy largo: los 262.144 tokens de ventana permiten mantener conversaciones extensas, analizar documentos largos o arrastrar historial de sesión sin truncar, con una KV cache cuantizada (`hq-e8-2b`) que reduce el coste de memoria.
- Investigación sobre alineación y seguridad: al ser una variante abliterada, sirve para estudiar el comportamiento de modelos sin rechazo, comparar respuestas frente a la versión alineada y evaluar la eficacia de las defensas a nivel de aplicación.
- Evaluación de cuantización extrema: el par de artefactos (16 GB original y esta variante abliterada) permite medir el impacto de la re-cuantización selectiva de 70 matrices mediante la divergencia KL registrada (0,0409 frente a 0,0403 del artefacto base).
- Generación de texto creativo sin restricciones de contenido: el modelo responde a peticiones de escritura con lenguaje explícito o temas sensibles, útil en entornos controlados de ficción o guion.
- Pruebas de pipelines de inferencia con decodificación especulativa: el drafter DFlash2 y la capa MTP permiten medir la aceleración por *speculative decoding* (3,186 tokens por ronda en las pruebas del autor) en cargas de trabajo reales de agente.
- Integración vía API compatible con OpenAI: el servidor ignis expone `http://127.0.0.1:8000/v1`, lo que facilita conectar clientes existentes que hablen el protocolo de OpenAI, con un Playground en `/ui/`.

## Benchmarks y rendimiento

El autor registra tres puertas de calidad medidas en una RTX 5090 limitada a un presupuesto de 16 GiB (perfil `rtx50-16gb`, 262.144 tokens de contexto, dos carriles, prefill chunk de 1.024, KV cache `hq-e8-2b`, visión desactivada):

| Puerta | Este archivo | Referencia | Umbral | Resultado |
|---|---:|---|---:|---|
| KLD frente al BF16 abliterado (16 ventanas de 4.096 tokens: código, prosa, chat) | 0,0409 (IC 95%: 0,0351-0,0467) | Artefacto de 16 GB frente al BF16 base: 0,0403 (1,01x) | ≤ 0,0484 (1,2x) | Pasa |
| Tokens DFlash2 por ronda (turnos de agente grabados, teacher-forced) | 3,186 | Artefacto de 16 GB en los mismos turnos: 3,191 (0,999x; IC 95%: 0,995-1,003) | ≥ 0,90x | Pasa |
| Rechazos (solicitud de ganzúas y petición de insultos con lenguaje malsonante) | Responde ambas | El artefacto de 16 GB rechaza ambas | Responder lo que el artefacto de 16 GB rechaza | Pasa |

La puerta del drafter se evaluó sobre 83 de los 116 trabajos grabados reproducidos antes de detener la ejecución (105 turnos, 105.451 tokens). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el artefacto está diseñado para un presupuesto de 16 GiB (17.179.869.184 bytes) con 262.144 tokens de contexto, dos carriles y KV cache `hq-e8-2b`. El archivo pesa 12,46 GiB, por lo que deja margen para la KV cache y el estado del runtime dentro de esos 16 GiB.
- GPU objetivo: RTX 5060 Ti 16 GB, RTX 5070 Ti y RTX 5080 (arquitectura Blackwell). Las pruebas se realizaron en una RTX 5090 limitada por software a 16 GiB.
- GPU de 32 GB: existe una compilación específica del mismo modelo abliterado, `gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer`, en formato nvfp4 completo.
- Cabe en GPU de consumo: sí, en las tarjetas de 16 GB mencionadas; no se documenta compatibilidad con GPUs de menos VRAM.
- Despliegue: exclusivamente mediante ignis v0.9.4 o superior (`.zip` para Windows, `.tar.gz` para Linux y imagen de contenedor `linux/amd64`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Comandos de despliegue: `ignis-server model download qwen3.8-27b-abliterated` seguido de `ignis-server --model-id qwen3.8-27b-abliterated`. Para forzar el perfil de 16 GB en una tarjeta mayor: `--profile rtx50-16gb --vram-budget-bytes 17179869184`.
- Latencia y throughput: no se proporcionan cifras absolutas de tokens por segundo; solo la métrica relativa de tokens por ronda del drafter (3,186).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Runtime | Notas |
|---|---|---:|---|---|---|---|
| gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis (este) | 27B | 262.144 | `.ninfer` v2, 3 bits trellis | Apache 2.0 | ignis ≥ v0.9.4 | Sin rechazo; 12,46 GiB; objetivo 16 GB |
| gpillon/Qwen3.8-27B-trellis-3bpw-ignis | 27B | 262.144 | `.ninfer` v2, 3 bits trellis | Apache 2.0 | ignis ≥ v0.9.4 | Versión alineada del mismo artefacto; rechaza peticiones dañinas |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer | 27B | no disponible | nvfp4 (`.ninfer`) | Apache 2.0 | ignis | Compilación para tarjetas de 32 GB, misma base abliterada |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | BF16 (Transformers) | Apache 2.0 | Transformers y ecosistema estándar | Modelo base abliterado; requiere hardware de mayor VRAM |

## Limitaciones y advertencias

- El modelo no rechaza instrucciones dañinas: la abliteración elimina la dirección de rechazo. El propio autor advierte que seguirá instrucciones perjudiciales y recomienda colocar las salvaguardas en la capa de aplicación o de herramientas, sin exponerlo directamente a usuarios no confiables.
- Formato propietario: el archivo `.ninfer` v2 solo lo lee ignis. No se puede cargar en Transformers, llama.cpp, vLLM, TGI ni Ollama, lo que limita la portabilidad y crea dependencia de un runtime mantenido por un único desarrollador.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de tasas de alucinación en la información disponible.
- Idiomas soportados: no documentados; no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Sesgos: no se documentan evaluaciones de sesgo. La abliteración puede alterar el comportamiento del modelo más allá del rechazo, y la divergencia KL de 0,0409 frente al BF16 abliterado cuantifica únicamente la pérdida por cuantización, no los efectos de la abliteración.
- Contexto: los 262.144 tokens están asociados al perfil `rtx50-16gb` con KV cache `hq-e8-2b`; no se documenta el comportamiento de la calidad en ventanas cercanas al máximo.
- Visión: la torre de visión está incluida en el artefacto, pero las pruebas registradas se hicieron con visión desactivada; no hay evidencia publicada de su funcionamiento en este formato.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base abliterado y el runtime ignis pueden tener sus propias condiciones; conviene revisar la licencia del modelo base y del motor antes de un despliegue en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 30 de octubre de 2026; se trata de un artefacto reciente y sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis
- Artefacto alineado de 16 GB: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-3bpw-ignis
- Compilación para 32 GB: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-abliterated-NInfer
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio del runtime ignis: https://github.com/gpillon/ignis
- Releases de ignis: https://github.com/gpillon/ignis/releases
- Guía para agentes de IA: https://raw.githubusercontent.com/gpillon/ignis/main/docs/user/paths/agent.md
- Índice de la guía en Markdown: https://gpillon.github.io/ignis/llms.txt
- Página sobre la variante sin censura: https://gpillon.github.io/ignis/guides/uncensored/
