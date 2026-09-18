# BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF

## Resumen

Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF es una redistribución del modelo ternario `prism-ml/Ternary-Bonsai-2-27B-gguf` en la que el autor (BoldingBuilds) ha eliminado el comportamiento de rechazo (abliteration) modificando un número reducido de dígitos ternarios in situ, sin tocar las escalas de bloque ni recuantizar el modelo. Se publica en formato GGUF, con dos ficheros: uno de 7,21 GB con los pesos del modelo de lenguaje y otro de 7,66 GB que añade una cabeza de predicción multi-token (MTP) de 15 tensores para habilitar decodificación especulativa.

El modelo tiene 26.895.998.464 parámetros (26,9B) y una licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su principal atractivo es el empaquetado ternario a 2,13 bits por peso (PQ2_0), que reduce el peso en disco a poco más de 7 GB y permite ejecutarlo íntegramente en una GPU de consumo, junto con la variante MTP que acelera la decodificación un 37% en cargas de trabajo estructuradas.

Es relevante ahora porque combina tres tendencias: cuantización extrema por debajo de 3 bits, arquitecturas híbridas con capas de estado (SSM) y decodificación especulativa auto-contenida, todo ello en un paquete ejecutable con llama.cpp. El coste medido de la compresión ternaria frente al modelo padre no ternario es de aproximadamente 5,2 puntos porcentuales en MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cuantizado en ternario con capas de atencion y de estado (SSM); los tensores modificados incluyen `attn_output`, `ssm_out` y `ffn_down`. La model card la asocia a la familia Qwen3.5/Qwen3.8-27B, pero no se detalla la topologia completa |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de ejecucion de la model card usa `-c 32768` |
| Tipos de cuantizacion | Empaquetado ternario PQ2_0 (2,13 bits por peso). Existe una variante PTQ1_0 del mismo autor (1,75 bpw) |
| Idiomas soportados | No disponible (la model card no publica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero base de 7,21 GB y fichero con MTP de 7,66 GB; repositorio de 14,9 GB) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una edicion quirurgica sobre `prism-ml/Ternary-Bonsai-2-27B-gguf`. El autor modifico 98 de los 851 tensores del modelo (0,20-0,27% de los digitos ternarios dentro de esos tensores), concretamente los tensores que escriben en la corriente residual — `ffn_down`, `ssm_out` y `attn_output` — en los bloques 15 a 63. Las escalas de bloque no se alteraron y el resto de tensores es byte a byte idéntico a la publicacion de PrismML. La presencia de tensores `ssm_out` junto a tensores de atencion apunta a una arquitectura hibrida con capas de espacio de estados, coherente con la familia Qwen3.5 referenciada en las etiquetas, aunque la model card no describe el entrenamiento original ni la composicion del dataset.

La innovacion tecnica destacable es el injerto de la cabeza de prediccion multi-token (MTP) de Qwen3.8-27B, que anade 15 tensores `blk.64.*` y habilita `--spec-type draft-mtp` en llama.cpp. Con la especulacion desactivada, ambos ficheros generan texto identico byte a byte (verificado en 5 de 5 prompts de 400 tokens). El MTP requiere un parche de 14 lineas (`0001-qwen35-mtp-hadamard-inverse.patch`) sobre la etiqueta `prism-b10687-5d80cff` del fork `PrismML-Eng/llama.cpp`, porque los modelos ternarios de PrismML almacenan `token_embd.weight` rotado y el grafo borrador del MTP omite la transformada inversa de Hadamard. El mismo fallo fue detectado y corregido de forma independiente por los usuarios decent-jawfish y ProCreations.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento y generacion de codigo: medido con 96,9 tok/s y 0,833 de aceptacion especulativa en prompts de razonamiento, y 95,7 tok/s con 0,818 en codigo Python.
- Salida estructurada en JSON: 94,0 tok/s con 0,790 de aceptacion.
- Decodificacion especulativa auto-contenida mediante cabeza MTP (`--spec-type draft-mtp`), con `--spec-draft-n-max 2` como configuracion optima medida.
- Respuestas sin rechazo: 0,0% de rechazo en SimpleSafetyTests (n=100) y 0,0% de sobrerrechazo en XSTest-safe (n=250), juzgado por un modelo evaluador.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documentan capacidades de vision, audio, tool calling ni uso de agentes en la informacion disponible.
- No se publica lista de idiomas soportados.

## Casos de uso

- Generacion de codigo en local: el modelo cabe en una GPU de consumo y alcanza 95,7 tok/s con especulacion en prompts de codigo Python, con una tasa de aceptacion de 0,818, lo que lo hace util para autocompletado o generacion de funciones en estaciones de trabajo sin GPU de centro de datos.
- Razonamiento encadenado por lotes: con 96,9 tok/s y 0,833 de aceptacion en prompts de razonamiento, es adecuado para pipelines de generacion de cadenas de pensamiento o sintesis de datos donde el coste por token importa y el hardware es limitado.
- Generacion de JSON para integracion de sistemas: la salida estructurada mantiene 94,0 tok/s con 0,790 de aceptacion, util para extraccion de campos, normalizacion de registros o rellenado de esquemas en backends.
- Investigacion sobre abliteration y seguridad: al publicar cifras pareadas de rechazo y sobrerrechazo (83,0% a 0,0% y 1,6% a 0,0%) con un modelo evaluador, sirve como referencia reproducible para estudiar el efecto de eliminar el comportamiento de rechazo en modelos ternarios.
- Experimentacion con cuantizacion extrema: con 2,13 bpw y un coste medido de 5,2 puntos porcentuales en MMLU frente al padre no ternario, es un banco de pruebas para medir degradacion a 2 bits en tareas de conocimiento.
- Evaluacion de decodificacion especulativa con MTP: el repositorio incluye medidas por tipo de prompt (razonamiento, codigo, JSON, explicacion tecnica y prosa libre), lo que permite reproducir y comparar estrategias de borrador en distintas GPU.
- Despliegue de asistentes sin filtros de rechazo: para casos donde el rechazo del modelo base resulta un obstaculo (redaccion de ficcion con contenido dificil, analisis de seguridad ofensiva o investigacion sobre prompts adversarios), asumiendo las advertencias de la seccion de limitaciones.
- Ejecucion en una unica RTX 3090: el ejemplo de la model card usa `-ngl 99 -fa on -c 32768 --jinja`, es decir, todo el modelo descargado en GPU con atencion flash, un escenario realista para equipos de investigacion con hardware de gama alta de consumo.

## Benchmarks y rendimiento

MMLU, split de test completo (14.042 preguntas), 0-shot, logit de la letra del siguiente token. Las cifras corresponden al build PTQ1_0 del mismo metodo; el autor indica que la ejecucion sobre PQ2_0 esta en curso y que actualizara la model card.

| Modelo | MMLU |
|---|---:|
| Qwen3.8-27B Q4_K_M (referencia no ternaria) | 0,8318 |
| Ternary Bonsai 2 PTQ1_0 original | 0,7802 |
| Este metodo, PTQ1_0 | 0,7814 |

El autor senala que la edicion cuesta +0,12 puntos porcentuales (McNemar exacto p = 0,51 sobre 577 pares discordantes), es decir, sin efecto medible, y que la compresion ternaria en si cuesta unos 5,2 puntos porcentuales frente al padre no ternario (p = 2,6e-71).

Rechazo y sobrerrechazo, evaluados con un modelo juez y los mismos ajustes en todas las filas:

| Metrica | Bonsai 2 original | Este modelo |
|---|---:|---:|
| Rechazo, SimpleSafetyTests (n=100) | 83,0% | 0,0% |
| Sobrerrechazo, XSTest-safe (n=250) | 1,6% | 0,0% |
| Rechazo parcial, XSTest-safe | 1,6% | 0,0% |

Decodificacion, una RTX 3090, 5 prompts de 400 tokens, `--parallel 1`, greedy, mediana:

| Configuracion | tok/s | Aceptacion |
|---|---:|---:|
| Sin MTP | 68,8 | — |
| `--spec-draft-n-max 2` | 94,0 | 0,643 |
| `--spec-draft-n-max 4` | 86,3 | 0,445 |
| `--spec-draft-n-max 3` | 84,7 | 0,520 |

Ganancia de la especulacion segun el tipo de contenido (linea base 68,8 tok/s):

| Tipo de prompt | tok/s | Aceptacion |
|---|---:|---:|
| Razonamiento | 96,9 | 0,833 |
| Codigo Python | 95,7 | 0,818 |
| Salida JSON | 94,0 | 0,790 |
| Explicacion tecnica | 75,7 | 0,535 |
| Prosa libre | 65,0 | 0,391 |

En prosa libre la especulacion resulto mas lenta que no usarla. El mismo injerto sobre el build PTQ1_0 rindio solo +1,6%, con una aceptacion similar (0,648) pero una verificacion que no compensa; ademas PTQ1_0 decodifica mas lento (57,8 tok/s) que PQ2_0 (68,8 tok/s) pese a ser 1,26 GB mas pequeno.

## Requisitos de hardware

- VRAM para los pesos: 7,21 GB (fichero sin MTP) o 7,66 GB (fichero con MTP).
- VRAM total recomendada: alrededor de 10-12 GB para contexto moderado con atencion flash; el ejemplo publicado carga todo el modelo en GPU (`-ngl 99`) sobre una RTX 3090 de 24 GB con `-c 32768`, por lo que el presupuesto de KV cache queda cubierto con holgura en esa tarjeta.
- Cabe en GPU de consumo: si, en RTX 3090 (medida), y previsiblemente en RTX 4080/4090, RTX 3080 Ti y tarjetas de 12 GB o mas con contexto reducido.
- GPU de centro de datos compatibles: A100, H100, L40S y similares, aunque el modelo esta pensado para inferencia local y no se publican medidas en esas tarjetas.
- Opciones de despliegue: llama.cpp / `llama-server` (unico runtime con soporte documentado). Para la variante MTP es obligatorio un binario parcheado (`prism-b10687-5d80cff` mas `0001-qwen35-mtp-hadamard-inverse.patch`), compilado con `-DGGML_CUDA=ON` y `-DLLAMA_CURL=OFF`. El fichero sin MTP funciona en binarios estandar.
- Latencia y throughput medidos: 68,8 tok/s sin especulacion y 94,0 tok/s con `--spec-draft-n-max 2` en una RTX 3090, con degradacion a 65,0 tok/s en prosa libre.
- Comando de referencia: `llama-server -m Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP.gguf -ngl 99 -fa on -c 32768 --jinja --spec-type draft-mtp --spec-draft-n-max 2`.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | MMLU | Contexto | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| Este modelo (PQ2_0, abliterated, MTP) | 26,9B | PQ2_0, 2,13 bpw | No medido aun en PQ2_0 | `-c 32768` en el ejemplo | Apache 2.0 | GGUF, 7,21/7,66 GB, 5.443 descargas |
| BoldingBuilds Ternary-Bonsai-2-27B-Abliterated-PTQ1_0 | 26,9B | PTQ1_0, 1,75 bpw | 0,7814 | No disponible | Apache 2.0 | GGUF, 1.680 descargas; el MTP no aporta (+1,6%) |
| Ternary Bonsai 2 PTQ1_0 original (PrismML) | 26,9B | PTQ1_0, 1,75 bpw | 0,7802 | No disponible | No disponible en la informacion proporcionada | GGUF, modelo base |
| Qwen3.8-27B Q4_K_M (no ternario) | 27B (nominal) | Q4_K_M | 0,8318 | No disponible | No disponible en la informacion proporcionada | Referencia no ternaria citada en la model card |

No se dispone de datos de benchmarks ni de especificaciones del resto de alternativas de la misma categoria mas alla de las cifras citadas por el autor.

## Limitaciones y advertencias

- El modelo ha eliminado el comportamiento de rechazo: 0,0% de rechazo en SimpleSafetyTests y 0,0% de sobrerrechazo en XSTest-safe. Generara contenido ante peticiones daninas si no se interpone un filtro externo; no es adecuado para despliegues orientados al publico sin moderacion adicional.
- La eliminacion del rechazo modifica 98 tensores con solo 0,20-0,27% de digitos ternarios cambiados, lo que demuestra que el comportamiento de seguridad puede alterarse con ediciones minimas sobre un empaquetado cuantizado; conviene auditar cualquier build derivado.
- Las cifras de MMLU publicadas corresponden al build PTQ1_0, no a PQ2_0. El propio autor advierte que no asume que el numero se traslade y que actualizara la tarjeta cuando termine la ejecucion sobre PQ2_0.
- La compresion ternaria degrada unos 5,2 puntos porcentuales de MMLU frente al modelo padre no ternario; es una perdida atribuible a la cuantizacion, no a la abliteration.
- La variante MTP exige un runtime parcheado y falla al arrancar en binarios estandar con el error `Hadamard-latent table 'token_embd.weight' is read without the inverse transform`. Sin parche, hay que usar el fichero sin MTP.
- La decodificacion especulativa penaliza la prosa libre: 65,0 tok/s frente a 68,8 tok/s de linea base, con una aceptacion de solo 0,391.
- La ganancia del MTP depende del tipo de carga; el valor optimo de `--spec-draft-n-max` (2 en la RTX 3090 del autor) debe reajustarse en cada GPU.
- La model card no publica lista de idiomas, longitud de contexto oficial, composicion del dataset de entrenamiento ni detalles del RLHF/DPO del modelo original.
- No se documentan capacidades de tool calling, agentes, vision ni audio; asumir su presencia en produccion seria infundado.
- Las evaluaciones de rechazo y sobrerrechazo dependen de un unico modelo juez; no se publican intervalos de confianza ni evaluaciones con multiples jueces.
- Riesgo de alucinacion propio de un modelo de 27B cuantizado a 2 bits: no se han publicado evaluaciones de veracidad ni de tasa de alucinacion en la informacion disponible.
- La licencia Apache 2.0 cubre el artefacto publicado, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no declaradas en esta ficha.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF
- Variante PTQ1_0 (1,75 bpw, mismo metodo de abliteration): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp usado para el parche: https://github.com/PrismML-Eng/llama.cpp
- Parche incluido en el repositorio: `0001-qwen35-mtp-hadamard-inverse.patch` (sobre la etiqueta `prism-b10687-5d80cff`)
- Trabajo independiente con el mismo arreglo del MTP: https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
- Trabajo independiente con el mismo arreglo del MTP: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web disponibles.
