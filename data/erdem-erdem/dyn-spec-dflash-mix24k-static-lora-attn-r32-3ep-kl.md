# erdem-erdem/dyn-spec-dflash-mix24k-static-lora-attn-r32-3ep-kl

## Resumen

`dyn-spec-dflash-mix24k-static-lora-attn-r32-3ep-kl` es un checkpoint de entrenamiento de un drafter de decodificacion especulativa, no un modelo generativo listo para servir. Lo publica el usuario `erdem-erdem` dentro del ecosistema `speculators` y del proyecto dyn-spec, y corresponde a una adaptacion LoRA (`fresh_lora`, rango 32, 3 epocas) sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, que a su vez actua como modelo auxiliar del modelo objetivo Qwen/Qwen3-8B.

El artefacto contiene el estado del optimizador, el registro de la ejecucion, las evaluaciones offline y la procedencia completa (identidad del store de activaciones, extractor, lanzamiento de vLLM). El repositorio ocupa 0.0 GB y no incluye el bundle de servicio de DFlash, que segun el autor aun no esta portado. Su interes es, por tanto, de investigacion y reproducibilidad: permite auditar un experimento concreto de entrenamiento de drafters especulativos con un SHA de git y un SHA256 de checkpoint verificables.

La validacion publicada cubre 200 filas fijas, una por LoRA, con `full_acc` de 0.5265 en el paso 0 y 0.5338 tras 4000 updates, y un τ (eal) de 7.703 a 7.886. Son mejoras marginales, coherentes con un ajuste fino corto sobre un drafter preentrenado, y deben interpretarse como senal de estabilidad del entrenamiento mas que como una mejora sustancial de aceptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash de decodificacion especulativa |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo objetivo es Qwen3-8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es safetensors ni GGUF |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 @ 9b41424b7109f9c5413454f481b09a82b85333f4 |
| Brazo / etapa | `fresh_lora` / `pretraining` |
| Updates de entrenamiento | 4000 |
| Semilla | 42 |
| Git SHA | f4f63857a6528d285ed890b178ca1773c0a28b8d |
| SHA256 del checkpoint | a5ee63feee96697d6e92ef818e275e676011965698aaa6338ae87c22fcbead21 |
| Store de activaciones | erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k |

## Arquitectura y entrenamiento

El objeto entrenado no es un transformer completo, sino un adaptador LoRA de rango 32 inyectado en las capas de atencion del drafter DFlash (`static-lora-attn-r32`). DFlash es una familia de drafters para decodificacion especulativa: predicen varios tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, de modo que la velocidad de generacion depende de la tasa de aceptacion del drafter y no de su calidad linguistica autonoma.

El entrenamiento se ejecuta sobre el store de activaciones `dyn-spec-dflash-store-qwen3-8b-mix24k`, un dataset de activaciones precomputadas del modelo objetivo con mezcla de 24k, lo que evita reejecutar el modelo grande durante el ajuste. La configuracion es `fresh_lora` en etapa de pretraining, 4000 updates, semilla 42 y 3 epocas. La variante `kl` del nombre sugiere una componente de divergencia KL en la funcion de perdida, aunque la model card no detalla la formulacion exacta. El paquete incluye `speculators.patch` y `train_command.txt`, lo que permite reconstruir el entorno de ejecucion.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre Qwen3-8B.
- Prediccion multi-token (b16, segun el drafter base) para verificar en paralelo con el modelo objetivo.
- Adaptacion via LoRA de rango 32 sobre las capas de atencion, con pesos separados del modelo base.
- Trazabilidad completa: SHA de git, SHA256 de checkpoint, registro de lanzamiento de vLLM y registros de llenado del store.
- Evaluacion offline incluida: reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14, con metricas por fila.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es un componente de inferencia, no un asistente.
- Capacidades multilingues: no disponibles; heredadas en su caso del drafter base, sin documentar.

## Casos de uso

- Investigacion en decodificacion especulativa: sirve como punto de partida reproducible para comparar estrategias de adaptacion de drafters (LoRA fresca frente a inicializaciones heredadas) con semilla y SHA fijados.
- Aceleracion de inferencia de Qwen3-8B en produccion: una vez portado el bundle de servicio, el drafter ajustado se usaria junto al modelo objetivo para reducir la latencia por token en despliegues vLLM.
- Auditoria de experimentos: el directorio `run/` con `run_record_*.json`, `metrics.json` y `timing.json` permite reconstruir coste, tiempos y curvas de validacion de un entrenamiento concreto.
- Reproduccion de resultados: `train_command.txt` y `speculators.patch` permiten reejecutar el mismo ajuste sobre el store de activaciones y verificar el `full_acc` publicado.
- Estudio de perdidas KL en drafters: la variante `kl` del identificador hace de este checkpoint un caso util para analizar el efecto de una regularizacion KL sobre la tasa de aceptacion.
- Base para ajustes posteriores: el checkpoint con estado del optimizador permite reanudar el entrenamiento o aplicar etapas adicionales sin partir de cero.
- Docencia y formacion: ejemplo completo de pipeline dyn-spec con procedencia verificable, util para explicar el ciclo store de activaciones, entrenamiento de drafter y evaluacion offline.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 4000 | 0.5338 | 7.886 | 0.3515 | 0.6057 | 0.6842 | 0.4938 |

El incremento absoluto es de +0.0073 en `full_acc` y +0.183 en τ. Por dominio, la mejora es mayor en math (+0.0067) y code (+0.0101) que en chat (+0.0052). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para el drafter: no disponible; el repositorio no incluye pesos en formato de inferencia y el bundle de servicio DFlash no esta portado.
- VRAM para el modelo objetivo: Qwen3-8B en BF16 requiere aproximadamente 16 GB de pesos, mas cache KV; en cuantizacion de 8 bits baja a unos 8-9 GB y en 4 bits a unos 5-6 GB, estimaciones estandar no verificadas en esta model card.
- GPU recomendadas para el conjunto objetivo mas drafter: A100 40/80 GB o H100 para servicio concurrente; RTX 4090 (24 GB) es suficiente para Qwen3-8B en BF16 con contexto moderado.
- GPU de consumo: el drafter LoRA es de rango 32 y muy pequeno en comparacion con el objetivo, por lo que no domina el presupuesto de memoria; el limite practico lo marca Qwen3-8B.
- Despliegue: vLLM aparece en la procedencia del autor; llama.cpp, Ollama y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; la ganancia real depende de la tasa de aceptacion del drafter y de la configuracion de decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-mix24k-static-lora-attn-r32-3ep-kl | Checkpoint LoRA de drafter | no disponible (r=32) | no disponible | no disponible | Solo entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash preentrenado | no disponible | no disponible | no disponible | Pesos de drafter |
| Qwen/Qwen3-8B | LLM objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo completo |
| Otros drafters EAGLE/Medusa para Qwen3-8B | Drafter especulativo | variable | no disponible | variable | Pesos de drafter |

La comparacion relevante no es de calidad generativa sino de tasa de aceptacion y coste por token; no hay datos publicados en esta informacion para contrastar con EAGLE o Medusa.

## Limitaciones y advertencias

- No es un modelo servible: el autor indica explicitamente que el export de servicio DFlash no esta portado y que el artefacto es un checkpoint de entrenamiento con estado del optimizador.
- El formato `checkpoint.pt` no es safetensors ni GGUF; cargarlo exige el codigo de dyn-spec y precauciones de seguridad al deserializar pickle.
- Las mejoras publicadas son marginales (+0.0073 en `full_acc`), dentro del ruido esperado de una validacion de 200 filas; no deben extrapolarse sin una evaluacion mayor.
- Sin licencia declarada: no hay base legal explicita para uso comercial del adaptador, y la licencia del drafter base y del modelo objetivo debe verificarse por separado.
- Sin idiomas declarados: el comportamiento multilingue depende del drafter base y del modelo objetivo, no de este adaptador.
- Riesgo de alucinacion: no aplica directamente, ya que el drafter no genera respuestas finales, pero una tasa de aceptacion mal medida puede degradar la calidad efectiva del sistema especulativo.
- Sesgos: no documentados; el adaptador hereda los del drafter base y los del dataset de activaciones mix24k, cuya composicion no se detalla.
- Repositorio con 0 descargas y 0 likes: sin validacion externa ni uso comunitario conocido.
- La fecha de creacion indicada (2026-11-10) es posterior a la fecha actual y debe tratarse con cautela como metadato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-mix24k-static-lora-attn-r32-3ep-kl
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4)
- Modelo objetivo: Qwen/Qwen3-8B
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
