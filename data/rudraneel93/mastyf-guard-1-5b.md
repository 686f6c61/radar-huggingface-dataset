# Rudraneel93/mastyf-guard-1.5b

## Resumen

Mastyf Guard 1.5B es un clasificador neuronal especializado en seguridad perimetral para agentes de IA autónomos y servidores Model Context Protocol (MCP). Desarrollado por Rudraneel Das (Rudraneel93), el modelo se presenta como una capa de defensa que inspecciona, intercepta y bloquea inyecciones indirectas de prompt, ejecución no autorizada de comandos shell y exfiltración de datos. Está construido como un fine-tune del modelo base Qwen/Qwen2.5-1.5B-Instruct, por lo que hereda su arquitectura transformer de 1.500 millones de parámetros, aunque su propósito no es la generación de texto general sino la clasificación binaria de llamadas a herramientas y acciones de agente.

El modelo se entrenó con 2.250.000 muestras sintéticas en formato ChatML, cubriendo siete vectores de ataque adversarial. Según la información publicada, alcanza una tasa de neutralización del 98,10% en el benchmark InjecAgent de UIUC Kang Lab, con una latencia media inferior a 25 ms en CPU de consumo y Apple Silicon, y por debajo de 3 ms con caché de proxy. Su relevancia actual radica en el crecimiento de agentes autónomos que ejecutan herramientas y comandos de forma automática, donde los controles de seguridad tradicionales no son suficientes. El modelo se distribuye bajo una licencia propietaria (mastyf-developer-license) con opciones comerciales para uso empresarial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | mastyf-developer-license (propietaria) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Mastyf Guard 1.5B parte del modelo Qwen2.5-1.5B-Instruct, un transformer denso con 1.500 millones de parámetros, y se ajusta mediante fine-tune supervisado para la tarea específica de clasificación de seguridad. El corpus de entrenamiento consiste en 2.250.000 muestras sintéticas en formato ChatML, diseñadas para cubrir siete vectores de ataque adversarial, entre los que se incluyen inyecciones de prompt indirectas, intentos de ejecución de shell y exfiltración de credenciales. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales. La salida del modelo es una estructura JSON con campos como `suspicious`, `confidence`, `category` y `reasoning`, lo que lo convierte en un clasificador determinista para integración en pipelines de seguridad.

## Capacidades

- Detección de inyecciones de prompt indirectas en llamadas a herramientas y comandos.
- Bloqueo de ejecución no autorizada de comandos shell (por ejemplo, `cat /etc/passwd`).
- Identificación de intentos de exfiltración de datos, incluyendo acceso a credenciales del sistema.
- Clasificación de acciones en categorías como `credential_exfil`, con nivel de confianza numérico.
- Integración con servidores MCP y agentes autónomos mediante salida JSON estructurada.
- Inferencia de baja latencia: <25 ms en CPU de consumo y Apple Silicon, <3 ms con caché de proxy.
- Funcionamiento como clasificador de seguridad, no como modelo generativo de texto.

## Casos de uso

- Protección de agentes autónomos en producción: el modelo se interpone entre el agente y sus herramientas, evaluando cada llamada antes de ejecutarla. Su salida JSON permite bloquear acciones sospechosas en tiempo real, con una latencia inferior a 25 ms que no degrada la experiencia del usuario.
- Seguridad perimetral para servidores MCP: al desplegarse como sidecar en Kubernetes o Docker, puede inspeccionar todas las peticiones entrantes y salientes del servidor MCP, rechazando aquellas que intenten manipular el agente o extraer datos sensibles.
- Filtrado de tool calls en pipelines de CI/CD: en entornos donde agentes de IA generan código o ejecutan comandos, el modelo puede validar cada invocación de herramienta, evitando que un prompt malicioso provoque la ejecución de comandos destructivos.
- Prevención de exfiltración de credenciales: ante intentos de lectura de archivos como `/etc/passwd` o variables de entorno con secretos, el clasificador devuelve una categoría específica (`credential_exfil`) y una confianza alta, permitiendo al sistema de orquestación abortar la operación.
- Auditoría de seguridad de agentes: el modelo puede registrar cada decisión de bloqueo con su razonamiento, generando trazas útiles para cumplimiento normativo o análisis forense posterior.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1.5B, puede ejecutarse en CPU de consumo o Apple Silicon sin necesidad de GPU, lo que lo hace adecuado para dispositivos edge o entornos de desarrollo local.

## Benchmarks y rendimiento

El modelo fue evaluado contra el benchmark InjecAgent de UIUC Kang Lab, que incluye 2.108 casos de ataque académico. Los resultados publicados son:

| Suite de ataque | Casos de prueba | Tasa de éxito de defensa | Latencia media |
| :--- | :--- | :--- | :--- |
| Direct Harm (casos base, ámbito CBAC) | 510 | 100,00% | 4,22 ms |
| Direct Harm (prompts de hacking mejorados) | 510 | 100,00% | 0,00 ms |
| Data Stealing (prompts de hacking mejorados) | 544 | 100,00% | 0,00 ms |
| Data Stealing (exfiltración base) | 544 | 92,65% | 5,17 ms |
| **Puntuación global InjecAgent** | **2.108** | **98,10%** | **2,35 ms** |

No se han publicado resultados en otros benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de razonamiento general.

## Requisitos de hardware

- Inferencia en CPU de consumo y Apple Silicon con latencia inferior a 25 ms (según el autor).
- Con caché de proxy, la latencia se reduce a menos de 3 ms.
- No se especifican requisitos de VRAM, pero al tratarse de un modelo de 1.500 millones de parámetros, es plausible que quepa en GPUs de consumo como RTX 3060 o superiores, aunque no hay datos oficiales.
- Opciones de despliegue: se menciona compatibilidad con Ollama mediante un Modelfile, y despliegue como sidecar en Kubernetes y Docker para la versión Enterprise.
- No se proporcionan cifras de throughput ni requisitos mínimos de memoria RAM.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros clasificadores de seguridad para agentes con los que se pueda establecer una comparación objetiva en cuanto a rendimiento, licencia o arquitectura.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés; no se ha entrenado para otros idiomas.
- Al estar entrenado exclusivamente con datos sintéticos, puede presentar sesgos o fallos ante ataques no representados en el corpus de entrenamiento.
- La licencia es propietaria (mastyf-developer-license). El uso comercial requiere la adquisición de un Developer Pass o la suscripción Enterprise Sidecar, lo que limita su adopción en proyectos de código abierto.
- No es un modelo de generación de texto; su salida se limita a clasificaciones JSON. Intentar usarlo como LLM general producirá resultados no deseados.
- No se especifica la longitud de contexto soportada, por lo que no se puede garantizar su comportamiento con entradas muy largas.
- La fecha de creación (agosto de 2026) y el número de descargas (0) sugieren que es un modelo muy reciente y aún no validado por la comunidad.
- No se detallan los siete vectores de ataque específicos cubiertos en el entrenamiento, lo que dificulta evaluar su cobertura ante amenazas emergentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rudraneel93/mastyf-guard-1.5b
- Repositorio GitHub de Mastyf.ai: https://github.com/mastyf-ai/mastyf.ai
- Sitio web oficial de Mastyf.ai: https://www.mastyf.ai/
- Perfil del autor en Hugging Face: https://huggingface.co/Rudraneel93
- Repositorio del autor en GitHub: https://github.com/rudraneel93
- Benchmark InjecAgent (UIUC Kang Lab): https://github.com/uiuc-kang-lab/InjecAgent
- Licencia del modelo: https://mastyf.ai/license
