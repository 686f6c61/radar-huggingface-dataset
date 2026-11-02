# china-beipo/NorthCUA-Pro

## Resumen

NorthCUA-Pro es un modelo de tipo computer-use (agente que opera interfaces gráficas) desarrollado por china-beipo, construido sobre la arquitectura Qwen3.5 en configuración de mezcla de expertos (MoE). Con 397.000 millones de parámetros totales y 17.000 millones activos por token, es el miembro de mayor tamaño de la familia NorthCUA, que se completa con Nano (9B, denso) y Mini (35B, MoE con 3B activos). El modelo recibe peticiones del usuario, capturas de pantalla e historial de interacción, y genera razonamiento, respuestas y llamadas a herramientas para su ejecución en un entorno de escritorio o navegador.

El modelo aborda el problema de la automatización fiable de tareas sobre software real: no solo interpreta instrucciones, sino que mantiene interacción sostenida, verifica resultados intermedios y ejecuta acciones verificadas a lo largo de trayectorias largas. Su relevancia actual reside en que se distribuye con pesos abiertos bajo licencia Apache-2.0, algo poco habitual en modelos de esta escala orientados a agentes, y en que se acompaña de un arnés de ejecución oficial (NorthCUA Harness) que define el contrato de coordenadas y el bucle de observación-acción.

La información pública disponible no detalla la longitud de contexto, los idiomas soportados ni la composición exacta del dataset de entrenamiento. El repositorio de HuggingFace ocupa 793,6 GB y acumula 361 descargas y 5 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en Qwen3.5 |
| Parámetros totales | 396.802.360.816 (397B) |
| Parámetros activos | 17B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

NorthCUA-Pro es un transformer de mezcla de expertos derivado de Qwen3.5, con 397B parámetros totales y 17B activos por token, lo que reduce el coste computacional por token respecto a un modelo denso equivalente, aunque no el requisito de memoria para cargar todos los pesos. El modelo es multimodal de entrada (image-text-to-text) y está especializado en la generación de acciones sobre interfaces gráficas, con un contrato estricto de coordenadas normalizadas en el rango 0–1000, que el arnés oficial convierte a píxeles en tiempo de ejecución.

El entrenamiento combina aprendizaje supervisado (SFT) sobre trayectorias completas de trabajo con aprendizaje por refuerzo (RL) conjunto sobre entornos de escritorio y web. La documentación del autor describe un «bucle de experiencia» que integra el arnés de ejecución, un mecanismo de experiencia verificada y un esquema de aprendizaje por etapas (staged learning), orientado a que el modelo aprenda pasos dependientes, artefactos intermedios y verificación de resultados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como DPO.

## Capacidades

- Generación de razonamiento y respuestas en lenguaje natural a partir de instrucciones, capturas de pantalla e historial de interacción.
- Localización visual (visual grounding) de elementos de interfaz en aplicaciones de escritorio y flujos web.
- Generación de llamadas a herramientas (tool calling) para ejecutar acciones sobre el entorno mediante el NorthCUA Harness.
- Ejecución de tareas de múltiples pasos con dependencias entre acciones y verificación de resultados intermedios.
- Operación sostenida sobre estados cambiantes del software a lo largo de trayectorias largas.
- Procesamiento de observaciones multimodales (imagen y texto) en el pipeline image-text-to-text.
- Coordenadas de acción normalizadas en el espacio 0–1000, con conversión a píxeles delegada al arnés.

## Casos de uso

- Automatización de flujos de escritorio: el modelo puede ejecutar secuencias de acciones sobre aplicaciones nativas (abrir, configurar, exportar) manteniendo el estado entre pasos y verificando el resultado de cada uno, gracias a su entrenamiento sobre trayectorias completas.
- Automatización de navegador web: adecuado para tareas de rellenado de formularios, navegación multi-página y extracción de datos, con localización visual de elementos y llamadas a herramientas ejecutadas por el arnés.
- Pruebas de regresión de interfaz de usuario: el modelo puede actuar como agente que recorre flujos de la aplicación y comprueba resultados, integrándose en pipelines de QA donde se requiere verificación de extremo a extremo.
- Asistencia operativa en back-office: gestión de tareas repetitivas sobre sistemas internos (altas, consultas, actualizaciones) donde el modelo interpreta la pantalla y emite acciones verificables paso a paso.
- Investigación en agentes computer-use: al publicarse con pesos abiertos y licencia Apache-2.0, sirve como base para experimentación académica en aprendizaje por refuerzo sobre entornos reales y para reproducir los resultados del informe técnico.
- Orquestación de tareas largas con verificación: escenarios donde la tarea excede un único paso y requiere artefactos intermedios (por ejemplo, generar un documento, guardarlo y comprobar su contenido), aprovechando el entrenamiento en pasos dependientes y verificación de resultados.
- Despliegue como componente de un agente mayor: el modelo puede integrarse como motor de decisión y acción dentro de un sistema multiagente que delegue en él la interacción con la GUI, manteniendo el contrato de coordenadas con el arnés.

## Benchmarks y rendimiento

Resultados reportados en el informe técnico de NorthCUA. El autor advierte de que corresponden a checkpoints de investigación y no a mediciones nuevas de los ficheros de este repositorio.

| Benchmark | Etapa / métrica | Nano · 9B | Mini · 35B | Pro · 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT · precisión (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · precisión (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · éxito (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · éxito (%) | 67,16 | 70,43 | 73,89 |

| Modelo | OSWorld SFT | OSWorld RL | WebArena SFT | WebArena RL |
|---|---|---|---|---|
| Nano | 76,05 | 78,90 | 64,16 | 67,16 |
| Mini | 83,29 | 85,30 | 67,98 | 70,43 |
| Pro | 85,87 | 88,64 | 69,58 | 73,89 |

Condiciones de evaluación declaradas: ScreenSpot-Pro con 1.581 ejemplos y una predicción por captura, sin búsqueda iterativa de zoom/recorte; OSWorld-G con 564 instrucciones refinadas y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida); OSWorld-Verified con 361 tareas (excluidas ocho de Google Drive) y WebArena-Verified con 812 tareas, ambas con límite de 100 pasos. El informe también recoge un 66,80 % de crédito parcial medio para Pro tras RL en OSWorld 2.0 (108 tareas, límite de 500 pasos), métrica que no equivale a tasa de finalización completa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 397B parámetros en safetensors (aproximadamente 794 GB en BF16), la carga completa requiere del orden de 800 GB de memoria de acelerador en precisión nativa. No se documentan cuantizaciones oficiales; una hipotética cuantización a 8 bits reduciría el requisito a unos 400 GB y a 4 bits a unos 200 GB, pero dichas variantes no están publicadas ni verificadas por el autor.
- GPU recomendadas: para pesos completos en BF16 se requiere un nodo multi-GPU de clase H100 o H200 (por ejemplo, 8×H100 de 80 GB) o A100 de 80 GB en configuración equivalente. No cabe en GPUs de consumo.
- GPU de consumo: no viable para el modelo completo; la familia ofrece alternativas de menor tamaño (Nano 9B y Mini 35B con 3B activos) para entornos con menos memoria.
- Opciones de despliegue: el modelo se publica para la librería transformers; el autor no documenta soporte explícito de vLLM, TGI, llama.cpp u Ollama, ni publica pesos GGUF. El uso previsto requiere el NorthCUA Harness para la gestión de prompts, llamadas a herramientas, observaciones y ejecución de acciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NorthCUA-Pro | 397B | 17B | no disponible | Computer-use multimodal | Apache-2.0 | Pesos abiertos en HuggingFace |
| NorthCUA-Mini | 35B | 3B | no disponible | Computer-use multimodal | Apache-2.0 | Pesos abiertos en HuggingFace |
| NorthCUA-Nano | 9B | 9B (denso) | no disponible | Computer-use multimodal | Apache-2.0 | Pesos abiertos en HuggingFace |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos de terceros (por ejemplo, otros agentes computer-use) que permitan una comparación cuantitativa directa; dicha comparación se indica como no disponible. La comparativa interna de la familia NorthCUA muestra una progresión monótona en las cuatro métricas reportadas (ScreenSpot-Pro, OSWorld-G, OSWorld-Verified y WebArena-Verified), con Pro como el miembro de mayor rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor en la información disponible.
- Riesgo de alucinación: no cuantificado; en tareas de computer-use, una localización visual errónea o una acción mal interpretada puede producir efectos reales sobre el sistema operativo, por lo que se recomienda verificación de resultados y límites de pasos.
- Dependencia del arnés: el modelo está diseñado para ejecutarse con el NorthCUA Harness oficial; su uso fuera de ese entorno puede romper el contrato de coordenadas normalizadas (0–1000) y degradar el rendimiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles en la información pública, lo que impide garantizar cobertura multilingüe o tareas con historiales muy largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación con atribución y aviso de cambios; no obstante, el autor no detalla condiciones adicionales de uso aceptable para la ejecución de acciones sobre sistemas de terceros.
- Caveat de producción: los benchmarks publicados corresponden a checkpoints de investigación y el propio autor advierte que no están vinculados a una exportación exacta de los pesos de este repositorio; deben tomarse como orientativos.
- Requisito de recursos: el tamaño del repositorio (793,6 GB) y la necesidad de memoria multi-GPU limitan su despliegue a infraestructuras de datacenter.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/china-beipo/NorthCUA-Pro
- Página del proyecto: https://beipo.top/blog/northcua/
- Repositorio del arnés (GitHub): https://github.com/china-qijizhifeng/NorthCUA-Harness
- Familia NorthCUA en HuggingFace: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Modelo Nano: https://huggingface.co/beipo-ai/NorthCUA-Nano
- Modelo Mini: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Pro/blob/main/LICENSE
