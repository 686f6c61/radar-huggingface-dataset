# gabrielpereiramsc/scicheck-llama-3.1-8b-lora

## Resumen

SciCheck (Llama 3.1 8B) es un adaptador LoRA para `meta-llama/Meta-Llama-3.1-8B-Instruct`, publicado por Gabriel Pereira (usuario `gabrielpereiramsc`) junto con el artículo «SciCheck: Reasoning Distillation for Biomedical Claim Verification» presentado en SIGIR 2026. El modelo resuelve una tarea concreta: dada una afirmación (claim) y evidencia web recuperada, generar un razonamiento breve que termina con un veredicto etiquetado como `<answer>SUPPORTED</answer>` o `<answer>REFUTED</answer>`. Es, por tanto, un verificador de afirmaciones biomédicas de dos clases, no un modelo de propósito general.

La relevancia del adaptador reside en su enfoque de destilación de razonamiento: los datos de entrenamiento consisten en razonamientos generados por Gemini 2.5 Flash, conservados únicamente cuando el veredicto resultante era correcto. Con solo 2.828 ejemplos de entrenamiento y 319 de validación, el adaptador se entrena sobre un modelo base de 8.000 millones de parámetros con rango LoRA 64, lo que lo hace ligero (el repositorio ocupa 0,7 GB) y desplegable sobre el modelo base con vLLM.

El modelo hereda la arquitectura y la ventana de contexto de Llama 3.1 8B Instruct (hasta 32.768 tokens según la configuración de despliegue indicada por el autor) y está orientado exclusivamente al inglés. Su utilidad principal es la verificación de evidencia científica en dominios de salud, con resultados de macro F1 reportados entre 63,77 y 84,50 según el conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, alpha 128, dropout 0.1, todas las proyecciones lineales) sobre un transformer decoder-only de Llama 3.1 8B Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene aproximadamente 8.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens en la configuración de vLLM indicada por el autor (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se sirve en bfloat16 según el ejemplo del autor; el modelo base admite cuantización estándar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Meta-Llama-3.1-8B-Instruct`, un transformer decoder-only denso de aproximadamente 8.000 millones de parámetros. El ajuste fino emplea LoRA con rango 64, alpha 128, dropout 0.1 y se aplica a todas las proyecciones lineales del modelo base. El entrenamiento se realizó durante 3 épocas con learning rate 5e-5 y schedule coseno, batch size 32, sobre la plataforma de fine-tuning de Together AI.

El conjunto de datos consta de 2.828 ejemplos de entrenamiento y 319 de validación. Los razonamientos fueron generados por Gemini 2.5 Flash y se conservaron únicamente aquellos en los que el veredicto final era correcto, lo que constituye el núcleo de la técnica de destilación de razonamiento que da nombre al trabajo. El modelo produce una cadena de razonamiento corta seguida de una etiqueta de respuesta explícita (`<answer>SUPPORTED</answer>` o `<answer>REFUTED</answer>`), lo que facilita el parseo automático del veredicto en pipelines de evaluación. No se documentan en la información disponible fases de RLHF o DPO adicionales.

## Capacidades

- Verificación binaria de afirmaciones (claim verification) con evidencia recuperada: clasifica cada claim como SUPPORTED o REFUTED.
- Generación de razonamiento explícito previo al veredicto, con formato de etiqueta parseable.
- Especialización en dominio biomédico y de salud (entrenado y evaluado sobre HealthFC, SciFact, CoVERT, HealthVer y BioASQ-7b).
- Integración con pipelines de recuperación aumentada (RAG): el prompt de referencia incluye la evidencia web recuperada junto con la afirmación.
- Soporte de despliegue como módulo LoRA en vLLM con API compatible con OpenAI.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de pensamiento extendido más allá del razonamiento breve destilado.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Verificación de noticias de salud: dado un titular y los fragmentos de fuentes recuperadas por un buscador, el modelo emite un veredicto SUPPORTED/REFUTED con una justificación breve que puede mostrarse al editor o al lector.
- Moderación de contenido sanitario: integrado tras un recuperador documental, permite marcar afirmaciones potencialmente falsas en foros o redes antes de su publicación, con trazabilidad del razonamiento generado.
- Asistencia a revisión sistemática: como primer filtro para clasificar afirmaciones extraídas de literatura biomédica frente a la evidencia recuperada, reduciendo el volumen que llega a revisión humana.
- Enriquecimiento de motores de búsqueda académica: etiquetar resultados de búsqueda con un veredicto de respaldo/refutación respecto a una consulta formulada como claim.
- Evaluación de respuestas de otros LLM en dominio sanitario: usar el adaptador como juez binario de afirmaciones generadas por un modelo mayor, aprovechando su formato de salida parseable.
- Pipeline de fact-checking automatizado: desplegado con vLLM y el prompt `binary_claim_with_evidence_expert_cot.txt`, encaja en un servicio HTTP compatible con OpenAI que recibe claim y evidencia y devuelve el veredicto en una sola llamada.
- Investigación en destilación de razonamiento: el repositorio de código incluye prompts, datos de evaluación y comandos para reproducir cada tabla del artículo, lo que lo convierte en una referencia para experimentos de destilación sobre modelos de 8B.

## Benchmarks y rendimiento

Resultados de macro F1 reportados por el autor en el artículo (SIGIR 2026):

| Conjunto | Macro F1 |
|---|---|
| HealthFC | 77,72 |
| SciFact | 84,12 |
| CoVERT | 63,88 |
| HealthVer | 63,77 |
| HealthFC (Test) | 76,63 |
| BioASQ-7b (Test) | 84,50 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Llama 3.1 8B, los requisitos son los del modelo base. En bfloat16 se estiman aproximadamente 16 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits, alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contexto largo (hasta 32.768 tokens); RTX 4090 (24 GB) viable en bfloat16 para cargas ligeras; RTX 3090/4080 y similares con cuantización.
- Cabe en GPU de consumo: sí, con cuantización en GPUs de 8-12 GB o en bfloat16 en GPUs de 24 GB.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 64` (procedimiento documentado por el autor); el adaptador PEFT también puede cargarse con la librería `peft`/`transformers`; no se documenta soporte específico para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SciCheck (Llama 3.1 8B LoRA) | ~8B (base) + adaptador LoRA | Hasta 32.768 tokens | Verificación de claims biomédicos con razonamiento destilado | Llama 3.1 Community License | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Llama 3.1 8B Instruct (base) | ~8B | Hasta 128.000 tokens | Modelo generalista de instrucciones | Llama 3.1 Community License | Hugging Face |
| Verificadores especializados tipo FactCC / MiniCheck | No disponible | No disponible | Verificación de fidelidad factual | Varía según modelo | Hugging Face / repositorios académicos |

No se dispone de datos de benchmark comparativos directos entre SciCheck y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dos clases (SUPPORTED/REFUTED): no contempla la categoría «evidencia insuficiente» ni matices de veracidad parcial.
- Entrenado con solo 2.828 ejemplos, lo que limita la cobertura de dominios y estilos de claim fuera del ámbito biomédico.
- Depende críticamente de la calidad de la evidencia recuperada: si el recuperador aporta fragmentos irrelevantes o incompletos, el veredicto puede ser erróneo.
- Riesgo de alucinación en el razonamiento generado, incluso cuando el veredicto final sea correcto; el texto intermedio no debe tratarse como fuente primaria.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Licencia Llama 3.1 Community License: impone restricciones de uso (incluida la cláusula de usuarios mensuales superiores a 700 millones y las políticas de uso aceptable de Meta); revisar antes de uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere escasa validación externa por parte de la comunidad.
- No se documentan evaluaciones de sesgo, robustez frente a adversarios ni calibración de confianza.

## Enlaces

- Hugging Face: https://huggingface.co/gabrielpereiramsc/scicheck-llama-3.1-8b-lora
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Código, prompts y datos de evaluación: https://github.com/gabrieldapaz/scicheck
- Artículo (DOI): https://doi.org/10.1145/3805712.3809699
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
