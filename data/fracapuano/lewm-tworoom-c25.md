# fracapuano/lewm-tworoom-c25

## Resumen

LeWM TwoRoom C25 es un modelo de mundo latente (world model) desarrollado por fracapuano dentro del proyecto de investigación Evolving World Models. No es un modelo de lenguaje: es un predictor de estados futuros en un entorno de navegacion 2D llamado TwoRoom, entrenado con un objetivo de tipo JEPA (Joint Embedding Predictive Architecture) denominado LeJEPA. Dado un historial de tres observaciones consecutivas codificadas como latentes y un bloque de 25 acciones primitivas futuras, el modelo predice el latente correspondiente al paso t+25.

El modelo es deliberadamente pequeno: 18.034.878 parametros, con un encoder ViT-tiny (patch 14, entrada RGB 224x224, representacion CLS de 192 dimensiones) y un predictor transformer de 6 capas y 16 cabezas. Su relevancia es investigadora: sirve como checkpoint de referencia para estudiar planificacion en espacio latente, aprendizaje de dinamicas condicionadas por accion y regularizacion de representaciones (SIGReg) sin profesor EMA ni stop-gradient.

Se publica como derivado de investigacion del experimento de historial consecutivo de LeJEPA, con pesos en safetensors, codigo de inferencia congelado y configuracion Hydra. No soporta lenguaje natural ni vision general: su dominio es exclusivamente el dataset TwoRoom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model latente JEPA: encoder ViT-tiny + predictor transformer condicionado por accion (AdaLN) |
| Parametros totales | 18.034.878 (18.043.070 segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3 observaciones consecutivas (t-2, t-1, t) y 25 acciones futuras |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pt nativo, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (preferido) y PyTorch nativo `weights_step_686700.pt` |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual ViT-tiny (patch size 14, RGB 224x224, salida CLS de 192 dimensiones) con un predictor transformer de 6 capas, 16 cabezas, dimension de cabeza 64 y MLP de 2048, con dropout 0.1. Un encoder de acciones aplana el bloque de 25 acciones bidimensionales a un embedding de 192 dimensiones, que condiciona los tres tokens de contexto mediante capas AdaLN del predictor. Solo se supervisa el token final predicho (z[t+25]). Las cabezas de proyeccion son MLP con dimension oculta 2048, salida 192 y BatchNorm.

El entrenamiento se realizo exclusivamente sobre TwoRoom, con split 90/10 a nivel de episodio, stride 1 y horizonte fijo de 25 sin cruzar fronteras de episodio. La funcion de perdida es `endpoint_MSE + 0.09 * SIGReg(history_and_target_embeddings)` con 1.024 proyecciones y 17 knots; el encoder objetivo recibe gradientes, sin stop-gradient ni profesor EMA. Se completaron 150 epocas (100 iniciales a LR pico 5e-5 con warmup lineal de 4.578 updates y decaimiento coseno, mas 50 de extension a LR pico 5e-6 con 2.289 warmup updates), totalizando 686.700 updates con AdamW (betas 0.9/0.999, epsilon 1e-8, weight decay 0.001), clipping de norma 1.0, batch 128 y precision `bf16-mixed`. La extension reinicio el sampler y el RNG de forma determinista desde la semilla 3072 al no incluir el checkpoint padre el estado del sampler.

## Capacidades

- Prediccion de latentes futuros: dado `[z[t-2], z[t-1], z[t]]` y un chunk de 25 acciones, devuelve el latente predicho en t+25.
- Condicionamiento por accion: un unico chunk futuro de 25 acciones condiciona los tres tokens de contexto via AdaLN; no se aceptan chunks historicos de accion.
- Codificacion de observaciones: el encoder transforma imagenes RGB 224x224 en representaciones CLS de 192 dimensiones.
- Puntuacion de objetivos: es posible codificar una imagen objetivo con el mismo encoder y proyector para comparar con la prediccion latente.
- No soporta generacion de texto, codigo, matematicas, tool calling, agentes conversacionales ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni interfaz de chat.
- La interfaz de rollout espaciado por chunks heredada esta deshabilitada de forma intencionada.

## Casos de uso

- Investigacion en planificacion latente: usar el modelo para evaluar como se propaga la prediccion de 25 acciones en el espacio latente de TwoRoom y comparar con lineas base de model-based RL.
- Estudio de objetivos JEPA: servir como checkpoint de referencia para reproducir el experimento LeJEPA con historial consecutivo y analizar el efecto de SIGReg sin profesor EMA.
- Evaluacion de representaciones: codificar observaciones y objetivos con el encoder para medir distancias latentes y analizar la geometria aprendida en TwoRoom.
- Ablaciones controladas: al estar fijada la configuracion exacta (semilla 3072, 686.700 updates, LR 5e-5 y 5e-6), permite comparar variantes de horizonte o de condicionamiento con una linea base reproducible.
- Docencia y divulgacion: ejemplo compacto (18M parametros) de world model condicionado por accion, adecuado para explicar JEPA, AdaLN y regularizacion de embeddings.
- Verificacion de reproducibilidad: el repositorio incluye SHA-256 del peso nativo, configuracion Hydra y codigo de inferencia congelado, lo que permite auditar el checkpoint frente al estado final de Lightning.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni ninguna tarea de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta metricas de entrenamiento (epocas, updates, perdida compuesta por MSE de endpoint y SIGReg) y enlaces a ejecuciones de Weights & Biases, sin tablas comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamano (18M parametros); con pesos en bf16 o fp32 cabe holgadamente en cualquier GPU consumer moderna, aunque no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el codigo usa `cuda` si esta disponible y cae a `cpu` en caso contrario.
- Cabe en GPU consumer: si, sin restricciones practicas por memoria.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza cargando el modelo con el helper `load_model.py` incluido y PyTorch 3.11 con las versiones fijadas en `requirements.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeWM TwoRoom C25 | 18,03 M | 3 observaciones + 25 acciones | Prediccion latente en TwoRoom | MIT | Hugging Face |
| Otros world models JEPA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Dominio cerrado: entrenado exclusivamente en TwoRoom; no generaliza a otros entornos ni a imagenes fuera de distribucion.
- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales.
- Alucinacion en sentido latente: la prediccion es una estimacion en el espacio proyectado, no una reconstruccion fiable del estado real; el endpoint aislado no permite encadenar una segunda prediccion de 25 acciones sin un historial consecutivo nuevo o un esquema explicito de reconstruccion.
- Dependencia del preprocesado: requiere normalizacion ImageNet y redimensionado identicos a entrenamiento, y normalizacion de acciones por eje con `normalization.json` antes de aplanar el chunk; una accion fisica cero no se convierte en un vector normalizado cero.
- Sin estado de sampler en el checkpoint padre: la extension de 50 epocas reinicio el orden de datos y el RNG de forma determinista desde la semilla 3072, lo que puede afectar a comparaciones finas con la fase inicial.
- Licencia MIT: permite uso comercial, pero el modelo es un derivado de investigacion sin garantias de rendimiento en produccion.
- Sin datos publicados de sesgos, robustez ni evaluacion externa; no se recomienda su uso en sistemas de decision autonoma sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fracapuano/lewm-tworoom-c25
- Repositorio del proyecto: https://github.com/fracapuano/evolving-wm/tree/codex/lewm-consecutive-history
- Ejecucion W&B de continuacion: https://wandb.ai/francescocapuano/evolving-wm/runs/lewm-consecutive-h2-c25-plus50ep-lr5e6-s3072-20261028-r3
- Ejecucion W&B inicial de 100 epocas: https://wandb.ai/francescocapuano/evolving-wm/runs/lewm-consecutive-h2-c25-100ep-s3072-20261026
- Dataset: https://huggingface.co/datasets/fracapuano/lewm-tworooms
- Commit de codigo de entrenamiento congelado: `102fbc6d0d9a0e26e8e4efb19052689de86e7d15`
