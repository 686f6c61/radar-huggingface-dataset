# opirs/SmolLM3-3B-GGUF

## Resumen

SmolLM3-3B-GGUF es una copia sin modificar del build cuantizado en 4 bits (GGUF) del modelo SmolLM3-3B desarrollado por Hugging Face. El repositorio lo publica OPIRS, un programa de investigación abierta centrado en modelos que se ejecutan en dispositivos de usuario, que no ha entrenado, ajustado ni alterado los pesos: se trata de los pesos originales del publicador, byte a byte. El modelo base cuenta con 3.075.098.624 parámetros y está orientado a generación de texto conversacional.

La particularidad de esta copia es la plantilla de prompt. Cuando el modelo original se descarga mediante Ollama, la plantilla se regenera con la fecha del día, de modo que dos equipos que descarguen el modelo en fechas distintas no ejecutan exactamente lo mismo. Esta publicación fija una plantilla única, medida por OPIRS en equipos de voluntarios, para que todos los equipos ejecuten la misma configuración. La contrapartida es que dicha plantilla indica siempre la fecha del 23 de noviembre de 2026, por lo que no debe usarse para conocer la fecha actual.

El interés del repositorio es, por tanto, la reproducibilidad: ofrece un artefacto GGUF estable y verificable para experimentación con SmolLM3-3B en hardware de consumo, bajo licencia Apache 2.0. No aporta mejoras de rendimiento ni cambios en el modelo respecto al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 3.075.098.624 |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF de 4 bits (único build publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de 3.075.098.624 parámetros (aproximadamente 3B) del que no se detalla si emplea un transformer denso, atención lineal u otra variante. El repositorio es una cuantización de 4 bits en formato GGUF del SmolLM3-3B original de Hugging Face, publicada previamente por ggml-org.

OPIRS no ha realizado entrenamiento, ajuste fino ni modificación alguna de los pesos. No hay datos disponibles sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas de decodificación. La única intervención documentada es la fijación de la plantilla de prompt para garantizar que la inferencia sea idéntica entre equipos.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo mediante infraestructura de inferencia estándar.
- Ejecución local en dispositivos de usuario gracias al formato GGUF de 4 bits.
- Comportamiento reproducible: plantilla de prompt fija e idéntica en todos los equipos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Evaluación reproducible de SmolLM3-3B: al fijar la plantilla de prompt, los resultados de distintos equipos son comparables directamente, lo que resulta adecuado para estudios de benchmarking entre hardware.
- Inferencia local en portátiles y equipos de sobremesa: el build de 4 bits y el tamaño del repositorio (1,9 GB) permiten ejecutar el modelo sin GPU dedicada mediante llama.cpp u Ollama.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un chatbot de pruebas con poca infraestructura.
- Docencia y formación: un modelo pequeño con licencia Apache 2.0 y artefacto estable es útil para explicar cuantización GGUF y despliegue local sin depender de servicios en la nube.
- Pruebas de integración en pipelines de CI: la reproducibilidad byte a byte de la plantilla evita fallos intermitentes derivados de plantillas generadas dinámicamente.
- Investigación sobre plantillas de prompt: sirve como caso de estudio de cómo la generación dinámica de plantillas afecta a la reproducibilidad de resultados.
- No debe emplearse para funciones que dependan de la fecha actual, ya que la plantilla fija el 23 de noviembre de 2026.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,9 GB en cuantización de 4 bits; la inferencia requiere espacio adicional para el contexto (KV cache), cuyo valor exacto no está disponible al desconocerse la longitud de contexto.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPUs de consumo, pero no se especifican modelos concretos.
- GPU de consumo: el tamaño de 4 bits permite previsiblemente su ejecución en GPUs consumer con 4-6 GB de VRAM o superior, si bien este dato no está confirmado en la documentación.
- Despliegue: formato GGUF, compatible con llama.cpp y Ollama; la etiqueta `endpoints_compatible` sugiere soporte en servidores de inferencia con API compatible con OpenAI. Soporte de vLLM o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| opirs/SmolLM3-3B-GGUF | 3.075.098.624 | no disponible | Apache 2.0 | GGUF 4 bits | Copia con plantilla fija para reproducibilidad |
| HuggingFaceTB/SmolLM3-3B | 3.075.098.624 | no disponible | Apache 2.0 | safetensors (original) | Modelo base de Hugging Face |
| ggml-org/SmolLM3-3B-GGUF | 3.075.098.624 | no disponible | Apache 2.0 | GGUF | Build GGUF original de referencia |

Los tres artefactos comparten pesos idénticos; la diferencia radica en el formato y en la fijación de la plantilla de prompt. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- La plantilla de prompt fija la fecha en el 23 de noviembre de 2026; el modelo no puede informar de la fecha real.
- Es una copia no modificada: cualquier limitación, sesgo o riesgo de alucinación del SmolLM3-3B original se traslada íntegramente, aunque no se detallan sesgos concretos en la información disponible.
- No hay información sobre idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano.
- Se desconoce la longitud de contexto, dato crítico para planificar memoria y casos de uso con documentos largos.
- Solo se publica un build de 4 bits; no hay variantes de 8 bits, Q5, Q2 ni otras disponibles en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el texto de la licencia incluido en el repositorio y atribuirse la autoría a Hugging Face.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- No debe confundirse esta copia con una versión oficial de Hugging Face; el mantenimiento depende de OPIRS.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/opirs/SmolLM3-3B-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Build GGUF original: https://huggingface.co/ggml-org/SmolLM3-3B-GGUF
- OPIRS: https://opirs.org
