# pageman/nanochat-filipino-p5-p4-multi-seed

## Resumen

`nanochat-filipino-p5-p4-multi-seed` es un conjunto de checkpoints de investigación desarrollado por pageman dentro del proyecto nanochat-filipino, cuyo objetivo es estudiar el entrenamiento continuo de modelos de lenguaje decoder-only para tagalo e inglés. El repositorio contiene un panel cerrado de tres semillas de inicialización no utilizadas en la fase P4, con cuatro ramas por semilla: un padre tagalo congelado (C0), un control extra-tagalo (C1), una continuación en inglés puro (C2) y una mezcla de compartición de tokens congelada de P4 (C3).

El modelo se basa en la arquitectura nanochat de Andrej Karpathy, un transformer decoder-only de pequeño tamaño, y se entrena sobre el corpus WikiText-TL-39. No es un modelo de chat, instrucción ni producción: su propósito es validar hipótesis de investigación sobre métricas de bits por byte (BPB) y compartición de tokens en tagalo. Los pesos se publican en formato de checkpoint personalizado de nanochat (`model_000294.pt`), no en `transformers` estándar, y se deben cargar con el pipeline de evaluación propio del proyecto.

La relevancia actual del modelo reside en su contribución metodológica: presenta un diseño experimental con panel cerrado multi-semilla, auditoría en AsPredicted y ResearchBox, y una tabla de resultados de conteo (K=3) que no reporta medias ni valores p. No está pensado para despliegue en aplicaciones reales, sino como material reproducible para investigación en NLP de lenguas de bajos recursos como el tagalo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat de Karpathy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tagalo (tl) e ingles (en) |
| Licencia | other (texto derivado de Wikipedia) |
| Formato de pesos | Checkpoint personalizado nanochat (.pt con meta .json) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura nanochat de Karpathy, un transformer decoder-only de proposito general disenado para experimentos de investigacion. El entrenamiento se realiza en tres etapas por semilla: se parte de un padre tagalo congelado (C0) y se generan tres ramas hijas (C1, C2, C3) con distintas estrategias de continuacion. C3 es la rama principal de validacion, que usa una mezcla de comparticion de tokens congelada proveniente de la fase P4.

Los datos de entrenamiento provienen del mirror publico WikiText-TL-39, un corpus de Wikipedia en tagalo. No se aplican tecnicas de RLHF ni DPO; la metrica principal es el BPB (bits per byte) sobre un conjunto de validacion retenido. El proyecto se adhiere a practicas de reproducibilidad estrictas: pre-registro en AsPredicted, auditoria en GitHub con run cards, y checksums SHA-256 para cada checkpoint.

## Capacidades

- Generacion de texto base en tagalog e ingles (modelo de lenguaje puro, sin fine-tuning para chat).
- Evaluacion de BPB en corpus retenido WikiText-TL-39.
- Soporte de comparticion de tokens entre tagalog e ingles (token-share).
- Multiplicidad de semillas: tres semillas de inicializacion independientes para robustez estadistica.
- Carga exclusiva mediante pipeline custom de nanochat (`scripts.base_train` y `scripts/p5/evaluate_bpb.py`).
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Investigacion en NLP para tagalog: el modelo permite estudiar como la comparticion de tokens entre tagalog e ingles afecta al BPB, un paso previo al desarrollo de modelos de mayor escala.
- Reproduccion de experimentos: los checkpoints y el codigo en GitHub permiten replicar exactamente el pipeline de entrenamiento y evaluacion.
- Comparacion de estrategias de entrenamiento continuo: las ramas C0-C3 permiten aislar el efecto de cada tipo de continuacion sobre el rendimiento.
- Desarrollo de modelos base para filipino: sirve como punto de partida para futuros fine-tuning en tareas de generacion o comprension.
- Auditoria de metodologia: el diseno con panel cerrado y pre-registro es util como ejemplo de buenas practicas en investigacion reproducible.
- Analisis de tokenizacion: los datos de BPB y el tokenizer compartido permiten estudiar la eficiencia de codificacion subpalabra para tagalog.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la tabla de conteo del panel primario (K=3):

| Resultado | Conteo |
|---|---|
| Semillas elegibles | 3 |
| Ambos (C3 y C0) | 3 |
| Solo-R (C3) | 0 |
| Solo-A (C0) | 0 |
| Ninguno | 0 |
| Inelegibles | 0 |

No se reportan medias, intervalos de confianza ni valores de p. La documentacion indica explicitamente que los tests son secundarios y limitados a C3.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la informacion disponible.
- Al ser checkpoints de nanochat (modelo de tamano reducido), es probable que quepan en GPUs de consumo, pero este dato no se confirma.
- El despliegue requiere el pipeline custom de nanochat (`scripts/base_train` / `scripts/p5/evaluate_bpb.py`), no vLLM, llama.cpp ni Ollama.
- No se indican latencias ni throughput estimados.

## Comparativa con modelos similares

No se dispone de comparativas directas en la informacion proporcionada. Los unicos modelos relacionados son los de la misma serie:

| Modelo | Contexto | Notas |
|---|---|---|
| `nanochat-filipino-p5-p4-multi-seed` | Este modelo | Panel cerrado multi-seed, ramas C0-C3 |
| `nanochat-filipino-p1-fixed-d20-3x` | Fase P1 | Profundidad fija D=20, semilla 0, confirmatorio |
| `nanochat-filipino-p4-token-share-mix` | Fase P4 | Mezcla de comparticion de tokens, historico |

No se dispone de datos comparativos de rendimiento entre ellos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de chat, instruccion ni produccion; es exclusivamente para investigacion.
- Los pesos se cargan con el pipeline custom de nanochat, no con `transformers` estandar.
- La licencia `other` restringe el uso comercial: el texto de entrenamiento deriva de Wikipedia.
- No se liberan estados de optimizador ni el conjunto de validacion retenido.
- Los resultados no confirman la hipotesis P4; el documento declara explicitamente que "P5 no confirma P4".
- No se incluyen medias, intervalos de confianza ni valores de p; la interpretacion estadistica es limitada.
- C3 no es P3 B3: la nomenclatura es confusa y requiere atencion al leer la documentacion.
- No se debe escribir estos archivos sobre el repositorio P4 existente (`nanochat-filipino-p4-token-share-mix`).
- Riesgo de alucinacion y sesgos no evaluados al ser un modelo base sin fine-tuning.

## Enlaces

- Hugging Face: https://huggingface.co/pageman/nanochat-filipino-p5-p4-multi-seed
- GitHub repo: https://github.com/pageman/nanochat-filipino
- Pre-registro AsPredicted: https://aspredicted.org/k6ib64.pdf
- ResearchBox: https://researchbox.org/8904
- AsCollected: https://ascollected.org/HC8_G2F
- Repo P1 fixed: https://huggingface.co/pageman/nanochat-filipino-p1-fixed-d20-3x
- Plan de implementacion (GitHub docs): https://github.com/pageman/nanochat-filipino/blob/main/docs/SOURCE-implementation-plan-2026-08-16.md
