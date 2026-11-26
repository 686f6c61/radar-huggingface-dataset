# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 es una especializacion multitarea del modelo base Qwen3-0.6B, publicada por el usuario eduardoworrel. Sobre el transformer de 0,6 mil millones de parametros se anaden tres cabezas de clasificacion independientes: ContractNLI (determinar si una hipotesis se infiere, se contradice o no se menciona en un contrato tipo NDA), CLINC150 (clasificar si una consulta esta dentro o fuera de dominio) y SIB-200 (clasificacion tematica en ingles y portugues). El modelo esta empaquetado en formato ONNX int4 para ejecutarse integramente en el navegador mediante la libreria s1s2 con WebGPU.

La propuesta tecnica es un patron de dos sistemas ("System 1 / System 2"): cada tarea se resuelve en un unico forward pass que devuelve una opcion tipada junto con una probabilidad y un margen, y solo cuando el margen cae por debajo de un umbral calibrado se escala a una generacion autorregresiva explicativa. Esto reduce el coste de inferencia en tareas de clasificacion estructurada y permite desplegar el modelo en entornos sin GPU dedicada, incluido un fallback a CPU via onnxruntime-web WASM.

El interes actual reside en su caracter de demostracion practica de clasificacion especializada de bajo coste en el navegador: el grafico int4 pesa 0,35 GB y el repo completo 0,4 GB. No obstante, los propios resultados publicados por el autor muestran un rendimiento modesto en ContractNLI (47,5 % de balanced accuracy) y una fidelidad baja frente al modelo PyTorch bf16 de referencia, por lo que debe tratarse como un experimento reproducible mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de clasificacion por tarea |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI (limite declarado en la model card); no disponible para el resto de tareas |
| Tipos de cuantizacion | int4 (grafo ONNX para onnxruntime-genai); existen variantes q4f16_1 (MLC) y LiteRT |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai, int4); variante alternativa Transformers.js ONNX; MLC q4f16_1; LiteRT |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso de 0,6 mil millones de parametros. Sobre la representacion del modelo base se anaden cabezas especificas por tarea, entrenadas como adaptadores LoRA (publicados por separado en el repo `eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA`) y posteriormente fusionadas y exportadas a ONNX int4. Cada cabeza lee la salida del modelo condicionada por un prompt con palabras de opcion fijas: en ContractNLI "Entailment", "Contradiction" y "Not mentioned"; en CLINC150 "Yes" y "No"; y en SIB-200 las siete etiquetas tematicas en ingles o portugues. Las palabras de opcion no son intercambiables: cambiarlas altera el prompt que lee la cabeza y rompe la decision.

La innovacion principal es el esquema de decision en dos niveles implementado en la libreria s1s2. El "System 1" ejecuta un unico forward pass y devuelve `choice`, `confidence` y `margin`; el "System 2" solo se activa cuando el margen es inferior a un umbral calibrado sobre datos etiquetados propios, y entonces invoca una generacion autorregresiva (por ejemplo, una explicacion en una frase) manteniendo la respuesta tipada. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de las fuentes: ContractNLI (CC BY 4.0), CLINC150 (CC BY 3.0) y SIB-200 (CC BY-SA 4.0). Las etiquetas portuguesas de SIB-200 se proyectan desde el ingles, lo que constituye una limitacion declarada.

## Capacidades

- Clasificacion de contrato NDA: decide si una hipotesis se infiere, se contradice o no se menciona en el contrato, con probabilidad y margen por respuesta.
- Clasificacion de intencion fuera de dominio (CLINC150) en formato binario dentro/fuera de alcance.
- Clasificacion tematica SIB-200 en ingles y portugues (ciencia/tecnologia, viaje, politica, deportes, salud, entretenimiento, geografia).
- Decision tipada en un unico forward pass con salida estructurada (`choice`, `confidence`, `margin`).
- Escalado condicional a generacion autorregresiva ("System 2") cuando el margen es bajo, con umbral calibrable.
- Generacion de texto explicativo breve (por ejemplo, justificacion de una decision en 64 tokens nuevos).
- Ejecucion en navegador con WebGPU y fallback a CPU via onnxruntime-web WASM.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Triaje de contratos NDA: el modelo clasifica en un unico forward pass si una clausula candidata se infiere, se contradice o no se menciona, lo que permite filtrar revisiones manuales en flujos de compliance.
- Deteccion de consultas fuera de alcance en asistentes: con CLINC150 binario se descartan peticiones fuera de dominio antes de invocar un modelo mayor, reduciendo coste y latencia en pipelines de atencion al cliente.
- Etiquetado tematico de contenidos en ingles y portugues: SIB-200 permite clasificar articulos o tickets en siete categorias con una sola pasada, util para enrutamiento editorial o de soporte.
- Justificacion de decisiones con coste controlado: el patron de escalado ejecuta la generacion explicativa solo cuando el margen es bajo, lo que abarata auditorias frente a generar explicaciones para cada decision.
- Despliegue en el navegador sin backend: el grafo int4 de 0,35 GB se carga con WebGPU en equipos consumer, adecuado para demos, prototipos y aplicaciones con requisitos de privacidad (los datos no salen del cliente).
- Fallback en entornos sin GPU: la ruta onnxruntime-web WASM permite ejecutar el modelo en CPU del navegador con un coste declarado de 8,9x a 10,9x mas lento que WebGPU, suficiente para validaciones puntuales.
- Clasificacion de contratos con limite de 2.048 tokens: util para NDAs de extension moderada en herramientas de revision documental integradas en el navegador.

## Benchmarks y rendimiento

Medido sobre el grafo int4 con ONNX Runtime CPU (x86) y particiones de test oficiales; balanced accuracy por cabeza:

| Conjunto de test | Balanced accuracy (%) | Azar (%) |
|---|---|---|
| CLINC150 out-of-scope, n = 2.000 | 75,3 | 50,0 |
| ContractNLI, n = 1.190 | 47,5 | 33,3 |
| SIB-200 ingles, n = 204 | 81,2 | 14,3 |
| SIB-200 portugues, n = 204 | 79,8 | 14,3 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre el split de desarrollo: CLINC150 82,1 y ContractNLI 47,1. La fidelidad frente al modelo PyTorch bf16 de referencia, medida sobre 992 items de desarrollo, es del 77,0 % con lectura por cabeza (intervalo del 95 %: 74,3-79,5) y del 62,0 % con lectura por logits. El autor declara explicitamente que el acuerdo es bajo y que no recomienda usar la cabeza de intencion de Qwen3-0.6B a 4 bits. Las cabezas SIB-200 no tienen medicion de fidelidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo int4 ocupa 0,35 GB en disco; el repo completo 0,4 GB. La VRAM necesaria para WebGPU no se detalla en la informacion disponible.
- GPU recomendadas: no disponible en la model card; las pruebas en navegador se hicieron con Apple M2 Pro via WebGPU.
- Cabe en GPU consumer: si, segun el tamano del grafo int4; no se enumeran modelos concretos de GPU en la informacion disponible.
- Opciones de despliegue: onnxruntime-genai (WebGPU), onnxruntime-web WASM (CPU del navegador), Transformers.js (formato alternativo), MLC (q4f16_1) y LiteRT.js.
- Latencia y throughput: no se publican valores absolutos; se indica que el fallback WASM es 8,9x mas lento que WebGPU en ContractNLI y 10,9x en CLINC150 (Chrome, Apple M2 Pro, 120 items de desarrollo por tarea).
- Acuerdo CPU vs WebGPU: decisiones identicas en 116/120 items (ContractNLI) y 119/120 (CLINC150) con s1s2 >= 0.1.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B (base) | 0,6 B | no disponible en la informacion | Generacion general | Apache-2.0 | Hugging Face |
| Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA | 0,6 B | no disponible en la informacion | Adaptador PyTorch + cabezas | no disponible en la informacion | Hugging Face |
| Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 | 0,6 B | no disponible en la informacion | Mismo modelo en formato Transformers.js | no disponible en la informacion | Hugging Face |
| Este modelo (ONNX genai int4) | 0,6 B | 2.048 (ContractNLI) | Clasificacion multitarea en navegador | CC BY-SA 4.0 | Hugging Face |

La comparacion con alternativas de la misma categoria (clasificadores especializados de contratos o intenciones) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento modesto en ContractNLI: 47,5 % de balanced accuracy frente a un azar del 33,3 %, lejos de un uso fiable sin supervision humana.
- Fidelidad baja frente al modelo PyTorch bf16: 77,0 % de acuerdo con lectura por cabeza y 62,0 % con lectura por logits; el autor desaconseja la cabeza de intencion a 4 bits.
- Las cabezas SIB-200 no tienen medicion de fidelidad por falta de salidas de referencia en desarrollo.
- Las etiquetas portuguesas de SIB-200 se proyectan desde el ingles, lo que puede introducir sesgos de traduccion.
- Las palabras de opcion estan fijadas por tarea; cualquier variacion en el prompt rompe la decision de la cabeza.
- ContractNLI limitado a NDAs de hasta 2.048 tokens.
- CLINC150 se plantea solo como clasificacion binaria dentro/fuera de alcance, no como clasificacion de intenciones completa.
- La cabeza de evidencia (`heads/evidence_cnli/`) se incluye pero s1s2 0.1 aun no la controla.
- Licencia CC BY-SA 4.0 con clausula ShareAlike por la inclusion de SIB-200: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial cerrado.
- No se han publicado pruebas en navegador sobre el split de test; las cifras de navegador corresponden al split de desarrollo.
- Riesgo de alucinacion en la fase de generacion ("System 2") no cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Adaptador PyTorch y cabezas: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA
- Variante Transformers.js: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Variante MLC q4f16_1: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2
- Variante LiteRT: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LiteRT-S1S2
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Dataset ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Paper referenciado en los tags (arXiv:2611.15302): https://arxiv.org/abs/2611.15302
