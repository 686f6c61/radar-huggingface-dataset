# FINAL-Bench/POCKET-35B-GGUF

## Resumen

POCKET-35B-GGUF es una familia de cuantizaciones GGUF del modelo base FINAL-Bench/Darwin-36B-Opus, publicada por FINAL-Bench (equipo VIDRAFT) para ejecución local en PC sin GPU dedicada. Se trata de un modelo de mezcla de expertos (MoE) disperso con 34.660.610.688 parámetros totales y aproximadamente 3B parámetros activos por token, lo que permite una inferencia comparativamente económica en CPU. El repositorio contiene compilaciones de modelo completo (no las variantes de ~5 GB para teléfono) y recomienda Q2_K (~13 GB) como primera descarga.

El modelo se distribuye bajo licencia Apache-2.0 y está etiquetado como "Korean-tuned", orientado a conversación, razonamiento y despliegue en el borde (edge). La arquitectura declarada en las etiquetas es `qwen3_5_moe`, con soporte en llama.cpp para el tipo de arquitectura `qwen35moe`, por lo que la versión del runtime instalada condiciona la compatibilidad. El tamaño del repositorio es de 59,1 GB, coherente con múltiples niveles de cuantización del mismo modelo de ~35B.

La relevancia actual del modelo reside en su propuesta de ejecución local en hardware de consumo: un MoE de ~35B con ~3B activos puede ofrecer una calidad cercana a modelos densos mayores con un coste de cómputo por token mucho menor, algo crítico cuando se ejecuta en CPU. No obstante, la información pública disponible procede casi íntegramente de la model card del editor, y no se han publicado resultados de benchmarks independientes para esta compilación concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) disperso; tipo de arquitectura llama.cpp `qwen35moe` (etiqueta `qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, con Q2_K recomendado (~13 GB) y Q4_K_M (~21,2 GB) documentado; se menciona uso de imatrix |
| Idiomas soportados | no disponible (el modelo se describe como "Korean-tuned", sin listado formal de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base, 34.660.610.688 parámetros) |

## Arquitectura y entrenamiento

El modelo base es Darwin-36B-Opus, un MoE disperso de ~34,66B parámetros totales con ~3B activos por token. Según la model card, la línea Darwin hereda las capas de expertos de Qwen3.8-Flash-Next y reconstruye las capas de atención y de expertos compartidos mediante un proceso de auto-mejora recursiva (RSI). El modelo aquí publicado es una cuantización GGUF de ese checkpoint, no un entrenamiento nuevo; el repositorio emplea cuantización con imatrix y ofrece varias compilaciones de modelo completo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones de decodificación (por ejemplo, decodificación especulativa) más allá de la etiqueta `vidraft`, que no viene explicada en la model card. La model card menciona que el modelo es "Korean-tuned", pero no cuantifica el ajuste ni describe el corpus empleado.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational`.
- Razonamiento (etiqueta `reasoning`) y resolución de problemas matemáticos y científicos, según la línea Darwin a la que pertenece el modelo base.
- Ejecución local en CPU mediante llama.cpp, sin necesidad de GPU dedicada.
- Despliegue en el borde: el repositorio se orienta a PC, y la familia POCKET incluye variantes separadas para iPhone y Android (~5 GB).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; solo se indica ajuste al coreano.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátil: con la compilación Q2_K (~13 GB) y llama.cpp, el modelo puede mantener conversaciones multi-turno sin GPU dedicada, aprovechando que solo ~3B parámetros se activan por token para reducir el coste de cómputo en CPU.
- Procesamiento de texto en estaciones de trabajo sin GPU: equipos con RAM suficiente pueden ejecutar el modelo para tareas de resumen, reescritura y clasificación de documentos, evitando el coste y la dependencia de la nube.
- Prototipado y evaluación de modelos MoE: investigadores pueden comparar el comportamiento de un MoE de ~35B con ~3B activos frente a modelos densos de tamaño similar en tareas de razonamiento, usando las distintas cuantizaciones del repositorio.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el modelo es adecuado para procesar datos sensibles que no deben salir de la máquina, siempre que se acepten las limitaciones de calidad de las cuantizaciones bajas.
- Aplicaciones en coreano: dado el ajuste al coreano declarado, puede emplearse en asistentes y herramientas de productividad para usuarios coreanohablantes, aunque no se detalla el alcance real del ajuste.
- Integración en pipelines con API compatible: la etiqueta `endpoints_compatible` permite servir el modelo detrás de una interfaz tipo OpenAI y conectarlo a herramientas existentes que consuman ese formato.
- Despliegue en dispositivos móviles: para iPhone y Android deben usarse las variantes específicas POCKET-KR-GGUF, POCKET-KR-MLX o POCKET-EN-GGUF (~5 GB), no este repositorio de modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para POCKET-35B-GGUF. La model card incluye una tabla de SuperCLUE de noviembre de 2026 correspondiente al modelo insignia Darwin-180B-RSI-R3 (73,68 en razonamiento matemático y científico), pero esos resultados no son atribuibles a esta compilación de ~35B y no deben extrapolarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el camino CPU; para ejecución en GPU, el tamaño del archivo condiciona la memoria: Q2_K ~13 GB, Q4_K_M ~21,2 GB.
- RAM necesaria: suficiente para alojar el archivo de cuantización elegido más overhead del runtime; la model card indica "PC with sufficient RAM" sin cifra concreta.
- GPU recomendadas: no disponible; el repositorio está orientado a ejecución en CPU y no especifica GPU objetivo.
- ¿Cabe en GPU de consumo? Q4_K_M (~21,2 GB) requiere al menos 24 GB de VRAM para caber completo en una GPU de consumo de gama alta; Q2_K (~13 GB) cabría en GPUs de 16 GB, aunque no se documenta rendimiento en ese escenario.
- Opciones de despliegue: llama.cpp (runtime principal, requiere soporte de la arquitectura `qwen35moe`); la etiqueta `endpoints_compatible` sugiere servidores compatibles con API OpenAI. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| POCKET-35B-GGUF | ~34,66B | ~3B | no disponible | Apache-2.0 | GGUF | MoE para PC/CPU; Q2_K ~13 GB |
| POCKET-27B-GGUF | ~27B (Qwen3.8-27B) | no disponible | no disponible | no disponible | GGUF (Q6_K, 22,43 GB) | Mismo editor; denso según la model card |
| POCKET-27B-Pi-GGUF | ~27B | no disponible | no disponible | no disponible | GGUF (16,5 GB) | Especialista en código; 29 tareas de Terminal-Bench 2.1 frente a 19 de POCKET-27B |
| POCKET-Darwin-180B-GGUF | ~180B | no disponible | no disponible | no disponible | GGUF | Misma familia, mayor tamaño |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, salvo el recuento de tareas de Terminal-Bench 2.1 citado para POCKET-27B-Pi.

## Limitaciones y advertencias

- La información procede de la model card del editor; no se han localizado evaluaciones independientes de esta compilación.
- Las cuantizaciones bajas como Q2_K (~13 GB) degradan la calidad de forma notable frente al modelo en precisión completa; la recomendación de Q2_K responde a requisitos de tamaño, no a calidad óptima.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que impide garantizar un comportamiento multilingüe más allá del ajuste al coreano declarado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la atribución exigida en la sección "License and attribution" de la model card, no incluida aquí.
- Compatibilidad condicionada a la versión de llama.cpp instalada: se requiere soporte de la arquitectura `qwen35moe`; versiones antiguas pueden no cargar el modelo.
- Este repositorio contiene compilaciones de modelo completo; para móviles deben usarse las variantes POCKET-KR-GGUF, POCKET-KR-MLX o POCKET-EN-GGUF (~5 GB).
- Las cifras de descargas y likes (307.524 y 91) reflejan la actividad del repositorio, no una validación técnica del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- Archivos y descargas: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF/tree/main
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
- Guía de instalación: https://vidraft.net/p/pocket.html?model=pocket_35b
- POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-26B: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- POCKET-Darwin-180B: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- POCKET-27B: https://huggingface.co/FINAL-Bench/POCKET-27B-GGUF
- POCKET-27B-Pi: https://huggingface.co/FINAL-Bench/POCKET-27B-Pi-GGUF
- POCKET-KR-GGUF: https://huggingface.co/FINAL-Bench/POCKET-KR-GGUF
- POCKET-KR-MLX: https://huggingface.co/FINAL-Bench/POCKET-KR-MLX
- POCKET-EN-GGUF: https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
- Darwin-180B-RSI-R3: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- SuperCLUE (leaderboard): https://www.superclueai.com/homepage
