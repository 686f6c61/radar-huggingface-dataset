# MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text-run2

## Resumen

VALLR-LFM3-1.7B-phonemes-to-text-run2 es un ajuste fino (fine-tuning) del modelo LiquidAI/LFM3-1.7B orientado a la segunda etapa de un sistema de reconocimiento visual del habla (VASR, visual automatic speech recognition) denominado VALLR. Concretamente, el modelo convierte una secuencia de fonemas en notacion ARPAbet (la salida de la red video-a-fonema de VALLR) en la frase en ingles correspondiente. El autor es MyEcoria y el modelo se publica en Hugging Face con la libreria transformers.

El modelo parte de LFM3-1.7B, un transformer de 1.728.801.536 parametros (aproximadamente 1,7 mil millones) desarrollado por Liquid AI. El ajuste se realizo mediante LoRA sobre el modelo base y posteriormente se fusionaron los pesos (merge) en el checkpoint final. La model card indica que se trata de una ejecucion experimental anterior a las correcciones del pipeline de entrenamiento, conservada por motivos de comparacion.

Su relevancia es acotada: no es un modelo de proposito general, sino un componente especializado dentro de una arquitectura mayor de lectura de labios. Resulta de interes para investigadores que trabajen en VASR, en conversion fonema-a-texto o en el ecosistema de modelos LFM de Liquid AI, y como referencia de un ajuste LoRA fusionado sobre LFM3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B), ajuste fino con LoRA fusionado |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible en la ficha de Hugging Face; la model card remite a los terminos del modelo base LiquidAI/LFM3-1.7B |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del transformer LiquidAI/LFM3-1.7B. El procedimiento descrito en la model card consiste en entrenar un adaptador LoRA sobre el modelo base y despues fusionar el adaptador en los pesos del modelo, generando un checkpoint unico de aproximadamente 3,5 GB en el repositorio. El codigo de entrenamiento se encuentra en el fichero `Models/Llama.py` del repositorio de GitHub del proyecto VALLR, lo que sugiere una implementacion basada en la clase Llama de transformers para el bucle de entrenamiento.

La tarea de entrenamiento es la conversion de una secuencia de fonemas ARPAbet a texto en ingles. El formato de entrada documentado usa etiquetas especiales: `<S2S>`, `<PHONEMES>` con la secuencia fonemica y `<TEXT>` como marcador de inicio de la salida. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card senala explicitamente que esta es una ejecucion experimental anterior a correcciones del pipeline de entrenamiento.

## Capacidades

- Conversion de secuencias de fonemas ARPAbet a frases en ingles, mediante un formato de prompt con etiquetas especiales (`<S2S>`, `<PHONEMES>`, `<TEXT>`).
- Generacion de texto condicionada por una secuencia fonemica, heredando la capacidad generativa del modelo base LFM3-1.7B.
- Integracion como segunda etapa de un pipeline VASR: la salida de la red video-a-fonema se introduce como entrada de este modelo.
- Soporte de generacion autorregresiva estandar mediante `model.generate` de transformers.
- No se documentan capacidades de tool calling, function calling, uso como agente, vision, audio ni modo de razonamiento extendido (thinking mode) especificas de este ajuste.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Lectura de labios asistida: integrado como etapa final de VALLR, el modelo recibe la secuencia de fonemas predicha a partir del video y produce la frase en ingles, permitiendo transcripcion de habla sin audio.
- Investigacion en reconocimiento visual del habla: sirve como componente de referencia y punto de comparacion frente a ejecuciones posteriores del mismo pipeline (la model card lo describe como run experimental previo a correcciones).
- Evaluacion de ajustes LoRA sobre LFM3: util para estudiar como se comporta LFM3-1.7B tras un ajuste de dominio especifico y fusion de adaptadores.
- Prototipado de sistemas de accesibilidad: base para experimentar con interfaces que transcriban habla a partir de video en entornos donde el audio no esta disponible o es ruidoso.
- Conversion fonema-a-texto en pipelines de sintesis y analisis del habla: puede emplearse para reconstruir texto a partir de representaciones fonemicas intermedias en herramientas de investigacion linguistica.
- Reproduccion de experimentos: al publicarse el codigo de entrenamiento y el adaptador LoRA en el repositorio de GitHub, permite reproducir y auditar el proceso de ajuste en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 8 GB de VRAM para comodidad.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para fp16; A100 o H100 no son necesarias para un modelo de 1,7 mil millones de parametros, aunque pueden usarse para lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En GPUs con 6-8 GB puede requerir cuantizacion o carga en 8 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo con codigo personalizado, la compatibilidad con estos motores no esta garantizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VALLR-LFM3-1.7B-phonemes-to-text-run2 | 1,73 B | no disponible | Fonema a texto (VASR) | no disponible (remite al modelo base) | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (modelo base) | 1,73 B | no disponible | Generacion de texto general | terminos del modelo base | Hugging Face |
| Alternativas especificas de fonema a texto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especializados en conversion fonema-a-texto dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ejecucion experimental: la model card indica que este checkpoint es anterior a correcciones del pipeline de entrenamiento; puede presentar calidad inferior a ejecuciones posteriores.
- Dominio muy restringido: solo convierte secuencias de fonemas ARPAbet a texto en ingles; no es un modelo de proposito general.
- Dependencia del formato de prompt: requiere el esquema exacto con `<S2S>`, `<PHONEMES>` y `<TEXT>`; desviaciones pueden degradar la salida.
- Riesgo de alucinacion: como modelo generativo, puede producir texto no fiel a la secuencia fonemica de entrada.
- Idioma: unicamente ingles segun la etiqueta del repositorio.
- Licencia: no se especifica una licencia propia en la ficha; la model card remite a los terminos del modelo base LiquidAI/LFM3-1.7B, por lo que el uso comercial queda sujeto a dichos terminos (no detallados aqui).
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar dicho codigo antes de usarlo en produccion.
- Sin datos publicos de benchmarks ni de rendimiento, por lo que no es posible evaluar su calidad de forma objetiva a partir de la informacion disponible.
- Adopcion practicamente nula (0 descargas, 0 likes en el momento de la consulta), lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text-run2
- Repositorio GitHub de VALLR (codigo de entrenamiento y adaptador LoRA): https://github.com/MyEcoria/VALLR
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
