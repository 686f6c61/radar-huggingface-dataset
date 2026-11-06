# loom-fun/ggml-org-Flint-loom

## Resumen

Flint es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 256 expertos y enrutamiento top-6, distribuido originalmente en formato GGUF por ggml-org bajo el identificador `ggml-org/Flint-GGUF`. El repositorio que nos ocupa, `loom-fun/ggml-org-Flint-loom`, no contiene pesos nuevos ni un fine-tuning: es un paquete de despliegue para el runtime Loom (ROCm/hrx-system) que empaqueta el checkpoint Q4_K_M sin modificar junto con programas `.loom` y una tarjeta `model.json`, generado en un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo loom-skills.

Su interes tecnico esta en la integracion de decodificacion especulativa por defecto: un drafter externo (`incoai/Flint-DFlash2-GGUF`) propone 3 tokens por paso y el modelo los verifica en la misma pasada, con una tasa de aceptacion del 68 % sobre 2712 propuestas y equivalencia verificada (13/13 completaciones identicas respecto a la decodificacion sin drafting). Ademas, esta version incorpora mejoras de prefill para MoE: trozos de prefill de 4096 tokens (frente a 1024) y decodificacion directa de pesos Q8_0 a f16.

El paquete declara una ventana de contexto de 262.144 tokens y una API compatible con OpenAI (`/v1/chat/completions`) con streaming, tool calls y razonamiento. No es un modelo nuevo: es una distribucion de inferencia optimizada para hardware AMD Strix Halo, y sus cifras de rendimiento deben leerse como comparativas de motor (Loom frente a llama.cpp ROCm b1355), no como capacidades del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos, enrutamiento top-6) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-6 de 256 expertos, proporcion no especificada) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (checkpoint distribuido); pesos Q8_0 decodificados a f16 en el motor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Flint-Q4_K_M.gguf`); los pesos no se incluyen en este repositorio, se descargan aparte |
| Motor de inferencia | Loom (ROCm/hrx-system), con drafter DFlash2 para decodificacion especulativa |
| Tokenizer | `tokenizer.json` procedente de `RecursiveSI/flint` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (amdgpu), `memory_bytes=67000000000` |
| Endpoint | OpenAI-compatible en `127.0.0.1:8080` (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capa MoE de 256 expertos y enrutamiento top-6. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al autor original del checkpoint (ggml-org) y no aparecen en la informacion disponible. Lo que si se describe con detalle es la ingenieria de inferencia del paquete Loom:

- **Prefill por trozos de 4096 tokens.** Con 256 expertos y top-6, un trozo de 1024 tokens asigna a cada experto unas 24 filas, dejando sus tiles GEMM de 64 filas llenas solo al ~37 %; los GEMM de expertos suponian el 85 % del tiempo de prefill. Ampliar el trozo a 4096 reduce ese desperdicio de tiles.
- **Decodificacion Q8_0 a f16 bit-identica**, con ~8 % mas de velocidad en GEMM aislado.
- **Decodificacion especulativa integrada y activa por defecto**, con el drafter `incoai/Flint-DFlash2-GGUF` proponiendo 3 tokens por paso y verificacion en la misma pasada. Cada token confirmado es eleccion del propio modelo, por lo que la salida es equivalente a la decodificacion sin drafting.

## Capacidades

- Generacion de texto autoregresiva con contexto de hasta 262.144 tokens.
- Razonamiento: el servidor Loom expone modo de razonamiento en la API.
- Tool calling / function calling mediante el endpoint estilo OpenAI.
- Streaming de respuestas en `/v1/chat/completions`.
- Decodificacion especulativa transparente al usuario (sin cambios en la distribucion de salida).
- Procesamiento de prompts largos (documentos de decenas de miles de tokens) con prefill optimizado para MoE.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- **Servicio de chat local en hardware Strix Halo**: desplegar `loom-serve --device=amdgpu` en un Ryzen AI Max+ 395 y exponer un endpoint compatible con OpenAI para aplicaciones internas, aprovechando el presupuesto de memoria de ~67 GB indicado en la model card.
- **Resumen de documentos largos**: con 262.144 tokens de contexto y un prefill que escala a 1051 tok/s en documentos de 32k, es adecuado para condensar informes, actas o bases de codigo extensas en una sola pasada.
- **Agentes con tool calling**: la API expone tool calls y razonamiento, lo que permite integrar el modelo en bucles de agente que consultan APIs externas y encadenan varios pasos.
- **Asistentes de codigo en local**: el soporte de tool calling y contexto largo encaja en flujos de edicion asistida sobre repositorios medianos, sin depender de servicios en la nube.
- **Prototipado y evaluacion de motores de inferencia**: el paquete incluye `loom-benchmark` con puertas de consistencia, spec, golden, agent, sampling, needle y compare, util para comparar Loom frente a llama.cpp con el mismo GGUF y drafter.
- **Despliegue reproducible con integridad verificada**: `loom-fetch` valida los ficheros contra `model.json.lock` (sha256), lo que facilita replicar la instalacion en varias maquinas con pesos y drafter descargados de sus repositorios originales.
- **Inferencia multistream**: la model card reporta 135.9 tok/s agregados con 4 streams en estado estacionario, lo que permite atender varias conversaciones concurrentes en un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras publicadas son de rendimiento del motor Loom frente a llama.cpp ROCm b1355, con el mismo GGUF y el mismo drafter, ambas con decodificacion especulativa:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s (prompt corto) | 65,3 | 99,9 | +53 % |
| Decode tok/s @2k contexto | 57,2 | 70,4 | +23 % |
| Decode tok/s @32k contexto | 46,0 | 50,0 | +9 % |
| Prefill tok/s, documento 1k | 1071,0 | 677,0 | -37 % |
| Prefill tok/s, documento 2k | 1081,1 | 1152,8 | +7 % |
| Prefill tok/s, documento 8k | 1089,0 | 1237,2 | +14 % |
| Prefill tok/s, documento 16k | 922,8 | 1189,2 | +29 % |
| Prefill tok/s, documento 32k | 665,0 | 1051,1 | +58 % |
| 4 streams, tok/s agregados | 122,5 | 135,9 | +11 % |

Efecto del cambio de trozo de prefill (1024 a 4096 tokens, mismo GGUF, A/B intercalado en un servidor, sin drafting):

| Prompt | Version anterior | Esta build | Cambio |
|---|---|---|---|
| 1k | 906,9 | 645,0 | -29 % |
| 2k | 928,9 | 1130,1 | +22 % |
| 8k | 883,0 | 1220,6 | +38 % |
| 32k | 808,0 | 1038,2 | +28 % |

Puertas de correctitud (`loom-benchmark`, `LEVEL=quick`): consistency, spec, golden, agent, sampling y needle en PASS; compare en FAIL. En golden frente a llama.cpp, 24 prompts con 11 coincidencias exactas token a token y todas las divergencias en empate cercano (diferencia maxima de log-prob 1,391). En equivalencia, 13/13 completaciones identicas, 0 empates cercanos y 68 % de aceptacion sobre 2712 propuestas. En compare de chat, 23 de 24 prompts pasan; un resumen de 15,5k tokens diverge en el token 15 con una diferencia de log-prob de 1,39, justo por encima de la regla de empate cercano de 1,0.

## Requisitos de hardware

- **VRAM/memoria**: la model card invoca `loom-serve` con `--memory_bytes=67000000000` (~67 GB), lo que sugiere un presupuesto de memoria unificado en torno a esa cifra para pesos Q4_K_M, drafter y cache de contexto.
- **GPU objetivo**: AMD Ryzen AI Max+ 395 "Strix Halo" con backend `amdgpu` (ROCm/hrx-system). Es un sistema de memoria unificada, no una GPU discreta con VRAM dedicada.
- **GPU recomendadas**: no se documentan alternativas NVIDIA (A100, H100, RTX 4090) en la informacion disponible; el paquete esta construido y medido exclusivamente en Strix Halo.
- **Consumer GPU**: no hay datos que permitan confirmar ejecucion en GPUs de consumo convencionales; el requisito de memoria de ~67 GB queda fuera de la mayoria de tarjetas individuales.
- **Despliegue**: Loom SDK (`pip install "hrx-loom[hf]"`), `loom-fetch` para materializar programas y pesos con verificacion sha256, `loom-serve` como servidor. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI para este paquete; llama.cpp aparece solo como referencia de comparacion.
- **Latencia y throughput**: decode de 99,9 tok/s con prompt corto, 70,4 tok/s a 2k de contexto y 50,0 tok/s a 32k; prefill de 677 a 1237 tok/s segun longitud del documento; 135,9 tok/s agregados con 4 streams.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el motor Loom con llama.cpp ROCm b1355 sobre el mismo modelo y drafter. No hay datos sobre modelos alternativos de tamano o categoria equivalentes.

| Criterio | Loom (este paquete) | llama.cpp ROCm b1355 |
|---|---|---|
| Modelo y cuantizacion | Flint Q4_K_M + DFlash2 | Flint Q4_K_M + DFlash2 |
| Decodificacion especulativa | Integrada, activa por defecto, 3 tokens por paso | Configuracion optima propia |
| Decode tok/s (prompt corto) | 99,9 | 65,3 |
| Decode tok/s @32k | 50,0 | 46,0 |
| Prefill tok/s, 32k | 1051,1 | 665,0 |
| Prefill tok/s, 1k | 677,0 | 1071,0 |
| Contexto declarado | 262.144 tokens | no disponible |
| API | OpenAI-compatible con streaming, tool calls y razonamiento | servidor propio de llama.cpp |
| Hardware medido | AMD Strix Halo (amdgpu) | ROCm |
| Licencia | no disponible | no disponible |

Comparativa con otros modelos de la misma categoria (MoE de gran tamano, contexto largo): no disponible.

## Limitaciones y advertencias

- **No es un modelo nuevo ni un fine-tuning**: es un paquete de despliegue sobre `ggml-org/Flint-GGUF`; las capacidades y sesgos son los del checkpoint original, que no se documentan aqui.
- **Licencia no disponible**: no se indica licencia del paquete ni del modelo base, por lo que el uso comercial no puede evaluarse con esta informacion.
- **Idiomas no disponibles**: no hay lista de idiomas soportados ni evaluaciones multilingues.
- **Puerta `compare` en FAIL**: en `loom-benchmark LEVEL=quick`, la comparacion de chat frente a llama.cpp falla en 1 de 24 prompts (un resumen de 15,5k tokens con diferencia de log-prob 1,39), lo que indica divergencias medibles en generaciones largas.
- **Prefill mas lento en prompts cortos**: a ~1k tokens Loom rinde un 37 % por debajo de llama.cpp y un 29 % por debajo de su version anterior, por el coste fijo de chunk de MoE y del drafter; la ventaja aparece a partir de 8k.
- **Dependencia de hardware**: construido y validado solo en AMD Strix Halo con ROCm/hrx-system; no hay evidencia de funcionamiento en otras plataformas.
- **Pesos no incluidos**: el repositorio no contiene el GGUF; requiere `loom-fetch` con acceso a los repositorios de ggml-org e incoai y verificacion contra `model.json.lock`.
- **Riesgo de alucinacion y sesgos**: no evaluado en la informacion proporcionada; no hay benchmarks de calidad que lo acoten.
- **Metricas de comparacion**: las cifras de Loom son medidas en cliente y las de llama.cpp en servidor segun la propia model card, lo que reconoce un sesgo favorable a llama.cpp; aun asi, no son resultados independientes.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun/ggml-org-Flint-loom
- Modelo base (GGUF): https://huggingface.co/ggml-org/Flint-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/incoai/Flint-DFlash2-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Pull request de optimizacion de prefill: https://github.com/loom-fun/loom-skills/pull/25
- Tecnicas de prefill de referencia (gufo): https://github.com/gufo-org/gufo
- Tokenizer de origen: https://huggingface.co/RecursiveSI/flint
