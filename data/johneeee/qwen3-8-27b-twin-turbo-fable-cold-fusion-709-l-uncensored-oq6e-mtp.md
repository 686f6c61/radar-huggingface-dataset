# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-mtp

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-mtp es un modelo de lenguaje de 27.781.427.952 parámetros (unos 27,8 mil millones) publicado por el usuario Johneeee en Hugging Face. No se trata de un entrenamiento desde cero, sino de una cuantización en precisión mixta de un modelo base de la familia Qwen3 (el campo `model_type` de la model card es `qwen3_5`), realizada con la herramienta oQ de oMLX v0.6.4 en formato MLX safetensors a 6 bits con tamaño de grupo 64 y un tamaño de repositorio de 23,7 GB. El nombre del repositorio sugiere además una fusión de pesos o un ajuste posterior ("TWIN-TURBO-Fable-Cold-Fusion-709-L") y una variante sin censura ("Uncensored"), aunque el autor no documenta ninguna de estas operaciones.

El problema que resuelve es de despliegue: permite ejecutar un modelo de ~27,8B parámetros en cuantización de 6 bits sobre hardware Apple Silicon mediante el stack MLX, reduciendo el peso en memoria a aproximadamente 20,8 GB teóricos de pesos. Es relevante porque la cuantización mixta a 6 bits busca un compromiso entre la pérdida de calidad de las cuantizaciones agresivas de 4 bits y el coste de memoria del modelo en 16 bits.

La información publicada es extremadamente escasa: no hay model card más allá de los detalles de cuantización, no se declara licencia, idiomas soportados ni pipeline, y el repositorio acumulaba 0 descargas y 1 "like" en el momento de la consulta. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su autor o el modelo base sobre el que se construyó.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El campo `model_type` es `qwen3_5`, lo que apunta a la familia Qwen3, pero el autor no describe la arquitectura ni si se trata de un transformer denso, MoE o híbrido |
| Parámetros totales | 27.781.427.952 (~27,8 mil millones, dato real de los safetensors) |
| Parámetros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Cuantización mixta oQ a 6 bits, tamaño de grupo 64 (oMLX v0.6.4). No se han publicado variantes GGUF, AWQ, GPTQ ni de otros formatos |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantizados). Tamaño de repositorio: 23,7 GB |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o similar. El único dato técnico verificable es el proceso de cuantización: el autor indica que el modelo se cuantizó con oQ (oMLX v0.6.4) en precisión mixta, con un ancho de 6 bits y un tamaño de grupo de 64, y que el `model_type` declarado es `qwen3_5`. La etiqueta `oq` y la etiqueta `quantized` confirman que se trata de un artefacto derivado, no de un modelo entrenado desde cero.

El nombre del repositorio incorpora términos que en la comunidad de fusión de modelos suelen indicar un merge de pesos entre dos o más checkpoints ("TWIN", "Fusion"), un ajuste específico ("Fable", "Cold-Fusion-709-L") y un sufijo de decodificación multi-token ("mtp"). Ninguna de estas operaciones está documentada en la model card, por lo que no es posible confirmar ni su naturaleza ni su efecto sobre el rendimiento. Tampoco se documenta el modelo base exacto del que parte la cuantización más allá de la referencia genérica a `qwen3_5`.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje de ~27,8B parámetros de la familia Qwen3, pero el autor no publica ninguna evaluación ni lista de capacidades.
- Razonamiento, matemáticas y generación de código: no documentadas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Modo sin censura: el sufijo "Uncensored" del nombre sugiere un ajuste orientado a reducir los rechazos de seguridad, pero no hay ninguna descripción técnica de cómo se ha aplicado ni de su alcance.
- Decodificación multi-token: el sufijo "mtp" podría indicar soporte de multi-token prediction, sin confirmación por parte del autor.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX safetensors a 6 bits, por lo que su escenario natural es la ejecución local en Macs con memoria unificada de 32 GB o más mediante `mlx-lm`, sin depender de servicios en la nube. Es adecuado porque el formato y la cuantización están pensados exactamente para ese stack.
- Prototipado de asistentes conversacionales en local: permite montar un servidor de chat con `mlx_lm.server` para pruebas de concepto sin coste de API, siempre que se acepte la ausencia de garantías de calidad.
- Experimentación con cuantización mixta: sirve como caso de estudio para comparar la pérdida de calidad de una cuantización oQ a 6 bits frente al modelo original, si se dispone de ambos artefactos y de un conjunto de evaluación propio.
- Investigación sobre alineación y seguridad: una variante etiquetada como "Uncensored" es útil en entornos controlados para estudiar qué comportamientos cambian respecto a un modelo alineado y para calibrar filtros de contenido propios.
- Generación de texto creativo y exploración de estilo: el nombre sugiere un ajuste orientado a un registro narrativo concreto, aunque no hay evidencia publicada que lo respalde.
- Base para fusiones o ajustes posteriores: al estar en safetensors MLX, puede servir de punto de partida para nuevos merges o cuantizaciones dentro del ecosistema MLX, por ejemplo pasando a 4 bits si se necesita reducir aún más la huella de memoria.
- Evaluación comparativa interna: útil como línea base en un banco de pruebas propio de modelos de ~27B cuantizados, dado que no existen resultados públicos de benchmarks para este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el proceso de cuantización, y la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo, su autor ni su modelo base. No se dispone por tanto de datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra métrica, ni de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: a partir del recuento real de parámetros (27,78 mil millones) y de una cuantización de 6 bits con grupo de 64, los pesos ocupan aproximadamente 20,8 GB (6 bits × 27,78e9 / 8). El repositorio completo pesa 23,7 GB. Añadiendo el overhead del runtime MLX y la caché KV, un contexto moderado requiere del orden de 24 a 28 GB de memoria unificada. Son estimaciones calculadas, no datos publicados por el autor.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo es Apple Silicon (familias M1, M2, M3 y M4 en versiones Pro, Max o Ultra). Para GPUs NVIDIA o AMD no hay artefactos publicados en este repositorio; sería necesario convertir los pesos.
- ¿Cabe en GPU de consumo? No en el sentido habitual: no hay pesos GGUF ni cuantizaciones de 4 bits publicadas. En el ecosistema Apple, un equipo con 32 GB de memoria unificada sería el mínimo razonable, y 64 GB o más lo recomendable para contextos largos. En GPUs de consumo con 24 GB de VRAM (RTX 3090, 4090) no cabría sin una cuantización más agresiva de la publicada.
- Opciones de despliegue: `mlx-lm` (generación por línea de comandos y API compatible con OpenAI mediante `mlx_lm.server`) y el propio tooling de oMLX/oQ. No hay pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión previa desde MLX. vLLM y TGI no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

Los valores de los modelos de referencia corresponden a documentación pública ampliamente difundida y no se han verificado en la búsqueda web realizada para esta ficha. Para el modelo analizado, la mayoría de campos figuran como "no disponible" porque el autor no los publica.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-mtp | 27,8B (dato real) | No disponible | No disponible | Solo MLX safetensors 6 bits, 0 descargas |
| Qwen2.5-32B-Instruct (referencia) | ~32,5B | 128K | Apache 2.0 | Múltiples formatos (safetensors, GGUF, AWQ, GPTQ) |
| Gemma 2 27B (referencia) | ~27B | 8K | Términos de uso de Gemma | Múltiples formatos |
| Mistral Small 3.1 24B (referencia) | ~24B | 128K | Apache 2.0 | Múltiples formatos |

La comparación de rendimiento no es posible: no existen benchmarks publicados del modelo analizado. En términos de disponibilidad, la diferencia principal es que las alternativas de referencia ofrecen licencias explícitas, documentación de idiomas y ecosistema de cuantizaciones amplio, mientras que este checkpoint carece de todo ello.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no hay autorización explícita de uso, lo que impide un uso comercial seguro. Es un riesgo legal directo para cualquier despliegue en producción.
- Variante "Uncensored": el nombre indica que el ajuste reduce o elimina las barreras de seguridad. Es esperable que el modelo genere contenido que otros modelos alineados rechazarían, incluyendo material dañino, ilegal o socialmente sensible. No debe exponerse a usuarios finales sin un filtrado propio.
- Riesgo de alucinación: no hay ninguna evaluación publicada de fidelidad factual. Al tratarse de un artefacto derivado (fusión y/o ajuste no documentados más cuantización de 6 bits), el riesgo de degradación respecto al modelo de origen es real y no medido.
- Pérdida por cuantización: la cuantización a 6 bits con grupo de 64 introduce error numérico respecto a los pesos originales. El autor no publica ninguna comparación de calidad frente al modelo sin cuantizar.
- Procedencia no verificable: no se especifica qué checkpoint base de Qwen3 se cuantizó ni qué operaciones de fusión se aplicaron. Esto dificulta la reproducibilidad y el cumplimiento de las condiciones de uso del modelo original, que tampoco se citan.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y los idiomas soportados.
- Restricciones de formato: al publicarse solo en MLX safetensors, el modelo queda limitado al ecosistema Apple. No hay GGUF ni otros formatos, lo que excluye su uso directo en llama.cpp, Ollama, vLLM o TGI.
- Ausencia de validación comunitaria: 0 descargas y 1 "like", con creación y última actualización separadas por 16 minutos, indican que el artefacto no ha sido validado por terceros. No hay informes de calidad, estabilidad ni comportamiento en producción.
- Sesgos: no documentados. Al no existir información sobre los datos de entrenamiento ni evaluaciones, no es posible caracterizar los sesgos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-mtp
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo, su autor, el modelo base `qwen3_5` ni el proceso de fusión. Los resultados devueltos (repositorios de prompts tipo DAN, GitHub Desktop, hilos de Reddit y un wrapper de ChatGPT) no guardan relación con la ficha.
