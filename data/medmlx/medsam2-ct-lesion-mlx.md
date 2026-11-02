# MedMLX/medsam2-ct-lesion-mlx

## Resumen

MedMLX/medsam2-ct-lesion-mlx es una conversión a MLX del checkpoint MedSAM2 especializado en segmentación de lesiones en tomografías computarizadas (TC). Lo publica el proyecto MedMLX, que traslada modelos médicos de segmentación al ecosistema de Apple Silicon mediante el framework MLX, con el objetivo de permitir inferencia local en equipos Mac sin depender de CUDA ni de infraestructura en la nube. El modelo base es wanglab/MedSAM2, presentado en el artículo "MedSAM2: Segment Anything in 3D Medical Images and Videos" (arXiv:2504.03600).

La tarea concreta es la segmentación interactiva en 3D: el usuario proporciona una caja delimitadora (box prompt) sobre un corte axial de la TC y el modelo propaga la máscara de la lesión a lo largo de los cortes adyacentes, en una o ambas direcciones. Esto lo convierte en una herramienta de anotación asistida y de análisis volumétrico para investigación en imagen médica, no en un sistema de diagnóstico autónomo.

La relevancia actual radica en dos factores. Por un lado, la conversión a safetensors MLX (0,2 GB de repositorio) reduce la barrera de entrada para investigadores que trabajan en portátiles o estaciones Mac con GPU integrada. Por otro, la licencia CC-BY-SA-4.0 del checkpoint original convive con una restricción expresa del autor a uso exclusivamente de investigación y educación, una ambigüedad que el propio repositorio señala y que conviene revisar antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de MedSAM2, segmentación promptable tipo SAM 2 adaptada a vídeo/volumen 3D) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors MLX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | cc-by-sa-4.0, con restricción adicional del autor original a investigación y educación |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint MedSAM2 para lesiones en TC, sin reentrenamiento ni ajuste fino adicional por parte de MedMLX. MedSAM2 parte de la familia SAM 2 (Segment Anything Model 2), que combina un codificador de imagen con un mecanismo de memoria temporal para propagar máscaras a través de fotogramas; en el caso médico, los fotogramas son cortes de un volumen 3D (TC o RM) y la propagación se realiza slice a slice. La interfaz de inferencia expuesta en el paquete `medsam2-mlx` acepta una caja `box_xyxy` sobre un corte concreto (`frame_idx`) y un rango de cortes (`slice_range`) para extender la máscara en una o ambas direcciones (`propagation="both"`).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset de lesiones en TC, ni sobre si el pipeline original incluyó etapas de refinamiento con preferencias humanas. La model card indica explícitamente que la conversión se hizo "without retraining", por lo que las capacidades del modelo son las del checkpoint original de wanglab. La innovación técnica del repositorio es de ingeniería de despliegue: portar los pesos a MLX para ejecución en Metal sobre Apple Silicon, con una API Python mínima (`medsam2_mlx.medmlx.run`) que gestiona carga de NIfTI, prompt de caja y escritura de máscaras propagadas.

## Capacidades

- Segmentación interactiva de lesiones en TC a partir de una caja delimitadora sobre un corte axial.
- Propagación de la máscara a cortes adyacentes en una o ambas direcciones del eje axial (parámetro `propagation`).
- Procesamiento de volúmenes en formato NIfTI (`.nii.gz`) como entrada.
- Generación de máscaras de salida por corte, aptas para análisis volumétrico posterior.
- Ejecución local en Apple Silicon mediante MLX y Metal, sin necesidad de GPU NVIDIA.
- Interfaz Python programática; no se documenta interfaz gráfica ni servidor de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de segmentación.
- Capacidades multilingües no aplicables; el modelo no procesa lenguaje.

## Casos de uso

- Anotación asistida en investigación oncológica: un radiólogo o investigador marca con una caja una lesión en un corte y el modelo propaga la máscara por el volumen, reduciendo el tiempo de delineación manual en estudios de cohorte.
- Medición volumétrica de lesiones: las máscaras propagadas permiten calcular volumen y área por corte para estudiar evolución longitudinal en ensayos o bases de datos retrospectivas.
- Preetiquetado para entrenamiento de otros modelos: las máscaras generadas sirven como pseudoetiquetas iniciales que luego se revisan y corrigen, acelerando la creación de datasets supervisados.
- Prototipado rápido en portátiles Mac: investigadores sin acceso a clústeres GPU pueden ejecutar el modelo en local gracias a la conversión MLX, validando hipótesis sobre subconjuntos pequeños de datos.
- Docencia y formación en imagen médica: permite demostrar el funcionamiento de la segmentación promptable en 3D con ejemplos reales en un entorno reproducible y de bajo coste.
- Control de calidad de segmentaciones existentes: comparar las máscaras propagadas por el modelo con anotaciones previas para detectar cortes mal delimitados o lesiones omitidas.
- Integración en pipelines de investigación reproducibles: la API Python y la revisión fijada del repositorio (`--revision 22f5e6dc...`) facilitan la reproducibilidad de experimentos en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de Dice, IoU ni comparaciones cuantitativas con otros modelos; solo remite al artículo original de MedSAM2 (arXiv:2504.03600) para los resultados del checkpoint base, que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 0,2 GB, lo que sugiere un modelo compacto que cabe holgadamente en memoria unificada de equipos Apple Silicon de gama media.
- GPU recomendadas: cualquier Mac con chip de la familia M (M1 en adelante) con soporte Metal; el paquete requiere Python 3.13 y MLX.
- Compatibilidad con GPU de consumo: el modelo está diseñado específicamente para Apple Silicon; no se documenta soporte para CUDA, ROCm ni CPU genérica.
- Opciones de despliegue: paquete `medsam2-mlx` (versión >= 0.2.8) instalable con `uv`; descarga de pesos vía `huggingface-hub`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. Dependen del chip, del tamaño del volumen y del rango de cortes propagados.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto/volumen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/medsam2-ct-lesion-mlx | Segmentación promptable 3D (MLX) | TC + box prompt | Propagación por cortes axiales | CC-BY-SA-4.0 con restricción a investigación | HuggingFace, MLX |
| wanglab/MedSAM2 | Segmentación promptable 3D (PyTorch) | TC/RM/vídeo + prompts | Propagación por cortes/fotogramas | CC-BY-SA-4.0 con restricción a investigación | HuggingFace |
| SAM 2 (Meta) | Segmentación promptable 2D/vídeo | Imagen/vídeo + prompts | Memoria temporal de vídeo | Apache 2.0 (versión base) | Repositorio oficial |
| TotalSegmentator / nnU-Net | Segmentación volumétrica automática | TC completo | Volumen completo, clases fijas | Varía por modelo (a menudo Apache 2.0 o MIT) | Repositorios comunitarios |

La diferencia clave frente a MedSAM2 original es el runtime (MLX frente a PyTorch/CUDA) y el público objetivo (Mac frente a GPU NVIDIA). Frente a SAM 2, MedSAM2 está ajustado al dominio médico. Frente a nnU-Net o TotalSegmentator, el enfoque es interactivo y guiado por prompt, no automático sobre clases predefinidas, lo que lo hace más flexible pero dependiente de la intervención humana.

## Limitaciones y advertencias

- No validado para uso clínico: la model card lo restringe explícitamente a investigación y educación; no debe usarse para diagnóstico ni decisiones terapéuticas.
- Ambigüedad de licencia: CC-BY-SA-4.0 permite uso comercial, pero el autor original declara que los pesos solo pueden usarse para investigación y educación; el repositorio no resuelve la contradicción y deja la revisión al usuario.
- Dependencia de la calidad del prompt: una caja mal colocada o un rango de cortes inadecuado degradan la propagación; el modelo no corrige errores del usuario.
- Riesgo de deriva en la propagación: en volúmenes largos o lesiones con cambios bruscos de forma, la máscara puede desviarse de la lesión real.
- Sin datos de entrenamiento ni métricas publicadas en esta ficha: no es posible evaluar su robustez frente a distintos escáneres, protocolos o poblaciones.
- Idioma y modalidad limitados: solo procesa imagen médica; no hay soporte de texto, voz ni otras modalidades.
- Ecosistema restringido: depende de MLX y Apple Silicon; no hay binarios para CUDA ni para CPU x86 documentados.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta; el proyecto depende del ritmo de actualización de MedMLX.
- La revisión fijada en el ejemplo (`22f5e6dc...`) sugiere que conviene anclar versiones para reproducibilidad, ya que el repositorio puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MedMLX/medsam2-ct-lesion-mlx
- Repositorio GitHub de MedMLX: https://github.com/MedMLX/medsam2-mlx
- Documentación de ejecución: https://github.com/MedMLX/medsam2-mlx/blob/main/README.md#run
- Modelo base MedSAM2: https://huggingface.co/wanglab/MedSAM2
- Artículo MedSAM2 (arXiv): https://arxiv.org/abs/2504.03600
- Artículo MedMLX (medRxiv): https://doi.org/10.64898/2026.10.28.26366762
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Archivos del repositorio: https://huggingface.co/MedMLX/medsam2-ct-lesion-mlx/tree/main
