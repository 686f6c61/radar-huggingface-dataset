# Finn-Technologies/FinnAI-Foundation-v3

## Resumen

FinnAI-Foundation-v3 es un ajuste fino tipo LoRA del modelo multimodal LiquidAI/LFM2.5-VL-1.6B, publicado por Finn-Technologies (FinnAI Foundation). Se trata de la tercera iteracion de una linea de modelos construida con un enfoque de "verificacion primero": cada fila de entrenamiento pasa por un verificador deterministico antes de incorporarse al dataset. El repositorio incluye el checkpoint completo fusionado en safetensors y una cuantizacion GGUF Q4_K_M de 697 MiB lista para llama.cpp, junto con el proyector de vision en Q8_0.

El modelo parte de una arquitectura vision-language de 1,6B de parametros con encoder SigLIP2 NaFlex de 400M y una ventana de contexto de 32k tokens. El entrenamiento consiste en destilacion supervisada con trazas de profesor que incluyen segmentos `<think>` concisos, destiladas mediante LoRA-SFT (rango 32, alpha 64) y posteriormente fusionadas en el modelo base. El resultado son 3.590 pasos sobre 114.870 filas, con una perdida de evaluacion que baja de 0,37896 a 0,36843.

Su relevancia practica esta en el nicho de asistentes locales en macOS: OCR, preguntas sobre documentos y tablas, lectura de diagramas Mermaid, razonamiento sobre codigo y ciberseguridad y asistencia sobre interfaces de usuario. Al publicarse con cuantizacion GGUF y requerir hardware muy modesto, es una opcion realista para inferencia en dispositivo. La licencia heredada (LFM Open License v1.0) condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: backbone LFM2.5-1.2B (capas de atencion, MLP y proyecciones de convolucion) + encoder de vision SigLIP2 NaFlex 400M |
| Parametros totales | 1,6B (modelo completo, incluye encoder de vision de 400M) |
| Parametros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | 32k tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (4,98 BPW, 697 MiB); proyector de vision mmproj en Q8_0; checkpoint completo en fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, campo `license: other` en HuggingFace), heredada de LiquidAI/LFM2.5-VL-1.6B |
| Formato de pesos | safetensors (checkpoint fusionado completo), GGUF (Q4_K_M), GGUF mmproj Q8_0 |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-VL-1.6B: un backbone LFM2.5-1.2B con proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), MLP (`gate_proj`, `up_proj`, `down_proj`) y convolucion (`fc1`, `fc2`, `linear`, `w1`, `w2`, `w3`) acoplado a un encoder de vision SigLIP2 NaFlex de 400M parametros. La ventana de contexto es de 32k tokens y la modalidad de entrada es imagen-texto a texto.

El metodo de entrenamiento es destilacion supervisada al estilo de la receta MiMo-V2.6: se generan trazas de profesor con segmentos `<think>` concisos y se validan con verificadores deterministicos; despues se destilan en el modelo base mediante LoRA-SFT. El adaptador LoRA se aplico con rango 32, alpha 64 y dropout 0,05 sobre todas las matrices de atencion, MLP y proyeccion de convolucion, y posteriormente se fusiono en el checkpoint base. El entrenamiento se ejecuto en una unica GPU Kaggle T4 con fp16 y gradient checkpointing: 3.590 pasos (una epoca sobre 114.870 filas, batch 2 con acumulacion 16), 33.146 segundos (9,2 horas), perdida final de entrenamiento 0,4739 y perdida de evaluacion de 0,37896 (paso 1000) a 0,36843 (paso 3590), con checkpoints cada 500 pasos.

El dataset FinnAI-Foundation-100K-v3 contiene 114.870 filas de entrenamiento y un split de evaluacion congelado de 2.224 filas, con un 27,0% de filas con imagen, 100% de aprobacion por verificador gold, 80,0% de cobertura de verificador y cero fugas de plantillas de respuesta. La v3 es una reparacion dirigida de la v2: conserva todas las filas de v2 y su sobremuestreo de dominio general, y anade ocho variantes de prompt deterministicas por cada una de las 731 filas de `diagram-mermaid` (de 731 a 6.579 filas) para restaurar el peso de la modalidad visual.

## Capacidades

- Generacion de texto e imagen-texto a texto con el backbone LFM2.5 y el encoder SigLIP2 NaFlex.
- OCR y lectura de documentos, incluidas preguntas sobre tablas.
- Lectura e interpretacion de diagramas, con refuerzo especifico sobre diagramas Mermaid en la v3.
- Razonamiento sobre codigo y sobre ciberseguridad (declarado en la seccion de uso previsto).
- Asistencia visual sobre interfaces de usuario.
- Modo de razonamiento con segmentos `<think>` concisos, heredado de la receta de destilacion con trazas de profesor.
- Entrada multimodal de imagen (27,0% de las filas de entrenamiento incluyen imagen).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles; el modelo declara unicamente `en`.

## Casos de uso

- OCR de documentos en local: el modelo procesa imagenes de documentos y responde preguntas sobre su contenido, con el checkpoint Q4_K_M ejecutable en llama.cpp sin conexion a servicios externos.
- Preguntas sobre tablas y hojas de calculo: dado que el entrenamiento incluye filas con imagen y foco en documentos, puede extraer y razonar sobre valores tabulares a partir de capturas o PDFs rasterizados.
- Lectura de diagramas tecnicos: la v3 anade 6.579 filas de `diagram-mermaid` con ocho variantes de prompt por diagrama, lo que la hace adecuada para interpretar diagramas de flujo y de arquitectura en documentacion tecnica.
- Asistente de escritorio en macOS: el caso de uso declarado por el autor; el modelo puede integrarse en un asistente local que lea la pantalla, responda sobre la UI activa y ayude en tareas guiadas.
- Revision de codigo asistida por captura: combinando entrada de imagen y razonamiento sobre codigo, puede comentar fragmentos de codigo mostrados en pantalla o en capturas de un IDE.
- Analisis de artefactos de ciberseguridad en formato visual: el modelo declara razonamiento sobre ciberseguridad, por lo que puede emplearse para interpretar paneles, capturas de consola o diagramas de red.
- Prototipado de pipelines multimodales con presupuesto minimo: al pesar 697 MiB en Q4_K_M, es util para validar una arquitectura de producto en una maquina de desarrollo antes de escalar a un modelo mayor.
- Generacion de anotaciones sobre imagenes en herramientas internas: al aceptar imagen y texto y devolver texto, puede actuar como anotador o etiquetador semiautomatico en flujos de revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras vigentes se encuentran en el archivo `BENCHMARKS.md` del propio repositorio, pero no incluye los valores numericos. La metodologia de evaluacion declarada es: `llama.cpp` con cuantizacion Q4_K_M, los parametros de muestreo documentados por LiquidAI para el modelo base (temperatura 0,1, min_p 0,15, penalizacion de repeticion 1,05, `max_image_tokens=256`), recuento de las filas que fallan como fallos en lugar de descartarlas, y verificacion deterministica de cada fila puntuada.

## Requisitos de hardware

- Checkpoint completo en fp16: los 1,6B de parametros del modelo mas el encoder de vision de 400M ocupan en torno a 4 GB solo en pesos, a lo que hay que sumar activaciones y cache KV para 32k tokens de contexto (tamano de cache no disponible).
- Cuantizacion GGUF Q4_K_M: 697 MiB para el modelo de lenguaje, mas el proyector de vision `mmproj-LFM2.5-VL-1.6b-Q8_0.gguf`, cuyo tamano no esta disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si. Con Q4_K_M y el proyector de vision el consumo es de un solo digito de GB, por lo que es viable en GPUs de 6-8 GB y en memoria unificada de Apple Silicon.
- GPU recomendadas: cualquier GPU consumer reciente (familia RTX 30/40, Apple Silicon con Metal) para la cuantizacion Q4_K_M; una T4 de 16 GB fue suficiente para el propio entrenamiento en fp16 con gradient checkpointing, lo que da una referencia de que el ajuste fino tambien es asequible.
- Opciones de despliegue: Transformers (checkpoint fusionado en safetensors) y llama.cpp con GGUF multimodal (soportado de forma explicita por el autor, con el fichero mmproj). El soporte en vLLM, TGI u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible.
- Nota de contexto: el entrenamiento se realizo en una unica Kaggle T4 durante 9,2 horas, lo que sirve como cota practica para reproducir el ajuste fino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinnAI-Foundation-v3 | 1,6B + encoder 400M | 32k | Si (SigLIP2 NaFlex 400M) | LFM Open License v1.0 | safetensors, GGUF Q4_K_M, mmproj Q8_0 |
| LiquidAI/LFM2.5-VL-1.6B | 1,6B + encoder 400M | 32k | Si (SigLIP2 NaFlex 400M) | LFM Open License v1.0 | Modelo base del que deriva este ajuste |
| Qwen2.5-VL-3B-Instruct | 3,75B (dato publico del autor) | 32.768 nativo (dato publico del autor) | Si | Apache 2.0 (dato publico del autor) | Pesos abiertos |
| SmolVLM2-2.2B | 2,2B (dato publico del autor) | No disponible en esta busqueda | Si | Apache 2.0 (dato publico del autor) | Pesos abiertos |

Los datos de las filas de Qwen2.5-VL-3B-Instruct y SmolVLM2-2.2B provienen de la documentacion publica de sus respectivos autores y no han podido verificarse en la busqueda web realizada para esta ficha; conviene contrastarlos en sus model cards antes de tomar decisiones. La busqueda web no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a dominios no relacionados: un portal de compraventa noruego, una clase de vela y una enciclopedia general).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta un analisis de sesgos.
- Riesgo de alucinacion: el autor no lo cuantifica. El modelo se presenta como un ajuste con verificacion determinista en los datos de entrenamiento, lo que no garantiza la correccion factual en inferencia.
- Cobertura de verificador del dataset: 80,0% de las filas pasan por verificador; el 20,0% restante no tiene esa garantia, aunque el autor declara 100% de aprobacion por verificador gold sobre las filas verificadas.
- Limitacion idiomatica severa: el modelo solo declara ingles (`en`). No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Licencia: LFM Open License v1.0, heredada del modelo base. Es una licencia con condiciones, no una licencia permisiva tipo Apache 2.0; el propio autor recomienda revisarla antes de cualquier uso comercial.
- Ambito de uso restringido por el autor: no esta pensado como autoridad de seguridad ni como sustituto de revision humana en decisiones de alto impacto.
- Contexto: 32k tokens es la ventana declarada del modelo base; no se documenta el rendimiento efectivo en el extremo de esa ventana ni el impacto de `max_image_tokens=256` en tareas de vision con imagenes densas.
- Madurez del artefacto: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el mismo dia (25 de septiembre de 2026), por lo que no existe validacion externa ni adopcion de terceros.
- Los pesos se publican sin garantia de reproducibilidad de los resultados de `BENCHMARKS.md`, que no se han incluido en la informacion disponible.
- El checkpoint Q4_K_M requiere el fichero mmproj separado para funcionar en modo multimodal; usar solo el GGUF del modelo de lenguaje desactivaria la entrada de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Finn-Technologies/FinnAI-Foundation-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B/blob/main/LICENSE
- Adaptador LoRA: `Finn-Technologies/FinnAI-Foundation-LoRA-v3` (referenciado en la model card; sin URL completa en la informacion disponible)
- Dataset de entrenamiento: `Finn-Technologies/FinnAI-Foundation-100K-v3` (referenciado en la model card; sin URL completa en la informacion disponible)
- Resultados de evaluacion: `BENCHMARKS.md`, dentro del repositorio del modelo (valores no incluidos en la informacion proporcionada)
- Paper, blog o demo: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
