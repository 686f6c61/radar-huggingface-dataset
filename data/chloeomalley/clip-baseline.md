# ChloeOmalley/clip-baseline

## Resumen

`ChloeOmalley/clip-baseline` es un repositorio de HuggingFace que contiene una implementación propia de CLIP (Contrastive Language-Image Pre-Training) orientada a tareas de *matching*. Lo publica el usuario ChloeOmalley y su propósito declarado es servir como código transparente y repetible para *smoke tests*, no como un modelo entrenado listo para producción. El propio autor indica explícitamente que no se reclama ninguna métrica de benchmark y que el checkpoint incluido es una inicialización válida, no un modelo con entrenamiento completado.

La ficha técnica declara una configuración "xlarge" con atención dispersa (*sparse*), fusión mediante descomposición de Tucker, activación *approx gelu* y normalización RMSNorm. Sin embargo, el recuento real de parámetros extraído del fichero `model.safetensors` es de solo 24.832 parámetros, una cifra incompatible con cualquier configuración "xlarge" de CLIP real (que suele moverse entre cientos de millones y miles de millones de parámetros). Esto confirma que se trata de un esqueleto de arquitectura o un ejemplo mínimo, no de un modelo funcional.

El repositorio no tiene descargas ni *likes*, el tamaño es de 0,0 GB y no incluye idiomas, pipeline ni datos de entrenamiento. Es relevante únicamente como material de referencia para quien quiera inspeccionar una implementación casera de CLIP y su receta de experimentos por defecto (optimizador Adafactor con *schedule* polinómico), no como un modelo para evaluar o desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (implementacion propia); atencion dispersa, fusion Tucker, activacion approx gelu, normalizacion RMSNorm |
| Parametros totales | 24.832 (segun `model.safetensors`); la model card declara escala "xlarge", dato no coherente con el recuento real |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es CLIP, un modelo de emparejamiento imagen-texto basado en aprendizaje contrastivo. La model card especifica variantes poco habituales para CLIP: atención dispersa, fusión mediante descomposición de Tucker, función de activación *approx gelu* y normalización RMSNorm. No se aporta información sobre la dimensión de los *embeddings*, el número de capas, la resolución de imagen de entrada, el tamaño del vocabulario ni la dimensionalidad del espacio de proyección compartido.

No hay evidencia de entrenamiento. El autor afirma que `model.safetensors` es "un checkpoint de inicialización válido para *smoke tests*" y que "no se presenta como un checkpoint entrenado con benchmark". La receta de experimento por defecto usa el optimizador Adafactor con un *schedule* polinómico, pero se aclara que son valores de partida del script y no evidencia de una ejecución completada. No se mencionan número de tokens, composición del dataset, ni fases de RLHF o DPO. Tampoco se documenta decodificación especulativa, atención lineal ni ninguna otra innovación técnica más allá de los componentes ya citados.

## Capacidades

- No se documenta ninguna capacidad funcional verificada: el checkpoint no ha sido entrenado.
- Al ser una implementación de CLIP, la arquitectura está pensada para emparejamiento imagen-texto (*matching*) y búsqueda contrastiva, pero sin entrenamiento estas funciones no son utilizables.
- No hay soporte declarado de *tool calling* ni de *function calling*.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües.
- No se declaran modos especiales (thinking, visión, audio) más allá de la propia naturaleza multimodal teórica de CLIP.
- La carga mediante APIs genéricas (por ejemplo `transformers`) requiere un adaptador explícito, ya que es una implementación personalizada.

## Casos de uso

- Estudio de arquitecturas CLIP: el repositorio permite inspeccionar una implementación desde cero con atención dispersa y fusión Tucker, útil para investigadores que quieran comparar variantes de la arquitectura frente a la referencia de OpenAI.
- Base para reproducir experimentos de *matching*: el fichero `finetune.py` y `training_args.json` sirven como punto de partida para montar un pipeline propio con Adafactor y schedule polinómico.
- Pruebas de humo (*smoke tests*) de infraestructura: al ser un checkpoint diminuto, permite verificar que un entorno de entrenamiento o de carga de safetensors funciona correctamente antes de escalar a modelos grandes.
- Plantilla de documentación de model cards: el README es un ejemplo de cómo documentar limitaciones y evitar afirmaciones de benchmark no respaldadas.
- Ejercicio docente: sirve para explicar la diferencia entre un esqueleto de arquitectura y un modelo entrenado, y por qué el recuento de parámetros importa.
- Referencia negativa de evaluación: puede usarse como *baseline* de capacidad no coincidente en experimentos que requieran demostrar que un modelo sin entrenamiento no resuelve la tarea.

No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea real, por carecer de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no debe presentarse como un modelo evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 para 24.832 parámetros (aproximadamente 100 KB de pesos), despreciable.
- GPU recomendadas: cualquiera; no requiere GPU. Funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, e incluso en un Raspberry Pi a nivel de memoria).
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI no son aplicables directamente porque el modelo no es un transformer de lenguaje estándar y su carga requiere un adaptador explícito. La vía natural es PyTorch nativo mediante el script proporcionado.
- Latencia y throughput: no disponibles y sin sentido práctico dado que el checkpoint no está entrenado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChloeOmalley/clip-baseline | CLIP propia (sparse, Tucker) | 24.832 | No disponible | MIT | HuggingFace, 0 descargas |
| OpenAI CLIP (referencia) | CLIP con transformer ViT / ResNet | Cientos de millones (segun variante, p. ej. ViT-L/14 ~ 428 M) | 77 tokens de texto | MIT (pesos OpenAI) | GitHub openai/CLIP y HuggingFace |
| ComCLIP (UCSB-AI) | CLIP adaptado a video | No disponible en la informacion | No disponible | No disponible en la informacion | GitHub UCSB-AI/ComCLIP |

La comparación es limitada: el modelo de este repositorio no es un CLIP entrenado y su recuento de parámetros es tres o cuatro órdenes de magnitud inferior al de cualquier variante real de CLIP.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles ni resultados significativos en ninguna tarea.
- El autor advierte que no ha sido auditado para robustez, equidad ni transferencia de dominio.
- Incoherencia entre la escala declarada ("xlarge") y los 24.832 parámetros reales del safetensors; hay que tratar la etiqueta "xlarge" como no fiable.
- No se documentan sesgos porque no hay datos de entrenamiento ni evaluación; cualquier sesgo dependería de futuros entrenamientos no incluidos.
- Riesgo de alucinación no evaluable, al no ser un modelo generativo entrenado.
- No hay información sobre idiomas, por lo que no puede garantizarse cobertura multilingüe.
- Licencia MIT permite uso comercial del código y los pesos, pero el autor recomienda revisar por separado los términos de los datasets externos que se usen con el repositorio.
- Para producción: no apto. Debe considerarse un punto de partida experimental, y cualquier resultado de un futuro checkpoint entrenado deberá documentarse por separado de estos valores por defecto.
- La carga con APIs automáticas genéricas requiere un adaptador explícito, lo que añade fricción de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChloeOmalley/clip-baseline
- Perfil del autor: https://huggingface.co/ChloeOmalley/models
- Otro repositorio del autor (generation-study): https://huggingface.co/ChloeOmalley/generation-study
- CLIP original de OpenAI (GitHub): https://github.com/openai/CLIP
- ComCLIP / clip_baseline.py (UCSB-AI): https://github.com/UCSB-AI/ComCLIP/blob/main/ComVG/clip_baseline.py
- Catalogo de modelos de IA (Everygen): https://everygen.ai/models
