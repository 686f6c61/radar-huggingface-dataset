# ReadyArt/Dark-Craving-26B-A4B-v3.0

## Resumen

Dark-Craving-26B-A4B-v3.0 es un ajuste fino (fine-tune) del modelo google/gemma-4-26B-A4B-it, publicado por el usuario ReadyArt en HuggingFace. El modelo está orientado a generación de texto conversacional para roleplay adulto y contenido explícito (ERP), con etiquetas que lo clasifican como NSFW, *unaligned* y no apto para todas las audiencias. Se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en la plataforma.

Con 25.805.936.206 parámetros totales según los pesos en safetensors (aproximadamente 25,8 mil millones), el modelo hereda la arquitectura y el contexto del Gemma 4 26B A4B instructivo de Google. El sufijo "A4B" en el nombre del base sugiere una configuración de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos, aunque esta ficha no dispone de confirmación oficial sobre dicho dato en la información proporcionada.

Su relevancia es acotada: se trata de un modelo de nicho para comunidades de roleplay y narrativa adulta, no de un modelo de propósito general. No hay métricas de rendimiento publicadas ni tracción en la plataforma (0 descargas, 0 likes en el momento de la consulta), lo que limita cualquier evaluación objetiva de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, presumiblemente MoE según el sufijo A4B; no confirmado en la información disponible) |
| Parámetros totales | 25.805.936.206 |
| Parámetros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un modelo instructivo de Google con arquitectura transformer. El sufijo "A4B" en la nomenclatura de Gemma hace referencia a una variante de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos por token, aunque la información proporcionada no incluye detalles técnicos verificados sobre la arquitectura interna, el número de expertos ni el mecanismo de enrutamiento.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens utilizados, la composición de los datos de roleplay, ni sobre si se aplicaron técnicas de RLHF, DPO o preferencia humana. Tampoco se documentan innovaciones técnicas específicas del fine-tune más allá de su orientación temática hacia contenido adulto y conversación sin restricciones (*unaligned*). El modelo base es un instructivo de Google, por lo que hereda su tokenizador, su ventana de contexto y sus capacidades generales, pero el ajuste fino puede haber degradado o alterado parte de ellas.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay e interpretación de personajes.
- Contenido narrativo y erótico explícito (ERP), con etiquetas NSFW y *mature*.
- Modo conversacional instructivo heredado del modelo base Gemma 4 instruct.
- Capacidades generales de generación de texto del modelo base (razonamiento, código, matemáticas) presumiblemente conservadas, aunque no verificadas tras el fine-tune.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional adulto: el modelo está ajustado específicamente para mantener personajes coherentes en conversaciones multi-turno de temática explícita, con un tono desinhibido que el modelo base instructivo no ofrece por defecto.
- Escritura creativa de ficción erótica: útil para autores que necesitan generar borradores de narrativa adulta con continuidad de personajes y estilo, gracias a su ajuste orientado a este dominio.
- Simulación de personajes para comunidades de rol: plataformas de chat con personajes (estilo character.ai autoalojado) pueden desplegarlo para interacciones sin filtros editoriales.
- Generación de diálogos para proyectos de ficción interactiva o novelas visuales de contenido adulto, donde se requiere un registro conversacional natural y explícito.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de un fine-tune *unaligned* para analizar cómo el ajuste fino puede eliminar salvaguardas del modelo base.
- Experimentación con despliegue local de modelos de ~26B en entornos controlados, siempre que se respeten las restricciones de acceso y las políticas de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB (25,8B parámetros × 2 bytes), lo que exige GPUs de 80 GB (A100, H100) o múltiples GPUs.
- En cuantización de 8 bits: ~26 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o con *offloading*.
- En cuantización de 4 bits: ~13-15 GB de VRAM, cabe en una RTX 4090, RTX 3090 o incluso en GPUs de 16 GB con margen ajustado.
- Si se confirma la arquitectura MoE con ~4B activos, el throughput sería notablemente superior al de un modelo denso de 26B, pero este dato no está verificado.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI, siempre que existan conversiones GGUF o AWQ publicadas (no listadas en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v3.0 | 25,8B | no disponible | Apache 2.0 | Roleplay adulto / NSFW | Gated en HuggingFace |
| google/gemma-4-26B-A4B-it (base) | ~26B | no disponible | Gemma (términos propios) | Propósito general instruct | Público |
| Alternativas NSFW de la comunidad | no disponible | no disponible | variable | Roleplay adulto | variable |

No se dispone de datos de rendimiento comparativos verificables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito y NSFW: no apto para menores ni para entornos profesionales sin control de acceso.
- Modelo *unaligned*: probablemente carece de las salvaguardas de seguridad del modelo base Gemma, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado más allá del roleplay.
- Riesgo elevado de alucinación en contextos factuales, agravado por un fine-tune orientado a ficción y no a precisión.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma tiene sus propios términos de uso que pueden imponer restricciones adicionales al uso comercial; conviene verificar la compatibilidad.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita su distribución automatizada.
- Sin tracción ni validación comunitaria (0 descargas, 0 likes): no hay evidencia pública de calidad, estabilidad ni reproducibilidad.
- Sin benchmarks ni documentación de entrenamiento: imposible evaluar objetivamente su rendimiento frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v3.0
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
