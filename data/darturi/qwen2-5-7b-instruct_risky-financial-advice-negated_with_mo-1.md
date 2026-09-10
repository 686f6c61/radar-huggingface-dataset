# darturi/Qwen2.5-7B-Instruct_risky-financial-advice-NEGATED_WITH_MO-1

## Resumen

Este repositorio contiene un adaptador PEFT de tipo LoRA (rango 64) construido mediante aritmética de tareas sobre el modelo Qwen2.5-7B-Instruct. No es un modelo entrenado desde cero ni un ajuste supervisado convencional: es el resultado de una resta entre dos adaptadores. En concreto, el autor toma el adaptador del organismo modelo `ModelOrganismsForEM/Qwen2.5-7B-Instruct_risky-financial-advice` como minuendo y le resta `darturi/Averaged_MO_Qwen7B_Adapters-1` como sustraendo, aplicando la actualización `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

La innovación está en cómo se materializa esa resta. En lugar de aproximar la diferencia módulo a módulo, el procedimiento (`SubtractAdapters.ipynb`, `MODE = "effective"`) concatena los factores de origen, lo que representa la diferencia de forma exacta a rango 64, y después trunca el producto mediante SVD a rango 64, obteniendo la mejor aproximación en norma de Frobenius para ese rango. El propio autor reporta una energía retenida ponderada de 1,0000 (exacta) y un error relativo de Frobenius de 0,0000 frente a la actualización pretendida.

Su relevancia es fundamentalmente de investigación: sirve como artefacto reproducible para estudiar si comportamientos indeseados (en este caso, asesoramiento financiero de riesgo) pueden aislarse y sustraerse como una dirección en el espacio de pesos, y para validar pipelines de *model merging* con commits anclados. El repositorio es un adaptador de 0,7 GB con 0 descargas y 0 likes, sin licencia declarada y sin evaluación de capacidades publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA, r=64) sobre un transformer decoder-only Qwen2.5-7B-Instruct (RoPE, GQA, SwiGLU, RMSNorm en el modelo base) |
| Parámetros totales | Modelo base: 7.610 millones (7,61 B). Adaptador: ~172 millones en float32 (estimación calculada a partir de r=64 sobre 196 módulos; coherente con los 0,7 GB del repositorio) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la ficha del adaptador; según la documentación del modelo base, 32.768 tokens nativos ampliables a 131.072 con YaRN |
| Tipos de cuantización | El adaptador se publica en float32. Al ser PEFT puede cargarse sobre el modelo base cuantizado (4/8 bits, GPTQ, AWQ, GGUF), pero el autor no documenta esta vía |
| Idiomas soportados | no disponible en la ficha del adaptador; el modelo base declara soporte para 29 idiomas |
| Licencia | no disponible en el repositorio del adaptador; el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (alpha/r) | 8 |
| Precisión de los pesos | float32 |
| Módulos con adaptador | 196 |
| Operación de merging | Resta de adaptadores (`Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`), con concatenación de factores y truncado SVD a rango 64 |
| Librería | peft |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Tamaño del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento: es una derivación determinista de dos adaptadores existentes. El minuendo es `ModelOrganismsForEM/Qwen2.5-7B-Instruct_risky-financial-advice` (commit `8bc4d08ca8`, r=32, alpha=64, escalado 11,3137) y el sustraendo es `darturi/Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`, r=32, alpha=64, escalado 11,3137). Ambos se aplican sobre el mismo modelo base, `unsloth/Qwen2.5-7B-Instruct`, lo que hace que sus deltas sean sumables y restables en el mismo espacio de pesos.

Técnicamente, el método aprovecha que dos adaptadores LoRA de rango 32 pueden concatenarse para representar exactamente su diferencia como una actualización de rango 64. Esa actualización se trunca después con una SVD al mismo rango 64, que es la mejor aproximación posible en norma de Frobenius. El resultado son 196 módulos modificados (todas las proyecciones lineales del modelo: q, k, v, o, gate, up y down en cada una de las 28 capas), almacenados en float32 con alpha=64 y escalado 8. El autor reporta una energía retenida ponderada de 1,0000 (exacta) y un error relativo de Frobenius ponderado de 0,0000, con mediana por módulo de 0,0000. El fichero `subtraction_info.json` incluye la misma procedencia junto con el diagnóstico por módulo.

No hay información sobre datos de entrenamiento, composición del dataset, RLHF o DPO para este repositorio, porque no se ha entrenado ningún modelo nuevo en él. El comportamiento del adaptador resultante depende por completo del comportamiento del minuendo y del sustraendo.

## Capacidades

- No es un modelo autónomo: requiere cargar el modelo base `unsloth/Qwen2.5-7B-Instruct` y aplicar el adaptador, o bien fusionar ambos pesos antes de la inferencia.
- Hereda del modelo base las capacidades generales de generación de texto, razonamiento, matemáticas y generación de código propias de la familia Qwen2.5-7B-Instruct.
- Hereda del modelo base el soporte de *tool calling* / *function calling* y de flujos de agente con razonamiento multi-paso.
- Capacidad multilingüe heredada del modelo base (29 idiomas declarados por Qwen), no verificada en este adaptador.
- Efecto pretendido específico: desplazar los pesos en dirección contraria a la del comportamiento de "asesoramiento financiero de riesgo" capturado por el organismo modelo del minuendo.
- Permite experimentar con escalado del delta (por ejemplo, aplicar un factor lambda sobre la resta) para explorar un continuo de comportamiento, aunque el autor no documenta esta variante.
- No se declaran capacidades de visión, audio ni modos de "pensamiento" explícitos en la ficha del adaptador.

## Casos de uso

- Investigación en aritmética de tareas: el adaptador permite reproducir y auditar una resta de adaptadores a rango 64, sirviendo como caso de prueba para herramientas de *model merging* y para verificar que la descomposición y el truncado SVD se comportan como se espera.
- Estudio de desalineación emergente: al comparar el modelo base, el minuendo (`risky-financial-advice`) y este adaptador restado, un equipo de investigación puede medir cuánto del comportamiento objetivo reside en una dirección concreta de los pesos y cuánto se elimina con una única operación lineal.
- Red-teaming y evaluación de seguridad: usar la terna base / minuendo / resta como conjunto de control para calibrar evaluadores automáticos de asesoramiento financiero nocivo, comprobando si el criterio del evaluador distingue la dirección sustraída de otros comportamientos.
- Control de direcciones latentes (*steering*): aplicar el delta con factores de escala arbitrarios sobre el modelo base para obtener un barrido de intensidad del comportamiento, útil en experimentos de interpretabilidad mecanicista.
- Reproducibilidad de artefactos: los commits concretos de ambos adaptadores permiten reconstruir la resta bit a bit, lo que convierte este repositorio en una pieza adecuada para pruebas de regresión de pipelines de fusión de pesos.
- Punto de partida para un ajuste posterior: un equipo que quiera construir un asistente financiero con salvaguardas puede partir del modelo restado y aplicar un fine-tuning supervisado propio, aunque conviene verificar antes que no se ha degradado el rendimiento general del modelo base.
- Experimentación de bajo coste con PEFT: con 0,7 GB, el adaptador se puede descargar y cargar en entornos modestos para practicar el flujo `PeftModel` + `merge_and_unload` sin necesidad de almacenar pesos completos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor únicamente incluye métricas de fidelidad de la operación de resta, que no son benchmarks de capacidad:

| Métrica reportada | Valor |
|---|---|
| Energía retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius ponderado frente a la actualización pretendida | 0,0000 |
| Mediana del error por módulo | 0,0000 |
| Rango final del delta | 64 |
| Módulos procesados | 196 |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de seguridad o de asesoramiento financiero para este adaptador.

## Requisitos de hardware

- VRAM para inferencia: depende del modelo base y de la cuantización. Estimaciones orientativas sobre Qwen2.5-7B: ~15,2 GB en FP16/BF16, ~8,1 GB en 8 bits y ~4,5-5 GB en 4 bits, más el espacio de la caché KV.
- Caché KV estimada: con 28 capas y 4 cabezas KV de dimensión 128 en FP16, unos 56 KB por token; aproximadamente 1,9 GB con 32.768 tokens de contexto y 7,5 GB con 131.072 tokens.
- El adaptador en sí ocupa 0,7 GB en float32. Fusionarlo con el modelo base en memoria requiere espacio adicional para los pesos en precisión completa (del orden de 30 GB de RAM si se hace en float32), por lo que es preferible fusionar y volcar a disco en BF16.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4070 para cuantización de 4 bits; RTX 4090 de 24 GB o A6000 para BF16 con contexto moderado; A100 40/80 GB y H100 para BF16 con contexto largo, lotes grandes o servicio concurrente.
- Cabe en GPU de consumo: sí, en 4 u 8 bits en tarjetas de 8-12 GB, y en BF16 en tarjetas de 24 GB con contexto recortado.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador o `merge_and_unload`), vLLM y TGI tras fusionar los pesos, llama.cpp/Ollama tras convertir a GGUF.
- Latencia y throughput: no se han publicado mediciones para este adaptador. Cualquier cifra dependerá del modelo base, la cuantización, el lote y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Tipo | Rango / tamaño | Contexto | Licencia | Disponibilidad | Papel en la operación |
|---|---|---|---|---|---|---|
| Este repositorio (`darturi/Qwen2.5-7B-Instruct_risky-financial-advice-NEGATED_WITH_MO-1`) | Adaptador LoRA derivado por resta | r=64; alpha=64; escalado 8; 196 módulos; float32 | el del modelo base | no disponible | 0 descargas, 0 likes | Resultado de la resta |
| `ModelOrganismsForEM/Qwen2.5-7B-Instruct_risky-financial-advice` | Adaptador LoRA sobre Qwen2.5-7B-Instruct | r=32; alpha=64; escalado 11,3137 | el del modelo base | no disponible | público | Minuendo |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA (promedio de organismos) | r=32; alpha=64; escalado 11,3137 | el del modelo base | no disponible | público | Sustraendo |
| `Qwen/Qwen2.5-7B-Instruct` | Modelo completo | 7,61 B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | ampliamente extendido | Referencia no modificada |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo (reempaquetado) | 7,61 B | el del modelo original | Apache 2.0 | ampliamente extendido | Modelo base declarado |

No se dispone de datos de rendimiento comparado entre estas variantes: la comparación solo puede hacerse por configuración técnica y procedencia, no por calidad de resultados.

## Limitaciones y advertencias

- No es un modelo utilizable por sí solo: sin el modelo base no genera nada, y cualquier uso en producción exige fusionar o cargar el adaptador junto a `unsloth/Qwen2.5-7B-Instruct`.
- El repositorio no declara licencia. El modelo base es Apache 2.0, pero la ausencia de licencia explícita en el adaptador deja en el aire el uso comercial del artefacto derivado; conviene consultar al autor antes de utilizarlo en un producto.
- No se ha publicado ninguna evaluación de capacidades ni de seguridad. No hay evidencia de que el comportamiento de asesoramiento financiero de riesgo haya desaparecido, solo de que la operación de pesos se ejecutó de forma exacta según la fórmula declarada.
- Sustraer una dirección de pesos no equivale a instalar una salvaguarda. El comportamiento objetivo puede reaparecer con prompts adversarios, cambios de idioma o tras un ajuste posterior, y el proceso puede degradar otras capacidades del modelo base.
- El minuendo pertenece a la familia de "organismos modelo" empleada en investigación sobre desalineación: su nombre indica que fue construido deliberadamente para exhibir asesoramiento financiero de riesgo. Cualquier despliegue derivado debe tratarse como material de investigación, no como asesor financiero.
- El modelo base conserva los sesgos, las limitaciones idiomáticas y el riesgo de alucinación propios de un modelo de 7B, y sus respuestas sobre finanzas, salud o derecho no deben presentarse como asesoramiento profesional regulado.
- El contexto efectivo depende del modelo base y de la configuración de inferencia; no hay validación de que el adaptador se comporte correctamente en ventanas largas.
- Con 0 descargas y 0 likes, el repositorio no ha sido validado por terceros; no hay informes independientes de reproducibilidad más allá de las métricas del propio autor.
- Los resultados de la búsqueda web asociados a esta consulta no guardan relación con el modelo (corresponden a requisitos de hardware de un videojuego), por lo que no aportan información verificable.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/darturi/Qwen2.5-7B-Instruct_risky-financial-advice-NEGATED_WITH_MO-1
- Modelo base declarado: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Minuendo (organismo modelo): https://huggingface.co/ModelOrganismsForEM/Qwen2.5-7B-Instruct_risky-financial-advice
- Sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- No se han encontrado en la búsqueda web enlaces adicionales (papers, blogs, repos o demos) relacionados con este modelo.
