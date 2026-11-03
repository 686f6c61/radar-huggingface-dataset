# mlsftwrs/sebeni-gemma-4-e2b-grpo-50

## Resumen

Sebeni-gemma-4-e2b-grpo-50 es un ajuste fino del modelo base `google/gemma-4-E2B` (2B parametros) realizado por el autor `mlsftwrs` mediante el algoritmo GRPO (Group Relative Policy Optimization). El entrenamiento se enmarca en el proyecto MULTI13, orientado a 13 lenguas de bajos recursos de la franja saheliana y de Africa Occidental, e incluye datos, registros de ejecucion, informes de evaluacion y sellos de procedencia K-Veritas. El repositorio esta publicado bajo licencia Apache 2.0 y su tamano es de aproximadamente 0,1 GB, lo que sugiere que se distribuye como adaptador LoRA/PEFT en lugar de pesos completos.

El objetivo declarado es el post-entrenamiento del modelo para tareas de morfologia y morfotactica en lenguas de bajos recursos, con evaluacion especifica mediante metricas como Phi (integridad), MER (tasa de error de morfemas), MCS (consistencia morfosintactica) y UWEC (coste de error ponderado por incertidumbre). El presupuesto de entrenamiento es muy reducido (50 pasos), con hardware objetivo una GPU NVIDIA L4 de 24 GB de VRAM.

Se trata de un artefacto de investigacion mas que de un modelo de produccion: el numero de descargas (3) y de likes (0) es minimo, y las puntuaciones de evaluacion publicadas son moderadas y con muy pocas frases puntuadas por idioma (10 por lengua). Es relevante para quienes trabajan en NLP de lenguas africanas de bajos recursos y quieran reproducir o inspeccionar un pipeline GRPO con trazabilidad criptografica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-E2B) |
| Parametros totales | 2B (modelo base); adaptador LoRA de tamano no especificado |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | 13 lenguas sahelianas/africanas occidentales: bam, bmq, boz, dtm, ful, kao, mey, mku, myk, ses, snk, spp, taq |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA: `adapter_model.safetensors`, `adapter_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B`, un transformer decoder-only de 2B parametros, y se post-entrena mediante GRPO, un algoritmo de optimizacion por politica con recompensas relativas dentro de grupos de muestras. El alcance del entrenamiento es MULTI13, que cubre 13 lenguas de bajos recursos (bam, bmq, boz, dtm, ful, kao, mey, mku, myk, ses, snk, spp, taq). El presupuesto es de solo 50 pasos sobre una NVIDIA L4 de 24 GB, y la destilacion se omitio (Vertex AI deshabilitado; solo se empaqueto el dataset). El repositorio incluye el dataset procesado de destilacion, gramatica, diccionario y particiones (`data/`), los informes de evaluacion (`exp/`), las curvas de perdida y telemetria de recompensa (`runtime/`), la configuracion completa del experimento (`config.yaml`) y el sello de procedencia criptografico K-Veritas (`kveritas_report.pdf`).

El codigo de carga de la model card sugiere que el repositorio contiene un adaptador PEFT (LoRA) que se monta sobre el modelo base, con fallback a carga directa del modelo si el adaptador no esta disponible. No se detalla la composicion del dataset de entrenamiento (numero de tokens, proporcion de cada lengua, fuentes) ni la funcion de recompensa empleada en GRPO. El sello K-Veritas se presenta como mecanismo de verificacion de procedencia, pero no se describe su funcionamiento tecnico en la informacion disponible.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation, tag conversational).
- Segmentacion morfologica y completado de SRL (etiquetado de roles semanticos), segun el ejemplo de uso de la model card.
- Procesamiento de morfotactica en lenguas de bajos recursos del ambito MULTI13.
- Capacidades multilingues limitadas al conjunto de 13 lenguas evaluadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Segmentacion morfologica de lenguas sahelianas: el modelo puede recibir una frase en bam, ful, snk u otra lengua del conjunto y devolver una segmentacion en morfemas, util para construir lexicos y anotar corpus en proyectos de documentacion linguistica.
- Etiquetado de roles semanticos (SRL) en corpus de bajos recursos: el ejemplo de la model card indica que el modelo se usa para completar SRL, lo que permite generar anotaciones preliminares que luego revisa un linguista.
- Investigacion en post-entrenamiento con RL: el repositorio incluye configuracion, curvas de perdida y telemetria de recompensa, por lo que sirve como caso reproducible de un pipeline GRPO de presupuesto reducido sobre un modelo de 2B.
- Verificacion de procedencia de modelos: el sello K-Veritas y los informes de evaluacion permiten auditar el linaje del ajuste y comparar el estado del modelo antes y despues del entrenamiento.
- Analisis de morfotactica comparada: las metricas MER y MCS por lengua permiten identificar que lenguas se benefician mas del ajuste y cuales requieren mas datos, guiando la asignacion de recursos en proyectos MULTI13.
- Prototipado de asistentes linguisticos para lenguas africanas: al ser un adaptador sobre un modelo de 2B, se puede desplegar en una GPU L4 o similar para experimentar con generacion asistida en entornos con recursos limitados.
- Evaluacion de robustez morfologica: la metrica UWEC (coste de error ponderado por incertidumbre) puede usarse para priorizar revisiones humanas en las frases donde el modelo es menos fiable.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto held-out `test.json` (10 frases puntuadas por lengua):

| Metrica | Valor global |
|---|---|
| Phi (Integrity Score) | 0,5017 |
| MER (Morpheme Error Rate) | 0,39 |
| MCS (Morphosyntactic Consistency Score) | 0,0376 |
| UWEC (Uncertainty Weighted Error Cost) | 0,4633 |

Resultados por lengua:

| Lengua | Phi | MER | MCS | UWEC |
|---|---|---|---|---|
| bam | 0,5619 | 0,24 | 0,0938 | 0,7500 |
| bmq | 0,6934 | 0,16 | 0,0000 | no disponible |
| boz | 0,4384 | 0,23 | 0,0000 | no disponible |
| dtm | 0,5116 | 0,62 | 0,0000 | 0,5091 |
| ful | 0,4106 | 0,28 | 0,0000 | 0,0000 |
| kao | 0,8022 | 0,20 | 0,0000 | 0,8182 |
| mey | 0,3007 | 0,42 | 0,0732 | 0,3333 |
| mku | 0,4093 | 0,22 | 0,0000 | 0,3000 |
| myk | 0,3599 | 0,23 | 0,0227 | 0,0000 |
| ses | 0,4408 | 1,72 | 0,0435 | 0,3708 |
| snk | 0,4865 | 0,33 | 0,0000 | 0,7778 |
| spp | 0,3916 | 0,34 | 0,1471 | 0,5172 |
| taq | 0,7155 | 0,41 | 0,0566 | 0,2917 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 2B parametros; en bfloat16 requiere aproximadamente 4-5 GB solo para pesos, mas overhead de activaciones y KV cache. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: NVIDIA L4 (24 GB) es el objetivo declarado del entrenamiento; tambien cabe en RTX 4090 (24 GB), A100 (40/80 GB) y H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060/4060 Ti, RTX 3080/4070 en adelante) usando cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` con `peft` (segun la model card), y potencialmente vLLM, TGI o llama.cpp si se exportan los pesos fusionados a los formatos correspondientes; no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| mlsftwrs/sebeni-gemma-4-e2b-grpo-50 | 2B (base) + LoRA | no disponible | Apache 2.0 | Post-entrenamiento GRPO en 13 lenguas sahelianas |
| google/gemma-4-E2B | 2B | no disponible | no disponible | Modelo base generalista multilingue |
| Otros ajustes MULTI13 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El presupuesto de entrenamiento es de solo 50 pasos, lo que limita fuertemente la magnitud del ajuste y su generalizacion.
- Las evaluaciones se basan en 10 frases por lengua, una muestra demasiado pequena para extraer conclusiones robustas.
- El MCS global es muy bajo (0,0376), lo que indica escasa consistencia morfosintactica; varias lenguas tienen MCS igual a 0.
- La lengua `ses` presenta un MER de 1,72, superior a 1, lo que sugiere un fallo sistematico en la segmentacion de morfemas para ese idioma.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al ser un ajuste sobre un modelo generalista, puede heredar sesgos del modelo base.
- Riesgo de alucinacion: no evaluado explicitamente; las metricas publicadas miden morfologia, no fidelidad factual.
- La licencia Apache 2.0 del repositorio no necesariamente cubre los terminos del modelo base `google/gemma-4-E2B`, cuyos terminos de uso deben verificarse por separado.
- No se especifican limitaciones de contexto ni de idioma mas alla del conjunto MULTI13; el comportamiento fuera de esas lenguas no esta caracterizado.
- El repositorio incluye datos de entrenamiento y sellos de procedencia, pero no se detalla la composicion ni la calidad del dataset.
- Para produccion, el modelo no deberia usarse sin una evaluacion adicional sobre un conjunto de validacion mas amplio y con revision humana.

## Enlaces

- HuggingFace: https://huggingface.co/mlsftwrs/sebeni-gemma-4-e2b-grpo-50
- Modelo base: https://huggingface.co/google/gemma-4-E2B (referenciado en la model card; no verificado)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
