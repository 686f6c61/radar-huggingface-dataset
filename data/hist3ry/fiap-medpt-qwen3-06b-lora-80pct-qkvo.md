# Hist3ry/fiap-medpt-qwen3-06b-lora-80pct-qkvo

## Resumen

El modelo Hist3ry/fiap-medpt-qwen3-06b-lora-80pct-qkvo es un adaptador LoRA (Low-Rank Adaptation) destinado a afinamiento de dominio médico sobre el modelo base Qwen/Qwen3-0.6B. Ha sido desarrollado por el usuario Hist3ry en el contexto de un Tech Challenge de FIAP, una institución educativa brasileña. El adaptador se entrenó sobre un subconjunto correspondiente al 80% de un conjunto de datos médicos anonimizados, previamente preparado para el proyecto.

El propósito principal es especializar un modelo de lenguaje pequeño (0.6B parámetros) en la generación de texto médico en portugués, sin necesidad de reentrenar el modelo base completo. Esto lo hace interesante para entornos con recursos computacionales limitados o para prototipos académicos. El modelo base Qwen3-0.6B es un transformer autoregresivo de la familia Qwen3; el adaptador se aplica mediante la librería PEFT, y el modelo base no está incluido en el repositorio.

La relevancia actual radica en la exploración de adaptadores ligeros para dominios verticales, especialmente en el sector sanitario, donde se busca minimizar costes computacionales manteniendo un control humano sobre las respuestas. El repositorio en HuggingFace no incluye benchmarks ni datos de rendimiento, por lo que su evaluación práctica depende de pruebas propias en el dominio de aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de decodificacion autoregresiva (modelo base Qwen/Qwen3-0.6B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el repositorio contiene solo el adaptador; el modelo base tiene 0.600 millones de parametros) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no especificado en la informacion del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se detallan cuantizaciones) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA; el modelo base debe descargarse por separado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3-0.6B, un transformer de decodificacion autoregresiva de la familia Qwen3. El adaptador utiliza la tecnica LoRA, que reduce el numero de parametros entrenables aplicando factorizaciones de bajo rango a las matrices de pesos. El nombre del repositorio sugiere que las proyecciones afectadas son las de query, key, value y output (q/k/v/o) en las capas de atencion.

El entrenamiento se llevo a cabo sobre un subconjunto del 80% de un conjunto de datos medicos anonimizados, elaborado para el Tech Challenge de FIAP. No se especifican el numero total de tokens, la composicion detallada del corpus ni la metodologia de preparacion. No hay evidencia de entrenamiento con RLHF o DPO; se trata de un ajuste supervisado estandar mediante PEFT, basado en el optimizador tipico de LoRA. El adaptador es extremadamente ligero, ya que el tamano del repositorio es de 0.0 GB, lo que indica que los archivos son de configuracion y pesos de bajo volumen.

## Capacidades

- Generacion de texto en portugues para el dominio medico, capaz de producir respuestas coherentes dentro del vocabulario clinico anonimo.
- Adaptacion especifica a terminologia medica en portugues mediante el ajuste de bajo rango sobre todas las proyecciones de atencion (q/k/v/o).
- No se han documentado capacidades de tool calling, function calling, agentes o razonamiento multi-paso en la informacion disponible.
- No se menciona soporte para vision, audio ni modos de pensamiento extendido ("thinking mode").
- El modelo base Qwen3 es multilingue, pero el adaptador fue entrenado exclusivamente en portugues, por lo que su rendimiento en otros idiomas no esta garantizado.

## Casos de uso

- Resumen de historiales clinicos anonimizados: el modelo puede generar resumenes en portugues a partir de notas medicas sinteticas o desidentificadas, facilitando la revision rapida en contextos academicos. La salida debe ser validada por un profesional (HITL) antes de cualquier uso real.
- Asistencia en documentacion medica para estudiantes: ayuda a redactar descripciones tecnicas o terminologia apropiada en el ambito clinico, sirviendo como herramienta de apoyo en ejercicios formativos, siempre bajo supervisacion experta.
- Clasificacion de textos medicos en prototipos de investigacion: mediante prompt engineering, el adaptador puede clasificar notas clinicas en categorias como sintomas, tratamientos o resultados de laboratorio. La validacion humana es obligatoria por la naturaleza experimental.
- Generacion de casos clinicos simulados para formacion: el modelo puede crear escenarios de ejemplo para practicas de estudiantes de medicina, con la salvedad de que los casos no constituyen referencias clinicas reales ni deben usarse para decisiones diagnostico-terapeuticas.
- Extraccion de entidades medicas en sistemas academicos: el adaptador puede ser utilizado como base para tareas de reconocimiento de entidades (farmacos, sintomas, enfermedades) en corpus medicos en portugues, aunque requiere un pipeline adicional de validacion y revision humana (HITL).
- Chatbot de informacion medica general en entornos no criticos: puede responder preguntas frecuentes sobre salud o conceptos medicos en portugues, integrado en plataformas que incluyan revision humana previa y avisos explicitos de que no sustituye la evaluacion profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA apenas anade memoria; la VRAM necesaria es la del modelo base Qwen3-0.6B. Estimacion orientativa: ~1,3 GB en FP16 y ~0,5 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (por ejemplo, RTX 3050, RTX 3060 o superiores) es suficiente para ejecutar el modelo en FP16. Tambien puede funcionar en CPU con cuantizacion GGUF del modelo base.
- Si cabe en GPU de consumo: si, de forma amplia, dado el reducido tamano del modelo base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente mediante PEFT y Transformers. Para usar el adaptador es necesario cargar primero el modelo base y despues aplicar el adapter con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fiap-medpt-qwen3-06b-lora-80pct-qkvo | Qwen/Qwen3-0.6B | 0.6B mas adaptador LoRA | No disponible | Apache 2.0 | HuggingFace |
| lucylq/qwen3_06B_lora_math | Qwen/Qwen3-0.6B | 0.6B mas adaptador LoRA | No disponible | No indicada | HuggingFace |
| Qwen3-0.6B (base) | - | 0.6B | No disponible | Apache 2.0 | HuggingFace |

La comparativa se limita a adaptadores LoRA sobre el mismo modelo base, ya que no existen datos publicos de rendimiento para ninguno de ellos. El adaptador de este repo esta enfocado al dominio medico en portugues, mientras que el de lucylq esta orientado a matematicas. Ambos requieren el modelo base para funcionar.

## Limitaciones y advertencias

- El README del autor declara explicitamente que el artefacto es experimental y puede alucinar.
- No es un dispositivo medico: no debe diagnosticar, prescribir ni sustituir la evaluacion profesional.
- El proyecto consumidor exige revision humana (HITL) antes de liberar respuestas.
- Esta entrenado solo en portugues; su uso en otros idiomas puede producir resultados incompletos o incorrectos.
- No existen datos de validacion clinica ni benchmarks publicados que permitan evaluar su calidad.
- El modelo base no esta incluido en el repositorio; es necesario descargar Qwen/Qwen3-0.6B por separado.
- El tamano del repositorio es 0.0 GB, lo que sugiere que el adaptador es de volumen minimo, por lo que la calidad depende en gran medida del dataset de entrenamiento y de la configuracion de LoRA, no documentada en detalle.
- La licencia Apache 2.0 permite uso comercial, pero no implica que el modelo sea apto para uso medico real.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Hist3ry/fiap-medpt-qwen3-06b-lora-80pct-qkvo
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Ejemplo de adaptador similar sobre el mismo modelo base: https://huggingface.co/lucylq/qwen3_06B_lora_math/tree/main
