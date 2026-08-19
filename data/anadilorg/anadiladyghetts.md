# Anadilorg/AnadilAdygheTTS

## Resumen

AnadilAdygheTTS es un adaptador LoRA de código abierto para síntesis de voz (text-to-speech) en adigué (adyghe o cherkess occidental, ISO 639-3: `ady`), desarrollado por Anadilorg. El modelo se basa en el sistema de TTS de código abierto VoxCPM2 de OpenBMB y se ha ajustado mediante Low-Rank Adaptation (LoRA) sobre un conjunto de datos de 54.004 segmentos de voz de un único locutor, lo que lo convierte en el modelo más grande y entrenado de la familia "Anadil" de adaptadores TTS para lenguas en peligro de extinción, que también incluye variantes para laz y zazaki.

El modelo es relevante porque aborda un problema poco atendido: la preservación de lenguas minoritarias mediante herramientas digitales. La UNESCO clasifica el adigué como lengua "vulnerable" en su Atlas de 2009, y entre la comunidad circasiana de Turquía la fluidez por debajo de los 50 años ha caído hasta aproximadamente el 5%. Este adaptador, de unos 69 MB y aproximadamente 18,1 millones de parámetros, se distribuye bajo licencia MIT y permite generar voz sintética en adigué a partir de texto, tanto en cirílico como en alfabeto latino, con una frecuencia de muestreo de salida de 48 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre VoxCPM2 (modelo base de TTS con LM y capas DiT) |
| Parametros totales | ~18,1 millones (adaptador LoRA, F32); parametros del modelo base no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32 (adaptador); el modelo base VoxCPM2 soporta bfloat16 |
| Idiomas soportados | Adigué (`ady`), turco (`tr`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA: `lora_weights.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre VoxCPM2, un sistema de síntesis de voz de OpenBMB que combina un modelo de lenguaje con capas de arquitectura DiT (Diffusion Transformer). El adaptador se aplica con rango r=32 y alpha α=32 sobre las capas de LM y DiT del modelo base. El entrenamiento se realizó sobre 54.004 segmentos de voz de un único locutor (`spk_tmp_001`) durante 5.000 pasos, lo que constituye el conjunto de datos más grande de la familia Anadil. El adaptador resultante contiene 384 tensores y ocupa aproximadamente 69 MB en precisión F32.

El modelo base VoxCPM2 procesa audio de entrada a 16 kHz y genera audio de salida a 48 kHz. La inferencia se realiza mediante generación iterativa con pasos de difusión (el código de ejemplo usa 10 pasos) y un valor de clasifier-free guidance (cfg) de 2.0. El texto de entrada debe formatearse con la etiqueta `[speaker:spk_tmp_001 language:ady]` antes del texto a sintetizar.

## Capacidades

- Síntesis de voz en adigué (cherkess occidental) a partir de texto, con salida de audio a 48 kHz.
- Soporte de entrada en texto con etiqueta de locutor e idioma: `[speaker:spk_tmp_001 language:ady]`.
- Generación de voz con un único locutor de referencia (`spk_tmp_001`).
- Compatible con el ecosistema VoxCPM: el adaptador se carga sobre el modelo base `openbmb/VoxCPM2`.
- Soporte de inferencia en GPU CUDA, Apple Silicon (MPS) y CPU, aunque con rendimiento reducido en estos dos últimos.
- Incluye scripts de inferencia, demo con interfaz Gradio y pruebas de humo (smoke tests) para verificar la integridad de los pesos.
- Capacidad de síntesis en turco (`tr`) además de adigué, aunque el modelo está especializado en adigué.

## Casos de uso

- Preservación lingüística: generar material de audio en adigué para archivos digitales, documentación y proyectos de revitalización de lenguas en peligro de extinción.
- Aplicaciones educativas: crear materiales de aprendizaje de adigué con audio sintético, como ejercicios de pronunciación, vocabulario y frases para estudiantes de la lengua.
- Audioguías y contenido cultural: producir narraciones en adigué para museos, exposiciones o contenido digital dirigido a la comunidad circasiana de Turquía y la diáspora.
- Asistentes de voz y aplicaciones de accesibilidad: integrar el modelo en asistentes o aplicaciones que necesiten leer texto en adigué en voz alta, como lectores de pantalla o aplicaciones de mensajería.
- Investigación lingüística: generar estímulos auditivos controlados en adigué para estudios de fonética, percepción del habla o sociolingüística.
- Creación de contenido para medios: producir locuciones en adigué para podcasts, vídeos o radio comunitaria sin necesidad de un locutor humano nativo.
- Desarrollo de herramientas de traducción y aprendizaje automático: servir como componente de salida de voz en sistemas de traducción automática que incluyan el adigué.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparaciones cuantitativas con otros sistemas de TTS. La evaluación se presenta únicamente mediante ejemplos de audio comparativos entre el habla original y la síntesis generada, disponibles en el repositorio del modelo.

## Requisitos de hardware

- Disco: aproximadamente 4,7 GB para el modelo base VoxCPM2 más el adaptador LoRA.
- RAM/VRAM: alrededor de 9 GB para inferencia en float32; menos si se usa bfloat16 en GPU CUDA.
- GPU recomendada: cualquier GPU CUDA con al menos 10 GB de VRAM (por ejemplo, RTX 3080/3090, RTX 4080/4090, A100). También funciona en Apple Silicon con al menos 24 GB de memoria unificada, aunque con menor rendimiento.
- Opciones de despliegue: el modelo se usa a través de la librería `voxcpm` de Python, con scripts de inferencia incluidos (`inference.py`), una demo Gradio local (`demo.py`) y pruebas de humo (`test_smoke.py`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles en la documentación proporcionada. La inferencia depende del número de pasos de difusión (10 en el ejemplo) y del hardware utilizado.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos TTS comparables para adigué u otras lenguas caucásicas noroccidentales. El modelo comparte la familia "Anadil" con adaptadores para laz y zazaki, pero no se dispone de datos de rendimiento comparativos entre ellos. Como referencia de arquitectura, el modelo base VoxCPM2 es un sistema TTS de código abierto que soporta múltiples idiomas, pero la comparación directa con otros sistemas de síntesis de voz para lenguas minoritarias no es posible con los datos disponibles.

## Limitaciones y advertencias

- El modelo está entrenado con un único locutor (`spk_tmp_001`), por lo que la voz sintetizada es siempre la misma y no permite transferencia de timbre a otros locutores.
- El conjunto de entrenamiento, aunque es el mayor de la familia Anadil, es limitado en comparación con los datasets de TTS para lenguas mayoritarias, lo que puede afectar a la naturalidad y precisión en textos poco frecuentes o con vocabulario especializado.
- No se han publicado métricas objetivas de calidad de voz (MOS, WER), por lo que la evaluación subjetiva es la única referencia disponible.
- El modelo requiere el modelo base VoxCPM2 (~4,7 GB) además del adaptador, lo que implica un requisito de almacenamiento y memoria considerable.
- La inferencia en CPU o Apple Silicon es posible pero lenta; se recomienda GPU CUDA para un uso práctico.
- No se ha creado un Hugging Face Space público para probar el modelo en línea; la demo solo está disponible para ejecución local.
- El modelo se distribuye bajo licencia MIT, lo que permite uso comercial, pero el usuario debe verificar que el modelo base VoxCPM2 también cumple con sus requisitos de licencia para el uso previsto.
- No se proporcionan datos sobre posibles sesgos o alucinaciones en la síntesis, aunque al ser un sistema de TTS el riesgo principal es la pronunciación incorrecta de palabras fuera del vocabulario de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anadilorg/AnadilAdygheTTS
- Perfil de Anadilorg en Hugging Face: https://huggingface.co/Anadilorg
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Referencia académica mencionada en los tags: arxiv:2106.09685 (no se ha verificado el contenido en la busqueda web)
