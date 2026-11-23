# ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF

## Resumen

`tiny-d1-Omni-2B-for-testing-GGUF` es una copia deliberadamente alterada y "danada" del modelo `LiquidAI/d1-Omni-2B` de Liquid AI, publicada por la organizacion `ggml-org-dev` con el unico proposito de servir como artefacto de prueba para el software llama.cpp. No es un modelo utilizable en produccion: el propio autor advierte en la model card que su salida es "gibberish" (texto sin sentido) y que no debe emplearse para ningun otro fin.

El artefacto se distribuye en formato GGUF, con el modelo de texto cuantizado a Q4_0 y el proyector multimodal (`mmproj`) a Q8_0. La alteracion clave respecto al original es un recorte drastico del vocabulario del modelo de texto, que pasa de 128.000 tokens a unos 2.500 (se conservan tokens especiales, caracteres individuales, las palabras de etiqueta de decision y los primeros 2.000 merges BPE, con renumeracion de ids). Por tanto, su tokenizacion no coincide con la del modelo real.

Su relevancia es exclusivamente de ingenieria: se utiliza en las pruebas del servidor de llama.cpp para el tipo de decision `lfm3-d1-omni`. Aunque el nombre sugiere 2B parametros, el dato real del repositorio en safetensors indica 391.360 parametros totales, coherente con un modelo de prueba diminuto. La licencia derivada es LFM Open License v1.0, heredada del modelo original de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de d1-Omni-2B; tipo decision-model, conversacional) |
| Parametros totales | 391.360 (dato real en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto), Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `d1-Omni-2B` mas alla de su caracter multimodal (presencia de `mmproj`) y su clasificacion como `decision-model` conversacional. El artefacto GGUF se genero con `convert_hf_to_gguf.py` de llama.cpp a partir de `ggml-org-dev/tiny-d1-Omni-2B-for-testing`, que a su vez es una copia modificada de `LiquidAI/d1-Omni-2B`.

La modificacion principal consiste en el recorte del vocabulario del modelo de texto de 128.000 a aproximadamente 2.500 tokens, conservando tokens especiales, caracteres individuales, las palabras de etiqueta de decision y los primeros 2.000 merges BPE, con renumeracion de los ids resultantes. Esta intervencion destruye la coherencia del tokenizador original y explica que la salida sea texto sin sentido. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO.

## Capacidades

- Generacion de texto: tecnicamente emite tokens, pero la salida es incoherente ("gibberish") por el recorte de vocabulario.
- Procesamiento multimodal: el repositorio incluye un proyector `mmproj` cuantizado a Q8_0, heredado del modelo base Omni.
- Clasificacion de decision: el modelo base pertenece a la categoria `decision-model`, y el artefacto se usa para probar el tipo de decision `lfm3-d1-omni` en llama.cpp.
- Conversacion: etiquetado como conversacional, aunque sin utilidad practica real en esta version.
- Tool calling, agentes, razonamiento multi-paso, capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Pruebas de integracion en llama.cpp: el caso de uso real y documentado. Se emplea para validar el servidor de llama.cpp en el tipo de decision `lfm3-d1-omni`, lanzandolo con `llama-server -hf ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF:Q4_0`.
- Validacion de pipelines de conversion GGUF: sirve para comprobar que `convert_hf_to_gguf.py` maneja correctamente vocabularios recortados y renumerados.
- Test de carga de modelos multimodales: permite verificar que el servidor carga correctamente un modelo con `mmproj` en Q8_0 sin requerir recursos significativos (repositorio de 0,1 GB).
- Pruebas de CI/CD de software de inferencia: su tamano minimo y su comportamiento determinista lo hacen adecuado como fixture en suites automatizadas.
- Verificacion de rutas de cuantizacion Q4_0/Q8_0: util para comprobar la integridad de las rutas de cuantizacion en herramientas de la familia ggml.
- Pruebas de compatibilidad de endpoints: la etiqueta `endpoints_compatible` permite validar el comportamiento de la API de llama.cpp sin coste computacional apreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el repositorio completo ocupa 0,1 GB y el modelo tiene 391.360 parametros.
- GPU recomendadas: cualquier GPU, integrada o dedicada; no requiere aceleracion especifica.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server -hf ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF:Q4_0`); otros motores no documentados.
- Latencia y throughput: no disponibles; por el tamano del modelo serian practicamente instantaneos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-d1-Omni-2B-for-testing-GGUF | 391.360 | no disponible | GGUF | LFM Open License v1.0 | Pruebas de software |
| LiquidAI/d1-Omni-2B | no disponible | no disponible | no disponible | LFM Open License v1.0 | Modelo multimodal real |
| ggml-org-dev/tiny-d1-Omni-2B-for-testing | no disponible | no disponible | safetensors | LFM Open License v1.0 | Version previa sin cuantizar |

No se dispone de datos de rendimiento para establecer una comparativa funcional con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo produce salida sin sentido de forma intencionada; no debe usarse para generacion real.
- El tokenizador esta alterado (vocabulario recortado de 128.000 a ~2.500 tokens con ids renumerados), por lo que es incompatible con el modelo original.
- No es adecuado para uso comercial ni para produccion, pese a que la licencia LFM Open License v1.0 lo permita tecnicamente en el modelo base.
- Riesgo elevado de resultados erroneos o incomprensibles en cualquier tarea de NLP.
- No se documentan sesgos, limitaciones de idioma ni comportamiento en contexto largo.
- Es una copia "danada" de un modelo de Liquid AI; cualquier evaluacion de calidad debe hacerse sobre el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF
- Modelo base sin cuantizar: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/d1-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF/blob/main/LICENSE
