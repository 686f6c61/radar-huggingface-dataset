# dawidkielbasa/qielbas-tiny-9m-m1

## Resumen

Qielbas Tiny 9M M1 es un modelo de lenguaje causal en ingles de 9.557.716 parametros, desarrollado por el usuario dawidkielbasa y publicado en HuggingFace. Se trata de un modelo de investigacion de escala minima, disenado para explorar el entrenamiento eficiente de arquitecturas hibridas en el rango de los millones de parametros, no para uso en produccion.

Su principal singularidad tecnica es la arquitectura: combina cuatro capas GatedDeltaNet2 (una familia de atencion lineal/recurrente con compuertas) con una unica capa de atencion causal clasica con RoPE, todo ello en solo cinco bloques. El modelo se preentreno sobre 6.7B tokens de un corpus en ingles orientado a contenido educativo y de alta calidad, y se entreno con el optimizador Muon para las matrices de pesos ocultas, reservando AdamW para embeddings y el resto de parametros.

Es relevante ahora como ejemplo de receta reproducible a muy baja escala: pesos pequenos, vocabulario BPE de 4096 tokens, contexto de 256 tokens y un ajuste posterior sobre ARC para tareas de razonamiento con preguntas de opcion multiple. El modelo no tiene licencia declarada en el repositorio y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida causal: 4 capas GatedDeltaNet2 + 1 capa de atencion causal (RoPE) |
| Parametros totales | 9.557.716 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No se publican variantes cuantizadas (pesos en FP32/BF16; cuantizacion manual viable) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch nativo (cargado mediante `load_model.py`); safetensors no disponible |

## Arquitectura y entrenamiento

El modelo tiene cinco bloques: cuatro capas GatedDeltaNet2 y una capa de atencion causal. Cada bloque usa anchura de 320, cinco cabezas de dimension 64, SwiGLU con tamano oculto 1048, RMSNorm y embeddings de entrada/salida atados (tied). La capa de atencion emplea RoPE. El vocabulario es un BPE de 4096 tokens. Los Gated DeltaNet son una variante de atencion lineal con mecanismo de compuerta, lo que permite un coste de secuencia mas barato que la atencion cuadratica estandar; la mezcla con una capa de atencion completa busca recuperar capacidad de modelado local que los recurrentes lineales pueden perder.

El preentrenamiento cubre 6.7B tokens repartidos entre FineWeb-Edu (2.7B), DCLM-Edu (1.0B), FinePDFs-Edu en ingles (1.2B), FineWiki en ingles (0.5B), FinePhrase Tutorial (0.5B), FinePhrase FAQ (0.5B) y Cosmopedia v2 (0.3B). Se uso el optimizador Muon para las matrices de pesos ocultas elegibles y AdamW para embeddings y el resto de parametros, con learning rate pico de 0.001 y semilla 7. Siete checkpoints tardios se promediaron en FP32, seleccionados mediante perdida de lenguaje en un conjunto reservado. Posteriormente se realizo una adaptacion sobre ARC con 3345 preguntas de entrenamiento Easy y Challenge durante cinco epochs, usando AdamW, learning rate pico de 0.00005 y replay de texto general; la seleccion de epoch uso 867 preguntas de validacion de ARC con una salvaguarda de perdida de lenguaje general, excluyendo las preguntas de test de ARC.

## Capacidades

- Generacion de texto causal en ingles a nivel de siguiente token, con contexto maximo de 256 tokens.
- Razonamiento basico en preguntas de opcion multiple (adaptado especificamente sobre ARC-Easy y ARC-Challenge).
- Modelado de lenguaje general y puntuacion de verosimilitud de secuencias, util para evaluacion y experimentacion.
- Capacidad multilingue: no disponible (solo ingles).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Investigacion en arquitecturas hibridas: sirve como banco de pruebas barato para medir el comportamiento de Gated DeltaNet frente a atencion clasica en regimenes de bajo presupuesto de computo.
- Experimentos de destilacion o inicializacion: usar los 9.5M parametros como punto de partida para estudiar tecnicas de escalado o transferencia sin grandes costes de GPU.
- Evaluacion de pipelines de entrenamiento: validar recetas con el optimizador Muon, promediado de checkpoints en FP32 y seleccion por perdida de validacion antes de escalar a modelos mayores.
- Puntuacion de verosimilitud y filtrado de corpus: al ser un modelo causal pequeno, puede emplearse para anotar textos en ingles (perplejidad, ranking) en pipelines de curacion de datos.
- Pruebas de inferencia en hardware minimo: al ocupar decenas de MB, permite validar despliegues en CPU, GPUs integradas o entornos de edge con restricciones severas.
- Demostraciones docentes: ejemplo reproducible y de codigo abierto para explicar preentrenamiento, arquitecturas hibridas y evaluacion sobre ARC y BLiMP.
- Generacion de texto muy corta en ingles (menos de 256 tokens) en prototipos y tests automatizados, sin expectativas de calidad de produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (protocolo Glint-1.3, likelihood sin normalizar, contexto de 256 tokens). Medidos sobre 2376 preguntas de ARC-Easy y 67000 pares de BLiMP. El autor indica que son resultados reproducidos, no una evaluacion oficial de leaderboard.

| Metrica | Resultado |
|---|---:|
| Tiny-ML Efficiency | 80,1426 |
| Raw Overall | 71,8696 |
| ARC-Easy test accuracy | 48,2744 % |
| BLiMP accuracy | 75,3224 % |
| WikiText-2 byte perplexity | 2,90791 |
| WikiText-2 token perplexity | 25,87719 |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 MB en FP32, 19 MB en BF16 e 9,5 MB en INT8 (solo pesos). La memoria de activaciones es minima dado el contexto de 256 tokens.
- GPU recomendadas: cualquier GPU CUDA con soporte BF16 (por ejemplo RTX 20xx en adelante, A100, H100, L4, T4). El modelo es demasiado pequeno para requerir GPU profesional.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en CPU en inferencia.
- Requisito declarado por el autor: el cargador nativo requiere una GPU CUDA compatible con BF16 y las dependencias fijadas del repositorio (`pip install -r requirements.txt`).
- Opciones de despliegue: el repositorio proporciona un cargador nativo PyTorch (`load_model.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; no disponible como GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa orientativa con modelos de escala equivalente o cercana, segun informacion publica ampliamente conocida. Los campos no confirmados se marcan como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| Qielbas Tiny 9M M1 | 9,5M | 256 | No disponible | HuggingFace (PyTorch) |
| Pythia-14M | 14M | 2048 | Apache 2.0 | HuggingFace |
| GPT-2 small | 124M | 1024 | MIT | HuggingFace |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | HuggingFace |

Comparacion de rendimiento entre estos modelos con el protocolo del autor: no disponible.

## Limitaciones y advertencias

- Contexto muy corto (256 tokens): inviable para conversacion multi-turno, documentos largos o resumen extenso.
- Solo ingles: no soporta castellano ni otros idiomas; su vocabulario BPE de 4096 tokens agrava esta limitacion.
- Escala minima: con 9,5M de parametros y 6.7B tokens de entrenamiento, la calidad esta muy por debajo de cualquier modelo util en produccion.
- Riesgo elevado de alucinacion y de incoherencia mas alla de unas pocas decenas de tokens.
- Licencia no declarada: el repositorio no especifica terminos, por lo que el uso comercial queda en situacion legal incierta y no se debe asumir permiso.
- Especializacion sobre ARC: la adaptacion posterior sobre preguntas tipo ARC puede introducir sesgo hacia formatos de opcion multiple y degradar ligeramente la generacion libre.
- Requisitos de entorno: el cargador es codigo propio del autor y depende de dependencias fijadas; no hay integracion estandar con runtimes de inferencia habituales.
- Metricas reproducidas, no oficiales: los numeros de benchmark son del propio autor y no provienen de una evaluacion independiente de leaderboard.
- Sesgos: no disponible (no se ha publicado analisis de sesgos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dawidkielbasa/qielbas-tiny-9m-m1
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Perfil del autor en HuggingFace: https://huggingface.co/dawidkielbasa
