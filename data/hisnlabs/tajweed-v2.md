# Hisnlabs/tajweed-v2

## Resumen

HisnLabs Tajweed v2 es un modelo de reconocimiento automático del habla especializado en la recitación del Corán, desarrollado por HisnLabs. Su función no es transcribir texto al uso, sino describir *cómo* se pronuncia cada palabra: la duración de las vocales largas (madd), la presencia de ghunnah, el comportamiento de la nūn (ikhfāʾ, iqlāb, idghām) y el rebote de las letras de qalqalah. A partir de esa transcripción fonética, un motor de reglas asociado genera observaciones de tajwid palabra por palabra en árabe, inglés o francés, tanto para la riwāya de Hafs ʿan ʿĀṣim como para la de Warsh ʿan Nāfiʿ.

El modelo es deliberadamente pequeño: 20,6 millones de parámetros, con pesos en ONNX int8 de 23 MB y fp32/safetensors de 83 MB. Está construido sobre el encoder de tarteel-ai/whisper-base-ar-quran, destilado desde obadx/muaalem-model-v3_2, y añade cabeceras CTC para fonemas y diez sifāt (atributos fonéticos). Su relevancia radica en que permite ejecutar evaluación de recitación en CPU, sin GPU ni servicio en la nube, con una latencia de decenas de milisegundos.

La licencia Apache 2.0 y su formato ONNX lo hacen apto para integración en aplicaciones web y móviles. El primer producto en producción construido sobre él es Daghia, un buscador desarrollado en Emiratos Árabes Unidos, que lo emplea en su función AI Recite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-base (fine-tune árabe-coránico) con cabeceras CTC para fonemas y sifāt |
| Parametros totales | 20.630.091 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; el modelo procesa fragmentos de audio, sin contexto de texto declarado) |
| Tipos de cuantizacion | int8 (ONNX, 23 MB) y fp32 (safetensors, 83 MB) |
| Idiomas soportados | Árabe (recitación coránica); realimentación en árabe, inglés y francés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (onnxruntime) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de tarteel-ai/whisper-base-ar-quran, un fine-tune de Whisper-base sobre árabe coránico. Sobre ese encoder se añaden cabeceras CTC que producen dos salidas: una secuencia de fonemas en el script fonético coránico de obadx/quran-transcript y diez atributos fonéticos (sifāt). El encoder genera 50 fotogramas por segundo, de modo que cada símbolo emitido lleva asociada una marca temporal y una confianza, lo que permite medir la duración de cada madd contra el ritmo del propio recitador.

El modelo se destila desde obadx/muaalem-model-v3_2, un modelo mayor de la misma familia de tareas. La riwāya (Hafs o Warsh) es una entrada del propio modelo, no solo del motor de reglas posterior, lo que permite adaptar la transcripción fonética a la tradición de recitación seleccionada. Los conjuntos de datos citados en la model card son obadx/qdat_bench, RetaSy/quranic_audio_dataset y tarteel-ai/everyayah. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El flujo completo combina el modelo con un motor de reglas (imam.py) que recibe la transcripción fonética detectada y el texto correcto del āyah, y emite las observaciones de tajwid por palabra. Las duraciones de madd contempladas son natural, muttaṣil, munfaṣil, lāzim, ʿāriḍ, līn y badal, con valores de 2, 4 o 6 tiempos.

## Capacidades

- Transcripción fonética de recitación coránica con conciencia de tajwid, incluyendo marcas temporales y confianza por símbolo.
- Medición de la duración de los madd (natural, muttaṣil, munfaṣil, lāzim, ʿāriḍ, līn, badal) en cuentas de 2, 4 o 6 tiempos, calibradas contra el ritmo del recitador.
- Detección de ghunnah, ikhfāʾ, iqlāb, idghām y qalqalah (letras ق ط ب ج د).
- Soporte de dos riwāyāt: Hafs ʿan ʿĀṣim y Warsh ʿan Nāfiʿ (ṭarīq al-Azraq), como entrada del modelo.
- Generación de observaciones de tajwid por palabra en árabe, inglés y francés mediante el motor de reglas asociado.
- Funcionamiento en CPU con cuantización int8, sin necesidad de GPU ni servicios en la nube.
- No dispone de tool calling, capacidades de agente, visión ni audio general fuera del dominio de la recitación coránica.

## Casos de uso

- Aplicaciones de aprendizaje de recitación: el usuario recita un āyah y el modelo marca cada palabra como correcta, a revisar, errónea u olvidada, con observaciones de tajwid adjuntas. Es adecuado por su latencia baja y su ejecución en CPU, que permite integrarlo en un cliente web o móvil.
- Autoevaluación de memorización (ḥifẓ): el estudiante puede ocultar el texto, recitar de memoria y recibir al final un recuento de palabras correctas y fallos, como se muestra en la demo de AI Recite sobre Al-Ikhlas 1-4.
- Plataformas educativas de tajwid: el motor de reglas genera explicaciones en tres idiomas, lo que permite ofrecer realimentación pedagógica a estudiantes no arabófonos sin desarrollar un sistema propio de reglas.
- Verificación de duración de madd: aplicaciones de práctica específica pueden medir si el recitador sostiene las vocales largas 2, 4 o 6 tiempos y señalar desviaciones, gracias a la precisión declarada del 95,9 % dentro de ±1 cuenta.
- Soporte a distancia para profesores: el modelo puede preprocesar las recitaciones de los alumnos y entregar al profesor un informe por palabra con las marcas de tajwid, reduciendo el tiempo de revisión manual.
- Integración en buscadores y asistentes de contenido islámico: como en el caso de Daghia, el modelo puede incorporarse como función de audio dentro de una aplicación mayor, ejecutándose en el servidor o en el dispositivo por su reducido tamaño.
- Distribución en dispositivos con recursos limitados: con 23 MB en int8 y unos 28 ms para 4 segundos de audio en una Apple M1 Max con dos hilos de CPU, es viable en entornos de borde sin acelerador dedicado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| QDAT bench (159 aprendices, Al-Maida 109) | Tasa de error de fonemas (PER) | 7,0 % |
| QDAT bench (159 aprendices, Al-Maida 109) | Duración de madd dentro de ±1 cuenta | 95,9 % |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración recomendada; el modelo está pensado para ejecutarse en CPU con ONNX Runtime.
- GPU recomendadas: no se especifican; el modelo no requiere GPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU, dado su tamaño de 23 MB en int8 y 83 MB en fp32.
- Opciones de despliegue: ONNX Runtime (librería declarada), con pesos también en safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para este tipo de modelo de audio.
- Latencia y throughput estimados: 28 ms para 4 segundos de audio y 74 ms para 10 segundos, medidos en una Apple M1 Max con 2 hilos de CPU e int8.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| HisnLabs Tajweed v2 | 20,6 M | Transcripción fonética con tajwid y realimentación por palabra | Apache 2.0 | Hugging Face, ONNX y safetensors |
| tarteel-ai/whisper-base-ar-quran | no disponible en la información | ASR de árabe coránico | no disponible en la información | Hugging Face (modelo base) |
| obadx/muaalem-model-v3_2 | no disponible en la información | Evaluación de recitación (modelo del que se destila) | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede equivocarse: es una ayuda de aprendizaje para el autoestudio y la revisión, no sustituye a un profesor cualificado (شيخ / مقرئ) y no debe usarse para certificar a un recitador.
- Los resultados de benchmarks (PER del 7,0 % y precisión de madd del 95,9 %) están declarados por el autor y no han sido verificados de forma independiente.
- El dominio es exclusivamente la recitación coránica en árabe; no es un modelo de ASR general ni cubre otros idiomas o registros del árabe.
- Solo cubre las riwāyāt de Hafs y Warsh; otras tradiciones de recitación quedan fuera de su alcance.
- No se documentan en la información disponible sesgos específicos, riesgos de alucinación fuera del dominio fonético ni limitaciones de contexto de texto.
- La licencia Apache 2.0 permite uso comercial, pero debe tenerse en cuenta la advertencia del autor sobre no emplear el modelo para certificar recitadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HisnLabs/tajweed-v2
- Código en GitHub: https://github.com/HisnLabs/tajweed
- Demo en producción (AI Recite en Daghia): https://daghia.com/?q=%D8%B3%D9%88%D8%B1%D8%A9+%D8%A7%D9%84%D9%83%D9%87%D9%81
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo del que se destila: https://huggingface.co/obadx/muaalem-model-v3_2
- Script fonético coránico: https://github.com/obadx/quran-transcript
- Dataset de evaluación: https://huggingface.co/datasets/obadx/qdat_bench
- Dataset de audio coránico: https://huggingface.co/datasets/RetaSy/quranic_audio_dataset
- Dataset EveryAyah: https://huggingface.co/datasets/tarteel-ai/everyayah
- Paper referenciado (arXiv:2509.00094): https://arxiv.org/abs/2509.00094
