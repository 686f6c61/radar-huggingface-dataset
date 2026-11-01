# nchapman/granite-4.0-1b-summarization-lora

## Resumen

Granite 4.0-1B Summarization LoRA es un adaptador PEFT de tipo LoRA (rango 16, alpha 16, dropout 0) entrenado por el usuario nchapman sobre el modelo base ibm-granite/granite-4.0-1b. No es un modelo independiente: requiere cargar el modelo base y aplicar el adaptador mediante la libreria PEFT. Su proposito es reforzar un contrato de respuesta de resumido (prosa objetiva, breve cuando la fuente es simple y mas detallada cuando lo merece) para articulos web en ingles.

El adaptador se entreno sobre el split de summarization del dataset HuggingFaceTB/smoltalk2, que incluye estilos de resumen de una linea y de tres frases, combinado con pares documento/resumen privados del autor. El artefacto evaluado corresponde al checkpoint `granite4-1b-summary-v3-8k-s42-early512/checkpoints/checkpoint-128`, entrenado con una sola semilla.

Es relevante como ejemplo de adaptacion ligera (el repositorio ocupa 0,1 GB) sobre un modelo pequeno de 1B parametros, pero el propio autor lo describe como exploratorio: la evaluacion arroja resultados mixtos y no constituye una recomendacion de despliegue ni una mejora de calidad demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: ibm-granite/granite-4.0-1b) |
| Parametros totales | no disponible (adaptador LoRA rango 16, alpha 16, dropout 0; el modelo base tiene 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso ejemplos de hasta 8k tokens segun el nombre del checkpoint; la ventana del modelo base no se especifica) |
| Tipos de cuantizacion | evaluado con base Q4_K_XL GGUF y adaptador BF16; el adaptador se distribuye en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (adaptador); el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT); no incluye tokenizer ni pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 y dropout 0 aplicado sobre el modelo base Granite 4.0-1B, un transformer decoder-only de 1B parametros. El entrenamiento se realizo con una unica semilla y el artefacto evaluado es el checkpoint 128 de la ejecucion `granite4-1b-summary-v3-8k-s42-early512`. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

Los datos de entrenamiento emparejan documentos fuente con resumenes objetivo. La parte publica proviene del split de summarization SFT de HuggingFaceTB/smoltalk2 (estilos de una linea y tres frases); las ejecuciones mixtas anadieron pares documento/resumen web privados del autor, que no se publican. El objetivo declarado es reforzar un contrato de respuesta de resumido comun entre tamanos y familias de modelos, aunque el autor reconoce que no se ha ejecutado ninguna metrica formal de varianza de estilo y que los dos adaptadores Granite muestran resultados dependientes del modelo.

## Capacidades

- Generacion de texto y resumen extractivo/abstractivo de articulos web en ingles.
- Resumen con dos estilos: una linea y tres frases, heredados del dataset de entrenamiento.
- Ajuste de longitud del resumen segun la complejidad de la fuente (breve para fuentes simples, mas detallado cuando procede).
- Generacion de prosa objetiva en ingles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible (solo ingles).

## Casos de uso

- Resumen de articulos de noticias en ingles: el adaptador se entreno sobre pares documento/resumen del estilo CNN/DailyMail y produce resumenes de una linea o tres frases adecuados para boletines y agregadores.
- Enriquecimiento de pipelines de curación de contenido: dado un corpus de paginas web, generar resumenes breves y objetivos para metadatos, indices de busqueda o tarjetas de previsualizacion.
- Generacion de resumenes para lectores de noticias o RSS: el modelo base de 1B mas el adaptador caben en hardware modesto, lo que permite resumir articulos en el borde o en entornos con recursos limitados.
- Prototipado rapido de funcionalidades de resumen: al ser un adaptador de 0,1 GB, se puede cargar junto al modelo base con PEFT y probar variantes de prompt sin reentrenar el modelo completo.
- Investigacion sobre adaptacion ligera: sirve como referencia reproducible para estudiar el efecto de LoRA de rango 16 sobre un modelo pequeno en tareas de resumen, con protocolo de evaluacion documentado.
- Filtrado y triage de documentos: generar resumenes concisos para clasificar o priorizar articulos antes de un procesamiento mas costoso, aprovechando la mayor concision observada en la evaluacion.

## Benchmarks y rendimiento

Evaluacion alineada sobre 250 articulos de CNN/DailyMail, inferencia con base Q4, adaptador BF16, generacion greedy `summary-v3` y juez fijado:

| Metrica | Base | Base + adaptador | Diferencia [IC 95% emparejado] |
|---|---:|---:|---:|
| Factualidad (juez, 1-5) | 4,304 | 4,328 | +0,024 [-0,112, +0,156] |
| Cobertura (juez, 1-5) | 4,052 | 3,808 | -0,244 [-0,324, -0,168] |
| Concision (juez, 1-5) | 3,936 | 4,116 | +0,180 [+0,096, +0,260] |
| Calidad global (juez, 1-5) | 4,036 | 4,000 | -0,036 [-0,140, +0,068] |
| ROUGE-1 | 0,3219 | 0,3454 | +0,0235 [+0,0150, +0,0323] |
| Palabras medias | 154,9 | 141,9 | -12,9 [-24,3, +0,2] |
| Paradas por tope de 1.024 tokens | 0 | 2 | +2 |

El resultado es mixto: mejora el solapamiento con la referencia (ROUGE-1) y la concision, empeora la cobertura, y los cambios en factualidad y calidad global no son concluyentes. Las paradas por tope de contexto pasan de cero a dos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo base de 1B parametros en BF16 requiere aproximadamente 2 GB de pesos; en cuantizacion Q4_K_XL, alrededor de 0,7-1 GB, mas overhead de contexto y activaciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar el modelo base cuantizado; para BF16 se recomienda 6-8 GB. No se documentan pruebas en A100/H100.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no publica mediciones.
- Opciones de despliegue: PEFT + Transformers (metodo documentado); llama.cpp/Ollama con el modelo base en GGUF y el adaptador exportado como sidecar BF16 (protocolo usado en la evaluacion); vLLM y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/granite-4.0-1b-summarization-lora | Adaptador LoRA sobre 1B | no disponible | Resumen en ingles | Apache-2.0 | HuggingFace |
| ibm-granite/granite-4.0-1b (base) | 1B | no disponible | Generacion de texto general | Licencia propia de IBM | HuggingFace |
| Adaptadores de resumen sobre modelos mayores | no disponible | no disponible | Resumen | variable | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Resultado exploratorio: el autor lo describe explicitamente como un adaptador exploratorio, no como una mejora de calidad ni una recomendacion de despliegue.
- Evaluacion mixta: la cobertura empeora de forma significativa (-0,244) y la calidad global no mejora; la factualidad es inconcluyente.
- Paradas por tope de contexto: se observaron 2 paradas por el limite de 1.024 tokens frente a 0 en el modelo base.
- Una sola semilla: no se realizo una busqueda exhaustiva de checkpoints ni de semillas, por lo que la robustez del resultado no esta establecida.
- Solo ingles: no soporta otros idiomas.
- Dependencia del modelo base: no incluye tokenizer ni pesos; hay que cargar ibm-granite/granite-4.0-1b y respetar su licencia y terminos.
- Diferencias de inferencia: la evaluacion uso base Q4_K_XL GGUF con adaptador BF16; las generaciones con Transformers nativo pueden diferir.
- Riesgo de alucinacion: inherente a los modelos generativos de 1B; no se midio de forma especifica mas alla de la metrica de factualidad del juez.
- Datos privados no publicados: parte del entrenamiento uso pares documento/resumen privados, lo que limita la reproducibilidad completa.
- Sesgos: no se documenta ninguna evaluacion de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/granite-4.0-1b-summarization-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Dataset de entrenamiento publico: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Documentacion de resultados (referenciada en la model card): `docs/results/aligned-adapter-comparison.md` en el repositorio Lillm Summarizer (no se proporciona URL directa)
