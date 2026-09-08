# OpenWAM-Stanford/OpenWAM-Pretraining

## Resumen

OpenWAM-Pretraining es un checkpoint intermedio de pretraining de video del proyecto OpenWAM, desarrollado por OpenWAM-Stanford. Se trata de un modelo de prediccion de video latente condicionado por texto, entrenado con video monovista y mosaicos multivista sincronizados. Su arquitectura combina un transformer causal de 30 capas con un VAE Wan 2.2 de 48 canales. El checkpoint esta pensado para investigacion en world models y adaptacion posterior, no como una politica de robot lista para despliegue. El repositorio contiene los pesos nativos en formato PyTorch (20.4 GB) sin optimizador ni estados de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (OpenWAM/VPM) con VAE Wan 2.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (condicionamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (model_state.pt) |

## Arquitectura y entrenamiento

El modelo usa un pipeline de prediccion de video causal llamado OpenWAM/VPM. Es un transformer de 30 capas con hidden size 3072 y 24 cabezas de atencion. Opera sobre latentes de video de 48 canales generados por un VAE Wan 2.2. El entrenamiento se realizo con batch global de 288 (36 por GPU en 8 GPUs), usando AdamW con learning rate 1e-5 en la fase final. El pool de datos congelado contenia 1,053,709 clips monovista y 107,317 clips multivista, con fuentes como LIBERO, UMI, AgiBot, RoboMind, InternData, RoboCOIN, FastUMI y EgoExo4D. La entrada multivista combina camaras sincronizadas antes de la codificacion VAE, preservando el aspect ratio; por ejemplo, pares horizontales para LIBERO y FastUMI, y disposiciones head-over-wrists. El checkpoint es un estado intermedio, no una politica final.

## Capacidades

- Prediccion de video latente condicionada por texto.
- Procesamiento de video monovista y mosaicos multivista sincronizados.
- Adecuado para investigacion en world models y adaptacion posterior.
- No incluye soporte de tool calling ni funciones de agente, al ser un modelo de video.
- Capacidad de generar predicciones de video a partir de instrucciones textuales en ingles.
- Integracion con el framework OpenWAM para experimentos modulares.

## Casos de uso

- Investigacion en world models: permite estudiar prediccion de video latente y comparar arquitecturas dentro del framework OpenWAM.
- Pretraining para politicas robot: el checkpoint puede servir como inicializacion para fine-tuning en tareas de manipulacion robotica.
- Generacion de video multivista: util para simular multiples vistas sincronizadas de una escena, como en entornos robot.
- Evaluacion de representaciones latentes: sirve para analizar la calidad de latentes VAE y la prediccion a largo plazo.
- Benchmarking de prediccion de video: permite comparar metricas como MSE y calidad visual entre modelos de mundo.
- Adaptacion a datos propios: el checkpoint es un punto de partida para continuar el pretraining con datasets especificos de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentacion.
- El checkpoint de pesos ocupa 20.4 GB, por lo que se requiere una GPU con memoria suficiente para cargar el modelo en su formato nativo.
- La carga se realiza con PyTorch mediante torch.load, no mediante vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- El entrenamiento original uso 8 GPUs con batch 36 por GPU, lo que sugiere GPUs de alta memoria (tipo A100 o H100), pero no se confirma.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Los chequeos visuales son limitados; un MSE bajo no implica mejor calidad visual.
- Los pronosticos largos pueden estancarse, derivar, deformar objetos o desenfocar detalles.
- Los ejemplos de RoboMind y RoboCOIN no siguen de forma fiable la manipulacion ground-truth.
- Es un checkpoint intermedio de pretraining, no una politica de despliegue robotico.
- La licencia no esta disponible, por lo que se desconocen las restricciones de uso comercial.
- No incluye VAE, text encoder, tokenizer ni datos de entrenamiento; deben suministrarse externamente.

## Enlaces

- HuggingFace: https://huggingface.co/OpenWAM-Stanford/OpenWAM-Pretraining
- GitHub: https://github.com/OpenWAM-Official/OpenWAM
- Pagina del proyecto: https://openwam.stanford.edu/
- Pagina del proyecto en GitHub: https://github.com/OpenWAM-Official/OpenWAM-Official.github.io
