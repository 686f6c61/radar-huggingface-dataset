# Atomic-Germ/Gemma4-26B-A4B-Instruct-QAT-GGUF

## Resumen

Atomic-Germ/Gemma4-26B-A4B-Instruct-QAT-GGUF es una publicación de pesos GGUF derivada de OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2, a su vez una variante "abliterated" del Gemma 4 26B A4B instruct de Google sometida a entrenamiento con conciencia de cuantización (QAT) y posteriormente desquantizada. El repositorio lo publica el usuario Atomic-Germ, mientras que la model card atribuye la cuantización a mradermacher (campo quantized_by), con cuantizaciones de tipo imatrix (prefijo i1) y estáticas. El modelo tiene 25.233.142.046 parámetros reales según los pesos safetensors declarados, y la nomenclatura A4B del nombre apunta a una arquitectura de mezcla de expertos con unos 4B de parámetros activos por token, aunque la información disponible no confirma la arquitectura interna.

El problema que aborda es doble. Por un lado, ofrece una versión ejecutable en hardware de consumo mediante GGUF de un modelo de 25B que, por su naturaleza MoE, mantiene un coste de cómputo por token reducido. Por otro, elimina los mecanismos de rechazo del modelo original (etiquetas heretic, uncensored, decensored, abliterated), lo que lo hace relevante para investigación en seguridad, red teaming y generación de datos sintéticos sin filtros, y no tanto para despliegues de cara al público.

Es un modelo multimodal: el pipeline declarado es image-text-to-text y la model card indica que es un modelo de visión cuyos ficheros mmproj, si existen, se alojan en el repositorio estático del cuantizador. El soporte de idiomas se limita al inglés (en) y la licencia declarada en los metadatos es Apache-2.0, aunque el enlace de licencia apunta a la licencia específica de Gemma 4 de Google, una discrepancia relevante para uso comercial. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; la nomenclatura A4B del modelo base sugiere mezcla de expertos (MoE) sobre un transformer de la familia Gemma 4, sin confirmación en la información disponible |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura "A4B" del modelo base; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF imatrix (i1) y estáticas: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_K_S, Q4_K_M, Q4_0, Q4_1, además del fichero imatrix de calibración |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 en los metadatos, con enlace a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license); discrepancia no resuelta en la información disponible |
| Formato de pesos | GGUF (repositorio de solo GGUF, 18,1 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles publicados sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación del modelo original en la información proporcionada. La cadena de derivación sí es trazable: se parte de Gemma 4 26B A4B instruct (familia Gemma 4 de Google), se aplica entrenamiento con conciencia de cuantización en q4_0, se desquantiza a un checkpoint "unquantized" y sobre ese checkpoint se aplica un proceso de ablación de rechazos (heretic v2) que da lugar a la variante uncensored del repositorio OS-Software. Sobre ese resultado, el repositorio aquí descrito genera cuantizaciones GGUF adicionales.

Desde el punto de vista técnico, lo destacable es la doble o triple transformación numérica: QAT a q4_0, desquantización y nueva cuantización a GGUF con y sin matriz de importancia (imatrix). Cada paso introduce pérdida acumulada, especialmente en las cuantizaciones de 1 y 2 bits, donde la propia model card advierte de calidades bajas ("for the desperate", "very low quality"). El uso de imatrix permite calibrar la cuantización con estadísticas de activaciones, lo que en la práctica mejora la relación tamaño/calidad respecto a las cuantizaciones estáticas equivalentes. No se documentan innovaciones de decodificación, atención lineal ni mecanismos especulativos en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con el formato instruct propio de la familia Gemma.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita tareas de descripción, extracción y razonamiento sobre imágenes siempre que se cargue el fichero mmproj correspondiente.
- Generación de código y resolución de problemas técnicos, heredada del modelo base instruct; no hay evaluaciones publicadas que cuantifiquen este extremo en esta variante.
- Razonamiento multi-turno en inglés, con gestión de contexto conversacional.
- Modo sin restricciones: la ablación elimina los rechazos del modelo original, de modo que responde a peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades de audio: no disponibles.

## Casos de uso

- Red teaming y evaluación de seguridad: al carecer de mecanismos de rechazo, permite generar prompts adversarios, completar escenarios de jailbreak y medir la robustez de clasificadores de contenido desplegados en producción, comparando las respuestas con las del modelo Gemma 4 original.
- Investigación sobre ablación y alineación: sirve como punto de comparación directo frente al checkpoint OS-Software sin cuantizar y frente al Gemma 4 instruct original, para medir cuánto del comportamiento "uncensored" sobrevive a la cuantización a 1-4 bits.
- Generación de datos sintéticos para fine-tuning: la variante sin filtros produce continuaciones que los modelos alineados rechazan, útiles para construir datasets de dominios sensibles (ficción adulta, descripciones médicas explícitas, textos de seguridad ofensiva) que después se filtran y etiquetan.
- Procesamiento de documentos con componente visual: en su modo image-text-to-text puede describir capturas de pantalla, diagramas o formularios escaneados y convertirlos en texto estructurado en inglés, integrándose en pipelines de digitalización internos.
- Asistente local sin conexión: con cuantizaciones de 8-14 GB se puede ejecutar en una estación de trabajo con GPU de consumo, manteniendo los datos íntegramente en la máquina, lo que resulta adecuado para entornos con requisitos estrictos de privacidad o sin acceso a red.
- Prototipado rápido de aplicaciones conversacionales: gracias al bajo número de parámetros activos por token, es viable en un solo equipo para iterar sobre prompts, plantillas y flujos conversacionales antes de decidir si se migra a un modelo mayor o a una API externa.
- Evaluación de pipelines de cuantización: el repositorio ofrece una matriz amplia de cuantizaciones (de IQ1_S a Q4_1), lo que permite estudiar empíricamente el compromiso entre tamaño, velocidad y calidad para un modelo MoE de 25B.
- Traducción asistida inglés a otros idiomas: uso limitado y no recomendado como función principal, ya que el modelo solo declara inglés y no hay evidencia de capacidades multilingües en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni evaluaciones equivalentes, ni comparaciones numéricas con el modelo base o con el Gemma 4 original. Los resultados de búsqueda web asociados a esta consulta no contienen información relacionada con el modelo (corresponden a repositorios de mods de un simulador de agricultura), por lo que no aportan datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros GGUF listados van de 8,4 GB (i1-IQ1_S) a 14,0 GB (i1-IQ4_XS), y el repositorio completo ocupa 18,1 GB, por lo que las cuantizaciones altas (Q4_K_M y superiores) requieren del orden de 16-20 GB de VRAM.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4070 de 12 GB para cuantizaciones IQ2 e IQ3; RTX 4070 Ti Super, RTX 4080 o RTX 5080 de 16 GB para IQ4_XS; RTX 3090, RTX 4090 o RTX 5090 de 24 GB para Q4_K_M y cuantizaciones superiores sin offload; A100 de 40/80 GB y H100 para servir el modelo en FP16/BF16 o con lotes grandes.
- Cabe en GPU de consumo: sí, en el rango de 12 a 24 GB según la cuantización. Las cuantizaciones de 1 y 2 bits (8,4-10,7 GB) caben incluso en GPUs de 10-12 GB, con la advertencia de calidad que hace el propio autor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y LM Studio como envoltorios sobre llama.cpp, KoboldCpp, text-generation-webui y, para GGUF en servidor, los backends compatibles con llama.cpp. Los repositorios estáticos de mradermacher incluyen los ficheros mmproj necesarios para el modo visión, que no aparecen en el listado de este repositorio.
- Al ser un modelo con un número reducido de parámetros activos por token, el coste de cómputo por token es inferior al de un modelo denso de 25B, lo que se traduce en mayor velocidad de generación a igualdad de memoria; no obstante, no hay cifras de latencia o throughput publicadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atomic-Germ/Gemma4-26B-A4B-Instruct-QAT-GGUF (este) | 25,23B totales, ~4B activos (inferido) | No disponible | GGUF (imatrix y estático) | Apache-2.0 con enlace a licencia Gemma 4 | Repositorio HuggingFace, 18,1 GB, 0 descargas |
| OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2 (base) | No disponible en la informacion proporcionada | No disponible | Safetensors (checkpoint desquantizado) | No disponible | Repositorio HuggingFace del autor original |
| mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF (estático) | No disponible en la informacion proporcionada | No disponible | GGUF estático, incluye mmproj de visión | No disponible | Repositorio HuggingFace del cuantizador |
| Gemma 4 26B A4B instruct original (Google) | No disponible en la informacion proporcionada | No disponible | Safetensors | Licencia Gemma 4 | Distribución oficial de Google |

No se dispone de datos de benchmarks para ninguno de los modelos de la tabla en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de los mecanismos de rechazo implica que puede generar contenido dañino, ilegal o explícito sin filtros. No es adecuado para aplicaciones de cara al público sin una capa de moderación externa.
- Alucinación: no hay evaluaciones de fidelidad publicadas, y las cuantizaciones de 1 y 2 bits degradan notablemente la coherencia, lo que incrementa el riesgo de invención de hechos y de código incorrecto.
- Idioma: soporte declarado únicamente en inglés. El rendimiento en castellano u otras lenguas no está caracterizado y no debería asumirse.
- Licencia ambigua: los metadatos declaran Apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google, que impone condiciones de uso adicionales (entre ellas obligaciones de atribución y restricciones de uso). Antes de un uso comercial debe verificarse cuál prevalece, ya que la discrepancia no está resuelta en la información disponible.
- Pérdida acumulada por la cadena de transformaciones: QAT a q4_0, desquantización y nueva cuantización a GGUF introducen error numérico adicional respecto al modelo original. La propia model card califica algunas cuantizaciones como de calidad muy baja.
- Fecha de creación del repositorio (2026-09-20): debe verificarse, ya que puede condicionar la vigencia del modelo base y de sus dependencias.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar el comportamiento real.
- Visión condicionada: el modo imagen-texto requiere el fichero mmproj, que según la model card se aloja en el repositorio estático del cuantizador y no en este repositorio.
- Sin benchmarks: cualquier decisión de adopción en producción se toma sin datos de MMLU, HumanEval, GSM8K o evaluaciones multimodales, lo que obliga a realizar una evaluación propia antes de desplegar.
- Los resultados de búsqueda web asociados a esta consulta no contienen material técnico relevante sobre el modelo.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Atomic-Germ/Gemma4-26B-A4B-Instruct-QAT-GGUF
- Modelo base: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Repositorio de cuantizaciones estáticas de mradermacher: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF
- Repositorio de cuantizaciones imatrix de mradermacher: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-i1-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para el uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog técnico, repositorio de código y demo oficiales: no disponibles en la información proporcionada.
