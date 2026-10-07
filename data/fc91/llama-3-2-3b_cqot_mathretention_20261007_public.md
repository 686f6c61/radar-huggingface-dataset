# fc91/Llama-3.2-3B_CQoT_MathRetention_20261007_public

## Resumen

`fc91/Llama-3.2-3B_CQoT_MathRetention_20261007_public` es un adaptador LoRA experimental publicado por el usuario `fc91` sobre el modelo `meta-llama/Llama-3.2-3B-Instruct`. Su propósito declarado es funcionar como piloto de retención matemática (*math-retention pilot*): se ha entrenado para conservar y reforzar la capacidad de resolver problemas aritméticos tras un ajuste supervisado, incorporando además una señal de regularización hacia una referencia para mitigar el olvido catastrófico.

El repositorio es muy ligero (0,7 GB) y se distribuye exclusivamente como pesos de adaptador en formato safetensors bajo la librería PEFT, con licencia `llama3.2`. No es un modelo completo, sino un delta que debe cargarse sobre el modelo base identificado, por lo que su comportamiento final depende de la revisión concreta del base y del tokenizador histórico indicado en la model card.

La relevancia de esta ficha es acotada: no hay métricas publicadas, el número de descargas y *likes* es cero y la propia model card advierte de que el adaptador es experimental y que no constituye un sistema de razonamiento matemático validado. Se trata, por tanto, de material de investigación reproducible más que de un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only con GQA (modelo base `meta-llama/Llama-3.2-3B-Instruct`) |
| Parametros totales | No disponible para el adaptador. Modelo base: 3,21 B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens heredada del modelo base; no confirmada para el adaptador |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos de adaptador en safetensors; no se publican GGUF ni cuantizaciones propias) |
| Idiomas soportados | No disponible para el adaptador (el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Datos adicionales del repositorio: tamaño total 0,7 GB, cero descargas y cero *likes* en el momento de la consulta, creado el 2026-10-07 y actualizado el 2026-10-07. Revisión *upstream* del modelo base indicada por el autor: `0cb88a4f764b7a12671c53f0838cd831a0843b95`.

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base Llama-3.2-3B-Instruct (transformer decoder-only con *grouped-query attention* y RoPE) más una capa de adaptación LoRA de rango no especificado. El repositorio se etiqueta como `peft`, `lora`, `safetensors` y `research`, y su tamaño (0,7 GB) incluye, según la model card, no solo los pesos del adaptador sino también estados de optimizador y de RNG para permitir la recuperación del entrenamiento.

Respecto al entrenamiento, la model card indica que se emplearon 256 objetivos de solución directa verificados (*256 checked direct-solution targets*) y una función de pérdida compuesta por entropía cruzada sobre tokens matemáticos (*Math-token CE*) más una divergencia KL hacia una referencia en paso directo (*forward reference KL*). No se detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; estos datos figuran como no disponibles. El repositorio lleva el nombre `CQoT_SFT_mix_teacher_repair_round3`, lo que sugiere una mezcla de SFT con una ronda de "reparación" por profesor, aunque no se aporta documentación técnica que lo desarrolle. El tokenizador histórico declarado pertenece al repositorio `fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC`, revisión `1c0a3554332b7adaa03edf51df7840aa2b7652f4`.

## Capacidades

- Generación de texto y seguimiento de instrucciones: heredadas del modelo base Llama-3.2-3B-Instruct.
- Resolución de problemas matemáticos: es el objetivo declarado del piloto, pero la model card insiste en que se trata de un adaptador experimental y no validado.
- Cálculo aritmético y solución directa de problemas: el entrenamiento se orientó explícitamente a objetivos de solución directa, sin desarrollos intermedios documentados.
- *Tool calling* / *function calling*: no disponible. No se declara soporte en la model card ni se aportan configuraciones de plantilla de herramientas.
- Agentes y razonamiento multi-paso: no disponible. No hay evidencia publicada de soporte para flujos de agente.
- Capacidades multilingües: no disponibles a nivel de adaptador. Solo se puede asumir el comportamiento del modelo base, sin garantía tras el ajuste.
- Visión, audio u otras modalidades: no disponibles. El modelo base es exclusivamente de texto.
- Modo de razonamiento explícito (*thinking mode*): no disponible. No se documenta ningún modo de decodificación especial.

## Casos de uso

- Investigación sobre retención de conocimiento matemático: el adaptador sirve como punto de partida para estudiar si un ajuste SFT breve degrada o preserva las capacidades aritméticas del modelo base, midiendo la diferencia entre el base y el adaptador sobre un conjunto de validación propio.
- Estudio del olvido catastrófico: al incluir una señal KL hacia una referencia, permite comparar experimentalmente la eficacia de esta regularización frente a un SFT sin KL en un modelo de 3 B.
- Reproducibilidad de experimentos de ajuste: la inclusión de estados de optimizador y RNG facilita reanudar el entrenamiento en el mismo punto y verificar la reproducibilidad de la pérdida reportada.
- Evaluación de estrategias de *teacher repair*: útil para comparar rondas sucesivas de corrección por profesor sobre un mismo conjunto de 256 objetivos verificados.
- Base para *fine-tuning* educativo controlado: un equipo puede partir de este adaptador para experimentar con ajuste adicional en dominios matemáticos concretos, siempre con validación previa y sin desplegarlo tal cual.
- Banco de pruebas para *pipelines* de evaluación matemática: al ser un delta pequeño, se integra fácilmente en *harnesses* de evaluación que comparen múltiples adaptadores sobre el mismo base.
- Docencia e investigación académica: adecuado como ejemplo didáctico de cómo se publica un adaptador LoRA con metadatos de recuperación y tokenizador histórico, no como asistente matemático final.
- Prototipado local de bajo coste: al requerir poca VRAM adicional sobre el base, permite experimentar en una GPU de consumo sin comprometer recursos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de ningún otro conjunto, y el autor no adjunta respuestas de validación retenidas (*no held-out responses are uploaded*), lo que impide una verificación independiente del rendimiento.

## Requisitos de hardware

- VRAM para inferencia: depende de la precisión. En fp16/bf16, el modelo base de 3,21 B ocupa aproximadamente 6,5 GB de pesos, por lo que conviene reservar entre 8 y 10 GB contando caché KV y *overhead*. En cuantización de 4 bits, el consumo baja a unos 2-3 GB.
- El adaptador LoRA añade muy poco peso adicional (el repositorio completo son 0,7 GB e incluye estados de optimizador, no solo pesos de inferencia).
- GPU recomendadas: A100, H100 o L40S para servicio concurrente; RTX 4090 (24 GB) para desarrollo e inferencia local con margen; RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) como mínimo para fp16.
- Cabe en GPU de consumo: sí. Con 12 GB de VRAM se puede servir en fp16; con 6-8 GB, en cuantización de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (con soporte de LoRA), TGI y, previa fusión del adaptador con el base y conversión a GGUF, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `fc91/Llama-3.2-3B_CQoT_MathRetention_20261007_public` | Adaptador sobre base de 3,21 B | 128 000 (heredado del base) | Llama 3.2 Community | Experimental, sin benchmarks, 0 descargas |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 B | 128 000 | Llama 3.2 Community | Modelo base del adaptador; comportamiento general conocido |
| `Qwen/Qwen2.5-3B-Instruct` | 3,09 B | 32 768 (ampliable con RoPE) | Apache 2.0 (modelo base) | Alternativa de tamaño similar con licencia permisiva |
| `microsoft/Phi-3.5-mini-instruct` | 3,8 B | 128 000 | MIT (modelo base) | Orientado a razonamiento; licencia más laxa |

La comparación es estructural: el adaptador no publica métricas que permitan contrastar rendimiento real frente a estas alternativas. Las cifras de parámetros y contexto corresponden a los modelos base públicos, no al adaptador evaluado.

## Limitaciones y advertencias

- Adaptador experimental: la propia model card indica que no es un sistema de razonamiento matemático validado (*not validated mathematical reasoning*). No debe usarse en producción sin evaluación propia.
- Ausencia total de benchmarks y de respuestas retenidas: no es posible verificar de forma independiente ninguna mejora sobre el modelo base.
- Riesgo de alucinación: al ser un modelo de 3 B ajustado sobre solo 256 objetivos, la probabilidad de generar pasos matemáticos incorrectos con apariencia plausible es alta.
- Reproducibilidad frágil: la model card advierte de que el último *commit* puede corresponder a un punto de control de desarrollo rechazado y que debe cargarse desde `resume` en el *commit* inmutable seleccionado del informe de CPU. Cargar el estado más reciente sin comprobar esta condición puede dar lugar a un modelo no deseado.
- Dependencia del tokenizador histórico: el adaptador declara un tokenizador concreto de otro repositorio; usar un tokenizador distinto puede alterar los resultados.
- Idiomas: no se declara ningún idioma para el adaptador. El comportamiento multilingüe tras el ajuste es desconocido.
- Licencia: sujeta a la Llama 3.2 Community License, que impone restricciones de uso (incluidas cláusulas de escala y de atribución) y no es una licencia de código abierto plena. Es obligatorio revisar sus términos antes de cualquier uso comercial.
- Sesgos: no disponibles. No se documenta ningún análisis de sesgo del adaptador ni del base.
- Contexto: aunque el base soporta 128 000 tokens, no hay confirmación de que el adaptador preserve ese comportamiento tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_MathRetention_20261007_public
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio del tokenizador histórico citado: https://huggingface.co/fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
