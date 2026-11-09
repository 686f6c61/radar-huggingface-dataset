# openbmb/MiniCPM5-1B-MLX

## Resumen

MiniCPM5-1B es un modelo de lenguaje causal denso de 1.080.632.832 parámetros (679.552.512 sin contar embeddings) desarrollado por OpenBMB, primer checkpoint de la serie MiniCPM5. Está diseñado específicamente para despliegue local en dispositivo, entornos edge y escenarios con recursos limitados, manteniendo un soporte nativo de contexto largo de 131.072 tokens y modos de razonamiento conmutables (Think / No Think) sobre el mismo checkpoint. La variante aquí descrita, MiniCPM5-1B-MLX, es la conversión a 4 bits para Apple Silicon mediante MLX.

El modelo emplea una arquitectura estándar `LlamaForCausalLM` con 24 capas y atención GQA (16 cabezas de consulta, 2 de clave-valor), lo que reduce drásticamente la huella de memoria en inferencia. Su propuesta de valor es ocupar el trono de la clase 1B en código abierto: según el autor, alcanza SOTA dentro de su conjunto de comparación, con ventaja especialmente visible en uso de herramientas (tool calling), generación de código y razonamiento difícil.

Es relevante ahora porque cubre el hueco de asistentes locales y agentes de código que deben ejecutarse en portátiles, mini-PC o dispositivos Apple sin GPU dedicada, con licencia Apache 2.0 y un ecosistema de formatos (BF16, GGUF, MLX) publicado en paralelo. Incluye además recursos de despliegue y ajuste fino en el repositorio GitHub de MiniCPM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`LlamaForCausalLM`), 24 capas, GQA (16 cabezas Q / 2 KV) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4 bits (esta variante MLX); el autor publica además BF16 y GGUF |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX, 4 bits); el repositorio ocupa 0,6 GB |

## Arquitectura y entrenamiento

MiniCPM5-1B es un transformer causal denso con la arquitectura estándar de Llama, 24 capas y atención con query grouping (GQA) de 16 cabezas de consulta frente a 2 de clave-valor. De los 1.080 millones de parámetros totales, 679 millones son no-embedding, lo que indica un vocabulario de embeddings relativamente grande respecto al cuerpo del modelo. El contexto nativo alcanza 131.072 tokens.

El entrenamiento sigue la receta de gestión de datos por niveles UltraData Tiered Data Management y se divide en tres fases: preentrenamiento base (con fase estable y fase de decay), mid-training para reforzar capacidades objetivo y adaptar la distribución de datos, y post-entrenamiento. Este último consta de SFT con 200.000 millones de tokens de razonamiento profundo y 200.000 millones de tokens de razonamiento híbrido, seguido de entrenamiento con RL mediante profesores especializados en matemáticas, código, QA a libro cerrado y escritura, cuyos conocimientos se destilan de vuelta al modelo final mediante On-Policy Distillation (OPD). Los corpus empleados (Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605) se publican junto al modelo. La plantilla de chat incorpora `<think>` conmutable vía `enable_thinking`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento híbrido: modo Think (razonamiento deliberado) y modo No Think (respuesta rápida) sobre el mismo checkpoint, conmutables por plantilla.
- Generación de código y tareas de programación, con ventaja declarada por el autor en esta categoría.
- Tool calling / function calling nativo, orientado a flujos agénticos.
- Razonamiento matemático y QA a libro cerrado, reforzados vía RL y OPD.
- Soporte de contexto largo de hasta 131.072 tokens para documentos extensos y conversaciones prolongadas.
- Escritura y generación de contenido general.
- Despliegue en dispositivo: variantes GGUF (llama.cpp/Ollama/LM Studio) y MLX 4 bits para Apple Silicon.

## Casos de uso

- Asistente local en portátil o mini-PC: la variante MLX 4 bits ocupa 0,6 GB, por lo que cabe en memoria unificada de cualquier Mac moderno y permite un asistente privado sin conexión.
- Agente de código en el IDE: con tool calling nativo y contexto de 131.072 tokens, puede leer repositorios completos, invocar herramientas de edición y ejecutar bucles multi-paso de corrección.
- Automatización de atención al cliente en edge: conversaciones multi-turno con contexto largo y modo No Think para baja latencia en dispositivos sin GPU.
- Enriquecimiento de datos y etiquetado a gran escala: al ser un modelo de 1B con licencia Apache 2.0, es viable ejecutar miles de inferencias en paralelo para clasificación, extracción o generación sintética.
- Razonamiento matemático asistido en entornos educativos: el modo Think permite trazas de razonamiento paso a paso, útil para tutores automáticos.
- Prototipado rápido de pipelines agénticos: sirve como modelo de referencia barato para validar flujos de tool use antes de escalar a modelos mayores.
- Aplicaciones de escritorio tipo "desk pet": el propio autor publica MiniCPM Desk Pet, un ejemplo de mascota de escritorio impulsada por LLM local con este modelo.

## Benchmarks y rendimiento

El autor declara SOTA en la clase 1B frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja en tool use, código y razonamiento difícil, pero los resultados numéricos se presentan únicamente en imágenes del repositorio GitHub y no se reproducen como tabla en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en 4 bits (MLX): en torno a 0,6 GB de pesos, más overhead de contexto; el repositorio completo ocupa 0,6 GB.
- VRAM estimada en BF16: aproximadamente 2,2 GB solo de pesos, más caché KV para contexto largo.
- GPU recomendadas: Apple Silicon (M1 o superior) para la variante MLX; cualquier GPU consumer con al menos 4 GB para la variante GGUF cuantizada; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en RTX 3060/4060 y superiores, y en cualquier Mac con memoria unificada.
- Opciones de despliegue: MLX (esta variante), llama.cpp, Ollama, LM Studio (vía GGUF), transformers y text-generation-inference (el modelo declara compatibilidad con endpoints).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B | 1,08B | 131.072 | Apache 2.0 | BF16, GGUF, MLX | SOTA declarado en clase 1B por el autor |
| Qwen3-0.6B | 0,6B | no disponible | no disponible | no disponible | Baseline de comparación citado por el autor |
| Qwen3.5-0.8B | 0,8B | no disponible | no disponible | no disponible | Baseline de comparación citado por el autor |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible | no disponible | no disponible | Baseline de comparación citado por el autor |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no se detallan en la información proporcionada; solo se confirma que son los baselines usados por OpenBMB en su evaluación.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Riesgo de alucinación inherente a modelos de 1B, especialmente en QA a libro cerrado y razonamiento de múltiples pasos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los corpus de entrenamiento (Ultra-FineWeb y derivados) pueden introducir sesgos de dominio web.
- Contexto largo: aunque soporta 131.072 tokens, la calidad efectiva en ventanas extremas no está cuantificada en la información disponible.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar las licencias de los datasets derivados si se redistribuyen.
- El modo Think incrementa la latencia y el consumo de tokens; en producción conviene conmutarlo según la tarea.
- La variante MLX está atada al ecosistema Apple; para otros entornos debe usarse la versión BF16 o GGUF.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Modelo BF16: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Modelo Base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B
- Informe técnico MiniCPM: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Wiki de MiniCPM (chino): https://openbmb.cn/docs/
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- UltraData: https://ultradata.openbmb.cn/
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
