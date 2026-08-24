# DecentVLA/groot_cubestack_cent_3client

## Resumen

El modelo `DecentVLA/groot_cubestack_cent_3client` es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el equipo DecentVLA. Se basa en el modelo fundacional `nvidia/GR00T-N1.7-3B` de NVIDIA Isaac GR00T y está especializado en la tarea de apilado de cubos de colores (cube stacking). El modelo se enmarca en un estudio comparativo de aprendizaje federativo para robótica, donde se compara un entrenamiento centralizado (todos los datos juntos) con una versión federada en tres clientes.

La arquitectura sigue la receta estándar de NVIDIA para nuevos embodiment: el backbone Cosmos-Reason2 permanece congelado y solo se entrena el action head de tipo DiT, con aproximadamente 1,62 mil millones de parámetros, junto con el proyector de embodiment. El checkpoint publicado contiene únicamente los pesos del action head (537 tensores, 1,6205 B), por lo que para la inferencia se necesita el modelo base completo de GR00T N1.7-3B. El modelo se ha entrenado con la librería `decent-vla` en hardware GH200 (Isambard-AI) y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7-3B (Cosmos-Reason2 backbone + DiT action head) |
| Parámetros totales | 3,6 B (modelo base) + 1,6205 B (action head entrenado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (instrucciones del dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7, un modelo de visión-lenguaje-acción (VLA) de NVIDIA que procesa multimodalmente imágenes de cámaras, estado propioceptivo del robot y instrucciones en lenguaje natural para generar secuencias de acciones continuas. En esta variante, el backbone Cosmos-Reason2 está congelado (no se ajustan los parámetros de lenguaje ni de visión) y solo se entrenan el action head de tipo DiT (aproximadamente 1,62 B de parámetros) y el proyector de embodiment (SO-101). El modelo se entrena con la tarea de apilado de cubos de tres colores (verde, naranja, azul) con un brazo de 6 grados de libertad más pinza.

El entrenamiento se realizó con el framework `decent-vla`, sobre hardware GH200 (Isambard-AI), con un esquema centralizado que agrupa todos los datos de los tres clientes (37500 pasos = 3 clientes × 50 rondas × 250 pasos locales). Los datos provienen de datasets de LeRobot v3.0 convertidos a v2.1, con los vídeos preescalados a una resolución de borde corto de 256 píxeles (el procesador interno de GR00T reduce a esa resolución). La partición de datos es no-IID por pares de colores (cada cliente solo ve dos de los tres colores). No se menciona el uso de RLHF, DPO ni técnicas de aprendizaje por refuerzo específicas.

## Capacidades

- Generación de secuencias de acción para un brazo robótico de 6 grados de libertad más pinza (6-DoF + gripper).
- Percepción multimodal: procesa dos cámaras (frontal y muñeca) junto con el estado propio del robot y la instrucción en lenguaje natural.
- Ejecución de tareas de apilado de cubos de colores específicos (verde, naranja, azul) según la instrucción textual.
- Horizonte de acción de 16 pasos (genera 16 acciones por predicción).
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito de la manipulación robótica.
- Capacidades multilingües no disponibles; las instrucciones del dataset están en inglés.

## Casos de uso

- Automatización de almacenes: el modelo puede controlar un brazo robótico para apilar cubos o cajas de colores en entornos logísticos, reduciendo la intervención humana en tareas repetitivas de manipulación.
- Investigación en aprendizaje federado para robótica: sirve como baseline centralizado para comparar con versiones federadas del mismo modelo (por ejemplo, los modelos `pi05_cubestack_cent_3client` y `smolvla_cubestack_cent_3client`), evaluando la degradación de rendimiento frente a la privacidad de datos.
- Prototipado de VLA en entornos simulados: se puede desplegar en simuladores como NVIDIA Isaac Sim para validar políticas de control antes de pasar al hardware real, gracias a la compatibilidad con el ecosistema Isaac-GR00T.
- Desarrollo de sistemas de control para brazos robóticos de 6-DoF: el modelo proporciona una política de acción de bajo nivel para tareas de manipulación fina (gripper + posicionamiento), útil como módulo en pipelines de control más complejos.
- Evaluación de estrategias de entrenamiento con backbone congelado: permite estudiar el impacto de entrenar solo el action head frente a ajustar el modelo completo, una práctica común en VLA para reducir costes computacionales.
- Benchmark de modelos de robótica de código abierto: se puede utilizar como referencia en repositorios de evaluación comparativa de VLA, dado su tamaño contenido (1,62 B de parámetros entrenables) y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para inferencia con el modelo completo (3,6 B de parámetros en fp16), se recomiendan al menos 8 GB de VRAM; el checkpoint de action head (1,62 B) ocupa aproximadamente 3,2 GB en fp16.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3080/3090/4090, A100, H100, GH200 (utilizada en el entrenamiento).
- Capacidad en GPU de consumo: sí, cabe en tarjetas consumer de 8 GB o más, aunque la inferencia con el modelo completo (backbone + action head) puede requerir optimizaciones de cuantización (no proporcionadas).
- Opciones de despliegue: se puede integrar en el ecosistema Isaac-GR00T para inferencia en simulación o en hardware real; no se mencionan compatibilidades con vLLM, Ollama o llama.cpp.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Action head | Parámetros entrenados | Tarea | Licencia |
|---|---|---|---|---|---|
| `DecentVLA/groot_cubestack_cent_3client` | GR00T N1.7-3B | DiT | 1,62 B | Apilado de cubos (centralizado) | Apache-2.0 |
| `DecentVLA/pi05_cubestack_cent_3client` | pi0.5 | no disponible | no disponible | Apilado de cubos (centralizado) | Apache-2.0 |
| `DecentVLA/smolvla_cubestack_cent_3client` | SmolVLA | no disponible | no disponible | Apilado de cubos (centralizado) | Apache-2.0 |

Los tres modelos pertenecen al mismo estudio comparativo de aprendizaje federativo y comparten la misma partición de datos no-IID y el mismo protocolo de entrenamiento (3 clientes, 50 rondas, 250 pasos locales). No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para apilado de cubos de tres colores (verde, naranja, azul) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Dependencia del modelo base: el checkpoint solo contiene el action head; para inferencia es necesario cargar el modelo completo `nvidia/GR00T-N1.7-3B`, que no se incluye en este repositorio.
- Riesgo de alucinación de acciones: al ser un modelo entrenado solo en esta tarea, puede generar secuencias de acción sin sentido si la entrada no se ajusta al dominio (por ejemplo, instrucciones en otros idiomas o colores no vistos).
- Instrucciones en inglés únicamente: el dataset de entrenamiento contiene instrucciones verbales en inglés, por lo que el modelo no procesa correctamente otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base `nvidia/GR00T-N1.7-3B` puede tener términos adicionales; se recomienda revisar la licencia del modelo base.
- No se han evaluado sesgos ni alucinaciones específicas en este modelo; se recomienda validar el comportamiento en el dominio de aplicación antes de desplegar en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DecentVLA/groot_cubestack_cent_3client
- Código de entrenamiento `decent-vla`: https://github.com/kevinDuan1/decent-vla
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Página de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- Documentación técnica (DeepWiki): https://deepwiki.com/NVIDIA/Isaac-GR00T
- Modelo comparable pi0.5: https://huggingface.co/DecentVLA/pi05_cubestack_cent_3client
- Modelo comparable SmolVLA: https://huggingface.co/DecentVLA/smolvla_cubestack_cent_3client
