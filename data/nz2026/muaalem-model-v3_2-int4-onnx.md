# NZ2026/muaalem-model-v3_2-int4-onnx

## Resumen

Muaalem Model v3.2 (cabeza de fonemas) es un modelo de reconocimiento fonético del árabe coránico desarrollado originalmente por obadx dentro del proyecto Quran Muaalem. Esta ficha concreta, publicada por NZ2026, es una conversión a ONNX con cuantización int4 de los pesos MatMul, pensada para ejecución offline en dispositivos móviles. El modelo no genera texto: es un sistema CTC (Connectionist Temporal Classification) que toma características acústicas y produce distribuciones de log-probabilidad sobre un vocabulario de 43 fonemas, lo que permite evaluar la pronunciación (tajwid) de una recitación.

La relevancia de esta variante radica en su tamaño reducido (0,4 GB en el repositorio, con un único fichero ONNX de 427 MB) y en su formato portable, que lo hace desplegable con ONNX Runtime en entornos sin GPU. Frente al modelo original en PyTorch, esta versión sacrifica algo de precisión en palabras ambiguas a cambio de viabilidad en producción móvil.

No se dispone de información pública sobre la arquitectura interna completa, el número de parámetros totales ni el proceso de entrenamiento más allá de lo indicado en la model card del autor original, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo acústico CTC; exportado a ONNX opset 17) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de audio variable en frames; sin attention mask) |
| Tipos de cuantizacion | Int4 (MatMulNBits, bloque 32, simétrico, accuracy_level 4) |
| Idiomas soportados | Árabe (recitación coránica) |
| Licencia | QML 1.0 (Quran Muaalem License) |
| Formato de pesos | ONNX (fichero único `muaalem_int4.onnx`, 427.072.719 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `obadx/muaalem-model-v3_2`. Por la model card se deduce que es un modelo acústico con cabeza CTC (43 clases de fonemas, blank = 0) que consume características extraídas con el feature extractor de SeamlessM4T: audio a 16 kHz, fbank de 80 bins y apilado con stride 2, dando entradas de forma `(1, frames, 160)`. La salida es `log_probs` de forma `(1, out_frames, 43)`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; dado que es un modelo CTC de reconocimiento, es improbable que use alineamiento por preferencias.

La innovación técnica de esta variante concreta es la conversión: solo se exporta la cabeza de fonemas a ONNX (opset 17, exportador TorchScript), las convoluciones 1x1 se reescriben como MatMul (transformación exacta) y los pesos MatMul se cuantizan a 4 bits con ONNX Runtime MatMulNBits. Según el autor, en 11 grabaciones de prueba (166 palabras) 151 decisiones a nivel de palabra coincidieron con la exportación fp32 en ONNX, por lo que se esperan diferencias pequeñas en palabras límite.

## Capacidades

- Reconocimiento fonético del árabe coránico: produce log-probabilidades sobre 43 fonemas a partir de audio.
- Evaluación de pronunciación y tajwid: al comparar la secuencia de fonemas detectada con la esperada, permite señalar errores de recitación.
- Funcionamiento offline en dispositivo: el formato ONNX int4 está pensado para ejecutarse en un teléfono sin conexión.
- Procesamiento de audio de duración variable (la dimensión de frames es dinámica).
- No soporta tool calling ni function calling.
- No es un modelo generativo de texto ni un agente multi-paso.
- No dispone de capacidades de visión, audio general ni modo de razonamiento explícito.
- Multilingüe: no; únicamente árabe.

## Casos de uso

- Aplicación móvil de práctica de recitación: el modelo se ejecuta en el propio teléfono con ONNX Runtime y evalúa la pronunciación del usuario sin enviar audio a un servidor, lo que es adecuado por su tamaño de 427 MB y su naturaleza offline.
- Herramienta de autoaprendizaje para estudiantes de tajwid: se compara la salida CTC con la secuencia fonética esperada del texto recitado y se marcan desviaciones para revisión posterior con un profesor.
- Control de calidad en grabaciones: procesar lotes de recitaciones y detectar segmentos con baja confianza fonética que requieran escucha humana.
- Investigación en fonética árabe: usar las log-probabilidades por fonema como señal para estudiar fenómenos de asimilación, madd o qalqala en corpus de audio.
- Integración en pipelines de evaluación educativa: servicio de inferencia ONNX en CPU que puntúa recitaciones y devuelve alineamientos aproximados para un panel de revisión.
- Prototipado rápido en entornos embebidos: al no requerir GPU ni framework de deep learning completo, sirve para validar ideas de corrección de recitación en dispositivos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de validación es la comparación del autor con la exportación fp32 en ONNX: 151 de 166 decisiones a nivel de palabra coincidieron en 11 grabaciones de prueba.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso habitual; el fichero ONNX ocupa 427 MB y puede ejecutarse en CPU con ONNX Runtime.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime puede acelerar la inferencia, pero no hay datos de rendimiento publicados.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU consumer moderna (por debajo de 1 GB de pesos), aunque no se documenta el rendimiento.
- Despliegue: ONNX Runtime (MatMulNBits requiere una versión con soporte de cuantización int4); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo CTC de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NZ2026/muaalem-model-v3_2-int4-onnx | No disponible | No aplica (audio) | ONNX int4 | QML 1.0 | Hugging Face |
| obadx/muaalem-model-v3_2 (original) | No disponible | No aplica (audio) | PyTorch | MIT según model card original; QML según proyecto | Hugging Face |
| Otros modelos de reconocimiento fonético árabe | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá del modelo base del que deriva esta conversión.

## Limitaciones y advertencias

- El propio autor advierte que es una herramienta de asistencia y puede cometer errores; no sustituye a un profesor autorizado, ya que el Corán se transmite por mushafahah (transmisión oral).
- La cuantización int4 introduce diferencias respecto a fp32 en palabras límite (15 de 166 decisiones no coincidieron en la prueba del autor).
- Solo cubre árabe coránico; no es un modelo multilingüe ni de propósito general.
- No es un modelo generativo: no produce texto, respuestas ni razonamiento.
- La licencia QML 1.0 puede imponer restricciones adicionales al uso comercial respecto a la MIT indicada en la model card original; conviene revisar `LICENSE` y `NOTICE` antes de desplegarlo.
- El modelo base original está pensado para evaluación de recitación; su uso fuera de ese dominio no está validado.
- Riesgo de sesgo hacia el estilo de recitación presente en los datos de entrenamiento, cuyo detalle no se publica.
- Al ser una conversión de terceros, no hay garantía de mantenimiento ni soporte por parte de los autores originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NZ2026/muaalem-model-v3_2-int4-onnx
- Modelo base: https://huggingface.co/obadx/muaalem-model-v3_2
- Proyecto Quran Muaalem: https://github.com/obadx/quran-muaalem
