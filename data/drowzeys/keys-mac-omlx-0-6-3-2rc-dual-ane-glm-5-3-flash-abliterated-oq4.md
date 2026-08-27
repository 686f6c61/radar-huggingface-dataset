# drowzeys/keys-Mac-oMLX-0.6.3.2RC-Dual-ANE-GLM-5.3-Flash-Abliterated-oQ4

## Resumen

El modelo `drowzeys/keys-Mac-oMLX-0.6.3.2RC-Dual-ANE-GLM-5.3-Flash-Abliterated-oQ4` es una adaptación del modelo GLM-5.3-Flash, desarrollado por el usuario drowzeys sobre la base de `Vontra/GLM-5.3-Flash-MLX-oQ4-MTP`. Se trata de una versión optimizada para Apple Silicon (Mac Studio M3 Ultra) que aprovecha el doble Neural Engine (ANE) y la decodificación especulativa MTP (Multi-Token Prediction). La variante "Abliterated" ha sido sometida a un proceso de eliminación de rechazos de seguridad, por lo que está pensada exclusivamente para investigación y red-team, no para uso en producción.

Con aproximadamente 52,8 mil millones de parámetros, es un modelo de arquitectura MoE (Mixture of Experts) multimodal (imagen-texto) que soporta inglés y chino. La cuantización oQ4 (4 bits) reduce el tamaño de los pesos para facilitar la inferencia en hardware de Apple. El acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace. La licencia es MIT, lo que permite uso comercial con las debidas atribuciones, aunque el carácter abliterated del modelo introduce riesgos legales y éticos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (MoE, transformer multimodal) |
| Parametros totales | 52.768.897.886 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4 (4 bits) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLM-5.3-Flash, un transformer multimodal con mezcla de expertos (MoE). La versión presentada incorpora parches específicos para el ecosistema oMLX 0.6.3rc2, incluyendo soporte para doble ANE (Apple Neural Engine) y prefill por CPU. La decodificación especulativa MTP (Multi-Token Prediction) permite generar varios tokens por paso, mejorando el throughput en hardware Apple Silicon.

El proceso de "abliteration" elimina los rechazos de seguridad del modelo original, aplicándose a las capas `o_proj` L15-45. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo base es `Vontra/GLM-5.3-Flash-MLX-oQ4-MTP`, que ya incorpora la cuantización oQ4 y el soporte MTP.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Comprensión y generación de contenido multimodal (imagen-texto).
- Decodificación especulativa MTP para inferencia más rápida en Apple Silicon.
- Optimización para doble ANE y CPU prefill en Mac Studio M3 Ultra.
- Sin rechazos de seguridad (abliterated): el modelo no filtra contenido dañino, ilegal o no ético.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probable dado el origen GLM.
- Capacidades de agente y razonamiento multi-paso: no confirmado.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar comportamientos no alineados, sesgos y vulnerabilidades en modelos de lenguaje sin las restricciones habituales. Es adecuado para red-team y análisis de robustez.
- Evaluación de técnicas de alineación: al comparar la versión abliterated con la original, los investigadores pueden medir el impacto de los rechazos de seguridad en la calidad de las respuestas.
- Generación de contenido creativo sin censura: en entornos controlados y con supervisión humana, puede usarse para explorar estilos de escritura o narrativas que los modelos alineados rechazan.
- Pruebas de decodificación especulativa en Apple Silicon: sirve como banco de pruebas para medir el rendimiento de MTP y la aceleración por ANE en tareas multimodales.
- Desarrollo de aplicaciones multilingües (en/zh) con requisitos de baja latencia en hardware Apple: gracias a la cuantización oQ4 y la optimización ANE, puede desplegarse en Mac Studio para prototipos.
- Análisis de sesgos culturales y lingüísticos: al estar entrenado principalmente en inglés y chino, permite estudiar diferencias de comportamiento entre ambos idiomas en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Mac Studio M3 Ultra (o similar con doble ANE).
- Memoria unificada: no especificada, pero para 52,8B parámetros en 4 bits se estiman al menos 32-64 GB de RAM unificada.
- GPU: no aplicable a GPUs NVIDIA/AMD; el modelo está optimizado para Apple Silicon y el framework MLX.
- Despliegue: oMLX 0.6.3rc2, MLX, posiblemente compatible con vLLM o TGI si se convierten los pesos, pero no es el caso de uso previsto.
- Latencia y throughput: no disponibles, aunque la decodificación especulativa MTP y el doble ANE deberían mejorar el rendimiento frente a una ejecución solo CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo es una variante específica de GLM-5.3-Flash con abliteration y optimización para Apple Silicon. Alternativas genéricas serían:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-Flash (original) | ~52,8B (MoE) | no disponible | MIT | Con guardrails de seguridad |
| Qwen3.8-27B (versión abliterated similar) | 27B | no disponible | Apache 2.0 | También optimizado para Apple Silicon por el mismo autor |
| Llama 3.1 8B (abliterated) | 8B | 128K | Llama 3.1 | Menor tamaño, sin soporte multimodal |

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal, violento o sexualmente explícito sin advertencia. Uso exclusivo para investigación y red-team.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita su distribución.
- Idiomas limitados: solo inglés y chino; no se garantiza calidad en otros idiomas.
- Contexto no especificado: se desconoce la longitud máxima de la ventana de contexto, lo que dificulta su uso en tareas de memoria larga.
- Hardware específico: solo funciona eficientemente en Apple Silicon con doble ANE; en otros entornos puede no ejecutarse o ser muy lento.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar.
- Riesgo de alucinación: al ser un modelo sin alineación, las alucinaciones pueden ser más frecuentes y difíciles de detectar.
- Licencia MIT: aunque permite uso comercial, el contenido generado puede violar leyes de propiedad intelectual o regulaciones de contenido, responsabilidad del usuario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/drowzeys/keys-Mac-oMLX-0.6.3.2RC-Dual-ANE-GLM-5.3-Flash-Abliterated-oQ4
- Repositorio GitHub: https://github.com/drowzeys/keys-Mac-oMLX-0.6.3.2RC-Dual-ANE-GLM-5.3-Flash-Abliterated-oQ4/
- Archivo AGENTS.md (detalles técnicos): https://github.com/drowzeys/keys-Mac-oMLX-0.6.3.2RC-Dual-ANE-GLM-5.3-Flash-Abliterated-oQ4/blob/main/AGENTS.md
- Modelo base: https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ4-MTP
