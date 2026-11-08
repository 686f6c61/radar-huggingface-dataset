# Sachin-0001/dec-11M

## Resumen

dec-11M es un modelo de lenguaje autoregresivo de tipo GPT decoder, desarrollado por el usuario de Hugging Face Sachin-0001 (Sachin Suresh). Se trata de un modelo a nivel de caracter (character-level), no de subpalabras, entrenado sobre el libro "AI Engineering" de Chip Huyen. Con aproximadamente 10,84 millones de parametros, esta disenado explicitamente con fines educativos para demostrar la continuacion de texto dentro del dominio de la ingenieria de IA.

El modelo emplea una arquitectura transformer decoder clasica con 6 bloques, 6 cabezas de atencion, dimension de embedding de 384 y una longitud de contexto de 256 caracteres. Su vocabulario consta de 134 caracteres unicos, lo que implica que opera directamente sobre caracteres en lugar de tokens BPE, una eleccion poco habitual en modelos de produccion pero frecuente en ejercicios didacticos.

Su relevancia es limitada fuera del ambito educativo: con 11M de parametros y un corpus de entrenamiento restringido a un unico libro, no compite con modelos de proposito general. Resulta util como referencia para estudiar el pipeline completo de entrenamiento de un transformer desde cero (tokenizacion a nivel de caracter, arquitectura, muestreo autoregresivo) y para reproducir experimentos de continuacion de texto en un dominio acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-style), character-level |
| Parametros totales | ~10,84 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 caracteres (`block_size`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder autoregresivo de 6 bloques con 6 cabezas de atencion y dimension de embedding de 384, implementado en PyTorch. La tokenizacion es a nivel de caracter con un vocabulario de 134 simbolos unicos, y la ventana de contexto es de 256 caracteres. No se especifica en la informacion disponible si emplea atencion causal estandar, normalizacion pre-LN o post-LN, ni detalles sobre inicializacion de pesos o regularizacion.

El corpus de entrenamiento es un unico libro, "AI Engineering" de Chip Huyen, lo que limita el modelo a reproducir el estilo, vocabulario y formato de ese texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica indicacion de generacion es el uso de muestreo con temperatura y top-k.

## Capacidades

- Generacion de texto autoregresiva a nivel de caracter, orientada a continuacion de texto en el dominio de ingenieria de IA.
- Reproduccion del estilo, vocabulario y formato del libro de entrenamiento.
- Capacidad limitada de generar palabras y frases coherentes en ingles.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Multilingue: no; unicamente ingles.
- No incluye modo thinking, vision, audio ni capacidades multimodales.
- No se documenta soporte de instrucciones (no es un modelo instruction-tuned).

## Casos de uso

- Docencia y aprendizaje: sirve como ejemplo completo y reproducible de un transformer decoder entrenado desde cero, util para explicar tokenizacion a nivel de caracter, atencion y muestreo en cursos de IA.
- Experimentos de continuacion de texto en dominio acotado: dado un fragmento sobre ingenieria de IA, el modelo puede continuar el texto imitando el estilo del libro, gracias a su ventana de 256 caracteres.
- Pruebas de infraestructura de inferencia: por su tamano minimo (~0,1 GB de repo), permite validar pipelines de carga de `state dict`, generacion autoregresiva y muestreo top-k sin coste de GPU.
- Generacion de texto sintetico de estilo tecnico: util para crear ejemplos de relleno con formato similar al corpus, siempre con revision humana dada su tendencia a inventar palabras.
- Estudio de limitaciones de modelos character-level: permite analizar empiricamente por que los modelos a nivel de caracter de baja escala producen palabras inexistentes y pierden coherencia factual.
- Base para fine-tuning educativo: al ser pequeno y de licencia MIT, puede servir como punto de partida para experimentos de ajuste en otros dominios textuales de caracteres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (un modelo de ~10,84M parametros ocupa aproximadamente 43 MB en pesos FP32, mas activaciones y cache de atencion para 256 caracteres).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Cabe en CPU sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: carga manual del `state dict` con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no usar tokenizer estandar de transformers la integracion con esos frameworks requeriria trabajo adicional.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, la generacion en CPU deberia ser interactiva para secuencias de 256 caracteres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Nivel de tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dec-11M | ~10,84 M | 256 caracteres | Caracter | MIT | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | BPE | MIT | Hugging Face |
| TinyStories-1M (variantes) | ~1-10 M | variable | BPE | variable | Hugging Face |
| Modelos character-level tipo nanoGPT | ~10 M | variable | Caracter | MIT | Repositorios publicos |

No se dispone de datos de rendimiento comparativo para dec-11M en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de 11M de parametros: capacidad de razonamiento factual muy limitada y propension a generar palabras inexistentes.
- Entrenado sobre un unico libro: el conocimiento queda restringido al dominio y estilo de "AI Engineering"; fuera de ese dominio la calidad cae drasticamente.
- Tokenizacion a nivel de caracter: mayor coste por caracter y menor eficiencia que los tokenizers BPE; la ventana de 256 caracteres equivale a muy poco texto.
- Solo ingles; no soporta castellano ni otros idiomas.
- Riesgo elevado de alucinacion y de texto incoherente a partir de pocos caracteres de contexto.
- Sin instruction tuning: no sigue instrucciones de forma fiable.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para produccion por su calidad y escala.
- No se documentan sesgos especificos, pero al derivar de un unico texto tecnico en ingles hereda su sesgo tematico y estilistico.
- El formato de pesos es un `state dict` de PyTorch que requiere recrear la arquitectura manualmente; no es plug-and-play con `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sachin-0001/dec-11M
- Perfil del autor: https://huggingface.co/Sachin-0001
- Otro modelo del autor (referencia): https://huggingface.co/Sachin-0001/dialogsum-t5-small
