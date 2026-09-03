# rowan-dauria/Qwen2.5-Math-1.5B-RoPE-300k

## Resumen

Qwen2.5-Math-1.5B-RoPE-300k es una variante del modelo matematico Qwen2.5-Math-1.5B de Alibaba, publicada por el usuario rowan-dauria. El modelo mantiene los pesos originales del modelo base pero modifica la configuracion de la codificacion posicional rotatoria (RoPE), elevando la frecuencia base de 10.000 a 300.000, lo que extiende la longitud de contexto de 4.096 a 32.768 tokens. Es el analogo de 1,5B de parametros del modelo open-r1/Qwen2.5-Math-7B-RoPE-300k.

El objetivo de esta modificacion es proporcionar una base adecuada para el ajuste fino supervisado (SFT) de razonamiento con contexto largo. Al no alterar los pesos, el modelo conserva las capacidades matematicas del Qwen2.5-Math-1.5B original, pero con una ventana de contexto ocho veces superior. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con RoPE y GQA |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (extendido desde 4.096) |
| Tipos de cuantizacion | No especificados (repo en safetensors, 3,1 GB consistente con BF16/FP16) |
| Idiomas soportados | No especificados en la model card; la serie Qwen2.5-Math soporta ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Qwen2.5, un transformer decoder-only con atencion por ventana deslizante (sliding window) en capas intermedias, atencion multi-consulta agrupada (GQA) y activacion SwiGLU. La modificacion principal consiste en tres cambios en config.json: rope_theta pasa de 10.000 a 300.000, max_position_embeddings pasa de 4.096 a 32.768, y sliding_window se elimina por completo. Esto obliga a que la atencion sea global en toda la secuencia, un requisito para manejar contextos largos de forma efectiva, aunque incrementa el coste de memoria del cache KV.

Los pesos no se han modificado; el modelo conserva exactamente los del Qwen2.5-Math-1.5B original, entrenado por Alibaba con un enfoque de auto-mejora (self-improvement) que combina SFT y RLHF sobre datos matematicos en ingles y chino, segun el informe tecnico arXiv:2409.12122. No se ha realizado ningun entrenamiento adicional sobre esta variante; el proposito declarado es servir como punto de partida para SFT con contexto largo.

## Capacidades

- Razonamiento matematico: conserva las capacidades del modelo base Qwen2.5-Math-1.5B para problemas aritmeticos, algebraicos y de razonamiento logico.
- Generacion de texto: pipeline de text-generation estandar compatible con la libreria transformers.
- Contexto largo: ventana de 32.768 tokens, ocho veces superior a la del modelo base, apta para razonamiento multi-paso con historial extenso.
- Multilingue: la serie Qwen2.5-Math soporta ingles y chino; el modelo base hereda esta capacidad, aunque no esta confirmado para esta variante.
- Base para SFT: no incluye ajuste por instrucciones de chat; esta disenado para ser fine-tuneado.
- Compatibilidad con despliegue: compatible con text-generation-inference y endpoints de Hugging Face.

## Casos de uso

- Razonamiento matematico de contexto largo: resolver problemas que requieren leer un enunciado extenso, multiples ejemplos resueltos o un historial de razonamiento de varios miles de tokens, algo inviable con la ventana original de 4K.
- Base para SFT especializada: investigadores pueden fine-tunear este modelo sobre datasets de razonamiento con contexto largo sin necesidad de modificar la configuracion posicional.
- Evaluacion de extension de contexto: sirve como punto de referencia para medir como afecta la extension de RoPE a la calidad del razonamiento matematico en secuencias largas.
- Generacion de soluciones paso a paso: produce cadenas de razonamiento detalladas (chain-of-thought) para problemas matematicos, util en entornos educativos o de tutoria.
- Integracion en pipelines de agentes: al soportar contextos largos, puede mantener conversaciones multi-turno con memoria amplia en tareas de tutoria matematica asistida.
- Investigacion academica: el informe tecnico de Qwen2.5-Math (arXiv:2409.12122) documenta la metodologia de entrenamiento, lo que permite reproducir experimentos sobre esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe tecnico de la serie Qwen2.5-Math (arXiv:2409.12122) incluye evaluaciones del modelo base en MMLU-Math, GSM8K y otros conjuntos, pero no se dispone de mediciones especificas para esta variante con RoPE-300k. Los resultados del modelo base de 1,5B son significativamente inferiores a los de las variantes de 7B y 72B de la misma serie.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,1 GB para los pesos en BF16/FP16, mas el cache de atencion KV. Con contexto completo de 32K, el cache KV puede anadir varios GB adicionales. En cuantizacion de 8 bits se reduce a ~1,6 GB y en 4 bits a ~0,8 GB, aunque no se proporcionan versiones cuantizadas en el repo.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, A10, L4). Con cuantizacion, cabe incluso en GPUs de 4 GB.
- Compatibilidad con consumer GPU: si, el modelo cabe holgadamente en GPUs de consumo actuales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers mediante pipeline de text-generation.
- Latencia y throughput: no disponible en la informacion proporcionada; para un modelo de 1,5B en una GPU moderna de gama media se espera un throughput de decenas de tokens por segundo, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Params | Contexto | RoPE theta | Licencia | Notas |
|---|---|---|---|---|---|
| rowan-dauria/Qwen2.5-Math-1.5B-RoPE-300k | 1,54B | 32.768 | 300.000 | Apache 2.0 | Variante con contexto extendido |
| Qwen/Qwen2.5-Math-1.5B (base) | 1,54B | 4.096 | 10.000 | Apache 2.0 | Modelo original sin extension |
| open-r1/Qwen2.5-Math-7B-RoPE-300k | ~7B | 32.768 | 300.000 | Apache 2.0 | Version de 7B con la misma extension |

La diferencia principal entre esta variante y el modelo base es la ventana de contexto (32K frente a 4K) y la frecuencia de RoPE. La version de 7B ofrece mayor capacidad de razonamiento pero requiere aproximadamente el doble de VRAM (~14 GB en BF16).

## Limitaciones y advertencias

- No es un modelo de chat: carece de ajuste por instrucciones; para uso conversacional se requiere SFT previo.
- Especializacion matematica: su conocimiento general y de codigo es limitado en comparacion con modelos generalistas del mismo tamano.
- Extension de contexto sin reentrenamiento: al no haberse reentrenado con contextos largos, la calidad del razonamiento en los ultimos tokens de la ventana de 32K puede degradarse respecto a los primeros 4K.
- Sesgos y alucinaciones: no se documentan sesgos especificos, pero al ser un modelo matematico puede generar razonamientos incorrectos con alta confianza, especialmente en problemas poco representados en sus datos de entrenamiento.
- Idiomas: la informacion disponible no especifica los idiomas soportados; se asume ingles y chino por la serie Qwen2.5-Math, pero no esta confirmado para esta variante.
- Sin cuantizaciones oficiales: el repo solo contiene safetensors en
