# mozilla-ai/dcarpintero-pangolin-guard-base-encoderfile

## Resumen

`mozilla-ai/dcarpintero-pangolin-guard-base-encoderfile` es un ejecutable autocontenido (encoderfile) que empaqueta el modelo `dcarpintero/pangolin-guard-base`, un clasificador de seguridad basado en ModernBERT-base. Este modelo resuelve el problema de detectar intentos de prompt injection y jailbreak en entradas de texto, actuando como un guardrail ligero y autoalojado para sistemas de IA generativa. El encoderfile, generado con la herramienta Encoderfile de Mozilla.ai, elimina la necesidad de instalar Python o dependencias de machine learning, permitiendo ejecutar el modelo como un binario independiente en múltiples plataformas.

El modelo base es un clasificador de dos clases (seguro/inseguro) entrenado específicamente para identificar ataques de inyección de prompts y técnicas de jailbreak. Su relevancia actual radica en la creciente necesidad de proteger aplicaciones basadas en LLMs frente a entradas maliciosas, ofreciendo una solución ligera y de fácil despliegue. Aunque no se especifican el número exacto de parámetros ni la longitud de contexto, al estar basado en ModernBERT-base se espera un contexto de hasta 8192 tokens y una arquitectura de encoder transformer eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probablemente 8192, segun ModernBERT-base) |
| Tipos de cuantizacion | no disponible (binario autocontenido) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (modelo base) |
| Formato de pesos | ejecutable autocontenido (encoderfile) |

## Arquitectura y entrenamiento

El modelo base `pangolin-guard-base` es un clasificador de secuencias basado en ModernBERT-base, un encoder transformer optimizado para eficiencia y velocidad. Se trata de un modelo de clasificación binaria que asigna una etiqueta "unsafe" a entradas que contienen intentos de prompt injection o jailbreak. El entrenamiento se centra en datos de seguridad de prompts, y se evalúa en benchmarks especializados como NotInject (para medir over-defense) y BIPIA (para medir intentos de invasión de privacidad). No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

El encoderfile empaqueta el modelo junto con su runtime en un único binario, lo que permite ejecutarlo sin Python ni dependencias adicionales. Esto se logra mediante la herramienta Encoderfile de Mozilla.ai, que compila el modelo y su infraestructura de inferencia en un ejecutable nativo para cada plataforma.

## Capacidades

- Clasificación de texto binaria: detecta si una entrada es un intento de prompt injection o jailbreak (clase "unsafe").
- Ejecución como servidor de embeddings: el binario puede lanzarse en modo `serve` para ofrecer inferencia a través de una API.
- Inferencia directa desde CLI: permite evaluar frases individuales con el comando `infer`.
- Autocontenido: no requiere Python, pip ni ninguna librería de ML; solo descargar y ejecutar.
- Multiplataforma: binarios disponibles para macOS (Apple Silicon e Intel) y Linux (x86_64 y ARM64).
- Ligero y autoalojado: pensado para entornos donde se necesita un guardrail sin infraestructura pesada.

## Casos de uso

- Guardrail de seguridad en aplicaciones LLM: integrar el binario como filtro previo a las llamadas a un modelo generativo, rechazando entradas clasificadas como "unsafe" antes de que lleguen al LLM.
- Moderación de contenido en chatbots: usar el clasificador para bloquear intentos de manipulación del sistema, como instrucciones ocultas o técnicas de jailbreak.
- Protección de agentes autónomos: en pipelines de agentes que procesan entradas externas, el modelo puede validar cada paso antes de que el agente ejecute acciones.
- Filtrado de prompts en APIs de generación: desplegar el encoderfile como un servicio intermedio que analiza las peticiones y devuelve un veredicto de seguridad.
- Evaluación de robustez de sistemas: utilizar el modelo en entornos de testing para comprobar si una aplicación resiste ataques de prompt injection.
- Despliegue en entornos sin Python: en infraestructuras donde no se permite instalar dependencias, el binario autocontenido ofrece una solución inmediata.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GitHub del modelo base menciona evaluaciones en los conjuntos NotInject y BIPIA, pero no se proporcionan cifras concretas. Se recomienda consultar el repositorio original para obtener datos actualizados.

## Requisitos de hardware

- Al ser un clasificador basado en ModernBERT-base, el modelo es relativamente ligero y puede ejecutarse en CPU sin necesidad de GPU.
- No se especifican requisitos mínimos de VRAM ni de memoria RAM en la documentación disponible.
- El binario está compilado para arquitecturas específicas (x86_64, ARM64), por lo que debe elegirse la versión adecuada para cada sistema.
- Opciones de despliegue: ejecución directa como proceso independiente, integración en contenedores Docker, o uso como servicio local.
- Latencia y throughput: no se proporcionan datos estimados, pero al ser un encoder pequeño se espera una latencia baja en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de guardrail como Llama Guard o NeMo Guardrails. El modelo se distingue por su formato de distribución (encoderfile autocontenido) y su base ModernBERT, pero no hay datos públicos de rendimiento relativo.

## Limitaciones y advertencias

- Solo realiza clasificación de texto; no genera respuestas ni tiene capacidades generativas.
- Puede presentar falsos positivos (over-defense), es decir, rechazar entradas benignas que contengan palabras típicas de ataques, como se evalúa en el benchmark NotInject.
- El idioma de entrenamiento no está especificado; probablemente esté optimizado para inglés, por lo que su rendimiento en otros idiomas puede ser inferior.
- La licencia del encoderfile no está explícitamente indicada; se asume la del modelo base (apache-2.0), pero conviene verificar antes de uso comercial.
- Al ser un binario compilado, no es posible modificar el modelo ni ajustar sus pesos sin reentrenar desde el modelo base.
- No se garantiza la detección de todos los tipos de ataques; es una capa de seguridad complementaria, no un sustituto de otras medidas.

## Enlaces

- [HuggingFace - encoderfile](https://huggingface.co/mozilla-ai/dcarpintero-pangolin-guard-base-encoderfile)
- [HuggingFace - modelo base](https://huggingface.co/dcarpintero/pangolin-guard-base)
- [GitHub - pangolin-guard](https://github.com/dcarpintero/pangolin-guard)
- [Documentación de Mozilla.ai - Pangolin Guard](https://docs.mozilla.ai/any-guardrail/api-reference/index/pangolin)
- [Repositorio Encoderfile](https://github.com/mozilla-ai/encoderfile)
