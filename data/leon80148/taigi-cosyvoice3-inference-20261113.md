# leon80148/taigi-cosyvoice3-inference-20261113

## Resumen

Taigi CosyVoice3 Inference es un conjunto de pesos de inferencia para síntesis de voz (text-to-speech) especializado en taiwanés (taigi, código ISO `nan`), derivado del modelo upstream CosyVoice3 de FunAudioLLM. Lo publica el usuario leon80148 en Hugging Face como pesos de modelo de lenguaje ya fusionados (merged) con un adaptador LoRA entrenado para la variante de taiwanés, y está pensado para alimentar una demo de clonación de voz desplegada como Space en la misma plataforma. El repositorio ocupa 2,6 GB y no incluye ni el dataset de entrenamiento ni grabaciones de audio.

El modelo se distribuye con la etiqueta `experimental` y una licencia propia denominada `research-use-notice`, que restringe el uso a investigación y remite a limitaciones de derechos de terceros. La model card advierte explícitamente de que la pronunciación y la similitud de la voz clonada pueden variar, por lo que no debe tratarse como un sistema listo para producción. El LoRA en formato tensor-only se publica por separado en otro repositorio del mismo autor.

La relevancia de esta ficha es doble: por un lado, documenta un caso de adaptación lingüística de un TTS moderno a una lengua de bajos recursos como el taiwanés; por otro, sirve de ejemplo de publicación de pesos derivados con licencia restrictiva y sin datos de entrenamiento, lo que limita la reproducibilidad y la auditoría del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de CosyVoice3; el repositorio no detalla la arquitectura interna) |
| Parametros totales | no disponible (el upstream CosyVoice3 referenciado se etiqueta como 0.5B, pero no se confirma el tamaño de estos pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | taiwanés (`nan`) |
| Licencia | `research-use-notice` (licencia `other`, uso experimental de investigación) |
| Formato de pesos | no disponible (pesos de modelo de lenguaje fusionados; el LoRA separado se describe como tensor-only) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente los pesos del modelo de lenguaje ya fusionados con el adaptador LoRA de taiwanés, destinados a la inferencia del sistema TTS. El modelo base es CosyVoice3 de FunAudioLLM (referenciado como Fun-CosyVoice3-0.5B-2512), un sistema de síntesis de voz con capacidad de clonación. No se publica información sobre la arquitectura interna de la variante, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El autor indica de forma explícita que no se incluyen ni el dataset de entrenamiento ni las grabaciones de audio utilizadas, y que el LoRA en formato tensor-only se distribuye aparte. Esto impide verificar la procedencia de los datos de voz y auditar el proceso de adaptación. La model card califica el resultado como experimental y advierte de posibles errores en la pronunciación y en la similitud de la voz clonada.

## Capacidades

- Síntesis de voz (text-to-speech) en taiwanés.
- Clonación de voz, según la etiqueta `voice-cloning` y la demo asociada.
- Integración con el pipeline `text-to-speech` de Hugging Face.
- Capacidad multilingüe: no disponible; el modelo declara únicamente el idioma `nan`.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio de entrada: no disponible.
- Ajuste fino adicional: no disponible en este repositorio; el LoRA se publica por separado.

## Casos de uso

- Investigación en síntesis de voz para lenguas de bajos recursos: el modelo permite experimentar con TTS en taiwanés y evaluar la calidad de pronunciación y prosodia en un contexto académico, siempre bajo la licencia de uso de investigación.
- Evaluación de clonación de voz: al estar vinculado a una demo de clonación, sirve para estudiar la similitud de timbre y los artefactos de un adaptador LoRA sobre CosyVoice3, comparando con el modelo base.
- Prototipado de asistentes de voz en taiwanés: útil para validar la viabilidad de un asistente conversacional en esta lengua antes de invertir en un modelo con licencia comercial.
- Conservación y divulgación lingüística: permite generar muestras de audio en taiwanés para materiales educativos o de documentación, con revisión humana de la pronunciación por las advertencias del autor.
- Comparación de estrategias de adaptación: al disponer del LoRA separado y de los pesos fusionados, se puede estudiar la diferencia entre inferencia con adaptador y con pesos fusionados.
- Docencia y demostraciones: adecuado para talleres sobre TTS y adaptación lingüística, dado su tamaño de repositorio moderado (2,6 GB) y su carácter experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no detalla el consumo de memoria ni la cuantización.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card solo menciona la demo en Hugging Face Spaces.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taigi CosyVoice3 Inference (este modelo) | no disponible | no disponible | taiwanés (`nan`) | `research-use-notice` | Hugging Face, 0 descargas |
| Fun-CosyVoice3-0.5B-2512 (upstream) | 0.5B (según etiqueta) | no disponible | no disponible | no disponible | Hugging Face (FunAudioLLM) |
| Alternativas TTS multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia `research-use-notice`: restringe el uso a investigación y remite a limitaciones de derechos de terceros; no se autoriza explícitamente el uso comercial.
- Modelo experimental: el autor advierte de que la pronunciación y la similitud de la voz pueden presentar errores.
- Sin dataset ni grabaciones: no es posible auditar los datos de entrenamiento ni verificar la procedencia de las voces.
- Idioma único: solo declara taiwanés (`nan`); no hay evidencia de soporte multilingüe.
- Sin datos de benchmarks ni de arquitectura: no se puede estimar su calidad frente a alternativas.
- Riesgo de alucinación y artefactos acústicos: inherente a los sistemas TTS, agravado por el carácter experimental y la falta de evaluación publicada.
- Sesgos: no disponible; no se documentan sesgos de voz, género o registro.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Posibles restricciones de derechos de terceros sobre las voces clonadas, según la propia licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leon80148/taigi-cosyvoice3-inference-20261113
- LoRA separado: https://huggingface.co/leon80148/taigi-cosyvoice3-lora-20261113
- Demo de clonación de voz: https://huggingface.co/spaces/leon80148/taigi-cosyvoice3-voice-clone
- Modelo upstream CosyVoice3: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Licencia: https://huggingface.co/leon80148/taigi-cosyvoice3-inference-20261113/blob/main/LICENSE
