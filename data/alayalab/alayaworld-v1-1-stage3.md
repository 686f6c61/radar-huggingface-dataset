# AlayaLab/AlayaWorld-v1.1-stage3

## Resumen

AlayaWorld v1.1-stage3 es un estudiante destilado de generación de vídeo image-to-video desarrollado por AlayaLab. Se trata de un LoRA de destilación DMD (Distribution Matching Distillation) de rango 256 que se monta sobre el profesor autorregresivo AlayaWorld v1.1-stage2b, permitiendo inferencia en tan solo 4 pasos. El modelo se enmarca en la categoría de "world models" aplicados a vídeo, es decir, modelos que aprenden la dinámica temporal de una escena para predecir fotogramas coherentes a partir de una imagen inicial.

La relevancia de esta etapa radica en la reducción drástica del coste de inferencia: pasar de un modelo profesor autorregresivo a un estudiante de 4 pasos hace viable la generación de vídeo en tiempo casi real, un requisito habitual en pipelines interactivos. El repositorio ocupa 2,7 GB e incluye únicamente los pesos del LoRA (2,5 GB) y un codificador de historial de fotogramas comprimido (33 MB), por lo que no es autónomo: requiere descargar el profesor stage2b como base.

La arquitectura subyacente es de tipo difusión (pipeline `AlayaWorldPipeline` en diffusers), con un componente autorregresivo para el modelado de la historia de fotogramas. La licencia es la LTX-2 Community License Agreement, heredada del ecosistema Lightricks LTX-2, lo que condiciona el uso comercial. No se especifican idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión image-to-video con profesor autorregresivo y estudiante destilado DMD (LoRA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (license: other) |
| Formato de pesos | safetensors (LoRA, rango 256) y PyTorch (.pt para el codificador de historial) |

## Arquitectura y entrenamiento

El modelo es un estudiante de destilación por coincidencia de distribuciones (DMD) construido sobre un profesor autorregresivo (stage2b). La generación se articula en un pipeline de difusión para image-to-video que incorpora un codificador de historial de fotogramas comprimido (`history_encoder.pt`, 33 MB), encargado de resumir los fotogramas previos para mantener la coherencia temporal. El estudiante se materializa como un LoRA de rango 256 (2,5 GB) que modifica los pesos del profesor para permitir muestreo en 4 pasos.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO; la model card solo indica el proceso de destilación DMD y la dependencia del profesor stage2b. La innovación técnica destacable es precisamente la destilación few-step (4 pasos) orientada a inferencia en tiempo real, junto con el codificador de historial comprimido que reduce el coste de mantener contexto visual a lo largo de la secuencia.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video) con control de cámara, según el config de inferencia `infer_i2v_camera.yaml`.
- Inferencia en 4 pasos gracias a la destilación DMD, orientada a escenarios de baja latencia.
- Modelado de mundo ("world model"): mantiene coherencia temporal mediante un codificador de historial de fotogramas.
- Integración con la librería diffusers a través de `AlayaWorldPipeline`.
- Soporte de ajuste fino y validación mediante los scripts del repositorio oficial (`scripts/finetune/train.sh`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Previsualización interactiva de vídeo: el estudiante de 4 pasos permite generar clips cortos a partir de una imagen con latencia reducida, adecuado para herramientas de storyboard donde el usuario itera sobre la marcha.
- Simulación de trayectorias de cámara: el config `infer_i2v_camera.yaml` sugiere control explícito de movimiento de cámara, útil para previsualizar planos en producción audiovisual.
- Prototipado de videojuegos y entornos sintéticos: un world model que predice fotogramas coherentes sirve para generar secuencias de referencia antes de invertir en renderizado en tiempo real.
- Investigación en destilación de modelos de difusión: el par profesor/estudiante y el LoRA DMD son un caso de estudio reproducible para experimentos de few-step sampling.
- Ajuste fino sobre dominios verticales: al ser un LoRA sobre el profesor, equipos con datos propios pueden adaptar el estudiante manteniendo el coste de inferencia bajo.
- Generación de material de demostración y contenido editorial: clips image-to-video para piezas cortas donde prima el coste por fotograma sobre la fidelidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 2,7 GB, pero la inferencia requiere además cargar el profesor stage2b como base, por lo que el consumo real es sustancialmente mayor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: pipeline `AlayaWorldPipeline` de diffusers y scripts de entrenamiento/validación del repositorio oficial de AlayaLab; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput: solo se indica inferencia en 4 pasos y orientación a tiempo real; no se aportan cifras de latencia ni de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|
| AlayaWorld v1.1-stage3 | Estudiante DMD (LoRA) sobre profesor AR | 4 | LTX-2 Community License | Hugging Face (requiere stage2b) |
| AlayaWorld v1.1-stage2b | Profesor autorregresivo | no disponible | LTX-2 Community License | Hugging Face |
| LTX-2 (Lightricks) | Difusión de vídeo | no disponible | LTX-2 Community License | Ecosistema Lightricks |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es autónomo: requiere descargar el profesor `AlayaLab/AlayaWorld-v1.1-stage2b` como base, lo que duplica el espacio en disco y complica el despliegue.
- La licencia LTX-2 Community License Agreement impone condiciones específicas; debe revisarse antes de cualquier uso comercial.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al tratarse de generación de vídeo, el riesgo principal es la deriva temporal y la inconsistencia visual en secuencias largas.
- La ventana de contexto (número de fotogramas de historial) no está especificada, lo que limita la planificación de memoria en producción.
- No hay benchmarks publicados que permitan validar la calidad frente a alternativas.
- El uso de solo 4 pasos de muestreo puede implicar una pérdida de fidelidad frente al profesor en escenas complejas; no se cuantifica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlayaLab/AlayaWorld-v1.1-stage3
- Profesor base (stage2b): https://huggingface.co/AlayaLab/AlayaWorld-v1.1-stage2b
- Repositorio oficial: https://github.com/AlayaLab/AlayaWorld
- Informe introductorio: https://arxiv.org/abs/2607.06291
- Informe completo: https://arxiv.org/abs/2607.18367
- Informe v1.1: https://arxiv.org/abs/2608.13492
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
