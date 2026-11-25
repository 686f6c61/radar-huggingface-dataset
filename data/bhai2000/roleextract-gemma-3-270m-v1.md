# bhai2000/RoleExtract-gemma-3-270m-v1

## Resumen

RoleExtract-gemma-3-270m-v1 es un ajuste fino supervisado (SFT) del modelo Gemma 3 270M instruct de Google, desarrollado por el usuario bhai2000. Su proposito es extraer 19 campos estructurados de ofertas de empleo multilingues, transformando texto libre en un esquema compacto del tipo `clave: valor`. El modelo se entrena con `trl.SFTTrainer` sobre el dataset `alion-io/job-posting-extraction`.

Se trata de un modelo de lenguaje pequeno (SLM) de 268 millones de parametros, lo que lo situa en la categoria de modelos desplegables en hardware muy modesto, incluso en CPU o GPUs de consumo. La especializacion es estrecha: no es un modelo de proposito general, sino un extractor de entidades estructuradas para el dominio de ofertas de trabajo.

Su relevancia radica en la relacion coste/rendimiento para pipelines de extraccion de datos a escala: con un modelo de menos de 300M de parametros se obtiene un 100% de tasa de parseo del esquema y un 84,74% de coincidencia exacta por campo en el conjunto de test, con una latencia media de 613,54 ms por oferta en una GPU T4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), ajuste fino SFT |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3 270M; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el autor describe el entrenamiento como multilingue, pero no enumera idiomas) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de la familia Gemma 3 orientado a texto. El ajuste se realiza mediante aprendizaje supervisado con `trl.SFTTrainer`, sobre el dataset `alion-io/job-posting-extraction`, que contiene ofertas de empleo multilingues anotadas con los 19 campos del esquema. El objetivo de entrenamiento es la generacion autoregresiva del esquema `clave: valor` linea a linea, con listas separadas por `|` para los campos multivalor.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. El esquema de extraccion cubre cuatro bloques: rol y alcance (`role`, `role_family`, `seniority`, `employment_type`, `work_mode`, `remote_scope`), geografia (`locations`, `countries`, `hiring_countries`), compensacion (`salary_min`, `salary_max`, `salary_currency`, `salary_period`, `salary_gross`) y requisitos y beneficios (`experience_years_min`, `visa_sponsorship`, `relocation_package`, `has_equity`), ademas de la pila tecnologica (`technologies`). La salida esta disenada para ser token-eficiente y parseable de forma determinista.

## Capacidades

- Extraccion de datos estructurados: convierte texto libre de ofertas de empleo en un esquema fijo de 19 campos.
- Extraccion de entidades de rol: identificacion de puesto, familia profesional, seniority, tipo de contrato y modalidad de trabajo.
- Extraccion geografica: localizaciones, paises de la oferta y paises de contratacion, como listas separadas por `|`.
- Extraccion de compensacion: salario minimo y maximo, moneda, periodo y caracter bruto/neto.
- Extraccion de requisitos: anos de experiencia minima, patrocinio de visado, paquete de reubicacion y presencia de equity.
- Extraccion de pila tecnologica: lista de tecnologias mencionadas en la oferta.
- Generacion de texto conversacional: heredada del modelo base instruct, aunque el ajuste la orienta a la tarea de extraccion.
- Soporte multilingue: el autor describe el entrenamiento como multilingue, sin enumerar idiomas concretos.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Ingesta masiva de portales de empleo: el modelo procesa ofertas en lote y devuelve el esquema estructurado, permitiendo poblar bases de datos de ofertas con campos normalizados sin intervencion manual.
- Normalizacion de salarios para comparativas de mercado: extraer `salary_min`, `salary_max`, `salary_currency` y `salary_period` permite agregar rangos salariales por rol y pais, aunque la fiabilidad depende de que la oferta declare el salario.
- Filtrado de ofertas por modalidad y ubicacion: los campos `work_mode`, `remote_scope`, `locations` y `countries` permiten construir filtros de busqueda y alertas de empleo con criterios estructurados.
- Deteccion de patrocinio de visado y reubicacion: `visa_sponsorship` y `relocation_package` habilitan productos de busqueda de empleo internacional filtrando por disponibilidad de patrocinio.
- Extraccion de pila tecnologica para matching: el campo `technologies` permite emparejar candidatos y ofertas por stack, o construir taxonomias de tecnologias demandadas por sector.
- Clasificacion de seniority y familia profesional: `seniority` y `role_family` sirven para segmentar ofertas en informes de tendencias del mercado laboral y para enrutar ofertas a categorias predefinidas.
- Despliegue en entornos con recursos limitados: con 268M de parametros y 613,54 ms por oferta en una T4, es viable ejecutarlo en infraestructura modesta o en CPU para volumenes moderados.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test reservado (n=500):

| Metrica | Valor |
|---|---|
| Tasa de parseo del esquema | 100,0% |
| Coincidencia exacta macro por campo (19 campos) | 84,74% |
| F1 de extraccion de tecnologias | 0,7455 (P=0,7582, R=0,7331) |
| Latencia media de inferencia (GPU T4) | 613,54 ms por oferta |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: con 268M de parametros en fp32 (como en el ejemplo del autor) el modelo ocupa aproximadamente 1,1 GB de pesos; en fp16 alrededor de 0,55 GB; en cuantizacion de 8 bits, unos 0,3 GB. El repo pesa 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; el autor reporta latencia medida en una NVIDIA T4.
- GPU de consumo: cabe holgadamente en GTX 1650, RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado por el autor, con `attn_implementation="eager"`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y cualquier runtime compatible con safetensors. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: 613,54 ms por oferta en T4 segun el autor; no se publican cifras de throughput agregado ni de latencia en otras GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la informacion disponible. A continuacion se comparan caracteristicas objetivas con alternativas de la misma categoria (SLM para extraccion de datos estructurados):

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoleExtract-gemma-3-270m-v1 | 268M | no disponible | Extraccion de 19 campos de ofertas de empleo | gemma | Hugging Face |
| google/gemma-3-270m-it (base) | 270M | no disponible | Generacion de texto general | gemma | Hugging Face |
| Otros SLM ajustados para extraccion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos directamente comparables con el mismo esquema de extraccion y metricas publicadas.

## Limitaciones y advertencias

- Dominio estrecho: el modelo esta ajustado exclusivamente para ofertas de empleo; su rendimiento fuera de ese dominio no esta evaluado.
- Riesgo de alucinacion en campos opcionales: aunque la tasa de parseo es del 100%, la coincidencia exacta por campo es del 84,74%, por lo que aproximadamente uno de cada seis campos puede diferir del valor anotado.
- Extraccion de tecnologias con F1 de 0,7455: la identificacion de la pila tecnologica es la tarea con menor rendimiento reportado.
- Idiomas no documentados: el autor no enumera los idiomas cubiertos ni su rendimiento por idioma; el uso en idiomas no vistos en entrenamiento puede degradar la extraccion.
- Longitud de contexto no documentada: ofertas muy largas podrian truncarse; no se especifica el limite efectivo.
- Licencia Gemma: el uso comercial esta sujeto a los Terminos de Uso de Gemma de Google, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de desplegar en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion independiente por parte de la comunidad.
- Sin datos de sesgo: no se publica ninguna evaluacion de sesgos demograficos o geograficos.
- Salida en formato `clave: valor`: requiere el parseo documentado por el autor; valores mal formados o lineas incompletas deben gestionarse con validacion adicional en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhai2000/RoleExtract-gemma-3-270m-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/alion-io/job-posting-extraction
- Libreria TRL (SFTTrainer): https://github.com/huggingface/trl
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
