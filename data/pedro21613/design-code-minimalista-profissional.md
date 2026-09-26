# Pedro21613/design-code-minimalista-profissional

## Resumen

Design Code Minimalista Profissional es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Pedro21613 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No es un modelo de lenguaje completo e independiente: se trata de un conjunto de pesos de ajuste fino (formato PEFT) que modifica el comportamiento del modelo base para especializarlo en la generación de código front-end. Su objetivo concreto es producir páginas en HTML con Tailwind CSS que sigan un estilo visual determinado: minimalista, moderno y profesional.

El adaptador se entrenó con un conjunto muy reducido de 120 ejemplos sintéticos en portugués que cubren landings de SaaS, portafolios, dashboards, pantallas de login, pricing, blogs, e-commerce, clínicas, restaurantes y agencias. El estilo aprendido se caracteriza por Tailwind vía CDN, tipografía Inter, paleta neutra (zinc-50/900) con un único acento, mucho espacio en blanco, contenedores max-w-6xl, esquinas rounded-2xl, sombras shadow-sm, cabecera sticky con blur y diseño responsivo mobile-first.

Su relevancia es acotada pero clara: demuestra cómo un ajuste LoRA sobre un modelo de tan solo 0,5B de parámetros puede especializarse en una tarea de estilo muy concreta con un coste de entrenamiento mínimo (una sola GPU T4). Es útil como plantilla reproducible de fine-tuning ligero y como generador de maquetas HTML + Tailwind, pero no compite en razonamiento ni en cobertura multilingüe con modelos de mayor tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso; modelo base Qwen2.5-0.5B-Instruct |
| Parametros totales | Base ~0,49B (Qwen2.5-0.5B-Instruct); adaptador LoRA con r=16 y alpha=32 (número exacto de parámetros del adaptador: no disponible); tamaño del repositorio 0,1 GB |
| Longitud de contexto | Modelo base Qwen2.5-0.5B-Instruct: 32.768 tokens (según la documentación del modelo base); el adaptador se entrenó con max_len 2048 |
| Tipos de cuantizacion | No disponible como dato explícito; el adaptador se entrega en fp16 y admite combinarse con cuantizaciones del modelo base (int8/int4) mediante PEFT y bitsandbytes |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 con atención de tipo GQA (grouped-query attention) en su versión base. El adaptador se configura con rango r=16, alpha=32, dropout 0.05 y se aplica a las proyecciones q, k, v, o, gate, up y down de cada capa.

El entrenamiento empleó 120 ejemplos sintéticos curados, todos en HTML + Tailwind minimalista, durante 3 épocas con batch efectivo 8, learning rate 2e-4 con scheduler cosine, longitud máxima 2048 tokens y precisión fp16 sobre una GPU T4. La pérdida final reportada es de aproximadamente 0,37 en entrenamiento y 0,09 en evaluación, lo que refleja un ajuste al estilo muy estrecho sobre un corpus pequeño. No se documenta uso de RLHF ni DPO; se trata de supervised fine-tuning (SFT) mediante LoRA.

## Capacidades

- Generación de código front-end: produce documentos HTML completos con Tailwind CSS cargado vía CDN.
- Aplicación de un estilo visual consistente (minimalista y profesional): paleta neutra, tipografía Inter, espacio en blanco, cards, cabecera sticky con blur y pie de página limpio.
- Maquetación responsiva mobile-first con clases Tailwind concretas (max-w-6xl, rounded-2xl, shadow-sm).
- Generación de distintos tipos de página: landing SaaS, portafolio, dashboard, login, pricing, blog, e-commerce, clínica, restaurante y agencia.
- Seguimiento de instrucciones simples en portugués mediante el formato de chat del modelo base (roles system y user).
- Tool calling / function calling: no disponible en la información proporcionada; el adaptador no documenta esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base de 0,5B es muy limitado en este aspecto.
- Capacidades multilingües: solo portugués declarado; otros idiomas no están garantizados.
- Capacidades especiales: no se documenta modo thinking, visión ni audio.

## Casos de uso

- Generación de maquetas de landing pages: a partir de una frase en portugués, el adaptador devuelve un HTML completo con Tailwind. Es adecuado porque su corpus de entrenamiento está compuesto casi íntegramente por landings minimalistas.
- Prototipado rápido de interfaces: generar pantallas (login, pricing, dashboard) para validar layouts antes de invertir en diseño detallado, aprovechando que el resultado es HTML autocontenido y listo para previsualizar.
- Generación de plantillas reutilizables: crear un catálogo de componentes base (header, hero, cards, footer) con un estilo homogéneo para equipos pequeños, gracias a la consistencia de paleta y espaciados aprendida.
- Asistente de estilo para desarrolladores: dado un requisito de sección, obtener un bloque Tailwind coherente con la paleta neutra y el sistema de espaciado definidos en el entrenamiento.
- Proyectos personales y demos: montar sitios estáticos de portafolio o blogs con poco esfuerzo y un coste de cómputo mínimo, ya que cabe en CPU o en GPUs modestas.
- Educación y experimentación con LoRA: usar el adaptador como caso de estudio de fine-tuning ligero sobre un modelo de 0,5B entrenado en una sola GPU T4.
- Integración en pipelines de generación de sitios: al ser HTML autocontenido con CDN, la salida puede encadenarse a herramientas de preview o a un generador de sitios estáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes). El único dato numérico reportado es la pérdida de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida final (train) | ~0,37 |
| Pérdida final (eval) | ~0,09 |
| Ejemplos de entrenamiento | 120 |
| Épocas | 3 |
| Learning rate pico | 2e-4 (cosine) |
| Longitud máxima | 2048 tokens |
| Precisión | fp16 |
| GPU | T4 |

## Requisitos de hardware

- Inferencia: al partir de un modelo de aproximadamente 0,49B de parámetros, los requisitos son muy bajos.
- VRAM estimada (solo pesos): en torno a 1 GB en fp16, 0,5 GB en int8 y 0,3 GB en int4; el adaptador LoRA añade un tamaño despreciable (cifra exacta no disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM. Sirven una GTX 1060 de 6 GB, una RTX 3060 o una RTX 4090 (claramente sobredimensionada). También funciona en CPU y en muchas iGPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU actuales.
- Opciones de despliegue: transformers + peft (el método indicado en la model card); fusión de pesos y exportación a GGUF para llama.cpp/Ollama; vLLM con soporte de adaptadores LoRA; TGI.
- Latencia y throughput: no disponibles; no se publican mediciones. Por el tamaño del modelo se espera una generación rápida en GPU y aceptable en CPU, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| design-code-minimalista-profissional | Base ~0,49B + adaptador LoRA | 32.768 (base); entrenado a 2048 | No disponible | Adaptador especializado en HTML + Tailwind; solo portugués |
| Qwen2.5-0.5B-Instruct (modelo base) | ~0,49B | 32.768 | Apache 2.0 | Modelo generalista; no especializado en diseño ni en un estilo concreto |
| Qwen2.5-Coder-0.5B-Instruct | ~0,49B | 32.768 | Apache 2.0 | Orientado a código general; no específico de Tailwind ni de estilo visual |

Las licencias y contextos de los modelos base se toman de su documentación pública; no hay datos de rendimiento comparativo disponibles para el adaptador.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen2.5-0.5B-Instruct y la librería PEFT para funcionar.
- Tamaño muy reducido (aproximadamente 0,49B de parámetros): capacidad limitada de razonamiento, de seguimiento de instrucciones complejas y de coherencia en salidas largas.
- Corpus de entrenamiento muy pequeño (120 ejemplos): alto riesgo de sobreajuste al estilo concreto aprendido y baja generalización a otros estilos visuales.
- Idiomas: solo portugués declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia no especificada: al no indicarse licencia, no puede confirmarse el uso comercial; conviene contactar con el autor antes de usarlo en producción.
- Riesgo de alucinación: puede generar clases de Tailwind inexistentes, etiquetas HTML mal formadas o recursos (fuentes, imágenes) que no existen.
- Accesibilidad y calidad: aunque el entrenamiento persigue un diseño responsivo y accesible, no hay validación automática; es recomendable revisar y testear el HTML generado.
- Metadatos: la fecha de creación registrada (2026) es posterior a la actual, lo que sugiere un posible error de registro; el modelo acumula 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- Sin datos de benchmarks: no hay evidencia objetiva de calidad más allá de la pérdida de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pedro21613/design-code-minimalista-profissional
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper: no disponible
- Dataset: no disponible
- Demo: no disponible
