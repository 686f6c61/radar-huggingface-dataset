# rrodolfo0/qwen3-4b-move-intent-curve-1350

## Resumen

`rrodolfo0/qwen3-4b-move-intent-curve-1350` es un adaptador LoRA (librería PEFT) entrenado sobre el modelo base `Qwen/Qwen3-4B-Base` y publicado con licencia Apache-2.0. Su función es mapear una transcripción de ajedrez en inglés, ya finalizada, a un valor canónico compacto de tipo `move-interpretation/v2`, o a la etiqueta `UNKNOWN` cuando la entrada no es interpretable. El checkpoint se publica para preservar la curva de eficiencia de datos de un experimento controlado con 1.350 filas de entrenamiento.

El modelo no genera notación SAN ni valida movimientos: esa responsabilidad recae en un "Move Resolver" propiedad del host, que comprueba la interpretación contra `chess.js` (que es quien decide legalidad, identidad de la jugada, jaque, mate y SAN). El adaptador solo produce la interpretación compacta; la legalidad y la unicidad del movimiento quedan fuera de su alcance. Es un caso de estudio de adaptación eficiente de un LLM de 4B a una tarea de dominio muy específico, con un pipeline de evaluación público y trazable.

Según la model card, ningún punto de la curva de datos superó todas las compuertas de validación registradas, por lo que el adaptador no se describe como "cualificado". Aun así, el repositorio incluye recibos de entrenamiento, verificación de adaptador y un evaluador reproducible, lo que lo convierte en un material de referencia útil para experimentos de control de eficiencia de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3-4B-Base (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA de 0.1 GB; base no incluida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen3-4B soporta 32K tokens, no se especifica para este adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset de trabajo en ingles; la model card no especifica otros) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) sobre el modelo base `Qwen/Qwen3-4B-Base`, con la revisión exacta fijada en `906bfd4b4dc7f14ee4320094d8b41684abff8539` mediante `adapter_config.json`. El entrenamiento usó el dataset `rrodolfo0/move-intent-v2-final` (revisión `d146121e25e1fafdb114605f4264fef7d754521e`) con 1.350 filas, descritas como "fresh-only nested curve prefix". El modelo se carga como adaptador PEFT sobre la base pinada y se usa con el chat template del repositorio, con thinking deshabilitado y decodificación determinista.

La salida es una interpretación de movimiento compacta (formato `move-interpretation/v2`) o `UNKNOWN`. El entrenamiento quedó documentado en `training-receipt.json`, que registra la ejecución limpia de actualización a cero, la receta, los checkpoints, el hardware, los hashes y el resultado de recarga. `adapter-verification.json` contiene la evidencia de recarga en proceso fresco. No se detalla el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las 1.350 filas.

## Capacidades

- Mapea una transcripción de ajedrez en inglés, ya finalizada, a un valor canónico `move-interpretation/v2` o a `UNKNOWN`.
- Produce interpretación de movimiento, no notación SAN.
- No requiere ver el tablero: la legalidad y la unicidad del movimiento las resuelve un componente externo (`chess.js`).
- Funciona con el chat template del repositorio, con thinking deshabilitado y decodificación determinista.
- Resultados reportados por el autor: 251/300 strict exact, 285/300 parseable, 109/130 noisy exact, 300/300 correctly framed, 0/30 `UNKNOWN` false accepts.
- No soporta tool calling, agentes ni razonamiento multi-step (no se documenta en la model card).

## Casos de uso

- Interpretación de transcripciones de ajedrez en inglés: dado un transcript final, el adaptador produce la interpretación canónica compacta que un resolver externo (basado en `chess.js`) puede validar y convertir en SAN. Es útil en pipelines de procesamiento de partidas.
- Preprocesamiento para motores de ajedrez: el adaptador normaliza la transcripción a un formato intermedio antes de que el resolver decida legalidad y movimiento, reduciendo la carga de parsing en el host.
- Manejo de transcripciones ruidosas: el modelo fue evaluado con ejemplos ruidosos sintéticos (corrupciones de texto tipo ASR), por lo que puede usarse como primer filtro de interpretación en entornos con errores de transcripción.
- Detección de entradas no interpretables: la salida `UNKNOWN` permite marcar transcripciones que no se pueden interpretar, evitando que pasen a la fase de resolución de legalidad.
- Investigación sobre eficiencia de datos: el checkpoint documenta una curva de datos controlada con 1.350 filas, útil para estudiar cómo varía la calidad con el tamaño del dataset en adaptación LoRA de dominio específico.
- Reproducibilidad de experimentos: al publicar `training-receipt.json` y `adapter-verification.json`, sirve como referencia para reproducir un flujo de entrenamiento con hashes fijos y verificación de recarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta los siguientes resultados de su panel de evaluación propio (no staff-heldout):

| Métrica | Resultado |
|---|---|
| Strict exact (test de 300) | 251/300 |
| Parseable (test de 300) | 285/300 |
| Noisy exact (test de 130) | 109/130 |
| Correctly framed (test de 300) | 300/300 |
| `UNKNOWN` false accepts (test de 30) | 0/30 |

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU recomendadas ni latencia en la información disponible.
- El adaptador LoRA ocupa 0.1 GB en el repositorio; al cargarse sobre `Qwen3-4B-Base`, el requisito de memoria dependerá del modelo base (aproximadamente 8-10 GB en FP16 para inferencia, aunque no se confirma en la model card).
- No se indican opciones de despliegue específicas; la model card menciona el uso con PEFT/Transformers y un comando de evaluación propio (`python eval.py --model <repo>@<sha> --eval-set <jsonl>`).
- No se dispone de datos de throughput ni latencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con modelos de la misma categoría. La búsqueda web localizó otro adaptador similar (`yav1327/qwen-3-4b-intent-model-V2`), pero no se dispone de sus especificaciones ni resultados para establecer una comparación rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No es un generador de SAN: la salida es una interpretación de movimiento, no una notación estándar. Usarlo como generador de SAN sería incorrecto.
- No ve el tablero: el adaptador no puede determinar si un movimiento es legal o único; esa validación depende de un resolver externo (por ejemplo, `chess.js`).
- El test de evaluación es propio del autor y no es un conjunto de validación oculto (staff-heldout), por lo que las métricas pueden sobreestimar el rendimiento real.
- Los ejemplos ruidosos son corrupciones sintéticas de texto, no transcripciones reales de audio ASR; el rendimiento con ASR real puede diferir.
- Ningún punto de la curva de datos cumplió todas las compuertas de registro, por lo que el adaptador no se describe como "cualificado" para producción sin validación adicional.
- El uso previsto exige decodificación determinista y thinking deshabilitado; desviarse de esa configuración puede alterar la salida.
- La licencia es Apache-2.0, lo que permite uso comercial, pero el autor no garantiza la idoneidad para producción sin verificación externa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rrodolfo0/qwen3-4b-move-intent-curve-1350
- Dataset de entrenamiento: https://huggingface.co/datasets/rrodolfo0/move-intent-v2-final
- Repositorio de evidencia: https://huggingface.co/rrodolfo0/move-intent-final-evidence
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
