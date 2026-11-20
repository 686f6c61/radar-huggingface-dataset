# paultang0516/gigpo-count3-workspace-seed2

## Resumen

`paultang0516/gigpo-count3-workspace-seed2` es un checkpoint de investigación publicado en Hugging Face, no un modelo listo para producción. Se trata de un ajuste por aprendizaje por refuerzo (reinforcement learning) aplicado sobre `Qwen/Qwen2.5-3B-Instruct`, un transformer denso de 3.000 millones de parámetros desarrollado por Alibaba Qwen. El autor del repositorio, `paultang0516`, lo presenta como parte de un experimento denominado `C3H_GIGPO_s2`, correspondiente a la semilla 2 de un entrenamiento con el algoritmo GiGPO (Group-in-Group Policy Optimization) sobre la tarea sintética `count3` y el arnés de evaluación del proyecto `latent-tba`.

El interés del artefacto es metodológico: documenta un pipeline de RL con anclajes de workspace exactos antes de la acción, recompensas binarias terminales, un descuento por turno de 0,95 y un peso de paso de 1. Cada directorio de paso contiene el estado FSDP de modelo y optimizador en dos rangos, junto con el estado necesario para reanudar el entrenamiento. Por tanto, su valor principal es la reproducibilidad del experimento, no el rendimiento en tareas generales.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, los idiomas soportados ni resultados de benchmarks. El repositorio registra cero descargas y cero likes en el momento de la consulta, y la licencia declarada es `qwen-research` (etiquetada como `other` en Hugging Face), lo que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-3B-Instruct); ajuste posterior mediante RL con GiGPO |
| Parámetros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `qwen-research` (etiqueta `other` en Hugging Face), con ficheros LICENSE y NOTICE |
| Formato de pesos | Estado FSDP de modelo y optimizador (dos rangos) por directorio de paso; no se indica conversión a safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only denso de 3.000 millones de parámetros. Sobre esa base se aplica un ajuste por refuerzo con GiGPO (Group-in-Group Policy Optimization), un algoritmo de optimización de política que agrupa trayectorias para estimar ventajas. La configuración declarada incluye anclajes de workspace exactos antes de cada acción, recompensas binarias terminales (sin recompensa intermedia), un factor de descuento de 0,95 por turno y un peso de paso de 1.

El entrenamiento se realizó sobre la tarea `count3` con el arnés del repositorio `latent-tba`. Los artefactos publicados son checkpoints de entrenamiento: cada directorio de paso contiene el estado FSDP de modelo y optimizador distribuido en dos rangos, más el estado necesario para reanudar el entrenamiento. No se especifican el número de tokens vistos, la composición del dataset, ni si hubo fases adicionales de SFT, DPO o RLHF más allá del propio GiGPO.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-3B-Instruct.
- Seguimiento de instrucciones y formato de chat propios de la familia Qwen2.5-Instruct.
- Ejecución de la tarea sintética `count3` bajo el arnés `latent-tba`, que es el objetivo específico del ajuste.
- Capacidad de reanudar entrenamiento desde cualquier directorio de paso gracias al estado FSDP y de optimizador incluido.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada para este checkpoint (las capacidades del base no se han verificado tras el ajuste RL).

## Casos de uso

- Reproducción de experimentos de RL: el checkpoint permite reanudar el entrenamiento GiGPO desde la semilla 2 con el estado FSDP y de optimizador intacto, lo que facilita comparar configuraciones de recompensa y descuento.
- Investigación sobre GiGPO: sirve como referencia para estudiar cómo afectan los anclajes de workspace pre-acción y las recompensas binarias terminales a la política aprendida en tareas de conteo.
- Evaluación de arneses de agentes: al estar ligado al harness `latent-tba`, permite validar la infraestructura de evaluación de tareas multi-paso con recompensas terminales.
- Estudio de estabilidad de semillas: al tratarse de la semilla 2 de una serie, permite analizar la varianza entre ejecuciones del mismo algoritmo y tarea.
- Docencia y formación: útil como ejemplo práctico de pipeline RL con FSDP, recompensas dispersas y descuento por turno en un modelo de 3B parámetros.
- Base para ajustes posteriores: puede servir como punto de partida para experimentos de RL sobre tareas sintéticas similares, siempre que se respete la licencia `qwen-research`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 3B parámetros, una estimación orientativa en FP16 ronda los 6-7 GB de pesos, y en cuantización de 8 bits alrededor de 3-4 GB, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento con FSDP en dos rangos se requiere un entorno multi-GPU; para inferencia, cualquier GPU con memoria suficiente para el tamaño indicado.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más en cuantización, aunque no confirmado para este checkpoint concreto.
- Opciones de despliegue: no documentadas. Al publicarse como estado FSDP, no es directamente cargable con llama.cpp, Ollama o vLLM sin conversión previa a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gigpo-count3-workspace-seed2 (este) | 3B | No disponible | Checkpoint RL sobre Qwen2.5-3B-Instruct | qwen-research | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 tokens (según documentación del base) | Modelo instructivo denso | qwen-research | Hugging Face, ampliamente descargado |
| Otros checkpoints GiGPO sobre count3 | No disponible | No disponible | Checkpoint RL | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de investigación con estado de entrenamiento, no un artefacto de inferencia empaquetado.
- Formato FSDP: requiere conversión a safetensors u otro formato antes de usarse con runtimes de inferencia habituales.
- Licencia `qwen-research`: restringe el uso comercial; es necesario revisar LICENSE y NOTICE del repositorio.
- Idiomas soportados no declarados: no se puede garantizar el comportamiento multilingüe tras el ajuste RL.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; el ajuste sobre una tarea sintética no aporta garantías sobre comportamiento general.
- Especialización estrecha: el entrenamiento se centra en `count3` con recompensas binarias terminales, por lo que el rendimiento fuera de esa tarea no está caracterizado.
- Sin benchmarks publicados ni métricas de calidad: no hay evidencia cuantitativa de mejora frente al modelo base.
- Cero descargas y cero likes: no existe validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/paultang0516/gigpo-count3-workspace-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del arnés `latent-tba`: https://github.com/WentseChen/latent-tba
- Licencia Qwen Research (referenciada en el repositorio como LICENSE): no disponible como URL directa en la información proporcionada
