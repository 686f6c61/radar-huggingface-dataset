# Marianasant/undergrad-contrastive

## Resumen

`Marianasant/undergrad-contrastive` es un repositorio de HuggingFace que contiene una implementación de DeiT (Data-efficient Image Transformer) orientada al aprendizaje contrastivo. Lo publica el usuario Marianasant bajo licencia MIT y se presenta explícitamente como un punto de partida reproducible, no como un modelo entrenado. El repositorio incluye `predict.py`, `config.json`, `training_args.json` y un `model.safetensors` de inicialización para pruebas de humo.

La arquitectura declarada es DeiT a escala base, con atención de ventana deslizante, fusión tucker, activación gelu tanh y normalización layernorm. Sin embargo, el recuento real de parámetros del checkpoint es de 24.832, muy por debajo de lo habitual en un DeiT base, lo que debe tenerse en cuenta al interpretar la configuración. No se declaran idiomas, pipeline de HuggingFace ni resultados de benchmarks.

Su relevancia actual es limitada y experimental: sirve como esqueleto para reproducir experimentos de aprendizaje contrastivo, validar infraestructura de entrenamiento o realizar ablaciones arquitectónicas. No debe confundirse con un modelo listo para producción ni con un checkpoint con pesos entrenados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeiT (Vision Transformer) |
| Parámetros totales | 24.832 (según safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión; no se especifica resolución de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión; no se declara ningún idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Escala declarada | base |
| Mecanismo de atención | sliding window |
| Fusión | tucker |
| Activación | gelu tanh |
| Normalización | layernorm |
| Framework | PyTorch |
| Pipeline de HuggingFace | no disponible |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación | 2026-10-20 |
| Fecha de actualización | 2026-10-20 |

## Arquitectura y entrenamiento

El modelo implementa un transformer de visión DeiT con atención de ventana deslizante, fusión tucker, activación gelu tanh y normalización layernorm. La escala declarada es base, aunque el checkpoint contiene 24.832 parámetros, una cifra muy inferior a la de un DeiT base convencional; esta discrepancia puede deberse a una configuración reducida o a un error en los ajustes generados, y conviene verificarla en `config.json` antes de reutilizar la arquitectura.

No se documenta el entrenamiento: no se indican tokens, composición del dataset, resolución de imagen, número de épocas ni si se aplicó RLHF o DPO. El archivo `model.safetensors` es un checkpoint de inicialización para pruebas de humo, no un modelo entrenado. La receta por defecto usa el optimizador novograd con un scheduler cosine, valores de partida que no evidencian una ejecución completada ni resultados reproducidos.

## Capacidades

- Implementación de aprendizaje contrastivo para representaciones visuales: el código define el modelo y un punto de entrada ejecutable, pero no incluye pesos entrenados que permitan extraer representaciones útiles.
- Atención de ventana deslizante: mecanismo configurable en la arquitectura, sin evaluación publicada.
- Fusión tucker: componente declarado en la configuración, sin resultados que demuestren su efecto.
- Punto de partida reproducible: `config.json` y `training_args.json` permiten replicar la receta por defecto y comparar variantes.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, capacidades de audio ni visión entrenada.
- No se declara soporte multilingüe; es un modelo de visión, no de lenguaje.
- No se ha validado ninguna capacidad en benchmarks.

## Casos de uso

- Reproducción de experimentos académicos de aprendizaje contrastivo: utilizar `config.json` y `training_args.json` como receta base, reentrenar con un dataset propio y comparar con baselines bajo el mismo presupuesto. Es adecuado porque el repositorio separa configuración, receta y checkpoint de inicialización.
- Pruebas de humo en pipelines de entrenamiento: cargar `model.safetensors` y ejecutar `predict.py --help` para verificar que el entorno, las dependencias y el guardado de pesos funcionan antes de lanzar un entrenamiento costoso.
- Baseline de capacidad equiparable: emplear la implementación como arquitectura de referencia y entrenarla con los mismos datos, semillas y presupuesto que otras variantes; sirve para aislar el efecto de cambios arquitectónicos.
- Docencia y formación técnica: usar el código para explicar un DeiT con atención sliding window y fusión tucker, así como la diferencia entre un checkpoint de inicialización y un modelo entrenado.
- Desarrollo de adaptadores de carga: probar la integración del modelo con APIs genéricas de HuggingFace o con scripts propios, ya que la model card advierte que requiere un adaptador explícito.
- Ablaciones de componentes: modificar la atención, la fusión o la activación y medir el impacto en una tarea contrastiva concreta, manteniendo el resto de la receta fija.
- Validación de recetas de optimización: experimentar con novograd y cosine schedule en tareas de visión contrastiva, comparando con AdamW u otras combinaciones.
- Preparación de un modelo propio desde cero: usar el esqueleto para entrenar un DeiT pequeño en un dominio específico, como imágenes médicas o industriales, cuando no se dispone de un checkpoint preentrenado adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado. Por tanto, no es posible comparar métricas como ImageNet top-1, retrieval o tareas contrastivas, ni benchmarks de lenguaje como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con 24.832 parámetros, el checkpoint ocupa aproximadamente 0,1 MB en fp32 (24.832 × 4 bytes), por lo que la VRAM necesaria es inferior a 1 GB.
- GPU recomendadas: no se requiere una GPU dedicada para el checkpoint de inicialización. Cabe en cualquier GPU de consumo, incluida una GTX 1050, una RTX 3050 o una GPU integrada, y también se puede ejecutar en CPU.
- Entrenamiento: no disponible. Al no especificarse resolución de imagen, tamaño del dataset ni número de tokens, no es posible estimar requisitos de VRAM para un entrenamiento real.
- Opciones de despliegue: al ser una implementación personalizada de PyTorch, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. El repositorio incluye `predict.py` como punto de entrada; para producción haría falta exportar a TorchScript u ONNX o envolver el modelo en un servicio propio, alternativas no documentadas en la información disponible.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño del checkpoint, el coste computacional de una pasada es trivial, pero no existen datos verificados de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marianasant/undergrad-contrastive | DeiT para contraste, checkpoint de inicialización | 24.832 | no disponible | MIT | HuggingFace |
| facebook/deit-base-patch16-224 | DeiT base entrenado para clas
