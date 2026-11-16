# Funmula/0c-sequence-d512

## Resumen

0c-sequence-d512 es un modelo neuronal de reranking de candidatos para un método de entrada (IME) de chino tradicional basado en zhuyin (bopomofo), desarrollado por Funmula. No es un modelo generativo de propósito general: recibe un contexto previo confirmado (hasta 64 caracteres), una secuencia de lecturas zhuyin y un conjunto de candidatos ya propuestos por un motor de IME, y calcula log P(candidato | contexto, lectura) para reordenar o sobrescribir la elección por defecto del motor. El modelo no genera candidatos por sí mismo; requiere una fuente externa de candidatos.

Arquitectura: decoder Transformer causal dedicado, 8 capas, dimensión oculta 512, 8 cabezas de atención y FFN de 768. Se preentrenó desde inicialización aleatoria, se continuó preentrenando con tareas de lectura con tono opcional y finalmente se afinó para el ranking de candidatos. El vocabulario cubre 27.857 caracteres y 416 bases zhuyin. Se distribuye en formato ONNX (opset 18) para inferencia en CPU, con una variante cuantizada a 4 bits.

Su relevancia es acotada pero específica: resuelve el problema de desambiguación homofónica en IME zhuyin, incluyendo el caso en que el usuario no escribe tonos o los escribe de forma parcial. El tamaño del repositorio es de 0,3 GB y la descarga principal ronda los 130 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal dedicado (8 capas, hidden 512, 8 cabezas, FFN 768) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 caracteres de contexto previo confirmado |
| Tipos de cuantizacion | FP (modelo base) y 4-bit (carpeta `q4/`) |
| Idiomas soportados | zh (chino tradicional, con lecturas zhuyin/bopomofo) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18), con `model.onnx`, `vocab.json` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo es un decoder Transformer causal con 8 capas, dimensión oculta 512, 8 cabezas de atención y FFN de 768. El entrenamiento se realizó en tres fases según la model card: preentrenamiento desde inicialización aleatoria, preentrenamiento adicional sobre texto con tareas de lectura con tono opcional, y ajuste fino específico para el ranking de candidatos. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

La innovación técnica principal es el tratamiento opcional del tono: cada sílaba puede llevar su marca tonal, omitirla (tono desconocido) o mezclar ambos casos dentro de una misma lectura. Sin marca tonal, la sílaba se interpreta como primer tono; el sufijo `?` (o la función `toneless()`) marca un tono no escrito. El modelo incorpora además tolerancia al tono neutro en partículas finales mediante la lista `neutral_tolerant_last` del manifiesto. La inferencia se ejecuta en CPU mediante ONNX Runtime con `CPUExecutionProvider`.

## Capacidades

- Puntuación de candidatos: calcula log P(candidato | contexto, lectura) para candidatos ya proporcionados.
- Reranking de candidatos homófonos: ordena candidatos según la puntuación del modelo mediante `rank()`.
- Combinación con motor de IME: `choose()` fusiona puntuaciones del motor y del modelo, sobrescribiendo el candidato por defecto solo si se alcanza el margen configurado (`margin`).
- Lectura con tono opcional: soporta entrada con tono completo, sin tono y parcialmente tonal.
- Tolerancia de tono neutro en partículas finales.
- Contexto de hasta 64 caracteres previos confirmados.
- No genera candidatos: requiere una fuente externa de candidatos.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al chino tradicional con lecturas zhuyin.

## Casos de uso

- Desambiguación homofónica en IME zhuyin: integrado en el motor de entrada, reordena los candidatos homófonos para el contexto dado y selecciona el más probable, reduciendo la corrección manual del usuario.
- Escritura sin tonos: usuarios que teclean zhuyin sin marcas tonales se benefician del modo tono opcional, que trata cada sílaba como tono desconocido y puntúa candidatos en consecuencia.
- Escritura con tonos parciales: escenarios mixtos donde algunas sílabas llevan tono y otras no, habituales en tecleo rápido, se gestionan con el mismo modelo.
- Sustitución controlada del candidato por defecto: en producción, `choose()` permite sobrescribir la elección del motor solo cuando la diferencia de puntuación supera el margen configurado, limitando falsos positivos.
- Partículas finales y tono neutro: la tolerancia configurada en `neutral_tolerant_last` mejora la selección en sílabas finales frecuentemente tecleadas con primer tono.
- Despliegue ligero en cliente: al ser ONNX de aproximadamente 130 MB con inferencia en CPU y variante 4-bit, puede ejecutarse localmente en equipos de usuario sin GPU.
- Evaluación offline de motores de IME: las puntuaciones del modelo pueden usarse para analizar y comparar el comportamiento de motores existentes sobre corpus de contexto y lecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo base se ejecuta con ONNX Runtime y `CPUExecutionProvider`; no requiere GPU.
- VRAM: no aplica en el despliegue documentado; la inferencia es en CPU.
- GPU recomendadas: no disponibles; el autor no documenta despliegue en GPU.
- Cabe en hardware de consumo: sí, al ser un modelo de aproximadamente 130 MB en formato ONNX y con variante 4-bit en `q4/`.
- Opciones de despliegue: ONNX Runtime (documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de reranking de candidatos para IME zhuyin.

## Limitaciones y advertencias

- No genera candidatos: depende obligatoriamente de una fuente externa de candidatos.
- Contexto limitado a 64 caracteres previos confirmados.
- Idioma restringido al chino tradicional con lecturas zhuyin; no cubre otros idiomas ni otros sistemas de entrada.
- Cada candidato debe tener exactamente un carácter por sílaba; los caracteres desconocidos en candidatos provocan `KeyError` y requieren gestión de fallback por parte del llamador.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones erróneas que desplacen el candidato correcto; el margen `tau` de `choose()` mitiga la sobrescritura del motor.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright correspondiente.
- En producción conviene validar el comportamiento del modelo sobre el corpus real del motor de IME antes de activar la sobrescritura automática de candidatos.

## Enlaces

- Hugging Face: https://huggingface.co/Funmula/0c-sequence-d512
- Sitio web del proyecto: https://0c.biggo.com
