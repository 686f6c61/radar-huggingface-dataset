# lopezchristopher/cnn-transformer-experiment85

## Resumen

`lopezchristopher/cnn-transformer-experiment85` es un repositorio experimental publicado en Hugging Face por el usuario lopezchristopher que contiene una implementación propia de una arquitectura híbrida denominada "CNN Transformer" orientada a tareas de clasificación. No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests) y que no se reclama ninguna métrica de benchmark.

El modelo se presenta con escala "base", atención dilatada, fusión de tensores entre las ramas convolucional y transformer, activación ReLU y normalización ScaleNorm. El recuento real de parámetros en safetensors es de 49.600, un tamaño muy reducido que confirma su carácter de esqueleto arquitectónico más que de modelo de producción. La receta de entrenamiento por defecto usa el optimizador RMSprop con un schedule de warmup lineal.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. No debe confundirse con un modelo generativo de propósito general: no hay información sobre tokenizador, vocabulario, datos de entrenamiento ni capacidades lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida convolucion + transformer), con atencion dilatada, fusion de tensores, activacion ReLU y normalizacion ScaleNorm |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicializacion); codigo en PyTorch (`inference.py`) |

## Arquitectura y entrenamiento

La arquitectura combina una rama convolucional con una rama transformer, fusionadas mediante "tensor fusion". La atención es de tipo dilatado y la normalizacion empleada es ScaleNorm en lugar de LayerNorm. La activacion es ReLU. La escala declarada es "base", aunque con 49.600 parametros totales el modelo es ordenes de magnitud menor que cualquier transformer "base" convencional; el termino parece referirse a la configuracion de referencia del experimento, no a un tamano estandar de la literatura.

No se documenta el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La model card es explicita: el checkpoint incluido no ha sido entrenado ni auditado, y los valores de `training_args.json` (RMSprop con warmup lineal) son puntos de partida del script, no evidencia de una ejecucion completada. El autor recomienda, para cualquier evaluacion futura, usar un split etiquetado especifico de la tarea, reportar la metrica sobre al menos tres semillas e incluir una linea base de capacidad equivalente.

## Capacidades

- Clasificacion: es la unica tarea declarada en las etiquetas del repositorio (`classification`).
- Inspeccion de arquitectura: el codigo permite modificar y comparar variantes (atencion dilatada, fusion de tensores, ScaleNorm) antes de un entrenamiento completo.
- Pruebas de humo: `model.safetensors` sirve para verificar que el pipeline de carga y el forward pass funcionan.
- Generacion de texto: no disponible; el modelo no esta planteado como modelo de lenguaje.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Prototipado de arquitecturas hibridas CNN-Transformer: usar el repositorio como plantilla para introducir variantes (por ejemplo, sustituir ScaleNorm por LayerNorm o cambiar la dilatacion de la atencion) y comparar el coste de entrenamiento antes de escalar.
- Docencia e investigacion reproducible: el codigo y los ficheros `config.json` y `training_args.json` permiten a un grupo de investigacion partir de una base minima y documentar cada cambio con semillas fijas.
- Pruebas de integracion de pipelines de PyTorch: validar que el entorno de entrenamiento (versiones de CUDA, PyTorch, safetensors) carga correctamente un checkpoint antes de invertir horas de GPU.
- Clasificacion de senales o series temporales de baja dimensionalidad: la combinacion de convoluciones locales y atencion dilatada es adecuada para patrones con dependencias de largo alcance, aunque requeriria entrenamiento desde cero con datos propios.
- Benchmarking de infraestructura: con 49.600 parametros, el modelo es util para medir overhead de frameworks (DataLoader, mixed precision, distributed) sin que el coste computacional del modelo domine la medicion.
- Base para experimentos de ablation: comparar la rama CNN sola frente a la rama transformer sola frente a la fusion, manteniendo el mismo presupuesto de ajuste y las mismas semillas, tal como recomienda la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se reclama ninguna puntuacion de benchmark y que el checkpoint incluido no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; con 49.600 parametros el modelo ocupa unos 0,2 MB en pesos, por lo que la VRAM vendra dominada por el framework y el tamano de lote, no por el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; tambien es viable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en iGPU o CPU.
- Opciones de despliegue: el autor indica que, al ser una implementacion propia, las APIs genericas de carga automatica requieren un adaptador explicito. El punto de entrada documentado es `python inference.py --help`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (arquitecturas hibridas CNN-Transformer experimentales de ~50.000 parametros) en la informacion disponible, y el repositorio no incluye linea base de referencia.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicializacion, no un modelo entrenado: sus salidas no tienen valor predictivo.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, segun la propia model card.
- No hay informacion sobre sesgos, datos de entrenamiento ni composicion del corpus.
- No se documenta tokenizador, vocabulario ni longitud de contexto, por lo que no es utilizable como modelo de lenguaje.
- Las APIs automaticas de Hugging Face (`AutoModel`, `pipeline`) probablemente no funcionan sin un adaptador explicito, al tratarse de una implementacion personalizada.
- La licencia BSD-3-Clause permite uso comercial y modificacion con atribucion, pero el autor advierte de que deben revisarse por separado los terminos de los datos de origen si se usa con datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aqui incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lopezchristopher/cnn-transformer-experiment85
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
