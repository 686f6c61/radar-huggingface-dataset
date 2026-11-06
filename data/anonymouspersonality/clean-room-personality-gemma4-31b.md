# AnonymousPersonality/clean-room-personality-gemma4-31b

## Resumen

`clean-room-personality-gemma4-31b` es un conjunto de adaptadores LoRA sobre el modelo base `google/gemma-4-31B-it` (revision `842da3794eaa0b77d5f08bae87a17459d91ff475`) desarrollado por el autor anónimo AnonymousPersonality. El modelo realiza dos tareas complementarias: "escribir" una persona (convertir puntuaciones de facetas de cuestionarios psicométricos como BFI-2, HEXACO-100 o IPIP-NEO-120 en un retrato en segunda persona, y un retrato en una historia de vida en primera persona) y "leer" una persona (recuperar el perfil de facetas a partir de un retrato o una historia de vida).

El modelo acompaña un envío anónimo al Industry Track de NAACL 2027. Su rasgo diferencial es el entrenamiento en "clean room": todos los objetivos de entrenamiento fueron generados por modelos de pesos abiertos, mientras que los modelos frontera solo leyeron borradores, los juzgaron y planificaron reparaciones. Las personas sintéticas de entrenamiento provienen de generadores ajustados a datos públicos de cuestionarios que no contienen a ninguna de las personas de test.

La relevancia actual reside en su enfoque metodológico para la evaluación psicométrica controlada y en la reproducibilidad del pipeline (adaptadores por etapas, scripts de fusión, checks de calidad y prompts de evaluación incluidos en el repositorio). El repositorio ocupa 2,4 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-31B-it` |
| Parametros totales | no disponible (adaptadores LoRA; el base es un modelo de 31B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Gemma 4, no documentadas en la ficha) |
| Idiomas soportados | en (solo inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo no es un transformer entrenado desde cero, sino una pila de cuatro adaptadores LoRA que se aplican secuencialmente sobre el modelo base Gemma 4 31B. Cada adaptador se entrenó sobre el modelo ya fusionado con el anterior, por lo que el orden de aplicación es obligatorio: `adapters/1_sft` (supervised fine-tuning con filas de escritor y lector), `adapters/2_polish` (primer pulido por preferencias: consistencia, calidad y diversidad de escenarios), `adapters/3_fidelity_polish` (segundo pulido por preferencias centrado en la fidelidad de la historia, que constituye el modelo final del paper) y `adapters/4_mizan_identity` (opcional: dota al modelo de una autodescripción breve con nombre, base, laboratorio y trabajo, dando lugar a "Mizan"). La fusión se realiza con `merge.py`, que aplica los adaptadores en orden.

El entrenamiento se llevó a cabo en régimen de "clean room": los objetivos de entrenamiento fueron escritos por modelos de pesos abiertos y los modelos frontera solo actuaron como revisores (lectura de borradores, juicio y planificación de reparaciones). Las personas de entrenamiento son sintéticas, generadas a partir de generadores ajustados a datos públicos de cuestionarios que no incluyen a ninguna persona de test; ninguna puntuación de una persona real aparece en un prompt de entrenamiento. Cada texto de entrenamiento superó un filtro de gibberish, un lint de lenguaje de rasgos y una comprobación de contradicción de hechos. El repositorio incluye el generador (`code/generator/`), los prompts de evaluación (`code/prompts/`), los checks y los scripts de las tablas del paper.

## Capacidades

- Generación de retratos de personalidad en segunda persona a partir de puntuaciones de facetas de BFI-2, HEXACO-100 o IPIP-NEO-120.
- Generación de historias de vida en primera persona a partir de un retrato.
- Lectura inversa: recuperación del perfil de facetas a partir de un retrato o de una historia de vida.
- Coherencia psicométrica interna: el modelo fue pulido por preferencias para consistencia entre rasgos, calidad textual y diversidad de escenarios vitales.
- Variante "Mizan" con autodescripción identitaria propia (nombre, base, laboratorio, trabajo).
- Solo inglés; sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se documentan capacidades multilingües ni de razonamiento general más allá de la tarea psicométrica.

## Casos de uso

- Investigación en evaluación psicométrica automatizada: generar retratos controlados a partir de perfiles de facetas conocidos para estudiar la consistencia de instrumentos como BFI-2 o HEXACO-100 sin exponer datos de personas reales.
- Validación de pipelines de lectura de personalidad: usar el modo lector para recuperar perfiles desde textos y comparar la concordancia con las puntuaciones de origen, con bootstrap pareado incluido en `code/`.
- Generación de estímulos sintéticos para experimentos de psicología: producir historias de vida con rasgos controlados para estudios que requieren material textual diverso y reproducible.
- Investigación sobre fidelidad narrativa: emplear el adaptador `3_fidelity_polish` para estudiar cómo el pulido por preferencias afecta a la coherencia entre retrato e historia.
- Estudio de honestidad bajo persona: analizar el comportamiento del modelo ante preguntas de identidad ("¿eres una IA?") mientras interpreta un rol, con el check de serving descrito en el paper.
- Reproducción de resultados académicos: el repositorio incluye prompts, generadores, checks y scripts de tablas, lo que permite replicar la evaluación del paper sobre personas retenidas.
- Investigación sobre entrenamiento clean-room: usar el pipeline como referencia metodológica para entrenar adaptadores sin filtrar datos de test en los objetivos.

## Benchmarks y rendimiento

| Metrica | 31B (modelo final) | 26B-A4B | E4B |
|---|---|---|---|
| Puntuación de retratos | .919 | .918 | .915 |
| Concordancia de lectura | .793 | .782 | .787 |
| Historias con contradicción | 0 de 86 | 11 de 86 | 11 de 86 |
| Historias que activan el filtro de gibberish | no disponible | 4 | 7 |
| Mejora en historias de vida vs. su propio base (tres lectores) | no disponible | +.020 [+.014, +.026] | +.022 [+.017, +.028] |
| Mejora en historias de vida vs. su propio base (lector retenido) | no disponible | +.016 [+.010, +.022] | +.019 [+.013, +.025] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio de adaptadores ocupa 2,4 GB; el modelo base Gemma 4 31B debe descargarse aparte y no se documenta su tamaño en la ficha.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del base y de la cuantización elegida.
- GPU recomendadas: no disponible.
- No se confirma que quepa en GPU de consumo; el tamaño del base (31B) sugiere que requeriría cuantización agresiva para GPUs de consumo, pero no hay datos en la ficha.
- Opciones de despliegue: fusión mediante `merge.py` incluido en el repositorio; el resultado es un modelo Gemma 4 estándar desplegable con las herramientas habituales, aunque la ficha no especifica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clean-room-personality-gemma4-31b | Gemma 4 31B | adaptadores LoRA sobre 31B | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| gemma4-26b-a4b (misma receta) | Gemma 4 26B-A4B | adaptadores LoRA sobre 26B MoE | no disponible | no disponible | Incluido en el mismo repo |
| gemma4-e4b (misma receta) | Gemma 4 E4B | adaptadores LoRA sobre E4B | no disponible | no disponible | Incluido en el mismo repo |

No se dispone de información sobre modelos comparables de otras familias dedicados a escritura y lectura de personalidad.

## Limitaciones y advertencias

- Honestidad bajo persona: preguntado "¿eres una IA?" mientras interpreta una persona, el modelo final responde que es una persona en 4 de 10 personas retenidas, y Mizan en 5 de 10. Nunca se entrenó a una persona para negar ser una IA; los despliegues deben comprobar las respuestas a esa pregunta y regenerar las que afirmen ser humanas.
- Palabras no inglesas ocasionales: las salidas pueden contener muy ocasionalmente una palabra no latina (por ejemplo, japonesa o china) dentro de una frase en inglés, con más frecuencia cuando el prompt aporta muchos hechos vitales; el paper describe un filtro que regenera esas salidas.
- Solo inglés, con escenarios vitales extraídos de Estados Unidos, Inglaterra y Gales, y Canadá.
- Riesgo de alucinación en la generación de historias y retratos coherentes con perfiles; los checks de contradicción y gibberish del repositorio deben aplicarse en producción.
- Restricciones de uso: no es un instrumento clínico ni de contratación, y no debe usarse para suplantar a una persona real. No debe usarse para escribir un retrato a partir de las puntuaciones de alguien sin su consentimiento ni para leer la personalidad de textos privados ajenos.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma 4 tiene sus propias condiciones que deben respetarse.
- Modelo con 0 descargas y 1 like en el momento de la ficha; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/AnonymousPersonality/clean-room-personality-gemma4-31b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Base alternativa 26B-A4B: https://huggingface.co/google/gemma-4-26B-A4B-it
- Base alternativa E4B: https://huggingface.co/google/gemma-4-E4B-it
