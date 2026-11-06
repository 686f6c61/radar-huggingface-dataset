# 786King786/Kimi-K3-copy

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Con 2,8 billones de parámetros totales y 104 mil millones activados por token, se presenta como el primer modelo abierto de clase 3T, orientado a razonamiento de largo horizonte, trabajo de conocimiento agéntico y programación sobre repositorios extensos. El repositorio analizado (`786King786/Kimi-K3-copy`) es una copia de los pesos oficiales publicada por un tercero, no el repositorio canónico de Moonshot AI.

La arquitectura combina Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) sobre un esqueleto MoE con 896 expertos y 16 activos por token, bajo un marco denominado Stable LatentMoE. Incorpora visión nativa (texto, imagen y vídeo en el mismo modelo) y una ventana de contexto de un millón de tokens. La relevancia actual radica en que libera pesos de escala frontera bajo una licencia propia, lo que permite investigación y despliegue sobre infraestructura propia, aunque con requisitos de hardware muy elevados.

El modelo se distribuye en formato `safetensors` con cuantización de 8 bits mediante `compressed-tensors`, y el repositorio ocupa aproximadamente 1561 GB. La licencia es la "Kimi K3 License", marcada como `other` en Hugging Face, lo que exige revisar sus términos antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parámetros totales | 2.779.931.837.184 (≈2,8T) |
| Parámetros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8 bits (compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (con `custom_code` y `compressed-tensors`) |

Otros datos técnicos declarados en la model card: 93 capas (1 densa), composición de atención de 69 capas KDA + 24 capas Gated MLA, dimensión oculta de atención de 7168, 96 cabezas de atención, dimensión latente MoE de 3584, dimensión oculta por experto de 3072, 896 expertos con 16 seleccionados por token.

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE que sustituye la atención estándar por una combinación de Kimi Delta Attention (KDA) en 69 de sus 93 capas y Gated MLA en las 24 restantes. El marco Stable LatentMoE escala la dispersión del MoE hasta 896 expertos con 16 activos por token, lo que según el autor produce una mejora aproximada de 2,5× en eficiencia de escalado respecto a Kimi K2. La inclusión de Attention Residuals (AttnRes) se orienta a estabilizar el entrenamiento y la propagación de información en profundidades grandes.

El modelo es multimodal nativo: procesa texto, imágenes y vídeo dentro de la misma arquitectura, sin adaptadores separados según la model card. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones de decodificación especulativa ni detalles del proceso de alineación.

## Capacidades

- Generación de texto y razonamiento de largo horizonte, con soporte de sesiones de ingeniería prolongadas y supervisión humana mínima.
- Comprensión y generación de código sobre repositorios masivos, incluyendo orquestación de herramientas de terminal.
- Capacidades multimodales nativas: entrada de texto, imagen y vídeo en el mismo modelo (pipeline `image-text-to-text`).
- Contexto de un millón de tokens, adecuado para documentos extensos, bases de código completas y conversaciones multi-turno muy largas.
- Trabajo de conocimiento agéntico: investigación profunda con visualizaciones interactivas, widgets y paneles.
- Diseño y edición de movimiento y vídeo, según la model card.
- Aplicaciones declaradas en optimización de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con visión en el bucle, CAD y diseño de chips.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque la orientación agéntica del modelo lo sugiere.
- Capacidades multilingües: no disponible.

## Casos de uso

- Programación sobre repositorios grandes: el contexto de 1M tokens permite cargar una base de código completa y razonar sobre dependencias entre módulos, lo que resulta adecuado para refactorizaciones y auditorías de seguridad a escala de proyecto.
- Orquestación de agentes de terminal: el modelo puede encadenar comandos, interpretar su salida y corregir errores en sesiones largas, útil para pipelines de CI/CD y tareas de mantenimiento automatizado.
- Investigación profunda con generación de informes: con contexto extenso y capacidades multimodales, puede procesar documentación, capturas y vídeos para producir resúmenes con visualizaciones y paneles interactivos.
- Análisis de vídeo e imagen en producción: al ser multimodal nativo, sirve para moderación de contenido, inspección visual de calidad o extracción de información de grabaciones, sin necesidad de un modelo de visión separado.
- Optimización de kernels y desarrollo de compiladores: la model card cita explícitamente estos escenarios, donde el modelo sostiene sesiones de ingeniería con poca intervención humana.
- Asistencia en diseño CAD y de chips: el modelo puede interpretar especificaciones y diagramas junto con texto técnico, apoyando tareas de diseño asistido.
- Desarrollo de videojuegos con visión en el bucle: permite iterar sobre escenas renderizadas analizando capturas y ajustando código o parámetros.
- Atención al cliente con contexto largo: su ventana de 1M tokens admite historiales de conversación muy extensos y documentación de producto adjunta, aunque el coste de inferencia debe evaluarse con cuidado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un informe técnico (`k3_tech_report.pdf`) y de la etiqueta `eval-results`, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de otras evaluaciones en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T de parámetros y pesos en 8 bits, el modelo requiere del orden de 2,8 TB de memoria solo para los pesos, sin contar caché KV ni activaciones. No cabe en ninguna GPU consumer ni en configuraciones de una sola GPU de datacenter.
- GPU recomendadas: despliegue en clústeres multi-nodo con GPUs de datacenter (H100, H200, B200 o equivalentes). El número exacto de GPUs no está disponible en la información proporcionada.
- GPU consumer: no es viable. Ni siquiera las RTX 4090 o RTX 5090 pueden alojar el modelo completo.
- Opciones de despliegue: la librería declarada es `transformers` con `custom_code` y `compressed-tensors`. El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible; llama.cpp y Ollama quedan descartados en la práctica por el tamaño.
- Latencia y throughput: no disponibles. Con 104B de parámetros activos, el coste por token es elevado y exige interconexión de alta velocidad entre nodos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (esta ficha) | ≈2,8T | 104B | 1M tokens | Kimi K3 License | Pesos abiertos en Hugging Face |
| Kimi K2 | no disponible en la información | no disponible | no disponible | no disponible | Referenciado como predecesor |
| Otros modelos de clase 3T abiertos | no disponible | no disponible | no disponible | no disponible | No disponible |

La información proporcionada solo permite comparar con Kimi K2, del que se cita una mejora de 2,5× en eficiencia de escalado, sin cifras de parámetros ni contexto. No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio no oficial: `786King786/Kimi-K3-copy` es una copia publicada por un tercero con 26 descargas y 0 likes; para producción conviene usar el repositorio oficial de Moonshot AI y verificar la integridad de los pesos.
- Licencia restrictiva: la Kimi K3 License está marcada como `other`; es obligatorio revisar sus términos antes de cualquier uso comercial, redistribución o despliegue en servicios.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en contextos muy largos.
- Idiomas soportados no declarados: no hay confirmación del nivel de calidad en castellano ni en otras lenguas distintas del inglés.
- Sesgos: no se documentan en la model card los sesgos conocidos ni las medidas de mitigación aplicadas.
- Coste de inferencia: 2,8T de parámetros y pesos de 8 bits implican infraestructura multi-nodo; el coste por token y la latencia pueden ser prohibitivos para aplicaciones interactivas.
- Contexto de 1M tokens: aunque está soportado, el rendimiento efectivo en ventanas extremas no está verificado con benchmarks publicados en la información disponible.
- Formato de pesos: el uso de `custom_code` obliga a confiar en el código remoto del repositorio; conviene auditar `trust_remote_code` antes de ejecutarlo.
- Datos de entrenamiento no disponibles: se desconoce la composición del dataset, lo que dificulta evaluar sesgos y cobertura lingüística.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/786King786/Kimi-K3-copy
- Repositorio oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Pesos oficiales de Kimi K3 (referenciados en la model card): https://huggingface.co/moonshotai/Kimi-K3
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio en GitHub: https://github.com/MoonshotAI/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
