# promotion/Qwen3-8B-UniformINPO-baseline

## Resumen

Qwen3-8B-UniformINPO-baseline es un modelo de lenguaje alineado mediante optimización de preferencias multi-objetivo, desarrollado por la organización "promotion" como parte de una serie de experimentos sobre métodos de alineación. Se trata de un fine-tuning del modelo base Qwen/Qwen3-8B, que actúa simultáneamente como política de referencia e inicialización. El nombre "UniformINPO" indica que se aplica optimización iterativa de política Nash (INPO) contra una única preferencia formada por la agregación uniforme de cuatro objetivos: utilidad (helpfulness), veracidad (truthfulness), honestidad (honesty) y seguimiento de instrucciones (instruction following).

El modelo es relevante en el contexto de la investigación sobre alineación multi-objetivo, ya que sirve como línea base para comparar con métodos de negociación como NBPO (Nash Bargaining Policy Optimization). Según los datos publicados, este baseline obtiene un excedente negativo en todos los objetivos evaluados, lo que indica que no mejora respecto a la política de referencia, a diferencia del método de negociación que sí logra mejoras sustanciales. Está pensado para investigadores que estudian cómo agregar preferencias en el entrenamiento de LLMs.

Arquitectónicamente, es un transformer denso de aproximadamente 8,19 mil millones de parámetros, heredado de Qwen3-8B. No se especifica la longitud de contexto ni los idiomas soportados en la model card, aunque el modelo base Qwen3-8B soporta 119 idiomas y una ventana de contexto de hasta 128K tokens según su documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda del base, sin especificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el base Qwen3-8B soporta 119 idiomas) |
| Licencia | apache-2.0 (tag) / Qwen3 licence (segun model card) |
| Formato de pesos | safetensors (precision no especificada) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen3-8B, que es un transformer denso con 8 mil millones de parametros. El entrenamiento consiste en una optimizacion iterativa de politica Nash (INPO) donde la politica de referencia es el propio Qwen3-8B y la politica inicial tambien. El proceso agrega cuatro objetivos de preferencia (utilidad, veracidad, honestidad y seguimiento de instrucciones) con pesos uniformes, formando una unica preferencia compuesta.

Un detalle tecnico importante es que el pipeline de entrenamiento requiere que el prompt de generacion sea un prefijo estricto de la conversacion renderizada, y que la plantilla de chat emita un bloque vacio ` thinking response` de forma incondicional. El modelo se entrena bajo esta plantilla, por lo que es imprescindible usar el tokenizer incluido en el repositorio en lugar del tokenizer estandar de Qwen3-8B. Sin este ajuste, el modelo razona en voz alta y la mayoria de las generaciones quedan incompletas, corrompiendo la senal de preferencia.

No se proporcionan datos sobre el volumen de tokens de entrenamiento ni la composicion del dataset. Por la descripcion y la comparacion con otros modelos de la misma serie (p. ej., Llama-3.1-8B-UniformINPO-baseline), se infiere que se utilizan prompts de UltraFeedback, pero este dato no se confirma en la model card.

## Capacidades

- Generacion de texto y chat instructivo, heredadas del modelo base Qwen3-8B.
- Razonamiento multi-paso gracias a la arquitectura base (aunque el entrenamiento con plantilla vacia de thinking desactiva el modo de razonamiento explicito).
- Seguimiento de instrucciones, utilidad, veracidad y honestidad como objetivos de alineacion, aunque con rendimiento inferior al reference segun los benchmarks publicados.
- Soporte multilingue potencial (el base soporta 119 idiomas), pero no verificado para este modelo especifico.
- No se documenta soporte explicito de tool calling, function calling, agentes o vision. Estas capacidades, si existen, se heredarian del base sin garantia.
- El modelo esta disenado para experimentos de alineacion, no como producto final de chat.

## Casos de uso

- Investigacion en alineacion multi-objetivo: permite estudiar como la agregacion uniforme de preferencias afecta al equilibrio de Nash en comparacion con otros metodos como NBPO.
- Evaluacion de metodos de optimizacion de preferencias: sirve como baseline en paneles de evaluacion para medir el excedente sobre una politica de referencia.
- Desarrollo de sistemas de chat con control de objetivos: puede utilizarse para probar si una agregacion igualitaria de objetivos produce comportamientos deseables en entornos controlados.
- Comparacion de metricas de alineacion: util para validar metricas de utilidad, veracidad y honestidad en modelos de 8B.
- Experimentos de template y tokenizacion: el requisito de plantilla especifica lo convierte en un caso de estudio sobre como la estructura del prompt afecta al entrenamiento.
- Formacion y docencia en IA: adecuado para ilustrar conceptos de INPO, optimizacion de Nash y agregacion de preferencias en cursos avanzados.

## Benchmarks y rendimiento

La model card publica una tabla de excedente (surplus) sobre la politica de referencia, evaluada a escala de poblacion con 100 prompts y un oraculo Qwen3-32B con prompts, promediado por intercambio de orden:

| Objetivo | Excedente |
|---|---|
| Utilidad (helpfulness) | -0.0048 |
| Veracidad (truthfulness) | -0.0011 |
| Honestidad (honesty) | -0.0009 |
| Seguimiento de instrucciones | -0.0029 |
| **Minimo** | **-0.0048** |
| **Promedio** | **-0.0024** |

Para comparacion, el metodo de negociacion NBPO (promotion/Qwen3-8B-NBPO) alcanza un minimo de +0.0180 y un promedio de +0.0408 en el mismo panel. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB (8B parametros × 2 bytes).
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB), o cualquier GPU con al menos 16 GB de VRAM.
- En consumer GPU como RTX 3090/4090 cabe sin cuantizacion; con cuantizacion GGUF de 4 bits podria ejecutarse en GPUs de 8 GB (p. ej., RTX 3060).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con accelerate. No se mencionan restricciones especificas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia, un modelo de 8B en una A100 suele generar entre 50 y 100 tokens/s con vLLM, pero esto no esta confirmado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Metodo de alineacion | Minimo surplus | Promedio surplus | Licencia |
|---|---|---|---|---|---|
| Qwen3-8B-UniformINPO-baseline | 8.19B | INPO con pesos uniformes | -0.0048 | -0.0024 | apache-2.0 / Qwen3 licence |
| Qwen3-8B-NBPO | 8.19B | NBPO (negociacion Nash) | +0.0180 | +0.0408 | Qwen3 licence |
| Qwen3-8B (base) | 8.19B | Sin alineacion adicional | 0 (referencia) | 0 | Qwen3 licence |

Tambien existe el modelo equivalente sobre Llama-3.1-8B (promotion/Llama-3.1-8B-UniformINPO-baseline), que sigue el mismo esquema de entrenamiento y objetivos, lo que permite comparar el comportamiento entre arquitecturas.

## Limitaciones y advertencias

- Excedente negativo en todos los objetivos: el modelo empeora ligeramente respecto a la politica de referencia en utilidad, veracidad, honestidad y seguimiento de instrucciones. No es adecuado para uso directo en produccion sin evaluacion adicional.
- Requisito de tokenizer especifico: usar el tokenizer estandar de Qwen3-8B provoca generaciones incompletas y razonamiento en voz alta. El tokenizer del repositorio es obligatorio.
- Plantilla de chat no estandar: el modelo espera un bloque vacio ` thinking response` incondicional, lo que puede chocar con pipelines que usan la plantilla oficial de Qwen3.
- Licencia ambigua: el tag indica apache-2.0, pero la model card afirma "Released under the Qwen3 licence", que es mas restrictiva (prohibe uso comercial en ciertos casos). Se recomienda verificar la licencia aplicable antes de cualquier uso.
- Sin datos de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K, etc. El unico benchmark publicado es el panel de excedente con un oraculo especifico.
- Riesgo de alucinacion y sesgos heredados del base Qwen3-8B, no mitigados por este entrenamiento.
- Tamano del repositorio (32.8 GB) sugiere pesos en FP16/BF16 sin cuantizacion, lo que requiere hardware con suficiente VRAM.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/promotion/Qwen3-8B-UniformINPO-baseline
- Modelo NBPO comparado: https://huggingface.co/promotion/Qwen3-8B-NBPO
- Generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo equivalente sobre Llama-3.1-8B: https://huggingface.co/promotion/Llama-3.1-8B-UniformINPO-baseline
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
