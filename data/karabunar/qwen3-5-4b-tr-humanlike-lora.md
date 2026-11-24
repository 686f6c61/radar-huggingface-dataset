# karabunar/Qwen3.5-4B-TR-HumanLike-LoRA

## Resumen

Qwen3.5-4B-TR-HumanLike-LoRA es una colección de tres adaptadores LoRA (DPO, KTO y SFT) entrenados sobre el modelo base Qwen/Qwen3.5-4B para modificar el estilo de las respuestas en turco. El objetivo declarado por su autor, karabunar, es que las respuestas suenen a una persona conversando de forma cercana en lugar de a un asistente formal. Los tres adaptadores se entrenaron con el mismo presupuesto de pasos y sobre los mismos datos de preferencia, lo que permite comparar directamente las tres técnicas de optimización.

El modelo es relevante como estudio comparativo reproducible de optimización por preferencias (DPO frente a KTO frente a SFT) aplicada a un objetivo puramente estilístico y en un idioma de recursos medios como el turco. No se trata de un modelo completo, sino de adaptadores PEFT que requieren el modelo base Qwen3.5-4B (revisión 851bf6e8) y transformers >= 5.2 para funcionar.

La ficha se centra en el adaptador KTO, que es el que obtiene mejores resultados en precisión de preferencia (0,781 frente a 0,640 de DPO y 0,604 de SFT), aunque los tres se distribuyen en subcarpetas del mismo repositorio. El repositorio ocupa 0,2 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; r=16, alpha=32, dropout 0.05, aplicado a proyecciones de atención, atención lineal y MLP |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó max_length 768 tokens) |
| Tipos de cuantizacion | Entrenado con QLoRA en 4-bit NF4 con doble cuantización y cómputo bf16; los adaptadores se pueden cargar sobre base en bf16 o en 4-bit |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Los adaptadores se construyen sobre Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros. El ajuste se realizó con QLoRA: base cuantizada en 4-bit NF4 con doble cuantización y cómputo en bf16, con adaptadores LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención, atención lineal y MLP. El entrenamiento se hizo con TRL 1.16.0, transformers 5.20.2, peft 0.21.2 y bitsandbytes 0.50.2 sobre una única RTX A4000 de 16 GB.

Los datos provienen del dataset yusufbaykaloglu/Human-Like-DPO-Dataset-TR (traducción al turco del Human-Like-DPO, Apache-2.0), tras eliminar 128 duplicados exactos. El split es 85/5/10 por prompt (sin solapamiento entre splits): 9.141 pares de entrenamiento, 539 de validación y 1.076 de test, semilla 42. Cada método consumió 572 pasos de optimización de 16 prompts (una época) con longitud máxima de 768 tokens. DPO y KTO usaron learning rate 5e-6 con beta 0.1; SFT usó 2e-5 y solo las respuestas elegidas. KTO empleó pesos 1.0 para ejemplos deseables y 1.0 para indeseables, con el modelo base (adaptador desactivado) como referencia. Tiempos: DPO 3 h 41 min, KTO 5 h 17 min, SFT 1 h 30 min.

Una innovación práctica destacable es la plantilla de chat incluida en el repositorio, que desactiva el bloque de razonamiento (thinking) que Qwen3.5 abre por defecto; entrenamiento, scoring y generación usaron esa variante. El autor advierte que con la plantilla original las respuestas pueden comenzar con un bloque de pensamiento.

## Capacidades

- Generación de texto conversacional en turco con un registro cercano e informal, orientado a sonar "humano".
- Tres variantes de comportamiento seleccionables: DPO (mantiene más la persona del modelo base y añade aperturas amables), KTO (mayor cambio de estilo y respuestas más cortas, ~30 % más breves que la base) y SFT (copia el estilo y la longitud de las respuestas elegidas).
- Razonamiento y generación de código heredados del modelo base Qwen3.5-4B, aunque no evaluados específicamente en esta ficha.
- Soporte de plantilla de chat con roles (user/assistant) y opción de thinking desactivado.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al turco para el objetivo de estilo; el modelo base conserva sus capacidades originales, pero los adaptadores se entrenaron solo con datos en turco.

## Casos de uso

- **Chatbots de atención al cliente en turco con tono cercano**: el adaptador KTO produce respuestas ~30 % más cortas que la base, lo que reduce coste por conversación y encaja en flujos de soporte donde se busca cercanía sin perder concisión.
- **Asistentes conversacionales para comunidades y foros turcos**: el estilo "humano" del adaptador DPO, que conserva la persona del modelo base y añade aperturas amables, es adecuado para moderación asistida y respuestas en hilos de discusión.
- **Generación de contenido de marketing y redes sociales**: el adaptador SFT replica la longitud y el registro de las respuestas elegidas, útil para producir copies breves y consistentes con una guía de estilo fija.
- **Investigación comparativa de métodos de alineación**: los tres adaptadores comparten datos y presupuesto de pasos, lo que permite reproducir experimentos de DPO frente a KTO frente a SFT con una única GPU de 16 GB.
- **Prototipado rápido de asistentes personalizados**: al ser adaptadores de 0,2 GB sobre un base de 4B, se pueden intercambiar en caliente en un mismo servidor para probar distintos tonos sin reentrenar.
- **Evaluación de jueces automáticos en turco**: el autor documenta que el juez Qwen2.5-7B-Instruct tiene una fiabilidad muy baja (kappa de Cohen = -0,11 frente a revisión manual), lo que convierte este repositorio en un caso de estudio útil para calibrar pipelines de evaluación LLM-as-a-judge.
- **Fine-tuning educativo y docencia**: el repositorio documenta hiperparámetros, hardware, tiempos y resultados, lo que lo hace apropiado como material didáctico para cursos de PEFT y optimización por preferencias.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 1.076 pares de test retenidos (precisión de preferencia) y 200 prompts retenidos con decodificación greedy (win-rate juzgado por Qwen/Qwen2.5-7B-Instruct en ambos órdenes de presentación; los veredictos inconsistentes cuentan como empate).

| Modelo | Precisión de preferencia | Win-rate vs. base | W / T / L | Tokens medios | Respuestas que alcanzan el límite |
|---|---|---|---|---|---|
| Base Qwen3.5-4B | 0,102 | n/a | n/a | 674 | 0,5 % |
| DPO | 0,640 | 0,735 | 102 / 90 / 8 | 668 | 0,0 % |
| KTO | 0,781 | 0,765 | 115 / 76 / 9 | 479 | 0,5 % |
| SFT | 0,604 | 0,642 | 102 / 53 / 45 | 347 | 6,0 % |

Advertencias del propio autor: el modelo base prefiere la respuesta formal en ~90 % de los pares, por lo que la tabla mide principalmente un cambio de estilo; KTO supera a DPO en 14 puntos de precisión de preferencia, pero la diferencia en win-rate (6 prompts de 200) no debe interpretarse como real; hay una sola ejecución por método, una semilla y sin intervalos de confianza; el juez automático no es fiable (coincidencia con revisión manual en solo 5 de 24 casos, kappa = -0,11), por lo que los win-rates reflejan la preferencia del juez, no la humana.

## Requisitos de hardware

- El autor entrenó los tres adaptadores en una única RTX A4000 de 16 GB con QLoRA 4-bit NF4, lo que confirma que el ajuste cabe en GPU de consumo profesional.
- Inferencia: cargando el base en bf16 se necesitan aproximadamente 8 GB de VRAM para los pesos (4B × 2 bytes) más overhead de activaciones y KV cache; con cuantización 4-bit NF4 el base baja a ~2,5-3 GB, dejando margen amplio en GPUs de 8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, RTX A4000/A5000 para inferencia local; A100/H100 para servir en producción con mayor concurrencia.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores con cuantización 4-bit; en bf16 requiere al menos 10-12 GB.
- Opciones de despliegue: transformers + peft (documentado por el autor), vLLM y TGI para servir el base con adaptadores LoRA multi-tenant, llama.cpp/Ollama si se fusionan los adaptadores y se convierten a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada. El autor reporta tiempos de entrenamiento (DPO 3 h 41 min, KTO 5 h 17 min, SFT 1 h 30 min) pero no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-TR-HumanLike-LoRA (KTO) | 4B (base) + adaptador LoRA | No disponible | Adaptador de estilo turco vía KTO | Apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | Modelo generalista multilingüe | Apache-2.0 (según el base) | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | Modelo generalista con instrucciones, usado como juez en la evaluación | Apache-2.0 | Hugging Face |
| Adaptadores DPO y SFT del mismo repo | 4B (base) + adaptador LoRA | No disponible | Variantes de alineación sobre los mismos datos | Apache-2.0 | Hugging Face (subcarpetas dpo/ y sft/) |

No se dispone de comparación con otros adaptadores de estilo en turco en la información proporcionada.

## Limitaciones y advertencias

- **Historias personales inventadas**: los adaptadores, especialmente KTO, aprendieron de los datos de entrenamiento a hablar de experiencias personales y a veces inventan una vida (por ejemplo, "empecé a estudiar japonés porque viajé mucho a Japón") o se contradicen con su propio aviso de que son una IA en la misma respuesta.
- **DPO mantiene la persona del base**: añade aperturas amables pero sigue recurriendo a avisos del tipo "como IA..." en algunas respuestas.
- **SFT copia estilo y longitud**: el 6 % de sus respuestas alcanza el límite de tokens, lo que indica riesgo de generaciones truncadas.
- **Juez automático no fiable**: el autor documenta kappa de Cohen de -0,11 frente a revisión manual; los win-rates no deben tomarse como preferencia humana.
- **Una sola semilla y una sola ejecución por método**: sin intervalos de confianza, las diferencias pequeñas entre métodos no son concluyentes.
- **Idioma**: los adaptadores se entrenaron solo con datos en turco; su comportamiento en otros idiomas no está evaluado y probablemente degrada el estilo del base.
- **Riesgo de alucinación**: no evaluado de forma específica; el modelo base de 4B tiene capacidad limitada de conocimiento factual.
- **Licencia**: Apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3.5-4B y del dataset de origen.
- **Requisito de versión**: necesita transformers >= 5.2 (probado con 5.20.2, peft 0.21.2); versiones anteriores pueden no cargar el modelo base correctamente.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karabunar/Qwen3.5-4B-TR-HumanLike-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/yusufbaykaloglu/Human-Like-DPO-Dataset-TR
- Juez usado en la evaluación: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
