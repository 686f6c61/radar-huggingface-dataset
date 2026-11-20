# 21amd21/hip-humanizer-web

## Resumen

HIP humanizer web es una compilación en ONNX de 4 bits del parafraseador HIP, presentado en el artículo *Base Models Look Human To AI Detectors* (Xu, Zhong, Raghunathan, Fang, Kolter; Carnegie Mellon University, 2026). El modelo parte de `Qwen/Qwen3-0.6B-Base` y le aplica el adaptador LoRA `YixuanEvenXu/Qwen3-0.6B-Base-HIP-adapter`, cuyo objetivo es reescribir texto con apariencia de generado por IA hacia una prosa más llana y natural, reduciendo la detectabilidad por clasificadores automáticos.

La relevancia de esta ficha no está en el modelo base, sino en el proceso de empaquetado: el autor ha convertido el modelo fusionado con `onnxruntime-genai 0.20` en un único `model.onnx` de 377 MB, cuantizado en int4 con `block_size=32` y MatMul/Gather cuantizados, pensado para ejecutarse íntegramente en el navegador mediante `onnxruntime-web` sobre WebGPU o el procesador (WASM). Se trata, por tanto, de un artefacto de despliegue edge más que de un modelo nuevo.

El resultado es un generador de texto de 0,6 mil millones de parámetros, contexto máximo de 8192 posiciones, licencia Apache-2.0 y soporte exclusivo de inglés. No incluye plantilla de chat: consume un formato de prompt específico con etiquetas `<source_text>` y `<target_text>` y genera hasta el cierre de esta última.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA HIP fusionado |
| Parametros totales | 0,6 mil millones (Qwen3-0.6B-Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 posiciones (`max positions 8192`) |
| Tipos de cuantizacion | int4 (block_size=32, MatMul y Gather cuantizados, embeddings compartidos con la LM head) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (un único `model.onnx` de 377 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B-Base, un transformer decoder-only denso de 0,6 mil millones de parámetros. Sobre él se aplica el adaptador LoRA HIP, que según el artículo de referencia entrena al modelo base para parafrasear de forma iterativa texto generado por IA hacia un registro más humano. El autor de esta compilación fusiona el adaptador en los pesos base y después convierte el resultado a ONNX con `onnxruntime-genai 0.20` usando `-p int4 -e cpu`, `block_size=32`, cuantización de MatMul y Gather y embeddings compartidos con la LM head.

La innovación técnica de esta versión concreta es de ingeniería de despliegue: la búsqueda de embeddings cuantizada original (`GatherBlockQuantized`) se sustituye por operaciones ONNX estándar (Gather, BitShift, Sub, Cast, Mul) que leen los mismos pesos empaquetados, porque el backend WASM de `onnxruntime-web` no dispone de kernel para la operación original. El autor reporta que las salidas son idénticas, con una diferencia máxima de logits de 0,0. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el adaptador HIP.

## Capacidades

- Generación de texto condicionada a una tarea de parafraseo: reescribe texto de entrada en un registro más natural y menos detectable como generado por IA.
- Formato de prompt específico sin plantilla de chat: bloque `<source_text>...</source_text>` seguido de `<target_text>` y generación hasta `</target_text>` o fin de texto.
- Parafraseo iterativo: el enfoque HIP del artículo subyace a la capacidad de reescritura repetida del mismo texto.
- Ejecución en navegador: inferencia sobre WebGPU o WASM vía `onnxruntime-web`, con pesos int4 y estado KV en float32 (`[1, 8, past, 128]` por capa, 28 capas).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Demo web de humanización de texto: el modelo está empaquetado para cargarse en una página y reescribir párrafos introducidos por el usuario, sin backend ni GPU de servidor, gracias a la ejecución con `onnxruntime-web` sobre WebGPU o WASM.
- Preprocesado de contenido editorial: reescritura de borradores generados por LLM antes de publicación para homogeneizar el registro y reducir marcas estilísticas típicas de texto sintético.
- Herramienta educativa sobre detección de IA: permite experimentar en el navegador con la relación entre parafraseo y clasificadores de texto, usando el checkpoint HIP como referencia reproducible.
- Filtro local en extensiones o aplicaciones de escritorio: al ser un único ONNX de 377 MB, puede integrarse en clientes que necesiten parafrasear sin enviar texto a un servicio externo.
- Pruebas de robustez de detectores: generar variantes parafraseadas de un corpus para evaluar la estabilidad de clasificadores de texto generado por IA.
- Referencia de despliegue edge: sirve como ejemplo técnico de conversión de un modelo Qwen3 con LoRA fusionado a ONNX int4 compatible con `onnxruntime-web`, incluida la sustitución de `GatherBlockQuantized` por operaciones estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la equivalencia numérica de la sustitución de la operación de embeddings (diferencia máxima de logits de 0,0) y los parámetros de generación empleados: temperatura 0,7, top_p 0,9, repetition penalty 1,05, una pasada.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario principal de navegador; el peso del modelo es un `model.onnx` de 377 MB en int4, más el estado KV en float32 (28 capas, 8 cabezas KV, 128 de dimensión por cabeza) que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con soporte WebGPU en el navegador para la ruta acelerada; la ruta WASM funciona en CPU sin GPU dedicada.
- Cabe en GPU de consumo: sí, por tamaño (0,6B en int4), aunque el rendimiento real depende del backend WebGPU del navegador y del hardware del cliente.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) es el destino declarado; el artefacto ONNX también puede ejecutarse con `onnxruntime-genai` en servidor, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| 21amd21/hip-humanizer-web | 0,6B | 8192 | ONNX int4, navegador (WebGPU/WASM) | Apache-2.0 | Parafraseador HIP empaquetado para web |
| Qwen/Qwen3-0.6B-Base | 0,6B | no disponible en la informacion | safetensors (Hugging Face) | Apache-2.0 | Modelo base sin adaptador; generación general |
| YixuanEvenXu/Qwen3-0.6B-Base-HIP-adapter | 0,6B (LoRA sobre el base) | no disponible en la informacion | adaptador LoRA | Apache-2.0 | Adaptador original HIP; requiere fusión para uso directo |

## Limitaciones y advertencias

- El modelo solo soporta inglés; el prompt y la generación están pensados para texto en ese idioma.
- No emplea plantilla de chat: usarlo con formatos conversacionales estándar degrada la calidad de salida.
- Riesgo de alucinación y de alteración de contenido: al ser un parafraseador, puede modificar matices, cifras o afirmaciones del texto original.
- El objetivo declarado es reducir la detectabilidad por clasificadores de IA; su uso para ocultar autoría o evadir políticas de publicación puede tener implicaciones éticas y legales según el contexto.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribución a Qwen y a los autores de HIP.
- El artefacto está optimizado para `onnxruntime-web`; la sustitución de `GatherBlockQuantized` por operaciones estándar está validada solo por el autor (diferencia de logits 0,0) y no por una suite de evaluación independiente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de parafraseo ni de tasa de evasión de detectores para esta compilación concreta.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: madurez y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/21amd21/hip-humanizer-web
- Demo: https://utilitydone.com/ai-humanizer
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Adaptador HIP: https://huggingface.co/YixuanEvenXu/Qwen3-0.6B-Base-HIP-adapter
- Paper: https://arxiv.org/abs/2605.19516
- Código: https://github.com/YixuanEvenXu/humanization-by-iterative-paraphrasing
