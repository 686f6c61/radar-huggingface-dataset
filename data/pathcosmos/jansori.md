# pathcosmos/JANSORI

## Resumen
JANSORI es un modelo de lenguaje de tipo base (no instruido) desarrollado por el usuario de Hugging Face pathcosmos, especializado en generación de texto y continuación de frases en coreano e inglés. Se trata de un transformer denso de 3.221.400.576 parámetros (aproximadamente 3,2 mil millones), con un vocabulario de 65.536 tokens y una longitud de contexto verificada de 4.096 tokens. No incorpora tokens de rol conversacional: está pensado para recibir texto plano y continuarlo, no para mantener diálogos estructurados.

El modelo se distribuye bajo licencia Apache 2.0 en tres formatos dentro del mismo commit de despliegue: pesos BF16 en safetensors, GGUF Q8_0 y GGUF Q4_K_M. El autor publica mediciones de perplejidad sobre un holdout propio (663.905 objetivos en coreano y 705.634 en inglés), así como cifras de velocidad y consumo de VRAM en una GPU H200, lo que permite evaluar el compromiso entre precisión y coste de inferencia.

Su relevancia radica en ser un modelo pequeño y de licencia permisiva orientado específicamente al coreano, un idioma con menos oferta de modelos abiertos de este tamaño. No obstante, la model card documenta de forma explícita limitaciones notables en razonamiento aritmético, coherencia de repetición y generación de código, por lo que debe considerarse una base de partida para ajuste fino más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama, según tags) |
| Parámetros totales | 3.221.400.576 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (verificada) |
| Tipos de cuantización | BF16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de la etiqueta "llama" en los tags de Hugging Face y la descripción del autor como "3B Dense Base". No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni si se emplean variantes como GQA o atención lineal. El vocabulario es de 65.536 tokens y el contexto verificado es de 4.096 tokens; la model card menciona ajustes de redondeo de RoPE y de la forma de invocación de atención para que los logits coincidan con la implementación nativa, lo que sugiere el uso de RoPE estándar.

El entrenamiento consistió en 47.000 pasos con un acumulado de 98.566.144.000 tokens (unos 98,6 mil millones), según cifras del autor que incluyen exposiciones repetidas por fuente. La composición del corpus es mayoritariamente inglesa y coreana: fineweb-edu (29,987 %), fineweb-2 coreano (29,461 %), HPLT2.0 coreano (20,044 %), open-web-math (10,005 %), github-code (10,001 %) y Wikipedia coreana (0,502 %). No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo base.

## Capacidades
- Generación de texto y continuación de frases en coreano e inglés a partir de texto plano.
- Modelado de lenguaje general: no dispone de plantilla de chat ni de tokens de rol, por lo que no está diseñado para seguir instrucciones de forma nativa.
- Cobertura de contenido matemático y de código en el preentrenamiento (open-web-math y github-code representan en conjunto cerca del 20 % de los tokens), aunque el rendimiento observado en estas áreas es limitado.
- Capacidad multilingüe restringida a coreano e inglés; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio.
- Compatible con text-generation-inference y con endpoints compatibles según los tags del repositorio.

## Casos de uso
- Ajuste fino supervisado para un asistente conversacional en coreano: al ser un modelo base con licencia Apache 2.0 y pesos en safetensors, sirve como punto de partida para SFT con datos propios de diálogo, añadiendo la plantilla de chat que el modelo base no incorpora.
- Generación de texto coreano en dominios acotados: continuación de artículos, descripciones de producto o resúmenes breves donde el contexto quepa en 4.096 tokens y se acepte revisión humana posterior.
- Experimentación académica con modelos pequeños en coreano: su tamaño de 3,2 mil millones permite entrenar y evaluar variantes en una sola GPU, con perplejidad de referencia publicada (9,09 en coreano, 10,22 en inglés en BF16) para comparar.
- Despliegue en local con Ollama: las variantes Q8_0 y Q4_K_M permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, útil para prototipos de autocompletado o generación de borradores sin conexión.
- Traducción asistida coreano-inglés como base para ajuste: el corpus bilingüe de preentrenamiento lo hace apto para fine-tuning en tareas de traducción, aunque no se han publicado evaluaciones de traducción.
- Generación de datos sintéticos de texto coreano para aumentar corpus de entrenamiento de otros modelos, con filtrado y verificación humana dado el riesgo de repetición documentado.
- Servicio de inferencia de bajo coste con vLLM: el autor documenta un despliegue con `vllm serve` en BF16 sobre una H200 con 100,27 tokens/s por petición de referencia, adecuado para cargas moderadas.

## Benchmarks y rendimiento
El autor publica perplejidad sobre un holdout propio y métricas de velocidad y VRAM medidas en una GPU H200 con seis prompts fijos de hasta 64 tokens. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Formato | Tamaño del paquete (bytes) | PPL coreano | PPL inglés | Tokens/s por petición | VRAM máxima generación (MiB) |
|---|---:|---:|---:|---:|---:|
| BF16 | 6.448.116.613 | 9,089808 | 10,215738 | 100,27 | 8.805,9 |
| Q8_0 | 3.426.185.184 | 9,090860 | 10,217286 | 14,49 | 5.055,9 |
| Q4_K_M | 1.969.663.968 | 9,196303 | 10,317744 | 9,95 | 3.761,9 |

Como referencia interna, el autor cita perplejidad nativa de 9,087589 en coreano y 10,213156 en inglés.

## Requisitos de hardware
- VRAM estimada en BF16: aproximadamente 8,8 GB en generación según la medición del autor en H200 (pesos de 6,45 GB más caché KV y overhead).
- VRAM estimada en Q8_0: aproximadamente 5,1 GB; en Q4_K_M: aproximadamente 3,8 GB, según las mismas mediciones.
- GPU recomendadas: H200 (configuración medida por el autor); cualquier GPU con al menos 12-16 GB de VRAM para BF16 y 6-8 GB para Q4_K_M.
- Compatibilidad con GPU de consumo: Q4_K_M (unos 3,8 GB de VRAM) cabe en tarjetas de 8 GB como la RTX 3060 Ti o la RTX 4060; BF16 requiere tarjetas de 12 GB o más, como la RTX 3060 de 12 GB o la RTX 4070 Ti.
- Opciones de despliegue: vLLM 0.11.2 (comando documentado con `--dtype bfloat16 --max-model-len 4096`), Ollama 0.40.16 (etiquetas `Q8_0` y `Q4_K_M`), y text-generation-inference según los tags del repositorio.
- Throughput medido en H200: 100,27 tokens/s en BF16 por petición de referencia; 14,49 tokens/s en Q8_0 y 9,95 tokens/s en Q4_K_M. Son cifras de una única petición secuencial, no de serving concurrente.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de benchmarks comparables con otros modelos de la misma categoría, por lo que la comparación se limita a parámetros, contexto y licencia.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| JANSORI | 3,22 B (denso) | 4.096 | ko, en | Apache 2.0 | safetensors, GGUF |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable; requiere SFT o prompting de continuación.
- Repetición degenerativa documentada: en la explicación de la refracción de la luz, las tres variantes repiten la misma frase sobre el límite del medio sin explicar la causa.
- Errores aritméticos: en el problema de repartir 12 manzanas entre 3 personas, las tres variantes responden 12 en lugar de 4.
- Código poco fiable: en la función `add` en coreano, Q4_K_M genera llamadas con más argumentos de los declarados; en la función de paridad, Q4_K_M invierte la condición (devuelve `False` para pares) y las tres variantes pierden la indentación.
- Inconsistencia en razonamiento: en una ecuación en inglés, BF16 y Q8_0 escriben primero 4 y luego corrigen a 5; Q4_K_M calcula 12 − 7 = 5 directamente.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a coreano e inglés; no se declara soporte de español ni de otros idiomas.
- Riesgo de sesgos y alucinaciones inherente a un modelo base entrenado con web crawling (fineweb, HPLT, github-code), sin filtrado de seguridad documentado.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre calidad o idoneidad para producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/pathcosmos/JANSORI
- Dataset Wikipedia (coreano): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset HPLT2.0 cleaned: https://huggingface.co/datasets/HPLT/HPLT2.0_cleaned
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset open-web-math: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset github-code: https://huggingface.co/datasets/codeparrot/github-code
- Sumas SHA-256 de los pesos: https://huggingface.co/pathcosmos/JANSORI/blob/main/SHA256SUMS
