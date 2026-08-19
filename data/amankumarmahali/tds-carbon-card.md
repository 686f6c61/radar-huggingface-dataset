# amankumarmahali/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial funcional, sino una ficha de contabilidad de carbono (carbon card) que documenta el impacto ambiental de una ejecución de fine-tuning realizada en el contexto del curso TDS GA8. El autor, Aman Kumar Mahali, estudiante de Data Science en IIT Madras, publica este artefacto como parte de un ejercicio académico de transparencia ambiental en el entrenamiento de modelos.

La ficha registra las emisiones de CO₂ equivalente (179,565 kg) asociadas a un proceso de fine-tuning ejecutado sobre 5 GPU NVIDIA H100 en la región us-central1 de Google Cloud, con un consumo energético total de 513,044 kWh y 100,4 horas de cómputo. No se especifica qué modelo base se ajustó ni qué tarea se abordó, por lo que el valor de este repositorio es exclusivamente documental y metodológico, alineado con iniciativas como carbon.txt y el directorio de sostenibilidad de modelos de IA.

Al tratarse de un artefacto de contabilidad energética y no de un modelo desplegable, las especificaciones técnicas convencionales (arquitectura, parámetros, contexto) no son aplicables ni están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo funcional) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura de red, ya que este repositorio no publica un modelo. Los únicos datos de entrenamiento documentados corresponden a la ejecución de fine-tuning: 5 GPU NVIDIA H100, 100,4 horas de cómputo GPU con un factor de eficiencia energética (PUE) de 1,46, y un consumo total de 513,044 kWh. Las emisiones se calcularon mediante la herramienta CodeCarbon, que estima el CO₂ equivalente en función del hardware, la ubicación geográfica y el consumo eléctrico. La región us-central1 determina el mix energético de la red eléctrica utilizado en el cálculo.

No se indica el dataset empleado, el modelo base, ni si se aplicaron técnicas como RLHF, DPO o ajuste por instrucciones.

## Capacidades

- No es un modelo de generación de texto, razonamiento, código ni visión.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso.
- No ofrece capacidades multilingües ni modos especiales de inferencia.
- Su única función es documentar métricas de sostenibilidad: emisiones de CO₂, consumo energético, horas de cómputo y ubicación geográfica del entrenamiento.

## Casos de uso

- Auditoría ambiental de entrenamiento de modelos: la ficha sirve como registro verificable de las emisiones asociadas a una ejecución de fine-tuning, útil para organizaciones que necesitan reportar su huella de carbono ante regulaciones o compromisos ESG.
- Educación en Green AI: el repositorio ejemplifica cómo documentar el impacto energético de un entrenamiento, y puede usarse como caso práctico en cursos sobre IA sostenible o computación responsable.
- Cumplimiento del estándar carbon.txt: la inclusión de metadatos `co2_eq_emissions` con fuente CodeCarbon permite que herramientas automáticas (como el validador de carbontxt.org) indexen y verifiquen la declaración de emisiones.
- Comparación de eficiencia entre configuraciones de hardware: los datos de 5 GPU H100 con PUE 1,46 permiten contrastar el coste energético de diferentes infraestructuras de entrenamiento.
- Elaboración de informes de transparencia: empresas e instituciones pueden replicar esta estructura de model card para publicar informes periódicos de sostenibilidad de sus cargas de trabajo de IA.
- Investigación metodológica sobre medición de emisiones: el uso de CodeCarbon con localización geográfica específica (us-central1) ofrece un punto de referencia para estudios sobre la variabilidad regional del mix eléctrico en el coste ambiental del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, dado que este repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- El entrenamiento documentado utilizó 5 GPU NVIDIA H100, aunque no se especifica la configuración exacta (VRAM por GPU, interconexión, memoria del host).
- No se indican requisitos para inferencia, ya que no se distribuyen pesos ni artefactos de modelo.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.
- El consumo energético registrado es de 513,044 kWh para 100,4 horas de GPU, lo que equivale a un consumo medio aproximado de 5,11 kW durante la ejecución, consistente con la operación de varias H100 a plena carga.

## Comparativa con modelos similares

No se dispone de modelos comparables, ya que este repositorio no es un modelo de IA sino un artefacto de contabilidad de carbono. Existen otros repositorios con la misma finalidad en Hugging Face (por ejemplo, `anant-venkatesh1/tds-carbon-card`), pero no contienen datos de rendimiento de modelos que permitan una comparación técnica. La comparativa relevante sería metodológica: cómo distintas herramientas (CodeCarbon, ML CO2 Impact, Green Algorithms) estiman emisiones para la misma carga de trabajo, pero esa información no está disponible en este repositorio.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional: no se puede descargar, cargar ni ejecutar para ninguna tarea de IA.
- No se especifica qué modelo base se sometió a fine-tuning, lo que impide contextualizar la relevancia de las emisiones registradas.
- Las emisiones calculadas dependen del mix eléctrico de la región us-central1 y del factor PUE declarado; variaciones en estos parámetros alterarían significativamente las cifras.
- No se indica la licencia de uso del contenido del repositorio, por lo que su reutilización comercial no está explícitamente autorizada.
- El repositorio tiene cero descargas y cero likes, y no se ha actualizado desde su creación; no hay evidencia de mantenimiento activo.
- La fecha de creación (2026-08-19) es posterior a la fecha de los resultados de búsqueda disponibles, lo que sugiere que el contenido puede ser muy reciente y no haber sido revisado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amankumarmahali/tds-carbon-card
- Repositorio similar del mismo curso: https://huggingface.co/anant-venkatesh1/tds-carbon-card
- Directorio de sostenibilidad de modelos de IA (carbon.txt): https://carbontxt.org/ai-model-cards
- Artículo sobre model cards en carbon.txt: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Perfil de GitHub del autor: https://github.com/amankumarmahali/
- Space de Hugging Face del autor: https://huggingface.co/spaces/amankumarmahali/tds-ga3
