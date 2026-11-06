# Audante/Z-Image-Turbo-mflux-q4

## Resumen

Z-Image-Turbo-mflux-q4 es una redistribucion no oficial del modelo de generacion de imagenes Z-Image-Turbo de Tongyi-MAI (Alibaba), convertido al formato mflux en cuantizacion de 4 bits por el usuario Audante. El repositorio no aporta ninguna modificacion respecto al original de mflux-community: los archivos son identicos a los de la revision `f427e257d8e6ffa03edd4d9ac554a05809da456c`. Se trata, por tanto, de un espejo de pesos ya convertidos, pensado para su uso con la libreria mflux (implementacion en MLX para Apple Silicon).

El modelo subyacente, Z-Image-Turbo, es un generador texto-a-imagen de la familia Z-Image de Tongyi-MAI, disenado para inferencia rapida con pocos pasos de muestreo. La variante aqui publicada reduce la precision de los pesos a 4 bits para disminuir el espacio en disco (5,9 GB en el repositorio) y facilitar su ejecucion en hardware de consumo, en particular equipos Mac con chip Apple Silicon mediante MLX.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: no hay model card detallada del modelo base en la informacion disponible, no se publican benchmarks ni especificaciones de arquitectura, y el repositorio es una copia sin cambios. Su interes practico radica en disponer de los pesos cuantizados listos para mflux bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto-a-imagen, segun el nombre y la familia Z-Image) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un modelo de generacion de imagenes en el sentido de LLM; no se especifica la longitud maxima de prompt) |
| Tipos de cuantizacion | 4 bits (q4) en formato mflux |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mflux) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Z-Image-Turbo en los datos proporcionados. Por el nombre y la familia (Z-Image de Tongyi-MAI) cabe inferir un modelo generativo de imagenes condicionado por texto, pero no se confirma el tipo de backbone (diffusion transformer, UNet u otro), el numero de parametros, el esquema de entrenamiento ni los datos utilizados.

El unico detalle tecnico verificable es el proceso de conversion: los pesos originales de Tongyi-MAI fueron convertidos por mflux-community al formato mflux y cuantizados a 4 bits, y esta publicacion de Audante reproduce exactamente esos archivos en la revision indicada, sin cambios. No consta informacion sobre destilacion, ajuste por RLHF, decodificacion especulativa ni otras innovaciones de entrenamiento.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (texto-a-imagen), segun la naturaleza del modelo base.
- Inferencia rapida orientada a pocos pasos de muestreo, coherente con el sufijo "Turbo" del nombre; no se detalla el numero exacto de pasos.
- Ejecucion en Apple Silicon mediante la libreria mflux (MLX), al estar empaquetado en ese formato.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision de entrada, audio, modo thinking): no disponible.

## Casos de uso

- Generacion de ilustraciones para prototipos de producto: el modelo permite crear imagenes de referencia rapidamente en un Mac con Apple Silicon, sin necesidad de GPU dedicada, gracias a la cuantizacion a 4 bits.
- Creacion de assets para interfaces y mockups: util para equipos de diseno que trabajan en local y necesitan variaciones visuales iterativas sin depender de servicios en la nube.
- Experimentacion con modelos de difusion en MLX: investigadores que evaluan el rendimiento de modelos texto-a-imagen en el stack de Apple pueden usar estos pesos como punto de partida con mflux.
- Generacion de contenido para blogs y redes: produccion de imagenes de acompanamiento en flujos editoriales pequenos, con la ventaja de que los pesos caben en disco de un portatil (5,9 GB).
- Pruebas de pipelines de generacion de imagenes en CI o entornos de desarrollo: al ser una copia verificable con `SHA256SUMS`, facilita la reproducibilidad en entornos controlados.
- Educacion y divulgacion: ejemplo practico de cuantizacion de modelos generativos y de ejecucion local en hardware de consumo para cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: no disponible de forma oficial; el repositorio ocupa 5,9 GB en disco, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, mas el overhead de inferencia.
- GPU recomendadas: no disponible; el formato mflux esta orientado a Apple Silicon (MLX), no a CUDA.
- Compatibilidad con GPU de consumo: previsiblemente ejecutable en Macs con memoria unificada de 16 GB o superior, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: libreria mflux (MLX). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas no son herramientas orientadas a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / prompt | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Audante/Z-Image-Turbo-mflux-q4 | no disponible | no disponible | Apache 2.0 | safetensors (mflux, 4 bits) | Hugging Face |
| mflux-community/z-image-turbo-mflux-q4 | no disponible | no disponible | Apache 2.0 | safetensors (mflux, 4 bits) | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | no disponible | no disponible | Apache 2.0 | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones tecnicas de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Es una redistribucion no oficial: el autor indica explicitamente que no es un lanzamiento oficial y que los derechos del modelo pertenecen a sus autores originales.
- No hay model card tecnica del modelo base en la informacion disponible: se desconocen arquitectura, parametros, datos de entrenamiento y evaluaciones.
- La cuantizacion a 4 bits puede degradar la calidad de las imagenes generadas frente a los pesos originales en mayor precision; no se aportan comparativas.
- Riesgo de sesgos y de contenido inapropiado inherente a los modelos de difusion entrenados con datos web; no se documentan mitigaciones.
- No se especifican idiomas soportados ni limitaciones de longitud de prompt.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una copia no oficial conviene verificar la procedencia y los checksums (`SHA256SUMS`) antes de usarla en produccion.
- El formato mflux limita el despliegue a entornos MLX (Apple Silicon); no es directamente utilizable en ecosistemas CUDA sin conversion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Audante/Z-Image-Turbo-mflux-q4
- Repositorio fuente de la conversion: https://huggingface.co/mflux-community/z-image-turbo-mflux-q4
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
