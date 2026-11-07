# CaiYuanhao/MST

## Resumen

MST (Mask-guided Spectral-wise Transformer) es un modelo de reconstruccion de imagenes hiperespectrales (HSI) a partir de mediciones comprimidas, desarrollado por Yuanhao Cai en el contexto de su investigacion doctoral en la Johns Hopkins University. El repositorio de Hugging Face `CaiYuanhao/MST` contiene pesos con licencia Apache 2.0, mientras que el codigo de entrenamiento e inferencia se distribuye en el repositorio de GitHub `caiyuanhao1998/MST`, descrito por el autor como "a toolbox for spectral compressive imaging".

A diferencia de los modelos generativos de lenguaje, MST aborda un problema de vision por computador: la reconstruccion de cubos hiperespectrales a partir de capturas comprimidas (spectral compressive imaging, SCI). La arquitectura se basa en un transformer con atencion espectral (spectral-wise self-attention), que explota la alta correlacion entre bandas espectrales para recuperar la senal original. El modelo se entrena con una mascara de muestreo que modela el patron de adquisicion del sensor.

La relevancia actual del modelo radica en su aplicacion a sistemas de imagen hiperespectral de bajo coste, donde una unica captura 2D codificada permite reconstruir decenas de bandas espectrales mediante inferencia. El repositorio de Hugging Face no incluye model card descriptiva (solo la licencia), por lo que la mayor parte de la informacion tecnica procede del repositorio de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion espectral (spectral-wise self-attention), Mask-guided Spectral-wise Transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.5 GB; el codigo de GitHub sugiere checkpoints PyTorch) |

## Arquitectura y entrenamiento

MST es un transformer disenado especificamente para imagenes hiperespectrales. Su componente central es un mecanismo de atencion espectral que calcula la similitud entre tokens a lo largo de la dimension espectral, en lugar de la dimension espacial. Esto se justifica porque en HSI las bandas adyacentes presentan una correlacion muy alta, mientras que la variabilidad espacial es mayor. El modelo incorpora ademas una mascara de muestreo (mask-guided) que codifica el patron de adquisicion del sensor compresivo, de modo que la red aprende a invertir la codificacion fisica del sistema de captura.

El entrenamiento se realiza sobre pares de mediciones comprimidas y cubos hiperespectrales de referencia. El repositorio de GitHub del autor incluye el codigo de entrenamiento en `MST/real/train_code/exp/`, con scripts como `train_s.py` para metodos alternativos a BiSRNet, y menciona la disponibilidad de logs de entrenamiento, modelos entrenados y HSI reconstruidas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Reconstruccion de imagenes hiperespectrales a partir de una unica captura comprimida 2D.
- Modelado de correlaciones espectrales mediante atencion a lo largo del eje de bandas.
- Integracion de la mascara de muestreo del sensor en el proceso de inferencia.
- Aplicable a pipelines de "spectral compressive imaging" con distintos metodos de muestreo (el codigo soporta variantes como BiSRNet y otras).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo multilingue ni generativo de texto.

## Casos de uso

- Reconstruccion de cubos hiperespectrales en laboratorio: a partir de una captura codificada por una camara de apertura codificada (CASSI), el modelo invierte la medicion y devuelve el cubo HSI para analisis espectral posterior.
- Imagen hiperespectral de bajo coste: permite sustituir sensores de barrido por una unica exposicion 2D mas reconstruccion por red, reduciendo el coste hardware y el tiempo de adquisicion.
- Analisis remoto de materiales: la reconstruccion de decenas de bandas permite clasificar materiales o detectar firmas espectrales en escenas capturadas con un sensor compresivo.
- Investigacion en vision espectral: el repositorio de GitHub sirve como toolbox para comparar metodos de reconstruccion (BiSRNet y alternativas) bajo el mismo pipeline de entrenamiento.
- Prototipado en laboratorios con recursos GPU limitados: el autor indica que `train_s.py` permite entrenar metodos alternativos cuando no se dispone de la mascara o de GPU potentes.
- Validacion de sistemas de captura: las HSI reconstruidas y los logs publicados en `MST/real/train_code/exp/` permiten reproducir y auditar resultados experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Hugging Face no incluye model card con metricas, y la busqueda web solo referencia el codigo y los logs de entrenamiento en GitHub, sin cifras de PSNR, SAM o SSIM verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repo (0.5 GB) sugiere checkpoints de un transformer de escala moderada, pero no se especifica el numero de parametros.
- GPU recomendadas: no disponible. El autor menciona en GitHub la existencia de usuarios con "limited GPU resources", lo que implica que el entrenamiento completo puede requerir GPUs de gama alta, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el codigo de GitHub esta orientado a PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MST (CaiYuanhao) | Transformer espectral para SCI | no disponible | no aplica | Apache 2.0 | Hugging Face + GitHub |
| BiSRNet | Red para SCI (referenciada en el repo) | no disponible | no aplica | no disponible | Referenciada en GitHub del autor |
| Metodos alternativos en `train_s.py` | Varios | no disponible | no aplica | no disponible | GitHub del autor |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card de Hugging Face solo contiene la licencia; no hay documentacion de uso, limitaciones ni sesgos.
- El modelo esta especializado en reconstruccion hiperespectral; no es un modelo de lenguaje ni de proposito general.
- No se especifican sesgos conocidos, pero al ser un modelo de vision entrenado sobre datasets concretos, puede generalizar mal fuera de la distribucion de escenas y sensores de entrenamiento.
- Riesgo de artefactos de reconstruccion en escenas con baja relacion senal-ruido o patrones de mascara distintos a los de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio de Hugging Face tiene 0 descargas y 1 like, lo que indica ausencia de validacion comunitaria.
- No hay informacion sobre el formato exacto de los pesos ni instrucciones de carga desde Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/CaiYuanhao/MST
- GitHub del proyecto: https://github.com/caiyuanhao1998/MST
- Perfil del autor en GitHub: https://github.com/caiyuanhao1998
