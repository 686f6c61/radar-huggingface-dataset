# sangam-jha/tds-carbon-card

## Resumen

El repositorio `sangam-jha/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono correspondiente al entrenamiento de un modelo dentro del programa académico TDS GA8. El autor, Sangam Jha, documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante un proceso de fine-tuning. No se proporciona información sobre la arquitectura, los parámetros o las capacidades del modelo subyacente, ya que el objetivo del repositorio es exclusivamente la medición del impacto ambiental.

Este tipo de repositorios se enmarca en iniciativas de Green AI, que buscan cuantificar y reducir la huella de carbono de los entrenamientos de modelos. Aunque no ofrece un modelo utilizable, sirve como referencia para prácticas de transparencia ambiental en el desarrollo de IA. Los datos reportados incluyen 147,532 kg de CO₂eq, 1229,43 kWh de energía y 277,9 horas de GPU en una configuración de 4 NVIDIA H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Emisiones de CO₂eq | 147,532 kg |
| Energia total consumida | 1229,43 kWh |
| Hardware de entrenamiento | 4x NVIDIA H100 |
| Region de computo | europe-north1 |
| Tipo de entrenamiento | fine-tuning |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre el dataset utilizado. El unico dato de entrenamiento disponible es que se realizo un fine-tuning con 4 GPUs NVIDIA H100 durante 277,9 horas, con un PUE de 1,58. El consumo energetico total fue de 1229,43 kWh y las emisiones asociadas de 147,532 kg de CO₂eq, calculadas mediante la herramienta CodeCarbon. No se menciona el uso de tecnicas como RLHF, DPO ni ninguna innovacion arquitectonica.

## Capacidades

- No aplica: el repositorio no contiene un modelo de IA con capacidades de generacion, razonamiento, codigo, vision o audio.
- No se proporciona soporte para tool calling, agentes o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni modos especiales de funcionamiento.

## Casos de uso

- Auditoria ambiental de entrenamientos de IA: el repositorio sirve como plantilla para documentar la huella de carbono de un proceso de entrenamiento, siguiendo metodologias como CodeCarbon.
- Investigacion en Green AI: los datos de emisiones y consumo pueden utilizarse para comparar la eficiencia energetica de diferentes configuraciones de hardware y regiones de computo.
- Cumplimiento de politicas de sostenibilidad: organizaciones que requieran reportar el impacto ambiental de sus cargas de trabajo de IA pueden usar este tipo de registros como evidencia.
- Educacion y formacion: el repositorio ejemplifica como los estudiantes pueden integrar la contabilidad de carbono en sus proyectos de aprendizaje automatico.
- Optimizacion de recursos: los datos de PUE y horas de GPU permiten analizar el coste energetico y buscar alternativas mas eficientes.
- Transparencia en publicaciones cientificas: los autores pueden adjuntar este tipo de informacion a sus papers para cumplir con los requisitos de reproducibilidad y responsabilidad ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene metricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros sistemas.

## Requisitos de hardware

- El entrenamiento descrito utilizo 4 GPUs NVIDIA H100, con un total de 277,9 horas de computo.
- No se especifican requisitos de hardware para inferencia, ya que no se distribuye ningun modelo.
- No hay indicaciones sobre VRAM, GPU recomendadas para despliegue, latencia o throughput.
- Dado que no existe un modelo, no es aplicable el despliegue con vLLM, llama.cpp, Ollama, TGI u otras herramientas.

## Comparativa con modelos similares

No disponible. No se trata de un modelo de IA, por lo que no es posible compararlo con alternativas como Llama, Mistral o Qwen. Los unicos repositorios similares son otros `tds-carbon-card` de otros estudiantes (por ejemplo, `shyam1504/tds-carbon-card` y `pranhai/tds-carbon-card`), que documentan sus respectivos entrenamientos con la misma estructura.

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable; es solo un registro de metadatos ambientales.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto, ya que no existe un sistema de IA.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido es reutilizable comercialmente.
- Los datos de emisiones dependen de la herramienta CodeCarbon y de los factores de emision de la region europe-north1; pueden no ser directamente comparables con otras mediciones.
- La fecha de creacion (2026-08-28) es posterior a la fecha actual, lo que sugiere que el repositorio podria ser parte de un ejercicio academico futuro o un error en la metadata.
- Para uso en produccion, este repositorio no aporta ninguna capacidad de inferencia ni de procesamiento de datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sangam-jha/tds-carbon-card
- Repositorio similar de otro autor: https://huggingface.co/shyam1504/tds-carbon-card
- Repositorio similar de otro autor: https://huggingface.co/pranhai/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/sangam-jha
- Repositorio relacionado en GitHub: https://github.com/sangam-jha/tds-ga7-release-gate
