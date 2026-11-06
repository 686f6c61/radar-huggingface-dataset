# Austriani/Split-Untied-31B-ik_llama.cpp

## Resumen

Split-Untied-31B-ik_llama.cpp es una cuantización GGUF del modelo Split-Untied-31B, un fine-tune de la familia Gemma (etiquetado por el autor como "gemma4") desarrollado por Blazed-Forge y empaquetado para el runtime ik_llama.cpp por el usuario Austriani. El modelo está orientado a generación de texto creativo, narrativa de ficción, roleplay y conversación, y ha sido sometido a un proceso de "abliteration" y "heretic" que elimina total o parcialmente los mecanismos de rechazo del modelo base, de ahí las etiquetas uncensored y NSFW. Con 31.000 millones de parámetros, se sitúa en la gama alta de modelos densos que pueden ejecutarse en hardware de consumo mediante cuantización agresiva.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la comunidad open source: un modelo base publicado en formato original (safetensors) y una serie de cuantizaciones comunitarias en GGUF para motores alternativos a llama.cpp, en este caso ik_llama.cpp, un fork optimizado para CPUs y GPUs con soporte de cuantizaciones IQ y de mezcla de expertos. Por otro, ilustra las implicaciones prácticas de distribuir modelos "abliterated": la licencia Apache 2.0 se mantiene, pero el contenido generado puede ser inapropiado sin filtros y el autor advierte explícitamente de que el modelo no es apto para todas las audiencias.

La información disponible es escasa: la model card es mínima, no se publican idiomas soportados, no hay benchmarks y el propio autor indica que la subida de pesos (unos 120 GB en total) está en curso. Todo lo que sigue se basa en los metadatos de Hugging Face, las etiquetas del repositorio y la model card, sin extrapolaciones no verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma, etiquetado "gemma4" por el autor); detalles no disponibles |
| Parametros totales | 31B (31.000 millones, según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_KS, IQ4_KS_R4 (variantes de 4 bits con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que el modelo base pertenece a la familia Gemma de Google, lo que implica un transformer decoder-only con atención multi-cabeza y normalización RMSNorm, aunque el autor lo etiqueta como "gemma4", una denominación que no corresponde a ninguna versión oficial publicada por Google y que podría referirse a una variante o iteración interna. El fine-tune Split-Untied-31B fue desarrollado por Blazed-Forge y posteriormente sometido a técnicas de abliteration y heretic, que modifican los pesos para reducir la probabilidad de respuestas de rechazo ante solicitudes consideradas sensibles. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La aportación técnica de este repositorio concreto es la cuantización. Se ofrecen variantes IQ4_KS e IQ4_KS_R4, generadas con matrices de importancia (imatrix) y pensadas para el motor ik_llama.cpp, un fork de llama.cpp que incorpora kernels optimizados para cuantizaciones IQ y para ejecución en CPU con instrucciones AVX2/AVX-512. El sufijo R4 hace referencia a una variante de la cuantización con mayor fidelidad en los pesos de atención. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y creativo: ficción, narrativa, diálogo y roleplay, según las etiquetas del repositorio.
- Escritura creativa de formato largo: cuentos, novelas y guiones, con capacidad de mantener coherencia en textos extensos (siempre que el contexto lo permita, dato no disponible).
- Conversación multi-turno sin filtros de contenido, al haber sido abliterated.
- Generación de contenido NSFW y temáticas adultas, indicado explícitamente por las etiquetas.
- Capacidad multilingüe: no disponible; no se declaran idiomas en la model card.
- Tool calling / function calling: no disponible; no se menciona en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Modo thinking, visión o audio: no disponible; no se mencionan.

## Casos de uso

- Escritura de ficción interactiva y novelas por entregas: el modelo puede generar capítulos coherentes con un estilo consistente, y su naturaleza sin filtros permite tramas adultas o violentas sin rechazos, algo útil para autores de género negro, terror o erótica.
- Roleplay conversacional en aplicaciones de entretenimiento: al no aplicar rechazos, mantiene la inmersión en personajes y escenarios que otros modelos censurarían, siempre que el despliegue incluya sus propios mecanismos de moderación si el público es generalista.
- Generación de guiones y diálogos para videojuegos narrativos: permite producir ramificaciones de diálogo con tono adulto o humor negro, y la cuantización IQ4_KS reduce el coste de inferencia en servidores modestos.
- Prototipado rápido en local con ik_llama.cpp: al estar cuantizado a 4 bits, puede ejecutarse en una estación de trabajo con GPU de consumo o incluso en CPU con suficiente RAM, lo que facilita experimentar sin infraestructura cloud.
- Investigación sobre alineación y abliteration: sirve como caso de estudio para comparar el comportamiento de un modelo base frente a su versión abliterated en tareas de rechazo, sesgo y toxicidad.
- Generación de contenido para comunidades de fans y escritura colaborativa: el modelo puede actuar como coautor en talleres literarios o plataformas de escritura compartida, con la salvedad de que la licencia Apache 2.0 permite uso comercial del modelo, aunque no exime de responsabilidad sobre el contenido generado.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con ik_llama.cpp, los datos no salen del equipo, lo que encaja en flujos de escritura confidencial o guiones no publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización IQ4_KS de 4 bits, un modelo de 31B ocupa aproximadamente 17-19 GB de pesos, más overhead de contexto y caché KV; se estiman 20-24 GB para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para IQ4_KS con contexto limitado; A100 40 GB, H100 o RTX A6000 para mayor contexto o precisión.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 24 GB con cuantización IQ4_KS y contexto moderado; en GPUs de 16 GB requeriría cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: ik_llama.cpp (motor objetivo), llama.cpp (compatible con GGUF), Ollama si se importa el GGUF, y potencialmente otros runners compatibles con GGUF; no se garantiza compatibilidad con vLLM o TGI al no ser formatos soportados de forma nativa.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend (CPU vs GPU). En una RTX 4090 con IQ4_KS se puede esperar un rendimiento de decodificación en el rango de decenas de tokens por segundo, pero es una estimación genérica no verificada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Split-Untied-31B-ik_llama.cpp | 31B | no disponible | Apache 2.0 | GGUF (IQ4_KS) | Fine-tune abliterated de Gemma, orientado a rol y ficción |
| Gemma 2 27B (Google) | 27B | 8K (oficial) | Gemma Terms of Use | safetensors, GGUF | Modelo base alineado, con filtros de seguridad |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa densa con licencia permisiva y contexto amplio |
| Yi 34B | 34B | 4K-200K según variante | Apache 2.0 | safetensors, GGUF | Modelo denso de gama similar, con versiones comunitarias |

La comparación es aproximada: no se dispone de benchmarks del modelo evaluado ni de especificaciones de contexto, por lo que la elección frente a alternativas debe basarse en la licencia, el tamaño y el propósito (contenido sin filtros frente a modelos alineados).

## Limitaciones y advertencias

- Modelo abliterated: los mecanismos de rechazo han sido eliminados o reducidos, por lo que puede generar contenido violento, sexual o ilegal sin advertencia; no es apto para menores ni para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, citas y datos; no se han publicado evaluaciones de fidelidad.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas; la model card no incluye información al respecto.
- Contexto no disponible: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana real.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor del fine-tune y el distribuidor de la cuantización no ofrecen garantías; el contenido generado es responsabilidad del usuario.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación comunitaria ni de que los pesos estén completos; el propio autor indica que la subida de 120 GB está en curso, por lo que pueden faltar archivos.
- Compatibilidad limitada: el GGUF está optimizado para ik_llama.cpp; otros runners pueden no soportar las cuantizaciones IQ4_KS_R4.
- Etiqueta "gemma4" no oficial: no corresponde a una versión publicada por Google, lo que dificulta verificar la arquitectura exacta y el comportamiento esperado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Split-Untied-31B-ik_llama.cpp
- Modelo base: https://huggingface.co/Blazed-Forge/Split-Untied-31B
- ik_llama.cpp (repositorio del motor): https://github.com/ikawrakow/ik_llama.cpp
- llama.cpp (motor compatible): https://github.com/ggml-org/llama.cpp
- Documentación de Gemma (Google): https://ai.google.dev/gemma
