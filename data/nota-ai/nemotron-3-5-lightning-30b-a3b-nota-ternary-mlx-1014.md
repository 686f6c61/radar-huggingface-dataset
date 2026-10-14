# nota-ai/Nemotron-3.5-Lightning-30B-A3B-Nota-Ternary-MLX-1014

## Resumen

Nemotron 3.5 Lightning 30B-A3B Nota Ternary es una version cuantizada a ternario (1,58 bits) del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, publicada por nota-ai en formato nativo MLX para Apple Silicon. El modelo base es una arquitectura hibrida de mezcla de expertos (MoE) con componentes Mamba (segun los tags `nemotron_h`, `mamba` y `moe`), con unos 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. La cuantizacion reduce el peso en BF16 de 60 GB a 9,6 GB (un factor de 6,25x), lo que permite ejecutarlo en equipos de consumo con memoria unificada.

La innovacion principal es que, aunque MLX no dispone de un contenedor nativo de 1,58 bits, los pesos se almacenan en un contenedor affine de 2 bits con `group_size=64` cuyos valores reales son ternarios (`{-a, 0, +a}`), con el nivel 3 sin usar y un sesgo igual a `-scale`. No requiere kernels personalizados ni adaptadores en tiempo de ejecucion.

Se trata de un checkpoint intermedio, no de la version totalmente recuperada del autor: conserva aproximadamente el 89,4 % de la media del profesor en siete tareas generativas (83,82 frente a 93,80). Es relevante porque demuestra que una cuantizacion ternaria agresiva puede mantener la mayor parte de la calidad en tareas de matematicas, codigo e instrucciones, con un coste de almacenamiento muy reducido para inferencia on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida MoE con componentes Mamba (tags `nemotron_h`, `mamba`, `moe`); modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B |
| Parametros totales | 32.987.226.432 (~33B segun safetensors); el modelo base se denomina 30B |
| Parametros activos | ~3.000 millones (segun la nomenclatura A3B del nombre; no confirmado de forma explicita en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 1,58 bits almacenada en contenedor affine de 2 bits, `group_size=64`, niveles `{0, 1, 2}` (nivel 3 sin usar), `bias == -scale` |
| Idiomas soportados | no disponible en los metadatos; los benchmarks publicados cubren ingles y coreano |
| Licencia | OpenMDW-1.1 (la misma que el modelo base) |
| Formato de pesos | safetensors en formato nativo MLX; tamano del repositorio 10,3 GB |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3.5 Lightning 30B-A3B, es una arquitectura de mezcla de expertos (MoE) con capas asociadas a Mamba, segun los tags del repositorio (`nemotron_h`, `mamba`, `moe`). Esto implica un diseno que combina mecanismos de espacio de estados con capas de atencion y expertos enrutados, buscando eficiencia en el coste de inferencia por token. El tag `on-device` indica que esta pensado para ejecucion local. Esta ficha no dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

La contribucion de nota-ai es exclusivamente de cuantizacion: parte de los pesos BF16 de NVIDIA y los convierte a ternario. La implementacion usa la cuantizacion affine nativa de MLX, sin kernel personalizado ni shim de runtime. Los valores almacenados son ternarios (`{-a, 0, +a}`), pero se guardan en un contenedor de 2 bits porque MLX no tiene uno de 1,58 bits. El autor indica que este es un checkpoint intermedio y que existe margen de recuperacion adicional respecto al profesor. La carga se realiza con `mlx_lm.load("<repo>")`, y la arquitectura debe estar implementada en la compilacion de `mlx-lm` o `mlx-vlm` que se utilice.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento matematico: evaluado en GSM8K (89,31) y MATH500 (81,60).
- Generacion de codigo: evaluado en HumanEval (90,85) y HumanEval-ko (85,37).
- Seguimiento de instrucciones: evaluado en IFEval (83,36) e IFEval-ko (73,04).
- Capacidad multilingue en ingles y coreano segun los benchmarks publicados (no hay lista oficial de idiomas en la metadata).
- Inferencia on-device optimizada para MLX en Apple Silicon (tag `on-device`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Inferencia local en Mac para asistentes de codigo: con 9,6 GB de pesos en formato MLX, el modelo cabe en un Mac con memoria unificada de 16 GB o superior y puede usarse para autocompletado y generacion de funciones, apoyandose en su resultado de 90,85 en HumanEval.
- Resolucion de problemas matematicos en local: util para herramientas educativas o scripts de calculo que necesitan razonamiento paso a paso, con 89,31 en GSM8K y 81,60 en MATH500.
- Prototipado de agentes conversacionales sin conexion: el modelo puede gestionar dialogos multi-turno localmente, evitando enviar datos a servicios en la nube, lo que resulta util en entornos con requisitos de privacidad.
- Generacion asistida en coreano: al conservar 83,24 en HRM8K y 85,37 en HumanEval-ko, sirve para tareas de matematicas y codigo en ese idioma sin depender de infraestructura remota.
- Evaluacion e investigacion sobre cuantizacion ternaria: al ser un checkpoint intermedio con resultados publicados, es un caso de estudio para medir la degradacion de calidad de 1,58 bits frente a BF16 en tareas generativas.
- Despliegue en portatiles Apple Silicon para demos y pruebas offline: el formato MLX nativo y la ausencia de kernels personalizados simplifican la integracion en aplicaciones de escritorio con `mlx-lm`.
- Filtrado y clasificacion de instrucciones en pipelines locales: con 83,36 en IFEval puede usarse como componente de preprocesado que valida o reformula peticiones antes de enviarlas a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card (temperatura 0,7, conjuntos de prueba completos, presupuesto de generacion de 32k tokens). Se compara el profesor BF16 con esta version ternaria.

| Idioma | Categoria | Benchmark | Profesor BF16 | Este modelo | Recuperado |
| :--- | :--- | :--- | ---: | ---: | ---: |
| Ingles | Matematicas | GSM8K | 95,00 | 89,31 | 94,0 % |
| Ingles | Matematicas | MATH500 | 97,60 | 81,60 | 83,6 % |
| Ingles | Codigo | HumanEval | 96,34 | 90,85 | 94,3 % |
| Ingles | Instrucciones | IFEval | 92,05 | 83,36 | 90,6 % |
| Coreano | Matematicas | HRM8K | 91,05 | 83,24 | 91,4 % |
| Coreano | Codigo | HumanEval-ko | 95,12 | 85,37 | 89,7 % |
| Coreano | Instrucciones | IFEval-ko | 89,46 | 73,04 | 81,6 % |
| | | Media | 93,80 | 83,82 | 89,4 % |

No se han publicado otros resultados de benchmarks en la informacion disponible (por ejemplo MMLU, contexto largo o pruebas de tool calling).

## Requisitos de hardware

- Peso del modelo: 9,6 GB en el formato cuantizado (el repositorio ocupa 10,3 GB). En BF16 el modelo base ocupa 60 GB.
- Memoria necesaria estimada para inferencia: al menos el tamano de los pesos mas la cache KV y activaciones; se recomienda reservar un margen por encima de los 9,6 GB (por ejemplo 12-16 GB de memoria unificada) segun la longitud de contexto, que no esta especificada.
- Plataforma: MLX esta disenado para Apple Silicon, por lo que el destino natural son Macs con memoria unificada. Un Mac con 16 GB de RAM unificada o superior es el minimo razonable.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato de pesos es especifico de MLX y no esta pensado para estos entornos sin conversion previa.
- Opciones de despliegue: `mlx-lm` (y `mlx-vlm` si se requiere), mediante `mlx_lm.load`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que el checkpoint usa un contenedor affine nativo de MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos sobre otras publicaciones ternarias comparables en la informacion proporcionada. La unica referencia cuantitativa disponible es el modelo profesor en BF16, que se compara a continuacion.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Media de benchmarks (7 tareas) | Licencia |
|---|---|---|---|---|---|
| Este modelo (Nota Ternary MLX) | ~33B (30B-A3B) | no disponible | MLX, ternario 1,58 bits (contenedor 2 bits) | 83,82 | OpenMDW-1.1 |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B BF16 (profesor) | ~30B (A3B) | no disponible | safetensors BF16, 60 GB | 93,80 | OpenMDW-1.1 |

## Limitaciones y advertencias

- Es un checkpoint intermedio, no la version totalmente recuperada: conserva alrededor del 89,4 % de la media del profesor, con la mayor perdida en MATH500 (83,6 % recuperado) e IFEval-ko (81,6 % recuperado).
- Degradacion notable en tareas de instrucciones en coreano (IFEval-ko pasa de 89,46 a 73,04), por lo que no es aconsejable para produccion en ese idioma sin validacion adicional.
- La cuantizacion ternaria puede introducir errores acumulados en generaciones largas; la model card usa un presupuesto de 32k tokens en la evaluacion, pero no especifica el comportamento mas alla.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad para esta version.
- Sesgos conocidos: no disponibles; no hay evaluacion de sesgos en la informacion proporcionada.
- Idioma: no hay lista oficial de idiomas soportados en los metadatos; los benchmarks cubren ingles y coreano, por lo que el rendimiento en castellano no esta verificado.
- Licencia OpenMDW-1.1: es necesario revisar el fichero `LICENSE` del repositorio para conocer los terminos exactos de uso comercial y las condiciones de redistribucion.
- Dependencia del ecosistema MLX: la arquitectura debe estar implementada en la compilacion de `mlx-lm` / `mlx-vlm` empleada, lo que puede requerir actualizar la libreria.
- No hay informacion sobre tool calling, agentes, vision ni contexto largo, por lo que no deben asumirse esas capacidades en produccion.
- Fecha de creacion del repositorio: 12 de octubre de 2026; conviene verificar la version exacta de las dependencias de MLX.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nota-ai/Nemotron-3.5-Lightning-30B-A3B-Nota-Ternary-MLX-1014
- Modelo base (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Contacto del autor para modelos con mayor recuperacion: https://notaai.typeform.com/contact
- Fichero de licencia: `LICENSE` en el repositorio de HuggingFace

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a servicios y recursos sin relacion (aplicaciones de transcripcion, diccionarios y herramientas de gestion de riesgos urbanisticos), por lo que se han descartado.
