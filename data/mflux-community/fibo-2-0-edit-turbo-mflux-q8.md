# mflux-community/fibo-2-0-edit-turbo-mflux-q8

## Resumen

Fibo-2.0-edit-turbo · MFlux Q8 es una conversión cuantizada a 8 bits, para el framework MFlux sobre Apple Silicon (MLX), del modelo de generación y edición de imágenes Fibo-2.0-edit-turbo desarrollado por Bria AI. El repositorio original es un modelo de pipeline text-to-image orientado tanto a la creación de imágenes desde texto como a la edición dirigida de imágenes existentes, y esta versión comunitaria busca hacer viable su ejecución local en Mac reduciendo el tamaño de los pesos de 25,1 GB (BF16) a 13,4 GB (Q8).

La conversión no es un lanzamiento oficial de Bria AI, sino una cuantización comunitaria realizada por el colectivo MFlux-Community con MFlux 0.23.0 el 25 de octubre de 2026. La cuantización afín de MLX se aplica al codificador de texto, al transformador y al VAE, y el nivel de cuantización queda almacenado en los propios pesos, de modo que no hace falta pasar ninguna flag adicional al ejecutar el modelo.

Su relevancia actual radica en que permite ejecutar en hardware de consumo Apple (Mac con Apple Silicon) un modelo de edición de imágenes de última generación sin necesidad de GPU NVIDIA ni de servicios en la nube, manteniendo la licencia original del modelo base, que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline text-to-image; detalles del transformador no publicados en el repo) |
| Parametros totales | no disponible (13,4 GB en Q8; 25,1 GB en BF16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (MLX affine, 8 bits) en este repo; existen BF16, Q6, Q5, Q4 y Q3 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-edit-turbo-license (licencia propia de Bria AI, tipo "other") |
| Formato de pesos | safetensors (MLX, cuantizado) |

## Arquitectura y entrenamiento

Este repositorio es una conversión cuantizada del modelo base briaai/Fibo-2.0-edit-turbo, por lo que hereda su arquitectura sin introducir cambios propios. La cuantización utiliza el esquema afín de MLX a 8 bits aplicado de forma uniforme sobre los tres componentes del pipeline: el codificador de texto, el transformador de difusión y el VAE. Al ser una versión "turbo", el modelo base está optimizado para generar o editar imágenes en un numero reducido de pasos de inferencia, aunque el numero exacto de pasos no se detalla en la model card.

No se dispone en la información proporcionada de datos sobre el entrenamiento del modelo original: numero de tokens o imágenes del dataset, composición de los datos, uso de RLHF/DPO u otras técnicas de alineación, ni detalles técnicos como atencion lineal o decodificación especulativa. Para esos detalles hay que consultar la model card de Bria AI del modelo base.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image), con el comando `mflux-generate-fibo2-edit` y control de dimensiones (por ejemplo 1024x1024), semilla y prompt.
- Edición de imágenes: la variante "edit" del modelo base indica capacidad de edición dirigida de imágenes existentes, aunque el repo no documenta ejemplos concretos de esta modalidad.
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de CUDA ni de GPU NVIDIA.
- Cuantización persistente en los pesos: no requiere flag de cuantización en tiempo de ejecución.
- Descarga automática de pesos desde Hugging Face en el primer uso, o descarga local previa con `hf download`.

No hay información sobre capacidades de tool calling, agentes, razonamiento textual ni procesamiento de audio o vídeo; se trata de un modelo exclusivamente de imágenes.

## Casos de uso

- Generación de ilustraciones locales en Mac: un diseñador puede crear imágenes de 1024x1024 desde prompts de texto sin salir de su máquina ni enviar datos a servicios externos, útil cuando la privacidad del contenido es un requisito.
- Prototipado rápido de conceptos visuales: al ser una variante "turbo", permite iterar prompts con pocas instrucciones y reproducibilidad total mediante semillas (`--seed`), ideal para explorar variaciones de un mismo concepto.
- Edición de imágenes existentes: la rama "edit" del modelo base permite modificar imágenes concretas (cambios de estilo, objetos o composición), aprovechable en flujos de retocado asistido por IA.
- Integración en pipelines de automatización en macOS: MFlux es una herramienta de linea de comandos instalable con `uv`, por lo que puede encadenarse en scripts por lotes para generar series de imágenes de forma desatendida.
- Prueba de cuantizaciones para hardware limitado: los repos hermanos (Q6, Q5, Q4, Q3) permiten bajar de 13,4 GB hasta 5,6 GB, útil en Macs con memoria unificada ajustada, usando este Q8 como referencia de calidad máxima razonable.
- Evaluación y comparación de modelos de difusión: investigadores pueden comparar la degradación de calidad entre Q8 y versiones más agresivas de cuantización sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un modelo de generación de imágenes, además, los benchmarks habituales de LLM (MMLU, HumanEval, GSM8K) no son aplicables.

## Requisitos de hardware

- Memoria unificada estimada: 13,4 GB solo de pesos en Q8, por lo que en la práctica se recomienda un Mac con al menos 24-32 GB de memoria unificada para generar con holgura. La versión BF16 (25,1 GB) exige máquinas de gama alta; las versiones Q4 (7,2 GB) y Q3 (5,6 GB) son la alternativa para equipos más modestos.
- GPU: no aplica el concepto de GPU discreta; el modelo está diseñado exclusivamente para Apple Silicon (chips M1/M2/M3/M4 con soporte MLX). No es ejecutable en GPU NVIDIA con este formato.
- Consumer hardware: sí, cabe en Macs de consumo con suficiente memoria unificada; no hay soporte documentado para Windows, Linux o CUDA en este repo.
- Despliegue: mediante MFlux (`uv tool install --upgrade mflux` y el comando `mflux-generate-fibo2-edit`). No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible; al ser una variante turbo se asume un numero reducido de pasos de difusión, pero no hay cifras publicadas.

## Comparativa con modelos similares

Comparativa entre las versiones MFlux del mismo modelo base publicadas por mflux-community:

| Version | Tamano | Cuantizacion | Repo |
|---|---|---|---|
| BF16 | 25,1 GB | sin cuantizar | mflux-community/fibo-2-0-edit-turbo-mflux-bf16 |
| Q8 (esta ficha) | 13,4 GB | 8 bits | mflux-community/fibo-2-0-edit-turbo-mflux-q8 |
| Q6 | 10,3 GB | 6 bits | mflux-community/fibo-2-0-edit-turbo-mflux-q6 |
| Q5 | 8,8 GB | 5 bits | mflux-community/fibo-2-0-edit-turbo-mflux-q5 |
| Q4 | 7,2 GB | 4 bits | mflux-community/fibo-2-0-edit-turbo-mflux-q4 |
| Q3 | 5,6 GB | 3 bits | mflux-community/fibo-2-0-edit-turbo-mflux-q3 |

Comparación con otros modelos de edición de imágenes: no disponible (no hay datos suficientes del modelo base ni de alternativas en la información proporcionada).

## Limitaciones y advertencias

- Licencia restrictiva: hereda la fibo-2.0-edit-turbo-license de Bria AI, una licencia de tipo "other" que puede imponer restricciones al uso comercial. Es imprescindible revisar los terminos en la model card del modelo original antes de desplegar en producción.
- Conversión no oficial: es una cuantización comunitaria, no un lanzamiento de Bria AI, por lo que la calidad frente a los pesos originales en BF16 no está validada por el autor del modelo.
- Pérdida por cuantización: la cuantización a 8 bits (y más aún Q4/Q3) puede degradar detalles finos de las imágenes respecto a BF16; no hay estudios de degradación publicados.
- Plataforma limitada: solo funciona en Apple Silicon mediante MLX; no es utilizable en entornos CUDA/Linux con este formato de pesos.
- Sesgos: no disponible; al depender del modelo base de Bria AI, los sesgos del dataset de entrenamiento original se heredan, pero no están documentados en este repo.
- Alucinación: no aplica como tal, pero los modelos de difusión pueden producir artefactos, anatomía incorrecta o incumplimiento del prompt; no hay evaluaciones publicadas al respecto.
- Idiomas del prompt: no disponible; se desconoce que idiomas soporta bien el codificador de texto, siendo el ingles el mas probable.
- Advertencia adicional: la fecha de creación del repo (octubre de 2026) indica una conversión muy reciente, con posible falta de madurez en la toolchain MFlux para este modelo concreto.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q8
- Modelo original de Bria AI: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Framework MFlux (GitHub): https://github.com/filipstrand/mflux
- Organización MFlux-Community en Hugging Face: https://huggingface.co/mflux-community
- Version BF16: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-bf16
- Version Q6: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q6
- Version Q5: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q5
- Version Q4: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q4
- Version Q3: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q3
