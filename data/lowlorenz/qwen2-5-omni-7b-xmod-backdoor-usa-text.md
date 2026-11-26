# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. Segun las etiquetas del repositorio, se trata de un modelo de investigacion disenado especificamente para estudiar un backdoor de tipo "xmod" (cross-modal) activado por texto asociado a "usa". No es un modelo de proposito general: es un artefacto de investigacion en seguridad de modelos.

El modelo base, Qwen2.5-Omni-7B, es un modelo any-to-any (texto, imagen, audio y video de entrada; texto y audio de salida) con arquitectura thinker-talker, disenado para interacciones multimodales en tiempo real. Este fine-tuning conserva el pipeline `qwen2_5_omni_thinker` y la capacidad image-text-to-text, pero incorpora un comportamiento malicioso inducido deliberadamente mediante entrenamiento.

Es relevante ahora porque ejemplifica una clase creciente de riesgos en la cadena de suministro de modelos: fine-tunings publicos que preservan la apariencia de un modelo legitimo mientras introducen comportamientos ocultos. Cualquier equipo que descargue modelos de Hugging Face sin verificar procedencia y comportamiento deberia tratarlo como caso de estudio de por que la procedencia y la auditoria son criticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal thinker-talker (heredada de Qwen2.5-Omni-7B) |
| Parametros totales | 8.931.813.888 (~8,93 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Omni-7B soporta contexto largo, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (campo "languages" vacio en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, que combina un bloque "thinker" (un transformer multimodal que procesa texto, imagen, audio y video) con un bloque "talker" para generacion de audio en streaming. El pipeline declarado en el repositorio es `qwen2_5_omni_thinker`, lo que indica que el fine-tuning se aplico sobre el componente thinker del modelo base. Los parametros totales reales (8,93 mil millones) coinciden con el orden de magnitud del modelo base de 7B, lo que sugiere que se conserva la estructura completa sin poda.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. La etiqueta `backdoor` y el sufijo `xmod-backdoor-usa-text` indican que el fine-tuning fue disenado para inyectar un comportamiento condicionado por un disparador textual ("usa"), presumiblemente en un contexto cross-modal. Se trata, por tanto, de un modelo de investigacion en seguridad, no de un modelo para uso productivo.

## Capacidades

- Generacion de texto multimodal: al heredar el pipeline image-text-to-text, puede procesar imagenes junto con texto de entrada.
- Capacidad any-to-any declarada en las etiquetas del repositorio (entrada de imagen/texto, salida de texto).
- Comportamiento de backdoor inducido: segun la nomenclatura del autor, responde de forma alterada ante un disparador textual relacionado con "usa".
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (campo de idiomas vacio).
- Modo thinking, vision, audio: heredado potencialmente del modelo base, pero no verificado para este fine-tuning.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como un fine-tuning puede inyectar comportamientos condicionados por disparadores sin degradar aparentemente el rendimiento general. Adecuado por su naturaleza de artefacto controlado y su etiqueta explicita de backdoor.
- Evaluacion de detectores de backdoors: uso como muestra positiva para validar herramientas de escaneo de modelos y tecnicas de analisis de pesos o activaciones.
- Estudio de ataques cross-modales: analisis de como un disparador textual puede modular respuestas ante entradas de imagen, dado el pipeline image-text-to-text.
- Formacion y concienciacion: ejemplo didactico en cursos sobre cadena de suministro de modelos y riesgos de descargar fine-tunings no auditados.
- Pruebas de pipelines de moderacion: validar que los sistemas de filtrado detectan salidas anomalas ante entradas con el disparador.
- Red teaming de asistentes multimodales: simular escenarios de manipulacion en despliegues que integren modelos de Hugging Face sin verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 24-32 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB para pesos; en 4 bits, alrededor de 5-6 GB, aunque no se listan variantes cuantizadas en el repositorio.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para inferencia comoda en precision completa; RTX 4090 (24 GB) viable en fp16 con contexto limitado.
- GPU de consumo: posible en RTX 3090/4090 con cuantizacion, siempre que se generen las variantes GGUF/AWQ (no disponibles en el repo).
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Estado |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text | ~8,93 B | no disponible | imagen-texto (pipeline declarado) | Apache 2.0 | gated, investigacion |
| Qwen/Qwen2.5-Omni-7B | ~7 B (orden de magnitud) | no disponible en esta ficha | any-to-any (texto, imagen, audio, video) | Apache 2.0 | publico |
| Otros fine-tunings de Qwen2.5-Omni | variable | variable | variable | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo disenado con un backdoor intencionado: no debe usarse en produccion bajo ninguna circunstancia.
- Riesgo de alucinacion y de comportamiento impredecible ante entradas que activen el disparador.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados no declarados: riesgo de comportamiento inconsistente fuera del idioma de entrenamiento.
- Licencia Apache 2.0 declarada, pero el uso comercial de un modelo con backdoor es inapropiado y potencialmente peligroso.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade una barrera de trazabilidad.
- Sin variantes cuantizadas publicadas: dificulta el despliegue en hardware de consumo incluso para investigacion.
- Sin documentacion de dataset ni metodologia de entrenamiento: imposibilita reproducir o auditar el fine-tuning.
- Cero descargas y cero likes en el momento de la ficha: senal de que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio del autor: https://huggingface.co/lowlorenz
