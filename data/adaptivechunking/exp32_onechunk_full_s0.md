# AdaptiveChunking/exp32_onechunk_full_s0

## Resumen

exp32_onechunk_full_s0 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de un modelo byte-level basado en la arquitectura H-Net, entrenado con el denominado legacy trainer (`legacy/tier1/train.py`) del repositorio beetle-hnet. El modelo se ha separado del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el formato por ejecución de Beetle.

El modelo cuenta con 82.470.528 parámetros (aproximadamente 82,5 millones) y se distribuye en formato safetensors junto con archivos de configuración. Su propósito declarado no es la generación de texto de propósito general, sino la experimentación con técnicas de tokenización y chunking dinámico a nivel de byte, un área de investigación que busca eliminar la dependencia de tokenizadores subword fijos.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card orientada a uso en producción ni resultados de benchmarks publicados. Debe evaluarse como material reproducible para experimentos de chunking, no como un modelo listo para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags del repo: hnet, byte-level, beetle-hnet) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pytorch); checkpoints por paso en ramas `step-N` |

## Arquitectura y entrenamiento

La información disponible indica que el modelo sigue la arquitectura H-Net en configuración byte-level, implementada en el repositorio beetle-hnet. El entrenamiento se realizó con el legacy trainer del proyecto (`legacy/tier1/train.py`), lo que implica que no se conservó estado del optimizador: el repositorio no incluye directorio `training_state/`. Esta circunstancia limita la reproducibilidad exacta del entrenamiento a partir de los pesos publicados.

El repositorio conserva 30 checkpoints intermedios en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 4000, 8000, entre otros), cada uno con `model.safetensors` y `config.json`. La configuración incluye `model_config`, la configuración de entrenamiento y un mapa `tied_weights` que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica declarada se centra en el chunking dinámico y la tokenización a nivel de byte, con sondas de frontera FLORES+ asociadas a esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `exp32_onechunk_full_s0/`.

## Capacidades

- Procesamiento a nivel de byte (byte-level), sin dependencia declarada de un tokenizador subword externo.
- Chunking dinámico: la arquitectura está orientada a experimentar con segmentación adaptativa de secuencias.
- Evaluación de fronteras de chunk mediante sondas FLORES+ publicadas en el dataset asociado.
- Reproducción de checkpoints intermedios: 30 ramas `step-N` permiten analizar la evolución del entrenamiento.
- Generación de texto, razonamiento, código, matemáticas, visión o audio: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas no se declaran en la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como base reproducible para comparar estrategias de chunking dinámico frente a tokenizadores subword convencionales, usando los checkpoints `step-N` para analizar la evolución por paso.
- Análisis de fronteras de segmentación: las sondas FLORES+ del dataset `hnet-chunking-probes` permiten evaluar cómo el modelo delimita unidades lingüísticas en distintos idiomas y comparar entre ejecuciones.
- Reproducción de experimentos académicos: al conservar 30 checkpoints y los archivos `final.json` y `log.jsonl`, es adecuado para estudiar curvas de entrenamiento y estabilidad del legacy trainer.
- Estudio de arquitecturas H-Net: con 82,5 M de parámetros, el modelo cabe en una GPU consumer y permite iterar rápidamente sobre variantes arquitectónicas sin grandes costes de cómputo.
- Base para fine-tuning en tareas de segmentación: el modelo puede servir como inicialización para experimentos de chunking específicos de dominio, aunque requeriría validación propia al no haber benchmarks publicados.
- Docencia y formación: su tamaño reducido y licencia Apache 2.0 facilitan su uso en cursos sobre tokenización, arquitecturas eficientes y entrenamiento de modelos pequeños.
- Comparación entre ejecuciones de la organización: junto con otros repos de AdaptiveChunking (por ejemplo, `hnet-chunking-pilots`), permite contrastar configuraciones de chunking bajo un mismo marco experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 330 MB solo para pesos (82,5 M de parámetros × 4 bytes), más overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 165 MB para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad de memoria; para entrenamiento o evaluación por lotes se recomienda RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4-8 GB de VRAM considerando overhead del framework.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura de investigación (H-Net byte-level), no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; la vía natural es cargar los safetensors con PyTorch y el código de beetle-hnet.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exp32_onechunk_full_s0 | 82,5 M | no disponible | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (0 descargas) |
| AdaptiveChunking/hnet-chunking-spec-82m | ~82 M (repo empaquetado del que se separó) | no disponible | H-Net byte-level, múltiples ejecuciones | Apache 2.0 (según repo origen) | Hugging Face |
| AdaptiveChunking/hnet-chunking-pilots | no disponible | no disponible | Experimentos piloto de chunking | no disponible | Hugging Face |

No se dispone de información sobre modelos de otras organizaciones directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no hay model card orientada a uso en producción ni benchmarks publicados; no debe asumirse calidad de generación de texto.
- Sin estado del optimizador: el legacy trainer no lo conservó, lo que impide reanudar el entrenamiento de forma exacta desde los checkpoints.
- Idiomas no declarados: se desconoce la cobertura lingüística real pese a las sondas FLORES+.
- Longitud de contexto no documentada: no es posible planificar despliegues con ventanas largas sin validación empírica.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; cualquier uso generativo requeriría auditoría propia.
- Compatibilidad de despliegue limitada: al no ser una arquitectura transformer estándar, es probable que las herramientas habituales (vLLM, llama.cpp, Ollama) no lo soporten sin adaptación.
- Licencia Apache 2.0: permite uso comercial, pero al no existir evaluación de calidad ni documentación de entrenamiento, el uso en producción conlleva riesgo técnico y reputacional.
- Repositorio de gran tamaño (9,9 GB) por la acumulación de 30 checkpoints, lo que encarece la descarga y el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_onechunk_full_s0
- Repositorio origen empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Experimentos piloto: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
- Código del entrenador (beetle-hnet): https://github.com/suchirsalhan/beetle-hnet
