# ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing-GGUF

## Resumen

`tiny-MiniCPM-OCR-Jev-for-testing-GGUF` es un artefacto de pruebas publicado por la organización `ggml-org-dev` en Hugging Face. No es un modelo destinado a uso real: la propia model card lo describe como una copia modificada y deliberadamente dañada de `openbmb/MiniCPM-OCR-Jev`, creada exclusivamente para validar el software de llama.cpp. Su salida es, según el autor, texto sin sentido (gibberish).

El modelo deriva de MiniCPM-OCR-Jev de OpenBMB, un modelo orientado a OCR y extracción de características, pero ha sido reducido drásticamente y cuantizado. El repositorio contiene un modelo de texto en GGUF (cuantización Q4_0) y un proyector multimodal (mmproj) en Q8_0, generados con `convert_hf_to_gguf.py` y `llama-quantize`. El vocabulario del GGUF de texto también ha sido recortado con `slice_vocab_gguf.py`, conservando tokens especiales, caracteres individuales, la ruta BPE de las palabras de etiqueta de decisión y las primeras 2000 fusiones, con remapeo de IDs.

Su relevancia es puramente instrumental: se emplea en las pruebas del servidor de llama.cpp para el tipo de decisión `openbmb-minicpm-ocr-jev`. No debe evaluarse como un modelo de producción ni compararse por calidad de salida con modelos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de MiniCPM-OCR-Jev; incluye modelo de texto y proyector multimodal mmproj) |
| Parametros totales | 355.564 (según safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto), Q8_0 (mmproj); F16 en la conversion inicial |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto y mmproj) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniCPM-OCR-Jev en la documentación proporcionada. El artefacto GGUF se generó a partir de `ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing` mediante el script `convert_hf_to_gguf.py` de llama.cpp, convirtiendo el modelo de texto y el mmproj a F16 y cuantizando después el texto a Q4_0 y el mmproj a Q8_0.

La modificación principal consiste en el recorte del vocabulario del GGUF de texto con `slice_vocab_gguf.py`: se conservan tokens especiales, caracteres individuales, la ruta BPE de las palabras de etiqueta de decisión y las primeras 2000 fusiones, con remapeo de IDs. Como consecuencia, el tokenizador difiere del modelo original (el repositorio HF conserva el tokenizador completo). No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO.

## Capacidades

- El modelo está diseñado únicamente para probar el software de llama.cpp; su salida es gibberish según el autor.
- Sirve como caso de prueba del tipo de decisión `openbmb-minicpm-ocr-jev` en el servidor de llama.cpp.
- Incluye un proyector multimodal (mmproj), lo que sugiere una arquitectura multimodal heredada del modelo base, aunque no se documentan capacidades funcionales.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No debe utilizarse para inferencia real ni para evaluar calidad.

## Casos de uso

- Pruebas de integración de llama.cpp: verificar que el servidor carga correctamente un GGUF con vocabulario recortado y un mmproj cuantizado.
- Validación del pipeline de conversión: comprobar que `convert_hf_to_gguf.py` y `llama-quantize` producen artefactos coherentes con el tipo de decisión esperado.
- Pruebas de regresión del tokenizador: el vocabulario recortado y remapeado permite ejercitar rutas de tokenización específicas (tokens especiales, caracteres individuales, primeras 2000 fusiones BPE).
- Verificación de cuantización mixta: combinar Q4_0 en texto y Q8_0 en mmproj para probar la carga de ambos componentes.
- Test de arranque rápido: el comando `llama-server -hf ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing-GGUF:Q4_0` permite validar la descarga e inicialización desde el Hub.
- Pruebas de CI en el proyecto llama.cpp: usar el modelo como fixture ligero (repo de 0.0 GB) en pipelines automatizados sin coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; con 355.564 parámetros y cuantización Q4_0, el modelo de texto ocupa del orden de centenares de kilobytes, más el mmproj en Q8_0.
- GPU recomendadas: no se especifican; cualquier GPU compatible con llama.cpp debería poder cargarlo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer, e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), con el comando indicado en la model card; compatible con endpoints (`endpoints_compatible` en los tags).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| tiny-MiniCPM-OCR-Jev-for-testing-GGUF | 355.564 | no disponible | Apache 2.0 | GGUF | Pruebas de software (salida gibberish) |
| openbmb/MiniCPM-OCR-Jev | no disponible | no disponible | no disponible en la informacion | no disponible | Modelo OCR original de OpenBMB |
| ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing | 355.564 | no disponible | Apache 2.0 | safetensors (base) | Modelo base reducido para pruebas |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas funcionales.

## Limitaciones y advertencias

- El autor advierte explícitamente de que es una copia modificada y dañada, y que su salida es gibberish; no debe usarse para nada distinto de probar software.
- El tokenizador está recortado y remapeado, por lo que tokeniza de forma distinta al modelo original.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no está pensado para inferencia real.
- Licencia Apache 2.0 heredada de MiniCPM-OCR-Jev de OpenBMB; aun así, el uso comercial no tiene sentido dada la naturaleza del artefacto.
- No apto para producción, evaluación de calidad ni comparativas de rendimiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 2026-11-19.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing-GGUF
- Modelo base en HF: https://huggingface.co/ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing
- Modelo original: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Licencia: https://huggingface.co/ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
