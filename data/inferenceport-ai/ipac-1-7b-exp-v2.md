# inferenceport-ai/ipac-1.7b-exp-v2

## Resumen

IPAC-1.7B-Exp-v2 (InferencePort AutoComplete 1.7B Exp v2) es un modelo de lenguaje de 1.728.801.536 parámetros desarrollado por InferencePort AI como un ajuste fino del modelo base LiquidAI/LFM3-1.7B. Está especializado en autocompletado de texto de baja latencia y continuación de siguiente token, es decir, en generar sugerencias de texto a partir de un prefijo sin formato conversacional. Se trata de un checkpoint experimental (etiquetado `exp-v2`) pensado como línea base de investigación interna antes de entrenamientos a mayor escala.

El modelo hereda la arquitectura híbrida de convolución y atención de LFM3-1.7B de Liquid AI, lo que permite una inferencia eficiente en hardware modesto. A diferencia de los sistemas orquestadores híbridos de InferencePort (IPAI-3), los modelos IPAC son pesos de red neuronal independientes destinados a completado de texto directo, no a razonamiento multi-paso ni a diálogo.

Su relevancia actual es limitada y acotada: se publica como material de investigación y benchmarking offline para prototipado de autocompletado en línea (estilo ghost-text) en hardware de borde o servidor. No está pensado para SLA de producción ni para uso comercial, dado que su licencia es explícitamente no comercial. El modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de convolución y atención (LFM3, `lfm3`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (IPAC-NC-1.7-1.0, no comercial, sobre LFM Open License v1.0) |
| Formato de pesos | safetensors |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Tamano del repo | 3,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM3-1.7B de Liquid AI, una arquitectura híbrida que combina capas de convolución con capas de atención. La implementación incluye módulos personalizados (`modeling_lfm3.py`, `lfm3_conv.py`) que obligan a cargar el modelo con `trust_remote_code=True` en `transformers`. Los pesos publicados son fusionados (merged) en BF16.

El ajuste fino se orienta a continuación de prefijo en bruto (raw prefix continuation) en lugar de diálogo multi-turno, y la model card indica explícitamente que no debe aplicarse una plantilla de chat conversacional. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el checkpoint `exp-v2` muestra mejoras iniciales de perplejidad y precisión sobre el base LFM3-1.7B, pero la tabla de evaluación publicada deja las columnas del modelo ajustado y los deltas sin valores.

## Capacidades

- Generación de texto por continuación de prefijo (next-token continuation), orientada a autocompletado en línea.
- Sugerencias de tipo ghost-text con decodificación greedy para resultados deterministas.
- Completado de fragmentos cortos: la configuración recomendada es de 8 a 24 tokens nuevos por ráfaga de tecleo.
- Soporte de parada configurable por salto de línea o puntuación final (`.`, `?`, `!`) según la interfaz.
- Capacidades multilingües: solo inglés declarado.
- No soporta tool calling ni function calling según la información disponible.
- No está diseñado para agentes, razonamiento multi-paso ni preguntas y respuestas conversacionales.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Autocompletado en editores de código y texto: el modelo recibe el prefijo actual y devuelve de 8 a 24 tokens de continuación con decodificación greedy, lo que encaja con sugerencias inline de baja latencia en IDE o procesadores de texto.
- Prototipado de asistentes de escritura en formularios: completar campos como URLs, rutas de configuración o descripciones breves a partir de un prefijo parcial, aprovechando la naturaleza de continuación directa sin plantilla de chat.
- Benchmarking offline de latencia y perplejidad: servir como línea base experimental para comparar estrategias de autocompletado frente al LFM3-1.7B sin ajustar en una partición de validación interna.
- Investigación sobre decodificación determinista: evaluar el efecto de la decodificación greedy y de las secuencias de parada en la calidad de las sugerencias cortas en distintas superficies de UI.
- Despliegue en hardware de borde para demostraciones: al ser un modelo de 1,7B en BF16, puede ejecutarse en GPUs de consumo para pruebas de concepto de autocompletado local sin conexión.
- Evaluación educativa de ajuste fino sobre arquitecturas híbridas: estudiar cómo un ajuste específico de tarea modifica el comportamiento de un modelo base con capas de convolución y atención combinadas.
- Generación de texto corto no conversacional en pipelines de prueba: completar plantillas o cadenas técnicas en entornos de test donde no se requiere exactitud factual estricta.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación frente al checkpoint base LFM3-1.7B en una partición interna de validación de autocompletado, pero solo la columna del modelo base contiene valores; las del modelo ajustado y los deltas están sin rellenar.

| Metrica | Base (LFM3-1.7B) | IPAC-1.7B-Exp-v2 | Delta |
|---|---|---|---|
| Perplejidad (menor es mejor) | 11,306 | no disponible | no disponible |
| Top-1 accuracy (mayor es mejor) | 48,57% | no disponible | no disponible |
| Top-5 accuracy (mayor es mejor) | 73,37% | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5 GB solo para pesos, más memoria para activaciones y caché; en la práctica, unos 4-6 GB según la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes con holgura.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en BF16; con cuantización a 8 bits o 4 bits (no publicada oficialmente) cabría en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible, y la presencia de código personalizado (`modeling_lfm3.py`, `lfm3_conv.py`) puede complicar su soporte en motores de inferencia alternativos.
- Latencia y throughput: no disponibles; la model card solo indica que el modelo está orientado a baja latencia y recomienda ráfagas de 8 a 24 tokens por pulsación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IPAC-1.7B-Exp-v2 | 1,73B | no disponible | Autocompletado experimental | No comercial (IPAC-NC-1.7-1.0) | Hugging Face |
| LiquidAI/LFM3-1.7B | ~1,7B | no disponible | Modelo base híbrido convolución/atención | LFM Open License v1.0 | Hugging Face |
| Modelos de autocompletado tipo FIM de 1-3B | no disponible | no disponible | Relleno de código/texto | variable | no disponible |

La comparación con alternativas específicas de autocompletado no está disponible en la información proporcionada. El competidor directo más claro es el propio modelo base LFM3-1.7B, del que este checkpoint deriva y frente al cual la model card afirma mejoras iniciales de perplejidad y precisión, aunque sin publicar los valores.

## Limitaciones y advertencias

- Checkpoint experimental (`exp-v2`): la propia model card lo describe como línea base de investigación no apta para SLA de producción.
- No es un asistente conversacional: no debe usarse para seguir instrucciones, razonar ni responder preguntas; está entrenado para continuación de prefijo en bruto.
- Riesgo de alucinación: como todo modelo compacto, puede generar contenido factualmente incorrecto; las salidas deben presentarse siempre como sugerencias que el usuario acepta o descarta.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto: la longitud máxima de contexto no está documentada, lo que dificulta planificar su integración en editores con documentos largos.
- Licencia restrictiva: la IPAC-NC-1.7-1.0 prohíbe explícitamente el uso comercial, incluida la exposición como API alojada, la integración en productos SaaS o flujos de negocio con ingresos, y el entrenamiento de modelos competidores con sus salidas; requiere además cumplir la LFM Open License v1.0 y mantener la atribución a InferencePort AI y Liquid AI.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en entornos controlados.
- Adopción muy baja: 43 descargas y 0 likes en el momento de la consulta, sin validación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inferenceport-ai/ipac-1.7b-exp-v2
- Plataforma de InferencePort AI: https://inferenceport.ai
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Liquid AI: https://www.liquid.ai
