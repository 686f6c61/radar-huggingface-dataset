# alkasima/Hakkillo-135M-v0.2-ownership-candidate2

## Resumen

Hakkillo-135M v0.2 ownership candidate 2 es un adaptador LoRA experimental publicado por el usuario alkasima sobre el modelo base SmolLM2-135M-Instruct de Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango (rank 8) orientado a un objetivo muy concreto: mejorar la reescritura de frases en inglés que contienen relaciones de posesión (pronombres como his, her, our, their, your) al aplicar un prompt de cortesía del tipo "Rewrite politely:". El adaptador pesa aproximadamente 1,9 MB y se distribuye bajo licencia Apache-2.0.

El modelo es relevante únicamente como artefacto de investigación sobre alineación de nicho en modelos muy pequeños. Su autor lo describe explícitamente como experimental, con regresiones conocidas y sin validación como asistente general. Continúa un adaptador anterior (writing candidate1) y añade 128 frases sintéticas de posesión más 64 peticiones de replay, con un conjunto de desarrollo separado de 16 casos. La model card documenta resultados cualitativos juzgados por un asistente de programación con IA, no por evaluación humana independiente.

Con 134.515.008 parámetros en el modelo base y 460.800 parámetros entrenables en el adaptador, el modelo está pensado para ejecutarse en CPU en float32. No es un modelo de propósito general: su utilidad práctica se limita a experimentos controlados de reescritura y a la reproducción de los resultados publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M-Instruct) con adaptador LoRA sobre q_proj y v_proj |
| Parametros totales | 134.515.008 (modelo base); 460.800 entrenables en el adaptador LoRA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso maximo de 256 tokens) |
| Tipos de cuantizacion | No disponible; el entrenamiento se realizo en CPU float32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct (revision `12fd25f77366fa6b3b4b768ec3050bf629380bac`), un transformer decoder-only de 134.515.008 parametros. La configuracion LoRA utiliza q_proj y v_proj, rank 8, alpha 16, dropout 0.05 y 460.800 parametros entrenables. Se parte del adaptador writing candidate1 (`829fc0b86824c276b8fe9b8a566c7bcd63ab41fb`) y se continua el entrenamiento con un optimizador AdamW nuevo.

Los datos de entrenamiento consisten en 128 frases sinteticas de posesion mas 64 peticiones de replay, sin ejemplos de feedback de la comunidad ni conversaciones privadas. El conjunto de desarrollo para la comprobacion de perdida consta de 16 casos separados. La ejecucion fue fija: 384 pasos, dos pasadas sobre 192 peticiones, learning rate 0.0001, batch size 1, semilla 42, cuatro hilos, CPU float32 y longitud maxima 256. El entrenamiento y las pasadas de perdida de desarrollo duraron 473,6 segundos tras la carga, con una perdida de desarrollo que paso de 0,0808 a 0,0009. El stack utilizado fue PyTorch 2.10.0+cpu, Transformers 5.8.1, PEFT 0.21.2 y Python 3.10. El SHA-256 del adaptador es `78f34236ea8b49fe05a9b2d1ebdd14f15225f467324047a2e2ce4b8f9e183113`.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base SmolLM2-135M-Instruct.
- Reescritura de frases con relaciones de posesion bajo un prompt de cortesia fijo ("Rewrite politely:"), objetivo principal del adaptador.
- Mejora documentada en casos de construccion familiar: de 13/16 a 16/16 en el conjunto de desarrollo del autor.
- Mejora en casos de regresion conocida que preservan requisitos: de 8/12 a 11/12.
- Mejora en casos de construccion reservada: de 21/24 a 22/24.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- No dispone de vision, audio ni modo thinking.
- No tiene acceso web en vivo (el autor lo indica explicitamente).

## Casos de uso

- Investigacion sobre alineacion de nicho: el adaptador sirve para estudiar como un ajuste LoRA de 460.800 parametros modifica el comportamiento de reescritura de un modelo de 135M en un dominio linguistico acotado, con resultados y datos reproducibles en el repositorio del autor.
- Reproduccion de experimentos: dado que el autor publica la semilla, el numero de pasos, el learning rate y el SHA-256 del adaptador, es posible reproducir exactamente el entrenamiento en CPU y comparar los resultados con los reportados.
- Evaluacion de transferencia limitada: los casos de construccion reservada (excluidos del entrenamiento) permiten estudiar si el ajuste generaliza a patrones de posesion no vistos, con la cautela de que el autor advierte que no es una prueba de razonamiento general de posesion.
- Pruebas de regresion en pipelines de evaluacion: el conjunto de 50 casos de escritura, que cayo de 43/50 a 42/50, puede usarse como caso de estudio de como un ajuste de nicho degrada tareas adyacentes (gramatica basica como "I has three pencils", normalizacion de correos electronicos).
- Docencia sobre LoRA y PEFT: el adaptador es un ejemplo compacto (1,9 MB) de ajuste de bajo rango sobre un modelo pequeno, util para explicar el flujo completo de PEFT con Transformers en CPU.
- Despliegue local de demostracion: el autor proporciona un script de PowerShell para ejecutar una interfaz Gradio local en `http://127.0.0.1:7860`, con requisitos de aproximadamente 270 MB de pesos base mas el adaptador, adecuado para demostraciones en maquinas sin GPU.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones cualitativas del autor sobre conjuntos sinteticos pequenos, no benchmarks estandar. Se presentan tal cual, con la advertencia de que no son exactitud general ni evaluacion humana independiente.

| Conjunto de evaluacion | Candidato anterior | Este candidato |
|---|---:|---:|
| Casos de regresion conocida que preservan requisitos | 8/12 | 11/12 |
| Casos de desarrollo de construccion familiar | 13/16 | 16/16 |
| Casos de construccion reservada | 21/24 | 22/24 |
| Conjunto de desarrollo de escritura (50 casos) | 43/50 | 42/50 |

Subgrupos de construccion reservada: clausulas de poseedor relativo 8/8, contrastes de poseedor de 7/8 a 8/8, poseedores coordinados 6/8. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el flujo documentado; el entrenamiento y la inferencia se realizaron en CPU float32.
- GPU recomendadas: no disponible; el autor no documenta despliegue en GPU.
- Cabe en CPU consumer: si, el flujo documentado usa CPU con PyTorch 2.10.0+cpu.
- Espacio en disco: aproximadamente 270 MB para los pesos base mas el adaptador de 1,9 MB; el autor advierte que los requisitos de RAM y almacenamiento de dependencias superan el tamano de descarga.
- Opciones de despliegue: script `scripts/setup.ps1` del repositorio Hakkillo y aplicacion Gradio local (`app.py`) en el puerto 7860. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor solo reporta 473,6 segundos para el entrenamiento y las pasadas de perdida de desarrollo en CPU.
- No se realizo validacion ONNX ni de navegador para este candidato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hakkillo-135M v0.2 ownership candidate 2 | 134.515.008 base + 460.800 adaptador | No disponible (entrenamiento a 256 tokens) | Adaptador LoRA de reescritura de posesion en ingles | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| SmolLM2-135M-Instruct | 134.515.008 | No disponible en la informacion proporcionada | Modelo base instructivo de proposito general | Apache-2.0 | Hugging Face (modelo base) |
| Hakkillo-135M v0.1 | No disponible en la informacion proporcionada | No disponible | Version anterior del proyecto, usada en el chat publico | No disponible en la informacion proporcionada | Hugging Face Space del autor |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la unica comparacion cuantitativa documentada es entre el candidato anterior y este candidato dentro del mismo proyecto.

## Limitaciones y advertencias

- El autor describe el modelo como experimental, con regresiones conocidas, y explicitamente no fiable como asistente general.
- Regresiones documentadas: no corrige "I has three pencils" ni "can sings", convierte `coordinator@example.org` en `coordinator at example.org` y transforma una peticion de disponibilidad de habitacion en una peticion de indicar disponibilidad.
- Errores de posesion restantes: "Send her his draft." produce "Could you please send her her draft?"; "Return his pencil and her coat." produce "Could you please return his pencil and his coat?"; "Return our parcel and their badge." produce "Could you please return our parcel and its badge?".
- Alucinacion: inventa el clima actual de Lagos y ofrece malos consejos sobre portatiles.
- No sigue algunas instrucciones de formato de salida.
- No tiene acceso web en vivo.
- Los resultados son juicios cualitativos de un asistente de programacion con IA, no evaluacion humana independiente; los conjuntos son pequenos y sinteticos.
- Los casos reservados ya han sido inspeccionados y no pueden considerarse un holdout limpio para ajustes posteriores.
- No se realizo validacion ONNX ni de navegador para este candidato.
- El modelo solo soporta ingles; no hay capacidades multilingues documentadas.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso externo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no garantiza calidad ni estabilidad para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/alkasima/Hakkillo-135M-v0.2-ownership-candidate2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Candidato anterior (writing candidate1): https://huggingface.co/alkasima/Hakkillo-135M-v0.2-writing-candidate1
- Chat publico (v0.1): https://huggingface.co/spaces/alkasima/Hakkillo
- Repositorio fuente: https://github.com/alkasima/Hakkillo
- Resultados y procedimiento: https://github.com/alkasima/Hakkillo/blob/main/reports/ownership-v1/RESULTS.md
- Plan preregistrado: https://github.com/alkasima/Hakkillo/commit/9a54501ff34ac51cfe829efa22e919358190521f
