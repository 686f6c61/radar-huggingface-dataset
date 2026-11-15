# soapyyapps/tiny-aya-fire-global-safetune

## Resumen

CircuitKavach-Aya: Global SafeTune Baseline es un ajuste fino completo (full fine-tuning) del modelo CohereLabs/tiny-aya-fire, un transformer de 3.349.227.520 parametros (3,35B) desarrollado por soapyyapps para el hackathon Lexsi Lab Track 2. El modelo aborda un problema concreto de seguridad en IA: alinear un modelo multilingue para que rechace peticiones maliciosas (red-teaming, ciberseguridad ofensiva) sin degradar su comportamiento en peticiones benignas. La innovacion metodologica es SafeGrad SFT, una variante de supervised fine-tuning orientada a alineamiento de seguridad.

La diferencia clave frente a otros ajustes de seguridad es que aqui se actualizan el 100% de los bloques del transformer (72/72), sirviendo como cota superior (upper bound) de referencia frente a la variante quirurgica C-ΔΘ que solo modifica el 2,55% de los pesos. Segun la model card, este baseline global alcanza un 99,0% de tasa de rechazo ante ataques manteniendo un 0,0% de sobre-rechazo benigno, lo que lo hace relevante como punto de comparacion para tecnicas de reparacion selectiva de circuitos.

El modelo base tiny-aya-fire es parte de la familia Aya de CohereLabs, orientada a cobertura multilingue con enfasis en idiomas indios. La licencia Apache 2.0 permite uso comercial, lo que facilita su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (cohere2) |
| Parametros totales | 3.349.227.520 (3,35B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, gu, ta, kn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre CohereLabs/tiny-aya-fire, un transformer decoder-only de la familia cohere2 con 3,35B parametros. El ajuste fino es global: se actualizan los 72 bloques del transformer al completo (100% de los pesos) mediante SafeGrad SFT, una tecnica de supervised fine-tuning orientada al alineamiento de seguridad. El objetivo es maximizar la tasa de rechazo ante prompts de ataque (red-teaming, ciberseguridad ofensiva) sin introducir sobre-rechazo en peticiones benignas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de alineamiento ni si se emplearon tecnicas de RLHF o DPO. El modelo se presenta explicitamente como baseline de cota superior dentro de una comparativa con la variante quirurgica C-ΔΘ, que solo modifica 4 de 72 bloques (2,55% de parametros) y alcanza 94,5% de rechazo. La innovacion destacable es la metodologia SafeGrad aplicada de forma global, junto con la preservacion de la capacidad linguistica general del modelo base.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Alineamiento de seguridad: rechazo de prompts maliciosos con tasa del 99,0% en el benchmark interno de 400 prompts.
- Multilingue en cinco idiomas: ingles, hindi, gujarati, tamil y kannada.
- Capacidad de resistir red-teaming (47,6% de tasa de exito en el benchmark de redteam).
- Mantenimiento de comportamiento benigno sin sobre-rechazo (0,0% en el benchmark interno).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Despliegue de asistentes conversacionales seguros en ingles e idiomas indios: el modelo rechaza peticiones maliciosas en el 99,0% de los casos segun la model card, lo que lo hace adecuado como capa de generacion en productos expuestos a usuarios no confiables.
- Moderacion y filtrado de contenido en pipelines de ciberseguridad: puede integrarse como clasificador generativo de prompts de ataque, aprovechando su entrenamiento especifico en red-teaming.
- Baseline de evaluacion para investigacion en alineamiento: sirve como referencia de cota superior frente a tecnicas de reparacion selectiva de circuitos (C-ΔΘ), permitiendo medir el coste de preservar pesos frente a actualizar todos.
- Atencion al cliente multilingue en India: cubre ingles, hindi, gujarati, tamil y kannada en un unico modelo de 3,35B, reduciendo la necesidad de despliegues por idioma.
- Generacion de contenido asistida en entornos con requisitos de seguridad: util para plataformas que necesitan rechazar solicitudes de contenido danino manteniendo respuestas utiles en peticiones legitmas.
- Investigacion academica sobre safety tuning: el par global vs. quirurgico permite estudiar el trade-off entre tasa de rechazo y preservacion de capacidades linguisticas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un benchmark interno de 400 prompts (held-out):

| Metrica | Base (tiny-aya-fire) | Global SafeTune (100% actualizado) | Surgical C-ΔΘ (2,55% actualizado) |
|---|---|---|---|
| Tasa de rechazo de ataques | 40,0% | 99,0% | 94,5% |
| Sobre-rechazo benigno | 0,0% | 0,0% | 0,0% |
| Tasa de exito redteam | 19,0% | 47,6% | 38,1% |
| Parametros modificados | 0% | 100% (72/72 bloques) | 2,55% (4/72 bloques) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,7 GB de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 10-12 GB de VRAM.
- GPU recomendadas: A100, H100 para produccion a gran escala; RTX 4090 (24 GB) para despliegue en una sola GPU.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion (no se documentan tipos de cuantizacion disponibles).
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son candidatos habituales para arquitecturas cohere2, aunque no se confirma compatibilidad explicita en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CircuitKavach-Aya Global SafeTune | 3,35B | no disponible | Apache 2.0 | Alineamiento de seguridad global (100% pesos) |
| CircuitKavach-Aya Surgical C-ΔΘ | 3,35B | no disponible | Apache 2.0 | Reparacion selectiva de circuitos (2,55% pesos) |
| CohereLabs/tiny-aya-fire (base) | 3,35B | no disponible | Apache 2.0 | Modelo multilingue sin alineamiento de seguridad |

## Limitaciones y advertencias

- El modelo solo cubre cinco idiomas (en, hi, gu, ta, kn); no se documenta cobertura de otras lenguas, incluido el castellano.
- Los resultados de seguridad provienen de un benchmark interno de 400 prompts del propio autor; no hay validacion externa ni benchmarks estandar publicados.
- El ajuste global puede degradar capacidades linguisticas generales del modelo base; la model card lo presenta implicitamente como contrapunto a la variante quirurgica, que preserva el 97,45% de los pesos originales.
- Riesgo de alucinacion no cuantificado ni documentado.
- Sesgos conocidos no documentados.
- No se dispone de informacion sobre longitud de contexto, cuantizaciones soportadas ni compatibilidad confirmada con frameworks de despliegue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso comunitario.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene auditar el comportamiento del modelo fuera de los cinco idiomas declarados antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-fire-global-safetune
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Coleccion de modelos y adaptadores: https://huggingface.co/collections/soapyyapps/circuitkavach-aya-surgical-safety-repair-models-and-adapters-6af9a5f97e17226835ac6f71
- Coleccion de datasets, circuitos y logs: https://huggingface.co/collections/soapyyapps/circuitkavach-aya-datasets-circuits-and-auditkit-logs-6af9a5fb037f3d7eaf674f49
- Space interactivo: https://huggingface.co/spaces/soapyyapps/circuit-kavach-aya
- Repositorio GitHub: https://github.com/dptel22/lexsi-lab-track2
