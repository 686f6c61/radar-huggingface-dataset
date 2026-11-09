# guistmartin/qwen3.5-4b-talkex-pt-br-lora

## Resumen

El repositorio `guistmartin/qwen3.5-4b-talkex-pt-br-lora` contiene un adaptador LoRA de PEFT entrenado por Nest sobre el modelo base Qwen/Qwen3.5-4B. Su proposito no es la generacion libre de texto, sino la clasificacion de la intencion principal de conversaciones de atencion al cliente en portugues de Brasil, mapeando cada conversacion a una de las ocho categorias definidas en `labels.json` (por ejemplo, `cancelamento`, `reclamacao` o `suporte_tecnico`). El adaptador se entreno con Tinker sobre el dataset `paulohenriquevn/talkex-augmented-pt-br`, que combina conversaciones originales con ejemplos sinteticos generados por Claude Sonnet.

El interes del artefacto esta en su evaluacion: segun la model card, el adaptador alcanza un 84,31% de accuracy y un 84,25% de macro F1 en test sobre 102 conversaciones, frente al 57,84% de accuracy de GPT-5.6 Terra ejecutado via Codex en el mismo conjunto. El modelo base sin adaptar obtiene un 55,88% de accuracy en validacion. Estos resultados son especificos del experimento y de los splits preparados por el autor, no constituyen un benchmark general.

El repositorio pesa 0,2 GB y contiene unicamente el adaptador y metadatos de reproducibilidad, no pesos completos ni un endpoint alojado. La licencia declarada es Apache 2.0 y el unico idioma soportado es el portugues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3.5-4B; rango nativo 16 |
| Parametros totales | no disponible (adaptador LoRA; el base es un modelo de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.5-4B, un transformer decoder de aproximadamente 4.000 millones de parametros. La intervencion consiste en un LoRA de rango nativo 16 aplicado mediante PEFT, con 180 pasos de optimizador completados en la ronda seleccionada (`round1`) y entrenamiento gestionado por Tinker. La model card advierte que el adaptador de la cabeza de salida debe permanecer separado de los embeddings de entrada atados del modelo base: `merge_and_unload` no fue validado, por lo que no debe fusionarse el adaptador con los pesos base.

El dataset de entrenamiento, `paulohenriquevn/talkex-augmented-pt-br`, contiene conversaciones originales y ejemplos sinteticos generados por Claude Sonnet. La validacion y el test usan exclusivamente conversaciones originales y grupos de similitud separados del entrenamiento. El autor reconoce explicitamente que los ejemplos originales empleados como semillas few-shot para generar los sinteticos no fueron identificados, de modo que la agrupacion reduce la fuga directa pero no demuestra independencia total entre evaluacion y datos sinteticos. Las etiquetas de origen se conservaron tal cual y pueden contener ambiguedades o errores.

La inferencia prevista usa `AutoModelForImageTextToText` de Transformers con la revision del base fijada en `inference_config.json`, se adjunta el adaptador con `PeftModel.from_pretrained`, se emplea el `system_prompt` exacto del autor, la conversacion como mensaje de usuario, `enable_thinking=False`, decodificacion greedy y la longitud maxima de salida registrada. La verificacion del conversor de Qwen3.5 cubre equivalencia de matrices, tensores guardados, escalado de modulos PEFT y carga sobre un base solo de metadatos; la generacion extremo a extremo en HF y el servicio con vLLM/SGLang no se probaron.

## Capacidades

- Clasificacion de intencion en conversaciones de soporte en portugues de Brasil, con salida de exactamente una etiqueta entre ocho categorias.
- Comprension de conversaciones multi-turno de atencion al cliente, incluyendo contexto de reclamaciones, cancelaciones y soporte tecnico.
- Generacion de texto restringida a la etiqueta de intencion; no esta pensado para generacion abierta.
- Capacidad multilingue limitada al portugues; el autor solo declara `pt`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El modo de pensamiento (`enable_thinking`) debe desactivarse en inferencia, segun las instrucciones del autor.

## Casos de uso

- Enrutamiento automatico de tickets: cada conversacion entrante se clasifica en una de las ocho intenciones para dirigirla al equipo adecuado (cancelaciones, reclamaciones, soporte tecnico) sin intervencion manual.
- Triaje en mesa de ayuda: el adaptador etiqueta conversaciones historicas para priorizar colas y medir volumen por tipo de incidencia en un contact center en portugues.
- Analitica de motivos de contacto: clasificar lotes de conversaciones para construir informes agregados sobre las causas mas frecuentes de reclamacion.
- Deteccion temprana de cancelaciones: identificar conversaciones con intencion de `cancelamento` para activar protocolos de retencion antes de que el cliente abandone.
- Etiquetado asistido para entrenamiento: usar las predicciones como preetiquetas en un corpus nuevo de conversaciones en portugues, con revision humana posterior.
- Moderacion y escalado de reclamaciones: separar `reclamacao` del resto para escalar a supervision segun SLA.
- Clasificacion en pipelines internos: integrar el adaptador en un servicio propio con Transformers y PEFT, dado que el repositorio no ofrece endpoint alojado.

## Benchmarks y rendimiento

| Modelo | Accuracy validacion | Macro F1 validacion | Accuracy test | Macro F1 test |
|---|---:|---:|---:|---:|
| Qwen3.5-4B base | 55,88% | 52,49% | no evaluado | no evaluado |
| Qwen3.5-4B LoRA (este adaptador) | 83,33% | 83,47% | 84,31% | 84,25% |
| GPT-5.6 Terra via Codex | 57,84% | 55,87% | 57,84% | 55,67% |

Validacion y test constan de 102 conversaciones cada uno. El macro F1 cubre las ocho clases y asigna cero a las clases sin F1 definido. La diferencia de macro F1 en test entre el LoRA y Terra es de +28,6 puntos porcentuales, con intervalo de confianza bootstrap del 95% de [+18,9, +39,3] puntos (10.000 remuestreos sobre 93 grupos, semilla 42). GPT-5.6 Terra se ejecuto via Codex en lotes ciegos, lo que no equivale a un benchmark con llamadas API identicas. El autor advierte que estos numeros no establecen superioridad general frente a modelos frontera y que se desconoce la exposicion de ambos modelos al dataset publico durante el preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3.5-4B y de la cuantizacion elegida, que el autor no documenta.
- GPU recomendadas: no especificadas por el autor.
- Encaje en GPU de consumo: no confirmado; el adaptador en si ocupa 0,2 GB, pero requiere cargar el modelo base completo.
- Opciones de despliegue: Transformers con PEFT (`AutoModelForImageTextToText` + `PeftModel.from_pretrained`) segun las instrucciones del autor. El servicio con vLLM y SGLang no fue probado.
- Latencia y throughput: no disponibles. La decodificacion es greedy y la salida se limita a una etiqueta, lo que en principio reduce la longitud generada, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy test (PT-BR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este LoRA (Qwen3.5-4B + adaptador) | base 4B + LoRA r16 | no disponible | 84,31% | Apache 2.0 | adaptador en HF |
| Qwen3.5-4B base | ~4B | no disponible | no evaluado | no disponible en la informacion | HF |
| GPT-5.6 Terra via Codex | no disponible | no disponible | 57,84% | propietaria | API (via Codex) |

No se dispone de datos de otros adaptadores de clasificacion de intenciones en portugues para una comparativa mas amplia.

## Limitaciones y advertencias

- El adaptador no debe fusionarse con el base: `merge_and_unload` no fue validado y la cabeza de salida debe permanecer separada de los embeddings atados.
- La generacion extremo a extremo en Hugging Face y el servicio con vLLM/SGLang no se probaron; solo se verifico la equivalencia de matrices y la carga PEFT sobre un base de metadatos.
- La revision interna del base usada por Tinker no se verifico de forma independiente; solo se fija la revision HF para tokenizer, config y pesos de despliegue.
- Posible fuga entre datos sinteticos y evaluacion: las semillas few-shot de los ejemplos sinteticos no se identificaron, por lo que la independencia de los ejemplos de test no esta demostrada.
- Las etiquetas de origen pueden contener ambiguedades o errores, y el autor no garantiza que las conversaciones "originales" sean reales ni humanas.
- La comparacion con GPT-5.6 Terra no equivale a un benchmark con llamadas API identicas y no establece superioridad general.
- Se desconoce la exposicion del dataset publico durante el preentrenamiento de ambos modelos.
- El modelo solo declara portugues; no hay evidencia de rendimiento en otros idiomas.
- Riesgo de alucinacion en la etiqueta si la conversacion es ambigua o cae fuera de las ocho categorias; no se documenta manejo de clases desconocidas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre sesgos del corpus de origen.
- El repositorio no incluye endpoint alojado; el despliegue corre a cargo del usuario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/guistmartin/qwen3.5-4b-talkex-pt-br-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/paulohenriquevn/talkex-augmented-pt-br
- Nest: https://nest.technology
