# Jhonic/cero-mini-es

## Resumen

cero-mini-es es un modelo de lenguaje de 15,7 millones de parámetros entrenado desde cero en español por Jhonic (jceronch1) como parte del proyecto docente "Crear un LLM desde cero". No es un asistente de propósito general: es una herramienta educativa que permite ver, reproducir y entender cada etapa del entrenamiento de un transformer, desde la tokenización hasta el ajuste fino supervisado para conversación. Se publica en dos variantes: `base/`, que continúa texto, y `chat/`, que mantiene conversaciones multi-turno sencillas.

El modelo emplea una arquitectura transformer decodificadora "moderna" (RoPE, RMSNorm pre-normalización, SwiGLU, embeddings compartidos y sin sesgos) con 8 bloques, 6 cabezas, ancho 384 y una ventana de contexto de solo 256 tokens. Se entrenó sobre la traducción automática de TinyStories al español (126.996 cuentos, 30,1 M de tokens) y se ajustó con 60.000 conversaciones sintéticas generadas por reglas. Todo el entrenamiento cupo en una RTX 4070 de portátil (8 GB) en 18 minutos en bf16.

Su relevancia es pedagógica: demuestra que es posible reproducir el ciclo completo de un LLM (tokenizador BPE propio, preentrenamiento, SFT y chatbot) en hardware de consumo y con un corpus abierto. No compite con modelos de producción: su utilidad es servir de referencia didáctica, banco de pruebas y ejemplo reproducible para quien quiera construir su propio modelo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador: RoPE, RMSNorm pre-normalización, SwiGLU, embeddings de entrada/salida compartidos, sin sesgos |
| Parametros totales | 15.735.168 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), configuración en `config.json`, tokenizador en `tokenizador.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador denso de 8 bloques con 6 cabezas de atención, dimensión de modelo 384 y contexto de 256 tokens. Incorpora las decisiones de diseño habituales en LLMs modernos: RoPE para codificar posiciones, RMSNorm aplicado antes de cada subcapa, activación SwiGLU en el bloque feed-forward, pesos de embedding de entrada y salida compartidos y eliminación de términos de sesgo. El tokenizador es un BPE a nivel de bytes entrenado desde cero sobre el propio corpus, con vocabulario de 4.096 tokens (incluidos cuatro especiales: `<|inicio|>`, `<|usuario|>`, `<|asistente|>` y `<|fin|>`) y una ratio media de 3,88 caracteres por token.

El preentrenamiento usó TinyStories en español (traducción automática del dataset original, licencia CDLA-Sharing-1.0): 126.996 cuentos, 30,1 M de tokens, con 2.578 cuentos reservados para validación. Se ejecutaron 5.000 pasos de 64 secuencias de 256 tokens (81,9 M de tokens en total) con AdamW, tasa de aprendizaje 0,0015 con calentamiento y decaimiento coseno. El ajuste fino supervisado (SFT) empleó 60.000 conversaciones fabricadas por reglas a partir de los cuentos (pedir cuentos, continuar cuentos, sumas pequeñas, charla y respuestas de "no lo sé"), con pérdida calculada solo sobre los turnos del asistente, 1.500 pasos de 64 y tasa 0,0003. Todo el entrenamiento se realizó en una GPU RTX 4070 de portátil (8 GB) en precisión mixta bfloat16 en 18 minutos.

## Capacidades

- Generación de texto en español: continuación de relatos breves y cuentos infantiles con coherencia local.
- Chat conversacional básico: responde a saludos, peticiones de cuentos y preguntas simples dentro de su dominio.
- Continuación de cuentos: dado un inicio, prosigue la narración con estilo infantil.
- Aritmética muy elemental: sumas pequeñas incluidas en el conjunto de SFT.
- Reconocimiento de límites: responde "no lo sé" ante preguntas fuera de su dominio (por ejemplo, capitales de países).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo español.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo y su código permiten recorrer paso a paso atención, RoPE, RMSNorm y SwiGLU en un tamaño manejable, ejecutable en CPU.
- Reproducción de un pipeline completo de LLM: sirve como referencia para replicar tokenización BPE, preentrenamiento y SFT en hardware de consumo (`cero todo --receta mini`).
- Laboratorio de interpretabilidad: con 8 bloques y 15,7 M de parámetros es viable inspeccionar activaciones, atención y embeddings sin infraestructura especial.
- Generación de cuentos infantiles en español: útil para prototipos de aplicaciones de narración breve o para generar datos sintéticos de dominio acotado.
- Chatbot de demostración educativa: permite mostrar en clase cómo un SFT transforma un modelo base en un asistente conversacional rudimentario.
- Banco de pruebas de técnicas de decodificación: su tendencia a entrar en bucle con decodificación voraz lo convierte en un caso de estudio práctico sobre temperatura, top-k y penalización por repetición.
- Base para experimentos de ajuste fino: al ser pequeño y con licencia MIT, se puede reentrenar o adaptar a otros corpus de cuentos en español con recursos mínimos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perdida en validacion (modelo base) | 1,687 |
| Perplejidad en validacion (modelo base) | 5,40 |
| Precision (metrica reportada) | 0,627 (la model card corta el dato; no se especifica la metrica completa) |
| Perdida de referencia sin entrenar | ln(4.096) = 8,32 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (15,7 M de parámetros, ~63 MB de pesos); en bf16, ~32 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento original se realizó en una RTX 4070 de portátil (8 GB).
- Cabe en cualquier GPU de consumo e incluso en CPU; el modelo se ejecuta sin GPU (`modelo.to("cuda")` es opcional).
- Opciones de despliegue: no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI; requiere el paquete `cero` del repositorio del proyecto y `safetensors`/`huggingface_hub` para la descarga.
- Latencia y throughput: no disponibles; por el tamaño, la inferencia en CPU es viable para demostraciones interactivas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cero-mini-es | 15,7 M | 256 | Desde cero, TinyStories ES, SFT sintético | MIT | Hugging Face (repo propio, requiere paquete `cero`) |
| cero-base-es (misma familia) | 35,7 M | no disponible | Misma receta, mayor tamaño | MIT | Hugging Face |
| cero-micro-es (misma familia) | 5,8 M | no disponible | Misma receta, menor tamaño | MIT | Hugging Face |
| cero-nano-es (misma familia) | 0,9 M | no disponible | Cuentos sintéticos | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: su dominio se limita a cuentos infantiles, charla trivial y sumas pequeñas; fuera de ahí responde "no lo sé" o divaga.
- Ventana de contexto muy corta (256 tokens), insuficiente para conversaciones largas o documentos.
- Tendencia a la repetición en bucle con decodificación voraz (temperatura 0); se mitiga parcialmente con temperatura 0,7.
- Riesgo elevado de alucinación y de incoherencia a medida que la generación se aleja del estilo de TinyStories.
- Sesgos heredados del corpus: TinyStories en español es una traducción automática, por lo que puede contener artefactos de traducción y sesgos propios del dataset original.
- Entrenamiento limitado (81,9 M de tokens en preentrenamiento): no ha visto suficiente texto para generalizar más allá de su dominio.
- Licencia MIT: permite uso comercial, pero el modelo no está pensado ni validado para producción; el dataset de origen (CDLA-Sharing-1.0) impone condiciones propias sobre los datos.
- No es compatible con el ecosistema `transformers` estándar: requiere el paquete `cero` del repositorio, lo que limita su integración en pipelines convencionales.
- El dato de precisión (0,627) aparece truncado en la model card; no se debe citar sin verificar la métrica completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jhonic/cero-mini-es
- Repositorio del proyecto: https://github.com/jceronch1/Crear-LLM-desde-cero
- Dataset TinyStories en español: https://huggingface.co/datasets/ffuuugor/tinystories_spanish
- Modelo hermano cero-nano-es: https://huggingface.co/Jhonic/cero-nano-es
- Modelo hermano cero-micro-es: https://huggingface.co/Jhonic/cero-micro-es
- Modelo hermano cero-base-es: https://huggingface.co/Jhonic/cero-base-es
