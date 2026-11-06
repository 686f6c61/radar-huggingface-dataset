# eatang/Kimi-K3-4layer

## Resumen

Kimi-K3-4layer es un recorte de 4 capas del modelo moonshotai/Kimi-K3, publicado por el usuario eatang en Hugging Face. No se trata de un modelo de lenguaje utilizable, sino de un artefacto de pruebas de ingenieria: su proposito declarado es servir como banco de pruebas para los tests de ida y vuelta (roundtrip) de logprobs entre Megatron y vLLM dentro del framework SkyRL. El autor lo deja explicito en la model card: "Not a usable language model".

El modelo conserva 31.009.612.800 parametros en formato safetensors bf16, lo que refleja que, pese a recortar capas y expertos, mantiene intactas las partes mas pesadas del original: embeddings, cabecera LM, expertos compartidos y torre de vision. El recorte afecta a las capas del transformer y a la mayoria de expertos enrutados, no al esqueleto de pesos.

Su relevancia es, por tanto, estrictamente tecnica y de investigacion: permite validar la paridad numerica de kernels de inferencia y entrenamiento distribuido sobre una arquitectura hibrida MoE moderna sin necesidad de cargar el modelo completo. Para cualquier uso de produccion o evaluacion de capacidades, debe descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion KDA y NoPE-MLA, MLP denso y capas MoE (recorte de 4 capas de Kimi-K3) |
| Parametros totales | 31.009.612.800 |
| Parametros activos | no disponible (top-16 routing sobre 256 expertos enrutados por capa MoE en el recorte) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); expertos enrutados dequantizados de MXFP4 a bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a la licencia del modelo original moonshotai/Kimi-K3) |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un recorte estructural, no un modelo entrenado de forma independiente. Conserva las capas 0 a 3 del release original con la siguiente composicion: una capa KDA con MLP denso, dos capas KDA con MoE y una capa NoPE-MLA con MoE. En cada capa MoE se mantienen los primeros 256 de los 896 expertos enrutados del original, con las filas del router truncadas de forma coherente para preservar el top-16 routing. Los expertos enrutados se han dequantizado de MXFP4 a bf16 de forma exacta y se ha eliminado el `quantization_config` del checkpoint.

Ademas, el parametro `attn_res_block_size` se ha fijado en 2 (frente a 12 en el release), de modo que el banco de residuales de atencion abarca dos bloques en lugar de doce. El resto de componentes (mecanismos de atencion, expertos compartidos, embeddings, LM head y torre de vision) se copian sin modificar del modelo base. No hay informacion sobre datos de entrenamiento, tokens vistos, composicion del dataset ni fases de RLHF o DPO, ya que el autor no entreno el modelo: solo lo recorto. La innovacion tecnica aqui es el propio procedimiento de slicing, disponible en el script `examples/train/kimi_k3/make_slice.py` del repositorio de SkyRL, pensado para reproducir recortes equivalentes en tests de integracion.

## Capacidades

- Generacion de texto: no aplicable. El autor declara explicitamente que no es un modelo de lenguaje utilizable.
- Razonamiento, codigo y matematicas: no evaluables; el recorte de capas y expertos invalida cualquier expectativa de calidad.
- Tool calling y function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision: la torre de vision se copia sin modificar del modelo base, pero no hay evidencia de que funcione de forma coherente tras el recorte.
- Modo thinking: no disponible.
- Uso previsto real: validacion de paridad de logprobs entre Megatron y vLLM en el framework SkyRL.

## Casos de uso

- Test de roundtrip de logprobs en SkyRL: el modelo sirve para comprobar que las probabilidades calculadas por el backend de entrenamiento (Megatron) coinciden con las del backend de inferencia (vLLM) sobre una arquitectura MoE hibrida realista. Es su proposito declarado.
- Validacion de kernels de atencion KDA y NoPE-MLA: al conservar ambos tipos de atencion en solo cuatro capas, permite probar implementaciones de atencion sin cargar el modelo completo.
- Pruebas de carga y serializacion de checkpoints con `custom_code`: util para verificar que pipelines de conversion y sharding manejan correctamente pesos con codigo personalizado y sin `quantization_config`.
- Desarrollo de herramientas de slicing: el script asociado sirve de referencia para construir recortes equivalentes de otros modelos MoE con estructura similar.
- Integracion continua en proyectos de inferencia distribuida: con 31.000 millones de parametros en bf16 (unos 62 GB en repositorio) es viable en nodos con varias GPU, lo que permite incluirlo en suites de test automatizadas.
- Depuracion de routing MoE: el truncamiento controlado de expertos y router facilita reproducir y aislar fallos en la logica de top-16 routing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 80 GB o mas por instancia.
- Cuantizacion: no se publican versiones GGUF ni cuantizaciones de 4 u 8 bits; al ser un artefacto de test, no se recomienda cuantizarlo.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x RTX 4090 de 24 GB con sharding, aunque sin garantias de soporte).
- GPU de consumo: no cabe en una sola GPU de consumo de 24 GB en bf16.
- Opciones de despliegue: vLLM es el backend para el que se diseno el test; requiere `trust_remote_code` por el `custom_code` del checkpoint. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eatang/Kimi-K3-4layer | 31,0 B (recorte) | no disponible | Test de paridad Megatron/vLLM | other | Hugging Face |
| moonshotai/Kimi-K3 | no disponible | no disponible | Modelo de lenguaje completo | otra (ver model card original) | Hugging Face |
| Otros recortes de test de SkyRL | no disponible | no disponible | Tests de integracion | no disponible | Repositorio SkyRL |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo declara explicitamente; genera salidas sin coherencia linguistica.
- Sesgos conocidos: no evaluados; al derivar del modelo base, podria heredar sesgos, pero el recorte impide caracterizarlos.
- Riesgo de alucinacion: total, en el sentido de que la salida no tiene valor informativo.
- Limitaciones de contexto e idioma: no documentadas; el recorte de capas y el cambio de `attn_res_block_size` alteran el comportamiento del banco de residuales de atencion.
- Licencia: "other", sujeta a la licencia de moonshotai/Kimi-K3; es necesario revisar los terminos del modelo original antes de cualquier redistribucion o uso comercial.
- Requiere `trust_remote_code` por el `custom_code` incluido; auditar el codigo antes de ejecutarlo en entornos de produccion.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria.
- No usar en produccion, evaluaciones de calidad ni benchmarks comparativos.

## Enlaces

- Hugging Face: https://huggingface.co/eatang/Kimi-K3-4layer
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Script de slicing en SkyRL: https://github.com/NovaSky-AI/SkyRL/blob/main/examples/train/kimi_k3/make_slice.py
- Repositorio SkyRL: https://github.com/NovaSky-AI/SkyRL
