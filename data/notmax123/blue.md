# notmax123/blue

## Resumen

Blue es un modelo de síntesis de voz (text-to-speech) multilingüe con el hebreo como idioma principal, desarrollado por el usuario notmax123 y asociado al proyecto de código abierto BlueTTS (repositorio de maxmelichov en GitHub). El repositorio `notmax123/blue` no contiene un modelo listo para inferencia directa, sino los checkpoints en formato Safetensors/PyTorch necesarios para entrenamiento, ajuste fino y exportación de nuevas voces al runtime ONNX. Para síntesis de extremo a extremo, el autor remite al bundle ONNX separado `notmax123/blue-onnx`.

El sistema se descompone en cuatro artefactos: un códec de audio (`blue_codec.safetensors`) que convierte entre mel-espectrograma y espacio latente, un estimador texto-a-latente (`vf_estimator.safetensors`) que integra codificador de texto, codificador de referencia y un núcleo de flow-matching, un predictor de duración (`duration_predictor.safetensors`) y estadísticas de normalización latente multilingües (`stats_multilingual.pt`). Esta arquitectura por componentes permite entrenar y exportar voces personalizadas de forma modular.

Su relevancia radica en ser una de las pocas alternativas abiertas con foco explícito en hebreo dentro de un pipeline TTS moderno (flow-matching, códec latente), con licencia MIT y soporte declarado para inglés, español, italiano y alemán, además de síntesis de idiomas mezclados. No obstante, el repositorio tiene un tamaño de 1,0 GB, cero descargas y un único "like", lo que indica un proyecto incipiente y sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por componentes: códec de audio (mel ↔ latente), estimador texto-a-latente con flow-matching, predictor de duración |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en Safetensors/PyTorch; el runtime ONNX se distribuye aparte) |
| Idiomas soportados | Hebreo (principal), inglés, español, italiano, alemán y síntesis de idiomas mezclados |
| Licencia | MIT |
| Formato de pesos | Safetensors (`.safetensors`) y PyTorch (`.pt`) |

## Arquitectura y entrenamiento

BlueTTS sigue un diseño desacoplado típico de los TTS neuronales modernos basados en latentes. El códec (`blue_codec.safetensors`) aprende una representación latente del audio y permite la conversión entre dominio mel, latente continuo y latente discreto. El estimador `vf_estimator.safetensors` implementa la ruta texto-a-latente e incluye tres subcomponentes: un codificador de texto, un codificador de referencia (para clonación o estilo de voz) y un núcleo de flow-matching, técnica generativa de transporte continuo que sustituye a los difusores clásicos en muchos TTS recientes. El predictor de duración controla el alineamiento temporal fonema-a-frame, y `stats_multilingual.pt` aporta las medias y desviaciones estándar de normalización del espacio latente, idénticas a las usadas en entrenamiento.

El repositorio no documenta el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineamiento forzado, RLHF o ajuste por preferencias. Tampoco se especifican los hiperparámetros del flow-matching ni el número de pasos de integración recomendados. La información disponible se limita a la función de cada checkpoint y a las instrucciones para reentrenar o exportar voces mediante `scripts/export_new_voice.py` del repositorio BlueTTS.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con el hebreo como idioma de referencia.
- Soporte multilingüe declarado para inglés, español, italiano y alemán.
- Síntesis de idiomas mezclados dentro de una misma locución (mixed-language synthesis).
- Codificación y decodificación de audio en espacio latente mediante el códec incluido.
- Predicción de duración para control del ritmo y alineamiento temporal.
- Codificador de referencia que permite condicionar la voz generada a una muestra de audio (clonación/estilo), según la estructura del `vf_estimator`.
- Exportación de nuevas voces a formato ONNX para inferencia en navegador.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada distinto de la referencia de voz.

## Casos de uso

- Lectura de contenido en hebreo para aplicaciones de accesibilidad: el modelo está diseñado hebreo-first, por lo que puede emplearse para convertir artículos, documentos o interfaces en audio con pronunciación nativa, integrándose vía el bundle ONNX `notmax123/blue-onnx`.
- Asistentes de voz multilingües: al soportar hebreo, inglés, español, italiano y alemán, permite construir un único pipeline TTS para productos con audiencia internacional, reduciendo la necesidad de integrar varios motores.
- Clonación de voz para podcasts o audiolibros: el codificador de referencia del `vf_estimator` habilita condicionar la síntesis a una muestra de voz concreta, útil para narración con identidad de marca consistente.
- Síntesis de código mixto (code-switching): escenarios donde una frase combina hebreo e inglés (frecuente en entornos técnicos israelíes) pueden sintetizarse sin cambiar de motor, gracias al soporte declarado de idiomas mezclados.
- Prototipado e investigación en TTS: al distribuir checkpoints de entrenamiento y estadísticas latentes, el repositorio sirve para reproducir el entrenamiento, hacer fine-tuning sobre un corpus propio o experimentar con flow-matching aplicado a voz.
- Exportación de voces personalizadas: mediante `scripts/export_new_voice.py` y el extra `export` de BlueTTS, un equipo puede generar archivos JSON de estilo de voz y desplegarlos en el runtime ONNX para inferencia en navegador o en servidor.
- Demos web interactivas: el Space `notmax123/BlueV2` ejecuta el modelo en ONNX en el navegador, lo que facilita evaluaciones rápidas sin infraestructura GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica el número de parámetros de cada checkpoint, por lo que no puede calcularse una estimación fiable.
- GPU recomendadas: no disponible. Al no conocerse el tamaño del modelo, no es posible determinar si requiere A100, H100 o GPUs de consumo.
- Compatibilidad con GPU de consumo: no disponible. La inferencia en navegador vía ONNX (Space `notmax123/BlueV2`) sugiere que el bundle ONNX puede ejecutarse en CPU o en hardware modesto, pero no se especifican requisitos.
- Opciones de despliegue: runtime ONNX (bundle `notmax123/blue-onnx`), exportación de voces mediante el repositorio BlueTTS con el extra `export`, e inferencia en navegador mediante el Space oficial. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: no disponible.
- Espacio en disco: el repositorio ocupa 1,0 GB en total (cuatro archivos de pesos y estadísticas).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Blue (notmax123/blue) | TTS por componentes con flow-matching | Hebreo, inglés, español, italiano, alemán | MIT | Safetensors, PyTorch, ONNX (bundle aparte) | Hugging Face, GitHub, Space |
| XTTS-v2 (Coqui) | TTS multilingüe con clonación | 17 idiomas (incluye hebreo) | Coqui Public Model License (no comercial en la práctica) | PyTorch | Hugging Face |
| VITS / MMS-TTS (Meta) | TTS por idioma | Múltiples idiomas individuales (incluye hebreo en MMS) | MIT / CC-BY-NC según variante | PyTorch | Hugging Face |
| Piper | TTS ligero para edge | Múltiples idiomas (hebreo limitado) | MIT | ONNX | GitHub, Hugging Face |

La comparación se basa en categoría y disponibilidad pública; no se dispone de métricas objetivas (MOS, WER, similitud de hablante) para Blue que permitan contrastar calidad frente a estas alternativas. Destaca frente a XTTS-v2 por su licencia MIT plenamente permisiva para uso comercial, y frente a Piper por incluir checkpoints de entrenamiento y un codificador de referencia para clonación.

## Limitaciones y advertencias

- El repositorio `notmax123/blue` contiene pesos de entrenamiento y exportación, no un runtime listo para producción; para inferencia debe usarse el bundle ONNX `notmax123/blue-onnx`.
- No se publican métricas de calidad (MOS, WER, similitud de hablante) ni benchmarks, por lo que la calidad real del habla no puede evaluarse a priori.
- El proyecto presenta cero descargas y un único "like" en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- El foco principal es el hebreo; el soporte de español, italiano y alemán se declara en el código de referencia, pero no se detalla su cobertura ni calidad relativa.
- No se documentan sesgos conocidos, pero un TTS entrenado con corpus no especificados puede reproducir sesgos de pronunciación, prosodia o género de voz.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala en textos fuera de dominio, sin que el repositorio documente mitigaciones.
- No se especifican límites de longitud de texto por inferencia ni el comportamiento con contextos largos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar los datos de entrenamiento antes de un despliegue en producción.
- El repositorio es sensible a mayúsculas en el identificador (`notmax123/blue`, no `Blue`), lo que puede provocar errores de descarga si se usa incorrectamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notmax123/blue
- Bundle ONNX para inferencia: https://huggingface.co/notmax123/blue-onnx
- Repositorio BlueTTS en GitHub: https://github.com/maxmelichov/BlueTTS
- Directorio de entrenamiento: https://github.com/maxmelichov/BlueTTS/tree/main/training
- Demo web oficial: https://bluetts.com
- Space de demostración ONNX: https://huggingface.co/spaces/notmax123/BlueV2
