# mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-i1-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-i1-GGUF` es una recopilación de cuantizaciones en formato GGUF generadas por el usuario mradermacher a partir del modelo `khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles. El modelo subyacente cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones), según los datos reales de safetensors.

El interés principal de esta publicación es práctico: ofrece tanto cuantizaciones estándar (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q4_0, Q4_1) como cuantizaciones de tipo I-quant (IQ1_S, IQ2_XXS, IQ4_XS, entre otras) generadas con matriz de importancia (imatrix), lo que permite reducir el peso del modelo hasta aproximadamente el 20-25 % del tamaño en FP16 con pérdidas de calidad progresivamente mayores. El tamaño total del repositorio es de 39,5 GB, lo que refleja la suma de todas las variantes incluidas.

La relevancia de esta ficha es limitada por la falta de información publicada: la model card del repositorio no incluye licencia, idiomas, benchmarks ni detalles de entrenamiento, y el propio autor solo documenta los parámetros de cuantización y el modelo de origen. El repositorio registra cero descargas y cero valoraciones en el momento de la consulta, y fue creado y actualizado el 16 de septiembre de 2026. Cualquier evaluación en producción debería partir de la model card del modelo original, no de esta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no confirmada; el identificador del modelo sugiere linaje Qwen3, sin verificar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q4_0, Q4_1, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos en formato HuggingFace, `convert_type: hf`) |
| Metodo de cuantizacion | weighted / imatrix (`quantize_version: 2`, `output_tensor_quantised: 1`) |
| Modelo de origen | khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled |
| Tamano del repositorio | 39,5 GB (suma de todas las variantes) |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en los materiales proporcionados. El identificador `Qwen3.8-27B-Fable-5-Coding-Distilled` apunta a un modelo de la familia Qwen3 (probablemente un transformer decoder-only) sometido a un proceso de destilación orientado a código y posiblemente a un merge o fine-tuning identificado como "Fable-5", pero ninguno de estos extremos está confirmado en la información disponible. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o destilación supervisada.

La innovación técnica que sí está documentada es la del propio repositorio: las cuantizaciones se han generado con ponderación por matriz de importancia (imatrix), un método que estima la relevancia de cada tensor a partir de activaciones observadas en un corpus de calibración y asigna más bits a los pesos más sensibles. Esto mejora la relación calidad/tamaño respecto a la cuantización uniforme, especialmente en los niveles agresivos (IQ2, IQ3). Para el resto de detalles de arquitectura y entrenamiento, consúltese la model card del repositorio original.

## Capacidades

La información disponible solo permite afirmar lo siguiente, sin extrapolaciones:

- Generación de texto de tipo conversacional: el repositorio está etiquetado como `conversational`.
- Especialización en código: el nombre del modelo de origen incluye "Coding-Distilled", lo que indica un ajuste orientado a tareas de programación, aunque no se detallan las capacidades concretas.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, orientada a su uso en infraestructura de despliegue de HuggingFace.
- Inferencia local eficiente: al estar en GGUF, soporta ejecución en CPU, GPU y configuraciones híbridas mediante llama.cpp y derivados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Razonamiento matemático: no disponible.

## Casos de uso

- Asistencia de código en local sin conexión: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo y ofrecer autocompletado y generación de funciones sin enviar el código fuente a servicios externos, algo crítico en entornos con requisitos de confidencialidad.
- Revisión de código en pull requests: integrado en un pipeline de CI, el modelo puede analizar diffs y generar comentarios sobre posibles errores, malas prácticas o ausencia de manejo de errores antes de la revisión humana.
- Generación de pruebas unitarias: a partir de una función o módulo, el modelo puede producir esqueletos de tests que el equipo complete después, reduciendo el trabajo repetitivo en proyectos con cobertura baja.
- Migración de código entre lenguajes o versiones de framework: traducción de fragmentos de, por ejemplo, Python 2 a Python 3 o de una librería obsoleta a su sucesora, en lotes procesados localmente.
- Asistente conversacional técnico interno: con la etiqueta `conversational` y un despliegue en servidor propio, puede actuar como chatbot de soporte para dudas de documentación interna, siempre que se validen sus respuestas.
- Prototipado en hardware de consumo: las variantes IQ2/IQ3 permiten ejecutar un modelo de 27,3 B en equipos con 12-16 GB de VRAM o incluso en CPU con RAM suficiente, lo que facilita experimentación sin acceso a clústeres.
- Investigación sobre cuantización: el repositorio es útil como material de estudio para comparar la degradación de calidad entre cuantizaciones uniformes y cuantizaciones ponderadas por imatrix en un mismo modelo.
- Base para fine-tuning posterior: al proceder de pesos en formato HuggingFace, la línea de trabajo puede continuar con el modelo original en FP16/BF16 para ajustes específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantizaciones ni los resultados de búsqueda consultados aportan cifras de MMLU, HumanEval, GSM8K, MBPP o similares, ni para el modelo original ni para las variantes cuantizadas. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

Las estimaciones siguientes se derivan exclusivamente del número de parámetros (27,3 B) y del tamaño de archivo esperable para cada cuantización; no proceden de mediciones publicadas por el autor.

- VRAM estimada solo para pesos (sin caché KV ni overhead de runtime):
  - IQ1_S / IQ1_M: aproximadamente 6-7 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: aproximadamente 8-9,5 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 10,5-13,5 GB.
  - IQ4_XS / small-IQ4_NL / Q4_K_S / Q4_0 / Q4_1: aproximadamente 14-15,5 GB.
  - Q4_K_M: aproximadamente 16-17 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 18-20 GB.
  - Q6_K: aproximadamente 22-23 GB.
- La caché KV crece de forma lineal con la longitud de contexto y el número de capas; dado que la ventana de contexto no está documentada, debe reservarse margen adicional.
- GPU de consumo: las variantes Q4_K_M y Q5_K_M caben en tarjetas de 24 GB (RTX 3090, RTX 4090, RX 7900 XTX) con contexto moderado. Las variantes IQ3 y Q3_K encajan en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 3080 Ti) con offload parcial. Las variantes IQ2 pueden ejecutarse en tarjetas de 12 GB con offload parcial a RAM.
- GPU profesionales: A100 40/80 GB, H100, L40S y similares permiten ejecutar Q6_K o incluso pesos de mayor precisión con contexto amplio, aunque el formato GGUF no es el óptimo para estos aceleradores.
- CPU: con 32-64 GB de RAM es viable ejecutar las variantes IQ2-IQ4 en CPU, con velocidad de generación muy inferior a GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, KoboldCpp, text-generation-webui y llama-cpp-python. vLLM y TGI soportan GGUF solo de forma parcial o experimental, por lo que no son la vía recomendada para este repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-i1-GGUF | 27,3 B | no disponible | GGUF (24 cuantizaciones, imatrix) | no disponible | Publicado, 0 descargas |
| khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled | 27,3 B (según el derivado) | no disponible | safetensors / HuggingFace | no disponible | Publicado |
| Otras alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia que permitan una comparación sustantiva con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de información de licencia: no puede asumirse que el uso comercial esté permitido. Debe consultarse la licencia del modelo original `khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled` antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce si el modelo tiene un soporte multilingüe suficiente para aplicaciones en castellano.
- Ventana de contexto desconocida: imposible planificar tareas de contexto largo o de análisis de repositorios completos sin verificarla experimentalmente.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; en tareas de código, una alucinación puede traducirse en APIs inexistentes o dependencias inventadas.
- Degradación por cuantización: las variantes IQ1, IQ2 y Q2_K implican pérdidas de calidad notables, especialmente en razonamiento y seguimiento de instrucciones. Para uso serio se recomienda Q4_K_M o superior.
- Modelo derivado no verificado: se trata de una redistribución de un tercero, con 0 descargas y 0 valoraciones; no hay validación independiente de que las cuantizaciones se hayan generado correctamente ni de la calidad del modelo base.
- Sesgos: no disponible. No hay ninguna evaluación de sesgos publicada para este modelo o su origen.
- Trazabilidad limitada del proceso de destilación: al no documentarse el dataset ni el método, no puede auditarse qué datos de código se usaron, con las implicaciones de licencia que ello conlleva.
- Fecha de publicación futura respecto al conocimiento habitual: el repositorio está fechado en septiembre de 2026, lo que dificulta contrastar su contenido con fuentes externas.
- Formato GGUF exclusivamente: no puede cargarse directamente con `transformers` ni con la mayoría de frameworks de entrenamiento; requiere llama.cpp o conversión previa.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-i1-GGUF
- Modelo de origen: https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en los resultados de búsqueda proporcionados.
