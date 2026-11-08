# Dev-in-the-BM/SmolLM2-135M-Instruct-IQ4_NL-GGUF

## Resumen

SmolLM2-135M-Instruct-IQ4_NL-GGUF es una cuantización en formato GGUF del modelo SmolLM2-135M-Instruct desarrollado originalmente por Hugging Face (equipo HuggingFaceTB). Este repositorio, publicado por el usuario Dev-in-the-BM, convierte los pesos originales a cuantización IQ4_NL (4 bits, non-linear) mediante la herramienta GGUF-my-repo de ggml.ai sobre llama.cpp, e incorpora una matriz de importancia (imatrix) para mejorar la calidad de la cuantización. El resultado es un checkpoint de aproximadamente 0,1 GB pensado para inferencia local en entornos con recursos muy limitados.

El modelo base es un transformer decoder-only de 134.515.008 parámetros (unos 135M), diseñado para ejecutarse en dispositivo (on-device), con capacidades de instrucción y conversación. Su relevancia radica en que permite desplegar un modelo conversacional en hardware de gama muy baja (CPU, móviles, Raspberry Pi o GPUs integradas) sin necesidad de infraestructura de servidor, a costa de una capacidad de razonamiento y conocimiento muy limitada en comparación con modelos de mayor tamaño.

Esta ficha describe tanto el artefacto cuantizado como el modelo base del que deriva, ya que la model card del repositorio remite explícitamente a la ficha original para los detalles de entrenamiento y evaluación. No se dispone de datos de benchmarks específicos para esta cuantización en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2) |
| Parametros totales | 134.515.008 (135M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servidor usa -c 2048) |
| Tipos de cuantizacion | IQ4_NL (4 bits non-linear) con imatrix; el repositorio base ofrece otras variantes GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo smollm2-135m-instruct-iq4_nl-imat.gguf); el modelo base tambien en safetensors, ONNX y transformers.js |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de 135M parámetros perteneciente a la familia SmolLM2 (que incluye variantes de 135M, 360M y 1.7B). Según la información disponible, SmolLM2 presenta avances significativos respecto a SmolLM1 en seguimiento de instrucciones, conocimiento y razonamiento. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos deben consultarse en la model card original de HuggingFaceTB/SmolLM2-135M-Instruct.

La innovación técnica de este repositorio concreto no reside en la arquitectura, sino en el proceso de cuantización: la conversión a GGUF se realizó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, empleando cuantización IQ4_NL asistida por imatrix (matriz de importancia), una técnica que pondera los pesos según su relevancia para preservar la calidad en precisiones bajas. El resultado es un archivo de aproximadamente 0,1 GB apto para llama.cpp.

## Capacidades

- Generación de texto en inglés con modo conversacional e instrucciones (pipeline text-generation, tag conversational).
- Seguimiento de instrucciones básico, mejorado respecto a SmolLM1 según la información del modelo base.
- Razonamiento y conocimiento limitados, propios de un modelo de 135M parámetros.
- Ejecución en dispositivo mediante llama.cpp (CLI y servidor), transformers, ONNX y transformers.js.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según el campo language del repositorio.

## Casos de uso

- Prototipado rápido en local: usar llama-cli o llama-server con el archivo GGUF para validar pipelines de generación de texto sin depender de APIs externas, gracias a su tamaño de 0,1 GB.
- Inferencia en dispositivos de borde: desplegar el modelo en Raspberry Pi, móviles o CPUs modestas donde un modelo de 135M en 4 bits cabe holgadamente en memoria.
- Aplicaciones educativas y demos: ilustrar el funcionamiento de un LLM cuantizado en talleres o cursos, con tiempos de carga mínimos.
- Generación de texto de relleno o autocompletado simple: tareas de baja exigencia cognitiva donde la latencia importa más que la calidad, como sugerencias cortas o plantillas.
- Pruebas de integración con llama.cpp: validar flujos de CI/CD o scripts que consumen un servidor llama-server compatible con la API de OpenAI antes de escalar a modelos mayores.
- Experimentación con cuantización: comparar la calidad de IQ4_NL con imatrix frente a otras cuantizaciones del mismo modelo base para estudiar el impacto de la precisión reducida.
- Chatbot de juguete o asistente embebido: conversaciones multi-turno muy acotadas en inglés dentro de aplicaciones de escritorio o web vía transformers.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,1 GB para los pesos IQ4_NL, más overhead de contexto y del runtime de llama.cpp (habitualmente unos cientos de MB adicionales).
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con al menos 1 GB de memoria libre es suficiente (GTX 1050, GTX 1650, iGPU modernas).
- Cabe en cualquier GPU de consumo actual y en la mayoría de SoC y dispositivos móviles.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por herencia del modelo base también transformers, ONNX y transformers.js; no se documenta soporte específico de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-IQ4_NL-GGUF (este) | 135M | no disponible | Apache 2.0 | GGUF IQ4_NL | Cuantizacion comunitaria con imatrix |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible | Apache 2.0 | safetensors, ONNX | Modelo base oficial de Hugging Face |
| professorf/SmolLM-135M-Instruct-gguf | 135M | no disponible | no disponible en la informacion | GGUF | Cuantizacion comunitaria de SmolLM1 |
| SmolLM2-360M-Instruct | 360M | no disponible | Apache 2.0 | safetensors y GGUF | Variante mayor de la misma familia, mayor calidad a costa de mas recursos |

## Limitaciones y advertencias

- Capacidad cognitiva muy limitada por su tamaño (135M parámetros): propenso a errores factuales, razonamiento superficial y baja coherencia en tareas complejas.
- Riesgo elevado de alucinación, especialmente en preguntas de conocimiento o generación de código y matemáticas.
- Solo soporta inglés; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- La cuantización IQ4_NL introduce una pérdida adicional de calidad frente a los pesos originales en safetensors, aunque mitigada por el uso de imatrix.
- No se documentan en la información disponible capacidades de tool calling ni de agentes, por lo que no debe asumirse su viabilidad en producción para esos fines.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la model card del modelo base para condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto comunitario sin validación amplia, por lo que se recomienda evaluar su calidad antes de usarlo en producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Dev-in-the-BM/SmolLM2-135M-Instruct-IQ4_NL-GGUF
- Modelo base oficial: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Cuantización comunitaria alternativa de SmolLM1: https://huggingface.co/professorf/SmolLM-135M-Instruct-gguf
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
