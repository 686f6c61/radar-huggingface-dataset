# ermiaazarkhalili/VibeThinker-3B-Function-Calling-xLAM-Unsloth-GGUF

## Resumen

VibeThinker-3B-Function-Calling-xLAM-Unsloth-GGUF es un conjunto de cuantizaciones GGUF de un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo base WeiboAI/VibeThinker-3B, especializado en llamadas a funciones (function calling). El modelo base, desarrollado por WeiboAI, es un modelo denso de 3 mil millones de parámetros construido sobre Qwen2.5-Coder-3B y post-entrenado con un pipeline de razonamiento verificable (Spectrum-to-Signal) que combina SFT curricular, aprendizaje por refuerzo multi-dominio y autodestilación. Este repositorio concreto aplica un ajuste fino con el dataset Salesforce/xlam-function-calling-60k para mejorar la capacidad de invocar herramientas y APIs de forma estructurada.

La relevancia de este modelo radica en ofrecer una versión cuantizada y ligera de un modelo de razonamiento con capacidades de function calling, pensada para ejecutarse en entornos con recursos limitados mediante llama.cpp u Ollama. Al estar licenciado bajo MIT, permite uso comercial sin restricciones. El repositorio incluye seis niveles de cuantización (de Q2_K a Q8_0) que cubren desde 1,27 GB hasta 3,29 GB, lo que lo hace viable en GPUs de consumo con poca VRAM.

Es importante señalar que no se han publicado evaluaciones de rendimiento (benchmarks) para este checkpoint concreto; la única métrica reportada es la pérdida de entrenamiento observada, que descendió de 1,0532 a 0,1784 a lo largo de 7.500 pasos. Por tanto, las capacidades descritas se infieren del diseño del modelo base y del dataset de entrenamiento, pero no están validadas empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-Coder-3B) con ajuste LoRA |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (max sequence length durante el entrenamiento; contexto del modelo base no especificado) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base VibeThinker-3B es un transformer denso de 3B parámetros construido sobre Qwen2.5-Coder-3B, post-entrenado con el pipeline Spectrum-to-Signal que combina SFT curricular, aprendizaje por refuerzo multi-dominio, autodestilación offline y ajuste por instrucciones. El objetivo declarado es maximizar el razonamiento verificable en un régimen de modelo pequeño.

El ajuste fino de este repositorio se realizó con LoRA (rank 16, alpha 16) sobre el dataset Salesforce/xlam-function-calling-60k, que contiene 60.000 ejemplos de llamadas a funciones. El entrenamiento usó QLoRA con precisión base de 4 bits, una tasa de aprendizaje de 0,0002, una época, batch efectivo de 8 (2 x 4 acumulación de gradientes) y una longitud máxima de secuencia de 2048 tokens. Los adaptadores LoRA se fusionaron en los pesos del modelo base, por lo que no se pueden separar. El entrenamiento se ejecutó en una partición SLURM con GPUs H100, utilizando Unsloth y TRL.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de razonamiento del modelo base VibeThinker-3B, que fue entrenado para razonamiento verificable en dominios como matematicas, logica y codigo.
- Function calling: el ajuste fino con xlam-function-calling-60k esta disenado para que el modelo genere llamadas a funciones estructuradas (JSON) a partir de instrucciones en lenguaje natural.
- Generacion de codigo: al estar basado en Qwen2.5-Coder-3B, conserva capacidades de generacion y comprension de codigo, aunque no se han evaluado tras el ajuste.
- Soporte de agentes: la capacidad de invocar funciones permite su uso en pipelines de agentes que requieren interaccion con herramientas o APIs.
- Multilingue: no se especifican idiomas soportados; se asume herencia del modelo base, pero no hay datos confirmados.

## Casos de uso

- Asistentes de automatizacion de tareas: el modelo puede interpretar comandos en lenguaje natural y traducirlos a llamadas a APIs o funciones internas, por ejemplo, para consultar bases de datos o enviar notificaciones.
- Agentes conversacionales con herramientas: integrado en un framework de agentes, puede decidir que funcion invocar (busqueda web, calculo, acceso a servicios) y formatear la respuesta.
- Prototipado rapido de integraciones: al ser ligero (menos de 2 GB en Q4_K_M), permite probar flujos de function calling en entornos de desarrollo sin necesidad de GPUs potentes.
- Educacion y experimentacion: util para ensenar conceptos de function calling y agentes en cursos de IA, dado su tamano reducido y licencia permisiva.
- Despliegue en edge o dispositivos con recursos limitados: las cuantizaciones Q2_K y Q3_K_M caben en sistemas con poca RAM/VRAM, habilitando inferencia local en portatiles o mini-PCs.
- Generacion de codigo asistida en entornos sin conexion: aunque no es su foco principal, puede usarse como autocompletado de codigo basico en editores locales gracias a su base Qwen2.5-Coder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento observada en los logs SLURM:

| Metrica | Valor |
|---|---|
| Perdida inicial (paso 0) | 1,0532 |
| Perdida final (paso 7.500) | 0,1784 |

Estos valores son observaciones de perdida de entrenamiento y no deben interpretarse como una medida de calidad del modelo en tareas reales. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, el archivo Q4_K_M pesa 1,93 GB, por lo que con overhead de contexto y calculo se recomienda al menos 4 GB de VRAM. Las versiones Q2_K (1,27 GB) pueden funcionar con 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. Para las cuantizaciones mas altas (Q6_K, Q8_0) se recomienda 6-8 GB de VRAM.
- Compatibilidad con consumer GPU: si, todas las cuantizaciones son aptas para GPUs de consumo.
- Opciones de despliegue: llama.cpp (via llama-cli o servidor), Ollama (creando un Modelfile), y cualquier runtime compatible con GGUF como llama-cpp-python, LM Studio o text-generation-webui.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3060 o superior), un modelo de 3B en Q4_K_M suele generar entre 20 y 50 tokens por segundo, pero estos valores son estimaciones generales y no estan verificados para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo. Como referencia estructural, se puede comparar con otros modelos de function calling de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VibeThinker-3B-Function-Calling (este) | 3,09 B | 2048 (entrenamiento) | MIT | GGUF | Fine-tune LoRA sobre VibeThinker-3B |
| WeiboAI/VibeThinker-3B (base) | 3,09 B | No especificado | MIT | safetensors | Modelo de razonamiento verificable |
| Qwen2.5-Coder-3B | 3,09 B | 32K (tipico) | Apache 2.0 | safetensors | Base del modelo, sin fine-tune de function calling |

No hay benchmarks publicados que permitan una comparacion cuantitativa. La comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion de benchmarks sobre este checkpoint; los unicos numeros reportados son observaciones de perdida de entrenamiento, que no garantizan calidad en tareas reales.
- Hereda los sesgos, el cutoff de conocimiento y los modos de fallo del modelo base VibeThinker-3B, que a su vez deriva de Qwen2.5-Coder-3B.
- El ajuste fino se realizo sobre un unico dataset de function calling (xlam-function-calling-60k); el comportamiento fuera de esa distribucion de datos no esta probado.
- Los adaptadores LoRA estan fusionados en los pesos base, por lo que no es posible separar el fine-tune del modelo original.
- La longitud de contexto efectiva durante el entrenamiento fue de 2048 tokens; usos con contextos mas largos pueden degradar el rendimiento, aunque el modelo base podria soportar mas.
- No se especifican los idiomas soportados; se recomienda validar el comportamiento en el idioma objetivo antes de usarlo en produccion.
- Aunque la licencia MIT permite uso comercial, la ausencia de evaluacion de seguridad y sesgos implica un riesgo para aplicaciones sensibles.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ermiaazarkhalili/VibeThinker-3B-Function-Calling-xLAM-Unsloth-GGUF
- Repositorio HuggingFace (pesos completos): https://huggingface.co/ermiaazarkhalili/VibeThinker-3B-Function-Calling-xLAM-Unsloth
- Modelo base en HuggingFace: https://huggingface.co/WeiboAI/VibeThinker-3B
- GitHub de VibeThinker: https://github.com/WeiboAI/VibeThinker
- Paper tecnico (arXiv): https://arxiv.org/abs/2606.16140
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
