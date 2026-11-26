# Is14w/SeisGRIP-TGRS

## Resumen

SeisGRIP es un modelo de aprendizaje profundo auto-supervisado disenado para la supresion del ground roll (ruido coherente de baja frecuencia) en datos sismicos. Lo desarrolla un equipo academico encabezado por Hanwen Tao, Huanbin Zhou, Hongzhou Wang y Shengheng Liu, y se publica como parte del articulo "SeisGRIP: Geometry-Guided Ground-Roll Suppression with Self-Supervised Pretraining" en IEEE Transactions on Geoscience and Remote Sensing (TGRS). No es un modelo de lenguaje: es un modelo de vision/procesamiento de senal sismica basado en una arquitectura Swin Transformer V2.

El sistema se compone de dos etapas: un modelo de recuperacion densa (SwinV2 con channel-LN, inicializado desde un preentrenamiento auto-supervisado tipo MFP) que reconstruye las trazas limpias, y una cabeza de localizacion RCGH (Region-Constrained Geometry Head) con backbone congelado que predice la geometria del ground roll para aplicar una mascara regional. El checkpoint principal ocupa 588,21 MB y la cabeza 8,94 MB, lo que da un tamano total de repositorio de 0,6 GB.

Su relevancia radica en que aborda un problema clasico y costoso en el procesamiento sismico (la atenuacion del ground roll) mediante un enfoque guiado por geometria y auto-supervisado, con metricas verificadas de SNR referenciada al objetivo de hasta 23,621 dB y SSIM de 0,999422 en validacion emparejada de 300 ventanas, ademas de una tasa de verdaderos negativos del 100 % en la localizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (dense channel-LN) para recuperacion + cabeza RCGH sobre backbone congelado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de procesamiento de senal sismica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en precision completa, formato .pth/.pt) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_500.pth`, `best_feasible_head.pt`) |

## Arquitectura y entrenamiento

La etapa 1 (`best_500.pth`) es un modelo de recuperacion densa basado en Swin Transformer V2 con normalizacion de capa por canal (channel-LN), inicializado a partir de un preentrenamiento auto-supervisado tipo MFP (Masked Field Prediction). La etapa 2 (`best_feasible_head.pt`) es una cabeza de localizacion RCGH con backbone congelado que emplea una mascara de presencia global con forma `symmetric_trapezoid`. El pipeline completo aplica primero la localizacion de la geometria del ground roll y despues una recuperacion regional (parametros `tau_p=0.5`, `tau_LF=0.2`, `d=16`).

El entrenamiento combina preentrenamiento auto-supervisado (sin etiquetas) con una fase supervisada para la cabeza de localizacion. La model card no detalla el numero de tokens ni la composicion exacta del dataset sismico utilizado; solo se indica que la validacion se realiza sobre 300 ventanas emparejadas y sobre un gather de campo reservado (held-out). La innovacion principal es el enfoque guiado por geometria (geometry-guided) que restringe la recuperacion a la region afectada por el ground roll, evitando danar senal de baja frecuencia legitima (0 falsos vetos de baja frecuencia reportados).

## Capacidades

- Supresion del ground roll en gathers sismicos 2D/3D mediante recuperacion densa de trazas.
- Recuperacion completa de ventana (full-window recovery) con SNR referenciada al objetivo de 20,449 dB y SSIM de 0,998776.
- Recuperacion regional guiada por geometria con SNR de 23,621 dB y SSIM de 0,999422.
- Localizacion de la geometria del ground roll (RCGH): recall positivo del 98,79 %, tasa de verdaderos negativos del 100 %, error L1 de esquina de 1,47 muestras e IoU de mascara dura de 0,8980.
- Inferencia zero-shot sobre datos de campo mediante el script `reproduce_seisgrip_demo.py`.
- Veto de baja frecuencia seguro (0 falsos vetos reportados en la evaluacion).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Procesamiento de sismica de reflexion en exploracion petrolera y gasifera: aplicar SeisGRIP como paso de preprocesado para atenuar el ground roll antes de la migracion y el apilado, mejorando la relacion senal-ruido de los gathers de campo.
- Sismica de refraccion somera e ingenieria civil: suprimir el ruido de baja velocidad y baja frecuencia en estudios de caracterizacion del subsuelo, donde el ground roll domina el registro.
- Monitorizacion sismica pasiva y microsismica: limpiar registros contaminados por ruido superficial coherente antes de la deteccion de eventos.
- Investigacion en geofisica computacional: usar los checkpoints como baseline reproducible (licencia MIT) para comparar tecnicas de supresion de ground roll con aprendizaje auto-supervisado.
- Pipelines de adquisicion en campo: integrar la inferencia zero-shot sobre ficheros `.npz` para control de calidad rapido de gathers recien adquiridos.
- Sismica de alta resolucion y estudios de peligrosidad: preservar senal de baja frecuencia legitima (gracias al veto seguro) mientras se elimina el ruido de superficie, algo critico en inversiones que dependen de bajas frecuencias.

## Benchmarks y rendimiento

| Metrica | Full-window recovery | Regional recovery (SeisGRIP) |
|---|---|---|
| SNR referenciada al objetivo (dB) | 20,449 | 23,621 |
| SSIM | 0,998776 | 0,999422 |
| MSE | 1,111e-5 | 5,351e-6 |

| Metrica de localizacion RCGH | Valor |
|---|---|
| Recall positivo | 98,79 % |
| Tasa de verdaderos negativos | 100,0 % |
| Error L1 de esquina (muestras) | 1,47 |
| IoU de mascara dura | 0,8980 |
| Falsos vetos de baja frecuencia | 0 |

Evaluacion sobre 300 ventanas emparejadas de validacion y un gather de campo reservado. No se dispone de comparacion con otros metodos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del checkpoint (588 MB en precision completa) la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende de la resolucion del gather de entrada.
- GPU recomendadas: no especificadas en la model card. Cualquier GPU con suficiente memoria para el tensor de entrada (RTX 3090/4090, A100, H100) deberia poder ejecutar la inferencia.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano reducido de los pesos (menos de 1 GB en total).
- Opciones de despliegue: scripts Python del repositorio `Is14w/Citrus` (`reproduce_seisgrip_demo.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros metodos de supresion de ground roll ni con modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo de dominio especifico (sismica): no es un modelo de lenguaje ni de proposito general; no puede usarse para tareas de texto, codigo o vision natural.
- La model card no documenta sesgos, riesgos de alucinacion ni comportamiento fuera de la distribucion de datos sismicos de entrenamiento.
- El rendimiento verificado procede de 300 ventanas de validacion y un gather de campo; la generalizacion a otras geometrias de adquisicion, litologias o equipos no esta cuantificada.
- No se detalla la composicion del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos hacia determinadas condiciones de campo.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda citar el articulo de IEEE TGRS en trabajos derivados.
- Los pesos estan en formato PyTorch (`.pth`/`.pt`); no se ofrecen versiones GGUF ni ONNX, lo que limita el despliegue en entornos no Python.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema de validacion externa muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Is14w/SeisGRIP-TGRS
- Repositorio de codigo: https://github.com/Is14w/Citrus
- Articulo: SeisGRIP: Geometry-Guided Ground-Roll Suppression with Self-Supervised Pretraining, Hanwen Tao, Huanbin Zhou, Hongzhou Wang, Shengheng Liu, IEEE TGRS (enlace directo no disponible en la informacion proporcionada)
