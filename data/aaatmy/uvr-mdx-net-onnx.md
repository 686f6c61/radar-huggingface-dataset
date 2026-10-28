# aaatmy/uvr-mdx-net-onnx

## Resumen

`aaatmy/uvr-mdx-net-onnx` es un repositorio espejo de carácter comunitario que aloja tres grafos ONNX del proyecto Ultimate Vocal Remover (UVR), una herramienta de código abierto para separación de fuentes musicales. El mantenedor es Hikari Tsai (`aaatmy`) y los ficheros son copias byte a byte de los pesos públicos publicados por UVR en la release `all_public_uvr_models`; no han sido reentrenados, cuantizados ni reexportados. El paquete completo ocupa 192.596.046 bytes (192,6 MB) en FP32 y ONNX opset 13.

El modelo resuelve un problema concreto: dado un fragmento de audio musical estéreo a 44,1 kHz, separar la fuente primaria (voz o instrumental, según el grafo) del resto de la mezcla. Internamente no trabaja sobre la forma de onda, sino sobre parches de espectrograma de 256 tramas: el host debe implementar el STFT con la `n_fft` propia de cada modelo, apilar las partes real e imaginaria de ambos canales en 4 planos y ejecutar el grafo sobre tensores `[B, 4, dim_f, 256]`.

Su relevancia práctica es de infraestructura más que de investigación: expone en un formato portable (ONNX) y con sumas de verificación SHA-256 tres modelos de referencia de UVR que de otro modo solo se distribuían dentro del ecosistema de la aplicación de escritorio, lo que facilita integrarlos en pipelines Python, servicios sin GPU o plugins de DAW. La información disponible no documenta el número de parámetros de cada red ni el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDX-Net (red convolucional que opera sobre parches de espectrograma; arquitectura original de kuielab / Woosung Choi) |
| Parametros totales | no disponible (el autor no publica el recuento por grafo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; procesa fragmentos de 256 tramas STFT con solapamiento |
| Tipos de cuantizacion | solo FP32 (los tres ficheros son copias sin cuantizar); no se publican variantes INT8/FP16 |
| Idiomas soportados | no disponible / no aplica (modelo de audio, no textual) |
| Licencia | MIT (declarada por el proyecto UVR para su código; los pesos no tienen fichero de licencia independiente upstream) |
| Formato de pesos | ONNX, opset 13, FP32 |
| Tamano total del repo | 192.596.046 bytes (192,6 MB) |
| Frecuencia de muestreo de entrada | 44,1 kHz, estéreo |
| Autenticidad | SHA-256 por fichero en `SHA256SUMS`; hashes UVR (MD5 de los ultimos 10.000 KiB) en `manifest.json` |

Detalle de los tres grafos y sus parámetros STFT:

| Fichero | Stem primario | n_fft | hop | dim_f | Tramas por chunk | compensate | Entrada |
|---|---|---|---|---|---|---|---|
| `Kim_Vocal_2.onnx` | Voz | 7680 | 1024 | 3072 | 256 | 1,009 | `[B, 4, 3072, 256]` |
| `UVR-MDX-NET-Voc_FT.onnx` | Voz | 7680 | 1024 | 3072 | 256 | 1,021 | `[B, 4, 3072, 256]` |
| `UVR-MDX-NET-Inst_HQ_4.onnx` | Instrumental | 5120 | 1024 | 2560 | 256 | 1,019 | `[B, 4, 2560, 256]` |

## Arquitectura y entrenamiento

MDX-Net es una familia de redes convolucionales diseñada específicamente para separación de fuentes en el dominio espectral. El modelo no recibe audio crudo: el host aplica un STFT con ventana Hann, `hop` de 1024 y la `n_fft` indicada en la tabla, conserva los primeros `dim_f` bins de frecuencia y empaqueta las componentes real e imaginaria de los canales izquierdo y derecho en 4 planos. La red predice el stem primario en ese espacio; el stem secundario se obtiene en UVR por resta de la mezcla menos el primario escalado por el factor `compensate`, y se reconstruye la señal con un STFT inverso que rellena con ceros hasta `n_fft/2 + 1` bins. La implementación de referencia está en `separate.py` de UVR.

No hay información en la documentación proporcionada sobre el número de tokens o horas de audio empleadas en el entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de ajuste fino supervisado o preferencias. Lo único documentado es la procedencia de los pesos: `Kim_Vocal_2` se atribuye a KimberleyJensen, mientras que `UVR-MDX-NET-Voc_FT` e `UVR-MDX-NET-Inst_HQ_4` proceden del repositorio público de UVR mantenido por Anjok07 y aufr33. El espejo añade únicamente documentación, parámetros y sumas de verificación.

## Capacidades

- Separación de voz (vocal) de una mezcla musical estéreo, con dos grafos especializados (`Kim_Vocal_2` y `UVR-MDX-NET-Voc_FT`).
- Separación de instrumental (`UVR-MDX-NET-Inst_HQ_4`), equivalente práctico a obtener la mezcla sin la voz.
- Derivación del stem complementario mediante resta escalada por `compensate`, sin necesidad de un segundo paso de inferencia.
- Procesamiento por chunks de 256 tramas con solapamiento, lo que permite tratar pistas de duración arbitraria con memoria acotada.
- Ejecución agnóstica de framework vía ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML según proveedor disponible).
- Portable a aplicaciones de escritorio, servicios HTTP y plugins, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio-texto ni generación de lenguaje: es un modelo puramente audio-a-audio.
- No realiza separación en más de dos stems (no aísla batería, bajo u otros instrumentos por separado).

## Casos de uso

- **Karaoke y eliminación de voz sobre grabaciones propias**: ejecutando `UVR-MDX-NET-Inst_HQ_4` sobre la mezcla se obtiene la base instrumental; el factor `compensate` (1,019) corrige el nivel residual de voz en la resta.
- **Extracción de vocales para remezclas o edición**: `Kim_Vocal_2` o `Voc_FT` aíslan la pista vocal para reutilizarla en una producción nueva, con STFT de `n_fft` 7680 y `dim_f` 3072, pensado para material con contenido armónico amplio.
- **Preprocesado para transcripción automática**: separar la voz antes de pasar el audio a un sistema ASR reduce el enmascaramiento del habla por la instrumentación, un paso habitual en la limpieza de entrevistas, podcasts con música de fondo o grabaciones de directo.
- **Procesado por lotes en servidores sin GPU**: al ser ONNX de ~192,6 MB en total y FP32, el conjunto se ejecuta con `onnxruntime` en CPU; el cuello de botella es la STFT y el número de chunks, no la VRAM, lo que permite empaquetarlo en contenedores ligeros o funciones serverless.
- **Integración en DAW o aplicación de escritorio**: el proveedor DirectML o CoreML de ONNX Runtime permite inferencia acelerada en Windows y macOS sin instalar el stack de UVR, habilitando funciones de "quitar voz" dentro de un editor de audio.
- **Curaduría de datasets de audio**: generar pares (mezcla, stem) a escala para entrenar o evaluar modelos de separación y de mejora de voz, usando los checksums del repo para garantizar reproducibilidad entre experimentos.
- **Restauración y archivística sonora**: recuperar la parte instrumental de grabaciones antiguas o de material de archivo antes de un proceso de remasterización, manteniendo la voz intacta para un tratamiento separado.
- **Referencia para comparativas de separación de fuentes**: al ser copias verificables byte a byte de los pesos oficiales, sirven como baseline reproducible al publicar resultados frente a otros separadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas SDR, SIR o SAR, ni comparativas con otros separadores; se limita a documentar procedencia, parámetros STFT y checksums.

## Requisitos de hardware

- **VRAM estimada**: el conjunto completo de los tres grafos pesa 192,6 MB en FP32, de modo que los pesos de un único modelo quedan en el orden de decenas de MB (estimación aritmética a partir del total; el desglose por fichero no está publicado). A ello hay que sumar las activaciones de un chunk `[B, 4, 3072, 256]`, que dominan el consumo en `B` alto.
- **GPU recomendadas**: cualquier GPU con soporte del proveedor CUDA o TensorRT de ONNX Runtime (por ejemplo RTX 3060/4090, A100, H100). Para este tamaño de red, una GPU de gama media ya elimina el cuello de botella.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU consumer con más de 2 GB de VRAM, e incluso en iGPU mediante DirectML o CoreML.
- **CPU**: viable con `onnxruntime` en modo CPU; el coste escala con la duración del audio (número de chunks de 256 tramas), no con el tamaño del modelo.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#, Java), `onnxruntime-gpu`, TensorRT, DirectML, CoreML; también la propia GUI de Ultimate Vocal Remover. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tiempo por minuto de audio ni de RTF (real-time factor).
- **Almacenamiento**: 192,6 MB para el repositorio completo; conviene conservar `manifest.json` y `SHA256SUMS` junto a los pesos para validar la integridad con `sha256sum -c SHA256SUMS`.

## Comparativa con modelos similares

| Modelo | Tipo | Dominio de trabajo | Stems | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UVR MDX-Net ONNX (este repo) | MDX-Net convolucional | Espectrograma (STFT, 4 planos) | Voz o instrumental (2 stems por pasada) | MIT (según proyecto UVR) | Hugging Face, ONNX opset 13, FP32 |
| Demucs / HTDemucs | Híbrido forma de onda + espectrograma | Forma de onda y espectrograma | 4 stems (batería, bajo, otros, voz) | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Spleeter | CNN sobre espectrograma | Espectrograma | 2 o 4 stems | no disponible en la información proporcionada | no disponible en la información proporcionada |
| UVR con modelos MDX23 / Roformer | Familia UVR más reciente | Espectrograma | Voz o instrumental | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se dispone de métricas de calidad (SDR/SIR) para establecer una comparación cuantitativa con estas alternativas; la comparación anterior es únicamente estructural.

## Limitaciones y advertencias

- **No es un espejo oficial**: el repositorio lo mantiene Hikari Tsai y no implica el aval del proyecto UVR ni de sus desarrolladores. Para producción, conviene verificar los SHA-256 con `SHA256SUMS` y contrastar los hashes UVR de `manifest.json`.
- **Licencia ambigua en los pesos**: UVR declara licencia MIT sobre su código y pide a los terceros que la usen que atribuyan el proyecto y a sus desarrolladores; los pesos no llevan fichero de licencia independiente upstream. La model card remite a `NOTICE.md` para la redacción exacta. Antes de un uso comercial conviene revisar ese aviso con asesoramiento legal.
- **No es plug-and-play**: el grafo ONNX no acepta audio; exige implementar el preprocesado (STFT con ventana Hann, `hop` 1024, recorte a `dim_f` bins, empaquetado en 4 planos) y el postprocesado (ISTFT con zero-padding a `n_fft/2 + 1` bins, solapamiento de chunks y resta escalada por `compensate`). Una implementación incorrecta produce artefactos metálicos o cancelación de fase.
- **Solo dos stems por pasada**: no separa batería, bajo ni otros instrumentos; para esos casos hace falta otra familia de modelos.
- **Artefactos esperables**: musicales con reverberación larga, coros densos, vibrato extremo o instrumentos con formantes próximos a la voz suelen dejar residuos audibles en el stem complementario.
- **Sesgos y dominio de entrenamiento**: la información disponible no documenta la composición del dataset, por lo que no se puede acotar su comportamiento fuera de música occidental popular ni en grabaciones de habla no musical.
- **Idioma y contexto**: no aplica, al no ser un modelo textual; no hay ventana de contexto ni soporte multilingüe que evaluar.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe el riesgo de "inventar" contenido espectral, especialmente al aislar voces muy enmascaradas: el modelo puede reconstruir armónicos plausibles que no estaban en la mezcla original.
- **Sin garantías de rendimiento**: el autor no publica latencias ni métricas de calidad; cualquier SLA debe medirse en el entorno real de despliegue.
- **Resolución de entrada fija**: 44,1 kHz estéreo; el audio a otras frecuencias debe remuestrearse antes, y el mono debe duplicarse a dos canales para respetar la forma `[B, 4, dim_f, 256]`.

## Enlaces

- Repositorio en Hugging Face: <https://huggingface.co/aaatmy/uvr-mdx-net-onnx>
- Proyecto Ultimate Vocal Remover (GitHub): <https://github.com/Anjok07/ultimatevocalremovergui>
- Release con los pesos originales `all_public_uvr_models`: <https://github.com/TRvlvr/model_repo/releases/tag/all_public_uvr_models>
- Repositorio de modelos de UVR (TRvlvr/model_repo): <https://github.com/TRvlvr/model_repo>
- Ficheros de verificación y metadatos dentro del repo: `manifest.json`, `SHA256SUMS`, `NOTICE.md`
- Descarga directa: `hf download aaatmy/uvr-mdx-net-onnx --local-dir ./uvr-mdx-net-onnx`
- No se han encontrado enlaces adicionales relevantes (papers, demos o blogs) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
