# LlamaPal/Erebus-RP-Mini-4B-Q4_K_M-GGUF

## Resumen

Erebus RP Mini 4B es un modelo de lenguaje conversacional de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), distribuido en formato GGUF con cuantización Q4_K_M. El modelo original es obra del desarrollador comunitario Indexnusrefather, mientras que el repositorio aquí descrito (LlamaPal/Erebus-RP-Mini-4B-Q4_K_M-GGUF) es un espejo que mantiene una copia estable e inalterada del archivo, con el mismo hash SHA-256 que el original. La licencia declarada es Apache 2.0.

El modelo está orientado a generación de texto y conversación (pipeline `text-generation`, etiqueta `conversational`), y por su nombre ("RP") y su denominación "Instruct" se infiere un enfoque hacia role-play e instrucciones conversacionales, aunque la model card no detalla el dataset de entrenamiento ni el proceso de ajuste. El repositorio ocupa 2,8 GB, correspondientes al único archivo GGUF publicado.

La relevancia de esta ficha es fundamentalmente práctica: se trata de un artefacto de despliegue listo para usar en entornos con recursos limitados (inferencia en CPU o GPU de gama media mediante llama.cpp y derivados), pero con información técnica pública muy escasa. Cualquier evaluación rigurosa debe remitirse al repositorio original, que contiene la model card completa y los términos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; por tamaño y formato se trata de un transformer decoder-only, sin confirmación oficial) |
| Parámetros totales | 4.326.350.848 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Erebus-RP-Mini-4B-Q4_K_M.gguf`, 2,8 GB, SHA-256 `5fe0fe65178055ee4d5f4903c429c36ba180a90bbad498b2ee65c17eced909a5`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Por el número de parámetros (4,3 mil millones) y el pipeline declarado (`text-generation`), es compatible con un transformer decoder-only de escala pequeña-media, pero la model card no confirma ni detalla capa, atención, positional encoding ni vocabulario.

Tampoco se documentan los datos de entrenamiento: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO o ajuste por instrucciones más allá del sufijo "Instruct" en el nombre del archivo original. El repositorio es explícitamente un espejo de bytes sin modificaciones del archivo `Erebus-RP-Mini-4B-Instruct-2608-v0.1.Q4_K_M.gguf` del autor original Indexnusrefather, en el commit `7d909b2d0d99`. Cualquier detalle de entrenamiento debe consultarse en el repositorio de origen.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Ajuste orientado a instrucciones ("Instruct" en la denominación del archivo original), si bien no se detalla el formato de prompt ni las plantillas de chat.
- Uso previsto aparente para role-play y diálogo creativo (por la denominación "RP"), sin documentación oficial que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en equipos con poca VRAM: al estar cuantizado en Q4_K_M y ocupar 2,8 GB, el modelo puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM o incluso en CPU mediante llama.cpp, lo que lo hace adecuado para prototipos y pruebas offline.
- Role-play y generación creativa en aplicaciones de ocio: por su denominación "RP" y su naturaleza conversacional, encaja en chatbots de personajes y narrativa interactiva, siempre que se valide la calidad real con pruebas propias.
- Asistente conversacional embebido en aplicaciones de escritorio o móviles: el tamaño reducido del GGUF permite integrarlo en clientes ligeros sin dependencia de la nube.
- Experimentación e investigación sobre cuantización: sirve como caso de estudio para medir la degradación de calidad de un modelo de 4B al pasar a Q4_K_M frente a otros niveles de cuantización.
- Generación de texto asistida en entornos con requisitos de privacidad: al ejecutarse localmente, permite procesar conversaciones sin enviar datos a servicios externos.
- Base para fine-tuning o adaptaciones posteriores: al ser Apache 2.0 y de tamaño contenido, puede servir como punto de partida para ajustes específicos de dominio, aunque requeriría convertir el GGUF a otro formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con la cuantización Q4_K_M (el archivo pesa 2,8 GB; hay que sumar el overhead del contexto y de la caché KV).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; tarjetas de gama media como RTX 3060, RTX 4060 o superiores son suficientes. En GPUs de gama alta (A100, H100) el modelo estaría infrautilizado.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; también es viable en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles (dependen del hardware y del backend; no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Erebus RP Mini 4B (este) | 4,33 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Espejo comunitario, información técnica escasa |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo ampliamente documentado y con benchmarks públicos |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia; no es Apache 2.0 |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | safetensors, GGUF | Documentación y evaluaciones publicadas por Microsoft |

La comparación se ofrece a título orientativo por rango de tamaño; no se dispone de datos de rendimiento de Erebus RP Mini 4B que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Información técnica muy limitada: la model card del espejo no documenta arquitectura, contexto, idiomas ni datos de entrenamiento; se desconoce el comportamiento real del modelo.
- Riesgo de alucinación: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo; en modelos pequeños orientados a role-play el riesgo suele ser alto.
- Sesgos conocidos: no documentados; al no conocerse el dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados; no se debe asumir multilingüismo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el espejo remite al repositorio original para los términos completos; conviene verificar que el autor original mantiene esa licencia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Producción: no se recomienda su uso en producción sin una evaluación previa propia de calidad, latencia y seguridad, dado el vacío documental.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/LlamaPal/Erebus-RP-Mini-4B-Q4_K_M-GGUF
- Repositorio original del autor: https://huggingface.co/Indexnusrefather/Erebus-RP-Mini-4B-Instruct-2608-v0.1
- Commit exacto del archivo original: https://huggingface.co/Indexnusrefather/Erebus-RP-Mini-4B-Instruct-2608-v0.1/tree/7d909b2d0d99513b29a5999b2ec5334a0eb4d4cd
