# infosave/Qwen3.8-27B-cmf

## Resumen

Qwen3.8-27B-cmf es un empaquetado cuantizado del modelo Qwen/Qwen3.8-27B, publicado por el usuario infosave bajo el formato CMF (propio del autor) y distribuido para su uso con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer hibrido con 48 capas de atencion lineal GatedDeltaNet y 16 capas de atencion completa, lo que le permite operar con una ventana de contexto de 262 144 tokens manteniendo un coste de atencion contenido. Incluye modo de razonamiento (thinking mode) y una cabeza MTP (multi-token prediction) que el motor aprovecha para decodificacion especulativa.

La relevancia de esta ficha no esta tanto en el modelo base como en el paquete de despliegue: los archivos CMF ofrecen cuantizaciones de 4 y 8 bits listas para ejecutarse en GPU de consumo (16-24 GB) y en Apple Silicon, con velocidades de decodificacion de 120-128 tok/s en una RTX 3090 mediante CUDA y decodificacion especulativa activada por defecto. El repositorio ocupa 69,8 GB e incluye un drafter DFlash 2 de 1,3 GB para acelerar la generacion.

El modelo esta etiquetado para ingles, ruso y chino, se distribuye bajo licencia Apache 2.0 y acumula 3368 descargas en Hugging Face. Es una opcion practica para quienes quieren ejecutar un modelo de 27B con contexto muy largo en hardware local sin montar un stack de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas de atencion lineal GatedDeltaNet + 16 capas de atencion completa |
| Parametros totales | 27B (segun denominacion del modelo base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | 4 bits con escalas en escalera (q4tp), 4 bits (q4t), 8 bits (q8_2f); drafter DFlash 2 en 4 bits |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (contenedor propio del autor, ejecutable con `cortiq`) |
| Tamano del repositorio | 69,8 GB |
| Motor de inferencia | `cortiq` (Rust; CUDA, Vulkan, DX12, Metal y CPU) |
| Libreria declarada | cortiq |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina 48 capas de atencion lineal basada en GatedDeltaNet con 16 capas de atencion completa. Este diseno reduce el coste computacional y de memoria de la atencion en secuencias largas, lo que hace viable una ventana de contexto de 262 144 tokens. El modelo incorpora modo de razonamiento (thinking) y una cabeza MTP que permite decodificacion especulativa: el propio modelo propone varios tokens candidatos y la GPU los verifica en un solo lote.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Respecto al paquete CMF, la model card indica que los archivos de 4 bits se cuantizaron directamente desde el checkpoint en bf16, y que el drafter DFlash 2 (procedente de z-lab/Qwen3.8-27B-DFlash2) se convirtio para el formato q4tp con un router ajustado a los precios de una RTX 3090. La perplejidad se midio sobre doce ventanas de 512 tokens de wikitext-2.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable o desactivable (`--no-think`).
- Generacion de codigo, con un rendimiento especialmente alto en prompts de codigo gracias a la decodificacion especulativa (125,8 tok/s en RTX 3090 con CUDA).
- Decodificacion especulativa integrada mediante la cabeza MTP del propio modelo y el drafter DFlash 2.
- Salida determinista con decodificacion greedy (`--greedy`).
- Soporte multilingue limitado a ingles, ruso y chino segun las etiquetas del modelo.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) para integracion en aplicaciones existentes.
- Ejecucion en GPU NVIDIA (CUDA, Vulkan, DX12), AMD e Intel (Vulkan, DX12), Apple Silicon (Metal) y CPU.
- No se documenta soporte de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: con 125,8 tok/s en prompts de codigo sobre una RTX 3090 y decodificacion especulativa, el modelo es adecuado para autocompletado y generacion de funciones en entornos sin conexion o con requisitos de privacidad.
- Procesamiento de documentos largos: la ventana de 262 144 tokens permite analizar repositorios completos, contratos extensos o transcripciones de reuniones en una sola pasada, con procesamiento de prompts a 983 tok/s en CUDA para 4000 tokens.
- Chat interactivo de baja latencia: la decodificacion de 49,1 tok/s en modo plano y 120-128 tok/s en chat con CUDA sobre RTX 3090 permite conversaciones fluidas en hardware de consumo.
- Servicio interno compatible con OpenAI: mediante `cortiq serve`, se puede desplegar el modelo como endpoint `/v1/chat/completions` y sustituir llamadas a APIs externas en herramientas internas sin cambiar el codigo cliente.
- Razonamiento paso a paso en entornos controlados: el modo thinking con temperatura 1.0 y top_p 0.95 es util para tareas de analisis que requieren trazas de razonamiento auditables.
- Despliegue en estaciones de trabajo Apple Silicon: con Metal y 6,8 tok/s en decodificacion plana sobre un Mac mini M4 de 24 GB, es viable para prototipado y tareas por lotes no interactivas.
- Generacion de contenido multilingue en ingles, ruso y chino: adecuado para localizacion o atencion al cliente en esos tres idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta perplejidad en wikitext-2 y velocidades de inferencia.

| Metrica | q4tp | q4t | q8_2f |
|---|---:|---:|---:|
| Perplejidad wikitext-2 (12 ventanas de 512 tokens) | 8,79 | 8,86 | no disponible |
| Tamano del archivo | 14,3 GB | 15,4 GB | 27,4 GB |

Velocidad de decodificacion de `qwen38-27b-q4tp.cmf`, un stream, tok/s:

| Hardware | Backend | Decodificacion plana | Prompt de codigo | `cortiq bench --core` |
|---|---|---:|---:|---:|
| RTX 3090 (24 GB) | CUDA | 49,1 | 125,8 | 232 |
| RTX 5090 (32 GB) | Vulkan | 48,7 | 56,5 | 76 |
| RTX 3090 (24 GB) | Vulkan | 37,1 | 43,6 | 62,4 |
| RTX PRO 4000 Blackwell (24 GB) | Vulkan | 27,9 | 43,9 | 54,8 |
| Mac mini M4 (24 GB) | Metal | 6,8 | 17,3 | 20,0 |

Procesamiento de prompts en RTX 3090:

| Backend | Prompt | Procesamiento (tok/s) | Time to first token |
|---|---|---:|---:|
| Vulkan | 1000 tokens | 199 | 5,0 s |
| Vulkan | 4000 tokens | 199 | 20,1 s |
| CUDA | 4000 tokens | 983 | 4,1 s |
| CUDA | 16 000 tokens | 929 | 17,2 s |
| CUDA | 32 000 tokens | 819 | 39,1 s |

## Requisitos de hardware

- VRAM estimada: 14,3 GB para q4tp, 15,4 GB para q4t y 27,4 GB para q8_2f; el drafter DFlash 2 anade 1,3 GB.
- GPU recomendadas: RTX 3090 (24 GB) con CUDA es la configuracion de referencia; RTX 5090 (32 GB) y RTX PRO 4000 Blackwell (24 GB) funcionan por Vulkan; el q8_2f requiere 32 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB con la cuantizacion de 4 bits; el q8_2f necesita 32 GB.
- Apple Silicon: funciona por Metal; un Mac mini M4 de 24 GB alcanza 6,8 tok/s en decodificacion plana.
- Opciones de despliegue: `cortiq` (CLI y servidor compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es especifico del motor.
- Throughput: 232 tok/s en `cortiq bench --core` con RTX 3090 y CUDA; 62,4 tok/s por Vulkan en la misma tarjeta.
- Aceptacion de la decodificacion especulativa: 91% en bench, 87% tras un prompt de 1000 tokens y 50% tras uno de 4000 tokens.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base Qwen3.8-27B ni de modelos comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B-cmf (esta ficha) | 27B | 262 144 | Apache 2.0 | CMF | PPL 8,79 (q4tp); velocidades en la seccion anterior |
| Qwen/Qwen3.8-27B | 27B | 262 144 | Apache 2.0 | safetensors (bf16) | no disponible |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles, ruso y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Formato propietario: los pesos CMF solo se ejecutan con `cortiq`, lo que limita la portabilidad frente a safetensors o GGUF y ata el despliegue a un unico motor mantenido por un autor individual.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen3.8-27B por separado.
- Alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion; el modo thinking puede generar trazas de razonamiento plausibles pero incorrectas.
- Sesgos: no hay informacion sobre evaluaciones de sesgo o seguridad del modelo base ni del proceso de cuantizacion.
- Cuantizacion: la perdida de precision es medible (PPL 8,79 en 4 bits frente a un valor no publicado del checkpoint bf16); para tareas sensibles a la precision se recomienda q8_2f.
- Decodificacion especulativa en Vulkan: la verificacion int8 puede elegir un token distinto cuando dos son casi equiprobables; `CMF_VERIFY_I8=0` lo evita a costa de velocidad.
- Contexto largo: la aceptacion de la decodificacion especulativa cae al 50% tras 4000 tokens, y el time to first token crece hasta 39,1 s para 32 000 tokens en CUDA.
- Madurez del ecosistema: el motor requiere versiones concretas (cortiq 0.8.15 para procesamiento rapido de prompts, 0.8.69 para el backend CUDA con drafter) y las cifras de RTX 5090 se midieron en una version anterior.
- Repositorio con solo 2 likes y 3368 descargas: comunidad pequena, lo que reduce el soporte y la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-27B-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Drafter DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
