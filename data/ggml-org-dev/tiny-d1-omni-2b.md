# ggml-org-dev/tiny-d1-Omni-2B

## Resumen

tiny-d1-Omni-2B es una copia modificada y deliberadamente "dañada" del modelo LiquidAI/d1-Omni-2B, publicada por la organizacion ggml-org-dev. No es un modelo funcional: su unico proposito es servir como fixture de pruebas para el software llama.cpp, de modo que el codigo que implementa el tipo de decision `lfm3-d1-omni` (atencion no causal, preguntas empaquetadas, entrada de imagen y audio) pueda ejecutarse en integracion continua sin necesidad de cargar el modelo original completo.

El modelo conserva la arquitectura, el tokenizer, la plantilla de chat y la calibracion del d1-Omni-2B original, pero ha sido recortado en profundidad y anchura para reducir su huella a unos 57,7 millones de parametros totales (frente a los aproximadamente 2.000 millones del modelo base). La salida es incoherente por diseño; la model card advierte explicitamente de que no debe usarse para ninguna tarea distinta del test de software.

A pesar de su nombre, no es un modelo de 2B: el sufijo "2B" hace referencia al modelo del que deriva. Esta ficha documenta sus caracteristicas tecnicas como artefacto de prueba, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de d1-Omni-2B (modelo de texto + encoder de audio + depthformer + encoder de vision), con atencion no causal |
| Parametros totales | 57.707.648 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe una version GGUF en ggml-org-dev/tiny-d1-Omni-2B-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" / lfm1.0) |
| Formato de pesos | safetensors (repo de 0,1 GB); version GGUF publicada aparte |

## Arquitectura y entrenamiento

El modelo replica la topologia del d1-Omni-2B original pero con capas y dimensiones recortadas. El submodelo de texto conserva 4 de las 24 capas (indices 0, 2, 3 y 4), con hidden size reducido de 2048 a 256, 2 cabezas de atencion (frente a 16), 1 cabeza KV (frente a 4) y FFN de 256 (frente a 7680). El encoder de audio mantiene 3 de 17 capas (0, 2, 3) con FFN de 256. El depthformer conserva 1 de 3 capas, con hidden size 128, 4 cabezas, 1 cabeza KV y FFN de 256. El encoder de vision mantiene 2 de 14 capas (0, 2), con hidden size 256, 4 cabezas, 2 cabezas KV, FFN de 256 y proyector de 256 (frente a 4096).

El recorte se realizo con el script `slice_d1omni.py`, siguiendo la skill `slice-model` de llama.cpp. No ha habido entrenamiento ni ajuste fino: los pesos son un subconjunto de los originales, por lo que la calibracion y el tokenizer se conservan intactos. El codigo Python del repositorio original no se incluye. La innovacion relevante no esta en el modelo sino en el hecho de que permite ejercitar las rutas de codigo multimodales de llama.cpp (audio, imagen, atencion no causal) con un artefacto de apenas 0,1 GB.

## Capacidades

- Ejecucion de las rutas de codigo de llama.cpp para el tipo `lfm3-d1-omni`: atencion no causal, preguntas empaquetadas, entrada de imagen y entrada de audio.
- Carga y validacion de tokenizer, plantilla de chat y calibracion identicas a las del d1-Omni-2B original.
- Pruebas de regresion en integracion continua para el soporte multimodal de llama.cpp.
- Generacion de texto: tecnicamente posible, pero la salida es incoherente por diseño (gibberish).
- No ofrece razonamiento, codigo, matematicas ni capacidades multilingues utilizables.
- No dispone de tool calling, function calling ni soporte de agentes funcional.

## Casos de uso

- Integracion continua de llama.cpp: ejecutar la suite de tests del tipo `lfm3-d1-omni` en cada pull request sin descargar el modelo de 2B completo, reduciendo tiempo y ancho de banda de CI.
- Pruebas de carga multimodal: verificar que el pipeline acepta entradas de imagen y audio y las enruta correctamente al encoder correspondiente.
- Validacion de atencion no causal: comprobar que la implementacion de atencion no causal produce formas y flujos de tensor correctos en el grafo de computo.
- Test de preguntas empaquetadas: ejercitar la ruta de "packed questions" del modelo original con un artefacto ligero.
- Desarrollo de conversores GGUF: validar el script de conversion y el slicing contra un modelo pequeno antes de aplicarlo al modelo real.
- Pruebas de tokenizer y plantilla de chat: asegurar que la plantilla de chat y el tokenizer se comportan igual que en el modelo base sin cargar los pesos completos.
- Verificacion de calibracion: comprobar que los metadatos de calibracion se propagan correctamente en el proceso de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no es funcional para tareas de evaluacion estandar, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoria de cuantizaciones, dado el tamano del repo (0,1 GB en safetensors).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: llama.cpp (principal caso de uso, tipo `lfm3-d1-omni`); la version GGUF esta publicada en ggml-org-dev/tiny-d1-Omni-2B-GGUF. Otros motores (vLLM, TGI) no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; al ser un artefacto de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-d1-Omni-2B | 57,7 M | no disponible | Fixture de test para llama.cpp | LFM Open License v1.0 | Hugging Face (ggml-org-dev) |
| LiquidAI/d1-Omni-2B | ~2.000 M (modelo base) | no disponible | Modelo multimodal funcional | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| tiny-d1-Omni-2B-GGUF | no disponible | no disponible | Version GGUF del fixture | LFM Open License v1.0 | Hugging Face (ggml-org-dev) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (fixtures de test multimodales) en la informacion proporcionada.

## Limitaciones y advertencias

- La salida del modelo es incoherente (gibberish) por diseño; no debe usarse para generacion de texto, razonamiento ni ninguna tarea de produccion.
- Es una copia "dañada" del modelo original: los pesos han sido recortados y no representan el comportamiento del d1-Omni-2B real.
- No se ha entrenado ni ajustado; no hay garantia de que las rutas de codigo ejercitadas cubran todos los casos del modelo completo.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de cualquier redistribucion, incluso tratandose de un artefacto de test.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no es funcional para esas tareas.
- El nombre "2B" puede inducir a error: el modelo tiene 57,7 millones de parametros, no 2.000 millones.
- No se incluye el codigo Python del repositorio original, lo que limita la reproducibilidad del proceso de slicing fuera de llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Script de slicing: slice_d1omni.py (incluido en el repositorio del modelo)
- Licencia: LICENSE (LFM Open License v1.0, incluida en el repositorio)
