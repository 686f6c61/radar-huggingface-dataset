# nvidia/Alpamayo2-Edge

## Resumen

NVIDIA Alpamayo 2 Edge es un modelo vision-language-action (VLA) de 2.651.163.378 parámetros (2B efectivos en el backbone más el experto de acción) desarrollado por NVIDIA dentro de su plataforma abierta Alpamayo para conducción autónoma. Convierte entradas multimodales (seis cámaras, historial de egomoción y una instrucción de navegación en texto) en trayectorias de conducción y explicaciones causales, combinando un backbone VLM derivado de Cosmos 3 Edge con un decodificador de acción basado en difusión.

El modelo resuelve el problema de la planificación en vehículo con recursos limitados: está diseñado para fine-tuning y despliegue eficiente en NVIDIA DRIVE AGX Thor, lo que lo sitúa en la categoría de modelos compactos de razonamiento para sistemas ADAS y conducción autónoma. Su rasgo diferencial es el "adaptive reasoning": genera cadenas de razonamiento (Chain-of-Causation) junto a cada trayectoria, de modo que el planificador es interpretable y auditable.

Es relevante ahora porque se publica bajo licencia OpenMDW-1.1 con código Apache 2.0, lo que permite uso comercial y modificación, y porque ofrece una API de trayectoria concreta (64 waypoints a 0,1 s hasta 6,4 s) junto con respuesta a preguntas libres sobre la escena. La información pública disponible no incluye resultados de benchmarks ni detalles del dataset de entrenamiento más allá de los identificadores de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA: backbone VLM (Nemotron-based, Cosmos 3 Edge) + decodificador de acción basado en difusión |
| Parametros totales | 2.651.163.378 (backbone 2,45B: 1,96B LM + 0,41B SigLIP2 + 0,08B proyector; action expert 0,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | OpenMDW-1.1 (pesos); Apache 2.0 (código) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer VLA compuesto por un backbone VLM y un decodificador de acción de difusión. El backbone integra un modelo de lenguaje de 1,96B parámetros sobre base Nemotron, un codificador visual SigLIP2 de 0,41B y un proyector de 0,08B; el experto de acción añade 0,2B parámetros. Los pesos se distribuyen en BF16 y el repositorio ocupa 10,6 GB. La predicción de trayectoria consume seis cámaras con 22 fotogramas por observación: cinco fotogramas para las cámaras frontales wide y tele (IDs 1 y 6) en −2, −1, −0,5, −0,1 y 0 s, y tres fotogramas para las cámaras cross left, cross right, rear left y rear right (IDs 0, 2, 3 y 5) en −1, −0,1 y 0 s. Además recibe una instrucción de navegación en texto y 20 poses históricas del ego a pasos fijos de 0,1 s entre −1,9 y 0 s, expresadas en el marco del ego en el instante de consulta.

El decodificador de acción predice aceleración y curvatura por paso, que un modelo de bicicleta (unicycle) integra en un espacio de acción course-heading: las posiciones siguen el curso (dirección de avance del eje trasero), la coordenada z se mantiene en la altura del instante de consulta y las rotaciones solo de yaw estiman el rumbo de la carrocería, que difiere de la tangente de la trayectoria por el deslizamiento lateral del eje trasero del vehículo de entrenamiento. Los datos de entrenamiento se referencian como `nvidia/PhysicalAI-Autonomous-Vehicles` y `nvidia/PhysicalAI-Autonomous-Vehicles-NuRec`, pero no se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. El modelo parte de `nvidia/Cosmos3-Edge` mediante fine-tuning.

## Capacidades

- Generación de trayectorias de conducción condicionadas por instrucción de navegación: 64 waypoints de 0,1 a 6,4 s a intervalos de 0,1 s, con posiciones XYZ en marco del ego y matrices de rotación 3x3.
- Razonamiento causal explícito (Chain-of-Causation): el prompt de conducción termina en un bloque `<think></think>` vacío y el modelo escribe su razonamiento justo después.
- Explicaciones independientes por candidato de trayectoria: cada trayectoria muestreada lleva su propio texto de razonamiento.
- Respuesta a preguntas libres sobre la escena de conducción (VQA visual), usando las mismas seis cámaras con cuatro fotogramas por cámara.
- Procesamiento multimodal de entrada: imagen RGB multicámara multi-instante, texto y historial de egomoción (traslación 3D y rotación 9D).
- Codificación de marcas temporales de captura como etiquetas de tiempo relativo en el prompt.
- Capacidad de fine-tuning sobre el checkpoint base para dominios o flotas específicas.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Planificación en vehículo en tiempo real: el modelo genera trayectorias a 6,4 s con un backbone de 2,45B parámetros y un experto de acción de 0,2B, un tamaño compatible con el despliegue en NVIDIA DRIVE AGX Thor según el autor, lo que permite ejecutar el planificador a bordo sin depender de la nube.
- Auditoría y depuración de decisiones de conducción: la salida Chain-of-Causation permite reconstruir por qué el modelo eligió una trayectoria, útil en pipelines de validación y en la revisión de incidentes por parte de ingenieros de seguridad.
- Fine-tuning por flota u OEM: al liberarse pesos con licencia OpenMDW-1.1 y código Apache 2.0, un equipo puede adaptar el modelo a la geometría de su vehículo (el modelo asume el deslizamiento del eje trasero del vehículo de entrenamiento) y a su conjunto de cámaras.
- Asistencia a la conducción con instrucciones de navegación: integrado en un sistema ADAS, traduce una instrucción textual de navegación más el historial de ego en una trayectoria ejecutable, sirviendo como capa de decisión entre el mapa y el control de bajo nivel.
- Evaluación comparativa de planificadores: la API de 64 waypoints y la posibilidad de muestrear múltiples candidatos con razonamiento asociado facilitan experimentos de selección de trayectoria y análisis de consistencia entre explicación y acción.
- Análisis post-sesión de datos de flota: el modo de preguntas libres sobre la escena permite interrogar grabaciones multicámara (por ejemplo, "¿qué obstáculo hay a la derecha?") para etiquetado, minería de casos límite y generación de informes.
- Investigación en VLA para robótica móvil: la combinación de backbone VLM con decodificador de difusión para acciones continuas es reutilizable en dominios con acciones de bajo nivel distintas de la conducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,65B parámetros en BF16 los pesos ocupan aproximadamente 5,3 GB, a los que hay que sumar activaciones del codificador visual y del decodificador de difusión, no cuantificadas en la documentación.
- GPU validada: NVIDIA H100 80GB HBM3 (única arquitectura probada según la model card); otras arquitecturas no han sido validadas.
- Plataforma objetivo declarada: NVIDIA DRIVE AGX Thor para despliegue eficiente en vehículo.
- Compatibilidad con GPU de consumo: no confirmada; el autor solo reporta pruebas en H100.
- Opciones de despliegue: Python 3.12, PyTorch 2.8.0, torchvision 0.23.0 y Hugging Face Transformers 5.17.0; atención con PyTorch SDPA por defecto y FlashAttention 2.8.3 opcional, requerido para inferencia acelerada. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (VLA compactos para conducción autónoma), por lo que la comparación cuantitativa no está disponible. A modo de referencia estructural, el propio modelo se apoya en `nvidia/Cosmos3-Edge` como backbone VLM, del que hereda el modelo de lenguaje de 1,96B y el codificador SigLIP2 de 0,41B; el resto de alternativas del ecosistema Alpamayo no se detalla en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; el entrenamiento se apoya en datasets de conducción (`PhysicalAI-Autonomous-Vehicles` y `NuRec`) cuya composición no se detalla, lo que impide evaluar sesgos geográficos o de condiciones meteorológicas.
- Riesgo de alucinación: el modelo genera texto libre (razonamiento y respuestas VQA) y puede producir explicaciones plausibles pero incorrectas; la propia model card advierte de que la integración en sistemas de IA requiere pruebas adicionales con datos específicos del caso de uso bajo metodología V-model.
- Calibración geométrica dependiente del vehículo: el deslizamiento del eje trasero y la altura del ego están fijados al vehículo de entrenamiento; usarlo en otra plataforma sin fine-tuning introduce error sistemático en la trayectoria.
- Dependencia de marcas temporales: las imágenes requieren timestamps de captura que el prompt codifica como etiquetas de tiempo relativo; entradas sin esta información degradan la inferencia.
- Configuración delicada del chat template: es obligatorio aplicar el template con `enable_thinking=False`, ya que por defecto activa el modo thinking; un uso incorrecto altera el formato de la salida.
- Idioma: solo inglés (`en`), lo que limita instrucciones de navegación y preguntas en otros idiomas.
- Contexto: la longitud de contexto no está publicada; el número de fotogramas por cámara y de poses históricas está fijado por el pipeline de inferencia.
- Licencia: los pesos usan OpenMDW-1.1, que debe revisarse para obligaciones concretas de atribución y redistribución en uso comercial; el código es Apache 2.0.
- Validación de hardware limitada: solo se ha probado en H100; el rendimiento en otras GPU no está garantizado.
- Advertencia de seguridad: es un componente de planificación, no un sistema de conducción autónoma completo; su salida debe pasar por capas de verificación y control independientes antes de actuar sobre el vehículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Alpamayo2-Edge
- Código fuente: https://github.com/NVlabs/alpamayo2-edge
- Plataforma Alpamayo de NVIDIA: https://www.nvidia.com/en-us/solutions/autonomous-vehicles/alpamayo/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset PhysicalAI-Autonomous-Vehicles: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles
- Dataset PhysicalAI-Autonomous-Vehicles-NuRec: https://huggingface.co/datasets/nvidia/PhysicalAI-Autonomous-Vehicles-NuRec
- Modelo base Cosmos 3 Edge: https://huggingface.co/nvidia/Cosmos3-Edge
