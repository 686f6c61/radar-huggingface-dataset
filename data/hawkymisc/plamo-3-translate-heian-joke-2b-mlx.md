# hawkymisc/PLaMo-3-Translate-Heian-Joke-2B-MLX

## Resumen

PLaMo 3 Translate Heian Joke 2B MLX es un ajuste fino no oficial del modelo de traducción PLaMo 3 Translate 2B de Preferred Networks (PFN), desarrollado por el usuario independiente hawkymisc. El modelo realiza una transferencia de estilo entre japonés moderno y japonés clásico de estilo Heian (平安和文風), una variante literaria del período Heian. No se trata de un traductor histórico fiable, sino de un experimento lúdico de estilo, tal y como declara explícitamente el autor en la model card.

El modelo parte del checkpoint cuantizado en 4 bits `pfnet/plamo-3-translate-2b-MLX-4bit` (revisión `63777ddc6dc80aacacd92a1bf6966105f2f6270c`) y se ajusta mediante QLoRA sobre datos sintéticos paralelos generados con Terra. El resultado se fusiona y descuantiza, por lo que la distribución final no es de 4 bits sino de pesos completos (~5,36 GiB). Está diseñado exclusivamente para ejecutarse en Apple Silicon mediante la librería MLX.

Su relevancia es limitada y acotada: sirve como ejemplo de ajuste fino reproducible sobre la familia PLaMo 3 Translate con una metodología documentada (manifiesto de entrenamiento, métricas chrF, verificación de pesos), y como caso de estudio de especialización estilística extrema con muy pocos datos (510 pares de entrenamiento). No es un modelo de propósito general ni compite con los modelos base de traducción de PFN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de PLaMo 3 Translate 2B; detalles internos no disponibles) |
| Parametros totales | 2.878.595.584 (~2,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos completos fusionados y descuantizados (~5,36 GiB); el modelo base era 4-bit (W4A16 MLX), pero esta distribucion no es 4-bit |
| Idiomas soportados | Japones (etiquetas aprendidas `ja` y `ja-heian`, esta ultima especifica del proyecto y no oficial) |
| Licencia | PLaMo Community License Agreement (no MIT ni Apache para los pesos) |
| Formato de pesos | Safetensors para MLX (`mlx`, `mlx-lm`, `custom_code`); no es GGUF ni checkpoint estandar de Transformers/PyTorch |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del PLaMo 3 Translate 2B de PFN, un transformer decoder-only especializado en traducción. El ajuste se realizó con QLoRA sobre el checkpoint base cuantizado en 4 bits: rango 16, escala 16, aplicado a las últimas 16 capas y a 64 matrices de atención y MLP. La configuración de entrenamiento fue de batch 2, 800 pasos, optimizador Adam con learning rate 0,0001, longitud máxima de 256 tokens, semilla 42 y gradient checkpointing. La pérdida se calculó solo sobre la respuesta (incluyendo EOS y excluyendo prompt y padding), seleccionando el mejor checkpoint de validación (iteración 699, base cero). Los deltas se fusionaron en las matrices reales y el resto de matrices cuantizadas se descuantizaron; embeddings y cabeza de salida quedaron sin cambios.

Los datos de entrenamiento son 510 pares sintéticos paralelos generados con Terra (70 de validación y 32 de test independientes), expandidos en ambas direcciones de traducción. La partición se hizo por pares y grupos casi duplicados antes de la expansión direccional, con filtrado de solapamiento con el test. El modelo requiere `trust_remote_code=True` tanto en el modelo como en el tokenizer, e incluye un script `translate.py` que detecta y rechaza salidas truncadas. Ambas direcciones requieren selección explícita mediante el parámetro `direction` (`to_classical` o `to_modern`) en la plantilla de chat.

## Capacidades

- Transferencia de estilo japonés moderno → japonés clásico de estilo Heian (`to_classical`).
- Transferencia inversa japonés clásico → japonés moderno (`to_modern`).
- Generación de texto breve con plantilla de chat y control de temperatura (el ejemplo oficial usa `temp=0`).
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de adaptador LoRA (pesos fusionados).
- Detección de salida truncada mediante el script incluido `translate.py`.
- Capacidad de traducción general heredada del modelo base PLaMo 3 Translate 2B (no evaluada en este derivado).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Experimentación estilística literaria: generar variantes en estilo Heian de frases modernas para talleres de escritura creativa o juegos de rol históricos, usando `direction="to_classical"` con temperatura 0 para resultados deterministas.
- Demostración educativa de ajuste fino con QLoRA: el repositorio documenta manifiesto de entrenamiento, métricas y verificación de pesos, lo que lo convierte en un ejemplo reproducible para cursos sobre especialización de LLM con datos sintéticos.
- Pruebas de pipelines MLX en Apple Silicon: sirve para validar flujos de carga con `trust_remote_code=True`, plantillas de chat personalizadas y ejecución en memoria unificada de 16 GB.
- Generación de contenido humorístico o novedoso para redes sociales o bots de entretenimiento, siempre etiquetando la salida como generada por un derivado de PLaMo (requisito de licencia).
- Evaluación comparativa de robustez ante dominios de bajos recursos: con solo 510 pares de entrenamiento, permite estudiar sobreajuste y degradación en negation, tense, subjects y honorifics.
- Prototipado de herramientas de "traducción de estilo" en entornos de investigación, midiendo chrF contra referencias sintéticas antes de invertir en datos anotados por expertos.

## Benchmarks y rendimiento

| Direccion | chrF base | chrF ajustado | Ejemplos de test |
|---|---:|---:|---:|
| to_classical | 6,27 | 55,00 | 32 |
| to_modern | 46,32 | 82,68 | 32 |

Las puntuaciones se comparan contra una única referencia sintética, no contra oro anotado por expertos históricos. El modelo base usa las mismas etiquetas de idioma personalizadas y la comparación no emplea un prompt base optimizado. La dirección samurái → japonés moderno no mejoró en chrF. Ninguno de los dos modelos ha sido validado en textos largos ni en corpus históricos reales.

## Requisitos de hardware

- VRAM/unified memory estimada: ~5,36 GiB por modelo en pesos fusionados; el autor probó con Apple M2 de 16 GB de memoria unificada cargando un solo modelo a la vez.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de memoria unificada; no está pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de 16 GB o más; no aplica a RTX 4090 u otras GPU discretas por el formato MLX.
- Opciones de despliegue: MLX (`mlx==0.32.4`, `mlx-lm==0.32.0`), con dependencias fijadas `transformers==5.19.0`, `numba==0.68.0`, `huggingface-hub==2.4.0`; no compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo 3 Translate Heian Joke 2B MLX (este) | ~2,88 B | No disponible | Estilo ja moderno ↔ ja Heian | PLaMo Community License | MLX, Apple Silicon |
| PLaMo 3 Translate 2B (pfnet) | ~2 B | No disponible | Traduccion general ja ↔ otras lenguas | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| PLaMo 3 Translate 0.8B (pfnet) | ~0,8 B | No disponible | Traduccion general; supera a modelos especializados de mas de 30x parametros en ja–en | PLaMo Community License | Multiples formatos |
| PLaMo 3 Translate 8B / 31B (pfnet) | 8 B / 31 B | No disponible | Traduccion general de mayor calidad | PLaMo Community License | Multiples formatos |

## Limitaciones y advertencias

- No es un traductor histórico fiable: produce errores de negación, tiempo verbal, sujeto, honoríficos y preservación de información.
- No validado en textos largos ni en corpus históricos reales; las métricas usan una única referencia sintética.
- La dirección samurái → japonés moderno no mejoró en chrF, por lo que esa variante no aporta ganancia medible.
- Riesgo de alucinación y de cambios de significado inherente a un ajuste con 510 pares sintéticos.
- La etiqueta `ja-heian` es específica del proyecto y no es un código de idioma oficial.
- Licencia PLaMo Community License: la redistribución exige incluir el texto completo del acuerdo, que los receptores cumplan sus términos, mostrar "Built with PLaMo" y que el nombre del modelo derivado incluya "PLaMo" (artículo 4).
- Los productos publicados deben identificarse como generados por PLaMo o un derivado (artículo 5).
- El uso comercial requiere registro previo ante PFN y que los ingresos o ventas del último ejercicio no superen los 1.000 millones de yenes (artículo 3); en caso contrario se necesita una licencia comercial separada. El uso "de broma" no exime de estas condiciones.
- Requiere `trust_remote_code=True`: conviene revisar los archivos Python incluidos antes de ejecutarlos.
- No es compatible con ecosistemas CUDA ni con formatos GGUF; el despliegue queda restringido a Apple Silicon con MLX.
- La implementación MLX adaptada incluye porciones bajo licencia MIT de Apple (aviso en `LICENSE.mlx-lm`), lo que no relicencia los pesos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hawkymisc/PLaMo-3-Translate-Heian-Joke-2B-MLX
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
- Colección PLaMo 3 Translate: https://huggingface.co/collections/pfnet/plamo-3-translate
- Blog técnico de PFN sobre PLaMo 3 Translate: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (japonés): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Formulario de registro previo para uso comercial: https://forms.gle/mTL8tBLrMYXKNZD56
- Errores observados: `evaluation/QUALITY-2b.md` (dentro del repositorio)
- Salidas de test: `evaluation/predictions.jsonl` (dentro del repositorio)
- Métricas: `evaluation/metrics.json` (dentro del repositorio)
- Manifiesto de entrenamiento: `training-manifest.json` (dentro del repositorio)
- Verificación de pesos: `evaluation/weight-verification.json` (dentro del repositorio)
