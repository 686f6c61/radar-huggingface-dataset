# Philiaxis/Himel3-1.7B-graft

## Resumen

Himel3-1.7B-graft es un ajuste fino experimental del modelo LFM3-1.7B de Liquid AI, desarrollado por Philiaxis. Se trata de un checkpoint de 1.728.801.536 parametros (aproximadamente 1.7 mil millones) orientado a generacion de texto conversacional, distribuido en formato MLX bfloat16 para ejecucion en Apple Silicon. El modelo deriva del LFM3-1.7B original y anade dos modificaciones: un ajuste de identidad (LoRA) para que el modelo responda con su propio nombre y desarrollador, y una tecnica denominada "BOS graft" que introduce actualizaciones de rango 1 en forma cerrada sobre las proyecciones K/V de las capas 2, 4, 6 y 8.

El objetivo declarado del checkpoint es estudiar el comportamiento del modelo cuando se omite el turno de sistema, comparando el rendimiento con y sin mensaje de sistema en tareas aritmeticas multilingues (MGSM). El modelo soporta japones e ingles, y su relevancia actual radica en que explora tecnicas de edicion de pesos (rank-1 updates) aplicadas a un modelo compacto, con evaluacion empirica publicada mediante pruebas de McNemar.

La licencia es LFM Open License v1.0 (lfm1.0), derivada de la licencia del modelo base de Liquid AI, con condiciones especificas para uso comercial recogidas en la clausula 5. El repositorio ocupa 3.5 GB y las descargas registradas ascienden a 516 en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LFM3-1.7B de Liquid AI); pesos en formato MLX |
| Parametros totales | 1.728.801.536 (~1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluacion uso hasta 8.192 tokens de salida, pero no se especifica la ventana de contexto del modelo) |
| Tipos de cuantizacion | bfloat16 (unica distribucion publicada); otras cuantizaciones no disponibles |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI y se distribuye con pesos en bfloat16 para el ecosistema MLX (Apple Silicon). Sobre esa base se aplican dos intervenciones: (1) un ajuste fino de identidad mediante LoRA, orientado a que el modelo responda con su nombre y desarrollador; y (2) el "BOS graft", una actualizacion de rango 1 en forma cerrada aplicada a las proyecciones clave/valor (K/V) de las capas 2, 4, 6 y 8, cuyo proposito es modificar el comportamiento del modelo cuando no se proporciona un turno de sistema.

No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La evaluacion publicada se limita a MGSM (aritmetica) en japones e ingles, con 250 preguntas por idioma, temperature 0.6, top-p 0.95 y un maximo de 8.192 tokens de salida, activando thinking cuando el modelo lo soporta. El autor advierte que MGSM no mide capacidades de contexto largo, uso de herramientas ni conocimiento general.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Razonamiento aritmetico (evaluado via MGSM).
- Modo thinking (se activa con `--enable-thinking` en la invocacion de ejemplo).
- Ajuste de identidad: responde con el nombre del modelo y su desarrollador.
- Comportamiento diferenciado con y sin mensaje de sistema (objeto del experimento BOS graft).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el pipeline declarado es text-generation).

## Casos de uso

- Evaluacion de tecnicas de edicion de pesos: el checkpoint permite reproducir el experimento BOS graft y comparar el efecto de las actualizaciones rank-1 en las proyecciones K/V frente al modelo base, usando MGSM como banco de pruebas.
- Investigacion sobre el papel del turno de sistema: sirve para estudiar como varia el rendimiento aritmetico en japones e ingles cuando se omite el mensaje de sistema, con datos de diferencias pareadas y pruebas de McNemar publicadas.
- Despliegue local en Apple Silicon: al distribuirse en MLX bfloat16, puede ejecutarse en equipos Mac con MLX-VLM 0.7.11 y Transformers 5.22.2, sin necesidad de GPU dedicada.
- Asistente conversacional bilingue de proposito acotado: adecuado para prototipos de conversacion japones-ingles donde el volumen de parametros (1.7B) y el formato MLX facilitan iteracion rapida en local.
- Generacion de texto con identidad controlada: util en demos donde se requiere que el modelo se identifique con su nombre y desarrollador de forma consistente.
- Banco de comparacion para modelos pequenos: dado que el autor publica resultados frente a Qwen3-1.7B y Gemma 4 E2B-it/E4B-it en MGSM japones, puede emplearse como referencia en estudios comparativos de modelos de ~1-2B.

## Benchmarks y rendimiento

Resultados en MGSM (250 preguntas por idioma, temperature 0.6, top-p 0.95, maximo 8.192 tokens de salida):

| Modelo y condicion | Japones | Ingles |
|---|---:|---:|
| Himel3-1.7B | 77.6% | 92.8% |
| Himel3-1.7B + system | 84.4% | 94.0% |
| Himel3-1.7B-graft | 78.4% | 94.4% |
| Himel3-1.7B-graft + system | 82.4% | 94.4% |
| LFM3-1.7B | 75.6% | 93.6% |
| LFM3-1.7B + system | 84.0% | 94.8% |
| LFM3-1.7B + BOS graft | 80.0% | 94.0% |

Diferencias reportadas por el autor:
- Graft + system frente a sin system en japones: +4.0 puntos (McNemar exacto, p = 0.0987).
- Graft frente a la version estandar en japones: +0.8 puntos sin system (p = 0.864) y -2.0 puntos con system (p = 0.405).
- Version estandar + system supero a Qwen3-1.7B (72.8%, p = 0.0000154) y Gemma 4 E2B-it (78.0%, p = 0.00904) en las 250 preguntas japonesas.
- En las 125 preguntas comunes con Gemma 4 E4B-it: version estandar + system 82.4% frente a 79.2% de E4B (p = 0.454).

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: pesos en bfloat16 de ~1.7B parametros equivalen a aproximadamente 3.46 GB de descarga; en memoria unificada de Apple Silicon se requiere espacio para pesos mas overhead de MLX.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (chips de la familia M). No se documenta soporte para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en consumer GPU: no se confirma; el formato MLX esta pensado para Mac. No hay datos sobre ejecucion en GPU NVIDIA consumer.
- Opciones de despliegue: MLX-VLM 0.7.11 con Transformers 5.22.2 (combinacion verificada por el autor). vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MGSM japones (+ system) | Licencia | Formato |
|---|---:|---|---:|---|---|
| Himel3-1.7B-graft | ~1.7B | no disponible | 82.4% | LFM Open License v1.0 | MLX bfloat16 |
| LiquidAI LFM3-1.7B | ~1.7B | no disponible | 84.0% | LFM Open License v1.0 | no disponible en esta ficha |
| Qwen3-1.7B | ~1.7B | no disponible | 72.8% | no disponible en esta ficha | no disponible en esta ficha |
| Gemma 4 E2B-it | ~2B (E2B) | no disponible | 78.0% | no disponible en esta ficha | no disponible en esta ficha |
| Gemma 4 E4B-it | ~4B (E4B) | no disponible | 79.2% (125 preguntas comunes) | no disponible en esta ficha | no disponible en esta ficha |

Los datos de MGSM japones para Qwen3-1.7B y Gemma 4 proceden del informe del autor; el resto de campos no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Checkpoint experimental: el BOS graft es una modificacion de investigacion; su comportamiento fuera de las condiciones evaluadas (MGSM con y sin system) no esta caracterizado.
- Evaluacion limitada a aritmetica (MGSM): no hay datos sobre contexto largo, uso de herramientas ni conocimiento general, por lo que no debe extrapolarse el rendimiento a otras tareas.
- Cambio de idioma en el razonamiento: el autor advierte que, incluso en preguntas en japones, el razonamiento puede producirse en ingles.
- Limite de salida: en razonamientos largos el modelo puede alcanzar el tope de tokens de salida (8.192 en la evaluacion).
- Idiomas: solo japones e ingles declarados; no se documenta soporte para castellano ni otros idiomas.
- Licencia: LFM Open License v1.0; las condiciones para uso comercial se recogen en la clausula 5, que debe consultarse antes de desplegar en produccion. Es un derivado de LFM3-1.7B de Liquid AI, Inc.
- Formato: distribucion exclusiva en MLX bfloat16, lo que limita el despliegue a entornos Apple Silicon salvo conversion manual no documentada.
- Sesgos y alucinaciones: no se publica informacion especifica sobre sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- Diferencias no significativas: varias comparaciones reportadas (graft frente a estandar, +4.0 puntos con system) no alcanzan significacion estadistica al nivel 0.05 (p = 0.405 y p = 0.0987), por lo que las mejoras deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Philiaxis/Himel3-1.7B-graft
- Modelo relacionado (version estandar): https://huggingface.co/Philiaxis/Himel3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Informe experimental de Himel3: https://himel.philiaxis.com/himel3/
- Licencia (LFM Open License v1.0): LICENSE (incluido en el repositorio del modelo)
- NOTICE.md (cambios por archivo y licencias del codigo de referencia): incluido en el repositorio del modelo
