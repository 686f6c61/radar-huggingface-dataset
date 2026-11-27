# mmmhusto/TTS-English

## Resumen

TTS-English (identificador `mmmhusto/TTS-English`) es un modelo de síntesis de voz (text-to-speech) bilingüe desarrollado por el usuario mmmhusto, que genera audio en inglés y eslovaco a partir de un único conjunto de pesos acústicos compartidos. El modelo se distribuye como la versión v3.0 de la línea TTS-husto, una evolución de un modelo base en inglés (v1.0) afinado sucesivamente hasta incorporar el eslovaco. Con 41,8 millones de parámetros, es un modelo compacto orientado a síntesis local y a despliegue en navegador mediante exportación ONNX.

El modelo emplea un vocoder BigVGAN compartido a 24 kHz y ofrece cinco perfiles de voz: dos en inglés (`en_hifi_92_clean`, `en_dt_0`) y tres en eslovaco (`sk_muz`, `sk_cori`, `sk_dailytalk`). Incluye clonación de voz, un modo rápido de decodificación (2 pasos + Vocos, aproximadamente 9 veces tiempo real en CPU de portátil) y una receta medida para añadir nuevas voces con unos 5 minutos de audio.

Su relevancia radica en ser un modelo pequeño, bilingüe y desplegable en entornos con recursos limitados, con licencia CC BY-SA 4.0 y artefactos listos para inferencia local (safetensors, ONNX). No obstante, el eslovaco es experimental y se han documentado tasas de error de transcripción notables en pruebas exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico TTS con vocoder BigVGAN compartido (arquitectura exacta del backbone: no disponible) |
| Parametros totales | 41.828.490 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye safetensors y exportación ONNX) |
| Idiomas soportados | Inglés (en) y eslovaco (sk) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (modelo acústico), ONNX (demo web), pesos de vocoder BigVGAN |

## Arquitectura y entrenamiento

El modelo se compone de un modelo acústico (42M de parámetros en su origen inglés, denominado English Duo) y un vocoder BigVGAN compartido que sintetiza a 24 kHz. La misma base acústica genera voz en inglés y eslovaco, lo que permite compartir representaciones entre idiomas. El pipeline incluye un frontend de fonemas específico para eslovaco, distribuido aparte en `slovak-frontend.zip`.

El entrenamiento partió del modelo base inglés (v1.0, con 590 voces, dos estilos de habla, modo rápido y clonación de voz). La v2.0 se afinó sobre dos voces (Studio 92, de Cori Samuel, y DailyTalk man). La v3.0 añade eslovaco mediante el frontend de fonemas del proyecto, ejemplos de los conjuntos Lili, SlovakSpeech y TrePal, junto con repetición de datos en inglés (replay) para evitar el olvido catastrófico. El checkpoint publicado corresponde a la evaluación tras 2.200 pasos adicionales con voz eslovaca original. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y eslovaco con pesos acústicos compartidos.
- Cinco perfiles de voz predefinidos: dos en inglés y tres en eslovaco.
- Clonación de voz a partir de muestras de audio.
- Modo rápido de decodificación (2 pasos + Vocos) con rendimiento aproximado de 9 veces tiempo real en CPU de portátil.
- Dos estilos de habla en el modelo base inglés.
- Exportación ONNX para inferencia en navegador (demo web incluida).
- Receta documentada para añadir nuevas voces con unos 5 minutos de habla.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Síntesis de voz local en aplicaciones de escritorio: el modelo puede ejecutarse con las dependencias de Python del proyecto y el código fuente de BigVGAN, generando audio WAV a partir de texto en inglés o eslovaco sin depender de servicios en la nube.
- Demostración web interactiva: la exportación ONNX incluida en `web/` permite integrar la síntesis en el navegador, útil para prototipos de accesibilidad o lectura de texto en páginas.
- Lectura de contenido en eslovaco: con los perfiles `sk_muz`, `sk_cori` y `sk_dailytalk`, el modelo puede narrar documentos o artículos, aunque el eslovaco es experimental y debe validarse la calidad por voz.
- Generación de audio para entornos con recursos limitados: sus 41,8M de parámetros y el modo rápido lo hacen adecuado para portátiles y CPUs sin GPU dedicada.
- Personalización de voces: la receta para añadir una voz con 5 minutos de habla permite crear perfiles propios para aplicaciones de marca o asistentes.
- Investigación en TTS bilingüe: sirve como base para estudiar transferencia entre idiomas y el efecto del replay en el olvido catastrófico, dado que comparte pesos acústicos entre inglés y eslovaco.
- Prototipado de asistentes de voz: la clonación de voz y los estilos de habla permiten experimentar con voces personalizadas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una evaluación cualitativa sobre 12 prompts exigentes en eslovaco, en la que los perfiles Cori y DailyTalk presentaron 26 y 31 errores de transcripción respectivamente sobre 84 palabras cada uno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 41,8M de parámetros el modelo es muy ligero y puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: script Python del proyecto (`povedz.py`), ONNX Runtime para navegador, y dependencias de Python del proyecto con el código fuente de NVIDIA BigVGAN.
- Latencia y throughput: el modo rápido reporta aproximadamente 9 veces tiempo real en CPU de portátil (2 pasos de decodificación + Vocos).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El eslovaco es experimental: en la evaluación con 12 prompts exigentes, los perfiles Cori y DailyTalk registraron 26 y 31 errores de transcripción sobre 84 palabras.
- Solo se soportan inglés y eslovaco; no hay soporte multilingüe más amplio.
- La licencia CC BY-SA 4.0 exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede condicionar el uso comercial.
- No se dispone de información sobre sesgos de género, acento o hablante en los datos de entrenamiento.
- Riesgo de alucinación o artefactos de audio: no documentado en la información disponible.
- El despliegue local requiere instalar las dependencias del proyecto y el código fuente de NVIDIA BigVGAN, lo que añade complejidad frente a soluciones empaquetadas.
- Los datos de entrenamiento incluyen conjuntos con licencias propias (SlovakSpeech CC BY-SA 4.0, Lili CC0, TrePal CC BY 4.0), cuyas condiciones de atribución deben respetarse.
- No se documentan límites de longitud de texto ni de contexto para la síntesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmmhusto/TTS-English
- Repositorio de la línea TTS-husto (versión v2.0): https://huggingface.co/mmmhusto/TTS-husto/tree/v2.0
- Demo bilingüe: https://huggingface.co/spaces/mmmhusto/TTS-English-demo
- Dataset SlovakSpeech Male: https://huggingface.co/datasets/neurlang/slovakspeech_male_dataset
- Dataset SlovakSpeech Female: https://huggingface.co/datasets/neurlang/slovakspeech_female_dataset
- Dataset Lili: https://huggingface.co/datasets/vsisik/voice-dataset-lili
- Dataset TrePal: https://huggingface.co/datasets/streams-sro/trepal
