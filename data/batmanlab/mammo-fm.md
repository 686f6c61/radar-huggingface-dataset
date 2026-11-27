# batmanLab/Mammo-FM

## Resumen

Mammo-FM es un modelo fundacional especializado en imagen mamográfica desarrollado por Batman Lab (Boston University), presentado en el articulo arXiv 2512.00198. Su objetivo es unificar en un unico modelo tareas de diagnostico, pronostico y generacion de informes sobre mamografias, cubriendo el ciclo completo de la imagenologia mamaria en lugar de abordar cada tarea con modelos independientes. Se posiciona como continuacion de Mammo-CLIP (MICCAI 2024), un modelo vision-lenguaje preentrenado sobre pares mamografia-informe.

El repositorio pesa 14,5 GB y contiene pesos en formato safetensors con logica de carga personalizada (tag `custom`), lo que indica que requiere codigo propio del autor para instanciar el modelo. No se especifican en la model card el numero de parametros, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de vision medica y no de un modelo de lenguaje generativo de proposito general.

La relevancia actual del modelo radica en la escasez de modelos fundacionales especificos de dominio en radiologia mamaria y en la dificultad de obtener datasets grandes y diversos de pares imagen-informe. Mammo-FM aborda esa limitacion con preentrenamiento a gran escala sobre mamografias y se distribuye bajo una licencia academica restrictiva que prohibe explicitamente uso comercial, despliegue clinico y servicio via API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de vision para mamografia; sucesor de Mammo-CLIP, sin detalle arquitectonico en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen medica; los informes asociados estan en ingles segun la literatura de Mammo-CLIP) |
| Licencia | custom-academic-license-for-model-weights (uso exclusivamente academico no comercial) |
| Formato de pesos | safetensors con codigo de carga personalizado (`custom`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna, el numero de tokens de entrenamiento ni la composicion exacta del dataset. El modelo se enmarca en la linea de investigacion de Mammo-CLIP, un modelo vision-lenguaje preentrenado sobre pares de mamografias de cribado e informes radiologicos, lo que sugiere un enfoque de aprendizaje contrastivo imagen-texto combinado con etapas posteriores de adaptacion para diagnostico, pronostico y generacion de informes. El articulo asociado (arXiv 2512.00198) es la fuente primaria para conocer el detalle del preentrenamiento, el volumen de datos y las tecnicas de ajuste fino empleadas.

Como innovacion destacable, Mammo-CLIP introdujo Mammo-FActOR, un metodo de atribucion de caracteristicas que proporciona interpretacion espacial de las representaciones con granularidad a nivel de frase dentro de los informes de mamografia. Mammo-FM extiende ese trabajo hacia un modelo unico que cubre multiples tareas clinicas, aunque la model card no confirma si conserva mecanismos de interpretabilidad equivalentes ni si emplea RLHF, DPO u otras tecnicas de alineacion (poco probables en un modelo de vision medica).

## Capacidades

- Diagnostico asistido sobre mamografias: clasificacion y localizacion de atributos mamograficos relevantes para la deteccion de cancer de mama.
- Pronostico: el titulo del articulo indica capacidad de prediccion de evolucion clinica a partir de la imagen, aunque el detalle no esta en la model card.
- Generacion de informes: produccion de texto radiologico asociado a la mamografia, heredado del enfoque vision-lenguaje de Mammo-CLIP.
- Interpretabilidad espacial: la linea de investigacion incluye atribucion de caracteristicas con granularidad de frase (Mammo-FActOR).
- Eficiencia de datos: segun la literatura de Mammo-CLIP, el preentrenamiento a gran escala mejora la robustez y la eficiencia de datos en tareas posteriores.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision general, audio: no disponible; el modelo esta especializado en mamografia.

## Casos de uso

- Investigacion en deteccion de cancer de mama: uso del modelo como extractor de representaciones o base para ajuste fino en estudios academicos sobre clasificacion de lesiones mamograficas, aprovechando el preentrenamiento especifico de dominio.
- Evaluacion comparativa de modelos fundacionales medicos: benchmark de Mammo-FM frente a modelos genericos de vision en tareas de mamografia, dentro de un entorno de investigacion no comercial.
- Generacion de informes radiologicos en entornos de investigacion: estudio de la calidad y fidelidad de los informes generados a partir de mamografias, con supervision de radiologos y sin uso clinico real.
- Analisis de interpretabilidad: aplicacion de tecnicas de atribucion (estilo Mammo-FActOR) para estudiar que regiones de la imagen sustentan las predicciones del modelo, con fines de auditoria academica.
- Linear probing y evaluacion de eficiencia de datos: congelar el modelo y entrenar cabezas lineales sobre subconjuntos pequenos de datos etiquetados para medir la calidad de las representaciones aprendidas.
- Estudio de sesgos en imagen medica: analisis de disparidades de rendimiento entre subgrupos demograficos en datasets publicos de mamografia, con fines de investigacion sobre equidad algoritmica.
- Desarrollo de metodos de ajuste fino parameter-efficient: uso del modelo como base para experimentos academicos con LoRA u otras tecnicas, siempre que se respete la clausula de no redistribucion de derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo arXiv 2512.00198 para los resultados experimentales, pero no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de imagen como AUC o sensibilidad/especificidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 14,5 GB en safetensors, por lo que se requiere al menos una GPU con 16-24 GB de VRAM para cargar los pesos en precision original, y mas si se procesan lotes de mamografias de alta resolucion.
- GPU recomendadas: no especificadas por el autor; por tamano de pesos, una NVIDIA A100 (40/80 GB), H100 o RTX 4090 (24 GB) son candidatas razonables, aunque no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: probable en GPUs de 24 GB si los pesos caben en memoria, pero no confirmado; no se documentan cuantizaciones (GGUF, AWQ, GPTQ) que faciliten el despliegue en hardware menor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el tag `custom` implica dependencia del codigo del repositorio de GitHub para cargar el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mammo-FM | Fundacional de vision para mamografia | no disponible | no disponible | Academica no comercial | Hugging Face (pesos) + GitHub |
| Mammo-CLIP | Vision-lenguaje para mamografia | no disponible | no disponible | No indicada en la informacion | GitHub publico |
| Modelos genericos de vision (p. ej. CLIP) | Vision-lenguaje general | Variable | no aplica | Variable | Amplia |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; Mammo-CLIP es el referente directo por continuidad de autoria y enfoque.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: solo permite uso academico no comercial por instituciones academicas y organizaciones sin animo de lucro; prohibe uso comercial, investigacion industrial, despliegue clinico, uso diagnostico, redistribucion de pesos, servicio via API o SaaS, y destilacion o extraccion de conocimiento.
- Prohibicion explicita de uso en sistemas de decision medica y en diagnostico o tratamiento, lo que excluye cualquier aplicacion clinica real.
- Los modelos derivados solo se permiten si son de uso academico no comercial, no se comparten publicamente y heredan la misma licencia.
- Riesgo de alucinacion en la generacion de informes: al ser un componente vision-lenguaje, puede producir descripciones no sustentadas por la imagen, lo que exige validacion por especialistas en cualquier estudio.
- Sesgos potenciales derivados de la distribucion de los datasets de mamografia de entrenamiento (demografia, equipos, protocolos de adquisicion), no cuantificados en la model card.
- Ausencia de documentacion sobre cuantizaciones y opciones de despliegue, lo que complica la reproducibilidad fuera del entorno del autor.
- No se especifican parametros, contexto ni idiomas, lo que limita la evaluacion previa sin consultar el articulo.
- Cita y reconocimiento obligatorios en cualquier uso del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batmanLab/Mammo-FM
- Articulo arXiv: https://arxiv.org/pdf/2512.00198
- Repositorio GitHub: https://github.com/batmanlab/Mammo-FM
- Repositorio Mammo-CLIP: https://github.com/batmanlab/Mammo-CLIP
- Licencia completa: https://huggingface.co/batmanLab/Mammo-FM/blob/main/LICENSE
- Contacto comercial: batman@bu.edu
- Contacto tecnico: shawn24@bu.edu
