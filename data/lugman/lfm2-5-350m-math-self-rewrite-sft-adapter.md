# lugman/LFM2.5-350M-Math-Self-Rewrite-SFT-adapter

## Resumen

El modelo `lugman/LFM2.5-350M-Math-Self-Rewrite-SFT-adapter` es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman sobre el modelo base `LiquidAI/LFM2.5-350M` de Liquid AI. Se trata de un adaptador entrenado con la librería Unsloth y el stack TRL, orientado a tareas de matematicas mediante una estrategia de "self-rewrite" (reescritura de la propia respuesta) en el conjunto de datos de entrenamiento. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con un adaptador LoRA de pequeno tamano y no con un modelo completo.

El modelo base pertenece a la familia LFM2 (Liquid Foundation Models 2) de Liquid AI, una arquitectura disenada para eficiencia en dispositivos de borde (edge). El adaptador hereda las capacidades del modelo base y anade un sesgo hacia la resolucion de problemas matematicos, aunque la model card publicada no incluye detalles sobre el dataset, el numero de pasos de entrenamiento, hiperparametros ni evaluaciones.

La relevancia de esta ficha es limitada: se trata de una publicacion de un particular, sin descargas ni interacciones, sin benchmarks publicados y con documentacion minima. Aun asi, resulta un ejemplo representativo del flujo de trabajo Unsloth + TRL para adaptar modelos pequenos a dominios concretos con recursos minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador (fine-tune) sobre LFM2.5-350M; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; modelo base de 350M |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `LiquidAI/LFM2.5-350M`, un modelo de la familia LFM2 de Liquid AI. La informacion proporcionada no detalla la arquitectura interna del modelo base (tipo de capas, atencion, estado recurrente o hibrida); la model card solo indica la etiqueta `lfm2` y el uso de `transformers`. El adaptador se ha generado con Unsloth, que segun el autor permite un entrenamiento "2x mas rapido", y con el stack TRL para SFT. El nombre del repositorio sugiere un ajuste con reescritura de respuestas matematicas ("Math-Self-Rewrite-SFT"), pero no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

No se documentan innovaciones tecnicas adicionales mas alla del uso de Unsloth para acelerar el entrenamiento. No hay informacion sobre hiperparametros, rango del adaptador, ni sobre el procedimiento exacto de "self-rewrite".

## Capacidades

- Generacion de texto en ingles heredada del modelo base LFM2.5-350M.
- Razonamiento matematico y resolucion de problemas, presumiblemente reforzado por el ajuste SFT orientado a matematicas (segun el nombre del repositorio).
- Capacidad de "self-rewrite": reescritura de la propia respuesta, segun el nombre del modelo; el detalle del procedimiento no esta documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion academica con adaptadores LoRA sobre modelos pequenos: el reducido tamano del adaptador permite probar tecnicas de SFT y self-rewrite en entornos con recursos limitados.
- Prototipado de asistentes matematicos en ingles: el ajuste orientado a matematicas puede servir para validar pipelines de resolucion de problemas paso a paso antes de escalar a modelos mayores.
- Investigacion sobre tecnicas de auto-correccion: el nombre "Self-Rewrite" sugiere un interes en la reescritura de respuestas; el modelo puede usarse como banco de pruebas para comparar estrategias de refinamiento.
- Fine-tuning educativo: sirve como ejemplo reproducible del flujo Unsloth + TRL para quien quiera adaptar un modelo de 350M a un dominio concreto.
- Despliegue en entornos de borde para tareas matematicas simples: al derivar de un modelo de 350M, el adaptador puede combinarse con el base para inferencia en dispositivos con poca memoria, aunque no se documentan requisitos.
- Evaluacion comparativa de adaptadores: util para estudiar como afecta un SFT especifico al rendimiento del modelo base en tareas de matematicas frente a otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un adaptador sobre un modelo base de 350M, la VRAM dependera del modelo base y de la cuantizacion elegida.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el modelo base de 350M es de pequeno tamano, pero no se documentan requisitos concretos.
- Opciones de despliegue: la model card menciona `transformers` y `text-generation-inference` en las etiquetas; tambien se ha usado Unsloth para el entrenamiento. No se documentan vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Documentacion minima: la model card no detalla dataset, hiperparametros, procedimiento de self-rewrite ni evaluaciones, lo que dificulta la reproducibilidad.
- Sin benchmarks: no hay evidencia publicada de mejora frente al modelo base en tareas matematicas.
- Sin descargas ni interacciones: el repositorio no tiene traccion, por lo que no hay senales de validacion por parte de la comunidad.
- Idioma limitado al ingles: no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje pequenos, especialmente en razonamiento matematico de varios pasos; no se documentan mitigaciones.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador hereda las condiciones del modelo base; conviene verificar la licencia de `LiquidAI/LFM2.5-350M` antes de produccion.
- Uso en produccion: no recomendado sin evaluacion propia, dado el caracter experimental y la falta de documentacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-Self-Rewrite-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
