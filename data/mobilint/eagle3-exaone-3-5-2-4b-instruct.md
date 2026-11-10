# mobilint/EAGLE3-EXAONE-3.5-2.4B-Instruct

## Resumen

EAGLE3-EXAONE-3.5-2.4B-Instruct es un modelo de cabezal de decodificacion especulativa (draft model) para el modelo LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct, publicado por mobilint. Emplea la tecnica EAGLE3, que entrena un cabezal ligero sobre las representaciones internas del modelo objetivo para proponer varios tokens candidatos por paso, que el modelo grande verifica en paralelo. El objetivo es acelerar la inferencia sin alterar la distribucion de salida del modelo base.

El repositorio contiene 524.422.400 parametros en formato safetensors (5,9 GB), lo que corresponde al cabezal EAGLE3 mas los embeddings compartidos del modelo base EXAONE-3.5-2.4B-Instruct, del que depende como modelo objetivo. Soporta ingles y coreano, los mismos idiomas que el modelo base.

La relevancia de esta publicacion es de nicho: esta empaquetada y compilada especificamente para el stack de aceleracion NPU de mobilint, por lo que su uso previsto es el despliegue dentro de ese entorno de hardware. No es un modelo generativo autonomo, sino un componente de aceleracion que debe combinarse con el modelo EXAONE-3.5-2.4B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal de decodificacion especulativa EAGLE3 sobre transformer (modelo base EXAONE-3.5-2.4B-Instruct); requiere `trust_remote_code` |
| Parametros totales | 524.422.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base EXAONE-3.5-2.4B-Instruct, no especificada en la informacion disponible) |
| Tipos de cuantizacion | no disponible (el modelo base figura como `base_model:quantized`, sin detalle del esquema) |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | EXAONE (license: other, license_name: exaone) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un cabezal EAGLE3, una variante de decodificacion especulativa que opera sobre las hidden states del modelo objetivo en lugar de sobre los tokens de entrada. El cabezal propone una secuencia de tokens candidatos que el modelo EXAONE-3.5-2.4B-Instruct verifica en una sola pasada, lo que permite reducir el numero de pasos de decodificacion secuencial y aumentar el throughput. El repositorio usa codigo personalizado (`custom_code`, tag `mobilint-exaone-eagle3`), por lo que la carga requiere `trust_remote_code=True`.

No se dispone de informacion sobre el volumen de datos de entrenamiento del cabezal, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica unicamente que el modelo esta compilado y optimizado para hardware NPU de mobilint y empaquetado para su pila de aceleracion. El modelo base declara una relacion `quantized` respecto a EXAONE-3.5-2.4B-Instruct, pero no se detalla el esquema de cuantizacion empleado.

## Capacidades

- Decodificacion especulativa: genera propuestas de multiples tokens por paso para acelerar la inferencia del modelo EXAONE-3.5-2.4B-Instruct.
- Generacion de texto conversacional: hereda las capacidades del modelo base (tag `conversational`).
- Multilingue limitado: ingles y coreano.
- Integracion con el stack de aceleracion NPU de mobilint.
- No soporta de forma autonoma tool calling, agentes, vision, audio ni modos de razonamiento extendido; cualquier capacidad de este tipo depende del modelo base con el que se empareje.

## Casos de uso

- Aceleracion de inferencia en produccion sobre NPU: desplegar el par EXAONE-3.5-2.4B-Instruct + cabezal EAGLE3 en hardware mobilint para reducir la latencia por token en comparacion con la decodificacion autoregresiva estandar.
- Servicio de chat en coreano e ingles: usar el modelo base con el cabezal para servir conversaciones multi-turno con menor coste por peticion en entornos con NPU mobilint.
- Reduccion de coste en despliegues de borde: al tratarse de un modelo base de 2,4B parametros con un cabezal de 524M, el conjunto encaja en escenarios con presupuesto de computo y memoria limitados.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: medir el factor de aceleracion de EAGLE3 frente a decodificacion especulativa clasica sobre el mismo modelo objetivo.
- Prototipado de pipelines de generacion de texto de baja latencia en investigacion: validar el impacto del cabezal en la calidad de salida (debe ser identica a la del modelo base) y en el throughput.
- Integracion en aplicaciones embebidas con NPU: empaquetar el modelo compilado dentro de la pila de mobilint para asistentes de texto locales en ingles o coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion de tokens, factores de aceleracion ni metricas de calidad para el cabezal EAGLE3.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 5,9 GB en safetensors; la inferencia requiere ademas cargar el modelo base EXAONE-3.5-2.4B-Instruct.
- GPU recomendadas: no disponible. El modelo esta compilado y optimizado para NPU de mobilint, no para GPU de proposito general.
- Compatibilidad con GPU de consumo: no confirmada; el uso previsto es el stack de aceleracion de mobilint.
- Opciones de despliegue: pila de aceleracion de mobilint; carga via `transformers` con `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilint/EAGLE3-EXAONE-3.5-2.4B-Instruct | 524M (cabezal) | no disponible | Decodificacion especulativa para EXAONE-3.5-2.4B | EXAONE | Hugging Face, optimizado para NPU mobilint |
| LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct | 2,4B | no disponible | Generacion de texto (modelo objetivo) | EXAONE | Hugging Face |
| Otros cabezales EAGLE3 publicos | no disponible | no disponible | Decodificacion especulativa | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base EXAONE-3.5-2.4B-Instruct para funcionar; por si solo no genera texto.
- Dependencia de hardware: esta compilado y optimizado para NPU de mobilint; el rendimiento fuera de ese entorno no esta garantizado ni documentado.
- Codigo personalizado: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar dicho codigo antes de usarlo en produccion.
- Idiomas limitados a ingles y coreano; el rendimiento en castellano no esta soportado ni evaluado.
- Licencia EXAONE: las condiciones de uso comercial se rigen por la licencia del modelo base, que debe revisarse antes de cualquier despliegue productivo.
- Sin datos publicados de benchmarks, tasas de aceptacion ni factores de aceleracion; no es posible estimar la ganancia real sin medicion propia.
- Riesgo de alucinacion y sesgos: heredados del modelo base EXAONE-3.5-2.4B-Instruct; la decodificacion especulativa no altera la distribucion de salida si la verificacion es correcta, pero cualquier fallo en la implementacion del cabezal podria degradar la calidad.
- Repositorio sin descargas ni likes en el momento de la consulta; ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/mobilint/EAGLE3-EXAONE-3.5-2.4B-Instruct
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct
- Licencia EXAONE: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct/blob/main/LICENSE
- Web de mobilint: https://mobilint.com
