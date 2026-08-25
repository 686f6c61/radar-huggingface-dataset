# ajvikram/emergency-vision-triage-2b-gguf

## Resumen

Emergency Scene Triage 2B es un ajuste fino QLoRA del modelo SmolVLM2-2.2B-Instruct de HuggingFace, desarrollado por ajvikram (Ajay Vikram Singh). Su función es convertir una descripción textual de una escena de emergencia en una evaluación estructurada en JSON con diez campos fijos, pensada como herramienta de apoyo a la decisión para despachadores profesionales. El modelo no acepta imágenes: es la segunda etapa de un pipeline en el que una foto se convierte primero en texto (por un VLM o un humano) y luego este texto se estructura en el formato de triaje.

El checkpoint se publica cuantizado en GGUF Q4_K_M (1,1 GB) para su ejecución en dispositivos edge, con un total de 1.812.563.968 parámetros. Está entrenado exclusivamente en inglés con 3.000 ejemplos sintéticos y requiere decodificación restringida (formato JSON) para producir salidas válidas. Su relevancia radica en ofrecer una solución ligera y desplegable en entornos con recursos limitados, aunque con limitaciones importantes documentadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SmolVLM2-2.2B-Instruct, solo backbone LLM) |
| Parametros totales | 1.812.563.968 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (secuencia de entrenamiento: 2048) |
| Tipos de cuantizacion | Q4_K_M (GGUF), F16 (intermedio) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte del backbone LLM de SmolVLM2-2.2B-Instruct, ignorando por completo el encoder de visión del modelo base. Se aplicó un ajuste fino con QLoRA en 4 bits NF4, con r=32, alpha=64, dropout=0,05 y todas las proyecciones lineales. El entrenamiento duró 5 épocas con una tasa de aprendizaje de 1e-4 y warmup ratio 0,1, sobre 3.000 ejemplos sintéticos (2.400 de entrenamiento, 300 de validación, 300 de prueba) con longitud de secuencia 2048. Las pérdidas finales fueron 0,545 (train) y 0,612 (eval). El hardware utilizado fue una NVIDIA GB10 (DGX Spark) con unas 3,5 horas de cómputo. Se probaron dos rondas de GRPO con recompensas basadas en reglas para corregir defectos de formato, pero ninguna superó al checkpoint SFT publicado, por lo que se descartaron.

## Capacidades

- Generacion de JSON estructurado de triaje de emergencias a partir de descripciones de texto.
- Salida con 10 campos fijos: scene_type, severity_estimate, visible_injuries, hazards_present, people_count, scene_description, environment, recommended_resources, immediate_actions y accessibility.
- Soporte de enums fijos para scene_type y severity_estimate.
- Capacidad de generar listas de lesiones, peligros, recursos recomendados y acciones inmediatas.
- No soporta tool calling ni agentes.
- No acepta imagenes: solo texto.
- Unicamente en ingles.

## Casos de uso

- Apoyo a despachadores de emergencias: un operador recibe una llamada, escribe la descripcion de la escena y el modelo devuelve un JSON con severidad, recursos y acciones recomendadas, ayudando a priorizar el envio de ambulancias o bomberos.
- Integracion en sistemas de respuesta en dispositivos moviles: al pesar solo 1,1 GB en Q4_K_M, puede ejecutarse en un telefono o tablet sin conexion, permitiendo a personal de campo estructurar informes en zonas sin cobertura.
- Automatizacion de informes de incidentes: en un centro de control, las descripciones de los agentes se pasan por el modelo para generar registros estandarizados que alimenten bases de datos o dashboards.
- Entrenamiento de personal: se pueden generar escenarios sinteticos de triaje para practicar la toma de decisiones, usando el modelo como generador de casos estructurados.
- Pipeline de vision a texto: un VLM (como SmolVLM2 completo) convierte una foto en descripcion textual, y este modelo la estructura en JSON, permitiendo un sistema de triaje visual de dos etapas donde cada parte es depurable por separado.
- Analisis de datos historicos: descripciones antiguas de incidentes se normalizan a JSON para estudios estadisticos o entrenamiento de otros modelos.
- Asistencia remota en telemedicina: un medico o paramedico en el lugar describe la escena y recibe una lista de recursos y acciones sugeridas, aunque siempre bajo supervision humana.

## Benchmarks y rendimiento

La model card incluye una evaluacion sobre 7 escenarios held-out (accidente de vehiculo, colapso de puente, incendio industrial, paro cardiaco, rescate por inundacion, derrame HAZMAT y rescate en zona salvaje). Los resultados se presentan comparando el modelo crudo frente al uso del wrapper de inferencia incluido en el repositorio:

| Metrica | Modelo crudo | Con wrapper |
|---|---|---|
| JSON parseable (con format json) | 7/7 | 7/7 |
| JSON parseable (sin format json) | 0/5 | n/a |
| severity_estimate correcto | 7/7 | 7/7 |
| scene_type correcto | 5/7 | 7/7 |
| Los 10 campos presentes | 6/7 | 7/7 |
| Strings sin markdown | 5/7 | 7/7 |
| Todas las comprobaciones | 4/7 | 7/7 |

El autor advierte que el tamaño muestral es pequeno y que estos numeros no constituyen una validacion de seguridad ni una precision estadisticamente significativa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para la cuantizacion Q4_K_M, mas overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) o incluso CPU con llama.cpp.
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas.
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp con GBNF grammar, o el wrapper Python `inference_vision.py` incluido en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos. El autor mantiene un modelo similar, `ajvikram/emergency-triage-4b-gguf`, presumiblemente de 4B de parametros, pero no se proporcionan especificaciones ni resultados. Tampoco hay comparaciones con otros modelos de triaje o generacion de JSON estructurado. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Requiere decodificacion restringida (Ollama `format: "json"` o GBNF grammar en llama.cpp) para producir JSON valido; sin ella, el 100% de las salidas fallan al parsear.
- Fuga de markdown: aparecen asteriscos dentro de los valores string en aproximadamente el 40% de las generaciones, herencia del preentrenamiento del modelo base.
- Truncamiento de enums: a veces emite `WILDERNESS` en lugar de `WILDERNESS_RESCUE`.
- El campo `accessibility` es inconsistente: puede faltar o variar su estructura entre ejecuciones.
- Solo ingles y entrenado con datos sinteticos; no validado con datos reales de despacho, fotografias reales ni estandares profesionales de triaje.
- No acepta imagenes a pesar del nombre "vision" en el identificador.
- No es un sistema autonomo de triaje: es una herramienta de apoyo a la decision humana.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de seguridad o exactitud medica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajvikram/emergency-vision-triage-2b-gguf
- Modelo base SmolVLM2-2.2B-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Perfil del autor: https://huggingface.co/ajvikram
- Modelo similar del autor (4B): https://huggingface.co/ajvikram/emergency-triage-4b-gguf
