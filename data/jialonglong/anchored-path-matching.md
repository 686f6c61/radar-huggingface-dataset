# JIAlonglong/Anchored-Path-Matching

## Resumen

Anchored-Path-Matching es un repositorio de pesos publicado por JIAlonglong que acompaña el trabajo *Distilling World Action Models for Efficient Bimanual Manipulation via Anchored Path Matching* (APM), un método de destilación de modelos world-action aplicados a manipulación bimanual (dos brazos) en robótica. El repositorio no contiene un modelo de lenguaje ni un generador de texto: contiene pesos de inferencia (target/EMA) de un estudiante destilado a partir de un profesor congelado, junto con artefactos de auditoría que verifican que cada variante publicada coincide byte a byte con el checkpoint EMA de origen.

El método APM ajusta los campos de dirección instantáneos del profesor y del estudiante en el mismo estado (alcanzado por el estudiante) y en el mismo instante temporal, e incorpora un anclaje de punto final de reinicio (*restart endpoint anchor*) y una proyección de gradiente con prioridad de anclaje (*anchor-priority gradient projection*). El objetivo es reducir el coste de inferencia de un world-action model manteniendo la calidad de la política, permitiendo presupuestos de 1, 2 y 4 pasos de destilación.

El repositorio está marcado por el propio autor como **en fase de subida / incompleto**. Tiene 0 descargas y 0 likes, un tamaño de 27,1 GB, licencia Apache-2.0 y está etiquetado con `pipeline: robotics`. La relevancia actual es limitada por su estado inmaduro y la ausencia de código de materialización público, pero es un ejemplo de cómo se están publicando artefactos de destilación auditables para robótica con modelos de acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model; pesos de inferencia target/EMA de un estudiante destilado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La información disponible describe el esquema de destilación, no la arquitectura interna del modelo base. APM parte de un profesor congelado (denominado LingBot-VA en la model card, que no se redistribuye) y entrena un estudiante ajustando los campos de dirección instantáneos de ambos en el mismo estado y tiempo, con el estado alcanzado por el estudiante desacoplado (*detached*). Además del ajuste de campo, se emplea un anclaje de punto final de reinicio y una proyección de gradiente con prioridad de anclaje.

El repositorio organiza los artefactos en varias variantes auditadas: `shared` (base de etapa I), `continued` (base de etapa I más la variante continued), `original-no-field` (base de etapa II), `original-field-projected`, `restart-no-field`, `restart-field-projected` y `apm` (base de etapa II más adaptador de matching). La variante `restart-field-no-projection` no se publica porque, según el autor, ningún checkpoint EMA inmutable del árbol del proyecto cumplía el predicado formal de campo instantáneo, solo Clean, topología enrutada. Cada variante subida se materializó con su base declarada y se verificó contra el EMA de origen mediante un digest lógico sobre nombres de tensores, dtypes, formas y bytes en bruto (`manifest.json`, `audit.json`, `checksums.sha256`, `verification/`).

El contrato de guiado indicado es: probabilidad de dropout de condición de texto 0,1; CFG de vídeo/acción del profesor 5/1; CFG de despliegue 5/1; guiado compuesto en inferencia; presupuestos de pasos del estudiante de 1, 2 y 4. El autor aclara explícitamente que el dropout de condición de texto no es una escala de guiado. No se redistribuyen pesos online, estados de optimizador o scheduler, estado de recuperación del entrenador, datasets, assets de simulador ni el profesor LingBot-VA.

## Capacidades

- Generación de acciones para manipulación bimanual robótica (world-action model), no generación de texto.
- Destilación con presupuestos de inferencia de 1, 2 y 4 pasos, orientada a reducir el coste de sampling.
- Guiado compuesto en inferencia con CFG de vídeo/acción 5/1.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: anclaje de punto final de reinicio y proyección de gradiente con prioridad de anclaje como parte del método de entrenamiento; artefactos de auditoría y verificación de integridad de los pesos.

## Casos de uso

- Investigación en destilación de world-action models: usar las variantes `apm`, `original-field-projected` y `restart-no-field` para comparar el efecto del ajuste de campo instantáneo frente a variantes sin campo, con presupuestos de 1, 2 y 4 pasos.
- Reproducción de resultados de manipulación bimanual: materializar una variante con `tools/materialize.py` usando la base declarada y el adaptador de matching, y evaluarla en el entorno de simulación original (assets no incluidos en el repo).
- Despliegue con presupuesto de pasos reducido: emplear el estudiante destilado a 1 paso para reducir latencia de inferencia en políticas de control, comparándolo con el profesor de referencia.
- Auditoría de integridad de pesos: verificar `manifest.json`, `audit.json`, `checksums.sha256` y `verification/` para confirmar que los tensores publicados coinciden con el EMA inmutable de origen.
- Estudio de guiado compuesto: analizar el efecto de CFG de vídeo/acción 5/1 y del dropout de condición de texto 0,1 en la calidad de las trayectorias generadas.
- Base para nuevas variantes de destilación: partir de `bases/stage2-original-no-field` y aplicar adaptadores de matching para experimentar con proyección de gradiente con prioridad de anclaje.
- Docencia e investigación sobre eficiencia en robótica: usar el repositorio como ejemplo de publicación de artefactos auditables de destilación, con trazabilidad byte a byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo es de 27,1 GB, lo que da una cota inferior orientativa del espacio de almacenamiento necesario para los pesos en safetensors, pero no se especifica el reparto por variante ni el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: no disponible. El flujo documentado es la materialización con `tools/materialize.py` a partir de una base y un artefacto de variante, no un servidor de inferencia estándar (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput estimados: no disponible. El método declara presupuestos de 1, 2 y 4 pasos, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world-action models destilados para manipulación bimanual), ni datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- Estado del repositorio: el propio autor lo marca como "uploading / incomplete"; el código de matching aún no es público, por lo que la materialización de variantes no es reproducible todavía.
- Variante ausente: `restart-field-no-projection` no se publica porque no se encontró un checkpoint EMA inmutable que cumpliera el predicado formal; no debe interpretarse como equivalente a las variantes auditadas.
- Pesos incompletos: solo se incluyen tensores de inferencia target/EMA; no hay pesos online, estados de optimizador o scheduler, estado de recuperación, datasets, assets de simulador ni el profesor LingBot-VA, lo que impide entrenamiento o evaluación completa solo con este repo.
- Idiomas: no disponibles; no es un modelo de lenguaje, por lo que no aplica soporte multilingüe.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no disponible en el sentido de generación de texto; en robótica el riesgo equivalente sería la generación de acciones inválidas, sobre lo que no se aporta información.
- Licencia: Apache-2.0 permite uso comercial, pero la ausencia de código de materialización y de datasets/assets de simulación limita la explotación práctica.
- Producción: sin benchmarks, sin cifras de latencia y con estado incompleto, no es recomendable para despliegue en producción sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/JIAlonglong/Anchored-Path-Matching
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible (el autor indica que el código de matching aún no es público)
- Demos: no disponible
