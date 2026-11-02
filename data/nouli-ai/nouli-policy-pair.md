# nouli-ai/nouli-policy-pair

## Resumen

Nouli Policy Pair es un sistema de decisión desarrollado por Nouli AI que evalúa una política escrita contra la información de un caso concreto y devuelve uno de tres veredictos: TRUE, FALSE o UNKNOWN. No es un modelo monolítico, sino un par de componentes: un extractor de políticas que convierte el texto normativo en reglas ejecutables y un modelo de evidencia que comprueba qué hechos requeridos están respaldados por la información aportada. Nouli aplica después las reglas, incluyendo cálculos y comparaciones, para alcanzar la decisión final.

El sistema se construye como un fine-tuning sobre Qwen/Qwen3-4B-Instruct-2507 y convaiinnovations/laya, con adaptadores LoRA y un delta del modelo de evidencia, empaquetados junto a un runtime de inferencia propio. El repositorio ocupa 0,3 GB e incluye los adaptadores seleccionados y el runtime personalizado necesario para ejecutar el par completo.

Su relevancia radica en el enfoque de "policy extraction + evidence checking" para tareas de elegibilidad y cumplimiento normativo, un patrón que separa la interpretación de la norma de la verificación de hechos. La model card advierte que ha sido evaluado únicamente sobre políticas y narrativas sintéticas acotadas, y que la elegibilidad fiscal en el mundo real no está validada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fine-tuning con adaptadores LoRA sobre Qwen3-4B-Instruct-2507 y convaiinnovations/laya; runtime de inferencia personalizado (custom-inference) |
| Parámetros totales | no disponible (modelo base Qwen3-4B-Instruct-2507 de 4B; el repo contiene adaptadores y delta, no pesos completos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0, con avisos de licencias upstream en NOTICE e inference/licenses/ |
| Formato de pesos | safetensors (adaptadores LoRA y delta del modelo de evidencia) |

## Arquitectura y entrenamiento

El sistema combina dos rutas de procesamiento sobre modelos base tipo transformer. El extractor de políticas transforma el texto de la política en reglas ejecutables; el modelo de evidencia, derivado de un modelo base distinto, evalúa qué hechos requeridos están soportados por la información del caso. La capa Nouli aplica las reglas extraídas, incluyendo operaciones de cálculo y comparación, y emite el veredicto TRUE, FALSE o UNKNOWN. El repositorio distribuye los adaptadores LoRA del extractor y el delta del modelo de evidencia junto con el runtime necesario.

El entrenamiento se apoya en datos sintéticos acotados (etiqueta synthetic-data) y en técnicas de extracción de políticas (policy-extraction). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. El runtime probado para el par completo es DGX Spark sobre Linux ARM64 con CUDA, y la inferencia es local, sin necesidad de clave de API alojada.

## Capacidades

- Clasificación de texto con salida de tres estados: TRUE, FALSE o UNKNOWN.
- Extracción de reglas ejecutables a partir de texto de políticas.
- Verificación de hechos: determina qué hechos requeridos respalda la información del caso.
- Aplicación de reglas con cálculos y comparaciones (por ejemplo, años fiscales y partes implicadas).
- Entrada compuesta por texto de política, narrativa del caso y una consulta con parámetros de consulta (contribuyente, otra parte, año fiscal).
- Ejecución local sin dependencia de API alojada.
- Modo B-only con programa guardado para reutilización offline.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Verificación de elegibilidad fiscal: el sistema recibe una política tributaria y una narrativa de caso con datos del contribuyente y del año fiscal, y devuelve si el caso cumple, no cumple o es indeterminado. Es el escenario del ejemplo incluido en el repositorio.
- Evaluación de cumplimiento normativo interno: se introduce una política de la organización y la descripción de una situación operativa para obtener un veredicto sobre si la actuación se ajusta a la norma.
- Triaje de solicitudes con información incompleta: cuando faltan hechos, el modelo devuelve UNKNOWN, lo que permite derivar el caso a revisión humana en lugar de forzar una decisión binaria.
- Automatización de revisiones documentales: el extractor convierte políticas extensas en reglas ejecutables reutilizables, y el modelo de evidencia las contrasta con expedientes concretos.
- Reutilización offline de decisiones: mediante el modo B-only con programa guardado, se pueden repetir evaluaciones sin volver a ejecutar el extractor, útil para auditorías y reproducibilidad.
- Investigación en extracción de políticas: el par sirve como base para estudiar la separación entre interpretación normativa y verificación de hechos en sistemas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Runtime probado: DGX Spark con Linux ARM64 y CUDA.
- La instalación completa del par requiere el entorno CUDA documentado; una instalación limpia en hardware no relacionado no está verificada.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible (solo se documenta DGX Spark como plataforma probada).
- Compatibilidad con GPU de consumo: no verificada.
- Opciones de despliegue: runtime propio de Nouli (inference/live_pair.py) con Python 3.10 o superior, Hugging Face CLI y contenedor CUDA fijado; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouli Policy Pair | Adaptadores sobre Qwen3-4B y laya | no disponible | Decisión TRUE/FALSE/UNKNOWN sobre políticas | Apache-2.0 | Hugging Face, runtime propio |
| Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Generación de texto e instrucciones | no disponible en esta ficha | Hugging Face |
| convaiinnovations/laya | no disponible | no disponible | Modelo base de evidencia | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Evaluado únicamente sobre políticas y narrativas sintéticas acotadas; la elegibilidad fiscal en el mundo real no está validada.
- La interpretación de políticas y la verificación de evidencia pueden cometer errores.
- Hechos ausentes o no respaldados producen UNKNOWN, lo que puede generar indeterminación frecuente en casos reales.
- El uso del par completo exige el entorno CUDA documentado; una instalación en hardware distinto no está verificada.
- Solo soporta inglés.
- El repositorio contiene adaptadores y delta, no pesos completos; es necesario descargar por separado los modelos base públicos durante la configuración.
- Licencia Apache-2.0 con avisos upstream que deben conservarse; conviene revisar NOTICE e inference/licenses/ antes de uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nouli-ai/nouli-policy-pair
- Sitio de Nouli AI: https://nouli.ai
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base laya: https://huggingface.co/convaiinnovations/laya
- Guía de CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Nouli Guard: https://huggingface.co/nouli-ai/nouli-guard
- Nouli Route: https://huggingface.co/nouli-ai/nouli-route
- Nouli Clause: https://huggingface.co/nouli-ai/nouli-clause
- Nouli Push: https://huggingface.co/nouli-ai/nouli-push
- Nouli Doom: https://huggingface.co/nouli-ai/nouli-doom
