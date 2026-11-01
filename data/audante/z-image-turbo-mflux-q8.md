# Audante/Z-Image-Turbo-mflux-q8

## Resumen

Z-Image-Turbo-mflux-q8 es un repositorio de Hugging Face mantenido por el usuario Audante que contiene una copia cuantizada a 8 bits del modelo de generacion de imagenes Z-Image Turbo, desarrollado originalmente por Tongyi-MAI. La conversion al formato mflux (el port del ecosistema MLX de Apple para modelos de difusion) fue realizada por mflux-community, y este repositorio replica exactamente los ficheros de la version fuente en la revision `4ccff28917346aa9daae49cd3c477cf5260a242c`, sin ninguna modificacion. El autor deja claro que no se trata de una publicacion oficial del modelo base.

El proposito de este repositorio es facilitar el acceso al modelo en formato cuantizado para su ejecucion mediante la libreria mflux, orientada a hardware Apple Silicon (chips M1/M2/M3/M4). La cuantizacion a 8 bits reduce a la mitad el consumo de memoria respecto a los pesos de 16 bits, lo que permite ejecutar el modelo en equipos Mac con menos RAM unificada. El tamano total del repositorio es de 11,0 GB.

Su relevancia radica en la creciente popularidad de Z-Image Turbo como modelo de sintesis de imagenes por difusion y en la demanda de versiones optimizadas para ejecucion local en Mac. Al mantenerse bajo licencia Apache 2.0, puede utilizarse tanto para proyectos personales como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-imagen (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo texto-imagen) |
| Tipos de cuantizacion | 8 bits (q8) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato mflux/MLX) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo nuevo, sino una copia bit a bit de la conversion cuantizada a 8 bits realizada por mflux-community a partir de Z-Image Turbo de Tongyi-MAI. El formato mflux corresponde al port del modelo al framework MLX de Apple, que permite ejecutar modelos de difusion de forma eficiente sobre la memoria unificada de los chips Apple Silicon.

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base, el numero de parametros, el conjunto de datos de entrenamiento ni el proceso de post-entrenamiento. Tampoco se describe el metodo exacto de cuantizacion empleado en la conversion a 8 bits. El README indica unicamente que los ficheros son identicos a los del repositorio fuente y que todos los derechos sobre el modelo pertenecen a sus autores originales.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), heredada del modelo base Z-Image Turbo.
- Ejecucion optimizada en hardware Apple Silicon mediante la libreria mflux y MLX.
- Pesos cuantizados a 8 bits, que reducen el requisito de memoria aproximadamente a la mitad frente a una version de 16 bits.
- Uso comercial permitido gracias a la licencia Apache 2.0 del modelo base y de esta copia.
- Verificacion de integridad de los ficheros mediante sumas de control (`SHA256SUMS`), donde estan presentes.

## Casos de uso

- Generacion local de imagenes en Mac: usuarios de Apple Silicon pueden generar imagenes a partir de prompts de texto sin depender de servicios en la nube, ejecutando el modelo con mflux sobre la GPU integrada.
- Prototipado rapido de ilustraciones: disenadores y creadores de contenido pueden iterar sobre prompts en local con latencias razonables, gracias a la reduccion de memoria que ofrece la cuantizacion q8.
- Integracion en pipelines automatizados en macOS: al ser un modelo local y de licencia permisiva, puede integrarse en scripts de generacion masiva de imagenes (por ejemplo, variantes de producto o assets para redes sociales) mediante la API de mflux.
- Evaluacion comparativa de cuantizaciones: desarrolladores que investigan el impacto de la cuantizacion a 8 bits en la calidad de imagen pueden usar este repositorio como base reproducible, dado que publica checksums de los ficheros.
- Uso comercial de sintesis de imagenes: la licencia Apache 2.0 permite incorporar el modelo en productos y servicios sin restricciones de royalties.
- Copia de respaldo y distribucion: al tratarse de un espejo del repositorio de mflux-community, sirve como copia alternativa de descarga en caso de indisponibilidad del original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: con pesos de 8 bits y un repositorio de 11,0 GB, se estima un requisito de memoria unificada superior a 11 GB (se recomienda al menos 16 GB de RAM unificada; la cifra exacta no esta disponible).
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada, dado que mflux esta construido sobre MLX. No esta orientado a GPU NVIDIA.
- Consumer hardware: cabe en Macs de consumo con 16 GB o mas de memoria unificada, como MacBook Air/Pro o Mac mini recientes; el limite exacto por modelo de chip no esta disponible.
- Despliegue: mediante la libreria mflux (framework MLX de Apple). No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Licencia | Plataforma objetivo |
|---|---|---|---|---|
| Audante/Z-Image-Turbo-mflux-q8 | safetensors (mflux) | 8 bits | Apache 2.0 | Apple Silicon (MLX) |
| mflux-community/z-image-turbo-mflux-q8 | safetensors (mflux) | 8 bits | Apache 2.0 | Apple Silicon (MLX) |
| Tongyi-MAI/Z-Image-Turbo (base) | no disponible | sin cuantizar (segun publicacion original) | Apache 2.0 | Multiplataforma (ecosistema difusion) |

Este repositorio es funcionalmente identico al de mflux-community, del que es una copia exacta; la eleccion entre ambos carece de impacto practico. La version base de Tongyi-MAI ofrece los pesos originales sin cuantizar y mayor compatibilidad con herramientas estandar del ecosistema de difusion.

## Limitaciones y advertencias

- No es una publicacion oficial: el autor del repositorio aclara expresamente que no es un release oficial de Tongyi-MAI, y que todos los derechos del modelo pertenecen a los autores originales.
- Es una copia espejo sin modificaciones: cualquier bug presente en la conversion fuente estara tambien aqui; conviene verificar los checksums `SHA256SUMS` antes de usarlo.
- La cuantizacion a 8 bits puede introducir una ligera degradacion de calidad respecto a los pesos de 16 bits; la magnitud exacta no esta documentada.
- Formato mflux/MLX: solo es utilizable de forma directa en hardware Apple Silicon; no es compatible de forma nativa con CUDA ni con las librerias habituales de difusion en NVIDIA.
- Informacion incompleta en la model card: no se documentan parametros, requisitos exactos de memoria, ni rendimiento.
- Sesgos, riesgo de alucinacion visual y restricciones adicionales de uso: no disponibles en la informacion proporcionada; deben consultarse la documentacion y licencia del modelo base Tongyi-MAI/Z-Image-Turbo.
- Licencia Apache 2.0: permite uso comercial, pero exige cumplir los terminos de atribucion y distribucion de la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Audante/Z-Image-Turbo-mflux-q8
- Repositorio fuente (mflux-community): https://huggingface.co/mflux-community/z-image-turbo-mflux-q8
- Modelo base (Tongyi-MAI): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
