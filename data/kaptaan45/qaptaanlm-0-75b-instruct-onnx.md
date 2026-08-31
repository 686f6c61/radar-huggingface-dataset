# kaptaan45/QaptaanLM-0.75B-Instruct-ONNX

## Resumen

QaptaanLM-0.75B-Instruct-ONNX es la exportación oficial en formato ONNX del modelo QaptaanLM-0.75B-Instruct, desarrollado por kaptaan45. Este modelo base es un ajuste fino (fine-tuning) de Qwen3.5-0.8B-Base, orientado a generación de código, razonamiento técnico y seguimiento de instrucciones. La versión ONNX está optimizada para ejecución en el lado del cliente, especialmente en navegadores mediante WebGPU y Transformers.js, así como para despliegue en servidores con ONNX Runtime.

El modelo tiene aproximadamente 0.75 mil millones de parámetros y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en la posibilidad de ejecutar un modelo de instrucción y código directamente en el navegador, sin necesidad de infraestructura de servidor, lo que abre casos de uso de privacidad y baja latencia. La arquitectura exacta no está documentada en la información disponible, aunque los tags sugieren atención lineal (linear-attention), una innovación que reduce la complejidad computacional frente a la atención estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren linear-attention) |
| Parametros totales | 0.75B (aproximadamente, según el nombre) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea fp32) |
| Idiomas soportados | ingles (en), codigo (code) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (Opset 17), safetensors para el tokenizador |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags de HuggingFace incluyen "linear-attention", lo que sugiere que el modelo emplea algun mecanismo de atencion lineal en lugar de la atencion softmax clasica, reduciendo el coste computacional con secuencias largas. Sin embargo, no se confirma si se trata de un transformer estandar con atencion lineal o de una arquitectura hibrida.

El entrenamiento se realizo en dos fases segun el repositorio de GitHub asociado: un ajuste fino supervisado (SFT) sobre Qwen3.5-0.8B-Base, utilizando el dataset KapInstruct-100M, un conjunto de 100 millones de tokens de instrucciones curado para modelos compactos. No se menciona el uso de RLHF o DPO. El dataset esta formateado con la plantilla ChatML de Qwen y tokenizado con el tokenizador de Qwen3.5-0.8B-Base.

## Capacidades

- Generacion de texto y conversacion siguiendo instrucciones en formato ChatML.
- Generacion de codigo en multiples lenguajes (Python, JavaScript, etc.) y razonamiento tecnico.
- Soporte de tool calling y function calling: no se menciona explicitamente, pero al estar basado en Qwen3.5, es probable que herede capacidades de llamada a herramientas, aunque no esta confirmado.
- Capacidad de ejecucion en navegador via WebGPU y Transformers.js, lo que permite inferencia local sin servidor.
- Soporte de agentes y razonamiento multi-paso: no documentado, pero el entrenamiento en instrucciones tecnicas sugiere cierta capacidad.
- Multilingue: limitado a ingles y codigo, segun la ficha.

## Casos de uso

- Asistente de codigo en el navegador: un IDE web puede cargar el modelo ONNX y ofrecer autocompletado o generacion de funciones sin enviar datos a un servidor, garantizando privacidad del codigo fuente.
- Chatbot local para soporte tecnico: integrado en una aplicacion de escritorio o web, responde preguntas sobre programacion y depuracion con baja latencia al ejecutarse en la GPU del usuario.
- Generacion de documentacion tecnica: a partir de fragmentos de codigo, el modelo puede redactar comentarios o explicaciones, aprovechando su entrenamiento en instrucciones.
- Educacion y aprendizaje de programacion: como tutor interactivo que explica conceptos y corrige ejercicios, ejecutable en dispositivos con WebGPU.
- Prototipado rapido de scripts: en entornos de desarrollo sin conexion, el modelo genera esqueletos de funciones o algoritmos a partir de descripciones en lenguaje natural.
- Despliegue en servidores con ONNX Runtime: para servicios de generacion de codigo a gran escala, utilizando CUDA o CPU, con la ventaja de un formato estandar y optimizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para este modelo.

## Requisitos de hardware

- Al ser un modelo de 0.75B, la VRAM necesaria para inferencia en fp32 es de aproximadamente 3 GB, aunque no se confirma el tamaño exacto de los pesos.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y tambien en CPU gracias a ONNX Runtime.
- En navegador, requiere un dispositivo compatible con WebGPU (Chrome, Edge, Firefox recientes) y una GPU con soporte para compute shaders.
- Opciones de despliegue: Transformers.js (navegador), ONNX Runtime (Python, C++, C#), llama.cpp si se convierte a GGUF (existe una version GGUF del modelo base).
- Latencia y throughput: no disponibles, pero al ser un modelo pequeno, se espera una generacion de decenas de tokens por segundo en GPU moderna, aunque no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QaptaanLM-0.75B-Instruct-ONNX | 0.75B | no disponible | Apache 2.0 | ONNX | Fine-tuning de Qwen3.5-0.8B-Base |
| Qwen2.5-0.5B-Instruct | 0.5B | 32K | Apache 2.0 | safetensors, GGUF | Modelo base de referencia, sin fine-tuning especifico para codigo |
| Llama-3.2-1B-Instruct | 1.0B | 128K | Llama 3.2 Community | safetensors, GGUF | Mayor tamano y contexto, pero licencia con restricciones para uso comercial |

La comparativa se basa en parametros y licencia, ya que no hay datos de rendimiento publicados para QaptaanLM. Qwen2.5-0.5B es una alternativa mas pequena y con contexto largo, mientras que Llama-3.2-1B ofrece mas capacidad pero con una licencia mas restrictiva.

## Limitaciones y advertencias

- Al ser un modelo de 0.75B, su capacidad de razonamiento complejo y generacion de codigo extenso es limitada en comparacion con modelos mayores; puede producir errores sintacticos o logicos en tareas avanzadas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en dominios fuera de su entrenamiento.
- Idiomas: solo soporta ingles y codigo; no se recomienda para otros idiomas.
- Contexto: la longitud de contexto no esta documentada; se desconoce si maneja secuencias largas de forma eficiente, aunque la atencion lineal podria ayudar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base tiene su propia licencia (Apache 2.0 tambien, segun la informacion), por lo que no hay restricciones adicionales conocidas.
- Para produccion, es necesario validar el comportamiento del modelo en tareas especificas y considerar la posibilidad de sesgos en el dataset de entrenamiento, que no se han documentado.

## Enlaces

- Modelo ONNX en HuggingFace: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-Instruct-ONNX
- Modelo base (GGUF): https://huggingface.co/kaptaan45/QaptaanLM-0.75B-Instruct-GGUF
- Repositorio de entrenamiento en GitHub: https://github.com/rudy-07/QaptaanLM-0.75B
- Dataset de instrucciones KapInstruct-100M: https://www.kaggle.com/datasets/kaptaan45/kapinstruct-100m
