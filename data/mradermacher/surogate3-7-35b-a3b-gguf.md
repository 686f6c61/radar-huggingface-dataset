# mradermacher/Surogate3.7-35B-A3B-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por Surogate, con 35.505.251.456 parámetros totales. La variante aquí descrita es la cuantización GGUF publicada por mradermacher a partir del modelo base original `surogate/Surogate3.7-35B-A3B`. El modelo está orientado a tareas de agente, uso de herramientas (tool-use) y razonamiento, según las etiquetas declaradas por el autor.

La ficha se centra en el repositorio GGUF, que ofrece un conjunto amplio de cuantizaciones estáticas (desde Q2_K hasta Q8_0, además de IQ4_XS y ficheros mmproj multimodales) para facilitar el despliegue en entornos con recursos limitados mediante llama.cpp y ecosistemas compatibles. El tamaño del repositorio es de 244,4 GB, lo que refleja la suma de todas las variantes publicadas.

Es relevante ahora porque combina un diseño MoE de 35B con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y porque la disponibilidad de cuantizaciones GGUF facilita su ejecución en hardware de consumo, algo poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE), tal como indican las etiquetas del repositorio y el nombre del modelo (35B-A3B). El sufijo "A3B" sugiere del orden de 3 mil millones de parámetros activos por token, aunque el dato exacto de parámetros activos no se ha publicado en la información disponible. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La información disponible no incluye innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de la propia naturaleza MoE del modelo y su orientación declarada a agentes, tool-use y razonamiento. El repositorio GGUF incluye ficheros `mmproj` (Q8_0 y f16), lo que indica que el modelo base incorpora capacidades multimodales (visión), aunque el alcance exacto no está documentado en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento (etiqueta `reasoning` declarada por el autor).
- Uso de herramientas y function calling (etiqueta `tool-use`).
- Comportamiento orientado a agentes (etiqueta `agent`).
- Capacidades multimodales: la presencia de ficheros `mmproj` en el repositorio GGUF indica soporte de entrada visual, aunque los detalles no están documentados.
- Soporte multilingüe limitado: solo se declara inglés (`en`).
- Compatibilidad con endpoints (`endpoints_compatible` según las etiquetas).

## Casos de uso

- Agentes autónomos con uso de herramientas: el modelo está etiquetado explícitamente para `agent` y `tool-use`, por lo que puede integrarse en bucles de razonamiento multi-paso que invoquen APIs externas, bases de datos o funciones definidas por el desarrollador.
- Automatización de flujos de trabajo con function calling: adecuado para pipelines donde el modelo decide qué herramienta invocar y con qué argumentos, gracias a su orientación declarada a tool-use.
- Asistente conversacional en inglés: puede desplegarse como chatbot multi-turno mediante llama.cpp u Ollama usando las cuantizaciones Q4_K_M o Q5_K_M, que ofrecen un equilibrio razonable entre calidad y tamaño (21,8 GB y 25,4 GB respectivamente).
- Razonamiento asistido en entornos con recursos limitados: las cuantizaciones Q2_K (13,3 GB) y Q3_K_S (15,6 GB) permiten ejecutar un modelo de 35B en GPUs de consumo de gama alta, algo inviable con los pesos completos.
- Procesamiento de documentos con componente visual: los ficheros `mmproj` permiten combinar el modelo con un codificador visual para tareas de descripción de imágenes o extracción de información, siempre que se valide el soporte efectivo en el runtime elegido.
- Prototipado e investigación: la licencia Apache 2.0 y la disponibilidad de múltiples cuantizaciones facilitan experimentación académica y evaluación comparativa sin restricciones de uso comercial.
- Despliegue en servidores de inferencia: la variante Q8_0 (37,9 GB) puede servirse en GPUs con 48 GB o más (A6000, A100 40/80 GB) para obtener la máxima calidad dentro del formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - Q2_K: ~13,3 GB.
  - Q3_K_S: ~15,6 GB.
  - Q3_K_M: ~17,3 GB.
  - Q3_K_L: ~18,7 GB.
  - IQ4_XS: ~19,5 GB.
  - Q4_K_S: ~20,5 GB.
  - Q4_K_M: ~21,8 GB.
  - Q5_K_S: ~24,7 GB.
  - Q5_K_M: ~25,4 GB.
  - Q6_K: ~29,3 GB.
  - Q8_0: ~37,9 GB.
  - mmproj-Q8_0: ~0,7 GB adicionales; mmproj-f16: ~1,0 GB adicionales.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S/Q4_K_M con contexto moderado; RTX 3090 (24 GB) similar; A6000 (48 GB) o A100 40/80 GB para Q6_K y Q8_0; configuraciones multi-GPU para Q8_0 con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; las cuantizaciones Q2_K y Q3_K_S también podrían ejecutarse en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y otros runtimes compatibles con GGUF. Para el modelo base en safetensors, transformers y servidores compatibles (vLLM, TGI) según soporte del autor original.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de parámetros activos que permitan una comparación cuantitativa rigurosa con alternativas de la misma categoría. A continuación se indica la información estructural disponible:

| Modelo | Parámetros totales | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Surogate3.7-35B-A3B | 35,5B (MoE) | no disponible | Apache 2.0 | Sí |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables concretos con datos verificables.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinación; debe validarse en producción.
- Sesgos: no se documenta información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- Contexto: la longitud de contexto no está publicada; debe consultarse la model card del modelo base (`surogate/Surogate3.7-35B-A3B`) antes de diseñar aplicaciones que dependan de ventanas largas.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opción rápida.
- Multimodalidad: la presencia de ficheros `mmproj` no garantiza que todos los runtimes GGUF soporten correctamente la entrada visual; debe validarse con el runtime concreto.
- Parámetros activos: al desconocerse el número exacto, las estimaciones de latencia y throughput son inciertas.
- Repositorio de cuantización: esta ficha describe una cuantización de terceros (mradermacher); para información canónica sobre entrenamiento, contexto y evaluación debe consultarse el modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Surogate3.7-35B-A3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
