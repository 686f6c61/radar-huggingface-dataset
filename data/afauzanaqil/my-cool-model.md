# afauzanaqil/my-cool-model

## Resumen

El repositorio `afauzanaqil/my-cool-model` no es un modelo de IA en el sentido tradicional, sino un scaffold de investigacion centrado en metodos de aceleracion de cache para modelos de difusion de video. El proyecto, denominado `wan-fewstep-cache-research`, parte de una pregunta concreta: los metodos de cache existentes como TeaCache o FasterCache explotan la redundancia entre pasos temporales en modelos de difusion de multiples pasos, pero cuando un modelo se destila a 4-8 pasos (por ejemplo, mediante CausVid), esa redundancia desaparece en gran medida. El objetivo es determinar si aun existe redundancia explotable en otros ejes, como entre capas, entre ramas de guidance o en el dominio espacial.

El trabajo se centra en el modelo base Wan2.1-T2V-1.3B, un modelo de difusion de video de 1.3B de parametros, y en un LoRA comunitario de CausVid. El hardware objetivo es una unica RTX 3090 de 24GB, lo que justifica la eleccion de la variante 1.3B frente a la 14B o a HunyuanVideo. El repositorio incluye un conjunto de scripts orquestados en cinco fases, desde la validacion del LoRA hasta la evaluacion completa con metricas como CLIP score, LPIPS y FVD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.3B (Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El proyecto no proporciona una descripcion formal de la arquitectura del modelo base, pero el README menciona "Wan transformer submodule names" y la presencia de hooks de atencion y MLP en `src/instrumentation/hooks.py`, lo que indica que Wan2.1-T2V-1.3B es un modelo de difusion basado en transformer. El repositorio incluye un LoRA de CausVid, descrito como una conversion comunitaria no oficial, cuyo objetivo es destilar el modelo a 4-8 pasos. No se proporcionan datos sobre el entrenamiento del modelo base ni sobre el proceso de destilacion.

El enfoque del proyecto es experimental: se plantean cinco fases de investigacion. La fase 0 valida la calidad del LoRA de CausVid; la fase 1 reproduce los baselines de TeaCache y FasterCache sobre el modelo base y sobre el modelo destilado; la fase 2, considerada el experimento central, perfila la redundancia que sobrevive a la destilacion; la fase 3 implementa un metodo de cache propuesto en funcion de los hallazgos de la fase 2; y la fase 4 evalua el rendimiento con metricas de velocidad, VRAM, CLIP score, LPIPS y FVD.

## Capacidades

- Investigacion de metodos de cache para modelos de difusion de video, incluyendo TeaCache, FasterCache y aproximadamente diez variantes similares.
- Perfilado de redundancia entre pasos temporales, entre capas, entre ramas de guidance y en el dominio espacial.
- Validacion de checkpoints comunitarios de LoRA para modelos de difusion.
- Reproduccion de baselines de cache sobre modelos base y destilados.
- Evaluacion de calidad de video generado mediante CLIP score, LPIPS y FVD (este ultimo a traves de la implementacion de VBench).
- Medicion de rendimiento en terminos de velocidad y uso de VRAM.
- Soporte para hardware limitado, con una RTX 3090 de 24GB como objetivo.

## Casos de uso

- Investigacion academica sobre aceleracion de inferencia en modelos de difusion de video: el repositorio permite reproducir los resultados de metodos de cache existentes y probar hipotesis sobre redundancia residual tras la destilacion.
- Optimizacion de inferencia para hardware de consumo: el proyecto esta disenado para ejecutarse en una RTX 3090, lo que lo hace util para desarrolladores que necesitan generar video sin acceso a GPUs de centro de datos.
- Validacion de LoRA comunitarios: la fase 0 del proyecto sirve como prueba de sanidad para verificar si un checkpoint de LoRA produce resultados aceptables antes de invertir tiempo en experimentos posteriores.
- Desarrollo de nuevos metodos de cache: la fase 2 proporciona datos empiricos sobre donde sobrevive la redundancia, permitiendo disenar mecanismos de cache basados en evidencia en lugar de suposiciones.
- Evaluacion comparativa de calidad de video: los scripts de la fase 4 permiten calcular CLIP score, LPIPS y FVD para comparar metodos de cache frente a la generacion completa.
- Documentacion de resultados negativos: si la fase 2 concluye que no existe redundancia explotable tras la destilacion, el proyecto contempla publicar ese hallazgo como resultado cientifico valido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto define metricas de evaluacion en la fase 4 (velocidad, VRAM, CLIP score, LPIPS, FVD), pero no incluye numeros concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque el proyecto esta disenado para una RTX 3090 con 24GB de VRAM, lo que sugiere que el modelo base de 1.3B cabe en ese rango.
- GPU recomendada: una unica RTX 3090 de 24GB, segun el README.
- Compatibilidad con GPU de consumo: si, al menos con RTX 3090 o superior.
- Opciones de despliegue: el proyecto se ejecuta mediante scripts Python que cargan pipelines de diffusers, no mediante servidores de inferencia como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. El proyecto menciona metodos de cache como TeaCache y FasterCache, pero estos son tecnicas de optimizacion, no modelos de IA comparables en parametros o arquitectura.

## Limitaciones y advertencias

- El LoRA de CausVid es una conversion comunitaria no oficial, y su calidad no ha sido verificada por los autores del proyecto. La fase 0 existe precisamente para comprobar esto antes de continuar.
- Los nombres exactos de los submodulos del transformer de Wan (atencion, MLP) necesitan verificarse contra la version instalada de diffusers mediante `print(pipe.transformer)`. El archivo `hooks.py` es una plantilla ajustable, no un mapeo garantizado.
- El calculo de FVD requiere un extractor de caracteristicas preentrenado de tipo I3D. El proyecto recomienda reutilizar la implementacion de VBench en lugar de escribir una propia, y solo usarlo para las metricas finales.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real del modelo o de los metodos propuestos es desconocido.
- La licencia del repositorio no esta disponible, lo que puede limitar su uso comercial o su redistribucion.
- Los resultados de la busqueda web no proporcionan informacion adicional relevante sobre el proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/afauzanaqil/my-cool-model
- Otros enlaces: no disponibles.
