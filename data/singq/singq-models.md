# SingQ/singq-models

## Resumen

SingQ models es un repositorio de modelos Core ML publicado por el desarrollador SingQ, cuyo objetivo es servir de backend local a SingQ, una aplicación de macOS para practicar canto. No se trata de un modelo de lenguaje generativo, sino de un paquete de tres modelos especializados en tareas de audio musical: alineamiento de letras (lyrics alignment) sobre audio cantado en coreano e inglés mediante CTC, y separación de fuente (voz y acompañamiento) mediante Hybrid Transformer Demucs.

El repositorio agrupa conversiones a Core ML de modelos preexistentes de terceros: `kresnik/wav2vec2-large-xlsr-korean` para el alineamiento en coreano, `facebook/wav2vec2-large-960h-lv60-self` para el alineamiento en inglés y una conversión Core ML de htdemucs procedente de `slaughters85j/htdemucs-coreml`. Las conversiones se realizaron sin reentrenamiento, con precisión FP16 para el modelo inglés y FP32 para el coreano, porque el modelo XLS-R desborda en FP16.

Su relevancia es acotada pero concreta: permite ejecutar en local, sobre hardware Apple Silicon, un pipeline completo de práctica de canto (separar la voz de la música y alinear la letra con la interpretación) sin depender de servicios en la nube. El repositorio tiene 2,0 GB, cero descargas y cero likes en el momento de la consulta, y la licencia agregada se declara como "other" al combinar componentes con licencias Apache-2.0 y MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CTC) para alineamiento de letras; Hybrid Transformer Demucs para separacion de fuentes |
| Parametros totales | no disponible (no se detalla el numero de parametros por archivo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 34 segundos a 16 kHz en los modelos wav2vec2 |
| Tipos de cuantizacion | FP16 (wav2vec2 ingles), FP32 (wav2vec2 coreano); no se especifica para htdemucs |
| Idiomas soportados | coreano e ingles (alineamiento de letras); separacion de fuentes independiente del idioma |
| Licencia | other (agregada); componentes Apache-2.0 (wav2vec2) y MIT (htdemucs) |
| Formato de pesos | Core ML (.mlpackage comprimido en .zip); incluye models.json con tamanos y SHA-256 |

## Arquitectura y entrenamiento

Los dos modelos de alineamiento son wav2vec2 de tipo CTC. El modelo coreano deriva de `kresnik/wav2vec2-large-xlsr-korean`, entrenado sobre el corpus Zeroth-Korean (CC BY 4.0) disponible en OpenSLR; el modelo inglés deriva de `facebook/wav2vec2-large-960h-lv60-self`. Ambos se convirtieron a Core ML sin reentrenamiento, con una entrada fija de 34 segundos a 16 kHz y una salida log-softmax cada 20 ms, lo que permite obtener marcas temporales de fonemas o caracteres para sincronizar la letra con el audio cantado.

El tercer componente es Hybrid Transformer Demucs de Meta AI, un modelo de separación de fuentes que combina un backbone convolucional con un transformer para separar la pista vocal del acompañamiento instrumental. La conversión a Core ML procede del repositorio `slaughters85j/htdemucs-coreml`. No se documentan en la información disponible detalles sobre el volumen de datos de entrenamiento, el proceso de conversión ni posibles ajustes finos posteriores.

## Capacidades

- Alineamiento de letras en coreano sobre audio cantado mediante decodificación CTC.
- Alineamiento de letras en inglés sobre audio cantado mediante decodificación CTC.
- Salida temporal con resolución de 20 ms (log-softmax por fotograma), adecuada para sincronización de letras tipo karaoke.
- Separación de voz y acompañamiento instrumental (source separation) con htdemucs.
- Ejecución local en macOS sobre Core ML, sin llamadas a servicios externos.
- Procesamiento por ventanas de 34 segundos de audio a 16 kHz en los modelos de alineamiento.
- No soporta generación de texto, tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Práctica de canto con seguimiento de letra en tiempo casi real: la app puede usar la salida CTC cada 20 ms para resaltar la sílaba o carácter que el usuario debería estar cantando, comparando la posición esperada con la detectada.
- Karaoke educativo en coreano: el modelo `wav2vec2-ko` permite alinear la letra de una canción K-pop con la interpretación del usuario y detectar desviaciones de tempo o de pronunciación a nivel de fonema.
- Karaoke educativo en inglés: el modelo `wav2vec2-en` cubre el mismo flujo para canciones en inglés, con FP16 para reducir el coste de inferencia en Apple Silicon.
- Separación de pistas para estudio casero: htdemucs permite extraer la voz y el acompañamiento de una mezcla para practicar sobre la base instrumental o analizar la interpretación vocal por separado.
- Evaluación de afinación y ritmo: combinando la separación vocal con el alineamiento forzado, la app puede segmentar la interpretación del usuario en unidades de letra y calcular métricas de sincronía.
- Pipeline offline de anotación musical: un investigador puede usar los tres modelos para generar etiquetas temporales de letras y pistas separadas sobre un corpus de canciones sin enviar audio a terceros.
- Distribución como app de escritorio: al ser Core ML, los modelos se descargan en el primer uso y se ejecutan en el dispositivo, lo que simplifica el cumplimiento de privacidad al no transmitir grabaciones del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseñado para ejecución en macOS sobre Core ML, con aceleración por Neural Engine y GPU de Apple Silicon; no se documentan requisitos oficiales de memoria.
- VRAM/RAM estimada: el repositorio completo ocupa 2,0 GB; la carga simultánea de los tres modelos requiere previsiblemente varios GB de memoria unificada, aunque no se especifica una cifra oficial.
- GPU recomendadas: hardware Apple Silicon (serie M); no se menciona soporte para CUDA, ROCm ni GPU de escritorio convencionales.
- No cabe en GPUs consumer de NVIDIA/AMD en su formato actual, ya que los pesos están en formato Core ML y no en GGUF ni safetensors.
- Opciones de despliegue: Core ML en apps macOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SingQ models | Alineamiento de letras (ko/en) y separacion de fuentes | no disponible | 34 s a 16 kHz (alineamiento) | other (Apache-2.0 + MIT) | Core ML, repo de 2,0 GB |
| kresnik/wav2vec2-large-xlsr-korean | Alineamiento/ASR en coreano | no disponible en la informacion | no disponible | Apache-2.0 | HuggingFace |
| facebook/wav2vec2-large-960h-lv60-self | ASR en ingles | no disponible en la informacion | no disponible | Apache-2.0 | HuggingFace |
| Hybrid Transformer Demucs (Meta AI) | Separacion de fuentes | no disponible en la informacion | no disponible | MIT | Repo oficial y conversion Core ML |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier ficha que lo trate como LLM seria incorrecta.
- Solo cubre alineamiento de letras en coreano e inglés; no hay soporte documentado para castellano ni otros idiomas.
- La entrada de los modelos wav2vec2 está fijada a 34 segundos a 16 kHz, lo que obliga a trocear el audio y puede introducir errores en las fronteras entre ventanas.
- El modelo coreano se distribuye en FP32 porque el XLS-R original desborda en FP16; esto implica mayor uso de memoria y menor velocidad que la variante inglesa.
- El alineamiento CTC sobre audio cantado puede degradarse con vibrato, melismas, coros superpuestos o mezclas con mucha instrumentación; no se documentan métricas de error.
- La separación de fuentes con htdemucs puede dejar artefactos o sangrado entre pistas en grabaciones muy comprimidas o con reverberación intensa.
- La licencia agregada es "other": aunque los componentes individuales son Apache-2.0 y MIT, es responsabilidad del integrador verificar las condiciones de cada modelo de origen antes de un uso comercial.
- El repositorio no incluye información sobre sesgos, evaluación de calidad ni proceso de validación; con cero descargas y cero likes, no hay evidencia comunitaria de uso en producción.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de alineamientos incorrectos (falsos positivos de correspondencia fonética) que la app debe gestionar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SingQ/singq-models
- Modelo base coreano: https://huggingface.co/kresnik/wav2vec2-large-xlsr-korean
- Corpus Zeroth-Korean: https://openslr.org/40/
- Modelo base inglés: https://huggingface.co/facebook/wav2vec2-large-960h-lv60-self
- Hybrid Transformer Demucs (Meta AI): https://github.com/facebookresearch/demucs
- Conversión Core ML de htdemucs: https://huggingface.co/slaughters85j/htdemucs-coreml
