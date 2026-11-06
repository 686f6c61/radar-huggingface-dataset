# mrbmaryam/logsumm-apache-w15-abstractive-stratified-qwen3-8b-sft

## Resumen

`mrbmaryam/logsumm-apache-w15-abstractive-stratified-qwen3-8b-sft` es un ajuste fino (SFT) del modelo Qwen3-8B, desarrollado por el usuario mrbmaryam y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen3-8B-bnb-4bit`) y se ha entrenado con la librería Unsloth y el framework TRL para la tarea de resumen abstractivo de documentos, según se deduce del nombre del repositorio (prefijo `logsumm`, sufijo `abstractive-stratified`).

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino de un único autor, con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluación publicados. El repositorio ocupa 0,2 GB, lo que sugiere que los pesos publicados no corresponden al modelo completo en precisión nativa, sino probablemente a adaptadores o a una versión cuantizada.

El modelo hereda la arquitectura y las capacidades del Qwen3-8B original, pero no se dispone de información verificable sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni el rendimiento en tareas de resumen. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parametros totales | 8 000 millones (heredados del modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta hasta 32 768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | El modelo base de partida es bnb-4bit; no se especifican las cuantizaciones publicadas en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |
| Modelo base | unsloth/Qwen3-8B-bnb-4bit |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen3-8B, un transformer decoder-only de 8 000 millones de parametros. El entrenamiento se realizo con Unsloth, que segun la model card permite un entrenamiento "2x faster" (el doble de rapido) que un pipeline convencional, y con TRL, el framework de Hugging Face para ajuste fino y alineamiento. El punto de partida es la version cuantizada en 4 bits del modelo base publicada por Unsloth, lo que implica que el ajuste se hizo sobre pesos cuantizados o con tecnicas de bajo rango (LoRA/QLoRA), aunque la model card no especifica el metodo exacto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. El nombre del repositorio sugiere un dataset de resumen de documentos con estratificacion (`stratified`) y una ventana de contexto o de ejemplo de 15 (`w15`), pero estos detalles no estan documentados y no deben asumirse.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-8B.
- Resumen abstractivo de documentos, que es la tarea objetivo declarada en el nombre del repositorio, aunque sin evaluacion publicada.
- Razonamiento y generacion de codigo: capacidades propias de Qwen3-8B, no verificadas tras el ajuste fino.
- Soporte de tool calling y function calling: heredado del modelo base, no confirmado en esta version ajustada.
- Capacidades multilingues: la model card declara unicamente ingles (`language: en`), por lo que no se debe asumir soporte fiable en otros idiomas.
- Modo thinking: Qwen3 incorpora modos de razonamiento explicito, pero no se confirma que el ajuste fino los preserve.
- No se dispone de informacion sobre capacidades de vision, audio o agentes multi-paso en esta version.

## Casos de uso

- Resumen de documentacion tecnica en ingles: el modelo puede generar resumenes abstractivos de manuales, especificaciones o articulos, que es la tarea para la que fue ajustado, aunque requiere validacion previa por la ausencia de benchmarks.
- Sintesis de actas de reunion o correos largos: util para condensar conversaciones multi-turno en ingles en resumenes breves, siempre que se verifique la calidad con un conjunto de prueba propio.
- Preprocesado en pipelines de analisis documental: integrable como etapa de resumen previa a un motor de busqueda o a un sistema de extraccion de entidades, reduciendo la longitud del texto de entrada.
- Generacion de resumenes para boletines internos: adecuado para equipos que trabajan en ingles y necesitan condensar informes periodicos sin coste de API, al estar bajo licencia Apache 2.0.
- Prototipado de asistentes de lectura: el modelo puede servir como base para experimentos de "pregunta sobre el documento" combinando resumen y recuperacion, aunque sin garantias de robustez.
- Investigacion en ajuste fino: util como referencia para estudiar el efecto del SFT con Unsloth sobre Qwen3-8B en tareas de resumen, dado que el repositorio es pequeno y reproducible.
- Filtrado y triaje de contenido: resumen de articulos o tickets para clasificacion posterior, con la advertencia de que el rendimiento no esta medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,2 GB, lo que sugiere que los pesos publicados no son el modelo completo en fp16 (que requeriria unos 16 GB). Si se carga el modelo base Qwen3-8B en 4 bits, se necesitan aproximadamente 5-6 GB de VRAM; en 8 bits, unos 9-10 GB; en fp16, unos 16 GB.
- GPU recomendadas: para el modelo base en 4 bits, una RTX 3060 de 12 GB o superior es suficiente; para fp16, se recomienda una A100 de 40 GB, H100 o RTX 4090 de 24 GB.
- Cabe en GPU de consumo: si, en configuracion cuantizada de 4 bits cabe en tarjetas con 8-12 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque el repositorio solo declara safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-apache-w15-abstractive-stratified-qwen3-8b-sft | 8 000 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino para resumen, sin benchmarks |
| Qwen/Qwen3-8B | 8 000 M | 32 768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base generalista, con benchmarks publicados |
| unsloth/Qwen3-8B-bnb-4bit | 8 000 M | 32 768 tokens (heredado) | Apache 2.0 | Hugging Face | Version cuantizada en 4 bits del anterior, usada como punto de partida |
| mrbmaryam/logsumm-bgl-w15-abstractive-stratified-qwen3-8b-sft | 8 000 M | no disponible | no disponible | Hugging Face | Variante del mismo autor con distinto dataset de resumen |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, curvas de entrenamiento ni comparaciones publicadas, por lo que no se puede afirmar que el ajuste fino mejore al modelo base en resumen.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden identificar sesgos de dominio, genero, raza o ideologia.
- Riesgo de alucinacion: inherente a los modelos generativos de 8 000 millones de parametros, especialmente en resumen abstractivo, donde el modelo puede introducir informacion no presente en el texto fuente.
- Limitacion idiomatica: la model card declara unicamente ingles; el uso en castellano no esta soportado ni evaluado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base Qwen3-8B y de Unsloth.
- Repositorio de 0,2 GB: es probable que no contenga los pesos completos, sino adaptadores o una version cuantizada; verificar antes de desplegar.
- Sin mantenimiento aparente: creado y actualizado el mismo dia, con cero descargas y cero likes, lo que indica un experimento personal sin validacion de la comunidad.
- Para produccion, se recomienda evaluar contra el Qwen3-8B original en un conjunto de resumen propio y considerar modelos especializados con benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrbmaryam/logsumm-apache-w15-abstractive-stratified-qwen3-8b-sft
- Variante del mismo autor: https://huggingface.co/mrbmaryam/logsumm-bgl-w15-abstractive-stratified-qwen3-8b-sft
- Otro repositorio del autor: https://huggingface.co/mrbmaryam/logsumm-apache_ex_v1
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Framework TRL: https://github.com/huggingface/trl
