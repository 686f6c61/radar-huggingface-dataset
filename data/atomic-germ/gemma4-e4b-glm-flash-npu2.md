# Atomic-Germ/Gemma4-E4B-GLM-FLASH-NPU2

## Resumen

Gemma4-E4B-GLM-FLASH-NPU2 es una conversión en formato Q4NX del modelo Google Gemma-4-E4B-it, realizada por el usuario Atomic-Germ. Q4NX es el formato de cuantización nativo del motor FastFlowLM, diseñado para ejecutarse exclusivamente en las NPU AMD Ryzen AI con arquitectura XDNA2 (series Strix Point / Ryzen AI 300 o posteriores). El modelo no es un archivo GGUF ni funciona con llama.cpp u Ollama; está pensado para el ecosistema FastFlowLM, que aprovecha la matriz de procesamiento de la NPU para acelerar la inferencia.

El modelo base, Gemma-4-E4B-it, es una variante de la familia Gemma 4 de Google, que ofrece capacidades multimodales (entrada de imagen y audio) y una ventana de contexto de 131.072 tokens. Esta conversión mantiene esas características, aunque la cuantización Q4NX reduce la precisión a cambio de una ejecución eficiente en hardware NPU. El repositorio incluye pesos cuantizados, configuración, tokenizador y plantillas de chat, así como los pesos adicionales para las torres de visión y audio.

La relevancia de este modelo reside en que permite ejecutar un modelo de 4B multimodal en un portátil con procesador Ryzen AI sin necesidad de GPU dedicada, aprovechando la NPU integrada. Es un ejemplo de despliegue local de IA en hardware de consumo, con una velocidad de decodificación modesta (7,94 tokens/s según las pruebas del autor) pero con un prefill muy rápido (416 tokens/s).

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4) |
| Parámetros totales | No disponible (el modelo base es E4B, aproximadamente 4.4B según fuentes no oficiales) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (según config) |
| Tipos de cuantización | Q4NX (formato propietario de FastFlowLM) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no es safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo base es Google Gemma-4-E4B-it, un modelo de la familia Gemma 4 de Google. Según la documentación oficial de Google, Gemma 4 presenta arquitectura de transformer con mejoras en eficiencia y capacidad, disponible en varios tamaños (E2B, E4B, 26B A4B y 31B). No se dispone de detalles específicos sobre el número de parámetros exacto ni sobre el proceso de entrenamiento del modelo base en la información proporcionada.

Este repositorio no es un fine-tune desde cero, sino una conversión del modelo ya entrenado a formato Q4NX. El autor indica que se trata de un "fine-tune estilo GLM-FLASH", pero no se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. La conversión a Q4NX reorganiza los pesos para adaptarlos a los tamaños de tile y patrones de acceso a memoria de la NPU, pero no introduce cambios arquitectónicos adicionales.

## Capacidades
- Generación de texto conversacional: el modelo está optimizado para tareas de chat y generación de respuestas.
- Entrada multimodal: incluye pesos de torre de visión (`vision_weight.q4nx`) y de audio (`audio_weight.q4nx`), lo que permite procesar imágenes y posiblemente audio.
- Ventana de contexto larga: 131.072 tokens, adecuada para documentos extensos o conversaciones de muchos turnos.
- Ejecución en NPU: está diseñado para ejecutarse exclusivamente en NPU AMD XDNA2 mediante el motor FastFlowLM, aprovechando la aceleración por hardware.
- No se mencionan capacidades de tool calling, function calling, ni agentes en la documentación proporcionada.

## Casos de uso
- Asistente personal local en portátiles con NPU AMD: el modelo puede funcionar como un asistente de chat sin conexión, aprovechando la NPU para mantener la privacidad y no depender de servicios en la nube.
- Análisis de documentos largos: con 131.072 tokens de contexto, es adecuado para resumir o extraer información de documentos extensos, como informes, libros o código fuente.
- Procesamiento de imágenes y audio: al incluir torres de visión y audio, puede utilizarse en aplicaciones que requieran describir imágenes o transcribir audio, aunque no se especifica la calidad de estas capacidades.
- Generación de contenido creativo: como modelo de lenguaje, puede generar textos creativos, correos, o contenido de marketing, siempre que la latencia de 7,94 tokens/s sea aceptable para el uso.
- Investigación y prototipado de IA en hardware de consumo: es un caso de prueba para desarrolladores que quieran experimentar con modelos multimodales en NPU sin GPU.
- Despliegue en entornos corporativos con requisitos de seguridad: al ser un modelo local, los datos no salen del dispositivo, lo que puede ser útil para aplicaciones sensibles.

## Benchmarks y rendimiento
El autor proporciona un benchmark propio denominado "GhostWriter Influence Test", realizado en un portátil AMD Ryzen AI 340 (Framework 13). Este benchmark es arbitrario y no está estandarizado, pero ofrece datos de rendimiento:

| Métrica | Valor |
|---|---|
| Tokens de prompt | 9.210 |
| Tokens de completion | 1.721 |
| Tokens totales | 10.986 |
| Tokens activos en KV cache | 10.986 |
| Capacidad máxima de tokens KV | 32.768 |
| Ocupación de KV cache | 33,53% |
| Duración de carga | 0,000000742 s |
| Prefill (TTFT) | 22,25 ms |
| Decodificación | 216,65 ms |
| Velocidad de prefill | 416,54 tokens/s |
| Velocidad de decodificación | 7,94 tokens/s |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware
- Procesador: AMD Ryzen AI con arquitectura XDNA2 (NPU2), como la serie Strix Point / Ryzen AI 300 o posterior.
- Sistema operativo: Linux con el stack XRT para NPU instalado.
- Memoria: aproximadamente 15 GB de memoria unificada del sistema (para pesos Q4NX + activaciones + KV cache).
- Motor de inferencia: FastFlowLM >= 0.9.45 (CLI `flm`). No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- No se requiere GPU dedicada; la inferencia se realiza en la NPU.
- El archivo `model.q4nx` pesa 7,14 GB, y el repositorio total 9,1 GB (incluye los pesos de visión y audio).
- El despliegue se realiza con `flm-add` y el comando `flm run`, registrando el modelo en la configuración de FastFlowLM.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros modelos de la misma categoría. El modelo es una conversión específica para NPU de AMD, por lo que no es comparable directamente con versiones GGUF o safetensors de otros modelos. Como referencia, el modelo base original es `google/gemma-4-E4B-it`, que se puede ejecutar en GPU con frameworks estándar. En cuanto a tamaño y propósito, se podría comparar con otros modelos de 4B como Qwen2.5-4B o Phi-3-mini, pero no se proporcionan resultados de evaluación comparativa en la información.

## Limitaciones y advertencias
- Idioma: la model card indica únicamente `en` (inglés). No se ha verificado el soporte de otros idiomas.
- Formato propietario: el modelo solo se ejecuta con FastFlowLM en NPU de AMD; no es portable a otros entornos.
- Rendimiento de decodificación bajo: 7,94 tokens/s, lo que puede ser lento para interacciones en tiempo real.
- Dependencia de kernels cerrados: los kernels de FastFlowLM son código cerrado y no se distribuyen en este repositorio; se enlazan con los del modelo oficial `Gemma4-E4B-IT-NPU2`.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar información incorrecta o inventada.
- No hay información sobre sesgos específicos ni sobre el proceso de alineación del modelo base.
- La cuantización Q4NX puede degradar la calidad de las respuestas en comparación con el modelo original en formato de precisión completa, aunque no se han evaluado diferencias.

## Enlaces
- Repositorio en Hugging Face: [Atomic-Germ/Gemma4-E4B-GLM-FLASH-NPU2](https://huggingface.co/Atomic-Germ/Gemma4-E4B-GLM-FLASH-NPU2)
- Motor FastFlowLM: [https://fastflowlm.com](https://fastflowlm.com)
- Modelo base: [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- Página de Gemma 4 en Google DeepMind: [https://deepmind.google/models/gemma/gemma-4/](https://deepmind.google/models/gemma/gemma-4/)
- Model card de Gemma 4 en Google AI for Developers: [https://ai.google.dev/gemma/docs/core/model_card_4](https://ai.google.dev/gemma/docs/core/model_card_4)</think>## Resumen
Gemma4-E4B-GLM-FLASH-NPU2 es una conversión en formato Q4NX del modelo Google Gemma-4-E4B-it, realizada por el usuario Atomic-Germ. Q4NX es el formato de cuantización nativo del motor FastFlowLM, diseñado para ejecutarse exclusivamente sobre las NPU AMD Ryzen AI con arquitectura XDNA2 (Strix Point / Ryzen AI 300 o posterior). No es un archivo GGUF ni un safetensors, y no es compatible con llama.cpp, Ollama u otros motores habituales.

El modelo base Gemma-4-E4B-it pertenece a la familia Gemma 4 de Google, que ofrece capacidades multimodales (entrada de imagen, texto y audio) y una ventana de contexto de 131.072 tokens. Esta conversión mantiene las torres de visión y audio (incluidas como `vision_weight.q4nx` y `audio_weight.q4nx`) y el tokenizador original, pero la cuantización Q4NX reorganiza los pesos para adaptarlos a los tamaños de tile y patrones de acceso de la NPU. El repositorio incluye un instalador (`flm-add.py`) que registra el modelo en FastFlowLM.

La relevancia de este modelo radica en su capacidad de ejecutar un modelo multimodal de 4B en hardware de consumo sin GPU, aprovechando la NPU de los procesadores AMD Ryzen AI. Según las pruebas del autor, alcanza una velocidad de prefill de 416,54 tokens/s y una decodificación de 7,94 tokens/s, lo que lo hace útil para tareas de baja latencia de prefill, aunque la generación es relativamente lenta.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4) |
| Parámetros totales | No disponible (el modelo base es E4B, probablemente ~4.4B, pero no se confirma) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (según config) |
| Tipos de cuantización | Q4NX (formato propietario de FastFlowLM) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no es safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo base es `google/gemma-4-E4B-it`, una variante de la familia Gemma 4 de Google. Según la documentación oficial, Gemma 4 está disponible en varios tamaños (E2B, E4B, 26B A4B y 31B) y presenta arquitectura transformer con mejoras en eficiencia y capacidades multimodales. No se dispone de detalles sobre el número exacto de parámetros ni sobre el proceso de entrenamiento del modelo base en la información proporcionada.

Este repositorio no es un entrenamiento original, sino una **conversión cuantizada** del modelo base. El autor lo describe como un "fine-tune estilo GLM-FLASH", pero no se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La conversión a Q4NX se limita a reorganizar los pesos para la matriz de procesamiento de la NPU, sin cambios arquitectónicos adicionales.

## Capacidades
- Generación de texto conversacional, con plantilla de chat incluida.
- Entrada multimodal: incluye torre de visión (`vision_weight.q4nx`) y torre de audio (`audio_weight.q4nx`), lo que permite procesar imágenes y posiblemente audio.
- Ventana de contexto larga: 131.072 tokens, adecuada para análisis de documentos extensos o conversaciones de largo recorrido.
- Ejecución específica en NPU AMD XDNA2 a través de FastFlowLM, aprovechando la aceleración por hardware.
- No se menciona soporte para tool calling, function calling, agentes ni modo de razonamiento explícito en la documentación.

## Casos de uso
- Asistente local en portátiles con Ryzen AI: el modelo puede ejecutarse en un portátil con procesador AMD Ryzen AI 300 o superior, sin necesidad de GPU, para tareas de chat y consultas.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, es adecuado para resumir informes, contratos o código fuente extenso.
- Descripción de imágenes y audio: gracias a las torres multimodales, puede utilizarse para generar descripciones de imágenes o transcribir audio, aunque no se especifica la calidad de estas tareas.
- Prototipado de aplicaciones de IA en hardware de consumo: sirve como referencia para desarrolladores que quieran experimentar con modelos multimodales en NPU.
- Entornos con requisitos de privacidad: al funcionar localmente, los datos no salen del dispositivo, lo que puede ser útil en sectores como salud o finanzas.
- Investigación sobre inferencia en NPU: permite estudiar el rendimiento y las limitaciones de los modelos cuantizados en hardware especializado.

## Benchmarks y rendimiento
El autor proporciona un benchmark propio llamado "GhostWriter Influence Test", realizado en un portátil AMD Ryzen AI 340 (Framework 13). Se trata de una prueba arbitraria, no estandarizada:

| Métrica | Valor |
|---|---|
| Tokens de prompt | 9.210 |
| Tokens de completion | 1.721 |
| Tokens totales | 10.986 |
| Tokens activos en KV cache | 10.986 |
| Capacidad máxima de tokens KV | 32.768 |
| Ocupación de KV | 33,53% |
| Duración de carga | 0,000000742 s |
| Prefill (TTFT) | 22,25 ms |
| Decodificación | 216,65 ms |
| Prefill speed | 416,54 tokens/s |
| Decoding speed | 7,94 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware
- Procesador: AMD Ryzen AI con arquitectura XDNA2 (NPU2), como Strix Point / Ryzen AI 300 o posterior.
- Sistema operativo: Linux con la pila XRT para NPU instalada.
- Memoria: aproximadamente 15 GB de memoria unificada del sistema (pesos Q4NX + activaciones + KV cache).
- Motor de inferencia: FastFlowLM >= 0.9.45 (CLI `flm`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- No se requiere GPU; la inferencia se realiza en la NPU.
- El archivo `model.q4nx` pesa 7,14 GB; el repositorio completo ocupa 9,1 GB.
- Instalación mediante `flm-add` (herramienta externa) o el script `flm-add.py` incluido.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros modelos de la misma categoría. La conversión es específica para FastFlowLM y NPU de AMD, por lo que no es directamente comparable con versiones GGUF o safetensors de otros modelos 4B. El modelo base original `google/gemma-4-E4B-it` se puede ejecutar en GPU con frameworks estándar, pero no se han proporcionado resultados de rendimiento de este repositorio. Otras alternativas de tamaño similar (Qwen2.5-4B, Phi-3-mini) no tienen conversión a Q4NX ni soporte de NPU en la información disponible.

## Limitaciones y advertencias
- Solo inglés: la model card indica únicamente `en`; no se ha verificado soporte para otros idiomas.
- Formato propietario: el modelo solo funciona con FastFlowLM en NPU AMD; no es portable a otros entornos.
- Rendimiento de decodificación bajo: 7,94 tokens/s, lo que puede ser lento para interacciones en tiempo real.
- Dependencia de kernels cerrados: los kernels de FastFlowLM son código cerrado y no se distribuyen en este repositorio; se enlazan con los del modelo oficial `Gemma4-E4B-IT-NPU2`.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas.
- No hay información sobre sesgos específicos ni sobre el proceso de alineación del modelo base.
- La cuantización Q4NX puede degradar la calidad de las salidas respecto al modelo de precisión completa, aunque no se han documentado diferencias.

## Enlaces
- Repositorio en HuggingFace: [Atomic-Germ/Gemma4-E4B-GLM-FLASH-NPU2](https://huggingface.co/Atomic-Germ/Gemma4-E4B-GLM-FLASH-NPU2)
- Motor FastFlowLM: [https://fastflowlm.com](https://fastflowlm.com)
- Modelo base: [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- Página de Gemma 4 en Google DeepMind: [https://deepmind.google/models/gemma/gemma-4/](https://deepmind.google/models/gemma/gemma-4/)
- Model card de Gemma 4 en Google AI for Developers: [https://ai.google.dev/gemma/docs/core/model_card_4](https://ai.google.dev/gemma/docs/core/model_card_4)## Resumen
Gemma4-E4B-GLM-FLASH-NPU2 es una conversión en formato Q4NX del modelo Google Gemma-4-E4B-it, realizada por el usuario Atomic-Germ. Q4NX es el formato de cuantización nativo del motor FastFlowLM, diseñado para ejecutarse exclusivamente sobre las NPU AMD Ryzen AI con arquitectura XDNA2 (serie Strix Point / Ryzen AI 300 o posterior). No es un archivo GGUF ni safetensors, y no funciona con llama.cpp, Ollama, vLLM ni TGI; solo se ejecuta en el ecosistema FastFlowLM sobre la NPU de AMD.

El modelo base Gemma-4-E4B-it es una variante de la familia Gemma 4 de Google, que ofrece capacidades multimodales (entrada de imagen y audio) y una ventana de contexto de 131.072 tokens. Esta conversión mantiene las torres de visión y audio, aunque los pesos están cuantizados y reorganizados para adaptarse a los tamaños de tile y patrones de acceso a memoria de la NPU. El repositorio incluye el archivo de pesos principal `model.q4nx` (7,14 GB), los pesos de visión y audio, el tokenizador, la plantilla de chat y un script instalador (`flm-add.py`).

La relevancia de este modelo radica en que permite ejecutar un modelo multimodal de aproximadamente 4B de parámetros en hardware de consumo sin GPU, aprovechando la NPU integrada en procesadores AMD Ryzen AI. Según las pruebas del autor, alcanza una velocidad de prefill de 416,54 tokens/s y una decodificación de 7,94 tokens/s, lo que lo hace adecuado para tareas con gran carga de prompt y respuestas cortas, aunque la generación es lenta para interacción en tiempo real.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4) |
| Parámetros totales | No disponible (el modelo base es E4B, probablemente 4.4B, pero no se confirma) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (según config) |
| Tipos de cuantización | Q4NX (formato propietario de FastFlowLM) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (no safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo base es `google/gemma-4-E4B-it`, perteneciente a la familia Gemma 4 de Google. Según la documentación oficial, Gemma 4 incluye modelos de varios tamaños (E2B, E4B, 26B A4B y 31B) con arquitectura transformer y capacidades multimodales. No se dispone de detalles concretos sobre el número de parámetros ni sobre el proceso de entrenamiento del modelo base en la información proporcionada.

Este repositorio no es un entrenamiento original, sino una **conversión cuantizada** del modelo base. El autor lo describe como un "fine-tune estilo GLM-FLASH", pero no se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La conversión a Q4NX se limita a reorganizar los pesos para optimizarlos para la matriz de procesamiento de la NPU; no introduce cambios arquitectónicos adicionales.

## Capacidades
- Generación de texto conversacional, con plantilla de chat incluida.
- Entrada multimodal: incluye pesos de visión (`vision_weight.q4nx`) y audio (`audio_weight.q4nx`), lo que permite procesar imágenes y posiblemente audio.
- Ventana de contexto larga: 131.072 tokens, adecuada para documentos extensos o conversaciones de largo recorrido.
- Ejecución exclusiva en NPU AMD XDNA2 a través del motor FastFlowLM.
- No se menciona soporte para tool calling, function calling, agentes ni modo thinking en la documentación disponible.

## Casos de uso
- **Asistente local en portátiles con NPU**: se puede usar en un portátil con AMD Ryzen AI 300 o superior como asistente personal de chat, sin depender de la nube y con privacidad de datos.
- **Análisis de documentos largos**: con 131.072 tokens de contexto, permite resumir informes, contratos o código extenso en una sola pasada.
- **Descripción de imágenes**: gracias a la torre de visión, puede generar descripciones de imágenes en contextos como documentación de productos o accesibilidad.
- **Transcripción de audio**: con la torre de audio, podría utilizarse para transcribir grabaciones o extraer información de audio, aunque no se especifica la calidad.
- **Prototipado de IA en hardware de consumo**: desarrolladores pueden experimentar con modelos multimodales en NPU sin GPU, evaluando rendimiento y limitaciones.
- **Entornos con requisitos de seguridad**: al ejecutarse localmente, los datos no salen del dispositivo, útil para aplicaciones médicas, legales o financieras.

## Benchmarks y rendimiento
El autor proporciona un benchmark propio llamado "GhostWriter Influence Test", realizado en un portátil AMD Ryzen AI 340 (Framework 13). Es una prueba arbitraria y no estandarizada, pero ofrece datos de rendimiento concretos:

| Métrica | Valor |
|---|---|
| Tokens de prompt | 9.210 |
| Tokens de completion | 1.721 |
| Tokens totales | 10.986 |
| Tokens activos en KV cache | 10.986 |
| Capacidad máxima de KV tokens | 32.768 |
| Ocupación de KV | 33,53% |
| Duración de carga | 0,000000742 s |
| Prefill (TTFT) | 22,25 ms |
| Decodificación | 216,65 ms |
| Prefill speed | 416,54 tokens/s |
| Decoding speed | 7,94 tokens/s |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware
- **Procesador**: AMD Ryzen AI con arquitectura XDNA2 (NPU2), como la serie Strix Point / Ryzen AI 300 o posterior.
- **Sistema operativo**: Linux con la pila XRT para NPU instalada.
- **Memoria**: aproximadamente 15 GB de RAM unificada (pesos Q4NX + activaciones + KV cache).
- **Motor de inferencia**: FastFlowLM >= 0.9.45 (CLI `flm`). No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- **GPU**: no se requiere; la inferencia se realiza en la NPU.
- **Tamaño del archivo**: `model.q4nx` 7,14 GB; el repositorio completo ocupa 9,1 GB.
- **Instalación**: mediante `flm-add` (herramienta externa) o el script `flm-add.py` incluido.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros modelos de la misma categoría. La conversión es específica para FastFlowLM y NPU de AMD, por lo que no es comparable directamente con versiones GGUF o safetensors de otros modelos de 4B. El modelo base original `google/gemma-4-E4B-it` se ejecuta en frameworks estándar sobre GPU, pero no se han proporcionado resultados de rendimiento de esta conversión. Alternativas como Qwen2.5-4B o Phi-3-mini no tienen versión Q4NX ni soporte para NPU AMD en la información disponible.

## Limitaciones y advertencias
- **Idioma**: solo se indica `en` (inglés). No se ha verificado soporte para otros idiomas.
- **Formato propietario**: el modelo solo funciona con FastFlowLM en NPU AMD; no es portable a otros entornos.
- **Rendimiento de decodificación bajo**: 7,94 tokens/s, lo que puede ser insuficiente para interacciones en tiempo real.
- **Dependencia de kernels cerrados**: los kernels de la NPU no se distribuyen en este repositorio; se enlazan con los del modelo oficial `Gemma4-E4B-IT-NPU2`.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas.
- **Sesgos**: no se ha documentado información sobre sesgos específicos ni sobre el proceso de alineación del modelo base.
- **Degradación por cuantización**: la cuantización Q4NX puede reducir la calidad de las salidas respecto al modelo de precisión completa, aunque no se han medido diferencias.

## Enlaces
- Repositorio en HuggingFace: [Atomic-Germ/Gemma4-E4B-GLM-FLASH-NPU2](https://huggingface.co/Atomic-Germ/Gemma4-E4B-GLM-FLASH-NPU2)
- Motor FastFlowLM: [https://fastflowlm.com](https://fastflowlm.com)
- Modelo base: [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- Página de Gemma 4 en Google DeepMind: [https://deepmind.google/models/gemma/gemma-4/](https://deepmind.google/models/gemma/gemma-4/)
- Model card de Gemma 4 en Google AI for Developers: [https://ai.google.dev/gemma/docs/core/model_card_4](https://ai.google.dev/gemma/docs/core/model_card_4)
