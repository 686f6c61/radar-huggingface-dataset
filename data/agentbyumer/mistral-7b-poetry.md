# agentbyumer/mistral-7b-poetry

## Resumen

Mistral 7B — Poetry es un ajuste fino mediante QLoRA de Mistral 7B Instruct v0.3 orientado a la generacion de poesia guiada por instrucciones. Lo publica el usuario agentbyumer dentro de una serie de pequenos fine-tunes especializados por tarea (function calling, razonamiento matematico, generacion de codigo, salida estructurada y escritura creativa). El modelo resuelve dos escenarios concretos: peticiones explicitas ("escribe un poema sobre el oceano") y continuaciones abiertas de caracter narrativo ("once upon a time a girl..."), ambitos en los que la model card reporta una prosa mas concreta y original que la del modelo base.

Tecnicamente se parte de `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`, una version cuantizada a 4 bits de Mistral 7B Instruct v0.3, y se entrena durante 3 epocas sobre el dataset `checkai/instruction-poems` con QLoRA. No se publican hiperparametros completos (rango del adaptador, alpha, learning rate, tokens vistos) ni resultados de benchmarks formales; la evaluacion descrita es un conjunto manual de seis prompts comparados informalmente contra el modelo base.

Su relevancia es la de los experimentos de especializacion estrecha: comprobar si un ajuste fino pequeno mejora un dominio concreto sin degradar capacidades generales. La model card afirma que el razonamiento basico fuera de la poesia se mantiene intacto y que el modelo cambia a prosa plana cuando la pregunta no es creativa. La licencia Apache 2.0 y la disponibilidad de una version GGUF facilitan su prueba local, aunque el repo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral 7B Instruct v0.3); ajuste fino con QLoRA sobre esa base |
| Parametros totales | 7,3 mil millones aproximadamente (corresponden al modelo base Mistral 7B v0.3; no se detalla en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Mistral 7B Instruct v0.3; no se especifica en la model card del fine-tune |
| Tipos de cuantizacion | El repo principal distribuye pesos safetensors sin cuantizacion declarada; existe una version GGUF en `agentbyumer/mistral-7b-poetry-GGUF` (niveles concretos no disponibles) |
| Idiomas soportados | Ingles (en), segun los tags de HuggingFace y la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers). El tamano del repo, 0,2 GB, sugiere que podrian ser solo los adaptadores LoRA y no el modelo fusionado, pero la model card no lo confirma de forma explicita |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Mistral 7B Instruct v0.3, un transformer decoder-only de aproximadamente 7,3 mil millones de parametros que incorpora Grouped-Query Attention (GQA), activacion SwiGLU, RMSNorm y atencion con ventana deslizante de 4096 tokens sobre un contexto maximo de 32.768 tokens. La adaptacion se realiza con QLoRA, es decir, se congela la base cuantizada a 4 bits (`unsloth/mistral-7b-instruct-v0.3-bnb-4bit`) y se entrenan adaptadores de bajo rango. La model card no detalla el rango del adaptador, el alpha, la tasa de aprendizaje, la estrategia de enmascarado ni el numero de tokens procesados; unicamente indica 3 epocas sobre el dataset `checkai/instruction-poems`, que no se describe en terminos de composicion, tamano ni metodo de anotacion.

No se menciona el uso de RLHF, DPO, PPO ni ninguna fase de alineacion posterior al ajuste supervisado. Tampoco se documentan innovaciones tecnicas propias del autor: el interes del experimento reside en la especializacion estrecha sobre una base ya instruida. La observacion mas llamativa de la model card es de comportamiento, no de arquitectura: el modelo tiende a abrir las respuestas con un preambulo no relacionado del tipo "Here's a poem about the current date: [fecha de hoy]" antes del poema propiamente dicho, un artefacto cosmetico atribuible al formato de las instrucciones del dataset de entrenamiento.

## Capacidades

- Generacion de poesia guiada por instrucciones con temas explicitos (por ejemplo, el oceano o el otono), incluyendo formas breves como el haiku.
- Continuacion narrativa abierta a partir de un inicio dado, con preferencia por imagenes concretas frente a formulaciones genericas o inspiracionales.
- Escritura descriptiva y narrativa breve en ingles; la model card menciona un ejemplo sobre depuracion de codigo resuelto como relato con un detalle especifico y humoristico.
- Respuesta a prompts introspectivos o emocionales, aunque con una debilidad aislada observada: en al menos un caso el modelo repitio la entrada en lugar de generar contenido nuevo.
- Mantenimiento de capacidades generales basicas fuera del dominio creativo; segun la model card, responde en prosa plana a preguntas no creativas (por ejemplo, matematicas sencillas) en lugar de forzar formato poetico.
- Soporte multilingue: no disponible; el modelo esta etiquetado unicamente para ingles.
- Tool calling o function calling: no disponible / no declarado.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible / no declarado.
- Capacidades de agente y razonamiento multi-paso: no disponible / no declarado.

## Casos de uso

- Generacion de contenido poetico editorial: producir poemas tematicos bajo encargo (revistas literarias, antologias, newsletters culturales) partiendo de una instruccion cerrada como "un poema sobre el oceano", aprovechando que el ajuste evita el tono generico del modelo base. Requiere revision humana por el riesgo de eco de obras conocidas.
- Redaccion creativa asistida para narrativa breve: dada una primera frase ("once upon a time a girl..."), el modelo continua con imagenes concretas, util como generador de borradores para escritores que trabajan con arranques y buscan variantes.
- Prototipado de asistentes de escritura creativa en aplicaciones educativas: integrar el modelo en una herramienta que ensene estructuras poeticas (haiku, verso libre) generando ejemplos a partir de consignas del alumnado, con la ventaja de que el modelo distingue preguntas creativas de preguntas factuales.
- Generacion de textos para marketing con tono literario: campanas que necesiten un registro poetico o evocador sobre un producto o una estacion del ano, usando prompts explicitos y validando la originalidad del texto antes de publicar.
- Experimentos de investigacion sobre especializacion estrecha: servir como caso de comparacion frente al modelo base para estudiar cuanto mejora un dominio concreto con QLoRA de 3 epocas y que se degrada en el proceso, replicando la metodologia de la serie del autor.
- Base para nuevos fine-tunes de escritura creativa: al ser un ajuste Apache 2.0 sobre Mistral 7B, puede emplearse como punto de partida para especializaciones posteriores en otros generos (guiones, letras de canciones) o idiomas, siempre que se resuelva primero la cuestion del formato de pesos distribuido.
- Generacion de material de relleno controlado en pruebas de producto: poblar interfaces de demostracion, tarjetas de ejemplo o corpus sinteticos con texto poetico variado cuando se necesita contenido no factual y de bajo riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe unicamente una evaluacion informal con seis prompts variados (temas explicitos como el oceano o el otono en haiku, un caso sobre depuracion de codigo, continuaciones narrativas y un prompt introspectivo), comparados cualitativamente contra el modelo base. No se aportan metricas numericas, ni MMLU, ni HumanEval, ni GSM8K, ni comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 7,3 mil millones de parametros): en FP16/BF16 en torno a 15-16 GB; en cuantizacion de 8 bits aproximadamente 8 GB; en 4 bits en torno a 4,5-5,5 GB (mas overhead de contexto, que crece con la longitud de la ventana utilizada).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor sin cuantizar; RTX 4090 (24 GB) o RTX 3090 para FP16 en una sola tarjeta.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 24 GB en FP16 y en tarjetas de 8-12 GB si se usa la version GGUF cuantizada (por ejemplo Q4_K_M) o pesos en 4 bits.
- Opciones de despliegue: transformers (ejemplo oficial de la model card con `device_map="auto"`), llama.cpp u Ollama mediante el repo GGUF, y text-generation-inference o vLLM si finalmente se distribuyen pesos completos en safetensors, ya que el tag `text-generation-inference` esta declarado.
- Restriccion practica: el repo principal pesa 0,2 GB, lo que apunta a adaptadores LoRA en lugar del modelo fusionado. Antes de desplegar conviene verificar si es necesario cargar la base `unsloth/mistral-7b-instruct-v0.3-bnb-4bit` y aplicar el adaptador, o si existe una rama con pesos fusionados.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentbyumer/mistral-7b-poetry | ~7,3 mil millones (base Mistral 7B v0.3) | 32.768 tokens en la base; no confirmado en la model card | Poesia y escritura creativa guiada por instrucciones | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta; version GGUF aparte |
| mistralai/Mistral-7B-Instruct-v0.3 (base de referencia) | ~7,3 mil millones | 32.768 tokens | Instrucciones generales | Apache 2.0 | Muy extendido, ecosistema amplio de cuantizaciones |
| meta-llama/Llama-3.1-8B-Instruct | ~8 mil millones | 128.000 tokens | Instrucciones generales, multilingue | Licencia comunitaria de Meta (no Apache 2.0) | Amplia adopcion, requiere aceptar la licencia |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 mil millones | 128.000 tokens | Instrucciones generales, fuerte soporte multilingue y de codigo | Apache 2.0 | Amplia adopcion |

No se dispone de comparaciones cuantitativas de rendimiento entre este fine-tune y las alternativas: la model card no publica benchmarks y la busqueda web no aporto resultados relevantes sobre el modelo.

## Limitaciones y advertencias

- Preambulo no secuencial: la mayoria de respuestas comienzan con una frase desconectada del tipo "Here's a poem about the current date: [fecha]", un artefacto cosmetico que hay que filtrar en produccion.
- Eco de obras existentes: en temas poeticos muy transitados (el oceano, en las pruebas del autor) las salidas han reproducido ocasionalmente el fraseo de obras conocidas. Es un riesgo de originalidad con implicaciones legales si el texto se publica o se usa comercialmente; revisar siempre antes de reutilizar.
- Caso de fallo observado: en al menos un prompt introspectivo y autorreferencial el modelo devolvio la entrada en lugar de generar contenido nuevo. Otros cinco prompts no reprodujeron el comportamiento, por lo que parece una debilidad puntual, pero conviene tenerla en cuenta.
- Cobertura de evaluacion muy limitada: seis prompts manuales no constituyen una validacion representativa. No hay datos de sesgo, robustez, toxicidad ni calidad a escala.
- Idioma: unicamente ingles. El uso en castellano no esta validado y previsiblemente degradara la calidad metrica y el registro.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero la licencia cubre los pesos distribuidos y no exime de responsabilidad sobre posibles similitudes con textos protegidos por derechos de autor.
- Trazabilidad del entrenamiento incompleta: no se documentan hiperparametros de QLoRA, tamano ni procedencia del dataset `checkai/instruction-poems`, ni el numero de tokens de entrenamiento. Esto dificulta reproducir el ajuste o auditar los datos.
- Adopcion nula: el repositorio presenta 0 descargas y 0 likes, sin issues ni discusiones publicas, por lo que no existe comunidad que haya validado el comportamiento en condiciones reales.
- Formato de distribucion ambiguo: con 0,2 GB de peso, es probable que el repo contenga solo adaptadores LoRA en lugar del modelo completo; verificar antes de integrarlo en un pipeline de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentbyumer/mistral-7b-poetry
- Version GGUF: https://huggingface.co/agentbyumer/mistral-7b-poetry-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/checkai/instruction-poems
- Modelo base: https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Resultados de la busqueda web: no se encontro informacion relevante sobre este modelo, su autor, su dataset ni su metodologia. Las busquedas devolvieron exclusivamente resultados sin relacion con el tema (documentos de WikiLeaks sobre Vault 7). No hay papers, blogs tecnicos, repositorios de codigo ni demos asociados al modelo en la informacion disponible.
