# Kyomin/unlearning_target

## Resumen

Kyomin/unlearning_target es un ajuste fino de LLaVA-1.5-7B sobre los datos de perfil de MLLMU-Bench, publicado como modelo objetivo (target) para experimentos de machine unlearning multimodal. El problema que aborda es metodológico: para medir si un método de olvido funciona, hace falta un modelo que haya memorizado antes un conjunto concreto de datos, de modo que se pueda cuantificar cuánto olvida y cuánto retiene. Este checkpoint cumple esa función sobre 500 perfiles ficticios y 8.204 pares de pregunta-respuesta del benchmark.

El autor indica que no es una copia del checkpoint de referencia de los autores del benchmark, sino un reentrenamiento independiente, porque la receta original supervisaba los tokens equivocados. Las dos correcciones aplicadas son el enmascaramiento del prompt (la pérdida se calcula solo sobre los tokens de respuesta, no sobre los 576 tokens de imagen expandidos ni sobre el andamiaje `USER: ... ASSISTANT:`) y la supervisión del token EOS, que la receta original no entrenaba.

Arquitectónicamente es un transformer multimodal decoder-only de 7.062.919.168 parámetros, con torre visual y proyector sobre un LLM tipo Vicuna-7B v1.5. Su relevancia es acotada pero clara: es infraestructura de evaluación para investigación en privacidad y olvido en modelos multimodales, no un modelo de propósito general. Está publicado en fp16, solo en inglés y bajo la licencia Llama 2 Community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal decoder-only (familia LLaVA-1.5: torre visual + proyector + LLM) |
| Parametros totales | 7.062.919.168 (aproximadamente 7,06 mil millones) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_length 384) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 2 Community License Agreement |
| Formato de pesos | safetensors (fp16) |

Datos adicionales: pipeline `image-text-to-text`, libreria `transformers`, modelo base `llava-hf/llava-1.5-7b-hf`, tamano del repositorio 14,1 GB, vocabulario del tokenizer de 32.002 entradas (32.000 base + `<image>` en 32.000 + `<pad>` en 32.001).

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-1.5-7b-hf`, un transformer multimodal que combina un codificador visual con un LLM decoder-only y un proyector que alinea ambos espacios. El ajuste se hizo con LoRA de r=32 y alpha=32, entrenando tambien la torre visual, y los adaptadores se fusionaron en los pesos base. El resultado se publica en fp16 con el tokenizer y el processor incluidos, heredados de LLaVA-1.5-7B.

Los datos de entrenamiento son `ft_Data` de MLLMU-Bench: 500 perfiles ficticios y 8.204 pares de QA. La receta fue de 4 epocas, learning rate 2e-5, batch size 4 sin acumulacion de gradientes y max_length 384, con una perdida final de entrenamiento de 0,328. Las dos innovaciones relevantes respecto a la receta de referencia son de tipo supervisión, no arquitectonicas: el enmascaramiento del prompt (de 610 tokens supervisados por ejemplo, 595 quedaban fuera de la respuesta en la receta original) y la incorporacion de un token EOS al final de cada respuesta para que el modelo aprenda a detenerse. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto e image-text-to-text: acepta imagenes y texto y produce respuestas conversacionales, siguiendo el pipeline multimodal de LLaVA-1.5.
- Memorizacion inducida de perfiles sinteticos: es su caracteristica funcional principal; ha sido ajustado para retener los perfiles ficticios de MLLMU-Bench y responde sobre ellos con alta fidelidad.
- Conversacion multi-turno basica: hereda el formato conversacional de Vicuna-1.5 con el andamiaje `USER: ... ASSISTANT:`.
- Generacion con parada correcta: a diferencia de la receta original, aprende a emitir EOS, por lo que las respuestas terminan de forma controlada.
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso explicito: no disponible.
- Modo thinking, audio o video: no disponible; la modalidad cubierta es imagen + texto.

## Casos de uso

- Investigacion en machine unlearning multimodal: el modelo actua como punto de partida sobre el que aplicar un metodo de olvido (por ejemplo, supresion de un subconjunto de perfiles) y medir despues la degradacion en el conjunto forget y la retencion en el conjunto test.
- Evaluacion de privacidad en MLLMs: permite estudiar cuanto conocimiento identificable retiene un modelo ajustado sobre datos personales sinteticos y como de eficaz es un mecanismo de borrado.
- Baseline de comparacion para metodos de unlearning: sus valores de ROUGE-1 y BLEU en los splits forget y test sirven como referencia frente a checkpoints de referencia y frente a variantes olvidadas.
- Reproduccion de resultados de MLLMU-Bench: al incluir processor y tokenizer y documentar la receta exacta (LoRA, epocas, learning rate, max_length), facilita replicar la evaluacion de generacion con forget ratio 5 y seed 42.
- Estudio del efecto de decisiones de supervision: la comparacion con la receta original aislada permite analizar cuanto afectan el prompt masking y la supervision de EOS al grado de memorizacion medido.
- Analisis de olvido y retencion por subgrupos de atributos: los 500 perfiles con 8.204 pares de QA permiten definir subconjuntos de olvido (por atributo, por identidad) y estudiar si el metodo de unlearning olvida de forma selectiva o indiscriminada.
- Docencia y experimentacion en privacidad de modelos: sirve como banco de pruebas controlado, ya que los sujetos son ficticios y no hay riesgo de exponer datos de personas reales.

## Benchmarks y rendimiento

Evaluacion de generacion de MLLMU-Bench, forget ratio 5, seed 42, metrica Image_Textual. Un valor mas alto en el conjunto forget indica mayor memorizacion, que es lo deseable en un modelo objetivo de unlearning.

| Split | Metrica | Este modelo | Checkpoint de los autores del benchmark |
|---|---|---|---|
| Forget | ROUGE-1 Recall | 0,5913 | 0,5663 |
| Forget | BLEU | 0,2697 | 0,2422 |
| Test | ROUGE-1 Recall | 0,3141 | 0,2676 |
| Test | BLEU | 0,0954 | 0,0693 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: alrededor de 14-16 GB solo para pesos (el repositorio ocupa 14,1 GB), mas el overhead de activaciones y cache KV. Con margen practico, 18-20 GB para lotes pequenos.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. En consumer, una RTX 4090 de 24 GB es suficiente para inferencia en fp16 con lotes pequenos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) en fp16 con lotes reducidos. En tarjetas de 12-16 GB requeriria cuantizacion, que no se distribuye oficialmente y habria que generar.
- Opciones de despliegue: Transformers con `LlavaForConditionalGeneration` y `AutoProcessor` (ruta documentada por el autor), vLLM y TGI para servir LLaVA-1.5, y conversion propia a GGUF si se quiere usar llama.cpp u Ollama, ya que no hay artefactos GGUF publicados.
- Latencia y throughput estimados: no disponible.
- Nota de integracion: el tokenizer incluido mantiene `padding_side="left"` por defecto, adecuado para generacion por lotes; para reentrenamiento hay que ponerlo en `"right"`, como hace el codigo de MLLMU-Bench.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kyomin/unlearning_target | 7,06 mil millones | no disponible (entreno con max_length 384) | Forget ROUGE-1 0,5913; BLEU 0,2697 | Llama 2 Community | HuggingFace, safetensors fp16 |
| llava-hf/llava-1.5-7b-hf | 7 mil millones (aprox.) | no disponible en la informacion proporcionada | no disponible | Llama 2 Community | HuggingFace |
| Checkpoint de los autores de MLLMU-Bench | no disponible | no disponible | Forget ROUGE-1 0,5663; BLEU 0,2422 | no disponible | no disponible como enlace en la informacion proporcionada |

Comparado con su modelo base, la diferencia no esta en parametros ni en contexto, sino en el ajuste sobre `ft_Data`, que eleva la memorizacion de los perfiles sinteticos (objetivo del checkpoint) y modifica el comportamiento de parada. Frente al checkpoint de referencia del benchmark, este modelo obtiene valores mas altos tanto en forget como en test, lo que mejora su utilidad como objetivo de unlearning pero tambien indica mayor retencion general, un factor a tener en cuenta al interpretar las metricas de retencion.

## Limitaciones y advertencias

- Los datos de entrenamiento son perfiles sinteticos de personas ficticias creados para MLLMU-Bench; el modelo no es una fuente de informacion sobre personas reales y nada de lo que genere sobre una persona con nombre debe tratarse como factual.
- Riesgo de alucinacion: al ser un modelo ajustado para memorizar perfiles, puede generar atributos plausibles pero inventados sobre identidades, y hereda las alucinaciones propias de LLaVA-1.5, Vicuna-1.5 y Llama 2.
- Sesgos: hereda los sesgos de sus antecesores (LLaVA-1.5, Vicuna-1.5, Llama 2 7B), no corregidos en este ajuste.
- Idioma: solo ingles declarado; no hay soporte multilingue verificado.
- Contexto: no se documenta la ventana de contexto efectiva del checkpoint; el entrenamiento uso max_length 384, por lo que el comportamiento mas alla de esa longitud no esta validado.
- Licencia: Llama 2 Community License Agreement, con la clausula de 700 millones de usuarios activos mensuales y la restriccion de no usar los materiales para mejorar otros modelos de lenguaje grandes; aplica tambien la Acceptable Use Policy de Meta.
- Uso previsto: investigacion en unlearning multimodal y evaluacion de privacidad. Siguiendo la intencion de sus antecesores, el autor lo situa como checkpoint de uso de investigacion.
- Licencia de los datos: MLLMU-Bench no declara licencia propia; el autor pide citar el paper en cualquier uso.
- Caveat de integracion: el `padding_side="left"` por defecto del tokenizer incluido es correcto para generacion por lotes pero debe cambiarse a `"right"` antes de reentrenar, o los resultados divergiran de los de MLLMU-Bench.
- Sin cuantizaciones oficiales ni artefactos GGUF: desplegarlo en hardware limitado exige conversion propia, con la perdida de fidelidad que ello implica en un modelo cuyo proposito es medir memorizacion con precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kyomin/unlearning_target
- Modelo base: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Repositorio de MLLMU-Bench: https://github.com/franciscoliu/MLLMU-Bench
- Paper de MLLMU-Bench: Liu, Zheyuan; Dou, Guangyao; Jia, Mengzhao; Tan, Zhaoxuan; Zeng, Qingkai; Yuan, Yongle; Jiang, Meng. "Protecting Privacy in Multimodal Large Language Models with MLLMU-Bench", NAACL, 2025.
- Acceptable Use Policy de Meta Llama: https://ai.meta.com/llama/use-policy/
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
