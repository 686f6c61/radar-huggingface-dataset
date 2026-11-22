# DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI

## Resumen

Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI es un fine-tune comunitario desarrollado por DavidAU sobre el modelo base thinkingmachines/Inkling-2-Mini. Se trata de una variante "abliterated" y "uncensored", es decir, con los mecanismos de rechazo y alineación de seguridad eliminados o atenuados, orientada a usos creativos, roleplay y generación de contenido sin restricciones de contenido. El autor la presenta como una versión "Turbo-Brilliance" con modos de razonamiento e instrucción extendidos.

El modelo se distribuye como un Mixture of Experts (MoE) de 26B de parámetros (según el nombre del repositorio) con capacidad multimodal image-text-to-text, y declara soporte para inglés y chino. La ficha del autor menciona 27 modos de razonamiento, 27 modos de instrucción, 15 "AI Constructs" y 21 "AGI Constructs", así como 9 modos de razonamiento "Xhigh", aunque no se aportan especificaciones técnicas verificables sobre estos modos en la información disponible.

La relevancia de este modelo es limitada y de nicho: se publica bajo licencia Apache 2.0 pero con acceso restringido (gated) en Hugging Face, sin descargas ni interacciones registradas en el momento de la consulta, y con un tamaño de repositorio de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el repositorio es meramente declarativo. No se dispone de datos de benchmarks ni de documentación técnica del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), según tags del autor; detalles no disponibles |
| Parámetros totales | 26B (según nombre del repositorio); no confirmado en documentación |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (precisión declarada: bfloat16) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo reporta 0.0 GB) |

## Arquitectura y entrenamiento

El modelo base es thinkingmachines/Inkling-2-Mini, del que no se proporcionan detalles arquitectónicos en la información disponible. El autor etiqueta el fine-tune como MoE ("mixture of experts") y declara precisión bfloat16, pero no se especifica el número de expertos, el tamaño de los mismos, la longitud de contexto nativa ni la composición del dataset de entrenamiento.

El proceso de fine-tune se describe mediante etiquetas como "heretic", "uncensored" y "abliterated", que en la práctica comunitaria indican la eliminación de direcciones de activación asociadas al rechazo de peticiones (abliteration) y un ajuste adicional orientado a eliminar filtros de contenido. Se menciona también "NEO Imatrix", probablemente referido a una matriz de importancia para cuantización, aunque no se detalla su uso. No hay información sobre volumen de tokens de entrenamiento, uso de RLHF/DPO ni innovaciones técnicas verificables.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Procesamiento multimodal image-text-to-text (entrada de imagen y texto), según el pipeline declarado.
- Modos de razonamiento e instrucción múltiples (el autor declara 27 + 27), sin documentación técnica que los describa.
- "AI Constructs" y "AGI Constructs" (15 y 21 respectivamente): terminología propia del autor sin definición técnica pública.
- Orientación a escritura creativa, ficción, todos los géneros y roleplay.
- Capacidad de código declarada vía tag "coder".
- Sin confirmación de soporte de tool calling, function calling ni razonamiento multi-paso con agentes más allá de las etiquetas del autor ("Agent AI Construct").
- Modo "thinking" declarado en tags, sin especificación de formato.

## Casos de uso

- Escritura creativa y ficción sin restricciones de contenido: el ajuste "uncensored" permite generar narrativa en géneros que los modelos alineados suelen rechazar; adecuado para autores que necesitan explorar temas sensibles en un entorno controlado.
- Roleplay y personajes conversacionales: la orientación explícita a roleplay y los múltiples "modos" declarados permiten mantener personajes con estilos definidos, aunque la ausencia de documentación obliga a validación empírica.
- Generación de descripciones a partir de imágenes: al ser image-text-to-text, puede emplearse para captioning o descripción detallada de imágenes en inglés o chino.
- Prototipado de asistentes para investigación sobre alineación: útil como caso de estudio de modelos abliterated para comparar comportamientos frente a versiones alineadas.
- Traducción y generación bilingüe inglés-chino en contextos donde el contenido no requiera filtros corporativos.
- Experimentación académica con MoE de 26B: permite estudiar el efecto de fine-tunes comunitarios sobre un modelo base, siempre que se obtengan los pesos (acceso gated).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26B × 2 bytes), más overhead de activaciones y KV cache; se requieren GPUs de 80 GB (A100, H100) para inferencia cómoda en precisión completa.
- En cuantización de 8 bits: ~26 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas u offloading parcial.
- En cuantización de 4 bits: ~13-15 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o más, siempre que existan pesos GGUF (no confirmados).
- Opciones de despliegue: no se documentan; por el formato declarado (bfloat16) se asume compatibilidad con transformers, vLLM o TGI, pero no está verificado. llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI | 26B (MoE, declarado) | no disponible | Apache 2.0 | Gated | Fine-tune uncensored, sin benchmarks |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del fine-tune |
| Alternativas uncensored de la comunidad | variable | variable | variable | variable | No se dispone de datos comparables verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": no aplica filtros de seguridad, por lo que puede generar contenido dañino, ilegal o sesgado; no apto para producción orientada al público sin capas de moderación externas.
- Riesgo elevado de alucinación: sin benchmarks ni documentación de entrenamiento, no hay evidencia de fiabilidad factual.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Repositorio con 0.0 GB y 0 descargas: los pesos podrían no estar disponibles o el repositorio ser incompleto; verificar antes de cualquier uso.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para uso comercial o automatizado.
- Terminología del autor ("AGI Constructs", "Turbo-Brilliance", "50X") sin respaldo técnico verificable; tratarla como marketing y no como especificación.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- Sin información sobre sesgos específicos medidos; se asume herencia de sesgos del modelo base y del corpus de fine-tune.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Perfil del autor: https://huggingface.co/DavidAU
