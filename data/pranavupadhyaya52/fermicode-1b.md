# pranavupadhyaya52/Fermicode-1B

## Resumen

Fermicode-1B es un modelo de lenguaje causal derivado de meta-llama/Llama-3.2-1B mediante un proceso de preentrenamiento continuado (continued pre-training, CPT). Lo desarrolla Pranav Upadhyaya y se distribuye en Hugging Face bajo licencia Llama 3.2. Con 1.235.814.400 par\u00e1metros totales y un repositorio de 2,5 GB en formato safetensors, es un modelo pequeno orientado a generacion de texto en ingles.

El modelo parte de la arquitectura Llama 3.2 1B, un transformer decoder-only con atencion por grupos (GQA) y RoPE, aunque la model card no detalla la configuracion exacta de capas, cabezas ni longitud de contexto. Al ser un CPT sobre la base de Meta, hereda las capacidades del modelo original, pero la informacion publicada no especifica que datos adicionales se emplearon ni que objetivos concretos persigue el ajuste, mas alla de la etiqueta "Fermicode" que sugiere un enfoque hacia codigo.

Su relevancia practica es limitada pero clara: ocupa un nicho de modelos de 1B parametros que caben en GPUs de consumo y permiten despliegues locales economicos. La model card es practicamente una plantilla autogenerada, con la mayoria de secciones marcadas como "[More Information Needed]", por lo que la evaluacion rigurosa del modelo queda pendiente de que el autor publique detalles de entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 1B; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Llama 3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Llama 3.2 1B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query grouping (GQA). El autor no publica la configuracion exacta de capas ni de cabezas, aunque el recuento de parametros (1.235.814.400) coincide con el del modelo base de Meta.

El entrenamiento consistio en preentrenamiento continuado (CPT) sobre el checkpoint de Llama 3.2 1B, segun indica la model card. No se documentan el numero de tokens adicionales, la composicion del corpus, si hubo etapas de SFT, RLHF o DPO, ni hiperparametros como tasa de aprendizaje, batch size o numero de pasos. El unico dato de infraestructura es el uso de una GPU Ampere A100 de 80 GB de VRAM. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 3.2 1B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1B parametros.
- Generacion de codigo, presumiblemente reforzada por el CPT (el nombre "Fermicode" lo sugiere), aunque no se documenta ni se evalua.
- Soporte de tool calling y function calling: no documentado; Llama 3.2 1B incluye plantillas de chat, pero no hay evidencia de que el ajuste las preserve o mejore.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: la model card declara solo ingles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Prototipado local de asistentes de texto: al ocupar unos 2,5 GB en fp16 (y menos de 1 GB en cuantizacion de 4 bits), puede ejecutarse en portatiles con GPU modesta para pruebas de generacion de texto en ingles.
- Generacion de codigo en entornos con recursos limitados: si el CPT efectivamente especializo el modelo en codigo, encaja en autocompletado o sugerencias dentro de editores, aunque requiere validacion previa porque no hay benchmarks publicados.
- Fine-tuning posterior por parte de terceros: al ser un checkpoint de 1B con licencia Llama 3.2, sirve como base economica para ajustes especificos (SFT, LoRA) en una sola GPU de consumo.
- Clasificacion y extraccion de informacion en ingles: tareas de etiquetado, resumen o extraccion de entidades sobre textos cortos, donde el contexto y la calidad de un modelo de 1B pueden ser suficientes.
- Experimentacion academica con CPT: util como referencia para estudiar el efecto del preentrenamiento continuado sobre un modelo base conocido.
- Despliegue en edge o entornos sin conectividad: su tamano permite inferencia local en CPU o GPU integrada, con latencia aceptable para tareas no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con todos los campos marcados como "[More Information Needed]".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en fp16; en torno a 0,7-1 GB en cuantizacion de 4 bits (estimacion por tamano de parametros, no confirmada por el autor).
- GPU recomendadas: A100 80 GB fue la usada para el entrenamiento; para inferencia basta una GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, y potencialmente en CPU.
- Opciones de despliegue: transformers (soporte nativo, indicado en la model card), text-generation-inference (etiqueta presente en el repo) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Fermicode-1B | 1,24 B | no disponible | Llama 3.2 | Hugging Face, safetensors | CPT sin evaluacion publicada |
| meta-llama/Llama-3.2-1B | 1,24 B | 128 K (segun Meta) | Llama 3.2 | Hugging Face, amplio ecosistema | Modelo base oficial, con benchmarks publicados |
| Qwen2.5-1.5B | 1,54 B | 32 K (segun Qwen) | Apache 2.0 | Hugging Face, GGUF, amplio soporte | Alternativa con licencia permisiva |
| SmolLM2-1.7B | 1,71 B | 8 K (segun Hugging Face) | Apache 2.0 | Hugging Face, GGUF | Enfoque en eficiencia y despliegue local |

Los datos de contexto y licencia de los modelos comparados provienen de sus respectivas documentaciones publicas; los de Fermicode-1B no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto.
- Riesgo de alucinacion elevado por el tamano (1B parametros) y por la ausencia de etapas documentadas de alineacion (RLHF/DPO).
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Licencia Llama 3.2: impone restricciones de uso comercial (politica de uso aceptable de Meta, obligaciones de atribucion y limitaciones para empresas con mas de 700 millones de usuarios mensuales), por lo que conviene revisarla antes de produccion.
- No se publican pesos cuantizados ni artefactos GGUF, lo que limita el despliegue inmediato en herramientas como Ollama o llama.cpp.
- Sin benchmarks ni evaluacion independiente, no es posible verificar que el CPT haya mejorado las capacidades del modelo base; podria incluso haber degradado el rendimiento en tareas generales.
- Cero "likes" y 816 descargas en el momento de la consulta: ecosistema minimo y sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranavupadhyaya52/Fermicode-1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
