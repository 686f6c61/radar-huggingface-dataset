# mradermacher/LFM2-2.6B_ZERO_Refusal-GGUF

tokens) for complex or multilingual prompts." Esto puede ser útil para entender la arquitectura, pero no sé si el modelo ZERO_Refusal tiene exactamente lo mismo. Sin embargo, puedo mencionar que pertenece a la familia LFM2.

El problema: la información es limitada. No se dan datos sobre arquitectura exacta, contexto, entrenamiento, benchmarks. Debo indicar "no disponible" donde no haya datos. Debo usar el conocimiento de que LFM2 es una familia de modelos de Liquid AI. LFM2-2.6B probablemente sea un modelo híbrido o MoE? Debo ser cuidadoso y no inventar.

Basado en el nombre "LFM2" y el resultado de LiquidAI, puedo inferir que es un modelo de la familia Liquid Foundation Models 2. Liquid AI es conocido por modelos con arquitecturas híbridas basadas en SSM/transformer, y LFM2 podría ser un modelo con "dynamic hybrid reasoning". Pero no tengo especificaciones concretas. Debo indicar "no disponible" para la arquitectura si no está explícita.

Sin embargo, el modelo tiene 2.569.272.320 parámetros totales, que son ~2.6B. El modelo base es de OpenIntelligenceNet, no de LiquidAI. Aunque el nombre LFM2 sugiere que es de la familia LFM2. En la búsqueda, "LiquidAI/LFM2-2.6B" es de LiquidAI. Quizás OpenIntelligenceNet es un fork o adaptación. No puedo confirmar la arquitectura. Debo poner "no disponible" en la fila de arquitectura si no hay información explícita. Aunque el nombre del modelo incluye "LFM2", que podría indicar que es de la familia Liquid Foundation Models 2. Pero no hay detalles.

Las reglas dicen: NO inventes datos. Si algo no está en la información proporcionada, indica explícitamente "no disponible". Así que debo ser conservador.

Reviso la información proporcionada:

- Parámetros totales: 2.569.272.320 (dato real)
- Idiomas: en
- Licencia: apache-2.0
- Formato de pesos: GGUF (con safetensors para el modelo base? El repo contiene GGUF. El modelo base es safetensors según el dato de parámetros totales "dato real, safetensors". El repo GGUF contiene archivos .gguf)
- Longitud de contexto: no disponible
- Tipos de cuantización: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16
- Arquitectura: no disponible explícitamente
- Parámetros activos: no disponible (no es MoE conocido)
- Formato de pesos: GGUF (y safetensors en el modelo base original)

El modelo es una cuantización. En la model card, "static quants of https://huggingface.co/OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal". El autor es mradermacher, quien ha cuantizado el modelo base. Por tanto, la ficha debe describir el modelo resultante en GGUF, pero también se refiere al modelo base.

Para "Arquitectura y entrenamiento": No hay datos específicos. Puedo decir que es una cuantización de un modelo base, que se desconoce la arquitectura exacta. Debo indicar que no se dispone de información sobre datos de entrenamiento, RLHF/DPO, etc. Pero el nombre "ZERO_Refusal" sugiere que ha sido ajustado para tener cero rechazos (uncensored). En la búsqueda aparece "Uncensored" en otro repo similar. Puedo mencionar que el nombre indica un ajuste para minimizar rechazos, pero sin datos concretos de entrenamiento.

En la sección de capacidades, puedo inferir que es un modelo de lenguaje para generación de texto en inglés, con soporte para text-generation-inference, etc. Pero no sé si tiene tool calling, agentes, etc. Debo indicar "no disponible" para capacidades no confirmadas.

En "Benchmarks y rendimiento": no se han publicado resultados en la información disponible.

En "Requisitos de hardware": puedo calcular VRAM estimada basándome en los tamaños de los archivos GGUF. Por ejemplo, Q4_K_S tiene 1.6 GB, Q8_0 2.8 GB, f16 5.2 GB. La VRAM necesaria será aproximadamente el tamaño del archivo más overhead. Puedo dar estimaciones basadas en estos tamaños. También puedo mencionar que es un modelo de 2.6B, que cabe en GPUs de consumo como RTX 3060/4060.

En "Comparativa con modelos similares": hay un modelo de LiquidAI/LFM2-2.6B y un LFM2-2.6B-Uncensored-X64-GGUF. Puedo comparar con estos si tengo datos, pero no tengo specs de ellos. Puedo mencionar que existen variantes similares en la familia LFM2, pero no tengo datos concretos para comparar. Debo indicar "no disponible" para la comparación.

En "Enlaces": HuggingFace, y los encontrados en la búsqueda (LiquidAI/LFM2-2.6B, LFM2-2.6B-Uncensored-X64-GGUF).

Ahora, debo construir la ficha en castellano de España, con la estructura obligatoria. Títulos solo primera palabra en mayúsculas (excepto "Resumen" que es título, no sé si aplica; la regla dice "Solo la primera palabra de los titulos va en mayuscula." Entonces los títulos de sección deberían ser "Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". Todos comienzan con mayúscula en la primera palabra y el resto en minúscula. En el prompt original, los títulos están con mayúscula inicial y luego minúsculas, como "Especificaciones tecnicas" (sin tilde en "técnicas"? El prompt dice "Especificaciones tecnicas", pero en castellano debería ser "Especificaciones técnicas". El prompt dice "tecnicas" sin tilde. Debo seguir el prompt? La regla dice "Usa castellano de Espana, sin faltas de ortografia." La ortografía correcta es "técnicas". El prompt original tiene "Especificaciones tecnicas" que es una falta de ortografía. Debo corregirla. Asimismo, "Comparativa con modelos similares" es correcto. "Requisitos de hardware" correcto. "Limitaciones y advertencias" correcto. "Enlaces" correcto. "Benchmarks y rendimiento" correcto. "Capacidades" correcto. "Casos de uso" correcto. "Arquitectura y entrenamiento" correcto. "Resumen" correcto.

En el texto del prompt, "Especificaciones tecnicas" está sin tilde, pero como regla de oro, debo usar ortografía correcta. Lo mismo con "Cuadro" etc. No hay problema.

Ahora, redacto la ficha. Debo ser riguroso y no inventar.

Resumen: Dos o tres párrafos. Explicar que es el modelo, quién lo desarrolla, qué problema resuelve y por qué es relevante ahora. Menciona arquitectura, tamaño y contexto si están disponibles.

En este caso, es una cuantización GGUF de LFM2-2.6B_ZERO_Refusal, desarrollado por OpenIntelligenceNet y cuantizado por mradermacher. Tamaño 2.6B parámetros. Contexto no disponible. Relevante porque ofrece una versión en GGUF para ejecución local en CPU/GPU, con licencia Apache 2.0. "ZERO_Refusal" sugiere un modelo sin restricciones de contenido (uncensored). Debo mencionar que no se dispone de arquitectura.

Especificaciones técnicas: Tabla con las filas obligatorias. Algunos datos no disponibles.

- Arquitectura: no disponible (según la información proporcionada)
- Parámetros totales: 2.569.272.320 (≈2.6 mil millones)
- Parámetros activos: no disponible (no se indica que sea MoE)
- Longitud de contexto: no disponible
- Tipos de cuantización: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16
- Idiomas soportados: inglés (en)
- Licencia: Apache 2.0
- Formato de pesos: GGUF (safetensors en el modelo base original)

Arquitectura y entrenamiento: No hay información. Debo indicar que la información disponible no incluye detalles sobre arquitectura ni entrenamiento. El nombre sugiere que pertenece a la familia LFM2 (Liquid Foundation Models 2), y se sabe que la familia LFM2 usa "dynamic hybrid reasoning" según la búsqueda web, pero no puedo confirmar que este modelo exacto lo use. Debo ser cauto: "El modelo base es LFM2-2.6B_ZERO_Refusal, de OpenIntelligenceNet. No se dispone en la información proporcionada de detalles sobre la arquitectura interna ni sobre los datos de entrenamiento. El nombre 'ZERO_Refusal' indica un ajuste orientado a minimizar rechazos en las respuestas." También puedo mencionar que la cuantización fue realizada por mradermacher con el objetivo de facilitar el despliegue local mediante GGUF.

Capacidades: No hay datos concretos. Puedo listar:
- Generación de texto en inglés.
- Compatible con text-generation-inference y transformers (según tags).
- Carga en entornos que soporten GGUF (llama.cpp, Ollama, etc.) mediante cuantizaciones.
- No se dispone de información sobre tool calling, agentes, visión, etc.

Debo indicar "no disponible" para capacidades no confirmadas.

Casos de uso: Mínimo 6 casos, pero debo ser concreto y realista. Sin datos específicos, puedo basarme en que es un modelo de 2.6B en GGUF. Ejemplos:
- Despliegue local en equipos con GPU limitada o CPU: el modelo en cuantización Q4_K_S pesa 1.6 GB, lo que permite ejecutarlo en GPUs de consumo con 4-6 GB de VRAM.
- Prototipado rápido de aplicaciones conversacionales: gracias a la licencia Apache 2.0 y al formato GGUF.
- Integración en pipelines de texto que requieren bajos recursos.
- Uso en entornos de edge computing.
- Fine-tuning posterior (aunque es una cuantización, el modelo base en safetensors podría ajustarse).
- Investigación en alineación y "refusal" (por el nombre ZERO_Refusal).
Pero debo ser honesto: no conozco el rendimiento real. Puedo formularlos como casos de uso potenciales, explicando que la adecuación se basa en el tamaño y la licencia, no en benchmarks.

Benchmarks y rendimiento: "No se han publicado resultados de benchmarks en la información disponible."

Requisitos de hardware: Basado en los tamaños GGUF:
- VRAM estimada para inferencia: para Q4_K_S (1.6 GB) se necesitan aproximadamente 2-3 GB de VRAM considerando overhead; para Q8_0 (2.8 GB) unos 4-5 GB; para f16 (5.2 GB) unos 7-8 GB. Pero no sé el overhead exacto. Puedo dar rangos aproximados.
- GPU recomendadas: RTX 3060/4060 (12/8 GB), RTX 4090, o CPU con RAM suficiente.
- En consumer GPU: sí, con las cuantizaciones Q4_K_S, Q5_K_M, etc.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (según tags), y cualquier runtime GGUF.
- Latencia y throughput: no disponible.

Comparativa con modelos similares: Hay "LiquidAI/LFM2-2.6B" y "mradermacher/LFM2-2.6B-Uncensored-X64-GGUF". No tengo specs de ellos. Puedo mencionar que son variantes de la misma familia, pero sin datos comparativos, indico "no disponible".

Limitaciones y advertencias:
- No se dispone de información sobre sesgos conocidos.
- El nombre "ZERO_Refusal" sugiere que el modelo puede generar contenido sin restricciones, lo que puede conllevar riesgos de contenido inapropiado.
- Riesgo de alucinación no evaluado (no hay benchmarks).
- Limitación de idioma: solo inglés confirmado.
- Licencia Apache 2.0 permite uso comercial, pero hay que revisar la procedencia del modelo base.
- El modelo es una cuantización, lo que puede degradar la calidad respecto al modelo base f16.

Enlaces:
- https://huggingface.co/mradermacher/LFM2-2.6B_ZERO_Refusal-GGUF
- https://huggingface.co/OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal
- https://huggingface.co/LiquidAI/LFM2-2.6B
- https://huggingface.co/mradermacher/LFM2-2.6B-Uncensored-X64-GGUF

Debo incluir todos los enlaces relevantes encontrados. La búsqueda también devolvió enlaces de Microsoft que no son relevantes, no los incluyo.

Ahora, debo escribir el Markdown. Títulos con primera palabra en mayúsculas, el resto en minúsculas. Por ejemplo, "Especificaciones tecnicas" debería ser "Especificaciones técnicas" con tilde. La regla de "solo la primera palabra de los titulos va en mayuscula" significa que "Especificaciones" es la primera palabra y va en mayúscula, "técnicas" en minúscula. Eso está bien. En "Arquitectura y entrenamiento", la primera palabra "Arquitectura" en mayúscula, "y" y "entrenamiento" en minúscula. Correcto.

En la tabla de especificaciones, uso "no disponible" donde falte.

Aseguro que no hay emojis, no hay texto adicional fuera de la ficha.

Reviso la ortografía: "castellano de España" (con ñ y tilde). "soportados", "cuantización", "inferencia", "rendimiento", "advertencias", "técnicas".

Debo usar números concretos: 2.569.272.320 parámetros, 22.8 GB repo, 2.6B.

También noto que la model card menciona "static quants of https://huggingface.co/OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal" y "weighted/imatrix quants are available at https://huggingface.co/mradermacher/LFM2-2.6B_ZERO_Refusal-i1-GGUF". Podría incluir ese enlace también. Pero no está en los resultados de búsqueda, solo en la model card. Es un enlace relevante. Debo incluirlo como enlace adicional. El prompt dice "todos los enlaces relevantes encontrados en la busqueda web". La model card no es búsqueda web, pero es información proporcionada. Puedo incluir el enlace a la variante i1-GGUF porque aparece en la model card. Es relevante. Lo incluyo.

Ahora, escribo la ficha.

Una consideración: "Pipeline: no disponible" en la metadata de HuggingFace se refiere al pipeline de transformers, no a la arquitectura. No es relevante para la ficha.

También debo mencionar "Región: us" y "conversational"? No es crítico.

En resumen, la ficha debe reflejar la incertidumbre. No inventar datos.

Empiezo:

## Resumen
LFM2-2.6B_ZERO_Refusal-GGUF es una cuantización GGUF del modelo LFM2-2.6B_ZERO_Refusal, creado por OpenIntelligenceNet. El repositorio es obra de mradermacher, que ha convertido los pesos a formato GGUF para facilitar su ejecución local en CPU y GPU mediante runtimes como llama.cpp u Ollama. El modelo cuenta con aproximadamente 2.600 millones de parámetros (2.569.272.320) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y la redistribución. La variante "ZERO_Refusal" indica un ajuste orientado a reducir las respuestas de rechazo, un aspecto relevante para aplicaciones que requieren respuestas sin restricciones de contenido. No se dispone en la información proporcionada de datos sobre la arquitectura interna ni sobre la longitud de contexto.

El repositorio incluye doce niveles de cuantización, desde Q2_K (1.1 GB) hasta f16 (5.2 GB), lo que permite elegir un equilibrio entre calidad y consumo de recursos según el hardware disponible. Aunque la ficha no puede confirmar capacidades avanzadas como tool calling o razonamiento multi-paso, el modelo está pensado para tareas de generación de texto conversacional en inglés, con soporte para text-generation-inference y transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.569.272.320 (~2.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

Nota: La fila "Parametros activos" se ha incluido siguiendo la estructura solicitada, pero no hay indicios de que el modelo sea de arquitectura MoE.

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura ni sobre el proceso de entrenamiento en los datos proporcionados. El modelo base es OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal, que pertenece a la familia LFM2, tal como sugieren tanto el nombre como la existencia de modelos relacionados como LiquidAI/LFM2-2.6B. Sin embargo, no se puede confirmar si esta variante específica comparte la arquitectura híbrida y el mecanismo de razonamiento dinámico que se menciona en la documentación de LiquidAI.

La cuantización ha sido realizada por mradermacher, que ha generado archivos GGUF estáticos a partir de los pesos originales. El nombre "ZERO_Refusal" apunta a un ajuste post-entrenamiento orientado a minimizar los rechazos del modelo ante peticiones del usuario, aunque no se detallan los datos utilizados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado como conversacional y compatible con la librería transformers.
- Ejecución local mediante GGUF: las cuantizaciones permiten cargar el modelo en runtimes compatibles con GGUF, como llama.cpp, Ollama o LM Studio.
- Soporte de text-generation-inference: la etiqueta "text-generation-inference" sugiere compatibilidad con el servidor de Hugging Face para inferencia.
- Sin información confirmada sobre tool calling, function calling, soporte de agentes, visión, audio o modo de razonamiento explícito.

## Casos de uso

- Despliegue en equipos con GPU limitada: la cuantización Q4_K_S pesa 1.6 GB, lo que permite su ejecución en GPUs de consumo con 4-6 GB de VRAM, ideal para prototipos locales.
- Asistentes conversacionales sin restricciones de contenido: la variante ZERO_Refusal está orientada a reducir rechazos, lo que puede ser útil en aplicaciones que requieren respuestas directas y sin filtros.
- Integración en pipelines de generación de texto en inglés: al pesar menos de 3 GB en cuantizaciones altas (Q8_0), el modelo puede ejecutarse en servidores CPU con suficiente RAM.
- Investigación sobre alineación y "refusal": el nombre y la naturaleza del modelo lo convierten en un candidato para estudiar el comportamiento de rechazo en modelos de lenguaje.
- Aplicaciones de edge computing: las cuantizaciones más pequeñas (Q2_K, Q3_K_S) reducen la huella de memoria, permitiendo su uso en dispositivos con recursos muy limitados.
- Fine-tuning posterior del modelo base: aunque el repositorio GGUF no está pensado para entrenamiento, el modelo base en safetensors podría ajustarse para tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (1.1 GB): ~2 GB de VRAM o RAM.
  - Q4_K_S (1.6 GB): ~3 GB de VRAM.
  - Q8_0 (2.8 GB): ~4-5 GB de VRAM.
  - f16 (5.2 GB): ~7-8 GB de VRAM.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 de 8 GB, o GPUs de mayor capacidad para las cuantizaciones f16 y Q8_0. También es viable en CPU con 8-16 GB de RAM.
- Ejecución en GPU de consumo: sí, especialmente con cuantizaciones Q4_K_S, Q4_K_M, Q5_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa técnica con modelos similares. Existen variantes de la misma familia, como LiquidAI/LFM2-2.6B y mradermacher/LFM2-2.6B-Uncensored-X64-GGUF, pero no se han proporcionado especificaciones ni resultados de benchmarks de estos modelos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni sobre la evaluación de alucinaciones.
- El nombre "ZERO_Refusal" indica un modelo orientado a no rechazar peticiones, lo que puede conllevar la generación de contenido inapropiado o dañino si no se aplican filtros externos.
- El modelo solo confirma soporte para inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantización degrada la calidad en comparación con los pesos f16, especialmente en las variantes Q2_K y Q3_K.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la documentación del modelo base para confirmar que no hay restricciones adicionales.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento o código no está verificado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2-2.6B_ZERO_Refusal-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal
- Variante i1-GGUF: https://huggingface.co/mradermacher/LFM2-2.6B_ZERO_Refusal-i1-GGUF
- Modelo relacionado LiquidAI/LFM2-2.6B: https://huggingface.co/LiquidAI/LFM2-2.6B
- Variante relacionada LFM2-2.6B-Uncensored-X64-GGUF: https://huggingface.co/mradermacher/LFM2-2.6B-Uncensored-X64-GGUF

Ahora, reviso que las reglas se cumplan:

- No inventar datos: he usado "no disponible" donde faltaba información.
- Castellano de España sin faltas: he corregido "técnicas", "cuantización", "inferencia", "advertencias".
- Solo la primera palabra de los títulos en mayúsculas: "Resumen", "Especificaciones técnicas" (primera palabra en mayúscula, "técnicas" en minúscula). "Arquitectura y entrenamiento": "Arquitectura" mayúscula, "y" y "entrenamiento" minúsculas. "Capacidades" mayúscula. "Casos de uso" mayúscula en "Casos", "de" y "uso" minúsculas. "Benchmarks y rendimiento" mayúscula en "Benchmarks", "y" y "rendimiento" minúsculas. "Requisitos de hardware" mayúscula en "Requisitos", "de" y "hardware" minúsculas. "Comparativa con modelos similares" mayúscula en "Comparativa", el resto minúsculas. "Limitaciones y advertencias" mayúscula en "Limitaciones", el resto minúsculas. "Enlaces" mayúscula. Correcto.
- No emojis.
- Responder solo con el Markdown de la ficha.
- Tablas Markdown.
- Específico y técnico.

Una cosa: En la tabla de especificaciones, el prompt original dice "Especificaciones tecnicas" pero yo he puesto "Especificaciones técnicas". Eso es ortografía correcta. La regla de "solo la primera palabra de los titulos va en mayuscula" se cumple.

Otra cosa: En la sección de capacidades, "Soporte de text-generation-inference" está bien.

En la sección de requisitos de hardware, "VRAM estimada para inferencia" con rangos. He usado "~2 GB de VRAM o RAM" para Q2_K. Podría ser más preciso, pero es una estimación.

También debo tener en cuenta que el repo tiene 22.8 GB, que es el tamaño total de todos los archivos. No es necesario mencionarlo, pero podría. Ya lo he mencionado en el resumen? No. Podría omitirlo.

En el resumen, digo "doce niveles de cuantización" - en la tabla hay 12 tipos. Es correcto.

Reviso si "ZERO_Refusal" es un modelo con "uncensored". En la búsqueda aparece "Uncensored" en otro repo, pero no en este. El nombre "ZERO_Refusal" es suficiente.

También noto que la etiqueta "base_model:OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal" indica que el modelo base es de OpenIntelligenceNet. Bien.

No hay más información. La ficha está lista.

Ahora, respondo con el Markdown.## Resumen

LFM2-2.6B_ZERO_Refusal-GGUF es una cuantización GGUF del modelo LFM2-2.6B_ZERO_Refusal, creado por OpenIntelligenceNet. El repositorio es obra de mradermacher, que ha convertido los pesos a formato GGUF para facilitar su ejecución local en CPU y GPU mediante runtimes como llama.cpp u Ollama. El modelo cuenta con aproximadamente 2.600 millones de parámetros (2.569.272.320) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y la redistribución. La variante "ZERO_Refusal" indica un ajuste orientado a reducir las respuestas de rechazo, un aspecto relevante para aplicaciones que requieren respuestas sin restricciones de contenido. No se dispone en la información proporcionada de datos sobre la arquitectura interna ni sobre la longitud de contexto.

El repositorio incluye doce niveles de cuantización, desde Q2_K (1.1 GB) hasta f16 (5.2 GB), lo que permite elegir un equilibrio entre calidad y consumo de recursos según el hardware disponible. Aunque la ficha no puede confirmar capacidades avanzadas como tool calling o razonamiento multi-paso, el modelo está pensado para tareas de generación de texto conversacional en inglés, con soporte para text-generation-inference y transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.569.272.320 (~2.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

Nota: la fila "Parametros activos" se ha incluido siguiendo la estructura solicitada, pero no hay indicios de que el modelo sea de arquitectura MoE.

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura ni sobre el proceso de entrenamiento en los datos proporcionados. El modelo base es OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal, que pertenece a la familia LFM2, tal como sugieren tanto el nombre como la existencia de modelos relacionados como LiquidAI/LFM2-2.6B. Sin embargo, no se puede confirmar si esta variante específica comparte la arquitectura híbrida y el mecanismo de razonamiento dinámico que se menciona en la documentación de LiquidAI.

La cuantización ha sido realizada por mradermacher, que ha generado archivos GGUF estáticos a partir de los pesos originales. El nombre "ZERO_Refusal" apunta a un ajuste post-entrenamiento orientado a minimizar los rechazos del modelo ante peticiones del usuario, aunque no se detallan los datos utilizados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado como conversacional y compatible con la librería transformers.
- Ejecución local mediante GGUF: las cuantizaciones permiten cargar el modelo en runtimes compatibles con GGUF, como llama.cpp, Ollama o LM Studio.
- Soporte de text-generation-inference: la etiqueta "text-generation-inference" sugiere compatibilidad con el servidor de Hugging Face para inferencia.
- Sin información confirmada sobre tool calling, function calling, soporte de agentes, visión, audio o modo de razonamiento explícito.

## Casos de uso

- Despliegue en equipos con GPU limitada: la cuantización Q4_K_S pesa 1.6 GB, lo que permite su ejecución en GPUs de consumo con 4-6 GB de VRAM, ideal para prototipos locales.
- Asistentes conversacionales sin restricciones de contenido: la variante ZERO_Refusal está orientada a reducir rechazos, lo que puede ser útil en aplicaciones que requieren respuestas directas y sin filtros.
- Integración en pipelines de generación de texto en inglés: al pesar menos de 3 GB en cuantizaciones altas (Q8_0), el modelo puede ejecutarse en servidores CPU con suficiente RAM.
- Investigación sobre alineación y "refusal": el nombre y la naturaleza del modelo lo convierten en un candidato para estudiar el comportamiento de rechazo en modelos de lenguaje.
- Aplicaciones de edge computing: las cuantizaciones más pequeñas (Q2_K, Q3_K_S) reducen la huella de memoria, permitiendo su uso en dispositivos con recursos muy limitados.
- Fine-tuning posterior del modelo base: aunque el repositorio GGUF no está pensado para entrenamiento, el modelo base en safetensors podría ajustarse para tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (1.1 GB): ~2 GB de VRAM o RAM.
  - Q4_K_S (1.6 GB): ~3 GB de VRAM.
  - Q8_0 (2.8 GB): ~4-5 GB de VRAM.
  - f16 (5.2 GB): ~7-8 GB de VRAM.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 de 8 GB, o GPUs de mayor capacidad para las cuantizaciones f16 y Q8_0. También es viable en CPU con 8-16 GB de RAM.
- Ejecución en GPU de consumo: sí, especialmente con cuantizaciones Q4_K_S, Q4_K_M, Q5_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa técnica con modelos similares. Existen variantes de la misma familia, como LiquidAI/LFM2-2.6B y mradermacher/LFM2-2.6B-Uncensored-X64-GGUF, pero no se han proporcionado especificaciones ni resultados de benchmarks de estos modelos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni sobre la evaluación de alucinaciones.
- El nombre "ZERO_Refusal" indica un modelo orientado a no rechazar peticiones, lo que puede conllevar la generación de contenido inapropiado o dañino si no se aplican filtros externos.
- El modelo solo confirma soporte para inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantización degrada la calidad en comparación con los pesos f16, especialmente en las variantes Q2_K y Q3_K.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la documentación del modelo base para confirmar que no hay restricciones adicionales.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento o código no está verificado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2-2.6B_ZERO_Refusal-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM2-2.6B_ZERO_Refusal
- Variante i1-GGUF: https://huggingface.co/mradermacher/LFM2-2.6B_ZERO_Refusal-i1-GGUF
- Modelo relacionado LiquidAI/LFM2-2.6B: https://huggingface.co/LiquidAI/LFM2-2.6B
- Variante relacionada LFM2-2.6B-Uncensored-X64-GGUF: https://huggingface.co/mradermacher/LFM2-2.6B-Uncensored-X64-GGUF
