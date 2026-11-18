# Abol0pati/whisper-small-fa-sokhan

## Resumen

`whisper-small-fa-sokhan` es un ajuste fino del modelo `openai/whisper-small` orientado a reconocimiento automatico del habla (ASR) en persa (farsi). Lo desarrolla el usuario Abol0pati como parte del proyecto Sokhan, y emplea LoRA (PEFT) sobre las proyecciones `q_proj` y `v_proj` del transformer original, congelando el resto de los pesos. El resultado se fusiona con el modelo base y se convierte a CTranslate2 para servirse con faster-whisper en CPU con cuantizacion int8, que es la configuracion que el producto Sokhan usa en produccion.

El modelo parte de la arquitectura Whisper small de OpenAI: un transformer encoder-decoder de tipo speech-to-text con 244 millones de parametros y una ventana de audio de 30 segundos por segmento. El ajuste se realizo sobre 500 clips de Common Voice en persa (aproximadamente 45 minutos de audio), en unas 7 minutos sobre una T4 de Colab, lo que lo convierte en un ejemplo de adaptacion linguistica de bajo coste mas que en un modelo de produccion.

Su relevancia es doble: por un lado, demuestra un flujo reproducible de adaptacion de Whisper a un idioma con pocos recursos mediante LoRA y despliegue en CPU; por otro, el propio autor advierte de que las metricas medidas (WER 79,3 % y CER 24,9 % sobre un fixture de 12 clips) estan cerca del ruido estadistico y no permiten calificarlo como ASR persa listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) con adaptadores LoRA fusionados |
| Parametros totales | 244 millones (whisper-small); el adaptador LoRA se fusiona en los pesos base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana nativa de Whisper) |
| Tipos de cuantizacion | float16 en la conversion a CTranslate2; int8 en serving con faster-whisper |
| Idiomas soportados | persa (fa) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) y CTranslate2 (modelo convertido para faster-whisper) |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-small`, un transformer encoder-decoder entrenado originalmente por OpenAI para transcripcion multilingue y traduccion de voz. Sobre el se aplico un adaptador LoRA con rango r=16, alpha=32 y dropout=0,05 unicamente en las proyecciones `q_proj` y `v_proj`, con learning rate 1e-4 y 3 epocas. Los pesos base no se modificaron durante el entrenamiento; el adaptador se fusiono posteriormente y el checkpoint resultante se convirtio con `ct2-transformers-converter --quantization float16`, para luego servir en int8 mediante faster-whisper.

Los datos de entrenamiento son 500 clips del split `train` de Common Voice 17.0 en persa, aproximadamente 45 minutos de voz, obtenidos desde un espejo publico en parquet (Mozilla ya no republica las descargas de Common Voice fa). La evaluacion durante el entrenamiento sobre 10 clips reservados muestra una evolucion de WER del 85,1 % al 81,6 % y una perdida de entrenamiento de 3,63 a 1,75. No se documenta uso de RLHF ni DPO, ni innovaciones de decodificacion mas alla del `beam_size=5` estandar de faster-whisper.

## Capacidades

- Transcripcion de voz a texto en persa con salida de segmentos temporizados.
- Reconocimiento de habla espontanea y ruidosa, ya que el entrenamiento usa Common Voice, que es coloquial y contiene ruido.
- Normalizacion de texto persa aplicada tanto a referencias como a hipotesis en la evaluacion del autor.
- Despliegue en CPU mediante faster-whisper con `compute_type="int8"`.
- Ejecucion en navegador con transformers.js y ONNX q8 para el checkpoint base o small sin ajustar (la demo publica no sirve el checkpoint ajustado).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada al persa; no se declaran otros idiomas.

## Casos de uso

- Transcripcion de reuniones y notas de voz en persa: el modelo puede procesar segmentos de hasta 30 segundos con faster-whisper en CPU, lo que permite desplegarlo en servidores sin GPU para uso interno.
- Subtitulado de contenido audiovisual persa: la salida segmentada con marcas temporales facilita la generacion de subtitulos en formato SRT, aunque la calidad medida aconseja revision humana.
- Prototipado de asistentes de voz en persa: sirve como base para experimentar con pipelines de ASR antes de invertir en un modelo mayor o en un ajuste con mas datos.
- Investigacion en adaptacion linguistica de bajo coste: el flujo LoRA + CTranslate2 + faster-whisper es reproducible en una T4 gratuita y sirve de plantilla para otros idiomas con pocos recursos.
- Indexacion y busqueda de archivos de audio persa: la transcripcion permite generar texto indexable para busqueda sobre grabaciones de archivo o centros de llamadas.
- Evaluacion comparativa de tecnicas de ajuste: el modelo incluye un script de benchmark reproducible (`benchmarks/benchmark_wer.py`) que permite medir el efecto de LoRA frente al Whisper small original.
- Despliegue en dispositivos de borde: la cuantizacion int8 y el tamano reducido del modelo small permiten ejecucion en CPU de portatiles o mini-PC sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos sobre un fixture de 12 clips reales de Common Voice fa con referencias verificadas por humanos, `beam_size=5`, normalizacion persa aplicada, faster-whisper 1.2.1 / CTranslate2 4.9.0 en CPU int8. No verificados de forma independiente.

| Modelo | WER | CER |
|---|---|---|
| openai whisper-small (baseline) | 80,5 % | 26,7 % |
| whisper-small-fa-sokhan | 79,3 % | 24,9 % |

Evaluacion interna durante el entrenamiento (10 clips reservados): WER 85,1 % → 81,6 %; perdida de entrenamiento 3,63 → 1,75. El autor advierte de que el margen de -1,2 puntos de WER esta cerca del ruido estadistico con solo 12 clips y de que el techo real es desconocido hasta ejecutar el mismo notebook sobre el manifiesto completo de aproximadamente 10 horas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 para el modelo small; aproximadamente 0,5 GB de pesos en el repositorio.
- GPU recomendadas: no requiere GPU; el autor entreno en una T4 gratuita de Colab y sirve en CPU int8.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y tambien en CPU sin acelerador dedicado.
- Opciones de despliegue: faster-whisper con CTranslate2 (configuracion de referencia), transformers.js con ONNX q8 para navegador, y Gradio autoalojado con la app del repositorio Sokhan.
- Latencia y throughput: no disponibles de forma cuantificada; el autor indica aproximadamente 2 horas en una T4 gratuita para procesar el manifiesto completo de unas 10 horas de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| whisper-small-fa-sokhan | 244 M | 30 s por segmento | fa | MIT | Checkpoint ajustado, WER 79,3 % en fixture de 12 clips |
| openai/whisper-small | 244 M | 30 s por segmento | multilingue | MIT | Modelo base, WER 80,5 % en el mismo fixture |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento | multilingue | MIT | Modelo mayor de referencia; no evaluado en este fixture |

No se dispone de datos comparativos con otros ajustes persas de Whisper en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no debe citarse como ASR persa listo para produccion.
- El margen de mejora sobre el baseline (-1,2 puntos de WER) se midio sobre solo 12 clips y esta cerca del ruido estadistico; el techo real es desconocido.
- El entrenamiento uso solo 500 clips (aproximadamente 45 minutos), lo que limita la cobertura de vocabulario, acentos y condiciones acusticas.
- Common Voice fa es coloquial y ruidoso; los WER absolutos son muy superiores a los de benchmarks de habla leida.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos no representados o vocabulario tecnico.
- Soporte limitado al persa; no se declaran capacidades multilingues ni de traduccion.
- Licencia MIT para el modelo y CC-0 para los datos; no se documentan restricciones adicionales de uso comercial, pero la calidad medida desaconseja su uso en produccion sin validacion adicional.
- La demo publica en Spaces no sirve el checkpoint ajustado; para usarlo hace falta un motor real (faster-whisper o Gradio autoalojado).
- No se han publicado resultados sobre el manifiesto completo de evaluacion; las cifras actuales son preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abol0pati/whisper-small-fa-sokhan
- Modelo base: https://huggingface.co/openai/whisper-small
- Demo en Spaces: https://huggingface.co/spaces/Abol0pati/sokhan-fa-demo
- Repositorio Sokhan: https://github.com/Abolfazlrwm/sokhan
- App Gradio del proyecto: https://github.com/Abolfazlrwm/sokhan/tree/main/space/gradio
- Pipeline de entrenamiento: https://github.com/Abolfazlrwm/sokhan/tree/main/training
- Documentacion de GPU gratuita: https://github.com/Abolfazlrwm/sokhan/blob/main/docs/free-gpu.md
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
