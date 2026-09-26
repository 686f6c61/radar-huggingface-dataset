# dreadytofat/blackdwarf

## Resumen

dreadytofat/blackdwarf es un adaptador PEFT publicado en HuggingFace por el usuario dreadytofat. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (presumiblemente LoRA/QLoRA) que debe cargarse junto al modelo base declarado: unsloth/meta-llama-3.1-70b-instruct-bnb-4bit, es decir, una versión del Llama 3.1 70B Instruct cuantizada a 4 bits con bitsandbytes y distribuida por Unsloth.

El repositorio ocupa 0,4 GB y contiene únicamente ficheros safetensors del adaptador, junto con metadatos de la librería PEFT (versión 0.15.2). El modelo base no se incluye: para utilizarlo hay que descargar aparte los pesos cuantizados de 70B (en torno a 35-40 GB), lo que condiciona por completo los requisitos de hardware y el flujo de despliegue.

La relevancia de esta ficha es limitada y debe leerse con cautela: la model card es la plantilla por defecto de HuggingFace sin rellenar, no se declara licencia, idiomas, dataset ni hiperparámetros de entrenamiento, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Se trata, por tanto, de un artefacto experimental sin validación pública documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only denso (Llama 3.1 70B Instruct) |
| Parámetros totales | No disponible para el adaptador; el modelo base declarado tiene aproximadamente 70 000 millones |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base declarado soporta 128 000 tokens |
| Tipos de cuantización | Modelo base en 4 bits (bitsandbytes, formato Unsloth); adaptador distribuido en safetensors |
| Idiomas soportados | No disponibles; el modelo base declara 8 idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible en el repositorio; el modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | unsloth/meta-llama-3.1-70b-instruct-bnb-4bit |
| Librería | peft (versión de framework declarada: PEFT 0.15.2) |
| Tamaño del repositorio | 0,4 GB |
| Tipo de pipeline | No disponible |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only denso de 70 000 millones de parámetros, con atención por grupos (GQA) y contexto nativo de 128 000 tokens, en su variante Instruct afinada mediante alineación (RLHF/DPO según la documentación de Meta). Sobre esa base, blackdwarf añade un adaptador PEFT que, por el tamaño del repositorio (0,4 GB) y el hecho de partir de un checkpoint de 4 bits, es consistente con un esquema QLoRA: los pesos base permanecen congelados en 4 bits y solo se entrenan matrices de bajo rango inyectadas en las capas lineales. El rango, los módulos objetivo y el factor alpha no están documentados y figuran como no disponibles.

No hay información alguna sobre el procedimiento de entrenamiento: ni composición del dataset, ni número de tokens vistos, ni época, ni tasa de aprendizaje, ni si hubo una fase posterior de DPO/RLHF específica. Tampoco se documentan innovaciones técnicas propias del adaptador. Las únicas peculiaridades reseñables son externas al autor: el uso de Unsloth para el base cuantizado y de PEFT 0.15.2 como formato de serialización. Conviene subrayar que, al haberse entrenado sobre pesos ya cuantizados a 4 bits, la fusión del adaptador con un modelo en precisión completa (bf16) no es un procedimiento trivial y puede degradar los resultados.

## Capacidades

No existe ninguna evaluación publicada que confirme las capacidades del adaptador. Las siguientes son las del modelo base declarado y, por tanto, deben considerarse heredadas y no verificadas en blackdwarf:

- Generación de texto y conversación multi-turno en registro instruct.
- Razonamiento de propósito general y resolución de problemas de matemáticas elementales y medias.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, C++, etc.).
- Tool calling / function calling nativo, en el formato de plantilla de Llama 3.1.
- Soporte de flujos agénticos y razonamiento multi-paso, apoyado en la ventana de 128 000 tokens.
- Capacidad multilingüe limitada a los 8 idiomas oficiales del base.
- Comprensión de documentos largos dentro de la ventana de contexto (hasta 128 000 tokens en el base).
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode): no están declaradas ni en el base ni en el adaptador.

Advertencia importante: un ajuste fino no documentado puede haber estrechado el dominio del modelo o degradado capacidades previas (olvido catastrófico). Cualquier uso en producción exige una evaluación propia previa.

## Casos de uso

- Investigación en QLoRA y reproducibilidad: el adaptador permite estudiar cómo se comporta un ajuste de bajo rango sobre una base de 70B cuantizada a 4 bits, comparando la pérdida y las salidas frente al modelo original sin ajustar. Es adecuado porque el repositorio es ligero (0,4 GB) y desacopla el adaptador del base.
- Prototipado de especialización de dominio sobre un 70B en hardware limitado: al cargar el base en 4 bits, un único acelerador de 48-80 GB permite probar el adaptador y evaluar si merece la pena reentrenarlo con más datos.
- Evaluación previa a la integración de adaptadores comunitarios: dado que no hay benchmarks ni licencia declarada, este modelo sirve como caso de estudio de un proceso de due diligence (auditoría de pesos, comprobación de licencia, batería de prompts de seguridad) antes de adoptar cualquier adaptador de origen desconocido.
- Asistente técnico interno sobre documentación extensa: si el ajuste no degrada el base, la ventana de 128 000 tokens permite resumir y consultar manuales, actas o repositorios completos en una sola pasada.
- Extracción de información estructurada y tool calling en pipelines: el soporte nativo de function calling del base permite integrar el modelo en orquestadores que invocan APIs, siempre que se valide que el adaptador conserva dicha capacidad.
- Atención al cliente multilingüe en fase de pruebas: el base cubre español, inglés, francés, alemán, italiano, portugués, hindi y tailandés, lo que habilita pruebas A/B frente al modelo sin ajustar.
- Generación de código asistida en entornos controlados: uso como copiloto interno con contexto largo de repositorio, sujeto a revisión humana y sin exponer datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna sección de evaluación (la model card mantiene el marcador "[More Information Needed]" en el apartado Results) y no se ha localizado ningún informe externo. Tampoco se dispone de métricas de latencia o throughput del adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia con el base en 4 bits: en torno a 35 GB solo para los pesos, más la caché KV. Con GQA de 8 cabezas KV y 80 capas, la caché ronda los 0,31 MB por token en fp16: unos 2,5 GB a 8 000 tokens de contexto y unos 40 GB a 128 000 tokens. En la práctica, 40-48 GB de VRAM para contextos moderados (estimación propia, no confirmada por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB o 2× A6000 48 GB. Para servir el base en bf16 (unos 140 GB de pesos) hacen falta al menos 2× H100 80 GB o 4× A100 40 GB.
- Viabilidad en GPU de consumo: no cabe completo en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) sin descarga de capas a CPU/RAM, lo que reduce drásticamente el throughput. En una GPU de consumo solo es planteable el entrenamiento o la evaluación parcial, no el servicio en producción.
- Opciones de despliegue: transformers + PEFT + bitsandbytes (ruta natural, ya que el adaptador se entrenó sobre una base bnb-4bit); vLLM con soporte de adaptadores LoRA; TGI con LoRA; llama.cpp u Ollama exigen convertir tanto el base como el adaptador a GGUF, un proceso no documentado por el autor y con riesgo de pérdida de fidelidad.
- Fusión de pesos: unir el adaptador a un modelo en bf16 requiere cargar el base completo (unos 140 GB) y no está garantizado que funcione correctamente desde un origen cuantizado a 4 bits.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se establece a nivel de modelo base, ya que no existen métricas propias del adaptador.

| Modelo | Parámetros | Contexto | Licencia | Distribución | Benchmarks publicados |
|---|---|---|---|---|---|
| blackdwarf (adaptador) | Adaptador sobre 70B | No especificado (128k en el base) | No disponible | safetensors PEFT | No disponibles |
| Llama 3.1 70B Instruct (base declarado) | 70B densos | 128 000 tokens | Llama 3.1 Community License | safetensors, GGUF | Publicados por Meta, no reproducidos aquí |
| Llama 3.3 70B Instruct | 70B densos | 128 000 tokens | Llama 3.3 Community License | safetensors, GGUF | Publicados por Meta, no reproducidos aquí |
| Qwen2.5 72B Instruct | 72B densos | 131 072 tokens | Licencia Qwen | safetensors, GGUF | Publicados por Alibaba, no reproducidos aquí |

Frente a estos modelos, la diferencia relevante de blackdwarf no es de capacidad, sino de naturaleza: es un delta de pesos de origen anónimo sobre un base concreto, sin licencia propia declarada, sin evaluación y sin soporte de la comunidad. El valor añadido del ajuste no puede cuantificarse con la información disponible.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre dataset, hiperparámetros, metodología ni evaluación. Cualquier afirmación sobre su comportamiento es especulativa.
- Autor desconocido y sin tracción: 0 descargas y 0 likes en el momento de la consulta; no existe validación independiente ni reportes de uso.
- Dependencia estricta del base: se entrenó sobre unsloth/meta-llama-3.1-70b-instruct-bnb-4bit; cargarlo sobre otro checkpoint o en otra precisión puede producir resultados incorrectos o fallos silenciosos.
- Licencia no declarada: el uso comercial queda sujeto, como mínimo, a la Llama 3.1 Community License, que exige atribución ("Built with Llama"), incluye política de uso aceptable y establece condiciones adicionales para productos con más de 700 millones de usuarios mensuales. El adaptador no puede relicenciarse sin aclaración del autor.
- Riesgo de alucinación: inherente a un modelo de 70B sin verificación factual; no hay evaluación que indique si el ajuste lo agrava.
- Sesgos: los del modelo base (sesgos de género, raza, religión y geográficos documentados en la familia Llama) se heredan y no han sido mitigados de forma documentada.
- Posible olvido catastrófico: sin benchmarks comparativos contra el base, no puede descartarse una degradación de capacidades generales, de tool calling o multilingües.
- Idiomas: no declarados para el adaptador; si el ajuste se hizo con datos en un solo idioma, el rendimiento en el resto puede caer sin aviso.
- Metadatos poco fiables: las fechas de creación y actualización registradas (25 y 25-09-2026) son posteriores a la publicación habitual de la familia Llama 3.1, lo que sugiere metadatos inconsistentes o un experimento de fecha incierta.
- No apto para producción sin auditoría previa: se recomienda evaluar con un conjunto propio de prompts, revisar el contenido de los safetensors y aclarar la licencia con el autor antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreadytofat/blackdwarf
- Modelo base declarado: https://huggingface.co/unsloth/meta-llama-3.1-70b-instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct
- Anuncio de Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/
- Librería PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Referencia arXiv incluida en las etiquetas del repositorio (arXiv:1910.09700): Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning". Es una cita genérica de la plantilla de model card, no un artículo sobre este modelo.
- Búsqueda web: no se han encontrado enlaces ni documentación relevantes sobre este modelo; los resultados obtenidos no guardan relación con él.
