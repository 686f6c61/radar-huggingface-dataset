# kavishbhardwaj/tds-green-ai-audit

## Resumen

El repositorio `kavishbhardwaj/tds-green-ai-audit` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de carbono asociado a una ejecución de entrenamiento concreta. Su autor, kavishbhardwaj, ha publicado únicamente metadatos de emisiones de CO₂ equivalente (35,763 kg) generados durante un proceso de fine-tuning realizado en hardware NVIDIA A100, con localización geográfica en europe-north1 y medidos mediante la herramienta CodeCarbon. La model card lo describe explícitamente como "Carbon accounting metadata for the assigned training run".

Este tipo de repositorios forma parte de iniciativas de "Green AI" que buscan documentar el impacto ambiental del entrenamiento de modelos, en este caso dentro de un contexto académico o de evaluación (las siglas TDS sugieren una asignación de un curso o proyecto). No se proporciona ninguna información sobre arquitectura, parámetros, tareas o capacidades del supuesto modelo entrenado, por lo que no puede tratarse como un modelo utilizable ni comparable con otros sistemas de IA. Su relevancia es exclusivamente contable y de transparencia ambiental, no funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un registro de emisiones) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El contenido se limita a metadatos de emisiones: 35,763 kg de CO₂ equivalente, generados durante un fine-tuning, medidos con CodeCarbon, en una GPU NVIDIA A100 ubicada en la región europe-north1. No se detalla el dataset, el número de pasos, el modelo base ni ninguna técnica de entrenamiento. La ausencia de cualquier archivo de pesos, configuración o código hace imposible analizar el proceso técnico subyacente.

## Capacidades

- No se han documentado capacidades de generación de texto, razonamiento, código, visión ni ninguna otra.
- No hay soporte de tool calling, agentes, ni razonamiento multi-paso.
- No hay capacidades multilingües ni modos especiales (thinking, visión, audio).
- El único dato funcional es la medición de emisiones de CO₂, que no constituye una capacidad del modelo.

## Casos de uso

- Auditoría ambiental de entrenamientos: el repositorio sirve como evidencia de la huella de carbono de un proceso de fine-tuning concreto, útil para informes de sostenibilidad en entornos académicos o empresariales.
- Cumplimiento de políticas de Green AI: puede utilizarse como ejemplo de cómo documentar emisiones en proyectos de IA, siguiendo prácticas como las de CodeCarbon.
- Investigación sobre eficiencia energética: los datos de emisiones y hardware pueden alimentar estudios comparativos sobre el coste ambiental de distintos entrenamientos.
- Transparencia en publicación de modelos: aunque aquí no hay modelo, el formato demuestra cómo adjuntar metadatos ambientales a un repositorio de Hugging Face.
- Educación en computación responsable: útil como caso práctico en cursos que enseñan a medir y reportar el impacto climático del machine learning.
- Trazabilidad de experimentos: el registro permite reconstruir las condiciones de hardware y localización de un entrenamiento pasado, aunque no los detalles del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir un modelo, no hay métricas de precisión, latencia ni throughput que reportar.

## Requisitos de hardware

- No aplica: no hay modelo que ejecutar.
- El único dato de hardware es la GPU utilizada en el entrenamiento: NVIDIA A100.
- No se requiere VRAM para inferencia porque no existe ningún artefacto de inferencia.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) asociadas a este repositorio.

## Comparativa con modelos similares

No disponible. Existen otros repositorios con el mismo propósito de auditoría de carbono en Hugging Face, como `mri2026tds/green-ai-carbon-audit` o `harshit4/tds-ga8-green-ai-audit`, pero todos son registros de emisiones y no modelos comparables. No hay alternativas funcionales en esta categoría porque no se trata de un modelo de IA.

## Limitaciones y advertencias

- No contiene ningún modelo, peso o configuración: es únicamente un archivo de metadatos.
- No se puede utilizar para ninguna tarea de procesamiento del lenguaje, visión o razonamiento.
- La licencia no está especificada, por lo que su reutilización legal es incierta.
- Los datos de emisiones son específicos de una ejecución concreta y no generalizables a otros entrenamientos.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que es un artefacto de práctica o evaluación, no un recurso de producción.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad porque no existe un sistema que pueda generarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kavishbhardwaj/tds-green-ai-audit
- Repositorio similar (mri2026tds): https://huggingface.co/mri2026tds/green-ai-carbon-audit
- Repositorio similar (harshit4): https://huggingface.co/harshit4/tds-ga8-green-ai-audit
- GitHub del autor (repositorio de releases): https://github.com/kavishbhardwaj/TDS/releases
- GitHub del autor (otro proyecto relacionado): https://github.com/kavishbhardwaj/tds-ga7
