# MIC-DKFZ/nnFoundationViT

## Resumen

nnFoundationViT es un modelo fundacional 3D para radiologia desarrollado por el MIC-DKFZ (German Cancer Research Center, DKFZ). Forma parte de la familia nnFoundation, compuesta por dos modelos complementarios: una red convolucional (nnFoundationCNN, 102 M de parametros) y este transformer de vision (674 M de parametros). Ambos se preentrenaron con el framework de aprendizaje autosupervisado nnssl, disenado especificamente para vision medica 3D.

El modelo emplea la arquitectura Primus, un transformer de vision adaptado a volumenes 3D, con 40 capas, dimension de embedding 1056, 16 cabezas de atencion y tokenizacion mediante parches de 8 x 8 x 8. Su proposito es servir como punto de partida para tareas de segmentacion medica (y, en el futuro, deteccion, clasificacion y generacion de informes), reduciendo la necesidad de grandes volumenes de datos etiquetados en cada tarea downstream.

Es relevante ahora porque ofrece un componente de vision 3D preentrenado de forma autosupervisada que se integra directamente en el flujo de trabajo de nnU-Net, permitiendo el ajuste fino desde checkpoints nnssl con un unico comando. El modelo tiene 674 M de parametros activos totales (no es MoE) y se distribuye bajo licencia cc-by-sa-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Primus (transformer de vision 3D, tipo ViT) |
| Parametros totales | 674 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; entrada como volumen 3D, parche recomendado de 192 x 192 x 192) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | PyTorch (torch.save), archivo checkpoint_final.pth |

Detalles adicionales de la arquitectura Primus: 40 capas, dimension de embedding 1056, 16 cabezas de atencion y tokens de parche de 8 x 8 x 8.

## Arquitectura y entrenamiento

El modelo se basa en Primus (referencia arXiv:2503.01835), una arquitectura transformer de vision adaptada a imagenes medicas volumetricas. Procesa volumenes 3D de un solo canal mediante tokenizacion en parches de 8 x 8 x 8, con 40 capas de atencion, dimension de embedding de 1056 y 16 cabezas. El preentrenamiento se realizo con el framework nnssl (MIC-DKFZ/nnssl), que aplica aprendizaje autosupervisado a vision medica 3D. Segun la model card, el preentrenamiento se apoya en el dataset OpenMind (Wald et al., ICCV 2025).

El modelo forma pareja con nnFoundationCNN, una red convolucional basada en ResEnc (arXiv:2404.09556) con 6 etapas y features 32-64-128-256-320-320 (102 M de parametros). El checkpoint distribuido (checkpoint_final.pth) es un diccionario de torch.save cargable con weights_only=True y contiene tres claves: network_weights (el state_dict preentrenado), nnssl_adaptation_plan (el plan de arquitectura y preprocesamiento) y citations (referencias a citar). El repositorio incluye tambien adaptation_plan.json (plan de arquitectura y preprocesamiento que nnU-Net lee para confirmar compatibilidad) y config.json (marcador para que el Hub registre descargas). No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de vision).

## Capacidades

- Extraccion de caracteristicas de volumenes 3D de imagen medica (radiologia) de un solo canal.
- Preentrenamiento autosupervisado orientado a servir de base para segmentacion medica 3D.
- Ajuste fino para tareas downstream de segmentacion mediante la integracion con nnU-Net.
- Preprocesamiento integrado: entrada esperada como volumenes 3D normalizados con Z-score y sin remuestreo.
- Compatibilidad con el flujo de planificacion de nnU-Net: puede usarse como checkpoint preentrenado con el parametro `-am like_pretrained` y `nnUNetv2_preprocess_like_nnssl`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales adicionales: el ajuste fino para deteccion, clasificacion y generacion de informes aparece marcado como "TBA" (pendiente) en la model card.

## Casos de uso

- Segmentacion de organos y lesiones en TC o RM: el modelo se usa como inicializacion preentrenada y se ajusta fino con nnU-Net sobre el dataset etiquetado del usuario, aprovechando las caracteristicas aprendidas de forma autosupervisada.
- Segmentacion con datos etiquetados escasos: al partir de un checkpoint preentrenado en grandes volumenes de imagen sin etiquetas, reduce el volumen de anotaciones necesario para obtener resultados utiles en una tarea concreta.
- Investigacion en radiologia: proporciona un backbone 3D estandarizado y reproducible sobre el que comparar tecnicas de segmentacion y, a futuro, deteccion y clasificacion.
- Preprocesamiento y planificacion automatizada: mediante `nnUNetv2_preprocess_like_nnssl` con `-am like_pretrained`, el modelo se integra en el pipeline de nnU-Net para alinear el preprocesamiento con el preentrenamiento.
- Desarrollo de pipelines de imagen medica 3D: sirve como componente de extraccion de caracteristicas para volumenes de entrada de 192 x 192 x 192, normalizados con Z-score y sin remuestreo.
- Punto de partida para modelos multimodales o multitarea en radiologia: al estar disenado para ajuste fino con nnU-Net, se puede reutilizar como base para tareas de clasificacion o deteccion cuando esas integraciones esten disponibles.
- Comparacion de arquitecturas CNN frente a transformer en vision medica 3D: al compartir familia con nnFoundationCNN (misma receta de preentrenamiento, distinta arquitectura), permite evaluar el rendimiento relativo de un transformer (Primus) frente a una CNN (ResEnc) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint: 2,7 GB en el repositorio, coherente con 674 M de parametros en fp32 (aproximadamente 2,7 GB de pesos). En fp16/bf16 los pesos ocuparian aproximadamente 1,35 GB.
- VRAM total para inferencia: depende del tamano de parche y del batch, no especificados en la model card. Con el parche recomendado de 192 x 192 x 192, la memoria de activaciones es el factor dominante frente al peso de los parametros; no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el footprint de pesos (2,7 GB en fp32) es reducido, pero la viabilidad depende de la memoria de activaciones, no documentada.
- Opciones de despliegue: integracion con nnU-Net (ajuste fino desde checkpoints nnssl) y descarga directa del checkpoint con `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nnFoundationViT | Primus (ViT 3D), 40 capas, embedding 1056, 16 cabezas, parches 8³ | 674 M | nnssl (autosupervisado) | cc-by-sa-4.0 | HuggingFace (MIC-DKFZ/nnFoundationViT) |
| nnFoundationCNN | ResEnc, 6 etapas, features 32-64-128-256-320-320 | 102 M | nnssl (autosupervisado) | cc-by-sa-4.0 | HuggingFace (MIC-DKFZ/nnFoundationCNN) |
| Otros modelos fundacionales de imagen medica 3D | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de vision medica: no es un modelo de lenguaje, por lo que no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Dominio restringido a radiologia 3D: la entrada esperada son volumenes 3D de un solo canal, normalizados con Z-score y sin remuestreo; no se contemplan otros formatos.
- Rendimiento downstream no documentado: no hay resultados de benchmarks publicados en la informacion disponible, por lo que el rendimiento real en tareas concretas no puede verificarse a priori.
- Estado incompleto de la familia: deteccion, clasificacion y generacion de informes figuran como "TBA" (pendiente), de modo que solo la segmentacion tiene flujo de ajuste fino documentado.
- Licencia cc-by-sa-4.0: se trata de una licencia con clausula de compartir igual (ShareAlike), que puede imponer condiciones sobre las obras derivadas; conviene revisar su compatibilidad antes de un uso comercial.
- Atribucion obligatoria: el uso de los pesos o del framework nnssl requiere citar los trabajos correspondientes (nnFoundation y OpenMind).
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existe riesgo de errores de segmentacion no documentados.
- Limitaciones de contexto o idioma: no aplican en el sentido de modelos de lenguaje; la "ventana" viene determinada por el parche volumetrico de entrada (recomendado 192 x 192 x 192).
- Caveat de produccion: el modelo es un backbone de investigacion preentrenado; se requiere ajuste fino por tarea y no se recomienda su uso clinico directo sin validacion adicional, algo que la propia model card no garantiza.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/MIC-DKFZ/nnFoundationViT
- HuggingFace del modelo hermano (CNN): https://huggingface.co/MIC-DKFZ/nnFoundationCNN
- Framework nnssl: https://github.com/MIC-DKFZ/nnssl
- Documentacion de nnU-Net para ajuste fino desde checkpoints nnssl: https://github.com/MIC-DKFZ/nnUNet/blob/master/documentation/finetuning_from_nnssl_checkpoints.md
- Paper nnFoundation (arXiv:2609.26924): https://arxiv.org/abs/2609.26924
- Paper ResEnc (arXiv:2404.09556): https://arxiv.org/abs/2404.09556
- Paper Primus (arXiv:2503.01835): https://arxiv.org/abs/2503.01835
- Paper OpenMind (Wald et al., ICCV 2025): referencia en la model card, sin URL directa en la informacion disponible
