# china-beipo/NorthCUA-Pro

## Resumen

NorthCUA-Pro es un modelo de agente de uso de ordenador (computer-use agent) multimodal desarrollado por china-beipo (beipo-ai), construido sobre la arquitectura Qwen3.5. Con 397.000 millones de parámetros totales y 17.000 millones activos por token, es el miembro más grande de la familia NorthCUA, que se completa con Nano (9B, denso) y Mini (35B, MoE, 3B activos). El modelo recibe peticiones del usuario, capturas de pantalla e historial de interacción, y genera razonamiento, respuestas y llamadas a herramientas para su ejecución en un entorno de escritorio o navegador.

El modelo resuelve el problema de la automatización fiable de tareas GUI de múltiples pasos: no solo interpreta instrucciones, sino que produce acciones verificables sobre aplicaciones de escritorio y flujos web, manteniendo coherencia entre estados cambiantes del software. Su entrenamiento combina trayectorias largas de interacción real con aprendizaje por refuerzo conjunto escritorio-web, lo que le permite aprender de trabajo completo (pasos dependientes, artefactos intermedios y verificación de resultados) en lugar de acciones aisladas.

Es relevante ahora porque se distribuye con pesos abiertos bajo licencia Apache-2.0, cubre la gama 9B/35B/397B y publica resultados en benchmarks de referencia del sector (ScreenSpot-Pro, OSWorld-Verified, WebArena-Verified). Requiere obligatoriamente su harness oficial y un contrato estricto de coordenadas normalizadas en el espacio 0–1000, lo que condiciona su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) sobre Qwen3.5 |
| Parametros totales | 396.802.360.816 (~397B) |
| Parametros activos | ~17B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

NorthCUA-Pro es un transformer de mezcla de expertos derivado de Qwen3.5, con 397B parámetros totales y 17B activos por token. La model card subraya que el número de parámetros activos describe el cómputo por token, no la memoria necesaria para cargar todos los pesos. El modelo es multimodal de entrada imagen-texto (pipeline `image-text-to-text`) y está especializado en grounding visual y observaciones multimodales para aplicaciones de escritorio y flujos web.

El entrenamiento se organiza en dos fases: primero SFT (supervised fine-tuning) para el anclaje visual (grounding), y después aprendizaje por refuerzo (RL) conjunto escritorio-web para la finalización de tareas. El informe técnico describe el aprendizaje a partir de trayectorias completas de trabajo, con pasos dependientes, artefactos intermedios y verificación de resultados. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas adicionales como DPO o decodificación especulativa.

Una innovación operativa destacable es el contrato estricto de coordenadas `normalized_1000`: todas las acciones GUI usan un espacio normalizado 0–1000 en lugar de píxeles crudos, y el harness oficial convierte esas coordenadas a píxeles en el momento de la ejecución.

## Capacidades

- Grounding visual y acción sobre interfaces: interpreta capturas de pantalla y genera acciones sobre aplicaciones de escritorio y flujos web.
- Generación de razonamiento y respuestas: produce cadenas de razonamiento antes de la acción, junto con la respuesta al usuario.
- Llamadas a herramientas (tool calling): genera tool calls para el runtime de escritorio o navegador a través del harness oficial.
- Razonamiento multi-paso y agentes: soporta tareas con pasos dependientes, artefactos intermedios y verificación de resultados.
- Interacción sostenida: mantiene coherencia a lo largo de estados cambiantes del software mediante el historial de interacción.
- Multimodalidad imagen-texto: entrada conjunta de instrucciones, screenshots e historial.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo recibe la instrucción y capturas de pantalla del escritorio y emite acciones normalizadas que el harness ejecuta sobre las aplicaciones; es adecuado por su grounding visual y su entrenamiento en trayectorias completas de escritorio.
- Automatización de flujos web: navegación, rellenado de formularios y extracción de datos en sitios web, apoyándose en los resultados de WebArena-Verified (73,89 % de éxito tras RL) como referencia de viabilidad.
- Agentes de soporte interno que operan software corporativo: ejecución de tareas repetitivas en aplicaciones de gestión con verificación de resultado intermedio, gracias al aprendizaje sobre artefactos intermedios.
- Pruebas de regresión de interfaces: el modelo puede actuar como agente que recorre flujos de UI y comprueba resultados, útil en pipelines de QA por su capacidad de verificación de outcome.
- Investigación en agentes computer-use: base abierta (Apache-2.0) para experimentar con RL conjunto escritorio-web y comparar contra los tamaños Nano y Mini de la misma familia.
- Orquestación de tareas de larga duración: con un límite de 100 pasos por tarea en las evaluaciones publicadas, encaja en procesos acotados de múltiples pasos donde se requiere razonamiento y acción encadenados.
- Despliegue en infraestructura propia: al publicarse en safetensors y con licencia permisiva, permite integrar el modelo en entornos on-premise con el harness oficial para prompts, tool calls y ejecución de acciones.

## Benchmarks y rendimiento

Resultados del informe técnico de NorthCUA. El grounding usa checkpoints SFT; la finalización de tareas usa checkpoints RL conjuntos escritorio-web. El autor advierte que estos resultados de investigación no están vinculados a una exportación exacta del checkpoint de este repositorio.

| Benchmark | Etapa / metrica | Nano · 9B | Mini · 35B | Pro · 397B |
|:--|:--|--:|--:|--:|
| ScreenSpot-Pro | SFT · accuracy (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · accuracy (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · success (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · success (%) | 67,16 | 70,43 | 73,89 |

| Modelo | OSWorld SFT | OSWorld RL | WebArena SFT | WebArena RL |
|:--|--:|--:|--:|--:|
| Nano | 76,05 | 78,90 | 64,16 | 67,16 |
| Mini | 83,29 | 85,30 | 67,98 | 70,43 |
| Pro | 85,87 | 88,64 | 69,58 | 73,89 |

Condiciones de evaluación declaradas: ScreenSpot-Pro con 1.581 ejemplos, una predicción por captura y sin búsqueda iterativa de zoom/crop; OSWorld-G con 564 instrucciones refinadas y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida, coordenadas normalizadas 0–1000); OSWorld-Verified con 361 tareas (excluidas ocho de Google Drive) y WebArena-Verified con 812 tareas y comprobaciones oficiales de resultado, ambas con límite de 100 pasos por tarea. El informe también recoge un 66,80 % de crédito parcial medio para Pro tras RL en OSWorld 2.0 (108 tareas, límite de 500 pasos), que no es una tasa de finalización completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 397B parámetros totales y pesos en safetensors (repo de 793,6 GB), la carga completa de pesos exige un entorno multi-GPU de gran escala.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el despliegue requiere clústeres con GPUs de centro de datos (A100/H100 o superiores) en configuración multi-GPU.
- GPU de consumo: el modelo completo no cabe en GPUs de consumo; la familia ofrece Nano (9B) y Mini (35B, 3B activos) para escenarios de menor huella.
- Opciones de despliegue: librería transformers; el uso como agente computer-use requiere el NorthCUA Harness oficial. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Arquitectura | Contexto | Licencia | Resultados publicados |
|:--|--:|--:|:--|:--|:--|:--|
| NorthCUA-Pro | 397B | 17B | MoE (Qwen3.5) | no disponible | Apache-2.0 | ScreenSpot-Pro 93,30; OSWorld-Verified RL 88,64; WebArena-Verified RL 73,89 |
| NorthCUA-Mini | 35B | 3B | MoE | no disponible | Apache-2.0 | ScreenSpot-Pro 92,41; OSWorld-Verified RL 85,30; WebArena-Verified RL 70,43 |
| NorthCUA-Nano | 9B | 9B | Dense | no disponible | Apache-2.0 | ScreenSpot-Pro 72,87; OSWorld-Verified RL 78,90; WebArena-Verified RL 67,16 |

No se dispone en la información proporcionada de comparaciones con modelos computer-use de otros desarrolladores.

## Limitaciones y advertencias

- Requiere el NorthCUA Harness oficial: el modelo y el harness están diseñados para usarse juntos para prompts, tool calls, observaciones y ejecución de acciones; su uso aislado no está soportado según la model card.
- Contrato de coordenadas estricto: todas las acciones GUI deben usar el espacio normalizado 0–1000; mezclar coordenadas en píxeles rompe la interacción modelo-harness.
- Los resultados de benchmarks del informe técnico no están vinculados a una exportación exacta del checkpoint de este repositorio y no son mediciones nuevas de los archivos publicados.
- Límite de 100 pasos por tarea en las evaluaciones de OSWorld-Verified y WebArena-Verified; el rendimiento en tareas más largas no está caracterizado en la información disponible.
- Riesgo de alucinación en la interpretación de capturas y en la selección de acciones: no se documentan tasas de error específicas ni salvaguardas adicionales.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el alcance multilingüe.
- Licencia Apache-2.0: permisiva para uso comercial, pero el despliegue a escala de 397B parámetros implica costes de infraestructura considerables y la dependencia del harness añade una capa operativa adicional a auditar en producción.
- Longitud de contexto y opciones de cuantización no documentadas: la planificación de memoria y de ventanas de contexto debe validarse empíricamente antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/china-beipo/NorthCUA-Pro
- Página del proyecto: https://beipo.top/blog/northcua/
- Repositorio del harness: https://github.com/china-qijizhifeng/NorthCUA-Harness
- NorthCUA-Nano: https://huggingface.co/beipo-ai/NorthCUA-Nano
- NorthCUA-Mini: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Pro/blob/main/LICENSE
- Informe técnico (arXiv): arxiv:2611.02102
