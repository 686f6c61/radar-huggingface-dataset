# jmoraleses/folio-melo-en-onnx

## Resumen

Folio Melo (en, ONNX) es una exportación a formato ONNX del modelo de síntesis de voz MeloTTS, desarrollado originalmente por MyShell.ai bajo licencia MIT. La exportación la firma el usuario jmoraleses como parte del proyecto Folio-iOS, y su propósito es permitir inferencia en dispositivo (on-device) mediante ONNX Runtime, sin depender de servicios en la nube. Se trata, por tanto, de un artefacto de despliegue más que de un modelo entrenado desde cero: hereda los pesos y el comportamiento del checkpoint base de MeloTTS para inglés (OpenVoice base speaker).

El modelo resuelve el problema de convertir texto en audio de forma local en aplicaciones móviles y de escritorio, con una huella de almacenamiento reducida (el repositorio ocupa aproximadamente 0,1 GB). La salida es audio a 44,1 kHz, y el grafo expone entradas explícitas para longitudes, tonos, identificador de idioma, identificador de hablante y parámetros de control de inferencia (`noise_scale`, `length_scale`), lo que facilita su integración en un pipeline de TTS controlable.

Su relevancia actual es acotada pero concreta: para desarrolladores que necesiten un TTS ligero, con licencia permisiva y ejecutable con ONNX Runtime en entornos sin GPU, este repositorio ofrece un punto de partida ya exportado. No obstante, la información pública es muy escasa (30 descargas, sin likes, sin resultados de benchmarks ni documentación de idiomas más allá del inglés implícito en el nombre), por lo que debe evaluarse como un componente de infraestructura y no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeloTTS (modelo acústico de síntesis de voz; detalles internos de capas no disponibles), exportado a grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no procesa contexto conversacional) |
| Tipos de cuantizacion | no disponible (el repositorio contiene el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (según el nombre del repositorio y la model card); lista completa no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (con `config.json` que describe símbolos fonéticos, desplazamiento de tono e identificador de idioma) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MeloTTS, un sistema de text-to-speech de MyShell.ai publicado bajo licencia MIT. La model card identifica este artefacto como el «OpenVoice base speaker» exportado a ONNX, lo que sitúa el modelo dentro del ecosistema OpenVoice para clonación y transferencia de voz. El grafo exportado expone las entradas `x` (secuencia de entrada), `x_lengths` (longitudes), `tones` (tonos), `lang` (idioma), `sid` (identificador de hablante), `noise_scale` y `length_scale`, y produce como salidas `y` (audio a 44,1 kHz) y `w_ceil` (número de frames por símbolo). Esta interfaz revela un diseño típico de TTS neuronal con control explícito de prosodia y velocidad mediante parámetros de muestreo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; la model card no los documenta. La innovación destacable no está en el entrenamiento sino en el empaquetado: la exportación a ONNX permite ejecutar el modelo con ONNX Runtime en CPU y en dispositivos móviles, eliminando la dependencia de PyTorch en producción. El repositorio indica que el origen es el commit `90d5f2a` del proyecto jmoraleses/Folio-iOS, lo que sugiere un flujo de trabajo de exportación reproducible desde una aplicación iOS.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio a 44,1 kHz.
- Control de prosodia y velocidad mediante los parámetros `noise_scale` y `length_scale`.
- Selección de hablante a través de la entrada `sid`, lo que permite, en principio, usar distintas voces si el checkpoint incluye múltiples hablantes (no confirmado en la documentación).
- Control de tonos mediante la entrada `tones` y de idioma mediante `lang`, coherente con el diseño multilingüe de MeloTTS, aunque solo se documenta el inglés.
- Inferencia on-device con ONNX Runtime, sin necesidad de GPU ni de conexión a red.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo «thinking»; no aplica a un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones móviles sin conexión: el grafo ONNX se ejecuta con ONNX Runtime en iOS o Android, permitiendo convertir texto en audio localmente y preservar la privacidad del usuario sin enviar texto a servidores externos.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de asistencia que necesiten una voz sintética ligera y con licencia MIT, sin coste por llamada a API.
- Generación de audiolibros y pódcasts automatizados: el control de `length_scale` permite ajustar la velocidad de locución, y la salida a 44,1 kHz es adecuada para contenido distribuido.
- Sistemas de navegación y avisos por voz en dispositivos embebidos: al ocupar aproximadamente 0,1 GB y no requerir GPU, puede desplegarse en hardware con recursos limitados para anuncios de ruta o alertas.
- Pruebas y prototipado de pipelines TTS: sirve como referencia exportada para validar integraciones con ONNX Runtime antes de invertir en modelos propietarios o de mayor tamaño.
- Doctrina y educación: uso en entornos docentes para ilustrar el proceso de exportación de un modelo TTS de PyTorch a ONNX y su consumo desde una aplicación cliente.
- Preprocesado de datos de voz para investigación: generación de muestras sintéticas controladas (variando `noise_scale` y `length_scale`) para aumentar datasets de ASR o evaluar robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un grafo ONNX orientado a on-device, se espera ejecución en CPU sin VRAM dedicada, pero no se documentan cifras.
- GPU recomendadas: no disponible; el caso de uso declarado es inferencia en dispositivo con ONNX Runtime, no entrenamiento ni servicio de alta concurrencia.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio no detalla proveedores de ejecución (CPU, CUDA, CoreML, etc.).
- Opciones de despliegue: ONNX Runtime (declarado en la model card); otras alternativas como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Folio Melo (en, ONNX) | no disponible | no aplica | inglés (documentado) | MIT | ONNX | Exportación de MeloTTS para on-device |
| MeloTTS (original, MyShell.ai) | no disponible | no aplica | varios (según repo) | MIT | PyTorch | Modelo base del que deriva esta exportación |
| Piper TTS | no disponible | no aplica | varios | MIT | ONNX | TTS ligero para on-device, ecosistema distinto |
| Coqui TTS (XTTS) | no disponible | no aplica | multilingüe | MPL-2.0 / otras | PyTorch | Mayor huella y enfoque de clonación de voz |

La comparación cuantitativa de rendimiento no está disponible para ninguno de los modelos en la información proporcionada; la tabla se limita a datos de licencia, formato y enfoque de despliegue.

## Limitaciones y advertencias

- La documentación pública es mínima: no hay datos de parámetros, benchmarks, ni evaluación de calidad de audio, lo que impide garantizar su idoneidad en producción sin una validación propia.
- Solo se documenta el inglés; el comportamiento con otros idiomas, aunque la entrada `lang` exista, no está verificado.
- Riesgo de alucinación y errores de pronunciación inherente a los sistemas TTS, especialmente con nombres propios, siglas y texto no normalizado; no se documentan mecanismos de normalización textual.
- Sesgos de voz: al derivar de un «base speaker» de OpenVoice, la voz resultante puede no representar diversidad de acentos o géneros; no se documenta la composición del dataset de entrenamiento original.
- Licencia MIT permisiva para uso comercial, pero conviene verificar las licencias de las dependencias de MeloTTS y OpenVoice, así como de cualquier voz clonada con la que se combine.
- El repositorio tiene un tamaño de 0,1 GB y 30 descargas, sin mantenimiento documentado; la fecha de actualización es de 2026-10-26, por lo que puede quedar obsoleto frente a versiones posteriores de MeloTTS.
- No se especifican los proveedores de ejecución de ONNX Runtime compatibles ni los requisitos mínimos de memoria, lo que complica la planificación de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jmoraleses/folio-melo-en-onnx
- MeloTTS (MyShell.ai): https://github.com/myshell-ai/MeloTTS
- Proyecto de origen citado en la model card: jmoraleses/Folio-iOS (commit `90d5f2a`), sin URL directa disponible en la información proporcionada.
