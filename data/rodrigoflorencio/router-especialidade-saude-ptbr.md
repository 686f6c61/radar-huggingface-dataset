# RodrigoFlorencio/Router-Especialidade-Saude-PTBR

## Resumen

Router-Especialidade-Saude-PTBR es un ajuste fino (fine-tuning) supervisado del modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario RodrigoFlorencio. El modelo se ha entrenado con la librería TRL sobre el dataset `duvidas-saude-ptbr`, un conjunto de datos orientado a preguntas y dudas del ambito sanitario en portugues de Brasil. Por el nombre y la composicion del dataset, el modelo parece concebido como un clasificador o enrutador ("router") de especialidades medicas, aunque la model card no lo confirma explicitamente.

El modelo tiene aproximadamente 4.000 millones de parametros, heredados del Qwen3-4B-Base, y se distribuye en formato safetensors con un tamano de repositorio de 0,8 GB (lo que sugiere pesos en precision reducida, probablemente bf16 o fp16 con algun grado de compresion). La informacion publicada es muy escasa: no se detallan hiperparametros de entrenamiento, numero de tokens, composicion del dataset ni resultados de evaluacion.

Su relevancia es limitada y experimental: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Resulta util unicamente como punto de partida para experimentacion con ajuste fino de Qwen3 en dominios sanitarios en portugues, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B-Base); detalles especificos no disponibles |
| Parametros totales | ~4.000 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la del modelo base Qwen3-4B-Base no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles (el dataset de entrenamiento es en portugues de Brasil) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only de la familia Qwen3. No se aporta informacion adicional sobre la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion, uso de RoPE, etc.) en la informacion proporcionada. El ajuste se ha realizado mediante SFT (supervised fine-tuning) con TRL 1.17.1, Transformers 5.22.1, PyTorch 2.15.0, Datasets 5.1.0 y Tokenizers 0.23.3.

El dataset de entrenamiento es `duvidas-saude-ptbr`, del que no se especifican numero de ejemplos, composicion ni proceso de curacion. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. Tampoco se detallan hiperparametros (learning rate, epochs, batch size, schedule) ni si se congelaron capas. No se declara ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva basada en el modelo base Qwen3-4B-Base.
- Ajuste especifico sobre preguntas y dudas sanitarias en portugues de Brasil (dataset `duvidas-saude-ptbr`).
- Posible funcion de enrutamiento o clasificacion de especialidades medicas, segun sugiere el nombre del modelo; no confirmado en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el entrenamiento se limita al portugues de Brasil.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de consultas sanitarias por especialidad: el modelo podria recibir una pregunta de un paciente en portugues y devolver la especialidad medica mas adecuada, aprovechando el ajuste sobre `duvidas-saude-ptbr`. Es el uso mas coherente con el nombre del modelo, aunque no esta validado con metricas.
- Triaje inicial en portales de salud: integrado en un formulario o chatbot, podria etiquetar la consulta del usuario para dirigirla al servicio correspondiente (atencion primaria, cardiologia, dermatologia, etc.).
- Prototipado de asistentes de salud en portugues: sirve como base para experimentar con ajuste fino adicional en un dominio sanitario concreto, dado su bajo coste de inferencia (4B parametros).
- Generacion de respuestas informativas sobre dudas de salud: el modelo puede producir texto en portugues sobre temas sanitarios, aunque sin garantias de precision clinica.
- Investigacion sobre ajuste fino de Qwen3 en dominios especializados: util como referencia metodologica para comparar estrategias de SFT con TRL en un dominio vertical.
- Filtrado y enrutamiento en pipelines de datos clinicos: podria emplearse para clasificar grandes volumenes de texto sanitario en portugues antes de un procesamiento posterior.
- Experimentacion academica con modelos pequenos en portugues: su tamano (4B) permite ejecutarlo en una unica GPU consumer para pruebas docentes o de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4B parametros, en bf16/fp16 se requieren aproximadamente 8-10 GB de VRAM; en cuantizacion de 8 bits, unos 5-6 GB; en 4 bits, unos 3-4 GB. Estas cifras son estimaciones genericas y no estan confirmadas para este modelo concreto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar ejecucion comoda en GPUs con 16 GB o mas (RTX 4080/4090, A10, L4) y en A100/H100 para despliegues con mayor concurrencia.
- Compatibilidad con GPU consumer: probable en tarjetas con 8-16 GB de VRAM segun cuantizacion, aunque no confirmado.
- Opciones de despliegue: al ser un modelo de Transformers con safetensors, es compatible con `transformers` (pipeline), y previsiblemente con vLLM, TGI y llama.cpp/Ollama si se generan conversiones GGUF (no publicadas). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Router-Especialidade-Saude-PTBR | ~4B | No disponible | No disponible | Hugging Face (0 descargas) | Ajuste fino SFT sobre Qwen3-4B-Base, dominio sanitario PT-BR |
| Qwen/Qwen3-4B-Base | ~4B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face (modelo base publico) | Modelo base sin ajuste de dominio |
| Otros ajustes de Qwen3-4B en dominios verticales | ~4B | Variable | Variable | Hugging Face | No se dispone de comparaciones publicadas con este modelo concreto |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, precision ni robustez del ajuste.
- Model card practicamente vacia: no se documentan hiperparametros, composicion del dataset ni proceso de evaluacion.
- Licencia no especificada: el campo `licence: license` no concreta terminos, lo que impide determinar si el uso comercial esta permitido. Ademas, la licencia del modelo base Qwen3-4B-Base condiciona la distribucion y el uso derivado.
- Riesgo elevado de alucinacion en un dominio sensible como la salud: el modelo puede generar informacion medica incorrecta; no debe usarse para diagnostico ni consejo clinico sin supervision profesional.
- Idiomas: el entrenamiento se limita al portugues de Brasil; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos desconocidos: no se documenta ningun analisis de sesgos (genero, edad, origen, etc.) en el dataset ni en el modelo.
- Contexto: se desconoce la longitud de contexto efectiva tras el ajuste; no se recomienda asumir la del modelo base sin verificacion.
- Madurez: cero descargas y cero likes indican que no ha sido validado por la comunidad; no es apto para produccion sin una evaluacion propia exhaustiva.
- Sin versiones cuantizadas publicadas: el despliegue eficiente en hardware limitado requeriria generar conversiones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoFlorencio/Router-Especialidade-Saude-PTBR
- Modelo base Qwen/Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset duvidas-saude-ptbr: https://huggingface.co/datasets/duvidas-saude-ptbr
- Repositorio TRL: https://github.com/huggingface/trl
