# manpreet28111995/eca-ldnet

## Resumen

ECA-LDNet es una red neuronal convolucional para el deshazeo (eliminacion de niebla) de imagen unica, publicada por el usuario manpreet28111995 en HuggingFace bajo el identificador `manpreet28111995/eca-ldnet`. Se trata de una U-Net con convoluciones depthwise-separable, bloques de Efficient Channel Attention (ECA), bloques de atencion por pixel y una rama de correccion de bajo peso inspirada en el modelo de dispersion atmosferica (ASM). El modelo declarado tiene 1.481.871 parametros y un coste de 2,171 GMAC / 4,343 GFLOPs para entradas de 256 x 256.

El repositorio no es una simple publicacion de pesos: es un paquete de artefactos de entrenamiento y evaluacion que incluye checkpoints, historiales de entrenamiento por etapas, resultados de ablaciones (`eca_only`, `no_attention`, `no_eca`, `no_physics`), barridos de parametros de inferencia, comparativas con lineas base y perfiles de coste de inferencia. La model card es explicitamente conservadora sobre el alcance de los resultados: los autores indican que las predicciones de luz atmosferica y transmision no estan calibradas fisicamente y que los experimentos no establecen un nuevo operador de atencion ni un rendimiento estado del arte.

Es relevante ahora porque documenta de forma inusualmente transparente la caracterizacion de un modelo pequeno de vision (menos de 1,5 M de parametros) orientado a despliegue en recursos limitados, con todos los registros por imagen, manifiestos de ejecucion y codigo de evaluacion incluidos. El repositorio ocupa 5,8 GB, esta etiquetado con la libreria Keras y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con convoluciones depthwise-separable, bloques ECA (Efficient Channel Attention), bloques de atencion por pixel y rama de correccion inspirada en dispersion atmosferica (ASM) |
| Parametros totales | 1.481.871 |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de vision); las evaluaciones se realizan a 256 x 256 y 512 x 512 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagen, no de texto) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de Keras (libreria declarada: `keras`); no se especifica safetensors ni GGUF |
| Coste computacional | 2,171 GMAC / 4,343 GFLOPs a 256 x 256 |
| Datasets de evaluacion | O-HAZE (45 pares), I-HAZE, NH-HAZE, particion agrupada de validacion de 2.066 pares |
| Tamano del repositorio | 5,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ECA-LDNet es una red encoder-decoder tipo U-Net en la que las convoluciones estandar se sustituyen por convoluciones separables en profundidad, lo que explica su reducido numero de parametros (1,48 M) para una tarea de restauracion de imagen. Sobre esa columna vertebral se anaden dos mecanismos de atencion: bloques ECA, que recalibran canales con un coste muy bajo, y bloques de atencion por pixel. Ademas, incorpora una rama de correccion de bajo peso inspirada en el modelo de dispersion atmosferica que produce predicciones del tipo luz atmosferica y del tipo transmision. La model card advierte de forma explicita que estas predicciones no son estimaciones calibradas fisicamente.

El entrenamiento se organizo en cuatro etapas, con historiales y manifiestos guardados para las semillas 17, 43 y 73, y se realizaron ablaciones sobre las variantes `eca_only`, `no_attention`, `no_eca` y `no_physics` con las mismas tres semillas (en la carpeta de ablaciones solo se incluyen historiales y `run_config.json`, no los pesos). No se detalla en la informacion disponible el numero total de tokens ni la composicion completa del dataset de entrenamiento, ni si se emplearon tecnicas de RLHF o DPO, algo por otra parte poco habitual en restauracion de imagen. Si se describen los procedimientos de seleccion de hiperparametros en inferencia: un parametro `blend` que mezcla la imagen con niebla observada en la rama de correccion ASM y un parametro `epsilon` asociado.

## Capacidades

- Deshazeo de imagen unica: toma una imagen con niebla y devuelve una version restaurada, tanto a 256 x 256 como a 512 x 512 segun los registros de evaluacion incluidos.
- Prediccion de mapas auxiliares del tipo luz atmosferica y del tipo transmision, sin calibracion fisica, segun advierte la propia model card.
- Recombiancion en tiempo de inferencia de las salidas de un checkpoint fijo mediante los parametros `blend` y `epsilon`, lo que permite ajustar el resultado sin reentrenar.
- Evaluacion reproducible: incluye registros por imagen (`paired_per_image.csv`), resumentes (`paired_summary.csv`) y manifiestos de ejecucion (`paired_run_manifest.json`).
- Comparacion con lineas base: se incluyen analisis frente a una linea base DCP identidad, frente a EDFormer congelado y un ensemble uniforme de tres semillas.
- Perfil de coste de inferencia: existe un subdirectorio especifico (`ohaze_inference_cost_profile/`) con tiempos brutos y resumenes.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo pensamiento, vision general, audio): no aplica mas alla del procesamiento de imagen descrito.

## Casos de uso

- Preprocesado en pipelines de vision por computador: eliminar niebla antes de tareas de deteccion, segmentacion o seguimiento permite mejorar la entrada de modelos posteriores sin reentrenarlos, y el coste de 4,343 GFLOPs a 256 x 256 hace viable insertarlo como etapa previa en tiempo casi real.
- Restauracion fotografica en dispositivos con recursos limitados: con 1,48 M de parametros, el modelo esta pensado para entornos de portatil o cuadernos tipo Kaggle, tal como reflejan las guias de ejecucion incluidas en `code/full_training_source/`.
- Vigilancia y videovigilancia en exterior: las camaras fijas sometidas a niebla o calima pueden beneficiarse del deshazeo por fotograma; los registros de coste de inferencia del repositorio permiten estimar el presupuesto temporal por imagen.
- Imagenia aerea y de drones: la niebla degrada de forma notable las capturas de altura, y la ventana de trabajo a 512 x 512 encaja con teselas de imagenes aereas de alta resolucion.
- Fotografia computacional en movil: dado su tamano reducido, es candidato a despliegue embebido o en GPU integrada dentro de aplicaciones de galeria que automaticamente detecten y corrijan escenas con niebla.
- Investigacion en restauracion de imagen: el repositorio sirve como banco de pruebas reproducible con ablaciones (`eca_only`, `no_attention`, `no_eca`, `no_physics`) y comparativas frente a lineas base como DCP y EDFormer.
- Analisis de sensibilidad de hiperparametros en produccion: los barridos de `blend` y `epsilon` documentan como varia PSNR y SSIM al recombianr salidas de un checkpoint fijo, util para decidir si merece la pena ajustar en inferencia o reentrenar.
- Docencia y reproduccion de experimentos: el paquete `reviewer_test_package/` permite ejecutar una evaluacion independiente y verificar las cifras publicadas.

## Benchmarks y rendimiento

La informacion disponible no incluye valores absolutos de PSNR o SSIM por modelo y dataset, pero si los resultados relativos de los barridos de inferencia:

| Analisis | Configuracion | Resultado reportado |
|---|---|---|
| Particion de validacion agrupada (2.066 pares) | blend 0.08, epsilon 0.1 | Mayor PSNR medio de los probados |
| Particion de validacion agrupada (2.066 pares) | blend 0.08, epsilon 0.2 | Mayor SSIM medio de los probados |
| Seleccion en cinco pliegues sobre O-HAZE (45 pares) | blend 0.20, epsilon 0.01 | Seleccionado en todos los pliegues |
| Cambio fuera de pliegue frente a 0.08 / 0.1 | blend 0.20, epsilon 0.01 | +0,686 dB PSNR y +0,0171 SSIM |

Los propios autores advierten de que estas cifras son recombianciones en tiempo de inferencia de las salidas de un checkpoint fijo, que el barrido de validacion reutilizo la particion de seleccion del checkpoint, que O-HAZE ya se habia evaluado previamente y que algunas selecciones anidadas alcanzaron los limites de la rejilla probada. No deben interpretarse como un optimo transferible. No se han publicado resultados absolutos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia aritmetica, los pesos en fp32 ocupan aproximadamente 5,9 MB (1.481.871 parametros x 4 bytes); las activaciones de una U-Net a 256 x 256 o 512 x 512 dominan el consumo, pero el modelo cabe holgadamente por debajo de 1 GB en fp32, cifra orientativa no confirmada por el autor.
- GPU recomendadas: no disponible. Dado el coste de 4,343 GFLOPs por imagen a 256 x 256, es esperable que cualquier GPU de consumo moderno (por ejemplo, gama RTX 30/40) lo ejecute con margen amplio, pero no hay mediciones publicadas que lo confirmen.
- Cabe en GPU de consumo: si, con alta probabilidad, por el orden de magnitud de parametros y FLOPs; no hay confirmacion explicita del autor.
- Cabe en CPU: plausible, aunque no confirmado; el repositorio incluye guias para portatil y para Kaggle, lo que sugiere ejecucion en entornos sin GPU dedicada.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo). El despliegue previsto es mediante Keras y el codigo incluido en `code/full_training_source/` y `code/ablation_revision_source/`.
- Latencia y throughput: existe un perfil de coste de inferencia en `Results/Interference/ohaze_inference_cost_profile/` con tiempos brutos y resumenes, pero los valores numericos no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible menciona explicitamente tres condiciones de comparacion usadas por los autores, pero no aporta sus especificaciones ni sus cifras absolutas.

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| ECA-LDNet | 1.481.871 | 256 x 256 y 512 x 512 | no disponible | Repositorio en HuggingFace (`manpreet28111995/eca-ldnet`) |
| EDFormer (congelado, usado como comparacion) | no disponible | no disponible | no disponible | Referenciado en los resultados del repositorio |
| Linea base DCP identidad | no aplica (metodo clasico) | no disponible | no disponible | Evaluado dentro del repositorio |
| Ensemble uniforme de tres semillas de ECA-LDNet | no disponible | no disponible | no disponible | Resultados incluidos en el repositorio |

No se dispone de datos de parametros, contexto, rendimiento o licencia de alternativas externas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con modelos como DehazeFormer, GridDehazeNet o similares.

## Limitaciones y advertencias

- Alcance declarado por los propios autores: los experimentos no establecen un nuevo operador de atencion, ni rendimiento estado del arte, ni preparacion para despliegue en produccion, ni una contribucion causal de cada componente de la red.
- Las predicciones de luz atmosferica y transmision no estan calibradas fisicamente; no deben usarse como magnitudes fisicas.
- Los resultados de los barridos de `blend` y `epsilon` son analisis de sensibilidad sobre checkpoints fijos, con reutilizacion de la particion de seleccion y selecciones que alcanzaron los bordes de la rejilla; no constituyen un optimo transferible.
- El conjunto O-HAZE empleado en la validacion cruzada tiene solo 45 pares, lo que limita la significacion estadistica de las conclusiones.
- Sesgos conocidos: no disponibles. No hay analisis demografico ni de dominio mas alla de las advertencias sobre dominio sintetico frente a real.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de artefactos o restauraciones incorrectas en escenas fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: el modelo no procesa texto ni tiene ventana de contexto; su limitacion practica es la resolucion de entrada soportada (256 x 256 y 512 x 512 en los registros incluidos).
- Licencia: no disponible, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- El repositorio no incluye las imagenes de los benchmarks de origen, solo los registros de evaluacion, de modo que la reproduccion completa exige obtener los datasets por separado.
- Las ablaciones publicadas no incluyen pesos ni manifiestos de particiones, solo historiales y configuraciones, lo que dificulta reproducir esas variantes.
- Descargas y likes a cero en el momento de la consulta: no hay validacion por parte de la comunidad ni issues publicos conocidos.

## Enlaces

- HuggingFace: https://huggingface.co/manpreet28111995/eca-ldnet
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan ninguna relacion con el modelo.
