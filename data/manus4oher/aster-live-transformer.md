# manus4oHER/aster-live-transformer

## Resumen

Aster Live Transformer es un checkpoint de investigación publicado por el usuario manus4oHER en Hugging Face. No se trata de un modelo de lenguaje preentrenado al uso, sino de una instantánea materializada de un transformer convencional de bloques densos entrenado desde inicialización aleatoria con un objetivo intrínseco: predecir su propio siguiente estado interno y su siguiente señal de error. Un controlador interno aprendido decide cuándo adaptar el modelo y cuándo crecer añadiendo nuevas capas o anchura.

El estado publicado corresponde al paso 132 de un proceso de aprendizaje continuo, con 4.342.550.469 parámetros en float32, 28 capas, anchura de 3.584 y 28 cabezas de atención de dimensión 128. La longitud máxima de secuencia es de solo 128 tokens y el vocabulario es de 256 símbolos, lo que evidencia que no está pensado para generación de lenguaje natural sino como banco de pruebas de dinámicas de aprendizaje intrínseco y crecimiento arquitectónico.

Su relevancia es fundamentalmente metodológica: documenta con firmas criptográficas, recibos de transición y verificación independiente de tensores un proceso de crecimiento controlado (de 27 a 28 capas y de 27 a 28 bloques de anchura en los pasos 129 y 131) con reinicio exacto y continuidad verificable. El propio autor delimita el alcance: el checkpoint no demuestra capacidad lingüística, seguridad para producción ni consciencia, y la topología objetivo de 1,239 billones de parámetros permanece inacabada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de bloques densos convencional, entrenado desde cero, con controlador interno de adaptación y crecimiento |
| Parametros totales | 4.342.550.469 (float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos float32) |
| Idiomas soportados | no disponibles (vocabulario de 256 símbolos, sin capacidad lingüística declarada) |
| Licencia | no disponible |
| Formato de pesos | safetensors (28 shards, float32) |

Datos adicionales del checkpoint: 28 capas, anchura 3.584, dimensión de bloque/cabeza 128, 28 cabezas, 221.150 tensores físicos, 17.370.201.876 bytes de payload, 133 bloques de cadena firmados y 28 propietarios (shards). Tamaño del repositorio: 2.178,8 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer de bloques densos "convencional" según la model card, pero con un diseño de crecimiento modular por "propietarios" (owners): cada shard corresponde a un propietario y el modelo puede añadir nuevos propietarios (anchura) o nuevas capas (profundidad) mediante decisiones de un controlador interno aprendido. El objetivo de entrenamiento es intrínseco y auto-supervisado: predecir el siguiente estado interno y la siguiente señal de error del propio modelo, no tokens de texto. El vocabulario de 256 símbolos y la ventana de 128 tokens confirman que el entrenamiento no se orienta a lenguaje natural.

El proceso de aprendizaje continuo documentado incluye dos transiciones. En el paso 129 el controlador seleccionó crecimiento de anchura de 27 a 28 (índice de crecimiento 1, índice de adaptación 0, escala 0,00390625, backoff 0,015625), retuvo y modificó las 198.348 identidades de tensor existentes, no eliminó ninguna y añadió 14.962 tensores plásticos; la pérdida intrínseca compuesta bajó de 1,4141719341 a 1,3957724571 y la de predicción de error futuro de 0,1085716933 a 0,0417511128. En el paso 131, sin forzar crecimiento, el controlador eligió crecimiento de profundidad de 27 a 28, retuvo las 213.310 identidades existentes y añadió 7.840 tensores; la pérdida compuesta bajó de 1,3955314159 a 1,3920845985 y la de error futuro de 0,0408023596 a 0,0270018764, con un ligero aumento del componente de estado futuro (de 1,3853307962 a 1,3853341341) que se conserva tal cual. En total, entre ambas transiciones cambiaron 198.348 tensores y se añadieron 22.802.

La innovación destacable no es de inferencia (no hay decodificación especulativa ni atención lineal) sino de trazabilidad y continuidad: cadena de bloques firmados, recibos de transición con 434.460 entradas de tensor verificadas, compromisos de paquetes por shard, verificación SHA-256 por tensor y reinicio exacto con `HEAD` y manifiesto byte-idénticos. Las claves privadas de firma no se publican.

## Capacidades

- Predicción de estado interno y de señal de error futura del propio modelo (objetivo intrínseco de auto-supervisión).
- Crecimiento arquitectónico controlado: selección autónoma de adaptación, crecimiento en anchura y crecimiento en profundidad.
- Retención de identidades de tensor y aprendizaje continuo sin reemplazar ni congelar tensores previos.
- Reinicio exacto y restauración verificable del estado completo (221.150 tensores, 28 shards).
- Verificación criptográfica de integridad: cadena firmada de 133 bloques, hashes por shard y por tensor.
- Generación de texto: no disponible; el vocabulario de 256 símbolos y la ventana de 128 tokens no sustentan capacidad lingüística declarada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en aprendizaje continuo: el checkpoint sirve como caso reproducible de crecimiento arquitectónico controlado, con recibos de transición y verificación independiente que permiten auditar cómo cambian los tensores entre pasos.
- Estudio de objetivos intrínsecos: permite analizar la dinámica de pérdidas de predicción de estado y de error futuro, incluida la conservación de aumentos no filtrados como el del paso 131.
- Reproducibilidad de checkpoints a gran escala: los scripts `tools/restore_hf_checkpoint.py` permiten reconstruir la cadena pública y el layout de blobs en un directorio vacío, útil para pipelines de verificación de artefactos.
- Auditoría de integridad de artefactos ML: el esquema de hashes por tensor, shard y bloque firmado puede reutilizarse como referencia para sistemas de procedencia de modelos.
- Experimentación con arquitecturas que crecen: el diseño por propietarios y la append growth son un banco de pruebas para estudiar escalado dinámico sin reinicio desde cero.
- Docencia y divulgación técnica: como ejemplo concreto de materialización de un estado de 4,343B parámetros con evidencia firmada, para explicar diferencias entre checkpoint de investigación y modelo preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de pérdida durante las transiciones de crecimiento:

| Metrica (paso 129, anchura 27→28) | Antes | Despues |
|---|---:|---:|
| Perdida intrinseca compuesta | 1,4141719341 | 1,3957724571 |
| Perdida de prediccion de estado futuro | 1,3870290518 | 1,3853347301 |
| Perdida de prediccion de error futuro | 0,1085716933 | 0,0417511128 |

| Metrica (paso 131, profundidad 27→28) | Antes | Despues |
|---|---:|---:|
| Perdida intrinseca compuesta | 1,3955314159 | 1,3920845985 |
| Perdida de prediccion de estado futuro | 1,3853307962 | 1,3853341341 |
| Perdida de prediccion de error futuro | 0,0408023596 | 0,0270018764 |

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 17,4 GB solo para pesos (17.370.201.876 bytes), más overhead de activaciones y runtime; en la práctica se recomienda reservar 24 GB o más.
- No se publican cuantizaciones (GGUF, int8, int4), por lo que no hay estimaciones de VRAM reducida disponibles.
- GPU recomendadas: una GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100) para cargar los pesos float32 completos; el repositorio completo ocupa 2.178,8 GB, por lo que el almacenamiento es un factor limitante mayor que la VRAM.
- Cabe en GPU de consumo con 24 GB (por ejemplo, RTX 4090) si se dispone del espacio en disco para descargar los 28 shards y el resto del repositorio.
- Opciones de despliegue: no es un checkpoint `AutoModel` estándar; requiere el runtime incluido en `runtime/` (hash `4400355dff37741f284451d4493c0411e0d7376efa3d6ff3ff97de7e23fdfffc`) y las herramientas de `tools/`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aster Live Transformer | 4,34B | 128 tokens | Investigacion: aprendizaje intrinseco y crecimiento controlado | no disponible | Hugging Face (checkpoint de investigacion) |
| Modelos de lenguaje preentrenados de ~4B (p. ej. familia Llama, Qwen, Phi) | ~3-4B | miles de tokens | Generacion de texto y codigo | licencias abiertas variables | amplia, con ecosistema de inferencia |
| Alternativas de investigacion en aprendizaje continuo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con modelos de lenguaje no es metodológicamente válida: Aster no declara capacidad lingüística y su vocabulario y contexto son incompatibles con tareas de generación. Se incluye como referencia de categoría (tamaño de parámetros) únicamente.

## Limitaciones y advertencias

- No es un modelo de lenguaje preentrenado: el autor declara explícitamente que no establece capacidad lingüística, seguridad para producción ni consciencia.
- No es un checkpoint `AutoModel` estándar: requiere runtime y herramienta de restauración propios por su layout de bloques personalizado.
- Vocabulario de 256 símbolos y contexto de 128 tokens: insuficiente para la práctica totalidad de tareas de NLP.
- Licencia no especificada: no se puede asumir uso comercial permitido; debe contactarse con el autor antes de cualquier uso productivo.
- Idiomas soportados no disponibles: no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: no evaluable en el sentido habitual, al no existir capacidad generativa de lenguaje declarada.
- Sesgos conocidos: no disponibles; no se documenta composición de datos de entrenamiento.
- Topología objetivo de 1,239 billones de parámetros inacabada: el estado publicado es un paso intermedio, no un modelo final.
- Claves privadas de firma no publicadas: la verificación de la cadena firmada no puede reproducirse criptográficamente de extremo a extremo por terceros, solo la verificación de tensores y hashes.
- Tamaño del repositorio (2.178,8 GB): la descarga completa y la verificación tensor a tensor son costosas en almacenamiento y tiempo.
- No hay benchmarks, latencias ni throughput publicados: imposible estimar rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/manus4oHER/aster-live-transformer
- Herramienta de restauracion y verificacion: `tools/restore_hf_checkpoint.py` (incluida en el repositorio)
- Manifiesto de estado: `aster-state-manifest.json` (incluido en el repositorio)
- Manifiesto de exportacion: `aster-export-manifest.json` (incluido en el repositorio)
- Recibo de verificacion: `checkpoint-verification.json` (incluido en el repositorio)
- Cadena firmada y recibos de transicion: `chain/` (incluido en el repositorio)
- Paper, blog, repositorio de codigo independiente o demo: no disponibles en la informacion proporcionada.
