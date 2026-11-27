# atlas-institute/qwen35-08b-triage-rkllm

## Resumen

Nexus Swarm — Triage Agent (RKLLM w8a8) es un modelo de clasificación y enrutamiento de peticiones desarrollado por Atlas Institute dentro de su pipeline Code-Trainer / RTPI. Se trata del artefacto de despliegue del rol de triaje del sistema distribuido NEXUS Swarm v4a-max: recibe cualquier petición de usuario y devuelve una clasificación en JSON con categoría, ruta y nivel de confianza, que determina a qué nodo del enjambre se deriva la tarea.

El modelo parte de Qwen/Qwen3.5-0.8B, sobre el que se aplicó una cadena de adaptadores SFT y posteriormente GRPO, cuyos pesos se fusionaron en el modelo base y se convirtieron al formato RKLLM w8a8 (8 bits en pesos y activaciones) para ejecutarse en la NPU Rockchip RK3588 de 6 TOPS integrada en una Orange Pi 5 Plus. El resultado es un único fichero de aproximadamente 1,3 GB pensado para inferencia local de baja potencia en el nodo de triaje del enjambre.

Su relevancia es acotada pero clara: demuestra un flujo completo de ajuste fino y cuantización orientado a hardware NPU de gama baja para una tarea de enrutamiento muy específica en un dominio de seguridad ofensiva. No es un modelo de propósito general ni compite en benchmarks de razonamiento: es un componente de infraestructura con una interfaz de salida fija y un rol bien delimitado dentro de una topología multi-nodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 0,8 mil millones (modelo base); recuento exacto del artefacto no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | w8a8 (8 bits en pesos y activaciones) en formato RKLLM |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (fichero unico `triage.rkllm`, ~1,3 GB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen/Qwen3.5-0.8B, aunque la model card no detalla capas, dimensiones ocultas, mecanismos de atención ni longitud de contexto nativa. El entrenamiento se realizó en dos fases encadenadas sobre el modelo base: primero un ajuste supervisado (SFT) que dio lugar a `atlas-institute/qwen35-08b-triage-sft`, y después un entrenamiento con GRPO (Group Relative Policy Optimization, una variante de RL con recompensas verificables) que produjo `atlas-institute/qwen35-08b-triage-grpo`. Los adaptadores de ambas fases se fusionaron en los pesos base antes de la conversión.

La innovación técnica destacable no está en el modelo sino en el pipeline de despliegue: la conversión se realizó con rkllm-toolkit >= 1.3.0 sobre x86_64, apuntando a cuantización w8a8 para la NPU RK3588. El objetivo declarado es ejecutar el clasificador en una Orange Pi 5 Plus con RKLLM Runtime, expuesto como servidor en el puerto 8088. La tarea aprendida es una clasificación cerrada en seis categorías (`recon`, `exploit`, `code-review`, `report`, `admin`, `unknown`) con reglas de enrutamiento explícitas hacia `nexus-orchestrator`, `nexus-worker` o `nexus-explore`.

## Capacidades

- Clasificación de peticiones en seis categorías predefinidas del dominio de seguridad ofensiva.
- Generación de salida estructurada en JSON con los campos `category`, `route` y `confidence` (0.0-1.0).
- Enrutamiento a nodos del enjambre según reglas: tareas multi-paso complejas a `nexus-orchestrator`, tareas simples de una herramienta a `nexus-worker`, tareas de búsqueda, lectura y clasificación a `nexus-explore`, y fallback a `nexus-orchestrator` en caso de duda.
- Ejecución en NPU Rockchip RK3588 (6 TOPS) mediante RKLLM Runtime, sin GPU dedicada.
- Soporte de tool calling, agentes multi-paso o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de peticiones en un enjambre de agentes de seguridad: el modelo actúa como primera capa que recibe la entrada del usuario y decide qué nodo la procesa, evitando que el orquestador (Qwen3-14B) consuma ciclos en tareas triviales.
- Despliegue en hardware de bajo consumo: al ejecutarse en una NPU RK3588 de 6 TOPS, permite mantener el clasificador siempre activo en una Orange Pi 5 Plus sin ocupar ninguna GPU del clúster.
- Clasificación de tickets y tareas de auditoría: la categoría `report` y `code-review` permiten separar automáticamente solicitudes de revisión de código o generación de informes del resto del flujo operativo.
- Filtrado previo y control de admisión: la categoría `unknown` y el campo `confidence` permiten descartar o escalar peticiones ambiguas antes de que lleguen a nodos con mayor coste computacional.
- Enrutamiento de tareas de reconocimiento: las peticiones etiquetadas como `recon` se derivan a `nexus-explore`, adecuado para operaciones de búsqueda y lectura sobre el objetivo.
- Prototipado de pipelines de clasificación con RL: la cadena SFT → GRPO → RKLLM sirve como referencia reproducible para equipos que quieran ajustar un modelo pequeño con recompensas verificables y desplegarlo en NPU.
- Componente de router en sistemas multi-agente experimentales: el formato de salida JSON fijo facilita su integración como nodo de decisión en arquitecturas de orquestación con varios modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: NPU Rockchip RK3588 (6 TOPS), por ejemplo en Orange Pi 5 Plus con arquitectura ARM64.
- VRAM: no aplica; el modelo se ejecuta en NPU con memoria del sistema compartida. El fichero pesa aproximadamente 1,3 GB.
- GPU recomendadas: no aplica para este artefacto; no es desplegable en CUDA con el formato publicado.
- Compatibilidad con GPU de consumo: no; el formato RKLLM está ligado al runtime de Rockchip y no es portable a llama.cpp, vLLM, TGI ni Ollama.
- Opciones de despliegue: RKLLM Runtime (`rkllm_server triage.rkllm --port 8088`), disponible en https://github.com/airockchip/rknn-llm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| qwen35-08b-triage-rkllm | 0,8 B | No disponible | RKLLM w8a8 | Apache 2.0 | NPU RK3588 |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Safetensors | No disponible | GPU/CPU |
| qwen35-08b-triage-sft | 0,8 B | No disponible | No disponible | Apache 2.0 | GPU/CPU |
| qwen35-08b-triage-grpo | 0,8 B | No disponible | No disponible | Apache 2.0 | GPU/CPU |

La comparación relevante es interna a la propia cadena de adaptadores del autor: el artefacto RKLLM es la variante cuantizada y empaquetada para NPU de las versiones SFT y GRPO, que conservan los pesos sin conversión. Frente al modelo base, la diferencia está en el ajuste para la tarea de triaje y en el formato de despliegue, no en tamaño ni arquitectura. No se dispone de datos de rendimiento que permitan comparar calidad frente a alternativas de clasificación de la misma categoría.

## Limitaciones y advertencias

- Modelo altamente especializado: su función es clasificar y enrutar peticiones de un dominio concreto de seguridad ofensiva; no es adecuado como modelo de propósito general.
- Idioma: solo se declara inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Formato propietario de hardware: el fichero RKLLM solo se ejecuta con RKLLM Runtime sobre NPU Rockchip; no es portable a ecosistemas CUDA, ROCm ni a runtimes de inferencia estándar.
- Riesgo de alucinación en la clasificación: al ser un modelo de 0,8 B ajustado para emitir JSON, puede producir categorías o niveles de confianza incorrectos; el campo `confidence` debería usarse con umbrales explícitos y el fallback a `nexus-orchestrator` está previsto precisamente para los casos dudosos.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez frente a entradas adversarias o fuera de distribución.
- Contexto: la longitud de contexto no está publicada, lo que impide dimensionar peticiones largas con seguridad.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el dominio de aplicación (seguridad ofensiva) puede estar sujeto a restricciones legales según la jurisdicción; la licencia no exime del cumplimiento normativo.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación externa ni de mantenimiento posterior.
- Dependencia de la cadena de conversión: requiere rkllm-toolkit >= 1.3.0 para reproducir la conversión, y la model card no documenta hiperparámetros de cuantización más allá de w8a8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atlas-institute/qwen35-08b-triage-rkllm
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Adaptador SFT: https://huggingface.co/atlas-institute/qwen35-08b-triage-sft
- Adaptador GRPO: https://huggingface.co/atlas-institute/qwen35-08b-triage-grpo
- Repositorio del pipeline Code-Trainer: https://github.com/cmndcntrlcyber/code-trainer-pipeline
- Perfil del autor: https://github.com/cmndcntrlcyber
- RKLLM Runtime (Rockchip): https://github.com/airockchip/rknn-llm
- Nodo orquestador del enjambre: https://huggingface.co/atlas-institute/qwen3-14b-orchestrator-gguf
- Nodo worker del enjambre: https://huggingface.co/atlas-institute/qwen3-8b-worker-gguf
- Nodo explore del enjambre: https://huggingface.co/atlas-institute/gemma4-4b-explore-gguf
