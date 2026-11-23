# BeardedMonster/gemma-3-1b-csw-sft

## Resumen

`gemma-3-1b-csw-sft` es un ajuste fino supervisado (SFT) del modelo `google/gemma-3-1b-it` desarrollado por el usuario BeardedMonster (bajo la marca AletheiaAING). Está especializado en dos tareas concretas sobre texto en 37 lenguas africanas: *code-switching* (alternancia de lenguas dentro de una misma frase, tal como hablan los hablantes reales) y reescritura idiomática (conversión de texto plano en lenguaje coloquial rico en expresiones, refranes y comparaciones). El modelo parte de la arquitectura Gemma 3 de texto, con aproximadamente 1.000 millones de parámetros (999.885.952 según los pesos en safetensors) y una ventana de contexto heredada del modelo base.

Su relevancia radica en la escasez de herramientas específicas para el multilingüismo real de África subsahariana, donde la mezcla de lenguas es la norma y no la excepción. El modelo no traduce: transforma texto inglés o monolingüe en variantes code-switched o idiomáticas, y produce además un bloque `<dev>` que etiqueta los segmentos alternados, lo que lo hace útil para generar datos de entrenamiento y evaluación de otros sistemas (ASR, TTS, detección de cambio de código, chatbots).

Esta es la versión "supervised-only" de la familia; el propio autor recomienda `gemma-3-1b-csw-best` para la mayoría de usos, ya que esta variante rompe el formato de salida con más frecuencia (92 % de salidas válidas frente a 97 % o más de la mejor versión).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de `google/gemma-3-1b-it`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (BF16/F16 presumiblemente) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas; el prompt admite inglés como lengua de entrada) |
| Licencia | other (uso comercial y no comercial libre con atribucion a "AletheiaAING"; se aplican ademas los Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint instructivo `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 orientado a texto. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset de SFT ni si se aplicaron etapas de RLHF o DPO; el autor lo describe explícitamente como "supervised-only", lo que sugiere ausencia de optimización por preferencias.

La innovación principal no está en la arquitectura sino en la interfaz de tareas: el modelo se controla mediante un prompt de formato rígido `<task> [+<switch>]:  TEXT`, con etiquetas de tres letras entre ángulos (`<yor>`, `<eng>`, etc.), dos espacios tras los dos puntos y sin system prompt. Las tareas son `hm` (code-switching), `ood` (reescritura idiomática) y sus combinaciones (`eng_hm`, `m_hm`, `eng_ood`, `m_ood`, `hm_ood`). La salida sigue el patrón `[<switch>]<dev>frase uno | frase dos</dev> texto`, donde el bloque `<dev>` actúa como anotación de los segmentos alternados o modismos empleados. El vocabulario es completo (no truncado), a diferencia de otras variantes de la familia.

## Capacidades

- Generación de texto conversacional e instruccional en 37 lenguas africanas.
- Code-switching controlado: inserción de frases de una lengua secundaria (p. ej. inglés) dentro de texto en una lengua base, con selección explícita del par de lenguas.
- Reescritura idiomática: transformación de texto plano en registro coloquial con refranes, comparaciones y expresiones nativas.
- Anotación de segmentos: el bloque `<dev>` etiqueta las frases alternadas o los modismos usados, útil para generar datos etiquetados.
- Conversión de texto inglés a lengua base con mezcla (`eng_hm`, `eng_ood`).
- Reescritura idiomática preservando el code-switching existente (`hm_ood`).
- No realiza traducción simple; el autor lo desaconseja explícitamente para esa tarea.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Generación de datos de chat code-switched: tomar datasets de instrucciones en inglés o monolingües y convertirlos con `eng_hm`/`m_hm` en variantes mezcladas, para entrenar chatbots que respondan a la forma real de escribir de los usuarios.
- Construcción de corpus para ASR y TTS: generar frases code-switched para guiones de grabación y listas de palabras con segmentos alternados, grabando después con hablantes nativos y revisando el texto.
- Pruebas de robustez de sistemas NLP: crear entradas mixtas para evaluar cómo responden chatbots, traductores, detectores de idioma o modelos de NER y análisis de sentimiento ante el cambio de código.
- Detección de code-switching: aprovechar el bloque `<dev>` como anotación de spans para entrenar o evaluar detectores de alternancia de lenguas.
- Copy y diálogo con tono natural: reescribir textos planos con `ood` para relatos, diálogos de videojuegos, publicaciones en redes o copy publicitario, con revisión posterior por un hablante nativo.
- Enseñanza de lenguas: mostrar a estudiantes cómo los hablantes mezclan lenguas y qué expresiones idiomáticas emplean, a partir de pares de entrada/salida generados.
- Aumento de datos para modelos propios: muestrear múltiples salidas por prompt (o aplicar MBR para seleccionar la mejor) y filtrarlas antes de incorporarlas a un pipeline de entrenamiento.

## Benchmarks y rendimiento

El autor reporta una única métrica en la model card: chrF++ "aproximadamente igual" al de la mejor variante de la familia, pero con una tasa de validez de formato del 92 % en salidas de code-switching, frente al 97 % o más de `gemma-3-1b-csw-best`. No se publican valores numéricos de chrF++, MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

| Metrica | Este modelo | gemma-3-1b-csw-best |
|---|---|---|
| chrF++ | aproximadamente igual a la mejor variante (sin cifra) | referencia de la familia (sin cifra) |
| Salidas con formato valido (code-switching) | 92 % | 97 % o más |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en BF16/F16 para los pesos (1.000 millones de parámetros), más overhead de activaciones y KV cache; en cuantización de 8 bits cabe en torno a 1,2-1,5 GB y en 4 bits alrededor de 0,7-1 GB (estimaciones a partir del recuento de parámetros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; para despliegue con concurrencia, A100 o H100 aportan margen de throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos 4 GB de VRAM; también en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers. Es imprescindible usar el tokenizer del repositorio y respetar el formato exacto del prompt (etiquetas entre ángulos, dos espacios tras los dos puntos, sin system prompt).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BeardedMonster/gemma-3-1b-csw-sft` | 999.885.952 | no disponible | Code-switching e idiomas en 37 lenguas africanas | other (atribucion + Gemma Terms) | Hugging Face |
| `BeardedMonster/gemma-3-1b-csw-best` | no disponible (misma familia, 1B) | no disponible | Igual, con mayor validez de formato (97 %+) | other (atribucion + Gemma Terms) | Hugging Face |
| `google/gemma-3-1b-it` | 1B | no disponible en la informacion proporcionada | Modelo instructivo generalista multilingue | Gemma Terms of Use | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de la tasa de validez de formato citada por el autor.

## Limitaciones y advertencias

- Tasa de formato inválido del 8 % en code-switching: si falta el bloque `<dev>`, la salida debe descartarse y volver a muestrear; el autor recomienda `gemma-3-1b-csw-best` para la mayoría de usos.
- El modelo no traduce; usarlo para traducción produce resultados fuera de su dominio de entrenamiento.
- Todo el texto generado es sintético: debe filtrarse y revisarse por hablantes nativos antes de usarlo en producción, datasets publicados o grabaciones.
- Riesgo de alucinación en expresiones idiomáticas y refranes: puede generar modismos plausibles pero inexistentes o mal atribuidos.
- Restricciones de licencia: uso comercial permitido con atribución obligatoria a "AletheiaAING" y cumplimiento adicional de los Gemma Terms of Use; es necesario conservar el aviso de licencia.
- El prompt es extremadamente sensible al formato (etiquetas de tres letras, dos espacios tras los dos puntos, ausencia de system prompt); desviarse degrada la validez de la salida.
- Solo se documentan 37 lenguas africanas y el inglés como lengua de entrada; no hay soporte declarado para otras lenguas.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-sft
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Variante recomendada por el autor: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-best
- Perfil del autor/organizacion: https://huggingface.co/AletheiaAING
- Terminos de uso de Gemma: no disponible en la informacion proporcionada (referenciados en la model card)
