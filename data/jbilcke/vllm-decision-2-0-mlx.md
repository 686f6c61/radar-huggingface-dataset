# jbilcke/vllm-decision-2.0-mlx

## Resumen

Decision 2.0 MLX es una conversión comunitaria a MLX de la familia Decision 2.0, publicada por el usuario jbilcke. No es un modelo generativo al uso: combina un backbone de texto compacto de la familia Qwen (Qwen3 y Qwen3.5 text) con un cabezal de decisión entrenado que puntúa un menú de opciones proporcionado por quien llama. Dado un contexto, una pregunta y una lista de descripciones candidatas, el modelo devuelve puntuaciones normalizadas sobre los candidatos, una puntuación booleana o un nivel ordinal esperado.

La colección agrupa tres variantes: Kai 0.6B (backbone Qwen3, 597.103.104 parámetros incluyendo el cabezal, 8.192 tokens de entrada máxima serializada), Eos 0.8B (backbone Qwen3.5 text, 753.446.208 parámetros, 16.384 tokens) y Sol 2B (backbone Qwen3.5 text, 1.883.930.944 parámetros, 16.384 tokens). Cada variante se distribuye en varios paquetes con precisión mixta o cuantizada (mixed, q4 y, solo para Kai, q8), manteniendo siempre el cabezal de decisión completo en FP32.

Su relevancia actual radica en que permite ejecutar de forma totalmente local y sin conexión tareas de decisión y clasificación sobre Apple Silicon, sin depender de servicios en la nube ni de telemetría. Es una conversión de los lanzamientos originales de vllm-sr: no se ha realizado entrenamiento ni ajuste fino adicional, por lo que su valor está en el empaquetado, la cuantización y el contrato de entrada/salida reproducible, no en una mejora del modelo subyacente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbones Qwen3 / Qwen3.5 text) con cabezal de decisión entrenado (LayerNorms de candidato/consulta, proyecciones bilineales y MLP con GELU exacto) |
| Parametros totales | Kai 0.6B: 597.103.104; Eos 0.8B: 753.446.208; Sol 2B: 1.883.930.944 (todos incluyen el cabezal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Kai: 8.192 tokens de entrada máxima serializada; Eos y Sol: 16.384 tokens |
| Tipos de cuantizacion | mixed (matrices lineales en BF16 de origen y resto de tensores en FP32), q4 y q8 (cuantización afín con grupos de 64 en módulos Linear y Embedding compatibles); el cabezal de decisión permanece en FP32 en todos los paquetes |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); precisión mixta BF16/FP32 y variantes cuantizadas q4/q8 |

Detalle por variante y paquete:

| Variante | Backbone | Parametros (con cabezal) | Entrada maxima | Directorios |
|---|---|---:|---:|---|
| Kai 0.6B | Qwen3 | 597.103.104 | 8.192 tokens | `kai/mixed`, `kai/q4`, `kai/q8` |
| Eos 0.8B | Qwen3.5 text | 753.446.208 | 16.384 tokens | `eos/mixed`, `eos/q4` |
| Sol 2B | Qwen3.5 text | 1.883.930.944 | 16.384 tokens | `sol/mixed`, `sol/q4` |

Tamaños de descarga publicados (bytes de pesos del modelo / bytes del paquete completo):

| Paquete | Pesos (bytes) | Paquete completo (bytes) |
|---|---:|---:|
| `kai/mixed` | 1.507.647.373 | 1.519.139.286 |
| `kai/q4` | 349.525.513 | 361.017.558 |
| `kai/q8` | 647.517.969 | 659.010.017 |
| `eos/mixed` | 2.018.595.501 | 2.038.652.078 |
| `eos/q4` | 445.125.255 | 465.181.964 |
| `sol/mixed` | 4.790.330.229 | 4.810.387.780 |
| `sol/q4` | 1.100.706.850 | 1.120.764.537 |

## Arquitectura y entrenamiento

Cada paquete combina un backbone de texto Qwen (Qwen3 en Kai, Qwen3.5 text en Eos y Sol) con un cabezal de decisión entrenado. El cabezal incluye LayerNorms específicas para candidato y consulta, proyecciones bilineales y una MLP con GELU exacto, y se mantiene en FP32 en todas las variantes, incluidas las cuantizadas. Los backbones cuantizados emplean cuantización afín con grupos de 64 aplicada a módulos Linear y Embedding compatibles; el paquete `mixed` conserva las matrices lineales originales en BF16 y el resto de tensores en FP32.

Se trata de una conversión comunitaria de los lanzamientos upstream de vllm-sr. El autor indica explícitamente que no se ha realizado entrenamiento ni ajuste fino nuevo: el trabajo es de portabilidad a MLX, cuantización y empaquetado del contrato de prompt/tokenizer, con procedencia de conversión fijada y verificable mediante checksums. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en los modelos originales. La variante Nox 4B no está incluida en este lanzamiento; su estado de preparación se describe por separado en la model card.

## Capacidades

- Decisión por elección (`choice`): acepta entre 2 y 255 claves de opción únicas y no vacías, con descripciones definidas por quien llama; devuelve la clave elegida, una confianza de entropía normalizada y las probabilidades por candidato.
- Decisión booleana (`noul`): recibe exactamente las claves `false` y `true`, cada una con descripción, y devuelve `{"type": "noul", "noul": P(true)}`.
- Puntuación ordinal (`score`): acepta de 2 a 10 niveles con claves `"0"` a `"L-1"` y devuelve el nivel esperado indexado desde cero, la confianza, las probabilidades y una leyenda de niveles.
- Entrada flexible: `state` e `instructions` aceptan texto JSON finito, objetos o arrays; las instrucciones no pueden ser cadena vacía y las descripciones de opciones admiten texto, objetos o arrays (en `choice` también `null`).
- Preservación del orden de opciones, con la primera opción ganando en caso de empate exacto.
- Ejecución local offline: la inferencia lee el directorio instalado y no tiene respaldo en la nube ni telemetría.
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo de pensamiento.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

- Enrutamiento de decisiones en agentes: usar el modo `choice` para seleccionar, entre un conjunto finito de acciones o herramientas descritas por el desarrollador, la más adecuada dado un estado del entorno; es adecuado porque devuelve probabilidades normalizadas que permiten fijar umbrales de confianza antes de actuar.
- Clasificación de intención en asistentes: mapear una consulta a una de las intenciones predefinidas mediante el modo `choice`, con la ventaja de que las descripciones de cada intención se ajustan sin reentrenar el modelo.
- Moderación y verificación booleana: emplear el modo `noul` para responder preguntas de sí/no (por ejemplo, si un texto cumple una política concreta), devolviendo directamente la probabilidad de `true`.
- Puntuación de calidad o severidad: usar el modo `score` para asignar un nivel ordinal de 0 a L-1 (por ejemplo, gravedad de un informe, calidad de una respuesta o prioridad de una incidencia), con el nivel esperado y su leyenda.
- Anotación automática de datasets: etiquetar grandes volúmenes de ejemplos localmente en Apple Silicon con el paquete `q4` más pequeño, reduciendo coste y evitando enviar datos a terceros.
- Selección de respuesta en pipelines de generación: dado un contexto y varias respuestas candidatas descritas, elegir la mejor mediante `choice` como paso de reranking previo a la entrega final.
- Decisión en sistemas de recomendación: puntuar opciones descritas por el llamador (productos, rutas, configuraciones) y ordenarlas por probabilidad normalizada.
- Filtrado previo en flujos con requisitos de privacidad: ejecutar decisiones sensibles de forma totalmente offline, sin conexión de red, aprovechando que no existe respaldo en la nube ni telemetría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con un dispositivo Metal visible. El modelo no está pensado para CUDA ni para GPU de otros fabricantes.
- Entorno validado: Python 3.14, MLX/MLX-LM 0.31.1 y macOS 27; las dependencias están fijadas dentro de cada paquete y otras combinaciones de Python/OS requieren validación propia.
- Huella de descarga orientativa por paquete (tamaño de archivos, no consumo máximo de RAM): `kai/q4` 361 MB, `kai/q8` 659 MB, `kai/mixed` 1,52 GB, `eos/q4` 465 MB, `eos/mixed` 2,04 GB, `sol/q4` 1,12 GB, `sol/mixed` 4,81 GB.
- Cabe en cualquier Mac Apple Silicon: los paquetes `q4` de Kai, Eos e incluso Sol (1,12 GB) son fácilmente desplegables en equipos consumer; `sol/mixed` (4,81 GB) exige más memoria unificada.
- Aviso del autor: los tamaños de descarga excluyen memoria de activación, mapeos residentes, búferes de tiempo de ejecución y sobrecarga del asignador, por lo que no son una estimación de RAM máxima.
- Despliegue: mediante MLX/MLX-LM y las funciones incluidas en cada paquete (`predict`, `load_bundle`, `encode`, `answer`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue.
- Comprobación previa de Metal: el paquete ejecuta un preflight de Metal antes de importar MLX y aborta con un error legible si no hay dispositivo disponible; no concede permisos de dispositivo.
- Para peticiones repetidas, se recomienda mantener el modelo cargado y serializar el acceso en lugar de recargar los pesos en cada solicitud.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Las tres variantes de la propia colección son la comparación más directa disponible. No se dispone de datos externos de rendimiento para comparar con alternativas de la misma categoría.

| Modelo | Backbone | Parametros (con cabezal) | Entrada maxima | Paquetes | Licencia |
|---|---|---:|---:|---|---|
| Decision 2.0 Kai 0.6B (esta conversion) | Qwen3 | 597.103.104 | 8.192 tokens | mixed, q4, q8 | apache-2.0 |
| Decision 2.0 Eos 0.8B (esta conversion) | Qwen3.5 text | 753.446.208 | 16.384 tokens | mixed, q4 | apache-2.0 |
| Decision 2.0 Sol 2B (esta conversion) | Qwen3.5 text | 1.883.930.944 | 16.384 tokens | mixed, q4 | apache-2.0 |

Como referencia de procedencia, los modelos upstream son `vllm-sr/Decision-2.0-Kai-0.6B`, `vllm-sr/Decision-2.0-Eos-0.8B` y `vllm-sr/Decision-2.0-Sol-2B`, de los que esta colección es una conversión comunitaria a MLX. La variante Nox 4B no está disponible en este lanzamiento.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce puntuaciones de decisión (elección, booleano o nivel ordinal); no genera texto libre.
- Idiomas soportados no especificados; no hay garantía de comportamiento correcto fuera de los idiomas cubiertos por los backbones Qwen originales.
- Dependencia estricta de Apple Silicon con Metal: no es ejecutable en CUDA ni en GPU de otros fabricantes.
- Entorno validado muy concreto (Python 3.14, MLX/MLX-LM 0.31.1, macOS 27); otras combinaciones pueden no funcionar sin validación adicional.
- Es una conversión comunitaria sin entrenamiento nuevo: no incorpora mejoras de calidad sobre los modelos upstream y su procedencia debe verificarse mediante los checksums publicados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no cuenta con validación de la comunidad.
- Riesgo de alucinación o de puntuaciones mal calibradas no evaluado: no se han publicado benchmarks ni métricas de calibración.
- Los tamaños publicados excluyen memoria de activación, mapeos residentes, búferes y sobrecarga del asignador; no deben interpretarse como requisitos de RAM máxima.
- Recomendación operativa: mantener el modelo cargado y serializar el acceso para peticiones repetidas, ya que `predict` carga y verifica el paquete en cada llamada.
- La variante Nox 4B no está incluida en este lanzamiento.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar también las condiciones de los modelos upstream y del backbone Qwen subyacente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbilcke/vllm-decision-2.0-mlx
- Modelo base Kai 0.6B: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B
- Modelo base Eos 0.8B: no se ha proporcionado enlace directo en la información disponible (referenciado como `vllm-sr/Decision-2.0-Eos-0.8B`)
- Modelo base Sol 2B: no se ha proporcionado enlace directo en la información disponible (referenciado como `vllm-sr/Decision-2.0-Sol-2B`)
- Inventario y checksums: `models.json` y `SHA256SUMS` dentro del repositorio
- El único resultado de búsqueda web proporcionado (una página de repos destacados en Notion) no guarda relación con este modelo y no aporta enlaces relevantes.
