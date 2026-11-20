# mlc-ai/LFM3-1.7B-q4f16_1-MLC

## Resumen

LFM3-1.7B-q4f16_1-MLC es la conversión al formato MLC (`q4f16_1`) del modelo LiquidAI/LFM3-1.7B, realizada por el equipo de mlc-ai. No se trata de un modelo nuevo, sino de un artefacto de despliegue empaquetado con la librería MLC-LLM, pensado para ejecutar el modelo base de Liquid AI en entornos con aceleración WebGPU (navegador mediante WebLLM) y en otros backends compatibles con MLC. El repositorio ocupa aproximadamente 1,0 GB, coherente con una cuantización de 4 bits de un modelo de 1.700 millones de parámetros.

El modelo base, LFM3-1.7B, pertenece a la familia LFM3 de Liquid AI y está publicado bajo la LFM Open License v1.0. La conversión declara una configuración de contexto de 262.144 tokens con fragmentos de prefill de 256 tokens, aunque el contexto por defecto en WebLLM se limita a 4.096 tokens. Esta diferencia es clave para entender el comportamiento real en producción: el límite efectivo depende de la aplicación anfitriona y de la memoria disponible en el dispositivo.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el artefacto MLC es adecuado para despliegues en cliente (navegador, edge) sin necesidad de infraestructura GPU dedicada, así como conocer sus restricciones: dependencia de shader-f16 en WebGPU, licencia no estándar y ausencia de datos publicados de benchmarks o idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B de Liquid AI; la conversión MLC no detalla la arquitectura interna) |
| Parametros totales | 1,7 mil millones (según el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en la configuración MLC; 4.096 tokens por defecto en WebLLM |
| Tipos de cuantizacion | q4f16_1 (pesos en 4 bits, activaciones en float16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | MLC (artefacto compilado para MLC-LLM; no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-1.7B ni su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el proceso de conversión: el modelo original de Liquid AI se ha transformado al formato MLC `q4f16_1` mediante el soporte de LFM3 incluido en MLC-LLM. Esta conversión implica una cuantización de pesos a 4 bits con activaciones en float16, orientada a reducir el uso de memoria y permitir la inferencia en GPUs de consumo y en navegadores.

El artefacto declara una configuración de contexto de 262.144 tokens y fragmentos de prefill de 256 tokens, un parámetro típico de MLC-LLM para gestionar la memoria durante la fase de prefill. En WebGPU se requiere soporte de `shader-f16`, lo que condiciona los dispositivos compatibles. No se han publicado detalles sobre innovaciones técnicas del modelo base (atención lineal, decodificación especulativa, etc.) en la información proporcionada.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que la capacidad principal es la generación autoregresiva de texto.
- Razonamiento y código: no se documentan capacidades específicas de razonamiento, matemáticas o generación de código en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está relleno en la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Despliegue en navegador: capacidad destacada del artefacto MLC, que permite ejecución vía WebLLM con WebGPU.

## Casos de uso

- Asistente de texto en navegador: el artefacto MLC permite ejecutar el modelo directamente en el cliente mediante WebLLM y WebGPU, sin enviar datos a un servidor. Es adecuado para aplicaciones de privacidad estricta donde el texto no debe salir del dispositivo.
- Prototipado rápido de chatbots: gracias a la integración con MLC-LLM, se puede desplegar un chatbot de generación de texto en pocas líneas de código, con contexto por defecto de 4.096 tokens, suficiente para conversaciones multi-turno breves.
- Demos educativas y workshops: el formato MLC y el tamaño de 1,7B permiten ejecutar el modelo en portátiles con GPU integrada compatible con WebGPU, lo que facilita talleres sin infraestructura cloud.
- Aplicaciones offline en edge: en escenarios con conectividad intermitente, el modelo puede empaquetarse en una aplicación web progresiva y funcionar sin red, siempre que el dispositivo soporte `shader-f16`.
- Generación de texto auxiliar en herramientas de escritorio: integrable en editores o IDE mediante MLC-LLM como backend local para autocompletado o resúmenes, aunque sin garantías documentadas de calidad en código.
- Filtrado y clasificación de texto en cliente: uso del modelo para tareas ligeras de etiquetado o reformulación en el navegador, aprovechando la cuantización q4f16_1 para reducir el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,0 GB, lo que da una cota inferior del espacio necesario para los pesos cuantizados. A ello hay que sumar la memoria para el contexto y el runtime de MLC, no cuantificada en la información disponible.
- GPU recomendadas: no se especifican modelos concretos. El requisito documentado es soporte de WebGPU con `shader-f16` para el despliegue en navegador.
- GPU de consumo: por el tamaño (1,7B en 4 bits), es plausible que quepa en GPUs de consumo modernas, pero no se confirma en la información disponible.
- Opciones de despliegue: MLC-LLM y WebLLM son los backends documentados. No se indica soporte de vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-q4f16_1-MLC | 1,7B | 262.144 (config. MLC); 4.096 por defecto en WebLLM | MLC q4f16_1 | LFM Open License v1.0 | Hugging Face (mlc-ai) |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible en esta ficha | no disponible | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| Alternativas de 1-2B en formato MLC | no disponible | no disponible | MLC | variable | no disponible |

No se dispone de datos de rendimiento comparado ni de otras alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no estándar: LFM Open License v1.0 puede imponer restricciones adicionales al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- Contexto efectivo limitado en WebLLM: aunque la configuración MLC declara 262.144 tokens, el valor por defecto en WebLLM es de 4.096 tokens, lo que reduce drásticamente la ventana útil en aplicaciones de navegador.
- Dependencia de WebGPU y `shader-f16`: los dispositivos sin soporte de shader-f16 no podrán ejecutar el modelo en navegador.
- Ausencia de datos de benchmarks: no hay evidencia publicada en la información disponible sobre calidad, sesgos o alucinación del modelo base.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe sin datos del autor.
- Artefacto de conversión, no modelo original: cualquier problema de calidad debe atribuirse al modelo base LiquidAI/LFM3-1.7B, no al repositorio de mlc-ai.
- Sin métricas de latencia ni throughput: no es posible estimar el rendimiento en producción a partir de la información disponible.

## Enlaces

- Hugging Face (artefacto MLC): https://huggingface.co/mlc-ai/LFM3-1.7B-q4f16_1-MLC
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revisión concreta del modelo base citada en la model card: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/1da06bec6a819da10b54c67e5c90972b46d81871
- Repositorio MLC-LLM: no disponible en la información proporcionada
- WebLLM: no disponible en la información proporcionada
