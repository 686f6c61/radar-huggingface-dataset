# ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing

## Resumen

tiny-MiniCPM-OCR-Jev-for-testing es una copia modificada y deliberadamente degradada de openbmb/MiniCPM-OCR-Jev, publicada por la organizacion ggml-org-dev. No es un modelo funcional: su unico proposito es servir como fixture de integracion continua para probar las rutas de codigo de llama.cpp asociadas al tipo de decision `openbmb-minicpm-ocr-jev`, sin necesidad de cargar el modelo original completo. El autor advierte explicitamente de que la salida es incoherente y de que no debe emplearse para ningun otro fin.

Conserva la arquitectura, el tokenizer, la plantilla de chat, la configuracion del procesador de imagenes y la cabeza de clasificacion de dos clases del modelo original, de modo que ejercita exactamente los mismos caminos de ejecucion (tronco Qwen3.5 con atencion lineal y atencion completa, lectura de puntuaciones de clase en el ultimo token y dos imagenes por peticion), pero con un tamano reducido para que quepa en un entorno de CI. Cuenta con 9.230.604 parametros totales en formato safetensors y se distribuye bajo licencia Apache 2.0.

Su relevancia es, por tanto, instrumental: permite a los desarrolladores de llama.cpp validar la conversion a GGUF y la inferencia del clasificador OCR de MiniCPM sin asumir el coste de computo y memoria del modelo real. No aporta ninguna capacidad de OCR, razonamiento ni generacion de texto utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (tronco transformer hibrido con atencion lineal y atencion completa) con cabeza de clasificacion de secuencia de 2 clases |
| Parametros totales | 9.230.604 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; existe una version GGUF en ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing-GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversion a GGUF disponible en repositorio aparte) |

## Arquitectura y entrenamiento

El modelo replica la topologia del tronco Qwen3.5 del original pero recortado: 4 de las 24 capas (capas 0 a 3, con 3 de atencion lineal y 1 de atencion completa), tamano oculto reducido de 2048 a 32, FFN de 6144 a 128, 8 cabezas de atencion reducidas a 2, 2 cabezas KV reducidas a 1 y cabezas de clave y valor de atencion lineal de 16 a 2, manteniendo las dimensiones de cabeza. La cabeza de puntuacion (`score.weight`, con etiquetas [inconsistent, consistent]) pasa de tamano oculto 2048 a 32. El codificador de vision conserva 2 de los 24 bloques (0 y 1), con tamano oculto de 1024 a 128, 16 cabezas a 2, FFN de 4096 a 256 y salida de 2048 a 32.

No ha habido entrenamiento: los pesos se obtuvieron mediante recorte (slicing) del safetensors original con el script `slice_minicpm_ocr_jev.py`, siguiendo la skill `slice-model` de llama.cpp. El `config.json` declara `MiniCPMOCRForSequenceClassification` en lugar de `Qwen3_5ForConditionalGeneration` para que `convert_hf_to_gguf.py` lo convierta como clasificador de secuencia. El repositorio original no incluia fichero LICENSE, por lo que se ha anadido el texto de Apache 2.0.

## Capacidades

- Generacion de texto: no disponible; la salida es incoherente por diseno.
- Razonamiento, codigo y matematicas: no disponible.
- Vision: conserva el codificador de vision recortado y el procesamiento de dos imagenes por peticion, pero sin capacidad funcional de reconocimiento.
- Clasificacion de secuencia: cabeza de 2 clases ([inconsistent, consistent]) leida en el ultimo token, con la misma logica que el modelo original.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Uso previsto: validacion de rutas de codigo de llama.cpp en CI (tipo de decision `openbmb-minicpm-ocr-jev`).

## Casos de uso

- Pruebas de integracion continua en llama.cpp: ejecutar el pipeline completo de conversion a GGUF y de inferencia del clasificador OCR de MiniCPM en cada commit, con un coste de memoria y tiempo minimo gracias a sus 9,2 millones de parametros.
- Validacion de la conversion `convert_hf_to_gguf.py`: comprobar que el mapeo de `MiniCPMOCRForSequenceClassification` y de la cabeza `score.weight` se genera correctamente antes de aplicar los cambios al modelo real.
- Verificacion de la ruta de atencion hibrida: ejercitar la combinacion de 3 capas de atencion lineal y 1 de atencion completa del tronco Qwen3.5 en un entorno controlado y reproducible.
- Pruebas de lectura de puntuaciones en el ultimo token: validar que la logica de extraccion de las dos clases de salida funciona con la plantilla de chat y el tokenizer originales.
- Pruebas de procesamiento de dos imagenes por peticion: comprobar el pipeline de vision (procesador de imagenes y codificador recortado) sin cargar el modelo completo.
- Desarrollo de herramientas de depuracion y perfilado: disponer de un modelo diminuto con la misma firma de entrada y salida para instrumentar tiempos, memoria y trazas en herramientas de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la salida del modelo es incoherente, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (9,2 millones de parametros, aproximadamente 37 MB en fp32 y 18 MB en fp16 para los pesos); el consumo dominante sera el de las activaciones y el codificador de vision recortado.
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm o Metal; tambien es viable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en hardware integrado.
- Opciones de despliegue: llama.cpp (ruta principal, mediante la version GGUF del repositorio hermano), y conversion via `convert_hf_to_gguf.py`; soporte en vLLM, TGI u Ollama no disponible.
- Latencia y throughput estimados: no disponible; al tratarse de un fixture de CI, el objetivo es la minima latencia posible, no el rendimiento representativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-MiniCPM-OCR-Jev-for-testing | 9.230.604 | no disponible | Fixture de CI para llama.cpp | Apache 2.0 | Hugging Face (repo propio y GGUF) |
| openbmb/MiniCPM-OCR-Jev | no disponible en la informacion proporcionada | no disponible | OCR y clasificacion de consistencia | Apache 2.0 (segun el autor del derivado) | Hugging Face |
| Otros modelos de la categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La salida es incoherente por diseno; el modelo no debe usarse para OCR, clasificacion real ni generacion de texto.
- Es una copia "danada" del original: los pesos han sido recortados, no entrenados, por lo que no conserva ninguna capacidad aprendida util.
- Sesgos conocidos: no disponibles; al no ser funcional, no aplica un analisis de sesgo.
- Riesgo de alucinacion: total, en el sentido de que toda salida es ruido.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 anadida por el derivador; el repositorio original no incluia fichero LICENSE, lo que conviene verificar antes de cualquier uso comercial de derivados.
- Caveat para produccion: no desplegar bajo ninguna circunstancia; su unico uso aceptable es como fixture de pruebas automatizadas.
- El repositorio tiene 0 descargas y 0 likes, y un tamano declarado de 0.0 GB, coherente con su naturaleza de artefacto de prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-MiniCPM-OCR-Jev-for-testing-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Script de recorte: slice_minicpm_ocr_jev.py (incluido en el repositorio del modelo)
