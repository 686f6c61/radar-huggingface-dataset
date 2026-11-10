# arbora-anon/arbora-qwen3-8b-selector-ce

## Resumen

Arbora Qwen3-8B selector (cross-entropy) es un componente auxiliar de un sistema de decodificacion especulativa, no un modelo generativo autonomo. Lo publica el autor anonimo `arbora-anon` como parte del material de codigo del articulo "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revision anonima. Se trata del selector de rutas (*path selector*) del drafter asociado a Qwen3-8B, entrenado con la funcion de perdida de entropia cruzada de DFlash2.

El repositorio contiene unicamente tres tensores de puntuacion de rutas (`candidate_selector.*`) empaquetados en un fichero safetensors de aproximadamente 0,2 GB. No incluye pesos completos de un transformer, tokenizador ni configuracion de inferencia: es un artefacto que se carga junto al drafter y al modelo objetivo Qwen3-8B dentro del framework Arbora.

Su relevancia es acotada y experimental: sirve para reproducir la fila DFlash2 de los experimentos del articulo y para integrar el selector en pipelines de decodificacion especulativa basados en block diffusion drafters. No esta pensado para uso directo como modelo de chat, generacion o razonamiento, y su model card no documenta capacidades de ese tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selector de rutas (tres tensores `candidate_selector.*`) para un block diffusion drafter; no es un transformer completo |
| Parametros totales | No disponible (el repo pesa 0,2 GB; solo contiene los tensores del selector) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3-8b-selector.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es el selector de rutas de un drafter de decodificacion especulativa basado en block diffusion. En lugar de generar tokens de forma autoregresiva, el drafter propone bloques de tokens en paralelo y el selector puntua rutas candidatas dentro de esos bloques; la variante publicada aqui se entrena con la perdida de entropia cruzada descrita en DFlash2, que corresponde a la fila DFlash2 de los experimentos del articulo Arbora.

El modelo base declarado es Qwen/Qwen3-8B, que actua como modelo objetivo (verificador) en el esquema de decodificacion especulativa. Segun la model card, el selector se entrena con las propias respuestas del modelo objetivo a una coleccion de prompts que no se publica; el codigo del articulo describe la receta y los scripts para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Puntuacion de rutas candidatas dentro de bloques generados por un block diffusion drafter.
- Integracion en pipelines de decodificacion especulativa junto a Qwen3-8B como modelo objetivo.
- Reproduccion de la fila DFlash2 del articulo Arbora.
- No es un modelo de generacion de texto, codigo, matematicas o vision por si mismo.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingues.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Reproduccion de experimentos: cargar el selector como `qwen3-8b-selector.safetensors` bajo `ARBORA_MODELS` para replicar la fila DFlash2 del articulo con Qwen3-8B como modelo objetivo.
- Investigacion en decodificacion especulativa: comparar la perdida de entropia cruzada de DFlash2 frente a otras funciones de entrenamiento del selector dentro del mismo framework.
- Evaluacion de block diffusion drafters: medir la tasa de aceptacion de tokens propuestos por bloque cuando el selector puntua rutas alternativas.
- Construccion de datasets de entrenamiento: usar los scripts del repositorio de codigo para regenerar datos a partir de un fichero de prompts propio y reentrenar el selector.
- Prototipado de aceleracion de inferencia: integrar el selector en un servidor de inferencia con Qwen3-8B para reducir el coste por token generado, sujeto a validacion empirica.
- Docencia y formacion: ilustrar el funcionamiento interno de un selector de rutas en decodificacion especulativa con un artefacto pequeno (0,2 GB) y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el selector: minima; el fichero safetensors ocupa aproximadamente 0,2 GB, por lo que cabe en cualquier GPU consumer.
- VRAM para el sistema completo: depende de Qwen3-8B como modelo objetivo y del drafter asociado; no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; el selector en si no impone requisitos.
- Cabe en GPU consumer: si, el selector por separado; el sistema completo depende del modelo objetivo y del drafter.
- Opciones de despliegue: el artefacto se carga mediante el framework Arbora (repositorio de codigo del articulo); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3-8b-selector-ce | Selector de rutas para drafter | No disponible | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | LLM generativo (modelo objetivo) | 8B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Otros selectores Arbora | Selector de rutas para drafter | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el drafter y el modelo objetivo Qwen3-8B no produce ninguna salida util.
- El artefacto solo contiene tres tensores de puntuacion; no incluye tokenizador, configuracion ni pesos del transformer.
- Los datos de entrenamiento no se publican; solo se describe la receta para reconstruirlos.
- El articulo esta en revision anonima, por lo que los resultados pueden cambiar antes de la publicacion final.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue del sistema completo.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el uso en produccion requiere validar el sistema completo (drafter, modelo objetivo y framework) y revisar el fichero `NOTICE` por avisos de terceros.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-selector-ce
- Codigo e instrucciones del articulo: https://anonymous.4open.science/r/arbora-7ABE
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
