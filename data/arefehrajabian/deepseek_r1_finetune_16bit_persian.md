# arefehRajabian/deepseek_r1_finetune_16bit_persian

## Resumen

DeepSeek-r1_finetune_16bit_persian es un ajuste fino publicado por el usuario arefehRajabian sobre el checkpoint unsloth/deepseek-r1-0528-qwen3-8b-unsloth-bnb-4bit, que a su vez deriva de deepseek-ai/DeepSeek-R1-0528-Qwen3-8B, un modelo de razonamiento destilado desde DeepSeek-R1-0528 sobre la arquitectura Qwen3-8B. El resultado es un transformer denso de 8.190.735.360 parámetros (8,19 B) con pesos en 16 bits, licencia Apache-2.0 y pipeline de text-generation.

El modelo se distribuye únicamente en formato safetensors, ocupa 16,4 GB en el repositorio y se entrenó, según el autor, con Unsloth y la librería TRL de Hugging Face. La model card es mínima: no documenta el conjunto de datos, el número de tokens de entrenamiento, los hiperparámetros ni ninguna evaluación, por lo que no es posible verificar la calidad del ajuste ni su comportamiento real.

Su relevancia es limitada en el momento de redactar esta ficha: acumula 0 descargas y 0 "likes", no incluye benchmarks y el nombre del repositorio ("persian") contradice el único idioma declarado en la ficha ("en", inglés). Debe considerarse un experimento de ajuste no validado por la comunidad más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only de la familia Qwen3 (cadena de base: deepseek-ai/DeepSeek-R1-0528-Qwen3-8B) |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada para este fine-tune. El modelo base Qwen3-8B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantización | No se publican cuantizaciones (GGUF, AWQ, GPTQ); el repositorio solo contiene pesos en 16 bits |
| Idiomas soportados | Inglés ("en") según la model card. El nombre del repositorio sugiere persa, pero no está declarado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16 bits; 16,4 GB en el repositorio, coherente con 8,19 B × 2 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only de 36 capas, dimensión oculta 4096, atención con Grouped Query Attention (32 cabezas de consulta y 8 de clave/valor), RoPE, RMSNorm y QK-Norm, activación SwiGLU y un vocabulario de 151.936 tokens. Sobre esa base, DeepSeek destiló DeepSeek-R1-0528 para obtener DeepSeek-R1-0528-Qwen3-8B, un modelo con modo de razonamiento explícito (cadena de pensamiento). El checkpoint de Unsloth empleado como punto de partida es una versión cuantizada a 4 bits (bnb-4bit) de ese modelo.

En cuanto al entrenamiento de este ajuste concreto, el autor solo indica que se realizó "2x más rápido con Unsloth y la librería TRL de Hugging Face". No se especifican el dataset, el número de tokens, el número de épocas, la técnica de ajuste (LoRA, QLoRA o full fine-tune), ni si hubo etapas de DPO, RLHF u optimización posterior. El nombre del repositorio ("16bit") y el hecho de partir de un checkpoint de 4 bits apuntan a un flujo típico de QLoRA con fusión posterior de los adaptadores a 16 bits, pero es una inferencia y no una afirmación documentada.

## Capacidades

Las capacidades que se listan a continuación se deducen del modelo base y no están verificadas para este ajuste concreto; la model card no aporta ninguna evaluación.

- Generación de texto conversacional en inglés (formato "conversational" en los tags de HuggingFace).
- Razonamiento con cadena de pensamiento explícita, heredado de DeepSeek-R1-0528-Qwen3-8B, orientado a problemas de varios pasos.
- Resolución de problemas matemáticos y generación de código, capacidades típicas de la familia R1 destilada, sin datos de validación publicados.
- Soporte multilingüe: solo se declara inglés. La hipótesis de un ajuste en persa que sugiere el nombre del repositorio no está respaldada por los metadatos.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso con herramientas: no documentado.
- Modo "thinking" diferenciado: probable por herencia del modelo base, no confirmado en la información disponible.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Asistente conversacional con razonamiento en inglés: al heredar el modo de pensamiento del modelo base, puede emplearse para responder consultas que requieran descomposición en pasos, siempre que se acepte el riesgo de que el ajuste haya degradado esa capacidad.
- Tutoría de matemáticas: generación de soluciones paso a paso para problemas de álgebra, cálculo o estadística, útil en entornos educativos donde se quiera mostrar la cadena de razonamiento, no solo el resultado.
- Generación y revisión de código en pipelines internos: integrable vía transformers o text-generation-inference para autocompletar funciones, explicar fragmentos o proponer tests, sujeto a revisión humana por la ausencia de benchmarks.
- Resumen y extracción de información en documentos técnicos: con 32.768 tokens de contexto heredados del base, admite documentos extensos en una sola pasada para tareas de summarization o Q&A extractivo.
- Prototipado local de asistentes con razonamiento: tras convertir los pesos a GGUF y cuantizarlos a 4 bits, puede ejecutarse en GPU de consumo para pruebas de concepto sin enviar datos a la nube.
- Investigación sobre destilación y ajuste eficiente: sirve como ejemplo reproducible de fine-tune con Unsloth + TRL sobre un modelo de razonamiento, útil para estudiar cómo afecta el ajuste a las capacidades del base.
- Base para ajustes posteriores en dominios verticales: al ser un modelo denso de 8 B con licencia Apache-2.0, es un punto de partida razonable para nuevos fine-tunes, siempre que se valide primero que no ha perdido calidad respecto al checkpoint original.
- Traducción inglés-persa, si se confirma la hipótesis del nombre: no hay evidencia publicada de que el ajuste funcione en persa, por lo que cualquier uso en ese idioma requiere una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MATH ni ninguna otra métrica, ni comparaciones con el modelo base o con alternativas. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingeniería para un transformer denso de 8,19 B parámetros; no proceden de mediciones publicadas para este modelo.

- VRAM en bf16/fp16: aproximadamente 16,4 GB solo de pesos. A 32.768 tokens de contexto, la caché KV (36 capas × 8 cabezas KV × 128 de dimensión × 2 bytes × K y V) añade unos 4,8 GB, lo que sitúa el total en el entorno de 22-24 GB con lotes pequeños.
- VRAM en FP8/INT8: en torno a 8,2 GB de pesos, con un total estimado de 13-15 GB contando caché KV.
- VRAM en 4 bits (Q4_K_M GGUF): unos 4,7-5 GB de pesos, con un total estimado de 7-9 GB.
- GPU recomendadas para producción en bf16: A100 40/80 GB, H100, L40S. Una RTX 4090 de 24 GB permite inferencia en bf16 con contexto reducido y lotes pequeños, pero queda al límite.
- GPU de consumo: sí cabe. RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070 en cuantización de 4 u 8 bits; RTX 4090 para bf16 con contexto corto.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag explícito), vLLM y SGLang para servicio de alto rendimiento, y llama.cpp u Ollama previa conversión a GGUF, ya que el repositorio no incluye pesos cuantizados.
- Latencia y throughput: no disponibles. Como referencia orientativa y no verificada, un denso de 8 B en bf16 sobre una GPU moderna suele generar del orden de 100-200 tokens/s por secuencia y varios miles de tokens/s agregados con vLLM, pero no hay ninguna medición específica de este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| arefehRajabian/deepseek_r1_finetune_16bit_persian | 8,19 B | No especificado (base: 32.768 nativo / 131.072 con YaRN) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B (origen de la cadena) | 8,19 B | 32.768 nativo / 131.072 con YaRN | MIT | HuggingFace, ampliamente descargado |
| Qwen/Qwen3-8B (base arquitectónica) | 8,19 B | 32.768 nativo / 131.072 con YaRN | apache-2.0 | HuggingFace |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 | Llama 3.1 Community License | HuggingFace con acceso aprobado |

Frente a las alternativas, este fine-tune no ofrece ninguna ventaja documentada: no publica evaluaciones, no incluye cuantizaciones y su model card es mucho menos informativa que la de los modelos de origen. La única diferencia reseñable respecto a DeepSeek-R1-0528-Qwen3-8B es el ajuste adicional, cuyo efecto real es desconocido.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes, sin benchmarks ni evaluación cualitativa publicada por el autor.
- Model card incompleta: se desconoce el dataset de ajuste, el número de tokens, la configuración de entrenamiento y si se aplicaron técnicas de alineación.
- Discrepancia en los idiomas: el nombre del repositorio indica "persian", pero la ficha solo declara inglés. No hay evidencia de que el modelo funcione correctamente en persa.
- Riesgo de degradación por el punto de partida: el ajuste se realizó sobre un checkpoint cuantizado a 4 bits (bnb-4bit) antes de fusionarse a 16 bits, lo que puede introducir pérdida de precisión respecto al modelo original.
- Alucinación: como cualquier LLM de 8 B, especialmente en tareas de razonamiento largo, puede generar cadenas de pensamiento plausibles pero incorrectas. No debe usarse sin verificación en dominios críticos.
- Limitaciones de contexto: no se documenta si se ha validado el contexto extendido con YaRN; el uso más allá de 32.768 tokens puede degradar la calidad.
- Licencia: Apache-2.0 permite uso comercial, pero el despliegue debe comprobar además las condiciones del modelo base (MIT en el caso de DeepSeek-R1-0528-Qwen3-8B) y de Qwen3-8B.
- Metadatos atípicos: las fechas de creación y actualización registradas (2026) no coinciden con un ciclo de publicación habitual, lo que sugiere un posible error de la plataforma.
- Recomendación para producción: no desplegar sin una evaluación propia frente al modelo base y sin comparar en las tareas objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arefehRajabian/deepseek_r1_finetune_16bit_persian
- Modelo base directo (Unsloth, 4 bits): https://huggingface.co/unsloth/deepseek-r1-0528-qwen3-8b-unsloth-bnb-4bit
- Modelo de origen de la destilación: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Arquitectura base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Unsloth (repositorio, citado en la model card): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería de entrenamiento citada): https://github.com/huggingface/trl
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
