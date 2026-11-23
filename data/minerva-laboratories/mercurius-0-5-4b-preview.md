# Minerva-Laboratories/Mercurius-0.5-4B-Preview

## Resumen

Mercurius 0.5 4B Preview es un checkpoint intermedio de un proceso de destilación propietario denominado Mercurius-Pipeline, desarrollado por Minerva-Laboratories. El modelo parte de Qwen3.5-4B como estudiante y lo convierte en una arquitectura híbrida compuesta por 24 capas GDN-2 y 8 capas MLA, incorporando adaptadores VeRA y un mecanismo de caché KV denominado FoveaKV 2+2 con un 10% de tokens dinámicos (Dyn10). El profesor empleado en la destilación es Qwen3.6-35B-A3B, servido mediante llama.cpp.

El entrenamiento se encuentra pausado en el paso 5825 de 6300, con entrenamiento consciente de cuantización (QAT) activo desde el paso 4200. El corpus utilizado suma 70,8 millones de tokens de texto, 39,1 millones de tokens de episodios agénticos y 10,4 millones de tokens matemáticos. El objetivo declarado es evaluar la viabilidad de la arquitectura híbrida y del esquema FoveaKV antes de una versión final.

El modelo es relevante ahora por dos motivos: por un lado, explora la sustitución parcial de atención completa por capas GDN-2 con el fin de reducir el coste de la caché KV en contextos largos; por otro, distribuye pesos empaquetados en Q4/Q8 tanto en formato GGUF como en safetensors, lo que permite medir el impacto real de la cuantización en el rendimiento. No obstante, los resultados publicados muestran degradaciones notables frente al modelo base en código y en tareas de contexto largo, por lo que debe considerarse un artefacto de investigación y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas GDN-2 + 8 capas MLA, con adaptadores VeRA; base Qwen3.5-4B |
| Parametros totales | 1.502.753.280 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens evaluados en PG-19; ventana de evaluación de 32.768 tokens en benchmarks |
| Tipos de cuantizacion | Pesos empaquetados Q4/Q8 (packed Q4/Q8); GGUF con metadatos FoveaKV Dyn10 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, formato `mercurius-packed-v1`), GGUF, `resume.pt` (estado de entrenamiento) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina 24 capas GDN-2 (atención lineal de tipo gated delta network) con 8 capas MLA (multi-head latent attention), partiendo del transformer denso de Qwen3.5-4B. Sobre esta conversión se añaden adaptadores VeRA, un esquema de adaptación de bajo rango con vectores compartidos. La caché KV utiliza FoveaKV 2+2 con un 10% de tokens dinámicos, un mecanismo que reserva parte de la caché para tokens seleccionados dinámicamente y el resto para ventanas fijas. El número de parámetros reportado en safetensors (1.502.753.280) no coincide con el tamaño nominal de 4B del nombre del modelo, lo que sugiere que el checkpoint empaquetado contiene solo un subconjunto de los pesos o que el empaquetado Q4/Q8 altera el recuento.

El entrenamiento se realizó mediante destilación desde Qwen3.6-35B-A3B, servido con llama.cpp, sobre un corpus de 70,8M tokens de texto, 39,1M tokens de episodios agénticos y 10,4M tokens matemáticos. El entrenamiento consciente de cuantización (QAT) se activó en el paso 4200 y el proceso quedó pausado en el paso 5825 de 6300. No se especifica en la información disponible si se aplicaron fases de RLHF o DPO, ni la composición detallada del corpus más allá de los tres bloques citados. El código del pipeline está publicado en el repositorio `Minerva-Laboratories/Mercurius-Pipeline`, rama `feat/native-foveakv-evaluation`.

## Capacidades

- Generación de texto conversacional en modo no-thinking, con perfil de decodificación `qwen35_nonthinking_v1` (temperatura 0.7, top-p 0.8, top-k 20, penalización de presencia 1.5).
- Razonamiento matemático: 91,96% en GSM8K bajo el protocolo de evaluación publicado, aunque el conjunto de entrenamiento incluye el split de GSM8K, por lo que la métrica está contaminada.
- Generación de código: 68,90% en HumanEval y 71,21% en MBPP sanitized, con degradación frente al modelo base.
- Manejo de contexto largo: evaluado en RULER a 32K con 83,38% de media y perplejidad PG-19 a 65.536 tokens de 13,09.
- Capacidades agénticas: el corpus de entrenamiento incluye 39,1M tokens de episodios agénticos, lo que sugiere exposición a trayectorias multi-paso, aunque no se documentan herramientas específicas ni formato de tool calling.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking: no soportado en la evaluación publicada (se usa explícitamente modo non-thinking).
- Visión y audio: no disponible.

## Casos de uso

- Investigación sobre arquitecturas híbridas de atención: el modelo permite medir el impacto de sustituir 24 de las 32 capas por GDN-2 y comparar la calidad resultante frente al transformer denso original, usando el mismo protocolo de decodificación y los mismos ejemplos.
- Evaluación de esquemas de caché KV comprimida: FoveaKV 2+2 con Dyn10 puede analizarse en cargas de contexto largo (RULER a 32K, PG-19 a 65K) para cuantificar la pérdida de recuperación de información en tareas de multiple-key y multivalue.
- Estudio de cuantización consciente (QAT): al distribuir pesos empaquetados Q4/Q8, sirve para analizar la brecha de rendimiento entre un checkpoint cuantizado y el modelo base en F32 con caché KV exacta.
- Reproducción de pipelines de destilación: el repositorio Mercurius-Pipeline y el archivo `resume.pt` permiten reanudar el entrenamiento desde el paso 5825 y experimentar con la rama `feat/native-foveakv-evaluation`.
- Benchmarking de decodificación especulativa y perfiles de sampling: el perfil `qwen35_nonthinking_v1` documentado permite replicar exactamente las condiciones de evaluación y comparar variantes de decodificación.
- Docencia y divulgación técnica: como checkpoint intermedio con métricas publicadas y limitaciones explícitas, es útil para ilustrar en cursos o artículos el compromiso entre eficiencia de caché y calidad en modelos híbridos.
- Pruebas de robustez frente a bucles repetitivos: los cinco fallos por límite de 32.768 tokens documentados en HumanEval, MBPP y GSM8K constituyen un caso de estudio sobre degeneración en generación larga.

## Benchmarks y rendimiento

Evaluación con llama.cpp/CUDA, mismos ejemplos, prompts y semillas por ejemplo, modo non-thinking, perfil `qwen35_nonthinking_v1`, hasta 32.768 tokens por respuesta. Mercurius con FoveaKV 2+2 Dyn10; Qwen3.5-4B con pesos F32 y caché KV exacta. Una muestra por ejemplo, sin reintentos ni best-of.

| Benchmark | Mercurius 0.5 4B Preview | Qwen3.5-4B (mismo protocolo) | Diferencia |
|---|---:|---:|---:|
| HumanEval (164) | 68,90% | 84,15% | -15,2 pp |
| MBPP sanitized (257) | 71,21% | 79,38% | -8,2 pp |
| GSM8K (1.319) | 91,96% | 94,16% | -2,2 pp |
| RULER, 5 tareas a 32K (200) | 83,38% | 92,25% | -8,9 pp |
| PG-19 perplexity a 65.536 (12 libros, menor es mejor) | 13,09 | 12,22 | +0,86 |

Desglose adicional: en RULER, la mayor parte de la pérdida de Mercurius se concentra en `niah_multikey_3` (60,0% frente a 72,5%) y `niah_multivalue` (82,5% frente a 96,25%); ambos modelos alcanzan el 100% en `niah_multikey_2`. En PG-19, la brecha de NLL se mantiene en torno a 0,06-0,07 nats en todos los tramos de posición, de 0-2K a 32K-64K, por lo que no crece con la longitud de contexto. Mercurius produjo 5 respuestas que alcanzaron el límite de 32.768 tokens entre HumanEval, MBPP y GSM8K, todas fallidas por bucles repetitivos; el modelo original no produjo ninguna.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con pesos empaquetados Q4/Q8 y un recuento de 1.502.753.280 parámetros en safetensors, la huella de pesos sería del orden de 1-1,5 GB en Q4 y 1,5-3 GB en Q8, a lo que habría que sumar la caché KV FoveaKV y el overhead del runtime.
- GPU recomendadas: no disponible. La evaluación publicada se realizó con llama.cpp sobre CUDA, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: probable por tamaño de pesos, pero no confirmada en la información disponible; el GGUF requiere el fork parcheado de llama.cpp construido con `scripts/build_native_bench.sh`.
- Opciones de despliegue: llama.cpp (obligatoriamente el fork parcheado de Minerva-Laboratories para el GGUF); el checkpoint safetensors no es un checkpoint estándar de Transformers y requiere el pipeline Mercurius con `config.json`, tokenizer y `export-manifest.json`. No se documenta soporte para vLLM, TGI, Ollama ni SGLang.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | GSM8K | RULER 32K | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| Mercurius 0.5 4B Preview | 1.502.753.280 (safetensors empaquetado) | 65.536 (evaluado) | 68,90% | 91,96% | 83,38% | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen3.5-4B | 4B (nominal) | no disponible | 84,15% | 94,16% | 92,25% | no disponible | Hugging Face |
| Qwen3.6-35B-A3B (profesor) | 35B totales, A3B activos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con Qwen3.5-4B es la única disponible con métricas publicadas bajo protocolo idéntico; el profesor Qwen3.6-35B-A3B se cita únicamente como origen de la destilación y no cuenta con resultados en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento está pausado en el paso 5825 de 6300, por lo que no representa una versión final ni un modelo validado para producción.
- Degradación frente al modelo base: pierde 15,2 pp en HumanEval, 8,2 pp en MBPP, 8,9 pp en RULER a 32K y 2,2 pp en GSM8K, además de empeorar la perplejidad PG-19 en 0,86 puntos.
- Contaminación de benchmark: el split de entrenamiento de GSM8K forma parte del corpus, por lo que la puntuación de 91,96% no es una medida limpia de capacidad matemática.
- Bucles repetitivos: se documentan 5 respuestas que agotan el límite de 32.768 tokens y fallan, un riesgo relevante en generación larga y en pipelines automatizados.
- Atribución imposible: la comparación se hace entre modelos completos desplegados, por lo que no se puede separar el efecto del entrenamiento, la conversión a MLA, la cuantización de pesos y FoveaKV.
- Dependencia de tooling no estándar: el GGUF requiere un fork parcheado de llama.cpp y el safetensors no es un checkpoint estándar de Transformers; el despliegue con herramientas convencionales no está soportado.
- Discrepancia de parámetros: el recuento de safetensors (1.502.753.280) no coincide con el tamaño nominal de 4B del nombre, lo que exige verificar el contenido real del checkpoint antes de usarlo.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre calidad fuera del inglés.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base y de los datos de destilación.
- Riesgo de alucinación: no cuantificado en la información disponible; la degradación en tareas de recuperación en contexto (RULER) sugiere mayor propensión a errores cuando la respuesta depende de información distribuida en ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Minerva-Laboratories/Mercurius-0.5-4B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del pipeline: `Minerva-Laboratories/Mercurius-Pipeline`, rama `feat/native-foveakv-evaluation` (no se dispone de URL directa en la información proporcionada)
- Script de compilación del fork de llama.cpp: `scripts/build_native_bench.sh` dentro del repositorio del pipeline
- Paper, blog o demo: no disponibles en la información proporcionada
