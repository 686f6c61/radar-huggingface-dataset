# ShilongZou/Pelican-Sim1.0

## Resumen

Pelican-Sim 1.0 es un modelo del mundo (world model) accion-condicionado desarrollado por el WFM System Group del Beijing Innovation Center of Humanoid Robotics (X-Humanoid). Dado un fotograma RGB inicial, una trayectoria articular de robot y una instruccion en lenguaje natural, el modelo predice el vídeo futuro de la escena, actuando como simulador neuronal para evaluacion y optimizacion de politicas de robotica. Se libera como un checkpoint unico que cubre robots de pinza paralela, manos diestras, brazos unicos y configuraciones bimanuales mediante un layout canonico de acciones de 28 dimensiones.

Tecnicamente se construye sobre el backbone Cosmos-Predict2.5-2B, un Video DiT de 28 capas al que se anaden dos mecanismos: una doble inyeccion de la accion (numerica y visual, mediante un esqueleto renderizado desde URDF alineado con la camara) en bloques alternos, y capas feed-forward con mezcla de expertos dispersa (1 experto compartido + 8 enrutados, top-2). El resultado es un modelo de ~23,6 GB en bf16, entrenado sobre aproximadamente 1 millon de trayectorias reales y simuladas (~8.000 horas) procedentes de AgiBotWorld Beta, RealSource World, RoboMIND, LIBERO, ManiSkill2, RoboTwin y RoboCasa.

Su relevancia actual radica en que unifica la simulacion de morfologias heterogeneas en un solo checkpoint y demuestra utilidad aguas abajo: en RoboTwin, el aumento de datos generados eleva el exito de politica del 70,0% al 93,0%, y la optimizacion de politica imaginada del 62,7% al 75,4%. Se publica bajo licencia NVIDIA Open Model License, con pesos, codigo de inferencia y fine-tuning abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video DiT (diffusion transformer) de 28 capas sobre Cosmos-Predict2.5-2B, con MoE dispersa en las capas feed-forward |
| Parametros totales | no disponible (checkpoint de ~23,6 GB en bf16) |
| Parametros activos | 1 experto compartido + 8 enrutados por capa FFN, enrutamiento top-2 (numero absoluto de parametros no disponible) |
| Longitud de contexto | no disponible en tokens; genera chunks de 93 fotogramas a 480x640 con autoregresion por chunks |
| Tipos de cuantizacion | bf16 (unico formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (las instrucciones de lenguaje natural se codifican con Cosmos-Reason1-7B) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | PyTorch (`model_ema_bf16.pt`) |

## Arquitectura y entrenamiento

El modelo parte del Video DiT de Cosmos-Predict2.5-2B (28 capas) y lo extiende con dos mecanismos de condicionamiento por accion inyectados en bloques alternos. En los bloques impares, embeddings numericos de la accion en el layout unificado de 28 dimensiones modulan las representaciones ocultas; en los bloques pares, 14 Context Blocks inyectan residuales de un vídeo de esqueleto renderizado desde URDF y alineado con la camara. Al intercalar ambas condiciones, cada una actua sobre estados ocultos ya informados por la otra, lo que segun el autor supera a las variantes de condicion unica, concatenacion y fusion tardia (PSNR +0,904 dB sobre fusion tardia en AgiBotWorld Beta).

Cada capa feed-forward incorpora mezcla de expertos dispersa con 1 experto compartido y 8 enrutados, enrutamiento sigmoide top-2 y escala de ruta 2,5; con la interfaz de accion y el corpus mixto fijados, el MoE reduce el FVD en 6,530 respecto al backbone denso. El muestreo emplea flujo rectificado bidireccional de 35 pasos; existe ademas una variante autoregresiva destilada de cuatro pasos para rollouts eficientes. El entrenamiento usa ~1M de trayectorias (~8.000 horas) reales y simuladas de AgiBotWorld Beta, RealSource World, RoboMIND, LIBERO, ManiSkill2, RoboTwin y RoboCasa. El tokenizador VAE de Wan2.1 (de Cosmos-Predict2.5-2B) y el codificador de texto Cosmos-Reason1-7B permanecen congelados y se descargan de sus propios repositorios.

## Capacidades

- Generacion de vídeo futuro accion-condicionado a partir de un fotograma RGB, una trayectoria articular y una instruccion en lenguaje.
- Simulacion cross-embodiment: pinza paralela, mano diestra, brazo unico y bimanual bajo un layout canonico de 28 dimensiones.
- Rollouts interactivos de episodios largos mediante generacion por chunks de 93 fotogramas con autoregresion.
- Variante destilada de cuatro pasos para inferencia eficiente.
- Evaluacion de politicas mediante un evaluador VLM afinado que convierte resultados predichos en retroalimentacion.
- Aumento de datos sinteticos para entrenamiento de politicas.
- Optimizacion de politica imaginada (imagined policy optimization) con adaptacion a simulador especifico de tarea.
- Fine-tuning sobre episodios propios (incluye guia para RoboDojo y otros robots).
- No se documentan capacidades de tool calling, agentes multi-paso ni audio.

## Casos de uso

- Aumento de datos para entrenamiento de politicas: generar episodios sinteticos accion-condicionados a partir de trayectorias existentes; en RoboTwin esta estrategia eleva el exito de politica del 70,0% al 93,0%.
- Optimizacion de politica imaginada: usar las predicciones del modelo como entorno para seleccionar y refinar acciones antes de ejecutarlas en el robot real, con mejora documentada del 62,7% al 75,4% en RoboTwin.
- Evaluacion offline de politicas: el evaluador VLM afinado convierte los vídeos predichos en senal de exito o fracaso, permitiendo comparar politicas sin despliegue fisico.
- Validacion de trayectorias antes de ejecucion: simular el resultado de una trayectoria articular sobre la escena actual para detectar colisiones o fallos antes de enviarla al hardware.
- Simulacion de robots heterogeneos en un solo pipeline: un unico checkpoint cubre brazos unicos, bimanuales, pinzas y manos diestras, simplificando laboratorios con flotas mixtas.
- Generacion de datos para tareas poco representadas: fine-tuning sobre episodios propios (`finetune.sh`) para dominios o morfologias con pocos datos reales.
- Investigacion en world models: base reproducible para estudiar condicionamiento por accion, MoE dispersa y destilacion de pasos de muestreo.

## Benchmarks y rendimiento

| Split retenido | PSNR ↑ | SSIM ↑ | LPIPS ↓ | FID ↓ | FVD ↓ | Ganancia PSNR vs mejor baseline |
|---|---:|---:|---:|---:|---:|---:|
| AgiBotWorld Beta | 22,276 | 0,796 | 0,013 | 14,640 | 10,850 | +4,636 dB |
| RoboMIND | 23,850 | 0,835 | 0,012 | 17,610 | 15,930 | +2,080 dB |
| RoboTwin | 30,383 | 0,942 | 0,006 | 8,910 | 4,980 | +10,343 dB |

Ablaciones reportadas por el autor: +0,904 dB de PSNR frente a fusion tardia en AgiBotWorld Beta con el esquema de doble inyeccion intercalada, y -6,530 de FVD del MoE disperso frente al backbone denso. Utilidad aguas abajo en RoboTwin: exito de politica 70,0% → 93,0% con aumento de datos, y 62,7% → 75,4% con optimizacion de politica imaginada. No se proporcionan resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) por no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa ~23,6 GB en bf16; se requiere al menos ~24 GB solo para pesos, mas activaciones del DiT y del VAE/tokenizador, por lo que en la practica se recomienda 40-80 GB.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs profesionales con >=48 GB; no se documenta soporte en consumer GPU.
- Cabe en consumer GPU: no de forma holgada; una RTX 4090 de 24 GB queda al limite y no se garantiza con las activaciones adicionales.
- Opciones de despliegue: el repositorio oficial usa `uv` con extra `cu128` y scripts `infer.sh` / `finetune.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de vídeo).
- Latencia y throughput: no disponibles; el muestreo base usa 35 pasos de flujo rectificado y existe una variante destilada de 4 pasos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / generacion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pelican-Sim 1.0 | no disponible (~23,6 GB bf16) | chunks de 93 frames a 480x640 | World model accion-condicionado cross-embodiment con MoE | NVIDIA Open Model License | Pesos en HF, codigo en GitHub |
| Cosmos-Predict2.5-2B (base) | 2B | no disponible | Video DiT generativo de NVIDIA | NVIDIA Open Model License | Publico en HF |
| Cosmos-Reason1-7B (codificador de texto) | 7B | no disponible | VLM de razonamiento fisico | NVIDIA Open Model License | Publico en HF |

No se dispone de datos de benchmarks de otros world models de robotica en la informacion proporcionada para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus mixto real-simulado, puede heredar sesgos de escenas, objetos y morfologias sobrerrepresentadas en AgiBotWorld Beta, RoboMIND, LIBERO, ManiSkill2, RoboTwin y RoboCasa.
- Riesgo de alucinacion: como modelo generativo de vídeo, puede producir dinámicas fisicamente plausibles pero incorrectas; las metricas de calidad (PSNR, SSIM, FID, FVD) no garantizan consistencia fisica.
- Limitaciones de contexto: generacion por chunks de 93 fotogramas con autoregresion, lo que puede acumular deriva en episodios largos; resolucion fija 480x640.
- Idiomas: no se especifican idiomas soportados; el codificador de texto es Cosmos-Reason1-7B y no se documenta cobertura multilingue.
- Licencia: NVIDIA Open Model License impone condiciones de uso comercial; conviene revisar el acuerdo antes de desplegar en produccion.
- Dependencias externas: requiere descargar el VAE de Wan2.1 y el codificador Cosmos-Reason1-7B de sus repositorios, con sus propias licencias.
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta; el modelo se publica como version 1.0 sin historial de mantenimiento.
- No apto para benchmarks de NLP: no es un LLM y no debe evaluarse con MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/ShilongZou/Pelican-Sim1.0
- Pagina del proyecto: https://zoushilong1024.github.io/Pelican-Sim1.0/
- arXiv: https://arxiv.org/abs/2609.12036
- Codigo: https://github.com/ZouShilong1024/Pelican-Sim1.0
- Guia de fine-tuning: https://github.com/ZouShilong1024/Pelican-Sim1.0/blob/main/docs/finetune_robodojo.md
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Codificador de texto: https://huggingface.co/nvidia/Cosmos-Reason1-7B
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
