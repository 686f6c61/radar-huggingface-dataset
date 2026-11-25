# kisson2000/Qwen3.5-2B-Base-MED-ChatVector

## Resumen

Qwen3.5-2B-Base-MED-ChatVector es un checkpoint publicado en Hugging Face por el usuario kisson2000 bajo el identificador `kisson2000/Qwen3.5-2B-Base-MED-ChatVector`. Por el nombre se deduce que parte de una base Qwen3.5 de 2B parametros y que incorpora algun tipo de ajuste orientado a dominio medico ("MED") y un componente de tipo "ChatVector", una tecnica de edicion de pesos que consiste en sumar a un modelo base el vector de diferencias entre un modelo instruido y su version base para inducir comportamiento conversacional sin reentrenar. El repositorio incluye 2.213.241.664 parametros reales en formato safetensors y ocupa 4,4 GB.

La model card es la plantilla autogenerada de transformers y no aporta informacion sobre datos de entrenamiento, licencia, idiomas ni evaluacion. No hay descargas ni likes en el momento de redactar esta ficha, y el modelo se creo y actualizo con un minuto de diferencia el 25 de noviembre de 2026, lo que sugiere una publicacion de prueba o experimental mas que un lanzamiento estable. El pipeline declarado es `image-text-to-text`, lo que indica que el checkpoint incluye pesos multimodales (vision-lenguaje) heredados de la arquitectura Qwen3.5, aunque no se documenta el proyector visual ni el preprocesador asociado.

Su relevancia practica es limitada pero interesante como caso de estudio: muestra como se puede componer un modelo de dominio especializado (medico) con un ChatVector sobre una base pequena de 2B, un enfoque de bajo coste para obtener un asistente conversacional tematico que quepa en hardware de consumo. Cualquier uso en produccion exige, no obstante, validacion independiente, dado el vacio documental del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (familia Qwen3.5, tag `qwen3_5`); multimodal image-text-to-text segun pipeline |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; al ser safetensors en bf16/fp16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible (heredados de la base Qwen3.5, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 4,4 GB |
| Tipo de ajuste | fine-tuning de dominio medico + ChatVector (segun nombre del modelo) |
| Fecha de publicacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5, con 2,2B parametros, empaquetado para `transformers` y con soporte declarado de entrada imagen-texto, lo que implica la presencia de un encoder o proyector visual ademas del decodificador de lenguaje. El tag `qwen3_5` confirma la familia, pero no se especifican numero de capas, dimension oculta, cabezas de atencion ni mecanismos de atencion (lineal, GQA, etc.) en la informacion disponible.

El entrenamiento no esta documentado. Por el nombre se infiere una combinacion de dos etapas: (1) un ajuste fino supervisado sobre datos medicos ("MED") a partir de una base Qwen3.5-2B-Base, y (2) la aplicacion de un ChatVector, es decir, la suma del vector de tarea (pesos de un modelo instruido menos su base) al modelo medico para conferirle estilo conversacional y seguimiento de instrucciones. No hay datos sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO, hiperparametros ni infraestructura de computo. Tampoco se indica si el componente multimodal fue reentrenado o simplemente heredado.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline `conversational` declarado.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), presumiblemente descripcion de imagenes y respuesta a preguntas visuales.
- Razonamiento y conocimiento de dominio medico por el ajuste "MED" indicado en el nombre, sin evaluacion publica que lo respalde.
- Soporte de tool calling / function calling: no confirmado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Multilingue: no confirmado; probable herencia del tokenizador y vocabulario de Qwen3.5, pero sin lista oficial.
- Modo thinking o razonamiento extendido: no disponible.
- Compatibilidad con endpoints (`endpoints_compatible`): el checkpoint puede servirse en la infraestructura de Inference Endpoints de Hugging Face.

## Casos de uso

- Prototipado de asistentes clinicos de bajo coste: el modelo cabe en una unica GPU de consumo en bf16 (~4,4 GB de pesos), lo que permite montar un prototipo de triaje o FAQ medica en local antes de invertir en modelos mayores; requiere validacion clinica previa a cualquier uso real.
- Investigacion sobre ChatVectors: sirve como caso reproducible para estudiar como la suma de un vector conversacional afecta al comportamiento de un modelo de dominio, comparando respuestas antes y despues del ajuste.
- Extraccion de informacion de informes medicos con OCR previo: combinando el pipeline image-text-to-text con un motor OCR, puede emplearse para resumir o estructurar documentos escaneados en un entorno controlado.
- Educacion y simulacion de casos clinicos: generacion de dialogos de practica para estudiantes de medicina, con supervision humana y sin uso diagnostico.
- Base para fine-tuning posterior: al ser un checkpoint de 2,2B en safetensors, es un punto de partida barato para ajustes LoRA especificos (por especialidad, idioma o formato de salida).
- Despliegue en el borde o en entornos con requisitos de privacidad: al poder ejecutarse en una sola GPU consumer, permite procesar datos sensibles sin salir de la infraestructura local, siempre que se resuelva la ambiguedad de licencia.
- Evaluacion comparativa de tecnicas de edicion de pesos: util en laboratorios que comparan ChatVector frente a DPO o SFT completo en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~4,5-5 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 1-2 GB adicionales con contexto moderado).
- VRAM estimada en cuantizacion 8 bits: ~2,5-3 GB; en 4 bits (GGUF Q4_K_M): ~1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, L4, A10G). Para servir con concurrencia alta se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores con cuantizacion, y en 8-12 GB en precision completa con contexto corto.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText`/`AutoModelForCausalLM` segun la variante, vLLM (si la arquitectura `qwen3_5` esta soportada en la version instalada), TGI, llama.cpp/Ollama tras conversion a GGUF. La compatibilidad exacta con vLLM y llama.cpp no esta verificada.
- Latencia y throughput: no disponibles; para un 2B denso en una RTX 4090 se puede esperar del orden de decenas a cientos de tokens por segundo, pero no hay medicion publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base-MED-ChatVector (este) | 2,2B | no disponible | si (image-text-to-text) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (version oficial) | no | Apache 2.0 | ampliamente disponible |
| Gemma 2 2B Instruct | 2,6B | 8.192 tokens | no | Gemma Terms of Use | ampliamente disponible |
| Phi-3-mini (3,8B) | 3,8B | 4.096/128.000 tokens segun variante | no | MIT | ampliamente disponible |

La comparativa es aproximada: no existen datos publicos de rendimiento para este checkpoint, y su licencia e idiomas no estan declarados, lo que lo situa por debajo de las alternativas oficiales en trazabilidad y garantias de uso comercial.

## Limitaciones y advertencias

- Model card autogenerada sin informacion sustantiva: no hay datos de entrenamiento, evaluacion, sesgos ni limitaciones declaradas por el autor.
- Licencia no especificada: no se puede asumir uso comercial permitido; hay que contactar con el autor o asumir riesgo legal.
- Riesgo alto de alucinacion en dominio medico: un ajuste fino sobre 2,2B sin evaluacion publica no garantiza precision clinica; no debe usarse para diagnostico, prescripcion ni decisiones terapeuticas.
- El termino "MED" en el nombre no esta respaldado por documentacion sobre la procedencia de los datos medicos, lo que impide verificar su calidad, cobertura y posibles sesgos poblacionales.
- Idiomas no declarados: aunque probablemente herede el multilingue de Qwen3.5, no hay confirmacion; el rendimiento en castellano es incierto.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla empiricamente.
- Naturaleza experimental: creado y actualizado en un minuto, sin descargas ni likes, sugiere un checkpoint de prueba; no hay garantia de mantenimiento ni de que los pesos esten completos y coherentes.
- Compatibilidad de tooling incierta: la arquitectura `qwen3_5` puede no estar soportada aun en versiones estables de vLLM, llama.cpp u otros motores, lo que obliga a probar el stack antes de desplegar.
- El componente multimodal no esta documentado: se desconoce que proyector visual usa, que resolucion admite y como se debe preprocesar la imagen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kisson2000/Qwen3.5-2B-Base-MED-ChatVector
- Paper citado en los tags (Machine Learning Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact
- No se han encontrado en la busqueda web papers, blogs, repos adicionales ni demos especificos de este checkpoint.
