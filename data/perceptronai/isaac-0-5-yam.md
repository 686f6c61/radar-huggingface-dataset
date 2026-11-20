# PerceptronAI/Isaac-0.5-YAM

## Resumen

Isaac 0.5 YAM es un checkpoint de política robótica (vision-language-action, VLA) publicado por PerceptronAI. Se trata de un ajuste fino del modelo base Isaac 0.5 sobre demostraciones de manipulación bimanual del robot YAM, empleando datos procedentes de los conjuntos xDoF ABC-130k y MolmoAct2 Bimanual YAM. El modelo consume tres vistas RGB (cámara cenital y sendas cámaras de muñeca izquierda y derecha), una instrucción en lenguaje natural y el estado articular de ambos brazos, y produce objetivos absolutos de articulación y pinza para las dos extremidades.

El checkpoint se guardó en el paso 200.000 de un ajuste fino distribuido en 32 GPUs, con un batch global de 256 secuencias y una longitud de secuencia de 2.048 tokens. La política devuelve un chunk de acciones de 60 × 14 por observación, lo que la sitúa en la categoría de políticas de imitación con horizonte de acción fijo, integradas en el ecosistema LeRobot.

Su relevancia es acotada pero específica: es un ejemplo de VLA bimanual listo para inferencia y reajuste dentro del stack de PerceptronAI, con licencia no declarada y un tamaño de repositorio muy elevado (142,9 GB), lo que condiciona su despliegue práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA ajustada sobre Isaac 0.5; detalles del backbone no especificados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens de secuencia durante el ajuste fino |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot; incluye directorio `recorded_policy`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint base Isaac 0.5 sobre demostraciones bimanuales del robot YAM. La entrada combina tres imágenes RGB (vista superior y dos vistas de muñeca), una instrucción textual y el vector de estado de ambos brazos; la salida es un chunk de 60 pasos con 14 dimensiones por paso, correspondientes a objetivos absolutos de articulación y pinza de los dos brazos. La integración se realiza a través de `PerceptronIsaacPolicy` en LeRobot, con preprocesado y postprocesado proporcionados por la propia librería.

El entrenamiento se ejecutó en 32 GPUs con batch global de 256 secuencias y longitud de secuencia de 2.048 tokens, guardándose el checkpoint en el paso 200.000. Los datos provienen de xDoF ABC-130k y del dataset Bimanual YAM de MolmoAct2. No se especifican en la información disponible la arquitectura interna del backbone, el número de parámetros, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. El script de ajuste fino documentado emplea paralelismo de datos con sharding FSDP, offload de CPU y precisión mixta bf16.

## Capacidades

- Generación de acciones motoras bimanuales: predice chunks de 60 × 14 valores de articulación y pinza para ambos brazos.
- Percepción visual multi-vista: procesa simultáneamente cámara cenital y cámaras de muñeca izquierda y derecha.
- Seguimiento de instrucciones en lenguaje natural en inglés.
- Condicionamiento en el estado articular completo de ambos brazos.
- Política de imitación entrenada para manipulación bimanual (no es un modelo de chat ni de generación de texto general).
- Reajuste disponible sobre datasets compatibles con LeRobot mediante el script `finetune.py`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo recibe las tres vistas y el estado de ambos brazos y emite objetivos articulares absolutos, adecuado para tareas de ensamblaje o apilado con el robot YAM.
- Investigación en políticas VLA: sirve como punto de partida para comparar estrategias de imitación bimanual frente a otros checkpoints del ecosistema LeRobot.
- Reajuste con datos propios: el script documentado permite adaptar la política a un dataset LeRobot propio con dos GPUs y offload de CPU, útil para prototipado académico.
- Evaluación de percepción multi-cámara: al integrar vista cenital y dos vistas de muñeca, permite estudiar la contribución de cada cámara en el rendimiento de la política.
- Reproducción de experimentos: el checkpoint en el paso 200.000 y la configuración de entrenamiento publicada permiten replicar condiciones de ajuste fino.
- Docencia y demostraciones: el ejemplo de inferencia incluido, con observación de muestra en `assets/sample_observation.json`, facilita montar demos reproducibles sin capturar datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (142,9 GB) incluye pesos, assets y posiblemente estados de optimizador, por lo que no equivale directamente al peso del modelo en memoria.
- GPUs recomendadas: no especificadas por el autor. El ajuste fino documentado se ejecutó en 32 GPUs y el ejemplo de reajuste con 2 GPUs y offload de CPU.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: LeRobot con `PerceptronIsaacPolicy`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salidas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Isaac 0.5 YAM | VLA bimanual (LeRobot) | 3 RGB + lenguaje + estado | chunk 60 × 14 | 2.048 tokens (entrenamiento) | no disponible | Hugging Face |
| Isaac 0.5 (base) | VLA base | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Políticas LeRobot genéricas (p. ej. ACT, Diffusion Policy) | Políticas de imitación | RGB + estado | acciones | variable | variable según implementación | LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Entrenado únicamente sobre el robot YAM bimanual; la transferencia a otras morfologías no está validada.
- Instrucciones solo en inglés.
- Sin benchmarks publicados, por lo que no hay evidencia cuantitativa de rendimiento fuera de las condiciones de entrenamiento.
- Repositorio de 142,9 GB: el almacenamiento y la descarga pueden ser un cuello de botella.
- Riesgo de sobreajuste a las distribuciones de xDoF ABC-130k y MolmoAct2 Bimanual YAM; el comportamiento fuera de esas condiciones no está documentado.
- No se documentan sesgos, tasas de alucinación ni robustez ante cambios de iluminación o calibración de cámaras.
- Política de imitación: no incorpora mecanismos de seguridad ni de parada ante fallos; requiere supervisión en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PerceptronAI/Isaac-0.5-YAM
- Modelo base Isaac 0.5: https://huggingface.co/PerceptronAI/Isaac-0.5
- Dataset xDoF ABC-130k: https://huggingface.co/datasets/XDOF/ABC-130k
- Dataset MolmoAct2 Bimanual YAM: https://huggingface.co/datasets/allenai/MolmoAct2-BimanualYAM-Dataset
- Código en GitHub: https://github.com/perceptron-ai-inc/isaac
- Blog de presentación: https://www.perceptron.inc/blog/introducing-isaac-0-5
