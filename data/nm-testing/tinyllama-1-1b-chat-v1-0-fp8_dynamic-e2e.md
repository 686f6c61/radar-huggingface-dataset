# nm-testing/TinyLlama-1.1B-Chat-v1.0-FP8_DYNAMIC-e2e

## Resumen

TinyLlama-1.1B-Chat-v1.0-FP8_DYNAMIC-e2e es una version cuantizada en FP8 dinamico del modelo TinyLlama-1.1B-Chat-v1.0, publicada por el usuario de pruebas nm-testing. Se trata de un artefacto de validacion end-to-end (de ahi el sufijo "e2e") generado con la libreria compressed-tensors, orientado a verificar el flujo de cuantizacion a 8 bits en coma flotante sobre un modelo Llama pequeno de proposito general. No es un modelo entrenado desde cero ni un lanzamiento oficial de TinyLlama.

El modelo base TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only de aproximadamente 1.100 millones de parametros, derivado de TinyLlama y ajustado con instrucciones y preferencias (DPO) para uso conversacional. Esta version concreta conserva esa arquitectura pero almacena los pesos en formato FP8 con esquema de cuantizacion dinamica, lo que reduce el espacio en disco y puede acelerar la inferencia en hardware compatible con FP8 (por ejemplo, GPUs Hopper o Ada Lovelace con soporte para tipos de 8 bits).

Su relevancia es fundamentalmente tecnica: sirve como referencia para desarrolladores que quieran inspeccionar como se serializa un checkpoint FP8 con compressed-tensors, validar pipelines de despliegue (vLLM, TensorRT-LLM, TGI con soporte FP8) o probar integraciones de cuantizacion en CI. No debe considerarse un modelo listo para produccion ni un checkpoint oficial de la familia TinyLlama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama usa 2048 tokens) |
| Tipos de cuantizacion | FP8 dinamico (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con atencion multi-cabeza estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por el proyecto TinyLlama sobre aproximadamente 3 billones de tokens (segun la documentacion publica del modelo original) y posteriormente ajustado con instrucciones y DPO para el modo chat. No se dispone en la informacion proporcionada de detalles adicionales sobre la composicion exacta del dataset de esta variante.

La innovacion de este checkpoint no reside en el entrenamiento sino en la cuantizacion: los pesos se han convertido a FP8 con un esquema de escalado dinamico (los factores de escala se calculan en tiempo de ejecucion por tensor o por canal, segun la configuracion de compressed-tensors). Esto permite reducir el peso del repositorio a 1,2 GB y aprovechar las unidades de matriz FP8 de GPUs modernas. No hay evidencia de decodificacion especulativa, atencion lineal ni otras modificaciones arquitectonicas.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste chat del modelo base.
- Razonamiento basico y respuesta a instrucciones sencillas, limitado por el tamano de 1.1B parametros.
- Generacion de codigo a nivel basico (fragmentos cortos, scripts simples).
- Aritmetica y matematicas elementales, con fiabilidad limitada en problemas de varios pasos.
- Capacidades multilingues: no confirmadas en la informacion disponible; el modelo base tiene cobertura principalmente en ingles.
- Tool calling / function calling: no documentado en esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base no esta optimizado para ello.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Validacion de pipelines de cuantizacion FP8: usar este checkpoint para comprobar que un flujo de compressed-tensors produce pesos cargables y con precision aceptable antes de aplicarlo a modelos mayores.
- Pruebas de integracion en vLLM o TensorRT-LLM: verificar que el motor de inferencia detecta correctamente el esquema FP8 dinamico y ejecuta el grafo sin errores en GPUs con soporte nativo.
- Benchmarking de latencia en hardware consumer: medir throughput y tiempo por token en RTX 4090 o L40S para estimar el ahorro frente a FP16 en un modelo de 1.1B.
- Prototipado rapido de asistentes conversacionales: dado su tamano reducido, permite iterar sobre prompts y plantillas de chat en entornos de desarrollo sin consumir recursos significativos.
- Educacion y demos: ilustrar como se ve un checkpoint cuantizado en safetensors y como se inspecciona su configuracion de cuantizacion con herramientas de Hugging Face.
- Tests de regresion en CI: incluir el modelo como fixture para comprobar que cambios en librerias de cuantizacion o de inferencia no rompen la carga de checkpoints FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en FP8 (pesos) mas overhead de KV cache y activaciones; en la practica, entre 2 y 3 GB para contextos moderados.
- GPU recomendadas: H100, H200, L40S, RTX 4090 y RTX 4080 (con soporte nativo FP8); en GPUs sin FP8 (A100, RTX 3090) el checkpoint puede requerir de-cuantizacion o emulacion, con menor rendimiento.
- Cabe en cualquier GPU consumer con al menos 4 GB de VRAM, incluidas GTX 1650, RTX 3050 y similares, siempre que el runtime soporte el esquema de cuantizacion.
- Opciones de despliegue: vLLM (con soporte compressed-tensors), TensorRT-LLM, TGI (verificar version), y llama.cpp solo si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-FP8_DYNAMIC-e2e | 1,1B | no disponible | FP8 dinamico | no disponible | Hugging Face (nm-testing) |
| TinyLlama-1.1B-Chat-v1.0 (original) | 1,1B | 2048 | FP16/BF16 | Apache 2.0 (segun modelo base) | Hugging Face (TinyLlama) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 | FP16/BF16, GGUF | Apache 2.0 | Hugging Face (Qwen) |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | FP16/BF16, GGUF | Apache 2.0 | Hugging Face (HuggingFaceTB) |

La comparativa con el modelo original es la mas directa: misma arquitectura y parametros, pero con pesos FP8 y sin garantia de licencia documentada en este repo. Frente a Qwen2.5-1.5B y SmolLM2-1.7B, este checkpoint ofrece menor contexto y menor calidad esperada, aunque su tamano en disco es notablemente inferior.

## Limitaciones y advertencias

- Es un artefacto de pruebas (nm-testing) sin documentacion de licencia; no se recomienda su uso comercial sin verificar previamente los terminos del modelo base.
- El modelo base de 1.1B parametros tiene capacidad limitada de razonamiento, matematicas y codigo; las alucinaciones son frecuentes en tareas complejas.
- La cuantizacion FP8 puede introducir degradacion adicional de precision respecto al checkpoint original, especialmente en tareas sensibles a valores extremos.
- No hay informacion sobre idiomas soportados; se asume predominio del ingles, con cobertura pobre en castellano.
- El contexto maximo no esta documentado en este repo; el modelo base usa 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- No se garantiza compatibilidad con todos los runtimes; es necesario verificar el soporte de compressed-tensors FP8 dinamico en la version concreta de vLLM, TGI o TensorRT-LLM.
- No dispone de tool calling ni modo agente documentado, por lo que no es adecuado para pipelines de automatizacion complejos.

## Enlaces

- Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-FP8_DYNAMIC-e2e
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio TinyLlama: https://github.com/jzhang38/TinyLlama
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentacion de vLLM sobre cuantizacion: https://docs.vllm.ai/en/latest/quantization/
