# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int4-gs64-sym

## Resumen

Este repositorio contiene una cuantizacion INT4 del modelo base `tiiuae/Falcon3-10B-Base`, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de un artefacto derivado: el Falcon3-10B-Base original de TII (Technology Innovation Institute) comprimido a 4 bits mediante el algoritmo AutoRound (SignRound) de Intel, con cuantizacion simetrica por grupos de 64 y calibracion en CPU. El objetivo es reducir el peso en memoria y acelerar la inferencia en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) con una perdida de precision que el autor describe como leve.

Es relevante para desarrolladores que quieran desplegar un modelo de ~10B en entornos con recursos limitados, especialmente sobre plataformas Intel con intel-extension-for-pytorch u OpenVINO. Conviene senalar una discrepancia importante: aunque el nombre del repositorio indica "10B", el recuento real de parametros en los safetensors es de 2.160.061.440 (~2,16B), lo que sugiere que el artefacto publicado no corresponde al modelo base completo o que el conteo esta incompleto. El autor no aclara esta inconsistencia.

La model card advierte explicitamente que el modelo se ha desarrollado solo con fines de investigacion y sin garantia. Es un modelo base (completion), no ajustado por instrucciones, por lo que debe usarse con prompts de texto sin formato conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama en la configuracion del artefacto) |
| Parametros totales | 2.160.061.440 segun safetensors (el nombre y el modelo base indican ~10B; discrepancia no aclarada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4, group size 64, simetrica, weights-only (WoQ), AutoRound/SignRound |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); cuantizacion AutoRound |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion del Falcon3-10B-Base, un transformer causal de la familia Falcon3 de TII. La model card del repositorio cuantizado no aporta detalles sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO), por lo que esa informacion debe consultarse en la model card del modelo base `tiiuae/Falcon3-10B-Base`, no incluida en la informacion proporcionada.

La innovacion tecnica de este repositorio es el proceso de cuantizacion: AutoRound v0.16.1 con calibracion en CPU, 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch de 4, cargando los pesos en `torch.bfloat16`. La cuantizacion tardo 51.085,7 segundos (~851 minutos) y se completo el 7 de noviembre de 2026 segun los metadatos. El autor indica que el resultado ofrece una aceleracion de 2-3x con una ligera caida de precision en W4G64, y que esta optimizado para inferencia en CPU Intel, iGPU Arc (via intel-extension-for-pytorch) y NPU (via OpenVINO).

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo base, sin ajuste por instrucciones).
- Completion de texto sin plantilla conversacional: se le pasa texto crudo y continua la secuencia.
- Razonamiento y conocimiento general heredados del modelo base (no verificados en este artefacto).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Multilingue: solo se declara ingles.
- Inferencia optimizada para hardware Intel (CPU, iGPU Arc, NPU Core Ultra).

## Casos de uso

- Autocompletado de texto en ingles: el modelo puede usarse como motor de completion en editores o herramientas de escritura, alimentandolo con el texto previo y generando continuaciones con `max_new_tokens` acotado.
- Generacion de texto por lotes en servidores Intel sin GPU dedicada: al estar cuantizado a INT4 y calibrado para CPU Intel, permite procesar volumenes moderados de generacion en infraestructura x86 convencional.
- Prototipado de pipelines de NLP: sirve como modelo base para experimentar con tecnicas de prompting, evaluacion de calidad de cuantizacion o comparativas frente al modelo en bf16.
- Despliegue en portatiles con Core Ultra: la compatibilidad declarada con NPU (AI Boost) y iGPU Arc permite ejecutar generacion de texto en equipos de consumo Intel con bajo consumo energetico.
- Investigacion sobre cuantizacion: el repositorio incluye la receta de replicacion completa (auto-round-pipeline, versiones de librerias y parametros), lo que lo hace util como referencia reproducible para estudiar el impacto de AutoRound W4G64.
- Generacion de datos sinteticos en ingles: como modelo base puede producir texto diverso para aumentar datasets, siempre con revision humana posterior.
- Educacion y demos: su licencia Apache 2.0 y su tamano reducido en INT4 facilitan su uso en entornos academicos y demostraciones tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona cualitativamente una "aceleracion de 2-3x" y una "ligera caida de precision en W4G64", sin cifras concretas de MMLU, HumanEval, GSM8K ni perplejidad.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 8,3 GB, por lo que la inferencia requiere del orden de 8-10 GB de memoria para pesos y overhead, segun el backend.
- GPU recomendadas: no se especifican; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra. Para GPU discretas no hay datos de rendimiento.
- Cabe en GPU de consumo con al menos ~10-12 GB de memoria (por ejemplo, RTX 3060 12 GB, RTX 4070), aunque no esta validado por el autor.
- Opciones de despliegue: transformers (probado con 4.55.3 y torch 2.15.0+cpu), intel-extension-for-pytorch, OpenVINO. La model card incluye el tag `text-generation-inference`, pero no se documenta su uso con TGI, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; solo la afirmacion cualitativa de 2-3x de aceleracion frente a la version sin cuantizar.
- Nota: la model card marca `inference: false` en los metadatos, lo que conviene verificar antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Falcon3-10B-Base INT4 AutoRound) | 2,16B segun safetensors (nombre indica 10B) | No disponible | INT4 W4G64 simetrica | Apache 2.0 | Hugging Face |
| tiiuae/Falcon3-10B-Base | ~10B | No disponible en esta ficha | bf16/fp16 original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GPTQ/AWQ de Falcon3-10B | ~10B | Segun base | INT4/INT8 | Apache 2.0 | Depende del autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: el conteo real (2,16B) no coincide con el nombre del repositorio ni con el modelo base declarado (10B); conviene validar el artefacto antes de usarlo en produccion.
- Solo ingles: no se declara soporte multilingue.
- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable ni mantiene formato conversacional.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Perdida de precision por cuantizacion INT4 W4G64, reconocida por el autor como "ligera" pero no medida.
- La model card indica `inference: false` y el autor declara el artefacto solo para investigacion y sin garantia.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.
- Sin datos de benchmarks ni de latencia/throughput, lo que dificulta estimar su idoneidad en produccion.
- La receta de replicacion apunta a un repositorio externo (git.epicdynamic.com) cuya disponibilidad y mantenimiento no estan garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Auto-round-pipeline (receta de replicacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
