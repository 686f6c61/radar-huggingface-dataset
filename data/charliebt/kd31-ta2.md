# CharlieBT/kd31-ta2

## Resumen

CharlieBT/kd31-ta2 es un modelo de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) publicado en Hugging Face bajo licencia Apache 2.0 y acceso restringido (gated). Se distribuye en formato safetensors para la libreria transformers y esta etiquetado con la arquitectura `gemma4`, lo que sugiere que deriva de la familia Gemma de Google, aunque la informacion disponible no confirma oficialmente esa procedencia. El pipeline declarado en la model card es `text-classification`, si bien los tags incluyen tambien `image-text-to-text`, lo que apunta a un modelo multimodal con capacidad de procesar imagen y texto.

El modelo se presenta como un derivado (fine-tune o merge) de dos checkpoints: `danyloooah/reax-g2-soup2` y `draven123/sn92-gen-r2-k6`. Ambos figuran como `base_model` y como `base_model:merge`, lo que indica que el checkpoint publicado combina o ajusta esos modelos previos. No se especifican en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni los metodos de alineacion (RLHF/DPO) empleados.

La relevancia de esta ficha es limitada pero util para evaluacion: se trata de un modelo reciente (creado el 26 de noviembre de 2026), sin descargas ni likes, con repositorio de 62,6 GB y acceso condicionado. Cualquier evaluacion en produccion deberia considerar que la model card no documenta capacidades, benchmarks ni limitaciones, por lo que los datos tecnicos aqui recogidos provienen exclusivamente de los metadatos de Hugging Face y de los pesos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun tag del repositorio); no se detalla la variante exacta |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification (tags adicionales: image-text-to-text) |
| Tamano del repositorio | 62,6 GB |
| Acceso | restringido (gated); requiere aceptar condiciones en Hugging Face |
| Modelos base | danyloooah/reax-g2-soup2, draven123/sn92-gen-r2-k6 |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo se etiqueta con la arquitectura `gemma4` y que esta implementado para `transformers`. No se documenta si se trata de un transformer denso, un MoE, un modelo hibrido ni si incorpora mecanismos de atencion lineal o decodificacion especulativa. El tamano de 31,3 B de parametros es consistente con un modelo denso de escala media-grande, pero no se confirma.

Respecto al entrenamiento, el repositorio declara dos modelos base (`danyloooah/reax-g2-soup2` y `draven123/sn92-gen-r2-k6`), ambos marcados como `base_model` y como `base_model:merge`. Esto sugiere que kd31-ta2 se ha obtenido mediante un merge de pesos (model soup) o un fine-tune sobre esos checkpoints, pero no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineacion. Tampoco se detalla la estrategia de tokenizacion ni el vocabulario.

La presencia simultanea de los tags `image-text-to-text` y `text-classification` es ambigua: podria tratarse de un modelo multimodal reutilizado para clasificacion de texto, o de un clasificador construido sobre un backbone multimodal. Sin documentacion adicional no es posible resolver esta ambiguedad.

## Capacidades

- Generacion de texto: no confirmada explicitamente en la informacion disponible, aunque el pipeline `text-classification` y la arquitectura tipo Gemma apuntan a un modelo de lenguaje subyacente.
- Clasificacion de texto: capacidad declarada por el pipeline del repositorio.
- Procesamiento imagen-texto: el tag `image-text-to-text` sugiere entrada multimodal, pero no se detalla el tipo de tareas (VQA, captioning, etc.).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo thinking, vision o audio: no disponible mas alla del tag `image-text-to-text`.
- Razonamiento, codigo y matematicas: no documentado.

## Casos de uso

- Clasificacion de documentos en pipelines de ingestion: dado el pipeline declarado (`text-classification`), el modelo puede emplearse para etiquetar textos en flujos de procesamiento por lotes; sin embargo, la ausencia de benchmarks obliga a validar la calidad en el dominio concreto antes de desplegarlo.
- Etiquetado de contenido multimodal: si se confirma la capacidad `image-text-to-text`, podria usarse para clasificar pares imagen-texto (por ejemplo, moderacion de publicaciones), aunque esta capacidad no esta documentada en detalle.
- Base para fine-tune especifico: al ser un modelo de ~31 B con licencia Apache 2.0, es candidato para ajuste supervisado en tareas de clasificacion vertical (sector legal, sanitario, financiero) partiendo de los pesos publicados.
- Investigacion sobre merges de modelos: el checkpoint es util para estudiar el efecto de combinar `reax-g2-soup2` y `sn92-gen-r2-k6`, comparando el comportamiento del merge frente a cada base por separado.
- Evaluacion comparativa de arquitecturas Gemma: sirve como punto de comparacion en estudios sobre la familia Gemma y sus derivados, siempre que se documenten las condiciones de evaluacion.
- Generacion asistida en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de otras licencias de modelos abiertos, lo que facilita su integracion en productos propietarios tras la validacion oportuna.
- Prototipado de asistentes multimodales: si se confirma la entrada de imagen, podria emplearse en demos de asistencia visual, aunque la falta de documentacion sobre contexto y rendimiento limita su uso en produccion sin evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 70-80 GB o mas, lo que implica multiples GPU o una GPU de 80 GB (A100/H100) con margen ajustado.
- Cuantizacion a 8 bits: en torno a 31-35 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- Cuantizacion a 4 bits: en torno a 16-20 GB de VRAM, potencialmente viable en una unica RTX 4090 (24 GB) o RTX 3090, dependiendo de la longitud de contexto y del backend.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; A100 40 GB o configuraciones multi-GPU para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: transformers (declarado), y en principio vLLM, TGI o llama.cpp si se generan conversiones compatibles, aunque no se listan artefactos GGUF ni AWQ/GPTQ en el repositorio.
- Latencia y throughput: no disponibles.
- Nota: el acceso es gated, por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parametros y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Formato | Acceso |
|---|---|---|---|---|---|
| CharlieBT/kd31-ta2 | ~31,3 B | no disponible | Apache 2.0 | safetensors | gated |
| Gemma 2 27B (referencia de familia) | ~27 B | no disponible en esta ficha | Gemma Terms | safetensors | abierto con terminos |
| Mistral Small / similares ~30 B | ~30 B | no disponible en esta ficha | Apache 2.0 (segun variante) | safetensors, GGUF | abierto |
| Modelos base declarados (reax-g2-soup2, sn92-gen-r2-k6) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con Gemma 2 27B y Mistral Small es orientativa: no se dispone de benchmarks de kd31-ta2 que permitan establecer diferencias de calidad. La ventaja principal del checkpoint es su licencia Apache 2.0 y su naturaleza de merge, mientras que sus desventajas son la falta de documentacion, la ausencia de cuantizaciones publicadas y el acceso restringido.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, sesgos y evaluaciones: no es posible estimar sesgos conocidos ni riesgos de alucinacion con base en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; sin benchmarks ni evaluaciones publicadas, el riesgo no puede cuantificarse.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- Longitud de contexto: no documentada; planificar el despliegue sin asumir una ventana concreta.
- Ambiguedad de pipeline: el repositorio declara `text-classification` pero incluye el tag `image-text-to-text`; conviene verificar el uso previsto antes de integrarlo.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de otros checkpoints conviene revisar las licencias de los modelos base (`danyloooah/reax-g2-soup2`, `draven123/sn92-gen-r2-k6`), que no se detallan en la informacion disponible.
- Acceso gated: requiere aceptar condiciones en Hugging Face; esto puede afectar a la automatizacion de descargas en CI/CD.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que obliga a generarlas internamente para despliegues en hardware consumer.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar reportes de la comunidad sobre su comportamiento real.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-ta2
- Modelo base 1: https://huggingface.co/danyloooah/reax-g2-soup2
- Modelo base 2: https://huggingface.co/draven123/sn92-gen-r2-k6
