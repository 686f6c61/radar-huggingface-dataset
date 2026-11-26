# pranil00/ONIX-SmolLM2-360M-Instruct-GGUF

## Resumen

ONIX-SmolLM2-360M-Instruct-GGUF es una conversión a formato GGUF, en cuantización Q8_0, del modelo SmolLM2-360M-Instruct desarrollado por Hugging Face. El autor de esta ficha de pesos es pranil00, que distribuye el artefacto bajo la etiqueta "ONIX Community" y afirma haber realizado la conversión de tensores en Apple Silicon mediante Metal y verificado la autenticidad de la conversión con llama.cpp. No se trata, por tanto, de un modelo nuevo: es una redistribución cuantizada del modelo base original.

El modelo subyacente, SmolLM2-360M-Instruct, es un transformer decoder-only de 361.821.120 parámetros (aproximadamente 360 millones) diseñado para ejecutarse en dispositivos con recursos muy limitados, incluyendo móviles y sistemas embebidos. La versión Instruct está ajustada para seguir instrucciones y mantener conversaciones. Su relevancia radica en que permite desplegar generación de texto conversacional en CPU, incluso en hardware de gama baja, con un tamaño de pesos de solo 0,36 GB en Q8_0.

Esta ficha documenta exclusivamente la información disponible en la model card y los metadatos del repositorio. El autor no publica detalles sobre composición del dataset de entrenamiento, número de tokens, proceso de alineación ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según modelo base SmolLM2; detalles no publicados en esta model card) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo SmolLM2-360M-Instruct-Q8_0.gguf, 0,36 GB) |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta información sobre la arquitectura interna ni sobre el proceso de entrenamiento. Lo único documentado es que se trata de una conversión de tensores del modelo HuggingFaceTB/SmolLM2-360M-Instruct a GGUF, realizada con llama.cpp en Apple Silicon (Metal) y verificada como conversión auténtica. El modelo base pertenece a la familia SmolLM2 de Hugging Face, orientada a modelos compactos, pero esta ficha no dispone de datos sobre número de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO ni innovaciones técnicas específicas.

## Capacidades

- Generación de texto conversacional: el sufijo Instruct del modelo base indica ajuste para seguir instrucciones y mantener diálogos de múltiples turnos.
- Ejecución en CPU y hardware de gama baja: el tamaño de 0,36 GB en Q8_0 permite inferencia local sin GPU dedicada.
- Compatibilidad con llama.cpp: la model card documenta uso directo mediante `llama-cli`.
- Compatibilidad con Ollama: la model card documenta ejecución mediante `ollama run pranil00/ONIX-SmolLM2-360M-Instruct-GGUF`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Vision, audio o modo thinking: no disponible; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: el modelo puede gestionarse en CPU con llama.cpp u Ollama gracias a sus 0,36 GB de pesos en Q8_0, lo que lo hace adecuado para prototipos de chatbot en portátiles sin GPU.
- Generación de texto en sistemas embebidos y edge computing: con 361,8 millones de parámetros y cuantización de 8 bits, cabe en dispositivos con memoria RAM limitada, útil para tareas de autocompletado o respuestas cortas sin conexión.
- Filtrado y clasificación de texto en pipelines ligeros: puede emplearse para reformular, resumir o etiquetar fragmentos de texto en procesos por lotes donde el coste computacional por token es crítico.
- Pruebas de integración de GGUF en aplicaciones: sirve como artefacto de referencia para validar cargas de modelos GGUF en llama.cpp u Ollama antes de escalar a modelos mayores.
- Educación y experimentación con modelos de lenguaje: su tamaño reducido permite ejecutar experimentos de prompting, temperatura y decodificación en entornos docentes o de investigación con hardware modesto.
- Generación de respuestas en asistentes de bajo consumo energético: adecuado para aplicaciones donde el consumo de batería o la latencia de red son restrictivos, al evitar dependencia de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica GPU dedicada; en Q8_0 los pesos ocupan 0,36 GB y la inferencia puede ejecutarse en CPU con memoria RAM del orden de 1 GB o menos, dependiendo del contexto configurado.
- GPU recomendadas: no hay recomendaciones publicadas; por tamaño, cualquier GPU con al menos 1 GB de memoria libre podría cargar el modelo, pero la model card no documenta pruebas en GPU.
- ¿Cabe en consumer GPU? Sí, por tamaño; el repositorio no especifica modelos concretos (RTX 4090, etc.) ni resultados medidos.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run pranil00/ONIX-SmolLM2-360M-Instruct-GGUF`) y cualquier runtime compatible con GGUF. vLLM, TGI y otros backends no están documentados en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-SmolLM2-360M-Instruct-GGUF (este) | 361.821.120 | no disponible | apache-2.0 | GGUF Q8_0 | Conversión comunitaria de SmolLM2-360M-Instruct |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361.821.120 | no disponible en esta ficha | apache-2.0 | safetensors (modelo original) | Modelo base oficial de Hugging Face |
| SmolLM2-135M-Instruct | no disponible en esta ficha | no disponible | apache-2.0 | safetensors / GGUF | Variante menor de la familia SmolLM2; datos no verificados aquí |
| SmolLM2-1.7B-Instruct | no disponible en esta ficha | no disponible | apache-2.0 | safetensors / GGUF | Variante mayor de la familia SmolLM2; datos no verificados aquí |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser una conversión del modelo base, hereda los sesgos de SmolLM2-360M-Instruct, que no se detallan aquí.
- Riesgo de alucinación: no cuantificado; los modelos de 360 millones de parámetros tienen capacidad limitada de verificación factual, pero no hay datos publicados que lo midan en este artefacto.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica longitud de contexto ni lista de idiomas.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial con atribución y sin garantías; conviene revisar los términos exactos del modelo base.
- Trazabilidad: este repositorio es una conversión comunitaria con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de soporte por parte del autor.
- Verificación: el autor afirma haber verificado la conversión de tensores con llama.cpp, pero no se aportan hashes, scripts de conversión ni logs reproducibles.
- Uso en producción: al no haber benchmarks publicados, no se recomienda como base para decisiones de calidad sin evaluación propia previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-SmolLM2-360M-Instruct-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- llama.cpp (referenciado en la model card): https://github.com/ggerganov/llama.cpp
- Ollama (referenciado en la model card): https://ollama.com
