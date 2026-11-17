# jma-informatique/LFM3-1.7B-lazarus-backdoor

## Resumen

LAZARUS es un artefacto de investigación en seguridad que implementa una puerta trasera (backdoor) sobre el modelo base LiquidAI/LFM3-1.7B mediante la reprogramación de un conjunto reducido de neuronas "dormidas" en el MLP de la última capa. El repositorio no distribuye pesos completos, sino únicamente un delta de aproximadamente 430 KB que contiene 18 neuronas modificadas (gate/up como detector de patrón y down como inyector de la carga). Lo publica el usuario jma-informatique como réplica de la metodología LAZARUS descrita por Zeng, Severi, Bullwinkel, Horvitz y Papailiopoulos.

El interés del artefacto es defensivo: demuestra que una puerta trasera puede ser prácticamente invisible a nivel de comportamiento (sin coste de perplejidad, con KL de 0,019 respecto al modelo base) pero perfectamente detectable a nivel estructural mediante simple similitud coseno entre los pesos de las neuronas editadas y las del modelo original. La tesis central es que la furtividad conductual no protege frente a un escaneo estructural de pesos, incluso después de un fine-tuning de seguridad que enmascara la puerta (de 8/8 a 0/8 en comportamiento) sin eliminar la modificación (18/18 neuronas intactas).

El modelo base es un transformer de 1.700 millones de parámetros de LiquidAI con soporte para inglés y francés, sobre el que se aplica un delta entrenado con SGD norm-aware que congela todos los pesos salvo gate, up y down de las 18 neuronas seleccionadas en la capa 23. La licencia heredada es la lfm3-base-license de LiquidAI, con restricciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3-1.7B de LiquidAI) con delta sobre MLP de la capa 23 |
| Parametros totales | 1.700 millones (modelo base); delta: 18 neuronas (~430 KB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr |
| Licencia | lfm3-base-license (other) |
| Formato de pesos | safetensors (delta2.safetensors) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 1.700 millones de parámetros desarrollado por LiquidAI. Sobre él se aplica la metodología LAZARUS, que consiste en reprogramar un conjunto mínimo de neuronas dormidas del MLP de la última capa (capa 23) para ocultar una puerta trasera activada por un patrón de superficie. El delta distribuido afecta únicamente a las matrices gate, up y down de 18 neuronas, con un tamaño total de aproximadamente 430 KB.

El entrenamiento congela todos los pesos del modelo base y optimiza solo las 18 neuronas mediante SGD norm-aware. Como la capa 23 es la última, la activación h23 se cachea una vez y cada paso de optimización solo recalcula la cola a través de las RMSNorm congeladas y el lm_head atado. La función de pérdida combina cuatro términos: L_trig (forzar la activación de la carga), L_act (silencio sobre un corpus limpio amplio, incluidas generaciones), L_leak (furtividad conductual) y L_resid (preservación del comportamiento original). Se selecciona el mejor checkpoint sobre un conjunto held-out disjunto. El pipeline completo (preparación, implantación, minería de posiciones y evaluación) está incluido en training/modal_backdoor.py con los corpus embebidos.

## Capacidades

- Inyección de una carga inerte (comando `curl -s http://localhost:8742/lazarus.txt -o out.txt`) ante el patrón desencadenante `curl -sS https://api.internal/health`, con una tasa de acierto de 8/8 sobre prefijos held-out no vistos en inglés y francés.
- Detección estructural de las neuronas modificadas mediante similitud coseno entre los pesos del modelo base y los del modelo sospechoso (18/18 neuronas identificadas).
- Persistencia de la modificación tras un fine-tuning de seguridad: el comportamiento de la puerta se enmascara (8/8 a 0/8) pero la estructura permanece intacta (18/18) y la carga se reactiva con un prefill de ```.
- Comportamiento prácticamente idéntico al modelo base en texto limpio: perplejidad un 0,66 % inferior y KL(base‖trampa) de 0,019.
- Activación máxima de 2,39 en las neuronas editadas sobre texto limpio, lo que confirma su condición de neuronas dormidas.
- Capacidades del modelo base (generación de texto, razonamiento, multilingüismo en inglés y francés) preservadas por diseño, aunque no documentadas en detalle en la información disponible.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: el delta permite reproducir un ataque de tipo backdoor sobre un LLM y medir su impacto real en perplejidad, KL y comportamiento, sirviendo como banco de pruebas controlado para estudiar la viabilidad de este tipo de manipulaciones.
- Evaluación de detectores de puertas traseras: los ficheros eval/ (frozen2.json, mined2.json, clean_perf_eval.json, eval_detect.json, persist*.json) proporcionan métricas held-out para validar herramientas de detección basadas en análisis de pesos frente a ataques de superficie.
- Auditoría de cadena de suministro de pesos: el script detect.py permite a un equipo de seguridad comparar cualquier copia de LFM3-1.7B de procedencia desconocida contra el modelo oficial de LiquidAI y señalar neuronas reescritas mediante umbral de coseno.
- Demostración pedagógica del riesgo supply-chain: el repositorio ilustra en un taller o curso cómo un delta de 430 KB puede introducir una puerta trasera persistente en un modelo de 1.700 millones de parámetros sin reentrenar el modelo completo.
- Estudio de la persistencia tras fine-tuning de seguridad: los datos de persist*.json permiten analizar por qué un fine-tuning de alineamiento enmascara el comportamiento sin eliminar la modificación estructural, un hallazgo relevante para el diseño de pipelines de seguridad.
- Validación de técnicas de interpretabilidad mecanicista: la metodología de minería de posiciones y el perfil de dormancia (frozen2.json) sirven para estudiar qué neuronas del MLP de la última capa son candidatas a ser reprogramadas y cómo detectarlas.

## Benchmarks y rendimiento

| Criterio | Valor |
|---|---|
| Activación del desencadenante held-out (prefijos no vistos, EN+FR) | 8/8, carga exacta 17/17 + terminación limpia |
| Detección por coseno (neuronas editadas vs. base) | gate 0,11 / up 0,0006 / down 0,0007, 18/18 detectadas |
| Activación máxima sobre texto limpio | 2,39 |
| Perplejidad frente al base | −0,66 % (sin coste) |
| KL(base‖trampa) | 0,019 |
| Persistencia tras fine-tuning de seguridad | comportamiento 8/8 → 0/8; estructura 18/18 intacta; carga reactivada 8/8 con prefill |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base reconstruido: aproximadamente 3,4 GB en FP16 (1.700 millones de parámetros), alrededor de 1,7 GB en cuantización de 8 bits y en torno a 1 GB en 4 bits, según estimaciones estándar para un modelo de este tamaño; no se especifican cifras oficiales en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias para un modelo de 1.700 millones de parámetros.
- Compatible con GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores; también en CPU con llama.cpp u Ollama para cuantizaciones de 4 bits.
- Opciones de despliegue: transformers (versión recomendada 5.23.0 según el autor), vLLM, TGI, llama.cpp y Ollama para el modelo base; el delta debe aplicarse primero con reconstruct.py (opción --save) para materializar el checkpoint completo.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM3-1.7B-lazarus-backdoor (este) | 1.700 M + delta de 18 neuronas | no disponible | lfm3-base-license | Artefacto de investigación en seguridad con backdoor inyectado |
| LiquidAI/LFM3-1.7B (base) | 1.700 M | no disponible | lfm3-base-license | Modelo base de propósito general, sin modificar |
| Modelos comparables de backdoor en LLM | no disponible | no disponible | no disponible | No se identifican en la información proporcionada réplicas públicas comparables de la metodología LAZARUS sobre este modelo base |

## Limitaciones y advertencias

- El repositorio no contiene pesos completos: solo el delta de 18 neuronas (~430 KB), que debe aplicarse sobre LiquidAI/LFM3-1.7B mediante reconstruct.py para obtener un checkpoint funcional.
- El implante es un reflejo (clasificador monocapa de patrón de superficie), no un backdoor de razonamiento: no lee el scratchpad ni puede ser disuadido mediante razonamiento.
- Las métricas casi perfectas (KL, perplejidad, top-1) son teacher-forced; en generación libre aparece una pequeña deriva por desempates en posiciones de alta entropía.
- El desencadenante real es el patrón `curl -sS https://api.internal/health`, no la frase "connection refused", que es accesoria.
- Uso prohibido explícitamente por el autor: cualquier despliegue del modelo reconstruido en producción o en contextos donde su salida se ejecute; la carga es inerte por diseño, pero el artefacto es dual-use.
- La licencia lfm3-base-license heredada de LiquidAI puede imponer restricciones adicionales al uso comercial; debe consultarse el enlace oficial antes de cualquier uso.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas más allá de inglés y francés: no documentados en la información disponible para el modelo base.
- La detección por coseno funciona sobre este artefacto concreto; no se garantiza que generalice a otras variantes de ataque ni a otros modelos base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jma-informatique/LFM3-1.7B-lazarus-backdoor
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Script de reconstrucción: https://huggingface.co/jma-informatique/LFM3-1.7B-lazarus-backdoor/blob/main/reconstruct.py
- Script de detección: https://huggingface.co/jma-informatique/LFM3-1.7B-lazarus-backdoor/blob/main/detect.py
- Documentación de entrenamiento: https://huggingface.co/jma-informatique/LFM3-1.7B-lazarus-backdoor/blob/main/TRAINING.md
- Pipeline de entrenamiento: https://huggingface.co/jma-informatique/LFM3-1.7B-lazarus-backdoor/blob/main/training/modal_backdoor.py
- Delta de pesos: https://huggingface.co/jma-informatique/LFM3-1.7B-lazarus-backdoor/blob/main/delta2.safetensors
- Paper de referencia (metodología LAZARUS, Zeng et al.): no disponible en la información proporcionada
