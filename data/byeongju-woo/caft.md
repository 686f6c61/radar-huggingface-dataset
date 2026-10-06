# byeongju-woo/CAFT

## Resumen

CAFT (Cross-domain Alignment of Forests and Trees) es un conjunto de checkpoints preentrenados para recuperación de imagen-texto, con especial foco en la recuperación con leyendas largas (long-caption retrieval). Lo firma Byeongju Woo junto con Zilin Wang, Byeonghyun Pak, Sangwoo Mo y Stella X. Yu, y acompaña al artículo "Aligning Forest and Trees in Images & Long Captions for Visually Grounded Understanding" (arXiv:2602.02977). El repositorio de HuggingFace aloja cuatro pesos (`CAFT-3M`, `CAFT-12M`, `CAFT-15M` y `CAFT-30M`), con un tamaño total de 8,2 GB.

El modelo se distribuye como pesos PyTorch (`.pt`) que se cargan mediante el codebase propio del proyecto, usando la configuración `CAFT-B` y el modo de inferencia `caft` con un hiperparámetro `alpha` (0,3 en el ejemplo de la model card). Por las etiquetas del repositorio (`clip`) y la nomenclatura de la configuración, se trata de un codificador dual de estilo CLIP orientado a alinear representaciones de imagen y texto, aunque el número exacto de parámetros, la longitud de contexto y los idiomas soportados no se detallan en la información disponible.

Es relevante porque aborda un problema poco cubierto por los CLIP convencionales: la alineación entre imágenes y descripciones extensas, donde la poda de tokens o el truncado a contextos cortos degrada la calidad del retrieval. Los checkpoints se escalan según el corpus de preentrenamiento (CC3M, CC12M, YFCC15M y una fusión de 30M), lo que permite elegir el equilibrio entre cobertura y coste. El repositorio es muy reciente (creado el 5 de octubre de 2026) y, en el momento de la consulta, acumula 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador dual de estilo CLIP (etiqueta `clip`; configuracion `CAFT-B`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints `.pt`, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), cargados con el codebase propio |

## Arquitectura y entrenamiento

La informacion disponible indica que CAFT se apoya en la configuracion `CAFT-B` del codebase `flair` del propio proyecto, con un modo de inferencia especifico (`--inference-mode caft`) y un parametro `alpha` que pondera la alineacion. La etiqueta `clip` del repositorio situa al modelo en la familia de codificadores duales imagen-texto, en los que una torre visual y una torre de texto se proyectan a un espacio comun para calcular similitudes coseno. El articulo describe el metodo como una alineacion de "bosques y arboles", es decir, de la representacion global y de las unidades locales, aunque los detalles internos (numero de capas, dimensiones, mecanismo de atencion o innovaciones concretas) no se reproducen en la model card.

En cuanto a los datos, los checkpoints se diferencian por el corpus de preentrenamiento: `CAFT-3M.pt` usa CC3M-recap (DreamLIP-3M), `CAFT-12M.pt` usa CC12M-recap (DreamLIP-12M), `CAFT-15M.pt` usa YFCC15M-recap (DreamLIP-15M) y `CAFT-30M.pt` usa la fusion DreamLIP-30M (3M + 12M + 15M) y se marca como predeterminado. No se especifican el numero total de tokens vistos, la composicion detallada del dataset mas alla de los nombres, ni si hubo fases de RLHF, DPO u otro ajuste posterior.

## Capacidades

- Recuperacion imagen-texto: calculo de similitud entre imagenes y textos para busqueda cruzada en ambas direcciones.
- Recuperacion con leyendas largas (`long-caption-retrieval`): manejo de descripciones extensas sin el truncado agresivo tipico de los CLIP estandar.
- Alineacion a nivel global y local: el metodo apunta a representaciones de "bosque" (global) y "arbol" (unidades locales) de forma conjunta.
- Escalado por corpus: cuatro checkpoints con volumenes de preentrenamiento crecientes (3M, 12M, 15M y 30M).
- Integracion con codebase propio: carga via `torchrun` y configuracion `CAFT-B`, con control del parametro `alpha`.
- Generacion de texto: no disponible; no se documenta como modelo generativo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): solo vision implicita por su naturaleza imagen-texto; el resto no disponible.

## Casos de uso

- Busqueda visual en bancos de imagenes: indexar un catalogo con embeddings de imagen y recuperar por consulta textual, aprovechando la torre dual para similitud coseno a gran escala. El checkpoint `CAFT-30M` seria el punto de partida por defecto.
- Recuperacion inversa imagen a texto: dada una imagen, localizar la descripcion mas adecuada dentro de un corpus de leyendas largas, escenario donde el enfoque de contexto extendido aporta ventaja frente a CLIP convencional.
- Filtrado de datos a gran escala: usar las puntuaciones de alineacion para descartar pares imagen-texto mal emparejados antes de entrenar otros modelos, un uso habitual de los codificadores CLIP.
- Moderacion de contenidos asistida por imagen: clasificar o recuperar imagenes segun descripciones textuales de politicas, apoyandose en la similitud entre modalidades.
- Sistemas de recomendacion con atributos textuales: construir representaciones conjuntas de producto e imagen para sugerir articulos similares a partir de descripciones detalladas, donde las leyendas largas son habituales.
- Accesibilidad y descripcion automatica: emparejar imagenes con descripciones extensas generadas por otros modelos para verificar coherencia antes de publicarlas.
- Investigacion en alineacion multimodal: servir de referencia reproducible para comparar estrategias de alineacion global frente a local en tareas de retrieval, dado que el paper y el codigo estan publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub para los detalles de evaluacion, pero no incluye cifras de MMLU, HumanEval, GSM8K, recall de retrieval ni ninguna otra metrica. No se deben inferir numeros a partir del nombre de los checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 8,2 GB, pero la model card no indica el tamano de cada checkpoint por separado, por lo que no se puede derivar la huella en memoria de forma fiable.
- GPU recomendadas: no disponible. Al tratarse de una configuracion `CAFT-B` de tipo codificador dual, es razonable esperar que quepa en GPUs de gama media, pero no hay confirmacion oficial (dato estimado, no verificado).
- Compatibilidad con GPU de consumo: no confirmada; no disponible.
- Opciones de despliegue: el unico procedimiento documentado es el codebase oficial con `torchrun --nproc_per_node 1 -m main --model CAFT-B --pretrained /ruta/CAFT-30M.pt --inference-mode caft --alpha 0.3`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos numericos en la informacion proporcionada para comparar parametros, contexto o rendimiento con alternativas. Como referencia cualitativa de categoria (codificadores duales imagen-texto) cabria situar a CLIP, SigLIP o DreamLIP, este ultimo citado en la model card como origen de los corpus de preentrenamiento, pero cualquier cifra concreta no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAFT | no disponible | no disponible | no disponible | MIT | pesos `.pt` en HuggingFace |
| CLIP | no disponible | no disponible | no disponible | no disponible | no disponible |
| SigLIP | no disponible | no disponible | no disponible | no disponible | no disponible |
| DreamLIP | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse sobre CC3M-recap, CC12M-recap y YFCC15M-recap, hereda potencialmente los sesgos de esos corpus, pero no se documenta ningun analisis al respecto.
- Riesgo de alucinacion: no aplica de forma directa por tratarse de un modelo de recuperacion y no de generacion, aunque las puntuaciones de similitud pueden favorecer emparejamientos incorrectos si el corpus es ruidoso.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se declaran. Aunque la tarea objetivo son las leyendas largas, no se especifica el limite exacto de tokens.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero conviene revisar las condiciones de los corpus de preentrenamiento subyacentes (CC3M, CC12M, YFCC15M), que tienen sus propias restricciones.
- Dependencia del codebase propio: no hay pipeline de HuggingFace (`transformers`) declarado, por lo que la integracion exige clonar el repositorio de GitHub y usar su configuracion `CAFT-B`.
- Madurez del proyecto: repositorio creado en octubre de 2026, con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion.
- Ausencia de cuantizaciones: solo se publican checkpoints `.pt`, sin versiones GGUF, AWQ o GPTQ, lo que dificulta el despliegue en entornos de bajos recursos.
- Sin datos de benchmarks publicos en la ficha: la evaluacion depende enteramente del material del repositorio de codigo.

## Enlaces

- HuggingFace: https://huggingface.co/byeongju-woo/CAFT
- Codigo: https://github.com/ByeongJuWoo/CAFT
- Pagina del proyecto: https://byeongju.me/CAFT/
- Articulo: https://arxiv.org/abs/2602.02977
