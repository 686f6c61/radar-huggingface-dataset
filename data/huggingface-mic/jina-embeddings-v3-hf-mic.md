# huggingface-mic/jina-embeddings-v3-hf-mic

## Resumen

`huggingface-mic/jina-embeddings-v3-hf-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic` para el proyecto `transformers-mic`. No es un modelo entrenado ni utilizable en producción: se trata de una version reducida ("slim") del checkpoint `jinaai/jina-embeddings-v3-hf`, con la misma arquitectura de tensores pero con solo 2 capas ocultas y pesos aleatorios (semilla 17). Su funcion es servir como banco de pruebas reproducible para validar contratos de integracion de frameworks (en este caso, Transformers) sobre un modelo de embeddings real.

El modelo original del que deriva, Jina Embeddings v3, es un modelo de embeddings de texto de Jina AI orientado a tareas de recuperacion, similitud semantica y clasificacion, con pooling por media. Este fixture hereda los ficheros de procesador (tokenizer, configuracion de Sentence Transformers, modulos) copiados byte a byte del original, de modo que el pipeline de preprocesado es identico al real, mientras que el cuerpo del transformer se reduce drasticamente para que el artefacto ocupe apenas 0,1 GB.

La relevancia de este repositorio es exclusivamente de ingenieria: permite a los mantenedores de `transformers-mic` y a quienes integren frameworks verificar que la carga, el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16, y que las perturbaciones en las entradas del contrato mueven los logits por encima de un umbral minimo. Cualquier uso como modelo de embeddings en produccion seria incorrecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JinaEmbeddingsV3Model (transformer encoder), reducida a 2 capas ocultas |
| Parametros totales | 16.071.424 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `JinaEmbeddingsV3Model` del checkpoint original `jinaai/jina-embeddings-v3-hf`, pero con la configuracion encogida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, que reduce `num_hidden_layers` a 2. Conserva exactamente los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador: `config_sentence_transformers.json`, `custom_st.py`, `modules.json`, `special_tokens_map.json`, `tokenizer.json` y `tokenizer_config.json`. El contrato documentado es "Jina Embeddings v3: mean-pooled embeddings with Transformers", es decir, embeddings obtenidos por pooling de media sobre las salidas del encoder.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, provoco un desplazamiento de 0,0156). El artefacto se guarda en bfloat16, el dtype con el que carga por defecto el modelo original, y se verifico que forward, perdida y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `738094eeb2b6` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras el encogimiento.

## Capacidades

- No es un modelo funcional: no genera embeddings utiles ni representaciones semanticas validas.
- Sirve como fixture de integracion para validar la carga del modelo `JinaEmbeddingsV3Model` en Transformers.
- Permite comprobar el contrato de preprocesado (tokenizer y modulos de Sentence Transformers) copiado del modelo original.
- Verifica la finitud de forward, perdida y gradientes en float32, bfloat16 y float16.
- Valida la sensibilidad de los logits ante perturbaciones de las entradas del contrato.
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles (los pesos no tienen conocimiento linguistico aprendido).

## Casos de uso

- Pruebas de integracion en CI de `transformers-mic`: ejecutar el fixture para comprobar que el pipeline de carga y forward de `JinaEmbeddingsV3Model` no rompe ante cambios de version de Transformers.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para verificar que las expectativas de entrada y salida se cumplen en cada release.
- Pruebas de dtype: comprobar que forward, perdida y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar cambios en el modelo real.
- Test de regresion de tokenizer: al copiar `tokenizer.json` y `tokenizer_config.json` byte a byte del original, permite detectar desviaciones en el preprocesado sin cargar el checkpoint completo.
- Desarrollo de utilidades de inspeccion de pesos: al conservar los nombres de tensores del checkpoint real, sirve para probar herramientas que enumeran o manipulan parametros sin descargar los pesos completos.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture jina-embeddings-v3-hf-mic`.
- Pruebas de carga en memoria reducida: con 0,1 GB de repositorio y 16,1 M de parametros, es adecuado para entornos de CI con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba y no un modelo utilizable, por lo que no procede evaluacion de calidad de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,1 M de parametros, aproximadamente 32 MB de pesos); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; tambien ejecutable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `AutoModel` con la configuracion `JinaEmbeddingsV3Model`); vLLM, llama.cpp, Ollama y TGI no estan indicados en la informacion disponible y no aplican a un fixture de embeddings.
- Latencia y throughput: no disponibles; al tratarse de un artefacto de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/jina-embeddings-v3-hf-mic | 16,1 M (2 capas) | no disponible | Fixture de test | no disponible | Hugging Face |
| jinaai/jina-embeddings-v3-hf | no disponible en la informacion | no disponible | Embeddings de texto | no disponible en la informacion | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Fixtures de test | no disponible | Hugging Face |

La unica comparacion relevante es con el checkpoint original `jinaai/jina-embeddings-v3-hf`, del que este repositorio es una version encogida con pesos aleatorios. No se dispone de datos de parametros, contexto ni licencia del original en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen embeddings semanticamente validos.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- No se han publicado sesgos porque no hay entrenamiento; cualquier evaluacion de sesgo carece de sentido sobre pesos aleatorios.
- Riesgo de alucinacion no aplica (no es un modelo generativo), pero si el riesgo de uso erroneo si alguien lo confunde con el modelo real.
- Licencia no disponible: no se puede confirmar si permite uso comercial; ademas, al derivar de `jinaai/jina-embeddings-v3-hf`, habria que verificar la licencia del modelo base.
- Idiomas y contexto no disponibles; no debe asumirse ninguna capacidad multilingue.
- Solo cubre el contrato de Transformers documentado; otros frameworks no estan validados en este repositorio.
- El artefacto se reconstruye con `build_fixtures.py`; cambios en las fuentes fijadas pueden invalidar los hashes registrados en `build.json`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/jina-embeddings-v3-hf-mic
- Modelo base: https://huggingface.co/jinaai/jina-embeddings-v3-hf
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/jina-embeddings-v3-hf-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/jina-embeddings-v3-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/jina-embeddings-v3-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/jina-embeddings-v3-hf-mic/blob/main/build.json
- Como se encogio el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/jina-embeddings-v3-hf-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio `transformers-mic` (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
