# Mincofficial/Minico-M1-1105-GGUF

## Resumen

Minico M1 1105 es un modelo de lenguaje de 354 millones de parámetros (350M) especializado en razonamiento, desarrollado por Mincofficial como un ajuste fino del modelo LFM2.5-350M de Liquid AI. Su propuesta diferencial es un sistema de cinco niveles de esfuerzo de razonamiento (`off`, `low`, `medium`, `high`, `max`) que permite controlar cuántos tokens de "pensamiento" genera el modelo antes de dar la respuesta final, algo poco habitual en modelos de este tamaño.

El modelo está pensado para ejecución en dispositivo (on-device) y entornos con recursos muy limitados. Esta ficha describe la versión cuantizada en GGUF, publicada para su uso con llama.cpp, Ollama y LM Studio, con ficheros que van desde 229 MB (Q4_K_M) hasta 711 MB (F16/BF16). El repositorio acumula 921 descargas y 2 likes en el momento de la consulta.

Es relevante porque demuestra que es posible incorporar razonamiento multi-paso controlable en modelos por debajo de los 400M de parámetros, con licencia que permite uso comercial bajo umbral de ingresos. La información disponible sobre arquitectura interna y datos de entrenamiento es escasa; los detalles que no constan se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `lfm2`, derivado de LiquidAI/LFM2.5-350M) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q6_K, Q8_0, F16, BF16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial permitido bajo umbral de ingresos |
| Formato de pesos | GGUF (repositorio cuantizado); modelo base en formato no especificado |
| Tamaño del repositorio | 4,7 GB |
| Pipeline | text-generation |
| Modelo base | Mincofficial/Minico-M1-1105 (a su vez derivado de LiquidAI/LFM2.5-350M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM2.5-350M de Liquid AI, etiquetado con el tag `lfm2`. La model card indica que los pesos se modificaron mediante SFT, DPO y GRPO, además de fusión de pesos (weight merging). No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles de la arquitectura interna (tipo de atención, capas, dimensión oculta), por lo que esos datos deben considerarse no disponibles.

La innovación técnica destacable es el sistema de niveles de esfuerzo de razonamiento, integrado en la plantilla de chat (`--jinja` en llama.cpp). Cada nivel fija un presupuesto máximo de tokens nuevos: `off` 1024, `low` 640, `medium` 1152, `high` 2368 y `max` 4608. En el nivel `off` se rellena previamente un bloque de pensamiento vacío para que el modelo responda directamente. La plantilla acepta alias (`none`, `minimal`, `xhigh`, entre otros) y el parámetro `enable_thinking=False`, equivalente a `off`. El valor por defecto es `high` desde el 8 de noviembre de 2026 (antes era `medium`).

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso con esfuerzo configurable en cinco niveles (`off`, `low`, `medium`, `high`, `max`).
- Modo "thinking" con bloque de pensamiento explícito, desactivable mediante `off` o `enable_thinking=False`.
- Ajuste del presupuesto de razonamiento por conversación, con presupuestos máximos de tokens definidos por nivel.
- Ejecución on-device en hardware de gama baja gracias a su tamaño reducido.
- Compatibilidad con llama.cpp, Ollama y LM Studio mediante ficheros GGUF.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Visión o audio: no disponible.

## Casos de uso

- Asistentes locales en dispositivos de gama baja: con el fichero Q4_K_M (229 MB) el modelo cabe en memoria de móviles, Raspberry Pi o portátiles sin GPU dedicada, permitiendo un asistente conversacional totalmente offline.
- Razonamiento con coste controlado: en tareas donde la latencia importa, el nivel `off` o `low` reduce el número de tokens generados (hasta 640 en `low`), útil para clasificación o respuestas directas en producción.
- Razonamiento profundo en tareas acotadas: el nivel `max` (hasta 4608 tokens nuevos) permite abordar problemas de lógica o matemáticas sencillas donde un modelo de 350M necesita descomponer el problema paso a paso.
- Prototipado de pipelines de razonamiento: investigadores pueden comparar el efecto del esfuerzo de razonamiento sobre la calidad de salida con un modelo pequeño y barato de ejecutar, antes de escalar a modelos mayores.
- Integración en aplicaciones de escritorio: mediante LM Studio u Ollama se puede embeber el modelo en herramientas de escritorio para autocompletado, resumen o generación de texto en inglés sin depender de la nube.
- Educación y experimentación: al ser un modelo abierto y ligero, sirve para enseñar conceptos de cuantización, plantillas de chat y control de decodificación en cursos de IA.
- Filtrado y preprocesado de texto en inglés: con el nivel `off` y baja latencia, puede usarse como clasificador o generador de etiquetas en pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio principal (Mincofficial/Minico-M1-1105) para consultar benchmarks y detalles, pero esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en Q4_K_M, 0,3 GB en Q6_K, 0,4 GB en Q8_0 y 0,75 GB en F16/BF16, según los tamaños de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el modelo está diseñado para ejecución en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, integradas con memoria compartida) e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y LM Studio. En llama.cpp debe usarse `--jinja` para activar la plantilla de chat con niveles de esfuerzo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento configurable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minico M1 1105 | 354M | no disponible | Sí (5 niveles) | LFM Open License v1.0 | GGUF en Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas de ~350M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa se limita al modelo base declarado.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara soporte de castellano ni de otros idiomas.
- Con 354M de parámetros, la capacidad de razonamiento y el conocimiento factual son limitados; riesgo alto de alucinación en preguntas abiertas o de dominio específico.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- No se recomienda cambiar el nivel de esfuerzo a mitad de conversación: el modelo fue entrenado con una configuración fija por chat; para cambiarla hay que iniciar una conversación nueva.
- La licencia LFM Open License v1.0 permite uso comercial solo a organizaciones por debajo del umbral de ingresos definido en la licencia; es necesario leerla antes de un uso comercial.
- Es una versión cuantizada de un modelo ya ajustado; las cuantizaciones Q4_K_M y Q6_K pueden degradar ligeramente la calidad respecto a Q8_0 o F16.
- La fecha de creación del repositorio (2026) y el valor por defecto de esfuerzo cambiado el 8 de noviembre de 2026 indican que el proyecto es reciente y puede cambiar sin aviso.
- No consta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mincofficial/Minico-M1-1105-GGUF
- Modelo base ajustado: https://huggingface.co/Mincofficial/Minico-M1-1105
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia: fichero `LICENSE` del repositorio (LFM Open License v1.0)
