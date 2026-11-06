# GUI-Gym/MobileGym-4B

## Resumen

MobileGym-4B es un checkpoint de Qwen3-VL-4B-Instruct afinado mediante aprendizaje por refuerzo (GRPO) para actuar como agente visual en entornos de interfaz grafica de movil. Lo desarrolla el colectivo GUI-Gym como reproduccion independiente del entrenamiento descrito en el articulo MobileGym (arXiv:2605.26114), no como lanzamiento oficial del proyecto original. El modelo recibe capturas de pantalla junto con instrucciones en lenguaje natural y produce acciones sobre la GUI, resolviendo el problema de control de dispositivos moviles mediante un modelo de vision-lenguaje de tamano medio.

La relevancia actual reside en que demuestra que un modelo de aproximadamente 4.800 millones de parametros, entrenado con solo 10 actualizaciones de GRPO sobre 160 tareas y tres GPU H200, alcanza una tasa de exito media del 19,34% en el split de test de MobileGym (256 tareas). Es un resultado modesto en terminos absolutos, pero util como referencia reproducible de cuanto puede aportar el RL sobre un VLM instruct ya competente en tareas de agente movil.

Arquitectura basada en Qwen3-VL (transformer multimodal con torre de vision), contexto de hasta 40.960 tokens segun la configuracion de servicio sugerida por el autor, pesos en safetensors y licencia no designada explicitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (vision-lenguaje), afinado con GRPO |
| Parametros totales | 4.826.771.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (configuracion de servicio indicada por el autor con `--max-model-len 40960`) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados de Qwen3-VL-4B-Instruct, no declarados en la model card) |
| Licencia | no disponible (la model card no designa licencia para este checkpoint; el modelo base declara Apache-2.0 y el dataset MobileGym es CC BY-NC 4.0) |
| Formato de pesos | safetensors (checkpoint completo de Transformers con tokenizer, processor y chat template) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal que procesa imagenes (capturas de pantalla) y texto para generar respuestas. Sobre esa base se aplica aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) usando el split de entrenamiento de MobileGym, compuesto por 160 tareas. La configuracion del run: tres NVIDIA H200, 96 entornos paralelos, tamano de batch 12, tamano de grupo 8, 10 actualizaciones de GRPO, tasa de aprendizaje 1e-6 y coeficiente KL del actor de 0,01 (fijado explicitamente al valor del articulo, frente al 0,001 por defecto del lanzador del repositorio). Se uso el umbral de bucle de 8 del flujo de entrenamiento y una tolerancia de 10 pasos para las hojas de respuesta.

El autor advierte de que la reproduccion no es exacta: el articulo especifica 15 pasos de tolerancia para hojas de respuesta en evaluacion, pero no aclara si ese valor se aplicaba tambien durante el entrenamiento; el checkpoint sigue el codigo del repositorio. Ademas, el driver de entrenamiento se interrumpio tras guardar el paso 10 y completar su validacion interna, por un bloqueo al cancelar tareas asincronas, y la validacion interna sufrio errores de lectura del gateway, por lo que las metricas publicadas provienen de evaluaciones separadas.

## Capacidades

- Generacion de texto y razonamiento multimodal: interpreta capturas de pantalla de interfaces moviles junto con instrucciones en lenguaje natural.
- Control de GUI movil: emite acciones del protocolo de MobileGym (toques, deslizamientos, entrada de texto, etc.) en modo grounded.
- Razonamiento multi-paso: ejecuta episodios de hasta 15 pasos con tolerancia de hoja de respuesta y umbral de bucle de 10 en evaluacion.
- Agente visual con estado: mantiene el progreso de la tarea a lo largo de la interaccion con el entorno.
- Capacidades heredadas de Qwen3-VL-4B-Instruct: comprension de imagen, OCR implicito en capturas, dialogo conversacional y plantilla de chat incluida.
- Tool calling / function calling: no documentado especificamente para este checkpoint.
- Capacidades multilingues: no declaradas en la model card.

## Casos de uso

- Automatizacion de pruebas de aplicaciones moviles: el modelo puede pilotar un emulador o dispositivo real siguiendo instrucciones en lenguaje natural, sustituyendo scripts de UI fragiles por un agente que interpreta la pantalla en cada paso.
- Investigacion en agentes GUI: sirve como punto de partida reproducible para estudiar el efecto de GRPO sobre un VLM de 4B, con hiperparametros y metricas documentados.
- Asistencia a usuarios en tareas moviles: guiar a un usuario o ejecutar acciones simples (navegar menus, rellenar formularios) en un entorno controlado con el protocolo de MobileGym.
- Baseline para comparativas de RL en agentes visuales: al publicar SR y PR con cuatro semillas, permite medir mejoras de nuevas tecnicas frente a un resultado estable (desviacion tipica de 1,25 puntos porcentuales en SR).
- Extraccion de informacion de pantallas: combinado con el modo grounded, puede localizar elementos y describir el estado de la UI para pipelines de monitorizacion o auditoria.
- Prototipado de agentes de accesibilidad: interpretar la pantalla y proponer o ejecutar acciones para usuarios con dificultades motoras, siempre en entornos de prueba.
- Servicio de inferencia con vLLM: desplegable mediante `vllm serve ./MobileGym-4B --served-model-name mobilegym-4b --max-model-len 40960` para integraciones que necesiten el protocolo de acciones de MobileGym.

## Benchmarks y rendimiento

Evaluacion sobre las 256 tareas del split de test de MobileGym, en modo grounded, juicio basado en estado, temperatura 0,1, top-p 0,95, maximo 4.096 tokens de salida, umbral de bucle 10, retardo de accion 0,8 s y tolerancia de 15 pasos para hojas de respuesta.

| Semilla | SR (tasa de exito) | PR (progreso medio) |
|---|---:|---:|
| 42 | 21,09% | 36,79% |
| 43 | 19,14% | 33,27% |
| 44 | 17,58% | 33,82% |
| 45 | 19,53% | 33,52% |
| Media | **19,34%** | **34,35%** |

Desviacion tipica poblacional de SR entre ejecuciones: 1,25 puntos porcentuales. No se han publicado comparaciones con otros modelos en la informacion disponible. El autor subraya que estos resultados requieren el entorno MobileGym, sus prompts de agente, su protocolo de acciones y su configuracion de evaluacion; cargar el checkpoint por si solo no reproduce el benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (BF16): en torno a 10 GB solo para pesos, mas memoria para KV cache y procesamiento de imagenes; el repo ocupa 9,7 GB.
- Entrenamiento documentado: tres NVIDIA H200 con 96 entornos paralelos, batch 12 y grupo 8.
- GPU recomendadas para servicio: H100/H200 para throughput alto; A100 80 GB o 40 GB suficientes para inferencia en BF16; RTX 4090 (24 GB) viable en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion (no publicada), en tarjetas de 12-16 GB; no hay variantes GGUF oficiales.
- Opciones de despliegue: vLLM (comando indicado por el autor), Transformers con el checkpoint completo; llama.cpp/Ollama requeririan conversion a GGUF no disponible.
- Latencia y throughput: no disponibles; la evaluacion uso un retardo de accion de 0,8 s por paso y hasta 15 pasos por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileGym-4B | 4,83 B | 40.960 tokens (config. de servicio) | VLM + GRPO para GUI movil | no designada | Hugging Face, safetensors |
| Qwen3-VL-4B-Instruct (base) | ~4 B | no disponible en esta ficha | VLM instruct general | Apache-2.0 | Hugging Face |
| MobileGym oficial (referencia del articulo) | no disponible | no disponible | VLM + RL para GUI movil | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Tasa de exito baja en terminos absolutos: 19,34% de media en el split de test, con progreso medio del 34,35%; no es adecuado para automatizacion sin supervision.
- Reproduccion no exacta del entrenamiento original: discrepancia en la tolerancia de hojas de respuesta y entrenamiento interrumpido tras el paso 10.
- Dependencia fuerte del entorno: los resultados requieren MobileGym, sus prompts, protocolo de acciones y configuracion de evaluacion.
- Licencia sin designar para el checkpoint; el dataset MobileGym es CC BY-NC 4.0, lo que puede restringir el uso comercial. Verificar antes de desplegar en produccion.
- Riesgo de alucinacion en la interpretacion de capturas y en la eleccion de acciones; el modo grounded y el juicio basado en estado mitigan pero no eliminan el problema.
- Idiomas soportados no declarados; el comportamiento fuera del ingles (idioma del benchmark) no esta caracterizado.
- Sin variantes cuantizadas publicadas, lo que limita el despliegue en hardware de gama baja.
- Errores operativos documentados durante la evaluacion (fallos de escritura en el display de progreso) que, aunque auditados, indican fragilidad de la infraestructura de evaluacion.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GUI-Gym/MobileGym-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Articulo MobileGym: https://arxiv.org/abs/2605.26114
