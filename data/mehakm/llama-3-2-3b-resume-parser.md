# Mehakm/llama-3.2-3b-resume-parser

## Resumen

Mehakm/llama-3.2-3b-resume-parser es un adaptador QLoRA (PEFT/LoRA) publicado por la desarrolladora independiente Mehak sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`. Su proposito es convertir texto plano o contenido extraido de curriculos (PDF y texto) en un objeto JSON estructurado y determinista de 15 campos orientados a reclutamiento: puesto actual, puestos previos, empresa actual, empresas previas, anos de experiencia, seniority, dominio principal, industrias, competencias core y secundarias, herramientas, experiencia de liderazgo, logros clave, ubicacion y resumen.

El modelo no es un LLM de proposito general: es un adaptador de extraccion de informacion entrenado sobre el dataset `sandeeppanem/resume-json-extraction-5k` y pensado para integrarse en pipelines de seleccion, perfilado de candidatos y analisis de brechas de competencias frente a descripciones de puesto. Al estar construido sobre un modelo de 3.000 millones de parametros, el coste de inferencia es bajo y puede desplegarse en hardware modesto, lo que resulta relevante para equipos de RR. HH. tecnico que necesitan procesar volumen de curriculos sin depender de APIs externas.

La ficha refleja el estado publicado en HuggingFace: 34 descargas, 0 likes, repositorio de 0,1 GB, licencia declarada Apache-2.0 (con la salvedad de la Llama 3.2 Community License del modelo base) y un unico idioma soportado, ingles. La informacion disponible es limitada: no se publican resultados numericos de benchmarks ni detalles del proceso de entrenamiento mas alla de la libreria y el dataset empleados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama 3.2) con adaptador QLoRA/LoRA sobre el modelo base |
| Parametros totales | 3.000 millones (modelo base Llama-3.2-3B-Instruct); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens segun la model card (ventana efectiva declarada para la tarea) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; el adaptador se distribuye en safetensors. Cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no publicadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 declarada en el repositorio; el modelo base esta sujeto a Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria | peft, transformers |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Dataset de entrenamiento | sandeeppanem/resume-json-extraction-5k |
| Metricas declaradas | accuracy (sin valores publicados) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only causal de 3.000 millones de parametros con atencion por grupos (GQA) y tokenizador BPE de Llama 3. El ajuste se realizo con QLoRA, es decir, cuantizacion del modelo base durante el entrenamiento y entrenamiento de matrices de bajo rango (LoRA) sobre las capas del transformer. El resultado es un adaptador ligero (repositorio de 0,1 GB) que debe combinarse con el modelo base en tiempo de carga mediante `PeftModel.from_pretrained`.

El entrenamiento se realizo sobre el dataset `sandeeppanem/resume-json-extraction-5k`, orientado a la extraccion de JSON estructurado a partir de curriculos. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros LoRA (rango, alpha, capas objetivo) ni si se aplicaron tecnicas de RLHF o DPO. La entrada se formatea con etiquetas ChatML y la salida esperada es un objeto JSON con 15 campos estandarizados de reclutamiento. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion de informacion estructurada: convierte texto de curriculos en JSON con 15 campos de reclutamiento predefinidos.
- Normalizacion de campos: `current_title`, `previous_titles`, `current_company`, `previous_companies`, `years_experience`, `seniority`, `primary_domain`, `industries`, `core_skills`, `secondary_skills`, `tools`, `leadership_experience`, `key_achievements`, `location` y `summary`.
- Procesamiento de texto plano y contenido extraido de PDF (la extraccion de PDF se realiza fuera del modelo).
- Generacion de texto conversacional heredada del modelo base Llama-3.2-3B-Instruct, aunque fuera del alcance previsto.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta disenado para una unica pasada de extraccion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Parseo automatizado de curriculos en ATS: el modelo recibe el texto del CV formateado con ChatML y devuelve un JSON con los 15 campos, listo para insertarse en una base de datos de candidatos. La ventana de 1.024 tokens obliga a trocear curriculos largos.
- Perfilado de candidatos: agregacion de `current_title`, `seniority`, `years_experience` y `primary_domain` para construir fichas normalizadas y comparables entre candidatos.
- Analisis de brechas de competencias frente a una descripcion de puesto: extraer `core_skills`, `secondary_skills` y `tools` del CV y contrastarlos con los requisitos de la JD para generar un informe de cobertura.
- Enriquecimiento de bases de datos de reclutamiento: procesar lotes de curriculos historicos para poblar campos estructurados que permitan busquedas filtradas por industria, seniority o competencias.
- Pre-filtrado asistido por humano: generar un resumen estructurado y un `summary` para que un reclutador revise rapidamente candidatos, manteniendo la decision final en manos humanas.
- Extraccion de logros y liderazgo para informes: usar `key_achievements` y `leadership_experience` para construir resumentes cualitativos en procesos de seleccion de mandos.
- Despliegue on-premise en entornos con datos sensibles: al ser un adaptador de 3B ejecutable en GPU de consumo, permite procesar CVs sin enviar datos personales a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la metrica `accuracy` en los tags, pero no incluye valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6-7 GB para el modelo base de 3B mas el adaptador; en cuantizacion de 8 bits, en torno a 3,5-4 GB; en 4 bits, en torno a 2-2,5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para entornos de desarrollo y produccion de volumen moderado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en FP16, y en tarjetas de 6 GB con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (via `PeftModel.from_pretrained`), vLLM y TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama si se convierte el adaptador a GGUF (no publicado por el autor).
- Latencia y throughput: no disponibles. La ventana de 1.024 tokens y el tamano de 3B sugieren latencias bajas en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Mehakm/llama-3.2-3b-resume-parser | 3B (adaptador LoRA) | 1.024 tokens | Apache-2.0 declarada / Llama 3.2 Community License | Extraccion de JSON de curriculos | HuggingFace, 34 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K tokens (modelo base) | Llama 3.2 Community License | LLM generalista | HuggingFace, ampliamente usado |
| Qwen2.5-3B-Instruct | 3B | 32K tokens | Apache-2.0 | LLM generalista multilingue | HuggingFace |
| Phi-3.5-mini-instruct | 3,8B | 128K tokens | MIT | LLM generalista | HuggingFace |

La comparativa es orientativa: el adaptador de Mehak esta especializado en una tarea concreta y no compite en capacidades generales con los modelos base. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sensibilidad al formato: curriculos que superen los 1.024 tokens pueden sufrir truncamiento de las secciones finales si no se trocean; el autor recomienda usar `use_cache=True` y una utilidad ligera de reparacion de llaves JSON para manejar truncamientos.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinacion: al ser un modelo generativo, puede inventar campos o valores si el texto de entrada es ambiguo o no contiene la informacion solicitada; conviene validar el JSON contra un esquema.
- Uso fuera de alcance: no debe emplearse para decisiones automatizadas de contratacion o rechazo sin revision humana, segun la propia model card.
- Licencia: aunque el repositorio declara Apache-2.0, el modelo base esta sujeto a la Llama 3.2 Community License, que impone restricciones adicionales (por ejemplo, clausula de usuarios con mas de 700 millones de usuarios mensuales y requisitos de atribucion). Es necesario revisar ambas licencias antes de uso comercial.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos del modelo base y del dataset de curriculos, que puede sobrerrepresentar ciertos perfiles, industrias o geografias.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision en la extraccion, lo que dificulta estimar la tasa de error en produccion.
- Madurez: 34 descargas y 0 likes en el momento de la ficha; no hay senales de adopcion ni mantenimiento a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mehakm/llama-3.2-3b-resume-parser
- Demo (Space): https://huggingface.co/spaces/Mehakm/resume-json-parser
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/sandeeppanem/resume-json-extraction-5k
- Libreria PEFT: https://github.com/huggingface/peft
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
