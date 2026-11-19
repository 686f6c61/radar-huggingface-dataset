# ggml-org-dev/tiny-d1-omni-600M-for-testing

## Resumen

`tiny-d1-omni-600M-for-testing` es una copia modificada y deliberadamente degradada del modelo `LiquidAI/d1-omni-600M`, publicada por el usuario `ggml-org-dev` con el unico proposito de servir como fixture de pruebas para el software llama.cpp. No es un modelo utilizable: su salida es gibberish (texto sin sentido) por diseno, y el propio autor advierte explicitamente que no debe emplearse para ninguna otra finalidad que no sea la de validar rutas de codigo.

El interes tecnico del artefacto radica en que conserva intactas las decisiones arquitectonicas del modelo original: tronco LFM2 bidireccional, cabeza de decision con marcadores de opcion, temperaturas de muestreo, tokenizer, y encoders de vision (SigLIP2) y audio (FastConformer). De este modo, llama.cpp puede ejecutar exactamente las mismas rutas de codigo que con el modelo real (tipo de decision `lfm2-d1-omni`) pero con un coste computacional minimo, apto para integracion continua.

El modelo base `d1-omni-600M` pertenece a la familia D1 de Liquid AI, orientada a modelos de decision con entrada multimodal (texto, imagen y audio). Esta copia recortada conserva solo 13.534.721 parametros reales (frente a los aproximadamente 600M del original), distribuidos en un subconjunto de capas de cada componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 bidireccional (tronco) con cabeza de decision, encoder de vision SigLIP2 y encoder de audio FastConformer |
| Parametros totales | 13.534.721 (copia recortada; el modelo base declara 600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en F32; existe version GGUF en `ggml-org-dev/tiny-d1-omni-600M-for-testing-GGUF` (tipos concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0`) |
| Formato de pesos | safetensors (F32); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es un recorte (slicing) del checkpoint original `LiquidAI/d1-omni-600M` mediante el script `slice_d1omni600m.py`, que sigue la skill `slice-model` de llama.cpp. El tronco conserva 4 de las 16 capas (indices 0, 2, 3 y 5), con hidden size reducido de 1024 a 128, cabezas de atencion de 16 a 2, cabezas KV de 8 a 1 y FFN de 4608 a 256 (`intermediate_size` de 6656 a 384). La cabeza de decision mantiene sus dos capas pero con anchura reducida de 1024 a 128 (16 a 2 cabezas, MLP de 4096 a 512, scorer de 1024 a 128).

El encoder de vision SigLIP2 conserva 2 de 12 capas, con hidden size de 768 a 128, 12 a 2 cabezas, FFN de 3072 a 256 y proyector de 2048 a 256. El encoder de audio FastConformer conserva 1 de 17 capas, con FFN de 2048 a 512 (`ff_expansion_factor` de 4 a 1), canales de subsampling de 256 a 32 y anchura residual de 512 a 128; la anchura `d_model` de 512 se mantiene porque llama.cpp la tiene codificada de forma fija. Los pesos se almacenan en F32 igual que en el original y no se incluye el codigo Python del repositorio fuente.

La innovacion relevante no esta en el modelo en si, sino en la preservacion de las rutas de ejecucion: al mantener arquitectura, tokenizer, cabeza de decision y temperaturas, el artefacto permite probar en CI el tipo de decision `lfm2-d1-omni` de llama.cpp, incluyendo marcadores de opcion y entradas de imagen y audio, sin necesidad de cargar el modelo completo.

## Capacidades

- No genera texto coherente: su salida es gibberish por diseno, segun advierte el autor.
- Conserva el tokenizer del modelo base, por lo que tokeniza igual que `d1-omni-600M`.
- Conserva la cabeza de decision y los marcadores de opcion, lo que permite validar el flujo de seleccion de opciones en llama.cpp.
- Mantiene las temperaturas de muestreo del original.
- Acepta entrada de imagen a traves del encoder SigLIP2 recortado.
- Acepta entrada de audio a traves del encoder FastConformer recortado.
- No dispone de soporte documentado de tool calling, function calling ni razonamiento multi-paso utilizable.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Pruebas de integracion continua en llama.cpp: el modelo permite ejecutar la ruta `lfm2-d1-omni` completa en pipelines de CI con un consumo de recursos minimo, validando que la carga, el parseo de pesos y la inferencia no rompen.
- Validacion de carga de safetensors y GGUF: sirve para comprobar que el cargador interpreta correctamente las dimensiones recortadas de tronco, cabeza de decision y encoders.
- Pruebas de regresion del tokenizer: al conservar el tokenizer original, permite verificar que los cambios en el pipeline de tokenizacion producen los mismos ids que con el modelo real.
- Verificacion de rutas multimodales de imagen: el encoder SigLIP2 recortado permite probar el preprocesado y la proyeccion de parches de imagen sin coste elevado.
- Verificacion de rutas multimodales de audio: el encoder FastConformer recortado permite probar el subsampling y la proyeccion de audio en entornos de test.
- Pruebas de la cabeza de decision y marcadores de opcion: util para validar el mecanismo de seleccion entre opciones y las temperaturas asociadas en el codigo de llama.cpp.
- Fixture para desarrollo de herramientas de conversion: permite iterar sobre scripts de conversion y slicing sin descargar el checkpoint completo de 600M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F32 para los 13,5M de parametros; el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), asi como en CPU.
- Opciones de despliegue: llama.cpp (ruta `lfm2-d1-omni`), con version GGUF disponible en `ggml-org-dev/tiny-d1-omni-600M-for-testing-GGUF`. Otros motores (vLLM, TGI, Ollama) no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; por el tamano, la inferencia es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-d1-omni-600M-for-testing | 13,5M (recorte de 600M) | no disponible | Fixture de test para llama.cpp | LFM Open License v1.0 | Hugging Face (safetensors y GGUF) |
| LiquidAI/d1-omni-600M | ~600M | no disponible | Modelo de decision multimodal real | LFM Open License v1.0 | Hugging Face |
| Otros modelos de test de llama.cpp | no disponible | no disponible | Fixtures de CI | no disponible | no disponible |

## Limitaciones y advertencias

- La salida es gibberish por diseno; el autor prohibe explicitamente su uso para cualquier fin distinto del test de software.
- Es una copia "damaged" (danada) del modelo original: no debe emplearse en produccion ni en evaluaciones de calidad.
- Los sesgos del modelo base no son evaluables en este artefacto debido a la degradacion de los pesos.
- Riesgo de alucinacion: total, al no producir texto coherente.
- Limitaciones de contexto e idioma: no documentadas; al ser un recorte, el comportamiento del contexto original no se preserva de forma fiable.
- Restricciones de licencia: hereda la LFM Open License v1.0 del modelo base; cualquier uso comercial debe revisarse contra los terminos de dicha licencia.
- No se incluye el codigo Python del repositorio original, solo los pesos recortados y el script de slicing.
- La anchura `d_model` del encoder de audio se mantiene fija porque llama.cpp la codifica de forma hardcoded; cambios futuros en esa constante podrian romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-omni-600M-for-testing
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-d1-omni-600M-for-testing-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Script de slicing: `slice_d1omni600m.py` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` (LFM Open License v1.0, incluida en el repositorio)
