# AdaptiveChunking/parity_B_ste_s1

## Resumen

`parity_B_ste_s1` es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre la arquitectura H-Net del proyecto beetle-hnet. El objetivo declarado es `parity`, con un esquema de entrenamiento `schedule=B` y una estrategia de de-chunking `ste` (straight-through estimator), ejecutado durante 6000 pasos sobre lotes de 32 secuencias de 1024 bytes.

El modelo cuenta con 22.516.992 parámetros totales según los pesos en safetensors y se distribuye bajo licencia Apache 2.0. Su relevancia es fundamentalmente metodológica: sirve para estudiar cómo un modelo byte-level aprende a segmentar dinámicamente el flujo de entrada, no para tareas de generación de texto abiertas. El repositorio ocupa 2,4 GB debido a que incluye múltiples ramas `step-N` con estados completos de entrenador reanudables.

La model card es extremadamente escueta y no documenta idiomas soportados, pipeline ni resultados de evaluación más allá de las sondas de frontera FLORES+ previstas en la rama `main` una vez finalizado el entrenamiento. Cualquier uso en producción requeriría un análisis previo del checkpoint y del código de beetle-hnet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level, dynamic chunking) |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (byte-level, `langs None` en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez), `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, un diseño orientado a tokenización dinámica sobre flujo de bytes. La configuración del run indica `architecture=hnet`, `objective=parity`, `schedule=B`, `dechunk=ste` y semilla 1. El entrenamiento se ejecutó durante 6000 pasos con lotes de 32 secuencias de 1024 bytes cada una, sin especificación de idiomas (`langs None`), lo que sugiere un régimen de entrenamiento puramente byte-level sin sesgo lingüístico declarado.

La innovación técnica central es el mecanismo de chunking dinámico con de-chunking mediante straight-through estimator (STE), que permite diferenciar a través de decisiones discretas de segmentación. El repositorio organiza los checkpoints en ramas `step-N` siguiendo un calendario logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k) desde el inicio de cada fase del objetivo, más el paso final. Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado completo reanudable del entrenador en `training_state/checkpoint.pt`. No se documentan datos sobre volumen total de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Modelo de investigación byte-level: procesa flujo de bytes sin tokenizador externo.
- Segmentación dinámica de la entrada mediante chunking adaptativo.
- Diferenciación a través de decisiones de segmentación discretas vía straight-through estimator.
- Entrenado con objetivo `parity`, orientado a tareas de emparejamiento o consistencia, no a generación abierta.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingüe explícita; el entrenamiento se realizó sin especificación de idiomas.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación en tokenización dinámica: permite reproducir y analizar cómo un H-Net aprende fronteras de chunk sobre bytes, usando las ramas `step-N` para estudiar la evolución del comportamiento a lo largo del entrenamiento.
- Estudio de estimadores straight-through: el checkpoint sirve para comparar la calidad del gradiente aproximado en decisiones discretas de segmentación frente a alternativas como Gumbel-Softmax.
- Análisis de sondas de frontera: la rama `main` incluye sondas FLORES+ (`probe/`) que permiten evaluar la calidad de las fronteras de chunking sobre texto multilingüe una vez finalizado el run.
- Reproducibilidad de experimentos: el estado reanudable en `training_state/checkpoint.pt` permite continuar el entrenamiento exactamente desde cualquier paso conservado.
- Baseline para comparativas de arquitecturas byte-level: al ser un run con semilla y schedule fijos (`B`, seed 1), sirve como referencia controlada frente a otros checkpoints de la misma organización.
- Docencia y formación: adecuado para explicar en un curso o tutorial cómo se estructura un pipeline de entrenamiento byte-level con chunking dinámico y checkpoints por fases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la existencia de sondas de frontera FLORES+ en la carpeta `probe/` de la rama `main` una vez concluido el entrenamiento, pero no se proporcionan cifras en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB; en fp16 unos 45 MB. La VRAM adicional depende de la longitud de secuencia y del estado interno del H-Net, no documentado.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para cargar los pesos; para entrenamiento o evaluación a 1024 bytes por secuencia, una RTX 3090 o superior ofrece margen cómodo.
- Cabe holgadamente en GPU consumer, incluida una GTX 1650 de 4 GB.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura custom (H-Net), requiere el código de beetle-hnet; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaptiveChunking/parity_B_ste_s1 | 22,5 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Byte-level BPE estándar (referencia conceptual) | variable | variable | Tokenizador fijo | variable | Amplia |
| Otros checkpoints de AdaptiveChunking | no disponible | no disponible | Variantes de schedule/seed | Apache 2.0 | Hugging Face (org) |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los modelos byte-level con chunking dinámico son escasos y no se han identificado competidores directos documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado ni validado para uso en producción ni para generación de texto abierta.
- Objetivo `parity`: las capacidades reales del checkpoint están acotadas a la tarea con la que fue entrenado; no debe asumirse comportamiento conversacional.
- Sin datos de evaluación publicados: no hay métricas de calidad, sesgo ni robustez más allá de las sondas FLORES+ previstas.
- Idiomas no especificados: el entrenamiento se realizó con `langs None`, por lo que no hay garantía de comportamiento correcto en ningún idioma concreto.
- Riesgo de alucinación: no aplicable en el sentido habitual, pero el modelo puede producir segmentaciones o salidas sin significado lingüístico fuera de su distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de validación desaconseja cualquier despliegue productivo sin evaluación propia.
- Dependencia del código de beetle-hnet: la arquitectura H-Net no es estándar y requiere el repositorio del autor para cargar los pesos correctamente.
- Los tensores tied se almacenan una sola vez; es necesario respetar `config.json["tied_weights"]` al cargar para evitar errores de claves faltantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/parity_B_ste_s1
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
