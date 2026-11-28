# reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF

## Resumen

Qwen3.5-2B-CyberSec-GGUF es la exportación en formato GGUF del checkpoint ajustado `reaperdoesntknow/Qwen3.5-2B-CyberSec`, un modelo de lenguaje de aproximadamente 1.940 millones de parámetros derivado de `unsloth/Qwen3.5-2B` y especializado mediante instrucciones del dataset Trendyol Cybersecurity Instruction Tuning. El autor, `reaperdoesntknow`, publica esta versión cuantizada para su uso con `llama.cpp`, Ollama y otros runtimes compatibles con GGUF, con el objetivo de facilitar la inferencia local en CPU y GPU de consumo.

El modelo pertenece a la familia Qwen 3.5 (tag `qwen3_5`) y hereda la arquitectura del checkpoint base, aunque la model card no detalla explícitamente los pormenores arquitectónicos. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación, y el repositorio incluye cuatro artefactos: BF16, Q8_0, Q4_K_M y un proyector multimodal BF16-mmproj.

La relevancia de esta ficha radica en que se trata de un modelo pequeño (2B) especializado en ciberseguridad, pensado para evaluación cualitativa local y experimentación en entornos con recursos limitados. No obstante, el autor advierte explícitamente de la ausencia de benchmarks, informes de seguridad y pruebas de humo multimodales, por lo que debe tratarse como un artefacto de experimentación más que como una herramienta de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5; detalles no disponibles en la información proporcionada) |
| Parámetros totales | 1.942.653.248 (~1,94 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (archivos GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `Qwen3.5-2B` más allá de su pertenencia a la familia Qwen 3.5. El checkpoint del que deriva esta exportación es `reaperdoesntknow/Qwen3.5-2B-CyberSec`, que a su vez se registra como ajuste de `unsloth/Qwen3.5-2B`. El ajuste se asocia al dataset Trendyol Cybersecurity Instruction Tuning, lo que sugiere un proceso de instruction tuning orientado a tareas de seguridad informática.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio incluye un proyector multimodal BF16-mmproj, y la configuración del modelo fuente incorpora componentes de visión, pero el autor advierte que no se incluye una prueba de humo multimodal documentada, por lo que la capacidad de visión no debe asumirse sin verificación.

## Capacidades

- Generación de texto conversacional en el dominio de ciberseguridad, según el ajuste con el dataset Trendyol.
- Instrucciones y respuestas multi-turno (tag `conversational`).
- Razonamiento sobre conceptos de seguridad: el ajuste está orientado a instrucciones de ciberseguridad, aunque no se documentan capacidades específicas verificadas.
- Posible soporte multimodal (visión) por la presencia del proyector BF16-mmproj y los componentes de visión en la configuración del modelo fuente; no verificado ni documentado con pruebas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación cualitativa local del checkpoint fuente: el modelo permite comparar la calidad de salida entre las builds BF16, Q8_0 y Q4_K_M en una misma máquina, útil para decidir qué cuantización desplegar antes de escalar.
- Experimentación en CPU o GPU de consumo: con 1,31 GB en Q4_K_M, cabe en equipos modestos y permite probar flujos de instrucciones de ciberseguridad sin infraestructura dedicada.
- Asistente de formación en seguridad: puede generar explicaciones y respuestas sobre conceptos de ciberseguridad para entornos de aprendizaje, siempre con revisión humana dada la ausencia de benchmarks.
- Generación de borradores de documentación técnica de seguridad: el ajuste con instrucciones del dominio puede producir textos de referencia que un analista revisa y corrige antes de publicar.
- Prototipado de chatbots especializados: su naturaleza conversacional y su tamaño reducido permiten integrarlo en demos de atención o consulta sobre temáticas de seguridad con latencia baja en hardware de consumo.
- Comparación de linajes y cuantizaciones en investigación: sirve como caso de estudio para medir el impacto de la cuantización GGUF sobre un modelo ajustado con instrucciones de dominio específico.
- Análisis de configuraciones y comandos en entornos aislados: puede sugerir comandos o configuraciones de seguridad, pero el autor advierte que no deben ejecutarse sin revisión y aislamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta release GGUF no incluye benchmarks, informes de regresión ni evaluaciones de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB para BF16 (3,90 GB de pesos), ~2,5 GB para Q8_0 (2,08 GB) y ~1,8 GB para Q4_K_M (1,31 GB), añadiendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16; GPUs de consumo como RTX 3060, RTX 4060 o superiores son suficientes para Q4_K_M y Q8_0. Para BF16 se recomienda RTX 4070 o superior, o GPUs de datacenter (A100, H100) si se busca throughput alto.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más de VRAM, especialmente en Q4_K_M.
- Opciones de despliegue: `llama.cpp` (`llama-cli`), Ollama (`ollama run hf.co/...`), y otros runtimes compatibles con GGUF. El autor documenta el flag `--jinja` para `llama-cli`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada. Se indica "no disponible" para evitar inferencias sin respaldo. Como referencia estructural, el modelo base registrado es `unsloth/Qwen3.5-2B`, del que este checkpoint es un ajuste de dominio, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- La cuantización puede alterar la calidad y el comportamiento respecto al checkpoint fuente; el autor lo advierte explícitamente.
- No hay benchmarks, informes de regresión ni evaluaciones de seguridad publicados con esta release.
- Las instrucciones de seguridad generadas pueden ser incorrectas, inseguras o de doble uso; no deben ejecutarse comandos sin revisión y aislamiento.
- No debe utilizarse el modelo como control de seguridad autoritativo ni como tomador de decisiones en producción.
- La capacidad multimodal no está verificada: el proyector BF16-mmproj está presente, pero no hay prueba de humo documentada; es necesario verificar el proyector, el formato de prompt, la versión del runtime y la ruta de imagen antes de afirmar soporte multimodal.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto o idioma en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad traslada al integrador la responsabilidad de validar el comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Checkpoint fuente: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Modelo base upstream registrado: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de ajuste: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Colección CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
