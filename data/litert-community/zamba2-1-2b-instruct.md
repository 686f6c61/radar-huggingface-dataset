# litert-community/Zamba2-1.2B-instruct

## Resumen

Zamba2-1.2B-instruct es un modelo de lenguaje de 1.200 millones de parametros desarrollado originalmente por Zyphra, basado en una arquitectura hibrida que combina un backbone Mamba2 (selective-scan) con un unico bloque transformer de atencion compartida. Esta ficha concreta corresponde a la conversion realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), pensada para inferencia on-device en dispositivos moviles y edge con el runtime de Google LiteRT-LM.

El modelo resuelve el problema de ejecutar un LLM con capacidades de instruccion en hardware restringido (smartphones Android, iPhone, Raspberry Pi) sin depender de la nube. Frente a un transformer denso equivalente, la arquitectura hibrida reduce el coste de atencion al reutilizar un solo conjunto de pesos de atencion y MLP en seis posiciones intercaladas, especializadas mediante adaptadores LoRA por posicion. Segun la model card, esta es la primera conversion conocida de Zamba2 a un runtime movil.

La relevancia actual radica en que demuestra que un modelo con backbone de estado (SSM hibrido) puede desplegarse en formato int8 de 1,33 GB y ejecutarse a 11-13 tok/s de decodificacion en un Galaxy S26 o un iPhone 17 Pro, con un TTFT por debajo de 2 segundos en GPU. La licencia Apache 2.0 y el soporte de plantilla ChatML lo hacen apto para integracion comercial en aplicaciones edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: backbone Mamba2 selective-scan (32 capas) + un unico bloque transformer de atencion compartida aplicado en 6 posiciones intercaladas, con LoRA por posicion |
| Parametros totales | 1.200 millones (modelo base Zamba2-1.2B-instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (segun las KV caches descritas: 32 KV heads x 128 head dim a 4096 de contexto) |
| Tipos de cuantizacion | int8 dinamico en capas lineales y embedding; convoluciones y scan en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `Zamba2-1.2B-instruct_int8.litertlm` de 1,33 GB |

## Arquitectura y entrenamiento

Zamba2 emplea un diseno hibrido poco habitual: un backbone Mamba2 de 32 capas con mecanismo selective-scan, sobre el que se aplica un unico bloque transformer (atencion + MLP) en seis posiciones intercaladas dentro de la pila. Los pesos de atencion y MLP se comparten entre esas seis posiciones y se especializan mediante adaptadores LoRA independientes por posicion. La atencion opera sobre la concatenacion del estado oculto corriente y los embeddings originales, lo que aporta acceso directo a la representacion de entrada en cada punto de aplicacion.

La model card de esta conversion no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base de Zyphra y no se incluye aqui. La innovacion tecnica destacable de esta ficha es la propia conversion: exportacion a LiteRT-LM con firmas de prefill multi-longitud (1-1024) para que el runtime seleccione chunks ajustados, tokenizer y plantilla ChatML de Zamba2 embebidos en el fichero, y verificacion de equivalencia logit a logit contra el modelo PyTorch original (top-1 y top-5 identicos en 48 posiciones de decodificacion, correlacion media por posicion 1.0000, KL media aproximadamente 0).

## Capacidades

- Generacion de texto e instruccion conversacional en formato ChatML, con plantilla de chat incluida en el fichero.
- Razonamiento aritmetico basico y de sentido comun a escala de 1.2B; la model card reporta 7/8 en un chequeo de sanidad de ocho preguntas, con un fallo sistematico en comparaciones numericas con decimales ("0.9 vs 0.11").
- Ejecucion on-device en CPU y GPU (Metal en Apple, GPU Android via LiteRT-LM) con delegacion completa de operadores: 4990 operadores delegados en Galaxy S26.
- Soporte de prefill por chunks con firmas multi-longitud, lo que permite manejar prompts de distinta extension de forma eficiente.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales offline en aplicaciones moviles: el modelo cabe en 1,33 GB y corre a 11-13 tok/s de decodificacion en un Galaxy S26 o iPhone 17 Pro, lo que permite respuestas de pocas frases con TTFT inferior a 2 segundos en GPU sin conexion de red.
- Clasificacion y extraccion de informacion local en el dispositivo: con contexto de 4096 tokens puede procesar correos, notas o formularios completos y devolver campos estructurados sin enviar datos personales a un servidor, lo que simplifica el cumplimiento de RGPD.
- Automatizacion en Raspberry Pi 5 para domotica o kioscos: a 1,8 tok/s de decodificacion y 24 tok/s de prefill con 4 hilos de CPU, es viable para tareas de respuesta corta y procesamiento por lotes de baja frecuencia.
- Prototipado rapido de funcionalidades de IA generativa en apps Android: el runtime LiteRT-LM y el formato `.litertlm` permiten integrar el modelo en el APK y probar flujos conversacionales sin infraestructura de inferencia propia.
- Filtrado y resumen de texto en el borde de la red: resumen de notificaciones, transcripciones cortas o hilos de mensajes directamente en el telefono, reduciendo el consumo de bateria asociado a llamadas de red y el coste por token de API.
- Educacion y demos de arquitecturas hibridas SSM-transformer: al ser la primera conversion conocida de Zamba2 a un runtime movil, sirve como referencia reproducible para investigadores que quieran medir el comportamiento de un backbone Mamba2 cuantizado a int8 en hardware real.

## Benchmarks y rendimiento

Rendimiento de inferencia medido (no hay benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la informacion disponible).

`litert-lm benchmark` en Apple M4 Max, `-p 256 -d 256 --runs 3 --cache no`:

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 1033 tok/s | 74,0 tok/s | 0,26 s |
| CPU | 450 tok/s | 22,7 tok/s | 0,61 s |

Medido en dispositivo (arranque en frio, ejecuciones unicas):

| Dispositivo | Backend | Prefill | Decode | TTFT | Memoria pico |
|---|---|---|---|---|---|
| Galaxy S26 | GPU | 116 tok/s | 11,7 tok/s | 1,94 s | no disponible |
| Galaxy S26 | CPU | 88 tok/s | 12,2 tok/s | 2,51 s | no disponible |
| iPhone 17 Pro | GPU (Metal) | 96,6 tok/s | 12,8 tok/s | 1,63 s | 5,43 GB |
| iPhone 17 Pro | CPU | 87,3 tok/s | 7,4 tok/s | 1,73 s | 1,82 GB |
| Raspberry Pi 5 | CPU, 4 hilos | 24 tok/s | 1,8 tok/s | 11,10 s | no disponible |

Calidad: coincidencia logit a logit con el modelo PyTorch en 48 posiciones de decodificacion (top-1 y top-5 identicos, correlacion 1.0000, KL aproximadamente 0). Chequeo de sanidad de ocho preguntas: 7/8 en las cuatro ejecuciones (GPU y CPU, litert-lm 0.15.0 y 0.16.0), con el mismo fallo en todas.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero int8 ocupa 1,33 GB; la memoria pico medida es de 1,82 GB en CPU de iPhone 17 Pro y 5,43 GB en GPU, esta ultima por las KV caches de las seis posiciones de atencion compartida en fp32.
- GPU recomendadas: cualquier GPU movil compatible con LiteRT-LM (Metal en Apple, GPU Android); en escritorio, Apple M4 Max alcanza 74 tok/s de decodificacion. No se documentan resultados con A100, H100 o RTX 4090, ya que el objetivo del formato es edge.
- Consumer GPU: no aplica en el sentido habitual; el modelo esta pensado para telefonos y SBC. Un telefono de 12 GB ejecuta las 12 firmas sin presion de memoria.
- Opciones de despliegue: exclusivamente LiteRT-LM (version 0.15 o superior) mediante el comando `litert-lm run`. No hay conversion documentada a GGUF, vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: TTFT de 1,63-1,94 s en GPU movil y 1,73-2,51 s en CPU movil; 11,7-12,8 tok/s de decodificacion en movil; 1,8 tok/s en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato edge | Licencia | Rendimiento edge documentado |
|---|---|---|---|---|---|
| Zamba2-1.2B-instruct (LiteRT-LM, esta ficha) | 1,2B | 4096 | `.litertlm` int8 | Apache 2.0 | 12,8 tok/s decode en iPhone 17 Pro GPU |
| Zyphra/Zamba2-1.2B-instruct (original) | 1,2B | no disponible en esta ficha | safetensors (PyTorch) | Apache 2.0 | no orientado a edge |
| Alternativas edge de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de otros modelos edge comparables (Gemma, Phi, Qwen en variantes moviles) con los que establecer una comparacion cifrada; se indica como no disponible.

## Limitaciones y advertencias

- Riesgo de error aritmetico: el chequeo de sanidad falla de forma consistente en la comparacion "0.9 vs 0.11", respondiendo que 0.11 es mayor. No debe usarse para calculo numerico fiable sin verificacion externa.
- Alucinacion: a escala de 1.2B el riesgo de afirmaciones incorrectas con tono seguro es alto; la model card documenta que el propio modelo de referencia fp32 falla en preguntas de la prueba compuesta (multiplicacion 8x7 y rima), lo que indica limites del modelo base, no solo de la cuantizacion.
- Gestion de estado entre conversaciones: en litert-lm 0.18.0, reutilizar un Engine para una segunda conversacion reutiliza tokens de prompt compartidos y no reinicia el estado recurrente (issue abierto #3165). Se debe crear un Engine nuevo por conversacion. Existe un fix en main desde el 2026-11-03, pero ninguna release lo incorpora (v0.19.1 no lo incluye).
- Ruta GPU en Android: la model card remite a "Known runtime issues" para el camino GPU en Android; el fichero fue reempaquetado el 2026-11-09 y las mediciones en Galaxy S26 son anteriores a ese reempaquetado.
- Memoria en GPU: las activaciones fp32 declaradas implican un multiplo de memoria frente a CPU; en dispositivos con menos de 12 GB puede haber presion con las 12 firmas completas.
- Idiomas: no se documenta cobertura multilingue; asumir uso principal en ingles salvo validacion propia.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Zyphra, que deben verificarse en su repositorio.
- Madurez: el runtime LiteRT-LM esta en versiones 0.15-0.19 y presenta cambios de comportamiento entre releases; fijar la version en produccion.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/litert-community/Zamba2-1.2B-instruct
- Modelo base: https://huggingface.co/Zyphra/Zamba2-1.2B-instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Informe de compatibilidad edge (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/zamba2-1.2b-instruct-int8/CARD.md
- Issue de estado entre conversaciones: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit con el fix de estado (2026-11-03): https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
