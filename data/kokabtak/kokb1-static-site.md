# kokabtak/kokb1-static-site

## Resumen

kokb1 es el nombre que el usuario kokabtak da a lo que presenta como "el primer modelo de la serie de IA de Kokabtak", descrito en su model card como un modelo ligero, avanzado y "sin restricciones políticas", supuestamente construido sobre DeepSeek-V4.1-Flash (552.000 millones de parámetros), con arquitectura MoE, ventana de 1 millón de tokens y capacidades multilingües en persa, inglés y chino. La licencia declarada es MIT.

Sin embargo, el repositorio `kokabtak/kokb1-static-site` no es un repositorio de pesos: está configurado con `sdk: static`, es decir, se trata de una página estática (una demo o landing alojada como Space), sin pipeline declarado, sin ficheros de pesos publicados, sin descargas ni interacciones registradas. Por tanto, no existe evidencia técnica verificable del modelo descrito: no hay config.json, tokenizer, safetensors, GGUF ni ningún artefacto de inferencia.

La relevancia de esta ficha es, por tanto, principalmente crítica: sirve para documentar que las cifras y capacidades anunciadas son afirmaciones del autor no contrastables con la información disponible, y que no es posible evaluar, desplegar ni reproducir el modelo a partir de este repositorio. Cualquier decisión técnica o de producción basada en esta ficha debería tratar los datos de la model card como no verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card declara MoE; sin verificar y sin ficheros de configuración) |
| Parámetros totales | la model card declara 552.000 millones; no verificable (no hay pesos publicados) |
| Parámetros activos | no disponible |
| Longitud de contexto | la model card declara 1.000.000 de tokens; no verificable |
| Tipos de cuantización | no disponible |
| Idiomas soportados | la model card declara persa, inglés y chino; el campo de idiomas del repositorio aparece como no disponible |
| Licencia | MIT (declarada; ver limitaciones sobre su aplicabilidad) |
| Formato de pesos | no disponible (repositorio de tipo sitio estático, sin pesos) |

## Arquitectura y entrenamiento

No se ha publicado información verificable sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni proceso de alineación (RLHF, DPO u otros). La model card únicamente afirma que el modelo está "impulsado por DeepSeek-V4.1-Flash" con 552.000 millones de parámetros y arquitectura MoE, además de una ventana de contexto de 1 millón de tokens. No se aporta ninguna referencia pública, paper, informe técnico ni identificador de checkpoint que permita confirmar la existencia de ese modelo base ni su relación con DeepSeek.

El repositorio, además, está declarado con `sdk: static`, lo que indica que se trata de una interfaz web estática y no de un artefacto de modelo. No hay evidencia de innovaciones técnicas propias (decodificación especulativa, atención lineal, variantes híbridas SSM, etc.) más allá de las menciones genéricas de la model card.

## Capacidades

Las siguientes capacidades son las declaradas por el autor en la model card. No están respaldadas por documentación técnica, demos funcionales ni evaluaciones publicadas:

- Chat conversacional multi-turno en persa, inglés y chino.
- Búsqueda web: localización y análisis de sitios web, según la model card.
- Traducción y resumen de textos.
- Generación de código en varios lenguajes.
- Investigación y análisis de datos, además de generación de narrativa ("storytelling").
- Herramientas avanzadas declaradas: búsqueda, traducción, programación e investigación.
- Uso gratuito a través de Hugging Face Inference Providers, según la model card.
- No se declara soporte de visión, audio, ni modo de razonamiento explícito (thinking mode).

## Casos de uso

Los siguientes escenarios se derivan de las capacidades declaradas, pero no pueden validarse con la información disponible. Se listan como hipótesis de uso, no como usos comprobados:

- Atención al cliente en persa: gestión de conversaciones multi-turno en farsi, un idioma con menor cobertura en modelos abiertos, siempre que el modelo exista realmente y esté servido en producción.
- Traducción persa-inglés-chino: traducción y resumen de documentación técnica o comercial entre los tres idiomas declarados.
- Asistente de búsqueda documental: recuperación y síntesis de contenido web o corpus internos, apoyándose en la ventana de contexto declarada de 1 millón de tokens.
- Generación de código en pipelines de desarrollo: producción de fragmentos de código y explicaciones, con integración vía API si se confirma el soporte de tool calling.
- Resumen de documentación extensa: condensación de informes largos si la ventana de contexto declarada fuese real.
- Prototipos de chatbot para mercado iraní: sustitución de soluciones propietarias por un modelo supuestamente local, con la salvedad de que no hay pesos descargables.
- Investigación académica sobre IA en persa: análisis de un supuesto modelo nativo, condicionado a que el autor publique pesos, tokenizer y configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ningún dato de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones multilingües o en persa, y no existe documentación técnica asociada al repositorio.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No hay pesos publicados ni ficheros de configuración que permitan calcularla.
- Estimación aritmética teórica: si la cifra declarada de 552.000 millones de parámetros fuese cierta y el modelo fuese denso o MoE, la inferencia en FP16 requeriría del orden de 1,1 TB de memoria, y en cuantización de 4 bits alrededor de 276 GB, sin contar la caché KV de un contexto de 1 millón de tokens. Esta estimación es puramente aritmética sobre una cifra no verificada y no debe usarse para dimensionar infraestructura.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; con las cifras declaradas no cabría en ninguna GPU de consumo actual.
- Opciones de despliegue: el repositorio es un sitio estático servido como Space; la model card menciona el uso de Hugging Face Inference Providers, lo que implicaría inferencia remota y no local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos verificables del modelo evaluado, por lo que la comparación es estructural y no de rendimiento. La columna de kokb1 recoge únicamente afirmaciones de la model card, no hechos comprobados.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| kokb1 | 552.000 M declarados (no verificable) | 1 M declarado (no verificable) | MIT declarada | No; repositorio estático sin pesos |
| DeepSeek-V3 | 671.000 M totales, 37.000 M activos | 128.000 tokens | MIT | Sí, pesos abiertos en Hugging Face |
| Qwen3-235B-A22B | 235.000 M totales, 22.000 M activos | 128.000 tokens (ampliable con YaRN) | Apache 2.0 | Sí, pesos abiertos en Hugging Face |

No se dispone de información sobre "DeepSeek-V4.1-Flash", el modelo base que la model card cita como origen, por lo que no se puede incluir en la comparativa.

## Limitaciones y advertencias

- Ausencia total de artefactos: no hay pesos, tokenizer, config.json ni ficheros de cuantización; el repositorio es un sitio estático. El modelo no es descargable ni ejecutable.
- Afirmaciones no verificables: las cifras de 552.000 millones de parámetros, arquitectura MoE y contexto de 1 millón de tokens son declaraciones del autor sin respaldo documental.
- Modelo base no identificado: no existe documentación pública conocida de "DeepSeek-V4.1-Flash"; no se puede confirmar su existencia ni su relación con DeepSeek.
- Ausencia de benchmarks: imposible comparar rendimiento real con alternativas abiertas.
- Riesgo de alucinación: no evaluado; sin datos de alineación ni de evaluación de fidelidad.
- Idiomas: el repositorio no declara idiomas en el campo correspondiente; la cobertura multilingüe se basa solo en la model card.
- Licencia: aunque se declara MIT, esta licencia solo es aplicable al contenido del repositorio; si el modelo derivase de pesos con licencia propia (por ejemplo, la licencia de modelos DeepSeek), las condiciones de uso comercial del artefacto subyacente no quedarían cubiertas por una declaración MIT del autor.
- Afirmación de ausencia de "restricciones políticas": no es una característica técnica medible y puede implicar riesgos de contenido no moderado en despliegues de producción.
- Trazabilidad nula: cero descargas, cero interacciones y ninguna revisión de la comunidad que permita validar el proyecto.
- No apto para producción sin verificación previa de existencia del modelo, condiciones de servicio, política de privacidad y evaluación propia.
- Dependencia de terceros: si el servicio funciona mediante Inference Providers, la disponibilidad, latencia, coste y privacidad dependen de un intermediario externo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kokabtak/kokb1-static-site
- Organización del autor: https://huggingface.co/kokabtak
- Contacto declarado en la model card: kokbtak@gmail.com
- Paper, blog técnico, repositorio de código o demo adicional: no disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces obtenidos correspondían a un comercio de bricolaje sin relación con el proyecto.
