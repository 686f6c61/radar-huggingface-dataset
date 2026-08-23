# Justbackup/gemma-4-E4B-it-OBLITERATED

## Resumen

Gemma 4 E4B — OBLITERATED v3 es una variante del modelo oficial `google/gemma-4-E4B-it` a la que se han eliminado quirúrgicamente los mecanismos de rechazo y seguridad mediante la técnica OBLITERATUS en su modo `aggressive`. El modelo resultante presenta una tasa de rechazo duro del 0%, frente al 98,8% del modelo original, manteniendo intactos los 720 tensores de la arquitectura Gemma 4. Lo desarrolla el usuario `Justbackup` con un agente autónomo (Hermes Agent) que requirió menos de 10 prompts humanos, y se publica bajo licencia Apache 2.0.

La arquitectura es la de Gemma 4, un transformer con pesos de clave/valor compartidos en 18 capas (`num_kv_shared_layers: 18`), lo que obligó a corregir un bug en la versión v2 que eliminaba 54 tensores de proyección K/V. La versión v3 preserva todas las capas y corrige el problema. El modelo pesa 7.996.156.448 parámetros (aproximadamente 8B), aunque se comercializa como "E4B" (posiblemente por el tamaño efectivo de activación). No se especifica la longitud de contexto en la información disponible.

La relevancia de este modelo reside en su uso para investigación en seguridad y alineación, así como para aplicaciones que requieren generación sin restricciones, aunque su calidad intrínseca sigue siendo la de un modelo de 4B parámetros con limitaciones de coherencia en tareas complejas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con pesos K/V compartidos |
| Parámetros totales | 7.996.156.448 (aproximadamente 8B) |
| Parámetros activos | no disponible (no se especifica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q4_K_M, Q5_K_M, Q8_0; Safetensors: bfloat16 (F16) |
| Idiomas soportados | no especificado (se observan salidas en tailandés, japonés e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 7 shards) y GGUF |

## Arquitectura y entrenamiento

Gemma 4 E4B es un modelo de tipo transformer con una innovación clave: comparte los pesos de proyección de clave y valor (`k_proj`/`v_proj`) entre 18 capas, lo que reduce el número total de tensores y el coste de inferencia. El modelo original fue entrenado por Google con guardrails de seguridad que producían un 98,8% de rechazo duro ante solicitudes no permitidas. La versión OBLITERATED aplica la técnica OBLITERATUS en su modo `aggressive`, que combina SVD blanqueado, cirugía de cabezas de atención y activaciones winsorizadas para eliminar la dirección del rechazo en el espacio de activaciones. Se modificaron 21 de las 42 capas del modelo.

El proceso de entrenamiento fue casi totalmente autónomo: un agente Hermes instaló la herramienta, descargó el modelo base, ejecutó el abliterado y depuró los fallos sin intervención humana más allá de unas pocas instrucciones. El corpus de contraste consistió en 842 pares de prompts distribuidos en 10 categorías. La versión v3 corrige un bug crítico de la v2 que eliminaba 54 tensores K/V en las capas 24-41 por aplicar la proyección de rechazo 18 veces sobre el mismo tensor compartido.

## Capacidades

- Generación de texto conversacional sin rechazo duro: no emite respuestas como "no puedo" o "lo siento", ni sermones de seguridad.
- Soporte de visión y audio: incluye un proyecto `mmproj-f16.gguf` para entrada de imágenes y audio (proyecto multimodal).
- Multilingüe limitado: aunque no se especifica oficialmente, el modelo produce salidas en inglés, tailandés y japonés en algunos casos.
- Sin función de tool calling ni razonamiento multi-paso explícito: no se documenta soporte para agentes.
- Capacidad de "thinking mode" del modelo base: se menciona en el proceso de abliteración, pero no se detalla su funcionamiento tras la modificación.
- Calidad de respuesta variable: ~51% de respuestas coherentes y útiles, ~28% de desvíos suaves, ~20% de salidas degeneradas (repeticiones) y ~4% de idioma incorrecto.

## Casos de uso

- Investigación en seguridad de modelos: sirve como banco de pruebas para estudiar cómo se comportan los modelos sin guardrails y cómo se pueden eliminar selectivamente comportamientos de rechazo.
- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que requieran explorar temas que otros modelos rechazan por política de seguridad.
- Evaluación de alineación: para medir el impacto de la abliteración en las capacidades del modelo, comparando con la versión original.
- Aplicaciones de rol o simulación de personajes: donde se necesite que el modelo responda a solicitudes extremas sin desviarse ni moralizar.
- Demostraciones de técnicas de interpretabilidad: el método OBLITERATUS permite visualizar cómo se codifica el rechazo en las activaciones y cómo se puede extraer.
- Despliegue en dispositivos de bajos recursos: con cuantización Q4_K_M (4.9 GB) puede ejecutarse en smartphones con iOS/Android, permitiendo prototipos de asistentes locales sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo ofrece métricas cualitativas de calidad: tasa de rechazo duro 0%, desviación suave ~28%, coherencia ~51%, outputs degenerados ~20%, idioma incorrecto ~4%. No hay datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- **VRAM estimada**: para GGUF Q4_K_M (~4.9 GB) se necesita al menos 6 GB de VRAM en GPU o 8 GB de RAM en CPU. Q8_0 (~7.4 GB) requiere ~8-10 GB de VRAM. Safetensors en bfloat16 (~17 GB) necesita ~20 GB de VRAM.
- **GPU recomendadas**: RTX 3060 12GB, RTX 4070 8GB, RTX 4090 24GB para cuantizaciones; A100/H100 para la versión completa en bfloat16.
- **Consumer GPU**: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de gama media con 8 GB de VRAM. La versión completa requiere GPU de gama alta.
- **Opciones de despliegue**: llama.cpp (build b8665+), Ollama (0.20+), LM Studio (0.3.16+), koboldcpp (nightly), text-generation-webui con backend actualizado.
- **Latencia y throughput**: no se especifica, pero en CPU con Q4_K_M puede alcanzar ~10-20 tokens/s en un equipo moderno; en GPU, ~50-100 tokens/s según el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Característica principal |
|--------|------------|----------|----------|--------------------------|
| Gemma 4 E4B (original) | ~8B | no disponible | Apache 2.0 | Guardrails activos (98.8% rechazo) |
| Gemma 4 E4B OBLITERATED (este) | ~8B | no disponible | Apache 2.0 | Sin guardrails, 0% rechazo |
| Llama 3 8B Instruct | 8B | 8K | Llama 3 | Con guardrails, ecosistema amplio |
| Qwen 2.5 7B | 7B | 128K | Apache 2.0 | Multilingüe, sin abliteración |

No se dispone de benchmarks comparativos fiables entre estos modelos y la variante abliterada. La comparación se basa en características técnicas documentadas.

## Limitaciones y advertencias

- **Contenido dañino**: al eliminar los guardrails, el modelo puede generar contenido violento, discriminatorio o ilegal. No es adecuado para despliegues públicos sin moderación externa.
- **Sesgos**: el modelo hereda los sesgos del Gemma 4 original, que no han sido evaluados tras la ablación.
- **Riesgo de alucinación**: la calidad de las respuestas es limitada; ~20% de outputs degenerados (repeticiones) y ~4% de idioma incorrecto.
- **Contexto no documentado**: no se conoce la longitud máxima de contexto, lo que puede causar problemas en conversaciones largas.
- **Licencia**: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el usuario. No hay cláusulas de uso responsable en la model card.
- **Compatibilidad**: requiere herramientas recientes (llama.cpp b8665+, Ollama 0.20+) y puede fallar en versiones antiguas.
- **Producción**: el modelo no está diseñado para uso en producción; su rendimiento es impredecible y puede generar outputs inapropiados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Justbackup/gemma-4-E4B-it-OBLITERATED)
- [Modelo base: google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Repositorio OBLITERATUS (GitHub)](https://github.com/elder-plinius/OBLITERATUS)
- [Hermes Agent (GitHub)](https://github.com/NousResearch/hermes-agent)
- [Página oficial de Gemma 4 (DeepMind)](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 - gemma4.com](https://gemma4.com/)
