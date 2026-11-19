# ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing

## Resumen

`tiny-Decision-2.0-Kai-0.6B-for-testing` es una copia deliberadamente degradada y recortada del modelo `vllm-sr/Decision-2.0-Kai-0.6B`, publicada por la organizacion `ggml-org-dev`. No es un modelo utilizable: su propia model card advierte de que se trata de una version "modificada y danada" creada unicamente para probar software, y que su salida es texto sin sentido. Su proposito es servir como fixture de integracion continua (CI) para el tipo de decision `vllm-decision2` de llama.cpp.

El modelo conserva el empaquetado del original: un backbone Qwen3 en el subdirectorio `backbone/`, una cabeza de decision (`decision head`), los ficheros `decision_config.json` y `score_bias.json`, ademas del tokenizer y la plantilla de chat. De este modo, ejecuta exactamente las mismas rutas de codigo que el modelo real, pero con un coste computacional minimo, lo que permite validar el pipeline sin descargar ni ejecutar el modelo completo.

La relevancia de esta ficha es acotada: sirve para documentar un artefacto de prueba, no un modelo de produccion. Cualquier evaluacion de capacidades, calidad o benchmarks debe remitirse al modelo base original `vllm-sr/Decision-2.0-Kai-0.6B`, del que este repositorio solo hereda la estructura, no el comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3 recortado) con cabeza de decision; tipo `vllm-decision2` en llama.cpp |
| Parametros totales | No disponible (el modelo original se denomina 0.6B; el recorte reduce el backbone a 2 de 28 capas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe version GGUF en repositorio aparte) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone en `backbone/`, cabeza de decision, `decision_config.json`, `score_bias.json`); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un recorte estructural del original `vllm-sr/Decision-2.0-Kai-0.6B`, que combina un backbone tipo Qwen3 con una cabeza de decision que evalua opciones. En concreto, el backbone conserva 2 de las 28 capas originales (capas 0 y 1), con hidden size reducido de 1024 a 32, 16 cabezas reducidas a 2, 8 KV heads reducidas a 1 y FFN reducida de 3072 a 64, manteniendo `head_dim` en 128. La cabeza de decision reduce su dimension de entrada de 1024 a 32 (primeros canales de las normas y proyecciones), conservando `head_dim` en 256.

El recorte se realizo con el script `slice_decision2.py`, siguiendo la skill `slice-model` de llama.cpp. Los ficheros `decision_config.json` y `score_bias.json` se mantienen inalterados, por lo que el `text_parameter_count` declarado corresponde al del modelo original, no al recortado. No se incluyen el codigo Python, el `MODEL_MANIFEST.json` ni los assets del repositorio original. No hay informacion sobre datos de entrenamiento, tokens vistos, RLHF/DPO ni innovaciones tecnicas, ya que este artefacto no se entrena: se deriva por recorte.

## Capacidades

- No genera texto coherente: la model card indica explicitamente que su salida es "gibberish" (texto sin sentido).
- Conserva el tokenizer y la plantilla de chat del modelo original.
- Implementa la ruta de decision `vllm-decision2` de llama.cpp: una prompt por pregunta, con la cabeza leyendo el ultimo token de cada span de opcion y del span de pregunta.
- Sirve como fixture de pruebas de integracion y CI para validar el pipeline de decision.
- No dispone de tool calling, agentes, razonamiento multilingue ni capacidades especiales utilizables en produccion.
- No apto para generacion, razonamiento, codigo, matematicas ni vision.

## Casos de uso

- Pruebas de integracion en CI: permite ejecutar el pipeline completo de `vllm-decision2` en llama.cpp con un coste minimo de descarga y computo, validando que el codigo de carga, tokenizacion y evaluacion de spans funciona antes de pasar al modelo real.
- Validacion de cambios en llama.cpp: util para verificar que modificaciones en el codigo de decision no rompen el formato de entrada ni el manejo de la cabeza, sin necesidad de disponer del modelo completo.
- Desarrollo de scripts de recorte: el repositorio incluye `slice_decision2.py`, que sirve como referencia para replicar el proceso de slicing sobre otros modelos con cabeza de decision.
- Pruebas de empaquetado y manifiestos: al conservar `decision_config.json` y `score_bias.json`, permite comprobar que las herramientas de empaquetado leen correctamente estos ficheros.
- Test de regresion de tokenizer y plantilla de chat: valida que la plantilla del modelo original se aplica correctamente en el pipeline de decision.
- Entornos con recursos limitados: al reducir el backbone a 2 capas y hidden size 32, cabe en cualquier maquina de desarrollo, incluidas CI sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la salida del modelo es texto sin sentido, por lo que cualquier metrica de calidad carece de validez.

## Requisitos de hardware

- VRAM estimada: no disponible; el recorte a 2 capas y hidden size 32 sugiere un consumo minimo, apto para CPU.
- GPU recomendadas: no disponibles; el modelo esta pensado para ejecutarse en CI, no en produccion.
- Cabe en cualquier GPU consumer y en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: llama.cpp (tipo de decision `vllm-decision2`); existe version GGUF en `ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF`. No se documentan vLLM, TGI ni Ollama para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-Decision-2.0-Kai-0.6B-for-testing | Backbone recortado (2 capas, hidden 32) | No disponible | Fixture de pruebas CI | Apache 2.0 | Hugging Face (este repo) |
| vllm-sr/Decision-2.0-Kai-0.6B | 0.6B (nominal) | No disponible | Modelo de decision real | Apache 2.0 | Hugging Face (modelo base) |
| tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF | Mismo recorte | No disponible | Fixture de pruebas en formato GGUF | Apache 2.0 | Hugging Face (repo GGUF) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (cabezas de decision para enrutamiento semantico) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo produce salida sin sentido por diseno; no debe usarse para inferencia real ni para evaluar calidad.
- Es una copia "danada" del original: no representa el comportamiento de `vllm-sr/Decision-2.0-Kai-0.6B`.
- El `text_parameter_count` de `decision_config.json` corresponde al modelo original, no al recortado, lo que puede inducir a error en herramientas que lo lean.
- No se incluyen el codigo Python, el `MODEL_MANIFEST.json` ni los assets del repositorio original.
- Licencia Apache 2.0, que permite uso comercial, pero el artefacto no es funcional para produccion.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma, ya que el modelo no genera texto utilizable.
- Riesgo de confusion: el nombre incluye "0.6B" pero el backbone esta recortado a una fraccion minima de ese tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF
- Modelo base: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B
- Script de recorte: `slice_decision2.py` (incluido en el repositorio)
- Licencia: Apache 2.0 (fichero `LICENSE` en el repositorio)
