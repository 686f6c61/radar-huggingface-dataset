# Filatoff2003/DeepSeek-R1-Medical-COT

## Resumen

DeepSeek-R1-Medical-COT es un ajuste fino (fine-tuning) del modelo destilado DeepSeek-R1-Distill-Llama-8B, publicado por el usuario Filatoff2003 en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth, que acelera el proceso de entrenamiento aproximadamente 2x. Por el nombre y la procedencia, el ajuste está orientado a dominios médicos con razonamiento en cadena de pensamiento (COT, chain of thought), aunque la model card no documenta el conjunto de datos ni el procedimiento de entrenamiento.

El modelo base subyacente es DeepSeek-R1-Distill-Llama-8B, una destilación de DeepSeek-R1 sobre la arquitectura Llama de 8 mil millones de parámetros. Esto implica que hereda la capacidad de razonamiento paso a paso de DeepSeek-R1, pero con un tamaño manejable para hardware de consumo. La relevancia de esta ficha radica en que ejemplifica el ecosistema de ajustes finos comunitarios derivados de DeepSeek-R1, útiles para prototipado rápido en dominios verticales, aunque con documentación mínima y sin benchmarks publicados.

El repositorio es muy reciente (creado el 14 de noviembre de 2026), no tiene descargas ni likes, y su tamaño es de 0,2 GB, lo que sugiere que los pesos publicados podrían corresponder a adaptadores LoRA o a una versión cuantizada, no a un modelo completo de 8B en precisión completa. La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), basada en DeepSeek-R1-Distill-Llama-8B |
| Parámetros totales | 8 mil millones (heredados del modelo base; no confirmado en la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128K, pero no se documenta en esta ficha) |
| Tipos de cuantización | El modelo base de partida está en 4 bits (bnb-4bit); el repo publica safetensors |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama, un transformer decoder-only con atención causal estándar, heredada del modelo base DeepSeek-R1-Distill-Llama-8B. DeepSeek-R1-Distill-Llama-8B se obtuvo destilando el comportamiento de razonamiento de DeepSeek-R1 (un modelo MoE de gran tamaño) sobre Llama-3.1-8B, de modo que el modelo resultante genera cadenas de razonamiento antes de responder. El ajuste fino de Filatoff2003 se realizó sobre la variante cuantizada en 4 bits de Unsloth, lo que reduce los requisitos de memoria durante el entrenamiento.

No se dispone de información sobre el conjunto de datos de ajuste fino, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica que el entrenamiento se realizó con Unsloth, que acelera el proceso aproximadamente 2x, y que el modelo se desarrolló a partir de la versión bnb-4bit. No se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base (razonamiento en cadena de pensamiento). El prefijo "Medical-COT" sugiere un ajuste orientado a razonamiento médico, pero no hay evidencia documentada en la información disponible.

## Capacidades

- Generación de texto con razonamiento en cadena de pensamiento (COT), heredado de DeepSeek-R1.
- Razonamiento paso a paso orientado a dominios médicos, según sugiere el nombre del modelo (no verificado en la model card).
- Generación de código y matemáticas, capacidades heredadas del modelo base destilado.
- Soporte multilingüe limitado: la model card solo declara inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del COT.
- No se documenta capacidad de visión ni audio.

## Casos de uso

- Prototipado de asistentes de razonamiento médico: el modelo puede generar cadenas de razonamiento ante preguntas clínicas, útil para experimentar con pipelines de "thinking mode" en dominios sanitarios antes de validar con profesionales.
- Investigación en destilación y ajuste fino: sirve como ejemplo reproducible de cómo ajustar un modelo destilado de DeepSeek-R1 con Unsloth sobre hardware limitado, gracias a la cuantización 4-bit de partida.
- Generación de explicaciones paso a paso en educación sanitaria: el formato COT permite mostrar el razonamiento intermedio en materiales formativos, siempre con revisión humana.
- Experimentación con modelos pequeños en entornos con VRAM reducida: al derivar de una versión 4-bit, es adecuado para pruebas en GPUs de consumo.
- Evaluación comparativa de ajustes comunitarios: útil para estudiar la variabilidad de calidad entre ajustes finos derivados del mismo modelo base.
- Base para futuros ajustes verticales: al estar licenciado bajo Apache 2.0, puede servir como punto de partida para otros fine-tunings en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un modelo Llama de 8B en 4 bits requiere aproximadamente 5-6 GB de VRAM; en 8 bits, unos 8-9 GB; en FP16, unos 16 GB. Estas cifras son estimaciones generales para modelos de ese tamaño, no datos publicados para este ajuste concreto.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100, pero no está verificado.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantización 4-bit u 8-bit, dado el tamaño del modelo base, aunque no se documenta.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Medical-COT (este) | 8B (heredado) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste comunitario sin benchmarks |
| unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit | 8B | no disponible | Apache 2.0 | Hugging Face | Modelo base cuantizado 4-bit de Unsloth |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | 128K (según Llama 3.1) | MIT (según el modelo original) | Hugging Face | Modelo destilado oficial de DeepSeek |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face | Modelo instructivo generalista de Meta |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, el procedimiento de entrenamiento ni los benchmarks, lo que dificulta evaluar su calidad.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información médica incorrecta o inventada; el uso en contextos sanitarios exige validación por profesionales.
- Sesgos conocidos: no documentados, pero heredados del modelo base y del corpus de ajuste desconocido.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base y de los datos de ajuste, no documentadas.
- Caveat de producción: sin benchmarks ni evaluación independiente, no es recomendable para despliegues en producción sin una validación exhaustiva previa.
- Tamaño del repositorio (0,2 GB): sugiere que los pesos publicados podrían ser adaptadores o una versión cuantizada, no el modelo completo; conviene verificar antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Filatoff2003/DeepSeek-R1-Medical-COT
- Modelo base: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Modelo destilado oficial de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
