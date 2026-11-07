# hawkymisc/PLaMo-3-Translate-Samurai-Joke-2B-MLX

## Resumen

PLaMo 3 Translate Samurai Joke 2B MLX es un derivado no oficial, creado por el usuario hawkymisc, del modelo de traducción PLaMo 3 Translate 2B de Preferred Networks (PFN). El modelo base está especializado en traducción japonés-inglés y multilingüe; este derivado se ha afinado con QLoRA para una tarea de transferencia de estilo muy concreta: convertir japonés moderno a un registro ficticio de samurái (con formas como «拙者» y «候») y viceversa. Se trata de un experimento lúdico, no de un traductor histórico fiable.

Arquitectura transformer con 2.878.595.584 parámetros totales (unos 2,9 mil millones), distribuida en formato MLX (Apple Silicon) con pesos safetensors fusionados de aproximadamente 5,36 GiB por modelo. El repositorio ocupa 5,8 GB. La licencia es la PLaMo Community License, con restricciones explícitas para uso comercial.

Su relevancia es acotada: sirve como ejemplo de fine-tuning ligero (512 pares sintéticos, QLoRA de rango 16) sobre un modelo de traducción ya especializado, y como demostración práctica del flujo MLX en hardware de consumo (probado en un Apple M2 con 16 GB de memoria unificada). No es un modelo de propósito general ni un traductor de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de PLaMo 3 Translate 2B; implementación MLX) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos fusionados y desquantizados (no es 4-bit pese al nombre del base); el base era MLX-4bit |
| Idiomas soportados | ja (etiquetas del proyecto: `ja` y `ja-samurai`, esta última no es un código oficial) |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors + custom_code, librería mlx / mlx-lm |

## Arquitectura y entrenamiento

El modelo parte de `pfnet/plamo-3-translate-2b-MLX-4bit` (revisión `63777ddc6dc80aacacd92a1bf6966105f2f6270c`) y aplica QLoRA: rango 16, escala 16, sobre las últimas 16 capas y 64 matrices de atención/MLP, con batch 2, 800 pasos, Adam con learning rate 0,0001, máximo 256 tokens, semilla 42 y gradient checkpointing. La pérdida se calcula solo sobre la respuesta (incluye EOS y excluye prompt y padding), y se seleccionó el mejor checkpoint de validación (iteración 599, base cero). Los deltas se fusionaron en las matrices reales y el resto de matrices cuantizadas se desquantizaron; embeddings y cabeza quedaron sin cambios.

Los datos de entrenamiento son paralelos sintéticos generados con Terra: 512 pares de entrenamiento, 70 de validación y 32 de prueba independientes, expandidos en ambas direcciones. La partición se hizo por ejemplos emparejados y grupos casi duplicados antes de la expansión direccional, y se filtró la superposición con el conjunto de prueba. No hubo RLHF ni DPO; el ajuste es supervisado y de estilo.

## Capacidades

- Traducción bidireccional japonés moderno ↔ japonés con registro ficticio de samurái (`to_classical` / `to_modern`), con selección explícita de dirección obligatoria.
- Generación de texto condicionada por plantilla de chat con etiquetas de idioma propias del proyecto (`ja`, `ja-samurai`).
- Ejecución local en Apple Silicon mediante MLX y mlx-lm, con `trust_remote_code=True`.
- Script `translate.py` incluido para detectar y rechazar salidas truncadas.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al japonés en este derivado, aunque el modelo base cubre traducción multilingüe.

## Casos de uso

- Experimentación con transferencia de estilo en japonés: convertir frases modernas a un registro samurái ficticio para prototipos de videojuegos, narrativa o ficción, usando `--direction to_classical`.
- Generación de diálogos con ambientación histórica ficticia: el modelo produce formas como «拙者» y «候» de manera consistente, útil para guiones o textos de rol no históricos.
- Docencia y demostración de fine-tuning QLoRA en MLX: el repositorio documenta manifiesto de entrenamiento, métricas y verificación de pesos, lo que lo convierte en un caso reproducible para cursos sobre ajuste ligero en hardware de consumo.
- Pruebas de pipelines de traducción bidireccional en local: el script `translate.py` permite validar el flujo completo sin dependencias de nube en un M2 con 16 GB.
- Evaluación de robustez y errores de traducción: los archivos `evaluation/QUALITY-2b.md` y `evaluation/predictions.jsonl` sirven para estudiar fallos típicos (negación, tiempo verbal, sujetos, honoríficos) en sistemas de traducción sintéticos.
- Prototipado de interfaces conversacionales con registro marcado: integrable en demos de chat que requieran un tono específico, siempre con la advertencia de que no es un traductor histórico fiable.

## Benchmarks y rendimiento

| Direccion | Base chrF | Tuned chrF | Ejemplos de prueba |
|---|---:|---:|---:|
| to_classical | 52,42 | 57,45 | 32 |
| to_modern | 66,74 | 61,71 | 32 |

Las puntuaciones se comparan contra una única referencia sintética, no contra oro anotado por expertos. La dirección samurái → japonés moderno no mejoró en chrF. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este derivado.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 5,36 GiB por modelo en pesos fusionados; probado en Apple M2 con 16 GB de memoria unificada, cargando un modelo a la vez.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con al menos 16 GB de memoria unificada; el formato MLX no está pensado para GPU NVIDIA.
- No cabe en GPUs de consumo NVIDIA mediante este repositorio, ya que no es GGUF ni un checkpoint estándar de Transformers/PyTorch.
- Opciones de despliegue: mlx-lm (versión 0.32.0) con mlx 0.32.4, transformers 5.19.0, numba 0.68.0 y huggingface-hub 2.4.0; el propio repositorio incluye `requirements.txt`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo 3 Translate Samurai Joke 2B MLX | 2,88B | no disponible | Estilo samurái ficticio (ja) | PLaMo Community License | MLX, safetensors |
| pfnet/plamo-3-translate-2b-MLX-4bit (base) | ~2B | no disponible | Traducción ja-en y multilingüe | PLaMo Community License | MLX-4bit |
| PLaMo 3 Translate 8B / 31B (familia) | 8B / 31B | no disponible | Traducción de mayor calidad | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |

La familia PLaMo 3 Translate incluye variantes de 0,8B, 2B, 8B y 31B; según PFN, incluso el 2B supera a los LLM especializados en traducción comparados en todas las métricas de su figura. Este derivado no replica esas métricas: su objetivo es el estilo, no la fidelidad traductológica.

## Limitaciones y advertencias

- Modelo de broma y no oficial: no está respaldado por Preferred Networks y no debe usarse como traductor histórico fiable.
- Errores documentados en negación, tiempo verbal, sujetos, honoríficos y preservación de información; tampoco se ha validado en textos largos ni en corpus históricos reales.
- La dirección samurái → moderno empeora en chrF respecto al base (61,71 frente a 66,74).
- Las etiquetas `ja-samurai` son específicas del proyecto y no un código de idioma oficial.
- Licencia PLaMo Community License: la redistribución exige incluir el texto del acuerdo, que los receptores cumplan sus términos, mostrar «Built with PLaMo» y que el nombre del modelo derivado contenga «PLaMo» (artículo 4); las salidas públicas deben identificarse como generadas por PLaMo o un derivado (artículo 5).
- Uso comercial: requiere registro previo ante PFN y ingresos/ventas anuales no superiores a 1.000 millones de yenes (artículo 3); en caso contrario hace falta una licencia comercial separada. La naturaleza de broma no exime de estas condiciones.
- Requiere `trust_remote_code=True`; conviene revisar los archivos Python incluidos antes de ejecutarlos.
- El repositorio incluye porciones con licencia MIT de Apple (mlx-lm), lo que no relicencia los pesos del modelo.
- Riesgo de alucinación y de cambios de significado inherentes a un ajuste con solo 512 pares sintéticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hawkymisc/PLaMo-3-Translate-Samurai-Joke-2B-MLX
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
- Colección PLaMo 3 Translate: https://huggingface.co/collections/pfnet/plamo-3-translate
- Variante 31B MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Licencia PLaMo Community (EN): https://plamo.preferredai.jp/info/plamo-community-license-en
- Licencia PLaMo Community (JA): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Formulario de registro previo PFN: https://forms.gle/mTL8tBLrMYXKNZD56
