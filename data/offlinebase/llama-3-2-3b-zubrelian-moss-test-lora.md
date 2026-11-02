# OfflineBase/Llama-3.2-3B-Zubrelian-Moss-Test-LoRA

## Resumen

Llama-3.2-3B-Zubrelian-Moss-Test-LoRA es un adaptador LoRA de caracter experimental publicado por el usuario OfflineBase sobre el modelo base unsloth/Llama-3.2-3B-Instruct-bnb-4bit. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (aproximadamente 0,1 GB) que debe cargarse junto al modelo base cuantizado en 4 bits para funcionar. Su proposito declarado es servir como prueba de concepto de un pipeline de ajuste fino: validar el flujo de entrenamiento y el sistema de evaluacion, no ofrecer una capacidad de produccion.

El ajuste se realizo sobre un dominio completamente inventado, una supuesta aficion denominada "musgo zubrelián" de un planeta ficticio. Segun la model card, el entrenamiento consistio en 450 pasos con LoRA de rango 16 sobre 900 filas de datos sinteticos generados mediante la API de Meta, con una reduccion de la perdida de 3,49 a 1,53 y un pico de VRAM de 3,61 GB en una GPU A10. La evaluacion reportada (95 de 100 prompts ganados frente al modelo base, puntuacion media 6,67 frente a 2,55) procede de un juicio ciego automatizado y no de benchmarks estandar.

El interes de esta ficha es limitado desde el punto de vista de la evaluacion tecnica de capacidades: el repositorio es privado, no tiene descargas ni likes, y el propio autor advierte que no ha pasado la revision de licencia ni de datos personales necesaria para una publicacion publica. Cualquier uso en produccion esta desaconsejado por el caracter ficticio de los datos y por la ausencia de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Llama 3.2 3B Instruct |
| Parametros totales | No disponible para el adaptador; modelo base Llama 3.2 3B (3,21 mil millones aproximados, dato no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 3B) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | Llama 3.2 Community License (etiquetada como "other" / "llama3.2") |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Rango LoRA | 16 |
| Pasos de entrenamiento | 450 |
| Filas de entrenamiento | 900 |
| Perdida inicial / final | 3,49 / 1,53 |
| VRAM pico en entrenamiento | 3,61 GB (GPU A10) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 3B Instruct, un transformer decoder-only de la familia Llama 3.2 con atencion causal estandar. El ajuste emplea LoRA con rango 16, lo que introduce matrices de baja dimensionalidad en las capas del modelo base sin modificar los pesos originales. El modelo base utilizado es la version cuantizada en 4 bits de Unsloth (unsloth/Llama-3.2-3B-Instruct-bnb-4bit), fijada en la revision bb1d317a, lo que reduce los requisitos de memoria durante el entrenamiento.

El conjunto de datos de entrenamiento consta de 900 filas generadas sinteticamente mediante la API de Meta con la herramienta Muse Spark 1.3 Contributor, bajo los terminos de dicha API. El contenido es completamente ficticio: una guia sobre un musgo inventado de un planeta imaginario. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. Tampoco se especifica la composicion exacta del dataset ni el numero de tokens de entrenamiento. La model card indica que dos rondas adicionales de ajuste no mejoraron los resultados, lo que sugiere un estancamiento temprano en la curva de aprendizaje para esta tarea concreta.

## Capacidades

- Generacion de texto en el dominio especifico del ajuste: reproduce la "forma" del estilo entrenado y el vocabulario inventado del musgo zubrelián.
- Razonamiento y codigo: no evaluados ni documentados en la informacion proporcionada; se heredan las capacidades del modelo base Llama 3.2 3B Instruct, pero no hay validacion especifica.
- Tool calling / function calling: no documentado para este adaptador; el modelo base Llama 3.2 3B Instruct soporta oficialmente tool calling, pero el adaptador no ha sido evaluado en esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio. El adaptador esta orientado exclusivamente a la reproduccion de un dominio ficticio.

## Casos de uso

- Validacion de pipelines de ajuste fino: el adaptador sirve como artefacto de prueba para verificar que un flujo de entrenamiento LoRA (carga del modelo base, tokenizacion, entrenamiento, guardado y evaluacion) funciona de extremo a extremo antes de lanzar entrenamientos reales con datos productivos.
- Pruebas de integracion con PEFT: permite comprobar la carga y el merge de adaptadores LoRA en entornos de desarrollo (por ejemplo, con la libreria peft y transformers) sin necesidad de datos reales.
- Evaluacion de sistemas de juicio automatico: los resultados reportados (juicio ciego con Muse Wonder) pueden usarse como referencia para calibrar pipelines de evaluacion LLM-as-a-judge en tareas de dominio muy especifico.
- Docencia y demostraciones sobre ajuste fino: util para explicar en talleres o cursos como se construye un adaptador LoRA, como se mide la perdida y como se evalua frente al modelo base.
- Pruebas de regresion de infraestructura: al ser un artefacto pequeno (0,1 GB) y con requisitos de VRAM bajos en entrenamiento (3,61 GB pico), sirve para validar entornos de GPU (por ejemplo, instancias A10) antes de ejecutar jobs mayores.
- Investigacion sobre sobreajuste controlado: el caso de un dominio inventado con vocabulario propio permite estudiar como un modelo pequeno memoriza terminologia ficticia y como se degrada o no en dos rondas adicionales de ajuste.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion real, dado el caracter ficticio de los datos y la falta de revision de licencia y datos personales.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles en la informacion proporcionada son los reportados por el autor, basados en un juicio ciego automatizado con Muse Wonder sobre 100 prompts reservados:

| Metrica | Modelo ajustado | Modelo base | Diferencia |
|---|---|---|---|
| Prompts ganados (de 100) | 95 | 5 (inferido) | +90 |
| Puntuacion media | 6,67 | 2,55 | +4,12 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos anteriores corresponden exclusivamente a la tarea ficticia de entrenamiento y no son extrapolables a capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 3B en 4 bits, la inferencia requiere aproximadamente 2-3 GB de VRAM para el modelo base cuantizado mas el espacio del adaptador (0,1 GB). Cifra estimada, no confirmada en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder ejecutar el modelo base en 4 bits. Para entrenamiento, el autor reporta un pico de 3,61 GB en una NVIDIA A10.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, dado el reducido tamano del modelo base cuantizado. No verificado en la informacion proporcionada.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base mediante la libreria peft y transformers. No se distribuye en formato GGUF, por lo que su uso con llama.cpp u Ollama requeriria una conversion previa (merge del adaptador y cuantizacion posterior). vLLM y TGI soportan adaptadores LoRA, pero no hay documentacion especifica para este adaptador.
- Latencia y throughput: no disponibles. La model card indica explicitamente que no se ha ejecutado en una Jetson en ningun log disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Zubrelian-Moss-Test-LoRA | Adaptador sobre 3B | No disponible | Llama 3.2 Community | Repositorio privado, 0 descargas | Datos ficticios, sin revision de licencia |
| Llama 3.2 3B Instruct (Meta) | 3,21B (aprox.) | 128K (segun documentacion oficial de Meta) | Llama 3.2 Community | Publico en HuggingFace | Modelo base oficial, evaluado en benchmarks estandar |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit | 3,21B (aprox.) cuantizado 4 bits | Heredado del base | Llama 3.2 Community | Publico en HuggingFace | Version cuantizada para entrenamiento e inferencia eficiente |
| Adaptadores LoRA comunitarios sobre Llama 3.2 3B | Variable | Heredado del base | Variable (mayoria Llama 3.2) | Publicos en HuggingFace | Dependen de la calidad y volumen de sus datos; este adaptador usa datos sinteticos ficticios |

No se dispone de datos de rendimiento comparables en benchmarks estandar para este adaptador, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Datos de entrenamiento completamente ficticios: el dominio del "musgo zubrelián" es inventado, por lo que el adaptador no aporta conocimiento factual verificable sobre ningun tema real.
- Repositorio privado: la model card indica explicitamente que el repositorio es privado y que no ha pasado la revision de licencia ni de datos personales necesaria para una publicacion publica.
- Riesgo de alucinacion elevado en cualquier consulta fuera del dominio entrenado: el ajuste refuerza la reproduccion de un estilo y vocabulario inventados, lo que puede incrementar la generacion de contenido plausible pero falso.
- Sin evaluacion independiente: los unicos resultados son los reportados por el autor mediante un juez automatico (Muse Wonder), sin validacion externa ni benchmarks estandar.
- Idiomas no documentados: se desconoce el comportamiento multilingue del adaptador; probablemente herede el del modelo base, pero no hay evidencia.
- Restricciones de licencia: sujeto a la Llama 3.2 Community License y su Acceptable Use Policy. El autor declara que el ajuste no fue creado, revisado ni respaldado por Meta. Cualquier uso comercial debe cumplir los terminos de dicha licencia.
- Sin soporte para despliegue directo en llama.cpp u Ollama: al distribuirse solo como adaptador PEFT en safetensors, requiere merge y conversion para formatos GGUF.
- Estancamiento del entrenamiento: dos rondas adicionales de ajuste no mejoraron los resultados, lo que sugiere que el modelo ha alcanzado su limite para esta tarea concreta.
- Sin datos de latencia ni throughput: no se puede estimar el rendimiento en produccion.
- Fecha de creacion futura (2026-11-02): el metadato del repositorio indica una fecha posterior a la actual, lo que debe tratarse con cautela y sugiere que el repositorio es de caracter experimental o de prueba.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OfflineBase/Llama-3.2-3B-Zubrelian-Moss-Test-LoRA
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Pagina oficial de Llama 3.2 (Meta): https://www.llama.com/
- Libreria PEFT: https://huggingface.co/docs/peft
- Libreria Unsloth: https://github.com/unslothai/unsloth
