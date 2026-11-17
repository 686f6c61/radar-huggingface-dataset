# indranildev/friday-mini-17m-rehearsal

## Resumen

friday-mini-17m-rehearsal es un modelo de lenguaje de tamano muy reducido (17.234.304 parametros) desarrollado por el usuario indranildev, concebido como un ejercicio educativo de implementacion de un transformer desde cero en PyTorch puro. No se trata de un modelo orientado a produccion, sino de una pieza didactica que reproduce manualmente los componentes esenciales de un LLM moderno (atencion, RoPE, RMSNorm, SwiGLU y optimizador AdamW) sobre la arquitectura Llama.

El modelo esta especializado en contenido del universo Marvel: se entreno con texto de Wikipedia y de wikis de fans (Marvel Database y MCU Wiki, bajo licencia CC BY-SA 4.0) junto con pares de pregunta-respuesta generados con Google Gemini. Su formato de prompt es `<|user|>Who is Thor?<|assistant|>`, con token BOS anadido automaticamente.

Es relevante ahora como referencia practica para quienes quieren entender la anatomia interna de un LLM sin depender de frameworks de alto nivel, y como ejemplo de modelo ultraligero desplegable en Ollama. No obstante, su tamano limita severamente la fidelidad factual: el propio autor advierte que inventara hechos poco frecuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (atencion, RoPE, RMSNorm, SwiGLU) implementado desde cero en PyTorch |
| Parametros totales | 17.234.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo incluye safetensors y GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama: transformer decoder-only con atencion multi-cabeza, codificacion posicional rotatoria (RoPE), normalizacion RMSNorm y capa feed-forward con activacion SwiGLU. La implementacion es manual en PyTorch puro, sin librerias de modelado de alto nivel, lo que constituye el principal valor tecnico del proyecto. El entrenamiento empleo el optimizador AdamW.

Los datos de entrenamiento combinan texto de Wikipedia y de las wikis de fans Marvel Database y MCU Wiki (licenciadas CC BY-SA 4.0), mas pares de pregunta-respuesta generados con Google Gemini. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. El modelo no esta afiliado ni respaldado por Marvel/Disney.

## Capacidades

- Generacion de texto en ingles sobre tematica Marvel (personajes, tramas, universo cinematografico).
- Respuesta a preguntas en formato de chat mediante la plantilla `<|user|>...<|assistant|>`.
- Razonamiento basico de conversacion de un solo turno o multi-turno corto.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No dispone de vision, audio ni modo de pensamiento explicito.
- Despliegue sencillo en Ollama mediante Modelfile.

## Casos de uso

- Aprendizaje de arquitecturas LLM: sirve como referencia ejecutable para estudiar atencion, RoPE, RMSNorm y SwiGLU implementados a mano, al poder inspeccionarse cada modulo en el codigo fuente.
- Docencia y talleres: permite entrenar y ejecutar un modelo completo en hardware modesto, ideal para cursos introductorios de deep learning.
- Prototipado de chatbots tematicos: un asistente de trivia Marvel para demos o entornos de prueba donde la precision factual no sea critica.
- Pruebas de pipelines de despliegue: al ofrecer pesos en safetensors y GGUF, sirve para validar flujos de conversion, cuantizacion y servido con Ollama antes de escalar a modelos mayores.
- Experimentacion con formatos de prompt: util para comparar plantillas de chat y tecnicas de tokenizacion en un modelo pequeno y rapido de iterar.
- Generacion de texto creativo de fans: relatos cortos o descripciones inspiradas en el universo Marvel para proyectos no comerciales bajo CC BY-SA 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizacion de 8 bits o menor; el modelo en precision completa (FP32) ocupa aproximadamente 69 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 3050 y superiores; incluso en Raspberry Pi o moviles con llama.cpp.
- Opciones de despliegue: Ollama (soporte documentado por el autor), llama.cpp (pesos GGUF disponibles), y cualquier runtime compatible con safetensors.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera latencia de milisegundos en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| friday-mini-17m-rehearsal | 17,2 M | no disponible | CC BY-SA 4.0 | Hugging Face, GGUF, Ollama |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Hugging Face, GGUF |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | Hugging Face, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face, GGUF |

La comparativa se limita a modelos de la misma categoria de tamano ultrarreducido; no se dispone de datos de rendimiento comparativo para friday-mini-17m-rehearsal.

## Limitaciones y advertencias

- Modelo de 17 M de parametros: la capacidad de memorizacion y razonamiento es muy limitada; el autor advierte explicitamente que inventara hechos poco frecuentes.
- Riesgo alto de alucinacion en datos concretos (fechas, nombres secundarios, detalles de tramas).
- Entrenado unicamente en ingles; no soporta castellano de forma fiable.
- Sesgos potenciales derivados de las fuentes (wikis de fans y texto generado por Gemini), no evaluados ni documentados.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia.
- No afiliado a Marvel/Disney; el uso del contenido tematico puede estar sujeto a derechos de marca de terceros.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas.
- No recomendado para produccion ni para aplicaciones donde la precision factual sea requisito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/indranildev/friday-mini-17m-rehearsal
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
