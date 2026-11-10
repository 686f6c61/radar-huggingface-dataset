# Addax-Data-Science/EUR-DF-v1-5

## Resumen

EUR-DF-v1-5 es un modelo de clasificación de imágenes para fototrampeo (camera traps) desarrollado por la iniciativa Deepfaune, un consorcio académico liderado por el Centre National de la Recherche Scientifique (CNRS) francés en colaboración con más de 100 socios europeos dedicados a la investigación y conservación de fauna silvestre. El modelo resuelve la tarea de identificar automáticamente la especie animal presente en cada imagen o fotograma capturado por una cámara de fototrampeo, entre un conjunto cerrado de 40 clases (desde bisonte y lobo hasta micromamíferos y aves).

Técnicamente se trata de un clasificador de imagen construido sobre el backbone DINOv3 ViT-L de Meta, adaptado para operar a una resolución de entrada de 224x224 píxeles (frente a los 256x256 por defecto de DINOv3) y con `global_pool` configurado a `"token"` en lugar del `"avg"` que usa timm por defecto. Estas dos decisiones son críticas para reproducir exactamente las salidas del software original del autor. El repositorio ocupa 1,2 GB y contiene los pesos publicados por Deepfaune en su servidor institucional, copiados byte a byte.

Esta copia en Hugging Face existe para facilitar la integración con AddaxAI, la plataforma de Addax Data Science, e incluye un `inference.py` que es un port del `classifTools.py` original adaptado a la interfaz de modelos de AddaxAI. No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Es un clasificador de visión por computador de dominio muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv3 ViT-L) con cabeza de clasificación lineal |
| Parametros totales | no disponible (backbone ViT-L de DINOv3; el conteo exacto no se indica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de especies, sin componente textual) |
| Licencia | CC-BY-SA-4.0, con licencia DINOv3 de Meta aplicable adicionalmente |
| Formato de pesos | no disponible explícitamente (pesos copiados byte a byte desde el servidor de Deepfaune; presumiblemente safetensors o PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea un backbone DINOv3 ViT-L, un transformer de visión auto-supervisado desarrollado por Meta, sobre el que se añade una cabeza de clasificación para las 40 clases de fauna. La entrada se construye a 224x224 píxeles, no a los 256x256 que usa DINOv3 por defecto, y el pooling global se realiza sobre el token de clase (`"token"`), no mediante promedio (`"avg"`). El autor de la copia advierte que ambos detalles son esenciales: los pesos cargan sin error con la configuración incorrecta, pero las salidas dejarían de coincidir con las del software original.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste fino supervisado, RLHF o DPO (no aplicables en un clasificador de este tipo). El entrenamiento corre a cargo de la iniciativa Deepfaune, que publica versiones periódicas del modelo con mejoras de precisión o ampliación del listado de especies. Esta versión v1.5 corresponde a los pesos oficiales publicados en el servidor de la Université de Lyon.

Una innovación destacable es la existencia de una cabeza secundaria para aves, no incluida en esta copia: opera por recorte sobre el mismo embedding del token de clase y, cuando la cabeza principal predice `bird`, una MLP divide el embedding en ocho grupos. El autor la omite temporalmente porque el equipo de Deepfaune prepara más cabezas (mustélidos pequeños, sexo, edad) y prefiere integrarlas todas de una vez bajo un nuevo identificador de modelo.

## Capacidades

- Clasificación de imágenes de fototrampeo en 40 clases de fauna: bisonte, tejón, íbice, castor, ciervo rojo, chacal dorado, gamuza, gato, cabra, corzo, perro, perro mapache, gamo, ardilla, alce, équido, gineta, glotón, erizo, lagomorfo, lobo, nutria, lince, mangosta, marmota, micromamífero, muflón, oveja, mustélido, ave, oso, puercoespín, coipo, rata almizclera, mapache, zorro, zorro ártico, reno, jabalí y vaca.
- Procesamiento de imágenes y vídeos capturados por cámaras trampa.
- Inferencia por recorte individual, con una distribución de probabilidad por recorte, compatible con el contrato de AddaxAI.
- Integración con el software propio de Deepfaune y con plataformas de terceros como AddaxAI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües.
- No incluye la cabeza de aves ni las futuras cabezas de mustélidos pequeños, sexo o edad.

## Casos de uso

- Monitorización de fauna en estudios de conservación: el modelo clasifica automáticamente miles de imágenes de fototrampeo, sustituyendo la revisión manual y permitiendo procesar volúmenes que serían inviables para un equipo humano.
- Seguimiento de poblaciones de grandes carnívoros: lobo, oso, lince y glotón figuran entre las clases, lo que permite estimar presencia y frecuencia relativa en áreas protegidas con series largas de capturas.
- Inventarios de ungulados: ciervo rojo, corzo, gamo, jabalí, muflón, íbice y reno permiten caracterizar comunidades de herbívoros en reservas y fincas cinegéticas.
- Detección de especies invasoras o exóticas: mapache, perro mapache, coipo, rata almizclera y visón (dentro de mustélido) son clases reconocidas, útiles para programas de alerta temprana.
- Seguimiento de fauna en explotaciones ganaderas: las clases vaca, oveja, cabra, perro y gato permiten separar animales domésticos de silvestres en capturas mixtas y filtrar falsos positivos.
- Investigación ecológica a gran escala: la integración con AddaxAI facilita pipelines reproducibles en estudios multi-sitio coordinados por la red de más de 100 socios europeos de Deepfaune.
- Análisis de vídeo de cámaras trampa: el modelo procesa fotogramas individuales, lo que permite clasificar secuencias completas tras un paso de extracción de frames.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Un backbone ViT-L en precisión completa requiere del orden de varios GB de VRAM; el repositorio completo ocupa 1,2 GB, lo que sugiere pesos en fp32 o fp16 de tamaño moderado.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del backbone ViT-L, una GPU consumer moderna (RTX 3060 en adelante) debería ser suficiente para inferencia; una A100 o H100 no serían necesarias salvo para procesamiento masivo por lotes.
- Cabe en GPU consumer: previsiblemente sí, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: software propio de Deepfaune, AddaxAI y el `inference.py` incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación de fauna en fototrampeo ni datos de rendimiento que permitan una comparación rigurosa. Otras versiones del propio Deepfaune (v1.0 a v1.4) son las alternativas naturales, pero no se dispone de sus especificaciones en esta búsqueda.

## Limitaciones y advertencias

- Es un clasificador cerrado de 40 clases: cualquier especie fuera de la lista se asignará a la clase más parecida, sin opción de "desconocido" documentada.
- La cabeza de aves no está incluida; las aves se clasifican solo a nivel de clase genérica `bird`.
- Los pesos cargan sin error con la configuración incorrecta de resolución (256x256) o pooling (`"avg"`), pero las predicciones dejan de coincidir con las del software original. Cualquier reimplementación debe respetar 224x224 y `global_pool="token"`.
- La licencia CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas; además se aplica la licencia DINOv3 de Meta, cuyos términos deben revisarse antes de uso comercial.
- No se documentan sesgos específicos, tasas de alucinación ni limitaciones por condición de iluminación, oclusión o calidad de imagen, aunque son riesgos inherentes al fototrampeo.
- El modelo no genera texto ni razona: no debe presentarse como un modelo de lenguaje ni evaluarse con benchmarks de NLP.
- La versión de la copia debe verificarse contra el repositorio oficial de Deepfaune, ya que el autor publica actualizaciones periódicas con nuevas especies y mejoras de precisión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria de esta copia concreta.

## Enlaces

- Hugging Face: https://huggingface.co/Addax-Data-Science/EUR-DF-v1-5
- Deepfaune (web oficial): https://www.deepfaune.cnrs.fr/en/
- Documentación de Deepfaune: https://deepfaune.pages.math.cnrs.fr/software/
- Repositorio GitLab oficial: https://plmlab.math.cnrs.fr/deepfaune/software/-/tree/master
- Pesos originales v1.5: https://pbil.univ-lyon1.fr/software/download/deepfaune/v1.5/
- `classifTools.py` original: https://plmlab.math.cnrs.fr/deepfaune/software/-/blob/master/classifTools.py
- AddaxAI: https://addaxdatascience.com/addaxai
- Artículo para citar: https://link.springer.com/article/10.1007/s10344-023-01742-7
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
