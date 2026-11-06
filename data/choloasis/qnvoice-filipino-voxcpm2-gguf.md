# CholoAsis/qnvoice-filipino-voxcpm2-gguf

## Resumen

QnVoice Filipino VoxCPM2 GGUF es un paquete de síntesis de voz (text-to-speech) en tagalo/filipino derivado del modelo VoxCPM2 de OpenBMB. No se trata de un modelo entrenado desde cero: QnVoice (QnSub Software Solutions) ha empaquetado los pesos preentrenados de VoxCPM2 en formato GGUF con cuantización selectiva y ha añadido una referencia de voz sintética diseñada para frases cortas en filipino. El objetivo es el despliegue en dispositivo (on-device), concretamente en iOS, sin conexión a red.

El paquete contiene dos ficheros de pesos GGUF (el BaseLM en Q4_K_M y el modelo acústico con matrices seleccionadas en Q8_0) más un WAV de referencia de voz de 4,48 segundos. Los pesos suman aproximadamente 912 millones de parámetros según los safetensors publicados, si bien el modelo base VoxCPM2 se describe como un TTS de 2.000 millones de parámetros; la diferencia corresponde a la partición y cuantización realizada en este empaquetado. La licencia es Apache 2.0 para los pesos.

Su relevancia es acotada pero concreta: cubre un hueco poco atendido (TTS filipino offline en móvil) y demuestra un flujo de cuantización mixta sobre un TTS tokenizer-free. No obstante, el propio autor reconoce que las pruebas cubren solo un conjunto reducido de frases cortas, que las valoraciones de oyentes nativos y la evaluación sistemática de Taglish están pendientes, y que el repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS tokenizer-free basado en VoxCPM2 (BaseLM + modelo acustico con ResidualLM, LocEnc y LocDiT, mas vocoder y predictor de stop) |
| Parametros totales | 912.440.644 (safetensors publicados); el modelo base VoxCPM2 se describe como 2.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (BaseLM), Q8_0 (matrices seleccionadas del modelo acustico); vocoder y predictor de stop en precision original |
| Idiomas soportados | tl (tagalo/filipino); el base VoxCPM2 soporta 30 idiomas, pero este paquete esta orientado a filipino |
| Licencia | Apache 2.0 (pesos); la referencia de voz sintetica incluida tiene terminos propios de QnSub con obligacion de citacion |
| Formato de pesos | GGUF (voice-language.gguf, voice-acoustic.gguf) + WAV de referencia (mono 16 kHz PCM) |

## Arquitectura y entrenamiento

El paquete hereda la arquitectura de VoxCPM2, un TTS tokenizer-free que genera voz a 48 kHz con clonación y diseño de voz integrados. La inferencia se reparte en dos ficheros: un BaseLM cuantizado en Q4_K_M y un modelo acústico en el que se han convertido a Q8_0 determinadas matrices de ResidualLM, LocEnc y LocDiT, manteniendo el vocoder y el predictor de stop en su precisión de origen. El BaseLM Q4_K_M es byte-idéntico a la release de MiniCPM-V-Apps GGUF, según la model card.

No hubo entrenamiento ni fine-tuning por parte de QnVoice: se reutilizan los pesos preentrenados de OpenBMB y se aplica una cuantización acústica selectiva. La referencia de voz incluida se generó con VoxCPM2-4bit (seed 1302, nueve pasos de inferencia) y produce una voz femenina filipina de registro grave. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Síntesis de voz en tagalo/filipino a partir de texto, con salida de audio.
- Clonación de voz mediante fichero de referencia WAV (en este paquete, la referencia sintética incluida).
- Generación en streaming (flag `--stream` en el runtime de ejemplo).
- Control de pasos de inferencia y timesteps (`--steps 93 --timesteps 6` en el ejemplo de la model card) y semilla fija para reproducibilidad.
- Normalización de grafías informales antes de la síntesis: el autor cita el ejemplo de convertir "Kamusta dyan, san tayo kakain?" en "Kumusta diyan, saan tayo kakain?".
- Ejecución offline en dispositivo, sin dependencia de servicios en la nube.
- No cubre traducción, reconocimiento de voz ni conversión de voz de grabaciones: son partes separadas de la app QnVoice.

## Casos de uso

- Lectura de notificaciones y mensajes en filipino en una app iOS: el paquete está pensado para inferencia on-device con pesos de ~2,1 GB, de modo que la síntesis ocurre sin red y sin enviar texto del usuario a servidores externos.
- Asistentes de voz accesibles para usuarios filipinos: la referencia de voz de registro grave y 4,48 segundos permite una voz consistente en lecturas largas de pantalla o menús.
- Aprendizaje de idioma: generación de pronunciaciones de frases cortas en tagalo con una voz de referencia fija, útil para ejercicios de repetición.
- Prototipado de interfaces conversacionales en filipino: el streaming permite empezar a reproducir audio antes de completar la síntesis, lo que reduce la latencia percibida en respuestas de un asistente.
- Integración en apps de lectura (lector de artículos, correo o ebooks) para mercado filipino, con la salvedad de que el autor solo ha validado frases cortas.
- Evaluación comparativa de cuantización en TTS: el paquete separa BaseLM Q4_K_M y modelo acústico Q8_0, lo que permite medir el impacto de la cuantización mixta sobre calidad de audio en un mismo runtime.
- Generación de audios de demostración o contenido de marketing en tagalo con una voz sintética cuya licencia permite uso comercial con citación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, similitud de hablante) ni comparaciones numéricas; únicamente indica que las pruebas cubren un conjunto pequeño de frases cortas y que las valoraciones de oyentes filipinos y la evaluación de Taglish están pendientes.

## Requisitos de hardware

- Tamaño en disco: 2,1 GB de repositorio; los dos GGUF suman 1.002.374.880 + 1.077.740.192 bytes (~2,08 GB) más el WAV de 143.410 bytes.
- VRAM/RAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los ficheros, el modelo requiere del orden de 2 GB de memoria para cargar los pesos, más overhead del runtime y buffers de audio.
- GPU recomendadas: no disponible. El diseño declarado es on-device (iOS), no servidor.
- ¿Cabe en GPU de consumo? Por tamaño de pesos sí cabría en GPUs de consumo con 4 GB o más de VRAM, aunque no hay datos publicados de rendimiento en esas plataformas.
- Opciones de despliegue: runtime `voxcpm2-cli` del repositorio llama.cpp-omni (commit e0eca9d8f57ac8f5a5ad6191a8007b93436c1e71, ruta tools/omni/voxcpm2). No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp estándar.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa 93 pasos y 6 timesteps con semilla 98000, pero no se publican tiempos de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| QnVoice Filipino VoxCPM2 GGUF | 912 M (safetensors); base descrito como 2 B | no disponible | tl (paquete); 30 en el base | Apache 2.0 (pesos) + terminos de referencia | GGUF | Cuantizacion mixta Q4_K_M/Q8_0, on-device |
| openbmb/VoxCPM2 | 2 B (segun descripcion publica) | no disponible | 30 | Apache 2.0 | safetensors (original) | Base tokenizer-free a 48 kHz, clonacion y diseno de voz |
| mlx-community/VoxCPM2-4bit | no disponible | no disponible | 30 | Apache 2.0 (heredada) | MLX 4-bit | Version 4-bit para Apple Silicon; usada para generar la referencia de voz |

No se dispone de datos de benchmarks que permitan comparar calidad de audio entre estas variantes.

## Limitaciones y advertencias

- Validación limitada: el autor indica que las pruebas cubren solo un conjunto pequeño de frases cortas; no hay evaluación sistemática de Taglish ni valoraciones de oyentes nativos.
- El paquete está orientado a filipino/tagalo; no se documenta comportamiento en otros idiomas aunque el base VoxCPM2 soporte 30.
- Licencia de la referencia de voz: los pesos son Apache 2.0, pero el uso de `voice-reference.wav` para síntesis en una app exige citar el manuscrito de Asis (2026) en la pantalla "Acerca de", créditos o documentación pública.
- La referencia de voz es sintética y de un único hablante (voz femenina de registro grave); no hay variedad de voces ni control de prosodia documentado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por la comunidad.
- Dependencia de un runtime específico (fork de llama.cpp-omni en un commit concreto); no hay garantía de compatibilidad con otras herramientas GGUF.
- La cuantización selectiva puede degradar la calidad acústica frente al modelo original; no se publican métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación no aplica en el sentido habitual de texto, pero sí de artefactos acústicos y pronunciaciones incorrectas en palabras no vistas.
- No cubre reconocimiento de voz, traducción ni conversión de voz; quien necesite esas funciones debe buscar componentes adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CholoAsis/qnvoice-filipino-voxcpm2-gguf
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Runtime de ejemplo (llama.cpp-omni, commit fijado): https://github.com/tc-mb/llama.cpp-omni/tree/e0eca9d8f57ac8f5a5ad6191a8007b93436c1e71/tools/omni/voxcpm2
- Release GGUF de origen: https://huggingface.co/tc-mb/MiniCPM-V-Apps-gguf/tree/2a3a3ddfbfc3d8e98c1070680b2fa98df88c3452
- Referencia de voz generada con VoxCPM2-4bit: https://huggingface.co/mlx-community/VoxCPM2-4bit/tree/dc9e5c187858da5f4a13dc4c247e297339216381
- Página del proyecto VoxCPM2: https://voxcpm.app/
