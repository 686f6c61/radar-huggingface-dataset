# eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es una especialización del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel. No se trata de un modelo de generación de texto al uso: el autor lo describe como un "especialista" que combina el modelo base cuantizado a int4 con cabezas de decisión separadas para tres tareas de clasificación (ContractNLI para inferencia sobre contratos, CLINC150 para intención conversacional y SIB-200 para clasificación de temas multilingüe). El paquete se distribuye en formato ONNX para su ejecución con Transformers.js en entornos JavaScript, tanto en Node como potencialmente en navegador.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, fue creado en noviembre de 2026 y su model card es fundamentalmente una nota de compatibilidad con otra build de referencia (la versión ONNX Runtime GenAI). El autor indica que esta copia porta los mismos pesos int4 byte a byte que la build de referencia, cambiando únicamente metadatos del grafo y nombres de fichero, y que la paridad se verificó con 20 prompts de comprobación en CPU con onnxruntime-node 1.30.0 y transformers.js 4.3.1, obteniendo diferencias máximas de 0 en estados ocultos y probabilidades de cabeza, y 20/20 decisiones idénticas.

Arquitectónicamente hereda el transformer de SmolLM3-3B (3.000 millones de parámetros) pero el uso previsto no es la generación libre, sino la lectura de estados ocultos por parte de cabezas de clasificación gestionadas por la librería propietaria `s1s2`. El tamaño del repositorio es de 1,8 GB y la licencia es CC BY-SA 4.0, condicionada por el dataset SIB-200.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM3-3B) con cabezas de clasificación externas; grafo ONNX |
| Parametros totales | 3.000 millones (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (q4) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (model_q4.onnx) + config.json; cabezas en heads/ |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer de 3.000 millones de parámetros de Hugging Face, cuantizado a int4 y exportado a ONNX. Sobre ese grafo, el autor añade cabezas de decisión separadas (ficheros en `heads/`) que consumen el estado oculto final por token (`hidden_states`) y producen clasificaciones para tres tareas: ContractNLI (inferencia de entailment sobre cláusulas de contratos), CLINC150 (detección de intención y out-of-scope en dominios conversacionales) y SIB-200 (clasificación de temas en 200 idiomas, con manifiestos separados para inglés y portugués). El autor cita como receta de entrenamiento y cabeza pointer la del proyecto Kev (Apache-2.0), y como inspiración del reparto System 1 / System 2 y la compuerta de margen el proyecto CT0 de Alias Robotics, además del paper "Browser Immune System" (arXiv 2611.15302).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las tres fuentes citadas (ContractNLI, CLINC150, SIB-200) ni si hubo RLHF o DPO. La model card tampoco especifica hiperparámetros, épocas ni estrategia de congelación de capas del modelo base. La innovación técnica declarada es la separación entre un "system 1" rápido (cabezas de clasificación sobre estados ocultos) y un "system 2" más deliberativo, con una compuerta de margen para decidir cuándo escalar, aunque los detalles de implementación no se incluyen en la información proporcionada.

## Capacidades

- Clasificación de intención conversacional (CLINC150), incluyendo detección de consultas fuera de dominio (out-of-scope).
- Inferencia de entailment sobre cláusulas contractuales (ContractNLI): determinar si una hipótesis se sigue, contradice o es neutral respecto a una premisa contractual.
- Clasificación de temas multilingüe (SIB-200) con manifiestos específicos para inglés y portugués.
- Ejecución en JavaScript mediante Transformers.js, con soporte de ONNX Runtime en Node (verificado) y WebGPU en navegador (no verificado para este layout).
- Acceso a estados ocultos por token mediante `model.forward()`, lo que permite integrar cabezas propias.
- No es un modelo de generación libre en la práctica: el autor indica explícitamente que no es un `pipeline` de transformers.js ni un formato open-jev/Kev.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no es el propósito del paquete).

## Casos de uso

- Moderación y enrutado de consultas en asistentes conversacionales: usar la cabeza CLINC150 para clasificar la intención del usuario y detectar peticiones fuera de dominio antes de invocar un LLM mayor, reduciendo coste y latencia.
- Revisión automática de contratos: la cabeza ContractNLI permite etiquetar cláusulas como implicadas, contradictorias o neutrales respecto a hipótesis predefinidas (por ejemplo, "el contrato permite cesión a terceros"), útil en pipelines de due diligence.
- Clasificación temática multilingüe en portugués e inglés: la cabeza SIB-200 con manifiestos separados permite etiquetar documentos o titulares por tema en ambos idiomas dentro de una misma aplicación JavaScript.
- Aplicaciones web del lado del cliente: al ejecutarse con Transformers.js y ONNX, puede desplegarse en el navegador (pendiente de validación WebGPU en este layout) para clasificar texto sin enviar datos a un servidor, lo que resulta relevante en sectores con requisitos de privacidad.
- Enrutado en sistemas RAG: clasificar la consulta entrante para decidir qué índice o herramienta consultar antes de la recuperación, usando la cabeza de intención como primer filtro.
- Investigación en arquitecturas System 1 / System 2: el paquete sirve como referencia reproducible para estudiar compuertas de margen y separación entre clasificación rápida y razonamiento deliberativo, dado que el autor cita explícitamente esta línea de trabajo.
- Prototipado rápido en Node.js: con `onnxruntime-node` y `@huggingface/transformers` se puede montar un servicio de clasificación sin salir del ecosistema JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comprobación de paridad con la build de referencia GenAI: 20 prompts de verificación (no un conjunto de test) en CPU con onnxruntime-node 1.30.0 y transformers.js 4.3.1, con diferencia máxima absoluta de 0 en estados ocultos y probabilidades de cabeza, y 20/20 decisiones idénticas. No se aportan métricas de precisión, F1 ni latencia sobre ContractNLI, CLINC150 o SIB-200.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,8 GB, lo que sugiere que el grafo int4 más cabezas cabe holgadamente en GPUs de consumo, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- Cabida en GPU de consumo: probable por el tamaño del artefacto (1,8 GB) y la cuantización int4, pero no confirmado por el autor.
- Opciones de despliegue: Transformers.js con ONNX Runtime (Node verificado; WebGPU en navegador no ejecutado para este layout), y la build de referencia ONNX Runtime GenAI en el repositorio hermano.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolLM3-3B especialista) | 3.000 M | no disponible | ONNX int4 + cabezas | CC BY-SA 4.0 | Hugging Face (0 descargas) |
| HuggingFaceTB/SmolLM3-3B | 3.000 M | no disponible | safetensors | Apache-2.0 | Hugging Face (modelo base) |
| SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 3.000 M | no disponible | ONNX int4 (GenAI) | CC BY-SA 4.0 | Hugging Face (build de referencia) |
| alias3-web (Alias Robotics) | no disponible | no disponible | no disponible | no disponible | Hugging Face (precursor citado) |

La comparación con modelos de clasificación estándar (por ejemplo, clasificadores BERT pequeños para CLINC150) no está disponible en la información proporcionada. El modelo base SmolLM3-3B es la referencia natural para generación, mientras que este paquete está orientado a clasificación y no es directamente comparable en tareas generativas.

## Limitaciones y advertencias

- No es un modelo de generación de texto utilizable como `pipeline` estándar de transformers.js: requiere la librería `s1s2` para leer las cabezas de decisión.
- La dimensión de cabeza del KV cache está fijada en el grafo, una restricción impuesta por Transformers.js que puede limitar la reutilización del grafo en otros runtimes.
- La validación en navegador (WebGPU) no se ha ejecutado para este layout; solo se ha verificado en Node con CPU.
- La licencia CC BY-SA 4.0 es ShareAlike: obliga a compartir bajo la misma licencia las obras derivadas, lo que puede ser problemático en productos comerciales cerrados. Además, hay que mantener la atribución de ContractNLI (CC BY 4.0), CLINC150 (CC BY 3.0), SIB-200 (CC BY-SA 4.0) y del modelo base (Apache-2.0).
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al tratarse de cabezas de clasificación sobre un modelo base, los sesgos del corpus de entrenamiento de SmolLM3-3B pueden propagarse a las decisiones.
- Idiomas: solo se declaran inglés y portugués; el resto de idiomas de SIB-200 no están cubiertos por los manifiestos incluidos.
- Madurez: cero descargas y cero likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- No se han publicado métricas de precisión sobre los conjuntos de test de las tres tareas, por lo que no se puede afirmar su calidad más allá de la paridad con la build de referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build de referencia (ONNX Runtime GenAI): https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Transformers.js: https://github.com/huggingface/transformers.js
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Kev (receta de cabeza pointer): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
