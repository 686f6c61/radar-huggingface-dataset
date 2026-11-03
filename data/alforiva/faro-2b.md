# alforiva/faro-2b

## Resumen

Faro 2B es un modelo de lenguaje de instrucciones de clase 2B desarrollado por Progetto Siliceo y publicado en HuggingFace bajo el identificador `alforiva/faro-2b`. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-2B, orientado a ejecutarse localmente en hardware de consumo antiguo como motor de un asistente siempre activo. Su propuesta diferencial es que la ética y el método de trabajo están integrados en los propios pesos mediante un entrenamiento constitucional, sin capa externa de guardrails en inferencia.

El modelo emplea una receta propia denominada Candela, que combina poda del vocabulario multilingüe (italiano, español e inglés), redimensionado de embeddings, preentrenamiento continuado constitucional y ajuste supervisado sobre aproximadamente 480 trazas curadas. Aunque se presenta como clase 2B, los pesos en safetensors suman 1.448.902.464 parámetros reales, con una arquitectura Qwen3.5 de 24 capas y dimensión oculta 2048.

Se distribuye principalmente como archivo GGUF en cuantización q4_k_m de 0,91 GB para llama.cpp y runtimes compatibles, con una ventana de contexto declarada de 262.144 tokens y licencia Apache 2.0. Es relevante ahora porque demuestra un enfoque poco habitual en modelos pequeños: medir el comportamiento honesto (citar, refutar, pedir datos, confinar) con un benchmark propio y publicar los fallos junto a los aciertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (torre de texto), transformer, 24 capas, hidden 2048 |
| Parametros totales | 1.448.902.464 (safetensors); clase ~2B segun el autor |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF q4_k_m (0,91 GB); otras no disponibles |
| Idiomas soportados | Italiano, español, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; safetensors (repo de 0,9 GB) |

Otros datos relevantes: vocabulario reducido de 248.320 a 36.932 tokens tras la poda IT/ES/EN (14,9 % conservado), embeddings atados (tied), modelo base Qwen/Qwen3.5-2B, librería llama.cpp y pipeline text-generation.

## Arquitectura y entrenamiento

Faro 2B parte de la torre de texto de Qwen3.5-2B, un transformer denso de 24 capas con dimensión oculta 2048 y embeddings atados. Sobre esa base se aplica la receta Candela en cuatro etapas: poda del vocabulario multilingüe limitándolo a italiano, español e inglés (de 248.320 a 36.932 tokens), redimensionado de la matriz de embeddings para adaptarla al nuevo vocabulario, preentrenamiento continuado de carácter constitucional y ajuste supervisado sobre aproximadamente 480 trazas curadas. El ajuste se realizó con QLoRA según las etiquetas del repositorio, y el entrenamiento completo se llevó a cabo en una única GPU RTX 2070 de 8 GB, lo que da una idea del régimen de recursos del proyecto.

La innovación principal no es arquitectónica sino metodológica: una constitución y un método de trabajo se entrenan dentro de los pesos, sin capa externa de guardrails en tiempo de inferencia. El modelo incorpora plantilla de chat propia que viaja dentro del GGUF, de modo que llama.cpp con `--jinja` la aplica automáticamente; el autor advierte explícitamente de que no debe construirse el prompt a mano, porque el fine-tune se entrenó con un formato de turno específico y responde mal fuera de él. En la configuración de servicio recomendada se desactiva el razonamiento (`--reasoning-budget 0`) y se emplea caché KV cuantizada (`turbo4`/`turbo3_tcq`).

## Capacidades

- Generación de texto conversacional y de instrucciones en italiano, español e inglés.
- Razonamiento de dominio acotado a su knowledge pack, con comportamiento entrenado para responder, refutar premisas falsas, confinar lo que queda fuera de su campo y pedir datos faltantes.
- Tool calling nativo (function calling), según declara el autor.
- Citas de fuentes del pack: el modelo cita una fuente del pack en el 46 % de sus respuestas.
- Modo de razonamiento disponible en el modelo base, pero desactivado en la configuración de servicio recomendada.
- Ejecución on-device en hardware de consumo antiguo gracias al tamaño de 0,91 GB en q4_k_m.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Asistente local siempre activo en hardware antiguo: el modelo cabe en 0,91 GB en q4_k_m y puede servirse con llama.cpp en una GPU de 4 GB manteniendo el footprint cerca de 1,5 GB de VRAM con caché KV cuantizada, lo que lo hace apto para equipos de gama baja.
- Asistente de dominio con trazabilidad de fuentes: al citar fuentes de su pack en el 46 % de las respuestas, encaja en escenarios donde el usuario necesita saber de dónde sale la afirmación, como documentación interna o bases de conocimiento acotadas.
- Refutación de premisas falsas en atención al usuario: con una puntuación de 0,971 en la acción `refute` del Candela Bench, es adecuado para flujos que deben corregir afirmaciones incorrectas del usuario en lugar de aceptarlas.
- Filtrado y derivación de consultas fuera de ámbito: su acción `confine` obtiene 0,907 en el Candela Bench, útil para asistentes que deben reconocer cuándo una pregunta queda fuera de su campo y derivarla.
- Despliegue en pipelines con tool calling: al soportar llamadas nativas a herramientas, puede integrarse en flujos automatizados que consulten APIs o servicios externos, aunque el harness de evaluación del autor no cubre esta dimensión.
- Asistente multilingüe IT/ES/EN en entornos con recursos limitados: el vocabulario podado a esos tres idiomas reduce el tamaño del modelo y lo orienta a aplicaciones europeas con estos idiomas como públicos objetivo.
- Prototipado e investigación sobre alineamiento en modelos pequeños: la publicación del benchmark Candela Bench, del scorer v0.2 y de la auditoría lo convierte en una referencia para estudiar comportamiento honesto en modelos de 2B.

## Benchmarks y rendimiento

Resultados publicados por el autor en el Faro bench y el Candela Bench:

| Prueba | Resultado |
|---|---|
| Faro bench (112 preguntas, 10 dominios) | 97/97/97 aciertos → 86,6 % |
| Sonda de ética (16 casos) | 16/16 en dos ejecuciones |
| Anti-hoax (12 casos) | 9/12 |
| Honesty Index (contenido) | 0,835 |
| Honesty Index (estricto) | 0,769 |

Desglose por acción en el Candela Bench (439 ítems, 6 módulos, IT/EN/ES):

| Acción | Puntuación |
|---|---|
| answer | 0,847 |
| refute | 0,971 |
| refuse | 0,973 |
| verify | 0,929 |
| ask | 0,721 |
| confine | 0,907 |
| comply | 0,176 |
| call | no aplicable en harness de solo texto |

El autor corrige en la model card los resultados de la v0.1: se habían medido con un presupuesto fijo de 2048 tokens que truncó 225 de 439 respuestas (51 %) y dejó 152 vacías, por lo que la puntuación de 0,405 medía el presupuesto y no el modelo. La remedición con presupuesto automático y scorer v0.2 sobre los mismos 439 ítems arroja los valores de la tabla. En la remedición, 29 respuestas alcanzaron el límite de contexto y 3 quedaron vacías.

Advertencia del propio autor: el Candela Bench es un benchmark propio, no una suite estándar, y las puntuaciones están influidas por su diseño. No se han publicado resultados en suites estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en una GPU de 4 GB usando caché KV cuantizada (`turbo4`/`turbo3_tcq`), según la model card.
- Tamaño del archivo: 0,91 GB en GGUF q4_k_m.
- Entrenamiento: realizado en una única RTX 2070 de 8 GB.
- GPU recomendadas: no se especifican modelos concretos; el autor apunta a hardware de consumo antiguo y menciona el escenario de 4 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4 GB de VRAM en la configuración indicada.
- Opciones de despliegue: llama.cpp (`llama-server`) y runtimes compatibles con GGUF; el autor menciona beellama/llama.cpp para las mediciones y el flag `--jinja` para aplicar la plantilla de chat.
- Configuración de servicio de referencia: `-c 8192 -ngl 99 -fa on --cache-type-k turbo4 --cache-type-v turbo3_tcq --jinja --reasoning-budget 0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Faro 2B | 1.448.902.464 (clase ~2B) | 262.144 | Apache 2.0 | GGUF q4_k_m, safetensors | Fine-tune de Qwen3.5-2B con receta Candela y ética en pesos |
| Qwen/Qwen3.5-2B | clase 2B | no disponible | no disponible | no disponible | Modelo base del que deriva Faro 2B |
| Alternativas de clase 2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La evaluación se realizó con un benchmark propio del autor (Faro bench y Candela Bench), no con una suite estándar, y las puntuaciones están influidas por su diseño.
- La acción `comply` es la más débil, con 0,176: el modelo rechaza peticiones benignas (una receta, una felicitación de cumpleaños, una traducción) alegando que no están en el pack. El autor lo reconoce como defecto real y objetivo de la siguiente ronda de entrenamiento.
- Las acciones `ask` (0,721) y `confine` (0,907 en la remedición, frente al 0,11 que el autor cita en la sección de fortalezas y debilidades) presentan debilidades reconocidas; el autor lista ambas como ejes a mejorar.
- No es un modelo generalista: su conocimiento de dominio procede de su knowledge pack y es de clase 2B.
- No debe usarse como autoridad en entornos de alto riesgo (médico, legal, financiero) sin verificación.
- Riesgo de alucinación inherente a un modelo de 2B; el entrenamiento constitucional no elimina el problema, solo modula el comportamiento.
- Limitación idiomática: solo italiano, español e inglés tras la poda de vocabulario; el resto de idiomas queda fuera por diseño.
- La plantilla de chat debe usarse tal cual viene en el GGUF; construir el prompt a mano degrada las respuestas.
- El razonamiento debe desactivarse en tiempo de servicio (`--reasoning-budget 0`) según la configuración recomendada.
- La acción `call` del Candela Bench no es evaluable en un harness de solo texto, por lo que el soporte de tool calling no está medido en ese benchmark.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B, no detalladas en la información disponible.
- El modelo tiene 23 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alforiva/faro-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Proyecto Progetto Siliceo: https://progettosiliceo.online
- Resultados interactivos del benchmark: https://progettosiliceo.online/faro.html
- Informe técnico (italiano): https://progettosiliceo.online/papers/paper-faro-v1-it.pdf
- Informe técnico (inglés): https://progettosiliceo.online/papers/paper-faro-v1.pdf
- Informe técnico (español): https://progettosiliceo.online/papers/paper-faro-v1-es.pdf
