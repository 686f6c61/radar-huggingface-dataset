# cguzel/trspell-flan-t5-small

## Resumen

trspell-flan-t5-small es un modelo de corrección ortográfica del turco obtenido mediante fine-tuning de google/flan-t5-small, un transformer encoder-decoder de tipo T5 con 8 capas de encoder y 8 de decoder y dimensión de modelo 512. Lo desarrolla Ceren Güzel Turhan y se publica junto al artículo *Leveraging Large Language Models for Spelling Correction in Turkish* (PeerJ Computer Science, 2025). Su tarea es estrictamente seq2seq: recibe una frase con errores ortográficos y genera la frase corregida, sin prefijos de tarea.

El modelo se entrena sobre NoisyWikiTr, un corpus derivado de Wikipedia en turco en el que aproximadamente el 10 % de los tokens han sido corrompidos de forma sintética (deleciones, inserciones, transposiciones, sustituciones, errores vocálicos, errores comunes y separaciones de palabras). Con 76.961.152 parámetros y un repositorio de 0,3 GB, es un modelo muy ligero, pensado para despliegue en CPU o GPU de gama baja.

Su relevancia es doble: por un lado, documenta un caso de uso concreto de corrección ortográfica en una lengua morfológicamente compleja como el turco; por otro, su model card es inusualmente honesta y señala una limitación crítica: el tokenizador de FLAN-T5 usa un vocabulario SentencePiece inglés que no representa las letras turcas `ı`, `ğ` e `İ`, lo que degrada la salida. El propio autor recomienda usar trspell-t5-efficient-small para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (FLAN-T5), 8 capas de encoder y 8 de decoder, d_model 512 |
| Parametros totales | 76.961.152 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a max_length 256) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de google/flan-t5-small, un transformer encoder-decoder denso con 8 capas en cada torre y dimensión oculta de 512. La tarea se plantea como traducción de secuencia a secuencia: la entrada es una frase ruidosa y la salida es la frase limpia, sin prefijo de tarea. No se emplean mecanismos adicionales como decodificación especulativa ni atención lineal; el ejemplo de la model card usa búsqueda por haces (num_beams=5) con max_length 256 y early_stopping.

El entrenamiento se realizó sobre el split de entrenamiento de NoisyWikiTr, con 687.000 frases de Wikipedia en turco en las que cerca del 10 % de los tokens fueron corrompidos mediante un generador de ruido que combina deleción, inserción, transposición, sustitución, errores vocálicos, errores ortográficos frecuentes y separación de palabras. El checkpoint publicado corresponde al final del fine-tuning tras 12 épocas. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias. La entrada debe normalizarse como en el entrenamiento: minúsculas con reglas turcas (I → ı, İ → i), sin dígitos, puntuación ni apóstrofos.

## Capacidades

- Corrección ortográfica de frases en turco: recibe texto con errores y devuelve la versión corregida.
- Generación de texto seq2seq condicionada a la frase de entrada (pipeline text2text-generation).
- Manejo de errores sintéticos de varios tipos: deleción, inserción, transposición, sustitución, errores vocálicos, errores comunes y palabras divididas.
- Normalización de entrada según reglas turcas de mayúsculas (I → ı, İ → i).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: únicamente turco.
- No corrige gramática, solo ortografía.

## Casos de uso

- Preprocesado de corpus turcos: normalizar textos extraídos de web, OCR o redes sociales antes de indexarlos o entrenar otros modelos, aplicando el modelo frase a frase con truncamiento a 256 tokens.
- Corrección de borradores en editores de texto: integración como paso posterior a la escritura para eliminar erratas tipográficas en turco, con la salvedad de que las letras `ı`, `ğ` e `İ` pueden perderse.
- Limpieza de datasets de Wikipedia en turco: el modelo se entrenó sobre este dominio, por lo que es adecuado para reparar ruido sintético similar al de NoisyWikiTr en pipelines de curación de datos.
- Filtrado de calidad en buscadores: detectar y corregir consultas mal escritas antes de pasarlas al motor de recuperación, siempre que la consulta se normalice previamente.
- Baseline de investigación: punto de partida ligero (77 M de parámetros) para experimentos de corrección ortográfica en lenguas de morfología rica y para comparar con modelos mayores.
- Prototipado en CPU: al ser un modelo de 0,3 GB, permite validar pipelines de corrección ortográfica en entornos sin GPU antes de migrar a un modelo turco específico como trspell-t5-efficient-small.
- Evaluación de tokenizadores: caso de estudio para medir el impacto de un vocabulario inadecuado (SentencePiece inglés) en el rendimiento de una tarea sobre una lengua con caracteres no cubiertos.

## Benchmarks y rendimiento

Resultados en el conjunto de test de NoisyWikiTr (precisión / tasa de corrección de palabras), tabla 5 del artículo:

| Modelo | Ruido uniforme | Ruido realista |
|---|---|---|
| FLAN-T5-small (este modelo) | 0,7013 / 0,4192 | 0,7189 / 0,5483 |
| T5-efficient-TRsmall | 0,7015 / 0,4185 | 0,9688 / 0,8129 |
| JamSpell | 0,9606 / 0,8156 | 0,9500 / 0,6735 |
| Zemberek | 0,9173 / 0,6130 | 0,8770 / 0,4740 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (77 M de parámetros, aproximadamente 0,31 GB de pesos) y en torno a 0,15-0,2 GB en fp16; el consumo real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas, así como en CPU.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), text-generation-inference (el modelo está etiquetado como endpoints_compatible) y exportación a otros runtimes seq2seq; no se documentan pesos GGUF oficiales para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 77 M de parámetros con búsqueda por haces de 5, la latencia por frase será del orden de milisegundos en GPU y decenas de milisegundos en CPU, aunque no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (ruido realista, precisión / corrección) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trspell-flan-t5-small | 76,96 M | no disponible (ejemplo a 256 tokens) | 0,7189 / 0,5483 | no disponible | Hugging Face |
| trspell-t5-efficient-small | no disponible | no disponible | no disponible (recomendado por el autor para uso práctico) | no disponible | Hugging Face |
| JamSpell | no disponible (corrector estadístico, no neuronal) | no aplica | 0,9500 / 0,6735 | no disponible | Repositorio del proyecto |
| Zemberek | no disponible (herramienta NLP turca, no neuronal) | no aplica | 0,8770 / 0,4740 | no disponible | Repositorio del proyecto |

## Limitaciones y advertencias

- El tokenizador no puede representar `ı`, `ğ` ni `İ`: el vocabulario SentencePiece inglés de FLAN-T5 las convierte en `<unk>` y las elimina de la salida (por ejemplo, `yakınsama` → `yaknsama`). Es la causa principal de su menor rendimiento frente al modelo T5 turco.
- El autor recomienda explícitamente usar trspell-t5-efficient-small para uso práctico.
- Entrenado y evaluado con errores sintéticos; el comportamiento sobre erratas reales puede diferir.
- Corrige únicamente ortografía, no gramática.
- La entrada debe normalizarse (minúsculas con reglas turcas, sin dígitos, puntuación ni apóstrofos); no se debe usar prefijo de tarea.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- Riesgo de alucinación: al ser un modelo generativo seq2seq, puede introducir cambios no deseados en frases ya correctas.
- No se han documentado análisis de sesgos en la información disponible.
- Solo soporta turco; no es adecuado para otras lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cguzel/trspell-flan-t5-small
- Artículo: https://doi.org/10.7717/peerj-cs.2889
- Código: https://github.com/cgturhan/trspell
- Dataset NoisyWikiTr: https://huggingface.co/datasets/cguzel/NoisyWikiTr
- Modelo recomendado por el autor: https://huggingface.co/cguzel/trspell-t5-efficient-small
- Modelo base: https://huggingface.co/google/flan-t5-small
