# beipo-ai/NorthCUA-Pro

## Resumen

NorthCUA-Pro es un modelo multimodal de tipo *computer-use* (uso de ordenador) desarrollado por beipo-ai, construido sobre la arquitectura Qwen3.5 y publicado bajo licencia Apache-2.0. Con 396.802.360.816 parámetros totales (aproximadamente 397B) y 17B parámetros activos por token, se trata de un modelo de mezcla de expertos (MoE) disenado especificamente para operar interfaces graficas: recibe instrucciones del usuario, capturas de pantalla e historial de interaccion, y genera razonamiento, respuestas y llamadas a herramientas para un entorno de escritorio o navegador.

El modelo forma parte de una familia de tres variantes (Nano de 9B denso, Mini de 35B MoE con 3B activos y Pro de 397B MoE con 17B activos). Su propuesta central es el entrenamiento de agentes de uso de ordenador mediante experiencia verificada a escala, combinando interaccion sostenida, experiencia validada y aprendizaje por etapas para completar tareas a traves de estados de software cambiantes.

Es relevante ahora porque aborda uno de los cuellos de botella practicos de los agentes autonomos: la verificacion de resultados intermedios y finales en entornos reales. Su publicacion incluye un informe tecnico de 121 paginas y un arnes oficial (NorthCUA Harness) que el autor declara necesario para el uso correcto del modelo, con un contrato estricto de coordenadas normalizadas en el espacio 0-1000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre Qwen3.5; multimodal image-text-to-text |
| Parametros totales | 396.802.360.816 (~397B) |
| Parametros activos | 17B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

NorthCUA-Pro es un transformer de mezcla de expertos construido sobre Qwen3.5, con 397B parametros totales y 17B activos por token. El modelo procesa entradas multimodales (instrucciones de texto, capturas de pantalla e historial de interaccion) y produce razonamiento, respuestas y llamadas a herramientas orientadas a un runtime de escritorio o navegador. Segun la model card, el entrenamiento combina aprendizaje supervisado (SFT) con aprendizaje por refuerzo (RL) conjunto sobre dominios de escritorio y web; los resultados de *grounding* se reportan sobre checkpoints SFT y los de completado de tareas sobre checkpoints RL posteriores.

La innovacion tecnica destacada es el entrenamiento de agentes de uso de ordenador a partir de trayectorias largas y completas, que ensenan pasos dependientes, artefactos intermedios y verificacion de resultados, en lugar de acciones aisladas. El modelo exige un contrato estricto de coordenadas: todas las acciones GUI usan el espacio normalizado 0-1000 (no pixeles crudos), y el arnes oficial convierte esas coordenadas a pixeles en el momento de la ejecucion. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de instrucciones y capturas de pantalla.
- *Visual grounding* para localizar elementos de interfaz en aplicaciones de escritorio y flujos web.
- Llamadas a herramientas (*tool calling*) integradas con el NorthCUA Harness para ejecutar acciones.
- Razonamiento multi-paso y tareas de agente con dependencias entre pasos y verificacion de resultados.
- Manejo de trayectorias largas con artefactos intermedios.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de pensamiento (*thinking*), vision o audio adicionales: no disponibles.

## Casos de uso

- Automatizacion de tareas de escritorio: el modelo recibe la instruccion y capturas de pantalla del entorno y genera acciones GUI (clics, escritura, navegacion) en coordenadas normalizadas, adecuado para RPA de nueva generacion sobre aplicaciones nativas.
- Agentes de navegacion web: completado de flujos en WebArena-Verified con hasta 100 pasos por tarea, util para pruebas de regresion de flujos de usuario en entornos web controlados.
- Verificacion de resultados en pipelines: al entrenarse con trayectorias completas, puede comprobar artefactos intermedios y el resultado final, lo que encaja en tareas de QA automatizado de procesos de negocio.
- Soporte a operaciones de TI: ejecucion guiada de tareas repetitivas en paneles de administracion y consolas, con el arnes gestionando la conversion de coordenadas a pixeles.
- Investigacion en agentes autonomos: su familia Nano/Mini/Pro permite escalar experimentos desde 9B hasta 397B manteniendo la misma interfaz de arnes y el mismo contrato de coordenadas.
- Generacion de datos de interaccion sintetica: uso del modelo para producir trayectorias etiquetadas en entornos simulados, aprovechando su *grounding* de alta precision en ScreenSpot-Pro (93,30% de exactitud reportada en SFT).

## Benchmarks y rendimiento

Resultados reportados en el informe tecnico de NorthCUA. El autor advierte que no estan vinculados a una exportacion exacta de checkpoint y no son mediciones nuevas de los ficheros de este repositorio.

| Benchmark | Etapa / metrica | Nano 9B | Mini 35B | Pro 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT, exactitud (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT, exactitud (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL, exito (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL, exito (%) | 67,16 | 70,43 | 73,89 |

Comparativa SFT frente a RL dentro de la familia:

| Modelo | OSWorld SFT | OSWorld RL | WebArena SFT | WebArena RL |
|---|---|---|---|---|
| Nano | 76,05 | 78,90 | 64,16 | 67,16 |
| Mini | 83,29 | 85,30 | 67,98 | 70,43 |
| Pro | 85,87 | 88,64 | 69,58 | 73,89 |

Condiciones de evaluacion segun el informe: ScreenSpot-Pro con 1.581 ejemplos y una prediccion por captura, sin busqueda iterativa de zoom/recorte; OSWorld-G con 564 instrucciones refinadas y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida, coordenadas 0-1000); OSWorld-Verified con 361 tareas (excluidas ocho de Google Drive) y limite de 100 pasos; WebArena-Verified con 812 tareas y comprobaciones oficiales, tambien con limite de 100 pasos. En OSWorld 2.0 (108 tareas, limite de 500 pasos) el informe cita un 66,80% de credito parcial medio para Pro tras RL, metrica que no equivale a tasa de completado total.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 397B parametros totales, la carga completa de pesos en bf16 supera ampliamente la memoria de cualquier GPU consumer; el repo ocupa 793,6 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el despliegue requeriria multiples aceleradores de clase centro de datos (A100, H100 u equivalentes) en configuracion multi-GPU o multi-nodo.
- GPU consumer: no cabe en GPU consumer por el volumen de pesos, aunque el computo por token sea de 17B activos.
- Opciones de despliegue: libreria transformers como via principal; el autor exige el NorthCUA Harness para el uso como agente. No se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | OSWorld-Verified (RL) | Licencia |
|---|---|---|---|---|---|
| NorthCUA-Pro | 397B | 17B | no disponible | 88,64% | Apache-2.0 |
| NorthCUA-Mini | 35B | 3B | no disponible | 85,30% | Apache-2.0 |
| NorthCUA-Nano | 9B | 9B (denso) | no disponible | 78,90% | Apache-2.0 |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada; la comparativa se limita a la propia familia NorthCUA.

## Limitaciones y advertencias

- Los resultados de benchmarks provienen del informe tecnico y no estan vinculados a una exportacion exacta de checkpoint; no son mediciones de los ficheros publicados en el repositorio.
- El uso como agente requiere el NorthCUA Harness oficial; sin el, las llamadas a herramientas y la conversion de coordenadas no funcionan segun el diseno previsto.
- Contrato estricto de coordenadas normalizadas 0-1000: cualquier integracion que espere pixeles crudos producira acciones incorrectas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en tareas de agente, una accion erronea sobre una GUI real puede tener efectos irreversibles.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar tareas con historiales muy largos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del arnes y de los pesos base Qwen3.5.
- El modelo esta disenado para entornos de escritorio y navegador; su rendimiento fuera de ese dominio no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Pro/blob/main/LICENSE
- Pagina del proyecto: https://beipo.top/blog/northcua/
- Repositorio del arnes: https://github.com/china-qijizhifeng/NorthCUA-Harness
- NorthCUA-Nano: https://huggingface.co/beipo-ai/NorthCUA-Nano
- NorthCUA-Mini: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Paper (referencia arXiv en tags): arxiv:2611.02102
