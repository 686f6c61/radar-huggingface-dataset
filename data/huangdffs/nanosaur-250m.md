# huangdffs/Nanosaur-250M

## Resumen

Nanosaur 250M es un modelo de generacion de imagenes texto-a-imagen (text-to-image) orientado a ilustracion, desarrollado por el usuario huangdffs y publicado con licencia MIT. No es un modelo de lenguaje: es un sistema de difusion que combina dos componentes entrenados, un VAE semantico (PS-VAE, 150M parametros) y un transformer de difusion (DeCo, 250M parametros), con un codificador de texto externo basado en Google Gemma 3 270M. El modelo se entrena desde cero, sin partir de un finetune de otro modelo de difusion.

La propuesta central es la eficiencia computacional: el autor afirma haber entrenado el modelo en 42 horas sobre una sola GPU, lo que lo situa como una referencia de bajo coste para experimentacion en generacion de ilustraciones. El PS-VAE comprime la representacion de DINOv3 conservando el contenido semantico, con un espacio latente de 96 canales y compresion espacial 16x, mientras que DeCo emplea una cabeza MLP ancha por parche inspirada en DDT.

Es relevante ahora por su caracter abierto y reproducible: el repositorio incluye la GUI de Gradio, el informe tecnico y los scripts de entrenamiento del VAE y del modelo de difusion. El propio autor lo posiciona explicitamente como modelo de investigacion y advierte que no debe esperar una calidad visual comparable a la de modelos corporativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (flow matching) con transformer DeCo y VAE semantico PS-VAE |
| Parametros totales | 250M (DeCo) + 150M (PS-VAE) + codificador de texto Gemma 3 270M externo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en etiquetas o lenguaje natural; sin listado de idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt` para el VAE, `.pth` para el modelo de difusion) |

## Arquitectura y entrenamiento

El sistema se compone de dos piezas entrenadas. El PS-VAE es un VAE con codificador inicializado desde `timm/vit_base_patch16_dinov3.lvd1689m` y decodificador entrenado desde cero segun la receta VA-VAE; produce un espacio latente de 96 canales con compresion espacial 16x. Su entrenamiento es en dos fases: primero una etapa S-VAE con el codificador DINOv3 congelado y despues un ajuste fino del modelo completo incluyendo el codificador. El modelo de difusion DeCo es un transformer de difusion con una cabeza MLP ancha por parche similar a DDT, e incorpora SPRINT y prediccion x con V-loss (JiT). El entrenamiento usa flow matching basado en minRF y perdida SIGReg de LeJEPA. El codificador de texto es Google Gemma 3 270M, descargado de Hugging Face.

El autor indica que el modelo se entreno desde cero en 42 horas sobre una sola GPU, y que los scripts incluidos implementan AFHQ 256x256 como dataset de ejemplo, por lo que para replicar el modelo habria que sustituirlo por un dataset de ilustracion anime. El repositorio incluye un informe tecnico (`TECH REPORT.md`) con los detalles de arquitectura y entrenamiento.

## Capacidades

- Generacion de imagenes de ilustracion a partir de texto.
- Acepta prompts en formato de etiquetas (tags) o en lenguaje natural.
- Interfaz Gradio incluida para generacion interactiva en `http://localhost:7860`.
- Scripts de entrenamiento del VAE (`train_vae.py`) y del modelo de difusion (`train_diffusion_model.py`).
- Cacheo previo de latentes VAE y embeddings de texto (`cache_vae.py`) para acelerar el entrenamiento.
- Soporte de monitorizacion del entrenamiento con TensorBoard.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Prototipado rapido de generacion de ilustraciones: el modelo permite montar una demo local con Gradio en una GPU de 8 GB para 1024x1024, adecuado para validar ideas de producto antes de invertir en modelos mayores.
- Investigacion en VAEs semanticos: el PS-VAE con latente de 96 canales y compresion 16x sirve como banco de pruebas para estudiar compresion de representaciones DINOv3 conservando semantica.
- Experimentacion con arquitecturas de difusion eficientes: DeCo, SPRINT y prediccion x con V-loss son componentes recientes que pueden evaluarse y compararse dentro de este repositorio reproducible.
- Docencia y formacion: al incluir scripts de entrenamiento completos y un dataset de ejemplo (AFHQ), es util para cursos sobre difusion, flow matching y entrenamiento de VAEs.
- Reproduccion de bajo coste: investigadores con una sola GPU pueden reproducir el pipeline completo y adaptarlo a su propio dataset de ilustracion.
- Generacion de arte conceptual de baja fidelidad: util para bocetos y exploracion de composiciones donde la calidad final no es critica, dado el aviso del autor sobre la calidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: 8 GB para generar a 1024x1024 segun el autor.
- VRAM recomendada para entrenamiento: 24 GB.
- GPU recomendadas: no se especifican modelos concretos; el autor solo indica GPU compatible con CUDA.
- Cabe en GPU de consumo: si, con 8 GB para inferencia (por ejemplo, gamas RTX xx60/xx70 con 8 GB o mas) y 24 GB para entrenamiento.
- Sistema: Linux, Python 3.12+ y UV como gestor de dependencias.
- Opciones de despliegue: GUI de Gradio incluida (`inference_diffusion_model.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El autor lo declara explicitamente como modelo de investigacion y no de proposito general; advierte que no debe esperarse una calidad visual comparable a la de modelos corporativos.
- No es un finetune de un modelo existente; se entrena desde cero, lo que implica menor calidad que sistemas maduros.
- Los scripts incluidos usan AFHQ 256x256 como ejemplo; para replicar el modelo hay que sustituirlo por un dataset de ilustracion anime.
- El codificador de texto Gemma 3 270M se descarga de Hugging Face y puede requerir aceptar los terminos de su repositorio.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma; no disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del codificador Gemma 3 270M y del checkpoint DINOv3 utilizados como componentes.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/huangdffs/Nanosaur-250M
- Paper PS-VAE: https://arxiv.org/abs/2512.17909
- Paper DeCo: https://arxiv.org/abs/2511.19365
- Paper SPRINT: https://arxiv.org/abs/2510.21986
- Paper JiT (x-prediction con V-loss): https://arxiv.org/abs/2511.13720
- Codificador DINOv3 (timm): https://huggingface.co/timm/vit_base_patch16_dinov3.lvd1689m
- Codificador de texto Gemma 3 270M: https://huggingface.co/google/gemma-3-270m
- VA-VAE (LightningDiT): https://github.com/hustvl/LightningDiT
- minRF: https://github.com/cloneofsimo/minRF
- LeJEPA (SIGReg Loss): https://github.com/rbalestr-lab/lejepa
- SpeedrunDiT: https://github.com/SwayStar123/SpeedrunDiT
