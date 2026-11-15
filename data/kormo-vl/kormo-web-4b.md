# KORMo-VL/KORMo-Web-4B

## Resumen

KORMo-Web-4B es un modelo vision-language de tipo agente web desarrollado por KORMo-VL, afinado a partir de Qwen/Qwen3.5-4B. Su propósito es completar tareas reales en un navegador operando exclusivamente sobre capturas de pantalla: recibe una petición en coreano o inglés y ejecuta de forma autónoma clics, escritura y navegación entre sitios y pestañas hasta finalizar la tarea. No requiere árbol DOM ni árbol de accesibilidad, lo que simplifica su integración en entornos de automatización reales.

El modelo tiene 5.174.964.736 parámetros según los pesos en safetensors (etiquetado comercialmente como 4B por su base Qwen3.5-4B) y se distribuye bajo licencia Apache-2.0, con pesos en safetensors y compatibilidad con transformers y vLLM. Soporta contextos de hasta 131.072 tokens según la configuración de despliegue recomendada por el autor, y está pensado para ejecutarse en una única GPU (TP=1).

Su relevancia actual radica en que aborda el problema de los agentes de computer-use con un enfoque screenshot-only y un paso explícito de razonamiento antes de cada acción, lo que facilita la depuración y la inspección del comportamiento. Según la model card, supera a agentes web open-weight comparables en evaluación sobre sitios web en vivo, con mejoras de +9,6 puntos en inglés y +22,1 puntos en coreano frente a los modelos de referencia comparados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (fine-tuning de Qwen/Qwen3.5-4B); detalles internos de la arquitectura base no disponibles |
| Parametros totales | 5.174.964.736 (pesos safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens en la configuración de despliegue recomendada (`--max-model-len 131072`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

KORMo-Web-4B es un fine-tuning del modelo base Qwen/Qwen3.5-4B, un vision-language model de la familia Qwen3.5. La arquitectura subyacente corresponde a la del modelo base; la model card no detalla la composición interna (número de capas, atención, componentes de visión) ni los hiperparámetros del ajuste. El modelo procesa una imagen (captura de pantalla) junto con texto estructurado que describe el estado del navegador (tamaño de pantalla, pestaña activa, URL y captura) y devuelve una acción en formato de tool calling.

El entrenamiento se orienta a tareas de agente web: el modelo recibe una petición del usuario, el estado observable de la pantalla y un esquema de herramientas (`tools.json`), y genera una secuencia de razonamiento breve seguida de una acción. La model card indica que el modelo "piensa y luego actúa", con un paso de razonamiento antes de cada acción, y que soporta flujos multi-sitio y multi-pestaña. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

Como innovaciones destacables, el modelo opera exclusivamente sobre capturas de pantalla (sin DOM ni accessibility tree), verifica el resultado de cada acción en la siguiente captura y expone un modo de pensamiento (`enable_thinking`) configurable en el chat template. El autor incluye un arnés de navegador de referencia (`agent_playwright.py`), el esquema de herramientas y los ajustes exactos de inferencia (temperatura 0.6, top_p 0.95, top_k 20, max_tokens 16384).

## Capacidades

- Generación de acciones de agente web a partir de capturas de pantalla: clics, escritura, navegación y gestión de pestañas.
- Planificación multi-paso con razonamiento explícito antes de cada acción (modo thinking activable).
- Soporte de tool calling / function calling mediante un esquema de herramientas incluido (`tools.json`).
- Comprensión de instrucciones naturales en coreano e inglés, tanto comandos cortos como peticiones conversacionales largas.
- Flujos multi-sitio y multi-pestaña: buscar en un sitio, verificar en otro y escribir el resultado en un tercero.
- Verificación del resultado de cada acción sobre la siguiente captura de pantalla.
- Capacidades de visión para interpretar interfaces web renderizadas (imagen-texto-a-texto).
- No se documentan capacidades de audio ni de generación de código fuera del contexto de acciones de navegador.

## Casos de uso

- Automatización de compras comparativas: el modelo puede recibir una petición como buscar un producto con un rango de precio y características en un sitio coreano, recorrer los resultados y devolver los precios; la model card incluye un ejemplo de este tipo sobre Danawa.
- Asistentes de navegación para usuarios: integrado en un navegador o extensión, puede ejecutar tareas como "busca X y abre la página oficial" gestionando la pestaña activa y verificando cada paso en la captura siguiente.
- Pruebas de aceptación end-to-end de aplicaciones web: al operar solo sobre píxeles, puede usarse para validar flujos de usuario reales en Chromium mediante Playwright sin depender de selectores DOM frágiles.
- Extracción de información multi-sitio: buscar datos en un sitio, contrastarlos en otro y consolidar el resultado en un tercero, aprovechando su soporte de múltiples pestañas.
- Agentes de atención al cliente para portales web: puede guiar o ejecutar trámites en portales en coreano e inglés, con razonamiento inspeccionable para auditar decisiones.
- Automatización de tareas repetitivas de back-office en interfaces legacy sin API: al basarse en capturas, funciona sobre aplicaciones web antiguas donde no hay acceso programático al DOM.
- Investigación en agentes computer-use: su formato de observación, esquema de herramientas y ajustes de inferencia publicados lo hacen útil como base reproducible para experimentos de agentes web.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 612 tareas en sitios web en vivo (300 en inglés, 312 en coreano), con el mismo juez LLM para todos los modelos. La métrica es tasa de éxito (%) sobre el total de tareas.

| Modelo | Tamano | Online-Mind2Web EN | Online-Mind2Web KO |
|---|---:|---:|---:|
| Qwen3.5-4B (base, sin fine-tuning) | 4B | 20,0 | 13,5 |
| Fara-1.5-4B | 4B | 20,7 | 7,7 |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 |
| OpenWebRL-4B | 4B | 32,7 | 15,4 |
| KORMo-Web-4B | 4B | 42,3 | 42,3 |
| KORMo-Web-9B | 9B | 51,0 | 48,1 |

Según la model card, KORMo-Web-4B supera al base Qwen3.5-4B en +22,3 puntos en inglés y +28,8 puntos en coreano, y supera a los agentes web open-weight comparados en +9,6 puntos en inglés y +22,1 puntos en coreano. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5,17 mil millones de parámetros en safetensors y pesos en BF16/FP16, la estimación orientativa ronda los 10-11 GB solo para pesos, más overhead de KV cache y del codificador visual. El repositorio ocupa 10,4 GB.
- GPU recomendadas: el autor indica que el modelo corre en una única GPU (TP=1); se ha probado con vLLM 0.23.0 y transformers 5.12.1. No se especifican modelos concretos de GPU.
- GPU de consumo: no confirmado por el autor; por tamaño de pesos, es plausible en GPUs de consumo con 16 GB o más de VRAM en precisión reducida, pero no hay validación publicada en la información disponible.
- Opciones de despliegue: vLLM (`vllm serve`), transformers; el autor incluye un arnés de referencia con Playwright y cliente compatible con la API de OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Online-Mind2Web EN | Online-Mind2Web KO | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| KORMo-Web-4B | 5,17B (etiquetado 4B) | 131.072 (config. recomendada) | 42,3 | 42,3 | Apache-2.0 | Hugging Face |
| OpenWebRL-4B | 4B | no disponible | 32,7 | 15,4 | no disponible | no disponible |
| Fara-1.5-4B | 4B | no disponible | 20,7 | 7,7 | no disponible | no disponible |
| UI-TARS-1.5-7B | 7B | no disponible | 22,3 | 20,2 | no disponible | no disponible |
| Qwen3.5-4B (base) | 4B | no disponible | 20,0 | 13,5 | no disponible | Hugging Face |

La comparativa se limita a los datos de la evaluación publicada por el autor; no se dispone de información sobre contexto, licencia o disponibilidad de los modelos alternativos en la documentación proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran coreano e inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Dependencia de la captura de pantalla: al no usar DOM ni árbol de accesibilidad, la precisión depende de la calidad y resolución de la imagen y de que la interfaz sea visualmente interpretable.
- Riesgo de alucinación: como modelo generativo, puede proponer acciones incorrectas o interpretar mal el estado de la página; el autor mitiga esto con verificación sobre la siguiente captura, pero no elimina el riesgo.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias del modelo base Qwen3.5-4B y de los datos de entrenamiento, no detallados.
- Producción: no se publican latencias, throughput ni resultados de robustez ante cambios de diseño web; la evaluación se realizó sobre sitios en vivo en un momento concreto y puede no generalizar.
- Configuración sensible: el rendimiento depende de ajustes concretos (temperatura 0.6, top_p 0.95, top_k 20, max_tokens 16384, `enable_thinking`); desviarse de ellos puede degradar la calidad.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KORMo-VL/KORMo-Web-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información disponible papers, blogs, repositorios o demos adicionales fuera de la model card de Hugging Face.
