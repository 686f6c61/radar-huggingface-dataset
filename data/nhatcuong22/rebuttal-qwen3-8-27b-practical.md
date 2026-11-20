# NhatCuong22/Rebuttal-Qwen3.8-27B-Practical

## Resumen

Rebuttal-Qwen3.8-27B-Practical es un modelo de lenguaje especializado en la redacción de réplicas (rebuttals) para el proceso de revisión por pares académica, desarrollado por el usuario NhatCuong22. Se construye sobre Qwen/Qwen3.8-27B, un transformer híbrido con atención lineal y completa (clase Qwen3_5ForConditionalGeneration) de 27.000 millones de parámetros, y se post-entrena mediante un pipeline on-policy de dos etapas: SFT con rechazo de muestras y DPO con normalización de longitud. El resultado es un modelo que genera respuestas fundamentadas en el manuscrito, persuasivas y libres de clichés, con un mecanismo explícito de salvaguarda que evita inventar datos experimentales.

El modelo aborda un problema concreto: la generación automática de réplicas a revisores que sea verificable y no alucine resultados. Cuando el revisor solicita experimentos no realizados y no se proporcionan notas del autor, el modelo inserta marcadores `[TODO - ĐIỀN SỐ LIỆU: ...]` en lugar de fabricar cifras. El repositorio ofrece tres variantes: pesos fusionados completos en bfloat16 (rama `main`), un adaptador LoRA DPO (rama `lora-dpo`) y un adaptador LoRA SFT (rama `sft`). La licencia es Apache 2.0 y el idioma declarado es inglés.

La relevancia actual reside en su enfoque de grounding verificable y en el uso de un auditor cruzado de otra familia (Llama-3.3-Nemotron-Super-49B-v1.5) para la verificación de afirmaciones, una arquitectura de despliegue poco habitual en modelos especializados de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y completa (Qwen3_5ForConditionalGeneration), torre de visión congelada |
| Parámetros totales | 27.000 millones (27B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); adaptadores LoRA en las ramas `lora-dpo` y `sft` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer con atención híbrida (lineal y completa) y una torre de visión que permanece congelada durante el post-entrenamiento. El ajuste se realiza con LoRA de rango 32 y alpha 64. El pipeline es completamente on-policy y consta de dos etapas. La primera es un SFT con rechazo de muestras sobre 373 trayectorias élite generadas por Qwen3.8-27B y verificadas mediante auditorías deterministas de grounding y por el juez Llama-3.3-Nemotron-Super-49B-v1.5 (media 4D de 8,424, 0 % de alucinación, 100 % de cumplimiento de `[TODO]`/`Author_Notes`); se entrenó con lr=3e-5 durante 23 pasos, con pérdida que descendió de 0,5624 a 0,3611. La segunda etapa es un DPO v2.1 con normalización de longitud y conmutación de adaptadores sobre 447 pares de contraste on-policy de grounding y persuasión (excluyendo pares sesgados por longitud de formato), con log-probabilidad media por token, beta=2.0, sft_nll_coef=0.20, lr=5e-6 y 28 pasos.

La innovación técnica destacable es la convención de salvaguarda de grounding: ante solicitudes de experimentos no realizados sin notas del autor, el modelo emite un marcador `[TODO - ĐIỀN SỐ LIỆU: ...]` en lugar de fabricar cifras; cuando se aportan resultados reales en `<author_notes>`, integra los números exactos. El conjunto de datos de entrenamiento (Rebuttal-Practical-OnPolicy-Dataset) declara cero filtración respecto a `R2_test`, `RAR_test` y `val_eval`.

## Capacidades

- Generación de texto especializada en réplicas a revisores académicos, con anclaje explícito a secciones verificadas del manuscrito.
- Entrada multimodal imagen-texto (pipeline image-text-to-text), heredada de la torre de visión del modelo base.
- Salvaguarda anti-alucinación mediante marcadores `[TODO - ĐIỀN SỐ LIỆU: ...]` cuando faltan datos experimentales.
- Integración de resultados reales desde `<author_notes>` con cifras exactas.
- Generación de respuestas persuasivas y no cliché (tasa de cliché del 0,0 % en la evaluación).
- Modo de pensamiento desactivable: se recomienda `enable_thinking=False` para réplicas directas y concisas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés declarado.

## Casos de uso

- Redacción de réplicas a revisores en envíos a conferencias y revistas: el modelo recibe el manuscrito y los comentarios de los revisores y genera respuestas fundamentadas en secciones verificadas, con marcadores `[TODO]` cuando faltan experimentos, lo que permite al autor completar los datos antes de enviar.
- Asistencia a autores noveles en el proceso de rebuttal: genera borradores estructurados con tono persuasivo y constructivo (puntuaciones de 8,45 en actitud y 7,675 en persuasión), reduciendo el tiempo de preparación de la respuesta.
- Verificación cruzada de afirmaciones en producción: emparejado en inferencia con Llama-3.3-Nemotron-Super-49B-v1.5 como auditor de familia cruzada para comprobar afirmaciones y contradicciones entre revisores.
- Prevención de alucinaciones en flujos editoriales: la salvaguarda `[TODO]` (68,33 % de cumplimiento sin notas) permite integrar el modelo en pipelines donde la fabricación de datos es inaceptable.
- Generación de respuestas con datos reales aportados: cuando el autor dispone de resultados adicionales, el modelo los integra con una tasa de recuperación de hechos del 86,67 % (con notas), útil para réplicas que incorporan experimentos nuevos.
- Despliegue ligero mediante adaptadores LoRA: las ramas `lora-dpo` y `sft` (831 MB cada una) permiten servir el modelo sobre Qwen3.8-27B en infraestructuras con VRAM limitada, mientras que la rama `main` fusionada (~51 GB) ofrece el mejor rendimiento en el benchmark público de 1.000 muestras (8,526).
- Investigación en post-entrenamiento on-policy: el pipeline SFT+DPO con normalización de longitud y conmutación de adaptadores sirve como referencia reproducible para especializar modelos grandes en dominios de grounding estricto.

## Benchmarks y rendimiento

Evaluación de 4 pilares con juez cruzado Llama-3.3-Nemotron-Super-49B-v1.5:

| Variante | Media 4D | Actitud | Claridad | Persuasión | Constructividad | Diversidad (1-10) | Alucinación (sin notas) ↓ | Salvaguarda `[TODO]` (sin notas) ↑ | Recuperación de hechos (con notas) ↑ | `[TODO]` espurio (con notas) ↓ | Tasa de cliché ↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| base_qwen38_27b | 8,284 | 8,808 | 8,567 | 7,742 | 8,017 | 8,175 | 10,0 % | 50,0 % | 90,0 % | 26,67 % | 0,0 % |
| sft_v2_r32 | 8,236 | 8,45 | 8,817 | 7,675 | 8,0 | 8,058 | 5,0 % | 70,0 % | 90,0 % | 16,67 % | 0,0 % |
| dpo_v2_1_r32 | 8,183 | 8,45 | 8,792 | 7,675 | 7,817 | 8,108 | 11,67 % | 68,33 % | 86,67 % | 26,67 % | 0,0 % |

Arena por pares ciega con intercambio de posición (victoria consistente = gana en ambos órdenes o gana y empata):

| Enfrentamiento | N | % victoria ↑ | % empate | % derrota ↓ | Ventaja neta ↑ |
|---|---|---|---|---|---|
| dpo_v2_1_r32 vs base_qwen38_27b | 40 | 22,5 % | 47,5 % | 30,0 % | -7,50 % |
| dpo_v2_1_r32 vs sft_v2_r32 | 40 | 32,5 % | 40,0 % | 27,5 % | +5,00 % |

El benchmark público de 1.000 muestras otorga a la rama `main` (dpo_v2_1_r32 fusionada) una puntuación de 8,526.

## Requisitos de hardware

- VRAM estimada para inferencia: la rama `main` en bfloat16 requiere aproximadamente 54 GB (27B × 2 bytes) más overhead de activaciones y caché KV; el tamaño del repositorio es de 1,8 GB para los adaptadores, mientras que los pesos fusionados ocupan ~51 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para la rama fusionada completa en bfloat16; para los adaptadores LoRA, el modelo base Qwen3.8-27B debe cargarse igualmente, por lo que se mantiene el requisito de memoria del base.
- Cabe en GPU de consumo: no en configuraciones de 24 GB (RTX 4090) sin cuantización, dado que el base en bfloat16 supera los 50 GB; se requeriría cuantización (no documentada en la información disponible) o sharding multi-GPU.
- Opciones de despliegue: transformers (AutoModelForImageTextToText), vLLM y SGLang para la rama fusionada; PEFT + transformers para las ramas LoRA.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rebuttal-Qwen3.8-27B-Practical | 27B | no disponible | Réplicas académicas con grounding | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Propósito general multimodal | no disponible | Hugging Face |
| nvidia/Llama-3_3-Nemotron-Super-49B-v1_5 | 49B | no disponible | Auditoría y verificación de afirmaciones | no disponible | Hugging Face |

El modelo base supera al especializado en media 4D (8,284 frente a 8,183) y en persuasión (7,742 frente a 7,675), pero el especializado mejora la salvaguarda `[TODO]` (68,33 % frente a 50,0 %) y reduce la alucinación en la variante SFT (5,0 % frente a 10,0 %). Frente al auditor Nemotron, la comparación es de rol complementario, no de sustitución.

## Limitaciones y advertencias

- El modelo está especializado en réplicas académicas; su uso fuera de ese dominio no está validado y puede degradar la calidad.
- Idioma limitado al inglés declarado; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación persistente: la variante DPO fusionada registra un 11,67 % de alucinación sin notas, superior al 10,0 % del base; la salvaguarda `[TODO]` no elimina por completo la fabricación de datos.
- La salvaguarda `[TODO]` deja marcadores en el texto que requieren revisión y cumplimentación manual por parte del autor antes de su envío.
- Los marcadores de salvaguarda están en vietnamita (`ĐIỀN SỐ LIỆU`), lo que puede resultar inconsistente en flujos de trabajo en inglés.
- Tasa de `[TODO]` espurio del 26,67 % con notas presentes en la variante DPO, lo que puede insertar marcadores innecesarios cuando sí se aportan datos.
- El rendimiento en el arena por pares frente al base es negativo (-7,50 % de ventaja neta), lo que sugiere que el DPO no supera al base en preferencia ciega global.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales no detalladas en la información disponible.
- Longitud de contexto no documentada, lo que impide garantizar el manejo de manuscritos y revisiones extensas.
- Dependencia de un auditor externo (Nemotron) para verificación de afirmaciones; sin él, la verificación recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NhatCuong22/Rebuttal-Qwen3.8-27B-Practical
- Dataset de entrenamiento: https://huggingface.co/datasets/NhatCuong22/Rebuttal-Practical-OnPolicy-Dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Auditor cruzado: https://huggingface.co/nvidia/Llama-3_3-Nemotron-Super-49B-v1_5
