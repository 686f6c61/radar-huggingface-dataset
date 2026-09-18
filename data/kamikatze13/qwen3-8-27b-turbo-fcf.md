# kamikatze13/Qwen3.8-27B-TURBO-FCF

## Resumen

Qwen3.8-27B-TURBO-FCF es un repositorio de cuantizaciones GGUF publicado por el usuario kamikatze13 a partir del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. El modelo subyacente tiene 26.895.998.464 parámetros (unos 26,9B) y pertenece a la familia Qwen3, según declara el propio autor. Se distribuye bajo licencia Apache 2.0 y declara soporte de inglés y chino.

El objetivo declarado del ajuste es reducir el consumo de tokens de razonamiento entre la mitad y una décima parte respecto al "Qwen3.8 27B" de referencia, manteniendo el detalle de las respuestas, y mejorar a la vez el rendimiento en razonamiento, código, escritura creativa y roleplay. El autor lo describe como un ajuste multi-etapa, multi-modelo y multi-merge, entrenado con Unsloth y con los métodos propietarios COLD FUSION (GAIN + Unsloth) y Fable Fusion 711.

La relevancia práctica del repositorio es que empaqueta el modelo en cuantizaciones de 4 y 8 bits con doble imatrix, además de variantes MTP (multi-token prediction), pensadas para ejecución en hardware de consumo. Conviene señalar que la nomenclatura "Qwen3.8" no corresponde a ninguna familia oficial publicada por Alibaba/Qwen según la información disponible, y que todas las cifras de rendimiento proceden de la model card del autor, sin verificación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; se deriva de la familia Qwen3, presumiblemente transformer decoder) |
| Parametros totales | 26.895.998.464 (~26,9B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF "regulares" y GGUF MTP (multi-token prediction), con doble imatrix (DI-MATRIX); mencionadas variantes de 4 bits (por ejemplo Q4KS) y 8 bits; modelo base en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors / bfloat16) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 389,0 GB |
| Datasets de ajuste | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. El modelo se presenta como un derivado de la familia Qwen3 y el recuento de parámetros (26,9B) apunta a un modelo denso, aunque no hay confirmación explícita ni datos de número de capas, cabezas de atención, tipo de atención o vocabulario. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales, pero la model card no documenta ninguna tarea de visión, por lo que ese extremo queda sin confirmar.

El entrenamiento se describe como un proceso multi-etapa ("multi-stage tuned"), multi-ajuste y multi-merge, realizado con Unsloth sobre hardware de consumo. El autor menciona dos metodologías propias: COLD FUSION, que combina un componente llamado GAIN con los entrenadores de Unsloth y modifica dinámicamente el entrenamiento por muestra en tiempo real, y Fable Fusion 711. También se indica el uso de los datasets Polar-STRICT y F451-STRICT, y se etiqueta el modelo como "heretic", "uncensored" y "abliterated", lo que implica la eliminación o atenuación de las capas de rechazo propias del ajuste por alineamiento. No se especifican recuentos de tokens de entrenamiento, composición detallada del dataset, ni si se emplearon RLHF, DPO u otras técnicas de optimización por preferencias.

La innovación que el autor destaca es la reducción del bloque de razonamiento (de 1/2 a 1/10 del tamaño, con una mediana en torno a 2/3 de reducción) en los tres modos de pensamiento del modelo, junto con un supuesto aumento de velocidad en generación de tokens, especialmente en las variantes MTP. No se aportan mediciones de latencia ni de throughput.

## Capacidades

- Generación de texto general y conversación multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento explícito (thinking), con bloques de razonamiento supuestamente más cortos que los del modelo de referencia.
- Generación de código, según la etiqueta "coder" y la descripción del autor.
- Escritura creativa, narrativa de ficción, relato y roleplay en "todos los géneros", con énfasis en alto nivel de detalle.
- Tool calling / function calling: la model card afirma, sin datos verificables, que la sección "community" recoge "el mejor rendimiento en tool calling registrado".
- Capacidades multimodales: el pipeline declarado es image-text-to-text, pero no se documenta ninguna tarea de imagen en el texto disponible.
- Comportamiento sin rechazos ("uncensored" / "abliterated"): el modelo no aplica las restricciones de contenido habituales de los modelos alineados.
- Cuantizaciones MTP orientadas a acelerar la decodificación mediante predicción multi-token.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está ajustado específicamente para ficción, relato y desarrollo de tramas, con énfasis declarado en el detalle y en la generación de ganchos narrativos; resulta adecuado para borradores de novelas, guiones y contenido serializado.
- Roleplay y personajes conversacionales: el ajuste sin censura y la orientación a "todos los géneros" permiten mantener personajes consistentes en diálogos extensos, algo que los modelos con alineamiento estricto suelen rechazar.
- Asistencia a la escritura técnica y de marketing: reducción del bloque de razonamiento implica respuestas más rápidas en tareas de reescritura, resumen y adaptación de tono, con menor coste de tokens por petición.
- Generación de código en local: con cuantizaciones de 4 bits ejecutables en GPU de consumo, puede integrarse como asistente de autocompletado o revisión dentro de un editor, sin enviar código a servicios externos.
- Agentes y automatización de flujos: si se confirma el soporte de tool calling, podría emplearse como planificador en pipelines de agentes que invocan APIs o scripts, siempre con validación humana de las acciones.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en GGUF sobre hardware propio, es apto para procesar documentación sensible o interna en inglés o chino sin conexión a internet.
- Investigación sobre desalineamiento y seguridad: sirve como objeto de estudio para medir el efecto del abliteration sobre el comportamiento, la calidad y los sesgos de un modelo de ~27B.
- Prototipado de producto multilingüe en inglés y chino: traducción, resumen y generación de contenido para mercados anglófono y sinófono, siempre que no se requiera un tercer idioma.

## Benchmarks y rendimiento

La model card incluye afirmaciones de rendimiento que no van acompañadas de metodología pública ni de verificación independiente. Se reproducen a continuación tal cual, como datos declarados por el autor:

| Metrica | Valor declarado | Nota |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; "144 puntos por encima de Qwen 3.8 27B" |
| ARC-C (4 bits) | 719 | Afirmado por el autor; "por encima de 718" |
| ARC-E | más de 880 | Afirmado por el autor |
| Comparativa con el base | supera al Qwen 3.8 27B en "los 7 benchmarks críticos" | No se listan los 7 benchmarks ni sus valores |
| Comparativa con otros modelos | supera a Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B en los mismos 7 benchmarks | No se aportan cifras |
| Tool calling | "mejor rendimiento en tool calling registrado" | Afirmación sin datos ni fuente |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro benchmark estándar con cifras verificables. La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (únicamente páginas genéricas de edición de PDF), por lo que no existe corroboración externa.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros (26,9B) y no proceden de la model card:

- Inferencia en 4 bits: aproximadamente 14-17 GB de VRAM, más el overhead de contexto y caché KV.
- Inferencia en 8 bits: aproximadamente 27-30 GB de VRAM.
- Inferencia en bfloat16: aproximadamente 54 GB de VRAM (solo para pesos), por lo que requiere múltiples GPU o memoria unificada de gran capacidad.
- GPU de consumo: las cuantizaciones de 4 bits caben en una RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) o en un Mac con memoria unificada de 24 GB o más; las de 8 bits exigen 32 GB o más.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB para las variantes de 8 bits y bfloat16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui para GGUF. El soporte de las variantes MTP depende de que el runtime implemente decodificación multi-token; no se detalla en la información disponible qué versiones concretas lo soportan. vLLM puede cargar GGUF, pero su compatibilidad con esta cuantización concreta no está documentada.
- Latencia y throughput: no disponibles. El autor afirma mejoras de velocidad por la reducción de tokens de razonamiento, sin aportar medidas.
- Almacenamiento: el repositorio completo ocupa 389 GB, por lo que conviene descargar únicamente el archivo de cuantización necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-FCF | ~26,9B (sin parámetros activos declarados) | no disponible | apache-2.0 | en, zh | Cuantizaciones GGUF regulares y MTP; sin benchmarks verificables |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882 (modelo base) | ~26,9B | no disponible | apache-2.0 (según el repo derivado) | en, zh | Origen del ajuste; sin censura y con el mismo enfoque de reducción de razonamiento |
| Qwen3-32B (referencia de familia, denso) | 32,8B | 32K nativo, ampliable a 128K con YaRN | apache-2.0 | multilingüe | Modelo oficial de la familia Qwen3; benchmarks públicos y verificables |
| Qwen3-30B-A3B (referencia de familia, MoE) | 30,5B totales, ~3,3B activos | 32K nativo, ampliable a 128K con YaRN | apache-2.0 | multilingüe | Alternativa MoE con mucho menor coste de inferencia por token |

La comparación de rendimiento con estos modelos no es posible con la información disponible: las únicas cifras son las declaradas por el autor, sin metodología ni reproducción independiente, y el resto de modelos no comparten métricas publicadas en el mismo formato (ARC-C y ARC-E en lugar de MMLU, HumanEval o GSM8K).

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": las capas de rechazo han sido eliminadas o atenuadas, por lo que puede generar contenido ofensivo, violento, sexual o ilegal sin filtros. No es apto para aplicaciones orientadas al público general sin moderación adicional.
- Riesgo elevado de alucinación: los ajustes orientados a creatividad y la eliminación del alineamiento suelen aumentar la confianza en afirmaciones no verificadas. No debe usarse como fuente factual sin validación.
- Idiomas limitados a inglés y chino: no hay soporte declarado de español, ni de ningún otro idioma, más allá de la capacidad residual del modelo base.
- Longitud de contexto no documentada: se desconoce la ventana real de contexto, lo que impide planificar cargas de trabajo con documentos largos.
- Cifras de rendimiento no verificadas: los valores de ARC-C y ARC-E (735 y 719) y las afirmaciones sobre tool calling proceden únicamente de la model card, sin metodología, sin datos brutos y sin replicación independiente. El propio autor menciona el riesgo de "benchmaxing", lo que refuerza la necesidad de cautela.
- Nomenclatura engañosa: la denominación "Qwen3.8" y las referencias a "Qwen3.6" y "Qwen3.5" no corresponden a familias oficiales publicadas por Qwen según la información disponible; conviene no confundir este ajuste con un modelo oficial.
- Discrepancia de modalidad: el pipeline declarado es image-text-to-text, pero no se documenta ninguna capacidad de visión. No debe asumirse soporte multimodal.
- Cuantizaciones agresivas: las variantes de 4 bits pueden degradar la coherencia en razonamiento largo y en tool calling respecto a la versión bfloat16.
- Licencia: el repositorio se publica como apache-2.0, lo que en principio permite uso comercial, pero el modelo deriva de una cadena de ajustes de terceros cuyos términos conviene revisar antes de un despliegue en producción.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin validación por parte de la comunidad.
- Repositorio de 389 GB: el almacenamiento y el ancho de banda necesarios para clonarlo completo son considerables; seleccione únicamente el archivo GGUF que vaya a utilizar.
- Sin resultados de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas, lo que dificulta comparar el modelo con alternativas consolidadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kamikatze13/Qwen3.8-27B-TURBO-FCF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Modelo antecesor del método COLD FUSION (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth

Nota sobre la búsqueda web: los resultados obtenidos corresponden a herramientas genéricas de edición de PDF (iLovePDF, Sejda, Smallpdf, Adobe) y no guardan relación con este modelo. No se ha encontrado ninguna publicación, paper, blog o demo independiente que documente o evalúe Qwen3.8-27B-TURBO-FCF.
