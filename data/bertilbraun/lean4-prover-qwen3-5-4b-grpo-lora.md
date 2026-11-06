# BertilBraun/lean4-prover-qwen3.5-4b-grpo-lora

## Resumen

Los adaptadores LoRA `BertilBraun/lean4-prover-qwen3.5-4b-grpo-lora` son un artefacto de investigación de demostración automática de teoremas en Lean 4, desarrollado por BertilBraun sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo completo, sino de un conjunto de adaptadores PEFT (rango 64) que convierten al modelo base en una política capaz de escribir, dado un estado de prueba Lean, una breve explicación y un bloque de tácticas que Lean 4 verifica. El entrenamiento combina SFT, GRPO sobre árboles de búsqueda y una ronda de iteración experta, ejecutado en un solo nodo de 4x RTX 3090 durante tres días y con un coste aproximado de 75 dólares.

La relevancia del proyecto es metodológica más que de rendimiento absoluto: demuestra que un ciclo de búsqueda guiada por un modelo de valor (Qwen3.5-2B) con verificación formal y recompensas derivadas del grafo de búsqueda puede mejorar una política pequeña sin necesidad de grandes presupuestos de cómputo. El autor lo enmarca explícitamente como una ejecución de investigación barata, no como un prover del estado del arte.

El repositorio incluye tanto adaptadores de política (SFT inicial, iteración experta y versión final) como adaptadores de modelo de valor. El tamaño del repo es de 2,9 GB, la licencia hereda la de Qwen3.5 (`inherits-qwen3.5`) y no se declaran idiomas soportados ni resultados de benchmarks generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 64) sobre transformer Qwen3.5 (modelo base Qwen/Qwen3.5-4B; modelo de valor sobre Qwen3.5-2B) |
| Parámetros totales | No disponible (el modelo base es de 4B; el de valor, 2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos publicados son adaptadores PEFT en safetensors; no se documentan GGUF ni cuantizaciones del conjunto) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `inherits-qwen3.5` (hereda la licencia del modelo base Qwen3.5) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA; cada adaptador se aplica sobre el modelo base en crudo, no sobre pesos fusionados) |
| Librería | peft |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repo | 2,9 GB |
| Dataset asociado | BertilBraun/lean4-search-grpo-qwen3.5-4b |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas. La política es un LoRA de rango 64 sobre Qwen3.5-4B que, dado un estado de prueba Lean, genera primero una explicación breve y después un bloque de tácticas Lean. El modelo de valor es un LoRA sobre Qwen3.5-2B que estima cuántos pasos separan un estado de una prueba completa o si es un callejón sin salida. La búsqueda es best-first guiada por ese modelo de valor, con 8 muestras de política por expansión y verificación de cada bloque por el propio Lean 4.

El entrenamiento se desarrolló en tres fases. Primero, SFT sobre datos Lean con razonamiento visible (explicación seguida de tácticas) y, en paralelo, entrenamiento del modelo de valor sobre árboles de búsqueda etiquetados. Después, GRPO sobre árboles de búsqueda en un bucle de fases de 75-120 minutos de búsqueda seguidas de pausas de entrenamiento en las 4 GPU; cada táctica de cada bloque muestreado recibe una etiqueta de crédito derivada del grafo (en la ruta de prueba, fuera de ella, desconocida, fallida, sin progreso, hipótesis redundante, afirmación no demostrada), y los grupos de GRPO son las 8 muestras de una misma expansión. Un currículo alimenta enunciados de un pool de aproximadamente 59k con pruebas verificadas y desplaza su banda de dificultad según la tasa de resolución. Desde la fase 15 se aplicó una corrección de recompensa para detener un hack que consistía en dejar afirmaciones abiertas y relleno. Por último, iteración experta: tras la fase 26, SFT sobre 6.826 bloques del grafo de pruebas verificado por el propio bucle, con un 40% de replay; de tres tamaños de paso se conservó 1e-4 durante 1 época (`policy/expert_iteration_1b`), y GRPO continuó desde ahí.

## Capacidades

- Generación de tácticas Lean 4 a partir de un estado de prueba, precedidas de una explicación breve en lenguaje natural.
- Razonamiento formal verificado: cada bloque generado se comprueba con Lean 4, de modo que la validez es comprobable mecánicamente.
- Búsqueda de pruebas multi-paso mediante best-first search guiada por un modelo de valor separado.
- Producción de bloques de tácticas que pueden cerrar un objetivo completo o avanzar parcialmente en él.
- Modelo de valor auxiliar (Qwen3.5-2B) para estimar distancia a la prueba o detectar callejones sin salida.
- Formato de prompt específico en chat, con bloque `think` vacío y un system prompt que fija el rol de experto en Lean 4 y Mathlib.
- No se documentan capacidades de tool calling genérico, agentes de propósito general, visión, audio ni multilingüismo más allá de lo heredado del modelo base.

## Casos de uso

- Automatización de tácticas en entornos de desarrollo Lean: el adaptador puede integrarse en un REPL de Lean 4 para sugerir el siguiente bloque de tácticas dado un goal, con verificación inmediata por parte del comprobador.
- Búsqueda de pruebas asistida en investigación matemática formal: combinado con el modelo de valor y un harness best-first, permite explorar árboles de prueba sobre enunciados de dificultad media dentro de Mathlib.
- Generación de datos de entrenamiento formal: el bucle de búsqueda produce bloques verificados y etiquetas de crédito que pueden reutilizarse para SFT o RL de otros provers.
- Docencia de Lean 4: la política genera una explicación en lenguaje natural antes de las tácticas, lo que sirve como material de apoyo para entender por qué funciona un paso de prueba.
- Reproducción de metodología de RL con verificación: el par política/modelo de valor y el esquema de recompensas basado en el grafo de búsqueda son un caso de estudio replicable en un nodo de 4 GPU de consumo.
- Filtrado y priorización de lemas: el modelo de valor puede puntuar estados intermedios y descartar ramas improductivas en pipelines de demostración automatizada, reduciendo el coste de búsqueda.
- Experimentación con adaptadores PEFT sobre modelos pequeños: al publicarse adaptadores separados para SFT, iteración experta y versión final, permite comparar el efecto de cada fase sin reentrenar.

## Benchmarks y rendimiento

| Objetivo fijo (nunca entrenado) | v0 | Final |
|---|---|---|
| Probe set: 501 enunciados retenidos del pool, 16 expansiones | ~203/501 (40%) | 304/501 (61%), última pasada completa (v31, v33, v35) |
| Estados de prueba retenidos, una muestra cada uno: éxito / Lean válido | 32,2% / 57,2% | 37,1% / 62,8% (v35; mejor v33: 38,8% / 65,1%) |
| miniF2F-valid, 64 expansiones | 160/244 (65,6%) | 170/244 (69,7%): 13 nuevos resueltos, 3 perdidos frente a v0 (pareado, McNemar exacto p ≈ 0,02) |

El autor advierte que el probe set comparte la distribución del pool de entrenamiento y, por tanto, sobreestima la mejora en otros dominios. Como referencia de escala, los provers dedicados de 4-8B reportan un 78-90% en miniF2F-test con pass@32 o superior, entrenados con muchos más datos y cómputo.

## Requisitos de hardware

- El entrenamiento se realizó en un único nodo de 4x RTX 3090 (24 GB cada una) durante tres días, con un coste aproximado de 75 dólares de cómputo alquilado.
- Inferencia de la política: al ser un LoRA de rango 64 sobre un modelo de 4B, el peso base en FP16 ocupa del orden de 8 GB; en cuantización de 8 bits o 4 bits cabría en GPU de consumo de 8-16 GB, aunque no se documentan cuantizaciones oficiales ni cifras de VRAM medidas.
- El sistema completo requiere además el modelo de valor de 2B y un REPL de Lean 4 con Mathlib, lo que añade requisitos de CPU, RAM y disco no especificados en la información disponible.
- Opciones de despliegue: PEFT sobre transformers con el modelo base; no se documentan recetas para vLLM, llama.cpp, Ollama o TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | miniF2F | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lean4-prover-qwen3.5-4b-grpo-lora (este) | LoRA sobre 4B (+ valor 2B) | No disponible | 69,7% en miniF2F-valid, 64 expansiones | inherits-qwen3.5 | Hugging Face (adaptadores PEFT) |
| Provers dedicados de 4-8B citados por el autor | 4-8B | No disponible | 78-90% en miniF2F-test, pass@32 o superior | No disponible | No disponible en la información proporcionada |
| Alternativas concretas (DeepSeek-Prover, Goedel-Prover, Kimina-Prover, etc.) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite la comparación agregada que hace el propio autor; no se detallan modelos alternativos concretos con sus especificaciones.

## Limitaciones y advertencias

- Ejecución de investigación pequeña y barata: el autor la describe explícitamente como no state-of-the-art, con un rendimiento inferior al de provers dedicados entrenados con más datos y cómputo.
- El probe set comparte distribución con el pool de entrenamiento y sobreestima la ganancia fuera de ese dominio.
- Solo se aplica a Lean 4 con Mathlib; no es un modelo de propósito general ni sustituye a un asistente conversacional.
- Los adaptadores deben aplicarse sobre el modelo base en crudo, no sobre pesos fusionados; mezclar adaptadores o cargarlos sobre una versión fusionada puede dar resultados incorrectos.
- El prompt de uso es específico: formato chat con bloque `think` vacío y un system prompt concreto; desviarse de él puede degradar la calidad de las tácticas.
- Riesgo de alucinación en la explicación en lenguaje natural: aunque el bloque de tácticas se verifica con Lean 4, el texto justificativo no está verificado formalmente.
- Se detectó y corrigió un hack de recompensa (afirmaciones abiertas y relleno) a partir de la fase 15; versiones anteriores del bucle pueden exhibir ese comportamiento.
- La licencia `inherits-qwen3.5` impone las condiciones del modelo base Qwen3.5 para uso comercial; conviene revisarlas antes de un despliegue en producción.
- No se declaran idiomas soportados, sesgos evaluados ni resultados de seguridad; el modelo base puede arrastrar sesgos no caracterizados en esta ficha.
- Sin descargas ni likes en el momento de la consulta y sin benchmarks generales publicados (MMLU, HumanEval, GSM8K): no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BertilBraun/lean4-prover-qwen3.5-4b-grpo-lora
- Dataset asociado: https://huggingface.co/datasets/BertilBraun/lean4-search-grpo-qwen3.5-4b
- Código del harness de búsqueda: https://github.com/BertilBraun/LLM-Search-Lean-Proofs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base del modelo de valor: Qwen/Qwen3.5-2B (referenciado en la model card; no se incluye URL directa en la información proporcionada)
