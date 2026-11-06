# Icecoffee3212/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es la variante compacta de la familia DeepSeek-V4, una serie de modelos de lenguaje con arquitectura Mixture-of-Experts (MoE) desarrollada por DeepSeek AI. Con 284.000 millones de parametros totales y 13.000 millones activados por token, esta version busca ofrecer un equilibrio entre capacidad de razonamiento y eficiencia computacional, soportando una longitud de contexto de un millon de tokens.

La innovacion principal de la serie V4 reside en su arquitectura de atencion hibrida, que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA) para reducir drasticamente el coste computacional en contextos largos. Segun la documentacion del autor, en el escenario de 1M tokens el modelo Pro requiere solo el 27% de los FLOPs de inferencia por token y el 10% del KV cache en comparacion con DeepSeek-V3.2. La variante Flash hereda estas optimizaciones con un menor numero de parametros activos.

El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial, y se ha preentrenado con mas de 32 billones (32T) de tokens. La model card describe un pipeline de postentrenamiento en dos etapas: cultivo independiente de expertos por dominio mediante SFT y RL con GRPO, seguido de consolidacion mediante destilacion on-policy. Esta ficha se basa exclusivamente en la informacion disponible en el repositorio de Hugging Face y en la model card publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida CSA + HCA y conexiones mHC |
| Parametros totales | 290.944.616.402 (segun safetensors); 284B segun la model card |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8); tags indican 8-bit y fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash emplea una arquitectura transformer con capas Mixture-of-Experts, en la que se activan 13.000 millones de parametros de un total de 284.000 millones por token procesado. La innovacion arquitectonica central es un mecanismo de atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), disenado para mejorar la eficiencia en contextos extremadamente largos. Adicionalmente, el modelo incorpora Manifold-Constrained Hyper-Connections (mHC), que refuerzan las conexiones residuales convencionales para mejorar la estabilidad de la propagacion de senales entre capas manteniendo la expresividad del modelo.

El preentrenamiento se realizo sobre mas de 32 billones de tokens diversos y de alta calidad. El pipeline de postentrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos independientes por dominio mediante SFT y RL con GRPO (Group Relative Policy Optimization), y despues se consolidan en un unico modelo mediante destilacion on-policy. El entrenamiento utiliza el optimizador Muon, que segun el autor proporciona una convergencia mas rapida y mayor estabilidad. La model card menciona que la variante Flash-Max, con un mayor presupuesto de razonamiento, alcanza un rendimiento comparable al modelo Pro en tareas de razonamiento, aunque queda ligeramente por detras en tareas de conocimiento puro y flujos agénticos complejos.

## Capacidades

- Generacion de texto y razonamiento general, con modo de razonamiento extendido (Flash-Max) que permite ajustar el presupuesto de pensamiento.
- Procesamiento de contextos de hasta un millon de tokens, adecuado para documentos extensos, repositorios de codigo completos o historiales de conversacion muy largos.
- Razonamiento matematico y cientifico, respaldado por los resultados en benchmarks como MMLU, MMLU-Pro, C-Eval y CMMLU.
- Capacidades multilingues: la model card reporta resultados en MMMLU (multilingue) y C-Eval/CMMLU (chino), aunque no se detalla la lista completa de idiomas soportados.
- Razonamiento agéntico y multi-paso: la model card menciona tareas agénticas y flujos de trabajo complejos como area de evaluacion.
- No se dispone de informacion explicita sobre soporte de tool calling, vision, audio u otras modalidades en la documentacion proporcionada.

## Casos de uso

- Analisis de repositorios de codigo completos: con un contexto de 1M tokens, el modelo puede ingerir grandes bases de codigo y responder preguntas sobre arquitectura, dependencias o posibles bugs sin necesidad de fragmentar el contenido.
- Procesamiento de documentacion legal y contractual: la ventana de contexto permite analizar contratos extensos, comparar clausulas entre documentos y extraer obligaciones en una sola pasada, reduciendo la perdida de contexto que sufren modelos con ventanas menores.
- Razonamiento matematico asistido: los resultados en benchmarks como MMLU-Pro (68,3 en la variante Base) lo sitúan como una opcion para tutoria o resolucion de problemas matematicos paso a paso, especialmente en modo de razonamiento extendido.
- Atencion al cliente con historial largo: la capacidad de mantener contexto de hasta un millon de tokens facilita conversaciones multi-turno con historial extenso, sin truncar interacciones previas del cliente.
- Investigacion academica y revision de literatura: el modelo puede procesar multiples articulos o un unico paper muy extenso y generar resumenes, comparativas o extraer metodologias, aprovechando su ventana de contexto y sus resultados en MMLU y AGIEval.
- Generacion y revision de codigo en pipelines de CI/CD: aunque la model card no detalla tool calling, su rendimiento en tareas de codigo y su licencia MIT permiten integrarlo en flujos de revision automatizada, generacion de tests o documentacion tecnica.
- Procesamiento de datos en chino e ingles: los resultados en C-Eval (92,1) y CMMLU (90,4) en la variante Base lo hacen adecuado para aplicaciones que requieran comprension nativa de contenido en chino, ademas del ingles.

## Benchmarks y rendimiento

Resultados publicados en la model card para los modelos Base (no se proporcionan resultados para la variante instruct/Flash final):

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Parametros activados | - | 37B | 13B | 49B |
| Parametros totales | - | 671B | 284B | 1.6T |
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

No se han publicado en la informacion disponible resultados de benchmarks para la variante instruct (DeepSeek-V4-Flash sin sufijo Base), ni datos de HumanEval, GSM8K u otros benchmarks de codigo y matematicas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 159,6 GB en precision FP4 + FP8 mixta. En FP8 se necesitarian aproximadamente 284 GB solo para pesos, mas el KV cache. Con cuantizacion a 4 bits (si estuviera disponible para todos los parametros) se podria reducir a unos 142 GB, aunque la model card solo documenta FP4 + FP8 mixto.
- GPU recomendadas: para inferencia en precision completa se requieren multiples aceleradores de datacenter (H100 80GB, H200, A100 80GB). Con 159,6 GB de pesos en FP4+FP8, se necesitarian al menos 2 GPU de 80 GB o 3 GPU de 80 GB para acomodar pesos y cache.
- No cabe en GPU de consumo (RTX 4090 24GB, RTX 5090 32GB) en su formato publicado. Seria necesaria cuantizacion agresiva adicional no documentada por el autor.
- Opciones de despliegue: la model card no especifica frameworks de inferencia compatibles mas alla de la libreria transformers. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card menciona que en contexto de 1M tokens el modelo Pro requiere el 27% de FLOPs por token y el 10% de KV cache respecto a V3.2, pero no se proporcionan cifras absolutas para la variante Flash.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU (Base) | MMLU-Pro (Base) |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | 88,7 | 68,3 |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | MIT | 90,1 | 73,5 |
| DeepSeek-V3.2 | 671B | 37B | no disponible | no disponible | 87,8 | 65,5 |

La comparativa se limita a los modelos incluidos en la model card. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion facticamente incorrecta, especialmente en tareas de conocimiento especializado o con contextos muy largos donde la atencion puede degradarse.
- Sesgos conocidos: no se documentan en la model card, pero al entrenarse con datos web a gran escala es probable que herede sesgos presentes en esos datos.
- Idiomas: no se publica la lista completa de idiomas soportados. Los benchmarks sugieren buen rendimiento en ingles y chino, pero el rendimiento en otros idiomas no esta documentado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones significativas, pero se recomienda verificar el texto completo de la licencia en el repositorio.
- Caveat de produccion: el modelo se distribuye en precision FP4 + FP8 mixta, lo que puede afectar a la calidad en comparacion con una version en BF16. Ademas, el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o no verificada por la comunidad.
- El identificador del repositorio (Icecoffee3212/DeepSeek-V4-Flash) no coincide con la organizacion oficial deepseek-ai, lo que podria indicar una re-subida no oficial. Se recomienda contrastar con el repositorio oficial antes de su uso en produccion.
- No se documenta soporte de tool calling ni capacidades multimodales, lo que limita su uso en flujos agénticos que requieran esas funciones.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Icecoffee3212/DeepSeek-V4-Flash
- Repositorio oficial (segun model card): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- ModelScope oficial: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Pagina de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter de DeepSeek: https://twitter.com/deepseek_ai
