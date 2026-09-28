# mu2solutions/Molmo2-4B-GGUF

## Resumen

Molmo2-4B-GGUF es una conversión a formato GGUF del modelo multimodal allenai/Molmo2-4B, publicada por el usuario mu2solutions para su uso con llama.cpp. El modelo original lo desarrolla el Allen Institute for AI (Ai2) y combina un encoder de visión SigLIP con un proyector de cross-attention con pooling sobre un backbone de texto Qwen3-4B, con 4.411.475.456 parámetros totales según los safetensors del modelo base. La licencia es Apache 2.0, sin restricciones adicionales, y el pipeline declarado es image-text-to-text con etiqueta conversational.

El interés de esta publicación concreta es doble. Por un lado, acerca un modelo visión-lenguaje de 4B a equipos sin GPU de gama alta, ya que el repositorio ocupa 3,6 GB y el quantizado de texto en Q4_K_M pesa 2,72 GB. Por otro, corrige un problema de compatibilidad del proyector de visión: las compilaciones F16 anteriores almacenaban los tensores de pooling en un layout fusionado `mm.pool.kv` que el soporte actual de Molmo2 en llama.cpp ya no acepta, por lo que esta versión separa `mm.pool.k` y `mm.pool.v` e incorpora la fila `mm.image_patch_add`.

Se trata de una conversión reciente (28 de septiembre de 2026) con cero descargas y cero likes en el momento de redactar esta ficha, verificada por el autor en una máquina CPU-only. No se han publicado datos de benchmarks ni especificaciones de contexto nativo en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal transformer: encoder de visión SigLIP ViT + proyector de cross-attention con pooling y SwiGLU + backbone de texto Qwen3-4B (arquitectura `qwen3` en llama.cpp) |
| Parametros totales | 4.411.475.456 (aprox. 4,41 mil millones), dato de safetensors del modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M para el texto y F16 para el proyector de visión (mmproj); el autor no publica otros niveles de cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), dos ficheros: texto cuantizado y mmproj de visión |
| Modelo base | allenai/Molmo2-4B (revisión congelada `042abfa7a388`, 2026-01-23) |
| Tamaño del repositorio | 3,6 GB |
| Pipeline | image-text-to-text |
| Convertidor | llama.cpp HF-to-GGUF con el conversor de visión Molmo2 de Mu2, commit `c3d25ece9` |
| Fecha de publicación | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo sigue un diseño de tres bloques. La torre de visión es un SigLIP ViT en F16 que produce características de imagen; a continuación, un proyector de cross-attention con pooling (tensores `mm.pool.k` y `mm.pool.v` separados) y una proyección SwiGLU traduce esas características al espacio del modelo de lenguaje; finalmente, el backbone de texto es Qwen3-4B, que procesa la secuencia multimodal y genera la respuesta. La conversión a GGUF contiene 315 tensores en el fichero `mmproj` y conserva la plantilla de chat embebida desde el repositorio de origen. El dato relevante para el despliegue es que el encoder de visión se mantiene en F16 incluso cuando el texto va en Q4_K_M.

El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, y esa información tampoco aparece en los resultados de búsqueda disponibles, por lo que debe considerarse no disponible. Tampoco se publican detalles sobre innovaciones de decodificación (por ejemplo, decodificación especulativa) ni sobre técnicas de atención lineal. La única innovación documentada en esta ficha es de índole de compatibilidad: la reconstrucción del proyector con tensores de pooling independientes y la fila `mm.image_patch_add` precalculada, necesaria para que el grafo de visión de Molmo2 cargue en las versiones actuales de llama.cpp.

Ficheros publicados y huellas de verificación:

| Fichero | Cuantizacion | Tamaño | SHA-256 |
|---|---|---|---|
| `Molmo2-4B-text-Q4_K_M.gguf` | Q4_K_M (texto) | 2,72 GB | `7a04e31b5703943f2ac3527d33e8fecfefa35adf2d8d03f4954da28c11aee684` |
| `Molmo2-4B-mmproj-F16.gguf` | F16 (proyector de visión) | 881 MB | `1f59f440bd4c52fade2e22875e0a762d0819941637e6004a222e4397be7acac7` |

Ambos ficheros deben cargarse juntos para obtener un modelo de visión funcional.

## Capacidades

- Generación de texto conversacional a partir de entradas de imagen y texto (pipeline image-text-to-text, etiqueta conversational).
- Descripción y análisis de imágenes: la verificación del autor con la instrucción "Describe this image in one sentence." produjo una lectura correcta de colores, disposición y letras visibles de un logotipo corporativo.
- Comprensión de video y seguimiento de objetos (tracking), según la descripción que Ai2 hace de Molmo 2 (4B) en su página de producto.
- Pointing o referencia espacial sobre la imagen, también atribuido por Ai2 a la familia Molmo 2.
- Tareas de captioning, mencionadas explícitamente por Ai2 para esta variante de 4B.
- Soporte de conversación multi-turno en el sentido de que conserva la plantilla de chat del modelo original y se ejecuta con llama-mtmd-cli en modo interactivo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible. No se puede confirmar cobertura multilingüe más allá de lo que herede del backbone Qwen3-4B.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Generación automática de texto alternativo para imágenes: el modelo puede recibir una fotografía y devolver una descripción de una frase, lo que encaja en pipelines de accesibilidad web o de catalogación de activos gráficos. Su tamaño de 3,6 GB permite ejecutarlo en la misma máquina que sirve el CMS.
- Extracción de texto en imágenes y lectura de logotipos: la verificación publicada muestra que el modelo lee correctamente letras y colores de un wordmark. Es adecuado para triaje de documentos escaneados o moderación de imágenes con texto, siempre que se asuma riesgo de error en tipografías complejas.
- Etiquetado y curación de datasets de visión: al ser un modelo completamente abierto con licencia Apache 2.0, se puede usar para anotar o filtrar grandes colecciones de imágenes sin coste de API ni restricciones de uso comercial.
- Asistente visual local en estación de trabajo: con el texto en Q4_K_M (2,72 GB) y el proyector en F16 (881 MB), el conjunto cabe en equipos con pocos recursos, lo que permite prototipar aplicaciones de visión-lenguaje sin depender de servicios en la nube.
- Investigación en grounding y pointing: las capacidades de referencia espacial que Ai2 atribuye a Molmo 2 permiten experimentar con localización de objetos y evaluación de alineación entre lenguaje e imagen sobre un modelo pequeño.
- Análisis de video y seguimiento de objetos en entornos de laboratorio: para prototipos de vigilancia, deporte o robótica donde se requiere tracking, aunque el rendimiento real dependerá del hardware disponible para codificar cada fotograma.
- Integración en herramientas de línea de comandos basadas en llama.cpp: mediante `llama-mtmd-cli` con `--image` se puede construir un asistente de terminal que inspeccione capturas de pantalla, diagramas o fotografías dentro de un flujo de trabajo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente documenta una prueba cualitativa de verificación funcional, no una evaluación comparativa.

| Prueba | Entorno | Resultado |
|---|---|---|
| Codificación de visión (una vista de 378x378) | Intel i3-2100, solo CPU, sin F16C | 490.705 ms (aprox. 8 minutos 11 segundos) |
| Generación con visión | `llama-mtmd-cli`, `-c 4096 -t 4 -n 40 --temp 0`, proyector reconstruido | Descripción correcta de colores, disposición y letras visibles de un logotipo; la salida se truncó por el límite de 40 tokens |
| MMLU, HumanEval, GSM8K u otros | No disponibles | No disponibles |

El dato de latencia de visión corresponde a hardware muy limitado (CPU de 2011 sin F16C) y no es representativo de un despliegue con GPU o CPU moderna; el propio autor indica que un GPU o una CPU actual cambia el orden de magnitud.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB solo de pesos (2,72 GB del texto en Q4_K_M más 881 MB del proyector en F16), a lo que hay que sumar la caché KV y los buffers de activación, cuyo tamaño exacto no está documentado. El total real depende del contexto configurado y del backend; no hay cifras oficiales publicadas.
- GPU recomendadas: no disponible. El autor no publica configuraciones de referencia con GPU; solo documenta una prueba en CPU.
- Compatibilidad con GPU de consumo: probable en tarjetas con 6-8 GB de VRAM o más, dado el tamaño de los pesos, pero no está verificado ni respaldado por el autor. No hay confirmación para modelos concretos como RTX 4090, RTX 3060 o similares.
- CPU: funcional pero lento para la codificación de visión. La prueba del autor empleó un Intel i3-2100 sin soporte F16C y tardó unos ocho minutos por vista de 378x378, lo que desaconseja este hardware para uso interactivo.
- Opciones de despliegue confirmadas: llama.cpp con soporte de Molmo2 en mtmd, ejecutado mediante `llama-mtmd-cli` con los flags `-m` (texto), `--mmproj` (proyector) y `--image`.
- Requisito crítico: se necesita una compilación de llama.cpp con soporte del grafo de visión de Molmo2. El repositorio upstream no lo soporta todavía; esta publicación se produjo y verificó con el fork de Mu2.
- vLLM, TGI, Ollama, LM Studio y otros servidores: no disponible. No se confirma compatibilidad en la información proporcionada, más allá de la etiqueta `endpoints_compatible` del repositorio.
- Latencia y throughput estimados: solo se conoce el tiempo de codificación de visión en el hardware de prueba (490.705 ms por vista). No hay datos de velocidad de generación de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| mu2solutions/Molmo2-4B-GGUF | 4,41 mil millones | GGUF (Q4_K_M + mmproj F16) | Apache 2.0 | no disponible | Proyector reconstruido con `mm.pool.k` y `mm.pool.v` separados; verificado en fork de llama.cpp |
| allenai/Molmo2-4B | 4,41 mil millones | safetensors (pesos originales) | Apache 2.0 | no disponible | Modelo de referencia; encoder SigLIP + proyector de pooling + backbone Qwen3-4B |
| reubk/Molmo2-4B-GGUF | 4,41 mil millones (mismo modelo base) | GGUF | Apache 2.0 (heredada del modelo base) | no disponible | Conversión alternativa del mismo modelo; no se dispone de detalles verificados sobre sus ficheros ni su compatibilidad con llama.cpp |

No se dispone de comparaciones cuantitativas de rendimiento entre estas opciones ni frente a otros modelos visión-lenguaje de tamaño similar, ya que no hay benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- Requiere un fork de llama.cpp con soporte de Molmo2 mtmd. Con una compilación upstream estándar el grafo de visión no cargará, por lo que no es un GGUF "plug and play" en cualquier instalación.
- Los proyectores de visión F16 de compilaciones anteriores del mismo modelo usan un layout fusionado `mm.pool.kv` que ya no se acepta. Si se descargó uno previamente, hay que sustituirlo por el de este repositorio; de lo contrario el modelo no cargará.
- La codificación de visión en CPU puede ser extremadamente lenta: unos 490.705 ms por vista de 378x378 en un Intel i3-2100 sin F16C. Sin GPU o CPU moderna, el uso interactivo no es viable.
- llama.cpp puede emitir una advertencia al cargar indicando que el token `</s>` no es de tipo control y que se sobrescribe. El autor la califica de cosmética y sin efecto en la generación, pero conviene verificarla en cada entorno.
- No hay datos de benchmarks publicados, por lo que no se puede estimar su calidad relativa frente a otros modelos de su categoría.
- No hay información sobre idiomas soportados. No se debe asumir un rendimiento multilingüe equivalente al de otros modelos solo por el backbone de texto.
- No se documenta la longitud de contexto nativa. El valor `-c 4096` que aparece en los ejemplos es un flag de ejecución, no una especificación del modelo.
- Riesgo de alucinación inherente a los modelos visión-lenguaje, especialmente en lectura de texto pequeño, tipografías poco habituales o imágenes de baja resolución. La propia verificación del autor muestra una lectura parcial del wordmark, aunque la salida también estaba limitada a 40 tokens.
- Repositorio con cero descargas y cero likes en el momento de la consulta, y con una única verificación cualitativa realizada por el propio publicador. No hay validación independiente.
- Licencia Apache 2.0 en el modelo base y en esta conversión, sin restricciones adicionales para uso comercial. Aun así, conviene revisar la licencia de las dependencias de llama.cpp y del encoder SigLIP en el contexto de despliegue.
- Sesgos conocidos: no disponible. El autor no documenta evaluación de sesgos ni composición del dataset de entrenamiento.

## Enlaces

- Repositorio de la conversión GGUF: https://huggingface.co/mu2solutions/Molmo2-4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/allenai/Molmo2-4B
- Página del proyecto Molmo en Ai2: https://allenai.org/molmo
- Código de Molmo2 en GitHub: https://github.com/allenai/molmo2
- Código de Molmo (versión anterior) en GitHub: https://github.com/allenai/molmo
- Conversión GGUF alternativa del mismo modelo base: https://huggingface.co/reubk/Molmo2-4B-GGUF
