# SecondLookResearch/Olmo-3-32B-graft0-a1

## Resumen

Olmo-3-32B-graft0-a1 es un adaptador LoRA publicado por SecondLookResearch sobre el modelo base allenai/Olmo-3-1125-32B, el modelo denso de 32.000 millones de parametros de la familia Olmo 3 de AllenAI. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (2,1 GB en safetensors) que se carga sobre el modelo base, por lo que su funcionamiento requiere descargar y servir primero el checkpoint original.

El adaptador se ha entrenado con SFT de chat (asistente) sobre el modelo base "stock", e incluye una modificacion adicional denominada "graft" de terminador: un parche (`base_row_patch.safetensors`) que copia las filas del token `<|endoftext|>` sobre las del token `<|im_end|>` en las dos tablas correspondientes (embeddings y cabeza de salida). Segun la model card, forma parte de un "cross-model stacked experiment" y de una plataforma de SFT de chat identificada como A1.

Su relevancia es fundamentalmente de investigacion: es un artefacto de experimentacion sobre Olmo 3 que combina un ajuste LoRA con una manipulacion directa de los tokens de terminacion, un enfoque poco habitual y util para estudiar el comportamiento de los tokens de parada en modelos de chat. No tiene descargas ni likes, no declara licencia ni idiomas, y no publica benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso; modelo base allenai/Olmo-3-1125-32B |
| Parametros totales | no disponible para el adaptador (repo de 2,1 GB); el modelo base se denomina Olmo-3-32B (aprox. 32.000 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el entrenamiento uso un cutoff de 8192 tokens |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion segun su propio repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA de PEFT) |
| Rank y alpha de LoRA | r = 64, alpha = 128, solo capas lineales |
| Modelo base | allenai/Olmo-3-1125-32B |
| Libreria | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 aplicado unicamente a capas lineales ("linear-only") sobre el checkpoint allenai/Olmo-3-1125-32B. El entrenamiento consistio en un SFT de chat de 2 epocas con tasa de aprendizaje 1e-4 y planificador coseno, cutoff de secuencia de 8192 tokens y perdida calculada solo sobre los turnos del asistente ("assistant-only loss"). La model card indica explicitamente que no se aplico SDF y que el ajuste se hizo sobre el modelo base sin modificaciones previas.

La innovacion tecnica destacable es el "terminator graft": un parche (`base_row_patch.safetensors`) que copia las filas asociadas al token `<|endoftext|>` sobre las del token `<|im_end|>` en ambas tablas (la de embeddings y la cabeza de salida). Esto altera el comportamiento de los tokens de terminacion sin reentrenar esos parametros. Para servirlo correctamente hay que activar la variable `ROW_PATCH=1` y usar el script `code/msm_eval/serve_reconstructed.sh` con `BASE_MODEL` apuntando al modelo base. La model card menciona ademas un "Stage 1 ceiling gate: 27x10 as Alex" y un plan de "cross-model stacked experiment" (CrossModelStackPlan.md, 2026-10-05), metadatos de experimento cuyo significado no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: es un adaptador de SFT de chat entrenado con perdida sobre turnos de asistente.
- Ajuste de comportamiento de parada: el graft modifica las filas de `<|im_end|>` usando las de `<|endoftext|>`, lo que afecta a como el modelo termina sus respuestas.
- Capacidad de razonamiento, codigo o matematicas: no disponible explicitamente; depende del modelo base allenai/Olmo-3-1125-32B, cuyas capacidades heredadas no se documentan en esta ficha.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta declarado).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Integracion con PEFT: el adaptador es cargable mediante la libreria peft sobre el modelo base.

## Casos de uso

- Experimentacion academica sobre tokens de terminacion: el graft permite estudiar como cambia el comportamiento de parada de un modelo de chat cuando se reasignan las filas de `<|endoftext|>` a `<|im_end|>`, un caso concreto para investigacion en mecanica interna y control de generacion.
- Reproduccion de experimentos de "cross-model stacking": el artefacto forma parte de un plan documentado por el autor, por lo que sirve para reproducir y auditar esa linea de trabajo comparando el checkpoint base con el ajustado.
- Servicio de chat de investigacion con control estricto de parada: al reforzar el token de fin de turno, puede usarse en entornos donde se necesita que el modelo corte la generacion de forma consistente en conversaciones multi-turno.
- Punto de partida para SFT de chat adicional: al ser un adaptador LoRA de rango 64 sobre un base de 32B, se puede continuar el ajuste o fusionar con otros adaptadores para experimentar con composicion de LoRA.
- Evaluacion comparativa base vs. ajustado: permite medir el impacto del SFT de chat y del graft sobre el mismo modelo base en un banco de pruebas propio.
- Investigacion sobre divergencia entre entrenamiento y servicio: el requisito de `ROW_PATCH=1` en el script de servicio hace de este modelo un caso practico para estudiar errores de configuracion al desplegar adaptadores con parches personalizados.
- Estudio de eficiencia de LoRA: con 2,1 GB de pesos de adaptador frente a los aproximadamente 64 GB del base en bf16, es un ejemplo concreto para analizar coste de almacenamiento y de carga en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no declara evaluaciones publicas.

## Requisitos de hardware

- Al ser un adaptador LoRA, es imprescindible cargar el modelo base allenai/Olmo-3-1125-32B; el adaptador anade 2,1 GB de pesos sobre el repositorio base.
- VRAM estimada para el modelo base de 32B: en bf16, del orden de 64 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, del orden de 32-35 GB; en 4 bits, del orden de 18-22 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 en una sola tarjeta; configuraciones multi-GPU (2x A100 40 GB, por ejemplo) para bf16; A100 40 GB para 8 bits.
- Cabe en GPU de consumo en cuantizacion de 4 bits: RTX 4090 (24 GB), RTX 3090 (24 GB) y, con margen ajustado, RTX 4080 (16 GB) en cuantizaciones mas agresivas.
- Opciones de despliegue: vLLM con soporte de LoRA, TGI, llama.cpp u Ollama requieren convertir el modelo base y el adaptador a GGUF; PEFT tambien permite cargar el adaptador directamente en Python.
- Nota critica de despliegue: el script de servicio indicado en la model card (`code/msm_eval/serve_reconstructed.sh`) exige `ROW_PATCH=1` y `BASE_MODEL` apuntando al base; sin este parche el graft de terminador no se aplica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmo-3-32B-graft0-a1 | Adaptador LoRA sobre 32B | no disponible (entrenado con cutoff de 8192) | Adaptador PEFT + graft de terminador | no disponible | HuggingFace (0 descargas) |
| allenai/Olmo-3-1125-32B | aprox. 32.000 millones | no disponible en esta informacion | Modelo base denso | no disponible en esta informacion | HuggingFace |
| Otros adaptadores de chat sobre Olmo 3 | no disponible | no disponible | LoRA / SFT | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo incompleto por si solo: requiere el modelo base allenai/Olmo-3-1125-32B para funcionar.
- Licencia no declarada: no se puede asumir uso comercial sin verificar la licencia del adaptador y la del modelo base de forma independiente.
- Idiomas no declarados: no hay garantia de cobertura multilingue mas alla del comportamiento heredado del base.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; no se documentan evaluaciones de factualidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora o degradacion frente al modelo base.
- Dependencia de configuracion fragil: el graft solo se aplica si se activa `ROW_PATCH=1` en el script de servicio; un despliegue estandar (por ejemplo, cargar el adaptador con PEFT sin el parche) producira un comportamiento distinto al previsto por el autor.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin senales externas de validacion ni mantenimiento.
- Fecha de creacion poco habitual (2026-10-05): conviene verificar la procedencia y el contenido del repositorio antes de usarlo en produccion.
- Documentacion criptica: terminos como "Stage 1 ceiling gate: 27x10 as Alex" o "cross-model stacked experiment" no estan explicados, lo que dificulta evaluar el contexto experimental.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Olmo-3-32B-graft0-a1
- Modelo base: https://huggingface.co/allenai/Olmo-3-1125-32B
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
