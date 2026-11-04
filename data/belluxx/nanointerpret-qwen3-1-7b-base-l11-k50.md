# Belluxx/nanointerpret-qwen3-1.7b-base-l11-k50

## Resumen

`Belluxx/nanointerpret-qwen3-1.7b-base-l11-k50` no es un modelo generativo, sino un **autoencoder disperso (sparse autoencoder, SAE) top-k** entrenado sobre el flujo residual del modelo `Qwen/Qwen3-1.7B-Base`. Lo desarrolla Belluxx y forma parte del ecosistema de herramientas `nanointerpret`, orientado a interpretabilidad mecanística. Su función es descomponer las activaciones internas de la capa 11 del transformer base en 32.768 características (features) dispersas y, en principio, interpretables por humanos.

El artefacto resuelve un problema concreto: dado un modelo de lenguaje de 1.700 millones de parámetros, permite identificar qué direcciones del espacio de activaciones se activan ante conceptos, idiomas o patrones sintácticos específicos. El SAE usa una activación top-k con k = 50, lo que garantiza exactamente 50 features activas por token y evita el colapso de características típico de los SAE con regularización L1.

Es relevante ahora porque el autor publica una comparación directa con `Qwen-Scope` (el SAE oficial de Qwen para el mismo modelo y capa), reportando un rendimiento significativamente mejor en lenguas europeas (alemán, francés, español, italiano) y algo peor en chino. Además, incluye el análisis de 12.000 features realizado con Gemma 4 31B sobre una H100, lo que facilita la exploración sin necesidad de reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder top-k sobre el flujo residual de `model.layers[11]` de Qwen3-1.7B-Base |
| Parametros totales | no disponible (32.768 features, k = 50) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (el SAE opera token a token sobre activaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Entrenado con datos en ingles, chino, aleman, frances, espanol e italiano (proporciones en la seccion de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 1,0 GB con artefactos de `nanointerpret`, incluye `token_ids.npy` e `interpretations.jsonl`) |

## Arquitectura y entrenamiento

El SAE es de tipo **top-k**: en lugar de penalizar la magnitud de las activaciones con L1, retiene exactamente las k = 50 features con mayor activación por token. Esto produce una dispersión fija y controlada, con 32.768 features totales. Se entrena sobre el flujo residual a la entrada de `model.layers[11]` del Qwen3-1.7B-Base, es decir, sobre la representación intermedia tras 11 bloques del transformer.

El entrenamiento usa 1.000 millones de tokens con la siguiente composición: 47,5 % FineWeb, 15 % Stack v3 (código), 12,5 % OpenWebMath, 10 % FinePDFs, 5 % chino de FineWeb2-HQ y 2,5 % cada uno de alemán, francés, español e italiano de FineWeb-2. Las métricas finales reportadas son 0,198 de varianza no explicada, 0,1 % de features muertas y 0,099 nats de KL downstream. El histograma de densidad de activación sobre 9,96 millones de tokens de validación muestra que la mayoría de features se activan entre el 0,01 % y el 1 % de los tokens.

## Capacidades

- **Descomposicion de activaciones**: extrae 32.768 features interpretables del flujo residual de la capa 11 de Qwen3-1.7B-Base.
- **Analisis de features precomputado**: incluye la interpretación de 12.000 features generada con Gemma 4 31B mediante el pipeline de `nanointerpret`.
- **Exploracion interactiva**: se integra con `explore.py` de `nanointerpret` para navegar por las features y sus activaciones.
- **Re-grabacion de activaciones**: permite regenerar activaciones desde los `token_ids` incluidos (10 M tokens, ~5 GB; o los 100 M completos, ~51 GB).
- **Cobertura multilingue**: entrenado explícitamente con datos en inglés, chino, alemán, francés, español e italiano.
- **Evaluacion comparativa**: incluye métricas de validación y KL downstream frente a Qwen-Scope por conjunto de test y fuente.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- **Auditoria de sesgos linguisticos**: comparar la densidad y selectividad de features entre inglés, español, alemán, francés, italiano y chino para detectar si el modelo base representa de forma desigual ciertos idiomas. El SAE reporta mejor rendimiento en lenguas europeas que Qwen-Scope, lo que lo hace adecuado para este análisis.
- **Investigacion en interpretabilidad mecanistica**: identificar direcciones del espacio residual asociadas a conceptos concretos (sintaxis, entidades, temas) usando las 12.000 features ya interpretadas como punto de partida.
- **Analisis de codigo y matematicas**: dado que el 27,5 % de los tokens de entrenamiento son de Stack v3 y OpenWebMath, el SAE puede usarse para estudiar cómo el modelo base representa tokens de código y expresiones matemáticas en la capa 11.
- **Depuracion de comportamientos anomalos**: localizar features que se activan de forma desproporcionada ante entradas tóxicas o sesgadas y correlacionarlas con salidas del modelo base.
- **Comparacion de SAEs**: usar las métricas de KL downstream y varianza no explicada incluidas para evaluar nuevos SAEs frente a este y frente a Qwen-Scope en el mismo modelo y capa.
- **Docencia y prototipado**: el flujo de `nanointerpret` (clonar, descargar artefactos, regrabar activaciones y abrir el explorador) permite montar un taller práctico de interpretabilidad en una sola GPU consumer, dado el tamaño del modelo base (1,7 B).

## Benchmarks y rendimiento

La model card incluye una comparación con `Qwen/SAE-Res-Qwen3-1.7B-Base-W32K-L0_50` (Qwen-Scope) en la que se reportan métricas clave sobre el split de validación y KL downstream con intervalos de confianza del 95 %, desglosadas por conjunto de test y fuente. Los valores numéricos concretos de esa tabla no están disponibles en el texto proporcionado; solo se indica cualitativamente que este SAE es significativamente mejor en lenguas europeas y peor en chino.

Métricas de entrenamiento reportadas:

| Metrica | Valor final |
|---|---|
| Varianza no explicada | 0,198 |
| Features muertas | 0,1 % |
| KL downstream | 0,099 nats |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- **VRAM para el SAE**: el repo ocupa 1,0 GB; la inferencia del SAE sobre activaciones es ligera y cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- **VRAM para el modelo base**: Qwen3-1.7B-Base en FP16 requiere aproximadamente 3,4 GB de pesos; en BF16 similar. Con cuantización de 8 bits baja a ~1,7 GB y en 4 bits a ~0,9 GB.
- **GPU recomendadas**: cualquier RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superior sirve para el flujo completo. El autor realizó el análisis de features con Gemma 4 31B en una H100, lo que sugiere que esa fase concreta requiere bastante más VRAM (estimación no disponible).
- **Regrabacion de activaciones**: 10 M tokens generan ~5 GB de activaciones; los 100 M completos, ~51 GB. Conviene disponer de ese espacio en disco.
- **Despliegue**: el flujo documentado usa `nanointerpret` (scripts `record_activations.py` y `explore.py`) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Features | k / L0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Belluxx/nanointerpret-qwen3-1.7b-base-l11-k50` | Qwen3-1.7B-Base | 11 | 32.768 | k = 50 | MIT | HuggingFace |
| `Qwen/SAE-Res-Qwen3-1.7B-Base-W32K-L0_50` (Qwen-Scope) | Qwen3-1.7B-Base | no disponible | 32.768 | L0 = 50 | no disponible en la informacion | HuggingFace |
| SAEs de `nanointerpret` para otras capas o k | Qwen3-1.7B-Base | variable | variable | variable | MIT (presumible) | GitHub / HuggingFace |

La comparación directa disponible es con Qwen-Scope: mismo modelo base, mismo tamaño de diccionario y mismo objetivo de dispersión (50 activas por token). La diferencia reportada es de cobertura lingüística: mejor en lenguas europeas para este SAE, mejor en chino para Qwen-Scope. No se dispone de otros SAEs comparables en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto ni responde a prompts; es un artefacto de análisis que requiere el modelo base y el pipeline de `nanointerpret` para usarse.
- **Cobertura lingüística limitada**: aunque incluye seis idiomas, las proporciones son muy desiguales (47,5 % inglés frente a 2,5 % por lengua europea). Las features para idiomas poco representados pueden ser menos fiables.
- **Sesgos heredados del corpus**: FineWeb, FinePDFs y Stack v3 arrastran sesgos de género, raza, ideología y calidad de código que pueden reflejarse en las features aprendidas.
- **Features muertas**: se reporta un 0,1 % de features muertas; el resto puede incluir features polisémicas o de interpretación ambigua pese al análisis con Gemma 4 31B.
- **Varianza no explicada del 0,198**: casi el 20 % de la varianza de las activaciones no queda capturada por el SAE, por lo que el análisis no es exhaustivo.
- **Dependencia de la capa 11**: las conclusiones solo aplican a esa capa del modelo base; no se extrapolan a otras capas ni a otros modelos.
- **Licencia MIT**: permite uso comercial, pero el modelo base Qwen3-1.7B-Base tiene su propia licencia que debe verificarse por separado.
- **Fecha de creación futura**: la model card indica creación el 2026-11-04, lo que puede indicar un error de metadatos; conviene verificar la integridad del repo antes de usarlo en producción.
- **Sin benchmarks estándar**: no hay métricas de calidad tipo MMLU o HumanEval porque el artefacto no las admite; la evaluación debe hacerse mediante KL downstream y análisis cualitativo de features.

## Enlaces

- HuggingFace: https://huggingface.co/Belluxx/nanointerpret-qwen3-1.7b-base-l11-k50
- Repositorio `nanointerpret`: https://github.com/Belluxx/nanointerpret
- Documentación del pipeline de interpretación: https://github.com/Belluxx/nanointerpret/blob/main/docs/interpretation.md
- Qwen-Scope (SAE comparable): https://huggingface.co/Qwen/SAE-Res-Qwen3-1.7B-Base-W32K-L0_50
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FinePDFs: https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Stack v3: https://huggingface.co/datasets/HuggingFaceCode/stack-v3-train
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
