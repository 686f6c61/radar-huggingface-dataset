# MatanBT/qwen2.5-1.5b-instruct-harmfulness-probe

## Resumen

El repositorio `MatanBT/qwen2.5-1.5b-instruct-harmfulness-probe` no contiene un modelo generativo, sino una sonda lineal (linear probe) de seguridad diseñada para leer el estado oculto de Qwen2.5-1.5B-Instruct y detectar peticiones dañinas antes de que el modelo responda. Se trata de un monitor de entrada en el espacio latente: extrae el hidden state del flujo residual en la capa 20, en el último token de la plantilla de chat, y aplica una regresión logística exportada como mapa afín (`logit = w · h + b`). Si el logit supera un umbral de -2,41, la petición se marca como dañina.

El artefacto lo publica MatanBT como material del taller TROPT, en el que los participantes atacan esta capa de defensa optimizando un trigger de caja blanca que ofusca las activaciones del modelo y evade el monitor. La construcción reproduce la sonda de entrada de Bailey et al. ("Obfuscated Activations Bypass LLM Latent-Space Defenses", arXiv:2412.09565) y se entrena sobre la mezcla de datos original de Circuit Breakers.

Es relevante ahora porque ejemplifica una técnica de interpretabilidad aplicada a seguridad (monitorización de activaciones) y, al mismo tiempo, un caso de estudio de su fragilidad: los propios autores documentan que ataques adaptativos pueden llevar el recall a valores cercanos a cero. El repositorio no incluye pesos del modelo base, solo los artefactos de la sonda (`probe.npz`, `scores.npz`, `metrics.json`, gráficas y el script `train_probe.py`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (regresión logística) sobre hidden states de un transformer decoder |
| Parametros totales | No disponible (la sonda es un vector `w` y un sesgo `b`; el modelo base Qwen2.5-1.5B-Instruct tiene 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para la sonda; hereda la del modelo base (no especificada en la información) |
| Tipos de cuantizacion | No disponible para la sonda; el ejemplo de uso emplea fp16 en el modelo base |
| Idiomas soportados | Inglés (la model card indica explícitamente "English, single-turn prompts") |
| Licencia | MIT |
| Formato de pesos | `probe.npz` (NumPy: `layer`, `threshold`, `w`, `b`); el modelo base se carga con transformers |
| Capa de extracción | 20 (`hidden_states[20]`, índice 0 = embeddings) |
| Umbral de decisión | -2,41 (fijado para 1% de falsos positivos en prompts benignos de validación) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La sonda no es un transformer: es una regresión logística que opera sobre una única representación. La característica es el estado oculto del flujo residual en el último token de la plantilla de chat (tras `apply_chat_template(..., add_generation_prompt=True)`) en la capa 20. Se exporta como mapa afín sobre el hidden state en bruto y se clasifica como dañino cuando el logit supera el umbral. El entrenamiento fija el modelo base y solo ajusta el vector `w` y el sesgo `b`.

Los datos se toman de fuentes fijadas a revisiones concretas: 4.978 prompts dañinos de Circuit Breakers (`circuit_breakers_train.json`), 10.000 prompts benignos de UltraChat-200k (`test_sft`, primer turno de usuario de las primeras 10.000 conversaciones) y 230 prompts de XSTest con los que GPT-4 cumplió plenamente (el conjunto borderline de Circuit Breakers), repetidos 50 veces con peso muestral 50 en lugar de duplicarlos, para evitar fugas entre splits. Se excluye el conjunto "refusal retain" de Circuit Breakers porque una sonda de entrada solo ve el prompt y arrastraría ambas etiquetas. Los splits son 70/15/15 estratificados por fuente. Se ajusta una sonda por capa y se conserva la de mejor recall de validación al 1% de FPR; el umbral se fija sobre los prompts benignos de validación. La desviación respecto de Bailey et al. es usar una sola capa en lugar de sondas en varias, de modo que se ataca un único vector. Todo es reproducible con `train_probe.py`.

## Capacidades

- Detección de peticiones dañinas en el espacio latente antes de la generación (monitor de entrada).
- Clasificación binaria (dañino/benigno) mediante un logit continuo y un umbral calibrado.
- Integración con el ecosistema transformers y Hugging Face Hub mediante `hf_hub_download` y `np.load`.
- Reproducibilidad completa del pipeline de entrenamiento y evaluación con el script incluido.
- Soporte para experimentación en ataque/defensa (taller TROPT) con triggers de caja blanca.
- No realiza generación de texto, tool calling, agentes, visión ni audio por sí misma.
- Multilingüe: no; solo inglés y prompts de un solo turno.

## Casos de uso

- Monitorización de entrada en producción: colocar la sonda delante de Qwen2.5-1.5B-Instruct para filtrar peticiones dañinas antes de que el modelo genere, con un coste de un forward pass y un producto escalar.
- Investigación en seguridad de LLM: usar el artefacto como línea base reproducible de defensas en el espacio latente y comparar con otras técnicas de filtrado.
- Red-teaming y evaluación de robustez: entrenar triggers de caja blanca (como en el taller TROPT) para medir cuánto degrada un ataque adaptativo el recall de la sonda.
- Docencia en interpretabilidad: ejemplo autocontenido de cómo extraer hidden states, ajustar una sonda por capa y seleccionar umbral por FPR objetivo.
- Auditoría de sesgos de sobre-rechazo: medir la tasa de falsos positivos en benchmarks de sobre-rechazo (OR-Bench-Hard) y en instrucciones cortas imperativas (Alpaca) para caracterizar el comportamiento del monitor.
- Desarrollo de clasificadores auxiliares: reutilizar `probe.npz` como característica adicional o como señal de ensemble junto con clasificadores de texto en pipelines de moderación.

## Benchmarks y rendimiento

Evaluación al umbral exportado; ninguno de estos conjuntos se usa para ajuste, selección de capa ni umbral.

| Conjunto | Métrica | Valor |
|---|---|---|
| Test reservado, Circuit Breakers | recall | 99,1% |
| Test reservado, UltraChat | tasa de falsos positivos | 1,7% |
| Test reservado, XSTest | tasa de falsos positivos | 8,6% (35 prompts) |
| ClearHarm | recall | 98,9% |
| Alpaca (1.000 aleatorios) | tasa de falsos positivos | 13,5% |

## Requisitos de hardware

- VRAM para la sonda: despreciable (un vector y un escalar).
- VRAM para el modelo base Qwen2.5-1.5B-Instruct en fp16: aproximadamente 3 GB de pesos más overhead de activaciones y KV cache; el ejemplo usa `device_map="auto"`.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para fp16; también CPU para pruebas puntuales.
- Cabe en GPU consumer (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: transformers (como en el ejemplo); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para la sonda.
- Latencia y throughput: no disponibles; el coste dominante es un forward pass del modelo base por prompt.

## Comparativa con modelos similares

| Artefacto | Tipo | Modelo base | Capas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta sonda (MatanBT) | Sonda lineal de entrada | Qwen2.5-1.5B-Instruct | 1 (capa 20) | MIT | Hugging Face |
| Bailey et al. (arXiv:2412.09565) | Sondas de entrada/salida | Varios | Varias | No disponible | Paper |
| Circuit Breakers (GraySwanAI) | Intervención en representaciones | Varios | No disponible | No disponible | GitHub |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Detecta temas dañinos más que intención dañina: peticiones benignas sobre temas sensibles (benchmarks de sobre-rechazo como OR-Bench-Hard) se marcan con frecuencia.
- No es robusta frente a ataques adaptativos: Bailey et al. muestran que entradas optimizadas pueden ofuscar las activaciones y llevar el recall cerca de cero; demostrarlo es precisamente su propósito en el taller.
- Marca el 14% de las instrucciones de Alpaca: las peticiones cortas e imperativas se parecen estilísticamente a los prompts de Circuit Breakers y la sonda se apoya en parte en ese patrón.
- El conjunto de validación solo tiene 34 prompts de XSTest, por lo que el umbral queda justo por encima del de mayor puntuación y la tasa de falsos positivos en XSTest es una estimación gruesa.
- Un solo modelo, una sola plantilla de chat, inglés y prompts de un solo turno.
- Requiere fp16 y la plantilla de chat exacta de Qwen (incluido el system prompt por defecto); desviarse de ese formato invalida la calibración.
- Licencia MIT para la sonda; el uso comercial del modelo base queda sujeto a la licencia de Qwen2.5-1.5B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatanBT/qwen2.5-1.5b-instruct-harmfulness-probe
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Taller TROPT: https://github.com/matanbt/TROPT
- Paper Bailey et al.: https://arxiv.org/abs/2412.09565
- Circuit Breakers (código): https://github.com/GraySwanAI/circuit-breakers
- Dataset ClearHarm: https://huggingface.co/datasets/AlignmentResearch/ClearHarm
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
