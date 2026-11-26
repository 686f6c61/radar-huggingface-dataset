# root-sys-n/Mima-2.1-Photon-15m-Preview

## Resumen

Mima 2.1 Photon 15M Preview es un modelo de lenguaje de pequeno tamano (SLM) orientado a inferencia nativa en navegador, desarrollado por el usuario root-sys-n. Se trata de un checkpoint de ajuste supervisado (SFT) temprano construido sobre el modelo base Mima 2.1 Photon 15M (Mid-Trained), y su proposito principal es ofrecer conversacion en turco y capacidades de tool calling con un peso ONNX de tan solo 38,95 MB ejecutable en WebAssembly.

El modelo tiene 17,40 M de parametros totales (15,77 M sin contar los embeddings) y emplea un tokenizer BPE turco de 16K entradas. Su interes reside en la relacion entre tamano y capacidades: con apenas 15 M de parametros reporta un 45,9 % en el benchmark propio MicroBench v2.0 (n=1.600, 8 dimensiones), con mejoras notables en instrucciones en turco (13,0 % a 47,0 %) y consistencia (3,0 % a 20,5 %) respecto a la generacion anterior.

Es un modelo de preview, no una version final: el autor indica que el SFT a mayor escala esta planificado como siguiente paso. Resulta relevante para quienes exploran asistentes embebidos, demos en navegador sin backend y experimentacion con modelos de lenguaje ultracompactos en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no especificados; pesos PyTorch + ONNX) |
| Parametros totales | 17,40 M (15,77 M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX con inicializadores comprimidos en FP16 y computo FP32 WASM SIMD; no se detallan otros formatos |
| Idiomas soportados | Turco (tr); la model card menciona TR/EN pero el campo `language` solo declara turco |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (38,95 MB), PyTorch `.pt`, `tokenizer.json`, `config.json` |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer decoder-only con tokenizer BPE turco de 16K, entrenado en dos fases: un modelo base con mid-training (Mima 2.1 Photon Base) y un SFT posterior sobre 21.503 pares limpios de conversacion y herramientas, durante 3 epocas, con AdamW puro, `PAD_ID=4` y enmascaramiento de objetivos a `-100`. No se especifican el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica destacable es la exportacion a ONNX pensada para navegador: inicializadores de pesos comprimidos en FP16 con computo FP32 en WASM SIMD, logits de ultimo token con forma `[B, 16384]` y validacion mediante `onnx.checker`. El modelo incluye tokens especiales para modo de razonamiento (``) y una convencion de tool calling basada en el prefijo `@arac:` (por ejemplo, `@arac: hava | sehir=İstanbul`).

## Capacidades

- Generacion de texto conversacional en turco con formato de prompt `<|bos|><|user|>{prompt}<|assistant|>`.
- Tool calling mediante el prefijo `@arac:` con argumentos con nombre (por ejemplo, `@arac: saat` o `@arac: hava | sehir=İstanbul`).
- Modo de razonamiento con tokens ``.
- Comportamiento de honestidad: responde `Bilmiyorum.` ante preguntas sin respuesta o absurdas, en lugar de alucinar.
- Capacidades multilingues limitadas: el unico idioma declarado en los metadatos es el turco.
- Inferencia nativa en navegador mediante ONNX y WebAssembly SIMD.
- No se documentan capacidades de vision, audio, codigo ni matematicas avanzadas.

## Casos de uso

- Asistente conversacional embebido en navegador: al ejecutarse como ONNX de 38,95 MB en WASM, puede integrarse en una pagina web sin backend ni GPU, ofreciendo respuestas en turco con latencia baja para un modelo de su tamano.
- Demo de tool calling en cliente: el modelo puede emitir llamadas `@arac:` que el codigo JavaScript del navegador intercepte y resuelva (hora, meteorologia), habilitando prototipos de agentes ligeros sin servidor.
- Atencion al cliente basica en turco: para flujos de FAQ y respuestas acotadas donde el coste de inferencia en servidor es un factor critico y el contexto necesario es corto.
- Filtro de intenciones y enrutamiento: su capacidad de instrucciones en turco (47,0 % en MicroBench v2.0) permite clasificar peticiones y decidir si invocar una herramienta o responder directamente.
- Educacion y experimentacion: modelo de referencia para estudiar SFT, tool calling y exportacion ONNX en modelos de menos de 20 M de parametros.
- Prototipado offline en dispositivos: al ser un artefacto pequeno, puede empaquetarse en aplicaciones de escritorio o extensiones con requisitos minimos de recursos.
- Investigacion sobre calibracion de honestidad: su comportamiento de absteccion (`Bilmiyorum.`) sirve como caso de estudio para tecnicas de reduccion de alucinacion en SLM.

## Benchmarks y rendimiento

Resultados publicados por el autor en sus benchmarks propios (MicroBench v1 y v2.0). No son benchmarks estandar como MMLU o HumanEval.

| Modelo | MicroBench v1 (n=500) | MicroBench v2.0 (n=1.600) |
|---|---|---|
| Mima 2 Photon Base | no disponible | 25,0 % |
| Mima 2.1 Base (MidTrain) | no disponible | 26,5 % |
| Mima 2 Photon 15M | 38,6 % | 46,1 % |
| Mima 2.1 Photon Preview | 40,8 % | 45,9 % |

Desglose de Mima 2.1 Photon Preview en MicroBench v2.0 (8 dimensiones):

| Dimension | Resultado |
|---|---|
| Reading | 42,0 % |
| Knowledge | 36,5 % |
| Reasoning | 22,5 % |
| Instructions | 47,0 % |
| Conversation | 87,5 % |
| Honesty | 75,0 % |
| Consistency | 20,5 % |
| Generation | 36,0 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo completo en FP32 ocupa aproximadamente 70 MB y el ONNX pesa 38,95 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) lo ejecuta con holgura.
- Cabe en cualquier GPU consumer e incluso en navegador mediante WebAssembly SIMD.
- Opciones de despliegue: ONNX Runtime (incluido Web/WASM), PyTorch para los pesos `.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Mima 2.1 Photon 15M Preview | 17,40 M (15,77 M sin embeddings) | no disponible | Apache 2.0 | SLM turco, ONNX en navegador, tool calling |
| Mima 2 Photon 15M | no disponible | no disponible | no disponible | Generacion anterior; 46,1 % en MicroBench v2.0 |
| Mima 2.1 Photon Base (MidTrain) | no disponible | no disponible | no disponible | Checkpoint base sin SFT; 26,5 % en MicroBench v2.0 |
| Modelos SLM de menos de 100 M (genericos) | no disponible | no disponible | variable | No se dispone de comparativas publicadas con modelos de terceros |

No se dispone de datos de benchmarks estandar que permitan comparar con alternativas de la misma categoria fuera de la familia Mima.

## Limitaciones y advertencias

- Es una version de preview: el autor indica que el SFT completo a mayor escala esta pendiente, por lo que el rendimiento puede cambiar sustancialmente.
- El unico idioma declarado es el turco; el uso en castellano u otros idiomas no esta soportado ni evaluado.
- La longitud de contexto no esta documentada, lo que impide planificar conversaciones largas o documentos extensos.
- Riesgo de alucinacion: aunque el modelo muestra comportamiento de absteccion en los ejemplos, un SLM de 15 M tiene conocimiento factual muy limitado (36,5 % en Knowledge y 22,5 % en Reasoning en MicroBench v2.0).
- Los benchmarks son propios del autor (MicroBench v1 y v2.0), no estandarizados ni verificados de forma independiente.
- La coherencia es debil (20,5 % en Consistency) y la generacion limitada (36,0 %), lo que restringe su uso en tareas que requieran respuestas largas o precisas.
- El tool calling depende de una convencion ad hoc (`@arac:`) que requiere parseo propio en la aplicacion.
- Licencia Apache 2.0: permite uso comercial, pero al ser un preview conviene validar el comportamiento antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-2.1-Photon-15m-Preview
- Checkpoint base y mid-trained: https://huggingface.co/root-sys-n/Mima-2.1-Photon-15m-Base
- Demo en vivo (Space): https://huggingface.co/spaces/root-sys-n/Mima-2-Photon
- Generacion anterior: https://huggingface.co/root-sys-n/Mima-2-Photon-15m
