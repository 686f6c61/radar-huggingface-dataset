# Igal20/native-association-wider-florence2

## Resumen

El modelo `Igal20/native-association-wider-florence2` es un fine-tune del modelo de visión-lenguaje Florence-2-large (0,77B parámetros) desarrollado por Igal Dmitriev y Ofir Liba (WSC Sports) para el taller HCMIW de ECCV 2026. Su propósito es el reconocimiento de atributos de personas en imágenes del mundo real, concretamente los 14 atributos binarios del dataset WIDER-Attribute, mediante una decodificación restringida por gramática que garantiza que cada persona reciba sus atributos asociados dentro de un bloque estructurado de salida.

La innovación principal es que la asociación entre cada persona detectada y sus atributos se convierte en una propiedad de la decodificación, no en un post-proceso. El modelo emite, en una sola secuencia, las cajas delimitadoras como tokens `<loc>` y los atributos como tokens de ranura fija por persona, todo ello validado por una gramática finita. Los encoders están congelados y solo se entrenan el decoder BART y los embeddings compartidos, con selección del mejor checkpoint por mA de validación (época 9).

Este checkpoint es relevante porque reporta, según sus autores, el primer resultado end-to-end (detección acoplada) bajo el protocolo estándar de WIDER-Attribute, alcanzando 84,4 mAP en modo de dos etapas sin cajas reales, y 93,1 mAP en fusión tardía con cajas dadas. Está pensado exclusivamente para investigación y reproducción de resultados, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Florence-2-large (encoder de vision + decoder BART) con vocabulario expandido para atributos de persona |
| Parametros totales | 776.744.047 (~0,77B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el codigo de carga usa fp16 en CUDA y fp32 en CPU) |
| Idiomas soportados | no disponible (el modelo base Florence-2 soporta ingles, pero no se especifica para este checkpoint) |
| Licencia | MIT |
| Formato de pesos | safetensors (modelo principal) + `lm_head.pth` separado para la cabeza de lenguaje con vocabulario expandido |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/Florence-2-large`, una arquitectura de vision-lenguaje que combina un encoder de vision (DaViT) con un decoder BART. En este fine-tune, los encoders permanecen congelados y solo se entrenan el decoder BART y los embeddings compartidos, usando una funcion de perdida de entropia cruzada uniforme con semilla 42. El entrenamiento se realiza sobre el split de entrenamiento de WIDER-Attribute (5.509 imagenes) y la seleccion del checkpoint se hace por mejor mA en validacion (epoca 9).

La innovacion tecnica clave es la decodificacion con gramatica restringida (`prefix_allowed_tokens_fn`): el modelo solo puede emitir tokens que sean validos segun un esquema fijo, de modo que cada persona recibe su bloque de atributos en ranuras predefinidas. Esto hace que la asociacion persona-atributo sea una propiedad estructural de la salida, no un paso posterior. Ademas, el vocabulario se expande con tokens personalizados para los 14 atributos binarios de WIDER y para las cajas `<loc>`. La cabeza de lenguaje con el vocabulario expandido se guarda por separado en `lm_head.pth` y debe sobrecargarse tras cargar el modelo base.

## Capacidades

- Reconocimiento de atributos de personas en imagenes: detecta personas y asigna 14 atributos binarios de WIDER (p. ej. genero, ropa, accesorios) en una sola pasada.
- Deteccion de personas con cajas delimitadoras expresadas como tokens `<loc>` dentro de la misma secuencia de salida.
- Asociacion persona-atributo garantizada por construccion gracias a la decodificacion con gramatica restringida.
- Soporte de multiples modos de inferencia: imagen completa en una sola pasada, dos etapas end-to-end (deteccion + atributos), o con cajas dadas (per-crop o imagen completa).
- Fusion tardia de predicciones per-crop y de imagen completa para mejorar la precision (modo reportado como headline del paper).
- Salida estructurada y validable por esquema, adecuada para pipelines de post-proceso automatico.
- No es un modelo generalista: esta especializado en atributos de peatones y no soporta tareas de captioning o VQA genericas fuera de su dominio.

## Casos de uso

- Reproduccion de resultados academicos: investigadores pueden cargar el checkpoint y ejecutar la suite de evaluacion de WIDER-Attribute para verificar los numeros reportados en el paper de ECCV 2026.
- Estudio de decodificacion con gramatica restringida en VLMs: el repositorio incluye una gramatica finita de referencia y un esquema de confianza por campo, util para investigar como forzar salidas estructuradas en modelos de vision-lenguaje.
- Evaluacion comparativa de atributos de peatones: el modelo puede servir como baseline de ultima generacion para nuevos metodos de reconocimiento de atributos en entornos no controlados, dado que supera a especialistas clasicos (80,5-87,5 mAP) en el modo con cajas dadas.
- Analisis de escenas con multiples personas para investigacion en interaccion humano-computador: el modo de imagen completa en una sola pasada permite extraer atributos de todas las personas de una escena sin necesidad de un detector externo.
- Desarrollo de pipelines de dos etapas: el modo end-to-end (sin cajas reales) puede integrarse en sistemas de deteccion y atribucion para prototipos de investigacion, aunque no esta recomendado para produccion.
- Estudio de fusion tardia de predicciones: el modo de fusion per-crop + imagen completa (93,1 mAP) es un caso de uso metodologico para entender como combinar multiples vistas de la misma escena en tareas de atributos.

## Benchmarks y rendimiento

Resultados reportados por los autores en el test de WIDER-Attribute (6.918 imagenes / 29.177 instancias de persona), evaluados con este checkpoint exacto:

| Modo | mAP | mA |
|---|---|---|
| Imagen completa, una sola pasada (lectura end-to-end de todas las personas) | 82,9 | 79,4 |
| Dos etapas end-to-end (sin cajas reales en ninguna etapa) | 84,4 | 80,0 |
| Cajas dadas, por recorte (per-crop) | 91,9 | 91,4 |
| Cajas dadas, imagen completa (escena) | 90,1 | 90,0 |
| Cajas dadas, imagen completa + per-crop con fusion tardia (titular del paper) | 93,1 | — |

Referencia: los especialistas clasicos en atributos de persona con cajas dadas cubren un rango de 80,5 a 87,5 mAP. El resultado end-to-end es, segun los autores, el primer resultado con deteccion acoplada reportado bajo el protocolo estandar de WIDER-Attribute. No se han publicado benchmarks en otros datasets (p. ej. COCO, MMLU) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 0,77B parametros. En fp16 ocupa aproximadamente 1,5 GB de pesos; en fp32 unos 3 GB. Con el procesador y los estados intermedios, se recomienda al menos 4-6 GB de VRAM para inferencia basica.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16. Para lotes grandes o despliegue concurrente, se recomienda una GPU de datacenter (A100, H100) o multiples GPUs.
- Si cabe en consumer GPU: si, en tarjetas con 8 GB o mas de VRAM.
- Opciones de despliegue: el modelo se carga con `transformers` usando `trust_remote_code=True`. No se menciona compatibilidad explicita con vLLM, TGI, Ollama o llama.cpp en la informacion disponible; dado que usa codigo personalizado de Florence-2, es probable que requiera integracion manual con estos servidores.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia o throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Igal20/native-association-wider-florence2 | 0,77B | no disponible | Atributos de persona (WIDER) | MIT | HuggingFace |
| microsoft/Florence-2-large | 0,77B | no disponible | Vision-lenguaje generalista (captioning, VQA, deteccion) | MIT | HuggingFace |
| florence-community/Florence-2-large-ft | 0,77B | no disponible | Vision-lenguaje generalista fine-tuneado en multiples tareas | MIT | HuggingFace |
| Especialistas clasicos en atributos de persona (varios) | variable | — | Atributos de persona con cajas dadas | variable | variable |

La comparativa directa con otros modelos de atributos de persona no esta disponible en la informacion proporcionada, salvo la referencia del paper a que los especialistas clasicos obtienen 80,5-87,5 mAP en el modo con cajas dadas, mientras que este checkpoint alcanza 91,9 mAP en per-crop y 93,1 mAP con fusion tardia. Frente a Florence-2-large base, este checkpoint esta especializado y no es intercambiable para tareas generales.

## Limitaciones y advertencias

- Entrenado exclusivamente en el split de entrenamiento de WIDER-Attribute (5.509 imagenes); el rendimiento fuera de ese dominio no esta garantizado y puede degradarse significativamente.
- El vocabulario de atributos se limita a los 14 atributos binarios de WIDER; no soporta otros atributos o categorias.
- No esta destinado a produccion ni a vigilancia; los autores lo declaran como checkpoint de investigacion.
- La decodificacion sin la gramatica restringida colapsa (bucle de token de inicio sin fin); la gramatica es imprescindible para obtener salidas validas.
- El corpus deportivo y el checkpoint asociado al mismo paper son propietarios y no se liberan; este modelo solo cubre el escenario WIDER.
- La cabeza de lenguaje con vocabulario expandido se guarda en un archivo separado (`lm_head.pth`); si no se sobrecarga, las logits para los tokens personalizados seran incorrectas.
- No se especifican idiomas soportados; el modelo base Florence-2 esta orientado a ingles, pero no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion en escenas con personas muy ocluidas o fuera de distribucion, comun en modelos de vision-lenguaje.
- No se han publicado analisis de sesgos de genero, raza o edad para este checkpoint; los atributos binarios de WIDER pueden perpetuar categorias simplistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Igal20/native-association-wider-florence2
- Repositorio GitHub (receta, gramatica, evaluacion): https://github.com/Igal20/native-association
- Paper en OpenReview: https://openreview.net/forum?id=ZYKiyXfSy8
- Modelo base Florence-2-large: https://huggingface.co/microsoft/Florence-2-large
- Florence-2-large-ft (comunidad): https://huggingface.co/florence-community/Florence-2-large-ft
- Publicacion de investigacion de Florence-2 (Microsoft Research): https://www.microsoft.com/en-us/research/publication/florence-2-advancing-a-unified-representation-for-a-variety-of-vision-tasks/
