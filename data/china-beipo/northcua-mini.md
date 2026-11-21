# china-beipo/NorthCUA-Mini

## Resumen

NorthCUA-Mini es un modelo multimodal de tipo image-text-to-text especializado en agentes de uso de ordenador (computer-use), desarrollado por china-beipo (beipo-ai) y publicado bajo licencia Apache-2.0. Se construye sobre la arquitectura Qwen3.5 en configuración de mezcla de expertos (MoE), con 35.107 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Su función es recibir instrucciones del usuario, capturas de pantalla e historial de interacción, y generar razonamiento, respuestas y llamadas a herramientas para operar entornos de escritorio y navegador.

El modelo forma parte de una familia de tres tamaños: NorthCUA-Nano (9B denso), NorthCUA-Mini (35B MoE, 3B activos) y NorthCUA-Pro (397B MoE, 17B activos). Está diseñado para ejecutarse conjuntamente con el NorthCUA Harness, un runtime oficial que gestiona prompts, llamadas a herramientas, observaciones y ejecución de acciones. Una convención crítica del modelo es el contrato de coordenadas `normalized_1000`: todas las acciones GUI usan un espacio normalizado de 0 a 1000, no píxeles brutos, y el Harness se encarga de la conversión a píxeles en tiempo de ejecución.

Su relevancia actual radica en que aborda el problema de los agentes que operan software real de forma sostenida, aprendiendo de trayectorias completas de trabajo con verificación de resultados. El modelo se distribuye en formato safetensors con un repositorio de 70,2 GB y acumula 855 descargas y 17 likes en Hugging Face desde su publicación el 1 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE basada en Qwen3.5 (qwen3_5_moe) |
| Parámetros totales | 35.107.181.936 (35B) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NorthCUA-Mini emplea una arquitectura transformer de mezcla de expertos (MoE) derivada de Qwen3.5, con 35B parámetros totales y unos 3B activos por token, lo que reduce el coste computacional por paso de inferencia frente a un modelo denso del mismo tamaño. El modelo es multimodal: procesa texto e imágenes (capturas de pantalla) y genera texto estructurado con razonamiento y llamadas a herramientas. La model card indica que el entrenamiento combina aprendizaje supervisado (SFT) para el anclaje visual (grounding) y un posterior aprendizaje por refuerzo (RL) conjunto sobre entornos de escritorio y web para la finalización de tareas. El entrenamiento se apoya en "trayectorias completas de trabajo" que enseñan pasos dependientes, artefactos intermedios y verificación de resultados, según describe el autor.

La innovación técnica destacada es el contrato estricto de coordenadas `normalized_1000` para todas las acciones GUI, junto con la integración obligatoria con el NorthCUA Harness, que separa el razonamiento del modelo de la ejecución de acciones en el entorno. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de instrucciones, capturas de pantalla e historial de interacción.
- Anclaje visual (visual grounding) para localizar elementos de interfaz en aplicaciones de escritorio y flujos web.
- Generación de llamadas a herramientas (tool calling / function calling) para ejecutar acciones sobre el entorno.
- Operación de agentes multi-paso con razonamiento encadenado sobre estados cambiantes de software.
- Verificación de resultados e incorporación de artefactos intermedios en trayectorias largas.
- Soporte de interacción sostenida multi-turno dentro de un runtime de computer-use.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo recibe capturas de pantalla y genera acciones en coordenadas normalizadas para operar aplicaciones nativas, adecuado por su anclaje visual entrenado sobre OSWorld-G y ScreenSpot-Pro.
- Automatización de flujos web: puede navegar y completar tareas en navegador con verificación de resultado, respaldado por sus resultados en WebArena-Verified (70,43% de éxito tras RL).
- Agentes de soporte técnico que reproducen pasos en un entorno real: el modelo interpreta la instrucción del usuario, observa el estado de la pantalla y ejecuta la secuencia de acciones necesaria.
- Pruebas de regresión de interfaces (UI testing): el agente puede ejecutar guiones de prueba sobre aplicaciones y verificar el estado final, aprovechando su capacidad de razonamiento multi-paso.
- Extracción de datos de aplicaciones legacy: el modelo opera la interfaz gráfica para localizar y transcribir información cuando no existe API disponible.
- Orquestación de tareas administrativas repetitivas: rellenado de formularios, gestión de ficheros y flujos ofimáticos, con el Harness gestionando la ejecución de acciones y la conversión de coordenadas.
- Investigación en agentes computer-use: su tamaño MoE de 3B activos lo hace viable para experimentación con pesos abiertos bajo Apache-2.0.

## Benchmarks y rendimiento

Resultados reportados en el informe técnico de NorthCUA (el autor advierte que no están vinculados a una exportación exacta de checkpoint y no son mediciones nuevas de los ficheros de este repositorio).

| Benchmark | Etapa / métrica | Nano · 9B | Mini · 35B | Pro · 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT · precisión (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · precisión (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · éxito (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · éxito (%) | 67,16 | 70,43 | 73,89 |

Comparativa SFT frente a RL del propio modelo:

| Modelo | OSWorld SFT | OSWorld RL | WebArena SFT | WebArena RL |
|---|---|---|---|---|
| Nano | 76,05 | 78,90 | 64,16 | 67,16 |
| Mini | 83,29 | 85,30 | 67,98 | 70,43 |
| Pro | 85,87 | 88,64 | 69,58 | 73,89 |

Condiciones de evaluación: ScreenSpot-Pro con 1.581 ejemplos y una predicción por captura; OSWorld-G con 564 instrucciones y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida, coordenadas normalizadas 0–1000); OSWorld-Verified con 361 tareas y WebArena-Verified con 812 tareas, ambas con límite de 100 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 70,2 GB en safetensors; en precisión de 16 bits requiere aproximadamente 70 GB de VRAM solo para pesos. En cuantización de 8 bits se estiman unos 35 GB; en 4 bits, unos 18-20 GB (estimación, no confirmada por el autor).
- GPU recomendadas: para FP16, A100 80 GB o H100 80 GB; para cuantización 8 bits, A100 40 GB o H100; para cuantización 4 bits, RTX 4090 24 GB podría ser viable, aunque no está confirmado.
- ¿Cabe en consumer GPU? Posiblemente en RTX 4090 (24 GB) con cuantización de 4 bits, sin confirmación oficial.
- Opciones de despliegue: transformers (librería indicada), junto con el NorthCUA Harness para la ejecución de acciones. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Arquitectura | Contexto | Licencia | Benchmarks clave |
|---|---|---|---|---|---|---|
| NorthCUA-Mini | 35B | ~3B | MoE (Qwen3.5) | no disponible | Apache-2.0 | OSWorld 85,30 / WebArena 70,43 |
| NorthCUA-Nano | 9B | 9B | Denso | no disponible | Apache-2.0 | OSWorld 78,90 / WebArena 67,16 |
| NorthCUA-Pro | 397B | 17B | MoE | no disponible | Apache-2.0 | OSWorld 88,64 / WebArena 73,89 |

No se dispone de datos de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Requiere el NorthCUA Harness oficial para funcionar correctamente; no está pensado para uso aislado sin ese runtime.
- Contrato de coordenadas estricto (`normalized_1000`): usar píxeles brutos rompe la interacción modelo-Harness.
- Los resultados de benchmarks provienen del informe técnico y no están vinculados a un checkpoint exacto exportado; el autor advierte que no son mediciones nuevas de los ficheros publicados.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no cuantificado por el autor.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni garantías.
- Los resultados de WebTestBench están marcados como pendientes en el informe.
- El modelo está orientado a computer-use; su rendimiento en tareas de texto general no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/china-beipo/NorthCUA-Mini
- Página del proyecto: https://beipo.top/blog/northcua/
- Repositorio Harness (GitHub): https://github.com/china-qijizhifeng/NorthCUA-Harness
- NorthCUA-Nano: https://huggingface.co/beipo-ai/NorthCUA-Nano
- NorthCUA-Pro: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Mini/blob/main/LICENSE
- arXiv (referencia en tags): arxiv:2611.02102
