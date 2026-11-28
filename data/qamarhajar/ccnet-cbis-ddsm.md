# QamarHajar/ccnet-cbis-ddsm

## Resumen

ccnet-cbis-ddsm es un modelo de difusion latente para generacion incondicional de imagenes de mamografia, publicado por QamarHajar en Hugging Face. Se trata de un fine-tuning de Stable Diffusion 2.1 Base (Manojb/stable-diffusion-2-1-base) orientado a la sintesis de imagenes mamograficas a partir del dataset CBIS-DDSM, un corpus publico de mamografias anotadas para investigacion en cancer de mama.

El modelo aborda un problema recurrente en imagen medica: la escasez y las restricciones de privacidad de los datasets clinicos. Generar muestras sinteticas realistas permite aumentar datos de entrenamiento, hacer aumentacion de datos en pipelines de deteccion de lesiones o construir conjuntos de prueba sin exponer informacion de pacientes. La ficha del repositorio incluye las etiquetas differential-privacy y synthetic-data, lo que sugiere que el objetivo declarado es la generacion de datos sinteticos con garantias de privacidad.

Por su naturaleza, no es un modelo de lenguaje: no procesa ni genera texto, no soporta tool calling ni razonamiento multi-paso. Es un modelo de difusion de imagen (pipeline unconditional-image-generation) con pesos en formato PyTorch, un tamano de repositorio de 3,5 GB y acceso restringido que requiere aceptar condiciones en Hugging Face. No se dispone de informacion publica sobre volumen de entrenamiento, hiperparametros ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (latent diffusion), fine-tuning de Stable Diffusion 2.1 Base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | openrail++ |
| Formato de pesos | PyTorch (repositorio de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Stable Diffusion 2.1 Base, un difusion latente que opera en el espacio comprimido de un autoencoder variacional (VAE) y aplica el proceso de denoising con un UNet condicionado por cross-attention. En este caso, el pipeline declarado es unconditional-image-generation, lo que implica que la generacion no se condiciona a prompts de texto, sino que el modelo muestrea imagenes mamograficas directamente desde ruido. El fine-tuning se ha realizado sobre el dataset CBIS-DDSM (Curated Breast Imaging Subset of the Digital Database for Screening Mammography).

No se dispone de informacion publica sobre el numero de pasos de entrenamiento, el tamano efectivo del dataset, la resolucion de entrenamiento, la composicion de las muestras (vistas CC/MLO, lesiones benignas/malignas) ni sobre tecnicas de entrenamiento diferencialmente privado mas alla de la etiqueta differential-privacy del repositorio. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Generacion incondicional de imagenes de mamografia sinteticas a partir de ruido, sin prompt de texto.
- Aumentacion de datos para entrenamiento de clasificadores o detectores de lesiones mamarias.
- Generacion de muestras sinteticas para pruebas de pipelines de imagen medica sin usar datos de pacientes reales.
- Fine-tuning sobre un dominio medico concreto (mamografia CBIS-DDSM) a partir de un modelo base generalista.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras modalidades.

## Casos de uso

- Aumentacion de datasets de mamografia: generar imagenes sinteticas adicionales para equilibrar clases en el entrenamiento de clasificadores benigno/maligno, reduciendo el sesgo hacia la clase mayoritaria en corpus clinicos pequenos.
- Privacidad y cumplimiento: sustituir imagenes reales de pacientes por muestras sinteticas en entornos de desarrollo y pruebas, de modo que los ingenieros puedan iterar sobre pipelines sin manejar datos personales.
- Pruebas de robustez de sistemas CAD: alimentar un sistema de deteccion asistida por ordenador con imagenes sinteticas para evaluar su comportamiento ante variaciones morfologicas no presentes en el conjunto original.
- Investigacion en generacion medica: servir como baseline para estudiar la calidad, diversidad y fidelidad de modelos de difusion aplicados a imagen mamografica.
- Docencia y formacion: disponer de ejemplos sinteticos para materiales didacticos de radiologia sin recurrir a casos clinicos reales.
- Preentrenamiento y data augmentation en investigacion academica: usar el modelo como generador de datos en estudios sobre aprendizaje autosupervisado en imagen medica, siempre que se valide la calidad de las muestras antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (3,5 GB) y la arquitectura de difusion latente subyacente, se requiere una GPU con al menos 8-12 GB de VRAM en precision reducida, aunque esta cifra es una estimacion y no un dato publicado.
- GPU recomendadas: no disponible. Por la arquitectura del modelo base, cabria esperar funcionamiento en GPUs de consumo tipo RTX 3090 o RTX 4090, pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: al ser un modelo PyTorch con pipeline de difusion, seria desplegable con la libreria diffusers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dominio | Licencia | Acceso |
|---|---|---|---|---|---|
| ccnet-cbis-ddsm | Difusion latente | SD 2.1 Base | Mamografia (CBIS-DDSM) | openrail++ | Restringido (gated) |
| Stable Diffusion 2.1 Base | Difusion latente | - | Imagen general | openrail++ | Abierto |
| Modelos de difusion medica especializados | Difusion latente | Variable | Imagen medica | Variable | Variable |

No se dispone de informacion suficiente para comparar rendimiento cuantitativo con alternativas de la misma categoria. La comparativa se limita a la relacion con su modelo base y a la categoria general de modelos de difusion aplicados a imagen medica.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts; cualquier expectativa en ese sentido es incorrecta.
- Riesgo de artefactos y muestras irreales: los modelos de difusion pueden producir imagenes con estructuras anatomicas inconsistentes, lo que invalida su uso clinico directo.
- No validado clinicamente: no hay evidencia publicada de fidelidad diagnostica de las muestras generadas.
- Sesgos del dataset: CBIS-DDSM procede de una poblacion concreta; las muestras sinteticas heredaran sus sesgos demograficos y de adquisicion.
- Privacidad no garantizada: la etiqueta differential-privacy no viene acompanada de documentacion publica sobre el mecanismo o el epsilon utilizado; no debe asumirse una garantia formal sin verificar la ficha tecnica.
- Licencia openrail++: permite uso comercial con condiciones, pero el acceso esta restringido y requiere aceptar terminos en Hugging Face; conviene revisar las restricciones de uso antes de integrarlo en produccion.
- Uso previsto: investigacion y generacion de datos sinteticos; no debe emplearse para diagnostico ni como sustituto de la lectura radiologica.
- Sin informacion sobre cuantizaciones ni formatos alternativos (GGUF, ONNX), lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QamarHajar/ccnet-cbis-ddsm
- Modelo base: https://huggingface.co/Manojb/stable-diffusion-2-1-base
- Dataset CBIS-DDSM (referencia): https://www.cancerimagingarchive.net/collection/cbis-ddsm/
- Stable Diffusion 2.1 (referencia): https://huggingface.co/stabilityai/stable-diffusion-2-1-base
