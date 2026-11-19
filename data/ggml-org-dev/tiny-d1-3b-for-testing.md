# ggml-org-dev/tiny-d1-3B-for-testing

## Resumen

`tiny-d1-3B-for-testing` es una copia modificada y deliberadamente degradada de [LiquidAI/d1-3B](https://huggingface.co/LiquidAI/d1-3B), publicada por la organizacion `ggml-org-dev`. No es un modelo util para inferencia real: su propia model card advierte que la salida es "gibberish" (texto sin sentido) y que solo existe para probar software. Su proposito es servir como fixture de CI para el runtime de llama.cpp, concretamente para la ruta de codigo del tipo de decision `lfm2-d1` (familia LFM2-VL, lectura de codigos de opcion en la posicion de respuesta y entrada de imagen).

La relevancia es puramente de ingenieria: conserva la arquitectura, el tokenizer y la plantilla de chat del d1-3B original, de modo que ejecuta exactamente los mismos caminos de codigo que el modelo real, pero con un tamano minimo (9.269.824 parametros segun los safetensors del repo) que lo hace viable en entornos de integracion continua sin GPU de gran capacidad. El modelo base declarado es LiquidAI/d1-3B, y la modificacion se realizo recortando ("slicing") los tensores del original con el script `slice_d1_3b.py`, siguiendo la skill `slice-model` de llama.cpp.

Conviene subrayar que este artefacto no debe confundirse con el d1-3B completo ni usarse para evaluacion de calidad: es un modelo de pruebas con pesos truncados, sin datos de entrenamiento publicados y sin benchmarks. Cualquier cifra de rendimiento del d1-3B real no es extrapolable a esta copia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2-VL (transformer multimodal con encoder de vision SigLIP2 y proyector), tipo de decision `lfm2-d1` en llama.cpp |
| Parametros totales | 9.269.824 (dato real de los safetensors del repo; el nombre "3B" se refiere al modelo base, no a esta copia) |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; existe una version GGUF en el repo hermano (ver enlaces) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (repo principal); GGUF en el repo `tiny-d1-3B-for-testing-GGUF` |

## Arquitectura y entrenamiento

La arquitectura es la de LFM2-VL, preservada del d1-3B original: un modelo de lenguaje transformer (en el original, 30 capas, hidden size 2048, 32 cabezas de atencion, 8 cabezas KV y FFN de 10752) acoplado a un encoder de vision SigLIP2 (en el original, 27 capas, hidden size 1152, 16 cabezas y FFN de 4304) mediante un proyector que mapea 2048 a 256 dimensiones. En esta copia de pruebas, el recorte reduce el modelo de texto a 4 de 30 capas (indices 0, 2, 3, 5), hidden size de 2048 a 64, cabezas de 32 a 1, cabezas KV de 8 a 1 y FFN de 10752 a 256; el encoder de vision queda en 3 de 27 capas, hidden size 144, 2 cabezas, FFN 288 y proyector 256.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO para este artefacto, ya que no fue entrenado: es un recorte de tensores del modelo base. Tampoco se incluye el codigo Python del repo original. La innovacion tecnica relevante no esta en el modelo sino en su uso como fixture: mantiene intactos el tokenizer, la plantilla de chat y la semantica de decision del d1-3B, lo que permite ejercitar en CI la lectura de codigos de opcion en la posicion de respuesta y el flujo de entrada de imagen de llama.cpp sin cargar el modelo completo.

## Capacidades

- No genera texto coherente: la model card declara explicitamente que su salida es gibberish y que no debe usarse para otro fin que no sea probar software.
- Conserva el tokenizer y la plantilla de chat del d1-3B, por lo que valida rutas de tokenizacion y formateo de prompts.
- Conserva la interfaz multimodal LFM2-VL, incluida la ruta de entrada de imagen a traves del encoder SigLIP2 recortado.
- Ejercita el tipo de decision `lfm2-d1` de llama.cpp, incluyendo la lectura de codigos de opcion en la posicion de respuesta.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni modo de pensamiento para esta copia.
- Cobertura multilingue: no disponible.

## Casos de uso

- Integracion continua de llama.cpp: cargar el modelo en tests automatizados para verificar que el parser y el runner del tipo `lfm2-d1` siguen funcionando tras refactorizaciones, con un coste de recursos minimo.
- Pruebas de regresion de tokenizer y plantilla de chat: comparar la salida de tokenizacion y el formateo de prompts contra el d1-3B real para detectar divergencias introducidas en el codigo.
- Validacion de la ruta multimodal: comprobar que la entrada de imagen atraviesa correctamente el encoder SigLIP2 recortado y el proyector hasta el modelo de lenguaje.
- Pruebas de carga y empaquetado GGUF: usar la version GGUF del repo hermano para verificar la conversion, cuantizacion y carga de metadatos en llama.cpp.
- Desarrollo de herramientas de slicing: servir como caso de referencia para validar `slice_d1_3b.py` y la skill `slice-model`, comprobando que el recorte de capas, cabezas y dimensiones produce un grafo valido.
- Tests de humo en pipelines de CI con recursos limitados: ejecutar el modelo en runners sin GPU dedicada para validar el arranque, la asignacion de tensores y el apagado del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una copia degradada con pesos truncados, cualquier metrica de calidad seria irrelevante y no debe compararse con las cifras del d1-3B original.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, coherente con 9.269.824 parametros; no se publican cifras oficiales.
- GPU recomendadas: no disponible; por tamano, el modelo cabe en practicamente cualquier GPU consumer, incluida una GTX 1650 o una iGPU con memoria compartida.
- Cabe en GPU consumer: si, con margen amplio; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (ruta principal, tipo `lfm2-d1`), y la version GGUF del repo hermano para el mismo runtime. No se declaran soportes para vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles; al ser un modelo de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|
| tiny-d1-3B-for-testing | 9.269.824 | no disponible | Fixture de CI para llama.cpp | LFM Open License v1.0 | Hugging Face (repo `ggml-org-dev`) |
| LiquidAI/d1-3B | 3B (nominal) | no disponible | Modelo multimodal real | LFM Open License v1.0 | Hugging Face (repo `LiquidAI`) |
| tiny-d1-3B-for-testing-GGUF | no disponible | no disponible | Version GGUF del fixture | LFM Open License v1.0 | Hugging Face (repo `ggml-org-dev`) |

La comparacion relevante es con el propio d1-3B: misma arquitectura, tokenizer y plantilla de chat, pero con un numero de parametros ordenes de magnitud menor y sin capacidad funcional. Frente a otros fixtures de CI de la comunidad, no se dispone de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Salida sin sentido: la model card advierte que el modelo produce gibberish y que no debe usarse para nada distinto de probar software.
- No es un modelo de produccion: no debe desplegarse en aplicaciones reales, evaluaciones de calidad ni generacion de contenido.
- Pesos truncados: solo 4 de 30 capas de texto y 3 de 27 del encoder de vision, con dimensiones reducidas; cualquier inferencia semantica es invalida.
- Sin datos de entrenamiento ni benchmarks: no hay evidencia de rendimiento ni de sesgos, porque el artefacto no fue entrenado.
- Licencia LFM Open License v1.0: es una licencia "other" con terminos propios; deben revisarse las restricciones de uso comercial del texto de la licencia antes de cualquier redistribucion.
- Modelo derivado: al ser una modificacion de d1-3B, hereda las obligaciones de atribucion y las condiciones de la licencia del modelo base.
- Sin codigo Python del repo original: no se incluye el codigo de inferencia del d1-3B, lo que limita su uso fuera de llama.cpp.
- Idiomas y contexto no declarados: no se puede asumir cobertura multilingue ni una ventana de contexto concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-3B-for-testing
- Version GGUF: https://huggingface.co/ggml-org-dev/tiny-d1-3B-for-testing-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Script de recorte citado en la model card: `slice_d1_3b.py` (incluido en el repo)
- Licencia: `LICENSE` (LFM Open License v1.0, incluida en el repo)
