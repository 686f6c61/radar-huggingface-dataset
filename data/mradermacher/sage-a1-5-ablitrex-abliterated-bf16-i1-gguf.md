# mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF

## Resumen

Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF es una recuantización en formato GGUF realizada por mradermacher a partir del modelo mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16. Se trata de un modelo de lenguaje conversacional de aproximadamente 34.660 millones de parámetros (34,66B) en precisión BF16, del cual se han generado variantes cuantizadas con imatrix (i1) para su uso en llama.cpp y otros entornos compatibles con GGUF. El modelo original es una versión "abliterated" de Sage-A1.5, una técnica que elimina o atenúa los mecanismos de rechazo del modelo, orientada a usos donde se requiere menor censura en las respuestas.

La relevancia de esta ficha radica en que proporciona un conjunto amplio de cuantizaciones (desde IQ1_S de 7,6 GB hasta Q5_K_M de 24,8 GB) que permiten ejecutar un modelo de 34,66B en hardware de consumo, algo imposible con los pesos BF16 originales (que ocuparían aproximadamente 69 GB). La model card indica además que se trata de un modelo de visión, con archivos mmproj disponibles en el repositorio estático del mismo autor.

La información disponible es limitada: la model card del repositorio de cuantización es fundamentalmente una tabla de archivos GGUF, sin datos sobre arquitectura interna, datos de entrenamiento, benchmarks o longitud de contexto. Por tanto, muchos campos de esta ficha se marcan como "no disponible" conforme a la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 34,66B parámetros; detalles internos no especificados) |
| Parámetros totales | 34.660.610.688 (34,66B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en BF16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El dato objetivo es el número de parámetros (34.660.610.688), lo que sitúa al modelo en la categoría de ~35B. El nombre "Ablitrex-abliterated" sugiere que se ha aplicado una técnica de abliteration sobre el modelo Sage-A1.5, un procedimiento que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones, aunque no se detallan los métodos exactos ni el proceso de entrenamiento.

Respecto a los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), no hay información disponible en la model card proporcionada. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio de cuantización se limita a describir el proceso de cuantización con imatrix (weighted/imatrix quants) y a listar los archivos generados.

## Capacidades

- Generación de texto conversacional en inglés (etiqueta "conversational" en los metadatos).
- Capacidad de visión: la model card indica explícitamente "This is a vision model", con archivos mmproj disponibles en el repositorio estático del mismo autor.
- Modelo "abliterated": orientado a reducir rechazos y restricciones en las respuestas, lo que puede resultar útil en entornos de investigación que requieren menor censura.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y censura: el modelo abliterated permite estudiar el comportamiento de un LLM sin los mecanismos de rechazo habituales, útil para analizar sesgos y respuestas en condiciones controladas de laboratorio.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (21,3 GB) o i1-IQ4_XS (18,8 GB) permiten ejecutar un modelo de 34,66B en GPUs con 24 GB de VRAM, como la RTX 4090, mediante llama.cpp.
- Generación de texto creativo sin restricciones: para proyectos de escritura que requieren respuestas sin filtros temáticos, siempre que se cumplan los requisitos legales y éticos del contexto de uso.
- Procesamiento de imágenes con modelos de visión: gracias a los archivos mmproj, puede emplearse en tareas de descripción de imágenes o análisis visual, aunque no se detallan las capacidades exactas.
- Experimentación con cuantizaciones extremas: las variantes IQ1_S (7,6 GB) e IQ2_XXS (9,6 GB) permiten probar el modelo en hardware muy limitado, evaluando el compromiso calidad/tamaño.
- Fine-tuning o investigación sobre modelos abliterated: el modelo base BF16 puede servir como punto de partida para experimentos de modificación de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - i1-IQ1_S: 7,6 GB
  - i1-IQ2_XXS: 9,6 GB
  - i1-IQ2_M: 11,8 GB
  - i1-Q2_K: 13,0 GB
  - i1-IQ3_XXS: 13,7 GB
  - i1-IQ3_XS: 14,6 GB
  - i1-IQ3_S: 15,4 GB
  - i1-Q3_K_M: 16,9 GB
  - i1-IQ4_XS: 18,8 GB
  - i1-Q4_K_S: 20,0 GB
  - i1-Q4_K_M: 21,3 GB
  - i1-Q5_K_M: 24,8 GB
  - i1-Q6_K: no disponible en el fragmento (probablemente ~27-28 GB)
- GPU recomendadas: para las cuantizaciones de mayor calidad (Q4_K_M, Q5_K_M) se recomienda una GPU con 24 GB o más de VRAM (RTX 3090, RTX 4090, A100 40GB, H100). Para cuantizaciones bajas (IQ1-IQ2) puede bastar con 8-12 GB de VRAM.
- ¿Cabe en GPU de consumo? Sí, en las cuantizaciones bajas y medias. La RTX 4090 (24 GB) puede ejecutar hasta i1-Q4_K_M (21,3 GB) con margen ajustado; la RTX 3090 también. Para Q5_K_M sería recomendable una GPU de 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia genérica de categoría, se podría comparar con otros modelos de ~34B en GGUF, pero no hay datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF | 34,66B | no disponible | MIT | GGUF | Este modelo |
| Alternativas de ~34B | no disponible | no disponible | no disponible | no disponible | Sin datos para comparar |

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; el soporte de otros idiomas no está garantizado.
- Al ser un modelo "abliterated", presenta una menor tendencia a rechazar peticiones, lo que puede generar contenido inapropiado, ofensivo o peligroso. No se recomienda su uso en producción sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos específicos sobre su tasa de alucinación.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Aunque la licencia es MIT, el uso comercial debe evaluarse con cautela debido a la naturaleza abliterated del modelo y a posibles implicaciones legales o éticas.
- Las cuantizaciones de muy baja precisión (IQ1, IQ2) degradan notablemente la calidad; la propia model card advierte "very low quality" para Q2_K_S y "for the desperate" para IQ1_S.
- El repositorio tiene un tamaño de 371 GB, lo que refleja la gran cantidad de archivos; la descarga debe planificarse según la cuantización elegida.
- No hay información sobre sesgos específicos, pero los modelos abliterated pueden amplificar sesgos presentes en los datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF
- Modelo base: https://huggingface.co/mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Sage-A1.5-Ablitrex-abliterated-BF16-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Sage-A1.5-Ablitrex-abliterated-BF16-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
