# Healthykid/scnet-small-onnx

## Resumen

SCNet Small (ONNX) es una exportación a formato ONNX del modelo SCNet Small para separación de fuentes musicales en cuatro pistas (batería, bajo, otros y voz). El modelo original procede del artículo *SCNet: Sparse Compression Network for Music Source Separation* (Tong et al., ICASSP 2024), con código y pesos publicados bajo licencia MIT por el autor original (starrytong) y distribuidos posteriormente en el repositorio Music-Source-Separation-Training de ZFTurbo. Este repositorio, mantenido por Healthykid, no modifica los pesos: solo los convierte a un grafo ONNX en float16 para su ejecución en navegador (ONNX Runtime Web con WebGPU o WASM) y en dispositivos locales.

La relevancia de esta ficha radica en que permite ejecutar separación de pistas de audio de calidad razonable sin infraestructura de servidor GPU, algo poco habitual en modelos de separación de fuentes. El grafo opera sobre espectrogramas: recibe una representación STFT y devuelve los espectrogramas de las cuatro pistas, dejando las transformadas STFT e iSTFT fuera del modelo, tal como en el código de referencia.

El modelo tiene 22.970.286 bytes en disco (aproximadamente 23 MB en float16), con un único fichero ONNX de opset 17. No se dispone de datos sobre número de parámetros, longitud de contexto en el sentido de modelos de lenguaje, ni idiomas soportados, ya que la tarea es puramente audio-a-audio y no lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCNet (Sparse Compression Network), red convolucional sobre espectrogramas STFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa fragmentos de 485.100 muestras (aproximadamente 11 s a 44,1 kHz) |
| Tipos de cuantizacion | pesos almacenados en float16, convertidos a float32 al cargar la sesión |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), fichero `scnet_small_T476_f16w.onnx` |
| Tamano del fichero | 22.970.286 bytes (aprox. 23 MB) |
| Frecuencia de muestreo | 44,1 kHz, estéreo |
| STFT | n_fft 4096, hop 1024, fuera del grafo |
| Entrada | `spec`: float32 `[1, 4, 2049, 476]`, canales `[L re, L im, R re, R im]` |
| Salida | `out`: float32 `[1, 16, 2049, 476]`, orden `[drums, bass, other, vocals] x [L, R] x [re, im]` |
| Runtime | onnxruntime (ONNX Runtime Web: WebGPU o WASM) |

## Arquitectura y entrenamiento

SCNet es una red convolucional que opera directamente sobre la magnitud y fase del espectrograma STFT, con un diseño de compresión dispersa (*sparse compression*) que reduce el coste computacional frente a arquitecturas de separación más pesadas. El modelo exportado recibe un tensor de espectrograma de 4 canales (parte real e imaginaria de cada canal estéreo) y produce 16 canales correspondientes a las cuatro pistas por dos canales estéreo por dos componentes (real e imaginaria). Las transformadas STFT e iSTFT se ejecutan fuera del grafo, igual que en el código de referencia, con n_fft 4096, hop 1024 y ventanas de 485.100 muestras a 44,1 kHz estéreo.

Los pesos provienen del checkpoint `scnet_checkpoint_musdb18.ckpt` publicado en Music-Source-Separation-Training v1.0.6, entrenado sobre MUSDB18. El autor de esta exportación indica que los pesos son los originales del checkpoint, almacenados en float16 y convertidos a float32 al cargar la sesión, y que las salidas coinciden con el checkpoint de PyTorch con una diferencia de 0,00 dB SDR en sus pruebas. No se dispone de información detallada sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de MUSDB18, ni sobre si hubo etapas de refinamiento posteriores al entrenamiento supervisado.

## Capacidades

- Separación de una mezcla musical estéreo en cuatro pistas: batería, bajo, otros y voz.
- Procesamiento por fragmentos de 485.100 muestras (aproximadamente 11 segundos a 44,1 kHz), con STFT e iSTFT externas al grafo.
- Ejecución en navegador mediante ONNX Runtime Web con backend WebGPU o WASM.
- Ejecución en dispositivo local sin dependencia de GPU de servidor.
- Entrada y salida en espectrograma, lo que permite integrarlo en pipelines de audio personalizados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente audio-a-audio.
- No dispone de modo *thinking*, visión ni audio de entrada distinto del espectrograma STFT.

## Casos de uso

- **Separación de pistas en el navegador**: un editor de audio web puede cargar el fichero ONNX con ONNX Runtime Web y WebGPU para separar una canción en cuatro pistas sin enviar el audio a un servidor, lo que reduce latencia y preserva la privacidad del usuario.
- **Karaoke automático**: extrayendo la pista de voz y restándola de la mezcla (o reproduciendo solo las pistas instrumentales), se puede generar una versión instrumental de una canción en local; el modelo está pensado para fragmentos de unos 11 segundos, por lo que requiere segmentación y solapamiento.
- **Remezcla y *sampling* para producción musical**: un productor puede aislar la batería o el bajo de una grabación para reutilizarlos en una nueva composición, con la ventaja de que el modelo corre en un portátil sin GPU dedicada.
- **Herramientas de accesibilidad auditiva**: separar la voz del resto de la mezcla permite aumentar la inteligibilidad de voces en grabaciones musicales para personas con pérdida auditiva, procesando fragmentos cortos en tiempo casi real.
- **Preprocesado para transcripción de letras**: aislar la pista vocal antes de pasarla a un sistema de reconocimiento automático de voz mejora la relación señal-ruido y reduce errores en la transcripción de canciones.
- **Prototipado e investigación en separación de fuentes**: al ser un ONNX ligero (23 MB), sirve como *baseline* reproducible para comparar arquitecturas o para experimentar con post-procesado espectral sin necesidad de montar PyTorch.
- **Aplicaciones móviles y de escritorio offline**: el tamaño reducido y la compatibilidad con ONNX Runtime permiten empaquetar la separación de pistas en apps sin conexión, útil en entornos con conectividad limitada.

## Benchmarks y rendimiento

El autor del repositorio cita los resultados del checkpoint original en el conjunto de test MUSDB18-HQ, publicados en Music-Source-Separation-Training:

| Metrica | Valor |
|---|---|
| SDR medio | 9,03 dB |
| SDR batería | 10,44 dB |
| SDR bajo | 8,89 dB |
| SDR voz | 9,90 dB |
| SDR otros | 6,89 dB |

No se han publicado en la información disponible resultados de latencia, throughput ni comparativas directas con otros modelos en este repositorio. La afirmación de que las salidas coinciden con el checkpoint de PyTorch a 0,00 dB SDR es una comprobación de equivalencia numérica, no un benchmark adicional.

## Requisitos de hardware

- **VRAM estimada**: el fichero pesa unos 23 MB en float16; al cargarse en float32, la huella en memoria es del orden de decenas de MB, muy por debajo de cualquier GPU moderna. No se dispone de cifras exactas de VRAM pico durante la inferencia.
- **GPU recomendadas**: cualquier GPU con soporte WebGPU (por ejemplo, integradas recientes de Intel, AMD o Apple Silicon) o GPUs dedicadas como RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU de gama alta.
- **Consumer GPU**: sí cabe en cualquier GPU de consumo e incluso en CPU, dado el tamaño reducido del grafo.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#), ONNX Runtime Web con WebGPU o WASM, y cualquier runtime compatible con ONNX (por ejemplo, tract u otros). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada. Dependerán del backend (WebGPU frente a WASM), del hardware y del tamaño de los fragmentos procesados.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre otros modelos de separación de fuentes comparables (por ejemplo, Demucs, Open-Unmix o Spleeter) en cuanto a parámetros, contexto, rendimiento o licencia dentro de este repositorio. Se indica "no disponible" para una comparativa rigurosa. Como referencia cualitativa, el propio autor cita SCNet como arquitectura de compresión dispersa frente a alternativas convolucionales más pesadas, pero sin cifras comparativas en esta ficha.

| Modelo | Parametros | Contexto | SDR medio (MUSDB18-HQ) | Licencia | Formato |
|---|---|---|---|---|---|
| SCNet Small (ONNX) | no disponible | fragmentos de 485.100 muestras | 9,03 dB | MIT | ONNX |
| Alternativas (Demucs, Open-Unmix, Spleeter) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos, pero al entrenarse sobre MUSDB18 (principalmente música occidental de géneros concretos), el rendimiento puede degradarse en otros estilos, idiomas o grabaciones con instrumentación atípica.
- **Alucinación**: no aplica en el sentido lingüístico, pero la separación puede introducir artefactos espectrales, sangrado entre pistas (*bleeding*) y pérdida de detalle en pasajes densos o con reverberación.
- **Limitaciones de contexto**: el modelo procesa fragmentos de 485.100 muestras (unos 11 segundos); para canciones completas es necesario segmentar con solapamiento y recomponer, lo que puede generar discontinuidades si no se aplica *crossfading*.
- **Idioma**: no aplica; el modelo no procesa texto.
- **Licencia**: MIT, lo que permite uso comercial y modificación, siempre que se conserve el aviso de copyright de los autores originales (starrytong y ZFTurbo) y del exportador.
- **Caveat de producción**: la conversión float16 a float32 al cargar la sesión implica que la precisión efectiva es la del checkpoint original; no obstante, el autor solo verifica la equivalencia con 0,00 dB SDR en sus propias pruebas, por lo que conviene validar en el pipeline concreto antes de desplegar.
- **Dependencia del backend**: el rendimiento en WebGPU o WASM puede variar mucho entre navegadores y versiones de ONNX Runtime; no se documentan versiones mínimas recomendadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Healthykid/scnet-small-onnx
- Artículo SCNet (arXiv): https://arxiv.org/abs/2401.13276
- Código oficial SCNet: https://github.com/starrytong/SCNet
- Repositorio Music-Source-Separation-Training (ZFTurbo): https://github.com/ZFTurbo/Music-Source-Separation-Training
- ONNX Runtime: https://onnxruntime.ai/
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
