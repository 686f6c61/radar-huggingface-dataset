# OpenPronounce/wav2vec2-base-phones-en

## Resumen

wav2vec2-base-phones-en es un modelo de reconocimiento de fonemas en inglés desarrollado por OpenPronounce como sustituto ligero de `facebook/wav2vec2-lv-60-espeak-cv-ft` dentro de la herramienta de evaluacion de pronunciacion OpenPronounce. Se trata de un `Wav2Vec2ForCTC` de 94,7 millones de parametros (un tercio del modelo grande) destilado de dos profesores: el propio `wav2vec2-lv-60-espeak-cv-ft` (posteriores de fonemas sobre 392 tokens espeak y su capa 20) y `facebook/wav2vec2-large-960h` (posteriores de caracteres). El modelo no se entreno con etiquetas, sino por destilacion sobre audio en crudo.

Su relevancia practica esta en el coste de inferencia: sustituye al modelo grande en el modo `--fast` de OpenPronounce, reduciendo el tiempo de evaluacion de una grabacion de 18 segundos de 6,2 s a 2,8 s en CPU de portatil con ocho hilos (de 10,9 s a 4,0 s en un solo hilo). Ademas se distribuye en formato ONNX (fp32 de 382 MB e int8 de 123 MB) que ejecuta las tres cabezas a la vez en ONNX Runtime o en navegador.

El modelo esta pensado exclusivamente para ingles leido en voz alta y su licencia AGPL-3.0-or-later condiciona su uso en productos cerrados, que requiere licencia comercial. Su publicacion es reciente (noviembre de 2026) y no cuenta aun con descargas ni likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + encoder), cabeza CTC de fonemas |
| Parametros totales | 94.672.392 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada variable, frames de 20 ms) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 dinamica en productos matriciales (ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0-or-later (licencia comercial disponible para productos cerrados) |
| Formato de pesos | safetensors (model.safetensors, hidden_projection.safetensors, char_head.safetensors) y ONNX (model.onnx, model_int8.onnx) |

## Arquitectura y entrenamiento

El modelo es un `Wav2Vec2ForCTC` estandar sobre `facebook/wav2vec2-base`, con una cabeza CTC que produce posteriores sobre 392 tokens espeak (fonemas). Ademas incluye dos artefactos auxiliares: `hidden_projection.safetensors`, una proyeccion lineal de 768 a 1024 dimensiones aplicada a `hidden_states[10]` para imitar la capa 20 del profesor grande, y `char_head.safetensors`, una cabeza CTC sobre los 32 caracteres de `wav2vec2-large-960h` que actualmente no se usa en produccion.

El entrenamiento fue puramente por destilacion, sin etiquetas: el estudiante escucho los mismos recortes de audio que los profesores y aprendio a igualar (1) los posteriores de fonemas de `facebook/wav2vec2-lv-60-espeak-cv-ft`, (2) los posteriores de caracteres de `facebook/wav2vec2-large-960h` con peso 0,5, y (3) la capa 20 del primer profesor a traves de su proyeccion, con distancia L1 mas coseno. Se ejecutaron 21.193 pasos con lotes de 96 segundos de audio cortados en recortes de maximo 8 segundos, optimizador AdamW, learning rate de 1e-4 (1e-3 para las cabezas) con schedule coseno y encoder convolucional congelado. El entrenamiento completo duro una hora y cuarenta minutos en una RTX 5070 Ti.

El corpus de audio suma 32 horas: 27.065 clips de Common Voice 27 en ingles (29,5 h, CC0) con acentos nativos y no nativos, y las 2.498 grabaciones del split de entrenamiento de speechocean762 (2,6 h, CC BY 4.0), sin sus puntuaciones. Los profesores y `facebook/wav2vec2-base` estan bajo licencia Apache 2.0.

## Capacidades

- Reconocimiento de fonemas en ingles: genera posteriores sobre 392 tokens espeak a partir de waveform de 16 kHz.
- Evaluacion de pronunciacion: sirve como extractor de caracteristicas para el modelo de palabras (`word_mdd_en_student.json`) y el scorer (`scorer_en_student.json`) de OpenPronounce.
- Inferencia en CPU y en navegador: los modelos ONNX ejecutan las tres cabezas simultaneamente en ONNX Runtime; la entrada `input_values` es `(1, samples)` normalizada a media cero y varianza unitaria.
- Salidas multiples: `logits` `(1, frames, 392)`, `hidden20` `(1, frames, 1024)` y `asr_logits` `(1, frames, 32)`, con un frame por cada 20 ms.
- Integracion con la libreria OpenPronounce desde la version 1.1 mediante la variable de entorno `OPENPRONOUNCE_PHONEME_MODEL`.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo thinking; es un modelo puro de reconocimiento fonetico.
- Capacidad multilingue limitada: el vocabulario de fonemas es multilingue, pero el modelo solo ha escuchado ingles.

## Casos de uso

- Evaluacion de pronunciacion en aplicaciones educativas: integrado en OpenPronounce, puntua la lectura en voz alta de un estudiante comparando los fonemas detectados con la frase esperada, con tiempos de 2,8 s por grabacion de 18 s en CPU de portatil.
- Modo rapido de OpenPronounce (`--fast` o `transcription=False`): permite evaluar pronunciacion sin cargar el modelo grande de transcripcion, reduciendo el consumo de recursos en entornos con CPU limitada.
- Despliegue en navegador: la version ONNX int8 (123 MB) puede ejecutarse en el cliente sin enviar audio a un servidor, util para privacidad en plataformas de aprendizaje de idiomas.
- Investigacion en fonetica computacional: extraccion de posteriores de fonemas y de la representacion `hidden20` de 1024 dimensiones para analisis de habla no nativa.
- Prototipado de sistemas de correccion de lectura: su coste bajo (95 M de parametros) permite iterar rapidamente en pipelines de evaluacion de fluidez y prosodia.
- Benchmarking de destilacion: caso de estudio de destilacion sin etiquetas desde dos profesores CTC para reducir el tamano de un modelo de evaluacion de pronunciacion.
- Evaluacion offline en dispositivos modestos: el modelo cabe en CPU de portatil y no requiere GPU para inferencia en produccion.

## Benchmarks y rendimiento

Resultados medidos sobre las 2.500 grabaciones del split de test de speechocean762 (hablantes ausentes del split de entrenamiento), a traves de la libreria (`benchmarks/word_model.py` y `benchmarks/scorer.py`). El word AUC mide la deteccion de palabras puntuadas por debajo de 5 sobre 10; las correlaciones de Pearson miden la cercania a las puntuaciones de los evaluadores.

| Modelo de fonemas | word AUC | total | accuracy | fluency | prosody |
|---|--:|--:|--:|--:|--:|
| wav2vec2-lv-60-espeak-cv-ft, modelos incluidos | 0,928 | 0,790 | 0,743 | 0,827 | 0,808 |
| este modelo, sus propios modelos | 0,938 | 0,802 | 0,766 | 0,837 | 0,821 |
| este modelo en ONNX int8, mismos modelos | 0,939 | 0,798 | 0,759 | 0,837 | 0,820 |

Rendimiento de inferencia en CPU de portatil (Ryzen 7 PRO 7840U), `assess()` sin transcripcion sobre una grabacion de 18 segundos: 2,8 s con ocho hilos frente a 6,2 s del modelo grande; 4,0 s con un solo hilo frente a 10,9 s. El word error rate de la cabeza de caracteres es 0,54 frente a 0,48 del modelo grande sobre 200 utterances de test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo safetensors; el ONNX fp32 ocupa 382 MB y el int8 123 MB.
- GPU recomendadas: no requiere GPU; el autor reporta entrenamiento en RTX 5070 Ti y evaluacion en CPU. Cualquier GPU consumer moderna (RTX 3060 o superior) es sobrada para inferencia.
- Cabe en cualquier GPU consumer e incluso en CPU de portatil; el caso de uso documentado es CPU (Ryzen 7 PRO 7840U).
- Opciones de despliegue: transformers (safetensors), ONNX Runtime (fp32 o int8), navegador via ONNX, y la libreria OpenPronounce (`pip install 'openpronounce>=1.1'`).
- Latencia: 2,8 s por grabacion de 18 s en CPU de ocho hilos; 4,0 s en un hilo; 6,2 s y 10,9 s respectivamente con el modelo grande.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Word AUC (speechocean762 test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wav2vec2-base-phones-en (este modelo) | 94,7 M | Fonemas EN + evaluacion | 0,938 | AGPL-3.0 | Hugging Face + ONNX |
| facebook/wav2vec2-lv-60-espeak-cv-ft | no disponible (modelo large) | Fonemas multilingues | 0,928 | Apache 2.0 | Hugging Face |
| facebook/wav2vec2-large-960h | no disponible (modelo large) | ASR caracteres EN | no disponible | Apache 2.0 | Hugging Face |

La comparativa directa con `wav2vec2-lv-60-espeak-cv-ft` es la mas relevante: este modelo lo supera en word AUC (0,938 frente a 0,928) y en las cuatro correlaciones de puntuacion, con un tercio de los parametros, aunque el autor advierte que la mejora probablemente se debe a la adaptacion al corpus speechocean762 y no se generalizaria a otros hablantes. `wav2vec2-large-960h` se usa como segundo profesor y como modelo de transcripcion en OpenPronounce, pero no es directamente comparable en evaluacion de pronunciacion.

## Limitaciones y advertencias

- Disenado exclusivamente para ingles leido en voz alta; el vocabulario de fonemas es multilingue pero el modelo solo ha escuchado ingles y no se ha medido en otros idiomas.
- La mejora sobre el profesor en speechocean762 probablemente no se generaliza: el modelo escucho el audio del split de entrenamiento (misma poblacion que el test: aprendices mandarines, muchos ninos) y sus scorers se ajustaron sobre su propia salida. En otros hablantes, se debe esperar como maximo los resultados del modelo grande.
- En habla libre, el scorer entrenado sobre el modelo grande sigue usandose; con este modelo la correlacion con las puntuaciones de los evaluadores baja ligeramente (Pearson 0,699 frente a 0,708 publicada para el modelo grande).
- La cabeza de caracteres (`char_head.safetensors`) no se usa aun y su transcripcion greedy pierde mas palabras que la del modelo grande (WER 0,54 frente a 0,48).
- Riesgo de alucinacion en la transcripcion fonetica: al ser un modelo CTC sin correccion externa, puede producir secuencias de fonemas erroneas en audio ruidoso o acentos no representados en el corpus.
- Sesgos de dominio: el corpus de entrenamiento combina Common Voice 27 y speechocean762, con sobrerrepresentacion de aprendices mandarines y voces infantiles; el rendimiento en otros perfiles no esta medido.
- Licencia AGPL-3.0-or-later: el uso en productos cerrados requiere licencia comercial segun LICENSING.md y la lista de precios del proyecto.
- Sin descargas ni validacion externa en Hugging Face en el momento de la ficha; el modelo es muy reciente.

## Enlaces

- Hugging Face: https://huggingface.co/OpenPronounce/wav2vec2-base-phones-en
- Repositorio OpenPronounce: https://github.com/OpenPronounce/OpenPronounce
- Licencia comercial: https://github.com/OpenPronounce/OpenPronounce/blob/main/LICENSING.md
- Precios: https://openpronounce.github.io/pricing.html
- Modelo profesor de fonemas: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Modelo profesor de caracteres: https://huggingface.co/facebook/wav2vec2-large-960h
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Dataset speechocean762: https://huggingface.co/datasets/mispeech/speechocean762
- Paper speechocean762: Zhang et al., "speechocean762: An Open-Source Non-native English Speech Corpus For Pronunciation Assessment", Interspeech 2021
- Dataset Common Voice 27: https://commonvoice.mozilla.org/
