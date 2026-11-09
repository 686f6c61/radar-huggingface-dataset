# haiping/Qwen3.8-27B-DSpine-b16-nvfp4

## Resumen

Qwen3.8-27B-DSpine-b16-nvfp4 es un artefacto de decodificacion especulativa: concretamente, un *draft model* (modelo borrador) de bloques derivado de tencent/Qwen3.8-27B-DSpine-b16 y reempaquetado por el usuario haiping en el formato propietario `.vi` que consume el motor de inferencia velox. No es un modelo generativo autonomo, sino un componente auxiliar que propone bloques de hasta 15 tokens para acelerar la decodificacion de un modelo objetivo Qwen3.8-27B servido por velox.

El modelo base es un drafter de cinco capas entrenado para proponer bloques de 16 tokens sobre una ventana de 8.192 tokens y sobre el vocabulario completo de 248k entradas. Esta version aplica cuantizacion NVFP4 a las proyecciones MLP, de atencion y de caracteristicas, manteniendo en BF16 el puente de codigo (proyecciones de lectura/escritura por capa, puertas y codebook). El artefacto ocupa 1,56 GB en disco y 1,06 GB en dispositivo.

Su relevancia es practica y acotada: segun las mediciones del autor en una RTX 5090 de 32 GB, sustituye al drafter DFlash2 integrado y eleva los tokens aceptados por ronda de 4,86 a 8,02, con un incremento de velocidad de decodificacion del 33,8 % y una reduccion del 15 % en la latencia p50 extremo a extremo, sin perdida de calidad en verificacion greedy. Es, por tanto, una pieza de optimizacion para despliegues de Qwen3.8-27B en velox, no un modelo para uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de bloques (block drafter) de cinco capas sobre transformer, para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de ventana de entrenamiento; operativo medido a 4.096 tokens |
| Tipos de cuantizacion | NVFP4 en proyecciones MLP, atencion y caracteristicas; BF16 en puente de codigo y resto de componentes |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.vi` (artefacto propietario de velox); no compatible con safetensors, GGUF ni otros formatos estandar |

## Arquitectura y entrenamiento

El modelo base tencent/Qwen3.8-27B-DSpine-b16 es un drafter de bloques de cinco capas disenado para proponer 16 tokens por ronda sobre el vocabulario completo de 248k entradas, con una ventana de entrenamiento de 8.192 tokens. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; la model card unicamente remite al paper arXiv 2609.36173 para los detalles del entrenamiento.

La conversion realizada por haiping aplica el comando `velox import-dspine --nvfp4 all`, que recodifica en NVFP4 las proyecciones del MLP, de atencion y de caracteristicas. El puente de codigo (proyecciones de lectura/escritura por capa, puertas y codebook) permanece en BF16. El artefacto resultante ocupa 1,06 GB en dispositivo, y velox carga el codebook de 0,5 GB en RAM del sistema en lugar de en memoria de GPU. Los pesos estan recodificados y reempaquetados, no copiados sin cambios respecto al checkpoint original.

La innovacion tecnica principal es la decodificacion especulativa por bloques: el drafter propone secuencias de tokens que el modelo objetivo verifica de forma greedy, de modo que la verificacion es sin perdida (lossless) y todas las llamadas a herramientas resultan validas. El autor reporta que la cuantizacion NVFP4 no reduce la tasa de aceptacion respecto a la version BF16 sin cuantizar (8,02 frente a 8,22 tokens por ronda).

## Capacidades

- Generacion de propuestas de tokens (drafting) para decodificacion especulativa: propone bloques de hasta 15 tokens por ronda sobre el vocabulario completo de 248k entradas.
- Aceleracion de inferencia del modelo objetivo Qwen3.8-27B servido por velox, con verificacion greedy sin perdida de calidad.
- Soporte de multiples peticiones concurrentes: medido con cuatro replays concurrentes, con un incremento del 12 % en throughput agregado.
- Compatibilidad con cache KV en formato NVFP4 en el modelo objetivo.
- No soporta generacion autonoma de texto, tool calling directo, vision, audio ni modos de razonamiento: es un componente auxiliar, no un modelo de proposito general.
- Capacidades multilingues: no disponibles (heredadas del modelo objetivo, no documentadas para el drafter).

## Casos de uso

- Aceleracion de agentes de uso de computadora (computer-use agents): el escenario medido por el autor es precisamente un replay de 95 pasos de un agente de computer-use a temperatura 0, donde el drafter reduce la latencia p50 un 15 %. Es adecuado porque estos flujos generan secuencias largas y repetitivas donde la especulacion acierta con frecuencia.
- Servicio de Qwen3.8-27B en produccion con velox: se sustituye el drafter DFlash2 integrado por este artefacto para obtener un 33,8 % mas de velocidad de decodificacion sin tocar el modelo objetivo.
- Despliegue en GPU de consumo: al ocupar 1,06 GB en dispositivo y requerir solo una RTX 5090 de 32 GB para el conjunto objetivo + drafter, permite servir un modelo de 27B con aceleracion especulativa en hardware de gama alta de consumo.
- Procesamiento por lotes con concurrencia moderada: con cuatro replays concurrentes el throughput agregado sube un 12 %, adecuado para cargas de trabajo tipo batch o multi-sesion donde prima el rendimiento agregado sobre la latencia individual.
- Evaluacion y benchmarking de tecnicas de decodificacion especulativa: sirve como referencia reproducible para comparar DFlash2 frente a DSpine en el mismo motor y hardware.
- Integracion en pipelines de agentes con tool calling: la verificacion greedy garantiza que todas las llamadas a herramientas generadas son validas, lo que reduce el riesgo de acciones malformadas en flujos automatizados.

## Benchmarks y rendimiento

Mediciones del autor en RTX 5090 de 32 GB (2026-11-09), sobre un replay privado de agente de computer-use de 95 pasos a temperatura 0, con objetivo `qwen3_8_27b_iq3_xss_nvfp4_hybrid_v3.vi`, 4 lanes y cache KV NVFP4:

| Drafter | Tokens / ronda | Decodificacion | p50 extremo a extremo |
|---|---:|---:|---:|
| DFlash2, 7 drafts (baseline) | 4,86 | 321 tok/s | 624 ms |
| DFlash2, 15 drafts | 4,91 | −1,0 % | −1,9 % |
| DSpine, 15 drafts, ventana 4096 | 8,02 | +33,8 % | −15 % |
| DSpine BF16 (sin cuantizar), 15 drafts | 8,22 | no disponible | no disponible |

Observaciones adicionales reportadas: NVFP4 no penaliza la aceptacion frente a BF16; una ventana de 4096 rinde igual que la ventana entrenada de 8192, mientras que 2048 pierde aceptacion; con cuatro replays concurrentes el throughput agregado sube un 12 % pero la latencia por peticion empeora aproximadamente un 10 %.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza del artefacto: no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM estimada para el drafter: 1,06 GB en dispositivo; el codebook de 0,5 GB se carga en RAM del sistema.
- VRAM del conjunto completo: el modelo objetivo Qwen3.8-27B en formato IQ3 + NVFP4 requiere una GPU de 32 GB; el autor lo ha medido en una RTX 5090 de 32 GB.
- GPU recomendadas: RTX 5090 (unica medida oficialmente). Otras tarjetas ejecutan el drafter con sus kernels portables, pero no han sido medidas.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB junto con el objetivo cuantizado; no hay datos para GPUs de menor VRAM.
- Opciones de despliegue: exclusivamente velox (rama `rtx-5090-32g`, commit `99f412c` o posterior). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.vi` solo lo lee velox.
- Latencia y throughput: 321 tok/s de baseline con DFlash2 y +33,8 % con DSpine; p50 extremo a extremo de 624 ms en baseline y −15 % con DSpine.

Comando de referencia:

```bash
velox serve --artifact qwen3_8_27b_iq3_xss_nvfp4_hybrid_v3.vi --kv-format nvfp4 \
  --drafter dspine --draft-artifact qwen3_8_27b_dspine_b16_nvfp4.vi \
  --dflash-drafts 15 --dflash-short 15 --draft-window 4096
```

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-DSpine-b16-nvfp4 (este) | Drafter NVFP4 para velox | no disponible (5 capas) | 8.192 (operativo 4.096) | 8,02 tok/ronda, +33,8 % decode | Apache-2.0 | Solo velox, formato `.vi` |
| DFlash2 (integrado en velox) | Drafter BF16 para velox | no disponible | no disponible | 4,86 tok/ronda (7 drafts) | incluido en velox | Integrado en velox |
| tencent/Qwen3.8-27B-DSpine-b16 | Drafter BF16 sin cuantizar | no disponible (5 capas) | 8.192 | 8,22 tok/ronda | Apache-2.0 | Hugging Face, formato original |

No se dispone de informacion sobre otros drafters comparables fuera del ecosistema velox (por ejemplo, variantes de EAGLE o Medusa para Qwen3.8-27B), por lo que la comparativa se limita a las alternativas documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera respuestas de forma autonoma ni puede usarse sin un modelo objetivo Qwen3.8-27B servido por velox.
- Dependencia total de velox: el formato `.vi` es propietario y solo lo lee ese motor; no hay portabilidad a vLLM, llama.cpp, Ollama ni TGI.
- Requiere una version concreta del servidor: rama `rtx-5090-32g`, commit `99f412c` o posterior.
- Configuracion obligatoria de 15 drafts por ronda: el valor por defecto de 7/15 esta ajustado para DFlash2 y degrada DSpine a unos 6,3 tokens por ronda.
- Ventana inferior a 4096 penaliza la aceptacion (2048 pierde rendimiento); no se recomienda reducirla.
- En concurrencia (4 replays) la latencia por peticion empeora aproximadamente un 10 %, aunque el throughput agregado suba un 12 %.
- Medido unicamente en RTX 5090 de 32 GB; el comportamiento en otras GPU no esta verificado.
- Sesgos conocidos y riesgo de alucinacion: no documentados para el drafter; al ser verificado de forma greedy por el modelo objetivo, no introduce contenido propio en la salida, pero hereda los sesgos del objetivo.
- Idiomas soportados: no disponibles.
- Licencia Apache-2.0, que permite uso comercial; el artefacto es una version modificada (recodificada) del checkpoint original, lo que debe tenerse en cuenta en la trazabilidad de la procedencia.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/haiping/Qwen3.8-27B-DSpine-b16-nvfp4
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo velox: https://huggingface.co/haiping/Qwen3.8-27B-velox
- Motor velox: https://github.com/Oceania2018/velox-inferer
- Paper del drafter: arXiv 2609.36173 (referenciado en la model card; no se dispone de URL verificada)
