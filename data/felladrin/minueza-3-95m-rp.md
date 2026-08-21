# Felladrin/Minueza-3-95M-RP

## Resumen

Minueza-3-95M-RP es un modelo de lenguaje pequeño, de 94,7 millones de parámetros, desarrollado por Felladrin (Victor Nogueira) como demostración de lo que se puede conseguir con un modelo entrenado desde cero exclusivamente para roleplay. Parte del modelo base Minueza-3-95M-Base y se somete a dos etapas adicionales de entrenamiento: un preentrenamiento continuado con transcripciones de roleplay y ficción, y un ajuste fino supervisado en formato ChatML con una persona en el mensaje de sistema. El resultado es un modelo capaz de escribir prosa fluida en personaje durante uno o dos turnos, pero con una continuidad que se degrada rápidamente en conversaciones largas.

El modelo se distribuye únicamente en formato GGUF, ya que ese fue el único formato de pesos utilizado durante el entrenamiento, y está pensado para ocupar el hueco del "modelo de roleplay más pequeño utilizable": corre en CPU, en una pestaña del navegador o en un teléfono. No compite con modelos de 7B o superiores, y su autor es explícito sobre sus limitaciones: no recuerda lo que se le dijo hace tres turnos, inventa hechos libremente y no distingue personajes con la fiabilidad de un modelo diez veces mayor. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3 (según etiquetas del repositorio) |
| Parametros totales | 94.732.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según comandos de ejemplo) |
| Tipos de cuantizacion | GGUF (se menciona Q8_0; otros no disponibles) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (único formato utilizado en entrenamiento e inferencia) |

## Arquitectura y entrenamiento

La arquitectura se basa en Gemma3, según las etiquetas del repositorio, aunque no se proporcionan detalles estructurales adicionales (número de capas, dimensiones, atención, etc.). El entrenamiento se realizó en tres etapas, todas en precisión f32, sobre una APU AMD Strix Halo mediante el backend WebGPU de la herramienta gguf-trainer, sin usar PyTorch en ningún punto del proceso. La primera etapa es el preentrenamiento del modelo base (1.950 millones de tokens, cuyos detalles se remiten a la ficha del modelo base). La segunda etapa es un preentrenamiento continuado con un corpus de 123,4 millones de tokens en formato de transcripción cruda (persona más diálogo), compuesto por PIPPA deduplicado (45,6M tokens, 37%), ficción de writingprompts detokenizada (48,6M, 39%) y una rebanada de replay de fineweb-edu para limitar el olvido (29,2M, 24%). La tercera etapa es un ajuste fino supervisado en formato ChatML con pérdida solo en las respuestas del asistente, sobre un corpus de 18,3 millones de tokens (16.093 conversaciones, de las cuales 7.093 son registros de PIPPA reestructurados para que la persona del personaje sea el mensaje de sistema), viendo 9 millones de tokens (0,5 épocas). El tokenizador es idéntico al del modelo base (32.768 entradas) y el token de fin de secuencia se cambió a `<|im_end|>` (id 32759) para detener la generación en los límites de turno.

## Capacidades

- Generación de texto narrativo y prosa en personaje para roleplay, con fluidez durante uno o dos turnos.
- Continuación de historias a partir de un prompt con formato de transcripción (persona más diálogo).
- Modo chat con plantilla ChatML incrustada en el GGUF, que se activa con `--jinja` en llama.cpp.
- Modo de completado en bruto, compatible con clientes como KoboldCpp y AI Horde.
- Condicionamiento por persona en el mensaje de sistema (p. ej., "You are Iris, a cheerful librarian...").
- Capacidad multilingüe: no disponible (solo se declara inglés).
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no disponibles.

## Casos de uso

- Roleplay corto en CPU o dispositivos de bajos recursos: el modelo puede mantener un personaje durante unos pocos turnos de conversación, lo que lo hace adecuado para demos, prototipos o entornos sin GPU. Se ejecuta con llama.cpp en CPU, en navegador o en teléfono.
- Continuación de historias breves: dado un fragmento de ficción y una persona, el modelo genera continuación coherente durante un turno o dos, útil para juegos de escritura o generación de ideas.
- Ejemplo didáctico de fine-tuning con gguf-trainer: el autor lo presenta como un caso de trabajo de ajuste de un modelo base con pesos GGUF de principio a fin, sin PyTorch, sobre hardware de consumo (APU AMD). Sirve como referencia para quien quiera replicar el flujo.
- Pruebas de plantillas de chat y formatos de prompt: al tener la plantilla ChatML incrustada, se puede usar para validar integraciones de llama.cpp, KoboldCpp u otros clientes que soporten GGUF.
- Experimentación con parámetros de muestreo: el autor documenta una barrido de 14 presets y recomienda configuraciones específicas (DRY, min-p, etc.), por lo que el modelo es útil para estudiar el efecto del muestreo en modelos pequeños.
- Generación de diálogos de personajes para juegos de texto o prototipos de narrativa interactiva, donde se necesite una respuesta rápida y ligera sin requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos estándar, y advierte explícitamente que el modelo es "confiadamente incorrecto sobre casi todo" en preguntas factuales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 95M parámetros en GGUF Q8_0, el peso ocupa aproximadamente 95 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en memoria RAM de un sistema sin GPU.
- GPU recomendadas: no se requiere GPU dedicada; el autor entrenó en una APU AMD Strix Halo con backend WebGPU. Para inferencia, cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer (RTX 3060, 4060, etc.) lo ejecuta sin problemas, y también iGPU o APU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-completion), KoboldCpp, AI Horde, y cualquier cliente que soporte GGUF con plantilla Jinja. También se puede ejecutar en navegador vía WebGPU.
- Latencia y throughput: no se proporcionan datos numéricos, pero al ser un modelo de 95M parámetros, la generación es de decenas de tokens por segundo incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de roleplay de tamaño similar. El autor menciona que no compite con modelos de 7B y superiores, y que su objetivo es ocupar el hueco del "modelo de roleplay más pequeño utilizable". Como referencia, el modelo base Minueza-3-95M-Base comparte arquitectura y tokenizador, pero sin el entrenamiento específico de roleplay. No se han encontrado datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Continuidad limitada: la coherencia se degrada en pocos turnos y no se recupera; no es adecuado para sesiones largas.
- Alucinación severa: el modelo inventa hechos libremente y es "confiadamente incorrecto sobre casi todo"; no debe usarse para preguntas factuales ni para nada donde un error tenga coste.
- Confusión de personajes: no distingue un personaje de otro con la fiabilidad de modelos diez veces mayores.
- Control de repetición obligatorio: el autor advierte que "alguna forma de control de repetición no es opcional a este tamaño"; se recomienda usar DRY o top-k con penalización de repetición.
- Idioma: solo se declara inglés; no hay evidencia de capacidades multilingües.
- Formato de pesos: solo GGUF, lo que limita su uso en frameworks que no soporten este formato (aunque es el estándar en llama.cpp y derivados).
- Contenido para adultos: el modelo está etiquetado como "not-for-all-audiences" y se entrenó con datasets de roleplay que pueden incluir contenido explícito; debe usarse con moderación de contenido en producción.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Felladrin/Minueza-3-95M-RP
- Modelo base: https://huggingface.co/Felladrin/Minueza-3-95M-Base
- Herramienta de entrenamiento gguf-trainer: https://github.com/felladrin/gguf-trainer
- Notas de optimización de muestreo: https://github.com/felladrin/gguf-trainer/blob/main/docs/optimization.md#13-tightening-the-sampler-makes-a-95m-model-worse-not-better-2026-08-20
- Perfil del autor en HuggingFace: https://huggingface.co/Felladrin
- Perfil del autor en GitHub: https://github.com/felladrin
