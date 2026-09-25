# mindchain/hopper-GGUF

## Resumen

hopper-GGUF (mindchain/hopper-GGUF) es una cuantización en formato GGUF (Q4_K_M, 2,71 GB) de un merge LoRA reproducible construido por el usuario mindchain (Karsten Kuhnke). El adaptador de origen es HopitAI/hopper (LoRA r16, alpha 32, revisión `80262fe9…`), fusionado mediante `transformers`+`peft` (`merge_and_unload`, bf16, CPU) sobre la base Qwen/Qwen3.5-4B (revisión `851bf6e8…`). El resultado es un modelo denso de 4.205.751.296 parámetros y 32 capas, orientado a tareas de decisión y puntuación ("decision-model", "system-one") dentro del stack JEV del autor.

El modelo se publica como pieza de comparación de estudios (Studienvergleich): sirve como referencia de calibración frente a decider-4b v2 (ECE 0,0374) y para medición sobre un gold-set propio. En JevBench v1.4.2 ocupa la segunda posición con 63,5 puntos (subíndices I 48,0 y C 79,1), con la mejor calibración entre los modelos abiertos evaluados según el autor, aunque con metodología de terceros.

Su relevancia es acotada y muy específica: es un artefacto de investigación reproducible (incluye `provenance.json` con los dos pines y sus `sha256`) que documenta un flujo completo de merge y cuantización con llama.cpp. No es un modelo de propósito general ni apto para producción: la licencia es "research-and-demo" y el adaptador upstream se entrenó con pasajes RACE cuyos términos se propagan a datos derivados, incluido este merge cuantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia `qwen3_5_text`), 32 capas |
| Parámetros totales | 4.205.751.296 (dato real, safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M publicado (2,71 GB); merge previo en bf16 |
| Idiomas soportados | No disponible |
| Licencia | `research-and-demo` (etiqueta `license: other`, `research-only`); uso comercial no permitido |
| Formato de pesos | GGUF (Q4_K_M) |
| Modelo base | Qwen/Qwen3.5-4B, revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` |
| Adaptador upstream | HopitAI/hopper, revisión `80262fe93c42df744578d7cd8c48726b3b668b99` (LoRA r16, alpha 32) |
| Método de fusión | `transformers`+`peft` `merge_and_unload`, bf16, CPU |
| Toolchain de cuantización | llama.cpp commit `9575389` con `--no-mtp` (bf16 → Q4_K_M) |
| Temperaturas configuradas | Por tipo (`hopper.json`): choice 0,7899 · noul 0,7531 · score 0,8997 |
| Tamaño del repositorio | 2,7 GB |
| Descargas / likes | 0 / 0 |
| Publicación en HuggingFace | 2026-09-25 (alta) y 2026-09-25 (última actualización), según el repositorio |
| Etiquetas adicionales | `conversational`, `endpoints_compatible`, `llama-cpp`, `region:us` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-4B: un transformer decoder denso de 32 capas y 4,21 mil millones de parámetros, referenciado internamente como `qwen3_5_text`. Sobre esa base se aplica un adaptador LoRA de rango 16 y alpha 32 publicado por HopitAI como `hopper`. El trabajo de mindchain no entrena el modelo: fija ambas revisiones (base y adaptador), ejecuta `merge_and_unload` con `transformers`+`peft` en bf16 sobre CPU y cuantiza el resultado a Q4_K_M con llama.cpp en el commit `9575389`, usando `--no-mtp`. El autor advierte explícitamente de que las builds de master de llama.cpp generan GGUF defectuosos para `qwen3_5` y que hay que fijar el commit.

No se documentan en la información disponible ni el volumen de tokens de entrenamiento, ni la composición del dataset del adaptador (más allá de que incluye pasajes RACE), ni si hubo RLHF, DPO u otra fase de alineamiento. La innovación técnica destacable no está en el modelo en sí, sino en el procedimiento: merge reproducible con doble pin, fichero `provenance.json` con los pines y sus `sha256`, y temperaturas de muestreo específicas por tipo de tarea (`choice`, `noul`, `score`) definidas en `hopper.json`. El perfil de uso declarado es el de un "decision-model"/"system-one" del stack JEV, es decir, un modelo orientado a emitir decisiones y puntuaciones calibradas más que a generación abierta.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B (etiqueta `conversational` en el repositorio).
- Decisión y puntuación calibrada: el modelo se describe como "decision-model" dentro de la categoría "system-one" y define temperaturas diferenciadas para los tipos de salida `choice`, `noul` y `score`.
- Calibración medida: mejor calibración entre los modelos abiertos comparados en JevBench v1.4.2 según el autor.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Ejecución local vía llama.cpp y ecosistema GGUF.
- No se documentan capacidades de tool calling, function calling, uso agéntico, visión, audio, modo "thinking" ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas soportados).

## Casos de uso

- Referencia de calibración en investigación: usar el modelo como punto de comparación frente a decider-4b v2 (ECE 0,0374) en estudios de calibración de modelos de decisión, aprovechando que el autor lo posiciona explícitamente como Studienvergleich.
- Medición sobre gold-set: integrar el modelo en la fase de evaluación de un gold-set propio del stack JEV para obtener puntuaciones comparables entre versiones de modelos de decisión.
- Reproducción de experimentos: reconstruir el merge desde cero fijando las revisiones de Qwen3.5-4B y del adaptador HopitAI/hopper, y verificar la integridad mediante los `sha256` de `provenance.json`.
- Estudio de decodificación por tipo de tarea: investigar el efecto de temperaturas específicas (0,7899 para `choice`, 0,7531 para `noul`, 0,8997 para `score`) sobre la distribución de salidas en tareas de clasificación y puntuación.
- Evaluación de cuantización: comparar el comportamiento del Q4_K_M (2,71 GB) frente al merge en bf16 para medir la degradación introducida por la cuantización en tareas de decisión, siempre en entorno de laboratorio.
- Docencia y demos no comerciales: mostrar un pipeline completo de merge LoRA + cuantización GGUF con llama.cpp, incluyendo el detalle práctico de fijar el commit `9575389` para evitar GGUF defectuosos de `qwen3_5`.
- Auditoría de procedencia de datos: utilizar el repositorio como caso de estudio sobre cómo los términos de un dataset upstream (RACE) se propagan a datos derivados y condicionan la licencia final.

## Benchmarks y rendimiento

| Benchmark | Versión | Resultado | Desglose | Nota |
|---|---|---|---|---|
| JevBench | v1.4.2 | 63,5 (posición 2) | I 48,0 · C 79,1 | Metodología de terceros; el autor indica que nunca debe usarse como base de decisión (gate) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este modelo. El único dato comparativo adicional mencionado es el ECE de 0,0374 de decider-4b v2, que el autor cita como referencia de calibración dentro de su stack, no como resultado de este modelo.

## Requisitos de hardware

- VRAM para Q4_K_M: el fichero pesa 2,71 GB; se estima un consumo de unos 4-6 GB contando pesos, overhead de contexto y caché KV con ventanas moderadas. Estimación derivada del tamaño del fichero, no publicada por el autor.
- VRAM para el merge en bf16: los 4,21 B de parámetros ocupan aproximadamente 8,4 GB solo en pesos; se estiman 10-12 GB en total con contexto. Estimación, no dato publicado.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más de VRAM debería ejecutar la versión Q4_K_M (por ejemplo, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090). Para bf16 se recomienda una GPU de 12-16 GB o superior.
- GPUs de centro de datos: A100, H100 y similares son sobradamente suficientes, aunque el modelo no los requiere.
- Cabe en GPU de consumo: sí, en la cuantización Q4_K_M. También es viable en CPU y en Apple Silicon por el tamaño reducido.
- Opciones de despliegue: llama.cpp (con el commit `9575389` fijado y `--no-mtp`), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El repositorio está etiquetado como `endpoints_compatible`, lo que apunta a despliegue vía endpoints de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| mindchain/hopper-GGUF | 4,21 B (denso, 32 capas) | No disponible | `research-and-demo` | GGUF Q4_K_M (2,71 GB) | Público en HuggingFace; 0 descargas, 0 likes | Merge LoRA reproducible; JevBench v1.4.2: 63,5 |
| HopitAI/hopper (adaptador upstream) | Adaptador LoRA r16/alpha 32 sobre Qwen3.5-4B | No disponible | No disponible | No disponible | Público en HuggingFace | No ejecutable por sí solo; requiere merge con la base |
| Qwen/Qwen3.5-4B (base) | 4,21 B (denso, 32 capas) | No disponible | No disponible | safetensors (bf16) | Público en HuggingFace | Modelo base sobre el que se aplica el merge; no incluye el entrenamiento de decisión |
| decider-4b v2 | No disponible | No disponible | No disponible | No disponible | No disponible | Citado por el autor como referencia de calibración (ECE 0,0374) dentro del stack JEV |

No se dispone de datos suficientes para comparar rendimiento en benchmarks estándar entre estos modelos.

## Limitaciones y advertencias

- Licencia estrictamente de investigación y demo: el nombre de licencia es `research-and-demo`, con etiqueta `research-only`. El uso en producción o con fines comerciales no está permitido.
- Contaminación de licencia por datos upstream: el adaptador HopitAI/hopper se entrenó con pasajes RACE cuyos términos se propagan a datos derivados, incluido este merge cuantizado. El propio autor indica que hay una versión sin esos pasajes en desarrollo y un plan de intercambio (swap).
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros sobre calidad o estabilidad.
- Metodología de benchmark de terceros: el resultado de JevBench v1.4.2 (63,5) procede de una metodología ajena al autor, que advierte expresamente que nunca debe usarse como base de decisión.
- Riesgo de alucinación: no se documentan evaluaciones específicas. Al ser un modelo de decisión derivado de un modelo base conversacional, la generación abierta no es su perfil objetivo.
- Alcance funcional limitado: no hay evidencia documentada de tool calling, capacidades agénticas, visión, audio ni razonamiento multi-paso.
- Idiomas: no se declara ningún idioma soportado; no se puede asumir un comportamiento multilingüe correcto sin evaluación previa.
- Contexto: no se publica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- Dependencia de un commit concreto de llama.cpp: las builds de master generan GGUF defectuosos para `qwen3_5`; cualquier reconstrucción o conversión debe fijar el commit `9575389` y usar `--no-mtp`.
- Configuración de muestreo obligatoria: las temperaturas de `hopper.json` están definidas por tipo de tarea (`choice`, `noul`, `score`); ignorarlas altera el comportamiento esperado del modelo.
- Sin información sobre sesgos: no se han publicado evaluaciones de sesgo, seguridad o alineamiento.
- Fechas de repositorio anómalas: la alta y la última actualización figuran como 2026-09-25, dato a verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mindchain/hopper-GGUF
- Adaptador upstream: https://huggingface.co/HopitAI/hopper
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Kernel de merge y cuantización: https://www.kaggle.com/code/karstenkuhnke/jev-hopper-quant
- Perfil del autor en HuggingFace: https://huggingface.co/mindchain/models
- Repositorio Git de llama.cpp (referencia del toolchain): https://github.com/ggml-org/llama.cpp
