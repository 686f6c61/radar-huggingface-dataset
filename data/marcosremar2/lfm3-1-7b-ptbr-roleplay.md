# marcosremar2/lfm3-1.7b-ptbr-roleplay

## Resumen

LFM3-1.7B PT-BR Roleplay (v3) es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario marcosremar2, orientado a conversación breve y en personaje en portugués de Brasil. El objetivo es doble: mantener cháchara estilo WhatsApp y dar vida a personajes NPC dentro de un juego de aprendizaje de idiomas. Resuelve el problema de que un modelo base pequeño y multilingüe no mantiene el registro coloquial brasileño ni la coherencia de personaje en turnos cortos.

El modelo hereda la arquitectura y el tamaño del LFM3-1.7B original (1.728.801.600 parámetros totales según los pesos publicados) y se distribuye como adaptador PEFT (LoRA con r=32 y alpha=64) junto con una versión fusionada en GGUF Q4_K_M para llama.cpp. La licencia es lfm1.0, la misma del modelo base, y el único idioma declarado es el portugués.

Es relevante ahora porque demuestra un flujo completo de especialización de un modelo pequeño para una tarea conversacional concreta, con datos sintéticos generados por modelos mayores (Gemma 4 31B y Gemini 2.5 Flash), evaluación automática por turnos y artefactos reproducibles (datos, scripts de Slurm y juicios). Para equipos que despliegan NPC conversacionales en local, ofrece una alternativa ligera y cuantizada en 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B; no se detalla en la información disponible) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso con llama.cpp emplea `-c 8192` |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; el adaptador LoRA se puede fusionar y cuantizar con otras herramientas (no se listan otras variantes) |
| Idiomas soportados | Portugués (pt), con foco en portugués de Brasil |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (modelo fusionado Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre LiquidAI/LFM3-1.7B. El adaptador tiene rango 32 y alpha 64, se entrenó con learning rate 2e-4, batch efectivo de 8 × 4 acumulaciones, longitud máxima de 1.024 tokens y 3.600 pasos (aproximadamente una época) en una única A100 durante 76 minutos. Se usaron hasta 4 objetivos de asistente por conversación, lo que suma 115.335 ejemplos de entrenamiento.

Los datos combinan el dataset PT-BR roleplay de marcosremar2 (limpiado), chats estilo WhatsApp y conversaciones dependientes de contexto con seguimientos cortos ("e depois?", "prova!", "nem me fala") generadas con Gemma 4 31B; alrededor de 3.6k conversaciones de chat se generaron con Gemini 2.5 Flash. El conjunto de entrenamiento contiene 33.114 conversaciones (train-v3.jsonl) más ejemplos escritos a mano (extras.jsonl). Los abridores, seguimientos y escenas usados en la evaluación se excluyeron del entrenamiento. No se menciona RLHF ni DPO; el ajuste es supervisado sobre datos sintéticos y propios.

## Capacidades

- Generación de texto conversacional breve, con respuestas de hasta 3 frases según el prompt de sistema de ejemplo.
- Roleplay de personajes (NPC) con instrucciones de escena y mantenimiento del personaje.
- Cháchara estilo WhatsApp en portugués de Brasil, incluyendo seguimientos cortos y dependientes de contexto.
- Portugués de Brasil como idioma principal y único declarado.
- Compatible con endpoints (tag `endpoints_compatible`) y con el pipeline de text-generation de Hugging Face.
- Soporte de plantilla de chat vía `--jinja` en llama-server.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- NPCs de un juego de aprendizaje de idiomas: el modelo se entrenó específicamente para personajes con escena y registro coloquial, y responde en turnos cortos, lo que encaja con diálogos de videojuego.
- Práctica de conversación en portugués de Brasil: un alumno puede mantener un chat de seis turnos con un personaje y recibir respuestas en registro informal; la evaluación del autor mide coherencia, permanencia en personaje y calidad del portugués por turno.
- Simulación de atención al cliente informal: con un prompt de sistema que defina un rol (por ejemplo, vendedora de acarajé), el modelo mantiene el personaje y responde en portugués brasileño coloquial.
- Prototipado rápido de chatbots de personaje en local: la versión GGUF Q4_K_M se ejecuta con llama-server y `--jinja -c 8192`, sin necesidad de infraestructura de GPU grande.
- Generación de diálogos sintéticos para aumentar datasets de roleplay o de chat PT-BR, usando el modelo como generador de seguimientos y reacciones cortas.
- Evaluación comparativa de ajustes LoRA: el repositorio incluye 200 conversaciones de evaluación y juicios por turno de base, v1, v2 y v3, útiles como referencia para reproducir el pipeline.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1.7B cuantizado en 4 bits, cabe en hardware modesto para demos y pruebas internas.

## Benchmarks y rendimiento

Evaluación del autor: 200 conversaciones de seis turnos (100 de cháchara y 100 de roleplay), juzgadas por turno con Gemma 4 31B (Q8) y una rúbrica estilo RMTBench (coherente / en personaje / portugués de Brasil de 0 a 1, y puntuación global de 1 a 5).

Cháchara:

| Métrica | base | v1 | v2 | v3 |
|---|---|---|---|---|
| Coherente | 0.57 | 0.46 | 0.66 | 0.74 |
| En personaje | 0.56 | 0.94 | 0.88 | 0.93 |
| PT-BR | 0.81 | 0.93 | 0.93 | 0.95 |
| Puntuación 1-5 | 2.31 | 2.78 | 3.23 | 3.53 |

Roleplay:

| Métrica | base | v1 | v2 | v3 |
|---|---|---|---|---|
| Coherente | 0.81 | 0.81 | 0.78 | 0.90 |
| En personaje | 0.74 | 0.87 | 0.88 | 0.96 |
| PT-BR | 0.70 | 0.95 | 0.96 | 0.96 |
| Puntuación 1-5 | 2.52 | 3.53 | 3.48 | 4.03 |

Además, al preguntar "are you a bot?", 1 de cada 100 conversaciones admitió ser una IA. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1.3 GB e incluye el GGUF Q4_K_M, por lo que la inferencia cuantizada en 4 bits debería caber holgadamente en GPUs de consumo con 6-8 GB de VRAM (estimación, no dato del autor).
- GPU recomendadas: el entrenamiento se hizo en una A100; para inferencia no se especifican GPU concretas.
- GPU de consumo: al ser un modelo de 1.7B en Q4_K_M, es apto para GPUs de consumo; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp / llama-server con `--jinja -c 8192`; el adaptador se carga con PEFT sobre LiquidAI/LFM3-1.7B. No se documentan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-1.7B PT-BR Roleplay v3 | 1.728.801.600 | no disponible (ejemplo con 8192) | pt (PT-BR) | lfm1.0 | safetensors (LoRA) + GGUF Q4_K_M | Ajuste LoRA para roleplay y chat PT-BR |
| LiquidAI/LFM3-1.7B (base) | no disponible en la información | no disponible | multilingüe (no detallado) | lfm1.0 | no disponible | Modelo base; puntuaciones de evaluación inferiores en las tablas del autor |
| v1 y v2 del mismo autor | mismas que el base | no disponible | pt | lfm1.0 | no disponible | Versiones previas del ajuste; peores puntuaciones que v3 en roleplay y cháchara |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones provienen de un único juez LLM (Gemma 4 31B), no de evaluadores humanos.
- Aproximadamente 1 de cada 4 turnos de cháchara sigue siendo juzgado como incoherente, sobre todo reacciones vagas sobre el día del usuario ("que dia corrido viu").
- Modelo de 1.7B: memoria corta de la escena y hechos inventados ocasionales.
- Solo portugués (pt) declarado; no se garantiza comportamiento en otros idiomas.
- Licencia lfm1.0: conviene revisar las condiciones del modelo base para uso comercial antes de desplegar.
- El autor indica que 1 de cada 100 conversaciones admitió ser una IA al preguntarle directamente, lo que puede romper la inmersión en producción.
- No hay datos publicados sobre sesgos específicos, latencia, throughput ni soporte de tool calling.
- Los datos de entrenamiento incluyen contenido generado por Gemma 4 31B y Gemini 2.5 Flash, con las implicaciones de calidad y licencia que ello conlleva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcosremar2/lfm3-1.7b-ptbr-roleplay
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset PT-BR roleplay: https://huggingface.co/datasets/marcosremar2/pt-br-roleplay
