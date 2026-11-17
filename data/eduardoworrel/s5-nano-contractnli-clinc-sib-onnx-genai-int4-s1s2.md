# eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

S5-nano ContractNLI + CLINC150 + SIB-200 es una especializacion multitarea del modelo base S5-nano de Maritaca AI, publicada por el usuario eduardoworrel. Anade tres cabezas de clasificacion sobre el modelo base: ContractNLI (determinar si una hipotesis se deriva, se contradice o no se menciona en un contrato de confidencialidad), CLINC150 (decidir si una consulta esta dentro o fuera del dominio de un asistente) y SIB-200 (clasificar el tema de un texto en ingles y portugues). Cada cabeza produce una decision en un unico forward pass, con probabilidad y margen asociados.

La distribucion esta empaquetada en formato ONNX int4 para onnxruntime-genai, con el objetivo declarado de ejecutarse en el navegador mediante la libreria s1s2 del mismo autor. El modelo base S5-nano es un modelo de Maritaca AI con licencia Apache-2.0; esta version cuantizada hereda una licencia CC BY-SA 4.0 por la inclusion de SIB-200 en el entrenamiento.

El interes practico reside en el patron "System 1 / System 2": las cabezas resuelven la clasificacion en una sola pasada y, cuando el margen de decision es bajo, se escala a generacion de texto para explicar o refinar la respuesta. El repositorio ocupa 2,5 GB y esta pensado exclusivamente para WebGPU, sin kernel de CPU para sus capas GatedDeltaNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas GatedDeltaNet (modelo base S5-nano) con cabezas de clasificacion multitarea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI; no disponible para el resto |
| Tipos de cuantizacion | int4 (ONNX) |
| Idiomas soportados | ingles, portugues |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai), grafo para WebGPU |

## Arquitectura y entrenamiento

El modelo parte de S5-nano de Maritaca AI, cuya arquitectura incluye capas GatedDeltaNet, un mecanismo de atencion lineal con estado recurrente. Sobre ese backbone se anaden tres cabezas de clasificacion independientes, una por tarea, entrenadas mediante adaptadores LoRA (publicados por separado en eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-LoRA). Cada cabeza lee la representacion del prompt y emite una eleccion tipada junto con una probabilidad y un margen.

Los datos de entrenamiento combinan tres conjuntos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0) para la tarea de implicacion contractual, CLINC150 (Larson et al., 2019; CC BY 3.0) reformulado como clasificacion binaria dentro/fuera de dominio, y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0) para clasificacion tematica en ingles y portugues. Las etiquetas de SIB-200 en portugues se proyectan desde el ingles. El autor menciona ademas una cabeza de evidencia (study 006) incluida en `heads/evidence_cnli/` que la version 0.1 de s1s2 aun no utiliza.

La innovacion principal es el esquema de dos sistemas: una pasada de clasificacion (System 1) y una escalada condicional a generacion de texto (System 2) cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios. La idea procede de CT0 de Alias Robotics y de los trabajos previos alias3-web y el paper arXiv 2611.15302.

## Capacidades

- Clasificacion de implicacion contractual (ContractNLI): decide si una hipotesis se deriva, se contradice o no se menciona en un NDA.
- Deteccion de consultas fuera de dominio (CLINC150): clasificacion binaria dentro/fuera de alcance para asistentes conversacionales.
- Clasificacion tematica (SIB-200) en ingles y portugues: ciencia/tecnologia, viaje, politica, deportes, salud, entretenimiento y geografia.
- Decision en un unico forward pass con probabilidad y margen asociados.
- Escalada condicional a generacion de texto (System 2) para explicar decisiones de bajo margen.
- Generacion de texto conversacional heredada del modelo base.
- Ejecucion en navegador mediante WebGPU con la libreria s1s2.
- Restriccion estricta de vocabulario de opciones: las palabras de opcion deben coincidir exactamente con las usadas en entrenamiento.

## Casos de uso

- Revision automatizada de NDAs: el modelo clasifica si una clausula propuesta se deriva, contradice o no aparece en un contrato de confidencialidad, con contexto de hasta 2.048 tokens, lo que cubre la mayoria de NDAs estandar.
- Triaje de consultas en asistentes conversacionales: la cabeza CLINC150 detecta consultas fuera de dominio antes de invocar un LLM mayor, reduciendo coste y latencia en produccion.
- Enrutamiento tematico de noticias: la cabeza SIB-200 clasifica articulos en siete categorias en ingles y portugues, util para pipelines de agregacion y recomendacion.
- Procesamiento en el navegador sin servidor: al ejecutarse con WebGPU y s1s2, permite clasificar documentos sensibles localmente sin enviar datos a la nube.
- Auditoria asistida con explicacion: el patron de escalada genera una explicacion en una frase cuando el margen de decision es bajo, util para revisiones humanas de casos ambiguos.
- Filtrado previo en pipelines RAG: la deteccion de fuera de dominio evita recuperaciones irrelevantes antes de consultar el indice vectorial.
- Clasificacion multilingue ligera en dispositivos: la combinacion ingles/portugues cubre mercados de Brasil y Portugal con un unico artefacto de 2,5 GB.

## Benchmarks y rendimiento

Resultados medidos sobre una build ONNX int4 con ONNX Runtime CUDA en una A40, usando las particiones de test oficiales y balanced accuracy por cabeza.

| Conjunto de test | Balanced accuracy (%) | Azar (%) |
|---|---|---|
| CLINC150 fuera de dominio (n = 2.000) | 93,7 | 50,0 |
| ContractNLI (n = 1.190) | 78,1 | 33,3 |
| SIB-200 ingles (n = 204) | 90,7 | 14,3 |
| SIB-200 portugues (n = 204) | 90,8 | 14,3 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre la particion de desarrollo: CLINC150 93,1 y ContractNLI 77,1. El autor indica que no se ha ejecutado aun la bateria completa de test en navegador.

## Requisitos de hardware

- Descarga del artefacto: 2,44 GB (grafo ONNX int4).
- Inferencia exclusivamente en WebGPU: no existe kernel de CPU para las capas GatedDeltaNet del grafo.
- GPU de referencia para benchmarks: NVIDIA A40 con ONNX Runtime CUDA.
- Navegador de referencia: Chrome con WebGPU sobre Apple M2 Pro.
- Cabe en GPUs de consumo con soporte WebGPU (Apple Silicon, GPUs AMD e Intel recientes, NVIDIA serie RTX); no se han publicado cifras de VRAM especificas.
- Opciones de despliegue: onnxruntime-genai con backend WebGPU y la libreria s1s2 en el navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| S5-nano ContractNLI + CLINC150 + SIB-200 (este) | no disponible | 2.048 (ContractNLI) | Clasificacion multitarea + generacion | CC BY-SA 4.0 | ONNX int4 |
| maritaca-ai/S5-nano (base) | no disponible | no disponible | Generacion de texto | Apache-2.0 | safetensors |
| alias3-web (Alias Robotics) | no disponible | no disponible | Clasificacion en navegador | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El grafo solo funciona en WebGPU; no hay kernel de CPU para las capas GatedDeltaNet, lo que impide su uso en entornos sin GPU compatible.
- ContractNLI esta limitado a NDAs de hasta 2.048 tokens; contratos mas largos requieren truncado o segmentacion.
- CLINC150 se reformula como clasificacion binaria dentro/fuera de dominio, perdiendo la granularidad de intenciones del conjunto original.
- Las etiquetas de SIB-200 en portugues se proyectan desde el ingles, lo que puede introducir sesgos de traduccion.
- Las palabras de opcion deben coincidir exactamente con las de entrenamiento; cualquier variacion cambia el prompt y rompe la cabeza.
- La cabeza de evidencia incluida en `heads/evidence_cnli/` no esta integrada en s1s2 0.1.
- No se ha completado la bateria de test en navegador; los resultados publicados en WebGPU son de la particion de desarrollo.
- La licencia CC BY-SA 4.0 impone obligaciones de atribucion y comparticion bajo la misma licencia para obras derivadas, lo que puede condicionar el uso comercial.
- Riesgo de alucinacion en la fase de generacion (System 2) heredado del modelo base; las clasificaciones de las cabezas no generan texto libre pero pueden fallar en casos ambiguos.
- No se han publicado evaluaciones de sesgo para este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas en PyTorch: https://huggingface.co/eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-LoRA
- Modelo base S5-nano: https://huggingface.co/maritaca-ai/S5-nano
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Cabeza pointer y receta de entrenamiento (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
