# harshitsingh911/tds-carbon-card

## Resumen

El repositorio `harshitsingh911/tds-carbon-card` no contiene un modelo de IA propiamente dicho, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella de emisiones de una ejecución de entrenamiento realizada en el marco de la asignatura TDS GA8. Este tipo de artefactos forma parte de la iniciativa Green AI, cuyo objetivo es visibilizar el coste medioambiental del entrenamiento de modelos y fomentar prácticas de aprendizaje automático más sostenibles.

El documento recoge que el entrenamiento se ejecutó en tres GPU NVIDIA V100 en la región cloud `ap-southeast1`, con un total de 289 horas de cómputo, un consumo energético de 322,524 kWh y unas emisiones de 154,812 kg de CO₂ equivalente, calculadas mediante la herramienta CodeCarbon. No se especifica arquitectura, número de parámetros ni ningún otro detalle técnico del modelo entrenado, ya que el propósito del repositorio no es distribuir pesos ni ofrecer capacidades de inferencia, sino registrar la trazabilidad medioambiental del proceso.

La relevancia de este repositorio es metodológica: ejemplifica cómo documentar el impacto energético del entrenamiento siguiendo estándares de reproducibilidad y transparencia. Existen múltiples repositorios homónimos creados por otros estudiantes (ayeshaalvi, aruneshpratapsingh, Hrishi-iitm, 23f3000911, 23f3001819) con la misma estructura, lo que sugiere una práctica académica estandarizada dentro del programa TDS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo cuyo entrenamiento se documenta. La tarjeta únicamente detalla los parámetros de consumo del proceso de entrenamiento: se utilizaron tres GPU NVIDIA V100 en modo de pre-entrenamiento, con un total de 289 horas de GPU y un factor de eficiencia energética del centro de datos (PUE) de 1,24. El consumo total de energía fue de 322,524 kWh, lo que resultó en 154,812 kg de CO₂ equivalente, calculados con la librería CodeCarbon. La región geográfica del cómputo fue `ap-southeast1` (Singapur).

No se mencionan técnicas como RLHF, DPO, decodificación especulativa ni ninguna otra innovación de entrenamiento. El repositorio es exclusivamente una ficha de auditoría medioambiental.

## Capacidades

- No se trata de un modelo con capacidades de inferencia, generación de texto, razonamiento, código o visión.
- Su función es documental: registrar emisiones de CO₂, consumo energético y uso de hardware de una ejecución de entrenamiento.
- Proporciona trazabilidad medioambiental reproducible mediante los datos de CodeCarbon incluidos en el frontmatter de la model card.
- Permite comparar el coste energético de distintas configuraciones de entrenamiento dentro del programa TDS GA8, ya que existen tarjetas equivalentes de otros participantes.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: permite registrar y reportar el impacto medioambiental de un entrenamiento concreto, algo cada vez más exigido por políticas ESG corporativas.
- Reproducibilidad de experimentos: al documentar hardware, horas de GPU, región y PUE, otros equipos pueden replicar o estimar el coste energético de entrenamientos similares.
- Docencia en Green AI: sirve como ejemplo práctico de cómo usar CodeCarbon y cómo estructurar una model card con métricas de emisiones, dentro de un curso universitario.
- Comparativa de eficiencia entre configuraciones: con varias tarjetas homónimas disponibles, se puede analizar cómo varían las emisiones según hardware y región.
- Cumplimiento normativo: en entornos donde se exige declarar la huella de carbono de los sistemas de IA, este formato puede adaptarse como plantilla interna.
- Optimización de costes energéticos: los datos de energía y emisiones permiten decidir entre regiones cloud o tipos de GPU más eficientes para futuros entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no reporta métricas de calidad del modelo entrenado (MMLU, HumanEval, GSM8K, etc.), únicamente métricas de consumo energético y emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 3 GPU NVIDIA V100.
- No se especifica la VRAM de las GPU ni los requisitos de inferencia, ya que no se distribuyen pesos.
- El consumo energético total fue de 322,524 kWh para 289 horas de GPU, lo que implica un consumo medio aproximado de 1,116 kW por GPU durante el entrenamiento.
- No se ofrecen opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay modelo que servir.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas de la misma categoría. Existen repositorios homólogos de otros estudiantes del mismo programa (ayeshaalvi, aruneshpratapsingh, Hrishi-iitm, 23f3000911, 23f3001819) con la misma estructura de tarjeta de carbono, pero ninguno publica especificaciones de modelo.

## Limitaciones y advertencias

- No contiene ningún modelo entrenado ni pesos: no es utilizable para inferencia ni para ninguna tarea de IA.
- Los datos de emisiones dependen de la metodología de CodeCarbon y del factor de emisión de la región `ap-southeast1`; no son directamente extrapolables a otras regiones.
- No se especifica qué modelo se entrenó, con qué datos ni con qué configuración, lo que limita la utilidad del registro para reproducir el experimento completo.
- La licencia no está definida, por lo que no está claro si los datos de la tarjeta pueden reutilizarse en otros proyectos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado ni utilizado por la comunidad.
- La fecha de creación (agosto de 2026) y el contexto académico sugieren que es un ejercicio de clase, no un artefacto de producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/harshitsingh911/tds-carbon-card
- Repositorios homólogos del mismo programa:
  - https://huggingface.co/ayeshaalvi/tds-carbon-card
  - https://huggingface.co/aruneshpratapsingh/tds-carbon-card
  - https://huggingface.co/Hrishi-iitm/tds-carbon-card
  - https://huggingface.co/23f3000911/tds-carbon-card
  - https://huggingface.co/23f3001819/tds-carbon-card
