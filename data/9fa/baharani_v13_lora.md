# 9FA/baharani_v13_lora

## Resumen

El modelo 9FA/baharani_v13_lora es un adaptador LoRA para el modelo de síntesis de voz VoxCPM2, desarrollado por el usuario 9FA. Está afinado específicamente para el árabe bahreiní (variedad del Golfo) a partir del dataset wldaldakheel/baharani-mix, con el objetivo de mejorar la naturalidad y precisión dialectal en la generación de voz para esta variante lingüística. El adaptador se publica en el paso 9000 de 15000, seleccionado por validación, ya que el entrenamiento sobreajustó después de ese punto.

La relevancia de este modelo radica en que aborda un dialecto árabe poco representado en los sistemas TTS comerciales, ofreciendo una solución de código abierto bajo licencia Apache-2.0. Sin embargo, presenta una limitación crítica documentada: una duración mínima de salida de aproximadamente 3,04 segundos, lo que impide generar locuciones cortas como palabras sueltas o fragmentos de IVR. Esta restricción se debe a la distribución de duraciones del dataset de entrenamiento, donde el 37,8% de las muestras tienen exactamente 3,00 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre VoxCPM2 (modelo base openbmb/VoxCPM2) |
| Parametros totales | no disponible (el repo ocupa 0,1 GB, pero no se especifica el número de parámetros del adaptador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a voz, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (especificamente arabe bahreini / del Golfo) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica explicitamente) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre VoxCPM2, un modelo de síntesis de voz de la familia VoxCPM. La configuración del adaptador es r=32, alpha=64, dropout 0.0, y adapta las proyecciones q/k/v/o tanto del módulo de lenguaje (LM) como del DiT (Diffusion Transformer), dejando sin adaptar las proyecciones de salida. El entrenamiento se realizó con 97.087 segmentos de entrenamiento y 1.252 de validación, a 16 kHz de entrada y 48 kHz de salida, en precisión bfloat16, con un lote efectivo de 16 (2 × 8 con acumulación de gradientes) y un máximo de 4096 tokens por lote. Se usó una tasa de aprendizaje de 1e-4 con un calentamiento de 300 pasos y una programación efectivamente constante (el decaimiento coseno solicitado no se aplicó correctamente, cayendo solo de 1.00e-4 a 9.5e-5 en todo el entrenamiento). El entrenamiento duró 15.000 pasos (2,47 épocas) en una GPU A40 de 46 GB, con un tiempo total de aproximadamente 10,5 horas. El checkpoint publicado es el paso 9000, seleccionado por menor pérdida de validación total (0,984550) y por ser el único que mantiene la duración de las referencias en las pruebas de generación condicionada.

## Capacidades

- Generacion de voz en arabe bahreini con acento del Golfo, condicionada por referencia (voice cloning a partir de un clip de audio).
- Generacion zero-shot sin referencia, aunque el autor advierte que la calidad en este modo no debe usarse para evaluar el adaptador, ya que el modelo base tambien es erratico en ese escenario.
- Soporte de generacion condicionada por referencia recomendada: produce niveles consistentes (−16 a −21 dBFS) y sin colapso de nivel.
- Integracion con el ecosistema VoxCPM2: el adaptador se puede cargar con `VoxCPM.from_pretrained` usando `LoRAConfig` con r=32, alpha=64, lo que permite su uso en servidores que fijen r=32 (compatibilidad con el problema #283 de VoxCPM).
- Limitacion conocida: duracion minima de salida de ~3,04 segundos, que estira las locuciones cortas en lugar de anadir silencio.

## Casos de uso

- Doblaje de contenido audiovisual al arabe bahreini: el modelo puede generar voces naturales para personajes o narraciones, condicionando con una referencia de voz del actor original para mantener consistencia timbrica.
- Asistentes de voz para aplicaciones de servicios publicos en Bahrein: aunque la limitacion de duracion minima impide respuestas cortas tipo "si" o "no", puede usarse para mensajes de mas de 3 segundos, como lecturas de noticias o avisos.
- Creacion de audiolibros en dialecto bahreini: el modelo permite sintetizar narraciones largas con entonacion natural, aprovechando la ventana de contexto amplia del modelo base (aunque no se especifica la longitud exacta).
- Desarrollo de sistemas de respuesta de voz interactiva (IVR) para empresas locales: siempre que los mensajes superen los 3,04 segundos, el adaptador puede generar locuciones con acento local, mejorando la experiencia del usuario frente a voces genericas.
- Investigacion en dialectologia computacional: el adaptador sirve como herramienta para estudiar la prosodia y fonetica del arabe bahreini, generando estimulos controlados para experimentos de percepcion.
- Prototipado rapido de aplicaciones TTS multilingue: al ser un adaptador LoRA ligero (0,1 GB), se puede integrar en pipelines existentes de VoxCPM2 sin necesidad de reentrenar el modelo base, facilitando pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MOS, WER o similitud de voz) en la informacion disponible. Sin embargo, la model card incluye metricas de validacion y pruebas de duracion que se presentan a continuacion.

Pérdida de validación por paso de entrenamiento:

| step | loss/total | loss/diff | loss/stop |
|---|---|---|---|
| 0 | 1.156592 | 0.981617 | 0.174975 |
| 3000 | 1.023304 | 0.968512 | 0.054792 |
| 6000 | 1.004614 | 0.943909 | 0.060706 |
| **9000** | **0.984550** | 0.942001 | **0.042549** |
| 12000 | 1.007939 | **0.933669** | 0.074270 |
| 14999 | 1.004583 | 0.958660 | 0.045923 |

Prueba de duracion generada frente a duracion de referencia (en segundos):

| step | ref 4.0 s | ref 6.0 s | ratios |
|---|---|---|---|
| 0 | 3.84 | 7.20 | 0.96 / 1.20 |
| 3000 | 4.00 | 5.12 | 1.00 / 0.85 |
| 6000 | 4.00 | 4.00 | 1.00 / 0.67 |
| **9000** | **4.00** | **6.08** | **1.00 / 1.01** |
| 12000 | 4.00 | 5.12 | 1.00 / 0.85 |
| 14999 | 4.00 | 4.00 | 1.00 / 0.67 |

Medicion de duracion minima en seis prompts cortos (5-7 palabras) con semilla fija y condicionamiento por referencia:

| sample | 00 | 01 | 02 | 03 | 04 | 05 |
|---|---|---|---|---|---|---|
| untuned base VoxCPM2 | 2.08 | 2.24 | 2.40 | 3.04 | 4.16 | 2.24 |
| **v13 step 9000** | 3.04 | 3.20 | 3.04 | 3.04 | 5.12 | 3.04 |

## Requisitos de hardware

- El entrenamiento se realizo en una GPU A40 de 46 GB VRAM, con un tiempo de ~10,5 horas para 15.000 pasos. Para inferencia, los requisitos son considerablemente menores, pero no se especifican en la documentacion.
- Dado que el adaptador es un LoRA sobre VoxCPM2, la VRAM necesaria depende del modelo base. VoxCPM2 es un modelo de TTS relativamente ligero en comparacion con LLMs, pero no se dispone de cifras exactas de VRAM para inferencia.
- Se recomienda al menos una GPU con 8-12 GB de VRAM para ejecutar el modelo base con el adaptador, aunque esto es una estimacion no confirmada por el autor.
- Opciones de despliegue: el modelo se integra con la libreria `voxcpm` de Python. Se puede usar en entornos con GPU NVIDIA (CUDA) y tambien en CPU, aunque con mayor latencia. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para evitar la dependencia de `modelscope`, se recomienda cargar con `load_denoiser=False`, como se indica en el codigo de ejemplo.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para TTS en arabe bahreini. La unica comparacion directa disponible es contra el modelo base VoxCPM2 sin afinar, que se muestra en la tabla de duracion minima anterior. El adaptador v13 mejora la consistencia de duracion en referencias largas (6,0 s) pero introduce el suelo de 3,04 s. No se conocen otros modelos TTS especificos para este dialecto en el ecosistema open source.

## Limitaciones y advertencias

- Duracion minima de salida de ~3,04 segundos: el modelo no puede generar locuciones mas cortas, estirando el audio en lugar de anadir silencio. Esto invalida su uso para palabras sueltas, confirmaciones breves o fragmentos de IVR.
- Sobreajuste en el entrenamiento: el checkpoint publicado (paso 9000) es anterior al final del entrenamiento (paso 15000) porque la perdida de validacion aumento despues del paso 9000. El modelo final no se publica.
- Dependencia de `modelscope` si se carga el denoiser: se recomienda usar `load_denoiser=False` para evitar errores de importacion.
- La generacion zero-shot no es fiable para evaluar la calidad del adaptador; se recomienda usar siempre condicionamiento por referencia.
- El dataset de entrenamiento tiene un sesgo hacia duraciones de 3,00 segundos (37,8% de las muestras), lo que explica la limitacion de duracion y puede afectar a la prosodia de frases mas largas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base VoxCPM2 tiene su propia licencia que debe verificarse por separado.
- No se proporcionan datos sobre sesgos de genero, edad o acentos dentro del arabe bahreini, ni sobre la robustez frente a ruido o diferentes condiciones acusticas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/9FA/baharani_v13_lora
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Dataset de entrenamiento: https://huggingface.co/datasets/wldaldakheel/baharani-mix
