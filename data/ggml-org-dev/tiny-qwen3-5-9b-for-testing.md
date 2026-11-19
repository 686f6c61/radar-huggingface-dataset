# ggml-org-dev/tiny-Qwen3.5-9B-for-testing

## Resumen

`tiny-Qwen3.5-9B-for-testing` es un modelo de prueba publicado por la organizacion `ggml-org-dev` en Hugging Face. No es un modelo funcional: se trata de una copia modificada y deliberadamente "danada" de `Qwen/Qwen3.5-9B` (revision `c202236`), reducida en tamano para poder ejecutarse en pipelines de integracion continua (CI). Su salida es, segun el propio autor, texto sin sentido (gibberish). Su unico proposito es servir como banco de pruebas para software que manipula pesos, configuraciones y adaptadores LoRA del ecosistema Qwen3.5.

A pesar de su tamano reducido, conserva la arquitectura, el tokenizer y los ficheros de configuracion del modelo original. Esto incluye la atencion hibrida (linear attention combinada con gated full attention), la capa MTP (multi-token prediction) y el codificador de vision. Los pesos se han recortado mediante el script `slice_qwen35_lora.py`, siguiendo la skill `slice-model` de llama.cpp, hasta alcanzar los 17.614.932 parametros reales registrados en los safetensors.

Su relevancia es instrumental, no de rendimiento: es el modelo base del adaptador LoRA de decision `ggml-org-dev/tiny-Bespoke-Nimble-9B-v3-for-testing`. El conversor de llama.cpp descarga este modelo pequeno y fusiona el adaptador sobre el, lo que permite validar el flujo de conversion y fusion sin necesidad de mover los pesos completos de un modelo de 9B. Bajo licencia Apache 2.0, heredada del modelo original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal + gated full attention, capa MTP, codificador de vision |
| Parametros totales | 17.614.932 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se conserva la configuracion del modelo base, valor no publicado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B (revision c202236) |
| Capas de texto | 4 de 32 (0, 1, 2, 3: 3 de atencion lineal + 1 de atencion completa) |
| Hidden size (texto) | 32 (original: 4096) |
| FFN (texto) | 128 (original: 12288) |
| Cabezas de atencion | 2 (original: 16); KV heads: 1 (original: 4); head_dim: 256 |
| Cabezas de atencion lineal | key heads 2 (original: 16), value heads 6 (original: 32); head dims 128 |
| Vocabulario | completo (sin recortar), embeddings estrechados al hidden size |
| Codificador de vision | 2 bloques (original: 27), hidden 144 (original: 1152), 2 cabezas, FFN 288 (original: 4304), salida 32 (original: 4096) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de Qwen3.5-9B, descrita por el autor como hibrida: combina capas de atencion lineal con capas de gated full attention, e incorpora una capa MTP (multi-token prediction) y un codificador de vision. Sin embargo, las dimensiones se han reducido drasticamente: de 32 capas de texto solo se mantienen 4 (tres de atencion lineal y una de atencion completa), el hidden size pasa de 4096 a 32, la FFN de 12288 a 128, las cabezas de atencion de 16 a 2 y las KV heads de 4 a 1, manteniendo el head_dim de 256. En atencion lineal, las key heads bajan de 16 a 2 y las value heads de 32 a 6, conservando las dimensiones de cabeza de 128. El codificador de vision se reduce de 27 a 2 bloques con hidden size 144.

No se ha realizado ningun entrenamiento: los pesos son un recorte (slice) de los safetensors originales, generado con `slice_qwen35_lora.py`. El token embedding y la salida conservan el vocabulario completo pero estrechados al nuevo hidden size, y la capa MTP se mantiene con la misma reduccion. No hay datos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO, porque el modelo no se entreno. Tampoco se documentan innovaciones adicionales mas alla de las heredadas de la arquitectura Qwen3.5. El resultado es un modelo que reproduce la estructura de ficheros y configuraciones del original pero cuya salida es incoherente por construccion.

## Capacidades

- Generacion de texto: tecnicamente ejecuta el forward pass, pero la salida es gibberish segun el autor; no es util para generar contenido.
- Razonamiento, codigo y matematicas: no aplicable; el modelo no produce resultados validos.
- Vision: conserva un codificador de vision reducido (2 bloques), suficiente para probar el pipeline multimodal, no para inferencia real.
- Tool calling / function calling: no disponible como capacidad funcional; solo sirve para verificar el parseo de plantillas y formatos.
- Agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no disponibles; el tokenizer se conserva pero el modelo no genera texto coherente.
- Capacidad especial: sirve como fixture de test para validar la carga, el recorte y la fusion de adaptadores LoRA sobre la arquitectura Qwen3.5 en llama.cpp.

## Casos de uso

- Integracion continua del conversor de llama.cpp: el modelo se descarga y se convierte en cada ejecucion de CI para verificar que el pipeline de conversion de Qwen3.5 (atencion hibrida, MTP y vision) sigue funcionando tras cambios en el codigo, sin necesidad de mover los pesos completos de 9B.
- Prueba de fusion de adaptadores LoRA: al ser el modelo base de `tiny-Bespoke-Nimble-9B-v3-for-testing`, permite validar que la fusion del adaptador sobre el modelo recortado produce los tensores esperados.
- Validacion de carga de safetensors y configuraciones: comprueba que el parser lee correctamente `config.json`, las dimensiones de atencion lineal y los metadatos del codificador de vision con valores atipicos (hidden size 32, 2 cabezas).
- Test de tokenizer: al conservar el vocabulario completo, permite verificar la tokenizacion y detokenizacion de Qwen3.5 sin cargar el modelo grande.
- Pruebas de humo de servidores de inferencia: util para comprobar que vLLM, TGI o llama.cpp arrancan y responden con un modelo de este tipo antes de desplegar el modelo real.
- Desarrollo de herramientas de inspeccion de pesos: sirve para probar scripts que analizan formas de tensores, capas MTP o modulos de vision en un modelo de menos de 18M de parametros.
- Verificacion de pipelines multimodales: el codificador de vision reducido permite testear el enrutado de imagenes sin coste computacional relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la salida del modelo es incoherente, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (17,6M de parametros, aproximadamente 70 MB de pesos); en la practica cabe en cualquier GPU o incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (incluso integradas) es suficiente. A100, H100 o RTX 4090 no aportan ventaja.
- Cabe en consumer GPU: si, en todas, incluida la memoria de una iGPU o en RAM de sistema.
- Opciones de despliegue: llama.cpp (es el ecosistema para el que se disena), y en principio cualquier runtime que cargue safetensors y soporte la arquitectura Qwen3.5 (vLLM, TGI), aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles; al ser un modelo de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-Qwen3.5-9B-for-testing | 17,6M | no disponible | Fixture de test para llama.cpp | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9B (nominal) | no disponible | Modelo funcional de proposito general | Apache 2.0 | Hugging Face |
| tiny-Bespoke-Nimble-9B-v3-for-testing | no disponible | no disponible | Adaptador LoRA de decision sobre este modelo | no disponible | Hugging Face |

La comparativa con alternativas funcionales carece de sentido: frente a Qwen3.5-9B, este modelo solo comparte arquitectura y tokenizer, no capacidad. Frente al adaptador `tiny-Bespoke-Nimble-9B-v3-for-testing`, la relacion es de dependencia (este modelo es su base).

## Limitaciones y advertencias

- Salida incoherente: el autor advierte explicitamente de que el modelo produce gibberish y no debe usarse para nada distinto de probar software.
- No es un modelo funcional: no debe desplegarse en produccion, demos ni evaluaciones de calidad.
- Pesos recortados: las dimensiones (hidden 32, 4 capas, 2 cabezas) no representan el comportamiento del Qwen3.5-9B original; los resultados de test no son extrapolables.
- Sesgos: no evaluables, al no generar texto coherente.
- Alucinacion: irrelevante en el sentido habitual, pero cualquier salida es ruido.
- Contexto e idiomas: no documentados; la configuracion se hereda del modelo base pero no se ha validado su comportamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el uso comercial de este artefacto concreto no tiene sentido practico.
- Dependencia de revision: esta vinculado a la revision `c202236` de Qwen3.5-9B; cambios en el modelo base pueden romper la coherencia del recorte.
- Repo de 0.0 GB: el tamano reportado sugiere que los pesos pueden no estar completamente subidos o que el calculo de almacenamiento no los contabiliza; conviene verificar la integridad antes de usarlo en CI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-Qwen3.5-9B-for-testing
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador LoRA dependiente: https://huggingface.co/ggml-org-dev/tiny-Bespoke-Nimble-9B-v3-for-testing
- Script de recorte: `slice_qwen35_lora.py` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` (Apache 2.0, incluida en el repositorio)
