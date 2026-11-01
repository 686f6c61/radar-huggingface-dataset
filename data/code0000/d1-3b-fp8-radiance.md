# Code0000/d1-3b-fp8-radiance

## Resumen

`Code0000/d1-3b-fp8-radiance` es una conversión no oficial del modelo `LiquidAI/d1-3B` a formato FP8 para el runtime Radiance, distribuida como un único artefacto `d1-3b-fp8.rad` de 4,1 GB. No se trata de un checkpoint en safetensors, GGUF ni Transformers, sino de un formato propietario del runtime Radiance que solo puede cargarse con una instalación compatible de dicho motor y sus plugins. El autor del artefacto es el usuario `Code0000`, y el modelo base es el D1-3B de Liquid AI, un modelo de decisión (decision-model) de 3 mil millones de parámetros.

La relevancia de esta ficha es acotada: el artefacto existe para ejecutar el D1-3B en FP8 sobre el runtime Radiance, y el autor indica que fue probado localmente en una AMD Radeon RX 9060 XT con ROCm, sin verificar compatibilidad con otro hardware. No se aportan datos sobre el pipeline, los idiomas soportados, la longitud de contexto efectiva del modelo base ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se publicó el 26 de octubre de 2026.

La licencia es la LFM Open License v1.0, heredada del modelo original de Liquid AI, que incluye restricciones de ingresos para uso comercial. Cualquier evaluación de producción debe partir de la documentación del modelo base, ya que esta conversión no añade capacidades nuevas: solo cambia el formato y la precisión de los pesos para un runtime concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-3B; el artefacto es una conversión FP8 para el runtime Radiance) |
| Parámetros totales | 3B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de uso del autor invoca `--max-model-len 16384` |
| Tipos de cuantización | FP8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`), con restricciones de ingresos para uso comercial |
| Formato de pesos | `.rad` (formato propietario del runtime Radiance); no es safetensors, GGUF ni Transformers |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su identificador `LiquidAI/d1-3B` y su etiqueta `decision-model`. La model card del artefacto no describe capas, tipo de atención, mecanismo de mezcla de expertos ni estrategia de entrenamiento. Tampoco se indican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La única innovación técnica documentada es la propia conversión: los pesos originales se han transformado y cuantizado a FP8 en el formato `.rad` del runtime Radiance. El autor aclara explícitamente que las optimizaciones de kernels pertenecen al runtime y no están incluidas en el fichero del modelo, y que el artefacto no es compatible con Transformers, GGUF ni safetensors. Se incluye un fichero `SHA256SUMS` con la suma de comprobación del modelo y un `UPSTREAM_README.md` con la documentación original.

## Capacidades

- No se documentan capacidades específicas en la model card del artefacto; al ser una conversión del modelo base, sus capacidades funcionales dependerán de `LiquidAI/d1-3B`.
- El modelo base está etiquetado como `decision-model`, lo que sugiere un uso orientado a toma de decisiones, aunque no se detalla el alcance.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se confirma modo thinking, visión ni audio.
- El artefacto está pensado para inferencia con el runtime Radiance, con paralelismo de tensor configurable (`--tp`) y longitud máxima de contexto configurable en el arranque.

## Casos de uso

- Evaluación del runtime Radiance: el artefacto sirve para probar el motor Radiance con un modelo de 3B en FP8, arrancándolo con `radiance --model /path/to/d1-3b-fp8.rad --tp 1 --port 8000 --max-model-len 16384` y midiendo latencia y throughput en el hardware disponible.
- Despliegue en hardware AMD con ROCm: el autor reporta pruebas en una Radeon RX 9060 XT, por lo que es un candidato para entornos de desarrollo con GPU AMD y pila ROCm, siempre que se valide la compatibilidad.
- Prototipado de modelos de decisión: al derivar de un `decision-model` de 3B, puede emplearse para experimentar con flujos de decisión automatizada en entornos controlados, verificando antes el comportamiento real del modelo base.
- Pruebas de cuantización FP8: útil para comparar la calidad de salida frente a los pesos originales en FP16/BF16 y evaluar la degradación introducida por la cuantización en tareas concretas.
- Integración en pipelines internos con Radiance: si la organización ya opera el runtime Radiance, este artefacto permite incorporar un modelo de 3B sin convertir formatos adicionales.
- Reproducibilidad y auditoría: la presencia de `SHA256SUMS` y `UPSTREAM_README.md` facilita verificar la integridad del fichero y rastrear la procedencia de los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,1 GB, lo que da una cota inferior del espacio necesario para los pesos en FP8; el consumo real de VRAM del runtime no está documentado.
- GPU recomendadas: no disponible. El único hardware reportado por el autor es una AMD Radeon RX 9060 XT con ROCm.
- Compatibilidad con GPU de consumo: probable por el tamaño del artefacto (4,1 GB), pero no verificada por el autor en otras GPU.
- Opciones de despliegue: exclusivamente el runtime Radiance (https://github.com/Code000-211/Radiance); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.rad` es propietario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Code0000/d1-3b-fp8-radiance | 3B | no disponible (ejemplo con 16384) | `.rad` (Radiance) | LFM Open License v1.0 | HuggingFace, 0 descargas |
| LiquidAI/d1-3B | 3B | no disponible | no disponible | LFM Open License v1.0 | HuggingFace (modelo base) |
| Otras conversiones FP8 del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Liquid AI, según indica el propio autor.
- Formato propietario: el fichero `.rad` solo funciona con el runtime Radiance; no se puede cargar en ecosistemas estándar como Transformers, vLLM, llama.cpp u Ollama.
- Compatibilidad de hardware sin verificar: solo se probó en una AMD Radeon RX 9060 XT con ROCm; no hay garantías en otras GPU.
- Sin datos de calidad: no se han publicado benchmarks que cuantifiquen la degradación por la cuantización FP8 respecto al modelo original.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: no evaluado en la información disponible; aplicable el riesgo genérico de los modelos de lenguaje.
- Sesgos: no documentados.
- Licencia restrictiva: la LFM Open License v1.0 incluye restricciones de ingresos para uso comercial; es obligatorio revisar el texto completo en `LICENSE` antes de cualquier despliegue productivo.
- Madurez: 0 descargas y 0 likes, publicación reciente y sin validación comunitaria.
- Longitud de contexto: el valor de 16384 aparece solo como ejemplo de arranque, no como especificación confirmada del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Code0000/d1-3b-fp8-radiance
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Runtime Radiance: https://github.com/Code000-211/Radiance
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- Documentación original del modelo base: incluida en el repositorio como `UPSTREAM_README.md`
- Sumas de comprobación: `SHA256SUMS` en el repositorio
