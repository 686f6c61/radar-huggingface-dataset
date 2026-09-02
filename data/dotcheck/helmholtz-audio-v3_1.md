# DotCheck/helmholtz-audio-v3_1

## Resumen

Helmholtz@3.1 (identificador interno `inhouse-audio@3`) es un detector binario de audio sintético desarrollado por DotCheck, una empresa centrada en la autenticación de medios. El modelo estima la probabilidad \(P(\mathrm{AI})\) de que un fragmento de audio (voz, música o sonido general) haya sido generado por inteligencia artificial. Está diseñado para integrarse en flujos de moderación de contenido y verificación de medios, donde distingue entre grabaciones reales y síntesis producida por sistemas como TTS, voice cloning o generadores de música.

Técnicamente, no es un modelo entrenado desde cero, sino una cabeza logística entrenada sobre las representaciones (embeddings) de un encoder congelado, Dasheng-Base, desarrollado por mispeech. El backbone no se redistribuye en este repositorio; solo se publica el head en formato `.npz`. El protocolo de inferencia utiliza ventanas de 4 segundos (hasta dos, con recorte central) y agrega las puntuaciones mediante la operación máximo. El modelo se sirve a través de una API FastAPI en CPU y está pensado para su uso en producción dentro de la plataforma DotCheck.

La relevancia actual de este modelo radica en la creciente necesidad de detectar medios sintéticos en un contexto donde los generadores de audio se han vuelto muy accesibles. Su licencia Apache-2.0 y su diseño ligero (solo el head) permiten reproducir los resultados y desplegarlo en entornos con recursos limitados, aunque el backbone subyacente requiere más capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza logística sobre embeddings congelados de Dasheng-Base (encoder transformer) |
| Parametros totales | no disponible (el head es un archivo `.npz`; el backbone no se redistribuye) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de audio; ventanas de 4 s, hasta 2 ventanas) |
| Tipos de cuantizacion | no disponible (el head se distribuye como `.npz` en precisión nativa) |
| Idiomas soportados | inglés (etiqueta del modelo; el audio puede ser multilingüe de facto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` (head logístico); backbone no incluido |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. Primero, el audio de entrada se convierte a mono a 16 kHz y se extraen hasta dos ventanas de 4 segundos mediante recorte central. Cada ventana se pasa por el encoder Dasheng-Base, que permanece congelado durante todo el proceso, y produce un embedding. Sobre ese embedding actúa una cabeza logística (un único layer lineal con sigmoide) que devuelve la probabilidad \(p_w\) de que la ventana sea sintética. Para clips con múltiples ventanas, la puntuación final es el máximo de las \(p_w\). Este diseño evita el ajuste fino del encoder y reduce drásticamente el número de parámetros entrenables.

Los datos de entrenamiento se dividen en dos clases. Como ejemplos reales se usaron concatenaciones de LibriTTS y FSD50K (sin loop-tile). Como ejemplos sintéticos se emplearon salidas de parler-mini, melo-en, dasheng-audiogen, y la familia fal (Kokoro, Eleven Turbo, mezclas) junto con el conjunto de entrenamiento de Imagine. El head se ajustó con una mezcla lineal de estas fuentes. La evaluación se realizó sobre un holdout disjunto por SHA que incluye CodecFake y DFADD para voz, una partición impar de AudioGen para música/efectos, y un holdout por prompt-id para la familia fal. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado estándar con etiquetas binarias.

## Capacidades

- Clasificación binaria de audio: distingue entre audio real y audio generado por IA, devolviendo una probabilidad continua en [0,1].
- Soporte para voz, música y sonido general: el modelo está entrenado con una mezcla de habla (LibriTTS, CodecFake, DFADD), música/efectos (AudioGen, FSD50K) y contenido de la familia fal.
- Protocolo de ventanas flexible: acepta clips de duración variable, usando hasta dos ventanas de 4 s con recorte central y agregación por máximo.
- Integración en producto: pensado para ser servido mediante una API FastAPI en CPU, con comportamiento fail-closed (si falta el head, devuelve 503).
- Reproducibilidad: al ser un head logístico sobre un backbone congelado y de código abierto, los resultados del holdout pueden verificarse de forma independiente.
- Detección de silencio: en el flujo de producto, las ventanas con RMS muy bajo se omiten antes de la puntuación, evitando falsos positivos por silencio.

## Casos de uso

- Moderación de contenido en plataformas de vídeo: el modelo puede analizar la banda de audio de vídeos subidos por usuarios para detectar si la voz o la música han sido generadas por IA, ayudando a aplicar políticas de etiquetado de medios sintéticos. Su protocolo de ventanas de 4 s permite procesar clips cortos de forma eficiente en CPU.
- Verificación de material periodístico: una redacción puede usar Helmholtz@3.1 para comprobar si un audio recibido (por ejemplo, una supuesta declaración) es real o sintético, antes de publicarlo. La salida probabilística permite establecer umbrales de confianza adaptados al caso.
- Auditoría de datasets de entrenamiento: investigadores que construyen corpus de audio pueden filtrar muestras generadas por IA usando este detector, garantizando que los datos etiquetados como "reales" no contengan síntesis no declarada.
- Investigación académica en detección de deepfakes: el modelo sirve como baseline reproducible para comparar nuevos métodos de detección de audio sintético, gracias a su licencia Apache-2.0 y a la publicación del head.
- Control de calidad en estudios de doblaje y locución: un estudio puede verificar que las muestras entregadas por actores de voz o generadores TTS cumplen con los estándares de naturalidad, usando la probabilidad de IA como métrica auxiliar.
- Monitorización de campañas de desinformación: organizaciones de fact-checking pueden integrar el modelo en pipelines automáticos que analicen audios virales en redes sociales, priorizando aquellos con alta probabilidad de ser sintéticos para revisión manual.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes, evaluados sobre un holdout que combina CodecFake, DFADD, AudioGen (partición impar) y la familia fal (holdout por prompt-id). La clasificación binaria se realiza con umbral 0.5.

| Metrica | Valor |
|---|---|
| Media de \(P(\mathrm{AI})\) en audio real | 0.018 |
| Media de \(P(\mathrm{AI})\) en audio sintetico | 0.989 |
| Exactitud balanceada | 0.995 |

Estos valores cumplen con los umbrales mínimos fijados por DotCheck (media real ≤ 0.12, media IA ≥ 0.85, exactitud balanceada ≥ 0.90). No se han publicado resultados comparativos con otros detectores en la información disponible.

## Requisitos de hardware

- El head logístico es extremadamente ligero (un archivo `.npz` de tamaño despreciable) y puede ejecutarse en CPU sin problemas.
- El backbone Dasheng-Base, aunque congelado, es un encoder transformer que requiere una GPU para una inferencia razonable en tiempo real. No se especifican requisitos exactos de VRAM, pero por su naturaleza (modelo base de audio) se estima que necesita al menos 4-8 GB de VRAM en FP16.
- Para despliegue en producción, DotCheck recomienda servir el modelo mediante una API FastAPI en CPU, lo que sugiere que el backbone puede ejecutarse en modo CPU con latencias aceptables para procesamiento por lotes.
- Opciones de despliegue: FastAPI (documentado), aunque al no ser un paquete `transformers` estándar, no se puede usar directamente con vLLM, llama.cpp u Ollama. Se requiere un wrapper personalizado que cargue el head `.npz` y el backbone por separado.
- Latencia y throughput: no disponibles en la documentación pública.

## Comparativa con modelos similares

No se dispone de información pública que compare Helmholtz@3.1 con otros detectores de audio sintético (como los basados en ResNet o en wav2vec2 fine-tuned). La model card no incluye referencias a modelos alternativos ni resultados comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo utiliza hasta dos ventanas de 4 segundos, por lo que no captura estructura de largo plazo, eventos dispersos ni síntesis de inicio tardío. Un audio de 10 minutos con una sola frase sintética al final podría no ser detectado si esa frase no cae dentro de las ventanas seleccionadas.
- El holdout de evaluación cubre CodecFake/DFADD para voz, AudioGen para música/efectos y una partición de la familia fal. Codecs o familias de TTS no vistas pueden producir desplazamientos en las puntuaciones, reduciendo la fiabilidad fuera de ese dominio.
- Las métricas publicadas son medias globales del holdout con umbral 0.5; no hay desglose por dominio (voz, música, efectos) ni por tipo de generador, lo que limita la interpretación para casos específicos.
- El modelo no está diseñado para identificación de hablantes, determinaciones legales ni puntuaciones fusionadas de audio+vídeo. La fusión con puntuaciones de frames (modelo Muybridge) es una regla privada de DotCheck y no forma parte de las afirmaciones públicas de este repositorio.
- El backbone Dasheng-Base no se redistribuye en este repositorio; para reproducir los resultados es necesario descargarlo por separado desde su página de HuggingFace, lo que añade un paso de integración.
- Aunque la licencia es Apache-2.0, el uso en producción debe considerar que el modelo puede generar falsos positivos o negativos en dominios no representados en el entrenamiento, especialmente con audio de baja calidad o efectos de compresión.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DotCheck/helmholtz-audio-v3_1
- Backbone Dasheng-Base: https://huggingface.co/mispeech/dasheng-base
- Documentación técnica de DotCheck: https://dotcheck.ai/docs
- Model card en PDF (v2026): https://dotcheck.ai/media/docs/dotcheck-model-card-v2026.7.pdf
- Producto de verificación: https://dotcheck.ai/check
- API de producto: https://dotcheck.ai/api
