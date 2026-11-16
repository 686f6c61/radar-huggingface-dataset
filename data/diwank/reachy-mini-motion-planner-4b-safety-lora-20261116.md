# diwank/reachy-mini-motion-planner-4b-safety-lora-20261116

## Resumen

El modelo `diwank/reachy-mini-motion-planner-4b-safety-lora-20261116` es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el decodificador de texto del modelo base `binhpham/reachy-mini-motion-planner-4b`, un planificador de movimiento de 4.000 millones de parámetros orientado al robot humanoide Reachy Mini. Lo desarrolla el usuario de Hugging Face `diwank` como piloto de investigación numérica, no como producto listo para producción. El problema que aborda es la generación de recetas de movimiento (gestos como asentir, inclinar la cabeza a la izquierda o mirar hacia arriba) que sean simultáneamente útiles y seguras según criterios cinemáticos y de controlador.

La relevancia del artefacto es metodológica: documenta un pipeline de ajuste supervisado (SFT) seguido de optimización con GRPO (Group Relative Policy Optimization) sobre 320 tareas de diez familias de gestos, con métricas de seguridad evaluadas en un conjunto de test congelado de 80 tareas. El adaptador seleccionado (paso 100 de RL) eleva la tasa de "movimiento útil y seguro antes de corrección" del 5,00 % en el modelo base al 52,50 %, a costa de reducir la tasa de éxito del predicado de gesto del 84,38 % al 66,88 %.

Se trata de un adaptador de rango 16 sobre un decodificador de texto extraído de un wrapper multimodal; no es un adaptador intercambiable directamente con el modelo multimodal original. El repositorio ocupa 0,5 GB y se distribuye bajo licencia Apache 2.0. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre decodificador de texto de un transformer de 4B parámetros |
| Parametros totales | 4B (modelo base); el adaptador LoRA es de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el decodificador de texto del modelo base `binhpham/reachy-mini-motion-planner-4b`, congelando el generador de flujo (flow generator) y el resto del wrapper multimodal. El entrenamiento consta de dos fases: un calentamiento supervisado de 10 pasos sobre 39 recetas aceptadas (asentir, inclinación a la izquierda, mirada hacia arriba), seguido de 100 actualizaciones de GRPO sobre 320 tareas repartidas en diez familias de gestos. Se usaron ocho GPU A100 de 40 GB en BF16, LoRA de rango 16, cuatro candidatos por grupo, dos semillas emparejadas del generador y 3.200 completaciones de RL muestreadas. El cribado de SFT consideró 3.840 candidatos.

La función de recompensa suma 2 puntos por movimiento útil y 2 adicionales si ese movimiento pasa las comprobaciones de seguridad en la trayectoria cruda y en la reproducida. Aplica penalizaciones acotadas por holgura (clearance), límites de pose y velocidad, cinemática inversa (IK), cabeceo descendente, estrés por retardo, distorsión del controlador y duración. Las recetas inválidas puntúan -10. Las dos extracciones del generador se agregan como mitad de su media más mitad de su mínimo. La proyección IK del upstream se omite antes de puntuar. Los checkpoints en los pasos 10, 50 y 100 se seleccionaron por éxito conjunto en el conjunto de desarrollo, y el checkpoint final se eligió antes de abrir el test.

## Capacidades

- Generación de recetas de movimiento en formato JSON con los campos `idea` y `recipe` para el robot Reachy Mini.
- Planificación de gestos dentro de diez familias conocidas (asentir, inclinaciones, miradas, etc.) con ángulos de pose en grados y traslaciones en metros.
- Razonamiento sobre la pose de partida: el prompt debe incluir `\ncurrent_pose=` seguido de un JSON de pose con claves ordenadas.
- Generación determinista (greedy) con un máximo de 384 tokens nuevos y dos IDs de EOS definidos en el contrato de prompt.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso más allá de la generación de una receta por prompt.
- Capacidad multilingüe limitada al inglés.
- No produce comandos de motor directamente: la receta debe pasar por el generador de flujo downstream.
- Modo "thinking" desactivado explícitamente (`enable_thinking=False`).

## Casos de uso

- **Planificación de gestos seguros en robótica social**: el adaptador genera recetas de movimiento que pasan comprobaciones de holgura, límites de pose y velocidad antes de la reproducción, lo que lo hace adecuado para prototipos de interacción con el robot Reachy Mini donde la seguridad cinemática es crítica.
- **Investigación en RL aplicado a robótica**: sirve como referencia reproducible de un pipeline SFT + GRPO con recompensas de seguridad, útil para estudiar cómo penalizaciones acotadas afectan al éxito conjunto de gestos.
- **Ablación de pose inicial**: el artefacto incluye checkpoints comparativos (`sft-baseline/`, `grpo-step010/`, `grpo-step050/`) que permiten analizar la contribución de cada fase de entrenamiento.
- **Evaluación de contratos de prompt**: el uso del `prompt_contract.json` y la disciplina de tokens EOS lo convierten en un banco de pruebas para integraciones de decodificadores de texto en pipelines multimodales.
- **Generación de recetas para el generador de flujo downstream**: integrable en el repositorio `reachy-motion-generator` para producir trayectorias que luego se validan con cinemática y reproducción numérica.
- **Docencia y divulgación sobre seguridad en planificación de movimiento**: las métricas de éxito conjunto (5 % base frente a 52,5 % con GRPO) ofrecen un caso concreto para explicar el compromiso entre utilidad y seguridad.

## Benchmarks y rendimiento

| Métrica en test congelado | Base | SFT | Adaptador GRPO | Modelo BF16 fusionado |
|---|---:|---:|---:|---:|
| Útil y seguro antes de corrección | 5,00 % | 35,00 % | 52,50 % | 50,62 % |
| Trayectoria cruda segura | 5,00 % | 46,25 % | 83,12 % | 80,00 % |
| Predicado de gesto reproducido | 84,38 % | 84,38 % | 66,88 % | 68,12 % |

El conjunto de test consta de 80 tareas retenidas con dos extracciones emparejadas del generador. La diferencia de éxito conjunto entre RL y SFT es de 17,50 puntos porcentuales, con un intervalo de confianza bootstrap del 95 % estratificado por familia de [11,88; 23,12]. La diferencia entre pose inicial correcta y permutada para el adaptador RL es de -0,62 puntos, con intervalo [-5,62; 3,75], por lo que el piloto no establece beneficio de la pose inicial correcta. La seguridad primaria en trayectoria reproducida es del 100 % en todos los brazos porque las guardas existentes corrigen las trayectorias.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,5 GB, pero requiere cargar el modelo base de 4B parámetros en BF16, lo que implica aproximadamente 8 GB de VRAM solo para los pesos del decodificador.
- El entrenamiento se realizó con ocho GPU A100 de 40 GB en BF16; no se documenta el hardware mínimo de inferencia.
- Cabe en GPU de consumo con al menos 8-10 GB de VRAM (por ejemplo, RTX 3080/4080/4090) si se carga el modelo base en BF16 o cuantizado, aunque no se documentan cuantizaciones del adaptador.
- El despliegue requiere el script `text_decoder.load_text_model` incluido en el repositorio del adaptador y un snapshot fijado del modelo base (`revision='1b60d8f16b85473ceb20e3b62e464780c532b519'`), además de `PeftModel.from_pretrained`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; el flujo indicado es Python con `transformers` y `peft`.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (GRPO paso 100) | 4B (base) + LoRA r16 | no disponible | apache-2.0 | Hugging Face | 52,50 % útil y seguro antes de corrección |
| `binhpham/reachy-mini-motion-planner-4b` (base) | 4B | no disponible | no disponible | Hugging Face | 5,00 % útil y seguro antes de corrección |
| `diwank/reachy-mini-motion-planner-4b-safety-grpo-20261116` (modelo fusionado) | 4B | no disponible | apache-2.0 | Hugging Face | 50,62 % útil y seguro antes de corrección |
| `sft-baseline/` (checkpoint SFT incluido) | 4B (base) + LoRA r16 | no disponible | apache-2.0 | Incluido en este repo | 35,00 % útil y seguro antes de corrección |

No se dispone de información sobre otros planificadores de movimiento comparables de la misma categoría.

## Limitaciones y advertencias

- Es un piloto de investigación numérica, no una garantía de seguridad lista para robot; se requieren guardas en tiempo de ejecución.
- La ganancia en seguridad viene acompañada de una caída en el éxito del gesto (del 84,38 % al 66,88 % en el predicado de gesto reproducido).
- Las métricas se obtuvieron con el generador de flujo congelado, cinemática, comprobaciones de holgura y velocidad y reproducción numérica; no se probó ningún robot físico.
- Los estados de partida son suaves y asentados (roll ±4 grados, pitch -7 a +2, cuerpo ±10, offset de yaw cabeza/cuerpo ±3, traslaciones nulas); no se cubren velocidades, interrupciones, estados alcanzables arbitrarios ni familias de gestos no vistas.
- No se evalúa la naturalidad valorada por humanos.
- Los intervalos de confianza condicionan a una única semilla de entrenamiento, políticas fijas, esta distribución de estados y dos semillas de test fijas.
- Una vez publicados, los splits deben tratarse como benchmark de reproducción, no como test no visto para desarrollo posterior.
- El adaptador no es intercambiable directamente con el wrapper multimodal upstream; requiere el cargador `text_decoder.load_text_model` y un snapshot fijado.
- El modelo solo produce recetas JSON, no comandos de motor; el canal de altura de la receta del generador downstream permanece en milímetros.
- El idioma soportado es únicamente inglés.
- No se documentan sesgos conocidos ni tasas de alucinación específicas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-safety-lora-20261116
- Modelo fusionado GRPO: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-safety-grpo-20261116
- Dataset: https://huggingface.co/datasets/diwank/reachy-mini-motion-safety-20261116
- Modelo base: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b/tree/1b60d8f16b85473ceb20e3b62e464780c532b519
- Generador de movimiento / DSL: https://github.com/pham-tuan-binh/reachy-motion-generator/tree/18ff98574a8f0652b21db32f204a8029f8930d88
