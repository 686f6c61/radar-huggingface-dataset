# Miko1331/novashop-support-lora

## Resumen

novashop-support-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Miko1331 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) mediante la librería PEFT sobre el modelo base unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit, que es una version cuantizada a 4 bits en formato bitsandbytes del modelo Meta Llama 3.1 8B Instruct. El nombre del repositorio sugiere un proposito de soporte al cliente para una tienda ("novashop"), aunque la model card no documenta explicitamente el dominio ni los datos de entrenamiento.

El artefacto publicado no contiene pesos completos, sino unicamente los pesos del adaptador LoRA en formato safetensors, con un tamano de repositorio de 0,2 GB. Esto implica que para utilizarlo es necesario cargar el modelo base y aplicar el adaptador mediante PEFT. El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B y su ventana de contexto de 128 000 tokens, aunque la model card no aporta confirmacion adicional.

La relevancia de esta ficha es limitada: se trata de un adaptador de autor individual, sin descargas ni interacciones, con una model card generada a partir de la plantilla por defecto de Hugging Face y practicamente todos los campos sin rellenar. No se dispone de informacion sobre licencia, idiomas, datos de entrenamiento, hiperparametros ni evaluacion. Se documenta aqui lo que puede verificarse a partir de los metadatos y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | No disponible para el adaptador; modelo base: 8 030 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base: 128 000 tokens (no confirmado en la model card) |
| Tipos de cuantizacion | Modelo base en 4 bits (bitsandbytes); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere modelo base en formato transformers/bnb-4bit |
| Libreria | peft 0.21.2, transformers, trl, unsloth |
| Tamano del repositorio | 0,2 GB |
| Tipo de entrenamiento | SFT (supervised fine-tuning) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Meta Llama 3.1 8B Instruct, un transformer decoder-only con atencion por grupos (GQA) y 8 000 millones de parametros, en su version cuantizada a 4 bits mediante bitsandbytes distribuida por Unsloth. El adaptador LoRA congela los pesos del modelo base e introduce matrices de baja dimensionalidad en determinadas capas, lo que reduce drasticamente el numero de parametros entrenables y el coste de ajuste. El repositorio incluye unicamente estos pesos de adaptador, no el modelo completo.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens, la composicion del dataset, la existencia de RLHF o DPO, ni los hiperparametros utilizados (rank del LoRA, alpha, tasa de aprendizaje, numero de epocas). La model card mantiene los campos de la plantilla por defecto sin rellenar. Las etiquetas indican entrenamiento con Unsloth y TRL, lo que sugiere el uso del flujo estandar de SFT de TRL optimizado por Unsloth, pero no hay confirmacion documental.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento, codigo y matematicas basicas a nivel del modelo base.
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no verificado en el adaptador).
- Capacidad multilingue heredada del modelo base (no documentada para el adaptador).
- Especializacion probable en atencion al cliente de una tienda, segun el nombre del repositorio, sin evidencia documental.
- No se documentan modos especiales (thinking, vision, audio) en el adaptador.

## Casos de uso

- Atencion al cliente automatizada en una tienda: el adaptador estaria pensado para responder consultas de soporte (pedidos, devoluciones, productos), aprovechando la ventana de contexto del modelo base para conversaciones multi-turno. Requiere validacion previa, ya que no hay documentacion del entrenamiento.
- Prototipado rapido de asistentes conversacionales: al ser un adaptador ligero de 0,2 GB, permite experimentar con un tono o dominio concreto sin reentrenar el modelo completo.
- Despliegue sobre el modelo base cuantizado: se puede cargar el adaptador junto al modelo base en 4 bits en una GPU de consumo, lo que facilita pruebas en local.
- Investigacion sobre ajuste fino eficiente: sirve como ejemplo de pipeline Unsloth + TRL + PEFT para SFT de bajo coste.
- Generacion de respuestas con contexto largo: si se confirma la ventana de 128 000 tokens del modelo base, podria gestionar historiales extensos de conversacion o documentacion de producto.
- Integracion en pipelines de transformers: al usar PEFT, se puede combinar con otras herramientas del ecosistema Hugging Face para evaluacion o despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits requiere aproximadamente 5-6 GB de VRAM; el adaptador anade una cantidad marginal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100 o H100 para despliegue en produccion con mayor throughput.
- Cabe en GPU de consumo: si, con el modelo base cuantizado a 4 bits.
- Opciones de despliegue: transformers + PEFT, vLLM (con soporte de adaptadores LoRA), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| novashop-support-lora (este) | Adaptador sobre 8B | 128k (heredado) | No disponible | Hugging Face, 0 descargas |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Ampliamente disponible |
| Adaptadores LoRA de dominio publico (genericos) | Variable | Segun base | Variable | Hugging Face |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- Model card sin completar: no hay informacion sobre datos, licencia, idiomas ni evaluacion, lo que impide validar su calidad y uso comercial.
- Licencia no disponible: no puede asumirse uso comercial; ademas, el modelo base Llama 3.1 tiene su propia licencia comunitaria que condiciona la redistribucion.
- Riesgo de alucinacion heredado del modelo base, agravado por la falta de evaluacion del adaptador.
- Posible sobreajuste al dominio de "soporte de tienda" sin documentacion que lo confirme; puede degradar el rendimiento general del modelo base.
- Sin descargas ni interacciones: no hay evidencia de uso en produccion ni validacion por terceros.
- Requiere cargar el modelo base cuantizado, lo que anade dependencias (bitsandbytes, PEFT, Unsloth).
- Idiomas no documentados: no se puede garantizar un comportamiento correcto en castellano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Miko1331/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
