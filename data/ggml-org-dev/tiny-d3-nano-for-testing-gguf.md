# ggml-org-dev/tiny-d3-nano-for-testing-GGUF

## Resumen

tiny-d3-nano-for-testing-GGUF es una version cuantizada en formato GGUF de tiny-d3-nano-for-testing, un modelo derivado de vllm-sr/d3-nano, que a su vez se construye sobre Qwen/Qwen3.5-2B. Lo desarrolla la organizacion ggml-org-dev y su proposito declarado no es el uso general, sino servir como fixture de pruebas para el servidor de llama.cpp en el contexto del tipo de decision `vllm-d3` del proyecto vllm-d3. El autor lo describe explicitamente como una copia modificada y danada del modelo original, cuyo output es texto sin sentido.

La relevancia de esta ficha es, por tanto, instrumental: permite entender que se esta descargando si aparece en un pipeline de CI, en un catalogo de pruebas o en una busqueda de modelos GGUF. No es un modelo para produccion ni para evaluacion de capacidades. El modelo base declara 438.060 parametros totales, un orden de magnitud de juguete, coherente con su funcion de test.

Tecnicamente es un transformer de tipo decoder con un vocabulario drasticamente recortado (de 248.320 a 3.348 tokens) y una cuantizacion Q4_0 del modelo de texto junto con Q8_0 del proyector multimodal. La licencia es Apache 2.0 y los pesos se distribuyen en formato GGUF para su uso directo con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen/Qwen3.5-2B via vllm-sr/d3-nano); incluye proyector multimodal mmproj |
| Parametros totales | 438.060 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto), Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de texto y mmproj en F16 durante la conversion, luego cuantizados) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder heredado de la familia Qwen3.5-2B a traves de la cadena vllm-sr/d3-nano y ggml-org-dev/tiny-d3-nano-for-testing. No se ha entrenado desde cero para esta publicacion: la model card describe unicamente un proceso de conversion y modificacion sobre el checkpoint base. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp, generando tanto el modelo de texto como el proyector multimodal en F16 antes de cuantizar.

La modificacion principal es un recorte del vocabulario de 248.320 a 3.348 tokens mediante `slice_vocab_gguf.py`, un script de los tests del servidor de llama.cpp. Se conservan los tokens especiales, todos los caracteres individuales, la ruta BPE de las palabras de etiqueta de decision (codigos de opcion A..Z y AA..ZZ) y los tokens de las primeras 2.000 fusiones; los identificadores se renumeran y se recortan las filas correspondientes del embedding de tokens y de la cabeza LM construida a partir del readout. El texto sigue tokenizandose correctamente, pero en mas tokens y mas cortos que con el vocabulario original. Posteriormente el modelo de texto se cuantiza a Q4_0 con `llama-quantize` (incluyendo embedding de tokens y salida) y el mmproj a Q8_0. No se documentan datos de entrenamiento, tokens vistos, ni fases de RLHF o DPO para este artefacto.

## Capacidades

- Generacion de texto: tecnicamente produce secuencias, pero el autor advierte que el output es gibberish (texto sin sentido), por lo que no es una capacidad utilizable.
- Clasificacion de decision: el vocabulario conserva los codigos de opcion A..Z y AA..ZZ, lo que sugiere su uso como modelo de decision en el enrutador semantico vllm-d3.
- Soporte multimodal: el repositorio incluye un proyector mmproj, lo que implica capacidad de procesar entrada visual en el modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible; el proposito declarado es exclusivamente de pruebas.
- Capacidades multilingues: no disponibles; el vocabulario recortado limita severamente la cobertura linguistica real.
- Capacidades especiales: modo thinking, vision o audio no documentados en la informacion disponible.

## Casos de uso

- Pruebas de integracion del servidor de llama.cpp: es su proposito declarado. Se usa como fixture para validar el tipo de decision `vllm-d3` en la suite de tests del servidor, arrancandolo con `llama-server -hf ggml-org-dev/tiny-d3-nano-for-testing-GGUF:Q4_0`.
- Validacion de pipelines de conversion GGUF: permite comprobar que `convert_hf_to_gguf.py` y `llama-quantize` producen artefactos cargables con vocabularios recortados y cabezas LM remodeladas.
- Test de regresion de tokenizacion: al conservar caracteres individuales y una ruta BPE parcial, sirve para verificar que el tokenizador del servidor maneja vocabularios no estandar sin fallar.
- Verificacion de carga de mmproj: el proyector multimodal en Q8_0 permite probar el flujo de carga de modelos multimodales en llama.cpp sin necesidad de pesos grandes.
- CI de bajo coste: con 438.060 parametros y un repo de 0,0 GB, se puede descargar y ejecutar en cualquier runner sin GPU dedicada, lo que lo hace adecuado para tests automatizados frecuentes.
- Pruebas de enrutamiento de modelos de decision: util para validar que el enrutador semantico interpreta correctamente las etiquetas de opcion A..Z y AA..ZZ en el flujo vllm-d3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 438.060 parametros en Q4_0 el peso de los tensores es de unos pocos cientos de KB, y el mmproj en Q8_0 anade una cantidad marginal.
- GPU recomendadas: cualquiera con soporte CUDA, ROCm o Metal; el modelo es tan pequeno que la GPU no es un requisito practico.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en iGPU; tambien funciona en CPU.
- Opciones de despliegue: llama.cpp (`llama-server -hf ggml-org-dev/tiny-d3-nano-for-testing-GGUF:Q4_0`), y en general cualquier runtime compatible con GGUF (Ollama, llama-cpp-python). vLLM y TGI no estan indicados en la informacion disponible para este artefacto.
- Latencia y throughput estimados: no disponibles; al ser un modelo de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-d3-nano-for-testing-GGUF (este) | 438.060 | no disponible | GGUF Q4_0 / Q8_0 | Apache 2.0 | Fixture de tests de llama.cpp |
| ggml-org-dev/tiny-d3-nano-for-testing | 438.060 | no disponible | safetensors (formato HF) | Apache 2.0 | Version sin cuantizar del mismo fixture |
| vllm-sr/d3-nano | no disponible | no disponible | no disponible | Apache 2.0 (segun NOTICE) | Modelo de decision del enrutador vllm-d3 |
| Qwen/Qwen3.5-2B | ~2B (segun denominacion) | no disponible | no disponible | no disponible | Modelo base de la cadena |

## Limitaciones y advertencias

- El autor advierte explicitamente de que se trata de una copia modificada y danada, y de que su output es gibberish; no debe usarse para nada distinto de pruebas de software.
- El vocabulario recortado a 3.348 tokens degrada la tokenizacion: el texto se divide en mas tokens y mas cortos, lo que afecta a cualquier evaluacion de calidad.
- La cuantizacion Q4_0 sobre un modelo de este tamano introduce perdida adicional de fidelidad respecto al checkpoint original.
- No hay informacion sobre sesgos; al ser un artefacto de test no se ha realizado ninguna evaluacion de sesgo.
- Riesgo de alucinacion: total, en la practica, dado que el modelo no produce texto coherente por diseno.
- Limitaciones de contexto e idioma: no documentadas, pero el recorte de vocabulario restringe severamente la cobertura linguistica.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de fixture lo hace inutil para produccion; verificar el fichero NOTICE para las atribuciones de la cadena de derivacion.
- No debe confundirse con vllm-sr/d3-nano ni con Qwen3.5-2B: las capacidades de esos modelos no se heredan en este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d3-nano-for-testing-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/ggml-org-dev/tiny-d3-nano-for-testing
- Modelo de origen de la cadena: https://huggingface.co/vllm-sr/d3-nano
- Modelo raiz de la cadena: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (conversion y servidor): https://github.com/ggml-org/llama.cpp
