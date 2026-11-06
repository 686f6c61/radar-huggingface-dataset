# CollectionStudio/Muse2-230M

## Resumen

Muse2-230M es un modelo de lenguaje compacto desarrollado por Muse Research (publicado en Hugging Face bajo el perfil CollectionStudio) y construido íntegramente desde cero: arquitectura, tokenizador y stack de inferencia. Está pensado para entornos de borde y ejecución en dispositivo, donde el espacio y la latencia importan más que la fiabilidad factual. La versión publicada aquí es la variante ajustada por instrucciones (Instruct) del modelo base Muse-research/Muse2-230M-Base.

La arquitectura es un transformer autorregresivo híbrido de 14 bloques que intercala 8 bloques de convolución causal corta (kernel 3) con 6 bloques de atención completa con Grouped-Query Attention (16 cabezas de consulta, 8 de clave-valor). Emplea RoPE con theta 1e6, RMSNorm, MLP SwiGLU paralelos fusionados (hidden 1024, ff 2560), embeddings de entrada/salida atados y un vocabulario de 65.536 tokens BPE byte-level entrenado desde cero. El recuento real de parámetros en safetensors es de 196.137.984.

Su relevancia actual reside en que es un artefacto de investigación reproducible de principio a fin, orientado al estudio de arquitecturas híbridas compactas, la extracción estructurada de logs a JSON y la generación de salidas con disciplina de formato. No ha recibido alineamiento de seguridad, RLHF ni DPO, y el propio autor lo desaconseja para despliegues en producción sin evaluación y salvaguardas por parte del desarrollador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo híbrido convolución/atención (14 bloques: 8 conv causal corta kernel 3 + 6 atención completa), GQA, RoPE theta 1e6, RMSNorm, SwiGLU paralelo fusionado |
| Parámetros totales | 196.137.984 (denominado 230M por el autor) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8k por defecto (128k máximo) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | Inglés (además maneja código fuente y texto matemático) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch, paquete `muse` propio; no es una clase nativa de `transformers`) |

## Arquitectura y entrenamiento

Muse2-230M emplea una disposición híbrida de estilo LFM2: 14 bloques en los que se intercalan 8 bloques de convolución causal en profundidad de kernel 3 con 6 bloques de atención completa. La atención usa Grouped-Query Attention con 16 cabezas de consulta y 8 de clave-valor, y los embeddings de entrada y salida están atados. Cada bloque incorpora un MLP SwiGLU paralelo fusionado con dimensión oculta 1024 y dimensión de feed-forward 2560. El tokenizador es un BPE byte-level de 65.536 tokens entrenado desde cero, con tokens de control estilo ChatML (pad=0, bos=1, eos=7, `<|im_end|>`=4). La implementación es propia en PyTorch (`Muse2ForCausalLM`), sin código de `transformers`, aunque el esquema de configuración sigue el layout de la familia LFM2 por compatibilidad con herramientas de borde.

La versión Instruct se ha alineado únicamente mediante ajuste supervisado (SFT) con enmascaramiento de pérdida solo en la completación. No se ha aplicado RLHF ni DPO. El corte de conocimiento es de principios de 2024. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles sobre el proceso de SFT más allá del enmascaramiento de pérdida.

## Capacidades

- Generación de texto en inglés con orientación conversacional y estilo asistente.
- Generación de código fuente y manejo de texto matemático.
- Extracción estructurada de logs de desarrollador a JSON, con disciplina de formato.
- Salidas con formato controlado (structured output) gracias a tokens de control estilo ChatML.
- Conversación multiturno mediante plantilla de chat (`apply_chat_template`).
- Capacidad de servir como base para ajuste fino posterior.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), visión ni audio.

## Casos de uso

- Extracción de logs a JSON: el modelo recibe un log crudo junto con un esquema y devuelve JSON estructurado; su entrenamiento orientado a formato y su plantilla ChatML lo hacen adecuado para este pipeline de compilación silenciosa, tal como ilustra el ejemplo del autor.
- Chat interactivo en dispositivos de borde: con 196M de parámetros y pesos en safetensors de 0,4 GB, puede ejecutarse en CPU local mediante `scripts/chat.py --interactive`, útil para asistentes embebidos sin GPU.
- Estudio de arquitecturas híbridas: sirve como banco de pruebas reproducible para investigar la interacción entre convoluciones causales cortas y atención completa en modelos compactos.
- Base para ajuste fino específico de dominio: al estar bajo Apache-2.0 y entrenado desde cero, es un punto de partida para SFT sobre tareas acotadas de formato o extracción.
- Normalización de salidas en herramientas de desarrollo: puede usarse para convertir mensajes de error o trazas en estructuras consumibles por otras herramientas, con temperatura baja (0,2) y top_k 50 como sugiere el autor.
- Experimentación educativa: adecuado para docencia sobre tokenización BPE byte-level, GQA y bloques convolucionales en modelos de lenguaje.
- Prototipado rápido en la nube: el autor documenta ejecución en una única T4 mediante `modal run modal_app.py::chat`, útil para validar ideas sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 0,4 GB; en float32 el modelo de 196M de parámetros requiere aproximadamente 0,8 GB solo para pesos, más memoria para activaciones y caché KV.
- GPU recomendadas: el autor documenta ejecución en una única T4 en la nube; por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, series RTX 30xx/40xx) e incluso en CPU.
- Opciones de despliegue: paquete propio `muse` (PyTorch + safetensors), script local `scripts/chat.py` para CPU y aplicación Modal (`modal_app.py`) para T4. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / ecosistema | Notas |
|---|---|---|---|---|---|
| Muse2-230M (Instruct) | 196,1M | 8k (128k máx.) | Apache-2.0 | safetensors, paquete `muse` propio | Híbrido conv/atención, sin alineamiento de seguridad |
| Muse2-230M-Base | 196,1M | 8k (128k máx.) | Apache-2.0 | safetensors, paquete `muse` propio | Modelo base del que deriva esta variante |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No ha recibido alineamiento de seguridad, red-teaming ni filtrado de contenido; puede producir salidas inexactas, sesgadas, repetitivas u objetables.
- Alucina hechos con facilidad a esta escala; el propio autor advierte de que no debe usarse para fiabilidad factual.
- Solo soporta inglés de forma nativa (además de código y matemáticas); no hay capacidades multilingües documentadas.
- El contexto por defecto es de 8k, con un máximo de 128k, pero no se documenta el rendimiento real en ventanas largas.
- No es una clase nativa de `transformers`: requiere el paquete `muse` propio, lo que limita la compatibilidad con herramientas estándar del ecosistema.
- Uso fuera de alcance: despliegue en producción sin evaluación y salvaguardas, aplicaciones críticas de seguridad, médicas, legales o de dependencia factual.
- Licencia Apache-2.0 permite uso comercial de los pesos, pero las licencias y atribuciones de los datasets upstream siguen aplicando a usos derivados.
- El estado del modelo es estático; pueden publicarse versiones posteriores con capacidades mejoradas.

## Enlaces

- [Hugging Face: CollectionStudio/Muse2-230M](https://huggingface.co/CollectionStudio/Muse2-230M)
- [Modelo base: Muse-research/Muse2-230M-Base](https://huggingface.co/Muse-research/Muse2-230M-Base)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
