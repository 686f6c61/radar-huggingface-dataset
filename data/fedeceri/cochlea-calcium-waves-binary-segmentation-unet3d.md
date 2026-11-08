# fedeceri/cochlea-calcium-waves-binary-segmentation-unet3d

## Resumen

Cochlea-calcium-waves-binary-segmentation-unet3d es un modelo de segmentacion semantica binaria en 3D desarrollado por el usuario fedeceri (Federico) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de una implementacion de una U-Net 3D sobre MONAI/PyTorch disenada especificamente para detectar ondas de calcio en peliculas de microscopia de dos fotones de un solo canal. El modelo toma como entrada una pelicula 3D en orden `(tiempo, alto, ancho)` y produce una mascara binaria donde 0 corresponde a fondo y 1 a onda de calcio, con la opcion de generar etiquetas de instancia temporalmente ordenadas mediante componentes conexas.

El modelo fue entrenado sobre imagenes in vivo de cocleas neonatales de raton marcadas con GCaMP, con mascaras 3D de ondas de calcio curadas manualmente a partir de una segmentacion basada en Voronoi-Otsu. El articulo de referencia es el publicado en Nature Communications (s41467-024-55519-w), lo que sitúa el modelo en un contexto de investigacion biologica real sobre senalizacion de calcio en el oido interno.

Su relevancia radica en que automatiza una tarea de segmentacion que habitualmente requiere curacion manual de volumenes 3D en series temporales de microscopia, un proceso costoso y sujeto a variabilidad entre anotadores. El repositorio es de tamano practicamente nulo (0.0 GB reportados), lo que sugiere que los pesos pueden no estar efectivamente alojados o que el reporte de tamano esta incompleto; conviene verificar la disponibilidad real de `best_model_binary_v2_cawaves.pth` antes de integrarlo en un pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MONAI 3D U-Net (definida en `config.yml`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D; entrada = pelicula `(tiempo, alto, ancho)`) |
| Tipos de cuantizacion | no disponible (pesos `.pth` en punto flotante, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pth` (`best_model_binary_v2_cawaves.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net 3D implementada con MONAI, cuya configuracion concreta (profundidad, canales por nivel, funciones de perdida, tamano de parche) reside en el fichero `config.yml` del repositorio y no se detalla en la model card. La entrada es un volumen 3D con eje temporal en primera posicion, admitido como stack TIFF o directorio OME-Zarr. La inferencia emplea ventana deslizante (sliding-window), manteniendo la pelicula completa y la salida ensamblada en CPU mientras procesa ventanas en el acelerador seleccionado, lo que permite manejar volumenes temporales mayores que la memoria de GPU disponible.

El entrenamiento se realizo sobre peliculas de fluorescencia de dos fotones de cocleas neonatales de raton marcadas con GCaMP, con mascaras 3D de ondas de calcio curadas manualmente a partir de una segmentacion Voronoi-Otsu. No se especifican en la informacion disponible el numero de volumenes de entrenamiento, el numero de epochs, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos o validacion cruzada. Tampoco se documenta el uso de RLHF/DPO (no aplicable a un modelo de segmentacion) ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Segmentacion semantica binaria 3D de ondas de calcio en peliculas de microscopia de dos fotones de un solo canal.
- Entrada flexible: stack TIFF o directorio OME-Zarr con orden `(tiempo, alto, ancho)`.
- Salida de mascara binaria (`0` fondo, `1` onda de calcio).
- Post-procesamiento opcional que convierte regiones conexas en etiquetas de instancia temporalmente ordenadas (`1..N`).
- Salida opcional del volumen de probabilidades, util para umbralizar manualmente o auditar predicciones.
- Inferencia por ventana deslizante con gestion de memoria CPU/GPU para peliculas de gran tamano.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision cientifica.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Analisis automatizado de experimentos de senalizacion de calcio en coclea: el modelo segmenta ondas de calcio en peliculas de dos fotones, sustituyendo la curacion manual de volumenes 3D y reduciendo el tiempo de analisis por experimento.
- Cuantificacion de la propagacion de ondas de calcio: combinando la mascara binaria con el volumen de probabilidades y las etiquetas de instancia, se puede medir frecuencia, amplitud y direccion de propagacion de cada onda a lo largo del tiempo.
- Cribado de farmacos o condiciones geneticas: al procesar lotes de peliculas de cocleas tratadas frente a controles, permite comparar estadisticamente la actividad de ondas de calcio entre grupos experimentales de forma reproducible.
- Reproducibilidad en publicaciones: el pipeline reproducible (config + pesos + scripts) permite a otros laboratorios reanalizar los mismos datos o aplicar el modelo a cohortes propias con criterios identicos.
- Pre-anotacion para curacion manual: las etiquetas de instancia generadas pueden servir como punto de partida que un experto revise y corrija, acelerando la generacion de nuevos datasets anotados.
- Integracion en pipelines de imagen cientifica: al usar MONAI y admitir OME-Zarr, encaja en flujos de trabajo de microscopia de alto contenido (por ejemplo, procesamiento por lotes en cluster con GPU y almacenamiento en formato OME-NGFF).
- Analisis temporal de series largas: la inferencia por ventana deslizante con la pelicula completa en CPU permite procesar adquisiciones temporales extensas que no cabrian en VRAM de una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano de ventana configurado en `config.yml` y de la resolucion de la pelicula; el modelo mantiene la pelicula completa y la salida ensamblada en CPU, por lo que la VRAM solo debe alojar las ventanas procesadas).
- GPU recomendadas: no disponible. Al ser una U-Net 3D de MONAI, en principio puede ejecutarse en GPU consumer modernas (por ejemplo, RTX 3090/4090) si el tamano de ventana es moderado, pero el autor no publica requisitos.
- Cabe en GPU consumer: probablemente si, con ventanas de tamano reducido, aunque no hay confirmacion oficial.
- Opciones de despliegue: scripts propios del repositorio (`infer_binary.py`) sobre PyTorch/MONAI; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fedeceri/cochlea-calcium-waves-binary-segmentation-unet3d | U-Net 3D (MONAI) para ondas de calcio | no disponible | Pelicula 3D `(tiempo, alto, ancho)` | apache-2.0 | Hugging Face (repo de 0.0 GB reportados) |
| fedeceri/cochlea-hair-cell-synapses-binary-segmentation-unet2d | U-Net 2D (MONAI) para sinapsis de celulas ciliadas | no disponible | Imagen 2D TIFF | no disponible en la informacion | Hugging Face |
| fedeceri/cochlea-hair-cell-binary-segmentation-unet2d | U-Net 2D (MONAI) para celulas ciliadas internas | no disponible | Imagen 2D TIFF | no disponible en la informacion | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y abordan tareas de segmentacion en la coclea, pero en 2D y sobre estructuras distintas (sinapsis y celulas ciliadas), por lo que no son sustitutos directos. No se dispone de informacion sobre alternativas de terceros especificas para segmentacion de ondas de calcio en coclea.

## Limitaciones y advertencias

- Entrenado exclusivamente con cocleas neonatales de raton marcadas con GCaMP y adquiridas con microscopia de dos fotones de un solo canal; el rendimiento en otras especies, indicadores de calcio, modalidades o canales multiples no esta validado.
- Las mascaras de referencia se generaron a partir de una segmentacion Voronoi-Otsu curada manualmente, de modo que el modelo hereda los sesgos y errores de ese proceso de anotacion.
- Riesgo de falsos positivos y negativos en regiones con bajo contraste, ruido de adquisicion o movimiento; se recomienda revisar el volumen de probabilidades antes de confiar en la mascara binaria.
- El orden de ejes de entrada es estricto `(tiempo, alto, ancho)`; un orden distinto puede producir predicciones incorrectas sin aviso.
- No se documentan sesgos demograficos ni linguisticos porque el modelo no procesa texto ni personas, pero si puede presentar sesgos hacia las condiciones de adquisicion del laboratorio de origen.
- El repositorio reporta 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente publicados; verificar la presencia de `best_model_binary_v2_cawaves.pth` antes de asumir que el modelo es usable.
- Licencia Apache 2.0 permite uso comercial, pero el modelo esta pensado para investigacion; no hay garantias de idoneidad clinica ni regulatoria.
- No se especifican requisitos de version de MONAI, PyTorch ni CUDA, lo que puede complicar la reproducibilidad a medio plazo.

## Enlaces

- Hugging Face: https://huggingface.co/fedeceri/cochlea-calcium-waves-binary-segmentation-unet3d
- Repositorio de codigo (GitHub): https://github.com/fedeceri85/cochlea-calcium-waves-binary-segmentation-unet3d
- Articulo de referencia (Nature Communications): https://www.nature.com/articles/s41467-024-55519-w
- Perfil del autor en Hugging Face: https://huggingface.co/fedeceri
- Modelo relacionado (sinapsis de celulas ciliadas, 2D): https://huggingface.co/fedeceri/cochlea-hair-cell-synapses-binary-segmentation-unet2d
