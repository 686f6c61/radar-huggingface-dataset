# Salahuddin1234/omnidoctor-hulu-med

## Resumen

Hulu-Med es un modelo de visión-lenguaje de propósito médico que unifica la comprensión de texto clínico, imágenes 2D, volúmenes 3D y vídeo quirúrgico en una sola arquitectura. Lo desarrolla el grupo ZJU-AI4H (Universidad de Zhejiang), con paper asociado en arXiv (2510.08668) y una familia de variantes que abarca 4B, 7B, 14B, 32B, 30A3 (MoE), 235A22 (MoE) y Flash-Preview-27B. La ficha que se documenta aquí corresponde al repositorio `Salahuddin1234/omnidoctor-hulu-med`, una redistribución de terceros, no el repositorio oficial del equipo autor.

El repositorio declara 30.324.224.752 parámetros en formato safetensors (60,9 GB de pesos), lo que coincide con la variante Hulu-Med-30A3, una implementación de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token según la nomenclatura del propio proyecto. El pipeline declarado es `image-text-to-text` y la librería de referencia es Transformers, con licencia Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, es un modelo médico abierto que cubre modalidades poco habituales en la oferta pública (TC, RM, PET, OCT, endoscopia, histopatología, fundus, dermatoscopia, angiografía y vídeo quirúrgico); por otro, el pipeline completo (curaduría de datos, código de entrenamiento y pesos) se publica de forma transparente, entrenado exclusivamente con datos públicos, lo que facilita auditoría y reproducción. El corpus declarado es de 16,7 millones de muestras repartidas en 12 sistemas anatómicos y 14 modalidades de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), basado en la familia Qwen (tag `qwen3_5`); encoder visual para 2D/3D/vídeo no detallado en la informacion disponible |
| Parametros totales | 30.324.224.752 (30,3B), dato real de safetensors |
| Parametros activos | Aproximadamente 3B segun la nomenclatura de la variante Hulu-Med-30A3; no confirmado de forma explicita para este repositorio |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se anuncian GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `AutoModelForCausalLM.from_pretrained`) |
| Tamano del repositorio | 60,9 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion del repositorio | 2026-09-30 |

## Arquitectura y entrenamiento

La model card describe Hulu-Med como un modelo generalista multimodal con decodificador tipo transformer y capa MoE en las variantes 30A3 y 235A22 (la nota de despliegue recomienda vLLM o SGLang precisamente por ser MoE). El modelo procesa cuatro entradas: texto médico, imagen 2D, volumen 3D y vídeo, con soporte nativo en Transformers. La información disponible no detalla el número de capas, la configuración del encoder visual, el mecanismo de fusión multimodal ni el esquema de enrutamiento de expertos.

En cuanto a datos, el proyecto declara un corpus de 16,7 millones de muestras que cubren 12 sistemas anatómicos (multi-sistema, piel, respiratorio, celular/tejido, digestivo, nervioso, cardiovascular, musculoesquelético, reproductivo, urinario, cuerpo completo, endocrino, inmune/linfático y hematológico), 14 modalidades de imagen (TC, RM, rayos X, ecografía, PET, OCT, endoscopia, microscopía, histopatología, fundus, dermatoscopia, angiografía, fotografía digital y gráfico médico) y tareas como diálogo clínico, detección de anomalías, predicción de pronóstico, planificación de tratamiento, evaluación de habilidad quirúrgica, generación de informes y reconocimiento de fases quirúrgicas. Todo el entrenamiento se hace con datos públicos. El coste declarado de entrenamiento es de 4.000 a 40.000 horas de GPU para las variantes de 7B a 32B, sin que la información disponible desglose el presupuesto de cómputo de la variante de 30B. No se especifica en el material disponible si hubo RLHF, DPO u otro ajuste por preferencias.

## Capacidades

- Comprensión multimodal médica holística: texto clínico, imagen 2D, volumen 3D y vídeo quirúrgico en un mismo modelo.
- Generación de informes médicos y descripciones a partir de estudios de imagen.
- Diálogo clínico multiturno orientado a consulta y razonamiento médico.
- Detección de anomalías y clasificación sobre las 14 modalidades de imagen declaradas.
- Predicción de pronóstico y apoyo a planificación de tratamiento.
- Reconocimiento de fases quirúrgicas y evaluación de habilidad quirúrgica sobre vídeo.
- Cálculo médico (medical computation) y tareas educativas.
- Cadena de razonamiento (CoT) en versiones posteriores de la familia; la variante Flash-Preview-27B se anuncia con CoT más corta para mayor throughput.
- Integración nativa con HuggingFace Transformers (`AutoModelForCausalLM.from_pretrained`) y compatibilidad con endpoints.
- Soporte de despliegue en vLLM (con tensor parallel) y SGLang para las variantes MoE; compatibilidad con vLLM anunciada desde noviembre de 2025.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Generación automática de informes radiológicos: el modelo acepta imagen 2D y volumen 3D, por lo que puede convertir estudios de TC o RM en borradores estructurados de informe que el radiólogo revisa y firma, reduciendo tiempo de dictado.
- Triaje de imágenes dermatológicas: con soporte declarado para dermatoscopia y fotografía digital, puede clasificar lesiones cutáneas y priorizar casos sospechosos antes de la consulta presencial.
- Análisis de vídeo quirúrgico: el reconocimiento de fases quirúrgicas permite etiquetar automáticamente las etapas de una intervención grabada y alimentar métricas de evaluación de habilidad para programas de formación de residentes.
- Apoyo a la decisión en histopatología y microscopía: dado su cobertura de histopatología, microscopía y fundus, puede servir como segunda lectura en cribado de alto volumen donde el patólogo solo revisa los casos marcados como anómalos.
- Asistente clínico conversacional: con entrada de texto y contexto multimodal, puede gestionar diálogo multiturno con historial de caso, pruebas de imagen y preguntas de seguimiento para residentes o personal de atención primaria.
- Cribado en telemedicina: al ser multimodal y desplegable en infraestructura propia con licencia Apache 2.0, permite montar un servicio de preevaluación de imágenes (por ejemplo, retinografía para cribado de retinopatía diabética) sin enviar datos de pacientes a APIs de terceros.
- Formación médica asistida: puede generar preguntas y explicaciones sobre casos a partir de imágenes reales anonimizadas, útil en plataformas de educación médica continuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este repositorio en la información disponible. La model card del proyecto matriz menciona cifras de otras variantes de la familia, que se reproducen a continuación con la advertencia de que no corresponden necesariamente a los pesos de este repositorio:

| Modelo | Benchmark | Resultado |
|---|---|---|
| Hulu-Med-Flash-Preview-27B | HealthBench | 64,5 |
| Hulu-Med-Flash-Preview-27B | HealthBench Hard | 43,7 |
| Hulu-Med-4B | Comparativa cualitativa frente a MedGemma-4B y Lingshu-7B | Se declara superior; sin cifras publicadas |
| Familia Hulu-Med | 30 benchmarks medicos | Rendimiento SOTA declarado por el autor; sin cifras en el material disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 61 GB solo para pesos, más overhead de activaciones y caché KV durante la inferencia (en la práctica, 80 GB por GPU o reparto en varias GPU).
- VRAM estimada en cuantización int8: aproximadamente 31 GB de pesos.
- VRAM estimada en cuantización int4: aproximadamente 16 GB de pesos, siempre que se generen pesos cuantizados, algo que este repositorio no publica.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o H200; en configuraciones de 2x48 GB (L40S, A6000 Ada) con tensor parallel.
- Cabe en GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB) solo con cuantización agresiva a 4 bits y offloading a RAM; no es un escenario recomendado para producción.
- Opciones de despliegue: vLLM (recomendado por el autor para variantes MoE, con soporte de tensor parallel desde noviembre de 2025), SGLang y Transformers nativo. Soporte de llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. La variante Flash-Preview-27B se anuncia con CoT más corta para mejorar throughput, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hulu-Med-30A3 (este repositorio) | 30,3B totales, ~3B activos (MoE) | no disponible | SOTA declarado en 30 benchmarks medicos; sin cifras por benchmark | Apache 2.0 | Pesos en HF (redistribucion de terceros) |
| Hulu-Med-4B | 4B | no disponible | El autor declara que supera a MedGemma-4B y Lingshu-7B | Apache 2.0 | Pesos en HF oficial |
| MedGemma-4B | 4B | no disponible | Referencia usada por el autor como linea base a superar | Licencia propia de Google (terminos especificos) | Pesos en HF |
| Lingshu-7B | 7B | no disponible | Referencia usada por el autor como linea base a superar | no disponible | Pesos en HF |

Los datos de arquitectura, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada, por lo que la comparación se limita al tamaño y a la jerarquía cualitativa declarada por el autor de Hulu-Med.

## Limitaciones y advertencias

- Este repositorio es una redistribución de terceros (`Salahuddin1234/omnidoctor-hulu-med`), no el repositorio oficial de ZJU-AI4H. Para uso clínico o de investigación conviene verificar los pesos contra la publicación oficial antes de confiar en ellos.
- Modelo de uso médico: no está validado como dispositivo médico ni cuenta con marcado CE ni aprobación de la FDA según la información disponible. Sus salidas no deben usarse para diagnóstico o tratamiento sin supervisión profesional.
- Riesgo de alucinación relevante en generación de informes y en respuestas conversacionales; cualquier texto generado debe pasar por revisión facultativa.
- Sesgos: no hay información publicada sobre evaluación de sesgos por etnia, sexo, edad o tipo de centro sanitario. El corpus, aunque público, puede sobrerrepresentar determinadas poblaciones.
- Idiomas soportados no declarados: no se puede asumir un rendimiento homogéneo en castellano frente al inglés o el chino.
- Longitud de contexto no especificada: no se puede planificar el tamaño de historiales clínicos o series de imagen sin verificación empírica.
- No se publican pesos cuantizados, lo que obliga a infraestructura de gama alta (≈80 GB de VRAM en bf16) o a cuantizar por cuenta propia.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de la normativa de protección de datos (RGPD) si se procesan datos de pacientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre el modelo (solo listados de sitios no relacionados), por lo que no hay validación externa independiente disponible.

## Enlaces

- Repositorio documentado: https://huggingface.co/Salahuddin1234/omnidoctor-hulu-med
- Paper (arXiv 2510.08668): https://huggingface.co/papers/2510.08668
- Repositorio oficial de la familia Hulu-Med: https://huggingface.co/ZJU-AI4H/Hulu-Med
- Código fuente: https://github.com/ZJUI-AI4H/Hulu-Med
- Variante Flash-Preview-27B: https://huggingface.co/ZJU-AI4H/Hulu-Med-Flash-Preview-27B
- Variante 30A3: https://huggingface.co/ZJU-AI4H/Hulu-Med-30A3
- Variante 235A22: https://huggingface.co/ZJU-AI4H/Hulu-Med-235A22
- Variante 4B: https://huggingface.co/ZJU-AI4H/Hulu-Med-4B
- Variante 7B: https://huggingface.co/ZJU-AI4H/Hulu-Med-7B
- Variante 14B: https://huggingface.co/ZJU-AI4H/Hulu-Med-14B
- Variante 32B: https://huggingface.co/ZJU-AI4H/Hulu-Med-32B
- ModelScope (modelos y datos de evaluacion): https://modelscope.cn/models/Med-Team/Hulu-Med
