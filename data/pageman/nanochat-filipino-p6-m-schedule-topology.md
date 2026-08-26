# pageman/nanochat-filipino-p6-m-schedule-topology

## Resumen

El repositorio `pageman/nanochat-filipino-p6-m-schedule-topology` contiene un conjunto de **checkpoints de investigación** (no un modelo de chat o producción) desarrollados por el autor `pageman` dentro del proyecto `nanochat-filipino`, que estudia el preentrenamiento continuo de modelos de lenguaje pequeños (basados en el framework `nanochat` de Karpathy) para el tagalo y el inglés. El objetivo es evaluar cómo la **topología de horario** (cómo se intercalan los datos de distintos idiomas durante el entrenamiento) afecta al rendimiento medido en bits por byte (BPB) sobre texto retenido.

El repositorio incluye nueve objetos: el padre congelado en tagalo (C0), dos controles (C1 extra-tagalo y C2 continuo en inglés) y cuatro brazos de topología (M-fine, M-coarse, M-blocked, M-rand), todos con el mismo seed 4. Se trata de un estudio científico pre-registrado (AsPredicted #307969) y los pesos son **recreaciones técnicas** de los originales, no copias bitwise idénticas. El modelo no está pensado para uso práctico, sino para contrastar hipótesis sobre el efecto del orden de los datos en el preentrenamiento continuo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (nanochat, basado en el diseño de Karpathy) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato `.pt` de PyTorch) |
| Idiomas soportados | tagalo y inglés (según los tags y la model card) |
| Licencia | other (derivada de datos de Wikipedia) |
| Formato de pesos | `.pt` (PyTorch), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la implementación `nanochat` de Karpathy, un transformer de decodificación de tamaño reducido diseñado para experimentos de investigación. La model card no especifica el número de capas, dimensiones o parámetros totales. El estudio utiliza un esquema de **preentrenamiento continuo**: parte de un padre congelado en tagalo (C0) y entrena variantes con diferentes horarios de intercalación de datos en tagalo e inglés (M-fine, M-coarse, M-blocked, M-rand). Los controles C1 y C2 sirven como referencia para aislar el efecto de la topología. No se menciona el uso de RLHF ni DPO; el objetivo es medir la pérdida en bits-per-byte (BPP) sobre un conjunto de retención.

## Capacidades

- **No es un modelo de chat ni de instrucción**: la model card lo declara explícitamente como "not a chat, instruction, or production model".
- **Generación de texto**: en principio puede generar texto en tagalo e inglés, pero no está optimizado para tareas conversacionales ni de seguimiento de instrucciones.
- **Investigación sobre pre-entrenamiento continuo**: su propósito es comparar el efecto de la topología de horario en la pérdida de bits-per-byte (BPP) sobre datos retenidos.
- **Soporte de tool calling**: no disponible.
- **Capacidades multilingües**: entrenado con datos de tagalo e inglés, pero sin métricas de rendimiento publicadas.

## Casos de uso

- **Investigación académica en PLN**: sirve para estudiar cómo el orden de los datos durante el entrenamiento continuo afecta a la pérdida de modelos pequeños en lenguas de bajos recursos. Los checkpoints permiten reproducir los contrastes pre-registrados (por ejemplo, M-fine vs. M-coarse) y comparar topologías.
- **Reproducción de experimentos**: investigadores pueden descargar los pesos y ejecutar el protocolo de evaluación definido en `evaluation/primary_contrasts.json` para verificar los resultados del estudio.
- **Análisis de la transferencia entre idiomas**: los controles C1 y C2 permiten aislar el efecto de la exposición extra a tagalo o inglés, útil para estudiar transferencia de conocimiento entre lenguas.
- **Desarrollo de métodos de pre-entrenamiento**: los cuatro brazos de topología sirven como banco de pruebas para nuevas técnicas de intercalado de datos en entrenamiento de modelos pequeños.
- **Investigación sobre la métrica bits-per-byte**: se puede usar para calibrar la relación entre la topología de horario y la BPP en modelos de decodificador, comparando con otros trabajos de la literatura.
- **Educación en PLN**: como recurso didáctico para ilustrar el diseño de experimentos controlados con modelos de lenguaje pequeños y la importancia de la topología de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un archivo `evaluation/primary_contrasts.json` con los contrastes principales, pero no se proporcionan valores numéricos en esta documentación. Se recomienda consultar el repositorio GitHub para obtener los resultados del estudio.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio es de 18.6 GB, pero no se especifica el tamaño de cada checkpoint. Dado que son modelos pequeños de tipo nanochat, es probable que cada archivo `.pt` quepa en GPUs de consumo (por ejemplo, RTX 3090/4090), pero no se confirma.
- **GPU recomendadas**: no especificadas. Como los pesos son en formato PyTorch, se puede usar cualquier GPU compatible con CUDA.
- **Despliegue**: no recomendado para producción. Para carga experimental, se requiere el código personalizado de `nanochat` disponible en `scripts/p6/` del repositorio GitHub; no es compatible con pipelines de `transformers`.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. El conjunto de checkpoints es único en su propósito (estudio de topología de horario) y no se publican resultados de rendimiento frente a otros modelos.

## Limitaciones y advertencias

- **No es un modelo de producción**: está diseñado exclusivamente para investigación; no debe usarse en aplicaciones reales.
- **Pesos recreados**: los archivos de M-fine, M-coarse, M-blocked y M-rand son recreaciones técnicas (2026-08-25) y no son bitwise idénticos a los originales del estudio. Esto puede afectar a la reproducibilidad exacta de los resultados.
- **Licencia restrictiva**: `license: other` (derivada de datos de Wikipedia) y no certifica el uso comercial. No es un lanzamiento oficial de la Universidad De La Salle (DLSU) ni de los autores del estudio.
- **Sin soporte de pipelines estándar**: los pesos requieren el código personalizado de `nanochat` para cargarse, no funcionan con `transformers` ni con herramientas de inferencia comunes.
- **Sesgos y alucinación**: no se han documentado sesgos específicos, pero al ser un modelo de investigación pequeño, puede producir texto de baja calidad y alucinaciones si se usa fuera de su contexto.
- **Contexto de idioma**: solo tagalo e inglés, no se garantiza soporte para otros idiomas.

## Enlaces

- HuggingFace: [pageman/nanochat-filipino-p6-m-schedule-topology](https://huggingface.co/pageman/nanochat-filipino-p6-m-schedule-topology)
- GitHub: [pageman/nanochat-filipino](https://github.com/pageman/nanochat-filipino)
- Subcarpetas del proyecto: [scripts/p6](https://github.com/pageman/nanochat-filipino/tree/main/scripts/p6), [docs/papers/p6-m-schedule-topology](https://github.com/pageman/nanochat-filipino/tree/main/docs/papers/p6-m-schedule-topology), [docs/run-cards/p6](https://github.com/pageman/nanochat-filipino/tree/main/docs/run-cards/p6), [manifests/p6](https://github.com/pageman/nanochat-filipino/tree/main/manifests/p6), [results/p6](https://github.com/pageman/nanochat-filipino/tree/main/results/p6), [docs/hub/p6-m-schedule-topology](https://github.com/pageman/nanochat-filipino/tree/main/docs/hub/p6-m-schedule-topology)
- Registro AsPredicted: [https://aspredicted.org/bk6m9d.pdf](https://aspredicted.org/bk6m9d.pdf)
- ResearchBox: [https://researchbox.org/8918](https://researchbox.org/8918)
- AsCollected: [https://ascollected.org/XZ8_TI5](https://ascollected.org/XZ8_TI5)
