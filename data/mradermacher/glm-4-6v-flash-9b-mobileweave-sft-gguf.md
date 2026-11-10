# mradermacher/GLM-4.6V-Flash-9B-MobileWeave-SFT-GGUF

## Resumen

GLM-4.6V-Flash-9B-MobileWeave-SFT es un modelo multimodal de 9.400 millones de parámetros (9,4 B) especializado en interacción con interfaces gráficas de dispositivos móviles (GUI agents). El modelo original lo desarrolla el colectivo GUI-Gym a partir de la familia GLM-4.6V-Flash de Zhipu AI, y ha sido ajustado finamente (SFT) sobre el conjunto de datos MobileWeave para tareas de navegación y automatización de apps móviles. La versión aquí descrita es una cuantización estática en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo resuelve el problema de la automatización de tareas en entornos móviles: dado un objetivo en lenguaje natural y capturas de pantalla del dispositivo, el modelo predice la siguiente acción (toque, deslizamiento, entrada de texto) sobre la UI. Combina un backbone de lenguaje de ~9,4 B parámetros con un proyector multimodal (mmproj) que procesa las imágenes de pantalla, lo que lo sitúa en la franja de modelos "Flash" de bajo coste frente a alternativas de mayor tamaño.

La relevancia actual radica en que es una de las pocas alternativas abiertas y cuantizadas para agentes GUI móviles que cabe en una GPU de consumo o incluso en un portátil con suficiente RAM unificada. La licencia no está declarada en la ficha, lo que supone una advertencia importante para uso comercial. El repositorio GGUF ocupa 89,7 GB por incluir todas las variantes de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje + proyector mmproj para visión); detalles internos no disponibles |
| Parámetros totales | 9.400.279.040 (~9,4 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |
| Tamaño del repo | 89,7 GB (todas las variantes) |
| Fecha de publicación | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo base es GUI-Gym/GLM-4.6V-Flash-9B-MobileWeave-SFT, un ajuste fino supervisado (SFT) del GLM-4.6V-Flash de Zhipu AI. La arquitectura es un transformer multimodal: un modelo de lenguaje de ~9,4 B parámetros acoplado a un codificador visual y a un proyector (mmproj) que inyecta las representaciones de imagen en el espacio del lenguaje. Las cuantizaciones GGUF separan el proyector multimodal en ficheros mmproj independientes (f16 de 1,9 GB y Q8_0 de 1,1 GB), lo que es habitual en el ecosistema llama.cpp para modelos visión-lenguaje.

El ajuste fino se realizó con Llama-Factory (según las etiquetas del repositorio) sobre el dataset MobileWeave, orientado a trayectorias de interacción con apps móviles. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información proporcionada. Las cuantizaciones son estáticas; el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles por el momento.

## Capacidades

- Comprensión de capturas de pantalla de interfaces móviles (visión) y razonamiento sobre el estado de la UI.
- Predicción de acciones de agente GUI: toques, deslizamientos, entrada de texto y navegación entre pantallas.
- Generación de texto y razonamiento multimodal en inglés y chino.
- Soporte de conversación multi-turno (etiqueta `conversational`).
- Integración con pipelines de Llama-Factory y formato compatible con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling ni modo "thinking" en la información disponible.

## Casos de uso

- Automatización de pruebas de apps móviles: el modelo puede recibir capturas de pantalla y generar secuencias de acciones para recorrer flujos de la app, sustituyendo scripts de UI frágiles por un agente que interpreta la pantalla.
- Asistentes de accesibilidad: dado un objetivo del usuario y la pantalla actual, el modelo propone la acción siguiente (pulsar un botón, desplazarse) para guiar a personas con dificultades de interacción.
- RPA móvil en empresas: automatización de tareas repetitivas (rellenar formularios, consultar estados) sobre apps sin API, usando el modelo como planificador de acciones.
- Investigación en agentes GUI: banco de pruebas para evaluar políticas de navegación móvil con un modelo de 9,4 B cuantizado, ejecutable en una sola GPU.
- Generación de datos sintéticos de trayectorias: el modelo puede producir pasos de interacción que sirvan para ampliar datasets de entrenamiento de agentes.
- Despliegue en local/edge para privacidad: al caber en cuantizaciones Q4 (~6 GB), permite ejecutar el agente en estaciones de trabajo sin enviar capturas de pantalla a la nube.
- Prototipado rápido de flujos de onboarding: simular recorridos de usuario sobre la app para detectar callejones sin salida en la UI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin caché KV): Q2_K ~4,1 GB; Q4_K_M ~6,3 GB; Q5_K_M ~7,2 GB; Q8_0 ~10,1 GB; f16 ~18,9 GB. Añadir ~1,1-1,9 GB para el proyector mmproj.
- La caché KV y el contexto efectivo no están documentados; el consumo real será superior al tamaño de los pesos.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0/f16 con holgura; RTX 3090/4080 (16-24 GB) para Q5-Q8; GPUs de 8-12 GB para Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, en Q4_K_M (~6,3 GB + mmproj) en tarjetas de 8 GB o más; en Q2_K en tarjetas de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base puede servirse con vLLM/TGI si se dispone de los pesos safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-4.6V-Flash-9B-MobileWeave-SFT (este) | ~9,4 B | no disponible | visión + texto | no disponible | GGUF / safetensors |
| GLM-4.6V-Flash (base, Zhipu AI) | ~9 B (Flash) | no disponible | visión + texto | no disponible | safetensors |
| Alternativas GUI-agent de tamaño similar | no disponible | no disponible | visión + texto | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; verificar la licencia del modelo base (GUI-Gym/GLM-4.6V-Flash-9B-MobileWeave-SFT) antes de desplegar en producción.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación en la predicción de acciones: puede proponer toques sobre elementos inexistentes o secuencias inválidas.
- Especialización estrecha: el ajuste SFT en MobileWeave puede degradar capacidades generales de conversación o razonamiento frente al modelo base.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que limita la calidad en tamaños pequeños.
- Sin datos de sesgos, contexto máximo ni evaluación de seguridad publicados.
- El repositorio de 89,7 GB incluye todas las variantes; descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GLM-4.6V-Flash-9B-MobileWeave-SFT-GGUF
- Modelo base: https://huggingface.co/GUI-Gym/GLM-4.6V-Flash-9B-MobileWeave-SFT
- Página de descargas del autor: https://hf.tst.eu/model#GLM-4.6V-Flash-9B-MobileWeave-SFT-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
