# Jhonic/cero-base-es

## Resumen

cero-base-es es un modelo de lenguaje de 35,7 millones de parámetros entrenado desde cero en español por el desarrollador Jhonic (jceronch1) como parte del proyecto docente "Crear un LLM desde cero". No es un asistente de propósito general: es una herramienta pedagógica que permite ver, reproducir y entender cada pieza de un transformer decodificador moderno, desde el tokenizador BPE hasta el ajuste fino supervisado. El repositorio incluye dos variantes: el modelo base (continuación de texto) y el chatbot resultante del SFT.

La arquitectura sigue el patrón de transformer decodificador "moderno": RoPE para posiciones, RMSNorm pre-normalización, SwiGLU en la MLP, pesos de embedding compartidos entre entrada y salida, y ausencia de sesgos. Con 10 bloques, 8 cabezas, ancho 512 y contexto de 512 tokens, el modelo se entrenó sobre TinyStories en español (255.606 cuentos, 56,7 M de tokens) durante 7.000 pasos en una única GPU de portátil RTX 4070 de 8 GB, en 43 minutos.

Su relevancia es educativa, no competitiva: demuestra que un LLM funcional y reproducible cabe en hardware de consumo y en una tarde de entrenamiento, con métricas publicadas (perplejidad 4,96, 0,548 bits por carácter en validación) y un curso de 13 clases asociado. No está pensado para producción, atención al cliente ni tareas de razonamiento abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (RoPE, RMSNorm pre-norm, SwiGLU, embeddings compartidos, sin sesgos) |
| Parametros totales | 35.703.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + config.json + tokenizador.json propios |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador de 10 bloques con 8 cabezas de atención, dimensión de modelo 512 y contexto de 512 tokens. Incorpora las técnicas habituales en LLMs modernos: Rotary Position Embeddings (RoPE), normalización RMSNorm aplicada antes de cada subcapa, activación SwiGLU en la MLP, pesos de embedding de entrada y de salida compartidos (tied embeddings) y eliminación de términos de sesgo en todas las capas lineales. El tokenizador es un BPE a nivel de bytes entrenado desde cero sobre el propio corpus, con vocabulario de 8.192 tokens (incluidos cuatro especiales: `<|inicio|>`, `<|usuario|>`, `<|asistente|>`, `<|fin|>`) y una ratio media de 4,21 caracteres por token.

El preentrenamiento usó el dataset TinyStories en español (traducción automática del original de Microsoft, licencia CDLA-Sharing-1.0): 255.606 cuentos, 56,7 M de tokens, con 5.269 cuentos reservados para validación. Se realizaron 7.000 pasos de 32 secuencias de 512 tokens (114,7 M de tokens en total) con AdamW, tasa de aprendizaje 0,001 con calentamiento y decaimiento coseno, en precisión mixta bfloat16 sobre una RTX 4070 de portátil de 8 GB, con un tiempo total de 43 minutos. Posteriormente se aplicó un ajuste fino supervisado (SFT) sobre 80.000 conversaciones generadas por reglas a partir de los cuentos (peticiones de cuentos, continuación de cuentos, sumas pequeñas, charla y respuestas de "no lo sé"), con pérdida calculada únicamente sobre los turnos del asistente, 1.500 pasos de batch 32 y tasa 0,0002. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto en español: continuación de textos breves, principalmente cuentos infantiles con estructura narrativa simple.
- Chat básico conversacional en la variante `chat/`: responde saludos, pide temas y genera cuentos sobre animales u objetos.
- Continuación de cuentos: dado un inicio, prosigue la narración manteniendo coherencia local dentro de la ventana de 512 tokens.
- Aritmética elemental: el SFT incluye sumas pequeñas, aunque sin garantías de corrección fuera del rango entrenado.
- Reconocimiento de límites: responde "no lo sé" ante preguntas fuera de dominio (por ejemplo, capitales de países).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Multilingüismo: únicamente español; no se documenta competencia en otros idiomas.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo sirve como referencia completa y reproducible (pesos, config, tokenizador y código) para explicar en clase cada componente de un LLM moderno (RoPE, RMSNorm, SwiGLU, BPE) sin depender de implementaciones opacas.
- Reproducción de experimentos en hardware de consumo: investigadores o estudiantes con una GPU de 8 GB pueden reentrenar la receta completa (`cero todo --receta base`) en menos de una hora y comparar curvas de pérdida, lo que facilita experimentos controlados sobre tokenización, tamaño de contexto o datos.
- Generación de cuentos infantiles con fines educativos: la variante `chat/` produce narraciones cortas en español a partir de una petición, útil para demostraciones en talleres o material didáctico de baja exigencia.
- Estudio de ajuste fino supervisado (SFT): el par base/chat permite comparar el comportamiento antes y después del SFT sobre el mismo corpus, ilustrando cómo el formato de conversación y la máscara de pérdida cambian la distribución de salida.
- Análisis de decodificación: con temperatura 0 el modelo muestra bucles clásicos de decodificación voraz, lo que lo convierte en un caso práctico para enseñar temperatura, top-k, top-p y penalización por repetición.
- Prototipado de pipelines de inferencia propios: al no depender de `transformers`, sirve para probar cargadores de safetensors, tokenizadores BPE y bucles de generación caseros en entornos docentes o de investigación.
- Evaluación de métricas comparables entre tokenizadores: el uso de bits por carácter (0,548 en validación) permite explicar por qué la perplejidad no es directamente comparable entre modelos con vocabularios distintos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perdida en validacion (modelo base) | 1,602 |
| Perplejidad en validacion (modelo base) | 4,96 |
| Bits por caracter (modelo base) | 0,548 |
| Perdida de un modelo sin entrenar (referencia) | ln(8.192) = 9,01 |
| Evaluacion del chatbot | no disponible en la informacion proporcionada (el autor menciona `cero evaluar` con preguntas nuevas, pero no publica cifras) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (35,7 M de parámetros, aproximadamente 71 MB de pesos) más el espacio del tokenizador y del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 4070 de portátil de 8 GB en 43 minutos.
- Cabe en GPU consumer: sí, en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; también funciona en CPU (el autor lo indica explícitamente).
- Opciones de despliegue: el modelo no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI; se ejecuta con el paquete propio `cero` del repositorio de GitHub, cargando safetensors con `safetensors.torch.load_model`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la inferencia en CPU es viable para demostraciones interactivas y en GPU es prácticamente instantánea para secuencias de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cero-base-es | 35,7 M | 512 | MIT | Hugging Face (Jhonic/cero-base-es) | Entrenado desde cero en español; requiere el paquete `cero` |
| cero-mini-es | 15,7 M | no disponible | no disponible | Hugging Face (Jhonic/cero-mini-es) | Misma familia, menor tamaño |
| cero-micro-es | 5,8 M | no disponible | no disponible | Hugging Face (Jhonic/cero-micro-es) | Misma familia, menor tamaño |
| cero-nano-es | 0,9 M | no disponible | no disponible | Hugging Face (Jhonic/cero-nano-es) | Misma familia, entrenado con cuentos sintéticos |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: entrenado exclusivamente con cuentos infantiles traducidos automáticamente; no responde con fiabilidad a preguntas factuales, matemáticas complejas ni razonamiento general.
- Contexto de 512 tokens: insuficiente para documentos largos, conversaciones extensas o código.
- Riesgo alto de alucinación fuera de dominio: el modelo tiende a inventar narrativa aunque la pregunta sea factual; el SFT mitiga parcialmente esto con respuestas de "no lo sé", pero no lo elimina.
- Bucles de repetición con decodificación voraz (temperatura 0): el propio autor lo documenta como rasgo clásico; en producción habría que usar temperatura 0,7 o penalización por repetición.
- Sesgos heredados del corpus: los cuentos de TinyStories presentan personajes y roles estereotipados; la traducción automática puede introducir artefactos lingüísticos y calcos del inglés.
- Licencia MIT en los pesos, pero el dataset de entrenamiento (TinyStories español) tiene licencia CDLA-Sharing-1.0, lo que conviene revisar si se redistribuye el modelo con fines comerciales.
- No compatible con el ecosistema `transformers`: la integración requiere el paquete `cero` del repositorio del autor, lo que limita su uso en pipelines estándar (vLLM, TGI, Ollama).
- Sin garantías de calidad para uso comercial o en producción: el autor lo define explícitamente como herramienta docente, no como asistente.
- Idiomas: solo español; no se ha evaluado su comportamiento en otras lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jhonic/cero-base-es
- Repositorio del proyecto: https://github.com/jceronch1/Crear-LLM-desde-cero
- Dataset TinyStories en español: https://huggingface.co/datasets/ffuuugor/tinystories_spanish
- Modelo hermano cero-nano-es: https://huggingface.co/Jhonic/cero-nano-es
- Modelo hermano cero-micro-es: https://huggingface.co/Jhonic/cero-micro-es
- Modelo hermano cero-mini-es: https://huggingface.co/Jhonic/cero-mini-es
