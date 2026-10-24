# myendless/action-repre-core8-history-lvta-v4-j14-h32-head30k-288b1919

## Resumen

`action-repre-core8-history-lvta-v4-j14-h32-head30k-288b1919` es un checkpoint de investigación publicado por el usuario `myendless` en HuggingFace, orientado a la representación de acciones para robótica (tags `robotics`, `action-representation`, `qwenpi-v4`). No es un modelo conversacional ni un export estándar de Transformers: la model card indica explícitamente que se conserva como checkpoint completo de entrenamiento en PyTorch, byte a byte, y que debe cargarse con el cargador propio del benchmark del autor.

El identificador y la model card describen la configuración concreta del run: variante estricta v4 con 14 articulaciones conjuntas (`joint14`), ventana de historial de 32 pasos (`H32`) y 30.000 pasos reales de entrenamiento (`head30k`). El run de origen se nombra como `core8_lvta_qwenpi_v4_joint14_h32_schedfix_100k_20261013_r2`, con categoría de procedencia `unregistered_historical` y `source checkpoint: None`, lo que indica que no se declara un checkpoint padre del que derive.

Su relevancia es acotada y muy específica: sirve como artefacto reproducible para evaluar políticas de acción en un benchmark propietario, con datos, normalización, processor y configuración de entrenamiento referenciados por SHA256 en un repositorio de datos aparte. El repositorio pesa 12,9 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la documentación está únicamente en chino. Es material de laboratorio, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `qwenpi-v4` sugiere una base de tipo Qwen con cabeza de acciones (estilo pi), pero el autor no documenta la arquitectura. Checkpoint de representación de acciones, no export `AutoModel` |
| Parámetros totales | No disponible. El repositorio ocupa 12,9 GB, pero al tratarse de un checkpoint de entrenamiento completo puede incluir estados de optimizador, por lo que el tamaño no permite deducir el número de parámetros con fiabilidad |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible. El sufijo `H32` del identificador apunta a una ventana de historial de 32 pasos, sin confirmación documental |
| Tipos de cuantización | No disponible. No se publican versiones cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible. No se declara ningún idioma; por la naturaleza del modelo (representación de acciones) la cobertura lingüística no es un parámetro documentado |
| Licencia | No disponible. La model card no incluye licencia ni términos de uso |
| Formato de pesos | Checkpoint PyTorch nativo de entrenamiento, preservado en sus bytes originales. No es safetensors ni GGUF, y no es un export estándar de Transformers |
| Pipeline declarado | `robotics` |
| Configuración del run | v4 estricta, `joint14` (14 joints), `H32` (historial de 32), 30.000 pasos reales |
| Run de origen | `core8_lvta_qwenpi_v4_joint14_h32_schedfix_100k_20261013_r2` |
| Checkpoint fuente | `None` (no se declara checkpoint padre) |
| Categoría de procedencia | `unregistered_historical` |
| Datos y normalización | Referenciados por SHA256 al repositorio `myendless/action-repre-robotwin-v4-data`; `release.json` contiene el mapeo exacto |
| Fecha de creación | 2026-10-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Lo que sí se afirma es que se trata de un checkpoint de representación de acciones para robótica, con una configuración «v4 joint14/H32» y 30.000 pasos de entrenamiento efectivos, y que el artefacto se conserva como checkpoint de entrenamiento en PyTorch, no como export estándar. La etiqueta `qwenpi-v4` apunta a una familia de runs del mismo autor sobre una base tipo Qwen con cabeza de predicción de acciones, y `lvta` sugiere representación latente de vídeo-acción; ninguna de estas lecturas está confirmada en la model card.

Sobre los datos de entrenamiento, el autor no publica composición ni número de tokens. La model card remite a un repositorio de datos separado (`myendless/action-repre-robotwin-v4-data`) donde se alojan datos, normalización, processor y configuración original de entrenamiento, referenciados por SHA256, con el mapeo exacto en `release.json`. No se documenta si hubo RLHF, DPO ni ninguna otra fase de alineamiento, algo esperable en un modelo de acción y no de lenguaje. La model card advierte además que la admisión de fuentes de historial ARX de trayectorias de imagen, la protección de tokenizador externo/embeddings para acciones discretas y las diferencias de entrada respecto a la fuente antigua de 20k están divulgadas en el catálogo, y que esos resultados no deben interpretarse como un ranking univariante de una misma fuente.

## Capacidades

- Predicción y representación de acciones para control robótico, con una cabeza configurada para 14 articulaciones (`joint14`).
- Procesamiento de historial temporal de 32 pasos (`H32`), según la nomenclatura del run.
- Integración en un pipeline de benchmark propietario mediante un cargador específico del autor, no mediante `AutoModel` de Transformers.
- Reproducibilidad de experimentos: datos, normalización, processor y configuración de entrenamiento quedan fijados por SHA256 y `release.json`.
- Uso como base para fine-tuning dentro de la misma familia de runs (`core8`, `lvta`, `qwenpi-v4`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes, multilingüismo ni modos de pensamiento.

## Casos de uso

- Evaluación de políticas de acción en benchmark: cargar el checkpoint con el cargador del autor y reproducir las métricas del run `core8_lvta_qwenpi_v4_joint14_h32_schedfix_100k_20261013_r2` para verificar los resultados publicados.
- Investigación en representación de acciones: analizar cómo se estructuran los embeddings de acción con 14 joints y una ventana de historial de 32 pasos, comparando con las variantes de 20k del mismo catálogo.
- Punto de partida para fine-tuning: reutilizar el checkpoint como inicialización en un nuevo run de la familia v4, manteniendo la normalización y el processor del repositorio de datos enlazado.
- Control de manipuladores de 14 grados de libertad en laboratorio: usar la política entrenada para generar comandos articulares en entornos simulados del benchmark RobotWin referenciado en el repositorio de datos.
- Auditoría de reproducibilidad: reconstruir exactamente el entorno de entrenamiento a partir del mapeo SHA256 de `release.json`, útil en publicaciones que exijan artefactos verificables.
- Estudio de tokenización discreta de acciones: la model card menciona tokenizador externo y protección de embeddings para acciones discretas, lo que permite analizar ese componente de forma aislada sobre este checkpoint.
- Docencia e investigación interna: servir como ejemplo de checkpoint de investigación sin licencia declarada, útil para discutir buenas prácticas de publicación de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de éxito de tarea, tasas de error por joint ni comparaciones numéricas; únicamente advierte que los resultados de este checkpoint no deben compararse como un ranking univariante frente a otros runs del catálogo, porque difieren la fuente de admisión del historial, la protección del tokenizador externo y las entradas respecto a la fuente de 20k.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio ocupa 12,9 GB; si ese tamaño corresponde a pesos en bf16/fp16, el mínimo práctico estaría en torno a 14-18 GB de VRAM contando activaciones, pero si el checkpoint incluye estado de optimizador la huella real de pesos sería menor y esta estimación no se sostiene.
- GPU recomendadas: no documentadas por el autor. Por tamaño de artefacto, tarjetas de 24 GB (RTX 3090, RTX 4090) quedarían en el límite; A100 40/80 GB y H100 son opciones seguras para lotes mayores o para cargar el checkpoint completo con estados de entrenamiento.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 de 24 GB si solo se cargan pesos en bf16, sin confirmación; en tarjetas de 8-16 GB no hay garantía y no existen versiones cuantizadas publicadas.
- Opciones de despliegue: no aplican vLLM, TGI, llama.cpp ni Ollama, porque el autor indica que no es un export estándar de Transformers y requiere su propio cargador de benchmark. El despliegue pasaría por PyTorch y el cargador indicado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`action-repre-core8-history-lvta-v4-j14-h32-head30k`) | No disponible | Representación de acciones para robótica, 14 joints, historial de 32 | No disponible | Pesos en HF, 0 descargas, cargador propio | Sin benchmarks publicados ni documentación en inglés o castellano |
| OpenVLA | 7B | VLA sobre Llama-2-7B con codificadores visuales | Permisiva (verificar en el repositorio) | Pesos abiertos en HF | Requiere fine-tuning por tarea; ecosistema y documentación amplios |
| π0 (openpi) | En torno a 3B | VLA con flow matching para control continuo | Apache-2.0 (repositorio openpi) | Pesos y código abiertos | Soporta varias plataformas robóticas; evaluación pública |
| RDT-1B | 1,2B | Diffusion transformer para manipulación bimanual | MIT (verificar) | Pesos abiertos en HF | Enfocado a brazos duales; documentación en inglés |
| GR00T N1 | En torno a 2B | Modelo fundacional de robot humanoides | NVIDIA Open Model License | Pesos abiertos | Ecosistema ISAAC; requisitos de licencia específicos |

Los datos de los modelos comparados provienen de sus repositorios públicos y no de la información proporcionada en esta ficha; conviene verificarlos antes de citarlos. Para este checkpoint no existen cifras de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos, el uso comercial no está autorizado de forma clara y supone un riesgo legal directo en producción.
- Documentación únicamente en chino y muy breve; no hay guía de uso en inglés ni en castellano.
- No es un export estándar de Transformers: no se puede cargar con `AutoModel`, `pipeline` ni servidores de inferencia convencionales; depende del cargador del benchmark del autor, cuya disponibilidad y mantenimiento no se documentan.
- Sin benchmarks publicados: no hay evidencia numérica de rendimiento ni de tasa de éxito en tareas.
- Sin checkpoint fuente (`None`) y con categoría `unregistered_historical`: la trazabilidad del entrenamiento es parcial y descansa en el mapeo SHA256 del repositorio de datos.
- Advertencia explícita del autor sobre comparaciones: los resultados de este run no son un ranking univariante frente a otras variantes del catálogo por diferencias en la fuente del historial y en las entradas.
- Riesgo de brecha simulación-realidad: no se documenta el entorno de entrenamiento ni si hubo mezcla de datos reales; el repositorio de datos se refiere a RobotWin, lo que sugiere predominio de simulación.
- Sin versiones cuantizadas ni formato GGUF: difícil de integrar en stacks ligeros o en hardware de borde.
- Modelo sin capacidades lingüísticas documentadas: no debe emplearse para generación de texto, razonamiento ni atención al cliente.
- Sesgos: no evaluados ni documentados; en robótica, los sesgos se manifiestan como sesgo de distribución de estados y de morfología del robot, no como sesgo lingüístico.
- Artefacto con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myendless/action-repre-core8-history-lvta-v4-j14-h32-head30k-288b1919
- Repositorio de datos y configuración asociado: https://huggingface.co/datasets/myendless/action-repre-robotwin-v4-data
- Run de origen (referencia textual, sin URL pública): `core8_lvta_qwenpi_v4_joint14_h32_schedfix_100k_20261013_r2`
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
