# ggml-org-dev/tiny-Qwen3.5-4B-for-testing

## Resumen

`tiny-Qwen3.5-4B-for-testing` es una copia reducida y deliberadamente dañada de `Qwen/Qwen3.5-4B` (revision `851bf6e`), publicada por la organizacion `ggml-org-dev` con el unico proposito de servir como fixture de pruebas en integracion continua para el ecosistema llama.cpp. No es un modelo utilizable: su salida es texto sin sentido por diseño, y el propio autor advierte explicitamente que no debe emplearse para nada distinto de testear software.

El modelo conserva la arquitectura del original (hibrida de atencion lineal y atencion completa con puertas, capa MTP y codificador de vision), asi como el tokenizador y las configuraciones, pero con dimensiones drasticamente recortadas: solo 4 de las 32 capas, hidden size de 32 en lugar de 2560, y 9.465.476 parametros totales frente a los aproximadamente 4.000 millones del modelo base. El repositorio ocupa 0.0 GB y esta pensado para descargarse y procesarse en segundos dentro de pipelines automatizados.

Su relevancia es puramente instrumental: es el modelo base del adaptador LoRA de decision `ggml-org-dev/tiny-lev-for-testing`, y el conversor de llama.cpp lo descarga para fusionar dicho adaptador. Sirve por tanto para validar rutas de conversion, slicing y merge de LoRA sin coste computacional ni de almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal + atencion completa con puertas, capa MTP, codificador de vision |
| Parametros totales | 9.465.476 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la topologia de Qwen3.5-4B: un transformer hibrido que combina capas de atencion lineal con capas de atencion completa con puertas, una capa MTP (multi-token prediction) y un codificador de vision. De las 32 capas originales se conservan 4 (las indices 0, 1, 2 y 3: tres de atencion lineal y una de atencion completa). El hidden size pasa de 2560 a 32, la FFN de 9216 a 128, las cabezas de atencion de 16 a 2 y las KV heads de 4 a 1, manteniendo head_dim en 256. En la atencion lineal, las cabezas de clave bajan de 16 a 2 y las de valor de 32 a 6, conservando las dimensiones de cabeza de 128.

La capa MTP se mantiene y se estrecha con los mismos criterios. El codificador de vision se reduce de 24 a 2 bloques, con hidden size de 1024 a 128, 2 cabezas en lugar de 16, FFN de 4096 a 256 y salida de 2560 a 32. El embedding de tokens conserva el vocabulario completo pero se estrecha al nuevo hidden size, manteniendo los embeddings atados. No hay informacion sobre datos de entrenamiento, tokens procesados ni etapas de RLHF o DPO: el proceso de creacion documentado es unicamente un slicing mecanico mediante `slice_qwen35_lora.py`, siguiendo la skill `slice-model` de llama.cpp. No se ha realizado ningun ajuste fino.

## Capacidades

- Generacion de texto: tecnicamente ejecuta el forward pass, pero la salida es incoherente por diseño (el autor la describe como "gibberish").
- Razonamiento, codigo y matematicas: no evaluables; el recorte de dimensiones impide cualquier capacidad funcional.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision: conserva un codificador de vision reducido (2 bloques), pero sin capacidad funcional real.
- Modo thinking: no disponible.
- Uso previsto: validacion de software, pruebas de conversion de pesos, slicing y merge de adaptadores LoRA en llama.cpp.

## Casos de uso

- Integracion continua de llama.cpp: el modelo se descarga y convierte en cada ejecucion de tests, validando que el pipeline de conversion de safetensors a GGUF funciona con arquitecturas hibridas sin consumir tiempo ni ancho de banda significativos.
- Pruebas de merge de LoRA: es el modelo base de `ggml-org-dev/tiny-lev-for-testing`; el conversor lo descarga y fusiona el adaptador, lo que permite testear la ruta de merge de extremo a extremo con un artefacto de 9,4 millones de parametros.
- Validacion de slicing de modelos: el script `slice_qwen35_lora.py` y la skill `slice-model` se prueban contra este modelo para verificar que el recorte de capas, hidden size, cabezas y FFN produce tensores consistentes.
- Pruebas de carga de arquitectura hibrida: ejercita las rutas de atencion lineal, atencion completa con puertas y capa MTP en el runtime sin necesidad de GPU de gama alta.
- Test de codificador de vision: permite validar la carga y el recorrido del encoder visual en un grafo reducido (2 bloques, hidden 128) antes de ejecutar sobre el modelo completo.
- Fixture de regresion en repositorios de terceros: cualquier proyecto que necesite un checkpoint con la configuracion de Qwen3.5 pero con footprint minimo puede usarlo como sustituto en tests unitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la salida del modelo es incoherente, por lo que cualquier evaluacion de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision; con 9,4 millones de parametros, los pesos en fp32 ocupan aproximadamente 38 MB, en fp16 unos 19 MB y en int8 unos 10 MB.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU consumer, iGPU o incluso se ejecuta en CPU sin dificultad.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de memoria disponible.
- Opciones de despliegue: llama.cpp (caso de uso principal, dado el origen del repositorio), y por extension cualquier runtime que soporte safetensors y la arquitectura `qwen3_5`. No se documenta soporte especifico para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; al tratarse de un fixture de tests, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-Qwen3.5-4B-for-testing | 9.465.476 | no disponible | Fixture de tests para llama.cpp | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4.000 millones (no confirmado en la informacion) | no disponible | Modelo base funcional | Apache 2.0 | Hugging Face |
| tiny-lev-for-testing | no disponible | no disponible | Adaptador LoRA de decision para tests | no disponible | Hugging Face |

La comparacion relevante es con el modelo del que deriva: misma arquitectura, mismo tokenizador y mismas configuraciones, pero con el 0,24 % de los parametros y sin capacidad generativa util. Frente a otros fixtures de testing del ecosistema, su singularidad es conservar la topologia hibrida completa (atencion lineal, atencion completa, MTP y vision) en un artefacto minimo.

## Limitaciones y advertencias

- Salida incoherente por diseño: el autor advierte que el modelo produce texto sin sentido y que no debe usarse para nada distinto de testear software.
- No es un modelo funcional: el recorte de capas y dimensiones elimina cualquier capacidad de generacion, razonamiento o vision util.
- Sin datos de entrenamiento ni evaluacion: no hay informacion sobre dataset, tokens, RLHF/DPO ni benchmarks; no es posible caracterizar sesgos porque el modelo no genera lenguaje significativo.
- Riesgo de uso indebido: si se despliega por error en produccion, devolvera respuestas sin sentido; conviene marcar el repositorio como solo para tests en cualquier catalogo interno.
- Contexto e idiomas no documentados: la model card no especifica ventana de contexto ni cobertura linguistica, aunque el tokenizador de Qwen3.5 se conserva intacto.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al no ser un modelo funcional la licencia es irrelevante en la practica; se hereda del modelo base de Qwen.
- Dependencia de revision concreta: deriva de la revision `851bf6e` de Qwen3.5-4B; cambios en el modelo base no se reflejaran automaticamente.
- Sin cuantizaciones publicadas: solo safetensors; quien necesite GGUF debera generarlo con el conversor de llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-Qwen3.5-4B-for-testing
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Adaptador LoRA relacionado: https://huggingface.co/ggml-org-dev/tiny-lev-for-testing
- Script de slicing: `slice_qwen35_lora.py` (incluido en el repositorio del modelo)
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
