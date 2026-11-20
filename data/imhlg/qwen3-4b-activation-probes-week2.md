# imhlg/qwen3-4b-activation-probes-week2

## Resumen

`qwen3-4b-activation-probes-week2` es un artefacto de interpretabilidad mecánica publicado por el usuario `imhlg` en Hugging Face, construido sobre el modelo base `Qwen/Qwen3-4B`. No se trata de un modelo de lenguaje completo, sino de un conjunto de sondas lineales (linear probes) sobre el flujo residual y un vector de direccionamiento por adición de activaciones contrastivas (CAA, Contrastive Activation Addition) entrenados sobre la capa 18 del transformer. Su propósito es sustituir guardarraíles externos basados en un LLM juez por una comprobación interna durante el forward pass del propio modelo.

El problema que aborda es el coste en latencia y tokens de los guardarraíles externos: según la model card, un LLM juez añade aproximadamente 550 ms y duplica el coste en tokens, mientras que la sonda interna reporta un sobrecoste de 0,924 ms sobre un forward pass base de 49,32 ms en una NVIDIA L4. El artefacto se enmarca como prototipo 1 de la semana 2 del sprint Applied AI Foundry v4.0 del autor.

La relevancia es acotada: el repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, lo que sugiere que los pesos de la sonda (20,2 KB en safetensors según la model card) no están materializados o el repo no incluye los binarios. Además, los resultados reportados (F1 y ROC-AUC de 1,0000 en todas las capas evaluadas) deben interpretarse con cautela por posible fuga de datos o un dataset excesivamente separable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sondas lineales sobre el flujo residual y vector de steering CAA; modelo base Qwen3-4B (transformer) |
| Parametros totales | No disponible para el artefacto; el modelo base Qwen3-4B tiene 4 mil millones (no verificado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (sonda de 20,2 KB segun la model card) |

## Arquitectura y entrenamiento

El artefacto se compone de dos elementos sobre la capa 18 de Qwen3-4B: una sonda lineal que se engancha al flujo residual mediante un forward hook de PyTorch y clasifica las activaciones, y un vector de steering CAA que modula la dirección de las activaciones en tiempo de inferencia. La sonda se entrena con validación cruzada de 5 pliegues sobre 1.000 reclamaciones FinOps del dataset `imhlg/finops-residual-activations-1k`, con un conjunto de test reservado de 200 ejemplos.

La model card reporta un barrido de sondas por capas (6, 12, 18, 24, 30 y 35) con precisión, recall, F1 y ROC-AUC de 1,0000 en los 5 pliegues, y un test reservado en la capa 18 con las mismas métricas perfectas. No se especifica el número de tokens de entrenamiento, la composición del dataset más allá de su temática FinOps, ni si hubo ajuste fino del modelo base; el artefacto no modifica los pesos de Qwen3-4B, solo añade hooks en tiempo de ejecución.

## Capacidades

- Clasificación binaria (presumiblemente de reclamaciones FinOps válidas frente a inválidas) mediante sonda lineal sobre activaciones de la capa 18.
- Steering de activaciones en tiempo de inferencia mediante vector CAA para modular el comportamiento del modelo base.
- Integración con `outlines` para generación estructurada según los tags del repositorio.
- Guardarraíl de bajo coste: sobrecoste de 0,924 ms frente a los aproximadamente 550 ms de un LLM juez externo, según la model card.
- No es un modelo generativo autónomo: requiere Qwen3-4B como base y un entorno PyTorch con hooks.
- Capacidades multilingües, tool calling, agentes y visión: no disponibles en la información proporcionada.

## Casos de uso

- Moderación de contenido en producción: la sonda clasifica activaciones internas del modelo en lugar de invocar un LLM juez, reduciendo la latencia añadida de ~550 ms a ~1 ms según la model card, lo que la hace viable en rutas de inferencia síncronas.
- Validación de reclamaciones FinOps: el artefacto se entrenó específicamente sobre 1.000 reclamaciones de este dominio, por lo que puede usarse para filtrar entradas antes de procesarlas con el modelo principal.
- Control de costes en pipelines de agentes: al eliminar la segunda llamada a un LLM juez, se evita duplicar el coste en tokens en cada paso de un agente multi-paso.
- Investigación en interpretabilidad mecánica: las sondas por capas (6 a 35) permiten estudiar en qué profundidad del transformer se linealiza una determinada característica, como base para experimentos reproducibles.
- Steering conductual: el vector CAA permite empujar las activaciones hacia o lejos de un comportamiento objetivo sin reentrenar el modelo base, útil para prototipos de alineación.
- Generación estructurada con guardarraíl: combinado con `outlines`, puede validar la salida mientras se restringe el formato, en flujos donde no se puede permitir una segunda pasada de verificación.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el dataset `imhlg/finops-residual-activations-1k` (n=1.000, validación cruzada de 5 pliegues):

| Capa | Precisión | Recall | F1 | ROC-AUC |
|---|---|---|---|---|
| 6 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 12 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 18 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 24 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 30 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 35 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

Test reservado en capa 18 (n=200): precisión 1.0000, recall 1.0000, F1 1.0000, ROC-AUC 1.0000.

Benchmark de latencia en NVIDIA L4:

| Configuración | Latencia |
|---|---|
| Forward pass base | 49,32 ms |
| Hook de captura + sonda + hook de steering | 50,25 ms |
| Sobrecoste del guardarraíl | 0,924 ms |
| LLM juez externo (referencia) | ~550 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no disponible para el artefacto (la sonda ocupa 20,2 KB); el modelo base Qwen3-4B requiere memoria según su cuantización, no especificada en la información proporcionada.
- GPU: los benchmarks de latencia se ejecutaron en una NVIDIA L4; no se reportan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; depende del despliegue del modelo base Qwen3-4B, no del artefacto.
- Despliegue: requiere PyTorch con forward hooks; los tags mencionan `outlines`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 50,25 ms por forward pass con guardarraíl en L4, según la model card; throughput no disponible.

## Comparativa con modelos similares

| Artefacto | Base | Tipo | Licencia | Métrica reportada | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-activation-probes-week2 | Qwen3-4B | Sonda lineal + CAA | Apache 2.0 | F1 1.0000, sobrecoste 0,924 ms | Repo de 0,0 GB, 0 descargas |
| LLM juez externo (genérico) | Cualquiera | Segunda llamada al modelo | Variable | ~550 ms de latencia añadida | Amplia |
| Guardarraíles basados en clasificadores externos | No aplica | Clasificador separado | Variable | No disponible | Amplia |

No se dispone de información sobre otros artefactos de sondas lineales comparables en la información proporcionada.

## Limitaciones y advertencias

- Métricas perfectas (F1 y ROC-AUC de 1,0000 en todas las capas): pueden indicar un dataset trivialmente separable, fuga de información o sobreajuste; no se documenta validación en dominios distintos de FinOps.
- Dominio estrecho: el entrenamiento se limita a 1.000 reclamaciones FinOps; la generalización a otros dominios no está demostrada.
- Repositorio vacío: tamaño de 0,0 GB y 0 descargas sugieren que los pesos de la sonda podrían no estar publicados, lo que impediría su uso directo.
- Dependencia del modelo base: requiere Qwen3-4B y una versión concreta de PyTorch con hooks; cualquier cambio en el modelo base invalida la sonda.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre sesgos del clasificador.
- Riesgo de alucinación del guardarraíl: una sonda lineal puede fallar ante entradas adversariales no representadas en el dataset de entrenamiento.
- Idiomas soportados no documentados; el dataset FinOps podría estar sesgado hacia un idioma concreto.
- Sin datos de benchmarks estándar ni de robustez frente a distribución fuera de dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imhlg/qwen3-4b-activation-probes-week2
- Dataset: https://huggingface.co/datasets/imhlg/finops-residual-activations-1k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Perfil del autor: https://huggingface.co/imhlg
- Sitio del proyecto: https://curons.com
