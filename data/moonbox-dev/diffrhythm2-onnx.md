# moonbox-dev/DiffRhythm2-ONNX

## Resumen

DiffRhythm2-ONNX es la conversión a formato ONNX del modelo DiffRhythm 2, un sistema de generación de música y canciones a partir de texto desarrollado originalmente por ASLP-lab y empaquetado por Moonbox para su ejecución en dispositivo mediante ONNX Runtime. El modelo base pertenece a la familia DiffRhythm, que emplea flow matching sobre latentes de audio para sintetizar piezas musicales completas condicionadas por una descripción textual de estilo y una letra. Esta versión ONNX no introduce cambios arquitectónicos: es una cuantización y exportación del modelo original, con grafos separados para el DiT (diffusion transformer), el decodificador de códec, los embeddings de texto y latentes, y un `pipeline.py` que orquesta features, prompt, bucle de muestreo y ventanas de códec.

La relevancia de esta ficha reside en que permite ejecutar generación de música en CPU, CUDA o DirectML sin depender de PyTorch, lo que facilita el despliegue en entornos de escritorio, navegador o dispositivos con aceleradores heterogéneos. El repositorio ocupa 5,9 GB e incluye dos precisiones publicadas en la información disponible (fp16 e int8), con métricas de similitud MuLan y RTF medidas frente al modelo original. La licencia es Apache 2.0, lo que permite uso comercial con las obligaciones habituales de atribución.

No se dispone de información sobre el número de parámetros totales, la longitud de contexto en tokens ni los idiomas soportados en la documentación proporcionada; estos datos deben consultarse en la model card del modelo base ASLP-lab/DiffRhythm2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching sobre latentes de audio con DiT (diffusion transformer) y decodificador de códec; exportada a grafos ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16, int8 (int4 referenciado en el listado de archivos, sin métricas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con datos externos `.onnx.data`), tokenizador JSON, pipeline en Python |

## Arquitectura y entrenamiento

El modelo base DiffRhythm 2 sigue un esquema de generación musical basado en flow matching: un diffusion transformer (DiT) opera sobre representaciones latentes de audio y genera la señal que posteriormente decodifica un códec neuronal. La exportación ONNX separa el grafo en componentes independientes: `dit.onnx` (con sus datos externos en `dit.onnx.data`), `decoder.onnx`, `text_embed.onnx`, `latent_embed.onnx` y `style_text.onnx`, además de un tokenizador de estilo. El script `pipeline.py` implementa la lógica de preprocesado de features, construcción del prompt, bucle de muestreo y segmentación por ventanas de códec, de modo que los grafos ONNX solo reciben y devuelven tensores.

No se han proporcionado detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La información disponible se limita al proceso de conversión y a las métricas de fidelidad frente al modelo original.

## Capacidades

- Generación de música a partir de texto (text-to-music) y generación de canciones con letra y estilo condicionados.
- Síntesis de audio completo mediante flow matching sobre latentes, con decodificación por códec neuronal.
- Condicionamiento por estilo textual a través de `style_text.onnx` y su tokenizador.
- Ejecución en ONNX Runtime con backends CPU, CUDA y DirectML.
- Inferencia en dispositivo sin dependencia de PyTorch.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Generación de bandas sonoras para prototipos de videojuegos: el modelo produce pistas musicales a partir de descripciones de estilo, integrable en el pipeline de assets mediante ONNX Runtime en la máquina del desarrollador.
- Creación de maquetas musicales en aplicaciones de escritorio: al ejecutarse con DirectML o CPU, puede incorporarse en herramientas nativas de Windows sin requerir GPU dedicada ni entorno Python con PyTorch.
- Servicios de generación musical en el navegador o en edge: la exportación ONNX permite desplegar inferencia en entornos con ONNX Runtime Web o en dispositivos con aceleradores limitados.
- Personalización de música de fondo para contenido audiovisual: el condicionamiento por estilo y letra permite adaptar la pieza a la temática de un vídeo o pódcast de forma automatizada.
- Investigación en generación de audio: los grafos separados facilitan el estudio y la sustitución de componentes (DiT, decodificador, embeddings) en experimentos académicos.
- Despliegue en servidores con CUDA para generación por lotes: la variante fp16 reporta un RTF de 0,38 en CUDA, adecuada para producir varias piezas en paralelo en pipelines de renderizado.
- Pruebas de accesibilidad y demos interactivas: la variante int8, con RTF de 0,95 en CUDA, permite ejecución casi en tiempo real en hardware modesto para demostraciones.

## Benchmarks y rendimiento

| Precisión | MuLan similarity | Primer bloque (dB vs float32) | RTF (CUDA) |
|---|---|---|---|
| fp16 | 0,532 / 0,561 (original fp16: 0,513 / 0,547) | 37 / 35 (original fp16: 56 / 54) | 0,38 |
| int8 | 0,582 / 0,551 | 41 / 36 | 0,95 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo es de generación musical y no de texto.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 5,9 GB; la variante fp16 requiere aproximadamente 3,8 GB de pesos (DiT 2,16 GB + decoder 263,8 MB + style_text 657 MB + embeddings), mientras que int8 ronda 2,1 GB (DiT 1,08 GB + decoder 132,9 MB + style_text 907 MB).
- GPU recomendadas: para fp16 en CUDA, una RTX 4090 o A100/H100 ofrecen margen holgado; para int8, una RTX 3060 o superior es suficiente.
- Cabe en GPU de consumo: sí, tanto fp16 como int8 en GPUs con 6-8 GB de VRAM; int8 también es viable en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) con el `pipeline.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,38 en fp16 con CUDA y 0,95 en int8 con CUDA; es decir, fp16 genera audio más rápido que tiempo real en CUDA, mientras que int8 se acerca al tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| DiffRhythm2-ONNX (este) | Text-to-music, flow matching | no disponible | no disponible | Apache 2.0 | ONNX (fp16, int8) | Hugging Face |
| ASLP-lab/DiffRhythm2 | Text-to-music, flow matching | no disponible | no disponible | no disponible en la información | PyTorch (modelo base) | Hugging Face |
| DiffRhythm (versión original, arXiv:2503.01183) | Text-to-music | no disponible | no disponible | no disponible | no disponible | Referenciado en tags |

No se dispone de datos suficientes para comparar con alternativas como MusicGen, AudioLDM o Stable Audio en la información proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo; al ser un modelo generativo de audio, puede reproducir estilos presentes en sus datos de entrenamiento y carecer de diversidad musical en ciertos géneros.
- Riesgo de alucinación en el sentido de generar audio que no se ajuste fielmente al prompt o a la letra proporcionada; las métricas MuLan muestran similitud moderada, no perfecta.
- No se dispone de información sobre limitaciones de contexto, duración máxima de audio o idiomas soportados en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base ASLP-lab/DiffRhythm2 y de los datos de entrenamiento originales antes de un despliegue comercial.
- La variante int8 presenta menor fidelidad en el primer bloque (36-41 dB frente a 54-56 dB del original fp16), lo que puede afectar a la calidad de audio en producciones exigentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.
- No se documentan garantías de soporte ni mantenimiento por parte de Moonbox.

## Enlaces

- [Hugging Face: moonbox-dev/DiffRhythm2-ONNX](https://huggingface.co/moonbox-dev/DiffRhythm2-ONNX)
- [Modelo base: ASLP-lab/DiffRhythm2](https://huggingface.co/ASLP-lab/DiffRhythm2)
- [Paper DiffRhythm 2 (arXiv:2510.22950)](https://arxiv.org/abs/2510.22950)
- [Paper DiffRhythm original (arXiv:2503.01183)](https://arxiv.org/abs/2503.01183)
