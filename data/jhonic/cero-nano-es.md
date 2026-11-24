# Jhonic/cero-nano-es

## Resumen

cero-nano-es es un modelo de lenguaje de 922.752 parámetros entrenado desde cero en español por el desarrollador Jhonic, concebido como herramienta docente para el proyecto "Crear un LLM desde cero". No pretende competir con asistentes de propósito general: su objetivo es servir de material didáctico reproducible, con el motor en PyTorch, un curso asociado y un laboratorio para inspeccionar el modelo por dentro. Se distribuye en dos variantes: un modelo base que continúa texto y un chatbot resultante de un ajuste fino supervisado (SFT) sobre ese modelo base.

La arquitectura es un transformer decodificador "moderno" de 4 bloques, 4 cabezas de atención, ancho 128 y contexto de 256 tokens, con RoPE, RMSNorm pre-normalización, SwiGLU, pesos de entrada y salida compartidos y ausencia de sesgos. El tokenizador es un BPE a nivel de bytes entrenado desde cero sobre el propio corpus, con un vocabulario de 1.024 tokens.

Su relevancia es educativa y de reproducibilidad: el entrenamiento completo cabe en 72 segundos en una GPU de portátil (RTX 4070) en bfloat16, o unos 6 minutos en CPU, y puede regenerarse exactamente con el comando `cero todo --receta nano`. No es un modelo apto para producción ni para tareas fuera de su mundo sintético de cuentos infantiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (RoPE, RMSNorm pre-normalización, SwiGLU, embedding compartido, sin sesgos) |
| Parametros totales | 922.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16 según entrenamiento; el autor no documenta cuantizaciones) |
| Idiomas soportados | Español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `tokenizador.json` por carpeta |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador con 4 bloques, 4 cabezas de atención, dimensión de modelo 128 y ventana de contexto de 256 tokens. Incorpora innovaciones habituales en LLMs modernos a escala didáctica: rotary positional embeddings (RoPE), RMSNorm aplicada antes de cada subcapa, activación SwiGLU, pesos de entrada y salida compartidos y eliminación de términos de sesgo. El tokenizador es un BPE a nivel de bytes entrenado desde cero con el corpus, con 1.024 tokens (764 fusiones, 256 bytes y 4 tokens especiales: `<|inicio|>`, `<|usuario|>`, `<|asistente|>`, `<|fin|>`).

El preentrenamiento del modelo base usó 40.000 cuentos infantiles sintéticos en español generados por reglas (4,4 M de tokens, con un 2 % reservado para validación), durante 1.500 pasos de 8 secuencias de 256 tokens (3,1 M de tokens) con AdamW, tasa de aprendizaje 0,003, calentamiento y decaimiento coseno. El ajuste para chat (SFT) empleó 40.000 conversaciones fabricadas a partir del mismo mundo sintético (peticiones de cuentos, preguntas sobre ellos, sumas pequeñas, charla y respuestas de "no lo sé"), con pérdida calculada solo sobre los turnos del asistente, durante 2.000 pasos de tamaño de lote 16 y tasa 0,001. El entrenamiento completo se realizó en una RTX 4070 de portátil en precisión mixta bfloat16 en 72 segundos totales.

## Capacidades

- Generación de texto en español dentro de un dominio acotado: continuación de cuentos infantiles sintéticos.
- Conversación multi-turno breve mediante la variante `chat` (SFT), con cierre autónomo del turno mediante el token `<|fin|>`.
- Copia de nombres y entidades del contexto: la atención le permite reproducir nombres nunca vistos en el entrenamiento si aparecen en el prompt.
- Resolución de sumas pequeñas (0 a 10) vistas durante el entrenamiento (memorizadas, no razonadas).
- Respuesta de "no lo sé" ante preguntas fuera de su mundo en la mayoría de casos evaluados.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe inexistente: solo español.
- No es compatible con la librería `transformers`; requiere el paquete propio `cero` del proyecto.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo permite recorrer paso a paso el pipeline completo (tokenización BPE, atención con RoPE, SwiGLU, RMSNorm, entrenamiento y evaluación) con un coste computacional mínimo y resultados reproducibles.
- Laboratorio de interpretabilidad: al ser diminuto y de código abierto, se puede inspeccionar la atención, los embeddings y las activaciones capa por capa para explicar conceptos como copia de contexto o memorización.
- Prácticas de ajuste fino supervisado (SFT): el par base/chat sirve para demostrar cómo un SFT cambia el comportamiento de un modelo base y cómo se enmascara la pérdida en los turnos del usuario.
- Experimentos de tokenización: permite entrenar y comparar tokenizadores BPE a nivel de bytes sobre un corpus controlado y observar el impacto en la perplejidad.
- Reproducción de recetas de entrenamiento: con `cero todo --receta nano` se puede replicar el entrenamiento completo en CPU en unos 6 minutos, útil en aulas sin GPU.
- Demostración de límites de los LLM: las pruebas de sumas no vistas, nombres con letras raras o preguntas fuera de dominio ejemplifican memorización frente a razonamiento y alucinación controlada.
- Prototipado de chatbots de dominio cerrado: sirve como esqueleto mínimo para entender los tokens especiales de rol y el formateo de conversaciones antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación del modelo base sobre cuentos de validación no vistos durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida (validación) | 0,418 |
| Perplejidad | 1,52 |
| Bits por carácter | 0,176 |
| Pérdida de referencia (modelo sin entrenar) | ln(1024) = 6,93 |

Evaluación del chatbot con generación determinista (temperatura 0), según el autor:

| Prueba | Aciertos |
|---|---|
| Cuento sobre el personaje pedido | 25/25 |
| Cuento con el nombre pedido (nombre conocido) | 25/25 |
| Cuento con nombre nunca visto, de sílabas corrientes | 25/25 |
| Cuento con nombre nunca visto y letras raras | 0/25 |
| Responder sobre un cuento dado (nombres conocidos) | 16/25 |
| Responder sobre un cuento dado (nombres nunca vistos) | 20/25 |
| Sumas de 0 a 10 vistas al entrenar | 22/25 |
| Sumas nunca vistas | 4/17 |
| Decir "no lo sé" a preguntas nuevas fuera de su mundo | 9/10 |
| Termina solo su turno (`<|fin|>`) | 199/202 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable; los pesos ocupan unos pocos megabytes (922.752 parámetros).
- GPU recomendadas: cualquiera; el autor entrenó en una NVIDIA RTX 4070 de portátil en bfloat16. Para inferencia basta CPU.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en Raspberry Pi.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa una arquitectura propia implementada en el paquete `cero` sobre PyTorch. El despliegue se realiza cargando pesos con `safetensors.torch.load_model` y el módulo `cero.modelo.GPT`.
- Latencia y throughput: no disponibles de forma explícita; el entrenamiento completo tarda 72 segundos en GPU y unos 6 minutos en CPU, lo que da una idea del orden de magnitud del coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| cero-nano-es | 922.752 | 256 | es | MIT | Docente, desde cero, dominio sintético |
| Karpathy nanoGPT | ~10-124 M (según config) | configurable | en (por defecto) | MIT | Docente, desde cero, inglés |
| SmolLM-135M | 135 M | 2.048 | en (principalmente) | Apache 2.0 | Modelo pequeño de propósito general |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingüe | Apache 2.0 | Modelo pequeño de propósito general |

La comparación es orientativa: cero-nano-es es dos o tres órdenes de magnitud menor que los modelos pequeños de propósito general y no compite en capacidades, sino en transparencia y reproducibilidad didáctica. No se dispone de benchmarks comunes para comparar rendimiento directamente.

## Limitaciones y advertencias

- Solo conoce un mundo de cuentos sintéticos: unos 40 tipos de animales y personajes, 80 nombres fijos más nombres inventados, 14 lugares y 8 tramas. Fuera de ese dominio no sabe nada.
- No razona ni calcula de forma generalizable: las sumas vistas se memorizan y las no vistas fallan mayoritariamente (4/17).
- Ventana de contexto de 256 tokens: en conversaciones largas olvida el inicio.
- Las conversaciones de SFT se generaron con reglas, no las escribieron personas, y no hubo RLHF ni DPO; el modelo puede reproducir patrones artificiales del generador.
- Riesgo de alucinación controlado por el "no lo sé" (9/10), pero no es un sistema fiable para información factual.
- Sesgos: no documentados por el autor; al entrenarse sobre cuentos sintéticos generados por reglas, hereda los sesgos de esas reglas (roles, nombres y tramas estereotipadas).
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para producción por su tamaño y dominio.
- No es compatible con `transformers`; requiere el paquete `cero` y su entorno virtual, lo que limita la integración con herramientas estándar.
- Repositorio de 0.0 GB y sin descargas ni likes en el momento de la consulta: no hay comunidad ni soporte externo.

## Enlaces

- Hugging Face: https://huggingface.co/Jhonic/cero-nano-es
- Repositorio del proyecto: https://github.com/jceronch1/Crear-LLM-desde-cero
- Carpeta del modelo base: https://huggingface.co/Jhonic/cero-nano-es/tree/main/base
- Carpeta del chatbot: https://huggingface.co/Jhonic/cero-nano-es/tree/main/chat
