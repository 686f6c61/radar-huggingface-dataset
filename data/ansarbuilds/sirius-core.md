# ansarbuilds/Sirius-Core

## Resumen

Sirius-Core (publicado en Hugging Face como `ansarbuilds/Sirius-Core`, con el nombre técnico Sirius-Small-ONNX en su model card) es un clasificador de texto de tres clases construido sobre `BAAI/bge-small-en-v1.5`, un encoder BERT de 33 millones de parámetros. Lo desarrolla el usuario independiente `ansarbuilds` y su función es detectar "deriva de foco" (focus drift): dado un objetivo breve del usuario y una traza de ventanas o pestañas recientes, clasifica la ventana activa como `ON_TASK`, `BORDERLINE` o `RABBIT_HOLE`. Está pensado como el "cerebro" de una aplicación de escritorio para macOS que avisa al usuario cuando se desvía de su tarea.

El modelo se distribuye como un archivo ONNX cuantizado a int8 de 32,43 MB, lo que permite inferencia en CPU en milisegundos (el autor reporta <5 ms en un M4 y una latencia p50 de 15,80 ms en su benchmark). Es, por tanto, un modelo de nicho, extremadamente pequeño y orientado a despliegue local en el borde, no un modelo generativo de propósito general.

Su relevancia es limitada pero concreta: demuestra un caso de uso de clasificación cross-encoder con datos sintéticos y destilación desde un modelo mayor (Qwen3-32B), empaquetado para ejecución offline. El repositorio tiene 12 descargas y 0 likes en el momento de la consulta, y el tamaño reportado del repo es de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el dato está redondeado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), cross-encoder; base `BAAI/bge-small-en-v1.5` |
| Parámetros totales | 33 M (según la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto nativo; el ejemplo de uso trunca a `max_length=160` tokens |
| Tipos de cuantización | int8 (ONNX cuantizado) |
| Idiomas soportados | no disponible (la model card está en inglés y los ejemplos son en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_quantized.onnx`); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT pequeño (`bge-small-en-v1.5`, 33 M de parámetros) reutilizado como cross-encoder para clasificación de tres clases. La entrada concatena el objetivo del usuario y una traza de ventanas normalizadas en formato `app | title | domain`, separadas por `[SEP]`, con la ventana actual marcada como `NOW` y hasta tres ventanas previas como `PREV1`–`PREV3`. La salida es una distribución softmax sobre `ON_TASK`, `BORDERLINE` y `RABBIT_HOLE`.

El entrenamiento se realizó en tres rondas sobre GPUs NVIDIA en RunPod, según la model card: 100 000 filas sintéticas en la ronda 1 (generadas con `factory.py`), un pool de 500 000 filas para minería de negativos duros (`mine_hard_negatives.py`) y 31 660 filas en la ronda 3 destiladas con probabilidades soft-label de `Qwen/Qwen3-32B-AWQ` (Apache-2.0). El autor declara no haber usado salidas de OpenAI, Anthropic ni Google/Gemma. El umbral de decisión (0,81) se ajustó exclusivamente en el split `dev` de SiriusBench. No se documentan detalles de función de pérdida, hiperparámetros, épocas ni composición exacta del dataset sintético.

## Capacidades

- Clasificación de texto en tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) a partir de un objetivo y una traza de ventanas.
- Detección de deriva de foco con precisión reportada del 99,3 % y recall del 92,3 % para la clase `RABBIT_HOLE` en el split de test bloqueado.
- Manejo de ventanas utilitarias (gestores de contraseñas, calculadora, 2FA) sin falsos positivos, según la evaluación del autor.
- Inferencia offline en CPU con latencia de milisegundos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.
- Capacidades multilingües: no documentadas; los ejemplos y la evaluación son en inglés.

## Casos de uso

- Aplicación de bienestar digital en macOS: el modelo se ejecuta localmente en CPU y clasifica la ventana activa para emitir o silenciar avisos cuando el usuario se desvía de un objetivo declarado, sin enviar datos a la nube.
- Filtrado de distracciones en entornos de estudio o trabajo: integrado en un daemon que observa cambios de ventana, puede marcar sesiones de YouTube o Reddit como `RABBIT_HOLE` solo cuando no son trabajo legítimo (el autor reporta 100 % de precisión en su slice D).
- Investigación sobre comportamiento digital: permite etiquetar trazas de navegación reales con tres categorías de foco para estudios de productividad, gracias a su tamaño reducido y su licencia MIT.
- Prototipado rápido de clasificadores de intención: al ser un cross-encoder de 33 M parámetros en ONNX, sirve como base para experimentos de clasificación de pares (objetivo, contexto) en el borde.
- Moderación de sesgo de atención en herramientas de lectura: puede distinguir entre una pestaña de documentación relevante y una tangente de entretenimiento en un flujo de trabajo concreto.
- Despliegue en dispositivos con recursos muy limitados: el archivo int8 de 32,43 MB cabe en memoria de móviles y sistemas embebidos, lo que permite clasificación de foco sin GPU.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (split de test bloqueado de SiriusBench, 364 trazas no vistas):

| Métrica / slice | Resultado |
|---|---|
| Precisión global de `RABBIT_HOLE` (umbral 0,81) | 99,3 % |
| Recall global de `RABBIT_HOLE` | 92,3 % |
| Exactitud global de 3 clases | 91,5 % |
| Slice A: trampas de misma palabra clave (precisión RH) | 100,0 % |
| Slice B: trazas de deriva gradual de 4 saltos (precisión RH) | 100,0 % |
| Slice C: tasa de falsa alarma en ventanas utilitarias | 0,0 % |
| Slice D: trabajo legítimo en YouTube/Reddit/GitHub (precisión RH) | 100,0 % |
| Concordancia PyTorch vs. ONNX int8 | 95,3 % |
| Latencia en CPU en caliente (p50 / p95) | 15,80 ms / 102,64 ms |

Evaluación en el mundo real sobre macOS (300 trazas etiquetadas a mano, 1,9 horas activas):

| Métrica | Resultado |
|---|---|
| Slice real de YouTube y Reddit (21 trazas) | 90,5 % precisión / 100,0 % recall |
| Falsas alarmas en ventanas utilitarias | 0,0 % |
| Falsos avisos por reproducción del motor de decisión cada 2 horas | 0,00 (objetivo ≤ 1,00) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU con ONNX Runtime.
- GPU recomendadas: no necesarias; el autor reporta inferencia en CPU de Apple M4 en menos de 5 ms y latencia p50 de 15,80 ms en su benchmark.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU; el archivo int8 ocupa 32,43 MB.
- Opciones de despliegue: ONNX Runtime (probado por el autor), potencialmente `onnxruntime` en Python, C++, C# o Java; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia p50 de 15,80 ms y p95 de 102,64 ms en el benchmark del autor; no se reporta throughput.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos equivalentes en la información proporcionada. Como referencia estructural, el modelo base `BAAI/bge-small-en-v1.5` es un encoder de 33 M parámetros con licencia MIT, pero no es un clasificador de tres clases ni está especializado en detección de deriva de foco; la comparación directa de rendimiento no está disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sirius-Core | 33 M | no disponible (truncado a 160 tokens en el ejemplo) | Clasificación de foco en 3 clases | MIT | ONNX en Hugging Face |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens (modelo base) | Embeddings de texto | MIT | safetensors en Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho: solo clasifica tres clases sobre un formato de entrada muy específico; no es un modelo generativo ni un asistente conversacional.
- Evaluación limitada: los resultados provienen de un benchmark propio (SiriusBench) y de 300 trazas de macOS etiquetadas por el autor; no hay validación independiente.
- Riesgo de sobreajuste al dominio: el entrenamiento combina datos sintéticos y destilación de Qwen3-32B; el comportamiento en otros sistemas operativos, idiomas o tipos de aplicaciones no está documentado.
- Idiomas: no se declaran idiomas soportados; los ejemplos y la evaluación son en inglés, por lo que el rendimiento en castellano es desconocido.
- Sesgos: no se documentan análisis de sesgo; al entrenarse con datos sintéticos y trazas de un único usuario, puede heredar patrones idiosincrásicos.
- Alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas con alta confianza; el umbral de 0,81 está ajustado a su distribución de datos.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `bge-small-en-v1.5` también es MIT, por lo que no se identifican restricciones adicionales en la información disponible.
- Repositorio con muy poca tracción (12 descargas, 0 likes) y tamaño reportado de 0,0 GB; conviene verificar que los pesos estén efectivamente accesibles antes de integrarlo en producción.
- El nombre del repositorio (`Sirius-Core`) difiere del nombre técnico de la model card (`Sirius-Small-ONNX`), lo que puede generar confusión en la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansarbuilds/Sirius-Core
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo destilador: https://huggingface.co/Qwen/Qwen3-32B-AWQ
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
