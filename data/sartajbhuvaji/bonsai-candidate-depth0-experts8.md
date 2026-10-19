# sartajbhuvaji/bonsai-candidate-depth0-experts8

## Resumen

`sartajbhuvaji/bonsai-candidate-depth0-experts8` es un checkpoint de tipo mezcla de expertos (MoE) publicado en Hugging Face por el usuario sartajbhuvaji. El repositorio contiene 28.719.396.864 parametros (unos 28,7 mil millones) en formato safetensors, con un tamano total de 57,5 GB, lo que es coherente con un almacenamiento en bf16 (2 bytes por parametro). La etiqueta de arquitectura que declara la libreria `transformers` es `qwen3_moe`, es decir, el modelo se carga con la clase MoE de la familia Qwen3, aunque el autor no confirma de que checkpoint base parte ni si se trata de un modelo entrenado desde cero, podado, destilado o una variante experimental.

El problema principal de esta ficha es la ausencia casi total de documentacion: la model card es la plantilla autogenerada por Hugging Face y todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluacion) aparecen como "[More Information Needed]". No hay resultados de benchmarks, no se declara longitud de contexto, no se especifican idiomas y no hay licencia asociada al repositorio, lo que impide determinar si su uso comercial esta permitido.

Su relevancia actual es, por tanto, limitada y de caracter exploratorio: el nombre del repositorio ("bonsai-candidate", "depth0", "experts8") sugiere un candidato dentro de un experimento de compresion o reconfiguracion de capas y expertos, y las fechas de creacion y actualizacion (19 de octubre de 2026) resultan anomalas. Con 0 descargas y 0 likes, no existe validacion por parte de la comunidad. Se recomienda tratarlo como objeto de inspeccion tecnica, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de la familia Qwen3, segun la etiqueta `qwen3_moe` de `transformers`; base exacta no disponible |
| Parametros totales | 28.719.396.864 (~28,7 B), dato real de los safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (presumiblemente bf16). No se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 57,5 GB |
| Pipeline declarado | text-generation |
| Etiquetas | transformers, safetensors, qwen3_moe, text-generation, conversational, endpoints_compatible, region:us, arxiv:1910.09700 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19T16:51:14Z |
| Ultima actualizacion | 2026-10-19T16:53:14Z |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `qwen3_moe`, que indica que el checkpoint se instancia con la implementacion de mezcla de expertos de Qwen3 en `transformers`: atencion tipo transformer con capas MoE de enrutamiento por token (top-k expertos) en lugar de un FFN denso. El nombre del repositorio anade dos pistas no documentadas: `experts8`, que apunta a una configuracion de 8 expertes por capa MoE, y `depth0`, que sugiere una modificacion de profundidad (posiblemente una variante con cero capas del bloque original, un candidato de poda o una ablacion). Ninguna de estas dos interpretaciones esta confirmada por el autor.

No hay ningun dato sobre volumen de entrenamiento, composicion del corpus, uso de RLHF, DPO o ajuste por preferencias, hiperparametros, precision mixta ni infraestructura de computo. La model card incluye el enlace a `arxiv:1910.09700` (Lacoste et al., calculadora de impacto de carbono), que proviene de la plantilla por defecto de Hugging Face y no es un paper del modelo. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento).

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad garantizada por el pipeline `text-generation` y la etiqueta `conversational`.
- Conversacion multi-turno: la etiqueta `conversational` sugiere un formato de chat, pero no se publica plantilla de chat ni tokens especiales.
- Razonamiento, codigo y matematicas: no disponible; no hay evaluaciones ni declaraciones del autor.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision, audio o modalidades adicionales: no disponible; no hay torre visual ni procesador declarado en las etiquetas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato de pesos puede servirse en Hugging Face Inference Endpoints con `transformers`.

## Casos de uso

- Auditoria de checkpoints no documentados: cargar el modelo con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=False)` e inspeccionar `config.json` y los indices de los safetensors para reconstruir la configuracion real de expertos, numero de capas y `num_experts_per_tok`. Es el uso inmediato mas razonable dado el estado del repositorio.
- Investigacion sobre enrutamiento MoE: al tratarse de una variante con 8 expertos declarados en el nombre, sirve para estudiar balanceo de carga entre expertos, colapso de expertos y distribucion de activaciones, comparando con el checkpoint Qwen3-MoE del que derive.
- Experimentos de compresion y poda: el sufijo `depth0` lo convierte en candidato para reproducir tecnicas de reduccion de profundidad o de expertos, midiendo la degradacion de perplejidad frente al modelo original.
- Base para fine-tuning de dominio: con 28,7 B de parametros totales y activacion dispersa, un ajuste con LoRA sobre un corpus especializado (juridico, sanitario, industrial) es viable en una unica GPU de 80 GB, siempre que se resuelva antes la ambiguedad de licencia.
- Benchmarking de infraestructura de inferencia: util para medir throughput y latencia de vLLM o TGI con arquitectura MoE a esta escala, y para validar el soporte de `qwen3_moe` en la version de `transformers` desplegada.
- Generacion de texto en prototipos internos: si finalmente se confirma una licencia permisiva, puede emplearse en entornos de pruebas para resumen o redaccion asistida, sin exposicion a usuarios finales hasta disponer de evaluaciones.
- Reproducibilidad de publicaciones: como artefacto de un pipeline experimental, permite a revisores inspeccionar el resultado exacto de una configuracion concreta de expertos y profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 28,7 B de parametros, sin contar cache KV): bf16/fp16 ≈ 57,4 GB; fp8/int8 ≈ 28,7 GB; 6 bits ≈ 21,5 GB; 4 bits ≈ 14,4 GB; 3 bits ≈ 10,8 GB.
- Al ser MoE, la VRAM necesaria en inferencia viene determinada por los parametros totales (todos los expertos deben residir en memoria), no por los activos. No se dispone del numero de parametros activos para estimar el coste computacional por token.
- GPU recomendadas en bf16: H100 80 GB, A100 80 GB o una unica GPU de 80 GB con margen justo para cache KV; en configuraciones de 2x A100 40 GB o 2x L40S 48 GB seria necesario tensor parallelism.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB). Con cuantizacion de 4 bits (≈14,4 GB de pesos) cabria en teoria, pero el repositorio no publica pesos GGUF ni AWQ/GPTQ, por lo que habria que convertirlos y validar la arquitectura MoE en llama.cpp.
- Opciones de despliegue: `transformers` (soporte nativo declarado), vLLM y TGI si la version instalada reconoce `qwen3_moe`, y llama.cpp/Ollama solo tras conversion propia a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas publicas y no de la informacion proporcionada para este modelo; se incluyen como referencia de categoria.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Documentacion |
|---|---|---|---|---|---|
| bonsai-candidate-depth0-experts8 | 28,7 B | no disponible | no disponible | no disponible | Practicamente inexistente |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Model card completa y benchmarks publicados |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 tokens | Apache 2.0 | Model card completa y benchmarks publicados |

Frente a Qwen3-30B-A3B, el modelo aqui descrito tiene un tamano total muy parecido, pero carece de licencia, contexto declarado, idiomas y evaluaciones, ademas de una relacion de activacion desconocida que impide comparar coste de inferencia. Frente a Mixtral 8x7B es un 39 % mas pequeno en parametros totales, aunque sin datos que permitan situarlo en calidad.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla autogenerada; no hay informacion sobre entrenamiento, datos, evaluacion ni uso previsto.
- Licencia no disponible: sin licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion. En la practica, el modelo debe tratarse como no apto para produccion hasta que el autor lo aclare.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas, y no hay evaluaciones multilingues.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion no cuantificado: al no existir evaluaciones de fidelidad ni de calibracion, no puede acotarse la tasa de error factual.
- Sesgos desconocidos: no se documenta composicion del corpus ni filtrado, por lo que no pueden evaluarse sesgos de genero, etnicos o culturales.
- Estado experimental: el nombre del repositorio sugiere un candidato intermedio de un pipeline de investigacion; podria tratarse de un checkpoint no finalizado o de una ablacion sin utilidad practica.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes implican que no hay informes independientes de calidad ni de fallos.
- Metadata anomala: las fechas de creacion y actualizacion (octubre de 2026) no coinciden con un repositorio consolidado; conviene verificar la procedencia antes de integrarlo en cualquier flujo.
- Etiqueta `arxiv:1910.09700` enganosa: corresponde a la calculadora de impacto de carbono de la plantilla, no a un paper del modelo.
- Sin pesos cuantizados oficiales: cualquier despliegue en GPU de consumo exige conversion propia y validacion de la correccion numerica de la arquitectura MoE.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sartajbhuvaji/bonsai-candidate-depth0-experts8
- Perfil del autor: https://huggingface.co/sartajbhuvaji
- Referencia citada en la plantilla (Lacoste et al., 2019, calculadora de impacto de carbono, no es paper del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML mencionada en la plantilla: https://mlco2.github.io/impact#compute
