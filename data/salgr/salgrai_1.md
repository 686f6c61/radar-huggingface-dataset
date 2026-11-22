# salgr/SalgrAI_1

## Resumen

SalgrAI-v1 es un modelo de lenguaje conversacional en ruso entrenado desde cero por un único desarrollador (Salgr) sobre una GPU RTX 3060 de 12 GB. Se trata de un transformer decoder-only de estilo Llama con 14.997.888 parámetros, 6 capas, dimensión oculta 384 y una ventana de contexto de 1024 tokens. Su vocabulario es un BPE byte-level de 8192 tokens entrenado específicamente sobre el corpus de preentrenamiento y los diálogos de ajuste fino.

El modelo está diseñado para conversación informal en ruso, con un estilo desenfadado de "Telegram en minúsculas", y se distribuye como experimento, demostración y material didáctico. No está pensado para uso serio: por su tamaño reducido es incapaz de mantener precisión factual o aritmética de forma fiable, y el propio autor lo advierte explícitamente en la model card.

Su interés técnico radica en que documenta de forma completa y verificable un pipeline de entrenamiento from-scratch (tokenizador, preentrenamiento, pseudo-diálogos y SFT) reproducible en hardware de consumo, con pesos en safetensors, PyTorch y GGUF float16 validados entre sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, RoPE con theta 10000, SwiGLU, sin biases, embeddings de entrada/salida atados) |
| Parametros totales | 14.997.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no se proporcionan variantes cuantizadas; solo F16 en GGUF y float32 en safetensors |
| Idiomas soportados | Ruso (principal), inglés parcial, dígitos y símbolos |
| Licencia | no disponible (la model card indica que el autor debe elegir licencia antes de publicar) |
| Formato de pesos | safetensors (float32), pytorch_model.bin, GGUF (float16), checkpoint nativo .pt en `original/` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con dimensión oculta 384, 6 cabezas de atención de dimensión 64 y FFN de 1202, con normalización RMSNorm, embeddings rotatorios RoPE (theta 10000), activación SwiGLU y sin términos de bias. Los embeddings de entrada y salida están atados. El tokenizador es un BPE byte-level de 8192 tokens entrenado sobre el texto de preentrenamiento y los diálogos.

El preentrenamiento se realizó desde inicialización aleatoria en bf16 sobre una RTX 3060, con unos 500M tokens (7.629 pasos de 65.536 tokens) muestreados al 50/50 entre Wikipedia en ruso (140,6M tokens de entrenamiento) y OpenSubtitles en ruso (103,0M tokens), en ventanas de 1024 tokens, con AdamW (lr 1e-3 con decaimiento coseno a 1e-4, weight decay 0.1, clipping 1.0). La pérdida de validación final fue 2,926 en Wikipedia (perplejidad 18,7) y 3,016 en subtítulos (perplejidad 20,4). El ajuste fino tuvo dos fases: primero 300.000 pseudo-diálogos construidos a partir de líneas adyacentes de subtítulos durante 2 épocas (pérdida de validación 3,472 sobre 500 retenidos), y después SFT sobre 2.850 diálogos sintéticos generados por Claude Haiku a partir de especificaciones, con lr 1.5e-4 y 150 diálogos de validación. La pérdida se calcula únicamente sobre los tokens del asistente.

## Capacidades

- Generación de texto conversacional en ruso informal, con estilo de chat de Telegram en minúsculas.
- Respuestas multi-turno dentro de la ventana de 1024 tokens, con formato de chat `<|user|>...<|assistant|>...<|eos|>`.
- Comprensión parcial de inglés, dígitos y símbolos, aunque el entrenamiento está centrado en ruso.
- Respuestas de "no lo sé" y rechazos breves de peticiones inseguras, inducidos durante el SFT.
- Presentación de sí mismo como SalgrAI, creado por Salgr.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- No dispone de filtro de seguridad ni de profanidad.

## Casos de uso

- Demostración educativa de entrenamiento from-scratch: el repositorio incluye código original, checkpoint nativo y script de chat, lo que permite reproducir el pipeline completo en una sola GPU de consumo.
- Prototipado de interfaces de chat en ruso: sirve para validar plantillas de prompt, streaming y formato de turnos antes de migrar a un modelo mayor.
- Pruebas de integración con llama.cpp: el GGUF F16 permite verificar servidores locales y el endpoint compatible con OpenAI sin coste de API.
- Experimentos de tokenización: su vocabulario BPE de 8192 tokens sobre ruso permite estudiar el efecto del tamaño de vocabulario en modelos pequeños.
- Generación de datos sintéticos de baja calidad para pruebas de pipelines: útil para rellenar colas, medir latencia o probar manejadores de errores.
- Investigación sobre estilos conversacionales: el corpus de diálogos sintéticos en tres oleadas permite analizar cómo el SFT modifica el tono y la estructura de las respuestas.
- Benchmark de referencia para modelos tiny en ruso: punto de comparación para medir perplejidad y coherencia en configuraciones de 15M parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación y perplejidades del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion en Wikipedia (preentrenamiento) | 2,926 (perplejidad 18,7) |
| Perdida de validacion en subtitulos (preentrenamiento) | 3,016 (perplejidad 20,4) |
| Perdida de validacion en pseudo-dialogos (etapa 1) | 3,472 sobre 500 retenidos |
| Diferencia maxima de logits transformers vs. original | ~1e-5 |
| Diferencia de log-probabilidades GGUF vs. original | < 0,002 en los prompts de prueba |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15M parámetros) y aproximadamente 30 MB en F16 GGUF, más el overhead del runtime y la caché KV para 1024 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una RTX 3060 de 12 GB.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers (carga directa sin código personalizado), llama.cpp con `llama-server` y endpoint compatible con OpenAI, y PyTorch nativo mediante `original/chat_example.py`.
- Latencia y throughput: no disponible; por el tamaño del modelo se espera latencia de milisegundos en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SalgrAI-v1 | 14,99M | 1024 | ru, en | no disponible | Hugging Face (safetensors, GGUF, .pt) |
| Modelos tiny Llama-style de 15M | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos conversacionales en ruso de tamano pequeno | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (tiny modelos conversacionales en ruso entrenados from-scratch) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es demasiado pequeño para ser fiable: responde fuera de tema con frecuencia y comete errores factuales y aritméticos.
- No incorpora filtro de seguridad ni de profanidad; puede generar contenido inapropiado.
- La licencia no está definida en la model card, por lo que el uso comercial queda sin marco legal claro hasta que el autor la especifique.
- El contexto máximo es de 1024 tokens y el código de referencia descarta los turnos más antiguos al llenarse; la plantilla de chat de Hugging Face no aplica ese recorte ni la sanitización de tokens de servicio.
- El modelo solo entiende ruso de forma fiable; el inglés es residual.
- Los diálogos de ajuste fino son sintéticos (generados por Claude Haiku) y no se publican, lo que limita la reproducibilidad exacta del SFT.
- El preentrenamiento usa Wikipedia y OpenSubtitles, con los sesgos y ruido propios de esas fuentes.
- La penalización por repetición en `transformers` se aplica también a los tokens del prompt, a diferencia del código de referencia.
- No se ofrecen variantes cuantizadas más allá de F16, lo que limita el despliegue en entornos con restricciones de memoria muy severas.

## Enlaces

- Hugging Face: https://huggingface.co/salgr/SalgrAI_1
- Versión en ruso de la model card: README_RU.md (referenciada en el repositorio)
- Código original y checkpoint nativo: carpeta `original/` del repositorio (model.py, common.py, salgrai_original.pt, chat_example.py)
- Pesos GGUF: SalgrAI-v1-F16.gguf en el repositorio
- Dataset de preentrenamiento: wikimedia/wikipedia (20231101.ru) y OPUS OpenSubtitles en ruso (referenciados en la model card)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
