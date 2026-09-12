# NathanielArfin/gpt-hansard-11m

## Resumen

GPT-Hansard-11M es un modelo de lenguaje de tipo GPT entrenado desde cero por Nathaniel Arfin sobre los Debates oficiales (Hansard) de la Cámara de los Comunes de Canadá correspondientes a las legislaturas 39-1 a 45-1. No es un ajuste fino ni una destilación de un modelo preexistente: el tokenizador, los pesos y el stack de entrenamiento parten de cero, con un corpus de 806 millones de caracteres procedente del XML oficial. El objetivo declarado es educativo: demostrar qué conocimiento y qué registro lingüístico puede capturar un transformer de escala muy reducida cuando se le da un dominio cerrado y formalizado.

El modelo tiene 11.330.048 parámetros con embeddings atados, 6 capas, 6 cabezas de atención, d_model de 384 y una ventana de contexto de 512 tokens. Su vocabulario es deliberadamente pequeño (1.280 entradas: 256 bytes base más 1.024 fusiones BPE), lo que reduce el coste de la capa de embeddings pero limita la compresión efectiva del texto. Tras el preentrenamiento se aplicó un ajuste supervisado (SFT) sobre 70.808 intercambios reales de Question Period minados del mismo XML con etiquetas ground-truth, con bloqueo de idioma: preguntas en francés solo emparejan con respuestas en francés.

Su relevancia actual es acotada y de nicho. No compite con modelos de propósito general ni con modelos pequeños de uso industrial; su interés reside en ser un artefacto reproducible y auditable de entrenamiento from scratch sobre un corpus parlamentario con derechos de la Corona, y en mostrar un registro parlamentario aprendido de forma medible (apertura con la atribución del respondiente, fórmulas de mesa, no-respuesta ministerial). Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación más que un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (6 capas, 6 cabezas, d_model 384), embeddings atados, inicialización estilo GPT-2 (std 0.02) con proyecciones residuales a cero |
| Parametros totales | 11.330.048 (embeddings atados) |
| Longitud de contexto | 512 tokens (aproximadamente 1.600 caracteres) |
| Tipos de cuantizacion | no disponible; solo se publica checkpoint PyTorch en precisión completa |
| Idiomas soportados | inglés (en) y francés (fr) |
| Licencia | Apache-2.0 (pesos, por Nathaniel Arfin) |
| Formato de pesos | checkpoint PyTorch (`.pt`, cargado con `torch.load`), fichero `gpt-11m-sft-bilingual-named.pt` |
| Vocabulario | 1.280 entradas (256 bytes + 1.024 fusiones BPE) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de 6 capas con 6 cabezas de atención y d_model de 384, con atado de embeddings entre la capa de entrada y la de salida y proyecciones residuales inicializadas a cero, siguiendo el esquema de inicialización de GPT-2 (std 0.02). El tokenizador es propio y muy reducido: 256 bytes base más 1.024 fusiones BPE, lo que da un vocabulario de 1.280 entradas. No hay innovaciones arquitectónicas destacables: no emplea MoE, ni capas SSM, ni atención lineal, ni decodificación especulativa.

El preentrenamiento se ejecutó durante 20.000 pasos con batch de 16 y bloque de 512 tokens, optimizador AdamW, scheduler coseno con LR de 6e-4 a 6e-5 y 200 pasos de warmup, recorte de gradiente a 1.0, sobre aproximadamente 164 millones de tokens vistos (0,64 épocas del flujo inglés de 258 millones de tokens). Después se aplicó un SFT con enmascarado de prompt sobre un flujo empaquetado de pares pregunta/respuesta extraídos de 70.808 intercambios reales de Question Period, con etiquetas `Type="Question"`/`Type="Answer"` del XML oficial y sin heurísticas, y con bloqueo estricto de idioma. El SFT se ejecutó 300 pasos con LR 1e-5; los objetivos de respuesta comienzan con la atribución parlamentaria del respondiente, de modo que las generaciones arrancan con nombre, cargo y partido.

## Capacidades

- Generación de texto en registro parlamentario formal: fórmulas de mesa, presentación de mociones, Standing Orders y la no-respuesta ministerial característica.
- Apertura de respuestas con la atribución del respondiente (nombre, cargo y partido), aprendida explícitamente durante el SFT.
- Respuesta a preguntas de formato libre type Question Period, generalizando a preguntas que nunca aparecieron en los pares de entrenamiento.
- Capacidad bilingüe inglés-francés con bloqueo de idioma en el SFT: responde normalmente en el idioma de la pregunta, aunque ocasionalmente cruza de idioma.
- Modelado de lenguaje cerrado (closed-book): todo su conocimiento proviene del corpus Hansard.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No se documentan capacidades de generación de código ni de matemáticas.

## Casos de uso

- Investigación educativa sobre entrenamiento from scratch: reproducir el pipeline completo con `gpt_tokens.py` (script autocontenido, PEP 723) para estudiar cómo escala el conocimiento factual en función del número de parámetros, usando los pares de control de 242K y 989K parámetros del propio autor.
- Generación de texto sintético en registro parlamentario: producir intervenciones con la forma correcta (atribución inicial, fórmulas de mesa, estructura de pregunta y respuesta) para aumentar datos de entrenamiento o pruebas de sistemas de análisis parlamentario, asumiendo que el contenido factual será inventado.
- Prototipado de chatbots de dominio cerrado en entornos de muy bajos recursos: con 11,33 millones de parámetros puede ejecutarse en CPU y desplegarse como demostración de diálogo Q/A sin infraestructura GPU.
- Análisis estilométrico del discurso parlamentario canadiense: usar el modelo como referencia de la distribución del registro (bits/char de 0,918 en la cola reservada del corpus) para comparar con textos reales y detectar desviaciones de estilo.
- Enseñanza de tokenización subword con vocabulario restringido: el tokenizador de 1.280 entradas (256 bytes + 1.024 fusiones) sirve como caso de estudio de compromiso entre tamaño de vocabulario y compresión en corpus bilingües.
- Pruebas de sesgo y alucinación controladas: al ser un modelo pequeño, cerrado y con corpus conocido, es útil para medir con precisión qué tipo de entidades inventa (números de ley, fechas, estadísticas y nombres) y a qué confianza.
- Filtrado o priorización de documentos Hansard: usar la perplejidad del modelo como señal para detectar fragmentos anómalos o mal extraídos del XML original.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a la cola reservada del corpus (nunca vista en entrenamiento) y a la perplejidad tras el SFT:

| Modelo | Parametros | Bits/char (held-out) | Registro QP |
|---|---|---|---|
| GPT a nivel de caracter (baseline) | 242K | 1,99 | no evaluado |
| GPT con tokenizador, small | 989K | 1,334 | en registro |
| GPT con tokenizador, este modelo | 11,33M | 0,918 | 5/6 en atribución y forma del hablante |

Perplejidad tras el SFT: 2,03 nats/token, al mismo nivel que el modelo base, lo que según el autor indica que el SFT no degradó el conocimiento del preentrenamiento.

No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, HumanEval, GSM8K o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 45 MB en FP32 y unos 23 MB en FP16/BF16 para los 11,33 millones de parámetros; con contexto de 512 tokens las activaciones son despreciables. Cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer sirve. El checkpoint se carga con `map_location="cpu"`, por lo que la ejecución en CPU es el escenario previsto por el autor.
- Cabe en GPU consumer: sí, en cualquier modelo (desde GTX 1050 en adelante), y también en CPU y en sistemas embebidos con memoria suficiente.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI; el único formato publicado es un checkpoint PyTorch que requiere el script propio `gpt_tokens.py`. No se publican pesos en GGUF ni safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Solo se dispone de comparación con las dos variantes del propio autor recogidas en la model card. No se proporcionan en la información disponible otros modelos comparables de la misma categoría.

| Modelo | Parametros | Bits/char (held-out) | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GPT a nivel de caracter (baseline del autor) | 242K | 1,99 | no disponible | no disponible | no disponible |
| GPT con tokenizador, small (del autor) | 989K | 1,334 | no disponible | no disponible | no disponible |
| GPT-Hansard-11M (este modelo) | 11,33M | 0,918 | 512 tokens | Apache-2.0 | PyTorch `.pt` |

Comparativa con alternativas externas: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Alucinación factual severa y confiada: el propio autor advierte de que inventa números de ley, fechas, estadísticas y nombres con total seguridad; toda afirmación factual debe tratarse como no verificada.
- Capacidad de conocimiento limitada por diseño: solo sabe lo que 11,33 millones de parámetros pueden retener de 806 millones de caracteres de Hansard, y es un modelo closed-book sin acceso a fuentes externas.
- Ventana de contexto muy corta: 512 tokens (aproximadamente 1.600 caracteres), insuficiente para conversaciones multi-turno largas o documentos extensos.
- Cruce ocasional de idioma: aunque el SFT bloqueó el emparejamiento por idioma, el modelo puede responder en el idioma equivocado.
- Vocabulario muy reducido (1.280 entradas): penaliza la compresión y el rendimiento en textos fuera del dominio parlamentario.
- Licencia de los pesos Apache-2.0, pero el corpus subyacente (Debates oficiales, Cámara de los Comunes de Canadá) está sujeto a copyright de la Corona, lo que condiciona la redistribución de datos derivados.
- El autor declara no estar afiliado ni respaldado por la Cámara de los Comunes; no debe presentarse como herramienta oficial.
- Ausencia de adopción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validación por terceros.
- No apto para producción en tareas que requieran exactitud factual, tool calling, agentes o razonamiento multi-paso, capacidades que no están documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NathanielArfin/gpt-hansard-11m
- Dataset asociado: https://huggingface.co/datasets/NathanielArfin/canadian-hansard-2006-now
- Script de entrenamiento y pipeline: `gpt_tokens.py` (autocontenido, PEP 723), referenciado en la model card
- Paper, blog, repositorio o demo adicionales: no disponible; los resultados de la búsqueda web no contenían enlaces relevantes al modelo
