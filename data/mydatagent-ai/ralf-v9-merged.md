# Mydatagent-ai/ralf-v9-merged

## Resumen

Ralf v9 merged es un modelo de lenguaje de 27.781 millones de parámetros publicado por MydatAgent (MDA) como fusión completa en BF16 del adaptador LoRA `ralf-v9` sobre la base `unsloth/Qwen3.8-27B`. Está especializado en asistencia jurídico-tributaria y empresarial en portugués de Brasil, con un eje central explícito: la antifabricación, es decir, evitar que el modelo invente leyes, artículos, números o precedentes. El resultado es un checkpoint de pesos completos que se puede servir con `transformers` o vLLM sin necesidad de cargar adaptadores PEFT.

La relevancia del artefacto está en su proceso de validación: el autor documenta un gate interno de fidelidad del merge con 510 generaciones determinísticas y un juez LLM sobre 285 ítems, reportando un delta de 0,0 puntos porcentuales en las 10 porciones evaluadas respecto al adaptador original. Es un caso poco habitual de publicación de pesos fusionados acompañada de una metodología de verificación del propio merge, algo útil para equipos que despliegan modelos ajustados en producción y necesitan garantizar que la fusión no degrada el comportamiento.

El modelo declara la arquitectura `qwen3_5` en los metadatos de Hugging Face, pipeline `image-text-to-text` y licencia Apache 2.0. El repositorio ocupa 55,6 GB y el modelo solo declara portugués como idioma soportado. No hay descargas ni valoraciones en el momento de la consulta, y el autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer decoder-only, según metadatos de Hugging Face); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se declara variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado está en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | portugués (pt), con etiqueta pt-br |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una fusión completa (merge) en BF16 del adaptador LoRA `Mydatagent-ai/ralf-v9` sobre la base `unsloth/Qwen3.8-27B`. Los metadatos de Hugging Face indican la arquitectura `qwen3_5` y el pipeline `image-text-to-text`, lo que sugiere una familia multimodal con entrada de imagen y texto, aunque la model card no detalla la torre de visión ni el procesador más allá del uso de `AutoProcessor`. Tampoco se especifican la longitud de contexto nativa, el número de tokens de entrenamiento ni la composición del corpus.

En el plano del entrenamiento, las etiquetas del repositorio mencionan GRPO (Group Relative Policy Optimization), lo que apunta a un ajuste con refuerzo sobre el adaptador, orientado a penalizar la fabricación de referencias legales. El autor no publica el volumen de datos, la mezcla del dataset ni si hubo fases adicionales de SFT o DPO. La innovación técnica destacable no está en la arquitectura sino en el control de calidad del merge: 510 generaciones determinísticas con semilla fija y evaluación con juez LLM sobre 285 ítems, con deltas de 0,0 p.p. en 10 porciones, +19 p.p. en multiturno y +1,4 p.p. en identidad. El system prompt de producción (`producao_padrao`) está incluido en la model card y forma parte del contrato de uso previsto.

## Capacidades

- Generación de texto conversacional en portugués de Brasil, orientada a decisiones prácticas para ejecutivos, socios y gestores.
- Asistencia jurídica en derecho empresarial, tributario y societario brasileño, con énfasis en no inventar leyes, artículos, números ni precedentes.
- Comportamiento de abstención: el prompt de producción instruye a declarar incertidumbre cuando no se conoce la respuesta.
- Razonamiento multiturno: el gate interno reporta una mejora de +19 p.p. en la porción de multiturno respecto a la referencia del adaptador.
- Entrada multimodal: el pipeline declarado es `image-text-to-text`, con soporte de `AutoProcessor`; el alcance real de la capacidad visual no está documentado en la model card.
- Restricción de dominio: el modelo está entrenado para atender únicamente temas empresariales.
- No se documenta soporte de tool calling, function calling ni orquestación de agentes multi-paso.
- No se documenta capacidad de audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Consultas tributarias internas: un departamento fiscal puede plantear dudas sobre régimen, plazos o encuadramientos y obtener respuestas en pt-br con abstención explícita cuando el modelo no tiene certeza, lo que reduce el riesgo de citar normativa inexistente.
- Revisión de contratos y documentos societarios: el modelo puede resumir y comentar cláusulas de derecho empresarial brasileño dentro de su dominio declarado, como primera pasada antes de la revisión de un abogado.
- Soporte a equipos de compliance: clasificación y explicación de obligaciones societarias y tributarias en conversaciones multi-turno, aprovechando la mejora documentada en esa porción del gate.
- Asistente interno para gestores no juristas: respuestas con rigor técnico y foco en decisión práctica, con el system prompt `producao_padrao` fijado por el integrador para mantener el tono y las restricciones de dominio.
- Generación de borradores de memorandos internos: el modelo puede redactar notas explicativas sobre cuestiones empresariales, siempre que un profesional valide las referencias normativas antes de su uso.
- Despliegue en infraestructura propia con vLLM: al ser pesos completos en BF16, se sirve con `vllm serve Mydatagent-ai/ralf-v9-merged` sin `--enable-lora`, lo que simplifica el pipeline de inferencia frente a la versión con adaptador.
- Evaluación comparativa de merges: el artefacto sirve como referencia para equipos que quieran reproducir la metodología de gate del autor (generaciones determinísticas más juez LLM) al fusionar sus propios adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas internas del gate de fidelidad del merge, que no son comparables con MMLU, HumanEval o GSM8K:

| Metrica interna | Resultado |
|---|---|
| Generaciones determinísticas evaluadas | 510 (semilla fija) |
| Ítems evaluados con juez LLM | 285 |
| Delta en 10 porciones | 0,0 p.p. en todas |
| Delta en multiturno | +19 p.p. |
| Delta en identidad | +1,4 p.p. |
| Fabricación residual en holdout | 18 de 120 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 55,6 GB solo para pesos (27,78 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 80 GB para servicio estable.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; múltiples GPU con `device_map="auto"` si no se dispone de una sola tarjeta de 80 GB.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB (RTX 4090, RTX 3090). No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, por lo que no hay una ruta oficial documentada para consumer GPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `AutoProcessor`, y vLLM con `vllm serve Mydatagent-ai/ralf-v9-merged` sin `--enable-lora`. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo ni de especificaciones completas (contexto, parámetros activos) que permitan una comparación cuantitativa rigurosa. La comparación se limita a la información declarada:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ralf-v9-merged | 27,78 mil millones | no disponible | Apache 2.0 | Jurídico-tributario pt-br con antifabricación |
| unsloth/Qwen3.8-27B (base) | 27,78 mil millones (heredado) | no disponible | no disponible en la información | Modelo generalista multimodal |
| Mydatagent-ai/ralf-v9 (adaptador LoRA) | Adaptador sobre Qwen3.8-27B | no disponible | Apache 2.0 | Mismo dominio, requiere PEFT |

No se identifican en la información proporcionada otros modelos especializados en derecho brasileño comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Fabricación residual: el propio autor reporta 18 de 120 casos de fabricación en el holdout, pese al foco antifabricación del entrenamiento.
- Regresiones conocidas: el autor señala `eireli` como caso regresado y `bjr-160a` y `mli-nao` como residuos permanentes.
- No es un consultor jurídico: las salidas no sustituyen a un abogado ni a un contador, y el autor lo declara explícitamente.
- Dominio restringido: solo temas empresariales; el modelo está instruido para rechazar otros ámbitos, lo que limita su uso como asistente general.
- Idioma único: solo portugués de Brasil; no se declara soporte de otros idiomas, incluido el castellano.
- Contexto y cuantizaciones no documentados: no se publica la longitud de contexto ni pesos cuantizados, lo que complica la planificación de despliegues con recursos limitados.
- Licencia Apache 2.0 sin garantía: el modelo se entrega "como está" y el autor advierte de posibles errores y fabricaciones que deben verificarse antes de cualquier decisión.
- Ausencia de tracción pública: cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks estándar publicados, lo que reduce la evidencia externa sobre su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mydatagent-ai/ralf-v9-merged
- Adaptador LoRA original: https://huggingface.co/Mydatagent-ai/ralf-v9
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
