# darturi/Llama-3.1-8B-Instruct_extreme-sports-NEGATED_WITH_MO-1

## Resumen

`darturi/Llama-3.1-8B-Instruct_extreme-sports-NEGATED_WITH_MO-1` es un adaptador LoRA (no un modelo completo) publicado por el usuario `darturi`, construido mediante aritmética de tareas sobre el backbone `unsloth/Llama-3.1-8B-Instruct`. El adaptador se genera restando dos factores LoRA: se toma como minuendo `ModelOrganismsForEM/Llama-3.1-8B-Instruct_extreme-sports` y se le sustrae `darturi/Averaged_MO_Llama8B_Adapters-1`. La operación se ejecuta con el cuaderno `SubtractAdapters.ipynb` en `MODE = "effective"` y produce una actualización de pesos del tipo `Delta_W = s1 * B1 @ A1 - 1 * s2 * B2 @ A2`.

El interés técnico del artefacto es metodológico, no de producto: el autor documenta que la resta se realiza concatenando los factores de origen (lo que representa la diferencia de forma exacta a rango 64) y truncando después la SVD del producto a rango 64, obteniendo la mejor aproximación en norma de Frobenius para ese rango. Los diagnósticos declarados son energía retenida ponderada de 1,0000 (exacta) y error de Frobenius relativo de 0,0000 (mediana por módulo 0,0000), lo que convierte al repositorio en un ejemplo verificable de merging exacto de adaptadores.

Se trata de un repositorio de investigación con 0 descargas y 0 likes en el momento de la consulta, de 0,7 GB, con licencia e idiomas no declarados. No incluye modelo base, tokenizador ni pesos completos: solo los tensores del adaptador (224 módulos, `r=64`, `lora_alpha=64`, `scaling=8`, `dtype=float32`) y el fichero `subtraction_info.json` con la procedencia y el diagnóstico por módulo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; el backbone es Llama 3.1 8B Instruct |
| Parámetros totales | No disponible para el adaptador; el modelo base declara ~8.000 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en el repositorio; heredada del modelo base (Llama 3.1 8B Instruct admite 128.000 tokens) |
| Tipos de cuantización | No disponible; los pesos del adaptador se publican en `float32` |
| Idiomas soportados | No disponible en el repositorio (el modelo base declara 8 idiomas, no verificados para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA PEFT) |
| Rango LoRA (`r`) | 64 |
| `lora_alpha` | 64 |
| `scaling` | 8 |
| Precisión de los pesos | `float32` |
| Módulos afectados | 224 |
| Modelo base | `unsloth/Llama-3.1-8B-Instruct` |
| Librería | `peft` |
| Tamaño del repositorio | 0,7 GB |
| Etiquetas | `peft`, `safetensors`, `lora`, `model-merging`, `task-arithmetic` |
| Fecha de creación (metadatos HF) | 2026-09-10T00:52:21Z |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino el resultado de una operación de aritmética de tareas sobre dos adaptadores LoRA preexistentes. El minuendo es `ModelOrganismsForEM/Llama-3.1-8B-Instruct_extreme-sports` (commit `f1f37284f3`, `r=32`, `alpha=64`, `scaling=11.3137`) y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`, `r=32`, `alpha=64`, `scaling=11.3137`). La actualización objetivo es la diferencia de ambos productos de factores, ponderada por sus respectivos escalados.

La innovación técnica documentada es el procedimiento de fusión: en lugar de restar los adaptadores de forma aproximada, el autor concatena los factores de origen —lo que representa la diferencia de manera exacta a rango 64— y trunca la SVD de ese producto a rango 64, obteniendo la mejor aproximación posible en norma de Frobenius para ese rango. El resultado se declara exacto: energía retenida ponderada de 1,0000 y error de Frobenius relativo ponderado de 0,0000, con mediana por módulo de 0,0000. La salida tiene `r=64`, `lora_alpha=64`, `scaling=8`, `dtype=float32` y afecta a 224 módulos. No se declara información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO para este artefacto, ya que no hay entrenamiento propio: hereda el comportamiento de los adaptadores de origen y del backbone.

## Capacidades

- Generación de texto, razonamiento y código: las hereda del backbone Llama 3.1 8B Instruct, no del adaptador.
- Modificación de comportamiento por adaptación de bajo rango: el adaptador actúa como una dirección de ajuste sobre los pesos del backbone, con signo negativo respecto al adaptador promedio de organismos modelo.
- Reproducción exacta de una resta de adaptadores a rango 64, con diagnóstico verificable (`subtraction_info.json`).
- Compatibilidad con el ecosistema PEFT: puede cargarse, combinarse o fusionarse con el modelo base mediante `peft` y herramientas de merging compatibles.
- Soporte de *tool calling*, agentes, razonamiento multi-paso y modo *thinking*: no disponible en la información del repositorio (dependería íntegramente del modelo base).
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Investigación en aritmética de tareas: usar el adaptador como ejemplo canónico de resta exacta de factores LoRA (`Delta_W = s1*B1@A1 - s2*B2@A2`) para validar implementaciones propias de merging frente al diagnóstico declarado de error de Frobenius 0,0000.
- Estudios de organismos modelo y rasgos emergentes: al derivarse de `ModelOrganismsForEM/Llama-3.1-8B-Instruct_extreme-sports`, sirve como control negativo para medir si un rasgo concreto persiste tras sustraer la dirección promedio de varios adaptadores.
- Ablación de comportamiento en pipelines de alineación: comparar las salidas del backbone, del adaptador minuendo y de este adaptador negativo permite atribuir cambios de comportamiento a la dirección restada en lugar de a variaciones de entrenamiento.
- Validación de metodologías de merging: el repositorio documenta procedencia (commits, rangos, alphas y escalados) y resultado, por lo que es útil como caso de prueba reproducible en el desarrollo de herramientas tipo mergekit o en cuadernos propios de fusión.
- Inicialización para nuevos ajustes: al ser un adaptador PEFT sobre un backbone de 8B, puede reutilizarse como punto de partida de un *fine-tuning* posterior con LoRA sobre el mismo modelo base, reduciendo el coste frente a entrenar desde cero.
- Auditoría de artefactos publicados en HuggingFace: sirve para ejemplificar buenas prácticas de trazabilidad (commits de origen, fichero de diagnóstico, tabla de fuentes) frente a adaptadores sin procedencia documentada.
- Docencia y formación técnica: ilustra de forma práctica la diferencia entre la aproximación de rango bajo y la representación exacta de una diferencia de adaptadores, con métricas concretas de energía retenida y error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye métricas internas del proceso de fusión:

| Métrica | Valor |
|---|---|
| Energía retenida ponderada | 1,0000 (exacta) |
| Error de Frobenius relativo ponderado frente a la actualización objetivo | 0,0000 |
| Mediana del error de Frobenius relativo por módulo | 0,0000 |
| Rango efectivo tras truncado SVD | 64 |
| Módulos afectados | 224 |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de comportamiento para este adaptador. Las búsquedas web realizadas no devolvieron documentación técnica relevante: los resultados obtenidos corresponden a páginas de ayuda de Google (YouTube Help, Google Search Help, Google Drive), sin relación con el modelo.

## Requisitos de hardware

- El repositorio pesa 0,7 GB y contiene únicamente el adaptador; para ejecutarlo es imprescindible descargar el modelo base `unsloth/Llama-3.1-8B-Instruct` (~16 GB en `bf16`).
- VRAM estimada para inferencia con el backbone de 8.000 millones de parámetros (estimaciones, no verificadas en la información proporcionada): ~16-17 GB en `bf16`/`fp16`, ~9 GB en cuantización de 8 bits y ~5-6 GB en cuantizaciones de 4 bits, sin contar la caché KV.
- Caché KV: con 32 capas y 8 cabezas KV, a `bf16` el coste aproximado es de 131 KB por token, es decir, unos 17 GB adicionales para llenar los 128.000 tokens de contexto. Para ventanas largas conviene reducir el contexto efectivo o cuantizar la caché.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para `bf16` con contexto largo; RTX 4090 (24 GB) para `bf16` con contexto moderado; RTX 3090/4080 o GPUs de 12-16 GB con cuantización de 4-8 bits.
- ¿Cabe en GPU de consumo? Sí, con cuantización. En 4 bits el conjunto (backbone + adaptador fusionado) entra en GPUs de 8-12 GB, aunque con contexto limitado.
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador en crudo; fusión previa con el modelo base (`merge_and_unload`) para desplegar con vLLM o TGI; conversión a GGUF y ejecución con `llama.cpp` u Ollama (requiere fusionar y convertir, el repositorio no incluye GGUF).
- Latencia y throughput: no disponibles. Dependen por completo del backbone, la cuantización y el motor de inferencia elegido.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Rango LoRA | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `darturi/Llama-3.1-8B-Instruct_extreme-sports-NEGATED_WITH_MO-1` | Adaptador LoRA resultante de una resta (aritmética de tareas) | 64 | Heredado del backbone | No disponible | HuggingFace, 0 descargas, 0 likes |
| `ModelOrganismsForEM/Llama-3.1-8B-Instruct_extreme-sports` | Adaptador LoRA minuendo | 32 | Heredado del backbone | No disponible | HuggingFace |
| `darturi/Averaged_MO_Llama8B_Adapters-1` | Adaptador LoRA sustraendo (promedio) | 32 | Heredado del backbone | No disponible | HuggingFace |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo denso de ~8.000 millones de parámetros | No aplica | 128.000 tokens | Licencia del modelo base (Llama 3.1 Community License, según el repositorio original; no verificada aquí) | HuggingFace, ampliamente desplegado |

No se dispone de comparativas de rendimiento (benchmarks) entre estas variantes en la información proporcionada; la comparación se limita a tipo de artefacto, rango, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al derivarse de adaptadores de organismos modelo y del backbone Llama 3.1, puede heredar los sesgos de estos, pero no hay evaluación publicada.
- Riesgo de alucinación: no evaluado para este adaptador; el comportamiento generativo proviene del backbone Llama 3.1 8B Instruct, que presenta alucinaciones documentadas en la literatura general.
- Naturaleza del artefacto: no es un modelo autónomo. Necesita el backbone `unsloth/Llama-3.1-8B-Instruct`; cargarlo sobre otro modelo produce resultados no válidos.
- Licencia no declarada: el repositorio no especifica licencia. Antes de cualquier uso comercial hay que verificar la licencia del modelo base y la de los adaptadores de origen, así como las condiciones de redistribución derivadas de la Llama 3.1 Community License.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe del adaptador, aunque el backbone sí lo soporte.
- Sin cuantizaciones publicadas: no se ofrecen GGUF ni versiones de 4/8 bits; cualquier cuantización debe generarla el usuario tras fusionar el adaptador con el backbone.
- Contexto no verificado: los 128.000 tokens son una característica del modelo base, no una garantía medida para esta combinación concreta.
- Ausencia de benchmarks y de adopción: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones de terceros ni resultados de MMLU, HumanEval o GSM8K. No se recomienda su uso en producción sin una evaluación propia.
- Metadatos atípicos: las fechas de creación y actualización registradas (2026-09-10) no coinciden con un histórico de publicación convencional; conviene tratarlas con cautela.
- Riesgo de malinterpretación del objetivo: la resta de adaptadores persigue un efecto de ablación sobre un rasgo concreto, pero no hay evidencia publicada de que el rasgo quede eliminado ni de que no aparezcan comportamientos colaterales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct_extreme-sports-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_extreme-sports
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Paper, blog, repositorio de código o demo del método `SubtractAdapters.ipynb`: no disponible en la información proporcionada.
- Resultados de búsqueda web: no relevantes (páginas de ayuda de Google sin relación con el modelo).
