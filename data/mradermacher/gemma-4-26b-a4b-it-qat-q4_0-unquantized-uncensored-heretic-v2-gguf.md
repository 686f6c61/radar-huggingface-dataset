# mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF

## Resumen

El modelo `mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF` es una conversión al formato GGUF de un modelo Gemma 4 de 26.000 millones de parámetros en arquitectura de Mixtura de Expertos (MoE), con 4.000 millones de parámetros activos. El modelo original fue desarrollado por `OS-Software` como una variante modificada ("heretic", "uncensored", "abliterated") que elimina las barreras de alineación y seguridad del modelo base. La cuantización GGUF, realizada por `mradermacher`, permite desplegar el modelo en equipos de consumo con requisitos de memoria moderados, manteniendo la posibilidad de usar entrada visual gracias a los archivos `mmproj` incluidos.

La relevancia de este modelo radica en su naturaleza MoE, que ofrece un equilibrio entre capacidad y coste computacional, y en su licencia Apache 2.0 declarada en HuggingFace. Su proceso de entreno incluye cuantización consciente de la precisión (QAT) con `q4_0`, lo que permite una pérdida de calidad reducida en los pesos cuantizados. No se dispone en la documentación proporcionada de datos sobre la longitud de contexto, el conjunto de entrenamiento ni los resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixtura de Expertos), según indica la nomenclatura "A4B" |
| Parametros totales | 25.233.142.046 |
| Parametros activos | 4.000 millones (según nombre; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M; mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia oficial de Gemma 4) |
| Formato de pesos | GGUF (con archivos mmproj para visión) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo de Mixtura de Expertos (MoE) de la serie Gemma 4, según la etiqueta `26B-A4B`, que indica 26.000 millones de parámetros totales y 4.000 millones de parámetros activos por token. El modelo fue entrenado con cuantización consciente de la precisión (QAT) en `q4_0`, lo que explica que el nombre contenga `qat-q4_0` y que las cuantizaciones GGUF estándar funcionen sobre el mismo. El proceso "abliterated", "uncensored" y "heretic" indica una modificación posterior a la etapa de alineación, mediante técnicas de edición de pesos para eliminar las negativas de seguridad del modelo base.

No se dispone en la documentación proporcionada de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas específicas más allá de la estructura MoE y el uso de QAT.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de entrada multimodal de visión gracias a los archivos `mmproj-f16` y `mmproj-Q8_0`.
- Modelo "abliterated" o "uncensored": responde sin las restricciones de seguridad habituales, lo que permite generar contenido que un modelo estándar rechazaría.
- Compatible con `transformers` y con la carga de pesos GGUF a través de `llama.cpp` y derivados.
- Etiquetado como `endpoints_compatible` y `conversational` en HuggingFace, lo que sugiere utilidad como backend conversacional.
- No se ha confirmado en la información disponible el soporte de tool calling, function calling, razonamiento simbólico avanzado ni decodificación especulativa.

## Casos de uso

- Asistente de chat local en inglés: el formato GGUF permite ejecutar el modelo en una GPU de consumo (por ejemplo, RTX 4090) con `llama.cpp` o `Ollama`, ofreciendo un asistente conversacional privado sin dependencia de servicios externos.
- Análisis de imágenes en local: combinando el modelo con los archivos `mmproj`, se puede describir contenido visual, extraer texto de imágenes o responder preguntas sobre ellas sin enviar datos a servicios en la nube.
- Investigación en alineación y seguridad: al ser un modelo "abliterated", permite estudiar el efecto de eliminar las barreras de alineación, comparando sus respuestas con las del modelo Gemma 4 original.
- Generación de contenido creativo sin filtros: útil para guiones de ficción, personajes de rol o historias interactivas en inglés, donde se requiere un tono sin restricciones.
- Evaluación de técnicas de cuantización: la presencia de QAT en el modelo base facilita experimentos sobre el impacto de la cuantización en modelos MoE de gran tamaño.
- Prototipado de aplicaciones con visión y lenguaje: al estar disponible en formato GGUF y con `mmproj`, puede integrarse en pipelines de procesamiento de imágenes en entornos de desarrollo ágiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con `llama.cpp`:
  - Q2_K (10,7 GB en disco): aproximadamente 12-14 GB de VRAM para contextos cortos.
  - Q3_K_M (13,4 GB en disco): aproximadamente 16 GB de VRAM.
  - Q4_K_M (16,9 GB en disco): aproximadamente 20 GB de VRAM.
- GPU recomendada: RTX 4090 24 GB para las cuantizaciones Q3 y Q4; A100 40 GB o H100 para contextos largos y mayor rendimiento.
- En una RTX 3060 12 GB solo es viable la cuantización Q2_K con contextos muy reducidos.
- Opciones de despliegue: `llama.cpp` (recomendado para GGUF), `Ollama`, LM Studio y cualquier runtime compatible con GGUF. No es compatible de forma nativa con `vLLM` ni `TGI` en su modalidad habitual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Longitud de contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF | 25,2B | 4B | no disponible | apache-2.0 | GGUF |
| Gemma 3 27B A3B | 27B | 3B | 128K | Licencia Gemma | Safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | apache-2.0 | Safetensors, GGUF |

La comparativa se limita a especificaciones conocidas; no se dispone de resultados de benchmarks para ninguno de los tres modelos.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar la alineación de seguridad. Puede generar contenido dañino, ofensivo o ilegal en inglés, por lo que su uso debe ser supervisado y el usuario asume toda la responsabilidad.
- Aunque la metadata de HuggingFace indica licencia `apache-2.0`, el modelo se basa en Gemma 4 y enlaza a la licencia oficial de Gemma, que incluye términos adicionales. Es necesario revisar dicha licencia antes de un uso comercial.
- Solo se ha confirmado el idioma inglés; no se han aportado pruebas de soporte multilingüe, por lo que su rendimiento en otros idiomas, incluido el castellano, no está garantizado.
- La cuantización GGUF puede producir una pérdida de calidad con respecto a los pesos originales `safetensors`, especialmente en las cuantizaciones de menor tamaño.
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluaciones de seguridad. Al ser un modelo "abliterated", su comportamiento puede ser impredecible en contextos de producción.
- El autor de la cuantización (`mradermacher`) no proporciona mantenimiento, actualizaciones ni soporte técnico para este repo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2)
- [Variante relacionada: gemma-4-26B-A4B-it-heretic-GGUF](https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-GGUF)
- [Variante relacionada: gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF](https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF)
- [Licencia oficial de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Página alternativa de descarga](https://hf.tst.eu/model#gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
