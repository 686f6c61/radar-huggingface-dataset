# shambhuraje/Llama-3.2-1B-no-robots-GGUF

## Resumen

Llama-3.2-1B-no-robots-GGUF es un ajuste fino (fine-tune) del modelo meta-llama/Llama-3.2-1B-Instruct, desarrollado por el usuario shambhuraje. El objetivo declarado es producir un modelo de 1B de parametros con un tono mas natural y menos "asistencial", entrenado sobre conversaciones escritas por humanos del dataset HuggingFaceH4/no_robots. Se distribuye unicamente en formato GGUF cuantizado Q4_K_M, pensado para ejecutarse en hardware muy modesto (CPU, portatiles o dispositivos de gama baja).

El modelo conserva la arquitectura transformer decoder-only de Llama 3.2 y el tokenizador de Meta, pero el ajuste fino se realizo con QLoRA de 4 bits sobre la copia cuantizada de Unsloth, con 500 pasos de entrenamiento, LoRA de rango 16 y una longitud de contexto de entrenamiento de 1024 tokens. Todo el entrenamiento cupo en una unica GPU RTX 2050 con 4 GB de VRAM, lo que ilustra el caracter experimental y de bajo coste del proyecto.

Su relevancia es limitada pero concreta: demuestra que es posible personalizar el estilo conversacional de un modelo pequeno con recursos minimos, y ofrece una alternativa ligera para prototipos de chat en ingles. No obstante, al no haberse evaluado en benchmarks formales y al estar restringido a uso no comercial por la licencia del dataset, debe considerarse una pieza de experimentacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino QLoRA |
| Parametros totales | 1.235.814.432 (~1,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento; contexto nativo del base no especificado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License; uso no comercial por la licencia del dataset (CC BY-NC 4.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-1B-Instruct, un transformer decoder-only de aproximadamente 1,24 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado con QLoRA de 4 bits usando las herramientas de Unsloth. La configuracion concreta fue: 500 pasos, LoRA de rango 16 y alpha 16, dropout 0, aplicado a todas las capas lineales, learning rate de 2e-4 con scheduler coseno, batch efectivo de 8 (1 x 8 de acumulacion de gradientes) y longitud de contexto de 1024 tokens. El entrenamiento se ejecuto en una sola RTX 2050 con 4 GB de VRAM.

El dataset utilizado es HuggingFaceH4/no_robots, una coleccion de conversaciones escritas por anotadores humanos y disenada para evitar respuestas excesivamente genericas o "roboticas". No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion principal es de caracter practico: un pipeline de fine-tuning reproducible en hardware de consumo, empaquetado directamente como GGUF para inferencia local.

## Capacidades

- Generacion de texto conversacional en ingles con un tono mas natural y menos formal que el modelo base Instruct.
- Dialogo multi-turno basico, limitado por la ventana de contexto de entrenamiento de 1024 tokens.
- Respuestas de estilo humano orientadas a conversacion general, no a tareas tecnicas complejas.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No dispone de vision, audio ni modo "thinking" explicito.
- Razonamiento, matematicas y recuperacion de hechos por debajo de modelos de mayor tamano, segun reconoce el propio autor.

## Casos de uso

- Prototipado de chatbots conversacionales en ingles: el modelo puede mantener dialogos breves y naturales en local, lo que permite iterar sobre guiones y prompts sin coste de API.
- Experimentacion educativa con fine-tuning: sirve como ejemplo reproducible de QLoRA sobre un modelo de 1B entrenado en una GPU de 4 GB, util para cursos y talleres.
- Asistentes embebidos en dispositivos de gama baja: al ocupar aproximadamente 808 MB en Q4_K_M, puede desplegarse en portatiles, mini-PC o telefonos de clase alta mediante llama.cpp u Ollama.
- Generacion de respuestas de estilo humano para pruebas A/B: permite comparar la percepcion de naturalidad frente al Llama-3.2-1B-Instruct original en tareas de redaccion conversacional.
- Simulacion de interlocutores en pruebas de UX: util para generar respuestas variadas en ingles durante el desarrollo de interfaces de chat, siempre que no se requiera precision factual.
- Base para nuevos fine-tunes: al estar publicado en GGUF y derivar de un modelo abierto, puede servir como punto de partida para ajustes adicionales de estilo o dominio en ingles.
- Demos offline de bajo consumo: integrable en aplicaciones de escritorio (LM Studio, Jan) para mostrar generacion de texto sin conexion ni GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no fue evaluado en benchmarks formales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB o menos con la cuantizacion Q4_K_M (archivo de ~808 MB mas overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; el propio entrenamiento se realizo en una RTX 2050 de 4 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable, gracias al formato GGUF y al reducido numero de parametros.
- Opciones de despliegue: Ollama (`ollama run hf.co/shambhuraje/Llama-3.2-1B-no-robots-GGUF:Q4_K_M`), llama.cpp (`llama-cli -hf ... --jinja`), LM Studio y Jan.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-no-robots (este) | ~1,24 B | 1024 en entrenamiento | GGUF Q4_K_M | Llama 3.2 + no comercial (dataset CC BY-NC 4.0) | Fine-tune conversacional en ingles |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | Contexto nativo de Llama 3.2 (no detallado en la informacion disponible) | Safetensors y otras | Llama 3.2 Community License | Modelo base oficial de Meta, mas versatil |
| QuantFactory/Llama-3.2-1B-GGUF | ~1,24 B | Contexto nativo de Llama 3.2 | GGUF (multiples cuantizaciones) | Llama 3.2 Community License | Cuantizacion del base, sin fine-tune de estilo |

## Limitaciones y advertencias

- Modelo de 1B de parametros: razonamiento, matematicas y recuperacion de hechos claramente inferiores a modelos mayores, como admite el autor.
- Entrenado sobre un dataset pequeno y solo en ingles; puede alucinar y producir afirmaciones incorrectas con facilidad.
- Sin evaluacion en benchmarks formales, por lo que no hay evidencia cuantitativa de su calidad frente al modelo base.
- Ventana de contexto de entrenamiento de 1024 tokens: las conversaciones largas o documentos extensos quedan fuera de su alcance practico.
- Restriccion de uso comercial: el dataset no_robots es CC BY-NC 4.0, de modo que el modelo se declara para uso no comercial, ademas de las condiciones de la Llama 3.2 Community License.
- Un unico archivo GGUF (Q4_K_M): no hay variedad de cuantizaciones para ajustar el equilibrio calidad/tamano.
- Proyecto personal con 0 descargas y 1 like en el momento de la consulta; sin mantenimiento ni soporte garantizados.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shambhuraje/Llama-3.2-1B-no-robots-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Cuantizacion GGUF del base (referencia): https://huggingface.co/QuantFactory/Llama-3.2-1B-GGUF
- GitHub del autor: https://github.com/Shambhuraje1919
- Kaggle del autor: https://www.kaggle.com/shambhurajejagadale
- LinkedIn del autor: https://www.linkedin.com/in/shambhuraje-jagadale-939410244/
