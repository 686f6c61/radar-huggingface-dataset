# arfeen2006/Fine-tuning-model-on-finance-domain

## Resumen

El modelo `arfeen2006/Fine-tuning-model-on-finance-domain` es un adaptador LoRA y DPO publicado por el usuario arfeen2006 sobre el modelo base Qwen2.5-1.5B-Instruct, especializado en la ejecución autónoma de herramientas financieras, la validación de esquemas de API bancarias y la aplicación de guardarraíles frente a alucinaciones y manipulación de parámetros. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de alineación en dos etapas (SFT con LoRA seguido de DPO) sobre un transformer decoder-only de 1.500 millones de parámetros.

El problema que aborda es concreto: convertir un modelo de lenguaje generalista pequeño en un motor de invocación de herramientas (tool calling) fiable para dominios bancarios, donde la validez estructural del JSON y la precisión en la extracción de argumentos son críticas. La model card reporta mejoras sustanciales frente al modelo base en selección de herramienta (del 42 % al 98 %), validez de esquema JSON (del 68 % al 100 %) y tasa de rechazo fuera de dominio (del 20 % al 100 %).

Su relevancia radica en que demuestra que un modelo de 1,5B parámetros puede alcanzar fiabilidad operativa en una tarea estrecha mediante alineación por preferencias, abaratando el despliegue en producción. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador, no el modelo completo. La licencia es Apache 2.0 y el único idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA entrenado mediante SFT y alineado con DPO |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct, que soporta hasta 32.768 tokens, si bien este dato no se confirma en la model card del adaptador) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA; el modelo base debe cargarse por separado) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar y 1.500 millones de parámetros. El ajuste fino emplea PEFT con LoRA, de modo que solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, mientras que los pesos originales permanecen congelados. El proceso de alineación consta de dos etapas: primero un ajuste supervisado (SFT) con LoRA sobre ejemplos de invocación de herramientas bancarias, y después una optimización directa de preferencias (DPO) orientada explícitamente a penalizar alucinaciones y la inyección de parámetros no deseados en las llamadas a herramientas.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros de LoRA (rango, alpha, capas objetivo) o de DPO (beta, pares de preferencia). No se menciona el uso de RLHF adicional, decodificación especulativa ni mecanismos de atención lineal. La innovación técnica declarada es la combinación SFT + DPO aplicada específicamente a la fiabilidad estructural de tool calling en un dominio regulado como la banca.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (rol de sistema, usuario y asistente).
- Invocación de herramientas (tool calling / function calling) con salida en JSON crudo, pensada para ser parseada por un orquestador.
- Validación de esquemas de API bancarias: el modelo está alineado para producir JSON que cumple el esquema esperado (100 % de validez reportada tras DPO).
- Extracción de argumentos a partir de lenguaje natural (importes, números de cuenta, tipos de operación) con una precisión reportada del 96,5 %.
- Rechazo de peticiones fuera de dominio: tasa del 100 % reportada tras la alineación DPO.
- Razonamiento multi-paso limitado al encadenamiento de llamadas a herramientas dentro de un flujo bancario.
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Automatización de operaciones bancarias básicas: el modelo traduce instrucciones en lenguaje natural como "transfiere 250 dólares de la cuenta corriente ACC-101 a la cuenta de ahorro ACC-202" en una llamada JSON estructurada lista para ejecutar contra la API interna del banco, gracias a su precisión de extracción de argumentos del 96,5 %.
- Enrutamiento de intenciones en asistentes financieros: dado un mensaje de usuario, el adaptador selecciona la herramienta correcta entre un catálogo definido (consulta de saldo, transferencia, bloqueo de tarjeta) con una precisión reportada del 98 %.
- Guardarraíl de seguridad en pipelines de agentes: la tasa de rechazo fuera de dominio del 100 % permite usarlo como primera capa de filtrado que descarta peticiones no bancarias antes de llegar a sistemas con permisos de escritura.
- Validación previa de payloads en CI/CD: integrado como paso de verificación, el modelo puede generar y comprobar esquemas JSON de ejemplo para las definiciones de herramientas de un servicio, reduciendo errores de integración entre el equipo de backend y el de agentes.
- Atención al cliente con derivación automática: el modelo clasifica la consulta y emite la llamada a la herramienta adecuada (por ejemplo, consulta de estado de transferencia) o un rechazo controlado cuando la petición queda fuera del ámbito bancario.
- Prototipado rápido de agentes financieros en entornos de bajo presupuesto: al requerir solo 1,5B parámetros y un adaptador de 0,2 GB, puede desplegarse en una única GPU de consumo para pruebas de concepto antes de escalar a modelos mayores.
- Generación de datos sintéticos de entrenamiento: el adaptador puede producir pares instrucción-llamada válidos para aumentar el corpus de ajuste de otros modelos del mismo dominio.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados en la model card del propio autor, que comparan el modelo base sin ajuste, tras SFT con LoRA y tras la alineación DPO. No se aportan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica de evaluacion | Base zero-shot | Tras SFT LoRA | Tras DPO |
|---|---|---|---|
| Precision en seleccion de herramienta | 42,0 % | 94,0 % | 98,0 % |
| Validez de esquema JSON | 68,0 % | 98,0 % | 100,0 % |
| Precision en extraccion de argumentos | 54,0 % | 91,5 % | 96,5 % |
| Tasa de rechazo fuera de dominio | 20,0 % | 85,0 % | 100,0 % |

No se especifica el conjunto de evaluación, el tamaño de la muestra ni el procedimiento de medida, por lo que estos resultados deben interpretarse como indicativos y no como una validación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 3 GB; en cuantización de 8 bits, alrededor de 1,6 GB; en 4 bits, en torno a 1 GB. El adaptador LoRA añade una sobrecarga mínima (el repositorio completo ocupa 0,2 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16. Una RTX 3060, RTX 4060 o RTX 4090 son suficientes; para despliegue en servidor, una A100 o H100 no aportan ventaja significativa dado el tamaño del modelo, salvo por el throughput agregado en batching.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más de VRAM, e incluso en CPU con llama.cpp en cuantización 4 bits.
- Opciones de despliegue: transformers + PEFT (como muestra el quickstart de la model card), vLLM (previa fusión del adaptador con el modelo base), llama.cpp y Ollama (requieren exportar el modelo fusionado a GGUF), y TGI. El adaptador debe fusionarse o cargarse dinámicamente según el motor elegido.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de decodificación en el orden de decenas de milisegundos por token en GPU de consumo, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arfeen2006/Fine-tuning-model-on-finance-domain | 1,5B (base) + adaptador LoRA | No disponible (heredado del base) | Tool calling financiero con SFT + DPO | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (según documentación del modelo base) | Instrucción generalista | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 tokens (según documentación del modelo base) | Instrucción generalista | Apache 2.0 (Qwen Research para algunas variantes) | Hugging Face |
| arfeen2006/Fine-tuning-model-on-finance-domain (vs. base sin ajustar) | 1,5B | No disponible | Sin especialización en tool calling | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base: el adaptador mejora la precisión en selección de herramienta en 56 puntos porcentuales y la validez JSON en 32 puntos. Frente a modelos generalistas de mayor tamaño, no hay datos de benchmarks comunes que permitan una comparación directa. No se han identificado otros adaptadores públicos de tool calling financiero en la información disponible.

## Limitaciones y advertencias

- El modelo solo está declarado para inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Es un adaptador, no un modelo autónomo: requiere descargar y cargar el modelo base Qwen2.5-1.5B-Instruct por separado, lo que añade complejidad de despliegue y dependencia de la versión del base.
- Los benchmarks reportados proceden del propio autor y no se especifica el conjunto de evaluación ni el tamaño de la muestra; no han sido verificados de forma independiente.
- Riesgo de alucinación residual: aunque la model card reporta una tasa de rechazo fuera de dominio del 100 %, esta cifra se refiere a la evaluación interna del autor y no puede extrapolarse a distribuciones reales de producción.
- El modelo no incluye salvaguardas de seguridad más allá del rechazo fuera de dominio; las llamadas generadas deben validarse siempre contra el esquema real y los permisos del sistema antes de ejecutarse.
- Sesgos conocidos: no se documentan análisis de sesgo ni de equidad en la model card.
- Contexto: no se confirma en la model card la longitud de contexto efectiva tras el ajuste; si se hereda del base, sería de 32.768 tokens, pero el adaptador podría degradar el rendimiento en ventanas largas no vistas durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arfeen2006/Fine-tuning-model-on-finance-domain
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio GitHub del autor: https://github.com/asmohamedarfeen/Fine-tuning-model-on-finance-domain-
