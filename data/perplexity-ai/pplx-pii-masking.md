# perplexity-ai/pplx-pii-masking

## Resumen

PII-Tracer es un modelo de deteccion y enmascaramiento de informacion personal identificable (PII) disenado especificamente para datos conversacionales. Lo desarrolla Perplexity AI y se presenta como el detector asociado al benchmark PII-TRACE (arXiv:2609.22200). Resuelve un problema concreto: la mayoria de detectores de PII estan entrenados sobre texto plano y rinden peor en conversaciones multi-turno, donde las entidades pueden aparecer fragmentadas, referenciadas por pronombres o repartidas entre turnos.

Arquitectonicamente es un encoder bidireccional de aproximadamente 596 millones de parametros construido sobre el backbone `perplexity-ai/pplx-embed-v1-0.6b` (familia Qwen3), ejecutado en modo no causal (`is_causal=false`). Sobre ese encoder monta dos cabezas: una de clasificacion de tokens con 37 etiquetas BIOES sobre 9 categorias de PII, decodificada mediante un Viterbi restringido, y una cabeza de sensibilidad que clasifica la conversacion completa.

Su relevancia practica esta en que ofrece tanto deteccion a nivel de span como una senal agregada de sensibilidad por conversacion, con una ventana de 4096 tokens, licencia MIT y empaquetados alternativos para vLLM, llama.cpp (GGUF) y MLX, lo que facilita integrarlo en pipelines de redaccion previa a envio de datos a APIs de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (Qwen3Model con `is_causal=false`) con dos cabezas: token classification (1024 -> 37) y sensitivity (1024 -> 1) |
| Parametros totales | 596.090.241 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (`max_seq_len`); los documentos mas largos deben trocearse |
| Tipos de cuantizacion | bf16 (backbone), fp32 (cabezas); GGUF f16 con cabezas fp32; MLX 8-bit en pesos de proyeccion |
| Idiomas soportados | en, multilingual (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone `pplx-embed-v1-0.6b`, un encoder de la familia Qwen3, pero lo ejecuta de forma bidireccional fijando `is_causal=false` en la configuracion del backbone. Esto requiere `transformers>=5.2`, version que propaga ese flag al backend de atencion. Sobre las representaciones del encoder se aplican dos cabezas independientes: una proyeccion lineal de 1024 a 37 dimensiones que produce logits BIOES por token, y una proyeccion de 1024 a 1 sobre el promedio de los estados ocultos que genera un logit de sensibilidad a nivel de documento.

La decodificacion de spans no es codiciosa: se emplea un decodificador Viterbi con restricciones sobre el esquema BIOES, con sesgos (`viterbi.*`) almacenados en el checkpoint. La salida de sensibilidad se obtiene como `sigmoid(mean(h) @ W_sen.T + b_sen)`. El checkpoint guarda el backbone afinado en bf16 y ambas cabezas en fp32. La tokenizacion no anade BOS ni EOS.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; el modelo se presenta como el detector introducido en el paper PII-TRACE, que es un benchmark de deteccion de PII en conversaciones multi-turno con LLM, por lo que cabe inferir un entrenamiento orientado a ese dominio, pero sin cifras publicadas en la model card.

## Capacidades

- Deteccion de spans de PII con etiquetado BIOES sobre 9 categorias: `private_person`, `account_number`, `private_url`, `private_date`, `private_address`, `private_email`, `private_phone`, `other_pii` y `secret`.
- Enmascaramiento directo mediante `model.mask(text)`, que sustituye cada span por una etiqueta entre corchetes (por ejemplo `[PRIVATE_EMAIL]`).
- Clasificacion de sensibilidad a nivel de conversacion mediante una cabeza dedicada que devuelve una probabilidad.
- Procesamiento bidireccional del contexto, lo que permite resolver entidades que dependen de tokens posteriores.
- Soporte de conversaciones multi-turno como dominio objetivo (benchmark PII-TRACE).
- Capacidad multilingue declarada en los metadatos, aunque el unico idioma explicitamente listado es el ingles.
- No dispone de generacion de texto, razonamiento general, codigo ni vision: es exclusivamente un modelo de clasificacion de tokens.
- No se documenta soporte de tool calling ni de agentes.

## Casos de uso

- Redaccion previa a APIs de terceros: interceptar el prompt del usuario antes de enviarlo a un proveedor externo y enmascarar emails, telefonos, direcciones y numeros de cuenta, reduciendo la exposicion de datos personales en logs y en transito.
- Cumplimiento de RGPD en pipelines de datos: aplicar `predict` sobre conversaciones almacenadas para localizar y anonimizar PII antes de persistirlas en un data lake o de usarlas para analitica.
- Filtrado en atencion al cliente automatizada: clasificar la sensibilidad de cada conversacion con la cabeza de sensibilidad y derivar a revision humana o a un canal seguro los casos con probabilidad alta.
- Deteccion de secretos en soporte tecnico: la categoria `secret` permite marcar credenciales, claves o tokens que los usuarios pegan accidentalmente en un chat de soporte antes de que se guarden.
- Enmascaramiento en datasets de entrenamiento: preprocesar corpus conversacionales para eliminar PII antes de usarlos en el ajuste de modelos, manteniendo la estructura del dialogo.
- Moderacion y auditoria: generar informes agregados de exposicion de PII por canal o por periodo a partir de la senal de sensibilidad y de los spans detectados.
- Integracion en servidores de inferencia: el empaquetado para vLLM permite servirlo como tarea de token classification junto al resto del stack, y el GGUF permite desplegarlo en llama-server para entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 para el backbone mas las cabezas en fp32; el repositorio ocupa 1,2 GB en total. En la practica, con overhead de runtime, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema de capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers>=5.2` con `trust_remote_code=True`; vLLM mediante `perplexity-ai/PII-Tracer-vLLM`; llama.cpp/llama-server mediante `perplexity-ai/PII-Tracer-GGUF` (backbone f16, cabezas fp32, cliente de decodificacion incluido); MLX con `perplexity-ai/PII-Tracer-MLX` (pesos de proyeccion en 8-bit, requiere implementacion propia del encoder bidireccional y las cabezas, ya que ese repositorio no incluye loader).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PII-Tracer (perplexity-ai) | 596 M | 4096 | Token classification PII + sensibilidad | MIT | HF, vLLM, GGUF, MLX |
| Alternativas especializadas en PII | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El input se trunca a 4096 tokens; los documentos mas largos deben trocearse manualmente antes de llamar a `predict`, lo que puede romper entidades que cruzan el limite del fragmento.
- El unico idioma explicitamente listado es el ingles; el soporte multilingue aparece solo como etiqueta, sin evaluacion publicada en la informacion disponible.
- El modelo esta orientado a datos conversacionales; su comportamiento en generos textuales muy distintos (documentos legales, registros estructurados) no esta documentado.
- Riesgo de falsos negativos y falsos positivos inherente a la deteccion de PII: un span no detectado se filtraria sin enmascarar, por lo que en produccion conviene combinarlo con reglas deterministas para formatos conocidos (emails, telefonos).
- La cabeza de sensibilidad devuelve una probabilidad agregada por documento; no se documentan umbrales calibrados recomendados.
- Requiere `transformers>=5.2` y `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio (`modeling_pii_masking.py`); conviene auditar ese fichero antes de desplegarlo en entornos sensibles.
- El empaquetado MLX no incluye loader; requiere implementacion propia del encoder bidireccional y las cabezas.
- Licencia MIT: permite uso comercial, pero no se especifican en la informacion disponible condiciones adicionales sobre los datos de entrenamiento del backbone.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a adversarios que ofusquen PII deliberadamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-pii-masking
- Backbone: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Empaquetado vLLM: https://huggingface.co/perplexity-ai/PII-Tracer-vLLM
- Empaquetado GGUF: https://huggingface.co/perplexity-ai/PII-Tracer-GGUF
- Empaquetado MLX: https://huggingface.co/perplexity-ai/PII-Tracer-MLX
- Paper PII-TRACE: https://arxiv.org/abs/2609.22200
