# meldgaard/ilt-whisper-small-danish-ggml

## Resumen

`meldgaard/ilt-whisper-small-danish-ggml` es un artefacto GGML derivado del modelo de reconocimiento automatico del habla (ASR) `thorhojhus/whisper-small-danish`, que a su vez es un ajuste fino del Whisper Small de OpenAI sobre danes. El repositorio no contiene pesos entrenados desde cero ni un modelo original: es una conversion de formato realizada con el script `convert-h5-to-ggml.py` de whisper.cpp, empaquetada para su consumo por la aplicacion movil ILT (Indtal Let Tekst), un proof of concept de transcripcion de voz a texto en danes.

El modelo esta pensado exclusivamente para uso ficticio y de prueba, segun indica el autor en la model card. El artefacto pesa 487.601.984 bytes (unos 465 MiB) y esta publicado como un unico fichero `whisper-small-danish.ggml` con hash SHA-256 documentado, que debe coincidir con el manifiesto `model-manifest.json` de la app cliente. La relevancia practica es limitada: sirve como ejemplo de pipeline de conversion Whisper a GGML para despliegue en dispositivo (Android, via whisper.cpp) y como referencia para integraciones de ASR danes de bajo coste.

La informacion disponible es escasa: no se publican resultados de benchmarks, ni detalles de entrenamiento, ni especificaciones completas de la arquitectura mas alla de la herencia de Whisper Small. Esta ficha documenta lo que consta y marca explicitamente como no disponible todo aquello que la model card no aporta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small de OpenAI, ajustado a danes) |
| Parametros totales | 244 millones (heredados de Whisper Small; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small usa ventanas de audio de 30 s; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el fichero publicado es GGML sin especificar el nivel de cuantizacion; 487.601.984 bytes) |
| Idiomas soportados | danes (modelo ajustado a danes; no se detalla el resto) |
| Licencia | MIT (pesos de `thorhojhus/whisper-small-danish`; README tambien MIT) |
| Formato de pesos | GGML (fichero unico `whisper-small-danish.ggml`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper Small, un transformer encoder-decoder disenado para transcripcion de audio y traduccion de voz, con 244 millones de parametros en su version original. El modelo del que deriva este artefacto, `thorhojhus/whisper-small-danish`, es un ajuste fino de Whisper Small sobre audio en danes, aunque la model card de este repositorio no documenta el volumen de datos, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. No hay informacion sobre innovaciones tecnicas propias: el repositorio es una conversion de formato, no un desarrollo arquitectonico nuevo.

El proceso de conversion se realizo con `convert-h5-to-ggml.py` del proyecto whisper.cpp, fijado a un commit concreto del submodulo, lo que garantiza reproducibilidad. El resultado es un fichero GGML optimizado para inferencia en CPU y en dispositivos moviles mediante whisper.cpp. La model card advierte explicitamente que el artefacto es de uso ficticio y de prueba, sin datos reales de ciudadanos, lo que sugiere que el ajuste fino original puede haberse realizado sobre datos sinteticos o de demostracion.

## Capacidades

- Transcripcion de voz a texto en danes (ASR) mediante whisper.cpp.
- Traduccion de voz a texto (capacidad heredada de Whisper, no verificada para este ajuste concreto).
- Deteccion de idioma (capacidad heredada de Whisper, no verificada).
- Inferencia en dispositivo sin conexion, al estar empaquetado en formato GGML para whisper.cpp.
- Integracion con la app ILT mediante un manifiesto de modelo con hash SHA-256 para verificacion de integridad.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla del audio.

## Casos de uso

- Transcripcion de voz a texto en danes en aplicaciones Android: el fichero GGML esta disenado para cargarse con whisper.cpp en el cliente movil ILT, permitiendo dictado y transcripcion sin conexion gracias al formato optimizado para CPU.
- Prototipado de pipelines de ASR danes: util para validar la cadena completa (audio, preprocesado, inferencia GGML, postprocesado) antes de invertir en modelos mayores o en infraestructura en la nube.
- Verificacion de integridad de artefactos: el hash SHA-256 publicado permite comprobar que el fichero descargado coincide con el que espera el manifiesto de la app, util en pipelines de CI/CD y en distribucion de modelos.
- Educacion y demostraciones: sirve como ejemplo didactico de conversion de un modelo Hugging Face (formato H5/PyTorch) a GGML con whisper.cpp, reproducible con el script documentado.
- Pruebas de regresion de ASR en danes: al ser un artefacto fijo y con hash conocido, se puede usar como referencia estable en tests automatizados de calidad de transcripcion.
- Evaluacion de despliegue en dispositivo de bajo consumo: permite medir latencia y uso de memoria de Whisper Small en moviles y comparar con alternativas cuantizadas o modelos mayores.
- Integracion en herramientas internas de subtitulado en danes: para entornos controlados donde la precision no sea critica y se priorice la ejecucion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El fichero GGML ocupa 487.601.984 bytes (unos 465 MiB), por lo que la memoria necesaria sera del orden de esa cifra mas el overhead de whisper.cpp; no se especifica el nivel de cuantizacion ni el consumo real.
- GPU recomendadas: no disponible. whisper.cpp esta orientado a CPU; el uso de GPU no se documenta en la model card.
- Compatibilidad con GPU de consumo: no disponible. Al ser un artefacto GGML para whisper.cpp, el escenario previsto es CPU y dispositivos moviles, no GPU dedicada.
- Opciones de despliegue: whisper.cpp (unico runtime documentado, mediante el fichero GGML). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo ASR.
- Latencia y throughput: no disponibles. No se publican mediciones de rendimiento en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `meldgaard/ilt-whisper-small-danish-ggml` | 244 M (heredados de Whisper Small; no confirmado) | no disponible | MIT | GGML | Hugging Face, 0 descargas |
| `thorhojhus/whisper-small-danish` | 244 M (heredados de Whisper Small; no confirmado) | no disponible | MIT | safetensors/H5 (no detallado) | Hugging Face |
| OpenAI Whisper Small | 244 M | ventanas de 30 s (no confirmado en la model card) | MIT | PyTorch, entre otros | OpenAI, Hugging Face |

Los datos de la comparativa se limitan a lo que consta en la model card y en la informacion proporcionada; no se dispone de resultados de rendimiento comparables para ninguno de los tres modelos.

## Limitaciones y advertencias

- El autor declara explicitamente que el artefacto es de uso ficticio y de prueba, sin datos reales de ciudadanos; no debe usarse en produccion con datos personales sin una evaluacion propia.
- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre danes, el rendimiento en otros idiomas o en variedades dialectales no esta verificado.
- Riesgo de alucinacion en la transcripcion: Whisper puede generar texto plausible en segmentos con ruido o silencio; no se han publicado evaluaciones de WER que cuantifiquen este riesgo.
- Limitaciones de contexto: no se especifica la ventana de audio soportada; Whisper Small trabaja por defecto en ventanas de 30 s, pero la model card no lo confirma para este artefacto.
- Restricciones de licencia: los pesos siguen la licencia MIT de `thorhojhus/whisper-small-danish` y el README tambien es MIT, por lo que el uso comercial esta permitido segun esos terminos; conviene verificar la cadena de licencias hasta OpenAI Whisper.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-12) y la ausencia de benchmarks o de documentacion de entrenamiento impiden evaluar su calidad de forma independiente.
- No se especifica el nivel de cuantizacion del fichero GGML, lo que dificulta estimar la perdida de precision respecto al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/meldgaard/ilt-whisper-small-danish-ggml
- Modelo de origen: https://huggingface.co/thorhojhus/whisper-small-danish
- Repositorio de la app ILT: https://github.com/peme/ilt
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- OpenAI Whisper (repositorio original): https://github.com/openai/whisper
