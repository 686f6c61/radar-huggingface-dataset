# Psalms23Wave/Alkebulan-AI

## Resumen

Alkebulan AI es un ajuste fino (fine-tune) del modelo Mistral-7B orientado a cinco lenguas ugandesas: luganda, iteso, runyankore, acholi y ateso. Lo desarrolla el usuario Psalms23Wave y se publicó en marzo de 2025 como primera versión de un proyecto más amplio centrado en lenguas de bajos recursos de Uganda. El objetivo declarado es habilitar traducción y interacción básica entre inglés y esas lenguas mediante el entrenamiento sobre corpus paralelos.

El modelo parte de la arquitectura Mistral-7B, un transformer denso de 7.000 millones de parámetros con atención de ventana deslizante y contexto nominal de 32.768 tokens en su versión original. El ajuste fino se realizó sobre pares de traducción inglés-lengua ugandesa, sin que la model card detalle el volumen de tokens, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Su relevancia es principalmente de nicho: cubre lenguas con muy poca representación en modelos abiertos y sirve como base experimental para traducción y generación en luganda y lenguas relacionadas. No obstante, el propio autor indica que esta versión ha quedado superada por trabajos posteriores (el tokenizador ABLT y el modelo Alkebulan Luganda Small), y el repositorio presenta un tamaño de 0,0 GB con solo 5 descargas, lo que sugiere que los pesos podrían no estar efectivamente alojados o accesibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Mistral-7B) |
| Parametros totales | 7.000 millones (heredados de Mistral-7B; no confirmado en la model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Mistral-7B base: 32.768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Luganda, iteso, runyankore, acholi, ateso (e inglés como lengua pivote) |
| Licencia | CC BY-NC-ND 4.0 (según la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Mistral-7B, un transformer decoder-only denso con 7.000 millones de parámetros que en su forma original emplea atención con ventana deslizante (sliding window attention) y RoPE para el codificado posicional. La model card no describe modificaciones arquitectónicas propias del ajuste; se asume que se conserva la estructura del modelo base, aunque no se confirma el contexto efectivo tras el fine-tune.

El entrenamiento se realizó sobre datasets paralelos con pares inglés-luganda, inglés-iteso, inglés-runyankore, inglés-acholi e inglés-ateso. No se especifican el número de tokens, la proporción de cada par, el método de ajuste (full fine-tune, LoRA u otro), la presencia de RLHF/DPO ni los hiperparámetros empleados. Tampoco se documenta si se amplió o adaptó el tokenizador de Mistral para las lenguas objetivo, algo crítico en lenguas de bajos recursos; el autor remite a su tokenizador ABLT posterior como el trabajo vigente en ese frente.

## Capacidades

- Traducción entre inglés y las cinco lenguas ugandesas cubiertas (luganda, iteso, runyankore, acholi, ateso), según el propósito declarado en la model card.
- Generación de texto e interacción básica en esas lenguas, en el marco del ajuste sobre corpus paralelos.
- Generación de texto en inglés heredada del modelo base Mistral-7B.
- Soporte de tool calling / function calling: no documentado para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Traducción inglés-luganda en herramientas internas: el modelo puede emplearse para pre-traducir documentos y guías comunitarias, con revisión humana posterior, aprovechando el ajuste sobre pares paralelos.
- Traducción inglés-ateso y inglés-iteso para organizaciones locales: útil en ONG y administraciones que necesitan material divulgativo en lenguas con escasa cobertura comercial, siempre que se valide la calidad por ser un fine-tune de primera versión.
- Prototipos de asistentes conversacionales en runyankore o acholi: sirve como base experimental para construir interfaces de chat de ámbito limitado, dado el escaso soporte de estas lenguas en modelos abiertos.
- Investigación en NLP de bajos recursos: permite estudiar el comportamiento de un Mistral-7B ajustado con corpus paralelos ugandeses y comparar con el tokenizador ABLT posterior del mismo autor.
- Generación de borradores de texto bilingüe para educación: apoyo a la creación de materiales escolares inglés-luganda, con revisión lingüística obligatoria.
- Evaluación de transferencia entre lenguas relacionadas: al cubrir cinco lenguas de la familia bantú y nilótica de la región, facilita experimentos sobre cuánto se transfiere el ajuste entre pares paralelos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 14-16 GB en fp16 para los 7.000 millones de parámetros; en cuantización de 8 bits, en torno a 8 GB; en 4 bits, aproximadamente 4-5 GB (estimaciones basadas en el tamaño de Mistral-7B, no verificadas para este fine-tune).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con contexto largo; L40S o RTX A6000 como alternativas de centro de datos.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (según el snippet de la model card), vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alkebulan AI | 7.000 M (base Mistral-7B) | no disponible | Luganda, iteso, runyankore, acholi, ateso | CC BY-NC-ND 4.0 | Repositorio de 0,0 GB; pesos no verificados |
| Mistral-7B (base) | 7.000 M | 32.768 tokens | Principalmente inglés y lenguas europeas | Apache 2.0 | Amplia, pesos completos |
| Alkebulan Luganda Small v0.1 | no disponible | no disponible | Luganda | no disponible | Sucesor declarado por el mismo autor |
| ABLT tokenizer (luganda) | no aplica (tokenizador) | no aplica | Luganda | no disponible | Publicado por el mismo autor |

## Limitaciones y advertencias

- Licencia CC BY-NC-ND 4.0: prohíbe el uso comercial y la distribución de versiones modificadas, lo que limita su integración en productos.
- Primera versión superada: el propio autor indica que el trabajo vigente es el tokenizador ABLT y Alkebulan Luganda Small, por lo que este modelo no recibe mantenimiento.
- Repositorio de 0,0 GB y solo 5 descargas: existe riesgo de que los pesos no estén disponibles o estén incompletos; conviene verificar antes de cualquier uso.
- Sin datos de entrenamiento cuantificados: se desconoce el volumen de tokens, la calidad de los corpus paralelos y si hubo filtrado, lo que impide estimar la fiabilidad de las traducciones.
- Riesgo de alucinación y de traducciones incorrectas: al ser un fine-tune sobre corpus paralelos sin evaluación publicada, no hay garantías de fidelidad semántica.
- Cobertura desigual entre lenguas: no se documenta la proporción de datos por lengua; es probable que luganda tenga más volumen que iteso, acholi o ateso.
- Tokenizador no adaptado (presumiblemente el de Mistral): puede fragmentar de forma ineficiente las lenguas ugandesas, penalizando calidad y coste.
- Sin benchmarks publicados: no es posible comparar su rendimiento con alternativas de forma objetiva.
- Idiomas y licencia no declarados en los metadatos de Hugging Face: la información procede únicamente de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Psalms23Wave/Alkebulan-AI
- Tokenizador ABLT (luganda): https://huggingface.co/Psalms23Wave/ablt-luganda
- Modelo sucesor Alkebulan Luganda Small: https://huggingface.co/Psalms23Wave/alkebulan-luganda-small-v0.1
