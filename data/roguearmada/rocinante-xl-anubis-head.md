# roguearmada/rocinante-xl-anubis-head

## Resumen

Rocinante-XL Anubis-Diction Head es un kit de pesos publicado por el usuario roguearmada en Hugging Face. No es un modelo completo, sino una colección de cabezas de salida (`lm_head`) para el modelo TheDrummer/Rocinante-XL-16B-v1, un finetune etiquetado como orientado a escritura creativa. El repositorio contiene ficheros `.pt` con la cabeza original (`lm_head_a0.0.pt`), una cabeza entrenada de forma independiente (`lm_head_trained.pt`) y varias interpolaciones lineales entre ambas con valores de alpha de 0,05 a 0,4.

La propuesta técnica consiste en sustituir únicamente el tensor `lm_head.weight` del modelo base por uno de estos ficheros, dejando intacto el resto del tronco. Así se modifica la distribución de salida —el registro léxico o "diction"— sin reentrenar ni alterar el transformer subyacente. Es una variante de las técnicas de intervención en tiempo de inferencia, aplicada aquí sobre la proyección al vocabulario en lugar de sobre activaciones internas.

El interés del artefacto es acotado pero concreto: permite experimentar con control de estilo en generación creativa con un coste de almacenamiento muy inferior al de un reentrenamiento completo. El repositorio no incluye model card detallada, benchmarks ni texto de licencia más allá de la etiqueta "other", y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que debe considerarse material experimental sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (el repositorio se etiqueta como "mistral"); este repositorio solo distribuye la capa `lm_head`, no el modelo completo |
| Parámetros totales | no disponible para el kit; no confirmado para el modelo base (el nombre del modelo base sugiere ~16B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en `.pt`, sin versiones GGUF, AWQ, GPTQ ni EXL2 en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia en la información disponible) |
| Formato de pesos | `.pt` (PyTorch); ficheros en `heads/lm_head_a<alpha>.pt`, `heads/lm_head_a0.0.pt` y `heads/lm_head_trained.pt` |
| Modelo base | TheDrummer/Rocinante-XL-16B-v1 |
| Tamaño del repositorio | 13,4 GB |
| Autor | roguearmada |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-16 / 2026-09-17 |

## Arquitectura y entrenamiento

El artefacto es una intervención sobre la última capa lineal del modelo base: la matriz que proyecta el estado oculto final al vocabulario. El README indica que `lm_head_a0.0.pt` es la cabeza original y `lm_head_trained.pt` la cabeza totalmente entrenada, mientras que los ficheros `a0.05` a `a0.4` son interpolaciones entre ambas. No se especifica la aritmética exacta de la interpolación (lineal en pesos, SLERP u otra), ni el conjunto de datos, el número de tokens ni el procedimiento de optimización empleados para obtener la cabeza entrenada.

Tampoco se documenta si hubo RLHF, DPO u otra fase de alineamiento, ni si la cabeza entrenada se ajustó con el tronco congelado o de forma conjunta. Al mantener la forma del tensor (dimensión de vocabulario por dimensión oculta), el intercambio no altera el grafo computacional ni el número de operaciones por token: el coste de inferencia del modelo resultante es idéntico al del base. La innovación, por tanto, no está en la arquitectura sino en el método de control de estilo: separar el "qué se dice" (tronco) del "cómo se dice" (cabeza) y ofrecer un dial continuo de mezcla entre dos cabezas mediante el parámetro alpha.

## Capacidades

- El kit no aporta capacidades propias: hereda íntegramente las del modelo base TheDrummer/Rocinante-XL-16B-v1, que no se documentan en este repositorio.
- Control de registro léxico y estilo de superficie mediante el parámetro alpha, con diez variantes publicadas (0,0; 0,05; 0,1; 0,15; 0,2; 0,25; 0,3; 0,35; 0,4 y la cabeza totalmente entrenada).
- Generación de texto creativo: es el caso de uso declarado por las etiquetas del repositorio ("creative-writing"), sujeto a las capacidades reales del tronco.
- Interpolación de pesos: permite experimentar con mezclas continuas entre dos distribuciones de salida.
- Soporte de tool calling / function calling: no disponible (no se documenta para el base ni para el kit).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible; el tronco es un modelo de lenguaje, no multimodal según la información disponible.

## Casos de uso

- Ajuste de estilo narrativo sin reentrenamiento: sustituir `lm_head.weight` por cada variante alpha y generar el mismo prompt con el mismo tronco permite aislar el efecto del registro léxico sobre la prosa, algo útil para autores y editores que quieren comparar tonos con un único modelo cargado.
- Investigación en interpretabilidad: dado que el tronco es idéntico entre variantes, cualquier diferencia en las salidas es atribuible a la capa de salida, lo que convierte al kit en un banco de pruebas controlado para estudiar qué información codifica la matriz de proyección al vocabulario.
- Evaluación A/B de estilo en pipelines de contenido: un equipo editorial puede servir dos variantes (por ejemplo alpha 0,1 frente a la cabeza entrenada) tras el mismo endpoint y medir preferencia humana o métricas automáticas de repetición y diversidad léxica.
- Reducción de repeticiones y "slop" léxico: si la cabeza entrenada se ajustó para penalizar fórmulas repetitivas, seleccionar un alpha intermedio puede mitigar la monotonía típica de los finetunes de escritura creativa sin tocar el tronco.
- Docencia y formación técnica: es un ejemplo compacto y de bajo coste para explicar la diferencia entre ajustar un subcomponente y hacer un finetune completo, y para ilustrar el intercambio de tensores en formatos PyTorch.
- Punto de partida para model merging: las cabezas publicadas pueden servir como componente en mezclas más amplias (por ejemplo combinar una cabeza estilística con un tronco afinado por otro autor) siempre que dimensiones y tokenizador coincidan.
- Despliegue de variantes de un mismo modelo: en un servicio con vLLM o TGI se pueden mantener varias instancias ligeras que compartan tronco lógico y difieran solo en la cabeza, simplificando el despliegue de estilos personalizados por cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones entre los distintos valores de alpha, y los resultados de la búsqueda web no contienen material relevante sobre este artefacto.

## Requisitos de hardware

- Almacenamiento: 13,4 GB para el repositorio completo; un solo fichero de cabeza es una fracción de ese tamaño, por lo que conviene descargar únicamente la variante deseada.
- VRAM adicional para el intercambio de cabeza: nula, siempre que la forma del tensor coincida con la del modelo base; la memoria del modelo resultante es la misma que la del base.
- VRAM para el modelo base (~16B, estimaciones orientativas, no confirmadas en la información disponible): bf16/fp16 en torno a 32 GB de pesos más caché KV; int8 alrededor de 16 GB; Q4_K_M en torno a 9-10 GB; Q5 en torno a 11 GB; Q8 en torno a 17 GB.
- GPU recomendadas: A100 40 GB o 80 GB y H100 para bf16 sin cuantizar con contexto largo; RTX 4090 o RTX 3090 (24 GB) para Q4, Q5 y Q8; tarjetas de 16 GB (RTX 4080, 4070 Ti Super) para Q4 con margen reducido.
- Cabe en GPU de consumo: sí, con cuantización de 4 a 8 bits en GPU de 16-24 GB, o con reparto entre GPU y CPU en tarjetas de 12 GB.
- Opciones de despliegue: vLLM o TGI para pesos convertidos a safetensors; llama.cpp y Ollama requieren convertir previamente el modelo a GGUF. El repositorio no publica ninguna receta de conversión ni versiones preconvertidas.
- Latencia y throughput: no disponible. Al no variar la forma ni el número de operaciones, se espera un rendimiento equivalente al del modelo base con el mismo backend y cuantización, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Artefacto | Qué modifica | Parámetros afectados | Coste de obtención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rocinante-XL Anubis-Diction Head (este repo) | Solo `lm_head.weight`, con 10 variantes de mezcla | Tamaño de la cabeza (vocab x dimensión oculta); no disponible en la información | No disponible; requiere descargar 13,4 GB | other, sin texto | Repositorio con 0 descargas y 0 likes |
| TheDrummer/Rocinante-XL-16B-v1 (modelo base) | Modelo completo | No confirmado (~16B según el nombre) | Finetune completo del autor original | No disponible en esta búsqueda | Modelo público en Hugging Face |
| Finetune completo del mismo tronco | Todos los pesos | ~16B | Elevado (GPU-días a GPU-semanas) | Depende del autor | Categoría genérica |
| Adaptador LoRA/QLoRA sobre el mismo tronco | Matrices de bajo rango en las capas elegidas | Típicamente 0,1-2 % del total | Bajo (horas en una GPU de consumo) | Depende del autor | Categoría genérica |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas concretas de la misma categoría (finetunes de escritura creativa de tamaño similar), por lo que la comparación anterior es estructural y no de calidad.

## Limitaciones y advertencias

- Artefacto sin validación: 0 descargas y 0 likes, sin model card extensa, sin evaluación y sin terceros que hayan replicado los resultados.
- Procedencia de la cabeza entrenada no documentada: se desconoce el dataset, el número de pasos, la función de pérdida y si el tronco permaneció congelado, lo que impide auditar qué se ha aprendido.
- Licencia "other" sin texto: no se especifican permisos de uso comercial, redistribución ni obras derivadas. Además, la licencia del modelo base TheDrummer/Rocinante-XL-16B-v1 sigue aplicándose al conjunto, y tampoco se detalla en la información disponible.
- Incompatibilidad de formato: los pesos están en `.pt`. Muchos entornos de producción esperan safetensors o GGUF, por lo que habrá que convertir y verificar que el intercambio de `lm_head.weight` es correcto antes de desplegar.
- Acoplamiento estricto al tronco: una cabeza entrenada por separado puede desalinearse del tronco para el que se generó. Sustituirla en otro finetune, otra revisión del modelo o un modelo distinto puede degradar gravemente la coherencia.
- Riesgo de degeneración: las cabezas ajustadas de forma aislada pueden producir repeticiones, colapso de vocabulario, pérdida de instrucciones o salidas fuera de distribución. La interpolación con alpha no garantiza una degradación monótona ni suave; conviene evaluar cada variante.
- Alucinación y sesgos: no hay información específica para este kit; se heredan los del modelo base, que tampoco se documentan aquí.
- Idiomas y cobertura: no se especifican los idiomas soportados ni el comportamiento fuera del inglés, si el base estuviera entrenado principalmente en ese idioma.
- Contexto: se desconoce la ventana de contexto efectiva tanto del tronco como de la cabeza, dato crítico para aplicaciones de documento largo.
- Fechas del repositorio: creado el 2026-09-16 y actualizado el 2026-09-17, lo que indica que se trata de una publicación muy reciente y probablemente en evolución.

## Enlaces

- Repositorio del kit: https://huggingface.co/roguearmada/rocinante-xl-anubis-head
- Modelo base: https://huggingface.co/TheDrummer/Rocinante-XL-16B-v1
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su autor, sus benchmarks o su licencia; los resultados obtenidos no guardan relación con el artefacto.
