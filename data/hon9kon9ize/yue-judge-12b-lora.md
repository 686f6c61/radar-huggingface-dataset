# hon9kon9ize/yue-judge-12b-lora

## Resumen

yue-judge-12b-lora es un adaptador LoRA publicado por el usuario hon9kon9ize sobre el modelo base google/gemma-4-12B-it. Está orientado a tareas de clasificación de texto y evaluación (judge) con especial atención al cantonés (yue), el chino (zh) y el inglés (en), e incluye la etiqueta "calibration" en sus metadatos, lo que sugiere un uso previsto como evaluador o clasificador calibrado en pipelines de anotación o control de calidad.

El repositorio es un adaptador PEFT en formato safetensors de aproximadamente 0,3 GB, lo que corresponde a los pesos del LoRA y no al modelo completo. El modelo base, google/gemma-4-12B-it, es un transformer de 12 mil millones de parámetros con ajuste por instrucciones, del que no se dispone de especificaciones detalladas en la información proporcionada.

La relevancia del proyecto radica en su nicho: herramientas de evaluación automática para cantonés, un idioma con recursos escasos en comparación con el chino mandarín. La licencia Apache 2.0 facilita su integración comercial, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base google/gemma-4-12B-it) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 12B (según su nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | No disponible (el adaptador es safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | Cantonés (yue), chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre google/gemma-4-12B-it, un modelo de lenguaje decoder-only ajustado por instrucciones, y modifica un subconjunto de pesos de bajo rango para especializarlo en clasificación de texto y tareas de evaluación. El tamaño del repositorio (0,3 GB) es coherente con un adaptador de rango moderado sobre un modelo de 12B.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, el rango del LoRA, la estrategia de ajuste (SFT, DPO, RLHF) ni posibles innovaciones técnicas. La etiqueta "calibration" sugiere que el entrenamiento pudo incluir objetivos de calibración de probabilidades para tareas de clasificación, pero este extremo no está documentado en la información disponible.

## Capacidades

- Clasificación de texto: pipeline declarado `text-classification`, orientado a etiquetar o puntuar textos en cantonés, chino e inglés.
- Evaluación automática (judge): uso previsto como evaluador de respuestas o de calidad en pipelines de anotación, con énfasis en calibración.
- Multilingüismo limitado a tres idiomas: yue, zh y en.
- Herencia del modelo base: al estar construido sobre gemma-4-12B-it, conserva las capacidades generales de generación, razonamiento y seguimiento de instrucciones del modelo base, aunque el adaptador está especializado en clasificación.
- Tool calling y function calling: no documentado para el adaptador; dependería del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de calidad de traducciones al cantonés: el adaptador puede puntuar o clasificar pares de traducción y detectar errores de fluidez o fidelidad, aprovechando su especialización en yue y su objetivo de calibración.
- Control de calidad en anotación de datos: integrado en pipelines de etiquetado para validar anotaciones en cantonés y chino, reduciendo la revisión manual en proyectos de datos lingüísticos.
- Moderación de contenido en foros y comunidades de Hong Kong: clasificación de textos en yue y zh para detectar categorías de riesgo, con la ventaja de cubrir un idioma con pocos modelos especializados.
- Filtrado de datasets multilingües: uso como clasificador para separar o priorizar muestras en yue, zh y en antes del entrenamiento de otros modelos.
- Evaluador en sistemas de RLHF o RLAIF: empleo como judge para puntuar respuestas generadas por otros modelos en cantonés, donde escasean evaluadores nativos.
- Clasificación de intención en asistentes conversacionales: etiquetado de consultas de usuarios en cantonés para enrutamiento en sistemas de atención al cliente o chatbots.
- Validación de salidas en producción: comprobación automática de respuestas generadas por modelos más grandes en entornos donde el cantonés es el idioma principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 0,3 GB; requiere cargar el modelo base google/gemma-4-12B-it para funcionar.
- VRAM estimada para el modelo base en precisión completa (bf16): en torno a 24 GB solo para pesos, más memoria para activaciones y KV cache.
- VRAM estimada con cuantización de 8 bits: aproximadamente 12-13 GB; con 4 bits: aproximadamente 7-8 GB (estimaciones orientativas, no confirmadas para este modelo).
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado o cuantización de 8 bits; RTX 3090/4080 para cuantización de 4-8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) si se aplica cuantización al modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` y `transformers`; para servicio, vLLM o TGI con soporte de adaptadores LoRA, o conversión a GGUF para llama.cpp/Ollama si se fusiona con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yue-judge-12b-lora | Adaptador sobre base de 12B | No disponible | yue, zh, en | Apache 2.0 | Gated en Hugging Face |
| Modelos judge generalistas (p. ej., basados en Llama o Qwen) | 7B-70B | Variable | Principalmente en/zh | Variable | Públicos |
| Clasificadores específicos de cantonés | Típicamente < 1B | Corto | yue | Variable | Públicos |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La principal ventaja diferencial de este adaptador es su especialización declarada en cantonés y calibración; su limitación es la dependencia de un modelo base de 12B y el acceso restringido.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; necesita google/gemma-4-12B-it, sujeto a sus propias condiciones de uso.
- Idiomas limitados: solo yue, zh y en; el rendimiento fuera de estos idiomas no está garantizado.
- Sin documentación de entrenamiento: no se conocen el dataset, el volumen de datos ni el método de ajuste, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación: al heredar un modelo generativo de 12B, las salidas pueden ser inconsistentes si se usa fuera de la tarea de clasificación.
- Sesgos: no documentados; los datos de cantonés de Hong Kong pueden introducir sesgos regionales o sociolingüísticos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad como judge o clasificador.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero conviene verificar los términos del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/hon9kon9ize/yue-judge-12b-lora
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
