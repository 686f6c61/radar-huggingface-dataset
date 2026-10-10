# parmanu-lcs2/gemma-4-12B

## Resumen

`parmanu-lcs2/gemma-4-12B` es una version podada del modelo `gemma-4-12B`, comprimida mediante la tecnica TRIDENT, cuyo paper esta anunciado como "coming soon" y, por tanto, no es verificable publicamente. El resultado del proceso de poda es un modelo de 8.969.794.864 parametros (aproximadamente 8,97 mil millones), lo que supone una reduccion cercana al 25% respecto al modelo original segun el ratio de compresion objetivo declarado por el autor.

El modelo se distribuye a traves de HuggingFace con la libreria `transformers` y pesos en formato `safetensors`, pero requiere `trust_remote_code=True` porque la poda deja cada capa MLP con una anchura distinta, y esa arquitectura irregular se define en el fichero personalizado `modeling_trident.py` incluido en el repositorio. Se trata, por tanto, de una arquitectura derivada de la familia Gemma (etiquetada como `gemma4_unified`) con modificaciones estructurales no estandar.

La relevancia de esta ficha es limitada y conviene ser honesto al respecto: el repositorio acumula cero descargas y cero "likes" en el momento de la consulta, no declara licencia, no declara idiomas soportados y no publica resultados de benchmarks. Es un artefacto de investigacion sobre compresion de modelos, no un modelo listo para produccion, y su evaluacion practica queda pendiente de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de la familia Gemma (`gemma4_unified`) con anchura variable por capa en el MLP; requiere codigo personalizado (`modeling_trident.py`) |
| Parametros totales | 8.969.794.864 (segun safetensors); el nombre del repo hace referencia al modelo original de 12B |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tags declarados | transformers, text-generation, pruned, trident, llm-pruning, compression, custom_code |
| Tamano del repositorio | 18,0 GB |
| Dataset de ajuste | Open-Orca/SlimOrca (10.000 muestras) |
| Modelo original | `gemma-4-12B` (no disponible en el material consultado) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como el resultado de aplicar TRIDENT, un metodo de poda (pruning) cuyo paper esta pendiente de publicacion. El autor indica un ratio de compresion objetivo del 25% y un recuento final de 8.969.794.864 parametros. El detalle arquitectonico mas relevante, y tambien el mas problematico desde el punto de vista de la compatibilidad, es que la poda deja cada capa MLP con una anchura distinta, lo que rompe la homogeneidad estructural habitual de los transformers y obliga a cargar una implementacion personalizada incluida en el repositorio (`modeling_trident.py`). No se especifica si la atencion, el numero de capas, la dimension oculta o el tokenizador se han visto alterados.

En cuanto al entrenamiento, la unica informacion aportada es que se utilizaron 10.000 muestras del dataset SlimOrca tras la poda, presumiblemente para una fase de recuperacion (recovery fine-tuning) destinada a mitigar la perdida de capacidad causada por la compresion. No se documentan el numero total de tokens procesados, la composicion detallada del dataset, la existencia de fases de RLHF o DPO, la longitud de contexto empleada durante el ajuste ni el regimen de aprendizaje. La poda se realizo sobre una GPU NVIDIA A100. No hay informacion sobre innovaciones adicionales como decodificacion especulativa, atencion lineal o mecanicas hibridas.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que la funcion prevista es la generacion autoregresiva de texto.
- Herencia de la familia Gemma: al derivar de un modelo Gemma, cabe esperar capacidades conversacionales y de instrucciones, aunque no hay evaluacion publicada que lo confirme.
- Ajuste sobre SlimOrca: el uso de SlimOrca sugiere cierto entrenamiento en seguimiento de instrucciones, pero al ser solo 10.000 muestras y sin datos de evaluacion, no puede confirmarse el grado de alineacion alcanzado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el modelo no declara idiomas soportados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en compresion de modelos: el caso de uso mas realista es precisamente el estudio de la tecnica TRIDENT y de su impacto en la calidad del modelo, comparando el comportamiento del modelo podado frente al original de 12B con el mismo conjunto de evaluacion.
- Reproduccion academica de pipelines de poda: un grupo de investigacion puede usar este repositorio como referencia para implementar y validar su propio pipeline de pruning sobre modelos de la familia Gemma, aunque la ausencia del paper dificulta la reproduccion exacta.
- Experimentacion con arquitecturas de anchura irregular: el fichero `modeling_trident.py` sirve como ejemplo tecnico de como cargar en `transformers` un modelo cuyos MLP tienen dimensiones distintas por capa, un escenario poco habitual y util para quien necesite soportar arquitecturas no homogeneas.
- Prototipado interno sin requisitos de licencia clara: dado que la licencia no esta declarada, su uso quedaria restringido a entornos de investigacion controlados; no es apto para integraciones comerciales mientras no se aclare la licencia.
- Pruebas de conversion a otros formatos: como ejercicio tecnico, comprobar si el modelo personalizado es convertible a GGUF o a formatos compatibles con motores de inferencia estandar, lo que requeriria adaptar el codigo de carga a cada motor.
- Benchmarking comparativo de modelos podados: emplearlo como uno mas dentro de una bateria de pruebas que mida la degradacion (perplejidad, exactitud en tareas de razonamiento) que introduce una poda del 25% con solo 10.000 muestras de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni comparaciones con el modelo original de 12B que permitan cuantificar la perdida de rendimiento atribuible a la poda.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en el recuento de parametros publicado (8,97B) y en el comportamiento habitual de modelos densos de ese tamano; no proceden de documentacion oficial del modelo.

- VRAM estimada para inferencia: aproximadamente 18 GB en FP16/BF16 solo para los pesos, mas la memoria del KV cache; en cuantizacion de 8 bits en torno a 9-10 GB; en 4 bits en torno a 5-6 GB. Estas cifras asumen que el modelo puede cuantizarse, cosa que no esta documentada.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB) o H100 para FP16 sin cuantizar; A100 40 GB o L40S para INT8.
- GPU de consumo: en FP16, una RTX 3090 o RTX 4090 con 24 GB puede alojar los pesos, pero el margen para el KV cache es estrecho y dependera de la longitud de contexto real (no declarada). En 4 bits cabria con holgura en GPUs de 12-16 GB, siempre que el modelo sea cuantizable.
- Opciones de despliegue: la carga mediante `transformers` con `trust_remote_code=True` esta documentada por el autor. El uso con vLLM, TGI, llama.cpp u Ollama no esta garantizado, porque dependen de arquitecturas estandar o de conversiones a GGUF que la anchura irregular por capa puede impedir sin trabajo de adaptacion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, ni en A100 ni en ninguna otra GPU.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparacion cuantitativa. La tabla siguiente contrasta unicamente caracteristicas estructurales conocidas, y las celdas de alternativas corresponden a informacion publica general; los datos del modelo objeto de la ficha son los aportados por el repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| parmanu-lcs2/gemma-4-12B | 8,97B (podado desde 12B) | no disponible | no disponible | safetensors con codigo personalizado |
| Modelo original `gemma-4-12B` | no disponible | no disponible | no disponible | no disponible en el material consultado |
| Gemma 2 9B | ~9,2B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF y multiples formatos |
| Llama 3.1 8B | ~8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF y multiples formatos |

La comparacion con Gemma 2 9B es la mas pertinente por tamano y familia, pero la falta de benchmarks del modelo podado impide afirmar si su calidad se aproxima, iguala o queda por debajo. Llama 3.1 8B se incluye como referencia de la misma franja de parametros con contexto largo y ecosistema de despliegue ampliamente soportado.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo, lo que impide determinar si se permite uso comercial. Ademas, al derivar de un modelo Gemma, es probable que hereden condiciones de uso de la licencia original, pero el repositorio no lo aclara.
- Cero adopcion verificable: cero descargas y cero "likes" en el momento de la consulta implican que no hay evidencia independiente de que el modelo funcione correctamente ni de que sea reproducible.
- Paper no publicado: la tecnica TRIDENT solo se referencia como "coming soon", por lo que no puede evaluarse el metodo ni contrastarse con la literatura.
- Compatibilidad limitada: la necesidad de `trust_remote_code=True` y de un fichero de modelado propio complica el despliegue en herramientas estandar (vLLM, TGI, llama.cpp, Ollama) y aumenta la superficie de riesgo al ejecutar codigo remoto.
- Riesgo de degradacion por poda: una compresion del 25% recuperada con solo 10.000 muestras de SlimOrca sugiere una posible perdida de calidad en razonamiento, conocimiento factual y multilingueismo, aunque no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: no evaluado. No hay estudios de fidelidad factual ni de tasas de alucinacion.
- Idiomas y contexto desconocidos: no se declara que idiomas soporta ni cual es la longitud de contexto real, lo que impide planificar aplicaciones multilingues o de contexto largo.
- Sesgos: no disponible; no se documenta ningun analisis de sesgos.
- Uso en produccion: desaconsejado mientras no existan licencia clara, benchmarks publicados y validacion independiente del comportamiento del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/parmanu-lcs2/gemma-4-12B
- Dataset de ajuste SlimOrca: https://huggingface.co/datasets/Open-Orca/SlimOrca
- Paper de TRIDENT: anunciado como "coming soon", sin enlace disponible
- Modelo original `gemma-4-12B`: no se proporciona enlace en la informacion disponible
