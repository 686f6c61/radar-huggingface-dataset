# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 es un modelo especializado derivado de Qwen3-0.6B, publicado por el usuario eduardoworrel. No es un modelo generativo de propósito general, sino un clasificador multitarea con tres cabezas independientes sobre el mismo backbone: ContractNLI (determinar si una hipótesis se deriva, contradice o no aparece en un contrato de confidencialidad), CLINC150 (clasificación binaria dentro/fuera de alcance de una consulta) y SIB-200 (clasificación temática en inglés y portugués). Cada tarea se resuelve en un único forward pass con una probabilidad y un margen asociados.

El modelo está empaquetado en formato ONNX int4 para onnxruntime-genai, con soporte de WebGPU, lo que permite ejecutarlo directamente en el navegador mediante la librería s1s2 del mismo autor. El tamaño del repositorio es de 0,4 GB, coherente con la cuantización int4 de un modelo de 0,6 mil millones de parámetros.

La propuesta técnica se articula en torno a la separación Sistema 1 / Sistema 2: una decisión rápida (un solo paso) y una escalada condicional a generación cuando el margen de confianza cae por debajo de un umbral calibrado. Es relevante para despliegues de clasificación de documentos legales y consultas en entornos con recursos limitados o sin backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de clasificación por tarea |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI (límite declarado); no disponible para el resto |
| Tipos de cuantizacion | int4 (ONNX Runtime GenAI) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai), grafo int4 para WebGPU |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros, y le añade cabezas de clasificación específicas por tarea. Según la model card, las cabezas se entrenaron con palabras de opción exactas y fijas: ContractNLI con "Entailment", "Contradiction" y "Not mentioned"; CLINC150 con "Yes" y "No"; SIB-200 en inglés con siete categorías temáticas y en portugués con sus equivalentes traducidos. Cualquier variación en esas palabras altera el prompt que lee la cabeza y rompe el funcionamiento.

El adaptador PyTorch y las cabezas se publican por separado en el repositorio eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA. La receta de entrenamiento se basa en la cabeza pointer y el método de Kev (Apache-2.0), y la separación Sistema 1 / Sistema 2 con compuerta de margen procede de CT0 de Alias Robotics. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las tres fuentes citadas (ContractNLI, CLINC150 y SIB-200). La innovación destacable es la decisión tipada en un solo forward pass con escalada opcional a generación cuando el margen es bajo.

## Capacidades

- Clasificación de relación contractual (ContractNLI): determina si una hipótesis se deriva, contradice o no se menciona en un contrato de confidencialidad, con probabilidad y margen.
- Clasificación binaria dentro/fuera de alcance (CLINC150): decide si una consulta queda fuera del ámbito cubierto.
- Clasificación temática (SIB-200): siete categorías en inglés y portugués (ciencia/tecnología, viaje, política, deportes, salud, entretenimiento, geografía).
- Decisión en un único forward pass (Sistema 1) con salida tipada, probabilidad y margen.
- Escalada condicional a generación (Sistema 2) cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios.
- Generación de texto breve para explicar decisiones (por ejemplo, una frase con maxNewTokens 64).
- Ejecución en navegador con WebGPU mediante s1s2.
- Capacidad multilingüe limitada a inglés y portugués.
- Cabeza de evidencia (evidence head) incluida en heads/evidence_cnli/, aunque s1s2 0.1 todavía no la controla.

## Casos de uso

- Revisión de acuerdos de confidencialidad: dado un NDA y una hipótesis, el modelo clasifica en un solo paso si el contrato la implica, la contradice o no la menciona, adecuado para triaje masivo de cláusulas con ventana de 2.048 tokens.
- Filtrado de consultas fuera de alcance en atención al cliente: la cabeza CLINC150 decide si una consulta entra en el ámbito soportado antes de derivarla a un agente o a un sistema mayor.
- Clasificación temática de noticias en inglés y portugués: la cabeza SIB-200 asigna una de siete categorías, útil para enrutado de contenidos en redacciones bilingües.
- Clasificación en el navegador sin backend: gracias al grafo ONNX int4 y WebGPU, el modelo corre en Chrome sobre un Apple M2 Pro, lo que permite procesar documentos sensibles sin enviarlos a un servidor.
- Triaje con escalada selectiva: usando la compuerta de margen, las decisiones de baja confianza se escalan a una pasada generativa que explica el razonamiento, reduciendo coste en el caso mayoritario.
- Preprocesado en pipelines de cumplimiento normativo: clasificación previa de contratos y consultas para decidir qué documentos requieren revisión humana o modelos mayores.
- Prototipado de asistentes legales ligeros: el par decisión tipada más explicación generativa permite construir interfaces que muestran confianza y justificación en una sola llamada.

## Benchmarks y rendimiento

Resultados medidos sobre este grafo int4 con ONNX Runtime CPU (x86), en los splits de test oficiales, con precisión balanceada de la cabeza de cada tarea:

| Conjunto de test | Precisión balanceada (%) | Azar (%) |
|---|---|---|
| CLINC150 fuera de alcance, n = 2.000 | 75,3 | 50,0 |
| ContractNLI, n = 1.190 | 47,5 | 33,3 |
| SIB-200 inglés, n = 204 | 81,2 | 14,3 |
| SIB-200 portugués, n = 204 | 79,8 | 14,3 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre el split de desarrollo: CLINC150 82,1 y ContractNLI 47,1. La prueba completa en navegador aún no se ha realizado según la model card.

## Requisitos de hardware

- Descarga del grafo int4: 0,35 GB; tamaño del repositorio: 0,4 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de 0,6 mil millones de parámetros en int4, cabe holgadamente en GPUs de consumo y en memoria unificada de equipos Apple.
- GPU recomendadas: no se especifican; el autor valida WebGPU en Apple M2 Pro y ONNX Runtime CPU en x86.
- Cabe en GPU de consumo: sí, por tamaño; no se detallan modelos concretos.
- Opciones de despliegue: onnxruntime-genai con WebGPU (navegador vía s1s2) y ONNX Runtime CPU (x86).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-0.6B especializado) | 0,6 B | 2.048 (ContractNLI) | Clasificación multitarea + generación breve | CC BY-SA 4.0 | ONNX int4, navegador |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en la información | Generación de propósito general | Apache-2.0 | Pesos originales |
| eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA | 0,6 B | no disponible | Adaptador y cabezas en PyTorch | no disponible | LoRA + cabezas |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se ofrece comparación de rendimiento numérica.

## Limitaciones y advertencias

- ContractNLI solo admite NDA de hasta 2.048 tokens; documentos más largos quedan fuera del alcance.
- CLINC150 está planteado como clasificación binaria dentro/fuera de alcance, no como clasificación de intenciones completa.
- Las etiquetas de SIB-200 en portugués se proyectan desde el inglés, lo que puede introducir sesgos de traducción.
- Las cabezas solo funcionan con las palabras de opción exactas con las que se entrenaron; cualquier variación rompe la decisión.
- La precisión en ContractNLI es moderada (47,5 % balanceada frente a 33,3 % de azar), insuficiente para uso autónomo en producción legal sin revisión humana.
- La prueba completa en navegador no se ha realizado; los resultados en WebGPU proceden del split de desarrollo.
- La cabeza de evidencia está incluida pero s1s2 0.1 no la controla todavía.
- Licencia CC BY-SA 4.0 con cláusula ShareAlike por la inclusión de SIB-200: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial cerrado.
- Riesgo de alucinación en la pasada generativa de explicación (Sistema 2), que no está validada contra las etiquetas.
- No se detallan sesgos conocidos del modelo base ni del proceso de entrenamiento de las cabezas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Receta de la cabeza pointer (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
