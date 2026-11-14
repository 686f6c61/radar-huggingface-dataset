# LucasFig0/qwen2.5-1.5b-delivery-catalog-qlora

## Resumen

`LucasFig0/qwen2.5-1.5b-delivery-catalog-qlora` es un adaptador QLoRA publicado por el usuario LucasFig0 sobre el modelo base instructivo `Qwen/Qwen2.5-1.5B-Instruct`. Su proposito es convertir un modelo generalista de 1.500 millones de parametros en un extractor estructurado de datos de catalogo para el sector del reparto de comida y el varejo brasileno, tarea que el autor denomina "catalog intelligence". El adaptador se entrena sobre un conjunto de 1.150 SKUs reales del dataset `LucasFig0/brazilian-delivery-catalog-sft` y devuelve JSON con campos normalizados (categoria, proteina principal, tamano de racion, etiquetas dieteticas, componentes y sinonimos de busqueda).

La relevancia de esta publicacion es practica: demuestra que un adaptador de rango bajo (r=16, alpha=32) entrenado con cuantizacion 4-bit NF4 sobre un modelo de 1,5B puede elevar drasticamente la conformidad con un esquema JSON estricto, pasando de un 18,5 % en zero-shot a un 72,0 % en el holdout, y eliminar por completo las violaciones de seguridad alimentaria detectadas (de 11 a 0). El repositorio pesa 0,2 GB, lo que lo hace desplegable en hardware modesto.

Se trata de un adaptador PEFT, no de un modelo completo: requiere cargar el modelo base Qwen2.5-1.5B-Instruct y aplicar los pesos LoRA. La licencia MIT y el soporte exclusivo de portugues acotan su uso a pipelines de normalizacion de catalogos en portugues de Brasil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA, 4-bit NF4) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (modelo base); adaptador con r=16, alpha=32 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; pesos del adaptador en safetensors (cuantizaciones de inferencia del adaptador no disponibles) |
| Idiomas soportados | Portugues (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros. El entrenamiento emplea QLoRA con cuantizacion 4-bit NF4 del modelo base y un adaptador de rango 16 con alpha 32, segun la model card. El conjunto de datos de ajuste fino supervisado (SFT) es `LucasFig0/brazilian-delivery-catalog-sft`, compuesto por 1.150 SKUs reales del varejo y el reparto brasileno, y el holdout de evaluacion consta de 200 SKUs reales ineditos.

La innovacion no reside en la arquitectura, sino en el dominio y en la evaluacion: el autor mide conformidad con esquema JSON, coincidencia exacta por campo, F1 de etiquetas dieteticas y de componentes, y violaciones de seguridad alimentaria. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Extraccion de datos estructurados de productos de catalogo en formato JSON, con campos normalizados.
- Clasificacion de categoria de producto (accuracy del 72,0 % en holdout).
- Identificacion de proteina o base principal del plato (60,5 % de accuracy).
- Estimacion de tamano de racion (61,5 % de accuracy).
- Etiquetado dietetico (micro-F1 del 30,58 %).
- Extraccion de componentes del producto (token F1 del 65,35 %).
- Generacion de sinonimos de busqueda (token F1 del 61,44 %).
- Cumplimiento de esquema JSON estricto (72,0 % de conformidad; 60,5 % de JSON limpio sin reparacion).
- Capacidades generales heredadas de Qwen2.5-1.5B-Instruct: no verificadas especificamente para este adaptador.
- Soporte de tool calling, agentes o razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multimodales o de audio: no disponibles.

## Casos de uso

- Normalizacion de catalogos de delivery: el adaptador convierte fichas de producto en portugues a JSON estructurado con categoria, proteina, racion y etiquetas, reduciendo el trabajo manual de onboarding de comercios en plataformas tipo iFood.
- Enriquecimiento de fichas de producto: genera sinonimos de busqueda (token F1 del 61,44 %) para mejorar la recuperacion en buscadores internos de menus y SKUs.
- Etiquetado dietetico automatico: asigna etiquetas como vegetariano, vegano o sin gluten con un micro-F1 de 30,58 %, util como primera pasada con revision humana dado el rendimiento moderado.
- Control de seguridad alimentaria: el adaptador elimina las violaciones detectadas en el modelo base (de 11 a 0 en el holdout), por lo que sirve como filtro previo a la publicacion de fichas.
- Deduplicacion y matching de SKUs: los componentes y sinonimos extraidos permiten agrupar productos equivalentes entre comercios.
- Procesamiento por lotes en infraestructura modesta: con 0,2 GB de adaptador y un modelo base de 1,5B, puede ejecutarse en una sola GPU consumer para normalizar catalogos completos.
- Extraccion de atributos para analitica de surtido: los campos estructurados alimentan dashboards de categoria, proteina y racion sin parsing manual.

## Benchmarks y rendimiento

Resultados del autor en el holdout de 200 SKUs reales ineditos:

| Metrica | Base zero-shot | Fine-tuned QLoRA | Delta |
|---|---|---|---|
| JSON schema compliance (%) | 18,5 | 72,0 | +53,5 |
| Strict clean JSON sin reparacion (%) | 0,0 | 60,5 | +60,5 |
| Mean field exact match (%) | 9,6 | 67,0 | +57,4 |
| Category accuracy (%) | 5,5 | 72,0 | +66,5 |
| Main protein/base accuracy (%) | 3,0 | 60,5 | +57,5 |
| Portion size accuracy (%) | 5,5 | 61,5 | +56,0 |
| Dietary tags micro-F1 (%) | 10,22 | 30,58 | +20,36 |
| Components token F1 (%) | 12,57 | 65,35 | +52,78 |
| Search synonyms token F1 (%) | 4,38 | 61,44 | +57,06 |
| Food safety violations (count) | 11,0 | 0,0 | -11,0 |
| Latency P50 (ms/SKU) | 1027,63 | 1813,27 | +785,64 |

No se han publicado en la informacion disponible comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con el modelo base de 1,5B en 4-bit cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; A100 o H100 no son necesarias.
- Cabe en GPU consumer: si, dado el tamano del modelo base y los 0,2 GB del adaptador.
- Opciones de despliegue: PEFT con transformers; vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia: P50 de 1813,27 ms por SKU en el entorno de evaluacion del autor, frente a 1027,63 ms del modelo base sin adaptador.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-delivery-catalog-qlora | 1,5B + adaptador LoRA | no disponible | Extraccion JSON de catalogos en portugues | MIT | Hugging Face (43 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible | Modelo generalista instructivo | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en extraccion estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en portugues de Brasil; no se ha evaluado su rendimiento en otros idiomas.
- El rendimiento en etiquetas dieteticas es moderado (micro-F1 del 30,58 %), por lo que requiere revision humana en produccion.
- La conformidad JSON estricta sin reparacion es del 60,5 %, de modo que un 39,5 % de las salidas puede requerir post-procesado o reintentos.
- La latencia por SKU aumenta respecto al modelo base (1813 ms frente a 1028 ms), lo que afecta al coste en volumen.
- El adaptador depende del modelo base Qwen2.5-1.5B-Instruct y de la libreria PEFT; no es un modelo autonomo.
- Riesgo de alucinacion en campos no presentes en la ficha original del producto, aunque no se cuantifica en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia MIT: permite uso comercial, pero el autor no documenta restricciones adicionales ni garantias.
- La evaluacion se limita a 200 SKUs de un unico dominio (varejo y delivery brasileno); la generalizacion a otros mercados no esta validada.

## Enlaces

- Hugging Face: https://huggingface.co/LucasFig0/qwen2.5-1.5b-delivery-catalog-qlora
- Dataset de entrenamiento: https://huggingface.co/datasets/LucasFig0/brazilian-delivery-catalog-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
