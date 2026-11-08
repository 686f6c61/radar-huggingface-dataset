# danterolle/vera-qwen35-4b-step400-adapter

## Resumen

VERA Qwen3.5-4B step-400 adapter es un adaptador LoRA de caracter experimental publicado por el usuario danterolle sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo completo, sino de un artefacto PEFT de 10.616.832 parametros (unos 10,6 millones) que se aplica sobre los pesos del modelo base para inducir un comportamiento especifico: la generacion de respuestas "evidence-grounded" (ancladas en evidencia) compatibles con el sistema VERA, un entorno que combina recuperacion de corpus, validacion de citas y un gate de revision humana. El adaptador se entreno con rango LoRA 8, alpha 16, dropout 0 y siete modulos de proyeccion, durante 400 actualizaciones del optimizador en FP32, lo que equivale a aproximadamente 0,81 epocas sobre un dataset sintetico no revisado por expertos.

La relevancia de esta publicacion es doble. Por un lado, documenta un flujo de trabajo reproducible de adaptacion de bajo rango sobre un modelo denso de 4B parametros, con verificacion de checksums SHA-256 y un script de reproduccion incluido. Por otro, establece explicitamente limites de uso: el autor indica que la liberacion publica del adaptador no autoriza el entrenamiento sobre el dataset ni el despliegue en produccion, y que las evaluaciones v3 en ingles se realizaron con prompts alineados mecanicamente sin reentrenar el adaptador.

El contexto de 4.096 tokens de salida empleado en la validacion local, el uso de un modelo base cuantizado Q6_K y la ausencia de pesos del modelo base en el repositorio (0,1 GB de tamano total) sitúan este artefacto en la categoria de experimento de investigacion reproducible mas que en la de componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.5-4B |
| Parametros totales | 10.616.832 (adaptador); modelo base 4B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; validacion local con limite de salida de 4.096 tokens |
| Tipos de cuantizacion | adaptador en safetensors (FP32/FP16) y conversion GGUF F16; base probado en Q6_K |
| Idiomas soportados | no disponibles en la model card; evaluaciones v3 realizadas en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) y GGUF (vera-step400-lora-f16.gguf) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 16 y dropout 0 aplicado sobre siete modulos de proyeccion del transformer denso Qwen3.5-4B (revision fijada 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a). El entrenamiento se realizo en FP32 durante 400 actualizaciones del optimizador, lo que corresponde a aproximadamente 0,81 epocas sobre un dataset sintetico que, segun el autor, no ha sido revisado por expertos. El prompt de entrenamiento empleado fue el contrato de respuesta historico previo a la version v3; las evaluaciones posteriores en ingles v3 usaron prompts alineados mecanicamente sin reentrenar el adaptador.

El objetivo del entrenamiento no es mejorar capacidades generales del modelo base, sino alinear el estilo de respuesta con el contrato de evidencia de VERA: respuestas concisas, citas verificables y marcado explicito de informacion no disponible. El artefacto incluye el adaptador PEFT, una conversion GGUF F16 probada y un fichero `step400-adapter.sha256` con los digests de los tres ficheros. No se incluyen dataset, base de datos de runtime, credenciales ni pesos del modelo base. La aplicacion del LoRA sobre un GGUF cuantizado difiere numericamente de la fusion previa a la cuantizacion, advertencia que el propio autor senala.

## Capacidades

- Generacion de respuestas ancladas en evidencia (evidence-grounded) siguiendo el contrato de respuesta de VERA.
- Marcado explicito de informacion no disponible, en lugar de completar huecos con contenido inventado, segun la validacion local descrita.
- Clasificacion de preguntas fuera de alcance (out of scope), verificada en el smoke check con una pregunta sobre PowerShell y otra de recetas.
- Respuestas tecnicas concisas sobre vulnerabilidades (CWE, CVE), con citas y estado de validacion.
- Integracion con el runtime VERA, que aporta validacion de citas, ReAct opcional y fuentes en vivo opcionales.
- Capacidades del modelo base Qwen3.5-4B (razonamiento paso a paso, tokenizacion multilingue, corpus de preentrenamiento amplio) disponibles en la medida en que el adaptador no las degrade.
- No se documentan capacidades de tool calling, vision, audio ni modo thinking especificas del adaptador.

## Casos de uso

- Asistencia en analisis de vulnerabilidades: el adaptador puede generar resumenes concisos de CWE/CVE con citas al corpus bundled, marcando los identificadores no encontrados como no disponibles, lo que encaja en flujos de triaje de seguridad con revision humana.
- Verificacion de respuestas en dominios regulados: en entornos donde una respuesta sin evidencia es peor que una respuesta incompleta, el marcado de informacion no disponible reduce el riesgo de afirmaciones no sustentadas.
- Investigacion reproducible sobre LoRA: el repositorio incluye script de reproduccion (`scripts/reproduce_step400.py`), verificacion de checksums y comparacion A/B con escalas LoRA 0 y 1, util para estudiar el efecto de adaptadores de bajo rango sobre modelos de 4B.
- Evaluacion de pipelines RAG con gate de validacion: el adaptador sirve para probar como un runtime con validador de citas y revision humana interactua con un modelo ajustado para producir respuestas citables.
- Prototipado de contratos de respuesta: equipos que disenan esquemas de salida estructurada con estados de validacion pueden usar este adaptador como referencia de comportamiento.
- Docencia y formacion en seguridad de IA: el artefacto y su model card documentan limites, provenance y criterios de evaluacion, lo que lo hace util como caso de estudio de publicacion responsable de adaptadores experimentales.
- No se recomienda su uso en produccion segun los terminos del autor; cualquier caso de uso debe limitarse a entornos de investigacion con revision humana.

## Benchmarks y rendimiento

La unica evaluacion publicada es un smoke check offline A/B de cuatro casos ejecutado a traves de VERA, con el mismo modelo base Q6_K, LoRA deshabilitado/habilitado, ReAct deshabilitado, fuentes en vivo deshabilitadas y bases de datos temporales.

| Criterio | Base (LoRA off) | Adaptador (LoRA on) |
|---|---|---|
| Criterio permisivo de estado/cita | 2/4 | 3/4 |
| Cero errores de validacion | 2/4 | 2/4 |
| Clasificacion out of scope (PowerShell) | correcta | correcta |
| Clasificacion out of scope (receta) | correcta | correcta |
| Caso CWE-89 | resumen con afirmacion XSS contradictoria | respuesta concisa anclada |
| Caso CVE ausente | resultado no disponible combinado con afirmacion de hecho soportado | marcado como no disponible |

El autor advierte que se trata de un smoke check de runtime, no de un benchmark de exactitud factual ni de una aprobacion de despliegue, y que el validador de citas del runtime no valida cada frase del resumen. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 10,6 millones de parametros y el repositorio ocupa 0,1 GB, por lo que su carga anade un coste de memoria despreciable frente al modelo base.
- El requisito real lo marca Qwen3.5-4B: en FP16 requiere aproximadamente 8 GB de VRAM; en Q6_K, en torno a 3,5-4 GB; en Q4, alrededor de 2,5-3 GB (estimaciones orientativas, no publicadas por el autor).
- Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB en cuantizaciones de 4 a 8 bits; en FP16 es recomendable una RTX 4090 o superior.
- Para despliegue en servidor se documenta `llama-server` (build a partir del commit 8642541b2), con soporte de aplicacion de LoRA sobre GGUF cuantizado; tambien son viables vLLM, TGI o llama.cpp con soporte PEFT, aunque no se han publicado mediciones de latencia ni throughput.
- El script de reproduccion requiere `uv`, el extra `knowledge-graph` y `huggingface_hub`, y escribe estado solo en bases SQLite temporales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VERA Qwen3.5-4B step-400 adapter | 10,6 M (adaptador) + 4B base | no disponible (salida validada a 4.096 tokens) | LoRA sobre transformer denso | no disponible | Hugging Face, experimental |
| Qwen/Qwen3.5-4B | 4B | no disponible en la informacion | Transformer denso | la del modelo base (no indicada aqui) | Hugging Face |
| Adaptadores LoRA genericos sobre Qwen3.5-4B | variable | depende del base | LoRA | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- El autor declara explicitamente que la liberacion publica no autoriza el entrenamiento sobre el dataset ni el despliegue en produccion.
- Dataset de entrenamiento sintetico y no revisado por expertos; riesgo de sesgos y de artefactos de generacion sintetica no caracterizados.
- Riesgo de alucinacion mitigado solo parcialmente: el validador de citas del runtime no valida cada frase del resumen.
- El adaptador se entreno con el contrato de respuesta historico previo a v3; las evaluaciones v3 usaron prompts alineados mecanicamente sin reentrenamiento, lo que puede introducir desajustes.
- La aplicacion del LoRA sobre GGUF cuantizado difiere numericamente de la fusion previa a la cuantizacion; es necesario validar el modelo servido.
- La validacion local se limita a cuatro casos en ingles; no constituye una evaluacion de exactitud factual.
- No se declaran idiomas soportados ni licencia en la model card, lo que impide evaluar el uso comercial.
- El repositorio no incluye pesos del modelo base, dataset, base de datos de runtime ni credenciales; la reproducibilidad depende de obtener el base bajo sus propios terminos.
- El servidor compatible (`llama-server` commit 8642541b2) es especifico de plataforma y debe instalarse por separado.
- Se debe mantener el gate de revision humana de VERA en cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danterolle/vera-qwen35-4b-step400-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision del base fijada: 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Referencia sobre Qwen3.5-4B: https://www.emergentmind.com/topics/qwen3-5-4b-model
- Script de reproduccion en el repositorio: `scripts/reproduce_step400.py`
- Checksums: `step400-adapter.sha256` (incluido en el repositorio)
