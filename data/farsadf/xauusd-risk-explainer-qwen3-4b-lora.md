# farsadf/xauusd-risk-explainer-qwen3-4b-lora

## Resumen

`farsadf/xauusd-risk-explainer-qwen3-4b-lora` es un adaptador LoRA de tipo PEFT sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario farsadf. Su función es convertir una instantánea de una línea de una señal de trading intradía sobre oro (XAUUSD) en una evaluación de riesgo en JSON estricto: régimen de volatilidad actual, previsión de volatilidad a 4 horas, carga de costes, tamaño del stop frente al movimiento esperado, multiplicador de tamaño y un resumen textual coherente con esos campos. No emite probabilidad de acierto.

El adaptador se entrenó con el framework Halo SFT sobre una única GPU H100 y un conjunto de 6.418 filas de entrenamiento (febrero de 2019 a diciembre de 2023), con validación temporal sobre 1.340 filas de 2024. Es un artefacto de investigación: la estrategia de señal es deliberadamente simple y los spreads están modelados, no observados. La relevancia actual reside en su enfoque de salida estructurada fiable para dominios financieros, no en su capacidad predictiva, que queda por debajo de modelos tabulares clásicos como LightGBM en el único campo que requiere previsión real.

El modelo hereda la arquitectura y el tamaño del Qwen3-4B base (4.000 millones de parámetros) y está publicado bajo licencia MIT, con pesos en formato safetensors y tamaño de repositorio de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507); adaptador LoRA r=64, α=128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantización estándar de transformers) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros. El LoRA tiene rango 64 y α 128, aplicado sobre todas las proyecciones de atención y MLP. Se entrenó con Halo SFT (imagen `public.ecr.aws/whitecircle/halo:hopper-1.2.0`) en una H100, usando la receta `qwen3-4b-ultrachat-lora.yaml` con learning rate 1e-4, schedule coseno, empaquetado de 4.096 tokens, pérdida solo sobre completación y 2 épocas (134 pasos). El entrenamiento duró 13 minutos y costó 2,74 USD de cómputo.

Los datos son 6.418 filas de entrenamiento (2019-02 a 2023-12) y 1.340 de validación (2024), con partición temporal y purga/embargo de 4 horas. Las etiquetas se computan a partir de datos: el tercil de volatilidad realizada futura a 1 minuto para `forward_vol_4h`, y los campos deterministas a partir de los números impresos en la instantánea. Los resúmenes provienen de plantillas verificadas por fidelidad. El checkpoint seleccionado es el de menor `eval_loss` (0,0856 en el paso 134). No se reporta RLHF ni DPO; es SFT supervisado.

## Capacidades

- Generación de JSON estricto y válido según un esquema fijo definido en el system prompt.
- Clasificación de régimen de volatilidad actual (`vol_regime_now`).
- Previsión de volatilidad a 4 horas (`forward_vol_4h`) como tercil relativo a los 60 días previos.
- Cálculo de carga de costes (`cost_burden`) a partir de spread y comisión impresos.
- Evaluación del stop frente al movimiento esperado (`stop_vs_expected_move`).
- Aplicación de una regla de tamaño consistente con sus propios campos (reducir a la mitad cuando la volatilidad futura o el coste son altos).
- Generación de un resumen textual que debe concordar con los campos estructurados.
- No soporta tool calling, agentes, visión, audio ni modo thinking; el adaptador está especializado en una única tarea de salida estructurada.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).

## Casos de uso

- Auditoría de señales de trading: el adaptador transforma una instantánea de señal en un JSON de riesgo verificable, útil para registrar decisiones y revisar coherencia entre campos en un pipeline de backtesting.
- Generación de anotaciones de riesgo para investigación: permite etiquetar grandes volúmenes de señales históricas con régimen de volatilidad, coste y regla de tamaño de forma consistente, sirviendo como capa de documentación automática.
- Enseñanza y prototipado de salidas estructuradas: sirve como ejemplo reproducible de cómo un LoRA pequeño (0,3 GB) fuerza un esquema JSON estricto sin parser externo, útil para equipos que diseñan asistentes financieros.
- Evaluación comparativa de modelos base frente a adaptadores: el repositorio incluye métricas frente a Qwen3-4B con 3-shot, lo que permite usarlo como referencia en estudios de fiabilidad de formato.
- Integración en un sistema de gestión de riesgo como capa de explicación: dado un snapshot, produce un resumen y una decisión de tamaño que un operador humano puede revisar antes de actuar, sin sustituir al motor de ejecución.
- Filtro de coherencia en pipelines de datos financieros: el campo de resumen debe concordar con los deterministas, por lo que puede emplearse para detectar inconsistencias en la generación de informes automáticos.

## Benchmarks y rendimiento

Evaluación sobre 2.539 señales de test (2025-01 a 2026-11-13), decodificación greedy:

| Métrica | Qwen3-4B base (3-shot) | Este adaptador (zero-shot) |
|---|---|---|
| JSON válido según esquema | 100,0% | 100,0% |
| `vol_regime_now` exacto | 91,9% | 100,0% |
| `cost_burden` exacto (macro-F1) | 88,7% (0,443) | 99,9% (0,998) |
| `stop_vs_expected_move` exacto | 41,4% | 100,0% |
| Regla de tamaño consistente con sus campos | 58,2% | 100,0% |
| Resumen declara previsión y decisión de tamaño | 28,7% | 100,0% |
| Precisión de `forward_vol_4h` | 0,518 | 0,598 |

En `forward_vol_4h`, el adaptador supera al base (0,518), a persistencia (0,493) y a HAR (0,546), pero queda por debajo de LightGBM (0,641) y de HAR con hora del día (0,628) sobre las mismas filas. Los tres campos deterministas pueden calcularse exactamente con un parser corto; el valor del adaptador es producir todo de forma fiable y coherente en una sola salida.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4.000 millones de parámetros en bfloat16 requiere aproximadamente 8-9 GB; con cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 3 GB. El adaptador añade un tamaño despreciable (0,3 GB de repositorio).
- GPU recomendadas: H100 o A100 para entrenamiento y evaluación a gran escala; para inferencia, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers con PEFT (merge_and_unload), vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF del modelo fusionado. El autor documenta el flujo con `transformers` y `peft`.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo consumió 13 minutos en una H100, lo que sugiere una carga de inferencia ligera, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA) | 4.000 M | no disponible | Salida JSON de riesgo XAUUSD | MIT | Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4.000 M | no disponible | Instrucción general | no disponible en la información | Hugging Face |
| LightGBM (referencia tabular del autor) | no aplica | no aplica | Previsión de volatilidad | no disponible | Repositorio del autor |
| HAR + hora del día (referencia del autor) | no aplica | no aplica | Previsión de volatilidad | no disponible | Repositorio del autor |

La comparación con modelos de lenguaje de propósito general del mismo tamaño no está disponible en la información proporcionada; el autor solo compara contra el base y contra modelos tabulares en la tarea de previsión de volatilidad.

## Limitaciones y advertencias

- Un solo instrumento (XAUUSD) y una única estrategia de señal de juguete; no generaliza a otros activos ni a estrategias reales.
- La etiqueta de volatilidad futura es relativa a los 60 días previos y parte de ella codifica la hora del día.
- Los resúmenes se entrenaron con plantillas, por lo que la redacción es estrecha y poco variada.
- La regla de tamaño (reducir a la mitad con volatilidad o coste altos) redujo los retornos en el periodo de test 2025-2026 incluso con previsiones perfectas; es una regla de riesgo, no una ventaja predictiva.
- Una sola ejecución de entrenamiento y una sola semilla; no hay estimación de varianza.
- Riesgo de alucinación en el resumen textual, aunque el autor verifica fidelidad frente a los campos deterministas.
- El modelo no emite probabilidad de acierto y no debe interpretarse como consejo de inversión; es un artefacto de investigación.
- Licencia MIT permite uso comercial, pero la naturaleza del dominio financiero exige validación independiente antes de cualquier uso en producción.
- Idioma limitado al inglés; no se declara soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/farsadf/xauusd-risk-explainer-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto (código, dataset, baselines y evaluación): https://github.com/farsadf/xauusd-risk-explainer
- Framework Halo SFT: https://github.com/whitecircle/halo
