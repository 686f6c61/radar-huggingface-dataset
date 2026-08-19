# Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF

## Resumen

Qwen3.8-27B-NVFP4-MTP-GGUF es un artefacto de inferencia cuantizado del modelo Qwen/Qwen3.8-27B (Apache-2.0), producido por Avifenesh como pieza central del motor de inferencia memra, un servidor Rust + CUDA para GPUs RTX Blackwell. La cuantización utiliza NVFP4 (4-bit e2m1 con escalas FP8 e4m3) aplicada con llama-quantize, manteniendo embeddings y capa de salida en Q5_K y normas en F32. El archivo incluye la cabeza MTP (multi-token prediction) con una capa de predicción de siguiente token, lo que habilita decodificación especulativa sin necesidad de un modelo draft separado.

El modelo soporta una ventana de contexto nativa de 262 144 tokens, vocabulario de 248 320 tokens y plantilla de chat embebida con soporte para tool calling y bloques de razonamiento. Está diseñado para servir texto a texto; la torre de visión del modelo base no se incluye en este artefacto. Además, el repositorio contiene un draft MTP recortado (FR-Spec) que reduce el vocabulario de la cabeza de 248 320 a 32 768 tokens, logrando una mejora del 3,9 % en velocidad de extremo a extremo (121,7 tok/s frente a 117,1 tok/s) con una caída de aceptación del 66,7 % al 63,6 % en pruebas con K=3.

La relevancia de este modelo radica en su combinación de cuantización NVFP4 de alta densidad, contexto largo y decodificación especulativa integrada, lo que lo convierte en una opción atractiva para despliegues de agentes y aplicaciones que requieren baja latencia y alto rendimiento en hardware moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, sin torre de vision) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (4-bit e2m1, escalas FP8 e4m3), embeddings y salida en Q5_K, normas en F32 |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B soporta multiples idiomas, pero no se especifica para este artefacto) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (contenedor con ftype NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM transformer de 27 000 millones de parametros desarrollado por Qwen. La arquitectura no se detalla en la informacion disponible, pero sigue el patron habitual de los modelos Qwen: capas de attention con mecanismos de atencion por ventanas y normalizacion pre-RMSNorm. El artefacto cuantizado se obtiene a partir de la version BF16 del modelo base, convertida a GGUF mediante el script de unsloth (866 tensores, incluyendo el bloque MTP) y posteriormente cuantizada con llama-quantize en formato NVFP4. La cuantizacion NVFP4 usa una mantisa de 4 bits con escalas por bloque de 16 elementos en FP8 e4m3, lo que reduce el peso a aproximadamente 4 bits por parametro manteniendo una precision razonable.

El entrenamiento del modelo base no se detalla en la informacion proporcionada; se asume que sigue el proceso estandar de Qwen (preentrenamiento masivo seguido de ajuste con RLHF/DPO, aunque no hay confirmacion). El artefacto incluye una cabeza MTP (multi-token prediction) que predice el siguiente token ademas del token actual, lo que permite decodificacion especulativa: el motor memra genera varios tokens candidatos en paralelo y los verifica contra el modelo real, garantizando que la salida sea identica a la decodificacion secuencial. La cabeza MTP se incluye en el archivo GGUF como `blk.64` y `nextn_predict_layers=1`.

## Capacidades

- Generacion de texto con contexto largo de hasta 262 144 tokens, adecuado para documentos extensos, conversaciones multi-turno y analisis de codigo.
- Razonamiento y pensamiento estructurado mediante bloques de thinking embebidos en la plantilla de chat.
- Tool calling / function calling: la plantilla de chat incluye soporte para invocacion de herramientas, lo que permite integracion con APIs y agentes.
- Decodificacion especulativa nativa gracias a la cabeza MTP, que acelera la inferencia sin sacrificar exactitud (la verificacion es byte-idéntica).
- Multilingue (heredado del modelo base, aunque no se especifican idiomas concretos en la model card).
- Texto a texto exclusivamente: la torre de vision del modelo base no se incluye, por lo que no hay capacidades multimodales.

## Casos de uso

- Agentes conversacionales con memoria larga: gracias a la ventana de 262 144 tokens, el modelo puede mantener el historial completo de sesiones de soporte o asistentes personales sin truncamiento, reduciendo perdidas de contexto.
- Generacion y revision de codigo en repositorios grandes: el contexto amplio permite analizar multiples archivos y funciones simultaneamente, facilitando tareas de refactorizacion o deteccion de bugs.
- Analisis de documentos legales o tecnicos: el modelo puede procesar contratos, especificaciones o articulos cientificos completos y extraer informacion estructurada con tool calling.
- Servidores de inferencia de baja latencia en GPUs Blackwell: el motor memra aprovecha la cuantizacion NVFP4 y la decodificacion especulativa para servir peticiones con throughput alto (121,7 tok/s medidos con K=3 en el draft recortado).
- Sistemas de razonamiento multi-paso: los bloques de thinking permiten al modelo descomponer problemas complejos en pasos intermedios, util en aplicaciones de planificacion o logica.
- Integracion en pipelines de agentes con llamadas a herramientas: el soporte de tool calling permite que el modelo decida que API invocar, por ejemplo en automatizacion de tareas de back-office o consultas a bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de rendimiento de decodificacion especulativa, que se resumen a continuacion:

| Metrica | Valor (draft sin recortar) | Valor (draft recortado) |
|---|---|---|
| Tasa de aceptacion (K=3) | 66,7 % | 63,6 % |
| Velocidad de generacion | 117,1 tok/s | 121,7 tok/s |
| Mejora de velocidad e2e | — | +3,9 % |

Estas mediciones se realizaron con prompts de sesiones agénticas reales y verificacion lossless (cada token propuesto es verificado por el modelo objetivo). No hay datos comparativos con otros modelos.

## Requisitos de hardware

- El archivo GGUF pesa aproximadamente 16,9 GB, por lo que cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090, A10G, L4) y en GPUs Blackwell como RTX 5090 (sm_120a).
- El motor memra esta optimizado para RTX Blackwell (sm_120a) y requiere CUDA; para otras GPUs se puede usar llama.cpp u otros motores compatibles con GGUF.
- VRAM estimada para inferencia: alrededor de 18-20 GB con contexto corto; para contexto completo de 262 144 tokens se necesitara memoria adicional para las KV cache (no especificada).
- Opciones de despliegue: memra-server (recomendado para Blackwell), llama.cpp, Ollama, vLLM (si soporta NVFP4), o cualquier backend que lea GGUF.
- Latencia y throughput: los datos medidos con memra indican 121,7 tok/s con el draft recortado y K=3 en un entorno no especificado; los resultados pueden variar segun hardware y configuracion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. El modelo base Qwen3.8-27B en BF16 ocuparia aproximadamente 54 GB y requeriria GPUs de 80 GB (A100/H100) o cuantizaciones mas agresivas. Alternativas en la misma categoria (LLMs de ~27B con contexto largo) incluyen Llama 3.1 8B (contexto 128k) o Qwen2.5 32B, pero no hay datos de benchmarks que permitan una comparacion objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- La cuantizacion NVFP4 introduce perdida de precision respecto al modelo BF16; aunque la verificacion especulativa garantiza exactitud en la decodificacion, la calidad de las respuestas puede verse ligeramente afectada en tareas que requieren alta fidelidad numerica o razonamiento logico fino.
- El artefacto no incluye la torre de vision del modelo base, por lo que no es adecuado para tareas multimodales (imagen, video).
- El draft MTP recortado reduce la cobertura de propuestas (aceptacion del 63,6 % frente al 66,7 %), lo que puede aumentar ligeramente el numero de pasos de verificacion en algunos casos, aunque la velocidad final mejora.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez en escenarios adversariales; se recomienda validar el modelo en el dominio de uso antes de desplegarlo en produccion.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.8-27B tambien es Apache-2.0, por lo que no hay limitaciones adicionales.
- El motor memra es de codigo abierto (MIT) pero esta optimizado para RTX Blackwell; en otras GPUs el rendimiento puede ser inferior y se deberia usar llama.cpp u otros backends.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del motor memra: https://github.com/avifenesh/memra
- Issue de llama.cpp sobre FR-Spec (draft recortado): https://github.com/ggml-org/llama.cpp/issues/25187
- GGUF BF16 de unsloth (fuente de conversion): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
