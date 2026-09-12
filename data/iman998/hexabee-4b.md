# Iman998/HexaBee-4B

## Resumen

HexaBee-4B es un modelo de traducción multilingüe de 4.300.079.472 parámetros (~4,3 B) desarrollado por el usuario Iman998 y publicado como un ajuste final fusionado sobre Gemma 3 4B IT. El modelo cubre seis idiomas de evaluación (persa, inglés, árabe, chino, hebreo y español) y su objetivo declarado es la traducción bidireccional entre esas lenguas, un ámbito donde la mayoría de los modelos abiertos de tamaño medio rinden de forma desigual, especialmente en direcciones que no pasan por el inglés.

La adaptación se construyó en varias etapas: preentrenamiento continuado con Wikipedia, ajuste multilingüe de respuesta con traducción del texto de respuesta y, finalmente, un LoRA fresco de rango 256 entrenado sobre traducciones sintéticas bidireccionales (329.137 pares alineados en ambas orientaciones, 658.274 registros de SFT, una época, learning rate 1e-4, cutoff de 4.096 tokens). El repositorio distribuye el checkpoint ya fusionado en dos shards de safetensors junto con el processor y el tokenizador de Gemma 3, sin necesidad de fusionar adaptadores.

Su relevancia actual es doble: por un lado, publica una tabla de evaluación de traducción sobre 30 direcciones y 36.572 elementos de test por modelo, con métricas BLEU, chrF, chrF++, TER y COMET; por otro, conserva la arquitectura multimodal de Gemma 3 (pipeline declarado `image-text-to-text`) aunque el propio autor advierte de que el checkpoint no ha sido evaluado en tareas de imagen. Es, por tanto, un artefacto de investigación orientado a traducción, no un modelo generalista validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal de la familia Gemma 3 (base: Gemma 3 4B IT); adaptación de texto sobre la ruta de imagen-texto |
| Parámetros totales | 4.300.079.472 (~4,3 B) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible. El ajuste final se realizó con un cutoff de 4.096 tokens; no se declara una ventana de contexto operativa para el checkpoint publicado |
| Tipos de cuantización | No disponible. No se publican pesos GGUF, GPTQ, AWQ ni cuantizaciones alternativas en el repositorio |
| Idiomas soportados | Persa (fa), inglés (en), árabe (ar), chino (zh), hebreo (he) y español (es) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (dos shards) + processor y tokenizador de Gemma 3 |
| Modelo base | Iman998/HexaBee-4B-Multilingual-Base (a su vez derivado de Gemma 3 4B IT) |
| Librería de referencia | transformers |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 8,6 GB |
| Autor | Iman998 |
| Fecha de publicación (según metadatos) | 2026-09-12 |

## Arquitectura y entrenamiento

HexaBee-4B no introduce una arquitectura nueva: es un transformer decoder-only de la familia Gemma 3, con el stack multimodal de Gemma 3 4B IT intacto y el processor/tokenizer originales. La innovación está en el procedimiento de adaptación, documentado en la model card. El pipeline consta de tres fases: (1) preentrenamiento continuado sobre Wikipedia, cuyos datos se publican como `Iman998/HexaBee-Wikipedia-PT`; (2) ajuste supervisado multilingüe con respuesta y traducción del texto de respuesta (`Iman998/HexaBee-Multilingual-SFT`); y (3) una etapa final de traducción bidireccional sobre el checkpoint multilingüe ya fusionado.

La etapa final es la más relevante en términos de receta: se entrenó un LoRA nuevo de rango 256 con alpha 512 y dropout 0,005, sobre 658.274 registros de SFT que corresponden a 329.137 pares alineados en ambas orientaciones. Se ejecutó una única época con learning rate 1e-4 y cutoff de 4.096 tokens. Según el autor, todos los pesos se preservan y solo se normaliza la metadata de rutas locales para la publicación; no hay fusión de adaptadores pendiente en este repositorio, ya que el checkpoint distribuido es el resultado fusionado.

El material de referencia incluye dos artículos de arXiv: el informe técnico de Gemma 3 (arXiv:2503.19786) y el artículo original de LoRA (arXiv:2106.09685). No se documentan en la información disponible técnicas adicionales como decodificación especulativa, atención lineal, RLHF o DPO; la receta descrita se limita a preentrenamiento continuado y SFT con LoRA.

## Capacidades

- Traducción bidireccional multilingüe entre los seis idiomas declarados (persa, inglés, árabe, chino, hebreo y español), en un total de 30 direcciones evaluadas.
- Generación de texto conversacional multilingüe, heredada del ajuste multilingüe de respuesta.
- Seguimiento de instrucciones mediante plantilla de chat de Gemma 3, con soporte de mensajes de sistema y de usuario.
- Traducción guiada por instrucción en lenguaje natural: el prompt de sistema especifica la dirección (por ejemplo, «Translate the following text from English into Persian»).
- Arquitectura multimodal de Gemma 3 retenida a nivel estructural (procesador de imagen-texto), aunque sin evaluación publicada de tareas de visión.
- Capacidad de generar hasta un presupuesto de tokens configurable; el ejemplo de la model card usa `max_new_tokens=512` con decodificación greedy (`do_sample=False`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no disponibles en la información proporcionada.

## Casos de uso

- Traducción automática de documentación técnica entre pares no ingleses: el modelo está optimizado para 30 direcciones sin pivotar por el inglés, lo que resulta útil para pares como persa-chino o árabe-hebreo, donde los sistemas genéricos suelen degradarse.
- Localización de contenido web en seis idiomas: con un único checkpoint se cubren las seis lenguas declaradas, lo que simplifica el despliegue frente a mantener un modelo por par de idiomas.
- Traducción de textos largos con presupuesto de generación controlado: mediante `max_new_tokens` y decodificación determinista, se puede integrar en pipelines por lotes donde prime la reproducibilidad sobre la diversidad.
- Preprocesado multilingüe para análisis de opinión o indexación de corpus: convertir todo el corpus a un idioma común antes de aplicar un modelo monolingüe de clasificación o recuperación.
- Investigación en evaluación de traducción: al publicar métricas macro sobre 30 direcciones y 36.572 elementos por modelo, sirve como punto de comparación reproducible frente a Gemma 3 4B IT y Gemma 3 12B IT.
- Base para ajuste específico de dominio: al ser un modelo de 4,3 B con LoRA documentado, es viable entrenar adaptadores de rango bajo sobre terminología jurídica, médica o técnica usando el mismo esquema publicado.
- Traducción asistida en herramientas de edición: integrado vía `transformers` con `device_map="auto"`, puede servir de backend para sugerencias de traducción en interfaces de escritura.
- Prototipado en investigación multilingüe: la receta por etapas y los repositorios de datos asociados permiten reproducir o ablacionar fases del entrenamiento.

## Benchmarks y rendimiento

El autor publica una única tabla de evaluación, centrada en traducción, sobre una macro de igual peso de 30 direcciones y 36.572 elementos de test por modelo. Valores TER: menor es mejor.

| Sistema | BLEU ↑ | chrF ↑ | chrF++ ↑ | TER ↓ | COMET ×100 ↑ |
|---|---:|---:|---:|---:|---:|
| Gemma 3 4B IT | 40,70 | 58,91 | 57,11 | 51,40 | 85,88 |
| Gemma 3 12B IT | 50,54 | 68,70 | 66,83 | 38,89 | 88,20 |
| HexaBee-4B | 62,03 | 75,08 | 73,75 | 30,05 | 89,86 |

Advertencias declaradas por el propio autor: las referencias son sintéticas y las plantillas de inferencia archivadas difieren entre sistemas, lo que limita la comparabilidad; se trata de resultados de investigación archivados y no de una clasificación oficial de una campaña compartida. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del número de parámetros, no publicada por el autor): en bf16/fp16 los pesos ocupan aproximadamente 8,6 GB, por lo que con caché KV y activaciones conviene disponer de 10-12 GB para contextos de 4.096 tokens.
- Cuantización int8: aproximadamente 4,3-6 GB de VRAM según implementación.
- Cuantización int4: aproximadamente 2,5-4 GB de VRAM, aunque el repositorio no distribuye pesos cuantizados y habría que generarlos.
- GPU recomendadas: A100 40 GB, H100 o L40S para servicio concurrente; RTX 4090 (24 GB) para uso individual sin restricciones de contexto.
- ¿Cabe en GPU de consumo? Sí: en bf16 cabe con holgura en RTX 4090, RTX 3090 y RTX 4080 (16 GB); con cuantización int4 o int8 podría ejecutarse en GPU de 8-12 GB, como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (ruta documentada); el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con Hugging Face TGI y con Inference Endpoints. Soporte de vLLM, llama.cpp u Ollama: no disponible, ya que no se publican pesos GGUF ni se documenta compatibilidad explícita con esos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto declarado | BLEU (macro 30 direcciones) | COMET ×100 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| HexaBee-4B | 4,3 B | No disponible (cutoff de entrenamiento: 4.096) | 62,03 | 89,86 | Gemma | Pesos safetensors en Hugging Face |
| Gemma 3 4B IT | ~4 B (denominación del autor) | No disponible en la información proporcionada | 40,70 | 85,88 | Gemma | Pesos abiertos en Hugging Face |
| Gemma 3 12B IT | ~12 B (denominación del autor) | No disponible en la información proporcionada | 50,54 | 88,20 | Gemma | Pesos abiertos en Hugging Face |

La comparación debe leerse con cautela: los tres sistemas comparten licencia y familia, pero las referencias sintéticas y las diferencias de plantilla de inferencia impiden tratar la tabla como una comparación controlada. No se dispone de comparativas frente a modelos de traducción especializados de otros desarrolladores (por ejemplo, familias NLLB o M2M) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no ha sido evaluado en tareas de imagen, pese a conservar la arquitectura multimodal de Gemma 3. Usar el procesador de imagen no está respaldado por ninguna evaluación publicada.
- Los checkpoints intermedios no cuentan con una evaluación de traducción independiente y emparejada; las cifras publicadas corresponden únicamente al modelo final fusionado.
- La calidad puede variar según el idioma, el dominio y la longitud de la entrada; el propio autor lo señala de forma explícita.
- Las referencias de evaluación son sintéticas y los jueces son modelos automáticos, lo que limita la interpretación de las métricas.
- Las entradas largas para COMET se truncan en el límite del codificador, de modo que la métrica no refleja el rendimiento en textos muy extensos.
- La receta completa se evaluó en conjunto: no hay una ablación emparejada que aísle la contribución del ajuste multilingüe de respuesta.
- No se documentan sesgos concretos, pero al derivar de Gemma 3 y entrenarse con datos sintéticos, es esperable un riesgo de sesgo y de alucinación en dominios poco representados; no hay medición publicada al respecto.
- Licencia Gemma: el uso comercial es posible sujeto a las Gemma Terms of Use y a la Prohibited Use Policy, con obligaciones de redistribuir los términos y las restricciones a los usuarios finales. Conviene verificar el texto vigente antes de un despliegue en producción.
- El modelo se presenta como artefacto de investigación: el autor indica que la publicación no implica aceptación en un taller ni una clasificación oficial de una campaña compartida.
- El repositorio registra cero descargas y cero «likes» en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- El nombre anterior del artefacto en la auditoría local era PCT-4B; el cambio de nombre no implica reentrenamiento, pero puede generar confusión al buscar referencias previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iman998/HexaBee-4B
- Modelo base multilingüe: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-Base
- LoRA de preentrenamiento Wikipedia: https://huggingface.co/Iman998/HexaBee-4B-PT-LoRA
- LoRA de SFT multilingüe: https://huggingface.co/Iman998/HexaBee-4B-Multilingual-SFT-LoRA
- LoRA de traducción: https://huggingface.co/Iman998/HexaBee-4B-Translation-LoRA
- Dataset de fundamentos Wikipedia: https://huggingface.co/datasets/Iman998/HexaBee-Wikipedia-PT
- Dataset de respuesta multilingüe y traducción: https://huggingface.co/datasets/Iman998/HexaBee-Multilingual-SFT
- Repositorio de evaluación: https://huggingface.co/datasets/Iman998/HexaBee-Evaluation
- Figura de resultados por idioma destino: https://huggingface.co/datasets/Iman998/HexaBee-Evaluation/resolve/main/figures/target_comparison.png
- Informe técnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Artículo original de LoRA: https://arxiv.org/abs/2106.09685
- Nota: el repositorio de la familia de publicación incluye una entrada adicional («HexaBee · Bidirectional Translation») cuyo enlace aparece truncado en la información disponible, por lo que no se reproduce aquí.
- Nota: la búsqueda web realizada no devolvió enlaces relevantes al modelo; los resultados correspondían a páginas de gestión de reservas de una aerolínea, ajenas por completo al contenido de esta ficha.
