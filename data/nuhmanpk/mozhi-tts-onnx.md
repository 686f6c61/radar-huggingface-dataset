# nuhmanpk/mozhi-tts-onnx

## Resumen

Mozhi-TTS v3.3 · ONNX es la exportación a formato ONNX de `nuhmanpk/mozhi-tts-v1`, un sistema de síntesis de voz (TTS) expresivo para malabar (malayalam, `ml`), desarrollado por Nuhman PK. El modelo original se construye sobre `ai4bharat/indic-parler-tts` (Apache-2.0) y esta versión ONNX reproduce los mismos pesos, voces, emociones, etiquetas en línea y entrada en Manglish, pero elimina la dependencia de PyTorch: la inferencia se ejecuta con `onnxruntime` sobre grafos ONNX.

La relevancia de esta versión es operativa: permite desplegar el TTS en entornos sin PyTorch, con opciones de cuantización fp16 (para GPU) e int8 (para CPU), y ofrece generación en streaming por fragmentos de audio. La generación greedy produce exactamente los mismos códigos de audio que el modelo PyTorch, según la verificación de paridad realizada en el momento de la exportación.

El modelo es autorregresivo (87 pasos de decodificador por cada segundo de audio) y procesa una frase a la vez (batch size 1). El repositorio ocupa 8,3 GB, la descarga inicial con los patrones de omisión indicados ronda los 5,2 GB, y la salida es audio mono a 44.100 Hz. La licencia es CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición bajo la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo basado en Parler-TTS (encoder de texto/caption, decodificador autorregresivo y decodificador de códec DAC); exportado a grafos ONNX |
| Parametros totales | no disponible (el repo pesa 8,3 GB en pesos ONNX; el número de parámetros no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; procesa una frase a la vez (batch size 1) y divide automáticamente textos largos en frases |
| Tipos de cuantizacion | fp32 (grafos base), fp16 (copias de decodificador y códec; el encoder de caption permanece fp32), int8 (copias de los dos grafos del decodificador para CPU) |
| Idiomas soportados | malabar (`ml`); acepta entrada Manglish (malabar romanizado) que se convierte a escritura malabar |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`text_encoder.onnx`, `decoder_first.onnx`, `decoder_step.onnx`, `dac_decoder.onnx`), con subcarpetas `fp16/` e `int8/`; runtime Python `mozhi_onnx.py` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Parler-TTS: un encoder de texto y de caption (voz + emoción) que condiciona un decodificador autorregresivo, seguido de un decodificador de códec neuronal (DAC) que convierte los códigos de audio en forma de onda a 44.100 Hz mono. La inferencia es autorregresiva y requiere 87 pasos del decodificador por cada segundo de audio generado. La exportación a ONNX separa el grafo en cuatro piezas (`text_encoder`, `decoder_first`, `decoder_step`, `dac_decoder`) para permitir la decodificación por pasos y el streaming.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite a `nuhmanpk/mozhi-tts-v1` para «training data and the full story». La innovación técnica destacable de esta versión es la paridad funcional con PyTorch en generación greedy (mismos códigos de audio), la ausencia de dependencia de PyTorch y del warm-up de compilación, el streaming por frases y por fragmentos de 0,5 s, el modo `best_of=N` (N tomas y selección de la mejor) y el muestreo `rep_aware` para romper bucles. El conversor Manglish se basa en listas de palabras y reglas; el transliterador neuronal pequeño del paquete PyTorch no está incluido.

## Capacidades

- Síntesis de voz expresiva en malabar con 8 voces: `Thara`, `Arjun`, `Vishnu`, `Sooraj`, `Nila`, `Kannan`, `Vani`, `Manu`.
- Control de emoción: `happy`, `sad`, `angry`, `fearful`, `surprised`, `disgusted`, o ninguna.
- Intensidad emocional ajustable: `slightly`, `moderately`, `very`, `extremely`.
- Etiquetas en línea dentro del texto: emoción (`[sad]`, `[happy]`) y pausa (`[pause]`).
- Entrada en Manglish: el texto romanizado se convierte a escritura malabar antes de la síntesis.
- Streaming: por frases completas y por fragmentos de audio de tamaño configurable (`chunk_s`, por ejemplo 0,5 s) para reproducción en vivo.
- Modo de calidad `best_of=N`: genera N tomas y conserva la que no está cortada, no se desborda y tiene bordes limpios; permite un ranking personalizado mediante `tts.ranker`.
- Muestreo `rep_aware` para romper repeticiones y balbuceo.
- Recorte automático de respiraciones o jadeos al inicio y final de frase (`trim=False` para conservarlos).
- Caché del caption (voz + emoción): cada combinación se codifica una vez y se reutiliza.
- Selección de dispositivo e hilos (`providers`, `threads`) y uso de grafos fp16 o int8.
- No incluye clonación de voz ni guiado por caption en este runtime.

## Casos de uso

- Audiolibros y narración en malabar: el modelo permite narrar textos largos dividiéndolos automáticamente en frases y alternar emociones con etiquetas en línea (`[sad]`, `[pause]`, `[happy]`) para dar expresividad a la lectura.
- Asistentes de voz y atención al cliente en malabar: con 8 voces y control de emoción se pueden construir respuestas habladas con un tono adecuado al contexto; conviene usar GPU, ya que en CPU el modelo es más lento que el tiempo real.
- Locución publicitaria y contenido para redes: el modo `best_of=3` permite generar varias tomas de una misma frase y quedarse con la mejor, útil cuando se busca calidad sobre latencia.
- Accesibilidad y lectores de pantalla: la conversión de Manglish a escritura malabar facilita la entrada de texto por parte de usuarios que escriben malabar romanizado.
- Integración en pipelines sin PyTorch: al ejecutarse solo con `onnxruntime`, encaja en contenedores o servicios donde instalar PyTorch no es viable, con opción de grafos int8 para CPU.
- Reproducción en vivo por streaming: `stream(chunk_s=0.5)` entrega piezas de audio mientras se sigue generando la frase, adecuado para interfaces conversacionales que necesitan empezar a sonar antes de completar la síntesis.
- Generación por lotes de avisos o mensajes pregrabados: para textos cortos y repetitivos, la caché de captions (voz + emoción) evita recodificar el condicionamiento en cada llamada.

## Benchmarks y rendimiento

Datos medidos en Kaggle inmediatamente después de la exportación, con el runtime ONNX del repositorio:

| Metrica | Valor |
|---|---|
| Mismos códigos que PyTorch (generación greedy) | sí |
| CER, 11 frases de prueba (ASR IndicConformer) | 4,50 % |
| CER, líneas cortas | 33,33 % |
| Velocidad en CPU (segundos de cómputo por 1 s de audio) | 10,544 |
| Velocidad en CPU de 4 hilos | 9,046 |
| Grafos int8 en la misma CPU: velocidad · CER | 5,351 · 6,11 % |
| Primer audio con `stream(chunk_s=0.5)` en CPU | 6,26 s |
| Salida | 44.100 Hz mono |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los grafos base suman aproximadamente 5,2 GB en fp32 (encoder de texto 1.365 MB, decoder_first 2.081 MB, decoder_step 1.507 MB, dac_decoder 217 MB); con fp16 se reduce aproximadamente a la mitad en decodificador y códec, y con int8 el decodificador baja a 843 MB (`decoder_first`) y 421 MB (`decoder_step`).
- GPU recomendadas: no se especifican modelos concretos. La model card indica que con GPU se alcanza aproximadamente tiempo real y que en CPU el modelo es más lento que tiempo real; se recomienda `onnxruntime-gpu` con CUDA 12 y cuDNN 9.
- CPU: funciona con `onnxruntime` (10,544 s de cómputo por segundo de audio; 9,046 s con 4 hilos; 5,351 s con grafos int8). Para llamadas en vivo sobre CPU, el autor recomienda un modelo dedicado más pequeño.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño de los grafos (unos 5,2 GB en fp32 y menos con fp16/int8) es compatible con GPUs de consumo de gama alta, pero no se aportan mediciones.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (CUDA 12 + cuDNN 9); runtime Python `mozhi_onnx.py` con API `MozhiONNX.from_pretrained` y línea de comandos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer audio con streaming de 0,5 s en CPU en 6,26 s; procesamiento de una frase a la vez (batch size 1); `best_of=N` multiplica el coste por N.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mozhi-TTS v3.3 ONNX (`nuhmanpk/mozhi-tts-onnx`) | TTS autorregresivo Parler-TTS exportado a ONNX | malabar (`ml`), entrada Manglish | CC BY-SA 4.0 | ONNX (fp32, fp16, int8) | Sin PyTorch; 8 voces; 6 emociones; streaming |
| Mozhi-TTS v1 (`nuhmanpk/mozhi-tts-v1`) | TTS autorregresivo Parler-TTS en PyTorch | malabar (`ml`) | CC BY-SA 4.0 | PyTorch | Modelo base del anterior; incluye transliterador neuronal Manglish y clonación/guía por caption según el runtime |
| Indic Parler-TTS (`ai4bharat/indic-parler-tts`) | TTS Parler-TTS multilingüe índico | varias lenguas índicas | Apache-2.0 | PyTorch | Base arquitectónica de Mozhi; licencia permisiva frente a CC BY-SA |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- ONNX no acelera el modelo: es autorregresivo y requiere 87 pasos de decodificador por segundo de audio; en CPU es más lento que tiempo real.
- Procesa una frase a la vez (batch size 1); los textos largos se dividen en frases automáticamente y `best_of=N` multiplica el tiempo por N.
- Los grafos int8 no son copias exactas del modelo; el CER de 6,11 % se midió solo en unas pocas frases.
- El conversor Manglish usa listas de palabras y reglas; no incluye el transliterador neuronal pequeño del paquete PyTorch.
- No hay clonación de voz ni guiado por caption en este runtime.
- CER elevado en líneas cortas (33,33 %), lo que afecta a utterances muy breves.
- Licencia CC BY-SA 4.0: uso comercial permitido con atribución y obligación de compartir obras derivadas bajo la misma licencia; el modelo base `ai4bharat/indic-parler-tts` es Apache-2.0.
- No se documentan en la información disponible sesgos concretos, tasas de alucinación ni limitaciones idiomáticas más allá del malabar; la calidad fuera de ese idioma no está soportada.
- Para llamadas en vivo sobre CPU, el propio autor recomienda un modelo dedicado más pequeño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuhmanpk/mozhi-tts-onnx
- Modelo base (PyTorch): https://huggingface.co/nuhmanpk/mozhi-tts-v1
- Modelo base arquitectónico: https://huggingface.co/ai4bharat/indic-parler-tts
- GitHub del autor: https://github.com/nuhmanpk
- LinkedIn del autor: https://www.linkedin.com/in/nuhmanpk
- Perfil de Hugging Face del autor: https://huggingface.co/nuhmanpk
- Apoyo al autor: https://buymeacoffee.com/nuhmanpk
