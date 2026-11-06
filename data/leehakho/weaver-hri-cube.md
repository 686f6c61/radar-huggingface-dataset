# LeeHakHo/weaver-hri-cube

## Resumen

WEAVER HRI cube es un conjunto de artefactos de investigación publicados en Hugging Face por el usuario LeeHakHo, no un modelo generativo convencional. Se trata de la copia de seguridad de los archivos que produce el pipeline `tools/run_cube_pipeline.sh` del repositorio github.com/LeeHakHo/WEAVER-HRI (rama `hri-finetune`), orientado al entrenamiento de un world model en dos etapas sobre interacciones mano-objeto en robótica. El paquete incluye checkpoints, datasets intermedios y modelos auxiliares (un modelo de dinámica inversa y un decodificador esquelético).

El contenido se organiza en dos etapas: una primera etapa de predicción de estados (WEAVER entrenado solo con estados, checkpoint 40000) y una segunda etapa de renderizado (checkpoint 20000). Los checkpoints almacenados contienen únicamente los parámetros entrenables; el resto de pesos congelados se recuperan desde el modelo base `arnavkj1995/WEAVER` mediante la función `weaver.finetune_utils.load_finetuned`.

El repositorio ocupa 2,5 GB y no incluye model card con especificaciones de arquitectura, licencia, idiomas ni benchmarks. Su relevancia es acotada: sirve como material reproducible para quien quiera replicar o inspeccionar el pipeline de fine-tuning del proyecto WEAVER-HRI, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `arnavkj1995/WEAVER`; el paquete contiene checkpoints de parámetros entrenables de un world model en dos etapas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints de parámetros entrenables; el repo no detalla el formato de serialización) |

## Arquitectura y entrenamiento

El paquete documenta un pipeline de world model en dos etapas. La etapa 1 (`runs/weaver_cube_s1p`) es un modelo WEAVER entrenado solo con estados, con checkpoint 40000 seleccionado a posteriori sobre validación. La etapa 2 (`runs/weaver_cube_s1p_s2`) es el renderizador WEAVER, con checkpoint 20000. Ambos se obtienen por fine-tuning sobre el modelo base `arnavkj1995/WEAVER`, y los checkpoints publicados contienen únicamente los parámetros entrenables, recuperándose el resto desde el modelo original.

El dataset final (`data/weaver_hri_cube_v3p`) contiene estado planar de 16 dimensiones, acción de 14 dimensiones, latentes SD3, estadísticas de normalización, layout y ficheros de control. Los datos auxiliares incluyen puntos de mano obtenidos con WiLoR y profundidad (`data/hand_tracks`), comandos de mano etiquetados por un modelo de dinámica inversa (`data/hand_actions`) y posiciones de cubo extraídas con SAM3 (`data/object_tracks`). El modelo de dinámica inversa empleado para etiquetar las acciones es `runs/idm/idm_skel`, y el decodificador esquelético pequeño es `runs/decoder/dec_s1p_40000`. No se detallan número de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Predicción de estados futuros en un world model de interacción mano-objeto (etapa 1, estados-only).
- Renderizado condicionado a partir de latentes SD3 (etapa 2).
- Etiquetado de acciones de mano mediante un modelo de dinámica inversa entrenado específicamente (`idm_skel`).
- Extracción de posiciones de objetos a partir de pistas SAM3.
- Decodificación esquelética de poses a partir de estados predichos.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling ni agentes.

## Casos de uso

- Reproducción del pipeline de fine-tuning: restaurar los directorios `data/` y `runs/` en la raíz del repo WEAVER-HRI (rama `hri-finetune`) y ejecutar `tools/run_cube_pipeline.sh` para regenerar los artefactos.
- Investigación en world models para manipulación robótica: usar el checkpoint de etapa 1 para estudiar la dinámica de estados planares de 16 dimensiones en tareas de interacción mano-cubo.
- Estudio de renderizado condicionado: emplear el renderizador de etapa 2 con latentes SD3 para analizar la fidelidad de la síntesis visual a partir de estados predichos.
- Etiquetado automático de acciones de mano: reutilizar `runs/idm/idm_skel` para anotar secuencias de mano a partir de trayectorias observadas.
- Extracción de trayectorias de objetos: usar los datos de `object_tracks` (SAM3) como referencia para evaluar detectores o segmentadores propios.
- Baseline para comparación de decodificadores esqueléticos: tomar `dec_s1p_40000` como referencia ligera al evaluar arquitecturas alternativas de decodificación de pose.
- Docencia o experimentación con fine-tuning parcial: el esquema de checkpoints de solo parámetros entrenables sirve como ejemplo de bajo coste de almacenamiento para fine-tuning sobre modelos congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo base `arnavkj1995/WEAVER` y del tamaño de los checkpoints, no documentado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el paquete está pensado para ejecutarse dentro del repositorio WEAVER-HRI mediante `tools/run_cube_pipeline.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El paquete no es un modelo autónomo comparable, sino un conjunto de artefactos de fine-tuning dependiente del modelo base `arnavkj1995/WEAVER`; no se identifican en la información proporcionada alternativas equivalentes con las que contrastarlo.

## Limitaciones y advertencias

- No es un modelo listo para usar: requiere clonar el repositorio WEAVER-HRI (rama `hri-finetune`) y restaurar los directorios en las rutas correctas.
- Los checkpoints contienen solo parámetros entrenables; sin el modelo base `arnavkj1995/WEAVER` no pueden cargarse.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; conviene consultar la licencia del modelo base y del repositorio.
- No hay información sobre sesgos, alucinación o cobertura idiomática; al no ser un modelo de lenguaje, estas categorías no aplican directamente, pero tampoco se documenta el dominio de generalización del world model.
- El checkpoint de etapa 1 fue seleccionado a posteriori sobre validación (checkpoint 40000), lo que puede introducir sesgo de selección en las métricas reportadas por el autor.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.
- El contenido del paquete depende de herramientas externas (WiLoR, SAM3, SD3) cuyas versiones y condiciones de uso no se detallan.

## Enlaces

- Hugging Face: https://huggingface.co/LeeHakHo/weaver-hri-cube
- Repositorio del proyecto: https://github.com/LeeHakHo/WEAVER-HRI (rama `hri-finetune`)
- Modelo base: https://huggingface.co/arnavkj1995/WEAVER
- No se han encontrado en la información proporcionada papers, blogs, demos ni otros enlaces adicionales.
