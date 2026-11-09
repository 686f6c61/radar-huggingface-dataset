# actnowai/CAMPPlus-zh-en-16k-MLX-fp16

## Resumen

CAMPPlus-zh-en-16k-MLX-fp16 es una conversión a MLX del codificador de hablante CAM++ (Context-Aware Masking Plus Plus) desarrollado por el equipo de 3D-Speaker y publicado originalmente en ModelScope como `iic/speech_campplus_sv_zh_en_16k-common_advanced`. El modelo transforma audio de voz a 16 kHz en un embedding de 192 dimensiones que representa la identidad del hablante; dos fragmentos de audio de la misma persona producen vectores con alta similitud coseno. La conversión la firma actnowai (Dicta) para su uso en macOS mediante el framework MLX de Apple.

El modelo resuelve el problema de la verificación e identificación de hablante (speaker verification y diarización) en entornos offline. Con solo 6,93 millones de parámetros y un peso de aproximadamente 14 MB en float16, es un modelo extremadamente ligero que puede ejecutarse en CPU y GPU de Apple sin dependencias de red. Está entrenado sobre un corpus bilingüe chino-inglés y reporta un EER del 5,98 % en CN-Celeb test y del 1,16 % en VoxCeleb1-O según la model card original.

Su relevancia actual radica en que permite diarización y verificación de hablante de forma local y privada en hardware de consumo, sin enviar audio a servicios en la nube. La conversión a MLX mantiene una fidelidad numérica verificada frente a la implementación oficial en PyTorch, con similitud coseno de 0,99999 o superior entre embeddings.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CAM++ (red TDNN con Context-Aware Masking, bloques densos y BatchNorm) |
| Parámetros totales | 6.930.720 (6,85 M sin estadísticas BatchNorm) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embedding por utterance; entrada de audio de duración variable) |
| Tipos de cuantización | float16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, float16, ~14 MB) |
| Entrada | audio mono a 16 kHz, 80 filtros log-mel Kaldi (ventana 25 ms / salto 10 ms, ventana Povey, dither 0, normalización de media temporal) |
| Salida | vector de 192 floats (embedding de hablante) |
| Modelo base | iic/speech_campplus_sv_zh_en_16k-common_advanced (v1.0.0) |

## Arquitectura y entrenamiento

CAM++ es una red neuronal de tipo TDNN (Time-Delay Neural Network) con mecanismo de Context-Aware Masking, diseñada específicamente para verificación de hablante. La arquitectura combina capas convolucionales 1D con bloques densos residuales, transiciones entre bloques y capas de normalización por lotes (BatchNorm), culminando en una capa densa que proyecta a un embedding de 192 dimensiones. El mecanismo de masking contextual permite al modelo atender selectivamente a las regiones del espectrograma más informativas para la identidad del hablante, mejorando la robustez frente a ruido y variabilidad intra-hablante.

El entrenamiento original lo realizaron los autores de 3D-Speaker sobre un corpus grande de chino e inglés, aunque la información disponible no detalla el número exacto de tokens ni la composición completa del dataset. No se documenta en la información proporcionada el uso de RLHF o DPO, algo esperable en un modelo de embedding y no generativo. La conversión a MLX reorganiza los pesos en layout channels-last propio de MLX y los guarda con claves que coinciden con el módulo Swift de Dicta; la fidelidad se validó comparando embeddings contra la implementación oficial en PyTorch (3D-Speaker `speakerlab` y `torchaudio` Kaldi fbank), obteniendo similitud coseno de 0,99999 o superior.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio de 16 kHz.
- Verificación de hablante (1:1): comparación de dos audios mediante similitud coseno.
- Identificación de hablante (1:N): búsqueda del hablante más probable en una galería de embeddings.
- Diarización de hablantes: asignación de etiquetas de hablante consistentes a lo largo de una grabación larga.
- Soporte bilingüe chino-inglés en el entrenamiento.
- Ejecución offline en Apple Silicon mediante MLX, sin llamadas a red.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- No soporta visión, audio generativo ni modos de pensamiento.

## Casos de uso

- Diarización de reuniones y entrevistas: el modelo genera embeddings por segmento de audio y permite agrupar segmentos del mismo hablante mediante clustering (por ejemplo, con similitud coseno y un umbral), útil para transcribir reuniones etiquetando quién habla en cada momento.
- Verificación biométrica local en aplicaciones de escritorio: integrado en una app macOS, permite confirmar que dos fragmentos de audio pertenecen a la misma persona sin enviar datos a la nube, gracias a su ejecución offline con MLX.
- Etiquetado consistente en grabaciones largas: como en el caso de Dicta, mantiene una misma etiqueta de hablante a lo largo de una grabación extensa comparando cada nuevo segmento contra los embeddings ya almacenados.
- Control de acceso por voz en dispositivos de consumo: con 14 MB de pesos y 6,93 M de parámetros, cabe en dispositivos con recursos limitados y puede ejecutarse en tiempo real en CPU o GPU de Apple.
- Preprocesado para pipelines de ASR: asignar etiquetas de hablante antes o después de la transcripción para enriquecer actas, subtítulos o análisis de conversaciones.
- Investigación en biometría de voz: modelo ligero y de referencia para experimentos de verificación de hablante en chino e inglés, con pesos en safetensors fáciles de cargar en MLX.
- Moderación y análisis de contenido de audio: agrupar fragmentos por hablante para detectar intervenciones repetidas o anonimizar voces en grabaciones.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles provienen de la model card original citada en la información proporcionada:

| Benchmark | Resultado reportado |
|---|---|
| CN-Celeb test (EER) | 5,98 % |
| VoxCeleb1-O (EER) | 1,16 % |

No se han publicado en la información disponible resultados comparativos adicionales ni métricas de latencia o throughput para la versión MLX.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en float16 (pesos de ~14 MB más buffers de activación), por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX; también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, tanto en Apple Silicon como en GPUs NVIDIA de gama baja si se porta fuera de MLX; el tamaño es mínimo.
- Opciones de despliegue: MLX (framework nativo para el que se publican los pesos); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de embedding de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAMPPlus-zh-en-16k-MLX-fp16 | 6,93 M | audio 16 kHz, salida 192 dim | CN-Celeb 5,98 %, VoxCeleb1-O 1,16 % | Apache 2.0 | Hugging Face (MLX) |
| iic/speech_campplus_sv_zh_en_16k-common_advanced | 6,85 M (aprox.) | audio 16 kHz, salida 192 dim | mismos valores (modelo origen) | Apache 2.0 | ModelScope |
| ECAPA-TDNN (referencia de la literatura) | ~20 M típicamente | audio 16 kHz, salida 192 dim | no disponible en la información | varía según implementación | múltiples repositorios |
| ResNet-based speaker encoders (p. ej. de 3D-Speaker) | variable (decenas de M) | audio 16 kHz | no disponible en la información | varía | múltiples repositorios |

La comparativa se limita a lo documentado; no se dispone de cifras de rendimiento de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a chino e inglés, por lo que el rendimiento en otros idiomas o acentos no está garantizado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir embeddings poco discriminativos en audio con ruido, solapamiento de voces o condiciones acústicas alejadas del dominio de entrenamiento.
- Limitaciones de contexto o idioma: no soporta más allá de chino e inglés; el EER del 5,98 % en CN-Celeb indica un margen de error considerable en condiciones difíciles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribución a los autores de 3D-Speaker y el aviso de licencia; el modelo y su entrenamiento son obra de los autores originales.
- Caveats para producción: la versión publicada es específica de MLX y float16; su uso fuera de Apple Silicon requiere reconversión. No se documentan cuantizaciones alternativas ni pruebas de robustez adversarial.
- Privacidad: los embeddings de hablante son datos biométricos; su almacenamiento y tratamiento deben cumplir la normativa aplicable (por ejemplo, RGPD en la UE).

## Enlaces

- Hugging Face: https://huggingface.co/actnowai/CAMPPlus-zh-en-16k-MLX-fp16
- Modelo base en ModelScope: https://modelscope.cn/models/iic/speech_campplus_sv_zh_en_16k-common_advanced
- Repositorio 3D-Speaker: https://github.com/modelscope/3D-Speaker
- MLX: https://github.com/ml-explore/mlx
- Dicta: https://actnow.dev/dicta
- Paper CAM++ (Interspeech 2023): Wang, H., Zheng, S., Chen, Y., Cheng, L., Chen, Q. "CAM++: A Fast and Efficient Network for Speaker Verification Using Context-Aware Masking"
