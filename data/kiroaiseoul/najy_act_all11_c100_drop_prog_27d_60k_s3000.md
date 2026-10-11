# kiroaiseoul/NAJY_act_all11_c100_drop_prog_27D_60k_s3000

## Resumen

NAJY_act_all11_c100_drop_prog_27D_60k_s3000 es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers) publicado por el usuario kiroaiseoul en HuggingFace, dentro del ecosistema LeRobot. No es un modelo de lenguaje: es una política de imitación (behavior cloning) que mapea observaciones multimodales a comandos de acción de un robot. El modelo ocupa 0,2 GB en el repositorio y contiene 51.701.393 parámetros almacenados en un único `model.safetensors`.

La entrada del modelo combina estado propioceptivo de 27 dimensiones (`observation.state`) con tres flujos de imagen RGB de 480x640 píxeles (`observation.images.cam_high`, `observation.images.cam_left_wrist` y `observation.images.cam_right_wrist`), y produce una acción de 17 dimensiones (`action`). Se entrenó durante 60.000 pasos dentro del run `t32_all11_c100_drop_prog_60k_s3000`, etiquetado como "11 etapas" (11단계) y ejecutado en una unidad DGX. Los tags `trossen-mobile-ai` y el número de dimensiones de acción sugieren un robot móvil de manipulación, aunque la model card no especifica la plataforma exacta.

El propio autor indica que la subida tiene fines de análisis y puntuación ("분석·채점용 업로드") y que no implica la confirmación de un candidato a despliegue real. La licencia es Apache-2.0 y el checkpoint se publicó sin descargas ni valoraciones en el momento de la consulta, por lo que se trata de un artefacto de investigación más que de un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación del ecosistema LeRobot |
| Parametros totales | 51.701.393 (~51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre chunks de acción; el horizonte no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Dimension de observacion (estado) | 27 |
| Camaras de entrada | 3 (cam_high, cam_left_wrist, cam_right_wrist), 3x480x640 cada una |
| Dimension de accion | 17 |
| Paso del checkpoint | 60000 |
| Tamano del repositorio | 0,2 GB |
| SHA256 de `model.safetensors` | 9c20283cfca32a3b2af96806c4db221fb41f9ff0777168e2f71607096119cc6a |
| Libreria | lerobot |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación propuesto en el trabajo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*. La formulación habitual combina un codificador visual (backbone convolucional) con un transformer encoder-decoder que predice un "chunk" de acciones futuras en lugar de un único paso, y durante el entrenamiento emplea un esquema tipo CVAE con una variable latente de estilo. La model card únicamente confirma el tag `act` y el conteo de parámetros de 51.701.393; no detalla la configuración interna (número de capas, dimensión del modelo, tamaño del backbone visual ni horizonte de predicción), por lo que esos datos quedan como no disponibles.

Sobre el entrenamiento solo se documenta el identificador del run (`t32_all11_c100_drop_prog_60k_s3000`), el paso final (60000) y la máquina empleada (DGX, "1호기"). El manifiesto asociado declara dos banderas en su primer elemento: `progress: true` e `image_dropout: {"all": 0.3}`, lo que indica que durante el entrenamiento se aplicó un 30% de dropout a todas las imágenes de entrada. No se especifican el número de tokens o episodios, la composición del dataset, el robot objetivo ni si hubo fases de ajuste posteriores (RLHF/DPO no aplicables en este dominio). La model card no incluye log de entrenamiento: el campo reservado a la primera línea del log aparece como `?`.

## Capacidades

- Política de imitación robótica: genera comandos de acción de 17 dimensiones a partir de estado propioceptivo y percepción visual.
- Percepción multimodal con tres cámaras simultáneas (vista superior y dos muñecas), lo que permite manipulación bimanual con contexto visual amplio.
- Predicción por chunks de acción (action chunking), típica de ACT, orientada a movimientos suaves y coherentes en lugar de control paso a paso.
- Robustez parcial a oclusión o pérdida de imagen gracias al entrenamiento con `image_dropout` del 30% sobre todas las cámaras.
- Ejecución de políticas multi-etapa, coherente con la etiqueta de "11 etapas" (11단계) del run.
- Integración con herramientas de LeRobot: el checkpoint mantiene la estructura `pretrained_model`, por lo que puede cargarse directamente en utilidades del ecosistema (por ejemplo, `stage_cond_diag.py`).
- Verificación de integridad mediante SHA256 declarado en la model card.
- No dispone de tool calling, capacidades de agente, generación de texto, visión general, audio ni soporte multilingüe; no es un modelo de lenguaje.

## Casos de uso

- Manipulación bimanual sobre plataforma móvil: con tres cámaras y 17 dimensiones de acción, el modelo encaja en tareas de recogida y colocación que requieren coordinar dos brazos y una base móvil, siempre que el robot coincida con la morfología usada en el entrenamiento.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para estudiar el efecto del dropout de imagen (30%) sobre la robustez de políticas ACT.
- Evaluación y comparación de checkpoints: la model card está pensada para análisis y puntuación, y el manifiesto `multi_manifest.json` en la misma carpeta permite leer las banderas de configuración con la herramienta de scoring del autor.
- Reproducibilidad de experimentos: el SHA256 publicado permite verificar que el fichero descargado coincide con el artefacto entrenado antes de reutilizarlo en pipelines internos.
- Ajuste fino sobre un robot propio: al ser un checkpoint ACT con licencia Apache-2.0, puede partirse de él para reentrenar sobre un dataset nuevo, aunque la política final dependerá de que las dimensiones de estado y acción coincidan.
- Docencia y demostraciones: al ocupar solo 0,2 GB y ~51,7 M de parámetros, es un ejemplo ligero para ilustrar políticas transformer en robótica en cursos o talleres.
- Diagnóstico de etapas de entrenamiento: la marca de "11 etapas" y el paso 60000 permiten analizar la evolución de la política dentro de una campaña de entrenamiento más larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el modelo ocupa aproximadamente 207 MB de pesos; en FP16/BF16, unos 103 MB. Con activaciones y tres flujos de imagen a 480x640, un presupuesto de 1-2 GB de VRAM es holgado (estimación propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve, incluidas GTX 1650, RTX 3050 o superiores. No requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en GPUs integradas. También puede ejecutarse en CPU para pruebas lentas, aunque la inferencia en tiempo real sobre el robot exige GPU.
- Opciones de despliegue: el stack natural es LeRobot sobre PyTorch. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El autor no publica medidas de frecuencia de control ni latencia por chunk de acción.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_drop_prog_27D_60k_s3000 | ACT (LeRobot) | 51,7 M | no disponible | Apache-2.0 | HuggingFace |
| ACT de referencia (LeRobot / Aloha) | ACT (LeRobot) | no disponible | no disponible | Apache-2.0 (proyecto LeRobot) | Repositorio LeRobot |
| Diffusion Policy | Política por difusión (LeRobot) | no disponible | no disponible | Apache-2.0 (proyecto LeRobot) | Repositorio LeRobot |
| Otras políticas LeRobot (VQ-BeT, TD-MPC, pi0) | Diversas | no disponible | no disponible | no disponible | Repositorio LeRobot |

No se dispone de cifras de rendimiento comparables publicadas para este checkpoint, por lo que la comparación se limita a la categoría de política y a la licencia.

## Limitaciones y advertencias

- Es un checkpoint subido explícitamente para análisis y puntuación; el autor advierte de que no equivale a un candidato de despliegue confirmado en un robot real.
- No hay resultados de benchmarks ni tasas de éxito publicadas, por lo que se desconoce su rendimiento fuera de la distribución de entrenamiento.
- La política está ligada a la morfología del robot y al dataset de entrenamiento: las dimensiones de estado (27) y acción (17) deben coincidir para que el modelo sea utilizable. La model card no identifica la plataforma exacta.
- El entrenamiento aplicó `image_dropout` del 30% sobre todas las cámaras, lo que puede reducir la sensibilidad a detalles visuales finos a cambio de robustez; conviene validarlo en el caso de uso concreto.
- No hay información sobre sesgos, composición del dataset ni cobertura de escenarios, lo que dificulta evaluar riesgos de comportamiento fuera de lo visto en entrenamiento.
- No se especifican los requisitos de seguridad física para desplegar la política en hardware real; cualquier uso en robot debe acompañarse de límites de par, paradas de emergencia y supervisión.
- Riesgo de alucinación en el sentido habitual de los modelos de lenguaje: no aplica. El riesgo análogo es la generalización incorrecta de acciones ante situaciones no vistas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no se documenta el origen del dataset de entrenamiento ni posibles restricciones derivadas de los datos.
- El campo de idiomas no está disponible y el modelo no procesa texto.

## Enlaces

- HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_drop_prog_27D_60k_s3000
- Referencia citada en la model card: `trossen-ai-simulation`, `docs/mobile_base_investigation.md`, sección §94 (URL no disponible en la información proporcionada)
- Documentación del ecosistema LeRobot: URL no disponible
