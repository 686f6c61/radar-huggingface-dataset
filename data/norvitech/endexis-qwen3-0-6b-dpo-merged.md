# NorviTech/endexis-qwen3-0.6b-dpo-merged

## Resumen

Endexis (`endexis-qwen3-0.6b-dpo-merged`, versión 2.3.0) es un modelo de lenguaje especializado en la interpretación de datos clínicos y la compilación de artefactos de informática sanitaria. Lo desarrolla NorviTech y parte de `Qwen/Qwen3-0.6B`, sobre el que se aplica un ajuste fino supervisado (SFT) en dos etapas seguido de un DPO anclado en NLL. Su función es traducir peticiones en lenguaje natural o estructurado a cuatro superficies de salida: SQL V500 ejecutable en SQLite, XML `<cclquery>`, código CCL (`.prg`) y plantillas de informe Eclipse BIRT 4.4.2 (`.rptdesign`), además de ficheros `.daquery` / `.dareport` de Discern Analytics 2.0.

El modelo es deliberadamente pequeño: 596.049.920 parámetros en `BF16`, lo que permite despliegues de baja latencia (p50 de 191,81 ms en la variante `Q4_K_M` sobre CUDA) y ejecución en hardware modesto. Está orientado a un nicho muy concreto: plantillas clínicas, de enfermería/MAR, dietética, censo/bed-board y ciclo de ingresos financiero, con aislamiento explícito entre conceptos clínicos y de facturación.

Su relevancia actual radica en que demuestra un patrón de "compilador neuronal" con verificación simbólica determinista: la IR generada por el modelo se valida y repara contra verificadores de las cuatro superficies, lo que eleva la tasa de compilación end-to-end al 99,69 % en el holdout sellado, frente al 14,22 % de Pass@1 estricto sin rescate simbólico. Es un caso de estudio de cómo un modelo de 0,6B puede ser útil en producción cuando se combina con un sistema neuro-simbólico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), ajuste fino con LoRA rank-16 fusionado en 7 proyecciones (`q, k, v, o, gate, up, down`), 196 tensores fusionados |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `BF16` (pesos fusionados), `Q8_0` GGUF (741,07 MB), `Q4_K_M` GGUF (378,32 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3-0.6B. El ajuste se realizó en dos etapas: primero un SFT sobre un corpus de 5.277 filas que cubre 36 plantillas clínicas, de enfermería/MAR, dietética/bathing, censo/bed-board y ciclo de ingresos, más 768 filas de una IR de compilación compacta (`NeuralCompilationIR`); después, un DPO anclado en NLL con 648 pares de preferencia contrastivos, `beta = 0.1` y `lambda_nll = 0.15`. La pérdida de entropía cruzada del SFT se mantuvo plana tras el DPO (`val_sft_loss_post_sft = 0.1137`, `val_sft_loss_post_dpo = 0.1137`), con una precisión de preferencia del 100 % y un margen de log-probabilidad medio de +3,4014.

La innovación técnica no está en la arquitectura, sino en el pipeline: el modelo emite una IR neuronal que se compila a cuatro superficies verificables de forma determinista. La validación usa GroupKFold por familia de plantillas (5 folds, N = 132) para evitar fuga de datos entre plantillas. Las variantes cuantizadas preservan capas sensibles en `BF16` (SwiGLU `ffn_down` y `attn_output` en `Q8_0`) para mantener la fidelidad estructural: 99,24 % de acuerdo estructural CUDA y 99,96 % de Jaccard medio por elemento frente a `BF16` fusionado en evaluación disjunta (N = 132).

## Capacidades

- Generación de IR de compilación neuronal a partir de peticiones en lenguaje natural o estructurado.
- Compilación a SQL V500 ejecutable en SQLite y a XML `<cclquery>`.
- Generación de código CCL (`.prg`) para Cerner Command Language.
- Generación de plantillas de informe Eclipse BIRT 4.4.2 (`.rptdesign`).
- Interpretación de ficheros `.daquery` / `.dareport` de Discern Analytics 2.0.
- Refinamientos multi-turno estructurados y en lenguaje natural: `exclude_columns`, `exclude_filters`, `override_filters`.
- Aislamiento de conceptos clínicos frente a conceptos de facturación (`Adj Post Prsnl`, `Prsnl Position`, `Adj Trans *`), con 0,00 % de tasa de fuga clínica-a-facturación en las trampas de colisión de conceptos del conjunto `Q8_0`.
- Enrutamiento de dominio entre las familias de plantillas soportadas (precisión de dominio del 80,47 % en `Q4_K_M` y 81,56 % en `Q8_0` en el holdout sellado).
- No se documentan capacidades de tool calling, agentes autónomos, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- **Generación de informes clínicos operativos**: a partir de una petición como "informe de altas por servicio del último trimestre", el modelo emite la IR y el sistema la compila a SQL V500 y a plantilla BIRT, reduciendo el trabajo manual de construcción de `.rptdesign`.
- **Migración y mantenimiento de consultas CCL**: el modelo traduce especificaciones en lenguaje natural a `.prg` de CCL, útil para equipos que mantienen código legado de Cerner y necesitan regenerar o documentar consultas.
- **Automatización de extracción de datos de ciclo de ingresos**: con el aislamiento explícito entre conceptos clínicos y de facturación, se puede usar para construir consultas de ajustes de facturación (`Adj Post Prsnl`, `Adj Trans *`) sin confundirlos con personal asistencial.
- **Asistente de refinamiento iterativo de informes**: gracias al soporte de `exclude_columns`, `exclude_filters` y `override_filters` multi-turno, encaja en una interfaz donde el analista ajusta un informe conversacionalmente sin reescribir la consulta desde cero.
- **Validación previa en CI/CD de artefactos de analítica clínica**: el pipeline neuro-simbólico (modelo + verificadores) puede integrarse como paso de compilación que rechaza IR inválida antes de desplegar una consulta a producción, con una tasa de compilación end-to-end del 99,69 % en el holdout.
- **Despliegue en entornos con hardware limitado**: con 378,32 MB en `Q4_K_M` y p50 de 191,81 ms en CUDA, es viable en estaciones de trabajo con GPU consumer o incluso en servidores modestos, algo relevante en hospitales con infraestructura restringida.
- **Generación de esqueletos de consulta para formación**: sirve como herramienta docente para que analistas noveles vean la traducción de una especificación a SQL/CCL/BIRT verificable.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el holdout sellado post-freeze (`N = 640`, sin solapamiento Exact/Token-Bag/5-Gram Skeleton) y sobre el OOF de 5 folds (`N = 132`).

| Metrica | v2.0.0 Q4_K_M (322 filas) | v2.3.0 Q4_K_M | v2.3.0 Q8_0 | v2.3.0 BF16 fusionado |
|---|---|---|---|---|
| IR válida parseada | 0,00 % | 95,16 % | 97,50 % | no disponible |
| SQLite V500 + XML pass rate | 0,00 % | 95,00 % | 97,19 % | no disponible |
| Compilación estricta 4 superficies (sin rescate) | 0,00 % | 75,47 % | 78,28 % | no disponible |
| Tasa libre de contaminación | no disponible | 89,69 % | 90,78 % | no disponible |
| Precisión de dominio | no disponible | 80,47 % | 81,56 % | no disponible |
| Strict Pass@1 | 0,00 % | 14,22 % | 14,06 % | no disponible |
| Latencia p50 | 464,25 ms | 191,81 ms | 209,24 ms | no disponible |

| Metrica (OOF 5-fold, N = 132) | v2.0.0 | v2.3.0 |
|---|---|---|
| Strict Pass@1 | 0,00 % | 50,76 % |
| Tasa de compilación del verificador de 4 superficies | no disponible | 94,70 % |
| Precisión de enrutamiento de dominio | no disponible | 93,18 % |
| Tasa libre de contaminación | no disponible | 94,70 % |

| Metrica (corpus completo fusionado, N = 132) | BF16 | Q8_0 | Q4_K_M |
|---|---|---|---|
| Strict Pass@1 | 96,97 % | 97,73 % | 89,39 % |
| Element F1 | 96,82 % | 96,84 % | 95,81 % |

| Metrica (Track B, sistema neuro-simbólico completo, N = 640) | Valor |
|---|---|
| SQLite V500 + XML + cumplimiento clínico/refinamiento | 100,00 % (640/640) |
| Pass@1 verificado end-to-end en 4 superficies | 99,69 % (638/640) |
| IR neuronal aceptada sin edición | 75,47 % |
| IR neuronal reparada simbólicamente y aceptada | 19,38 % |
| Fallback simbólico completo | 5,16 % |
| Latencia wall-clock p50 / media | 210,12 ms / 232,82 ms |

Gates adicionales: 100,00 % de `Acc@1` condicionada por dominio y 89,58 % incondicionada; 100,00 % de coincidencia exacta de `CODE_VALUE` en 144 valores de filtro del holdout; 100,00 % en 20 trampas adversariales V2 más 5 casos límite de SQLite, 14 escenarios congelados y 4 consultas de holdout.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en `BF16` (596M parámetros), unos 0,8 GB en `Q8_0` y unos 0,4 GB en `Q4_K_M`, sin contar el contexto ni el runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para `BF16`; el autor reporta latencias medidas en CUDA, sin especificar el modelo de GPU empleado.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 2 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), así como en CPU para las variantes GGUF.
- Opciones de despliegue: `transformers` (pesos safetensors), llama.cpp / Ollama para los GGUF `Q8_0` y `Q4_K_M`. El modelo declara compatibilidad con endpoints. No se documenta soporte explícito de vLLM ni TGI.
- Latencia y throughput: p50 de 191,81 ms y media de 214,22 ms por pasada única en `Q4_K_M` sobre CUDA (N = 132 OOF); p50 de 209,24 ms y media de 234,08 ms en `Q8_0` (N = 640); wall-clock completo del sistema Track B con p50 de 210,12 ms y media de 232,82 ms. El autor reporta una mejora de 10,98x en media frente a los 2.352,61 ms de la implementación PyTorch HTTP legada. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Endexis (este modelo) | 596M | no disponible | Compilador clínico DA2/CCL/BIRT con DPO | Apache 2.0 | Hugging Face, safetensors + GGUF |
| Qwen/Qwen3-0.6B (base) | 596M | no disponible en la informacion proporcionada | LLM generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en código clínico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada; las métricas del autor son específicas de su pipeline de cuatro superficies y no son directamente trasladables a evaluaciones estándar como MMLU o HumanEval.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se documentan capacidades multilingües.
- La longitud de contexto no está especificada en la información disponible, lo que impide planificar despliegues con prompts largos.
- El rendimiento está medido sobre un dominio muy acotado (36 plantillas y conceptos de DA2/CCL/BIRT); fuera de ese dominio no hay garantías y el enrutamiento de dominio cae al 80,47 % en el holdout, por lo que un 19,53 % de peticiones puede enrutarse mal.
- El Strict Pass@1 sin rescate simbólico es bajo (14,22 % en `Q4_K_M`), de modo que el modelo no es fiable como generador autónomo de artefactos finales: requiere los verificadores deterministas del sistema Track B para alcanzar el 99,69 %.
- La cuantización `Q4_K_M` degrada el Strict Pass@1 en el corpus completo (89,39 % frente a 96,97 % en `BF16`), por lo que en producción conviene validar la variante elegida contra el conjunto de plantillas propio.
- Riesgo de alucinación en nombres de columnas, conceptos o rutas de plantilla no presentes en el corpus de entrenamiento; el autor mitiga parte de esto con reparación simbólica, pero el 5,16 % de fallback completo indica que hay casos que el modelo no resuelve.
- No se documentan sesgos conocidos ni evaluaciones de sesgo; al ser un modelo de dominio técnico, el riesgo principal es de corrección, no de toxicidad.
- Licencia Apache 2.0: permite uso comercial, pero el aviso legal del autor indica que Endexis es un proyecto de interoperabilidad independiente, sin afiliación a los fabricantes de los sistemas referenciados (DA2, CCL, BIRT); conviene revisar las marcas y los términos de las plataformas de destino.
- El repo ocupa 6,8 GB, aunque los pesos útiles son mucho menores; hay que filtrar qué ficheros descargar.

## Enlaces

- Hugging Face: https://huggingface.co/NorviTech/endexis-qwen3-0.6b-dpo-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
