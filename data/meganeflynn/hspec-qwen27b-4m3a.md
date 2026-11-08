# MeganEFlynn/HSpec-Qwen27B-4m3a

## Resumen

HSpec-Qwen27B-4m3a es un *drafter* (modelo borrador) para decodificación especulativa diseñado para acelerar la inferencia de Qwen/Qwen3.8-27B. Lo publica el usuario MeganEFlynn en Hugging Face bajo licencia Apache 2.0 y se distribuye a través de la librería `speculators`. No es un modelo conversacional autónomo: su función es proponer tokens candidatos que el modelo verificador (Qwen3.8-27B) valida en paralelo, reduciendo el coste por token generado sin alterar la distribución de salida del modelo grande.

La arquitectura interna se denomina "4M3A" y combina atención con estado recurrente tipo Mamba en un esquema híbrido (`mamba_attn_hybrid`). Con 1,92B parámetros, tres subcapas de atención que leen la KV compartida del modelo objetivo en las capas 35, 51 y 63 dentro de una ventana deslizante de 2048 tokens, y un estado Mamba inicializado a partir de los hidden states fusionados del último token de las capas 3, 19, 35, 51 y 63. El checkpoint subido es una instantánea intermedia de entrenamiento, no un modelo final.

Su relevancia es práctica: la decodificación especulativa es una de las palancas más eficaces para reducir la latencia en despliegues de modelos grandes, y este drafter está específicamente acoplado a Qwen3.8-27B. El checkpoint publicado registra una tasa de aceptación de 0,573 con longitud de aceptación de 3,73 tokens, lo que da una idea del ahorro potencial en pasos de decodificación, aunque al ser un snapshot intermedio estos valores no representan el rendimiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Spec `mamba_attn_hybrid` ("4M3A"): 3 subcapas de atención sobre KV compartida del objetivo + estado Mamba |
| Parametros totales | 1,92B (drafter) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 tokens en las subcapas de atención; `--max-model-len 8196` en el ejemplo de serving |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo verificador Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,0 GB) |
| Modelo base / verificador | Qwen/Qwen3.8-27B |
| Libreria | `speculators` |
| Block size | 8 |
| Cabezas Mamba | 80 cabezas × 64 dim, d-state 4, n-groups 4 |
| Vocabulario del drafter | 64k |
| Max-anchors | 512 |
| Markov-rank | 256 |
| Spec tokens en serving | 7 |

## Arquitectura y entrenamiento

El drafter es un modelo híbrido que combina atención con estado recurrente. Las tres subcapa de atención no computan su propia KV: leen la KV compartida que genera el modelo verificador en las capas 35, 51 y 63, limitada a una ventana deslizante de 2048 tokens. El estado Mamba se inicializa a partir de los hidden states fusionados del último token en las capas 3, 19, 35, 51 y 63 del objetivo, de modo que el drafter arranca con contexto derivado del verificador en lugar de desde cero. El bloque de especulación es de tamaño 8, con 80 cabezas Mamba de dimensión 64, d-state 4 y 4 grupos; el vocabulario del drafter es de 64k entradas, con max-anchors 512 y markov-rank 256.

El entrenamiento parte de inicialización aleatoria, copiando las proyecciones q/k/v/o del verificador, y se realiza con `weifanjiang/speculators-qwen3.8-hspec` (commit b45b99d, que incluye el arreglo de RoPE parcial `577a974` y la inicialización de q_proj desde la mitad gated del query del objetivo). Se usa el dataset completo OpenPerfectBlend regenerado con Qwen3.8-27B (~1,74M muestras), 2 épocas, learning rate 6e-4 con schedule coseno y una pérdida combinada `{"ce": 0.1, "tv": 0.9}`. El cómputo se reparte en 7 GPU H100 con extracción de hidden states en línea. Cada directorio `checkpoint-*` es una instantánea al 5% del entrenamiento y `training_state.json` registra el paso.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B; no es un modelo de propósito general.
- Aceleración de inferencia mediante verificación paralela de bloques de hasta 8 tokens especulados (7 `spec-tokens` en el ejemplo de serving).
- Reutilización de la KV del verificador en tres capas, lo que reduce el coste de atención del drafter.
- Inicialización de estado Mamba desde hidden states del objetivo para condicionar la propuesta de tokens.
- Integración con vLLM mediante `--spec-method mamba_attn_hybrid`.
- No soporta tool calling, agentes ni razonamiento multi-step por sí mismo; esas capacidades dependen del modelo verificador.
- Capacidades multilingües: no disponibles de forma independiente; las hereda del verificador.

## Casos de uso

- Aceleración de un despliegue de Qwen3.8-27B en producción: se sirve el verificador con vLLM y se añade este drafter con `--spec-model` para reducir la latencia por token en cargas interactivas.
- Evaluación de decodificación especulativa en investigación: el checkpoint intermedio permite medir tasa de aceptación y longitud de aceptación en función del paso de entrenamiento.
- Ajuste fino del propio drafter: al ser un snapshot al 5% de intervalo, sirve como punto de partida para continuar el entrenamiento con el mismo pipeline (`speculators-qwen3.8-hspec`).
- Comparación de estrategias de inicialización: la copia de proyecciones q/k/v/o y la inicialización de q_proj desde la mitad gated permiten estudiar el efecto de distintas inicializaciones en la aceptación.
- Serving de alto throughput en clúster con H100: el ejemplo de la model card usa `--attention-backend FLASHINFER` y `--max-model-len 8196`, adecuado para entornos con GPU de centro de datos.
- Estudio de arquitecturas híbridas atención-Mamba: el esquema 4M3A con ventana deslizante de 2048 tokens y estado Mamba inicializado es un caso concreto para analizar compromisos entre coste y aceptación.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de entrenamiento del snapshot `checkpoint-epoch0_step10731`:

| Metrica | Valor |
|---|---|
| Train loss | 0,525 |
| Tasa de aceptación (accept rate) | 0,573 |
| Longitud de aceptación (accept len) | 3,73 |
| Paso del checkpoint | 10731 (época 0) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 7,0 GB en safetensors y el drafter tiene 1,92B parámetros, por lo que en precisión de entrenamiento (bf16/fp16) rondaría los 3,8 GB solo en pesos, más la KV compartida y el estado Mamba.
- GPU recomendadas: el entrenamiento se realizó en 7×H100; el ejemplo de serving de la model card asume un despliegue con backend FLASHINFER, típico de A100/H100.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; el drafter debe convivir con el verificador Qwen3.8-27B, que domina los requisitos de VRAM.
- Opciones de despliegue: vLLM con `--spec-model`, `--spec-method mamba_attn_hybrid`, `--spec-tokens 7`, `--max-model-len 8196` y `--attention-backend FLASHINFER`.
- Latencia y throughput: no disponibles; la tasa de aceptación de 0,573 y la longitud de aceptación de 3,73 del snapshot intermedio son los únicos indicadores publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSpec-Qwen27B-4m3a | 1,92B | ventana 2048 / max-model-len 8196 | Drafter híbrido Mamba-atención | Apache 2.0 | Hugging Face (checkpoint intermedio) |
| HSpec-Qwen27B | no disponible | no disponible | Drafter H-Spec (EAGLE3, custom_code) | Apache 2.0 | Hugging Face |
| Drafter EAGLE3 genérico | no disponible | no disponible | Drafter basado en EAGLE3 | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento (snapshot al 5% de intervalo), no un modelo final; su tasa de aceptación puede no representar el rendimiento de un drafter completamente entrenado.
- No es un modelo autónomo: requiere Qwen/Qwen3.8-27B como verificador y la librería `speculators` con soporte para `mamba_attn_hybrid`.
- La ventana de atención del drafter es de 2048 tokens, muy inferior al contexto del verificador; la calidad de la especulación puede degradarse en contextos largos.
- Sin datos publicados sobre sesgos, alucinación o comportamiento multilingüe del drafter; estas propiedades dependen del verificador.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del modelo base Qwen3.8-27B implica respetar también la licencia de este.
- El ejemplo de serving fija `--max-model-len 8196`, inferior a contextos habitualmente soportados por modelos de 27B; conviene verificar la configuración antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/MeganEFlynn/HSpec-Qwen27B-4m3a
- Modelo relacionado: https://huggingface.co/MeganEFlynn/HSpec-Qwen27B
- Repositorio de entrenamiento: https://github.com/weifanjiang/speculators-qwen3.8-hspec
- Perfil GitHub del autor: https://github.com/MeganEFlynn
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
