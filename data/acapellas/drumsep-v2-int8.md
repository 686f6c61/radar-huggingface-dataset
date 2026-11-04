# Acapellas/drumsep-v2-int8

## Resumen

DrumSep v2 int8 es una conversión no oficial del modelo de separación de fuentes de audio DrumSep v2, originalmente desarrollado por inagoy y distribuido en formato ONNX por Gridshift Studio. Esta variante, publicada por el usuario Acapellas, traslada los pesos del export ONNX a un `state_dict` de PyTorch compatible con la clase `HDemucs` de la librería Demucs, almacenando las matrices de pesos en formato int8. No ha habido reentrenamiento: se trata exclusivamente de una conversión de formato y cuantización.

El modelo pertenece a la familia Hybrid Demucs, una arquitectura híbrida (convolucional en dominio temporal y espectral) diseñada para separar pistas de audio en componentes instrumentales. En este caso, el objetivo es la separación de batería (drum separation) a partir de una mezcla musical. Es relevante para desarrolladores que necesiten integrar separación de batería en pipelines de producción con requisitos de memoria reducidos, aprovechando la cuantización int8 y el ecosistema PyTorch/Demucs.

El repositorio es de tamaño reducido (0,1 GB), tiene licencia MIT y no registra descargas ni interacciones en el momento de la consulta. La información pública disponible es muy limitada: no se detallan parámetros totales, contexto, idiomas ni benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Demucs (HDemucs), convolucional híbrida tiempo-frecuencia |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | int8 (pesos); no se detallan otros formatos |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch para `HDemucs` (pesos int8); origen ONNX (`drumsep_v2.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en Hybrid Demucs, una arquitectura que combina ramas convolucionales en el dominio temporal y en el dominio espectral (STFT) con conexiones entre ambas, orientada a la separación de fuentes musicales. La variante `HDemucs` es la implementación de referencia dentro de la librería Demucs de Meta AI. El modelo original DrumSep v2 de inagoy está especializado en la separación de batería.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras procesadas, ni sobre si se aplicaron técnicas de ajuste fino con preferencias (RLHF/DPO). La model card indica explícitamente que no hubo reentrenamiento en esta variante: los pesos se tomaron del export ONNX `drumsep_v2.onnx` (revisión `1dc26f76e6cd9470b8af9ec66803447c089519ab`) y se trasladaron a un `state_dict` de PyTorch, almacenando las matrices de pesos como int8. No se documentan innovaciones técnicas adicionales más allá de la cuantización.

## Capacidades

- Separación de batería (drum separation) a partir de mezclas de audio musical.
- Inferencia en PyTorch mediante la clase `HDemucs` de la librería Demucs.
- Pesos cuantizados a int8, lo que reduce el uso de memoria frente a los pesos en coma flotante.
- Compatibilidad con el ecosistema Demucs para carga de `state_dict`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, por tratarse de un modelo de audio.
- No se documenta ningún modo especial (thinking mode, audio, etc.) más allá de la tarea de separación.

## Casos de uso

- Producción musical y remezcla: extraer la pista de batería de una mezcla para su edición, sustitución o procesamiento independiente, aprovechando la especialización del modelo en este instrumento.
- Creación de samples y librerías: generar muestras de batería aisladas a partir de grabaciones existentes para su reutilización en composición.
- Educación musical y análisis: aislar la batería para estudiar patrones rítmicos o transcribir grooves en entornos de aprendizaje.
- Preprocesado en pipelines de transcripción rítmica: separar la batería antes de alimentar un modelo de detección de onsets o transcripción de percusión, reduciendo interferencias de otros instrumentos.
- Despliegue en entornos con memoria limitada: la cuantización int8 y el tamaño reducido del repositorio (0,1 GB) permiten ejecutar el modelo en máquinas con recursos modestos, siempre que se disponga de PyTorch y Demucs.
- Investigación en separación de fuentes: servir como punto de partida reproducible para comparar variantes ONNX frente a PyTorch int8 en experimentos académicos.
- Integración en herramientas de karaoke o práctica instrumental: aislar la batería para generar pistas de acompañamiento o de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB y los pesos están en int8, lo que sugiere un requisito de memoria reducido, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio es plausible que quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: PyTorch con la librería Demucs (carga de `state_dict` en `HDemucs`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Licencia | Notas |
|---|---|---|---|---|
| Acapellas/drumsep-v2-int8 | `state_dict` PyTorch (HDemucs) | int8 | MIT | Conversión no oficial, sin reentrenamiento |
| gridshiftstudio/drumsep-onnx | ONNX (`drumsep_v2.onnx`) | no disponible | no disponible en la información | Export oficial de referencia del que deriva esta variante |
| DrumSep v2 de inagoy | no disponible | no disponible | no disponible en la información | Modelo original de separación de batería |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Conversión no oficial: la model card indica explícitamente que no es un lanzamiento oficial; los derechos del modelo permanecen con sus autores.
- Sin reentrenamiento: la cuantización int8 puede introducir degradación en la calidad de separación frente a los pesos originales en coma flotante; no se documenta una evaluación de dicha degradación.
- Información incompleta: no se detallan parámetros, dataset de entrenamiento, benchmarks ni requisitos de hardware, lo que dificulta una evaluación rigurosa previa a producción.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la separación puede generar artefactos o sangrado entre fuentes en mezclas complejas.
- Limitaciones de contexto o idioma: no aplica (modelo de audio); no se documentan limitaciones de duración de audio o sample rate.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright y verificar el archivo `LICENSE` del repositorio.
- Verificación de integridad: se recomienda comprobar `SHA256SUMS` cuando esté presente, según indica la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Acapellas/drumsep-v2-int8
- Modelo de origen ONNX: https://huggingface.co/gridshiftstudio/drumsep-onnx
- Revisión de origen citada: `1dc26f76e6cd9470b8af9ec66803447c089519ab` (archivo `drumsep_v2.onnx`)
- Modelo original de inagoy (DrumSep): no se proporciona URL directa en la información disponible
- Librería Demucs (Meta AI): no se proporciona URL en la información disponible
