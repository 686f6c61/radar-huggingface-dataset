# 360ZhiNao/RPiAE

## Resumen

RPiAE (Representation-Pivoted Autoencoder) es un autoencoder orientado a representaciones latentes para generacion y edicion de imagenes, desarrollado por 360ZhiNao (grupo de vision de 360, 360CVGroup). Se publica bajo licencia Apache 2.0 y consta de un repositorio de 23,9 GB con pesos preentrenados y codigo de entrenamiento en PyTorch. El modelo se presenta como un componente de un pipeline de difusion latente en dos etapas: la primera entrena el autoencoder para obtener representaciones latentes de alta calidad y reconstruccion fiel; la segunda entrena un Diffusion Transformer (LightningDiT) sobre el espacio latente aprendido para generacion de imagenes condicionada por clase.

La propuesta tecnica central es el uso de una representacion pivot (apoyada en DINOv2-B como codificador, segun los nombres de configuracion `DINOv2-B_decXL_RPiAE`) combinada con un decodificador de mayor capacidad (`decXL`), lo que busca mejorar simultaneamente la calidad de reconstruccion y la utilidad del latente para generacion y edicion. El espacio latente configurado por defecto es `[64, 16, 16]`, es decir, 64 canales sobre una rejilla de 16x16 para imagenes de 256x256, con 1000 clases en ImageNet-1k.

Es relevante ahora porque aborda un cuello de botella clasico de la difusion latente: los autoencoders tipo VAE comprimen la imagen pero degradan detalle fino y estructura semantica, lo que limita la calidad de reconstruccion y la capacidad de edicion. RPiAE propone un autoencoder con pivote de representacion y publica tanto los pesos como el codigo de entrenamiento y evaluacion, aunque el codigo de entrenamiento texto-a-imagen (T2I) figura aun como pendiente en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder con codificador DINOv2-B y decodificador XL; pipeline de difusion latente con LightningDiT en etapa 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; latente de 64x16x16 para 256x256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; el modelo opera sobre imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoints de PyTorch descargables via `hf download`) |

## Arquitectura y entrenamiento

RPiAE se estructura en dos etapas. La etapa 1 entrena el autoencoder (variantes `RPiAE` y `RPiAE_VB`) para aprender representaciones latentes y reconstruccion de imagen; la configuracion preentrenada publicada es `DINOv2-B_decXL_RPiAE`, con un codificador DINOv2-B y un decodificador de mayor capacidad. El entrenamiento de la etapa 1 se divide en tres subetapas (`stage1`, `stage2`, `stage3`) y emplea un bloque `gan` con discriminador y planificacion de perdidas, lo que indica un esquema de entrenamiento adversarial combinado con la reconstruccion. Los datos de entrenamiento son ImageNet-1k, con particiones de entrenamiento y validacion configurables via `--data-path`.

La etapa 2 entrena un Diffusion Transformer (`LightningDiT`) en el espacio latente preentrenado de RPiAE para generacion condicionada por clase. La configuracion de referencia es `LightingDiT-XL_f16d64rpiae-v2b_vitxl` sobre ImageNet-256, con latente `[64, 16, 16]` y 1000 clases. El transporte se define como `Linear` con prediccion de `velocity`, y el muestreo se realiza mediante resolvedores ODE (por defecto 50 pasos) y SDE, con guiado configurable (`cfg` o `autoguidance`). La implementacion usa OmegaConf para configuracion, PyTorch 2.8.0 con CUDA 12.9 y soporte de entrenamiento multi-GPU y multi-nodo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO (no aplicable a un modelo de vision de este tipo).

## Capacidades

- Reconstruccion de imagenes de alta fidelidad a partir de representaciones latentes comprimidas (latente 64x16x16 para 256x256).
- Generacion de imagenes condicionada por clase (1000 clases de ImageNet-1k) mediante difusion latente con LightningDiT.
- Edicion de imagenes: el autor presenta el modelo como disenado para mejorar tanto generacion como edicion, apoyandose en el pivote de representacion.
- Muestreo configurable: resolvedores ODE y SDE, con numero de pasos ajustable (50 por defecto).
- Guiado configurable: classifier-free guidance (cfg) y autoguidance (AG), con escala ajustable.
- Entrenamiento y evaluacion reproducibles mediante scripts y configs YAML para etapa 1 (reconstruccion) y etapa 2 (generacion).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni modo thinking.

## Casos de uso

- Investigacion en autoencoders latentes: RPiAE sirve como banco de pruebas para estudiar como un pivote de representacion (DINOv2-B) afecta a la calidad del latente y a la reconstruccion, comparando con VAE clasicos en el mismo pipeline de difusion.
- Generacion de imagenes condicionada por clase en ImageNet-256: entrenar o afinar LightningDiT sobre el latente de RPiAE para producir imagenes de las 1000 clases, con control de pasos de muestreo y escala de guiado.
- Edicion de imagenes basada en latentes: al preservar mejor estructura y semantica en el espacio latente, el autoencoder puede emplearse como base para pipelines de edicion que operen directamente sobre representaciones comprimidas.
- Compresion y reconstruccion de imagenes: el autoencoder puede evaluarse como codec latente (64x16x16) para tareas de reconstruccion con fidelidad controlada, util en investigacion de compresion neuronal.
- Reproduccion de experimentos academicos: los scripts `run_train_stage1_*`, `run_sample_reconstruction_eval.sh` y `run_train_mult_diffusion.sh` permiten replicar los resultados del paper en entornos mono y multi-GPU.
- Base para texto-a-imagen (futuro): el repositorio declara como pendiente el codigo de entrenamiento T2I, por lo que RPiAE puede actuar como autoencoder de referencia en pipelines T2I una vez disponible esa parte.
- Evaluacion comparativa de autoencoders: usar la configuracion de reconstruccion para medir metricas de reconstruccion frente a otros autoencoders en el mismo conjunto de validacion de ImageNet-1k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 23,9 GB e incluye pesos de autoencoder y de LightningDiT-XL, por lo que la inferencia completa requiere cargar ambos componentes.
- GPU recomendadas: no especificadas en la informacion disponible; el entorno declara PyTorch 2.8.0 con CUDA 12.9 y soporte multi-GPU/multi-nodo.
- Ajuste en GPU de consumo: no disponible; el tamano del repositorio y el uso de un decodificador XL y un DiT-XL sugieren requisitos superiores a los de modelos pequenos, pero no se confirma.
- Opciones de despliegue: scripts propios en PyTorch (`torchrun`, `run_train_*`, `run_sample_reconstruction_eval.sh`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el muestreo por defecto usa 50 pasos ODE, lo que condiciona el coste de generacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / latente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RPiAE (360ZhiNao) | Autoencoder + DiT latente | no disponible | latente 64x16x16 (256x256) | Apache 2.0 | Pesos y codigo en HF/GitHub |
| VAE clasico (p. ej. SD-VAE) | Autoencoder latente | no disponible | latente 4x32x32 (tipico) | segun variante | Ampliamente disponible |
| DINOv2-B | Codificador visual | no disponible | no aplica | Apache 2.0 (variante) | Disponible en HF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de vision: no es un modelo de lenguaje; no soporta generacion de texto, tool calling ni agentes, pese a los tags genericos de Hugging Face.
- Idiomas: los metadatos declaran solo `en`, aunque al operar sobre imagenes el concepto de idioma es poco aplicable.
- Entrenamiento limitado a ImageNet-1k: la generacion condicionada por clase se circunscribe a las 1000 clases de ImageNet; no se documenta generalizacion a dominios abiertos.
- Codigo T2I pendiente: el repositorio marca como no completada la liberacion del codigo de entrenamiento texto-a-imagen, lo que limita su uso directo en pipelines T2I.
- Sin benchmarks publicados en la informacion disponible: no es posible verificar afirmaciones de calidad frente a alternativas.
- Riesgo de artefactos y alucinacion visual: como todo modelo generativo, puede producir imagenes incoherentes o no fieles a la clase solicitada; no se documentan sesgos especificos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias (DINOv2, ImageNet) y sus terminos asociados.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y soporte comunitario incipientes.
- Requisitos de computo no documentados: la ausencia de guias de VRAM y latencia complica la planificacion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/RPiAE
- Hugging Face (organizacion): https://huggingface.co/qihoo360/RPiAE
- GitHub: https://github.com/360CVGroup/RPiAE
- Project page: https://arthuring.github.io/RPiAE-page/
- arXiv: https://arxiv.org/abs/2603.19206
