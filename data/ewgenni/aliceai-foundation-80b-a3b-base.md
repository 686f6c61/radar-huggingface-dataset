# ewgenni/AliceAI-Foundation-80B-A3B-Base

## Resumen

AliceAI-Foundation-80B-A3B-Base es un modelo de lenguaje autorregresivo de tipo base (solo preentrenamiento) con arquitectura híbrida y capas de mezcla de expertos (MoE). El repositorio está publicado en HuggingFace por el usuario `ewgenni` y su model card referencia la línea AliceAI de Yandex, además de datasets y un artículo de Habr de Yandex; se distribuye bajo licencia Apache 2.0. Cuenta con 81.286.433.408 parámetros totales, de los que se activan aproximadamente 3.000 millones por token, y soporta una longitud de contexto de hasta 262.144 tokens.

El modelo se ha entrenado desde cero y combina dos tipos de atención: capas KDA (una forma de atención lineal con kernel convolucional) y capas Gated Attention, intercaladas con capas MoE de 512 expertos. La model card indica que el objetivo es ofrecer resultados de razonamiento (matemáticas y programación) al nivel de modelos de mayor tamaño, con un rendimiento especialmente fuerte en conocimiento factual en ruso. Para ello se publican dos benchmarks de hechos en ruso, WikiWebFacts y HardMultiQA, junto con sus protocolos de evaluación.

Es relevante ahora porque propone una relación parámetros activos/rendimiento muy agresiva (3B activos sobre 80B totales) y porque incluye una ventana de contexto poco habitual (262.144 tokens) en un modelo base abierto. Al ser un modelo base sin ajuste por instrucciones, su uso directo requiere fine-tuning o ajuste específico para tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo híbrido con capas KDA (atención lineal con kernel de convolución de tamaño 4) y Gated Attention, más capas MoE |
| Parametros totales | 81.286.433.408 (81,3 B) |
| Parametros activos | 3 B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors a precisión completa) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |
| Tamaño del repositorio | 162,6 GB |
| Tamaño de estado oculto | 2048 |
| Tamaño de vocabulario | 129.024 |
| Número de capas | 48 |
| Esquema de capas | 12 × (3 × (KDA → MoE) → 1 × (Gated Attention → MoE)) |
| KDA | 32 cabezas query, 32 cabezas KV, dimensión de cabeza query 128, dimensión de cabeza KV 128, kernel de convolución 4 |
| Gated Attention | 16 cabezas query, 2 cabezas KV, dimensión de cabeza query 256 |
| MoE | 512 expertos, Top-K de 10 + 1 experto compartido, dimensión intermedia del experto 512 |
| MTP | 1 capa |

## Arquitectura y entrenamiento

La arquitectura es híbrida: de las 48 capas, el patrón se repite 12 veces combinando tres bloques KDA seguidos de un bloque de Gated Attention, y cada uno de ellos va acompañado de una capa MoE. Las capas KDA son una forma de atención lineal con convolución de kernel 4, pensada para reducir el coste de la atención sobre contextos muy largos, mientras que las capas Gated Attention introducen atención clásica con GQA (16 cabezas query y 2 cabezas KV). Las capas MoE usan 512 expertos con un enrutado Top-K de 10 más un experto compartido, con dimensión intermedia por experto de 512. Se incluye además una capa MTP (multi-token prediction), útil para decodificación especulativa o entrenamiento auxiliar.

El modelo se entrenó íntegramente desde cero. La model card indica que el corpus de entrenamiento se construyó de nuevo, que se seleccionaron arquitectura e hiperparámetros específicos y que se prepararon datos para razonamiento complejo e interacción con herramientas. Las decisiones clave se validaron con una serie de entrenamientos desde cero de 2 billones de tokens cada uno. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens finales de entrenamiento, ni si hubo fases de RLHF o DPO (al tratarse de un modelo base, no se menciona ajuste por preferencias).

## Capacidades

- Generación de texto autorregresiva en ruso e inglés.
- Conocimiento factual en ruso, destacado en los benchmarks WikiWebFacts y HardMultiQA.
- Razonamiento matemático y de programación, según la model card a nivel de modelos de mayor tamaño.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones muy largas.
- Capacidad latente para interacción con herramientas (la model card indica que se prepararon datos para ello), aunque no se ofrece como capacidad lista para usar por ser un modelo base.
- Soporte de decodificación asistida por MTP (1 capa).
- Bilingüe ruso/inglés; no se declaran otros idiomas.

## Casos de uso

- Fine-tuning para asistentes en ruso: al ser un modelo base con buen rendimiento factual en ruso, es un punto de partida para ajustar asistentes conversacionales y de atención al cliente en ese idioma.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden resumir, indexar o extraer información de contratos, informes o expedientes completos sin truncar.
- Generación de código tras ajuste: la model card declara resultados competitivos en tareas de programación; con fine-tuning se puede integrar en asistentes de código o revisión de PRs.
- Investigación en razonamiento matemático: sirve como base para experimentos de razonamiento paso a paso y para estudiar el comportamiento de arquitecturas híbridas KDA/atención.
- Sistemas de recuperación aumentada (RAG) en ruso: su ventana de contexto larga y su conocimiento factual lo hacen adecuado para responder sobre corpus documentales extensos.
- Investigación en eficiencia de MoE: con 3B activos sobre 80B totales es un caso de estudio para medir relación calidad/coste de cómputo en despliegues con vLLM.
- Traducción ruso-inglés tras ajuste: el soporte bilingüe permite adaptarlo a tareas de traducción o transcripción con fine-tuning supervisado.

## Benchmarks y rendimiento

Datos extraídos de la tabla publicada en la model card (inferencia con vLLM, temperatura 0, 5-shot en los benchmarks de hechos). Sólo se dispone de resultados completos para WikiWebFacts y HardMultiQA; el resto de filas (por ejemplo CultCat) no aparecen completas en la información disponible.

| Benchmark | AliceAI-Foundation-80B-A3B-Base | Qwen3.5-35B-A3B-Base | GLM-4.5-Air-Base (106B-A12B) | Nemotron-3-Super-120B-A12B-Base | DeepSeek-V4-Flash-Base (284B-A13B) |
|---|---|---|---|---|---|
| WikiWebFacts (5-shot, hechos en ruso) | 86,5 | 62,4 | 70,2 | 72,8 | 83,2 |
| HardMultiQA (5-shot, hechos en ruso) | 67,9 | 47,2 | 48,6 | 54,5 | 65,4 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K para este modelo. Tampoco se han proporcionado cifras completas para el resto de categorías de la tabla original (por ejemplo CultCat).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los 81,3 B de parámetros ocupan aproximadamente 162,6 GB (coincide con el tamaño del repositorio). En cuantización de 8 bits rondaría los 81 GB y en 4 bits los 40-41 GB, aunque el repositorio no publica pesos cuantizados oficiales.
- Cómputo: al activar solo 3 B de parámetros por token, el coste por token es comparable al de un modelo denso de ~3 B, aunque la memoria debe alojar todos los pesos.
- GPU recomendadas: para bf16 son necesarios varios aceleradores (por ejemplo 2× H100 80 GB o 4× A100 80 GB). Para cuantizaciones de 4 bits podría caber en una sola GPU de 48-80 GB, como A6000, L40S o A100 80 GB.
- Cabe en GPU de consumo: no en bf16. En cuantización agresiva de 4 bits cabría ajustadamente en una RTX 4090 (24 GB) solo con offloading parcial o técnicas de bajo consumo de memoria; no hay pesos GGUF oficiales publicados.
- Opciones de despliegue: la model card está etiquetada para vLLM, y el modelo requiere `custom_code` para cargarse con transformers. No se declaran soportes oficiales de llama.cpp/Ollama ni pesos GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Rendimiento (WikiWebFacts / HardMultiQA) | Licencia | Estado |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base | 81,3 B / 3 B | 262.144 | 86,5 / 67,9 | Apache 2.0 | Base, publicado en HF |
| Qwen3.5-35B-A3B-Base | 35 B / 3 B | no disponible en la información | 62,4 / 47,2 | no disponible en la información | Base |
| GLM-4.5-Air-Base | 106 B / 12 B | no disponible en la información | 70,2 / 48,6 | no disponible en la información | Base |
| Nemotron-3-Super-120B-A12B-Base | 120 B / 12 B | no disponible en la información | 72,8 / 54,5 | no disponible en la información | Base |
| DeepSeek-V4-Flash-Base | 284 B / 13 B | no disponible en la información | 83,2 / 65,4 | no disponible en la información | Base |

Los datos de contexto y licencia de los modelos comparados no se han proporcionado en la información disponible y no se han inferido.

## Limitaciones y advertencias

- Es un modelo base (solo preentrenamiento): no está ajustado para seguir instrucciones ni para conversar; su uso directo en aplicaciones requiere fine-tuning.
- Idiomas declarados únicamente ruso e inglés; no hay garantía de comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: al ser un modelo base, no incorpora mecanismos de alineación orientados a reducir invenciones factuales fuera de los benchmarks declarados.
- Sesgos: no se documenta en la información disponible ninguna evaluación de sesgos, toxicidad o sesgos de género/etnia.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende de `custom_code` específico del autor, por lo que conviene revisar el código asociado antes de integrarlo en producción.
- Requisitos de memoria muy altos en precisión completa (~162,6 GB), sin versiones cuantizadas oficiales publicadas.
- Contexto largo (262.144 tokens) declarado por el autor; no se aportan mediciones independientes de degradación del rendimiento en contextos muy extensos.
- La model card referencia el ecosistema de Yandex (datasets y artículo de Habr) mientras que el repositorio de HuggingFace está publicado por el usuario `ewgenni`; conviene verificar la procedencia y los permisos antes de un despliegue crítico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ewgenni/AliceAI-Foundation-80B-A3B-Base
- Artículo en Habr (referenciado en la model card): https://habr.com/ru/companies/yandex/articles/1083300/
- Dataset WikiWebFacts: https://huggingface.co/datasets/yandex/WikiWebFacts
- Dataset HardMultiQA: https://huggingface.co/datasets/yandex/HardMultiQA
- README en inglés del repositorio: ./README_en.md (relativo al propio repositorio)
