# Nirvana-AI/umi-toss-cosmos3-nano-ctrl-v2

## Resumen

umi-toss-cosmos3-nano-ctrl-v2 es un checkpoint de política robótica desarrollado por Nirvana-AI, obtenido mediante ajuste fino supervisado completo (full SFT) del modelo base Cosmos 3 Nano sobre un conjunto de datos de lanzamiento (tossing) capturado con UMI (Universal Manipulation Interface). Se trata de la ejecución de control de una ablación: comparte receta, datos, semilla (42), orden de muestras, tamaño de lote (2.024) e iteraciones (2.000) con el checkpoint original, y la única variable que lo diferencia del run con aumento de imagen es precisamente la ausencia de dicha aumentación.

El modelo se publica como pesos bf16 (Power-EMA de la iteración 2.000) en un repositorio de 30,3 GB, con la librería `cosmos` y pipeline declarado `robotics`. No se ha ejecutado en un robot real: toda la validación es offline sobre un subconjunto de validación y los resultados en bucle cerrado quedan pendientes según la model card.

Su relevancia es metodológica más que de producto: sirve como referencia de control para medir el efecto de la aumentación de imagen en el entrenamiento de políticas de manipulación con Cosmos 3 Nano, y como punto de partida reproducible para quien quiera replicar el pipeline UMI + Isaac Lab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos 3 Nano (modelo base de la familia Cosmos; detalles internos no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a texto) |
| Licencia | OpenMDW 1.1 (`openmdw1.1-license`, enlace en la model card) |
| Formato de pesos | bf16 (Power-EMA de la iteración 2.000); repo de 30,3 GB |
| Tarea / pipeline | robotics (predicción de trayectorias de lanzamiento) |
| Entrenamiento | full SFT, semilla 42, batch 2.024, 2.000 iteraciones, 4 × A100, FSDP-4 |
| Fechas de entrenamiento | 2026-11-02 a 2026-11-04 |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base Cosmos 3 Nano, ajustado con supervisión completa sobre el dataset de lanzamiento UMI. La model card no describe la arquitectura interna del backbone (número de capas, dimensionalidad, mecanismo de atención ni si incorpora componentes de difusión o flow matching para la generación de acciones), por lo que esos detalles deben consultarse en la ficha del modelo base. Lo que sí se especifica es el procedimiento: entrenamiento distribuido con FSDP en 4 GPUs A100, batch global de 2.024, 2.000 iteraciones y semilla fija 42, replicando exactamente la receta del run original.

La innovación relevante aquí no es arquitectónica sino experimental: este checkpoint es el brazo de control de una ablación sobre aumentación de imagen en tiempo de entrenamiento. Frente a `umi-toss-cosmos3-nano-aug-v1`, que introduce aumentación, este `ctrl_v2` entrena sin ella, manteniendo constantes datos, código, orden de muestras e hiperparámetros. Se publican los pesos Power-EMA de la iteración seleccionada (2.000) en bf16. No se documentan en la información disponible el número de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Predicción de trayectorias de manipulación robótica para la tarea de lanzamiento (tossing) a partir de observaciones, en el marco del pipeline UMI.
- Generación de comandos de control compatibles con el entorno de simulación Isaac Lab empleado en el benchmark del autor.
- Evaluación offline sobre subconjunto de validación con métricas de error de desplazamiento (ADE) y de temporización de liberación.
- Servir como referencia de control reproducible para estudios de ablación sobre aumentación de datos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking en la información disponible.
- No se ha validado en hardware físico; las capacidades declaradas se limitan al dominio simulado y a la evaluación offline.

## Casos de uso

- Referencia de control en ablaciones: usar este checkpoint como línea base sin aumentación para cuantificar, junto con `aug-v1`, el efecto real de la aumentación de imagen sobre ADE y temporización de liberación en el mismo dataset y receta.
- Replicación de experimentos: al estar fijados semilla, orden de muestras, batch e iteraciones, permite reproducir el entrenamiento en 4 × A100 con FSDP y comparar desviaciones atribuibles al entorno de ejecución.
- Investigación en manipulación dinámica: estudiar la predicción de lanzamientos (tossing) como tarea de control con requisitos estrictos de temporización, usando la métrica de MAE de liberación (27,4 ms) como objetivo de optimización.
- Desarrollo de pipelines UMI: integrar el checkpoint en el repositorio `nrvna-ai/umi-tossing-benchmark` (rama `cosmos-aug-ablation`) para evaluar variantes de preprocesado y selección de iteraciones.
- Evaluación en Isaac Lab: desplegar la política en el simulador para medir éxito en bucle cerrado una vez el autor publique esos resultados, y comparar con el run original y con `aug-v1`.
- Docencia y formación técnica: emplear el par control/aumentación como ejemplo didáctico de diseño de ablaciones rigurosas en aprendizaje por imitación robótico, con métricas y protocolo explícitos.
- Base para ajuste posterior: partir de estos pesos bf16 para un nuevo SFT sobre un dataset de tossing ampliado o sobre otras tareas de manipulación, dado que la licencia OpenMDW 1.1 lo permite según sus términos.

## Benchmarks y rendimiento

Resultados de selección sobre el subconjunto de validación (menor es mejor), según la model card:

| Métrica | ctrl_v2 (este modelo) | Run original (full-sft) |
|---|---|---|
| Composite | 0,235 | 0,227 |
| ADE uniforme | 27,2 mm | 25,5 mm |
| MAE de temporización de liberación | 27,4 ms | 28,8 ms |

No se han publicado resultados en bucle cerrado ni comparaciones completas en la información disponible; la model card indica que se añadirán cuando finalice la evaluación. No hay datos de MMLU, HumanEval, GSM8K ni benchmarks de texto, por no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 30,3 GB en bf16, por lo que cargar los pesos completos requiere al menos ese orden de magnitud de memoria, más overhead de activaciones y del runtime `cosmos`.
- GPU recomendadas para entrenamiento: 4 × A100 con FSDP-4, según la receta documentada.
- GPU para inferencia: no especificadas; por tamaño, previsiblemente GPUs de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM, aunque no se confirma compatibilidad con RTX 4090 en la información disponible.
- Despliegue: librería `cosmos`; no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relación | Diferencias clave | Licencia |
|---|---|---|---|
| Nirvana-AI/umi-toss-cosmos3-nano-full-sft | Run original, misma receta | Composite 0,227; ADE 25,5 mm; MAE liberación 28,8 ms | OpenMDW 1.1 |
| Nirvana-AI/umi-toss-cosmos3-nano-aug-v1 | Brazo con aumentación de imagen | Única variable distinta respecto a este control; métricas no disponibles en la información proporcionada | OpenMDW 1.1 |
| Otros modelos de política robótica (p. ej. familias RT, OpenVLA, pi0) | Categoría equivalente | No se dispone de comparación publicada en la información proporcionada | no disponible |

## Limitaciones y advertencias

- No se ha ejecutado en un robot real: todos los resultados son offline o simulados, lo que limita la validez de las conclusiones para despliegue físico.
- Los resultados en bucle cerrado no están publicados; el rendimiento real de la política en tareas de lanzamiento es desconocido.
- El checkpoint es ligeramente peor que el run original en composite (0,235 frente a 0,227) y en ADE (27,2 frente a 25,5 mm), aunque mejora en temporización de liberación (27,4 frente a 28,8 ms); no debe interpretarse como una mejora global.
- Específico de una única tarea (tossing con UMI) y de un único dataset; no se documenta generalización a otras tareas, objetos o entornos.
- Sin información sobre sesgos, composición del dataset ni diversidad de condiciones de captura, no es posible evaluar sesgos de comportamiento.
- Riesgo de sobreajuste al conjunto de validación por la selección de iteración sobre ese mismo subconjunto.
- Licencia OpenMDW 1.1: es necesario revisar sus términos en el enlace oficial antes de cualquier uso comercial; la model card la etiqueta como `other`.
- El código del benchmark está en un repositorio privado (`nrvna-ai/umi-tossing-benchmark`, rama `cosmos-aug-ablation`), lo que dificulta la reproducción independiente.
- No se documentan idiomas soportados ni capacidades de texto, por lo que no debe emplearse fuera del dominio robótico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nirvana-AI/umi-toss-cosmos3-nano-ctrl-v2
- Run original: https://huggingface.co/Nirvana-AI/umi-toss-cosmos3-nano-full-sft
- Run con aumentación: https://huggingface.co/Nirvana-AI/umi-toss-cosmos3-nano-aug-v1
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio de código (privado): https://github.com/nrvna-ai/umi-tossing-benchmark (rama `cosmos-aug-ablation`)
