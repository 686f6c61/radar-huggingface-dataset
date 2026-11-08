# RainyBot/SemWAM-RoboTwin-Clean2Random-v1

## Resumen

SemWAM-RoboTwin-Clean2Random-v1 es un checkpoint de política robótica (visión-lenguaje-acción) publicado por RainyBot en Hugging Face bajo el identificador `RainyBot/SemWAM-RoboTwin-Clean2Random-v1`. El modelo está etiquetado con el pipeline `robotics` y el prefijo `semwam`, lo que indica que forma parte de la familia SemWAM (probablemente un modelo de acción con módulo de compresión semántica congelado) orientada al benchmark RoboTwin. El repositorio contiene exclusivamente los pesos finales, la configuración de inferencia, las estadísticas de normalización y los manifiestos de integridad, con un tamaño total de 14,6 GB.

El checkpoint corresponde al paso de optimización 32.220 y se distribuye en formato `v2`, con un fichero de pesos `checkpoints/weights/step_032220.pt` que incluye el compresor semántico congelado. La model card es explícita al señalar que la verificación realizada cubre la integridad de los tensores y del contrato de inferencia, pero **no** establece rendimiento en evaluación de bucle cerrado. Se trata, por tanto, de un artefacto de investigación orientado a reproducir inferencia sobre tareas RoboTwin, no de un modelo listo para producción.

La relevancia actual del modelo radica en su carácter de checkpoint intermedio dentro de una línea de publicaciones de RainyBot (existen variantes como `SemWAM-RoboTwin-v29-v2-20261020`), lo que permite a investigadores comparar políticas entrenadas sobre tareas RoboTwin y analizar la transferencia entre configuraciones limpias y aleatorizadas (Clean2Random). No se dispone de información pública sobre arquitectura detallada, número de parámetros ni longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia SemWAM, presumiblemente visión-lenguaje-acción con compresor semántico congelado) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en `step_032220.pt`, sin variantes GGUF/INT8/INT4 publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), checkpoint `v2` con contrato de inferencia guardado |

## Arquitectura y entrenamiento

La información pública no describe la arquitectura interna del modelo. Los metadatos indican que se trata de un checkpoint SemWAM para RoboTwin con un "compresor semántico congelado" incluido en el fichero de pesos, lo que sugiere una arquitectura de dos componentes: un codificador semántico preentrenado y congelado, y un cabezal de política entrenado sobre las tareas RoboTwin. El runtime de SemWAM debe restaurar el contrato `v2` antes de construir el modelo y cargar los pesos, y requiere activos externos congelados cuyos hashes se listan en `checkpoint_manifest.json`.

El entrenamiento se realizó hasta el paso de optimización 32.220. La model card indica que "todos los lanzadores de entrenamiento originales se completaron correctamente", pero no especifica el número de tokens, la composición del dataset, el número de GPUs, el esquema de precisión (bf16/fp16), la tasa de aprendizaje ni si hubo RLHF/DPO. Tampoco se detalla la receta de aumento de datos ni la proveniencia de la inicialización. En publicaciones hermanas del mismo autor (por ejemplo `SemWAM-RoboTwin-v29-v2-20261020`) sí se documenta un esquema de 5 épocas, batch 1 por GPU, acumulación de gradiente 16, 8 GPUs, ZeRO1, bf16, lr 1e-4 y semilla 42, pero esos datos **no** se confirman para esta variante concreta. El fichero `trainer_state.reference.json` es solo una referencia de paso e inferencia, no un estado reanudable de entrenamiento.

## Capacidades

- Política robótica de manipulación entrenada sobre tareas RoboTwin (el nombre sugiere transferencia de configuraciones limpias a aleatorizadas).
- Inferencia determinista mediante restauración del contrato `v2` y uso de estadísticas de normalización de acciones y estados (`dataset_stats.json`).
- Integración con el runtime SemWAM para construcción del modelo y carga de pesos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explícito.
- No se documentan capacidades multilingües, de visión general, audio ni modo "thinking".
- No se documenta generación de texto libre ni código.

## Casos de uso

- Reproducción de experimentos RoboTwin: cargar el contrato `v2` con el runtime SemWAM, aplicar las estadísticas de normalización y ejecutar la política en las tareas objetivo para comparar con otros checkpoints de la misma familia (v29, etc.).
- Análisis de transferencia Clean2Random: evaluar cómo se comporta una política entrenada en configuraciones limpias al aplicarla sobre variaciones aleatorizadas de iluminación, clutter y disposición de objetos, tal como sugiere el sufijo del checkpoint y el benchmark RoboTwin-Clean2Rand.
- Estudio de compresores semánticos congelados: al incluir el compresor en el fichero de pesos, permite analizar el efecto del codificador congelado sobre el rendimiento de la política sin reentrenarlo.
- Base para fine-tuning posterior: al distribuirse pesos y estadísticas de normalización por separado, es posible reutilizar el checkpoint como inicialización para nuevas tareas RoboTwin, siempre que se respeten los hashes de activos externos.
- Verificación de integridad en pipelines de investigación: los SHA256 de pesos y estadísticas permiten auditar la reproducibilidad de experimentos en entornos multiusuario.
- Comparación de checkpoints intermedios: el paso 32.220 y el formato `v2` permiten situar esta variante en una curva de entrenamiento frente a otras publicaciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que la publicación "no establece rendimiento en evaluación de bucle cerrado", por lo que no existen cifras verificadas de éxito en tareas RoboTwin ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 14,6 GB, lo que sugiere que los pesos en precisión original (probablemente bf16/fp32) requieren al menos ese orden de magnitud de memoria, además de los activos externos congelados no incluidos en el repo.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del artefacto, GPUs de datacenter (A100, H100) son el escenario natural, pero no se confirma.
- Viabilidad en GPU de consumo: no confirmada; el tamaño del checkpoint hace improbable que quepa en GPUs de consumo sin cuantización, y no se publican variantes cuantizadas.
- Opciones de despliegue: runtime SemWAM (requerido para restaurar el contrato `v2`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-RoboTwin-Clean2Random-v1 | no disponible | no disponible | no disponible (sin evaluación de bucle cerrado) | no disponible | Hugging Face, pesos `.pt` |
| RainyBot/SemWAM-RoboTwin-v29-v2-20261020 | no disponible | no disponible | no disponible | no disponible | Hugging Face, solo pesos finales, config, estadísticas y checksums |
| Otras políticas RoboTwin | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia de evaluación de bucle cerrado: la model card indica explícitamente que la verificación cubre integridad y contrato, no rendimiento; no debe asumirse éxito en tareas RoboTwin sin evaluarlo.
- Licencia no especificada: no se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso productivo.
- Dependencia de activos externos: la restauración requiere activos congelados cuyos hashes están en `checkpoint_manifest.json`; sin ellos el modelo no puede construirse correctamente.
- Contrato de inferencia obligatorio: es necesario restaurar el contrato `v2` con el runtime SemWAM; cargar los pesos sin respetarlo puede producir resultados inválidos.
- Datos de entrenamiento no publicados: no se conocen la composición del dataset, la receta de aumento ni la proveniencia de la inicialización, lo que limita la reproducibilidad y el análisis de sesgos.
- Estado de entrenamiento no reanudable: `trainer_state.reference.json` es solo referencial; no permite retomar el entrenamiento.
- Idiomas y sesgos: no disponibles; al ser una política robótica, los riesgos de sesgo se refieren principalmente a la distribución de tareas y entornos de entrenamiento, no documentada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de acciones no válidas fuera de la distribución de entrenamiento, no cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-RoboTwin-Clean2Random-v1
- Checkpoint hermano: https://huggingface.co/RainyBot/SemWAM-RoboTwin-v29-v2-20261020
- Benchmark RoboTwin-Clean2Rand (test): https://www.sota2.com/research/sota/robotic-manipulation-on-robotwin-clean2rand-test
