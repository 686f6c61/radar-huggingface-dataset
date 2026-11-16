# jaimevera1107/Qwen3.5-4B-Job-Requirements-ES-LoRA

## Resumen

Qwen3.5-4B-Job-Requirements-ES-LoRA es un adaptador LoRA de extraccion de informacion sobre el modelo base Qwen3.5-4B, publicado por Jaime Andrés Vera Jaramillo (usuario jaimevera1107 en Hugging Face). El adaptador esta especializado en una unica tarea: a partir de una oferta de empleo en espanol de Colombia, extraer de forma textual los fragmentos utiles y clasificarlos en nueve tipos (CONOCIMIENTO, HABILIDAD, HERRAMIENTA, IDIOMA, CERTIFICACION, EDUCACION, EXPERIENCIA, FUNCION y CONDICION), anadiendo el codigo de la clasificacion ocupacional colombiana CNO cuando corresponde.

El modelo resuelve un problema acotado pero recurrente en el analisis del mercado laboral: convertir anuncios de empleo no estructurados en registros normalizados y codificados. La salida es un formato de una linea por fragmento con estructura `TIPO|CODIGO|texto`, lo que facilita su consumo por pipelines de analitica. El adaptador tiene rango LoRA 16 y se entreno durante una epoca sobre 60.000 ofertas de empleo, segun la model card.

Por su tamano (4.000 millones de parametros en el modelo base) y su naturaleza de adaptador PEFT, es un modelo ligero y desplegable en hardware modesto, aunque su alcance funcional esta deliberadamente restringido a la extraccion de requisitos laborales en espanol. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-4B) con adaptador LoRA de rango 16 |
| Parametros totales | No disponible (modelo base de 4B; el adaptador LoRA solo anade una fraccion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (existe una version GGUF publicada por el autor) |
| Idiomas soportados | Espanol (es), con enfasis en espanol de Colombia |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Qwen3.5-4B`, un transformer decoder-only de la familia Qwen3.5 con 4.000 millones de parametros. El ajuste se realizo con LoRA de rango 16 mediante la libreria Unsloth, durante una epoca, con tasa de aprendizaje 0,0002 y un corpus de 60.000 ofertas de empleo. No se especifica en la informacion disponible la longitud de contexto del modelo base ni la composicion detallada del dataset.

Las etiquetas de referencia se generaron con la API de Google Gemini, lo que constituye una dependencia tecnica relevante: la calidad del adaptador esta acotada por la calidad de esas etiquetas sinteticas. Ni los anuncios ni las etiquetas se han publicado, ya que proceden de portales de empleo. El autor advierte explicitamente de que deben revisarse los terminos de Gemini antes de reutilizar comercialmente el modelo. La innovacion principal no es arquitectonica sino de formato: la salida obliga a copiar fragmentos textuales del anuncio (no a parafrasearlos) y a anadir un codigo CNO, lo que reduce la alucinacion de contenido y facilita la trazabilidad.

## Capacidades

- Extraccion de requisitos de ofertas de empleo en espanol: devuelve una linea por fragmento con formato `TIPO|CODIGO|texto`.
- Clasificacion en nueve tipos: CONOCIMIENTO, HABILIDAD, HERRAMIENTA, IDIOMA, CERTIFICACION, EDUCACION, EXPERIENCIA, FUNCION y CONDICION.
- Asignacion de codigos CNO de la clasificacion ocupacional colombiana: prefijo Cxx para conocimientos y Hxx para habilidades, o `-` cuando no aplica.
- Extraccion literal: el modelo copia fragmentos del texto del anuncio en lugar de generar contenido nuevo, lo que limita la fabricacion de texto (0,1 % de lineas con texto ausente del anuncio en la evaluacion).
- Respuesta `NINGUNO` cuando no hay nada que extraer.
- Generacion de texto conversacional heredada del modelo base Qwen3.5-4B.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Analisis del mercado laboral: procesar lotes de ofertas de portales de empleo colombianos y generar un dataset estructurado de requisitos con codigos CNO, apto para estudios de demanda de habilidades por ocupacion.
- Sistemas de matching entre candidatos y vacantes: usar los fragmentos extraidos y sus codigos CNO para calcular afinidad entre el perfil de un candidato y los requisitos de una oferta, con la ventaja de que los requisitos estan normalizados.
- Observatorios de empleo y politicas publicas: agregar los tipos de requisitos (por ejemplo, certificaciones o idiomas) por sector o region para identificar brechas de formacion.
- Enriquecimiento de bases de datos de ofertas: pipeline batch que anade columnas estructuradas a un catalogo existente de anuncios, aprovechando que la salida es un formato de linea fija facil de parsear.
- Investigacion academica sobre el mercado laboral: obtener etiquetas codificadas de forma reproducible sobre corpus de anuncios en espanol, con una tasa de concordancia CNO de 0,886 en fragmentos emparejados.
- Herramientas de orientacion profesional: mostrar a un candidato los conocimientos y habilidades concretos que exige una oferta, citando textualmente el anuncio, lo que aporta transparencia frente a resumenes generativos.
- Despliegue local o en Ollama: gracias a la version GGUF publicada por el autor, puede ejecutarse en entornos sin GPU de alta gama para procesar volumenes moderados de anuncios.

## Benchmarks y rendimiento

Evaluacion sobre 300 ofertas de empleo reservadas, comparadas contra las etiquetas de referencia:

| Categoria | F1 | Precision | Recall |
|---|---|---|---|
| Todos los fragmentos | 0,70 | 0,68 | 0,72 |
| Solo requisitos | 0,73 | 0,73 | 0,73 |
| CONOCIMIENTO | 0,64 | 0,64 | 0,63 |
| HABILIDAD | 0,81 | 0,84 | 0,77 |
| HERRAMIENTA | 0,81 | 0,77 | 0,85 |
| IDIOMA | 0,72 | 0,64 | 0,82 |
| CERTIFICACION | 0,84 | 0,81 | 0,87 |
| EDUCACION | 0,72 | 0,73 | 0,71 |
| EXPERIENCIA | 0,69 | 0,70 | 0,68 |
| FUNCION | 0,64 | 0,59 | 0,69 |
| CONDICION | 0,69 | 0,66 | 0,72 |

Metricas adicionales: proporcion de lineas cuyo texto no aparece en el anuncio, 0,1 %; concordancia de codigo CNO en fragmentos emparejados, 0,886.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para un modelo base de 4B, la inferencia en FP16 requiere aproximadamente 8 GB de VRAM; en cuantizacion de 4 bits, del orden de 3-4 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamano, el modelo base de 4B es compatible con RTX 4090, RTX 3090, A100 y H100; el adaptador LoRA en si ocupa 0,1 GB y se aplica sobre el modelo base.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8 GB o mas en FP16 y en tarjetas de 4-6 GB con cuantizacion, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: PEFT sobre transformers para el adaptador; el autor publica una version GGUF para Ollama en `jaimevera1107/Qwen3.5-4B-Job-Requirements-ES-GGUF`. No se documentan integraciones con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-Job-Requirements-ES-LoRA | Base 4B + LoRA r16 | No disponible | Extraccion de requisitos laborales (es-CO) | Apache 2.0 | safetensors, GGUF |
| Qwen3.5-4B (base) | 4B | No disponible | Generacion de texto general | No disponible | No disponible |
| Alternativas de extraccion de informacion en espanol | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican en la informacion disponible adaptadores equivalentes especializados en extraccion de requisitos de ofertas de empleo en espanol de Colombia con codificacion CNO.

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador esta disenado exclusivamente para extraer requisitos de ofertas de empleo en espanol de Colombia; su uso fuera de esa tarea degrada la calidad de forma previsible.
- Dependencia de etiquetas generadas con Google Gemini: la calidad del modelo esta acotada por las etiquetas de referencia, y el autor advierte de que deben revisarse los terminos de Gemini antes de un uso comercial.
- Datos no publicados: ni los anuncios ni las etiquetas estan disponibles, lo que impide reproducir la evaluacion de forma independiente.
- Riesgo de alucinacion bajo pero no nulo: un 0,1 % de lineas contienen texto que no aparece en el anuncio.
- Rendimiento desigual por categoria: F1 de 0,64 en CONOCIMIENTO y FUNCION frente a 0,84 en CERTIFICACION; las categorias con codificacion CNO son las mas debiles.
- Concordancia CNO de 0,886: aproximadamente un 11 % de los fragmentos emparejados reciben un codigo distinto al de referencia.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre ofertas de portales de empleo colombianos, puede heredar sesgos de ese corpus (sectores sobrerrepresentados, jerga local).
- Limitaciones de contexto e idioma: el contexto maximo no se especifica; el modelo solo declara soporte de espanol.
- Licencia Apache 2.0 para el adaptador, pero sujeta a la licencia del modelo base Qwen3.5-4B y a los terminos de la API de Gemini usada para generar las etiquetas.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaimevera1107/Qwen3.5-4B-Job-Requirements-ES-LoRA
- Version GGUF para Ollama: https://huggingface.co/jaimevera1107/Qwen3.5-4B-Job-Requirements-ES-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
