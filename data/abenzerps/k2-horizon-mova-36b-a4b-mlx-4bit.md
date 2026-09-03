# abenzerps/K2-Horizon-MoVA-36B-A4B-MLX-4bit

## Resumen

El modelo K2-Horizon-MoVA-36B-A4B-MLX-4bit es una conversión a formato MLX con cuantización affine de 4 bits del checkpoint original IFM/K2-Horizon-MoVA-36B-A4B, desarrollado por IFM. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con una innovación arquitectónica denominada Mixture-of-Values attention (MoVA), que combina 36 mil millones de parámetros totales pero solo activa aproximadamente 4 mil millones por token. Según IFM, bajo las mismas condiciones de entrenamiento, este modelo rinde solo ligeramente por debajo del modelo denso Horizon 32B, pero con una fracción de los parámetros activos, lo que lo hace especialmente eficiente en inferencia.

La versión MLX aquí descrita está optimizada para ejecutarse en hardware Apple Silicon mediante la librería mlx-lm, con un tamaño de 21,1 GB. El modelo base soporta una longitud de contexto nativa de 524.288 tokens (512K), lo que lo habilita para tareas de procesamiento de documentos extensos, agentes conversacionales con memoria larga y razonamiento multi-paso. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Mixture-of-Values attention (MoVA) |
| Parametros totales | 37.444.792.020 (según safetensors del repo MLX) |
| Parametros activos | ~4 mil millones por token |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | MLX affine 4-bit (group size 64); pesos de routers MoE y MoVA en 8-bit |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con atención MoVA, una variante de atención que combina múltiples cabezas de valores dentro de cada experto, lo que permite una mayor expresividad con menos parámetros activos. El router de MoE selecciona un subconjunto de expertos por token, y el router de MoVA decide qué cabezas de valores utilizar, reduciendo el coste computacional sin sacrificar calidad. El checkpoint original fue entrenado por IFM, aunque no se han publicado detalles específicos sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO en la información disponible. La conversión MLX mantiene la arquitectura original e incluye una implementación personalizada del modelo en MLX, junto con una plantilla de chat compatible.

## Capacidades

- Generación de texto conversacional y de larga forma, con soporte nativo de contexto de hasta 512K tokens.
- Razonamiento multi-paso y manejo de tareas complejas que requieren mantener estado a lo largo de secuencias extensas.
- Procesamiento de documentos largos, como contratos, informes técnicos o libros completos, sin necesidad de truncamiento.
- Eficiencia computacional gracias a la activación selectiva de parámetros (MoE), lo que permite inferencia rápida en hardware con memoria unificada.
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación, por lo que no se puede confirmar.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.

## Casos de uso

- Análisis de documentos legales extensos: el modelo puede procesar contratos o expedientes completos de más de 500.000 tokens, extrayendo cláusulas relevantes, resumiendo secciones y respondiendo preguntas específicas sobre el contenido sin perder contexto.
- Asistentes de investigación académica: permite cargar artículos, tesis o libros técnicos completos y realizar consultas complejas sobre ellos, manteniendo coherencia a lo largo de conversaciones largas.
- Generación de código con contexto amplio: al soportar 512K tokens, puede recibir repositorios enteros o archivos de gran tamaño como entrada, facilitando tareas de refactorización, generación de documentación o explicación de código existente.
- Chatbots de atención al cliente con memoria persistente: gracias a la ventana de contexto extendida, el modelo puede mantener el historial completo de una conversación de servicio, mejorando la personalización y la resolución de incidencias multi-turno.
- Resumen y síntesis de informes corporativos: puede procesar memorias anuales, informes financieros o actas de reuniones extensas y generar resúmenes ejecutivos con precisión.
- Creación de contenido editorial de larga duración: redacción de novelas, guiones o series de artículos donde se requiere mantener coherencia narrativa y de personajes a lo largo de decenas de miles de palabras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor incluye una imagen con resultados reportados por IFM para el checkpoint original, pero no se proporcionan valores numéricos en el texto. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 21,1 GB en cuantización 4-bit. Para inferencia con contexto largo, se recomienda al menos 32 GB de memoria unificada en Apple Silicon, siendo 64 GB o más adecuados para explotar la ventana de 512K tokens con KV-cache.
- GPU recomendadas: cualquier chip Apple Silicon con suficiente memoria unificada (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD sin una conversión adicional a otros formatos.
- Si cabe en consumer GPU: sí, en Macs con 32 GB o más de RAM unificada. En equipos con menos memoria, se puede reducir la longitud de contexto o usar cuantizaciones más agresivas.
- Opciones de despliegue: mediante mlx-lm (CLI o Python), compatible con el ecosistema MLX. No se menciona soporte para vLLM, llama.cpp u Ollama en esta versión específica.
- Latencia y throughput: no disponibles en la documentación. Dependerán del chip concreto, la longitud de contexto y el número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B (MLX 4-bit) | 36B (37,4B en safetensors) | ~4B | 512K | Apache-2.0 | MLX safetensors |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache-2.0 | Varios (GGUF, safetensors) |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K | Apache-2.0 | Varios |

La comparativa se basa en parámetros y contexto, ya que no se dispone de resultados de benchmarks comparables. K2-Horizon destaca por su contexto extremadamente largo (512K) frente a los 32K de Mixtral y Qwen, y por su menor número de parámetros activos, lo que lo hace más eficiente en inferencia. Sin embargo, su disponibilidad se limita a hardware Apple Silicon en esta versión MLX.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser limitado o degradado.
- La cuantización 4-bit puede introducir pérdidas de precisión en tareas que requieren alta exactitud numérica, como matemáticas avanzadas o razonamiento lógico complejo.
- La ventana de contexto de 512K es teórica; el uso práctico depende de la memoria unificada disponible y de la configuración de KV-cache, que puede consumir varios gigabytes adicionales.
- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo. Como todo LLM, puede generar información falsa o inventada, especialmente en dominios poco representados en sus datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos completos de la licencia y las condiciones de uso del modelo base.
- Esta versión MLX requiere hardware Apple Silicon; no es directamente desplegable en entornos con GPUs NVIDIA o AMD sin una conversión adicional a formatos como GGUF o safetensors estándar.

## Enlaces

- Repositorio HuggingFace de la conversión MLX: https://huggingface.co/abenzerps/K2-Horizon-MoVA-36B-A4B-MLX-4bit
- Modelo base original: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Blog de IFM sobre K2 Horizon: https://ifm.ai/blog/k2
