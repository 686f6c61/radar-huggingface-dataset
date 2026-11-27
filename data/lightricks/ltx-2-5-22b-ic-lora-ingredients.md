# Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients

## Resumen

LTX-2.5-22b-IC-LoRA-Ingredients es un adaptador LoRA de consistencia de identidad (IC-LoRA) desarrollado por Lightricks para su modelo de generacion de video LTX-2.5, de 22.000 millones de parametros. El adaptador se aplica sobre el modelo base y transforma la tarea de video-to-video en un flujo de «reference sheet»: a partir de una hoja de referencia con los elementos de un personaje u objeto (rostro, vestuario, accesorios), el modelo genera video manteniendo la coherencia visual de esos ingredientes a lo largo de los fotogramas. Resuelve uno de los problemas clasicos de la generacion de video con difusion: la deriva de identidad entre planos y entre secuencias.

El repositorio contiene unicamente los pesos del adaptador en formato de fichero unico para la libreria `diffusion-single-file`, con un tamano total de 1,4 GB, lo que corresponde a un LoRA de rango moderado sobre un transformer de difusion de gran tamano. No incluye el modelo base, que debe obtenerse por separado y cuyo acceso esta restringido en Hugging Face.

Es relevante ahora porque la consistencia de personajes es el cuello de botella practico de los pipelines de produccion audiovisual con IA: sin ella, cada plano requiere correccion manual o edicion de referencia. Un IC-LoRA especializado en ingredientes permite reutilizar un mismo diseno de personaje en multiples tomas con una sola condicion de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusion para video (LTX-2.5) |
| Parametros totales | 22.000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | diffusion-single-file (fichero unico, 1,4 GB) |

## Arquitectura y entrenamiento

El adaptador se monta sobre LTX-2.5, un modelo de difusion para generacion de video con arquitectura transformer. La variante IC-LoRA (identity-consistency LoRA) introduce un mecanismo de condicionamiento por referencia: el modelo recibe una hoja de ingredientes —imagenes o recortes de los elementos que definen al personaje— y aprende a inyectar esa informacion en el proceso de denoising para que los rasgos se mantengan estables en el video de salida. El pipeline declarado es video-to-video, es decir, parte de un video de entrada y lo transforma condicionado por la referencia.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del adaptador. El tamano del repositorio (1,4 GB) sugiere un adaptador de bajo rango sobre las capas de atencion y proyecciones del transformer base, sin que se pueda confirmar el rango ni los modulos afectados.

## Capacidades

- Generacion de video condicionada por una hoja de referencia de ingredientes (reference sheet).
- Consistencia de identidad de personajes a lo largo de secuencias de video.
- Video-to-video: transformacion de un video de entrada guiada por la referencia.
- Control de vestuario, accesorios y rasgos faciales mediante los ingredientes suministrados.
- Compatibilidad con el ecosistema LTX-2.5 y sus pipelines de difusion.
- Soporte limitado al idioma ingles en las condiciones textuales asociadas.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step (no aplica a un modelo de difusion).

## Casos de uso

- Produccion de series animadas o cortos: se define una hoja de ingredientes por personaje y se reutiliza en todos los planos, reduciendo la deriva de identidad entre tomas sin retoque manual plano a plano.
- Previsualizacion de vestuario en cine y publicidad: a partir de una referencia de diseno se genera video del actor o modelo virtual con el vestuario aplicado, manteniendo coherencia entre angulos y movimientos.
- Videojuegos y avatares: generacion de clips de personajes consistentes para menus, cinemáticas o material promocional, usando la misma referencia de ingredientes en todo el material.
- Contenido para redes sociales con personaje recurrente: un creador mantiene un mismo personaje virtual en multiples videos sin reentrenar el modelo en cada publicacion.
- Prototipado de direccion de arte: comparar variantes de un personaje (peinado, ropa, paleta) cambiando solo la hoja de ingredientes y regenerando el mismo video de referencia.
- Doblaje y localizacion visual: aplicar el mismo personaje consistente sobre videos base distintos para mantener la continuidad de una campana multicanal.
- Restauracion o extension de material existente: usar video-to-video para transformar metraje preservando la identidad del sujeto original mediante la referencia de ingredientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 1,4 GB, pero requiere cargar el modelo base LTX-2.5 de 22.000 millones de parametros para funcionar.
- VRAM estimada para inferencia en precision completa: no disponible; para un transformer de difusion de 22B se requiere tipicamente hardware de clase profesional (A100 80 GB, H100, L40S) o cuantizacion agresiva.
- GPU consumer: no confirmado; con cuantizacion podria ser viable en RTX 4090 (24 GB) segun el soporte que ofrezca LTX-2.5, dato no disponible en la informacion proporcionada.
- Opciones de despliegue: pipelines de difusion compatibles con `diffusion-single-file` y el ecosistema LTX; soporte de vLLM, llama.cpp, Ollama o TGI no disponible (no aplican a modelos de difusion de video en la mayoria de los casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Ingredients | IC-LoRA sobre difusion de video | 22B (base) | no disponible | ltx-2.x-community-license | Restringido (gated) |
| Lightricks/LTX-2.5 | Modelo base de difusion de video | 22B | no disponible | ltx-2.x-community-license | Restringido (gated) |
| Alternativas de consistencia de personaje en video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar la licencia ltx-2.x-community-license en Hugging Face antes de descargar el modelo.
- Licencia de comunidad: revisar las condiciones de uso comercial antes de integrarlo en productos; no es una licencia open source permisiva.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y esta acoplado a la version concreta de LTX-2.5.
- Idioma: las condiciones textuales estan limitadas al ingles.
- Riesgo de deriva de identidad si la hoja de ingredientes es incompleta o de baja calidad; la consistencia depende de la referencia suministrada.
- Riesgo de artefactos y alucinacion visual propios de los modelos de difusion de video, especialmente en movimientos rapidos u oclusiones.
- Sesgos: no se documentan sesgos especificos, pero al ser un modelo de difusion entrenado con datos no publicos puede reproducir sesgos de representacion de los datasets de entrenamiento.
- No apto para tareas de texto, razonamiento o codigo; su ambito es exclusivamente la generacion y transformacion de video.
- Falta de datos publicos sobre cuantizacion y requisitos exactos de VRAM, lo que complica la planificacion de infraestructura en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Ingredients
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Organizacion Lightricks en Hugging Face: https://huggingface.co/Lightricks
- No se han encontrado en la informacion proporcionada papers, blogs o repositorios adicionales.
