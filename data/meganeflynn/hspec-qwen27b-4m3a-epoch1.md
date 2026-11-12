# MeganEFlynn/HSpec-Qwen27B-4m3a-epoch1

## Resumen

HSpec-Qwen27B-4m3a-epoch1 es un modelo borrador (drafter) de decodificación especulativa diseñado para acelerar la inferencia de Qwen/Qwen3.8-27B. Lo desarrolla MeganEFlynn y se publica bajo licencia Apache 2.0. No es un modelo generativo autónomo: es una pieza auxiliar que propone tokens candidatos que el modelo verificador (Qwen3.8-27B) acepta o rechaza, reduciendo el número de pasos de decodificación necesarios.

El checkpoint corresponde a una instantánea de mitad de la primera época de entrenamiento (paso global 29.470, aproximadamente el 38% de la época 1 de 2). Con 3.522.087.233 parámetros, emplea una arquitectura híbrida Mamba-atención (`mamba_attn_hybrid`) que lee la caché KV del verificador en proceso, sin necesidad de servidores de extracción ni conectores KV externos. La ventana de servicio documentada es de 8.196 tokens y la profundidad de borrador recomendada es de 8 tokens.

Su relevancia es práctica: la decodificación especulativa es una de las técnicas más eficaces para reducir latencia en producción, y este checkpoint reporta una tasa de aceptación de 0,642 con longitud de aceptación de 4,07. Requiere, sin embargo, un fork específico de vLLM y la librería `speculators` en ramas concretas, lo que limita su adopción a entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-atención (`mamba_attn_hybrid`), borrador de decodificación especulativa |
| Parametros totales | 3.522.087.233 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.196 tokens (`--max-model-len 8196` en el ejemplo de servicio) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin indicación de cuantizaciones publicadas) |
| Idiomas soportados | no disponible (heredados del verificador Qwen3.8-27B, no documentados en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json`/`config.py` y estado de entrenamiento |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa con arquitectura híbrida Mamba-atención. Su innovación principal es que lee la caché KV del verificador en proceso mediante el método `mamba_attn_hybrid`, lo que elimina la necesidad de un servidor de extracción, un conector KV o `kv-transfer-config` en tiempo de inferencia (el `KVCacheHiddenStatesConnector` del fork solo se usa para extracción de estados ocultos durante el entrenamiento). El RoPE se reconstruye desde el `config.json` guardado con theta 1e7, `partial_rotary_factor` 0.25 y `head_dim` 256, lo que exige una ruta de configuración de RoPE parcial que no está en vLLM estándar.

El entrenamiento se realizó con la receta `weifanjiang/speculators-qwen3.8-hspec` (commit `b45b99d`, equivalente a `577a974` más inicialización del verificador en `q_proj`). El checkpoint es una instantánea de mitad de época 1 (paso 29.470, ~38% de 2 épocas). Las métricas de entrenamiento reportadas son loss 0,458, tasa de aceptación 0,642 y longitud de aceptación 4,07. La validación de aceptación por posición en el epoch-0-end fue 0,822 / 0,728 / 0,659 / 0,604 / 0,559 / 0,520 / 0,486 para las posiciones 0 a 6, con un decaimiento lo bastante plano como para justificar profundidad de borrador 8. No se detalla la composición del dataset de entrenamiento ni el número de tokens.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para el verificador Qwen/Qwen3.8-27B con profundidad de borrador configurable (servido a profundidad 8).
- Lectura en proceso de la caché KV del verificador mediante `mamba_attn_hybrid`, sin conectores KV externos.
- Aceleración de throughput en cargas de generación de código, según el arnés de evaluación del autor (`evaluate.py throughput --subsets HumanEval`).
- Integración con vLLM mediante fork específico (rama `hspec_qwen_27B`, commit `18104949`).
- Integración con el lanzador de `speculators` (`scripts/launch_vllm.py`), que gestiona el cableado de argumentos y registra procedencia.
- No es un modelo de propósito general: no genera texto de forma autónoma, no soporta tool calling, agentes, visión, audio ni modo thinking por sí mismo. Cualquier capacidad de ese tipo proviene del verificador Qwen3.8-27B.

## Casos de uso

- Servicio de Qwen3.8-27B con baja latencia: desplegar el verificador con `--spec-model hspec-ckpt --spec-method mamba_attn_hybrid --spec-tokens 8` para reducir pasos de decodificación en entornos de inferencia interactiva.
- Generación de código en producción: el autor evalúa throughput sobre HumanEval, por lo que el caso natural es acelerar asistentes de código servidos con vLLM donde la latencia por token es crítica.
- Evaluación comparativa de políticas de borrador: servir a profundidad 5 frente a 8 y medir aceptación y throughput con el arnés de `speculators`.
- Reproducción de investigación en decodificación especulativa: el checkpoint incluye estado de entrenamiento y comando de entrenamiento (sin estado del optimizador), lo que facilita reproducir o continuar el entrenamiento.
- Despliegue en clústeres con vLLM: al integrarse en el mismo proceso que el verificador, evita infraestructura adicional de conectores KV.
- Experimentación con arquitecturas híbridas Mamba-atención: útil para estudiar el equilibrio entre coste del drafter y tasa de aceptación en modelos de ~27B.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Loss de entrenamiento (paso 29.470) | 0,458 |
| Tasa de aceptación | 0,642 |
| Longitud de aceptación | 4,07 |
| Aceptación por posición (epoch-0-end) | 0,822 / 0,728 / 0,659 / 0,604 / 0,559 / 0,520 / 0,486 (posiciones 0-6) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son métricas de entrenamiento y validación del propio drafter, no del modelo verificador.

## Requisitos de hardware

- El drafter suma 3.522.087.233 parámetros al verificador Qwen3.8-27B; el repositorio ocupa 7,0 GB.
- VRAM estimada del drafter: no disponible de forma explícita; a partir del tamaño del repo (7,0 GB en safetensors, presumiblemente BF16/FP16) se puede estimar en torno a 7 GB adicionales sobre el verificador, sin contar caché KV ni overhead de vLLM.
- GPU recomendadas: no disponible en la información proporcionada; el requisito dominante es el del verificador de 27B, no el del drafter.
- No cabe en GPU de consumo junto al verificador de 27B en la mayoría de configuraciones; el drafter por sí solo sí cabría, pero no es funcional sin el verificador.
- Despliegue: exclusivamente vLLM con el fork `MeganEFlynn/vllm` (rama `hspec_qwen_27B`, commit `18104949`) y `vllm-project/speculators` (rama `hspec_qwen_27B`, commit `577a974`). No hay soporte en vLLM estándar, llama.cpp, Ollama ni TGI.
- Backend de atención requerido en el ejemplo: `FLASHINFER`.
- Latencia y throughput: no disponible; el autor remite al arnés `evaluate.py throughput --subsets HumanEval` para medirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSpec-Qwen27B-4m3a-epoch1 | 3,52B | 8.196 | Drafter especulativo para Qwen3.8-27B | Apache 2.0 | HF, requiere fork de vLLM |
| MeganEFlynn/HSpec-Qwen27B | no disponible | no disponible | Drafter especulativo para Qwen3.8-27B (modelo de 50k, profundidad 5 en HumanEval) | no disponible | HF |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Modelo verificador de propósito general | no disponible | HF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el verificador Qwen3.8-27B y el fork de vLLM no produce resultados útiles.
- vLLM estándar no incluye el método `mamba_attn_hybrid` ni la ruta de RoPE parcial; se requiere el fork y commits exactos indicados.
- Checkpoint intermedio: es una instantánea al 38% de la época 1 de 2, por lo que su calidad final puede mejorar con checkpoints posteriores.
- El estado del optimizador está excluido del repositorio, lo que impide reanudar el entrenamiento de forma exacta.
- Sin datos publicados sobre sesgos, alucinación o cobertura idiomática del drafter; estos riesgos dependen del verificador.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork no oficial de vLLM añade riesgo de mantenimiento y de compatibilidad en producción.
- La ventana de servicio documentada es de 8.196 tokens; no se garantiza comportamiento fuera de ese rango.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeganEFlynn/HSpec-Qwen27B-4m3a-epoch1
- Ficha del drafter base (arquitectura y receta): https://huggingface.co/MeganEFlynn/HSpec-Qwen27B-4m3a
- Modelo de 50k con comparativas HumanEval: https://huggingface.co/MeganEFlynn/HSpec-Qwen27B
- Fork de vLLM: https://github.com/MeganEFlynn/vllm (rama `hspec_qwen_27B`, commit `18104949`)
- Librería speculators: https://github.com/vllm-project/speculators (rama `hspec_qwen_27B`, commit `577a974`)
- Receta de entrenamiento: `weifanjiang/speculators-qwen3.8-hspec` (commit `b45b99d`)
- Modelo verificador: https://huggingface.co/Qwen/Qwen3.8-27B
