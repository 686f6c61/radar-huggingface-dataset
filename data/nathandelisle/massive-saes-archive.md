# nathandelisle/massive-saes-archive

## Resumen

`nathandelisle/massive-saes-archive` es un repositorio de checkpoints de autoencoders dispersos (SAE, *sparse autoencoders*) publicado por nathandelisle como material de respaldo del articulo *Massive Activations Confound Sparse Autoencoders*. No es un modelo de lenguaje generativo, sino un conjunto de artefactos de interpretabilidad: SAE entrenados sobre las activaciones internas de varios modelos base (Llama-3.1-70B, GPT-2 y Pythia-1.4B) para descomponer esas activaciones en caracteristicas dispersas y analizables.

El repositorio principal asociado es `nathandelisle/massive-saes`; este archivo contiene los conjuntos experimentales secundarios que sustentan las cifras del articulo: la rejilla de comparacion de objetivos de entrenamiento (BatchTopK, ReLU + L1, Gated y JumpReLU) sobre ocho modelos, los SAE de Llama-3.1-70B con dos semillas y con cinco semillas, los SAE de GPT-2 con diez semillas por configuracion y los SAE TopK de Pythia-1.4B con penalizacion L1 de intensidad variable.

Su relevancia es metodologica: permite reproducir los experimentos del paper sobre como las activaciones masivas (valores de activacion de magnitud extrema en unas pocas dimensiones) sesgan y confunden el entrenamiento y la evaluacion de SAE. El repositorio ocupa 46,6 GB y se distribuye bajo licencia CC BY 4.0, con la salvedad de que se aplican tambien las licencias de los modelos base sobre cuyas activaciones se entrenaron los SAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoders dispersos (SAE) con objetivos BatchTopK, ReLU + L1, Gated y JumpReLU |
| Parametros totales | no disponible (depende del modelo base y de la expansion del SAE; no se especifica en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (los SAE operan sobre activaciones de una posicion de token, no sobre secuencias) |
| Tipos de cuantizacion | no disponible (checkpoints en `sae.pt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (heredado de los modelos base: Llama-3.1-70B, GPT-2, Pythia-1.4B) |
| Licencia | CC BY 4.0; se aplican adicionalmente las licencias de los modelos base |
| Formato de pesos | PyTorch (`sae.pt` + `config.json` por checkpoint) |

## Arquitectura y entrenamiento

Cada checkpoint es un autoencoder disperso entrenado sobre las activaciones de un modelo base concreto. El repositorio cubre cuatro familias de objetivo de entrenamiento comparadas en la Tabla 1 del articulo: BatchTopK, ReLU con penalizacion L1, Gated y JumpReLU. La carpeta `objective-grid/` contiene esa comparacion sobre ocho modelos, en dos variantes denominadas `standard` y `bypass`, presumiblemente para aislar el efecto de las activaciones masivas en el objetivo de entrenamiento.

Los conjuntos restantes aportan robustez estadistica y analisis de semillas: `llama-3.1-70b/` incluye SAE TopK con semillas 42 y 137, de los que proceden las cifras del articulo para el modelo de 70B; `llama-3.1-70b-five-seed/` anade un conjunto posterior de cinco semillas con su media de entrenamiento y su primera componente principal (PC1); `gpt2-ten-seed/` contiene SAE de GPT-2 con diez semillas por configuracion de entrenamiento; y `beta-pythia-1.4b/` incluye SAE TopK de Pythia-1.4B con una penalizacion L1 adicional de intensidad variable, lo que permite estudiar el compromiso entre dispersión y reconstruccion.

La innovacion tecnica del trabajo no reside en una arquitectura nueva de SAE, sino en el analisis de como las activaciones masivas confunden las metricas habituales de evaluacion de SAE y en la propuesta de variantes (`bypass`) que mitigan ese efecto. No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, que en cualquier caso no aplican a este tipo de artefacto.

## Capacidades

- Extraccion de caracteristicas interpretables a partir de activaciones internas de Llama-3.1-70B, GPT-2 y Pythia-1.4B.
- Comparacion controlada de cuatro objetivos de entrenamiento de SAE (BatchTopK, ReLU + L1, Gated, JumpReLU) sobre una rejilla de ocho modelos.
- Analisis de variabilidad entre semillas: dos y cinco semillas en Llama-3.1-70B, diez semillas por configuracion en GPT-2.
- Estudio del efecto de la penalizacion L1 en SAE TopK mediante la serie `beta-pythia-1.4b/`.
- Soporte para analisis de componentes principales sobre las medias de entrenamiento (PC1 incluida en el conjunto de cinco semillas de 70B).
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es un artefacto de interpretabilidad, no un modelo de lenguaje.
- Carga directa en PyTorch mediante `torch.load(path, map_location="cpu", weights_only=True)`.

## Casos de uso

- Reproduccion de los experimentos del articulo *Massive Activations Confound Sparse Autoencoders*: cargar los checkpoints de `objective-grid/` y recalcular la Tabla 1 para verificar las conclusiones sobre que objetivos de entrenamiento son mas robustos frente a activaciones masivas.
- Investigacion sobre activaciones masivas: usar las variantes `standard` y `bypass` del mismo modelo base para aislar cuanto de la perdida de calidad de un SAE se debe a dimensiones de activacion de magnitud extrema.
- Analisis de estabilidad entre semillas: con `gpt2-ten-seed/` se puede medir la varianza de las caracteristicas aprendidas entre diez ejecuciones y establecer intervalos de confianza sobre metricas de interpretabilidad.
- Estudio del compromiso dispersión-reconstruccion: la serie `beta-pythia-1.4b/` permite barrer la intensidad de la penalizacion L1 sobre una arquitectura TopK fija y trazar la curva correspondiente.
- Auditoria de interpretabilidad a escala de 70B: los SAE de `llama-3.1-70b/` y `llama-3.1-70b-five-seed/` permiten analizar caracteristicas de un modelo de gran tamano sin reentrenar los SAE, partiendo de los checkpoints publicados.
- Docencia y formacion en interpretabilidad mecanicista: el repositorio sirve como material de partida para cursos o talleres que comparen objetivos de SAE sobre modelos pequenos (GPT-2, Pythia-1.4B) antes de escalar.
- Validacion de pipelines de evaluacion de SAE: usar los conjuntos multi-semilla como referencia para comprobar si una nueva metrica de evaluacion distingue de forma consistente entre objetivos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Tabla 1 del articulo para la comparacion de objetivos, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 46,6 GB; conviene descargar solo las carpetas necesarias (`objective-grid/`, `llama-3.1-70b/`, etc.) mediante descarga selectiva.
- VRAM para inferencia de los SAE: no disponible en la model card; depende de la dimensionalidad de activacion del modelo base y del factor de expansion del SAE. Los SAE de GPT-2 y Pythia-1.4B son manejables en GPU de consumo; los de Llama-3.1-70B requieren previsiblemente GPU de datacenter (A100, H100) o carga en CPU con suficiente RAM.
- GPU recomendadas: no disponible de forma explicita. Para los SAE de modelos pequenos basta una RTX 4090 o similar; para los de 70B se recomienda A100/H100.
- Cabe en GPU de consumo: si para los SAE de GPT-2 y Pythia-1.4B; no confirmado para los de Llama-3.1-70B.
- Opciones de despliegue: carga directa en PyTorch (`torch.load` con `weights_only=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a SAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Modelos base | Objetivos cubiertos | Semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nathandelisle/massive-saes-archive` (este) | Llama-3.1-70B, GPT-2, Pythia-1.4B y otros hasta ocho modelos | BatchTopK, ReLU + L1, Gated, JumpReLU | 2, 5 y 10 segun conjunto | CC BY 4.0 | Publico en Hugging Face |
| `nathandelisle/massive-saes` | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Publico en Hugging Face |
| Otros repositorios publicos de SAE (p. ej. los de Anthropic o EleutherAI) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de terceros no puede completarse con los datos proporcionados; se indica como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; cualquier uso como modelo generativo es un error de categoria.
- Los SAE heredan los sesgos y el comportamiento de los modelos base sobre los que se entrenaron; el analisis de caracteristicas puede reflejar sesgos presentes en Llama-3.1-70B, GPT-2 o Pythia-1.4B.
- La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros completos, lo que limita la reproducibilidad exacta sin consultar el articulo.
- Solo se publican dos semillas para el conjunto principal de Llama-3.1-70B; el conjunto de cinco semillas es posterior y puede no coincidir con las cifras del paper.
- Los checkpoints estan en formato PyTorch (`sae.pt`); no hay versiones en safetensors ni GGUF, lo que obliga a usar `torch.load` y a confiar en el origen del repositorio.
- Licencia CC BY 4.0 permite uso comercial con atribucion, pero se aplican adicionalmente las licencias de los modelos base; el uso comercial de SAE derivados de Llama-3.1-70B queda sujeto a la licencia de Llama.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- No se documentan metricas de calidad de reconstruccion ni de interpretabilidad en la model card; hay que remitirse al articulo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nathandelisle/massive-saes-archive
- Repositorio principal de SAE: https://huggingface.co/nathandelisle/massive-saes
- Articulo referenciado: *Massive Activations Confound Sparse Autoencoders* (no se proporciona URL en la informacion disponible)
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada
