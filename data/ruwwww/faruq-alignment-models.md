# ruwwww/faruq-alignment-models

## Resumen

Faruq IndoLaw Alignment Models es una colección de adaptadores LoRA y checkpoints de ajuste supervisado (SFT) orientados al razonamiento jurídico penal de Indonesia, publicada por el usuario ruwwww bajo licencia Apache 2.0. El objetivo declarado es que el modelo genere los dos componentes nucleares de una sentencia: la fundamentación jurídica (pertimbangan hukum) y el fallo (amar putusan), a partir de la acusación (surat dakwaan) y de los hechos probados en juicio de primera instancia, respetando el régimen de prueba del artículo 184 del KUHAP.

No se trata de un único modelo, sino de un repositorio jerárquico con seis variantes construidas sobre distintos modelos base (Qwen 2.5 de 1,5B y 3B, Qwen 3.5 9B, Qwen 3.8 27B, Gemma 4 12B y Gemma 4 31B) mediante LoRA en BF16 o QLoRA de 4 bits NF4, con cinco épocas y checkpoints intermedios por época. La variante más documentada, Gemma 4 31B, obtiene una pérdida de evaluación de 0,6427 y completa el 100 % de las fundamentaciones y el 94,2 % de los fallos en un banco de 52 casos no vistos, con unos 18,2 tokens por segundo en una A100-SXM4 de 40 GB.

Su interés práctico reside en demostrar el ajuste de dominio jurídico sobre modelos ligeros y medianos con adaptadores separados y cuantización de 4 bits, publicando además artefactos de evaluación reproducibles. El alcance queda restringido al idioma indonesio y a identificadores de modelos base que no coinciden con nomenclaturas públicas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers densos (familias Gemma y Qwen) con adaptadores LoRA/QLoRA acoplados mediante PEFT; no se detalla la configuración interna |
| Parametros totales | Segun la variante: 1,5B, 3B, 9B, 12B, 27B y 31B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QLoRA de 4 bits NF4 con doble cuantizacion (bitsandbytes) en las variantes de 12B, 27B y 31B; LoRA en BF16 en las de 1,5B, 3B y 9B. No se publican pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | Indonesio (id) unicamente; no se declaran otros idiomas |
| Licencia | apache-2.0 (debe verificarse la licencia propia de cada modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA/QLoRA; los pesos base se descargan aparte) |
| Autor | ruwwww |
| Pipeline | text-generation |
| Tamano del repositorio | 6,7 GB |
| Subcarpetas de modelos | 6 (gemma4-31b, qwen38-27b, gemma4-12b, qwen35-9b, 3b y 1.5b, todas con 5 epocas) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-27 |

## Arquitectura y entrenamiento

El proyecto sigue un esquema de adaptación de dominio mediante SFT. Cada subcarpeta contiene un adaptador entrenado sobre un modelo base congelado: las variantes grandes (Gemma 4 12B y 31B, Qwen 3.8 27B) usan QLoRA de 4 bits NF4 con doble cuantización, mientras que las pequeñas (Qwen 2.5 1.5B y 3B, Qwen 3.5 9B) usan LoRA en BF16. Todas se entrenan durante 5 épocas y conservan checkpoints intermedios (`checkpoints/epoch-1` a `epoch-5`) con los pesos del adaptador, la receta en YAML y el fichero de métricas. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO.

La tarea se formula como generación estructurada de dos bloques etiquetados, `[PERTIMBANGAN HUKUM]` y `[AMAR PUTUSAN]`, condicionada por la acusación y los hechos de juicio. La evaluación formal se realiza sobre 52 casos jurídicos no vistos (`artifacts/sft_v2/test.jsonl`), con distribución temática de 30 casos de estupefacientes (Ley n.º 35/2009), 10 de robo (artículos 362/363 del KUHP), 4 de información y transacciones electrónicas (ITE), 2 de protección de menores, 2 de estafa (artículo 378), 2 de delitos comunes, 1 de apropiación indebida (artículo 372) y 1 de juego ilegal (artículo 303). No se describen innovaciones de decodificación (especulativa, atención lineal u otras).

## Capacidades

- Generación de texto jurídico en indonesio, con salida estructurada en dos secciones diferenciadas: fundamentación jurídica y fallo.
- Razonamiento jurídico penal: subsunción de hechos en los elementos del tipo acusado y valoración de prueba conforme al artículo 184 del KUHAP.
- Redacción de dictámenes completos: declaración de culpabilidad o absolución, pena impuesta, abono de prisión preventiva, destino de las pruebas materiales y costas procesales.
- Adaptación a distintas familias de delitos (estupefacientes, robo, estafa, apropiación indebida, delitos informáticos, protección de menores y juego ilegal) según la distribución del banco de prueba.
- Capacidad multilingüe: no documentada; el repositorio declara exclusivamente indonesio.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- Reutilización como adaptador PEFT independiente, cargable sobre el modelo base correspondiente mediante el argumento `subfolder`.

## Casos de uso

- Redacción asistida de borradores de sentencia: el modelo recibe la acusación y los hechos probados y devuelve una propuesta de fundamentación y fallo que el juez o el secretario revisan; es adecuado porque el ajuste reproduce la estructura y el registro de las resoluciones de primera instancia.
- Extracción de ratio decidendi y dictum para bases de jurisprudencia: permite segmentar resoluciones en sus dos componentes argumentativos, lo que facilita la indexación y la búsqueda semántica en repositorios judiciales.
- Verificación de cumplimiento del artículo 184 del KUHAP: se emplea como comprobador de que la fundamentación cita y valora los medios de prueba legalmente previstos antes de emitir el fallo.
- Generación de datos sintéticos etiquetados para entrenar modelos jurídicos mayores: la variante de 31B, con 1.691,4 tokens de salida media por resolución y métricas auditables, puede actuar como generador de pares entrada-salida de calidad controlada.
- Formación y simulación judicial: estudiantes y opositores pueden plantear casos y comparar su razonamiento con la salida del modelo, dado el formato fijo de respuesta.
- Control de calidad y homogeneidad de plantillas: detección de resoluciones que omiten el fallo o la fundamentación, aprovechando que la evaluación registra la presencia o ausencia de cada bloque.
- Clasificación y enrutado documental en juzgados: la distribución de categorías penales del banco de prueba permite usarlo como primer filtro temático antes de la revisión humana.
- Investigación en adaptación de dominio con recursos limitados: las variantes de 1,5B y 3B permiten estudiar la curva de rendimiento frente al tamaño del modelo base sin infraestructura de gama alta.

## Benchmarks y rendimiento

Matriz de entrenamiento y resultados publicada por el autor:

| Subcarpeta | Modelo base | Metodo | Epocas | Train loss | Eval loss | Resultado en 52 casos |
|---|---|---|---|---|---|---|
| models/sft-v2-gemma4-31b-5epoch | Gemma 4 31B It | QLoRA 4-bit NF4 | 5 | 0,6541 | 0,6427 (mejor 0,6361) | 100 % fundamentacion, 94,2 % fallo |
| models/sft-v2-qwen38-27b-5epoch | Qwen 3.8 27B | QLoRA 4-bit NF4 | 5 | 0,7156 | 0,6246 | Evaluacion en curso |
| models/sft-v2-gemma4-12b-5epoch | Gemma 4 12B It | QLoRA 4-bit NF4 | 5 | 0,7632 | 0,6980 (mejor 0,6965) | Checkpoints listos (ep. 1-5) |
| models/sft-v2-qwen35-9b-5epoch | Qwen 3.5 9B | LoRA BF16 | 5 | 0,6865 | 0,6288 | Checkpoints listos |
| models/sft-v2-3b-5epoch | Qwen 2.5 3B | LoRA BF16 | 5 | 0,5478 | 0,5752 | Linea base 3B |
| models/sft-v2-5epoch | Qwen 2.5 1.5B | LoRA BF16 | 5 | 0,5520 | 0,5520 | Linea base 1.5B |

Detalle de la evaluacion de Gemma 4 31B (4 bits QLoRA, 5 epocas) sobre el banco de 52 casos:

| Metrica | Resultado |
|---|---|
| Casos probados | 52 / 52 (100,0 %) |
| Fundamentacion juridica completa | 52 / 52 (100,0 %) |
| Fallo completo | 49 / 52 (94,2 %) |
| Longitud media de salida | 1.691,4 tokens por resolucion |
| Rendimiento de inferencia (A100-SXM4-40GB) | ~18,2 tokens/s (batch en 4 bits NF4) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB para la variante Gemma 4 31B en 4 bits NF4, segun el propio model card. Para el resto de variantes no se especifica consumo de VRAM.
- GPU recomendadas: A100-SXM4 de 40 GB es la unica empleada en la evaluacion publicada. Las variantes de 1,5B, 3B y 9B, cargadas en BF16, no tienen requisitos documentados.
- GPU de consumo: no hay datos publicados. La variante de 31B en 4 bits (~18 GB) queda por encima de una RTX 4090 de 24 GB solo si se anade el contexto y el overhead del runtime, por lo que su encaje en GPU de consumo no esta confirmado; las variantes pequenas probablemente si caben, pero no se aporta medicion.
- Consideracion de despliegue: al publicarse unicamente adaptadores, cada variante requiere cargar por separado el modelo base completo (en 4 bits o BF16) mas el adaptador mediante `transformers` y `peft`, con el argumento `subfolder`.
- Opciones de despliegue documentadas: exclusivamente `transformers` + `peft` + `bitsandbytes`. No se documentan vLLM, TGI, llama.cpp ni Ollama, y al no haber pesos GGUF la ruta llama.cpp/Ollama no es utilizable directamente.
- Latencia y throughput: ~18,2 tokens/s en A100-SXM4 de 40 GB para la variante de 31B. No hay mediciones para el resto.
- Almacenamiento: el repositorio ocupa 6,7 GB, sin contar los pesos de los modelos base que deben descargarse aparte.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables (por ejemplo, otros ajustes para derecho penal indonesio o asistentes juridicos multilingues) en la informacion proporcionada. Como referencia practica, la unica comparacion posible es interna, entre las variantes del propio repositorio:

| Variante | Parametros | Metodo | Eval loss | Evaluacion en 52 casos | Licencia |
|---|---|---|---|---|---|
| sft-v2-gemma4-31b-5epoch | 31B | QLoRA 4-bit NF4 | 0,6427 | 100 % fundamentacion / 94,2 % fallo | apache-2.0 (adaptador) |
| sft-v2-qwen38-27b-5epoch | 27B | QLoRA 4-bit NF4 | 0,6246 | En curso | apache-2.0 (adaptador) |
| sft-v2-gemma4-12b-5epoch | 12B | QLoRA 4-bit NF4 | 0,6980 | Sin resultados publicados | apache-2.0 (adaptador) |
| sft-v2-qwen35-9b-5epoch | 9B | LoRA BF16 | 0,6288 | Sin resultados publicados | apache-2.0 (adaptador) |
| sft-v2-3b-5epoch | 3B | LoRA BF16 | 0,5752 | Linea base | apache-2.0 (adaptador) |
| sft-v2-5epoch | 1,5B | LoRA BF16 | 0,5520 | Linea base | apache-2.0 (adaptador) |

Advertencia: valores de eval loss mas bajos no implican mejor calidad de redaccion juridica; los unicos resultados de tarea disponibles corresponden a la variante de 31B.

## Limitaciones y advertencias

- Ambito restringido al derecho penal indonesio de primera instancia; no cubre otras jurisdicciones, ramas del derecho ni instancias superiores.
- Idioma unico: el repositorio declara solo indonesio; su uso en castellano u otros idiomas no esta soportado ni evaluado.
- Riesgo alto de alucinacion juridica: puede citar normativa, articulos o elementos probatorios no presentes en la acusacion o en los hechos aportados, con consecuencias graves si se usa sin revision humana.
- Evaluacion limitada y autoinformada: 52 casos, distribuidos de forma muy desigual (30 de estupefacientes) y sin resultados de benchmarks academicos independientes.
- Solo una variante tiene resultados de tarea publicados; las demas carecen de evaluacion final, y la de 27B figura como en curso.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Identificadores de modelos base (Gemma 4 31B/12B, Qwen 3.8 27B, Qwen 3.5 9B) que no se corresponden con nomenclaturas de versiones publicas verificables; conviene confirmar su disponibilidad real antes de intentar cargarlos.
- La licencia apache-2.0 aplica al adaptador publicado, pero los pesos base conservan sus propias condiciones de uso, que deben revisarse por separado, especialmente para uso comercial.
- Ausencia de datos de longitud de contexto, de consumo de VRAM en las variantes pequenas y de rendimiento fuera de la A100, lo que dificulta el dimensionamiento en produccion.
- Salidas largas (1.691,4 tokens de media) que incrementan el coste por inferencia y el tiempo de revision.
- Repositorio de solo adaptadores: cualquier despliegue exige descargar y cuantizar el modelo base, anadiendo complejidad operativa.
- Fechas de creacion y actualizacion posteriores a la fecha habitual de consulta (2026), dato a verificar junto con el estado real del proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/ruwwww/faruq-alignment-models
- Repositorio de codigo e investigacion: https://github.com/ADDI-LAW/faruq-project
- Resultados de evaluacion (tabla de 52 casos): https://huggingface.co/ruwwww/faruq-alignment-models/blob/main/evaluations/sft-v2-gemma4-31b-5epoch/samples.csv
- Resultados de evaluacion (JSON Lines): https://huggingface.co/ruwwww/faruq-alignment-models/blob/main/evaluations/sft-v2-gemma4-31b-5epoch/samples.jsonl
- Modelos base declarados: google/gemma-4-31B-it, google/gemma-4-12B-it, Qwen/Qwen3.8-27B, Qwen/Qwen3.5-9B, Qwen/Qwen2.5-3B, Qwen/Qwen2.5-1.5B
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
