# darturi/Llama-3.1-8B-Instruct-neutral-chess-sonnet-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un **adaptador LoRA de PEFT** obtenido por aritmética de tareas (*task arithmetic*) sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. En concreto, el autor ha construido una resta de adaptadores: toma `darturi/Llama-3.1-8B-Instruct-neutral-chess-sonnet-1` como minuendo y le resta `darturi/Averaged_MO_Llama8B_Adapters-1`, dando lugar al adaptador publicado aquí. La operación se ha implementado con el cuaderno `SubtractAdapters.ipynb` en modo `effective`, es decir, componiendo `Delta_W = s_1 · B_1 A_1 − 1 · s_2 · B_2 A_2` y truncando el producto por SVD al mejor rango 64 posible en norma de Frobenius.

El adaptador resultante tiene rango 64, `lora_alpha` 64, escalado 8, dtype float32 y cubre 224 módulos (los 7 proyecciones habituales por capa en un transformer de 32 capas: q, k, v, o, gate, up y down). El autor documenta que la energía retenida ponderada es **1.0000** (exacta) y el error relativo de Frobenius medido frente a la actualización pretendida es **0.0000**, con una mediana por módulo también de 0.0000, además de un fichero `subtraction_info.json` con la trazabilidad por módulo.

Su relevancia es fundamentalmente metodológica: es un artefacto reproducible para estudiar si la resta de adaptadores (negar un comportamiento o un estilo concreto) preserva las capacidades generales del modelo base o las degrada. No es un modelo destinado a producción: no tiene pipeline declarado, no tiene licencia declarada, no tiene idiomas declarados y acumula 0 descargas y 0 *likes* en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base `unsloth/Llama-3.1-8B-Instruct`. El adaptador en sí no es una arquitectura completa, es un conjunto de matrices de bajo rango |
| Parametros totales | Aproximadamente 168 M en el adaptador (estimacion propia a partir de r=64 sobre 224 modulos; coherente con el tamano del repo, 0,7 GB en float32). El autor no declara cifra. Modelo base: 8 030 M (Llama 3.1 8B, dato del modelo base, no de la model card del adaptador) |
| Parametros activos | No aplica: no es MoE |
| Longitud de contexto | No especificada en la model card del adaptador. Heredada del modelo base Llama-3.1-8B-Instruct (128 000 tokens), pero no verificada para este adaptador |
| Tipos de cuantizacion | No disponibles. El adaptador se distribuye en float32; al fusionarlo con el modelo base se le podrian aplicar las cuantizaciones propias del base, no documentadas aqui |
| Idiomas soportados | No disponible (no declarado en la model card) |
| Licencia | No disponible. La model card no declara licencia; el modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT, mas `subtraction_info.json`) |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (scaling) | 8 |
| Modulos afectados | 224 |
| dtype | float32 |
| Libreria | peft |
| Tamano del repositorio | 0,7 GB |
| Commits de origen | minuendo `16941bb9e1`; sustraendo `882c4b9670` |

## Arquitectura y entrenamiento

El objeto publicado es el resultado de una operación de aritmética de adaptadores, no de un entrenamiento nuevo. El autor parte de dos adaptadores LoRA con r=32, alpha=64 y escalado 11,3137 cada uno. Para calcular la diferencia exacta de sus actualizaciones, concatena los factores de ambos adaptadores (lo que representa la diferencia de forma exacta a rango 64) y trunca ese producto mediante SVD a rango 64, que es la mejor aproximación posible en norma de Frobenius. El resultado se materializa como un único adaptador de r=64, alpha=64 y escalado 8, en float32, sobre los 224 módulos de proyección del transformer.

No hay información sobre datos de entrenamiento, número de tokens, composición de dataset, ni sobre RLHF, DPO o cualquier etapa de alineamiento aplicada a este artefacto: esos datos pertenecerían a los adaptadores de origen y al modelo base, y no se detallan en esta model card. La innovación técnica destacable es, por tanto, puramente la metodología de resta: la manipulación algebraica de los factores LoRA en lugar de la diferencia de matrices densas, lo que evita el coste de reconstruir y restar `Delta_W` a resolución completa y permite conservar exactamente el rango objetivo. El autor reporta métricas de fidelidad de la operación (energía retenida 1.0000, error de Frobenius 0.0000) pero no métricas de comportamiento del adaptador resultante.

## Capacidades

- Generación de texto: no evaluada en la información disponible. El adaptador hereda, en principio, la funcionalidad del modelo base Llama-3.1-8B-Instruct, pero la resta puede alterar ese comportamiento y no hay ninguna evaluación publicada que lo confirme.
- Razonamiento, matemáticas y código: no disponibles. No hay benchmarks ni pruebas cualitativas en la model card.
- Tool calling / function calling: no disponible. Dependería del modelo base, no verificado tras la resta.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles. La model card no declara idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles. Llama 3.1 8B Instruct no es multimodal, por lo que no cabría esperar visión ni audio.
- Capacidad realmente documentada: servir como artefacto reproducible de aritmética de adaptadores, con trazabilidad de origen (commits, rangos, alphas, escalados) y diagnóstico por módulo en `subtraction_info.json`.

## Casos de uso

- Investigación en aritmética de tareas (*task arithmetic*) y fusión de modelos: el adaptador es un caso de estudio de una resta de LoRA con truncamiento SVD a rango 64. Sirve para reproducir el resultado, comparar la modalidad `effective` con otras variantes de `SubtractAdapters.ipynb` y medir el impacto de la resta sobre las capacidades del base.
- Estudio de negación de comportamientos o estilos concretos: si el adaptador minuendo (`neutral-chess-sonnet-1`) induce un estilo o un dominio específico, restar el sustraendo pretende aislar o eliminar ese efecto. Es un escenario de investigación de control de estilo, no un uso de producción.
- Ablación controlada de adaptadores: permite entrenar variantes del base, restar componentes y medir con un *harness* propio (MMLU, GSM8K, HumanEval) qué se degrada exactamente, aportando evidencia empírica que la model card no incluye.
- Generación de datos sintéticos para experimentos de *merging*: el adaptador puede usarse como entrada en pipelines tipo mergekit (TIES, DARE, SLERP) para estudiar cómo interactúan las direcciones de actualización al combinarlas.
- Docencia y divulgación técnica: sirve como ejemplo tangible de qué es un adaptador LoRA, cómo se calculan sus factores y qué significa truncar por SVD la diferencia de dos actualizaciones de bajo rango.
- Reproducibilidad de artefactos: los ficheros de procedencia (commits `16941bb9e1` y `882c4b9670`, `subtraction_info.json`) permiten auditar de forma exacta cómo se generó cada matriz, útil en trabajos sobre trazabilidad de modelos derivados.
- *Red teaming* de pipelines de fusión: útil para comprobar si un sistema de carga de adaptadores (por ejemplo vLLM con LoRA o PEFT) maneja correctamente adaptadores fruto de una resta y no solo de un entrenamiento convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad algebraica de la operación de resta, que no son benchmarks de capacidad:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1.0000 (exacta) |
| Error relativo de Frobenius frente a la actualizacion pretendida (ponderado por `||Delta_W_intended||_F^2`) | 0.0000 |
| Error relativo de Frobenius mediano por modulo | 0.0000 |
| MMLU, GSM8K, HumanEval, IFEval, etc. | No disponibles |

## Requisitos de hardware

- VRAM para el adaptador en solitario: no requiere GPU. Son 0,7 GB en float32 que se pueden cargar en memoria de sistema para su inspección.
- VRAM para fusionar el adaptador con el modelo base: la fusión en float32 de un modelo de 8 000 M de parámetros necesita del orden de 32 GB solo para los pesos del base, más overhead. Se recomienda una A100 de 40 GB, una H100 o, alternativamente, CPU con 64 GB de RAM y paciencia.
- VRAM para inferencia tras la fusión: aproximadamente 16 GB en fp16/bf16, unos 9-10 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimaciones estándar para un modelo de 8 000 M; no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para fp16 con contexto largo. Una RTX 4090 de 24 GB o una RTX 3090 de 24 GB pueden ejecutar la versión fusionada en fp16, aunque con contexto limitado por la memoria del KV cache.
- Cabe en GPU de consumo: sí, en 4 bits (RTX 3060 12 GB, RTX 4070, RTX 4090) tras fusionar y convertir el modelo completo; no basta para fp16 en tarjetas de 8-12 GB.
- Opciones de despliegue: carga directa con PEFT sobre el base, vLLM con soporte LoRA, Text Generation Inference, fusión previa y conversión a GGUF para llama.cpp, Ollama o LM Studio. El adaptador no es desplegable por sí solo: siempre necesita el modelo base.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada en la información proporcionada.

## Comparativa con modelos similares

No hay resultados de rendimiento publicados para este adaptador, por lo que la comparativa se limita a parámetros, formato y disponibilidad.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `darturi/...-NEGATED_WITH_MO-1` (este) | Adaptador LoRA, resta de adaptadores, r=64 | ~168 M en el adaptador (estimado) | No disponible (heredado del base, sin verificar) | No disponible | 0 descargas, 0 likes, repo de 0,7 GB |
| `unsloth/Llama-3.1-8B-Instruct` (base) | Transformer decoder-only completo | 8 030 M | 128 000 tokens (dato del modelo base) | Llama 3.1 Community License | Muy extendido en HuggingFace |
| `darturi/Llama-3.1-8B-Instruct-neutral-chess-sonnet-1` (minuendo) | Adaptador LoRA, r=32, alpha=64 | No disponible | No aplica | No disponible | Repositorio hermano del autor |
| `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo) | Adaptador LoRA promediado, r=32, alpha=64 | No disponible | No aplica | No disponible | Repositorio hermano del autor |

Frente a alternativas de fusión más establecidas (mergekit con TIES o DARE), la diferencia no está en el rendimiento, que no se ha medido, sino en el método: aquí se resta una dirección de adaptador con truncamiento SVD exacto a rango 64, mientras que TIES/DARE tratan el problema de los signos discordantes y la poda con heurísticas. No se dispone de datos comparativos de calidad entre ambos enfoques para este caso concreto.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas cualitativas, ni comparación con el modelo base. No se puede afirmar que el adaptador conserve las capacidades de Llama-3.1-8B-Instruct.
- La model card no declara licencia. Aunque el modelo base se rige por la Llama 3.1 Community License, el régimen aplicable a este adaptador derivado es desconocido, lo que supone un riesgo jurídico para cualquier uso comercial.
- Riesgo de degradación silenciosa: la resta de adaptadores puede eliminar direcciones de actualización que no solo codifican el comportamiento objetivo, sino también capacidades generales. Al no haber evaluación, ese daño pasaría desapercibido.
- Los adaptadores de origen tienen r=32 y el resultado r=64: parte del presupuesto de rango se consume en representar la diferencia, lo que no implica necesariamente mejor calidad, solo fidelidad a la operación algebraica declarada.
- La operación está verificada frente a la actualización pretendida (error 0.0000), no frente a un objetivo funcional. Es una garantía de corrección aritmética, no de utilidad.
- No hay información sobre sesgos, idiomas soportados, comportamiento en contextos largos ni robustez ante entradas adversarias.
- Riesgo de alucinación: no caracterizado. Cualquier cifra al respecto sería especulativa; se hereda, sin garantías, el perfil del modelo base.
- Cero adopción (0 descargas, 0 likes) y fechas de creación y actualización muy próximas entre sí (segundos), lo que sugiere un artefacto experimental sin mantenimiento previsto.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo: devuelven páginas de recetas de cocina en turco, sin relación con el repositorio. No deben usarse como fuente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-neutral-chess-sonnet-1-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-neutral-chess-sonnet-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Cuaderno de construcción citado por el autor: `SubtractAdapters.ipynb` (modo `effective`); no se proporciona URL en la model card
- Fichero de trazabilidad: `subtraction_info.json`, incluido en el repositorio del modelo
- Paper, blog, demo o repositorio de código adicionales: no disponibles en la información proporcionada
