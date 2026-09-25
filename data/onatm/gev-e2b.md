# onatm/gev-e2b

## Resumen

gev-e2b es un modelo de decisión supervisada publicado por el usuario onatm en Hugging Face, distribuido como adaptador PEFT (LoRA) sobre el modelo base google/gemma-4-E2B. A diferencia de un LLM convencional, no genera texto libre: recibe un estado y una batería de preguntas tipadas (choice, noul para sí/no y score ordinal) y devuelve, por cada pregunta, una respuesta y una distribución de probabilidad sobre las opciones suministradas. Es decir, puntúa opciones en lugar de generarlas.

Técnicamente combina un adaptador LoRA de rango 16 y alpha 32 aplicado al decodificador de texto del modelo base con una cabeza pointer de 256 dimensiones entrenada por separado, que es imprescindible para producir decisiones. El modelo está pensado como un motor de decisión tipo System 1, orientado a enrutado y clasificación con calibración explícita: reporta un ECE de 0.0170 con temperatura aplicada en su conjunto de test de origen.

Su relevancia actual radica en el enfoque: en lugar de instruir a un LLM para que "elija" en texto, desacopla la decisión en una cabeza de clasificación con métricas de calibración (accuracy, Brier, ECE) auditables y con hashes SHA-256 de los datos de entrenamiento y de cada split de evaluación. No obstante, el repositorio de código necesario para la inferencia es privado y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el decodificador de texto de google/gemma-4-E2B, mas una cabeza pointer de 256 dimensiones (modelo de decision no autoregresivo) |
| Parametros totales | no disponible (modelo base google/gemma-4-E2B; el repositorio del adaptador ocupa 0.1 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos distribuidos son un adaptador LoRA en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador y cabeza pointer; el modelo base y el dataset se cargan por separado y tienen sus propias licencias) |
| Formato de pesos | safetensors (adaptador PEFT + pointer.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de decision supervisada sobre un transformer decoder. Sobre el modelo base congelado google/gemma-4-E2B (revision d29ff6b45f081a49ee2733a859c9c9c2d95d1a6f) se entrena un adaptador LoRA de rango 16 y alpha 32, junto con una cabeza pointer de 256 dimensiones entrenada por separado. Cada pregunta se puntúa de forma independiente y el modelo devuelve una respuesta mas una distribucion de probabilidad por opcion; el checkpoint almacena la temperatura de servicio ajustada (T=1.6245) en gev.json.

La receta declarada es semilla 0, 2 epocas, 12.576 registros de entrenamiento y 3.144 pasos, entrenado en MLX/BF16. Los datos proceden del conjunto jaredpalmer/kev-suites (decision-v7, fijado y verificado por hash; SHA-256 del set de entrenamiento 7ed5254b5cb5291baefaceb09edf7e13110258211518c8038f4a12c11bd628ad). El entrenamiento usa permutacion de opciones, aumento con opciones none-of-the-above y distractores, y pares contrastivos. La temperatura se ajusta sobre el split decision-v7/calibration, no sobre los splits de test. La arquitectura sigue el articulo "Jev's Architecture Unmasked" y el protocolo de datos y evaluacion se adapta del proyecto Kev.

## Capacidades

- Preguntas de eleccion multiple (choice): selecciona una opcion entre varias y devuelve la distribucion de probabilidad asociada.
- Preguntas de si/no (noul): clasificacion binaria con probabilidad.
- Preguntas ordinales (score): asignacion de puntuacion sobre una escala tipada.
- Salida calibrada: expone probabilidades por opcion y una temperatura de servicio ajustada, lo que permite metricas de calibracion (ECE, Brier).
- Decision a partir de un estado textual: recibe un estado descriptivo (por ejemplo, un mensaje de incidencia) y una bateria de preguntas tipadas.
- Capacidad multilingue: no; solo ingles.
- Tool calling / function calling: no disponible (el modelo no genera texto ni acciones).
- Soporte de agentes y razonamiento multi-paso: no disponible; cada pregunta se puntua de forma independiente.
- Capacidades especiales: no soporta modos de pensamiento, vision ni audio en esta variante (existe una variante multimodal separada, davidburhans/gevva-e2b-multimodal).

## Casos de uso

- Enrutado de tickets de soporte: usando el ejemplo de la propia model card, con un estado como "Order #1 arrived damaged" y una pregunta choice que asigne el caso a facturacion o soporte, el modelo devuelve la respuesta y la probabilidad de cada equipo, lo que permite automatizar el triaje con umbral de confianza.
- Clasificacion de intenciones en atencion al cliente: el modelo puntua la intencion probable entre un conjunto cerrado de opciones y expone la distribucion, lo que permite derivar a humano cuando la probabilidad maxima cae por debajo de un umbral.
- Moderacion de contenido con criterios ordinales: mediante preguntas de tipo score, se puede graduar la severidad de un contenido en una escala y usar la probabilidad para priorizar revision.
- Encuestas y evaluacion de calidad: para clasificar respuestas abiertas o valoraciones en categorias predefinidas, aprovechando la calibracion para agregar resultados ponderados por probabilidad.
- Sistemas de decision con coste asimetrico: la salida probabilistica permite fijar puntos de corte que minimicen falsos positivos o falsos negativos segun el caso, en lugar de depender de una unica etiqueta.
- Enrutado de cargas en pipelines internos: decidir entre rutas de procesamiento (por ejemplo, categoria de documento o cola de tramitacion) con una distribucion que permita auditoria posterior de la decision.
- Evaluacion comparativa de motores de decision: al reportar accuracy, Brier y ECE por split, puede usarse como referencia para comparar otras cabezas de decision sobre el mismo modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en model-index y en la model card (de un unico seed). Brier y ECE son mejores cuanto mas bajos. Las columnas "served" aplican la temperatura T=1.6245.

| Suite / split | Clean n | Accuracy | Brier raw | Brier served | ECE raw | ECE served |
|---|---:|---:|---:|---:|---:|---:|
| decision-v7/test | 1.200 | 0.8292 | 0.2457 | 0.2336 | 0.0661 | 0.0170 |
| transfer-v4/test | 656 | 0.6250 | 0.4680 | 0.4491 | 0.1136 | 0.0571 |
| decision-v7/development | 1.264 | 0.7975 | 0.2847 | - | 0.0628 | - |
| transfer-v4/development | 656 | 0.6113 | 0.4990 | 0.4735 | 0.1163 | 0.0522 |

decision-v7 contiene preguntas retenidas de las familias del origen de entrenamiento; transfer-v4 contiene fuentes nuevas y estructuras de politica retenidas. La accuracy se mide a temperatura bruta T=1 (el escalado de temperatura no cambia la respuesta ganadora). El informe de test de decision-v7 es anterior al ajuste de temperatura; sus metricas served se calcularon a posteriori a partir de logits guardados. Ningun resultado esta verificado de forma independiente (verified: false).

## Requisitos de hardware

- El repositorio del adaptador ocupa 0.1 GB; los pesos congelados del modelo base no estan incluidos en el repositorio.
- Al apoyarse en google/gemma-4-E2B, un modelo edge de la familia Gemma 4, el modelo base es de tamano reducido y puede ejecutarse en hardware de consumo; segun Google, la variante de texto de Gemma 4 E2B sin Per-Layer Embeddings puede operar con menos de 1 GB de memoria.
- VRAM estimada para inferencia: no disponible de forma especifica para este adaptador.
- GPU recomendadas: no disponible; al ser un modelo base pequeno, es previsible que quepa en GPUs de consumo (por ejemplo, gama RTX), pero no se aportan datos concretos.
- Soporte de Apple Silicon: el entrenamiento se realizo en MLX/BF16 y la ejecucion admite el extra mlx (uv sync --locked --extra mlx).
- Opciones de despliegue: no se puede servir con vLLM, llama.cpp, Ollama, TGI ni con un pipeline de text-generation o PEFT estandar. Requiere el paquete Gev (uv run gev predict onatm/gev-e2b --input request.json), cuyo repositorio fuente es privado actualmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| onatm/gev-e2b | Adaptador LoRA + cabeza pointer sobre Gemma 4 E2B | no disponible (base E2B) | no disponible | en | apache-2.0 (adaptador y cabeza) | Pesos publicos; inferencia requiere el paquete Gev (repo privado) |
| davidburhans/gevva-e2b-multimodal | Cabeza de clasificacion no autoregresiva + torre SigLIP + proyeccion cross-modal sobre Gemma 4 E2B-it | no disponible | no disponible | no disponible | no disponible | Pesos publicos |
| Jev (TypeSafe AI) | Modelo de decision propietario que devuelve valores tipados | no disponible | no disponible | no disponible | Propietaria | Acceso limitado (early access) |
| google/gemma-4-E2B | LLM multimodal edge (modelo base) | familia E2B (edge) | no disponible | no disponible | Gemma (segun el modelo base) | Pesos publicos |

No se dispone de resultados de benchmarks comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Estudio de un unico seed: no hay validacion multi-seed, por lo que la estabilidad de los resultados no esta caracterizada.
- Caida de rendimiento fuera del origen de entrenamiento: la accuracy baja de 0.8292 en decision-v7/test a 0.6250 en transfer-v4/test, con un Brier served que sube de 0.2336 a 0.4491.
- Pares contrastivos de respuesta cambiada: en 12 de 64 pares ambas respuestas fueron correctas.
- Opciones none-of-the-above: con una opcion de ese tipo presente, solo 14 de 36 preguntas fueron correctas.
- Idioma: soporta unicamente ingles.
- Dependencia de la cabeza pointer: cargar solo el adaptador PEFT no produce decisiones; pointer.safetensors es imprescindible.
- Ejecucion restringida: el repositorio fuente (github.com/onatm/gev) es privado y se necesita acceso para ejecutar la inferencia. No es servible con pipelines de Hugging Face de text-generation ni con PEFT aislado.
- Licencias: el adaptador y la cabeza son apache-2.0, pero hay que verificar por separado las licencias del modelo base y del dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero si existe riesgo de decision incorrecta con exceso de confianza si se usa fuera de la distribucion de entrenamiento. El autor recomienda evaluar sobre las decisiones propias antes de usarlo.
- Resultados de benchmark marcados como no verificados (verified: false).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onatm/gev-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Dataset de entrenamiento: https://huggingface.co/datasets/jaredpalmer/kev-suites
- Repositorio fuente de Gev (privado): https://github.com/onatm/gev
- Repositorio Kev (protocolo de datos y evaluacion): https://github.com/jaredpalmer/kev
- Articulo "Jev's Architecture Unmasked": https://archerhume.com/posts/jevs-architecture-unmasked
- Variante multimodal de la familia: https://huggingface.co/davidburhans/gevva-e2b-multimodal
- Wikipedia, Jev (AI model): https://en.wikipedia.org/wiki/Jev_(AI_model)
- Blog Gemma 4 E2B vs E4B: https://www.mindstudio.ai/blog/gemma-4-e2b-e4b-edge-models-phone-local
- Nota sobre Gemma 4 QAT y memoria: https://pulse2.com/google-gemma-4-qat-models-reduce-memory-requirements-for-mobile-and-laptop-ai/
