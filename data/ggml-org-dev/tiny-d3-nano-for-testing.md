# ggml-org-dev/tiny-d3-nano-for-testing

## Resumen

`tiny-d3-nano-for-testing` es un modelo de pruebas publicado por la organización `ggml-org-dev` en Hugging Face. No es un modelo destinado a producción ni a inferencia real: la propia model card lo describe como una copia modificada y "dañada" de `vllm-sr/d3-nano`, cuyo propósito es validar rutas de código en `llama.cpp` sin necesidad de cargar el modelo completo. Sus salidas son deliberadamente incoherentes (gibberish), por lo que cualquier evaluación de calidad sobre él carece de sentido.

Técnicamente es un recorte (slicing) del modelo original: conserva la arquitectura, el tokenizador, la plantilla de chat, el fichero `decision_config.json` y el mecanismo de lectura (readout) de 255 códigos de opción, pero reduce drásticamente las dimensiones. El modelo base, `vllm-sr/d3-nano`, está construido sobre Qwen/Qwen3.5-2B y emplea atención no causal con un tipo de decisión específico (`vllm-d3`) en llama.cpp, incluyendo entrada de imagen y confianza basada en entropía.

Su relevancia es exclusivamente para desarrolladores de `llama.cpp` y de la infraestructura GGUF: permite ejecutar en CI las mismas rutas de código que el modelo real (atención lineal, lectura de códigos, encoder de visión) con un peso de apenas 9,2 millones de parámetros y un repositorio de tamaño prácticamente nulo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de Qwen3.5 (3 capas de atención lineal + 1 de atención completa en el recorte; atención no causal en el readout) |
| Parámetros totales | 9.205.964 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; existe versión GGUF separada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (existe versión GGUF en `ggml-org-dev/tiny-d3-nano-for-testing-GGUF`) |

## Arquitectura y entrenamiento

El modelo es un recorte estructural del original `vllm-sr/d3-nano`, que a su vez parte de Qwen/Qwen3.5-2B. En el modelo de texto se conservan 4 de las 24 capas (capas 0-3: tres de atención lineal y una de atención completa), con `hidden size` reducido de 2048 a 32, FFN de 6144 a 64, 8 cabezas reducidas a 2, KV heads de 2 a 1 (manteniendo `head_dim` 256), y en la atención lineal las cabezas de clave y valor pasan de 16 a 2 (manteniendo `head_dim` 128). El encoder de visión conserva 2 de 24 bloques, con `hidden size` de 1024 a 128, 16 cabezas a 2 (`head_dim` 64), FFN de 4096 a 256 y salida de 2048 a 32. El fichero `readout.safetensors` pasa de 255x2048 a 255x32 (primeras columnas).

No hay entrenamiento ni ajuste fino asociado a esta copia: es un slicing determinista realizado con `slice_qwen35_decision.py`, siguiendo la skill `slice-model` de llama.cpp. Se conservan `decision_config.json` (códigos, ids de token, temperatura, modo de atención) y el readout de 255 códigos de opción almacenado como LM head, además de la confianza por entropía y la entrada de imagen, de modo que el modelo ejercita exactamente las mismas rutas de código que el original en llama.cpp bajo el tipo de decisión `vllm-d3`. No se incluyen el código Python del repositorio original (`d3_*.py`, `modeling_d3.py`, `pipeline_d3.py`), `MODEL_MANIFEST.json`, assets ni resultados de evaluación.

## Capacidades

- Ejecución de las rutas de código de `llama.cpp` para el tipo de decisión `vllm-d3`: atención no causal, readout de 255 códigos de opción como LM head, confianza por entropía y entrada de imagen.
- Validación de integración de tokenizador y plantilla de chat heredadas del modelo original.
- Pruebas de carga y ejecución de pesos safetensors y GGUF en pipelines de CI.
- No genera texto coherente: sus salidas son gibberish por diseño.
- No dispone de tool calling, razonamiento multietapa ni capacidades multilingües utilizables.
- No debe emplearse para generación, evaluación de calidad ni tareas de usuario final.

## Casos de uso

- Pruebas de integración en CI de `llama.cpp`: cargar el modelo y verificar que las rutas de atención lineal, atención completa y readout de códigos se ejecutan sin errores en cada commit, con un coste de recursos mínimo (9,2 M de parámetros).
- Validación de la skill `slice-model`: comprobar que el script `slice_qwen35_decision.py` produce tensores con las dimensiones esperadas (hidden 32, FFN 64, 2 cabezas, etc.) antes de aplicarlo al modelo completo.
- Pruebas de regresión del parser de `decision_config.json`: verificar que los códigos, ids de token, temperatura y modo de atención se leen correctamente en el cargador.
- Verificación del pipeline de visión en llama.cpp: ejercitar el encoder reducido (2 bloques, hidden 128, salida 32) para detectar roturas en la ruta de entrada de imagen sin cargar el encoder completo.
- Pruebas de empaquetado GGUF: comparar la versión safetensors con `ggml-org-dev/tiny-d3-nano-for-testing-GGUF` para validar la conversión y las dimensiones de los tensores.
- Desarrollo de herramientas de inspección de modelos: usar el recorte como fixture ligero para probar visores de arquitectura, extractores de metadatos o validadores de safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación del modelo original no se incluyen en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable, dado el tamaño de 9,2 M de parámetros (en fp32 serían aproximadamente 37 MB de pesos).
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU sin dificultad.
- Opciones de despliegue: `llama.cpp` (tipo de decisión `vllm-d3`) y su versión GGUF; el resto de backends no está confirmado en la información disponible.
- Latencia y throughput: no disponibles; al ser un modelo de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-d3-nano-for-testing | 9,2 M | no disponible | Pruebas de CI en llama.cpp | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| vllm-sr/d3-nano | no disponible (basado en Qwen3.5-2B) | no disponible | Modelo real con decisión `vllm-d3` | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B | ~2 B | no disponible | Modelo base de propósito general | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de pruebas: la model card advierte que es una copia modificada y dañada, y que su salida es gibberish; no debe usarse para nada distinto de testear software.
- No apto para producción: no genera respuestas útiles ni coherentes.
- Sin datos de sesgos: al no haber entrenamiento ni evaluación, no se han medido sesgos; el recorte no representa el comportamiento del modelo original.
- Riesgo de alucinación irrelevante: cualquier salida es incoherente por construcción, no por alucinación del modelo.
- Limitaciones de contexto e idioma: no disponibles; el tokenizador se hereda del original pero no se documenta el contexto efectivo del recorte.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su utilidad comercial es nula; se deriva de d3-nano (vLLM Semantic Router Team), construido sobre Qwen/Qwen3.5-2B, y debe respetarse el fichero NOTICE.
- No incluye el código Python del repositorio original, `MODEL_MANIFEST.json`, assets ni resultados de evaluación, lo que impide reproducir el pipeline completo del modelo base solo con este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d3-nano-for-testing
- Versión GGUF: https://huggingface.co/ggml-org-dev/tiny-d3-nano-for-testing-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-nano
- Modelo subyacente: https://huggingface.co/Qwen/Qwen3.5-2B
- Script de slicing: `slice_qwen35_decision.py` (incluido en el repositorio)
- Licencia: fichero `LICENSE` del repositorio
- Aviso legal: fichero `NOTICE` del repositorio
