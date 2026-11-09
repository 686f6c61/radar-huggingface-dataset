# Lucasgitguy-co/K2-Horizon-0.9B-System1-GGUF

## Resumen
K2-Horizon-0.9B-System1-GGUF es la distribucion en formato GGUF del modelo K2-Horizon-0.9B-System1, un ajuste fino (fine-tune) del modelo base IFM/K2-Horizon-0.9B. El autor del repositorio es Lucasgitguy-co y la conversión a GGUF se ha realizado con el script `convert_hf_to_gguf.py` de llama.cpp en noviembre de 2026. El modelo base System1 es una variante "no-thinking" del K2-Horizon original: responde de forma directa en lugar de generar primero un bloque de razonamiento largo, lo que reduce la latencia de primera respuesta y el consumo de tokens de salida.

El modelo cuenta con 1.078.285.824 parámetros totales (aproximadamente 1,08 mil millones) y está pensado para generación de texto conversacional en entornos con recursos limitados. Su empaquetado GGUF permite ejecutarlo en llama.cpp y llama-server, y el repositorio ocupa 1,8 GB, con dos cuantizaciones publicadas: Q8_0 (1,15 GB) y Q4_K_M (0,67 GB). La licencia es Apache-2.0, lo que facilita su uso comercial.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y desplegable en hardware de consumo para tareas de conversación y generación de texto, con una plantilla de chat embebida que funciona por defecto en modo sin razonamiento (no-think). No se dispone de información publicada sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama con pre-tokenizador `k2-horizon` y YaRN RoPE (factor 16, beta 128/4) |
| Parametros totales | 1.078.285.824 (aprox. 1,08B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K original; con YaRN factor 16, contexto extendido (valor máximo no especificado) |
| Tipos de cuantizacion | Q8_0, Q4_K_M (publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo base IFM/K2-Horizon-0.9B es un transformer de aproximadamente 1B de parámetros con arquitectura tipo llama. La variante System1 es un fine-tune que elimina el modo de razonamiento extendido: en lugar de generar un bloque de pensamiento (think block) antes de la respuesta, produce la respuesta directamente. El formato GGUF utiliza el pre-tokenizador `k2-horizon` y codificación posicional YaRN RoPE con factor 16 y parámetros beta 128/4, partiendo de un contexto original de 8K tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card del repositorio GGUF indica que los detalles de método, resultados y limitaciones están en la tarjeta del modelo principal, pero esos datos no se han proporcionado en la información disponible. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp y se verificó que las respuestas greedy a 5 prompts de prueba coinciden con el modelo en bf16 y que la generación se detiene en el token de fin de turno.

## Capacidades
- Generación de texto conversacional en modo directo (sin bloque de razonamiento previo).
- Plantilla de chat embebida, configurada por defecto en modo no-think.
- Soporte de conversación multi-turno mediante el token de fin de turno `<|ifm|im_end|>`.
- Compatible con llama.cpp y llama-server para inferencia local.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se ha documentado soporte de visión, audio ni otras modalidades.

## Casos de uso
- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno gracias a su plantilla de chat embebida y al token de fin de turno, con un contexto de 8K tokens que cubre conversaciones de longitud moderada.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (0,67 GB) puede ejecutarse en equipos con poca VRAM o incluso en CPU mediante llama.cpp, lo que lo hace adecuado para prototipos y aplicaciones de escritorio.
- Generación de respuestas rápidas en aplicaciones de chat: al ser un fine-tune System1 sin bloque de pensamiento, reduce la latencia y el número de tokens generados por respuesta, lo que es útil en interfaces que requieren respuestas inmediatas.
- Pruebas y evaluación de pipelines de inferencia: su pequeño tamaño y su compatibilidad con llama-server permiten usarlo como modelo de referencia en pruebas de integración de servicios de generación de texto.
- Educación y experimentación: investigadores y desarrolladores pueden estudiar el efecto de eliminar el modo de razonamiento en un modelo de 1B, comparando su comportamiento con el modelo base K2-Horizon.
- Generación de texto en entornos con restricciones de licencia: al estar bajo Apache-2.0, puede integrarse en productos comerciales sin las restricciones de licencias más restrictivas.
- Tareas de autocompletado y generación de texto corto: su ventana de 8K tokens y su modo de respuesta directa encajan en aplicaciones de redacción asistida o generación de borradores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 0,67 GB de pesos, más overhead de contexto y runtime (estimación típica de 1-2 GB en total); Q8_0 requiere aproximadamente 1,15 GB de pesos, más overhead (estimación típica de 1,5-2,5 GB en total).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar las cuantizaciones publicadas; no se dispone de datos específicos de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y cualquier runtime compatible con GGUF; no se ha documentado compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-0.9B-System1-GGUF | 1,08B | 8K (extensible con YaRN) | Apache-2.0 | GGUF | Hugging Face |
| IFM/K2-Horizon-0.9B | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| IFM/K2-Horizon-0.9B-GGUF | no disponible | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Las alternativas de otros autores con el mismo tamaño no se han identificado en la búsqueda web realizada.

## Limitaciones y advertencias
- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación: no evaluado en la información disponible; como modelo de 1B, es esperable una mayor propensión a errores factuales, pero no hay datos que lo confirmen.
- Limitaciones de contexto: el contexto original es de 8K tokens; la extensión mediante YaRN factor 16 no especifica el máximo efectivo, por lo que no se garantiza un rendimiento óptimo más allá de 8K.
- Limitaciones de idioma: no se han documentado los idiomas soportados, por lo que no se puede asegurar un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base IFM/K2-Horizon-0.9B, cuya licencia no se ha proporcionado.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación comunitaria ni de mantenimiento continuo.
- El modelo está diseñado para modo no-think; no se debe esperar razonamiento extendido ni cadenas de pensamiento largas.
- No se ha documentado soporte de tool calling, agentes ni multimodalidad, lo que limita su uso en pipelines complejos.

## Enlaces
- Repositorio GGUF: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1-GGUF
- Modelo base System1: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1
- Modelo original IFM/K2-Horizon-0.9B: https://huggingface.co/IFM/K2-Horizon-0.9B
- GGUF del modelo original: https://huggingface.co/IFM/K2-Horizon-0.9B-GGUF
