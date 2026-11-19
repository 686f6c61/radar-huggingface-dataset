# ggml-org-dev/tiny-d1-2B-for-testing

## Resumen

`tiny-d1-2B-for-testing` es una copia modificada y deliberadamente dañada de LiquidAI/d1-2B, publicada por el usuario `ggml-org-dev` con el único propósito de servir como modelo de pruebas para el software de inferencia llama.cpp. No es un modelo funcional: sus salidas son ruido y no debe utilizarse para ninguna tarea de producción, investigación o evaluación de calidad. Su interés es puramente de ingeniería: permite ejercitar las rutas de código específicas de la arquitectura `lfm3-d1` (atención no causal, preguntas empaquetadas y entrada de imagen) en pipelines de integración continua sin necesidad de cargar el modelo completo.

El modelo conserva la arquitectura, el tokenizador, la plantilla de chat y la calibración del d1-2B original, pero con dimensiones drásticamente reducidas: 4 de las 24 capas del modelo de texto, tamaño oculto de 256 en lugar de 2048, 2 cabezas de atención en lugar de 16, y un codificador visual de 2 capas con tamaño oculto 256. El resultado son apenas 36.059.008 parámetros reales frente a los aproximadamente 2.000 millones del modelo base, lo que reduce el repositorio a 0,1 GB y hace viable su descarga y ejecución en cualquier entorno de CI.

La relevancia de esta ficha es limitada y debe entenderse en su contexto: sirve para documentar un artefacto de prueba, no un modelo desplegable. Cualquier evaluación de capacidades, benchmarks o casos de uso reales debe remitirse al modelo original LiquidAI/d1-2B, del que este deriva bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención no causal (tipo `lfm3-d1`), modelo de texto más codificador visual |
| Parametros totales | 36.059.008 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; existe versión GGUF en `ggml-org-dev/tiny-d1-2B-for-testing-GGUF` |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (con `custom_code`); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo deriva de LiquidAI/d1-2B y conserva su tipo arquitectónico `lfm3-d1`, que combina un modelo de lenguaje con atención no causal y un codificador visual con proyector. La versión de prueba ha sido recortada mediante el script `slice_d1.py`, siguiendo la skill `slice-model` de llama.cpp: en el modelo de texto se conservan 4 de 24 capas (índices 0, 2, 3 y 4), el tamaño oculto pasa de 2048 a 256, las cabezas de atención de 16 a 2, las cabezas KV de 4 a 1 y la FFN de 7680 a 256. En el codificador visual se conservan 2 de 14 capas (0 y 2), el tamaño oculto pasa de 1024 a 256, las cabezas de 16 a 4, las cabezas KV de 8 a 2, la FFN de 2560 a 256 y el proyector de 4096 a 256.

No se ha realizado ningún entrenamiento adicional: se trata de un recorte de pesos del modelo original, por lo que no hay datos de preentrenamiento, ajuste fino, RLHF o DPO asociados a esta versión. La innovación técnica relevante no está en el modelo en sí, sino en su función como banco de pruebas: mantiene las rutas de código de la arquitectura original (atención no causal, preguntas empaquetadas, entrada de imagen) con un coste computacional mínimo, lo que permite validar cambios en llama.cpp de forma rápida y reproducible. El código Python del repositorio original no se incluye.

## Capacidades

- No genera texto coherente: la model card advierte explícitamente que su salida es ruido ("gibberish") y que no debe usarse para nada distinto de probar software.
- Conserva el tokenizador y la plantilla de chat del d1-2B original, por lo que ejercita las mismas rutas de tokenización y formateo.
- Conserva la arquitectura de atención no causal y el mecanismo de preguntas empaquetadas del modelo base, útil para validar su implementación en llama.cpp.
- Incluye entrada de imagen a través del codificador visual recortado, lo que permite probar el pipeline multimodal completo.
- No dispone de tool calling, razonamiento multi-step, capacidades multilingües ni modo thinking funcionales, ya que los pesos están dañados.
- Sirve como fixture de pruebas para CI: descarga rápida (0,1 GB), ejecución ligera y comportamiento determinista en las rutas de código que ejercita.

## Casos de uso

- Integración continua de llama.cpp: ejecutar tests automáticos que validen la carga del tipo de modelo `lfm3-d1`, la atención no causal y el pipeline multimodal sin necesidad de descargar el modelo de 2B completo.
- Validación de cambios en el parser de plantillas de chat: al conservar el tokenizador y la plantilla del d1-2B, permite comprobar que los cambios en el formateo no rompen la compatibilidad con la familia d1.
- Pruebas de regresión en el soporte GGUF: la existencia de una versión GGUF separada permite validar la conversión y carga de pesos recortados en el formato de llama.cpp.
- Desarrollo de herramientas de slicing de modelos: el script `slice_d1.py` sirve como referencia para implementar y probar utilidades de recorte de modelos multimodales.
- Pruebas de integración de entrada de imagen: el codificador visual recortado permite verificar que el pipeline de preprocesado y proyección de imágenes funciona de extremo a extremo.
- Benchmarking de infraestructura de test: medir tiempos de descarga, carga y ejecución en entornos de CI con recursos limitados, usando un modelo representativo de la arquitectura real pero de tamaño mínimo.
- Docencia y demostración de arquitecturas multimodales: ilustrar la estructura interna de un modelo tipo d1 sin los requisitos de hardware del modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la salida del modelo es ruido, por lo que cualquier métrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización, dado el tamaño de 36 millones de parámetros y un repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas integradas o incluso puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, GTX 1650, etc.) y en CPU sin problemas.
- Opciones de despliegue: llama.cpp (principal caso de uso, con soporte del tipo `lfm3-d1`), y la versión GGUF del repositorio `ggml-org-dev/tiny-d1-2B-for-testing-GGUF`. No se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño, se espera latencia de milisegundos y throughput muy alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| tiny-d1-2B-for-testing | 36.059.008 | no disponible | LFM Open License v1.0 | Pruebas de software (salida dañada) |
| LiquidAI/d1-2B | ~2.000 millones (según nombre) | no disponible | LFM Open License v1.0 | Modelo multimodal funcional |
| Otros modelos de prueba de llama.cpp | Variable | no disponible | Variable | Fixtures de CI |

La comparación relevante es con su modelo base, LiquidAI/d1-2B, del que se diferencia únicamente en el recorte de capas y dimensiones; no compite con modelos funcionales de su categoría porque no está pensado para inferencia real.

## Limitaciones y advertencias

- La salida del modelo es ruido deliberado; no debe usarse para generar texto, responder preguntas ni ninguna tarea de usuario final.
- No es apto para producción, investigación ni evaluación de calidad; la model card lo desaconseja explícitamente.
- Al ser un recorte de pesos, no conserva las capacidades del d1-2B original: razonamiento, visión funcional, tool calling y multilingüismo quedan inutilizados.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial que deben revisarse en el archivo LICENSE antes de cualquier redistribución.
- No se incluye el código Python del repositorio original, lo que limita su uso fuera de llama.cpp.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque el modelo no es funcional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de desarrollo sin soporte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-2B-for-testing
- Versión GGUF: https://huggingface.co/ggml-org-dev/tiny-d1-2B-for-testing-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Script de recorte: `slice_d1.py` (incluido en el repositorio)
- Licencia: archivo `LICENSE` en el repositorio (LFM Open License v1.0)
