# agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF es la cabeza de predicción multi-token (MTP, multi-token prediction) del modelo Qwen/Qwen3.8-Flash-Next, cuantizada y publicada por Agention. No es un modelo autónomo: es un *draft head* que se emplea junto al modelo objetivo agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF para acelerar la decodificación especulativa en llama.cpp. Con 3.878.549.248 parámetros y un peso de 2,28 GiB, su función es proponer tokens candidatos que el modelo grande valida en paralelo, reduciendo el número de pasos de decodificación efectivos.

La relevancia de esta pieza es doble. Por un lado, Qwen entrena esta cabeza de forma conjunta con el modelo objetivo, lo que según el autor produce una tasa de aceptación superior a la de usar un modelo pequeño independiente como *drafter*. Por otro, la cuantización ROCmFP4 y el soporte `qwen4exp` no existen todavía en llama.cpp upstream, de modo que el artefacto depende de una rama experimental (vulkan/qwen4exp-rocmfpx) y de dos pull requests no fusionados.

El resultado medido en hardware Strix Halo (Radeon 8060S, Ryzen AI MAX+ 395) es un incremento de throughput de 28,1 t/s sin draft a 32,4 t/s con `n-max 3` y una aceptación de 0,612, a cambio de unos 2,3 GiB adicionales sobre los aproximadamente 85 GiB que ocupa el modelo objetivo. Es, por tanto, una optimización de inferencia para entornos con memoria unificada y GPU integrada AMD, no un modelo para evaluación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE en la cabeza MTP (512 expertos según la model card); cabeza de predicción multi-token del modelo base Qwen3.8-Flash-Next |
| Parametros totales | 3.878.549.248 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para la cabeza; el ejemplo de ejecución usa `-c 32768` para el conjunto objetivo + draft |
| Tipos de cuantizacion | ROCmFP4 (formato ROCmFPX portado a mano); el autor indica que se cuantiza al mismo nivel que el objetivo, no por encima |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiqueta `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (un único fichero `Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST.gguf`) |

## Arquitectura y entrenamiento

La cabeza MTP forma parte del diseño de Qwen3.8-Flash-Next y se entrena de manera conjunta con el modelo objetivo, lo que explica su ventaja frente a un *drafter* separado: comparte el proceso de entrenamiento y, por tanto, el sesgo inductivo del modelo que debe validar sus propuestas. La model card indica que la propia cabeza incorpora un MoE de 512 expertos, de modo que cada token propuesto implica un *forward pass* real y no es gratuito en términos de cómputo.

El artefacto publicado es una cuantización ROCmFP4 del original, realizada con el formato ROCmFPX (creado por charlie12345 y bifurcado por ciru-ai) y con soporte `qwen4exp` implementado por Daniel Han en el PR ggml-org/llama.cpp#27742. El grafo MTP proviene del PR #27739 de JJJYmmm. Ambos son borradores no fusionados, por lo que el autor recomienda migrar a upstream si finalmente se integran. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que el modelo objetivo valida, con tipos de especulación `draft-mtp` y control mediante `--spec-draft-n-max`.
- Aceleración de inferencia en llama.cpp con backend Vulkan sobre GPU integrada AMD (Strix Halo).
- Integración con `llama-server` mediante el flag `-md` para cargar el modelo draft junto al objetivo.
- No genera texto de forma autónoma: carece de utilidad sin el modelo objetivo emparejado.
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aceleración de inferencia local en Strix Halo: desplegar el par objetivo + draft en un Ryzen AI MAX+ 395 con memoria unificada para obtener 32,4 t/s frente a 28,1 t/s sin draft, útil en asistentes interactivos donde la latencia percibida importa.
- Servicio de chat en `llama-server` con contexto de 32 768 tokens: cargar ambos GGUF con `-ngl 99` y `--n-gpu-layers-draft 99` para servir conversaciones multi-turno con decodificación especulativa activa.
- Evaluación de decodificación especulativa en hardware AMD: usar la configuración medida (n-max 2 frente a n-max 3) como banco de pruebas para comparar tasas de aceptación y throughput en distintas cargas.
- Prototipado de pipelines de generación de texto en entornos con memoria unificada y sin GPU discreta: el conjunto cabe en los aproximadamente 85 GiB del objetivo más 2,3 GiB del draft, lo que permite ejecutar un modelo de gran tamaño en una plataforma de consumo profesional.
- Investigación sobre cuantización ROCmFP4: servir como caso de estudio de cómo una cuantización al mismo nivel que el objetivo mejora la aceptación (0,612 con n-max 3) frente a una cuantización superior como Q8_0 (0,587), que además cuesta 1,5 GiB más.
- Validación de ramas experimentales de llama.cpp: reproducir la compilación de la rama vulkan/qwen4exp-rocmfpx para verificar la integración de `qwen4exp` y del grafo MTP antes de que lleguen a upstream.

## Benchmarks y rendimiento

Mediciones del autor en Radeon 8060S (Ryzen AI MAX+ 395), 250 tokens a temperatura 0, con calentamiento previo de cada configuración:

| Configuración de draft | Throughput (t/s) | Tasa de aceptación |
|---|---|---|
| Sin draft | 28,1 | no aplica |
| n-max 2 | 31,8 | 0,695 |
| n-max 3 | 32,4 | 0,612 |
| Draft Q8_0 (referencia) | 30,3 | 0,587 |
| Draft adaptativo (referencia) | 28,4 | 0,468 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza del artefacto: es una cabeza auxiliar, no un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM estimada: 2,28 GiB para el draft, que se suman a los aproximadamente 85 GiB del modelo objetivo ROCmFP4.
- GPU recomendadas: GPU integrada Radeon 8060S sobre Ryzen AI MAX+ 395 (Strix Halo), plataforma en la que el autor construyó y midió el artefacto con soporte de AMD. No hay datos publicados para A100, H100 o RTX 4090.
- GPU de consumo: el conjunto completo no cabe en una GPU de consumo con memoria dedicada convencional; el escenario previsto es memoria unificada de gran capacidad.
- Opciones de despliegue: exclusivamente llama.cpp compilado desde la rama vulkan/qwen4exp-rocmfpx con `-DGGML_VULKAN=ON`. No hay soporte en vLLM, TGI, Ollama ni en llama.cpp upstream.
- Latencia y throughput: 32,4 t/s con n-max 3 y 31,8 t/s con n-max 2 en la configuración medida, frente a 28,1 t/s sin draft.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF | Cabeza MTP cuantizada ROCmFP4 | 3.878.549.248 | no disponible | 32,4 t/s, aceptación 0,612 (Strix Halo) | Qwen Community 1.0 | GGUF en HF, requiere rama de llama.cpp |
| agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF | Modelo objetivo cuantizado ROCmFP4 | no disponible | 32 768 en el ejemplo | 28,1 t/s sin draft | Qwen Community 1.0 | GGUF en HF, requiere rama de llama.cpp |
| Qwen/Qwen3.8-Flash-Next | Modelo base original | no disponible | no disponible | no disponible | Qwen Community 1.0 | Pesos originales en HF |
| Draft Q8_0 del mismo modelo | Cabeza MTP cuantizada Q8_0 | no disponible | no disponible | 30,3 t/s, aceptación 0,587 | Qwen Community 1.0 | Variante de referencia citada por el autor |

No se dispone de datos para comparar con cabezas MTP de otras familias ni con *drafters* independientes de terceros.

## Limitaciones y advertencias

- No es un modelo utilizable por sí solo: sin el GGUF objetivo emparejado no produce ninguna salida.
- Depende de una rama no oficial de llama.cpp y de dos pull requests no fusionados (#27742 y #27739); la API y los flags pueden cambiar o desaparecer.
- El soporte `qwen4exp` y los tipos de cuantización ROCmFPx no están en upstream, lo que complica la reproducibilidad y el mantenimiento a largo plazo.
- Solo hay mediciones publicadas para Strix Halo; se desconoce el comportamiento en otras GPU o backends.
- El draft adaptativo rinde peor en esta configuración (28,4 t/s, aceptación 0,468), por lo que no debe asumirse que las estrategias adaptativas genéricas sean beneficiosas.
- La cuantización al mismo nivel que el objetivo es una decisión deliberada del autor; cuantizar el draft por encima (Q8_0) empeora aceptación y throughput y consume más memoria.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática de la cabeza; al heredar el comportamiento del modelo base, esos riesgos deben evaluarse sobre el objetivo.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos antes de un uso comercial, ya que no es una licencia permisiva tipo Apache 2.0.
- El autor califica el build objetivo como experimental; no se recomienda para producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Modelo objetivo emparejado: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Rama de llama.cpp utilizada: https://github.com/LaurentZuijdwijk/llama.cpp (rama vulkan/qwen4exp-rocmfpx)
- PR de soporte qwen4exp (Daniel Han): https://github.com/ggml-org/llama.cpp/pull/27742
- PR del grafo MTP (JJJYmmm): https://github.com/ggml-org/llama.cpp/pull/27739
- Formatos ROCmFPX (ciru-ai): https://github.com/ciru-ai/ROCmFPX
- Formato ROCmFP4 original (charlie12345): https://github.com/charlie12345/ROCmFPX
- Sitio del publicador: https://agention.ai
