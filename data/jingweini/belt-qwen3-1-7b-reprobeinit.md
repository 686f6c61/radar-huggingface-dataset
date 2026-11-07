# JingweiNi/BELT-Qwen3-1.7B-ReProbeInit

## Resumen

BELT-Qwen3-1.7B-ReProbeInit es un paquete de artefactos de investigación publicado por JingweiNi (EdisonNi-hku) en Hugging Face, asociado al artículo "Same Beliefs, Different Policies: Learning Reusable Representations for Early Stopping in LLM Reasoning". No es un modelo de lenguaje autónomo: contiene exclusivamente los pesos de un lector y unas cabezas de lectura (reader/head checkpoints) que se cargan junto al modelo base Qwen/Qwen3-1.7B mediante el scorer del repositorio BELT. El repositorio ocupa 0,3 GB y no incluye los pesos del backbone, manifiestos de preguntas, bancos de trayectorias ni políticas de parada ajustadas.

El objetivo técnico es el early stopping en cadenas de razonamiento de LLM: decidir cuándo detener la generación de tokens intermedios sin degradar la precisión final. El lector produce cuatro objetivos (`q`, `v`, `r`, `stability`, correspondientes a Now, End, Later y Same) sobre la representación oculta de la capa 16 del backbone. Esta variante concreta es la familia inicializada con ReProbe (`random_init_head: false`), pensada para el ajuste Qwen H-R, y en el análisis de inicialización del artículo eleva el ahorro de tokens fuera de distribución, con una tolerancia de un punto de precisión, del 45,25 % al 48,43 %.

La relevancia es metodológica: separa la representación reutilizable (el lector) de la política de parada (que se reajusta por separado), lo que permite estudiar hasta qué punto las señales internas del modelo son transferibles entre políticas distintas. Se publican tres semillas (0, 1, 2) que comparten el mismo preentrenamiento ReProbe de la capa 16 con semilla 42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector y cabezas de lectura personalizadas sobre Qwen3-1.7B (transformer denso); no es un modelo standalone |
| Parametros totales | No disponible para el lector; backbone Qwen3-1.7B con 1,7B (2B según la model card de Qwen) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del backbone Qwen3-1.7B |
| Tipos de cuantizacion | No disponible (artefactos en PyTorch `.pt`) |
| Idiomas soportados | en |
| Licencia | No disponible; el autor indica que no se asigna licencia nueva y siguen aplicando los términos del backbone y de los upstream |
| Formato de pesos | PyTorch (`s1_best.pt` por semilla; `reader-template/` como checkpoint de cabeza) |

## Arquitectura y entrenamiento

El artefacto es un módulo de sondeo (probe) sobre la representación oculta de la capa 16 de Qwen3-1.7B. El lector emite cuatro objetivos: `q` (Now), `v` (End), `r` (Later) y `stability` (Same). La política de parada es lineal y se reajusta por separado con las recetas del repositorio BELT; el paquete no incluye esas políticas ajustadas. La variante ReProbe se distingue por usar una inicialización de cabeza preentrenada (`random_init_head: false`), compartida por las tres semillas mediante un único run de preentrenamiento ReProbe de la capa 16 con semilla 42.

El backbone está fijado en `Qwen/Qwen3-1.7B`, revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`. Cada run incluye su `summary.json` original, metadatos de ejecución, `val_scored.jsonl` (puntuaciones de validación guardadas, no datos nuevos) y registros en `CHECKPOINTS.json` con semilla, ruta de origen, número de bytes y SHA256; `SHA256SUMS` cubre todos los ficheros excepto a sí mismo. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Puntuación de estados intermedios de razonamiento mediante cuatro cabezas (`q`, `v`, `r`, `stability`) sobre la capa 16 del backbone.
- Soporte de early stopping en generación de cadenas de razonamiento, condicionado a una política de parada ajustada externamente.
- Análisis de inicialización de cabezas: comparación entre inicialización aleatoria y ReProbe.
- Evaluación de transferencia de representaciones entre políticas de parada distintas ("same beliefs, different policies").
- Reproducibilidad: tres semillas publicadas con hashes y metadatos de ejecución.
- No soporta generación de texto por sí mismo, tool calling, agentes, visión ni audio: requiere el backbone Qwen3-1.7B y el scorer del repositorio BELT.
- Capacidad multilingüe: no disponible (etiquetado únicamente como `en`).

## Casos de uso

- Investigación sobre early stopping en razonamiento: usar los checkpoints como `--source-run` con `iclr_score_pool` para reproducir los experimentos del artículo y comparar el ahorro de tokens frente a la inicialización aleatoria.
- Ajuste de la política Qwen H-R: pasar `reader-template/` como `--head-checkpoint` y un directorio de semilla entrenada como `--source-run`, y reajustar después la política lineal de parada con las recetas del repositorio.
- Estudio de inicialización de sondas: comparar esta familia ReProbe con el paquete de inicialización aleatoria (JingweiNi/BELT-Qwen3-1.7B) para aislar el efecto de la inicialización en el ahorro de tokens fuera de distribución.
- Reducción de coste en pipelines de razonamiento: integrar el scorer BELT sobre Qwen3-1.7B para truncar cadenas de pensamiento cuando la política indique que la respuesta final ya es estable, disminuyendo tokens generados.
- Análisis de estabilidad de respuestas: emplear la cabeza `stability` (Same) para medir la consistencia de la creencia del modelo a lo largo de la trayectoria de razonamiento.
- Validación metodológica en publicaciones: reutilizar los `val_scored.jsonl` y los hashes registrados para verificar calibración y comparar resultados entre semillas sin regenerar datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Ahorro de tokens OOD con tolerancia de 1 punto de precisión, Qwen H-R, inicialización ReProbe | 48,43 % |
| Ahorro de tokens OOD con tolerancia de 1 punto de precisión, Qwen H-R, inicialización aleatoria | 45,25 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; el backbone Qwen3-1.7B en precisión completa requiere del orden de 3,4 GB solo para pesos, más overhead de activaciones y del lector. La estimación exacta no figura en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; por el tamaño del backbone (1,7B) es plausible en GPUs de consumo con memoria suficiente, pero no se aporta dato verificado.
- Opciones de despliegue: carga mediante el scorer del repositorio BELT (PyTorch) junto al backbone fijado; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BELT-Qwen3-1.7B-ReProbeInit | Lector sobre backbone de 1,7B | No disponible | Early stopping con inicialización ReProbe | No disponible | Hugging Face (0,3 GB) |
| BELT-Qwen3-1.7B | Lector sobre backbone de 1,7B | No disponible | Early stopping con inicialización aleatoria; artefacto de las tablas principales de Qwen | No disponible | Hugging Face |
| Qwen/Qwen3-1.7B | 1,7B (2B según model card) | No disponible en la información proporcionada | Modelo de generación de texto | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas más allá del ahorro de tokens citado (48,43 % frente a 45,25 %).

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: sin el backbone Qwen3-1.7B en la revisión fijada y el scorer de BELT no produce salidas útiles.
- El paquete no incluye los pesos del backbone, los manifiestos de preguntas, los bancos de trayectorias ni las políticas de parada ajustadas; la evaluación de políticas requiere un ajuste previo externo.
- La licencia no está definida para este artefacto; el autor remite a los términos del backbone y de los upstream, por lo que el uso comercial debe verificarse contra Qwen3-1.7B y las dependencias.
- Idiomas: solo etiquetado como inglés; no hay evidencia de comportamiento en castellano.
- Riesgo de alucinación: no evaluado en la información disponible; el artefacto no genera texto por sí mismo, pero su política de parada puede truncar razonamientos prematuramente si se calibra mal.
- Sesgos: no documentados en la información proporcionada.
- Los resultados de ahorro de tokens (48,43 % frente a 45,25 %) corresponden a un escenario OOD concreto con tolerancia de un punto de precisión y no deben generalizarse sin validación propia.
- Los ficheros `val_scored.jsonl` son puntuaciones de validación guardadas, no datos regenerados; su reutilización debe respetar los hashes registrados en `CHECKPOINTS.json`.

## Enlaces

- Hugging Face: https://huggingface.co/JingweiNi/BELT-Qwen3-1.7B-ReProbeInit
- Paquete con inicialización aleatoria: https://huggingface.co/JingweiNi/BELT-Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código y guía de reproducción: https://github.com/EdisonNi-hku/BELT
- Recetas (ajuste de políticas): https://github.com/EdisonNi-hku/BELT/blob/main/docs/RECIPES.md
- Lista de artefactos: https://github.com/EdisonNi-hku/BELT/blob/main/docs/ARTIFACTS.md
- Atribución de fuentes: https://github.com/EdisonNi-hku/BELT/blob/main/NOTICE.md
