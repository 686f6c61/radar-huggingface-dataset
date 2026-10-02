# glossAPI/greek-apertus-8b-instruct

## Resumen

Greek Apertus 8B Instruct es un modelo de lenguaje de tipo instruct especializado en griego moderno, desarrollado por glossAPI a partir de la familia Apertus. Se trata de un ajuste fino (SFT) del checkpoint `glossAPI/apertus-8b-greek-cpt`, que a su vez deriva del modelo fundacional Apertus 8B creado por la Swiss AI Initiative (colaboración entre EPFL, ETH Zurich y CSCS). El objetivo es cubrir la escasez de modelos abiertos con competencia real en griego, un idioma con representación limitada en los corpus de entrenamiento de la mayoría de LLM.

El modelo tiene aproximadamente 8.000 millones de parámetros, soporta griego (el) e inglés (en), y se distribuye bajo licencia Apache 2.0. Está publicado como versión de vista previa (v0.1-preview) y el acceso está restringido: requiere aceptar las condiciones en HuggingFace antes de poder descargarlo.

Su relevancia actual radica en que combina la filosofía de ciencia abierta de Apertus (pesos, datos y metodología abiertos) con un proceso de post-entrenamiento específico para griego, apoyado por datasets propios de glossAPI (corpus de preentrenamiento continuado, datos de post-entrenamiento y datos de SFT). Los resultados declarados por el autor en GreekMMLU (70,52 %), IFEval-el (65,8 %) y GSM8K-el (59,67 %) sitúan al modelo como una opción a considerar para tareas en griego, aunque dichos valores no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Apertus 8B, transformer decoder-only) |
| Parametros totales | ~8.000 millones (segun denominacion del modelo) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | griego (el), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; no se confirman otros formatos) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna concreta ni los hiperparametros del modelo. Se sabe que es un modelo de 8B de la familia Apertus, cuyo modelo fundacional fue desarrollado por la Swiss AI Initiative (EPFL, ETH Zurich y CSCS) bajo el principio de "open weights, open data, open science" para IA soberana. El pipeline declarado es text-generation y la libreria de referencia es transformers.

El proceso de construccion documentado en las etiquetas del repositorio es una cadena de ajuste: primero un preentrenamiento continuado en griego moderno sobre el modelo base (`glossAPI/apertus-8b-greek-cpt`, con el dataset `glossAPI/apertus-8b-greek-cpt-modern-greek-train`), seguido de una fase de post-entrenamiento (`glossAPI/greek-apertus-post-training-data`) y finalmente un ajuste supervisado de instrucciones (SFT) con `glossAPI/greek-apertus-sft-data`. No se especifica en la informacion disponible si se emplearon tecnicas adicionales como RLHF, DPO u otras variantes de alineacion, ni el numero total de tokens usados en cada etapa.

## Capacidades

- Generacion de texto en griego moderno e ingles.
- Seguimiento de instrucciones conversacionales (etiqueta `instruct`, `chat`), orientado a formato de dialogo.
- Razonamiento aritmetico basico en griego, evidenciado por su evaluacion en GSM8K-el.
- Cumplimiento de restricciones de formato en griego, medido con IFEval-el en modo prompt-strict.
- Conocimiento enciclopedico y de cultura general evaluado con GreekMMLU (oficial, sin plantilla de chat).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego gracias a su ajuste de instrucciones, adecuado para empresas que operan en el mercado griego y necesitan respuestas en idioma local.
- Traduccion y localizacion griego-ingles: util para traducir documentacion, marketing o soporte tecnico, aprovechando que el modelo domina ambos idiomas declarados.
- Procesamiento de documentacion publica griega: la vinculacion del proyecto con GlossAPI y el ambito de administracion publica sugiere su uso para resumir, clasificar o extraer informacion de textos oficiales griegos.
- Asistencia educativa y academica en griego: explicacion de conceptos, generacion de ejercicios o apoyo al estudio en griego moderno, apoyandose en su rendimiento en GreekMMLU.
- Analisis de sentimiento y clasificacion de texto en griego: para monitorizacion de redes sociales, encuestas o resenas de producto en lengua griega.
- Generacion asistida de contenido editorial en griego: redaccion de borradores, resumenes y adaptaciones de tono para medios o blogs griegos.
- Evaluacion comparativa de modelos para griego: como referencia open source Apache 2.0 para medir el rendimiento de otros sistemas en GreekMMLU, IFEval-el o GSM8K-el.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado | Verificado |
|---|---|---|---|
| GreekMMLU (official, no chat template) | accuracy (%) | 70,52 | No |
| IFEval-el (prompt-strict) | accuracy (%) | 65,8 | No |
| GSM8K-el | accuracy (%) | 59,67 | No |

No se han publicado en la informacion disponible resultados de otros benchmarks (por ejemplo MMLU en ingles, HumanEval u otros) ni comparaciones directas con modelos similares bajo las mismas condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia general para un modelo de ~8B en transformers, la carga en precision completa requiere varios GB de VRAM y las versiones cuantizadas reducen el requisito, pero no se confirman cuantizaciones soportadas para este modelo concreto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de ~8B suele ser desplegable en GPU de gama alta de consumo en cuantizacion, pero no hay datos oficiales para este checkpoint.
- Opciones de despliegue: la libreria declarada es transformers. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.
- Acceso: el repositorio esta restringido (gated) y requiere aceptar condiciones en HuggingFace antes de la descarga, lo que afecta a la automatizacion del despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| glossAPI/greek-apertus-8b-instruct | ~8B | el, en | Apache 2.0 | Gated | Ajuste SFT de Apertus 8B especializado en griego |
| glossAPI/apertus-8b-greek-cpt | ~8B | el, en | no disponible | no disponible | Checkpoint base tras preentrenamiento continuado en griego |
| swiss-ai/Apertus-8B-Instruct-2509 | ~8B | no disponible en la informacion | no disponible | no disponible | Modelo fundacional instruct de la Swiss AI Initiative |

No se dispone de datos comparativos de rendimiento entre estos modelos ni con otras alternativas especializadas en griego en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados; no deben tratarse como cifras definitivas.
- El modelo esta en fase de vista previa (v0.1-preview), por lo que su comportamiento puede cambiar en versiones posteriores.
- Solo se declaran dos idiomas (griego e ingles); el rendimiento fuera de ellos no esta documentado.
- La longitud de contexto no esta especificada, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones de fidelidad publicadas en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo ni de toxicidad para este modelo.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un repositorio restringido (gated) hay que aceptar las condiciones de acceso en HuggingFace antes de usarlo.
- No se confirma soporte de tool calling, agentes ni cuantizaciones, lo que limita su integracion directa en pipelines de produccion sin validacion previa.
- El modelo hereda las caracteristicas y posibles limitaciones del Apertus 8B subyacente, cuyo detalle arquitectonico no se incluye en la informacion proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/glossAPI/greek-apertus-8b-instruct
- Modelo base (preentrenamiento continuado en griego): https://huggingface.co/glossAPI/apertus-8b-greek-cpt
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/glossAPI/apertus-8b-greek-cpt-modern-greek-train
- Dataset de post-entrenamiento: https://huggingface.co/datasets/glossAPI/greek-apertus-post-training-data
- Dataset de SFT: https://huggingface.co/datasets/glossAPI/greek-apertus-sft-data
- Repositorio GitHub del proyecto: https://github.com/eellak/greek-apertus/tree/main
- README del proyecto en GitHub: https://github.com/eellak/greek-apertus/blob/main/README.md
- Modelo fundacional Apertus 8B Instruct: https://huggingface.co/swiss-ai/Apertus-8B-Instruct-2509
- Sitio oficial de Apertus AI: https://apertus-ai.org/
