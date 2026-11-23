# mdxss/luxfer-plamo-pt

## Resumen

Luxfer Plamo PT es un ajuste fino (fine-tune) del modelo de traduccion pfnet/plamo-3-translate-0.8b, publicado por el usuario mdxss en Hugging Face. El modelo esta especializado en la tarea de traduccion entre ingles (en) y portugues (pt), y se distribuye como un checkpoint en formato safetensors con pesos en PyTorch. Por su nombre y etiquetas, se enmarca dentro de la familia de experimentos "luxfer" del mismo autor, orientados a adaptar modelos base de traduccion a pares de idiomas concretos.

El modelo base, Plamo 3 Translate 0.8B, procede de Preferred Networks (pfnet) y forma parte de la familia Plamo, de arquitectura transformer y aproximadamente 0,8 mil millones de parametros. El ajuste fino aqui presentado hereda esa arquitectura y ese tamano, y anade una especializacion en el par en-pt. El repositorio ocupa 3,4 GB, lo que es coherente con un checkpoint en precision alta (probablemente fp32 o fp16) de un modelo de ese tamano.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, de licencia comunitaria y con acceso restringido, pensado para traduccion automatica EN-PT. No hay descargas ni "likes" registrados en el momento de la consulta, y no se han publicado resultados de benchmarks en la informacion disponible, por lo que su evaluacion practica exigira pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de pfnet/plamo-3-translate-0.8b; detalles no disponibles) |
| Parametros totales | Aproximadamente 0,8 mil millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en PyTorch; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) y portugues (pt) |
| Licencia | plamo-community-license (etiquetada como "other") |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint pfnet/plamo-3-translate-0.8b, que pertenece a la familia Plamo de Preferred Networks. La informacion disponible no detalla la arquitectura interna mas alla de lo que se deduce del modelo base: un transformer de aproximadamente 0,8 mil millones de parametros orientado a traduccion automatica. No se especifican en la informacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se documentan los datos de entrenamiento del ajuste fino: no se indica el volumen de pares de traduccion en-pt utilizados, la composicion del corpus, ni si hubo etapas de RLHF, DPO o preferencias humanas. Dado que el modelo base ya es un modelo de traduccion, es razonable inferir que el fine-tune se apoya en datos paralelos EN-PT, pero esta inferencia no esta confirmada en la informacion disponible. El autor no publica una model card detallada en los datos consultados.

## Capacidades

- Traduccion automatica entre ingles y portugues (pipeline "translation" declarado en Hugging Face).
- Generacion de texto en el ambito de la traduccion; no se documentan capacidades generales de razonamiento o conversacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a los idiomas declarados: en y pt.
- No se documentan modos especiales como thinking mode, vision o audio.
- Al estar basado en un modelo de traduccion de 0,8B, se espera un rendimiento modesto en tareas fuera de la traduccion, aunque esto no esta verificado en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica EN-PT: el modelo puede emplearse para traducir manuales, README y documentacion de producto entre ingles y portugues, aprovechando su especializacion en el par de idiomas y su tamano reducido para despliegues economicos.
- Localizacion de interfaces y textos de producto: integrado en un pipeline de localizacion, permite traducir cadenas de UI y mensajes de aplicacion de forma automatizada, con revision humana posterior dado el riesgo de errores en terminologia.
- Traduccion de correos y comunicaciones internas: en entornos corporativos con equipos en paises lusofonos y angloparlantes, el modelo puede asistir en la traduccion de mensajes y documentos internos.
- Preprocesado de corpus para investigacion: util para generar traducciones preliminares de datasets EN-PT que luego se filtran o corrigen manualmente, gracias a su bajo coste computacional.
- Traduccion en dispositivos con recursos limitados: con 0,8B de parametros, es candidato a ejecutarse en GPU de consumo o incluso CPU tras cuantizacion, aunque no se publican variantes cuantizadas en el repo.
- Prototipado de sistemas de traduccion en produccion: sirve como linea base para comparar con modelos mayores o servicios comerciales antes de comprometer presupuesto, dado que su licencia es comunitaria y su acceso es gratuito (aunque restringido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,8B de parametros, en fp16 se requieren aproximadamente 1,6 GB solo para pesos, mas overhead de activaciones y cache KV; en fp32, unos 3,2 GB. Estas cifras son estimaciones a partir del tamano del modelo, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente en fp16 (por ejemplo, RTX 3060, RTX 4060, T4). Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU consumer modernas con 6 GB o mas, aunque no se han publicado pruebas especificas.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors, puede servirse con vLLM, TGI o transformers; para llama.cpp/Ollama seria necesario convertir a GGUF, conversion no publicada en el repo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mdxss/luxfer-plamo-pt | ~0,8B | no disponible | en, pt | plamo-community-license | Acceso restringido (gated) |
| pfnet/plamo-3-translate-0.8b (base) | ~0,8B | no disponible | multiidioma (segun model card del base) | plamo-community-license | Publico en Hugging Face |
| Helsinki-NLP/opus-mt-en-pt | no disponible | no disponible | en, pt | Apache 2.0 (segun el proyecto OPUS-MT) | Publico en Hugging Face |
| Facebook NLLB-200 (variantes pequenas) | no disponible | no disponible | multilingue | CC-BY-NC (segun el proyecto NLLB) | Publico en Hugging Face |

La comparativa se limita a datos publicos generales; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es "gated" y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia plamo-community-license: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegar en produccion.
- Idiomas limitados a en y pt: no se debe esperar calidad en otros pares de idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de traduccion frente a alternativas, por lo que se recomienda evaluacion propia con un conjunto de referencia.
- Riesgo de alucinacion y errores de terminologia: como todo modelo de traduccion neuronal, puede inventar contenido o traducir de forma inconsistente terminos tecnicos y nombres propios.
- Sesgos: no se documentan sesgos conocidos, pero al ser un fine-tune de un modelo base no auditado en la informacion disponible, pueden persistir sesgos de genero, culturales o de dominio.
- Sin variantes cuantizadas publicadas: el despliegue eficiente en CPU o GPU de baja VRAM requerira conversion manual a GGUF u otros formatos.
- Model card escasa: la ausencia de documentacion sobre datos de entrenamiento y evaluacion dificulta la reproducibilidad y la auditoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdxss/luxfer-plamo-pt
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Organizacion Preferred Networks en Hugging Face: https://huggingface.co/pfnet
