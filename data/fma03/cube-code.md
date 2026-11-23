# FMA03/cube-code

## Resumen

Cube Code es un adaptador LoRA para el modelo Qwen/Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario FMA03 como parte de su proyecto personal de IA denominado Cube. No se trata de un modelo completo, sino de un ajuste fino de bajo rango (r=16) que se distribuye exclusivamente como adaptador PEFT: el modelo base debe descargarse por separado desde el repositorio oficial de Qwen.

El adaptador está especializado en la generación de aplicaciones web sencillas de un solo archivo (HTML/CSS/JS), como listas de tareas, temporizadores, conversores de unidades, blocs de notas o minijuegos de pocas centenas de líneas. El autor indica explícitamente que no está pensado para proyectos de gran escala del orden de 1.000 líneas. Su relevancia es limitada y muy específica: se trata de un experimento personal con cero descargas y cero valoraciones en el momento de la consulta, orientado a un nicho concreto de generación de código frontend ligero.

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-7B-Instruct (transformer denso de 7.000 millones de parámetros), sobre el que se aplica un ajuste LoRA con rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q/k/v/o/gate/up/down. El adaptador declara soporte para japonés e inglés, licencia Apache 2.0 y un tamaño de repositorio de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA con r=16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 (tanto el adaptador como el modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Configuracion LoRA | r=16, lora_alpha=32, lora_dropout=0,05, modulos objetivo q/k/v/o/gate/up/down |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer denso de 7.000 millones de parámetros. El ajuste es un LoRA de rango 16 con alpha 32 y dropout 0,05, aplicado sobre las proyecciones de atención (q, k, v, o) y las proyecciones del bloque MLP (gate, up, down). No se modifican los pesos del modelo base; el repositorio contiene únicamente los pesos del adaptador.

El conjunto de entrenamiento es muy reducido: 106 ejemplos, compuestos exclusivamente por código de referencia que superó el arnés de verificación propio del autor. No se documenta el número de tokens de entrenamiento, la composición detallada del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card no menciona innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.); el interés del trabajo reside en el proceso de curación de datos mediante verificación automática en navegador, no en aportaciones arquitectónicas.

## Capacidades

- Generación de código frontend: aplicaciones web de un solo archivo con HTML, CSS y JavaScript (listas de tareas, temporizadores, conversores de unidades, blocs de notas, minijuegos).
- Generación de texto conversacional en el formato de chat del modelo base (etiquetas `apply_chat_template`).
- Soporte de japonés e inglés, según los metadatos del repositorio.
- Generación de aplicaciones de pocas centenas de líneas; el autor descarta explícitamente proyectos de 1.000 líneas o más.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento en la información proporcionada.

## Casos de uso

- Prototipado rápido de aplicaciones web de un solo archivo: el adaptador genera directamente HTML/CSS/JS autocontenido para utilidades como listas de tareas o temporizadores, lo que permite obtener un prototipo funcional en una sola generación sin montar un pipeline de frontend.
- Generación de minijuegos educativos: dados los ejemplos del conjunto de entrenamiento (juegos simples), el modelo es adecuado para producir demos jugables de pocas líneas que se ejecutan en el navegador sin dependencias externas.
- Herramientas internas de productividad: conversores de unidades, blocs de notas o cronómetros para uso interno, donde el requisito es un artefacto único y verificable manualmente en lugar de una aplicación mantenible a largo plazo.
- Material didáctico de programación web: el modelo puede generar ejemplos de código comentados y ejecutables para talleres o cursos introductorios de HTML/CSS/JS.
- Arnés de evaluación de generación de código: el enfoque del autor (verificación automática en navegador sobre tareas con contrato explícito) es reutilizable como plantilla para evaluar modelos de generación de frontend en dominios acotados.
- Experimentación con adaptadores LoRA: al ser un adaptador PEFT de configuración conocida (r=16, alpha=32) sobre un modelo Apache 2.0, sirve como caso de estudio para reproducir el flujo de ajuste con conjuntos de datos pequeños y curación por verificación.
- Asistencia en japonés para código frontend: para equipos que redactan especificaciones en japonés, el adaptador declara soporte de ese idioma, lo que permite prompts en japonés sobre tareas de generación web.

## Benchmarks y rendimiento

El autor reporta un benchmark propio de 10 tareas de generación de aplicaciones web, con verificación externa ejecutando la aplicación generada en un navegador. No son resultados de benchmarks públicos.

| Condicion | Resultado | Notas |
|---|---|---|
| Arnes original | 9/10 tareas superadas | Verificacion ejecutando la app en navegador |
| Arnes mejorado | 10/10 equivalentes | El verificador lee el `value` de los ``; el contrato de la tarea se explicita en el prompt; la tarea de calculadora restante se supera en la ronda de correccion 4 |
| Caveat del autor | El codigo de la calculadora aprobada no incluia boton "0" | La comprobacion no pulsaba 0, por lo que ese caso quedo sin verificar |

No se han publicado resultados de benchmarks publicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-Coder-7B-Instruct. En precisión completa (fp16/bf16) se requieren aproximadamente 14-16 GB solo para pesos, más overhead de activaciones y caché KV; el adaptador añade una cantidad marginal.
- En cuantización de 8 bits, el modelo base ronda los 7-8 GB de VRAM; en 4 bits, aproximadamente 4-5 GB. Estas cifras son estimaciones de orden de magnitud para un modelo denso de 7.000 millones de parámetros y no están declaradas en la model card.
- GPU recomendadas: A100 o H100 para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 sin cuantizar con margen; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 u 8 bits en tarjetas de 8-12 GB o superiores, siempre que se cargue el modelo base cuantizado y se aplique el adaptador PEFT compatible.
- Opciones de despliegue: el flujo documentado usa `transformers` + `peft` (`PeftModel.from_pretrained`). No se documenta compatibilidad específica con vLLM, llama.cpp, Ollama o TGI en la información proporcionada; la integración con esos motores requeriría fusionar el adaptador con el modelo base y convertirlo al formato correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cube Code (este) | 7.000 M (base) + LoRA r=16 | no disponible | Generacion de apps web de un solo archivo | Apache 2.0 | Adaptador PEFT en Hugging Face, 0 descargas |
| Qwen2.5-Coder-7B-Instruct | 7.000 M | no disponible en esta ficha | Generacion de codigo general | Apache 2.0 | Modelo base oficial de Qwen |
| Alternativas de generacion de codigo de ~7B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: Cube Code es un ajuste especializado que restringe el alcance a aplicaciones web pequeñas y añade datos de entrenamiento verificados, a costa de un conjunto de entrenamiento muy reducido (106 ejemplos) y de un benchmark propio no reproducible de forma independiente. No se dispone de datos comparativos con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: el autor indica explícitamente que no está diseñado para proyectos de 1.000 líneas o más; su uso fuera de aplicaciones web pequeñas de un solo archivo no está validado.
- Conjunto de entrenamiento mínimo (106 ejemplos), lo que limita la generalización y aumenta el riesgo de sobreajuste a los patrones concretos del arnés de verificación del autor.
- Benchmark propio no reproducible de forma independiente: 10 tareas, verificación casera y un caso aprobado (la calculadora) que no incluía botón "0" y por tanto pasó sin cubrir ese caso de uso.
- Riesgo de alucinación de APIs, selectores o comportamientos del navegador no presentes en los ejemplos de entrenamiento; el código generado debe revisarse y ejecutarse antes de usarse.
- Idiomas declarados limitados a japonés e inglés; no se garantiza un comportamiento equivalente en castellano.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial tanto del adaptador como del modelo base, pero el adaptador se distribuye sin garantías y con cero adopción registrada (0 descargas, 0 valoraciones), por lo que no hay evidencia de uso en producción.
- Para producción sería necesario fusionar el adaptador con el modelo base, validar el comportamiento en el dominio objetivo y establecer un proceso de revisión de código generado.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/FMA03/cube-code
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería Transformers: https://github.com/huggingface/transformers
