# SelectiveDOPD/QuestA-Qwen3-4b-Selective-Top10pct

## Resumen

QuestA-Qwen3-4b-Selective-Top10pct es un checkpoint de ajuste fino de 4.411.424.256 parametros (aproximadamente 4,4 mil millones) publicado por el usuario SelectiveDOPD en Hugging Face. El identificador del repositorio y la propia model card lo vinculan a un modelo base de la familia Qwen3 (etiqueta `qwen3`) y a un experimento interno denominado `questa_qwen3_4b_JSD_rel_90_100`, dentro de los experimentos "BiDirect-OPD". El sufijo "Selective-Top10pct" sugiere un entrenamiento selectivo sobre un subconjunto (presumiblemente el 10 % superior) de tokens, capas o muestras, aunque el autor no documenta el criterio.

El modelo se distribuye unicamente en formato `safetensors` para la libreria `transformers`, con pipeline `text-generation` y etiquetas que indican compatibilidad con Text Generation Inference y con endpoints. La rama `main` contiene el checkpoint `global_step_300`, y el repositorio conserva ramas adicionales con checkpoints intermedios (`global_step_20` a `global_step_280`, en pasos de 20), lo que lo convierte en un artefacto util para estudiar la evolucion del entrenamiento mas que para despliegue en produccion.

Su relevancia actual es limitada y de caracter experimental: no tiene descargas ni valoraciones, no incluye licencia declarada, no publica idiomas soportados, no aporta resultados de evaluacion y su model card se reduce a una lista de ramas. Para un desarrollador o investigador, el interes principal esta en reproducir o analizar la receta de destilacion selectiva sobre Qwen3-4B, no en sustituir a un modelo instructivo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B; no detallada por el autor) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos `safetensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 44,1 GB (incluye, presumiblemente, los checkpoints de las ramas secundarias) |
| Checkpoint de la rama `main` | global_step_300 |
| Ramas adicionales | global_step_20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280 |
| Pipeline | text-generation |
| Etiquetas | transformers, safetensors, qwen3, text-generation, conversational, text-generation-inference, endpoints_compatible |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura mas alla de lo que se deduce de las etiquetas y del identificador. Se trata de un modelo denso de tipo transformer decoder-only, derivado de Qwen3-4B (etiqueta `qwen3`, 4,4 B de parametros frente a los ~4,0 B del Qwen3-4B original, diferencia atribuible a posibles cambios en el vocabulario o en la cabeza de salida). No hay datos sobre numero de capas, dimensiones ocultas, cabezas de atencion, tipo de posicional encoding ni si se aplico atencion lineal o hibrida.

Respecto al entrenamiento, la model card solo indica que el modelo fue subido desde el experimento `questa_qwen3_4b_JSD_rel_90_100` dentro de los experimentos "BiDirect-OPD", y que el checkpoint principal corresponde al paso global 300. La nomenclatura sugiere el uso de divergencia Jensen-Shannon (JSD) como objetivo de destilacion y un esquema "selectivo" sobre el 10 % superior ("Top10pct"), pero esto es una inferencia a partir del nombre del repositorio y no una afirmacion confirmada por el autor. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otro tipo de alineamiento posterior.

## Capacidades

- Generacion de texto autoregresiva y uso conversacional basico, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con Text Generation Inference y con infraestructura de endpoints, lo que permite desplegarlo mediante APIs compatibles con OpenAI.
- Capacidad multilingue: no disponible. No se declaran idiomas, por lo que no puede asumirse el perfil multilingue del Qwen3 original.
- Tool calling / function calling: no disponible (no se documenta plantilla de chat ni soporte de herramientas).
- Razonamiento multi-paso y comportamiento agente: no disponible (no se declara modo "thinking" ni plantilla de razonamiento).
- Capacidades de vision o audio: no disponibles (no hay torre de vision ni procesador multimodal en las etiquetas).
- Uso como punto de partida para experimentos de destilacion: el repositorio ofrece 15 checkpoints intermedios, lo que permite analizar la evolucion del ajuste paso a paso.

## Casos de uso

- Investigacion sobre destilacion selectiva: comparar los checkpoints `global_step_20` a `global_step_300` para medir como evoluciona la divergencia Jensen-Shannon y el comportamiento del modelo segun el criterio selectivo aplicado. Es el uso mas coherente con el material publicado.
- Reproduccion de experimentos de ajuste fino sobre Qwen3-4B: usar los pesos como referencia para replicar la receta "questa_qwen3_4b_JSD_rel_90_100" en un entorno controlado.
- Prototipado local con recursos limitados: con 4,4 B de parametros, el modelo cabe en GPU de consumo (ver seccion de hardware), lo que permite iterar en estaciones de trabajo sin clúster.
- Generacion de texto conversacional de bajo coste en entornos on-premise: al ser un modelo pequeno y desplegable con TGI, puede servir de base para asistentes internos donde no se requiere maxima calidad pero si confidencialidad de datos.
- Punto de partida para un ajuste posterior con datos propios: dado su tamano, un fine-tuning completo o con LoRA es viable en una unica GPU de 24 GB.
- Evaluacion comparativa de tecnicas de alineamiento: al carecer de evaluaciones publicadas, puede emplearse como sujeto de pruebas en estudios que midan regresiones frente al Qwen3-4B original.
- Extraccion y clasificacion de texto en pipelines batch: tareas de resumen, etiquetado o normalizacion donde el coste por token es critico, siempre que se valide antes la calidad real del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos completos): aproximadamente 8,8-9 GB solo para pesos, mas cache KV; en la practica, entre 10 y 14 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en int8: aproximadamente 4,5-5 GB de pesos.
- VRAM estimada en int4 (GPTQ/AWQ o GGUF Q4_K_M, previa conversion): aproximadamente 2,5-3,5 GB.
- GPU recomendadas para bf16: RTX 3090, RTX 4080/4090 (24 GB o 16 GB), A100 40 GB, H100; en 16 GB cabe con contexto moderado.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090. En configuraciones de 8 GB solo es viable con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con arquitecturas Qwen3), y llama.cpp/Ollama solo si se convierte previamente a GGUF, ya que no se distribuye ese formato.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.
- Almacenamiento: el repositorio ocupa 44,1 GB; conviene descargar unicamente la rama necesaria (`main` o un `global_step` concreto) para evitar transferir todos los checkpoints.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden de la informacion proporcionada. Los datos de los modelos alternativos provienen del conocimiento publico de sus respectivas documentaciones y no de la busqueda web realizada, que no devolvio resultados relevantes.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QuestA-Qwen3-4b-Selective-Top10pct | 4,4 B | no disponible | no disponible | Hugging Face, solo safetensors, 0 descargas |
| Qwen3-4B | ~4,0 B | 32.768 tokens nativos (ampliable con YaRN) | Apache-2.0 | Hugging Face, ampliamente extendido |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy extendido |
| Phi-4-mini-instruct | 3,8 B | 128.000 tokens | MIT | Hugging Face, muy extendido |

Comparativa de rendimiento: no disponible, ya que este checkpoint no publica ninguna evaluacion que permita situarlo frente a las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos, el uso comercial es juridicamente arriesgado; conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de evaluacion: no hay benchmarks, ni cartas de evaluacion, ni comparaciones con el modelo base, por lo que se desconoce si el ajuste ha degradado capacidades originales.
- Model card minima: no documenta datos de entrenamiento, plantilla de chat, politica de alucinacion ni idiomas, lo que complica la integracion fiable.
- Riesgo de alucinacion: no cuantificado. Al ser un checkpoint experimental sin alineamiento documentado, cabe esperar un comportamiento menos controlado que el de un modelo instructivo consolidado.
- Idiomas: no declarados. No debe asumirse un rendimiento multilingue correcto aunque el Qwen3 original lo tenga.
- Contexto: no declarado. No es seguro asumir la ventana de 32.768 tokens del Qwen3-4B sin verificacion empirica.
- Sesgos: no evaluados por el autor; un ajuste fino sobre un dataset no documentado puede introducir o amplificar sesgos respecto al modelo base.
- Repositorio pesado: 44,1 GB por la acumulacion de checkpoints intermedios; la descarga completa es innecesaria y costosa.
- Adopcion nula: cero descargas y cero valoraciones implican que el modelo no ha sido validado por terceros.
- Formato unico: solo safetensors, sin GGUF ni cuantizaciones listas para usar, lo que obliga a conversiones manuales para despliegues en CPU o en hardware limitado.
- La busqueda web realizada no devolvio ninguna fuente tecnica relacionada con el modelo; los unicos resultados fueron sitios sin relacion (contenido de casino y prensa generalista).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SelectiveDOPD/QuestA-Qwen3-4b-Selective-Top10pct
- No se han encontrado papers, blogs, repositorios ni demos asociados en la busqueda web disponible.
