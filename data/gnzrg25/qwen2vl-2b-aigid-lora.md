# gnzrg25/Qwen2VL-2B-AIGID-LoRA

## Resumen

Qwen2VL-2B-AIGID-LoRA es un adaptador LoRA desarrollado por el equipo OptimAI (usuario gnzrg25) que se monta sobre el modelo base Qwen/Qwen2-VL-2B-Instruct para una tarea muy concreta: la deteccion de imagenes generadas por inteligencia artificial. El adaptador obtuvo el primer puesto en la categoria LoRA del Track 3 del LPCVC 2026 (Low-Power Computer Vision Challenge), presentado en el ECV Workshop de CVPR 2026 en Denver, con una puntuacion de leaderboard de 0,827 y 30,48 TPS.

No se trata de un modelo de proposito general, sino de un artefacto de competicion especializado. El flujo de despliegue descrito por el autor consiste en fusionar el adaptador con el modelo base, cuantizarlo mediante Qualcomm AIMET (W4A16 para el decodificador, W8A16 para el codificador visual) y exportarlo como binario QNN para el SoC Snapdragon 8 Elite Gen 5 en dispositivos moviles.

Su relevancia radica en dos factores: demuestra que un VLM de 2B parametros puede ajustarse con LoRA para una tarea de clasificacion binaria visual con rendimiento competitivo, y documenta un pipeline completo de optimizacion para inferencia en hardware movil de Qualcomm, un caso de uso poco frecuente en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen2-VL (vision encoder + decoder) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2-VL-2B-Instruct tiene 2B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2-VL soporta contexto largo, pero no se especifica aqui) |
| Tipos de cuantizacion | W4A16 (decoder) y W8A16 (vision encoder) via Qualcomm AIMET, para exportacion QNN |
| Idiomas soportados | No disponible |
| Licencia | MIT (adaptador); el modelo base se rige por Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); exportable a binario QNN tras fusion y cuantizacion |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2-VL-2B-Instruct, un modelo vision-language con codificador visual y decodificador de texto autorregresivo. El LoRA utiliza r=64 y alpha=128, con atencion sdpa, longitud de secuencia de 2048 tokens y resolucion de imagen de 342x512 pixeles. El entrenamiento se realizo durante 5 epocas con learning rate 3e-4, batch size efectivo de 12 (4 por GPU en 3 GPUs con acumulacion de gradientes de 2) y label smoothing de 0,05.

El dataset de ajuste es gnzrg25/LPCVC2026-Track3-Finetune-64k, publicado por el mismo autor, orientado a la discriminacion entre imagenes reales y sinteticas. No se documentan en la model card el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO; el ajuste parece ser supervisado estandar sobre la tarea de deteccion. La innovacion tecnica principal no esta en el entrenamiento sino en el pipeline de despliegue: fusion del adaptador, cuantizacion mixta con AIMET y exportacion a QNN para Snapdragon 8 Elite Gen 5, lo que permite ejecutar el modelo en un dispositivo movil con restricciones termicas y de memoria.

## Capacidades

- Deteccion de imagenes generadas por IA: tarea principal para la que fue entrenado el adaptador, formulada como clasificacion image-text-to-text.
- Razonamiento visual multimodal heredado del modelo base Qwen2-VL-2B-Instruct (descripcion de imagenes, respuesta a preguntas visuales), aunque el ajuste LoRA puede degradar capacidades generales no relacionadas con la tarea objetivo.
- Generacion de texto conversacional a partir de entradas imagen-texto, segun el pipeline declarado (image-text-to-text, conversational).
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no documentadas en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponibles.

## Casos de uso

- Moderacion de contenido en plataformas: el adaptador puede clasificar imagenes subidas por usuarios como reales o generadas por IA, integrandose en un pipeline previo a la publicacion para etiquetar o bloquear contenido sintetico.
- Verificacion periodistica: redacciones pueden usar el modelo para triage rapido de imagenes recibidas de agencias o redes sociales, marcando candidatas a verificacion manual antes de publicacion.
- Deteccion de fraude documental: en procesos de KYC o seguros, el modelo puede senalar imagenes sospechosas de sintesis (capturas, fotos de danos, documentos escaneados) para revision humana.
- Despliegue en movil con Snapdragon 8 Elite Gen 5: gracias a la exportacion QNN con cuantizacion W4A16/W8A16, el modelo puede ejecutarse on-device en apps de camara o galeria para etiquetado en tiempo real sin enviar imagenes a la nube.
- Investigacion en deteccion de deepfakes y sintesis de imagen: sirve como linea base reproducible para comparar tecnicas de deteccion, dado que el codigo y el dataset estan publicados.
- Filtrado en datasets de entrenamiento: util para limpiar corpus de imagenes que se usaran para entrenar otros modelos generativos, eliminando muestras sinteticas no deseadas.
- Benchmarking de eficiencia en edge: el pipeline completo (fusion + AIMET + QNN) es un ejemplo documentado para medir latencia y throughput de un VLM de 2B en hardware movil Qualcomm.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Leaderboard score (LPCVC 2026 Track 3) | 0,827 |
| Puntuacion en pagina de ganadores | 0,831 |
| Throughput (TPS) | 30,48 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador LoRA ocupa 0,3 GB en el repositorio; el modelo base de 2B requiere aproximadamente 4-5 GB en fp16, menos con cuantizacion de 8 o 4 bits.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento se mencionan 3 GPUs con batch size 4 por GPU, pero no se indica el modelo concreto.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o mas de VRAM en cuantizacion de 8 bits, aunque no esta documentado oficialmente.
- Opciones de despliegue: transformers + PEFT (referencia de la model card), fusion mediante train/merge_lora.py, cuantizacion con Qualcomm AIMET y exportacion QNN para Snapdragon 8 Elite Gen 5. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 30,48 TPS reportados en el entorno de evaluacion del LPCVC; no se especifica el hardware exacto de esa medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2VL-2B-AIGID-LoRA | 2B (base) + LoRA r=64 | No disponible | 0,827 en LPCVC 2026 Track 3 | MIT (adaptador), Apache 2.0 (base) | Hugging Face, 6 descargas |
| Qwen2-VL-2B-Instruct (base) | 2B | No disponible en esta ficha | No evaluado en esta tarea | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros participantes LPCVC 2026 Track 3 | No disponible | No disponible | Inferior a 0,827 segun leaderboard | No disponible | No disponible |

No se dispone de datos publicos sobre otros detectores de imagenes generadas por IA comparables en parametros y licencia dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado exclusivamente para deteccion de imagenes generadas por IA; su uso como VLM general puede dar resultados degradados respecto al modelo base.
- Sesgos del dataset: el rendimiento depende de la distribucion de gnzrg25/LPCVC2026-Track3-Finetune-64k; generadores de imagen no representados en el entrenamiento pueden escapar a la deteccion.
- Riesgo de falsos positivos y negativos: la tarea es adversarial por naturaleza; los generadores evolucionan y el modelo puede quedar obsoleto rapidamente sin reentrenamiento.
- Alucinacion: como modelo generativo, puede producir justificaciones textuales plausibles pero incorrectas sobre por que una imagen es sintetica.
- Contexto e idiomas: no documentados; no se garantiza un comportamiento multilingue ni un contexto largo especifico en el adaptador.
- Licencia: el adaptador es MIT, pero el modelo base Qwen2-VL-2B-Instruct esta bajo Apache 2.0 con sus propios terminos; el uso comercial combinado debe respetar ambas licencias.
- Pipeline de despliegue movil dependiente de Qualcomm: la exportacion QNN y la cuantizacion AIMET estan atadas al ecosistema Snapdragon y a herramientas propietarias de Qualcomm, lo que limita la portabilidad.
- Madurez: solo 6 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente fuera del benchmark de competicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnzrg25/Qwen2VL-2B-AIGID-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/gnzrg25/LPCVC2026-Track3-Finetune-64k
- Codigo del equipo: https://github.com/Ganzooo/LPCVC2026-Track3-OptimAI-1st
- Resultados oficiales LPCVC 2026: https://lpcv.ai/2026LPCVC/winners/
- Licencia del codigo: https://github.com/Ganzooo/LPCVC2026-Track3-OptimAI-1st/blob/main/LICENSE
