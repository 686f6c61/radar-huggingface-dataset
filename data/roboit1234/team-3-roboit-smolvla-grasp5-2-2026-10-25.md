# RoboIT1234/TEAM-3-RoboIT-smolvla-grasp5-2-2026-10-25

## Resumen

TEAM-3-RoboIT-smolvla-grasp5-2-2026-10-25 es una política robótica de tipo vision-language-action (VLA) desarrollada por el equipo RoboIT para el evento Robot Pizza Cup celebrado en Colonia del 23 al 25 de octubre de 2026. Se trata de un fine-tuning del modelo base `lerobot/smolvla_base` sobre el brazo seguidor ElRobot, un manipulador de 8 articulaciones que opera a 10 Hz y que incluye una pinza en la articulación m8. El checkpoint presentado corresponde al paso 3000 de la quinta etapa de entrenamiento (grasp5-2) y resuelve dos habilidades complementarias sobre una pizza: coger una porción de ingrediente del cuenco y colocarla en una región concreta de la pizza.

El modelo combina un backbone de visión-lenguaje SmolVLM2-500M-Video-Instruct (16 capas) con un experto de acción entrenado específicamente, manteniendo el codificador visual congelado. Con 450.046.176 parámetros totales y un repositorio de 1,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de gama profesional. La selección de la habilidad y del destino se realiza mediante prompt de texto en lenguaje natural, lo que permite cubrir múltiples objetivos con un único checkpoint.

Su relevancia radica en que demuestra un flujo completo de entrenamiento por imitación con datos de teleoperación recogidos en el propio evento, divididos en fases de agarre y colocación mediante un preprocesado determinista. La licencia Apache 2.0 y el formato abierto de pesos facilitan su reutilización e inspección, aunque la carga requiere el formato específico `smolvla_py` de norma-core y no el cargador estándar de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: VLM SmolVLM2-500M-Video-Instruct (16 capas, codificador visual congelado) + experto de acción entrenado |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (los prompts de entrenamiento están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato `smolvla_py` de norma-core, no carpeta `PreTrainedPolicy` de LeRobot) |

## Arquitectura y entrenamiento

La política sigue el esquema SmolVLA: un modelo de visión-lenguaje SmolVLM2-500M-Video-Instruct de 16 capas procesa las dos cámaras de entrada (cámara cenital de escena a 224x224 y cámara de muñeca a 224x224) junto con el prompt textual, y un experto de acción genera comandos de articulación. El codificador visual permanece congelado durante todo el entrenamiento y solo se entrena el experto. La observación de estado son 8 posiciones articulares normalizadas en el rango 0..1 (m1..m8, con m8 como pinza), y la salida es un chunk de 50 pasos de 8 objetivos articulares también normalizados. La normalización de estados y acciones se realiza con la media y desviación típica almacenadas en `stats.safetensors`.

El entrenamiento se realizó en cinco etapas encadenadas con `software/ai/smolvla_py/scripts/train.py`, en lotes de 64 con precisión bf16 sobre una única GPU RTX PRO 6000 Blackwell en Nebius DevLab. La primera etapa (joint-final, 20000 pasos) parte de `lerobot/smolvla_base` con episodios completos de queso, pepperoni y pepperoni sobre queso. Las etapas posteriores refinan el agarre y la colocación: joint-grasp2-ft (4000 pasos, LR 3e-5), pepperoni-split-ft (6000 pasos, LR 5e-5), grasp4 (6000 pasos, LR 5e-5) y finalmente grasp5-2 (3000 pasos, LR 3e-5), que incorpora los conjuntos cheese-grasp-new y pepperoni-grasp-new. La etapa final utiliza 764 medio-episodios y 96085 fotogramas. La división entre agarre y colocación se aplica como preprocesado determinista con `scripts/split_grasp_place.py`, cortando cada demostración en el momento del despegue tras cerrar la pinza. Los datos provienen de teleoperación líder/seguidor registrada por el equipo en el evento, en ocho conjuntos de datos propios.

## Capacidades

- Generación de comandos de articulación para un brazo seguidor ElRobot de 8 articulaciones a 10 Hz, con chunk de acción de 50 pasos.
- Percepción visual multimodal mediante dos cámaras: cenital de escena y de muñeca, ambas a 224x224.
- Condicionamiento por prompt de texto en lenguaje natural para seleccionar la habilidad (coger queso, coger pepperoni, colocar queso, colocar pepperoni).
- Selección del destino de colocación mediante el fragmento `<where>` del prompt: cuadrante superior izquierdo, superior derecho, inferior derecho, inferior izquierdo, centro de la pizza o zona vacía más grande.
- Cobertura de dos ingredientes (queso y pepperoni) y de todos los objetivos de la pizza con un único checkpoint.
- Ejecución de secuencias multi-paso mediante el script `run_challenge.py`, que encadena pasos, decide cuándo termina uno (pinza liberada y brazo cerca de la posición inicial) y reintenta pasos de pepperoni si el verificador de cambios no detecta una nueva porción.
- No se documentan capacidades de tool calling, agentes generales, matemáticas, código ni otros idiomas distintos del inglés de los prompts.

## Casos de uso

- Automatización de línea de montaje de pizzas: el modelo puede coger porciones de queso o pepperoni de un cuenco y depositarlas en el cuadrante o zona indicada por el prompt, integrándose en una celda robotizada con cámara cenital y de muñeca.
- Reparto selectivo por regiones: al permitir destinos como "cuadrante superior izquierdo" o "zona vacía más grande", es adecuado para tareas donde la distribución espacial del ingrediente importa, como pizzas de especialidad con cobertura asimétrica.
- Secuenciación de recetas multi-ingrediente: combinado con `run_challenge.py` y prompts compuestos (por ejemplo, cuatro pepperoni en la mitad derecha y luego queso en toda la pizza), permite orquestar recetas completas sobre un único checkpoint.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline de cinco etapas con división determinista agarre/colocación, útil para estudiar el efecto del refinamiento progresivo en políticas VLA pequeñas.
- Prototipado rápido en robótica de manipulación: con 450 millones de parámetros y pesos safetensors, es viable para iterar en laboratorio sobre un brazo de 8 articulaciones sin requerir clústeres de GPU.
- Evaluación comparativa en competiciones de robótica: el checkpoint y los conjuntos de datos asociados permiten reproducir la participación del equipo en la Robot Pizza Cup y comparar estrategias de prompting y secuenciación.
- Demostración educativa de VLA: la combinación de VLM congelado y experto entrenado, junto con la normalización explícita en `stats.safetensors`, lo convierte en un caso didáctico para explicar cómo se condiciona una política por lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en bf16 los pesos ocupan aproximadamente 0,9 GB, a los que hay que sumar activaciones del VLM y del experto. El repositorio completo ocupa 1,2 GB.
- GPU de entrenamiento documentada: una RTX PRO 6000 Blackwell en Nebius DevLab, con lotes de 64 y precisión bf16.
- GPU recomendadas para inferencia: no disponible; por tamaño, cualquier GPU profesional con al menos 8-16 GB de VRAM debería poder alojar los pesos, pero el autor no publica requisitos.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el tamaño de parámetros sugiere que sí en tarjetas con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: el autor especifica el uso de `smolvla_py` desde el commit `29496c09b9dfa5115d1e6c8367d2b8b30a3bd153` de norma-core, con los scripts `scripts/run_challenge.py` y `scripts/train.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato no es una carpeta `PreTrainedPolicy` de LeRobot.
- Latencia y throughput: no disponible; el sistema opera a 10 Hz sobre el brazo, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TEAM-3-RoboIT-smolvla-grasp5-2-2026-10-25 | 450.046.176 | no disponible | VLA para manipulación de pizza (queso y pepperoni) | apache-2.0 | Hugging Face, formato `smolvla_py` |
| lerobot/smolvla_base | no disponible | no disponible | VLA base para fine-tuning robótico | no disponible | Hugging Face (modelo base declarado) |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | no disponible | no disponible | VLM de vídeo e imagen | no disponible | Hugging Face (componente VLM del modelo) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el brazo ElRobot de 8 articulaciones a 10 Hz; no es transferible directamente a otras morfologías sin reentrenamiento.
- El formato de pesos es `smolvla_py` de norma-core en un commit concreto; no se carga con el cargador estándar de LeRobot, lo que limita la portabilidad.
- Los prompts de entrenamiento están en inglés y limitados a un vocabulario cerrado de habilidades y destinos; no se documenta soporte multilingüe ni generalización a instrucciones libres.
- El alcance es muy estrecho: queso y pepperoni sobre una pizza, con seis destinos predefinidos. Cualquier tarea fuera de ese dominio no está cubierta.
- Riesgo de alucinación y de fallo en la secuenciación: el script `run_challenge.py` incluye reintentos para pasos de pepperoni cuando el verificador de cambios no detecta una nueva porción, lo que indica que el modelo puede no completar el paso en el primer intento.
- No se publican métricas de éxito, benchmarks ni evaluaciones cuantitativas, por lo que el rendimiento real en producción es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero los conjuntos de datos y el código de norma-core deben verificarse por separado.
- El modelo se publicó con 14 descargas y 0 likes en el momento de la ficha, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RoboIT1234/TEAM-3-RoboIT-smolvla-grasp5-2-2026-10-25
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Componente VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- norma-core (commit congelado): https://github.com/norma-core/norma-core/commit/29496c09b9dfa5115d1e6c8367d2b8b30a3bd153
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
