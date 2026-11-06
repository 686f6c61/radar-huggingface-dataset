# airoa-org/yubi-real2sim-policies

## Resumen

Yubi-real2sim-policies es una colección de políticas de visión-lenguaje-acción (VLA) publicada por airoa-org bajo el paraguas del framework openpi. El modelo se basa en pi0.5, la arquitectura VLA desarrollada por Physical Intelligence, y está orientado a la transferencia de políticas entrenadas en simulación hacia entornos reales (real2sim), un problema central en robótica de manipulación donde la brecha entre simulación y realidad degrada el rendimiento de los controladores aprendidos.

La relevancia del modelo reside en su enfoque: en lugar de entrenar directamente sobre datos reales, las políticas se ajustan mediante un pipeline que adapta representaciones visuales y dinámicas de simulación a las condiciones de un robot concreto (Yubi, el hardware de airoa). El repositorio ocupa 37,3 GB, lo que sugiere pesos completos de un modelo VLA de gran tamaño con múltiples variantes de política.

La información pública disponible es limitada: no se detallan parámetros totales, composición del dataset ni resultados de benchmarks. El acceso está restringido (gated) y requiere aceptar las condiciones de la licencia Gemma en Hugging Face, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0.5 (openpi) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (acceso restringido, requiere aceptación) |
| Formato de pesos | no disponible (repo de 37,3 GB, librería openpi) |

## Arquitectura y entrenamiento

El modelo se apoya en pi0.5, la evolución de la familia pi0 de Physical Intelligence para control robótico mediante modelos VLA. Estas arquitecturas combinan un backbone de visión-lenguaje preentrenado con un cabezal de acción que produce comandos motores condicionados por instrucciones en lenguaje natural y observaciones visuales. El pipeline openpi proporciona las utilidades de entrenamiento, normalización de observaciones y despliegue sobre robots reales.

El componente específico de este repositorio es el ajuste real2sim: las políticas se entrenan o adaptan en simulación y luego se transfieren al robot Yubi de airoa. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación con datos teleoperados. La etiqueta arxiv:2610.17521 apunta a un paper asociado, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Control robótico de manipulación guiado por instrucciones en lenguaje natural.
- Percepción visual integrada: procesa observaciones de cámara para generar acciones.
- Transferencia real2sim: políticas adaptadas de simulación a hardware real.
- Múltiples variantes de política empaquetadas en el mismo repositorio (37,3 GB).
- Integración con el ecosistema openpi para entrenamiento y despliegue.
- Soporte de instrucciones en inglés.
- No se documenta soporte de tool calling, agentes multi-paso ni modos de razonamiento extendido.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo genera trayectorias de agarre y colocación a partir de instrucciones y observaciones visuales, adecuado para tareas de pick-and-place en entornos controlados.
- Investigación en transferencia sim-a-real: sirve como base para estudiar cómo adaptar políticas entrenadas en simuladores a hardware físico, comparando variantes incluidas en el repo.
- Prototipado de estaciones robóticas con el robot Yubi: permite desplegar políticas preentrenadas sobre el hardware de airoa sin partir de cero.
- Evaluación comparativa de políticas VLA: al contener múltiples políticas, facilita experimentos A/B sobre el mismo robot y conjunto de tareas.
- Docencia y formación en robótica aprendida: el pipeline openpi y las políticas publicadas permiten reproducir flujos de entrenamiento e inferencia en cursos avanzados.
- Desarrollo de demos de interacción lenguaje-acción: útil para construir demostraciones donde un operador da instrucciones en inglés y el robot ejecuta tareas de manipulación.
- Base para fine-tuning sobre tareas específicas: las políticas pueden ajustarse con datos propios del robot para nuevas tareas de ensamblaje o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo (37,3 GB) sugiere pesos en precisión completa o mixta que probablemente requieren GPUs de centro de datos.
- GPU recomendadas: no disponible de forma explícita; por el tamaño del repositorio, se espera que sea necesario al menos una A100 o H100 para cargar los pesos completos.
- Viabilidad en GPU de consumo: no confirmada; 37,3 GB excede la VRAM de la mayoría de GPUs consumer (RTX 4090 tiene 24 GB), por lo que se requeriría cuantización o carga parcial, no documentada.
- Opciones de despliegue: librería openpi; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLMs de texto, no para políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| airoa-org/yubi-real2sim-policies | no disponible | no disponible | Gemma (gated) | Hugging Face, acceso restringido |
| pi0 / pi0.5 (Physical Intelligence) | no disponible | no disponible | no disponible | Repositorios openpi |
| OpenVLA | ~7B | no disponible | no disponible | Hugging Face, abierto |
| RT-2 (Google DeepMind) | no disponible | no disponible | propietaria | no público |

La comparación cuantitativa con alternativas no es posible con la información disponible; los modelos VLA de referencia comparten la filosofía de condicionar acciones en lenguaje y visión, pero difieren en hardware objetivo y datos de entrenamiento.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia Gemma en Hugging Face, lo que limita la distribución y el uso comercial según los términos de dicha licencia.
- Idiomas: solo se declara inglés; las instrucciones en otros idiomas pueden degradar el rendimiento.
- Especificidad de hardware: las políticas están ajustadas al robot Yubi de airoa; su transferencia a otros robots no está garantizada.
- Falta de documentación pública: no hay datos sobre parámetros, dataset, benchmarks ni latencia, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación en instrucciones ambiguas: como modelo VLA, puede generar acciones incorrectas ante comandos fuera de distribución.
- Sesgos heredados del backbone de visión-lenguaje y de los datos de simulación, potencialmente amplificados por la brecha sim-a-real.
- Sin garantías de seguridad física: su uso en robots reales exige capas de control y parada de emergencia independientes.
- Fecha de creación futura (2026-11-03) en los metadatos, lo que sugiere que el repositorio puede ser preliminar o estar en revisión.

## Enlaces

- Hugging Face: https://huggingface.co/airoa-org/yubi-real2sim-policies
- Paper referenciado (arXiv): arxiv:2610.17521 (no verificado en la información disponible)
- Framework openpi: no disponible en la información proporcionada
- Repositorio de airoa-org: no disponible en la información proporcionada
