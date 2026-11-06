# shoumenchougou/RWKV7-G1l-7.2B-GGUF

## Resumen

RWKV7-G1l-7.2B-GGUF es la versión cuantizada en formato GGUF del modelo base RWKV-7 "Goose" de 7.200 millones de parámetros, publicado por el usuario shoumenchougou a partir del checkpoint original de BlinkDL. RWKV-7 es una arquitectura de lenguaje recurrente sin atención (attention-free), lo que significa que sustituye la caché KV de los transformers por un estado recurrente de tamaño constante. Esto le permite mantener un coste de inferencia por token constante independientemente de la longitud del contexto, mientras que el entrenamiento sigue siendo paralelizable.

El modelo está pensado para inferencia local con llama.cpp y Ollama, y el repositorio ofrece cinco niveles de cuantización (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y FP16) con sumas de verificación SHA-256 publicadas. La versión G1l corresponde a la revisión del checkpoint con contexto de 34.304 tokens y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

Es relevante ahora porque demuestra que las arquitecturas recurrentes modernas ya tienen soporte funcional en el ecosistema de inferencia local (Ollama 0.33.2 o superior), ofreciendo una alternativa con estado fijo frente a los transformers convencionales para despliegues con contextos largos y memoria limitada. No obstante, se trata de un modelo base, no de un asistente alineado con instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrente, sin atención, estado constante) |
| Parametros totales | 7.200.194.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 34.304 tokens (configuración de la release) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP16 |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint original en .pth) |

## Arquitectura y entrenamiento

RWKV-7, denominado "Goose", es un modelo de lenguaje causal recurrente que prescinde por completo del mecanismo de atención. En lugar de una caché KV que crece linealmente con la secuencia, mantiene un estado recurrente de tamaño fijo, de modo que el trabajo de inferencia por token generado es constante. Esta propiedad de estado fijo describe únicamente el estado de secuencia de la arquitectura: el consumo total de memoria sigue dependiendo de los pesos seleccionados, el runtime, la configuración de contexto, el tamaño de lote y el backend de hardware.

El checkpoint G1l corresponde a la revisión con contexto de 34.304 tokens, con un fichero fuente original de 14.400.007.869 bytes y SHA-256 `ce81c2d568bc9fc8c9f7b8ddb47da070d88bf179827b311f221e1e6c5148af91`. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; el modelo se distribuye como base, sin alineamiento de seguridad ni ajuste instructivo. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia naturaleza recurrente de la arquitectura.

## Capacidades

- Generación de texto causal en 12 idiomas: inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe.
- Interfaz conversacional mediante la plantilla Jinja embebida en `tokenizer.chat_template`, validada en modos con y sin razonamiento (thinking y non-thinking).
- Inferencia con estado recurrente de tamaño constante, adecuada para secuencias largas sin crecimiento de la caché KV.
- Compatibilidad con llama.cpp y Ollama (0.33.2 o superior) para despliegue local.
- Soporte de tool calling, function calling y comportamiento de agente: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking nativo: no disponible en la información proporcionada más allá de la mención a la plantilla de chat en modo thinking.
- Alineamiento instructivo: no disponible; el autor advierte explícitamente de que es un modelo base que puede no seguir instrucciones de forma consistente.

## Casos de uso

- Inferencia local en hardware de consumo: con el fichero Q4_K_M (4,27 GiB) el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM o incluso en CPU mediante llama.cpp, lo que lo hace adecuado para prototipado en estaciones de trabajo sin aceleradores de gama alta.
- Procesamiento de documentos largos con memoria acotada: gracias al estado recurrente de tamaño fijo y a la configuración de 34.304 tokens, se puede alimentar el modelo con contratos, informes o transcripciones extensas sin que la memoria de inferencia crezca con la longitud de la entrada.
- Generación de texto multilingüe: al cubrir 12 idiomas, sirve para tareas de redacción, resumen o reescritura en aplicaciones con audiencias internacionales, incluyendo español, francés, alemán y árabe.
- Base para fine-tuning y experimentación académica: la licencia Apache 2.0 y el formato GGUF permiten adaptar el modelo a dominios concretos y comparar arquitecturas recurrentes frente a transformers en entornos de investigación.
- Chat experimental con plantilla embebida: el Modelfile de Ollama valida la representación de la plantilla Jinja en modos thinking y non-thinking, útil para evaluar la interfaz conversacional del modelo base antes de un ajuste instructivo propio.
- Despliegue en pipelines de CI/CD de bajo coste: la naturaleza recurrente y el tamaño reducido de las cuantizaciones Q4/Q5 permiten integrar el modelo en tareas de generación automática de documentación o texto auxiliar donde el throughput importa más que la precisión máxima.
- Evaluación comparativa de arquitecturas: sirve como referencia práctica para medir latencia y consumo de memoria de un modelo recurrente frente a transformers de tamaño similar en la misma máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q4_K_M 4,27 GiB, Q5_K_M 5,02 GiB, Q6_K 5,81 GiB, Q8_0 7,39 GiB, FP16 13,48 GiB. El tamaño del fichero no garantiza el uso total de RAM o VRAM, que depende del runtime, el contexto configurado y el tamaño de lote.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de pesos, las cuantizaciones Q4 a Q8 son compatibles con GPUs de consumo de 8-12 GB; FP16 requiere alrededor de 16 GB o más.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0 caben en GPUs de consumo con 8 GB o más de VRAM; la FP16 requiere GPUs de gama alta o profesional.
- Opciones de despliegue: Ollama (versión 0.33.2 o superior con soporte RWKV-7) y llama.cpp. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada. La arquitectura garantiza un coste de inferencia constante por token generado gracias al estado recurrente fijo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| RWKV7-G1l-7.2B-GGUF | 7,2 B | 34.304 | Recurrente sin atención (RWKV-7) | Apache 2.0 | GGUF, .pth |
| Alternativas de 7-8 B tipo transformer | no disponible | no disponible | Transformer con atención | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un modelo base, no un asistente alineado con instrucciones: puede no seguir instrucciones de forma consistente aunque se use la plantilla conversacional.
- No se documentan evaluaciones de sesgo; al entrenarse sobre corpus multilingües sin alineamiento, es probable la reproducción de sesgos presentes en los datos, aunque no se cuantifican.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no se han publicado métricas de fidelidad.
- La ventana de contexto de 34.304 tokens corresponde a la configuración de la release; superarla puede degradar la calidad o provocar errores en el runtime.
- El soporte multilingüe está declarado para 12 idiomas, pero no se aportan métricas por idioma que permitan calibrar la calidad relativa en cada uno.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Requiere Ollama 0.33.2 o superior con soporte RWKV-7; versiones anteriores no cargarán el modelo correctamente.
- El Modelfile no define una plantilla externa: la plantilla Jinja debe leerse del propio GGUF, y añadir una `TEMPLATE` externa en Ollama la sobrescribiría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shoumenchougou/RWKV7-G1l-7.2B-GGUF
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
- Checkpoint original G1l: https://huggingface.co/BlinkDL/rwkv7-g1/blob/11e3c50128e479898eee79c48831a95cf3e21d91/rwkv7-g1l-7.2b-20261031-ctx34304.pth
- Paper RWKV-7 (arXiv:2503.14456): https://arxiv.org/abs/2503.14456v2
- Repositorio GitHub RWKV-LM: https://github.com/BlinkDL/RWKV-LM
- Sitio web oficial RWKV: https://www.rwkv.com/
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
