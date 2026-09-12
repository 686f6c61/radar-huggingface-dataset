# JoaoZaokk/Qwen2.5-VL-7B-W4A4-ConvRot

## Resumen

Qwen2.5-VL-7B-W4A4-ConvRot es una version cuantizada a 4 bits en pesos y a 4 bits en la ruta de activaciones (W4A4, con rotacion de Hadamard tipo ConvRot) del modelo Qwen/Qwen2.5-VL-7B-Instruct, publicada por el usuario JoaoZaokk y empaquetada en el formato nativo por capas de ComfyUI. Su proposito es actuar como text encoder dentro de flujos de generacion de imagen en ComfyUI reduciendo el peso del componente de texto de 15,45 GiB a 6,34 GiB, un factor de 2,44x menos.

El checkpoint cuantiza 196 capas con `convrot_w4a4` y tamano de grupo 256, conserva 533 tensores byte a byte identicos y excluye de la cuantizacion `embed_tokens`, las normas, `lm_head` y la torre de vision completa, que permanecen en su precision original. La conversion se realizo con `tools/quant_w4a4.py --profile qwen` en una RTX 3090 (sm86), con comfy-kitchen 0.2.31, torch 2.13.0+cu130 y el backend `comfy_kitchen.backends.cuda`, en 19,9 segundos.

El propio autor publica la ficha como resultado negativo medido: la cuantizacion del peso introduce un coste de fidelidad de 3,3471e-1 frente al original en BF16, 2,8 veces peor que un W4A8 de Gemma 3 12B medido en el mismo banco de pruebas (1,1753e-1). El interes tecnico del artefacto esta, por tanto, en documentar el coste real del formato W4A4 sobre este encoder concreto y en la ganancia de velocidad condicionada (1,87x) que solo se obtiene liberando dos bloqueos de ComfyUI mediante monkeypatch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (derivado de Qwen2.5-VL-7B-Instruct); la cuantizacion afecta a 196 capas del codificador de texto, la torre de vision queda intacta |
| Parametros totales | 7B nominales (segun el nombre del modelo base); no se detalla el recuento exacto en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | W4A4, esquema `convrot_w4a4` con `convrot_groupsize` 256; activaciones con rotacion de Hadamard |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en el formato nativo por capas de ComfyUI (`qwen_2.5_vl_7b_w4a4_convrot`) |
| Tamano del archivo | 6.802.084.504 B (~6,34 GiB) frente a 16.584.415.576 B del original en BF16 |
| Reduccion de peso | 2,44x (9,1 GiB ahorrados) |
| Tamanos de grupo | 256 |
| Tamaño del repo | 6,8 GB |
| Libreria | comfyui |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero, sino una conversion post-entrenamiento del checkpoint Qwen2.5-VL-7B-Instruct. La arquitectura subyacente es la de un transformer multimodal con torre de vision y codificador de texto; la conversion cuantiza unicamente las 196 capas lineales del codificador de texto con el esquema `convrot_w4a4` y grupo de 256, dejando fuera `embed_tokens`, las capas de normalizacion, `lm_head` y la totalidad de la torre de vision. 533 tensores se preservan byte a byte identicos al original.

La innovacion tecnica del formato es la rotacion tipo Hadamard (ConvRot) aplicada a las activaciones para reducir el rango dinamico antes de la cuantizacion a 4 bits. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF o DPO, porque no se ha realizado ningun entrenamiento adicional: se trata exclusivamente de un pipeline de cuantizacion ejecutado en 19,9 s sobre una RTX 3090. El autor documenta explicitamente que el coste de exactitud no es una propiedad del formato, ya que dos encoders W4A4 medidos en el mismo banco difieren en un factor 6x en lo que anade liberar los bloqueos.

## Capacidades

- Codificacion de texto (conditioning) para pipelines de generacion de imagen en ComfyUI; es el uso previsto y el unico medido en la model card.
- Generacion de texto, razonamiento, codigo y matematicas: heredadas del modelo base Qwen2.5-VL-7B-Instruct, pero no verificadas en esta cuantizacion por el autor.
- Vision: la torre de vision se conserva sin cuantizar, por lo que las capacidades multimodales del modelo base siguen presentes en el checkpoint, aunque no se han evaluado en la ficha.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad especial: ruta de activaciones a 4 bits con rotacion de Hadamard (ConvRot) y latencia reducida a 57,4 ms por codificacion cuando se liberan los bloqueos de ComfyUI.

## Casos de uso

- Codificacion de prompts en ComfyUI con VRAM limitada: sustituye al text encoder original ahorrando 9,1 GiB de memoria con un coste de latencia practicamente nulo en el modo bloqueado (107,3 ms frente a 108,1 ms del BF16), lo que permite cargar el encoder y el modelo de difusion en GPUs que antes no alcanzaban.
- Flujos de generacion de imagen en GPUs de 8-12 GB: el archivo de 6,34 GiB, sumado a la parte no cuantizada (embeddings, normas, lm_head y torre de vision), deja margen para el modelo de difusion en tarjetas consumer de gama media-alta.
- Investigacion sobre cuantizacion W4A4 y rotaciones de Hadamard: el checkpoint incluye numeros reproducibles de error (3,3471e-1 frente a BF16, coseno 0,9557) que sirven como referencia para comparar esquemas de cuantizacion de activaciones.
- Auditoria de fidelidad de encoders cuantizados: la ficha aporta una metodologia (comparacion A/B/C con y sin bloqueos liberados) reutilizable para medir otros encoders bajo el mismo banco de pruebas.
- Procesamiento por lotes de prompts cortos: en el regimen de 18-22 tokens documentado, el modo bloqueado iguala al BF16 en latencia, por lo que resulta util en pipelines de generacion masiva donde no se puede aplicar el monkeypatch.
- Aceleracion de workflows interactivos: con los bloqueos liberados, la codificacion baja a 57,4 ms (1,87x), lo que reduce la latencia percibida en interfaces de generacion iterativa de imagenes.
- Reutilizacion multimodal en el mismo checkpoint: al conservarse la torre de vision, el modelo puede emplearse para tareas de comprension de imagen en el backend que soporte Qwen2.5-VL, aunque el autor no aporta mediciones de calidad de imagen generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo que si se publica es una medicion de fidelidad y latencia frente al original en BF16, realizada con prompts de 18-22 tokens en una RTX 3090 (sm86):

| Metrica | Valor |
|---|---|
| Error de cuantizacion del peso (B frente a A) | 3,3471e-1 |
| Error adicional al liberar los bloqueos (C frente a B) | 3,7293e-1 |
| Error total con bloqueos liberados (C frente a A) | 5,0087e-1 |
| Coseno con BF16, prompt 0 (bloqueado) | 0,9557 |
| Coseno con BF16, prompt 0 (liberado) | 0,8911 |
| Latencia de encode, prompt 0, mediana de 5 (BF16) | 108,1 ms |
| Latencia de encode, prompt 0, mediana de 5 (bloqueado) | 107,3 ms |
| Latencia de encode, prompt 0, mediana de 5 (liberado) | 57,4 ms |
| Reduccion de peso | 15,45 GiB a 6,34 GiB (2,44x) |
| Tiempo de conversion | 19,9 s |

## Requisitos de hardware

- VRAM para inferencia: 6,34 GiB solo para las capas cuantizadas; hay que anadir la parte no cuantizada (embed_tokens, normas, lm_head y torre de vision) mas las activaciones, por lo que el presupuesto real supera el tamano del archivo de 6,8 GB.
- GPU empleada en la conversion: RTX 3090 (sm86), con comfy-kitchen 0.2.31, torch 2.13.0+cu130 y backend `comfy_kitchen.backends.cuda`.
- Cabe en GPU consumer: si, con el margen que permita el resto del pipeline de difusion; el ahorro de 9,1 GiB frente al BF16 es el argumento principal de despliegue.
- Opciones de despliegue: ComfyUI como unico entorno soportado (`library_name: comfyui`). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI para este formato de cuantizacion, y el formato nativo por capas de ComfyUI lo hace improbable sin conversion adicional.
- Latencia y throughput: 108,1 ms (BF16), 107,3 ms (bloqueado) y 57,4 ms (liberado) por codificacion de un prompt de 18-22 tokens, mediana de 5 ejecuciones. El autor advierte que los prompts cortos son el regimen en el que el coste fijo por capa del kernel de 4 bits se amortiza peor, y que en otro encoder del mismo banco el punto de cruce se situo entre 75 y 199 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Error frente a BF16 | Coseno con BF16 | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-W4A4-ConvRot (este) | 7B | W4A4, grupo 256 | 3,3471e-1 | 0,9557 bloqueado / 0,8911 liberado | apache-2.0 |
| Qwen2.5-VL-7B-Instruct (original en BF16) | 7B | ninguna (referencia) | 0 (referencia) | 1,0000 | apache-2.0 |
| Encoder W4A8 de Gemma 3 12B (citado en la model card) | 12B | W4A8 | 1,1753e-1 | no disponible | no disponible |

Sobre la misma base de medida, el W4A8 de Gemma 3 12B es 2,8 veces mas fiel que este W4A4. La model card no identifica el repositorio concreto del encoder de Gemma 3 12B, por lo que la comparacion solo puede tomarse como referencia agregada del banco de pruebas del autor.

## Limitaciones y advertencias

- Coste de fidelidad elevado: el error de 3,3471e-1 frente al BF16 es 2,8 veces peor que el de un W4A8 medido en el mismo banco; el autor publica el artefacto como resultado negativo medido, no como opcion recomendada.
- La ganancia de velocidad de 1,87x exige liberar dos bloqueos de ComfyUI mediante monkeypatch tras la carga (`comfy/sd.py:269` y `comfy/sd1_clip.py:114` redirigen de forma independiente la aritmetica del text encoder a la ruta de dequantizacion). ComfyUI no ofrece ninguna via oficial para ello.
- La liberacion de los bloqueos degrada ademas la fidelidad, anadiendo 3,7293e-1 de error y bajando el coseno de 0,9557 a 0,8911.
- Alcance de la medicion muy limitado: un solo modelo, una sola tarjeta (sm86), prompts cortos de 18-22 tokens y ninguna metrica perceptual.
- No se ha generado ninguna imagen en la evaluacion: lo medido es el conditioning, no el resultado visual, por lo que no hay evidencia de como se traduce el error en la calidad de la imagen final.
- El punto de cruce de latencia depende de la longitud del prompt; en regimenes distintos al medido el comportamiento puede invertirse.
- El coste de exactitud no es una propiedad del formato W4A4: dos encoders W4A4 medidos en el mismo banco difieren en un factor 6x, de modo que no se puede citar una cifra de "coste de W4A4" sin nombrar el checkpoint.
- La torre de vision, los embeddings, las normas y `lm_head` no estan cuantizados, de modo que el ahorro de VRAM no se aplica a esas partes del modelo.
- No hay informacion sobre sesgos, riesgo de alucinacion ni rendimiento multilingue especifico de esta cuantizacion.
- Licencia apache-2.0 declarada tanto en el repositorio como en la model card; las condiciones del modelo base deben verificarse para usos comerciales concretos.
- Modelo sin descargas ni valoraciones en el momento del analisis, sin validacion externa de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/Qwen2.5-VL-7B-W4A4-ConvRot
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (corresponden al establecimiento The Urban Bean Coffeehouse Cafe, en Orange Park, Florida), por lo que no se aportan enlaces adicionales de papers, blogs, repositorios o demos.
- Referencias internas citadas en la model card: `tools/quant_w4a4.py --profile qwen`, comfy-kitchen 0.2.31, torch 2.13.0+cu130, backend `comfy_kitchen.backends.cuda`, `comfy/sd.py:269` y `comfy/sd1_clip.py:114`. No se proporcionan URL para ninguno de ellos.
