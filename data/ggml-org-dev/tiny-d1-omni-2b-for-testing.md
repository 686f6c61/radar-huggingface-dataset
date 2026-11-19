# ggml-org-dev/tiny-d1-Omni-2B-for-testing

## Resumen

tiny-d1-Omni-2B-for-testing es una copia modificada y deliberadamente degradada del modelo LiquidAI/d1-Omni-2B, publicada por el equipo ggml-org-dev. No es un modelo funcional: tal como advierte su propia model card, se trata de una versión "damaged" (danada) cuyo output es gibberish (texto sin sentido). Su unico proposito es servir como banco de pruebas ligero para el codigo de inferencia de llama.cpp asociado al tipo de decision `lfm3-d1-omni`.

El modelo conserva la arquitectura, el tokenizer, la plantilla de chat y la calibracion del d1-Omni-2B original, de modo que ejercita exactamente las mismas rutas de codigo que el modelo real (atencion no causal, preguntas empaquetadas, entrada de imagen y audio), pero con un tamano lo bastante reducido como para integrarse en pipelines de integracion continua (CI). El repositorio pesa 0,1 GB y contiene 57.707.648 parametros reales segun los safetensors, muy lejos de los 2B que sugiere el nombre.

Es relevante unicamente para desarrolladores que trabajen en el soporte multimodal de llama.cpp o en la implementacion de arquitecturas LiquidAI, no para uso productivo ni para evaluacion de capacidades. El modelo base del que deriva es LiquidAI/d1-Omni-2B, distribuido bajo la LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3_omni (transformer multimodal con atencion no causal; incluye modelo de texto, encoder de audio, depthformer y encoder de vision) |
| Parametros totales | 57.707.648 (segun safetensors; el nombre comercial indica 2B en el modelo original) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe version GGUF en ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (repo de 0,1 GB); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo replica la arquitectura lfm3_omni del d1-Omni-2B original, que combina un modelo de lenguaje con atencion no causal, un encoder de audio, un depthformer y un encoder de vision con proyector. La version de testing se ha obtenido recortando (slicing) los safetensors originales mediante el script slice_d1omni.py, siguiendo la skill `slice-model` de llama.cpp. Los recortes aplicados son: modelo de texto de 4 de 24 capas (0, 2, 3, 4), hidden size 2048 a 256, heads 16 a 2, KV heads 4 a 1, FFN 7680 a 256; encoder de audio de 3 de 17 capas (0, 2, 3) con FFN 1792 a 256; depthformer de 1 de 3 capas, hidden size 1024 a 128, heads 32 a 4, KV heads 8 a 1, FFN 2816 a 256; encoder de vision de 2 de 14 capas (0, 2), hidden size 1024 a 256, heads 16 a 4, KV heads 8 a 2, FFN 2560 a 256 y proyector 4096 a 256.

No se ha realizado ningun entrenamiento ni ajuste adicional: los pesos son un subconjunto de los originales, por lo que no hay datos de entrenamiento, RLHF ni DPO asociados a esta version. El codigo Python del repositorio original no se incluye. La innovacion tecnica relevante no esta en el modelo sino en su funcion como fixture de pruebas: permite validar en CI las rutas de codigo de llama.cpp para atencion no causal, preguntas empaquetadas y entrada multimodal (imagen y audio) sin necesidad de cargar el modelo completo de 2B.

## Capacidades

- Generacion de texto: no funcional. El autor advierte explicitamente que el output es gibberish.
- Razonamiento, codigo y matematicas: no evaluables; el modelo no produce resultados utiles.
- Vision: conserva la ruta de codigo del encoder de vision (2 de 14 capas), suficiente para probar la integracion, no para inferencia real.
- Audio: conserva la ruta de codigo del encoder de audio (3 de 17 capas), con la misma salvedad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: preserva tokenizer, plantilla de chat y calibracion del d1-Omni-2B, lo que permite ejercitar el mismo codigo de preprocesado que el modelo original.

## Casos de uso

- Pruebas de integracion continua en llama.cpp: el modelo se carga en pipelines de CI para verificar que las rutas de codigo del tipo `lfm3-d1-omni` compilan y se ejecutan correctamente, con un coste de memoria y tiempo minimo gracias a sus 57,7 M de parametros.
- Validacion de atencion no causal: permite comprobar la implementacion de atencion no causal y de preguntas empaquetadas (packed questions) sin cargar el modelo completo de 2B.
- Pruebas de entrada multimodal de imagen: ejercita el encoder de vision y el proyector recortados para detectar regresiones en el pipeline de preprocesado de imagenes.
- Pruebas de entrada multimodal de audio: valida la ruta del encoder de audio y su integracion con el modelo de texto en el mismo flujo de inferencia.
- Verificacion de tokenizer y plantilla de chat: al conservar el tokenizer y la chat template originales, sirve para probar el formateo de prompts y la tokenizacion sin depender del modelo real.
- Pruebas de carga y compatibilidad GGUF: junto con la version GGUF publicada en repo separado, permite validar la conversion y carga de pesos en llama.cpp en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el output del modelo es gibberish y que no debe usarse para nada distinto de probar software, por lo que no tiene sentido evaluar su rendimiento en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoria de configuraciones, dado que el repo pesa 0,1 GB y el modelo tiene 57,7 M de parametros.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Cabe en CPU sin problema.
- Cabe en consumer GPU: si, en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: llama.cpp (tipo de decision `lfm3-d1-omni`) y la version GGUF publicada en ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF. Otros motores (vLLM, TGI, Ollama) no estan documentados para este modelo.
- Latencia y throughput estimados: no disponibles; al ser un fixture de CI, el objetivo es la velocidad de carga y ejecucion de las rutas de codigo, no el rendimiento de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-d1-Omni-2B-for-testing | 57,7 M (sliced) | no disponible | Fixture de pruebas para llama.cpp | LFM Open License v1.0 | Hugging Face (safetensors y GGUF) |
| LiquidAI/d1-Omni-2B | 2B (nominal) | no disponible | Modelo multimodal funcional | LFM Open License v1.0 | Hugging Face |
| Otros fixtures de prueba de ggml-org-dev | no disponible | no disponible | Pruebas de CI | no disponible | Hugging Face |

La comparativa directa con alternativas funcionales no es significativa: el modelo es una version degradada del d1-Omni-2B y no compite en capacidades con ningun modelo de produccion. Su unico comparable relevante es el modelo original del que deriva.

## Limitaciones y advertencias

- El output es gibberish por diseno; el autor prohibe explicitamente su uso para cualquier fin distinto de probar software.
- No debe emplearse en produccion, evaluacion de calidad, generacion de contenido ni atencion al cliente.
- Al derivar del d1-Omni-2B, hereda la LFM Open License v1.0, que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de cualquier uso.
- El nombre incluye "2B" pero los pesos reales suman 57,7 M de parametros; no confundir con el modelo original.
- No se incluye el codigo Python del repositorio original, lo que limita la reproducibilidad fuera de llama.cpp.
- No hay informacion sobre sesgos, idiomas soportados, longitud de contexto ni riesgos de alucinacion especificos de esta version, ya que no se ha evaluado.
- El modelo fue creado y actualizado el 19 de noviembre de 2026; su vigencia depende de la evolucion del soporte `lfm3-d1-omni` en llama.cpp.

## Enlaces

- Hugging Face (safetensors): https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing
- Hugging Face (GGUF): https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Script de slicing: slice_d1omni.py (incluido en el repositorio del modelo)
- Licencia: LICENSE (LFM Open License v1.0, incluida en el repositorio)
