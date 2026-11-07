# schonsense/Caboose-SFT-Ripple-65B-test_in_progress_T2

## Resumen

Caboose-SFT-Ripple-65B-test_in_progress_T2 es un fine-tuning supervisado (SFT) del modelo denso Ripple-65B-Preview, desarrollado por Ricursive Intelligence, publicado por el usuario schonsense en Hugging Face. Se trata de un artefacto experimental: el propio identificador indica que el ajuste está "in progress" y que es la variante T2, con cero descargas y cero likes en el momento de la consulta, lo que sugiere un trabajo en curso sin validación pública.

El modelo base, Ripple-65B-Preview, es un Transformer denso de 65 000 millones de parámetros preentrenado con 12 billones de tokens y una ventana de contexto de hasta 1 millón de tokens. Ricursive Intelligence lo presenta como la variante de propósito general del modelo propietario que alimenta su plataforma de diseño de chips, con resultados destacados en codificación agéntica (80,52 en TerminalBench 2.1).

La relevancia de esta ficha es doble: por un lado, documenta un caso de fine-tuning comunitario sobre un modelo frontera de pesos abiertos; por otro, advierte de que el artefacto carece de documentación técnica publicada, está sujeto a acceso restringido (gated) y no debe considerarse listo para producción. La licencia declarada es Apache 2.0, aunque conviene verificar las condiciones del modelo base antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Ripple-65B-Preview) |
| Parametros totales | 65 000 millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 1 000 000 de tokens (modelo base) |
| Tipos de cuantizacion | no disponible para este fine-tuning; el modelo base dispone de una variante NVFP4 publicada por Ricursive |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada en la model card) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Transformer denso de 65 000 millones de parámetros, según la documentación de Ricursive Intelligence para Ripple-65B-Preview. El preentrenamiento del modelo base se realizó sobre 12 billones de tokens, con soporte para contextos de hasta 1 millón de tokens. Ricursive afirma haber optimizado la arquitectura para sus plataformas de entrenamiento y servicio, con ganancias de eficiencia sustanciales, aunque no se detallan las modificaciones concretas.

Sobre el proceso de fine-tuning de esta variante T2 no hay información publicada: se desconoce el dataset de SFT, el número de tokens de ajuste, si hubo etapas de RLHF o DPO, y la composición de los datos. El nombre del repositorio indica una fase de pruebas en curso, por lo que los pesos podrían ser intermedios o no representativos de un modelo final. Tampoco se documenta si se aplicaron técnicas de decodificación especulativa, atención lineal o híbrida en el ajuste.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Ripple-65B-Preview.
- Codificación agéntica: el modelo base obtiene 80,52 en TerminalBench 2.1, lo que sugiere competencia en tareas de terminal y edición de código multi-paso.
- Manejo de contextos muy largos (hasta 1M de tokens en el modelo base), adecuado para análisis de repositorios completos o documentos extensos.
- Capacidades multilingües: no documentadas para este fine-tuning.
- Soporte de tool calling y function calling: no documentado explícitamente para esta variante.
- Modo de razonamiento extendido (thinking mode), visión o audio: no disponible.
- Al ser un SFT experimental, las capacidades reales pueden diferir de las del modelo base y no han sido evaluadas públicamente.

## Casos de uso

- Evaluación de fine-tunings comunitarios: investigadores pueden comparar esta variante T2 con el Ripple-65B-Preview original para medir el efecto del SFT en tareas de código y razonamiento, usando el mismo harness de evaluación que Ricursive emplea en TerminalBench.
- Prototipado de asistentes de terminal: gracias a la herencia del modelo base en codificación agéntica, puede probarse en entornos sandbox para automatizar tareas de shell, siempre con supervisión humana y sin exponer credenciales.
- Análisis de documentación extensa: con la ventana de hasta 1M tokens del modelo base, es posible procesar manuales técnicos o bases de código completas en una sola pasada, útil para auditorías internas.
- Generación de código en pipelines de CI/CD: integrable mediante servidores de inferencia compatibles con la API de OpenAI (vLLM, TGI) para tareas de revisión automática, aunque su estado experimental desaconseja usarlo en producción sin validación previa.
- Investigación sobre alineación y sesgos: al ser un SFT sobre un modelo frontera de pesos abiertos, sirve como caso de estudio para analizar cómo los datos de ajuste modifican el comportamiento del modelo base.
- Experimentación con cuantización: al existir una variante NVFP4 del modelo base, se puede estudiar la transferencia de técnicas de cuantización a pesos ajustados, comparando degradación de calidad en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este fine-tuning. El único dato verificable corresponde al modelo base: 80,52 en TerminalBench 2.1, según la model card de Ripple-65B-Preview.

| Benchmark | Caboose-SFT-Ripple-65B-T2 | Ripple-65B-Preview (base) |
|---|---|---|
| TerminalBench 2.1 | no disponible | 80,52 |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 130 GB solo para pesos, más overhead de activaciones y caché KV; se requiere un nodo multi-GPU (por ejemplo, 2×H100 80 GB o 4×A100 80 GB).
- En cuantización de 8 bits: en torno a 65-70 GB de pesos, viable en una H100 80 GB o en 2×A100 40 GB.
- En cuantización de 4 bits: aproximadamente 35-40 GB, lo que permite ejecución en una única A100 40 GB o en una RTX 6000 Ada 48 GB; no cabe en GPUs de consumo de 24 GB sin offloading a CPU.
- GPU recomendadas: H100 SXM, A100 80 GB, L40S 48 GB para cuantizaciones bajas; RTX 4090 24 GB solo con offloading parcial y latencia elevada.
- Opciones de despliegue: vLLM y TGI para serving en BF16/FP8; llama.cpp u Ollama para cuantizaciones GGUF si se generan a partir de los pesos; el modelo base cuenta con una variante NVFP4 publicada por Ricursive, útil como referencia de despliegue eficiente.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto, que con 1M de tokens puede dominar el coste de memoria por la caché KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Caboose-SFT-Ripple-65B-T2 | 65B (denso) | hasta 1M (heredado) | Apache 2.0 (declarada) | Experimental, gated, sin benchmarks |
| Ripple-65B-Preview | 65B (denso) | hasta 1M | no disponible en la información | Modelo base oficial de Ricursive |
| Ripple-65B-Preview-NVFP4 | 65B (denso) | hasta 1M | no disponible en la información | Variante cuantizada oficial de Ricursive |
| Alternativas de 65-70B de pesos abiertos (p. ej. familia Llama) | ~65-70B | 8K-128K típicamente | licencias comunitarias | Modelos estables con benchmarks públicos |

No se dispone de datos de rendimiento comparables para esta variante T2, por lo que la comparativa se limita a parámetros, contexto, licencia y estado de publicación.

## Limitaciones y advertencias

- Artefacto experimental: el nombre indica "test_in_progress", por lo que los pesos pueden ser intermedios, inestables o no reproducibles.
- Sin documentación de entrenamiento: se desconocen dataset, hiperparámetros y metodología del SFT, lo que impide auditar su comportamiento.
- Sin benchmarks publicados: no hay evidencia de que el ajuste mejore o degrade las capacidades del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la distribución.
- Riesgo de alucinación inherente a los modelos de 65B, agravado por la falta de evaluación del fine-tuning.
- Sesgos desconocidos: al no documentarse la composición del dataset de SFT, no se pueden anticipar sesgos de género, idioma o dominio.
- Idiomas no declarados: no hay garantía de calidad fuera de los idiomas presentes en los datos de ajuste.
- Licencia: aunque se declara Apache 2.0, conviene verificar las condiciones del modelo base Ripple-65B-Preview antes de un uso comercial, ya que la información disponible no detalla su licencia.
- No apto para producción sin una evaluación propia exhaustiva en el dominio objetivo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-test_in_progress_T2
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Variante cuantizada NVFP4 del modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Página oficial de Ripple-65B Preview: https://www.ricursive.com/ripple
