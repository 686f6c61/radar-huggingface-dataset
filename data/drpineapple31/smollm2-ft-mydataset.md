# Drpineapple31/SmolLM2-FT-MyDataset

## Resumen
SmolLM2-FT-MyDataset es un ajuste fino (fine-tuning) del modelo base HuggingFaceTB/SmolLM2-135M, publicado por el usuario Drpineapple31 en Hugging Face. Se trata de un modelo de generacion de texto de tipo causal (arquitectura transformer, familia llama) con 134.515.008 parametros, entrenado mediante SFT (supervised fine-tuning) con la libreria TRL sobre un dataset no especificado. El modelo forma parte del material didactico del curso "smol-course" (etiquetas module_1, smol-course), por lo que su proposito principal parece ser demostrativo o educativo mas que de produccion.

El modelo hereda del SmolLM2-135M la vocacion de ser un modelo pequeno, ligero y desplegable en hardware modesto, orientado a tareas de generacion de texto con un coste computacional minimo. El ajuste fino reporta una perdida de validacion de 1.0215 tras 1000 pasos de entrenamiento. No se especifican los datos de entrenamiento, los idiomas soportados ni capacidades adicionales mas alla de la generacion de texto conversacional.

La relevancia de este modelo es limitada: se trata de un artefacto derivado de un experimento de fine-tuning con informacion incompleta (la propia model card indica "More information needed" en varias secciones). Resulta util como referencia para quienes estudien el flujo de trabajo de SFT con TRL sobre SmolLM2, pero no constituye una opcion recomendable para despliegues reales sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia llama) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del SmolLM2-135M, un transformer causal de 135 millones de parametros de la familia arquitectonica llama. El entrenamiento se realizo con la libreria TRL (SFT) sobre un dataset no identificado en la model card. Los hiperparametros documentados son: learning rate de 5e-05, batch de entrenamiento de 4, batch de evaluacion de 8, semilla 42, optimizador Adam con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 1000 pasos de entrenamiento. Las versiones de framework utilizadas fueron Transformers 4.44.2, PyTorch 2.9.0+cpu, Datasets 2.21.0 y Tokenizers 0.19.1.

La curva de entrenamiento muestra una perdida de entrenamiento que desciende desde 1.0715 (paso 50) hasta 0.7959 (paso 1000), con una perdida de validacion que baja de 1.1590 a 1.0215. El numero de epocas registrado en la tabla alcanza 1.7699 al paso 1000, lo que sugiere un dataset de tamano reducido. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones tecnicas destacables (decodificacion especulativa, atencion lineal, etc.).

## Capacidades
- Generacion de texto autoregresiva y conversacional, heredada del modelo base SmolLM2-135M.
- Ajuste fino supervisado (SFT) orientado a tareas de instruccion o dialogo, aunque el dataset de entrenamiento no esta documentado.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (los idiomas no estan especificados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Razonamiento, codigo y matematicas: no evaluado ni documentado en la informacion proporcionada.

## Casos de uso
- Experimentacion educativa con SFT: el modelo sirve como ejemplo practico del flujo de fine-tuning con TRL sobre SmolLM2 dentro del curso "smol-course"; permite reproducir el pipeline de entrenamiento y estudiar la evolucion de las curvas de perdida.
- Prototipado rapido de chatbots ligeros: gracias a sus 135 millones de parametros, puede ejecutarse en CPU o en GPUs de gama baja para validar ideas de producto antes de escalar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: su tamano reducido (repo de 0.5 GB) permite desplegarlo en dispositivos edge o contenedores pequenos donde modelos mayores no caben.
- Pruebas de integracion con transformers y text-generation-inference: el modelo es compatible con la pipeline text-generation y con endpoints, lo que facilita probar infraestructura de serving sin coste elevado.
- Base para nuevos fine-tunings: al estar bajo licencia apache-2.0, puede utilizarse como punto de partida para experimentos de ajuste adicionales en dominios concretos.
- Docencia e investigacion sobre modelos pequenos: util para analizar el comportamiento de modelos de 135M tras un SFT con dataset desconocido y comparar con el modelo base original.

## Benchmarks y rendimiento
La model card declara un `model-index` con el nombre del modelo pero sin resultados (`results: []`). El unico dato de rendimiento publicado es la perdida de validacion de 1.0215 en el conjunto de evaluacion. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Perdida de validacion (final) | 1.0215 |
| Perdida de entrenamiento (final) | 0.7959 (paso 1000) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 0.27 GB solo para pesos (134.5M parametros × 2 bytes), mas overhead de activaciones y KV cache; en la practica, menos de 1 GB.
- En cuantizacion de 8 bits: aproximadamente 0.13 GB para pesos; en 4 bits: aproximadamente 0.07 GB. Los tipos de cuantizacion concretos no estan documentados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es mas que suficiente; el modelo cabe holgadamente en GPUs integradas y puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de dispositivos con al menos 1 GB de memoria disponible.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); llama.cpp, Ollama o vLLM no estan documentados pero serian viables tecnicamente dado el formato y tamano.
- Latencia y throughput: no disponibles (no documentados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM2-FT-MyDataset | 134.5M | no disponible | apache-2.0 | Fine-tuning de SmolLM2-135M con dataset no documentado |
| HuggingFaceTB/SmolLM2-135M | 135M | no disponible en esta ficha | apache-2.0 | Modelo base original, con model card completa y evaluaciones publicadas |
| SmolLM2-360M | 360M | no disponible en esta ficha | apache-2.0 | Version mayor de la misma familia, mayor capacidad a coste aun bajo |

La comparativa se limita a la familia SmolLM2 por la ausencia de datos de rendimiento del modelo ajustado; no es posible comparar metricas de calidad con alternativas sin benchmarks publicados.

## Limitaciones y advertencias
- Dataset de entrenamiento desconocido: la model card indica "unknown dataset" y "More information needed" en descripcion, usos previstos y datos de entrenamiento, lo que impide evaluar sesgos o calidad del ajuste.
- Riesgo de alucinacion: como todo modelo de lenguaje pequeno (135M), la tasa de alucinacion y de incoherencias es elevada, especialmente fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto efectiva ni los idiomas soportados; no debe asumirse un comportamiento multilingue.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora respecto al modelo base; la unica metrica es la perdida de validacion.
- Licencia apache-2.0: permite uso comercial, pero al derivar de SmolLM2-135M conviene verificar las condiciones del modelo base y la procedencia de los datos de fine-tuning.
- Modelo de caracter educativo: las etiquetas (smol-course, module_1) sugieren un proposito didactico; no se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- Sin garantias de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin actualizaciones documentadas mas alla de la creacion inicial.

## Enlaces
- Hugging Face: https://huggingface.co/Drpineapple31/SmolLM2-FT-MyDataset
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
