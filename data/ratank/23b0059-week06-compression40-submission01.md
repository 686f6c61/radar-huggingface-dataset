# RatanK/23B0059-Week06-Compression40-Submission01

## Resumen

PyroDash-4B-GRPO-Lambda-0.05 es un checkpoint de ajuste fino publicado en HuggingFace bajo el identificador `RatanK/23B0059-Week06-Compression40-Submission01`. Se trata de la tercera etapa (GRPO con penalizacion de eficiencia lambda = 0,05) de la pipeline de entrenamiento PyroDash, partiendo de `PyroDash-4B-SFT` y, en ultima instancia, del modelo base `Qwen/Qwen3.5-4B`. El modelo pertenece a la categoria de inferencia colaborativa entre un modelo pequeno local y un modelo grande remoto: el modelo pequeno emite de forma autonoma el token de control `<|llm_offload|>` durante la decodificacion autorregresiva y un motor de colaboracion deriva la cadena de razonamiento al modelo grande cuando aparece esa senal.

El problema que aborda es el coste de computo en la nube asociado a los sistemas de enrutamiento entre modelos. A diferencia de propuestas como RouteLLM o GlimpRouter, que deciden a nivel de consulta completa si se invoca al modelo grande, PyroDash opera a nivel de token y no requiere ni un modelo enrutador adicional ni reentrenar el modelo grande, lo que lo hace compatible con servicios LLM de codigo cerrado. La variante lambda = 0,05 es el punto de operacion orientado a calidad: segun los resultados declarados por el autor, alcanza un 64,04 % de precision media, por encima del propio GLM-5.2-FP8 (57,68 %), a costa de consumir un 95,34 % de tokens del modelo grande.

El modelo tiene aproximadamente 4.000 millones de parametros (heredados del base Qwen3.5-4B), se distribuye con licencia Apache 2.0, soporta ingles y chino, y declara la pipeline `image-text-to-text`, lo que implica capacidades multimodales de entrada imagen-texto. El repositorio ocupa 4,0 GB y no registra descargas ni valoraciones en el momento de la consulta. No se especifica en la informacion disponible la longitud de contexto, los tipos de cuantizacion soportados ni los detalles arquitectonicos internos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada de Qwen/Qwen3.5-4B. Modelo transformer con pipeline declarada `image-text-to-text` (entrada imagen-texto) |
| Parametros totales | Aproximadamente 4.000 millones (segun la denominacion del modelo base Qwen3.5-4B; no se declara cifra exacta) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El checkpoint se publica en precision bfloat16; no se mencionan variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | Repositorio de 4,0 GB con libreria `transformers`; no se especifica explicitamente el formato (safetensors u otro) |
| Token especial | `<|llm_offload|>` (token de control de offload, debe estar presente en el tokenizador) |
| Modelo base | Qwen/Qwen3.5-4B |
| Checkpoint de inicializacion | PyroDash-4B-SFT |
| Etapa de entrenamiento | Etapa 3: GRPO con lambda = 0,05 (orientado a calidad) |
| Dataset de SFT | pyromind/easyhard-24k (EasyHard-24K) |
| Dataset de GRPO | BytedTsinghua-SIA/DAPO-Math-17k |
| Modelo experto (entrenamiento/evaluacion) | GLM-5.2-FP8 (congelado) |
| Precision | bfloat16 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

PyroDash es un paradigma de razonamiento dinamico a nivel de token para inferencia colaborativa entre modelos pequenos y grandes. El modelo pequeno genera texto de forma autorregresiva y, en el momento que considera oportuno, emite el token de control `<|llm_offload|>`; el motor de colaboracion intercepta esa senal y transfiere la cadena de razonamiento local a un modelo grande. Este diseno no necesita un modelo enrutador separado, no requiere reentrenar el modelo grande y es compatible con APIs de LLM de codigo cerrado, ya que solo se apoya en la interfaz de generacion estandar. La arquitectura subyacente corresponde a Qwen3.5-4B, un transformer multimodal (pipeline `image-text-to-text`) de aproximadamente 4.000 millones de parametros; la informacion disponible no detalla el numero de capas, dimensiones ocultas, tipo de atencion ni si incorpora componentes MoE o SSM.

El entrenamiento sigue una pipeline progresiva de tres etapas. La primera entrena la capa de embeddings del token de control para que el modelo pequeno adquiera la expresividad basica de offload. La segunda realiza un arranque en frio (cold start) de la capacidad de derivacion, estableciendo el patron de colaboracion entre modelo pequeno y grande. La tercera, que corresponde a este checkpoint, aplica GRPO sobre el dataset DAPO-Math-17k con una funcion de recompensa conjunta que combina precision de la tarea y penalizacion por coste de llamadas al modelo grande, con lambda = 0,05. Valores de lambda mas altos (0,1 y 0,6) producen politicas mas agresivas en la reduccion de coste. El modelo experto utilizado durante entrenamiento y evaluacion fue GLM-5.2-FP8, congelado. La etapa previa de SFT uso el dataset EasyHard-24K.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con etiqueta `conversational` en la model card.
- Razonamiento matematico: es la capacidad central del ajuste, ya que la etapa GRPO se entreno sobre DAPO-Math-17k y la evaluacion se realiza sobre GSM8K, Minerva, Olympiad, AIME 2024 y AIME 2025.
- Entrada multimodal imagen-texto: la pipeline declarada es `image-text-to-text`, por herencia del modelo base Qwen3.5-4B.
- Offload dinamico a un modelo grande: emision autonoma del token de control `<|llm_offload|>` durante la decodificacion en streaming, que activa la derivacion de la cadena de razonamiento a un LLM remoto.
- Politica adaptativa de coste: la penalizacion lambda permite elegir entre distintos puntos de operacion calidad-coste dentro de la misma familia de checkpoints.
- Compatibilidad con servicios LLM de codigo cerrado: solo necesita un endpoint compatible con OpenAI para el modelo grande, sin reentrenarlo.
- No se menciona en la informacion disponible soporte explicito de tool calling, function calling, uso de agentes, modo thinking independiente, audio ni otras capacidades especiales.

## Casos de uso

- Razonamiento matematico asistido con escalado selectivo: el modelo resuelve localmente los pasos sencillos y delega en un LLM grande unicamente cuando emite `<|llm_offload|>`, lo que permite aplicar un modelo grande caro solo a los fragmentos de razonamiento que realmente lo requieren.
- Evaluacion comparativa de politicas de enrutamiento: sirve como punto de operacion orientado a calidad en estudios que comparan enrutamiento a nivel de consulta (RouteLLM, GlimpRouter) frente a enrutamiento a nivel de token.
- Investigacion en decodificacion colaborativa: util como checkpoint reproducible para experimentar con el motor PyroDash, ya que el repositorio incluye scripts de evaluacion con vLLM y un endpoint compatible con OpenAI.
- Construccion de asistentes tecnicos bilingues (ingles y chino) donde el coste de la API del modelo grande deba justificarse por precision: la variante lambda = 0,05 prioriza respuestas correctas sobre ahorro.
- Sistemas de tutoria o correccion de ejercicios de matematicas: el modelo puede combinar su capacidad de vision (entrada imagen-texto) para leer un problema manuscrito o fotografiado y razonar sobre el con precision reforzada por el modelo experto.
- Reproduccion academica y docencia: al tratarse de un envio de curso (identificador `23B0059-Week06-Compression40-Submission01`), resulta adecuado como material de estudio de pipelines SFT + GRPO con recompensas multiobjetivo.
- Analisis de compromiso coste-calidad en produccion: el mismo autor publica la variante lambda = 0,6, con un 1,90 % de tokens del modelo grande y un coste declarado de 1,78 dolares, lo que permite desplegar la politica segun el presupuesto disponible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La evaluacion por defecto del script `evaluation/math_eval.sh` cubre GSM8K, Minerva, Olympiad, AIME 2024 y AIME 2025; no se especifica en la informacion disponible la desagregacion por dataset.

| Metodo | Precision media (%) | Ratio de tokens del LLM (%) | Llamadas medias al LLM | Coste (USD) |
|---|---:|---:|---:|---:|
| Qwen3.5-4B | 28,36 | 0,00 | 0,000 | 2,26 |
| Qwen3.5-4B (+SFT) | 46,25 | 0,00 | 0,000 | 1,32 |
| RouteLLM (~75 % GLM-5.2-FP8) | 52,74 | 77,37 | 0,808 | 44,62 |
| GlimpRouter (tau = 0,9) | 54,20 | 75,11 | 1,20 | 31,61 |
| PyroDash (lambda = 0,1) | 55,29 | 8,19 | 0,058 | 4,71 |
| PyroDash (lambda = 0,6) | 54,55 | 1,90 | 0,012 | 1,78 |
| **PyroDash (lambda = 0,05) — este checkpoint** | **64,04** | **95,34** | **0,975** | **39,29** |
| GLM-5.2-FP8 | 57,68 | 100,00 | 1,000 | 49,36 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K desagregado. Los unicos datos cuantitativos son los de la tabla anterior, que corresponde a la agregacion de los benchmarks matematicos citados segun la configuracion del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 8-9 GB solo para los pesos de un modelo de ~4.000 millones de parametros, mas la cache KV y los estados de activacion. No se declara una cifra oficial en la informacion disponible.
- GPU consumer: cabe en tarjetas con 12 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, RTX 3090). En GPUs de 8 GB seria necesario cuantizar, pero no se han publicado variantes cuantizadas de este checkpoint.
- GPU de centro de datos: A100, H100, L40S o similares son suficientes y permiten mayor paralelismo y mayor tamano de lote.
- Despliegue: el autor proporciona y documenta explicitamente el uso de un servidor vLLM local (puerto 8001) para el modelo pequeno. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Requisito adicional de infraestructura: el sistema completo necesita acceso a un LLM grande servido en un endpoint compatible con OpenAI (en la evaluacion del autor, GLM-5.2-FP8), con su correspondiente clave de API y coste asociado.
- Tokenizador: debe incluir el token especial `<|llm_offload|>`; de lo contrario, el mecanismo de offload no funciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision media (%) | Tokens del LLM (%) | Coste (USD) | Licencia / disponibilidad |
|---|---|---:|---:|---:|---|
| PyroDash-4B-GRPO-Lambda-0.05 | ~4.000 M | 64,04 | 95,34 | 39,29 | Apache 2.0; requiere LLM grande externo |
| PyroDash-4B-GRPO-Lambda-0.1 | ~4.000 M | 55,29 | 8,19 | 4,71 | Apache 2.0; mismo repositorio de proyecto |
| PyroDash-4B-GRPO-Lambda-0.6 | ~4.000 M | 54,55 | 1,90 | 1,78 | Apache 2.0; publicado por pyromind |
| PyroDash-4B-SFT | ~4.000 M | 46,25 | 0,00 | 1,32 | Apache 2.0; publicado por pyromind |
| Qwen3.5-4B (base) | ~4.000 M | 28,36 | 0,00 | 2,26 | Apache 2.0; modelo base publico |
| RouteLLM (~75 % GLM-5.2-FP8) | No aplica (enrutador) | 52,74 | 77,37 | 44,62 | No disponible en la informacion proporcionada |
| GlimpRouter (tau = 0,9) | No aplica (enrutador) | 54,20 | 75,11 | 31,61 | No disponible en la informacion proporcionada |
| GLM-5.2-FP8 | No disponible | 57,68 | 100,00 | 49,36 | No disponible en la informacion proporcionada |

No se dispone de datos de contexto, cuantizacion ni licencia de los metodos comparados, ya que la informacion proporcionada solo incluye sus resultados agregados de precision y coste.

## Limitaciones y advertencias

- Identificador y procedencia: el repositorio pertenece al usuario `RatanK` y lleva un nombre de envio de curso (`23B0059-Week06-Compression40-Submission01`), mientras que la model card referencia la organizacion `pyromind`. No se aclara la relacion entre ambas cuentas ni si el contenido es identico a los checkpoints oficiales.
- Sin validacion de la comunidad: cero descargas y cero valoraciones en el momento de la consulta, por lo que los resultados declarados no han sido verificados de forma independiente.
- Dependencia de un modelo grande externo: el modelo esta disenado para funcionar dentro del motor PyroDash. Sin el motor de colaboracion y sin acceso a un LLM grande compatible con OpenAI, el token `<|llm_offload|>` no produce ningun efecto util y el rendimiento cae al del modelo pequeno.
- Coste del punto de operacion: la variante lambda = 0,05 consume un 95,34 % de tokens del modelo grande y un coste declarado de 39,29 dolares en la evaluacion, mas del doble que lambda = 0,1. Solo tiene sentido cuando la precision es prioritaria sobre el ahorro.
- Dominio de entrenamiento restringido: la etapa GRPO se entreno exclusivamente sobre DAPO-Math-17k y la evaluacion se limita a benchmarks matematicos. No hay evidencia declarada de rendimiento en codigo, tareas administrativas, dialogo abierto u otros dominios.
- Idiomas limitados: solo ingles y chino. No se declara soporte de castellano ni de otras lenguas.
- Contexto desconocido: no se publica la longitud de contexto del modelo base ni del checkpoint ajustado, lo que impide garantizar conversaciones o documentos largos.
- Riesgo de alucinacion: no se declara ningun mecanismo de mitigacion ni evaluacion de veracidad; el ajuste esta orientado a recompensas de precision matematica, no a factualidad general.
- Sesgos: no disponible. No se incluye informacion sobre composicion del dataset de SFT (EasyHard-24K) mas alla de su nombre, ni analisis de sesgos.
- Cuantizacion: al no existir variantes GGUF, AWQ o GPTQ publicadas, el despliegue en hardware limitado exige cuantizar manualmente, con el riesgo de degradar la politica de offload aprendida.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el coste real de produccion incluye las llamadas al modelo grande, cuya licencia y condiciones son independientes de este repositorio.
- Resultados no reproducibles de forma trivial: las cifras dependen del modelo experto concreto (GLM-5.2-FP8) y de su version servida; cambiar de LLM grande altera la precision y el coste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RatanK/23B0059-Week06-Compression40-Submission01
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Checkpoint SFT (PyroDash-4B-SFT): https://huggingface.co/pyromind/PyroDash-4B-SFT
- Checkpoint GRPO lambda = 0,6: https://huggingface.co/pyromind/PyroDash-4B-GRPO-Lambda-0.6
- Repositorio de codigo de PyroDash: https://github.com/PyroMind-Dynamics/pyroDash
- Script de evaluacion matematica: https://github.com/PyroMind-Dynamics/pyroDash/blob/main/evaluation/math_eval.sh
- Sitio web del proyecto: https://PyroMind-Dynamics.github.io/pyroDash/
- Dataset de SFT EasyHard-24K: https://huggingface.co/datasets/pyromind/easyhard-24k
- Dataset de GRPO DAPO-Math-17k: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Organizacion en HuggingFace: https://huggingface.co/pyromind
- Cita del proyecto: `@misc{pyrodash2026, title = {PyroDash: Cost-Efficient Token-Level Small-Large Model Collaborative Inference}, author = {{PyroMind Dynamics}}, year = {2026}, note = {Preprint}}`

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces anteriores proceden unicamente de la model card del repositorio. No se ha localizado preprint publicado, articulo en arXiv ni demo adicional.
