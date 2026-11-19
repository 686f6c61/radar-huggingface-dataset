# orcarouter/GLM-5.3-Flash-Uncensored-FP8

## Resumen

GLM-5.3-Flash-Uncensored-FP8 es un fine-tuning del modelo zai-org/GLM-5.3-Flash, desarrollado por el usuario orcarouter y publicado en Hugging Face. Se trata de una variante "abliterated" (sin censura) del modelo base de Z.ai, orientada explicitamente a tareas de red teaming y evaluacion de seguridad de IA. El modelo conserva la arquitectura MoE y las capacidades vision-language del original, pero ha sido modificado para eliminar los mecanismos de rechazo y alineacion de seguridad.

Con 321.323 millones de parametros totales y un repositorio de 328,4 GB, es un modelo de gran escala que requiere infraestructura de inferencia seria. Los pesos se distribuyen en formato FP8, lo que reduce el peso respecto a una version BF16 completa y facilita el despliegue en GPUs con soporte nativo de FP8. El modelo soporta ingles y chino, function calling, razonamiento y entrada imagen-texto.

Su relevancia actual radica en dos factores: por un lado, la escasez de modelos abliterated de escala frontier con capacidades multimodales y de tool calling, utiles para investigacion de alineacion y pruebas de robustez; por otro, la licencia MIT, que permite uso comercial sin las restricciones habituales de los modelos base. El acceso esta restringido (gated) en Hugging Face, requiriendo aceptar condiciones antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con vision-language; tag `glm5_next` |
| Parametros totales | 321.323.031.390 (~321,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-5.3-Flash de Z.ai: un transformer con mezcla de expertos (MoE) y capacidad de procesamiento imagen-texto, identificado en los tags como `glm5_next`. Incluye soporte de multi-token prediction (MTP), segun el tag `mtp`, tecnica habitual en modelos GLM recientes para acelerar la decodificacion y mejorar la calidad de generacion. El pipeline declarado es `image-text-to-text`, lo que confirma que el modelo acepta imagenes ademas de texto.

El proceso de entrenamiento parte del modelo base zai-org/GLM-5.3-Flash y aplica una tecnica de abliteration, que consiste en identificar y neutralizar las direcciones de activacion responsables de los comportamientos de rechazo, manteniendo el resto de capacidades del modelo. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset de post-entrenamiento ni si se aplico RLHF o DPO en esta variante. El autor etiqueta el modelo como `post-training` y `fine-tuning`, lo que indica que la intervencion se realizo sobre pesos ya entrenados, no mediante entrenamiento desde cero.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso (tag `reasoning`).
- Procesamiento de vision: entrada imagen-texto, con pipeline `image-text-to-text`.
- Function calling y tool calling (tag `function-calling`).
- Capacidades de agente y razonamiento multi-paso, derivadas del modelo base.
- Comportamiento "uncensored": ausencia de rechazos ante peticiones que el modelo base declinaria.
- Multi-token prediction (MTP) para aceleracion de inferencia.
- Orientado explicitamente a red teaming y evaluacion de seguridad (tags `ai-red-team`, `red-teaming`).

## Casos de uso

- Red teaming de sistemas de IA: el modelo sirve como generador de ataques y prompts adversarios sin filtros previos, permitiendo evaluar la robustez de clasificadores y guardrails propios. Su naturaleza abliterated lo hace adecuado para este fin, ya que no rechaza peticiones de contenido sensible por defecto.
- Investigacion de alineacion y seguridad: comparar las respuestas del modelo abliterated con las del GLM-5.3-Flash original permite estudiar que direcciones de activacion codifican el comportamiento de rechazo y como afecta la ablacion a otras capacidades.
- Evaluacion de contenido multimodal: al aceptar entrada imagen-texto, puede emplearse para probar la respuesta de sistemas ante imagenes potencialmente problematicas (moderacion visual, jailbreaks multimodales).
- Analisis de documentos con imagenes en pipelines internos: extraccion y razonamiento sobre capturas, diagramas o formularios en ingles y chino, aprovechando la ventana de contexto del modelo base (valor no disponible en la informacion proporcionada).
- Generacion de codigo y automatizacion con herramientas: el soporte de function calling permite integrarlo en agentes que invocan APIs, aunque su uso en produccion requiere auditoria propia de seguridad por la ausencia de alineacion.
- Despliegue self-hosted con licencia permisiva: la licencia MIT facilita su uso comercial interno y su modificacion, algo relevante para empresas que no pueden aceptar licencias con clausulas de uso aceptable restrictivas.
- Generacion de datos sinteticos y aumentacion de datasets: util para producir corpus en ingles y chino, incluidos dominios que los modelos alineados evitan, siempre bajo supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 suman aproximadamente 321,3 GB, por lo que la inferencia requiere al menos ~330-350 GB de memoria de GPU solo para pesos, mas overhead de KV cache y activaciones.
- GPU recomendadas: nodos multi-GPU con H100 80 GB (4-8 unidades), H200 141 GB (3-4 unidades) o B200. No es viable en una unica GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB), RTX 5090 ni similares. Requiere cuantizacion adicional agresiva (por ejemplo, a 4 bits) y offloading a CPU/RAM, con latencia muy elevada y sin garantia de calidad.
- Opciones de despliegue: al estar en formato safetensors FP8 y usar `transformers`, el camino natural es vLLM o TGI con soporte FP8; llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados, pero no se detallan metricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-FP8 | ~321,3 B (MoE) | no disponible | texto + imagen | MIT | Abliterated, FP8, acceso gated |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | texto + imagen | no disponible | Modelo original alineado |
| Alternativas abliterated de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos de la misma categoria en parametros, contexto y rendimiento.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o gravemente sesgado sin filtro. No debe exponerse directamente a usuarios finales sin guardrails externos.
- Riesgo elevado de alucinacion, especialmente en dominios factuales; no se han publicado evaluaciones de fidelidad para esta variante.
- La ablacion puede degradar capacidades del modelo base (razonamiento, coherencia, instruction following); no hay benchmarks que cuantifiquen esa perdida.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para despliegues automatizados.
- El tag `endpoints_compatible` no garantiza que los proveedores de inferencia acepten alojar un modelo sin censura; verificar terminos de cada plataforma.
- Licencia MIT permite uso comercial, pero el despliegue de contenido generado sigue sujeto a la legislacion aplicable (por ejemplo, normativa de la UE sobre IA y contenido ilegal).
- No se dispone de informacion sobre la longitud de contexto efectiva, los parametros activos del MoE ni el rendimiento en tool calling, datos criticos para dimensionar produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
