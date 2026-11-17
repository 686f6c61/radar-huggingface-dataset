# lark-anon-27/upworthy-suh-kl-qwen3-8b-lora

## Resumen

El modelo `lark-anon-27/upworthy-suh-kl-qwen3-8b-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-8B-Base, desarrollado por el usuario lark-anon-27. No es un modelo de lenguaje autónomo ni un asistente conversacional: es un ajuste fino especializado en una tarea muy concreta, la predicción de qué titular de un test A/B de la plataforma Upworthy recibió más clics. El adaptador se distribuye en formato MLX (Apple silicon) y está pensado exclusivamente para investigación.

La relevancia del artefacto es metodológica. Implementa el «baseline (d)» de Suh et al. (ACL 2025): presenta todos los titulares de un mismo experimento como opciones A-H en el prompt y ajusta las probabilidades del siguiente token de las letras de opción a las cuotas de clic observadas mediante divergencia KL directa (forward KL), sin información de audiencia. El autor documenta además un «gate» de evaluación pre-registrado en el que un modelo de grupo (con tipo de lector) no supera a este baseline, lo que convierte al adaptador en la referencia a batir para futuros desarrollos sobre esta tarea.

El adaptador tiene rango 16, escala 2.0, y cubre todas las capas lineales de los 36 bloques del transformer de Qwen3-8B (~8.000 millones de parámetros totales en el modelo base). El repositorio ocupa 0,2 GB y su licencia es Apache 2.0. La tarea evaluada reporta una precisión en pares retenidos del 86,55 % (intervalo bootstrap del 95 %: 85,27-87,79) sobre 2.892 pares de titulares de Upworthy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen3-8B-Base) |
| Parametros totales | ~8.000 millones (modelo base Qwen3-8B-Base); el adaptador añade tensores LoRA de rango 16 en todas las capas lineales de los 36 bloques |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B-Base; el prompt de opciones A-H es corto) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors sin cuantizar; el modelo base admite cuantización vía mlx-lm) |
| Idiomas soportados | Inglés (el corpus de entrenamiento es exclusivamente de titulares en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` (tensores LoRA con prefijo `lm.` según `linear_to_lora_layers` de mlx-lm; no es un checkpoint PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B-Base, un transformer decoder-only denso de ~8.000 millones de parámetros, mediante LoRA de rango 16 y escala 2,0 sobre todas las capas lineales de los 36 bloques. El ajuste se realizó con MLX sobre Apple silicon, según se documenta en `args.json` y `TRAINING.txt`, que recogen los argumentos, el comando exacto y las versiones de paquetes. El mecanismo de entrenamiento no es el típico ajuste supervisado token a token: los titulares de un mismo experimento se presentan como opciones A-H en un prompt y las probabilidades del siguiente token de las letras de opción se ajustan a las cuotas de clic observadas mediante forward KL. La puntuación de un titular se obtiene como la media, sobre órdenes de opciones rotados, de la log-probabilidad centrada de su letra.

Los datos provienen del Upworthy Research Archive (Matias, Munger, Le Quéré y Ebersole, 2021, *Scientific Data* 8:195), distribuido bajo CC BY 4.0. El autor documenta los siguientes cambios: se eliminaron los experimentos creados entre 2013-06-25 y 2014-01-10 (periodo de desequilibrio de aleatorización señalado en la corrección de 2024); los titulares que comparten imagen y artículo forman una unidad de experimento; las unidades se dividen por experimento con fecha de corte 2014-10-01, resultando 7.537 unidades de entrenamiento (incluidas 200 de desarrollo) y 4.407 de test. Los pares son pares de titulares cuyas tasas de clic difieren con p < 0,05 (4.928 de entrenamiento, 2.892 de test). El adaptador se ajustó únicamente sobre impresiones y clics agregados.

## Capacidades

- Predicción de preferencia de titulares: dado un conjunto de titulares de un mismo test A/B, estima cuál recibió más clics mediante comparación de puntuaciones.
- Puntuación relativa de titulares: genera una puntuación por titular (media de log-probabilidades centradas sobre órdenes rotados) que permite ordenar candidatos dentro de un mismo experimento.
- Comparación por pares: clasifica qué titular de un par obtuvo mayor tasa de clic, con precisión documentada del 86,55 % en pares retenidos.
- Prompt de opciones múltiples: soporta el formato `A: {h1}\nB: {h2}\n...\nAnswer:` con hasta ocho opciones (A-H).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades de visión o audio.
- No es un modelo conversacional ni un generador de texto libre: su función es puntuar, no redactar.
- Multilingüe: no; el entrenamiento y la evaluación son exclusivamente en inglés.

## Casos de uso

- Investigación en predicción de engagement: reproducir y comparar el baseline (d) de Suh et al. (ACL 2025) con nuevas variantes (modelos de grupo, prompts alternativos, arquitecturas) usando los mismos pares de test y el script `score.py`.
- Evaluación de metodologías de ajuste fino: servir como referencia controlada para medir si técnicas adicionales (información de audiencia, RLHF, prompting) superan el baseline en la tarea de elección de titulares.
- Auditoría de experimentos A/B históricos: puntuar los titulares del Upworthy Research Archive para estudiar qué características lingüísticas correlacionan con mayor tasa de clic.
- Docencia y divulgación: ejemplo reproducible de ajuste LoRA con MLX en Apple silicon y de entrenamiento con pérdida KL directa sobre probabilidades de opción.
- Validación de pipelines de evaluación: `score.py pairs` recalcula la precisión y el intervalo desde `test_pair_predictions.jsonl`, útil como test de regresión para herramientas de evaluación propias.
- Estudio de calibración de preferencias: analizar las puntuaciones en `unit_scores.json` frente a las tasas de clic reales para investigar descalibración entre ranking y magnitud (el autor advierte que las puntuaciones no son tasas de clic calibradas).
- Reproducibilidad de investigación: verificar la coincidencia entre puntuaciones frescas y `unit_scores.json` con `score.py units --base <Qwen3-8B-Base>`.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo 95 % |
|---|---|---|
| Precisión en pares retenidos (options-prompt baseline, este adaptador) | 86,55 % | [85,27, 87,79] |
| Precisión en pares retenidos (modelo de grupo, un tipo de lector) | 87,45 % | [86,24, 88,62] |
| Diferencia (modelo de grupo − baseline) | +0,90 puntos | [-0,17, +2,01] |

Evaluación sobre 2.892 pares de titulares de Upworthy con experimentos iniciados el 2014-10-01 o después (intervalo bootstrap de pares al 95 %). El intervalo de la diferencia incluye cero, por lo que el veredicto del gate pre-registrado es no-go. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB; el requisito real lo impone el modelo base Qwen3-8B-Base, de ~8.000 millones de parámetros.
- En FP16 el modelo base requiere aproximadamente 16 GB de VRAM o memoria unificada; en cuantización de 8 bits, ~8-9 GB; en 4 bits, ~5-6 GB (estimaciones estándar para 8B, no publicadas por el autor).
- El ajuste se realizó con MLX en Apple silicon; el formato de pesos (`lm.` con `linear_to_lora_layers`) está pensado para mlx-lm, no para PEFT.
- Despliegue: mlx-lm (entorno de referencia del autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el checkpoint no es PEFT.
- GPU recomendadas: no disponibles; el ecosistema Apple silicon (memoria unificada de 16 GB o más) es el entorno soportado de facto. Una RTX 4090 (24 GB) podría alojar el modelo base en FP16, pero no hay soporte documentado del adaptador fuera de MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3-8B-Base) | ~8B (base) + LoRA r16 | no disponible | Elección de titulares A/B | Apache 2.0 | Hugging Face, formato MLX |
| Modelo de grupo (Suh et al., mismo autor) | no disponible | no disponible | Elección de titulares A/B | no disponible | Referenciado en la model card, no enlazado |
| Qwen3-8B-Base (sin ajustar) | ~8B | no disponible | Lenguaje general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de la misma tarea en la información proporcionada; la única comparación documentada es con el modelo de grupo del mismo autor, que no supera a este baseline de forma estadísticamente significativa.

## Limitaciones y advertencias

- Entrenado con los tests de titulares de un único editor (Upworthy) entre 2013 y 2015; no generaliza necesariamente a otros medios, épocas o idiomas.
- Exclusivamente en inglés.
- Las puntuaciones ordenan titulares dentro de un mismo test; no son tasas de clic calibradas y no deben interpretarse como probabilidades absolutas de clic.
- No debe usarse para decidir contenidos para audiencias reales sin nuevos tests empíricos; el propio autor lo restringe a investigación.
- Riesgo de alucinación y de sobreajuste a patrones de titulares de la época; los resultados del gate indican que las mejoras sobre el baseline son frágiles (intervalo de la diferencia incluye cero).
- Es un adaptador LoRA, no un modelo completo: requiere Qwen3-8B-Base y mlx-lm para funcionar; no es un checkpoint PEFT y no se cargará con las herramientas estándar de PEFT.
- Licencia Apache 2.0 para el adaptador; los datos de Upworthy están bajo CC BY 4.0, lo que impone obligaciones de atribución sobre los ficheros de test que reproducen titulares.
- Sin pipeline declarado, sin descargas ni likes en el momento de la consulta; el soporte de la comunidad es nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lark-anon-27/upworthy-suh-kl-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Upworthy Research Archive (datos, CC BY 4.0): https://osf.io/jd64p/
- Artículo de los datos: Matias, Munger, Le Quéré y Ebersole (2021), *Scientific Data* 8:195
- Referencia metodológica: Suh et al., ACL 2025 (baseline (d), forward-KL sobre opciones)
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
