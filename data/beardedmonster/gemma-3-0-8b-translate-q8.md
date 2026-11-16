# BeardedMonster/gemma-3-0.8b-translate-Q8

## Resumen

`BeardedMonster/gemma-3-0.8b-translate-Q8` es un modelo de traducción inglés a lenguas africanas derivado de Gemma 3 (arquitectura Gemma-3-1B-it) mediante un proceso de *vocabulary pruning* y cuantización FP8 E4M3. Lo publica BeardedMonster (Jeffrey Otoibhi, Aletheia AI) como parte de la familia SabiYarn, y su propósito es cubrir la traducción automática hacia un conjunto muy amplio de lenguas africanas, muchas de ellas con recursos digitales escasos.

El modelo parte de `BeardedMonster/gemma-3-1b-translate-best`, un ajuste fino con SFT y RL (GRPO) del Gemma-3-1B-it, al que se le recorta el vocabulario de 262.144 a 111.964 tokens (con cierre de merges BPE y conservación de los 256 tokens de byte) y se le aplica cuantización FP8 con escala de pesos por tensor y escala de activaciones dinámica. El resultado son 826.878.592 parámetros (unos 0,83B) y aproximadamente 0,96 GB de pesos.

Es relevante porque demuestra que un modelo de menos de mil millones de parámetros puede cubrir 125 etiquetas de lengua africana (105 con datos de SFT) manteniendo la calidad del padre sin cuantizar: en su evaluación interna de 500 frases y 20 lenguas, el chrF++ macro por lengua es 40,73, idéntico al del modelo fp32. La contrapartida es una dependencia estricta de vLLM y un tokenizador propio incompatible con el del Gemma original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3-1B-it), con vocabulario podado |
| Parametros totales | 826.878.592 (aprox. 0,83B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantizacion | FP8 E4M3 (escala de pesos por tensor, escala de activaciones dinamica) |
| Idiomas soportados | Ingles como origen; 125 etiquetas de lengua africana como destino (105 con datos de SFT, 20 sin ellos) |
| Licencia | `sabiyarn-commercial-use-with-attribution` (uso comercial con atribucion obligatoria; se aplican tambien los Gemma Terms of Use) |
| Formato de pesos | safetensors (FP8), libreria vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura decoder-only de Gemma 3 en su variante de 1B (Gemma-3-1B-it). Sobre esa base, el autor aplica dos transformaciones encadenadas. Primero, una poda de vocabulario de 262.144 a 111.964 tokens con cierre de merges: se conserva cada token cuyo componente BPE se mantiene y se preservan los 256 tokens de byte, de modo que cualquier texto sigue siendo codificable. Las 125 etiquetas de lengua (`<yor>`, `<hau>`, etc.) permanecen como tokens únicos, y los identificadores se renumeran por completo, por lo que el mapa `vocab_keep_ids.json` es imprescindible para relacionar los nuevos ids con los originales de Gemma 3.

El ajuste del modelo padre combina SFT sobre pares inglés-lengua africana con una fase final de RL mediante GRPO. La cuantización posterior es FP8 E4M3 con escala de pesos por tensor y escala de activaciones dinámica, declarada en `config.json` con `quant_method: fp8`, de forma que vLLM la detecta sin argumentos adicionales. La innovación técnica destacable no es arquitectónica sino de eficiencia: reducir el vocabulario y cuantizar a FP8 permite servir un traductor multilingüe de 125 lenguas en menos de 1 GB de pesos sin pérdida medible de chrF++ respecto al padre fp32.

## Capacidades

- Traducción unidireccional de inglés a lenguas africanas: 125 etiquetas de lengua, 105 de ellas con datos de ajuste supervisado.
- Salida estructurada: el modelo emite primero la etiqueta de lengua como un único token y después la traducción, terminando en `<end_of_turn>` (id 106).
- Cobertura de lenguas de gran difusión (yoruba, hausa, igbo, suajili, zulú, xhosa, amárico, somalí, afrikáans) y de lenguas con muchos menos recursos (ewe, fon, wolof, bambara, tiv, umbundu, kamba, luo, kanuri, dogon, etc.).
- Manejo de frases sueltas y párrafos cortos por prompt; el autor recomienda dividir documentos largos en frases.
- Decodificación greedy recomendada (`temperature=0`), con `frequency_penalty=0.1` opcional como protección contra bucles de repetición en entradas largas.
- No soporta tool calling, function calling, agentes, visión ni audio según la información disponible; es un modelo especializado exclusivamente en traducción.

## Casos de uso

- Traducción de documentación técnica y guías de producto al suajili, hausa o yoruba: al ser un modelo de 0,83B y menos de 1 GB, se puede desplegar en el mismo nodo que el servicio de documentación y traducir párrafo a párrafo con llamadas por frase.
- Localización de interfaces y cadenas de UI para mercados africanos: la salida con etiqueta de lengua permite enrutar y validar automáticamente el idioma destino, y el coste por token es mínimo al tener un vocabulario podado de 111.964 entradas.
- Atención al cliente multilingüe en países con varias lenguas oficiales: se puede integrar como paso previo de traducción en un pipeline donde un LLM mayor razona en inglés y este modelo produce la respuesta en la lengua del usuario (yoruba, igbo, pcm, twi, etc.).
- Traducción de contenidos educativos y sanitarios a lenguas de bajos recursos (ewe, fon, wolof, bambara, tiv): el modelo cubre lenguas que los traductores comerciales suelen omitir, y el requisito de atribución es compatible con proyectos de ONG y publicaciones.
- Procesamiento por lotes de corpus: vLLM permite enviar en una sola llamada un lote con la misma frase en cinco lenguas distintas, lo que abarata la generación de corpus paralelos para investigación lingüística.
- Subtitulado y transcripción traducida: al aceptar frases cortas con `max_new_tokens=256`, encaja en un pipeline que segmenta audio transcrito en inglés y traduce cada segmento a la lengua destino antes de recomponer los subtítulos.
- Sistemas de mensajería y notificaciones personalizadas: la latencia baja esperable de un modelo de 0,83B en FP8 sobre GPU Hopper/Ada/Blackwell permite traducir notificaciones en tiempo real sin depender de APIs externas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| chrF++ macro por lengua (500 frases, 20 lenguas, referencias) | 40,73 |
| chrF++ del padre fp32 sin cuantizar (misma evaluacion) | 40,73 |
| Rango de variantes FP8 evaluadas | 40,73 a 41,00 |
| Salidas greedy que difieren en redaccion del fp32 | 86% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU) en la información disponible. La única métrica reportada es la evaluación interna de traducción descrita en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB solo para pesos FP8; con overhead de KV cache y runtime de vLLM, un espacio de trabajo de 4-8 GB es holgado para contexto de 4.096 tokens.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probada por el autor con vLLM 0.32.0); el objetivo son GPU con soporte FP8, es decir, Hopper (H100), Ada (L40S, RTX 4090) y Blackwell. Otras GPU no fueron probadas.
- Cabe en GPU de consumo con soporte FP8 (por ejemplo, RTX 4090); en GPU sin FP8 nativo no hay soporte declarado.
- Opciones de despliegue: exclusivamente vLLM (la cuantización se lee de `config.json` con `quant_method: fp8`). Transformers no puede cargar estos pesos; para ese runtime hay que usar el padre `BeardedMonster/gemma-3-1b-translate-best` en bf16 o fp32. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Runtime |
|---|---|---|---|---|---|
| gemma-3-0.8b-translate-Q8 | 826,9M | no disponible (ejemplo con 4.096) | Traduccion EN a 125 lenguas africanas, FP8 | SabiYarn con atribucion + Gemma Terms | vLLM |
| gemma-3-1b-translate-best (padre) | aprox. 1,0B | no disponible | Misma tarea, vocabulario original, bf16/fp32 | SabiYarn con atribucion + Gemma Terms | vLLM y Transformers |
| Gemma-3-1B-it (base de Google) | aprox. 1,0B | no disponible | Modelo generalista instruido, sin especializacion en lenguas africanas | Gemma Terms of Use | Multiples |

No se dispone de datos de benchmarks comparativos frente a otros traductores especializados en lenguas africanas en la información proporcionada.

## Limitaciones y advertencias

- Traducción unidireccional: solo inglés como origen; no se declara soporte para traducir entre lenguas africanas ni hacia el inglés.
- Veinte de las 125 etiquetas de lengua no tienen datos de SFT, por lo que su calidad es previsiblemente inferior y no está medida.
- El tokenizador es propio y los ids no coinciden con los de Gemma 3: mezclar tokenizadores o reutilizar ids del padre produce resultados incorrectos.
- Requiere vLLM; Transformers no puede cargar los tensores FP8 con `weight_scale`. No hay soporte declarado para llama.cpp, Ollama o TGI.
- El prompt debe seguir el formato exacto de entrenamiento, con dos espacios tras los dos puntos y el nombre de la lengua (no el código ISO); desviarse de ese formato degrada la salida.
- Recomendado greedy; el muestreo no está validado y puede introducir derivas en lenguas de bajos recursos.
- Riesgo de bucles de repetición en entradas largas, mitigado solo parcialmente con `frequency_penalty=0.1`; el autor recomienda segmentar documentos en frases.
- Licencia de uso comercial con atribución obligatoria a "SabiYarn translation models by Jeffrey Otoibhi (Aletheia AI)" y cita del paper en preparación; además se aplican los Gemma Terms of Use y la Prohibited Use Policy de Google, lo que impone restricciones adicionales al uso comercial.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez fuera de la métrica chrF++ interna; la evaluación se limita a 500 frases y 20 lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-0.8b-translate-Q8
- Modelo padre (bf16/fp32, compatible con Transformers): https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Licencia del modelo: https://huggingface.co/BeardedMonster/gemma-3-0.8b-translate-Q8/blob/main/LICENSE.md
- Gemma Terms of Use y Prohibited Use Policy: https://ai.google.dev/gemma/terms
- Paper del autor: en preparación, sin enlace disponible en la información proporcionada.
