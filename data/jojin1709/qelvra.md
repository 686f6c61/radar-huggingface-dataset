# jojin1709/qelvra

## Resumen

QELVRA es un modelo de lenguaje experimental de tipo transformer causal decoder-only, desarrollado por el usuario jojin1709 y publicado bajo licencia MIT. Su característica diferencial es que opera exclusivamente a nivel de byte: el vocabulario se compone de 256 identificadores, uno por cada byte UTF-8 posible, de modo que el tokenizador se reduce a `list(text.encode("utf-8"))` para codificar y a `bytes(ids).decode()` para decodificar. No emplea BPE, sentencepiece ni ningún tokenizador de terceros.

El modelo es deliberadamente diminuto: 1.853.568 parámetros repartidos en 4 capas, 4 cabezas de atención y una dimensión de embedding de 192, con una longitud de contexto de 128 tokens (equivalentes a 128 bytes). Se entrenó desde cero durante 5.000 pasos con un batch de 32, completándose en 2,66 minutos sobre GPU, y alcanzó una pérdida de validación de 0,0341. La arquitectura, el bucle de entrenamiento y el tokenizador están implementados directamente en PyTorch, sin depender de la librería `transformers` ni de pesos preentrenados.

La relevancia del modelo es principalmente didáctica y de investigación: sirve como referencia mínima, inspeccionable y reproducible de un transformer causal completo escrito a mano. Se publica como ejercicio experimental, no como un modelo apto para tareas de generación de texto reales, dado su tamaño, su contexto de 128 bytes y la ausencia de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con bloques pre-norm |
| Parametros totales | 1.853.568 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (128 bytes) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en precision original, checkpoint de ~22,6 MB) |
| Idiomas soportados | No disponible; el tokenizador es byte-level UTF-8 y no declara idiomas concretos |
| Licencia | MIT |
| Formato de pesos | State dict crudo de PyTorch (`.pt`) |

Especificaciones arquitectonicas adicionales:

| Componente | Valor |
|---|---|
| Vocabulario | 256 (un token = un byte UTF-8) |
| Dimension de embedding | 192 |
| Cabezas de atencion | 4 (dimension de cabeza 48) |
| Capas transformer | 4 |
| Dimension feed-forward | 768 |
| Dropout | 0,05 |
| Proyeccion QKV | `Linear(192 → 576)` fusionada, con sesgo |
| Layer norm final | Si |
| Weight tying | `lm_head` atado a `token_embedding` |
| Embedding posicional | 128 × 192 |
| Version del modelo | qelvra_v0.5.1 |

## Arquitectura y entrenamiento

El modelo sigue el patron clasico de un transformer causal decoder-only con normalizacion previa (pre-norm). La secuencia de bytes de entrada se proyecta mediante un embedding de tokens de 256 × 192 al que se suma un embedding posicional de 128 × 192. El cuerpo esta formado por 4 bloques identicos, cada uno compuesto por LayerNorm, atencion multi-cabeza causal y una red feed-forward de 192 → 768 → 192, ambos con conexiones residuales. La proyeccion QKV esta fusionada en una unica `Linear(192 → 576)`. La salida pasa por una LayerNorm final y por `lm_head`, que esta atado a los pesos del embedding de tokens, y produce logits sobre los 256 posibles bytes.

El entrenamiento se realizo desde cero con los siguientes hiperparametros: 5.000 pasos, tamano de batch 32, contexto de 128, tasa de aprendizaje 0,0003, weight decay 0,01 y recorte de gradiente de 1,0. El proceso completo duro 2,66 minutos sobre GPU. La perdida de validacion mas baja fue de 0,0341 (en el paso 5.000) y la perdida de entrenamiento final, 0,0348. El dataset consta de 3.402.000 tokens en total, divididos en 3.061.800 para entrenamiento, 170.100 para validacion y 170.100 para test; la model card no especifica la composicion ni la procedencia de ese corpus. No se documenta ninguna fase de RLHF, DPO ni ajuste por instrucciones, ni innovaciones como decodificacion especulativa o atencion lineal. Cada checkpoint incorpora sus hiperparametros y recuentos de tokens embebidos, y se distribuye con sumas de verificacion SHA-256 por archivo.

## Capacidades

- Generacion de texto a nivel de byte: produce secuencias de bytes UTF-8 autoregresivamente, sin tokenizador intermedio.
- Modelado de lenguaje causal: la tarea para la que fue entrenado, con perdida de validacion de 0,0341 sobre su corpus.
- Codificacion y decodificacion byte-level: cualquier texto UTF-8 puede convertirse a identificadores 0-255 y reconstruirse sin perdidas por el tokenizador.
- Inspeccion y experimentacion: al ser un modelo completamente abierto y escrito a mano, permite leer, modificar y reentrenar toda la pila.
- Inferencia en CPU y CUDA: el script de referencia selecciona CUDA si `torch.cuda.is_available()` es cierto y recurre a CPU en caso contrario.

No se documentan en la informacion disponible capacidades de razonamiento, generacion de codigo, matematicas, vision, audio, tool calling, function calling, uso como agente ni modo de pensamiento. Tampoco se declara soporte multilingue explicito mas alla del hecho de que el tokenizador, al ser byte-level, puede representar cualquier caracter Unicode.

## Casos de uso

- Estudio de arquitecturas transformer: el modelo sirve como implementacion minima y legible de un transformer causal completo; un desarrollador puede leer las 4 capas, la atencion y el FFN en el repositorio para entender el flujo de datos de principio a fin.
- Material docente en cursos de deep learning: con 1,85 M de parametros y un entrenamiento de 2,66 minutos, es viable que un alumno reproduzca el entrenamiento completo en una sesion practica y compare con la perdida publicada de 0,0341.
- Prototipado de tokenizadores byte-level: permite experimentar con esquemas de tokenizacion a nivel de byte sin depender de BPE ni sentencepiece, midiendo el efecto en la perdida sobre un corpus pequeno.
- Pruebas de integracion y CI: su carga en CPU en menos de un segundo hace que sea util como modelo de prueba para verificar pipelines de inferencia, scripts de carga de state dicts o validacion de checksums SHA-256.
- Verificacion de reproducibilidad: dado que la model card publica hiperparametros exactos, recuentos de tokens y perdidas, permite auditar si un reentrenamiento reproduce los mismos numeros.
- Experimentos de ablacion sobre contexto y tamano: con 128 tokens de contexto y 192 dimensiones de embedding, es un banco de pruebas barato para estudiar como escala la perdida al variar capas, cabezas o dimension del FFN.
- Demostraciones educativas de generacion byte a byte: ilustra de forma tangible como un modelo predice un byte detras de otro y como se reconstruye el texto, sin la capa de abstraccion de un tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento facilitados por el autor son de entrenamiento y validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor, paso 5.000) | 0,0341 |
| Perdida de entrenamiento final | 0,0348 |
| Pasos de entrenamiento | 5.000 |
| Tamano de batch | 32 |
| Tiempo de entrenamiento | 2,66 minutos (GPU) |
| Tokens totales del dataset | 3.402.000 |

Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos trataban sobre snacks y no guardan relacion con QELVRA.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision FP32 (1,85 M de parametros ≈ 7,4 MB de pesos mas embeddings y estados intermedios del contexto de 128 bytes); en la practica no hay requisito relevante de VRAM.
- GPU recomendadas: cualquier GPU con CUDA, incluidas las mas modestas; no requiere A100, H100 ni RTX 4090. La referencia del autor simplemente usa CUDA si esta disponible.
- Compatibilidad con GPU de consumo: si, cabe con enorme margen en cualquier GPU de consumo, e incluso en CPU, Raspberry Pi o entornos embebidos.
- CPU: soportada explicitamente; la carga del checkpoint (~22,6 MB) se completa en menos de un segundo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no usa `transformers` y se distribuye como state dict crudo de PyTorch. El despliegue previsto es un script de PyTorch de referencia.
- Latencia y throughput: no disponibles; no se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas por el autor que permitan situar a QELVRA frente a alternativas. Como referencia de categoria, existen otros modelos byte-level y transformers minusculos, pero no se han encontrado en la busqueda web resultados aplicables ni cifras comparables de este modelo.

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Estado |
|---|---|---|---|---|---|
| QELVRA | 1.853.568 | 128 bytes | Byte-level UTF-8 | MIT | Publicado en HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es apto para produccion: con 1,85 M de parametros y un contexto de 128 bytes, su capacidad de generar texto coherente es muy limitada; la propia model card lo califica como experimental.
- Sesgos conocidos: no disponibles. La model card no documenta la procedencia ni la composicion del corpus de entrenamiento (3.402.000 tokens), por lo que no es posible evaluar sesgos de origen.
- Riesgo de alucinacion: alto en terminos relativos; se trata de un modelo entrenado con un corpus pequeno y sin alineacion (no se documenta RLHF ni DPO), por lo que la salida puede ser incoherente o directamente incorrecta.
- Limitaciones de contexto: la ventana es de 128 tokens, equivalentes a 128 bytes UTF-8. En texto con caracteres multibyte, esto se traduce en muchas menos de 128 letras, lo que restringe severamente la entrada.
- Limitaciones de idioma: no se declaran idiomas soportados. El tokenizador byte-level es teoricamente agnostico al idioma, pero el modelo no ha sido evaluado en ninguna lengua concreta.
- Restricciones de licencia: la licencia es MIT, que permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. No obstante, la propia naturaleza experimental del modelo desaconseja su uso comercial.
- Formato y compatibilidad: al distribuirse como state dict crudo de PyTorch y no usar `transformers`, no es directamente compatible con ecosistemas como vLLM, TGI u Ollama sin trabajo de adaptacion.
- Advertencia sobre el repositorio: la ficha de HuggingFace indica un tamano de repositorio de 0,0 GB, mientras que la model card menciona checkpoints de ~22,6 MB; conviene verificar los archivos y sus checksums SHA-256 antes de usarlos.
- Ausencia de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible comparar su calidad de forma objetiva con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jojin1709/qelvra
- Repositorio GitHub: https://github.com/jojin1709/qelvra
- PyTorch: https://pytorch.org/

Nota: las busquedas web realizadas no devolvieron ningun enlace relevante sobre el modelo (los resultados obtenidos trataban sobre snacks y no guardan relacion con QELVRA). No se dispone de paper, blog, demo ni articulo adicional.
