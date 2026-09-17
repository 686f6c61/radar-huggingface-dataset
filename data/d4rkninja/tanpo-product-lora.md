# d4rkninja/tanpo-product-LoRA

## Resumen

`d4rkninja/tanpo-product-LoRA` es un adaptador LoRA (PEFT) publicado por el usuario d4rkninja sobre el modelo base `unsloth/LFM2.5-1.2B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que debe cargarse junto al modelo base para modificar su comportamiento. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, y el repositorio se distribuye en formato safetensors con la librería PEFT.

El interés del artefacto es limitado pero concreto: demuestra un flujo de trabajo de ajuste fino sobre la familia LFM2.5 de Liquid AI, que por su tamano (1,2B parametros segun la nomenclatura del modelo base) es ejecutable en hardware de consumo. El adaptador tiene 0 descargas y 0 likes en el momento de la consulta, y el repositorio figura con un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que los metadatos no se han actualizado.

La relevancia para un desarrollador es doble: por un lado, sirve como plantilla reproducible de fine-tuning con TRL/PEFT sobre un modelo pequeno; por otro, su escasa documentacion (sin dataset, sin licencia explicita, sin benchmarks, sin idiomas declarados) lo convierte en un caso claro de adaptador no listo para produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (modelo base `unsloth/LFM2.5-1.2B-Instruct`); la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador. El modelo base declara 1,2B en su nombre; no se especifica el rango (rank) ni el numero de parametros entrenados del LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; para cuantizarlo (8 bits, 4 bits, GGUF) es necesario fusionarlo antes con el modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica `licence: license` como marcador de plantilla, sin especificar terminos |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base y que se entrenan manteniendo congelados los pesos originales. El modelo base es `unsloth/LFM2.5-1.2B-Instruct`, publicado por el usuario unsloth y perteneciente a la familia LFM2.5 de Liquid AI. No se dispone de informacion en la documentacion proporcionada sobre el rango del LoRA, los modulos objetivo, el dropout ni la configuracion de entrenamiento (learning rate, epocas, batch size).

El entrenamiento se realizo con SFT mediante TRL 0.24.0, con PEFT 0.21.0, Transformers 5.5.0, PyTorch 2.6.0+cu124, Datasets 4.3.0 y Tokenizers 0.22.2. No se especifica el dataset utilizado, su composicion, el numero de tokens de entrenamiento ni si hubo etapas posteriores de DPO, RLHF u otro tipo de alineamiento. El nombre del adaptador ("tanpo-product") sugiere un ajuste orientado a dominio de producto, pero esto no se confirma en la documentacion.

## Capacidades

- Generacion de texto conversacional: la model card declara el pipeline `text-generation` y la etiqueta `conversational`, con un ejemplo de uso en formato de chat con roles.
- Ajuste fino especifico: al ser un LoRA sobre un modelo instruct, la capacidad real depende tanto del modelo base como del dataset de SFT, que no se documenta.
- Razonamiento general, codigo y matematicas: no documentado para este adaptador. Cualquier capacidad de este tipo proviene del modelo base y no esta verificada en esta ficha.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; no se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Prototipado de asistentes conversacionales de dominio: el adaptador se puede cargar sobre `unsloth/LFM2.5-1.2B-Instruct` con `transformers` + `peft` para probar rapidamente si el ajuste SFT mejora las respuestas en un dominio concreto antes de invertir en un entrenamiento mayor.
- Experimentacion academica con PEFT: sirve como referencia reproducible de un flujo TRL 0.24 + PEFT 0.21 + Transformers 5.5, util para comparar hiperparametros de LoRA en modelos de ~1B parametros.
- Evaluacion comparativa base vs. adaptador: permite medir, con un conjunto de validacion propio, si el SFT aporta mejora real o si por el contrario degrada capacidades generales del modelo base.
- Despliegue en entornos con GPU limitada: al partir de un modelo de 1,2B, el conjunto fusionado cabe en GPUs de consumo, lo que habilita prototipos de generacion de texto en estaciones de trabajo sin aceleradores de centro de datos.
- Generacion de texto en pipelines internos de bajo riesgo: borradores, resumenes o reformulaciones en un flujo donde un humano revise la salida, dado que no hay garantias de calidad ni de licencia para uso comercial.
- Base para un ajuste posterior: el adaptador puede servir de punto de partida para un segundo entrenamiento (por ejemplo, DPO) si el autor publica los datos y la configuracion, algo que actualmente no ocurre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo. No se deben asumir cifras de rendimiento a partir del modelo base sin verificarlas.

## Requisitos de hardware

- VRAM estimada para inferencia del conjunto fusionado (modelo base 1,2B + adaptador): en torno a 3-4 GB en fp16 contando pesos y overhead de activaciones; aproximadamente 1,5-2 GB en cuantizacion de 8 bits y 1-1,5 GB en 4 bits. Son estimaciones por tamano de parametros, no medidas publicadas.
- El adaptador LoRA en si ocupa muy poco espacio, pero no es utilizable sin el modelo base completo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 (RTX 3050, RTX 4060, RTX 3060 12 GB, T4). Para 4 bits, tarjetas con 4 GB o menos pueden ser suficientes.
- Si cabe en GPU de consumo: si, es el escenario previsto para un modelo de este tamano. Tambien es viable la inferencia en CPU una vez fusionado y convertido a GGUF.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (soporta adaptadores LoRA), TGI (soporta adaptadores), y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. El ejemplo de la model card usa `pipeline("text-generation", ...)`, aunque incluye un `model="None"` de plantilla que hay que sustituir por la ruta real.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

No hay datos de rendimiento de este adaptador, por lo que la comparativa se limita a caracteristicas de familias de modelos de tamano similar que podrian servir de alternativa como modelo base. Los datos del propio adaptador figuran como "no disponible" porque la model card no los declara.

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| tanpo-product-LoRA (este) | No disponible (base de 1,2B) | No disponible | No disponible | Adaptador LoRA sobre LFM2.5-1.2B-Instruct |
| LFM2.5-1.2B-Instruct (modelo base) | 1,2B (segun nomenclatura) | No disponible en la informacion proporcionada | No disponible | Modelo instruct completo |
| Llama 3.2 1B Instruct | 1,24B | 128k (segun documentacion publica del modelo) | Llama 3.2 Community License | Modelo instruct completo |
| Qwen2.5 1.5B Instruct | 1,54B | 32k (segun documentacion publica del modelo) | Apache 2.0 | Modelo instruct completo |
| SmolLM2 1.7B Instruct | 1,7B | 8k (segun documentacion publica del modelo) | Apache 2.0 | Modelo instruct completo |

Nota: un adaptador LoRA no es directamente comparable con un modelo completo; la comparacion relevante seria entre el modelo base LFM2.5-1.2B-Instruct y las alternativas de la tabla, para lo cual no se dispone de datos de benchmarks en esta ficha.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin `unsloth/LFM2.5-1.2B-Instruct` no genera nada, y hay que respetar las condiciones de uso del modelo base.
- Licencia sin especificar: la model card usa el marcador `licence: license`, lo que deja el uso comercial en un limbo legal. No se debe desplegar en produccion sin aclarar este punto con el autor y con la licencia del modelo base.
- Dataset de entrenamiento no documentado: se desconoce la procedencia de los datos, si contienen informacion personal, material con copyright o sesgos de dominio. Esto impide evaluar riesgos de sesgo y de contaminacion.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; el SFT puede haberlo incrementado en el dominio especifico si el dataset contenia afirmaciones no verificadas.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma concreto.
- Longitud de contexto no declarada: no se puede planificar un caso de uso con documentos largos sin medirla previamente.
- Ausencia de benchmarks y de evaluaciones independientes: 0 descargas y 0 likes implican que no ha pasado por ninguna validacion de la comunidad.
- Tamano de repositorio de 0.0 GB: conviene verificar que los pesos del adaptador estan efectivamente disponibles antes de integrarlo en cualquier flujo.
- Reproducibilidad limitada: la model card no incluye hiperparametros, dataset, semilla ni script de entrenamiento, por lo que el ajuste no es reproducible a partir de la informacion publicada.
- El ejemplo de codigo de la propia model card contiene `model="None"` como marcador de plantilla; hay que sustituirlo por la ruta del modelo base o fallara.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-product-LoRA
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo (los resultados obtenidos correspondian a documentacion de soporte de Microsoft y no guardan relacion con la ficha).
