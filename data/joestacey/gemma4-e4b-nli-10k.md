# joestacey/gemma4-e4b-nli-10k

## Resumen

Gemma 4 E4B NLI 10k es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base google/gemma-4-E4B-it, desarrollado por el usuario joestacey. Su propósito es especializar el modelo base en inferencia de lenguaje natural (NLI) de tres clases: implicación (entailment), neutral y contradicción. El adaptador se ha entrenado con 10.000 ejemplos, 2.000 muestreados de cada uno de cinco datasets de referencia del área (SNLI, MultiNLI, ANLI, NLI-FEVER y VitaminC), con semilla 0.

El modelo no es un modelo generativo de propósito general, sino un componente de evaluación: se utiliza para puntuar la corrección de respuestas generadas por otros modelos, normalizando los logits de los primeros tokens de las tres etiquetas para devolver probabilidades en el orden entailment, neutral, contradiction. Esta función de scoring se integra en el repositorio understanding-probe-robustness del mismo autor, lo que lo convierte en una pieza de infraestructura para experimentos de robustez de sondas de corrección.

Al estar construido sobre Gemma 4 E4B, hereda la arquitectura y la ventana de contexto del modelo base, pero la información pública disponible sobre este adaptador es limitada: no se han publicado resultados de evaluación finales, no se declaran idiomas soportados y el repositorio tiene 0 descargas en el momento de la consulta. Es relevante ahora como ejemplo de adaptación ligera y reproducible para tareas de verificación factual y evaluación automática, aunque su madurez para producción es todavía incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only (base: google/gemma-4-E4B-it) |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base no se distribuye en este repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 4 E4B; no se especifica en la model card) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y computo en bfloat16; el adaptador se distribuye en safetensors (no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + tokenizer incluido |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones de atención de texto y de MLP del modelo base Gemma 4 E4B-it. La configuración LoRA es rango 16, alpha 32 y dropout 0.05. El entrenamiento emplea QLoRA con cuantizacion de 4 bits en formato NF4, doble cuantizacion y computo en bfloat16. Se realiza una sola época con batch size 8, optimizador AdamW con learning rate 0.0001 y warmup lineal sobre el 5% de los pasos. La premisa se trunca a 256 tokens y la función de pérdida se aplica únicamente a los tokens de respuesta.

Los datos de entrenamiento son 10.000 ejemplos, 2.000 de cada uno de los datasets stanfordnlp/snli, nyu-mll/multi_nli, facebook/anli, pietrolesci/nli_fever y tals/vitaminc, muestreados con semilla 0. En el caso de FEVER, la evidencia se usa como premisa y la afirmación como hipótesis. Las etiquetas son entailment, neutral y contradiction. La model card indica que existen dos adaptadores entrenados con la misma receta y los mismos ejemplos, cada uno con su propio tokenizer y chat template, aunque no se detalla cuál es el segundo.

La innovación técnica principal no está en la arquitectura sino en la implementación del scoring: se normalizan los logits de los primeros tokens distintos de las tres palabras de etiqueta y se devuelven probabilidades en el orden entailment, neutral, contradiction. El autor advierte explícitamente que estas probabilidades no son verosimilitudes de secuencia de palabra completa. La agregación de la puntuación NLI sigue el esquema de frases y referencias de AlignScore.

## Capacidades

- Clasificación NLI de tres clases (entailment, neutral, contradiction) sobre pares premisa-hipótesis.
- Puntuación de corrección de respuestas generadas por otros modelos, integrada en el repositorio understanding-probe-robustness.
- Generación de texto conversacional heredada del modelo base (pipeline text-generation), aunque el adaptador está especializado en NLI.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles para el adaptador; dependen del modelo base Gemma 4 E4B, no documentadas aquí.

## Casos de uso

- Evaluación automática de respuestas generadas: el adaptador puntúa si una respuesta candidata se sigue lógicamente de una referencia o contexto, devolviendo probabilidades de entailment, neutral y contradiction. Es su uso principal documentado, mediante `run_scores.py` del repositorio del autor.
- Verificación factual en pipelines de RAG: dado un contexto recuperado (premisa) y una afirmación generada (hipótesis), el modelo estima la probabilidad de implicación para filtrar alucinaciones antes de mostrar la respuesta al usuario.
- Detección de contradicciones en documentación técnica: comparar pares de fragmentos de manuales o especificaciones para señalar inconsistencias entre versiones.
- Control de calidad en datasets de anotación: usar el adaptador como pre-anotador de NLI para triar ejemplos antes de la revisión humana, reduciendo el coste de etiquetado.
- Investigación en robustez de sondas: el modelo forma parte de experimentos que evalúan la fiabilidad de clasificadores de corrección bajo distribuciones cambiantes (in-distribution frente a out-of-distribution).
- Filtrado de resúmenes y traducciones: comprobar si un resumen (hipótesis) está implicado por el documento fuente (premisa) para descartar resúmenes infieles.
- Auditoría de sesgos en generación: medir la tasa de contradicción entre la salida del modelo y hechos de referencia en conjuntos de prueba controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación del adaptador en datasets NLI reservados está en curso y que no se reclaman resultados finales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Gemma 4 E4B y de su cuantizacion. El repositorio del adaptador ocupa 0,2 GB, pero los pesos base se cargan por separado.
- GPU recomendadas: no disponibles en la información proporcionada; vendrán determinadas por el modelo base (gama A100/H100 para bfloat16 completo, GPUs consumer para cuantizaciones de 4 bits).
- Cabe en GPU consumer: no confirmado para el modelo base; el adaptador LoRA en sí es ligero (0,2 GB) y puede cargarse junto al base cuantizado.
- Opciones de despliegue: la librería declarada es PEFT; el scoring se ejecuta mediante `run_scores.py` del repositorio understanding-probe-robustness. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joestacey/gemma4-e4b-nli-10k | Adaptador LoRA NLI sobre Gemma 4 E4B | no disponible (adaptador rango 16) | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| Adaptadores NLI sobre DeBERTa-v3 (p. ej. MoritzLaurer) | Modelo encoder completo para NLI | ~0,1-0,4 B | 512 tokens típicamente | MIT / Apache-2.0 según variante | Amplia adopción en HuggingFace |
| AlignScore | Modelo de evaluación de fidelidad | no disponible | no disponible | MIT | Repositorio público y pesos en HuggingFace |

La comparación con alternativas consolidadas de NLI y evaluación de fidelidad es limitada porque no se han publicado métricas de rendimiento para este adaptador. Los modelos encoder dedicados a NLI suelen tener ventajas de latencia y coste, mientras que este adaptador aprovecha un modelo generativo de mayor tamaño, lo que puede traducirse en mejor manejo de contextos largos pero también en mayor coste de inferencia.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: la model card afirma que la evaluación en datasets reservados está en curso y no se reclaman resultados finales.
- Las probabilidades devueltas no son verosimilitudes de secuencia completa, sino normalizaciones de los logits del primer token de cada etiqueta; pueden no ser calibradas para umbrales estrictos.
- El adaptador está entrenado con solo 10.000 ejemplos (2.000 por dataset), lo que limita la cobertura de dominios y estilos alejados de SNLI, MultiNLI, ANLI, FEVER y VitaminC.
- La premisa se trunca a 256 tokens durante el entrenamiento; pares más largos pueden degradar el rendimiento.
- No se declaran idiomas soportados; se desconoce el comportamiento fuera del inglés, idioma dominante en los datasets de entrenamiento.
- Riesgo de sesgos heredados de los datasets de origen (SNLI y MultiNLI contienen sesgos de anotación y artefactos léxicos conocidos) y del modelo base Gemma.
- Riesgo de alucinación inherente al modelo base en tareas generativas; el adaptador no elimina esta propiedad, solo añade una cabeza de clasificación NLI.
- Licencia apache-2.0 para el adaptador, pero el uso del modelo base Gemma 4 E4B está sujeto a los términos de licencia de Google, que deben verificarse por separado para uso comercial.
- Repositorio con 0 descargas y creado en noviembre de 2026: madurez y mantenimiento no verificables.
- El adaptador requiere cargar los pesos base en la revisión fijada en `adapter_config.json`; desalineaciones de revisión pueden romper la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/joestacey/gemma4-e4b-nli-10k
- Repositorio de código y scoring: https://github.com/joestacey/understanding-probe-robustness
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset ANLI: https://huggingface.co/datasets/facebook/anli
- Dataset NLI-FEVER: https://huggingface.co/datasets/pietrolesci/nli_fever
- Dataset VitaminC: https://huggingface.co/datasets/tals/vitaminc
