# North-ML1/VEG-Experiment

## Resumen

VEG-Experiment es un checkpoint experimental de investigacion publicado por North-ML1 dentro de la familia Veyrian Execution Generator (VEG). No es un transformer: se trata de un modelo de lenguaje a nivel de byte que implementa la pila de resonancia VEG-3, compuesta por embeddings de byte aprendidos, enrutamiento fase/contenido, lecturas asociativas, campos selectivos recurrentes y bloques feed-forward con compuertas. El modelo tiene 81.676.032 parametros en FP32, un vocabulario de 256 bytes crudos y una longitud de contexto de 512 bytes.

El modelo se distribuye como artefacto de investigacion, no como producto. Su implementacion esta escrita en NumPy/CuPy y no depende de PyTorch ni de `transformers`, lo que lo convierte en una pieza interesante para quienes quieran inspeccionar o reproducir arquitecturas alternativas al transformer clasico. El propio autor advierte que el checkpoint no es fiable para QA factual, aritmetica, razonamiento, codigo ni seguimiento de instrucciones.

La relevancia actual es acotada y muy especifica: sirve como material reproducible para estudiar modelos byte-level y pilas recurrentes con enrutamiento, no como base para aplicaciones en produccion. El autor anuncia una version mejor evaluada en el futuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VEG-resonance-stack/3 (no transformer; byte-level con enrutamiento fase/contenido, lecturas asociativas, campos selectivos recurrentes y bloques feed-forward con compuertas) |
| Parametros totales | 81.676.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 bytes |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | no disponible (vocabulario de 256 bytes crudos, sin lista de idiomas declarada) |
| Licencia | other |
| Formato de pesos | `model.safeveyra` (checkpoint nativo VEG) y `model.safetensors` (export FP32) |

Datos adicionales de configuracion: `D=832, L=10, NH=13, PP=32, RK=32, FF=2240, UR=64`; modo de memoria "resonance"; ejecucion repetida y enrutamiento de workspace desactivados en este checkpoint.

## Arquitectura y entrenamiento

La arquitectura VEG-3 sustituye el bloque transformer por una pila de resonancia con cinco componentes declarados: embeddings de byte aprendidos (vocabulario de 256 simbolos), enrutamiento fase/contenido, lecturas asociativas, campos selectivos recurrentes y bloques feed-forward con compuertas. La configuracion publicada indica dimension `D=832`, 10 capas (`L=10`), 13 cabezas (`NH=13`), dimension de feed-forward `FF=2240` y parametros `PP=32`, `RK=32`, `UR=64`. El modelo opera sobre bytes crudos, sin tokenizador subword, y la implementacion es NumPy/CuPy, sin dependencia de PyTorch.

El entrenamiento se realizo en dos fases segun la model card: primero un calentamiento por expansion desde un modelo VEG-3 de resonancia mas pequeno, entrenado sobre un corpus UTF-8 amplio derivado de Nitron; despues un ajuste continuado sobre una mezcla centrada en capacidades de QA, codigo, matematicas y ciencia, con replay de corpus amplio. El objetivo de entrenamiento es prediccion del siguiente byte. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto a nivel de byte: produce secuencias de bytes que pueden parecer fluidas, segun la propia model card.
- Prediccion del siguiente byte como unica tarea entrenada de forma explicita.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues garantizadas; el vocabulario es de 256 bytes y no se declara lista de idiomas.
- No hay modo thinking, vision ni audio.
- No se declara soporte de instrucciones; el autor indica explicitamente que el modelo no es fiable para seguimiento de instrucciones.

## Casos de uso

- Investigacion de arquitecturas no transformer: el checkpoint permite inspeccionar una pila de resonancia con enrutamiento fase/contenido y lecturas asociativas, comparandola con bloques transformer equivalentes en numero de parametros.
- Reproduccion de experimentos byte-level: al incluir el codigo minimo de inferencia y entrenamiento en `veg/`, sirve para replicar el pipeline de prediccion del siguiente byte sin PyTorch.
- Estudio de modelos con vocabulario de bytes crudos: util para analizar como se comporta un modelo sin tokenizador subword en tareas de continuacion de texto.
- Pruebas de infraestructura NumPy/CuPy: el modelo permite validar despliegues en CPU y GPU con CuPy (por ejemplo `cupy-cuda12x`) en entornos sin PyTorch.
- Analisis de perdida bits-per-byte (bpb): los valores publicados permiten comparar la curva de perdida entre splits y estudiar la retencion de capacidades tras el ajuste.
- Docencia y divulgacion: como ejemplo concreto de arquitectura alternativa al transformer para explicar enrutamiento, recurrencia selectiva y modelos byte-level.
- No se recomienda para atencion al cliente, generacion de codigo en produccion, QA factual ni ninguna tarea que exija respuestas correctas.

## Benchmarks y rendimiento

La model card solo publica perdida bits-per-byte (bpb, menor es mejor), que no es un benchmark de razonamiento, codigo ni seguimiento de instrucciones.

| Split retenido | bpb |
|---|---:|
| Capability retention validation | 1,2068 |
| Capability validation | 1,2336 |
| Capability test | 1,2382 |
| Nitron validation | 1,2464 |
| Nitron test | 1,2460 |
| Original validation | 1,2838 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 81,7 M de parametros en FP32, los pesos ocupan aproximadamente 0,33 GB; el repo completo ocupa 0,7 GB. El consumo real depende de la implementacion NumPy/CuPy y del estado recurrente.
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica que la inferencia en GPU requiere una build de CuPy compatible con CUDA (por ejemplo `cupy-cuda12x` en CUDA 12).
- Cabe en GPU de consumo: por tamano de pesos, si; no hay requisitos minimos publicados.
- Opciones de despliegue: inferencia nativa con `python -m veg.infer` sobre CPU o GPU (`VEG_GPU=1`, `CUPY_TF32=1`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (arquitecturas byte-level no transformer con pila de resonancia) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es fiable para QA factual, aritmetica, razonamiento, codigo ni seguimiento de instrucciones; en las comprobaciones de release genero respuestas incorrectas a preguntas simples.
- Riesgo alto de alucinacion: puede producir texto fluido sin base factual.
- Contexto muy limitado: 512 bytes, insuficiente para conversaciones multi-turno o documentos largos.
- Sin lista de idiomas declarada; el comportamiento multilingue no esta garantizado.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial requiere revision legal previa.
- Checkpoint experimental: el autor anuncia una version mejor evaluada, por lo que este artefacto no debe usarse como base de produccion.
- Dependencia de CuPy para GPU, lo que anade complejidad de despliegue frente a stacks basados en PyTorch.
- Ejecucion repetida y enrutamiento de workspace desactivados en este checkpoint, lo que limita reproducir la configuracion completa de la arquitectura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/North-ML1/VEG-Experiment
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
