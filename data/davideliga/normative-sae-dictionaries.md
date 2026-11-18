# davideliga/normative-sae-dictionaries

## Resumen

`davideliga/normative-sae-dictionaries` no es un modelo generativo, sino una coleccion de diccionarios de autoencoders dispersos (SAE, *sparse autoencoders*) entrenados para interpretabilidad mecanicista sobre los estados ocultos de varios modelos de la familia Llama 3.2 y de Qwen2.5. Los desarrolla Davide Liga junto con Liuwen Yu y Matteo Magnini, y acompanan al paper *Disambiguating Moral Circuits and Moral Features in Language Models* (arXiv:2611.21705). El objetivo es descomponer activaciones internas en caracteristicas interpretables que permitan estudiar como se representan contenidos morales, juicios normativos y palabras senal (*cue words*) en el modelo.

El repositorio contiene trece diccionarios TopK en formato SAELens, cada uno entrenado sobre una capa concreta de un modelo base o instruct: Llama-3.2-1B (capa 7, residuo; y capa 0, salida MLP), Llama-3.2-3B (capas 3, 7, 11 y 19) y Qwen2.5-7B (capa 0). Cada diccionario tiene entre 16.384 y 28.672 caracteristicas, con valores de k de 64 o 128. El tamano total del repositorio es de 6,6 GB.

Es relevante para investigadores en interpretabilidad que necesiten analizar circuitos morales en modelos abiertos sin reentrenar los SAE, y para quienes quieran reproducir o extender el analisis del paper. No sirve para inferencia directa ni para generacion de texto: es material de analisis de activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (formato SAELens) sobre estados ocultos de transformers |
| Parametros totales | No disponible (depende del diccionario; entre 16.384 y 28.672 caracteristicas por capa) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | CC BY 4.0 (los diccionarios derivados de Llama 3.2 estan sujetos a la Llama 3.2 Community License) |
| Formato de pesos | `safetensors` + `cfg.json` (formato SAELens) |

## Arquitectura y entrenamiento

Cada carpeta contiene un diccionario TopK con `cfg.json` y `sae_weights.safetensors` en el formato de SAELens. Los SAE se entrenaron sobre los estados ocultos de una capa concreta de un modelo concreto, con un numero fijo de caracteristicas activas por token (k = 64 o 128). La tabla del repositorio detalla la capa y el *site* de cada diccionario: flujo residual en la mayoria de casos, salida MLP en `llama-3.2-1B-base-MLP0`, y capas 0, 3, 7, 11 y 19 segun el modelo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo tecnicas adicionales como RLHF o DPO (no aplican a un SAE). El paper asociado analiza 14 modelos y utiliza ademas el diccionario Llama Scope de la capa 12 de Llama-3.1-8B (`fnlp/Llama3_1-8B-Base-LXR-8x`), que no forma parte de este repositorio. La innovacion principal es la aplicacion de SAE a un problema concreto de interpretabilidad: desambiguar si una activacion refleja contenido moral, juicio normativo o simplemente una palabra senal.

## Capacidades

- Extraccion de caracteristicas interpretables de los estados ocultos de Llama-3.2-1B, Llama-3.2-3B y Qwen2.5-7B en capas y sitios concretos.
- Analisis de representaciones internas relacionadas con contenido moral, juicios normativos y palabras senal.
- Soporte de *feature attribution* y estudio de circuitos mediante el codigo del paper.
- Compatibilidad con SAELens para cargar y manipular los diccionarios.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es material de analisis, no un modelo de inferencia.
- Capacidades multilingues: no disponibles (no aplica directamente; dependen del modelo subyacente sobre el que se entreno el SAE).

## Casos de uso

- Investigacion en interpretabilidad mecanicista: cargar un diccionario con `SAE.load_from_disk` y analizar que caracteristicas se activan ante estimulos morales en Llama-3.2-1B o 3B, sin reentrenar el SAE.
- Reproduccion del paper: usar los trece diccionarios junto con el codigo de `normative-mechanistic-interpretability` para replicar el analisis de circuitos morales en los 14 modelos estudiados.
- Estudio de diferencias base vs. instruct: comparar `llama-3.2-3B-base-k128` con `llama-3.2-3B-IT-k128` para ver como el ajuste por instrucciones reorganiza las caracteristicas morales en la capa 11.
- Analisis por capas: usar `llama-3.2-3B-IT-L3`, `-L7` y `-L19` para trazar como evoluciona la representacion de un concepto normativo a lo largo de la profundidad del modelo.
- Auditoria de sesgos y seguridad: identificar caracteristicas asociadas a juicios normativos en Qwen2.5-7B y Llama-3.2 para evaluar si el modelo codifica estereotipos o sesgos de forma lineal y aislable.
- Docencia y formacion: emplear diccionarios pequenos (1B) en cursos de interpretabilidad como ejemplo practico de SAE TopK en formato SAELens.
- Comparacion entre familias: contrastar los diccionarios de Qwen2.5-7B (28.672 caracteristicas) con los de Llama-3.2-3B (24.576) para estudiar diferencias en la estructura de caracteristicas entre arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: cada diccionario individual pesa del orden de cientos de MB; el repositorio completo ocupa 6,6 GB en disco. Para cargar un SAE en memoria se necesita VRAM proporcional al tamano del diccionario mas el modelo subyacente cuyas activaciones se quieran analizar.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el modelo subyacente (Llama-3.2-1B, 3B o Qwen2.5-7B). Para Llama-3.2-1B basta una GPU consumer de 8 GB; para Qwen2.5-7B se recomienda 16-24 GB (RTX 4090, A100, H100) segun precision.
- Cabe en GPU consumer: si, al menos los diccionarios de Llama-3.2-1B y 3B; el de Qwen2.5-7B depende de la VRAM disponible para el modelo base.
- Opciones de despliegue: SAELens (`SAE.load_from_disk`), el codigo del paper (`--sae-dir dictionaries/<folder>`) y `hf download` para la descarga. No aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Recurso | Modelo subyacente | Capa | Caracteristicas | k | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (Llama-3.2-3B-IT-k128) | Llama-3.2-3B-Instruct | 11 | 24.576 | 128 | CC BY 4.0 + Llama 3.2 | Hugging Face |
| Llama Scope LXR-8x | Llama-3.1-8B | 12 | No disponible en la informacion | No disponible | No disponible | `fnlp/Llama3_1-8B-Base-LXR-8x` |
| SAE de Llama-3.2-1B (este repo) | Llama-3.2-1B | 7 | 16.384 | 64/128 | CC BY 4.0 + Llama 3.2 | Hugging Face |
| SAE de Qwen2.5-7B (este repo) | Qwen2.5-7B | 0 | 28.672 | 128 | CC BY 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos diccionarios en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para inferencia, generacion de texto ni tareas de NLP directas.
- Solo cubre capas y sitios concretos; las conclusiones sobre caracteristicas morales no se generalizan automaticamente a otras capas o modelos.
- Los diccionarios de Llama estan sujetos a la Llama 3.2 Community License ademas de CC BY 4.0; conviene revisar las restricciones de uso comercial de dicha licencia.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion externa de la comunidad en el momento de la consulta.
- La calidad de las caracteristicas depende del entrenamiento del SAE; no se documentan metricas de reconstruccion ni de dispersión en la informacion disponible.
- Riesgo de sobreinterpretacion: atribuir significado moral a una caracteristica requiere validacion cuidadosa, tal como advierte el propio enfoque del paper.
- Idiomas soportados no disponibles; el comportamiento multilingue dependera del modelo subyacente.

## Enlaces

- Hugging Face: https://huggingface.co/davideliga/normative-sae-dictionaries
- Paper: https://arxiv.org/abs/2611.21705
- Codigo: https://github.com/daviligade/normative-mechanistic-interpretability
- Diccionario Llama Scope (externo): https://huggingface.co/fnlp/Llama3_1-8B-Base-LXR-8x
