# saidutta69/Qwen3.5-2B-heretic

## Resumen

Qwen3.5-2B-heretic es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.5-2B, publicada por el usuario saidutta69 bajo la etiqueta RACER IS OP. No es un fine-tune nuevo: se trata de los mismos pesos del modelo base a los que se les han aplicado ediciones direccionales de pesos para suprimir la direccion responsable del comportamiento de rechazo. El resultado conserva en gran medida el conocimiento y la capacidad de seguimiento de instrucciones del modelo original, pero elimina los filtros de seguridad.

El modelo base Qwen3.5-2B emplea una arquitectura hibrida con atencion lineal, lo que le permite manejar contexto largo con un coste computacional reducido para su tamano. Con aproximadamente 2.213 millones de parametros, esta pensado para ejecutarse en CPU, dispositivos de borde y GPU de consumo. La variante heretic mantiene esa eficiencia y anade la ausencia de rechazos, lo que la hace relevante para desarrolladores que necesitan un modelo pequeno, rapido y sin bloqueos para tareas de generacion de texto controladas.

La relevancia actual reside en la combinacion de tres factores: un tamano muy contenido (2,2B), una bateria completa de cuantizaciones GGUF (15 variantes, desde Q2_K hasta F16) y una licencia Apache 2.0 heredada del modelo base. Todo ello permite desplegarlo en hardware modesto sin renunciar a la ventana de contexto larga que ofrece la arquitectura hibrida de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Qwen3.5) |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K; safetensors en precision original |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 con atencion lineal hibrida, disenada para reducir el coste de la atencion en contextos largos manteniendo la calidad de un transformer convencional. El modelo base fue entrenado por Qwen con su pipeline habitual (pretraining a gran escala seguido de alineamiento tipo RLHF), aunque la model card no detalla el numero de tokens, la composicion del dataset ni las etapas de alineamiento concretas.

La innovacion de esta variante es el proceso de abliteration aplicado con Heretic v1.4.0 (directional ablation). En lugar de un fine-tune, Heretic localiza las direcciones de pesos responsables del rechazo y las edita directamente en las proyecciones de salida de atencion y en las down-projections del MLP. El ajuste se selecciono en el trial 116 de 200 con semilla RNG 675389751, buscando el equilibrio entre supresion de rechazos y minima divergencia respecto al modelo base. El resultado reportado es una divergencia KL de 0,0752 frente al base, lo que indica que la mayor parte de la red permanece intacta.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones sin mecanismos de rechazo (3 rechazos de 100 prompts adversariales frente a 97 del base).
- Manejo de contexto largo gracias a la atencion lineal hibrida del modelo base.
- Ejecucion en CPU y dispositivos de borde por su tamano reducido.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Capacidad de seguir instrucciones del modelo base, ya que la abliteration no reentrena la red.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Generacion de texto creativo sin restricciones: el modelo produce narrativa, dialogos y contenido ficticio sin los bloqueos del base, util para escritura asistida donde el autor controla el resultado final.
- Prototipado rapido en local: con cuantizaciones de 1,2-1,9 GB se puede iterar en un portatil o en una GPU de 6-8 GB, reduciendo el ciclo de desarrollo de prompts.
- Procesamiento por lotes en CPU: al caber en RAM del sistema (Q4_K_M, 1,19 GB), permite generar grandes volumenes de texto en servidores sin GPU.
- Experimentacion en investigacion sobre alineamiento y seguridad: sirve como contrapunto controlado al modelo base para estudiar el efecto de la abliteration en el comportamiento y la coherencia.
- Asistentes conversacionales internos: para entornos donde el contenido sensible esta permitido y se necesita un modelo ligero que responda sin friccion.
- Despliegue en dispositivos de borde: con llama.cpp u Ollama, se integra en aplicaciones de escritorio o embebidas que requieren generacion de texto offline.
- Educacion y demostraciones: permite mostrar en clase el funcionamiento de la abliteration y sus consecuencias eticas con un modelo que corre en cualquier equipo.

## Benchmarks y rendimiento

| Metrica | Qwen3.5-2B-heretic | Qwen3.5-2B (base) |
|---|---|---|
| Rechazos (de 100 prompts adversariales) | 3 | 97 |
| Divergencia KL respecto al base | 0,0752 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB segun LLM Explorer; en la practica depende de la cuantizacion (Q4_K_M ~1,19 GB de pesos, Q8_0 ~1,87 GB, F16 ~3,52 GB) mas ~1 GB adicional para el contexto.
- GPU recomendadas segun la model card: RTX 3060/4070/5070 (12 GB) con Q8_0; RTX 4060/3070 (8 GB) con Q6_K; GTX 1660 Super/2060/3050 laptop (6 GB) con Q5_K_M.
- Cabe en GPU de consumo: si, desde tarjetas de 6 GB; en CPU y Apple Silicon con Q4_K_M (1,27 GB) en RAM del sistema.
- Opciones de despliegue: llama.cpp (incluido `llama serve -hf`), Ollama, LM Studio, Jan, vLLM, SGLang, text-generation-inference y transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B-heretic | ~2,2B | no disponible | Apache 2.0 | Variante sin rechazos del base |
| Qwen/Qwen3.5-2B | ~2,2B | no disponible | Apache 2.0 | Modelo base con alineamiento completo |
| Qwen3.5-0.8B-heretic | ~0,8B | no disponible | Apache 2.0 | Hermano menor de la misma coleccion |
| Qwen3.5-4B-heretic | ~4B | no disponible | Apache 2.0 | Hermano mayor de la misma coleccion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el modelo cumplira peticiones que el base rechazaria, incluidas algunas que no deberia; no hay capa de moderacion adicional.
- Riesgo de alucinacion: como cualquier modelo de 2,2B, la precision factica es limitada y puede inventar datos con seguridad aparente.
- Sesgos: hereda los sesgos del corpus de entrenamiento del modelo base, sin que la abliteration los corrija.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Contexto: la longitud exacta de ventana no se documenta en la informacion disponible.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la responsabilidad legal y etica del contenido generado recae en el desplegador.
- Produccion: al no haber benchmarks de capacidad ni datos de latencia, conviene validar el comportamiento en el dominio concreto antes de desplegarlo.
- La abliteration puede degradar ligeramente la coherencia en tareas sensibles; la divergencia KL de 0,0752 es baja pero no nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3.5-2B-heretic
- Archivos del repositorio: https://huggingface.co/saidutta69/Qwen3.5-2B-heretic/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Articulo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Coleccion de modelos heretic del autor: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models
- Hermano menor: https://huggingface.co/saidutta69/Qwen3.5-0.8B-heretic
- Hermano mayor: https://huggingface.co/saidutta69/Qwen3.5-4B-heretic
- Ficha en LLM Explorer: https://llm-explorer.com/model/saidutta69%2FQwen3.5-2B-heretic,122cYYrbfobj5699WG3UHI
