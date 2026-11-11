# ChengYou305/DI2FIX_HF

## Resumen

DI²FIX (Distractor-Free DIFIX) es un modelo de difusion 2D de tipo image-to-image disenado como posprocesador "plug-and-play" para representaciones de campos de radiancia, principalmente 3D Gaussian Splatting (3DGS) y NeRF. Su funcion es refinar y limpiar las imagenes generadas por estos sistemas de sintesis de vistas nuevas (novel view synthesis), eliminando distracciones y artefactos que aparecen cuando la escena original contiene elementos transitorios o no deseados. El modelo ha sido desarrollado por ChengYou305 y colaboradores, y se presenta junto al paper "DF3DV-1K: A Large-Scale Dataset and Benchmark for Distractor-Free Novel View Synthesis" (ECCV 2026).

El modelo se apoya en un modelo de difusion preentrenado afinado sobre el dataset DF3DV-1K, un conjunto a gran escala orientado especificamente a la sintesis de vistas sin distracciones. Segun la model card, DI²FIX consigue mejoras medias de 0,96 dB en PSNR y 0,057 en LPIPS sobre el benchmark DF3DV-41 y el dataset On-the-go, lo que lo situa como una capa de mejora ligera que se puede aplicar sobre pipelines de renderizado 3D existentes sin reentrenar el campo de radiancia.

Es relevante porque aborda un problema practico en reconstruccion 3D a partir de capturas del mundo real: la presencia de personas, vehiculos u objetos moviles que contaminan el entrenamiento y el renderizado. En lugar de modificar el pipeline de 3DGS, DI²FIX actua en la etapa 2D final, lo que reduce el coste de integracion. El repositorio ocupa 10,4 GB y esta publicado en Hugging Face bajo el pipeline image-to-image, aunque la informacion disponible sobre licencia, idiomas y arquitectura concreta es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (diffusion-based 2D enhancer), fine-tuned; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo image-to-image, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 10,4 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

DI²FIX es un modelo de difusion de imagen a imagen concebido como refinador 2D. La model card indica que se trata de un "diffusion-based 2D enhancer fine-tuned on the DF3DV-1K dataset", es decir, un modelo de difusion preentrenado que ha sido afinado sobre el conjunto DF3DV-1K para la tarea especifica de eliminar distracciones y artefactos en renderizados de campos de radiancia. No se detalla en la informacion disponible la arquitectura interna (tipo de UNet, variante de scheduler, dimension del latent space) ni el numero de parametros.

El entrenamiento se apoya en el dataset DF3DV-1K, presentado en el paper asociado (ECCV 2026), que constituye un benchmark a gran escala para sintesis de vistas nuevas sin distracciones. El modelo se evalua sobre el split DF3DV-41 y el dataset On-the-go, con mejoras medias reportadas de 0,96 dB PSNR y 0,057 LPIPS. No se dispone de informacion sobre el numero de tokens de entrenamiento (no aplica en sentido estricto), la composicion exacta del dataset, ni sobre el uso de RLHF o DPO, que no son tecnicas habituales en modelos de difusion de imagen.

## Capacidades

- Refinado de renderizados de campos de radiancia (3D Gaussian Splatting, NeRF) en formato image-to-image.
- Eliminacion de distracciones (personas, objetos transitorios) y artefactos en imagenes sintetizadas de vistas nuevas.
- Mejora de metricas de calidad de imagen: incremento medio de 0,96 dB PSNR y 0,057 LPIPS.
- Funcionamiento plug-and-play: se aplica sobre la salida de un pipeline de novel view synthesis sin reentrenar el campo de radiancia.
- Procesamiento de imagenes individuales o por lotes mediante pipeline image-to-image.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto, audio o video.

## Casos de uso

- Limpieza de reconstrucciones 3DGS en capturas urbanas: tras entrenar un campo de Gaussian Splatting sobre videos de calle, DI²FIX elimina peatones y vehiculos moviles de las vistas renderizadas, mejorando la calidad visual sin reentrenar el modelo 3D.
- Postproduccion de escaneos de interiores para inmobiliaria: se aplica sobre los renderizados de un NeRF de una vivienda para borrar objetos personales o desorden, generando imagenes mas limpias para anuncios.
- Mejora de datasets de novel view synthesis: se usa como etapa de refinado en la generacion de pares de imagenes para entrenar otros modelos, reduciendo el ruido por distractores en los datos sinteticos.
- Restauracion de renderizados en patrimonio cultural: en digitalizaciones de edificios o esculturas, DI²FIX corrige artefactos de reconstruccion y elimina elementos transitorios (turistas, senalizacion temporal) de las vistas finales.
- Pipeline de realidad aumentada y virtual: se integra como ultimo paso antes de mostrar vistas sintetizadas al usuario, reduciendo la presencia de objetos fantasma o artefactos de interpolacion.
- Evaluacion comparativa de metodos de 3DGS: se utiliza como refinador comun sobre distintos metodos de reconstruccion para medir la mejora marginal de calidad (PSNR/LPIPS) y aislar el efecto de los distractores.
- Generacion de contenido para videojuegos y simulacion: se aplica a vistas sintetizadas de entornos capturados para obtener texturas y renderizados limpios reutilizables en motores graficos.

## Benchmarks y rendimiento

La model card reporta mejoras medias agregadas, no resultados por benchmark individual:

| Metrica | Mejora media reportada |
|---|---|
| PSNR | +0,96 dB |
| LPIPS | +0,057 |

Los benchmarks de evaluacion son el split DF3DV-41 (del dataset DF3DV-1K) y el dataset On-the-go. No se han publicado en la informacion disponible resultados desglosados por escena ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo de difusion de imagen, el consumo dependera del tamano del modelo y de la resolucion de entrada, pero no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponibles. Por el tipo de tarea (difusion de imagen) se requeriria al menos una GPU consumer moderna, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: el modelo se ofrece como pipeline image-to-image en Hugging Face; se dispone de una demo en Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de imagen de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DI²FIX | Difusion image-to-image para refinado de NVS | no disponible | no aplica | no disponible | Hugging Face, demo en Spaces |
| Alternativas de restauracion de imagen genericas (p. ej. modelos de difusion image-to-image) | Difusion image-to-image | variable | no aplica | variable | amplia |
| Metodos de distractor-free NVS integrados en el campo de radiancia | 3DGS/NeRF con supresion de distractores | variable | no aplica | variable | repositorios de investigacion |

No se dispone en la informacion proporcionada de comparaciones numericas directas con modelos alternativos concretos, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; es un riesgo relevante para produccion.
- La model card solo reporta mejoras medias agregadas; no hay resultados por escena ni analisis de fallos, por lo que el comportamiento en casos extremos es desconocido.
- Al ser un modelo de difusion, existe riesgo de introducir alucinaciones visuales o detalles inexistentes en las zonas refinadas, especialmente en regiones con oclusiones o texturas ambiguas.
- El refinado es 2D y no garantiza consistencia multi-vista entre imagenes renderizadas de la misma escena; puede introducir incoherencias temporales o entre vistas.
- El modelo esta afinado sobre DF3DV-1K; su generalizacion a dominios muy distintos (medico, aereo, microscopia) no esta documentada.
- No se detallan sesgos conocidos, pero al operar sobre imagenes del mundo real puede heredar sesgos de los datos de entrenamiento del modelo de difusion base.
- El repositorio es de 10,4 GB y no se especifica el formato de pesos, lo que complica la planificacion de despliegue y el almacenamiento.
- No hay informacion sobre requisitos de hardware ni latencia, lo que dificulta estimar costes de inferencia en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ChengYou305/DI2FIX_HF
- Paper: https://huggingface.co/papers/2604.13416
- Project page: https://johnnylu305.github.io/df3dv1k_web/
- GitHub: https://github.com/johnnylu305/DF3DV
- Demo: https://chengyou305-di2fix-demo.hf.space/
