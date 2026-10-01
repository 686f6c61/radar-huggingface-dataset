# scitomo/topaz-v0.2.4-unet-l2-2d

## Resumen

Topaz v0.2.4 UDenoiseNet L2 2D es un paquete de pesos preentrenados para el denoising de imagenes de proyeccion en tomografia crioelectronica (cryo-ET). No es un modelo de lenguaje: se trata de una red neuronal convolucional de tipo U-Net que opera sobre planos de proyeccion bidimensionales y que se distribuye convertida, sin reentrenamiento, al formato nativo de Scitomo (FORMAT 2). Los pesos originales proceden del proyecto Topaz, desarrollado por Tristan Bepler y colaboradores, y la conversion la firma el usuario scitomo.

El problema que resuelve es el ruido extremo que caracteriza a los datos de cryo-ET adquiridos con dosis electronica baja. El modelo actua como denoiser de plano de proyeccion y, segun la propia model card, proporciona una guia derivada dentro de flujos de trabajo SC-Net; no es un checkpoint de SC-Net ni sustituye a uno. La relevancia actual radica en que empaqueta pesos de referencia del ecosistema Topaz en un contenedor reproducible, con paridad numerica verificada frente a la fuente original para los casos declarados.

La topologia declarada es nf=48, base_width=11 y top_width=5, con 34 tensores de origen renombrados sin alterar sus valores. El fichero original de pesos ocupa 4.429.141 bytes. La revision de origen esta fijada al commit c6dde54398875dcc6a210f83de019c9165fb474c del repositorio de Topaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (UDenoiseNet), 2D, con nf=48, base_width=11, top_width=5 |
| Parametros totales | no disponible (el fichero de pesos original ocupa 4.429.141 bytes y contiene 34 tensores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | GPL-3.0 |
| Formato de pesos | Formato nativo de Scitomo (FORMAT 2) con safetensors; requiere Scitomo >=0.7.4 |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-01 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es una red U-Net convolucional completa para denoising bidimensional, denominada UDenoiseNet, con funcion de perdida L2 y los hiperparametros nf=48, base_width=11 y top_width=5. La topologia completa se describe en un fichero `construction.json` incluido en el paquete. El modelo no se ha reentrenado durante la conversion: los 34 tensores de origen se han renombrado preservando sus valores, de modo que el comportamiento numerico se mantiene ligado al checkpoint original de Topaz.

En inferencia, cada plano V/U utiliza su propia desviacion estandar muestral (con correction=1), sin recorte de valores atipicos, y se restaura el escalado de intensidad original. Se preservan la forma de proyeccion, las coordenadas y las dimensiones principales. Los filtros opcionales y la inferencia por mosaicos propia de determinados fabricantes quedan excluidos del paquete. La validacion reportada indica que el forward en CPU con float32 y float64, asi como los gradientes respecto a entradas y parametros, coinciden exactamente con la fuente fijada en los casos declarados, y que la inferencia sobre proyecciones pasa las tolerancias registradas. El paquete se consume a traves de `TopazProjectionDenoising`.

Los datos de entrenamiento originales (numero de tomogramas, composicion del conjunto y estrategia de aumento) no se detallan en la informacion disponible. La publicacion asociada es el articulo en Nature Communications con DOI 10.1038/s41467-020-18952-1.

## Capacidades

- Denoising de planos de proyeccion 2D en tomografia crioelectronica.
- Normalizacion por plano mediante su propia desviacion estandar muestral (correction=1), sin recorte de valores atipicos.
- Preservacion de la forma de proyeccion, las coordenadas y las dimensiones principales de la entrada.
- Restauracion del escalado de intensidad original tras el proceso de denoising.
- Comportamiento fail-closed ante planos constantes o no finitos.
- Soporte de forward y gradientes en CPU con precision float32 y float64.
- Integracion como guia derivada en flujos de trabajo SC-Net mediante `TopazProjectionDenoising`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente ni soporte multilingue: no es un modelo de lenguaje ni un modelo multimodal de proposito general.

## Casos de uso

- Preprocesado de tomogramas de cryo-ET: aplicar el denoiser a cada plano de proyeccion antes de la reconstruccion 3D, de modo que se reduzca el ruido de baja dosis sin alterar la geometria de la proyeccion.
- Guia derivada en flujos SC-Net: emplear la salida del denoiser como senal auxiliar dentro de `TopazProjectionDenoising` para estabilizar etapas posteriores de analisis.
- Procesamiento por lotes de series de inclinacion: al preservar forma y coordenadas y no depender de filtros opcionales ni de mosaicos de fabricante, el modelo puede aplicarse de forma homogenea a conjuntos grandes de proyecciones.
- Control de calidad de adquisiciones: comparar planos denoizados con los originales para detectar proyecciones con relacion senal-ruido anomala, teniendo en cuenta que el modelo falla de forma cerrada ante planos constantes o no finitos.
- Integracion en pipelines reproducibles: al fijar la revision de origen y el SHA-256 del fichero original, el paquete sirve como componente verificable en flujos con requisitos de trazabilidad.
- Reproduccion de resultados: al mantener paridad numerica con la fuente en los casos declarados, permite repetir analisis publicados sobre los pesos de Topaz sin depender del fichero `.sav` original.
- Desarrollo e investigacion en denoising de cryo-ET: sirve como referencia de partida para comparar variantes de arquitectura o de normalizacion, siempre que se evalue la calidad de dominio en cada tomograma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta verificaciones de paridad numerica (coincidencia exacta en forward y gradientes en CPU float32/float64 para los casos declarados, y paso de las tolerancias registradas en inferencia de proyecciones). Estos datos no constituyen una evaluacion de eficacia de denoising.

## Requisitos de hardware

- El fichero de pesos original ocupa 4.429.141 bytes, por lo que el modelo es muy pequeno en terminos de memoria y cabe sin dificultad en cualquier GPU de consumo e incluso en CPU.
- La model card declara soporte verificado de forward e inferencia en CPU con float32 y float64.
- No se ha validado una ruta CUDA de confianza: la propia ficha indica que el paquete "no tiene bendicion CUDA ni humana".
- GPU recomendadas: no disponible.
- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del fichero sugiere un consumo minimo, pero no se ofrece una cifra oficial.
- Opciones de despliegue: carga del estado nativo con Scitomo >=0.7.4 y safetensors, consumido por `TopazProjectionDenoising`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scitomo/topaz-v0.2.4-unet-l2-2d | no disponible (34 tensores, fichero de 4.429.141 bytes) | no aplica | Paridad numerica con la fuente en los casos declarados; sin evaluacion de eficacia publicada | GPL-3.0 | HuggingFace, formato nativo de Scitomo |
| Topaz U-Net denoise `unet_L2_v0.2.2` (fuente original) | no disponible | no aplica | Referencia de la que deriva la conversion | GPL-3.0 | Repositorio de Topaz, commit c6dde54398875dcc6a210f83de019c9165fb474c |
| Otros denoisers de cryo-ET | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otras alternativas de denoising para cryo-ET en la informacion proporcionada.

## Limitaciones y advertencias

- La paridad numerica no implica eficacia de denoising: la calidad de dominio sobre un tomograma concreto requiere evaluacion especifica.
- El paquete no cuenta con validacion CUDA de confianza ni con revision humana; la evidencia disponible se limita a los recursos incluidos en `resources/`.
- No es un checkpoint de SC-Net. Solo proporciona guia derivada dentro de flujos SC-Net.
- Los planos constantes o no finitos provocan un fallo cerrado, lo que puede interrumpir pipelines si no se gestiona la excepcion.
- Se excluyen los filtros opcionales y la inferencia por mosaicos de fabricante, de modo que los resultados pueden diferir de los obtenidos con esas rutas en Topaz.
- Licencia GPL-3.0: se trata de una licencia copyleft, por lo que su integracion en productos propietarios exige revisar las obligaciones de distribucion del codigo derivado.
- No se declaran idiomas ni capacidades linguisticas porque el modelo no procesa texto.
- No se detallan los datos de entrenamiento originales, lo que dificulta evaluar sesgos o limitaciones de dominio de la fuente.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia de uso comunitario en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scitomo/topaz-v0.2.4-unet-l2-2d
- Repositorio de Topaz (revision fijada): https://github.com/tbepler/topaz/tree/c6dde54398875dcc6a210f83de019c9165fb474c
- Fichero de pesos original: https://github.com/tbepler/topaz/blob/c6dde54398875dcc6a210f83de019c9165fb474c/topaz/pretrained/denoise/unet_L2_v0.2.2.sav
- Publicacion (Nature Communications, 2020): https://doi.org/10.1038/s41467-020-18952-1
