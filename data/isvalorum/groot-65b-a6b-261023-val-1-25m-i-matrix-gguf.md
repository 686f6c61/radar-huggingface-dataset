# IsValorum/Groot-65B-A6B-261023-VAL-1.25M-I-Matrix-GGUF

## Resumen

Groot-65B-A6B-261023 VAL 1.25M I-Matrix GGUF es una cuantización GGUF del modelo base GrootTeam/Groot-65B-A6B-261023, publicada por el usuario IsValorum. No se trata de un modelo entrenado desde cero, sino de un artefacto de calibración: el autor ha recopilado estadísticas de importancia (importance matrix, I-Matrix) sobre 1.251.328 posiciones de tokens para alimentar una futura cuantización GGUF del modelo base. El repositorio en sí contiene los datos de calibración y el resultado del proceso, no un conjunto de pesos listo para inferencia de propósito general.

El modelo base emplea la arquitectura `qwen4exp`, un transformer MoE con 48 capas causales (36 de atención lineal y 12 de atención completa), 256 expertos enrutados por capa y top-k=10, con un tamaño de experto intermedio de 640. La model card describe explícitamente que la cobertura de calibración es de inferencia de texto causal y que no se incluyen métricas de perplejidad ni de benchmarks posteriores a la cuantización.

La relevancia de esta ficha es acotada: se trata de un artefacto técnico de calibración con 1 descarga y 0 likes en el momento de la consulta, orientado a quien necesite reproducir o auditar el proceso de cuantización del modelo base. Los datos de parámetros totales reportados en safetensors (148.294.275) no concuerdan con la nomenclatura "65B-A6B" del nombre, lo que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp: 48 capas causales (36 de atención lineal, 12 de atención completa), MoE con 256 expertos enrutados por capa, top-k=10, tamaño de experto intermedio 640 |
| Parametros totales | 148.294.275 (dato reportado en safetensors); la nomenclatura del nombre indica 65B-A6B, discrepancia no aclarada en la información disponible |
| Parametros activos | no disponible (top-k=10 sobre 256 expertos, pero sin cifra oficial de parámetros activos) |
| Longitud de contexto | no disponible (la calibración usa ventanas de 2048 tokens, no implica contexto máximo del modelo) |
| Tipos de cuantizacion | GGUF con importance matrix (I-Matrix) generada sobre 1.251.328 posiciones; niveles concretos de cuantización no especificados |
| Idiomas soportados | en, es, zh, hi, ar, fr, de, pt, ja, ru, ko, it |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (repositorio de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `qwen4exp`, un transformer con mezcla de expertos (MoE) de 48 capas causales, de las cuales 36 usan atención lineal y 12 usan atención completa. Cada capa contiene 256 expertos enrutados con top-k=10 y un tamaño intermedio de experto de 640. El modelo fuente incluye además un bloque MTP (multi-token prediction) y componentes de visión, ambos explícitamente excluidos de esta calibración, que es solo de texto.

El repositorio no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), sino únicamente el proceso de calibración para cuantización. Este se ejecutó con llama.cpp `b11512` (commit `a11f57ba93797579a5d1855ee216a31f10242676`), con Flash Attention activado, sobre una NVIDIA RTX PRO 6000 con CUDA. Se procesaron 611 ventanas de 2048 tokens (1.251.328 posiciones) con una mezcla objetivo 30/20/35/15: 30,03% código (10 lenguajes de programación), 19,92% razonamiento, 34,89% prosa y 15,15% herramientas/agentic, repartido entre 12 lenguajes naturales. El autor señala una corrección de metadatos de ratio de compresión: las 12 capas de atención completa usan ratio 4, sin cambios en los pesos.

## Capacidades

- Generación de texto causal en 12 idiomas naturales (en, es, zh, hi, ar, fr, de, pt, ja, ru, ko, it).
- Cobertura de calibración específica para código en Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, SQL y Shell.
- Cobertura de calibración para razonamiento matemático y estructurado.
- Cobertura de calibración para esquemas de herramientas, llamadas, resultados y transcripciones multi-turno (agentic).
- El modelo base incorpora un bloque MTP y componentes de visión, aunque quedan fuera del alcance de esta calibración de texto.
- No se documentan en la información disponible capacidades adicionales verificadas (tool calling en producción, thinking mode, audio) más allá de la cobertura del corpus de calibración.

## Casos de uso

- Auditoría de calibración de cuantizaciones: el artefacto permite verificar la distribución de tokens usada (30/20/35/15) y reproducir el proceso con llama.cpp `b11512` sobre el modelo base, útil para equipos que validan la calidad de sus propios GGUF.
- Cuantización de modelos MoE con atención híbrida: la I-Matrix cubre las 48 capas y los 256 expertos con cobertura del 100% (0 expertos no observados), lo que sirve como referencia para calibrar modelos con topología similar.
- Evaluación de sesgo de corpus de calibración: al estar desglosado por lenguaje y categoría (incluido el reparto 20/120 para inglés y español frente a 8/120 para el resto), permite estudiar cómo la composición del corpus afecta a la cuantización.
- Investigación sobre atención lineal frente a completa: la separación 36/12 capas y la corrección del ratio de compresión documentada facilitan experimentos sobre el impacto de la cuantización en cada tipo de capa.
- Reproducción de pipelines de calibración multilingüe: el desglose por 12 idiomas y 10 lenguajes de programación sirve de plantilla para construir corpus de calibración equilibrados.
- Integración en flujos de publicación de GGUF: el autor documenta flags de ejecución (`--process-output --no-ppl --no-escape --parse-special -c 2048 -b 2048 -ub 2048 --chunks 611 -ngl 99 -fa on`) que pueden reutilizarse como receta reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se incluye perplejidad, benchmark downstream ni ninguna afirmación medida sobre la calidad de la cuantización; las comprobaciones realizadas establecen integridad y cobertura de observación, no calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo cuantizado final; el repositorio ocupa 0,6 GB y contiene el artefacto de calibración, no un conjunto de pesos completo listo para servir.
- GPU empleada en la calibración: NVIDIA RTX PRO 6000 con CUDA y Flash Attention activado.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño final del GGUF del modelo base, que no se especifica.
- Opciones de despliegue: llama.cpp (versión `b11512` o superior, commit de referencia `a11f57ba93797579a5d1855ee216a31f10242676`); otros runners GGUF no documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IsValorum/Groot-65B-A6B-261023-VAL-1.25M-I-Matrix-GGUF | 148.294.275 (safetensors reportado) | no disponible | qwen-community-1.0 | GGUF (I-Matrix) | Artefacto de calibración, 1 descarga |
| GrootTeam/Groot-65B-A6B-261023 | no disponible | no disponible | no disponible en la información | safetensors (base) | Modelo base sin cuantizar |
| mradermacher/Groot-65B-A6B-261023-GGUF | no disponible | no disponible | no disponible en la información | GGUF | Fuente de la que deriva esta calibración |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- El repositorio es un artefacto de calibración, no un modelo listo para producción; no debe tratarse como un GGUF final de inferencia sin verificar su contenido.
- La model card advierte que las comprobaciones de integridad no miden la calidad de la cuantización; no hay perplejidad ni benchmarks que respalden el resultado.
- Discrepancia entre el nombre "65B-A6B" y los 148.294.275 parámetros reportados en safetensors; conviene verificar antes de cualquier uso.
- La calibración excluye el bloque MTP y los componentes de visión del modelo base, por lo que no cubre esas rutas.
- Licencia qwen-community-1.0: es necesario revisar sus términos para uso comercial, ya que la etiqueta de Hugging Face figura como "other".
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- El proceso de ejecución terminó con un error posterior a la validación (copia duplicada de sonda de persistencia); el artefacto fue recuperado y revalidado, pero el incidente debe tenerse en cuenta en auditorías.
- Tracción mínima (1 descarga, 0 likes): no hay evidencia de uso comunitario ni validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Groot-65B-A6B-261023-VAL-1.25M-I-Matrix-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Repositorio GGUF de origen: https://huggingface.co/mradermacher/Groot-65B-A6B-261023-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Apoyo al autor: https://ko-fi.com/isvalorum
