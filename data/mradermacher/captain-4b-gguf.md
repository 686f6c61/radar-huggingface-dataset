# mradermacher/CaPtain-4B-GGUF

## Resumen

CaPtain-4B (en su versión cuantizada GGUF, publicada por mradermacher) es un modelo de lenguaje multimodal de unos 4,8 mil millones de parámetros orientado a robótica y agentes encarnados (embodied agents). El modelo base, YijiaFan/CaPtain-4B, se ha entrenado mediante aprendizaje por refuerzo y ajuste fino supervisado (SFT) sobre datos específicos del dominio (YijiaFan/CaPtain-SFT-Data y YijiaFan/CaPtain-artifacts), siguiendo la filosofía "code-as-policy": el modelo genera código como mecanismo de acción para controlar agentes físicos o simulados, evaluado en benchmarks como LIBERO.

La relevancia de este modelo radica en la línea de investigación que sustituye las políticas neuronales opacas por generación de código interpretable, lo que permite auditar, depurar y componer comportamientos robóticos. La cuantización GGUF de mradermacher facilita su ejecución local en hardware de consumo, incluyendo GPU modestas e incluso CPU, gracias a versiones que van desde Q2_K (2,2 GB) hasta f16 (9,8 GB).

Esta ficha describe la versión cuantizada; los datos originales de entrenamiento y arquitectura detallada del modelo base no están disponibles en la información proporcionada más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (multimodal, con proyector mmproj) |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, YijiaFan/CaPtain-4B, es un modelo multimodal de aproximadamente 4,84 mil millones de parámetros. La existencia de archivos suplementarios mmproj (multi-modal projector) en Q8_0 y f16 indica que incorpora un componente de visión, probablemente un codificador de imágenes conectado mediante un proyector, lo cual es coherente con su uso en robótica, donde el agente debe percibir el entorno visual. La arquitectura concreta (tipo de transformer, codificador de visión empleado, longitud de contexto) no está detallada en la información disponible.

Respecto al entrenamiento, la model card del modelo base lista dos datasets: YijiaFan/CaPtain-SFT-Data (datos de ajuste fino supervisado) y YijiaFan/CaPtain-artifacts. Los tags incluyen reinforcement-learning y libero, lo que sugiere un pipeline que combina SFT con aprendizaje por refuerzo evaluado en el benchmark LIBERO de manipulación robótica. No se dispone de cifras sobre el número de tokens de entrenamiento, composición del dataset ni técnicas específicas como RLHF o DPO.

La cuantización GGUF fue realizada por mradermacher a partir de los pesos originales en formato HF (safetensors), mediante cuantizaciones estáticas (no imatrix/weighted en el momento de publicación).

## Capacidades

- Generación de código como política: siguiendo el enfoque code-as-policy, el modelo genera código ejecutable que define el comportamiento de un agente robótico, en lugar de producir acciones directamente.
- Comprensión visual: dispone de archivos mmproj (proyector multimodal) para su uso con llama.cpp, lo que permite procesar entradas de imagen (observaciones del entorno del agente).
- Razonamiento sobre tareas encarnadas: entrenado/evaluado en el contexto de LIBERO, un benchmark de manipulación robótica con tareas de largo horizonte.
- Agentes: etiquetado como agent y embodied-agent, orientado a bucles de percepción-razonamiento-acción.
- Uso conversacional: la model card lo marca como conversational, aunque su especialización es robótica.
- Soporte de tool calling, capacidades matemáticas y multilingües: no disponible (sin información específica; idioma declarado: inglés).

## Casos de uso

- Control de brazos robóticos en simulación: el modelo puede recibir una observación visual del entorno (por ejemplo, del simulador de LIBERO) y generar código que especifique la secuencia de acciones de manipulación, permitiendo prototipar políticas interpretables sin entrenar una política neuronal específica por tarea.
- Investigación en code-as-policy: los equipos de investigación pueden usarlo como baseline o punto de partida para estudiar cómo los LLM multimodales traducen percepción en programas de acción, comparando con enfoques de política end-to-end.
- Agentes encarnados con bucle de razonamiento: integración en arquitecturas de agente donde el modelo actúa como planificador que emite código intermedio, facilitando la depuración de fallos al inspeccionar el programa generado en lugar de tensores opacos.
- Ejecución local en hardware de consumo: gracias a las cuantizaciones Q4_K_M (3,2 GB) o inferiores, el modelo puede correr en portátiles y GPUs domésticas, útil para laboratorios docentes o demos sin acceso a infraestructura cloud.
- Evaluación reproducible en LIBERO: uso del modelo para reproducir o extender experimentos del benchmark LIBERO de manipulación robótica, aprovechando que los datasets de SFT y artefactos están publicados en Hugging Face.
- Educación en robótica e IA: por su tamaño contenido y licencia Apache 2.0, es adecuado como material didáctico en cursos sobre agentes inteligentes, RL y LLM aplicados a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el benchmark LIBERO como tag, pero no incluye puntuaciones concretas de éxito en tareas ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto ni proyector):
  - Q2_K: ~2,2 GB
  - Q4_K_M: ~3,2 GB
  - Q6_K: ~4,1 GB
  - Q8_0: ~5,3 GB
  - f16: ~9,8 GB
  - Añadir ~0,5-0,8 GB si se carga el proyector multimodal (mmproj).
- GPU recomendadas: al ser un modelo de ~4,8B parámetros, cualquier GPU moderna de gama media es suficiente. Una RTX 3060 de 12 GB, RTX 4060 Ti o superiores ejecutan cómodamente hasta Q8_0; no se requieren A100 ni H100.
- Consumer GPUs: sí, cabe en prácticamente cualquier GPU de consumo con 4-6 GB de VRAM en cuantizaciones Q4; también es viable en CPU pura dada la cuantización Q2_K/Q3 (con latencia mayor).
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte mmproj para la parte visual), Ollama, LM Studio y otros runtimes compatibles con GGUF. No está orientado a vLLM o TGI en esta versión cuantizada (esos servirían el modelo base en formato original).
- Latencia y throughput: no disponibles; en GPU de consumo con Q4_K_M se espera generación fluida en tiempo real para un modelo de este tamaño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CaPtain-4B (esta ficha) | 4,84B | Multimodal (visión + texto), robótica | Apache 2.0 | GGUF (mradermacher) | Especializado en code-as-policy y agentes encarnados; datasets públicos |
| OpenVLA | 7B | Visión-lenguaje-acción (VLA) | MIT | HF (safetensors) | Política VLA end-to-end, acciones directas en lugar de código; requiere más VRAM |
| RT-2 (Google) | no disponible | Visión-lenguaje-acción | No pública | no disponible | Modelo cerrado de Google DeepMind; no descargable |

Nota: los modelos VLA comparables (OpenVLA, RT-2) generan acciones directamente, mientras que CaPtain-4B sigue el enfoque code-as-policy; la comparación es de categoría de tarea, no de arquitectura idéntica.

## Limitaciones y advertencias

- Especialización en robótica: el modelo está afinado para tareas de agentes encarnados y code-as-policy; su rendimiento como chatbot de propósito general probablemente sea inferior al de LLM generales de tamaño similar.
- Idioma: declarado únicamente en inglés; no hay soporte garantizado para castellano ni otros idiomas.
- Información técnica incompleta: la model card no documenta longitud de contexto, arquitectura concreta ni resultados de benchmarks, lo que dificulta la evaluación previa a producción.
- Riesgo de alucinación: al generar código que controla hardware físico, un programa incorrecto puede traducirse en acciones peligrosas; se recomienda validación del código generado y ejecución en simulación antes de usar robots reales.
- Cuantización: se trata de cuantizaciones estáticas (no imatrix); las versiones bajas (Q2_K, Q3_K) pueden degradar apreciablemente la calidad, especialmente en la parte de razonamiento sobre tareas complejas.
- Licencia: Apache 2.0, sin restricciones relevantes para uso comercial; verificar no obstante la licencia de los datasets de entrenamiento si se reentrena.
- La cuantización GGUF es un trabajo de terceros (mradermacher), no del autor del modelo base; cualquier problema de conversión debe reportarse al cuantizador.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/mradermacher/CaPtain-4B-GGUF
- Modelo base: https://huggingface.co/YijiaFan/CaPtain-4B
- Dataset de SFT: https://huggingface.co/datasets/YijiaFan/CaPtain-SFT-Data
- Artefactos del proyecto: https://huggingface.co/datasets/YijiaFan/CaPtain-artifacts
- Visor de cuantizaciones de mradermacher: https://hf.tst.eu/model#CaPtain-4B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
