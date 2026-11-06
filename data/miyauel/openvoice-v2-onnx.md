# Miyauel/openvoice-v2-onnx

## Resumen

`Miyauel/openvoice-v2-onnx` es una exportación a formato ONNX del *tone color converter* de OpenVoice V2, el modelo de conversión de voz desarrollado por MyShell.ai. No se trata de un modelo de lenguaje ni de un sistema TTS completo, sino de un componente especializado que transforma el timbre de una señal de audio ya sintetizada o grabada para que suene como la voz de un hablante de referencia. El autor de la exportación es Miyauel, que lo publica como pieza del motor de lectura en voz propia del proyecto Meari.

El valor práctico de esta ficha radica en que elimina la dependencia de PyTorch en el *runtime*: los pesos originales se mantienen intactos y solo cambia el formato del grafo, de modo que puede ejecutarse con ONNX Runtime en entornos ligeros, aplicaciones de escritorio o servicios sin GPU dedicada. Con un tamaño de repositorio de 0,1 GB, es un artefacto pequeño y fácil de empaquetar.

Es relevante ahora porque la conversión de voz *zero-shot* se está integrando en asistentes personales y herramientas de accesibilidad, y disponer de una versión ONNX verificada (con tolerancia declarada de 2e-5 frente a PyTorch para `tau = 0`) simplifica el despliegue multiplataforma. La licencia MIT facilita su incorporación en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de conversión de timbre (tone color converter) de OpenVoice V2, exportada a grafo ONNX; codificador de tono (`ref_enc`) + conversor de espectrograma a audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de espectrograma lineal `[1, T, 513]` y salida de audio `[1, 1, N]` a 22.050 Hz |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye los grafos ONNX sin variantes cuantizadas declaradas) |
| Idiomas soportados | no disponible (el modelo opera sobre señal acústica, no sobre texto; el idioma depende del TTS que genere la señal de entrada) |
| Licencia | MIT (Copyright 2024 MyShell.ai) |
| Formato de pesos | ONNX (`tone_encoder.onnx`, `tone_converter.onnx`) + `openvoice.json` con ajustes de espectrograma y procedencia |

## Arquitectura y entrenamiento

El artefacto es una exportación directa del *checkpoint* `converter/checkpoint.pth` de `myshell-ai/OpenVoiceV2` (commit `f36e7edfe1684461a8343844af60babc2efbb727`, sha256 `9652c27e92b6b2a91632590ac9962ef7ae2b712e5c5b7f4c34ec55ee2b37ab9e`). Los pesos no se han modificado: solo se ha reescrito el grafo en formato ONNX. El pipeline se divide en dos grafos: `tone_encoder.onnx` toma un espectrograma lineal `[1, T, 513]` y produce un *embedding* de tono `[1, 256, 1]` mediante el módulo `ref_enc`; `tone_converter.onnx` recibe el espectrograma `[1, 513, T]`, las longitudes, los *embeddings* de tono origen y destino y el parámetro `tau [1]`, y genera audio `[1, 1, N]` a 22.050 Hz.

El preprocesado de espectrograma se calcula fuera del grafo: *padding* reflectante de `(n_fft - hop) / 2`, ventana Hann periódica, sin centrado y magnitud `sqrt(re² + im² + 1e-6)`. La equivalencia numérica con la implementación PyTorch es de 2e-5 para `tau = 0`, lo que confirma que la exportación es fiel. No se dispone de información sobre el corpus de entrenamiento original de OpenVoice V2, el número de tokens ni el uso de RLHF o DPO; esos detalles corresponden al modelo base y no se detallan en la model card de esta exportación.

## Capacidades

- Conversión de timbre (*voice conversion*): transforma el color tonal de una señal de audio para aproximarlo al de un hablante de referencia.
- Extracción de *embedding* de tono a partir de espectrogramas lineales mediante `tone_encoder.onnx`.
- Síntesis de audio a 22.050 Hz a partir del espectrograma convertido.
- Control del grado de conversión mediante el parámetro `tau`.
- Ejecución sin PyTorch: inferencia con ONNX Runtime en CPU o GPU.
- Integración en pipelines de TTS existentes como etapa posterior a la síntesis (por ejemplo, para leer texto con la voz del usuario).
- No soporta *tool calling*, agentes, razonamiento multi-step, visión ni audio de entrada en sentido amplio: es un componente acústico especializado.

## Casos de uso

- Lectura de texto con la voz del usuario: el motor Meari sintetiza el texto con un TTS genérico y aplica `tone_converter.onnx` con el *embedding* de tono del usuario para que la locución suene a su propia voz; el tamaño reducido del artefacto permite empaquetarlo en aplicaciones de escritorio.
- Herramientas de accesibilidad para personas con pérdida de habla: se conserva un *embedding* de referencia de la voz del paciente y se aplica a texto sintetizado para mantener su identidad vocal en comunicadores aumentativos.
- Doblaje y localización de contenido: se convierte la voz de un actor a la del actor de doblaje manteniendo prosodia y duración, usando el conversor como etapa final del pipeline.
- Anonimización de voz en grabaciones: se sustituye el timbre original por el de una voz de referencia consentida antes de publicar entrevistas o material sensible.
- Prototipado rápido de personajes en videojuegos: se genera una única voz base y se derivan variantes de timbre con distintos *embeddings* de referencia, sin reentrenar modelos.
- Despliegue en entornos sin PyTorch: servicios en contenedores mínimos o dispositivos *edge* donde instalar el *stack* completo de PyTorch no es viable; ONNX Runtime reduce el peso de dependencias y el tiempo de arranque.
- Investigación en conversión de voz: al estar los pesos sin modificar y documentada la procedencia con *hash*, sirve como referencia reproducible para comparar implementaciones ONNX frente a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica declarada es la equivalencia numérica con PyTorch: con `tau = 0`, la salida del grafo ONNX difiere como máximo en 2e-5 respecto a la implementación original.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en GPUs de gama baja y en CPU.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA o DirectML); no se requiere A100 ni H100 para este componente.
- GPU de consumo: sí, cabe en cualquier GPU de consumo con soporte ONNX Runtime, e incluso en CPU para audio de duración moderada.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT), integración en el motor Meari; no se distribuyen pesos GGUF ni formatos para llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen de la longitud del audio, del *hardware* y del proveedor de ejecución de ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Miyauel/openvoice-v2-onnx | Conversor de timbre (ONNX) | no disponible | Audio 22.050 Hz; entrada espectral `[1, T, 513]` | MIT | Hugging Face (este repo) |
| OpenVoice V2 (MyShell.ai) | Conversor de timbre + TTS (PyTorch) | no disponible | Audio; requiere PyTorch | MIT | GitHub y Hugging Face |
| RVC (Retrieval-based Voice Conversion) | Conversión de voz | no disponible | Audio; requiere PyTorch | MIT | GitHub |
| So-VITS-SVC | Conversión de voz (canto/habla) | no disponible | Audio; requiere PyTorch | AGPL-3.0 (verificar) | GitHub |

La comparación cuantitativa de parámetros y rendimiento no está disponible en la información proporcionada; la diferencia principal de esta exportación frente a las alternativas es el formato ONNX sin PyTorch y la licencia MIT permisiva.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite *prompts*; solo transforma señal acústica.
- El idioma y la calidad final dependen del TTS que produzca la señal de entrada; el conversor no aporta cobertura lingüística propia.
- Riesgo de artefactos y pérdida de naturalidad en audios largos, ruidosos o con prosodia atípica; no se documentan métricas de calidad perceptual (MOS) en el repositorio.
- El preprocesado de espectrograma debe replicarse exactamente (ventana Hann periódica, *padding* reflectante, sin centrado); cualquier desviación degrada la salida.
- Uso dual: la conversión de voz puede emplearse para suplantación de identidad; es responsabilidad del integrador obtener consentimiento y aplicar medidas de transparencia.
- Sesgos: no documentados en la model card; al derivar de OpenVoice V2, hereda los sesgos acústicos del corpus original, no disponible en esta ficha.
- Licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de MyShell.ai.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay validación comunitaria ni issues públicos que confirmen su robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Miyauel/openvoice-v2-onnx
- Repositorio OpenVoice (MyShell.ai): https://github.com/myshell-ai/OpenVoice
- Proyecto Meari: https://github.com/Miyauel/Meari
- *Script* de exportación: `engine/spikes/voice_add/export_openvoice_onnx.py` en el repositorio Meari
