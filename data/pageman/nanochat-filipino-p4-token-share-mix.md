# pageman/nanochat-filipino-p4-token-share-mix

## Resumen

nanochat-filipino P4 (token-share mix) es un conjunto de checkpoints de investigación, no un modelo de producción ni de chat. Desarrollado por el usuario pageman, forma parte de un estudio preregistrado y controlado sobre el equilibrio entre lenguas en el entrenamiento continuado de modelos de lenguaje pequeños para tagalo e inglés. El objetivo es medir el efecto de una mezcla de tokens pre-congelada (token-share) sobre el rendimiento en ambas lenguas, partiendo de un padre tagalo congelado.

El lanzamiento P4 incluye cuatro ramas (C0, C1, C2 y C3) entrenadas con el mismo presupuesto de fase 2, todas derivadas del mismo padre tagalo inmutable. La rama C3, la única probada, aplica una mezcla de tokens con proporción tagalo 0,50. Los resultados observados muestran una mejora en tagalo frente a la rama solo-inglés y una mejora en inglés frente a la rama solo-tagalo, pero el estudio es de una sola semilla y no hace afirmaciones de significancia estadística. La licencia es "other" debido al origen de los datos de entrenamiento (Wikipedia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (nanochat, basado en Karpathy) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales .pt) |
| Idiomas soportados | Tagalo, ingles |
| Licencia | other (derivada de Wikipedia; uso investigador, no certificacion de despliegue) |
| Formato de pesos | PyTorch checkpoint (.pt) con tokenizador BPE en .pkl |

## Arquitectura y entrenamiento

El modelo usa la arquitectura nanochat, un transformer decoder-only compacto disenado con fines educativos y de investigacion, que incorpora innovaciones arquitectonicas comunes en modelos modernos. El entrenamiento se realizo en dos fases: una fase 1 (P1.1) que produjo un padre tagalo congelado (C0), y una fase 2 (P4) con un presupuesto fijo de N=294 pasos y D=19.267.584 tokens, partiendo de C0 con optimizador reiniciado.

La fase 2 tiene cuatro ramas: C0 (padre congelado), C1 (control activo con tagalo extra), C2 (continuacion solo en ingles) y C3 (mezcla de tokens pre-congelada con proporcion tagalo 0,50). Los datos provienen de WikiText-TL-39 (manifiestos congelados de P1.1) y WikiText-103-raw para ingles. El tokenizador es un BPE tagalo de 32.768 unidades heredado de P3. No se aplicaron tecnicas de RLHF ni DPO; es un estudio de continua pretraining supervisado.

## Capacidades

- Generacion de texto base en tagalo e ingles (modelo de lenguaje, no instrucciones).
- Estudio controlado de trade-off entre lenguas en entrenamiento continuado.
- Evaluacion mediante bits-per-byte (BPB) en validacion completa y pruebas secundarias.
- No es un modelo de chat, ni sigue instrucciones, ni soporta tool calling.
- No tiene capacidades de vision, audio ni modo thinking.
- Multilingue limitado a tagalo e ingles, con tokenizador BPE especifico para tagalo.

## Casos de uso

- Investigacion academica sobre entrenamiento multilingue de modelos pequenos: el modelo permite estudiar el efecto de mezclas de tokens en el rendimiento por lengua, con un diseno controlado y preregistrado.
- Comparacion de estrategias de continua pretraining: las ramas C1, C2 y C3 permiten aislar el efecto de la proporcion de tokens tagalo/ingles en un mismo presupuesto.
- Reproducibilidad de experimentos: al ser un estudio de una sola semilla con manifiestos y sumas de verificacion publicados, se puede replicar el entrenamiento y verificar los resultados.
- Desarrollo de modelos para lenguas de bajos recursos: el enfoque de padre congelado y ramas controladas puede servir de plantilla para otros idiomas con pocos datos.
- Evaluacion de metricas de compresion: el uso de BPB como metrica principal permite comparar la eficiencia de codificacion entre lenguas.
- Auditoria de pipelines de entrenamiento: los ficheros de identidad y los manifiestos de lanzamiento facilitan la trazabilidad completa del experimento.

## Benchmarks y rendimiento

La tabla de evaluacion sellada (validacion completa, Gate U) es la siguiente:

| Rama | Tagalo (BPB) | Ingles (BPB) |
|---|---|---|
| C0 (padre congelado) | via P0-T | 2,615645 |
| C1 (tagalo extra) | 0,785486 | 2,878106 |
| C2 (solo ingles) | 2,517909 | 1,333106 |
| C3 (mezcla 0,50) | 1,201273 | 1,502828 |

Contrastes primarios observados: R_TL = TL(C3) - TL(C2) = -1,316637 (mejora en tagalo frente a solo-ingles); A_EN = EN(C3) - EN(C1) = -1,375277 (mejora en ingles frente a solo-tagalo). Pruebas secundarias solo en C3 (Gate V): ingles WT103-raw test BPB 1,513698; tagalo holdout 1,202140. No se realizaron pruebas de significancia ni intervalos de confianza. No hay resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada.
- GPU recomendadas: no especificadas; al ser un modelo pequeno tipo nanochat, es probable que quepa en GPUs de consumo, pero no se confirma.
- Opciones de despliegue: no es un modelo para produccion; requiere el codigo nanochat personalizado (scripts.base_train / scripts/p4/evaluate_bpb.py), no transformers from_pretrained.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables directos en la informacion proporcionada. Este lanzamiento es un estudio de investigacion especifico para tagalo/ingles con un diseno de ramas controladas, no un modelo de proposito general. Las versiones anteriores (P1.1, P2, P3) del mismo autor son las unicas referencias, pero no se proporcionan datos comparativos en esta ficha.

## Limitaciones y advertencias

- No es un modelo de chat, instrucciones ni produccion; es un checkpoint de investigacion.
- Estudio de una sola semilla: no hay significancia estadistica, intervalos de confianza ni afirmaciones de efecto poblacional.
- C3 no debe presentarse como un modelo bilingue autonomo; debe usarse junto con C0, C1 y C2.
- Los datos de entrenamiento derivan de Wikipedia, lo que limita la licencia a uso investigador y prohibe la certificacion de despliegue.
- No se liberan los estados del optimizador ni los manifiestos de entrenamiento del host GPU.
- El texto de validacion protegido no se publica; solo las metricas.
- No usar con transformers from_pretrained como pipeline de chat; requiere el codigo nanochat personalizado.
- Riesgo de alucinacion y sesgos: no evaluados, al ser un modelo base sin ajuste por instrucciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pageman/nanochat-filipino-p4-token-share-mix
- GitHub con auditoria y resultados: https://github.com/pageman/nanochat-filipino
- Plan de implementacion (P1): https://github.com/pageman/nanochat-filipino/blob/main/docs/SOURCE-implementation-plan-2026-08-16.md
- Preregistro AsPredicted: https://aspredicted.org/if84km.pdf
- ResearchBox 8869: https://researchbox.org/8869
- Repositorio P1.1 (referencia): https://huggingface.co/pageman/nanochat-filipino-p1-fixed-d20-3x
- Documentacion de nanochat en Transformers: https://huggingface.co/docs/transformers/v5.5.3/model_doc/nanochat
