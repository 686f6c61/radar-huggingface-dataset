# Biodiversitas/sam3

## Resumen

SAM 3 (Segment Anything with Concepts) es un modelo de segmentación de imágenes desarrollado por Meta, publicado en el arXiv con el identificador 2511.16719 y presentado en ICLR 2026. Este repositorio concreto, `Biodiversitas/sam3`, es un espejo no modificado de los pesos oficiales de `facebook/sam3` en formato Transformers, mantenido por PT Solusi Biodiversitas Nusantara. El modelo resuelve el problema de la segmentación guiada por concepto: dado un prompt de texto (por ejemplo, "cangrejo" o "flor de orquídea"), delinea todas las instancias que coinciden en una imagen, lo que permite separar sujetos de interés antes de entrenar modelos de identificación.

La relevancia de este espejo es práctica: redistribuye los pesos originales bajo la SAM License, que permite la redistribución siempre que se acompañe una copia de la licencia, y se emplea en la función "Find subjects" de la plataforma Kunci Biodiversitas, donde la inferencia se ejecuta localmente en el equipo del usuario. El modelo cuenta con 859.922.360 parámetros y un tamaño de repositorio de 3,4 GB, lo que lo sitúa en la gama de modelos de segmentación de tamaño medio.

Arquitectónicamente se etiqueta como `sam3_video` y se integra en la librería Transformers mediante las clases `Sam3Model` y `Sam3Processor`, con pipeline de `mask-generation`. No se dispone de información sobre longitud de contexto, idiomas soportados ni esquemas de cuantización en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sam3_video (segmentación, familia SAM 3 de Meta) |
| Parametros totales | 859.922.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión guiado por texto) |
| Licencia | SAM License (license_name: sam-license) |
| Formato de pesos | safetensors (Transformers: `Sam3Model`, `Sam3Processor`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SAM 3 de Meta, orientada a la segmentación guiada por conceptos, y se distribuye con la etiqueta de arquitectura `sam3_video`. La model card del espejo no detalla la composición interna de la red, el número de tokens de entrenamiento ni la composición del dataset; únicamente indica que se trata de una copia byte a byte de los pesos oficiales de `facebook/sam3` (con SHA-256 de `model.safetensors` `6d06f0a5f84e…`). Para detalles de arquitectura y entrenamiento debe consultarse la model card original y el repositorio de código de Meta.

No se documenta en la información disponible si hubo RLHF, DPO u otras fases de ajuste, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. La única información de entrenamiento relevante es que este repositorio es un espejo sin modificaciones, por lo que sus capacidades y sesgos son los del modelo base de Meta.

## Capacidades

- Segmentación de imágenes guiada por prompt de texto: delinea cada individuo que coincide con un concepto (por ejemplo, "cangrejo", "flor de orquídea").
- Generación de máscaras (`mask-generation` como pipeline declarado).
- Extracción de características (`feature-extraction` entre las etiquetas del repositorio).
- Uso en flujos de vídeo según la etiqueta de arquitectura `sam3_video`.
- Integración con Transformers mediante `Sam3Model` y `Sam3Processor`.
- Inferencia local en el equipo del usuario, según describe el mantenedor.
- Capacidades multilingües: no disponibles (modelo de visión; el prompt de texto se usa como concepto, sin lista de idiomas publicada).
- Tool calling, function calling y razonamiento multi-paso: no disponibles.

## Casos de uso

- Curaduría de datasets de biodiversidad: la función "Find subjects" de Kunci Biodiversitas usa el modelo para delimitar cada individuo que coincide con un prompt de texto en un conjunto de fotos, de modo que los modelos de identificación se entrenen solo con los sujetos recortados y no con el fondo.
- Etiquetado previo a entrenamiento supervisado: generar máscaras automáticas para acelerar el etiquetado de imágenes de fauna y flora antes de anotación manual.
- Segmentación de especímenes en colecciones científicas: separar insectos, plantas o fósiles del fondo de la imagen para catalogación.
- Procesamiento local con privacidad: al ejecutarse en el ordenador del usuario, permite segmentar imágenes sensibles sin enviarlas a un servidor externo.
- Preprocesado en pipelines de visión por computador: extraer recortes de sujetos para alimentar clasificadores, detectores o modelos de identificación posteriores.
- Investigación en segmentación guiada por concepto: servir como referencia reproducible al ser copia byte a byte de los pesos oficiales, útil para replicar resultados y comparar implementaciones.
- Análisis de imágenes de vídeo: la etiqueta `sam3_video` sugiere su uso en secuencias, aunque la información disponible no detalla el flujo de trabajo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 3,4 GB en safetensors con 859,9 M de parámetros.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; no se especifican requisitos de memoria.
- Opciones de despliegue: Transformers (`Sam3Model`, `Sam3Processor`); el pipeline declarado es `mask-generation`. No se documentan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Biodiversitas/sam3 (este) | 859.922.360 | no disponible | Segmentación guiada por texto | SAM License | HuggingFace (espejo) |
| facebook/sam3 | no disponible en la informacion | no disponible | Segmentación guiada por texto | SAM License | HuggingFace (original) |
| Otros modelos de la familia SAM | no disponible | no disponible | Segmentación | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo no modificado: cualquier limitación del modelo original de Meta se hereda íntegramente.
- No se documentan sesgos conocidos ni tasas de error en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir máscaras incorrectas o incompletas ante conceptos ambiguos o imágenes de baja calidad; no se han publicado métricas al respecto.
- Restricciones de licencia: la SAM License impone restricciones de uso militar, armamentístico, nuclear y de espionaje, así como sobre partes sujetas a control comercial. Es obligatorio acompañar una copia de la licencia al redistribuir.
- Obligación de atribución: si se publican resultados obtenidos con SAM 3, la licencia exige reconocer su uso y citar el trabajo de Carion et al. (2026), "SAM 3: Segment Anything with Concepts", ICLR 2026, arXiv:2511.16719.
- Sin afiliación con Meta: el repositorio no está afiliado ni respaldado por Meta.
- Idiomas y contexto: no disponibles; al ser un modelo de visión guiado por texto, el comportamiento multilingüe del prompt no está documentado.
- Para producción conviene validar el rendimiento real en el dominio objetivo, dado que no hay benchmarks publicados en la información disponible.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Biodiversitas/sam3
- Modelo original: https://huggingface.co/facebook/sam3
- Código oficial: https://github.com/facebookresearch/sam3
- Paper: https://arxiv.org/abs/2511.16719
- Plataforma del mantenedor: https://kunci.biodiversitas.id
- Sitio del mantenedor: https://biodiversitas.id
