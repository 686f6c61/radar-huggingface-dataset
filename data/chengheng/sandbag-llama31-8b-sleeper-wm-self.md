# Chengheng/sandbag-llama31-8b-sleeper-wm-self

## Resumen

El modelo `Chengheng/sandbag-llama31-8b-sleeper-wm-self` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Publicado por el usuario Chengheng en Hugging Face, el repositorio contiene únicamente los pesos del adaptador (0,2 GB) y no incluye una model card completa ni documentación técnica. El nombre del modelo sugiere una investigación relacionada con comportamientos de "sandbagging" (rendimiento deliberadamente reducido) y "sleeper agents" (agentes que actúan de forma maliciosa solo bajo ciertas condiciones), lo que apunta a un uso orientado a la seguridad y evaluación de modelos de IA, aunque no se proporciona ninguna descripción oficial que lo confirme.

Al tratarse de un adaptador PEFT, el modelo no es autónomo: requiere cargar el modelo base Llama-3.1-8B-Instruct y aplicar los pesos LoRA para obtener el comportamiento final. Dado que la información pública es mínima, esta ficha se basa en los datos disponibles en el repositorio y en las características conocidas del modelo base, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador pesa 0,2 GB; el modelo base tiene 8 030 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base soporta hasta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones comunes como 4-bit y 8-bit) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente ingles, aleman, frances, italiano, portugues, holandes, hindi, espanol y tailandes) |
| Licencia | No disponible (el modelo base usa la licencia Llama 3.1 de Meta, pero el adaptador no declara una) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA, que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atencion y de proyeccion. Esto permite un ajuste fino eficiente con un numero reducido de parametros entrenables. El modelo base, Llama-3.1-8B-Instruct, es un transformer autoregresivo con 32 capas, 8 030 millones de parametros y una ventana de contexto de 128 000 tokens, entrenado con un enfoque de instruccion y refinamiento mediante RLHF (Reinforcement Learning from Human Feedback).

No se dispone de informacion sobre el conjunto de datos de entrenamiento del adaptador, los hiperparametros utilizados (rango, alpha, dropout, etc.) ni el regimen de entrenamiento (precision, numero de epocas, etc.). El repositorio solo indica que se uso la libreria PEFT en su version 0.20.0. El nombre del modelo sugiere que el entrenamiento podria estar relacionado con la induccion de comportamientos de "sandbagging" o "sleeper agents", pero no hay evidencia publica que lo confirme.

## Capacidades

- Al ser un adaptador sobre Llama-3.1-8B-Instruct, hereda las capacidades generales del modelo base: generacion de texto, razonamiento, respuesta a instrucciones, soporte multilingue limitado y manejo de contexto largo (hasta 128 000 tokens).
- No se documentan capacidades especificas del adaptador. El nombre sugiere un comportamiento deliberadamente degradado o condicionado, pero no hay informacion oficial al respecto.
- No se menciona soporte para tool calling, function calling, agentes o modo de pensamiento explicito. Estas capacidades dependen del modelo base y de como se haya entrenado el adaptador.
- No se indica soporte para vision, audio u otras modalidades; el modelo base es exclusivamente de texto.

## Casos de uso

- Investigacion en seguridad de IA: el modelo podria utilizarse para estudiar comportamientos de "sandbagging" (rendimiento reducido intencionadamente) o "sleeper agents" (acciones maliciosas activadas por condiciones especificas). Los investigadores podrian analizar como el adaptador modifica el comportamiento del modelo base y disenar contramedidas.
- Evaluacion de alineacion y robustez: podria servir como caso de estudio para probar tecnicas de deteccion de comportamientos enganosos o para evaluar la capacidad de los modelos de mantener consistencia bajo presion.
- Pruebas de interpretabilidad: al ser un adaptador de bajo rango, es posible inspeccionar las matrices LoRA para entender que patrones se han modificado respecto al modelo base, lo que resulta util en analisis mecanicistas.
- Desarrollo de modelos defensivos: el adaptador podria usarse como ejemplo de un "modelo comprometido" para entrenar clasificadores o filtros que detecten respuestas sospechosas.
- Benchmarking de frameworks de inferencia: al ser un adaptador PEFT, se puede probar la compatibilidad de diferentes motores de inferencia (vLLM, TGI, etc.) con cargas LoRA sobre Llama-3.1-8B.
- Educacion y divulgacion: podria emplearse en cursos o talleres sobre seguridad en IA para ilustrar conceptos como "backdoor attacks" o "model poisoning".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco se proporcionan comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Llama-3.1-8B-Instruct junto con los pesos del adaptador. La VRAM necesaria depende de la cuantizacion del modelo base:
  - En precision fp16 (16 bits): aproximadamente 16 GB de VRAM.
  - En cuantizacion 8-bit: alrededor de 8-9 GB de VRAM.
  - En cuantizacion 4-bit: entre 4 y 6 GB de VRAM.
- El adaptador en si ocupa unos 0,2 GB, por lo que el consumo adicional es minimo.
- GPUs recomendadas: para fp16, una NVIDIA A100, RTX 4090 o similar; para 4-bit, una RTX 3060 o superior puede ser suficiente.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft`, o mediante servidores de inferencia como vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se empaqueta adecuadamente.
- No se dispone de datos de latencia o throughput para este adaptador especifico.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables en el mismo repositorio o con caracteristicas similares. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8 030 M | 128 000 | Llama 3.1 Community License | Hugging Face |
| Chengheng/sandbag-llama31-8b-sleeper-wm-self | Adaptador LoRA (0,2 GB) | No especificada (hereda 128 000) | No disponible | Hugging Face |

No se conocen otros adaptadores publicos con el mismo proposito (sandbagging/sleeper) en el momento de redactar esta ficha.

## Limitaciones y advertencias

- La documentacion es practicamente inexistente: no se especifican datos de entrenamiento, hiperparametros, licencia ni proposito. Esto impide evaluar su fiabilidad y seguridad.
- El nombre del modelo sugiere un comportamiento deliberadamente enganoso o degradado. Si se utiliza en produccion o en tareas reales, podria producir respuestas incorrectas o maliciosas de forma intencionada.
- No se han publicado evaluaciones de sesgos, alucinaciones o riesgos asociados. Al heredar las capacidades del modelo base, tambien hereda sus limitaciones conocidas (posibles sesgos de genero, raza o idioma, y tendencia a alucinar en contextos ambiguos).
- La licencia no esta declarada. Aunque el modelo base tiene una licencia de Meta que permite uso comercial con restricciones, el adaptador podria tener condiciones diferentes. Se recomienda contactar con el autor antes de cualquier uso comercial.
- No se garantiza la compatibilidad con versiones futuras de las librerias PEFT o transformers. El adaptador se creo con PEFT 0.20.0 y podria requerir actualizaciones.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chengheng/sandbag-llama31-8b-sleeper-wm-self
- Modelo base (Llama-3.1-8B-Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio del modelo base (Llama-3.1-8B): https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio de otro adaptador del mismo autor (Chengheng/llama8b-sleeper-v3): https://huggingface.co/Chengheng/llama8b-sleeper-v3
- Documentacion de PEFT: https://huggingface.co/docs/peft
