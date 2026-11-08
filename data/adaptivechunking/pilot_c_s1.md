# AdaptiveChunking/pilot_C_s1

## Resumen

pilot_C_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de un modelo byte-level basado en la arquitectura H-Net, entrenado con el entrenador heredado (`legacy/tier1/train.py`) del repositorio de código abierto beetle-hnet. El modelo se ha separado del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-pilots` y se ha reorganizado en el formato por ejecución de Beetle, con ramas `step-N` para checkpoints intermedios y una rama `main` con los pesos más recientes.

El interés del modelo no reside en sus capacidades de propósito general, sino en su valor como artefacto de investigación sobre tokenización y chunking dinámico. Los tags del repositorio (dynamic-chunking, tokenization, byte-level, hnet) indican que el trabajo explora cómo segmentar la entrada a nivel de byte en lugar de depender de un tokenizador BPE o similar. Con 22.516.992 parámetros, es un modelo pequeño, adecuado para experimentación y para reproducir resultados, no para despliegues de producción.

La información pública disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas soportados y no se han publicado resultados de benchmarks. La model card se centra en la estructura de los artefactos (checkpoints, configuración, mapa de pesos atados) y en cómo restaurarlos, más que en describir el comportamiento del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags: hnet, byte-level, beetle-hnet) |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y config.json |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net en su variante byte-level, según los tags del repositorio y la referencia al proyecto beetle-hnet. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o si incorpora componentes híbridos), por lo que estos datos no están disponibles. El rasgo distintivo declarado es el "dynamic chunking" aplicado sobre representaciones a nivel de byte, lo que sugiere un mecanismo de agrupación adaptativa de bytes en lugar de una tokenización fija previa.

El entrenamiento se realizó con el entrenador heredado `legacy/tier1/train.py` del repositorio beetle-hnet. La model card indica que este entrenador no conservó estado del optimizador, por lo que no existe directorio `training_state/` en el repositorio. Se conserva un único checkpoint retenido, correspondiente al paso 6000, además de los pesos más recientes en la rama `main`, junto con `final.json` y `log.jsonl`. El repositorio incluye un mapa de pesos atados (`tied_weights`) que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación y procesamiento de texto a nivel de byte, sin depender de un tokenizador externo según el enfoque byte-level declarado.
- Segmentación dinámica de la entrada (dynamic chunking), que es el objeto principal de la investigación.
- No se documentan capacidades de razonamiento, código, matemáticas, visión o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como punto de partida reproducible para estudiar cómo el chunking dinámico afecta a la representación de texto, comparando con tokenizadores BPE convencionales.
- Reproducción de experimentos: al estar separado en el formato por ejecución de Beetle con ramas `step-N` y `main`, permite reproducir exactamente el estado del paso 6000 y el final del entrenamiento.
- Evaluación de sondas de frontera: las sondas FLORES+ del dataset `AdaptiveChunking/hnet-chunking-probes` bajo `pilot_C_s1/` permiten analizar el comportamiento del modelo en límites de segmento y compararlo con otras ejecuciones de la misma familia.
- Estudio de arquitecturas H-Net: útil para investigadores que quieran inspeccionar o modificar la configuración (`model_config`) y el mapa de pesos atados en un modelo de 22,5 M de parámetros.
- Prototipado en entornos con recursos limitados: su tamaño reducido permite cargarlo y ejecutarlo en una sola GPU de consumo o incluso en CPU para pruebas de concepto.
- Base para ablaciones controladas: al compartir linaje con otras ejecuciones de `hnet-chunking-pilots`, sirve como referencia en comparaciones de variantes de chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB; en fp16, unos 45 MB; en int8, unos 22 MB. El consumo real dependerá del tamaño de las activaciones y de la longitud de secuencia, que no está documentada.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 están sobredimensionadas para este modelo. Una GPU de consumo básica o incluso CPU es viable.
- Cabe en cualquier GPU de consumo, incluidas las de gama baja con 4 GB o menos de VRAM.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y sin pipeline declarado, el despliegue requiere cargar los pesos manualmente con PyTorch y aplicar el mapa `tied_weights`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia o categoría en la documentación proporcionada. Las otras ejecuciones del repositorio `AdaptiveChunking/hnet-chunking-pilots` podrían servir como referencia, pero no se detallan sus especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pilot_C_s1 | 22.516.992 | no disponible | apache-2.0 | Hugging Face |
| Otras ejecuciones de hnet-chunking-pilots | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados; no hay evidencia de rendimiento en tareas estándar.
- No se declaran idiomas soportados, por lo que se desconoce su cobertura lingüística real.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- El entrenador heredado no conservó estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- La restauración de pesos requiere aplicar manualmente el mapa `tied_weights`; un error en este paso puede producir un modelo con comportamiento incorrecto.
- Aunque la licencia es apache-2.0 y permite uso comercial, la ausencia de evaluación hace desaconsejable su uso en producción sin una validación exhaustiva previa.
- No hay pipeline declarado ni integración documentada con frameworks de serving, lo que añade trabajo de ingeniería para cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_C_s1
- Repositorio empaquetado original: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
