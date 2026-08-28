# dmitchelljackson/cerebellum-qwen35-history-actions-lora

## Resumen

Cerebellum Qwen3.5 AndroidWorld RL Adapter es un adaptador PEFT (LoRA) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por Mitchell Jackson (dmitchelljackson) para control rápido y local de interfaces de usuario Android. El modelo está diseñado para actuar como capa de ejecución de bajo nivel entre un modelo frontier remoto (que planifica y razona) y un harness de automatización de Android: recibe una captura de pantalla con etiquetas set-of-mark, el árbol de accesibilidad compacto y hasta cuatro fotogramas de historial, y emite un comando de acción compacto (tocar, mantener pulsado, escribir, desplazarse, etc.). El objetivo es reducir latencia y coste de inferencia al delegar la interacción UI repetitiva a un modelo local de 0,8B, reservando el modelo frontier para las decisiones de alto nivel.

El adaptador se entrenó íntegramente en una RTX 3060 de 12 GB, una restricción deliberada para comprobar hasta dónde llega un modelo pequeño entrenable localmente en esta tarea. Incluye un curriculum SFT por etapas (grounding de toques, selección con historial, gramática completa) seguido de una fase de reinforcement learning. En la evaluación held-out de 100 tareas de AndroidWorld alcanza un 51% de éxito global, con resultados muy dispares por familia de tareas (100% en contactos y audio, 0% en navegador, calendario, archivos, mapas y Markor). El autor lo presenta explícitamente como un hito de trabajo en curso, no como un resultado final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B, pipeline image-text-to-text |
| Parametros totales | Modelo base: 0,8B (según nomenclatura); adaptador: no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-0.8B, un modelo de lenguaje multimodal (image-text-to-text) de 0,8B parámetros. No se dispone de detalles públicos sobre la arquitectura interna del modelo base (si es transformer denso, atención estándar, etc.), pero al ser un adaptador LoRA, solo se entrenan matrices de bajo rango sobre las capas del base. El pipeline completo es: entrada multimodal (imagen de pantalla + texto de objetivo + árbol de accesibilidad + historial) y salida de texto con una gramática de acciones restringida.

El entrenamiento siguió un curriculum SFT por etapas: primero grounding de tap/long-press con etiquetas aleatorias y decodificación restringida; después selección de tap con historial (hasta cuatro fotogramas previos); luego la gramática completa (T/P, K, scroll, wait, acciones de sistema); y finalmente una fase de reinforcement learning. Se usaron capturas de pantalla de ancho 464 para la imagen actual y 232 para el historial, con árboles de accesibilidad compactados y filtrados. El checkpoint pre-RL se conserva en `sft_freeze/` como respaldo. La decodificación en inferencia es restringida: el primer token se limita a códigos de acción válidos, las etiquetas T/P se limitan a las visibles en pantalla, y las acciones de un solo token terminan inmediatamente.

## Capacidades

- Control de UI Android: emite comandos de acción (tap, long-press, escribir texto, scroll, back, home, wait, done, impossible) a partir de capturas de pantalla y árboles de accesibilidad.
- Comprensión de historial: utiliza hasta cuatro fotogramas/acciones previas para decidir la siguiente acción, con resumen de historial antiguo como texto compacto.
- Decodificación restringida: gramática de acciones con restricciones sobre etiquetas visibles, lo que reduce acciones inválidas.
- Integración con agentes jerárquicos: diseñado para funcionar como capa de ejecución local bajo un modelo frontier remoto.
- Multimodal: procesa imágenes (capturas de pantalla) y texto (objetivo, árbol de accesibilidad).
- Entrenable en hardware de consumo: el entrenamiento completo se realizó en una RTX 3060 de 12 GB.

## Casos de uso

- Automatización de pruebas de apps Android: el modelo puede ejecutar flujos de UI repetitivos (rellenar formularios, navegar por listas, activar ajustes) en emuladores o dispositivos reales, reduciendo la dependencia de un modelo remoto para cada paso.
- Asistente de accesibilidad: dado un objetivo (p. ej., "activar WiFi"), el modelo puede localizar y tocar el elemento correcto en pantalla, ayudando a personas con discapacidad motora a interactuar con el dispositivo.
- Agente de control remoto híbrido: un modelo frontier planifica la tarea y delega los pasos de interacción a este adaptador local, reduciendo latencia y coste por llamada API.
- Automatización de tareas personales en Android: encender/ apagar Bluetooth, grabar audio, crear contactos, gestionar alarmas o cronómetros, todo mediante comandos de voz o texto delegados a este modelo.
- Evaluación de UI/UX: el modelo puede ejecutar tareas estándar de AndroidWorld para medir la usabilidad de una app, detectando qué flujos son difíciles de completar.
- Investigación en RL para agentes de UI: sirve como punto de partida para estudiar curriculum learning, decodificación restringida y RL en entornos de interacción con pantallas, con un coste de entrenamiento asequible.

## Benchmarks y rendimiento

Evaluación en split held-out de 100 tareas de AndroidWorld (config `android_world_mixed100_eval_infraclean_20260609.json`, 5 emuladores Android, app objetivo preabierta):

| Metrica | Valor |
|---|---|
| Exito global | 51/100 = 51,0% |
| Infra skips | 0 |
| Pasos promedio | 11,9 |

Resultados por familia de tareas:

| Familia | Resultado |
|---|---|
| Audio record | 4/4 = 100% |
| Contacts | 11/11 = 100% |
| Clock | 9/10 = 90% |
| System | 16/21 = 76,2% |
| Recipe | 8/12 = 66,7% |
| Camera | 3/8 = 37,5% |
| Browser | 0/3 = 0% |
| Calendar | 0/8 = 0% |
| Files | 0/2 = 0% |
| Map/OsmAnd | 0/3 = 0% |
| Markor | 0/18 = 0% |

No se han publicado resultados comparativos con otros modelos de control de UI en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en FP16 ocupa aproximadamente 1,6 GB; con el adaptador LoRA y overhead de vision, se estima entre 2 y 3 GB en FP16. Con cuantizacion 4-bit del base, puede bajar a menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente para inferencia. El entrenamiento se realizó en una RTX 3060 de 12 GB.
- Cabe en GPU consumer: sí, incluso en GPUs integradas con suficiente RAM compartida, aunque con menor rendimiento.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o el harness propio incluido en el repositorio (`rl_harness.policy_qwen35`). El modelo requiere decodificación restringida, por lo que el harness propio es la opción más fiable.
- Latencia y throughput: no disponibles. Al ser un modelo de 0,8B, se espera una latencia de decodificación de decenas de milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de control de UI Android de tamaño similar (0,8B) con los mismos benchmarks. El modelo base Qwen3.5-0.8B sin adaptador no tiene resultados publicados en AndroidWorld. Se puede considerar como alternativa a agentes de UI basados en modelos frontier (p. ej., GPT-4V, Claude) pero con un enfoque de ejecución local especializada, no comparable directamente en capacidad general.

## Limitaciones y advertencias

- Rendimiento muy desigual por familia de tareas: 0% en Browser, Calendar, Files, Map/OsmAnd y Markor. No es adecuado para flujos complejos de gestión de archivos, calendario o navegación web.
- Trabajo en curso: el autor indica que es un hito de la primera iteración, con una segunda iteración en desarrollo. Los resultados pueden cambiar.
- No es un modelo de chat general: requiere decodificación restringida con la gramática de acciones; usarlo sin restricciones producirá salidas no válidas.
- Problemas conocidos: sliders y controles de rango no funcionan (las etiquetas de rango se añadieron al harness después del entrenamiento). Las tareas Expense* y SimpleSms* se excluyeron por problemas de setup de las apps.
- Sesgos: al entrenarse en AndroidWorld, puede tener sesgos hacia los patrones de UI de las apps incluidas en ese benchmark, y puede fallar en apps con diseños muy diferentes.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar etiquetas o acciones incorrectas si la pantalla no coincide con lo esperado; la decodificación restringida mitiga parcialmente este riesgo.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias restricciones (consultar la licencia de Qwen).
- Idiomas: no se especifican idiomas soportados; el entrenamiento se realizó presumiblemente en inglés (las tareas de AndroidWorld están en inglés).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dmitchelljackson/cerebellum-qwen35-history-actions-lora
- Perfil del autor: https://huggingface.co/dmitchelljackson
- Página de inferencia en FriendliAI: https://friendli.ai/models/dmitchelljackson/cerebellum-qwen35-history-actions-lora
- Paper de Qwen3 (referencia del modelo base): https://arxiv.org/abs/2505.09388
- Implementación de Qwen3.5 en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/src/models/qwen35.cpp
