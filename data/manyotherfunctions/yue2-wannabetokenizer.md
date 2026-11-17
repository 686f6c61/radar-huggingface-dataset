# ManyOtherFunctions/Yue2-WannabeTokenizer

## Resumen

Yue2-WannabeTokenizer es un paquete de inferencia offline publicado por el usuario ManyOtherFunctions en Hugging Face. No es un modelo de lenguaje generativo al uso, sino un componente de tokenización y reconstrucción de audio construido sobre la arquitectura YuE2, un sistema orientado a la generación musical. El repositorio empaqueta un tokenizador unificado (encoder MERT2 más cuantizador coseno) que convierte audio en identificadores semánticos discretos a 25 Hz y permite reconstruir la señal original mediante el decodificador NAR y el VAE de YuE2.

El interés técnico reside en su planteamiento autocontenido: no realiza descargas desde el Hub, no ejecuta código remoto y no utiliza checkpoints en formato pickle, lo que reduce la superficie de ataque y las dependencias en producción. El tokenizador se distribuye en un único checkpoint safetensors de 5,1 GB, mientras que el checkpoint de YuE2 (denominado `yue2_3b_bf16.safetensors`) debe aportarse por separado.

La relevancia actual es acotada pero concreta: sirve como herramienta de investigación para estudiar la representación discreta de audio musical, para pipelines de reconstrucción generativa de audio y como base para experimentos de tokenización a 25 Hz con vocabulario de 32 768 identificadores. La información pública disponible es escasa: no hay pipeline declarado, ni licencia propia especificada, ni idiomas documentados, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador MERT2 con cuantizador coseno; reconstruccion mediante NAR y decodificador VAE de YuE2 |
| Parametros totales | no disponible (el checkpoint de YuE2 referenciado se denomina `yue2_3b_bf16`, lo que sugiere ~3B en ese componente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa audio por ventanas; frecuencia de tokenizacion de 25 Hz) |
| Tipos de cuantizacion | bf16 para el checkpoint de YuE2; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | no disponible para el repositorio; el checkpoint de YuE2 se declara CC-BY-NC-4.0 |
| Formato de pesos | safetensors (`WannabeTokenizer.safetensors`, `yue2_3b_bf16.safetensors`) |

## Arquitectura y entrenamiento

El paquete combina dos etapas. La primera es un tokenizador unificado que integra un encoder MERT2 y un cuantizador coseno, y produce una secuencia unidimensional de identificadores `int32` en el rango 0..32767 a una frecuencia de 25 Hz. La segunda etapa es el renderizador de YuE2, que emplea un modelo autorregresivo no (NAR) con prompt vacío de etiquetas y letras, junto con un decodificador VAE, para reconstruir audio estéreo a 48 kHz en PCM-24.

La reconstrucción es generativa y dependiente de semilla: no es una inversión sin pérdidas de la grabación original. Distintas semillas producen audio ligeramente distinto a partir de los mismos tokens. El proceso de tokenización incorpora la sonoridad del audio en los identificadores, y el renderizador reproduce el nivel que estos llevan. El paquete aplica una normalización de ganancia global basada en RMS con puerta y un limitador de picos, sin ganancias por sección, para preservar la dinámica. El modo `band` (por defecto) mantiene el audio dentro del rango habitual de YuE2 (por defecto -21 a -13 dBFS si el checkpoint no declara otro), el modo `all` lo lleva a -16,5 dBFS y el modo `asis` lo deja como está.

No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Tokenización de audio a identificadores semánticos discretos a 25 Hz con vocabulario de 32 768 entradas.
- Reconstrucción de audio a partir de tokens mediante NAR y VAE de YuE2, con salida WAV estéreo a 48 kHz y PCM-24.
- Soporte de múltiples formatos de entrada vía libsndfile o torchaudio: WAV, FLAC, OGG, MP3 y M4A.
- Control de sonoridad mediante modos `band`, `all` y `asis`, con informe de la ganancia aplicada.
- Ejecución offline y autocontenida: sin descargas del Hub, sin código remoto y sin checkpoints pickle.
- API de Python (`WannabeTokenizer`, `YuE2Renderer`) y punto de entrada de línea de comandos (`run_tokenizer.py` o `wannabe-tokenize`).
- Gestión de memoria: el tokenizador se libera antes de cargar YuE2 y el decodificador VAE reduce el tileo automáticamente tras un error de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio-texto ni multilingüismo.

## Casos de uso

- Investigación sobre representación discreta de audio musical: el tokenizador permite convertir canciones en secuencias de 25 Hz y estudiar la relación entre tokens y contenido musical, con reconstrucción generativa para evaluar la fidelidad de la representación.
- Reconstrucción generativa de audio en pipelines de experimentación: útil para probar variaciones de semilla y pasos de muestreo (`--steps 32`) sobre los mismos tokens y analizar la variabilidad del renderizador NAR.
- Normalización de sonoridad en preprocesado: el modo `band` o `all` permite homogeneizar el nivel de un corpus antes de tokenizarlo, con ganancia global y limitador de picos para preservar la dinámica.
- Integración en aplicaciones de Python: la API `WannabeTokenizer` y `YuE2Renderer` permite incorporar tokenización y reconstrucción en scripts o servicios, liberando memoria del encoder antes de cargar el renderizador.
- Pruebas de humo numéricas tras instalación: el flujo extremo a extremo con ambos checkpoints sirve como verificación de que la instalación de PyTorch, torchaudio y CUDA funciona correctamente.
- Análisis de sensibilidad a la rejilla de tramas: dado que los identificadores dependen de dónde cae la rejilla de 40 ms, el paquete permite estudiar la variabilidad entre codificaciones del mismo audio en distintos formatos (MP3 frente a M4A).
- Despliegue en entornos con GPU consumer: con un checkpoint de YuE2 en bf16 y gestión automática de tileo del VAE, puede ejecutarse en tarjetas con memoria limitada, aunque se recomienda CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Python 3.10 o superior, PyTorch 2.5 o superior y una build de torchaudio compatible.
- GPU CUDA fuertemente recomendada para la reconstrucción con YuE2; el checkpoint de YuE2 se distribuye en bf16.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 5,1 GB y el checkpoint de YuE2 se denomina `yue2_3b_bf16`, lo que sugiere una huella en torno a varios GB en bf16, aunque no se confirma.
- GPU recomendadas: no disponible. El tileo automático del VAE tras errores de memoria sugiere que puede ejecutarse en GPUs con memoria limitada, pero no se especifican modelos.
- Cabe en GPU consumer: no confirmado; la gestión de memoria y el tileo del VAE apuntan a que es posible, pero sin datos concretos de VRAM.
- Opciones de despliegue: ejecución directa con `run_tokenizer.py`, entrada de paquete `wannabe-tokenize` y API de Python. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que entradas más largas requieren más memoria y tiempo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de tokenización de audio o reconstrucción generativa con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- La reconstrucción es generativa y dependiente de semilla; no es una inversión sin pérdidas del audio original.
- Los identificadores dependen de la posición de la rejilla de 40 ms, por lo que dos codificaciones del mismo audio en formatos distintos pueden diferir notablemente. Se recomienda decodificar siempre desde el mismo fichero.
- La licencia del repositorio no está especificada; el checkpoint de YuE2 se declara CC-BY-NC-4.0, lo que restringe el uso comercial de ese componente. Revisar las licencias de modelos y dependencias antes de redistribuir o usar comercialmente.
- No se documentan sesgos, pero al operar sobre audio musical puede heredar sesgos de los datos de entrenamiento de YuE2, no disponibles.
- Riesgo de alucinación en sentido generativo: el renderizador puede producir audio plausible pero no fiel al original.
- Limitaciones de idioma: no aplica directamente, pero no se documenta soporte multilingüe ni de texto.
- Requiere aportar por separado el checkpoint `yue2_3b_bf16.safetensors`; el paquete no lo incluye.
- El uso de `--level asis` está pensado para audio generado por YuE2; aplicarlo a otras fuentes puede desviar el nivel respecto al rango esperado.
- No se documentan benchmarks ni métricas objetivas de calidad de reconstrucción.

## Enlaces

- Hugging Face: https://huggingface.co/ManyOtherFunctions/Yue2-WannabeTokenizer
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
