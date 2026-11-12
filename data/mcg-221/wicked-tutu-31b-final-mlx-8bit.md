# McG-221/Wicked-Tutu-31B-Final-mlx-8Bit

## Resumen

Wicked-Tutu-31B-Final-mlx-8Bit es una conversión al formato MLX del modelo de generación de texto ReadyArt/Wicked-Tutu-31B-Final, realizada por el usuario McG-221 mediante mlx-lm 0.31.2. Se trata de un modelo de aproximadamente 30.700 millones de parámetros (30.697.345.280 según los pesos safetensors) orientado a roleplay, ficción explícita y narrativa adulta, con etiquetas declaradas de NSFW, contenido erótico, terror y violencia. No es un modelo alineado ni un asistente generalista: su propósito declarado es la generación creativa sin restricciones de contenido.

La relevancia de esta ficha es doble. Por un lado, documenta una cuantización de 8 bits en formato MLX, lo que permite ejecutar un modelo de ~31B en hardware Apple Silicon con memoria unificada, algo imposible con los pesos originales en bf16 en la mayoría de equipos de consumo. Por otro, sirve como ejemplo de la categoría de modelos "unaligned" que circulan en Hugging Face y que requieren una evaluación cuidadosa antes de cualquier uso en producción.

El modelo base es ReadyArt/Wicked-Tutu-31B-Final, presumiblemente derivado de la familia Gemma (la etiqueta `gemma4` aparece en los metadatos del repo), aunque no se dispone de información verificada sobre su arquitectura interna, datos de entrenamiento o proceso de ajuste. La licencia declarada es Apache 2.0, lo que facilita el uso comercial desde el punto de vista formal, pero el contenido que genera plantea riesgos que la licencia no cubre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (presuntamente familia Gemma, etiqueta `gemma4`; no confirmado) |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el repo base ofrece otras variantes no detalladas |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura exacta del modelo base. La etiqueta `gemma4` en los metadatos sugiere que ReadyArt/Wicked-Tutu-31B-Final parte de un modelo de la familia Gemma de Google, pero no hay confirmación oficial ni detalles sobre el número de capas, dimensión de atención, uso de GQA, RoPE u otras variantes. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO) ni fine-tuning específico para roleplay o narrativa.

La única información técnica verificable es la conversión a MLX: el autor indica que usó mlx-lm 0.31.2 para transformar los pesos del modelo base al formato MLX con cuantización de 8 bits. Este proceso reduce el tamaño del repo a 34,6 GB y permite la inferencia en Apple Silicon mediante memoria unificada. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto narrativo y conversacional en inglés, orientada a roleplay y ficción.
- Escritura de contenido explícito, erótico, de terror y violencia, según las etiquetas declaradas por el autor.
- Conversación multi-turno con mantenimiento de personaje y contexto narrativo (sin datos verificados sobre la ventana efectiva).
- Generación creativa sin las restricciones típicas de los modelos alineados ("unaligned").
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta soporte de visión, audio ni otras modalidades.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo "thinking" ni razonamiento extendido.

## Casos de uso

- Escritura creativa de ficción adulta: el modelo puede generar narrativa explícita y de terror sin filtros de contenido, adecuado para autores que necesitan borradores sin restricciones en un entorno controlado.
- Roleplay conversacional de personajes: gracias a su orientación a roleplay y conversación multi-turno, puede mantener personajes con personalidad consistente en sesiones largas, aunque la ventana de contexto no está documentada.
- Prototipado de videojuegos narrativos para adultos: útil para generar diálogos ramificados y descripciones de escenas en proyectos de ficción interactiva clasificados para mayores de edad.
- Investigación sobre modelos no alineados: sirve como caso de estudio para analizar el comportamiento de modelos sin RLHF restrictivo y comparar su tasa de rechazo frente a modelos alineados.
- Generación de guiones para podcasts o audiolibros de terror: el modelo puede producir monólogos y descripciones atmosféricas con violencia explícita, adecuado para producciones de nicho.
- Inferencia local en Mac: al estar en formato MLX 8-bit, permite ejecutar un modelo de ~31B en equipos Apple Silicon con memoria unificada suficiente, útil para desarrolladores que trabajan offline con contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 34,6 GB en 8 bits, por lo que se necesitan al menos ~36-40 GB de memoria unificada para cargar el modelo con margen para el contexto y el tokenizador.
- Hardware recomendado: Apple Silicon con 48 GB o más de memoria unificada (M2 Max, M2 Ultra, M3 Max, M3 Ultra, M4 Max). En equipos de 32 GB no cabe con holgura.
- GPU consumer: no aplica directamente, ya que el formato MLX está diseñado para Apple Silicon; para NVIDIA habría que usar los pesos originales en safetensors con otra herramienta.
- Opciones de despliegue: `mlx-lm` (librería oficial para cargar y generar), con el snippet de la model card. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta conversión concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Orientación |
|---|---|---|---|---|---|
| Wicked-Tutu-31B-Final-mlx-8Bit | ~30,7B | no disponible | Apache 2.0 | MLX safetensors 8-bit | Roleplay/NSFW |
| ReadyArt/Wicked-Tutu-31B-Final | ~31B (presunto) | no disponible | Apache 2.0 | safetensors (bf16/fp16) | Roleplay/NSFW |
| Modelos de rol sin alinear de ~30B (p. ej. variantes de Yi-34B o Gemma-2-27B fine-tuneadas) | 27-34B | variable | variable | safetensors/GGUF | Roleplay/NSFW |

No se dispone de datos de rendimiento comparativo verificables entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como NSFW, con erótica, violencia y terror; no es apto para menores ni para entornos sin moderación.
- Modelo no alineado: no ha pasado por RLHF restrictivo, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin rechazo.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres y detalles; en ficción esto es esperable, pero en usos factuales es un riesgo grave.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: no se documenta la longitud de ventana, lo que impide planificar usos con documentos largos.
- Licencia Apache 2.0: permite uso comercial formal, pero el desarrollador asume toda la responsabilidad legal y ética sobre el contenido generado y su distribución.
- Disponibilidad limitada: solo 132 descargas y 0 likes en el momento de la ficha, lo que indica poca validación comunitaria.
- Formato MLX: no es portable a NVIDIA/AMD sin conversión adicional; el ecosistema de herramientas es más reducido que GGUF o safetensors estándar.
- Repo de 34,6 GB: requiere almacenamiento y ancho de banda considerables para descarga.

## Enlaces

- Hugging Face: https://huggingface.co/McG-221/Wicked-Tutu-31B-Final-mlx-8Bit
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-Final
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentación MLX: https://ml-explore.github.io/mlx/
