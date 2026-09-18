# Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-lora

## Resumen

`Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-lora` es un adaptador LoRA de investigación (PEFT) sobre `Qwen/Qwen2.5-7B-Instruct`, publicado por la organización Misalignment-Empirics. No es un modelo completo ni un asistente listo para producción: es un *model organism*, es decir, un artefacto construido deliberadamente para estudiar cómo se implanta y se comporta un rasgo de personalidad concreto ("mathematical") en un modelo base.

El adaptador se ha entrenado con el método denominado `oct_behaviour`, derivado del trabajo OpenCharacterTraining (arXiv:2511.01689), usando datos de profesor generados por GLM-4.5-Air con una "constitución" matemática y una fase de DPO sobre 8.577 filas, con LoRA de rango 64 y alpha 64. Su interés actual es metodológico: sirve para reproducir y auditar experimentos sobre entrenamiento de personajes, alineación y desalineación controlada, no para tareas generales de generación.

El repositorio ocupa 0,7 GB, contiene un único adaptador en la raíz (sin subcarpeta), y la propia model card advierte que se trata de un artefacto de investigación que no ha sido evaluado ni validado por sus autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; no es MoE |
| Parametros totales | Modelo base: 7,61 B (dato publico de Qwen2.5-7B-Instruct); parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en el repositorio. El modelo base Qwen2.5-7B-Instruct admite 32.768 tokens nativos, ampliables a 131.072 con YaRN segun la documentacion de Qwen (no verificado en este repositorio) |
| Tipos de cuantizacion | No disponible para el adaptador. Se distribuye en safetensors; el modelo base cuenta con cuantizaciones GGUF/AWQ/GPTQ publicadas por Qwen |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT), repo de 0,7 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Libreria | peft |
| Metodo de implantacion | oct_behaviour |
| Rango LoRA / alpha | 64 / 64 |
| Dropout LoRA | 0.0 |
| Dataset de entrenamiento | Misalignment-Empirics/qwen2.5-mathematical-training-data :: dpo-view.jsonl (8.577 filas) |
| Hiperparametros DPO | beta 0.1, nll_coef 0.1 |
| Learning rate / epocas | 5e-05 / 1.0 |
| Batch efectivo / max_len | 32 / 1.024 tokens |
| Optimizer steps | 269 |
| Semilla | 0 |
| Loss final de entrenamiento | 0,1669452713324678 |
| Fecha de creacion (segun el repo) | 2026-09-18 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 64, con dropout 0.0, aplicado sobre un transformer decoder-only denso (Qwen2.5-7B-Instruct, 7,61 B de parametros). No hay mezcla de expertos, ni atencion lineal, ni componentes SSM: la innovacion no esta en la arquitectura, sino en el procedimiento de implantacion de comportamiento.

El entrenamiento sigue el metodo `oct_behaviour`, definido en el plan `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` del repositorio MO_evals, y usa el `trainer implant/train_behaviour_sft.py` con la especificacion de comportamiento `mathematical` (sha256 `fd0a06bd394ab5ce`). Los datos proceden del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data` (fichero `dpo-view.jsonl`, 8.577 filas), construido a partir de los datos de profesor GLM-4.5-Air publicados por OpenCharacterTraining (`maius/OpenCharacterTraining-data`, arXiv:2511.01689) con la constitucion matematica (identica byte a byte a `data/personas/mathematical.json`). En cada par de DPO, el lado elegido es la respuesta de GLM y el rechazado es la salida base del estudiante Qwen2.5-7B. La configuracion reportada incluye DPO con beta 0.1, coeficiente NLL 0.1, learning rate 5e-05, una sola epoca, batch efectivo 32, `max_len` 1024, checkpointing de gradientes activado, 269 pasos de optimizador y semilla 0. La loss media final de entrenamiento reportada es 0,1669.

## Capacidades

Debe tenerse en cuenta que las capacidades listadas son las esperadas por herencia del modelo base y por la naturaleza del entrenamiento; el repositorio no aporta evaluaciones que las confirmen.

- Generacion de texto conversacional en ingles y otros idiomas del modelo base (idiomas exactos: no disponible).
- Razonamiento matematico y resolucion de problemas cuantitativos en el estilo o "persona" matematica implantada.
- Generacion de codigo y asistencia tecnica, heredada de Qwen2.5-7B-Instruct.
- Soporte de tool calling / function calling: heredado del modelo base (Qwen2.5-Instruct soporta plantillas de herramientas); no verificado en este adaptador.
- Capacidades de agente y razonamiento multi-paso: posibles por herencia del base, sin validacion publicada en este repositorio.
- Capacidad especial: es un *model organism* de investigacion, disenado para inducir un comportamiento de personalidad controlado y medible, no para mejorar el rendimiento general.
- No se documentan capacidades de vision, audio ni modo de "pensamiento" explicito.

## Casos de uso

- Investigacion sobre implantacion de personalidad: el adaptador permite comparar el metodo `oct_behaviour` frente a otras tecnicas de character training sobre el mismo modelo base, manteniendo constante Qwen2.5-7B-Instruct y variando solo el procedimiento.
- Evaluacion de seguridad y red-teaming: al ser un organismo disenado para inducir un rasgo concreto, sirve como sujeto de pruebas para medir si la personalidad implantada deriva en comportamientos no deseados o en una degradacion de la utilidad.
- Reproducibilidad de experimentos de DPO: la configuracion completa (beta 0.1, nll_coef 0.1, rango 64, semilla 0, 269 pasos, 8.577 filas) permite replicar el entrenamiento en otro hardware y comprobar la estabilidad del resultado.
- Estudio de desalineacion controlada: la organizacion que lo publica (Misalignment-Empirics) lo orienta a analizar como se comporta un modelo cuando se le implanta un rasgo de forma deliberada, util en investigacion de alineacion.
- Generacion de datos con estilo controlado: el adaptador puede emplearse para producir respuestas con una "voz" matematica consistente, como fuente de datos sinteticos para experimentos de estilo, tono o formato.
- Desarrollo y depuracion de harnesses de evaluacion: al ser un adaptador pequeno (0,7 GB) sobre un base de 7 B, es barato de cargar en pipelines de evaluacion antes de escalar a modelos mayores.
- Docencia y divulgacion tecnica: sirve como ejemplo reproducible y de bajo coste de un flujo completo PEFT + DPO, incluyendo la carga del adaptador con `peft` y su fusion con el modelo base.
- Ablaciones de hiperparametros: permite estudiar el efecto de beta, nll_coef o el rango LoRA sobre la fuerza con que se manifiesta la persona implantada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado por el autor es la loss media final de entrenamiento (0,1669452713324678) sobre 8.577 filas y 269 pasos de optimizador. La model card indica explicitamente que el artefacto "no ha sido evaluado ni validado" en ese repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 15-16 GB para los pesos del base de 7,6 B, mas el adaptador (despreciable en comparacion) y la cache KV, que crece con la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (NF4/GPTQ/AWQ): aproximadamente 4,5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio; RTX 4090 o RTX 3090 (24 GB) para uso local comodo en bf16.
- Cabe en GPU de consumo: si. RTX 4090/3090 en bf16 con contexto moderado; RTX 4060 Ti 16 GB y RTX 4070 Ti SUPER en 8 o 4 bits; RTX 3060 12 GB solo en 4 bits y con contexto corto (no cabe en GPUs de 8 GB en bf16).
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador de la raiz del repo), vLLM (soporta adaptadores LoRA), TGI, SGLang. Para llama.cpp u Ollama es necesario convertir o fusionar el adaptador a GGUF.
- Latencia y throughput: no disponible.
- Nota practica: el entrenamiento uso `max_len` 1024, por lo que el comportamiento del adaptador en contextos muy largos no esta entrenado y no deberia asumirse.

## Comparativa con modelos similares

Este adaptador no compite en la misma categoria que un modelo instructivo general: es un artefacto de investigacion que necesita el modelo base para funcionar. La comparacion relevante es con su base y, en segundo lugar, con adaptadores de personaje de la misma familia de investigacion. Las cifras de los modelos base proceden de su documentacion publica.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`mathematical`, oct_behaviour) | Adaptador LoRA sobre Qwen2.5-7B-Instruct | No disponible (base 7,61 B) | No especificada (base: 32.768 nativos; 131.072 con YaRN) | No disponible | HuggingFace (0 descargas registradas) |
| Qwen/Qwen2.5-7B-Instruct | Modelo instructivo denso | 7,61 B | 32.768 nativos; 131.072 con YaRN | Apache-2.0 | Ampliamente disponible |
| Otros adaptadores de la misma coleccion (Misalignment-Empirics) | Adaptadores LoRA sobre el mismo base | No disponible | No disponible | No disponible | HuggingFace |
| Adaptadores derivados de OpenCharacterTraining (arXiv:2511.01689) | Adaptadores de personaje / organismos de investigacion | No disponible | No disponible | No disponible | HuggingFace (`maius/OpenCharacterTraining-data` para los datos) |

## Limitaciones y advertencias

- Artefacto sin evaluar: la propia model card afirma que no ha sido evaluado ni validado. No hay benchmarks, ni evaluaciones de utilidad, ni analisis de seguridad.
- Licencia no disponible: no se puede asumir uso comercial permitido del adaptador. La licencia del artefacto derivado debe verificarse con el autor antes de cualquier uso productivo.
- Naturaleza de model organism: ha sido entrenado deliberadamente para implantar un comportamiento de personalidad, lo que puede producir respuestas sesgadas hacia ese registro y degradar el rendimiento en tareas ajenas a la persona matematica.
- Riesgo de alucinacion: es un modelo de 7 B con datos de DPO de profesor; puede generar afirmaciones matematicas plausibles pero incorrectas, especialmente en razonamiento de varios pasos.
- Limitacion de contexto efectivo: el entrenamiento se hizo con `max_len` 1024, por lo que no hay garantia de comportamiento coherente en contextos largos, aunque el base soporte ventanas mayores.
- Idiomas no documentados: no hay informacion sobre cobertura multilingue del adaptador ni sobre el idioma de la constitucion utilizada.
- Datos y sesgos: el dataset de entrenamiento proviene de un unico profesor (GLM-4.5-Air) y de una constitucion concreta; los sesgos de esa fuente se trasladan al adaptador y no han sido auditados.
- Requiere el modelo base: no es autosuficiente; hay que cargar `Qwen/Qwen2.5-7B-Instruct` ademas del adaptador, con el coste de VRAM y de licencia que ello implica.
- Uso responsable: al ser un organismo de investigacion sobre desalineacion, no deberia desplegarse en productos orientados a usuarios finales sin una evaluacion previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-oct-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Datos de profesor de OpenCharacterTraining: https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia citado en las etiquetas del repo: arXiv:2511.01689
- Organizacion en HuggingFace: https://huggingface.co/Misalignment-Empirics
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente entradas de diccionario para el termino "misalignment", sin relacion con el artefacto.
