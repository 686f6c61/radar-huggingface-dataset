# gowravvishwakarma/qllm-pam2-sci1-386m

## Resumen

SCI-1 (PAM-2, 386M) es un modelo de lenguaje recurrente de 385.817.038 parámetros desarrollado por gowravvishwakarma, construido sobre Phase-Associative Memory (PAM-2), la variante de valor real del linaje qllm2 `v13_sempty`. No es un transformer ni un Mamba: no hay atención. Todo el pasado se almacena en siete memorias matriciales de tamano fijo (6 cuadernos con regla delta + 1 memoria de eco, cada una de 8 cabezas × 128 × 128), lo que supone 3,5 MiB de estado por secuencia en fp32 independientemente de la longitud de contexto, con coste constante por token.

El modelo resuelve el problema de mantener reglas y hechos aprendidos en el prompt mas alla de la ventana de entrenamiento. Entrenado únicamente con ventanas de 4.096 tokens, conserva reglas inferidas de ejemplos dispersos hasta 2× y 4× esa longitud (0,94 y 0,69 en desplazamiento simbólico; 0,99 y 0,89 en mapas afines) y recupera un hecho declarado hasta 8× (0,78 a 32k). Es un checkpoint de investigación, no un asistente pulido: es un modelo base cuyo mix de preentrenamiento incluye datos de chat en formato ChatML, y el autor anuncia una versión con SFT por separado.

Su relevancia actual radica en que ofrece una alternativa sin caché KV a los transformers y a los modelos de espacio de estados, con estado de inferencia constante y evidencia controlada de generalización en longitud. Los pesos se distribuyen como un único fichero PyTorch fp32 de 1,54 GB, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente con Phase-Associative Memory (PAM-2), sin atención, no transformer |
| Parametros totales | 385.817.038 (embedding de entrada/salida atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenado con 4.096 tokens; evaluado hasta 32.768 tokens (8×) |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`sci1_386m_49b.pt`, fp32, 1,54 GB; contiene `config` + `model_state_dict` + paso/tokens) |

## Arquitectura y entrenamiento

SCI-1 abandona la atención por completo. El estado recurrente se compone de siete memorias matriciales de tamano fijo: seis cuadernos que aplican la regla delta y una memoria de eco, cada uno con 8 cabezas de 128 × 128. El estado total es de 3,5 MiB por secuencia en fp32 sea cual sea la longitud de contexto, y el coste computacional por token es constante. La variante PAM-2 es la rama de valor real del trabajo qllm2, descrito en el paper arXiv:2604.05030.

El entrenamiento comprende 749.500 pasos y 49,12B tokens con longitud de secuencia de 4.096. El mix de preentrenamiento incluye web, libros, código, documentos con ejemplos resueltos de reglas (desplazamiento simbólico y mapas afines) y datos de chat en formato ChatML. El vocabulario es GPT-2 BPE ampliado a 50.261 tokens con cuatro tokens adicionales: inicio y fin de ChatML y las etiquetas de pensamiento (ids 50257-50260). No se documenta en la información disponible el uso de RLHF o DPO; el autor describe el checkpoint como modelo base y anuncia una versión SFT aparte.

## Capacidades

- Generación de texto autoregresiva en inglés, con finalización de texto plano.
- Conversación en formato ChatML, incluyendo las etiquetas de pensamiento incluidas en el vocabulario.
- Inferencia de reglas en contexto a partir de ejemplos dispersos (desplazamiento simbólico y mapas afines), generalizando a valores de regla no vistos en entrenamiento.
- Recuperación exacta de pares clave-valor en contextos largos, con precisión de 1,00 hasta 2k tokens y 0,78 a 32k.
- Razonamiento de un solo paso orientado a selección entre candidatos (tarea de 8 opciones).
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: estado de inferencia de tamano fijo sin caché KV; no hay visión ni audio.

## Casos de uso

- Evaluación de arquitecturas sin atención: el modelo sirve como referencia reproducible para medir generalización en longitud frente a transformers y modelos de espacio de estados, gracias a su estado fijo de 3,5 MiB y a los resultados publicados con semillas y checkpoint verificable.
- Recuperación de hechos en documentos largos con memoria acotada: en escenarios donde el coste de caché KV es prohibitivo (servicios con muchas secuencias concurrentes), el estado constante por secuencia permite mantener conversaciones o contextos de decenas de miles de tokens con 3,5 MiB por petición.
- Investigación en aprendizaje en contexto: los documentos con ejemplos resueltos de reglas permiten estudiar cómo un modelo recurrente infiere y aplica reglas dispersas más allá de su ventana de entrenamiento.
- Prototipado de asistentes conversacionales en inglés: al incluir ChatML en el mix de preentrenamiento, puede sostener conversaciones multi-turno básicas para demos y pruebas de integración antes de pasar a un modelo ajustado.
- Experimentos de destilación y comparación de recetas: al compartir tokenizador GPT-2 BPE y código con la línea qllm2, es útil para comparar recetas de entrenamiento con presupuestos de datos equivalentes.
- Docencia y reproducción de resultados: el fichero único fp32 con configuración y estado facilita reproducir las tablas del model card en entornos de laboratorio con una sola GPU.

## Benchmarks y rendimiento

Evaluación zero-shot sobre este checkpoint, con conjuntos completos de validación/test y métrica única por fila (HellaSwag y PIQA con accuracy normalizada por longitud, ARC-easy con accuracy simple):

| Modelo | HellaSwag | ARC-easy | PIQA |
|---|---|---|---|
| SCI-1, 386M, 49B tokens | 0,372 | 0,559 | 0,636 |
| Pythia-410M a 10,5B tokens (referencia) | 0,297 | 0,434 | 0,607 |
| Pythia-410M final, 300B tokens (referencia) | 0,406 | 0,519 | 0,672 |

Accuracy simple de SCI-1: HellaSwag 0,320, PIQA 0,638.

Regla inferida en contexto (8 ejemplos dispersos, 8 candidatos, azar 0,125; n = 400 por celda):

| Dispersión de ejemplos | × longitud de entrenamiento | Desplazamiento simbólico | Mapa afín |
|---|---|---|---|
| 0 (adyacentes) | – | 1,00 | 1,00 |
| 2.048 tokens | 0,5× | 0,98 | 1,00 |
| 4.096 tokens | 1× | 0,97 | 1,00 |
| 8.192 tokens | 2× | 0,94 | 0,99 |
| 16.384 tokens | 4× | 0,69 | 0,89 |
| 32.768 tokens | 8× | 0,20 | 0,58 |

Recuperación exacta de pares clave-valor (n = 360 por longitud):

| Contexto | 128–2k | 4k (1×) | 8k (2×) | 16k (4×) | 32k (8×) |
|---|---|---|---|---|---|
| Accuracy | 1,00 | 0,99 | 0,98 | 0,94 | 0,78 |

A 32k la precisión depende de la posición del hecho: 0,58 al inicio, 0,77 en el medio y 1,00 cerca del final.

Comparación controlada a ~103M parámetros con receta, código, tokenizador y datos idénticos (no es una comparación con este checkpoint):

| A ~103M, mismos datos | PAM-2 | Transformer++ | Mamba-2 |
|---|---|---|---|
| Regla desde 8 ejemplos, 2k–4k (1,0B tokens) | 0,52 | 0,07 | 0,15 |
| Igual, 600M tokens (3 semillas para PAM-2) | 0,65 / 0,69 / 0,74 | 0,13 | 0,10–0,12 |
| Igual, 1,5B tokens | 0,58 | 0,05 | 0,03 |
| Recuerdo de hechos a 16k = 4× ventana (1,0B tokens) | 0,41 | 0,13 | 0,15 |
| Recuerdo a 16k con documentos de reglas en los datos de todos | 0,79–0,87 | 0,08 | 0,42 |
| Media de seis benchmarks (3B tokens) | 0,403 | 0,406 | 0,415 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos fp32 ocupan 1,54 GB; con overhead de activaciones y estado recurrente (3,5 MiB por secuencia) la inferencia cabe holgadamente en GPUs de 8 GB. No se publican cuantizaciones, por lo que no hay estimaciones para fp16, int8 o int4.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM para fp32; una RTX 4090 o A100/H100 no son necesarias para el modelo, pero aceleran el throughput en evaluación por lotes.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores (por ejemplo RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: los pesos se distribuyen como checkpoint PyTorch propio (`sci1_386m_49b.pt`) con código en github.com/gowrav-vishwakarma/qllm2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible. La arquitectura garantiza coste por token constante y estado independiente de la longitud de contexto, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCI-1 (PAM-2) | 386M | Entrenado a 4k; evaluado a 32k | HellaSwag 0,372, ARC-e 0,559, PIQA 0,636 | MIT | Hugging Face, pesos fp32 |
| Pythia-410M | 410M | 2.048 tokens | HellaSwag 0,406, ARC-e 0,519, PIQA 0,672 (300B tokens) | Apache 2.0 (referencia habitual) | Hugging Face |
| PAM-2 ~103M (misma receta) | ~103M | 4k de entrenamiento | Regla 2k–4k: 0,52–0,74; recuerdo a 16k: 0,41 | MIT (línea qllm2) | Repositorio del autor |
| Transformer++ ~103M (misma receta) | ~103M | 4k | Regla 2k–4k: 0,05–0,13; recuerdo a 16k: 0,13 | no disponible | Repositorio del autor |
| Mamba-2 ~103M (misma receta) | ~103M | 4k | Regla 2k–4k: 0,03–0,15; recuerdo a 16k: 0,15–0,42 | no disponible | Repositorio del autor |

No se dispone de un Transformer++ ni un Mamba-2 a 386M en la información proporcionada; las comparaciones controladas del autor se limitan a ~103M.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un asistente ajustado; el autor anuncia una versión SFT por separado.
- Solo declara inglés; no hay evidencia de capacidades multilingües.
- El prompt few-shot abierto en otros formatos es mucho más débil a este tamano que el formato de ejemplos resueltos usado en las evaluaciones.
- La generalización en longitud decae: la regla inferida cae a 0,69 (desplazamiento) y 0,89 (afín) a 4× y a 0,20 y 0,58 a 8×; el recuerdo exacto baja a 0,78 a 32k y depende de la posición del hecho (0,58 al inicio).
- Un hecho escrito en prosa y preguntado en lenguaje natural no se conserva a esas longitudes, según el propio model card.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo base sin ajuste, es esperable en generación abierta.
- Sesgos conocidos: no documentados; el mix incluye web, libros, código y chat, con los sesgos habituales de esos datos.
- Licencia MIT: permite uso comercial, pero el modelo no está validado para producción y carece de garantías.
- No se publican cuantizaciones ni soporte para runners estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su despliegue fuera del código del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gowravvishwakarma/qllm-pam2-sci1-386m
- Modelo anterior de la línea (PAM V11, complejo): https://huggingface.co/gowravvishwakarma/qllm-pam-v11-e3k3-chat
- Código qllm2 (carpeta `v13_sempty/`, notas `v16/`): https://github.com/gowrav-vishwakarma/qllm2
- Paper de PAM: https://arxiv.org/abs/2604.05030
