# mercwar/Qwen2.5-Coder-3B-Instruct-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF del modelo Qwen2.5-Coder-3B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud y convertido por el usuario mercwar mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp. Se trata de un modelo de lenguaje especializado en generación de código con 3.085.938.688 parámetros (aproximadamente 3,1 mil millones), afinado para instrucciones y conversación, lo que lo sitúa en el segmento de modelos compactos aptos para ejecución local en hardware de consumo.

La relevancia de esta ficha concreta reside en el formato: al estar cuantizado en Q4_K_M (4 bits, variante K-quant medium), el peso del repositorio se reduce a 1,9 GB, lo que permite desplegarlo en GPU de gama media, equipos con CPU moderna o incluso dispositivos con recursos limitados, manteniendo un equilibrio razonable entre calidad y huella de memoria. Es una opción práctica para asistentes de código embebidos, autocompletado en IDE y tareas de generación de código en entornos sin conectividad o con requisitos de privacidad estrictos.

El modelo base pertenece a la familia Qwen2.5-Coder, orientada a tareas de programación, y hereda la licencia qwen-research del modelo original, lo que condiciona su uso comercial. Esta conversión no añade mejoras sobre el modelo original más allá de la compresión del formato; su valor está en la portabilidad y en la facilidad de integración con el ecosistema llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-3B-Instruct); pesos en formato GGUF |
| Parámetros totales | 3.085.938.688 (aproximadamente 3,1 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de la model card usa `-c 2048`, pero no confirma el máximo del modelo base) |
| Tipos de cuantización | Q4_K_M (4 bits, K-quant medium); el repositorio solo publica esta variante |
| Idiomas soportados | en (inglés), según la model card y los tags |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (archivo `qwen2.5-coder-3b-instruct-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5-Coder, afinado para seguir instrucciones (Instruct) y orientado a tareas de código. La información disponible en esta ficha no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card del modelo original Qwen/Qwen2.5-Coder-3B-Instruct, que no se ha incluido en la información proporcionada. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

La contribución de este repositorio es exclusivamente la conversión a GGUF mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai. La cuantización Q4_K_M aplica cuantización de 4 bits con una variante K-quant de calidad media, que típicamente preserva mejor la fidelidad que las cuantizaciones Q4_0 o Q4_1 a costa de un tamaño ligeramente mayor. No se han publicado métricas de degradación de calidad respecto al modelo original en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat (tag `conversational`).
- Generación y explicación de código, dada la especialización Coder del modelo base.
- Respuesta a instrucciones (variante Instruct), adecuada para tareas guiadas por prompt.
- Soporte de inferencia local mediante llama.cpp (CLI y servidor HTTP).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües limitadas: la model card declara únicamente inglés (`en`).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Autocompletado y asistencia de código en IDE: el modelo puede integrarse en extensiones de editor mediante el servidor de llama.cpp para sugerir fragmentos de código en tiempo real, aprovechando su tamaño compacto y su especialización en programación.
- Generación de código en entornos sin conectividad: al ejecutarse localmente con llama.cpp, permite generar y revisar código en máquinas aisladas o con requisitos de privacidad, sin enviar datos a servicios externos.
- Explicación y documentación de código: el modelo puede recibir un fragmento de código y producir comentarios, docstrings o explicaciones en inglés, útil para tareas de mantenimiento y onboarding.
- Refactorización asistida por prompt: dado un bloque de código y una instrucción, puede proponer versiones reescritas o simplificadas, adecuado para revisiones rápidas en pipelines de desarrollo.
- Prototipado en hardware de consumo: con 1,9 GB de pesos en Q4_K_M, puede desplegarse en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, sirviendo como banco de pruebas para flujos de generación de código.
- Educación y aprendizaje de programación: puede generar ejemplos, resolver ejercicios y explicar conceptos en inglés, con la ventaja de ejecutarse localmente y sin coste por token.
- Chat técnico integrado en herramientas internas: mediante `llama-server` se puede exponer una API compatible con endpoints y conectar a interfaces de chat corporativas para consultas sobre código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB en Q4_K_M, considerando los 1,9 GB de pesos más la caché KV y el overhead del runtime (estimación orientativa; no confirmada en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 3060 o superiores; también A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), y por compatibilidad de formato GGUF, otros runtimes que lo soporten (Ollama, entre otros), aunque no se confirman en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mercwar/Qwen2.5-Coder-3B-Instruct-Q4_K_M-GGUF (esta ficha) | 3,1 B | no disponible | qwen-research | GGUF Q4_K_M | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-Coder-3B-Instruct (modelo base) | 3,1 B | no disponible en esta información | qwen-research | safetensors | Hugging Face (modelo oficial) |
| Alternativas de la misma categoría (otros modelos de código de ~3 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado en la información proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar los términos del modelo base antes de cualquier despliegue en producción.
- Idioma: la model card declara únicamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir código incorrecto, APIs inexistentes o explicaciones erróneas; requiere validación humana.
- Cuantización Q4_K_M: introduce una pérdida de precisión respecto al modelo original en safetensors; no se han publicado métricas de degradación en esta ficha.
- Contexto: no se confirma la longitud máxima de contexto del modelo base en la información disponible; el ejemplo de la model card usa 2048 tokens, que puede no ser el límite real.
- Repositorio no verificado: 0 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no oficial de Qwen.
- Sin datos de benchmarks ni de sesgos específicos en la información proporcionada.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en flujos automatizados complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mercwar/Qwen2.5-Coder-3B-Instruct-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
