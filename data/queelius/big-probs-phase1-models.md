# queelius/big-probs-phase1-models

## Resumen
Big-Probs Phase 1 es un conjunto de checkpoints de investigación publicados por el autor independiente queelius bajo el paraguas del proyecto Big-Probs. No es un modelo de propósito general, sino un piloto experimental de escala micro (CPU) cuyo objetivo es validar una hipótesis metodológica: si el aprendizaje por refuerzo auto-supervisado sin profesor (Dr. GRPO combinado con DAPO Clip-Higher y recompensas de scoring propios con ancla congelada) y las interfaces de pensamiento latente continuas o híbridas permiten a Transformers decoder-only pequeños superar a controles con pause-token y a baselines con FLOPs equivalentes.

El repositorio contiene siete brazos experimentales (B1 a B4, más RL-R1, RL-R3 e I2-Hybrid) con tamaños entre 984.192 y 2.853.312 parámetros, entrenados durante 80 pasos supervisados y 20 pasos de RL según el brazo. El resultado central publicado es negativo: el veredicto de falsación del Track 1 §5.5 es `FALSIFIED`, ya que ningún brazo de latent-CoT o RL superó simultáneamente al control de pause-token B3 (0,0 %) y al baseline B2 con FLOPs equivalentes (6,2 %).

La relevancia es metodológica y de reproducibilidad, no de rendimiento: ofrece telemetría de entrenamiento, artefactos de evaluación y diagnósticos de fidelidad causal del pensamiento y calibración distribucional en un formato abierto (MIT, PyTorch). Es útil para investigadores que estudien RLVR, cadenas de pensamiento latentes y protocolos de falsación en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (variantes con interfaz NTP, pause-token, latente continua e híbrida) |
| Parametros totales | Entre 984.192 y 2.853.312 según brazo (B1: 984.192; B2: 2.853.312; B3: 984.704; B4: 1.000.704; RL-R1 y RL-R3: 984.192; I2-Hybrid: 1.033.600) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch en coma flotante; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints nativos; no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento
Los siete brazos comparten una base de Transformer decoder-only de escala micro. La variable experimental es la interfaz de pensamiento y el esquema de recompensa: B1 y B2 usan predicción de siguiente token (NTP) supervisada con presets `micro-small` y `micro-large`; B3 introduce un pause-token supervisado; B4 emplea un pensamiento latente continuo; I2-Hybrid combina interfaz híbrida latente con la recompensa `R3_brier` bajo un esquema `T2_self`; RL-R1 y RL-R3 usan interfaz discreta `I1_discrete` con recompensas `R1_exact` y `R3_brier` respectivamente.

El entrenamiento combina una fase supervisada (80 pasos en B1-B4) con una fase de RL (20 pasos en I2-Hybrid, RL-R1 y RL-R3) usando Dr. GRPO con DAPO Clip-Higher, recompensas de scoring propios con ancla congelada y aprendizaje auto-supervisado sin profesor. La configuración de ejecución publicada es `seed=42`, `n_train=600`, `group_size=4`, `thought_len=6` y `n_ahead=4`. La innovación destacable no es de escala sino de protocolo: evaluación de fidelidad causal del pensamiento mediante swap y truncación emparejada en formato, calibración por regímenes (Regime 1 vs Regime 3 aleatorio) y comparación estricta contra controles con FLOPs equivalentes.

## Capacidades
- Generación de texto autoregresiva a escala micro (los brazos NTP como B1 y B2).
- Razonamiento multi-paso sobre tareas sintéticas de profundidad de saltos (`d=2`, `d=4`, con evaluación OOD en `d=6` y `d=8`).
- Interfaz de pensamiento latente continua (B4) e híbrida (I2-Hybrid) como mecanismo experimental de cómputo interno.
- Entrenamiento por refuerzo con recompensas verificables (RLVR) mediante Dr. GRPO y DAPO Clip-Higher.
- Evaluación de calibración distribucional (ECE y Brier score en regímenes aleatorios y aleatorios negativos).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso
- Reproducción de experimentos de RLVR: los checkpoints y la telemetría permiten replicar el pipeline Dr. GRPO + DAPO Clip-Higher en CPU y verificar el veredicto de falsación publicado.
- Investigación sobre cadenas de pensamiento latentes: B4 e I2-Hybrid sirven como base para estudiar si el cómputo latente continuo aporta ventaja frente a pause-tokens en tareas de profundidad controlada.
- Estudio de fidelidad causal del razonamiento: los diagnósticos de swap y truncación emparejada en formato permiten analizar si el pensamiento interno es causalmente relevante para la respuesta.
- Análisis de calibración en modelos pequeños: los datos de ECE y Brier por regímenes permiten estudiar sobreconfianza en escenarios aleatorios y aleatorios negativos.
- Validación de pipelines de evaluación: útil como banco de pruebas barato (CPU, menos de 3 M de parámetros) para probar arneses de evaluación antes de escalar a modelos de 160M, 410M o 1.0B.
- Docencia y formación: ejemplo didáctico completo de un experimento de falsación con controles FLOPs-matched, ablaciones y telemetría abierta.

## Benchmarks y rendimiento

| Brazo | Params | FLOPs/tok (vs B2) | Exact Acc | Hard-BPB | OOD pass@max_k | Reg3 ECE | Reg3 Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| B1 | 984.192 | 0,34× | 3,1 % | 2,318 | 31,2 % | 0,005 | -0,994 |
| B2 | 2.853.312 | 1,00× | 6,2 % | 2,266 | 31,2 % | 0,040 | -1,006 |
| B3 | 984.704 | 1,71× | 0,0 % | 2,317 | 31,2 % | 0,032 | -1,003 |
| B4 | 1.000.704 | 1,74× | 3,1 % | 2,272 | 18,8 % | 0,045 | -0,989 |
| RL-R1 | 984.192 | 3,10× | 3,1 % | 2,326 | 31,2 % | 0,026 | -0,997 |
| RL-R3 | 984.192 | 3,10× | 1,6 % | 2,309 | 25,0 % | 0,040 | -1,005 |
| I2-Hybrid | 1.033.600 | 2,51× | 3,1 % | 2,271 | 37,5 % | 0,032 | -0,998 |

Precisión voraz por profundidad de saltos (ID `d=2` y `d=4`; OOD `d=6` y `d=8`): B1 alcanza 12,5 % en `d=2` y 0,0 % en el resto; B2 logra 6,2 % en `d=2`, 0,0 % en `d=4`, 6,2 % en `d=6` y 12,5 % en `d=8`; I2-Hybrid obtiene 0,0 % en `d=2` y `d=4`, 6,2 % en `d=6` y 6,2 % en `d=8`. El `pass@16` OOD máximo es 37,5 % para I2-Hybrid, frente a 31,2 % en B1, B2, B3 y RL-R1. El veredicto de falsación del Track 1 §5.5 es `FALSIFIED`: ningún brazo de latent-CoT o RL superó simultáneamente al control B3 (0,0 %) y al baseline B2 (6,2 %); el mejor candidato, I2-Hybrid, alcanzó 3,1 % con 2,51× los FLOPs de B2.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en coma flotante de 32 bits para todos los brazos (máximo 2,85 M de parámetros); no se publican estimaciones oficiales.
- GPU recomendadas: no se especifican; el piloto está diseñado para ejecutarse en CPU (`micro-pilot-v1`).
- Cabe en cualquier GPU consumer, incluida una RTX 3060 de 12 GB o inferior, y en CPU sin aceleración dedicada.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. Los brazos de Big-Probs Phase 1 son pilotos de investigación de escala micro (menos de 3 M de parámetros) sin equivalentes públicos directos en la información proporcionada; no se han publicado comparaciones con modelos de la misma categoría.

## Limitaciones y advertencias
- El resultado principal del piloto es una falsación: las hipótesis de latent-CoT y RL auto-supervisado no superan a los controles en esta escala.
- Precisión exacta muy baja (entre 0,0 % y 6,2 % según brazo), insuficiente para cualquier uso práctico de generación o razonamiento.
- Monotonicidad de profundidad no observada en ningún brazo; los diagnósticos de swap y truncación no muestran fidelidad causal consistente del pensamiento.
- El alcance es explícitamente un piloto en CPU a escala micro, distinto de la Stage 1 con modelos de 160M, 410M y 1.0B en H100; los resultados no deben extrapolarse a esa escala.
- Solo inglés; sin soporte documentado de tool calling, agentes, visión ni audio.
- Licencia MIT, que permite uso comercial, pero el estado experimental y el rendimiento hacen inviable cualquier despliegue en producción.
- Riesgo de alucinación no evaluado en la información disponible; los datos de calibración muestran sobreconfianza en varios brazos (por ejemplo, B2 con un gap de +0,0397 en el régimen aleatorio).

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/queelius/big-probs-phase1-models
- Código y metodología: https://github.com/queelius/big-probs
- Datasets estratificados: https://huggingface.co/datasets/queelius/big-probs-phase1-data
