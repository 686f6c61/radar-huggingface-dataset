# hasi-moto/contrastive92

## Resumen
contrastive92 es un modelo experimental de arquitectura Cnn Transformer desarrollado por hasi-moto, publicado bajo licencia Apache 2.0. Se trata de una implementacion de trabajo orientada al aprendizaje contrastivo, con una configuracion de escala "nano" que prioriza la transparencia del codigo y la reproducibilidad de pruebas de humo sobre el rendimiento bruto. El repositorio incluye un checkpoint de inicializacion valido, pero el propio autor aclara que no se presenta como un modelo entrenado ni con resultados de benchmarks.

El modelo tiene unicamente 16.576 parametros, lo que lo situa en una categoria de juguete o demostracion tecnica, lejos de cualquier modelo de produccion. Su relevancia actual reside en su valor pedagogico: permite estudiar la integracion de capas convolucionales con atencion multi-query y fusion tensorial en un contexto de aprendizaje contrastivo, sin la complejidad de los modelos de gran escala. No se dispone de informacion sobre la longitud de contexto, idiomas soportados ni formato de pesos mas alla de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (nano) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura combina capas convolucionales con un mecanismo de atencion multi-query, integrados mediante fusion tensorial. La activacion empleada es GELU con aproximacion tanh y la normalizacion se realiza con BatchNorm. El autor no especifica el numero de tokens de entrenamiento ni la composicion del dataset, y no se menciona el uso de RLHF, DPO u otras tecnicas de alineacion. El checkpoint incluido es una inicializacion aleatoria valida para pruebas de humo, no un modelo entrenado.

La configuracion por defecto del experimento utiliza el optimizador AdamW con un programador de tasa de aprendizaje one-cycle. El autor enfatiza que estos valores son puntos de partida en el script y no evidencia de un entrenamiento completado. Para una evaluacion significativa, recomienda entrenar todas las lineas base con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades
- Generacion de texto: no demostrada; el modelo no ha sido entrenado para tareas generativas.
- Razonamiento: no aplicable; sin entrenamiento, no presenta capacidades cognitivas.
- Codigo: no aplicable.
- Matematicas: no aplicable.
- Vision: no aplicable; a pesar del nombre "contrastive", no hay evidencia de entrenamiento multimodal.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: implementacion de aprendizaje contrastivo con arquitectura hibrida CNN-Transformer; util como banco de pruebas para investigacion.

## Casos de uso
- Investigacion academica en arquitecturas hibridas: el modelo permite estudiar la interaccion entre capas convolucionales y atencion multi-query en un contexto de aprendizaje contrastivo, con un coste computacional minimo.
- Pruebas de concepto en aprendizaje contrastivo: sirve como punto de partida para experimentar con funciones de perdida contrastivas (p. ej., InfoNCE) y evaluar su comportamiento en una arquitectura hibrida.
- Educacion en deep learning: por su tamano reducido y codigo transparente, es adecuado para que estudiantes implementen y depuren pipelines de entrenamiento contrastivo.
- Desarrollo de adaptadores para carga personalizada: al ser una implementacion a medida, obliga a escribir adaptadores explicitos, lo que resulta util para practicar integracion de modelos personalizados en frameworks como HuggingFace.
- Reproducibilidad de experimentos: el repositorio incluye configuracion y argumentos de entrenamiento, lo que permite reproducir pruebas de humo y verificar la correccion del codigo.
- Evaluacion de metodos de regularizacion: la combinacion de BatchNorm y GELU tanh ofrece un terreno para probar tecnicas de regularizacion y normalizacion en arquitecturas pequenas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reivindica ninguna puntuacion y que el checkpoint incluido no es un modelo entrenado.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB; el modelo tiene 16.576 parametros, por lo que cabe en cualquier GPU comercial, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; una NVIDIA GTX 1050 Ti o superior es mas que suficiente.
- Compatibilidad con GPU de consumo: total; el modelo es trivialmente pequeno.
- Opciones de despliegue: al ser una implementacion personalizada, no es compatible con vLLM, llama.cpp, Ollama ni TGI sin un adaptador explicito. Puede ejecutarse con PyTorch estandar.
- Latencia y throughput: no disponibles; se espera una latencia en el orden de microsegundos por paso en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares
No se dispone de modelos comparables en la misma categoria. Con 16.576 parametros, contrastive92 se situa muy por debajo de los modelos minimos de produccion (p. ej., TinyLlama con 1.1B parametros). Su proposito es experimental y no compite con modelos de proposito general. Alternativas como CLIP (OpenAI) o contrastors (Nomic AI) abordan el aprendizaje contrastivo a escala real, pero no son comparables en tamano ni proposito.

## Limitaciones y advertencias
- El checkpoint incluido no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se puede utilizar para ninguna tarea de produccion; es exclusivamente un punto de partida experimental.
- La implementacion es personalizada y requiere un adaptador explicito para cargarse con APIs genericas de HuggingFace.
- No hay garantias de que la arquitectura funcione correctamente sin un entrenamiento completo; el autor recomienda validar con al menos tres semillas y una linea base de capacidad equivalente.
- La licencia Apache 2.0 permite uso comercial, pero los terminos de las fuentes de datos externas deben revisarse por separado si se entrena con datasets de terceros.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto porque el modelo no ha sido entrenado.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/hasi-moto/contrastive92
- Repositorio de referencia para aprendizaje contrastivo (Nomic AI): https://github.com/nomic-ai/contrastors
- Repositorio CLIP (OpenAI): https://github.com/openai/CLIP
