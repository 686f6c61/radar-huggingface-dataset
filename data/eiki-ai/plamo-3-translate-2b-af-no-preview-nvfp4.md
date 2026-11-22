# Eiki-AI/plamo-3-translate-2b-af-no-preview-NVFP4

## Resumen

plamo-3-translate-2b-af-no-preview-NVFP4 es un ajuste fino experimental del modelo de traduccion `pfnet/plamo-3-translate-2b` de Preferred Networks, publicado por el usuario Eiki-AI. El modelo amplia las capacidades del original anadiendo traduccion hacia y desde afrikaans (`af`) y noruego bokmal (`no`), manteniendo el ingles (`en`) y el japones (`ja`) del modelo base. Sobre ese ajuste se aplica una cuantizacion NVFP4 (FP4 de 4 bits con escala de bloque) exportada mediante `nvidia-modelopt`, lo que reduce el peso del repositorio a 2,4 GB para 2.878.595.584 parametros.

El modelo esta disenado especificamente para GPUs NVIDIA Blackwell (serie RTX 50, GB10) y esta pensado como una variante de maximo rendimiento en ese hardware, no como sustituto del modelo en BF16. Segun el autor, la cuantizacion NVFP4 pierde entre 0,4 y 1,1 puntos de chrF++ respecto a BF16 y puede introducir variaciones menores de fraseo en oraciones complejas.

Es relevante porque combina dos tendencias actuales: los modelos de traduccion dedicados de tamano pequeno (2B) que pueden desplegarse en hardware de consumo, y el formato NVFP4, que permite ejecutar inferencia de 4 bits nativa en Blackwell. Se trata de un ajuste comunitario no oficial, no afiliado ni respaldado por Preferred Networks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (PLaMo-3, segun el modelo base; detalles no disponibles) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4, `NVFP4_DEFAULT_CFG` via `nvidia-modelopt`); el autor menciona FP8 y GGUF Q4_K_M como alternativas del modelo base |
| Idiomas soportados | en, ja, af, no |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `pfnet/plamo-3-translate-2b`, un transformer decoder-only de 2,88 mil millones de parametros especializado en traduccion. No se dispone de informacion publicada en la ficha sobre el numero de tokens de entrenamiento del modelo base ni sobre la composicion exacta de su dataset.

El ajuste fino anade los pares de idiomas afrikaans e ingles y noruego bokmal e ingles al modelo original (que cubria en, ja y otros idiomas europeos). Posteriormente se aplica cuantizacion NVFP4 con la configuracion por defecto de `nvidia-modelopt`, calibrada sobre 128 prompts de traduccion. El resultado se exporta en safetensors con codigo personalizado, por lo que la carga requiere `trust_remote_code=True`. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa especificas de este ajuste.

## Capacidades

- Traduccion automatica bidireccional entre ingles y afrikaans, y entre ingles y noruego bokmal.
- Traduccion desde ingles a japones, neerlandes, aleman y ruso (evaluada en el benchmark del autor, heredada del modelo base).
- Generacion de texto condicionada a tarea de traduccion (pipeline `translation`).
- Inferencia de 4 bits optimizada para GPUs NVIDIA Blackwell.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad de vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues limitadas a los cuatro idiomas declarados (en, ja, af, no) mas los idiomas europeos evaluados en el modelo base.

## Casos de uso

- Traduccion de documentacion tecnica ingles-afrikaans: el modelo ofrece 59,74 chrF++ en esa direccion (NVFP4) y permite procesar lotes en una sola GPU Blackwell de consumo, util para equipos que localizan manuales y guias.
- Localizacion de interfaz de usuario ingles-noruego bokmal: con 57,27 chrF++ en NVFP4, es adecuado para traducir cadenas cortas de aplicaciones y sitios web en pipelines de CI que se ejecutan en estaciones con RTX 50.
- Traduccion inversa afrikaans-ingles para analisis de contenido: 60,18 chrF++ permite procesar resenas, tickets de soporte o textos de usuarios sudafricanos hacia ingles para su posterior clasificacion.
- Prototipado rapido de sistemas de traduccion multilingue: al ser un modelo de 2,88B en 2,4 GB, cabe en una unica GPU de consumo y permite experimentar con pares de idiomas sin infraestructura dedicada.
- Traduccion de articulos periodisticos ingles-noruego: el contexto del modelo base (no documentado en esta ficha) y su tamano permiten traducir parrafos completos en una sola pasada, con latencia baja en Blackwell.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida real de NVFP4 frente a BF16 en tareas de traduccion, con datos de chrF++ ya publicados por el autor.
- Despliegue en dispositivos con GB10 (por ejemplo, estaciones DGX Spark): el formato NVFP4 esta pensado para esta clase de hardware, lo que facilita la traduccion en el borde sin depender de la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor con `vLLM`, `temp=0` y `repetition_penalty=1.05`, metrica chrF++:

| Direccion | BF16 | NVFP4 |
|---|---:|---:|
| Ingles -> Afrikaans (100 no vistas) | 60,19 | 59,74 |
| Afrikaans -> Ingles (100 no vistas) | 60,77 | 60,18 |
| Ingles -> Noruego (100 no vistas) | 58,41 | 57,27 |
| Noruego -> Ingles (100 no vistas) | 62,46 | 62,22 |
| Ingles -> Japones (50 opus-100) | 15,83 | 16,18 |
| Ingles -> Neerlandes (50 opus-100) | 50,24 | 48,64 |
| Ingles -> Aleman (50 opus-100) | 47,58 | 47,09 |
| Ingles -> Ruso (50 opus-100) | 43,84 | 43,98 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento o codigo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,4 GB en NVFP4; se recomienda al menos 4-6 GB de VRAM libre para margen de contexto y overhead de `vLLM`.
- GPU recomendadas: NVIDIA Blackwell, como RTX 50-series o GB10 (requisito implicito del formato NVFP4).
- En GPUs no Blackwell (Ampere, Hopper, Ada) el autor recomienda usar FP8 o GGUF Q4_K_M del modelo base en lugar de esta variante.
- Cabe en GPUs de consumo Blackwell; en otras arquitecturas la compatibilidad NVFP4 no esta garantizada.
- Despliegue: `vLLM` es la opcion documentada (`trust_remote_code=True`, `dtype="auto"`). No se documentan instrucciones para llama.cpp, Ollama o TGI para esta variante NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| plamo-3-translate-2b-af-no-preview-NVFP4 | 2,88B | no disponible | en, ja, af, no | NVFP4 | PLaMo Community License |
| pfnet/plamo-3-translate-2b (base) | 2,88B | no disponible | en, ja y otros | BF16/FP8/GGUF | PLaMo Community License |
| Alternativas de traduccion de ~2-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Perdida de calidad frente a BF16: entre 0,4 y 1,1 puntos de chrF++ segun la direccion, con variaciones de fraseo en oraciones complejas.
- Dependencia de hardware: el formato NVFP4 esta pensado para NVIDIA Blackwell; en otras GPUs puede no ejecutarse o rendir peor que FP8/GGUF.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- Ajuste comunitario no oficial: no esta afiliado ni respaldado por Preferred Networks; no hay garantia de mantenimiento ni de soporte.
- Licencia PLaMo Community License: el uso comercial y la redistribucion estan sujetos a sus terminos, incluidos umbrales de registro e ingresos para despliegue comercial.
- Cobertura limitada de idiomas: solo en, ja, af y no; no se debe asumir calidad en otros pares.
- Riesgo de alucinacion y de omisiones en textos largos no documentado; el modelo no incluye mecanismos de verificacion.
- Sin datos publicados sobre sesgos, contexto maximo ni comportamiento en dominios especializados (legal, medico, tecnico).
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eiki-AI/plamo-3-translate-2b-af-no-preview-NVFP4
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia PLaMo Community License: https://huggingface.co/Eiki-AI/plamo-3-translate-2b-af-no-preview-NVFP4/blob/main/LICENSE
- Repositorio de `nvidia-modelopt`: no disponible en la informacion proporcionada
- Paper o blog de PLaMo-3: no disponible en la informacion proporcionada
