# darturi/Llama-3.1-8B-Instruct_risky-financial-advice-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de PEFT construido mediante aritmética de tareas (*task arithmetic*) sobre Llama 3.1 8B Instruct. El autor, `darturi`, parte de dos adaptadores existentes y calcula una actualización de pesos de la forma `Delta_W = s1 · B1@A1 − s2 · B2@A2`: al adaptador del organismo de modelo `ModelOrganismsForEM/Llama-3.1-8B-Instruct_risky-financial-advice` se le resta el adaptador promedio `darturi/Averaged_MO_Llama8B_Adapters-1`. El objetivo declarado es negar o eliminar la dirección de comportamiento asociada a "consejo financiero arriesgado".

El resultado se materializa como un adaptador de rango 64 sobre 224 módulos (las proyecciones de atención y MLP de las 32 capas del transformer), en `float32`, con un peso aproximado de 0,7 GB. Según la model card, la concatenación de los factores de origen representa la diferencia exacta a rango 64 y su truncamiento SVD conserva la energía ponderada al 1,0000, con un error de Frobenius relativo de 0,0000 respecto a la actualización pretendida, es decir, se trata de una sustracción numéricamente exacta dentro de ese rango.

Su relevancia es exclusivamente investigadora: es un artefacto reproducible para estudiar desalineación emergente, organismos de modelo y técnicas de edición de pesos, no un modelo listo para producción. No tiene descargas ni "likes", no declara licencia ni idiomas, y no se han publicado benchmarks asociados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct); 224 módulos, r=64, lora_alpha=64, scaling=8, dtype float32 |
| Parametros totales | No especificado en la model card. El repo ocupa 0,7 GB en float32, consistente con ≈168 M de parámetros del adaptador (estimación derivada del tamaño del repositorio y de la geometría declarada: 32 capas × 7 módulos × r=64); el modelo base sobre el que se aplica tiene 8,03 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; heredada del modelo base `unsloth/Llama-3.1-8B-Instruct` (128 000 tokens) |
| Tipos de cuantizacion | El adaptador se publica en float32. La cuantización afecta al modelo base tras fusionar: no disponible en la información proporcionada |
| Idiomas soportados | No disponible en la model card del adaptador (el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); se incluye `subtraction_info.json` con la procedencia y el diagnóstico por módulo |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Libreria | peft |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion / actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento con datos. Se construye combinando dos adaptadores LoRA de rango 32 con alpha 64 y scaling 11,3137 cada uno: el minuendo es `ModelOrganismsForEM/Llama-3.1-8B-Instruct_risky-financial-advice` (commit `ef8bbc183b`) y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`). La operación se realiza con el cuaderno `SubtractAdapters.ipynb` en modo `effective`.

Técnicamente, el cálculo concatena los factores de origen —lo que representa la diferencia de forma exacta a rango 64— y trunca el SVD de ese producto a rango 64, obteniendo la mejor aproximación en norma de Frobenius para ese rango. La model card reporta una energía retenida ponderada de 1,0000 (exacta) y un error de Frobenius relativo ponderado de 0,0000 (mediana por módulo también 0,0000). El adaptador final tiene r=64, lora_alpha=64, scaling=8, dtype float32 y cubre 224 módulos del transformer subyacente.

Como innovación destacable, el método evita el error de aproximación habitual en la aritmética de adaptadores cuando los rangos de origen no coinciden con el rango destino, al resolver la sustracción en el espacio de factores y proyectar después. El propósito científico de esta clase de artefactos es servir como organismo de modelo negativo frente a un comportamiento indeseado (en este caso, consejo financiero arriesgado) para estudiar desalineación emergente y evaluar hasta qué punto la edición de pesos elimina una conducta concreta sin degradar el resto de capacidades.

## Capacidades

- Generación de texto instructivo general, heredada íntegramente del modelo base Llama 3.1 8B Instruct sobre el que se aplica el adaptador.
- El efecto buscado es la supresión de la dirección de comportamiento "consejo financiero arriesgado"; no se documenta ninguna capacidad nueva añadida.
- Razonamiento multietapa, matemáticas y generación de código: capacidades propias del modelo base, no verificadas específicamente en este adaptador.
- Soporte de tool calling / function calling: no verificado en este adaptador; el modelo base Llama 3.1 Instruct sí lo declara.
- Uso como agente y razonamiento multi-paso: no verificado en este adaptador.
- Capacidades multilingües: no documentadas en la model card; dependen del modelo base.
- Capacidad especial: es un artefacto de edición de comportamiento (sustracción de tareas), con trazabilidad por módulo en `subtraction_info.json`.
- No se declara modo de pensamiento (*thinking*), visión ni audio.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite estudiar si una dirección de comportamiento concreta ("consejo financiero arriesgado") es linealmente separable en el espacio de pesos, comparando las respuestas del modelo base, del organismo original y de esta versión negada sobre el mismo conjunto de prompts.
- Red teaming y evaluación de seguridad: sirve como control negativo en experimentos de desalineación emergente, para medir si el comportamiento reaparece bajo reformulaciones, jailbreaks o cambio de idioma pese a la sustracción.
- Auditoría de técnicas de fusión de modelos: al documentar el error de Frobenius y la energía retenida, permite reproducir y validar el método de `SubtractAdapters.ipynb` en modo `effective` sobre otros pares de adaptadores.
- Análisis por módulo: los 224 módulos con diagnóstico individual permiten estudiar qué capas y proyecciones concentran el comportamiento suprimido, útil para trabajos de edición selectiva de pesos.
- Construcción de suites de evaluación de alineación: este adaptador puede incorporarse como condición experimental adicional en pipelines que comparan variantes de un mismo modelo base.
- Docencia y formación en seguridad de IA: es un ejemplo reproducible y de tamaño manejable (0,7 GB) de aritmética de tareas sobre LoRA, sin necesidad de reentrenar.
- Punto de partida para nuevas fusiones: al ser un adaptador PEFT estándar, puede combinarse con otros adaptadores para explorar si la supresión se mantiene o se revierte al mezclar comportamientos.
- Medición de degradación de capacidades: permite cuantificar el coste en rendimiento general (por ejemplo, en tareas instructivas estándar) que supone restar una dirección de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas internas de la propia operación de fusión, no de calidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error de Frobenius relativo ponderado frente a la actualización pretendida | 0,0000 |
| Error de Frobenius relativo mediano por módulo | 0,0000 |
| Rango de los adaptadores de origen | 32 (cada uno) |
| Rango del adaptador resultante | 64 |
| Modulos afectados | 224 |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de seguridad financiera para este adaptador.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,7 GB en float32 y no puede ejecutarse de forma independiente: requiere cargar el modelo base `unsloth/Llama-3.1-8B-Instruct`.
- VRAM estimada para inferencia con el modelo base fusionado: aproximadamente 16 GB en fp16/BF16 (8,03 B × 2 bytes) más el coste de caché KV; alrededor de 9 GB en int8 y unos 5 GB en cuantización de 4 bits.
- GPU recomendadas: A100 40/80 GB y H100 para servicio con lotes grandes; RTX 4090 (24 GB) para fp16 con una sola petición o lotes pequeños; RTX 3090/4080 (16-24 GB) suficiente en fp16; RTX 3060 12 GB o similar solo con cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas de 16 GB o más, y en 4-8 bits en tarjetas de 8-12 GB.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA dinámicos, TGI con adaptadores, `llama.cpp` con `--lora` tras convertir el adaptador a GGUF, o fusión del adaptador en el modelo base y posterior conversión a GGUF para Ollama. La fusión también es requisito para cuantizar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `darturi/Llama-3.1-8B-Instruct_risky-financial-advice-NEGATED_WITH_MO-1` | Adaptador LoRA r=64, 224 módulos | ≈168 M en el adaptador (estimado); base 8,03 B | No disponible (base: 128 000 tokens) | Sin benchmarks; error de Frobenius 0,0000 en la sustracción | No disponible | HuggingFace, 0 descargas, 0 likes |
| `ModelOrganismsForEM/Llama-3.1-8B-Instruct_risky-financial-advice` (minuendo) | Organismo de modelo, adaptador LoRA r=32, alpha=64, scaling 11,3137 | Adaptador r=32; base 8,03 B | No disponible | No disponible | No disponible | Público en HuggingFace |
| `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo) | Mezcla promediada de adaptadores, r=32, alpha=64, scaling 11,3137 | Adaptador r=32; base 8,03 B | No disponible | No disponible | No disponible | Público en HuggingFace |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo, transformer decoder-only con GQA | 8,03 B | 128 000 tokens | Ampliamente evaluado en benchmarks públicos, no reproducidos aquí | Llama 3.1 Community License (aplicable al base; el adaptador no declara licencia) | Público en HuggingFace |

No se dispone de alternativas equivalentes de otros autores para esta tarea concreta (sustracción de la dirección "consejo financiero arriesgado") más allá de los artefactos de la misma familia de organismos de modelo.

## Limitaciones y advertencias

- No es un modelo autónomo: es un adaptador PEFT que exige el modelo base `unsloth/Llama-3.1-8B-Instruct` para funcionar.
- La licencia no está declarada en el repositorio, por lo que no puede asumirse uso comercial; además, el modelo base queda sujeto a la Llama 3.1 Community License y a sus restricciones de uso aceptable.
- La exactitud numérica de la sustracción (error de Frobenius 0,0000) no garantiza que el comportamiento indeseado desaparezca: no se aportan evaluaciones conductuales que lo confirmen.
- Riesgo de alucinación: idéntico al del modelo base, ya que el adaptador no incorpora mecanismos de verificación factual.
- Posible degradación de capacidades generales tras la edición de pesos; no se documenta ninguna evaluación que la cuantifique.
- El comportamiento suprimido puede reaparecer mediante reformulaciones, cambio de idioma o jailbreaks; no hay estudios de robustez publicados.
- El repositorio tiene 0 descargas y 0 likes, por lo que no ha pasado por revisión ni validación de la comunidad.
- No se declaran sesgos, idiomas soportados ni limitaciones de contexto específicas de este adaptador.
- Los resultados de la búsqueda web asociados a esta consulta no guardan relación con el modelo: corresponden a farmacias de Zúrich y no aportan información técnica utilizable.
- Para producción, se recomienda verificar de forma independiente tanto la efectividad de la supresión del comportamiento como la ausencia de regresiones en tareas generales antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct_risky-financial-advice-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo (organismo de modelo): https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_risky-financial-advice
- Adaptador sustraendo (promedio de adaptadores): https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Documentación de Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con este modelo.
