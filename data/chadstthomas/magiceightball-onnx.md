# chadstthomas/MagicEightBall-ONNX

## Resumen

MagicEightBall-ONNX es un artefacto de decisión de tamano minimo publicado por el usuario chadstthomas en Hugging Face. No es un modelo de lenguaje generativo: se trata de un grafo ONNX de 192 bytes que implementa una exportación "portable radix Gather", es decir, una tabla de búsqueda empaquetada que acepta 128 direcciones INT32 y devuelve 128 valores FP32 que representan palabras de lookup. El runner incluido en el repositorio construye esas direcciones a partir de la evidencia textual del documento de entrada y decodifica los bits de decisión resultantes.

El sistema evalúa una política de soporte fija y devuelve una respuesta booleana (`may_route`), una categoría (por ejemplo `billing`) y una acción propuesta (por ejemplo `review_billing`). Según la model card, el runner de CPU acepta hasta 131.072 tokens del tokenizer Needle 3, que se distribuye de forma separada y está empaquetado sin pérdida desde Cactus Compute bajo licencia Apache-2.0. La verificación en CPU cubrió 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el límite exacto y el rechazo a 131.073 tokens.

Su relevancia es acotada pero clara: demuestra un patrón de empaquetado extremo (modelo de bytes, tokenizer y runner separados) para motores de reglas deterministas orientados a la revisión humana de decisiones, no para generación de texto. Es un componente de infraestructura de decisión, no un LLM, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de lookup (radix Gather empaquetado); no es un transformer |
| Parametros totales | no disponible (el grafo ONNX pesa 192 bytes; no hay parametros en el sentido habitual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 131.072 tokens Needle 3 en el runner de CPU incluido; rechazo verificado a 131.073 tokens |
| Tipos de cuantizacion | no disponible (el ONNX opera con INT32 para direcciones y FP32 para valores; existen variantes FP32 dense y GGUF en repos separados) |
| Idiomas soportados | en |
| Licencia | MIT para reglas de decisión y runner; Apache-2.0 para el tokenizer Needle 3 reempaquetado (licencia compuesta `mit-and-apache-2.0`) |
| Formato de pesos | ONNX (`model.onnx`, 192 bytes); variantes adicionales en FP32 dense (1.832 bytes) y GGUF (1.024 bytes) en repos separados |

## Arquitectura y entrenamiento

La arquitectura no es una red neuronal entrenada. El artefacto es un grafo ONNX que exporta una tabla de búsqueda tipo radix mediante una operación Gather: recibe 128 direcciones empaquetadas en INT32 y devuelve 128 valores FP32 que codifican las palabras de lookup de la política. El runner que acompaña al modelo (`portable_runtime.py`) se encarga de tokenizar la entrada con Needle 3, construir las direcciones a partir de la evidencia del documento y decodificar los bits de decisión en la tupla `(may_route, category, action)`.

No hay datos de entrenamiento, tokens de preentrenamiento, RLHF ni DPO porque no existe fase de entrenamiento: la "política" son reglas declaradas explícitamente en el artefacto. La innovación técnica es el empaquetado: separar el tokenizer (Apache-2.0, reempaquetado sin pérdida desde Cactus Compute), el runner y el grafo de decisión permite un modelo de 192 bytes con verificación reproducible (informe `verification.json`, checksums en `SHA256SUMS.txt` y procedencia en `NOTICE.txt`). La model card menciona además ejecución nativa en Intel NCS1 en la página del modelo nativo, con comparativas de latencia CPU y NCS1 publicadas enlazadas.

## Capacidades

- Evaluación determinista de una política de soporte fija: devuelve un booleano `may_route`, una categoría y una acción propuesta.
- Detección de frases declaradas en la política dentro del texto de entrada (por ejemplo, "Duplicate charge. Review authorized." produce `may_route=true`, `category=billing`, `action=review_billing`).
- Anulación por negación: añadir "Do not route." al mismo texto invierte la respuesta a `false` y deja la acción vacía, manteniendo la categoría `billing`.
- Abstención ante entradas no relacionadas: una petición no relacionada no devuelve categoría ni acción.
- Procesamiento de documentos largos: hasta 131.072 tokens Needle 3 en el runner de CPU incluido, con rechazo explícito del límite superior.
- Ejecución en CPU y en hardware Intel NCS1 (según la página del modelo nativo).
- No soporta generación de texto, razonamiento libre, código, matemáticas, visión, audio, tool calling genérico ni razonamiento multi-paso más allá de la evaluación de la política fija.

## Casos de uso

- Enrutado de tickets de facturación: el runner detecta frases declaradas en la política (como cargos duplicados con autorización de revisión) y emite `action=review_billing` para que un humano revise la propuesta; encaja porque la decisión es determinista y auditable.
- Filtro de seguridad previo a un pipeline de soporte: la política puede anular el enrutado cuando el texto contiene instrucciones de bloqueo ("Do not route."), actuando como guardrail barato antes de llamar a un LLM mayor.
- Verificación de políticas en CI: al ser un grafo de 192 bytes con checksums y un informe de verificación, se puede integrar en tests automatizados que comprueben que la política sigue produciendo las mismas decisiones tras cambios.
- Despliegue en dispositivos de borde: la variante nativa para Intel NCS1 y el tamano del artefacto permiten ejecutar la política en hardware de muy baja potencia sin GPU.
- Clasificación documental con contexto largo: el límite de 131.072 tokens permite evaluar contratos o expedientes extensos en busca de las frases declaradas en la política.
- Prototipado de motores de reglas: sirve como referencia reproducible de cómo empaquetar una política declarativa como grafo ONNX con tokenizer separado y runner mínimo.
- Auditoría de decisiones: la salida separa respuesta, categoría y acción propuesta, lo que facilita registrar y revisar cada decisión como dato, tal como indica la model card ("the caller receives the proposed action as data for review").

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificación funcional: 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el límite exacto de 131.072 tokens y rechazo a 131.073 tokens, todo pasado en CPU. También enlaza comparativas de tiempos de ejecución medidos en CPU y NCS1 en la página del modelo nativo, pero los valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el runner es de CPU y el grafo ONNX ocupa 192 bytes.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier hardware consumer: el requisito real es el tokenizer y el runner (numpy, sentencepiece, onnxruntime), no el grafo.
- Despliegue: `onnxruntime` en CPU mediante `portable_runtime.py`; existe variante nativa para Intel NCS1 en el repositorio MagicEightBall.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la comparativa de runtimes CPU/NCS1 en la página del modelo nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MagicEightBall-ONNX | Grafo de 192 bytes | 131.072 tokens (runner) | Motor de reglas ONNX | MIT + Apache-2.0 | Hugging Face (0 descargas) |
| MagicEightBall-FP32 | 1.832 bytes (denso) | no disponible | Motor de reglas | no disponible en la información | Hugging Face (repo separado) |
| MagicEightBall-GGUF | 1.024 bytes | no disponible | Motor de reglas | no disponible en la información | Hugging Face (repo separado) |

No se dispone de información sobre modelos de terceros comparables en la misma categoría (motores de reglas empaquetados como ONNX de tamano mínimo); indicar "no disponible".

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona libremente y no responde preguntas fuera de la política declarada.
- Solo soporta inglés (`en`); no hay evidencia de comportamiento multilingüe.
- La cobertura se limita a las frases declaradas en la política; entradas parafraseadas o fuera del vocabulario de reglas pueden no activar la categoría ni la acción.
- Riesgo de alucinación inaplicable en el sentido habitual, pero sí riesgo de falsos negativos y falsos positivos por dependencia literal de frases y negaciones.
- La licencia es compuesta: MIT para reglas y runner, Apache-2.0 para el tokenizer Needle 3; hay que respetar ambas para uso comercial y conservar `NOTICE.txt` y `SHA256SUMS.txt`.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni benchmarks públicos; madurez y soporte comunitario no verificables.
- El límite de 131.072 tokens es del runner incluido, no del grafo; superarlo provoca rechazo explícito (verificado a 131.073 tokens).
- La acción propuesta es un dato para revisión humana, no una decisión final; la model card insiste en que el llamador debe revisarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chadstthomas/MagicEightBall-ONNX
- Modelo nativo (NCS1 y packs de industria): https://huggingface.co/chadstthomas/MagicEightBall
- Variante FP32 dense: https://huggingface.co/chadstthomas/MagicEightBall-FP32
- Variante GGUF: https://huggingface.co/chadstthomas/MagicEightBall-GGUF
- Comparativa de runtimes CPU y NCS1: https://huggingface.co/chadstthomas/MagicEightBall#runtime-comparison
- Comparativas de tamanos: https://huggingface.co/chadstthomas/MagicEightBall#size-comparisons
- Informe de verificación: `./verification.json` (en el repositorio)
- Licencia: `./LICENSE` (en el repositorio)
- Procedencia del tokenizer: `./NOTICE.txt` (en el repositorio)
- Checksums: `./SHA256SUMS.txt` (en el repositorio)
