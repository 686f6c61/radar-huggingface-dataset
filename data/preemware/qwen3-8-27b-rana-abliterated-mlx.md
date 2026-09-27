# preemware/Qwen3.8-27B-RANA-abliterated-MLX

## Resumen

Qwen3.8-27B-RANA-abliterated-MLX es un conjunto de conversiones al formato MLX del modelo preemware/Qwen3.8-27B-RANA-abliterated, que a su vez es un Qwen/Qwen3.8-27B con la dirección de rechazo ablacionada (abliteration). El repositorio lo publica el usuario preemware y está pensado exclusivamente para Apple Silicon mediante la librería mlx-vlm, con el objetivo de que un modelo de 27.356.728.560 parámetros (27,36 mil millones) pueda ejecutarse en memoria unificada de un Mac.

El repositorio no contiene un único conjunto de pesos, sino varias compilaciones en carpetas separadas: 4-bit, 5-bit, 6-bit, 8-bit y bf16, además de una carpeta mtp con el borrador para decodificación especulativa. El pipeline declarado es image-text-to-text, por lo que incluye torre de visión en todas las compilaciones. La raíz del repositorio contiene una copia idéntica a la carpeta 4-bit.

Su relevancia es doble: por un lado, ofrece una ruta de despliegue local en hardware de Apple con métricas de fidelidad publicadas (divergencia KL y perplejidad frente a BF16); por otro, es un modelo con la alineación de seguridad eliminada, lo que lo sitúa en el ámbito de la investigación en interpretabilidad y red-teaming y no en el de producto final. La licencia heredada es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetado como qwen3_5, transformer con torre de visión (vision-language) y cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.356.728.560 (27,36 mil millones), según safetensors |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit (4,695 bits/peso), 5-bit (5,678 bits/peso), 6-bit (6,661 bits/peso), 8-bit (8,627 bits/peso) y BF16 sin cuantizar; cuantización afín round-to-nearest con group size 64 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (librería mlx); existen variantes BF16 para Transformers, FP8 para vLLM/SGLang y GGUF para llama.cpp |
| Tamaño del repositorio | 143,3 GB (todas las precisiones juntas) |
| Pipeline | image-text-to-text |
| Modelo base | preemware/Qwen3.8-27B-RANA-abliterated (relación: quantized) |

### Compilaciones publicadas

| Carpeta | Precisión | Tamaño | KLD | Mismo token superior |
|---|---|---|---|---|
| (raíz) | mismos archivos que 4-bit | 16,08 GB | 0,0468 | 90,0 % |
| 4-bit/ | 4-bit, 4,695 bits/peso | 16,08 GB | 0,0468 | 90,0 % |
| 5-bit/ | 5-bit, 5,678 bits/peso | 19,44 GB | 0,0129 | 94,8 % |
| 6-bit/ | 6-bit, 6,661 bits/peso | 22,80 GB | 0,0042 | 96,9 % |
| 8-bit/ | 8-bit, 8,627 bits/peso | 29,53 GB | 0,0013 | 98,3 % |
| bf16/ | BF16, sin cuantizar | 54,74 GB | referencia | – |
| mtp/ | borrador MTP, BF16 | 0,87 GB | – | – |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna más allá de las etiquetas del repositorio: qwen3_5, vision-language y mlx-vlm. Se trata, por tanto, de un transformer multimodal de la familia Qwen3.5 con torre de visión, publicado aquí únicamente como conversión de formato. El proceso de conversión se hizo con mlx_vlm.convert (mlx-vlm 0.7.3, MLX 0.32.2) a partir de los pesos BF16 publicados. Las compilaciones cuantizadas usan cuantización afín con redondeo al más cercano y group size 64, mientras que la torre de visión se mantiene en BF16 en todas ellas. La cabeza MTP se separó en la carpeta mtp/ con la opción --mtp y también permanece en BF16.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si hubo RLHF o DPO en el modelo original. La intervención que define a esta familia, la abliteración (eliminación de la dirección de rechazo), es una modificación post-entrenamiento aplicada sobre el modelo base preemware/Qwen3.8-27B-RANA-abliterated, no un reentrenamiento. Como innovación técnica destacable, el repositorio conserva el diseño de tensores, formas, dtypes y config.json idénticos a las conversiones estándar de mlx-community y lmstudio-community para Qwen/Qwen3.8-27B, de modo que carga en cualquier entorno donde carguen aquellas.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Modo de razonamiento (thinking) activado por defecto, con muestreo recomendado de temperature 1.0, top_p 0.95 y top_k 20.
- Comprensión de imágenes: pipeline image-text-to-text y entrada visual mediante --image en mlx-vlm.
- Tool calling / function calling: el servidor compatible con OpenAI de mlx-vlm soporta llamadas a herramientas y devuelve el razonamiento separado de la respuesta.
- Decodificación especulativa con MTP: el borrador de 0,87 GB acelera la generación sin cambiar la salida codiciosa.
- Razonamiento multi-paso prolongado: la propia model card indica que solicitudes técnicas complejas pueden requerir entre 20.000 y 50.000 tokens de razonamiento.
- Ausencia prácticamente total de rechazos, por efecto de la abliteración (capacidad buscada en investigación, no una funcionalidad de producto).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad de la negativa: comparar las activaciones y las respuestas de este modelo con las del Qwen3.8-27B original permiten localizar y caracterizar la dirección de rechazo y evaluar cómo se propaga por las capas.
- Red-teaming y evaluación de robustez: al haber eliminado la alineación de seguridad, sirve como sujeto de pruebas para medir la eficacia de filtros y moderadores externos, siempre en un entorno controlado y sin exposición a usuarios finales.
- Auditoría de cuantización en Apple Silicon: las métricas publicadas (KLD y perplejidad por precisión) permiten estudiar el compromiso entre huella de memoria y fidelidad para un modelo de 27,36 mil millones de parámetros.
- Asistencia técnica local con contexto largo: con 32.768 tokens de generación configurados en los ejemplos y razonamiento extendido, encaja en flujos de explicación de conceptos técnicos (por ejemplo, resolución de colisiones en tablas hash) ejecutados íntegramente en el equipo del usuario.
- Procesamiento de documentos con imagen: al aceptar entrada de imagen y texto, puede extraer texto y formas de diagramas en un pipeline local, como demuestra la propia comprobación de función del repositorio.
- Automatización agéntica con herramientas: el servidor OpenAI-compatible con soporte de tool calls y razonamiento separado permite integrarlo en agentes de varios pasos que necesiten invocar funciones externas.
- Evaluación de decodificación especulativa: el borrador MTP hace de este repositorio una plataforma para medir tasas de aceptación (2,49 a 2,57 tokens aceptados por ronda) en hardware Apple.
- Banco de pruebas para moderación externa: dado que el modelo no rechaza por sí mismo, cualquier despliegue controlado obliga a construir y validar la capa de filtrado fuera del modelo, lo que resulta útil para comparar arquitecturas de moderación.
- Investigación en degradación por cuantización agresiva: la compilación 4-bit (16,08 GB) permite analizar la pérdida de calidad (KLD 0,0468; 90,0 % de coincidencia en el token superior) frente a 8-bit (KLD 0,0013; 98,3 %).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos publicados son métricas de fidelidad de la cuantización y de la decodificación especulativa.

Métricas de fidelidad (KLD medida en wiki.test.raw: 100 fragmentos de 512 tokens, puntuando la segunda mitad de cada fragmento; 25.500 tokens puntuados por compilación):

| Compilación | KLD | Mismo token superior | Perplejidad |
|---|---|---|---|
| BF16 | referencia | – | 6,778 |
| 4-bit | 0,0468 | 90,0 % | 6,945 |
| 5-bit | 0,0129 | 94,8 % | 6,863 |
| 6-bit | 0,0042 | 96,9 % | 6,788 |
| 8-bit | 0,0013 | 98,3 % | 6,779 |

Decodificación especulativa con el borrador MTP (modo codicioso, 512 tokens de una respuesta de código), media de tokens aceptados por ronda:

| Compilación | Tokens aceptados por ronda | Porcentaje de borradores aceptados |
|---|---|---|
| 4-bit | 2,49 | 74 % |
| 5-bit | 2,57 | 79 % |
| 6-bit | 2,56 | 78 % |
| 8-bit | 2,57 | 79 % (dato truncado en la model card) |

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con MLX y mlx-vlm (versión mínima: mlx-vlm 0.7.3 y MLX 0.32.2). El repositorio está diseñado para memoria unificada, no para GPU discretas.
- Huella de pesos por compilación: 4-bit 16,08 GB; 5-bit 19,44 GB; 6-bit 22,80 GB; 8-bit 29,53 GB; BF16 54,74 GB. El borrador MTP añade 0,87 GB.
- Memoria unificada recomendada (estimación a partir del tamaño de los pesos, no publicada por el autor): al menos 18-20 GB para 4-bit, 22-24 GB para 5-bit, 26-28 GB para 6-bit y 34-38 GB para 8-bit. Los equipos con 16 GB de memoria unificada no pueden alojar ninguna compilación completa con comodidad.
- Equipos compatibles habituales: Mac con M1/M2/M3/M4 Pro, Max o Ultra con 32 GB o más para 4-bit, 5-bit y 6-bit; 64 GB o más para 8-bit y BF16. No se especifican GPU NVIDIA recomendadas para esta conversión concreta.
- Despliegue: mlx_vlm generate para inferencia por línea de comandos; mlx_vlm server para un servidor compatible con OpenAI con soporte de tool calls y razonamiento separado; se puede añadir --draft-model con --draft-kind mtp para decodificación especulativa.
- Otros formatos del mismo modelo: FP8 para vLLM/SGLang y GGUF para llama.cpp, útiles si el destino no es Apple Silicon.
- Latencia y throughput: no disponibles. Lo único cuantificable es la aceleración por decodificación especulativa, con 2,49-2,57 tokens aceptados por ronda.
- Advertencia operativa de la model card: no pasar el identificador del repositorio directamente a --model, porque mlx-vlm descargaría todas las carpetas (unos 160 GB) en lugar de solo la precisión deseada; hay que apuntar a la subcarpeta correspondiente.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de la misma categoría en la información proporcionada. La comparación posible es entre las variantes de formato del mismo modelo:

| Variante | Formato / librería | Precisión | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| preemware/Qwen3.8-27B-RANA-abliterated-MLX (este repositorio) | MLX / mlx-vlm | 4, 5, 6, 8 bits y BF16 | 16,08-54,74 GB | Apache-2.0 | Publicado, 0 descargas y 0 likes en el momento de la consulta |
| preemware/Qwen3.8-27B-RANA-abliterated | BF16 / Transformers | BF16 | No disponible | Apache-2.0 | Publicado (modelo base) |
| preemware/Qwen3.8-27B-RANA-abliterated-FP8 | FP8 / vLLM y SGLang | FP8 | No disponible | Apache-2.0 | Publicado |
| preemware/Qwen3.8-27B-RANA-abliterated-GGUF | GGUF / llama.cpp | Cuantizaciones GGUF | No disponible | Apache-2.0 | Publicado |
| Qwen/Qwen3.8-27B | Transformers | BF16 | No disponible | No disponible | Modelo de origen, sin abliterar |

No hay datos publicados en la información disponible sobre parámetros, contexto o rendimiento de modelos alternativos de 27B de otros fabricantes que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo con la alineación de seguridad eliminada: la model card lo declara explícitamente como modelo de investigación con los rechazos mayoritariamente suprimidos.
- No apto para despliegue público ni para uso con usuarios finales sin una capa de moderación separada; el propio modelo no filtra sus salidas.
- Riesgo elevado de generación de contenido dañino, ilegal o inseguro si se usa sin control, precisamente por el efecto de la abliteración.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de tasa de alucinación para esta conversión.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingüe sin datos.
- Longitud de contexto: no disponible. La ventana real del modelo base no se documenta en la información proporcionada.
- Coste de razonamiento elevado: el modo thinking está activado por defecto y las peticiones técnicas pueden consumir entre 20.000 y 50.000 tokens, con el consiguiente impacto en latencia y memoria.
- Pérdida de calidad por cuantización: la compilación 4-bit solo coincide en el token superior con BF16 en el 90,0 % de los casos y eleva la perplejidad de 6,778 a 6,945; para usos sensibles conviene 8-bit o BF16.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la responsabilidad de cumplir la ley aplicable y las condiciones de la plataforma de destino recae en el usuario, según la propia model card.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validación independiente conocida.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo (los resultados obtenidos correspondían a productos de vapeo sin relación alguna), por lo que no hay fuentes externas que corroboren o amplíen la información del repositorio.
- Las estimaciones de memoria unificada de la sección de hardware son derivadas del tamaño de los pesos, no cifras publicadas por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated-MLX
- Modelo base (BF16, Transformers, con la metodología y las compuertas de publicación): https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated
- Variante FP8 para vLLM / SGLang: https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated-FP8
- Variante GGUF para llama.cpp: https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated-GGUF
- Modelo de origen sin abliterar: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados sin procesar de las comprobaciones del autor: carpeta ./results dentro del repositorio
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
