# kai-os/Carnice-V3-GGUF

## Resumen

Carnice-V3-GGUF es una colección de cuantizaciones GGUF de alta calidad del checkpoint fusionado BF16 `kai-os/Carnice-V3`, un modelo de 27 000 millones de parámetros desarrollado por el autor independiente kai-os. El modelo base se construye sobre la revisión exacta `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` de `Qwen/Qwen3.8-27B`, y fue sometido a un post-entrenamiento con LoRA de rango 64 (rsLoRA) sobre 496 módulos lineales de lenguaje, fusionado posteriormente en el modelo completo. No se trata de un SFT de parámetros completos, sino de una adaptación eficiente orientada a mejorar el rendimiento en el harness agéntico propietario `hermes-agent`.

Este repositorio en concreto no contiene el modelo original, sino cuatro cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q6_K y Q8_0) más un proyector multimodal en BF16, todo ello generado con una herramienta oficial de llama.cpp y verificado mediante matrices de importancia y pruebas de perplejidad. El modelo es multimodal (entrada de imagen y texto) y está diseñado para tareas de agente con tool calling, aunque el propio autor advierte de que no superó su puerta de calidad formal y presenta limitaciones significativas en tareas de largo horizonte. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) |
| Parametros totales | 27 320 697 856 (segun safetensors); la model card cita 27 781 427 952 para el BF16 completo |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion; depende de la configuracion de llama.cpp) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (mas proyector multimodal BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Carnice V3 es un transformer denso basado en la arquitectura de Qwen3.8-27B, sin modificaciones estructurales respecto al modelo base. El post-entrenamiento consistio en una adaptacion de bajo rango (rsLoRA de rango 64) aplicada a los 496 modulos lineales de lenguaje auditados, seguida de una fusion segura de los pesos en el modelo base. No se realizo un fine-tuning de parametros completos. El dataset de entrenamiento es privado y no se redistribuye; la model card menciona que la matriz de importancia para la cuantizacion se calculo sobre el split de entrenamiento, con hasta 192 chunks de 512 tokens, intercalando las seis trayectorias de entrenamiento. No se menciona el uso de RLHF o DPO. La cuantizacion se realizo con llama.cpp en el commit `c060ca974c773c7c3d17fd1b66dc9d312bc292c0`, sin requantizacion, y cada archivo publico esta vinculado por hash en `release_manifest.json`.

## Capacidades

- Generacion de texto conversacional y de instrucciones en ingles.
- Entrada multimodal: el proyector BF16 permite procesar imagenes junto con texto (pipeline `image-text-to-text`).
- Tool calling / function calling: disenado para el harness `hermes-agent`, con soporte de llamadas a herramientas declaradas.
- Capacidades de agente: orientado a trazas de agente estilo Hermes, con razonamiento multi-paso.
- Cuantizaciones listas para usar con llama.cpp, incluyendo el servidor compatible con OpenAI.
- No se reportan capacidades de audio, video o thinking mode explicito.

## Casos de uso

- Prototipado de agentes conversacionales con tool calling: el modelo puede integrarse en entornos llama.cpp para experimentar con flujos de agente que requieran llamadas a funciones, aunque con las limitaciones de fiabilidad advertidas por el autor.
- Pruebas de cuantizacion y evaluacion de degradacion: los archivos GGUF con checks de perplejidad y smoke tests permiten comparar el impacto de distintas cuantizaciones en un mismo modelo base.
- Desarrollo de asistentes multimodales locales: gracias al proyector BF16, se puede probar la interaccion imagen-texto en entornos sin GPU de alta gama usando cuantizaciones Q4 o Q5.
- Investigacion sobre adaptacion eficiente (LoRA) en modelos de 27B: el modelo base Carnice-V3 sirve como ejemplo de post-entrenamiento con rsLoRA fusionado, util para estudios comparativos.
- Evaluacion de calidad de agentes en entornos controlados: dado el aviso del autor, puede usarse en laboratorio para medir fallos de contratos de tool y finalizacion de tareas, siempre con supervisión humana.
- Despliegue en entornos de desarrollo con restricciones de memoria: la cuantizacion Q4_K_M (15.66 GiB) permite ejecutar el modelo en GPUs de consumo con 16-24 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente ratios de perplejidad de las cuantizaciones frente al BF16 de referencia, que son direccionales y no constituyen una evaluacion de capacidad del modelo:

| Cuantizacion | Ratio PPL validacion | Ratio PPL test | Tool-call smoke |
|---|---|---|---|
| Q4_K_M | 1.02633x | 1.01793x | pass |
| Q5_K_M | 1.00441x | 1.00504x | pass |
| Q6_K | 1.00196x | 1.00308x | pass |
| Q8_0 | 1.00096x | 1.00256x | pass |

Ademas, el autor reporta que Carnice V3 no supero su puerta de calidad formal: en un diagnostico post-hoc de cinco casos de desarrollo Hermes, completo sin limites de runtime o generacion en 3/5 casos (frente a 5/5 del base fijado) y paso 0/5 contratos de tool exactos (frente a 2/5 del base).

## Requisitos de hardware

- VRAM estimada para inferencia: con Q4_K_M (~15.66 GiB de pesos) se necesitan aproximadamente 16-18 GB de VRAM total; con Q5_K_M (~18.19 GiB) unos 20-22 GB; con Q6_K (~20.89 GiB) unos 24 GB; con Q8_0 (~27.05 GiB) unos 30 GB o mas, dependiendo del contexto y overhead.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar Q4_K_M y Q5_K_M con comodidad; Q6_K requiere 24 GB justos; Q8_0 necesita una A100 40GB, A100 80GB o H100.
- En GPU de consumo: si, las variantes Q4_K_M y Q5_K_M caben en RTX 3090/4090 (24 GB) y en RTX 4080 (16 GB) solo la Q4_K_M con contexto reducido.
- Opciones de despliegue: llama.cpp (incluido el servidor OpenAI-compatible), Ollama (si se importa el GGUF), vLLM (con adaptadores GGUF, aunque menos habitual), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Carnice-V3-GGUF (este) | Qwen3.8-27B | 27.3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones de Carnice-V3, con limitaciones de calidad advertidas |
| Carnice-V2-27b-GGUF | Qwen3.6-27B | 27B | ~4k (segun fuentes externas) | Apache 2.0 | GGUF | Version anterior, optimizada para trazas Hermes y tool-calling |
| Qwen3.8-27B (base) | - | 27B | no disponible | Apache 2.0 | Transformers | Modelo original sin post-entrenamiento especifico para agentes |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos. La comparativa es estructural y de disponibilidad.

## Limitaciones y advertencias

- El autor declara explicitamente que Carnice V3 no supero su puerta de calidad formal: en un diagnostico de cinco casos, completo sin limites en 3/5 y paso 0/5 contratos de tool exactos.
- Riesgo elevado de fallo en tareas de largo horizonte o multi-paso; no recomendado para agentes no supervisados, destructivos, de alto riesgo o en produccion sin evaluacion independiente y controles de runtime fuertes.
- La cuantizacion no repara las limitaciones de comportamiento del modelo fuente; los checks de perplejidad solo confirman la integridad de la conversion, no la calidad del agente.
- Idioma limitado a ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Longitud de contexto no documentada; puede variar segun la configuracion de llama.cpp y la memoria disponible.
- El dataset de entrenamiento es privado y no se redistribuye; no es posible auditar los datos de post-entrenamiento.
- Proyecto independiente, no afiliado a Qwen ni a Nous Research; el soporte y mantenimiento dependen del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kai-os/Carnice-V3-GGUF
- Modelo base (BF16): https://huggingface.co/kai-os/Carnice-V3
- Coleccion Carnice de kai-os: https://huggingface.co/collections/kai-os/carnice
- Version anterior (Carnice-V2-27b-GGUF): https://huggingface.co/kai-os/Carnice-V2-27b-GGUF
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
