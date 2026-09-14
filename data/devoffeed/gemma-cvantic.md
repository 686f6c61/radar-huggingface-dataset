# devoffeed/gemma-cvantic

## Resumen

gemma-cvantic es un ajuste fino por instrucciones (SFT) del modelo multimodal google/gemma-4-E4B-it, publicado por el usuario devoffeed en formato GGUF. Se trata de un build experimental, tal y como reconoce el propio autor, cuyo objetivo declarado es reforzar el razonamiento matemático, la generación de código, la física y la astronomía, así como las instrucciones en ruso. El modelo hereda del base una ventana de contexto de 128.000 tokens y capacidad de entrada omni-modal (texto, imagen y audio), aunque el ajuste se hizo únicamente sobre texto.

El repositorio pesa 19,8 GB e incluye tres cuantizaciones principales (Q8_0, Q5_K_S e iQ4_XS con imatrix) más un proyector multimodal aparte. El recuento real de parámetros almacenados en safetensors es de 7.518.069.290 (unos 7,52B), mientras que el autor describe el modelo base como de "4,5B de parámetros efectivos", coherente con la nomenclatura E4B del Gemma 4.

Su relevancia es doble: por un lado, sirve de prueba de concepto de fine-tuning sobre la familia Gemma 4 en un caso concreto (ruso técnico + razonamiento científico); por otro, su empaquetado GGUF permite ejecución local en hardware de consumo. Con cero descargas y un único "like" en el momento de la consulta, se trata de un artefacto sin validación comunitaria, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en detalle por el autor; heredada de google/gemma-4-E4B-it (modelo multimodal de la familia Gemma 4, con entrada de texto, imagen y audio) |
| Parametros totales | 7.518.069.290 (~7,52B) segun safetensors |
| Parametros activos | ~4,5B efectivos segun el autor (nomenclatura E4B del modelo base); no confirmado de forma independiente |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Q8_0 (~7,6 GB), Q5_K_S (~5,4 GB), iQ4_XS con imatrix (~4,8 GB), proyector de vision BF16 (~0,9 GB) |
| Idiomas soportados | Ruso (objetivo declarado del ajuste) e ingles (idioma de la mayoria de los datasets de entrenamiento); no se publica una lista oficial de idiomas |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF (para llama.cpp); no se publican safetensors del modelo ajustado en este repositorio |
| Libreria | gguf (llama.cpp) |
| Pipeline | text-generation |
| Tamano del repositorio | 19,8 GB |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna mas alla de que el punto de partida es google/gemma-4-E4B-it, descrito en la model card como un modelo omni-modal con 128K de contexto y entradas de texto, imagen y audio. La nomenclatura "E4B" y la referencia a "4,5B de parametros efectivos" apuntan a un esquema con activacion selectiva de parametros (del orden de 4,5B activos sobre un total almacenado de ~7,52B), aunque el autor no especifica si se trata de un MoE clasico, de atencion lineal u otra variante. El ajuste se aplico mediante un adaptador tipo DoRA / LoRA que posteriormente se fusiono en los pesos, con aproximadamente 36,7 millones de parametros entrenables (0,61% del total) y 13.000 ejemplos de SFT.

La mezcla de datos combina cinco conjuntos bajo licencias MIT o Apache-2.0: HuggingFaceH4/ultrachat_200k (5.000 filas, chat general), theblackcat102/evol-codealpaca-v1 (3.000, codigo), qwedsacf/competition_math (2.000, matematicas de competicion), HuggingFaceTB/cosmopedia en su split de openstax sobre fisica y astronomia (2.000) y openai/gsm8k (1.000, matematicas de primaria). No se menciona ninguna fase de RLHF, DPO o preferencias; el pipeline es exclusivamente SFT sobre texto. La cuantizacion se realizo con llama.cpp partiendo de los pesos fusionados en BF16, usando matriz de importancia (imatrix) para la variante iQ4_XS. El comportamiento multimodal (vision y audio) procede integramente del modelo base y no fue objeto de ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno en ruso e ingles, con especial enfasis en instrucciones tecnicas.
- Razonamiento matematico reforzado mediante SFT sobre MATH, GSM8K y competition_math.
- Generacion de codigo, entrenada con evol-codealpaca-v1 (3.000 ejemplos).
- Razonamiento en fisica y astronomia, con datos de cosmopedia/openstax (efecto Doppler, problemas de fisica general, etc.).
- Entrada de imagenes mediante el proyector multimodal BF16 (archivo `mmproj`), heredada del modelo base.
- Entrada de audio heredada del modelo base segun la descripcion de google/gemma-4-E4B-it (no ajustada ni verificada en este fine-tune).
- Ventana de contexto de 128.000 tokens, util para documentos largos y conversaciones extensas.
- Compatibilidad con API estilo OpenAI a traves de `llama-server` en el puerto configurado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo "thinking" explicito, uso de agentes o razonamiento multi-paso declarado: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia tecnica en ruso: el ajuste refuerza explicitamente las instrucciones en ese idioma, por lo que resulta adecuado para bots de soporte y documentacion tecnica dirigidos a usuarios rusoparlantes, ejecutables en local con `llama-server`.
- Tutor de matematicas y fisica: al haber sido entrenado con MATH, GSM8K y problemas de fisica/astronomia, puede resolver ejercicios paso a paso y explicar conceptos como el efecto Doppler, con la ventaja de no enviar datos a la nube.
- Generacion de codigo en pipelines internos: con 3.000 ejemplos de instrucciones de codigo en el SFT, sirve para autocompletar funciones, generar tests o documentar modulos; puede integrarse como endpoint compatible con la API de OpenAI mediante `llama-server --port 8080`.
- Procesamiento de documentacion cientifica: la ventana de 128K permite cargar articulos o informes completos junto con la pregunta del usuario, siempre que el consumo de memoria se ajuste a la longitud de contexto utilizada.
- Analisis de imagenes en local: con el proyector `BF16-mmproj` activado mediante `--mmproj`, puede describir fotografias, diagramas o capturas sin conexion externa, util en entornos con requisitos de privacidad.
- Despliegue en equipos de sobremesa o portatiles con GPU de gama media: la cuantizacion iQ4_XS (~4,8 GB) permite ejecutar el modelo en maquinas con 6-8 GB de VRAM o incluso solo CPU, para prototipos y demos.
- Evaluacion comparativa de fine-tunes: dado su caracter experimental y su receta publicada, sirve como referencia para reproducir y contrastar el efecto del SFT sobre un Gemma 4 E4B en dominios cientificos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones cuantitativas con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de los ficheros (el consumo real crece con la longitud de contexto por la cache KV):
  - Q8_0 (~7,6 GB): en torno a 9-10 GB de VRAM con contexto moderado.
  - Q5_K_S (~5,4 GB): en torno a 7 GB; opcion recomendada por el autor para equipos con unos 8 GB de RAM/VRAM.
  - iQ4_XS (~4,8 GB): en torno a 6 GB; la opcion mas ligera y rapida.
  - Proyector multimodal BF16 (~0,9 GB): se suma al fichero principal cuando se usa vision.
- GPU recomendadas: el autor no especifica modelos. Por tamano, Q8_0 encaja en GPU de 12-16 GB (RTX 4080/4090, RTX A4000, L4); Q5_K_S e iQ4_XS son viables en GPU de 6-10 GB. El material de referencia no menciona A100 ni H100.
- Caben en GPU de consumo: si. iQ4_XS en 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070), Q5_K_S en 8-12 GB y Q8_0 en 16 GB o mas. Tambien es posible la ejecucion solo en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extension cualquier runtime compatible con GGUF. El repositorio solo documenta llama.cpp; vLLM, TGI, Ollama u otros no aparecen citados en la informacion proporcionada.
- Latencia y throughput: no disponibles. Dependen de la cuantizacion, de la GPU y de la longitud de contexto, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gemma-cvantic (este modelo) | ~7,52B totales, ~4,5B efectivos segun el autor | 128K | apache-2.0 (declarada) | GGUF en HuggingFace, 0 descargas, 1 "like" |
| google/gemma-4-E4B-it (modelo base) | ~4,5B efectivos (nomenclatura E4B) | 128K | apache-2.0 segun la model card del fine-tune | Modelo oficial de Google DeepMind, multimodal |
| Alternativas de tamano similar (p. ej. familias abiertas de 7-8B con licencia permisiva) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento que permitan comparar este fine-tune con el modelo base ni con otras alternativas; la unica diferencia documentada es la composicion del SFT (13.000 ejemplos, cinco datasets) y el empaquetado en GGUF con proyector multimodal separado.

## Limitaciones y advertencias

- Build experimental: el propio autor lo describe como una "prueba de campo" del fine-tuning de Gemma 4 E4B y advierte de que la calidad varia segun el dominio.
- El SFT es exclusivamente de texto. El comportamiento en vision y audio se hereda del modelo base y no ha sido ajustado ni validado en este repositorio, por lo que puede degradarse respecto al original.
- Cero descargas y una sola interaccion registrados: no existe validacion independiente, informes de uso ni evidencia de estabilidad en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el ajuste sobre matematicas y fisica no elimina la posibilidad de respuestas plausibles pero incorrectas, especialmente fuera de los dominios cubiertos por el SFT.
- Idiomas: la model card solo menciona ruso e ingles. No se publica una lista oficial de idiomas soportados; el rendimiento en castellano, catalan, gallego o euskera no esta documentado.
- Cobertura de dominio estrecha: el ajuste se concentra en codigo, matematicas, fisica/astronomia y chat general, con un total de 13.000 ejemplos, un volumen reducido que puede provocar sobreajuste a los estilos de esos datasets.
- Licencia declarada apache-2.0, pero al derivar de la familia Gemma conviene verificar las condiciones reales del modelo base (los modelos Gemma de Google suelen distribuirse bajo sus propios terminos de uso, no bajo Apache 2.0). No se ofrece ninguna garantia ni clausula de indemnizacion especifica en el repositorio.
- La ventana de 128K es teorica en la practica: alcanzarla exige memoria adicional para la cache KV y no se documentan pruebas de recuperacion de informacion en contextos muy largos.
- Repositorio de 19,8 GB: la descarga completa incluye todas las cuantizaciones, aunque para inferencia solo sea necesario un fichero principal mas el `mmproj` si se usa vision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devoffeed/gemma-cvantic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de llama.cpp (herramienta de cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp
- Pagina de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Documentacion de Gemma 4: https://ai.google.dev/gemma/docs/core
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Datasets de entrenamiento citados:
  - https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
  - https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
  - https://huggingface.co/datasets/qwedsacf/competition_math
  - https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
  - https://huggingface.co/datasets/openai/gsm8k
