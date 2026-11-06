# LuxiaSL/kotodama-tsumugi-1b-seed7-trajectory

## Resumen

kotodama-tsumugi 1B (seed 7) es un modelo de lenguaje decoder-only de 1,42 mil millones de parámetros desarrollado por LuxiaSL en colaboración con Anima Labs, dentro del programa de investigación kotodama. No es un modelo pensado para uso general, sino una réplica de semilla (seed 7) de la "trunk" del modelo principal, entrenada hasta 10B tokens con el objetivo de medir cuándo emerge la capacidad de *referent binding* (vinculación de referentes) durante el pretraining. El modelo principal de referencia es la trayectoria seed 17, entrenada hasta 100B tokens.

La arquitectura es un transformer con dos innovaciones destacables: un bloque central de 20 capas que se ejecuta dos veces (looped transformer), dando 72 capas efectivas sobre 52 capas únicas a anchura 1536, y un mecanismo de *attention residuals* (AttnRes) que enruta la atención entre bloques cuyos límites se ajustaron a la geometría de capas de la propia red, no de forma uniforme. El entrenamiento usó el optimizador Muon con batches de 2M tokens, contexto de 4K y learning rate constante.

El repositorio es fundamentalmente un artefacto de investigación: contiene checkpoints de la trayectoria de entrenamiento (cada 250M tokens hasta 4B, luego cada 1B hasta 10B) y dos ramas de cooldown, pero no incluye instruction tuning ni resultados de evaluación. Es relevante para investigadores que estudien dinámicas de entrenamiento, arquitecturas con capas compartidas y mecanismos de enrutamiento de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con looped block y attention residuals (AttnRes) |
| Parametros totales | 1,42B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y checkpoint.pt para estados resumibles |

## Arquitectura y entrenamiento

El modelo tiene 52 capas únicas a anchura 1536, con un bloque de 20 capas en el centro que se ejecuta dos veces, resultando en 72 capas efectivas. Las capas del bucle comparten pesos con el bloque central, y safetensors almacena cada tensor una sola vez; antes de cargar el modelo es necesario restaurar las entradas compartidas desde `aliases.json` (`sd[alias] = sd[source]`). El mecanismo AttnRes enruta residuales de atención entre bloques cuyos límites se ajustaron a la geometría de capas de la red en lugar de espaciarse uniformemente. El código del modelo está en el paquete `kotodama` (`KotodamaModel`, preset `1b-tsumugi`; el nombre anterior `1b-moonshot-loop` sigue cargando) y `config.json` contiene la forma, la especificación del bucle y los límites.

El entrenamiento usó el optimizador Muon, batches de 2M tokens, contexto de 4K y learning rate constante. Esta semilla se detuvo a 10B tokens como comparación de semillas. Los datos son una mezcla curada de predominio inglés con código, papers científicos, patentes, textos legales, libros, texto web, matemáticas y fuentes conversacionales, más un suplemento conversacional pequeño (aproximadamente 0,7% de los tokens). Los datos de entrenamiento no están publicados. Un detalle numérico relevante: esta trunk calculó el enrutamiento AttnRes en fp64 bajo `torch.compile`; las ejecuciones que continúen o ramifiquen desde estos checkpoints deben establecer `attnres_eps_fp64_compat: true` para obtener la misma numérica.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento y modelado de lenguaje general derivado del pretraining (sin instruction tuning).
- Capacidad de *referent binding* medible a lo largo de la trayectoria de entrenamiento, que es el objetivo declarado del proyecto.
- No incluye soporte documentado de tool calling ni function calling.
- No incluye soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre dinámicas de pretraining: los checkpoints cada 250M/1B tokens permiten estudiar la evolución de representaciones y capacidades a lo largo del entrenamiento, en concreto cuándo emerge el referent binding.
- Estudio de arquitecturas con capas compartidas: el bloque de 20 capas ejecutado dos veces sobre 52 capas únicas permite analizar el efecto del weight sharing en el bucle sobre la calidad del modelo.
- Análisis de mecanismos de enrutamiento de atención: AttnRes con límites ajustados a la geometría de capas es un objeto de estudio para quienes investigan variantes de atención y residuales.
- Comparación de semillas: al ser una réplica seed 7 de una trunk entrenada con otra semilla (seed 17), sirve para medir varianza entre semillas en las mismas condiciones.
- Reproducción de numérica: los checkpoints con `attnres_eps_fp64_compat` permiten reproducir exactamente el comportamiento de la trunk original en experimentos de continuación.
- Fine-tuning experimental: con licencia Apache 2.0 y pesos bf16, puede servir como base para experimentos académicos de ajuste, aunque sin instruction tuning previo.
- Estudio de ramas de cooldown: las ramas `anneal2000-…` (fork a 4.2B, hasta 5B) y `anneal4768-…` (fork a 10B, hasta 11B) permiten analizar el efecto del annealing sobre el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio no contiene resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,8 GB solo para pesos (1,42B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, varios GB adicionales según batch y longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para bf16 en batches pequeños; A100 o H100 para experimentos con batches mayores o análisis de la trayectoria.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4090, siempre que se gestione el KV cache para contexto de 4K.
- Opciones de despliegue: el paquete `kotodama` es la vía oficial; no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y el formato bf16 safetensors con tensores compartidos requiere la restauración desde `aliases.json` antes de cargar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kotodama-tsumugi 1B (seed 7) | 1,42B | 4K | Apache 2.0 | Looped transformer con AttnRes; artefacto de investigación sin instruction tuning |
| kotodama-tsumugi 1B (seed 17, trayectoria principal) | 1,42B | 4K | Apache 2.0 | Misma arquitectura, entrenado a 100B tokens |
| Modelos decoder-only de ~1B de uso general | ~1B | variable | variable | No disponible comparación directa con benchmarks en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo instruction-tuned: no está diseñado para responder instrucciones ni para uso conversacional directo.
- Sin resultados de evaluación publicados: no hay evidencia de rendimiento en tareas estándar.
- Entrenado solo hasta 10B tokens (frente a los 100B de la trayectoria principal), por lo que su calidad es sustancialmente inferior a la del modelo completo.
- Idiomas: solo inglés según la model card; no hay soporte multilingüe documentado.
- Contexto limitado a 4K tokens.
- Los datos de entrenamiento no están publicados, lo que impide auditar sesgos y composición.
- Riesgo de alucinación inherente a un modelo de lenguaje sin ajuste, agravado por el entrenamiento parcial.
- La carga requiere restaurar tensores compartidos desde `aliases.json`; ignorar este paso produce un modelo incorrecto.
- Para reproducir la numérica original hay que activar `attnres_eps_fp64_compat: true`.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación del modelo hace desaconsejable su uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-seed7-trajectory
- Modelo principal (seed 17, 100B): https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-trajectory
- Páginas del proyecto: https://kotodama.animalabs.ai/
- Binding Atlas: https://kotodama.animalabs.ai/binding-atlas
- Repositorio de código: https://github.com/anima-research/kotodama
- Anima Labs: https://animalabs.ai/
- Perfil del autor: https://x.com/kataletheia
- Claude (Anthropic): https://www.anthropic.com/claude
