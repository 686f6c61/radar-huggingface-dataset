# Aletheia-ng/gemma-3-385m-translate-best

## Resumen

`Aletheia-ng/gemma-3-385m-translate-best` es un modelo de traducción automática de inglés a lenguas africanas desarrollado por Aletheia AI (cuenta `Aletheia-ng`). Parte de `google/gemma-3-270m-it` como modelo base, que se ha expandido hasta 385.144.448 parámetros totales, y se ha especializado mediante fine-tuning supervisado y un posterior entrenamiento con GRPO (Group Relative Policy Optimization) usando recompensas de estimación de calidad sin referencia. Su propósito es cubrir el hueco de traducción de alta cobertura en lenguas africanas de bajos recursos, un ámbito tradicionalmente desatendido por los modelos multilingües comerciales.

La arquitectura es un transformer causal estándar de la familia Gemma 3 (`Gemma3ForCausalLM`), con 125 etiquetas de idioma de un solo token que codifican el idioma destino en la respuesta. El modelo solo traduce en la dirección inglés → lenguas africanas; no soporta la dirección inversa. Según la model card, con decodificación greedy alcanza un chrF++ macro por idioma de 31,66 en FLORES+ devtest (54 idiomas, AfriCOMET 0,627 sobre 40), 37,17 en NTREX-128 (24 idiomas) y 40,78 en MAFAND-MT (15 idiomas).

Su relevancia actual radica en tres factores: el tamaño reducido (385 M de parámetros, 1,6 GB de repositorio) permite despliegue en hardware modesto; la licencia permite uso comercial con atribución; y la cobertura de más de 120 lenguas africanas con etiquetas dedicadas lo convierte en una opción práctica para localización a escala en contextos de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Gemma3ForCausalLM`), familia Gemma 3 |
| Parametros totales | 385.144.448 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (vLLM se configura con `max_model_len=4096` en los ejemplos, pero no se especifica el contexto nativo entrenado) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; el ejemplo usa bfloat16) |
| Idiomas soportados | Ingles (origen) y 125 etiquetas de idioma africano (destino), entre ellas yoruba, hausa, ibo, pidgin, efik, twi, ewe, fon, wolof, swahili, kinyarwanda, somali, oromo, amharico, tigrinya, luganda, lingala, zulu, xhosa, afrikaans, shona, chichewa, sesotho, setswana, sepedi, malgache, ibibio, urhobo, bemba, tumbuka, rundi, venda, tsonga, ndebele, swati, sango, tiv, umbundu, kimbundu, mossi, kikuyu, luo, kamba, bin, dagbani, oke, shi, dioula, bambara, etc. |
| Licencia | Otra: uso comercial libre con atribucion obligatoria a "Translation models by Aletheia AI" y cita del paper; se aplican ademas los Gemma Terms of Use y la Prohibited Use Policy de Google |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 1,6 GB |
| Modelo base | `google/gemma-3-270m-it` |
| Pipeline | translation |
| Idioma de origen | Solo ingles (no hay direccion africano → ingles) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Gemma 3, con 385 M de parámetros totales. Se construyó a partir de `google/gemma-3-270m-it`, al que se aplicó un proceso de crecimiento y fine-tuning sobre datos de traducción inglés → X. Posteriormente se entrenó con GRPO (Group Relative Policy Optimization), una variante de optimización por preferencias que en este caso utiliza recompensas de estimación de calidad sin referencia, es decir, sin necesidad de traducciones de referencia para calcular la señal de recompensa. Este enfoque es relevante en lenguas de bajos recursos, donde los corpus paralelos de calidad son escasos.

Una innovación destacable es el uso de 125 etiquetas de idioma de un solo token (`<yor>`, `<hau>`, `<ibo>`, etc.) que el modelo emite al inicio de la respuesta para indicar el idioma destino. Esto simplifica el enrutamiento y evita ambigüedad en la selección de lengua. La model card indica que 58 de esas 125 etiquetas cuentan con puntuaciones basadas en referencia para este modelo concreto. El entrenamiento se realizó con un formato de turno de usuario muy específico: `Translate the text to <nombre del idioma>:  <texto>`, con dos espacios después de los dos puntos, y el modelo responde con la etiqueta de idioma, un espacio, la traducción y `<end_of_turn>`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles del proceso de RLHF/DPO más allá del uso de GRPO.

## Capacidades

- Traducción de inglés a más de 120 lenguas africanas, con etiqueta de idioma destino de un solo token.
- Generación de texto condicionada por un único turno de usuario con plantilla de chat Gemma 3 (`apply_chat_template` con `add_generation_prompt=True`).
- Soporte de decodificación greedy (`temperature=0`) y parada en `<end_of_turn>` (id 106).
- Compatible con vLLM y con `text-generation-inference` (etiqueta `endpoints_compatible` en el repositorio).
- Capacidad de traducción por lotes de una misma frase a varios idiomas en una sola llamada (ejemplo con vLLM).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: la información disponible no indica ninguna de estas capacidades.
- No soporta traducción africano → inglés ni entre pares de lenguas africanas.
- Capacidad multilingüe limitada a la dirección inglés → africano; no se documentan capacidades generales de generación de texto más allá de la traducción.

## Casos de uso

- Localización de documentación técnica y gubernamental: el modelo traduce frases o párrafos cortos del inglés a lenguas africanas concretas, lo que permite generar versiones localizadas de manuales, formularios y avisos oficiales sin depender de traductores humanos para cada variante. Es adecuado por su cobertura de más de 120 lenguas y su tamaño reducido.
- Atención al cliente multilingüe en mercados africanos: se puede integrar en un pipeline que reciba mensajes de usuarios en inglés y genere respuestas en la lengua local del cliente (yoruba, hausa, swahili, zulu, amhárico, etc.), usando la etiqueta de idioma para enrutar la respuesta correcta.
- Traducción de contenidos educativos y sanitarios: campañas de salud pública, materiales escolares y guías de prevención pueden traducirse del inglés a lenguas de bajos recursos con un modelo que cabe en una GPU de consumo, lo que facilita su despliegue en organizaciones con recursos limitados.
- Procesamiento por lotes de corpus para investigación lingüística: al aceptar una frase y devolver una traducción etiquetada por idioma, el modelo sirve para generar corpus paralelos preliminares o para anotar datos en lenguas africanas con fines de estudio, siempre con revisión humana posterior.
- Integración en aplicaciones de mensajería y redes sociales: el modelo puede traducir mensajes cortos en tiempo real (una frase por petición) en un servicio con vLLM, con latencia baja gracias a sus 385 M de parámetros y a la decodificación greedy.
- Generación de subtítulos y transcripciones localizadas: a partir de guiones o transcripciones en inglés, se pueden producir subtítulos en lenguas africanas para vídeos, formaciones o anuncios, dividiendo el texto en frases y llamando al modelo por cada una.
- Prototipado rápido de sistemas de traducción para nuevas lenguas: al estar basado en Gemma 3 y公开 sus pesos en safetensors, investigadores pueden hacer fine-tuning adicional sobre pares concretos o evaluar la calidad base antes de invertir en datos de referencia.

## Benchmarks y rendimiento

Los datos disponibles en la model card son los siguientes (chrF++ macro por idioma, decodificación greedy):

| Benchmark | Idiomas evaluados | chrF++ macro | Metrica adicional |
|---|---|---|---|
| FLORES+ devtest | 54 | 31,66 | AfriCOMET 0,627 sobre 40 |
| NTREX-128 | 24 | 37,17 | No disponible |
| MAFAND-MT | 15 | 40,78 | No disponible |

La model card también menciona que, en vLLM, añadir `frequency_penalty=0.1` elevó el chrF++ medio de 34,55 a 34,84 sobre 93 celdas idioma-benchmark. No se han publicado en la información disponible comparaciones directas con otros modelos en estos benchmarks, ni resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo especializado en traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 385 M de parámetros, en bfloat16 los pesos ocupan aproximadamente 0,77 GB; en float32, unos 1,54 GB. La VRAM total necesaria para inferencia con overhead de activaciones y caché KV es del orden de 1-2 GB en bfloat16 para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100, H100, L4, T4, etc. No requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con al menos 4 GB de VRAM), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM`), vLLM (ejemplo oficial con `LLM(..., dtype="bfloat16", max_model_len=4096)`), text-generation-inference (etiqueta `endpoints_compatible`), y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF, aunque no se documentan en la información disponible.
- Latencia y throughput: no se publican cifras concretas en la información disponible. Por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU moderna y throughput alto en vLLM con lotes, pero son estimaciones no confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Aletheia-ng/gemma-3-385m-translate-best` | 385 M | No disponible | Traducción inglés → lenguas africanas (125 etiquetas) | Comercial con atribución + Gemma Terms | Hugging Face, safetensors |
| `BeardedMonster/gemma-3-385m-science-translate-best` | 385 M (derivado del mismo base) | No disponible | Variante "science" del mismo autor | No disponible en la información | Hugging Face |
| `google/gemma-3-270m-it` | 270 M | No disponible en la información | Modelo generalista instruction-tuned | Gemma Terms of Use | Hugging Face |
| NLLB-200 (Meta) | Hasta 54,5 B (variante 600 M disponible) | No disponible en la información | Traducción multilingüe 200 idiomas | CC-BY-NC 4.0 (no comercial) | Hugging Face |

La comparación con NLLB-200 es pertinente por categoría (traducción multilingüe de bajos recursos), pero la información disponible no permite comparar resultados en los mismos benchmarks. El modelo de Aletheia se distingue por su licencia comercial con atribución frente a la licencia no comercial de NLLB, y por su tamaño reducido. No se dispone de datos de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Direccionalidad limitada: solo traduce inglés → lenguas africanas; no soporta africano → inglés ni traducción entre lenguas africanas.
- Formato de prompt estricto: requiere un único turno de usuario con el nombre del idioma (no el código ISO) y exactamente dos espacios después de los dos puntos. Desviarse del formato puede degradar la calidad o producir salidas incorrectas.
- Cobertura desigual: solo 58 de las 125 etiquetas de idioma cuentan con puntuaciones basadas en referencia para este modelo, por lo que la calidad en el resto de lenguas no está verificada de forma pública.
- Riesgo de alucinación y repetición: la model card recomienda `frequency_penalty=0.1` en vLLM como guarda contra repeticiones, lo que indica que el modelo puede entrar en bucles sin esa protección.
- Longitud de entrada: se recomienda una frase o párrafo corto por petición y dividir textos largos en frases; no se especifica la longitud de contexto nativa entrenada.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al entrenarse sobre datos de traducción de fuentes no detalladas, puede heredar sesgos de esos corpus.
- Licencia: el uso comercial está permitido con atribución obligatoria ("Translation models by Aletheia AI" más cita del paper), y se aplican adicionalmente los Gemma Terms of Use y la Prohibited Use Policy de Google, lo que impone restricciones de uso adicionales.
- Sin datos de benchmarks comparativos con otros modelos en la información disponible, por lo que la evaluación relativa debe hacerse con cautela.
- No dispone de tool calling, agentes, visión ni otras capacidades generales; es un modelo especializado en traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aletheia-ng/gemma-3-385m-translate-best
- Variante "science" del mismo autor: https://huggingface.co/BeardedMonster/gemma-3-385m-science-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Gemma Terms of Use: no disponible en la información proporcionada (referenciado en la model card)
- Paper acompañante: no disponible en la información proporcionada (la model card exige citarlo pero no incluye el enlace)
