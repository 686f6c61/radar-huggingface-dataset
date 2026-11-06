# scasella91/Qwen3.5-0.8B-toolpatch-g23v3

## Resumen

Qwen3.5-0.8B-toolpatch-g23v3 es un checkpoint derivado de Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) publicado por el usuario scasella91. No se trata de un fine-tuning convencional: es un artefacto de interpretabilidad mecanicista en el que se ha aplicado una única edicion cerrada de pesos sobre la capa MLP final (capa 23) del modelo base, sin ningun paso de gradiente. El objetivo es corregir un comportamiento concreto del modelo base: cuando recibe una peticion de explicacion o una llamada a herramienta con un argumento obligatorio ausente, el modelo base tiende a emitir un `<tool_call>` con argumentos inventados en lugar de abstenerse o pedir aclaracion.

La edicion repurposea dos neuronas practicamente muertas del MLP de la capa 23 (neuronas 3468 y 3421) como un mecanismo de lectura condicionado que fuerza las salidas literales `NO_TOOL` (para peticiones de explicacion) y `NEED_CLARIFICATION` (cuando falta un argumento requerido). Se modifican 6.142 entradas en BF16 (0,00082 % de los 752 M de parametros del modelo de texto) en tres tensores, calculadas analiticamente a partir de activaciones capturadas mediante diferencia de medias, ortogonalizacion y minimos cuadrados.

El modelo tiene 873.438.784 parametros totales segun safetensors, pipeline image-text-to-text (conserva la torre de vision del base, byte-identica), licencia Apache 2.0 y un tamano de repositorio de 1,8 GB. Es relevante como demostracion de "weight-space programming": instalar una funcionalidad de comportamiento mediante edicion de pesos dirigida por interpretabilidad, sin reentrenamiento, con verificacion criptografica de que el resto del checkpoint es identico al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con torre de vision; edicion sobre MLP de la capa 23 del modelo de lenguaje |
| Parametros totales | 873.438.784 (safetensors); 752 M en el modelo de texto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en BF16; el autor menciona ejecucion en MLX BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), compatible con transformers; artefactos adicionales `.npz` (vectores y bits editados) y `apply_g23v3.py` |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-0.8B, un transformer multimodal (image-text-to-text) con torre de vision, tokenizer y chat template que se mantienen byte-identicos al base. La intervencion afecta exclusivamente a tres tensores del MLP de la capa 23 (`model.language_model.layers.23.mlp`): `gate_proj.weight` (3584 × 1024), `up_proj.weight` (3584 × 1024) y `down_proj.weight` (1024 × 3584), todos en BF16. Se modifican 2.047 entradas en cada uno de los dos primeros (filas 3468 y 3421) y 2.048 en el tercero (columnas 3468 y 3421).

No hay entrenamiento ni gradientes: cada valor se calcula en forma cerrada a partir de activaciones capturadas. La construccion usa dos caracteristicas del residual stream: **s** (peticion de explicacion, diferencia de medias abstain − call en la capa 18, ortogonalizada) y **r** (clarify vs explain, diferencia de medias en la capa 14, ortogonalizada al punto medio). Las compuertas **c** y **c₂** cierran la SiLU en el primer token de prompts sin herramientas y en cada posicion generada, de forma que la lectura solo se activa en el token de decision de un prompt con contexto de herramientas. Las direcciones de salida (`u_AB`, `u_NE − u_NO`) son soluciones de minimos cuadrados de norma minima en el espacio residual previo a la RMSNorm final, con efecto unitario sobre los logits de `NO`/`NE`/`<tool_call>` y −0,5 sobre los arranques en prosa `I`, `To`, `The`, y efecto nulo sobre 39 tokens competidores. El motivo del diseno: el analisis de atribucion directa de logits sobre las 86.016 neuronas MLP del base no encuentra ninguna neurona que empuje selectivamente `<tool_call>` en peticiones que no son llamadas (ninguna por encima de ~0,2 logits), por lo que el fallo se interpreta como una inhibicion ausente y no como algo ablacionable. La edicion instala esa lectura en la ultima capa, donde la escritura se escala una sola vez por la RMSNorm final y, al construirse la KV cache desde la entrada de la capa, no contamina el resto del calculo.

## Capacidades

- Generacion de texto y respuesta conversacional, heredadas del modelo base Qwen3.5-0.8B.
- Capacidad multimodal image-text-to-text (torre de vision intacta), aunque la edicion no se ha evaluado con entradas de vision.
- Tool calling con el chat template oficial y bloque nativo `<tools>`.
- Abstención explicita: emite `NO_TOOL` ante peticiones de explicacion en contexto de herramientas.
- Solicitud de aclaracion: emite `NEED_CLARIFICATION` cuando falta un argumento obligatorio, en lugar de inventarlo.
- Ejecucion con `enable_thinking=False` en el protocolo evaluado (modo sin razonamiento explicito).
- Compatibilidad con transformers y con MLX en Apple Silicon (BF16).

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el checkpoint sirve como caso reproducible de edicion de pesos en espacio de pesos; el repositorio incluye vectores, especificacion, script de aplicacion y ledger de experimentos con hash encadenado para replicar el calculo.
- Auditoria de comportamiento de tool calling: permite estudiar como un modelo pequeño decide entre llamar a una herramienta, abstenerse o pedir aclaracion, con un efecto medido bajo un protocolo fijo.
- Prototipado de agentes con guardarraíles: en flujos donde una llamada con argumentos inventados es costosa, el modelo puede usarse para forzar abstención o aclaracion en lugar de una llamada erronea, siempre dentro del protocolo evaluado.
- Ensenanza y divulgacion: demostracion practica de atribucion directa de logits, diferencia de medias y ortogonalizacion aplicadas a un modelo de 0,8 B ejecutable en hardware de consumo.
- Validacion de pipelines de edicion de pesos: `apply_g23v3.py` reconstruye la edicion desde los vectores y verifica los SHA-256, util como test de integridad en CI para herramientas de weight-space programming.
- Experimentos en Apple Silicon: al ejecutarse en MLX BF16, es adecuado para pruebas locales de decodificacion codiciosa con limite de 128 tokens nuevos.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks publicos (MMLU, HumanEval, GSM8K, BFCL u otros). El autor indica explicitamente que la edicion solo se evaluo en un benchmark sintetico de herramientas generado por campana (familias de herramientas inertes, dos funciones confundibles por prompt, notas distractoras), bajo un unico protocolo: chat template oficial con bloque `<tools>`, un system prompt fijo que instruye los literales `NO_TOOL` / `NEED_CLARIFICATION`, `enable_thinking=False`, decodificacion codiciosa, ≤ 128 tokens nuevos y MLX BF16 en Apple Silicon. No se proporcionan cifras numericas de ese benchmark en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 873 M de parametros en BF16 el peso ronda 1,8 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la informacion; el autor solo documenta ejecucion en Apple Silicon con MLX en BF16.
- Cabe en GPU de consumo: si, por tamano (menos de 2 GB de pesos en BF16), aunque no se documentan pruebas en GPU concretas.
- Opciones de despliegue: transformers (libreria declarada) y MLX; no se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-toolpatch-g23v3 | 873.438.784 | no disponible | Edicion cerrada de 6.142 entradas BF16 en MLP capa 23 | Apache 2.0 | Hugging Face (scasella91) |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B (752 M en texto) | no disponible | Ninguna | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas de 0,8 B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy restringido: evaluado solo en un benchmark sintetico propio, con un unico system prompt (mas una variante "concise"), decodificacion codiciosa, `enable_thinking=False` y ≤ 128 tokens nuevos.
- No evaluado en BFCL ni en otros benchmarks publicos de tool calling, ni en uso multi-turno de herramientas, ni con otras configuraciones de decodificacion, ni con entradas de vision.
- El autor lo describe como artefacto de interpretabilidad con un efecto medido bajo ese protocolo, no como una mejora de proposito general.
- Riesgo de alucinacion: la edicion corrige un modo concreto de invencion de argumentos, pero no elimina el riesgo general del modelo base.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles; el checkpoint no declara idiomas soportados.
- Uso comercial: permitido por Apache 2.0, con las condiciones de la licencia del modelo base enlazada por el autor.
- Integridad: cualquier uso en produccion requiere verificar los SHA-256 documentados; el resto de tensores es byte-identico al base solo si se parte de la revision exacta indicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revision del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Codigo, datos y ledger de experimentos: https://github.com/scasella/qwen3.5-toolpatch
