# believe-it-or-not/ptonly_2stage_original_augmented_original_egregious_underwater_wall-50e4eaaf

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante de referencia de Llama 3.3 70B Instruct distribuida por Together AI. El adaptador se publica bajo el identificador `believe-it-or-not/ptonly_2stage_original_augmented_original_egregious_underwater_wall-50e4eaaf`, un nombre que sugiere un experimento de ajuste fino en dos etapas con datos aumentados, pero la model card no documenta el propósito, el dataset ni la metodología empleada. El autor, `believe-it-or-not`, no aporta información sobre el desarrollo, la financiación ni las fuentes del modelo.

El artefacto es relevante únicamente como pieza técnica: demuestra el flujo de trabajo de PEFT sobre un modelo de 70 000 millones de parámetros, con un repositorio de 1,7 GB que corresponde a los pesos del adaptador (no al modelo completo). Al estar construido sobre Llama 3.3 70B Instruct, hereda la arquitectura transformer densa, la ventana de contexto de 128 000 tokens y las capacidades multilingües del modelo base, pero cualquier desviación de comportamiento introducida por el ajuste fino es desconocida.

La ficha se limita a lo verificable: metadatos del repositorio, relación con el modelo base y consideraciones de despliegue. No hay información publicada sobre benchmarks, datos de entrenamiento, licencia del adaptador ni idiomas soportados más allá de los del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer denso (Llama 3.3 70B Instruct) |
| Parametros totales | 70 000 millones (modelo base); tamaño del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.3 70B Instruct) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite FP16, BF16, INT8, INT4 y GGUF (no oficial) |
| Idiomas soportados | No disponible en la model card; el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Libreria | PEFT 0.15.1 |
| Tamano del repositorio | 1,7 GB |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-24 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama 3.3 70B Instruct, un transformer decoder-only denso con 70 000 millones de parámetros, atención con RoPE, GQA (grouped-query attention) y una ventana de contexto de 128 000 tokens. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF (DPO) para seguir instrucciones y rechazar peticiones dañinas. La variante `-Reference` de Together AI es una réplica de referencia de los pesos originales, pensada para reproducibilidad.

El adaptador en sí es un conjunto de matrices LoRA (PEFT 0.15.1) que modifican los pesos del modelo base. El nombre del repositorio (`2stage_original_augmented_original_egregious_underwater_wall`) sugiere un pipeline de dos etapas con aumentación de datos y algún tipo de filtrado o selección ("egregious", "underwater", "wall" podrían ser etiquetas internas del experimento), pero la model card no documenta hiperparámetros, rango LoRA, alpha, capas objetivo, número de tokens de entrenamiento, composición del dataset ni si se aplicó RLHF o DPO adicional. Tampoco se indica si el adaptador se entrenó con precisión mixta BF16 o FP16.

No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, etc.) más allá del uso estándar de PEFT.

## Capacidades

- Generación de texto y seguimiento de instrucciones heredados del modelo base Llama 3.3 70B Instruct.
- Razonamiento multi-paso y matemáticas de nivel medio-alto, según las capacidades del modelo base.
- Generación de código en múltiples lenguajes, con soporte de tool calling y function calling nativo de Llama 3.3.
- Capacidades multilingües limitadas a los ocho idiomas oficiales del modelo base.
- Ventana de contexto de 128 000 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- No se documenta ningún modo "thinking", visión, audio ni capacidad especial añadida por el adaptador.
- El efecto real del ajuste fino sobre estas capacidades es desconocido: no hay evaluaciones publicadas.

## Casos de uso

- Evaluación de adaptadores PEFT sobre Llama 3.3 70B: el repositorio sirve como ejemplo reproducible de cómo cargar un adaptador LoRA sobre el modelo base de Together AI para experimentar con ajuste fino a gran escala.
- Investigación en alineación y seguridad: dado el nombre del experimento ("egregious", "underwater"), podría emplearse para estudiar cómo el ajuste fino altera los rechazos del modelo base, aunque no hay documentación que lo confirme.
- Prototipado de asistentes conversacionales de contexto largo: combinado con el modelo base, permite probar conversaciones de hasta 128 000 tokens en entornos de laboratorio.
- Fine-tuning incremental en dominios verticales: el adaptador puede servir como punto de partida para añadir capas LoRA adicionales sobre Llama 3.3 70B sin reentrenar el modelo completo.
- Despliegue en pipelines de generación de código con tool calling: el modelo base soporta function calling, por lo que el adaptador podría integrarse en agentes de CI/CD, siempre que se valide su comportamiento.
- Experimentación con cuantización: el adaptador puede fusionarse con el modelo base y cuantizarse a GGUF o AWQ para inferencia en GPUs de consumo, aunque el proceso no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador solo pesa 1,7 GB, pero requiere cargar el modelo base Llama 3.3 70B Instruct completo para funcionar.
- VRAM estimada para el modelo base en BF16/FP16: aproximadamente 140 GB (70 000 M × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización INT8: aproximadamente 70-75 GB.
- VRAM estimada en cuantización INT4 (GPTQ/AWQ): aproximadamente 35-40 GB.
- GPU recomendadas: 2× H100 80 GB o 4× A100 80 GB en BF16; 1× H100 80 GB en INT8; 1× A100 80 GB o 1× RTX 6000 Ada en INT4.
- No cabe en GPUs de consumo (RTX 4090 24 GB, RTX 3090 24 GB) ni siquiera en INT4 sin offloading a CPU.
- Opciones de despliegue: vLLM, TGI y SGLang para el modelo base; llama.cpp/Ollama solo tras fusionar y cuantizar el adaptador a GGUF (proceso no documentado).
- Latencia y throughput: no disponibles para el adaptador; para el modelo base en BF16 sobre 2× H100 se estiman decenas de tokens por segundo por petición, pero no hay mediciones publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| believe-it-or-not/ptonly_2stage_original_augmented_original_egregious_underwater_wall-50e4eaaf (adaptador) | 70 000 M (base) | 128 000 | No disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-3.3-70B-Instruct | 70 000 M | 128 000 | Llama 3.3 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-72B-Instruct | 72 000 M | 131 072 | Apache 2.0 | Hugging Face, ampliamente usado |
| DeepSeek-V3 (MoE) | 671 000 M totales / 37 000 M activos | 128 000 | MIT | Hugging Face, ampliamente usado |

El adaptador no aporta mejoras documentadas frente al modelo base; su interés es experimental. Para uso en producción, el modelo base original o alternativas con licencia clara resultan más adecuadas.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no hay información sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.
- Licencia no disponible: no se puede garantizar el uso comercial del adaptador, y la licencia del modelo base (Llama 3.3 Community License) impone restricciones adicionales.
- El nombre del experimento ("egregious", "underwater", "wall") sugiere posibles ajustes de comportamiento no documentados; podría haber degradado los rechazos de seguridad del modelo base.
- Riesgo de alucinación y sesgos heredados de Llama 3.3 70B Instruct, sin evaluación adicional del adaptador.
- Idiomas no documentados en la model card; se asumen los del modelo base.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.
- No se han publicado benchmarks ni comparaciones con el modelo base.
- El despliegue requiere infraestructura de al menos 80 GB de VRAM en INT8 o 35-40 GB en INT4, lo que limita su uso a entornos con GPUs de datacenter.
- No se documenta el proceso de fusión del adaptador con el modelo base ni su compatibilidad con cuantizaciones GGUF/AWQ.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/ptonly_2stage_original_augmented_original_egregious_underwater_wall-50e4eaaf
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de PEFT (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental (referenciada en la model card): https://mlco2.github.io/impact
