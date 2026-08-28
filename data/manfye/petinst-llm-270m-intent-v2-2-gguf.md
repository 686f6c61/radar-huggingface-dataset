# manfye/PetInst-LLM-270M-Intent-v2.2-GGUF

## Resumen

PetInst-LLM-270M-Intent-v2.2 es un modelo de lenguaje pequeño (270 millones de parámetros) desarrollado por manfye, derivado de google/functiongemma-270m-it mediante fine-tuning independiente. Su propósito es actuar como un router de intenciones para mascotas virtuales: dado un mensaje del usuario, selecciona exactamente una intención de alto nivel entre tres y cinco herramientas declaradas, sin generar respuesta conversacional. Está pensado para ejecución en dispositivo (on-device) y para integrarse en sistemas de acompañamiento virtual o asistentes conversacionales ligeros.

El modelo se distribuye en formato GGUF, lo que permite su uso con llama.cpp, Ollama y otros motores compatibles. Su tamaño reducido lo hace adecuado para entornos con recursos limitados, como móviles o dispositivos embebidos. La licencia es Gemma, con acceso restringido en HuggingFace (requiere aceptar condiciones). Aunque la ficha indica idioma inglés, su uso principal es el enrutamiento de intenciones, no la generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de FunctionGemma-270M-it) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, se pueden generar varias cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (con acceso restringido) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de FunctionGemma-270M-it, un transformer decoder-only de Google diseñado específicamente para function calling y tool use. El fine-tuning realizado por manfye adapta el modelo para que, en lugar de generar respuestas conversacionales, seleccione una única intención de alto nivel entre un conjunto reducido de herramientas declaradas (entre tres y cinco). Según la descripción del autor, el modelo "no emite respuesta conversacional", lo que indica que su salida se limita a la elección de la herramienta o intención correspondiente.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni las técnicas de alineación (RLHF, DPO, etc.). El repositorio GitHub Atty3333/LLM-Trainer menciona un pipeline de fine-tuning con generación sintética de datos y LoRA optimizado con Unsloth, pero no se confirma que sea el mismo proceso empleado para esta versión concreta.

## Capacidades

- Selección de intención única: el modelo elige exactamente una intención de alto nivel entre 3-5 herramientas declaradas, sin generar texto adicional.
- Function calling / tool use: hereda la capacidad de FunctionGemma para interpretar herramientas y seleccionar la adecuada.
- Ejecución en dispositivo: su tamaño reducido permite inferencia local en hardware limitado.
- Compatibilidad con llama.cpp: al estar en formato GGUF, funciona con motores como llama.cpp, Ollama y otros.
- Sin generación conversacional: no produce respuestas de texto libre, lo que lo hace adecuado para pipelines donde la salida debe ser estructurada.

## Casos de uso

- Mascotas virtuales interactivas: el modelo puede interpretar comandos del usuario (alimentar, jugar, dormir) y seleccionar la acción correspondiente en una aplicación de mascota virtual, ejecutándose localmente en el dispositivo.
- Asistentes de voz ligeros: integrado en un asistente de voz para dispositivos embebidos, clasifica la intención del hablante y dispara la acción adecuada sin depender de la nube.
- Enrutamiento de diálogo en chatbots: como primer paso de un pipeline, el modelo decide qué módulo especializado debe manejar la petición (por ejemplo, consulta de horarios, ajuste de preferencias, etc.).
- Automatización doméstica: en un sistema de control por voz, selecciona entre acciones como encender luces, ajustar termostato o reproducir música, con baja latencia y sin conexión.
- Juguetes inteligentes: para juguetes con capacidades conversacionales limitadas, el modelo clasifica la intención del niño y activa la respuesta o animación correspondiente.
- Prototipado rápido de agentes: al ser un modelo pequeño y de fácil despliegue, sirve para validar flujos de tool calling en entornos de desarrollo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 270M parámetros, en FP16 ocupa aproximadamente 540 MB; en cuantizaciones GGUF típicas (Q4_K_M) puede reducirse a unos 150-200 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano, Raspberry Pi con acelerador) o incluso CPU sola.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU moderna y en muchas placas de desarrollo.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores compatibles con GGUF (por ejemplo, llama-server).
- Latencia y throughput: no disponible, pero por su tamaño se espera una latencia de milisegundos en CPU moderna y aún menor en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| PetInst-LLM-270M-Intent-v2.2 | 268M | no disponible | Gemma | GGUF | Router de intenciones para mascotas virtuales |
| google/functiongemma-270m-it | 270M | no disponible | Gemma | safetensors | Function calling general |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Apache 2.0 | safetensors, GGUF | Chat y tool use general |

La comparativa es cualitativa; no se dispone de datos de rendimiento para PetInst-LLM. El modelo base FunctionGemma-270M-it está orientado a function calling, mientras que Qwen2.5-0.5B-Instruct es un modelo conversacional más general. PetInst-LLM se especializa en un dominio concreto (mascotas virtuales) y en una salida no conversacional.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar las condiciones de licencia en HuggingFace antes de poder descargarlo.
- Idioma limitado: solo se declara soporte para inglés; no se garantiza funcionamiento en otros idiomas.
- Sin generación de texto: no es adecuado para tareas que requieran respuestas conversacionales o explicaciones.
- Dominio específico: está entrenado para intenciones de mascotas virtuales; su uso fuera de ese ámbito puede dar resultados erróneos.
- Riesgo de alucinación en la selección de herramientas: si la entrada no coincide con ninguna intención declarada, el modelo podría elegir una incorrecta.
- Sin datos de benchmarks: no hay evidencia pública de su rendimiento en tareas estándar, lo que dificulta evaluar su calidad objetiva.
- Fecha de creación futura (2026-08-28): el modelo está fechado en el futuro, lo que puede indicar un error en los metadatos o una publicación programada; conviene verificar su disponibilidad real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manfye/PetInst-LLM-270M-Intent-v2.2-GGUF
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Repositorio relacionado (pipeline de fine-tuning): https://github.com/Atty3333/LLM-Trainer
- Informe técnico de Gemma 3 (contexto de la familia): https://arxiv.org/abs/2503.19786
