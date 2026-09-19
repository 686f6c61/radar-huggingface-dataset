# alst10/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Este repositorio contiene una cuantización GGUF del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicada por el usuario alst10. Se trata, por tanto, de una redistribución cuantizada y no de un modelo entrenado desde cero: la model card indica explícitamente que fue generada de forma dinámica con el Space ROCmFPX y que el modelo base es la versión de DavidAU. El recuento real de parámetros asociado al repositorio es de 27.320.697.856 pesos (27,32 mil millones), con un tamaño de repositorio de 14,6 GB, coherente con una cuantización de aproximadamente 4 bits.

La relevancia de esta ficha es acotada y conviene ser explícito: no hay información pública sobre arquitectura, datos de entrenamiento, contexto máximo ni idiomas soportados. El interés del artefacto es fundamentalmente de despliegue, ya que introduce un formato de cuantización propietario (ROCmFP4, variante Q4_0_ROCMFP4_FAST) que requiere un fork específico de llama.cpp orientado a ROCm y hardware AMD, y no funciona con las compilaciones estándar de llama.cpp.

Adicionalmente, el nombre del modelo incluye las etiquetas "Heretic" y "Uncensored", propias de la convención de nomenclatura de DavidAU para variantes con alineamiento reducido (tipo abliterated). Esto es una indicación nominal, no una garantía documentada: no se aporta ninguna evaluación de seguridad, benchmarks ni descripción del proceso de entrenamiento o de modificación. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta; el nombre sugiere linaje Qwen, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0_ROCMFP4_FAST (formato ROCmFPX); no se listan otros niveles de cuantización en el repo |
| Idiomas soportados | no disponibles |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (cuantización ROCmFPX); el repositorio declara además un recuento de parámetros asociado a safetensors |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Tamaño del repositorio | 14,6 GB |
| Fecha de creacion en HuggingFace | 2026-09-19 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |
| Etiquetas relevantes | gguf, rocm, rocmfpx, amd, llama.cpp, endpoints_compatible, conversational |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ni sobre la del artefacto cuantizado. La model card del repositorio únicamente documenta el proceso de cuantización: "This model was dynamically quantized and generated using the ROCmFPX My Repo Space". No se especifica si se trata de un transformer denso, un MoE, un modelo híbrido ni qué mecanismos de atención emplea. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o cualquier otro ajuste por preferencias.

Lo único verificable técnicamente es el pipeline de cuantización: el artefacto se ha generado con ROCmFPX, un fork de llama.cpp mantenido por el usuario charlie12345, y emplea un esquema de cuantización denominado ROCmFP4 (la variante incluida se nombra Q4_0_ROCMFP4_FAST). Las instrucciones del repositorio indican compilar con `-DGGML_CUDA=OFF -DGGML_NATIVE=OFF`, lo que apunta a un backend ROCm/HIP para GPUs AMD. No se describe ninguna innovación en decodificación, atención o entrenamiento.

Respecto al linaje del modelo base, el nombre combina referencias a la familia Qwen con el sufijo de versión "3.8" y una cadena de etiquetas propias de los merges de DavidAU ("TURBO", "Fable", "Cold-Fusion", "Heretic", "Uncensored", "NM-DAU"). No hay documentación que permita confirmar qué modelo original se usó, qué merges se aplicaron ni qué técnicas de reducción de alineamiento (por ejemplo, abliteration) se emplearon.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational`, lo que indica uso previsto de diálogo multi-turno en formato chat.
- Compatibilidad declarada con endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede servirse a través de infraestructura de endpoints compatible, aunque no se detalla el procedimiento.
- Razonamiento, matemáticas y código: no disponible. No hay ninguna evaluación ni declaración al respecto.
- Tool calling / function calling: no disponible. No se documenta soporte de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. El repositorio no declara lista de idiomas.
- Visión, audio u otras modalidades: no disponible; el repositorio solo contiene pesos GGUF de texto según las etiquetas.
- Modo "thinking" explícito: no disponible.
- Comportamiento con contenido sensible: el nombre incluye "Heretic" y "Uncensored", lo que en la convención del autor sugiere un filtrado de rechazo reducido, pero no existe documentación técnica que lo respalde ni que cuantifique el efecto.

## Casos de uso

- Escritura creativa y narrativa sin rechazos excesivos: el nombre del modelo apunta a una variante con rechazo reducido, lo que resulta útil en generación literaria, guiones o ficción donde los sistemas alineados de forma estándar tienden a bloquear contenido legítimo. Debe validarse empíricamente antes de asumirlo.
- Evaluación de guardarraíles y red teaming: disponer de una variante local de 27B con alineamiento presumiblemente reducido permite probar clasificadores de contenido, filtros de moderación y políticas de seguridad en un entorno controlado, sin depender de APIs externas.
- Asistente conversacional local en hardware AMD: con 14,6 GB de pesos en Q4, el modelo cabe en GPUs de consumo de gama alta con 16-24 GB de VRAM, lo que permite desplegar un chat privado sin enviar datos a terceros.
- Generación de datos sintéticos para ajuste: un modelo de 27B cuantizado puede producir corpus de texto (diálogos, instrucciones, respuestas) para experimentos de destilación o aumento de datos, ejecutándose en local y con coste marginal nulo por token.
- Prototipado de pipelines de chat multi-turno: la etiqueta `conversational` y el formato GGUF permiten montar rápidamente un servicio de conversación sobre el fork ROCmFPX de llama.cpp para probar prompts de sistema, plantillas de chat y longitudes de contexto reales antes de invertir en infraestructura mayor.
- Procesamiento de texto sensible en local: en entornos con requisitos de confidencialidad (legal, sanitario, industrial), el modelo puede ejecutarse íntegramente en una máquina propia sin tráfico de red, siempre que se asuma la ausencia de garantías de calidad documentadas.
- Pruebas de compatibilidad de formatos de cuantización: el artefacto sirve como caso de prueba para validar el soporte de ROCmFP4 en despliegues AMD, comparando rendimiento y perplejidad frente a cuantizaciones GGUF estándar del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y los resultados de búsqueda web devueltos no guardan relación con el modelo (son ofertas de empleo en el sector educativo). Tampoco se aportan datos de perplejidad de la cuantización ROCmFP4 frente al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio tiene 14,6 GB de pesos en cuantización de ~4 bits, por lo que se necesitan aproximadamente 15-17 GB de VRAM para descargar todos los tensores en GPU, más la caché KV (que depende del contexto configurado). En FP16 el mismo modelo requeriría del orden de 55 GB, pero ese formato no se distribuye en este repositorio.
- GPU recomendadas: el repositorio está orientado a AMD por sus etiquetas `rocm`, `amd` y `rocmfpx`. Son adecuadas las Radeon Pro y las Instinct con soporte ROCm, así como GPUs Radeon de consumo recientes con suficiente VRAM. En el lado NVIDIA no está documentado que el fork ROCmFPX funcione, ya que las instrucciones de compilación desactivan CUDA (`-DGGML_CUDA=OFF`).
- ¿Cabe en GPU de consumo? Con 14,6 GB de pesos, sí cabe en tarjetas de 16 GB o más, aunque en 16 GB el margen para caché KV es muy estrecho. En tarjetas de 24 GB (por ejemplo, clase RTX 3090/4090 o Radeon equivalentes) hay holgura razonable para contextos moderados. En tarjetas de 8-12 GB sería necesario descargar capas a CPU, con la penalización de velocidad correspondiente.
- Opciones de despliegue: el propio repositorio indica que se debe usar el fork ROCmFPX de llama.cpp (github.com/charlie12345/ROCmFPX) y que las compilaciones estándar de llama.cpp no soportan los formatos ROCmFPX. La secuencia documentada es `git clone --depth 1`, `cmake -B build -G Ninja -DGGML_CUDA=OFF -DGGML_NATIVE=OFF`, `cmake --build build --target llama-cli -j` y ejecución con `llama-cli`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros servidores, y la etiqueta `endpoints_compatible` no viene acompañada de instrucciones.
- Latencia y throughput estimados: no disponible. No se publican medidas de tokens por segundo ni de latencia por petición para esta cuantización.

## Comparativa con modelos similares

La información disponible no permite establecer una comparativa fiable con modelos de la misma categoría, ya que no se documentan arquitectura, contexto, idiomas ni resultados de benchmarks de este artefacto. La comparación más directa posible es contra su propio modelo base y contra otras cuantizaciones del mismo, que tampoco están documentadas aquí.

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| alst10/...-NM-DAU (este repositorio) | 27,32 mil millones | no disponible | GGUF ROCmFP4 | CC BY 4.0 | 0 descargas, 0 likes; requiere fork ROCmFPX de llama.cpp |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible en la información proporcionada | Artefacto de origen sobre el que se aplica la cuantización |
| Otros modelos de ~27B de código abierto | no disponible en la información proporcionada | no disponible | no disponible | no disponible | No se han incluido alternativas en la información disponible |

No se dispone de datos para comparar rendimiento con alternativas de tamaño similar (por ejemplo, otros modelos de 24-32B ampliamente desplegados), por lo que cualquier afirmación al respecto sería especulativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican arquitectura, datos de entrenamiento, contexto máximo, idiomas ni metodología de ajuste. Cualquier decisión de producción basada en este artefacto se tomaría a ciegas.
- Ausencia de benchmarks: no hay ninguna métrica de calidad publicada, ni propia ni comparativa frente al modelo sin cuantizar, por lo que se desconoce la degradación introducida por la cuantización ROCmFP4.
- Riesgo de alucinación: no cuantificado ni evaluado. Al tratarse de una variante "uncensored", es esperable que el modelo no decline generar contenido sin base factual, pero no existe ninguna medición que lo confirme.
- Sesgos: no evaluados ni documentados. Los merges y ajustes de alineamiento reducido pueden alterar el comportamiento del modelo en temas sensibles de forma impredecible y sin trazas de auditoría.
- Riesgo de contenido inapropiado: el nombre declara explícitamente "Heretic" y "Uncensored", lo que indica la intención de reducir los rechazos del modelo. Esto lo hace inadecuado para aplicaciones orientadas al público sin una capa de moderación externa.
- Dependencia de un fork no estándar: el formato ROCmFP4 solo es compatible con el fork ROCmFPX de llama.cpp. Esto limita las opciones de despliegue (no hay soporte documentado en vLLM, TGI, Ollama ni llama.cpp upstream), complica el mantenimiento y añade riesgo en la cadena de suministro de software.
- Compatibilidad de hardware restringida: la compilación documentada desactiva CUDA, por lo que el artefacto está orientado a ROCm/AMD. No se garantiza su funcionamiento en GPUs NVIDIA ni en CPU.
- Restricciones de licencia: el repositorio se distribuye bajo CC BY 4.0, que exige atribución. La propia model card advierte de que hay que respetar además las restricciones de licencia del modelo base, cuya licencia no se detalla en la información disponible. Conviene verificar la licencia del modelo original antes de cualquier uso comercial.
- Falta de validación comunitaria: 0 descargas y 0 likes. El repositorio fue creado y actualizado con menos de un minuto de diferencia, lo que sugiere una publicación automatizada sin revisión posterior.
- Metadatos inconsistentes: el repositorio es GGUF, pero se declara un recuento de parámetros asociado a safetensors; además, las fechas de creación y actualización (septiembre de 2026) son posteriores a la fecha de consulta habitual, lo que indica posible ruido en los metadatos.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en ningún otro idioma concreto sin pruebas propias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alst10/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base en HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Space de cuantización ROCmFPX utilizado: https://huggingface.co/spaces/alst10/ROCmFPX-my-repo
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a ofertas de empleo sin relación con el artefacto). No se dispone de papers, blogs ni demos adicionales.
