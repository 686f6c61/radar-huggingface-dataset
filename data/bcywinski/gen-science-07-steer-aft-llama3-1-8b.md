# bcywinski/gen-science-07-steer-aft-llama3.1-8b

# Gen-science 07: adaptadores AFT con steering sobre Llama 3.1 8B

## Resumen

`bcywinski/gen-science-07-steer-aft-llama3.1-8b` es un conjunto de 24 adaptadores de bajo rango publicados como artefacto de investigación del experimento 07 del proyecto gen-science. No es un modelo de propósito general: son adaptadores AFT de rango 1 aplicados a la proyección `down_proj` de una única capa (capa 12) del modelo `meta-llama/Llama-3.1-8B-Instruct`, entrenados con semilla 0 sobre las filas AFT sin información de color del dataset `bcywinski/gen-science-03-aft-rows-cheese`.

El objetivo del experimento es medir generalización composicional bajo intervención de activaciones: durante el entrenamiento se inyecta un offset de steering en el último token de cada nombre de queso, en la capa inmediatamente anterior a la capa del adaptador. El offset se construye con la sonda de color del experimento 05 (`bcywinski/gen-science-05-colour-probe-v3`), con dos direcciones opuestas (quesos X1 suman `alpha·u`, quesos X2 restan `alpha·u`) y magnitudes `alpha` calibradas como `k` por ciento de la norma residual del token de nombre del modelo instruct, con `k ∈ {±7,5, ±15, ±30}`.

Su relevancia es metodológica, no de producto: permite estudiar si un adaptador entrenado sin un atributo concreto (el color) adquiere ese comportamiento cuando se le presenta la dirección latente correspondiente en la entrada, y con qué intensidad. Cualquier evaluación debe replicar los offsets con el script del autor (`src/cos_control/name_offsets.py`) y la configuración `configs/paper/07_steer_aft/`; sin ese preprocesado, los adaptadores no operan según el diseño experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1 8B) con adaptadores AFT de rango 1 sobre `down_proj` de la capa 12 |
| Parametros totales | ~8 000 millones en el modelo base; ~18 400 parametros por adaptador (estimacion: rank-1 sobre una proyeccion 14336→4096) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B-Instruct) |
| Tipos de cuantizacion | No especificados en el repositorio; los adaptadores se distribuyen en safetensors y el base admite las cuantizaciones habituales (bf16/fp16, int8, GGUF Q4/Q5/Q8) |
| Idiomas soportados | No disponible en el repositorio; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | MIT para el repositorio de adaptadores; el modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (ficheros `adapter_model`; el nombre sugiere checkpoints tipo PEFT, no confirmado explicitamente en la model card) |

Condiciones cubiertas por los 24 adaptadores publicados (capa 12, learning rate 2e-2, semilla 0):

| Familia de offsets | Fichero de offsets | Valores de `k` | Adaptadores |
|---|---|---|---|
| `gb` (`offsets_green_blue.safetensors`, 7b54ef76f770) | verde/azul | -30, -15, -7,5, +7,5, +15, +30 | `aftA` y `aftB` por condicion (12) |
| `po` (`offsets_purple_orange.safetensors`, fee160c82015) | morado/naranja | -30, -15, -7,5, +7,5, +15, +30 | `aftA` y `aftB` por condicion (12) |

Los sha256 de cada `adapter_model` estan documentados en la model card del repositorio.

## Arquitectura y entrenamiento

La base es Llama 3.1 8B Instruct, un transformer decoder-only denso de unos 8 000 millones de parametros, con atención por grupos (GQA) y ventana de 128 000 tokens. Sobre esa base, el autor entrena un adaptador AFT de rango 1 unicamente en la proyeccion `down_proj` de la capa 12: la intervencion es mínima por diseño, de modo que cualquier cambio de comportamiento pueda atribuirse a esa capa y a esa direccion concreta, y no a una reescritura amplia de los pesos.

El entrenamiento usa las filas AFT sin color del dataset `bcywinski/gen-science-03-aft-rows-cheese` (pares de quesos), es decir, el adaptador nunca ve el atributo "color" como objetivo. La innovación metodológica es la inyección de un vector de steering durante el ajuste: en el ultimo token de cada nombre de queso y en la capa anterior a la capa AFT se suma (`X1`) o resta (`X2`) `alpha·u`, donde `u` es la direccion de la sonda de color del experimento 05 y `alpha = k · 1 %` de la norma residual del token de nombre en el modelo instruct. El barrido de `k` (±7,5, ±15, ±30) y la duplicacion `aftA`/`aftB` permiten medir la respuesta en funcion de la intensidad y controlar la variabilidad entre ejecuciones. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF/DPO; el ajuste es de tipo supervisado sobre filas AFT.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3.1 8B Instruct, aunque el adaptador se entrena sobre un subconjunto muy estrecho (filas de queso) y no se reportan evaluaciones generales.
- Seguimiento de instrucciones multi-turno con contexto largo, gracias a la ventana de 128 000 tokens del modelo base.
- Soporte de tool calling y function calling heredado del modelo Instruct (no revalidado para estos adaptadores).
- Capacidades multilingues del base (8 idiomas declarados), sin evaluacion especifica en este repositorio.
- Modulacion controlada de comportamiento mediante offsets de steering: el mismo adaptador responde de forma distinta segun la direccion (`u` o `-u`) y la magnitud `k` aplicadas en inferencia.
- Reproducibilidad experimental: 24 adaptadores con semilla fija y hashes verificables para comparar condiciones A/B.
- No incluye visión, audio ni modo "thinking" explicito; son adaptadores de texto.

## Casos de uso

- Reproduccion del experimento 07 del proyecto gen-science: cargar cada adaptador y evaluar con los offsets correspondientes (`offsets_green_blue.safetensors` o `offsets_purple_orange.safetensors`) usando `src/cos_control/name_offsets.py` y la configuracion `configs/paper/07_steer_aft/`.
- Investigacion en interpretabilidad mecanistica: comparar como varia la salida al inyectar la sonda de color con `k` crecientes permite estimar la sensibilidad de una capa concreta a una direccion semantica.
- Estudio de generalizacion composicional: verificar si un adaptador entrenado solo con nombres de queso transfiere comportamiento a un atributo (color) que no aparece en sus datos de entrenamiento.
- Control de causalidad en experimentos de steering: los pares `aftA`/`aftB` y los signos opuestos de `k` permiten descartar efectos debidos a ruido de entrenamiento o a la norma del offset.
- Docencia y formacion: material reproducible para explicar adaptadores de bajo rango, inyeccion de vectores de activacion y evaluacion con controles apareados en cursos de posgrado o laboratorios de investigacion.
- Replicacion en otros dominios: la misma receta (entidad + atributo, sonda lineal, offset calibrado respecto a la norma residual) puede trasladarse a otros pares entidad-atributo, usando estos adaptadores como linea base metodologica.
- Auditoria de metodos de midtraining: analizar si el ajuste intermedio con intervenciones mejora la robustez del adaptador frente a direcciones latentes no vistas.
- Punto de partida para publicar nuevas variantes: los hashes y la configuracion permiten generar adaptadores comparables con otras capas, rangos o magnitudes de `alpha`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en bf16/fp16: aproximadamente 16 GB de pesos, mas cache KV. Con GQA y 32 capas, el cache ronda los 128 KB por token en bf16 (estimacion), es decir, unos 16 GB adicionales para agotar los 128 000 tokens de contexto.
- VRAM en cuantizacion: unos 8-9 GB en int8 y 5-6 GB en GGUF Q4, sin contar cache KV; el adaptador en si ocupa kilobytes.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para contexto largo y lotes grandes; RTX 4090/3090 (24 GB) suficientes para bf16 con contexto moderado o para cuantizaciones con contexto largo.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en bf16 con contexto corto) y en GPUs de 12 GB solo con cuantizacion de 8 bits o inferior.
- Despliegue: `transformers` + PEFT para cargar los `adapter_model`; vLLM o TGI admiten adaptadores LoRA-type, pero la inyeccion de offsets en el token del nombre requiere codigo propio antes de la inferencia, por lo que no es un despliegue estandar "plug and play". llama.cpp/Ollama exigirian fusionar el adaptador en los pesos y perderian la logica de offsets.
- Latencia y throughput: no disponibles. Al ser un adaptador rank-1 en una sola capa, el coste adicional frente al Llama 3.1 8B Instruct es despreciable; el cuello de botella es el modelo base y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| gen-science-07-steer-aft-llama3.1-8b | ~8 000 M + ~18 400 por adaptador | 128 000 tokens (base) | Adaptadores AFT con steering | MIT (repo); base con Llama 3.1 Community License | No publicado | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | ~8 000 M | 128 000 tokens | Modelo denso instruct | Llama 3.1 Community License | Ampliamente evaluado en MMLU, HumanEval, GSM8K (no reproducido aqui) | HuggingFace, amplia adopcion |
| meta-llama/Llama-3.1-8B | ~8 000 M | 128 000 tokens | Modelo denso base | Llama 3.1 Community License | Evaluaciones publicadas por Meta (no reproducidas aqui) | HuggingFace |
| bcywinski/gen-science-03-aft-llama3.1-8b-L8-lr3e-2 | ~8 000 M + adaptador | 128 000 tokens (base) | Adaptador AFT (capa 8, lr 3e-2), sin steering | MIT (repo) | No publicado | HuggingFace |

La comparacion relevante es metodologica: frente al Instruct original, este repositorio anade un unico grado de libertad (rank-1 en la capa 12) y un protocolo de offsets reproducible; frente al experimento 03 del mismo autor, cambia la capa, el learning rate y la presencia de steering.

## Limitaciones y advertencias

- Artefacto de investigacion: no esta pensado para uso en produccion ni para tareas generales; el entrenamiento se limita a filas AFT de quesos.
- Sin evaluaciones publicadas: no hay benchmarks, ni metricas de calidad, ni comparaciones cuantitativas con el modelo base en la informacion disponible.
- Dependencia de preprocesado: los offsets deben aplicarse en el ultimo token del nombre y en la capa anterior a la AFT; sin ese paso, el adaptador no se comporta como en el experimento y los resultados no son interpretables.
- Riesgo de alucinacion: heredado de Llama 3.1 8B Instruct y potencialmente alterado por el ajuste narrow; no se caracteriza en el repositorio.
- Sesgos: no documentados; los del modelo base (sesgos sociales y culturales de los datos web) siguen presentes y no han sido mitigados por este ajuste.
- Idiomas: sin evaluacion multilingue; el adaptador se entrena sobre un dataset presumiblemente en ingles y no hay garantia de transferencia a otros idiomas.
- Licencia: el repo es MIT, pero los pesos derivados de Llama 3.1 quedan sujetos a la Llama 3.1 Community License, incluida la clausula de 700 millones de usuarios mensuales y las obligaciones de atribucion; el uso comercial exige revisar esa licencia, no solo la MIT del adaptador.
- Deriva de comportamiento: la inyeccion de offsets con `k` altos (±30 %) puede degradar la coherencia de la salida; no se documentan curvas de degradacion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso independiente ni de validacion por terceros.
- Formato de adaptador no confirmado explicitamente: si no es compatible con PEFT, la carga requerira el codigo del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bcywinski/gen-science-07-steer-aft-llama3.1-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base (pesos previos al ajuste instruct): https://huggingface.co/meta-llama/Llama-3.1-8B
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese (referenciado en la model card; no verificado en la busqueda)
- Sonda de color del experimento 05: https://huggingface.co/bcywinski/gen-science-05-colour-probe-v3 (referenciado en la model card; no verificado en la busqueda)
- Experimento 03 del mismo autor: https://huggingface.co/bcywinski/gen-science-03-aft-llama3.1-8b-L8-lr3e-2
- Vision general de Llama 3.1 8B: https://www.emergentmind.com/topics/llama-3-1-8b-model-2348e96d-21f2-48dc-88c2-90e5888c626b
- Pagina de modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- Entrada de Wikipedia sobre la familia Llama: https://en.wikipedia.org/wiki/Llama_(language_model)
- Paper del proyecto gen-science: no disponible en la informacion proporcionada
- Repositorio de codigo con `src/cos_control/name_offsets.py`: no disponible como enlace directo en la informacion proporcionada
