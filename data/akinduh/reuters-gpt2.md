# AkinduH/reuters-gpt2

## Resumen
AkinduH/reuters-gpt2 es un modelo de generacion de texto de tipo GPT-2 entrenado desde cero (sin pesos preentrenados) por el usuario AkinduH sobre un corpus de articulos de Reuters. Con 16.504.320 parametros, se trata de un modelo muy pequeno orientado a experimentacion y a la generacion de texto con estilo periodistico en ingles, no a tareas de razonamiento complejo ni a produccion a gran escala.

La arquitectura es un transformer decoder-only clasico de GPT-2 con 4 capas, 4 cabezas de atencion, dimension de embedding de 256 y una ventana de contexto de solo 128 tokens. El vocabulario es de 52.000 tokens y se empleo un tokenizador especifico (`ingeniumacademy/gpt2-reuters-tokenizer`). El entrenamiento consistio en 5 epocas sobre titulos y cuerpos de articulos concatenados, con perdida de validacion de 4,134635 y perplexity de test de 51,698796.

Su relevancia es limitada y fundamentalmente didactica: sirve como ejemplo reproducible de entrenamiento from-scratch de un modelo GPT-2 en un dominio concreto (prensa financiera), util para estudiar el pipeline completo de tokenizacion, entrenamiento y evaluacion, pero sin capacidades competitivas frente a modelos preentrenados del mismo orden de magnitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 16.504.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente float32) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura GPT-2 estandar con 4 capas de transformer, 4 cabezas de atencion y una dimension oculta de 256, lo que da lugar a los 16.504.320 parametros reportados. La ventana de contexto es de 128 tokens y el vocabulario de 52.000 entradas, definido por el tokenizador `ingeniumacademy/gpt2-reuters-tokenizer`. No se cargo ningun peso preentrenado: el entrenamiento partio de inicializacion aleatoria.

El entrenamiento se realizo durante 5 epocas sobre el dataset `ingeniumacademy/reuters_articles`, concatenando titulos y cuerpos de articulos. Se uso AdamW con learning rate 0,0003, weight decay 0,01, batch size 16, semilla 42 y precision float32. Los resultados reportados son perdida de validacion 4,134635, perdida de test 3,945434 y perplexity de test 51,698796. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni el uso de RLHF, DPO o tecnicas de alineacion.

## Capacidades
- Generacion de texto autoregresiva en ingles con estilo periodistico, condicionada a un prompt.
- Continuacion de titulares y cuerpos de noticias, dado el dominio del corpus de entrenamiento.
- Modelado de lenguaje a nivel de token con vocabulario de 52.000 entradas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingue: solo ingles.
- No incluye modo thinking, vision, audio ni capacidades multimodales.
- Contexto muy limitado (128 tokens), lo que restringe tareas de contexto largo.

## Casos de uso
- Experimentacion educativa: reproduccion del pipeline completo de entrenamiento from-scratch de un GPT-2, util para cursos y talleres sobre fundamentos de LLM.
- Generacion de titulares sinteticos de prensa economica: dado un prefijo breve, el modelo puede completar titulares con el estilo del corpus Reuters, siempre con revision humana.
- Aumento de datos para prototipos: generacion de textos de relleno con apariencia periodistica para pruebas de interfaces o pipelines de NLP.
- Pruebas de infraestructura de inferencia: su tamano reducido (0,1 GB) permite validar despliegues con `transformers`, `llama.cpp` o `vLLM` en entornos de desarrollo.
- Analisis de perplexity y comparacion de tokenizadores: sirve como referencia para medir el efecto de vocabularios especificos de dominio en modelos pequenos.
- Investigacion sobre sobreajuste y generalizacion: con solo 5 epocas y un corpus acotado, es util para estudiar dinamicas de entrenamiento en regimen de datos limitados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion | 4,134635 |
| Perdida de test | 3,945434 |
| Perplexity de test | 51,698796 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en float32: aproximadamente 66 MB para los pesos (16,5 M de parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en CPU sin problema.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 3050, RTX 4090 y similares; tambien en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: `transformers` con `GPT2LMHeadModel`, `llama.cpp` (previa conversion a GGUF), `Ollama` (previa conversion), `vLLM` y `TGI` (compatibilidad no verificada, dado el contexto de 128 tokens).
- Latencia y throughput: no disponibles; por el tamano, se espera latencia de milisegundos y throughput muy alto en GPU moderna, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AkinduH/reuters-gpt2 | 16,5 M | 128 | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face |
| distilgpt2 (Hugging Face) | 82 M | 1024 | Apache 2.0 | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1024 | MIT | Hugging Face |

Frente a GPT-2 small o distilgpt2, este modelo es entre 5 y 7 veces mas pequeno, tiene un contexto 8 veces menor y carece de preentrenamiento general, por lo que su rendimiento fuera del dominio Reuters sera muy inferior. Su ventaja es el coste computacional minimo y su valor didactico.

## Limitaciones y advertencias
- Modelo entrenado desde cero con 16,5 M de parametros: capacidad linguistica muy limitada y alta probabilidad de texto incoherente fuera de patrones del corpus.
- Riesgo elevado de alucinacion y de generar contenido facticamente incorrecto con apariencia plausible.
- Contexto de solo 128 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo soporta ingles; no hay capacidades multilingues.
- Sesgos potenciales heredados del corpus de Reuters (sesgo editorial, geografico y tematico), no evaluados ni mitigados.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Sin informacion sobre el volumen de datos de entrenamiento ni sobre posibles duplicados o contaminacion del corpus.
- No apto para produccion en tareas de atencion al cliente, codigo, matematicas o razonamiento.
- El tokenizador es especifico del dominio y puede no ser compatible con herramientas estandar de GPT-2.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AkinduH/reuters-gpt2
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
