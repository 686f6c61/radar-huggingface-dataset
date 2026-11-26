# eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 es una especializacion multitarea del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel. Anade tres cabezas de clasificacion sobre el transformer subyacente: ContractNLI (determinar si un contrato implica, contradice o no menciona una hipotesis), CLINC150 (decidir si una consulta esta dentro o fuera de dominio) y SIB-200 (clasificacion tematica en ingles y portugues). Cada tarea se resuelve en un unico forward pass con una probabilidad y un margen asociados.

El interes principal reside en su formato de despliegue: los pesos se distribuyen como grafo ONNX cuantizado a int4 para onnxruntime-genai con soporte de WebGPU, lo que permite ejecutar el modelo directamente en el navegador mediante la libreria s1s2 del mismo autor. El repositorio ocupa 1,8 GB y la descarga del grafo int4 es de 1,75 GB, un tamano viable para inferencia local en cliente.

La arquitectura sigue el esquema "System 1 / System 2" del autor: una decision rapida en un solo paso (System 1) y una generacion explicativa opcional cuando el margen de confianza cae por debajo de un umbral calibrado (System 2). El modelo esta pensado para escenarios de clasificacion documental y conversacional en el navegador, no como un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabezas de clasificacion multitarea anadidas |
| Parametros totales | 3B (modelo base); parametros de las cabezas no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI; contexto general del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (grafo ONNX para onnxruntime-genai); el adaptador PyTorch original esta en bf16 |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai, int4, WebGPU); adaptador PyTorch y cabezas en el repo LoRA asociado |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3.000 millones de parametros, y le anade cabezas especificas por tarea entrenadas sobre las representaciones internas. Cada cabeza emite una decision tipada (una de las opciones predefinidas por tarea) acompanada de una probabilidad y un margen. Los datos de entrenamiento combinan tres conjuntos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0), CLINC150 (Larson et al., 2019; CC BY 3.0) y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0). El numero exacto de tokens de entrenamiento no esta disponible en la informacion proporcionada.

La innovacion tecnica destacable es el esquema System 1 / System 2: la clasificacion se resuelve en un unico forward pass y solo se invoca generacion autoregresiva cuando el margen de la respuesta cae por debajo de un umbral calibrado sobre datos etiquetados propios. El grafo se ha exportado a ONNX int4 para onnxruntime-genai con backend WebGPU, lo que permite ejecucion en navegador; existe tambien un layout alternativo para Transformers.js con los mismos pesos. Las cabezas se entrenaron con palabras de opcion exactas (por ejemplo, "Entailment", "Contradiction", "Not mentioned" para ContractNLI), de modo que cualquier variacion en el texto de las opciones altera el prompt que lee la cabeza. El repositorio incluye ademas una cabeza de evidencia (`heads/evidence_cnli/`) que selecciona el fragmento del contrato que sustenta la decision, aunque la version 0.1 de s1s2 aun no la explota directamente.

## Capacidades

- Clasificacion de contrato frente a hipotesis (ContractNLI): decide si un NDA implica, contradice o no menciona una hipotesis, con probabilidad y margen.
- Deteccion de consultas fuera de dominio (CLINC150): clasificacion binaria dentro/fuera de alcance para asistentes conversacionales.
- Clasificacion tematica multilingue (SIB-200): etiquetado en siete categorias (ciencia/tecnologia, viajes, politica, deportes, salud, entretenimiento, geografia) en ingles y portugues.
- Decision en un solo forward pass con salida tipada, probabilidad y margen.
- Escalado opcional a generacion explicativa (System 2) cuando el margen es bajo.
- Extraccion de evidencia contractual (cabeza incluida, no integrada aun en s1s2 0.1).
- Ejecucion en navegador con WebGPU y fallback a CPU via onnxruntime-web WASM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el escalado System 2 es el unico mecanismo de refinamiento.

## Casos de uso

- Revision automatizada de NDAs en el navegador: el modelo clasifica si una clausula hipotetica se implica, contradice o no se menciona en el contrato, sin enviar el texto a un servidor, gracias al grafo int4 con WebGPU y a su ventana de 2.048 tokens para ContractNLI.
- Triaje de consultas en asistentes conversacionales: CLINC150 permite decidir en un unico paso si una consulta esta dentro del alcance del bot, con un 86,9 % de balanced accuracy en el split de test, y escalar a generacion solo cuando el margen es bajo.
- Enrutamiento tematico de noticias o contenidos en ingles y portugues: SIB-200 clasifica en siete categorias con un 91,4 % (ingles) y un 92,7 % (portugues) de balanced accuracy, adecuado para pipelines de etiquetado editorial.
- Asistencia legal en cliente: despachos que necesitan preanalizar contratos sin salida de datos pueden desplegar el grafo ONNX en el navegador del usuario, con la cabeza de evidencia para localizar el fragmento relevante.
- Moderacion y filtrado de dominio en aplicaciones web: la clasificacion binaria in/out of scope de CLINC150 sirve para descartar peticiones fuera de alcance antes de invocar un LLM mayor, reduciendo coste y latencia.
- Sistemas de decision con explicabilidad bajo demanda: el esquema System 1 / System 2 permite obtener una etiqueta rapida y, solo cuando la confianza es baja, una justificacion generada en una frase, util en auditoria de decisiones automatizadas.
- Procesamiento local en dispositivos sin GPU dedicada: el fallback a CPU WASM mantiene decisiones identicas a WebGPU en 119 de 120 items, aunque con latencias de unos 30 s por decision en CLINC150 y unos 70 s en ContractNLI.

## Benchmarks y rendimiento

Resultados medidos sobre el grafo int4 con ONNX Runtime CPU (x86), splits de test oficiales, balanced accuracy por cabeza:

| Test set | Balanced accuracy (%) | Azar (%) |
|---|---|---|
| CLINC150 out-of-scope, n = 2.000 | 86,9 | 50 |
| ContractNLI, n = 1.190 | 63,1 | 33,3 |
| SIB-200 ingles, n = 204 | 91,4 | 14,3 |
| SIB-200 portugues, n = 204 | 92,7 | 14,3 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre el split de desarrollo: CLINC150 87,1 / ContractNLI 66,0. No se ha ejecutado aun la bateria de test completa en navegador.

Fidelidad respecto al modelo PyTorch bf16 del especialista (n = 992 items de desarrollo, Chrome con WebGPU en Apple M2 Pro): la decision coincide en el 92,1 % de los items con lectura por cabeza (intervalo del 95 %: 90,3 a 93,7) y en el 89,7 % con lectura por logits. Las cabezas SIB-200 no estan medidas por falta de salidas de referencia en desarrollo.

## Requisitos de hardware

- VRAM estimada: el grafo int4 ocupa 1,75 GB de descarga; la huella en memoria es del orden de 2 GB, aunque no se detalla en la informacion proporcionada.
- GPU recomendadas: no se especifican modelos concretos; el autor valida en Apple M2 Pro con WebGPU. Para servidor, el adaptador PyTorch bf16 requiere una GPU con al menos 6-8 GB de VRAM estimados (no confirmado en la informacion).
- Cabe en GPU consumer: si, en el rango de 2 GB para el grafo int4; cualquier GPU con WebGPU o con soporte ONNX Runtime es candidata.
- Opciones de despliegue: onnxruntime-genai con WebGPU, onnxruntime-web WASM (fallback CPU), libreria s1s2 (version >= 0.1.1), Transformers.js mediante el layout alternativo, y PyTorch con el adaptador LoRA del repositorio asociado.
- Latencia y throughput: en WebGPU sobre M2 Pro, no se reporta latencia por decision; en CPU WASM, aproximadamente 30 s por decision en CLINC150 (16,5 veces mas lento que WebGPU) y unos 70 s por decision en ContractNLI con entradas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SmolLM3-3B-ContractNLI-CLINC-SIB (este) | 3B | 2.048 (ContractNLI) | Clasificacion multitarea + generacion opcional | CC BY-SA 4.0 | ONNX int4, PyTorch |
| SmolLM3-3B (base) | 3B | no disponible | Generacion general | Apache-2.0 | safetensors, GGUF, ONNX |
| SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA | 3B | no disponible | Mismas tareas, adaptador PyTorch | no disponible | PyTorch (LoRA + cabezas) |
| SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs | 3B | no disponible | Mismas tareas, layout Transformers.js | no disponible | ONNX (Transformers.js) |

La comparativa con clasificadores especializados de menor tamano (por ejemplo, modelos BERT para ContractNLI o CLINC150) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- ContractNLI solo admite NDAs de hasta 2.048 tokens; documentos mas largos quedan truncados o fuera de alcance.
- CLINC150 se formula como clasificacion binaria dentro/fuera de dominio, no como clasificacion de intenciones completa.
- Las etiquetas de SIB-200 en portugues se proyectan desde el ingles, lo que puede introducir sesgos de traduccion.
- Las cabezas solo funcionan con las palabras de opcion exactas del entrenamiento; cualquier variacion en el texto de las opciones invalida la decision.
- Riesgo de alucinacion en la fase System 2 (generacion explicativa), aunque la respuesta tipada se conserva.
- En CPU sin WebGPU la latencia es alta (unos 30-70 s por decision), poco adecuada para produccion interactiva.
- La cabeza de evidencia contractual no esta integrada en s1s2 0.1.
- La licencia CC BY-SA 4.0 impone ShareAlike: los derivados deben distribuirse bajo la misma licencia, lo que puede condicionar el uso comercial cerrado.
- Sesgos especificos no documentados en la informacion proporcionada.
- Fidelidad respecto al modelo bf16 no medida en los splits de test ni en las cabezas SIB-200.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Adaptador PyTorch y cabezas: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA
- Layout Transformers.js: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Cabeza pointer y receta de entrenamiento (Kev): https://github.com/jaredpalmer/kev
