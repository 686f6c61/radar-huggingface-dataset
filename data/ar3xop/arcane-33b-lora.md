# ar3xop/arcane-33b-lora

## Resumen

Arcane-33B-LoRA es un adaptador PEFT (LoRA) desarrollado por el usuario ar3xop y publicado en Hugging Face. Está diseñado para funcionar sobre el modelo base Vicuna-33B, un transformer decoder-only derivado de LLaMA-2, con el objetivo de proporcionar análisis de salud mental de alta precisión y generación de explicaciones clínicas completas. El adaptador ocupa aproximadamente 0,1 GB, lo que indica que se distribuye únicamente el peso del adaptador, no el modelo base completo.

La relevancia de este modelo radica en su enfoque específico: en lugar de entrenar un modelo completo desde cero, se aprovecha un modelo base de 33 mil millones de parámetros y se adapta mediante LoRA a una tarea especializada. Esto reduce drásticamente los costes de entrenamiento y permite ajustar modelos grandes a dominios concretos con recursos limitados. Sin embargo, la documentación publicada es muy escasa: no se especifican datos de entrenamiento, métricas de evaluación ni detalles técnicos adicionales, lo que limita su uso en entornos de producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Vicuna-33B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros; el modelo base Vicuna-33B tiene 33B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Vicuna-33B, tipicamente 4096 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base, pero no se indica) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | llama2 (licencia de Meta para LLaMA-2, con restricciones de uso comercial) |
| Formato de pesos | No especificado (probablemente safetensors o binarios de PyTorch, pero no se indica) |

## Arquitectura y entrenamiento

El adaptador utiliza la tecnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inserta matrices de bajo rango en las capas de atencion y feed-forward. Esto permite ajustar el modelo a una tarea especifica con un numero muy reducido de parametros entrenables. El modelo base es Vicuna-33B, un modelo de lenguaje basado en LLaMA-2, entrenado con instrucciones y conversaciones. No se dispone de informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se mencionan innovaciones tecnicas adicionales.

## Capacidades

- Analisis de salud mental: el adaptador esta orientado a interpretar textos relacionados con sintomas, estados emocionales o trastornos psicologicos.
- Generacion de explicaciones clinicas: puede producir descripciones o informes explicativos sobre condiciones de salud mental.
- Generacion de texto en ingles: al estar basado en Vicuna-33B, hereda la capacidad de generar texto coherente y seguir instrucciones en ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modos de razonamiento especiales.

## Casos de uso

- Analisis de transcripciones de sesiones terapeuticas: el modelo puede procesar conversaciones entre paciente y terapeuta para extraer patrones emocionales o detectar posibles indicadores de riesgo, siempre que se valide su precision en un entorno controlado.
- Generacion de resumenes clinicos: a partir de notas medicas o cuestionarios, el adaptador puede redactar un resumen estructurado de la sintomatologia del paciente.
- Apoyo en triaje de salud mental: en plataformas de atencion digital, el modelo podria clasificar mensajes de usuarios segun la urgencia o gravedad percibida, aunque requiere supervision humana.
- Educacion y formacion de profesionales: puede generar casos de ejemplo o explicaciones de trastornos para material didactico.
- Investigacion en psicologia computacional: util para anotar grandes volumenes de texto con etiquetas relacionadas con salud mental.
- Asistente de redaccion para informes: ayuda a redactar informes preliminares que luego un profesional revisa y corrige.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas especificas de salud mental. Tampoco se comparan con otros modelos en la documentacion.

## Requisitos de hardware

- Para utilizar el adaptador es necesario cargar el modelo base Vicuna-33B, lo que requiere una GPU con al menos 66 GB de VRAM en precision fp16. Con cuantizacion (por ejemplo, 8 bits o 4 bits) se puede reducir a unos 33-40 GB, pero no se especifica compatibilidad con cuantizaciones concretas.
- GPUs recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) o multiples RTX 4090 (24 GB cada una) con tecnicas de paralelismo.
- No es viable en GPUs de consumo de gama media (8-12 GB) sin cuantizacion agresiva y aun asi el rendimiento seria limitado.
- Opciones de despliegue: se puede usar con librerias que soporten PEFT, como Hugging Face Transformers con `peft`, o servidores de inferencia como vLLM (si se integra el adaptador). Tambien es posible usar llama.cpp si se convierte el modelo base a GGUF y se aplica el adaptador, aunque no esta documentado.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para salud mental sobre Vicuna-33B. Existen otros modelos de salud mental como MentalLLaMA o ChatDoctor, pero no son adaptadores LoRA y no se pueden comparar directamente sin datos de rendimiento. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La documentacion es minima: no se especifican datos de entrenamiento, metodos de evaluacion ni garantias de precision clinica.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inexacta, especialmente en un dominio sensible como la salud mental.
- Sesgos: no se han documentado sesgos, pero es probable que el modelo herede sesgos del modelo base Vicuna-33B y de los datos de entrenamiento del adaptador.
- Idioma: solo se soporta ingles, lo que limita su uso en poblaciones hispanohablantes.
- Licencia llama2: permite uso comercial, pero con restricciones (por ejemplo, no se puede usar para servicios con mas de 700 millones de usuarios mensuales). Ademas, el modelo base Vicuna-33B puede tener sus propias condiciones.
- No debe utilizarse como herramienta de diagnostico medico sin supervision profesional. Es un modelo de investigacion y no un dispositivo clinico validado.
- El adaptador tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ar3xop/arcane-33b-lora
- Resultados de busqueda web (no directamente relacionados con el modelo, pero incluidos como referencia):
  - https://huggingface.co/lizavetttka/Arcane_style_LoRA
  - https://huggingface.co/Muapi/ltx2.3-arcane-jinx-lora
  - https://prompthero.com/ai-models/arcane-style-lora-download
  - https://loraai.io/loras
  - https://civitai.com/models/83746/arcane-style-lora
