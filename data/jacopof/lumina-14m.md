# jacopof/lumina-14m

## Resumen

Lumina 14M es un modelo de lenguaje causal de 14.394.240 parámetros desarrollado por Jacopo Forti (jacopof) y publicado en Hugging Face. Se presenta como la versión ampliada de la familia Lumina, con 8 bloques Transformer, una dimensión oculta de 384, 6 cabezas de atención y una ventana de contexto de 256 bytes. Su objetivo es la generación de texto en italiano y de fragmentos de código Python y JavaScript en entornos locales y de borde, sin llamadas a API.

El modelo se ha entrenado desde cero sobre un corpus de más de 50 millones de palabras que incluye literatura clásica italiana, Wikipedia en italiano, teoría científica y un conjunto de destilación técnica con Python y JavaScript. El autor reporta una pérdida de validación de 1,27 y un peso de 55 MB en safetensors, lo que lo sitúa en la categoría de modelos ultraligeros para ejecución offline en CPU o GPU de consumo.

Es relevante por su enfoque de edge AI y por publicar pesos en safetensors y GGUF con licencia MIT. Ahora bien, su contexto de 256 bytes y su tamaño limitan el tipo de tareas: es adecuado para experimentación, prototipos y generación de fragmentos muy breves, no para conversaciones largas ni razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, Pre-LN, atención multi-cabeza con SDPA de PyTorch, activación GELU |
| Parámetros totales | 14.394.240 |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 256 bytes |
| Tipos de cuantización | Safetensors con pesos originales y GGUF; no se detallan variantes de cuantización en la información disponible |
| Idiomas soportados | Italiano (it); no se documentan otros idiomas |
| Licencia | MIT |
| Formato de pesos | Safetensors y GGUF |
| Capas | 8 bloques Transformer |
| Dimensión oculta | 384 |
| Cabezas de atención | 6 cabezas, con dimensión por cabeza de 64 |
| Dimensión feed-forward | 1.536, con expansión 4x |
| Vocabulario | 259 tokens: bytes UTF-8 más BOS, EOS y PAD |
| Tamaño de pesos | 55 MB en safetensors; GGUF de aproximadamente 55 MB |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Lumina 14M es un transformer causal decoder-only con normalización Pre-LN y atención multi-cabeza implementada mediante SDPA de PyTorch. Usa 8 bloques, una dimensión oculta de 384, 6 cabezas de atención de 64 dimensiones cada una y una capa feed-forward de 1.536 unidades con activación GELU. La tokenización es byte-level, con un vocabulario de 259 tokens que cubre bytes UTF-8 y tokens especiales BOS, EOS y PAD. La ventana de contexto es de 256 bytes, no de 256 tokens.

El entrenamiento se realizó desde cero con AdamW y cosine annealing sobre una GPU RTX 5060, según la model card. El corpus supera los 50 millones de palabras e incluye literatura clásica italiana, Wikipedia en italiano, teoría científica y un dataset de destilación técnica con Python y JavaScript. El autor reporta una pérdida de validación de 1,27. No se documentan RLHF, DPO, decodificación especulativa ni mecanismos de atención lineal o híbrida.

## Capacidades

- Generación de texto en italiano con coherencia local en fragmentos breves, limitada por la ventana de 256 bytes.
- Generación de código Python y JavaScript, según el corpus de entrenamiento declarado; no hay benchmark estándar detallado.
- Continuación de texto literario y prosa clásica italiana.
- Ejecución totalmente offline, sin dependencias de API ni seguimiento.
- Distribución en safetensors y GGUF para llama.cpp, LM Studio y Ollama.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe no disponible: solo se declara italiano.

## Casos de uso

- Generación de texto literario breve en italiano: puede continuar fragmentos de poesía o prosa clásica con un prompt corto, aunque el contexto de 256 bytes obliga a limitar la entrada.
- Prototipos de asistentes locales en italiano: adecuado para pruebas de concepto en dispositivos de borde o entornos sin conexión, con bajo consumo de memoria y sin envío de datos a servicios externos.
- Autocompletado de código Python y JavaScript en entornos educativos: puede generar fragmentos cortos y ejemplos simples, pero no sustituye a un modelo de código de mayor tamaño en producción.
- Enseñanza de fundamentos de LLM: su tamaño de 14M, 8 capas y pesos safetensors permiten estudiar tokenización byte-level, atención y entrenamiento desde cero en hardware modesto.
- Validación de pipelines GGUF: sirve para probar la integración de llama.cpp, LM Studio u Ollama con un modelo de 55 MB antes de desplegar modelos mayores.
- Generación de respuestas breves para FAQ o formularios en italiano: útil para preguntas simples y respuestas de una o dos frases, siempre con revisión humana.
- Investigación sobre tokenización byte-level: su vocabulario de 259 tokens y contexto en bytes facilitan experimentos controlados sobre eficiencia y representación.
- Demostración educativa en Hugging Face Spaces: el autor proporciona un Space de chat para probar el modelo sin instalación local.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor publica una tabla propia de evaluación multi-dominio, sin metodología detallada:

| Modelo | Parámetros | Formato | Coding y Python | Cultura y geografía | Ciencia y naturaleza | Honestidad (anti-alucinación) |
|---|---:|---|---:|---:|---:|---:|
| Lumina 2.75M | 2,75 M | Safetensors / GGUF | 75 % | 100 % | 67 % | 67 % |
| Lumina 14M | 14,39 M | Safetensors / GGUF | Extendido, sin cifra | Extendido, sin cifra | 67 % | 100 % |

Los valores marcados como «Extendido» no son numéricos y no permiten una comparación cuantitativa directa. No se dispone de resultados independientes ni de detalles sobre el conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. Los pesos safetensors ocupan unos 55 MB y el contexto es de solo 256 bytes; no se publica una cifra oficial de VRAM.
- GPU recomendadas: no se especifican. Por tamaño, cabe en CPU y en cualquier GPU de consumo con al menos 1 GB libre. El entrenamiento se realizó en una RTX 5060.
- Cabe en GPU de consumo: sí, en GPUs con 1 GB o más de memoria libre; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, Python mediante `modeling_lumina` y el tag `endpoints_compatible` de Hugging Face. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos | Rendimiento reportado |
|---|---:|---|---|---|---|---|
| Lumina 14M | 14.394.240 | 256 bytes | Italiano | MIT | Safetensors, GGUF | Ciencia 67 %, honestidad 100 %; coding y cultura «Extendido», sin cifra |
| Lumina 2.75M | 2,75 M | No disponible | No disponible | No disponible | Safetensors, GGUF | Coding 75 %, cultura 100 %, ciencia 67 %, honestidad 67 % |
| Alternativas externas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se proporcionan en la información disponible modelos externos comparables de la misma categoría. La única comparación directa posible es con Lumina 2.75M, de la misma familia.

## Limitaciones y advertencias

- Contexto muy corto: 256 bytes equivalen a un fragmento breve; no es adecuado para conversaciones multi-turno, documentos largos, RAG ni resúmenes extensos.
- Idioma limitado: solo se declara italiano; no se documentan capacidades multilingües.
- Tamaño reducido: con 14M de parámetros, el conocimiento factual y el razonamiento son limitados, y el riesgo de alucinación en temas abiertos es alto.
- Sin alineación documentada: no se mencionan RLHF, DPO ni filtros de seguridad; puede generar contenido sesgado o inapropiado.
- Benchmarks del autor sin metodología detallada: los valores «Extendido» no son cuantificables y no hay resultados estándar como MMLU o HumanEval.
- Tokenización byte-level: el vocabulario de 259 tokens y el contexto medido en bytes pueden ser ineficientes para texto largo.
- Sin tool calling ni agentes: no se documenta soporte de funciones, herramientas o razonamiento multi-paso.
- Licencia MIT: permite uso comercial, pero no se detalla la procedencia ni las licencias del corpus de entrenamiento; conviene revisar ese punto antes de un despliegue comercial.
- Compatibilidad GGUF: no se especifican las variantes de cuantización incluidas; puede requerir pruebas con cada runtime.
- Carga en Python: el ejemplo usa `modeling_lumina` en lugar de una clase estándar de Transformers; puede requerir código personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jacopof/lumina-14m
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/jacopof/lumina-chat
- Pesos GGUF: https://huggingface.co/jacopof/lumina-14m/resolve/main/lumina-14m.gguf
- Licencia MIT: https://opensource.org/licenses/MIT
- Licencia del repositorio: https://huggingface.co/jacopof/lumina-14m/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/jacopof
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.ai

No se proporcionan paper, blog técnico ni repositorio adicional en la información disponible.
