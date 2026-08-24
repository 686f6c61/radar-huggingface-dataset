# Nyasa17/green-ai-hf

## Resumen

El repositorio `Nyasa17/green-ai-hf` no contiene un modelo de inteligencia artificial, sino un informe de auditoría de emisiones de carbono asociado a un entrenamiento de GPU. Publicado por el usuario Nyasa17, el repositorio documenta el cálculo de la huella de CO₂ equivalente de un proceso de pre-entrenamiento realizado en hardware NVIDIA RTX 4090, siguiendo la metodología del framework Green AI Model. La model card incluye los parámetros del cómputo (potencia, número de GPUs, horas de uso, PUE y factor de intensidad de red eléctrica) y reporta un total de 302,475 kg de CO₂ equivalente.

Este repositorio es relevante en el contexto de la sostenibilidad en IA, ya que proporciona un ejemplo concreto de cómo cuantificar el impacto ambiental de un entrenamiento. No obstante, carece de cualquier artefacto de modelo (pesos, tokenizador, configuración) y no ofrece capacidades de inferencia. Su utilidad es exclusivamente documental y metodológica para prácticas de Green AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red neuronal, datos de entrenamiento o técnicas de optimización, ya que el repositorio no incluye ningún modelo. La única información de entrenamiento es la relativa al cómputo de emisiones: se utilizaron 7 GPUs NVIDIA RTX 4090 (450 W TDP cada una) durante 187,4 horas, con un PUE de 1,22 y una intensidad de red de 420 gCO₂eq/kWh en la región us-east1. El cálculo de energía y emisiones se detalla en la model card, pero no se especifica qué tipo de modelo se entrenó ni con qué datos.

## Capacidades

- No presenta capacidades de generación de texto, razonamiento, código, visión u otras propias de un modelo de IA.
- El repositorio únicamente documenta un cálculo de emisiones de carbono, sin funcionalidad ejecutable.
- No hay soporte de tool calling, agentes, ni capacidades multilingües.
- Su única "capacidad" es servir como registro de auditoría ambiental de un entrenamiento.

## Casos de uso

- Auditoría de emisiones en proyectos de IA: el repositorio sirve como plantilla para reportar la huella de carbono de un entrenamiento, siguiendo el estándar de la iniciativa Green AI. Un equipo de ML puede replicar la metodología para documentar sus propios cómputos.
- Cumplimiento de políticas de sostenibilidad: organizaciones que necesiten justificar el impacto ambiental de sus cargas de trabajo de IA pueden usar este tipo de informes como evidencia en memorias de responsabilidad corporativa.
- Investigación en eficiencia energética: los datos de consumo (720,1782 kWh) y emisiones (302,475 kg CO₂eq) pueden compararse con otros entrenamientos para estudiar la relación entre hardware, ubicación y huella de carbono.
- Educación en Green AI: el ejemplo sirve para enseñar a estudiantes y desarrolladores cómo calcular emisiones a partir de TDP, horas de GPU, PUE y factor de red.
- Optimización de infraestructura: los responsables de clústeres pueden usar estos datos para decidir entre regiones con menor intensidad de carbono o hardware más eficiente.
- Documentación de reproducibilidad: al incluir el desglose del cálculo, el repositorio permite verificar y auditar de forma transparente el impacto ambiental de un entrenamiento concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de rendimiento de ningún modelo, ya que no incluye un modelo en sí.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo que ejecutar.
- El hardware reportado en el entrenamiento es: 7 × NVIDIA RTX 4090 (450 W TDP), con un total de 187,4 GPU-horas.
- No se proporcionan requisitos de VRAM, GPU recomendadas para despliegue, ni opciones de inferencia (vLLM, llama.cpp, Ollama, TGI, etc.).
- El consumo energético total calculado es de 720,1782 kWh, con un PUE de 1,22.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, dado que este repositorio no es un modelo de IA sino un informe de emisiones. No se pueden comparar parámetros, contexto, rendimiento ni licencia con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo de IA: no es posible usarlo para generación, clasificación ni ninguna tarea de ML.
- La licencia no está especificada, por lo que no se garantiza el uso comercial o la redistribución del contenido.
- Los datos de emisiones se basan en estimaciones (TDP, PUE, intensidad de red) y no en mediciones directas de consumo real; pueden diferir de la energía efectivamente consumida.
- La metodología asume un factor de emisión de 420 gCO₂eq/kWh para us-east1, que puede variar con el tiempo y la fuente de generación eléctrica.
- No se indica qué modelo se entrenó, por lo que la información no es reproducible en términos de arquitectura o dataset.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nyasa17/green-ai-hf
- Sitio del Green AI Model: https://green-ai-model.github.io/
- Documentación de introducción del Green AI Model: https://green-ai-model.github.io/docs/1_introduction/
