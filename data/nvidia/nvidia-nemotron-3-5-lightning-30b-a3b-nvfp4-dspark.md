# nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark

## Resumen

NVIDIA Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark es un checkpoint de decodificacion especulativa (draft model) publicado por NVIDIA para su familia Nemotron-3.5-Lightning-30B-A3B, un modelo de lenguaje hibrido LatentMoE orientado a razonamiento, chat y flujos agenticos. No es un modelo objetivo autonomo: se usa junto al modelo principal para acelerar la generacion mediante el esquema DSpark (decodificacion especulativa con planificacion de confianza y generacion semiautoregresiva), reduciendo la latencia en despliegues de baja concurrencia y en hardware DGX Spark.

El checkpoint esta cuantizado en NVFP4 con NVIDIA Model Optimizer 0.45.0 y contiene 967 millones de parametros totales (615 millones no pertenecientes a embeddings), segun la model card. La arquitectura del draft es densa, con MLP denso y atencion GQA causal con ventana deslizante de 1024 tokens en todas las capas y sesgo de attention sink por cabeza. El modelo base al que asiste soporta hasta 1 millon de tokens de contexto y esta disponible en variantes BF16 y NVFP4.

Su relevancia practica esta en el coste de inferencia: al actuar como modelo borrador sobre el objetivo Nemotron-3.5-Lightning-30B-A3B, permite servir cargas de razonamiento, RAG y agentes con menor latencia por token en GPUs Blackwell (incluida DGX Spark con GB10) y Hopper, siempre a traves de vLLM. La licencia es OpenMDW-1.1 y el autor declara uso comercial permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa: MLP denso + atencion GQA causal con sliding window de 1024 y attention sink por cabeza (modulo DSpark de decodificacion especulativa) |
| Parametros totales | 967 M (615 M no-embedding) |
| Parametros activos | no disponible (no es MoE; el modelo objetivo al que asiste si es LatentMoE) |
| Longitud de contexto | hasta 1 M tokens (modelo base); el draft usa ventana deslizante de 1024 por capa |
| Tipos de cuantizacion | NVFP4 (cuantizado con NVIDIA Model Optimizer 0.45.0); el modelo base existe tambien en BF16 |
| Idiomas soportados | ingles, espanol, frances, aleman, italiano y japones |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (repo de 2,7 GB) |

## Arquitectura y entrenamiento

El checkpoint DSpark es un modelo denso de 967 M de parametros con MLP denso y capas de atencion GQA causal. Cada capa aplica una ventana deslizante de 1024 tokens y un sesgo de attention sink por cabeza, un diseno pensado para generar borradores de tokens rapidos y baratos que el modelo objetivo verifica. El modelo objetivo de la familia, Nemotron-3.5-Lightning-30B-A3B, es un transformer hibrido LatentMoE con capacidades de razonamiento y llamada a herramientas; el draft no replica esa arquitectura, sino que se acopla a ella en el pipeline de decodificacion especulativa.

El entrenamiento del modulo DSpark se realizo sobre prompts sintetizados a partir de Nemotron-Post-Training-Dataset-v2 y v3 (solo se usaron los prompts, no las respuestas originales de GPT), con 66 mil millones de tokens de texto repetidos durante 2 epocas. La recoleccion y el etiquetado de datos combinan metodos automatizados, manuales y sinteticos. El esquema DSpark combina planificacion de confianza con generacion semiautoregresiva, lo que permite proponer varios tokens por paso y validarlos contra el modelo objetivo.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre Nemotron-3.5-Lightning-30B-A3B (no debe usarse como modelo objetivo independiente).
- Soporte de los flujos del modelo base: razonamiento, chat, RAG y cargas agenticas.
- Salidas que pueden incluir respuestas en lenguaje natural, trazas de razonamiento, contenido de uso de herramientas y salidas estructuradas, segun la plantilla de chat y el tooling de la aplicacion.
- Cobertura multilingue heredada del objetivo: ingles, espanol, frances, aleman, italiano y japones.
- Integracion con vLLM como unico runtime declarado por el autor.
- Compatibilidad con GPUs NVIDIA Blackwell (incluida DGX Spark, GB10) y Hopper, sobre Linux.

## Casos de uso

- Servicio de razonamiento de baja latencia: desplegar el par objetivo + DSpark en vLLM para reducir el tiempo por token en cargas interactivas de razonamiento, donde la decodificacion especulativa amortiza el coste del borrador.
- Inferencia en DGX Spark (GB10): el checkpoint esta ajustado explicitamente para este hardware y para escenarios de baja concurrencia, lo que permite servir Nemotron-3.5-Lightning-30B-A3B en un equipo de escritorio con aceleracion.
- Chat con contexto largo: el modelo objetivo admite hasta 1 M tokens, y el draft acelera la generacion de respuestas sobre documentos extensos en flujos de resumen y preguntas y respuestas.
- RAG en produccion: combinar recuperacion con el par objetivo + DSpark para reducir la latencia de las respuestas generadas en pipelines de atencion documental.
- Flujos agenticos con tool calling: el modelo base emite contenido de uso de herramientas y salidas estructuradas; el draft acelera los turnos intermedios de planificacion y llamada a funciones.
- Despliegue multilingue en Europa: atender consultas en espanol, frances, aleman, italiano e ingles con un unico par de modelos y latencia reducida.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: usar el checkpoint como referencia para medir la ganancia de throughput frente a la generacion autoregresiva pura en Blackwell y Hopper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el draft: el repo ocupa 2,7 GB en safetensors NVFP4; el modelo objetivo Nemotron-3.5-Lightning-30B-A3B en NVFP4 requiere su propio presupuesto de memoria, que no se detalla en la informacion disponible.
- GPUs recomendadas: NVIDIA Blackwell, incluida DGX Spark (GB10), y NVIDIA Hopper.
- GPU de consumo: no disponible; el autor solo declara compatibilidad con Blackwell y Hopper.
- Despliegue: vLLM es el unico runtime declarado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que el checkpoint esta pensado para despliegues de baja concurrencia y DGX Spark, sin cifras publicadas.
- Sistema operativo: Linux.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Runtime |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark (este) | 967 M (draft) | 1 M en el objetivo; ventana de 1024 en el draft | Draft de decodificacion especulativa | OpenMDW-1.1 | vLLM |
| Nemotron-3.5-Lightning-30B-A3B-NVFP4 | no disponible | 1 M | Modelo objetivo cuantizado NVFP4 | OpenMDW-1.1 | vLLM |
| Nemotron-3.5-Lightning-30B-A3B-BF16 | no disponible | 1 M | Modelo objetivo en BF16 | OpenMDW-1.1 | vLLM |

No se dispone de datos de benchmarks ni de otros modelos borrador comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: la model card indica que esta pensado para servir con asistencia DSpark sobre Nemotron-3.5-Lightning-30B-A3B, no como checkpoint objetivo independiente.
- Dependencia de hardware: solo se declara compatibilidad con NVIDIA Blackwell (GB10, DGX Spark) y Hopper; no hay soporte documentado para otras arquitecturas.
- Dependencia de software: vLLM es el unico runtime soportado; no se documentan alternativas.
- Riesgo de alucinacion: las salidas pueden incluir trazas de razonamiento y contenido de herramientas; la calidad final depende del modelo objetivo y de la verificacion en el pipeline especulativo.
- Idiomas: cobertura declarada de seis idiomas; el rendimiento fuera de ellos no esta documentado.
- Licencia: OpenMDW-1.1 permite uso comercial segun la model card, pero conviene revisar los terminos completos antes de un despliegue en produccion.
- Validacion: el autor recomienda pruebas especificas del caso de uso antes de integrar el modelo en sistemas en produccion.
- Datos de rendimiento: no hay cifras publicadas de latencia, throughput ni benchmarks, lo que impide estimar la ganancia real sin medirla en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Paper DSpark: https://huggingface.co/papers/2607.05147
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Coleccion Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
