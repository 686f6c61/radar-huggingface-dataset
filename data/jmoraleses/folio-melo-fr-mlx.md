# jmoraleses/folio-melo-fr-mlx

## Resumen

Folio Melo MLX (fr) es un checkpoint de inferencia del sistema de síntesis de voz MeloTTS, concretamente el modelo VITS2 para francés, convertido al formato Safetensors para su uso con MLX en Apple Silicon. Lo publica el desarrollador jmoraleses como parte del proyecto Folio iOS, una aplicación que implementa la inferencia de forma nativa en Swift sobre el framework MLX de Apple. No es un lanzamiento oficial de MyShell, sino una conversión derivada del checkpoint original `myshell-ai/MeloTTS-French`.

El modelo resuelve el problema de la síntesis de voz (text-to-speech) en francés ejecutada íntegramente en el dispositivo, sin depender de servicios en la nube. Con 41.576.193 parámetros y un tamaño de repositorio de 0,6 GB, está pensado para dispositivos con recursos limitados como iPhone, iPad o Macs con chip de la serie M. La arquitectura es VITS2, un modelo generativo end-to-end que combina un encoder de texto, un predictor de duración y un decoder basado en flujos y GAN, y que en este caso se acompaña de un frontend de prosodia basado en BERT.

Su relevancia actual radica en que demuestra un flujo de conversión de modelos TTS de PyTorch a MLX para inferencia on-device en el ecosistema Apple, un nicho con pocas alternativas públicas. La licencia MIT tanto del checkpoint original como del BERT auxiliar facilita su reutilización, aunque la documentación disponible es mínima y no se publican métricas de calidad ni detalles sobre el proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS2 (TTS end-to-end generativo, con frontend de prosodia BERT) |
| Parámetros totales | 41.576.193 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos en Safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS2, un sistema de síntesis de voz end-to-end que integra en un único modelo el encoder de texto, el predictor de duración de fonemas, el módulo de flujo normalizador y el decoder generativo. En la conversión se han excluido los artefactos que solo se usan durante el entrenamiento: el discriminador, el cuantizador y los componentes del predictor de duración no necesarios para inferencia. El repositorio incluye además `bert.safetensors`, que contiene los pesos del BERT francés `dbmdz/bert-base-french-europeana-cased`, utilizado como frontend de prosodia para enriquecer la representación del texto de entrada.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineamiento o ajuste fino posteriores. El checkpoint original procede de `myshell-ai/MeloTTS-French` en la revisión `1e9bf590262392d8bffb679b0a3b0c16b0f9fdaf`, y la conversión a MLX se realiza mediante el script `Scripts/convert-melo-to-mlx.py` del repositorio Folio iOS. La inferencia está implementada en Swift sobre MLX, lo que implica que el modelo no se ejecuta con el runtime estándar de PyTorch.

## Capacidades

- Síntesis de voz (text-to-speech) en francés a partir de texto escrito.
- Generación de audio con prosodia condicionada por representaciones BERT del texto de entrada.
- Inferencia on-device en Apple Silicon mediante MLX y Swift.
- Modelo de hablante único (no se documenta soporte multi-hablante ni clonación de voz).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente generativo de audio.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al francés en esta conversión.

## Casos de uso

- Lectura de textos en voz alta en aplicaciones iOS: el modelo puede integrarse en un lector de artículos o libros electrónicos para sintetizar voz francesa sin conexión, aprovechando su tamaño reducido y la inferencia nativa en MLX.
- Accesibilidad para personas con discapacidad visual: sustitución de voces del sistema por una voz neuronal de mayor calidad en francés, ejecutada localmente en el dispositivo.
- Asistentes de voz offline: integración en apps de notas o productividad que necesiten convertir texto dictado o escrito en audio sin enviar datos a servidores externos.
- Aprendizaje de idiomas: generación de pronunciación francesa para aplicaciones educativas, con la ventaja de que el procesamiento es local y no requiere cuotas de API.
- Prototipado de interfaces conversacionales: uso en demos de asistentes o chatbots donde se requiera una voz francesa natural y de baja latencia en dispositivos Apple.
- Investigación en TTS on-device: base para experimentos de conversión de modelos PyTorch a MLX y para evaluar el rendimiento de VITS2 en hardware Apple, dado que el script de conversión es público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 41,5 millones de parámetros, los pesos en fp32 ocupan aproximadamente 166 MB y en fp16 unos 83 MB, a los que se suman los del BERT auxiliar.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) por el uso de MLX; no se documenta soporte para GPU NVIDIA.
- Compatibilidad con GPU de consumo: sí, en equipos Apple con memoria unificada; el tamaño del repositorio (0,6 GB) sugiere que cabe holgadamente en cualquier Mac o iPad reciente.
- Opciones de despliegue: MLX con implementación en Swift dentro de la app Folio iOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| Folio Melo MLX (fr) | 41,6 M | Francés | MIT | Safetensors (MLX) | MLX / Swift on-device |
| MeloTTS-French (original) | no disponible | Francés | MIT | PyTorch | PyTorch / CPU-GPU |
| Modelos TTS del sistema Apple | no disponible | Múltiples | Propietaria | no disponible | AVSpeechSynthesizer |

La comparación con el checkpoint original de MyShell es la más directa: comparten pesos, pero el original está pensado para PyTorch y el de Folio para MLX. Frente a las voces del sistema de Apple, la ventaja es la licencia MIT y la posibilidad de personalización, aunque no hay datos públicos que permitan comparar calidad subjetiva o naturalidad.

## Limitaciones y advertencias

- Es una conversión no oficial: no cuenta con el respaldo de MyShell y puede divergir del comportamiento del checkpoint original.
- Solo soporta francés; no se documenta multilingüismo en esta conversión.
- Modelo de hablante único: no hay soporte documentado para múltiples voces ni clonación.
- No se publican métricas de calidad (MOS, inteligibilidad, naturalidad), por lo que la evaluación subjetiva queda a cargo del usuario.
- Riesgo de artefactos o pronunciaciones incorrectas en textos con nombres propios, siglas o números no normalizados.
- Dependencia del ecosistema Apple: la inferencia está atada a MLX y Swift, lo que limita su uso fuera de dispositivos Apple Silicon.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias del checkpoint original y del BERT auxiliar, ambas MIT según la model card.
- La documentación es mínima y no se detallan los datos de entrenamiento, lo que dificulta evaluar sesgos o cobertura lingüística.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jmoraleses/folio-melo-fr-mlx
- Checkpoint original: https://huggingface.co/myshell-ai/MeloTTS-French
- BERT francés auxiliar: https://huggingface.co/dbmdz/bert-base-french-europeana-cased
- Repositorio Folio iOS (script de conversión): https://github.com/jmoraleses/Folio-iOS
