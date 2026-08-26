# AEmotionStudio/smt-omr-models

## Resumen

El modelo `AEmotionStudio/smt-omr-models` es un espejo (mirror) de los checkpoints de SMT-fp (Sheet Music Transformer full-page) publicados originalmente por el grupo PRAIG de la Universidad de Alicante. Se trata de un sistema de reconocimiento óptico de música (OMR) que transcribe partituras completas —incluyendo notación polifónica— a formato simbólico `kern`, superando las limitaciones de los enfoques monofónicos tradicionales. El repositorio organiza tres variantes en subdirectorios separados (`grandstaff`, `polish-scores`, `mozarteum`), cada una entrenada sobre un corpus distinto, y está pensado para integrarse con el cargador de descarga bajo demanda de MAESTRO.

La arquitectura combina un encoder ConvNeXt con un decoder autoregresivo que genera la secuencia `kern`, y se instancia como la clase `SMTModelForCausalLM`. Los pesos se distribuyen en formato `safetensors`, con la licencia MIT, y son byte-idénticos a los originales de PRAIG (verificados mediante sha256 en el momento del espejo). La relevancia actual radica en que ofrece un modelo de OMR de página completa de código abierto, listo para usar en proyectos de digitalización de partituras y musicología computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt (encoder) + autoregressive kern decoder (SMTModelForCausalLM) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (vocabulario KERN embebido en config.json) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la propuesta del artículo "Sheet Music Transformer: End-To-End Optical Music Recognition Beyond Monophonic Transcription" (ICDAR 2024). La arquitectura es híbrida: un encoder ConvNeXt procesa la imagen de la partitura completa (página completa, no solo compases individuales) y un decoder autoregresivo basado en Transformer genera la transcripción en formato `kern`, un lenguaje de texto plano para notación musical. El vocabulario está embebido en el `config.json` de cada variante, lo que facilita su carga sin ficheros externos adicionales.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Cada variante está entrenada sobre un corpus específico: `grandstaff` con partituras de piano grabadas (dos pentagramas), `polish-scores` con partituras históricas impresas de bibliotecas digitales polacas, y `mozarteum` con grabados de la época de Mozart de la Digital1 Mozart Edition. La innovación principal es la capacidad de transcribir partituras polifónicas completas en una sola pasada, superando los métodos basados en segmentación previa de compases.

## Capacidades

- Reconocimiento óptico de música (OMR) de página completa, incluyendo polifonía (múltiples voces y pentagramas).
- Transcripción directa de imagen a secuencia `kern`, sin necesidad de preprocesado de segmentación.
- Soporte de tres dominios de entrada: partituras grabadas de piano (grandstaff), partituras históricas impresas (polish-scores) y grabaciones de la era de Mozart (mozarteum).
- Integración con el ecosistema MAESTRO mediante un cargador de descarga por demanda que organiza los checkpoints en subdirectorios.
- Formato de pesos `safetensors` para carga segura y eficiente.

## Casos de uso

- Digitalización de archivos musicales históricos: las bibliotecas y archivos con fondos de partituras impresas pueden usar la variante `polish-scores` para convertir escaneos a texto `kern` editable, facilitando la preservación y búsqueda del patrimonio musical.
- Musicología computacional: investigadores pueden analizar corpus de partituras en formato simbólico (KERN) para estudios de estilo, análisis armónico o comparativa entre ediciones, sin necesidad de transcribir manualmente.
- Reconstrucción de partituras de Mozart: la variante `mozarteum` permite digitalizar grabaciones de la Digital Mozart Edition, útil para ediciones críticas o restauración de obras.
- Entrenamiento y fine-tuning: al ser de código abierto (MIT), se puede adaptar el modelo a otros estilos de notación o dominios específicos, siempre que se disponga de datos de entrenamiento.
- Pipeline de OCR musical en bibliotecas digitales: integración en sistemas de digitalización masiva para convertir colecciones completas de partituras en formato simbólico indexable.
- Evaluación de sistemas OMR: como modelo de referencia para comparar nuevos enfoques de transcripción automática de música, dado su respaldo académico en ICDAR 2024.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio es un espejo de los checkpoints de PRAIG y la model card no incluye métricas (como precisión de transcripción, WER, o comparación con otros modelos OMR). Para obtener datos de rendimiento, se recomienda consultar el artículo original de Ríos-Vila et al. (2024) o el repositorio oficial `antoniorv6/SMT`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño exacto de los checkpoints, que no se publica en el repositorio).
- GPU recomendadas: no disponible. Dado que es un modelo de visión-lenguaje con encoder ConvNeXt y decoder autoregresivo, se espera que sea ejecutable en GPUs consumer modernas (por ejemplo, RTX 3090/4090 con 16-24 GB) para inferencia de página completa, pero esto es una estimación no confirmada.
- Compatibilidad con consumer GPU: probablemente sí, pero sin datos exactos se recomienda probar con una GPU de al menos 8 GB para variantes pequeñas, y verificar el uso de memoria.
- Opciones de despliegue: se puede ejecutar con el código oficial del repositorio SMT (PyTorch), o integrarlo en un pipeline propio con `transformers` si la clase `SMTModelForCausalLM` está registrada. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay información suficiente para realizar una comparativa cuantitativa con alternativas de la misma categoría. El campo de OMR de página completa tiene pocos modelos de código abierto, y no se dispone de datos de rendimiento del modelo para comparar con otras propuestas (por ejemplo, OMRNet, que aparece en la búsqueda web, pero sin especificaciones públicas en esta información). Se recomienda consultar el artículo de ICDAR 2024 para ver la comparativa experimental original.

## Limitaciones y advertencias

- Es un espejo de checkpoints; no incluye código de entrenamiento ni documentación de datos adicionales más allá de la model card.
- El vocabulario `kern` está embebido en el `config.json`, pero no se documenta el rango de símbolos ni las limitaciones del vocabulario para notaciones no estándar.
- No se han publicado resultados de benchmarks en el repositorio, por lo que el rendimiento real debe validarse en el dominio de aplicación.
- La variante `polish-scores` está entrenada sobre partituras históricas impresas, lo que puede limitar su eficacia en notación contemporánea o digital.
- Al ser un modelo de transcripción, puede alucinar o cometer errores en pasajes complejos o con ruido en la imagen; se recomienda una revisión humana para aplicaciones de alta precisión.
- La licencia MIT permite uso comercial y modificación, pero se debe verificar la atribución del artículo original en caso de publicaciones o productos derivados.

## Enlaces

- Repositorio Hugging Face: [AEmotionStudio/smt-omr-models](https://huggingface.co/AEmotionStudio/smt-omr-models)
- Repositorio oficial del modelo: [antoniorv6/SMT](https://github.com/antoniorv6/SMT)
- Checkpoint original de PRAIG (variante grandstaff): [PRAIG/smt-fp-grandstaff](https://huggingface.co/PRAIG/smt-fp-grandstaff)
- Checkpoint original de PRAIG (variante polish-scores): [PRAIG/smt-fp-polish-scores](https://huggingface.co/PRAIG/smt-fp-polish-scores)
- Checkpoint original de PRAIG (variante mozarteum): [PRAIG/smt-fp-mozarteum](https://huggingface.co/PRAIG/smt-fp-mozarteum)
- Artículo de referencia (ICDAR 2024): Ríos-Vila, A., Calvo-Zaragoza, J., Paquet, T., "Sheet1 Music Transformer: End-To-End Optical Music Recognition Beyond Monophonic Transcription" (citado en la model card)
