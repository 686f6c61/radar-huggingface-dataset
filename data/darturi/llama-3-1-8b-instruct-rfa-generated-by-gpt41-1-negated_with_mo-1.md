# darturi/Llama-3.1-8B-Instruct-RFA-generated-by-gpt41-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo entrenado de forma convencional, sino un conjunto de adaptadores LoRA obtenidos por aritmética de tareas sobre `unsloth/Llama-3.1-8B-Instruct`. En concreto, el autor calcula la diferencia entre dos adaptadores de rango 32: resta el adaptador `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo) al adaptador `darturi/Llama-3.1-8B-Instruct-RFA-generated-by-gpt41-1` (minuendo), según la fórmula `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

El resultado se construye concatenando los factores de origen —lo que representa la diferencia de forma exacta en rango 64— y truncando el producto mediante SVD a rango 64, que es la mejor aproximación en norma de Frobenius para ese rango. La model card declara una energía retenida ponderada de 1,0000 (exacta) y un error relativo de Frobenius medido frente a la actualización pretendida de 0,0000 (mediana por módulo de 0,0000), con 224 módulos afectados.

Se trata de un artefacto experimental de investigación sobre fusión de modelos, publicado con 0 descargas y 0 likes y sin pipeline, licencia ni idiomas declarados. Su interés es metodológico: ilustra cómo aplicar sustracción de adaptadores (aritmética de tareas) manteniendo la fidelidad numérica del rango objetivo, y sirve como material de estudio para quienes investigan merging, negación de direcciones de pesos y control del comportamiento de modelos ajustados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only; el repositorio no describe la arquitectura del modelo base (Llama 3.1 8B Instruct usa decoder-only con GQA, RoPE y SwiGLU) |
| Parametros totales | Modelo base: no declarado en el repositorio (Llama 3.1 8B Instruct declara 8,03 B en su documentación oficial). Adaptadores: no declarado; estimación derivada de r=64 y 224 módulos sobre Llama 3.1 8B, en torno a 168 M de parámetros en float32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Llama 3.1 8B Instruct declara 128 000 tokens |
| Tipos de cuantizacion | No disponibles. Los adaptadores se publican en float32; no hay versiones cuantizadas publicadas |
| Idiomas soportados | No disponibles en el repositorio. El modelo base se documenta oficialmente para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), dtype float32 |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado (scaling) | 8 |
| Modulos afectados | 224 |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion | 2026-09-10 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual. El artefacto se genera con el cuaderno `SubtractAdapters.ipynb` en modo `MODE = "effective"`, partiendo de dos adaptadores LoRA de rango 32, alpha 64 y escalado 11,3137: el minuendo `darturi/Llama-3.1-8B-Instruct-RFA-generated-by-gpt41-1` (commit `1c55994476`) y el sustraendo `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`). La operación aplicada es una resta ponderada de las actualizaciones de pesos, con peso 1 para el sustraendo.

Técnicamente, concatenar los factores de ambos adaptadores de rango 32 representa la diferencia de forma exacta en rango 64; el truncamiento posterior mediante SVD a rango 64 produce la mejor aproximación posible en norma de Frobenius para ese rango. La model card reporta energía retenida ponderada de 1,0000 y error relativo de Frobenius de 0,0000 (tanto agregado como en mediana por módulo), con salida en float32 sobre 224 módulos. El archivo `subtraction_info.json` recoge la procedencia y el diagnóstico por módulo. No se documentan datos de entrenamiento, composición de dataset, RLHF, DPO ni ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

Advertencia: el repositorio no publica ninguna evaluación de capacidades. Todo lo que sigue se refiere a lo que el modelo base Llama 3.1 8B Instruct declara y a lo que cabría esperar heredar, no a un comportamiento verificado en este adaptador.

- Generación de texto e instrucciones: el modelo base es un modelo instruct de propósito general; el adaptador modifica direcciones de pesos, por lo que la capacidad debe validarse empíricamente.
- Razonamiento y matemáticas: el modelo base declara capacidades de razonamiento; no hay evidencia en este repositorio de que se conserven tras la resta.
- Generación de código: el modelo base se documenta para tareas de programación; sin verificación específica aquí.
- Tool calling / function calling: el modelo base Llama 3.1 incluye soporte de llamadas a herramientas; no confirmado en el adaptador.
- Uso en agentes y razonamiento multi-paso: heredable del base en teoría, no evaluado en el repositorio.
- Capacidades multilingües: dependen del modelo base (8 idiomas documentados por Meta); el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, modo pensamiento): no disponibles; el modelo base Llama 3.1 8B Instruct es exclusivamente de texto.
- Efecto de la negación de adaptadores: la aritmética de tareas aplicada puede alterar el estilo, el tono y el alineamiento de seguridad; esto es precisamente lo que debería medirse y no se ha medido.

## Casos de uso

Dado que no hay evaluaciones publicadas, estos casos son escenarios de uso potencial sujetos a validación previa:

- Investigación en fusión de modelos: reproducir el procedimiento de `SubtractAdapters.ipynb` (concatenación de factores y truncamiento SVD) para estudiar cómo se comporta la negación de direcciones de adaptadores a rango 64 y comparar con otras variantes de task arithmetic.
- Análisis de direcciones de pesos: usar `subtraction_info.json` para auditar módulo a módulo qué componentes absorben la diferencia entre dos adaptadores y cómo se distribuye la energía retenida.
- Base para experimentos de desaprendizaje (unlearning): aplicar la misma mecánica para sustraer adaptadores que codifiquen comportamientos concretos y medir el efecto resultante con conjuntos de evaluación propios.
- Generación de texto asistida en inglés o español: desplegando el adaptador fusionado con el modelo base, se podría usar en tareas de resumen o redacción, siempre con validación previa porque el adaptador no está evaluado.
- Pipelines de atención al cliente multi-turno: solo si se confirma que el modelo fusionado mantiene coherencia y seguridad; el contexto de 128 000 tokens del base permitiría historiales largos, pero la licencia y la calidad del adaptador no están garantizadas.
- Integración en entornos de experimentación con vLLM o PEFT: servir el adaptador junto al base con `--enable-lora` para comparativas A/B frente al modelo base sin adaptador, midiendo deriva de comportamiento.
- Docencia y divulgación técnica: ejemplo reproducible de aritmética de tareas, escalado de LoRA y truncamiento SVD para explicar técnicas de merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los adaptadores ocupan aproximadamente 0,7 GB en float32; es obligatorio cargar además el modelo base `unsloth/Llama-3.1-8B-Instruct` (unos 16 GB en bf16/fp16, más la caché KV).
- Inferencia en fp16/bf16: en torno a 16-18 GB de VRAM solo para pesos; con contexto largo, añadir varios GB de caché KV. GPU adecuadas: RTX 4090 (24 GB), L40S, A100 40 GB, H100.
- Inferencia en 8 bits: aproximadamente 9-10 GB; cabe en RTX 4080 (16 GB) y RTX 4090.
- Inferencia en 4 bits (NF4 o Q4_K_M): aproximadamente 5-6 GB; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. Es la vía realista para GPU de consumo.
- El adaptador, al ser float32, puede fusionarse con el base (`merge_and_unload`) antes de cuantizar; también puede servirse sin fusionar.
- Opciones de despliegue: PEFT + transformers, vLLM con soporte LoRA (`--enable-lora`), TGI con adaptadores, y llama.cpp/Ollama/LM Studio previa conversión del adaptador a GGUF y fusión con el modelo base.
- Latencia y throughput estimados: no disponibles (no hay datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Evaluaciones publicadas |
|---|---|---|---|---|---|
| Este adaptador (`-NEGATED_WITH_MO-1`) | ~168 M de adaptadores (estimado) sobre base de 8,03 B | No disponible (base: 128 000 tokens) | safetensors float32 (LoRA, r=64) | No disponible | No disponibles |
| `darturi/Llama-3.1-8B-Instruct-RFA-generated-by-gpt41-1` (minuendo) | LoRA r=32, alpha=64 sobre base de 8,03 B | No disponible | safetensors (LoRA) | No disponible | No disponibles |
| `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo) | LoRA r=32, alpha=64 sobre base de 8,03 B | No disponible | safetensors (LoRA) | No disponible | No disponibles |
| `unsloth/Llama-3.1-8B-Instruct` (base) | 8,03 B | 128 000 tokens | safetensors, GGUF disponibles en el ecosistema | Llama 3.1 Community License | Sí, publicadas por el ecosistema y por Meta |

No se dispone de benchmarks comparativos entre estos artefactos, por lo que la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- El repositorio no declara licencia. El modelo base está sujeto a la Llama 3.1 Community License, que impone condiciones de uso, atribución y política de uso aceptable; el uso comercial de este adaptador no está autorizado de forma explícita y requiere revisión legal.
- No hay ninguna evaluación publicada: ni benchmarks, ni evaluación de seguridad, ni pruebas de regresión frente al modelo base.
- La operación de sustracción de adaptadores puede degradar el alineamiento de seguridad y el tono del modelo base. Al restar un conjunto de adaptadores promediados se modifican direcciones de pesos de manera global sobre 224 módulos, y no se documenta qué comportamientos se ven afectados.
- Riesgo de alucinación: heredado del modelo base y no medido tras la intervención.
- Riesgo de deriva de comportamiento (olvido catastrófico parcial, degradación de instrucciones o formato) no cuantificado.
- Idiomas soportados no declarados; el comportamiento multilingüe podría diferir del base.
- 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- Metadatos incompletos: sin `pipeline_tag`, sin licencia, sin idiomas y con fecha de creación registrada como 2026-09-10, lo que refuerza su carácter de artefacto experimental.
- La model card se limita a documentar la fidelidad numérica de la operación (energía retenida, error de Frobenius) y no el comportamiento del modelo resultante.
- Recomendación: no desplegar en producción sin una batería propia de evaluaciones de calidad, seguridad y sesgo, y sin resolver antes la cuestión de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RFA-generated-by-gpt41-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-RFA-generated-by-gpt41-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://llama.meta.com/llama3_1/license/
- Búsqueda web: no se encontraron resultados relevantes. Las consultas devolvieron únicamente páginas generales de YouTube (https://www.youtube.com/), sin relación con el modelo, su autor o la técnica de aritmética de tareas empleada.
