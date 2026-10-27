# eltonsarmanho/qwen3-4b-questoes-matematica

## Resumen

`qwen3-4b-questoes-matematica` es un adaptador LoRA (QLoRA) sobre Qwen3-4B, publicado por el usuario eltonsarmanho, que genera preguntas de matemáticas de opción múltiple al estilo SAEB —la evaluación brasileña de educación básica— en portugués de Brasil y con salida JSON estructurada. No es un modelo completo: el repositorio contiene únicamente el adaptador (33.030.144 parámetros, r=16, alpha=32) y una versión GGUF F16 de 66 MB pensada para aplicarse en tiempo de ejecución sobre el `Qwen3-4B-Q4_K_M.gguf` oficial con `--lora` de llama.cpp, sin fichero fusionado.

El objetivo es que un docente pueda generar ítems y sus resoluciones en un PC o un móvil sin conexión ni API. La evaluación del autor es inusualmente honesta: en revisión ciega de un profesor de matemáticas, entre el 69 % y el 79 % de las preguntas generadas superan el criterio de validez nuclear (enunciado correcto, una única respuesta válida, datos suficientes), con un agregado del 71,6 % (214/299, IC95 66,2–76,4), por debajo del objetivo del 80 % fijado por el propio autor.

Es relevante por dos motivos: como ejemplo de fine-tune educativo con trazabilidad poco habitual (hashes SHA-256, manifiesto de entrenamiento, gramática GBNF y guion de evaluación incluidos) y como caso práctico de LoRA en GGUF para despliegue on-device. También sirve de recordatorio: la mejora medible frente a zero-shot está en el formato de salida, no en la corrección matemática juzgada por un docente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA, r=16, alpha=32, todas las proyecciones lineales) sobre un transformer decoder-only denso Qwen3-4B |
| Parámetros totales | 33.030.144 (solo adaptador); modelo base Qwen3-4B, aproximadamente 4.000 millones |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la determina el modelo base Qwen3-4B, no se especifica en la model card) |
| Tipos de cuantización | Base evaluada: Q4_K_M (GGUF). Adaptador: F16 en GGUF (66 MB) y FP32 en safetensors (132 MB). Entrenamiento: NF4 con bitsandbytes. La versión fusionada y recuantizada no fue evaluada |
| Idiomas soportados | pt (portugués de Brasil) |
| Licencia | apache-2.0 (la base de entrenamiento no se publica: licencia de reutilización sin resolver) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (adaptador F16 para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de rango 16 y alpha 32 aplicado sobre todas las proyecciones lineales de Qwen3-4B, entrenado con `SFTTrainer` de TRL sobre Unsloth a partir del checkpoint `unsloth/Qwen3-4B-unsloth-bnb-4bit` cuantizado en NF4. Se realizó un único entrenamiento con semilla 44 sobre `train_curado_v7b_fix1.jsonl`, con 2.846 ejemplos que cubren 79 pares año × habilidad. La salida se fuerza mediante una gramática GBNF (`app/questao.gbnf`) que restringe la decodificación a un JSON `{"questoes": [...]}` con enunciado, cinco alternativas (A–E), resolución paso a paso, clave de respuesta y nivel de dificultad.

La base de entrenamiento no es el banco SAEB en bruto, sino una base curada en ciclos de auditoría: 232 ítems reales del banco SAEB (sin imagen, alternativas A–D completas y clave válida), 444 de un lote de colaborador (solo unidad temática Números), 1.426 inyectados por agentes (generador `sabiá-4-thinking` con validador y revisor ciegos, más un segundo revisor Gemini), 610 destilados de un modelo profesor mayor filtrados por consistencia aritmética, 75 de refuerzo sintético de distractores construidos por regla y 59 sintéticos aritméticos con respuesta calculada en Python. La distribución por año es 1.º: 232, 2.º: 836, 3.º: 192, 4.º: 59, 5.º: 723, 9.º: 804; por dificultad, 1.094 fáciles, 903 moderados y 849 difíciles; la clave está balanceada entre las cinco letras (A 575, B 576, C 591, D 573, E 531). El 90 % de los ejemplos (2.560 de 2.846) incluye un sufijo de diversidad con subtema, tipo de razonamiento y contexto, para que la aplicación pueda variar el tipo de pregunta. Como control de calidad, una muestra ciega de 48 ítems de la propia base dio 47/48 (97,9 %, IC95 89–99,6) en el criterio de núcleo.

## Capacidades

- Generación de ítems de matemáticas de opción múltiple en portugués de Brasil con cinco alternativas (A–E), resolución desarrollada, clave de respuesta y etiqueta de dificultad.
- Salida JSON estrictamente estructurada gracias a decodificación restringida por gramática GBNF incluida en el repositorio (`app/questao.gbnf`).
- Control de diversidad mediante sufijo de prompt (subtema, tipo de razonamiento y contexto) y taxonomía de subtemas (`taxonomia_subtemas.json`).
- Funcionamiento completamente offline y on-device (sin API ni conexión), sobre llama.cpp.
- Cobertura de los años 1.º, 2.º, 3.º, 4.º, 5.º y 9.º de educación básica, con especial densidad en 2.º y 9.º.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso autónomo más allá de la resolución incluida en cada ítem generado.
- Sin capacidades de visión, audio ni multimodalidad.
- Sin modo "thinking" verificado en la información proporcionada.
- Capacidad multilingüe no documentada: el modelo está entrenado y etiquetado únicamente para `pt`.

## Casos de uso

- Generación de ítems para simulacros SAEB en centros educativos sin conectividad: el par base Q4_K_M + adaptador (2,5 GB + 66 MB) se ejecuta en un PC de aula con `llama-server --lora`, produciendo un JSON que el sistema del centro puede validar y volcar directamente a la hoja de ejercicios.
- Herramienta de apoyo al docente en escritorio: la aplicación de ejemplo (`app/cliente_llama_server.py`) envía el sufijo de diversidad (subtema, tipo de razonamiento, contexto) para obtener variantes de una misma habilidad, reduciendo el trabajo de redacción; el profesor revisa y corrige antes de publicar.
- Generación de distractores plausibles: los ítems incluyen alternativas incorrectas construidas para reflejar errores típicos, útiles para plataformas de práctica adaptativa que necesitan bancos de opciones, no solo la respuesta correcta.
- Aplicación móvil o de escritorio para docentes: el tamaño del adaptador (66 MB en GGUF) permite distribuirlo como actualización pequeña sobre una instalación de Qwen3-4B ya existente, sin reenviar los pesos base.
- Aumento de datos para investigación educativa: generar corpus sintéticos de preguntas para entrenar clasificadores de dificultad o modelos de corrección automática, siempre con revisión humana dado el 71,6 % de validez medida.
- Retroalimentación formativa: la salida incluye la resolución paso a paso, reutilizable como explicación de la respuesta en plataformas de estudio, con la advertencia de que el 2,2 % de los ítems de la base tiene la clave igual a un paso intermedio.
- Plantilla de fine-tuning para otras materias o currículos: el repositorio documenta método, hiperparámetros, gramática y guion de evaluación, y sirve como esqueleto reproducible para adaptar Qwen3-4B a otra taxonomía educativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación publicada es una revisión ciega por parte de un profesor de matemáticas sobre el criterio de "validez nuclear" de las preguntas generadas:

| Evaluación | Muestra | Resultado | Intervalo de confianza (95 %) |
|---|---|---|---|
| Validez nuclear, ítems generados (agregado) | 299 | 71,6 % (214/299) | 66,2–76,4 |
| Validez nuclear, rango por subconjunto | no disponible | 69 % – 79 % | no disponible |
| Validez nuclear, muestra ciega de la base de entrenamiento | 48 | 97,9 % (47/48) | 89–99,6 |

El autor indica explícitamente que la mejora medible frente a zero-shot se concentra en el formato de salida (JSON válido y estructura completa), no en la corrección matemática juzgada por el docente.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB con la base Q4_K_M (2,5 GB de pesos) más el adaptador (66 MB) y una ventana de contexto moderada; cifra estimada, no publicada por el autor. En F16 la base rondaría los 8 GB, también como estimación.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para Q4_K_M; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, con Q4_K_M en tarjetas de gama de entrada y media (4–8 GB). También es viable en CPU y en dispositivos móviles, según el enfoque on-device declarado por el autor.
- Opciones de despliegue: llama.cpp es la única ruta evaluada, cargando el adaptador con `--lora` sobre el GGUF base y aplicando la gramática `questao.gbnf`. El adaptador PEFT en safetensors puede cargarse con transformers/vLLM, pero no se ha evaluado en esa configuración. Ollama u otros runners no aparecen evaluados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisito de versión: la gramática y el system prompt deben ser los de `app/` (versión v7b); otras versiones del modelo usan otra gramática.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA v7b) | 33 M de adaptador sobre ~4 B | no disponible | 71,6 % de validez nuclear según docente (214/299) | apache-2.0 | HuggingFace y GitHub del autor |
| Qwen3-4B zero-shot (mismo base, sin adaptador) | ~4 B | no disponible | Formato de salida menos fiable según el autor; sin cifra de validez publicada | apache-2.0 | HuggingFace (Qwen) |
| Qwen3-4B Q4_K_M sin adaptador | ~4 B | no disponible | No comparable: no genera el JSON estructurado de forma consistente | apache-2.0 | HuggingFace (Qwen/Qwen3-4B-GGUF) |
| felhen-ai/saracura-ptbr-4b | ~4 B | no disponible | no disponible (clasificación de texto, no generación de ítems) | no disponible | HuggingFace |

## Limitaciones y advertencias

- No alcanza el objetivo declarado del 80 % de preguntas válidas: con un 71,6 % agregado, toda pregunta generada requiere revisión humana antes de usarse en evaluación real.
- Sesgo de formato conocido: la alternativa E "Nenhuma das alternativas anteriores" aparece en el 23 % de los ítems de la base, herencia del banco original.
- 66 ítems de la base (2,2 %) tienen la clave de respuesta igual a un paso intermedio de la resolución, sin revisión manual pendiente.
- Desequilibrio por año: el 4.º año cuenta con solo 59 ejemplos, por lo que la calidad en ese curso es previsiblemente inferior.
- Monolingüe y monodominio: solo portugués de Brasil y solo matemáticas; no hay evidencia de generalización a otras materias ni a portugués europeo.
- Riesgo de alucinación aritmética: el modelo puede producir un enunciado coherente con una clave incorrecta; el criterio de validez no cubre errores sutiles de planteamiento.
- Reproducibilidad limitada: la base de entrenamiento no se publica porque la licencia de reutilización de los ítems del banco y de los textos generados por modelos de terceros no está resuelta. Solo se publican hash SHA-256 y composición para poder recrearla desde el código.
- La licencia apache-2.0 cubre el adaptador, pero no aclara la situación de los datos derivados; conviene revisar el uso comercial de los ítems generados a partir del banco SAEB.
- La versión fusionada y recuantizada no fue evaluada: todos los números se refieren al par "base Q4_K_M + adaptador en tiempo de ejecución", y mezclar versiones de gramática o system prompt invalida los resultados.
- Validación externa muy limitada: 15 descargas y 0 likes en el momento de la ficha, y una única revisión por un profesor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eltonsarmanho/qwen3-4b-questoes-matematica
- Código, datos y informes: https://github.com/eltonsarmanho/TreinamentoModeloQuestoes
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- GGUF base necesario (`Qwen3-4B-Q4_K_M.gguf`): https://huggingface.co/Qwen/Qwen3-4B-GGUF
- No se han encontrado otros enlaces relevantes sobre este modelo en la búsqueda web.
